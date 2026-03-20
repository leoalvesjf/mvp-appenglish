# MVP AppEnglish — Miss Ana 🎤

App de conversação em inglês com IA para profissionais brasileiros.

## O que é

O usuário fala em inglês pelo microfone, a Miss Ana (IA) ouve, responde em inglês e fala de volta. Simples, direto, sem enrolação.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Estilização | Tailwind CSS v4 |
| Banco de dados | Supabase (PostgreSQL) |
| ORM | Drizzle ORM |
| Auth | Supabase Auth |
| IA conversacional | Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) |
| STT | OpenAI Whisper (`whisper-1`) |
| TTS | OpenAI TTS (`tts-1`, voz `nova`) |
| Deploy | Vercel |

## Estrutura

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── dashboard/page.tsx        ← Stats reais do usuário
│   │   ├── lessons/
│   │   │   ├── page.tsx             ← Learning Path com progresso
│   │   │   ├── [id]/page.tsx        ← Detail da lição com exercícios
│   │   │   └── lessons-client.tsx   ← Componente do path
│   │   └── conversation/page.tsx    ← Conversa com Miss Ana
│   ├── api/
│   │   ├── chat/route.ts             ← Claude Haiku (Miss Ana)
│   │   ├── transcribe/route.ts       ← Whisper STT
│   │   ├── speak/route.ts            ← OpenAI TTS (nova)
│   │   └── lessons/complete/route.ts ← Completa lição e atribui XP
│   └── page.tsx                      ← Landing page
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── db/
│   │   ├── schema.ts                 ← Drizzle schema (users, lessons, user_progress, user_lesson_progress)
│   │   ├── db.ts                     ← Drizzle client
│   │   └── migrations/               ← Migrations do banco
│   └── prompts/
│       └── miss-ana.ts               ← System prompt da Miss Ana
└── proxy.ts                          ← Proteção de rotas (SSR cookie)
```

## Banco de Dados

### Tabelas

- **users** - Usuários cadastrados (sincronizado com Supabase Auth via trigger)
- **lessons** - Lições do learning path (título, exercícios, XP reward, order)
- **user_progress** - Progresso global do usuário (total XP, streak, conversas)
- **user_lesson_progress** - Quais lições cada usuário completou (status, score)
- **conversations** - Histórico de conversas com Miss Ana
- **messages** - Mensagens de cada conversa

### Triggers

- `handle_new_user()` - Cria registro na tabela `users` quando usuário se registra no Supabase Auth

## Fluxo da conversa

```
Usuário fala
    ↓
/api/transcribe  →  Whisper transcreve (~1.5s)
    ↓
/api/chat        →  Claude Haiku responde (~1.4s)
    ↓
/api/speak       →  Nova sintetiza voz (~3.5s)
    ↓
Usuário ouve a Miss Ana
```

## Learning Path

O sistema de lições funciona assim:

1. Lições são ordenadas pelo campo `order`
2. Usuário só pode acessar uma lição se tiver completado a anterior
3. Ao completar, ganha XP e a próxima lição é desbloqueada
4. Lições completas aparecem com check verde no path
5. Lições bloqueadas aparecem com ícone de lock

## Variáveis de ambiente

Cria um `.env.local` na raiz com:

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

## Rodando localmente

```bash
pnpm install
pnpm dev
```

Acessa `http://localhost:3000`

## Deploy

```bash
vercel --prod
```

Adiciona as variáveis de ambiente no painel da Vercel antes do deploy.

---

## Roadmap

### Feito ✅

- [x] Login e Register com Supabase Auth
- [x] Redirect automático após login
- [x] Buscar nome do usuário logado no dashboard
- [x] Dashboard com stats reais (XP, streak)
- [x] Proteger rotas `/dashboard`, `/lessons`, `/conversation`
- [x] Tabelas no Supabase (users, lessons, conversations, messages, user_progress, user_lesson_progress)
- [x] Trigger para sincronizar users com auth.users
- [x] Salvar progresso de lição no banco
- [x] Learning Path com progresso por usuário
- [x] Exercícios das lições (multiple choice, fill in blank, drag and drop)
- [x] Atribuição de XP ao completar lição
- [x] CSS/design das telas (Tailwind + glass card pattern)
- [x] Branch `improvements` no GitHub

### A fazer 📋

#### High Priority
- [ ] Landing page com CTA de cadastro
- [ ] Logout funcionando
- [ ] Redirecionar usuário logado que acessa `/login` ou `/register`
- [ ] Salvar conversas no banco
- [ ] Histórico de conversas
- [ ] Deploy na Vercel

#### Medium Priority
- [ ] Níveis de inglês (beginner/intermediate/advanced)
- [ ] Cenários (restaurante, entrevista de emprego, hotel)
- [ ] Streaming do TTS para reduzir latência percebida

#### Low Priority
- [ ] PWA (instalar no celular)
- [ ] Testes automatizados

---

## Decisões técnicas

**Por que Next.js em vez de React + Express?**
Todo o backend roda como API Routes serverless na Vercel. Zero servidor separado, zero cold start, um único deploy.

**Por que Claude Haiku?**
Mais rápido e barato que o GPT-4o para conversação simples. Miss Ana não precisa de raciocínio complexo — precisa de respostas rápidas e naturais.

**Por que tts-1 em vez de gpt-4o-audio-preview?**
O `tts-1` é dedicado para síntese de voz — mais rápido e mais barato. O `gpt-4o-audio-preview` é um modelo de chat com capacidade de áudio, desnecessariamente pesado para TTS simples.

**Por que Drizzle ORM?**
Leve, type-safe, e funciona bem com Next.js Server Components. Permite queries type-safe sem overhead de ORM pesado.