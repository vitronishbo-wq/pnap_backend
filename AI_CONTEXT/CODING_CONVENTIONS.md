# CODING_CONVENTIONS.md — PNAP-AO
*Portal Nacional de Administração Penitenciária — República de Angola*
*Padrões de Escrita de Código, Design de Interface e Princípios Anti-AI-Slop*

---

## 1. REGRAS GERAIS DE CONSTRUÇÃO DE INTERFACE

### 1.1. Combate ao "AI Slop" Visual e Tecnológico (Princípios de Honestidade Arquitetural)
O PNAP-AO é uma ferramenta governamental e de alta seriedade táctica. São **proibidas** as seguintes práticas que degradam a qualidade e realismo da interface:
*   **Proibição de Metadados Fictícios**: Não exiba logs de terminal falsos do tipo `SYSTEM_ONLINE_200`, `PORT: 3000` na moldura do cabeçalho, ou indicadores `● ACTIVE` no rodapé da página que não correspondam a um estado real.
*   **Proibição de Nomes Teatrais**: Use nomes humildes e literais para os componentes. Prefira "Mapeamento Prisional" em vez de *"Chronos Matrix"*.
*   **Aparência Minimalista e Profissional**: O visual padrão baseia-se em fundos escuros refinados (`slate-950`), bordas finas semi-transparentes (`border-slate-800/60`), tipografia Inter/JetBrains Mono de excelente leitura e ritmo de espaçamento limpo.

### 1.2. Práticas de Estilização Utilizando Tailwind CSS
*   **Classes Diretas**: Não crie arquivos CSS adicionais. Toda a estilização deve ser feita usando utilitários do Tailwind direto na propriedade `className`.
*   **Cores e Contraste**: Garantir conformidade de acessibilidade (contraste mínimo de 4.5:1). Utilize cores semânticas padrão:
    *   `rose-500` / `rose-400` para Alertas Críticos e SIEM.
    *   `amber-500` / `amber-450` para Avisos e Riscos Prisionais.
    *   `emerald-500` / `emerald-400` para Status Normal e Concluído.
    *   `slate-400` / `slate-500` para Textos Secundários e Metadados de Auditoria.

---

## 2. REGRAS DE PROGRAMAÇÃO EM TYPESCRIPT

### 2.1. Tipagem Estrita e Assinaturas
*   **Nenhum tipo implicitamente `any`**: Todos os novos métodos e funções utilitárias devem declarar explicitamente os tipos de parâmetros e retorno.
*   **Enums Padronizados**: Utilize declarações padrão de `enum` do TypeScript. Não utilize `const enum`.
*   **Named Imports**: Importações do Lucide React e outros pacotes devem ser feitas via named imports, ex:
    ```typescript
    import { Shield, Radio, ShieldAlert } from "lucide-react";
    ```
    *Evite a desestruturação posterior de objetos gigantes.*

### 2.2. Manipulação de Efeitos e Ciclo de Vida do React (`useEffect`)
*   **Prevenção de Loops de Renderização**: Nunca execute mutações de estado diretamente no corpo do componente.
*   **Garantia de Dependência Limpa**: Os arrays de dependência do `useEffect` devem conter primitivas (ex: `activeTab`, `currentOperator.role`) para evitar disparos infinitos causados pela comparação de referências de objetos ou arrays novos.

---

## 3. IDENTIFICADORES HTML (`id`)
*   Todos os elementos principais de renderização de abas, contêineres de cartografia, modais ou tabelas de logs devem possuir um atributo `id` único e autoexplicativo (ex: `id="intelligence-center-siem"`), facilitando a identificação e manipulação futura do elemento.

---
*Normas aprovadas pelo Gabinete de Engenharia e Garantia de Qualidade de Software do PNAP-AO.*
