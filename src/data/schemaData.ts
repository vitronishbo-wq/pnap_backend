export interface Column {
  name: string;
  type: string;
  isPK?: boolean;
  isFK?: boolean;
  isNullable?: boolean;
  fkTarget?: string;
  description: string;
}

export interface Table {
  name: string;
  module: string;
  description: string;
  hasSoftDelete: boolean;
  hasMultiTenancy: boolean;
  hasOfflineSync: boolean;
  columns: Column[];
  relationships: {
    targetTable: string;
    cardinality: "1:N" | "N:1" | "1:1" | "N:M";
    description: string;
  }[];
}

export interface ModuleGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const MODULE_GROUPS: ModuleGroup[] = [
  { id: "core", name: "Core & Sistema", description: "Configurações globais, auditoria e sincronização offline", icon: "Settings" },
  { id: "geography-prisons", name: "Geografia e Infraestrutura", description: "Estabelecimentos penitenciários, pavilhões e celas", icon: "MapPin" },
  { id: "inmates-admissions", name: "População Prisional", description: "Cadastramento, biometria, admissões e gestão de risco", icon: "Users" },
  { id: "judicial", name: "Área Judicial", description: "Crimes, artigos, processos e referências documentais", icon: "Scale" },
  { id: "movements", name: "Movimentação", description: "Transferências, libertações, escoltas e rotas", icon: "GitCommit" },
  { id: "security", name: "Segurança e Disciplina", description: "Incidentes, inteligência, armaria e conselhos disciplinares", icon: "ShieldAlert" },
  { id: "social-medical", name: "Saúde e Reinserção", description: "Consultas médicas, psicologia, educação e trabalho", icon: "HeartPulse" },
  { id: "documents", name: "Gestão Documental", description: "Templates, documentos gerados e verificação QR", icon: "FileText" },
];

export const PENAL_CODE_GROUPS = {
  grupA: {
    id: "Grupo A",
    name: "Crimes contra as Pessoas",
    description: "Crimes que atentam contra a integridade física, de vida, liberdade e dignidade humana.",
    crimes: [
      { id: "A01", article: "Artigo 130º", name: "Homicídio Voluntário", riskLevel: "Máximo", suggestedCellType: "Alta Segurança", penaltyRange: "16 a 24 anos" },
      { id: "A02", article: "Artigo 136º", name: "Homicídio Qualificado", riskLevel: "Máximo", suggestedCellType: "Alta Segurança", penaltyRange: "20 a 24 anos" },
      { id: "A03", article: "Artigo 143º", name: "Ofensas Graves à Integridade Física", riskLevel: "Alto", suggestedCellType: "Segurança Média", penaltyRange: "2 a 8 anos" },
      { id: "A04", article: "Artigo 162º", name: "Violência Doméstica Grave", riskLevel: "Médio", suggestedCellType: "Regime Comum", penaltyRange: "1 a 5 anos" },
      { id: "A05", article: "Artigo 175º", name: "Rapto e Sequestro", riskLevel: "Alto", suggestedCellType: "Alta Segurança", penaltyRange: "8 a 12 anos" },
      { id: "A06", article: "Artigo 182º", name: "Crimes de Natureza Sexual / Violação", riskLevel: "Alto", suggestedCellType: "Ala Protegida / Especial", penaltyRange: "4 a 12 anos" },
    ]
  },
  grupB: {
    id: "Grupo B",
    name: "Crimes contra o Património",
    description: "Infracções penais que visam bens móveis ou imóveis alheios, burla e fraudes.",
    crimes: [
      { id: "B01", article: "Artigo 240º", name: "Furto Simples", riskLevel: "Baixo", suggestedCellType: "Regime Aberto", penaltyRange: "Até 2 anos" },
      { id: "B02", article: "Artigo 241º", name: "Furto Qualificado", riskLevel: "Médio", suggestedCellType: "Regime Comum", penaltyRange: "2 a 8 anos" },
      { id: "B03", article: "Artigo 247º", name: "Roubo com Violência de Coisas ou Pessoas", riskLevel: "Alto", suggestedCellType: "Segurança Média", penaltyRange: "8 a 16 anos" },
      { id: "B04", article: "Artigo 256º", name: "Burla por Intelectualidade ou Abuso de Confiança", riskLevel: "Baixo", suggestedCellType: "Regime Aberto", penaltyRange: "1 a 5 anos" },
      { id: "B05", article: "Artigo 262º", name: "Dano Qualificado", riskLevel: "Médio", suggestedCellType: "Regime Comum", penaltyRange: "Até 3 anos" },
      { id: "B06", article: "Artigo 268º", name: "Receptação Registada de Bens Roubados", riskLevel: "Baixo", suggestedCellType: "Regime Aberto", penaltyRange: "Até 2 anos" },
    ]
  },
  grupC: {
    id: "Grupo C",
    name: "Crimes contra a Ordem e Tranquilidade Pública",
    description: "Perturbação do sossego público, rebeliões, associações ilícitas ou armas proibidas.",
    crimes: [
      { id: "C01", article: "Artigo 298º", name: "Associação Criminosa Organizada", riskLevel: "Alto", suggestedCellType: "Alta Segurança", penaltyRange: "3 a 10 anos" },
      { id: "C02", article: "Artigo 310º", name: "Rebelião e Sedição de Grupos", riskLevel: "Alto", suggestedCellType: "Segurança Média", penaltyRange: "2 a 8 anos" },
      { id: "C03", article: "Artigo 315º", name: "Posse Ilegal de Armas de Fogo e Munições", riskLevel: "Médio", suggestedCellType: "Regime Comum", penaltyRange: "2 a 5 anos" },
      { id: "C04", article: "Artigo 322º", name: "Motim em Instalação de Estado", riskLevel: "Alto", suggestedCellType: "Regime Comum", penaltyRange: "1 a 5 anos" },
      { id: "C05", article: "Artigo 332º", name: "Ultraje aos Símbolos Nacionais de Angola", riskLevel: "Baixo", suggestedCellType: "Regime Aberto", penaltyRange: "Multa a 1 ano" },
      { id: "C06", article: "Artigo 345º", name: "Tráfico de Estupefacientes ou Substâncias", riskLevel: "Alto", suggestedCellType: "Segurança Média", penaltyRange: "4 a 12 anos" },
    ]
  }
};

