// ============================================================================
// PNAP-AO • INSTITUTIONAL & OPERATIONAL KERNEL SEED DATA & ENGINE
// Estrutura Canónica: Entes, Pessoas, Matriz de Competências, Turnos e Auditoria
// ============================================================================

import {
  OrgNode,
  TerritoryNode,
  Person,
  DutyShift,
  OperationalMission,
  TemporaryCredential,
  AuthorizationMatrixRule,
  KernelAuditRecord,
  SpecialtyType,
  AuthorizationEvaluationRequest,
  AuthorizationEvaluationResult
} from "../types/institutionalKernel";

// ----------------------------------------------------------------------------
// 1. ORGANIZATIONAL KERNEL: Árvore Administrativa Institucional
// ----------------------------------------------------------------------------
export const SEED_ORG_NODES: OrgNode[] = [
  {
    id: "ORG-MININT",
    name: "Ministério do Interior (MININT)",
    code: "MININT-CENTRAL",
    level: "MININT",
    type: "MINISTERIO",
    parentId: null,
    statutoryBasis: "Constituição da República de Angola & Lei Orgânica do MININT",
    active: true
  },
  {
    id: "ORG-DGSP",
    name: "Direcção Geral do Serviço Penitenciário",
    code: "DGSP-NACIONAL",
    level: "DIRECAO_GERAL",
    type: "DIRECAO_SUPERIOR",
    parentId: "ORG-MININT",
    statutoryBasis: "Decreto Presidencial n.º 184/17 de 11 de Agosto",
    active: true
  },
  {
    id: "ORG-DN-OPER",
    name: "Direcção Nacional de Operações e Segurança Prisional",
    code: "DNP-OPER",
    level: "DIRECAO_GERAL",
    type: "DIRECAO_NACIONAL",
    parentId: "ORG-DGSP",
    statutoryBasis: "Decreto Presidencial n.º 184/17 - Art. 12.º",
    active: true
  },
  {
    id: "ORG-DN-JUD",
    name: "Direcção Nacional de Controlo e Execução Penal",
    code: "DNP-PENAL",
    level: "DIRECAO_GERAL",
    type: "DIRECAO_NACIONAL",
    parentId: "ORG-DGSP",
    statutoryBasis: "Decreto Presidencial n.º 184/17 - Art. 14.º",
    active: true
  },
  {
    id: "ORG-DP-LUANDA",
    name: "Direcção Provincial do Serviço Penitenciário de Luanda",
    code: "DP-LUA",
    level: "DIRECAO_PROVINCIAL",
    type: "DIRECAO_PROVINCIAL",
    parentId: "ORG-DGSP",
    provinceCode: "Luanda",
    statutoryBasis: "Decreto Presidencial n.º 184/17 - Secção II",
    active: true
  },
  {
    id: "ORG-DP-BENGUELA",
    name: "Direcção Provincial do Serviço Penitenciário de Benguela",
    code: "DP-BGL",
    level: "DIRECAO_PROVINCIAL",
    type: "DIRECAO_PROVINCIAL",
    parentId: "ORG-DGSP",
    provinceCode: "Benguela",
    statutoryBasis: "Decreto Presidencial n.º 184/17 - Secção II",
    active: true
  },
  {
    id: "ORG-DP-HUILA",
    name: "Direcção Provincial do Serviço Penitenciário da Huíla",
    code: "DP-HUI",
    level: "DIRECAO_PROVINCIAL",
    type: "DIRECAO_PROVINCIAL",
    parentId: "ORG-DGSP",
    provinceCode: "Huíla",
    statutoryBasis: "Decreto Presidencial n.º 184/17 - Secção II",
    active: true
  },
  {
    id: "ORG-EP-VIANA",
    name: "Estabelecimento Penitenciário de Viana (EP Viana)",
    code: "EP-VIANA-01",
    level: "ESTABELECIMENTO",
    type: "ESTAB_PENITENCIARIO",
    parentId: "ORG-DP-LUANDA",
    provinceCode: "Luanda",
    prisonId: "AO-LUA-001",
    statutoryBasis: "Despacho Ministerial de Criação do EP Viana",
    active: true
  },
  {
    id: "ORG-EP-CALOMBOLOCA",
    name: "Estabelecimento Penitenciário de Calomboloca (Máxima Segurança)",
    code: "EP-CALOM-01",
    level: "ESTABELECIMENTO",
    type: "ESTAB_PENITENCIARIO",
    parentId: "ORG-DP-LUANDA",
    provinceCode: "Luanda",
    prisonId: "AO-LUA-002",
    statutoryBasis: "Despacho Ministerial de Segurança Especial",
    active: true
  },
  {
    id: "ORG-EP-CAVACO",
    name: "Estabelecimento Penitenciário do Cavaco (Benguela)",
    code: "EP-CAV-01",
    level: "ESTABELECIMENTO",
    type: "ESTAB_PENITENCIARIO",
    parentId: "ORG-DP-BENGUELA",
    provinceCode: "Benguela",
    prisonId: "AO-BGL-001",
    active: true
  },
  {
    id: "ORG-EP-BENTIABA",
    name: "Estabelecimento Penitenciário do Bentiaba (Regime Aberto Agrícola)",
    code: "EP-BEN-01",
    level: "ESTABELECIMENTO",
    type: "ESTAB_PENITENCIARIO",
    parentId: "ORG-DP-HUILA",
    provinceCode: "Huíla",
    prisonId: "AO-NAM-001",
    active: true
  },
  // Órgãos Internos dos Estabelecimentos (Secções e Serviços)
  {
    id: "ORG-SEC-CTRL-VIANA",
    name: "Secção de Controlo Penal e Registo Penitenciário",
    code: "VIANA-SEC-CTRL",
    level: "SECCAO_SERVICO",
    type: "SECCAO",
    parentId: "ORG-EP-VIANA",
    provinceCode: "Luanda",
    prisonId: "AO-LUA-001",
    active: true
  },
  {
    id: "ORG-SEC-OPER-VIANA",
    name: "Secção de Segurança, Guarda e Vigilância Prisional",
    code: "VIANA-SEC-GUARDA",
    level: "SECCAO_SERVICO",
    type: "SECCAO",
    parentId: "ORG-EP-VIANA",
    provinceCode: "Luanda",
    prisonId: "AO-LUA-001",
    active: true
  },
  {
    id: "ORG-SEC-SAUDE-VIANA",
    name: "Posto Médico e Serviço de Assistência Clínica",
    code: "VIANA-SEC-SAUDE",
    level: "SECCAO_SERVICO",
    type: "SERVICO_ESPECIALIZADO",
    parentId: "ORG-EP-VIANA",
    provinceCode: "Luanda",
    prisonId: "AO-LUA-001",
    active: true
  },
  {
    id: "ORG-SEC-CCTV-VIANA",
    name: "Centro de Transmissões, Rádio e Videovigilância CCTV",
    code: "VIANA-SEC-CCTV",
    level: "SECCAO_SERVICO",
    type: "SERVICO_ESPECIALIZADO",
    parentId: "ORG-EP-VIANA",
    provinceCode: "Luanda",
    prisonId: "AO-LUA-001",
    active: true
  }
];

