# ARCHITECTURAL DECISION RECORDS (ADR) — PNAP-AO
*Portal Nacional de Administração Penitenciária — República de Angola*
*Permanent Engineering Standards, Design Commitments, and Invariant Decisions*

---

## ADR-001: CLIENT-SIDE RECONSTRUCTION WITH IN-MEMORY FORENSICS
*   **Context**: The application manages critical secure operational flows (prison occupancy, escort transfers, health triages, and SIEM detections). Setting up complex distributed live cloud backends would complicate instant previewing within the development frame.
*   **Decision**: Maintain a fully client-side architecture (React + Vite) with deep, real-time in-memory databases and cryptographic simulation libraries. All actions must be modeled with real logic (no placeholders or mocked statics) and be fully editable within the current view session.
*   **Consequence**: High fidelity, immediate load times, and perfect offline-first operations. All state changes propagate dynamically through the system components.

---

## ADR-002: CRYPTOGRAPHIC LOG NON-REPUDIATION INVARIANT
*   **Context**: National security standards require that no military operator or supervisor can alter previous logs without trace.
*   **Decision**: Implement a centralized `writeAuditLog` method inside `/src/App.tsx`. All security, admission, and deployment actions must generate a transaction entry with timestamp, operator ID, table, and detail stamp.
*   **Consequence**: The SIEM console (`IntelligenceCenter.tsx`) and the Director General panel can execute diff checks to ensure no operator can delete or change trace logs.

---

## ADR-003: ESTABLISHED VISUAL SPECTRUM DESIGN PROTOCOL
*   **Context**: To preserve visual polish and serious military look-and-feel.
*   **Decision**: Lock the interface in a deep charcoal dark mode (`slate-950` core canvas), accented with clean indicators (`rose-500` for security, `amber-500` for active alerts, `emerald-450` for operations).
*   **Consequence**: Prevents the introduction of colorful mismatched panels or unrequested light themes.

---
*No future AI model is authorized to revert or contradict these recorded decisions without explicit ministerial instructions.*
