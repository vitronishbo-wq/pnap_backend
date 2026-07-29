# PNAP-AO Mission Engine — Especificação e Protocolos de Execução

Este documento rege o ciclo de vida operacional das tarefas críticas do sistema PNAP-AO. Na arquitetura IOS, os utilizadores não navegam passivamente em telas; eles executam **Missões Coordenadas (Mission Engine)**.

---

## 1. Ciclo de Vida da Missão

Cada Missão Operacional (ex: Iniciar Transferência Judicial, Ativar Resposta a Motim, Homologar Admissão) possui um ciclo de vida estritamente monitorado e auditado pela plataforma:

```text
  [1. INICIALIZAÇÃO] ──► [2. VALIDAÇÃO LEGISLATIVA] ──► [3. ALOCAÇÃO FÍSICA]
          │                                                     │
          ▼                                                     ▼
 [Contingência Offline] ◄─────────────────────────────── [4. ASSINATURA & LOG]
```

### Protocolos Detalhados:

1. **Inicialização (Triggers):**
   * Pode ser disparada via Árvore Institucional (hover em nós, botão `+` de ações rápidas).
   * Pode ser acionada via **Command Palette (`Ctrl+K` ou `Ctrl+Shift+P`)** escrevendo o nome literal da missão.

2. **Validação Legislativa Automática (CNEL Security):**
   * Antes de salvar, o motor valida se o crime, a pena ou a movimentação cumprem os preceitos do Código Penal de Angola.
   * Alerta preventivo se houver desconformidade jurídica ou violação de direitos fundamentais.

3. **Simulador de Alocação Física (Digital Twin Cohesion):**
   * Ao sugerir transferência de reclusos, a simulação verifica se o estabelecimento destino de Angola possui capacidade, infraestrutura de saúde e nível de risco adequado.

4. **Assinatura Operacional & Log de Auditoria:**
   * Toda missão concluída escreve um log imutável no sistema de auditoria, registrando o carimbo de data/hora (UTC), ID do Operador, nível de autorização e coordenadas do nó territorial impactado.

---

## 2. Exemplos de Workspaces de Missão Ativos na UI

No orquestrador central de `App.tsx`, uma missão ativa assume o foco completo da tela ou se sobrepõe como uma ferramenta acoplada ao Workspace:

* **Missão: Nova Guia de Admissão**
  * Estado: `activeMission = "NEW_ADMISSION"`
  * Renderiza: Formulário focado de triagem civil e penal, eliminando a visualização de gráficos globais de BI.
* **Missão: Trânsito Coordenado**
  * Estado: `activeMission = "TRANSFER_PROCESS"`
  * Renderiza: Painel dividido (Split View) com estabelecimento de origem à esquerda, destino à direita, e lista de reclusos selecionados no centro.
* **Missão: Responder a Incidente de Segurança**
  * Estado: `activeMission = "INCIDENT_ALERT"`
  * Renderiza: Painel de Contingência de Alertas Táticos, com mapa interativo vermelho de alto contraste e relatórios de emergência.
