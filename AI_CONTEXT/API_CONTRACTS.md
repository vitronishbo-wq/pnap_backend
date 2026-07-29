# COMPONENT PROPS & API CONTRACTS — PNAP-AO
*Portal Nacional de Administração Penitenciária — República de Angola*
*Data Formats, Shared Type Interfaces, and Component Signatures*

---

## 1. CONTRATOS DOS MODELOS DE DADOS (DATA CONTRACTS)

Estes são os tipos e interfaces estruturais compartilhados e mantidos no estado central em `/src/App.tsx`. Qualquer mutação ou inserção de dados **deve** respeitar rigorosamente essas propriedades:

### 1.1. Contrato do Prontuário do Recluso (`Inmate`)
```typescript
interface Inmate {
  id: string;              // Ex: "RECLUSO-2026-001" (único)
  name: string;            // Nome completo do recluso
  crimeCode: string;       // Código penal associado (ex: "ART-121")
  dangerLevel: "BAIXO" | "MEDIO" | "ALTO" | "CRITICO";
  prisonId: string;        // ID do estabelecimento atual
  cellId: string;          // ID da cela alocada
  status: "ATIVO" | "SOLTO" | "EM_TRANSITO";
  admittedAt: string;      // Timestamp ISO-8601
  healthStatus: string;    // Condições clínicas diagnosticadas
  fingerprintHash: string; // Hash de integridade biométrica (não-repúdio)
}
```

### 1.2. Contrato de Estabelecimento Prisional (`Prison`)
```typescript
interface Prison {
  id: string;              // Ex: "PRISON-LUANDA"
  name: string;            // Nome oficial da penitenciária
  province: string;        // Província angolana (ex: "Luanda", "Uíge")
  capacity: number;        // Lotação física máxima de reclusos
  currentOcupation: number;// Número corrente de reclusos ativos
  securityLevel: "MAXIMA" | "MEDIA" | "MINIMA";
  status: "ESTAVEL" | "ALERTA" | "CONTINGENCIA";
}
```

### 1.3. Contrato de Trilha Forensic e Logs (`AuditLog`)
```typescript
interface AuditLog {
  id: string;              // UUID ou Hash incremental
  timestamp: string;       // ISO-8601 UTC
  operatorId: string;      // ID do militar/civil executor
  operatorName: string;    // Nome completo do operador
  operatorRole: string;    // Patente ou cargo do executor (ex: "Capitão")
  action: string;          // Ex: "CELL_CHANGE_EXECUTE", "SYSTEM_MUTATION"
  affectedTable: string;   // "INMATES" | "PRISONS" | "SIEM"
  rowId: string;           // Identificador da linha alterada
  description: string;     // Detalhamento por extenso da ação realizada
  signatureHash: string;   // SHA-256 calculando as propriedades do log (imutabilidade)
}
```

---

## 2. CONTRATOS DE PROPS PARA COMPONENTES TÁTICOS

Ao instanciar os componentes secundários a partir do `App.tsx`, garanta a correspondência exata das seguintes assinaturas:

### 2.1. `IntelligenceCenter` Prop Contracts
```typescript
interface IntelligenceCenterProps {
  prisons: Prison[];
  inmates: Inmate[];
  operators: any[];
  currentOperator: any;
  writeAuditLog: (
    operator: any,
    action: string,
    table: string,
    rowId: string,
    desc: string
  ) => void;
}
```

### 2.2. `NationalCommandCenter` Prop Contracts
```typescript
interface NationalCommandCenterProps {
  prisons: Prison[];
  inmates: Inmate[];
  operators: any[];
  currentOperator: any;
  writeAuditLog: (
    operator: any,
    action: string,
    table: string,
    rowId: string,
    desc: string
  ) => void;
  isOnline: boolean;
}
```

---
*Garantia de Tipagem Segura e Zero Incompatibilidades em Tempo de Execução.*