// ----------------------------------------------------------------------------
// 2. TERRITORIAL KERNEL: Geografia e Infraestrutura Física Prisional
// ----------------------------------------------------------------------------
export const SEED_TERRITORY_NODES: TerritoryNode[] = [
  {
    id: "GEO-AO",
    name: "República de Angola",
    code: "AO",
    level: "COUNTRY",
    parentId: null,
    active: true
  },
  {
    id: "GEO-PROV-LUA",
    name: "Província de Luanda",
    code: "LUA",
    level: "PROVINCE",
    parentId: "GEO-AO",
    provinceCode: "Luanda",
    active: true
  },
  {
    id: "GEO-MUN-VIANA",
    name: "Município de Viana",
    code: "MUN-VIANA",
    level: "MUNICIPALITY",
    parentId: "GEO-PROV-LUA",
    provinceCode: "Luanda",
    municipalityCode: "VIANA",
    active: true
  },
  {
    id: "GEO-EP-VIANA",
    name: "Estabelecimento Penitenciário de Viana",
    code: "EP-VIANA",
    level: "PRISON_FACILITY",
    parentId: "GEO-MUN-VIANA",
    provinceCode: "Luanda",
    prisonId: "AO-LUA-001",
    capacity: 2500,
    currentOccupancy: 2740,
    securityRegime: "MEDIO",
    active: true
  },
  {
    id: "GEO-PAV-A",
    name: "Pavilhão A - Regime Fechado (Máxima Segurança)",
    code: "PAV-A",
    level: "PAVILION",
    parentId: "GEO-EP-VIANA",
    provinceCode: "Luanda",
    prisonId: "AO-LUA-001",
    capacity: 600,
    currentOccupancy: 650,
    securityRegime: "MAXIMO",
    active: true
  },
  {
    id: "GEO-BLK-A1",
    name: "Bloco A1 - Celular Norte",
    code: "BLK-A1",
    level: "BLOCK",
    parentId: "GEO-PAV-A",
    provinceCode: "Luanda",
    prisonId: "AO-LUA-001",
    capacity: 150,
    currentOccupancy: 162,
    active: true
  },
  {
    id: "GEO-CEL-101",
    name: "Cela 101 (Coletiva - 6 Lugares)",
    code: "CEL-101",
    level: "CELL",
    parentId: "GEO-BLK-A1",
    provinceCode: "Luanda",
    prisonId: "AO-LUA-001",
    capacity: 6,
    currentOccupancy: 6,
    securityRegime: "MAXIMO",
    active: true
  },
  {
    id: "GEO-CEL-102",
    name: "Cela 102 (Coletiva - 6 Lugares)",
    code: "CEL-102",
    level: "CELL",
    parentId: "GEO-BLK-A1",
    provinceCode: "Luanda",
    prisonId: "AO-LUA-001",
    capacity: 6,
    currentOccupancy: 5,
    securityRegime: "MAXIMO",
    active: true
  },
  {
    id: "GEO-CEL-103",
    name: "Cela 103 (Individual de Triagem)",
    code: "CEL-103",
    level: "CELL",
    parentId: "GEO-BLK-A1",
    provinceCode: "Luanda",
    prisonId: "AO-LUA-001",
    capacity: 1,
    currentOccupancy: 0,
    securityRegime: "TRANSITORIO",
    active: true
  }
];

