# PNAP-AO Workspace Architecture Spec — Mission-Oriented Spaces

Esta especificação define o comportamento dinâmico do **Central Workspace Body** e as diretrizes de design que governam a transição de visualizações e fluxos operacionais na plataforma PNAP-AO.

---

## 1. O Conceito de Workspaces de Missão (Mission Workspaces)

Diferente de interfaces web convencionais que operam em navegação de abas estáticas de páginas, o PNAP-AO opera sob o paradigma de **Missões Operacionais**. O utilizador abre e encerra contextos focados de trabalho.

```text
                  +-----------------------------------+
                  |      Institutional Explorer       |
                  +-----------------------------------+
                                    │
                       (Seleciona nó ou ação)
                                    │
                                    ▼
                  +-----------------------------------+
                  |      Workspace Orchestrator       |
                  +-----------------------------------+
                   /                │                \
                  /                 │                 \
                 ▼                  ▼                  ▼
      +-------------------+ +-------------------+ +-------------------+
      |  Mission: Admissão| |  Mission: Transfer| |  Mission: Alert   |
      |  [Focado / Split] | |  [Focado / Split] | |  [Focado / Split] |
      +-------------------+ +-------------------+ +-------------------+
```

### Propriedades de um Workspace de Missão:
1. **Foco Único:** Todo o ecrã ou secção central é dedicado ao fluxo lógico da missão em causa, removendo ruído de outros painéis.
2. **Ciclo de Vida Limpo:** Uma missão tem um início claro (gatilho de comando), recolha de dados, validação legislativa (segurança integrada) e confirmação/assinatura. Uma vez fechada, o sistema regressa ao estado de navegação territorial estável.
3. **Persistência de Rascunho:** Se o operador mudar temporariamente de contexto (ex: consultar um recluso em Angola enquanto preenche uma nova guia de transferência), o progresso da missão ativa deve ser retido em memória local (State) sem perda de dados.

---

## 2. Tipos de Workspaces de Missão Integrados

### A. Missão: Admissão e Triagem Biométrica (`admissions`)
* **Propósito:** Registro central de cidadãos e reclusos na base de dados nacional.
* **Componentes:**
  * Formulário de dados civis estruturado por painéis colapsáveis.
  * Validador dinâmico contra mandados de captura em tempo-real.
  * Selector inteligente de celas sugerido pela IA (IA Suggest) com base no nível de risco e lotação física atual.

### B. Missão: Transferência e Trânsito Jurisdicional (`movements`)
* **Propósito:** Movimentação penal segura de reclusos entre províncias ou estabelecimentos penitenciários.
* **Componentes:**
  * Gerador de Guias de Trânsito com códigos de verificação criptográfica.
  * Verificador de capacidade de destino com semáforos de congestionamento (Verde/Laranja/Vermelho).
  * Painel de contingência para trânsito interrompido (modo offline com re-sincronização).

### C. Missão: Comando de Contingência (`centro-comando`)
* **Propósito:** Resposta tática coordenada a motins, fugas, incidentes sanitários ou interrupções de canais de energia.
* **Componentes:**
  * Mapa tático interativo de Angola integrado.
  * Painel de comunicações via satélite (VSAT).
  * Terminal de simulações com acionadores de alerta nacional.

---

## 3. Diretrizes de Comportamento Visual (Anti-Dashboards)

* **Cards:** São estritamente desencorajados. Substituir por tabelas tabulares minimalistas, detalhamento em gavetas (drawers) e painéis acopláveis.
* **Mutações Visuais:** Ao abrir um estabelecimento penitenciário no explorador, toda a área central deve ser reconfigurada para mostrar a ficha detalhada dessa unidade, abolindo a persistência de resumos globais que confundam o utilizador.
