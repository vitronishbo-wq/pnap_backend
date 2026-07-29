# PNAP-AO Digital Twin Model Spec

Este documento estabelece o modelo de **Gêmeo Digital (Digital Twin)** para o controle operacional de infraestruturas físicas de detenção no Serviço Penitenciário de Angola.

---

## 1. O Conceito de Gêmeo Digital (Digital Twin)

O PNAP-AO representa a infraestrutura prisional física não apenas como registros tabulares de capacidade, mas como um modelo operacional vivo. Cada unidade, pavilhão e cela possui uma réplica lógica que espelha as condições do mundo real:

1. **Lotação Ativa (Live Capacity):** Relação percentual entre reclusos alojados e vagas físicas reais.
2. **Fator de Stress Térmico/Espacial (FSE):** Indicador preditivo de risco de motim baseado na superlotação e condições de ventilação do pavilhão.
3. **Consumo de Serviços Básicos:** Mapeamento tático do fornecimento de água, energia elétrica e suprimentos médicos na unidade.

---

## 2. A Métrica de Risco Operacional Integrada

O risco de cada estabelecimento penitenciário no gêmeo digital é calculado através de um algoritmo ponderado:

$$\text{Risco Unitário} = (\text{Lotação} \times 0.5) + (\text{Nível de Perigosidade Médio} \times 0.3) + (\text{Alertas de Segurança} \times 0.2)$$

### Escala de Alerta:
* **Fator < 75% (Estável - Verde):** Operação normal. Custódia ideal e espaço para atividades de reinserção social.
* **Fator 75% - 100% (Atenção - Laranja):** Capacidade máxima próxima. Restrição preventiva de novas transferências.
* **Fator > 100% (Crítico - Vermelho):** Superlotação. Ativação automática de rotas de balanceamento para escoamento de reclusos para unidades vizinhas de Angola.

---

## 3. Visualização e Simulação

A área central da aplicação permite visualizar o Gêmeo Digital através de esquemas funcionais de celas com barras de progresso de lotação reativas, permitindo simulações de movimentação por drag-and-drop virtual antes da homologação física da transferência de custódia.
