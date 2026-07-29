# SYSTEM DEPENDENCY GRAPH — PNAP-AO
*Portal Nacional de Administração Penitenciária — República de Angola*
*Visual Component Tree & Structural Inheritance Graph*

---

## 1. COMPONENT HIERARCHY TREE

This tree shows how UI components inherit states and props. A change in parent nodes has absolute cascading consequences for child elements:

```
                      [App.tsx (Global State Owner)]
                                    │
    ┌────────────────┬──────────────┼──────────────┬────────────────┐
    ▼                ▼              ▼              ▼                ▼
[Dashboard]     [CNC Map]       [SIEM Center]  [Admissions]    [Audit Consola]
    │                │              │              │                │
    ├─►StatCard      ├─►VectorMap   ├─►RuleLedger  ├─►TriageForm    └─►DiffViewer
    ├─►ChartCard     ├─►GPSTracker  ├─►RiskProfile └─►CellGrid
    └─►RiskMap       └─►DispatchPIR └─►AttackSim
```

---

## 2. STRUCTURAL DATA INHERITANCE MAP

Before modifying any state definition in `App.tsx`, verify how child components consume it:

```
  App.tsx State Variable  ────►  Consumed By Component  ────►  Expected Action
  ─────────────────────────────────────────────────────────────────────────────
  inmates (Array)              Admissions, CNC Map,          Read & Filter, Update Cell 
                               IntelligenceCenter            Positions and Threat Score

  prisons (Array)              Dashboard, CNC Map,           Display capacity, Trigger
                               ServicesGatewayPanel          prison alarms and containment

  logs (Array)                 IntelligenceCenter,           Render log audits, perform
                               DeusFundadorPanel             hash-verification diffs

  currentOperator (Object)     All standalone panels         RBAC validation, signature
                                                             stamping on audit logs
```

---

## 3. IMPACT PREDICTION PROTOCOLS (DEFENSIVE CODING)

1.  **Strict Prop Protection**: If you need to add a prop to a child component (e.g., `IntelligenceCenter`), check this map to ensure you also update its instantiation inside `/src/App.tsx`.
2.  **Shared State Mutations**: Never allow a child component to mutate parent arrays directly. Always execute updates using wrapper callback hooks (e.g., `writeAuditLog`, `updateInmateCell`) provided by the root `App.tsx`.

---
*Maintain this inheritance map clean to avoid side-effects and runtime compiler failures.*
