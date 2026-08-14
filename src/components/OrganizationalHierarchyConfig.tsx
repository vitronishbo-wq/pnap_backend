import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Network, 
  Building2, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  ChevronRight, 
  ChevronDown, 
  Link as LinkIcon, 
  Unlink, 
  FileText, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  RefreshCw, 
  Download,
  FolderTree,
  UserCheck,
  Building,
  ArrowRight,
  Shield,
  Briefcase,
  Users,
  Info,
  Phone,
  Printer,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Lock,
  ShieldAlert,
  Eye,
  SlidersHorizontal,
  Zap,
  GitFork,
  MapPin,
  Workflow,
  Share2,
  Compass,
  ArrowUpRight,
  Split,
  X,
  ArrowDown,
  ArrowUp,
  Settings2,
  AlertTriangle,
  FileCheck
} from "lucide-react";
import { OrganizationalUnit, TerritorialScope } from "../types";

export interface OrganizationalHierarchyConfigProps {
  organizationalUnits: OrganizationalUnit[];
  setOrganizationalUnits: React.Dispatch<React.SetStateAction<OrganizationalUnit[]>>;
  prisons?: any[];
  setPrisons?: React.Dispatch<React.SetStateAction<any[]>>;
  triggerToast?: (title: string, message: string, type: "success" | "warning" | "info" | "error") => void;
  currentOperator?: any;
}

// 4 Canonical Administrative Tree Levels
export type AdministrativeTreeLevel = "L1_DG" | "L2_PROV" | "L3_EP" | "L4_ORGAO";

export interface LevelDefinitionMeta {
  num: number;
  levelKey: AdministrativeTreeLevel;
  label: string;
  shortLabel: string;
  scope: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  colorName: string;
  icon: any;
  description: string;
  allowedParentLevels: AdministrativeTreeLevel[];
  defaultDivisionTypes: string[];
}

export const ADMINISTRATIVE_LEVEL_DEFINITIONS: Record<AdministrativeTreeLevel, LevelDefinitionMeta> = {
  L1_DG: {
    num: 1,
    levelKey: "L1_DG",
    label: "Nível 1 — Direcção Geral (DGSP / MININT)",
    shortLabel: "Direcção Geral",
    scope: "Nacional / Central",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-400",
    colorName: "amber",
    icon: ShieldCheck,
    description: "Órgão Central de Comando Superior, Direcções Nacionais e Serviços Centrais da Administração Penitenciária.",
    allowedParentLevels: [],
    defaultDivisionTypes: ["DIRECAO_GERAL", "DIRECAO_NACIONAL", "SERVICO_CENTRAL", "ESCOLA_NACIONAL"]
  },
  L2_PROV: {
    num: 2,
    levelKey: "L2_PROV",
    label: "Nível 2 — Província (Direcção Provincial)",
    shortLabel: "Direcção Provincial",
    scope: "Provincial (18 Províncias)",
    badgeBg: "bg-blue-500/10",
    badgeBorder: "border-blue-500/30",
    badgeText: "text-blue-400",
    colorName: "blue",
    icon: Building2,
    description: "Órgãos de Direcção e Tutela Territorial a nível das 18 Províncias de Angola.",
    allowedParentLevels: ["L1_DG"],
    defaultDivisionTypes: ["DIRECAO_PROVINCIAL"]
  },
  L3_EP: {
    num: 3,
    levelKey: "L3_EP",
    label: "Nível 3 — Estabelecimento Penitenciário (EP / Cadeia)",
    shortLabel: "Estabelecimento Penitenciário",
    scope: "Custódia Carcerária",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/30",
    badgeText: "text-emerald-400",
    colorName: "emerald",
    icon: Building,
    description: "Unidades Penitenciárias de Custódia, Estabelecimentos de Regime Fechado/Semiaberto e Campos de Produção.",
    allowedParentLevels: ["L2_PROV", "L1_DG"],
    defaultDivisionTypes: ["ESTAB_PENITENCIARIO", "HOSPITAL_PRISIONAL"]
  },
  L4_ORGAO: {
    num: 4,
    levelKey: "L4_ORGAO",
    label: "Nível 4 — Órgão / Departamento / Secção / Serviço",
    shortLabel: "Órgão / Secção / Serviço",
    scope: "Executivo / Operacional",
    badgeBg: "bg-purple-500/10",
    badgeBorder: "border-purple-500/30",
    badgeText: "text-purple-400",
    colorName: "purple",
    icon: Layers,
    description: "Departamentos de Controlo Penal, Segurança, Reabilitação, Saúde, Logística, Gabinetes e Secções Técnicas.",
    allowedParentLevels: ["L3_EP", "L2_PROV", "L1_DG"],
    defaultDivisionTypes: ["DEPARTAMENTO", "SECCAO", "GABINETE", "REPARTICAO", "CONSELHO", "SERVICO_CENTRAL"]
  }
};

// Dynamic helper to resolve unit's Administrative Tree Level reading from OrganizationalUnit state
export const getUnitTreeLevel = (unit: OrganizationalUnit): AdministrativeTreeLevel => {
  // 1. Explicit treeLevel definition stored in OrganizationalUnit state
  if (unit.treeLevel === "L1_DG" || unit.treeLevel === "L2_PROV" || unit.treeLevel === "L3_EP" || unit.treeLevel === "L4_ORGAO") {
    return unit.treeLevel as AdministrativeTreeLevel;
  }

  // 2. Explicit numerical hierarchyLevel (1=DG, 2=Provincial, 3=EP, 4=Órgão)
  if (unit.hierarchyLevel === 1) return "L1_DG";
  if (unit.hierarchyLevel === 2) return "L2_PROV";
  if (unit.hierarchyLevel === 3) return "L3_EP";
  if (unit.hierarchyLevel === 4) return "L4_ORGAO";

  // 3. Dynamic statutory inference based on unit properties
  if (
    unit.level === TerritorialScope.NATIONAL || 
    unit.divisionType === "DIRECAO_GERAL" || 
    unit.divisionType === "DIRECAO_NACIONAL" || 
    unit.id === "OU-MININT-DG" || 
    unit.category === "ÓRGÃOS DE DIRECÇÃO SUPERIOR" ||
    !unit.parentId
  ) {
    return "L1_DG";
  }
  
  if (
    (unit.level === TerritorialScope.PROVINCIAL && unit.divisionType === "DIRECAO_PROVINCIAL") ||
    (unit.id.startsWith("OU-DP-") && !unit.divisionType?.includes("SECCAO") && !unit.divisionType?.includes("DEPARTAMENTO") && !unit.divisionType?.includes("GABINETE")) ||
    (unit.level === TerritorialScope.PROVINCIAL && (!unit.parentId || unit.parentId === "OU-MININT-DG") && !unit.divisionType && !unit.prisonId)
  ) {
    return "L2_PROV";
  }
  
  if (
    unit.divisionType === "ESTAB_PENITENCIARIO" || 
    unit.divisionType === "HOSPITAL_PRISIONAL" ||
    unit.level === TerritorialScope.ESTABLISHMENT || 
    unit.category?.startsWith("IV") ||
    unit.prisonId !== undefined
  ) {
    return "L3_EP";
  }
  
  // Default is Level 4 (Órgão / Departamento / Secção / Serviço)
  return "L4_ORGAO";
};

