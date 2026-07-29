# STATE GRAPH & MEMORY REGISTRY — PNAP-AO
*Portal Nacional de Administração Penitenciária — República de Angola*
*Global State Schema, Contexts, Hooks, and Cache Control Rules*

---

## 1. COMPREHENSIVE GLOBAL STATE MAP (ROOT STORES)

All core application states reside at `/src/App.tsx`. Do **NOT** duplicate these state variables locally inside child modules; consume them through props or wrappers to maintain a single source of truth (SSOT).

```
                             [App.tsx State Engine]
                                       │
     ┌──────────────────────┬──────────┴──────────┬──────────────────────┐
     ▼                      ▼                     ▼                      ▼
[Operational Arrays]  [Navigation Tab]   [Session State]       [Telemetry Controls]
 - inmates             - activeTab        - currentOperator     - liveAlarms
 - prisons             - dashboardSubTab  - loggedIn            - activeMapPin
 - logs                - isSidebarOpen    - sessionKeys         - pirStatus
```

---

## 2. STATE SCHEMA REFERENCE & MUTATION INTERFACES

Use this matrix to understand where states are declared, how they are structured, and the authorized handlers to update them:

| State Key | TypeScript Type | Purpose | Authorized Mutator Hook / Callback |
| :--- | :--- | :--- | :--- |
| `activeTab` | `"dashboard" \| "centro-comando" \| "centro-inteligencia" \| ...` | Directs viewport routing | `setActiveTab(tab)` |
| `inmates` | `Inmate[]` | All active penal dossiers in Angola | Set dynamically on admissions or transfer executions |
| `prisons` | `Prison[]` | Cell structures, limits, and locations | `setPrisons(updatedArray)` |
| `logs` | `AuditLog[]` | Cryptographic audit trail of the system | `writeAuditLog(...)` wrapper |
| `currentOperator` | `Operator` | Active authenticated military/civil user | Passed down to stamping wrappers for logging |

---

## 3. RULES FOR PREVENTING STATE DUPLICATION

1.  **No Double Buffering**: Do not copy parent arrays (like `inmates`) into local child state hooks (`useState`) simply to filter or sort them. Use React `useMemo` hooks inside the child component to perform lightweight, reactive, in-memory computations on props instead.
2.  **No Hidden Mutation Hooks**: Children must never update props. Any change to a global state variable **must** trigger an execution callback provided by the parent.

---
*Adherence to the State Graph guarantees memory efficiency and smooth UI reactivity.*