// ----------------------------------------------------------------------------
// 3. HUMAN RESOURCES KERNEL: Cadastro Único de Pessoas (SP-XXXXXX)
// ----------------------------------------------------------------------------
export const SEED_PERSONS: Person[] = [
  {
    id: "PERS-SP-000842",
    spNumber: "SP-000842",
    fullName: "João Manuel da Silva e Sousa",
    rank: "SUPERINTENDENTE_PRISIONAL",
    primarySpecialty: "CONTROLO_PENAL",
    secondarySpecialties: ["JURIDICO_CONTENCIOSO"],
    biNumber: "002847192LA041",
    phone: "+244 923 842 100",
    email: "joao.sousa@penitenciario.gov.ao",
    status: "ACTIVO",
    assignedOrgNodeId: "ORG-SEC-CTRL-VIANA",
    assignedProvinceCode: "Luanda",
    assignedPrisonId: "AO-LUA-001",
    registeredAt: "2018-03-12",
    qualificationLevel: "Licenciatura em Direito Penal e Criminologia"
  },
  {
    id: "PERS-SP-001205",
    spNumber: "SP-001205",
    fullName: "Dra. Maria Esperança Fernandes",
    rank: "INTENDENTE_PRISIONAL",
    primarySpecialty: "ENFERMAGEM_SAUDE",
    secondarySpecialties: [],
    biNumber: "001928471LA032",
    phone: "+244 912 205 311",
    email: "maria.fernandes@penitenciario.gov.ao",
    status: "ACTIVO",
    assignedOrgNodeId: "ORG-SEC-SAUDE-VIANA",
    assignedProvinceCode: "Luanda",
    assignedPrisonId: "AO-LUA-001",
    registeredAt: "2019-07-01",
    qualificationLevel: "Enfermagem Superior e Saúde Pública"
  },
  {
    id: "PERS-SP-003419",
    spNumber: "SP-003419",
    fullName: "Paulo Domingos Sebastião",
    rank: "INSPECTOR_PRISIONAL",
    primarySpecialty: "RADIO_CCTV",
    secondarySpecialties: ["SEGURANCA_INSTITUCIONAL"],
    biNumber: "003847199LA088",
    phone: "+244 934 419 220",
    email: "paulo.sebastiao@penitenciario.gov.ao",
    status: "ACTIVO",
    assignedOrgNodeId: "ORG-SEC-CCTV-VIANA",
    assignedProvinceCode: "Luanda",
    assignedPrisonId: "AO-LUA-001",
    registeredAt: "2020-11-15",
    qualificationLevel: "Técnico de Telecomunicações e Sistemas CCTV"
  },
  {
    id: "PERS-SP-002190",
    spNumber: "SP-002190",
    fullName: "António Kiangebeni Luvumbo",
    rank: "INSPECTOR_PRISIONAL_CHEFE",
    primarySpecialty: "OSA_COMANDO",
    secondarySpecialties: ["SEGURANCA_INSTITUCIONAL", "CONTROLO_PENAL"],
    biNumber: "001847291LA012",
    phone: "+244 923 190 400",
    email: "antonio.luvumbo@penitenciario.gov.ao",
    status: "ACTIVO",
    assignedOrgNodeId: "ORG-EP-VIANA",
    assignedProvinceCode: "Luanda",
    assignedPrisonId: "AO-LUA-001",
    registeredAt: "2015-02-20",
    qualificationLevel: "Curso Superior de Direcção e Comando Penitenciário"
  },
  {
    id: "PERS-SP-005612",
    spNumber: "SP-005612",
    fullName: "Mateus Kimbondo Vunge",
    rank: "PRIMEIRO_SUBCHEFE",
    primarySpecialty: "SARGENTO_GUARDA",
    secondarySpecialties: ["SEGURANCA_INSTITUCIONAL"],
    biNumber: "004928172LA055",
    phone: "+244 945 612 889",
    status: "ACTIVO",
    assignedOrgNodeId: "ORG-SEC-OPER-VIANA",
    assignedProvinceCode: "Luanda",
    assignedPrisonId: "AO-LUA-001",
    registeredAt: "2021-04-10"
  },
  {
    id: "PERS-SP-004381",
    spNumber: "SP-004381",
    fullName: "Dra. Teresa Ndakwena Cassinda",
    rank: "INSPECTOR_PRISIONAL",
    primarySpecialty: "RESSOCIALIZACAO",
    secondarySpecialties: ["CONTROLO_PENAL"],
    biNumber: "002948174LA091",
    phone: "+244 923 381 772",
    status: "ACTIVO",
    assignedOrgNodeId: "ORG-EP-VIANA",
    assignedProvinceCode: "Luanda",
    assignedPrisonId: "AO-LUA-001",
    registeredAt: "2020-01-18",
    qualificationLevel: "Psicologia Criminal e Reinserção Social"
  },
  {
    id: "PERS-SP-006210",
    spNumber: "SP-006210",
    fullName: "Bernardo Cassule Panzo",
    rank: "PRIMEIRO_AGENTE",
    primarySpecialty: "MOTORISTA_TRANSPORTE",
    secondarySpecialties: ["LOGISTICA"],
    biNumber: "005829182LA064",
    phone: "+244 931 210 994",
    status: "ACTIVO",
    assignedOrgNodeId: "ORG-EP-VIANA",
    assignedProvinceCode: "Luanda",
    assignedPrisonId: "AO-LUA-001",
    registeredAt: "2022-08-01",
    qualificationLevel: "Condução Tática de Veículos Celulares de Alta Segurança"
  },
  {
    id: "PERS-SP-007890",
    spNumber: "SP-007890",
    fullName: "Lucas Zua Mbemba",
    rank: "SUBINSPECTOR_PRISIONAL",
    primarySpecialty: "LOGISTICA",
    secondarySpecialties: [],
    biNumber: "003928172LA031",
    phone: "+244 926 890 112",
    status: "ACTIVO",
    assignedOrgNodeId: "ORG-EP-VIANA",
    assignedProvinceCode: "Luanda",
    assignedPrisonId: "AO-LUA-001",
    registeredAt: "2021-09-14"
  },
  {
    id: "PERS-SP-000101",
    spNumber: "SP-000101",
    fullName: "General Comissário Manuel Gomes",
    rank: "COMISSARIO_PRISIONAL_PRINCIPAL",
    primarySpecialty: "DIRECTOR_ESTABELECIMENTO",
    secondarySpecialties: ["OSA_COMANDO", "INSPECTOR_SUPERVISAO"],
    biNumber: "000192847LA001",
    phone: "+244 923 000 101",
    email: "direccao.geral@penitenciario.gov.ao",
    status: "ACTIVO",
    assignedOrgNodeId: "ORG-DGSP",
    assignedProvinceCode: "Luanda",
    registeredAt: "2010-01-05",
    qualificationLevel: "Doutoramento em Segurança Pública e Direito Penitenciário"
  }
];

