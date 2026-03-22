import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

// ─── Config ───────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface MultipleChoiceExercise {
  id: string;
  type: "multiple_choice";
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface FillInBlankExercise {
  id: string;
  type: "fill_in_blank";
  question: string;
  correctAnswer: string;
  explanation: string;
}

interface DragAndDropExercise {
  id: string;
  type: "drag_and_drop";
  question: string;
  words: string[];
  correctAnswer: string;
}

type Exercise = MultipleChoiceExercise | FillInBlankExercise | DragAndDropExercise;

interface Lesson {
  id: number;
  title: string;
  level: string;
  category: string;
  exercises: Exercise[];
}

// ─── Args ─────────────────────────────────────────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2);
  let lessonId: number | null = null;
  let count = 10;
  const all = args.includes("--all");

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--lesson" && args[i + 1]) lessonId = parseInt(args[i + 1]);
    if (args[i].startsWith("--lesson=")) lessonId = parseInt(args[i].split("=")[1]);
    if (args[i] === "--count" && args[i + 1]) count = parseInt(args[i + 1]);
    if (args[i].startsWith("--count=")) count = parseInt(args[i].split("=")[1]);
  }

  return { lessonId, count, all };
}

// ─── Prompt ───────────────────────────────────────────────────────────────────
function buildPrompt(lesson: Lesson, count: number, existingIds: string[]): string {
  const perType = Math.ceil(count / 3);
  const levelLabel =
    lesson.level === "beginner"
      ? "A1/A2 - frases simples, vocabulário básico"
      : lesson.level === "intermediate"
      ? "B1 - frases completas, gramática intermediária"
      : "B2/C1 - estruturas complexas, expressões idiomáticas";

  return `You are an English teacher creating exercises for Brazilian students.

Lesson topic: "${lesson.title}"
Level: ${lesson.level} (${levelLabel})
Category: ${lesson.category}

Create exactly ${count} NEW exercises about "${lesson.title}".
Aim for roughly: ${perType} multiple_choice, ${perType} fill_in_blank, ${perType} drag_and_drop.

RULES:
- Questions and explanations must be in Portuguese (pt-BR)
- English answers and words must be correct English
- Difficulty must match the level above
- Each exercise must be directly related to the lesson topic
- Generate unique IDs using format: "gen-${lesson.id}-XXXXXX" where X is random alphanumeric
- Do NOT use any of these existing IDs: ${existingIds.slice(0, 20).join(", ")}

Return ONLY a valid JSON array. No markdown, no explanation, no extra text.

Format exactly like this:
[
  {
    "id": "gen-${lesson.id}-a1b2c3",
    "type": "multiple_choice",
    "question": "Como se diz '...' em inglês?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Explicação em português..."
  },
  {
    "id": "gen-${lesson.id}-d4e5f6",
    "type": "fill_in_blank",
    "question": "Complete a frase: 'I _____ to school every day.'",
    "correctAnswer": "go",
    "explanation": "Usamos 'go' com o Present Simple..."
  },
  {
    "id": "gen-${lesson.id}-g7h8i9",
    "type": "drag_and_drop",
    "question": "Monte a frase em inglês: 'Eu gosto de café'",
    "words": ["coffee.", "like", "I"],
    "correctAnswer": "I like coffee."
  }
]`;
}

// ─── Generate ─────────────────────────────────────────────────────────────────
async function generateExercises(lesson: Lesson, count: number): Promise<Exercise[]> {
  const existingIds = (lesson.exercises || []).map((e) => e.id);

  console.log(`  🤖 Chamando Claude Haiku... (${count} exercícios)`);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: buildPrompt(lesson, count, existingIds),
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const clean = text.replace(/```json|```/g, "").trim();
  const exercises: Exercise[] = JSON.parse(clean);

  for (const ex of exercises) {
    if (!ex.id || !ex.type || !ex.question) {
      throw new Error(`Exercício com estrutura inválida: ${JSON.stringify(ex)}`);
    }
  }

  return exercises;
}

// ─── Update Supabase ──────────────────────────────────────────────────────────
async function updateLesson(
  lessonId: number,
  newExercises: Exercise[],
  existingExercises: Exercise[]
): Promise<number> {
  const merged = [...existingExercises, ...newExercises];

  const { error } = await supabase
    .from("lessons")
    .update({ exercises: merged })
    .eq("id", lessonId);

  if (error) throw new Error(`Supabase error: ${error.message}`);

  return merged.length;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const { lessonId, count, all } = parseArgs();

  if (!lessonId && !all) {
    console.log(`
Uso:
  npx ts-node generate-exercises.ts --lesson 1 --count 20
  npx ts-node generate-exercises.ts --all --count 10

Flags:
  --lesson [id]   ID da lição específica
  --all           Gera para todas as lições
  --count [n]     Quantidade de exercícios por lição (default: 10)
    `);
    process.exit(0);
  }

  let query = supabase.from("lessons").select("id, title, level, category, exercises");
  if (lessonId) query = query.eq("id", lessonId);

  const { data: lessons, error } = await query;
  if (error) throw new Error(`Erro ao buscar lições: ${error.message}`);
  if (!lessons || lessons.length === 0) {
    console.log("❌ Nenhuma lição encontrada.");
    process.exit(1);
  }

  console.log(`\n🚀 Gerando exercícios para ${lessons.length} lição(ões)...\n`);

  for (const lesson of lessons) {
    console.log(`📚 Lição ${lesson.id}: "${lesson.title}" [${lesson.level}]`);
    console.log(`   Exercícios atuais: ${(lesson.exercises || []).length}`);

    try {
      const newExercises = await generateExercises(lesson as Lesson, count);
      const total = await updateLesson(lesson.id, newExercises, lesson.exercises || []);
      console.log(`   ✅ +${newExercises.length} novos → total agora: ${total}\n`);
    } catch (err) {
      console.error(`   ❌ Erro na lição ${lesson.id}:`, err);
    }

    if (lessons.length > 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  console.log("✅ Tudo concluído!");
}

main().catch((err) => {
  console.error("❌ Erro fatal:", err);
  process.exit(1);
});
