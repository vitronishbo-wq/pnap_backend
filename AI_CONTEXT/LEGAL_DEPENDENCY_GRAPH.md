# LEGAL DEPENDENCY GRAPH — PNAP-AO
*Análise de Rastreabilidade Técnica entre Diplomas Legais e Componentes de Software*

---

## 1. DEPENDÊNCIAS DE COMPONENTES POR ARTIGO

| Norma Legal / Tratado | Função do Sistema | Componente de Software | Ficheiro de Estado / Store |
| :--- | :--- | :--- | :--- |
| **Dec. 184/17 - Art. 1º & 3º** | Definições Orgânicas Gerais | `LegislationModule.tsx` | `src/components/LegislationModule.tsx` |
| **Dec. 184/17 - Art. 5º** | Autoridade Máxima e Acesso | `App.tsx` (Menu Geral) | `src/App.tsx` (RBAC `DIRECTOR_GERAL`) |
| **Dec. 184/17 - Art. 27º** | Auditoria e Alertas Tácticos | `NationalCommandCenter.tsx` | `src/components/NationalCommandCenter.tsx` |
| **Dec. 184/17 - Art. 29º** | Controlo de Guias & Cadastro | `Admissions` / `InmatesList` | `src/App.tsx` (`activeTab === "admissions"`) |
| **Dec. 184/17 - Art. 33º** | Triagem Médica e Prontuário | `HealthModule.tsx` | `src/components/HealthModule.tsx` |
| **Lei 38/20 - Código Penal** | Perigosidade / Lotação de Celas | `EstablishmentDirectorDashboard` | `src/components/EstablishmentDirectorDashboard.tsx` |
| **Regras Nelson Mandela - Reg. 12** | Alerta de Sobrelotação Crítica | `RiskMapDashboard` | `src/components/RiskMapDashboard.tsx` |
| **Regras Nelson Mandela - Reg. 24** | Auditorias Clínicas de Ingresso | `HealthModule.tsx` | `src/components/HealthModule.tsx` |
| **Regras Nelson Mandela - Reg. 74** | Registo e Histórico de Visitas | `VisitorRegistrationForm` | `src/App.tsx` (`visitors` state database) |

---

## 2. MECANISMO DE TRAÇABILIDADE CODE-TO-LAW
Sempre que uma nova funcionalidade técnica for adicionada em qualquer componente, deve-se incluir um comentário de metadados na cabeça do ficheiro declarando as suas bases normativas sob o formato:

```typescript
/**
 * @legalBasis Decreto Presidencial n.º 184/17, Artigo 29.º (Direcção de Controlo Penal)
 * @compliance Regras Mínimas de Nelson Mandela, Regra 7 (Registo do Prontuário)
 * @description Garante que cada recluso possui um cadastro eletrónico unificado inalterável.
 */
```

Isso garante a manutenção perpétua da rastreabilidade jurídica do código fonte angolano.
