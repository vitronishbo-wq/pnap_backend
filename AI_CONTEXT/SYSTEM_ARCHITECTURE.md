# SYSTEM_ARCHITECTURE.md — PNAP-AO
*Portal Nacional de Administração Penitenciária — República de Angola*
*Mapeamento Arquitetural, Fluxo de Dados e Grafo de Dependência de Módulos*

---

## 1. COMPOSIÇÃO DO ECOSSISTEMA PNAP-AO

O ecossistema do PNAP-AO foi desenhado de forma modular sobre uma infraestrutura cliente de altíssima fidelidade tecnológica, combinando dados táticos, cartografia de contingência e sistemas forenses imutáveis.

```
                      ┌────────────────────────────────────────┐
                      │               src/App.tsx              │
                      │          (Orquestrador Core)           │
                      └──────────────────┬─────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
│  IntelligenceCenter  │      │NationalCommandCenter │      │  DeusFundadorPanel   │
│  (SIEM e Mitigação)  │      │ (Cartografia / PIR)  │      │ (Chaves de Soberania)│
└──────────────────────┘      └──────────────────────┘      └──────────────────────┘
```

---

## 2. COMPONENTES-CHAVE DA INTERFACE E SUAS RESPONSABILIDADES

### 2.1. `IntelligenceCenter` (`src/components/IntelligenceCenter.tsx`)
*   **Responsabilidade**: Módulo próprio de monitoramento de ameaças lógicas, forenses, e de rede (SIEM próprio).
*   **Parâmetros de Entrada (Props)**:
    *   `prisons: any[]` — Cadastro de estabelecimentos prisionais do país.
    *   `inmates: any[]` — Prontuários e processos de reclusos cadastrados.
    *   `operators: any[]` — Oficiais e operadores prisionais de serviço.
    *   `currentOperator: any` — Operador presentemente autenticado no terminal.
    *   `writeAuditLog: (operator: any, action: string, table: string, rowId: string, desc: string) => void` — Endpoint de persistência auditável.
*   **Comunicação Inter-Módulos**: Reporta incidentes comportamentais e atualiza automaticamente o nível global de ameaça do sistema.

### 2.2. `NationalCommandCenter` (`src/components/NationalCommandCenter.tsx`)
*   **Responsabilidade**: Consola de comando para contenção de motins, incidentes operacionais de campo, e rastreamento de rotas de transferência de prisioneiros em tempo real.
*   **Parâmetros de Entrada (Props)**:
    *   `prisons`, `inmates`, `operators`, `currentOperator`, `writeAuditLog`
    *   `isOnline: boolean` — Status da conexão satelitária criptografada com o Ministério do Interior.

### 2.3. `DeusFundadorPanel` (`src/components/DeusFundadorPanel.tsx`)
*   **Responsabilidade**: Controle supremo de custódia pelo Diretor Geral.
*   **Atribuição**: Concede amnistias excepcionais, gerencia assinaturas multifatoriais descentralizadas e visualiza a trilha de hash primária do sistema nacional.

### 2.4. `ServicesGatewayPanel` (`src/components/ServicesGatewayPanel.tsx`)
*   **Responsabilidade**: Visualização da infraestrutura física, estado dos microsserviços, latência da rede e barramento de dados entre Luanda, Viana e as províncias.

---

## 3. CONTRATO DE ESTADO GLOBAL & PERSISTÊNCIA

O sistema utiliza reatividade de estado no nível do componente raiz (`src/App.tsx`). A persistência primária é gerenciada por indexadores locais reativos, simulando integridade transacional de forma síncrona com os motores forenses:

1.  **`activeTab`**: Controla a rota ativa no viewport principal.
2.  **`inmates` / `prisons`**: Listas vivas de reclusos e prisões que alimentam de forma bidirecional os motores de busca e o mapa tático.
3.  **`logs`**: Coleção de transações que armazena todas as mutações prisionais para fins de não-repúdio.

---
*Atualizado sob supervisão da Direção de Informática e Telecomunicações do MININT.*