// ----------------------------------------------------------------------------
// 4. AUTHORIZATION KERNEL: Matriz Canónica de Competências e Atos
// ----------------------------------------------------------------------------
export const SEED_AUTHORIZATION_RULES: AuthorizationMatrixRule[] = [
  {
    actCode: "ACT_REGISTAR_INGRESSO",
    actName: "Registar Admissão / Ingresso de Recluso",
    category: "JURIDICO_PENITENCIARIO",
    description: "Execução do Wizard Canónico de 15 etapas de admissão, biometria e mandado judicial.",
    allowedSpecialties: ["CONTROLO_PENAL", "OSA_COMANDO", "DIRECTOR_ESTABELECIMENTO"],
    allowedOrgLevels: ["ESTABELECIMENTO", "DIRECAO_PROVINCIAL", "DIRECAO_GERAL"],
    allowedTerritorialScopes: ["ESTABLISHMENT", "PROVINCIAL", "NATIONAL"],
    requiresActiveMission: true,
    requiresOsaValidation: false,
    requiresDgAuthorization: false
  },
  {
    actCode: "ACT_CONSULTAR_PROCESSO_PENAL",
    actName: "Consultar Processo e Ficha Penitenciária",
    category: "JURIDICO_PENITENCIARIO",
    description: "Acesso detalhado a dados jurídicos, crimes, acórdãos e cálculo de penas.",
    allowedSpecialties: ["CONTROLO_PENAL", "OSA_COMANDO", "RESSOCIALIZACAO", "DIRECTOR_ESTABELECIMENTO", "INSPECTOR_SUPERVISAO", "JURIDICO_CONTENCIOSO"],
    allowedOrgLevels: ["ESTABELECIMENTO", "DIRECAO_PROVINCIAL", "DIRECAO_GERAL"],
    allowedTerritorialScopes: ["ESTABLISHMENT", "PROVINCIAL", "NATIONAL"],
    requiresActiveMission: true,
    requiresOsaValidation: false,
    requiresDgAuthorization: false
  },
  {
    actCode: "ACT_ALOCAR_CELA",
    actName: "Alocar ou Mudar Cela de Recluso",
    category: "OPERACIONAL_MOVIMENTACAO",
    description: "Atribuição física de alojamento (Pavilhão/Bloco/Cela) com verificação de incompatibilidade.",
    allowedSpecialties: ["CONTROLO_PENAL", "OSA_COMANDO", "SARGENTO_GUARDA", "DIRECTOR_ESTABELECIMENTO"],
    allowedOrgLevels: ["ESTABELECIMENTO"],
    allowedTerritorialScopes: ["ESTABLISHMENT"],
    requiresActiveMission: true,
    requiresOsaValidation: true,
    requiresDgAuthorization: false
  },
  {
    actCode: "ACT_AUTORIZAR_TRANSFERENCIA_INTERPROVINCIAL",
    actName: "Autorizar Transferência Interprovincial de Reclusos",
    category: "OPERACIONAL_MOVIMENTACAO",
    description: "Despacho superior de movimentação entre províncias distintas da República de Angola.",
    allowedSpecialties: ["DIRECTOR_ESTABELECIMENTO", "INSPECTOR_SUPERVISAO"],
    allowedOrgLevels: ["DIRECAO_GERAL"],
    allowedTerritorialScopes: ["NATIONAL"],
    requiresActiveMission: true,
    requiresOsaValidation: false,
    requiresDgAuthorization: true
  },
  {
    actCode: "ACT_EMITIR_GUIA_CONDUCAO",
    actName: "Emitir Guia de Condução e Trânsito Prisional",
    category: "OPERACIONAL_MOVIMENTACAO",
    description: "Emissão de guia oficial com QR e hash de validação para escolta armada.",
    allowedSpecialties: ["CONTROLO_PENAL", "OSA_COMANDO", "DIRECTOR_ESTABELECIMENTO"],
    allowedOrgLevels: ["ESTABELECIMENTO", "DIRECAO_PROVINCIAL"],
    allowedTerritorialScopes: ["ESTABLISHMENT", "PROVINCIAL"],
    requiresActiveMission: true,
    requiresOsaValidation: true,
    requiresDgAuthorization: false
  },
  {
    actCode: "ACT_REGISTAR_FICHA_CLINICA",
    actName: "Registar Atendimento Clínico e Prescrição",
    category: "CLINICO_SAUDE",
    description: "Registo de triagem sanitária, anamnese, medicação e internamento hospitalar prisional.",
    allowedSpecialties: ["ENFERMAGEM_SAUDE"],
    allowedOrgLevels: ["ESTABELECIMENTO", "DIRECAO_PROVINCIAL", "DIRECAO_GERAL"],
    allowedTerritorialScopes: ["ESTABLISHMENT", "PROVINCIAL", "NATIONAL"],
    requiresActiveMission: true,
    requiresOsaValidation: false,
    requiresDgAuthorization: false
  },
  {
    actCode: "ACT_OPERAR_CCTV_ALARMES",
    actName: "Operar Vigilância CCTV, Transmissões e Alarmes",
    category: "COMUNICACOES_CCTV",
    description: "Monitorização de câmaras perimétricas, disparo de alarmes e registo de gravações táticas.",
    allowedSpecialties: ["RADIO_CCTV", "OSA_COMANDO"],
    allowedOrgLevels: ["ESTABELECIMENTO", "DIRECAO_GERAL"],
    allowedTerritorialScopes: ["ESTABLISHMENT", "NATIONAL"],
    requiresActiveMission: true,
    requiresOsaValidation: false,
    requiresDgAuthorization: false
  },
  {
    actCode: "ACT_REGISTAR_OCORRENCIA_DISCIPLINAR",
    actName: "Registar Auto de Ocorrência e Infracção Disciplinar",
    category: "DISCIPLINA_SEGURANCA",
    description: "Lavratura de auto de motim, agressão, posse de ilícito ou desobediência a normas NEP.",
    allowedSpecialties: ["SARGENTO_GUARDA", "OSA_COMANDO", "CONTROLO_PENAL", "DIRECTOR_ESTABELECIMENTO"],
    allowedOrgLevels: ["ESTABELECIMENTO"],
    allowedTerritorialScopes: ["ESTABLISHMENT"],
    requiresActiveMission: true,
    requiresOsaValidation: true,
    requiresDgAuthorization: false
  },
  {
    actCode: "ACT_VALIDAR_TURNO_DG",
    actName: "Validar e Homologar Escala de Turno (DG)",
    category: "ADMINISTRATIVO_ESTRUTURAL",
    description: "Aprovação institucional pela Direcção Geral da escala D-1 proposta pela Província.",
    allowedSpecialties: ["DIRECTOR_ESTABELECIMENTO", "INSPECTOR_SUPERVISAO"],
    allowedOrgLevels: ["DIRECAO_GERAL"],
    allowedTerritorialScopes: ["NATIONAL"],
    requiresActiveMission: true,
    requiresOsaValidation: false,
    requiresDgAuthorization: true
  },
  {
    actCode: "ACT_ALTERAR_ESTRUTURA_INSTITUCIONAL",
    actName: "Criar ou Alterar Estrutura Orgânica / Território",
    category: "ADMINISTRATIVO_ESTRUTURAL",
    description: "Institution Builder: Criação de EPs, Províncias, Pavilhões e Celas no Kernel.",
    allowedSpecialties: ["DIRECTOR_ESTABELECIMENTO"],
    allowedOrgLevels: ["DIRECAO_GERAL", "MININT"],
    allowedTerritorialScopes: ["NATIONAL"],
    requiresActiveMission: false,
    requiresOsaValidation: false,
    requiresDgAuthorization: true
  }
];

