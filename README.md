# MVP AppEnglish — Miss Ana 🎤

App de conversação em inglês com IA para profissionais brasileiros.

## O que é

O usuário fala em inglês pelo microfone, a Miss Ana (IA) ouve, responde em inglês e fala de volta. Simples, direto, sem enrolação.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Estilização | Tailwind CSS |
| Banco de dados | Supabase (PostgreSQL) |
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
│   │   ├── dashboard/page.tsx
│   │   └── conversation/page.tsx
│   ├── api/
│   │   ├── chat/route.ts        ← Claude Haiku (Miss Ana)
│   │   ├── transcribe/route.ts  ← Whisper STT
│   │   └── speak/route.ts       ← OpenAI TTS (nova)
│   └── page.tsx                 ← landing page (TODO)
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── db/
│   │   └── schema.ts            ← Drizzle schema
│   └── prompts/
│       └── miss-ana.ts          ← system prompt da Miss Ana
└── proxy.ts                     ← proteção de rotas
```

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

## Variáveis de ambiente

Cria um `.env.local` na raiz com:

```env
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

## Roadmap MVP (até 31/03)

### Obrigatório
- [ ] Redirect automático após login (sem F5)
- [ ] Buscar nome do usuário logado no dashboard
- [ ] Logout funcionando
- [ ] Landing page (`/`) com CTA de cadastro
- [ ] Proteger rotas `/dashboard` e `/conversation`
- [ ] Redirecionar usuário logado que acessa `/login` ou `/register`
- [ ] Criar tabelas no Supabase (users, conversations, messages, user_progress)
- [ ] Salvar conversas no banco
- [ ] Progresso real no dashboard (streak, total de conversas)
- [ ] CSS/design de todas as telas
- [ ] Deploy na Vercel

### Pós MVP
- [ ] Níveis de inglês (beginner/intermediate/advanced)
- [ ] Histórico de conversas
- [ ] Cenários (restaurante, entrevista de emprego, hotel)
- [ ] Streaming do TTS para reduzir latência percebida
- [ ] PWA (instalar no celular)

---

## Decisões técnicas

**Por que Next.js em vez de React + Express?**
Todo o backend roda como API Routes serverless na Vercel. Zero servidor separado, zero cold start, um único deploy.

**Por que Claude Haiku?**
Mais rápido e barato que o GPT-4o para conversação simples. Miss Ana não precisa de raciocínio complexo — precisa de respostas rápidas e naturais.

**Por que tts-1 em vez de gpt-4o-audio-preview?**
O `tts-1` é dedicado para síntese de voz — mais rápido e mais barato. O `gpt-4o-audio-preview` é um modelo de chat com capacidade de áudio, desnecessariamente pesado para TTS simples.
