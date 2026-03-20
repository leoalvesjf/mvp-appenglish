# Plano de Teste Funcional — MVP AppEnglish

## Autenticação

### Landing Page (`/`)
| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|--------------------|
| 1 | CTAs visíveis | Acessar página | Botões "Sign In" e "Get Started" visíveis |
| 2 | Navegação para Login | Clicar "Sign In" | Redireciona para `/login` |
| 3 | Navegação para Register | Clicar "Get Started" | Redireciona para `/register` |
| 4 | Layout responsivo | Redimensionar janela | Layout se adapta sem quebra |

### Login (`/login`)
| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|--------------------|
| 5 | Usuário já logado | Fazer login, abrir `/login` | Redireciona para `/dashboard` |
| 6 | Login com credenciais válidas | Inserir email/senha válidos, clicar Sign In | Redireciona para `/dashboard` |
| 7 | Login com senha errada | Inserir senha incorreta | Exibe mensagem de erro |
| 8 | Login com campos vazios | Clicar Sign In sem preencher | Botão permanece desabilitado ou exibe erro |
| 9 | Enter como submit | Preencher e pressionar Enter | Submete o formulário |
| 10 | Link para Register | Clicar "Create an account" | Navega para `/register` |
| 11 | Link para Forgot Password | Clicar "Forgot password?" | Navega para `/forgot-password` |

### Register (`/register`)
| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|--------------------|
| 12 | Usuário já logado | Fazer login, abrir `/register` | Redireciona para `/dashboard` |
| 13 | Registro com campos válidos | Preencher todos os campos, clicar Sign Up | Cria usuário e redireciona para `/dashboard` |
| 14 | Registro com email inválido | Inserir email mal formatado | Exibe erro de validação |
| 15 | Registro com senha curta | Inserir senha com menos de 6 caracteres | Exibe erro de validação |
| 16 | Registro com campos vazios | Clicar Sign Up sem preencher | Não permite envio |
| 17 | Link para Login | Clicar "Sign in" | Navega para `/login` |
| 18 | Validação phone opcional | Registrar sem phone | Registro succeede |

---

## Dashboard (`/dashboard`)

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|--------------------|
| 19 | Acesso não autenticado | Acessar sem login | Redireciona para `/login` |
| 20 | Exibição de nome | Fazer login | Nome do usuário aparece no header |
| 21 | Exibição de nível | Login com usuário de nível definido | Nível correto mostrado com cor |
| 22 | Badge de streak | Login com streak > 0 | Número de dias streak visível |
| 23 | Total XP | Login | XP total do usuário visível |
| 24 | Barra Daily Goal | — | Barra de progresso com % correto |
| 25 | Quick Action — Voice Session | Clicar card Voice Session | Navega para `/conversation` |
| 26 | Quick Action — Level Test | Clicar card Level Test | Navega para `/placement-test` |
| 27 | Missões Diárias visíveis | — | Lista de 3 missões com progresso |
| 28 | Progresso missão atualiza | Completar uma lição | Missão de lição marca como completa |
| 29 | Achievements grid visível | — | Grid com todas as conquistas |
| 30 | Conquistas desbloqueadas | Usuário com conquistas | Ícones coloridos para desbloqueados |
| 31 | Conquistas trancadas | Usuário novo | Ícones em opacity 40% |
| 32 | Link Retest nível | Clicar (Retest) | Navega para `/placement-test` |

---

## Learning Path (`/lessons`)

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|--------------------|
| 33 | Acesso não autenticado | Acessar sem login | Redireciona para `/login` |
| 34 | Lições ordenadas | — | Lições em ordem por `order` |
| 35 | Primeira lição desbloqueada | Usuário novo | Primeira lição sem cadeado |
| 36 | Lição trancada | Lição sem completar anterior | Cadeado visível, opacity reduzida |
| 37 | Lição completada | Lição já feita | Check verde visível |
| 38 | Lição em progresso | — | Ícone de play sem cor especial |
| 39 | Lição atual pulsando | Próxima lição disponível | Halo azul pulsando |
| 40 | Navegação para lição | Clicar em lição desbloqueada | Abre `/lessons/[id]` |
| 41 | Navegação negada | Clicar em lição trancada | Nada acontece (href="#") |

---

