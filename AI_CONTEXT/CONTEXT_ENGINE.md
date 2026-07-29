# PNAP-AO Context Engine — Gestão de Contextos e Estado Reativo

Este documento estabelece o modelo de sincronização e reação em tempo-real do motor de contexto do PNAP-AO.

---

## 1. Princípio da Reatividade Contextual

No PNAP-AO, a interface reage dinamicamente com base nas seguintes dimensões de contexto:

1. **Contexto Geográfico/Hierárquico:** O nó selecionado na árvore institucional (ex: Luanda -> EP Viana -> Pavilhão A -> Cela 14).
2. **Contexto de Utilizador/Autorização:** O escopo territorial e perfil funcional do operador logado (Nacional, Provincial ou Local).
3. **Contexto de Redes/Offline (Queue System):** O estado de conectividade da rede angolana em zonas remotas (Online / Offline contingente).

---

## 2. A Máquina de Estados Reativa

O estado reativo global é orquestrado na raiz da aplicação. Mudanças em qualquer uma das três dimensões acima disparam notificações em cascata para todos os sub-painéis:

```text
       +---------------------------------------------+
       |             EXPLORER SELECTION              |
       +---------------------------------------------+
                              │
                    (Dispara Novo Contexto)
                              │
                              ▼
       +---------------------------------------------+
       |             CONTEXT ENGINE STATE            |
       +---------------------------------------------+
              /               │               \
             /                │                \
            ▼                 ▼                 ▼
   [Breadcrumbs bar]   [Workspace Central]  [Right Inspector Panel]
   Mostra o caminho    Adapta os dados      Mostra metadados e
   institucional exato  e ferramentas       ações rápidas do nó
```

### Protocolo de Propagação:
* **Breadcrumbs:** Reconstrói dinamicamente a linhagem do nó ativo (ex: `Ministério do Interior > EP Viana > Pavilhão B`).
* **Workspace:** Monta as tabelas, gráficos de eficiência e lotação específicos da unidade selecionada.
* **Right Inspector:** Atualiza suas ações automáticas (ex: se o nó selecionado for uma cela, mostra o botão "Admitir Recluso nesta cela" e o fator de risco local).
