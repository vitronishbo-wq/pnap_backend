# PNAP-AO Engineering Kernel & Context Management Protocol

Este documento formaliza as estratégias de otimização de contexto, protocolos de raciocínio incremental e de engenharia de software para a manutenção, expansão e evolução contínua da **Plataforma Nacional de Administração Penitenciária (PNAP-AO)**.

---

## 1. O Problema do Limite de Contexto
Com o crescimento contínuo do ecossistema PNAP-AO (atualmente com ficheiros de elevado volume de linhas, como a vista unificada `/src/App.tsx`), a manipulação de ficheiros via LLM enfrenta barreiras de latência e limites de tokens de geração.

Para mitigar a saturação do modelo e garantir edições cirúrgicas ultraprecisas de 100% de integridade, estabelecem-se os protocolos abaixo.

---

## 2. Estratégia de Leitura e Edição Incremental (RRE)

Todo e qualquer agente ou engenheiro humano que opere nesta plataforma deve seguir o protocolo **Read-Review-Edit (RRE)** de três passos:

### Passo 1: Leitura Localizada (Read)
* **Regra de Ouro:** Nunca assumir o conteúdo de um ficheiro ou importar templates sem verificação direta.
* **Ferramenta:** Usar `view_file` especificando os parâmetros `StartLine` e `EndLine` para fatias estritas (máximo de 150-200 linhas de cada vez).
* **Grep Inteligente:** Usar comandos de pesquisa rápida com filtros de exclusão de diretorias (`node_modules`, `dist`, `build`) para identificar as coordenadas de linhas antes de ler.

### Passo 2: Alinhamento de Âncoras (Review)
* **Regra de Ouro:** As edições falham quando as linhas alvo diferem por um único espaço ou quebra de linha.
* **Ação:** Antes de aplicar o `edit_file`, realize uma chamada de confirmação rápida de leitura para as 10 linhas imediatamente anteriores e posteriores do trecho alvo para garantir alinhamento exato de caracteres.

### Passo 3: Substituição Cirúrgica (Edit)
* **Regra de Ouro:** Substituir blocos sem arrastar código redundante e sem truncar estruturas lógicas.
* **Ação:** Isolar as linhas com precisão sintática, definindo blocos autocontidos com correspondência inequívoca na ferramenta de edição.

---

## 3. Protocolo de Raciocínio Hierárquico de Domínios (PNAP-AO)

As modificações de código na plataforma devem respeitar a árvore de dependências e a estrutura modular do workspace unificado:

```text
       [1. Camada de Domínio e Tipagem]
               (/src/types.ts)
                     │
                     ▼
     [2. Camada de Serviços e Integrações]
         (/src/utils/apiService.ts)
                     │
                     ▼
       [3. Módulos de Visualização]
    (/src/components/DeusFundadorPanel.tsx)
    (/src/components/HealthModule.tsx, etc.)
                     │
                     ▼
       [4. Orquestrador Principal]
              (/src/App.tsx)
```

1. **Tipos em Primeiro Lugar:** Qualquer alteração em fluxos de dados de reclusos, estabelecimentos ou guias jurídicas deve ser primeiramente definida e estendida em `/src/types.ts`.
2. **Componentização Descentralizada:** Funções utilitárias complexas, geradores de relatórios e painéis especializados devem viver fora de `/src/App.tsx`. O ficheiro orquestrador central serve apenas para gerir a máquina de estados global, o Workspace Container e a barra de atividades.
3. **Padrão de State Machine Unificada:** O estado da plataforma deve ser centralizado e fluir de cima para baixo (Props down, events up), prevenindo re-renderizações infinitas e mantendo o sincronismo do IndexedDB e filas de contingência sempre ativos.

---

## 4. Auditoria de Desempenho e Compilação

Após qualquer bloco de edições incrementais, o ciclo de verificação é obrigatório:
1. **Linter Rápido (`lint_applet`):** Executado imediatamente para validar integridade de tipos e importações.
2. **Compilação Geral (`compile_applet`):** Executado para certificar que o empacotamento de produção (Vite + esbuild) se mantém íntegro.

---
*Homologado pelo Gabinete de Engenharia e Doutrina de Sistemas da Direção Geral do PNAP-AO.*