export const PRISONS_DB: any[] = [];

export const TABLES_METADATA: Table[] = [
  // GLOBAL & CORE (Módulos 1, 2, 3)
  {
    name: "GlobalConfig",
    module: "core",
    description: "Armazena configurações globais do sistema de administração penitenciária (moeda jurídica, tempos limite, chaves de criptografia).",
    hasSoftDelete: false,
    hasMultiTenancy: false,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Chave primária do sistema" },
      { name: "config_key", type: "VARCHAR(100)", description: "Identificador único da configuração" },
      { name: "config_value", type: "TEXT", description: "Valor de configuração em formato comum ou JSON" },
      { name: "created_at", type: "TIMESTAMP", description: "Data de criação do registo público" }
    ],
    relationships: []
  },
  {
    name: "AuditLog",
    module: "audit",
    description: "Registo completo de auditoria para ações sensíveis de utilizadores no sistema de segurança nacional.",
    hasSoftDelete: false,
    hasMultiTenancy: true,
    hasOfflineSync: false,
    columns: [
      { name: "id", type: "BIGSERIAL", isPK: true, description: "Identificador sequencial" },
      { name: "user_id", type: "UUID", isFK: true, fkTarget: "Users", description: "Utilizador autor da acção" },
      { name: "establishment_id", type: "UUID", isFK: true, fkTarget: "Establishment", description: "Identificador multi-tenancy institucional" },
      { name: "action_type", type: "VARCHAR(50)", description: "Acção realizada (CREATE, UPDATE, DELETE, ACCESS, PRINT)" },
      { name: "table_affected", type: "VARCHAR(100)", description: "Tabela que sofreu alteração" },
      { name: "record_id", type: "VARCHAR(100)", description: "ID do registo que foi modificado" },
      { name: "payload_before", type: "JSONB", isNullable: true, description: "Estado do registo antes da alteração" },
      { name: "payload_after", type: "JSONB", isNullable: true, description: "Estado do registo depois da alteração" },
      { name: "client_ip", type: "VARCHAR(45)", description: "IP do dispositivo do operador" },
      { name: "created_at", type: "TIMESTAMP", description: "Carimbo de tempo preciso da transacção" }
    ],
    relationships: [
      { targetTable: "Users", cardinality: "N:1", description: "Mapeado ao utilizador responsável do sistema" }
    ]
  },
  {
    name: "SyncQueue",
    module: "sync",
    description: "Fila de sincronização offline para transações locais geradas em contingência de falta de internet.",
    hasSoftDelete: false,
    hasMultiTenancy: true,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "ID gerado localmente na base IndexedDB" },
      { name: "establishment_id", type: "UUID", isFK: true, fkTarget: "Establishment", description: "Estabelecimento de origem" },
      { name: "endpoint", type: "VARCHAR(255)", description: "API de destino exm: /api/inmates/admit" },
      { name: "payload", type: "JSONB", description: "Conteúdo completo dos dados persistidos offline" },
      { name: "status", type: "VARCHAR(30)", description: "Estado de sincronização (PENDING, SYNCED, FAILED)" },
      { name: "attempts", type: "INTEGER", description: "Número de tentativas de retransmissão automático" },
      { name: "error_log", type: "TEXT", isNullable: true, description: "Mensagem detalhada se falhar o envio" },
      { name: "offline_created_at", type: "TIMESTAMP", description: "Data em que o registo foi guardado localmente" },
      { name: "synced_at", type: "TIMESTAMP", isNullable: true, description: "Data de consolidação no servidor central" }
    ],
    relationships: []
  },

  // INFRAESTRUTURA & GEOGRAFIA (Módulos 4, 5, 6)
  {
    name: "GeographicRegion",
    module: "geography",
    description: "Províncias, Municípios e comunas de Angola para mapeamento de origem e dependência dos reclusos.",
    hasSoftDelete: true,
    hasMultiTenancy: false,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "INTEGER", isPK: true, description: "ID regional" },
      { name: "name", type: "VARCHAR(100)", description: "Nome da província ou município" },
      { name: "parent_id", type: "INTEGER", isFK: true, fkTarget: "GeographicRegion", isNullable: true, description: "Província pai para estruturação hierárquica" },
      { name: "iso_code", type: "VARCHAR(10)", isNullable: true, description: "Código padrão nacional" }
    ],
    relationships: [
      { targetTable: "GeographicRegion", cardinality: "N:1", description: "Subdivide-se em regiões menores recursivamente" }
    ]
  },
  {
    name: "PrisonEstablishment",
    module: "prisons",
    description: "Registo central de prisões e penitenciárias nacionais do MININT / PNAP-AO.",
    hasSoftDelete: true,
    hasMultiTenancy: false,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Identificador do estabelecimento" },
      { name: "name", type: "VARCHAR(150)", description: "Nome oficial da instituição" },
      { name: "province_id", type: "INTEGER", isFK: true, fkTarget: "GeographicRegion", description: "Ligação regional" },
      { name: "official_capacity", type: "INTEGER", description: "Quantidade de vagas do projecto original" },
      { name: "operational_capacity", type: "INTEGER", description: "Lotação máxima real adaptada com segurança" },
      { name: "establishment_type", type: "VARCHAR(50)", description: "Fechado, Aberto, Segurança Máxima ou Hospitalar" }
    ],
    relationships: [
      { targetTable: "Pavilion", cardinality: "1:N", description: "Possui vários pavilhões de alojamento" }
    ]
  },
  {
    name: "Pavilion",
    module: "prisons",
    description: "Pavilhões ou blocos principais dentro de um estabelecimento de segurança.",
    hasSoftDelete: true,
    hasMultiTenancy: true,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Identificador do Pavilhão" },
      { name: "establishment_id", type: "UUID", isFK: true, fkTarget: "PrisonEstablishment", description: "Estabelecimento de pertença" },
      { name: "name", type: "VARCHAR(100)", description: "Designação do pavilhão ex: Pavilhão B" },
      { name: "specialty_tag", type: "VARCHAR(50)", description: "Admissão, Regime Máximo, Ala Médica, Vulneráveis" }
    ],
    relationships: [
      { targetTable: "Cell", cardinality: "1:N", description: "Contém diversas celas ativas" },
      { targetTable: "PrisonEstablishment", cardinality: "N:1", description: "Pertence a uma única penitenciária" }
    ]
  },
  {
    name: "Cell",
    module: "cells",
    description: "Unidade isolada de detenção. Informações da cela e controle de lotação física.",
    hasSoftDelete: true,
    hasMultiTenancy: true,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Chave única da cela" },
      { name: "pavilion_id", type: "UUID", isFK: true, fkTarget: "Pavilion", description: "Pavilhão associado" },
      { name: "cell_number", type: "VARCHAR(30)", description: "Identificação física número ou código" },
      { name: "max_capacity", type: "INTEGER", description: "Quantidade ideal de camas instaladas" },
      { name: "current_occupancy", type: "INTEGER", description: "Contagem de reclusos alojados em tempo real" },
      { name: "cell_type", type: "VARCHAR(50)", description: "Comum, Isolamento, Custódia, Alta Segurança" }
    ],
    relationships: [
      { targetTable: "Pavilion", cardinality: "N:1", description: "Ligado à estrutura de pavilhões" },
      { targetTable: "OccupancyRecord", cardinality: "1:N", description: "Gera históricos de alocação" }
    ]
  },

  // USERS, ROLES & PERMISSIONS (Módulos 7, 8)
  {
    name: "Users",
    module: "users",
    description: "Operadores do sistema (directores de cadeias, guardas prisionais, médicos, juízes e técnicos).",
    hasSoftDelete: true,
    hasMultiTenancy: true,
    hasOfflineSync: false,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Chave do utilizador" },
      { name: "username", type: "VARCHAR(50)", description: "Nome de acesso ao sistema" },
      { name: "full_name", type: "VARCHAR(150)", description: "Nome de identificação completo" },
      { name: "email", type: "VARCHAR(100)", description: "Correio electrónico corporativo" },
      { name: "password_hash", type: "VARCHAR(255)", description: "Sequência segura de login" },
      { name: "establishment_id", type: "UUID", isFK: true, fkTarget: "PrisonEstablishment", isNullable: true, description: "Estabelecimento de lotação principal" },
      { name: "is_active", type: "BOOLEAN", description: "Controla suspensão laboral imediata" }
    ],
    relationships: [
      { targetTable: "UserRole", cardinality: "1:N", description: "Assume múltiplos papéis e privilégios" }
    ]
  },
  {
    name: "Usuario",
    module: "users",
    description: "Tabela de Controle de Acesso e Credenciais de login no Backoffice Administrativo PNAP (Suporte RBAC completo).",
    hasSoftDelete: false,
    hasMultiTenancy: true,
    hasOfflineSync: false,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Identificador de credencial único" },
      { name: "email", type: "VARCHAR(120)", description: "Email único institucional corporativo" },
      { name: "senhaHashed", type: "VARCHAR(255)", description: "Senha criptografada por hashing do admin de missão crítica" },
      { name: "nome", type: "VARCHAR(150)", description: "Nome do utilizador do backoffice" },
      { name: "tipo", type: "VARCHAR(40)", description: "Privilégio: SUPER_ADMIN, DIRETOR_PRISAO, OPERADOR_SEGURANCA, OPERADOR_MEDICO, OPERADOR_SOCIAL" },
      { name: "ativo", type: "BOOLEAN", description: "Indica se o acesso administrativo está ativo" },
      { name: "funcionarioId", type: "UUID", isFK: true, fkTarget: "Funcionario", isNullable: true, description: "Funcionário penitenciário associado" },
      { name: "estabelecimentoId", type: "UUID", isFK: true, fkTarget: "PrisonEstablishment", isNullable: true, description: "Frente prisional de atuação em cargo local" }
    ],
    relationships: [
      { targetTable: "Funcionario", cardinality: "1:1", description: "Vinculado a um quadro militar activo de Angola" },
      { targetTable: "PrisonEstablishment", cardinality: "N:1", description: "Restrição de escopo departamental para directores locais" }
    ]
  },
  {
    name: "SystemPermission",
    module: "permissions",
    description: "Tabela dinâmica de acções permitidas na plataforma PNAP-AO (ex: ADMIT_INMATE, GENERATE_RELEASE_DECREE).",
    hasSoftDelete: false,
    hasMultiTenancy: false,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Chave da permissão" },
      { name: "permission_code", type: "VARCHAR(100)", description: "Identificador textual ex: INMATE_CREATE" },
      { name: "description", type: "TEXT", description: "Significado do privilégio no sistema" },
      { name: "security_clearance", type: "INTEGER", description: "Nível de confidencialidade (1 a 5)" }
    ],
    relationships: []
  },

  // POPULAÇÃO PRISIONAL & CADASTRAMENTO (Módulos 9, 10, 11, 12, 13, 14)
  {
    name: "Inmate",
    module: "inmates",
    description: "Registo cadastral principal do cidadão privado de liberdade.",
    hasSoftDelete: true,
    hasMultiTenancy: true,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Registo Nacional do Recluso (RNR)" },
      { name: "first_name", type: "VARCHAR(80)", description: "Primeiros nomes" },
      { name: "last_name", type: "VARCHAR(80)", description: "Apelidos / Sobrenomes" },
      { name: "identity_card_number", type: "VARCHAR(30)", isNullable: true, description: "Bilhete de Identidade (BI Angola)" },
      { name: "birth_date", type: "DATE", description: "Data de nascimento oficial" },
      { name: "nationality", type: "VARCHAR(60)", description: "País de nacionalidade legal" },
      { name: "gender", type: "VARCHAR(10)", description: "Género biológico (M / F / Outro)" },
      { name: "father_name", type: "VARCHAR(150)", isNullable: true, description: "Nome completo do pai" },
      { name: "mother_name", type: "VARCHAR(150)", isNullable: true, description: "Nome completo da mãe" },
      { name: "risk_level", type: "VARCHAR(20)", description: "Cálculo de perigosidade do recluso (Baixo, Médio, Alto, Máximo)" },
      { name: "status", type: "VARCHAR(50)", description: "Estado na instituição (ADMITTANCE_PENDING, PRESENT, TRANSFERRED, RELEASED)" }
    ],
    relationships: [
      { targetTable: "InmateAdmission", cardinality: "1:N", description: "Possui boletins de admissões na história" },
      { targetTable: "InmateBiometric", cardinality: "1:1", description: "Possui registo complementar biométrico e facial" },
      { targetTable: "CriminalRecord", cardinality: "1:N", description: "Registo de crimes cometidos na sentença" }
    ]
  },
  {
    name: "InmateAdmission",
    module: "admissions",
    description: "Guia e processo de admissão formal de um recluso a um estabelecimento penitenciário específico.",
    hasSoftDelete: true,
    hasMultiTenancy: true,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Identificador da admissão" },
      { name: "inmate_id", type: "UUID", isFK: true, fkTarget: "Inmate", description: "Recluso em causa" },
      { name: "establishment_id", type: "UUID", isFK: true, fkTarget: "PrisonEstablishment", description: "Localização de acolhimento" },
      { name: "cell_id", type: "UUID", isFK: true, fkTarget: "Cell", description: "Cela inicialmente atribuída" },
      { name: "admission_date", type: "TIMESTAMP", description: "Data oficial de registo físico e entrada" },
      { name: "judicial_warrant_ref", type: "VARCHAR(100)", description: "Referência documental do Mandado Judicial" },
      { name: "admission_reason", type: "VARCHAR(100)", description: "Motivo (Prisão Preventiva, Condenação Definitiva, Captura)" }
    ],
    relationships: [
      { targetTable: "Inmate", cardinality: "N:1", description: "Registo correspondente do recluso cadastrado" },
      { targetTable: "Cell", cardinality: "N:1", description: "Vaga ocupada na cela" }
    ]
  },
  {
    name: "InmateTransfer",
    module: "transfers",
    description: "Pedidos, autorizações e execução logística de deslocamento entre cadeias Angolanas.",
    hasSoftDelete: true,
    hasMultiTenancy: true,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Chave do voo prisionário ou ordem" },
      { name: "inmate_id", type: "UUID", isFK: true, fkTarget: "Inmate", description: "Recluso transferido" },
      { name: "source_establishment_id", type: "UUID", isFK: true, fkTarget: "PrisonEstablishment", description: "Penitenciária que envia" },
      { name: "destination_establishment_id", type: "UUID", isFK: true, fkTarget: "PrisonEstablishment", description: "Penitenciária que acolhe" },
      { name: "request_date", type: "TIMESTAMP", description: "Data em que foi desenhada a ordem" },
      { name: "execution_date", type: "TIMESTAMP", isNullable: true, description: "Confirmação física de recepção pelo destino" },
      { name: "status", type: "VARCHAR(40)", description: "Estado (REQUESTED, APPROVED, IN_TRANSIT, RECEIVED, REJECTED)" },
      { name: "escort_unit", type: "VARCHAR(150)", isNullable: true, description: "Unidade policial encarregue da escolta" }
    ],
    relationships: []
  },
  {
    name: "InmateRelease",
    module: "releases",
    description: "Ordem e registo de expiração de pena ou alvará de soltura imediato.",
    hasSoftDelete: true,
    hasMultiTenancy: true,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Chave do processo de soltura" },
      { name: "inmate_id", type: "UUID", isFK: true, fkTarget: "Inmate", description: "Cidadão liberado" },
      { name: "release_date", type: "TIMESTAMP", description: "Momento da saída física do recluso do portão" },
      { name: "authority_person_name", type: "VARCHAR(150)", description: "Juiz ou oficial emissor da ordem de soltura" },
      { name: "release_reason", type: "VARCHAR(100)", description: "Causa (Cumprimento integral de pena, Liberdade Condicional, Amnistia)" },
      { name: "judicial_warrant_ref", type: "VARCHAR(100)", description: "Número de documento de Alvará de Soltura oficial" }
    ],
    relationships: []
  },

  // CRIME & JUDICIAL (Módulos 15, 16)
  {
    name: "PenalArticle",
    module: "crimes",
    description: "Disposições legais do novo Código Penal de Angola (2020/2021) catalogadas.",
    hasSoftDelete: false,
    hasMultiTenancy: false,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "VARCHAR(20)", isPK: true, description: "Código único ex: ART-130" },
      { name: "article_number", type: "VARCHAR(20)", description: "Número legal textual ex: Artigo 130º" },
      { name: "crime_group", type: "VARCHAR(10)", description: "Grupo Penal (Grupo A: Pessoas, Grupo B: Património, Grupo C: Ordem)" },
      { name: "crime_name", type: "VARCHAR(200)", description: "Denominação legal da infracção penal" },
      { name: "base_penalty_min", type: "INTEGER", description: "Pena mínima no estatuto penal (meses)" },
      { name: "base_penalty_max", type: "INTEGER", description: "Pena máxima no estatuto penal (meses)" }
    ],
    relationships: []
  },
  {
    name: "JudicialDocumentReference",
    module: "judicial",
    description: "Referências a documentos judiciais externos sem armazenamento local (Rastreabilidade garantida sem GED completo).",
    hasSoftDelete: true,
    hasMultiTenancy: true,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Identificador sequencial" },
      { name: "inmate_id", type: "UUID", isFK: true, fkTarget: "Inmate", description: "Recluso correlacionado" },
      { name: "document_type", type: "VARCHAR(100)", description: "Tipo (Mandado de Captura, Sentença Condenatória, Alvará, Guia)" },
      { name: "document_number", type: "VARCHAR(100)", description: "Número oficial de identificação mecânica" },
      { name: "issuing_entity", type: "VARCHAR(150)", description: "Entidade emissora (Tribunal Provincial de Luanda, etc.)" },
      { name: "issue_date", type: "DATE", description: "Data em que o papel oficial foi subscrito legalmente" },
      { name: "reception_date", type: "TIMESTAMP", description: "Momento do registo do papel físico na recepção" },
      { name: "external_url_ref", type: "VARCHAR(255)", description: "Meta-link para o servidor governamental central de GED" },
      { name: "validation_hash", type: "VARCHAR(64)", description: "Hash SHA-256 de segurança do ficheiro original" }
    ],
    relationships: [
      { targetTable: "Inmate", cardinality: "N:1", description: "Vinculado ao cadastro do recluso" }
    ]
  },

  // VISITORS & BIOMETRICS (Módulos 17, 18)
  {
    name: "InmateVisitor",
    module: "visitors",
    description: "Cadastro de familiares, advogados e embaixadores autorizados para visitas físicas prisionais.",
    hasSoftDelete: true,
    hasMultiTenancy: true,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Chave do visitante" },
      { name: "full_name", type: "VARCHAR(150)", description: "Nome completo civil" },
      { name: "identity_card_number", type: "VARCHAR(30)", description: "BI ou Passaporte válido" },
      { name: "relationship_type", type: "VARCHAR(50)", description: "Parentesco (Mãe, Pai, Cônjuge, Advogado, Filho)" },
      { name: "is_banned", type: "BOOLEAN", description: "Indica se o visitante está suspenso por indisciplina" }
    ],
    relationships: []
  },
  {
    name: "InmateBiometric",
    module: "biometrics",
    description: "Armazenamento seguro de vectores biométricos, impressões digitais, e fotografia facial.",
    hasSoftDelete: false,
    hasMultiTenancy: true,
    hasOfflineSync: false,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Geralmente vinculado ao UUID do recluso" },
      { name: "inmate_id", type: "UUID", isFK: true, fkTarget: "Inmate", description: "UUID do cidadão prisioneiro" },
      { name: "facial_vector_id", type: "VARCHAR(100)", description: "Referência ao motor do algoritmo de busca facial" },
      { name: "fingerprint_base64_iso", type: "TEXT", description: "Impressão digital convertida no padrão ISO" },
      { name: "scanned_at", type: "TIMESTAMP", description: "Data de leitura dos aparelhos mecânicos" }
    ],
    relationships: [
      { targetTable: "Inmate", cardinality: "1:1", description: "Mapeamento biométrico unívoco por recluso" }
    ]
  },

  // MEDICINA & PSICOLOGIA (Módulos 19, 20)
  {
    name: "MedicalRecordEntry",
    module: "medical",
    description: "Prontuário clínico interno do recluso nos serviços de saúde das cadeias.",
    hasSoftDelete: true,
    hasMultiTenancy: true,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "ID da ficha clínica" },
      { name: "inmate_id", type: "UUID", isFK: true, fkTarget: "Inmate", description: "Paciente associado" },
      { name: "clinical_diagnosis", type: "TEXT", description: "Anotações do médico e diagnóstico patológico" },
      { name: "prescription_details", type: "TEXT", isNullable: true, description: "Lista de medicamentos com dosagem recomendada" },
      { name: "vulnerability_flag", type: "BOOLEAN", description: "Informa se necessita de cuidados de guarda especiais" },
      { name: "check_date", type: "TIMESTAMP", description: "Data da consulta executada" }
    ],
    relationships: []
  },

  // INTELIGÊNCIA, INCIDENTES & DISCIPLINA (Módulos 21, 22)
  {
    name: "IncidentReport",
    module: "incidents",
    description: "Registo de ocorrências anómalas (motins, agressões, apreensões de materiais proíbidos, etc.).",
    hasSoftDelete: true,
    hasMultiTenancy: true,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Chave do incidente" },
      { name: "establishment_id", type: "UUID", isFK: true, fkTarget: "PrisonEstablishment", description: "Estabelecimento de ocorrência" },
      { name: "severity", type: "VARCHAR(20)", description: "Sensibilidade (Leve, Grave, Crítico)" },
      { name: "incident_type", type: "VARCHAR(100)", description: "Agressão, Tentativa de Fuga, Posse Ilícita, Suicídio" },
      { name: "description_summary", type: "TEXT", description: "Relatório de eventos assinado pelos guardas" },
      { name: "date_occurred", type: "TIMESTAMP", description: "Momento exacto do facto relatado" }
    ],
    relationships: []
  },
  {
    name: "IntelligenceReport",
    module: "discipline",
    description: "Informações altamente sigilosas referentes a conspirações, facções criminosas e risco de fuga geral.",
    hasSoftDelete: false,
    hasMultiTenancy: true,
    hasOfflineSync: false,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Código confidencial" },
      { name: "establishment_id", type: "UUID", isFK: true, fkTarget: "PrisonEstablishment", description: "Unidade envolvida" },
      { name: "inmate_id_subject", type: "UUID", isFK: true, fkTarget: "Inmate", isNullable: true, description: "Suspeito principal monitorizado" },
      { name: "confidential_notes", type: "TEXT", description: "Notas do director de segurança e fontes" },
      { name: "threat_score", type: "INTEGER", description: "Indicador rápido de escala de colapso de 1 a 10" },
      { name: "logged_at", type: "TIMESTAMP", description: "Entrada do registo de inteligência" }
    ],
    relationships: []
  },

  // ARMAMENTOS, ATIVOS, INSTRUÇÃO (Módulos 23, 24, 25, 26)
  {
    name: "ArmouryAsset",
    module: "armoury",
    description: "Controle do inventário físico de defesa táctica, munições e coletes do corpo de vigilância penitenciária.",
    hasSoftDelete: true,
    hasMultiTenancy: true,
    hasOfflineSync: false,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Chave primária mecânica" },
      { name: "asset_serial_number", type: "VARCHAR(50)", description: "Número de série oficial da arma" },
      { name: "asset_type", type: "VARCHAR(100)", description: "Arma Ligeira, Spray, Bastão, Escudo, Munições" },
      { name: "state_condition", type: "VARCHAR(40)", description: "Conservação (EXCELENT, OPERATIONAL, MAINTENANCE, DAMAGE)" },
      { name: "assigned_user_id", type: "UUID", isFK: true, fkTarget: "Users", isNullable: true, description: "Operador que possui a guarda da arma em turno" }
    ],
    relationships: []
  },

  // DOCUMENTOS GERADOS & TEMPLATES (Módulos 27, 28)
  {
    name: "DocumentTemplate",
    module: "documents",
    description: "Modelos dinâmicos em formato JSON de guias de acolhimento ou termos administrativos.",
    hasSoftDelete: true,
    hasMultiTenancy: false,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "ID do modelo" },
      { name: "template_title", type: "VARCHAR(120)", description: "Designação comercial ex: Guia de Soltura" },
      { name: "content_schema", type: "TEXT", description: "Html/Json modelo estrutural do template de impressão" },
      { name: "version", type: "INTEGER", description: "Controle contra inconsistências de layout" },
      { name: "is_active", type: "BOOLEAN", description: "Informa se o template continua oficial" }
    ],
    relationships: []
  },
  {
    name: "GeneratedDocument",
    module: "documents",
    description: "Documentos oficiais gerados eletronicamente pela PNAP-AO munidos com assinatura e código de validação QR.",
    hasSoftDelete: true,
    hasMultiTenancy: true,
    hasOfflineSync: true,
    columns: [
      { name: "id", type: "UUID", isPK: true, description: "Identificador mecânico da gravação" },
      { name: "document_code", type: "VARCHAR(50)", description: "Código único Angolano ex: AO-PNAP-2026-000001" },
      { name: "template_id", type: "UUID", isFK: true, fkTarget: "DocumentTemplate", description: "Ligação ao layout de design" },
      { name: "inmate_id", type: "UUID", isFK: true, fkTarget: "Inmate", isNullable: true, description: "Vinculado opcionalmente a um recluso" },
      { name: "user_author_id", type: "UUID", isFK: true, fkTarget: "Users", description: "Utilizador que apertou o botão" },
      { name: "content_populated", type: "JSONB", description: "Dados estruturados do documento no acto da geração" },
      { name: "validation_qr_payload", type: "TEXT", description: "Endereço absoluto ou texto contido no selo de segurança QR" },
      { name: "created_at", type: "TIMESTAMP", description: "Instante exacto da assinatura digital e geração" }
    ],
    relationships: [
      { targetTable: "Inmate", cardinality: "N:1", description: "Focado no recluso relacionado pelo documento" },
      { targetTable: "DocumentTemplate", cardinality: "N:1", description: "Layout correspondente" }
    ]
  }
];

