import { OrganizationalUnit, TerritorialScope } from "../types";

export interface DepartmentalDocument {
  id: string;
  docNumber: string; // e.g. "Despacho nº 048/DG-SP/MININT/2026"
  title: string;
  type: "DESPACHO" | "CIRCULAR" | "ORDEM_SERVICO" | "PARECER_TECNICO" | "GUIA_MARCHA" | "RELATORIO_INSPECAO" | "REQUISICAO_LOGISTICA";
  unitId: string;
  unitName: string;
  unitCode: string;
  issuerName: string;
  issuerRank: string;
  date: string;
  status: "MINUTA" | "EM_ANALISE" | "DESPACHADO" | "PUBLICADO" | "ARQUIVADO";
  securityLevel: "PÚBLICO" | "RESERVADO" | "CONFIDENCIAL" | "SECRETO";
  summary: string;
  bodyContent?: string;
  targetScope: "NACIONAL" | "PROVINCIAL" | "ESTABELECIMENTO";
  targetProvince?: string;
  targetPrisonId?: string;
}

// 1. ESTRUTURA CENTRAL DA DIRECÇÃO GERAL DO SERVIÇO PENITENCIÁRIO (DG-SP / MININT)
// Conforme o Decreto Presidencial n.º 184/17, de 11 de Agosto (Estatuto Orgânico do Serviço Penitenciário)
export const CENTRAL_NATIONAL_UNITS: OrganizationalUnit[] = [
  // --- ÓRGÃOS DE DIRECÇÃO SUPERIOR ---
  {
    id: "OU-MININT-DG",
    name: "Direcção Geral do Serviço Penitenciário",
    code: "DG-SP",
    sigla: "DG-SP",
    level: TerritorialScope.NATIONAL,
    divisionType: "DIRECAO_GERAL",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto - Artigo 7.º",
    headOfficerName: "Comissário Principal Bernardo do Amaral Gourgel",
    headOfficerRank: "Comissário Principal Prisional (Director Geral)",
    category: "ÓRGÃOS DE DIRECÇÃO SUPERIOR",
    functionDescription: "Superintendência, comando superior e direcção estratégica de todas as actividades penitenciárias, estabelecimentos prisionais e delegações provinciais no território nacional da República de Angola.",
    administrativeResponsibilities: "Gestão dos planos anuais do Serviço Penitenciário, despacho normativo e representação perante o Ministro do Interior.",
    operationalResponsibilities: "Comando geral das forças prisionais, ativação de contingências e autorização de transferências interprovinciais de alta segurança."
  },
  {
    id: "OU-MININT-DGA-OPS",
    name: "Direcção Geral Adjunta para Área Operacional e Penitenciária",
    code: "DGA-OPS",
    sigla: "DGA-OPS",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DG",
    divisionType: "DIRECAO_GERAL",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 8.º",
    headOfficerName: "Comissário Prisional Manuel Cristóvão",
    headOfficerRank: "Comissário Prisional (Director Geral Adjunto)",
    category: "ÓRGÃOS DE DIRECÇÃO SUPERIOR",
    functionDescription: "Supervisão direta das Direcções Nacionais de Segurança, Controlo Penal, Assistência e Reabilitação, Saúde e Inteligência Penitenciária.",
    operationalResponsibilities: "Coordenação de operações de custódia, revistas extraordinárias nacionais e transferências especiais."
  },
  {
    id: "OU-MININT-DGA-ADM",
    name: "Direcção Geral Adjunta para Área Administrativa e Recursos Humanos",
    code: "DGA-ADM",
    sigla: "DGA-ADM",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DG",
    divisionType: "DIRECAO_GERAL",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 8.º",
    headOfficerName: "Comissária Prisional Teresa da Conceição",
    headOfficerRank: "Comissária Prisional (Directora Geral Adjunta)",
    category: "ÓRGÃOS DE DIRECÇÃO SUPERIOR",
    functionDescription: "Supervisão e coordenação das Direcções Nacionais de Recursos Humanos, Administração e Finanças, Logística, Infraestruturas e TIC.",
    administrativeResponsibilities: "Gestão de carreiras, execução orçamental do OGE e cadeia de abastecimento nacional."
  },

  // --- ÓRGÃOS DE APOIO INSTRUMENTAL E CONSULTIVO ---
  {
    id: "OU-MININT-GDG",
    name: "Gabinete do Director Geral",
    code: "GDG",
    sigla: "GDG",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DG",
    divisionType: "GABINETE",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 9.º",
    headOfficerName: "Superintendente-Chefe Faustino de Castro",
    headOfficerRank: "Superintendente-Chefe Prisional",
    category: "ÓRGÃOS DE APOIO INSTRUMENTAL E CONSULTIVO",
    functionDescription: "Assessoria direta, apoio técnico-administrativo, protocolo de estado e gestão do expediente classificado do Director Geral."
  },
  {
    id: "OU-MININT-CCG",
    name: "Conselho Consultivo Geral",
    code: "CCG",
    sigla: "CCG",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DG",
    divisionType: "CONSELHO",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 10.º",
    headOfficerName: "Mesa Plenária dos Directores Nacionais e Provinciais",
    category: "ÓRGÃOS DE APOIO INSTRUMENTAL E CONSULTIVO",
    functionDescription: "Órgão colegial de consulta periódica para apreciação de políticas penitenciárias, balanços semestrais e planos diretores."
  },
  {
    id: "OU-MININT-CSD",
    name: "Conselho Superior de Disciplina",
    code: "CSD",
    sigla: "CSD",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DG",
    divisionType: "CONSELHO",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 11.º",
    headOfficerName: "Comissão de Ética e Justiça Militar/Penitenciária",
    category: "ÓRGÃOS DE APOIO INSTRUMENTAL E CONSULTIVO",
    functionDescription: "Órgão de julgamento disciplinar e avaliação de conduta ética dos oficiais e funcionários do Serviço Penitenciário."
  },

  // --- ÓRGÃOS CENTRAIS DE APOIO TÉCNICO E ADMINISTRATIVO ---
  {
    id: "OU-MININT-GJC",
    name: "Gabinete Jurídico e de Contencioso",
    code: "GJC",
    sigla: "GJC",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DG",
    divisionType: "GABINETE",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 12.º",
    headOfficerName: "Superintendente Prisional Dra. Maria Esperança",
    headOfficerRank: "Superintendente Prisional",
    category: "ÓRGÃOS DE APOIO TÉCNICO E ADMINISTRATIVO",
    functionDescription: "Assessoria jurídica à Direcção Geral, conformidade com os tratados de Direitos Humanos das Nações Unidas (Regras de Mandela), contencioso administrativo e formulação de projetos de decretos executivos.",
    mirrorProvincialTemplateCode: "GJP"
  },
  {
    id: "OU-MININT-GIAP",
    name: "Gabinete de Inspecção e Auditoria Penitenciária",
    code: "GIAP",
    sigla: "GIAP",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DG",
    divisionType: "GABINETE",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 13.º",
    headOfficerName: "Superintendente-Chefe Domingos Afonso",
    headOfficerRank: "Superintendente-Chefe Prisional",
    category: "ÓRGÃOS DE APOIO TÉCNICO E ADMINISTRATIVO",
    functionDescription: "Fiscalização e inspecção rigorosa a todos os Estabelecimentos Prisionais do país, auditoria da legalidade de detenção, controlo interno, inquéritos e sindicâncias disciplinares."
  },
  {
    id: "OU-MININT-GTIC",
    name: "Gabinete de Tecnologias de Informação e Comunicação",
    code: "GTIC",
    sigla: "GTIC",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DG",
    divisionType: "GABINETE",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 14.º",
    headOfficerName: "Subcomissário Prisional Eng. António Cordeiro",
    headOfficerRank: "Subcomissário Prisional",
    category: "ÓRGÃOS DE APOIO TÉCNICO E ADMINISTRATIVO",
    functionDescription: "Conceção, gestão e modernização das redes informáticas, infraestrutura de servidores, biometria digital e implementação do Sistema Integrado PNAP.",
    mirrorProvincialTemplateCode: "GTIP"
  },
  {
    id: "OU-MININT-GCII",
    name: "Gabinete de Comunicação Institucional e Imprensa",
    code: "GCII",
    sigla: "GCII",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DG",
    divisionType: "GABINETE",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 15.º",
    headOfficerName: "Superintendente Prisional Meneses de Oliveira",
    category: "ÓRGÃOS DE APOIO TÉCNICO E ADMINISTRATIVO",
    functionDescription: "Porta-voz oficial do Serviço Penitenciário, comunicação social, divulgação de projetos de ressocialização e gestão de crise midiática.",
    mirrorProvincialTemplateCode: "GCIP"
  },
  {
    id: "OU-MININT-DNRH",
    name: "Direcção Nacional de Recursos Humanos",
    code: "DNRH",
    sigla: "DNRH",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DGA-ADM",
    divisionType: "DIRECAO_NACIONAL",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 16.º",
    headOfficerName: "Subcomissário Prisional Fernando Sebastião",
    headOfficerRank: "Subcomissário Prisional (Director Nacional)",
    category: "ÓRGÃOS DE APOIO TÉCNICO E ADMINISTRATIVO",
    functionDescription: "Supervisão do efetivo nacional de oficiais, subchefes e guardas prisionais, processamento de promoções, aposentadorias e política remuneratória.",
    mirrorProvincialTemplateCode: "DRHP"
  },
  {
    id: "OU-MININT-DNRH-DGC",
    name: "Departamento de Gestão de Carreiras e Quadros",
    code: "DGC-RH",
    sigla: "DGC",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DNRH",
    divisionType: "DEPARTAMENTO",
    category: "ÓRGÃOS DE APOIO TÉCNICO E ADMINISTRATIVO",
    functionDescription: "Registo biométrico funcional, cadastro de efetivo, promoções por antiguidade e mérito operacional."
  },
  {
    id: "OU-MININT-DNRH-DFC",
    name: "Departamento de Formação e Capacitação",
    code: "DFC-RH",
    sigla: "DFC",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DNRH",
    divisionType: "DEPARTAMENTO",
    category: "ÓRGÃOS DE APOIO TÉCNICO E ADMINISTRATIVO",
    functionDescription: "Planificação de cursos de tiro tático, direitos humanos, intervenção prisional e liderança penitenciária em articulação com a ENFCP."
  },
  {
    id: "OU-MININT-DNAF",
    name: "Direcção Nacional de Administração e Finanças",
    code: "DNAF",
    sigla: "DNAF",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DGA-ADM",
    divisionType: "DIRECAO_NACIONAL",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 17.º",
    headOfficerName: "Subcomissária Prisional Teresa Ndala",
    headOfficerRank: "Subcomissária Prisional (Directora Nacional)",
    category: "ÓRGÃOS DE APOIO TÉCNICO E ADMINISTRATIVO",
    functionDescription: "Gestão orçamental e financeira centralizada do Serviço Penitenciário, execução das verbas do OGE e prestação de contas ao Tribunal de Contas.",
    mirrorProvincialTemplateCode: "DFPP"
  },
  {
    id: "OU-MININT-DNL",
    name: "Direcção Nacional de Logística e Património",
    code: "DNL",
    sigla: "DNL",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DGA-ADM",
    divisionType: "DIRECAO_NACIONAL",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 18.º",
    headOfficerName: "Subcomissário Prisional Pedro Cambuta",
    headOfficerRank: "Subcomissário Prisional (Director Nacional)",
    category: "ÓRGÃOS DE APOIO TÉCNICO E ADMINISTRATIVO",
    functionDescription: "Aquisição centralizada, armazenamento e distribuição de víveres alimentares, uniformes, armamento de serviço, munições, viaturas de escolta e meios especiais.",
    mirrorProvincialTemplateCode: "DLP"
  },
  {
    id: "OU-MININT-DNIM",
    name: "Direcção Nacional de Infra-Estruturas e Manutenção",
    code: "DNIM",
    sigla: "DNIM",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DGA-ADM",
    divisionType: "DIRECAO_NACIONAL",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 19.º",
    headOfficerName: "Superintendente-Chefe Arnaldo Calenga",
    category: "ÓRGÃOS DE APOIO TÉCNICO E ADMINISTRATIVO",
    functionDescription: "Planeamento de novas unidades prisionais, manutenção de vedações perimétricas, câmaras de segurança, sistemas hidráulicos e celas de alta segurança.",
    mirrorProvincialTemplateCode: "GIP"
  },
  {
    id: "OU-MININT-DNIEA",
    name: "Direcção Nacional de Informação, Estatística e Análise",
    code: "DNIEA",
    sigla: "DNIEA",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DGA-ADM",
    divisionType: "DIRECAO_NACIONAL",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 20.º",
    headOfficerName: "Superintendente Prisional Nelson Muachilete",
    category: "ÓRGÃOS DE APOIO TÉCNICO E ADMINISTRATIVO",
    functionDescription: "Compilação de dados estatísticos da população reclusa nacional, taxa de superlotação, taxas de reincidência e relatórios trimestrais do sistema.",
    mirrorProvincialTemplateCode: "DIAP"
  },

  // --- ÓRGÃOS CENTRAIS OPERACIONAIS E EXECUTIVOS ---
  {
    id: "OU-MININT-DNCP",
    name: "Direcção Nacional de Controlo Penal e Registo",
    code: "DNCP",
    sigla: "DNCP",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DGA-OPS",
    divisionType: "DIRECAO_NACIONAL",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 21.º",
    headOfficerName: "Subcomissário Prisional Dr. Joaquim dos Santos",
    headOfficerRank: "Subcomissário Prisional (Director Nacional)",
    category: "ÓRGÃOS OPERACIONAIS E EXECUTIVOS NACIONAIS",
    functionDescription: "Coordenação de toda a legalidade de custódia no país, controlo dos prazos de prisão preventiva, mandados de soltura, cálculo de penas, biometria e cadastro NREP.",
    mirrorProvincialTemplateCode: "DCPP"
  },
  {
    id: "OU-MININT-DNCP-DGP",
    name: "Departamento de Gestão Processual e Prazos Penais",
    code: "DGP-CP",
    sigla: "DGP",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DNCP",
    divisionType: "DEPARTAMENTO",
    category: "ÓRGÃOS OPERACIONAIS E EXECUTIVOS NACIONAIS",
    functionDescription: "Supervisão dos processos judiciais e auditoria de prazos preventivos em articulação com o Tribunal Supremo e Procuradoria Geral da República."
  },
  {
    id: "OU-MININT-DNCP-DIR",
    name: "Departamento de Identificação Biométrica e Registo (NREP)",
    code: "DIR-CP",
    sigla: "DIR",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DNCP",
    divisionType: "DEPARTAMENTO",
    category: "ÓRGÃOS OPERACIONAIS E EXECUTIVOS NACIONAIS",
    functionDescription: "Emissão centralizada do NREP (Número de Registo de Entrada Penitenciária), reconhecimento dactiloscópico e base de dados fotográfica."
  },
  {
    id: "OU-MININT-DNSOP",
    name: "Direcção Nacional de Segurança e Operações Penitenciárias",
    code: "DNSOP",
    sigla: "DNSOP",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DGA-OPS",
    divisionType: "DIRECAO_NACIONAL",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 22.º",
    headOfficerName: "Subcomissário Prisional Mateus Lourenço",
    headOfficerRank: "Subcomissário Prisional (Director Nacional)",
    category: "ÓRGÃOS OPERACIONAIS E EXECUTIVOS NACIONAIS",
    functionDescription: "Doutrina de segurança prisional, planos de contingência contra motins, custódia perimétrica, rondas armadas e escoltas prisionais de alto risco.",
    mirrorProvincialTemplateCode: "DSPP"
  },
  {
    id: "OU-MININT-DNSOP-GIRP",
    name: "Grupo de Intervenção Rápida Penitenciária (GIRP Nacional)",
    code: "GIRP",
    sigla: "GIRP",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DNSOP",
    divisionType: "DEPARTAMENTO",
    category: "ÓRGÃOS OPERACIONAIS E EXECUTIVOS NACIONAIS",
    functionDescription: "Força tática de elite para intervenção e retoma de controlo em situações de rebelião armada, motins, tomada de reféns e escoltas especiais de alta perigosidade."
  },
  {
    id: "OU-MININT-DNARP",
    name: "Direcção Nacional de Assistência e Reabilitação Penitenciária",
    code: "DNARP",
    sigla: "DNARP",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DGA-OPS",
    divisionType: "DIRECAO_NACIONAL",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 23.º",
    headOfficerName: "Subcomissária Prisional Dra. Albertina Zau",
    headOfficerRank: "Subcomissária Prisional (Directora Nacional)",
    category: "ÓRGÃOS OPERACIONAIS E EXECUTIVOS NACIONAIS",
    functionDescription: "Supervisão dos programas de reeducação cívica e moral, alfabetização de reclusos, ensino técnico-profissional, assistência religiosa e visitas familiares.",
    mirrorProvincialTemplateCode: "DARPP"
  },
  {
    id: "OU-MININT-DNPTAE",
    name: "Direcção Nacional de Produção, Trabalho e Actividades Económicas",
    code: "DNPTAE",
    sigla: "DNPTAE",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DGA-OPS",
    divisionType: "DIRECAO_NACIONAL",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 24.º",
    headOfficerName: "Superintendente-Chefe Eng. Lino Cassule",
    category: "ÓRGÃOS OPERACIONAIS E EXECUTIVOS NACIONAIS",
    functionDescription: "Direção dos campos de trabalho agrícola penitenciário, produção de hortícolas, pecuária, padarias industriais e oficinas de carpintaria/mecânica para autossuficiência do sistema.",
    mirrorProvincialTemplateCode: "DPAEP"
  },
  {
    id: "OU-MININT-DNPARS",
    name: "Direcção Nacional de Penas Alternativas e Reinserção Social",
    code: "DNPARS",
    sigla: "DNPARS",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DGA-OPS",
    divisionType: "DIRECAO_NACIONAL",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 25.º",
    headOfficerName: "Superintendente Prisional Graça Baptista",
    category: "ÓRGÃOS OPERACIONAIS E EXECUTIVOS NACIONAIS",
    functionDescription: "Fiscalização da execução de penas de trabalho a favor da comunidade, liberdade condicional supervisionada e programas de reinserção pós-libertação.",
    mirrorProvincialTemplateCode: "DPARSP"
  },
  {
    id: "OU-MININT-DNSSCP",
    name: "Direcção Nacional de Saúde e Serviços Clínicos Prisionais",
    code: "DNSSCP",
    sigla: "DNSSCP",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DGA-OPS",
    divisionType: "DIRECAO_NACIONAL",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 26.º",
    headOfficerName: "Subcomissário Prisional Dr. Rui Manuel (Médico)",
    headOfficerRank: "Subcomissário Prisional (Director Nacional)",
    category: "ÓRGÃOS OPERACIONAIS E EXECUTIVOS NACIONAIS",
    functionDescription: "Política sanitária nacional nas prisões, controlo epidemiológico (Tuberculose, VIH/SIDA, Malária), abastecimento de fármacos essenciais e supervisão de postos clínicos.",
    mirrorProvincialTemplateCode: "DSP"
  },
  {
    id: "OU-MININT-SCIP",
    name: "Serviço Central de Inteligência Penitenciária",
    code: "SCIP",
    sigla: "SCIP",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DGA-OPS",
    divisionType: "SERVICO_CENTRAL",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 27.º",
    headOfficerName: "Subcomissário Prisional Carlos Nogueira",
    headOfficerRank: "Subcomissário Prisional (Chefe de Serviço)",
    category: "ÓRGÃOS OPERACIONAIS E EXECUTIVOS NACIONAIS",
    functionDescription: "Atividades de inteligência, análise de comunicações ilícitas, prevenção de fugas organizadas, neutralização de lideranças de facções criminosas intramuros e contrainteligência.",
    mirrorProvincialTemplateCode: "SIPP"
  },

  // --- ÓRGÃOS DE FORMAÇÃO E SAÚDE ESPECIALIZADOS ---
  {
    id: "OU-MININT-ENFCP",
    name: "Escola Nacional de Formação e Capacitação Penitenciária",
    code: "ENFCP",
    sigla: "ENFCP",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DG",
    divisionType: "ESCOLA_NACIONAL",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 28.º",
    headOfficerName: "Subcomissário Prisional Abel dos Santos",
    headOfficerRank: "Comandante da Escola Nacional",
    category: "ÓRGÃOS DE FORMAÇÃO E SAÚDE ESPECIALIZADOS",
    functionDescription: "Formação inicial de guardas prisionais, cursos de progressão de carreira para subchefes e oficiais, instrução de tiro, técnicas de imobilização e direitos humanos (Sede no Kikuxi, Luanda)."
  },
  {
    id: "OU-MININT-HPC-SP",
    name: "Hospital Prisional Central de São Paulo",
    code: "HPC-SP",
    sigla: "HPC-SP",
    level: TerritorialScope.NATIONAL,
    parentId: "OU-MININT-DNSSCP",
    divisionType: "HOSPITAL_PRISIONAL",
    legalBasis: "Decreto Presidencial n.º 184/17 - Artigo 29.º",
    headOfficerName: "Superintendente-Chefe Dr. Garcia Neto (Médico Cirurgião)",
    headOfficerRank: "Director Clínico Hospitalar",
    category: "ÓRGÃOS DE FORMAÇÃO E SAÚDE ESPECIALIZADOS",
    functionDescription: "Hospital prisional central de referência terciária nacional com blocos operatórios, enfermaria de isolamento, internamento cirúrgico e psiquiatria forense (Luanda)."
  }
];

