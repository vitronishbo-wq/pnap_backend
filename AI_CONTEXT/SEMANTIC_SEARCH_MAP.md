# SEMANTIC SEARCH MAP — PNAP-AO
*Portal Nacional de Administração Penitenciária — República de Angola*
*Semantic Key Translations to Physical Source Codes and UI Panels*

---

## 1. KEYWORD-TO-COMPONENT TRANSLATION DICTIONARY

Use this translation matrix when the user uses colloquial terms to instantly identify the physical file and the active tab key:

| Colloquial Portuguese Term | Technical English Concept | Target Source File | Global Tab Key (`activeTab`) |
| :--- | :--- | :--- | :--- |
| **"cela"**, **"admissão"**, **"bloco"** | Cell Allocation, Triage, Intake | `/src/App.tsx` (Admissions section) | `admissions` |
| **"escolta"**, **"trânsito"**, **"comboio"** | Prisoner Escort Transfers, Convoy | `/src/App.tsx` (Movements section) | `movements` |
| **"ataque"**, **"hacker"**, **"siem"**, **"logs"** | Security Threats, Intrusion SIEM | `/src/components/IntelligenceCenter.tsx` | `centro-inteligencia` |
| **"guia"**, **"soltura"**, **"mandado"** | Court Release Mandate, Warrants | `/src/App.tsx` (Documents section) | `documents` |
| **"mapa"**, **"pir"**, **"motim"**, **"gps"** | Tactical GeoMap, Riot Containment | `/src/components/NationalCommandCenter.tsx`| `centro-comando` |
| **"assinatura"**, **"diretor"**, **"soberania"** | Supreme Governance, Master Override | `/src/components/DeusFundadorPanel.tsx` | `deus-fundador` |
| **"médico"**, **"triage"**, **"clínico"** | Medical Records, Quarantine | `/src/components/HealthModule.tsx` | `dashboard` (sub-tab) / admissions |
| **"guardas"**, **"rh"**, **"turno"** | Guards Roster, Shift Allocations | `/src/components/RHIndicatorsPanel.tsx` | `sandbox` / `settings` |

---

## 2. INTUITION ROUTING RULES

1.  If the request references **"segurança de rede"** (network security), **"fraude"** (fraud), or **"rastreamento"** (tracking logs), instantly route to `IntelligenceCenter.tsx`.
2.  If the request references **"contingência"** (emergency operations) or **"pir"** (rapid deployment forces), instantly route to `NationalCommandCenter.tsx`.

---
*Maintained to ensure immediate semantic resolution and eliminate exploration overhead.*