export interface InmateState {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  birthDate: string;
  gender: string;
  idCard: string;
  biNumber?: string;
  fatherName: string;
  motherName: string;
  nationality: string;
  crimeId: string;
  riskLevel: string;
  suggestedCellType: string;
  assignedPrisonId: string;
  prisonId?: string;
  assignedPavilionId: string;
  assignedBlockId: string;
  assignedCellNumber: string;
  status: "ACTIVE" | "PENDING_SYNC" | "TRANSFERRED" | "RELEASED" | string;
  documentCode: string;
  nrep?: string;
  regime?: string;
  photo?: string;

  // Extended registration fields
  nickname?: string;
  nif?: string;
  civilStatus?: string;
  birthPlace?: string;
  height?: string;
  weight?: string;
  skinColor?: string;
  eyeColor?: string;
  bloodType?: string;
  distinctiveMarks?: string;
  scars?: string;
  tattoos?: string;
  physicalDisabilities?: string;
  facialRecognitionLocked?: boolean;
  fingerprintCount?: number;
  spouse?: string;
  children?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  familyAddress?: string;
  previousAddress?: string;
  municipality?: string;
  province?: string;
  phone?: string;
  email?: string;
  processNumber?: string;
  court?: string;
  judge?: string;
  arrestDate?: string;
  convictionDate?: string;
  sentenceDuration?: string;
  prisonRegime?: string;
  expectedReleaseDate?: string;
  hasArrestWarrant?: string;
  hasDeliveryWarrant?: string;
  associatedCrimes?: string;
  criminalGroup?: string;
  gangAffiliation?: string;
  isRecidivist?: string;
  escapeRisk?: string;
  suicideRisk?: string;
  violenceRisk?: string;
  staffRisk?: string;
  otherInmatesRisk?: string;
  specialVigilanceNeeded?: string;
  generalHealthStatus?: string;
  chronicDiseases?: string;
  drugDependency?: string;
  currentMedication?: string;
  psychiatricHistory?: string;
  contagiousDiseases?: string;
  medicalExamResults?: string;
  emotionalStatus?: string;
  observedBehavior?: string;
  aggressiveTendency?: string;
  suicidalTendency?: string;
  preliminaryDiagnosis?: string;
  psychologicalRecommendations?: string;
  academicLevel?: string;
  profession?: string;
  professionalCourses?: string;
  technicalSkills?: string;
  workExperience?: string;
  belongingsList?: string; // JSON representation of items
  visitorsList?: string; // JSON representation of visitors
  admittingOfficer?: string;
  registrationHash?: string;
  qrCodeValidationValue?: string;
}