// 2. TEMPLATE DE DEPENDÊNCIAS PROVINCIAIS (18 DEPENDÊNCIAS POR PROVÍNCIA)
// Espelho sistemático das Direcções Nacionais a nível de cada Direcção Provincial
export const PROVINCIAL_18_DEPENDENCIES_TEMPLATE = [
  // I – DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)
  { num: 1, name: "Gabinete do Director Provincial", code: "GDP", type: "GABINETE" as const, category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const, func: "Apoio direto e expediente executivo do Director Provincial", mirrorNationalCode: "GDG" },
  { num: 2, name: "Gabinete Jurídico Provincial", code: "GJP", type: "GABINETE" as const, category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const, func: "Assessoria legal, contencioso e pareceres disciplinares locais", mirrorNationalCode: "GJC" },
  { num: 3, name: "Departamento de Informação e Análise Provincial", code: "DIAP", type: "DEPARTAMENTO" as const, category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const, func: "Estatísticas da população penal, relatórios demográficos e estudos locais", mirrorNationalCode: "DNIEA" },
  { num: 4, name: "Departamento de Recursos Humanos Provincial", code: "DRHP", type: "DEPARTAMENTO" as const, category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const, func: "Gestão de efetivos, escalas, licenças e assiduidade do pessoal da província", mirrorNationalCode: "DNRH" },
  { num: 5, name: "Departamento de Finanças e Planeamento Provincial", code: "DFPP", type: "DEPARTAMENTO" as const, category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const, func: "Execução orçamental provincial, tesouraria, património e prestação de contas", mirrorNationalCode: "DNAF" },
  { num: 6, name: "Departamento de Logística Provincial", code: "DLP", type: "DEPARTAMENTO" as const, category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const, func: "Recepção, armazenamento e distribuição de víveres, fardas e viaturas operacionais", mirrorNationalCode: "DNL" },
  { num: 7, name: "Gabinete de Infra-Estruturas Provincial", code: "GIP", type: "GABINETE" as const, category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const, func: "Manutenção física dos EPs, perímetros de segurança e engenharia de celas", mirrorNationalCode: "DNIM" },
  { num: 8, name: "Gabinete de Tecnologias de Informação Provincial", code: "GTIP", type: "GABINETE" as const, category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const, func: "Suporte aos postos de cadastro biométrico NREP e conectividade de dados", mirrorNationalCode: "GTIC" },
  { num: 9, name: "Gabinete de Comunicação e Imprensa Provincial", code: "GCIP", type: "GABINETE" as const, category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const, func: "Relações públicas com a imprensa local e cobertura institucional", mirrorNationalCode: "GCII" },

  // II – DEPENDÊNCIAS OPERACIONAIS (Executivas)
  { num: 10, name: "Departamento de Segurança Penitenciária Provincial", code: "DSPP", type: "DEPARTAMENTO" as const, category: "II - DEPENDÊNCIAS OPERACIONAIS (Executivas)" as const, func: "Comando da guarda prisional, segurança nas cadeias da província e escoltas", mirrorNationalCode: "DNSOP" },
  { num: 11, name: "Departamento de Controlo Penal Provincial", code: "DCPP", type: "DEPARTAMENTO" as const, category: "II - DEPENDÊNCIAS OPERACIONAIS (Executivas)" as const, func: "Gestão dos processos de reclusos, controlo de mandados, prazos e biometria NREP", mirrorNationalCode: "DNCP" },
  { num: 12, name: "Departamento de Assistência e Reabilitação Penitenciária Provincial", code: "DARPP", type: "DEPARTAMENTO" as const, category: "II - DEPENDÊNCIAS OPERACIONAIS (Executivas)" as const, func: "Programas educativos, oficinas de formação profissional e apoio familiar", mirrorNationalCode: "DNARP" },
  { num: 13, name: "Departamento de Produção e Actividades Económicas Provincial", code: "DPAEP", type: "DEPARTAMENTO" as const, category: "II - DEPENDÊNCIAS OPERACIONAIS (Executivas)" as const, func: "Campos agropecuários prisionais e oficinas de produção económica", mirrorNationalCode: "DNPTAE" },
  { num: 14, name: "Departamento de Penas Alternativas e Reinserção Social Provincial", code: "DPARSP", type: "DEPARTAMENTO" as const, category: "II - DEPENDÊNCIAS OPERACIONAIS (Executivas)" as const, func: "Acompanhamento de penas substitutivas comunitárias e apoio pós-penitenciário", mirrorNationalCode: "DNPARS" },
  { num: 15, name: "Serviço de Inteligência Penitenciária Provincial", code: "SIPP", type: "DEPARTAMENTO" as const, category: "II - DEPENDÊNCIAS OPERACIONAIS (Executivas)" as const, func: "Coleta e análise de inteligência prisional, prevenção de motins e evasões", mirrorNationalCode: "SCIP" },
  { num: 16, name: "Departamento de Saúde Provincial", code: "DSP", type: "DEPARTAMENTO" as const, category: "II - DEPENDÊNCIAS OPERACIONAIS (Executivas)" as const, func: "Supervisão clínica dos postos médicos, triagem sanitária e encaminhamentos hospitalares", mirrorNationalCode: "DNSSCP" },

  // III – DEPENDÊNCIAS DE APOIO INSTRUMENTAL
  { num: 17, name: "Conselho Consultivo Provincial", code: "CCP", type: "CONSELHO" as const, category: "III - DEPENDÊNCIAS DE APOIO INSTRUMENTAL" as const, func: "Órgão consultivo periódico do Director Provincial com directores de cadeias", mirrorNationalCode: "CCG" },
  { num: 18, name: "Corpo de Conselheiros Provincial", code: "CCORP", type: "CONSELHO" as const, category: "III - DEPENDÊNCIAS DE APOIO INSTRUMENTAL" as const, func: "Aconselhamento estratégico e ligação com o governo provincial e tribunais de comarca", mirrorNationalCode: "CSD" }
];

