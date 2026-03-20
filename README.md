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
| Testes | Vitest |

## Estrutura

```
src/
├── app/
│   ├── (auth)/login, register
│   ├── (app)/dashboard, lessons, conversation, conversations, vocabulary, profile, placement-test
│   ├── api/chat, transcribe, speak, lessons/complete, vocabulary, placement-test, achievements, daily-missions
│   └── page.tsx (Landing)
├── lib/
│   ├── supabase/
│   ├── db/
│   ├── prompts/
│   ├── gamification/{levels, missions, achievements, definitions}.ts
│   └── utils.ts
└── __tests__/ (test files next to source)
```

## Banco de Dados

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| users | Usuários cadastrados |
| lessons | Lições do learning path |
| user_progress | Progresso (XP, streak, conversas, missões, conquistas) |
| user_lesson_progress | Lições completadas por usuário |
| user_vocabulary | Vocabulário errado + correção + explicação |
| placement_questions | Perguntas do teste de nível |
| conversations | Histórico de conversas |
| daily_missions | Missões diárias disponíveis |
| daily_missions_log | Registro de missões completadas |

### Triggers

- `handle_new_user()` - Sincroniza users com Supabase Auth

---

## Funcionalidades Implementadas

### Learning Path ✅
- Lições ordenadas por `order`
- Usuário só acessa se completou a anterior
- Ao completar: XP + próxima lição desbloqueada
- 3 tipos de exercício: multiple choice, fill in blank, drag and drop

### Vocabulário ✅
- Salva palavras erradas + correção + explicação
- Disponível em `/vocabulary`
- Revisável a qualquer momento

### Teste de Nível ✅
- 15 questões no banco (10 selecionadas aleatoriamente)
- Níveis: A1, A2, B1, B2, C1, C2 baseados em percentil

### Conversas ✅
- Salva texto no banco (sem áudio)
- Histórico em `/conversations`
- Cenários configuráveis em `/lib/conversation/scenarios.ts`

### Autenticação ✅
- Login/Register com Supabase Auth
- Redirect automático para dashboard
- Logout em `/profile`

### Landing Page ✅
- Página pública com CTA para login/register

### Sistema de Gamificação ✅

#### XP e Níveis
```
Cada nível = 500 XP
A1 → A2 → B1 → B2 → C1 → C2
Progresso granular dentro de cada nível
```

#### Missões Diárias ✅
3 missões por dia que resetam à meia-noite:
- Complete 1 lesson (1x, +20 XP)
- Practice speaking (5x, +30 XP)
- Review vocabulary (10x, +15 XP)

**Bônus:** +50 XP ao completar todas

#### Achievements (Conquistas) ✅
| Achievement | Condição | XP |
|-------------|----------|-----|
| 🌟 Primeira Lição | Complete first lesson | 50 |
| 🔥 7 Dias de Streak | 7-day streak | 100 |
| 📚 100 Palavras | 100 vocabulary words | 75 |
| 🗣️ Primeira Conversa | First voice conversation | 50 |
| 🏆 Todas as Lições | Complete all lessons of a level | 150 |
| ⭐ Primeira Semana | 7 days on platform | 100 |

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

## Testes ✅

### Framework
- **Vitest** - Test runner rápido e leve
- **44 testes unitários** cobrindo lógica crítica

### Cobertura

| Módulo | Testes | Descrição |
|--------|--------|-----------|
| `levels.ts` | 25 | getLevelFromScore, getXpInLevel, getLevelFromTotalXp, getCurrentLevel, getXpToNextLevel, getProgressInLevel, getNextLevel, getLevelCategory |
| `definitions.ts` | 13 | ACHIEVEMENTS, DEFAULT_MISSIONS, validação de estruturas |
| `utils.ts` | 6 | cn() - merge de classes Tailwind |

### Rodando os testes

```bash
pnpm test        # modo watch
pnpm test:run    # uma execução
```

### Próximos testes a implementar
- [ ] Testes para missions.ts (getDailyMissions, updateMissionProgress)
- [ ] Testes para achievements.ts (checkAndAwardAchievements)
- [ ] Testes de integração para APIs
- [ ] Testes E2E com Playwright

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
pnpm test:run    # rodar testes
pnpm lint        # verificar código
pnpm build       # build de produção
```

---

## Roadmap

### Feito ✅
- [x] Login/Register com Supabase Auth
- [x] Redirect automático
- [x] Dashboard com stats (XP, streak, nível, missões)
- [x] Learning Path com progresso
- [x] Exercícios (multiple choice, fill in blank, drag and drop)
- [x] Sistema de vocabulário
- [x] Placement test (15 perguntas)
- [x] Salvar conversas no banco
- [x] Histórico de conversas
- [x] Logout
- [x] Landing page com CTA
- [x] Missões diárias (back-end completo)
- [x] Achievements/Conquistas (back-end completo)
- [x] Sistema de XP granular
- [x] Cenários de conversa configuráveis
- [x] Testes unitários (Vitest)
- [x] Correções de lint e type safety

### Em desenvolvimento 🚧
- [ ] Cenários de conversa (GUI para selecionar)
- [ ] Daily goal com progresso visual
- [ ] Streaming TTS (latência reduzida)

### A fazer 📋
- [ ] Sistema de SRS para vocabulário (Spaced Repetition)
- [ ] PWA (offline support)
- [ ] Notificações push
- [ ] Dashboard analítico (pronúncia, palavras por nível)
- [ ] Modo escuro
- [ ] Testes E2E com Playwright
- [ ] Testes de integração
- [ ] CI/CD pipeline

---

## Decisões técnicas

**Por que não salvar áudios?**
Para manter dentro do free tier do Supabase (500MB).

**Por que Claude Haiku?**
Mais rápido e barato que GPT-4o para conversação simples.

**Por que Drizzle ORM?**
Leve, type-safe, funciona bem com Next.js Server Components.

**Por que Vitest?**
Compatível com Jest API, mais rápido, excelente suporte TypeScript.
