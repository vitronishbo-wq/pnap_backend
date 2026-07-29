# RISK MATRIX & REGRESSION INDEX — PNAP-AO
*Portal Nacional de Administração Penitenciária — República de Angola*
*Defensive Coding Guardrails, Criticality Levels & Change Safety Assessment*

---

## 1. SISTEMA DE CLASSIFICAÇÃO DE RISCO (METODOLOGIA)

Cada intervenção no PNAP-AO deve ser pré-avaliada em relação ao seu potencial de causar regressões colaterais no núcleo do aplicativo.

*   **Criticidade (C)**: Impacto do módulo na soberania operacional do portal (1 a 5).
*   **Impacto (I)**: Nível de acoplamento com outros módulos ou com o estado global (1 a 5).
*   **Prioridade (P)**: Urgência regulamentar do recurso (Baixa, Média, Alta, Crítica).
*   **Risco de Regressão (R)**: Probabilidade de quebrar comportamentos legados devido ao tamanho do arquivo ou acoplamento de estados (Baixo, Médio, Elevado, Crítico).

---

## 2. MATRIZ DE RISCO POR MÓDULO OPERACIONAL

Antes de alterar qualquer código, localize o módulo afetado abaixo para calibrar a sua cautela e profundidade de testes:

| Módulo/Componente | Criticidade (C) | Impacto (I) | Risco Regressão (R) | Prioridade (P) | Descrição do Risco |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`App.tsx` (Estado Global)** | 5 | 5 | **Crítico** | **Crítica** | Modificações no topo do estado global podem interromper a reatividade em todo o ecossistema. |
| **`DeusFundadorPanel`** | 5 | 4 | **Elevado** | **Alta** | Chaves criptográficas de soberania e decretos de amnistia requerem validações multilaterais perfeitas. |
| **`NationalCommandCenter`**| 4 | 4 | **Elevado** | **Alta** | Rendição de mapas vetoriais de Angola e tracking GPS. Risco de travar o fluxo de renderização com re-renders. |
| **`IntelligenceCenter`** | 4 | 3 | **Médio** | **Alta** | Motor de regras SIEM e barramento de logs forenses. Requer integridade estrita das chaves do operador. |
| **`Admissions Module`** | 4 | 4 | **Elevado** | **Média** | Triagem médica e alocação biométrica de celas. Altamente integrado com arrays de reclusos. |
| **`Movements (Escoltas)`**| 3 | 3 | **Médio** | **Média** | Planeamento de comboios e escoltas táticas. Risco médio de inconsistência de rotas. |
| **`ServicesGatewayPanel`**| 2 | 2 | **Baixo** | **Baixa** | Monitoramento estático-dinâmico do cluster físico. Baixo acoplamento com regras prisionais. |

---

## 3. PROTOCOLO DE MITIGAÇÃO DE RISCO EM ARQUIVOS CRÍTICOS
1.  **Código com Risco Elevado ou Crítico**:
    *   Exige validação imediata via `compile_applet` e `lint_applet`.
    *   Proibido mesclar estados heterogêneos sem isolar lógica em métodos puros e declarativos.
2.  **Modificações no `App.tsx`**:
    *   Utilizar âncoras de comentários para garantir que o bloco alterado não remova ou mutile abas vizinhas.

---
*Garantia de Estabilidade e Proteção Contra Entropia de Código.*
