# PNAP-AO Integrated Operational Workspace — Diretrizes de Interface e Arquitetura

Este documento estabelece o novo paradigma operacional da **Plataforma Nacional de Administração Penitenciária (PNAP-AO)**, abandonando a antiga filosofia de cartões e dashboards genéricos por um ambiente imersivo de engenharia e controlo operacional de alta precisão.

---

## 1. O Princípio Fundamental
A interface é concebida como um **Ambiente Operacional Integrado (Integrated Operational Workspace)**. Inspirado em consoles de engenharia de missão crítica (como VS Code, Azure Portal e Kubernetes Dashboard), o utilizador não interage com painéis estáticos de Business Intelligence (BI), mas trabalha diretamente em contextos organizados de forma hierárquica e fluida.

---

## 2. Anatomia da Interface (Esquema de Três Pilares)

```text
+---------------------------------------------------------------------------------------------------+
|  [ Barra Superior: Context Bar / Breadcrumbs / Perfil do Operador / Logout ]                       |
+---------------------------------------------------------------------------------------------------+
|  [A]          |  [B]                          |  [C]                                              |
|  Activity Bar |  Explorer Panel               |  Central Workspace Body                           |
|               |                               |                                                   |
|  - Dashboard  |  - Domínio Operacional        |  - Abas Superiores (Painel, Comando, SIEM...)     |
|  - Comando    |  - 👑 Direção Geral           |  - Detalhes do Contexto Selecionado               |
|  - SIEM       |  - Engenharia Legislativa     |  - Grelhas de Dados, Mapas e Modelos Preditivos   |
|  - Admissão   |  - Jurisdições & Unidades     |  - Fluxos de Ação e Auditoria Geral               |
|  - Movimentos |    - Província                |                                                   |
|  - CNEL       |      - Município              |                                                   |
|  - Auditoria  |        - EP (Cadeia)          |                                                   |
|  - Definições |          - Pavilhão           |                                                   |
|               |            - Bloco / Cela     |                                                   |
+---------------+-------------------------------+---------------------------------------------------+
```

### [A] Barra de Atividades (Activity Bar) — Estilo IDE (Extrema Esquerda)
* **Largura:** Compacta (`w-12`).
* **Propósito:** Navegação de altíssima velocidade pelos módulos mestres (Lotação, Comando VSAT, Inteligência SIEM, Cadastro, Movimentação, Engenharia Legislativa CNEL, Auditoria e Ajustes).
* **Feedback:** Tooltips persistentes em foco, transição sutil em hover e indicador visual ativo no ícone selecionado.

### [B] Explorador Institucional (Explorer Panel) — Árvore de Diretórios
* **Largura:** Flexível e colapsável (`w-72`).
* **Propósito:** Oferecer uma hierarquia lógica impecável que organiza toda a estrutura orgânica e territorial de Angola em diretórios funcionais de pastas.
* **Componentes principais:**
  1. *👑 Direção Geral (DG):* Consola Suprema de Serviços e Balanceadores Centrais.
  2. *Engenharia Legislativa:* Biblioteca de Doutrina Jurídica, Código Penal e ERD de Schemas Nacionais.
  3. *Jurisdições e Unidades:* Árvore viva que desce desde a Província ao nível municipal, estabelecimento penitenciário, pavilhão de segurança e cela de acolhimento.

### [C] Área Central de Trabalho (Workspace Body)
* **Propósito:** O palco central e scrollável onde as ações de comando, triagem e simulações são executadas em tempo-real.
* **Comportamento:** Ocupa todo o espaço restante (`flex-1 h-full overflow-hidden`). Substitui layouts em grelha fixa ou cartões dispersos por painéis dedicados com abas operacionais rápidas de fácil alternância.

---

## 3. Antipadrões Proibidos (Anti-AI-Slop & Clutter)

Para garantir que a plataforma permaneça profissional, os seguintes antipadrões são estritamente proibidos:
1. **Sem Larping de Telemetria:** É proibido decorar as margens, cabeçalhos ou rodapés com textos do tipo `STATUS: ONLINE`, `PORT: 3000`, `VM_SPEED_OK` ou linhas de log de container simuladas.
2. **Sem Slogans de Marketing:** A interface utiliza termos humildes, sóbrios e literais. Por exemplo, "Relatório de Lotação" em vez de "Relatórios Premium Ultra".
3. **Sem Cartões Soltos Dispersos:** Toda e qualquer informação deve pertencer a uma secção funcional limpa e alinhada com o explorador institucional.
4. **Sem Gráficos Poluídos ou Paletes Arco-Íris:** Limitar o uso de cores a acentos operacionais (Amber para avisos, Emerald para estabilidade/sucesso, Rose para incidentes de alta gravidade, Indigo para doutrina).

---

## 4. Tipografia e Palete de Cores

* **Fonte Primária (UI Geral):** *Inter* (elegante, neutra, alto contraste).
* **Fonte de Headings (Destaque):** *Space Grotesk* ou *Outfit* (sofisticada, espaçada).
* **Fonte de Telemetria e ID Códigos:** *JetBrains Mono* ou *Fira Code* (limpa, precisa para logs de auditoria e tabelas jurídicas).
* **Fundo do Workspace:** Slate Escuro Profundo (`#06080d`), Activity Bar (`#090b0f`), Sidebar (`#0a0d14`).

---

*Documento gerado pelo Centro Nacional de Engenharia Legislativa (CNEL) e homologado pela Direção Geral do PNAP-AO.*