// ----------------------------------------------------------------------------
// 5. DUTY/SHIFT KERNEL: Turnos Operacionais (D-1 Preparação DP -> Validação DG)
// ----------------------------------------------------------------------------
export const SEED_DUTY_SHIFTS: DutyShift[] = [
  {
    id: "TURN-2026-08-15-EPV-01",
    prisonId: "AO-LUA-001",
    prisonName: "Estabelecimento Penitenciário de Viana",
    provinceCode: "Luanda",
    shiftDate: "2026-08-15",
    startTime: "07:00",
    endTime: "19:00",
    shiftType: "DIURNO_12H",
    status: "APPROVED_DG", // Aprovado pela DG -> Gerou Missões e Credenciais
    preparedByPersonId: "PERS-SP-002190",
    preparedByPersonName: "António Kiangebeni Luvumbo (OSA)",
    preparedAt: "2026-08-14 16:30:00",
    validatedByDgPersonId: "PERS-SP-000101",
    validatedByDgPersonName: "Gen. Manuel Gomes (Director Geral)",
    validatedAt: "2026-08-14 18:45:00",
    osaPersonId: "PERS-SP-002190",
    osaPersonName: "António Kiangebeni Luvumbo",
    totalPersonnel: 7,
    generatedMissionCount: 7,
    slots: [
      {
        slotId: "SLOT-OSA",
        specialty: "OSA_COMANDO",
        roleLabel: "Oficial Superior de Acompanhamento (Comando do Turno)",
        requiredCount: 1,
        assignedPersonIds: ["PERS-SP-002190"],
        mandatory: true
      },
      {
        slotId: "SLOT-CTRL",
        specialty: "CONTROLO_PENAL",
        roleLabel: "Especialista de Controlo Penal e Matrícula",
        requiredCount: 1,
        assignedPersonIds: ["PERS-SP-000842"],
        mandatory: true
      },
      {
        slotId: "SLOT-SAUDE",
        specialty: "ENFERMAGEM_SAUDE",
        roleLabel: "Enfermeira de Serviço e Triagem Clínica",
        requiredCount: 1,
        assignedPersonIds: ["PERS-SP-001205"],
        mandatory: true
      },
      {
        slotId: "SLOT-CCTV",
        specialty: "RADIO_CCTV",
        roleLabel: "Operador de Centro de Rádio e Videovigilância",
        requiredCount: 1,
        assignedPersonIds: ["PERS-SP-003419"],
        mandatory: true
      },
      {
        slotId: "SLOT-GUARDA",
        specialty: "SARGENTO_GUARDA",
        roleLabel: "Sargento de Dia à Guarda e Vigilância Celular",
        requiredCount: 1,
        assignedPersonIds: ["PERS-SP-005612"],
        mandatory: true
      },
      {
        slotId: "SLOT-RESSOC",
        specialty: "RESSOCIALIZACAO",
        roleLabel: "Técnica de Reabilitação Social e Visitas",
        requiredCount: 1,
        assignedPersonIds: ["PERS-SP-004381"],
        mandatory: false
      },
      {
        slotId: "SLOT-MOT",
        specialty: "MOTORISTA_TRANSPORTE",
        roleLabel: "Motorista de Escolta e Veículo Celular",
        requiredCount: 1,
        assignedPersonIds: ["PERS-SP-006210"],
        mandatory: true
      }
    ],
    notes: "Escala validada nos termos da NEP n.º 04/MININT/DGSP/2026. Reforço de segurança nos pavilhões celulares A e B."
  },
  {
    id: "TURN-2026-08-16-EPV-01",
    prisonId: "AO-LUA-001",
    prisonName: "Estabelecimento Penitenciário de Viana",
    provinceCode: "Luanda",
    shiftDate: "2026-08-16",
    startTime: "07:00",
    endTime: "19:00",
    shiftType: "DIURNO_12H",
    status: "SUBMITTED_TO_DG", // D-1: Submetido à DG para Homologação
    preparedByPersonId: "PERS-SP-002190",
    preparedByPersonName: "António Kiangebeni Luvumbo (OSA)",
    preparedAt: "2026-08-14 20:00:00",
    osaPersonId: "PERS-SP-002190",
    osaPersonName: "António Kiangebeni Luvumbo",
    totalPersonnel: 6,
    generatedMissionCount: 0,
    slots: [
      {
        slotId: "SLOT-OSA",
        specialty: "OSA_COMANDO",
        roleLabel: "Oficial Superior de Acompanhamento",
        requiredCount: 1,
        assignedPersonIds: ["PERS-SP-002190"],
        mandatory: true
      },
      {
        slotId: "SLOT-CTRL",
        specialty: "CONTROLO_PENAL",
        roleLabel: "Especialista de Controlo Penal",
        requiredCount: 1,
        assignedPersonIds: ["PERS-SP-000842"],
        mandatory: true
      },
      {
        slotId: "SLOT-SAUDE",
        specialty: "ENFERMAGEM_SAUDE",
        roleLabel: "Enfermeira de Serviço",
        requiredCount: 1,
        assignedPersonIds: ["PERS-SP-001205"],
        mandatory: true
      },
      {
        slotId: "SLOT-CCTV",
        specialty: "RADIO_CCTV",
        roleLabel: "Operador de Rádio/CCTV",
        requiredCount: 1,
        assignedPersonIds: ["PERS-SP-003419"],
        mandatory: true
      },
      {
        slotId: "SLOT-GUARDA",
        specialty: "SARGENTO_GUARDA",
        roleLabel: "Sargento de Dia",
        requiredCount: 1,
        assignedPersonIds: ["PERS-SP-005612"],
        mandatory: true
      },
      {
        slotId: "SLOT-LOG",
        specialty: "LOGISTICA",
        roleLabel: "Responsável de Alimentação e Logística",
        requiredCount: 1,
        assignedPersonIds: ["PERS-SP-007890"],
        mandatory: true
      }
    ],
    notes: "Aguardando homologação e emissão de credenciais pela Direcção Geral."
  }
];

