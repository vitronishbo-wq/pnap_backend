# CODE PENAL KERNEL & MOTOR NACIONAL DE CLASSIFICAÇÃO PENITENCIÁRIA (MNCP)

## Visão Geral
O **MNCP (Motor Nacional de Classificação Penitenciária)** é a camada de inteligência *Law-Driven* do **PNAP-AO (Digital Twin Operacional do Serviço Penitenciário de Angola)**.

Em vez de depender de decisões manuais e discricionárias de operadores locais para a escolha de blocos e celas, o MNCP executa um **funil determinístico de classificação** baseado na legislação angolana (Código Penal - Lei n.º 38/20 e Lei n.º 8/08 de Execução das Penas).

---

## Funil de Decisão Automática

```
                  Ingresso do Recluso
                           │
                           ▼
                       1. Sexo (M / F)
                           │
                           ▼
                2. Situação Jurídica 
     (Detido, Condenado, Preventivo, Medida de Segurança, Menor)
                           │
                           ▼
                    3. Código Penal
     (Grupo ➔ Categoria ➔ Crime ➔ Artigo ➔ Forma Consumada/Tentada)
                           │
                           ▼
                4. Motor Penitenciário
     (Perfil de Perigosidade: ALTA, MÉDIA, BAIXA, ESPECIAL)
                           │
                           ▼
                  5. Bloco Recomendado
                      (A, B, C, D, E)
                           │
                           ▼
                 6. Matriz de Compatibilidade
   (Idade, Doença Contagiosa, Focagem em Fuga, Facção, Vulnerabilidade)
                           │
                           ▼
                 7. Celas Elegíveis & Alocação Sugerida
```

---

## Estrutura do Crime Graph (Base de Dados Executável)

| ID Crime | Grupo | Categoria | Artigo CP | Nível de Segurança | Bloco |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `CP-ART-140` | Crimes contra Pessoas | Vida | Artigo 140.º (Homicídio Simples) | ALTA | Bloco A |
| `CP-ART-142` | Crimes contra Pessoas | Vida | Artigo 142.º (Homicídio Qualificado) | ALTA | Bloco A |
| `CP-ART-150` | Crimes contra Pessoas | Integridade Física | Artigo 150.º (Ofensas Graves) | MÉDIA | Bloco B |
| `CP-ART-165` | Crimes contra Pessoas | Liberdade | Artigo 165.º (Sequestro / Rapto) | ALTA | Bloco A |
| `CP-ART-300` | Crimes contra Património | Propriedade | Artigo 300.º (Roubo c/ Violência) | ALTA | Bloco A |
| `CP-ART-305` | Crimes contra Património | Propriedade | Artigo 305.º (Furto Simples) | BAIXA | Bloco C |
| `CP-ART-315` | Crimes contra Património | Fraudulência | Artigo 315.º (Burla) | MÉDIA | Bloco B |
| `CP-ART-400` | Crimes contra Estado | Ordem Pública | Artigo 400.º (Ultraje / Subversão) | ESPECIAL | Bloco C / D |
| `CP-ART-410` | Crimes contra Estado | Peculato/Corrupção | Artigo 410.º (Peculato) | MÉDIA | Bloco B |
| `CP-ART-450` | Ordem Pública | Narcóticos | Artigo 450.º (Tráfico de Drogas) | ALTA | Bloco A |

---

## Modos de Recebimento e Ingestão do Código Penal Completo

O PNAP-AO está preparado para receber e integrar o Código Penal completo das seguintes formas:
1. **Em bloco / Ficheiro Único**: Ingestão via parsing estruturado de JSON/Markdown direto para a constante `PENAL_CODE_GRAPH` e banco de dados PostgreSQL (`LogSeguranca` / `Legislacao`).
2. **Por Partes / Capítulos**: Ingestão incremental por Livro/Título/Capítulo do Código Penal, sem interromper ou reescrever a lógica da aplicação.
