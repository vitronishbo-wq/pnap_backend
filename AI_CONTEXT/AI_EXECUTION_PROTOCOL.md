# AI COGNITIVE EXECUTION PROTOCOL — PNAP-AO
*Portal Nacional de Administração Penitenciária — República de Angola*
*The Active Cognitive Engine: How the AI Agent Must Process, Edit, and Complete Every Request*

---

## 1. THE ACTION-TURN PIPELINE (OBLIGATORY CYCLE)

Every time you receive a prompt or task regarding the PNAP-AO codebase, you **must** execute this sequence of operations. This protocol acts as your cognitive Operating System (AIOS) to minimize token consumption and avoid architectural regressions.

```
                  [USER REQUEST RECEIVED]
                             │
                             ▼
              [STEP 1: CLASSIFY THE DOMAIN]
   - Consult `/AI_CONTEXT/SEMANTIC_SEARCH_MAP.md` to map Portuguese keys
     to technical features and files.
                             │
                             ▼
             [STEP 2: GATHER MINIMAL CONTEXT]
   - Open `/AI_CONTEXT/INDEX.md` to identify the files needed.
   - ONLY view the specific parts of relevant files (use partial reads).
                             │
                             ▼
             [STEP 3: CALCULATE SYSTEM IMPACT]
   - Consult `/AI_CONTEXT/DOMAIN_GRAPH.md` and `/AI_CONTEXT/DEPENDENCY_GRAPH.md`.
   - Map risks of regression using `/AI_CONTEXT/RISK_MATRIX.md`.
                             │
                             ▼
               [STEP 4: AUDIT & SECURITY CHECK]
   - Consult `/AI_CONTEXT/SECURITY_MODEL.md` to check if RBAC or forensic
     signatures (`writeAuditLog`) are affected.
                             │
                             ▼
              [STEP 5: EXECUTE SURGICAL EDITS]
   - Read `/AI_CONTEXT/AI_READING_PROTOCOL.md` to apply targeted edits.
   - Use `edit_file` or `multi_edit_file` to modify exact lines with anchors.
                             │
                             ▼
               [STEP 6: VALIDATE SINTAX & BUILD]
   - Run `/AI_CONTEXT/TESTING_PROTOCOL.md`.
   - Execute `lint_applet` followed by `compile_applet`.
                             │
                             ▼
              [STEP 7: RECORD THE NEW STATE]
   - Append changes to `/AI_CONTEXT/PROJECT_STATE.md`.
   - Update `/AI_CONTEXT/CHANGELOG_AI.md`.
                             │
                             ▼
                [STEP 8: TURNS CONCLUDED]
   - Summarize work cleanly in professional, objective, high-level terms.
```

---

## 2. THE COGNITIVE RECOVERY CYCLE (HANDLING COMPILER ERRORS)

If a linting or compilation task fails during your turn, initiate this recovery routine:
1.  **Read the Error Output**: Do not speculate or blindly change lines. Identify the exact line and error description in the log output.
2.  **Inspect Dependencies**: Look for mismatched interface contracts or props using `/AI_CONTEXT/API_CONTRACTS.md`.
3.  **Perform Minimal Revision**: Make a precise edit to correct the type/import, verify again, and proceed with the checklist.

---
*By executing this protocol, you guarantee perfection and high-speed execution.*
│
*AUTONOMY LEVEL: SUPREME OPERATIONAL AIOS.*
