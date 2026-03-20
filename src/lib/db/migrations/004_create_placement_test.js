import postgres from 'postgres';

const connectionString = 'postgresql://postgres.tparggihcnplbonnstud:0Dranoel1203%23%23@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

const sql = postgres(connectionString);

async function main() {
    console.log('Creating placement_questions table...');

    await sql`
        CREATE TABLE IF NOT EXISTS public.placement_questions (
            id serial PRIMARY KEY,
            question text NOT NULL,
            options text[] NOT NULL,
            correct_answer text NOT NULL,
            explanation text,
            level text NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
            category text DEFAULT 'general',
            created_at timestamp with time zone DEFAULT NOW()
        )
    `;
    console.log('Table created successfully');

    console.log('Inserting placement test questions...');

    const questions = [
        // Beginner questions
        {
            question: "What is the correct translation for 'Hello'?",
            options: ["Hola", "Hello", "Ciao", "Bonjour"],
            correct_answer: "Hello",
            explanation: "'Hello' is the standard greeting in English.",
            level: "beginner"
        },
        {
            question: "Complete: 'I _____ a student.'",
            options: ["am", "is", "are", "be"],
            correct_answer: "am",
            explanation: "With 'I', we use 'am'.",
            level: "beginner"
        },
        {
            question: "Which word means 'the opposite of dark'?",
            options: ["Light", "Heavy", "Big", "Small"],
            correct_answer: "Light",
            explanation: "Light is the opposite of dark.",
            level: "beginner"
        },
        {
            question: "What is 'water' in English?",
            options: ["Fire", "Water", "Earth", "Air"],
            correct_answer: "Water",
            explanation: "Water is the same in English.",
            level: "beginner"
        },
        {
            question: "Complete: 'She _____ coffee every morning.'",
            options: ["drink", "drinks", "drinking", "drank"],
            correct_answer: "drinks",
            explanation: "With he/she/it, we add 's' to the verb.",
            level: "beginner"
        },
        // Intermediate questions
        {
            question: "Choose the correct sentence:",
            options: ["She don't like coffee", "She doesn't likes coffee", "She doesn't like coffee", "She not like coffee"],
            correct_answer: "She doesn't like coffee",
            explanation: "Third person singular uses 'doesn't' + base verb.",
            level: "intermediate"
        },
        {
            question: "What is the past tense of 'go'?",
            options: ["goes", "going", "went", "gone"],
            correct_answer: "went",
            explanation: "'Go' is an irregular verb. Past tense is 'went'.",
            level: "intermediate"
        },
        {
            question: "Complete: 'If I _____ rich, I would travel.'",
            options: ["am", "was", "were", "be"],
            correct_answer: "were",
            explanation: "In conditional sentences, we use 'were' for unreal conditions.",
            level: "intermediate"
        },
        {
            question: "Which sentence is correct?",
            options: ["I have gone to the store yesterday", "I went to the store yesterday", "I going to the store yesterday", "I go to the store yesterday"],
            correct_answer: "I went to the store yesterday",
            explanation: "Use past simple for completed actions in the past.",
            level: "intermediate"
        },
        {
            question: "Choose the correct word: 'The weather is _____ today.'",
            options: ["good", "well", "better", "best"],
            correct_answer: "good",
            explanation: "'Good' is an adjective, used here to describe the weather.",
            level: "intermediate"
        },
        // Advanced questions
        {
            question: "Choose the correct advanced sentence:",
            options: ["Although he was tired, but he continued", "Although he was tired, he continued", "Despite he was tired, he continued", "In spite he was tired, he continued"],
            correct_answer: "Although he was tired, he continued",
            explanation: "'Although' doesn't need 'but'. It's a conjunction.",
            level: "advanced"
        },
        {
            question: "What is the correct form? 'By the time we _____ arrived, the movie _____ started.'",
            options: ["had / has", "have / had", "had / had", "will / has"],
            correct_answer: "had / had",
            explanation: "Past perfect 'had arrived' + past perfect 'had started'.",
            level: "advanced"
        },
        {
            question: "Choose the correct conditional: 'If I _____ known about the problem, I would have fixed it.'",
            options: ["have", "had", "would have", "will"],
            correct_answer: "had",
            explanation: "Third conditional uses past perfect in the if-clause.",
            level: "advanced"
        },
        {
            question: "Which sentence uses the passive voice correctly?",
            options: ["They gave him a prize", "A prize was given to him", "He was given a prize by them", "Giving him a prize"],
            correct_answer: "A prize was given to him",
            explanation: "Passive voice: subject + form of 'be' + past participle.",
            level: "advanced"
        },
        {
            question: "Complete: 'She acts as if she _____ the owner.'",
            options: ["is", "was", "were", "be"],
            correct_answer: "were",
            explanation: "Subjunctive 'were' is used after 'as if' for unreal conditions.",
            level: "advanced"
        }
    ];

    for (const q of questions) {
        await sql`
            INSERT INTO public.placement_questions (question, options, correct_answer, explanation, level)
            VALUES (${q.question}, ${q.options}, ${q.correct_answer}, ${q.explanation}, ${q.level})
        `;
    }
    console.log('Questions inserted successfully');

    await sql.end();
}

main().catch(console.error);