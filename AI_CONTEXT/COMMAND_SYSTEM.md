# PNAP-AO Command System & Palette Spec

Este documento rege a especificação técnica e comportamental do sistema de **Command Palette (`Ctrl+K`)** integrado no PNAP-AO.

---

## 1. Visão Geral

A **Command Palette** é a ferramenta de produtividade máxima para operadores experientes. Inspirada no console do VS Code, ela permite navegar por toda a infraestrutura nacional, iniciar missões complexas e filtrar dados penais sem a necessidade de clicar em múltiplos submenus.

```text
                  +-----------------------------------+
                  |      Ativação: Ctrl + K           |
                  +-----------------------------------+
                                    │
                                    ▼
                  +-----------------------------------+
                  |    Modal Suspenso (Comando)       |
                  |  > Admissão                       |
                  |  > EP Viana                       |
                  |  > Ver Legislação                 |
                  +-----------------------------------+
```

---

## 2. Catálogo de Comandos Integrados

O interpretador de comandos aceita palavras-chave associadas a ações operacionais estritas:

### A. Navegação de Contexto
* `> Abrir EP Viana` -> foca o nó do EP Viana e muda o painel.
* `> Abrir EP Kakila` -> foca o nó do EP Kakila.
* `> Doutrina` / `> Código Penal` -> abre o Centro de Doutrina CNEL.
* `> Auditoria` -> abre a tela de Auditoria Geral.

### B. Iniciação de Missões (Mission Workspaces)
* `> Nova Admissão` / `> Cadastro` -> inicia a Missão de Nova Admissão de Recluso.
* `> Nova Transferência` -> inicia a Missão de Transferência e Trânsito.
* `> Alerta de Incidente` -> abre o painel tático de contingência de emergência.

### C. Utilitários Rápidos
* `> Modo Offline` -> força o sistema a entrar em contingência local.
* `> Limpar Filtros` -> redefine todas as pesquisas e filtros regionais.
* `> Sair` -> encerra a sessão ativa do operador com segurança.

---

## 3. Diretrizes de Implementação UI/UX

* **Gatilho Físico:** Ativação instantânea via combinação de teclas `Ctrl + K` ou `Ctrl + Shift + P`. Um botão visível tipo "Procurar comandos... [Ctrl+K]" é inserido na barra de cabeçalho central.
* **Filtro Difuso (Fuzzy Matching):** À medida que o utilizador escreve, a lista é refinada instantaneamente por relevância.
* **Estética:** Fundo de altíssimo contraste (`#040609`), borda âmbar fina para indicar foco ativo, itens selecionáveis via setas do teclado e confirmação via `Enter`.
