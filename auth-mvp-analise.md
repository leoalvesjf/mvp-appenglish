# Auth MVP - Análise Completa

## Visão Geral

Sistema de autenticação JWT com cookies httpOnly. Sem verificação de email nesta fase MVP.

---

## O Que Temos

### Backend (API Routes)

| Rota | Método | Arquivo | Status |
|------|--------|---------|--------|
| `/api/auth/register` | POST | `src/app/api/auth/register/route.ts` | OK |
| `/api/auth/login` | POST | `src/app/api/auth/login/route.ts` | OK |
| `/api/auth/logout` | POST | `src/app/api/auth/logout/route.ts` | OK |
| `/api/auth/me` | GET | `src/app/api/auth/me/route.ts` | OK |
| `/api/auth/confirm` | POST | `src/app/api/auth/confirm/route.ts` | LEGADO |
| `/api/auth/resend` | POST | `src/app/api/auth/resend/route.ts` | LEGADO |

### Frontend (Pages)

| Página | Arquivo | Status |
|--------|---------|--------|
| Login | `src/app/(auth)/login/page.tsx` | OK |
| Registro | `src/app/(auth)/register/page.tsx` | OK |
| Confirmação email | `src/app/auth/confirm/page.tsx` | LEGADO |

### Bibliotecas Core

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/auth/index.ts` | Funções: register, login, logout, getCurrentUser, confirmEmail, resendConfirmation, JWT generate/verify |
| `src/lib/auth/helpers.ts` | getAuthenticatedUserId, getAuthenticatedUser |
| `src/lib/auth/client.ts` | Hook useAuth (React) |
| `src/lib/rate-limit.ts` | Rate limiting em memória (5 req/15min por IP) |

### Proteção de Rotas

Rotas protegidas (requerem auth):

- `/api/voice/message`
- `/api/transcribe`
- `/api/speak`
- `/api/vocabulary`
- `/api/placement-test`
- `/api/track-time`
- `/api/lessons/complete`
- `/api/daily-missions`
- `/api/chat`
- `/api/achievements/check`

---

## Features Implementadas

### Registro (`/api/auth/register`)
- Validação de campos obrigatórios (email, password, name)
- Validação de senha mínima (6 caracteres)
- Rate limiting (5 tentativas / 15 minutos)
- Hash de senha com bcrypt (salt 12)
- Criação de usuário na tabela `auth_users`
- Criação automática de perfil em `users`
- Criação de progresso inicial em `userProgress`
- JWT gerado e salvo em cookie
- Email já definido como verificado (MVP)

### Login (`/api/auth/login`)
- Validação de campos obrigatórios
- Rate limiting (5 tentativas / 15 minutos)
- Verificação de credenciais (email + senha)
- JWT salvo em cookie com httpOnly, secure, sameSite=strict
- Expiração de 7 dias

### Logout (`/api/auth/logout`)
- Limpa cookie auth_token (maxAge = 0)
- JWT stateless — não há invalidação real (limitações documentadas)

### Me (`/api/auth/me`)
- Retorna dados do usuário logado (id, email, name)
- Retorna 401 se não autenticado

### Rate Limiting
- Em memória (Map)
- 5 tentativas por IP
- Janela de 15 minutos
- Auto-cleanup a cada 1 hora

---

## O Que FALTA para MVP

### 1. Validação de Formato de Email (Alta Prioridade)
**Problema:** Não há validação de regex para formato de email.
**Impacto:** Emails inválidos podem ser aceitos.
**Arquivo:** `src/app/api/auth/register/route.ts`, `src/app/api/auth/login/route.ts`

### 2. Remoção de Código Legado de Email (Média Prioridade)
**Problema:** Funções `confirmEmail`, `resendConfirmation` e rotas `/confirm`, `/resend` existem mas não são usadas no MVP.
**Impacto:** Manutenção desnecessária, código confuso.
**Arquivo:** `src/lib/auth/index.ts`, `src/app/api/auth/confirm/route.ts`, `src/app/api/auth/resend/route.ts`

### 3. Página de Logout (Média Prioridade)
**Problema:** O logout está implementado na API mas não existe página de logout. Usuário precisa deletar cookie manualmente.
**Impacto:** Usuário não consegue fazer logout facilmente.
**Solução:** Criar `src/app/(auth)/logout/page.tsx` ou adicionar botão de logout no header.

### 4. Página "Esqueci a Senha" (Média Prioridade)
**Problema:** Não há rota/funcionalidade para resetar senha.
**Impacto:** Usuário preso se esquecer senha.
**Arquivo a criar:** `src/app/api/auth/forgot-password/route.ts`, `src/app/(auth)/forgot-password/page.tsx`

### 5. Middleware de Autenticação Global (Média Prioridade)
**Problema:** Não há middleware Next.js que redirecione automaticamente para login em rotas protegidas.
**Impacto:** Rotas protegidas mostram tela de erro em vez de redirecionar para login.
**Arquivo a criar:** `src/middleware.ts`

### 6. Validação de Força de Senha (Baixa Prioridade)
**Problema:** Apenas verifica `length >= 6`. Não há validação de maiúsculas, números, caracteres especiais.
**Impacto:** Senhas fracas permitidas.
**Arquivo:** `src/app/api/auth/register/route.ts`

---

## Melhorias de Segurança (Pós-MVP)

| Item | Descrição |
|------|-----------|
| JWT Secret | Remover fallback fraco `your-secret-key-change-in-production` |
| Invalidação de Token | Implementar blacklist ou refresh tokens |
| CSRF | Garantir sameSite consistente em todos os cookies |
| Sanitização | Validar/sanitizar inputs (name, phone) |
| Phone Validation | Validar formato de telefone |
| 2FA | Autenticação em dois fatores |

---

## Resumo

| Categoria | Status |
|-----------|--------|
| Registro | Completo (MVP OK) |
| Login | Completo (MVP OK) |
| Logout | Funcional (falta UI) |
| Me | Completo |
| Rate Limiting | OK |
| Middleware Auth | Falta |
| Esqueci a Senha | Falta |
| Validação Email | Falta |
| Código Legado | Precisa limpar |

---

## Prioridade de Implementação

1. **Alta:** Middleware de autenticação + redirect para login
2. **Alta:** Validação de formato de email
3. **Média:** Botão de logout + página/logout
4. **Média:** Remover código legado de email verification
5. **Média:** Página "Esqueci a Senha"
6. **Baixa:** Validação de força de senha
7. **Baixa:** Validação de telefone
