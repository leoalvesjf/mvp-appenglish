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
│   ├── (auth)/login, register
│   ├── (app)/dashboard, lessons, conversation, conversations, vocabulary, profile, placement-test
│   ├── api/chat, transcribe, speak, lessons/complete, vocabulary, placement-test
│   └── page.tsx (Landing)
├── lib/
│   ├── supabase/, db/, prompts/
│   └── proxy.ts
```

## Banco de Dados

### Tabelas

- **users** - Usuários cadastrados
- **lessons** - Lições do learning path
- **user_progress** - Progresso (XP, streak, conversas)
- **user_lesson_progress** - Lições completadas por usuário
- **user_vocabulary** - Vocabulário errado + correção
- **placement_questions** - Perguntas do teste de nível
- **conversations** / **messages** - Histórico de conversas
- **daily_missions** - Missões diárias (TODO)
- **user_achievements** - Conquistas desbloqueadas (TODO)

### Triggers

- `handle_new_user()` - Sincroniza users com Supabase Auth

---

## Funcionalidades

### Learning Path
- Lições ordenadas por `order`
- Usuário só acessa se completou a anterior
- Ao completar: XP + próxima lição desbloqueada

### Vocabulário
- Salva palavras erradas + correção + explicação
-Disponível em `/vocabulary`

### Teste de Nível
- 10 questões aleatórias (15 no banco)
- Níveis: Beginner (<50%), Intermediate (50-79%), Advanced (≥80%)

### Conversas
- Salva texto no banco (sem áudio)
- Histórico em `/conversations`

### Autenticação
- Login/Register com Supabase Auth
- Redirect automático
- Logout em `/profile`

### Landing Page
- Página pública com CTA

---

## Sistema de Gamificação (Em desenvolvimento)

### Missões Diárias
3 missões por dia que resettam às midnight:
- Complete 1 lesson
- Practice 5 min with Miss Ana
- Review vocabulary

**Bônus:** XP extra ao completar todas

### Níveis Granulares
Cada nível = 500 XP:
- Beginner A1 → A2
- Intermediate B1 → B2
- Advanced C1 → C2

Mais feedback visual de progresso.

### Achievements (Conquistas)
| Achievement | Condição |
|-------------|----------|
| 🌟 Primeira Lição | Complete first lesson |
| 🔥 7 Dias de Streak | 7-day streak |
| 📚 100 Palavras | 100 vocabulary words |
| 🗣️ Primeira Conversa | First voice conversation |
| 🏆 Todas as Lições | Complete all lessons of a level |
| ⭐ Primeira Semana | 7 days on platform |

### Daily Goal
- Meta padrão: 10 minutos/dia
- Barra de progresso no dashboard

---

## Fluxo da conversa

```
Usuário fala → Whisper → Claude Haiku → TTS → Miss Ana responde
```

## Estratégia de Custos

- **Sem armazenar áudios** no Supabase
- **Texto salvo no banco**
- **Áudio gerado sob demanda**

---

## Variáveis de ambiente

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

---

## Roadmap

### Feito ✅
- [x] Login/Register com Supabase Auth
- [x] Redirect automático
- [x] Dashboard com stats (XP, streak, nível)
- [x] Learning Path com progresso
- [x] Exercícios (multiple choice, fill in blank, drag and drop)
- [x] Sistema de vocabulário
- [x] Placement test (15 perguntas)
- [x] Salvar conversas no banco
- [x] Histórico de conversas
- [x] Logout
- [x] Landing page com CTA

### Em desenvolvimento 🚧
- [ ] Missões diárias
- [ ] Achievements
- [ ] Daily goal com progresso

### A fazer 📋
- Cenários de conversa (restaurante, entrevista, hotel)
- Sistema de SRS para vocabulário
- Streaming TTS
- PWA

---

## Decisões técnicas

**Por que não salvar áudios?**
Para manter dentro do free tier do Supabase (500MB).

**Por que Claude Haiku?**
Mais rápido e barato que GPT-4o para conversação simples.

**Por que Drizzle ORM?**
Leve, type-safe, funciona bem com Next.js Server Components.