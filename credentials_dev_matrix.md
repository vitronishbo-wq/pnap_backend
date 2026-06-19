# 🇦🇴 PNAP - Plataforma Nacional de Administração Penitenciária
## 🔐 Matriz de Credenciais e Dados de Desenvolvimento (Ambiente Local / WSL2)

Este ficheiro serve como guia de acesso rápido desburocratizado para testes locais das regras de governança (RBAC), filtros de escopo e fluxos do sistema. Estes dados são injetados automaticamente na base de dados local através do script de sementeira (`prisma/seed.ts`).

⚠️ **AVISO DE SEGURANÇA:** Estas credenciais são estritamente para uso em ambiente de Desenvolvimento e Homologação. Antes do início do Piloto em produção, este ficheiro será destruído e o banco de dados será limpo (repudiado) para auditoria real.

---

## 🎛️ 1. Matriz de Utilizadores para Teste de Perfis (RBAC)

Todas as contas abaixo utilizam a palavra-passe padrão de desenvolvimento definida para o projeto.
* **Palavra-passe Padrão:** `Trumanmarcelo_1983`
* **Duração do Token JWT:** 8 Horas (Turno Militar Padrão)

| Utilizador (E-mail) | Nome | Perfil (Role) | Escopo de Visão (Filtro) | Alocação Inicial |
| :--- | :--- | :--- | :--- | :--- |
| `maria.kiala@governo.ao` | Maria Kiala | **SUPER_ADMIN** | **Nacional** (Vê todas as prisões e logs) | Direção Geral / MININT |
| `antonio.benguela@governo.ao` | António Silva | **DIRETOR_PRISAO** | **Local** (Apenas EP Benguela) | EP Benguela |
| `manuel.viana@governo.ao` | Manuel Zua | **DIRETOR_PRISAO** | **Local** (Apenas EP Viana) | EP Viana |
| `guarda.kelson@governo.ao`| Kelson Neto | **OPERADOR_SEGURANCA**| **Operacional** (Ações de Vigilância) | EP Viana |
| `dr.joao@governo.ao` | Dr. João Carlos | **OPERADOR_MEDICO** | **Clínico** (Prontuários e Saúde) | EP Viana |
| `dra.ana@governo.ao` | Dra. Ana Paula | **OPERADOR_SOCIAL** | **Reabilitação** (Reinserção Social) | EP Viana |

---

## 🏢 2. Infraestrutura Estrutural População Mínima (IDs de Teste)

Para testar filtros de rotas e criação dinâmica de dados através das APIs, utilize estes registos base:

### 📍 Estabelecimentos Prisionais Instanciados
1. **EP Viana (Luanda)**
   * Código de Identificação Técnica no Sistema para testes manuais.
2. **EP Benguela (Benguela)**
3. **EP Kakila (Bengo)**
4. **Cadeia Central do Huambo (Huambo)**

---

## 👥 3. Fichas Canónicas de Reclusos para Teste de Escopo (Filtro de Diretor)

Para testar se o **Diretor do EP Viana** consegue ver os reclusos dele, mas é **bloqueado** de ver os reclusos de outras unidades, o script injeta:

* **Recluso 1 (Alocado no EP Viana):**
  * **Nome:** Carlos Mateus "Dji"
  * **NIPC:** `NIPC-2026-0089`
  * **Estado Penal:** Condenado (Pena: 4 anos, 6 meses)
  * **Nível de Segurança:** Média
  * **Vínculo Externo:** Processo PGR nº `PGR-2026-TX9` (Túnel de Integração ativo)

* **Recluso 2 (Alocado na Cadeia Central do Huambo):**
  * **Nome:** Ambrósio Jamba
  * **NIPC:** `NIPC-2026-0412`
  * **Estado Penal:** Preventivo
  * **Nível de Segurança:** Máxima

---

## 🛠️ 4. Protocolo de Diagnóstico de Corrupção do Banco de Dados

Se tentar fazer login com `maria.kiala@governo.ao` e a senha acima e o sistema retornar erro de conexão ou utilizador não encontrado, execute o protocolo de recuperação rápida no seu terminal WSL2:

```bash
# 1. Parar a infraestrutura e destruir os volumes corrompidos
docker compose down -v

# 2. Subir novamente o contentor PostgreSQL limpo
docker compose up -d

# 3. Aplicar as tabelas físicas do Prisma novamente
npx prisma db push

# 4. Forçar a re-população da Matriz de Credenciais
npx prisma db seed
```
