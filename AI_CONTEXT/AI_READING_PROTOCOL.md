# AI COGNITIVE READING PROTOCOL — PNAP-AO
*Portal Nacional de Administração Penitenciária — República de Angola*
*Strict AI Rules for Targeted Reading, Token Conservation and Regression Protection*

---

## 1. MANDATORY SURGICAL READING RULES

To prevent breaking existing routines, deleting imports, or causing token exhaustion in massive project sheets, the AI **must** comply with this five-step cognitive protocol before every code access:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. SEARCH FIRST (GREP MANDATE)                                              │
│    Run grep -n "keyword" to find exact line locations.                      │
│    Never call view_file on a large file without knowing line numbers.       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. CHUNK-BASED READS (PREFER PARTIAL READS)                                 │
│    Prefer partial reads (typically 100–200 lines) whenever possible.        │
│    Only view the exact line slice needed (e.g., StartLine: 7400, EndLine:   │
│    7550). Reading wider slices consumes useless context.                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. MATCH EXACT ANCHORS                                                      │
│    Ensure TargetContent in edit_file has a unique structural comment anchor │
│    or unique variable declaration to avoid colliding with other blocks.     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. ISOLATE EXPERIMENTS IN STANDALONE FILES                                  │
│    Always create new complex panels in separate files inside                │
│    /src/components/. Integrate them with a single line inside App.tsx.      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. PRESERVE ORIGINAL STATES                                                 │
│    Keep preexisting roles, types, and permissions intact. NEVER wipe out    │
│    unrelated modules.                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. HOW TO SOLVE "TARGET CONTENT NOT FOUND" IN LARGE FILES

If an editing tool throws a search/replacement error:
1.  **Do not try to guess**: Immediately invoke `view_file` targeting the specific line range that failed.
2.  **Match Indentation Exactly**: Whitespace, indentation tabs, and commas must match the output of `view_file` character for character.
3.  **Include Parent Brackets**: Always expand the `TargetContent` block slightly to include closed parent brackets, guaranteeing syntactic completeness.

---
*This protocol is an absolute constraint. Any violation of these limits leads to token overflow.*
