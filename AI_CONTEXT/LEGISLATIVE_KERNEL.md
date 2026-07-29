# LEGISLATIVE KERNEL — PNAP-AO
*Estatuto de Governação Digital e ADN Normativo do Sistema Penitenciário de Angola*

---

## 1. PRINCÍPIO DA SOBERANIA NORMATIVA
Toda a arquitetura de software, permissões de utilizadores (RBAC), fluxos de trabalho e assinaturas digitais do **Portal Nacional de Administração Penitenciária (PNAP-AO)** devem ser baseadas em fundamentos jurídicos explícitos constantes no ordenamento jurídico angolano e em tratados internacionais ratificados pela República de Angola.

O sistema não implementa comportamentos discricionários. Cada funcionalidade é a tradução computacional direta de um preceito legal.

```
                    ┌────────────────────────────┐
                    │  FONTE JURÍDICA PRIMÁRIA   │
                    │   (Decretos, Leis, Regras)  │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │ LEGISLATIVE KERNEL MAPPING │
                    │    (Entidades & Regras)    │
                    └─────────────┬──────────────┘
                                  │
                                  ▼
                    ┌────────────────────────────┐
                    │  CÓDIGO FONTE EXECUTÁVEL   │
                    │  (Fluxos, Segurança, UI)   │
                    └────────────────────────────┘
```

---

## 2. DIPLOMAS DOUTRINÁRIOS E LEGAIS CONSOLIDADOS
O PNAP-AO integra nativamente o conhecimento normativo dos seguintes diplomas:

1. **Constituição da República de Angola (CRA)**: Garantias fundamentais do recluso, direito à integridade física e moral, limites da prisão preventiva.
2. **Decreto Presidencial n.º 184/17 (Regulamento Orgânico do S.P.A.)**: Estrutura de direcção, apoio consultivo, técnico e executivos centrais. Vagas regulamentares de pessoal (Anexo I) e organograma oficial (Anexo II).
3. **Novo Código Penal de Angola (Lei n.º 38/20 de 11 de Novembro)**: Classificação de perigosidade criminal em Grupos A, B e C; prazos de reabilitação e regimes de cumprimento de pena.
4. **Regras Mínimas das Nações Unidas para o Tratamento de Reclusos (Regras de Nelson Mandela)**: Padrões internacionais de higiene, espaço mínimo celular, assistência médica e proibição de castigos corporais.
5. **Regras de Bangkok**: Diretrizes internacionais para o tratamento específico de mulheres reclusas e medidas não privativas de liberdade.

---

## 3. FLUXO DE IMPACTO LEGISLATIVO (IMPLEMENTAÇÃO E EVOLUÇÃO)
Sempre que uma nova lei, despacho ou circular ministerial for integrado na plataforma, o agente cognitivo deve realizar uma análise de impacto sistemática baseada nas seguintes perguntas diretivas:

*   **Altera Competências Orgânicas?** Modificar a estrutura do `LegislationModule` e atualizar o mapa hierárquico.
*   **Altera Permissões (RBAC)?** Ajustar as restrições da função `isTabVisible` ou das rotas do servidor.
*   **Altera Documentos Obrigatórios?** Atualizar geradores de PDF e guias eletrónicas de transferência.
*   **Altera Prazos Processuais?** Modificar alarmes de custódia preventiva e gatilhos de libertação condicional.
*   **Altera Métricas / Indicadores?** Reconfigurar dashboards estatísticos nacionais ou regionais.

---
*Este Kernel assegura que a computação do PNAP-AO permanece em estrita e perfeita conformidade jurídica nacional e internacional.*