// ----------------------------------------------------------------------------
// 6. MISSION KERNEL: Missões Operacionais Emitidas
// ----------------------------------------------------------------------------
export const SEED_OPERATIONAL_MISSIONS: OperationalMission[] = [
  {
    id: "MSN-2026-08-15-EPV-CTRL-001",
    shiftId: "TURN-2026-08-15-EPV-01",
    personId: "PERS-SP-000842",
    spNumber: "SP-000842",
    personName: "João Manuel da Silva e Sousa",
    rank: "SUPERINTENDENTE_PRISIONAL",
    specialty: "CONTROLO_PENAL",
    roleInShift: "Especialista de Controlo Penal e Matrícula",
    prisonId: "AO-LUA-001",
    prisonName: "Estabelecimento Penitenciário de Viana",
    provinceCode: "Luanda",
    validFrom: "2026-08-15 06:30:00",
    validUntil: "2026-08-15 19:30:00",
    status: "ACTIVE",
    authorizedActs: [
      "ACT_REGISTAR_INGRESSO",
      "ACT_CONSULTAR_PROCESSO_PENAL",
      "ACT_ALOCAR_CELA",
      "ACT_EMITIR_GUIA_CONDUCAO"
    ],
    restrictedActs: [
      "ACT_ALTERAR_ESTRUTURA_INSTITUCIONAL",
      "ACT_VALIDAR_TURNO_DG",
      "ACT_AUTORIZAR_TRANSFERENCIA_INTERPROVINCIAL",
      "ACT_REGISTAR_FICHA_CLINICA"
    ],
    supervisedByOsaId: "PERS-SP-002190",
    createdAt: "2026-08-14 18:45:10"
  },
  {
    id: "MSN-2026-08-15-EPV-CCTV-001",
    shiftId: "TURN-2026-08-15-EPV-01",
    personId: "PERS-SP-003419",
    spNumber: "SP-003419",
    personName: "Paulo Domingos Sebastião",
    rank: "INSPECTOR_PRISIONAL",
    specialty: "RADIO_CCTV",
    roleInShift: "Operador de Centro de Rádio e Videovigilância",
    prisonId: "AO-LUA-001",
    prisonName: "Estabelecimento Penitenciário de Viana",
    provinceCode: "Luanda",
    validFrom: "2026-08-15 06:30:00",
    validUntil: "2026-08-15 19:30:00",
    status: "ACTIVE",
    authorizedActs: [
      "ACT_OPERAR_CCTV_ALARMES"
    ],
    restrictedActs: [
      "ACT_CONSULTAR_PROCESSO_PENAL",
      "ACT_REGISTAR_INGRESSO",
      "ACT_ALOCAR_CELA",
      "ACT_ALTERAR_ESTRUTURA_INSTITUCIONAL",
      "ACT_REGISTAR_FICHA_CLINICA"
    ],
    supervisedByOsaId: "PERS-SP-002190",
    createdAt: "2026-08-14 18:45:12"
  },
  {
    id: "MSN-2026-08-15-EPV-OSA-001",
    shiftId: "TURN-2026-08-15-EPV-01",
    personId: "PERS-SP-002190",
    spNumber: "SP-002190",
    personName: "António Kiangebeni Luvumbo",
    rank: "INSPECTOR_PRISIONAL_CHEFE",
    specialty: "OSA_COMANDO",
    roleInShift: "Oficial Superior de Acompanhamento (Chefe de Turno)",
    prisonId: "AO-LUA-001",
    prisonName: "Estabelecimento Penitenciário de Viana",
    provinceCode: "Luanda",
    validFrom: "2026-08-15 06:00:00",
    validUntil: "2026-08-15 20:00:00",
    status: "ACTIVE",
    authorizedActs: [
      "ACT_REGISTAR_INGRESSO",
      "ACT_CONSULTAR_PROCESSO_PENAL",
      "ACT_ALOCAR_CELA",
      "ACT_EMITIR_GUIA_CONDUCAO",
      "ACT_REGISTAR_OCORRENCIA_DISCIPLINAR",
      "ACT_OPERAR_CCTV_ALARMES"
    ],
    restrictedActs: [
      "ACT_ALTERAR_ESTRUTURA_INSTITUCIONAL",
      "ACT_VALIDAR_TURNO_DG",
      "ACT_AUTORIZAR_TRANSFERENCIA_INTERPROVINCIAL"
    ],
    createdAt: "2026-08-14 18:45:10"
  },
  {
    id: "MSN-2026-08-15-EPV-SAUDE-001",
    shiftId: "TURN-2026-08-15-EPV-01",
    personId: "PERS-SP-001205",
    spNumber: "SP-001205",
    personName: "Dra. Maria Esperança Fernandes",
    rank: "INTENDENTE_PRISIONAL",
    specialty: "ENFERMAGEM_SAUDE",
    roleInShift: "Enfermeira de Serviço e Triagem Clínica",
    prisonId: "AO-LUA-001",
    prisonName: "Estabelecimento Penitenciário de Viana",
    provinceCode: "Luanda",
    validFrom: "2026-08-15 06:30:00",
    validUntil: "2026-08-15 19:30:00",
    status: "ACTIVE",
    authorizedActs: [
      "ACT_REGISTAR_FICHA_CLINICA"
    ],
    restrictedActs: [
      "ACT_REGISTAR_INGRESSO",
      "ACT_ALOCAR_CELA",
      "ACT_EMITIR_GUIA_CONDUCAO",
      "ACT_ALTERAR_ESTRUTURA_INSTITUCIONAL"
    ],
    supervisedByOsaId: "PERS-SP-002190",
    createdAt: "2026-08-14 18:45:15"
  }
];

// ----------------------------------------------------------------------------
// 7. CREDENTIAL KERNEL: Credenciais Temporárias Emitidas
// ----------------------------------------------------------------------------
export const SEED_TEMPORARY_CREDENTIALS: TemporaryCredential[] = [
  {
    id: "CRED-MSN-20260815-EPV-842",
    missionId: "MSN-2026-08-15-EPV-CTRL-001",
    personId: "PERS-SP-000842",
    spNumber: "SP-000842",
    tokenHash: "SHA256:7f9b8c2d1e0a4f5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b",
    issuedAt: "2026-08-14 18:45:10",
    expiresAt: "2026-08-15 19:30:00",
    status: "VALID",
    allowedActs: [
      "ACT_REGISTAR_INGRESSO",
      "ACT_CONSULTAR_PROCESSO_PENAL",
      "ACT_ALOCAR_CELA",
      "ACT_EMITIR_GUIA_CONDUCAO"
    ],
    scopePrisonId: "AO-LUA-001",
    scopeProvinceCode: "Luanda",
    signatureSeal: "SEAL-DGSP-VALIDATED-MININT-2026"
  },
  {
    id: "CRED-MSN-20260815-EPV-419",
    missionId: "MSN-2026-08-15-EPV-CCTV-001",
    personId: "PERS-SP-003419",
    spNumber: "SP-003419",
    tokenHash: "SHA256:3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
    issuedAt: "2026-08-14 18:45:12",
    expiresAt: "2026-08-15 19:30:00",
    status: "VALID",
    allowedActs: [
      "ACT_OPERAR_CCTV_ALARMES"
    ],
    scopePrisonId: "AO-LUA-001",
    scopeProvinceCode: "Luanda",
    signatureSeal: "SEAL-DGSP-VALIDATED-MININT-2026"
  },
  {
    id: "CRED-MSN-20260815-EPV-190",
    missionId: "MSN-2026-08-15-EPV-OSA-001",
    personId: "PERS-SP-002190",
    spNumber: "SP-002190",
    tokenHash: "SHA256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    issuedAt: "2026-08-14 18:45:10",
    expiresAt: "2026-08-15 20:00:00",
    status: "VALID",
    allowedActs: [
      "ACT_REGISTAR_INGRESSO",
      "ACT_CONSULTAR_PROCESSO_PENAL",
      "ACT_ALOCAR_CELA",
      "ACT_EMITIR_GUIA_CONDUCAO",
      "ACT_REGISTAR_OCORRENCIA_DISCIPLINAR",
      "ACT_OPERAR_CCTV_ALARMES"
    ],
    scopePrisonId: "AO-LUA-001",
    scopeProvinceCode: "Luanda",
    signatureSeal: "SEAL-DGSP-VALIDATED-MININT-2026"
  }
];

