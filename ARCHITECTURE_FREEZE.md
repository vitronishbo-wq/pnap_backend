# ARQUITETURA CONGELADA — SISTEMA PNAP-AO
**Ministério do Interior (MININT) — Direção Geral dos Serviços Penitenciários de Angola**  
*Padrão Institucional Oficial: Dual-Track Resilience & Strict Isolation*

---

## 1. Diagrama Canónico da Topologia Congelada

```text
                    GOOGLE AI STUDIO
                           │
                           ▼
                        GITHUB
                           │
                    push → main
                    ┌──────┴──────┐
                    ▼             ▼
              FIREBASE         RENDER
              HOSTING          API
                 │               │
                 │               ▼
                 │        Firebase Admin
                 │               │
                 └───────┬───────┘
                         ▼
                   CLOUD FIRESTORE
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        PWA / IndexedDB        Auditoria / Dados
        Offline-first          institucionais
```

---

## 2. Especificação e Responsabilidade de Cada Camada

### A. Repositório & CI/CD
- **Google AI Studio / GitHub (`main`)**: Fonte única do código-fonte versionado.
- **Deploy Trigger**: Cada `push` na branch `main` executa as pipelines de build estático (Firebase Hosting) e container Docker (Render API).

### B. Frontend PWA & Firebase Hosting
- **Firebase Hosting**: Entrega do cliente PWA com Service Worker, cache de assets e cabeçalhos de segurança (CSP, HSTS, TLS 1.3).
- **Client SDK**: Conexão direta ao Cloud Firestore para operações do dia a dia (leitura de fichas, prontuários de saúde, relatórios de reinserção social).
- **IndexedDB Multi-Tab**: Persistência e fila de mutações offline com replay monotónico automático ao restabelecer conexão.

### C. Backend Institucional & Render API
- **Render API**: Endpoint seguro HTTPS em Node.js/Express (`/api/*`).
- **Firebase Admin SDK**: Instância inicializada com credenciais de Service Account para execução de privilégios elevados.
- **Isolamento de Operações Críticas**:
  - Guias de Transferência Inter-Penitenciária (`POST /api/transfers`)
  - Despachos de Soltura e Liberdade Condicional (`POST /api/inmates/release`)
  - Mutações de Nível de Risco e Segurança Máxima (`PATCH /api/inmates/security-level`)
  - Selo Criptográfico Forense SHA-256 HMAC (`POST /api/audit/seal`)
- **Garantia Anti-Falso-Offline**: Falhas HTTP 502/503/504 no Render são reportadas como `SERVER_ERROR` e jamais degradam a aplicação para modo offline.

### D. Cloud Firestore (Fonte Única de Verdade)
- **Multi-Region Database**: `ai-studio-pnapao` / `(default)`.
- **Coleções Canónicas**:
  - `reclusos`: Fichas e registos individuais.
  - `estabelecimentos`: Unidades prisionais e blocos.
  - `prontuarios_saude`: Atendimentos médicos e biometria.
  - `planos_reinsercao`: Formação e atividades laborais.
  - `auditoria_logs`: Registo de eventos com regras estritas de não-repúdio (proibição de `update` e `delete`).
- **PostgreSQL Eliminado**: 0 resíduos relacionais legados. Shards gerenciados nativamente no Firestore.

---

## 3. Matriz de Separação Dual-Track (Normais vs. Críticas)

| Critério | 1. Operações Normais (Direto ao Firestore) | 2. Operações Críticas (Render → Firebase Admin) |
| :--- | :--- | :--- |
| **Canal de Trânsito** | PWA Client SDK → Firestore | PWA Client → Render API Gateway → Admin SDK |
| **Exemplos** | Consultas, Triagem, Fichas de Saúde, Cursos | Transferências, Solturas, Nível de Risco, Selo SHA-256 |
| **Persistência Offline** | Suportada via IndexedDB com sincronização | Não permitida offline (exige confirmação server-side) |
| **Latência Típica** | 10ms – 18ms | 25ms – 40ms (com assinatura criptográfica) |
| **Autorização** | Firestore Security Rules + Custom Claims | Token Bearer JWT + Validação IAM Service Account |

---

## 4. Estado de Governança e CI/CD

- **Status Arquitetural**: **Architecture Freeze — Configuração consolidada, pendente confirmação operacional end-to-end**.
- **Regra de Pipeline CI/CD**:
  - O CI/CD no GitHub Actions executa estritamente: `npm ci` → `npm run build:client` → `deploy`.
  - O `package-lock.json` é mantido, gerado e sincronizado exclusivamente em ambiente de desenvolvimento versionado no repositório.
  - Eliminação de qualquer comando `npm install --package-lock-only` no pipeline de deploy.
- **Roteamento de Produção**:
  - Frontend servido via Firebase Hosting (`https://pnap-ao.web.app`).
  - Chamadas de API críticas direcionadas exclusivamente para a URL do Render (`VITE_API_URL`), sem trânsito por `pnap-ao.web.app/api/*`.
- **Eliminação Integral de Persistência Paralela**: 0 dependências de PostgreSQL, Prisma, Redis, Docker Compose ou Bun.

---

*Arquitetura auditada, consolidada e congelada conforme as diretrizes do Ministério do Interior.*
