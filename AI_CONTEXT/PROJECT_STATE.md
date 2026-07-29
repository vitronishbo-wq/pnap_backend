# PROJECT_STATE.md — PNAP-AO
*Portal Nacional de Administração Penitenciária — República de Angola*
*Registro Incremental de Etapas de Engenharia, Progresso de Recursos e Estado Atual do Sistema*

---

## 1. ESTADO DE PRONTIDÃO DO SISTEMA (MILESTONE TRACKER)

| Etapa | Domínio / Funcionalidade | Descrição Técnica | Estado de Prontidão |
| :--- | :--- | :--- | :--- |
| **1-5** | Sistema Base | Triagem, Admissions, Código Penal Geral, Prontuários Médicos e Gestão de Escoltas. | **Estável & Homologado** |
| **6** | Centro Táctico | Mapa Nacional de Contingência de Angola com controle de incidentes prisionais, rotas táticas de escolta ativa e despachos das forças rápidas (PIR). | **Concluído & Integrado** |
| **7** | Inteligência SIEM | Desenvolvimento do motor SIEM integrado. Correlação de regras, barramento de eventos de segurança tática, detecção de ameaças automáticas e análise comportamental de perfis suspeitos. | **Concluído & Integrado** |
| **7** | Roteamento Global | Integração das novas rotas táticas de comando e inteligência na barra de ferramentas e no seletor de módulos centrais do `App.tsx`. | **Concluído & Integrado** |
| **8** | AIOS Cognitivo | Conclusão do AI Operating System completo de 16 índices inter-conectados para controle heurístico e mitigação de regressão. | **Estável & Homologado** |
| **9** | Protocolo Auto-Sync | Desenvolvimento do sistema progressivo de sincronização automática com feedback de comandos SQL, controle de latência VSAT e cronómetro regressivo. | **Estável & Homologado** |
| **10** | Centro de Doutrina e Governação | Upgrade total para "Centro de Doutrina, Legislação e Governação" com Legislative Kernel, Legal Knowledge Graph, Trace de Código, Motor de Evolução e Simulador de Impacto. | **Estável & Homologado** |

---

## 2. LISTAGEM DE APORTES RECENTES (ÚLTIMAS ALTERAÇÕES)

### ETAPA 10: Centro de Doutrina, Legislação e Governação Penitenciária
*   **Legislative Kernel & Graphs**: Criação de `/AI_CONTEXT/LEGISLATIVE_KERNEL.md`, `LEGAL_KNOWLEDGE_GRAPH.md` e `LEGAL_DEPENDENCY_GRAPH.md`, estabelecendo a rastreabilidade do código para leis específicas angolanas e tratados internacionais (Nelson Mandela e Bangkok).
*   **Regulamento Orgânico Oficial**: Digitalização e estruturação dos Capítulos I a IV do Decreto Presidencial n.º 184/17, oferecendo busca rápida e navegação intuitiva por secções.
*   **Quadro de Pessoal de Angola**: Mapeamento completo das 21.318 vagas e categorias da carreira penitenciária regulamentadas em Anexo I, com filtros rápidos por nível de patente.
*   **Motor de Rastreabilidade Juri-Técnica**: Interface dinâmica que vincula as principais telas e funcionalidades do PNAP-AO (lotação, solturas, triagem médica, transferências) ao seu fundamento legal exato, órgão regulador competente e fluxos de assinatura mandatórios.
*   **Motor de Evolução & Lacunas (Gaps)**: Classificação dos artigos e tratados em níveis de conformidade carcerária (Implementado, Parcial, Não Implementado) correlacionando soluções tecnológicas inovadoras e geração de propostas oficiais de inovação.
*   **Simulador de Impacto Legislativo**: Sandbox preditivo para projetar o impacto de emendas legislativas (como a redução da prisão preventiva ou controle biométrico de visitas) estimando arquivos de código a modificar, regras de base de dados e impactos no RBAC de operadores.
*   **Assistente Legal Integrado**: Chat inteligente de perguntas e respostas sobre conformidade legal, atribuições do sistema e artigos do Código Penal.

### ETAPA 9: Protocolo Progressivo de Sincronismo Automático (Auto-Sync)
*   **Controle de Ciclo Regressivo**: Introduzido um gatilho automático (`useEffect` de 15 segundos) que monitoriza a existência de pendências contingentes em canais em linha, auto-disparando o fluxo sem intervenção manual.
*   **Transparência SQL Forense**: Modificado o orquestrador `triggerSync` para realizar inserções progressivas cadenciadas a cada 1.5s, logando instruções SQL reais (`INSERT INTO public.inmates`) no console visual do operador.
*   **Design de Interface de Alta Fidelidade**: Implementados retrocessos visuais de progresso (progress bars), indicadores pulsantes de status para "Pendências Locais", "Sincronizando..." e "Em Linha (Sincronizado)", e console VSAT estendido para visualização profunda de logs de dados.

### ETAPA 7: Centro de Inteligência (SIEM Nacional)
*   **Novos Componentes**: Criação do componente isolado e autônomo `src/components/IntelligenceCenter.tsx`.
*   **Motores de Mitigação**: Desenvolvimento de chaves reativas para bloquear contas suspeitas ou quarentenar operadores prisionais em tempo real.
*   **Simulador de Ataque Integrado**: Implementação de uma consola de simulação injetando:
    1.  *Brute Force de Código PIN*: Bloqueia a conta simulada do Capitão João Mateus.
    2.  *Injeção SQL Maliciosa*: Dispara contra-medidas automáticas WAF com payload de escape.
    3.  *Escalamento de Privilégio*: Bloqueia chamadas administrativas não autorizadas por operadores da saúde.
    4.  *Viagem Física Impossível (Geolocalização)*: Identifica logins instantâneos concorrentes de províncias geograficamente isoladas (Luanda e Cabinda).
*   **Roteamento**: Acoplamento do `activeTab === "centro-inteligencia"` no painel orquestrador `src/App.tsx`.

---

## 3. PRÓXIMAS INTERVENÇÕES PROGRAMADAS
1.  **Reforço de Correlação**: Propagar alertas gerados em incidentes nas prisões do Centro de Comando diretamente para a tabela de eventos do SIEM.
2.  **Testes de Carga**: Validar o comportamento do renderizador de logs forenses quando a lista ultrapassa 100 registros ativos simultâneos.

---
*Este documento é de leitura e atualização incremental mandatória a cada ciclo de turnos.*