export const ANGOLA_PROVINCES = [
  { id: "OU-DP-CABINDA", name: "SP/Cabinda", province: "Cabinda", chief: "Subcomissário Prisional Pedro Luemba" },
  { id: "OU-DP-ZAIRE", name: "SP/Zaire", province: "Zaire", chief: "Superintendente-Chefe Afonso Nzenza" },
  { id: "OU-DP-UIGE", name: "SP/Uíge", province: "Uíge", chief: "Subcomissário Prisional Jorge Manuel" },
  { id: "OU-DP-BENGO", name: "SP/Bengo", province: "Bengo", chief: "Superintendente-Chefe Manuel Garcia" },
  { id: "OU-DP-ICOLO-BENGO", name: "SP/Icolo e Bengo", province: "Icolo e Bengo", chief: "Superintendente Prisional Teresa Ganga" },
  { id: "OU-DP-LUANDA", name: "SP/Luanda", province: "Luanda", chief: "Comissário Prisional Bernardo Francisco" },
  { id: "OU-DP-CUANZA-NORTE", name: "SP/Cuanza Norte", province: "Cuanza-Norte", chief: "Superintendente-Chefe Bartolomeu Dias" },
  { id: "OU-DP-CUANZA-SUL", name: "SP/Cuanza Sul", province: "Cuanza-Sul", chief: "Subcomissário Prisional Mateus Gaspar" },
  { id: "OU-DP-MALANJE", name: "SP/Malanje", province: "Malanje", chief: "Subcomissário Prisional António Quituxi" },
  { id: "OU-DP-LUNDA-NORTE", name: "SP/Lunda Norte", province: "Lunda-Norte", chief: "Superintendente-Chefe Carlos Muangue" },
  { id: "OU-DP-LUNDA-SUL", name: "SP/Lunda Sul", province: "Lunda-Sul", chief: "Superintendente Prisional Henriques Dala" },
  { id: "OU-DP-BENGUELA", name: "SP/Benguela", province: "Benguela", chief: "Comissário Prisional Fernando Catumbela" },
  { id: "OU-DP-HUAMBO", name: "SP/Huambo", province: "Huambo", chief: "Comissário Prisional Lucas Vilinga" },
  { id: "OU-DP-BIE", name: "SP/Bié", province: "Bié", chief: "Subcomissário Prisional Gabriel Chivinda" },
  { id: "OU-DP-MOXICO", name: "SP/Moxico", province: "Moxico", chief: "Subcomissário Prisional Faustino Samahina" },
  { id: "OU-DP-MOXICO-LESTE", name: "SP/Moxico Leste", province: "Moxico Leste", chief: "Superintendente Prisional Luísa Katapi" },
  { id: "OU-DP-HUILA", name: "SP/Huíla", province: "Huíla", chief: "Comissário Prisional Ernesto Capango" },
  { id: "OU-DP-NAMIBE", name: "SP/Namibe", province: "Namibe", chief: "Subcomissário Prisional David Tchissingui" },
  { id: "OU-DP-CUNENE", name: "SP/Cunene", province: "Cunene", chief: "Superintendente-Chefe Valdemar Haufiku" },
  { id: "OU-DP-CUBANGO", name: "SP/Cubango", province: "Cubango", chief: "Superintendente Prisional Tomás Cavalo" },
  { id: "OU-DP-CUANDO", name: "SP/Cuando", province: "Cuando", chief: "Superintendente Prisional Mário Cussumua" }
];