## Lição (`/lessons/[id]`)

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|--------------------|
| 42 | Progress bar | — | Barra de progresso atualiza a cada questão |
| 43 | Multiple Choice — acerto | Selecionar resposta correta, Check | Feedback verde, pontua |
| 44 | Multiple Choice — erro | Selecionar resposta errada | Feedback vermelho, salva vocabulário |
| 45 | Fill in Blank — acerto | Digitar resposta correta (case insensitive) | Feedback verde |
| 46 | Fill in Blank — erro | Digitar resposta errada | Feedback vermelho, vocabulário salvo |
| 47 | Drag and Drop — acerto | Arrastar palavras na ordem correta | Feedback verde |
| 48 | Drag and Drop — erro | Arrastar na ordem errada | Feedback vermelho |
| 49 | Explicação visível | Após checar resposta | Explicação do exercício visível |
| 50 | Botão Check desabilitado | Sem selecionar/resposta vazia | Botão "Check Answer" desabilitado |
| 51 | Completion screen | Responder todas as questões | Tela de "Lesson Complete!" com XP |
| 52 | XP awarded | Completar lição | XP adicionado ao total |
| 53 | Voltar ao Path | Clicar "Back to Path" | Navega para `/lessons` |
| 54 | Vocabulário salvo | Errar resposta | Palavra salva na aba Vocabulary |

---

## Conversation (`/conversation`)

| # | Teste | Passes | Resultado Esperado |
|---|-------|--------|--------------------|
| 55 | Acesso não autenticado | Acessar sem login | Redireciona para `/login` |
| 56 | Permissão microfone | Primeirp clique no mic | Browser solicita permissão |
| 57 | Gravação inicia | Clicar mic | Indicador de gravação aparece |
| 58 | Temporizador | Durante gravação | Tempo decorrido visível |
| 59 | Gravação para | Clicar quadrado (stop) | Para gravação, envia para STT |
| 60 | STT funciona | Gravar algo em inglês | Transcrição aparece como mensagem do usuário |
| 61 | STT sem áudio | Gravar silêncio | Mensagem removida, permanece disponível |
| 62 | Chat responde | Aguardar resposta da IA | Resposta da Miss Ana aparece |
| 63 | TTS executa | Resposta chega | Áudio da IA toca automaticamente |
| 64 | Histórico de mensagens | Conversar várias vezes | Mensagens acumulam na tela |
| 65 | Navegação para dashboard | Clicar seta para trás | Volta para `/dashboard` |
| 66 | Loading state | Durante processamento | Spinner "Analyzing speech..." visível |

---

## Vocabulário (`/vocabulary`)

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|--------------------|
| 67 | Acesso não autenticado | Acessar sem login | Redireciona para `/login` |
| 68 | Empty state | Usuário sem vocabulário | Mensagem "No vocabulary yet" + link para Lessons |
| 69 | Lista de palavras | — | Lista com palavra riscada → correção |
| 70 | Expandir palavra | Clicar em palavra | Expande mostrando explicação |
| 71 | Colapsar palavra | Clicar novamente | Fecha expansão |
| 72 | Data da palavra | — | Data de adição visível |
| 73 | Source visível | — | Origem (lesson/conversation) visível |
| 74 | Ordenação | Adicionar mais palavras | Ordenação por data (mais recente primeiro) |

---

## Histórico de Conversas (`/conversations`)

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|--------------------|
| 75 | Acesso não autenticado | Acessar sem login | Redireciona para `/login` |
| 76 | Empty state | Usuário sem conversas | Mensagem "No conversations yet" |
| 77 | CTA para conversation | Empty state | Botão "Start Conversation" navega para `/conversation` |
| 78 | Lista de conversas | — | Lista ordenada por data |
| 79 | Info da conversa | — | Data e contagem de mensagens visíveis |
| 80 | Primeira mensagem | — | Preview da primeira mensagem visível |
| 81 | Navegação para conversa | Clicar em conversa | Abre conversa (carrega histórico) |

---

## Placement Test (`/placement-test`)

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|--------------------|
| 82 | Acesso não autenticado | Acessar sem login | Redireciona para `/login` |
| 83 | 10 perguntas | — | Teste contém exatamente 10 perguntas |
| 84 | Progress bar | Avançar questão | Barra atualiza corretamente |
| 85 | Seleção de resposta | Clicar opção | Opção fica selecionada com borda primary |
| 86 | Feedback após checar | — | Correto/incorreto + explicação visível |
| 87 | Avançar questão | Clicar Next | Próxima questão aparece |
| 88 | Resultado Beginner | Acertar <50% | Nível Beginner definido |
| 89 | Resultado Intermediate | Acertar 50-79% | Nível Intermediate definido |
| 90 | Resultado Advanced | Acertar ≥80% | Nível Advanced definido |
| 91 | Tela de resultado | Finalizar teste | Nível + score + botão para dashboard |
| 92 | Nível salvo | Fazer retest após resultado | Novo nível sobrescreve o anterior |

---