// ----------------------------------------------------------------------------
// 8. AUDIT KERNEL: Rastreabilidade Integral Canónica
// ----------------------------------------------------------------------------
export const SEED_KERNEL_AUDIT_RECORDS: KernelAuditRecord[] = [
  {
    id: "AUD-KRN-20260815-0001",
    timestamp: "2026-08-15 07:15:22",
    actorPersonId: "PERS-SP-000842",
    actorSpNumber: "SP-000842",
    actorName: "João Manuel da Silva e Sousa",
    actorRank: "Superintendente Prisional",
    actorSpecialty: "CONTROLO_PENAL",
    entityTargetType: "RECLUSO",
    entityTargetId: "REC-2026-008912",
    actCode: "ACT_REGISTAR_INGRESSO",
    actName: "Registar Admissão / Ingresso de Recluso",
    jurisdictionPrisonId: "AO-LUA-001",
    jurisdictionPrisonName: "Estabelecimento Penitenciário de Viana",
    jurisdictionProvinceCode: "Luanda",
    missionId: "MSN-2026-08-15-EPV-CTRL-001",
    credentialId: "CRED-MSN-20260815-EPV-842",
    authorized: true,
    authorizationRuleCode: "RULE_CP_ADMISSION",
    resultStatus: "SUCCESS",
    description: "Ingresso registado sob Mandado de Prisão n.º 412/TPL/2026 da 1.ª Secção Criminal do Tribunal de Luanda.",
    payloadHash: "HASH-SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  {
    id: "AUD-KRN-20260815-0002",
    timestamp: "2026-08-15 08:30:10",
    actorPersonId: "PERS-SP-003419",
    actorSpNumber: "SP-003419",
    actorName: "Paulo Domingos Sebastião",
    actorRank: "Inspector Prisional",
    actorSpecialty: "RADIO_CCTV",
    entityTargetType: "RECLUSO",
    entityTargetId: "REC-2026-008912",
    actCode: "ACT_CONSULTAR_PROCESSO_PENAL",
    actName: "Consultar Processo e Ficha Penitenciária",
    jurisdictionPrisonId: "AO-LUA-001",
    jurisdictionPrisonName: "Estabelecimento Penitenciário de Viana",
    jurisdictionProvinceCode: "Luanda",
    missionId: "MSN-2026-08-15-EPV-CCTV-001",
    credentialId: "CRED-MSN-20260815-EPV-419",
    authorized: false,
    authorizationRuleCode: "RULE_DENY_CCTV_PENAL_RECORD",
    resultStatus: "BLOCKED",
    description: "Tentativa de acesso não autorizada a dados judiciais confidenciais por Operador de Rádio/CCTV sem missão penal.",
    payloadHash: "HASH-SHA256:d41d8cd98f00b204e9800998ecf8427e"
  },
  {
    id: "AUD-KRN-20260815-0003",
    timestamp: "2026-08-15 09:10:44",
    actorPersonId: "PERS-SP-000842",
    actorSpNumber: "SP-000842",
    actorName: "João Manuel da Silva e Sousa",
    actorRank: "Superintendente Prisional",
    actorSpecialty: "CONTROLO_PENAL",
    entityTargetType: "CELA",
    entityTargetId: "GEO-CEL-102",
    actCode: "ACT_ALOCAR_CELA",
    actName: "Alocar ou Mudar Cela de Recluso",
    jurisdictionPrisonId: "AO-LUA-001",
    jurisdictionPrisonName: "Estabelecimento Penitenciário de Viana",
    jurisdictionProvinceCode: "Luanda",
    missionId: "MSN-2026-08-15-EPV-CTRL-001",
    credentialId: "CRED-MSN-20260815-EPV-842",
    authorized: true,
    authorizationRuleCode: "RULE_CP_CELL_ALLOCATION",
    resultStatus: "SUCCESS",
    description: "Alocação do recluso REC-2026-008912 no Pavilhão A, Bloco A1, Cela 102 após verificação de compatibilidade MNCP.",
    payloadHash: "HASH-SHA256:9f83c605d84000f074d284f183c21a48ff98ab98e9821a8d052a514d334585c5"
  },
  {
    id: "AUD-KRN-20260815-0004",
    timestamp: "2026-08-14 18:45:00",
    actorPersonId: "PERS-SP-000101",
    actorSpNumber: "SP-000101",
    actorName: "General Comissário Manuel Gomes",
    actorRank: "Comissário Prisional Principal",
    actorSpecialty: "DIRECTOR_ESTABELECIMENTO",
    entityTargetType: "TURNO",
    entityTargetId: "TURN-2026-08-15-EPV-01",
    actCode: "ACT_VALIDAR_TURNO_DG",
    actName: "Validar e Homologar Escala de Turno (DG)",
    jurisdictionPrisonId: "AO-LUA-001",
    jurisdictionPrisonName: "Estabelecimento Penitenciário de Viana",
    jurisdictionProvinceCode: "Luanda",
    missionId: "MSN-DG-COMMAND-PERMANENT",
    authorized: true,
    authorizationRuleCode: "RULE_DG_SHIFT_HOMOLOGATION",
    resultStatus: "SUCCESS",
    description: "Escala D-1 homologada com 7 operacionais. Emissão automática de 7 missões e 7 credenciais temporárias.",
    payloadHash: "HASH-SHA256:4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a"
  }
];