export const generateFullOrganizationalUnits = (): OrganizationalUnit[] => {
  const result: OrganizationalUnit[] = [...CENTRAL_NATIONAL_UNITS];

  ANGOLA_PROVINCES.forEach(p => {
    // Direcção Provincial
    result.push({
      id: p.id,
      name: `Direcção Provincial do ${p.province}`,
      code: `DP-${p.province.substring(0, 3).toUpperCase()}`,
      sigla: `DP-${p.province.substring(0, 3).toUpperCase()}`,
      level: TerritorialScope.PROVINCIAL,
      parentId: "OU-MININT-DG",
      province: p.province,
      divisionType: "DIRECAO_PROVINCIAL",
      legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto - Artigo 30.º",
      headOfficerName: p.chief,
      category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)",
      functionDescription: `Direcção, coordenação e fiscalização dos estabelecimentos penitenciários e serviços prisionais na Província do ${p.province}.`,
      mirrorNationalUnitId: "OU-MININT-DG"
    });

    // 18 Dependências Provinciais
    PROVINCIAL_18_DEPENDENCIES_TEMPLATE.forEach(dep => {
      const nationalUnit = CENTRAL_NATIONAL_UNITS.find(u => (u.sigla || u.code) === dep.mirrorNationalCode);

      result.push({
        id: `OU-DEP-${p.province.replace(/\s+/g, '-').toUpperCase()}-${dep.code}`,
        name: `${dep.num}. ${dep.name}`,
        level: TerritorialScope.PROVINCIAL,
        parentId: p.id,
        province: p.province,
        divisionType: dep.type,
        code: `${dep.code}-${p.province.substring(0, 3).toUpperCase()}`,
        sigla: `${dep.code}-${p.province.substring(0, 3).toUpperCase()}`,
        legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
        category: dep.category,
        functionDescription: dep.func,
        mirrorNationalUnitId: nationalUnit?.id,
        mirrorProvincialTemplateCode: dep.code
      });
    });
  });

  return result;
};

