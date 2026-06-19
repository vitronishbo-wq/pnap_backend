---
version: 1
enforce: true
owners:
  - platform-team
last_updated: 2026-06-09
ci_check: .github/workflows/verify-agent-rules.yml
---

SILA Workspace

Root: /home/dev03wsl/pnap_backend

Modules:
  - backend: Express API, JWT auth, RBAC, backoffice
  - database: Prisma schema and seed data for penitentiary domain
  - frontend: Vite + React SPA UI and report generation
  - config: project metadata, environment variables, and build settings

Architecture: Fullstack Express + Vite React with Prisma-backed PostgreSQL and JWT-based role access control. The backend is separated from the SPA, and Prisma defines the canonical domain model for penitentiary operations.

BOOTSTRAP OBRIGATÓRIO

Carregar e seguir AGENT_RULES.md antes de qualquer ação.

Fontes de verdade

docs/tree.json

docs/tree.modules.json

Comandos principais

- `npm run dev`
- `npm run build`
- `npm start`
- `make update-indexes`
- `make daily-audit`

# Regras do núcleo
- Veja: Priorize investigação em `server.ts`, `server/controllers/`, `server/middleware/rbac.middleware.ts`, e `prisma/schema.prisma`.
- Veja: A autenticação e geração de JWT estão em `server/controllers/auth.controller.ts`.
- Veja: A autorização e escopos de backoffice estão em `server/controllers/backoffice.controller.ts`.
- Veja: Models de domínio e relações canônicas residem em `prisma/schema.prisma`.
- Veja: A interface de usuário e o fluxo frontend estão em `src/App.tsx`, `src/main.tsx`, e `src/components/`.
- Veja: Variáveis críticas estão no `.env` e dependências no `package.json`.
- Veja: Use `docs/tree.json` para navegar pela estrutura do projeto e `docs/tree.modules.json` para módulos principais.