// ----------------------------------------------------------------------------
// MOTOR DE AVALIAÇÃO DE AUTORIZAÇÃO (AUTHORIZATION EVALUATION ENGINE)
// Matriz: SUJEITO + JURISDIÇÃO + ÓRGÃO + CARGO + ESPECIALIDADE + MISSÃO + ACTO + PERÍODO = AUTORIZAÇÃO
// ----------------------------------------------------------------------------
export function evaluateInstitutionalAuthorization(
  request: AuthorizationEvaluationRequest,
  persons: Person[],
  missions: OperationalMission[],
  credentials: TemporaryCredential[],
  rules: AuthorizationMatrixRule[]
): AuthorizationEvaluationResult {
  const person = persons.find(p => p.id === request.personId || p.spNumber === request.spNumber);
  const rule = rules.find(r => r.actCode === request.targetActCode);

  // 1. Verificação de Pessoa e Estado
  if (!person) {
    return {
      authorized: false,
      decisionCode: "REJEITADO_PESSOA_INATIVA",
      reason: `Pessoa com SP '${request.spNumber}' não cadastrada no Human Resources Kernel.`,
      evaluatedRule: rule,
      evidenceTuple: {
        actorSp: request.spNumber || "DESCONHECIDO",
        entity: request.targetEntityId || "N/A",
        act: request.targetActCode,
        jurisdiction: request.jurisdictionPrisonId || request.jurisdictionProvinceCode,
        mission: "NENHUMA",
        timestamp: request.requestTimestamp,
        authorization: "REJEITADO_PESSOA_INATIVA",
        result: "BLOQUEADO"
      }
    };
  }

  if (person.status !== "ACTIVO") {
    return {
      authorized: false,
      decisionCode: "REJEITADO_PESSOA_INATIVA",
      reason: `Efetivo '${person.fullName}' (${person.spNumber}) encontra-se com estado '${person.status}'. Acto bloqueado.`,
      evaluatedRule: rule,
      evidenceTuple: {
        actorSp: person.spNumber,
        entity: request.targetEntityId || "N/A",
        act: request.targetActCode,
        jurisdiction: request.jurisdictionPrisonId || request.jurisdictionProvinceCode,
        mission: "NENHUMA",
        timestamp: request.requestTimestamp,
        authorization: "REJEITADO_PESSOA_INATIVA",
        result: "BLOQUEADO"
      }
    };
  }

  if (!rule) {
    return {
      authorized: false,
      decisionCode: "REJEITADO_ESPECIALIDADE",
      reason: `Acto '${request.targetActCode}' não reconhecido na Matriz Canónica de Competências.`,
      evidenceTuple: {
        actorSp: person.spNumber,
        entity: request.targetEntityId || "N/A",
        act: request.targetActCode,
        jurisdiction: request.jurisdictionPrisonId || request.jurisdictionProvinceCode,
        mission: "NENHUMA",
        timestamp: request.requestTimestamp,
        authorization: "REJEITADO_REGRA_INEXISTENTE",
        result: "BLOQUEADO"
      }
    };
  }

  // 2. Verificação de Especialidade
  const hasSpecialty = 
    rule.allowedSpecialties.includes(person.primarySpecialty) ||
    (person.secondarySpecialties && person.secondarySpecialties.some(s => rule.allowedSpecialties.includes(s))) ||
    person.primarySpecialty === "DIRECTOR_ESTABELECIMENTO";

  if (!hasSpecialty) {
    return {
      authorized: false,
      decisionCode: "REJEITADO_ESPECIALIDADE",
      reason: `Especialidade '${person.primarySpecialty}' não possui competência legal para '${rule.actName}'. Especialidades exigidas: ${rule.allowedSpecialties.join(", ")}.`,
      evaluatedRule: rule,
      evidenceTuple: {
        actorSp: person.spNumber,
        entity: request.targetEntityId || "N/A",
        act: rule.actCode,
        jurisdiction: request.jurisdictionPrisonId || request.jurisdictionProvinceCode,
        mission: request.activeMissionId || "NENHUMA",
        timestamp: request.requestTimestamp,
        authorization: "REJEITADO_ESPECIALIDADE",
        result: "BLOQUEADO"
      }
    };
  }

  // 3. Verificação de Missão Ativa & Credencial
  if (rule.requiresActiveMission) {
    const activeMission = missions.find(m => 
      (m.personId === person.id || m.spNumber === person.spNumber) &&
      m.status === "ACTIVE" &&
      (!request.jurisdictionPrisonId || m.prisonId === request.jurisdictionPrisonId)
    );

    if (!activeMission) {
      return {
        authorized: false,
        decisionCode: "REJEITADO_SEM_MISSAO",
        reason: `Efetivo '${person.spNumber}' não possui Missão Operacional Ativa homologada pela DG para o estabelecimento/jurisdição especificada.`,
        evaluatedRule: rule,
        evidenceTuple: {
          actorSp: person.spNumber,
          entity: request.targetEntityId || "N/A",
          act: rule.actCode,
          jurisdiction: request.jurisdictionPrisonId || request.jurisdictionProvinceCode,
          mission: "NENHUMA_ATIVA",
          timestamp: request.requestTimestamp,
          authorization: "REJEITADO_SEM_MISSAO",
          result: "BLOQUEADO"
        }
      };
    }

    // Verificação de restrição explícita na missão
    if (activeMission.restrictedActs.includes(rule.actCode)) {
      return {
        authorized: false,
        decisionCode: "REJEITADO_ESPECIALIDADE",
        reason: `O acto '${rule.actName}' está expressamente vedado no termo de missão operacional '${activeMission.id}'.`,
        evaluatedRule: rule,
        evidenceTuple: {
          actorSp: person.spNumber,
          entity: request.targetEntityId || "N/A",
          act: rule.actCode,
          jurisdiction: activeMission.prisonId,
          mission: activeMission.id,
          timestamp: request.requestTimestamp,
          authorization: "REJEITADO_RESTRICAO_MISSAO",
          result: "BLOQUEADO"
        }
      };
    }
  }

  // 4. Verificação de Requisito de Validação DG
  if (rule.requiresDgAuthorization && person.primarySpecialty !== "DIRECTOR_ESTABELECIMENTO" && person.assignedOrgNodeId !== "ORG-DGSP") {
    return {
      authorized: false,
      decisionCode: "REJEITADO_REQUER_DG",
      reason: `Acto de competência exclusiva da Direcção Geral do Serviço Penitenciário.`,
      evaluatedRule: rule,
      evidenceTuple: {
        actorSp: person.spNumber,
        entity: request.targetEntityId || "N/A",
        act: rule.actCode,
        jurisdiction: "NACIONAL",
        mission: request.activeMissionId || "N/A",
        timestamp: request.requestTimestamp,
        authorization: "REJEITADO_REQUER_DG",
        result: "BLOQUEADO"
      }
    };
  }

  // SUCESSO: Autorização Deferida com Tupla de Evidência Canónica
  return {
    authorized: true,
    decisionCode: "PERMITIDO",
    reason: `Acto formalmente autorizado nos termos do Regime Disciplinar e Competência Operacional (${rule.actCode}).`,
    evaluatedRule: rule,
    evidenceTuple: {
      actorSp: person.spNumber,
      entity: request.targetEntityId || "REGISTO_OPERACIONAL",
      act: rule.actCode,
      jurisdiction: request.jurisdictionPrisonId || person.assignedPrisonId || person.assignedProvinceCode,
      mission: request.activeMissionId || "MSN-HOMOLOGADA",
      timestamp: request.requestTimestamp,
      authorization: "DEFERIDO_PLENA_COMPETENCIA",
      result: "SUCESSO_EXECUTADO"
    }
  };
}