// 3. DOCUMENTOS DESMATERIALIZADOS INICIAIS
export const INITIAL_DEPARTMENTAL_DOCUMENTS: DepartmentalDocument[] = [
  {
    id: "DOC-2026-001",
    docNumber: "Despacho nº 012/DG-SP/MININT/2026",
    title: "Directiva sobre Reforço da Auditoria Processual e Prazos de Prisão Preventiva",
    type: "DESPACHO",
    unitId: "OU-MININT-DG",
    unitName: "Direcção Geral do Serviço Penitenciário",
    unitCode: "DG-SP",
    issuerName: "Comissário Principal Bernardo Gourgel",
    issuerRank: "Director Geral",
    date: "2026-08-01",
    status: "PUBLICADO",
    securityLevel: "PÚBLICO",
    targetScope: "NACIONAL",
    summary: "Determina a todas as Direcções Provinciais a realização de auditorias semanais aos prazos processuais para erradicar o excesso de prisão preventiva.",
    bodyContent: "Havendo necessidade de assegurar a estrita legalidade nos prazos de detenção e prisão preventiva, nos termos do Código de Processo Penal Angolano e das directivas do Conselho Superior da Magistratura Judicial, determino: 1. Todos os Departamentos de Controlo Penal Provinciais (DCPP) devem auditar quinzenalmente o NREP de todos os reclusos sem culpa formada. 2. Os relatórios de conformidade devem ser submetidos à DNCP até ao dia 5 de cada mês."
  },
  {
    id: "DOC-2026-002",
    docNumber: "Ordem de Serviço nº 089/DNSOP-MININT/2026",
    title: "Plano Nacional de Revistas Inopinadas e Neutralização de Meios Ilegais",
    type: "ORDEM_SERVICO",
    unitId: "OU-MININT-DNSOP",
    unitName: "Direcção Nacional de Segurança e Operações Penitenciárias",
    unitCode: "DNSOP",
    issuerName: "Subcomissário Mateus Lourenço",
    issuerRank: "Director Nacional de Segurança",
    date: "2026-08-05",
    status: "PUBLICADO",
    securityLevel: "RESERVADO",
    targetScope: "NACIONAL",
    summary: "Activação de medidas extraordinárias de revista física e electrónica em todas as celas de regime fechado do país.",
    bodyContent: "Determina-se a intensificação das revistas nas portas de armas e zonas de alojamento reclusório de todos os EPs, com emprego de detectores não lineares para apreensão de telemóveis e estupefacientes."
  },
  {
    id: "DOC-2026-003",
    docNumber: "Parecer Técnico nº 034/DNCP-MININT/2026",
    title: "Parecer sobre Homologação de Cômputo de Pena e Remição pelo Trabalho",
    type: "PARECER_TECNICO",
    unitId: "OU-MININT-DNCP",
    unitName: "Direcção Nacional de Controlo Penal e Registo",
    unitCode: "DNCP",
    issuerName: "Subcomissário Dr. Joaquim dos Santos",
    issuerRank: "Director Nacional de Controlo Penal",
    date: "2026-08-08",
    status: "PUBLICADO",
    securityLevel: "PÚBLICO",
    targetScope: "PROVINCIAL",
    targetProvince: "Luanda",
    summary: "Fixação de critérios uniformes para proposta de liberdade condicional a reclusos em atividade produtiva nos campos agrícolas prisionais.",
    bodyContent: "Apresenta análise doutrinária e regulamentar sobre a contagem de 3 dias de trabalho para 1 dia de remição de pena, em cumprimento do Regulamento Geral dos Estabelecimentos Prisionais."
  },
  {
    id: "DOC-2026-004",
    docNumber: "Circular nº 019/DNSSCP-MININT/2026",
    title: "Protocolo de Triagem Clínica Obrigatória na Admissão e Rastreio Tisiológico",
    type: "CIRCULAR",
    unitId: "OU-MININT-DNSSCP",
    unitName: "Direcção Nacional de Saúde e Serviços Clínicos Prisionais",
    unitCode: "DNSSCP",
    issuerName: "Subcomissário Dr. Rui Manuel",
    issuerRank: "Director Nacional de Saúde",
    date: "2026-08-10",
    status: "PUBLICADO",
    securityLevel: "PÚBLICO",
    targetScope: "NACIONAL",
    summary: "Instrução a todos os postos médicos provinciais para exame radiológico e baciloscopia obrigatória a todos os novos reclusos admitidos.",
    bodyContent: "Para prevenir surtos epidemiológicos de Tuberculose nos pavilhões de admissão, é obrigatório o registo no boletim clínico individual antes da alocação à cela definitiva."
  },
  {
    id: "DOC-2026-005",
    docNumber: "Relatório de Inspecção nº 007/GIAP-MININT/2026",
    title: "Relatório de Auditoria e Inspecção Extraordinária ao EP de Viana e EP de Kakila",
    type: "RELATORIO_INSPECAO",
    unitId: "OU-MININT-GIAP",
    unitName: "Gabinete de Inspecção e Auditoria Penitenciária",
    unitCode: "GIAP",
    issuerName: "Superintendente-Chefe Domingos Afonso",
    issuerRank: "Inspector-Chefe Penitenciário",
    date: "2026-08-12",
    status: "PUBLICADO",
    securityLevel: "CONFIDENCIAL",
    targetScope: "PROVINCIAL",
    targetProvince: "Luanda",
    targetPrisonId: "ep-viana",
    summary: "Conclusões da vistoria aos postos de sentinela, refeitórios, farmácia do estabelecimento e situação jurídica dos reclusos estrangeiros.",
    bodyContent: "Verificou-se conformidade de 94% nas escalas de guarda do GIRP, recomendando-se a renovação da iluminação perimétrica do Bloco C e aceleração de 14 processos com excesso de prazo."
  },
  {
    id: "DOC-2026-006",
    docNumber: "Guia de Marcha Interprovincial nº 142/DCPP-LUA/2026",
    title: "Guia de Transferência e Escolta Tática de Reclusos de Alto Risco para o EP de Calomboloca",
    type: "GUIA_MARCHA",
    unitId: "OU-DEP-LUANDA-DCPP",
    unitName: "11. Departamento de Controlo Penal Provincial de Luanda",
    unitCode: "DCPP-LUA",
    issuerName: "Superintendente Prisional Mário Silva",
    issuerRank: "Chefe do DCPP Luanda",
    date: "2026-08-13",
    status: "PUBLICADO",
    securityLevel: "SECRETO",
    targetScope: "PROVINCIAL",
    targetProvince: "Luanda",
    summary: "Autorização de escolta blindada com escolta do GIRP para transferência de reclusos perigosos com ordem judicial.",
    bodyContent: "Em cumprimento do Despacho do Juiz da 1ª Secção da Sala de Crimes Comuns, autoriza-se a movimentação sob escolta reforçada com armamento regulamentar e registo fotográfico na entrega."
  }
];