## Profile (`/profile`)

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|--------------------|
| 93 | Acesso não autenticado | Acessar sem login | Redireciona para `/login` |
| 94 | Link para Conversations | Clicar card Conversations | Navega para `/conversations` |
| 95 | Link para Vocabulary | Clicar card Vocabulary | Navega para `/vocabulary` |
| 96 | Logout | Clicar Log Out | Desloga e redireciona para `/login` |

---

## Gamificação

### Missões Diárias
| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|--------------------|
| 97 | Reset à meia-noite | Completar missões, verificar dia seguinte | Missões resetam para 0 |
| 98 | Missão de lição | Completar uma lição | Missão "Complete a Lesson" completa |
| 99 | Missão de conversa | Praticar 5+ minutos | Missão "Practice Speaking" progride |
| 100 | Missão de vocabulário | Errar exercícios | Missão "Review Vocabulary" progride |
| 101 | Missão completa | target atingido | Check verde + badge |
| 102 | Todas completas | Completar as 3 | Bônus +50 XP + mensagem |
| 103 | Progresso persiste | Refresh na página | Progresso das missões mantido |

### Achievements
| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|--------------------|
| 104 | First Lesson | Completar primeira lição | 🌟 Primeira Lição desbloqueado |
| 105 | First Conversation | Primeira conversa | 🗣️ Primeira Conversa desbloqueado |
| 106 | 100 Words | 100 palavras no vocabulário | 📚 100 Palavras desbloqueado |
| 107 | 7-Day Streak | 7 dias consecutivos | 🔥 7 Dias de Streak desbloqueado |
| 108 | XP reward | Conquista desbloqueada | XP adicionado ao total |

---

## APIs

| # | Teste | Endpoint | Método | Payload | Resultado Esperado |
|---|-------|----------|--------|---------|--------------------|
| 109 | STT retorna texto | `/api/transcribe` | POST | FormData c/ audio | `{ text: "..." }` |
| 110 | STT sem arquivo | `/api/transcribe` | POST | Sem audio | 400 error |
| 111 | TTS retorna áudio | `/api/speak` | POST | `{ text: "hello" }` | Audio MP3 binary |
| 112 | TTS sem texto | `/api/speak` | POST | Sem text | 400 error |
| 113 | Complete lesson | `/api/lessons/complete` | POST | lessonId, xpReward | Success + achievements |
| 114 | Track time | `/api/track-time` | POST | minutes | Streak e minutos atualizados |
| 115 | Daily missions GET | `/api/daily-missions` | GET | — | Lista de missões |
| 116 | Daily missions POST | `/api/daily-missions` | POST | type | Progresso atualizado |
| 117 | Achievements check | `/api/achievements/check` | POST | — | Novas conquistas array |
| 118 | Chat — new conversation | `/api/chat` | POST | messages, userName | reply + conversationId |
| 119 | Chat — existing conversation | `/api/chat` | POST | com conversationId | appends messages |
| 120 | Unauthorized | Qualquer API | — | Sem auth | 401 Unauthorized |

---

## Navegação

| # | Teste | Passos | Resultado Esperado |
|---|-------|--------|--------------------|
| 121 | Bottom nav — Home | Cliclar Home | Navega para `/dashboard` |
| 122 | Bottom nav — Path | Cliclar Path | Navega para `/lessons` |
| 123 | Bottom nav — Tutor | Cliclar Tutor | Navega para `/conversation` |
| 124 | Bottom nav — Words | Cliclar Words | Navega para `/vocabulary` |
| 125 | Bottom nav — Profile | Cliclar Profile | Navega para `/profile` |
| 126 | Navegação ativa | Estar em `/lessons` | Bottom nav marca Path como ativo |

---

## Responsividade

| # | Teste | Dispositivo | Resultado Esperado |
|---|-------|-------------|--------------------|
| 127 | Mobile viewport | 375px width | Layout otimizado para mobile |
| 128 | Tablet viewport | 768px width | Layout se adapta |
| 129 | Desktop viewport | 1280px width | Max-width 448px no container |

---

## Notas de Execução

- **Pré-condição**: Configurar `.env` com credenciais válidas (Supabase, Anthropic, OpenAI)
- **Banco de dados**: Executar migrations antes dos testes (`pnpm drizzle-kit push`)
- **Seed**: Garantir que `daily_missions` tem dados (`node migrations/005_gamification.js`)
- **Microfone**: Testes de voz requerem HTTPS ou localhost
- **Ordem sugerida**: Landing → Register → Login → Dashboard → Lessons → Lição → Vocabulary → Conversation → Conversations → Placement Test → Profile → Gamificação
