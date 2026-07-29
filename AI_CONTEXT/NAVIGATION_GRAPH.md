# PNAP-AO Navigation Graph — Grafo de Fluxos e Estados da UI

Esta especificação define as transições válidas e o mapa de navegação interna do PNAP-AO, garantindo coerência visual e prevenção de estados desorientados para o utilizador final.

---

## 1. O Grafo de Transições Válidas

A navegação no PNAP-AO é estrita. O operador move-se horizontalmente entre os contextos principais da barra de atividades e verticalmente na árvore institucional:

```text
                  [NÓS DO EXPLORER LATERAL]
                             │
       ┌─────────────────────┼─────────────────────┐
       ▼                     ▼                     ▼
 [Visualização:        [Visualização:        [Visualização:
   Nacional]             Provincial]           Unidade Física (EP)]
       │                     │                     │
       ▼                     ▼                     ▼
Painel Geral de       Lista de Cadeias e    Lista de Pavilhões,
Lotação & Risco       Risco da Província    Celas e Alertas Locais
```

### Regras de Transição de Abas e Nós:
* Ao clicar num nó da árvore territorial, o sistema redefine automaticamente o `activeTab` para `"dashboard"` (ou o ecrã correspondente à visualização institucional ativa).
* Ao clicar em pastas do topo do Explorer (como "Consola Suprema DGP" ou "Doutrina CNEL"), o sistema redireciona a área de trabalho para as respetivas vistas administrativas dedicadas.

---

## 2. Prevenção de Desorientação (The No-Lost Rule)

Para garantir que o operador saiba exatamente onde está a interagir, a UI implementa os seguintes mecanismos de segurança na navegação:
1. **Breadcrumbs Estritos:** Sempre visíveis no cabeçalho de trabalho, permitindo clique rápido para retornar a qualquer nível pai na hierarquia.
2. **Sincronismo de Seleção:** Ao navegar por um nó na árvore, esse nó permanece realçado visualmente (`bg-slate-900 border-amber-500`) na barra lateral esquerda, mantendo uma âncora visual física estável.
3. **Guardas de Navegação de Missão:** Se houver um formulário de missão em edição ativo, o sistema exibe um aviso sonoro/visual antes de permitir a mudança de nó na árvore para evitar perda involuntária de dados preenchidos.
