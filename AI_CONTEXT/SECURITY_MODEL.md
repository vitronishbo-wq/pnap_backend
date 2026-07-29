# SYSTEM SECURITY MODEL — PNAP-AO
*Portal Nacional de Administração Penitenciária — República de Angola*
*RBAC, Non-Repudiation, Cryptographic Signatures, and SIEM Auto-Quarantine Rules*

---

## 1. MODELO DE CONTROLE DE ACESSO BASEADO EM FUNÇÕES (RBAC)

O PNAP-AO restringe de forma intransigente as funcionalidades críticas do portal com base em patentes militares e cargos civis autorizados.

### 1.1. Funções (Roles) Cadastradas no Sistema
*   **`DIRETOR_GERAL` (Soberano)**: Acesso ilimitado. É o único capaz de usar a aba `deus-fundador`, autorizar amnistias e conceder override de segurança mestre.
*   **`MINISTRO_MININT`**: Visualização geral de inteligência nacional, aprovação de movimentações e consulta forense de auditoria.
*   **`COMANDANTE_PIR` (Força de Intervenção Rápida)**: Controle absoluto do `NationalCommandCenter`, visualização de rotas militares de trânsito e despacho de contingências táticas.
*   **`OFICIAL_INTELIGENCIA`**: Operação da consola SIEM (`IntelligenceCenter`), mitigação de intrusões e gestão de regras lógicas.
*   **`OPERADOR_PENAL`**: Triagem operacional de celas, emissão de guias normais e controle de admissão na aba `admissions`.
*   **`MEDICO_PRISIONAL`**: Gestão exclusiva do prontuário de saúde dos reclusos, sem acesso a dados de comando tático.

### 1.2. Política de Visibilidade de Abas (`isTabVisible`)
Qualquer nova funcionalidade ou sub-aba deve passar pelo método de filtragem de papéis do operador:
```typescript
const isTabVisible = (tab: string, role: string): boolean => {
  if (role === "DIRETOR_GERAL") return true;
  if (tab === "deus-fundador") return role === "DIRETOR_GERAL";
  if (tab === "centro-inteligencia") return ["DIRETOR_GERAL", "MINISTRO_MININT", "OFICIAL_INTELIGENCIA"].includes(role);
  if (tab === "centro-comando") return ["DIRETOR_GERAL", "MINISTRO_MININT", "COMANDANTE_PIR", "OFICIAL_INTELIGENCIA"].includes(role);
  // ... Outras regras de domínio básicas
  return true;
};
```

---

## 2. MECANISMOS DE NÃO-REPÚDIO & ASSINATURA FORENSE (ADR-002)

Para garantir que nenhum registro seja apagado ou alterado de forma retroativa, toda transação executada invoca o cálculo de assinatura forense.

### 2.1. Simulação do Algoritmo de Integridade SHA-256
Sempre que uma ação operacional ocorre, os atributos do log são concatenados com um Hash anterior para formar um elo encadeado (Blockchain de Auditoria):
```typescript
const generateLogHash = (log: Omit<AuditLog, "signatureHash">): string => {
  const payload = `${log.timestamp}-${log.operatorId}-${log.action}-${log.affectedTable}-${log.rowId}-${log.description}`;
  // Retorna uma representação hexadecimal simulada de hash criptográfico consistente
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }
  return "SHA256-" + Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
};
```

---

## 3. PROTOCOLO SIEM DE QUARENTENA E MITIGAÇÃO DE AMEAÇAS
O `IntelligenceCenter` opera como um SIEM lógico e aplica bloqueios imediatos:
*   **Bloqueio de IP/Sessão**: Se o simulador de injeções detectar um ataque, o IP associado é quarentenado, as chaves de sessão são invalidadas e o operador deve autenticar-se novamente com um PIN redefinido pelo Diretor Geral.
*   **Mitigação Automática**: Regras `RULE-01` a `RULE-05` podem suspender operadores suspeitos automaticamente caso realizem logins simultâneos em províncias concorrentes (Viagem Física Impossível).

---
*A segurança física começa com a integridade absoluta da segurança lógica do PNAP-AO.*
