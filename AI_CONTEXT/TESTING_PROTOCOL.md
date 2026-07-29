# TESTING & VALIDATION PROTOCOL — PNAP-AO
*Portal Nacional de Administração Penitenciária — República de Angola*
*Continuous Integration Guardrails & Verification Workflows*

---

## 1. PIPELINE DE VALIDAÇÃO REATIVO (ESTÁGIOS DE VERIFICAÇÃO)

Após a realização de qualquer alteração de código, o agente de IA **deve** executar e concluir com sucesso as etapas de testes abaixo para garantir que o PNAP-AO permaneça 100% íntegro e operacional:

```
           [ALTERAÇÃO DE CÓDIGO CONCLUÍDA]
                         │
                         ▼
             [ETAPA 1: VERIFICAÇÃO DE SINTAXE]
           - Executar ferramenta `lint_applet`
           - Corrigir avisos, imports quebrados ou tipos implícitos
                         │
                         ▼
             [ETAPA 2: COMPILAÇÃO DO APLICATIVO]
           - Executar ferramenta `compile_applet`
           - Certificar-se de que o build de produção (Vite) conclui com sucesso
                         │
                         ▼
             [ETAPA 3: TESTES COMPORTAMENTAIS]
           - Validar visualmente e logicamente os estados reativos
           - Garantir integridade de transações críticas (não-repúdio)
```

---

## 2. PROCEDIMENTO DE TESTE POR DOMÍNIO DE SOBERANIA

Dependendo do domínio afetado, verifique os seguintes fluxos reativos na interface do usuário (simulação):

### 2.1. Admissão e Controle Penal (`Admissions`)
1.  **Ação**: Realizar uma triagem e admissão de recluso.
2.  **Validação**: Verifique se o recluso foi corretamente adicionado à lista do pavilhão correspondente e se um registro foi incluído em `logs` do sistema.

### 2.2. Segurança e Monitoramento Táctico (`centro-comando`)
1.  **Ação**: Despachar uma força militar rápida (PIR) para um incidente em Cabinda ou Luanda.
2.  **Validação**: Verifique se o alerta visual muda de estado, se a unidade é marcada no mapa vetorial e se o status global de segurança reage proporcionalmente.

### 2.3. Centro de Inteligência (`centro-inteligencia`)
1.  **Ação**: Injetar um ataque de injeção SQL ou Brute Force na consola de simulação SIEM.
2.  **Validação**: Certifique-se de que a regra correspondente (`RULE-01` a `RULE-05`) dispara de imediato, que o IP/Operador atacante entra em quarentena ou é suspenso e que os alertas vermelhos piscam no cabeçalho.

---

## 3. AÇÕES EM CASO DE FALHA DE COMPILAÇÃO
1.  **Erro de Tipo (`TypeScript`)**:
    *   Verificar interfaces compartilhadas em `src/App.tsx`.
    *   Não mascarar erros utilizando `any` a menos que explicitado em regras legadas de compatibilidade.
2.  **Erro de Importação**:
    *   Assegurar named imports limpos no Lucide React.
    *   Verificar caminhos relativos de componentes.

---
*Nenhum código entra em produção sem aprovação no protocolo de testes.*
