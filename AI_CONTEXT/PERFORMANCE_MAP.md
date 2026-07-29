# PERFORMANCE MAP & SCALE CONTROLS — PNAP-AO
*Portal Nacional de Administração Penitenciária — República de Angola*
*Large File Optimization, Memory Limits and Token Saving Techniques*

---

## 1. FILE SIZE WARNING INDEX (CRITICAL THRESHOLDS)

The PNAP-AO codebase contains several highly specialized files that approach compiler and context limits. Exercise maximum discipline when dealing with these targets:

*   **`src/App.tsx` (SIZE: >23,000 lines, >1.4MB)**:
    *   *Risk*: Token overflow, slow response time, missing block insertions.
    *   *Mitigation*: **CRITICAL**. Never read or write this file in its entirety. Always locate target areas using `grep` or specific line slices (e.g., lines 1360 to 1400) first.
*   **`src/components/NationalCommandCenter.tsx`**:
    *   *Risk*: High-density geographic vector paths can lag when updating states frequently.
    *   *Mitigation*: Wrap coordinates and geo-polygons in `useMemo` so they compile once and are bypassed by the React re-render queue.

---

## 2. TOKEN OPTIMIZATION STRATEGIES (SAVING COGNITIVE COMPUTES)

When executing file operations on high-density files, the AI Agent must prioritize performance:

```
  [User requests feature in App.tsx]
                 │
                 ▼
  [Do NOT run view_file on whole App.tsx!]
                 │
                 ▼
  [Step 1: Execute grep -n to find target anchors]
                 │
                 ▼
  [Step 2: Read ONLY the 50-100 lines surrounding the target anchor]
                 │
                 ▼
  [Step 3: Draft replacement content focusing precisely on targeted lines]
                 │
                 ▼
  [Step 4: Execute surgical edit_file targeting exact lines]
```

---

## 3. COMPONENT DIVISION PROTOCOLS (PRESERVING COMPILER BOUNDS)

1.  **Extract Logical Subsections**: When a module in `App.tsx` reaches complex sizes, **extract it immediately** into a new file inside `/src/components/`.
2.  **Strict Hook Memoization**:
    *   Avoid placing raw arrow functions inside props (e.g., `onClick={() => setTab("x")}` is acceptable, but deep data-mapping inline functions should be stabilized outside the return block or wrapped inside `useCallback`).
    *   Keep state structures as flat as possible.

---
*Optimizing performance is an engineering requirement, not an afterthought. Minimize the footprint.*
