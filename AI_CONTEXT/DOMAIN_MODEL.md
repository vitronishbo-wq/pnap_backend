# PNAP-AO Domain Model — Entidades e Regras de Negócio

Este documento mapeia o modelo de dados de domínio essencial do **Serviço Penitenciário de Angola** implementado no sistema.

---

## 1. O Grafo de Domínio Territorial

A estrutura física e geográfica do sistema é representada por um grafo hierárquico estrito:

```text
 [República de Angola]
         │
         ▼
    [Província]
         │
         ▼
   [Município]
         │
         ▼
 [Estabelecimento Penitenciário (EP)]
         │
         ▼
    [Pavilhão]
         │
         ▼
    [Bloco/Cela]
         │
         ▼
     [Recluso]
```

### Entidades Core:

1. **Província (Province):**
   * Agrupador regional de alto nível (ex: Luanda, Benguela, Huíla).
   * Define o escopo territorial para direções provinciais.

2. **Município (Municipality):**
   * Subdivisão provincial que abriga os Estabelecimentos Penitenciários físicos.

3. **Estabelecimento Penitenciário (Prison / EP):**
   * A unidade prisional física real. Possui capacidade máxima de projeto, efetivo ativo e nível de risco operacional baseado na superlotação.

4. **Pavilhão (Pavilion):**
   * Setores internos de custódia (ex: Pavilhão de Segurança Máxima, Pavilhão de Regime Aberto).

5. **Cela (Cell):**
   * A unidade atômica de custódia. Possui capacidade teórica (ex: 12 vagas) e população de reclusos em tempo-real.

---

## 2. O Modelo do Recluso (Inmate / PPL)

Representa a Pessoa Privada de Liberdade (PPL) sob custódia do Estado angolano:

```typescript
interface Inmate {
  id: string; // ID Nacional NREP-AO
  nome: string;
  dataNascimento: string;
  codigoIdentificacao: string; // Ex: NREP-2026-XXXX
  situacaoJuridica: "PREVENTIVO" | "CONDENADO";
  penaAnos?: number;
  delitoArtigo: string;
  nacionalidade: string;
  grauPericulosidade: "BAIXO" | "MEDIO" | "ALTO";
  assignedPrisonId: string;
  assignedCellId: string;
  biometriaCadastrada: boolean;
  dataAdmissao: string;
}
```

---

## 3. Regras de Transição e Validação de Estado

1. **Limite de Lotação Estrito:** Uma cela não deve idealmente ultrapassar 100% da sua capacidade projetada. Caso ultrapasse, o nó territorial na árvore assume cor Amber/Rose indicando alerta imediato.
2. **Compatibilidade Penal:** Reclusos preventivos não devem ser alocados nas mesmas celas físicas que reclusos condenados por sentença transitada em julgado.
3. **Escopo Operacional (Princípio de Privilégio Mínimo):**
   * Diretores Gerais operam em nível **Nacional** (leitura/escrita global).
   * Diretores Provinciais operam apenas no nível da sua **Província** (leitura regional, escrita limitada).
   * Chefes de Turno operam apenas no seu **Estabelecimento Penitenciário** (escrita local de celas e relatórios).