export const INITIAL_INMATES: InmateState[] = [
  {
    id: "AO-REC-089",
    firstName: "Manuel",
    lastName: "Domingos João",
    birthDate: "1994-08-14",
    gender: "Masculino",
    idCard: "002847192LA049",
    fatherName: "Domingos João Sebastião",
    motherName: "Amélia António Domingos",
    nationality: "Angolana",
    crimeId: "A01", // Homicídio Voluntário
    riskLevel: "Máximo",
    suggestedCellType: "Alta Segurança",
    assignedPrisonId: "PRIS-01", // Viana
    assignedPavilionId: "PAV-B",
    assignedBlockId: "BLK-B2",
    assignedCellNumber: "Cela B2-04",
    status: "ACTIVE",
    documentCode: "AO-PNAP-2026-000492"
  },
  {
    id: "AO-REC-115",
    firstName: "Carla",
    lastName: "Antónia Gouveia",
    birthDate: "2001-11-23",
    gender: "Feminino",
    idCard: "001928475LA090",
    fatherName: "Mateus Gouveia",
    motherName: "Teresa Francisco Gouveia",
    nationality: "Angolana",
    crimeId: "B01", // Furto Simples
    riskLevel: "Baixo",
    suggestedCellType: "Regime Aberto",
    assignedPrisonId: "PRIS-02", // Kakila
    assignedPavilionId: "PAV-K1",
    assignedBlockId: "BLK-K1A",
    assignedCellNumber: "Cela K1A-02",
    status: "ACTIVE",
    documentCode: "AO-PNAP-2026-000501"
  },
  {
    id: "AO-REC-204",
    firstName: "Sebastião",
    lastName: "Kiala Mendes",
    birthDate: "1988-04-30",
    gender: "Masculino",
    idCard: "004829304BO031",
    fatherName: "Bernardo Mendes",
    motherName: "Katarina Rosa Kiala",
    nationality: "Angolana",
    crimeId: "C03", // Posse Ilegal de Armas
    riskLevel: "Médio",
    suggestedCellType: "Regime Comum",
    assignedPrisonId: "PRIS-01", // Viana
    assignedPavilionId: "PAV-A",
    assignedBlockId: "BLK-A1",
    assignedCellNumber: "Cela A1-09",
    status: "ACTIVE",
    documentCode: "AO-PNAP-2026-000512"
  }
];

export const INITIAL_SYNC_QUEUE = [
  {
    id: "loc-91823",
    type: "Admissão",
    description: "Registo do recluso António Lopes Ngola por Roubo com Violência",
    timestamp: "2026-06-13T09:40:00Z",
    payload: { firstName: "António", lastName: "Lopes Ngola" }
  },
  {
    id: "loc-91824",
    type: "Consulta Médica",
    description: "Prescrição de Analgésicos para Recluso Manuel Domingos (AO-REC-089)",
    timestamp: "2026-06-13T09:50:00Z",
    payload: { inmateId: "AO-REC-089", drug: "Paracetamol" }
  }
];
