# SYSTEM EVENTS & PROPAGATION MAP — PNAP-AO
*Portal Nacional de Administração Penitenciária — República de Angola*
*Pub/Sub Events, Audit Propagation, and Log-Triggered States*

---

## 1. SYSTEM EVENT PROPAGATION FLOW

Every critical tactical action in the system generates an event which propagates down to the audit trail and the SIEM engine to preserve non-repudiation:

```
  [1. OPERATIONAL EVENT INITIATED]  (Ex: Inmate admitted, PIR deployed, GPS Alert)
                 │
                 ▼
  [2. STATE SYNCHRONIZATION ENGINE] (Updates global states in App.tsx)
                 │
                 ▼
  [3. AUDIT LOGGER TRIGGERED]       (Involves writeAuditLog callback)
                 │
                 ▼
  [4. FORENSIC RECORD GENERATED]    (Appends structured entry to `logs` array)
                 │
                 ├──────────────────────────────┐
                 ▼                              ▼
  [5. SIEM CENTRAL COUPLING]       [6. DEUS FUNDADOR LEDGER]
  (IntelligenceCenter registers    (Director General verifies
   new operational log in real-     the block signature and
   time log table)                  calculates the SHA-256 hash)
```

---

## 2. REGISTERED TACTICAL EVENTS REFERENCE

Use the exact event keys and structures specified in this matrix when writing security logging events:

| Event Key | Trigger Domain | Description | Severity Stamp | Destination Module |
| :--- | :--- | :--- | :--- | :--- |
| `CELL_ADMISSION` | Admissions | New prisoner successfully assigned to a secure cell. | INFO / MEDIO | Audit Ledger, SIEM logs |
| `TACTICAL_ESCORT` | Movements | High-risk transfer convoy launched under military escort. | ALTO | Command Center Map |
| `INCIDENT_ALERT` | Command Center | Prison riot or emergency protocol declared at a facility. | CRITICO | CNC Map, PIR dispatch |
| `SECURITY_VIOLATION` | Intelligence | SIEM rule breach detected (Brute force, WAF intrusion, etc.)| CRITICO | SIEM Console, Audit |
| `MASTER_KEY_BYPASS` | Director General | Extraordinary executive action override (Amnesty, Override) | CRITICO | Deus Fundador Board |

---

## 3. IMPLEMENTATION CONTRACT FOR EVENT LOGGING

Whenever adding or refactoring a form or button that commits an action, you **must** append a logging transaction matching this format:

```typescript
writeAuditLog(
  currentOperator,
  "EVENT_KEY", // Standard Event Key from Section 2
  "AFFECTED_TABLE", // Ex: "INMATES", "SIEM", "PRISONS"
  affectedId, // ID of the entity mutated
  "Detailed human-readable audit description including location, operator ID, and action taken."
);
```

---
*Event logging integrity is the backbone of PNAP-AO non-repudiation. Do not omit event dispatches.*