// 18 Standard Statutory Sub-Units defined by Decreto Presidencial n.º 184/17 de 11 de Agosto
const STANDARD_STATUTORY_SUBUNITS = [
  // I – DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)
  {
    num: 1,
    nameSuffix: "Gabinete do Director Provincial",
    codePrefix: "GDP",
    type: "GABINETE" as const,
    category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const,
    functionDescription: "Apoio direto e expediente do Director Provincial",
    defaultAdminResp: "Gestão do expediente geral, arquivo da direcção provincial, instrução de correspondência oficial e despacho com a Direção Geral.",
    defaultOperResp: "Supervisão direta das rotinas de comando, agendamento de inspeções técnicas e reuniões extraordinárias de segurança.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  },
  {
    num: 2,
    nameSuffix: "Gabinete Jurídico Provincial",
    codePrefix: "GJP",
    type: "GABINETE" as const,
    category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const,
    functionDescription: "Assessoria legal e processos disciplinares locais",
    defaultAdminResp: "Redação de pareceres jurídicos, instrução de processos disciplinares ao pessoal, verificação da conformidade com o Código Penal e legislação penitenciária.",
    defaultOperResp: "Auditoria à legalidade dos mandados de captura/soltura, acompanhamento de Habeas Corpus e contencioso com órgãos judiciais locais.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  },
  {
    num: 3,
    nameSuffix: "Departamento de Informação e Análise Provincial",
    codePrefix: "DIAP",
    type: "DEPARTAMENTO" as const,
    category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const,
    functionDescription: "Estatísticas, estudos e planeamento local",
    defaultAdminResp: "Elaboração de relatórios estatísticos diários, mensais e anuais sobre a população prisional e tendências criminais da província.",
    defaultOperResp: "Análise de risco situacional, recolha de indicadores operacionais e formulação de estratégias de mitigação de vulnerabilidades nas cadeias.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  },
  {
    num: 4,
    nameSuffix: "Departamento de Recursos Humanos Provincial",
    codePrefix: "DRHP",
    type: "DEPARTAMENTO" as const,
    category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const,
    functionDescription: "Gestão do pessoal e quadros afetos à província",
    defaultAdminResp: "Processamento de folhas de efetivo, gestão de férias, licenças, avaliação de desempenho, promoções e cadastramento de oficiais militares.",
    defaultOperResp: "Controlo do mapa de turnos, distribuição do efetivo por postos de guarda e fiscalização da assiduidade e disciplina funcional.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  },
  {
    num: 5,
    nameSuffix: "Departamento de Finanças e Planeamento Provincial",
    codePrefix: "DFPP",
    type: "DEPARTAMENTO" as const,
    category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const,
    functionDescription: "Orçamento, contabilidade e património local",
    defaultAdminResp: "Gestão do orçamento provincial, elaboração de propostas orçamentais, pagamentos a fornecedores e prestação de contas.",
    defaultOperResp: "Inventariante do património imobiliário e bens das unidades prisionais, auditoria aos fundos operacionais e fundos de maneio.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  },
  {
    num: 6,
    nameSuffix: "Departamento de Logística Provincial",
    codePrefix: "DLP",
    type: "DEPARTAMENTO" as const,
    category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const,
    functionDescription: "Abastecimento, víveres, fardamento e transporte",
    defaultAdminResp: "Requisição de racionamento/víveres, uniformes, equipamento técnico, combustível e manutenção da frota automóvel prisional.",
    defaultOperResp: "Gestão e distribuição física de alimentos às cozinhas das cadeias, apoio de transporte para escoltas prisionais e abastecimento de emergência.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  },
  {
    num: 7,
    nameSuffix: "Gabinete de Infra-Estruturas Provincial",
    codePrefix: "GIP",
    type: "GABINETE" as const,
    category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const,
    functionDescription: "Manutenção e conservação das instalações",
    defaultAdminResp: "Levantamento das necessidades de obras, projetos de ampliação de blocos carcerários e elaboração de cadernos de encargos.",
    defaultOperResp: "Fiscalização direta do estado físico dos muros perimetrais, redes elétricas, saneamento e geradores nas unidades de custódia.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  },
  {
    num: 8,
    nameSuffix: "Gabinete de Tecnologias de Informação Provincial",
    codePrefix: "GTIP",
    type: "GABINETE" as const,
    category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const,
    functionDescription: "Suporte informático e telecomunicações",
    defaultAdminResp: "Administração da rede informática provincial, suporte ao sistema NREP-AO, gestão de utilizadores e credenciais de acesso.",
    defaultOperResp: "Manutenção de câmaras CCTV, sistemas de biometria, transmissores rádio e salas de crise/videoconferência com os tribunais.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  },
  {
    num: 9,
    nameSuffix: "Gabinete de Comunicação e Imprensa Provincial",
    codePrefix: "GCIP",
    type: "GABINETE" as const,
    category: "I - DEPENDÊNCIAS ADMINISTRATIVAS (Apoio Técnico)" as const,
    functionDescription: "Relações públicas e imagem institucional",
    defaultAdminResp: "Emissão de comunicados de imprensa, cobertura de visitas oficiais e gestão da informação institucional aos órgãos de comunicação social.",
    defaultOperResp: "Monitoria de notícias relevantes para o serviço penitenciário e apoio na comunicação em situações de crise institucional.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  },

  // II – DEPENDÊNCIAS OPERACIONAIS (Executivas)
  {
    num: 10,
    nameSuffix: "Departamento de Segurança Penitenciária Provincial",
    codePrefix: "DSPP",
    type: "DEPARTAMENTO" as const,
    category: "II - DEPENDÊNCIAS OPERACIONAIS (Executivas)" as const,
    functionDescription: "Ordem, disciplina e segurança nas cadeias da província",
    defaultAdminResp: "Elaboração do plano provincial de segurança, mapas de escala de guarda, registo do cadastro do armamento e equipamento antidistúrbio.",
    defaultOperResp: "Manutenção da ordem interna nos EPs, rondas perimetrais, escoltas de reclusos de alto risco, prevenção de motins e revistas gerais de celas.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  },
  {
    num: 11,
    nameSuffix: "Departamento de Controlo Penal Provincial",
    codePrefix: "DCPP",
    type: "DEPARTAMENTO" as const,
    category: "II - DEPENDÊNCIAS OPERACIONAIS (Executivas)" as const,
    functionDescription: "Gestão processual, registos e BI de reclusos",
    defaultAdminResp: "Processamento de Guias de Marcha, verificação da validade das mandados de prisão preventiva, cálculo de cumprimento de penas e estatística criminal.",
    defaultOperResp: "Identificação biométrica no acolhimento de reclusos, emissão de certidões de conduta e controlo de saídas e transferências entre EPs.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  },
  {
    num: 12,
    nameSuffix: "Departamento de Assistência e Reabilitação Penitenciária Provincial",
    codePrefix: "DARPP",
    type: "DEPARTAMENTO" as const,
    category: "II - DEPENDÊNCIAS OPERACIONAIS (Executivas)" as const,
    functionDescription: "Programas reabilitativos e assistência social",
    defaultAdminResp: "Organização de programas escolares, cursos de formação profissional e planeamento do acompanhamento psicológico aos reclusos.",
    defaultOperResp: "Acompanhamento social de reclusos vulneráveis, assistência religiosa, ligação com as famílias e facilitação do direito a visitas.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  },
  {
    num: 13,
    nameSuffix: "Departamento de Produção e Actividades Económicas Provincial",
    codePrefix: "DPAEP",
    type: "DEPARTAMENTO" as const,
    category: "II - DEPENDÊNCIAS OPERACIONAIS (Executivas)" as const,
    functionDescription: "Atividades produtivas, agrícolas e oficinas",
    defaultAdminResp: "Planeamento agrícola e industrial das brigadas de trabalho prisional, controlo de insumos e comercialização de excedentes.",
    defaultOperResp: "Supervisão da segurança das brigadas de reclusos nos campos de cultivo, oficinas de marcenaria, serralharia e panificação.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  },
  {
    num: 14,
    nameSuffix: "Departamento de Penas Alternativas e Reinserção Social Provincial",
    codePrefix: "DPARSP",
    type: "DEPARTAMENTO" as const,
    category: "II - DEPENDÊNCIAS OPERACIONAIS (Executivas)" as const,
    functionDescription: "Acompanhamento de penas não privativas de liberdade",
    defaultAdminResp: "Cadastro de indivíduos sob liberdade condicional, trabalho a favor da comunidade e penas suspensas na província.",
    defaultOperResp: "Acompanhamento presencial dos cidadãos em cumprimento de penas alternativas e articulação com empresas e entidades acolhedoras.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  },
  {
    num: 15,
    nameSuffix: "Serviço de Inteligência Penitenciária Provincial",
    codePrefix: "SIPP",
    type: "DEPARTAMENTO" as const,
    category: "II - DEPENDÊNCIAS OPERACIONAIS (Executivas)" as const,
    functionDescription: "Informações, contra-inteligência e prevenção de ameaças",
    defaultAdminResp: "Registo confidencial de dados de inteligência, análise de perfis de risco e articulação com o SINSE e PNA na província.",
    defaultOperResp: "Detenção e neutralização de tentativas de introdução de telemóveis, drogas e armas; prevenção de fugas e contra-subversão carcerária.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  },
  {
    num: 16,
    nameSuffix: "Departamento de Saúde Provincial",
    codePrefix: "DSP",
    type: "DEPARTAMENTO" as const,
    category: "II - DEPENDÊNCIAS OPERACIONAIS (Executivas)" as const,
    functionDescription: "Assistência médica a reclusos e efetivo prisional",
    defaultAdminResp: "Requisição de medicamentos, vacinas, coordenação do pessoal de enfermagem e estatística sanitária carcerária.",
    defaultOperResp: "Consultas médicas e de enfermagem nos postos de saúde dos EPs, triagem epidemiológica, isolamento sanitário e evacuações de urgência para hospitais.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  },

  // III – DEPENDÊNCIAS DE APOIO INSTRUMENTAL
  {
    num: 17,
    nameSuffix: "Conselho Consultivo Provincial",
    codePrefix: "CCP",
    type: "CONSELHO" as const,
    category: "III - DEPENDÊNCIAS DE APOIO INSTRUMENTAL" as const,
    functionDescription: "Órgão consultivo de análise do Director Provincial",
    defaultAdminResp: "Secretariado das sessões de trabalho, redação das actas das reuniões do conselho e arquivo das diretivas deliberadas.",
    defaultOperResp: "Apreciação de planos operacionais provinciais, grandes diretrizes de segurança e relatórios das unidades penitenciárias.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  },
  {
    num: 18,
    nameSuffix: "Corpo de Conselheiros Provincial",
    codePrefix: "CCORP",
    type: "CONSELHO" as const,
    category: "III - DEPENDÊNCIAS DE APOIO INSTRUMENTAL" as const,
    functionDescription: "Aconselhamento estratégico e doutrinário",
    defaultAdminResp: "Gestão de agendas de estudo, acompanhamento de projetos especiais e consultoria técnica à direção.",
    defaultOperResp: "Estudos de doutrina penitenciária, resolução de crises complexas e apoio em inspeções extraordinárias.",
    legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
    sections: []
  }
];

const ALL_PROVINCES_LIST = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Quando", "Cubango", 
  "Cuanza-Norte", "Cuanza-Sul", "Cunene", "Huambo", "Huíla", "Icolo e Bengo", 
  "Luanda", "Lunda-Norte", "Lunda-Sul", "Malanje", "Moxico", 
  "Moxico Leste", "Namibe", "Uíge", "Zaire"
];

const normalizeProvince = (name?: string): string => {
  if (!name) return "";
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-_]/g, "");
};

// ==========================================
// NREP-AO STATUTORY VALIDATION ENGINE
// Decreto Presidencial n.º 184/17 de 11 de Agosto
// ==========================================

export type NrepRuleCode = 
  | "ORPHAN_NODE" 
  | "INVALID_LEVEL_SEQUENCE" 
  | "TERRITORIAL_MISMATCH" 
  | "CIRCULAR_DEPENDENCY" 
  | "SELF_SUBORDINATION"
  | "INVALID_ROOT_LINK";

export interface NrepValidationIssue {
  id: string;
  unitId: string;
  unitName: string;
  unitLevel: AdministrativeTreeLevel;
  parentUnitId?: string;
  parentUnitName?: string;
  parentUnitLevel?: AdministrativeTreeLevel;
  ruleCode: NrepRuleCode;
  severity: "CRITICAL" | "WARNING";
  title: string;
  description: string;
  legalReference: string;
  suggestedFix?: string;
}

export interface NrepTreeValidationReport {
  isValid: boolean;
  criticalCount: number;
  warningCount: number;
  issues: NrepValidationIssue[];
  orphanedNodes: OrganizationalUnit[];
  sequenceViolations: { unit: OrganizationalUnit; parent?: OrganizationalUnit; reason: string }[];
  territorialAnomalies: { unit: OrganizationalUnit; parent: OrganizationalUnit; reason: string }[];
  circularLoops: { unit: OrganizationalUnit; loopPath: string[] }[];
  ruleMetrics: {
    sequenceRulePassed: boolean;
    orphanRulePassed: boolean;
    territoryRulePassed: boolean;
    acyclicRulePassed: boolean;
  };
}

/**
 * Validates whether a single proposed unit (creation, edit, reassign, subordination) 
 * satisfies NREP-AO statutory rules before persisting.
 */
export const validateSingleUnitNrepRules = (params: {
  unitId?: string | null;
  name: string;
  treeLevel: AdministrativeTreeLevel;
  parentId?: string | null;
  province?: string;
  allUnits: OrganizationalUnit[];
  levelDefs?: Record<AdministrativeTreeLevel, LevelDefinitionMeta>;
}): { isValid: boolean; errorReason?: string; issues: NrepValidationIssue[] } => {
  const { unitId, name, treeLevel, parentId, province, allUnits, levelDefs = ADMINISTRATIVE_LEVEL_DEFINITIONS } = params;
  const issues: NrepValidationIssue[] = [];

  const def = levelDefs[treeLevel] || ADMINISTRATIVE_LEVEL_DEFINITIONS[treeLevel];
  const unitDisplayName = name.trim() || `Unidade Nível ${def.num}`;

  // 1. Root L1 Rule
  if (treeLevel === "L1_DG") {
    if (parentId && parentId !== "OU-MININT-DG" && parentId !== "CENTRO-OPERACIONAL-NACIONAL") {
      const parentUnit = allUnits.find(u => u.id === parentId);
      if (parentUnit) {
        const parentLvl = getUnitTreeLevel(parentUnit);
        if (parentLvl !== "L1_DG") {
          const reason = `INVERSÃO DE COMANDO NREP-AO: A Direcção Geral (Nível 1) não pode ser subordinada a um escalão inferior (${levelDefs[parentLvl]?.label || parentLvl}). Conforme o Decreto Presidencial n.º 184/17, a Direcção Geral constitui o topo da hierarquia prisional.`;
          issues.push({
            id: `ISSUE-${Date.now()}-1`,
            unitId: unitId || "NEW",
            unitName: unitDisplayName,
            unitLevel: treeLevel,
            parentUnitId: parentId,
            parentUnitName: parentUnit.name,
            parentUnitLevel: parentLvl,
            ruleCode: "INVALID_LEVEL_SEQUENCE",
            severity: "CRITICAL",
            title: "Inversão de Hierarquia (L1 subordinado a escalão inferior)",
            description: reason,
            legalReference: "Decreto Presidencial n.º 184/17, Artigo 2.º",
            suggestedFix: "Vincular à Raiz Central (OU-MININT-DG) ou definir como nó raiz de Direcção Geral."
          });
          return { isValid: false, errorReason: reason, issues };
        }
      }
    }
    return { isValid: true, issues: [] };
  }

  // 2. Orphan Check: L2, L3, L4 MUST have a valid parent
  if (!parentId || parentId.trim() === "") {
    const reason = `NÓ ÓRFÃO PROIBIDO PELO NREP-AO: Unidades de Nível ${def.num} (${def.shortLabel}) não podem existir sem um superior hierárquico. É obrigatório vincular a uma dependência superior activa.`;
    issues.push({
      id: `ISSUE-${Date.now()}-2`,
      unitId: unitId || "NEW",
      unitName: unitDisplayName,
      unitLevel: treeLevel,
      ruleCode: "ORPHAN_NODE",
      severity: "CRITICAL",
      title: "Criação de Nó Órfão Desvinculado",
      description: reason,
      legalReference: "NREP-AO / Decreto Presidencial n.º 184/17, Estrutura Orgânica",
      suggestedFix: `Selecione um superior hierárquico compatível (${def.allowedParentLevels.map(l => levelDefs[l]?.shortLabel || l).join(" ou ")}).`
    });
    return { isValid: false, errorReason: reason, issues };
  }

  // 3. Self-subordination
  if (unitId && parentId === unitId) {
    const reason = "AUTO-SUBORDINAÇÃO: Uma unidade não pode ser subordinada a si própria.";
    issues.push({
      id: `ISSUE-${Date.now()}-3`,
      unitId: unitId,
      unitName: unitDisplayName,
      unitLevel: treeLevel,
      parentUnitId: parentId,
      ruleCode: "SELF_SUBORDINATION",
      severity: "CRITICAL",
      title: "Auto-Subordinação Inválida",
      description: reason,
      legalReference: "Princípios da Hierarquia e Comando da Função Pública",
      suggestedFix: "Selecione outro superior hierárquico independente."
    });
    return { isValid: false, errorReason: reason, issues };
  }

  // 4. Parent Existence Check
  const parentUnit = allUnits.find(u => u.id === parentId);
  const isSpecialRoot = parentId === "OU-MININT-DG" || parentId === "CENTRO-OPERACIONAL-NACIONAL";
  if (!parentUnit && !isSpecialRoot) {
    const reason = `SUPERIOR INEXISTENTE: O superior hierárquico selecionado (ID: ${parentId}) não existe no organograma.`;
    issues.push({
      id: `ISSUE-${Date.now()}-4`,
      unitId: unitId || "NEW",
      unitName: unitDisplayName,
      unitLevel: treeLevel,
      parentUnitId: parentId,
      ruleCode: "ORPHAN_NODE",
      severity: "CRITICAL",
      title: "Superior Hierárquico Inexistente",
      description: reason,
      legalReference: "NREP-AO Integridade de Árvore",
      suggestedFix: "Selecione uma Direcção Provincial ou Direcção Geral existente."
    });
    return { isValid: false, errorReason: reason, issues };
  }

  const parentLvl: AdministrativeTreeLevel = isSpecialRoot 
    ? "L1_DG" 
    : (parentUnit ? getUnitTreeLevel(parentUnit) : "L1_DG");

  // 5. Allowed Sequence Validation (L2, L3, L4)
  if (!def.allowedParentLevels.includes(parentLvl)) {
    let reason = "";
    if (treeLevel === "L2_PROV") {
      reason = `SEQUÊNCIA ORGÂNICA INVÁLIDA: A Direcção Provincial (Nível 2) só pode reportar à Direcção Geral (Nível 1). Não é permitido vincular uma Direcção Provincial a um Estabelecimento Penitenciário (Nível 3) ou Secção (Nível 4).`;
    } else if (treeLevel === "L3_EP") {
      reason = `SEQUÊNCIA ORGÂNICA INVÁLIDA: Um Estabelecimento Penitenciário (Nível 3) deve reportar a uma Direcção Provincial (Nível 2) ou à Direcção Geral (Nível 1). Não pode reportar a uma Secção/Órgão (Nível 4) nem a outro Estabelecimento Penitenciário.`;
    } else if (treeLevel === "L4_ORGAO") {
      reason = `SEQUÊNCIA ORGÂNICA INVÁLIDA: Um Órgão/Secção (Nível 4) deve estar inserido num Estabelecimento Penitenciário (Nível 3), Direcção Provincial (Nível 2) ou Direcção Geral (Nível 1).`;
    } else {
      reason = `SEQUÊNCIA ORGÂNICA INVÁLIDA: O nível ${def.num} (${def.shortLabel}) não pode reportar a uma unidade de nível ${levelDefs[parentLvl]?.num || parentLvl} (${levelDefs[parentLvl]?.shortLabel || parentLvl}).`;
    }

    issues.push({
      id: `ISSUE-${Date.now()}-5`,
      unitId: unitId || "NEW",
      unitName: unitDisplayName,
      unitLevel: treeLevel,
      parentUnitId: parentId,
      parentUnitName: parentUnit?.name || "Raiz Nacional",
      parentUnitLevel: parentLvl,
      ruleCode: "INVALID_LEVEL_SEQUENCE",
      severity: "CRITICAL",
      title: "Sequência Hierárquica Incompatível",
      description: reason,
      legalReference: "Decreto Presidencial n.º 184/17 de 11 de Agosto",
      suggestedFix: `Altere o superior para uma unidade de nível: ${def.allowedParentLevels.map(l => levelDefs[l]?.shortLabel || l).join(" ou ")}.`
    });
    return { isValid: false, errorReason: reason, issues };
  }

  // 6. Territorial / Provincial Jurisdiction Check
  if (parentUnit && parentLvl !== "L1_DG" && parentUnit.level !== TerritorialScope.NATIONAL) {
    const unitProv = normalizeProvince(province);
    const parentProv = normalizeProvince(parentUnit.province);

    if (unitProv && parentProv && unitProv !== parentProv) {
      const reason = `VIOLAÇÃO DE CIRCUNSCRIÇÃO TERRITORIAL: A unidade da província de '${province}' não pode ser subordinada à unidade '${parentUnit.name}' de '${parentUnit.province}'. Conforme o NREP-AO, unidades executivas devem estar vinculadas à Direcção Provincial da mesma jurisdição ou à Direcção Geral Nacional.`;
      issues.push({
        id: `ISSUE-${Date.now()}-6`,
        unitId: unitId || "NEW",
        unitName: unitDisplayName,
        unitLevel: treeLevel,
        parentUnitId: parentId,
        parentUnitName: parentUnit.name,
        parentUnitLevel: parentLvl,
        ruleCode: "TERRITORIAL_MISMATCH",
        severity: "CRITICAL",
        title: "Incompatibilidade Territorial Provincial",
        description: reason,
        legalReference: "Decreto Presidencial n.º 184/17, Artigo 4.º (Âmbito Provincial)",
        suggestedFix: `Vincule à Direcção Provincial de ${province} ou à Direcção Geral Nacional.`
      });
      return { isValid: false, errorReason: reason, issues };
    }
  }

  // 7. Cycle Detection (Ancestry traversal)
  if (unitId && parentUnit) {
    const visited = new Set<string>([unitId]);
    let curr: OrganizationalUnit | undefined = parentUnit;
    while (curr && curr.parentId) {
      if (visited.has(curr.id) || curr.id === unitId) {
        const reason = `DEPENDÊNCIA CIRCULAR DETECTADA: Vincular '${unitDisplayName}' a '${parentUnit.name}' cria um ciclo hierárquico infinito de subordinação.`;
        issues.push({
          id: `ISSUE-${Date.now()}-7`,
          unitId: unitId,
          unitName: unitDisplayName,
          unitLevel: treeLevel,
          parentUnitId: parentId,
          parentUnitName: parentUnit.name,
          ruleCode: "CIRCULAR_DEPENDENCY",
          severity: "CRITICAL",
          title: "Loop Hierárquico Circular",
          description: reason,
          legalReference: "Princípios Estruturais de Encadeamento Orgânico",
          suggestedFix: "Selecione um superior hierárquico ascendente não pertencente à sub-árvore desta unidade."
        });
        return { isValid: false, errorReason: reason, issues };
      }
      visited.add(curr.id);
      curr = allUnits.find(u => u.id === curr?.parentId);
    }
  }

  return { isValid: true, issues: [] };
};

/**
 * Full Tree Auditor validating entire org chart against NREP-AO & Decreto Presidencial 184/17
 */
export const validateNrepOrganicTree = (
  units: OrganizationalUnit[],
  levelDefs: Record<AdministrativeTreeLevel, LevelDefinitionMeta> = ADMINISTRATIVE_LEVEL_DEFINITIONS
): NrepTreeValidationReport => {
  const issues: NrepValidationIssue[] = [];
  const orphanedNodes: OrganizationalUnit[] = [];
  const sequenceViolations: { unit: OrganizationalUnit; parent?: OrganizationalUnit; reason: string }[] = [];
  const territorialAnomalies: { unit: OrganizationalUnit; parent: OrganizationalUnit; reason: string }[] = [];
  const circularLoops: { unit: OrganizationalUnit; loopPath: string[] }[] = [];

  let sequenceRulePassed = true;
  let orphanRulePassed = true;
  let territoryRulePassed = true;
  let acyclicRulePassed = true;

  units.forEach(u => {
    const uLvl = getUnitTreeLevel(u);
    const uDef = levelDefs[uLvl] || ADMINISTRATIVE_LEVEL_DEFINITIONS[uLvl];

    // Root node
    if (u.id === "OU-MININT-DG") return;

    // Check Orphan
    if (!u.parentId || u.parentId.trim() === "") {
      if (uLvl !== "L1_DG") {
        orphanRulePassed = false;
        orphanedNodes.push(u);
        issues.push({
          id: `ORPHAN-${u.id}`,
          unitId: u.id,
          unitName: u.name,
          unitLevel: uLvl,
          ruleCode: "ORPHAN_NODE",
          severity: "CRITICAL",
          title: "Nó Órfão Desvinculado",
          description: `A unidade '${u.name}' (Nível ${uDef?.num || '?'}) não possui superior hierárquico. Conforme o NREP-AO, toda unidade deve estar ancorada no organograma.`,
          legalReference: "Decreto Presidencial n.º 184/17, Organograma Oficial",
          suggestedFix: `Vincular à Direcção Provincial de ${u.province || "Huambo"} ou à Direcção Geral.`
        });
      }
      return;
    }

    const parent = units.find(p => p.id === u.parentId);
    const isSpecialRoot = u.parentId === "OU-MININT-DG" || u.parentId === "CENTRO-OPERACIONAL-NACIONAL";

    if (!parent && !isSpecialRoot) {
      orphanRulePassed = false;
      orphanedNodes.push(u);
      issues.push({
        id: `ORPHAN-BROKEN-${u.id}`,
        unitId: u.id,
        unitName: u.name,
        unitLevel: uLvl,
        parentUnitId: u.parentId,
        ruleCode: "ORPHAN_NODE",
        severity: "CRITICAL",
        title: "Ponteiro Superior Inexistente",
        description: `A unidade '${u.name}' aponta para o ID de superior '${u.parentId}', que não existe no sistema.`,
        legalReference: "NREP-AO Integridade Referencial",
        suggestedFix: `Reatribuir a um superior hierárquico válido.`
      });
      return;
    }

    const parentLvl: AdministrativeTreeLevel = isSpecialRoot 
      ? "L1_DG" 
      : (parent ? getUnitTreeLevel(parent) : "L1_DG");

    // Sequence Check
    if (uDef && !uDef.allowedParentLevels.includes(parentLvl)) {
      sequenceRulePassed = false;
      const parentLabel = levelDefs[parentLvl]?.shortLabel || parentLvl;
      const parentNum = levelDefs[parentLvl]?.num || '?';
      const reason = `Incompatibilidade de Escalão: Nível ${uDef.num} (${uDef.shortLabel}) subordinado a Nível ${parentNum} (${parentLabel}). Permitidos: ${uDef.allowedParentLevels.map(l => levelDefs[l]?.shortLabel || l).join(", ")}.`;
      sequenceViolations.push({ unit: u, parent, reason });
      issues.push({
        id: `SEQ-${u.id}`,
        unitId: u.id,
        unitName: u.name,
        unitLevel: uLvl,
        parentUnitId: u.parentId,
        parentUnitName: parent?.name || "Raiz Nacional",
        parentUnitLevel: parentLvl,
        ruleCode: "INVALID_LEVEL_SEQUENCE",
        severity: "CRITICAL",
        title: "Quebra de Sequência Hierárquica NREP-AO",
        description: reason,
        legalReference: "Decreto Presidencial n.º 184/17 de 11 de Agosto",
        suggestedFix: `Reclassificar a unidade ou reatribuir para um superior de nível ${uDef.allowedParentLevels.map(l => levelDefs[l]?.shortLabel || l).join(" ou ")}.`
      });
    }

    // Territorial Check
    if (parent && parentLvl !== "L1_DG" && parent.level !== TerritorialScope.NATIONAL) {
      const uProv = normalizeProvince(u.province);
      const pProv = normalizeProvince(parent.province);
      if (uProv && pProv && uProv !== pProv) {
        territoryRulePassed = false;
        const reason = `Unidade da província '${u.province}' vinculada a superior de '${parent.province}'.`;
        territorialAnomalies.push({ unit: u, parent, reason });
        issues.push({
          id: `TERR-${u.id}`,
          unitId: u.id,
          unitName: u.name,
          unitLevel: uLvl,
          parentUnitId: parent.id,
          parentUnitName: parent.name,
          parentUnitLevel: parentLvl,
          ruleCode: "TERRITORIAL_MISMATCH",
          severity: "CRITICAL",
          title: "Incongruência Territorial Provincial",
          description: reason,
          legalReference: "Decreto Presidencial n.º 184/17, Artigo 4.º",
          suggestedFix: `Vincular à Direcção Provincial de ${u.province}.`
        });
      }
    }

    // Cycle Check
    if (parent) {
      const visited = new Set<string>([u.id]);
      const path: string[] = [u.name];
      let curr: OrganizationalUnit | undefined = parent;
      while (curr && curr.parentId) {
        path.push(curr.name);
        if (visited.has(curr.id) || curr.id === u.id) {
          acyclicRulePassed = false;
          circularLoops.push({ unit: u, loopPath: path });
          issues.push({
            id: `CYCLE-${u.id}`,
            unitId: u.id,
            unitName: u.name,
            unitLevel: uLvl,
            parentUnitId: parent.id,
            parentUnitName: parent.name,
            ruleCode: "CIRCULAR_DEPENDENCY",
            severity: "CRITICAL",
            title: "Subordinação Circular Detectada",
            description: `Ciclo: ${path.join(" ➔ ")}`,
            legalReference: "Princípios Estruturais de Encadeamento Orgânico",
            suggestedFix: "Reatribuir a um superior fora do ciclo."
          });
          break;
        }
        visited.add(curr.id);
        curr = units.find(p => p.id === curr?.parentId);
      }
    }
  });

  const criticalCount = issues.filter(i => i.severity === "CRITICAL").length;
  const warningCount = issues.filter(i => i.severity === "WARNING").length;

  return {
    isValid: criticalCount === 0,
    criticalCount,
    warningCount,
    issues,
    orphanedNodes,
    sequenceViolations,
    territorialAnomalies,
    circularLoops,
    ruleMetrics: {
      sequenceRulePassed,
      orphanRulePassed,
      territoryRulePassed,
      acyclicRulePassed
    }
  };
};

export function OrganizationalHierarchyConfig({
  organizationalUnits,
  setOrganizationalUnits,
  prisons = [],
  setPrisons,
  triggerToast = () => {},
  currentOperator
}: OrganizationalHierarchyConfigProps) {
  const isNational = currentOperator?.territorialScope === TerritorialScope.NATIONAL || currentOperator?.level === "NATIONAL" || currentOperator?.role === "DIRECTOR_GERAL";
  const operatorProvince = currentOperator?.province || "Huambo";

  // Filters & Active Directorate State
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>(isNational ? "Huambo" : operatorProvince);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategoryTab, setActiveCategoryTab] = useState<"ALL" | "CAT_1" | "CAT_2" | "CAT_3" | "CAT_4" | "TREE" | "SUBORDINATION" | "LEVELS_CONFIG">("ALL");

  // Dynamic Hierarchy Levels Configuration State (L1 DG, L2 Província, L3 EP, L4 Órgão)
  const [levelDefinitions, setLevelDefinitions] = useState<Record<AdministrativeTreeLevel, LevelDefinitionMeta>>(ADMINISTRATIVE_LEVEL_DEFINITIONS);
  const [isLevelDefinitionsModalOpen, setIsLevelDefinitionsModalOpen] = useState<boolean>(false);
  const [editingLevelDefKey, setEditingLevelDefKey] = useState<AdministrativeTreeLevel>("L1_DG");
  const [defFormLabel, setDefFormLabel] = useState<string>("");
  const [defFormShortLabel, setDefFormShortLabel] = useState<string>("");
  const [defFormScope, setDefFormScope] = useState<string>("");
  const [defFormDescription, setDefFormDescription] = useState<string>("");
  const [defFormApplyToUnits, setDefFormApplyToUnits] = useState<boolean>(true);

  const [selectedTreeLevelFilter, setSelectedTreeLevelFilter] = useState<"ALL" | AdministrativeTreeLevel>("ALL");
  const [levelSearchQuery, setLevelSearchQuery] = useState<string>("");
  const [levelProvinceFilter, setLevelProvinceFilter] = useState<string>("ALL");
  const [levelParentFilter, setLevelParentFilter] = useState<string>("ALL");

  // Dynamic Level Unit Modal State (Create / Edit at specific level)
  const [isCreateLevelModalOpen, setIsCreateLevelModalOpen] = useState<boolean>(false);
  const [selectedLevelToCreate, setSelectedLevelToCreate] = useState<AdministrativeTreeLevel>("L4_ORGAO");
  const [editingLevelUnitId, setEditingLevelUnitId] = useState<string | null>(null);
  const [levelFormName, setLevelFormName] = useState<string>("");
  const [levelFormCode, setLevelFormCode] = useState<string>("");
  const [levelFormDivisionType, setLevelFormDivisionType] = useState<string>("DEPARTAMENTO");
  const [levelFormParentId, setLevelFormParentId] = useState<string>("OU-MININT-DG");
  const [levelFormProvince, setLevelFormProvince] = useState<string>("Huambo");
  const [levelFormLegalBasis, setLevelFormLegalBasis] = useState<string>("Decreto Presidencial n.º 184/17, de 11 de Agosto");
  const [levelFormCategory, setLevelFormCategory] = useState<string>("II - DEPENDÊNCIAS OPERACIONAIS (Executivas)");
  const [levelFormHeadName, setLevelFormHeadName] = useState<string>("");
  const [levelFormHeadRank, setLevelFormHeadRank] = useState<string>("Superintendente Prisional");
  const [levelFormHeadPhone, setLevelFormHeadPhone] = useState<string>("");
  const [levelFormFuncDesc, setLevelFormFuncDesc] = useState<string>("");
  const [levelFormAdminResp, setLevelFormAdminResp] = useState<string>("");
  const [levelFormOperResp, setLevelFormOperResp] = useState<string>("");

  // Hierarchy Chain & Breadcrumb Inspector Modal State
  const [isLevelChainModalOpen, setIsLevelChainModalOpen] = useState<boolean>(false);
  const [selectedUnitForChain, setSelectedUnitForChain] = useState<OrganizationalUnit | null>(null);

  // Level Reassignment & Promotion/Demotion Modal State
  const [isLevelReassignModalOpen, setIsLevelReassignModalOpen] = useState<boolean>(false);
  const [selectedUnitForReassign, setSelectedUnitForReassign] = useState<OrganizationalUnit | null>(null);
  const [newLevelForReassign, setNewLevelForReassign] = useState<AdministrativeTreeLevel>("L4_ORGAO");
  const [newParentForReassign, setNewParentForReassign] = useState<string>("OU-MININT-DG");

  // 4-Tier Blueprint Branch Generator Modal State
  const [isBranchBlueprintModalOpen, setIsBranchBlueprintModalOpen] = useState<boolean>(false);
  const [blueprintTargetProvince, setBlueprintTargetProvince] = useState<string>("Huambo");
  const [blueprintEpName, setBlueprintEpName] = useState<string>("Estabelecimento Penitenciário Central");

  // Explicit Subordination Management States
  const [isSubordinationModalOpen, setIsSubordinationModalOpen] = useState<boolean>(false);
  const [targetSubUnit, setTargetSubUnit] = useState<OrganizationalUnit | null>(null);
  const [newParentUnitId, setNewParentUnitId] = useState<string>("");
  const [subSearchQuery, setSubSearchQuery] = useState<string>("");
  const [subProvinceFilter, setSubProvinceFilter] = useState<string>("ALL");
  const [subTypeFilter, setSubTypeFilter] = useState<string>("ALL");

  // NREP-AO Audit & Integrity Diagnosis Modal State
  const [isNrepAuditModalOpen, setIsNrepAuditModalOpen] = useState<boolean>(false);
  const [selectedAuditFilter, setSelectedAuditFilter] = useState<"ALL" | NrepRuleCode>("ALL");

  // Helper validation for subordination incorporating strict NREP-AO rules
  const validateSubordination = (
    unit: OrganizationalUnit | null,
    parentId: string
  ): { valid: boolean; errorReason?: string; isNationalParent?: boolean } => {
    if (!unit) return { valid: false, errorReason: "Nenhuma unidade selecionada." };
    if (!parentId) return { valid: false, errorReason: "Selecione o superior hierárquico pretendido." };
    
    const unitLvl = getUnitTreeLevel(unit);
    const validation = validateSingleUnitNrepRules({
      unitId: unit.id,
      name: unit.name,
      treeLevel: unitLvl,
      parentId,
      province: unit.province,
      allUnits: organizationalUnits,
      levelDefs: levelDefinitions
    });

    const isNat = parentId === "OU-MININT-DG" || parentId === "CENTRO-OPERACIONAL-NACIONAL";
    return {
      valid: validation.isValid,
      errorReason: validation.errorReason,
      isNationalParent: isNat
    };
  };

  const handleSaveSubordination = () => {
    if (!targetSubUnit || !newParentUnitId) return;

    const validation = validateSubordination(targetSubUnit, newParentUnitId);
    if (!validation.valid) {
      triggerToast("VIOLAÇÃO ORGÂNICA NREP-AO", validation.errorReason || "Subordinação inválida segundo o Decreto Presidencial n.º 184/17.", "error");
      return;
    }

    const parentObj = organizationalUnits.find(u => u.id === newParentUnitId) || {
      id: "OU-MININT-DG",
      name: "Direção Geral do Serviço Penitenciário"
    };

    setOrganizationalUnits(prev =>
      prev.map(u => {
        if (u.id === targetSubUnit.id) {
          return {
            ...u,
            parentId: newParentUnitId
          };
        }
        return u;
      })
    );

    triggerToast(
      "SUBORDINAÇÃO HOMOLOGADA",
      `A subordinação de '${targetSubUnit.name}' foi vinculada com sucesso a '${parentObj.name}' em total conformidade com o NREP-AO.`,
      "success"
    );

    setIsSubordinationModalOpen(false);
    setTargetSubUnit(null);
    setNewParentUnitId("");
  };

  // Left Sidebar Collapsibility State (1% recolhível / mini-sidebar)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("nrep_org_hierarchy_sidebar_collapsed");
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const [expandedSidebarProvinces, setExpandedSidebarProvinces] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("nrep_org_hierarchy_expanded_sidebar_provinces");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleSidebarProvinceItem = (prov: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSidebarProvinces(prev => ({ ...prev, [prov]: !prev[prov] }));
  };

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("nrep_org_hierarchy_expanded_nodes");
      return saved ? JSON.parse(saved) : {
        "OU-MININT-DG": true,
        "OU-DP-LUANDA": true,
        "OU-DP-HUAMBO": true
      };
    } catch {
      return {
        "OU-MININT-DG": true,
        "OU-DP-LUANDA": true,
        "OU-DP-HUAMBO": true
      };
    }
  });

  // Collapsible category blocks state with localStorage persistence
  const [expandedCategoryBlocks, setExpandedCategoryBlocks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("nrep_org_hierarchy_expanded_category_blocks");
      return saved ? JSON.parse(saved) : {
        CAT_1: true,
        CAT_2: true,
        CAT_3: true,
        CAT_4: true
      };
    } catch {
      return {
        CAT_1: true,
        CAT_2: true,
        CAT_3: true,
        CAT_4: true
      };
    }
  });

  // Collapsible unit cards state (internal sections expansion) with localStorage persistence
  const [expandedUnitCards, setExpandedUnitCards] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("nrep_org_hierarchy_expanded_unit_cards");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Persist all expansion states in localStorage for consistent reloads
  useEffect(() => {
    try {
      localStorage.setItem("nrep_org_hierarchy_sidebar_collapsed", JSON.stringify(isSidebarCollapsed));
    } catch (e) {
      console.error("LS Error:", e);
    }
  }, [isSidebarCollapsed]);

  useEffect(() => {
    try {
      localStorage.setItem("nrep_org_hierarchy_expanded_sidebar_provinces", JSON.stringify(expandedSidebarProvinces));
    } catch (e) {
      console.error("LS Error:", e);
    }
  }, [expandedSidebarProvinces]);

  useEffect(() => {
    try {
      localStorage.setItem("nrep_org_hierarchy_expanded_nodes", JSON.stringify(expandedNodes));
    } catch (e) {
      console.error("LS Error:", e);
    }
  }, [expandedNodes]);

  useEffect(() => {
    try {
      localStorage.setItem("nrep_org_hierarchy_expanded_category_blocks", JSON.stringify(expandedCategoryBlocks));
    } catch (e) {
      console.error("LS Error:", e);
    }
  }, [expandedCategoryBlocks]);

  useEffect(() => {
    try {
      localStorage.setItem("nrep_org_hierarchy_expanded_unit_cards", JSON.stringify(expandedUnitCards));
    } catch (e) {
      console.error("LS Error:", e);
    }
  }, [expandedUnitCards]);

  useEffect(() => {
    if (!isNational && operatorProvince) {
      setSelectedProvinceFilter(operatorProvince);
    }
  }, [isNational, operatorProvince]);

  // Modal State for Adding/Editing Sub-Unit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [parentUnitId, setParentUnitId] = useState<string>("OU-DP-HUAMBO");
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formType, setFormType] = useState<"DEPARTAMENTO" | "SECCAO" | "REPARTICAO" | "GABINETE" | "ESTAB_PENITENCIARIO" | "CONSELHO">("DEPARTAMENTO");
  const [formLegalBasis, setFormLegalBasis] = useState("Decreto Presidencial n.º 184/17, Artigo 18.º");
  const [formHeadOfficer, setFormHeadOfficer] = useState("");

  // Modal State for Responsibilities Inspection (Functional Responsibilities Inspector)
  const [isRespInspectorOpen, setIsRespInspectorOpen] = useState(false);
  const [selectedUnitForResp, setSelectedUnitForResp] = useState<OrganizationalUnit | null>(null);
  const [respAdminInput, setRespAdminInput] = useState("");
  const [respOperInput, setRespOperInput] = useState("");
  const [respHeadNameInput, setRespHeadNameInput] = useState("");
  const [respHeadRankInput, setRespHeadRankInput] = useState("");
  const [respHeadPhoneInput, setRespHeadPhoneInput] = useState("");

  // Modal State for Associating Prison
  const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false);
  const [selectedPrisonIdToAssociate, setSelectedPrisonIdToAssociate] = useState<string>("");
  const [targetParentUnitId, setTargetParentUnitId] = useState<string>("OU-DP-HUAMBO");

  // Async Statutory Dependencies Cache & Sync State
  const [isLoadingDeps, setIsLoadingDeps] = useState<boolean>(false);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const toggleCategoryBlock = (catKey: string) => {
    setExpandedCategoryBlocks(prev => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  const toggleAllCategoryBlocks = (expand: boolean) => {
    setExpandedCategoryBlocks({
      CAT_1: expand,
      CAT_2: expand,
      CAT_3: expand,
      CAT_4: expand
    });
  };

  // Toggle node expansion with persistence
  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllTreeNodes = (expand: boolean) => {
    const newStates: Record<string, boolean> = {};
    organizationalUnits.forEach(u => {
      newStates[u.id] = expand;
    });
    setExpandedNodes(newStates);
  };

  const handleGenerateDefaultPrisonSections = (prisonUnit: OrganizationalUnit) => {
    const defaultSections = [
      {
        name: `Secção de Controlo Penal e Registo da ${prisonUnit.name}`,
        code: `SCP-${prisonUnit.code || 'PRIS'}`,
        divisionType: "SECCAO" as const,
        adminResp: "Gestão do prontuário dos reclusos, prazos de prisão preventiva, cálculo de penas e boletins de libertação.",
        operResp: "Recepção e triagem biométrica dos reclusos, registo de visitas e emissão de cartões de identificação."
      },
      {
        name: `Secção de Segurança e Guarda Prisional da ${prisonUnit.name}`,
        code: `SSP-${prisonUnit.code || 'PRIS'}`,
        divisionType: "SECCAO" as const,
        adminResp: "Organização das escalas de serviço dos guardas, mapa de postos de vigilância e armamento.",
        operResp: "Rondas perimetrais, contagem física de reclusos, revistas às celas e vigilância das muralhas."
      },
      {
        name: `Secção de Saúde e Assistência Médica da ${prisonUnit.name}`,
        code: `SSAM-${prisonUnit.code || 'PRIS'}`,
        divisionType: "SECCAO" as const,
        adminResp: "Requisição de medicamentos, gestão de fichas clínicas e agendamento de consultas externas.",
        operResp: "Triagem sanitária, prestação de primeiros socorros e gestão da enfermaria da cadeia."
      },
      {
        name: `Secção de Logística e Alimentação da ${prisonUnit.name}`,
        code: `SLA-${prisonUnit.code || 'PRIS'}`,
        divisionType: "SECCAO" as const,
        adminResp: "Controlo de stock de géneros alimentícios, fardamento e materiais de limpeza.",
        operResp: "Supervisão da confecção das refeições na cozinha central e distribuição pelos blocos carcerários."
      }
    ];

    const newUnits: OrganizationalUnit[] = defaultSections.map((sec, idx) => ({
      id: `OU-SEC-PRIS-${prisonUnit.id}-${idx + 1}-${Date.now()}`,
      name: sec.name,
      level: TerritorialScope.ESTABLISHMENT,
      parentId: prisonUnit.id,
      province: prisonUnit.province,
      divisionType: sec.divisionType,
      code: sec.code,
      legalBasis: "Decreto Presidencial n.º 184/17, Estrutura Carcerária",
      administrativeResponsibilities: sec.adminResp,
      operationalResponsibilities: sec.operResp
    }));

    setOrganizationalUnits(prev => [...prev, ...newUnits]);
    setExpandedUnitCards(prev => ({ ...prev, [prisonUnit.id]: true }));
    triggerToast("SECÇÕES DA CADEIA GERADAS", `Estrutura de Secções Operativas e Administrativas criada para ${prisonUnit.name}.`, "success");
  };

  // Group units by parent
  const provincialDirectorates = useMemo(() => {
    const list = organizationalUnits.filter(u => u.level === TerritorialScope.PROVINCIAL && (u.divisionType === "DIRECAO_PROVINCIAL" || u.name.startsWith("SP/")));
    if (!isNational) {
      const opNorm = normalizeProvince(operatorProvince);
      return list.filter(u => normalizeProvince(u.province) === opNorm);
    }
    return list;
  }, [organizationalUnits, isNational, operatorProvince]);

  // Selected Directorate
  const activeDirectorate = useMemo(() => {
    const selNorm = normalizeProvince(selectedProvinceFilter);
    return provincialDirectorates.find(d => normalizeProvince(d.province) === selNorm) 
      || provincialDirectorates.find(d => normalizeProvince(d.province) === "huambo")
      || provincialDirectorates[0];
  }, [provincialDirectorates, selectedProvinceFilter]);

  // Children of a specific unit
  const getChildren = (parentId: string) => {
    return organizationalUnits.filter(u => u.parentId === parentId);
  };

  // Async loader for statutory sub-units with localStorage caching
  const loadStatutoryDependenciesAsync = async (dir: OrganizationalUnit, forceRefresh = false) => {
    if (!dir) return;
    setIsLoadingDeps(true);

    const cacheKey = `nrep_statutory_deps_v1_${dir.province?.toLowerCase().replace(/\s+/g, '_') || dir.id}`;

    try {
      if (!forceRefresh) {
        const cachedRaw = localStorage.getItem(cacheKey);
        if (cachedRaw) {
          const parsedCache = JSON.parse(cachedRaw);
          if (Array.isArray(parsedCache.units) && parsedCache.units.length > 0) {
            setOrganizationalUnits(prev => {
              const existingIds = new Set(prev.map(u => u.id));
              const toAdd = parsedCache.units.filter((u: OrganizationalUnit) => !existingIds.has(u.id));
              if (toAdd.length === 0) return prev;
              return [...prev, ...toAdd];
            });
            setIsFromCache(true);
            setLastSyncTime(parsedCache.timestamp || new Date().toLocaleTimeString('pt-AO'));
            setIsLoadingDeps(false);
            return;
          }
        }
      }

      // Simulate async fetching resolution delay
      await new Promise(resolve => setTimeout(resolve, 250));

      const existingChildren = organizationalUnits.filter(u => u.parentId === dir.id);
      const newUnitsToInject: OrganizationalUnit[] = [];

      STANDARD_STATUTORY_SUBUNITS.forEach((std, idx) => {
        const exists = existingChildren.some(c => 
          c.code?.includes(std.codePrefix) || 
          c.name.toLowerCase().includes(std.nameSuffix.toLowerCase().slice(0, 15))
        );
        if (!exists) {
          const deptId = `OU-DEP-${dir.province?.replace(/\s+/g, '-').toUpperCase()}-${std.codePrefix}`;
          newUnitsToInject.push({
            id: deptId,
            name: `${idx + 1}. ${std.nameSuffix}`,
            level: TerritorialScope.PROVINCIAL,
            parentId: dir.id,
            province: dir.province,
            divisionType: std.type,
            code: `${std.codePrefix}-${dir.province?.substring(0, 3).toUpperCase()}`,
            legalBasis: std.legalBasis,
            category: std.category,
            functionDescription: std.functionDescription,
            administrativeResponsibilities: std.defaultAdminResp,
            operationalResponsibilities: std.defaultOperResp
          });
        }
      });

      const currentChildren = [...existingChildren, ...newUnitsToInject];
      const nowStr = new Date().toLocaleTimeString('pt-AO');

      localStorage.setItem(cacheKey, JSON.stringify({
        province: dir.province,
        units: currentChildren,
        timestamp: nowStr
      }));

      if (newUnitsToInject.length > 0) {
        setOrganizationalUnits(prev => [...prev, ...newUnitsToInject]);
      }

      setIsFromCache(false);
      setLastSyncTime(nowStr);
    } catch (err) {
      console.error("Erro ao carregar dependências estatutárias em cache:", err);
    } finally {
      setIsLoadingDeps(false);
    }
  };

  useEffect(() => {
    if (activeDirectorate) {
      loadStatutoryDependenciesAsync(activeDirectorate);
    }
  }, [activeDirectorate?.id]);

  // Compliance checker per provincial directorate (Decreto Presidencial n.º 184/17 - 18 dependências)
  const evaluateDirectorateCompliance = (dirId: string) => {
    const children = getChildren(dirId);
    const missing: string[] = [];

    STANDARD_STATUTORY_SUBUNITS.forEach(std => {
      const exists = children.some(c => 
        c.code?.includes(std.codePrefix) || 
        c.name.toLowerCase().includes(std.nameSuffix.toLowerCase().slice(0, 15))
      );
      if (!exists) {
        missing.push(std.nameSuffix);
      }
    });

    const score = 18 - missing.length;
    return {
      score,
      max: 18,
      isCompliant: score === 18,
      missing
    };
  };

  // Overall statistics
  const totalProvincialDirs = provincialDirectorates.length;
  const totalSubDivisions = organizationalUnits.filter(u => u.divisionType && u.divisionType !== "ESTAB_PENITENCIARIO" && u.divisionType !== "DIRECAO_PROVINCIAL").length;
  const totalAssociatedPrisons = organizationalUnits.filter(u => u.level === TerritorialScope.ESTABLISHMENT || u.divisionType === "ESTAB_PENITENCIARIO").length;

  // Open Functional Responsibilities Inspector
  const handleOpenRespInspector = (unit: OrganizationalUnit) => {
    setSelectedUnitForResp(unit);
    
    // Find statutory match for default copy if empty
    const statMatch = STANDARD_STATUTORY_SUBUNITS.find(std => 
      unit.code?.includes(std.codePrefix) || unit.name.toLowerCase().includes(std.nameSuffix.toLowerCase().slice(0, 15))
    );

    setRespAdminInput(unit.administrativeResponsibilities || statMatch?.defaultAdminResp || "Gerenciamento do expediente técnico, arquivo documental e prestação de contas à Direção Provincial.");
    setRespOperInput(unit.operationalResponsibilities || statMatch?.defaultOperResp || "Execução das diretivas de segurança, patrulhamento, revistas gerais e controlo da disciplina interna.");
    setRespHeadNameInput(unit.headOfficerName || "Superintendente Prisional A. Silva");
    setRespHeadRankInput(unit.chiefOfficerRank || "Superintendente Prisional");
    setRespHeadPhoneInput(unit.chiefOfficerPhone || "+244 923 000 184");

    setIsRespInspectorOpen(true);
  };

  // Save Functional Responsibilities
  const handleSaveResponsibilities = () => {
    if (!selectedUnitForResp) return;

    setOrganizationalUnits(prev => prev.map(u => {
      if (u.id === selectedUnitForResp.id) {
        return {
          ...u,
          administrativeResponsibilities: respAdminInput,
          operationalResponsibilities: respOperInput,
          headOfficerName: respHeadNameInput,
          chiefOfficerRank: respHeadRankInput,
          chiefOfficerPhone: respHeadPhoneInput
        };
      }
      return u;
    }));

    triggerToast("ATRIBUIÇÕES FUNCIONAIS SALVAS", `Responsabilidades administrativas e operativas atualizadas para ${selectedUnitForResp.name}.`, "success");
    setIsRespInspectorOpen(false);
  };

  // Handle Save Sub-Unit
  const handleSaveSubUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      triggerToast("ERRO DE VALIDAÇÃO", "Introduza a designação da unidade.", "error");
      return;
    }

    const targetProv = organizationalUnits.find(u => u.id === parentUnitId)?.province || selectedProvinceFilter;
    const targetLvl: AdministrativeTreeLevel = formType === "ESTAB_PENITENCIARIO" ? "L3_EP" : "L4_ORGAO";

    if (editingUnitId) {
      const currentUnit = organizationalUnits.find(u => u.id === editingUnitId);
      if (currentUnit) {
        const val = validateSubordination(currentUnit, parentUnitId);
        if (!val.valid) {
          triggerToast("VIOLAÇÃO ORGÂNICA NREP-AO", val.errorReason || "Subordinação territorial inválida.", "error");
          return;
        }
      }

      setOrganizationalUnits(prev => prev.map(u => {
        if (u.id === editingUnitId) {
          return {
            ...u,
            name: formName,
            code: formCode || u.code,
            divisionType: formType,
            legalBasis: formLegalBasis,
            headOfficerName: formHeadOfficer,
            parentId: parentUnitId
          };
        }
        return u;
      }));
      triggerToast("HIERARQUIA ATUALIZADA", `Unidade '${formName}' atualizada com sucesso em conformidade com o NREP-AO.`, "success");
    } else {
      const parentUnit = organizationalUnits.find(u => u.id === parentUnitId);
      const validation = validateSingleUnitNrepRules({
        name: formName,
        treeLevel: targetLvl,
        parentId: parentUnitId,
        province: targetProv,
        allUnits: organizationalUnits,
        levelDefs: levelDefinitions
      });

      if (!validation.isValid) {
        triggerToast("VIOLAÇÃO ORGÂNICA NREP-AO", validation.errorReason || "Criação rejeitada pelas regras do Decreto Presidencial n.º 184/17.", "error");
        return;
      }

      const newUnit: OrganizationalUnit = {
        id: `OU-SUB-${Date.now()}`,
        name: formName,
        level: parentUnit?.level || TerritorialScope.PROVINCIAL,
        treeLevel: targetLvl,
        parentId: parentUnitId,
        province: targetProv,
        divisionType: formType,
        code: formCode || `SUB-${Math.floor(Math.random() * 900 + 100)}`,
        legalBasis: formLegalBasis,
        headOfficerName: formHeadOfficer
      };
      setOrganizationalUnits(prev => [...prev, newUnit]);
      triggerToast("NOVA DIVISÃO CRIADA", `Divisão '${formName}' adicionada sob ${parentUnit?.name || 'Direção Provincial'}.`, "success");
    }

    setIsModalOpen(false);
    resetForm();
  };

  // Reset Form
  const resetForm = () => {
    setEditingUnitId(null);
    setFormName("");
    setFormCode("");
    setFormType("DEPARTAMENTO");
    setFormLegalBasis("Decreto Presidencial n.º 184/17, Artigo 18.º");
    setFormHeadOfficer("");
  };

  // Open Edit Modal
  const handleEditUnit = (unit: OrganizationalUnit) => {
    setEditingUnitId(unit.id);
    setParentUnitId(unit.parentId || "OU-MININT-DG");
    setFormName(unit.name);
    setFormCode(unit.code || "");
    setFormType((unit.divisionType as any) || "DEPARTAMENTO");
    setFormLegalBasis(unit.legalBasis || "Decreto Presidencial n.º 184/17, Artigo 18.º");
    setFormHeadOfficer(unit.headOfficerName || "");
    setIsModalOpen(true);
  };

  // Delete Unit
  const handleDeleteUnit = (unitId: string, name: string) => {
    const children = getChildren(unitId);
    if (children.length > 0) {
      triggerToast("AÇÃO BLOQUEADA", `Não é possível remover '${name}' pois possui ${children.length} sub-níveis dependentes.`, "warning");
      return;
    }
    if (confirm(`Confirma a remoção permanente do sub-nível orgânico '${name}'?`)) {
      setOrganizationalUnits(prev => prev.filter(u => u.id !== unitId));
      triggerToast("UNIDADE REMOVIDA", `A unidade '${name}' foi excluída do organograma.`, "info");
    }
  };

  // Auto-conform directorate to Dec. Presidencial 184/17 with cache persistence
  const handleAutoConformDirectorate = async (dir: OrganizationalUnit) => {
    await loadStatutoryDependenciesAsync(dir, true);
    triggerToast("CONFORMIDADE 184/17 & CACHE ATUALIZADO", `Sincronizadas e persistidas em cache local as 18 dependências regulamentares para a ${dir.name}.`, "success");
  };

  // Anular unidades incorretas e redesenhar integralmente as 18 dependências estatutárias (Dec. 184/17)
  const handlePurgeAndRedesignStatutoryUnits = (dir: OrganizationalUnit) => {
    if (!dir) return;
    if (!confirm(`Confirma a ANULAÇÃO da estrutura anterior e o REDESENHO LIMPO das 18 dependências regulamentares (Decreto Presidencial n.º 184/17) para a Direção Provincial de ${dir.province}?`)) return;

    setOrganizationalUnits(prev => {
      // Remover sub-unidades antigas desta direção provincial (mantendo EPs vinculados)
      const keep = prev.filter(u => !(u.parentId === dir.id && u.divisionType !== "ESTAB_PENITENCIARIO" && u.level !== TerritorialScope.ESTABLISHMENT));

      // Recriar do zero as 18 dependências estatutárias com responsabilidades administrativas e operativas completas
      const pristine: OrganizationalUnit[] = STANDARD_STATUTORY_SUBUNITS.map((std, idx) => ({
        id: `OU-DEP-${dir.province?.replace(/\s+/g, '-').toUpperCase()}-${std.codePrefix}`,
        name: `${idx + 1}. ${std.nameSuffix}`,
        level: TerritorialScope.PROVINCIAL,
        parentId: dir.id,
        province: dir.province,
        divisionType: std.type,
        code: `${std.codePrefix}-${dir.province?.substring(0, 3).toUpperCase()}`,
        legalBasis: std.legalBasis,
        category: std.category,
        functionDescription: std.functionDescription,
        administrativeResponsibilities: std.defaultAdminResp,
        operationalResponsibilities: std.defaultOperResp
      }));

      // Persistir na chave de cache local
      const cacheKey = `nrep_statutory_deps_v1_${dir.province?.toLowerCase().replace(/\s+/g, '_') || dir.id}`;
      localStorage.setItem(cacheKey, JSON.stringify({
        province: dir.province,
        units: pristine,
        timestamp: new Date().toLocaleTimeString('pt-AO')
      }));

      return [...keep, ...pristine];
    });

    setIsFromCache(false);
    setLastSyncTime(new Date().toLocaleTimeString('pt-AO'));
    triggerToast("ESTRUTURA REDESENHADA (DEC. 184/17)", `Foram anuladas as unidades anteriores e redesenhadas integralmente as 18 dependências estatutárias para a Direção Provincial de ${dir.province}.`, "success");
  };

  // Handle Associate Prison
  const handleAssociatePrison = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrisonIdToAssociate) {
      triggerToast("SELEÇÃO NECESSÁRIA", "Selecione o Estabelecimento Penitenciário.", "warning");
      return;
    }

    const prisonObj = prisons.find(p => p.id === selectedPrisonIdToAssociate);
    const parentUnit = organizationalUnits.find(u => u.id === targetParentUnitId);

    const existing = organizationalUnits.find(u => u.prisonId === selectedPrisonIdToAssociate);
    if (existing) {
      setOrganizationalUnits(prev => prev.map(u => {
        if (u.id === existing.id) {
          return {
            ...u,
            parentId: targetParentUnitId,
            province: parentUnit?.province || u.province
          };
        }
        return u;
      }));
      triggerToast("VÍNCULO REATRIBUÍDO", `O ${prisonObj?.name || 'Estabelecimento'} foi reafeto a ${parentUnit?.name}.`, "success");
    } else {
      const newOrgUnit: OrganizationalUnit = {
        id: `OU-PRIS-${selectedPrisonIdToAssociate}`,
        name: prisonObj?.name || `Estabelecimento ${selectedPrisonIdToAssociate}`,
        level: TerritorialScope.ESTABLISHMENT,
        parentId: targetParentUnitId,
        province: parentUnit?.province || prisonObj?.location?.split(",")[0] || selectedProvinceFilter,
        prisonId: selectedPrisonIdToAssociate,
        divisionType: "ESTAB_PENITENCIARIO",
        category: "IV - UNIDADES EXECUTIVAS DE CUSTÓDIA",
        legalBasis: "Decreto Presidencial n.º 184/17, Artigo 25.º"
      };
      setOrganizationalUnits(prev => [...prev, newOrgUnit]);
      triggerToast("ESTABELECIMENTO VINCULADO", `O ${prisonObj?.name} foi associado à hierarquia da ${parentUnit?.name}.`, "success");
    }

    setIsAssociateModalOpen(false);
  };

  // Dynamic Level Calculation & Ancestry Helpers
  const levelUnitsSummary = useMemo(() => {
    const l1 = organizationalUnits.filter(u => getUnitTreeLevel(u) === "L1_DG");
    const l2 = organizationalUnits.filter(u => getUnitTreeLevel(u) === "L2_PROV");
    const l3 = organizationalUnits.filter(u => getUnitTreeLevel(u) === "L3_EP");
    const l4 = organizationalUnits.filter(u => getUnitTreeLevel(u) === "L4_ORGAO");
    return {
      L1_DG: l1,
      L2_PROV: l2,
      L3_EP: l3,
      L4_ORGAO: l4,
      total: organizationalUnits.length
    };
  }, [organizationalUnits]);

  // Ancestor Breadcrumb Resolver (L1 -> L2 -> L3 -> L4)
  const getAncestorPath = (unit: OrganizationalUnit): OrganizationalUnit[] => {
    const path: OrganizationalUnit[] = [unit];
    let current = unit;
    const visited = new Set<string>([unit.id]);
    
    while (current.parentId) {
      if (visited.has(current.parentId)) break;
      visited.add(current.parentId);
      const parent = organizationalUnits.find(u => u.id === current.parentId);
      if (!parent) break;
      path.unshift(parent);
      current = parent;
    }
    return path;
  };

  // Direct and Indirect Descendants Resolver
  const getDescendants = (unitId: string): OrganizationalUnit[] => {
    const directChildren = organizationalUnits.filter(u => u.parentId === unitId);
    let all: OrganizationalUnit[] = [...directChildren];
    directChildren.forEach(child => {
      all = all.concat(getDescendants(child.id));
    });
    return all;
  };

  // NREP-AO Full Tree Validation Report
  const nrepTreeValidationReport = useMemo(() => {
    return validateNrepOrganicTree(organizationalUnits, levelDefinitions);
  }, [organizationalUnits, levelDefinitions]);

  // Hierarchy Health & Consistency Check synced with NREP-AO engine
  const hierarchyIntegrityStats = useMemo(() => {
    const rootNodes = organizationalUnits.filter(u => !u.parentId || u.id === "OU-MININT-DG");
    return {
      rootCount: rootNodes.length,
      orphanedCount: nrepTreeValidationReport.orphanedNodes.length,
      orphanedNodes: nrepTreeValidationReport.orphanedNodes,
      crossProvinceCount: nrepTreeValidationReport.territorialAnomalies.length,
      sequenceViolationsCount: nrepTreeValidationReport.sequenceViolations.length,
      circularLoopsCount: nrepTreeValidationReport.circularLoops.length,
      criticalIssuesCount: nrepTreeValidationReport.criticalCount,
      warningCount: nrepTreeValidationReport.warningCount,
      isHealthy: nrepTreeValidationReport.isValid,
      report: nrepTreeValidationReport
    };
  }, [organizationalUnits, nrepTreeValidationReport]);

  // Repair single NREP-AO validation issue automatically
  const handleRepairNrepIssue = (issue: NrepValidationIssue) => {
    const unit = organizationalUnits.find(u => u.id === issue.unitId);
    if (!unit) return;

    const unitLvl = getUnitTreeLevel(unit);
    let targetParentId = "OU-MININT-DG";

    if (unitLvl === "L2_PROV") {
      targetParentId = "OU-MININT-DG";
    } else if (unitLvl === "L3_EP") {
      const provDir = organizationalUnits.find(p => 
        (getUnitTreeLevel(p) === "L2_PROV" || p.divisionType === "DIRECAO_PROVINCIAL" || p.id.startsWith("OU-DP-")) &&
        normalizeProvince(p.province) === normalizeProvince(unit.province)
      );
      targetParentId = provDir?.id || "OU-MININT-DG";
    } else if (unitLvl === "L4_ORGAO") {
      const provEp = organizationalUnits.find(p => 
        getUnitTreeLevel(p) === "L3_EP" &&
        normalizeProvince(p.province) === normalizeProvince(unit.province)
      );
      const provDir = organizationalUnits.find(p => 
        getUnitTreeLevel(p) === "L2_PROV" &&
        normalizeProvince(p.province) === normalizeProvince(unit.province)
      );
      targetParentId = provEp?.id || provDir?.id || "OU-MININT-DG";
    }

    setOrganizationalUnits(prev => prev.map(u => {
      if (u.id === unit.id) {
        return {
          ...u,
          parentId: targetParentId
        };
      }
      return u;
    }));

    triggerToast(
      "NÓ REPARADO COM SUCESSO",
      `A unidade '${unit.name}' foi re-ancorada no superior regulamentar (${targetParentId === "OU-MININT-DG" ? "Direcção Geral" : "Direcção Provincial"}).`,
      "success"
    );
  };

  // Open Create Modal for Specific Level
  const handleOpenCreateLevelModal = (levelKey: AdministrativeTreeLevel = "L4_ORGAO") => {
    setSelectedLevelToCreate(levelKey);
    setEditingLevelUnitId(null);
    setLevelFormName("");
    setLevelFormCode("");
    setLevelFormProvince(isNational ? selectedProvinceFilter : operatorProvince);
    setLevelFormHeadName("");
    setLevelFormHeadRank("Superintendente Prisional");
    setLevelFormHeadPhone("");
    setLevelFormFuncDesc("");
    setLevelFormAdminResp("");
    setLevelFormOperResp("");

    if (levelKey === "L1_DG") {
      setLevelFormDivisionType("DIRECAO_NACIONAL");
      setLevelFormParentId("OU-MININT-DG");
      setLevelFormLegalBasis("Estatuto Orgânico do Serviço Penitenciário");
      setLevelFormCategory("ÓRGÃOS DE DIRECÇÃO SUPERIOR");
    } else if (levelKey === "L2_PROV") {
      setLevelFormDivisionType("DIRECAO_PROVINCIAL");
      setLevelFormParentId("OU-MININT-DG");
      setLevelFormLegalBasis("Decreto Presidencial n.º 184/17, Artigo 4.º");
      setLevelFormCategory("ÓRGÃOS OPERACIONAIS E EXECUTIVOS NACIONAIS");
    } else if (levelKey === "L3_EP") {
      setLevelFormDivisionType("ESTAB_PENITENCIARIO");
      const provDir = provincialDirectorates.find(d => normalizeProvince(d.province) === normalizeProvince(selectedProvinceFilter));
      setLevelFormParentId(provDir?.id || "OU-MININT-DG");
      setLevelFormLegalBasis("Regulamento Geral dos Estabelecimentos Prisionais");
      setLevelFormCategory("IV - UNIDADES EXECUTIVAS DE CUSTÓDIA");
    } else {
      setLevelFormDivisionType("DEPARTAMENTO");
      const provDir = provincialDirectorates.find(d => normalizeProvince(d.province) === normalizeProvince(selectedProvinceFilter));
      setLevelFormParentId(provDir?.id || "OU-MININT-DG");
      setLevelFormLegalBasis("Decreto Presidencial n.º 184/17 de 11 de Agosto");
      setLevelFormCategory("II - DEPENDÊNCIAS OPERACIONAIS (Executivas)");
    }

    setIsCreateLevelModalOpen(true);
  };

  // Open Edit Modal for Dynamic Level Unit
  const handleOpenEditLevelUnit = (unit: OrganizationalUnit) => {
    const levelKey = getUnitTreeLevel(unit);
    setSelectedLevelToCreate(levelKey);
    setEditingLevelUnitId(unit.id);
    setLevelFormName(unit.name);
    setLevelFormCode(unit.code || "");
    setLevelFormDivisionType(unit.divisionType || (levelKey === "L1_DG" ? "DIRECAO_NACIONAL" : levelKey === "L2_PROV" ? "DIRECAO_PROVINCIAL" : levelKey === "L3_EP" ? "ESTAB_PENITENCIARIO" : "DEPARTAMENTO"));
    setLevelFormParentId(unit.parentId || "OU-MININT-DG");
    setLevelFormProvince(unit.province || (isNational ? selectedProvinceFilter : operatorProvince));
    setLevelFormLegalBasis(unit.legalBasis || "Decreto Presidencial n.º 184/17");
    setLevelFormCategory(unit.category || "II - DEPENDÊNCIAS OPERACIONAIS (Executivas)");
    setLevelFormHeadName(unit.headOfficerName || "");
    setLevelFormHeadRank(unit.chiefOfficerRank || unit.headOfficerRank || "Superintendente Prisional");
    setLevelFormHeadPhone(unit.chiefOfficerPhone || "");
    setLevelFormFuncDesc(unit.functionDescription || "");
    setLevelFormAdminResp(unit.administrativeResponsibilities || "");
    setLevelFormOperResp(unit.operationalResponsibilities || "");

    setIsCreateLevelModalOpen(true);
  };

  // Save Dynamic Level Unit (Create or Update)
  const handleSaveLevelUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelFormName.trim()) {
      triggerToast("CAMPOS INCOMPLETOS", "Informe a designação da unidade orgânica.", "warning");
      return;
    }

    // NREP-AO Strict Organic Validation
    const validation = validateSingleUnitNrepRules({
      unitId: editingLevelUnitId,
      name: levelFormName,
      treeLevel: selectedLevelToCreate,
      parentId: levelFormParentId,
      province: levelFormProvince,
      allUnits: organizationalUnits,
      levelDefs: levelDefinitions
    });

    if (!validation.isValid) {
      triggerToast("VIOLAÇÃO ORGÂNICA NREP-AO", validation.errorReason || "Operação rejeitada por violar regras do Decreto Presidencial n.º 184/17.", "error");
      return;
    }

    let territorialScope = TerritorialScope.ESTABLISHMENT;
    if (selectedLevelToCreate === "L1_DG") {
      territorialScope = TerritorialScope.NATIONAL;
    } else if (selectedLevelToCreate === "L2_PROV") {
      territorialScope = TerritorialScope.PROVINCIAL;
    } else if (selectedLevelToCreate === "L3_EP") {
      territorialScope = TerritorialScope.ESTABLISHMENT;
    } else {
      territorialScope = selectedLevelToCreate === "L4_ORGAO" && levelFormParentId === "OU-MININT-DG" 
        ? TerritorialScope.NATIONAL 
        : TerritorialScope.PROVINCIAL;
    }

    if (editingLevelUnitId) {
      setOrganizationalUnits(prev => prev.map(u => {
        if (u.id === editingLevelUnitId) {
          return {
            ...u,
            name: levelFormName.trim(),
            code: levelFormCode.trim() || undefined,
            sigla: levelFormCode.trim() || undefined,
            divisionType: levelFormDivisionType as any,
            level: territorialScope,
            treeLevel: selectedLevelToCreate,
            hierarchyLevel: levelDefinitions[selectedLevelToCreate].num,
            levelLabel: levelDefinitions[selectedLevelToCreate].shortLabel,
            parentId: levelFormParentId,
            province: levelFormProvince,
            legalBasis: levelFormLegalBasis,
            category: levelFormCategory,
            headOfficerName: levelFormHeadName || undefined,
            chiefOfficerRank: levelFormHeadRank || undefined,
            headOfficerRank: levelFormHeadRank || undefined,
            chiefOfficerPhone: levelFormHeadPhone || undefined,
            functionDescription: levelFormFuncDesc || undefined,
            administrativeResponsibilities: levelFormAdminResp || undefined,
            operationalResponsibilities: levelFormOperResp || undefined
          };
        }
        return u;
      }));

      triggerToast(
        "NÍVEL ORGÂNICO ATUALIZADO",
        `A unidade '${levelFormName}' no Nível ${levelDefinitions[selectedLevelToCreate].num} (${levelDefinitions[selectedLevelToCreate].shortLabel}) foi atualizada com sucesso.`,
        "success"
      );
    } else {
      const generatedId = `OU-${selectedLevelToCreate}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const newUnit: OrganizationalUnit = {
        id: generatedId,
        name: levelFormName.trim(),
        code: levelFormCode.trim() || undefined,
        sigla: levelFormCode.trim() || undefined,
        divisionType: levelFormDivisionType as any,
        level: territorialScope,
        treeLevel: selectedLevelToCreate,
        hierarchyLevel: levelDefinitions[selectedLevelToCreate].num,
        levelLabel: levelDefinitions[selectedLevelToCreate].shortLabel,
        parentId: levelFormParentId,
        province: levelFormProvince,
        legalBasis: levelFormLegalBasis,
        category: levelFormCategory,
        headOfficerName: levelFormHeadName || undefined,
        chiefOfficerRank: levelFormHeadRank || undefined,
        headOfficerRank: levelFormHeadRank || undefined,
        chiefOfficerPhone: levelFormHeadPhone || undefined,
        functionDescription: levelFormFuncDesc || undefined,
        administrativeResponsibilities: levelFormAdminResp || undefined,
        operationalResponsibilities: levelFormOperResp || undefined
      };

      setOrganizationalUnits(prev => [...prev, newUnit]);

      if (selectedLevelToCreate === "L3_EP" && setPrisons) {
        setPrisons(prev => [
          ...prev,
          {
            id: generatedId,
            name: levelFormName.trim(),
            location: levelFormProvince,
            province: levelFormProvince,
            capacity: 500,
            population: 0,
            securityLevel: "MÉDIA",
            director: levelFormHeadName || "A Nomear",
            directorContact: levelFormHeadPhone || "+244 923 000 000"
          }
        ]);
      }

      triggerToast(
        "NOVA UNIDADE HIERÁRQUICA CRIADA",
        `Unidade '${levelFormName}' cadastrada no Nível ${levelDefinitions[selectedLevelToCreate].num} (${levelDefinitions[selectedLevelToCreate].shortLabel}).`,
        "success"
      );
    }

    setIsCreateLevelModalOpen(false);
  };

  // Open Dynamic Level Definition Customizer Modal
  const handleOpenEditLevelDefinition = (lvlKey: AdministrativeTreeLevel) => {
    setEditingLevelDefKey(lvlKey);
    const def = levelDefinitions[lvlKey];
    setDefFormLabel(def.label);
    setDefFormShortLabel(def.shortLabel);
    setDefFormScope(def.scope);
    setDefFormDescription(def.description);
    setDefFormApplyToUnits(true);
    setIsLevelDefinitionsModalOpen(true);
  };

  // Save Dynamic Level Definition and Cascade to OrganizationalUnits
  const handleSaveLevelDefinition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defFormLabel.trim() || !defFormShortLabel.trim()) {
      triggerToast("CAMPOS INCOMPLETOS", "Informe a designação e o rótulo do nível.", "warning");
      return;
    }

    const currentDef = levelDefinitions[editingLevelDefKey];
    const updatedDef = {
      ...currentDef,
      label: defFormLabel.trim(),
      shortLabel: defFormShortLabel.trim(),
      scope: defFormScope.trim(),
      description: defFormDescription.trim()
    };

    setLevelDefinitions(prev => ({
      ...prev,
      [editingLevelDefKey]: updatedDef
    }));

    if (defFormApplyToUnits) {
      setOrganizationalUnits(prev => prev.map(u => {
        if (getUnitTreeLevel(u) === editingLevelDefKey) {
          return {
            ...u,
            treeLevel: editingLevelDefKey,
            hierarchyLevel: currentDef.num,
            levelLabel: defFormShortLabel.trim()
          };
        }
        return u;
      }));
    }

    triggerToast(
      "NÍVEL HIERÁRQUICO ATUALIZADO",
      `A definição do Nível ${currentDef.num} (${defFormShortLabel.trim()}) foi atualizada e sincronizada com a estrutura orgânica.`,
      "success"
    );

    setIsLevelDefinitionsModalOpen(false);
  };

  // Quick Unit Promotion (e.g. L4 -> L3 -> L2 -> L1)
  const handlePromoteUnit = (unit: OrganizationalUnit) => {
    const currentLvl = getUnitTreeLevel(unit);
    let targetLvl: AdministrativeTreeLevel = "L1_DG";
    let targetParent = unit.parentId || "OU-MININT-DG";
    let targetScope = unit.level;

    if (currentLvl === "L4_ORGAO") {
      targetLvl = "L3_EP";
      targetScope = TerritorialScope.ESTABLISHMENT;
    } else if (currentLvl === "L3_EP") {
      targetLvl = "L2_PROV";
      targetScope = TerritorialScope.PROVINCIAL;
      targetParent = "OU-MININT-DG";
    } else if (currentLvl === "L2_PROV") {
      targetLvl = "L1_DG";
      targetScope = TerritorialScope.NATIONAL;
      targetParent = "OU-MININT-DG";
    } else {
      triggerToast("NÍVEL SUPERIOR", "A unidade já se encontra no escalão superior (L1 - Direcção Geral).", "info");
      return;
    }

    setOrganizationalUnits(prev => prev.map(u => {
      if (u.id === unit.id) {
        return {
          ...u,
          treeLevel: targetLvl,
          hierarchyLevel: levelDefinitions[targetLvl].num,
          levelLabel: levelDefinitions[targetLvl].shortLabel,
          level: targetScope,
          parentId: targetParent
        };
      }
      return u;
    }));

    triggerToast("UNIDADE PROMOVIDA", `A unidade '${unit.name}' foi promovida para o Nível ${levelDefinitions[targetLvl].num} (${levelDefinitions[targetLvl].shortLabel}).`, "success");
  };

  // Quick Unit Demotion (e.g. L1 -> L2 -> L3 -> L4)
  const handleDemoteUnit = (unit: OrganizationalUnit) => {
    const currentLvl = getUnitTreeLevel(unit);
    let targetLvl: AdministrativeTreeLevel = "L4_ORGAO";
    let targetParent = unit.parentId || "OU-MININT-DG";
    let targetScope = unit.level;

    if (currentLvl === "L1_DG") {
      targetLvl = "L2_PROV";
      targetScope = TerritorialScope.PROVINCIAL;
    } else if (currentLvl === "L2_PROV") {
      targetLvl = "L3_EP";
      targetScope = TerritorialScope.ESTABLISHMENT;
    } else if (currentLvl === "L3_EP") {
      targetLvl = "L4_ORGAO";
      targetScope = TerritorialScope.PROVINCIAL;
    } else {
      triggerToast("NÍVEL BASE", "A unidade já se encontra no escalão operacional de base (L4 - Órgão / Secção).", "info");
      return;
    }

    setOrganizationalUnits(prev => prev.map(u => {
      if (u.id === unit.id) {
        return {
          ...u,
          treeLevel: targetLvl,
          hierarchyLevel: levelDefinitions[targetLvl].num,
          levelLabel: levelDefinitions[targetLvl].shortLabel,
          level: targetScope,
          parentId: targetParent
        };
      }
      return u;
    }));

    triggerToast("UNIDADE RECLASSIFICADA", `A unidade '${unit.name}' foi reclassificada para o Nível ${levelDefinitions[targetLvl].num} (${levelDefinitions[targetLvl].shortLabel}).`, "success");
  };

  // Open Level Reassign Modal
  const handleOpenLevelReassign = (unit: OrganizationalUnit) => {
    const currentLvl = getUnitTreeLevel(unit);
    setSelectedUnitForReassign(unit);
    setNewLevelForReassign(currentLvl);
    setNewParentForReassign(unit.parentId || "OU-MININT-DG");
    setIsLevelReassignModalOpen(true);
  };

  // Save Level Reassignment & Superior Link
  const handleSaveLevelReassign = () => {
    if (!selectedUnitForReassign) return;

    // NREP-AO Strict Organic Validation
    const validation = validateSingleUnitNrepRules({
      unitId: selectedUnitForReassign.id,
      name: selectedUnitForReassign.name,
      treeLevel: newLevelForReassign,
      parentId: newParentForReassign,
      province: selectedUnitForReassign.province,
      allUnits: organizationalUnits,
      levelDefs: levelDefinitions
    });

    if (!validation.isValid) {
      triggerToast("VIOLAÇÃO ORGÂNICA NREP-AO", validation.errorReason || "Reclassificação rejeitada pelas regras do Decreto Presidencial n.º 184/17.", "error");
      return;
    }

    let targetScope = TerritorialScope.ESTABLISHMENT;
    let targetDivisionType = selectedUnitForReassign.divisionType;

    if (newLevelForReassign === "L1_DG") {
      targetScope = TerritorialScope.NATIONAL;
      targetDivisionType = "DIRECAO_NACIONAL";
    } else if (newLevelForReassign === "L2_PROV") {
      targetScope = TerritorialScope.PROVINCIAL;
      targetDivisionType = "DIRECAO_PROVINCIAL";
    } else if (newLevelForReassign === "L3_EP") {
      targetScope = TerritorialScope.ESTABLISHMENT;
      targetDivisionType = "ESTAB_PENITENCIARIO";
    } else {
      targetScope = TerritorialScope.PROVINCIAL;
      if (!targetDivisionType || targetDivisionType === "DIRECAO_PROVINCIAL" || targetDivisionType === "ESTAB_PENITENCIARIO") {
        targetDivisionType = "DEPARTAMENTO";
      }
    }

    setOrganizationalUnits(prev => prev.map(u => {
      if (u.id === selectedUnitForReassign.id) {
        return {
          ...u,
          treeLevel: newLevelForReassign,
          hierarchyLevel: levelDefinitions[newLevelForReassign].num,
          levelLabel: levelDefinitions[newLevelForReassign].shortLabel,
          level: targetScope,
          divisionType: targetDivisionType as any,
          parentId: newParentForReassign
        };
      }
      return u;
    }));

    triggerToast(
      "NÍVEL RECLASSIFICADO",
      `A unidade '${selectedUnitForReassign.name}' foi reclassificada para o Nível ${levelDefinitions[newLevelForReassign].num} (${levelDefinitions[newLevelForReassign].shortLabel}).`,
      "success"
    );

    setIsLevelReassignModalOpen(false);
    setSelectedUnitForReassign(null);
  };

  // Handle Generate 4-Tier Blueprint Branch
  const handleGenerateBranchBlueprint = () => {
    const prov = blueprintTargetProvince;
    const normProv = normalizeProvince(prov);
    
    let provDir = organizationalUnits.find(u => 
      (u.divisionType === "DIRECAO_PROVINCIAL" || u.id.startsWith("OU-DP-")) &&
      normalizeProvince(u.province) === normProv
    );

    const unitsToAdd: OrganizationalUnit[] = [];

    if (!provDir) {
      provDir = {
        id: `OU-DP-${prov.toUpperCase().replace(/\s+/g, '-')}`,
        name: `Direcção Provincial dos Serviços Penitenciários de ${prov}`,
        level: TerritorialScope.PROVINCIAL,
        parentId: "OU-MININT-DG",
        province: prov,
        divisionType: "DIRECAO_PROVINCIAL",
        code: `DP-${prov.substring(0, 3).toUpperCase()}`,
        legalBasis: "Decreto Presidencial n.º 184/17, Artigo 4.º",
        category: "ÓRGÃOS OPERACIONAIS E EXECUTIVOS NACIONAIS",
        functionDescription: `Comando e coordenação provincial dos serviços penitenciários na província de ${prov}.`,
        headOfficerName: "Subcomissário Prisional Director Provincial",
        chiefOfficerRank: "Subcomissário Prisional"
      };
      unitsToAdd.push(provDir);
    }

    const epId = `OU-EP-${prov.toUpperCase().replace(/\s+/g, '-')}-${Date.now().toString(36).toUpperCase()}`;
    const epUnit: OrganizationalUnit = {
      id: epId,
      name: `${blueprintEpName} de ${prov}`,
      level: TerritorialScope.ESTABLISHMENT,
      parentId: provDir.id,
      province: prov,
      divisionType: "ESTAB_PENITENCIARIO",
      code: `EP-${prov.substring(0, 3).toUpperCase()}-01`,
      legalBasis: "Regulamento Geral dos Estabelecimentos Prisionais",
      category: "IV - UNIDADES EXECUTIVAS DE CUSTÓDIA",
      functionDescription: `Execução de penas privativas de liberdade, custódia e reinserção social na província de ${prov}.`,
      headOfficerName: "Superintendente Prisional Director da Cadeia",
      chiefOfficerRank: "Superintendente Prisional"
    };
    unitsToAdd.push(epUnit);

    const standardSections = [
      {
        name: `Secção de Controlo Penal e Registo Penitenciário (${epUnit.name})`,
        code: `SCP-${prov.substring(0, 3).toUpperCase()}`,
        divisionType: "SECCAO" as const,
        adminResp: "Gestão dos prontuários penais, cálculo de liquidação de penas e boletins de soltura.",
        operResp: "Triagem biométrica, registo diário de entradas/saídas e arquivo prisional."
      },
      {
        name: `Secção de Segurança e Guarda Prisional (${epUnit.name})`,
        code: `SSG-${prov.substring(0, 3).toUpperCase()}`,
        divisionType: "SECCAO" as const,
        adminResp: "Elaboração do mapa de escalas, controlo do paiol e armamento.",
        operResp: "Rondas armadas, vigilância de muralhas, contagens físicas de reclusos e revistas periciais."
      },
      {
        name: `Secção de Saúde e Assistência Médica (${epUnit.name})`,
        code: `SSAM-${prov.substring(0, 3).toUpperCase()}`,
        divisionType: "SECCAO" as const,
        adminResp: "Requisição de medicamentos, gestão de fichas clínicas e rastreios sanitários.",
        operResp: "Posto de enfermagem, isolamento epidemiológico e evacuação médica de urgência."
      },
      {
        name: `Secção de Produção Penitenciária e Reabilitação (${epUnit.name})`,
        code: `SPPR-${prov.substring(0, 3).toUpperCase()}`,
        divisionType: "SECCAO" as const,
        adminResp: "Registo de reclusos em laborterapia, oficinas e cursos de alfabetização.",
        operResp: "Supervisão das brigadas de trabalho agrícola, carpintaria e actividades produtivas."
      }
    ];

    standardSections.forEach((sec, idx) => {
      unitsToAdd.push({
        id: `OU-SEC-${epId}-${idx + 1}`,
        name: sec.name,
        level: TerritorialScope.ESTABLISHMENT,
        parentId: epId,
        province: prov,
        divisionType: sec.divisionType,
        code: sec.code,
        legalBasis: "Decreto Presidencial n.º 184/17 de 11 de Agosto",
        category: "II - DEPENDÊNCIAS OPERACIONAIS (Executivas)",
        administrativeResponsibilities: sec.adminResp,
        operationalResponsibilities: sec.operResp,
        headOfficerName: "Inspector Prisional Chefe de Secção",
        chiefOfficerRank: "Inspector Prisional"
      });
    });

    setOrganizationalUnits(prev => [...prev, ...unitsToAdd]);

    if (setPrisons) {
      setPrisons(prev => [
        ...prev,
        {
          id: epId,
          name: epUnit.name,
          location: prov,
          province: prov,
          capacity: 650,
          population: 0,
          securityLevel: "MÉDIA",
          director: epUnit.headOfficerName,
          directorContact: "+244 923 000 000"
        }
      ]);
    }

    triggerToast(
      "RAMO DE 4 NÍVEIS GERADO",
      `Criado com sucesso o ramo institucional de 4 níveis (DG ➔ Direcção Provincial ➔ ${epUnit.name} ➔ 4 Secções Especializadas).`,
      "success"
    );

    setIsBranchBlueprintModalOpen(false);
  };

  // Comprehensive NREP-AO Tree Sanitizer & Auto-Reconciler (Decreto Presidencial n.º 184/17)
  const handleAutoReconcileLevels = () => {
    setOrganizationalUnits(prev => {
      // 1. Map provincial directorates by normalized province
      const provDirMap = new Map<string, string>();
      prev.forEach(u => {
        if (getUnitTreeLevel(u) === "L2_PROV" || u.divisionType === "DIRECAO_PROVINCIAL" || u.id.startsWith("OU-DP-")) {
          const key = normalizeProvince(u.province);
          if (key) provDirMap.set(key, u.id);
        }
      });

      return prev.map(u => {
        const uLvl = getUnitTreeLevel(u);
        const normProv = normalizeProvince(u.province);

        // L1 (Root unit)
        if (u.id === "OU-MININT-DG") {
          return {
            ...u,
            level: TerritorialScope.NATIONAL,
            treeLevel: "L1_DG",
            parentId: undefined
          };
        }

        // L2 (Provincial Directorate) -> Reports to L1_DG
        if (uLvl === "L2_PROV") {
          return {
            ...u,
            treeLevel: "L2_PROV",
            level: TerritorialScope.PROVINCIAL,
            parentId: "OU-MININT-DG"
          };
        }

        // L3 (Prisons / EP) -> Reports to Provincial Directorate of same province or L1_DG
        if (uLvl === "L3_EP") {
          const validParent = provDirMap.get(normProv) || "OU-MININT-DG";
          const currentParent = prev.find(p => p.id === u.parentId);
          const currentParentLvl = currentParent ? getUnitTreeLevel(currentParent) : null;
          const isParentValid = currentParent && (currentParentLvl === "L2_PROV" || currentParentLvl === "L1_DG" || u.parentId === "OU-MININT-DG");
          const isTerritoryValid = !currentParent || currentParent.level === TerritorialScope.NATIONAL || normalizeProvince(currentParent.province) === normProv;

          if (!isParentValid || !isTerritoryValid || !u.parentId) {
            return {
              ...u,
              treeLevel: "L3_EP",
              level: TerritorialScope.ESTABLISHMENT,
              parentId: validParent
            };
          }
          return {
            ...u,
            treeLevel: "L3_EP",
            level: TerritorialScope.ESTABLISHMENT
          };
        }

        // L4 (Organs/Sections) -> Must report to L3_EP, L2_PROV or L1_DG
        if (uLvl === "L4_ORGAO") {
          const currentParent = prev.find(p => p.id === u.parentId);
          const currentParentLvl = currentParent ? getUnitTreeLevel(currentParent) : null;
          const isParentValid = currentParent && (currentParentLvl === "L3_EP" || currentParentLvl === "L2_PROV" || currentParentLvl === "L1_DG" || u.parentId === "OU-MININT-DG");

          if (!isParentValid || !u.parentId) {
            const fallbackParent = provDirMap.get(normProv) || "OU-MININT-DG";
            return {
              ...u,
              treeLevel: "L4_ORGAO",
              parentId: fallbackParent
            };
          }
          return {
            ...u,
            treeLevel: "L4_ORGAO"
          };
        }

        return u;
      });
    });

    triggerToast(
      "ÁRVORE NREP-AO RECONCILIADA",
      "Todas as dependências e sequências da árvore foram auditadas e reconciliadas com as normas do Decreto Presidencial n.º 184/17.",
      "success"
    );
  };

  // Filter Active Directorate Children by Category Tab
  const activeDirectorateChildren = useMemo(() => {
    if (!activeDirectorate) return [];
    return getChildren(activeDirectorate.id);
  }, [activeDirectorate, organizationalUnits]);

  const cat1Units = useMemo(() => {
    return activeDirectorateChildren.filter(c => c.category?.startsWith("I -") || c.divisionType === "GABINETE" && !c.category?.startsWith("III"));
  }, [activeDirectorateChildren]);

  const cat2Units = useMemo(() => {
    return activeDirectorateChildren.filter(c => c.category?.startsWith("II -") || c.code?.includes("DSP") || c.code?.includes("DCP") || c.code?.includes("SIP"));
  }, [activeDirectorateChildren]);

  const cat3Units = useMemo(() => {
    return activeDirectorateChildren.filter(c => c.category?.startsWith("III -") || c.divisionType === "CONSELHO" || c.name.toLowerCase().includes("conselho"));
  }, [activeDirectorateChildren]);

  const cat4Units = useMemo(() => {
    return activeDirectorateChildren.filter(c => c.category?.startsWith("IV -") || c.divisionType === "ESTAB_PENITENCIARIO" || c.level === TerritorialScope.ESTABLISHMENT);
  }, [activeDirectorateChildren]);

  return (
    <div className="OrganizationalHierarchyConfig flex flex-col gap-6 text-slate-100 font-sans">
      
      {/* HEADER BAR & JURISDICTION GUARD */}
      <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 sm:p-4 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 shrink-0">
            <FolderTree className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-sm font-bold text-slate-100 uppercase tracking-wide font-mono">
                Estrutura Orgânica(184/17)
              </h2>
              {isNational ? (
                <span className="bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Âmbito Nacional Central
                </span>
              ) : (
                <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="h-3 w-3 text-amber-400" /> Jurisdição Exclusiva: {operatorProvince}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-amber-400 text-[10px] sm:text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            title={isSidebarCollapsed ? "Expandir Painel Lateral" : "Recolher Painel Lateral para Modo Mini (1%)"}
          >
            {isSidebarCollapsed ? (
              <>
                <PanelLeftOpen className="h-3.5 w-3.5 text-amber-400" />
                <span className="inline">Expandir Menu</span>
              </>
            ) : (
              <>
                <PanelLeftClose className="h-3.5 w-3.5 text-slate-400" />
                <span className="inline">Recolher (1%)</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setParentUnitId(activeDirectorate?.id || "OU-DP-HUAMBO");
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[10px] sm:text-xs font-black px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 stroke-[3]" />
            Adicionar Sub-Divisão
          </button>

          <button
            onClick={() => {
              setTargetParentUnitId(activeDirectorate?.id || "OU-DP-HUAMBO");
              setIsAssociateModalOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-750 text-slate-200 font-mono text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <LinkIcon className="h-3.5 w-3.5 text-emerald-400" />
            Associar Estabelecimento
          </button>
        </div>
      </div>

      {/* METRICS & STATS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-slate-950 border border-slate-850 rounded-lg p-2.5 sm:p-3 flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-md text-blue-400 shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-mono uppercase font-semibold block truncate">DIREÇÕES NA MATRIZ</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-slate-100 flex items-baseline gap-1">
              {totalProvincialDirs} <span className="text-[9px] text-slate-500 font-normal">{isNational ? "18 Províncias" : "Sua Província"}</span>
            </span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 rounded-lg p-2.5 sm:p-3 flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-400 shrink-0">
            <Layers className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-mono uppercase font-semibold block truncate">DEPENDÊNCIAS ORGÂNICAS</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-slate-100 flex items-baseline gap-1">
              {totalSubDivisions} <span className="text-[9px] text-slate-500 font-normal">324 Dept / Gabinetes</span>
            </span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 rounded-lg p-2.5 sm:p-3 flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-400 shrink-0">
            <Building className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-mono uppercase font-semibold block truncate">EPS VINCULADOS</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-slate-100 flex items-baseline gap-1">
              {totalAssociatedPrisons} <span className="text-[9px] text-slate-500 font-normal">Cadeias</span>
            </span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 rounded-lg p-2.5 sm:p-3 flex items-center gap-2.5">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-md text-purple-400 shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[8.5px] sm:text-[9.5px] text-slate-400 font-mono uppercase font-semibold block truncate">CONFORMIDADE ORGÂNICA</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Dec. Pres. 184/17
            </span>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT WITH COLLAPSIBLE SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* PROVINCIAL SELECTOR SIDEBAR (COL 4 OR COL 1 WHEN COLLAPSED) */}
        <div className={`${isSidebarCollapsed ? "lg:col-span-1" : "lg:col-span-4"} bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col gap-4 transition-all duration-300`}>
          
          <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
            {!isSidebarCollapsed && (
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-500" /> 
                <span>{isNational ? "Direções Provinciais (18)" : `Jurisdição (${operatorProvince})`}</span>
              </h3>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-amber-400 transition cursor-pointer mx-auto lg:mx-0"
              title={isSidebarCollapsed ? "Expandir Painel Lateral" : "Recolher Painel (Modo 1%)"}
            >
              {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4 text-amber-400" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          {!isSidebarCollapsed ? (
            /* EXPANDED SIDEBAR CONTENT */
            <>
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Pesquisar província..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {!isNational && (
                <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-2.5 flex items-center gap-2 text-amber-400 text-[11px] font-mono">
                  <Lock className="h-3.5 w-3.5 shrink-0" />
                  <span>Matriz filtrada por jurisdição provincial ({operatorProvince}).</span>
                </div>
              )}

              <div className="flex flex-col gap-2 max-h-[580px] overflow-y-auto pr-1">
                {ALL_PROVINCES_LIST
                  .filter(prov => isNational || normalizeProvince(prov) === normalizeProvince(operatorProvince))
                  .filter(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(prov => {
                    const normProv = normalizeProvince(prov);
                    const dir = provincialDirectorates.find(d => normalizeProvince(d.province) === normProv);
                    const isSelected = normalizeProvince(selectedProvinceFilter) === normProv;
                    const comp = dir ? evaluateDirectorateCompliance(dir.id) : { score: 0, max: 18, isCompliant: false, missing: [] };
                    const childCount = dir ? getChildren(dir.id).length : 0;
                    const isItemExpanded = !!expandedSidebarProvinces[prov];

                    return (
                      <div
                        key={prov}
                        className={`rounded-xl border transition-all overflow-hidden ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold shadow-md ring-1 ring-amber-500/30"
                            : "bg-slate-900/40 border-slate-850/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                        }`}
                      >
                        <div
                          onClick={() => setSelectedProvinceFilter(prov)}
                          className="w-full p-3 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-mono font-semibold flex items-center gap-2">
                              <span>📍 Direção Provincial de {prov}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-sans">
                              {childCount} dependências • {comp.isCompliant ? (
                                <span className="text-emerald-400 font-mono font-bold">18/18 Conforme Dec. 184/17</span>
                              ) : (
                                <span className="text-amber-400/90 font-mono">{comp.score}/18 Dependências</span>
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => toggleSidebarProvinceItem(prov, e)}
                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded transition cursor-pointer"
                              title="Recolher / Expandir matriz desta província"
                            >
                              {isItemExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* RECOLHÍVEL ITEM ACCORDION DETAIL */}
                        <AnimatePresence>
                          {isItemExpanded && dir && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-slate-950/80 border-t border-slate-850/60 p-3 flex flex-col gap-2 text-[10px] font-mono"
                            >
                              <div className="flex justify-between items-center text-slate-400">
                                <span>I - Apoio Técnico & Gabinetes:</span>
                                <span className="text-purple-400 font-bold">{getChildren(dir.id).filter(c => c.category?.startsWith("I -") || c.divisionType === "GABINETE").length}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-400">
                                <span>II - Executivas (Operacionais):</span>
                                <span className="text-blue-400 font-bold">{getChildren(dir.id).filter(c => c.category?.startsWith("II -")).length}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-400">
                                <span>III - Apoio Instrumental:</span>
                                <span className="text-emerald-400 font-bold">{getChildren(dir.id).filter(c => c.category?.startsWith("III -") || c.divisionType === "CONSELHO").length}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-400">
                                <span>IV - Cadeias / EPs:</span>
                                <span className="text-amber-400 font-bold">{getChildren(dir.id).filter(c => c.category?.startsWith("IV -") || c.divisionType === "ESTAB_PENITENCIARIO").length}</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>
                    );
                  })}
              </div>
            </>
          ) : (
            /* COLLAPSED 1% SIDEBAR MINI MODE */
            <div className="flex flex-col items-center gap-2 py-2">
              {ALL_PROVINCES_LIST
                .filter(prov => isNational || normalizeProvince(prov) === normalizeProvince(operatorProvince))
                .map(prov => {
                  const isSelected = normalizeProvince(selectedProvinceFilter) === normalizeProvince(prov);
                  return (
                    <button
                      key={prov}
                      onClick={() => setSelectedProvinceFilter(prov)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all cursor-pointer relative group ${
                        isSelected
                          ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-105"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/40"
                      }`}
                      title={`Direção Provincial de ${prov}`}
                    >
                      {prov.substring(0, 2).toUpperCase()}
                      <div className="absolute left-12 bg-slate-900 border border-slate-750 text-slate-100 text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                        Província de {prov}
                      </div>
                    </button>
                  );
                })}
            </div>
          )}

        </div>

        {/* PROVINCIAL DIRECTORATE INSPECTOR & DEPENDENCIES VIEW (COL 8 OR COL 11) */}
        <div className={`${isSidebarCollapsed ? "lg:col-span-11" : "lg:col-span-8"} flex flex-col gap-6 transition-all duration-300`}>
          
          {/* Active Directorate Details Box */}
          {activeDirectorate ? (
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 sm:p-4 flex flex-col gap-3.5">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 border-b border-slate-900 pb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-100 font-mono uppercase">
                      {activeDirectorate.name}
                    </h3>
                    <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                      Província do {activeDirectorate.province}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    onClick={() => handlePurgeAndRedesignStatutoryUnits(activeDirectorate)}
                    className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    title="Anula a estrutura anterior e redesenha de forma limpa as 18 dependências regulamentares conforme Decreto Presidencial 184/17"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                    Anular & Redesenhar (184/17)
                  </button>

                  <button
                    onClick={() => handleAutoConformDirectorate(activeDirectorate)}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    title="Gera e sincroniza automaticamente as 18 dependências regulamentares conforme o Decreto 184/17"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Auto-Conformar (18 Dependências)
                  </button>
                </div>
              </div>

              {/* Compliance Status Alert Box */}
              {(() => {
                const comp = evaluateDirectorateCompliance(activeDirectorate.id);
                if (comp.isCompliant) {
                  return (
                    <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-2 flex items-center gap-2 text-xs text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span className="font-mono font-bold uppercase text-emerald-400 text-xxs tracking-wider">ESTRUTURA CONFORME (18/18)</span>
                    </div>
                  );
                }
                return (
                  <div className="bg-amber-950/20 border border-amber-900/40 rounded-lg p-2 flex items-center gap-2 text-xs text-amber-300">
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="font-mono font-bold uppercase text-amber-400 text-xxs tracking-wider">PENDÊNCIAS ESTATUTÁRIAS ({comp.score}/18)</span>
                  </div>
                );
              })()}

              {/* ASYNC CACHE & INTEGRITY STATUS BANNER */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2 sm:p-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] sm:text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300 flex-wrap">
                  {isLoadingDeps ? (
                    <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Carregando...
                    </span>
                  ) : isFromCache ? (
                    <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                      <Zap className="h-3.5 w-3.5 text-cyan-400" /> Carregado via Cache de Jurisdição ('localStorage')
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Sincronizado (Dec. 184/17)
                    </span>
                  )}
                  {lastSyncTime && (
                    <span className="text-[9.5px] text-slate-500 font-sans border-l border-slate-750 pl-2">
                      Sincronizado às {lastSyncTime}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => loadStatutoryDependenciesAsync(activeDirectorate, true)}
                  disabled={isLoadingDeps}
                  className="text-[10px] bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-400 border border-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1 transition cursor-pointer disabled:opacity-50 shrink-0"
                  title="Atualizar chave de cache do localStorage e recarregar dependências"
                >
                  <RefreshCw className={`h-3 w-3 ${isLoadingDeps ? "animate-spin" : ""}`} />
                  Recarregar Assincronamente
                </button>
              </div>

              {/* STATUTORY CATEGORIES TABS SWITCHER */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-850">
                <button
                  onClick={() => setActiveCategoryTab("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeCategoryTab === "ALL"
                      ? "bg-amber-500 text-slate-950 font-black shadow-md"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <FolderTree className="h-3.5 w-3.5" />
                  Todas ({activeDirectorateChildren.length})
                </button>

                <button
                  onClick={() => setActiveCategoryTab("CAT_1")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeCategoryTab === "CAT_1"
                      ? "bg-purple-500 text-slate-950 font-black shadow-md"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  I - Administratives / Apoio ({cat1Units.length})
                </button>

                <button
                  onClick={() => setActiveCategoryTab("CAT_2")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeCategoryTab === "CAT_2"
                      ? "bg-blue-500 text-slate-950 font-black shadow-md"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  II - Executivas / Operacionais ({cat2Units.length})
                </button>

                <button
                  onClick={() => setActiveCategoryTab("CAT_3")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeCategoryTab === "CAT_3"
                      ? "bg-emerald-500 text-slate-950 font-black shadow-md"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  III - Apoio Instrumental ({cat3Units.length})
                </button>

                <button
                  onClick={() => setActiveCategoryTab("CAT_4")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeCategoryTab === "CAT_4"
                      ? "bg-amber-600 text-slate-950 font-black shadow-md"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Building className="h-3.5 w-3.5" />
                  IV - Cadeias ({cat4Units.length})
                </button>

                <button
                  onClick={() => setActiveCategoryTab("TREE")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeCategoryTab === "TREE"
                      ? "bg-slate-200 text-slate-950 font-black shadow-md"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Network className="h-3.5 w-3.5" />
                  Visão em Árvore
                </button>

                <button
                  onClick={() => setActiveCategoryTab("SUBORDINATION")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeCategoryTab === "SUBORDINATION"
                      ? "bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400/50"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <GitFork className="h-3.5 w-3.5 text-indigo-300" />
                  Subordinação Hierárquica
                  <span className="bg-indigo-950 text-indigo-300 border border-indigo-700/50 text-[9px] px-1.5 py-0.2 rounded-full font-sans font-semibold">
                    DG
                  </span>
                </button>

                <button
                  onClick={() => setActiveCategoryTab("LEVELS_CONFIG")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    activeCategoryTab === "LEVELS_CONFIG"
                      ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30 ring-1 ring-amber-400"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Workflow className="h-3.5 w-3.5" />
                  Níveis da Árvore (DG • Província • EP • Órgão)
                  <span className="bg-amber-950 text-amber-300 border border-amber-700/50 text-[9px] px-1.5 py-0.2 rounded-full font-sans font-semibold">
                    Dinâmico (L1-L4)
                  </span>
                </button>
              </div>

              {/* DISPLAY GRID OF DEPENDENCIES WITH FUNCTIONAL RESPONSIBILITIES */}
              {activeCategoryTab === "LEVELS_CONFIG" ? (
                <div className="flex flex-col gap-5">
                  {/* Dynamic 4-Tier Funnel Pipeline Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {(["L1_DG", "L2_PROV", "L3_EP", "L4_ORGAO"] as AdministrativeTreeLevel[]).map((lvlKey) => {
                      const meta = levelDefinitions[lvlKey];
                      const unitsInLevel = levelUnitsSummary[lvlKey];
                      const IconComp = meta.icon;
                      const isSelected = selectedTreeLevelFilter === lvlKey;

                      return (
                        <div
                          key={lvlKey}
                          onClick={() => setSelectedTreeLevelFilter(prev => prev === lvlKey ? "ALL" : lvlKey)}
                          className={`rounded-2xl border p-4 transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                            isSelected
                              ? `${meta.badgeBg} ${meta.badgeBorder} shadow-lg ring-2 ring-${meta.colorName}-500/60`
                              : "bg-slate-950/80 border-slate-850 hover:border-slate-750 hover:bg-slate-900/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-xl border ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}>
                                <IconComp className="h-4 w-4" />
                              </div>
                              <span className={`text-[11px] font-mono font-black uppercase tracking-wider ${meta.badgeText}`}>
                                NÍVEL {meta.num}
                              </span>
                            </div>
                            <span className={`text-xl font-mono font-black ${isSelected ? meta.badgeText : "text-slate-100"}`}>
                              {unitsInLevel.length}
                            </span>
                          </div>

                          <div className="mt-3">
                            <h4 className="text-xs font-bold text-slate-100 font-mono">
                              {meta.shortLabel}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-sans mt-1 line-clamp-2 leading-relaxed">
                              {meta.description}
                            </p>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-850/80 flex items-center justify-between gap-1.5">
                            <span className="text-[9px] font-mono text-slate-500 uppercase truncate">
                              {meta.scope}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditLevelDefinition(lvlKey);
                                }}
                                className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md border border-slate-800 bg-slate-900 text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition cursor-pointer flex items-center gap-0.5"
                                title={`Editar definição e escopo do Nível ${meta.num}`}
                              >
                                <Settings2 className="h-2.5 w-2.5" /> Definição
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenCreateLevelModal(lvlKey);
                                }}
                                className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-md border transition cursor-pointer flex items-center gap-1 ${
                                  meta.badgeBg
                                } ${meta.badgeBorder} ${meta.badgeText} hover:brightness-125`}
                                title={`Criar nova unidade no Nível ${meta.num}`}
                              >
                                <Plus className="h-3 w-3" /> Adicionar
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Structural Integrity & Blueprint Action Bar */}
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col gap-3.5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                          hierarchyIntegrityStats.isHealthy 
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}>
                          {hierarchyIntegrityStats.isHealthy ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold font-mono text-slate-100 uppercase tracking-wide">
                              Integridade da Árvore Administrativa ({organizationalUnits.length} Unidades)
                            </h4>
                            {hierarchyIntegrityStats.isHealthy ? (
                              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                                Árvore Consistente & Regulamentar
                              </span>
                            ) : (
                              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                                {hierarchyIntegrityStats.orphanedCount} Inconsistências Detectadas
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                            Estrutura hierárquica dinâmica em 4 escalões (DGSP ➔ Direcção Provincial ➔ Estabelecimento Penitenciário ➔ Órgão/Secção) conforme o Decreto Presidencial n.º 184/17.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsNrepAuditModalOpen(true)}
                          className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                            hierarchyIntegrityStats.isHealthy
                              ? "bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border-emerald-500/40"
                              : "bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 border-amber-500/50 animate-pulse"
                          }`}
                          title="Abrir auditoria minuciosa das regras orgânicas NREP-AO (Dec. 184/17)"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                          Auditoria NREP-AO
                          {nrepTreeValidationReport.issues.length > 0 && (
                            <span className="bg-amber-500 text-slate-950 text-[9.5px] font-black px-1.5 py-0.2 rounded-full">
                              {nrepTreeValidationReport.issues.length}
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDefFormLabel(levelDefinitions[selectedTreeLevelFilter !== "ALL" ? selectedTreeLevelFilter : "L1_DG"].label);
                            setDefFormShortLabel(levelDefinitions[selectedTreeLevelFilter !== "ALL" ? selectedTreeLevelFilter : "L1_DG"].shortLabel);
                            setDefFormScope(levelDefinitions[selectedTreeLevelFilter !== "ALL" ? selectedTreeLevelFilter : "L1_DG"].scope);
                            setDefFormDescription(levelDefinitions[selectedTreeLevelFilter !== "ALL" ? selectedTreeLevelFilter : "L1_DG"].description);
                            setEditingLevelDefKey(selectedTreeLevelFilter !== "ALL" ? selectedTreeLevelFilter : "L1_DG");
                            setIsLevelDefinitionsModalOpen(true);
                          }}
                          className="text-xs font-mono font-bold bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-amber-400 border border-slate-800 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                          title="Configurar nomes e definições de níveis da árvore"
                        >
                          <Settings2 className="h-3.5 w-3.5 text-amber-400" />
                          Definições dos Níveis
                        </button>

                        <button
                          type="button"
                          onClick={handleAutoReconcileLevels}
                          className="text-xs font-mono font-bold bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-amber-400 border border-slate-800 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                          title="Verificar e reconciliar ponteiros hierárquicos"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Reconciliar Árvore
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setBlueprintTargetProvince(isNational ? selectedProvinceFilter : operatorProvince);
                            setIsBranchBlueprintModalOpen(true);
                          }}
                          className="text-xs font-mono font-black bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 px-3.5 py-1.5 rounded-xl shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          Gerar Ramo 4-Níveis
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenCreateLevelModal("L4_ORGAO")}
                          className="text-xs font-mono font-bold bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-1.5 rounded-xl shadow-md shadow-purple-600/20 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Nova Unidade Dinâmica
                        </button>
                      </div>
                    </div>

                    {/* Rule Status Badges Ribbon */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-900">
                      <div 
                        onClick={() => {
                          setSelectedAuditFilter("INVALID_LEVEL_SEQUENCE");
                          setIsNrepAuditModalOpen(true);
                        }}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          nrepTreeValidationReport.ruleMetrics.sequenceRulePassed
                            ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400 hover:border-emerald-700"
                            : "bg-rose-950/20 border-rose-900/40 text-rose-300 hover:border-rose-700"
                        }`}
                      >
                        <span className="text-[10px] font-mono font-semibold">1. Sequência L1➔L2➔L3➔L4</span>
                        {nrepTreeValidationReport.ruleMetrics.sequenceRulePassed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <span className="text-[9px] font-mono font-black bg-rose-500 text-slate-950 px-1.5 rounded">
                            {nrepTreeValidationReport.sequenceViolations.length}
                          </span>
                        )}
                      </div>

                      <div 
                        onClick={() => {
                          setSelectedAuditFilter("ORPHAN_NODE");
                          setIsNrepAuditModalOpen(true);
                        }}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          nrepTreeValidationReport.ruleMetrics.orphanRulePassed
                            ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400 hover:border-emerald-700"
                            : "bg-rose-950/20 border-rose-900/40 text-rose-300 hover:border-rose-700"
                        }`}
                      >
                        <span className="text-[10px] font-mono font-semibold">2. Zero Nós Órfãos</span>
                        {nrepTreeValidationReport.ruleMetrics.orphanRulePassed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <span className="text-[9px] font-mono font-black bg-rose-500 text-slate-950 px-1.5 rounded">
                            {nrepTreeValidationReport.orphanedNodes.length}
                          </span>
                        )}
                      </div>

                      <div 
                        onClick={() => {
                          setSelectedAuditFilter("TERRITORIAL_MISMATCH");
                          setIsNrepAuditModalOpen(true);
                        }}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          nrepTreeValidationReport.ruleMetrics.territoryRulePassed
                            ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400 hover:border-emerald-700"
                            : "bg-amber-950/20 border-amber-900/40 text-amber-300 hover:border-amber-700"
                        }`}
                      >
                        <span className="text-[10px] font-mono font-semibold">3. Âmbito Territorial</span>
                        {nrepTreeValidationReport.ruleMetrics.territoryRulePassed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <span className="text-[9px] font-mono font-black bg-amber-500 text-slate-950 px-1.5 rounded">
                            {nrepTreeValidationReport.territorialAnomalies.length}
                          </span>
                        )}
                      </div>

                      <div 
                        onClick={() => {
                          setSelectedAuditFilter("CIRCULAR_DEPENDENCY");
                          setIsNrepAuditModalOpen(true);
                        }}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          nrepTreeValidationReport.ruleMetrics.acyclicRulePassed
                            ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400 hover:border-emerald-700"
                            : "bg-rose-950/20 border-rose-900/40 text-rose-300 hover:border-rose-700"
                        }`}
                      >
                        <span className="text-[10px] font-mono font-semibold">4. Aciclicidade da Árvore</span>
                        {nrepTreeValidationReport.ruleMetrics.acyclicRulePassed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <span className="text-[9px] font-mono font-black bg-rose-500 text-slate-950 px-1.5 rounded">
                            {nrepTreeValidationReport.circularLoops.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Filter & Search Toolbar */}
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-3.5 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-[280px]">
                      {/* Search */}
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Filtrar por nome, sigla, titular ou base legal..."
                          value={levelSearchQuery}
                          onChange={(e) => setLevelSearchQuery(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>

                      {/* Level Quick Tabs */}
                      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedTreeLevelFilter("ALL")}
                          className={`text-[10px] font-mono px-2 py-1 rounded font-bold transition cursor-pointer whitespace-nowrap ${
                            selectedTreeLevelFilter === "ALL"
                              ? "bg-amber-500 text-slate-950"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Todos ({organizationalUnits.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTreeLevelFilter("L1_DG")}
                          className={`text-[10px] font-mono px-2 py-1 rounded font-bold transition cursor-pointer whitespace-nowrap ${
                            selectedTreeLevelFilter === "L1_DG"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          L1: DG ({levelUnitsSummary.L1_DG.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTreeLevelFilter("L2_PROV")}
                          className={`text-[10px] font-mono px-2 py-1 rounded font-bold transition cursor-pointer whitespace-nowrap ${
                            selectedTreeLevelFilter === "L2_PROV"
                              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          L2: Província ({levelUnitsSummary.L2_PROV.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTreeLevelFilter("L3_EP")}
                          className={`text-[10px] font-mono px-2 py-1 rounded font-bold transition cursor-pointer whitespace-nowrap ${
                            selectedTreeLevelFilter === "L3_EP"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          L3: EP / Cadeia ({levelUnitsSummary.L3_EP.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTreeLevelFilter("L4_ORGAO")}
                          className={`text-[10px] font-mono px-2 py-1 rounded font-bold transition cursor-pointer whitespace-nowrap ${
                            selectedTreeLevelFilter === "L4_ORGAO"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          L4: Órgão / Secção ({levelUnitsSummary.L4_ORGAO.length})
                        </button>
                      </div>

                      {/* Province Filter */}
                      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Província:</span>
                        <select
                          value={levelProvinceFilter}
                          onChange={(e) => setLevelProvinceFilter(e.target.value)}
                          className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none cursor-pointer"
                        >
                          <option value="ALL">Todas as Províncias</option>
                          {ALL_PROVINCES_LIST.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* High Density Level Units List */}
                  <div className="grid grid-cols-1 gap-3">
                    {organizationalUnits
                      .filter(unit => {
                        const lvl = getUnitTreeLevel(unit);
                        if (selectedTreeLevelFilter !== "ALL" && lvl !== selectedTreeLevelFilter) return false;

                        if (levelProvinceFilter !== "ALL") {
                          if (unit.province?.toLowerCase().trim() !== levelProvinceFilter.toLowerCase().trim()) return false;
                        }

                        if (levelSearchQuery.trim()) {
                          const q = levelSearchQuery.toLowerCase();
                          const matchesName = unit.name.toLowerCase().includes(q);
                          const matchesCode = unit.code?.toLowerCase().includes(q) || unit.sigla?.toLowerCase().includes(q);
                          const matchesHead = unit.headOfficerName?.toLowerCase().includes(q);
                          const matchesBasis = unit.legalBasis?.toLowerCase().includes(q);
                          if (!matchesName && !matchesCode && !matchesHead && !matchesBasis) return false;
                        }

                        return true;
                      })
                      .map(unit => {
                        const lvlKey = getUnitTreeLevel(unit);
                        const meta = levelDefinitions[lvlKey];
                        const IconComp = meta.icon;
                        const parentUnit = organizationalUnits.find(p => p.id === unit.parentId);
                        const ancestorPath = getAncestorPath(unit);
                        const children = getChildren(unit.id);

                        return (
                          <div
                            key={unit.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-950/80 border-slate-850 hover:border-slate-750`}
                          >
                            {/* Unit Core Details */}
                            <div className="flex items-start gap-3.5 flex-1 min-w-0">
                              <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}>
                                <IconComp className="h-5 w-5" />
                              </div>

                              <div className="flex flex-col gap-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[9.5px] font-mono font-black px-2 py-0.5 rounded-full border ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}>
                                    NÍVEL {unit.hierarchyLevel || meta.num} • {unit.levelLabel || meta.shortLabel}
                                  </span>

                                  <span className="text-xs font-bold font-mono text-slate-100 truncate">
                                    {unit.name}
                                  </span>

                                  {unit.code && (
                                    <span className="bg-slate-900 border border-slate-800 text-amber-400 text-[9px] font-mono px-1.5 py-0.2 rounded">
                                      {unit.code}
                                    </span>
                                  )}

                                  {unit.province && (
                                    <span className="bg-slate-900 border border-slate-800 text-blue-300 text-[9px] font-mono px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                      <MapPin className="h-2.5 w-2.5" /> {unit.province}
                                    </span>
                                  )}

                                  {children.length > 0 && (
                                    <span className="bg-purple-950/40 border border-purple-800/40 text-purple-300 text-[9px] font-mono px-1.5 py-0.2 rounded">
                                      {children.length} dependência(s)
                                    </span>
                                  )}
                                </div>

                                {/* Ancestor Breadcrumb Path */}
                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 flex-wrap mt-0.5">
                                  <span className="text-slate-500 uppercase font-bold">Cadeia:</span>
                                  {ancestorPath.map((anc, idx) => (
                                    <React.Fragment key={anc.id}>
                                      <span className={idx === ancestorPath.length - 1 ? meta.badgeText + " font-bold" : "text-slate-300 hover:text-slate-100"}>
                                        {anc.code || anc.name.substring(0, 24)}
                                      </span>
                                      {idx < ancestorPath.length - 1 && (
                                        <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />
                                      )}
                                    </React.Fragment>
                                  ))}
                                </div>

                                {/* Officer and Legal Basis */}
                                <div className="flex items-center gap-3 text-[10px] font-sans text-slate-400 flex-wrap mt-1">
                                  {unit.headOfficerName && (
                                    <span className="flex items-center gap-1 text-slate-300 font-mono">
                                      <UserCheck className="h-3 w-3 text-amber-400" />
                                      {unit.headOfficerName}
                                      {unit.chiefOfficerRank && <span className="text-slate-500">({unit.chiefOfficerRank})</span>}
                                    </span>
                                  )}
                                  {unit.legalBasis && (
                                    <span className="flex items-center gap-1 text-slate-500 font-mono">
                                      <Scale className="h-3 w-3 text-slate-600" />
                                      {unit.legalBasis}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 shrink-0 self-end lg:self-center flex-wrap">
                              {/* Quick Promote / Demote Buttons */}
                              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                                <button
                                  type="button"
                                  onClick={() => handlePromoteUnit(unit)}
                                  disabled={lvlKey === "L1_DG"}
                                  className={`p-1 rounded transition ${
                                    lvlKey === "L1_DG" 
                                      ? "text-slate-600 cursor-not-allowed" 
                                      : "text-slate-400 hover:text-amber-400 hover:bg-slate-800 cursor-pointer"
                                  }`}
                                  title={lvlKey === "L1_DG" ? "Já no nível máximo (L1)" : "Promover nível administrativo (ex: L4➔L3, L3➔L2, L2➔L1)"}
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDemoteUnit(unit)}
                                  disabled={lvlKey === "L4_ORGAO"}
                                  className={`p-1 rounded transition ${
                                    lvlKey === "L4_ORGAO" 
                                      ? "text-slate-600 cursor-not-allowed" 
                                      : "text-slate-400 hover:text-purple-400 hover:bg-slate-800 cursor-pointer"
                                  }`}
                                  title={lvlKey === "L4_ORGAO" ? "Já no nível base (L4)" : "Despromover nível administrativo (ex: L1➔L2, L2➔L3, L3➔L4)"}
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedUnitForChain(unit);
                                  setIsLevelChainModalOpen(true);
                                }}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                                title="Inspecionar cadeia hierárquica e subordinações"
                              >
                                <Workflow className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Cadeia</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenLevelReassign(unit)}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-blue-400 border border-slate-800 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                                title="Reclassificar nível administrativo ou superior hierárquico"
                              >
                                <Split className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Nível / Superior</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenRespInspector(unit)}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-800 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer"
                                title="Atribuições e responsabilidades operativas"
                              >
                                <FileText className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Atribuições</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenEditLevelUnit(unit)}
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-blue-400 border border-slate-800 rounded-lg transition cursor-pointer"
                                title="Editar dados da unidade"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteUnit(unit.id, unit.name)}
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg transition cursor-pointer"
                                title="Excluir unidade"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : activeCategoryTab === "SUBORDINATION" ? (
                <div className="flex flex-col gap-5">
                  {/* Banner Notice */}
                  <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="flex items-start gap-3.5 z-10">
                      <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400 shrink-0 mt-0.5">
                        <GitFork className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-slate-100 font-mono uppercase tracking-wide">
                            Matriz de Subordinação Hierárquica e Vínculos Territoriais
                          </h3>
                          <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full">
                            Competência Exclusiva: Director Geral
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-sans mt-1 max-w-3xl leading-relaxed">
                          Configure as relações formais de dependência hierárquica entre Unidades Orgânicas e Estabelecimentos Penitenciários (Cadeias).
                          <strong className="text-amber-400 block mt-0.5 font-mono">
                            ⚠️ Regra do Decreto Presidencial n.º 184/17: Uma cadeia de determinada província só pode estar subordinada a unidades dessa mesma província ou directamente à Direção Geral.
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Filter & Search Toolbar */}
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-3.5 flex flex-wrap justify-between items-center gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-[280px]">
                      {/* Search */}
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Pesquisar unidade, cadeia ou código..."
                          value={subSearchQuery}
                          onChange={(e) => setSubSearchQuery(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>

                      {/* Province Filter */}
                      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Província:</span>
                        <select
                          value={subProvinceFilter}
                          onChange={(e) => setSubProvinceFilter(e.target.value)}
                          className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none cursor-pointer"
                        >
                          <option value="ALL">Todas as Províncias</option>
                          {ALL_PROVINCES_LIST.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>

                      {/* Type Filter */}
                      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Tipo:</span>
                        <select
                          value={subTypeFilter}
                          onChange={(e) => setSubTypeFilter(e.target.value)}
                          className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none cursor-pointer"
                        >
                          <option value="ALL">Todos os Tipos</option>
                          <option value="CADEIAS">Apenas Cadeias / EP</option>
                          <option value="DEPARTAMENTOS">Apenas Departamentos</option>
                          <option value="GABINETES">Apenas Gabinetes / Conselhos</option>
                        </select>
                      </div>
                    </div>

                    {/* Summary Badges */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                        Unidades Mapeadas: <strong className="text-indigo-400 font-bold">{organizationalUnits.length}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Subordination Items Grid / Table */}
                  <div className="grid grid-cols-1 gap-3">
                    {organizationalUnits
                      .filter(u => {
                        if (subSearchQuery.trim()) {
                          const q = subSearchQuery.toLowerCase();
                          const matchesName = u.name.toLowerCase().includes(q);
                          const matchesCode = u.code?.toLowerCase().includes(q);
                          if (!matchesName && !matchesCode) return false;
                        }
                        if (subProvinceFilter !== "ALL") {
                          if (u.province?.toLowerCase().trim() !== subProvinceFilter.toLowerCase().trim()) return false;
                        }
                        if (subTypeFilter === "CADEIAS") {
                          if (u.divisionType !== "ESTAB_PENITENCIARIO" && u.level !== TerritorialScope.ESTABLISHMENT && !u.category?.startsWith("IV")) return false;
                        } else if (subTypeFilter === "DEPARTAMENTOS") {
                          if (u.divisionType !== "DEPARTAMENTO") return false;
                        } else if (subTypeFilter === "GABINETES") {
                          if (u.divisionType !== "GABINETE" && u.divisionType !== "CONSELHO") return false;
                        }
                        return true;
                      })
                      .map(unit => {
                        const parentUnit = organizationalUnits.find(p => p.id === unit.parentId);
                        const validation = validateSubordination(unit, unit.parentId || "OU-MININT-DG");
                        const isPrison = unit.divisionType === "ESTAB_PENITENCIARIO" || unit.level === TerritorialScope.ESTABLISHMENT || unit.category?.startsWith("IV");

                        return (
                          <div
                            key={unit.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                              !validation.valid
                                ? "bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/30"
                                : isPrison
                                ? "bg-amber-950/10 border-amber-500/30 hover:border-amber-500/50"
                                : "bg-slate-950/80 border-slate-850 hover:border-slate-750"
                            }`}
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                                isPrison ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                              }`}>
                                {isPrison ? <Building className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                              </div>

                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold font-mono text-slate-100">
                                    {unit.name}
                                  </span>
                                  {unit.code && (
                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                                      {unit.code}
                                    </span>
                                  )}
                                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                    isPrison ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-slate-850 text-slate-300 border-slate-750"
                                  }`}>
                                    {isPrison ? "ESTABELECIMENTO PENITENCIÁRIO" : unit.divisionType || "UNIDADE"}
                                  </span>
                                  <span className="text-[9px] font-mono text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <MapPin className="h-2.5 w-2.5 text-amber-400" /> {unit.province || "Angola"}
                                  </span>
                                </div>

                                {/* Subordination Relationship line */}
                                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                                  <span className="text-slate-500 text-[11px]">Subordinado a:</span>
                                  <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-200">
                                    <ArrowRight className="h-3 w-3 text-indigo-400 shrink-0" />
                                    <span className="font-bold text-slate-100">
                                      {parentUnit ? parentUnit.name : "Direção Geral do Serviço Penitenciário"}
                                    </span>
                                    {parentUnit?.province && (
                                      <span className="text-[9px] text-slate-400 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-850">
                                        {parentUnit.province}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Status & Action */}
                            <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                              {validation.valid ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  {validation.isNationalParent ? "Direção Geral" : "Mesma Província (Conforme)"}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse">
                                  <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                                  Violação Territorial
                                </span>
                              )}

                              {isNational ? (
                                <button
                                  onClick={() => {
                                    setTargetSubUnit(unit);
                                    setNewParentUnitId(unit.parentId || "OU-MININT-DG");
                                    setIsSubordinationModalOpen(true);
                                  }}
                                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer transition"
                                >
                                  <GitFork className="h-3.5 w-3.5" />
                                  Alterar Superior
                                </button>
                              ) : (
                                <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-850 px-2 py-1 rounded-lg flex items-center gap-1">
                                  <Lock className="h-3 w-3" /> Apenas DG
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : activeCategoryTab !== "TREE" ? (
                <div className="flex flex-col gap-4">
                  
                  {/* Category Filter Rendering */}
                  {activeDirectorateChildren.length === 0 ? (
                    <div className="p-8 border border-dashed border-slate-850 rounded-2xl text-center text-xs font-mono text-slate-500 flex flex-col items-center gap-3">
                      <FolderTree className="h-8 w-8 text-slate-700" />
                      <span>Nenhuma dependência regulamentar encontrada para a Direção Provincial de {activeDirectorate.province}.</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePurgeAndRedesignStatutoryUnits(activeDirectorate)}
                          className="bg-rose-500/20 text-rose-300 font-mono text-xs font-bold px-4 py-2 rounded-xl border border-rose-500/40"
                        >
                          Anular & Redesenhar Estrutura Legal (184/17)
                        </button>
                        <button
                          onClick={() => handleAutoConformDirectorate(activeDirectorate)}
                          className="bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold px-4 py-2 rounded-xl border border-emerald-500/40"
                        >
                          Auto-Conformar
                        </button>
                      </div>
                    </div>
                  ) : activeCategoryTab === "ALL" ? (
                    /* 100% COLLAPSIBLE CATEGORY ACCORDIONS */
                    <div className="flex flex-col gap-4">
                      
                      {/* Accordion Controls Bar */}
                      <div className="flex justify-between items-center bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-850">
                        <span className="text-[11px] font-mono text-slate-400 font-bold flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-amber-500" />
                          Estrutura Orgânica por Categorias Estatutárias (Recolhível)
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleAllCategoryBlocks(true)}
                            className="text-[10px] font-mono text-slate-400 hover:text-amber-300 hover:underline cursor-pointer"
                          >
                            Expandir Todos
                          </button>
                          <span className="text-slate-700">|</span>
                          <button
                            onClick={() => toggleAllCategoryBlocks(false)}
                            className="text-[10px] font-mono text-slate-400 hover:text-amber-300 hover:underline cursor-pointer"
                          >
                            Recolher Todos
                          </button>
                        </div>
                      </div>

                      {[
                        { key: "CAT_1", title: "I - DEPENDÊNCIAS DE APOIO TÉCNICO E ADMINISTRATIVO", units: cat1Units, color: "purple", icon: Briefcase },
                        { key: "CAT_2", title: "II - DEPENDÊNCIAS EXECUTIVAS E OPERACIONAIS NÃO-CARCERÁRIAS (DEPARTAMENTOS)", units: cat2Units, color: "blue", icon: Shield },
                        { key: "CAT_3", title: "III - DEPENDÊNCIAS DE APOIO INSTRUMENTAL", units: cat3Units, color: "emerald", icon: Users },
                        { key: "CAT_4", title: "IV - UNIDADES EXECUTIVAS CARCERÁRIAS (ESTABELECIMENTOS PENITENCIÁRIOS / CADEIAS)", units: cat4Units, color: "amber", icon: Building },
                      ].map((section) => {
                        const isExpanded = expandedCategoryBlocks[section.key] !== false;
                        const SectionIcon = section.icon;

                        return (
                          <div key={section.key} className="flex flex-col rounded-2xl border border-slate-850 bg-slate-950/60 overflow-hidden transition-all">
                            {/* Section Header Accordion Toggle */}
                            <div
                              onClick={() => toggleCategoryBlock(section.key)}
                              className={`p-3.5 flex items-center justify-between cursor-pointer transition-all border-b ${
                                isExpanded ? "border-slate-850 bg-slate-900/70" : "border-transparent hover:bg-slate-900/40"
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`p-1.5 rounded-lg bg-${section.color}-500/10 border border-${section.color}-500/30`}>
                                  <SectionIcon className={`h-4 w-4 text-${section.color}-400`} />
                                </div>
                                <span className="text-xs font-mono font-bold text-slate-200">
                                  {section.title}
                                </span>
                                <span className="bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  {section.units.length} {section.units.length === 1 ? 'dependência' : 'dependências'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-500 uppercase">
                                  {isExpanded ? "Recolher" : "Expandir"}
                                </span>
                                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}`} />
                              </div>
                            </div>

                            {/* Section Content - COMPACT HIGH DENSITY TABLE */}
                            {isExpanded && (
                              <div className="overflow-x-auto bg-slate-950/80">
                                {section.units.length === 0 ? (
                                  <div className="p-3 text-center text-xs font-mono text-slate-500 italic">
                                    Nenhuma unidade registada nesta categoria.
                                  </div>
                                ) : (
                                  <table className="w-full text-left text-xs font-mono border-collapse">
                                    <thead>
                                      <tr className="border-b border-slate-850 bg-slate-900/50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                        <th className="py-2 px-3">Cód / Unidade</th>
                                        <th className="py-2 px-3">Categoria</th>
                                        <th className="py-2 px-3">Responsável</th>
                                        <th className="py-2 px-3 text-right">Ações</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-850/60">
                                      {section.units.map((unit) => {
                                        const isCat1 = unit.category?.startsWith("I -") || unit.divisionType === "GABINETE";
                                        const isCat2 = unit.category?.startsWith("II -");
                                        const isCat3 = unit.category?.startsWith("III -") || unit.divisionType === "CONSELHO";
                                        const isCat4 = unit.divisionType === "ESTAB_PENITENCIARIO" || unit.level === TerritorialScope.ESTABLISHMENT;

                                        return (
                                          <tr key={unit.id} className="hover:bg-slate-900/60 transition">
                                            <td className="py-2 px-3 font-bold text-slate-100 flex items-center gap-2">
                                              {isCat1 && <Briefcase className="h-3.5 w-3.5 text-purple-400 shrink-0" />}
                                              {isCat2 && <Shield className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                                              {isCat3 && <Users className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                                              {isCat4 && <Building className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                                              {unit.code && (
                                                <span className="bg-slate-900 border border-slate-800 text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-bold">
                                                  {unit.code}
                                                </span>
                                              )}
                                              <span className="truncate max-w-[280px]">{unit.name}</span>
                                            </td>
                                            <td className="py-2 px-3 text-[10px]">
                                              <span className={`px-2 py-0.5 rounded font-bold ${
                                                isCat1 ? "bg-purple-950/40 text-purple-300 border border-purple-800/40"
                                                : isCat2 ? "bg-blue-950/40 text-blue-300 border border-blue-800/40"
                                                : isCat3 ? "bg-amber-950/40 text-amber-300 border border-amber-800/40"
                                                : "bg-emerald-950/40 text-emerald-300 border border-emerald-800/40"
                                              }`}>
                                                {unit.category || (isCat4 ? "IV - Cadeia" : "Dependência")}
                                              </span>
                                            </td>
                                            <td className="py-2 px-3 text-[11px] text-slate-300">
                                              {unit.headOfficerName || "A Nomear"}
                                            </td>
                                            <td className="py-2 px-3 text-right">
                                              <div className="flex items-center justify-end gap-1">
                                                <button
                                                  onClick={() => handleOpenRespInspector(unit)}
                                                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition"
                                                  title="Atribuições"
                                                >
                                                  <FileText className="h-3 w-3" />
                                                  Atribuições
                                                </button>
                                                <button
                                                  onClick={() => handleEditUnit(unit)}
                                                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded transition"
                                                  title="Editar"
                                                >
                                                  <Edit3 className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                  onClick={() => handleDeleteUnit(unit.id, unit.name)}
                                                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded transition"
                                                  title="Excluir"
                                                >
                                                  <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* FILTERED SINGLE CATEGORY VIEW - COMPACT TABLE */
                    <div className="overflow-x-auto bg-slate-950/80 rounded-xl border border-slate-850">
                      <table className="w-full text-left text-xs font-mono border-collapse">
                        <thead>
                          <tr className="border-b border-slate-850 bg-slate-900/50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-2 px-3">Cód / Unidade</th>
                            <th className="py-2 px-3">Categoria</th>
                            <th className="py-2 px-3">Responsável</th>
                            <th className="py-2 px-3 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850/60">
                          {(activeCategoryTab === "CAT_1" ? cat1Units
                            : activeCategoryTab === "CAT_2" ? cat2Units
                            : activeCategoryTab === "CAT_3" ? cat3Units
                            : cat4Units
                          ).map((unit) => {
                            const isCat1 = unit.category?.startsWith("I -") || unit.divisionType === "GABINETE";
                            const isCat2 = unit.category?.startsWith("II -");
                            const isCat3 = unit.category?.startsWith("III -") || unit.divisionType === "CONSELHO";
                            const isCat4 = unit.divisionType === "ESTAB_PENITENCIARIO" || unit.level === TerritorialScope.ESTABLISHMENT;

                            return (
                              <tr key={unit.id} className="hover:bg-slate-900/60 transition">
                                <td className="py-2 px-3 font-bold text-slate-100 flex items-center gap-2">
                                  {isCat1 && <Briefcase className="h-3.5 w-3.5 text-purple-400 shrink-0" />}
                                  {isCat2 && <Shield className="h-3.5 w-3.5 text-blue-400 shrink-0" />}
                                  {isCat3 && <Users className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                                  {isCat4 && <Building className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                                  {unit.code && (
                                    <span className="bg-slate-900 border border-slate-800 text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-bold">
                                      {unit.code}
                                    </span>
                                  )}
                                  <span className="truncate max-w-[280px]">{unit.name}</span>
                                </td>
                                <td className="py-2 px-3 text-[10px]">
                                  <span className={`px-2 py-0.5 rounded font-bold ${
                                    isCat1 ? "bg-purple-950/40 text-purple-300 border border-purple-800/40"
                                    : isCat2 ? "bg-blue-950/40 text-blue-300 border border-blue-800/40"
                                    : isCat3 ? "bg-amber-950/40 text-amber-300 border border-amber-800/40"
                                    : "bg-emerald-950/40 text-emerald-300 border border-emerald-800/40"
                                  }`}>
                                    {unit.category || (isCat4 ? "IV - Cadeia" : "Dependência")}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-[11px] text-slate-300">
                                  {unit.headOfficerName || "A Nomear"}
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => handleOpenRespInspector(unit)}
                                      className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition"
                                      title="Atribuições"
                                    >
                                      <FileText className="h-3 w-3" />
                                      Atribuições
                                    </button>
                                    <button
                                      onClick={() => handleEditUnit(unit)}
                                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded transition"
                                      title="Editar"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUnit(unit.id, unit.name)}
                                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded transition"
                                      title="Excluir"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              ) : (
                /* TREE DISPLAY VIEW */
                <div className="border border-slate-900 rounded-xl bg-slate-900/40 p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Network className="h-4 w-4 text-amber-400" /> Árvore Orgânica & Divisões Hierárquicas (100% Recolhível)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleAllTreeNodes(true)}
                        className="text-[10px] font-mono text-amber-400 hover:underline cursor-pointer"
                      >
                        Expandir Árvore
                      </button>
                      <span className="text-slate-700">|</span>
                      <button
                        type="button"
                        onClick={() => toggleAllTreeNodes(false)}
                        className="text-[10px] font-mono text-slate-400 hover:text-slate-200 hover:underline cursor-pointer"
                      >
                        Recolher Árvore
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* Root Node (Directorate) */}
                    <div className="flex flex-col gap-2">
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <button 
                            onClick={() => toggleNode(activeDirectorate.id)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 transition"
                          >
                            {expandedNodes[activeDirectorate.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                          <Building2 className="h-4 w-4 text-amber-400" />
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-100">{activeDirectorate.name}</span>
                            <span className="text-[9px] font-mono text-slate-500 block">ID: {activeDirectorate.id} • NIVEL: PROVINCIAL</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setParentUnitId(activeDirectorate.id);
                              resetForm();
                              setIsModalOpen(true);
                            }}
                            className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3 w-3 text-amber-400" /> + Sub-divisão
                          </button>
                        </div>
                      </div>

                      {/* Children Sub-Tree */}
                      {expandedNodes[activeDirectorate.id] && (
                        <div className="pl-6 border-l-2 border-slate-800/80 flex flex-col gap-2.5 ml-3 my-1">
                          {getChildren(activeDirectorate.id).length === 0 ? (
                            <div className="p-4 border border-dashed border-slate-850 rounded-lg text-center text-xs font-mono text-slate-500">
                              Nenhum sub-nível orgânico registado nesta Direção Provincial. Clique em "+ Sub-divisão" ou "Auto-Conformar".
                            </div>
                          ) : (
                            getChildren(activeDirectorate.id).map(child => (
                              <TreeNodeItem
                                key={child.id}
                                unit={child}
                                getChildren={getChildren}
                                expandedNodes={expandedNodes}
                                toggleNode={toggleNode}
                                onEdit={handleEditUnit}
                                onDelete={handleDeleteUnit}
                                onAddChild={(parentId) => {
                                  setParentUnitId(parentId);
                                  resetForm();
                                  setIsModalOpen(true);
                                }}
                                onAssociatePrison={(parentId) => {
                                  setTargetParentUnitId(parentId);
                                  setIsAssociateModalOpen(true);
                                }}
                                onOpenRespInspector={handleOpenRespInspector}
                                prisons={prisons}
                              />
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-12 text-center text-slate-500 font-mono text-xs">
              Selecione uma Direção Provincial na lista lateral.
            </div>
          )}

        </div>
      </div>

      {/* MODAL 1: FUNCTIONAL RESPONSIBILITIES INSPECTOR & EDITOR */}
      <AnimatePresence>
        {isRespInspectorOpen && selectedUnitForResp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl flex flex-col gap-5 my-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="border-b border-slate-900 pb-3 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                      {selectedUnitForResp.code || "REGULAMENTAR"}
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 font-mono uppercase">
                      {selectedUnitForResp.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    Definição de Responsabilidades Funcionais Administrativas e Operativas conforme Decreto Presidencial n.º 184/17.
                  </p>
                </div>
                <button 
                  onClick={() => setIsRespInspectorOpen(false)}
                  className="text-slate-500 hover:text-slate-200 text-xs font-mono px-2 py-1 rounded bg-slate-900 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs font-sans">
                
                {/* Org context header */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-500 font-mono block text-[9.5px] uppercase font-bold">Direção Mãe:</span>
                    <span className="text-slate-200 font-mono font-semibold">Direção Provincial de {selectedUnitForResp.province || selectedProvinceFilter}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-mono block text-[9.5px] uppercase font-bold">Base Legal:</span>
                    <span className="text-amber-400 font-mono font-semibold">{selectedUnitForResp.legalBasis || "Decreto Presidencial n.º 184/17, de 11 de Agosto"}</span>
                  </div>
                </div>

                {/* Chief Officer Section */}
                <div className="border border-slate-850 rounded-xl p-3.5 bg-slate-900/40 flex flex-col gap-3">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="h-4 w-4" /> Oficial Encarregado / Chefe de Serviço Nomeado
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                        Nome do Oficial:
                      </label>
                      <input
                        type="text"
                        value={respHeadNameInput}
                        onChange={(e) => setRespHeadNameInput(e.target.value)}
                        placeholder="Ex: Superintendente Prisional J. Silva"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                        Posto / Patente:
                      </label>
                      <input
                        type="text"
                        value={respHeadRankInput}
                        onChange={(e) => setRespHeadRankInput(e.target.value)}
                        placeholder="Ex: Superintendente Prisional"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                        Contacto Telefónico:
                      </label>
                      <input
                        type="text"
                        value={respHeadPhoneInput}
                        onChange={(e) => setRespHeadPhoneInput(e.target.value)}
                        placeholder="Ex: +244 923 000 184"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Administrative Responsibilities Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-purple-400" />
                    Responsabilidades e Atribuições Funcionais ADMINISTRATIVAS:
                  </label>
                  <textarea
                    rows={4}
                    value={respAdminInput}
                    onChange={(e) => setRespAdminInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-sans leading-relaxed"
                    placeholder="Descreva as funções técnicas, gestão do expediente, organização de arquivo, emissão de mapas e elaboração de relatórios..."
                  />
                </div>

                {/* Operational Responsibilities Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-blue-400" />
                    Responsabilidades e Atribuições Funcionais OPERATIVAS:
                  </label>
                  <textarea
                    rows={4}
                    value={respOperInput}
                    onChange={(e) => setRespOperInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-sans leading-relaxed"
                    placeholder="Descreva as funções operacionais, manutenção da ordem, rondas, escoltas judiciais, revistas de celas e intervenção de segurança..."
                  />
                </div>

                {/* Sub-sections linked */}
                <div className="border border-slate-850 rounded-xl p-3 bg-slate-900/30 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-300 block">Secções Subordinadas a esta Dependência:</span>
                    <span className="text-slate-500 text-[10px]">
                      {getChildren(selectedUnitForResp.id).length} secção(ões) registada(s).
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setIsRespInspectorOpen(false);
                      setParentUnitId(selectedUnitForResp.id);
                      resetForm();
                      setIsModalOpen(true);
                    }}
                    className="bg-slate-800 hover:bg-slate-750 text-amber-400 text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
                  >
                    + Criar Secção Subordinada
                  </button>
                </div>

                {/* Footer buttons */}
                <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => triggerToast("FICHA IMPRESSA", `A ficha de atribuições orgânicas de ${selectedUnitForResp.name} foi gerada para arquivo.`, "info")}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono font-bold px-3.5 py-2 rounded-xl border border-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="h-4 w-4 text-slate-400" /> Exportar Ficha
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRespInspectorOpen(false)}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono font-bold px-4 py-2 rounded-xl cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveResponsibilities}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black px-5 py-2 rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="h-4 w-4 stroke-[3]" />
                      Salvar Atribuições
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADD / EDIT SUB-UNIT */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-5"
            >
              <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono uppercase">
                    {editingUnitId ? "Editar Sub-Nível Orgânico" : "Novo Sub-Nível Orgânico"}
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Defina os parâmetros hierárquicos conforme o Decreto Presidencial n.º 184/17.
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-500 hover:text-slate-200 text-xs font-mono px-2 py-1 rounded bg-slate-900 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveSubUnit} className="flex flex-col gap-4 text-xs font-sans">
                
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                    Unidade Superior (Pai na Árvore):
                  </label>
                  <select
                    value={parentUnitId}
                    onChange={(e) => setParentUnitId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    {organizationalUnits
                      .filter(u => isNational || u.province?.toLowerCase().trim() === operatorProvince.toLowerCase().trim())
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.level === TerritorialScope.NATIONAL ? "🏢 [DG]" : u.level === TerritorialScope.PROVINCIAL ? "📍 [PROVINCIAL]" : "🔹 [SUB-DIVISÃO]"} {u.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                      Tipo de Divisão:
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    >
                      <option value="DEPARTAMENTO">DEPARTAMENTO</option>
                      <option value="SECCAO">SECÇÃO</option>
                      <option value="REPARTICAO">REPARTIÇÃO</option>
                      <option value="GABINETE">GABINETE</option>
                      <option value="CONSELHO">CONSELHO</option>
                      <option value="ESTAB_PENITENCIARIO">ESTABELECIMENTO PENITENCIÁRIO</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                      Código / Sigla:
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: DSPP-HUA"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                    Designação da Divisão:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Departamento de Segurança Penitenciária Provincial"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                    Base Legal:
                  </label>
                  <input
                    type="text"
                    value={formLegalBasis}
                    onChange={(e) => setFormLegalBasis(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                    Chefe / Responsável Nomeado:
                  </label>
                  <input
                    type="text"
                    placeholder="Nome do Oficial Responsável"
                    value={formHeadOfficer}
                    onChange={(e) => setFormHeadOfficer(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-900 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black px-5 py-2 rounded-xl shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    {editingUnitId ? "Salvar Alterações" : "Criar Divisão"}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: ASSOCIATE PRISON TO DIRECTORATE */}
      <AnimatePresence>
        {isAssociateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-5"
            >
              <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono uppercase">
                    Associar Estabelecimento Penitenciário
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Vincule uma unidade de custódia à tutela hierárquica da Direção Provincial.
                  </p>
                </div>
                <button 
                  onClick={() => setIsAssociateModalOpen(false)}
                  className="text-slate-500 hover:text-slate-200 text-xs font-mono px-2 py-1 rounded bg-slate-900 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAssociatePrison} className="flex flex-col gap-4 text-xs font-sans">
                
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                    Unidade Tutelar (Direção ou Departamento):
                  </label>
                  <select
                    value={targetParentUnitId}
                    onChange={(e) => setTargetParentUnitId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    {organizationalUnits
                      .filter(u => isNational || u.province?.toLowerCase().trim() === operatorProvince.toLowerCase().trim())
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.province || 'Nacional'})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                    Estabelecimento Penitenciário:
                  </label>
                  <select
                    value={selectedPrisonIdToAssociate}
                    onChange={(e) => setSelectedPrisonIdToAssociate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    <option value="">-- Selecione o Estabelecimento --</option>
                    {prisons
                      .filter(p => {
                        const targetProv = activeDirectorate?.province || (isNational ? selectedProvinceFilter : operatorProvince);
                        if (!targetProv) return true;
                        return (p.location && p.location.toLowerCase().includes(targetProv.toLowerCase())) || (p.province && p.province.toLowerCase() === targetProv.toLowerCase());
                      })
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.location || 'Angola'})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-900 pt-4 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsAssociateModalOpen(false)}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-black px-5 py-2 rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    Vincular Unidade
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: SUBORDINATION REASSIGNMENT */}
      <AnimatePresence>
        {isSubordinationModalOpen && targetSubUnit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-6 w-full max-w-xl shadow-2xl flex flex-col gap-5 text-slate-100 font-sans"
            >
              <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
                    <GitFork className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wide">
                      Alterar Superior Hierárquico (Subordinação)
                    </h3>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      Definição do vínculo de comando segundo a regulamentação penitenciária (Decreto Presidencial 184/17).
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsSubordinationModalOpen(false);
                    setTargetSubUnit(null);
                  }}
                  className="text-slate-500 hover:text-slate-200 text-xs font-mono px-2 py-1 rounded bg-slate-900 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Target Unit Details Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Unidade Alvo:</span>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-bold font-mono text-amber-300">
                    {targetSubUnit.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-300 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-amber-400" /> Província: {targetSubUnit.province || "Angola"}
                  </span>
                </div>
              </div>

              {/* Parent Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase font-bold text-slate-300 block">
                  Selecione o Novo Superior Hierárquico:
                </label>
                <select
                  value={newParentUnitId}
                  onChange={(e) => setNewParentUnitId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                >
                  <option value="OU-MININT-DG">
                    🏛️ DIREÇÃO GERAL DO SERVIÇO PENITENCIÁRIO (NÍVEL NACIONAL)
                  </option>
                  {organizationalUnits
                    .filter(u => u.id !== targetSubUnit.id)
                    .map(u => {
                      const isSameProv = u.province?.toLowerCase().trim() === targetSubUnit.province?.toLowerCase().trim();
                      const isNat = u.level === TerritorialScope.NATIONAL || u.id === "OU-MININT-DG" || u.name.toLowerCase().includes("direção geral") || u.name.toLowerCase().includes("direcção geral");
                      const isValidOption = isSameProv || isNat;

                      return (
                        <option
                          key={u.id}
                          value={u.id}
                          disabled={!isValidOption}
                          className={!isValidOption ? "text-slate-600 bg-slate-950" : "text-slate-200"}
                        >
                          {isNat ? "🏛️ [NACIONAL - DG]" : isSameProv ? "📍 [MESMA PROVÍNCIA]" : "⛔ [OUTRA PROVÍNCIA - PROIBIDO]"} {u.name} ({u.province || "Nacional"})
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Real-time Validation Box */}
              {(() => {
                const val = validateSubordination(targetSubUnit, newParentUnitId);
                if (val.valid) {
                  return (
                    <div className="p-3.5 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold font-mono block text-emerald-200">
                          Vínculo Hierárquico Conforme e Aprovado
                        </span>
                        <span className="text-[11px] font-sans text-emerald-300/90 leading-tight block mt-0.5">
                          Esta subordinação respeita integralmente a regulamentação territorial e hierárquica.
                        </span>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-3.5 rounded-xl border bg-rose-500/20 border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5">
                      <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold font-mono block text-rose-300">
                          Erro de Validação Territorial
                        </span>
                        <span className="text-[11px] font-sans text-rose-200/90 leading-tight block mt-0.5">
                          {val.errorReason}
                        </span>
                      </div>
                    </div>
                  );
                }
              })()}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-900 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubordinationModalOpen(false);
                    setTargetSubUnit(null);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSaveSubordination}
                  disabled={!validateSubordination(targetSubUnit, newParentUnitId).valid}
                  className={`font-mono text-xs font-black px-5 py-2 rounded-xl shadow-lg transition flex items-center gap-1.5 ${
                    validateSubordination(targetSubUnit, newParentUnitId).valid
                      ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 cursor-pointer"
                      : "bg-slate-850 text-slate-600 border border-slate-800 cursor-not-allowed opacity-60"
                  }`}
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                  Homologar Subordinação
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL: DYNAMIC LEVEL UNIT CREATOR / EDITOR (L1 -> L4) */}
        {isCreateLevelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-2xl shadow-2xl flex flex-col gap-5 my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-850 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl border ${ADMINISTRATIVE_LEVEL_DEFINITIONS[selectedLevelToCreate].badgeBg} ${ADMINISTRATIVE_LEVEL_DEFINITIONS[selectedLevelToCreate].badgeBorder} ${ADMINISTRATIVE_LEVEL_DEFINITIONS[selectedLevelToCreate].badgeText}`}>
                    {React.createElement(ADMINISTRATIVE_LEVEL_DEFINITIONS[selectedLevelToCreate].icon, { className: "h-6 w-6" })}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-slate-100 font-mono uppercase">
                        {editingLevelUnitId ? "Editar Unidade Orgânica" : "Definir Nova Unidade Hierárquica"}
                      </h3>
                      <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border ${ADMINISTRATIVE_LEVEL_DEFINITIONS[selectedLevelToCreate].badgeBg} ${ADMINISTRATIVE_LEVEL_DEFINITIONS[selectedLevelToCreate].badgeBorder} ${ADMINISTRATIVE_LEVEL_DEFINITIONS[selectedLevelToCreate].badgeText}`}>
                        Nível {ADMINISTRATIVE_LEVEL_DEFINITIONS[selectedLevelToCreate].num}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      Configuração dinâmica da árvore administrativa conforme Decreto Presidencial n.º 184/17.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateLevelModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Level Selector Segment */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
                  Escalão / Nível da Árvore Administrativa:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["L1_DG", "L2_PROV", "L3_EP", "L4_ORGAO"] as AdministrativeTreeLevel[]).map((lvlKey) => {
                    const meta = ADMINISTRATIVE_LEVEL_DEFINITIONS[lvlKey];
                    const isSelected = selectedLevelToCreate === lvlKey;
                    return (
                      <button
                        key={lvlKey}
                        type="button"
                        onClick={() => setSelectedLevelToCreate(lvlKey)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col transition cursor-pointer ${
                          isSelected
                            ? `${meta.badgeBg} ${meta.badgeBorder} ring-2 ring-${meta.colorName}-500/50`
                            : "bg-slate-900 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <span className={`text-[10px] font-mono font-black ${isSelected ? meta.badgeText : "text-slate-400"}`}>
                          NÍVEL {meta.num}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-200 truncate mt-0.5">
                          {meta.shortLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSaveLevelUnit} className="flex flex-col gap-4">
                {/* Unit Name & Code */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      Designação Oficial da Unidade *
                    </label>
                    <input
                      type="text"
                      required
                      value={levelFormName}
                      onChange={(e) => setLevelFormName(e.target.value)}
                      placeholder="Ex: Secção de Controlo Penal e Registo Penitenciário"
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      Sigla / Código
                    </label>
                    <input
                      type="text"
                      value={levelFormCode}
                      onChange={(e) => setLevelFormCode(e.target.value)}
                      placeholder="Ex: SCP-HUA"
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-400 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Superior Hierárquico (Parent) & Province */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center justify-between">
                      <span>Superior Hierárquico Imediato (Pai) *</span>
                      <span className="text-[9px] text-amber-400 font-normal">Nível {Math.max(1, ADMINISTRATIVE_LEVEL_DEFINITIONS[selectedLevelToCreate].num - 1)}</span>
                    </label>
                    <select
                      value={levelFormParentId}
                      onChange={(e) => setLevelFormParentId(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {selectedLevelToCreate === "L1_DG" && (
                        <option value="OU-MININT-DG">Nenhum (Raiz Institucional DGSP / MININT)</option>
                      )}

                      {selectedLevelToCreate === "L2_PROV" && (
                        <option value="OU-MININT-DG">OU-MININT-DG - Direcção Geral dos Serviços Penitenciários</option>
                      )}

                      {(selectedLevelToCreate === "L3_EP" || selectedLevelToCreate === "L4_ORGAO") && (
                        <>
                          <optgroup label="Nível 1: Direcção Geral">
                            <option value="OU-MININT-DG">OU-MININT-DG - Direcção Geral dos Serviços Penitenciários</option>
                          </optgroup>
                          <optgroup label="Nível 2: Direcções Provinciais">
                            {provincialDirectorates.map(d => (
                              <option key={d.id} value={d.id}>{d.name} ({d.province})</option>
                            ))}
                          </optgroup>
                          {selectedLevelToCreate === "L4_ORGAO" && (
                            <optgroup label="Nível 3: Estabelecimentos Penitenciários">
                              {organizationalUnits.filter(u => getUnitTreeLevel(u) === "L3_EP").map(ep => (
                                <option key={ep.id} value={ep.id}>{ep.name} ({ep.province})</option>
                              ))}
                            </optgroup>
                          )}
                        </>
                      )}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      Província de Jurisdição Territorial *
                    </label>
                    <select
                      value={levelFormProvince}
                      onChange={(e) => setLevelFormProvince(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {ALL_PROVINCES_LIST.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Classification & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      Tipo de Divisão Orgânica
                    </label>
                    <select
                      value={levelFormDivisionType}
                      onChange={(e) => setLevelFormDivisionType(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="DIRECAO_NACIONAL">DIRECAO_NACIONAL (Central)</option>
                      <option value="DIRECAO_PROVINCIAL">DIRECAO_PROVINCIAL (Provincial)</option>
                      <option value="ESTAB_PENITENCIARIO">ESTAB_PENITENCIARIO (Cadeia / Prisão)</option>
                      <option value="DEPARTAMENTO">DEPARTAMENTO (Executivo)</option>
                      <option value="SECCAO">SECCAO (Sub-unidade)</option>
                      <option value="GABINETE">GABINETE (Apoio Directo)</option>
                      <option value="CONSELHO">CONSELHO (Órgão Colegial)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      Enquadramento Legal (Base Regulamentar)
                    </label>
                    <input
                      type="text"
                      value={levelFormLegalBasis}
                      onChange={(e) => setLevelFormLegalBasis(e.target.value)}
                      placeholder="Decreto Presidencial n.º 184/17, de 11 de Agosto"
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Head Officer Details */}
                <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-3.5 flex flex-col gap-3">
                  <span className="text-[10.5px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-amber-400" />
                    Titular / Chefia da Unidade
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono text-slate-500 uppercase">Nome do Titular</label>
                      <input
                        type="text"
                        value={levelFormHeadName}
                        onChange={(e) => setLevelFormHeadName(e.target.value)}
                        placeholder="Nome completo do oficial"
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono text-slate-500 uppercase">Posto / Patente</label>
                      <input
                        type="text"
                        value={levelFormHeadRank}
                        onChange={(e) => setLevelFormHeadRank(e.target.value)}
                        placeholder="Superintendente Prisional"
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono text-slate-500 uppercase">Contacto Oficial</label>
                      <input
                        type="text"
                        value={levelFormHeadPhone}
                        onChange={(e) => setLevelFormHeadPhone(e.target.value)}
                        placeholder="+244 923 000 000"
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Responsibilities Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      Atribuições Administrativas
                    </label>
                    <textarea
                      rows={2}
                      value={levelFormAdminResp}
                      onChange={(e) => setLevelFormAdminResp(e.target.value)}
                      placeholder="Gestão de expedientes, relatórios e processos..."
                      className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-sans text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
                      Atribuições Operacionais
                    </label>
                    <textarea
                      rows={2}
                      value={levelFormOperResp}
                      onChange={(e) => setLevelFormOperResp(e.target.value)}
                      placeholder="Execução de rondas, revistas, custódia e controlo..."
                      className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-sans text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>
                </div>

                {/* Real-time NREP-AO Validation Feedback */}
                {(() => {
                  const liveVal = validateSingleUnitNrepRules({
                    unitId: editingLevelUnitId,
                    name: levelFormName,
                    treeLevel: selectedLevelToCreate,
                    parentId: levelFormParentId,
                    province: levelFormProvince,
                    allUnits: organizationalUnits,
                    levelDefs: levelDefinitions
                  });

                  if (liveVal.isValid) {
                    return (
                      <div className="p-3 rounded-2xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold font-mono block text-emerald-200">
                            Conformidade Estatutária NREP-AO Aprovada
                          </span>
                          <span className="text-[11px] font-sans text-emerald-300/80 leading-tight block mt-0.5">
                            Nível {levelDefinitions[selectedLevelToCreate].num} ({levelDefinitions[selectedLevelToCreate].shortLabel}) segue a sequência regulamentar e integridade territorial do Dec. Pres. 184/17.
                          </span>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="p-3 rounded-2xl border bg-rose-500/15 border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold font-mono block text-rose-300">
                            Violação de Regra Orgânica NREP-AO
                          </span>
                          <span className="text-[11px] font-sans text-rose-200/90 leading-tight block mt-0.5">
                            {liveVal.errorReason}
                          </span>
                        </div>
                      </div>
                    );
                  }
                })()}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsCreateLevelModalOpen(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono font-bold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
                    {editingLevelUnitId ? "Salvar Alterações" : "Criar Unidade no Nível"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* MODAL: HIERARCHY CHAIN & ANCESTRY INSPECTOR */}
        {isLevelChainModalOpen && selectedUnitForChain && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-xl shadow-2xl flex flex-col gap-5"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Workflow className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-slate-100 uppercase">
                      Cadeia de Subordinação da Unidade
                    </h3>
                    <p className="text-xs font-mono text-amber-400">
                      {selectedUnitForChain.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsLevelChainModalOpen(false);
                    setSelectedUnitForChain(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Vertical Hierarchy Pathway */}
              <div className="flex flex-col gap-2 bg-slate-900/60 border border-slate-850 p-4 rounded-2xl">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                  Linha de Comando Ascendente (Raiz ➔ Unidade):
                </span>
                {getAncestorPath(selectedUnitForChain).map((anc, idx, arr) => {
                  const lvl = getUnitTreeLevel(anc);
                  const meta = ADMINISTRATIVE_LEVEL_DEFINITIONS[lvl];
                  const isCurrent = anc.id === selectedUnitForChain.id;

                  return (
                    <div key={anc.id} className="flex flex-col">
                      <div className={`p-3 rounded-xl border flex items-center justify-between ${
                        isCurrent
                          ? `${meta.badgeBg} ${meta.badgeBorder} ring-2 ring-${meta.colorName}-500/60`
                          : "bg-slate-950 border-slate-800"
                      }`}>
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-md border ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}>
                            NÍVEL {meta.num}
                          </span>
                          <div>
                            <span className="text-xs font-mono font-bold text-slate-200 block">
                              {anc.name}
                            </span>
                            <span className="text-[10px] font-sans text-slate-400">
                              {meta.shortLabel} • {anc.province || "Âmbito Nacional"}
                            </span>
                          </div>
                        </div>
                        {anc.headOfficerName && (
                          <span className="text-[10px] font-mono text-slate-400 hidden sm:block">
                            {anc.headOfficerName}
                          </span>
                        )}
                      </div>
                      {idx < arr.length - 1 && (
                        <div className="py-1 pl-6 flex items-center gap-1.5 text-slate-600 font-mono text-xs">
                          <ArrowDown className="h-3.5 w-3.5" />
                          <span className="text-[9px] uppercase tracking-wider">Subordina directamemte</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Direct and Subordinate Units Count */}
              <div className="bg-slate-900/40 border border-slate-850 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-200 block">
                    Descendentes Subordinados
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans">
                    {getChildren(selectedUnitForChain.id).length} directos • {getDescendants(selectedUnitForChain.id).length} totais na sub-árvore
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsLevelChainModalOpen(false);
                    handleOpenCreateLevelModal("L4_ORGAO");
                  }}
                  className="text-xs font-mono font-bold bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Adicionar Dependência
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsLevelChainModalOpen(false);
                    setSelectedUnitForChain(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono font-bold text-xs rounded-xl cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL: LEVEL REASSIGNMENT & PARENT SWITCHER */}
        {isLevelReassignModalOpen && selectedUnitForReassign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl flex flex-col gap-5"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                    <Split className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-slate-100 uppercase">
                      Reclassificação de Nível & Superior
                    </h3>
                    <p className="text-xs font-mono text-amber-400">
                      {selectedUnitForReassign.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLevelReassignModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    Novo Nível Administrativo:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["L1_DG", "L2_PROV", "L3_EP", "L4_ORGAO"] as AdministrativeTreeLevel[]).map((lvlKey) => {
                      const meta = ADMINISTRATIVE_LEVEL_DEFINITIONS[lvlKey];
                      const isSelected = newLevelForReassign === lvlKey;
                      return (
                        <button
                          key={lvlKey}
                          type="button"
                          onClick={() => setNewLevelForReassign(lvlKey)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col transition cursor-pointer ${
                            isSelected
                              ? `${meta.badgeBg} ${meta.badgeBorder} ring-2 ring-${meta.colorName}-500/50`
                              : "bg-slate-900 border-slate-800"
                          }`}
                        >
                          <span className={`text-[10px] font-mono font-black ${isSelected ? meta.badgeText : "text-slate-400"}`}>
                            NÍVEL {meta.num}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-200 truncate mt-0.5">
                            {meta.shortLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    Superior Hierárquico Imediato (Pai):
                  </label>
                  <select
                    value={newParentForReassign}
                    onChange={(e) => setNewParentForReassign(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="OU-MININT-DG">OU-MININT-DG - Direcção Geral (Central)</option>
                    <optgroup label="Direcções Provinciais">
                      {provincialDirectorates.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.province})</option>
                      ))}
                    </optgroup>
                    <optgroup label="Estabelecimentos Penitenciários">
                      {organizationalUnits.filter(u => getUnitTreeLevel(u) === "L3_EP" && u.id !== selectedUnitForReassign.id).map(ep => (
                        <option key={ep.id} value={ep.id}>{ep.name} ({ep.province})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Live NREP-AO Validation Feedback */}
                {(() => {
                  const liveVal = validateSingleUnitNrepRules({
                    unitId: selectedUnitForReassign.id,
                    name: selectedUnitForReassign.name,
                    treeLevel: newLevelForReassign,
                    parentId: newParentForReassign,
                    province: selectedUnitForReassign.province,
                    allUnits: organizationalUnits,
                    levelDefs: levelDefinitions
                  });

                  if (liveVal.isValid) {
                    return (
                      <div className="p-3 rounded-2xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold font-mono block text-emerald-200">
                            Reclassificação em Conformidade
                          </span>
                          <span className="text-[11px] font-sans text-emerald-300/80 leading-tight block mt-0.5">
                            A transição para {levelDefinitions[newLevelForReassign].shortLabel} sob {organizationalUnits.find(u => u.id === newParentForReassign)?.name || 'DGSP Central'} respeita as normas orgânicas.
                          </span>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="p-3 rounded-2xl border bg-rose-500/15 border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5">
                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold font-mono block text-rose-300">
                            Violação de Regra Orgânica NREP-AO
                          </span>
                          <span className="text-[11px] font-sans text-rose-200/90 leading-tight block mt-0.5">
                            {liveVal.errorReason}
                          </span>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsLevelReassignModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 font-mono font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveLevelReassign}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-4 w-4 stroke-[3]" /> Homologar Reclassificação
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL: 4-TIER BLUEPRINT BRANCH GENERATOR */}
        {isBranchBlueprintModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl flex flex-col gap-5"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-850 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-slate-100 uppercase">
                      Gerador de Ramo Institucional de 4 Níveis
                    </h3>
                    <p className="text-xs font-sans text-slate-400">
                      Geração padronizada conforme Decreto Presidencial n.º 184/17.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBranchBlueprintModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    Província de Destino
                  </label>
                  <select
                    value={blueprintTargetProvince}
                    onChange={(e) => setBlueprintTargetProvince(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {ALL_PROVINCES_LIST.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    Nome do Estabelecimento Penitenciário (Nível 3)
                  </label>
                  <input
                    type="text"
                    value={blueprintEpName}
                    onChange={(e) => setBlueprintEpName(e.target.value)}
                    placeholder="Estabelecimento Penitenciário Central"
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Blueprint Summary Box */}
                <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-2xl flex flex-col gap-2">
                  <span className="text-[10.5px] font-mono font-bold text-amber-400 uppercase">
                    Estrutura a ser gerada automaticamente:
                  </span>
                  <ul className="text-[11px] font-mono text-slate-300 space-y-1 pl-2">
                    <li>• <strong className="text-amber-300">L1:</strong> DGSP (Nacional / MININT)</li>
                    <li>• <strong className="text-blue-300">L2:</strong> Direcção Provincial dos Serv. Penitenciários de {blueprintTargetProvince}</li>
                    <li>• <strong className="text-emerald-300">L3:</strong> {blueprintEpName} de {blueprintTargetProvince}</li>
                    <li>• <strong className="text-purple-300">L4 (4 Secções):</strong> Controlo Penal, Segurança e Guarda, Saúde/Assistência, Produção Penitenciária</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setIsBranchBlueprintModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 font-mono font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleGenerateBranchBlueprint}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-4 w-4 stroke-[3]" /> Gerar Ramo
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Dynamic Hierarchy Level Definitions Modal */}
        {isLevelDefinitionsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Settings2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black font-mono text-slate-100 uppercase tracking-wide">
                      Definição Dinâmica de Níveis da Árvore
                    </h3>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      Configure as nomenclaturas, escopos e descrições dos 4 escalões hierárquicos do sistema.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLevelDefinitionsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Level Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["L1_DG", "L2_PROV", "L3_EP", "L4_ORGAO"] as AdministrativeTreeLevel[]).map(lvl => {
                  const m = levelDefinitions[lvl];
                  const Icon = m.icon;
                  const isCur = editingLevelDefKey === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setEditingLevelDefKey(lvl);
                        setDefFormLabel(m.label);
                        setDefFormShortLabel(m.shortLabel);
                        setDefFormScope(m.scope);
                        setDefFormDescription(m.description);
                      }}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition cursor-pointer ${
                        isCur
                          ? `${m.badgeBg} ${m.badgeBorder} ring-2 ring-amber-500/50 shadow-md`
                          : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-black ${isCur ? m.badgeText : "text-slate-400"}`}>
                          NÍVEL {m.num}
                        </span>
                        <Icon className={`h-3.5 w-3.5 ${isCur ? m.badgeText : "text-slate-500"}`} />
                      </div>
                      <span className={`text-xs font-mono font-bold truncate ${isCur ? "text-slate-100" : "text-slate-300"}`}>
                        {m.shortLabel}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {levelUnitsSummary[lvl].length} unidade(s)
                      </span>
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSaveLevelDefinition} className="flex flex-col gap-4">
                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[11px] font-mono font-bold text-slate-300 uppercase flex items-center justify-between">
                      <span>Designação Completa do Nível</span>
                      <span className="text-[10px] font-normal text-slate-500">Nível {levelDefinitions[editingLevelDefKey].num}</span>
                    </label>
                    <input
                      type="text"
                      value={defFormLabel}
                      onChange={(e) => setDefFormLabel(e.target.value)}
                      placeholder="Ex: Direcção Geral dos Serviços Penitenciários"
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono font-bold text-slate-300 uppercase">
                      Rótulo Resumido / Sigla do Escalão
                    </label>
                    <input
                      type="text"
                      value={defFormShortLabel}
                      onChange={(e) => setDefFormShortLabel(e.target.value)}
                      placeholder="Ex: DG / MININT, Direcção Provincial"
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono font-bold text-slate-300 uppercase">
                      Âmbito / Jurisdição Territorial
                    </label>
                    <input
                      type="text"
                      value={defFormScope}
                      onChange={(e) => setDefFormScope(e.target.value)}
                      placeholder="Ex: Âmbito Nacional, Âmbito Provincial"
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-[11px] font-mono font-bold text-slate-300 uppercase">
                      Descrição Normativa e Competências do Escalão
                    </label>
                    <textarea
                      rows={3}
                      value={defFormDescription}
                      onChange={(e) => setDefFormDescription(e.target.value)}
                      placeholder="Descreva a finalidade, papel hierárquico e base regulamentar..."
                      className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono resize-none"
                    />
                  </div>
                </div>

                {/* Cascade Checkbox */}
                <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-2xl flex items-start gap-3">
                  <input
                    id="defFormApplyToUnits"
                    type="checkbox"
                    checked={defFormApplyToUnits}
                    onChange={(e) => setDefFormApplyToUnits(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="defFormApplyToUnits" className="text-xs font-mono text-slate-300 cursor-pointer flex flex-col gap-0.5">
                    <span className="font-bold text-slate-200">
                      Sincronizar unidades existentes no estado orgânico ({levelUnitsSummary[editingLevelDefKey].length} unidades)
                    </span>
                    <span className="text-[10.5px] font-sans text-slate-400">
                      Atualiza os campos <code className="text-amber-400">treeLevel</code>, <code className="text-amber-400">hierarchyLevel</code> e <code className="text-amber-400">levelLabel</code> em todas as unidades deste escalão.
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsLevelDefinitionsModalOpen(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 font-mono font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="h-4 w-4 stroke-[3]" /> Salvar Definição do Nível
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* NREP-AO STATUTORY AUDIT & INTEGRITY DIAGNOSTIC MODAL */}
        {isNrepAuditModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-4xl shadow-2xl flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl border ${
                    nrepTreeValidationReport.isValid
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  }`}>
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wide flex items-center gap-2">
                      Auditoria Orgânica NREP-AO
                      {nrepTreeValidationReport.isValid ? (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                          Conformidade Plena (100%)
                        </span>
                      ) : (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                          {nrepTreeValidationReport.issues.length} Inconsistência(s)
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      Verificação contínua das regras orgânicas e integridade hierárquica segundo o Decreto Presidencial n.º 184/17 de 11 de Agosto.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNrepAuditModalOpen(false)}
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status Summary Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-2xl border ${
                  nrepTreeValidationReport.ruleMetrics.sequenceRulePassed
                    ? "bg-slate-950 border-emerald-900/40 text-emerald-300"
                    : "bg-rose-950/30 border-rose-900/60 text-rose-300"
                }`}>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">1. Sequência L1➔L4</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-mono font-bold">
                      {nrepTreeValidationReport.ruleMetrics.sequenceRulePassed ? "Aprovado" : `${nrepTreeValidationReport.sequenceViolations.length} Violações`}
                    </span>
                    {nrepTreeValidationReport.ruleMetrics.sequenceRulePassed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-rose-400" />
                    )}
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${
                  nrepTreeValidationReport.ruleMetrics.orphanRulePassed
                    ? "bg-slate-950 border-emerald-900/40 text-emerald-300"
                    : "bg-rose-950/30 border-rose-900/60 text-rose-300"
                }`}>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">2. Vínculo Superior</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-mono font-bold">
                      {nrepTreeValidationReport.ruleMetrics.orphanRulePassed ? "Zero Órfãos" : `${nrepTreeValidationReport.orphanedNodes.length} Órfãos`}
                    </span>
                    {nrepTreeValidationReport.ruleMetrics.orphanRulePassed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-rose-400" />
                    )}
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${
                  nrepTreeValidationReport.ruleMetrics.territoryRulePassed
                    ? "bg-slate-950 border-emerald-900/40 text-emerald-300"
                    : "bg-amber-950/30 border-amber-900/60 text-amber-300"
                }`}>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">3. Territorial</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-mono font-bold">
                      {nrepTreeValidationReport.ruleMetrics.territoryRulePassed ? "Coerente" : `${nrepTreeValidationReport.territorialAnomalies.length} Conflitos`}
                    </span>
                    {nrepTreeValidationReport.ruleMetrics.territoryRulePassed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-400" />
                    )}
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${
                  nrepTreeValidationReport.ruleMetrics.acyclicRulePassed
                    ? "bg-slate-950 border-emerald-900/40 text-emerald-300"
                    : "bg-rose-950/30 border-rose-900/60 text-rose-300"
                }`}>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold">4. Aciclicidade</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-mono font-bold">
                      {nrepTreeValidationReport.ruleMetrics.acyclicRulePassed ? "Sem Ciclos" : `${nrepTreeValidationReport.circularLoops.length} Loops`}
                    </span>
                    {nrepTreeValidationReport.ruleMetrics.acyclicRulePassed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-rose-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-850">
                <button
                  type="button"
                  onClick={() => setSelectedAuditFilter("ALL")}
                  className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                    selectedAuditFilter === "ALL"
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  Todos os Diagnósticos ({nrepTreeValidationReport.issues.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAuditFilter("INVALID_LEVEL_SEQUENCE")}
                  className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                    selectedAuditFilter === "INVALID_LEVEL_SEQUENCE"
                      ? "bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20"
                      : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  Quebra de Sequência ({nrepTreeValidationReport.sequenceViolations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAuditFilter("ORPHAN_NODE")}
                  className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                    selectedAuditFilter === "ORPHAN_NODE"
                      ? "bg-rose-500 text-slate-950 shadow-md shadow-rose-500/20"
                      : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  Nós Órfãos ({nrepTreeValidationReport.orphanedNodes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAuditFilter("TERRITORIAL_MISMATCH")}
                  className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                    selectedAuditFilter === "TERRITORIAL_MISMATCH"
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  Conflitos Territoriais ({nrepTreeValidationReport.territorialAnomalies.length})
                </button>
              </div>

              {/* Issue List */}
              <div className="flex flex-col gap-3">
                {nrepTreeValidationReport.issues.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950 border border-emerald-900/30 rounded-2xl flex flex-col items-center justify-center gap-3">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
                      <FileCheck className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold font-mono text-emerald-300">
                        Árvore Orgânica em 100% de Conformidade Estatutária
                      </h4>
                      <p className="text-xs text-slate-400 font-sans max-w-md mx-auto mt-1">
                        Todas as 4 camadas (DGSP ➔ Direcção Provincial ➔ Estabelecimento Penitenciário ➔ Órgão/Secção) obedecem rigorosamente à ordem prescrita pelo Decreto Presidencial n.º 184/17.
                      </p>
                    </div>
                  </div>
                ) : (
                  nrepTreeValidationReport.issues
                    .filter(issue => selectedAuditFilter === "ALL" || issue.ruleCode === selectedAuditFilter)
                    .map(issue => (
                      <div
                        key={issue.id}
                        className="bg-slate-950 border border-slate-850 hover:border-slate-750 p-4 rounded-2xl flex flex-col sm:flex-row items-start justify-between gap-4 transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${
                            issue.severity === "CRITICAL"
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          }`}>
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-slate-100">
                                {issue.title}
                              </span>
                              <span className="bg-slate-900 border border-slate-800 text-amber-400 text-[9px] font-mono px-2 py-0.5 rounded">
                                {issue.unitName}
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">
                                {issue.legalReference}
                              </span>
                            </div>
                            <p className="text-xs font-sans text-slate-300 leading-relaxed">
                              {issue.description}
                            </p>
                            {issue.suggestedFix && (
                              <div className="text-[11px] font-mono text-emerald-400/90 mt-1 flex items-center gap-1.5">
                                <ArrowRight className="h-3 w-3 shrink-0" />
                                <span>Solução Recomendada: {issue.suggestedFix}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleRepairNrepIssue(issue)}
                            className="text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/10"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            Reparar Nó
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Bottom Reconcile Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-850 flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleAutoReconcileLevels}
                  className="text-xs font-mono font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
                  Auto-Reconciliar Toda a Árvore Hierárquica
                </button>

                <button
                  type="button"
                  onClick={() => setIsNrepAuditModalOpen(false)}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  Fechar Diagnóstico
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Tree Node Sub-component
function TreeNodeItem({
  unit,
  getChildren,
  expandedNodes,
  toggleNode,
  onEdit,
  onDelete,
  onAddChild,
  onAssociatePrison,
  onOpenRespInspector,
  prisons
}: {
  unit: OrganizationalUnit;
  getChildren: (parentId: string) => OrganizationalUnit[];
  expandedNodes: Record<string, boolean>;
  toggleNode: (id: string) => void;
  onEdit: (unit: OrganizationalUnit) => void;
  onDelete: (unitId: string, name: string) => void;
  onAddChild: (parentId: string) => void;
  onAssociatePrison: (parentId: string) => void;
  onOpenRespInspector: (unit: OrganizationalUnit) => void;
  prisons: any[];
}) {
  const children = getChildren(unit.id);
  const isExpanded = !!expandedNodes[unit.id];
  const isPrisonNode = unit.level === TerritorialScope.ESTABLISHMENT || unit.divisionType === "ESTAB_PENITENCIARIO";

  return (
    <div className="flex flex-col gap-2">
      <div 
        onClick={() => children.length > 0 && toggleNode(unit.id)}
        className={`border rounded-xl p-3 flex items-center justify-between transition-colors ${
          children.length > 0 ? "cursor-pointer" : ""
        } ${
          isPrisonNode 
            ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-200 hover:border-emerald-700" 
            : "bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-750"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {children.length > 0 ? (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(unit.id);
              }}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 transition cursor-pointer"
            >
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-amber-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </button>
          ) : (
            <span className="w-5" />
          )}

          {isPrisonNode ? (
            <Building className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : unit.divisionType === "GABINETE" ? (
            <Scale className="h-4 w-4 text-purple-400 shrink-0" />
          ) : (
            <Layers className="h-4 w-4 text-amber-400 shrink-0" />
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold">{unit.name}</span>
              {unit.code && (
                <span className="bg-slate-950 border border-slate-800 text-amber-400 text-[9px] font-mono px-1.5 rounded">
                  {unit.code}
                </span>
              )}
              {children.length > 0 && (
                <span className="bg-slate-950 border border-slate-800 text-slate-400 text-[9px] font-mono px-1.5 rounded">
                  {children.length} sub-divisão(ões)
                </span>
              )}
              {unit.category && (
                <span className="bg-amber-950/40 border border-amber-800/40 text-amber-300 text-[9px] font-mono px-1.5 rounded">
                  {unit.category.split(" ")[0]} {unit.category.split(" ")[1]}
                </span>
              )}
            </div>
            {unit.functionDescription && (
              <span className="text-[10px] font-sans text-slate-400 mt-0.5">
                <strong className="text-slate-500 font-mono">Função Principal:</strong> {unit.functionDescription}
              </span>
            )}
            {unit.legalBasis && (
              <span className="text-[9px] font-mono text-slate-500 mt-0.5">{unit.legalBasis}</span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onOpenRespInspector(unit)}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded transition cursor-pointer"
            title="Definir responsabilidades funcionais e atribuições"
          >
            <FileText className="h-3.5 w-3.5" />
          </button>

          {!isPrisonNode && (
            <button
              type="button"
              onClick={() => onAddChild(unit.id)}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded transition cursor-pointer"
              title="Adicionar sub-secção dependente"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(unit)}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded transition cursor-pointer"
            title="Editar parâmetros desta divisão"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(unit.id, unit.name)}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded transition cursor-pointer"
            title="Remover divisão"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Recursive Children */}
      {isExpanded && children.length > 0 && (
        <div className="pl-6 border-l-2 border-slate-800/80 flex flex-col gap-2 ml-3">
          {children.map(child => (
            <TreeNodeItem
              key={child.id}
              unit={child}
              getChildren={getChildren}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onAssociatePrison={onAssociatePrison}
              onOpenRespInspector={onOpenRespInspector}
              prisons={prisons}
            />
          ))}
        </div>
      )}
    </div>
  );
}
