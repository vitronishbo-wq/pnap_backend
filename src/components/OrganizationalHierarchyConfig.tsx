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
  Zap
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
  "Luanda", "Huambo", "Benguela", "Huíla", "Cabinda", "Uíge", "Cuanza Norte", "Cuanza Sul",
  "Bengo", "Bié", "Cuando Cubango", "Cunene", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico", "Namibe", "Zaire"
];

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
  const [activeCategoryTab, setActiveCategoryTab] = useState<"ALL" | "CAT_1" | "CAT_2" | "CAT_3" | "CAT_4" | "TREE">("ALL");

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
      return list.filter(u => u.province?.toLowerCase().trim() === operatorProvince.toLowerCase().trim());
    }
    return list;
  }, [organizationalUnits, isNational, operatorProvince]);

  // Selected Directorate
  const activeDirectorate = useMemo(() => {
    return provincialDirectorates.find(d => d.province?.toLowerCase() === selectedProvinceFilter.toLowerCase()) 
      || provincialDirectorates.find(d => d.province?.toLowerCase() === "huambo")
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

    if (editingUnitId) {
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
      triggerToast("HIERARQUIA ATUALIZADA", `Unidade '${formName}' atualizada com sucesso.`, "success");
    } else {
      const parentUnit = organizationalUnits.find(u => u.id === parentUnitId);
      const newUnit: OrganizationalUnit = {
        id: `OU-SUB-${Date.now()}`,
        name: formName,
        level: parentUnit?.level || TerritorialScope.PROVINCIAL,
        parentId: parentUnitId,
        province: parentUnit?.province || selectedProvinceFilter,
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
      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
            <FolderTree className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide font-mono">
                Estrutura Orgânica & Dependências Estatutárias (Decreto 184/17)
              </h2>
              {isNational ? (
                <span className="bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Âmbito Nacional Central
                </span>
              ) : (
                <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="h-3 w-3 text-amber-400" /> Jurisdição Exclusiva: {operatorProvince}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-amber-400 text-xs font-mono font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            title={isSidebarCollapsed ? "Expandir Painel Lateral" : "Recolher Painel Lateral para Modo Mini (1%)"}
          >
            {isSidebarCollapsed ? (
              <>
                <PanelLeftOpen className="h-4 w-4 text-amber-400" />
                <span className="hidden sm:inline">Expandir Menu</span>
              </>
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 text-slate-400" />
                <span className="hidden sm:inline">Recolher (1%)</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              setParentUnitId(activeDirectorate?.id || "OU-DP-HUAMBO");
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-2 transition shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            Adicionar Sub-Divisão
          </button>

          <button
            onClick={() => {
              setTargetParentUnitId(activeDirectorate?.id || "OU-DP-HUAMBO");
              setIsAssociateModalOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-850 border border-slate-750 text-slate-200 font-mono text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer"
          >
            <LinkIcon className="h-4 w-4 text-emerald-400" />
            Associar Estabelecimento
          </button>
        </div>
      </div>

      {/* METRICS & STATS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Direções na Matriz</span>
            <span className="text-lg font-bold font-mono text-slate-100">{totalProvincialDirs} <span className="text-xs text-slate-500 font-normal">{isNational ? "Províncias" : "Sua Província"}</span></span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Dependências Orgânicas</span>
            <span className="text-lg font-bold font-mono text-slate-100">{totalSubDivisions} <span className="text-xs text-slate-500 font-normal">Dept / Gabinetes</span></span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">EPs Vinculados</span>
            <span className="text-lg font-bold font-mono text-slate-100">{totalAssociatedPrisons} <span className="text-xs text-slate-500 font-normal">Cadeias</span></span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Conformidade Orgânica</span>
            <span className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Dec. Pres. 184/17
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
                  .filter(prov => isNational || prov.toLowerCase().trim() === operatorProvince.toLowerCase().trim())
                  .filter(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(prov => {
                    const dir = provincialDirectorates.find(d => d.province?.toLowerCase() === prov.toLowerCase());
                    const isSelected = selectedProvinceFilter.toLowerCase() === prov.toLowerCase();
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
                .filter(prov => isNational || prov.toLowerCase().trim() === operatorProvince.toLowerCase().trim())
                .map(prov => {
                  const isSelected = selectedProvinceFilter.toLowerCase() === prov.toLowerCase();
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
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 flex flex-col gap-5">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-900 pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-slate-100 font-mono uppercase">
                      {activeDirectorate.name}
                    </h3>
                    <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                      Província de {activeDirectorate.province}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    onClick={() => handlePurgeAndRedesignStatutoryUnits(activeDirectorate)}
                    className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-mono text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer"
                    title="Anula a estrutura anterior e redesenha de forma limpa as 18 dependências regulamentares conforme Decreto Presidencial 184/17"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                    Anular & Redesenhar (184/17)
                  </button>

                  <button
                    onClick={() => handleAutoConformDirectorate(activeDirectorate)}
                    className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 transition cursor-pointer"
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
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                  {isLoadingDeps ? (
                    <span className="flex items-center gap-2 text-amber-400 font-bold">
                      <RefreshCw className="h-4 w-4 animate-spin" /> Carregando 18 dependências assincronamente...
                    </span>
                  ) : isFromCache ? (
                    <span className="flex items-center gap-2 text-cyan-400 font-bold">
                      <Zap className="h-4 w-4 text-cyan-400" /> Carregado via Cache de Jurisdição (`localStorage`)
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-emerald-400 font-bold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Sincronizado do Decreto Presidencial 184/17
                    </span>
                  )}
                  {lastSyncTime && (
                    <span className="text-[10px] text-slate-500 font-sans border-l border-slate-750 pl-2">
                      Sincronizado às {lastSyncTime}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => loadStatutoryDependenciesAsync(activeDirectorate, true)}
                  disabled={isLoadingDeps}
                  className="text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-400 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  title="Atualizar chave de cache do localStorage e recarregar dependências assincronamente"
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
              </div>

              {/* DISPLAY GRID OF DEPENDENCIES WITH FUNCTIONAL RESPONSIBILITIES */}
              {activeCategoryTab !== "TREE" ? (
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
                          Auto-Conformar (18 Dependências)
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

                            {/* Section Content */}
                            {isExpanded && (
                              <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-950/40">
                                {section.units.length === 0 ? (
                                  <div className="col-span-2 p-4 text-center text-xs font-mono text-slate-500 italic">
                                    Nenhuma unidade registada nesta categoria.
                                  </div>
                                ) : (
                                  section.units.map((unit) => {
                                    const isCat1 = unit.category?.startsWith("I -") || unit.divisionType === "GABINETE";
                                    const isCat2 = unit.category?.startsWith("II -");
                                    const isCat3 = unit.category?.startsWith("III -") || unit.divisionType === "CONSELHO";
                                    const isCat4 = unit.divisionType === "ESTAB_PENITENCIARIO" || unit.level === TerritorialScope.ESTABLISHMENT;

                                    return (
                                      <div
                                        key={unit.id}
                                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                                          isCat4
                                            ? "bg-emerald-950/20 border-emerald-850/60 hover:border-emerald-700"
                                            : isCat1
                                            ? "bg-purple-950/10 border-slate-800 hover:border-purple-500/40"
                                            : isCat2
                                            ? "bg-blue-950/10 border-slate-800 hover:border-blue-500/40"
                                            : "bg-amber-950/10 border-slate-800 hover:border-amber-500/40"
                                        }`}
                                      >
                                        <div className="flex flex-col gap-2">
                                          <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              {isCat1 && <Briefcase className="h-4 w-4 text-purple-400 shrink-0" />}
                                              {isCat2 && <Shield className="h-4 w-4 text-blue-400 shrink-0" />}
                                              {isCat3 && <Users className="h-4 w-4 text-amber-400 shrink-0" />}
                                              {isCat4 && <Building className="h-4 w-4 text-emerald-400 shrink-0" />}
                                              
                                              <span className="text-xs font-mono font-bold text-slate-100">
                                                {unit.name}
                                              </span>
                                            </div>

                                            {unit.code && (
                                              <span className="bg-slate-950 border border-slate-800 text-amber-400 text-[9px] font-mono px-2 py-0.5 rounded shrink-0 font-bold">
                                                {unit.code}
                                              </span>
                                            )}
                                          </div>

                                          {unit.category && (
                                            <span className="text-[9px] font-mono text-slate-400 bg-slate-950/60 border border-slate-800 px-2 py-0.5 rounded w-fit">
                                              {unit.category}
                                            </span>
                                          )}

                                          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                                            <strong className="text-slate-400 font-mono text-[10px]">Função Principal:</strong> {unit.functionDescription || "Atribuição legal conforme Decreto Presidencial 184/17."}
                                          </p>

                                          {/* Administrative and Operational Duties Preview */}
                                          <div className="bg-slate-950/80 border border-slate-850 rounded-lg p-2.5 flex flex-col gap-1.5 text-[10px]">
                                            <div className="text-slate-300 font-sans">
                                              <strong className="text-purple-400 font-mono uppercase">Atribuição Administrativa:</strong>{" "}
                                              <span className="text-slate-400 line-clamp-2">
                                                {unit.administrativeResponsibilities || "Gestão do expediente geral, arquivo documental e prestação de contas à Direção Provincial."}
                                              </span>
                                            </div>
                                            <div className="text-slate-300 font-sans">
                                              <strong className="text-blue-400 font-mono uppercase">Atribuição Operativa:</strong>{" "}
                                              <span className="text-slate-400 line-clamp-2">
                                                {unit.operationalResponsibilities || "Execução das diretivas de segurança, patrulhamento, revistas e controlo de disciplina."}
                                              </span>
                                            </div>
                                            {isCat4 && (
                                              <div className="hidden">
                                                <FolderTree className="h-3 w-3 text-emerald-400 shrink-0" />
                                                <span>Estruturas Administrativas e Operativas replicadas em Secções Internas (Controlo Penal, Segurança, Saúde, Logística).</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Actions footer */}
                                        <div className="flex items-center justify-between border-t border-slate-850/80 pt-2.5 mt-1">
                                          <span className="text-[9.5px] font-mono text-slate-500">
                                            Chefia: {unit.headOfficerName || "A Nomear"}
                                          </span>

                                          <div className="flex items-center gap-1.5">
                                            <button
                                              onClick={() => handleOpenRespInspector(unit)}
                                              className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition"
                                              title="Definir responsabilidades funcionais administrativas e operativas"
                                            >
                                              <FileText className="h-3 w-3 text-amber-400" />
                                              Definir Atribuições
                                            </button>

                                            <button
                                              onClick={() => handleEditUnit(unit)}
                                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded transition"
                                              title="Editar divisão"
                                            >
                                              <Edit3 className="h-3.5 w-3.5" />
                                            </button>

                                            <button
                                              onClick={() => handleDeleteUnit(unit.id, unit.name)}
                                              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded transition"
                                              title="Excluir divisão"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* FILTERED SINGLE CATEGORY VIEW */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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
                          <div
                            key={unit.id}
                            className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                              isCat4
                                ? "bg-emerald-950/20 border-emerald-850/60 hover:border-emerald-700"
                                : isCat1
                                ? "bg-slate-900/60 border-slate-800 hover:border-purple-500/40"
                                : isCat2
                                ? "bg-slate-900/60 border-slate-800 hover:border-blue-500/40"
                                : "bg-slate-900/60 border-slate-800 hover:border-amber-500/40"
                            }`}
                          >
                            <div className="flex flex-col gap-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {isCat1 && <Briefcase className="h-4 w-4 text-purple-400 shrink-0" />}
                                  {isCat2 && <Shield className="h-4 w-4 text-blue-400 shrink-0" />}
                                  {isCat3 && <Users className="h-4 w-4 text-amber-400 shrink-0" />}
                                  {isCat4 && <Building className="h-4 w-4 text-emerald-400 shrink-0" />}
                                  
                                  <span className="text-xs font-mono font-bold text-slate-100">
                                    {unit.name}
                                  </span>
                                </div>

                                {unit.code && (
                                  <span className="bg-slate-950 border border-slate-800 text-amber-400 text-[9px] font-mono px-2 py-0.5 rounded shrink-0">
                                    {unit.code}
                                  </span>
                                )}
                              </div>

                              {unit.category && (
                                <span className="text-[9px] font-mono text-slate-400 bg-slate-950/60 border border-slate-800 px-2 py-0.5 rounded w-fit">
                                  {unit.category}
                                </span>
                              )}

                              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                                <strong className="text-slate-400 font-mono text-[10px]">Função Principal:</strong> {unit.functionDescription || "Atribuição legal conforme Decreto Presidencial 184/17."}
                              </p>

                              {/* Administrative and Operational Duties Preview */}
                              <div className="bg-slate-950/80 border border-slate-850 rounded-lg p-2.5 flex flex-col gap-1.5 text-[10px]">
                                <div className="text-slate-300 font-sans">
                                  <strong className="text-purple-400 font-mono uppercase">Atribuição Administrativa:</strong>{" "}
                                  <span className="text-slate-400 line-clamp-2">
                                    {unit.administrativeResponsibilities || "Gestão do expediente geral, arquivo documental e prestação de contas à Direção Provincial."}
                                  </span>
                                </div>
                                <div className="text-slate-300 font-sans">
                                  <strong className="text-blue-400 font-mono uppercase">Atribuição Operativa:</strong>{" "}
                                  <span className="text-slate-400 line-clamp-2">
                                    {unit.operationalResponsibilities || "Execução das diretivas de segurança, patrulhamento, revistas e controlo de disciplina."}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions footer */}
                            <div className="flex items-center justify-between border-t border-slate-850/80 pt-2.5 mt-1">
                              <span className="text-[9.5px] font-mono text-slate-500">
                                Chefia: {unit.headOfficerName || "A Nomear"}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleOpenRespInspector(unit)}
                                  className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer transition"
                                  title="Definir responsabilidades funcionais administrativas e operativas"
                                >
                                  <FileText className="h-3 w-3 text-amber-400" />
                                  Definir Atribuições
                                </button>

                                <button
                                  onClick={() => handleEditUnit(unit)}
                                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded transition"
                                  title="Editar divisão"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteUnit(unit.id, unit.name)}
                                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded transition"
                                  title="Excluir divisão"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                      .filter(p => isNational || (p.location && p.location.toLowerCase().includes(operatorProvince.toLowerCase())) || (p.province && p.province.toLowerCase() === operatorProvince.toLowerCase()))
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
