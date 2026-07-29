# DOMAIN DEPENDENCY GRAPH — PNAP-AO
*Portal Nacional de Administração Penitenciária — República de Angola*
*Functional Domains, Boundaries and Cascade Impact Matrix*

---

## 1. THE DOMAIN FLOW

The application logic propagates linearly from intake to release. Any modification to an upstream domain (e.g., admissions) will trigger Cascade Impacts down the flow. Use this graph to identify affected downstream domains:

```
  [1. ADMISSIONS / ADMISSÃO] ──► Biometria, Triagem Médica, Alocação de cela
             │
             ▼
  [2. PENAL CODE / CÓDIGO PENAL] ──► Validação de crimes, Penas aplicadas, Reduções
             │
             ▼
  [3. DOCUMENTS / GUIAS] ──► Mandados, Guias de soltura, Certificados com assinatura
             │
             ▼
  [4. MOVEMENTS / TRÂNSITO] ──► Escoltas táticas, Rotas PIR, GPS, Transferências
             │
             ▼
  [5. INTELLIGENCE (SIEM)] ──► Correlação de ameaças, Log de tráfego, Auditoria de repúdio
             │
             ▼
  [6. COMMAND CENTER (CNC)] ──► Matriz de incidentes prisionais, Forças Especiais (PIR)
```

---

## 2. CASCADE IMPACT & DEPENDENCY MATRIX

Before editing a domain, find it in the table below to determine which other files or components **must** be cross-checked:

| Edited Domain | Direct Dependencies | Downstream Impact | Required Cross-Check Files |
| :--- | :--- | :--- | :--- |
| **Admissions (Admissão)** | `RiskMapDashboard.tsx`, `HealthModule.tsx` | SIEM, Documents, Command Center | Verify cell capacity states and audit logs in `App.tsx` |
| **Penal Code (Código Penal)** | Core calculation utils in `App.tsx` | Documents (solturas), Movements | Verify automatic release timers and active inmate arrays |
| **Documents (Guias & Docs)** | `DeusFundadorPanel.tsx` (Signatures) | SIEM, Audit, Admissions | Check cryptographic signatures and non-repúdio logs |
| **Movements (Movimentações)**| `NationalCommandCenter.tsx` (Map, Routes) | SIEM, Command Center | Check GPS telemetry updates and active tactical transfer state |
| **Intelligence (SIEM)** | `IntelligenceCenter.tsx`, `App.tsx` (writeAuditLog) | Audit Console, Security Logs | Verify rule indexes (`RULE-01` to `RULE-05`) and quarantine states |
| **Command Center (CNC)** | `NationalCommandCenter.tsx`, GPS logs | SIEM, Movements, Admissions | Verify active riots status and rapid deployment force state |

---
*Always consult the Domain Graph before initiating database or state mutations.*
