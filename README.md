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
│   │   ├── dashboard/page.tsx        ← Stats reais do usuário + nível
│   │   ├── lessons/
│   │   │   ├── page.tsx             ← Learning Path com progresso
│   │   │   ├── [id]/page.tsx        ← Detail da lição com exercícios
│   │   │   └── lessons-client.tsx   ← Componente do path
│   │   ├── conversation/page.tsx    ← Conversa com Miss Ana (voz)
│   │   ├── conversations/page.tsx   ← Histórico de conversas
│   │   ├── vocabulary/page.tsx      ← Vocabulário do usuário
│   │   ├── profile/page.tsx          ← Perfil + logout
│   │   └── placement-test/          ← Teste de nível
│   ├── api/
│   │   ├── chat/route.ts             ← Claude Haiku (salva no banco)
│   │   ├── transcribe/route.ts       ← Whisper STT
│   │   ├── speak/route.ts            ← OpenAI TTS (nova)
│   │   ├── lessons/complete/route.ts ← Completa lição e atribui XP
│   │   ├── vocabulary/route.ts       ← Salva vocabulário
│   │   └── placement-test/route.ts  ← Salva resultado do teste
│   └── page.tsx                      ← Landing page
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── db/
│   │   ├── schema.ts                 ← Drizzle schema
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
- **user_vocabulary** - Vocabulário errado + correção + explicação
- **placement_questions** - Perguntas do teste de nível
- **conversations** - Histórico de conversas com Miss Ana
- **messages** - Mensagens de cada conversa

### Triggers

- `handle_new_user()` - Cria registro na tabela `users` quando usuário se registra no Supabase Auth

## Funcionalidades

### Learning Path
- Lições ordenadas pelo campo `order`
- Usuário só acessa se tiver completado a anterior
- Ao completar, ganha XP e próxima lição é desbloqueada
- Lições completas com check verde, bloqueadas com ícone de lock

### Vocabulário
- Salva automaticamente palavras erradas + correção + explicação
- Disponível em `/vocabulary`
- Fonte: exercícios das lições

### Teste de Nível (Placement Test)
- 10 questões aleatórias de 15 disponíveis
- Níveis: Beginner (< 50%), Intermediate (50-79%), Advanced (≥ 80%)
- Resultado salvo na tabela `users.english_level`
- Link no dashboard para refazer

### Dashboard
- Exibe: nome do usuário, nível de inglês, streak, XP total
- Link para testar nível novamente
- Link para iniciar lições ou conversa

### Conversas
- Salva automaticamente no banco (apenas texto, sem áudio)
- Histórico disponível em `/conversations`
- Áudio gerado sob demanda (sem storage no Supabase)

### Autenticação
- Login/Register com Supabase Auth
- Redirect automático se usuário logado acessar /login ou /register
- Logout disponível em `/profile`

### Landing Page
- Página pública com CTA para cadastro
- Features destacadas (Voice Practice, Structured Learning, Track Progress)

## Fluxo da conversa

```
Usuário fala
    ↓
/api/transcribe  →  Whisper transcreve (~1.5s)
    ↓
/api/chat        →  Claude Haiku responde (~1.4s) + salva no banco
    ↓
/api/speak       →  Nova sintetiza voz (~3.5s)
    ↓
Usuário ouve a Miss Ana
```

## Estratégia de Custos

- **Sem armazenar áudios** no Supabase (economiza storage do free tier)
- **Texto salvo no banco** - Histórico de conversas preservado
- **Áudio gerado sob demanda** - Custo ~$0.01 por resposta

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
- [x] Redirect se usuário logado acessar /login ou /register
- [x] Buscar nome do usuário logado no dashboard
- [x] Dashboard com stats reais (XP, streak)
- [x] Dashboard exibe nível de inglês
- [x] Proteger rotas `/dashboard`, `/lessons`, `/conversation`
- [x] Tabelas no Supabase (users, lessons, conversations, messages, user_progress, user_lesson_progress, user_vocabulary, placement_questions)
- [x] Trigger para sincronizar users com auth.users
- [x] Salvar progresso de lição no banco
- [x] Learning Path com progresso por usuário
- [x] Exercícios das lições (multiple choice, fill in blank, drag and drop)
- [x] Atribuição de XP ao completar lição
- [x] Sistema de vocabulário (palavras erradas + correção)
- [x] Página de vocabulário do usuário
- [x] Teste de nível (placement test) com 15 perguntas
- [x] Salvar conversas no banco (texto)
- [x] Histórico de conversas
- [x] Logout funcionando
- [x] Landing page com CTA
- [x] CSS/design das telas (Tailwind + glass card pattern)
- [x] Branch `improvements` no GitHub

### A fazer 📋

#### Medium Priority
- [ ] Cenários de conversa (restaurante, entrevista de emprego, hotel)
- [ ] Sistema de correções inline durante conversas
- [ ] Daily Goal (meta diária de minutos)
- [ ] Weekly XP Chart (gráfico de XP semanal)
- [ ] Achievements (conquistas)
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

**Por que não salvar áudios?**
Para manter o projeto dentro do free tier do Supabase (500MB) e economizar custos. Áudio é gerado sob demanda e não armazenado.