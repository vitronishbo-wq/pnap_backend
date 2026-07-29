# LEGAL KNOWLEDGE GRAPH — PNAP-AO
*Mapeamento de Grafo Semântico de Atribuições, Órgãos e Competências Regulamentares*

---

## 1. VERTICES (ENTIDADES DO GRAFO)

### V1: Decreto Presidencial n.º 184/17
*   **Artigo 1.º & 2.º (Definição e Natureza)**
    *   *Propriedades*: Autonomia administrativa, subordinação direta ao Ministério do Interior (MININT).
    *   *Mapeamento*: `NationalCommandCenter.tsx`, `App.tsx` (Estatuto militar).
*   **Artigo 3.º (Atribuições Gerais)**
    *   *Propriedades*: Custódia legal, reintegração social, formação profissional, cooperação externa.
    *   *Mapeamento*: `LegislationModule.tsx`.
*   **Artigo 5.º & 6.º (Direcção Geral)**
    *   *Propriedades*: Comando singular do Director Geral e coadjuvado por dois Adjuntos.
    *   *Mapeamento*: Role `DIRECTOR_GERAL`, visibilidade total de relatórios de inteligência.
*   **Artigo 27.º (Direcção de Segurança Penitenciária)**
    *   *Propriedades*: Ordem interna, escolta militarizada, segurança perimetral, intervenção táctica (UESI).
    *   *Mapeamento*: `NationalCommandCenter.tsx`, Role `CHEFE_SEGURANCA`.
*   **Artigo 29.º (Direcção de Controlo Penal)**
    *   *Propriedades*: Cadastro penal único, emissão de guias de soltura, controlo de prazos judiciais.
    *   *Mapeamento*: `InmateRegistrationForm`, Tab `admissions`.
*   **Artigo 33.º (Direcção de Saúde)**
    *   *Propriedades*: Tratamento clínico de reclusos, controle epidemiológico, cooperação com o MinSa.
    *   *Mapeamento*: `HealthModule.tsx`, Role `CHEFE_SAUDE`.

### V2: Doutrina Internacional Nelson Mandela
*   **Regra 12 a 17 (Acomodação)**
    *   *Propriedades*: Espaço mínimo por recluso, luz, ventilação e higiene celular.
    *   *Mapeamento*: Pavilhões do `EstablishmentDirectorDashboard.tsx` (Cálculo automático de sobrelotação).
*   **Regra 24 a 35 (Serviços de Saúde)**
    *   *Propriedades*: Livre acesso a cuidados de saúde sem discriminação, triagem no ingresso.
    *   *Mapeamento*: Registo clínico em `HealthModule.tsx` e histórico epidemiológico.

---

## 2. ARESTAS (RELAÇÕES E DEPENDÊNCIAS DE SISTEMA)

```
[Decreto 184/17 Art. 27] ─── (CUSTODIA) ───► [Role: CHEFE_SEGURANCA] ─── (AUTORIZA) ───► [Módulo: Centro de Comando]
[Decreto 184/17 Art. 29] ─── (CADASTRO) ───► [Role: OPERADOR_PENAL]  ─── (ESCREVE)   ───► [Módulo: Controlo Penal (Admissions)]
[Decreto 184/17 Art. 33] ─── (CLÍNICA)  ───► [Role: CHEFE_SAUDE]      ─── (TRIAGEM)  ───► [Módulo: Saúde Integrada]
[Regra de Mandela 12]   ─── (AUDITORIA)───► [Role: DIRECTOR_GERAL]  ─── (ALERTA)   ───► [Módulo: Alerta de Sobrelotação]
```

---

## 3. GRAFO COMPLEMENTAR DE PROTOCOLOS ADICIONAIS
*   **Regras de Bangkok (Reclusas Mulheres)**: Obrigatoriedade de salas de berçário e ginecologia nos estabelecimentos de regime feminino. Mapeia para a flag `femalePrisons` e visibilidade de fichas obstétricas.
*   **Acórdãos do Tribunal de Luanda**: Determinam libertação imediata em caso de expiração de prazos preventivos (Excesso de Prisão Preventiva). Mapeia para o relógio de conformidade penal na aba `admissions`.
