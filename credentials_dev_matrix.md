# 🇦🇴 PNAP - Plataforma Nacional de Administração Penitenciária
## 🔐 Matriz de Credenciais e Governança (Ambiente Canónico / Firebase + Render)

Este ficheiro serve como guia de consulta e governança institucional para validação de perfis (RBAC), filtros de escopo territorial e fluxos do sistema. A persistência canónica é governada pelo **Cloud Firestore** com orquestração segura pelo **Firebase Admin SDK** no backend Render API.

---

## 🎛️ 1. Matriz de Utilizadores para Teste de Perfis (RBAC)

Todas as contas institucionais utilizam a política de autenticação via Token JWT assinado pelo servidor.
* **Palavra-passe Padrão de Homologação:** `Trumanmarcelo_1983`
* **Duração do Token JWT:** 8 Horas (Turno Militar Padrão)
* **Fonte Única da Verdade:** Cloud Firestore (Coleção `reclusos`, `estabelecimentos`, `auditoria_logs`)

| Utilizador (E-mail) | Nome | Perfil (Role) | Escopo de Visão (Filtro) | Alocação Inicial |
| :--- | :--- | :--- | :--- | :--- |
| `maria.kiala@governo.ao` | Maria Kiala | **SUPER_ADMIN** | **Nacional** (Vê todas as prisões e logs) | Direção Geral / MININT |
| `antonio.benguela@governo.ao` | António Silva | **DIRETOR_PRISAO** | **Local** (Apenas EP Benguela) | EP Benguela |
| `manuel.viana@governo.ao` | Manuel Zua | **DIRETOR_PRISAO** | **Local** (Apenas EP Viana) | EP Viana |
| `guarda.kelson@governo.ao`| Kelson Neto | **OPERADOR_SEGURANCA**| **Operacional** (Ações de Vigilância) | EP Viana |
| `dr.joao@governo.ao` | Dr. João Carlos | **OPERADOR_MEDICO** | **Clínico** (Prontuários e Saúde) | EP Viana |
| `dra.ana@governo.ao` | Dra. Ana Paula | **OPERADOR_SOCIAL** | **Reabilitação** (Reinserção Social) | EP Viana |
| `jmbanza@governo.ao` | Dr. Júlio Mbanza | **DIRECTOR_PROVINCIAL** | **Provincial** (Apenas Cadeias no Huambo) | Direção Provincial Huambo |
| `director.huambo@governo.ao` | Bento Caetano | **DIRETOR_PRISAO** | **Local** (Apenas Cadeia Central Huambo) | CC Huambo |
| `chefe.seg.huambo@governo.ao` | João Bernardo | **OPERADOR_SEGURANCA** | **Risco & Vigilância** (Segurança Huambo) | CC Huambo |

---

## 🏢 2. Infraestrutura Estrutural Canónica (Cloud Firestore)

* **EP Viana (Luanda):** `PRIS-VIANA` (Capacidade: 800)
* **EP Benguela (Benguela):** `PRIS-BENGUELA` (Capacidade: 600)
* **Cadeia Central do Huambo (Huambo):** `PRIS-HUAMBO` (Capacidade: 500)

---

## 🔒 3. Separação Dual-Track e Não-Repúdio
1. **Operações Normais:** Consultas de fichas e prontuários executadas diretamente pelo cliente PWA no Cloud Firestore com cache local IndexedDB.
2. **Operações Críticas:** Transferências, solturas e modificações de nível de risco são processadas exclusivamente pelo Render API com selo criptográfico SHA-256 HMAC e confirmação pelo Firebase Admin SDK.

