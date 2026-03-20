# SpeakApp — Relatório Técnico Completo

> Gerado em: Março 2026  
> Versão: MVP com Exercícios Escritos + Tutor de Voz IA  
> Stack: React + Vite (PWA) · Express 5 · PostgreSQL · Drizzle ORM · OpenAI

---

## Índice

1. [Arquitetura Geral](#1-arquitetura-geral)
2. [Banco de Dados — Tabelas e Schemas](#2-banco-de-dados--tabelas-e-schemas)
3. [API REST — Rotas e Funções](#3-api-rest--rotas-e-funções)
4. [Integração com IA — OpenAI](#4-integração-com-ia--openai)
5. [Frontend — Páginas e Componentes](#5-frontend--páginas-e-componentes)
6. [Sistema de Exercícios Escritos](#6-sistema-de-exercícios-escritos)
7. [Fluxo de Voz (STT + TTS)](#7-fluxo-de-voz-stt--tts)
8. [Vocabulário e Dicionário de Maestria](#8-vocabulário-e-dicionário-de-maestria)
9. [Gamificação e Progresso](#9-gamificação-e-progresso)
10. [Dependências por Pacote](#10-dependências-por-pacote)
11. [Estrutura de Arquivos Completa](#11-estrutura-de-arquivos-completa)
12. [Contratos OpenAPI](#12-contratos-openapi)

---

## 1. Arquitetura Geral

### Monorepo pnpm — visão macro

```
workspace/
├── artifacts/
│   ├── api-server/                  ← Backend Express 5 (porta 8080)
│   └── speak-app/                   ← Frontend React PWA (porta 21021)
├── lib/
│   ├── api-spec/                    ← openapi.yaml (fonte de verdade da API)
│   ├── api-client-react/            ← Hooks React Query GERADOS via Orval
│   ├── api-zod/                     ← Schemas Zod GERADOS via Orval
│   ├── db/                          ← Drizzle ORM + schema PostgreSQL
│   ├── integrations-openai-ai-server/  ← SDK OpenAI (TTS/STT/Chat) — server side
│   └── integrations-openai-ai-react/   ← Hooks React para voice stream — client side
└── scripts/
    └── src/seed-lessons.ts          ← Popula banco com 8 lições
```

### Fluxo de requisição

```
Usuário (mobile browser / PWA)
      │
      ▼
React PWA  (speak-app, porta 21021 → proxy em /)
      │  fetch via hooks gerados (@workspace/api-client-react)
      ▼
Replit Proxy  (localhost:80)
      │  rota /api/*
      ▼
Express API  (porta 8080)
      │  Drizzle ORM
      ▼
PostgreSQL  (DATABASE_URL — Replit managed)
      │  para IA
      ▼
OpenAI via Replit AI Integration
  ├── gpt-5-mini           → Análise e correção de texto / chat
  ├── gpt-4o-mini-transcribe → STT: áudio → texto
  └── gpt-audio (nova)     → TTS: texto → áudio mp3
```

### Codegen de API (contrato único)

```bash
# Após editar lib/api-spec/openapi.yaml:
pnpm --filter @workspace/api-spec run codegen
# Gera automaticamente:
# lib/api-client-react/src/generated/api.ts  → hooks React Query
# lib/api-zod/src/generated/api.ts           → schemas Zod
```

---

## 2. Banco de Dados — Tabelas e Schemas

**ORM:** Drizzle ORM  
**Banco:** PostgreSQL (Replit managed, `DATABASE_URL`)

---

### Tabela: `lessons`
**Arquivo:** `lib/db/src/schema/lessons.ts`

| Coluna | Tipo | Padrão | Descrição |
|--------|------|--------|-----------|
| `id` | serial PK | — | ID auto-incrementado |
| `title` | text NOT NULL | — | Título da lição |
| `description` | text NOT NULL | — | Descrição curta |
| `level` | enum | — | `beginner` / `intermediate` / `advanced` |
| `category` | enum | — | `vocabulary` / `grammar` / `listening` / `reading` / `speaking` |
| `xp_reward` | integer | 50 | XP concedido ao completar |
| `duration_minutes` | integer | 10 | Duração estimada |
| `is_locked` | boolean | false | Bloqueia acesso |
| `order` | integer | 0 | Ordem no mapa de lições |
| `icon` | text | 📚 | Emoji do ícone |
| `exercises` | jsonb | `[]` | Array de exercícios (3 tipos) |
| `vocabulary` | jsonb | `[]` | Array de vocabulário da lição |

**Enums PostgreSQL criados:**
```typescript
export const levelEnum    = pgEnum("level",    ["beginner","intermediate","advanced"]);
export const categoryEnum = pgEnum("category", ["vocabulary","grammar","listening","reading","speaking"]);
```

**Estrutura de exercício (jsonb) — 3 tipos suportados:**

```json
// Tipo 1: Multiple Choice
{
  "id": "mc1",
  "type": "multiple_choice",
  "question": "How do you say 'Olá' in English?",
  "options": ["Hello", "Bye", "Thanks", "Sorry"],
  "correctAnswer": "Hello",
  "explanation": "'Hello' is the most common greeting."
}

// Tipo 2: Fill in the Blank
{
  "id": "fib1",
  "type": "fill_in_blank",
  "question": "Complete: 'She _____ to work every day.' (verbo go conjugado)",
  "correctAnswer": "goes",
  "explanation": "Com he/she/it, adicionamos 's' ao verbo."
}

// Tipo 3: Drag and Drop (montar frase)
{
  "id": "dd1",
  "type": "drag_and_drop",
  "question": "Build the sentence: 'Good morning, how are you?'",
  "words": ["morning,", "Good", "you?", "are", "how"],
  "correctAnswer": "Good morning, how are you?"
}
```

**Estrutura de vocabulário (jsonb):**
```json
{
  "word": "Hello",
  "translation": "Olá",
  "phonetic": "/həˈloʊ/",
  "example": "Hello, how are you?"
}
```

---

### Tabela: `user_progress`
**Arquivo:** `lib/db/src/schema/progress.ts`

| Coluna | Tipo | Padrão | Descrição |
|--------|------|--------|-----------|
| `id` | serial PK | — | ID |
| `user_id` | text | `"guest"` | ID do usuário (sem auth no MVP) |
| `total_xp` | integer | 0 | XP acumulado total |
| `current_streak` | integer | 0 | Streak atual em dias |
| `longest_streak` | integer | 0 | Maior streak já atingido |
| `level` | integer | 1 | Nível: `floor(totalXp / 500) + 1` |
| `completed_lessons` | integer | 0 | Total de lições concluídas |
| `daily_goal_minutes` | integer | 15 | Meta diária em minutos |
| `today_minutes` | integer | 0 | Minutos estudados hoje |
| `weekly_xp` | jsonb | `[0,0,0,0,0,0,0]` | XP por dia (Dom=0 … Sáb=6) |
| `achievements` | jsonb | `[]` | Conquistas desbloqueadas |
| `last_activity_at` | timestamp | now() | Última atividade |
| `created_at` | timestamp | now() | Criação do registro |

---

### Tabela: `completed_lessons`
**Arquivo:** `lib/db/src/schema/progress.ts`

| Coluna | Tipo | Padrão | Descrição |
|--------|------|--------|-----------|
| `id` | serial PK | — | ID |
| `user_id` | text | `"guest"` | ID do usuário |
| `lesson_id` | integer | — | FK → `lessons.id` |
| `completed_at` | timestamp | now() | Quando foi completada |
| `xp_earned` | integer | 0 | XP ganho nessa conclusão |
| `minutes_spent` | integer | 0 | Tempo gasto |

---

### Tabela: `mastery_vocabulary`
**Arquivo:** `lib/db/src/schema/vocabulary.ts`

| Coluna | Tipo | Padrão | Descrição |
|--------|------|--------|-----------|
| `id` | serial PK | — | ID |
| `user_id` | text | `"guest"` | ID do usuário |
| `word` | text NOT NULL | — | Palavra em inglês |
| `translation` | text NOT NULL | — | Tradução |
| `phonetic` | text nullable | — | Pronúncia fonética |
| `example` | text nullable | — | Frase de exemplo |
| `context` | text nullable | — | Origem: `"Lesson: Nome"` ou `"Conversation"` |
| `mastery_level` | integer | 0 | Nível 0–4 (New → Fluent) |
| `created_at` | timestamp | now() | Data de adição |

**Níveis de maestria:**
| Nível | Label | Cor |
|-------|-------|-----|
| 0 | New | Branco/cinza |
| 1 | Familiar | Azul |
| 2 | Learning | Amarelo |
| 3 | Practiced | Laranja |
| 4 | Fluent | Verde |

---

### Tabela: `conversations`
**Arquivo:** `lib/db/src/schema/conversations.ts` *(gerado pelo template OpenAI)*

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | serial PK | ID da conversa |
| `user_id` | text | ID do usuário |
| `title` | text | Título da conversa |
| `created_at` | timestamp | Data de criação |

---

### Tabela: `messages`
**Arquivo:** `lib/db/src/schema/messages.ts` *(gerado pelo template OpenAI)*

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | serial PK | ID da mensagem |
| `conversation_id` | integer | FK → conversations.id |
| `role` | enum | `"user"` / `"assistant"` / `"system"` |
| `content` | text | Conteúdo da mensagem |
| `created_at` | timestamp | Data de criação |

---

### Lições Seed (8 lições pré-carregadas)
**Arquivo:** `scripts/src/seed-lessons.ts`

```bash
pnpm --filter @workspace/scripts run seed-lessons
```

| # | Título | Categoria | Nível | XP | Bloqueada | Tipos de Exercícios |
|---|--------|-----------|-------|----|-----------|---------------------|
| 1 | Basic Greetings | vocabulary | beginner | 30 | ✗ | MC, Fill-in, Drag&Drop |
| 2 | Numbers 1-20 | vocabulary | beginner | 30 | ✗ | MC, Fill-in, Drag&Drop |
| 3 | Essential Verbs | grammar | beginner | 40 | ✗ | MC, Fill-in, Drag&Drop |
| 4 | Personal Introductions | speaking | beginner | 50 | ✗ | MC, Drag&Drop, Fill-in |
| 5 | Articles: A, An, The | grammar | intermediate | 60 | ✗ | MC, Fill-in, Drag&Drop |
| 6 | Office Vocabulary | vocabulary | intermediate | 60 | ✗ | MC, Fill-in, Drag&Drop |
| 7 | Present Simple Tense | grammar | intermediate | 70 | **Sim** | MC, Fill-in, Drag&Drop |
| 8 | Advanced Conversation | speaking | advanced | 100 | **Sim** | MC, Fill-in, Drag&Drop |

---

## 3. API REST — Rotas e Funções

**Base URL:** `/api`  
**Servidor:** `artifacts/api-server/src/`

### Middleware global (`app.ts`)

```typescript
// Detecta áudio (Content-Type: audio/* ou application/octet-stream)
// → bufferiza como Buffer em req.rawBodyBuffer
// Para outros tipos → usa express.json({ limit: '10mb' })
```

---

### `GET /api/healthz`
| Item | Detalhe |
|------|---------|
| Arquivo | `routes/health.ts` |
| Resposta 200 | `{ status: "ok" }` |

---

### `GET /api/lessons`
| Item | Detalhe |
|------|---------|
| Arquivo | `routes/lessons.ts` |
| Função | Busca todas as lições + marca quais foram completadas |
| Query DB | `SELECT * FROM lessons ORDER BY order` |
| Query DB | `SELECT lesson_id FROM completed_lessons WHERE user_id = 'guest'` |
| Resposta 200 | `Lesson[]` com campo `isCompleted: boolean` |

---

### `GET /api/lessons/:id`
| Item | Detalhe |
|------|---------|
| Arquivo | `routes/lessons.ts` |
| Parâmetro | `:id` — integer |
| Erros | 400 (id inválido), 404 (não encontrada) |
| Resposta 200 | `LessonDetail` com `exercises[]` e `vocabulary[]` |

---

### `GET /api/progress`
| Item | Detalhe |
|------|---------|
| Arquivo | `routes/progress.ts` |
| Comportamento | Busca ou **cria automaticamente** o registro do usuário `guest` |
| Resposta 200 | `UserProgress` + `totalLessons: number` |

---

### `POST /api/progress`
| Item | Detalhe |
|------|---------|
| Arquivo | `routes/progress.ts` |
| Body | `{ lessonId, xpEarned, minutesSpent, completed }` |
| Comportamento | Atualiza XP, nível, streak, minutos, XP semanal, achievements |
| **Auto-Vocabulário** | **Ao completar lição, salva automaticamente o vocabulary[] no `mastery_vocabulary`** |
| Deduplicação | Não salva palavra já existente no dicionário do usuário |
| Achievements | "Primeira Lição", "5 Lições", "500 XP", "1000 XP", "Semana Completa" |
| Cálculo de nível | `Math.floor(totalXp / 500) + 1` |

---

### `GET /api/conversation/scenarios`
| Item | Detalhe |
|------|---------|
| Arquivo | `routes/conversation.ts` |
| Resposta 200 | Array de 6 cenários (hardcoded — sem banco) |

**Cenários:**
| ID | Título | Dificuldade | Ícone |
|----|--------|-------------|-------|
| 1 | Restaurante | easy | 🍽️ |
| 2 | Aeroporto | medium | ✈️ |
| 3 | Entrevista de Emprego | hard | 💼 |
| 4 | Compras | easy | 🛍️ |
| 5 | Consulta Médica | medium | 🏥 |
| 6 | Hotel | easy | 🏨 |

---

### `POST /api/conversation/message`
| Item | Detalhe |
|------|---------|
| Arquivo | `routes/conversation.ts` |
| Body | `{ message, scenarioId, history, targetLanguage, nativeLanguage }` |
| Modelo IA | `gpt-5-mini` |
| System prompt | Responde em JSON: `{ reply, corrections[], suggestions[] }` |
| Retorno | `{ reply, corrections[], suggestions[], xpEarned: 10 }` |

**Formato de correction:**
```json
{
  "original": "I goed to store",
  "corrected": "I went to the store",
  "explanation": "'Go' é irregular: went no passado"
}
```

---

### `POST /api/voice/message`
| Item | Detalhe |
|------|---------|
| Arquivo | `routes/voice.ts` |
| Content-Type | `audio/*` ou `application/octet-stream` |
| Query params | `scenarioId`, `targetLanguage`, `nativeLanguage`, `history` (JSON) |

**Fluxo interno:**
```
1. Lê rawBodyBuffer (áudio binário do microfone)
2. ensureCompatibleFormat()  → converte para wav/mp3 via ffmpeg
3. speechToText()            → gpt-4o-mini-transcribe → string de texto
4. Se vazio → retorna aviso sem gastar TTS
5. gpt-5-mini               → analisa texto, gera reply + corrections + suggestions
6. textToSpeech(reply, "nova", "mp3")  → áudio mp3 em base64
7. Retorna JSON completo
```

**Resposta:**
```typescript
{
  userTranscript: string,
  reply: string,
  replyAudio: string | null,       // mp3 em base64
  pronunciationFeedback: string | null,
  corrections: Correction[],
  suggestions: string[],
  xpEarned: 15
}
```

---

### `GET /api/vocabulary`
| Item | Detalhe |
|------|---------|
| Arquivo | `routes/vocabulary.ts` |
| Comportamento | Lista todas as palavras do dicionário pessoal |
| Resposta 200 | `VocabularyEntry[]` ordenadas por data de criação |

---

### `POST /api/vocabulary`
| Item | Detalhe |
|------|---------|
| Arquivo | `routes/vocabulary.ts` |
| Body | `{ word, translation, phonetic?, example?, context? }` |
| Resposta 201 | `VocabularyEntry` criada |

---

### `DELETE /api/vocabulary/:id`
| Item | Detalhe |
|------|---------|
| Arquivo | `routes/vocabulary.ts` |
| Parâmetro | `:id` — integer |
| Resposta 200 | `{ success: true }` |

---

### `GET /api/openai/conversations`
| Item | Detalhe |
|------|---------|
| Arquivo | `routes/openai.ts` |
| Resposta 200 | `Conversation[]` do usuário guest |

---

### `POST /api/openai/conversations`
| Item | Detalhe |
|------|---------|
| Arquivo | `routes/openai.ts` |
| Body | `{ title, systemPrompt? }` |
| Comportamento | Cria conversa + insere system message opcional |
| Resposta 201 | `Conversation` criada |

---

### `GET /api/openai/conversations/:id`
| Item | Detalhe |
|------|---------|
| Arquivo | `routes/openai.ts` |
| Resposta 200 | `Conversation` + `messages[]` (ordenados por data) |

---

### `POST /api/openai/conversations/:id/messages`
| Item | Detalhe |
|------|---------|
| Arquivo | `routes/openai.ts` |
| Body | `{ content: string }` |
| Resposta | **SSE stream** — `text/event-stream` |
| Modelo | `gpt-5-mini` (stream: true) |
| Comportamento | Salva user msg → streama resposta → salva assistant msg |

**Eventos SSE:**
```
data: {"content": "chunk de texto"}
data: {"done": true}
```

---

### `POST /api/openai/conversations/:id/voice-messages`
| Item | Detalhe |
|------|---------|
| Arquivo | `routes/openai.ts` |
| Content-Type | `application/octet-stream` |
| Resposta | **SSE stream** — `text/event-stream` |
| Modelo | `gpt-audio` (voz: nova, speech-to-speech) |
| Comportamento | voiceChatStream → persiste user + assistant transcripts |

---

## 4. Integração com IA — OpenAI

**Pacote:** `@workspace/integrations-openai-ai-server`  
**Configuração:** Replit AI Integrations (sem chave própria necessária)  
**Variáveis de ambiente (auto-configuradas pelo Replit):**
- `AI_INTEGRATIONS_OPENAI_BASE_URL`
- `AI_INTEGRATIONS_OPENAI_API_KEY`

### Funções utilizadas (audio module)

| Função | Modelo | Entrada | Saída | Uso no app |
|--------|--------|---------|-------|------------|
| `speechToText(buffer, format)` | `gpt-4o-mini-transcribe` | Buffer de áudio | `string` | Voz → texto no Voice Tutor |
| `textToSpeech(text, voice, format)` | `gpt-audio` | string | `Buffer` | Texto → mp3 para reprodução |
| `voiceChatStream(buffer, voice)` | `gpt-audio` | Buffer de áudio | `AsyncIterable` | Speech-to-speech nas conversas |
| `ensureCompatibleFormat(buffer)` | — / ffmpeg | Buffer qualquer formato | `{ buffer, format }` | Normaliza áudio do browser |

### Funções utilizadas (client)

| Função | Modelo | Uso |
|--------|--------|-----|
| `openai.chat.completions.create()` | `gpt-5-mini` | Chat text + correções |
| `openai.chat.completions.create({ stream: true })` | `gpt-5-mini` | SSE streaming de respostas |

### Voz TTS utilizada
| Voz | Característica | Onde usada |
|-----|----------------|------------|
| `nova` | Feminina, amigável | Voice Tutor |

### Formatos de áudio suportados
| Formato | Browser |
|---------|---------|
| WebM / WebM+Opus | Chrome, Firefox |
| MP4 / M4A | Safari, iOS |
| WAV | Todos |

---

## 5. Frontend — Páginas e Componentes

**Artifact:** `artifacts/speak-app/`  
**Framework:** React + Vite (PWA)  
**UI:** Tailwind CSS + Shadcn components + Framer Motion  
**Roteamento:** Wouter  
**State management:** TanStack React Query (via hooks gerados)

### Páginas

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/` | `pages/home.tsx` | Dashboard: XP, streak, goal diário, weekly XP chart |
| `/lessons` | `pages/lessons.tsx` | Mapa de lições em zigzag |
| `/lessons/:id` | `pages/lesson-detail.tsx` | Engine de exercícios (MC + Fill + Drag) |
| `/voice` | `pages/voice.tsx` | Voice Tutor com microfone e correções inline |
| `/conversation` | `pages/conversation.tsx` | Seletor de cenários de prática |
| `/vocabulary` | `pages/vocabulary.tsx` | Dicionário de Maestria pessoal |
| `/profile` | `pages/profile.tsx` | Stats, nível, achievements |

### Componentes

| Arquivo | Conteúdo |
|---------|---------|
| `components/layout.tsx` | AppLayout + Bottom Navigation (5 itens) |
| `components/ui/core.tsx` | Button, Card, Input, Badge |

### Navigation (Bottom Bar)

| Ícone | Label | Rota |
|-------|-------|------|
| Home | Home | `/` |
| Map | Path | `/lessons` |
| Mic | Tutor (primary) | `/voice` |
| BookOpen | Words | `/vocabulary` |
| User | Profile | `/profile` |

### Hooks customizados

| Arquivo | Hook | Descrição |
|---------|------|-----------|
| `hooks/use-audio-recorder.ts` | `useAudioRecorder()` | Grava áudio do microfone |
| `hooks/use-voice-api.ts` | `useVoiceApi()` | Envia áudio para `/api/voice/message` |

---

## 6. Sistema de Exercícios Escritos

**Arquivo:** `artifacts/speak-app/src/pages/lesson-detail.tsx`

### Tipos de exercício

#### 1. Multiple Choice (`multiple_choice`)
- Exibe 4 opções de resposta
- Ao selecionar e confirmar: mostra **verde** para correta, **vermelho** para errada
- Exibe ícone ✓ / ✗ em cada opção
- Mostra explicação contextual abaixo
- Avança automaticamente após 900ms

#### 2. Fill in the Blank (`fill_in_blank`)
- Input de texto livre
- Aceita Enter como atalho para checar
- Comparação case-insensitive (`toLowerCase()`)
- Mostra explicação se errar
- Input fica verde/vermelho conforme resultado

#### 3. Drag and Drop (`drag_and_drop`)
- Banco de palavras (word bank) disponíveis
- Usuário toca palavra → move para zona de construção
- Toca palavra na zona → devolve ao banco
- Ao checar: mostra frase montada em verde/vermelho
- Botão "Reset" aparece se errar

### Fluxo de Lição

```
[Header com barra de progresso]
    ↓
[Exercise 1 → N] (animação de entrada/saída por slide)
    ↓
[Vocab Summary] → Usuário pode salvar palavras (+) no dicionário pessoal
    ↓
[Tela de Conclusão] → XP ganho + opção continuar no Path
    ↓ (POST /api/progress chamado aqui)
[Auto-save vocabulário da lição no mastery_vocabulary]
```

---

## 7. Fluxo de Voz (STT + TTS)

**Arquivo:** `artifacts/api-server/src/routes/voice.ts`  
**Frontend:** `artifacts/speak-app/src/pages/voice.tsx`

### Ciclo completo de uma interação por voz

```
[Usuário pressiona botão Mic]
        ↓
[useAudioRecorder] → grava em WebM/MP4
        ↓
[useVoiceApi] → POST /api/voice/message
  Query params: scenarioId, history (JSON)
  Body: audio binário (octet-stream)
        ↓
[Backend — voice.ts]
  1. ensureCompatibleFormat() → converte ffmpeg se necessário
  2. speechToText() → gpt-4o-mini-transcribe → userTranscript
  3. Se vazio → retorna "não entendi"
  4. gpt-5-mini → reply + corrections + suggestions (formato JSON com <feedback> tags)
  5. textToSpeech(reply, "nova", "mp3") → Buffer → base64
        ↓
[Frontend recebe JSON]
  - userTranscript → exibe burbulha do usuário
  - reply → exibe burbulha da IA
  - replyAudio → new Audio("data:audio/mp3;base64,...").play()
  - corrections → exibe inline (riscado original → corrigido em verde)
  - xpEarned: 15 → atualiza XP
```

---

## 8. Vocabulário e Dicionário de Maestria

### Fontes de palavras

| Fonte | Como entra | Campo `context` |
|-------|------------|-----------------|
| Lições | Auto-salvo ao completar lição | `"Lesson: Basic Greetings"` |
| Manual (lição) | Botão + na tela Vocab Summary da lição | `"Lesson: <nome>"` |
| Conversas | Via `POST /api/vocabulary` | `null` ou personalizado |

### Deduplicação
- Ao completar lição, o backend verifica se a palavra já existe para o `user_id`
- Não duplica se palavra já estiver no dicionário

### Filtros na tela de vocabulário
| Filtro | Critério |
|--------|---------|
| All | Todos |
| Lessons | `context LIKE 'Lesson:%'` |
| Chats | `context NOT LIKE 'Lesson:%'` |

### Stats exibidas
- Total de palavras
- Palavras mastered (level >= 4)
- Média de nível

---

## 9. Gamificação e Progresso

### XP e Níveis
| Evento | XP ganho |
|--------|----------|
| Completar lição (beginner) | 30 XP |
| Completar lição (intermediate) | 60–70 XP |
| Completar lição (advanced) | 100 XP |
| Mensagem de texto (conversation) | 10 XP |
| Interação por voz | 15 XP |

**Fórmula de nível:** `level = Math.floor(totalXp / 500) + 1`

### Streak
- Incrementa se último acesso foi ontem (+1 dia)
- Zera se passaram mais de 1 dia sem atividade
- `longest_streak` registra o recorde histórico

### Achievements
| Achievement | Condição |
|-------------|----------|
| Primeira Lição | `completedLessons >= 1` |
| 5 Lições | `completedLessons >= 5` |
| 500 XP | `totalXp >= 500` |
| 1000 XP | `totalXp >= 1000` |
| Semana Completa | `currentStreak >= 7` |

### Daily Goal
- Meta padrão: 15 minutos/dia
- `today_minutes` acumulado por session
- Exibido como barra de progresso na Home

### Weekly XP Chart
- Array `weekly_xp[7]` onde índice = `new Date().getDay()` (0=Dom, 6=Sáb)
- Exibido como gráfico de barras (Recharts) na Home

---

## 10. Dependências por Pacote

### `artifacts/speak-app` (Frontend PWA)

| Dependência | Versão | Uso |
|-------------|--------|-----|
| `react` | catalog | Framework UI |
| `react-dom` | catalog | DOM rendering |
| `@tanstack/react-query` | catalog | Server state management |
| `wouter` | — | Roteamento leve |
| `framer-motion` | latest | Animações, micro-interações |
| `recharts` | latest | Gráfico de XP semanal |
| `clsx` | latest | Conditional classes |
| `tailwind-merge` | latest | Merge de classes Tailwind |
| `lucide-react` | — | Ícones |
| `tailwindcss` | — | CSS utility-first |
| `@workspace/api-client-react` | workspace | Hooks gerados via Orval |

### `artifacts/api-server` (Backend Express)

| Dependência | Versão | Uso |
|-------------|--------|-----|
| `express` | ^5 | HTTP server framework |
| `cors` | ^2 | CORS middleware |
| `drizzle-orm` | catalog | ORM query builder |
| `@workspace/db` | workspace | Schema + conexão DB |
| `@workspace/api-zod` | workspace | Schemas de validação |
| `@workspace/integrations-openai-ai-server` | workspace | SDK OpenAI (STT/TTS/Chat) |

### `lib/integrations-openai-ai-server`

| Módulo | Exports |
|--------|---------|
| `client.ts` | `openai` — cliente OpenAI pré-configurado |
| `audio/index.ts` | `speechToText`, `textToSpeech`, `voiceChatStream`, `ensureCompatibleFormat`, `convertToWav`, `detectAudioFormat` |
| `batch/index.ts` | `batchProcess`, `batchProcessWithSSE` |
| `image/index.ts` | `generateImageBuffer`, `editImages` |

### `lib/db`

| Arquivo | Exports |
|---------|---------|
| `src/schema/lessons.ts` | `lessonsTable`, `levelEnum`, `categoryEnum` |
| `src/schema/progress.ts` | `userProgressTable`, `completedLessonsTable` |
| `src/schema/vocabulary.ts` | `masteryVocabularyTable` |
| `src/schema/conversations.ts` | `conversations` |
| `src/schema/messages.ts` | `messages` |

---

## 11. Estrutura de Arquivos Completa

```
workspace/
├── artifacts/
│   ├── api-server/
│   │   ├── src/
│   │   │   ├── app.ts                 ← Express setup + audio middleware
│   │   │   ├── index.ts               ← Entry point (PORT)
│   │   │   └── routes/
│   │   │       ├── index.ts           ← Monta todos os routers
│   │   │       ├── health.ts          ← GET /api/healthz
│   │   │       ├── lessons.ts         ← GET /api/lessons, GET /api/lessons/:id
│   │   │       ├── progress.ts        ← GET/POST /api/progress (+ auto-vocab)
│   │   │       ├── conversation.ts    ← GET /api/conversation/scenarios, POST /api/conversation/message
│   │   │       ├── voice.ts           ← POST /api/voice/message (STT→AI→TTS)
│   │   │       ├── vocabulary.ts      ← GET/POST /api/vocabulary, DELETE /api/vocabulary/:id
│   │   │       └── openai.ts          ← /api/openai/conversations/* (SSE text + voice)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── speak-app/
│       ├── public/
│       │   └── images/
│       │       ├── bg-glow.png        ← Background effect (gerado por IA)
│       │       └── avatar.png         ← Avatar padrão (gerado por IA)
│       ├── src/
│       │   ├── App.tsx                ← Router + QueryClient + Providers
│       │   ├── index.css              ← Design system tokens (dark mode premium)
│       │   ├── components/
│       │   │   ├── layout.tsx         ← AppLayout + Bottom Nav (5 items)
│       │   │   └── ui/
│       │   │       ├── core.tsx       ← Button, Card, Input, Badge
│       │   │       └── [shadcn]       ← Componentes Shadcn base
│       │   ├── hooks/
│       │   │   ├── use-audio-recorder.ts  ← Grava áudio do mic
│       │   │   └── use-voice-api.ts       ← Envia áudio ao backend
│       │   ├── pages/
│       │   │   ├── home.tsx           ← Dashboard
│       │   │   ├── lessons.tsx        ← Mapa de lições zigzag
│       │   │   ├── lesson-detail.tsx  ← Engine de exercícios (MC + Fill + Drag)
│       │   │   ├── voice.tsx          ← Voice Tutor com histórico
│       │   │   ├── conversation.tsx   ← Cenários de prática
│       │   │   ├── vocabulary.tsx     ← Dicionário de Maestria
│       │   │   └── profile.tsx        ← Stats + achievements
│       │   └── lib/
│       │       └── utils.ts           ← cn() helper
│       └── package.json
│
├── lib/
│   ├── api-spec/
│   │   └── openapi.yaml               ← Contrato único da API (17 endpoints)
│   ├── api-client-react/
│   │   └── src/generated/api.ts       ← Hooks React Query (gerados via Orval)
│   ├── api-zod/
│   │   └── src/generated/api.ts       ← Schemas Zod (gerados via Orval)
│   ├── db/
│   │   ├── src/schema/
│   │   │   ├── index.ts               ← Barrel re-exports
│   │   │   ├── lessons.ts             ← lessons table + enums
│   │   │   ├── progress.ts            ← user_progress + completed_lessons tables
│   │   │   ├── vocabulary.ts          ← mastery_vocabulary table
│   │   │   ├── conversations.ts       ← conversations table (OpenAI template)
│   │   │   └── messages.ts            ← messages table (OpenAI template)
│   │   └── drizzle.config.ts
│   ├── integrations-openai-ai-server/ ← SDK OpenAI server-side
│   └── integrations-openai-ai-react/  ← Hooks React voice stream
│
└── scripts/
    └── src/
        └── seed-lessons.ts            ← Seeds 8 lições com 3 tipos de exercício
```

---

## 12. Contratos OpenAPI

**Arquivo:** `lib/api-spec/openapi.yaml`  
**Total de endpoints:** 17

```yaml
paths:
  /healthz:                              # GET
  /lessons:                             # GET
  /lessons/{id}:                        # GET
  /progress:                            # GET, POST
  /conversation/scenarios:              # GET
  /conversation/message:                # POST
  /voice/message:                       # POST (audio binary)
  /vocabulary:                          # GET, POST
  /vocabulary/{id}:                     # DELETE
  /openai/conversations:                # GET, POST
  /openai/conversations/{id}:           # GET
  /openai/conversations/{id}/messages:  # POST (SSE)
  /openai/conversations/{id}/voice-messages: # POST (SSE, audio)
```

**Schemas gerados via Orval:**
- `HealthStatus`
- `Lesson`, `LessonDetail`, `Exercise`, `VocabularyItem`
- `UserProgress`, `UpdateProgressBody`
- `ConversationScenario`, `SendConversationMessageBody`, `ConversationResponse`, `Correction`
- `VoiceResponse`
- `VocabularyEntry`, `AddVocabularyBody`
- `OpenaiConversation`, `OpenaiConversationWithMessages`, `OpenaiMessage`
- `CreateOpenaiConversationBody`, `SendOpenaiMessageBody`, `SendOpenaiVoiceMessageBody`

---

## Resumo Técnico

| Dimensão | Detalhe |
|----------|---------|
| Tabelas no banco | 5 (`lessons`, `user_progress`, `completed_lessons`, `mastery_vocabulary`, `conversations`, `messages`) |
| Endpoints API | 17 (GET + POST + DELETE) |
| Tipos de exercício | 3 (multiple choice, fill in blank, drag and drop) |
| Lições seed | 8 (com 3-4 exercícios cada) |
| Cenários de conversa | 6 (hardcoded) |
| Modelos IA usados | 3 (`gpt-5-mini`, `gpt-4o-mini-transcribe`, `gpt-audio`) |
| Voz TTS | nova (feminina, amigável) |
| Gamificação | XP + Nível + Streak + Achievements + Daily Goal + Weekly Chart |
| PWA | Sim (mobile-first, dark mode padrão) |
| Auth | Sem auth (MVP usa userId = "guest") |
