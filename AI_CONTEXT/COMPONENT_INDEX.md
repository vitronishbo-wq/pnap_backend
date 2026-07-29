# COMPONENT INDEX — PNAP-AO
*Portal Nacional de Administração Penitenciária — República de Angola*
*Physical Directory Index, Component Mappings, and Core Subsystems*

---

## 1. NÚCLEO ORQUESTRADOR DE ESTADOS (ROOT CONTAINER)

*   **File**: `/src/App.tsx`
    *   *Role*: Absolute state owner, main router (`activeTab`), RBAC policy engine (`isTabVisible`), global data providers, and central modal/dialog handlers.
    *   *Token Strategy*: This file is extremely large (>23,000 lines). **NEVER** read it completely. Always query specific anchor ranges using `AI_READING_PROTOCOL.md`.

---

## 2. COMPONENTES MODULARES TÁTICOS (`/src/components/*`)

This index lists the location, props, and responsibilities of every standalone module:

### 2.1. Security and Intelligence
*   **`IntelligenceCenter.tsx`**:
    *   *Path*: `/src/components/IntelligenceCenter.tsx`
    *   *Role*: SIEM engine, rule configuration panel, behavioral risk tracker, and cyber-attack simulation lab.
*   **`DeusFundadorPanel.tsx`**:
    *   *Path*: `/src/components/DeusFundadorPanel.tsx`
    *   *Role*: Supreme command dashboard for the Director General. Handles master keys, non-repudiation audits, and emergency protocols.

### 2.2. Cartography & Crisis Control
*   **`NationalCommandCenter.tsx`**:
    *   *Path*: `/src/components/NationalCommandCenter.tsx`
    *   *Role*: Vector maps of Angola, real-time vehicle GPS tracking, rapid dispatch force (PIR), and prison riot alerts.
*   **`RiskMapDashboard.tsx`**:
    *   *Path*: `/src/components/RiskMapDashboard.tsx`
    *   *Role*: Compliance matrix, inmate danger quotient visualization, and security cell allocation analyzer.

### 2.3. System Infrastructure & Audits
*   **`ServicesGatewayPanel.tsx`**:
    *   *Path*: `/src/components/ServicesGatewayPanel.tsx`
    *   *Role*: Service status hub, data replication lag graph, and server health checker.
*   **`ClusterConfigurationPanel.tsx`**:
    *   *Path*: `/src/components/ClusterConfigurationPanel.tsx`
    *   *Role*: Microservice load balancing, replication matrices, and database cluster configuration.

### 2.4. Specialised Core Modifiers
*   **`HealthModule.tsx`**:
    *   *Path*: `/src/components/HealthModule.tsx`
    *   *Role*: Clinical triage logging, medical prescriptions, and contagion risk monitors.
*   **`RHIndicatorsPanel.tsx`**:
    *   *Path*: `/src/components/RHIndicatorsPanel.tsx`
    *   *Role*: Military/Civil guard roster analysis, turnover rates, and deployment shifts.
*   **`DelegationPortal.tsx`**:
    *   *Path*: `/src/components/DelegationPortal.tsx`
    *   *Role*: Temporary access delegations, temporary permission assignments.
*   **`JsonDiffViewer.tsx`**:
    *   *Path*: `/src/components/JsonDiffViewer.tsx`
    *   *Role*: Forensic audit tool comparing log hashes and security payload modifications.

---
*Do not create new files inside `/src/components/` without registering them in this component index.*
