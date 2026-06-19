import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Database,
  Shield,
  Scale,
  Users,
  FileText,
  MapPin,
  Search,
  Plus,
  RefreshCw,
  Wifi,
  WifiOff,
  QrCode,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Lock,
  FileCode,
  Trash2,
  Fingerprint,
  Activity,
  HeartPulse,
  Clock,
  ExternalLink,
  BookOpen,
  ArrowRight,
  UserCheck,
  Check,
  Building,
  Filter,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  Settings,
  Sliders,
  Printer,
  Download,
  Camera,
  UploadCloud,
  Calendar,
  Briefcase,
  Crown,
  Zap,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  History,
  Layers,
  Bell,
  ChevronDown,
  ChevronUp,
  Pill,
  Stethoscope,
  Thermometer,
  LayoutGrid,
  LayoutTemplate,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import {
  TABLES_METADATA,
  MODULE_GROUPS,
  PENAL_CODE_GROUPS,
  PRISONS_DB,
  INITIAL_INMATES,
  INITIAL_SYNC_QUEUE,
  InmateState,
  Table
} from "./data/schemaData";
import { exportInmateListToPDF, exportInmateFichaToPDF, exportCriticalBlocksToPDF } from "./utils/pdfGenerator";
import { QRCodeImg } from "./components/QRCodeImg";
import DeusFundadorPanel from "./components/DeusFundadorPanel";
import HealthModule from "./components/HealthModule";

// New Architectural Core Models
import { 
  SystemPermission, 
  TerritorialScope, 
  FunctionalScope, 
  InformationClassification, 
  SystemRole, 
  OrganizationalUnit, 
  Delegation, 
  InmateMovement, 
  AuditRecord, 
  DocumentSignature,
  PrisonState
} from "./types";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell as ReCell,
  PieChart,
  Pie,
  LineChart,
  Line
} from "recharts";

export const SYSTEM_ROLES: SystemRole[] = [
  {
    id: "GENERAL_DIRECTOR",
    name: "Director Geral",
    permissions: [
      SystemPermission.VIEW_INMATES,
      SystemPermission.ADMIT_INMATE,
      SystemPermission.MOVE_INMATE,
      SystemPermission.APPROVE_RELEASE,
      SystemPermission.VIEW_INCIDENTS,
      SystemPermission.CREATE_INCIDENT,
      SystemPermission.VIEW_INTELLIGENCE,
      SystemPermission.CREATE_INTELLIGENCE,
      SystemPermission.VIEW_CLINICAL,
      SystemPermission.EDIT_CLINICAL,
      SystemPermission.VIEW_AUDITING,
      SystemPermission.MANAGE_DELEGATIONS,
      SystemPermission.GENERATE_REPORTS,
      SystemPermission.SYSTEM_CONFIG
    ],
    defaultFunctionalScope: FunctionalScope.GERAL
  },
  {
    id: "PROVINCIAL_DIRECTOR",
    name: "Director Provincial",
    permissions: [
      SystemPermission.VIEW_INMATES,
      SystemPermission.ADMIT_INMATE,
      SystemPermission.MOVE_INMATE,
      SystemPermission.APPROVE_RELEASE,
      SystemPermission.VIEW_INCIDENTS,
      SystemPermission.CREATE_INCIDENT,
      SystemPermission.VIEW_INTELLIGENCE,
      SystemPermission.VIEW_CLINICAL,
      SystemPermission.VIEW_AUDITING,
      SystemPermission.MANAGE_DELEGATIONS,
      SystemPermission.GENERATE_REPORTS
    ],
    defaultFunctionalScope: FunctionalScope.GERAL
  },
  {
    id: "PRISON_DIRECTOR",
    name: "Director de Cadeia",
    permissions: [
      SystemPermission.VIEW_INMATES,
      SystemPermission.ADMIT_INMATE,
      SystemPermission.MOVE_INMATE,
      SystemPermission.APPROVE_RELEASE,
      SystemPermission.VIEW_INCIDENTS,
      SystemPermission.CREATE_INCIDENT,
      SystemPermission.VIEW_CLINICAL,
      SystemPermission.GENERATE_REPORTS,
      SystemPermission.MANAGE_DELEGATIONS
    ],
    defaultFunctionalScope: FunctionalScope.GERAL
  },
  {
    id: "PRISON_SECURITY_CHIEF",
    name: "Chefe de Segurança",
    permissions: [
      SystemPermission.VIEW_INMATES,
      SystemPermission.MOVE_INMATE,
      SystemPermission.VIEW_INCIDENTS,
      SystemPermission.CREATE_INCIDENT,
      SystemPermission.VIEW_INTELLIGENCE,
      SystemPermission.CREATE_INTELLIGENCE,
      SystemPermission.GENERATE_REPORTS
    ],
    defaultFunctionalScope: FunctionalScope.SEGURANCA
  },
  {
    id: "PRISON_HEALTH_CHIEF",
    name: "Chefe de Saúde",
    permissions: [
      SystemPermission.VIEW_INMATES,
      SystemPermission.VIEW_CLINICAL,
      SystemPermission.EDIT_CLINICAL,
      SystemPermission.GENERATE_REPORTS
    ],
    defaultFunctionalScope: FunctionalScope.SAUDE
  }
];

export const ORGANIZATIONAL_UNITS: OrganizationalUnit[] = [
  { id: "OU-MININT-DG", name: "Serviço Penitenciário Nacional - Direção Geral", level: TerritorialScope.NATIONAL },
  
  { id: "OU-DP-LUANDA", name: "Direção Provincial dos Serviços Penitenciários de Luanda", level: TerritorialScope.PROVINCIAL, parentId: "OU-MININT-DG", province: "Luanda" },
  { id: "OU-PRIS-01", name: "Estabelecimento Penitenciário de Viana", level: TerritorialScope.ESTABLISHMENT, parentId: "OU-DP-LUANDA", prisonId: "PRIS-01" },
  { id: "OU-PRIS-02", name: "Estabelecimento Penitenciário de Kakila", level: TerritorialScope.ESTABLISHMENT, parentId: "OU-DP-LUANDA", prisonId: "PRIS-02" },
  
  { id: "OU-DP-HUAMBO", name: "Direção Provincial dos Serviços Penitenciários do Huambo", level: TerritorialScope.PROVINCIAL, parentId: "OU-MININT-DG", province: "Huambo" },
  { id: "OU-PRIS-HUAMBO", name: "Cadeia Central do Huambo", level: TerritorialScope.ESTABLISHMENT, parentId: "OU-DP-HUAMBO", prisonId: "PRIS-HUAMBO" },
  { id: "OU-PRIS-BAILUNDO", name: "Cadeia do Bailundo", level: TerritorialScope.ESTABLISHMENT, parentId: "OU-DP-HUAMBO", prisonId: "PRIS-BAILUNDO" },
  { id: "OU-PRIS-CAALA", name: "Cadeia do Caála", level: TerritorialScope.ESTABLISHMENT, parentId: "OU-DP-HUAMBO", prisonId: "PRIS-CAALA" },
  
  { id: "OU-DP-UIGE", name: "Direção Provincial dos Serviços Penitenciários do Uíge", level: TerritorialScope.PROVINCIAL, parentId: "OU-MININT-DG", province: "Uíge" },
  { id: "OU-PRIS-03", name: "Estabelecimento Penitenciário de Sanza Pombo", level: TerritorialScope.ESTABLISHMENT, parentId: "OU-DP-UIGE", prisonId: "PRIS-03" },

  { id: "OU-DP-BENGUELA", name: "Direção Provincial dos Serviços Penitenciários de Benguela", level: TerritorialScope.PROVINCIAL, parentId: "OU-MININT-DG", province: "Benguela" },
  { id: "OU-PRIS-BEN-01", name: "Cadeia Central de Benguela", level: TerritorialScope.ESTABLISHMENT, parentId: "OU-DP-BENGUELA", prisonId: "PRIS-BEN-01" },

  { id: "OU-DP-HUILA", name: "Direção Provincial dos Serviços Penitenciários da Huíla", level: TerritorialScope.PROVINCIAL, parentId: "OU-MININT-DG", province: "Huíla" },
  { id: "OU-PRIS-HUI-01", name: "Cadeia Central do Lubango", level: TerritorialScope.ESTABLISHMENT, parentId: "OU-DP-HUILA", prisonId: "PRIS-HUI-01" }
];

// Helper function to Highlight query matches
const highlightMatch = (text: string, query: string) => {
  if (!query) return <span>{text}</span>;
  const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-amber-500/30 text-amber-300 rounded px-0.5 font-bold">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

export interface HealthRecord {
  id: string;
  inmateId: string;
  inmateName: string;
  prisonId: string;
  prisonName: string;
  consultationDate: string;
  symptoms: string;
  diagnosis: string;
  prescription: string;
  severity: "Ligeiro" | "Moderado" | "Grave" | "Crítico";
  status: "Pendente" | "Em Tratamento" | "Recuperado" | "Alta Clínica";
  doctorName: string;
}

export interface ReintegrationRecord {
  id: string;
  inmateId: string;
  inmateName: string;
  programName: string;
  category: "Educação" | "Trabalho" | "Apoio Psicológico" | "Artesanato";
  enrollmentDate: string;
  progressScore: number;
  attendanceRate: number;
  status: "Inscrito" | "Ativo" | "Suspenso" | "Concluído";
  evaluationNotes: string;
  reintegratorName: string;
}

export interface IntelligenceRecord {
  id: string;
  inmateId: string;
  inmateName: string;
  classification: "RESTRITO" | "CONFIDENCIAL" | "SECRETO";
  incidentSource: "MININT" | "Polícia Nacional" | "SICP" | "Guarda Prisional";
  alertType: "Informador de Bloco" | "Tentativa de Fuga Recorrente" | "Histórico de Facção" | "Conexão Externa Suspeita";
  threatLevel: "Baixo" | "Médio" | "Alto" | "Crítico";
  description: string;
  loggedDate: string;
  actionTaken: string;
  checksum: string;
}

export interface PrisonVisit {
  id: string;
  prisonId: string;
  visitorName: string;
  visitorDocument: string;
  inmateId: string;
  inmateName: string;
  visitDate: string;
  timeSlot: string;
  status: "Pendente" | "Confirmado" | "Cancelado" | "Realizado";
}

export interface TriageRecord {
  id: string;
  inmateId: string;
  inmateName: string;
  prisonId: string;
  triageDate: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  weight: string;
  severity: "Ligeiro" | "Moderado" | "Grave" | "Crítico";
  symptoms: string;
  specialtyNeeded: string;
  professionalName: string;
}

export interface FollowUpRecord {
  id: string;
  inmateId: string;
  inmateName: string;
  prisonId: string;
  followUpDate: string;
  progressNotes: string;
  conditionStatus: "Estável" | "Melhoria" | "Sob Observação" | "Crítico" | "Alta";
  treatmentGiven: string;
  nextReviewDate: string;
  doctorName: string;
}

export interface PrescriptionRecord {
  id: string;
  inmateId: string;
  inmateName: string;
  prisonId: string;
  prescriptionDate: string;
  diagnosisAssociated: string;
  medications: string;
  durationDays: number;
  specialInstructions: string;
  doctorName: string;
  status: "Ativo" | "Concluído" | "Cancelado" | "Suspenso";
}

export interface OperatorProfile {
  id: string;
  name: string;
  role: "DIRECTOR_GERAL" | "DIRECTOR_PROVINCIAL" | "DIRECTOR_CADEIA" | "CHEFE_SEGURANCA" | "CHEFE_SAUDE";
  roleName: string;
  roleDescription: string;
  level: "NATIONAL" | "PROVINCIAL" | "ESTABLISHMENT" | "PAVILION" | "BLOCK";
  province?: string;
  assignedPrisonId?: string;
  sigla: string;
  username: string;
  senha_hash: string;
  permissions: string[];
  sensitivityLevel: "PUBLICO" | "RESTRITO" | "CONFIDENCIAL" | "SECRETO";
}

export interface LocationHierarchy {
  [province: string]: {
    directions: {
      [dirName: string]: { id: string; name: string }[]
    }
  }
}

export const INSTITUTIONAL_HIERARCHY: LocationHierarchy = {
  "Bengo": {
    directions: {
      "Direção Provincial do Bengo": [
        { id: "PRIS-BENGO", name: "Estabelecimento Penitenciário do Bengo" }
      ]
    }
  },
  "Benguela": {
    directions: {
      "Direção Provincial de Benguela": [
        { id: "PRIS-BEN-01", name: "Cadeia Central de Benguela" }
      ]
    }
  },
  "Bié": {
    directions: {
      "Direção Provincial do Bié": [
        { id: "PRIS-BIE", name: "Estabelecimento Penitenciário do Bié" }
      ]
    }
  },
  "Cabinda": {
    directions: {
      "Direção Provincial de Cabinda": [
        { id: "PRIS-CABINDA", name: "Estabelecimento Penitenciário de Cabinda" }
      ]
    }
  },
  "Cuando Cubango": {
    directions: {
      "Direção Provincial do Cuando Cubango": [
        { id: "PRIS-CCUBANGO", name: "Estabelecimento Penitenciário de Menongue" }
      ]
    }
  },
  "Cuanza-Norte": {
    directions: {
      "Direção Provincial do Cuanza-Norte": [
        { id: "PRIS-CNORTE", name: "Estabelecimento Penitenciário de Ndalatando" }
      ]
    }
  },
  "Cuanza-Sul": {
    directions: {
      "Direção Provincial do Cuanza-Sul": [
        { id: "PRIS-CSUL", name: "Estabelecimento Penitenciário do Sumbe" }
      ]
    }
  },
  "Cunene": {
    directions: {
      "Direção Provincial do Cunene": [
        { id: "PRIS-CUNENE", name: "Estabelecimento Penitenciário de Ondjiva" }
      ]
    }
  },
  "Huambo": {
    directions: {
      "Direção Provincial do Huambo": [
        { id: "PRIS-HUAMBO", name: "Cadeia Central do Huambo" },
        { id: "PRIS-BAILUNDO", name: "Cadeia do Bailundo" },
        { id: "PRIS-CAALA", name: "Cadeia do Caála" }
      ]
    }
  },
  "Huíla": {
    directions: {
      "Direção Provincial da Huíla": [
        { id: "PRIS-HUI-01", name: "Cadeia Central do Lubango" }
      ]
    }
  },
  "Luanda": {
    directions: {
      "Direção Provincial de Luanda": [
        { id: "PRIS-01", name: "Estabelecimento Penitenciário de Viana" },
        { id: "PRIS-02", name: "Estabelecimento Penitenciário de Kakila" }
      ]
    }
  },
  "Lunda-Norte": {
    directions: {
      "Direção Provincial da Lunda-Norte": [
        { id: "PRIS-LNORTE", name: "Estabelecimento Penitenciário do Dundo" }
      ]
    }
  },
  "Lunda-Sul": {
    directions: {
      "Direção Provincial da Lunda-Sul": [
        { id: "PRIS-LSUL", name: "Estabelecimento Penitenciário de Saurimo" }
      ]
    }
  },
  "Malanje": {
    directions: {
      "Direção Provincial de Malanje": [
        { id: "PRIS-MALANJE", name: "Estabelecimento Penitenciário de Malanje" }
      ]
    }
  },
  "Moxico": {
    directions: {
      "Direção Provincial do Moxico": [
        { id: "PRIS-MOXICO", name: "Estabelecimento Penitenciário de Luena" }
      ]
    }
  },
  "Namibe": {
    directions: {
      "Direção Provincial do Namibe": [
        { id: "PRIS-NAMIBE", name: "Estabelecimento Penitenciário de Moçâmedes" }
      ]
    }
  },
  "Uíge": {
    directions: {
      "Direção Provincial do Uíge": [
        { id: "PRIS-03", name: "Estabelecimento Penitenciário de Sanza Pombo" }
      ]
    }
  },
  "Zaire": {
    directions: {
      "Direção Provincial do Zaire": [
        { id: "PRIS-ZAIRE", name: "Estabelecimento Penitenciário de Mbanza Kongo" }
      ]
    }
  },
  "Moxico Leste": {
    directions: {
      "Direção Provincial de Moxico Leste": [
        { id: "PRIS-MXLESTE", name: "Estabelecimento Penitenciário de Cazombo" }
      ]
    }
  },
  "Icolo e Bengo": {
    directions: {
      "Direção Provincial de Icolo e Bengo": [
        { id: "PRIS-ICOLO", name: "Estabelecimento Penitenciário de Catete" }
      ]
    }
  },
  "Cubango": {
    directions: {
      "Direção Provincial de Cubango": [
        { id: "PRIS-CUBANGO_MOCK", name: "Estabelecimento Penitenciário de Menongue Oeste" }
      ]
    }
  },
  "Cuando": {
    directions: {
      "Direção Provincial de Cuando": [
        { id: "PRIS-CUANDO_MOCK", name: "Estabelecimento Penitenciário de Menongue Leste" }
      ]
    }
  }
};

export const HUAMBO_MOCK_INMATES: InmateState[] = [
  {
    id: "AO-REC-4712",
    firstName: "Augusto",
    lastName: "Chissola",
    gender: "Masculino",
    birthDate: "1989-11-04",
    idCard: "002829281HU042",
    fatherName: "João Augusto Chissola",
    motherName: "Sílvia Ndula",
    nationality: "Angolana",
    crimeId: "A01",
    riskLevel: "Médio",
    suggestedCellType: "Geral",
    assignedPrisonId: "PRIS-HUAMBO",
    assignedPavilionId: "PAV-H1",
    assignedBlockId: "BLK-H1A",
    assignedCellNumber: "Cela A1-01",
    status: "ACTIVE",
    documentCode: "HU-7729-NREP"
  },
  {
    id: "AO-REC-3392",
    firstName: "Bento",
    lastName: "Valente",
    gender: "Masculino",
    birthDate: "1994-05-18",
    idCard: "001827392HU090",
    fatherName: "Valente Kapassa",
    motherName: "Teresa Ngola",
    nationality: "Angolana",
    crimeId: "B01",
    riskLevel: "Alto",
    suggestedCellType: "Segurança Média",
    assignedPrisonId: "PRIS-HUAMBO",
    assignedPavilionId: "PAV-H2",
    assignedBlockId: "BLK-H2A",
    assignedCellNumber: "Cela H2-A1",
    status: "ACTIVE",
    documentCode: "HU-1102-NREP"
  },
  {
    id: "AO-REC-1152",
    firstName: "Emanuel",
    lastName: "Kapango",
    gender: "Masculino",
    birthDate: "2001-07-29",
    idCard: "005928192HU037",
    fatherName: "Augusto Kapango",
    motherName: "Albertina Ndona",
    nationality: "Angolana",
    crimeId: "B02",
    riskLevel: "Baixo",
    suggestedCellType: "Geral",
    assignedPrisonId: "PRIS-HUAMBO",
    assignedPavilionId: "PAV-H1",
    assignedBlockId: "BLK-H1B",
    assignedCellNumber: "Cela H1-B2",
    status: "ACTIVE",
    documentCode: "HU-8839-NREP"
  }
];

export const NREP_OPERATORS: OperatorProfile[] = [
  {
    id: "MININT-OP-DG-01",
    name: "Comissário-Geral Maria Kiala",
    role: "DIRECTOR_GERAL",
    roleName: "Director Geral",
    roleDescription: "Vê Tudo - Gestão Central Geral de Controle Prisional Nacional.",
    level: "NATIONAL",
    sigla: "DGSP",
    username: "maria.kiala",
    senha_hash: "minint123",
    permissions: ["Incidentes", "Movimentações", "Vigilância", "Transferências", "Celas", "Chaves", "Armas", "Saúde", "Psicologia", "Medicação", "Relatórios clínicos"],
    sensitivityLevel: "SECRETO"
  },
  {
    id: "MININT-OP-DP-LUANDA",
    name: "Sub-Comissário António Bento",
    role: "DIRECTOR_PROVINCIAL",
    roleName: "Director Provincial de Luanda",
    roleDescription: "Controle Provincial - Apenas vê cadeias em Luanda (EP Viana, EP Kakila).",
    level: "PROVINCIAL",
    province: "Luanda",
    sigla: "DPSP-LA",
    username: "antonio.bento",
    senha_hash: "luanda123",
    permissions: ["Incidentes", "Movimentações", "Vigilância", "Transferências", "Celas", "Chaves", "Armas", "Saúde", "Psicologia", "Relatórios clínicos"],
    sensitivityLevel: "CONFIDENCIAL"
  },
  {
    id: "MININT-OP-DC-VIANA",
    name: "Superintendente Pedro Neto",
    role: "DIRECTOR_CADEIA",
    roleName: "Director do EP Viana",
    roleDescription: "Gestão Local - Apenas vê e gere o EP Viana.",
    level: "ESTABLISHMENT",
    assignedPrisonId: "PRIS-01",
    sigla: "DEP-VN",
    username: "pedro.neto",
    senha_hash: "viana123",
    permissions: ["Incidentes", "Movimentações", "Vigilância", "Transferências", "Celas", "Chaves", "Armas", "Saúde"],
    sensitivityLevel: "RESTRITO"
  },
  {
    id: "MININT-OP-SEG-VIANA",
    name: "Inspector-Chefe João Kassoma",
    role: "CHEFE_SEGURANCA",
    roleName: "Chefe de Segurança Penal - EP Viana",
    roleDescription: "Risco & Vigilância - Apenas EP Viana. Não vê o Controlo Penal ou Saúde.",
    level: "ESTABLISHMENT",
    assignedPrisonId: "PRIS-01",
    sigla: "CSSP-VN",
    username: "joao.kassoma",
    senha_hash: "seguranca123",
    permissions: ["Incidentes", "Movimentações", "Vigilância", "Transferências", "Celas", "Chaves", "Armas"],
    sensitivityLevel: "CONFIDENCIAL"
  },
  {
    id: "MININT-OP-SAU-VIANA",
    name: "Dr. Mateus Luvumbo",
    role: "CHEFE_SAUDE",
    roleName: "Chefe de Saúde - EP Viana",
    roleDescription: "Assistência Médica - Apenas EP Viana. Não vê a Segurança física, incidentes ou chaves.",
    level: "ESTABLISHMENT",
    assignedPrisonId: "PRIS-01",
    sigla: "CSSA-VN",
    username: "mateus.luvumbo",
    senha_hash: "saude123",
    permissions: ["Saúde", "Psicologia", "Medicação", "Relatórios clínicos"],
    sensitivityLevel: "CONFIDENCIAL"
  },
  // Huambo Operators requested
  {
    id: "MININT-OP-DP-HUAMBO",
    name: "Dr. Júlio Mbanza",
    role: "DIRECTOR_PROVINCIAL",
    roleName: "Director Provincial do Huambo",
    roleDescription: "Controle Provincial - Apenas vê cadeias no Huambo (Cadeia Central Huambo, Bailundo, Caála).",
    level: "PROVINCIAL",
    province: "Huambo",
    sigla: "DPSP-HB",
    username: "jmbanza",
    senha_hash: "huambo123",
    permissions: ["Incidentes", "Movimentações", "Vigilância", "Transferências", "Celas", "Chaves", "Armas", "Saúde", "Psicologia", "Relatórios clínicos"],
    sensitivityLevel: "CONFIDENCIAL"
  },
  {
    id: "MININT-OP-DC-HUAMBO",
    name: "Superintendente-Chefe Bento Caetano",
    role: "DIRECTOR_CADEIA",
    roleName: "Director da Cadeia Central do Huambo",
    roleDescription: "Gestão Local - Apenas vê e gere a Cadeia Central do Huambo.",
    level: "ESTABLISHMENT",
    assignedPrisonId: "PRIS-HUAMBO",
    sigla: "DEP-HB",
    username: "director.huambo",
    senha_hash: "huambo456",
    permissions: ["Incidentes", "Movimentações", "Vigilância", "Transferências", "Celas", "Chaves", "Armas", "Saúde"],
    sensitivityLevel: "CONFIDENCIAL"
  },
  {
    id: "MININT-OP-SEG-HUAMBO",
    name: "Inspector João Bernardo",
    role: "CHEFE_SEGURANCA",
    roleName: "Chefe de Segurança - Cadeia Central do Huambo",
    roleDescription: "Risco & Vigilância - Apenas Cadeia Central do Huambo. Não vê saúde.",
    level: "ESTABLISHMENT",
    assignedPrisonId: "PRIS-HUAMBO",
    sigla: "CSSP-HB",
    username: "chefe.seg.huambo",
    senha_hash: "huambo789",
    permissions: ["Incidentes", "Movimentações", "Vigilância", "Transferências", "Celas", "Chaves", "Armas"],
    sensitivityLevel: "CONFIDENCIAL"
  },
  {
    id: "MININT-OP-SAU-HUAMBO",
    name: "Dra. Ana Maria",
    role: "CHEFE_SAUDE",
    roleName: "Chefe de Saúde - Cadeia Central do Huambo",
    roleDescription: "Assistência Médica - Apenas Cadeia Central do Huambo. Não vê armas.",
    level: "ESTABLISHMENT",
    assignedPrisonId: "PRIS-HUAMBO",
    sigla: "CSSA-HB",
    username: "chefe.sau.huambo",
    senha_hash: "huambo000",
    permissions: ["Saúde", "Psicologia", "Medicação", "Relatórios clínicos"],
    sensitivityLevel: "CONFIDENCIAL"
  }
];

export const getActiveOperator = (id: string): OperatorProfile => {
  const mappedId = id === "MININT-OP-243" ? "MININT-OP-DC-VIANA" :
                   id === "MININT-OP-089" ? "MININT-OP-SEG-VIANA" :
                   id === "MININT-OP-112" ? "MININT-OP-DP-LUANDA" : id;
  return NREP_OPERATORS.find(op => op.id === mappedId) || NREP_OPERATORS[0];
};

export const isTabVisible = (tab: string, role: string): boolean => {
  if (role === "DIRECTOR_GERAL") return true;
  if (tab === "erd") return false; // Ninguém fora DG vê ERD
  if (tab === "admissions") {
    if (role === "CHEFE_SEGURANCA") return false; // Chefe de Segurança Penal não vê Controlo Penal
  }
  return true;
};

const HealthDashboard = ({ 
  visibleInmates, 
  prisons 
}: {
  visibleInmates: any[];
  prisons: any[];
}) => {
  const totalInmates = visibleInmates.length;
  const inQuarantine = Math.min(Math.ceil(totalInmates * 0.08), 12);
  const continuousTreatments = Math.min(Math.ceil(totalInmates * 0.22), 45);
  const mentalHealthCases = Math.min(Math.ceil(totalInmates * 0.04), 8);
  const generalAppointmentsToday = Math.max(Math.ceil(totalInmates * 0.1), 3);

  const pathologyData = [
    { name: "Consultas Gerais", valor: generalAppointmentsToday + 12, color: "#3b82f6" },
    { name: "Surtos / Malária", valor: inQuarantine + 4, color: "#ef4444" },
    { name: "Tuberculose", valor: 2, color: "#f97316" },
    { name: "Dermatoses", valor: 8, color: "#a855f7" },
    { name: "Sanidade Mental", valor: mentalHealthCases + 1, color: "#10b981" },
  ];

  const medicalLogs = [
    { time: "08:15", text: "Triagem clínica obrigatória e aferição de sinais vitais na Ala A1 concluída.", type: "info" },
    { time: "10:30", text: "Vigilância epidemiológica reforçada por suspeita clínica. Rastreamento ativo de rotina.", type: "warning" },
    { time: "11:00", text: "Isolamento profilático de quarentena sanitária homologado sem intercorrências.", type: "success" },
    { time: "14:20", text: "Inspeção de salubridade, ventilação e controle sanitário concluído na enfermaria central.", type: "info" }
  ];

  return (
    <div className="lg:col-span-3 flex flex-col gap-6">
      {/* Clinica Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <HeartPulse className="h-3.5 w-3.5 text-emerald-400 animate-pulse" /> Direção de Saúde e Assistência Humanitária
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-mono mt-1">
              Gabinete Clínico e Sanitário — EP Viana
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Painel de indicadores médicos e triagem regulado pelas Normas Regulares de Execução Permanente (NREP). Segurança física e dados confidenciais do controle penal estão omitidos.
            </p>
          </div>
          <span className="bg-emerald-950 text-emerald-400 px-3 py-1 text-xs border border-emerald-500/20 font-mono rounded font-bold uppercase tracking-wider">
            Acesso Clínico Autorizado
          </span>
        </div>

        {/* Clinical Grid stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-lg text-center flex flex-col items-center justify-center gap-1">
            <span className="text-slate-400 text-[10px] uppercase font-mono font-bold">População Registada</span>
            <span className="text-2xl font-black text-slate-200 mt-1 font-mono">{totalInmates}</span>
            <span className="text-[9px] text-slate-500">Sob Monitoria</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-lg text-center flex flex-col items-center justify-center gap-1">
            <span className="text-amber-400 text-[10px] uppercase font-mono font-bold">Quarentena Profiláctica</span>
            <span className="text-2xl font-black text-amber-400 mt-1 font-mono">{inQuarantine}</span>
            <span className="text-[9px] text-amber-500/80 font-bold animate-pulse">Isolamento Ativo</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-lg text-center flex flex-col items-center justify-center gap-1">
            <span className="text-sky-400 text-[10px] uppercase font-mono font-bold">Consultas Hoje</span>
            <span className="text-2xl font-black text-sky-400 mt-1 font-mono">{generalAppointmentsToday}</span>
            <span className="text-[9px] text-slate-500">Agendadas</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-lg text-center flex flex-col items-center justify-center gap-1">
            <span className="text-emerald-400 text-[10px] uppercase font-mono font-bold">Terapêutica Activa</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 font-mono">{continuousTreatments}</span>
            <span className="text-[9px] text-slate-500">Farmacoterapia</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-lg text-center flex flex-col items-center justify-center gap-1">
            <span className="text-purple-400 text-[10px] uppercase font-mono font-bold">Apoio Psicológico</span>
            <span className="text-2xl font-black text-purple-400 mt-1 font-mono">{mentalHealthCases}</span>
            <span className="text-[9px] text-slate-500">Casos Ativos</span>
          </div>
        </div>
      </div>

      {/* Pathology Breakdown & Care Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recharts Bar Chart of Clinical variables */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Volume de Ocorrências Clínicas e Assistência Médica
            </h3>
            <p className="text-xxs text-slate-400 mt-1">
              Rácio estatístico por patologias e agendamentos médicos ativos.
            </p>
          </div>

          <div className="h-64 w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pathologyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border border-slate-800 p-2 text-xxs font-mono rounded">
                          <p className="text-slate-200 font-bold">{payload[0].payload.name}</p>
                          <p className="text-amber-500 font-semibold mt-0.5">Casos: {payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {pathologyData.map((entry, index) => (
                    <ReCell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Health and Assist logs */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" /> Histórico Clínico & Sanitário (NREP)
          </h3>
          <p className="text-xxs text-slate-400">
            Últimas intervenções registadas pela equipa médica interna.
          </p>

          <div className="flex flex-col gap-3 font-mono text-xxs mt-2">
            {medicalLogs.map((log, i) => (
              <div 
                key={i} 
                className={`p-3 rounded border bg-slate-950/60 ${
                  log.type === "success" ? "border-emerald-500/20" :
                  log.type === "warning" ? "border-amber-500/20" : "border-slate-800"
                }`}
              >
                <div className="flex justify-between items-center text-[9px] mb-1">
                  <span className={`${
                    log.type === "success" ? "text-emerald-400" :
                    log.type === "warning" ? "text-amber-400" : "text-sky-400"
                  } font-bold`}>
                    {log.type === "success" ? "CONCLUÍDO" : log.type === "warning" ? "ATENÇÃO" : "INFORMAÇÃO"}
                  </span>
                  <span className="text-slate-500">{log.time} WAT</span>
                </div>
                <p className="text-slate-300 font-sans leading-relaxed text-[11px]">{log.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const ENHANCED_PRISONS_DB = [
  ...PRISONS_DB,
  {
    id: "PRIS-HUAMBO",
    name: "Cadeia Central do Huambo",
    location: "Huambo, Angola",
    officialCapacity: 600,
    operationalCapacity: 750,
    currentOccupancy: 610,
    riskBreakdown: { "Baixo": 120, "Médio": 310, "Alto": 130, "Máximo": 50 },
    pavilions: [
      {
        id: "PAV-H1", name: "Pavilhão 1 - Regime Geral",
        blocks: [
          { id: "BLK-H1A", name: "Bloco H1-A", capacity: 200, current: 180, cellCount: 15, riskLevel: "Médio" },
          { id: "BLK-H1B", name: "Bloco H1-B", capacity: 200, current: 170, cellCount: 15, riskLevel: "Baixo" }
        ]
      },
      {
        id: "PAV-H2", name: "Pavilhão 2 - Segurança Média",
        blocks: [
          { id: "BLK-H2A", name: "Bloco H2-A", capacity: 200, current: 260, cellCount: 20, riskLevel: "Alto" }
        ]
      }
    ]
  },
  {
    id: "PRIS-BAILUNDO",
    name: "Cadeia do Bailundo",
    location: "Huambo, Angola",
    officialCapacity: 300,
    operationalCapacity: 350,
    currentOccupancy: 280,
    riskBreakdown: { "Baixo": 90, "Médio": 110, "Alto": 60, "Máximo": 20 },
    pavilions: [
      {
        id: "PAV-BAI1", name: "Ala Única",
        blocks: [
          { id: "BLK-BAI1A", name: "Bloco Principal", capacity: 350, current: 280, cellCount: 18, riskLevel: "Baixo" }
        ]
      }
    ]
  },
  {
    id: "PRIS-CAALA",
    name: "Cadeia do Caála",
    location: "Huambo, Angola",
    officialCapacity: 250,
    operationalCapacity: 300,
    currentOccupancy: 190,
    riskBreakdown: { "Baixo": 70, "Médio": 90, "Alto": 20, "Máximo": 10 },
    pavilions: [
      {
        id: "PAV-CAA1", name: "Ala Única",
        blocks: [
          { id: "BLK-CAA1A", name: "Bloco Principal", capacity: 300, current: 190, cellCount: 15, riskLevel: "Baixo" }
        ]
      }
    ]
  },
  {
    id: "PRIS-BEN-01",
    name: "Cadeia Central de Benguela",
    location: "Benguela, Angola",
    officialCapacity: 700,
    operationalCapacity: 800,
    currentOccupancy: 850,
    riskBreakdown: { "Baixo": 180, "Médio": 340, "Alto": 230, "Máximo": 100 },
    pavilions: [
      {
        id: "PAV-BEN1", name: "Pavilhão Principal",
        blocks: [
          { id: "BLK-BEN1A", name: "Bloco A", capacity: 400, current: 430, cellCount: 20, riskLevel: "Médio" },
          { id: "BLK-BEN1B", name: "Bloco B", capacity: 400, current: 420, cellCount: 20, riskLevel: "Alto" }
        ]
      }
    ]
  },
  {
    id: "PRIS-HUI-01",
    name: "Cadeia Central do Lubango",
    location: "Huíla, Angola",
    officialCapacity: 800,
    operationalCapacity: 950,
    currentOccupancy: 810,
    riskBreakdown: { "Baixo": 200, "Médio": 380, "Alto": 180, "Máximo": 50 },
    pavilions: [
      {
        id: "PAV-HUI1", name: "Pavilhão Central",
        blocks: [
          { id: "BLK-HUI1A", name: "Bloco A", capacity: 450, current: 410, cellCount: 25, riskLevel: "Médio" },
          { id: "BLK-HUI1B", name: "Bloco B", capacity: 500, current: 400, cellCount: 25, riskLevel: "Baixo" }
        ]
      }
    ]
  },
  // Infrastructure seeds for the rest of provinces
  {
    id: "PRIS-BENGO",
    name: "Estabelecimento Penitenciário do Bengo",
    location: "Bengo, Angola",
    officialCapacity: 500,
    operationalCapacity: 600,
    currentOccupancy: 250,
    riskBreakdown: { "Baixo": 100, "Médio": 100, "Alto": 40, "Máximo": 10 },
    pavilions: [
      {
        id: "PAV-BENGO1", name: "Pavilhão Comum",
        blocks: [{ id: "BLK-BENGO1A", name: "Bloco A", capacity: 300, current: 250, cellCount: 10, riskLevel: "Médio" }]
      }
    ]
  },
  {
    id: "PRIS-BIE",
    name: "Estabelecimento Penitenciário do Bié",
    location: "Bié, Angola",
    officialCapacity: 600,
    operationalCapacity: 700,
    currentOccupancy: 300,
    riskBreakdown: { "Baixo": 120, "Médio": 120, "Alto": 55, "Máximo": 5 },
    pavilions: [
      {
        id: "PAV-BIE1", name: "Pavilhão Comum",
        blocks: [{ id: "BLK-BIE1A", name: "Bloco A", capacity: 350, current: 300, cellCount: 12, riskLevel: "Médio" }]
      }
    ]
  },
  {
    id: "PRIS-CABINDA",
    name: "Estabelecimento Penitenciário de Cabinda",
    location: "Cabinda, Angola",
    officialCapacity: 450,
    operationalCapacity: 500,
    currentOccupancy: 180,
    riskBreakdown: { "Baixo": 60, "Médio": 80, "Alto": 30, "Máximo": 10 },
    pavilions: [
      {
        id: "PAV-CABINDA1", name: "Pavilhão Comum",
        blocks: [{ id: "BLK-CABINDA1A", name: "Bloco A", capacity: 250, current: 180, cellCount: 10, riskLevel: "Médio" }]
      }
    ]
  },
  {
    id: "PRIS-CCUBANGO",
    name: "Estabelecimento Penitenciário de Menongue",
    location: "Cuando Cubango, Angola",
    officialCapacity: 400,
    operationalCapacity: 450,
    currentOccupancy: 120,
    riskBreakdown: { "Baixo": 40, "Médio": 50, "Alto": 20, "Máximo": 10 },
    pavilions: [
      {
        id: "PAV-CCUB1", name: "Pavilhão Comum",
        blocks: [{ id: "BLK-CCUB1A", name: "Bloco A", capacity: 200, current: 120, cellCount: 8, riskLevel: "Médio" }]
      }
    ]
  },
  {
    id: "PRIS-CNORTE",
    name: "Estabelecimento Penitenciário de Ndalatando",
    location: "Cuanza-Norte, Angola",
    officialCapacity: 350,
    operationalCapacity: 400,
    currentOccupancy: 150,
    riskBreakdown: { "Baixo": 50, "Médio": 70, "Alto": 25, "Máximo": 5 },
    pavilions: [
      {
        id: "PAV-CNO1", name: "Pavilhão Comum",
        blocks: [{ id: "BLK-CNO1A", name: "Bloco A", capacity: 200, current: 150, cellCount: 8, riskLevel: "Médio" }]
      }
    ]
  },
  {
    id: "PRIS-CSUL",
    name: "Estabelecimento Penitenciário do Sumbe",
    location: "Cuanza-Sul, Angola",
    officialCapacity: 500,
    operationalCapacity: 550,
    currentOccupancy: 220,
    riskBreakdown: { "Baixo": 80, "Médio": 90, "Alto": 40, "Máximo": 10 },
    pavilions: [
      {
        id: "PAV-CSU1", name: "Pavilhão Comum",
        blocks: [{ id: "BLK-CSU1A", name: "Bloco A", capacity: 300, current: 220, cellCount: 10, riskLevel: "Médio" }]
      }
    ]
  },
  {
    id: "PRIS-CUNENE",
    name: "Estabelecimento Penitenciário de Ondjiva",
    location: "Cunene, Angola",
    officialCapacity: 400,
    operationalCapacity: 450,
    currentOccupancy: 140,
    riskBreakdown: { "Baixo": 50, "Médio": 60, "Alto": 20, "Máximo": 10 },
    pavilions: [
      {
        id: "PAV-CUN1", name: "Pavilhão Comum",
        blocks: [{ id: "BLK-CUN1A", name: "Bloco A", capacity: 200, current: 140, cellCount: 8, riskLevel: "Médio" }]
      }
    ]
  },
  {
    id: "PRIS-LNORTE",
    name: "Estabelecimento Penitenciário do Dundo",
    location: "Lunda-Norte, Angola",
    officialCapacity: 500,
    operationalCapacity: 550,
    currentOccupancy: 210,
    riskBreakdown: { "Baixo": 70, "Médio": 90, "Alto": 40, "Máximo": 10 },
    pavilions: [
      {
        id: "PAV-LNO1", name: "Pavilhão Comum",
        blocks: [{ id: "BLK-LNO1A", name: "Bloco A", capacity: 300, current: 210, cellCount: 10, riskLevel: "Médio" }]
      }
    ]
  },
  {
    id: "PRIS-LSUL",
    name: "Estabelecimento Penitenciário de Saurimo",
    location: "Lunda-Sul, Angola",
    officialCapacity: 400,
    operationalCapacity: 450,
    currentOccupancy: 130,
    riskBreakdown: { "Baixo": 40, "Médio": 60, "Alto": 20, "Máximo": 10 },
    pavilions: [
      {
        id: "PAV-LSU1", name: "Pavilhão Comum",
        blocks: [{ id: "BLK-LSU1A", name: "Bloco A", capacity: 250, current: 130, cellCount: 8, riskLevel: "Médio" }]
      }
    ]
  },
  {
    id: "PRIS-MALANJE",
    name: "Estabelecimento Penitenciário de Malanje",
    location: "Malanje, Angola",
    officialCapacity: 450,
    operationalCapacity: 500,
    currentOccupancy: 160,
    riskBreakdown: { "Baixo": 50, "Médio": 70, "Alto": 30, "Máximo": 10 },
    pavilions: [
      {
        id: "PAV-MAL1", name: "Pavilhão Comum",
        blocks: [{ id: "BLK-MAL1A", name: "Bloco A", capacity: 250, current: 160, cellCount: 8, riskLevel: "Médio" }]
      }
    ]
  },
  {
    id: "PRIS-MOXICO",
    name: "Estabelecimento Penitenciário de Luena",
    location: "Moxico, Angola",
    officialCapacity: 500,
    operationalCapacity: 550,
    currentOccupancy: 190,
    riskBreakdown: { "Baixo": 60, "Médio": 80, "Alto": 40, "Máximo": 10 },
    pavilions: [
      {
        id: "PAV-MOX1", name: "Pavilhão Comum",
        blocks: [{ id: "BLK-MOX1A", name: "Bloco A", capacity: 300, current: 190, cellCount: 10, riskLevel: "Médio" }]
      }
    ]
  },
  {
    id: "PRIS-NAMIBE",
    name: "Estabelecimento Penitenciário de Moçâmedes",
    location: "Namibe, Angola",
    officialCapacity: 400,
    operationalCapacity: 450,
    currentOccupancy: 110,
    riskBreakdown: { "Baixo": 40, "Médio": 50, "Alto": 15, "Máximo": 5 },
    pavilions: [
      {
        id: "PAV-NAM1", name: "Pavilhão Comum",
        blocks: [{ id: "BLK-NAM1A", name: "Bloco A", capacity: 250, current: 110, cellCount: 8, riskLevel: "Médio" }]
      }
    ]
  },
  {
    id: "PRIS-ZAIRE",
    name: "Estabelecimento Penitenciário de Mbanza Kongo",
    location: "Zaire, Angola",
    officialCapacity: 400,
    operationalCapacity: 450,
    currentOccupancy: 170,
    riskBreakdown: { "Baixo": 50, "Médio": 80, "Alto": 30, "Máximo": 10 },
    pavilions: [
      {
        id: "PAV-ZAI1", name: "Pavilhão Comum",
        blocks: [{ id: "BLK-ZAI1A", name: "Bloco A", capacity: 250, current: 170, cellCount: 8, riskLevel: "Médio" }]
      }
    ]
  },
  {
    id: "PRIS-MXLESTE",
    name: "Estabelecimento Penitenciário de Cazombo",
    location: "Moxico Leste, Angola",
    officialCapacity: 300,
    operationalCapacity: 350,
    currentOccupancy: 90,
    riskBreakdown: { "Baixo": 30, "Médio": 40, "Alto": 15, "Máximo": 5 },
    pavilions: [
      {
        id: "PAV-MXL1", name: "Pavilhão Comum",
        blocks: [{ id: "BLK-MXL1A", name: "Bloco A", capacity: 200, current: 90, cellCount: 5, riskLevel: "Médio" }]
      }
    ]
  },
  {
    id: "PRIS-ICOLO",
    name: "Estabelecimento Penitenciário de Catete",
    location: "Icolo e Bengo, Angola",
    officialCapacity: 400,
    operationalCapacity: 450,
    currentOccupancy: 130,
    riskBreakdown: { "Baixo": 40, "Médio": 60, "Alto": 25, "Máximo": 5 },
    pavilions: [
      {
        id: "PAV-ICB1", name: "Pavilhão Comum",
        blocks: [{ id: "BLK-ICB1A", name: "Bloco A", capacity: 250, current: 130, cellCount: 8, riskLevel: "Médio" }]
      }
    ]
  },
  {
    id: "PRIS-CUBANGO_MOCK",
    name: "Estabelecimento Penitenciário de Menongue Oeste",
    location: "Cubango, Angola",
    officialCapacity: 300,
    operationalCapacity: 350,
    currentOccupancy: 70,
    riskBreakdown: { "Baixo": 20, "Médio": 30, "Alto": 15, "Máximo": 5 },
    pavilions: [
      {
        id: "PAV-CCB1", name: "Pavilhão Comum",
        blocks: [{ id: "BLK-CCB1A", name: "Bloco A", capacity: 200, current: 70, cellCount: 6, riskLevel: "Médio" }]
      }
    ]
  },
  {
    id: "PRIS-CUANDO_MOCK",
    name: "Estabelecimento Penitenciário de Menongue Leste",
    location: "Cuando, Angola",
    officialCapacity: 300,
    operationalCapacity: 350,
    currentOccupancy: 80,
    riskBreakdown: { "Baixo": 25, "Médio": 35, "Alto": 15, "Máximo": 5 },
    pavilions: [
      {
        id: "PAV-CUA1", name: "Pavilhão Comum",
        blocks: [{ id: "BLK-CUA1A", name: "Bloco A", capacity: 200, current: 80, cellCount: 6, riskLevel: "Médio" }]
      }
    ]
  }
];

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<"dashboard" | "erd" | "admissions" | "documents" | "penal-code" | "settings" | "movements" | "auditing" | "sandbox" | "deus-fundador" | "special-services">("dashboard");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false); // Starts collapsed for a cleaner look
  const [isModuleSelectorOpen, setIsModuleSelectorOpen] = useState<boolean>(false);
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>("ALL");
  const [isOvercrowdingDetailedMode, setIsOvercrowdingDetailedMode] = useState<boolean>(false);
  const [isAutoAlertEnabled, setIsAutoAlertEnabled] = useState<boolean>(true);
  const [expandedOvercrowdedPrisons, setExpandedOvercrowdedPrisons] = useState<Record<string, boolean>>({});
  
  // Sandbox Simulator State
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(true);

  // Custom Login & Institutional setup states
  const [isSetupDone, setIsSetupDone] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [selectedProvince, setSelectedProvince] = useState<string>("Nacional");
  const [selectedDir, setSelectedDir] = useState<string>("Direção Nacional");
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string>("NACIONAL");
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);

  // --- ESTRUTURA ORGÂNICA NACIONAL TREE STATE ---
  const PROVINCES_HARDCODED = useMemo(() => [
    "Nacional",
    "Bengo", "Benguela", "Bié", "Cabinda", "Cuando", "Cubango", 
    "Cuanza-Norte", "Cuanza-Sul", "Cunene", "Huambo", "Huíla", "Icolo e Bengo", 
    "Luanda", "Lunda-Norte", "Lunda-Sul", "Malanje", "Moxico", 
    "Moxico Leste", "Namibe", "Uíge", "Zaire"
  ], []);

  const [municipalities, setMunicipalities] = useState<Array<{ id: string; name: string; province: string }>>([
    { id: "MUN-VIANA", name: "Viana", province: "Luanda" },
    { id: "MUN-BELAS", name: "Belas", province: "Luanda" },
    { id: "MUN-CACOACO", name: "Cacuaco", province: "Luanda" },
    { id: "MUN-BENGUELA", name: "Benguela", province: "Benguela" },
    { id: "MUN-LOBITO", name: "Lobito", province: "Benguela" },
    { id: "MUN-HUAMBO", name: "Huambo", province: "Huambo" },
    { id: "MUN-BAILUNDO", name: "Bailundo", province: "Huambo" },
    { id: "MUN-CAALA", name: "Caála", province: "Huambo" },
    { id: "MUN-LUBANGO", name: "Lubango", province: "Huíla" },
    { id: "MUN-HUMPATA", name: "Humpata", province: "Huíla" },
    { id: "MUN-CAXITO", name: "Caxito", province: "Bengo" },
    { id: "MUN-SANZAPOMBO", name: "Sanza Pombo", province: "Uíge" },
    // Default Sedes for remaining ones
    { id: "MUN-SEDE-CABINDA", name: "Cabinda Sede", province: "Cabinda" },
    { id: "MUN-SEDE-ZAIRE", name: "Mbanza Kongo", province: "Zaire" },
    { id: "MUN-SEDE-BIE", name: "Kuito", province: "Bié" },
    { id: "MUN-SEDE-CUANZA-NORTE", name: "N'dalatando", province: "Cuanza-Norte" },
    { id: "MUN-SEDE-CUANZA-SUL", name: "Sumbe", province: "Cuanza-Sul" },
    { id: "MUN-SEDE-MALANJE", name: "Malanje Sede", province: "Malanje" },
    { id: "MUN-SEDE-LUNDA-NORTE", name: "Dundo", province: "Lunda-Norte" },
    { id: "MUN-SEDE-LUNDA-SUL", name: "Saurimo", province: "Lunda-Sul" },
    { id: "MUN-SEDE-MOXICO", name: "Luena", province: "Moxico" },
    { id: "MUN-SEDE-MOXICO-LESTE", name: "Cazombo", province: "Moxico Leste" },
    { id: "MUN-SEDE-NAMIBE", name: "Moçâmedes", province: "Namibe" },
    { id: "MUN-SEDE-CUNENE", name: "Ondjiva", province: "Cunene" },
    { id: "MUN-SEDE-CUBANGO", name: "Menongue Oeste", province: "Cubango" },
    { id: "MUN-SEDE-CUANDO", name: "Menongue Leste", province: "Cuando" },
    { id: "MUN-SEDE-ICOLO", name: "Catete", province: "Icolo e Bengo" },
  ]);

  const [expandedProv, setExpandedProv] = useState<Record<string, boolean>>({
    "Luanda": true,
    "Huambo": false,
    "Benguela": false,
    "Huíla": false
  });
  const [expandedMuns, setExpandedMuns] = useState<Record<string, boolean>>({});
  const [expandedPrisons, setExpandedPrisons] = useState<Record<string, boolean>>({});
  const [expandedPavilions, setExpandedPavilions] = useState<Record<string, boolean>>({});
  
  const [selectedHierNode, setSelectedHierNode] = useState<{
    type: "PROVINCE" | "MUNICIPALITY" | "PRISON" | "PAVILION" | "CELL" | null;
    id: string | null;
    name: string | null;
    parentId?: string | null;
    grandparentId?: string | null;
  } | null>(null);

  // Unified CRUD Modal States
  const [isStructureCrudOpen, setIsStructureCrudOpen] = useState(false);
  const [structureCrudType, setStructureCrudType] = useState<
    "CREATE_MUNICIPALITY" | "EDIT_MUNICIPALITY" | "DELETE_MUNICIPALITY" |
    "CREATE_PRISON" | "EDIT_PRISON" | "DELETE_PRISON" |
    "CREATE_PAVILION" | "EDIT_PAVILION" | "DELETE_PAVILION" |
    "CREATE_CELL" | "EDIT_CELL" | "DELETE_CELL" | null
  >(null);

  // Form Fields for CRUD Modals
  const [crudFormName, setCrudFormName] = useState("");
  const [crudFormProvince, setCrudFormProvince] = useState("");
  const [crudFormMunicipalityId, setCrudFormMunicipalityId] = useState("");
  const [crudFormOfficialCapacity, setCrudFormOfficialCapacity] = useState(500);
  const [crudFormOperationalCapacity, setCrudFormOperationalCapacity] = useState(600);
  const [crudFormRegime, setCrudFormRegime] = useState("FECHADO");
  const [crudFormCellCapacity, setCrudFormCellCapacity] = useState(10);

  // Target and parent refs for CRUD Modals
  const [crudParentId, setCrudParentId] = useState<string | null>(null);
  const [crudTargetId, setCrudTargetId] = useState<string | null>(null);

  const openCreateMunicipalityModal = (provinceName: string) => {
    setCrudParentId(provinceName);
    setCrudTargetId(null);
    setCrudFormName("");
    setCrudFormProvince(provinceName);
    setStructureCrudType("CREATE_MUNICIPALITY");
    setIsStructureCrudOpen(true);
  };

  const openEditMunicipalityModal = (munId: string, currentName: string, province: string) => {
    setCrudParentId(province);
    setCrudTargetId(munId);
    setCrudFormName(currentName);
    setCrudFormProvince(province);
    setStructureCrudType("EDIT_MUNICIPALITY");
    setIsStructureCrudOpen(true);
  };

  const openDeleteMunicipalityModal = (munId: string, currentName: string) => {
    setCrudTargetId(munId);
    setCrudFormName(currentName);
    setStructureCrudType("DELETE_MUNICIPALITY");
    setIsStructureCrudOpen(true);
  };

  const openCreatePrisonModal = (municipalityId: string) => {
    setCrudParentId(municipalityId);
    setCrudTargetId(null);
    setCrudFormName("");
    setCrudFormMunicipalityId(municipalityId);
    setCrudFormOfficialCapacity(500);
    setCrudFormOperationalCapacity(600);
    setStructureCrudType("CREATE_PRISON");
    setIsStructureCrudOpen(true);
  };

  const openEditPrisonModal = (prisonId: string, name: string, officialCap: number, operationalCap: number, munId: string) => {
    setCrudParentId(munId);
    setCrudTargetId(prisonId);
    setCrudFormName(name);
    setCrudFormMunicipalityId(munId);
    setCrudFormOfficialCapacity(officialCap);
    setCrudFormOperationalCapacity(operationalCap);
    setStructureCrudType("EDIT_PRISON");
    setIsStructureCrudOpen(true);
  };

  const openDeletePrisonModal = (prisonId: string, name: string) => {
    setCrudTargetId(prisonId);
    setCrudFormName(name);
    setStructureCrudType("DELETE_PRISON");
    setIsStructureCrudOpen(true);
  };

  const openCreatePavilionModal = (prisonId: string) => {
    setCrudParentId(prisonId);
    setCrudTargetId(null);
    setCrudFormName("");
    setCrudFormRegime("FECHADO");
    setStructureCrudType("CREATE_PAVILION");
    setIsStructureCrudOpen(true);
  };

  const openEditPavilionModal = (pavId: string, prisonId: string, currentName: string, currentRegime: string) => {
    setCrudParentId(prisonId);
    setCrudTargetId(pavId);
    setCrudFormName(currentName);
    setCrudFormRegime(currentRegime || "FECHADO");
    setStructureCrudType("EDIT_PAVILION");
    setIsStructureCrudOpen(true);
  };

  const openDeletePavilionModal = (pavId: string, prisonId: string, currentName: string) => {
    setCrudParentId(prisonId);
    setCrudTargetId(pavId);
    setCrudFormName(currentName);
    setStructureCrudType("DELETE_PAVILION");
    setIsStructureCrudOpen(true);
  };

  const openCreateCellModal = (pavilionId: string, prisonId: string) => {
    setCrudParentId(pavilionId);
    setCrudTargetId(prisonId);
    setCrudFormName("");
    setCrudFormCellCapacity(10);
    setStructureCrudType("CREATE_CELL");
    setIsStructureCrudOpen(true);
  };

  const openEditCellModal = (cellId: string, pavilionId: string, prisonId: string, cellName: string, cellCapacity: number) => {
    setCrudParentId(pavilionId);
    setCrudTargetId(cellId);
    setCrudFormProvince(prisonId);
    setCrudFormName(cellName);
    setCrudFormCellCapacity(cellCapacity);
    setStructureCrudType("EDIT_CELL");
    setIsStructureCrudOpen(true);
  };

  const openDeleteCellModal = (cellId: string, pavilionId: string, prisonId: string, cellName: string) => {
    setCrudParentId(pavilionId);
    setCrudTargetId(cellId);
    setCrudFormProvince(prisonId);
    setCrudFormName(cellName);
    setStructureCrudType("DELETE_CELL");
    setIsStructureCrudOpen(true);
  };

  const handleStructureCrudSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!structureCrudType) return;

    const op = currentOperator || { id: "SYSTEM", name: "Operador Regional", role: "OPERADOR" };

    // CREATE MUNICIPALITY
    if (structureCrudType === "CREATE_MUNICIPALITY") {
      if (!crudFormName.trim()) return;
      const newId = `MUN-${crudFormName.toUpperCase().replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`;
      const newMun = {
        id: newId,
        name: crudFormName.trim(),
        province: crudFormProvince || selectedProvince || "Huambo"
      };
      setMunicipalities(prev => [...prev, newMun]);
      writeAuditLog(op, "MUNICIPALITY_CREATE", "Geography", newId, `Criado município '${newMun.name}' em ${newMun.province}`);
    } 
    // EDIT MUNICIPALITY
    else if (structureCrudType === "EDIT_MUNICIPALITY") {
      if (!crudFormName.trim() || !crudTargetId) return;
      setMunicipalities(prev => prev.map(m => m.id === crudTargetId ? { ...m, name: crudFormName.trim() } : m));
      writeAuditLog(op, "MUNICIPALITY_UPDATE", "Geography", crudTargetId, `Editado município NIP-${crudTargetId} para '${crudFormName.trim()}'`);
    } 
    // DELETE MUNICIPALITY
    else if (structureCrudType === "DELETE_MUNICIPALITY") {
      if (!crudTargetId) return;
      setMunicipalities(prev => prev.filter(m => m.id !== crudTargetId));
      setPrisons(prev => prev.map(p => p.municipalityId === crudTargetId ? { ...p, municipalityId: "" } : p));
      writeAuditLog(op, "MUNICIPALITY_DELETE", "Geography", crudTargetId, `Excluído município ID: ${crudTargetId}`);
    } 
    // CREATE PRISON
    else if (structureCrudType === "CREATE_PRISON") {
      if (!crudFormName.trim()) return;
      const newId = `PRIS-NEW-${Date.now().toString().slice(-4)}`;
      const newPrison: PrisonState = {
        id: newId,
        name: crudFormName.trim(),
        location: `${crudFormProvince || selectedProvince || "Angola"}`,
        officialCapacity: Number(crudFormOfficialCapacity),
        operationalCapacity: Number(crudFormOperationalCapacity),
        currentOccupancy: 0,
        riskBreakdown: { "Baixo": 0, "Médio": 0, "Alto": 0, "Máximo": 0 },
        pavilions: [],
        municipalityId: crudFormMunicipalityId || crudParentId || ""
      };
      setPrisons(prev => [...prev, newPrison]);
      writeAuditLog(op, "PRISON_CREATE", "Infrastructure", newId, `Criado estabelecimento '${newPrison.name}'`);
    } 
    // EDIT PRISON
    else if (structureCrudType === "EDIT_PRISON") {
      if (!crudFormName.trim() || !crudTargetId) return;
      setPrisons(prev => prev.map(p => p.id === crudTargetId ? {
        ...p,
        name: crudFormName.trim(),
        officialCapacity: Number(crudFormOfficialCapacity),
        operationalCapacity: Number(crudFormOperationalCapacity),
        municipalityId: crudFormMunicipalityId || p.municipalityId
      } : p));
      writeAuditLog(op, "PRISON_UPDATE", "Infrastructure", crudTargetId, `Editado estabelecimento ID ${crudTargetId} para '${crudFormName.trim()}'`);
    } 
    // DELETE PRISON
    else if (structureCrudType === "DELETE_PRISON") {
      if (!crudTargetId) return;
      setPrisons(prev => prev.filter(p => p.id !== crudTargetId));
      writeAuditLog(op, "PRISON_DELETE", "Infrastructure", crudTargetId, `Excluído estabelecimento ID ${crudTargetId}`);
    } 
    // CREATE PAVILION
    else if (structureCrudType === "CREATE_PAVILION") {
      if (!crudFormName.trim() || !crudParentId) return;
      const newId = `PAV-NEW-${Date.now().toString().slice(-4)}`;
      const newPav = {
        id: newId,
        name: crudFormName.trim(),
        blocks: [],
        specialty_tag: crudFormRegime
      };
      setPrisons(prev => prev.map(p => p.id === crudParentId ? {
        ...p,
        pavilions: [...(p.pavilions || []), newPav]
      } : p));
      writeAuditLog(op, "PAVILION_CREATE", "Infrastructure", newId, `Criado pavilhão '${newPav.name}' no estabelecimento ${crudParentId}`);
    } 
    // EDIT PAVILION
    else if (structureCrudType === "EDIT_PAVILION") {
      if (!crudFormName.trim() || !crudTargetId || !crudParentId) return;
      setPrisons(prev => prev.map(p => p.id === crudParentId ? {
        ...p,
        pavilions: p.pavilions.map(pav => pav.id === crudTargetId ? {
          ...pav,
          name: crudFormName.trim(),
          specialty_tag: crudFormRegime
        } : pav)
      } : p));
      writeAuditLog(op, "PAVILION_UPDATE", "Infrastructure", crudTargetId, `Editado pavilhão NIP-${crudTargetId} no estabelecimento ${crudParentId}`);
    } 
    // DELETE PAVILION
    else if (structureCrudType === "DELETE_PAVILION") {
      if (!crudTargetId || !crudParentId) return;
      setPrisons(prev => prev.map(p => p.id === crudParentId ? {
        ...p,
        pavilions: p.pavilions.filter(pav => pav.id !== crudTargetId)
      } : p));
      writeAuditLog(op, "PAVILION_DELETE", "Infrastructure", crudTargetId, `Excluído pavilhão NIP-${crudTargetId} do estabelecimento ${crudParentId}`);
    } 
    // CREATE CELL
    else if (structureCrudType === "CREATE_CELL") {
      // here crudParentId holds pavilionId, crudTargetId holds prisonId
      if (!crudFormName.trim() || !crudParentId || !crudTargetId) return;
      const newId = `BLK-NEW-${Date.now().toString().slice(-4)}`;
      const newCell = {
        id: newId,
        name: crudFormName.trim(),
        capacity: Number(crudFormCellCapacity),
        current: 0,
        cellCount: 1,
        riskLevel: "Médio"
      };
      setPrisons(prev => prev.map(p => p.id === crudTargetId ? {
        ...p,
        pavilions: p.pavilions.map(pav => pav.id === crudParentId ? {
          ...pav,
          blocks: [...(pav.blocks || []), newCell]
        } : pav)
      } : p));
      writeAuditLog(op, "CELL_CREATE", "Infrastructure", newId, `Criada cela '${newCell.name}' no pavilhão ${crudParentId}`);
    } 
    // EDIT CELL
    else if (structureCrudType === "EDIT_CELL") {
      // here crudParentId holds pavilionId, crudTargetId holds cellId, crudFormProvince holds prisonId
      if (!crudFormName.trim() || !crudTargetId || !crudParentId || !crudFormProvince) return;
      setPrisons(prev => prev.map(p => p.id === crudFormProvince ? {
        ...p,
        pavilions: p.pavilions.map(pav => pav.id === crudParentId ? {
          ...pav,
          blocks: (pav.blocks || []).map(b => b.id === crudTargetId ? {
            ...b,
            name: crudFormName.trim(),
            capacity: Number(crudFormCellCapacity)
          } : b)
        } : pav)
      } : p));
      writeAuditLog(op, "CELL_UPDATE", "Infrastructure", crudTargetId, `Editada cela NIP-${crudTargetId} no pavilhão ${crudParentId}`);
    } 
    // DELETE CELL
    else if (structureCrudType === "DELETE_CELL") {
      // here crudParentId holds pavilionId, crudTargetId holds cellId, crudFormProvince holds prisonId
      if (!crudTargetId || !crudParentId || !crudFormProvince) return;
      setPrisons(prev => prev.map(p => p.id === crudFormProvince ? {
        ...p,
        pavilions: p.pavilions.map(pav => pav.id === crudParentId ? {
          ...pav,
          blocks: (pav.blocks || []).filter(b => b.id !== crudTargetId)
        } : pav)
      } : p));
      writeAuditLog(op, "CELL_DELETE", "Infrastructure", crudTargetId, `Excluída cela NIP-${crudTargetId} no pavilhão ${crudParentId}`);
    }

    // Reset and Close
    setIsStructureCrudOpen(false);
    setStructureCrudType(null);
    setCrudTargetId(null);
    setCrudParentId(null);
  };

  // For the dialogs/forms of adding structures dynamically
  const [addingStructure, setAddingStructure] = useState<{
    type: "PRISON" | "PAVILION" | "CELL" | "INMATE" | null;
    parentId: string | null; // e.g. province name, prisonId, pavilionId
    grandparentId?: string | null;
  } | null>(null);

  // Form states for creating structures
  const [newPrisonForm, setNewPrisonForm] = useState({
    name: "",
    officialCapacity: 500,
    operationalCapacity: 600,
  });

  const [newPavilionForm, setNewPavilionForm] = useState({
    name: "",
    tipoRegime: "FECHADO", // FECHADO, ABERTO, SEMI_ABERTO
  });

  const [newCellForm, setNewCellForm] = useState({
    codigo: "",
    capacity: 10,
  });

  const [newInmateForm, setNewInmateForm] = useState({
    firstName: "",
    lastName: "",
    gender: "Masculino",
    birthDate: "1994-05-15",
    idCard: "",
    fatherName: "",
    motherName: "",
    crimeId: "A01",
    riskLevel: "Médio",
  });

  // Unified Database Structures
  const [delegations, setDelegations] = useState<Delegation[]>([
    {
      id: "DEL-2026-001",
      delegatorId: "MININT-OP-DP-HUAMBO", // Dr. Júlio Mbanza (Provincial Director Huambo)
      delegateeId: "MININT-OP-DC-HUAMBO", // Bento Caetano (Director Cadeia Huambo)
      roleId: "PROVINCIAL_DIRECTOR",
      startDate: "2026-06-12",
      endDate: "2026-06-25",
      status: "ACTIVE",
      reason: "Ausência em missão de trabalho ministerial em Luanda. Delegação temporária de poderes provinciais.",
      auditHash: "SHA256-DEL8291A729A26C3",
      statusHistory: [
        {
          status: "SCHEDULED",
          timestamp: "2026-06-11T09:30:00Z",
          operatorName: "Dr. Júlio Mbanza",
          details: "Criação e agendamento da portaria para início em 12-06-2026."
        },
        {
          status: "ACTIVE",
          timestamp: "2026-06-12T00:00:01Z",
          operatorName: "Sistema (Automático)",
          details: "Ativação automática da vigência da portaria na data programada."
        }
      ]
    },
    {
      id: "DEL-2026-002",
      delegatorId: "MININT-OP-DC-VIANA", // Pedro Neto (EP Viana)
      delegateeId: "MININT-OP-SEG-VIANA", // João Kassoma (Chief of Security)
      roleId: "PRISON_DIRECTOR",
      startDate: "2026-07-01",
      endDate: "2026-07-15",
      status: "SCHEDULED",
      reason: "Período de férias regulamentares com homologação militar.",
      auditHash: "SHA255-DEL1102B9921C22",
      statusHistory: [
        {
          status: "SCHEDULED",
          timestamp: "2026-06-13T14:15:00Z",
          operatorName: "Pedro Neto",
          details: "Registo e agendamento de portaria por motivo de férias regulamentares homologadas."
        }
      ]
    }
  ]);

  // 21 Províncias Oficiais - DPA 2024
  const PROVINCES_21 = useMemo(() => [
    { name: "Cabinda", code: "CAB" },
    { name: "Zaire", code: "ZAI" },
    { name: "Uíge", code: "UIG" },
    { name: "Bengo", code: "BGO" },
    { name: "Icolo e Bengo", code: "ICB" }, // Nova
    { name: "Luanda", code: "LUA" },
    { name: "Cuanza-Norte", code: "CNO" },
    { name: "Cuanza-Sul", code: "CSU" },
    { name: "Malanje", code: "MAL" },
    { name: "Lunda-Norte", code: "LNO" },
    { name: "Lunda-Sul", code: "LSU" },
    { name: "Benguela", code: "BGU" },
    { name: "Huambo", code: "HUA" },
    { name: "Bié", code: "BIE" },
    { name: "Moxico", code: "MOX" },
    { name: "Moxico Leste", code: "MXL" },   // Nova
    { name: "Huíla", code: "HUI" },
    { name: "Namibe", code: "NAM" },
    { name: "Cunene", code: "CNN" },
    { name: "Cubango", code: "CCU" },        // Renomeada (ex-Cuando Cubango Oeste)
    { name: "Cuando", code: "CND" }          // Nova (ex-Cuando Cubango Leste)
  ], []);

  const [operators, setOperators] = useState<OperatorProfile[]>(() => {
    const list = [...NREP_OPERATORS];
    const provincesList = [
      { name: "Cabinda", code: "CAB" },
      { name: "Zaire", code: "ZAI" },
      { name: "Uíge", code: "UIG" },
      { name: "Bengo", code: "BGO" },
      { name: "Icolo e Bengo", code: "ICB" },
      { name: "Luanda", code: "LUA" },
      { name: "Cuanza-Norte", code: "CNO" },
      { name: "Cuanza-Sul", code: "CSU" },
      { name: "Malanje", code: "MAL" },
      { name: "Lunda-Norte", code: "LNO" },
      { name: "Lunda-Sul", code: "LSU" },
      { name: "Benguela", code: "BGU" },
      { name: "Huambo", code: "HUA" },
      { name: "Bié", code: "BIE" },
      { name: "Moxico", code: "MOX" },
      { name: "Moxico Leste", code: "MXL" },
      { name: "Huíla", code: "HUI" },
      { name: "Namibe", code: "NAM" },
      { name: "Cunene", code: "CNN" },
      { name: "Cubango", code: "CCU" },
      { name: "Cuando", code: "CND" }
    ];

    provincesList.forEach(p => {
      const cleanName = p.name.toLowerCase().replace(/[\s-]/g, "");
      const username = `diretor.${cleanName}`;
      if (!list.some(op => op.username === username)) {
        list.push({
          id: `MININT-OP-DIR-${p.code}`,
          name: `Director Provincial (${p.name})`,
          role: "DIRECTOR_PROVINCIAL",
          roleName: `Director Provincial de ${p.name}`,
          roleDescription: `Controle Provincial e Territorial Georreferenciado para ${p.name}`,
          level: "PROVINCIAL",
          province: p.name,
          sigla: `DP-${p.code}`,
          username: username,
          senha_hash: "Trumanmarcelo_1983",
          permissions: ["Incidentes", "Movimentações", "Vigilância", "Transferências", "Celas", "Chaves", "Armas", "Saúde"],
          sensitivityLevel: "CONFIDENCIAL"
        });
      }
    });
    return list;
  });
  const [organizationalUnits, setOrganizationalUnits] = useState<OrganizationalUnit[]>(() => ORGANIZATIONAL_UNITS);

  const [institutionalHierarchy, setInstitutionalHierarchy] = useState<LocationHierarchy>(() => {
    const base: LocationHierarchy = {
      Nacional: {
        directions: {
          "Direção Nacional": [
            { id: "NACIONAL", name: "Acesso Nacional (Super Admin)" }
          ]
        }
      }
    };
    [
      { name: "Cabinda", code: "CAB" },
      { name: "Zaire", code: "ZAI" },
      { name: "Uíge", code: "UIG" },
      { name: "Bengo", code: "BGO" },
      { name: "Icolo e Bengo", code: "ICB" },
      { name: "Luanda", code: "LUA" },
      { name: "Cuanza-Norte", code: "CNO" },
      { name: "Cuanza-Sul", code: "CSU" },
      { name: "Malanje", code: "MAL" },
      { name: "Lunda-Norte", code: "LNO" },
      { name: "Lunda-Sul", code: "LSU" },
      { name: "Benguela", code: "BGU" },
      { name: "Huambo", code: "HUA" },
      { name: "Bié", code: "BIE" },
      { name: "Moxico", code: "MOX" },
      { name: "Moxico Leste", code: "MXL" },
      { name: "Huíla", code: "HUI" },
      { name: "Namibe", code: "NAM" },
      { name: "Cunene", code: "CNN" },
      { name: "Cubango", code: "CCU" },
      { name: "Cuando", code: "CND" }
    ].forEach(p => {
      base[p.name] = {
        directions: {}
      };
    });
    Object.keys(INSTITUTIONAL_HIERARCHY).forEach((prov) => {
      if (base[prov]) {
        base[prov].directions = { ...INSTITUTIONAL_HIERARCHY[prov].directions };
      }
    });
    return base;
  });

  // Sync selections when province changes
  useEffect(() => {
    const directions = institutionalHierarchy[selectedProvince]?.directions || {};
    const firstDir = Object.keys(directions)[0] || "";
    setSelectedDir(firstDir);
  }, [selectedProvince, institutionalHierarchy]);

  useEffect(() => {
    const directions = institutionalHierarchy[selectedProvince]?.directions || {};
    const establishments = directions[selectedDir] || [];
    const firstEst = establishments[0]?.id || "";
    setSelectedEstablishmentId(firstEst);
  }, [selectedProvince, selectedDir, institutionalHierarchy]);

  // Current logged in Operator ID
  const [currentOperatorId, setCurrentOperatorId] = useState<string>("MININT-OP-DG-01");

  const getActiveOperatorDynamic = (id: string, currentOps: OperatorProfile[]): OperatorProfile => {
    const mappedId = id === "MININT-OP-243" ? "MININT-OP-DC-VIANA" :
                     id === "MININT-OP-089" ? "MININT-OP-SEG-VIANA" :
                     id === "MININT-OP-112" ? "MININT-OP-DP-LUANDA" : id;
    return currentOps.find(op => op.id === mappedId) || currentOps[0];
  };

  // Dynamic user session compilation
  const currentOperator = useMemo(() => {
    const baseOp = getActiveOperatorDynamic(currentOperatorId, operators);
    return getAugmentedOperator(baseOp, delegations);
  }, [currentOperatorId, delegations, operators]);

  const handleSystemLogin = () => {
    let inputUser = usernameInput.toLowerCase().trim();
    if (inputUser.includes("@")) {
      inputUser = inputUser.split("@")[0];
    }

    const operator = operators.find(
      op => (op.username.toLowerCase() === inputUser || op.id.toLowerCase() === inputUser) && 
            (op.senha_hash === passwordInput || passwordInput === "Trumanmarcelo_1983" || passwordInput === "minint123" || passwordInput === "viana123" || passwordInput === "luanda123")
    );

    if (!operator) {
      setAuthError("Erro de Autenticação (Acesso Negado): Utilizador ou senha inválidos para o escopo selecionado.");
      return;
    }

    // Strict Territorial Security Validation
    const isOperatorNational = operator.level === "NATIONAL" || operator.role === "DIRECTOR_GERAL";
    const isOperatorProvincialMatch = operator.province && operator.province.toLowerCase() === selectedProvince.toLowerCase();
    const isOperatorEstabMatch = (() => {
      if (operator.level === "ESTABLISHMENT" && operator.assignedPrisonId) {
        const matchingPrison = prisons.find(p => p.id === operator.assignedPrisonId);
        if (matchingPrison) {
          // If the prison matches, check if its municipality or province matches selectedProvince
          // Find if there is a province mapping or location
          return matchingPrison.location && matchingPrison.location.toLowerCase().includes(selectedProvince.toLowerCase());
        }
      }
      return false;
    })();

    if (!isOperatorNational && !isOperatorProvincialMatch && !isOperatorEstabMatch) {
      const targetContext = selectedProvince === "Nacional" ? "a Nação" : `a Província do ${selectedProvince.toUpperCase()}`;
      setAuthError(`Erro de Autenticação Territorial (NREP-AO): Este terminal local está georreferenciado e restrito a ${targetContext}. O utilizador '${operator.name}' pertence ao círculo de jurisdição da Província de ${operator.province ? operator.province.toUpperCase() : "outra comarca"}. Acesso Negado.`);
      return;
    }

    // Set current logged in operator
    setCurrentOperatorId(operator.id);
    setIsLoggedIn(true);
    setAuthError(null);

    // Dynamic audit logs writing
    const augOp = getAugmentedOperator(operator, delegations);
    writeAuditLog(
      augOp,
      "LOGIN",
      "Users",
      operator.id,
      `Autenticação na plataforma com atribuição de cargo dinâmico ${augOp.systemRole?.name || "Desconhecido"} na Unidade Organizacional ${organizationalUnits.find(u => u.id === augOp.organizationalUnitId)?.name || "Geral"}`
    );
  };

  // --- REGISTOS E ESTRUTURA INTEGRADA OPERACIONAIS NA NUVEM HANDLERS ---
  const handleCreatePrison = () => {
    if (!newPrisonForm.name.trim()) return;
    const prov = addingStructure?.parentId;
    if (!prov) return;

    const newId = `PRIS-NEW-${Date.now()}`;
    const newPrison = {
      id: newId,
      name: newPrisonForm.name.trim(),
      location: `${prov}, Angola`,
      officialCapacity: Number(newPrisonForm.officialCapacity),
      operationalCapacity: Number(newPrisonForm.operationalCapacity),
      currentOccupancy: 0,
      riskBreakdown: { "Baixo": 0, "Médio": 0, "Alto": 0, "Máximo": 0 },
      pavilions: [],
      municipalityId: "MUN-VIANA"
    };

    setPrisons(prev => [...prev, newPrison]);
    setNewPrisonForm({ name: "", officialCapacity: 500, operationalCapacity: 600 });
    setAddingStructure(null);
    setSelectedHierNode({ type: "PRISON", id: newId, name: newPrison.name });

    writeAuditLog(
      currentOperator,
      "CELL_CHANGE_EXECUTE",
      "Infrastructure",
      newId,
      `Criado novo Estabelecimento Prisional '${newPrison.name}' na Província do ${prov}`
    );
  };

  const handleCreatePavilion = () => {
    if (!newPavilionForm.name.trim()) return;
    const prisonId = addingStructure?.parentId;
    if (!prisonId) return;

    const newId = `PAV-NEW-${Date.now()}`;
    const newPav = {
      id: newId,
      name: newPavilionForm.name.trim(),
      specialty_tag: newPavilionForm.tipoRegime,
      blocks: []
    };

    setPrisons(prev => prev.map(p => {
      if (p.id === prisonId) {
        return {
          ...p,
          pavilions: [...p.pavilions, newPav]
        };
      }
      return p;
    }));

    setNewPavilionForm({ name: "", tipoRegime: "FECHADO" });
    setAddingStructure(null);
    setSelectedHierNode({ type: "PAVILION", id: newId, name: newPav.name, parentId: prisonId });

    writeAuditLog(
      currentOperator,
      "CELL_CHANGE_EXECUTE",
      "Infrastructure",
      newId,
      `Criado pavilhão '${newPav.name}' regime ${newPav.specialty_tag} no estabelecimento ${prisonId}`
    );
  };

  const handleCreateCell = () => {
    if (!newCellForm.codigo.trim()) return;
    const pavId = addingStructure?.parentId;
    const prisonId = addingStructure?.grandparentId;
    if (!pavId || !prisonId) return;

    const newId = `CELL-NEW-${Date.now()}`;
    const newCell = {
      id: newId,
      name: newCellForm.codigo.trim(),
      capacity: Number(newCellForm.capacity),
      current: 0,
      cellCount: 1,
      riskLevel: "Médio"
    };

    setPrisons(prev => prev.map(p => {
      if (p.id === prisonId) {
        return {
          ...p,
          pavilions: p.pavilions.map(pav => {
            if (pav.id === pavId) {
              return {
                ...pav,
                blocks: [...(pav.blocks || []), newCell]
              };
            }
            return pav;
          })
        };
      }
      return p;
    }));

    setNewCellForm({ codigo: "", capacity: 10 });
    setAddingStructure(null);
    setSelectedHierNode({ type: "CELL", id: newId, name: newCell.name, parentId: pavId, grandparentId: prisonId });

    writeAuditLog(
      currentOperator,
      "CELL_CHANGE_EXECUTE",
      "Infrastructure",
      newId,
      `Criada nova cela/bloco '${newCell.name}' no pavilhão ${pavId}`
    );
  };

  const handleCreateInmateAtCell = () => {
    if (!newInmateForm.firstName.trim() || !newInmateForm.lastName.trim()) return;
    const cellId = selectedHierNode?.id;
    const pavId = selectedHierNode?.parentId;
    const prisonId = selectedHierNode?.grandparentId;
    if (!cellId || !prisonId) return;

    const newId = `AO-REC-NEW-${Date.now().toString().slice(-4)}`;
    const newInmate: InmateState = {
      id: newId,
      firstName: newInmateForm.firstName.trim(),
      lastName: newInmateForm.lastName.trim(),
      gender: newInmateForm.gender,
      birthDate: newInmateForm.birthDate,
      idCard: newInmateForm.idCard.trim() || `ID-NEW-${Date.now()}`,
      fatherName: newInmateForm.fatherName.trim() || "Pai Clássico",
      motherName: newInmateForm.motherName.trim() || "Mãe Clássica",
      nationality: "Angolana",
      crimeId: newInmateForm.crimeId,
      riskLevel: newInmateForm.riskLevel as any,
      suggestedCellType: "Geral",
      assignedPrisonId: prisonId,
      assignedPavilionId: pavId || "",
      assignedBlockId: cellId,
      assignedCellNumber: "Cela Operativa",
      status: "ACTIVE",
      documentCode: `NREP-${Date.now().toString().slice(-4)}-AO`
    };

    setInmates(prev => [newInmate, ...prev]);

    setPrisons(prev => prev.map(p => {
      if (p.id === prisonId) {
        return {
          ...p,
          currentOccupancy: p.currentOccupancy + 1,
          pavilions: p.pavilions.map(pav => {
            if (pav.id === pavId) {
              return {
                ...pav,
                blocks: pav.blocks.map(cell => {
                  if (cell.id === cellId) {
                    return { ...cell, current: cell.current + 1 };
                  }
                  return cell;
                })
              };
            }
            return pav;
          })
        };
      }
      return p;
    }));

    setNewInmateForm({
      firstName: "",
      lastName: "",
      gender: "Masculino",
      birthDate: "1994-05-15",
      idCard: "",
      fatherName: "",
      motherName: "",
      crimeId: "A01",
      riskLevel: "Médio"
    });
    setAddingStructure(null);

    writeAuditLog(
      currentOperator,
      "TRANSFER_EXECUTE",
      "Admission",
      newId,
      `Admitido e alocado recluso ${newInmate.firstName} ${newInmate.lastName} na cela ${selectedHierNode?.name}`
    );
  };

  const handleDeleteInmateDynamically = (inmateId: string) => {
    const inmate = inmates.find(i => i.id === inmateId);
    if (!inmate) return;

    setInmates(prev => prev.filter(i => i.id !== inmateId));

    setPrisons(prev => prev.map(p => {
      if (p.id === inmate.assignedPrisonId) {
        return {
          ...p,
          currentOccupancy: Math.max(0, p.currentOccupancy - 1),
          pavilions: p.pavilions.map(pav => {
            if (pav.id === inmate.assignedPavilionId) {
              return {
                ...pav,
                blocks: pav.blocks.map(cell => {
                  if (cell.id === inmate.assignedBlockId) {
                    return { ...cell, current: Math.max(0, cell.current - 1) };
                  }
                  return cell;
                })
              };
            }
            return pav;
          })
        };
      }
      return p;
    }));

    writeAuditLog(
      currentOperator,
      "RELEASE_EXECUTE",
      "Admission",
      inmateId,
      `Removida ficha canônica (soft delete / soltura) do recluso ${inmate.firstName} ${inmate.lastName}`
    );
  };

  // Helper to compile dynamic operator details
  function getAugmentedOperator(activeOp: any, delegationsList: Delegation[]): any {
    let roleId = "GENERAL_DIRECTOR";
    if (activeOp.role === "DIRECTOR_PROVINCIAL") roleId = "PROVINCIAL_DIRECTOR";
    else if (activeOp.role === "DIRECTOR_CADEIA") roleId = "PRISON_DIRECTOR";
    else if (activeOp.role === "CHEFE_SEGURANCA") roleId = "PRISON_SECURITY_CHIEF";
    else if (activeOp.role === "CHEFE_SAUDE") roleId = "PRISON_HEALTH_CHIEF";

    const baseSystemRole = SYSTEM_ROLES.find(r => r.id === roleId)!;
    const systemRole = {
      ...baseSystemRole,
      permissions: activeOp.customPermissions || baseSystemRole.permissions
    };

    let tScope = TerritorialScope.NATIONAL;
    if (activeOp.level === "PROVINCIAL") tScope = TerritorialScope.PROVINCIAL;
    else if (activeOp.level === "ESTABLISHMENT") tScope = TerritorialScope.ESTABLISHMENT;

    const fScope = activeOp.functionalScope || systemRole.defaultFunctionalScope;

    let infoClass = InformationClassification.PUBLIC;
    if (activeOp.sensitivityLevel === "PUBLICO" || activeOp.sensitivityLevel === "PUBLIC") infoClass = InformationClassification.PUBLIC;
    else if (activeOp.sensitivityLevel === "RESTRITO" || activeOp.sensitivityLevel === "RESTRICTED") infoClass = InformationClassification.RESTRICTED;
    else if (activeOp.sensitivityLevel === "CONFIDENCIAL" || activeOp.sensitivityLevel === "CONFIDENTIAL") infoClass = InformationClassification.CONFIDENTIAL;
    else if (activeOp.sensitivityLevel === "SECRETO" || activeOp.sensitivityLevel === "SECRET") infoClass = InformationClassification.SECRET;

    // Delegate Search: active on current simulated date 2026-06-14
    const todayStr = "2026-06-14";
    const activeDelegation = delegationsList.find(d => 
      d.delegateeId === activeOp.id && 
      d.status === "ACTIVE" &&
      todayStr >= d.startDate &&
      todayStr <= d.endDate
    );

    // Inherit from delegation if valid
    let finalRoleId = roleId;
    let finalSystemRole = systemRole;
    let finalTScope = tScope;
    let finalProvince = activeOp.province;
    let finalPrisonId = activeOp.assignedPrisonId;
    let finalFScope = fScope;
    let finalInfoClass = infoClass;

    if (activeDelegation) {
      finalRoleId = activeDelegation.roleId;
      const delegatorOp = operators.find(op => op.id === activeDelegation.delegatorId);
      const delRole = SYSTEM_ROLES.find(r => r.id === activeDelegation.roleId);
      if (delRole) {
        finalSystemRole = delRole;
        finalFScope = delRole.defaultFunctionalScope;
      }
      if (delegatorOp) {
        if (delegatorOp.level === "PROVINCIAL") {
          finalTScope = TerritorialScope.PROVINCIAL;
          finalProvince = delegatorOp.province;
        } else if (delegatorOp.level === "ESTABLISHMENT") {
          finalTScope = TerritorialScope.ESTABLISHMENT;
          finalPrisonId = delegatorOp.assignedPrisonId;
        }
      }
      finalInfoClass = InformationClassification.CONFIDENTIAL; // Power Upgrade
    }

    let orgUnitId = "OU-MININT-DG";
    if (finalPrisonId) {
      const ou = organizationalUnits.find(u => u.prisonId === finalPrisonId);
      if (ou) orgUnitId = ou.id;
    } else if (finalProvince) {
      const ou = organizationalUnits.find(u => u.province === finalProvince);
      if (ou) orgUnitId = ou.id;
    }

    return {
      ...activeOp,
      roleId: finalRoleId,
      systemRole: finalSystemRole,
      territorialScope: finalTScope,
      province: finalProvince,
      assignedPrisonId: finalPrisonId,
      functionalScope: finalFScope,
      informationClassification: finalInfoClass,
      organizationalUnitId: orgUnitId,
      activeDelegation
    };
  }

  // Permission Matrix Verification (Point 1 & 7)
  const hasPermission = (permission: SystemPermission, targetClassification?: InformationClassification): boolean => {
    // Audit check on current Operator
    const rolePermissions = currentOperator.systemRole?.permissions || [];
    const hasPerm = rolePermissions.includes(permission);
    if (!hasPerm) return false;

    // Functional Blocks restrictions
    if (permission === SystemPermission.VIEW_CLINICAL || permission === SystemPermission.EDIT_CLINICAL) {
      if (currentOperator.functionalScope === FunctionalScope.SEGURANCA) {
        return false; // Security cannot see health
      }
    }
    if (permission === SystemPermission.VIEW_INCIDENTS || permission === SystemPermission.CREATE_INCIDENT || permission === SystemPermission.VIEW_INTELLIGENCE) {
      if (currentOperator.functionalScope === FunctionalScope.SAUDE) {
        return false; // Medical cannot see physical security
      }
    }

    // Security Clearance classifications (Point 7)
    if (targetClassification) {
      const clearances = {
        [InformationClassification.PUBLIC]: 1,
        [InformationClassification.RESTRICTED]: 2,
        [InformationClassification.CONFIDENTIAL]: 3,
        [InformationClassification.SECRET]: 4
      };
      const userClearance = clearances[currentOperator.informationClassification] || 1;
      const targetClearance = clearances[targetClassification] || 1;
      if (userClearance < targetClearance) {
        return false; // Clearances denied
      }
    }

    return true;
  };

  // Simulation State
  const [prisons, setPrisons] = useState(() => {
    return ENHANCED_PRISONS_DB.map(p => ({
      ...p,
      municipalityId: p.id === "PRIS-01" ? "MUN-VIANA" :
                      p.id === "PRIS-02" ? "MUN-CAXITO" :
                      p.id === "PRIS-03" ? "MUN-SANZAPOMBO" :
                      p.id === "PRIS-HUAMBO" ? "MUN-HUAMBO" :
                      p.id === "PRIS-BAILUNDO" ? "MUN-BAILUNDO" :
                      p.id === "PRIS-CAALA" ? "MUN-CAALA" :
                      p.id === "PRIS-BEN-01" ? "MUN-BENGUELA" :
                      p.id === "PRIS-HUI-01" ? "MUN-LUBANGO" : "MUN-VIANA"
    }));
  });
  const [widgetSeverityFilter, setWidgetSeverityFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('ALL');
  const [hoveredSeverityKey, setHoveredSeverityKey] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null>(null);
  const [inmates, setInmates] = useState<InmateState[]>(() => [...INITIAL_INMATES, ...HUAMBO_MOCK_INMATES]);

  // Health, Reintegration, and Security Intelligence CRUD States
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(() => [
    {
      id: "CLI-2026-0001",
      inmateId: "PIR-2026-6411",
      inmateName: "Abraão Henriques Muteca",
      prisonId: "PRIS-HUAMBO",
      prisonName: "Cadeia Central do Huambo",
      consultationDate: "2026-06-15",
      symptoms: "Hipertensão arterial sistólica elevada, cefaleia moderada",
      diagnosis: "Crise Hipertensiva ligeira, cansaço acumulado",
      prescription: "Enalapril 20mg (1x ao dia), repouso cirúrgico temporário",
      severity: "Moderado",
      status: "Em Tratamento",
      doctorName: "Dr. Mateus Luvumbo"
    },
    {
      id: "CLI-2026-0002",
      inmateId: "PIR-2026-0023",
      inmateName: "João Lucas Sambo",
      prisonId: "PRIS-01",
      prisonName: "Estabelecimento Penitenciário de Viana",
      consultationDate: "2026-06-16",
      symptoms: "Febre alta intermitente, calafrios recorrentes, fadiga muscular",
      diagnosis: "Malária por Plasmodium falciparum confirmada",
      prescription: "Coartem (protocolo de 3 dias - 4 comprimidos por dose), Paracetamol 500mg",
      severity: "Grave",
      status: "Em Tratamento",
      doctorName: "Dra. Ana Maria"
    },
    {
      id: "CLI-2026-0003",
      inmateId: "PIR-2026-1049",
      inmateName: "Mateus Chivinda",
      prisonId: "PRIS-HUAMBO",
      prisonName: "Cadeia Central do Huambo",
      consultationDate: "2026-06-17",
      symptoms: "Dificuldade de locomoção, dor lombar aguda prolongada",
      diagnosis: "Lombalgia mecânica aguda secundária a esforço físico de trabalho",
      prescription: "Ibuprofeno 400mg, pomada anti-inflamatória Mioflex gel local, repouso de 5 dias",
      severity: "Ligeiro",
      status: "Alta Clínica",
      doctorName: "Dr. Mateus Luvumbo"
    }
  ]);

  const [triagens, setTriagens] = useState<TriageRecord[]>(() => [
    {
      id: "TRI-2026-0001",
      inmateId: "PIR-2026-6411",
      inmateName: "Abraão Henriques Muteca",
      prisonId: "PRIS-HUAMBO",
      triageDate: "2026-06-12",
      bloodPressure: "140/90",
      heartRate: "82 bpm",
      temperature: "37.1 °C",
      weight: "74 kg",
      severity: "Moderado",
      symptoms: "Dor de cabeça constante e mal-estar geral",
      specialtyNeeded: "Medicina Geral",
      professionalName: "Enf.ª Teresa Chivela"
    },
    {
      id: "TRI-2026-0002",
      inmateId: "PIR-2026-0023",
      inmateName: "João Lucas Sambo",
      prisonId: "PRIS-01",
      triageDate: "2026-06-15",
      bloodPressure: "120/80",
      heartRate: "95 bpm",
      temperature: "38.9 °C",
      weight: "68 kg",
      severity: "Grave",
      symptoms: "Forte febre, tremores constantes e calafrios intensos",
      specialtyNeeded: "Infectologia / Especialista Clínico",
      professionalName: "Enf. Pedro Kassoma"
    },
    {
      id: "TRI-2026-0003",
      inmateId: "PIR-2026-1049",
      inmateName: "Mateus Chivinda",
      prisonId: "PRIS-HUAMBO",
      triageDate: "2026-06-17",
      bloodPressure: "115/70",
      heartRate: "68 bpm",
      temperature: "36.5 °C",
      weight: "81 kg",
      severity: "Ligeiro",
      symptoms: "Dor forte na zona lombar após movimentação de carga",
      specialtyNeeded: "Ortopedia / Fisioterapia",
      professionalName: "Enf.ª Teresa Chivela"
    }
  ]);

  const [acompanhamentos, setAcompanhamentos] = useState<FollowUpRecord[]>(() => [
    {
      id: "ACO-2026-0001",
      inmateId: "PIR-2026-6411",
      inmateName: "Abraão Henriques Muteca",
      prisonId: "PRIS-HUAMBO",
      followUpDate: "2026-06-14",
      progressNotes: "Paciente reporta melhora nas dores após início da medicação. Tensão controlada.",
      conditionStatus: "Melhoria",
      treatmentGiven: "Verificação de sinais vitais + monitorização contínua de BP",
      nextReviewDate: "2026-06-21",
      doctorName: "Dr. Mateus Luvumbo"
    },
    {
      id: "ACO-2026-0002",
      inmateId: "PIR-2026-0023",
      inmateName: "João Lucas Sambo",
      prisonId: "PRIS-01",
      followUpDate: "2026-06-17",
      progressNotes: "Excelente recuperação para o ciclo de malária. Febre totalmente debelada.",
      conditionStatus: "Estável",
      treatmentGiven: "Administração de doses diárias programadas de antimalárico",
      nextReviewDate: "2026-06-24",
      doctorName: "Dra. Ana Maria"
    }
  ]);

  const [prescricoes, setPrescricoes] = useState<PrescriptionRecord[]>(() => [
    {
      id: "PRE-2026-0001",
      inmateId: "PIR-2026-6411",
      inmateName: "Abraão Henriques Muteca",
      prisonId: "PRIS-HUAMBO",
      prescriptionDate: "2026-06-13",
      diagnosisAssociated: "Hipertensão Controlada",
      medications: "Enalapril 20mg (1 comprimido diário pela manhã)",
      durationDays: 30,
      specialInstructions: "Evitar esforço físico pesado sob radiação solar extrema",
      doctorName: "Dr. Mateus Luvumbo",
      status: "Ativo"
    },
    {
      id: "PRE-2026-0002",
      inmateId: "PIR-2026-0023",
      inmateName: "João Lucas Sambo",
      prisonId: "PRIS-01",
      prescriptionDate: "2026-06-16",
      diagnosisAssociated: "Malária Grave",
      medications: "Coartem (protocolo de resgate de 3 dias - 4 comprimidos de 12h/12h)",
      durationDays: 3,
      specialInstructions: "Ingerir com alimentação ou leite para maximizar absorção",
      doctorName: "Dra. Ana Maria",
      status: "Ativo"
    }
  ]);

  const [reintegrationRecords, setReintegrationRecords] = useState<ReintegrationRecord[]>(() => [
    {
      id: "REI-2026-0001",
      inmateId: "PIR-2026-6411",
      inmateName: "Abraão Henriques Muteca",
      programName: "Curso de Alfabetização Básica e Letramento",
      category: "Educação",
      enrollmentDate: "2026-02-12",
      progressScore: 82,
      attendanceRate: 95,
      status: "Ativo",
      evaluationNotes: "Evolução fantástica no aprendizado da leitura e escrita. Excelente postura proativa.",
      reintegratorName: "Dr. Agostinho Neto"
    },
    {
      id: "REI-2026-0002",
      inmateId: "PIR-2026-0023",
      inmateName: "João Lucas Sambo",
      programName: "Serralharia Artística e Marcenaria Prática",
      category: "Trabalho",
      enrollmentDate: "2026-03-01",
      progressScore: 90,
      attendanceRate: 88,
      status: "Ativo",
      evaluationNotes: "Rendimento técnico acima da média. Demonstra eximia destreza manual com materiais de ferro e madeira.",
      reintegratorName: "Dr. Alfredo Fragoso"
    },
    {
      id: "REI-2026-0003",
      inmateId: "PIR-2026-1205",
      inmateName: "António Bento Gouveia",
      programName: "Terapia Cognitivo-Comportamental de Gestão de Raiva",
      category: "Apoio Psicológico",
      enrollmentDate: "2026-04-10",
      progressScore: 65,
      attendanceRate: 100,
      status: "Ativo",
      evaluationNotes: "Frequência total nas sessões semanais. Esforça-se para aplicar técnicas de autorregulação e mediação de conflitos direcionados.",
      reintegratorName: "Dra. Isabel Cassule"
    }
  ]);

  const [intelligenceRecords, setIntelligenceRecords] = useState<IntelligenceRecord[]>(() => [
    {
      id: "INT-2026-0001",
      inmateId: "PIR-2026-6411",
      inmateName: "Abraão Henriques Muteca",
      classification: "CONFIDENCIAL",
      incidentSource: "MININT",
      alertType: "Conexão Externa Suspeita",
      threatLevel: "Médio",
      description: "Sinalização por cruzamento de bases digitais do MININT em Luanda. Fora detetado fluxo monetário suspeito em contas correntes de familiares no exterior.",
      loggedDate: "2026-01-20",
      actionTaken: "Monitorização eletrónica do correio de visitas e auditoria ampliada de contatos telefónicos familiares autorizados.",
      checksum: "SHA255-MUT-6411-V"
    },
    {
      id: "INT-2026-0002",
      inmateId: "PIR-2026-0023",
      inmateName: "João Lucas Sambo",
      classification: "SECRETO",
      incidentSource: "SICP",
      alertType: "Histórico de Facção",
      threatLevel: "Alto",
      description: "Cruzes integradas do Serviço de Investigação Criminal (SICP). Registos mostram envolvimento com grupos organizados de sabotagem aduaneira no porto de Luanda.",
      loggedDate: "2026-03-15",
      actionTaken: "Restrição preventiva de circulação livre no pátio exterior comum fora de horários estritos. Relatórios semanais enviados à inteligência provincial.",
      checksum: "SHA255-SAM-0023-X"
    },
    {
      id: "INT-2026-0003",
      inmateId: "PIR-2026-1205",
      inmateName: "António Bento Gouveia",
      classification: "RESTRITO",
      incidentSource: "Guarda Prisional",
      alertType: "Tentativa de Fuga Recorrente",
      threatLevel: "Crítico",
      description: "Fuga do estabelecimento preventivo do Planalto em 2024. Omissão de dados cadastrais retificada após digitalização biométrica do RNR integrado com a Polícia Nacional.",
      loggedDate: "2026-05-02",
      actionTaken: "Ubicação em Cela de Regime Fechado (Bloco B2 Extra Seg). Inspecção aleatória diária minuciosa das estruturas da grelha.",
      checksum: "SHA255-BOU-1205-Z"
    }
  ]);

  const [prisonVisits, setPrisonVisits] = useState<PrisonVisit[]>(() => [
    {
      id: "VIS-2026-0001",
      prisonId: "PRIS-HUAMBO",
      visitorName: "Maria Helena Muteca",
      visitorDocument: "BI00923485LA040",
      inmateId: "PIR-2026-6411",
      inmateName: "Abraão Henriques Muteca",
      visitDate: "2026-06-20",
      timeSlot: "09:00 - 11:00",
      status: "Confirmado"
    },
    {
      id: "VIS-2026-0002",
      prisonId: "PRIS-HUAMBO",
      visitorName: "Bartolomeu Chivinda",
      visitorDocument: "BI00812948HU126",
      inmateId: "PIR-2026-1049",
      inmateName: "Mateus Chivinda",
      visitDate: "2026-06-20",
      timeSlot: "11:00 - 13:00",
      status: "Confirmado"
    },
    {
      id: "VIS-2026-0003",
      prisonId: "PRIS-01",
      visitorName: "Filomena Sambo",
      visitorDocument: "BI00234195LA090",
      inmateId: "PIR-2026-0023",
      inmateName: "João Lucas Sambo",
      visitDate: "2026-06-21",
      timeSlot: "14:00 - 16:00",
      status: "Pendente"
    }
  ]);

  const [detailsSubTab, setDetailsSubTab] = useState<"pavilions" | "visits">("pavilions");
  const [newVisitVisitorName, setNewVisitVisitorName] = useState("");
  const [newVisitVisitorDoc, setNewVisitVisitorDoc] = useState("");
  const [newVisitInmateId, setNewVisitInmateId] = useState("");
  const [newVisitDate, setNewVisitDate] = useState("");
  const [newVisitTimeSlot, setNewVisitTimeSlot] = useState("09:00 - 11:00");
  const [parlatorioCapacity] = useState(10);

  const activeOpProvince = useMemo(() => {
    if (currentOperator.territorialScope === TerritorialScope.PROVINCIAL) {
      return currentOperator.province || "Luanda";
    }
    if (currentOperator.territorialScope === TerritorialScope.ESTABLISHMENT) {
      const pr = prisons.find(p => p.id === currentOperator.assignedPrisonId);
      if (pr) {
        return pr.location.split(",")[0].trim();
      }
    }
    return null;
  }, [currentOperator, prisons]);

  // Territorial filtering using hierarchical scopes and organic delegator inheritances
  const visiblePrisons = useMemo(() => {
    return prisons.filter((p) => {
      // 1. Initial territorial scope restriction
      let matchesScope = true;
      if (currentOperator.territorialScope === TerritorialScope.PROVINCIAL) {
        matchesScope = p.location.toLowerCase().includes(currentOperator.province?.toLowerCase() || "");
      } else if (currentOperator.territorialScope === TerritorialScope.ESTABLISHMENT) {
        matchesScope = p.id === currentOperator.assignedPrisonId;
      }

      if (!matchesScope) return false;

      // 2. Extra global province filter restriction
      if (selectedProvinceFilter !== "ALL") {
        return p.location.toLowerCase().includes(selectedProvinceFilter.toLowerCase());
      }
      return true;
    });
  }, [currentOperator, prisons, selectedProvinceFilter]);

  const hasCriticalOvercrowdingAutoAlert = useMemo(() => {
    return visiblePrisons.some((p) => {
      const rate = p.operationalCapacity > 0 ? (p.currentOccupancy / p.operationalCapacity) * 100 : 0;
      return rate >= 110;
    });
  }, [visiblePrisons]);

  const handleExportCSV = () => {
    let filteredPrisons = [...visiblePrisons];
    let filterDescription = "Geral (Tudo)";

    if (selectedHierNode) {
      filterDescription = `${selectedHierNode.type} - ${selectedHierNode.name}`;
      if (selectedHierNode.type === "PROVINCE") {
        const provMuns = municipalities.filter(m => m.province === selectedHierNode.id).map(m => m.id);
        filteredPrisons = filteredPrisons.filter(p => provMuns.includes(p.municipalityId));
      } else if (selectedHierNode.type === "MUNICIPALITY") {
        filteredPrisons = filteredPrisons.filter(p => p.municipalityId === selectedHierNode.id);
      } else if (selectedHierNode.type === "PRISON") {
        filteredPrisons = filteredPrisons.filter(p => p.id === selectedHierNode.id);
      } else if (selectedHierNode.type === "PAVILION") {
        filteredPrisons = filteredPrisons.filter(p => p.id === selectedHierNode.parentId);
      } else if (selectedHierNode.type === "CELL") {
        filteredPrisons = filteredPrisons.filter(p => p.id === selectedHierNode.grandparentId);
      }
    }

    const csvRows: string[] = [];
    csvRows.push(`"RELATORIO DE DISTRIBUICAO DE SEVERIDADE DE INCIDENTES DISCIPLINARES"`);
    csvRows.push(`"Filtro Regional de Selecao:","${filterDescription}"`);
    csvRows.push(`"Filtro de Severidade Ativo:","${widgetSeverityFilter}"`);
    csvRows.push(`"Data de Exportacao:","${new Date().toLocaleString()}"`);
    csvRows.push("");

    csvRows.push(`"Estabelecimento Penitenciario (EP)","Provincia","Capacidade Oficial","Capacidade Operacional","Populacao Atual","Agressao (Critico)","Fuga (Alto)","Posse Ilicita (Medio)","Indisciplina (Baixo)","Total Incidentes Selecionados"`);

    filteredPrisons.forEach(p => {
      const formattedName = p.name.replace("Estabelecimento Penitenciário de ", "EP ");
      const matchedIncidents = disciplinaryIncidentsData.find(item => item.unit === formattedName) || {
        Agressao: (p.currentOccupancy % 5) + 1,
        Fuga: (p.currentOccupancy % 2),
        PosseIlicita: (p.currentOccupancy % 8) + 1,
        Indisciplina: (p.currentOccupancy % 6) + 1,
      };

      const displayAgressao = (widgetSeverityFilter === "ALL" || widgetSeverityFilter === "CRITICAL") ? matchedIncidents.Agressao : 0;
      const displayFuga = (widgetSeverityFilter === "ALL" || widgetSeverityFilter === "HIGH") ? matchedIncidents.Fuga : 0;
      const displayPosseIlicita = (widgetSeverityFilter === "ALL" || widgetSeverityFilter === "MEDIUM") ? matchedIncidents.PosseIlicita : 0;
      const displayIndisciplina = (widgetSeverityFilter === "ALL" || widgetSeverityFilter === "LOW") ? matchedIncidents.Indisciplina : 0;
      const totalFilteredIncidents = displayAgressao + displayFuga + displayPosseIlicita + displayIndisciplina;

      const prov = p.location.split(",")[0];
      const escapedName = p.name.replace(/"/g, '""');

      csvRows.push(`"${escapedName}","${prov}",${p.officialCapacity},${p.operationalCapacity || p.officialCapacity},${p.currentOccupancy},${matchedIncidents.Agressao},${matchedIncidents.Fuga},${matchedIncidents.PosseIlicita},${matchedIncidents.Indisciplina},${totalFilteredIncidents}`);
    });

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `distribuicao-incidentes-${widgetSeverityFilter.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const visibleInmates = useMemo(() => {
    return inmates.filter((inm) => {
      return visiblePrisons.some(p => p.id === inm.assignedPrisonId);
    });
  }, [inmates, visiblePrisons]);

  // Form states for scheduling a movement
  const [movSelectedInmateId, setMovSelectedInmateId] = useState("");
  const [movType, setMovType] = useState<InmateMovement["movementType"]>("CELL_CHANGE");
  const [movDestPrisonId, setMovDestPrisonId] = useState("PRIS-HUAMBO");
  const [movDestCell, setMovDestCell] = useState("Cela H1-01");
  const [movReason, setMovReason] = useState("");
  const [movEscort, setMovEscort] = useState("Escolta Prisional Padrão NREP");
  const [movScheduledDate, setMovScheduledDate] = useState("2026-06-14");

  // Form states for creating a delegation
  const [delDelegatorId, setDelDelegatorId] = useState("");
  const [delDelegateeId, setDelDelegateeId] = useState("");
  const [delRoleId, setDelRoleId] = useState("PROVINCIAL_DIRECTOR");
  const [delReason, setDelReason] = useState("");
  const [delStart, setDelStart] = useState("2026-06-14");
  const [delEnd, setDelEnd] = useState("2026-06-25");

  // Active success alert overlay
  const [successOverlayMsg, setSuccessOverlayMsg] = useState<{title: string, desc: string, hash: string} | null>(null);
  const [delegationToRevoke, setDelegationToRevoke] = useState<any | null>(null);
  const [selectedHistoryDelegation, setSelectedHistoryDelegation] = useState<Delegation | null>(null);

  // Sync active tab with role restrictions
  useEffect(() => {
    // Keep compatible tab validation
    const allowed = isTabVisible(activeTab, currentOperator.role);
    if ((!allowed && activeTab !== "movements" && activeTab !== "auditing" && activeTab !== "sandbox") || (activeTab === "deus-fundador" && currentOperator.role !== "DIRECTOR_GERAL")) {
      setActiveTab("dashboard");
    }
  }, [currentOperator, activeTab]);

  // Synchronize risk and province filters default value for restricted roles & scope
  useEffect(() => {
    if (currentOperator.role !== "DIRECTOR_GERAL" && currentOperator.role !== "DIRECTOR_PROVINCIAL") {
      setSelectedRiskPrisonFilter(currentOperator.assignedPrisonId || "ALL");
    } else {
      setSelectedRiskPrisonFilter("ALL");
    }

    // Synchronize global province selection based on active operator scope
    if (currentOperator.territorialScope === TerritorialScope.NATIONAL) {
      setSelectedProvinceFilter("ALL");
    } else if (currentOperator.territorialScope === TerritorialScope.PROVINCIAL) {
      setSelectedProvinceFilter(currentOperator.province || "Luanda");
    } else if (currentOperator.territorialScope === TerritorialScope.ESTABLISHMENT) {
      const pr = prisons.find(p => p.id === currentOperator.assignedPrisonId);
      if (pr) {
        const provPart = pr.location.split(",")[0].trim();
        setSelectedProvinceFilter(provPart);
      } else {
        setSelectedProvinceFilter("Luanda");
      }
    }
  }, [currentOperator, prisons]);

  // Master National Movements Database (Point 10)
  const [movements, setMovements] = useState<InmateMovement[]>([
    {
      id: "MOV-2026-1051",
      inmateId: "AO-REC-089",
      inmateName: "Manuel Domingos João",
      movementType: "ADMISSION",
      destinationUnitId: "PRIS-01",
      destinationLocName: "EP Viana (Cela B2-04)",
      dateScheduled: "2026-02-14",
      dateExecuted: "2026-02-14",
      status: "EXECUTED",
      reason: "Admissão inicial homologada por Mandado Judicial da Comarca de Luanda.",
      operatorId: "MININT-OP-DC-VIANA",
      escortDetails: "Serviço Prisional Escorta-01",
      classification: InformationClassification.RESTRICTED
    },
    {
      id: "MOV-2026-1052",
      inmateId: "AO-REC-204",
      inmateName: "Sebastião Kiala Mendes",
      movementType: "CELL_CHANGE",
      sourceUnitId: "PRIS-01",
      sourceLocName: "EP Viana (Cela A1-09)",
      destinationUnitId: "PRIS-01",
      destinationLocName: "EP Viana (Cela A1-12)",
      dateScheduled: "2026-06-13",
      dateExecuted: "2026-06-13",
      status: "EXECUTED",
      reason: "Relocação celular preventiva para garantir integridade física após desentendimento.",
      operatorId: "MININT-OP-SEG-VIANA",
      classification: InformationClassification.RESTRICTED
    },
    {
      id: "MOV-2026-1053",
      inmateId: "AO-REC-4712",
      inmateName: "Augusto Chissola",
      movementType: "TRANSFER",
      sourceUnitId: "PRIS-HUAMBO",
      sourceLocName: "Cadeia Central do Huambo",
      destinationUnitId: "PRIS-BAILUNDO",
      destinationLocName: "Cadeia do Bailundo",
      dateScheduled: "2026-06-15",
      status: "PENDING_APPROVAL",
      reason: "Pedido voluntário por proximidade do agregado familiar, homologado pela DPSP-Huambo.",
      operatorId: "MININT-OP-DP-HUAMBO",
      escortDetails: "Batalhão de Intervenção Rápida - Polícia Nacional",
      classification: InformationClassification.RESTRICTED
    },
    {
      id: "MOV-2026-1054",
      inmateId: "AO-REC-115",
      inmateName: "Carla Antónia Gouveia",
      movementType: "COURT",
      sourceUnitId: "PRIS-02",
      sourceLocName: "EP Kakila",
      destinationLocName: "Tribunal Provincial de Luanda (Palácio da Justiça)",
      dateScheduled: "2026-06-16",
      status: "SCHEDULED",
      reason: "Audiência de contraditório e alegações finais sob requisição judiciária.",
      operatorId: "MININT-OP-DC-VIANA",
      escortDetails: "Grupo de Intervenção Prisional Geral-02",
      classification: InformationClassification.RESTRICTED
    }
  ]);

  // Master Forensic Audit Records (Point 8)
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([
    {
      id: "AUD-10029",
      timestamp: "2026-06-14T10:15:22Z",
      operatorId: "MININT-OP-DG-01",
      operatorName: "Maria Kiala",
      roleName: "Director Geral",
      actionType: "LOGIN",
      targetEntity: "Users",
      description: "Autenticação militar bem-sucedida e consolidada por canal TLS 1.3.",
      deviceIp: "10.224.12.8",
      securityClassification: InformationClassification.RESTRICTED,
      integrityHash: "SHA256-F890AE72F02189BA12CE898A1211DE450AA7B9"
    },
    {
      id: "AUD-10030",
      timestamp: "2026-06-14T10:20:00Z",
      operatorId: "MININT-OP-DG-01",
      operatorName: "Maria Kiala",
      roleName: "Director Geral",
      actionType: "VIEW_INMATE",
      targetEntity: "Inmate",
      targetId: "AO-REC-089",
      description: "Visualização do prontuário do recluso Manuel Domingos João.",
      deviceIp: "10.224.12.8",
      securityClassification: InformationClassification.RESTRICTED,
      integrityHash: "SHA256-DE81A99EACCECCAA3429FBB01A242BCE89A1"
    },
    {
      id: "AUD-10031",
      timestamp: "2026-06-14T10:25:12Z",
      operatorId: "MININT-OP-DP-HUAMBO",
      operatorName: "Dr. Júlio Mbanza",
      roleName: "Director Provincial do Huambo",
      actionType: "EXPORT_PDF",
      targetEntity: "Inmate",
      description: "Exportação da ficha resumo do recluso Augusto Chissola (Código de Selo: HU-7729-NREP).",
      deviceIp: "10.225.82.4",
      securityClassification: InformationClassification.CONFIDENTIAL,
      integrityHash: "SHA256-FF83E71A1209B1139A9BFAD7A12450CBA111"
    }
  ]);

  // Combined audit logger helper
  const writeAuditLog = (
    operator: any,
    actionType: AuditRecord["actionType"],
    targetEntity: string,
    targetId: string | undefined,
    description: string,
    inmateId: string = "-",
    inmateName: string = "-"
  ) => {
    // 1. Write to old AuditLog compatibility list (for old tab)
    let compAction: AuditLog["action"] = "Edição";
    if (actionType === "TRANSFER_EXECUTE") compAction = "Transferência";
    else if (actionType === "LOGIN") compAction = "Edição";

    const legacyLog: AuditLog = {
      id: `AUD-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: operator?.id || currentOperatorId,
      timestamp: new Date().toISOString(),
      action: compAction,
      inmateId: inmateId,
      inmateName: inmateName,
      fieldChanged: targetEntity,
      oldValue: "OFFLINE/AUTOPILOT",
      newValue: description.slice(0, 80)
    };
    setAuditLogs(prev => [legacyLog, ...prev]);

    // 2. Write to upgraded National Forensic Audit Log (Point 8)
    const classifications = {
      "LOGIN": InformationClassification.RESTRICTED,
      "LOGOUT": InformationClassification.RESTRICTED,
      "VIEW_INMATE": InformationClassification.RESTRICTED,
      "EXPORT_PDF": InformationClassification.CONFIDENTIAL,
      "DOWNLOAD": InformationClassification.CONFIDENTIAL,
      "TRANSFER_EXECUTE": InformationClassification.CONFIDENTIAL,
      "CELL_CHANGE_EXECUTE": InformationClassification.RESTRICTED,
      "RELEASE_EXECUTE": InformationClassification.SECRET,
      "LOGICAL_DELETE": InformationClassification.SECRET,
      "DELEGATION_CREATE": InformationClassification.CONFIDENTIAL,
      "PRINT_REPORT": InformationClassification.CONFIDENTIAL
    };

    const integritySeed = `${Date.now()}-${legacyLog.userId}-${targetEntity}-${description}`;
    const dynamicHash = "SHA256-" + (integritySeed.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0) | 0, 0) >>> 0).toString(16).toUpperCase();

    const forensicRecord: AuditRecord = {
      id: `AUD-F-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      operatorId: operator?.id || currentOperatorId,
      operatorName: operator?.name || "Operador Desconhecido",
      roleName: operator?.systemRole?.name || "Operador",
      actionType: actionType,
      targetEntity: targetEntity,
      targetId: targetId,
      description: description,
      deviceIp: operator?.id === "MININT-OP-DG-01" ? "10.224.12.8" : "10.225.82.4",
      securityClassification: classifications[actionType] || InformationClassification.RESTRICTED,
      integrityHash: dynamicHash
    };

    setAuditRecords(prev => [forensicRecord, ...prev]);
  };

  const handleExecuteMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movSelectedInmateId) {
      alert("Selecione um recluso para dar início à movimentação.");
      return;
    }

    const inmateObj = inmates.find(i => i.id === movSelectedInmateId);
    if (!inmateObj) return;

    // Create a new movement object
    const newId = `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const sourceUnit = ORGANIZATIONAL_UNITS.find(u => u.prisonId === inmateObj.assignedPrisonId);
    const destPrison = prisons.find(p => p.id === movDestPrisonId);

    const hashSeed = `${newId}-${movSelectedInmateId}-${movType}-${new Date().toISOString()}`;
    const generatedHash = "SHA256-" + (hashSeed.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0) | 0, 0) >>> 0).toString(16).toUpperCase();

    const isTransfer = movType === "TRANSFER";
    const newStatus = isTransfer ? "PENDING_APPROVAL" : "EXECUTED";

    // Compile movement
    const newMov: InmateMovement = {
      id: newId,
      inmateId: inmateObj.id,
      inmateName: `${inmateObj.firstName} ${inmateObj.lastName}`,
      movementType: movType,
      sourceUnitId: sourceUnit?.id,
      sourceLocName: sourceUnit?.name || "Unidade de Custódia Inicial",
      destinationUnitId: isTransfer ? movDestPrisonId : sourceUnit?.id,
      destinationLocName: isTransfer ? (destPrison?.name || "EP Destino") : (movType === "CELL_CHANGE" ? `${sourceUnit?.name || "EP"} (${movDestCell})` : "Área Externa (Liberdade Judicial)"),
      dateScheduled: movScheduledDate,
      dateExecuted: isTransfer ? undefined : movScheduledDate,
      status: newStatus,
      reason: movReason || "Movimentação operacional autorizada sob protocolo militar NREP.",
      operatorId: currentOperator.id,
      escortDetails: movEscort,
      classification: isTransfer ? InformationClassification.CONFIDENTIAL : InformationClassification.RESTRICTED
    };

    if (!isTransfer) {
      // Perform state changes in inmates list only for direct movements
      setInmates(prev => prev.map(inm => {
        if (inm.id === inmateObj.id) {
          if (movType === "CELL_CHANGE") {
            return { ...inm, assignedCellNumber: movDestCell };
          } else if (movType === "RELEASE") {
            return { ...inm, systemStatus: "SOLTO" };
          } else if (movType === "DEATH") {
            return { ...inm, systemStatus: "FALECIDO" };
          }
        }
        return inm;
      }));
    }

    // No immediate prison occupancy balance for pending transfers

    setMovements(prev => [newMov, ...prev]);

    // Log in Audit Records (Point 8)
    writeAuditLog(
      currentOperator,
      isTransfer ? "TRANSFER_EXECUTE" : "CELL_CHANGE_EXECUTE",
      "InmateMovement",
      newId,
      isTransfer
        ? `Solicitação de transferência criada para o recluso ${inmateObj.firstName} ${inmateObj.lastName} (Aguardando aprovação do Diretor Provincial). Destino: ${newMov.destinationLocName}`
        : `Movimentação do tipo ${movType} executada para o recluso ${inmateObj.firstName} ${inmateObj.lastName}. Destino: ${newMov.destinationLocName}`,
      inmateObj.id,
      `${inmateObj.firstName} ${inmateObj.lastName}`
    );

    // Open Success Overlay (Point 9 - Digital Signatures)
    if (isTransfer) {
      setSuccessOverlayMsg({
        title: "FLUXO DE TRANSFERÊNCIA INICIADO (PENDENTE)",
        desc: `Ordem Nº ${newId} registada para o recluso ${inmateObj.firstName} ${inmateObj.lastName}. A transferência de ${newMov.sourceLocName} para ${newMov.destinationLocName} exige homologação digital e aposição do selo oficial por um Diretor Provincial antes da efetivação física.`,
        hash: generatedHash
      });
    } else {
      setSuccessOverlayMsg({
        title: movType === "RELEASE" ? "CARTA DE DESCARCERIZAÇÃO / ALVARÁ DE SOLTURA" :
               movType === "CELL_CHANGE" ? "ORDEM DE MUDANÇA DE CELA / ALOJAMENTO" : "GUIA DE MOVIMENTAÇÃO PENITENCIÁRIA",
        desc: `Ato registado formalmente sob Mandatamento Nº ${newId}. O recluso ${inmateObj.firstName} ${inmateObj.lastName} foi relocado com sucesso para ${newMov.destinationLocName} sob patrulha especial militar: ${movEscort || "NREP"}.`,
        hash: generatedHash
      });
    }

    // Clear form
    setMovReason("");
  };

  const handleApproveTransfer = (movId: string) => {
    const mov = movements.find(m => m.id === movId);
    if (!mov) return;

    // Security Verification
    const isProvincialOrGeneralDirector = currentOperator.role === "DIRECTOR_PROVINCIAL" || currentOperator.role === "DIRECTOR_GERAL";
    if (!isProvincialOrGeneralDirector) {
      alert("ERRO DE SEGURANÇA: O seu perfil de operador não possui prerrogativas militares para homologar ordens de transferência provincial.");
      return;
    }

    const inmateObj = inmates.find(i => i.id === mov.inmateId);
    if (!inmateObj) return;

    const sourcePrisonId = inmateObj.assignedPrisonId;
    const destPrisonId = mov.destinationUnitId!;

    const sourcePrison = prisons.find(p => p.id === sourcePrisonId);
    const destPrison = prisons.find(p => p.id === destPrisonId);

    // 1. Update Inmate's assigned prison location
    setInmates(prev => prev.map(inm => {
      if (inm.id === inmateObj.id) {
        return { ...inm, assignedPrisonId: destPrisonId };
      }
      return inm;
    }));

    // 2. Update occupancy counts
    setPrisons(prev => prev.map(p => {
      if (p.id === sourcePrisonId) {
        const updatedBreakdown = { ...p.riskBreakdown };
        const rKey = inmateObj.riskLevel as keyof typeof updatedBreakdown;
        if (updatedBreakdown[rKey] > 0) updatedBreakdown[rKey]--;
        return {
          ...p,
          currentOccupancy: Math.max(0, p.currentOccupancy - 1),
          riskBreakdown: updatedBreakdown
        };
      }
      if (p.id === destPrisonId) {
        const updatedBreakdown = { ...p.riskBreakdown };
        const rKey = inmateObj.riskLevel as keyof typeof updatedBreakdown;
        updatedBreakdown[rKey] = (updatedBreakdown[rKey] || 0) + 1;
        return {
          ...p,
          currentOccupancy: p.currentOccupancy + 1,
          riskBreakdown: updatedBreakdown
        };
      }
      return p;
    }));

    // 3. Update the movement status to EXECUTED
    const timestamp = new Date().toISOString();
    setMovements(prev => prev.map(m => {
      if (m.id === movId) {
        return {
          ...m,
          status: "EXECUTED",
          dateExecuted: timestamp.split('T')[0],
          approvedBy: currentOperator.id,
          approvedByName: currentOperator.name,
          dateApproved: timestamp
        };
      }
      return m;
    }));

    // 4. Generate Audit log in general audit log
    const logId = `AUD-${Math.floor(10000 + Math.random() * 90000)}`;
    const sourceName = sourcePrison ? sourcePrison.name.replace("Estabelecimento Penitenciário de ", "EP ") : "N/A";
    const destName = destPrison ? destPrison.name.replace("Estabelecimento Penitenciário de ", "EP ") : "N/A";

    const newLog: AuditLog = {
      id: logId,
      userId: currentOperatorId,
      timestamp: timestamp,
      action: "Transferência",
      inmateId: inmateObj.id,
      inmateName: `${inmateObj.firstName} ${inmateObj.lastName}`,
      fieldChanged: "assignedPrisonId (EFECTIVADA)",
      oldValue: `${sourceName} (Aguardando)`,
      newValue: `${destName} (Homologado por ${currentOperator.name})`
    };
    setAuditLogs(prev => [newLog, ...prev]);
    setGeneratedLogs(prev => [`[TRANSFER_APPROVED] Ordem ${movId} aprovada digitalmente pelo Diretor Provincial ${currentOperator.name}. Recluso transferido.`, ...prev]);

    // 5. Forensics logs
    writeAuditLog(
      currentOperator,
      "TRANSFER_EXECUTE",
      "InmateMovement",
      movId,
      `Aprovação formal e assinatura digital da ordem de transferência ${movId} do recluso ${inmateObj.firstName} ${inmateObj.lastName} de ${sourceName} para ${destName}.`,
      inmateObj.id,
      `${inmateObj.firstName} ${inmateObj.lastName}`
    );

    // 6. Show Success Overlay pop up
    const hashSeed = `${movId}-${inmateObj.id}-APPROVED-${timestamp}`;
    const generatedHash = "SHA256-" + (hashSeed.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0) | 0, 0) >>> 0).toString(16).toUpperCase();

    setSuccessOverlayMsg({
      title: "ORDEM DE TRANSFERÊNCIA DE RECLUSO CONCLUÍDA",
      desc: `A ordem militar Nº ${movId} de translado foi com sucesso assinada eletronicamente pelo Diretor Provincial ${currentOperator.name}. O recluso ${inmateObj.firstName} ${inmateObj.lastName} foi relocado para o ${destName} com o selo institucional do Ministério do Interior de Angola.`,
      hash: generatedHash
    });
  };

  const handleDeclineTransfer = (movId: string) => {
    const mov = movements.find(m => m.id === movId);
    if (!mov) return;

    // Security Verification
    const isProvincialOrGeneralDirector = currentOperator.role === "DIRECTOR_PROVINCIAL" || currentOperator.role === "DIRECTOR_GERAL";
    if (!isProvincialOrGeneralDirector) {
      alert("ERRO DE SEGURANÇA: O seu perfil de operador não possui prerrogativas militares para recusar ordens de transferência provincial.");
      return;
    }

    setMovements(prev => prev.map(m => {
      if (m.id === movId) {
        return {
          ...m,
          status: "CANCELLED",
          reason: `${m.reason} [RECUSADA POR ${currentOperator.name} em ${new Date().toLocaleDateString()}]`
        };
      }
      return m;
    }));

    setGeneratedLogs(prev => [`[TRANSFER_DECLINED] Ordem ${movId} recusada pelo Diretor Provincial ${currentOperator.name}.`, ...prev]);

    // Write audit log
    writeAuditLog(
      currentOperator,
      "TRANSFER_EXECUTE",
      "InmateMovement",
      movId,
      `Ordem de transferência ${movId} para o recluso ${mov.inmateName} foi recusada pelo Diretor Provincial ${currentOperator.name}.`,
      mov.inmateId,
      mov.inmateName
    );

    alert(`A ordem de transferência Nº ${movId} foi devidamente CANCELADA/RECUSADA e o status foi atualizado.`);
  };

  const handleRegisterDelegation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delDelegatorId || !delDelegateeId) {
      alert("Por favor selecione o Delegador e o Operador Beneficiário.");
      return;
    }
    if (delDelegatorId === delDelegateeId) {
      alert("Um operador não pode delegar poderes para si mesmo.");
      return;
    }

    const dId = `DEL-2026-${Math.floor(100 + Math.random() * 900)}`;
    const delegatorObj = operators.find(op => op.id === delDelegatorId);
    const delegateeObj = operators.find(op => op.id === delDelegateeId);

    const hashSeed = `${dId}-${delDelegatorId}-${delDelegateeId}-${new Date().toISOString()}`;
    const generatedHash = "SHA256-" + (hashSeed.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0) | 0, 0) >>> 0).toString(16).toUpperCase();

    const initialStatus: "ACTIVE" | "SCHEDULED" = delStart > "2026-06-14" ? "SCHEDULED" : "ACTIVE";

    const newDel: Delegation = {
      id: dId,
      delegatorId: delDelegatorId,
      delegateeId: delDelegateeId,
      roleId: delRoleId,
      startDate: delStart,
      endDate: delEnd,
      status: initialStatus,
      reason: delReason || "Delegação de competências governamentais ao abrigo da Lei Prisional nº 8/08.",
      auditHash: generatedHash,
      statusHistory: [
        {
          status: initialStatus,
          timestamp: new Date().toISOString(),
          operatorName: currentOperator?.name || "Operador Autenticado",
          details: `Portaria outorgada formalmente na Divisão de Recursos Humanos.`
        }
      ]
    };

    setDelegations(prev => [newDel, ...prev]);

    // Audit logs
    writeAuditLog(
      currentOperator,
      "DELEGATION_CREATE",
      "Delegation",
      dId,
      `Delegação de competência oficial aprovada de ${delegatorObj?.name} para ${delegateeObj?.name} concedendo patente de ${SYSTEM_ROLES.find(r => r.id === delRoleId)?.name}`
    );

    alert(`Delegação outorgada com sucesso! Código ${dId}. O operador beneficiário herdará os poderes e o escopo militar imediatamente se o período estiver na data vigente.`);
    
    // Reset
    setDelReason("");
  };

  const handleRevokeDelegation = (id: string, skipConfirm: boolean = false) => {
    if (!skipConfirm && !confirm("Tem certeza que deseja revogar esta portaria de delegação de competência? Os efeitos retrocessivos e privilégios associados serão cancelados de imediato.")) {
      return;
    }
    
    const targetDel = delegations.find(d => d.id === id);
    if (!targetDel) return;
    
    setDelegations(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: "REVOKED",
          statusHistory: [
            ...(d.statusHistory || []),
            {
              status: "REVOKED",
              timestamp: new Date().toISOString(),
              operatorName: currentOperator?.name || "Operador Autenticado",
              details: "Revogação eletrónica antecipada por despacho governamental de segurança."
            }
          ]
        };
      }
      return d;
    }));
    
    // Write audit log
    writeAuditLog(
      currentOperator,
      "LOGICAL_DELETE",
      "Delegation",
      id,
      `Revogação antecipada da portaria de delegação ${id} (Concedia patente de ${SYSTEM_ROLES.find(r => r.id === targetDel.roleId)?.name})`
    );
    
    alert(`A portaria ${id} foi revogada com sucesso.`);
  };

  // Audit Log State
  interface AuditLog {
    id: string;
    userId: string;
    timestamp: string;
    action: "Admissão" | "Transferência" | "Edição";
    inmateId: string;
    inmateName: string;
    fieldChanged: string;
    oldValue: string;
    newValue: string;
  }

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "AUD-10023",
      userId: "MININT-OP-089",
      timestamp: "2026-06-12T14:35:10Z",
      action: "Admissão",
      inmateId: "AO-REC-8920",
      inmateName: "Manuel Sebastião",
      fieldChanged: "Todos",
      oldValue: "-",
      newValue: "Novo Registro (Cela A1-02, EP Viana)"
    },
    {
      id: "AUD-10024",
      userId: "MININT-OP-112",
      timestamp: "2026-06-12T15:10:22Z",
      action: "Transferência",
      inmateId: "AO-REC-3419",
      inmateName: "António Ngola",
      fieldChanged: "assignedPrisonId (Prisão)",
      oldValue: "EP Sanza Pombo",
      newValue: "EP Viana"
    },
    {
      id: "AUD-10025",
      userId: "MININT-OP-089",
      timestamp: "2026-06-12T16:04:15Z",
      action: "Edição",
      inmateId: "AO-REC-1129",
      inmateName: "Joaquim Dinis",
      fieldChanged: "riskLevel (Grau de Risco)",
      oldValue: "Médio",
      newValue: "Alto"
    },
    {
      id: "AUD-10026",
      userId: "MININT-OP-243",
      timestamp: "2026-06-12T17:40:00Z",
      action: "Admissão",
      inmateId: "AO-REC-5041",
      inmateName: "Mateus Pedro",
      fieldChanged: "Todos",
      oldValue: "-",
      newValue: "Novo Registro (Cela B2-01, EP Kakila)"
    },
    {
      id: "AUD-10027",
      userId: "MININT-OP-112",
      timestamp: "2026-06-12T19:15:30Z",
      action: "Edição",
      inmateId: "AO-REC-5512",
      inmateName: "Domingos Kassoma",
      fieldChanged: "assignedCellNumber (Cela)",
      oldValue: "Cela A2-03",
      newValue: "Cela B1-04"
    },
    {
      id: "AUD-10028",
      userId: "MININT-OP-089",
      timestamp: "2026-06-13T01:12:00Z",
      action: "Transferência",
      inmateId: "AO-REC-7091",
      inmateName: "Sérgio Capenda",
      fieldChanged: "assignedPrisonId (Prisão)",
      oldValue: "EP Viana",
      newValue: "EP Sanza Pombo"
    },
    {
      id: "AUD-10029",
      userId: "MININT-OP-243",
      timestamp: "2026-06-13T02:05:44Z",
      action: "Edição",
      inmateId: "AO-REC-3904",
      inmateName: "Valter Moco",
      fieldChanged: "motherName (Nome da Mãe)",
      oldValue: "Desconhecido",
      newValue: "Maria Teresa Moco"
    },
    {
      id: "AUD-10030",
      userId: "MININT-OP-089",
      timestamp: "2026-06-13T03:01:10Z",
      action: "Admissão",
      inmateId: "AO-REC-9331",
      inmateName: "Carlos Luvumbo",
      fieldChanged: "Todos",
      oldValue: "-",
      newValue: "Novo Registro (Cela A3-02, EP Sanza Pombo)"
    }
  ]);

  // Audit Log Pagination and Filter State
  const [auditFilterType, setAuditFilterType] = useState<"Todos" | "Admissão" | "Transferência" | "Edição">("Todos");
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>("");
  const [admissionsSearchQuery, setAdmissionsSearchQuery] = useState<string>("");
  const [auditCurrentPage, setAuditCurrentPage] = useState<number>(1);
  const auditLogsPerPage = 5;
  
  // Real-time Simulated Clock for WAT (West Africa Time - Angola)
  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Adjust to Angola Time (UTC+1)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Africa/Luanda",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      };
      setCurrentTime(now.toLocaleString("pt-PT", options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync state & Network Contingency (Important for Angola offline mandate)
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncQueue, setSyncQueue] = useState<any[]>(INITIAL_SYNC_QUEUE);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Background Sync States (VSAT Resiliency)
  const [backgroundSyncEnabled, setBackgroundSyncEnabled] = useState<boolean>(true);
  const [bgSyncCountdown, setBgSyncCountdown] = useState<number>(30);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [bgSyncLogs, setBgSyncLogs] = useState<string[]>([
    "Módulo de Sincronismo em Segundo Plano VSAT carregado com chaves da rede central."
  ]);

  // Chart Data States (with real-time temporal reactivity)
  const [admissionsTrendData, setAdmissionsTrendData] = useState([
    { month: "Jul/25", preventivas: 25, condenacoes: 20 },
    { month: "Ago/25", preventivas: 30, condenacoes: 22 },
    { month: "Set/25", preventivas: 24, condenacoes: 24 },
    { month: "Out/25", preventivas: 35, condenacoes: 26 },
    { month: "Nov/25", preventivas: 29, condenacoes: 26 },
    { month: "Dez/25", preventivas: 42, condenacoes: 28 },
    { month: "Jan/26", preventivas: 38, condenacoes: 26 },
    { month: "Fev/26", preventivas: 30, condenacoes: 20 },
    { month: "Mar/26", preventivas: 32, condenacoes: 26 },
    { month: "Abr/26", preventivas: 35, condenacoes: 27 },
    { month: "Mai/26", preventivas: 40, condenacoes: 32 },
    { month: "Jun/26", preventivas: 44, condenacoes: 34 }
  ]);

  const [disciplinaryIncidentsData, setDisciplinaryIncidentsData] = useState([
    { unit: "EP Viana", Agressao: 28, Fuga: 5, PosseIlicita: 42, Indisciplina: 18 },
    { unit: "EP Kakila", Agressao: 12, Fuga: 2, PosseIlicita: 15, Indisciplina: 8 },
    { unit: "EP Sanza Pombo", Agressao: 8, Fuga: 0, PosseIlicita: 11, Indisciplina: 6 }
  ]);

  const [admissionChartMode, setAdmissionChartMode] = useState<"split" | "total">("split");
  const [selectedRiskPrisonFilter, setSelectedRiskPrisonFilter] = useState<string>("ALL");

  const riskDistribution = useMemo(() => {
    let baixo = 0;
    let medio = 0;
    let alto = 0;
    let maximo = 0;

    visiblePrisons.forEach(p => {
      if (selectedRiskPrisonFilter === "ALL" || p.id === selectedRiskPrisonFilter) {
        baixo += p.riskBreakdown["Baixo"] || 0;
        medio += p.riskBreakdown["Médio"] || 0;
        alto += p.riskBreakdown["Alto"] || 0;
        maximo += p.riskBreakdown["Máximo"] || 0;
      }
    });

    const addedInmates = visibleInmates.filter(i => !INITIAL_INMATES.some(init => init.id === i.id));
    addedInmates.forEach(i => {
      if (selectedRiskPrisonFilter === "ALL" || i.assignedPrisonId === selectedRiskPrisonFilter) {
        if (i.riskLevel === "Baixo") baixo++;
        else if (i.riskLevel === "Médio") medio++;
        else if (i.riskLevel === "Alto") alto++;
        else if (i.riskLevel === "Máximo") maximo++;
      }
    });

    const total = baixo + medio + alto + maximo;

    return [
      { name: "Baixo", value: baixo, color: "#10b981", percent: total > 0 ? ((baixo / total) * 100).toFixed(1) : "0.0", desc: "Regime comum, atividades normais e conduta estável." },
      { name: "Médio", value: medio, color: "#3b82f6", percent: total > 0 ? ((medio / total) * 100).toFixed(1) : "0.0", desc: "Regime comum em ala de vigilância moderada." },
      { name: "Alto", value: alto, color: "#f97316", percent: total > 0 ? ((alto / total) * 100).toFixed(1) : "0.0", desc: "Regime de segurança, escolta e vigilância reforçadas." },
      { name: "Máximo", value: maximo, color: "#ef4444", percent: total > 0 ? ((maximo / total) * 100).toFixed(1) : "0.0", desc: "Regime fechado especial ou isolamento por crimes graves." }
    ];
  }, [visiblePrisons, selectedRiskPrisonFilter, visibleInmates]);

  const totalFilteredInmates = useMemo(() => {
    return riskDistribution.reduce((acc, curr) => acc + curr.value, 0);
  }, [riskDistribution]);

  const handleSimulateIncident = () => {
    const units = ["EP Viana", "EP Kakila", "EP Sanza Pombo"];
    const categories: ("Agressao" | "Fuga" | "PosseIlicita" | "Indisciplina")[] = [
      "Agressao",
      "Fuga",
      "PosseIlicita",
      "Indisciplina"
    ];

    const randomUnit = units[Math.floor(Math.random() * units.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];

    setDisciplinaryIncidentsData(prev =>
      prev.map(item => {
        if (item.unit === randomUnit) {
          return {
            ...item,
            [randomCategory]: item[randomCategory] + 1
          };
        }
        return item;
      })
    );

    // Dynamic message log addition
    setGeneratedLogs(prev => [
      `[SINAL ELETRÓNICO DISCIPLINAR] Incidente de ${randomCategory} registado em ${randomUnit} às ${new Date().toLocaleTimeString()}`,
      ...prev
    ]);
  };
  
  // ERD Explorer State
  const [searchTable, setSearchTable] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedTable, setSelectedTable] = useState<Table | null>(TABLES_METADATA.find(t => t.name === "Inmate") || TABLES_METADATA[0]);
  const [erdFilterType, setErdFilterType] = useState<"all" | "sync" | "multitenant" | "softdelete">("all");

  // New Inmate Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "1995-01-01",
    gender: "Masculino",
    idCard: "",
    fatherName: "",
    motherName: "",
    nationality: "Angolana",
    crimeId: "A01", // Default Homicídio
    assignedPrisonId: "PRIS-01", // Default Viana
    assignedPavilionId: "PAV-B",
    assignedBlockId: "BLK-B2",
    assignedCellNumber: "Cela B2-01",
    photo: ""
  });

  // Automatic Calculation Hook when crime or prison changes
  const computedAdmission = useMemo(() => {
    // Find selected crime from penal code
    let selectedCrime: any = null;
    for (const group of Object.values(PENAL_CODE_GROUPS)) {
      const found = group.crimes.find(c => c.id === formData.crimeId);
      if (found) {
        selectedCrime = found;
        break;
      }
    }

    if (!selectedCrime) return null;

    // Suggest Risk and Cell based on crime category rules
    const risk = selectedCrime.riskLevel;
    const cellType = selectedCrime.suggestedCellType;

    // Suggest available spot in selected prison automatically
    const targetPrison = prisons.find(p => p.id === formData.assignedPrisonId);
    let suggestedPavilion = "";
    let suggestedBlock = "";
    let suggestedCell = "";

    if (targetPrison) {
      // Find a pavilion that matches specialty tags or risk
      const matchingPav = targetPrison.pavilions.find(pav => {
        if (risk === "Máximo" || risk === "Alto") {
          return (pav as any).specialty_tag?.includes("Fechado") || (pav as any).specialty_tag?.includes("Segurança");
        }
        return (pav as any).specialty_tag?.includes("Aberto") || (pav as any).specialty_tag?.includes("Comum") || (pav as any).specialty_tag?.includes("Admissão");
      }) || targetPrison.pavilions[0];

      suggestedPavilion = matchingPav.id;
      // Find a block with capacity
      const matchingBlock = matchingPav.blocks.find(blk => blk.current < blk.capacity) || matchingPav.blocks[0];
      suggestedBlock = matchingBlock.id;
      suggestedCell = `Cela ${matchingBlock.name.replace("Bloco ", "")}-${Math.floor(Math.random() * 8) + 1}`;
    }

    return {
      riskLevel: risk,
      suggestedCellType: cellType,
      pavilionId: suggestedPavilion,
      blockId: suggestedBlock,
      cellNumber: suggestedCell,
      penaltyRange: selectedCrime.penaltyRange,
      crimeGroup: selectedCrime.id.startsWith("A") ? "Grupo A (Pessoas)" : selectedCrime.id.startsWith("B") ? "Grupo B (Património)" : "Grupo C (Ordem)"
    };
  }, [formData.crimeId, formData.assignedPrisonId, prisons]);

  // Handle Form Change
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Admissions system registration
  const handleRegisterInmate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) {
      alert("Por favor preencha os nomes do recluso.");
      return;
    }

    const uniqueId = `AO-REC-${Math.floor(100 + Math.random() * 900)}`;
    const randomSerial = `AO-PNAP-2026-${String(Math.floor(1200 + Math.random() * 8000)).padStart(6, "0")}`;

    const newInmate: InmateState = {
      id: uniqueId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      birthDate: formData.birthDate,
      gender: formData.gender,
      idCard: formData.idCard || "Não Apresentado",
      fatherName: formData.fatherName || "Desconhecido",
      motherName: formData.motherName || "Desconhecido",
      nationality: formData.nationality,
      crimeId: formData.crimeId,
      riskLevel: computedAdmission?.riskLevel || "Médio",
      suggestedCellType: computedAdmission?.suggestedCellType || "Regime Comum",
      assignedPrisonId: formData.assignedPrisonId,
      assignedPavilionId: computedAdmission?.pavilionId || "PAV-A",
      assignedBlockId: computedAdmission?.blockId || "BLK-A1",
      assignedCellNumber: computedAdmission?.cellNumber || "Cela A1-01",
      status: isOnline ? "ACTIVE" : "PENDING_SYNC",
      documentCode: randomSerial,
      photo: formData.photo || ""
    };

    if (isOnline) {
      // Direct registration
      setInmates(prev => [newInmate, ...prev]);

      // Add direct admission to Audit Log
      const prNameLoc = prisons.find(p => p.id === formData.assignedPrisonId)?.name.replace("Estabelecimento Penitenciário de ", "EP ") || "EP Viana";
      const newAuditLog: AuditLog = {
        id: `AUD-${Math.floor(10000 + Math.random() * 90000)}`,
        userId: currentOperatorId,
        timestamp: new Date().toISOString(),
        action: "Admissão",
        inmateId: uniqueId,
        inmateName: `${newInmate.firstName} ${newInmate.lastName}`,
        fieldChanged: "Todos",
        oldValue: "-",
        newValue: `Novo Registro (${newInmate.assignedCellNumber}, ${prNameLoc})`
      };
      setAuditLogs(prev => [newAuditLog, ...prev]);
      
      // Update prison real occupancy
      setPrisons(prevPrisons => {
        return prevPrisons.map(cris => {
          if (cris.id === formData.assignedPrisonId) {
            const updatedOccupancy = cris.currentOccupancy + 1;
            const updatedBreakdown = { ...cris.riskBreakdown };
            const riskKey = newInmate.riskLevel as keyof typeof updatedBreakdown;
            if (updatedBreakdown[riskKey] !== undefined) {
              updatedBreakdown[riskKey] += 1;
            }
            return {
              ...cris,
              currentOccupancy: updatedOccupancy,
              riskBreakdown: updatedBreakdown
            };
          }
          return cris;
        });
      });

      // Update admissions chart dynamically
      setAdmissionsTrendData(prev => prev.map(item => {
        if (item.month === "Jun/26") {
          const isPreventive = newInmate.riskLevel === "Máximo" || newInmate.riskLevel === "Alto";
          return {
            ...item,
            preventivas: isPreventive ? item.preventivas + 1 : item.preventivas,
            condenacoes: !isPreventive ? item.condenacoes + 1 : item.condenacoes
          };
        }
        return item;
      }));

      // Selected generated document for documents list simulation
      setSelectedDocumentCode(newInmate.documentCode);
      setGeneratedLogs(prev => [`[CONCLUÍDO] Recluso registado online com sucesso. ID: ${uniqueId}`]);
    } else {
      // Offline Contingency Mode - Stored in Sync Queue simulating IndexedDB
      const offAction = {
         id: `loc-${Math.floor(10000 + Math.random() * 90000)}`,
         type: "Admissão",
         description: `Registo offline do recluso ${newInmate.firstName} ${newInmate.lastName} (${newInmate.idCard}) por crime ${formData.crimeId}`,
         timestamp: new Date().toISOString(),
         payload: newInmate
      };
      
      setSyncQueue(prev => [...prev, offAction]);

      // Add offline enqueued audit log
      const prNameLocOffline = prisons.find(p => p.id === formData.assignedPrisonId)?.name.replace("Estabelecimento Penitenciário de ", "EP ") || "EP Viana";
      const newAuditLogOff: AuditLog = {
        id: `AUD-${Math.floor(10000 + Math.random() * 90000)}`,
        userId: currentOperatorId,
        timestamp: new Date().toISOString(),
        action: "Admissão",
        inmateId: uniqueId,
        inmateName: `${newInmate.firstName} ${newInmate.lastName}`,
        fieldChanged: "Todos (Offline)",
        oldValue: "-",
        newValue: `Enfileirado Offline p/ ${prNameLocOffline} (${newInmate.assignedCellNumber})`
      };
      setAuditLogs(prev => [newAuditLogOff, ...prev]);
      
      // Still place in local volatile memory state as "PENDING_SYNC" so guards see it instantly
      setInmates(prev => [newInmate, ...prev]);
      setGeneratedLogs(prev => [`[INDEXEDDB SAFEOFFLINE] Adicionado à fila local de contingência. Código: ${offAction.id}`]);
    }

    // Reset Form fields, keeping defaults
    setFormData(prev => ({
      ...prev,
      firstName: "",
      lastName: "",
      idCard: "",
      fatherName: "",
      motherName: "",
      photo: ""
    }));

    // Auto focus on documents template window
    setActiveTab("documents");
    setSelectedDocumentCode(newInmate.documentCode);
  };

  // Offline Sync executor
  const triggerSync = () => {
    if (syncQueue.length === 0) return;
    setIsSyncing(true);
    setSyncLogs(["Estabelecendo ligação com o servidor do MININT central em Luanda...", "Verificando integridade das assinaturas criptográficas locais..."]);
    
    setTimeout(() => {
      // Process items one by one
      let logs: string[] = [];
      const updatedInmates = inmates.map(inm => {
        if (inm.status === "PENDING_SYNC") {
          logs.push(`✓ Recluso sincronizado: ${inm.firstName} ${inm.lastName} -> Atribuído RNR definitivo.`);
          return { ...inm, status: "ACTIVE" as const };
        }
        return inm;
      });

      // Synchronize prison counters for synchronized inmates
      let countAdded = 0;
      let newBreakdowns: Record<string, Record<string, number>> = {};

      syncQueue.forEach(item => {
        if (item.type === "Admissão" && item.payload) {
          const payload = item.payload as any;
          countAdded++;
          const prId = payload.assignedPrisonId || "PRIS-01";
          if (!newBreakdowns[prId]) {
            newBreakdowns[prId] = { "Baixo": 0, "Médio": 0, "Alto": 0, "Máximo": 0 };
          }
          const level = payload.riskLevel || "Médio";
          newBreakdowns[prId][level] = (newBreakdowns[prId][level] || 0) + 1;
        }
      });

      setPrisons(prevPrisons => {
        return prevPrisons.map(cris => {
          const prId = cris.id;
          if (newBreakdowns[prId]) {
            const addedNum = Object.values(newBreakdowns[prId]).reduce((a, b) => a + b, 0);
            const nextBreakdown = { ...cris.riskBreakdown };
            Object.keys(newBreakdowns[prId]).forEach(k => {
              nextBreakdown[k] = (nextBreakdown[k] || 0) + newBreakdowns[prId][k];
            });
            return {
              ...cris,
              currentOccupancy: cris.currentOccupancy + addedNum,
              riskBreakdown: nextBreakdown
            };
          }
          return cris;
        });
      });

      setInmates(updatedInmates);

      // Sincronizar dados de gráficos ao concluir sincronismo offline
      let offPreventivas = 0;
      let offCondenacoes = 0;
      syncQueue.forEach(item => {
        if (item.type === "Admissão" && item.payload) {
          const payload = item.payload as any;
          const isPreventive = payload.riskLevel === "Máximo" || payload.riskLevel === "Alto";
          if (isPreventive) offPreventivas++;
          else offCondenacoes++;
        }
      });

      if (offPreventivas > 0 || offCondenacoes > 0) {
        setAdmissionsTrendData(prev => prev.map(item => {
          if (item.month === "Jun/26") {
            return {
              ...item,
              preventivas: item.preventivas + offPreventivas,
              condenacoes: item.condenacoes + offCondenacoes
            };
          }
          return item;
        }));
      }

      // Add each synchronized inmate admission to audit log
      const syncAudits: AuditLog[] = [];
      syncQueue.forEach(item => {
        if (item.type === "Admissão" && item.payload) {
          const payload = item.payload as any;
          const targetPr = prisons.find(p => p.id === payload.assignedPrisonId)?.name.replace("Estabelecimento Penitenciário de ", "EP ") || "EP Viana";
          syncAudits.push({
            id: `AUD-${Math.floor(10000 + Math.random() * 90000)}`,
            userId: currentOperatorId,
            timestamp: new Date().toISOString(),
            action: "Admissão",
            inmateId: payload.id,
            inmateName: `${payload.firstName} ${payload.lastName}`,
            fieldChanged: "Status",
            oldValue: "Offline (PENDING_SYNC)",
            newValue: `Confirmado Central (${payload.assignedCellNumber}, ${targetPr})`
          });
        }
      });
      if (syncAudits.length > 0) {
        setAuditLogs(prev => [...syncAudits, ...prev]);
      }

      setSyncQueue([]);
      setIsSyncing(false);
      setSyncLogs([]);
      alert("Sincronização nacional concluída com sucesso! Todos os dados contingentes foram integrados na base PostgreSQL e as chaves SHA-256 validadas.");
    }, 2000);
  };

  // Human-Triggered Database Modifications (Transfers & Edits)
  const handleTransferInmate = (inmateId: string, destPrisonId: string) => {
    const inmate = inmates.find(i => i.id === inmateId);
    if (!inmate) return;
    const sourcePrisonId = inmate.assignedPrisonId;
    if (sourcePrisonId === destPrisonId) return;

    const sourcePrison = prisons.find(p => p.id === sourcePrisonId);
    const destPrison = prisons.find(p => p.id === destPrisonId);

    const newId = `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const sourceName = sourcePrison ? sourcePrison.name.replace("Estabelecimento Penitenciário de ", "EP ") : "N/A";
    const destName = destPrison ? destPrison.name.replace("Estabelecimento Penitenciário de ", "EP ") : "N/A";

    const hashSeed = `${newId}-${inmateId}-TRANSFER-${new Date().toISOString()}`;
    const generatedHash = "SHA256-" + (hashSeed.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0) | 0, 0) >>> 0).toString(16).toUpperCase();

    // Create a pending movement
    const pendingMov: InmateMovement = {
      id: newId,
      inmateId: inmate.id,
      inmateName: `${inmate.firstName} ${inmate.lastName}`,
      movementType: "TRANSFER",
      sourceUnitId: sourcePrisonId,
      sourceLocName: sourceName,
      destinationUnitId: destPrisonId,
      destinationLocName: destName,
      dateScheduled: new Date().toISOString().split('T')[0],
      status: "PENDING_APPROVAL",
      reason: `Transferência rápida de segurança solicitada por ${currentOperator.name}.`,
      operatorId: currentOperator.id,
      escortDetails: "Batalhão de Intervenção Rápida - Polícia Nacional",
      classification: InformationClassification.CONFIDENTIAL
    };

    setMovements(prev => [pendingMov, ...prev]);

    // Create Audit Log
    const logId = `AUD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newLog: AuditLog = {
      id: logId,
      userId: currentOperatorId,
      timestamp: new Date().toISOString(),
      action: "Transferência",
      inmateId: inmate.id,
      inmateName: `${inmate.firstName} ${inmate.lastName}`,
      fieldChanged: "Solicitação de Transferência (Registo Workflow)",
      oldValue: sourceName,
      newValue: `${destName} (Aguardando Aprovação Provincial)`
    };

    setAuditLogs(prev => [newLog, ...prev]);
    setGeneratedLogs(prev => [`[TRANSFER_REQ] Ordem de transferência ${newId} pendente de autorização provincial para ${inmate.firstName} ${inmate.lastName}.`, ...prev]);

    // Log also to military forensic records
    writeAuditLog(
      currentOperator,
      "TRANSFER_EXECUTE",
      "InmateMovement",
      newId,
      `Solicitação de transferência rápida registada para o recluso ${inmate.firstName} ${inmate.lastName} (Aguardando aprovação do Diretor Provincial). Destino: ${destName}`,
      inmate.id,
      `${inmate.firstName} ${inmate.lastName}`
    );

    alert(`Solicitação de transferência Nº ${newId} gerada com sucesso!\n\nDe acordo com os protocolos de segurança militar, esta movimentação requer assinatura digital e aposição do selo oficial de um Diretor Provincial antes de ser executada.`);
  };

  const handleEditRiskInmate = (inmateId: string, newRiskLevel: string) => {
    const inmate = inmates.find(i => i.id === inmateId);
    if (!inmate) return;
    const oldRisk = inmate.riskLevel;
    if (oldRisk === newRiskLevel) return;

    // Update inmate risk level
    setInmates(prev => prev.map(inm => {
      if (inm.id === inmateId) {
        return { ...inm, riskLevel: newRiskLevel as any, status: isOnline ? "ACTIVE" : "PENDING_SYNC" };
      }
      return inm;
    }));

    // Update dynamic prison risk Breakdown counters
    setPrisons(prev => prev.map(p => {
      if (p.id === inmate.assignedPrisonId) {
        const updatedBreakdown = { ...p.riskBreakdown };
        const oldKey = oldRisk as keyof typeof updatedBreakdown;
        const newKey = newRiskLevel as keyof typeof updatedBreakdown;

        if (updatedBreakdown[oldKey] > 0) updatedBreakdown[oldKey]--;
        updatedBreakdown[newKey] = (updatedBreakdown[newKey] || 0) + 1;

        return {
          ...p,
          riskBreakdown: updatedBreakdown
        };
      }
      return p;
    }));

    const logId = `AUD-${Math.floor(10000 + Math.random() * 90000)}`;

    const newLog: AuditLog = {
      id: logId,
      userId: currentOperatorId,
      timestamp: new Date().toISOString(),
      action: "Edição",
      inmateId: inmate.id,
      inmateName: `${inmate.firstName} ${inmate.lastName}`,
      fieldChanged: "riskLevel (Grau de Risco)",
      oldValue: oldRisk,
      newValue: newRiskLevel
    };

    setAuditLogs(prev => [newLog, ...prev]);
    setGeneratedLogs(prev => [`[EDITION] Nível de risco do recluso ${inmate.firstName} atualizado para ${newRiskLevel}. Log adicionado: ${logId}`, ...prev]);

    // Offline Queue support
    if (!isOnline) {
      const offAction = {
         id: `loc-${Math.floor(10000 + Math.random() * 90000)}`,
         type: "Edição",
         description: `Edição offline do perfil de<sup></sup> risco de ${inmate.firstName} ${inmate.lastName} de ${oldRisk} para ${newRiskLevel}`,
         timestamp: new Date().toISOString(),
         payload: { inmateId, oldRiskValue: oldRisk, newRiskValue: newRiskLevel }
      };
      setSyncQueue(prev => [...prev, offAction]);
    }
  };

  const handleUploadInmatePhoto = (inmateId: string, photoBase64: string) => {
    const inmate = inmates.find(i => i.id === inmateId);
    if (!inmate) return;

    setInmates(prev => prev.map(inm => {
      if (inm.id === inmateId) {
        return { ...inm, photo: photoBase64, status: isOnline ? "ACTIVE" : "PENDING_SYNC" };
      }
      return inm;
    }));

    const logId = `AUD-${Math.floor(10000 + Math.random() * 90000)}`;

    const newLog: AuditLog = {
      id: logId,
      userId: currentOperatorId,
      timestamp: new Date().toISOString(),
      action: "Edição",
      inmateId: inmate.id,
      inmateName: `${inmate.firstName} ${inmate.lastName}`,
      fieldChanged: "photo (Fotografia Mugshot)",
      oldValue: inmate.photo ? "Fotografia Existente" : "Sem Fotografia",
      newValue: "Nova Fotografia Carregada"
    };

    setAuditLogs(prev => [newLog, ...prev]);
    setGeneratedLogs(prev => [`[FOTO] Fotografia de identificação do recluso ${inmate.firstName} atualizada. Log: ${logId}`, ...prev]);

    if (!isOnline) {
      const offAction = {
         id: `loc-${Math.floor(10000 + Math.random() * 90000)}`,
         type: "Fotografia",
         description: `Carregamento de fotografia offline para o recluso ${inmate.firstName} ${inmate.lastName}`,
         timestamp: new Date().toISOString(),
         payload: { inmateId }
      };
      setSyncQueue(prev => [...prev, offAction]);
    }
  };

  // Automatic Reconnection Execution
  const handleAutomaticReconnectionAttempt = () => {
    if (isReconnecting) return;
    setIsReconnecting(true);
    setBgSyncLogs(prev => [
      `[${new Date().toLocaleTimeString()}] 📡 Iniciando verificação de canal VSAT...`,
      ...prev
    ]);

    // Step 1: Probe Network
    setTimeout(() => {
      setBgSyncLogs(prev => [
        `[${new Date().toLocaleTimeString()}] 🪐 Sintonizando satélite Luada-1. Pacotes enviados...`,
        ...prev
      ]);
    }, 1000);

    // Step 2: Authenticate Node Sec
    setTimeout(() => {
      setBgSyncLogs(prev => [
        `[${new Date().toLocaleTimeString()}] 🔒 Handshake criptográfico SHA-256 em curso...`,
        ...prev
      ]);
    }, 2000);

    // Step 3: Conclude (70% probability of success simulating instability resolution)
    setTimeout(() => {
      const isConnected = Math.random() < 0.70;
      if (isConnected) {
        setIsOnline(true);
        setIsReconnecting(false);
        setBgSyncCountdown(30);
        setBgSyncLogs(prev => [
          `[${new Date().toLocaleTimeString()}] ✅ Conexão restabelecida via VSAT Luanda!`,
          `[${new Date().toLocaleTimeString()}] 🚀 Canal online. Descarregando transações locais...`,
          ...prev
        ]);
        setGeneratedLogs(prev => [
          `[VSAT AUTO-RECONNECT] Conexão restabelecida automaticamente em segundo plano. Sincronizando dados.`,
          ...prev
        ]);
        // Auto trigger synchronization of local offline records
        if (syncQueue.length > 0) {
          triggerSync();
        }
      } else {
        setIsReconnecting(false);
        setBgSyncCountdown(30);
        setBgSyncLogs(prev => [
          `[${new Date().toLocaleTimeString()}] ❌ Tentativa falhou. Servidor inacessível. Rádio local está instável.`,
          `[${new Date().toLocaleTimeString()}] ⏳ Reiniciando cronómetro de 30 segundos...`,
          ...prev
        ]);
      }
    }, 3500);
  };

  // Timer loop for auto reconnection when offline
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (!isOnline && backgroundSyncEnabled && !isReconnecting) {
      intervalId = setInterval(() => {
        setBgSyncCountdown(prev => {
          if (prev <= 1) {
            handleAutomaticReconnectionAttempt();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBgSyncCountdown(30);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOnline, backgroundSyncEnabled, isReconnecting, syncQueue]);

  // Módulo de Documentos (Geração Automática)
  const [selectedTemplate, setSelectedTemplate] = useState<"internamento" | "soltura" | "transferencia" | "disciplina">("internamento");
  const [selectedDocumentCode, setSelectedDocumentCode] = useState<string>("AO-PNAP-2026-000492");
  const [inmateDetailsSubTab, setInmateDetailsSubTab] = useState<"document" | "timeline">("document");
  
  // Settings Tab sub-section
  const [settingsSubTab, setSettingsSubTab] = useState<"auditing" | "delegations">("auditing");
  const [delegationFilterStartDate, setDelegationFilterStartDate] = useState<string>("");
  const [delegationFilterEndDate, setDelegationFilterEndDate] = useState<string>("");
  const [delegationSearchQuery, setDelegationSearchQuery] = useState<string>("");
  const [delegationFilterStatus, setDelegationFilterStatus] = useState<string>("");
  const [delegationSortKey, setDelegationSortKey] = useState<"id" | "delegator" | "delegatee" | "role" | "period" | "validity" | "status" | null>(null);
  const [delegationSortDirection, setDelegationSortDirection] = useState<"asc" | "desc">("asc");

  // Disciplinary chart security threat toggles and severity filters
  const [disciplinarySeverityFilter, setDisciplinarySeverityFilter] = useState<"ALL" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("ALL");
  const [disciplinaryActiveTypes, setDisciplinaryActiveTypes] = useState({
    Agressao: true,
    Fuga: true,
    PosseIlicita: true,
    Indisciplina: true,
  });

  const filteredIncidentsData = useMemo(() => {
    return visiblePrisons.map(p => {
      const formattedName = p.name.replace("Estabelecimento Penitenciário de ", "EP ");
      const matched = disciplinaryIncidentsData.find(item => item.unit === formattedName) || {
        unit: formattedName,
        Agressao: (p.currentOccupancy % 5) + 1,
        Fuga: (p.currentOccupancy % 2),
        PosseIlicita: (p.currentOccupancy % 8) + 1,
        Indisciplina: (p.currentOccupancy % 6) + 1,
      };

      const base = { ...matched };
      
      // Scale incident values depending on the selected severity level
      if (disciplinarySeverityFilter === "LOW") {
        base.Agressao = 0;
        base.Fuga = 0;
        base.PosseIlicita = Math.round(matched.PosseIlicita * 0.15);
        base.Indisciplina = Math.round(matched.Indisciplina * 0.55);
      } else if (disciplinarySeverityFilter === "MEDIUM") {
        base.Agressao = Math.round(matched.Agressao * 0.1);
        base.Fuga = 0;
        base.PosseIlicita = Math.round(matched.PosseIlicita * 0.35);
        base.Indisciplina = Math.round(matched.Indisciplina * 0.35);
      } else if (disciplinarySeverityFilter === "HIGH") {
        base.Agressao = Math.round(matched.Agressao * 0.45);
        base.Fuga = Math.round(matched.Fuga * 0.30);
        base.PosseIlicita = Math.round(matched.PosseIlicita * 0.40);
        base.Indisciplina = Math.round(matched.Indisciplina * 0.10);
      } else if (disciplinarySeverityFilter === "CRITICAL") {
        base.Agressao = Math.round(matched.Agressao * 0.45);
        base.Fuga = Math.round(matched.Fuga * 0.70);
        base.PosseIlicita = Math.round(matched.PosseIlicita * 0.10);
         base.Indisciplina = 0;
      }
      
      // Zero out if the type checkbox is toggled off
      if (!disciplinaryActiveTypes.Agressao) base.Agressao = 0;
      if (!disciplinaryActiveTypes.Fuga) base.Fuga = 0;
      if (!disciplinaryActiveTypes.PosseIlicita) base.PosseIlicita = 0;
      if (!disciplinaryActiveTypes.Indisciplina) base.Indisciplina = 0;
      
      return base;
    });
  }, [visiblePrisons, disciplinaryIncidentsData, disciplinarySeverityFilter, disciplinaryActiveTypes]);

  const toggleDelegationSort = (key: "id" | "delegator" | "delegatee" | "role" | "period" | "validity" | "status") => {
    if (delegationSortKey === key) {
      setDelegationSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setDelegationSortKey(key);
      setDelegationSortDirection("asc");
    }
  };

  const renderDelegationSortIndicator = (key: "id" | "delegator" | "delegatee" | "role" | "period" | "validity" | "status") => {
    if (delegationSortKey !== key) {
      return <ArrowUpDown className="h-3 w-3 text-slate-605 inline-block align-middle ml-1" />;
    }
    return delegationSortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-amber-550 inline-block align-middle ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 text-amber-550 inline-block align-middle ml-1" />
    );
  };

  const [generatedLogs, setGeneratedLogs] = useState<string[]>([
    "Selo Digital PNAP-AO estabelecido.",
    "Rastreabilidade de guias judiciais integrada ao banco de dados PostgreSQL."
  ]);

  // QR Validation Scanner Tool Sim
  const [validateCodeInput, setValidateCodeInput] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleValidateDocument = (codeToScan?: string) => {
    const targetCode = codeToScan || validateCodeInput;
    if (!targetCode) return;

    // Search for matching inmate or standard code fallback
    const targetInmate = inmates.find(i => i.documentCode.toLowerCase() === targetCode.toLowerCase().trim());
    
    if (targetInmate) {
      // Find crime description
      let crimeText = "Código Penal de Angola";
      for (const group of Object.values(PENAL_CODE_GROUPS)) {
        const found = group.crimes.find(c => c.id === targetInmate.crimeId);
        if (found) {
          crimeText = `${found.article} - ${found.name}`;
          break;
        }
      }
      
      const prisonObj = prisons.find(p => p.id === targetInmate.assignedPrisonId);

      setVerificationResult({
        status: "VALID",
        code: targetInmate.documentCode,
        title: "Guia Oficial de Internamento Prisional",
        inmateName: `${targetInmate.firstName} ${targetInmate.lastName}`,
        birthDate: targetInmate.birthDate,
        biNumber: targetInmate.idCard,
        crime: crimeText,
        establishment: prisonObj?.name || "Estabelecimento Penitenciário de Viana",
        securityClearance: `Risco ${targetInmate.riskLevel}`,
        emitDate: "13-06-2026",
        emissionHash: "SHA256: 8a73c241b3034a80a54952f9570c05c4ec9e9a4867b36f1b402802ad1daadbcf",
        validity: "Autêntico e Consolidado no Sistema Central do MININT-GP"
      });
    } else {
      // Standard templates or manual mocks
      if (targetCode.startsWith("AO-PNAP-")) {
        setVerificationResult({
          status: "VALID",
          code: targetCode,
          title: "Documento Penitenciário Registado",
          inmateName: "Manuel Domingos João",
          birthDate: "14/08/1994",
          biNumber: "002847192LA049",
          crime: "Artigo 130º - Homicídio Voluntário",
          establishment: "Estabelecimento Penitenciário de Viana",
          securityClearance: "Risco Máximo",
          emitDate: "01-02-2026",
          emissionHash: "SHA256: 09ef283ac4859aef902e8174f882a174092bbf01a90c10283a009ef3c09acff2",
          validity: "Autêntico e Ativo no Banco Nacional de Luanda"
        });
      } else {
        setVerificationResult({
          status: "INVALID",
          code: targetCode,
          error: "Código de Segurança QR não localizado ou inválido no blockchain/PostgreSQL central da PNAP-AO."
        });
      }
    }
  };

  // Get active documented person metadata
  const currentInmateMetadata = useMemo(() => {
    return inmates.find(i => i.documentCode === selectedDocumentCode) || inmates[0];
  }, [selectedDocumentCode, inmates]);

  // Memo compound history of selected inmate for movement timeline
  const inmateFullHistory = useMemo(() => {
    if (!currentInmateMetadata) return [];

    const inmateId = currentInmateMetadata.id;
    const baseline: {
      id: string;
      timestamp: string;
      action: "Admissão" | "Transferência";
      fromPrisonName: string;
      toPrisonName: string;
      operator: string;
      reason: string;
    }[] = [];

    if (inmateId === "AO-REC-089") { // Manuel Domingos João
      baseline.push(
        {
          id: "MOVE-HIST-089-A",
          timestamp: "2026-02-10T10:00:00Z",
          action: "Admissão",
          fromPrisonName: "Entrada Directa",
          toPrisonName: "EP Kakila",
          operator: "Superintendente Pedro",
          reason: "Ingresso inicial determinado pelo Tribunal Provincial de Luanda"
        },
        {
          id: "MOVE-HIST-089-B",
          timestamp: "2026-04-15T14:30:00Z",
          action: "Transferência",
          fromPrisonName: "EP Kakila",
          toPrisonName: "EP Sanza Pombo",
          operator: "Inspector-Chefe Kassoma",
          reason: "Otimização de espaço e adequação de segurança média"
        },
        {
          id: "MOVE-HIST-089-C",
          timestamp: "2026-05-20T08:15:00Z",
          action: "Transferência",
          fromPrisonName: "EP Sanza Pombo",
          toPrisonName: "EP Viana",
          operator: "Sub-chefe Ngola",
          reason: "Transferência médica e proximidade familiar autorizada"
        }
      );
    } else if (inmateId === "AO-REC-115") { // Carla Antónia Gouveia
      baseline.push(
        {
          id: "MOVE-HIST-115-A",
          timestamp: "2026-03-22T09:12:00Z",
          action: "Admissão",
          fromPrisonName: "Entrada Directa",
          toPrisonName: "EP Viana",
          operator: "Sub-chefe Ngola",
          reason: "Instaurado mandado pelo Ministério Público"
        },
        {
          id: "MOVE-HIST-115-B",
          timestamp: "2026-05-02T16:40:00Z",
          action: "Transferência",
          fromPrisonName: "EP Viana",
          toPrisonName: "EP Kakila",
          operator: "Superintendente Pedro",
          reason: "Transferência extraordinária a pedido da defesa homologada"
        }
      );
    } else if (inmateId === "AO-REC-204") { // Sebastião Kiala Mendes
      baseline.push(
        {
          id: "MOVE-HIST-204-A",
          timestamp: "2026-01-15T11:00:00Z",
          action: "Admissão",
          fromPrisonName: "Entrada Directa",
          toPrisonName: "EP Sanza Pombo",
          operator: "Inspector-Chefe Kassoma",
          reason: "Cadastramento inicial nacional"
        },
        {
          id: "MOVE-HIST-204-B",
          timestamp: "2026-03-10T13:20:00Z",
          action: "Transferência",
          fromPrisonName: "EP Sanza Pombo",
          toPrisonName: "EP Viana",
          operator: "Superintendente Pedro",
          reason: "Mandado de instrução criminal em Luanda"
        }
      );
    } else {
      // General dynamic baseline for new manual registrants
      const matchedAdmitLog = auditLogs.find(l => l.inmateId === inmateId && l.action === "Admissão");
      const baselinePrisonId = currentInmateMetadata.assignedPrisonId;
      const pName = prisons.find(p => p.id === baselinePrisonId)?.name.replace("Estabelecimento Penitenciário de ", "EP ") || "EP Viana";
      
      baseline.push({
        id: matchedAdmitLog ? `MOVE-HIST-${matchedAdmitLog.id}` : `MOVE-HIST-NEW-${inmateId}`,
        timestamp: matchedAdmitLog ? matchedAdmitLog.timestamp : new Date(Date.now() - 3600000).toISOString(),
        action: "Admissão",
        fromPrisonName: "Entrada Directa",
        toPrisonName: pName,
        operator: matchedAdmitLog ? matchedAdmitLog.userId : currentOperatorId,
        reason: "Boletim de admissão e classificação de risco concluída"
      });
    }

    // Dynamic transfers added in live session
    const liveTransfers = auditLogs
      .filter(log => log.inmateId === inmateId && log.action === "Transferência")
      .map(log => {
        return {
          id: log.id,
          timestamp: log.timestamp,
          action: "Transferência" as const,
          fromPrisonName: log.oldValue || "Origem Oculta",
          toPrisonName: log.newValue || "EP Desconhecida",
          operator: log.userId,
          reason: "Modificação manual de lotação via consórcio MININT"
        };
      });

    // Merge and chronologically sort
    const fullTimeline = [...baseline, ...[...liveTransfers].reverse()];
    return fullTimeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [currentInmateMetadata, auditLogs, prisons, currentOperatorId]);

  // SQL Schema Generator for full DB (representing the 90-120 tables of the enterprise tier)
  const fullSqlDdl = useMemo(() => {
    let sql = `-- =========================================================================\n`;
    sql += `-- SCRIPT DDL COMPILADO - PLATAFORMA NACIONAL PENITENCIÁRIA DE ANGOLA (PNAP-AO)\n`;
    sql += `-- Gerado em: 13-06-2026 | Multi-Tenancy Institucional habilitado\n`;
    sql += `-- Suporte Criptográfico SHA-256 e Replicação Offline local IndexedDB estipulada\n`;
    sql += `-- Total de Tabelas na Arquitetura de Produção: 114 tabelas\n`;
    sql += `-- =========================================================================\n\n`;

    TABLES_METADATA.forEach(table => {
      sql += `-- Módulo: ${table.module.toUpperCase()} | Soft Delete: ${table.hasSoftDelete ? "Sim" : "Não"} | Multi-Tenant: ${table.hasMultiTenancy ? "Sim" : "Não"}\n`;
      sql += `CREATE TABLE pnap_${table.name.toLowerCase()} (\n`;
      table.columns.forEach((col, idx) => {
        const pkConstraint = col.isPK ? " PRIMARY KEY" : "";
        const nullableConstraint = col.isNullable ? "" : " NOT NULL";
        const comma = idx === table.columns.length - 1 ? "" : ",";
        sql += `  ${col.name.padEnd(25, " ")} ${col.type}${pkConstraint}${nullableConstraint}${comma} -- ${col.description}\n`;
      });
      
      // Add standard audit and security patterns automatically mapping to the user demands
      if (table.hasSoftDelete || table.hasMultiTenancy) {
        sql += `  -- Metadados de Auditoria Operacional & Soft Delete\n`;
        sql += `  deleted_at                TIMESTAMP NULL, \n`;
        sql += `  is_deleted                BOOLEAN DEFAULT FALSE NOT NULL,\n`;
      }
      
      sql += `  created_by_user_id        UUID NULL, \n`;
      sql += `  updated_by_user_id        UUID NULL, \n`;
      sql += `  system_created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, \n`;
      sql += `  system_updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL \n`;
      
      sql += `);\n\n`;
    });

    return sql;
  }, []);

  // Filter columns of ERD
  const filteredTables = useMemo(() => {
    return TABLES_METADATA.filter(table => {
      const matchSearch = table.name.toLowerCase().includes(searchTable.toLowerCase()) || 
                          table.description.toLowerCase().includes(searchTable.toLowerCase());
      const matchModule = selectedModule === "all" || table.module === selectedModule;
      
      let matchFilterType = true;
      if (erdFilterType === "sync") matchFilterType = table.hasOfflineSync;
      else if (erdFilterType === "multitenant") matchFilterType = table.hasMultiTenancy;
      else if (erdFilterType === "softdelete") matchFilterType = table.hasSoftDelete;

      return matchSearch && matchModule && matchFilterType;
    });
  }, [searchTable, selectedModule, erdFilterType]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-hidden antialiased">
        {/* Connection top bar */}
        {!isOnline ? (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200 z-50">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-amber-400 animate-pulse" />
              <span>
                <strong>MODO DE CONTINGÊNCIA ATIVO:</strong> Sem conexão com o servidor do MININT em Luanda. Autenticação através de cache local cifrado.
              </span>
            </div>
            <button 
              onClick={() => setIsOnline(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-xxs cursor-pointer font-mono transition-all"
            >
              Ficar Online
            </button>
          </div>
        ) : (
          <div className="bg-emerald-500/15 border-b border-emerald-500/25 px-4 py-1.5 flex items-center justify-between text-xs text-emerald-300 z-50">
            <div className="flex items-center gap-2">
              <Wifi className="h-3.5 w-3.5 text-emerald-400" />
              <span><strong>VSAT INTEGRADO:</strong> Ligação central ativa com Luanda-Cen1 HQ.</span>
            </div>
            <button 
              onClick={() => setIsOnline(false)}
              className="text-slate-400 hover:text-amber-400 text-xxs underline cursor-pointer font-mono transition-all"
            >
              Simular Sem Sinal
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.03)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-visible">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-amber-600 animate-pulse" />
            
            {/* Logo / Header */}
            <div className="text-center flex flex-col items-center gap-3">
              <div className="bg-slate-950 p-4 rounded-full border border-slate-700 shadow-lg relative flex items-center justify-center">
                <Shield className="h-10 w-10 text-amber-500" />
              </div>
              <div>
                <span className="text-[10px] md:text-xs font-mono font-bold text-slate-400 tracking-[0.2em] uppercase">
                  MINISTÉRIO DO INTERIOR • ANGOLA
                </span>
                <h1 className="text-xl md:text-2xl font-black text-slate-100 font-sans tracking-tight mt-1">
                  PNAP-AO
                </h1>
                <p className="text-[10px] text-slate-400 font-mono mt-1 font-semibold uppercase tracking-wider leading-relaxed">
                  Plataforma Nacional de Administração Penitenciária
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!isSetupDone ? (
                /* Ecrã 1: Seleção Institucional */
                <motion.div
                  key="step1-sys-select"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-4"
                >
                  <div className="border-y border-slate-800/60 py-3 text-center">
                    <span className="text-xs text-slate-300 font-semibold flex items-center justify-center gap-1.5 font-mono uppercase tracking-wider">
                      <Building className="h-3.5 w-3.5 text-amber-500" /> Ecrã 1 — Seleção Institucional
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Esta etapa não autentica o utilizador. Serve apenas para definir o contexto operacional do terminal nos servidores regionais.
                    </p>
                  </div>

                  {/* Província Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
                      Província:
                    </label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500/80 cursor-pointer w-full transition-all"
                    >
                      {Object.keys(institutionalHierarchy).map((prov) => (
                        <option key={prov} value={prov}>
                          {prov === "Nacional" ? "Nacional — Super Admin / Acesso Nacional" : prov}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-amber-300 font-mono mt-1">
                      Selecione “Nacional” para iniciar como Super Admin / Director Geral. Este terminal será configurado para acesso nacional completo.
                    </p>
                  </div>

                  {/* Direção Provincial Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
                      Direção Provincial:
                    </label>
                    <select
                      value={selectedDir}
                      onChange={(e) => setSelectedDir(e.target.value)}
                      className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500/80 cursor-pointer w-full transition-all"
                    >
                      {Object.keys(institutionalHierarchy[selectedProvince]?.directions || {}).map((dir) => (
                        <option key={dir} value={dir}>
                          {dir}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Dropdown Estabelecimento */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
                      Estabelecimento:
                    </label>
                    <select
                      value={selectedEstablishmentId}
                      onChange={(e) => setSelectedEstablishmentId(e.target.value)}
                      className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500/80 cursor-pointer w-full transition-all"
                    >
                      {(institutionalHierarchy[selectedProvince]?.directions[selectedDir] || []).map((est) => (
                        <option key={est.id} value={est.id}>
                          {est.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Continue Button */}
                  <button
                    type="button"
                    onClick={() => setIsSetupDone(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold py-3.5 px-4 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/10 mt-2 font-mono uppercase tracking-wider"
                  >
                    Continuar <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              ) : (
                /* Ecrã 2: Autenticação */
                <motion.div
                  key="step2-auth-credentials"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-3 text-center">
                    <span className="text-[10px] text-slate-500 font-mono block uppercase">Terminal configurado para:</span>
                    <span className="text-xs font-sans font-bold text-amber-500 mt-1 block">
                      {(() => {
                        const ests = institutionalHierarchy[selectedProvince]?.directions[selectedDir] || [];
                        const matchingEst = ests.find(e => e.id === selectedEstablishmentId);
                        return matchingEst ? matchingEst.name : "Desconhecido";
                      })()}
                    </span>
                  </div>

                  {authError && (
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-2.5 text-[11px] text-red-300">
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 animate-bounce" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Utilizador Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
                      Utilizador:
                    </label>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Ex: dggeral"
                      className="bg-slate-950 border border-slate-850 p-3 rounded-lg text-xs leading-none text-slate-100 font-mono focus:outline-none focus:border-amber-500/80 w-full"
                    />
                  </div>

                  {/* Senha Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
                      Senha:
                    </label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="bg-slate-950 border border-slate-855 p-3 rounded-lg text-xs leading-none text-slate-100 font-mono focus:outline-none focus:border-amber-500/80 w-full"
                    />
                  </div>

                  {/* Row of Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSetupDone(false);
                        setAuthError(null);
                      }}
                      className="bg-slate-950/60 hover:bg-slate-950 hover:text-slate-200 border border-slate-850 text-slate-400 text-xxs font-bold py-3 px-2 rounded-lg cursor-pointer transition-all text-center uppercase font-mono"
                    >
                      ← Voltar
                    </button>
                    <button
                      type="button"
                      onClick={handleSystemLogin}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xxs font-bold py-3 px-2 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg font-mono uppercase tracking-wider"
                    >
                      Entrar <Check className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Quick select demonstration credentials (highly helpful!) */}
                  <div className="border-t border-slate-850 pt-4 mt-2">
                    <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wider block mb-2 font-mono text-center font-semibold">
                      🔑 Simulação de Operadores e Chaves do NREP-AO
                    </span>
                    
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                      {operators.map((op) => {
                        const isMatchingEstablishment = op.level === "NATIONAL" || 
                          op.role === "DIRECTOR_GERAL" ||
                          (op.level === "PROVINCIAL" && op.province === selectedProvince) ||
                          (op.level === "ESTABLISHMENT" && op.assignedPrisonId === selectedEstablishmentId);

                        return (
                          <button
                            key={op.id}
                            type="button"
                            onClick={() => {
                              setUsernameInput(op.username);
                              setPasswordInput(op.senha_hash);
                              setAuthError(null);
                              if (op.role === "DIRECTOR_GERAL") {
                                setSelectedProvince("Nacional");
                                setSelectedDir("Direção Nacional");
                                setSelectedEstablishmentId("NACIONAL");
                              }
                            }}
                            className={`p-2 text-left rounded border text-xxs flex flex-col gap-0.5 cursor-pointer transition-all ${
                              isMatchingEstablishment 
                                ? "bg-slate-900 border-slate-700/60 text-slate-200"
                                : "bg-slate-950/40 border-slate-900 text-slate-500 opacity-60 hover:opacity-100 hover:bg-slate-900"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-300">{op.name}</span>
                              <span className="font-mono text-[8px] bg-slate-950 px-1 rounded text-slate-400 border border-slate-850">
                                {op.role === "DIRECTOR_GERAL" ? "GLOBAL" : op.level}
                              </span>
                            </div>
                            <p className="text-[9px] text-slate-450 text-slate-400 font-sans truncate">
                              Província: {op.province || "Nacional"} | Papel: {op.roleName}
                            </p>
                            <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5">
                              <span>User: <strong className="text-amber-500">{op.username}</strong></span>
                              <span>Senha: <strong className="text-slate-300">{op.senha_hash}</strong></span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
 
        {/* Status History Modal */}
        <AnimatePresence>
          {selectedHistoryDelegation && (() => {
            const delegatorObj = NREP_OPERATORS.find(op => op.id === selectedHistoryDelegation.delegatorId);
            const delegateeObj = NREP_OPERATORS.find(op => op.id === selectedHistoryDelegation.delegateeId);
            const roleObj = SYSTEM_ROLES.find(r => r.id === selectedHistoryDelegation.roleId);

            // Default history log if none exists
            const historyList = selectedHistoryDelegation.statusHistory || [
              {
                status: selectedHistoryDelegation.status,
                timestamp: new Date().toISOString(),
                operatorName: "Sistema (Automático)",
                details: "Registo de delegação padrão no sistema de patentes civis/militares."
              }
            ];

            const formatTimestamp = (isoStr: string) => {
              try {
                const date = new Date(isoStr);
                return date.toLocaleString("pt-PT", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                });
              } catch (e) {
                return isoStr;
              }
            };

            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col font-sans"
                >
                  {/* Header */}
                  <div className="bg-slate-950 text-slate-200 border-b border-slate-800 p-4 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-2 font-mono">
                      <History className="h-4 w-4 shrink-0 text-amber-500 animate-pulse" />
                      Histórico da Portaria <strong className="text-amber-500 font-extrabold">{selectedHistoryDelegation.id}</strong>
                    </span>
                    <button 
                      onClick={() => setSelectedHistoryDelegation(null)}
                      className="hover:scale-110 active:scale-95 transition-all text-slate-400 hover:text-slate-250 bg-slate-900 hover:bg-slate-800 p-1.5 rounded-full text-xxs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
                    {/* Resumo da Portaria */}
                    <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl flex flex-col gap-2 font-mono text-[10px]">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <div className="flex flex-col">
                          <span className="text-slate-500 font-bold">DELEGADOR:</span>
                          <span className="text-slate-300 font-bold">{delegatorObj?.name || "Autoridade Geral"}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-550 font-bold">BENEFICIÁRIO:</span>
                          <span className="text-slate-300 font-bold">{delegateeObj?.name || "Operador Indicado"}</span>
                        </div>
                        <div className="flex flex-col col-span-2">
                          <span className="text-slate-550 font-bold">FUNÇÃO OUTORGADA:</span>
                          <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded text-[9.5px] w-fit font-sans font-extrabold uppercase mt-1">
                            {roleObj?.name || "Comissário Ad-hoc"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="flex flex-col mt-2">
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-4 block font-extrabold">
                        Rastro de Auditoria e Status ({historyList.length})
                      </span>

                      <div className="relative border-l border-slate-800 ml-3 pl-6 flex flex-col gap-6">
                        {historyList.map((item, idx) => {
                          let itemBadgeClass = "";
                          let itemDotClass = "";
                          let itemIcon = HelpCircle;

                          if (item.status === "ACTIVE") {
                            itemBadgeClass = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
                            itemDotClass = "bg-emerald-500 border-2 border-slate-900";
                            itemIcon = CheckCircle2;
                          } else if (item.status === "SCHEDULED") {
                            itemBadgeClass = "bg-amber-500/10 text-amber-500 border border-amber-500/20";
                            itemDotClass = "bg-amber-500 border-2 border-slate-900";
                            itemIcon = Clock;
                          } else if (item.status === "REVOKED") {
                            itemBadgeClass = "bg-red-500/10 text-red-500 border border-red-500/20";
                            itemDotClass = "bg-red-500 border-2 border-slate-900";
                            itemIcon = AlertTriangle;
                          } else {
                            itemBadgeClass = "bg-red-500/10 text-red-500 border border-red-505/20";
                            itemDotClass = "bg-red-600 border-2 border-slate-900";
                            itemIcon = AlertTriangle;
                          }

                          return (
                            <div key={idx} className="relative">
                              {/* Connector Dot */}
                              <div className={`absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full ${itemDotClass} z-10`} />

                              <div className="bg-slate-950/45 border border-slate-850/60 p-3 rounded-lg flex flex-col gap-1.5 transition hover:border-slate-800">
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono ${itemBadgeClass}`}>
                                    {item.status}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-mono">
                                    {formatTimestamp(item.timestamp)}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-350 leading-relaxed font-sans mt-0.5">
                                  {item.details}
                                </div>
                                <div className="text-[9px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                                  <span className="text-slate-600 font-bold">RESPONSÁVEL:</span>
                                  <span className="text-slate-400 font-semibold">{item.operatorName}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Actions Panel */}
                  <div className="bg-slate-950 px-5 py-3 border-t border-slate-850 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedHistoryDelegation(null)}
                      className="bg-slate-900 hover:bg-slate-850 text-slate-300 font-semibold border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl text-[10px] cursor-pointer transition shadow-md active:scale-95"
                    >
                      Fechar Histórico
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
          </div>

          {/* Footer info lock indicator */}
          <div className="text-[9px] font-mono text-slate-550 text-slate-500 uppercase tracking-widest mt-6 text-center max-w-sm flex flex-col gap-1">
            <span>MININT SIGP • SISTEMA PRIVADO DO ESTADO DE ANGOLA</span>
            <span className="opacity-70 flex items-center justify-center gap-1">
               <Lock className="h-2.5 w-2.5 text-slate-600" /> Acesso restrito sob termos do NREP-AO militar e penal.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      
      {/* Banner de Estado Offline / Contingência */}
      {!isOnline && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-amber-400 animate-pulse" />
            <span>
              <strong>MODO DE CONTINGÊNCIA ATIVO:</strong> Sem conexão com o servidor do MININT em Luanda. Os dados de admissão e guias estão a ser enfileirados localmente no <strong>IndexedDB</strong> com hashes estipulados.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-amber-950 border border-amber-500/40 px-2 py-0.5 rounded-sm text-xxs font-mono">
              Fila: {syncQueue.length} items pendentes
            </span>
            <button 
              onClick={() => setIsOnline(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-xxs cursor-pointer transition-colors"
            >
              Simular Restabelecimento de Sinal
            </button>
          </div>
        </div>
      )}

      {isOnline && (
        <div className="bg-emerald-500/15 border-b border-emerald-500/20 px-4 py-1.5 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
            <span><strong>CONEXÃO RECONHECIDA:</strong> Base Centralizada de Angola Activa. Sincronismo automático ligado.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xxs bg-emerald-950 border border-emerald-500/30 px-2 py-0.2 rounded-sm">
              Terminal: Luanda-Cen1
            </span>
            <button 
              onClick={() => setIsOnline(false)}
              className="text-slate-400 hover:text-amber-400 text-xxs underline cursor-pointer"
            >
              Simular perda de internet
            </button>
          </div>
        </div>
      )}

      {/* Header Corporativo Nacional */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-700/80 shadow-md">
            <Shield className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-slate-100 text-xxs font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-sm font-mono">
                MININT
              </span>
              <span className="text-slate-400 text-xs">|</span>
              <span className="text-amber-500 text-xs uppercase font-mono tracking-wider font-semibold">
                Serviços Penitenciários de Angola
              </span>
            </div>
            <h1 className="text-sm font-bold md:text-lg text-slate-100 font-sans tracking-tight">
              Plataforma Nacional de Administração Penitenciária <span className="text-amber-500">(PNAP-AO)</span>
            </h1>
          </div>
        </div>

        {/* WAT Angola Clock indicator & stats */}
        <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm">
          <div className="bg-slate-950/80 px-4 py-2 border border-slate-800 rounded-lg flex items-center gap-2 shadow-inner">
            <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
            <span className="font-mono text-slate-300 tracking-wider text-xxs md:text-xs">
              {currentTime || "Carregando Hora WAT..."} (Angola)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </div>
            <span className="text-xxs font-mono text-slate-400 uppercase tracking-widest leading-none">
              Estado: Integrador Activo
            </span>
          </div>
        </div>
      </header>

      {/* Ranhura de Informação Complementar de Lotação e Alertas do País */}
      <div className="bg-slate-900/40 border-b border-slate-800 px-6 py-3 flex overflow-x-auto gap-6 items-center justify-between">
        {(() => {
          const activeInmates = visibleInmates.filter(i => i.status === "ACTIVE" || i.status === "PENDING_SYNC");
          const totalOfficial = visiblePrisons.reduce((acc, p) => acc + p.officialCapacity, 0);
          const totalOperational = visiblePrisons.reduce((acc, p) => acc + p.operationalCapacity, 0);
          const totalOccupancy = activeInmates.length;

          const offCap = currentOperator.territorialScope === TerritorialScope.NATIONAL ? 2500 : totalOfficial;
          const actPop = currentOperator.territorialScope === TerritorialScope.NATIONAL ? 2740 : totalOccupancy;
          const limitCap = currentOperator.territorialScope === TerritorialScope.NATIONAL ? 2500 : totalOperational;
          
          const isOvercrowded = actPop > limitCap;
          const labelPrefix = currentOperator.territorialScope === TerritorialScope.NATIONAL ? "do País" :
                              currentOperator.territorialScope === TerritorialScope.PROVINCIAL ? `da Província (${currentOperator.province})` :
                              `do Estabelecimento (${visiblePrisons[0]?.name.replace("Estabelecimento Penitenciário de ", "") || "Local"})`;
          
          const capacityLabel = currentOperator.territorialScope === TerritorialScope.NATIONAL ? "Lotação Oficial Nacional" : "Capacidade Oficial Regional";
          const populationLabel = currentOperator.territorialScope === TerritorialScope.NATIONAL ? "População Atual" : "Carga de Reclusos Ativos";

          return (
            <div className="flex items-center gap-6">
              <span className="text-xs uppercase text-slate-400 font-bold tracking-wider shrink-0 flex items-center gap-1.5 border-r border-slate-800 pr-4">
                <Activity className="h-3.5 w-3.5 text-amber-500" /> Visão Geral {labelPrefix}:
              </span>
              <div className="flex gap-4 text-xs text-slate-300 shrink-0">
                <div>
                  {capacityLabel}: <span className="font-mono text-slate-100 font-semibold">{offCap.toLocaleString()}</span>
                </div>
                <span className="text-slate-800">|</span>
                <div>
                  {populationLabel}: <span className={`font-mono font-bold ${isOvercrowded ? "text-red-400" : "text-emerald-400"}`}>{actPop.toLocaleString()}</span> {isOvercrowded && <span className="text-red-400/80 font-semibold text-xxs">(Sobrelotação)</span>}
                </div>
                <span className="text-slate-800">|</span>
                <div>
                  Aguardando Julgamento: <span className="font-mono text-amber-400 font-medium">35%</span>
                </div>
                <span className="text-slate-800">|</span>
                <div>
                  Sync Queue Ativa: <span className="font-mono text-slate-100">{syncQueue.length}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Dynamic NREP Status indicators */}
        <div className="flex items-center gap-2 font-mono text-[10px] shrink-0 text-slate-400">
          <span className="text-xxs px-1.5 py-0.5 rounded bg-slate-950 border border-slate-850">Sync VSAT: Activo</span>
          <span className="text-xxs px-1.5 py-0.5 rounded bg-slate-950 border border-slate-850 text-emerald-400">Integridade: 100%</span>
        </div>
      </div>

      {/* NREP Credenciais e Auditoria de Acesso */}
      <div className="bg-slate-950 px-6 py-3 border-b border-slate-850 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/15 p-2 rounded border border-amber-500/30">
            <UserCheck className="h-4 w-4 text-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs font-black text-slate-100">{currentOperator.name}</span>
              <span className="bg-slate-900 text-slate-300 font-mono text-[9px] px-1.5 py-0.2 rounded border border-slate-800">
                {currentOperator.id}
              </span>
              <span className="bg-amber-500 text-slate-950 font-mono font-bold text-[9px] px-1.5 py-0.2 rounded">
                NREP: {currentOperator.level}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
              Função: <span className="text-slate-200 font-semibold">{currentOperator.roleName}</span> ({currentOperator.roleDescription})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Active Constraints Indicators */}
          <div className="bg-slate-900/60 border border-slate-800 px-3.5 py-1.5 rounded-lg flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[10px] text-slate-300 font-mono">
              Restrições Territoriais: <span className="text-amber-400 font-bold">
                {currentOperator.role === "DIRECTOR_GERAL" ? "Nenhuma (Visão Nacional)" :
                 currentOperator.role === "DIRECTOR_PROVINCIAL" ? `Limitação Regional (${currentOperator.province})` :
                 `Limitação Local (${prisons.find(p => p.id === currentOperator.assignedPrisonId)?.name || "Local"})`}
              </span>
            </span>
          </div>

          <div className={`border px-3.5 py-1.5 rounded-lg flex items-center gap-2 ${
            currentOperator.role === "CHEFE_SEGURANCA" ? "bg-red-500/10 border-red-500/30 text-red-200" :
            currentOperator.role === "CHEFE_SAUDE" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" :
            "bg-slate-900/60 border-slate-800 text-slate-300"
          }`}>
            <Shield className="h-3 w-3" />
            <span className="text-[10px] font-mono">
              Janela de Acesso: <span className="font-bold">
                {currentOperator.role === "CHEFE_SEGURANCA" ? "Vigilância Activa (Segurança Omitida Saúde)" :
                 currentOperator.role === "CHEFE_SAUDE" ? "Prontuário Médico (Segurança Omitida Geral)" :
                 "Geral Administrativo NREP-AO"}
              </span>
            </span>
          </div>

          <button 
            onClick={() => setActiveTab("settings")} 
            className="text-[10px] cursor-pointer hover:bg-slate-800 border border-slate-800 hover:text-amber-500 hover:border-amber-500/35 px-2.5 py-1.5 rounded text-slate-400 transition-all font-mono font-bold flex items-center gap-1 shrink-0"
            title="Alterar perfil simulador"
          >
            <Sliders className="h-3 w-3 text-amber-500/70" /> SELECCIONAR SIMULADOR
          </button>

          <button 
            onClick={() => {
              setIsLoggedIn(false);
              setIsSetupDone(false);
              setUsernameInput("");
              setPasswordInput("");
            }} 
            className="text-[10px] cursor-pointer hover:bg-red-950/60 border border-slate-800 hover:text-red-400 hover:border-red-500/35 px-2.5 py-1.5 rounded text-slate-400 transition-all font-mono font-bold flex items-center gap-1 shrink-0"
            title="Sair da plataforma e voltar aos ecrãs iniciais"
          >
            <Lock className="h-3 w-3 text-red-500" /> SAIR E DETECTAR
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA ESQUERDA: ESTRUTURA ORGÂNICA NACIONAL */}
        {isSidebarExpanded && (
          <aside className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl select-none animate-fadeIn">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-2">
              <Shield className="h-4 w-4" /> Hierarquia Territorial
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">
              Direções provinciais, estabelecimentos, pavilhões e celas operacionais na Nuvem.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-800 text-xs font-sans overflow-y-auto max-h-[580px] pr-1">
            {/* PROVINCIAS TREE */}
            {PROVINCES_HARDCODED.filter(provName => {
              if (currentOperator.territorialScope === TerritorialScope.NATIONAL) return true;
              if (currentOperator.territorialScope === TerritorialScope.PROVINCIAL) {
                return provName.toLowerCase() === currentOperator.province?.toLowerCase();
              }
              if (currentOperator.territorialScope === TerritorialScope.ESTABLISHMENT) {
                const activePr = prisons.find(p => p.id === currentOperator.assignedPrisonId);
                if (!activePr) return false;
                return activePr.location.toLowerCase().includes(provName.toLowerCase());
              }
              return true;
            }).map(provName => {
              const isOpen = expandedProv[provName];
              const provMuns = municipalities.filter(m => m.province === provName);

              return (
                <div key={provName} className="flex flex-col gap-1">
                  {/* Province Row */}
                  <div className="flex items-center justify-between p-1.5 hover:bg-slate-850 rounded cursor-pointer group transition-colors">
                    <div 
                      className="flex items-center gap-2 flex-grow" 
                      onClick={() => {
                        setExpandedProv(prev => ({ ...prev, [provName]: !prev[provName] }));
                        setSelectedHierNode({ type: "PROVINCE", id: provName, name: provName });
                      }}
                    >
                      <MapPin className={`h-4 w-4 ${selectedHierNode?.type === "PROVINCE" && selectedHierNode?.id === provName ? "text-amber-500 font-bold" : "text-slate-400"}`} />
                      <span className={`font-semibold text-slate-200 text-xs ${selectedHierNode?.type === "PROVINCE" && selectedHierNode?.id === provName ? "text-amber-400 font-bold" : ""}`}>{provName}</span>
                    </div>
                    
                    {currentOperator.role === "DIRECTOR_GERAL" && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openCreateMunicipalityModal(provName);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-950 rounded transition-all" 
                        title="Criar Município"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  {/* Municipalities list */}
                  {isOpen && (
                    <div className="pl-3 flex flex-col gap-1 border-l border-slate-800 ml-3 mt-0.5">
                      {provMuns.length === 0 ? (
                        <span className="text-[9px] text-slate-500 italic pl-2.5">Sem municípios</span>
                      ) : (
                        provMuns.map(mun => {
                          const isMunOpen = expandedMuns[mun.id];
                          const munPrisons = prisons.filter(p => p.municipalityId === mun.id).filter(p => {
                            if (currentOperator.territorialScope === TerritorialScope.ESTABLISHMENT) {
                              return p.id === currentOperator.assignedPrisonId;
                            }
                            return true;
                          });

                          return (
                            <div key={mun.id} className="flex flex-col gap-1">
                              {/* Municipality Row */}
                              <div className="flex items-center justify-between p-1 hover:bg-slate-850 rounded cursor-pointer group transition-colors">
                                <span 
                                  className="flex items-center gap-1.5 flex-grow text-xxs font-mono"
                                  onClick={() => {
                                    setExpandedMuns(prev => ({ ...prev, [mun.id]: !prev[mun.id] }));
                                    setSelectedHierNode({ type: "MUNICIPALITY", id: mun.id, name: mun.name, parentId: provName });
                                  }}
                                >
                                  <MapPin className={`h-3 w-3 ${selectedHierNode?.type === "MUNICIPALITY" && selectedHierNode?.id === mun.id ? "text-amber-500" : "text-slate-600"}`} />
                                  <span className={`text-slate-300 ${selectedHierNode?.type === "MUNICIPALITY" && selectedHierNode?.id === mun.id ? "text-amber-400 font-bold" : ""}`}>{mun.name}</span>
                                </span>

                                {currentOperator.role === "DIRECTOR_GERAL" && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openCreatePrisonModal(mun.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-950 rounded transition-all" 
                                    title="Criar Cadeia (EP)"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                )}
                              </div>

                              {/* Prisons list */}
                              {isMunOpen && (
                                <div className="pl-3.5 flex flex-col gap-1 border-l border-slate-850 ml-2">
                                  {munPrisons.length === 0 ? (
                                    <span className="text-[9px] text-slate-500 italic pl-1.5">Sem EPs</span>
                                  ) : (
                                    munPrisons.map(prison => {
                                      const isPrisonOpen = expandedPrisons[prison.id];
                                      return (
                                        <div key={prison.id} className="flex flex-col gap-1">
                                          <div className="flex items-center justify-between p-0.5 hover:bg-slate-850 rounded cursor-pointer group transition-colors">
                                            <div 
                                              className="flex items-center gap-1 flex-grow" 
                                              onClick={() => {
                                                setExpandedPrisons(prev => ({ ...prev, [prison.id]: !prev[prison.id] }));
                                                setSelectedHierNode({ type: "PRISON", id: prison.id, name: prison.name, parentId: mun.id });
                                              }}
                                            >
                                              <Building className={`h-3.5 w-3.5 shrink-0 ${selectedHierNode?.type === "PRISON" && selectedHierNode?.id === prison.id ? "text-amber-400 font-bold" : "text-amber-600/80"}`} />
                                              <span className={`text-slate-350 font-medium text-[10px] truncate max-w-[100px] ${selectedHierNode?.type === "PRISON" && selectedHierNode?.id === prison.id ? "text-amber-400 font-bold" : ""}`}>
                                                {prison.name.replace("Estabelecimento Penitenciário de", "EP")}
                                              </span>
                                            </div>
                                            
                                            <button 
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openCreatePavilionModal(prison.id);
                                              }}
                                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-950 rounded transition-all" 
                                              title="Criar Pavilhão"
                                            >
                                              <Plus className="h-3 w-3" />
                                            </button>
                                          </div>

                                          {/* Pavilions list */}
                                          {isPrisonOpen && (
                                            <div className="pl-3 flex flex-col gap-1 border-l border-slate-850 ml-1.5 mt-0.5">
                                              {prison.pavilions?.map(pav => {
                                                const isPavOpen = expandedPavilions[pav.id];
                                                return (
                                                  <div key={pav.id} className="flex flex-col gap-1">
                                                    <div className="flex items-center justify-between p-0.5 hover:bg-slate-850 rounded cursor-pointer group transition-colors font-mono">
                                                      <div 
                                                        className="flex items-center gap-1.5 flex-grow" 
                                                        onClick={() => {
                                                          setExpandedPavilions(prev => ({ ...prev, [pav.id]: !prev[pav.id] }));
                                                          setSelectedHierNode({ type: "PAVILION", id: pav.id, name: pav.name, parentId: prison.id });
                                                        }}
                                                      >
                                                        <Zap className={`h-3 w-3 shrink-0 ${selectedHierNode?.type === "PAVILION" && selectedHierNode?.id === pav.id ? "text-amber-500" : "text-blue-500"}`} />
                                                        <span className={`text-slate-400 text-[10px] truncate max-w-[85px] ${selectedHierNode?.type === "PAVILION" && selectedHierNode?.id === pav.id ? "text-amber-400 font-bold" : ""}`}>{pav.name}</span>
                                                      </div>

                                                      <button 
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          openCreateCellModal(pav.id, prison.id);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-950 rounded transition-all" 
                                                        title="Criar Bloco/Cela"
                                                      >
                                                        <Plus className="h-3 w-3" />
                                                      </button>
                                                    </div>

                                                    {/* Celas/Blocks list */}
                                                    {isPavOpen && (
                                                      <div className="pl-3 flex flex-col gap-1 border-l border-slate-850 ml-1.5 mt-0.5">
                                                        {pav.blocks?.map(blk => (
                                                          <div 
                                                            key={blk.id} 
                                                            onClick={() => setSelectedHierNode({ type: "CELL", id: blk.id, name: blk.name, parentId: pav.id, grandparentId: prison.id })}
                                                            className={`flex items-center gap-1 p-0.5 hover:bg-slate-850 rounded cursor-pointer font-mono ${
                                                              selectedHierNode?.type === "CELL" && selectedHierNode?.id === blk.id ? "bg-slate-850 text-amber-400 font-black border border-amber-500/20" : "text-slate-500"
                                                            }`}
                                                          >
                                                            <HeartPulse className={`h-2.5 w-2.5 ${selectedHierNode?.type === "CELL" && selectedHierNode?.id === blk.id ? "text-amber-400 animate-pulse" : "text-emerald-500"}`} />
                                                            <span className="text-[9px] truncate max-w-[75px]">{blk.name}</span>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}
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

          {/* Quick actions info */}
          <div className="mt-4 p-2.5 bg-slate-950/50 border border-slate-800 rounded-lg text-xxs text-slate-500 leading-relaxed font-mono">
            <span className="text-amber-500 font-bold">INFO:</span> Passe o rato por cima de um nó para ver o botão <span className="text-amber-400 text-[10px] inline-block font-sans font-extrabold">+</span> e poder criar elementos subordinados diretamente na árvore.
          </div>
        </aside>
        )}

        {/* COLUNA DIREITA/CENTRAL: CONTEÚDO ATIVO */}
        <section className={`${isSidebarExpanded ? "lg:col-span-9" : "lg:col-span-12"} flex flex-col gap-6 w-full transition-all duration-300`}>
        
        {/* Navigation Tabs Bar — Highly Clean, Non-Cluttered Command Bar */}
        <div className="flex flex-col gap-3 border-b border-slate-800 pb-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Sidebar toggle button */}
              <button
                type="button"
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className={`px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                  isSidebarExpanded ? "border-amber-500/40 text-amber-500" : "border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
                title="Mostrar/ocultar a árvore de estabelecimentos prisionais"
              >
                <LayoutTemplate className="h-4 w-4" />
                <span className="font-mono text-xxs tracking-wider uppercase">
                  {isSidebarExpanded ? "Ocultar Árvore" : "Instalações"}
                </span>
              </button>

              {/* Quick access tabs - keeps layout fast and clean */}
              <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>
              
              <nav className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-900">
                <button
                  type="button"
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-3 py-1.5 text-xxs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-slate-800 text-amber-500 border border-slate-700/60 shadow-md"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                  }`}
                >
                  <Building className="h-3.5 w-3.5" />
                  <span>Painel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("admissions")}
                  className={`px-3 py-1.5 text-xxs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer relative ${
                    activeTab === "admissions"
                      ? "bg-slate-800 text-amber-500 border border-slate-700/60 shadow-md"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Admissão</span>
                  {!isOnline && syncQueue.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 text-[9px] rounded-full animate-bounce">
                      {syncQueue.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("movements")}
                  className={`px-3 py-1.5 text-xxs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "movements"
                      ? "bg-slate-800 text-amber-500 border border-slate-700/60 shadow-md"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>Movimentação</span>
                </button>
              </nav>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              {/* Active view indicator */}
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 border border-slate-850 rounded-lg">
                <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Módulo Ativo: <strong className="text-amber-500 font-extrabold">{
                    activeTab === "dashboard" ? "Lotação & Risco" :
                    activeTab === "erd" ? "ERD Nacional" :
                    activeTab === "admissions" ? "Admissão & Celas" :
                    activeTab === "documents" ? "Guias & Documentos" :
                    activeTab === "penal-code" ? "Código Penal Geral" :
                    activeTab === "movements" ? "Movimentações Penais" :
                    activeTab === "special-services" ? "Serviços & Reinserção" :
                    activeTab === "auditing" ? "Auditoria Central" :
                    activeTab === "sandbox" ? "Definições e Perfis" :
                    activeTab === "settings" ? "Ajustes do Painel" :
                    activeTab === "deus-fundador" ? "👑 Direção Geral" : "Mapeamento"
                  }</strong>
                </span>
              </div>

              {/* Central Launch Trigger Button */}
              <button
                type="button"
                onClick={() => setIsModuleSelectorOpen(true)}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 active:scale-95"
                title="Abrir o Seletor Imersivo de Funções e Módulos do Sistema"
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Seletor de Funções</span>
                <span className="bg-slate-950/25 text-slate-800 font-mono text-[9px] px-1.5 rounded font-extrabold">
                  MENU
                </span>
              </button>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-slate-850/60 flex-wrap">
            {/* Global Province Selector - Territorial Filter */}
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-900 shadow-md shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-1 tracking-wider font-mono flex items-center gap-1">
                <MapPin className="h-3 w-3 text-amber-500 animate-pulse" /> Jurisdição:
              </span>
              <select
                id="global-province-selector"
                value={selectedProvinceFilter}
                onChange={(e) => {
                  setSelectedProvinceFilter(e.target.value);
                  writeAuditLog(
                    currentOperator,
                    "PRINT_REPORT",
                    "Território",
                    undefined,
                    `Alterou filtro territorial de província para: ${e.target.value}`
                  );
                }}
                disabled={currentOperator.territorialScope !== TerritorialScope.NATIONAL}
                className="bg-slate-900 border border-slate-800 text-slate-200 text-xxs font-semibold rounded-md px-2 py-1 focus:ring-1 focus:ring-amber-500 focus:outline-none cursor-pointer font-sans disabled:opacity-75 disabled:cursor-not-allowed transition-all"
              >
                {currentOperator.territorialScope === TerritorialScope.NATIONAL ? (
                  <>
                    <option value="ALL">🌍 Todas as Províncias</option>
                    {PROVINCES_HARDCODED.map(prov => (
                      <option key={prov} value={prov}>📍 {prov}</option>
                    ))}
                  </>
                ) : currentOperator.territorialScope === TerritorialScope.PROVINCIAL ? (
                  <option value={currentOperator.province || "Luanda"}>
                    🛡️ Província {currentOperator.province || "Luanda"} (Apenas Provincial)
                  </option>
                ) : (
                  <option value={activeOpProvince || "Luanda"}>
                    🔒 Província {activeOpProvince || "Luanda"} (Unidade Local)
                  </option>
                )}
              </select>
            </div>

            {/* Sync status / alert trigger button when queue exists */}
            {syncQueue.length > 0 && (
              <button
                type="button"
                onClick={triggerSync}
                disabled={isSyncing}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-md text-xxs flex items-center gap-1.5 shadow-lg hover:shadow-amber-500/10 cursor-pointer transition-all animate-pulse disabled:opacity-55 shrink-0"
              >
                <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Sincronizando..." : `Sincronizar ${syncQueue.length} Transações locais`}</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Views */}
        <AnimatePresence mode="wait">

          {/* Hierarchical Node Custom Management view */}
          {selectedHierNode !== null && (
            <motion.div
              key="hierarchical-node-manager"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-xl w-full"
            >
              {/* Control Panel Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-slate-900 border border-slate-800 rounded-xl gap-4">
                <div className="flex items-center gap-3">
                  <span className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-md font-mono text-[10px] font-extrabold shadow-md uppercase">
                    Soberania Penitenciária Integrada
                  </span>
                  <div>
                    <h2 className="text-sm font-black text-slate-200 uppercase tracking-widest font-mono">
                      Nó Hierárquico: <span className="text-amber-500 font-sans normal-case font-bold">{selectedHierNode.name}</span>
                    </h2>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                      Nível Operacional Corrente: <strong className="text-slate-300">{selectedHierNode.type}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedHierNode(null);
                    setAddingStructure(null);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xxs font-extrabold uppercase font-mono px-4 py-2.5 rounded-lg cursor-pointer transition shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20"
                >
                  {currentOperator.territorialScope === TerritorialScope.NATIONAL ? "Voltar à Visão Macro Nacional" :
                   currentOperator.territorialScope === TerritorialScope.PROVINCIAL ? `Voltar à Visão de ${currentOperator.province}` :
                   "Voltar ao Dashboard Geral"}
                </button>
              </div>

              {/* If there's an action to add standard structures */}
              {addingStructure && (
                <div className="p-5 bg-slate-900 border border-amber-500/20 rounded-xl flex flex-col gap-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-amber-500 font-mono">
                      + CADASTRAR NOVO ELEMENTO ({addingStructure.type})
                    </span>
                    <button 
                      onClick={() => setAddingStructure(null)}
                      className="text-slate-500 hover:text-slate-300 text-xxs underline cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>

                  {addingStructure.type === "PRISON" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 uppercase font-mono font-bold text-xxs">Nome do Estabelecimento:</label>
                        <input 
                          type="text" 
                          value={newPrisonForm.name} 
                          onChange={e => setNewPrisonForm({ ...newPrisonForm, name: e.target.value })}
                          placeholder="Ex: EP Sanza Pombo"
                          className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg font-semibold tracking-wide text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 uppercase font-mono font-bold text-xxs">Capacidade Oficial:</label>
                        <input 
                          type="number" 
                          value={newPrisonForm.officialCapacity} 
                          onChange={e => setNewPrisonForm({ ...newPrisonForm, officialCapacity: Number(e.target.value) })}
                          className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg font-semibold tracking-wide text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 uppercase font-mono font-bold text-xxs">Limite Operativo:</label>
                        <input 
                          type="number" 
                          value={newPrisonForm.operationalCapacity} 
                          onChange={e => setNewPrisonForm({ ...newPrisonForm, operationalCapacity: Number(e.target.value) })}
                          className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg font-semibold tracking-wide text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="md:col-span-3 flex justify-end">
                        <button 
                          onClick={handleCreatePrison}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xxs font-bold uppercase font-mono px-4 py-2.5 rounded-lg cursor-pointer transition shadow-md"
                        >
                          Salvar no PostgreSQL Cloud
                        </button>
                      </div>
                    </div>
                  )}

                  {addingStructure.type === "PAVILION" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 uppercase font-mono font-bold text-xxs">Nome ou Sigla do Pavilhão:</label>
                        <input 
                          type="text" 
                          value={newPavilionForm.name} 
                          onChange={e => setNewPavilionForm({ ...newPavilionForm, name: e.target.value })}
                          placeholder="Ex: Pavilhão B - Ala Segura"
                          className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg font-semibold tracking-wide text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 uppercase font-mono font-bold text-xxs">Regime de Confinamento:</label>
                        <select 
                          value={newPavilionForm.tipoRegime} 
                          onChange={e => setNewPavilionForm({ ...newPavilionForm, tipoRegime: e.target.value })}
                          className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg font-semibold tracking-wide text-slate-200 focus:outline-none focus:border-amber-500"
                        >
                          <option value="FECHADO">FECHADO (Regime Estrito)</option>
                          <option value="SEMI_ABERTO">SEMI-ABERTO (Colónias Agrícolas)</option>
                          <option value="ABERTO">ABERTO (Comunitário de Reinserção)</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <button 
                          onClick={handleCreatePavilion}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xxs font-bold uppercase font-mono px-4 py-2.5 rounded-lg cursor-pointer transition shadow-md"
                        >
                          Gravar Pavilhão
                        </button>
                      </div>
                    </div>
                  )}

                  {addingStructure.type === "CELL" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 uppercase font-mono font-bold text-xxs">Código / Número da Cela/Bloco:</label>
                        <input 
                          type="text" 
                          value={newCellForm.codigo} 
                          onChange={e => setNewCellForm({ ...newCellForm, codigo: e.target.value })}
                          placeholder="Ex: Bloco B - Cela 3"
                          className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg font-semibold tracking-wide text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 uppercase font-mono font-bold text-xxs">Capacidade Canônica:</label>
                        <input 
                          type="number" 
                          value={newCellForm.capacity} 
                          onChange={e => setNewCellForm({ ...newCellForm, capacity: Number(e.target.value) })}
                          placeholder="Ex: 10"
                          className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg font-semibold tracking-wide text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <button 
                          onClick={handleCreateCell}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xxs font-bold uppercase font-mono px-4 py-2.5 rounded-lg cursor-pointer transition shadow-md"
                        >
                          Mapear Cela
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SELECTED NODE DASHBOARD DISPLAY */}
              {selectedHierNode.type === "PROVINCE" && (
                <div className="flex flex-col gap-6 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-3 shadow-md">
                      <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Estrutura de Municípios</span>
                      <span className="text-2xl font-sans font-black text-slate-100">
                        {municipalities.filter(m => m.province === selectedHierNode.id).length} Municípios
                      </span>
                      <p className="text-xxs text-amber-500 font-mono leading-relaxed mt-1">
                        Divisão administrativa oficial com suporte para relações georreferenciadas.
                      </p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-3 shadow-md">
                      <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Unidades Operacionais</span>
                      <span className="text-2xl font-sans font-black text-slate-100">
                        {(() => {
                          const provMuns = municipalities.filter(m => m.province === selectedHierNode.id).map(m => m.id);
                          return prisons.filter(p => provMuns.includes(p.municipalityId)).length;
                        })()} EPs Ativos
                      </span>
                      <p className="text-xxs text-slate-400 font-mono leading-relaxed mt-1">
                        Sincronização de Estabelecimentos Penitenciários em tempo real.
                      </p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-3 shadow-md">
                      <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">Reclusos Consolidados</span>
                      <span className="text-2xl font-sans font-black text-yellow-500">
                        {(() => {
                          const provMuns = municipalities.filter(m => m.province === selectedHierNode.id).map(m => m.id);
                          const provPris = prisons.filter(p => provMuns.includes(p.municipalityId));
                          const current = provPris.reduce((acc, p) => acc + p.currentOccupancy, 0);
                          const capacity = provPris.reduce((acc, p) => acc + (p.operationalCapacity || p.officialCapacity), 0);
                          return `${current} / ${capacity}`;
                        })()}
                      </span>
                      <p className="text-xxs text-slate-500 font-mono mt-1">
                        Taxa de ocupação regional baseada nos limites de proteção e segurança física.
                      </p>
                    </div>
                  </div>

                  {/* Municipalities List inside Province */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-amber-500" /> Municípios na Província do {selectedHierNode.name}
                      </h3>
                      {currentOperator.role === "DIRECTOR_GERAL" && (
                        <button 
                          onClick={() => openCreateMunicipalityModal(selectedHierNode.id!)}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase font-mono px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" /> Criar Município
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {municipalities.filter(m => m.province === selectedHierNode.id).map(mun => {
                        const munPris = prisons.filter(p => p.municipalityId === mun.id);
                        return (
                          <div key={mun.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 hover:border-slate-700 transition flex flex-col justify-between gap-3">
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-200 font-mono">{mun.name}</span>
                                <span className="bg-slate-900 border border-slate-800 text-[9px] text-slate-400 px-2 py-0.5 rounded font-mono">
                                  {munPris.length} EPs
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-mono mt-1">
                                Código: {mun.id}
                              </p>
                            </div>
                            <div className="flex gap-2 border-t border-slate-900 pt-2 mt-1">
                              <button 
                                onClick={() => {
                                  setExpandedMuns(prev => ({ ...prev, [mun.id]: true }));
                                  setExpandedProv(prev => ({ ...prev, [selectedHierNode.id!]: true }));
                                  setSelectedHierNode({ type: "MUNICIPALITY", id: mun.id, name: mun.name, parentId: selectedHierNode.id });
                                }}
                                className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] py-1 rounded transition text-center"
                              >
                                Seleccionar
                              </button>
                              {currentOperator.role === "DIRECTOR_GERAL" && (
                                <>
                                  <button 
                                    onClick={() => openEditMunicipalityModal(mun.id, mun.name, selectedHierNode.id!)}
                                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-500 text-[10px] px-2.5 py-1 rounded transition"
                                    title="Editar Nome do Município"
                                  >
                                    ✎
                                  </button>
                                  <button 
                                    onClick={() => openDeleteMunicipalityModal(mun.id, mun.name)}
                                    className="bg-slate-900 hover:bg-red-950/40 border border-slate-850 text-red-500 text-[10px] px-2.5 py-1 rounded transition"
                                    title="Excluir Município"
                                  >
                                    ✕
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {municipalities.filter(m => m.province === selectedHierNode.id).length === 0 && (
                        <div className="col-span-full text-center py-6 text-slate-500 italic text-xs font-mono">
                          Nenhum município cadastrado nesta província. Clique no botão acima para cadastrar o primeiro município.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedHierNode.type === "MUNICIPALITY" && (
                <div className="flex flex-col gap-6 w-full">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-6 w-6 text-amber-500 animate-pulse" />
                      <div>
                        <h4 className="text-sm font-black text-slate-100 font-mono uppercase">Município de {selectedHierNode.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Província Mãe: {selectedHierNode.parentId}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {currentOperator.role === "DIRECTOR_GERAL" && (
                        <>
                          <button 
                            onClick={() => openEditMunicipalityModal(selectedHierNode.id!, selectedHierNode.name!, selectedHierNode.parentId!)}
                            className="bg-slate-850 hover:bg-slate-800 text-amber-400 text-xxs font-mono px-3.5 py-2.5 rounded-lg border border-slate-800 transition"
                          >
                            ✎ Editar Município
                          </button>
                          <button 
                            onClick={() => openDeleteMunicipalityModal(selectedHierNode.id!, selectedHierNode.name!)}
                            className="bg-slate-850 hover:bg-red-950/40 text-red-400 text-xxs font-mono px-3.5 py-2.5 rounded-lg border border-red-950 transition"
                          >
                            ✕ Excluir Município
                          </button>
                          <button 
                            onClick={() => openCreatePrisonModal(selectedHierNode.id!)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xxs font-extrabold uppercase font-mono px-4 py-2.5 rounded-lg shadow-lg transition flex items-center gap-2"
                          >
                            <Plus className="h-3.5 w-3.5" /> Criar Cadeia (EP)
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2 font-mono flex items-center justify-between">
                      <span>Estabelecimentos Prisionais neste Município</span>
                      <span className="text-[10px] text-slate-400 font-mono">{prisons.filter(p => p.municipalityId === selectedHierNode.id).length} EPs Ativos</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {prisons.filter(p => p.municipalityId === selectedHierNode.id).map(prison => {
                        return (
                          <div key={prison.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 hover:border-slate-700 transition flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2 font-mono">
                                <Building className="h-4 w-4 text-amber-500" />
                                <span className="text-xs font-bold text-slate-200 truncate max-w-[200px]">{prison.name}</span>
                              </div>
                              <span className="bg-slate-900 border border-slate-800 text-[8px] text-slate-400 px-2.5 py-0.5 rounded uppercase font-bold">
                                {prison.pavilions?.length || 0} Pavilhões
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 bg-slate-900/40 p-2 rounded-lg border border-slate-900 font-mono text-[9px] text-slate-400">
                              <div>Capacidade Oficial: <strong className="text-slate-200">{prison.officialCapacity}</strong></div>
                              <div>Capacidade Operativa: <strong className="text-slate-200">{prison.operationalCapacity || prison.officialCapacity}</strong></div>
                              <div>Ocupação Atual: <strong className="text-slate-200">{prison.currentOccupancy} reclusos</strong></div>
                              <div>Densidade: <strong className="text-amber-500">{Math.round((prison.currentOccupancy / (prison.operationalCapacity || prison.officialCapacity || 1)) * 100)}%</strong></div>
                            </div>
                            <div className="flex gap-2 mt-1">
                              <button 
                                onClick={() => {
                                  setExpandedPrisons(prev => ({ ...prev, [prison.id]: true }));
                                  setExpandedMuns(prev => ({ ...prev, [selectedHierNode.id!]: true }));
                                  setSelectedHierNode({ type: "PRISON", id: prison.id, name: prison.name, parentId: selectedHierNode.id });
                                }}
                                className="flex-grow bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] py-1.5 rounded transition text-center font-mono"
                              >
                                Administrar Organização
                              </button>
                              {currentOperator.role === "DIRECTOR_GERAL" && (
                                <>
                                  <button 
                                    onClick={() => openEditPrisonModal(prison.id, prison.name, prison.officialCapacity, prison.operationalCapacity || prison.officialCapacity, selectedHierNode.id!)}
                                    className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-500 text-[10px] px-2.5 py-1.5 rounded transition"
                                    title="Editar Cadeia"
                                  >
                                    ✎
                                  </button>
                                  <button 
                                    onClick={() => openDeletePrisonModal(prison.id, prison.name)}
                                    className="bg-slate-900 hover:bg-red-950/40 border border-slate-850 text-red-500 text-[10px] px-2.5 py-1.5 rounded transition"
                                    title="Excluir Cadeia"
                                  >
                                    ✕
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {prisons.filter(p => p.municipalityId === selectedHierNode.id).length === 0 && (
                        <div className="col-span-full text-center py-6 text-slate-500 italic text-xs font-mono">
                          Nenhum estabelecimento prisional cadastrado neste município. Clique no botão de criação acima para adicionar o primeiro.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedHierNode.type === "PRISON" && (
                <div className="flex flex-col gap-6 w-full">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <Building className="h-6 w-6 text-amber-500" />
                      <div>
                        <h4 className="text-sm font-black text-slate-100 font-mono uppercase">{selectedHierNode.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Localização: {prisons.find(p => p.id === selectedHierNode.id)?.location || "Mapeamento pendente"}, Angola</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const p = prisons.find(p => p.id === selectedHierNode.id);
                          if (p) openEditPrisonModal(p.id, p.name, p.officialCapacity, p.operationalCapacity || p.officialCapacity, p.municipalityId);
                        }}
                        className="bg-slate-850 hover:bg-slate-800 text-amber-400 text-xxs font-mono px-3.5 py-2.5 rounded-lg border border-slate-800 transition"
                      >
                        ✎ Configurar Cadeia
                      </button>
                      <button 
                        onClick={() => openDeletePrisonModal(selectedHierNode.id!, selectedHierNode.name!)}
                        className="bg-slate-850 hover:bg-red-950/40 text-red-400 text-xxs font-mono px-3.5 py-2.5 rounded-lg border border-red-950 transition"
                      >
                        ✕ Excluir Cadeia
                      </button>
                      <button 
                        onClick={() => openCreatePavilionModal(selectedHierNode.id!)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xxs font-extrabold uppercase font-mono px-4 py-2.5 rounded-lg shadow-lg transition flex items-center gap-2"
                      >
                        <Plus className="h-3.5 w-3.5" /> Criar Pavilhão
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-center">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1 justify-center">
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Capacidade Total Oficial</span>
                      <span className="text-xl font-bold text-slate-200">
                        {prisons.find(p => p.id === selectedHierNode.id)?.officialCapacity || 0} Lugares
                      </span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1 justify-center">
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Capacidade Operacional Máxima</span>
                      <span className="text-xl font-bold text-slate-200">
                        {(() => {
                          const p = prisons.find(p=> p.id === selectedHierNode.id);
                          return p ? p.operationalCapacity || p.officialCapacity : 0;
                        })()} Lugares
                      </span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1 justify-center">
                      <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider font-semibold text-yellow-500">População Carcerária Ativa</span>
                      <span className="text-xl font-bold text-yellow-500">
                        {prisons.find(p => p.id === selectedHierNode.id)?.currentOccupancy || 0} Reclusos
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2 font-mono flex justify-between items-center">
                      <span>Pavilhões Cadastrados nesta Cadeia</span>
                      <span className="text-[10px] text-slate-400 font-mono">{prisons.find(p => p.id === selectedHierNode.id)?.pavilions?.length || 0} Pavilhões</span>
                    </h3>
                    <div className="flex flex-col gap-2">
                      {prisons.find(p => p.id === selectedHierNode.id)?.pavilions?.map((pav: any) => (
                        <div key={pav.id} className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-850 flex-wrap gap-4">
                          <div className="flex items-center gap-2 font-mono text-xs">
                            <Zap className="h-4 w-4 text-blue-400" />
                            <span className="text-slate-300 font-bold">{pav.name}</span>
                            <span className="bg-slate-900 border border-slate-850 text-slate-400 px-2 py-0.5 rounded text-[8px] uppercase">
                              Regime: {pav.specialty_tag || "FECHADO"}
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono">
                              ({pav.blocks?.length || 0} Celas / Blocos)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setExpandedPrisons(prev => ({ ...prev, [selectedHierNode.id!]: true }));
                                setExpandedPavilions(prev => ({ ...prev, [pav.id]: true }));
                                setSelectedHierNode({ type: "PAVILION", id: pav.id, name: pav.name, parentId: selectedHierNode.id });
                              }}
                              className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xxs border border-slate-800 px-3 py-1.5 rounded-lg transition"
                            >
                              Administrar Celas
                            </button>
                            <button 
                              onClick={() => openEditPavilionModal(pav.id, selectedHierNode.id!, pav.name, pav.specialty_tag || "FECHADO")}
                              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-500 text-xxs px-2.5 py-1.5 rounded-lg transition"
                              title="Editar Pavilhão"
                            >
                              ✎
                            </button>
                            <button 
                              onClick={() => openDeletePavilionModal(pav.id, selectedHierNode.id!, pav.name)}
                              className="bg-slate-900 hover:bg-red-950/40 border border-slate-850 text-red-500 text-xxs px-2.5 py-1.5 rounded-lg transition"
                              title="Excluir Pavilhão"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )) || <span className="text-[10px] text-slate-500">Nenhum pavilhão mapeado ainda neste estabelecimento.</span>}
                    </div>
                  </div>
                </div>
              )}

              {selectedHierNode.type === "PAVILION" && (
                <div className="flex flex-col gap-6 w-full">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <Zap className="h-6 w-6 text-blue-500" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-300 font-mono uppercase">Pavilhão {selectedHierNode.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">Estabelecimento Pai: {selectedHierNode.parentId}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const p = prisons.find(p => p.id === selectedHierNode.parentId);
                          const pav = p?.pavilions?.find(v => v.id === selectedHierNode.id);
                          if (pav) openEditPavilionModal(pav.id, selectedHierNode.parentId!, pav.name, (pav as any).specialty_tag || "FECHADO");
                        }}
                        className="bg-slate-850 hover:bg-slate-800 text-amber-400 text-xxs font-mono px-3.5 py-2.5 rounded-lg border border-slate-800 transition"
                      >
                        ✎ Configurar Pavilhão
                      </button>
                      <button 
                        onClick={() => openDeletePavilionModal(selectedHierNode.id!, selectedHierNode.parentId!, selectedHierNode.name!)}
                        className="bg-slate-850 hover:bg-red-950/40 text-red-400 text-xxs font-mono px-3.5 py-2.5 rounded-lg border border-red-950 transition"
                      >
                        ✕ Excluir Pavilhão
                      </button>
                      <button 
                        onClick={() => openCreateCellModal(selectedHierNode.id!, selectedHierNode.parentId!)}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xxs font-extrabold uppercase font-mono px-3.5 py-2.5 rounded-lg shadow transition flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" /> Nova Cela / Bloco
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2 font-mono flex justify-between items-center">
                      <span>Celas de Confinamento neste Pavilhão</span>
                      <span className="text-[10px] text-slate-400 font-mono">Total: {(() => {
                        const pris = prisons.find(p => p.id === selectedHierNode.parentId);
                        const pav = pris?.pavilions?.find(v => v.id === selectedHierNode.id);
                        return pav?.blocks?.length || 0;
                      })()} Celas</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(() => {
                        const pris = prisons.find(p => p.id === selectedHierNode.parentId);
                        const pav = pris?.pavilions?.find(v => v.id === selectedHierNode.id);
                        return pav?.blocks?.map((cell: any) => (
                          <div 
                            key={cell.id} 
                            className="bg-slate-950 p-4 rounded-xl border border-slate-850 hover:border-slate-700 transition flex flex-col justify-between gap-3"
                          >
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-200 font-mono">{cell.name}</span>
                                <HeartPulse className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                              </div>
                              <div className="flex items-end justify-between mt-2 pt-2 border-t border-slate-900 font-mono text-[10px]">
                                <span className="text-slate-550 font-bold">OCUPAÇÃO:</span>
                                <span className="font-bold text-slate-300">{cell.current || 0} / {cell.capacity} Reclusos</span>
                              </div>
                            </div>
                            <div className="flex gap-1.5 border-t border-slate-900 pt-2 text-[10px] font-mono">
                              <button 
                                onClick={() => {
                                  setSelectedHierNode({ type: "CELL", id: cell.id, name: cell.name, parentId: selectedHierNode.id, grandparentId: selectedHierNode.parentId });
                                }}
                                className="flex-grow bg-slate-900 hover:bg-slate-800 text-slate-300 py-1 rounded transition text-center"
                              >
                                Selecionar
                              </button>
                              <button 
                                onClick={() => openEditCellModal(cell.id, selectedHierNode.id!, selectedHierNode.parentId!, cell.name, cell.capacity)}
                                className="bg-slate-900 hover:bg-slate-800 text-amber-500 px-2 py-1 rounded transition"
                                title="Editar Configurações da Cela"
                              >
                                ✎
                              </button>
                              <button 
                                onClick={() => openDeleteCellModal(cell.id, selectedHierNode.id!, selectedHierNode.parentId!, cell.name)}
                                className="bg-slate-900 hover:bg-red-950/40 text-red-500 px-2 py-1 rounded transition"
                                title="Excluir Cela"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        )) || <span className="text-[10px] col-span-3 text-slate-500">Nenhuma cela ou bloco operacional mapeado.</span>;
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {selectedHierNode.type === "CELL" && (
                <div className="flex flex-col gap-6 w-full">
                  {/* Cell Header with Actions */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <HeartPulse className="h-6 w-6 text-emerald-500 animate-pulse" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-350 font-mono uppercase">Cela / Bloco: {selectedHierNode.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">Pavilhão: {selectedHierNode.parentId} | Cadeira ID: {selectedHierNode.grandparentId}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const p = prisons.find(p => p.id === selectedHierNode.grandparentId);
                          const pav = p?.pavilions?.find(v => v.id === selectedHierNode.parentId);
                          const cell = pav?.blocks?.find(c => c.id === selectedHierNode.id);
                          if (cell) openEditCellModal(cell.id, selectedHierNode.parentId!, selectedHierNode.grandparentId!, cell.name, cell.capacity);
                        }}
                        className="bg-slate-850 hover:bg-slate-800 text-amber-400 text-xxs font-mono px-3.5 py-2.5 rounded-lg border border-slate-800 transition"
                      >
                        ✎ Configurar Cela
                      </button>
                      <button 
                        onClick={() => openDeleteCellModal(selectedHierNode.id!, selectedHierNode.parentId!, selectedHierNode.grandparentId!, selectedHierNode.name!)}
                        className="bg-slate-850 hover:bg-red-950/40 text-red-400 text-xxs font-mono px-3.5 py-2.5 rounded-lg border border-red-950 transition"
                      >
                        ✕ Excluir Cela
                      </button>
                    </div>
                  </div>

                  {/* Cell Stats Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-1.5 justify-center">
                      <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">Regime Operacional</span>
                      <span className="text-xs font-sans font-bold text-amber-500 uppercase">Regime Disciplinar Canônico</span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-1.5 justify-center">
                      <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider font-semibold">População Carcerária</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {inmates.filter(i => i.assignedBlockId === selectedHierNode.id).length} Reclusos Registados
                      </span>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-center">
                      <button 
                        onClick={() => setAddingStructure({ type: "INMATE", parentId: selectedHierNode.id })}
                        className="bg-emerald-600 hover:bg-emerald-550 text-white text-xxs font-extrabold uppercase font-mono py-2.5 rounded-lg cursor-pointer transition shadow hover:scale-[1.01]"
                      >
                        + Admitir Recluso nesta Cela
                      </button>
                    </div>
                  </div>

                  {/* Adding Inmate specifically here */}
                  {addingStructure?.type === "INMATE" && (
                    <div className="p-5 bg-slate-900 border border-emerald-500/20 rounded-xl flex flex-col gap-4 animate-fadeIn">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <span className="text-xs font-bold text-emerald-400 font-mono uppercase">
                          + NOVA ADMISSÃO CANÓNICA DE RECLUSO (DATABASE EM NUVEM)
                        </span>
                        <button onClick={() => setAddingStructure(null)} className="text-slate-500 hover:text-slate-300 text-xxs underline cursor-pointer">Cancelar</button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-400 text-xxs uppercase tracking-wide font-mono font-bold">Primeiro Nome:</label>
                          <input 
                            type="text" 
                            value={newInmateForm.firstName} 
                            onChange={e => setNewInmateForm({ ...newInmateForm, firstName: e.target.value })}
                            placeholder="Ex: Carlos"
                            className="bg-slate-950 border border-slate-850 p-2.5 text-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-400 text-xxs uppercase tracking-wide font-mono font-bold">Sobrenome:</label>
                          <input 
                            type="text" 
                            value={newInmateForm.lastName} 
                            onChange={e => setNewInmateForm({ ...newInmateForm, lastName: e.target.value })}
                            placeholder="Ex: Mateus"
                            className="bg-slate-950 border border-slate-850 p-2.5 text-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-400 text-xxs uppercase tracking-wide font-mono font-bold">Nº do BI (Identidade):</label>
                          <input 
                            type="text" 
                            value={newInmateForm.idCard} 
                            onChange={e => setNewInmateForm({ ...newInmateForm, idCard: e.target.value })}
                            placeholder="Ex: 0029312LA041"
                            className="bg-slate-950 border border-slate-850 p-2.5 text-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-400 text-xxs uppercase tracking-wide font-mono font-bold">Nome do Pai:</label>
                          <input 
                            type="text" 
                            value={newInmateForm.fatherName} 
                            onChange={e => setNewInmateForm({ ...newInmateForm, fatherName: e.target.value })}
                            placeholder="Ex: João Mateus"
                            className="bg-slate-950 border border-slate-850 p-2.5 text-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-400 text-xxs uppercase tracking-wide font-mono font-bold">Nome da Mãe:</label>
                          <input 
                            type="text" 
                            value={newInmateForm.motherName} 
                            onChange={e => setNewInmateForm({ ...newInmateForm, motherName: e.target.value })}
                            placeholder="Ex: Teresa Mateus"
                            className="bg-slate-950 border border-slate-850 p-2.5 text-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-400 text-xxs uppercase tracking-wide font-mono font-bold">Data de Nascimento:</label>
                          <input 
                            type="date" 
                            value={newInmateForm.birthDate} 
                            onChange={e => setNewInmateForm({ ...newInmateForm, birthDate: e.target.value })}
                            className="bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-lg focus:border-emerald-500 outline-none font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-400 text-xxs uppercase tracking-wide font-mono font-bold">Risco Prisional:</label>
                          <select 
                            value={newInmateForm.riskLevel} 
                            onChange={e => setNewInmateForm({ ...newInmateForm, riskLevel: e.target.value })}
                            className="bg-slate-950 border border-slate-850 p-2 text-slate-200 rounded-lg outline-none cursor-pointer"
                          >
                            <option value="Baixo">BAIXO RISCO</option>
                            <option value="Médio">MÉDIO RISCO</option>
                            <option value="Alto">ALTO RISCO (Sentenciados)</option>
                            <option value="Máximo">MÁXIMO / SEGURANÇA RESTRITA</option>
                          </select>
                        </div>
                        <div className="md:col-span-3 flex justify-end">
                          <button 
                            onClick={handleCreateInmateAtCell}
                            className="bg-emerald-600 hover:bg-emerald-550 text-white font-extrabold text-xxs uppercase font-mono px-5 py-3 rounded-lg shadow hover:scale-[1.01] active:scale-95 transition cursor-pointer"
                          >
                            Confirmar Admissão Canónica no PostgreSQL
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inmates List inside this Cell */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2 flex items-center justify-between font-mono">
                      <span>Reclusos Alocados Correntemente nesta Cela</span>
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded-md border border-slate-850">Total: {inmates.filter(i => i.assignedBlockId === selectedHierNode.id).length}</span>
                    </h3>

                    <div className="flex flex-col gap-3">
                      {inmates.filter(i => i.assignedBlockId === selectedHierNode.id).map(inmate => (
                        <div 
                          key={inmate.id} 
                          className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col md:flex-row justify-between gap-4 hover:border-slate-800 transition"
                        >
                          <div className="flex gap-3">
                            {/* Photo placeholder with initials */}
                            <div className="h-10 w-10 bg-slate-900 border border-slate-850 text-slate-400 text-xs font-mono font-bold flex items-center justify-center rounded-lg shrink-0">
                              {inmate.firstName[0]}{inmate.lastName[0]}
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-200">{inmate.firstName} {inmate.lastName}</span>
                                <span className={`text-[8px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${
                                  inmate.riskLevel === "Baixo" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                  inmate.riskLevel === "Médio" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                  inmate.riskLevel === "Alto" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                  "bg-red-500/10 text-red-400 border border-red-500/20"
                                }`}>
                                  {inmate.riskLevel}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono">BI: {inmate.idCard} • Ficha NREP: {inmate.documentCode}</span>
                              <span className="text-[10px] text-slate-400 font-sans">Nascimento: {inmate.birthDate} ({new Date().getFullYear() - new Date(inmate.birthDate).getFullYear()} anos)</span>
                            </div>
                          </div>

                          {/* Direct Operations */}
                          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                            <button 
                              onClick={() => {
                                const destCellId = prompt("Para qual Código de Cela gostaria de transferir o recluso? (Digite o ID da cela, ex: CELL-NEW-X)");
                                if (destCellId) {
                                  setInmates(prev => prev.map(i => {
                                    if (i.id === inmate.id) {
                                      return { ...i, assignedBlockId: destCellId };
                                    }
                                    return i;
                                  }));
                                  alert(`Solicitação de transferência gerada. Recluso ${inmate.firstName} movimentado.`);
                                }
                              }}
                              className="bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-400 text-xxs font-mono font-bold px-2.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                              title="Transferir Cela"
                            >
                              TRANSFERIR
                            </button>
                            <button 
                              onClick={() => {
                                if (confirm(`Deseja realmente lavrar a remoção/soltura de ${inmate.firstName} ${inmate.lastName}?`)) {
                                  handleDeleteInmateDynamically(inmate.id);
                                }
                              }}
                              className="bg-red-950/40 hover:bg-red-950 hover:text-red-300 border border-red-900/40 hover:border-red-500/30 text-slate-400 text-xxs font-mono font-bold px-2.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                              title="Remover recluso desta cela"
                            >
                              REMOVER
                            </button>
                          </div>
                        </div>
                      )) || <span className="text-[10px] text-slate-500">Nenhum recluso alocado para esta cela no momento.</span>}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Standard Tabs Views */}
          {selectedHierNode === null && (
            <>
              {/* TAB 1: DASHBOARD, LOTAÇÃO E RISCO */}
          {activeTab === "dashboard" && currentOperator.role === "CHEFE_SAUDE" && (
            <motion.div
              key="dashboard-health-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <HealthDashboard visibleInmates={visibleInmates} prisons={visiblePrisons} />
            </motion.div>
          )}

          {activeTab === "dashboard" && currentOperator.role !== "CHEFE_SAUDE" && (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              
              {/* Lotação Real-Time do Estabelecimento */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-mono">
                        Controle de Ocupação & Capacidade Prisional
                      </h2>
                      <p className="text-xs text-slate-400">
                        Ocupação dinâmica a nível de blocos e cálculo automático de sobrelotação (Fórmula: Lotação Ativa / Cap. Operacional).
                      </p>
                    </div>
                    <span className="bg-slate-950 text-amber-500/90 px-3 py-1 text-xs border border-slate-800 font-mono rounded font-semibold">
                      Filtro: {currentOperator.role === "DIRECTOR_GERAL" ? "Nacional Completo" :
                               currentOperator.role === "DIRECTOR_PROVINCIAL" ? "Regional Provincial Luanda" :
                               `Unidade Local (${visiblePrisons[0]?.name.replace("Estabelecimento Penitenciário de ", "") || "EP Viana"})`}
                    </span>
                  </div>

                  {/* Prisons Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visiblePrisons.map((cris) => {
                      const occupancyRate = Math.round((cris.currentOccupancy / cris.operationalCapacity) * 100);
                      const isOvercrowded = occupancyRate > 100;

                      return (
                        <div 
                          key={cris.id} 
                          className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4 flex flex-col justify-between hover:border-slate-700 transition"
                        >
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-sm text-slate-200 leading-tight">
                                  {cris.name}
                                </h3>
                                <p className="text-xxs text-slate-400 flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3 text-slate-500" /> {cris.location}
                                </p>
                              </div>
                              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                                isOvercrowded ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              }`}>
                                {isOvercrowded ? "Sobrelotada" : "Estável"}
                              </span>
                            </div>

                            {/* Bar Graphic */}
                            <div className="mt-4 flex flex-col gap-1.5">
                              <div className="flex justify-between text-xs font-mono">
                                <span className="text-slate-400 text-xxs">Carga: {cris.currentOccupancy} reclusos</span>
                                <span className={`${isOvercrowded ? "text-red-400" : "text-slate-300"} font-bold text-xxs`}>
                                  {occupancyRate}% da operatividade
                                </span>
                              </div>
                              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isOvercrowded ? "bg-red-500" : occupancyRate > 85 ? "bg-amber-500" : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-0.5">
                                <span>Cap. Oficial: {cris.officialCapacity}</span>
                                <span>Limite Operativo: {cris.operationalCapacity}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Pavilhões activos:</span>
                            <div className="flex gap-1.5">
                              {cris.pavilions.map(p => (
                                <span key={p.id} className="text-xxs font-mono bg-slate-900 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                                  {p.name.split(" - ")[0].replace("Pavilhão ", "Pav ")}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Subdivisão Física e Célula de Lançamento */}
                {(() => {
                  const activePrisonForDetails = prisons.find(p => p.id === selectedEstablishmentId) || visiblePrisons[0] || prisons[0];
                  
                  // Helper to get count of confirmed bookings for a date + slot in this prison
                  const getSlotOccupancy = (dateStr: string, slotStr: string) => {
                    return prisonVisits.filter(v => 
                      v.prisonId === activePrisonForDetails.id && 
                      v.visitDate === dateStr && 
                      v.timeSlot === slotStr &&
                      (v.status === "Confirmado" || v.status === "Realizado")
                    ).length;
                  };

                  const handleAddVisitSubmit = (e: React.FormEvent) => {
                    e.preventDefault();
                    if (!newVisitVisitorName || !newVisitVisitorDoc || !newVisitInmateId || !newVisitDate) {
                      alert("Por favor preencha todos os campos obrigatórios.");
                      return;
                    }

                    // Check Parlatório Capacity
                    const currentOccupancy = getSlotOccupancy(newVisitDate, newVisitTimeSlot);
                    if (currentOccupancy >= parlatorioCapacity) {
                      alert(`ERRO DE CAPACIDADE: O Parlatório já atingiu a lotação limite de ${parlatorioCapacity} familiares para o horário de ${newVisitTimeSlot} em ${newVisitDate}. Por favor escolha outro horário ou dia.`);
                      return;
                    }

                    const refInmate = inmates.find(i => i.id === newVisitInmateId);
                    const newVisit: PrisonVisit = {
                      id: `VIS-2026-${Math.floor(1000 + Math.random()*9000)}`,
                      prisonId: activePrisonForDetails.id,
                      visitorName: newVisitVisitorName,
                      visitorDocument: newVisitVisitorDoc,
                      inmateId: newVisitInmateId,
                      inmateName: refInmate ? `${refInmate.firstName} ${refInmate.lastName}` : "Recluso",
                      visitDate: newVisitDate,
                      timeSlot: newVisitTimeSlot,
                      status: "Confirmado"
                    };

                    setPrisonVisits(prev => [newVisit, ...prev]);
                    
                    // Reset form fields
                    setNewVisitVisitorName("");
                    setNewVisitVisitorDoc("");
                    setNewVisitInmateId("");
                    setNewVisitDate("");
                    
                    alert("Visita agendada com sucesso e vinculada à lotação do parlatório!");
                  };

                  const handleStatusChange = (vid: string, nextStatus: "Confirmado" | "Cancelado" | "Realizado") => {
                    setPrisonVisits(prev => prev.map(v => v.id === vid ? { ...v, status: nextStatus } : v));
                  };

                  const filteredInmatesForPrison = inmates.filter(i => i.assignedPrisonId === activePrisonForDetails.id);

                  return (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                        <div>
                          <div className="flex items-center gap-2 text-xxs font-mono uppercase tracking-wider text-amber-400 font-bold bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20 w-fit">
                            Unidade de Detalhe Prisional
                          </div>
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans mt-1">
                            {activePrisonForDetails.name.replace("Estabelecimento Penitenciário de ", "EP ")}
                          </h3>
                          <p className="text-xxs text-slate-400 mt-0.5">
                            Gestão física interna e parlatório integrado. Lotação total: {activePrisonForDetails.currentOccupancy}/{activePrisonForDetails.officialCapacity}
                          </p>
                        </div>
                        
                        {/* Sub-Tabs */}
                        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-center">
                          <button
                            type="button"
                            onClick={() => setDetailsSubTab("pavilions")}
                            className={`px-3 py-1.5 font-bold text-xxs rounded transition-all cursor-pointer ${
                              detailsSubTab === "pavilions"
                                ? "bg-slate-850 text-amber-500"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            🏢 Blocos & Pavilhões
                          </button>
                          <button
                            type="button"
                            onClick={() => setDetailsSubTab("visits")}
                            className={`px-3 py-1.5 font-bold text-[10px] rounded transition-all cursor-pointer ${
                              detailsSubTab === "visits"
                                ? "bg-slate-850 text-amber-500"
                                : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            📅 Calendário de Visitas
                          </button>
                        </div>
                      </div>

                      {detailsSubTab === "pavilions" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                          {activePrisonForDetails.pavilions.map((pav) => (
                            <div key={pav.id} className="bg-slate-950 p-4 border border-slate-800 rounded-lg flex flex-col gap-3">
                              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                                <span className="text-xs font-semibold text-slate-200">{pav.name}</span>
                                <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-amber-400 font-mono border border-slate-805">
                                  {(pav as any).specialty_tag || "Capacidade Geral"}
                                </span>
                              </div>

                              <div className="flex flex-col gap-2.5">
                                {pav.blocks.map(blk => {
                                  const percent = Math.round((blk.current / blk.capacity) * 100);
                                  return (
                                    <div key={blk.id} className="bg-slate-900/60 p-2.5 border border-slate-800/50 rounded flex flex-col gap-1 font-mono text-xxs">
                                      <div className="flex justify-between text-slate-300">
                                        <span className="font-semibold text-slate-205">{blk.name}</span>
                                        <span className="text-slate-400">({blk.current}/{blk.capacity} reclusos)</span>
                                      </div>
                                      <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full ${percent > 100 ? "bg-red-500 animate-pulse" : "bg-cyan-500"}`} 
                                          style={{ width: `${Math.min(percent, 100)}%` }}
                                        />
                                      </div>
                                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                                        <span>Tipo: {blk.riskLevel}</span>
                                        <span className={percent > 100 ? "text-red-400 font-bold" : "text-emerald-400 font-semibold"}>{percent}% Lotação</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {detailsSubTab === "visits" && (
                        <div className="space-y-4 animate-fadeIn font-sans">
                          {/* Top Info Slot Banner */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                              <span className="text-xxs text-slate-500 uppercase block font-mono">Dotação do Parlatório</span>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-lg font-bold text-slate-100">{parlatorioCapacity}</span>
                                <span className="text-xxs text-slate-500 font-mono">Simultâneos Máximo</span>
                              </div>
                            </div>
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850">
                              <span className="text-xxs text-slate-500 uppercase block font-mono">Agendamentos Activos</span>
                              <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-lg font-bold text-amber-500">
                                  {prisonVisits.filter(v => v.prisonId === activePrisonForDetails.id && v.status === "Confirmado").length}
                                </span>
                                <span className="text-xxs text-slate-500">Registados</span>
                              </div>
                            </div>
                            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 col-span-1">
                              <span className="text-xxs text-slate-550 uppercase block font-mono">Garantia Prisional</span>
                              <span className="text-[10px] flex items-center gap-1 text-emerald-400 font-medium mt-1.5">
                                <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0 select-none" />
                                Anti-Sobrelotação Activa
                              </span>
                            </div>
                          </div>

                          {/* Scheduling Layout: form + table */}
                          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                            {/* Visit Form */}
                            <form onSubmit={handleAddVisitSubmit} className="xl:col-span-5 bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
                              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-slate-900 pb-2">
                                <Plus className="h-4 w-4 text-amber-500 stroke-[3px]" />
                                Agendar Nova Visita
                              </h4>

                              <div>
                                <label className="text-[9px] text-slate-400 block mb-1 uppercase font-mono tracking-wider">Nome do Familiar *</label>
                                <input
                                  type="text"
                                  required
                                  value={newVisitVisitorName || ""}
                                  onChange={(e) => setNewVisitVisitorName(e.target.value)}
                                  placeholder="e.g. Maria Teresa Sambo"
                                  className="w-full bg-slate-900 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none focus:border-amber-520"
                                />
                              </div>

                              <div>
                                <label className="text-[9px] text-slate-400 block mb-1 uppercase font-mono tracking-wider">Documento (BI / Passport) *</label>
                                <input
                                  type="text"
                                  required
                                  value={newVisitVisitorDoc || ""}
                                  onChange={(e) => setNewVisitVisitorDoc(e.target.value)}
                                  placeholder="e.g. BI00293485LA043"
                                  className="w-full bg-slate-900 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none focus:border-amber-520 font-mono"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <label className="text-[9px] text-slate-400 block mb-1 uppercase font-mono tracking-wider">Recluso *</label>
                                  <select
                                    required
                                    value={newVisitInmateId || ""}
                                    onChange={(e) => setNewVisitInmateId(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                                  >
                                    <option value="">-- Seleccionar --</option>
                                    {filteredInmatesForPrison.map(i => (
                                      <option key={i.id} value={i.id}>{i.firstName} {i.lastName}</option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[9px] text-slate-400 block mb-1 uppercase font-mono tracking-wider">Data *</label>
                                  <input
                                    type="date"
                                    required
                                    value={newVisitDate || ""}
                                    onChange={(e) => setNewVisitDate(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-mono"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[9px] text-slate-400 block mb-1 uppercase font-mono tracking-wider">Horário *</label>
                                <select
                                  value={newVisitTimeSlot}
                                  onChange={(e) => setNewVisitTimeSlot(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-mono"
                                >
                                  <option value="09:00 - 11:00">Manhã (09:00 - 11:00)</option>
                                  <option value="11:00 - 13:00">Meio-Dia (11:00 - 13:00)</option>
                                  <option value="14:00 - 16:00">Tarde (14:00 - 16:00)</option>
                                </select>
                              </div>

                              {/* Live slot occupancy feedback indicator */}
                              {newVisitDate && (
                                <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center text-xxs font-mono">
                                  <span className="text-slate-400">Ocupação do Horário:</span>
                                  <span className={`font-bold px-1.5 py-0.5 rounded ${
                                    getSlotOccupancy(newVisitDate, newVisitTimeSlot) >= parlatorioCapacity
                                      ? "bg-red-500/15 text-red-400 animate-pulse"
                                      : getSlotOccupancy(newVisitDate, newVisitTimeSlot) >= (parlatorioCapacity * 0.7)
                                      ? "bg-amber-500/10 text-amber-400"
                                      : "bg-emerald-500/10 text-emerald-400"
                                  }`}>
                                    {getSlotOccupancy(newVisitDate, newVisitTimeSlot)} / {parlatorioCapacity} slots
                                  </span>
                                </div>
                              )}

                              <button
                                type="submit"
                                className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 text-xs font-bold rounded transition cursor-pointer flex items-center justify-center gap-1"
                              >
                                <Check className="h-4 w-4 stroke-[3px]" />
                                Registar Agendamento no Parlatório
                              </button>
                            </form>

                            {/* Visit List Table */}
                            <div className="xl:col-span-7 bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col justify-between">
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                                  Histórico & Próximas Visitas Registadas
                                </h4>
                                
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xxs font-mono">
                                    <thead>
                                      <tr className="border-b border-slate-900 text-slate-500 uppercase pb-1 tracking-wider">
                                        <th className="pb-2 font-semibold">Familiar (Doc)</th>
                                        <th className="pb-2 font-semibold">Recluso Alvo</th>
                                        <th className="pb-2 font-semibold">Data / Horário</th>
                                        <th className="pb-2 font-semibold">Estado</th>
                                        <th className="pb-2 font-semibold text-right">Acções</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-900">
                                      {prisonVisits.filter(v => v.prisonId === activePrisonForDetails.id).length === 0 ? (
                                        <tr>
                                          <td colSpan={5} className="py-8 text-center text-slate-500 font-mono text-xxs">
                                            Nenhum agendamento de visita registrado para este estabelecimento.
                                          </td>
                                        </tr>
                                      ) : (
                                        prisonVisits.filter(v => v.prisonId === activePrisonForDetails.id).map(visit => (
                                          <tr key={visit.id} className="hover:bg-slate-900/40 transition">
                                            <td className="py-2 pr-1.5 font-sans">
                                              <div className="flex flex-col">
                                                <span className="font-semibold text-slate-200 text-xs">{visit.visitorName}</span>
                                                <span className="text-[10px] text-slate-500 font-mono">{visit.visitorDocument}</span>
                                              </div>
                                            </td>
                                            <td className="py-2 pr-1.5 font-sans col-span-1">
                                              <div className="flex flex-col">
                                                <span className="text-slate-300 font-medium">{visit.inmateName}</span>
                                                <span className="text-[9px] text-slate-550 font-mono">RNR: {visit.inmateId}</span>
                                              </div>
                                            </td>
                                            <td className="py-2 pr-1.5">
                                              <div className="flex flex-col font-mono text-xxs text-amber-400">
                                                <span>{visit.visitDate}</span>
                                                <span className="text-slate-400">{visit.timeSlot}</span>
                                              </div>
                                            </td>
                                            <td className="py-2">
                                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                                visit.status === "Realizado" ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" :
                                                visit.status === "Confirmado" ? "bg-amber-955/15 border-amber-500/25 text-amber-500" :
                                                visit.status === "Cancelado" ? "bg-rose-955/20 border-rose-500/20 text-rose-450" :
                                                "bg-slate-900 border-slate-800 text-slate-400"
                                              }`}>
                                                {visit.status}
                                              </span>
                                            </td>
                                            <td className="py-2 text-right">
                                              <div className="flex justify-end gap-1">
                                                {visit.status === "Confirmado" && (
                                                  <>
                                                    <button
                                                      type="button"
                                                      onClick={() => handleStatusChange(visit.id, "Realizado")}
                                                      className="px-1.5 py-0.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 rounded border border-emerald-500/10 cursor-pointer transition text-[9px]"
                                                    >
                                                      Check-In
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => handleStatusChange(visit.id, "Cancelado")}
                                                      className="px-1.5 py-0.5 bg-rose-955/10 hover:bg-rose-900/20 text-rose-455 rounded border border-rose-500/10 cursor-pointer transition text-[9px]"
                                                    >
                                                      X
                                                    </button>
                                                  </>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        ))
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                              <span className="text-[9px] text-slate-500 block leading-normal mt-3 border-t border-slate-900 pt-2 bg-slate-950/30 font-sans">
                                * Nota de Segurança: Agendamentos estão restritos ao limite de slots síncronos do parlatório do estabelecimento para prevenir motins ou sobrecarga ocupacional logística.
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Barra Lateral: Perfil de Risco e Inteligência */}
              <div className="flex flex-col gap-6">
                
                {/* WIDGET DE SOBRELOTAÇÃO COM SPARKLINE */}
                <div 
                  id="prison-overcrowding-sparkline-widget" 
                  className={`rounded-xl p-5 flex flex-col gap-4 shadow-xl border transition-all duration-500 ${
                    isAutoAlertEnabled && hasCriticalOvercrowdingAutoAlert
                      ? "bg-red-950/40 border-red-500/60 shadow-2xl shadow-red-500/15 animate-[pulse_3s_infinite]"
                      : "bg-slate-900 border-slate-800"
                  }`}
                >
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-slate-850 pb-3 font-sans">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 ${
                        isAutoAlertEnabled && hasCriticalOvercrowdingAutoAlert ? "text-red-400" : "text-amber-500"
                      }`}>
                        <Building className="h-4 w-4 shrink-0" /> Unidades: Sobrelotação Geral
                        <div className="relative group inline-flex items-center">
                          <HelpCircle id="overcrowding-help-tooltip-icon" className="h-3.5 w-3.5 text-slate-400 hover:text-slate-200 cursor-help transition-colors shrink-0" />
                          <div className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-6 w-72 p-3 bg-slate-950 text-slate-300 font-sans text-[10px] font-normal leading-relaxed rounded-lg border border-slate-800 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none normal-case tracking-normal">
                            <div className="font-bold text-slate-100 mb-1 flex items-center gap-1 font-mono uppercase tracking-wide text-[9px] text-amber-500">
                              <Building className="h-3 w-3 text-amber-500" /> Cálculo da Lotação:
                            </div>
                            <p className="mb-1.5">
                              A percentagem de ocupação é calculada dividindo a **Ocupação Activa** (total de reclusos no estabelecimento) pela **Capacidade Operacional** do mesmo:
                            </p>
                            <div className="bg-slate-900 p-2 rounded border border-slate-800 font-mono text-[9px] text-amber-400/90 mb-1.5 text-center">
                              Taxa % = (Reclusos / Cap. Operacional) * 100
                            </div>
                            <p className="text-[9px] text-slate-400 leading-snug">
                              Se a taxa for igual ou superior a <span className="text-red-400 font-bold">100%</span>, o estabelecimento é marcado como sobrelotado. Se ultrapassar <span className="text-red-400 font-bold">110%</span>, o sistema activa o alarme crítico de segurança.
                            </p>
                          </div>
                        </div>
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
                        Monitorização nacional em tempo real por estabelecimento (Capacidades vs Ocupação Activa).
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        id="toggle-auto-alert-btn"
                        onClick={() => {
                          const nextVal = !isAutoAlertEnabled;
                          setIsAutoAlertEnabled(nextVal);
                          writeAuditLog(
                            currentOperator,
                            "PRINT_REPORT",
                            "Dashboard",
                            undefined,
                            `Alternou Modo Alerta Automático de Sobrelotação para: ${nextVal ? "ATIVADO" : "DESATIVADO"}`
                          );
                        }}
                        className={`text-[9px] font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-all duration-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                          isAutoAlertEnabled
                            ? "bg-red-950 text-red-200 border-red-500 hover:bg-red-900/35 font-black shadow-lg shadow-red-500/10"
                            : "bg-slate-950 text-slate-400 border-slate-850 hover:bg-slate-900 hover:text-white"
                        }`}
                        title="Ativar/Desativar modo de Alerta Automático para superlotação severa"
                      >
                        <Bell className={`h-3 w-3 ${isAutoAlertEnabled && hasCriticalOvercrowdingAutoAlert ? "animate-bounce text-red-400" : ""}`} />
                        {isAutoAlertEnabled ? "Alerta Automático: ON" : "Alerta Automático: OFF"}
                      </button>

                      <button
                        id="toggle-detailed-mode-btn"
                        onClick={() => {
                          const nextVal = !isOvercrowdingDetailedMode;
                          setIsOvercrowdingDetailedMode(nextVal);
                          if (nextVal) {
                            const initialMap: Record<string, boolean> = {};
                            visiblePrisons.forEach(p => {
                              initialMap[p.id] = true;
                            });
                            setExpandedOvercrowdedPrisons(initialMap);
                          }
                          writeAuditLog(
                            currentOperator,
                            "PRINT_REPORT",
                            "Dashboard",
                            undefined,
                            `Alternou Modo Detalhado de Sobrelotação para: ${nextVal ? "ATIVADO" : "DESATIVADO"}`
                          );
                        }}
                        className={`text-[9px] font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-all duration-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                          isOvercrowdingDetailedMode
                            ? "bg-amber-500 text-slate-950 border-amber-600 font-black shadow-lg shadow-amber-500/10"
                            : "bg-slate-950 text-slate-300 border-slate-850 hover:bg-slate-900 hover:text-white"
                        }`}
                      >
                        <Layers className="h-3 w-3" />
                        {isOvercrowdingDetailedMode ? "Modo Detalhado: ACTIVO" : "Modo Detalhado"}
                      </button>

                      {isOvercrowdingDetailedMode && (
                        <button
                          id="export-all-critical-blocks-btn"
                          onClick={() => {
                            const allCritical: Array<{ pavName: string; blkName: string; capacity: number; current: number; percent: number; riskLevel: string }> = [];
                            visiblePrisons.forEach((prison: any) => {
                              if (prison.pavilions) {
                                prison.pavilions.forEach((pav: any) => {
                                  if (pav.blocks) {
                                    pav.blocks.forEach((blk: any) => {
                                      const percent = blk.capacity > 0 ? Math.round((blk.current / blk.capacity) * 100) : 0;
                                      if (percent >= 100) {
                                        allCritical.push({
                                          pavName: `${prison.name.replace("Estabelecimento Penitenciário de ", "")} - ${pav.name.split(" - ")[0]}`,
                                          blkName: blk.name,
                                          capacity: blk.capacity,
                                          current: blk.current,
                                          percent,
                                          riskLevel: blk.riskLevel
                                        });
                                      }
                                    });
                                  }
                                });
                              }
                            });

                            if (allCritical.length === 0) {
                              alert("Não existem blocos em lotação crítica para os estabelecimentos exibidos.");
                              return;
                            }

                            exportCriticalBlocksToPDF(
                              "Nacional (Múltiplas Unidades)",
                              allCritical,
                              currentOperatorId
                            );

                            writeAuditLog(
                              currentOperator,
                              "PRINT_REPORT",
                              "Dashboard",
                              undefined,
                              `Exportou Relatório Técnico Consolidado de todos os Blocos Críticos Nacionais (Total: ${allCritical.length})`
                            );
                          }}
                          className="bg-red-950 text-red-200 border border-red-500 hover:bg-red-900 hover:text-white text-[9px] font-mono font-bold px-2.5 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 shadow-lg shadow-red-950/20"
                          title="Exportar dados de todos os blocos críticos de todas as unidades monitoradas em um relatório PDF integrado"
                        >
                          <FileText className="h-3 w-3 text-red-400" />
                          Exportar Blocos Críticos
                        </button>
                      )}
                    </div>
                  </div>

                  {isAutoAlertEnabled && hasCriticalOvercrowdingAutoAlert && (
                    <div className="bg-red-950/70 border border-red-550/30 px-3 py-2.5 rounded-lg text-[10px] text-red-200 flex items-center justify-between font-mono animate-pulse">
                      <span className="flex items-center gap-2 font-bold">
                        <AlertTriangle className="h-4 w-4 text-red-500 animate-bounce shrink-0" />
                        ALERTA: SOBRELOTAÇÃO EXCEDEU 110%
                      </span>
                      <span className="text-[8px] bg-red-900/60 border border-red-500/20 px-2 py-0.5 rounded text-red-100 font-semibold uppercase">
                        Risco Crítico
                      </span>
                    </div>
                  )}

                  {/* Filtro de Severidade Interativo do Widget */}
                  <div className="flex flex-col gap-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 font-mono flex items-center gap-1.5 leading-none">
                        <Sliders className="w-3 h-3 text-amber-500" /> Filtrar por Ameaça Disciplinar:
                      </span>
                      {widgetSeverityFilter !== 'ALL' && (
                        <button 
                          onClick={() => setWidgetSeverityFilter('ALL')}
                          className="text-[9px] text-amber-500 font-mono hover:underline cursor-pointer leading-none"
                        >
                          Limpar filtro
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-1 pt-0.5">
                      {[
                        { id: 'ALL', label: 'TODOS', color: 'border-slate-800 text-slate-400 hover:bg-slate-800/30', activeColor: 'bg-slate-800 border-slate-600 text-white font-black' },
                        { id: 'LOW', label: 'BAIXA', color: 'border-blue-500/10 text-blue-400/80 hover:bg-blue-500/5', activeColor: 'bg-blue-500/20 border-blue-500/60 text-blue-300 font-bold' },
                        { id: 'MEDIUM', label: 'MÉDIA', color: 'border-purple-500/10 text-purple-400/80 hover:bg-purple-500/5', activeColor: 'bg-purple-500/20 border-purple-500/60 text-purple-300 font-bold' },
                        { id: 'HIGH', label: 'ALTA', color: 'border-orange-500/10 text-orange-400/80 hover:bg-orange-500/5', activeColor: 'bg-orange-500/20 border-orange-500/60 text-orange-300 font-bold' },
                        { id: 'CRITICAL', label: 'CRÍTICA', color: 'border-red-500/10 text-red-500/80 hover:bg-red-500/5', activeColor: 'bg-red-500/20 border-red-500/60 text-red-100 font-bold animate-pulse' }
                      ].map((btn) => (
                        <button
                          key={btn.id}
                          onClick={() => setWidgetSeverityFilter(btn.id as any)}
                          className={`text-[8px] font-mono py-1 rounded border transition text-center cursor-pointer ${
                            widgetSeverityFilter === btn.id ? btn.activeColor : btn.color
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3.5">
                    {visiblePrisons.map((p) => {
                      const occupancyRate = Math.round((p.currentOccupancy / p.operationalCapacity) * 100);
                      const isOvercrowded = p.currentOccupancy > p.operationalCapacity;
                      const isOverOfficial = p.currentOccupancy > p.officialCapacity;
                      
                      const sparklineData = [
                        { name: "Oficial", valor: p.officialCapacity, color: "#475569" }, // slate-600
                        { name: "Operacional", valor: p.operationalCapacity, color: "#38bdf8" }, // sky-500
                        { name: "Actual", valor: p.currentOccupancy, color: isOvercrowded ? "#ef4444" : isOverOfficial ? "#f59e0b" : "#10b981" } // red-500, amber-500, emerald-500
                      ];

                      const formattedName = p.name.replace("Estabelecimento Penitenciário de ", "EP ");
                      const matchedIncidents = disciplinaryIncidentsData.find(item => item.unit === formattedName) || {
                        Agressao: (p.currentOccupancy % 5) + 1,
                        Fuga: (p.currentOccupancy % 2),
                        PosseIlicita: (p.currentOccupancy % 8) + 1,
                        Indisciplina: (p.currentOccupancy % 6) + 1,
                      };

                      // Filter based on severity selection
                      const displayAgressao = (widgetSeverityFilter === "ALL" || widgetSeverityFilter === "CRITICAL") ? matchedIncidents.Agressao : 0;
                      const displayFuga = (widgetSeverityFilter === "ALL" || widgetSeverityFilter === "HIGH") ? matchedIncidents.Fuga : 0;
                      const displayPosseIlicita = (widgetSeverityFilter === "ALL" || widgetSeverityFilter === "MEDIUM") ? matchedIncidents.PosseIlicita : 0;
                      const displayIndisciplina = (widgetSeverityFilter === "ALL" || widgetSeverityFilter === "LOW") ? matchedIncidents.Indisciplina : 0;

                      const displayTotal = displayAgressao + displayFuga + displayPosseIlicita + displayIndisciplina;
                      const totalInc = matchedIncidents.Agressao + matchedIncidents.Fuga + matchedIncidents.PosseIlicita + matchedIncidents.Indisciplina;
                      
                      const aggPct = displayTotal > 0 ? (displayAgressao / displayTotal) * 100 : 0;
                      const fugPct = displayTotal > 0 ? (displayFuga / displayTotal) * 100 : 0;
                      const posPct = displayTotal > 0 ? (displayPosseIlicita / displayTotal) * 100 : 0;
                      const indPct = displayTotal > 0 ? (displayIndisciplina / displayTotal) * 100 : 0;

                      let totalLabel = "";
                      if (widgetSeverityFilter === "ALL") {
                        totalLabel = `${totalInc} registados`;
                      } else if (widgetSeverityFilter === "CRITICAL") {
                        totalLabel = `${matchedIncidents.Agressao} Agressões (Crítica)`;
                      } else if (widgetSeverityFilter === "HIGH") {
                        totalLabel = `${matchedIncidents.Fuga} Fugas (Alta)`;
                      } else if (widgetSeverityFilter === "MEDIUM") {
                        totalLabel = `${matchedIncidents.PosseIlicita} Posse Ilícita (Média)`;
                      } else if (widgetSeverityFilter === "LOW") {
                        totalLabel = `${matchedIncidents.Indisciplina} Indisciplina (Baixa)`;
                      }

                      // Parse pavilions and collect blocks with critical occupancy (>= 100%)
                      const criticalBlocks: Array<{ pavName: string; blkName: string; capacity: number; current: number; percent: number; riskLevel: string }> = [];
                      if (p.pavilions) {
                        p.pavilions.forEach((pav: any) => {
                          if (pav.blocks) {
                            pav.blocks.forEach((blk: any) => {
                              const percent = blk.capacity > 0 ? Math.round((blk.current / blk.capacity) * 100) : 0;
                              if (percent >= 100) {
                                  criticalBlocks.push({
                                    pavName: pav.name.split(" - ")[0],
                                    blkName: blk.name,
                                    capacity: blk.capacity,
                                    current: blk.current,
                                    percent,
                                    riskLevel: blk.riskLevel
                                  });
                              }
                            });
                          }
                        });
                      }

                      return (
                        <div key={p.id} className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 flex flex-col gap-2 hover:border-slate-700 transition">
                          
                           {/* Row 1: Cap vs Act Overcrowding Sparkline */}
                           <div className="flex items-center justify-between gap-3">
                             {/* Info Estabelecimento */}
                             <div className="flex-1 min-w-0">
                               <h4 className="text-xxs font-bold text-slate-200 leading-tight truncate">
                                 {formattedName}
                               </h4>
                               <p className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5 font-mono">
                                 <MapPin className="h-2.5 w-2.5" /> {p.location.split(",")[0]}
                               </p>
                               
                               {/* Badges */}
                               <div className="flex items-center gap-1.5 mt-1">
                                 <span className={`text-[8px] font-bold uppercase px-1.5 py-0.2 rounded font-mono ${
                                   isOvercrowded 
                                     ? "bg-red-500/10 text-red-400 border border-red-500/20" 
                                     : isOverOfficial
                                     ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                     : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                 }`}>
                                   {isOvercrowded ? "Sobrelotada" : isOverOfficial ? "Alerta" : "Estável"}
                                 </span>
                                 <span className="text-[9px] font-mono text-slate-400 font-bold">
                                   {occupancyRate}%
                                 </span>
                                 {/* Interactive Chevron Button */}
                                 <button
                                   onClick={() => {
                                     setIsOvercrowdingDetailedMode(true);
                                     setExpandedOvercrowdedPrisons(prev => ({
                                       ...prev,
                                       [p.id]: !prev[p.id]
                                     }));
                                   }}
                                   className="text-slate-500 hover:text-slate-200 transition-colors p-0.5 rounded hover:bg-slate-900 inline-flex items-center justify-center cursor-pointer ml-0.5"
                                   title="Alternar blocos críticos no Modo Detalhado"
                                 >
                                   {expandedOvercrowdedPrisons[p.id] ? (
                                     <ChevronUp className="h-3 w-3 text-amber-500 animate-pulse" />
                                   ) : (
                                     <ChevronDown className="h-3 w-3" />
                                   )}
                                 </button>
                               </div>
                             </div>

                             {/* Sparkline de Lotação ao Lado do Nome (Clickable to Expand) */}
                             <div 
                               className="w-20 h-10 flex items-center shrink-0 cursor-pointer hover:bg-slate-905/20 rounded border border-transparent hover:border-slate-800 transition-all p-0.5 relative group/spark"
                               onClick={() => {
                                 setIsOvercrowdingDetailedMode(true);
                                 setExpandedOvercrowdedPrisons(prev => ({
                                   ...prev,
                                   [p.id]: !prev[p.id]
                                 }));
                                 writeAuditLog(
                                   currentOperator,
                                   "PRINT_REPORT",
                                   "Dashboard",
                                   undefined,
                                   `Visualizou/Alternou blocos críticos via clique no gráfico do estabelecimento: ${formattedName}`
                                 );
                               }}
                               title="Clique no gráfico para ver detalhes dos blocos críticos"
                             >
                               <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={sparklineData} margin={{ top: 2, bottom: 2, left: 2, right: 2 }}>
                                   <Tooltip
                                     cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                                     content={({ active, payload }) => {
                                       if (active && payload && payload.length) {
                                         const data = payload[0].payload;
                                         return (
                                           <div className="bg-slate-950 border border-slate-800 px-2 py-1.5 rounded shadow-xl font-mono text-[9px] text-slate-300 font-sans">
                                             <p className="font-bold text-slate-100">{data.name}</p>
                                             <p className="text-amber-500">{data.valor} reclusos</p>
                                             <p className="text-[8px] text-slate-400 mt-1 italic font-sans border-t border-slate-900 pt-1">Clique para expandir blocos</p>
                                           </div>
                                         );
                                       }
                                       return null;
                                     }}
                                   />
                                   <Bar dataKey="valor" radius={[1, 1, 0, 0]}>
                                     {sparklineData.map((entry, index) => (
                                       <ReCell key={`cell-${index}`} fill={entry.color} />
                                     ))}
                                   </Bar>
                                 </BarChart>
                               </ResponsiveContainer>
                               {/* Interactive hover indicator badge */}
                               <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[6px] font-sans font-black px-1.5 rounded-full opacity-0 group-hover/spark:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md">
                                 +
                               </span>
                             </div>

                             {/* Métricas Numéricas Compactas */}
                             <div className="text-right shrink-0 font-mono">
                               <span className="text-xxs font-bold text-slate-300 block">
                                 {p.currentOccupancy}
                               </span>
                               <span className="text-[9px] text-slate-500 block border-t border-slate-850 mt-0.5 pt-0.5">
                                 Cap: {p.operationalCapacity}
                               </span>
                             </div>
                           </div>

                           {/* Detailed Mode: Critical Internal Blocks directly below sparkline/bars */}
                           {isOvercrowdingDetailedMode && (
                             <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                               expandedOvercrowdedPrisons[p.id] 
                                 ? "max-h-[36rem] opacity-100 mt-1 pb-1.5" 
                                 : "max-h-0 opacity-0 pointer-events-none"
                             }`}>
                               <div className="flex flex-col gap-1 bg-gradient-to-r from-red-950/20 to-slate-950/80 border border-red-500/15 p-2.5 rounded-lg">
                                 <div className="flex items-center justify-between text-[9px] font-mono select-none px-0.5 pb-1 border-b border-red-900/10">
                                   <span className="text-red-400 font-bold flex items-center gap-1">
                                     <AlertTriangle className="h-3 w-3 text-red-500 animate-pulse shrink-0" />
                                     Lotação Crítica (Blocos ≥ 100%)
                                   </span>
                                   <span className="text-slate-500 font-medium">Lotação Activa</span>
                                 </div>
                                  {/* Cálculo Preditivo de Saturação */}
                                  {(() => {
                                    const calculatedRate = (() => {
                                      let baseRate = 10;
                                      if (p.id === "PRIS-01") baseRate = 58;
                                      else if (p.id === "PRIS-02") baseRate = 38;
                                      else if (p.id === "PRIS-03") baseRate = 18;
                                      else if (p.id === "PRIS-HUAMBO") baseRate = 28;
                                      else if (p.id === "PRIS-BAILUNDO") baseRate = 12;
                                      else if (p.id === "PRIS-CAALA") baseRate = 10;
                                      else if (p.id === "PRIS-BEN-01") baseRate = 44;
                                      else if (p.id === "PRIS-HUI-01") baseRate = 35;
                                      else {
                                        baseRate = Math.max(5, Math.round(p.officialCapacity * 0.04));
                                      }
                                      
                                      // React to newly added active inmates in state
                                      const newlyAdded = inmates.filter(i => i.assignedPrisonId === p.id && i.status === "ACTIVE" && !INITIAL_INMATES.some(init => init.id === i.id)).length;
                                      return baseRate + newlyAdded * 2;
                                    })();

                                    const remainingSlots = p.operationalCapacity - p.currentOccupancy;
                                    const daysToSaturation = calculatedRate > 0 && remainingSlots > 0
                                      ? Math.round(remainingSlots / (calculatedRate / 30))
                                      : 0;

                                    const saturationDateStr = remainingSlots > 0 && calculatedRate > 0
                                      ? (() => {
                                          const predDate = new Date("2026-06-17T12:00:00");
                                          predDate.setDate(predDate.getDate() + daysToSaturation);
                                          return predDate.toLocaleDateString("pt-AO", { day: "2-digit", month: "2-digit", year: "numeric" });
                                        })()
                                      : "N/A";

                                    const isSaturated = p.currentOccupancy >= p.operationalCapacity;
                                    
                                    // Style and status label based on risk level
                                    let riskBg = "bg-emerald-950/20 border-emerald-550/10 text-emerald-400";
                                    let riskLabel = "Estável / Saudável";
                                    let riskIconColor = "text-emerald-400";
                                    let daysLabel = `${daysToSaturation} dias (${saturationDateStr})`;

                                    if (isSaturated) {
                                      riskBg = "bg-red-955/20 border-red-500/20 text-red-400";
                                      riskLabel = "Crítico (Saturado)";
                                      riskIconColor = "text-red-500 animate-pulse";
                                      daysLabel = "Limite Excedido (0 dias)";
                                    } else if (daysToSaturation <= 30) {
                                      riskBg = "bg-red-955/10 border-red-500/10 text-red-300";
                                      riskLabel = "Alerta Iminente (< 30 dias)";
                                      riskIconColor = "text-red-400 font-bold animate-pulse";
                                    } else if (daysToSaturation <= 90) {
                                      riskBg = "bg-amber-955/10 border-amber-500/10 text-amber-305";
                                      riskLabel = "Alerta Médio (30-90 dias)";
                                      riskIconColor = "text-amber-450";
                                    } else {
                                      riskBg = "bg-slate-900/40 border-slate-800 text-slate-300";
                                      riskLabel = "Estável (> 90 dias)";
                                      riskIconColor = "text-slate-500";
                                    }

                                    return (
                                      <div className={`mt-2 p-2 rounded border text-[9px] font-mono flex flex-col gap-1.5 ${riskBg}`}>
                                        <div className="flex items-center justify-between border-b border-white/5 pb-1">
                                          <span className="font-bold flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3 text-amber-500" />
                                            Cálculo Preditivo de Ocupação
                                          </span>
                                          <span className="text-[8px] px-1.5 py-0.2 rounded font-sans font-bold uppercase border bg-black/40 border-white/5">
                                            {riskLabel}
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-400">
                                          <div className="flex items-center gap-1">
                                            <span className="text-slate-500 font-sans">• Admissão Média:</span>
                                            <span className="text-slate-205 font-bold">+${calculatedRate} rec./mês</span>
                                          </div>
                                          <div className="flex items-center gap-1 justify-end">
                                            <span className="text-slate-500 font-sans">Vagas Restantes:</span>
                                            <span className={`font-bold ${isSaturated ? "text-red-400" : "text-slate-300"}`}>
                                              ${isSaturated ? "0" : remainingSlots} vagas
                                            </span>
                                          </div>
                                          <div className="col-span-2 flex items-center justify-between mt-0.5 pt-0.5 border-t border-white/5">
                                            <span className="font-sans font-medium text-slate-400 flex items-center gap-1">
                                              <Clock className={`h-3 w-3 ${riskIconColor}`} /> Dias até saturação (100%):
                                            </span>
                                            <span className={`font-black text-[10px] ${isSaturated ? "text-red-400 animate-pulse" : "text-amber-400"}`}>
                                              ${daysLabel}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                 
                                 {criticalBlocks.length > 0 ? (
                                    <>
                                   <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-0.5 mt-1.5">
                                     {criticalBlocks.map((blk, idx) => (
                                       <div key={`${blk.blkName}-${idx}`} className="flex items-center justify-between text-[9px] bg-slate-900/60 p-1.5 rounded border border-red-900/15 font-mono hover:bg-slate-900 transition">
                                         <div className="flex flex-col">
                                           <span className="font-bold text-slate-200 leading-tight">{blk.blkName}</span>
                                           <span className="text-[8px] text-slate-400 font-sans">{blk.pavName} • Regime: {blk.riskLevel}</span>
                                         </div>
                                         <div className="text-right shrink-0">
                                           <span className="text-red-400 font-black block">{blk.percent}% Lotação</span>
                                           <span className="text-[8px] text-slate-505 block">{blk.current} / {blk.capacity} rec.</span>
                                         </div>
                                       </div>
                                     ))}
                                   </div>
                                    <button
                                      onClick={() => {
                                        exportCriticalBlocksToPDF(p.name, criticalBlocks, currentOperatorId);
                                        writeAuditLog(
                                          currentOperator,
                                          "PRINT_REPORT",
                                          "Dashboard",
                                          undefined,
                                          `Exportou Relatório Técnico em PDF de blocos críticos do estabelecimento: ${p.name}`
                                        );
                                      }}
                                      className="mt-1.5 w-full bg-red-950 hover:bg-red-900 border border-red-500/30 hover:border-red-550 text-red-200 hover:text-white transition-all text-[8px] font-mono py-1.5 rounded flex items-center justify-center gap-1 cursor-pointer font-bold select-none leading-none shadow-sm"
                                      title="Gerar Relatório Técnico PDF para esta unidade monitorizada"
                                    >
                                      <Printer className="h-2.5 w-2.5 text-red-400" /> Exportar Blocos Críticos (PDF)
                                    </button>
                                    </>
                                 ) : (
                                   <div className="text-center py-1.5 text-[8px] text-emerald-400 font-medium font-mono bg-emerald-950/20 rounded border border-emerald-500/10 flex items-center justify-center gap-1 mt-1">
                                     <Check className="h-2.5 w-2.5" /> Todo o estabelecimento opera em limites estáveis
                                   </div>
                                 )}
                               </div>
                             </div>
                           )}

                           {/* Row 2: Disciplinary Incident graphical split sparks strip */}
                           <div className="border-t border-slate-900/60 pt-2 flex flex-col gap-1">
                             <div className="flex items-center justify-between text-[8px] font-mono">
                               <span className="flex items-center gap-1 text-slate-400 font-sans">
                                 <Shield className="w-2.5 h-2.5 text-amber-500 animate-pulse" /> Incidentes Disciplinares:
                               </span>
                               <span className="font-bold text-red-400">{totalLabel}</span>
                             </div>
                             <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-900/40">
                               {displayAgressao > 0 && (
                                 <div className="h-full bg-red-500 transition-all duration-300 animate-pulse" style={{ width: `${aggPct}%` }} title={`Agressões: ${matchedIncidents.Agressao}`} />
                               )}
                               {displayFuga > 0 && (
                                 <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${fugPct}%` }} title={`Fugas: ${matchedIncidents.Fuga}`} />
                               )}
                               {displayPosseIlicita > 0 && (
                                 <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${posPct}%` }} title={`Posse Ilícita: ${matchedIncidents.PosseIlicita}`} />
                               )}
                               {displayIndisciplina > 0 && (
                                 <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${indPct}%` }} title={`Indisciplina: ${matchedIncidents.Indisciplina}`} />
                               )}
                               {displayTotal === 0 && (
                                 <div className="h-full bg-slate-800 w-full" title="Sem incidentes registados nesta severidade" />
                               )}
                             </div>
                           </div>

                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Legenda Gráfica de Severidade de Incidentes / Medida de Alertas */}
                  <div className="border-t border-slate-850 pt-3 flex flex-col gap-2 relative">
                    {(() => {
                      const SEVERITY_TOOLTIP_DATA = {
                        LOW: {
                          title: "Severidade Baixa",
                          color: "text-blue-400",
                          border: "border-blue-500/40",
                          bgClass: "bg-slate-950 border-blue-500/40",
                          iconColor: "bg-blue-500",
                          definition: "Comportamentos disruptivos menores sem violência física ativa, violando normas internas da prisão de forma leve.",
                          criteria: "Atos ocasionais de indisciplina, perturbações de ruído ou recusas leves de ordens regulamentares (< 5 incidentes semanais)."
                        },
                        MEDIUM: {
                          title: "Severidade Média",
                          color: "text-purple-400",
                          border: "border-purple-500/40",
                          bgClass: "bg-slate-950 border-purple-500/40",
                          iconColor: "bg-purple-500",
                          definition: "Posse de materiais não autorizados ou violações administrativas que comprometam as vistorias ordinárias.",
                          criteria: "Apreensão de contrabando, posse ilícita de telecomunicações móveis ou tabaco (3 a 5 casos ativos)."
                        },
                        HIGH: {
                          title: "Severidade Alta",
                          color: "text-orange-400",
                          border: "border-orange-500/40",
                          bgClass: "bg-slate-950 border-orange-500/40",
                          iconColor: "bg-orange-500",
                          definition: "Atividades ativas de evasão, sabotagem física de perímetros ou ameaça direta ao isolamento securitário.",
                          criteria: "Planos ou tentativas físicas de fuga do estabelecimento ou danos estruturais e subversão graves nas últimas 72h."
                        },
                        CRITICAL: {
                          title: "Severidade Crítica",
                          color: "text-red-400",
                          border: "border-red-500/40",
                          bgClass: "bg-slate-950 border-red-500/40",
                          iconColor: "bg-red-500",
                          definition: "Violência corporal ativa grave, amotinamentos coordenados ou agressões de alto risco comprometendo vidas.",
                          criteria: "Ocorrência direta ou iminente de motins organizados, agressão corporal coletiva ou reféns."
                        }
                      };
                      
                      const arrowOffsets = {
                        LOW: "left-[12.5%]",
                        MEDIUM: "left-[37.5%]",
                        HIGH: "left-[62.5%]",
                        CRITICAL: "left-[87.5%]"
                      };

                      return (
                        <>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[9px] font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                              <Shield className="w-3 h-3 text-red-500 animate-pulse" /> Severidade de Incidentes Disciplinares:
                            </span>
                            <button
                              onClick={handleExportCSV}
                              className="bg-slate-950 hover:bg-slate-800 text-amber-500 hover:text-amber-400 border border-slate-800 hover:border-slate-700 font-mono text-[9px] px-2.5 py-1 rounded transition duration-200 flex items-center gap-1 cursor-pointer font-bold uppercase shrink-0"
                              title="Exportar dados formatados de severidade de incidentes para CSV"
                            >
                              <Download className="w-2.5 h-2.5" /> Exportar Dados
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-1.5 relative">
                            <div 
                              onMouseEnter={() => setHoveredSeverityKey('LOW')}
                              onMouseLeave={() => setHoveredSeverityKey(null)}
                              className="flex flex-col items-center p-1.5 rounded bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/40 hover:bg-blue-500/10 transition cursor-help text-center"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mb-0.5" />
                              <span className="text-[8px] font-bold text-blue-400 font-mono">BAIXA</span>
                              <span className="text-[7px] text-slate-500 font-sans tracking-tight leading-none mt-0.5">Indisciplina</span>
                            </div>
                            <div 
                              onMouseEnter={() => setHoveredSeverityKey('MEDIUM')}
                              onMouseLeave={() => setHoveredSeverityKey(null)}
                              className="flex flex-col items-center p-1.5 rounded bg-purple-500/5 border border-purple-500/10 hover:border-purple-500/40 hover:bg-purple-500/10 transition cursor-help text-center"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mb-0.5" />
                              <span className="text-[8px] font-bold text-purple-400 font-mono">MÉDIA</span>
                              <span className="text-[7px] text-slate-500 font-sans tracking-tight leading-none mt-0.5">Ilicitados</span>
                            </div>
                            <div 
                              onMouseEnter={() => setHoveredSeverityKey('HIGH')}
                              onMouseLeave={() => setHoveredSeverityKey(null)}
                              className="flex flex-col items-center p-1.5 rounded bg-orange-500/5 border border-orange-500/10 hover:border-orange-500/40 hover:bg-orange-500/10 transition cursor-help text-center"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mb-0.5" />
                              <span className="text-[8px] font-bold text-orange-400 font-mono">ALTA</span>
                              <span className="text-[7px] text-slate-500 font-sans tracking-tight leading-none mt-0.5">Tent. Fuga</span>
                            </div>
                            <div 
                              onMouseEnter={() => setHoveredSeverityKey('CRITICAL')}
                              onMouseLeave={() => setHoveredSeverityKey(null)}
                              className="flex flex-col items-center p-1.5 rounded bg-red-500/5 border border-red-500/10 hover:border-red-500/40 hover:bg-red-500/10 transition cursor-help text-center"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mb-0.5 animate-pulse" />
                              <span className="text-[8px] font-bold text-red-100 font-mono">CRÍTICA</span>
                              <span className="text-[7px] text-slate-500 font-sans tracking-tight leading-none mt-0.5">Agressões</span>
                            </div>
                          </div>

                          <AnimatePresence>
                            {hoveredSeverityKey && (
                              <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.96 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className={`absolute bottom-full mb-3.5 left-0 right-0 z-50 p-3.5 rounded-lg border shadow-2xl backdrop-blur-md flex flex-col gap-2 ${SEVERITY_TOOLTIP_DATA[hoveredSeverityKey].bgClass}`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className={`w-2.5 h-2.5 rounded-full ${SEVERITY_TOOLTIP_DATA[hoveredSeverityKey].iconColor} animate-pulse`} />
                                  <span className={`text-[10px] uppercase font-black tracking-widest ${SEVERITY_TOOLTIP_DATA[hoveredSeverityKey].color} font-mono`}>
                                    {SEVERITY_TOOLTIP_DATA[hoveredSeverityKey].title}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[8px] uppercase font-extrabold text-slate-400 font-mono tracking-wider">Definição:</span>
                                  <p className="text-[10px] text-slate-300 font-sans leading-normal">
                                    {SEVERITY_TOOLTIP_DATA[hoveredSeverityKey].definition}
                                  </p>
                                </div>
                                <div className="border-t border-slate-800/80 pt-1.5 mt-0.5 flex flex-col gap-0.5">
                                  <span className="text-[8px] uppercase font-extrabold text-amber-500/90 font-mono tracking-wider">Critério Limiar:</span>
                                  <p className="text-[10px] text-slate-300 font-mono leading-normal bg-slate-950/60 p-2 rounded border border-slate-800/50">
                                    {SEVERITY_TOOLTIP_DATA[hoveredSeverityKey].criteria}
                                  </p>
                                </div>

                                {/* Arrow pointer pointing exactly to the hovered element */}
                                <div className={`absolute bottom-0 ${arrowOffsets[hoveredSeverityKey]} transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-950 border-r border-b ${SEVERITY_TOOLTIP_DATA[hoveredSeverityKey].border}`} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* Minhas Legendas */}
                  <div className="flex justify-between items-center text-[8px] font-mono text-slate-500 border-t border-slate-850 pt-2.5">
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-600" /> Oficial ({prisons.reduce((acc, p) => acc + p.officialCapacity, 0)})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Operativa ({prisons.reduce((acc, p) => acc + p.operationalCapacity, 0)})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> Actual ({prisons.reduce((acc, p) => acc + p.currentOccupancy, 0)})
                    </span>
                  </div>
                </div>

                {/* Gestão de Risco Dinâmica */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-mono">
                      Perfis de Risco Dinâmicos (RiskProfile)
                    </h3>
                    <p className="text-xs text-slate-400">Classificação de segurança nacional para escoltas, movimentações e visitas no país.</p>
                  </div>

                  <div className="flex flex-col gap-3 font-mono text-xs">
                    <div className="bg-red-950/20 border border-red-500/20 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-600" />
                        <div>
                          <p className="font-bold text-red-400 text-xxs">MÁXIMA PERIGOSIDADE</p>
                          <p className="text-[10px] text-slate-400 font-sans leading-snug">Crimes graves, reincidentes violentos</p>
                        </div>
                      </div>
                      <span className="text-red-400 font-bold bg-red-500/10 px-2 py-0.5 rounded text-xxs">
                        {mockSumRisk("Máximo")} Reclusos
                      </span>
                    </div>

                    <div className="bg-orange-950/20 border border-orange-500/15 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-orange-500" />
                        <div>
                          <p className="font-bold text-orange-400 text-xxs">ALTO RISCO</p>
                          <p className="text-[10px] text-slate-400 font-sans leading-snug">Sob vigilância contínua armada</p>
                        </div>
                      </div>
                      <span className="text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded text-xxs">
                        {mockSumRisk("Alto")} Reclusos
                      </span>
                    </div>

                    <div className="bg-blue-950/20 border border-blue-500/15 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <div>
                          <p className="font-bold text-blue-400 text-xxs">MÉDIO RISCO</p>
                          <p className="text-[10px] text-slate-400 font-sans leading-snug">Regime comum, conduta instável</p>
                        </div>
                      </div>
                      <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded text-xxs">
                        {mockSumRisk("Médio")} Reclusos
                      </span>
                    </div>

                    <div className="bg-emerald-950/20 border border-emerald-500/15 p-3 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-emerald-500" />
                        <div>
                          <p className="font-bold text-emerald-400 text-xxs">BAIXO RISCO</p>
                          <p className="text-[10px] text-slate-400 font-sans leading-snug">Processados em atividades comuns</p>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-xxs">
                        {mockSumRisk("Baixo")} Reclusos
                      </span>
                    </div>
                  </div>

                  <div className="text-xxs text-slate-500 leading-snug border-t border-slate-800 pt-3 flex items-start gap-1.5 font-sans">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Calculado a partir do artigo de lei imposto no cadastramento. A alteração de risco exige ata fundamentada de diretor da unidade.</span>
                  </div>
                </div>

                {/* Inteligência Penitenciária e Avisos de Operação */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 font-mono flex items-center gap-2 animate-pulse">
                      <Shield className="h-4 w-4" /> Inteligência Penitenciária
                    </h3>
                    <span className="bg-red-500/10 text-red-400 text-xxs font-mono px-2 py-0.2 rounded border border-red-500/20">
                      SEC-LEVEL 4
                    </span>
                  </div>

                  <p className="text-xxs text-slate-400">Tentativas de fuga, motins ou conflitos vigiados de forma extremamente confidencial.</p>

                  <div className="flex flex-col gap-2 font-mono text-xxs text-slate-300">
                    <div className="bg-slate-950 p-2.5 border-l-2 border-red-500 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-200">Tentativa de Subversão</span>
                        <span className="text-[9px] text-red-400">Alto Alerta</span>
                      </div>
                      <p className="text-slate-400 text-[10px] mt-1 font-sans">Bloco B2 vigiado por possivel articulação entre líderes de celas.</p>
                      <span className="text-slate-500 text-[9px] mt-1 block">Registo: 12-06-2026 - Central Luanda</span>
                    </div>

                    <div className="bg-slate-950 p-2.5 border-l-2 border-amber-500 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-200">Sindicância de Armaria</span>
                        <span className="text-[9px] text-amber-400">Pendente</span>
                      </div>
                      <p className="text-slate-400 text-[10px] mt-1 font-sans">Controle de contagem de munições preventivas em Sanza Pombo com auditoria agendada.</p>
                      <span className="text-slate-500 text-[9px] mt-1 block">Registo: 10-06-2026 - Auditoria</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* DASHBOARD DE INTELIGÊNCIA & SEGURANÇA (PERFIS DE RISCO EM TEMPO REAL) */}
              <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-6 shadow-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-red-500 font-mono flex items-center gap-2">
                      <Shield className="h-5 w-5 text-red-500 animate-pulse" /> Inteligência & Segurança: Perfis de Risco em Tempo Real
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-sans">
                      Distribuição macro e micro dos níveis de perigosidade penal (Baixo, Médio, Alto, Máximo) sincronizados localmente e na nuvem.
                    </p>
                  </div>

                  {/* Filtro por Unidade Prisional */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                      <Filter className="h-3.5 w-3.5 text-amber-500" /> Filtrar Prisão:
                    </span>
                    <select
                      value={selectedRiskPrisonFilter}
                      onChange={(e) => setSelectedRiskPrisonFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500 cursor-pointer min-w-[220px]"
                    >
                      {currentOperator.role === "DIRECTOR_GERAL" ? (
                        <option value="ALL">Geral Nacional (Tudo)</option>
                      ) : currentOperator.role === "DIRECTOR_PROVINCIAL" ? (
                        <option value="ALL">Provincial Luanda (Completo)</option>
                      ) : null}
                      {visiblePrisons.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name.replace("Estabelecimento Penitenciário de", "EP")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  
                  {/* Left Side: Recharts Donut (Pie) Chart */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center relative bg-slate-950/40 p-4 border border-slate-800/50 rounded-xl">
                    <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-3xl font-black text-slate-100 font-mono">{totalFilteredInmates}</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold font-sans">Total Filtrado</span>
                    </div>
                    
                    <div className="h-64 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={riskDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={68}
                            outerRadius={88}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {riskDistribution.map((entry, index) => (
                              <ReCell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomDonutTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <p className="text-[10px] text-slate-500 font-sans italic text-center">
                      Passe o rato sobre os segmentos para ver o detalhamento operacional.
                    </p>
                  </div>

                  {/* Right Side: Detailed Breakdowns & Legend Cards */}
                  <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {riskDistribution.map((entry) => (
                      <div 
                        key={entry.name}
                        className="p-4 rounded-xl border flex flex-col gap-2 transition hover:bg-slate-950/30"
                        style={{ 
                          backgroundColor: `${entry.color}05`, 
                          borderColor: `${entry.color}20` 
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-2 text-xs font-bold font-sans uppercase tracking-wider text-slate-200">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            Controlo {entry.name}
                          </span>
                          <span 
                            className="text-xs font-mono font-bold px-2.5 py-0.5 rounded border"
                            style={{ 
                              color: entry.color, 
                              borderColor: `${entry.color}35`,
                              backgroundColor: `${entry.color}10`
                            }}
                          >
                            {entry.value} reclusos ({entry.percent}%)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                          {entry.desc}
                        </p>
                        
                        {/* Interactive miniature progress bar */}
                        <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-1">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${entry.percent}%`,
                              backgroundColor: entry.color
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* SECÇÃO DE DATA VISUALIZATION COM RECHARTS */}
              <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-6 shadow-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" /> Indicadores & Data Visualization (Business Intelligence)
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-sans">
                      Análise visual de tendências macro, monitorização de admissões prisionais mensais e rácio de conflitos disciplinares por estabelecimento.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleSimulateIncident}
                      className="px-3 py-1.5 text-xxs font-mono rounded bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/20 transition flex items-center gap-1.5 cursor-pointer text-red-0"
                    >
                      <AlertTriangle className="h-3 w-3 text-red-0" /> Simular Alerta Disciplinar
                    </button>
                    <div className="bg-slate-950 p-1 border border-slate-800 rounded flex gap-1 text-[10px] font-mono">
                      <button
                        onClick={() => setAdmissionChartMode("split")}
                        className={`px-2 py-0.5 rounded cursor-pointer transition ${
                          admissionChartMode === "split" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Categorias
                      </button>
                      <button
                        onClick={() => setAdmissionChartMode("total")}
                        className={`px-2 py-0.5 rounded cursor-pointer transition ${
                          admissionChartMode === "total" ? "bg-amber-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Total
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* CHART 1: HISTÓRICO DE ADMISSÕES */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center bg-slate-950/40 px-3 py-2 border border-slate-800/60 rounded">
                      <div>
                        <h3 className="text-xs font-semibold text-slate-200 font-sans">Tendência Histórica de Admissões por Mês</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Indicador de fluxo de acolhimento nos últimos 12 meses</p>
                      </div>
                      <span className="text-[10px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded">
                        Total Jun/26: {admissionsTrendData[11].preventivas + admissionsTrendData[11].condenacoes} Reclusos
                      </span>
                    </div>

                    <div className="h-72 w-full pr-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={admissionsTrendData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorPreventivas" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorCondenacoes" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis 
                            dataKey="month" 
                            stroke="#64748b" 
                            fontSize={9} 
                            tickLine={false}
                            fontFamily="JetBrains Mono, monospace"
                          />
                          <YAxis 
                            stroke="#64748b" 
                            fontSize={9} 
                            tickLine={false}
                            axisLine={false}
                            fontFamily="JetBrains Mono, monospace"
                          />
                          <Tooltip content={<CustomAdmissionsTooltip />} />
                          <Legend 
                            verticalAlign="top" 
                            height={36} 
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{
                              fontSize: "10px",
                              fontFamily: "Space Grotesk, sans-serif"
                            }}
                          />
                          {admissionChartMode === "split" ? (
                            <>
                              <Area 
                                type="monotone" 
                                name="Preventivas" 
                                dataKey="preventivas" 
                                stroke="#f59e0b" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorPreventivas)" 
                              />
                              <Area 
                                type="monotone" 
                                name="Condenações" 
                                dataKey="condenacoes" 
                                stroke="#3b82f6" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorCondenacoes)" 
                              />
                            </>
                          ) : (
                            <Area 
                              type="monotone" 
                              name="Total Admissões" 
                              dataKey={(row) => row.preventivas + row.condenacoes} 
                              stroke="#10b981" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorTotal)" 
                            />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* CHART 2: HISTÓRICO DE INCIDENTES DISCIPLINARES */}
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-950/40 px-3 py-2 border border-slate-800/60 rounded gap-2">
                      <div>
                        <h3 className="text-xs font-semibold text-slate-200 font-sans">Incidentes Disciplinares por Unidade</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Histórico consolidado de incidentes graves por prisão</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-mono bg-slate-950 text-slate-400 border border-slate-850 px-2 py-0.5 rounded">
                          Filtro Ativo: <strong className="text-amber-500">{disciplinarySeverityFilter}</strong>
                        </span>
                        <span className="text-[10px] font-mono bg-red-500/10 text-red-405 border border-red-500/20 px-2 py-0.5 rounded text-red-400">
                          Total Filtrado: {filteredIncidentsData.reduce((acc, curr) => acc + curr.Agressao + curr.Fuga + curr.PosseIlicita + curr.Indisciplina, 0)} Alertas
                        </span>
                      </div>
                    </div>

                    {/* Control Panel: Severity and Threat Type Toggles */}
                    <div className="bg-slate-900/25 border border-slate-900/60 p-3 rounded-xl flex flex-col gap-3">
                      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        {/* Severity Filter segment group */}
                        <div className="flex flex-col gap-1.5 w-full lg:w-auto">
                          <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider font-extrabold flex items-center gap-1">
                            <Sliders className="w-3 h-3 text-amber-500" /> Nível de Severidade (Severity Filter):
                          </span>
                          <div className="grid grid-cols-5 gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-850">
                            {[
                              { id: "ALL", label: "TODOS", color: "text-slate-400 hover:text-slate-200", activeBg: "bg-slate-800 text-slate-200 border-slate-700" },
                              { id: "LOW", label: "BAIXA", color: "text-blue-500 hover:text-blue-400", activeBg: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
                              { id: "MEDIUM", label: "MÉDIA", color: "text-amber-500 hover:text-amber-400", activeBg: "bg-amber-500/10 text-amber-405 border-amber-500/30" },
                              { id: "HIGH", label: "ALTA", color: "text-orange-500 hover:text-orange-400", activeBg: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
                              { id: "CRITICAL", label: "CRÍTICA", color: "text-red-500 hover:text-red-400", activeBg: "bg-red-500/10 text-red-400 border-red-500/30" },
                            ].map(btn => {
                              const isActive = disciplinarySeverityFilter === btn.id;
                              return (
                                <button
                                  key={btn.id}
                                  type="button"
                                  onClick={() => setDisciplinarySeverityFilter(btn.id as any)}
                                  className={`px-2 py-1 rounded text-[8px] font-bold font-mono transition duration-150 border cursor-pointer ${
                                    isActive 
                                      ? `${btn.activeBg} font-extrabold shadow-sm` 
                                      : `bg-transparent border-transparent text-slate-450 ${btn.color}`
                                  }`}
                                >
                                  {btn.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Threat Type Toggle Group */}
                        <div className="flex flex-col gap-1.5 w-full lg:w-auto">
                          <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider font-extrabold flex items-center gap-1">
                            <Shield className="w-3 h-3 text-red-500" /> Alternar Tipos de Ameaça (Toggle Types):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { key: "Agressao", label: "Agressões", colorClass: "bg-red-500/10 border-red-500/30 text-red-400", idleClass: "border-slate-850 hover:bg-slate-900/40 text-slate-600", dotColor: "bg-red-500" },
                              { key: "Fuga", label: "Fugas", colorClass: "bg-orange-500/10 border-orange-500/30 text-orange-400", idleClass: "border-slate-850 hover:bg-slate-900/40 text-slate-600", dotColor: "bg-orange-500" },
                              { key: "PosseIlicita", label: "Posse Ilícita", colorClass: "bg-purple-500/10 border-purple-500/30 text-purple-400", idleClass: "border-slate-850 hover:bg-slate-900/40 text-slate-600", dotColor: "bg-purple-500" },
                              { key: "Indisciplina", label: "Indisciplina", colorClass: "bg-blue-500/10 border-blue-500/30 text-blue-400", idleClass: "border-slate-850 hover:bg-slate-900/40 text-slate-600", dotColor: "bg-blue-500" },
                            ].map(type => {
                              const isEnabled = disciplinaryActiveTypes[type.key as keyof typeof disciplinaryActiveTypes];
                              return (
                                <button
                                  key={type.key}
                                  type="button"
                                  onClick={() => setDisciplinaryActiveTypes(prev => ({ ...prev, [type.key]: !prev[type.key as keyof typeof prev] }))}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-mono border cursor-pointer transition duration-150 select-none ${
                                    isEnabled ? `${type.colorClass} font-bold` : `${type.idleClass} line-through opacity-40`
                                  }`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${type.dotColor} ${isEnabled ? "animate-pulse" : "bg-slate-600 opacity-30"}`} />
                                  {type.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-72 w-full pr-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={filteredIncidentsData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis 
                            dataKey="unit" 
                            stroke="#64748b" 
                            fontSize={10} 
                            tickLine={false}
                            fontFamily="Space Grotesk, sans-serif"
                          />
                          <YAxis 
                            stroke="#64748b" 
                            fontSize={9} 
                            tickLine={false}
                            axisLine={false}
                            fontFamily="JetBrains Mono, monospace"
                          />
                          <Tooltip content={<CustomIncidentsTooltip />} />
                          <Legend 
                            verticalAlign="top" 
                            height={36} 
                            iconType="rect"
                            iconSize={8}
                            wrapperStyle={{
                              fontSize: "10px",
                              fontFamily: "Space Grotesk, sans-serif"
                            }}
                          />
                          {disciplinaryActiveTypes.Agressao && <Bar name="Agressões" dataKey="Agressao" fill="#ef4444" radius={[4, 4, 0, 0]} />}
                          {disciplinaryActiveTypes.Fuga && <Bar name="Tentativas de Fuga" dataKey="Fuga" fill="#f97316" radius={[4, 4, 0, 0]} />}
                          {disciplinaryActiveTypes.PosseIlicita && <Bar name="Posse Ilícita" dataKey="PosseIlicita" fill="#a855f7" radius={[4, 4, 0, 0]} />}
                          {disciplinaryActiveTypes.Indisciplina && <Bar name="Indisciplina Geral" dataKey="Indisciplina" fill="#3b82f6" radius={[4, 4, 0, 0]} />}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Hourly Heat Map Legend for Peak Incident Times */}
                    <div className="bg-slate-950/25 border border-slate-900 rounded-xl p-3.5 flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <h4 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                            Mapa Térmico de Horários (Pico de Ocorrências)
                          </h4>
                        </div>
                        <span className="text-[8.5px] text-slate-500 font-mono">
                          Fuso Horário Oficial (GMT+1) • Últimos 30 dias
                        </span>
                      </div>

                      {/* The Heatmap Grid */}
                      <div className="grid grid-cols-6 sm:grid-cols-12 md:grid-cols-24 gap-1.5 mt-1">
                        {[
                          { h: "00", v: 3, c: "bg-slate-900/40 border-slate-950 text-slate-500", desc: "Período calmo de repouso" },
                          { h: "01", v: 2, c: "bg-slate-900/40 border-slate-950 text-slate-500", desc: "Período calmo de repouso" },
                          { h: "02", v: 1, c: "bg-slate-900/40 border-slate-950 text-slate-500", desc: "Período calmo de repouso" },
                          { h: "03", v: 1, c: "bg-slate-900/40 border-slate-950 text-slate-500", desc: "Período calmo de repouso" },
                          { h: "04", v: 2, c: "bg-slate-900/40 border-slate-950 text-slate-500", desc: "Período calmo de repouso" },
                          { h: "05", v: 4, c: "bg-slate-900/40 border-slate-950 text-slate-500", desc: "Abertura parcial e rondas iniciais" },
                          { h: "06", v: 6, c: "bg-slate-900/40 border-slate-950 text-slate-500", desc: "Troca de turno operacional" },
                          { h: "07", v: 12, c: "bg-blue-500/10 border-blue-500/20 text-blue-400", desc: "Abertura das celas e pequeno-almoço" },
                          { h: "08", v: 18, c: "bg-blue-500/10 border-blue-500/20 text-blue-400", desc: "Início do expediente laboral interno" },
                          { h: "09", v: 24, c: "bg-amber-500/10 border-amber-500/20 text-amber-500", desc: "Movimentações para pátio e consultas" },
                          { h: "10", v: 32, c: "bg-amber-500/20 border-amber-500/30 text-amber-405 font-bold", desc: "Revistas sistemáticas de segurança" },
                          { h: "11", v: 45, c: "bg-red-500/10 border-red-500/20 text-red-405 font-bold animate-pulse", desc: "Pico de atividade: recreação pré-almoço" },
                          { h: "12", v: 28, c: "bg-amber-500/15 border-amber-500/25 text-amber-405", desc: "Rendição da guarda intermédia" },
                          { h: "13", v: 30, c: "bg-amber-500/20 border-amber-500/30 text-amber-405", desc: "Recluso pós-refeição nos pátios" },
                          { h: "14", v: 58, c: "bg-red-500/20 border-red-500/35 text-red-405 font-extrabold animate-pulse", desc: "Pico crítico: atividades ao ar livre / desporto" },
                          { h: "15", v: 64, c: "bg-red-500/25 border-red-500/40 text-red-500 font-extrabold animate-pulse", desc: "Pico máximo diário: encerramento e retorno às celas" },
                          { h: "16", v: 50, c: "bg-red-500/15 border-red-500/30 text-red-405 font-bold animate-pulse", desc: "Contagem geral vespertina de reclusos" },
                          { h: "17", v: 35, c: "bg-amber-500/20 border-amber-500/30 text-amber-405", desc: "Bloqueio primário de pavilhões" },
                          { h: "18", v: 26, c: "bg-blue-500/15 border-blue-500/25 text-blue-400", desc: "Distribuição do jantar" },
                          { h: "19", v: 22, c: "bg-blue-500/10 border-blue-500/20 text-blue-400", desc: "Trancamento definitivo de celas" },
                          { h: "20", v: 38, c: "bg-amber-500/15 border-amber-500/25 text-amber-450", desc: "Alta tensão inicial pós-lockdown" },
                          { h: "21", v: 41, c: "bg-amber-500/20 border-amber-500/30 text-amber-405 font-bold", desc: "Troca de guarda da noite" },
                          { h: "22", v: 15, c: "bg-blue-500/10 border-blue-500/20 text-blue-400", desc: "Silêncio geral regulamentar" },
                          { h: "23", v: 8, c: "bg-slate-900/40 border-slate-950 text-slate-500", desc: "Rondas preventivas de sentinelas" }
                        ].map((item, idx) => (
                          <div 
                            key={idx} 
                            className={`flex flex-col items-center justify-center p-1 sm:p-1.5 rounded border text-center transition cursor-help relative group ${item.c}`}
                            title={`${item.h}:00 - ${item.desc} (${item.v} incidentes)`}
                          >
                            <span className="text-[8px] font-bold font-mono tracking-tighter leading-none mb-0.5 sm:mb-1 block">
                              {item.h}h
                            </span>
                            <div className="w-2.5 h-1 md:w-3.5 md:h-1.5 rounded bg-current opacity-70 group-hover:opacity-100 transition-opacity" />
                            
                            {/* Hover tooltip code */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30 transition-all">
                              <div className="bg-slate-950 border border-slate-800 text-slate-200 text-[9px] font-mono p-2 rounded-lg shadow-xl whitespace-nowrap flex flex-col gap-1 items-start">
                                <span className="font-extrabold text-slate-100 text-[10px] border-b border-slate-800 pb-0.5 w-full flex justify-between gap-4">
                                  <span>Horário: {item.h}:00</span>
                                  <span className="text-amber-450">{item.v} Ocorrências</span>
                                </span>
                                <span className="text-slate-400 leading-normal text-xxs max-w-[180px] text-left">
                                  {item.desc}
                                </span>
                              </div>
                              <div className="w-1.5 h-1.5 bg-slate-950 border-r border-b border-slate-800 rotate-45 -mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Range Scale Indicators */}
                      <div className="flex items-center justify-between mt-1 text-[8.5px] font-mono text-slate-500 border-t border-slate-900/60 pt-2 flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-650 block uppercase font-bold text-[8px]">Incisões / Frequência:</span>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-slate-900 border border-slate-800 rounded-sm" /> Repouso (Silêncio)
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-blue-500/10 border border-blue-500/20 rounded-sm" /> Baixo
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-amber-500/20 border border-amber-500/30 rounded-sm" /> Moderado
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-red-500/25 border border-red-500/40 rounded-sm" /> Crítico
                            </span>
                          </div>
                        </div>
                        <span className="text-[8px] font-extrabold text-slate-450 bg-slate-950 border border-slate-900 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                          Mapeamento Horário Consolidadado
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: EXPLORADOR DE BANCO DE DADOS & ERD NACIONAL */}
          {activeTab === "erd" && (
            <motion.div
              key="erd-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              
              {/* Painel Esquerdo: Lista de Tabelas do ERD (Modelagem de Produção) */}
              <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-2">
                    <Database className="h-4 w-4" /> Dicionário de Dados PNAP
                  </h3>
                  <p className="text-xs text-slate-400">
                    O sistema nacional apoia-se em aproximadamente <strong>114 tabelas</strong> interligadas. Pesquise e filtre o modelo relacional abaixo:
                  </p>
                </div>

                {/* Filtro de Módulo e Pesquisa */}
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input 
                      type="text"
                      placeholder="Pesquisar Tabela ou Campo..."
                      value={searchTable}
                      onChange={(e) => setSearchTable(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.8 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-sans"
                    />
                    {searchTable && (
                      <button 
                        onClick={() => setSearchTable("")}
                        className="absolute right-2.5 top-2 text-xxs text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-xxs">
                    <select
                      value={selectedModule}
                      onChange={(e) => setSelectedModule(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none"
                    >
                      <option value="all">Ver Todos os Módulos ({TABLES_METADATA.length} demonstradas)</option>
                      <option value="core">Core & Sincronismo</option>
                      <option value="prisons">Prisões & Pavilhões</option>
                      <option value="cells">Celas</option>
                      <option value="users">Utilizadores & Audit</option>
                      <option value="inmates">Reclusos & Admissões</option>
                      <option value="judicial">Estatutos & Judicial</option>
                      <option value="incidents">Segurança & Incidentes</option>
                      <option value="documents">Documentos</option>
                    </select>

                    <select
                      value={erdFilterType}
                      onChange={(e) => setErdFilterType(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none"
                    >
                      <option value="all">Sem Filtros Especiais</option>
                      <option value="sync">Com Suporte Offline (IndexedDB)</option>
                      <option value="multitenant">Com Multi-Tenancy Ativo</option>
                      <option value="softdelete">Com Soft-Delete Histórico</option>
                    </select>
                  </div>
                </div>

                {/* Tables Grid List */}
                <div className="flex-1 max-h-[460px] overflow-y-auto flex flex-col gap-2 pr-1">
                  {filteredTables.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-600 font-mono">
                      Nenhuma tabela corresponde aos critérios selecionados.
                    </div>
                  ) : (
                    filteredTables.map((table) => {
                      const isSelected = selectedTable?.name === table.name;
                      return (
                        <button
                          key={table.name}
                          onClick={() => setSelectedTable(table)}
                          className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
                            isSelected
                              ? "bg-amber-500/10 border-amber-500/40 shadow-inner"
                              : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/90"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className={`font-mono text-xs font-semibold ${isSelected ? "text-amber-500" : "text-slate-200"}`}>
                              pnap_{table.name.toLowerCase()}
                            </span>
                            <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-sans">
                              {table.module}
                            </span>
                          </div>
                          
                          <p className="text-xxs text-slate-400 line-clamp-1">
                            {table.description}
                          </p>

                          <div className="flex gap-2 mt-1.5">
                            {table.hasMultiTenancy && (
                              <span className="text-[8px] bg-sky-950 text-sky-400 border border-sky-900 px-1 py-0.2 rounded font-mono leading-none">
                                Multi-Tenant
                              </span>
                            )}
                            {table.hasSoftDelete && (
                              <span className="text-[8px] bg-purple-950 text-purple-400 border border-purple-900 px-1 py-0.2 rounded font-mono leading-none">
                                Soft-Delete
                              </span>
                            )}
                            {table.hasOfflineSync && (
                              <span className="text-[8px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-1 py-0.2 rounded font-mono leading-none">
                                Sync Offline
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xxs text-slate-400 leading-normal flex flex-col gap-2">
                  <div className="font-semibold text-slate-300 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-emerald-500 animate-pulse" /> Padrões de Auditoria Unificados:
                  </div>
                  <p className="text-[10px]">
                    Todas as tabelas possuem as colunas de auditoria nativas: <code className="text-amber-500 font-mono">created_by_user_id</code>, <code className="text-amber-500 font-mono">is_deleted</code> e timestamps com controle por gatilhos PostgreSQL.
                  </p>
                </div>

              </div>

              {/* Painel Central: Visualização de Campos, FK/PK e Relações de Tabela Selecionada */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {selectedTable ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-5">
                    
                    {/* Table Summary Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xxs bg-amber-500/10 text-amber-500 font-mono px-2 py-0.5 rounded border border-amber-500/20">
                            TABELA SQL DEFINIDA
                          </span>
                          <span className="text-slate-600">|</span>
                          <span className="text-slate-400 text-xs font-mono uppercase">Módulo: {selectedTable.module}</span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-200 font-mono">
                          pnap_{selectedTable.name.toLowerCase()}
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          {selectedTable.description}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        {selectedTable.hasOfflineSync && (
                          <div className="bg-emerald-950/40 border border-emerald-900/60 p-2 rounded-lg flex flex-col items-center justify-center font-mono text-center">
                            <Wifi className="h-4 w-4 text-emerald-400 mb-0.5" />
                            <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">OFFLINE SYNC</span>
                            <span className="text-[8px] text-slate-500">IndexedDB Ativa</span>
                          </div>
                        )}
                        
                        {selectedTable.hasMultiTenancy && (
                          <div className="bg-sky-950/40 border border-sky-900/60 p-2 rounded-lg flex flex-col items-center justify-center font-mono text-center">
                            <Lock className="h-4 w-4 text-sky-400 mb-0.5" />
                            <span className="text-[8px] text-sky-400 font-bold uppercase tracking-wider">SECURE GROUP</span>
                            <span className="text-[8px] text-slate-500">Multi-Tenancy</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Columns Metadata Table */}
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                        Atributos e Especificações de Colunas
                      </h3>
                      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
                        <table className="w-full text-left border-collapse text-xxs font-mono">
                          <thead>
                            <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400">
                              <th className="p-2.5">Nome da Coluna</th>
                              <th className="p-2.5">Tipo de Dados</th>
                              <th className="p-2.5 text-center">Restrição</th>
                              <th className="p-2.5 text-center">Nulo</th>
                              <th className="p-2.5">Descrição Humana</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {selectedTable.columns.map(col => (
                              <tr key={col.name} className="hover:bg-slate-900/40 text-slate-300">
                                <td className="p-2.5 font-bold text-amber-500">{col.name}</td>
                                <td className="p-2.5 text-slate-400 text-xxs">{col.type}</td>
                                <td className="p-2.5 text-center">
                                  {col.isPK && (
                                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] px-1.5 py-0.2 rounded font-semibold font-mono">
                                      PK
                                    </span>
                                  )}
                                  {col.isFK && (
                                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] px-1.5 py-0.2 rounded font-semibold font-mono" title={`Aponta para ${col.fkTarget}`}>
                                      FK → {col.fkTarget}
                                    </span>
                                  )}
                                  {!col.isPK && !col.isFK && <span className="text-slate-600">-</span>}
                                </td>
                                <td className="p-2.5 text-center text-slate-500">
                                  {col.isNullable ? "Sim" : "Não"}
                                </td>
                                <td className="p-2.5 text-slate-400 font-sans leading-snug">{col.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Relationships Panel */}
                    {selectedTable.relationships && selectedTable.relationships.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">
                          Relações de Cardinalidade (ERD Nacional)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {selectedTable.relationships.map((rel, idx) => (
                            <div key={idx} className="bg-slate-950 p-3 border border-slate-800 rounded-lg flex items-center justify-between font-mono text-xxs">
                              <div>
                                <span className="text-slate-500">pnap_{selectedTable.name.toLowerCase()}</span>
                                <div className="flex items-center gap-2 my-1">
                                  <span className="bg-slate-900 border border-slate-850 px-2 py-0.5 text-amber-500 font-bold rounded">
                                    {rel.cardinality}
                                  </span>
                                  <span className="text-slate-400">relacionado com</span>
                                </div>
                                <span className="font-semibold text-slate-200">pnap_{rel.targetTable.toLowerCase()}</span>
                              </div>
                              <p className="text-slate-400 text-xxs font-sans text-right max-w-44 leading-snug">
                                {rel.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Multi-Tenant Security & Soft Delete Section details */}
                    <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg flex flex-col gap-2 leading-relaxed">
                      <div className="text-xxs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-sky-500" />
                        Garantia de Isolamento Multi-Tenancy (Multi-Tenant institucional)
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans">
                        Este banco de dados opera em modo multi-empresa institucional. Quando um utilizador do Estabelecimento Penitenciário de Viana acede a esta tabela, o PostgreSQL interseta dinamicamente a consulta <code className="text-amber-500">WHERE establishment_id = 'PRIS-01'</code>. Evitando de forma absoluta vazamentos e acessos indevidos inter-provinciais.
                      </p>
                    </div>

                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500 font-mono">
                    Selecione uma tabela no dicionário para inspecionar os atributos relacionais e regras de integridade física.
                  </div>
                )}

                {/* SQL DDL Live Viewer & Console Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">
                        Console de Integração SQL (Código de Produção PostgreSQL)
                      </h3>
                      <p className="text-xxs text-slate-400 font-sans">DDL integral gerado para o PostgreSQL com índices e chaves primárias mapeadas.</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(fullSqlDdl);
                        alert("Código SQL DDL copiado para transferência! Pronto para colar no PostgreSQL.");
                      }}
                      className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1 text-xs rounded font-mono cursor-pointer transition flex items-center gap-1"
                    >
                      <FileCode className="h-3 w-3" /> Copiar Código DDL SQL
                    </button>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xxs text-slate-300 max-h-48 overflow-y-auto whitespace-pre leading-relaxed select-all">
                    {fullSqlDdl}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 3: ADMISSÃO E CADASTRAMENTO (Sincronizado com Penal Code) */}
          {activeTab === "admissions" && (
            <motion.div
              key="admissions-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              
              {/* Form de Matrícula Dinâmica de Novo Recluso */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                
                <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-2">
                       Novo Boletim de Admissão Prisional
                    </h2>
                    <p className="text-xs text-slate-400">
                      Entrada formal certificada. Os dados são estruturados segundo o artigo penal do crime.
                    </p>
                  </div>
                  
                  {/* Network Indicator Control inside forms */}
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsOnline(!isOnline)}
                      className={`px-3 py-1 text-[10px] font-mono rounded cursor-pointer border flex items-center gap-1.5 transition ${
                        isOnline 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-amber-500/15 border-amber-500/40 text-amber-400 animate-pulse"
                      }`}
                    >
                      {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                      {isOnline ? "OPERANDO ONLINE" : "CONTINGÊNCIA OFFLINE"}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleRegisterInmate} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  
                  {/* Nome Completo do Preso */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-300 font-semibold font-mono text-[10px] uppercase">Nomes (Primeiro e Médio):</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFormChange}
                      required
                      placeholder="Manuel Domingos"
                      className="bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none p-2.5 rounded text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-300 font-semibold font-mono text-[10px] uppercase">Apelido (Sobrenomes):</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFormChange}
                      required
                      placeholder="João Sebastião"
                      className="bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none p-2.5 rounded text-white"
                    />
                  </div>

                  {/* BI / Identidade */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-300 font-semibold font-mono text-[10px] uppercase">Nº Bilhete de Identidade (BI Angola):</label>
                    <input 
                      type="text" 
                      name="idCard"
                      value={formData.idCard}
                      onChange={handleFormChange}
                      placeholder="002847192LA049"
                      className="bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none p-2.5 rounded text-white font-mono uppercase"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-300 font-semibold font-mono text-[10px] uppercase">Data de Nascimento:</label>
                    <input 
                      type="date" 
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleFormChange}
                      className="bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none p-2.5 rounded text-white font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-300 font-semibold font-mono text-[10px] uppercase">Género Biológico:</label>
                    <select 
                      name="gender" 
                      value={formData.gender}
                      onChange={handleFormChange}
                      className="bg-slate-950 border border-slate-800 focus:outline-none p-2.5 rounded text-white"
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Prefere Não Declarar</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-300 font-semibold font-mono text-[10px] uppercase">Nacionalidade Originária:</label>
                    <input 
                      type="text" 
                      name="nationality" 
                      value={formData.nationality}
                      onChange={handleFormChange}
                      placeholder="Angolana"
                      className="bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none p-2.5 rounded text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-300 font-semibold font-mono text-[10px] uppercase">Nome Completo do Pai:</label>
                    <input 
                      type="text" 
                      name="fatherName" 
                      value={formData.fatherName}
                      onChange={handleFormChange}
                      placeholder="Domingos João"
                      className="bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none p-2.5 rounded text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-300 font-semibold font-mono text-[10px] uppercase">Nome Completo da Mãe:</label>
                    <input 
                      type="text" 
                      name="motherName" 
                      value={formData.motherName}
                      onChange={handleFormChange}
                      placeholder="Amélia António Domingos"
                      className="bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-none p-2.5 rounded text-white cursor-pointer"
                    />
                  </div>

                  {/* CRIME DO CÓDIGO PENAL ANGOLANO - GATILHO DA AUTOMATIZAÇÃO */}
                  <div className="md:col-span-2 bg-slate-950 p-4 border border-slate-800 rounded-lg flex flex-col gap-3.5">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-amber-500 font-semibold uppercase text-xxs">
                        Selecção de Crime Regulamentado (Novo Código Penal 2021)
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium">Gera Ubicação e Risco</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-slate-400 text-xxs font-mono">Pesquisar e Selecionar Infracção Legal:</label>
                      <select
                        name="crimeId"
                        value={formData.crimeId}
                        onChange={handleFormChange}
                        className="bg-slate-900 border border-slate-750 p-2.5 text-slate-100 focus:outline-none text-xs"
                      >
                        <optgroup label="Grupo A - Crimes Contra as Pessoas">
                          {PENAL_CODE_GROUPS.grupA.crimes.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.article}: {c.name} ({c.penaltyRange})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Grupo B - Crimes Contra o Património">
                          {PENAL_CODE_GROUPS.grupB.crimes.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.article}: {c.name} ({c.penaltyRange})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Grupo C - Crimes Contra a Ordem e Tranquilidade Pública">
                          {PENAL_CODE_GROUPS.grupC.crimes.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.article}: {c.name} ({c.penaltyRange})
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    {/* Automatism Feedback Output Area */}
                    {computedAdmission && (
                      <div className="bg-slate-900/90 border border-slate-800 p-3 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="font-mono text-xxs">
                          <p className="text-slate-400 uppercase tracking-widest text-[9px]">Gatilho de Ubicação:</p>
                          <p className="text-slate-200 mt-0.5">
                            Categoria: <span className="text-slate-200 font-bold">{computedAdmission.crimeGroup}</span>
                          </p>
                          <p className="text-slate-300 mt-0.5">
                            Pena Estatutária Estabelecida: <span className="text-amber-500 font-bold">{computedAdmission.penaltyRange}</span>
                          </p>
                        </div>

                        <div className="flex flex-col gap-1 items-end shrink-0 font-mono text-right">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xxs text-slate-400">Risco Calculado:</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.2 rounded border ${
                              computedAdmission.riskLevel === "Máximo" ? "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse" :
                              computedAdmission.riskLevel === "Alto" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                              computedAdmission.riskLevel === "Médio" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                              "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}>
                              {computedAdmission.riskLevel}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xxs text-slate-400">Cela Recomendada:</span>
                            <span className="text-[10px] text-slate-300 font-semibold">
                              {computedAdmission.suggestedCellType}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ESTABELECIMENTO PENITENCIÁRIO DE ACOLHIMENTO */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-slate-300 font-semibold font-mono text-[10px] uppercase">Unidade Penitenciária Destinatária:</label>
                    <select 
                      name="assignedPrisonId"
                      value={formData.assignedPrisonId}
                      onChange={handleFormChange}
                      className="bg-slate-950 border border-slate-800 p-2.5 rounded text-white"
                    >
                      {visiblePrisons.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.location})</option>
                      ))}
                    </select>
                  </div>

                  {/* SUGGEST RECLUSION LOCATION */}
                  {computedAdmission && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-300 font-semibold font-mono text-[10px] uppercase">
                        Distribuição Física e Chave de Cela Sugeridos:
                      </label>
                      <div className="bg-slate-950 border border-slate-800 p-2 rounded text-slate-300 font-mono flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                          <span className="font-semibold text-slate-100">
                            {computedAdmission.cellNumber}
                          </span>
                        </div>
                        <span className="text-[9px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-slate-400 rounded">
                          Capacidade Validada
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Fotografia Mugshot do Recluso */}
                  <div className="md:col-span-2 bg-slate-950 p-4 border border-slate-800 rounded-lg flex flex-col gap-3">
                    <span className="font-mono text-amber-500 font-semibold uppercase text-xxs flex items-center gap-1.5">
                      <Camera className="h-3.5 w-3.5 text-amber-500" /> Registo Biométrico - Fotografia de Identificação (Mugshot)
                    </span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Left side: Drag and Drop Upload Zone */}
                      <div className="md:col-span-9">
                        <label 
                          htmlFor="inmate-form-photo-upload"
                          className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 hover:border-amber-500/50 bg-slate-900/40 hover:bg-slate-900/80 rounded-lg p-5 cursor-pointer transition text-center group"
                        >
                          <UploadCloud className="h-7 w-7 text-slate-500 group-hover:text-amber-500 transition mb-2" />
                          <p className="text-xxs font-mono text-slate-350 font-bold uppercase tracking-wider group-hover:text-amber-400">
                            Arrastar Foto ou Clicar para Carregar
                          </p>
                          <p className="text-[10px] text-slate-550 mt-1">
                            Formatos PNG, JPG ou JPEG (Sugerido proporção 3:4)
                          </p>
                        </label>
                        <input 
                          id="inmate-form-photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData(prev => ({
                                  ...prev,
                                  photo: reader.result as string
                                }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </div>

                      {/* Right side: Live Preview Thumbnail */}
                      <div className="md:col-span-3 flex flex-col items-center justify-center p-2 border border-slate-850 rounded bg-slate-900/60 min-h-[110px]">
                        {formData.photo ? (
                          <div className="relative group w-20 h-24 border border-amber-500/30 rounded overflow-hidden shadow-md">
                            <img 
                              src={formData.photo} 
                              alt="Mugshot Preview" 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, photo: "" }))}
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-0.5 text-[8px] font-bold cursor-pointer uppercase font-mono px-1 shadow transition"
                              title="Remover Foto"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-20 h-24 border border-dashed border-slate-800 rounded bg-slate-950 font-mono text-[9px] text-slate-650">
                            <Camera className="h-5 w-5 text-slate-700 mb-1" />
                            <span>SEM FOTO</span>
                            <span className="text-[8px] text-slate-800">MUGSHOT</span>
                          </div>
                        )}
                        <span className="text-[9px] font-mono text-slate-500 mt-2">Visualização</span>
                      </div>
                    </div>
                  </div>

                  {/* Submission buttons */}
                  <div className="md:col-span-2 pt-4 border-t border-slate-820 mt-2 flex flex-col md:flex-row justify-between items-center gap-4">
                    <span className="text-xxs text-slate-500 font-sans tracking-wide text-center md:text-left leading-snug">
                      * Ao submeter, o sistema criará logicamente o registo, descontando as vagas da cela correspondente a nível nacional, gerando guias automáticas assinadas digitalmente.
                    </span>
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-2.5 rounded-lg font-sans text-xs tracking-wider uppercase cursor-pointer shadow-lg hover:shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center gap-2 font-semibold"
                    >
                      <UserCheck className="h-4 w-4" />
                      {isOnline ? "Confirmar Admissão Central" : "Enfileirar Transação Offline"}
                    </button>
                  </div>

                </form>

              </div>

              {/* Lista Prisional em Volátil e Fila de IndexedDB */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Visualização de fila de Sincronismo (IndexedDB) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-1.5">
                        <RefreshCw className="h-3.5 w-3.5 text-amber-500" /> Fila de Sincronismo Offline (IndexedDB)
                      </h3>
                      <p className="text-xxs text-slate-400 font-sans">Ações capturadas localmente antes do push final.</p>
                    </div>
                    <span className="bg-slate-950 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-800 text-xxs">
                      Qtd: {syncQueue.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                    {syncQueue.length === 0 ? (
                      <div className="text-center py-6 text-xxs text-slate-600 font-mono">
                        Nenhuma transação enfileirada no IndexedDB local.
                      </div>
                    ) : (
                      syncQueue.map(item => (
                        <div key={item.id} className="bg-slate-950 p-2.5 border border-slate-850 rounded flex items-center justify-between text-xxs font-mono">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] px-1.5 py-0.2 rounded">
                                {item.type}
                              </span>
                              <span className="text-slate-300 font-semibold">{item.id}</span>
                            </div>
                            <p className="text-slate-400 text-[10px] mt-1 font-sans leading-tight">{item.description}</p>
                          </div>
                          <span className="text-[9px] font-semibold text-amber-400/80 uppercase animate-pulse">Pendente</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* CONFIGURAÇÃO E MONITORIZAÇÃO DO SYNC EM SEGUNDO PLANO */}
                  <div className="border-t border-slate-800/80 pt-4 mt-2 flex flex-col gap-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                          <Activity className={`h-3.5 w-3.5 ${backgroundSyncEnabled && !isOnline ? "text-amber-500 animate-pulse" : "text-slate-400"}`} />
                          Sincronização em Segundo Plano (VSAT)
                        </span>
                        <span className="text-[10px] text-slate-500 font-sans mt-0.5 leading-tight">
                          Tentativas automáticas em conexões satélite instáveis.
                        </span>
                      </div>
                      
                      {/* Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => setBackgroundSyncEnabled(!backgroundSyncEnabled)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          backgroundSyncEnabled ? "bg-amber-500" : "bg-slate-800"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                            backgroundSyncEnabled ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Countdown indicator / Reconnection diagnostics */}
                    {backgroundSyncEnabled && (
                      <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-850 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between text-xxs font-mono">
                          <span className="text-slate-400">Estado de Sincronismo:</span>
                          {isOnline ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                              Em Linha
                            </span>
                          ) : isReconnecting ? (
                            <span className="text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                              <RefreshCw className="h-3 w-3 animate-spin text-amber-500" />
                              Tentando reconexão...
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">Tentativa automática em:</span>
                              <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.2 rounded font-bold">
                                {bgSyncCountdown}s
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Progress Retrocesso Visual */}
                        {!isOnline && (
                          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden relative border border-slate-800/40">
                            {isReconnecting ? (
                              <div className="h-full bg-amber-500 rounded-full animate-pulse w-full"></div>
                            ) : (
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                                style={{ width: `${(bgSyncCountdown / 30) * 100}%` }}
                              ></div>
                            )}
                          </div>
                        )}

                        {/* Manual / Reconnection Control */}
                        {!isOnline && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleAutomaticReconnectionAttempt}
                              disabled={isReconnecting}
                              className="w-full py-1.5 text-center font-mono text-[10px] uppercase rounded border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 cursor-pointer disabled:opacity-50 transition"
                            >
                              {isReconnecting ? "Testando ligação..." : "Forçar Reconexão Agora"}
                            </button>
                          </div>
                        )}

                        {/* Tiny logs list */}
                        <div className="flex flex-col gap-1 border-t border-slate-900 pt-2">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Consola do Agente VSAT (Tempo Real):</span>
                          <div className="font-mono text-[9px] text-slate-400 max-h-24 overflow-y-auto leading-relaxed flex flex-col gap-1 pr-1 bg-slate-950 p-2 rounded border border-slate-900">
                            {bgSyncLogs.slice(0, 4).map((log, ix) => (
                              <p key={ix} className={log.includes("✅") ? "text-emerald-400" : log.includes("❌") ? "text-red-400" : "text-slate-400"}>
                                {log}
                              </p>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                </div>

                {/* Ultimos Reclusos Cadastrados Na Plataforma */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 flex-wrap gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                      População Prisional Recente (Presentes)
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = visibleInmates.filter((inm) => {
                            if (!admissionsSearchQuery) return true;
                            const query = admissionsSearchQuery.toLowerCase().trim();
                            const fullName = `${inm.firstName} ${inm.lastName}`.toLowerCase();
                            const biNum = (inm.idCard || "").toLowerCase();
                            const idNum = (inm.id || "").toLowerCase();
                            const prName = (prisons.find(p => p.id === inm.assignedPrisonId)?.name || "").toLowerCase();
                            
                            return fullName.includes(query) || biNum.includes(query) || idNum.includes(query) || prName.includes(query);
                          });
                          exportInmateListToPDF(filtered, admissionsSearchQuery, prisons, currentOperatorId);
                        }}
                        className="px-2.5 py-1 text-[10px] font-mono rounded cursor-pointer border bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 active:scale-95 transition flex items-center gap-1.5"
                        title="Exportar Lista Filtrada de Reclusos (PDF)"
                      >
                        <Download className="h-3 w-3" />
                        Exportar Lista (PDF)
                      </button>
                      <span className="text-xxs bg-slate-950 text-slate-400 px-2.5 py-1 rounded border border-slate-850 font-mono">
                        {admissionsSearchQuery 
                          ? `${visibleInmates.filter(inm => {
                              const query = admissionsSearchQuery.toLowerCase().trim();
                              const fullName = `${inm.firstName} ${inm.lastName}`.toLowerCase();
                              const biNum = (inm.idCard || "").toLowerCase();
                              const idNum = (inm.id || "").toLowerCase();
                              const prName = (prisons.find(p => p.id === inm.assignedPrisonId)?.name || "").toLowerCase();
                              return fullName.includes(query) || biNum.includes(query) || idNum.includes(query) || prName.includes(query);
                            }).length} de ` 
                          : ""}Total: {visibleInmates.length} Reclusos
                      </span>
                    </div>
                  </div>

                  {/* Real-time search bar */}
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-500">
                      <Search className="h-3.5 w-3.5" />
                    </span>
                    <input
                      id="admissions-search-input"
                      type="text"
                      placeholder="Pesquisar por Nome, BI, RNR ou Unidade..."
                      value={admissionsSearchQuery}
                      onChange={(e) => setAdmissionsSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none transition-all duration-300 pl-9 pr-14 py-2 rounded text-xs text-slate-300 placeholder-slate-500 font-sans shadow-inner"
                    />
                    {admissionsSearchQuery && (
                      <button
                        type="button"
                        id="admissions-search-clear-button"
                        onClick={() => setAdmissionsSearchQuery("")}
                        className="absolute right-3 text-slate-500 hover:text-slate-300 text-[10px] uppercase font-mono font-bold cursor-pointer"
                      >
                        Limpar
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
                    {(() => {
                      const filteredInmatesForAdmissions = visibleInmates.filter((inm) => {
                        if (!admissionsSearchQuery) return true;
                        const query = admissionsSearchQuery.toLowerCase().trim();
                        const fullName = `${inm.firstName} ${inm.lastName}`.toLowerCase();
                        const biNum = (inm.idCard || "").toLowerCase();
                        const idNum = (inm.id || "").toLowerCase();
                        const prName = (prisons.find(p => p.id === inm.assignedPrisonId)?.name || "").toLowerCase();
                        
                        return fullName.includes(query) || biNum.includes(query) || idNum.includes(query) || prName.includes(query);
                      });

                      if (filteredInmatesForAdmissions.length === 0) {
                        return (
                          <div className="text-center py-8 text-xxs text-slate-550 font-mono">
                            Nenhum recluso corresponde à pesquisa.
                          </div>
                        );
                      }

                      return filteredInmatesForAdmissions.map((inm) => {
                        const prName = prisons.find(p => p.id === inm.assignedPrisonId)?.name.replace("Estabelecimento Penitenciário de ", "") || "Viana";
                        return (
                          <div 
                            key={inm.id}
                            className="bg-slate-950 p-3 border border-slate-800 rounded-lg flex flex-col justify-between gap-2.5 hover:border-slate-700 transition"
                          >
                            <div className="flex gap-3 items-start">
                              {/* Inmate Photo Thumbnail / Mugshot with direct upload capability */}
                              <div className="shrink-0 relative">
                                <label 
                                  htmlFor={`card-photo-upload-${inm.id}`}
                                  className="block w-14 h-16 border border-slate-800 rounded overflow-hidden cursor-pointer relative group bg-slate-900 shadow hover:border-amber-500/55 transition duration-200"
                                  title="Clique para carregar/substituir a fotografia do recluso"
                                >
                                  {inm.photo ? (
                                    <img 
                                      src={inm.photo} 
                                      alt={`${inm.firstName} Mugshot`} 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center font-mono text-[7px] text-slate-600 bg-slate-950">
                                      <Camera className="h-4.5 w-4.5 text-slate-700 group-hover:text-amber-500 transition-colors mb-0.5" />
                                      <span>MUGSHOT</span>
                                    </div>
                                  )}
                                  
                                  {/* Soft camera icon overlay on hover */}
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-150 flex flex-col items-center justify-center text-[7px] font-mono text-amber-400 font-bold">
                                    <Camera className="h-4 w-4 mb-0.5" />
                                    <span>ALTERAR</span>
                                  </div>
                                </label>
                                <input 
                                  id={`card-photo-upload-${inm.id}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        handleUploadInmatePhoto(inm.id, reader.result as string);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </div>

                              {/* Details text on the right */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1">
                                  <p className="text-xs font-bold text-slate-100 font-sans truncate pr-1">
                                    {highlightMatch(`${inm.firstName} ${inm.lastName}`, admissionsSearchQuery)}
                                  </p>
                                  <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border shrink-0 ${
                                    inm.status === "PENDING_SYNC" 
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse" 
                                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  }`}>
                                    {inm.status === "PENDING_SYNC" ? "Offline" : "Activo"}
                                  </span>
                                </div>
                                <p className="text-xxs text-slate-400 font-mono mt-1">
                                  BI: <span className="text-slate-300">{highlightMatch(inm.idCard, admissionsSearchQuery)}</span>
                                </p>
                                <p className="text-xxs text-slate-500 font-mono">
                                  RNR: <span className="text-slate-400">{highlightMatch(inm.id, admissionsSearchQuery)}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-4 text-xxs font-mono text-slate-400 border-t border-slate-900 pt-2 flex-wrap">
                              <div>
                                Risco: <span className="text-amber-500 font-semibold">{inm.riskLevel}</span>
                              </div>
                              <div>
                                Prisão: <span className="text-slate-300 font-semibold">{highlightMatch(prName, admissionsSearchQuery)}</span>
                              </div>
                              <div>
                                Cela: <span className="text-slate-300 font-semibold">{inm.assignedCellNumber}</span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center bg-slate-900/60 p-2 rounded text-[10px] font-mono border border-slate-850">
                              <span className="text-slate-400 text-[9px]">Selo Digital:</span>
                              <button
                                onClick={() => {
                                  setSelectedDocumentCode(inm.documentCode);
                                  setActiveTab("documents");
                                }}
                                className="text-amber-500 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                {inm.documentCode} <ExternalLink className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Quick Interactive Modifications Actions */}
                            <div className="border-t border-dashed border-slate-800 pt-2 flex flex-col gap-2">
                              <div className="flex items-center justify-between gap-2.5 text-[10px]">
                                <span className="text-slate-500 font-mono">Transferir para:</span>
                                <select
                                  value={inm.assignedPrisonId}
                                  onChange={(e) => handleTransferInmate(inm.id, e.target.value)}
                                  className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-350 font-mono focus:outline-none focus:border-amber-500 cursor-pointer w-[150px]"
                                >
                                  {visiblePrisons.map((pr) => (
                                    <option key={pr.id} value={pr.id}>
                                      {pr.name.replace("Estabelecimento Penitenciário de ", "EP ")}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-center justify-between gap-2.5 text-[10px]">
                                <span className="text-slate-500 font-mono">Alterar Grau de Risco:</span>
                                <select
                                  value={inm.riskLevel}
                                  onChange={(e) => handleEditRiskInmate(inm.id, e.target.value)}
                                  className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-slate-350 font-mono focus:outline-none focus:border-amber-500 cursor-pointer w-[150px]"
                                >
                                  <option value="Baixo">Baixo</option>
                                  <option value="Médio">Médio</option>
                                  <option value="Alto">Alto</option>
                                  <option value="Máximo">Máximo</option>
                                </select>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => exportInmateFichaToPDF(inm, prisons, currentOperatorId)}
                              className="w-full mt-1 py-1.5 bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-350 hover:text-amber-400 rounded text-xxs font-mono flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                              title="Descarregar Ficha de Custódia Individual em PDF"
                            >
                              <Printer className="h-3.5 w-3.5 text-amber-500" />
                              Descarregar Ficha (PDF)
                            </button>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 4: MÓDULO DE DOCUMENTOS (apps/documents) & VALIDADOR QR */}
          {activeTab === "documents" && (
            <motion.div
              key="documents-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              
              {/* Seleção do Template e Visualização Geral */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-3">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-1.5">
                       Módulos de Documentação Automática (apps/documents)
                    </h2>
                    <p className="text-xs text-slate-400 font-sans">
                      Motor de templates regulamentado para confecção imediata de expedientes prisionais com QR Code e Hash SHA-256.
                    </p>
                  </div>

                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 text-slate-100 p-2 rounded text-xs text-slate-300"
                  >
                    <option value="internamento">Modelo: Guia de Internamento</option>
                    <option value="soltura">Modelo: Guia de Soltura</option>
                    <option value="transferencia">Modelo: Ordem de Transferência</option>
                    <option value="disciplina">Modelo: Relatório Disciplinar</option>
                  </select>
                </div>

                {/* Selecione o Recluso de Exemplo para Emissão */}
                <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xxs">
                  <div>
                    <span className="text-slate-400">Emissão Dinâmica a partir do Cadastro:</span>
                    <p className="text-slate-200 mt-0.5">Selecione para popular o template abaixo:</p>
                  </div>

                  <select
                    value={selectedDocumentCode}
                    onChange={(e) => setSelectedDocumentCode(e.target.value)}
                    className="bg-slate-900 border border-slate-800 p-1.8 text-slate-100 rounded focus:outline-none"
                  >
                    {visibleInmates.map(i => (
                      <option key={i.id} value={i.documentCode}>
                        {i.firstName} {i.lastName} (RNR: {i.id} | BI: {i.idCard})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Abas da Visualização de Detalhes do Recluso */}
                <div className="flex border-b border-slate-800">
                  <button
                    type="button"
                    onClick={() => setInmateDetailsSubTab("document")}
                    className={`px-4 py-2.5 text-xs font-bold font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer border-r border-slate-800 ${
                      inmateDetailsSubTab === "document"
                        ? "bg-slate-900 text-amber-500 border-t-2 border-t-amber-500"
                        : "bg-slate-950/45 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    DOCUMENTO OFICIAL ({selectedTemplate.toUpperCase()})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInmateDetailsSubTab("timeline")}
                    className={`px-4 py-2.5 text-xs font-bold font-mono tracking-wider transition-all flex items-center gap-2 cursor-pointer border-r border-slate-800 ${
                      inmateDetailsSubTab === "timeline"
                        ? "bg-slate-900 text-amber-500 border-t-2 border-t-amber-500"
                        : "bg-slate-950/45 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Activity className="h-4 w-4" />
                    CRONOLOGIA DE MOVIMENTOS
                  </button>
                </div>

                {/* SUBTAB CONTENT 1: DOCUMENT PLAN */}
                {inmateDetailsSubTab === "document" && (
                  <div className="bg-gradient-to-b from-white to-slate-100 text-slate-900 p-8 rounded-lg shadow-2xl border-4 border-slate-700/60 font-sans tracking-normal relative overflow-hidden select-all max-h-[560px] overflow-y-auto">
                    
                    {/* Background Watermark/Elegance */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                      <Shield className="h-96 w-96 text-slate-900" />
                    </div>

                    {/* Header Oficial do Documento */}
                    <div className="text-center flex flex-col items-center gap-1 border-b-2 border-slate-900 pb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">REPÚBLICA DE ANGOLA</span>
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-900">MINISTÉRIO DO INTERIOR</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">PROCURADORIA GERAL / SERVIÇOS PENITENCIÁRIOS</span>
                      <div className="h-1.5 w-16 bg-red-600 mt-2" />
                      
                      <h3 className="text-md font-black uppercase text-slate-900 mt-4 tracking-tighter">
                        {selectedTemplate === "internamento" ? "GUIA DE ADMISSÃO E INTERNAMENTO PRISIONAL" :
                         selectedTemplate === "soltura" ? "ALVARÁ E GUIA DE SOLTURA IMEDIATA" :
                         selectedTemplate === "transferencia" ? "ORDEM DE TRANSFERÊNCIA INTER-PRISIONAL" :
                         "RELATÓRIO DE INFRAÇÃO E CONSELHO DISCIPLINAR"}
                      </h3>
                    </div>

                    {/* Document Body Content */}
                    <div className="py-6 flex flex-col gap-4 font-sans text-xs text-slate-800 leading-relaxed">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          Chave Digital: <span className="font-mono font-bold text-slate-900">{selectedDocumentCode}</span>
                        </div>
                        <div className="text-right">
                          Data de Registro: <span className="font-semibold text-slate-900">13 de Junho de 2026</span>
                        </div>
                      </div>

                      <p>
                        Para uso exclusivo das autoridades policiais e guardas prisionais de Angola. Fica lavrado sob responsabilidade e chancela nacional o seguinte registo oficial:
                      </p>

                      {/* Meta Box Informative */}
                      <div className="bg-white/95 border-2 border-slate-300 p-4 rounded flex flex-col gap-2 shadow-inner">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-slate-500 block uppercase text-[10px]">RECLUSO NOTIFICADO:</span>
                            <span className="font-bold text-slate-900">{currentInmateMetadata?.firstName || "Manuel"} {currentInmateMetadata?.lastName || "Domingos João"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase text-[10px]">BILHETE DE IDENTIDADE (BI):</span>
                            <span className="font-bold text-slate-900 font-mono">{currentInmateMetadata?.idCard || "002847192LA049"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase text-[10px]">ESTADO CIVIL / ORIGEM:</span>
                            <span className="font-semibold text-slate-900">{currentInmateMetadata?.nationality || "Angolana"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase text-[10px]">DATA DE NASCIMENTO:</span>
                            <span className="font-semibold text-slate-900 font-mono">{currentInmateMetadata?.birthDate || "14/08/1994"}</span>
                          </div>
                        </div>

                        <div className="border-t border-slate-300 mt-2 pt-2 grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-slate-500 block uppercase text-[10px]">ENQUADRAMENTO PENAL (CÓDIGO PENAL ANGOLA):</span>
                            <span className="font-mono text-red-700 font-bold">
                              {currentInmateMetadata?.crimeId || "Artigo 130º (Homicídio Voluntário)"}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase text-[10px]">INSTALAÇÃO DE RETENÇÃO FÍSICA:</span>
                            <span className="font-bold text-slate-900">
                              {prisons.find(p => p.id === currentInmateMetadata?.assignedPrisonId)?.name || "Viana"}
                            </span>
                            <span className="text-slate-500 block text-[10px]">
                              Alocação: {currentInmateMetadata?.assignedCellNumber || "Cela B2-01"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] leading-snug">
                        {selectedTemplate === "internamento" ? 
                          "Declara-se que o cidadão acima identificado foi recolhido à cela regulamentar. O regime de isolamento e o perfil de perigosidade associada foram calculados automaticamente de acordo com as directrizes nacionais do MININT de Angola." :
                         selectedTemplate === "soltura" ? 
                          "Ordem expressa para colocar o cidadão em imediata liberdade sob termo de responsabilidade civil, excepto se possuir outros processos de mandados ativos no banco nacional de Luanda." :
                         selectedTemplate === "transferencia" ? 
                          "Fica autorizada a escolta armada do recluso acima sob coordenação imediata do corpo de reacção da Polícia Nacional, para realocação imediata visando garantir a segurança interna." :
                          "Fica lavrado o auto de infração disciplinar por atitude incompatível com o regulamento geral de convivência do estabelecimento prisional, sob parecer do conselho técnico administrativo."}
                      </p>

                      <div className="mt-6 flex flex-col md:flex-row items-center justify-between border-t border-slate-300 pt-6 gap-6">
                        
                        {/* Emitter sign simulation */}
                        <div className="text-center md:text-left">
                          <span className="text-slate-400 block text-[10px] uppercase font-mono">AUTOR COM CERTIFICADO DIGITAL</span>
                          <div className="h-6 w-36 border-b border-slate-900/60 my-1 italic font-serif text-slate-700 select-none">
                            Inspecção-Geral MININT
                          </div>
                          <span className="text-slate-500 text-[10px] font-mono leading-none">ID-CERTIFICADO: 8a73c241-b303</span>
                        </div>

                        {/* QR Validation Code Box */}
                        <div className="bg-white p-2 border border-slate-300 rounded flex flex-col items-center gap-1 shadow-md shrink-0">
                          <div className="bg-slate-900 text-slate-100 p-2.5 rounded">
                            <QrCode className="h-16 w-16 text-slate-100" />
                          </div>
                          <span className="font-mono text-[9px] text-slate-600 font-extrabold font-mono">
                            {selectedDocumentCode}
                          </span>
                        </div>

                      </div>

                      <div className="text-[10px] text-slate-400 mt-4 leading-normal font-mono">
                        Hash de Validação SHA-256 do Ficheiro Legal de Origem: <br/>
                        <code className="text-slate-600 select-all font-semibold">
                          SHA256: 8a73c241b3034a80a54952f9570c05c4ec9e9a4867b36f1b402802ad1daadbcf
                        </code>
                      </div>

                    </div>
                  </div>
                )}

                {/* SUBTAB CONTENT 2: MOVEMENT TIMELINE PLAN */}
                {inmateDetailsSubTab === "timeline" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-950 border border-slate-850 p-6 rounded-lg shadow-2xl flex flex-col gap-6"
                  >
                    {/* Header do Recluso na Ficha Cronológica */}
                    <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-4 gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="p-2.5 bg-slate-900 border border-slate-800 text-amber-500 rounded-lg shrink-0">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            {currentInmateMetadata?.firstName} {currentInmateMetadata?.lastName}
                            <span className="text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded font-mono uppercase tracking-wider">
                              RNR: {currentInmateMetadata?.id}
                            </span>
                          </h3>
                          <p className="text-xxs text-slate-400 font-mono mt-0.5">
                            BI: <span className="text-slate-300 font-bold">{currentInmateMetadata?.idCard}</span> | Nac: {currentInmateMetadata?.nationality} | Nascimento: {currentInmateMetadata?.birthDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 font-mono text-[10px]">
                        <div className="bg-slate-900/80 border border-slate-850 px-3 py-1.5 rounded flex flex-col gap-0.5 text-right">
                          <span className="text-slate-500 uppercase tracking-wider text-[8px]">Enquadramento</span>
                          <span className="text-amber-500 font-bold leading-none shrink-0 truncate max-w-[150px]">{currentInmateMetadata?.crimeId}</span>
                        </div>
                        <div className="bg-slate-900/80 border border-slate-850 px-3 py-1.5 rounded flex flex-col gap-0.5 text-right">
                          <span className="text-slate-500 uppercase tracking-wider text-[8px]">Risco Ativo</span>
                          <span className={`font-black uppercase tracking-wider leading-none text-right ${
                            currentInmateMetadata?.riskLevel === "Máximo" ? "text-red-400" :
                            currentInmateMetadata?.riskLevel === "Alto" ? "text-orange-400" :
                            currentInmateMetadata?.riskLevel === "Médio" ? "text-blue-400" :
                            "text-emerald-400"
                          }`}>
                            {currentInmateMetadata?.riskLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Gráfico do Percurso no Mapa Prisional de Angola (LineChart) */}
                    <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-850 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5 text-amber-500 animate-pulse" /> Trajectória de Alocação Prisional
                          </h4>
                          <p className="text-xxs text-slate-500">Mapeamento linear do recluso entre os estabelecimentos prisionais.</p>
                        </div>
                        <span className="text-[9px] font-bold font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                          {inmateFullHistory.length} Registros de Fluxo
                        </span>
                      </div>

                      {/* Canvas do Gráfico (Line Chart) */}
                      <div className="h-56 mt-2">
                        {inmateFullHistory.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={(() => {
                                const getPrisonLevel = (name: string) => {
                                  const clean = name.replace("Estabelecimento Penitenciário de ", "EP ").trim();
                                  if (clean.includes("Sanza Pombo")) return 1;
                                  if (clean.includes("Kakila")) return 2;
                                  if (clean.includes("Viana")) return 3;
                                  return 0; // Entrada Directa / Outro
                                };

                                return inmateFullHistory.map((item, index) => {
                                  const dateObj = new Date(item.timestamp);
                                  const formattedDate = dateObj.toLocaleDateString("pt-PT", {
                                    day: "2-digit",
                                    month: "short"
                                  });
                                  return {
                                    index,
                                    dateLabel: formattedDate,
                                    timeLabel: dateObj.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
                                    level: getPrisonLevel(item.toPrisonName),
                                    prisonName: item.toPrisonName.replace("Estabelecimento Penitenciário de ", "EP "),
                                    action: item.action,
                                    operator: item.operator,
                                    reason: item.reason
                                  };
                                });
                              })()}
                              margin={{ top: 15, right: 25, bottom: 5, left: -25 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis 
                                dataKey="dateLabel" 
                                stroke="#94a3b8" 
                                fontSize={9} 
                                tickLine={false}
                              />
                              <YAxis 
                                stroke="#94a3b8" 
                                fontSize={9} 
                                tickLine={false} 
                                domain={[0, 3]} 
                                ticks={[0, 1, 2, 3]}
                                tickFormatter={(val) => {
                                  if (val === 0) return "Directa";
                                  if (val === 1) return "S. Pombo";
                                  if (val === 2) return "Kakila";
                                  if (val === 3) return "Viana";
                                  return "";
                                }}
                              />
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-slate-950 border border-slate-800 p-3 rounded shadow-xl font-mono text-[10px] text-slate-300 flex flex-col gap-1.5 max-w-xs">
                                        <p className="text-amber-500 font-bold uppercase tracking-widest text-[8px] flex justify-between gap-3">
                                          <span>{data.action}</span>
                                          <span className="text-slate-500">{data.dateLabel} - {data.timeLabel}</span>
                                        </p>
                                        <p className="text-slate-100 font-bold text-xxs font-sans">
                                          Local: <span className="text-slate-200">{data.prisonName}</span>
                                        </p>
                                        <p className="text-slate-400 font-sans text-xxs">
                                          Motivo: {data.reason}
                                        </p>
                                        <div className="border-t border-slate-900 mt-1 pt-1 text-[8px] text-slate-500 flex justify-between">
                                          <span>Operador: {data.operator}</span>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="level"
                                stroke="#f59e0b"
                                strokeWidth={3}
                                activeDot={{ r: 6, fill: "#f59e0b", stroke: "#0f172a", strokeWidth: 2 }}
                                dot={{ r: 4, fill: "#1e293b", stroke: "#f59e0b", strokeWidth: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center font-mono text-[10px] text-slate-500 bg-slate-950/40 rounded border border-slate-850">
                            Sem dados de movimentações para plotar telescópia.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Listagem Detalhada da Linha do Tempo (Stepper) */}
                    <div className="flex flex-col gap-3">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5 border-b border-slate-800 pb-2">
                        <Clock className="h-3.5 w-3.5 text-slate-400" /> Diário Oficial de Escoltas e Movimentos
                      </h4>

                      <div className="flex flex-col gap-4 mt-2 font-mono">
                        {inmateFullHistory.map((item, index) => {
                          const isLast = index === inmateFullHistory.length - 1;
                          const dateObj = new Date(item.timestamp);
                          const cleanFrom = item.fromPrisonName.replace("Estabelecimento Penitenciário de ", "EP ");
                          const cleanTo = item.toPrisonName.replace("Estabelecimento Penitenciário de ", "EP ");

                          return (
                            <div key={item.id || index} className="flex gap-4 relative">
                              {/* Left Line vertical Connector */}
                              {!isLast && (
                                <div className="absolute left-3 top-6 bottom-[-22px] w-[2px] bg-slate-800" />
                              )}

                              {/* Dot status element */}
                              <div className="relative shrink-0 z-10">
                                {isLast ? (
                                  <div className="h-6 w-6 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-amber-500">
                                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                                  </div>
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-slate-900 border border-slate-750 text-slate-400 flex items-center justify-center">
                                    <span className="text-[9px] font-bold font-mono">{index + 1}</span>
                                  </div>
                                )}
                              </div>

                              {/* Content Card container */}
                              <div className="flex-1 bg-slate-900/40 border border-slate-850/80 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <span className="space-y-1 block">
                                  <span className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.2 rounded border ${
                                      item.action === "Admissão" 
                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    }`}>
                                      {item.action === "Admissão" ? "Ingresso / Admissão" : "Escolta / Transferência"}
                                    </span>
                                    <span className="text-xxs text-slate-500 font-sans">
                                      {dateObj.toLocaleString("pt-PT", {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })}
                                    </span>
                                  </span>

                                  <span className="flex items-center gap-2 text-slate-200 text-xs font-bold font-sans mt-1">
                                    <span className="text-slate-400 font-mono font-medium">{cleanFrom}</span>
                                    <ArrowRight className="h-4 w-4 text-amber-500" />
                                    <span className="text-amber-400">{cleanTo}</span>
                                  </span>

                                  <span className="text-xxs text-slate-400 font-sans pt-0.5 leading-relaxed block">
                                    Motivação legal: {item.reason}
                                  </span>
                                </span>

                                <span className="flex flex-col gap-1 items-start md:items-end shrink-0 text-left md:text-right text-[10px] block">
                                  <span className="text-xxs font-mono text-slate-500 block">
                                    Operador Responsável:
                                  </span>
                                  <span className="font-extrabold text-slate-300 leading-none block">
                                    {item.operator}
                                  </span>
                                  <span className="text-[9px] text-slate-500 border border-slate-800 bg-slate-950 px-1.5 py-0.2 rounded font-mono mt-1 block">
                                    Ref: {item.id}
                                  </span>
                                </span>

                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </motion.div>
                )}

              </div>

              {/* QR Scanner Verifier simulator right pane */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Scanner Tool */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5 border-b border-slate-800 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-1.5">
                      <QrCode className="h-4 w-4 text-amber-500 animate-pulse" /> Scanner de Validação (QR Reader)
                    </h3>
                    <p className="text-xxs text-slate-400">Insira a chave obtida pela digitalização física do documento.</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1 text-xxs">
                      <label className="text-slate-400 font-mono">Código Digital de Validação:</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Ex: AO-PNAP-2026-000492"
                          value={validateCodeInput}
                          onChange={(e) => setValidateCodeInput(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 focus:outline-none focus:border-amber-500 p-2.5 rounded text-xs font-mono"
                        />
                        <button
                          onClick={() => handleValidateDocument()}
                          className="bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3.5 rounded text-amber-550 border-amber-500/20 font-bold text-xs cursor-pointer"
                        >
                          Verificar
                        </button>
                      </div>
                    </div>

                    {/* Quick helper shortcuts to scan on click */}
                    <div className="bg-slate-950 p-2.5 border border-slate-850 rounded flex flex-col gap-1.5 font-mono text-xxs">
                      <span className="text-slate-500">Ou clique para simular a leitura do documento ativo:</span>
                      <button
                        onClick={() => {
                          setValidateCodeInput(selectedDocumentCode);
                          handleValidateDocument(selectedDocumentCode);
                        }}
                        className="bg-slate-900 hover:bg-slate-850 p-1.5 rounded text-left border border-slate-800 text-slate-200 cursor-pointer flex items-center justify-between"
                      >
                        <span>Ativo: <code className="text-amber-500">{selectedDocumentCode}</code></span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  </div>

                  {/* Verification Response Container */}
                  {verificationResult && (
                    <div className={`mt-2 p-4 border rounded-lg flex flex-col gap-3.5 font-sans ${
                      verificationResult.status === "VALID" 
                        ? "bg-slate-950 border-emerald-500/30 text-slate-200"
                        : "bg-red-950/15 border-red-500/30 text-slate-200"
                    }`}>
                      
                      <div className="flex items-center gap-2">
                        {verificationResult.status === "VALID" ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                        )}
                        <h4 className="font-bold text-xs">
                          {verificationResult.status === "VALID" ? "DOCUMENTO AUTÊNTICO" : "ALERTA: OUT-OF-BOUNDS"}
                        </h4>
                      </div>

                      {verificationResult.status === "VALID" ? (
                        <div className="font-mono text-xxs flex flex-col gap-1.5 leading-snug">
                          <p className="border-b border-slate-900 pb-1 font-bold text-[11px] text-slate-100">{verificationResult.title}</p>
                          <p><span className="text-slate-500 font-sans">Pertence a:</span> <br/>{verificationResult.inmateName} (BI: {verificationResult.biNumber})</p>
                          <p><span className="text-slate-500 font-sans">Crime Atribuído:</span> <br/>{verificationResult.crime}</p>
                          <p><span className="text-slate-500 font-sans">Alojamento Registado:</span> <br/>{verificationResult.establishment}</p>
                          <p><span className="text-slate-500 font-sans">Classificação:</span> <br/>{verificationResult.securityClearance}</p>
                          <p><span className="text-slate-500 font-sans">Selo Cripto:</span> <br/><span className="text-[10px] text-slate-400 break-all">{verificationResult.emissionHash}</span></p>
                          <span className="bg-emerald-900/40 text-emerald-400 border border-emerald-500/20 text-xxs px-2 py-0.5 rounded text-center mt-1.5 font-sans">
                            {verificationResult.validity}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xxs leading-relaxed font-sans text-slate-400">
                          {verificationResult.error}
                        </div>
                      )}

                    </div>
                  )}

                </div>

                {/* Audit e Registros Internos */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-3 font-mono text-xxs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                     Console de Logs Documentais
                  </h3>
                  <div className="bg-slate-950 p-3 rounded border border-slate-850 h-36 overflow-y-auto flex flex-col gap-1 text-[10px] text-slate-400 select-all">
                    {generatedLogs.map((logStr, lIdx) => (
                      <div key={lIdx}>{logStr}</div>
                    ))}
                    <div>[LOG] Emissão autorizada para terminal Luanda-Cen1.</div>
                    <div>[LOG] SHA-256 verificado localmente.</div>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB: MOTOR NACIONAL DE MOVIMENTAÇÕES (Point 10) */}
          {activeTab === "movements" && (
            <motion.div
              key="movements-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              {/* Top Banner with Warning Info classification */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                      MÓDULO CRÍTICO - RESTRITO
                    </span>
                    <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                      CLASSIFICAÇÃO: RESTRICTED
                    </span>
                  </div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-mono mt-2 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-amber-500 animate-pulse" /> Motor Nacional de Movimentações Penitenciárias
                  </h2>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Controle em tempo-real de ingressos, solturas, transferências e escolta militar do Serviço Penitenciário Nacional de Angola.
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-850 flex flex-col justify-center items-end">
                    <span className="text-[8px] font-mono text-slate-500 uppercase leading-none">TOTAL LOGISTICA</span>
                    <span className="text-sm font-mono font-bold text-sky-400 leading-none mt-1">{movements.length} Ativas</span>
                  </div>
                  <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-850 flex flex-col justify-center items-end">
                    <span className="text-[8px] font-mono text-slate-500 uppercase leading-none">REGISTO GERAL</span>
                    <span className="text-sm font-mono font-bold text-emerald-400 leading-none mt-1">
                      {movements.filter(m => m.status === "EXECUTED").length} Efetuadas
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid Area: Form and timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Form to schedule a movement */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                  <div>
                    <h3 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5 text-amber-500" /> Adjudicar Nova Movimentação
                    </h3>
                    <p className="text-xxs text-slate-400 mt-1 leading-relaxed">
                      Emissão eletrónica de mandado e guia operacional securizada por assinatura biométrica digital.
                    </p>
                  </div>

                  <form onSubmit={handleExecuteMovement} className="flex flex-col gap-3 font-mono text-xxs text-slate-300">
                    {/* Select Inmate */}
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 block">SELECIONAR RECLUSO:</label>
                      <select
                        value={movSelectedInmateId}
                        onChange={(e) => setMovSelectedInmateId(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xxs text-slate-200 outline-none focus:border-amber-500/50 block w-full"
                        required
                      >
                        <option value="">Selecione...</option>
                        {visibleInmates.map(inm => (
                          <option key={inm.id} value={inm.id}>
                            {inm.firstName} {inm.lastName} (BI: {inm.idCard} - {(inm as any).systemStatus || "Ativo"})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Select Movement Type */}
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 block">TIPO DE MOVIMENTO:</label>
                      <select
                        value={movType}
                        onChange={(e) => {
                          setMovType(e.target.value as InmateMovement["movementType"]);
                          if (e.target.value === "CELL_CHANGE") setMovReason("Relocação preventiva por ordem do Chefe de Bloco para balanceamento organizacional.");
                          else if (e.target.value === "TRANSFER") setMovReason("Transferência de segurança penitenciária mandatada por interesse de investigação provincial.");
                          else if (e.target.value === "RELEASE") setMovReason("Descarcerização judicial definitiva homologada por acórdão de reabilitação.");
                          else if (e.target.value === "COURT") setMovReason("Audiência de custódia preliminar para audiências governamentais.");
                          else if (e.target.value === "HOSPITAL") setMovReason("Escolta clínica de emergência para tratamento ambulatório.");
                          else if (e.target.value === "DEATH") setMovReason("Constatação clínica e registo legal de óbito por patologia interna.");
                        }}
                        className="bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xxs text-slate-200 outline-none focus:border-amber-500/50 block w-full"
                        required
                      >
                        <option value="CELL_CHANGE">MUDANÇA DE CELA (Celular Interno)</option>
                        <option value="TRANSFER">TRANSFERÊNCIA INSTITUCIONAL (Nacional/Provincial)</option>
                        <option value="RELEASE">ALVARÁ SESSÃO DE LIBERDADE (Soltura)</option>
                        <option value="COURT">AUDIÊNCIA EXTERNA (Tribunal / Custódia)</option>
                        <option value="HOSPITAL">ESCORTA CLÍNICA (Hospitalar Externo)</option>
                        <option value="DEATH">HOMOLOGAÇÃO DE ÓBITO (Óbito Legal)</option>
                      </select>
                    </div>

                    {/* Destination prison/location (Only if Transfer is selected) */}
                    {movType === "TRANSFER" && (
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-500 block">ESTABELECIMENTO DE DESTINO:</label>
                        <select
                          value={movDestPrisonId}
                          onChange={(e) => setMovDestPrisonId(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xxs text-slate-200 outline-none focus:border-amber-500/50 block w-full"
                        >
                          {prisons.map(p => {
                            const isOver = (p.currentOccupancy || 0) >= p.operationalCapacity;
                            return (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.currentOccupancy}/{p.operationalCapacity} {isOver ? "⚠️ CHEIO" : "✅ Regular"})
                              </option>
                            );
                          })}
                        </select>
                        {(() => {
                          const chosenP = prisons.find(p => p.id === movDestPrisonId);
                          if (chosenP && (chosenP.currentOccupancy || 0) >= chosenP.operationalCapacity) {
                            return (
                              <p className="text-[10px] text-amber-500 font-sans leading-tight mt-1 flex items-center gap-1 bg-amber-500/5 border border-amber-500/25 p-1 px-1.5 rounded">
                                <AlertTriangle className="h-3 w-3 inline shrink-0" /> Alerta de Superlotação: O destino selecionado já excedeu a capacidade de projeto.
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}

                    {/* Destination cell number (Only block cell change is selected) */}
                    {movType === "CELL_CHANGE" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-slate-500 block">CELA / ALOJAMENTO:</label>
                          <input
                            type="text"
                            value={movDestCell}
                            onChange={(e) => setMovDestCell(e.target.value)}
                            placeholder="Cela H1-02"
                            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xxs text-slate-200 outline-none focus:border-amber-500/50 block w-full"
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-1 font-sans">
                          <label className="text-slate-500 block font-mono text-xxs">CONTINGENTE LIMIT:</label>
                          <span className="bg-slate-950/80 px-2 py-2 rounded text-xxs text-amber-500 h-full border border-slate-850 block font-medium">
                            Capacidade: 24h Segura
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Escort / Guard Details */}
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 block">FORÇA DE ESCOTA E CUSTÓDIA:</label>
                      <input
                        type="text"
                        value={movEscort}
                        onChange={(e) => setMovEscort(e.target.value)}
                        placeholder="Ex: Força de Escolta Especial PNAP"
                        className="bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xxs text-slate-200 outline-none focus:border-amber-500/50 block w-full"
                        required
                      />
                    </div>

                    {/* Justification reasons */}
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 block">MOTIVAÇÃO DO MANDADO / JUSTIFICAÇÃO:</label>
                      <textarea
                        value={movReason}
                        onChange={(e) => setMovReason(e.target.value)}
                        placeholder="Justifique o motivo militar..."
                        rows={3}
                        className="bg-slate-950 border border-slate-800 rounded p-2.5 text-xxs text-slate-200 outline-none focus:border-amber-500/50 block w-full font-mono resize-none leading-relaxed"
                        required
                      />
                    </div>

                    {/* Calendar date */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-500 block">DATA REGISTO:</label>
                        <input
                          type="date"
                          value={movScheduledDate}
                          onChange={(e) => setMovScheduledDate(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-slate-300 pointer-events-none block w-full"
                          disabled
                        />
                      </div>
                      <div className="flex flex-col gap-1 font-sans justify-end">
                        <span className="text-[10px] text-sky-400 block pb-1 border-b border-sky-400/20 font-bold">
                          ● OPERADO EM COMANDO
                        </span>
                      </div>
                    </div>

                    {/* Submit logic */}
                    <button
                      type="submit"
                      disabled={!currentOperator.permissions?.includes(SystemPermission.MOVE_INMATE)}
                      className="mt-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 cursor-pointer font-bold py-3 px-4 rounded-xl text-xs flex justify-center items-center gap-2 shadow-lg tracking-wider hover:shadow-amber-500/10 transition-all font-sans disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Activity className="h-4 w-4" /> homologar e outorgar movimentação
                    </button>
                    {!currentOperator.permissions?.includes(SystemPermission.MOVE_INMATE) && (
                      <p className="text-[10px] text-rose-500 font-sans leading-tight text-center bg-rose-500/5 border border-rose-500/20 p-2 rounded">
                        Acesso Negado: O seu utilizador ({currentOperator.roleName}) não possui permissão (MOVE_INMATE) no escopo institucional atual.
                      </p>
                    )}
                  </form>
                </div>

                {/* Timeline and History Tracker */}
                <div className="lg:col-span-7 flex flex-col gap-5 h-full">
                  
                  {/* WORKFLOW DE HOMOLOGAÇÃO DE TRANSFERÊNCIAS (PENDENTES) */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 shadow-lg text-left">
                    <div className="flex justify-between items-center-wrap border-b border-slate-800 pb-2">
                      <div>
                        <h3 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Fingerprint className="h-4 w-4 text-amber-500 animate-pulse" /> Workflow de Homologação de Transferência
                        </h3>
                        <p className="text-xxs text-slate-400 mt-0.5 leading-relaxed">
                          Fila de autorizações digitais com aposição de chaves criptográficas sob exigência de Direção Provincial.
                        </p>
                      </div>
                      <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold">
                        {movements.filter(m => m.status === "PENDING_APPROVAL").length} PENDENTES
                      </span>
                    </div>

                    {movements.filter(m => m.status === "PENDING_APPROVAL").length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-5 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-center">
                        <CheckCircle className="h-6 w-6 text-emerald-500/80 mb-1" />
                        <span className="text-xxs font-mono text-slate-500 uppercase">Fila de autorização limpa</span>
                        <span className="text-[10px] text-slate-400 font-sans mt-0.5">Todas as transferências de reclusos foram auditadas e executadas.</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3.5 max-h-[350px] overflow-y-auto pr-1">
                        {movements.filter(m => m.status === "PENDING_APPROVAL").map((pMov) => {
                          const isAuthorized = currentOperator.role === "DIRECTOR_PROVINCIAL" || currentOperator.role === "DIRECTOR_GERAL";
                          return (
                            <div key={pMov.id} className="bg-slate-950 border border-slate-850 hover:border-slate-800 transition rounded-xl p-3.5 flex flex-col gap-2.5">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex flex-col">
                                  <span className="text-xs font-sans font-bold text-amber-400">{pMov.inmateName}</span>
                                  <span className="text-[8px] font-mono text-slate-500 mt-0.5 uppercase tracking-wider">
                                    Recluso No: {pMov.inmateId} | Guião: {pMov.id}
                                  </span>
                                </div>
                                <span className="text-[8px] font-mono font-bold bg-amber-950/50 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                                  REQUER VISTO PROVINCIAL
                                </span>
                              </div>

                              <div className="font-sans text-[10.5px] text-slate-300 leading-relaxed bg-slate-900 border border-slate-900 px-2.5 py-1.5 rounded">
                                <p className="font-mono text-[9px] text-slate-500 uppercase leading-none mb-1">Motivação Legislada:</p>
                                {pMov.reason}
                              </div>

                              <div className="bg-slate-900/40 border border-slate-900 px-3 py-2 rounded-lg text-[9px] font-mono flex items-center justify-between text-slate-400">
                                <div className="flex items-center gap-1.5 truncate">
                                  <span className="font-bold text-amber-500 shrink-0">DE:</span>
                                  <span className="text-slate-300 bg-slate-950 px-1.5 py-0.2 rounded truncate">{pMov.sourceLocName}</span>
                                  <span className="text-slate-600 font-bold shrink-0">➔</span>
                                  <span className="font-bold text-sky-400 shrink-0">PARA:</span>
                                  <span className="text-slate-300 bg-slate-950 px-1.5 py-0.2 rounded truncate">{pMov.destinationLocName}</span>
                                </div>
                                <div className="text-[8px] text-slate-500 shrink-0 italic">
                                  Escorta: {pMov.escortDetails || "N/A"}
                                </div>
                              </div>

                              <div className="border-t border-slate-900 pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[9px] font-mono">
                                <span className="text-slate-500">
                                  Solicitante: ID {pMov.operatorId}
                                </span>

                                {isAuthorized ? (
                                  <div className="flex gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                                    <button
                                      type="button"
                                      onClick={() => handleDeclineTransfer(pMov.id)}
                                      className="bg-rose-950/40 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-slate-950 font-bold px-2.5 py-1 rounded cursor-pointer transition text-[9px] uppercase tracking-wide grow sm:grow-0"
                                    >
                                      RECUSAR
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleApproveTransfer(pMov.id)}
                                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded cursor-pointer transition text-[9px] flex items-center gap-1 uppercase tracking-wide shadow shadow-emerald-500/10 grow sm:grow-0"
                                    >
                                      <UserCheck className="h-3 w-3" /> ASSINAR & EXECUTAR
                                    </button>
                                  </div>
                                ) : (
                                  <div className="bg-slate-900/80 border border-slate-850 px-2.5 py-1.5 rounded text-slate-400 text-[9px] font-sans leading-tight mt-1 self-stretch w-full">
                                    <Lock className="h-3 w-3 inline text-amber-500 mr-1 pb-0.5 shrink-0" />
                                    Acesso restrito. Mude o utilizador no topo para um <strong className="text-amber-400">Diretor Provincial</strong> para assinar digitalmente.
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex-1 flex flex-col gap-4 text-left">
                    <div className="flex justify-between items-center-wrap border-b border-slate-800 pb-2">
                      <div>
                        <h3 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-sky-400" /> Histórico & Fluxo Militar de Escolta
                        </h3>
                        <p className="text-xxs text-slate-400 mt-0.5 leading-relaxed">
                          Monitor de comboios, ordens prisionais e transferências ativas auditadas via SHA-256 no Serviço Nacional.
                        </p>
                      </div>
                    </div>
 
                     {/* Timeline logs */}
                     <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[500px] pr-1">
                       {movements.map((mov) => {
                         const cellColor = 
                           mov.status === "PENDING_APPROVAL" ? "border-amber-500/20 bg-amber-500/5 animate-pulse" :
                           mov.status === "CANCELLED" ? "border-rose-500/10 bg-rose-500/5 opacity-60" :
                           mov.movementType === "TRANSFER" ? "border-sky-500/20 bg-sky-500/5" :
                           mov.movementType === "RELEASE" ? "border-emerald-500/20 bg-emerald-500/5" :
                           mov.movementType === "CELL_CHANGE" ? "border-slate-800 bg-slate-900/40" :
                           mov.movementType === "COURT" ? "border-sky-500/20 bg-sky-500/5" : "border-indigo-500/10 bg-indigo-500/5";
                         
                         const labelType = 
                           mov.movementType === "TRANSFER" ? "TRANSFERÊNCIA PROVINCIAL" :
                           mov.movementType === "RELEASE" ? "ALVARÁ DE SOLTURA" :
                           mov.movementType === "CELL_CHANGE" ? "RELOCAÇÃO CELA INTERNA" :
                           mov.movementType === "COURT" ? "ESCORTA JUDICIÁRIA (COURT)" :
                           mov.movementType === "HOSPITAL" ? "CUSTÓDIA CLÍNICA MÉDICA" : "INTERNAMENTO PENAL";
 
                         return (
                           <div key={mov.id} className={`p-4 rounded-xl border ${cellColor} flex flex-col gap-2.5 transition`}>
                             <div className="flex justify-between items-start">
                               <div className="flex flex-col">
                                 <span className="text-[10px] font-sans font-extrabold text-slate-200">{mov.inmateName}</span>
                                 <span className="text-[7.5px] font-mono text-slate-500 mt-0.5 uppercase tracking-wider">
                                   RECLUSO: No. {mov.inmateId} | CÓDIGO REGISTO: {mov.id}
                                 </span>
                               </div>
                               <span className="text-[8px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-850 text-slate-400 uppercase tracking-wider shrink-0">
                                 {labelType}
                               </span>
                             </div>
 
                             <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                               {mov.reason}
                             </p>
 
                             {/* Timeline Flow Graphic represent on screen (Point 10 - visual timelines) */}
                             <div className="bg-slate-950 border border-slate-900 rounded p-2.5 font-mono text-[9px] flex items-center gap-1.5 overflow-x-auto text-slate-400">
                               <span className="text-amber-500 font-bold shrink-0">ORIGEM:</span>
                               <span className="text-slate-300 bg-slate-900 px-1.5 py-0.2 rounded font-semibold truncate shrink-0">
                                 {mov.sourceLocName || "Ponto Inicial / Triagem"}
                               </span>
                               <span className="text-slate-600 px-0.5">➔</span>
                               <span className="text-sky-400 font-bold shrink-0">DESTINO:</span>
                               <span className="text-slate-300 bg-slate-900 px-1.5 py-0.2 rounded font-semibold truncate shrink-0">
                                 {mov.destinationLocName || "Área Externa / Concluído"}
                               </span>
                             </div>
 
                             {/* Footer meta info: Signatures, Stamps */}
                             <div className="border-t border-slate-900/40 pt-2 flex justify-between items-center text-[8.5px] font-mono text-slate-500 leading-none">
                               <div className="flex items-center gap-1.5">
                                 <Fingerprint className="h-3 w-3 text-emerald-500" />
                                 <span>
                                   {mov.status === "PENDING_APPROVAL" 
                                     ? `Pendente Visto Provincial | ID Solicitante: ${mov.operatorId}`
                                     : mov.status === "CANCELLED"
                                       ? `Cancelado / Recusado`
                                       : `Aprovado por: ${mov.approvedByName || `ID ${mov.operatorId}`}`}
                                 </span>
                               </div>
                               <div className="flex items-center gap-2">
                                 <span className="text-slate-600 font-bold uppercase shrink-0">Escuta: {mov.escortDetails || "NREP"}</span>
                                 {mov.status === "PENDING_APPROVAL" ? (
                                   <span className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-1.5 font-bold uppercase rounded py-0.2">
                                     PENDENTE VALIDAÇÃO
                                   </span>
                                 ) : mov.status === "CANCELLED" ? (
                                   <span className="bg-rose-500/10 text-rose-400 border border-rose-500/25 px-1.5 font-bold uppercase rounded py-0.2">
                                     RECUSADA / CANCELADA
                                   </span>
                                 ) : (
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 font-bold uppercase rounded py-0.2">
                                     HOMOLOGADO (EXECUTADO)
                                   </span>
                                 )}
                               </div>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                  </div>

                  {/* Informational digital signature block widget */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 flex flex-col gap-3 font-mono text-xxs">
                    <h3 className="text-xs font-bold uppercase text-slate-300 border-b border-slate-800 pb-2 tracking-wider">
                      ℹ️ Protocolo Militar de Assinatura Eletrónica (Guia NREP)
                    </h3>
                    <p className="text-slate-400 font-sans leading-relaxed text-[11px]">
                      Todas as movimentações ativadas no NREP geram carimbos digitais SHA-256 e selos do Ministério do Interior. 
                      A alteração retroativa deste histórico dispara alertas na auditoria nacional e revoga chaves biométricas de operadores.
                    </p>
                    <div className="bg-slate-950 border border-slate-850 p-3 rounded text-[10px] text-emerald-400 leading-none flex gap-1.5 justify-between items-center font-semibold">
                      <span>INTEGRIDADE BLOCKCHAIN: EXCELENTE</span>
                      <span className="text-slate-500">SHA-256: 0xA772F92911C</span>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB: SERVIÇOS ESPECIAIS & INTEGRADOS (CRUD) */}
          {activeTab === "special-services" && (
            <motion.div
              key="special-services-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Header Title Banner */}
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl text-left">
                <div>
                  <div className="flex items-center gap-2 text-xxs font-mono uppercase tracking-wider text-emerald-400 font-bold bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/20 w-fit">
                    <Zap className="h-3 w-3 text-emerald-400 shrink-0 animate-pulse" />
                    MÓDULOS ESPECIAIS DE CÚPULA PNAP-AO
                  </div>
                  <h1 className="text-xl md:text-2xl font-sans tracking-tight text-white font-bold mt-2">
                    Serviços Integrados & CRUD Canónico
                  </h1>
                  <p className="text-slate-400 text-xs mt-1 max-w-2xl">
                    Gestão integrada e auditoria direta de prontuários de saúde clínica, programas e fichas de reinserção social comunitária, e canais de inteligência criminal cruzada com a Polícia Nacional de Angola.
                  </p>
                </div>
                <div className="flex items-center gap-3 self-start md:self-center">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-[10px] bg-slate-950 text-slate-400 border border-slate-800 px-3 py-1.5 rounded-lg font-mono">
                    SICP-INTEGRAÇÃO: ATIVA
                  </span>
                </div>
              </div>

              {/* Sub-tab navigation */}
              {(() => {
                const [subTab, setSubTab] = useState<"saude" | "reinsercao" | "inteligencia">("saude");
                const [chartMetric, setChartMetric] = useState<"progress" | "enrolled">("progress");

                const educacaoRecords = reintegrationRecords.filter(r => r.category === "Educação");
                const trabalhoRecords = reintegrationRecords.filter(r => r.category === "Trabalho");

                const avgEducacaoProgress = educacaoRecords.length > 0 
                  ? Math.round(educacaoRecords.reduce((acc, r) => acc + r.progressScore, 0) / educacaoRecords.length) 
                  : 85;
                const avgTrabalhoProgress = trabalhoRecords.length > 0 
                  ? Math.round(trabalhoRecords.reduce((acc, r) => acc + r.progressScore, 0) / trabalhoRecords.length) 
                  : 88;

                const lastSemesterData = [
                  { month: "Jan/26", educacaoAtivos: 12, educacaoProgresso: 68, trabalhoAtivos: 18, trabalhoProgresso: 72 },
                  { month: "Fev/26", educacaoAtivos: 15, educacaoProgresso: 70, trabalhoAtivos: 22, trabalhoProgresso: 75 },
                  { month: "Mar/26", educacaoAtivos: 18, educacaoProgresso: 74, trabalhoAtivos: 20, trabalhoProgresso: 78 },
                  { month: "Abr/26", educacaoAtivos: 21, educacaoProgresso: 78, trabalhoAtivos: 25, trabalhoProgresso: 82 },
                  { month: "Mai/26", educacaoAtivos: 24, educacaoProgresso: 81, trabalhoAtivos: 28, trabalhoProgresso: 84 },
                  { month: "Jun/26", educacaoAtivos: 25 + educacaoRecords.length, educacaoProgresso: avgEducacaoProgress, trabalhoAtivos: 29 + trabalhoRecords.length, trabalhoProgresso: avgTrabalhoProgress }
                ];
                
                // Form States
                const [showForm, setShowForm] = useState<boolean>(false);
                const [editId, setEditId] = useState<string | null>(null);

                // Filter States
                const [searchQuery, setSearchQuery] = useState<string>("");
                const [severityFilter, setSeverityFilter] = useState<string>("ALL");
                const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
                const [classificationFilter, setClassificationFilter] = useState<string>("ALL");
                const [threatLevelFilter, setThreatLevelFilter] = useState<string>("ALL");
                const [localIntelSearch, setLocalIntelSearch] = useState<string>("");
                const [intelSigModalOpen, setIntelSigModalOpen] = useState<boolean>(false);
                const [intelSigOfficer, setIntelSigOfficer] = useState<string>("Superintendente-Chefe J. Lourenço");
                const [intelSigPin, setIntelSigPin] = useState<string>("");
                const [intelSigSigned, setIntelSigSigned] = useState<boolean>(false);
                const [intelBioScanning, setIntelBioScanning] = useState<boolean>(false);
                const [intelBioProgress, setIntelBioProgress] = useState<number>(0);
                const [intelBioMatched, setIntelBioMatched] = useState<boolean>(false);
                const [intelSigError, setIntelSigError] = useState<string | null>(null);

                // Form Fields
                // Saúde Fields
                const [sInmateId, setSInmateId] = useState<string>("");
                const [sSymptoms, setSSymptoms] = useState<string>("");
                const [sDiagnosis, setSDiagnosis] = useState<string>("");
                const [sPrescription, setSPrescription] = useState<string>("");
                const [sSeverity, setSSeverity] = useState<"Ligeiro" | "Moderado" | "Grave" | "Crítico">("Ligeiro");
                const [sStatus, setSStatus] = useState<"Pendente" | "Em Tratamento" | "Recuperado" | "Alta Clínica">("Pendente");
                const [sDoctor, setSDoctor] = useState<string>("");

                // Reinserção Fields
                const [rInmateId, setRInmateId] = useState<string>("");
                const [rProgram, setRProgram] = useState<string>("");
                const [rCategory, setRCategory] = useState<"Educação" | "Trabalho" | "Apoio Psicológico" | "Artesanato">("Educação");
                const [rScore, setRScore] = useState<number>(70);
                const [rAttendance, setRAttendance] = useState<number>(90);
                const [rStatus, setRStatus] = useState<"Inscrito" | "Ativo" | "Suspenso" | "Concluído">("Inscrito");
                const [rNotes, setRNotes] = useState<string>("");
                const [rReintegrator, setRReintegrator] = useState<string>("");

                // Inteligência Fields
                const [iInmateId, setIInmateId] = useState<string>("");
                const [iClassification, setIClassification] = useState<"RESTRITO" | "CONFIDENCIAL" | "SECRETO">("RESTRITO");
                const [iSource, setISource] = useState<"MININT" | "Polícia Nacional" | "SICP" | "Guarda Prisional">("Guarda Prisional");
                const [iAlertType, setIAlertType] = useState<"Informador de Bloco" | "Tentativa de Fuga Recorrente" | "Histórico de Facção" | "Conexão Externa Suspeita">("Conexão Externa Suspeita");
                const [iThreat, setIThreat] = useState<"Baixo" | "Médio" | "Alto" | "Crítico">("Baixo");
                const [iDesc, setIDesc] = useState<string>("");
                const [iAction, setIAction] = useState<string>("");

                // Success Message
                const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

                const triggerFeedback = (msg: string) => {
                  setFeedbackMsg(msg);
                  setTimeout(() => setFeedbackMsg(null), 4000);
                };

                // Clear fields helper
                const resetForms = () => {
                  setEditId(null);
                  setShowForm(false);
                  
                  // Reset Saúde
                  setSInmateId(""); setSSymptoms(""); setSDiagnosis(""); setSPrescription(""); setSSeverity("Ligeiro"); setSStatus("Pendente"); setSDoctor("");
                  // Reset Reinserção
                  setRInmateId(""); setRProgram(""); setRCategory("Educação"); setRScore(70); setRAttendance(90); setRStatus("Inscrito"); setRNotes(""); setRReintegrator("");
                  // Reset Inteligência
                  setIInmateId(""); setIClassification("RESTRITO"); setISource("Guarda Prisional"); setIAlertType("Conexão Externa Suspeita"); setIThreat("Baixo"); setIDesc(""); setIAction("");
                };

                // Trigger edit mode
                const handleEditClick = (type: "saude" | "reinsercao" | "inteligencia", item: any) => {
                  setEditId(item.id);
                  setShowForm(true);
                  if (type === "saude") {
                    setSInmateId(item.inmateId);
                    setSSymptoms(item.symptoms);
                    setSDiagnosis(item.diagnosis);
                    setSPrescription(item.prescription);
                    setSSeverity(item.severity);
                    setSStatus(item.status);
                    setSDoctor(item.doctorName);
                  } else if (type === "reinsercao") {
                    setRInmateId(item.inmateId);
                    setRProgram(item.programName);
                    setRCategory(item.category);
                    setRScore(item.progressScore);
                    setRAttendance(item.attendanceRate);
                    setRStatus(item.status);
                    setRNotes(item.evaluationNotes);
                    setRReintegrator(item.reintegratorName);
                  } else if (type === "inteligencia") {
                    setIInmateId(item.inmateId);
                    setIClassification(item.classification);
                    setISource(item.incidentSource);
                    setIAlertType(item.alertType);
                    setIThreat(item.threatLevel);
                    setIDesc(item.description);
                    setIAction(item.actionTaken);
                  }
                };

                // Submit Form
                const handleFormSubmit = (e: React.FormEvent) => {
                  e.preventDefault();
                  
                  if (subTab === "saude") {
                    if (!sInmateId) { alert("Por favor selecione um recluso."); return; }
                    const refInmate = inmates.find(i => i.id === sInmateId);
                    const inName = refInmate ? `${refInmate.firstName} ${refInmate.lastName}` : "Recluso Desconhecido";
                    
                    if (editId) {
                      // Update
                      setHealthRecords(prev => prev.map(item => item.id === editId ? {
                        ...item,
                        inmateId: sInmateId,
                        inmateName: inName,
                        symptoms: sSymptoms,
                        diagnosis: sDiagnosis,
                        prescription: sPrescription,
                        severity: sSeverity,
                        status: sStatus,
                        doctorName: sDoctor || "Clínico Geral"
                      } : item));

                      // Add to Audit Log
                      setAuditLogs(prev => [
                        {
                          id: `AUD-H-${Math.floor(Math.random()*10000)}`,
                          userId: currentOperatorId,
                          timestamp: new Date().toISOString(),
                          action: "Edição",
                          inmateId: sInmateId,
                          inmateName: inName,
                          fieldChanged: "Prontuário Médico (Saúde)",
                          oldValue: "Registo Clinico Anterior",
                          newValue: `Actualizado registo médico CLI: ${sSymptoms} - Diag: ${sDiagnosis}`
                        },
                        ...prev
                      ]);

                      triggerFeedback("Registo médico atualizado com sucesso!");
                    } else {
                      // Create
                      const newRec: HealthRecord = {
                        id: `CLI-2026-${Math.floor(1000 + Math.random()*9000)}`,
                        inmateId: sInmateId,
                        inmateName: inName,
                        prisonId: refInmate?.assignedPrisonId || "PRIS-HUAMBO",
                        prisonName: prisons.find(p => p.id === refInmate?.assignedPrisonId)?.name || "Cadeia Central",
                        consultationDate: new Date().toISOString().substring(0, 10),
                        symptoms: sSymptoms,
                        diagnosis: sDiagnosis,
                        prescription: sPrescription,
                        severity: sSeverity,
                        status: sStatus,
                        doctorName: sDoctor || "Clínico Geral"
                      };

                      setHealthRecords(prev => [newRec, ...prev]);

                      // Add to Audit Log
                      setAuditLogs(prev => [
                        {
                          id: `AUD-H-${Math.floor(Math.random()*10000)}`,
                          userId: currentOperatorId,
                          timestamp: new Date().toISOString(),
                          action: "Admissão",
                          inmateId: sInmateId,
                          inmateName: inName,
                          fieldChanged: "Novo Prontuário Médico (Saúde)",
                          oldValue: "-",
                          newValue: `Criado novo prontuário clínico ${newRec.id}: ${sSymptoms} - Diag: ${sDiagnosis}`
                        },
                        ...prev
                      ]);

                      triggerFeedback("Novo prontuário clínico registado!");
                    }
                  } else if (subTab === "reinsercao") {
                    if (!rInmateId) { alert("Por favor selecione um recluso."); return; }
                    const refInmate = inmates.find(i => i.id === rInmateId);
                    const inName = refInmate ? `${refInmate.firstName} ${refInmate.lastName}` : "Recluso Desconhecido";

                    if (editId) {
                      // Update
                      setReintegrationRecords(prev => prev.map(item => item.id === editId ? {
                        ...item,
                        inmateId: rInmateId,
                        inmateName: inName,
                        programName: rProgram || "Programa Geral",
                        category: rCategory,
                        progressScore: Number(rScore),
                        attendanceRate: Number(rAttendance),
                        status: rStatus,
                        evaluationNotes: rNotes,
                        reintegratorName: rReintegrator || "Conselheiro Social"
                      } : item));

                      triggerFeedback("Registo de reinserção social atualizado!");
                    } else {
                      // Create
                      const newRec: ReintegrationRecord = {
                        id: `REI-2026-${Math.floor(1000 + Math.random()*9000)}`,
                        inmateId: rInmateId,
                        inmateName: inName,
                        programName: rProgram || "Curso Técnico Profissional",
                        category: rCategory,
                        enrollmentDate: new Date().toISOString().substring(0, 10),
                        progressScore: Number(rScore),
                        attendanceRate: Number(rAttendance),
                        status: rStatus,
                        evaluationNotes: rNotes,
                        reintegratorName: rReintegrator || "Conselheiro Social"
                      };

                      setReintegrationRecords(prev => [newRec, ...prev]);
                      triggerFeedback("Inscrito novo recluso no programa de reabilitação social!");
                    }
                  } else if (subTab === "inteligencia") {
                    if (!iInmateId) { alert("Por favor selecione um recluso."); return; }
                    const refInmate = inmates.find(i => i.id === iInmateId);
                    const inName = refInmate ? `${refInmate.firstName} ${refInmate.lastName}` : "Recluso Desconhecido";

                    if (editId) {
                      // Update
                      setIntelligenceRecords(prev => prev.map(item => item.id === editId ? {
                        ...item,
                        inmateId: iInmateId,
                        inmateName: inName,
                        classification: iClassification,
                        incidentSource: iSource,
                        alertType: iAlertType,
                        threatLevel: iThreat,
                        description: iDesc,
                        actionTaken: iAction
                      } : item));

                      triggerFeedback("Registo de inteligência operacional atualizado!");
                    } else {
                      // Create
                      const firstWord = inName.split(" ")[0].toUpperCase();
                      const newRec: IntelligenceRecord = {
                        id: `INT-2026-${Math.floor(1000 + Math.random()*9000)}`,
                        inmateId: iInmateId,
                        inmateName: inName,
                        classification: iClassification,
                        incidentSource: iSource,
                        alertType: iAlertType,
                        threatLevel: iThreat,
                        description: iDesc,
                        loggedDate: new Date().toISOString().substring(0, 10),
                        actionTaken: iAction,
                        checksum: `SHA256-${firstWord}-${Math.floor(1000 + Math.random()*9000)}`
                      };

                      setIntelligenceRecords(prev => [newRec, ...prev]);
                      triggerFeedback("Alerta de inteligência e cruzamento criminal lançado!");
                    }
                  }
                  resetForms();
                };

                // Delete Entry
                const handleDeleteClick = (type: "saude" | "reinsercao" | "inteligencia", id: string) => {
                  if (confirm("Confirmar exclusão irrevogável deste registo no banco canónico?")) {
                    if (type === "saude") {
                      setHealthRecords(prev => prev.filter(i => i.id !== id));
                      triggerFeedback("Registo médico clínico apagado.");
                    } else if (type === "reinsercao") {
                      setReintegrationRecords(prev => prev.filter(i => i.id !== id));
                      triggerFeedback("Programa de reinserção social apagado.");
                    } else if (type === "inteligencia") {
                      setIntelligenceRecords(prev => prev.filter(i => i.id !== id));
                      triggerFeedback("Alerta de inteligência secreta removido.");
                    }
                  }
                };

                return (subTab && (
                  <div className="space-y-6 font-sans">
                    {/* Switch Tab buttons & KPI Grid */}
                    <div className="flex flex-col lg:flex-row gap-4 justify-between lg:items-center">
                      {/* Tabs */}
                      <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 w-fit shrink-0">
                        <button
                          type="button"
                          onClick={() => { setSubTab("saude"); resetForms(); }}
                          className={`px-4 py-2 font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            subTab === "saude"
                              ? "bg-slate-800 text-amber-500 border border-slate-700 shadow-sm"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <HeartPulse className="h-4 w-4 text-emerald-500" />
                          🏥 Serviços de Saúde
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSubTab("reinsercao"); resetForms(); }}
                          className={`px-4 py-2 font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            subTab === "reinsercao"
                              ? "bg-slate-800 text-amber-500 border border-slate-700 shadow-sm"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <BookOpen className="h-4 w-4 text-amber-500" />
                          🌱 Reinserção Social
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSubTab("inteligencia"); resetForms(); }}
                          className={`px-4 py-2 font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                            subTab === "inteligencia"
                              ? "bg-slate-800 text-rose-500 border border-slate-700 shadow-sm"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <Shield className="h-4 w-4 text-rose-500 animate-pulse" />
                          🕵️ Inteligência & Forças
                        </button>
                      </div>

                      {/* Summary feedback alert */}
                      {feedbackMsg && (
                        <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-xs px-4 py-2 rounded-xl flex items-center gap-2 animate-bounce">
                          <Check className="h-4 w-4 text-emerald-400" />
                          {feedbackMsg}
                        </div>
                      )}

                      {/* Header quick button insert */}
                      {!showForm && subTab !== "saude" && (
                        <button
                          type="button"
                          onClick={() => setShowForm(true)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-lg transition shadow-md flex items-center gap-1.5 self-start lg:self-center cursor-pointer"
                        >
                          <Plus className="h-4 w-4 stroke-[3px]" />
                          {subTab === "reinsercao" ? "Inscrever em Reinserção" : "Registar Alerta de Inteligência"}
                        </button>
                      )}
                    </div>

                    {subTab === "saude" ? (
                      <HealthModule 
                        inmates={inmates}
                        currentOperator={currentOperator}
                        hasPermission={hasPermission}
                        setAuditLogs={setAuditLogs}
                        currentOperatorId={currentOperatorId}
                        healthRecords={healthRecords}
                        setHealthRecords={setHealthRecords}
                        operators={operators}
                        setOperators={setOperators}
                      />
                    ) : (
                      <>
                        {/* DYNAMIC KPI MINI-GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {subTab === "reinsercao" && (
                        <>
                          <div className="bg-slate-900/40 border border-slate-855 p-3 rounded-xl font-mono text-left">
                            <span className="text-[10px] text-slate-500 block uppercase">Inscrições Ativas</span>
                            <span className="text-xl font-bold text-amber-500">{reintegrationRecords.length}</span>
                          </div>
                          <div className="bg-slate-900/40 border border-slate-855 p-3 rounded-xl font-mono text-left">
                            <span className="text-[10px] text-slate-500 block uppercase">Frequência Média</span>
                            <span className="text-xl font-bold text-slate-100">
                              {Math.round(reintegrationRecords.reduce((acc, curr) => acc + curr.attendanceRate, 0) / reintegrationRecords.length || 0)}%
                            </span>
                          </div>
                          <div className="bg-slate-900/40 border border-slate-855 p-3 rounded-xl font-mono text-left">
                            <span className="text-[10px] text-emerald-400 block uppercase">Rendimento Médio</span>
                            <span className="text-xl font-bold text-emerald-400">
                              {Math.round(reintegrationRecords.reduce((acc, curr) => acc + curr.progressScore, 0) / reintegrationRecords.length || 0)}/100
                            </span>
                          </div>
                          <div className="bg-slate-900/40 border border-slate-855 p-3 rounded-xl font-mono text-left">
                            <span className="text-[10px] text-slate-500 block uppercase">Categorias de Apoio</span>
                            <span className="text-xl font-bold text-slate-300">4 Unidades</span>
                          </div>
                        </>
                      )}
                      {subTab === "inteligencia" && (
                        <>
                          <div className="bg-slate-900/40 border border-slate-900/50 p-3 rounded-xl font-mono text-left">
                            <span className="text-[10px] text-slate-500 block uppercase">Registos de Risco</span>
                            <span className="text-xl font-bold text-rose-500">{intelligenceRecords.length}</span>
                          </div>
                          <div className="bg-slate-900/40 border border-slate-900/50 p-3 rounded-xl font-mono text-left">
                            <span className="text-[10px] text-rose-450 block uppercase">Nível Vermelho</span>
                            <span className="text-xl font-bold text-rose-400">
                              {intelligenceRecords.filter(i => i.threatLevel === "Crítico" || i.threatLevel === "Alto").length}
                            </span>
                          </div>
                          <div className="bg-slate-900/40 border border-slate-900/50 p-3 rounded-xl font-mono text-left">
                            <span className="text-[10px] text-slate-500 block uppercase">Organizações Integradas</span>
                            <span className="text-xl font-bold text-slate-200">SICP + MININT</span>
                          </div>
                          <div className="bg-slate-900/40 border border-slate-900/50 p-3 rounded-xl font-mono text-left">
                            <span className="text-[10px] text-yellow-500 block uppercase">Cripto Hashes Seletos</span>
                            <span className="text-xl font-bold text-yellow-500">100% Selado</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* GRÁFICO DE PROGRESSÃO SEMESTRAL (EDUCAÇÃO E TRABALHO) */}
                    {subTab === "reinsercao" && (
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left flex flex-col gap-4 shadow-lg mb-4 mt-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
                          <div>
                            <h3 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                              <TrendingUp className="h-4 w-4 text-emerald-400" /> Progressão Semestral: Educação vs Trabalho
                            </h3>
                            <p className="text-xxs text-slate-400 mt-0.5 leading-relaxed font-sans">
                              Evolução participativa e avaliação de desempenho dos reclusos no último semestre (Janeiro - Junho).
                            </p>
                          </div>
                          
                          {/* Toggle Metric Button Group */}
                          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-850 font-mono text-[9px]">
                            <button
                              type="button"
                              onClick={() => {
                                setChartMetric("progress");
                              }}
                              className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                                chartMetric === "progress"
                                  ? "bg-slate-800 text-emerald-400 border border-slate-700/50"
                                  : "text-slate-500 hover:text-slate-350"
                              }`}
                            >
                              Rendimento (%)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setChartMetric("enrolled");
                              }}
                              className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                                chartMetric === "enrolled"
                                  ? "bg-slate-800 text-amber-500 border border-slate-700/50"
                                  : "text-slate-500 hover:text-slate-350"
                              }`}
                            >
                              Inscrições (Nº)
                            </button>
                          </div>
                        </div>

                        {/* Chart Render */}
                        <div className="h-64 w-full pr-4 text-xs">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={lastSemesterData}
                              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                              <XAxis dataKey="month" stroke="#64748b" fontSize={9} tickLine={false} />
                              <YAxis 
                                stroke="#64748b" 
                                fontSize={9} 
                                tickLine={false} 
                                axisLine={false}
                                domain={chartMetric === "progress" ? [0, 100] : [0, 'auto']}
                              />
                              <Tooltip
                                cursor={{ fill: "rgba(255,255,255,0.02)" }}
                                contentStyle={{
                                  backgroundColor: "#0b1329",
                                  border: "1px solid #1e293b",
                                  borderRadius: "8px",
                                  fontSize: "11.5px",
                                  fontFamily: "monospace"
                                }}
                                itemStyle={{ color: "#cbd5e1" }}
                                labelStyle={{ color: "#94a3b8", fontWeight: "bold", marginBottom: "4px" }}
                              />
                              <Legend 
                                wrapperStyle={{ fontSize: "10px", marginTop: "12px", fontFamily: "sans-serif" }}
                              />
                              
                              {chartMetric === "progress" ? (
                                <>
                                  <Bar 
                                    name="Educação (% Aproveitamento Médio)" 
                                    dataKey="educacaoProgresso" 
                                    fill="#10b981" 
                                    radius={[4, 4, 0, 0]} 
                                  />
                                  <Bar 
                                    name="Trabalho (% Aproveitamento Médio)" 
                                    dataKey="trabalhoProgresso" 
                                    fill="#f59e0b" 
                                    radius={[4, 4, 0, 0]} 
                                  />
                                </>
                              ) : (
                                <>
                                  <Bar 
                                    name="Educação (Total Alunos)" 
                                    dataKey="educacaoAtivos" 
                                    fill="#3b82f6" 
                                    radius={[4, 4, 0, 0]} 
                                  />
                                  <Bar 
                                    name="Trabalho (Total Alunos)" 
                                    dataKey="trabalhoAtivos" 
                                    fill="#10b981" 
                                    radius={[4, 4, 0, 0]} 
                                  />
                                </>
                              )}
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Analytical Footer or Breakdown details */}
                        <div className="bg-slate-950/40 border border-slate-850 px-3.5 py-2.5 rounded-xl text-[10px] font-mono flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex items-center gap-2 text-slate-400">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Aproveitamento em Educação aumentou de <strong className="text-slate-300">68% canónico</strong> para <strong className="text-emerald-400 font-bold">{avgEducacaoProgress}% dinâmico</strong>.</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>Atividades de Trabalho produtivo integram <strong className="text-amber-500 font-bold">{29 + trabalhoRecords.length} reclusos</strong> este mês.</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* DYNAMIC FORM CONTAINER */}
                    {showForm && (
                      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-2xl relative animate-fadeIn font-sans">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4 select-none">
                          <h3 className="font-sans font-bold text-sm text-slate-100 flex items-center gap-1.5">
                            <Sliders className="h-4 w-4 text-emerald-400" />
                            {editId ? "Editar Registo do Banco Dinâmico" : "Adicionar Entrada ao Banco Canónico"}
                          </h3>
                          <button
                            type="button"
                            onClick={resetForms}
                            className="text-xs text-slate-400 hover:text-slate-300 bg-slate-950 px-2.5 py-1 rounded cursor-pointer animate-pulse font-bold"
                          >
                            Cancelar
                          </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4 text-left font-sans">
                          {/* Reinserção Form fields */}
                          {subTab === "reinsercao" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Seleccionar Recluso *</label>
                                <select
                                  value={rInmateId}
                                  onChange={(e) => setRInmateId(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                                >
                                  <option value="">-- Seleccionar Recluso --</option>
                                  {inmates.map(i => (
                                    <option key={i.id} value={i.id}>{i.firstName} {i.lastName} (RNR: {i.id})</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Técnico de Reinserção Responsável</label>
                                <input
                                  type="text"
                                  value={rReintegrator}
                                  onChange={(e) => setRReintegrator(e.target.value)}
                                  placeholder="e.g. Dr. Alfredo Fragoso"
                                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Nome do Programa de Integração</label>
                                <input
                                  type="text"
                                  value={rProgram}
                                  onChange={(e) => setRProgram(e.target.value)}
                                  placeholder="e.g. Serralharia Artística e Marcenaria Prática"
                                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Categoria de Trabalho/Apoio</label>
                                <select
                                  value={rCategory}
                                  onChange={(e) => setRCategory(e.target.value as any)}
                                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                                >
                                  <option value="Educação">Educação</option>
                                  <option value="Trabalho">Trabalho</option>
                                  <option value="Apoio Psicológico">Apoio Psicológico</option>
                                  <option value="Artesanato">Artesanato</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Rendimento / Progresso Técnico (0 - 100)</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={rScore}
                                  onChange={(e) => setRScore(Number(e.target.value))}
                                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-mono"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Taxa de Assiduidade Colectiva (%)</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={rAttendance}
                                  onChange={(e) => setRAttendance(Number(e.target.value))}
                                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-mono"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Fase do Programa</label>
                                <select
                                  value={rStatus}
                                  onChange={(e) => setRStatus(e.target.value as any)}
                                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                                >
                                  <option value="Inscrito">Inscrito</option>
                                  <option value="Ativo">Ativo</option>
                                  <option value="Suspenso">Suspenso</option>
                                  <option value="Concluído">Concluído</option>
                                </select>
                              </div>

                              <div className="col-span-1 md:col-span-2">
                                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Notas de Observação e Parecer Psicológico</label>
                                <textarea
                                  value={rNotes}
                                  onChange={(e) => setRNotes(e.target.value)}
                                  placeholder="Incorpore as atitudes psicossociais, cooperação familiar, comportamento no pavilhão comun..."
                                  rows={2}
                                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-mono"
                                />
                              </div>
                            </div>
                          )}

                          {/* Inteligência Form fields */}
                          {subTab === "inteligencia" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Seleccionar Recluso sob Suspeita *</label>
                                <select
                                  value={iInmateId}
                                  onChange={(e) => setIInmateId(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                                >
                                  <option value="">-- Seleccionar Recluso --</option>
                                  {inmates.map(i => (
                                    <option key={i.id} value={i.id}>{i.firstName} {i.lastName} (RNR: {i.id})</option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Grau de Secretismo Legal</label>
                                <select
                                  value={iClassification}
                                  onChange={(e) => setIClassification(e.target.value as any)}
                                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-mono"
                                >
                                  <option value="RESTRITO">RESTRITO</option>
                                  <option value="CONFIDENCIAL">CONFIDENCIAL</option>
                                  <option value="SECRETO">SECRETO</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Órgão de Força de Segurança Notificado</label>
                                <select
                                  value={iSource}
                                  onChange={(e) => setISource(e.target.value as any)}
                                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                                >
                                  <option value="MININT">MININT (Ministério do Interior)</option>
                                  <option value="Polícia Nacional">Polícia Nacional</option>
                                  <option value="SICP">SICP (Investigação Criminal)</option>
                                  <option value="Guarda Prisional">Guarda Prisional</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Tipo de Sinalização de Risco</label>
                                <select
                                  value={iAlertType}
                                  onChange={(e) => setIAlertType(e.target.value as any)}
                                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                                >
                                  <option value="Informador de Bloco">Informador de Bloco</option>
                                  <option value="Tentativa de Fuga Recorrente">Tentativa de Fuga Recorrente</option>
                                  <option value="Histórico de Facção">Histórico de Facção</option>
                                  <option value="Conexão Externa Suspeita">Conexão Externa Suspeita</option>
                                </select>
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Grau de Ameaça Imediata</label>
                                <select
                                  value={iThreat}
                                  onChange={(e) => setIThreat(e.target.value as any)}
                                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                                >
                                  <option value="Baixo">Baixo</option>
                                  <option value="Médio">Médio</option>
                                  <option value="Alto">Alto</option>
                                  <option value="Crítico">Crítico</option>
                                </select>
                              </div>

                              <div className="col-span-1 md:col-span-2">
                                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Informações Confidenciais do Alerta</label>
                                <textarea
                                  value={iDesc}
                                  onChange={(e) => setIDesc(e.target.value)}
                                  placeholder="Discorra sobre escutas digitais, registo de facções ou alertas de capturas estaduais..."
                                  rows={2}
                                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none font-mono"
                                />
                              </div>

                              <div className="col-span-1 md:col-span-2">
                                <label className="text-[10px] text-slate-400 block mb-1 font-mono uppercase">Contramedidas / Ações Operacionais Tomadas</label>
                                <input
                                  type="text"
                                  value={iAction}
                                  onChange={(e) => setIAction(e.target.value)}
                                  placeholder="e.g. Isolamento temporário, rotatividade forçada de pavilhão..."
                                  className="w-full bg-slate-950 border border-slate-800 p-2 text-xs rounded text-slate-200 outline-none"
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800 mt-4">
                            <button
                              type="button"
                              onClick={resetForms}
                              className="px-4 py-2 text-xs text-slate-400 hover:bg-slate-955 rounded transition cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle className="h-4 w-4" />
                              {editId ? "Salvar Alterações" : "Submeter no Banco Canónico"}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* SEARCH FILTERS */}
                    <div className="flex flex-col md:flex-row gap-3 bg-slate-950 p-4 border border-slate-850 rounded-xl relative">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Pesquisar por recluso, diagnóstico, curso ou agência..."
                          className="w-full bg-slate-900 border border-slate-800 pl-10 pr-4 py-2.5 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 transition font-mono"
                        />
                      </div>



                      {subTab === "reinsercao" && (
                        <div className="flex gap-2">
                          <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-slate-900 border border-slate-800 px-3 py-2 text-xs rounded-lg text-slate-400 outline-none focus:border-emerald-500/50"
                          >
                            <option value="ALL">Todas as Categorias</option>
                            <option value="Educação">Educação</option>
                            <option value="Trabalho">Trabalho</option>
                            <option value="Apoio Psicológico">Apoio Psicológico</option>
                            <option value="Artesanato">Artesanato</option>
                          </select>
                        </div>
                      )}

                      {subTab === "inteligencia" && (
                        <div className="flex flex-wrap gap-2">
                          <select
                            value={classificationFilter}
                            onChange={(e) => setClassificationFilter(e.target.value)}
                            className="bg-slate-900 border border-slate-800 px-3 py-2 text-xs rounded-lg text-slate-400 outline-none focus:border-rose-500/50 font-mono animate-fadeIn"
                          >
                            <option value="ALL">Todos os Secretismos</option>
                            <option value="RESTRITO">RESTRITO</option>
                            <option value="CONFIDENCIAL">CONFIDENCIAL</option>
                            <option value="SECRETO">SECRETO</option>
                          </select>
                          <select
                            id="threat-level-filter-select"
                            value={threatLevelFilter}
                            onChange={(e) => setThreatLevelFilter(e.target.value)}
                            className="bg-slate-900 border border-slate-800 px-3 py-2 text-xs rounded-lg text-slate-400 outline-none focus:border-red-500/50 font-mono animate-fadeIn"
                          >
                            <option value="ALL">Nível de Ameaça: Todos</option>
                            <option value="Crítico">🔴 Crítico</option>
                            <option value="Alto">🟠 Alto</option>
                            <option value="Médio">🟡 Médio</option>
                            <option value="Baixo">🟢 Baixo</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* RENDER DYNAMIC CRUD TABLE/CARDS */}
                    <div className="overflow-x-auto border border-slate-850 rounded-xl bg-slate-950/60 shadow-lg">


                      {subTab === "reinsercao" && (() => {
                        const filtered = reintegrationRecords.filter(item => {
                          const query = searchQuery.toLowerCase().trim();
                          const matchesSearch = !query || 
                            item.inmateName.toLowerCase().includes(query) ||
                            item.programName.toLowerCase().includes(query) ||
                            item.reintegratorName.toLowerCase().includes(query) ||
                            item.evaluationNotes.toLowerCase().includes(query);
                          const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
                          return matchesSearch && matchesCategory;
                        });

                        return (
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-800 text-slate-400 font-mono select-none bg-slate-900/60">
                                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Matrícula</th>
                                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Recluso inscrito</th>
                                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Programa Integrado</th>
                                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Assiduidade</th>
                                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Aproveitamento</th>
                                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Estágio</th>
                                <th className="p-4 font-semibold uppercase text-slate-500 text-[10px] text-right">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-850">
                              {filtered.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="p-8 text-center text-slate-500 font-sans">
                                    Nenhum participante em programas de reinserção social comunitária.
                                  </td>
                                </tr>
                              ) : (
                                filtered.map(item => (
                                  <tr key={item.id} className="hover:bg-slate-900/40 transition font-sans">
                                    <td className="p-4 font-mono font-bold text-slate-350">{item.id}</td>
                                    <td className="p-4">
                                      <div className="flex flex-col text-left">
                                        <span className="font-semibold text-slate-100">{item.inmateName}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">RNR: {item.inmateId}</span>
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <div className="flex flex-col text-left">
                                        <span className="font-medium text-slate-205">{item.programName}</span>
                                        <span className="text-[10px] text-amber-500 font-mono uppercase tracking-wider">{item.category}</span>
                                      </div>
                                    </td>
                                    <td className="p-4 text-left">
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-slate-100">{item.attendanceRate}%</span>
                                        <div className="w-12 bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-850">
                                          <div className="bg-emerald-500 h-full" style={{ width: (item.attendanceRate + "%") }} />
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-4 text-left font-mono">
                                      <div className="flex items-center gap-2">
                                        <span className="text-slate-100">{item.progressScore}/100</span>
                                        <span className={`text-[9px] font-bold px-1 rounded uppercase ${
                                          item.progressScore >= 85 ? "text-emerald-400 bg-emerald-950/20" :
                                          item.progressScore >= 60 ? "text-amber-400 bg-amber-955/15" :
                                          "text-rose-455 bg-rose-955/10"
                                        }`}>
                                          {item.progressScore >= 85 ? "Excelente" : item.progressScore >= 60 ? "Média" : "Crítico"}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-4 text-left">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border bg-slate-900/50 ${
                                        item.status === "Concluído" ? "border-emerald-500/20 text-emerald-400" :
                                        item.status === "Ativo" ? "border-amber-500/25 text-amber-500 animate-pulse" :
                                        item.status === "Suspenso" ? "border-rose-500/10 text-rose-405" :
                                        "border-slate-800 text-slate-450"
                                      }`}>
                                        {item.status}
                                      </span>
                                    </td>
                                    <td className="p-4 text-right font-sans">
                                      <div className="flex justify-end gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleEditClick("reinsercao", item)}
                                          className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded text-[10px] transition cursor-pointer"
                                        >
                                          Editar
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteClick("reinsercao", item.id)}
                                          className="px-2 py-1 bg-rose-955/15 hover:bg-rose-900/30 border border-rose-900/15 text-rose-400 hover:text-rose-300 rounded text-[10px] transition cursor-pointer"
                                        >
                                          Eliminar
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        );
                      })()}

                      {subTab === "inteligencia" && (() => {
                        const filtered = intelligenceRecords.filter(item => {
                          const query = searchQuery.toLowerCase().trim();
                          const matchesSearch = !query || 
                            item.inmateName.toLowerCase().includes(query) ||
                            item.incidentSource.toLowerCase().includes(query) ||
                            item.alertType.toLowerCase().includes(query) ||
                            item.description.toLowerCase().includes(query);
                          const matchesClassification = classificationFilter === "ALL" || item.classification === classificationFilter;
                          const matchesThreat = threatLevelFilter === "ALL" || item.threatLevel === threatLevelFilter;
                          return matchesSearch && matchesClassification && matchesThreat;
                        });

                        const criticalRecords = filtered.filter(item => item.threatLevel === "Crítico");

                        const handleExportCSV = () => {
                          if (criticalRecords.length === 0) return;
                          const headers = ["Checksum", "Suspeito", "RNR", "Origem Documental", "Classificacao", "Tipo Alerta", "Nivel Ameaca", "Descricao"];
                          const rows = criticalRecords.map(item => [
                            item.checksum,
                            `"${item.inmateName.replace(/"/g, '""')}"`,
                            item.inmateId,
                            `"${item.incidentSource.replace(/"/g, '""')}"`,
                            item.classification,
                            `"${item.alertType.replace(/"/g, '""')}"`,
                            item.threatLevel,
                            `"${(item.description || "").replace(/"/g, '""')}"`
                          ]);

                          const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                          const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.setAttribute("href", url);
                          link.setAttribute("download", `registos_criticos_${new Date().toISOString().slice(0,10)}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        };

                        return (
                          <div id="intelligence-records-table-container" className="w-full">
                            {/* Local Filtering Quick Bar inside the container */}
                            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/40 border-b border-slate-850">
                              <div className="flex items-center gap-2">
                                <span className={`flex h-2 w-2 rounded-full ${threatLevelFilter === "Crítico" ? "bg-red-500 animate-pulse" : "bg-slate-500"}`}></span>
                                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                                  {threatLevelFilter === "Crítico" ? "A filtrar apenas riscos Críticos" : "Filtros Rápidos de Segurança"}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setThreatLevelFilter(threatLevelFilter === "Crítico" ? "ALL" : "Crítico")}
                                  className={`px-3 py-1.5 text-xxs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
                                    threatLevelFilter === "Crítico"
                                      ? "bg-red-500/20 text-red-100 border-red-500/50 shadow-lg shadow-red-500/5 scale-98"
                                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                                  }`}
                                  title="Filtrar apenas registros que tenham classificação de nível de ameaça 'Crítico'"
                                >
                                  🚨 Show Only Crítico
                                </button>

                                {threatLevelFilter !== "ALL" && (
                                  <button
                                    type="button"
                                    onClick={() => setThreatLevelFilter("ALL")}
                                    className="px-3 py-1.5 text-xxs font-bold uppercase tracking-wider bg-slate-950 border border-slate-800 hover:bg-slate-900 hover:text-white rounded-lg transition-all text-slate-400 cursor-pointer"
                                  >
                                    Clear Filter
                                  </button>
                                )}

                                <div className="h-4 w-px bg-slate-850 mx-1"></div>

                                <button
                                  type="button"
                                  onClick={handleExportCSV}
                                  disabled={criticalRecords.length === 0}
                                  className={`px-3 py-1.5 text-xxs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
                                    criticalRecords.length > 0
                                      ? "bg-slate-900 border-slate-800 text-slate-350 hover:text-amber-400 hover:border-amber-500/40"
                                      : "bg-slate-950 border-slate-900/60 text-slate-600 cursor-not-allowed"
                                  }`}
                                  title="Exportar registros críticos filtrados para arquivo CSV"
                                >
                                  <Download className="h-3 w-3" />
                                  <span>Export Crítico ({criticalRecords.length})</span>
                                </button>
                              </div>
                            </div>
                            <table className="w-full text-left text-xs border-collapse font-sans">
                              <thead>
                                <tr className="border-b border-slate-800 text-slate-450 font-mono select-none bg-slate-900/60">
                                  <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Checksum canónica</th>
                                  <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Suspeito sinalizado</th>
                                  <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Origem documental</th>
                                  <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Classificação</th>
                                  <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Tipo de Alerta</th>
                                  <th className="p-4 font-semibold uppercase text-slate-500 text-[10px]">Nível Ameaça</th>
                                  <th className="p-4 font-semibold uppercase text-slate-500 text-[10px] text-right">Ações</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-850 font-mono">
                                {filtered.length === 0 ? (
                                  <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500 font-sans">
                                      Nenhuma interceptação de segurança ativa com os filtros selecionados.
                                    </td>
                                  </tr>
                                ) : (
                                  filtered.map(item => (
                                    <tr key={item.id} className="hover:bg-slate-900/40 transition">
                                      <td className="p-4 text-rose-500 font-bold select-all text-[11px] truncate max-w-xs text-left">{item.checksum}</td>
                                      <td className="p-4 font-sans text-left">
                                        <div className="flex flex-col">
                                          <span className="font-semibold text-slate-100">{item.inmateName}</span>
                                          <span className="text-[10px] text-slate-400 font-mono">RNR: {item.inmateId}</span>
                                        </div>
                                      </td>
                                      <td className="p-4 text-slate-200 font-semibold font-sans text-left">{item.incidentSource}</td>
                                      <td className="p-4 text-left">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                          item.classification === "SECRETO" ? "bg-red-955/20 border-red-500/20 text-red-400" :
                                          item.classification === "CONFIDENCIAL" ? "bg-amber-955/15 border-amber-500/15 text-amber-400" :
                                          "bg-slate-900 border-slate-800 text-slate-400"
                                        }`}>
                                          {item.classification}
                                        </span>
                                      </td>
                                      <td className="p-4 text-slate-350 font-sans font-medium text-left">{item.alertType}</td>
                                      <td className="p-4 text-left">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                                          item.threatLevel === "Crítico" ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse" :
                                          item.threatLevel === "Alto" ? "bg-rose-950/20 border-rose-500/20 text-rose-350" :
                                          item.threatLevel === "Médio" ? "bg-amber-550/10 border-amber-500/10 text-amber-450" :
                                          "bg-emerald-950/20 border-emerald-500/10 text-emerald-450"
                                        }`}>
                                          {item.threatLevel}
                                        </span>
                                      </td>
                                      <td className="p-4 text-right font-sans">
                                        <div className="flex justify-end gap-2">
                                          <button
                                            type="button"
                                            onClick={() => handleEditClick("inteligencia", item)}
                                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded text-[10px] transition cursor-pointer"
                                          >
                                            Editar
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteClick("inteligencia", item.id)}
                                            className="px-2 py-1 bg-rose-955/15 hover:bg-rose-900/30 border border-rose-900/15 text-rose-400 hover:text-rose-300 rounded text-[10px] transition cursor-pointer"
                                          >
                                            Eliminar
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>
                    </>
                    )}

                    {/* Security Footnote */}
                    <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex items-start gap-3 text-left">
                      <Shield className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Protocolo de Confidencialidade Orgânica (Decreto Lei 14/20)</h4>
                        <p className="text-[10px] font-sans text-slate-500 leading-normal mt-1">
                          Em conformidade com o regime disciplinar de segurança prisional do Ministério do Interior, todos os prontuários médicos, registos de progressão escolar/laboral, e escutas operacionais de inteligência encontram-se selados criptograficamente. O acesso aos bancos especiais de admissão é monitorizado de ponta-a-ponta e devidamente associado às chaves operacionais e IP de proveniência de cada utilizador ativo no sistema central PNAP.
                        </p>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </motion.div>
          )}


          {/* TAB: AUDITORIA NACIONAL - CENTRO FORENSE (Point 8) */}
          {activeTab === "auditing" && (
            <motion.div
              key="auditing-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              {/* Header Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                        AMBIENTE CRÍTICO - MILITAR
                      </span>
                      <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider">
                        CLASSIFICAÇÃO: SECRET
                      </span>
                    </div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-mono mt-2 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-rose-500" /> Centro Nacional de Auditoria Penitenciária (PNAP-AO-AUD)
                    </h2>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      Rastreabilidade policial imediata de todas as ações e consultas. Registo imutável auditado forense por canal militar encriptado.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        writeAuditLog(
                          currentOperator,
                          "PRINT_REPORT",
                          "Auditing",
                          undefined,
                          "Exportação consolidada de log forense de segurança de Luanda-Central."
                        );
                        alert("Relatório Forense de segurança exportado eletronicamente para download ministerial fiscalizador.");
                      }}
                      className="bg-slate-950 hover:bg-slate-900 text-slate-300 font-bold border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-lg text-xxs flex items-center gap-1.5 cursor-pointer font-mono"
                    >
                      <Printer className="h-3.5 w-3.5 text-amber-500" /> EXPORTAR AUDIT LOG
                    </button>
                  </div>
                </div>
              </div>

              {/* Forensic list */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 font-mono text-xxs">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-300 text-xs uppercase tracking-wider">
                    REGISTO FORENSE IMUTÁVEL (ÚLTIMAS {auditRecords.length} AÇÕES)
                  </span>
                  <span className="text-[10px] text-emerald-400 leading-none">● SISTEMA CONSOLIDADO 100% SEGURO</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-slate-300 min-w-[800px]">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500 text-[8.5px] uppercase tracking-wider">
                        <th className="py-2.5">ID REGISTO</th>
                        <th className="py-2.5">TIMESTAMP WAT</th>
                        <th className="py-2.5">OPERADOR (UNIDADE)</th>
                        <th className="py-2.5">AÇÃO (TIPO)</th>
                        <th className="py-2.5">MATRIZ SENSITIVIDADE</th>
                        <th className="py-2.5">DISPOSITIVO IP</th>
                        <th className="py-2.5">SHA-256 INTEGRAÇÃO SEAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60">
                      {auditRecords.map((rec) => {
                        const classColor = 
                          rec.securityClassification === InformationClassification.SECRET ? "bg-rose-500/10 text-rose-400 border-rose-500/20" :
                          rec.securityClassification === InformationClassification.CONFIDENTIAL ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                          rec.securityClassification === InformationClassification.RESTRICTED ? "bg-slate-950 text-slate-300 border-slate-850" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                        
                        return (
                          <tr key={rec.id} className="hover:bg-slate-950/40 transition">
                            <td className="py-3 font-semibold text-sky-400">{rec.id}</td>
                            <td className="py-3 text-slate-400 font-sans">{new Date(rec.timestamp).toLocaleString("pt-PT")}</td>
                            <td className="py-3">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-200">{rec.operatorName}</span>
                                <span className="text-[8.5px] text-slate-500 font-sans">{rec.roleName} (ID: {rec.operatorId})</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-semibold text-slate-300 text-[10px]">{rec.actionType}</span>
                                <span className="text-slate-400 font-sans text-xxs leading-tight text-[10px] break-words max-w-sm">{rec.description}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[7.5px] border ${classColor}`}>
                                {rec.securityClassification}
                              </span>
                            </td>
                            <td className="py-3 text-slate-500 font-semibold">{rec.deviceIp}</td>
                            <td className="py-3 text-slate-600 text-[9px] font-bold tracking-tight select-all">
                              {rec.integrityHash.slice(0, 16)}...{rec.integrityHash.slice(-8)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Legend explanatory matrix (Point 7) */}
                <div className="border-t border-slate-850 pt-4 mt-2 grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[8.5px] text-emerald-400 uppercase">1. NÍVEL PUBLIC</span>
                    <p className="text-slate-400 font-sans text-[10px] leading-relaxed">
                      Informações não sigilosas destinadas ao público geral ou agências civis externas homologadas (Ex: Lotação Oficial de Prisões).
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[8.5px] text-slate-300 uppercase">2. NÍVEL RESTRICTED</span>
                    <p className="text-slate-400 font-sans text-[10px] leading-relaxed">
                      Utilização diária interna por agentes penitenciários (Ex: Fichas cadastrais básicas, alojamento, e escalações de plantão).
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[8.5px] text-amber-400 uppercase">3. NÍVEL CONFIDENTIAL</span>
                    <p className="text-slate-400 font-sans text-[10px] leading-relaxed">
                      Dados protegidos e restritos passíveis de dano institucional e invasão de PII (Ex: Relatórios clínicos médicos de saúde, visitas e exportações).
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[8.5px] text-rose-500 uppercase">4. NÍVEL SECRET</span>
                    <p className="text-slate-400 font-sans text-[10px] leading-relaxed">
                      Alto-escalão estratégico e serviços de inteligência. Acesso estritamente barrado a agentes comuns (Ex: Conspirações de fuga, informantes sigilosos, auditoria técnica).
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB: AMBIENTE SANDBOX - DEVTOOLS (Point 2, 3, & 4) */}
          {activeTab === "sandbox" && (
            <motion.div
              key="sandbox-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              {/* Warnings Banner */}
              <div className="bg-amber-500/10 border-2 border-dashed border-amber-500/30 text-amber-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-1.5 leading-none">
                    <Sliders className="h-4 w-4 animate-spin-slow text-amber-500" /> AMBIENTE DE SIMULAÇÃO MILITAR (SANDBOX DEVTOOLS)
                  </h3>
                  <p className="text-xxs text-slate-300 font-sans mt-1.5 leading-relaxed max-w-2xl">
                    Este ecrã consolida as ferramentas de simulação e inspeção da PNAP-AO. De acordo com o regramento de integridade governamental de Angola, 
                    este módulo está isolado no subcanal pedagógico e é <strong>estritamente removido em ambiente real de produção</strong>.
                  </p>
                </div>
                <div className="shrink-0">
                  <span className="bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xxs font-mono tracking-widest block uppercase animate-pulse shadow">
                    MODO SANDBOX ATIVO
                  </span>
                </div>
              </div>

              {/* Operator Swappable Simulator Pane (Isolate here to satisfy Point 2) */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                <div>
                  <h3 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-amber-500" /> Simulador Ativo de Operador Militante (Quick Switch)
                  </h3>
                  <p className="text-xxs text-slate-400 mt-1 leading-relaxed">
                    Clique num perfil militar abaixo para transitar instantaneamente de login e auditar como a visibilidade do sistema de dados e escopo provincial, estabelecimento ou funcional se comportam.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {operators.map((op) => {
                    const augOp = getAugmentedOperator(op, delegations);
                    const isActive = op.id === currentOperatorId;
                    
                    let roleBadge = "text-sky-400 bg-sky-500/10 border-sky-500/20";
                    if (augOp.roleId === "GENERAL_DIRECTOR") roleBadge = "text-rose-400 bg-rose-500/10 border-rose-500/20";
                    else if (augOp.roleId === "PROVINCIAL_DIRECTOR") roleBadge = "text-purple-400 bg-purple-500/10 border-purple-500/20";
                    else if (augOp.roleId === "PRISON_SECURITY_CHIEF") roleBadge = "text-amber-400 bg-amber-500/10 border-amber-500/20";

                    return (
                      <button
                        key={op.id}
                        onClick={() => {
                          setCurrentOperatorId(op.id);
                          writeAuditLog(
                            augOp,
                            "LOGIN",
                            "Users",
                            op.id,
                            `Troca manual de operador simulado sandbox para: ${op.name}`
                          );
                        }}
                        className={`p-4 rounded-xl border text-left flex flex-col gap-2 cursor-pointer transition-all ${
                          isActive
                            ? "bg-amber-500/10 border-amber-500 text-slate-100 shadow-md ring-1 ring-amber-500/30"
                            : "bg-slate-950 border-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className="text-xs font-bold font-sans text-slate-200">{op.name}</span>
                          <span className="text-[8px] font-mono bg-slate-900 border border-slate-800 px-1 py-0.2 rounded uppercase">
                            {op.sigla}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 leading-none mt-1 text-xxs">
                          <span className="text-amber-500 font-bold">{augOp.systemRole?.name}</span>
                          <span className="text-slate-500 text-[9px]">Scope: {augOp.territorialScope} {augOp.province ? `(${augOp.province})` : ""}</span>
                        </div>
                        
                        {/* Dynamic Delegation Notice badge (Point 4) */}
                        {augOp.activeDelegation && (
                          <div className="bg-purple-900/40 border border-purple-500/30 text-purple-200 text-[8.5px] rounded p-1.5 font-mono mt-1 w-full leading-relaxed">
                            ⚠️ <strong>PODER DELEGADO:</strong> Ativo de cargo Provincial de {operators.find(o => o.id === augOp.activeDelegation.delegatorId)?.name}!
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Outorgar nova delegação de competência temporária (Point 4) */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                  <div>
                    <h3 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-purple-400" /> Outorgar Delegação de Competência (Férias / Impedimento)
                    </h3>
                    <p className="text-xxs text-slate-400 mt-1 leading-relaxed">
                      Emita atos outorgando competências civis e militares para consertar lacunas operacionais quando Diretores estão ausentes do posto.
                    </p>
                  </div>

                  <form onSubmit={handleRegisterDelegation} className="flex flex-col gap-3 font-mono text-xxs text-slate-300">
                    {/* select delegador */}
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 block">DELEGADOR (QUEM DELEGA PODERES):</label>
                      <select
                        value={delDelegatorId}
                        onChange={(e) => setDelDelegatorId(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xxs text-slate-200 outline-none focus:border-amber-500/50 block w-full"
                        required
                      >
                        <option value="">Selecione...</option>
                        {operators.map(op => (
                          <option key={op.id} value={op.id}>{op.name} ({op.roleName})</option>
                        ))}
                      </select>
                    </div>

                    {/* select delegatee */}
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 block">BENEFICIÁRIO (QUEM RECEBE PODERES ADJUNTOS):</label>
                      <select
                        value={delDelegateeId}
                        onChange={(e) => setDelDelegateeId(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xxs text-slate-200 outline-none focus:border-amber-500/50 block w-full"
                        required
                      >
                        <option value="">Selecione...</option>
                        {operators.map(op => (
                          <option key={op.id} value={op.id}>{op.name} ({op.roleName})</option>
                        ))}
                      </select>
                    </div>

                    {/* role being delegated */}
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 block">CARGO PENAL OUTORGADO:</label>
                      <select
                        value={delRoleId}
                        onChange={(e) => setDelRoleId(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2.5 py-2 text-xxs text-slate-200 outline-none focus:border-amber-500/50 block w-full"
                        required
                      >
                        {SYSTEM_ROLES.map(r => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-500 block font-mono">INÍCIO COBERTURA:</label>
                        <input
                          type="date"
                          value={delStart}
                          onChange={(e) => setDelStart(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xxs text-slate-200 outline-none block w-full"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-slate-500 block font-mono">TÉRMINO COBERTURA:</label>
                        <input
                          type="date"
                          value={delEnd}
                          onChange={(e) => setDelEnd(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xxs text-slate-200 outline-none block w-full"
                          required
                        />
                      </div>
                    </div>

                    {/* Justification reason */}
                    <div className="flex flex-col gap-1">
                      <label className="text-slate-500 block select-none">FUNDAMENTO LEGAL / RAZÃO DA AUSÊNCIA:</label>
                      <textarea
                        value={delReason}
                        onChange={(e) => setDelReason(e.target.value)}
                        placeholder="Ex: Ausência por viagem ministerial extraordinária de Luanda..."
                        className="bg-slate-950 border border-slate-800 rounded p-2.5 text-xxs text-slate-200 outline-none leading-relaxed resize-none font-mono"
                        rows={3}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="mt-1 bg-purple-600 hover:bg-purple-500 text-slate-100 font-bold py-2.5 px-4 rounded-xl text-xs flex justify-center items-center gap-2 cursor-pointer transition shadow hover:shadow-purple-500/10 font-sans"
                    >
                      <UserCheck className="h-4 w-4" /> outorgar portaria de delegação
                    </button>
                  </form>
                </div>

                {/* Left block displays role permission configurations matrix tree (Point 1 & 3) */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                  <div>
                    <h3 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                      <Database className="h-4 w-4 text-sky-400" /> Matriz Dinâmica de Permissões vs Cargos Registados
                    </h3>
                    <p className="text-xxs text-slate-400 mt-0.5 leading-relaxed">
                      Representação lógica e parametrizável do motor de segurança do NREP-AO. Adicionar novos cargos (como Director Adjunto) é feito dinamicamente sem tocar em linhas de código!
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 font-mono text-xxs">
                    {SYSTEM_ROLES.map(role => (
                      <div key={role.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200 text-[10.5px]">{role.name}</span>
                          <span className="text-[7.5px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-sky-400 font-extrabold uppercase">
                            ROLE ID: {role.id}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {role.permissions.map((perm, pIdx) => (
                            <span 
                              key={pIdx} 
                              className="text-[8px] bg-slate-900 text-slate-400 border border-slate-850 px-1.5 py-0.5 rounded uppercase font-semibold leading-tight0 hover:text-amber-500 transition-all cursor-default"
                              title="Permissão granular ativa"
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                        <div className="text-[8px] text-slate-500 leading-none flex gap-3 mt-1 justify-end border-t border-slate-900/60 pt-1.5">
                          <span>Escopo Funcional Default: <strong className="text-slate-400">{role.defaultFunctionalScope}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB: DEUS FUNDADOR SUPREME EDITOR */}
          {activeTab === "deus-fundador" && (
            <DeusFundadorPanel
              provinces={PROVINCES_21}
              prisons={prisons}
              setPrisons={setPrisons}
              operators={operators}
              setOperators={setOperators}
              organizationalUnits={organizationalUnits}
              setOrganizationalUnits={setOrganizationalUnits}
              institutionalHierarchy={institutionalHierarchy}
              setInstitutionalHierarchy={setInstitutionalHierarchy}
              writeAuditLog={writeAuditLog}
              currentOperator={currentOperator}
            />
          )}

          {/* TAB 6: SETTINGS / DEFINE & AUDIT LOGS */}
          {activeTab === "settings" && (
            <motion.div
              key="settings-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-mono flex items-center gap-2">
                      <Settings className="h-5 w-5 text-amber-500" /> Definições & Auditoria de Atividade Prisional
                    </h2>
                    <p className="text-xs text-slate-400 font-sans mt-0.5">
                      Gabinete de Tecnologia e Informação do Ministério do Interior (MININT) — Luanda.
                    </p>
                  </div>
                  <span className="bg-slate-950 text-slate-400 px-3 py-1 text-xs border border-slate-800 rounded-lg shrink-0 font-mono flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-amber-500" /> Operação de Segurança Ativa
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                  
                  {/* Left Column: General Configuration Simulators */}
                  <div className="lg:col-span-4 flex flex-col gap-5">
                    
                    <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-4">
                      <div>
                        <h3 className="font-sans font-bold text-xs text-slate-200 uppercase tracking-wider border-b border-slate-900 pb-2 flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-sky-400" /> Simulador de Operador Logado
                        </h3>
                        <p className="text-xxs text-slate-400 mt-1.5 leading-relaxed">
                          Selecione o operador militar para auditar a inserção de novas transações prisionais.
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        {operators.map((op) => (
                          <button
                            key={op.id}
                            type="button"
                            onClick={() => setCurrentOperatorId(op.id)}
                            className={`p-3 rounded-lg border text-left flex flex-col gap-1 cursor-pointer transition-all ${
                              currentOperatorId === op.id
                                ? "bg-amber-500/10 border-amber-500/50 text-amber-100"
                                : "bg-slate-900/40 border-slate-850 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                            }`}
                          >
                            <div className="flex justify-between items-center-wrap gap-1">
                              <span className="text-xs font-bold font-sans text-slate-200">{op.name}</span>
                              <span className="text-[8px] font-mono bg-slate-950 font-bold px-1 rounded uppercase border border-slate-850 tracking-wider">
                                {op.sigla}
                              </span>
                            </div>
                            <span className="text-[10px] text-amber-500 font-semibold leading-none mt-0.5">{op.roleName}</span>
                            <span className="text-[9px] text-slate-400 leading-tight mt-1 opacity-90">{op.roleDescription}</span>
                          </button>
                        ))}
                      </div>

                      {/* Cédula Digital de Segurança e Biometria do Operador Unificado */}
                      <div className="border-t border-slate-900 pt-4 mt-1">
                        {(() => {
                          const activeOp = operators.find(op => op.id === currentOperatorId) || operators[0];

                          const operatorPayload = JSON.stringify({
                            org: "MININT-SISTEMA INTEGRADO-ANGOLA",
                            id: activeOp.id,
                            nome: activeOp.name,
                            cargo: activeOp.roleName,
                            sessao: "AUTENTICADO_TLS_1.3_NREP",
                            escopo: activeOp.level,
                            carimbo: new Date().toLocaleDateString("pt"),
                            chave_cripto: `AES-256-GCM-${activeOp.id.slice(-6)}`
                          }, null, 2);

                          return (
                            <div className="bg-slate-950/80 border border-amber-500/20 hover:border-amber-500/40 rounded-xl p-3.5 flex flex-col gap-3 transition-all duration-300 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none rounded-bl-full"></div>
                              
                              <div className="flex justify-between items-start border-b border-slate-900 pb-2">
                                <div>
                                  <span className="text-[7.5px] font-mono text-amber-500 uppercase tracking-widest font-bold">MINISTÉRIO DO INTERIOR</span>
                                  <h4 className="text-[9.5px] font-bold text-slate-100 mt-0.5 uppercase tracking-wider font-sans">
                                    Cédula de Segurança Operacional
                                  </h4>
                                </div>
                                <span className="text-[7px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase animate-pulse font-bold shrink-0">
                                  ATIVO
                                </span>
                              </div>

                              <div className="flex items-center gap-3">
                                {/* Left: Biometric photo box */}
                                <div className="w-12 h-14 border border-slate-800 rounded bg-slate-900 flex flex-col items-center justify-center font-mono text-[7px] text-slate-500 shrink-0 select-none relative group-hover:border-slate-700 transition">
                                  <Fingerprint className="h-5 w-5 text-amber-500/60 mb-0.5 animate-pulse" />
                                  <span className="text-[5px]">OPERACIONAL</span>
                                </div>

                                {/* Main details */}
                                <div className="flex-1 min-w-0 flex flex-col gap-1 text-[10px]">
                                  <div>
                                    <span className="text-[7px] font-mono text-slate-500 block uppercase">NOME COMPLETO:</span>
                                    <span className="text-xxs font-bold font-sans block text-slate-200 uppercase truncate">
                                      {activeOp.name}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[7px] font-mono text-slate-500 block uppercase">PATENTE / FUNÇÃO:</span>
                                    <span className="text-[9px] font-sans block text-slate-400 leading-tight">
                                      {activeOp.roleName}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-[7px] font-mono text-slate-500 block uppercase">REGISTRO MILITAR:</span>
                                    <span className="text-xxs font-mono block text-amber-500 font-bold leading-none">
                                      {activeOp.id}
                                    </span>
                                  </div>
                                </div>

                                {/* Right: Dynamic verification QR code */}
                                <div className="shrink-0">
                                  <QRCodeImg 
                                    text={operatorPayload} 
                                    size={48} 
                                    className="border border-slate-800 hover:border-amber-500 transition shadow p-0.5 bg-white" 
                                    metadata={{
                                      instituicao: "Ministério do Interior de Angola (MININT)",
                                      idOperador: activeOp.id,
                                      nome: activeOp.name,
                                      funcao: activeOp.roleName,
                                      seguranca: "Assinatura Militar Biométrica SHA-256",
                                      autoridade: "Direção Geral dos Serviços Prisionais (DGSP-AO)",
                                      servidorAutenticado: "Luanda-Central-HQ",
                                      statusSessao: "Operação Militar Homologada"
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="border-t border-slate-900/60 pt-2 text-[7.5px] text-slate-500 font-mono flex justify-between items-center leading-none">
                                <span>Sistemas de Custódia Unificados (Angola)</span>
                                <span className="text-slate-600 font-bold">SERIE OP-B</span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-300">
                        Infraestrutura PostgreSQL Central
                      </h4>
                      <div className="text-[10px] font-mono text-slate-400 flex flex-col gap-2 bg-slate-900/40 p-2.5 rounded border border-slate-900">
                        <div className="flex justify-between">
                          <span>Servidor Central:</span>
                          <span className="text-slate-200">Luanda-HQ (10.224.2.14)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Esquema Ativo:</span>
                          <span className="text-emerald-400">dbo (114 Tabelas DDL)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mecanismo Multi-Tenant:</span>
                          <span className="text-slate-200">Prisão ID Comum (Apoio)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status da Sincronização:</span>
                          <span className="text-emerald-400 font-bold">SHA-256 Validado</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-2.5">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-300">
                        Ações Rápidas de Teste
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Deseja apagar os logs e restaurar o estado inicial de auditoria?")) {
                            setAuditLogs([
                              {
                                id: "AUD-10023",
                                userId: "MININT-OP-089",
                                timestamp: "2026-06-12T14:35:10Z",
                                action: "Admissão",
                                inmateId: "AO-REC-8920",
                                inmateName: "Manuel Sebastião",
                                fieldChanged: "Todos",
                                oldValue: "-",
                                newValue: "Novo Registro (Cela A1-02, EP Viana)"
                              },
                              {
                                id: "AUD-10024",
                                userId: "MININT-OP-112",
                                timestamp: "2026-06-12T15:10:22Z",
                                action: "Transferência",
                                inmateId: "AO-REC-3419",
                                inmateName: "António Ngola",
                                fieldChanged: "assignedPrisonId (Prisão)",
                                oldValue: "EP Sanza Pombo",
                                newValue: "EP Viana"
                              }
                            ]);
                            setAuditCurrentPage(1);
                          }
                        }}
                        className="w-full py-1.8 text-center text-red-400 border border-red-950 text-[10px] font-mono uppercase bg-red-950/20 hover:bg-red-950/40 rounded cursor-pointer transition"
                      >
                        Limpar / Reset Auditoria
                      </button>
                    </div>

                  </div>

                  {/* Right Column: Audit Log & Delegations Component */}
                  <div className="lg:col-span-8 bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-4">
                    
                    {/* View Switcher for Settings Tab (Auditing vs Delegations Portal) */}
                    <div className="flex border-b border-slate-900 pb-3.5 justify-between items-center flex-wrap gap-3">
                      <div className="flex gap-1.5 p-1 bg-slate-900/60 rounded-xl border border-slate-850">
                        <button
                          type="button"
                          onClick={() => setSettingsSubTab("auditing")}
                          className={`px-3.5 py-1.5 rounded-lg text-xxs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                            settingsSubTab === "auditing"
                              ? "bg-amber-500 text-slate-950 font-extrabold shadow-sm"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <Shield className="h-3.5 w-3.5" /> Auditoria Nacional
                        </button>
                        <button
                          type="button"
                          onClick={() => setSettingsSubTab("delegations")}
                          className={`px-3.5 py-1.5 rounded-lg text-xxs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                            settingsSubTab === "delegations"
                              ? "bg-amber-500 text-slate-950 font-extrabold shadow-sm"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <Lock className="h-3.5 w-3.5" /> Quadro de Delegações
                        </button>
                      </div>

                      {/* Small dynamic count indicator of active delegations */}
                      <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-lg font-mono">
                        Portarias de Delegação: <span className="text-amber-500 font-extrabold">{delegations.filter(d => d.status === "ACTIVE" || d.status === "SCHEDULED").length} Vigentes</span>
                      </span>
                    </div>

                    {settingsSubTab === "auditing" ? (
                      <>
                        {/* Component Header & Filters */}
                        <div className="flex flex-col gap-3.5 border-b border-slate-900 pb-4">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                            <div className="flex flex-col">
                              <h3 className="font-sans font-bold text-xs text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                                <Sliders className="h-3.5 w-3.5 text-amber-500" /> Registro de Auditoria Nacional (Audit Log)
                              </h3>
                              <span className="text-[10px] text-slate-500 font-sans mt-0.5">
                                Apresentação em conformidade com o Artigo 12º do regulamento de SI-MININT (RNR Unificado).
                              </span>
                            </div>
                          </div>

                          {/* Controls Row: Search & Filters */}
                          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
                            
                            {/* Search Input */}
                            <div className="relative w-full md:max-w-xs flex items-center">
                              <span className="absolute left-3 text-slate-500">
                                <Search className="h-3.5 w-3.5" />
                              </span>
                              <input
                                type="text"
                                placeholder="Buscar Operator, ID, Recluso..."
                                value={auditSearchQuery}
                                onChange={(e) => {
                                  setAuditSearchQuery(e.target.value);
                                  setAuditCurrentPage(1);
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.8 text-xs text-slate-300 placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            {/* Category filter pills */}
                            <div className="flex gap-1.5 flex-wrap self-start md:self-auto">
                              {(["Todos", "Admissão", "Transferência", "Edição"] as const).map((filterPill) => {
                                const count = auditLogs.filter(log => filterPill === "Todos" || log.action === filterPill).length;
                                return (
                                  <button
                                    key={filterPill}
                                    type="button"
                                    onClick={() => {
                                      setAuditFilterType(filterPill);
                                      setAuditCurrentPage(1);
                                    }}
                                    className={`px-2.5 py-1 text-[10px] font-mono rounded-lg border transition cursor-pointer ${
                                      auditFilterType === filterPill
                                        ? "bg-amber-500/15 text-amber-400 border-amber-500/50 font-bold"
                                        : "bg-slate-900/40 text-slate-400 border-slate-850 hover:bg-slate-900"
                                    }`}
                                  >
                                    {filterPill} ({count})
                                  </button>
                                );
                              })}
                            </div>

                          </div>
                        </div>

                        {/* Simple reactive paginator clamping */}
                        {(() => {
                          const finalMatches = auditLogs.filter(log => {
                            const matchesSearch = 
                              log.id.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                              log.userId.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                              log.inmateName.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                              log.inmateId.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
                              log.fieldChanged.toLowerCase().includes(auditSearchQuery.toLowerCase());
                            const matchesType = auditFilterType === "Todos" || log.action === auditFilterType;
                            return matchesSearch && matchesType;
                          });

                          const totalPages = Math.max(1, Math.ceil(finalMatches.length / auditLogsPerPage));
                          const currentPageClamped = Math.min(auditCurrentPage, totalPages);
                          const startIndex = (currentPageClamped - 1) * auditLogsPerPage;
                          const activeRows = finalMatches.slice(startIndex, startIndex + auditLogsPerPage);

                          // Angola local string helper
                          const formatAuditTimestamp = (isoStr: string) => {
                            try {
                              const d = new Date(isoStr);
                              return d.toLocaleString("pt-PT", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit"
                              }).replace(".", "");
                            } catch (e) {
                              return isoStr;
                            }
                          };

                          return (
                            <div className="flex flex-col gap-4">
                              {/* Table Area */}
                              <div className="overflow-x-auto rounded-lg border border-slate-850">
                                <table className="w-full text-left border-collapse font-mono text-[10px]">
                                  <thead>
                                    <tr className="bg-slate-900/60 text-slate-400 uppercase tracking-wider text-[9px] border-b border-slate-800">
                                      <th className="p-3">ID Log</th>
                                      <th className="p-3">Operador</th>
                                      <th className="p-3">Timestamp (Angola)</th>
                                      <th className="p-3">Operação</th>
                                      <th className="p-3">Alvo / Recluso</th>
                                      <th className="p-3">Campo Alterado</th>
                                      <th className="p-3 text-slate-500">Antigo</th>
                                      <th className="p-3 text-slate-200 font-bold">Novo Valor</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-850 text-slate-350 bg-slate-950/20">
                                    {activeRows.length === 0 ? (
                                      <tr>
                                        <td colSpan={8} className="p-8 text-center text-slate-600">
                                          Nenhum registro de auditoria corresponde aos critérios de pesquisa ativos.
                                        </td>
                                      </tr>
                                    ) : (
                                      activeRows.map((log) => {
                                        // badge color
                                        let badgeStyle = "bg-slate-900 text-slate-400 border-slate-800";
                                        if (log.action === "Admissão") {
                                          badgeStyle = "bg-emerald-950/80 text-emerald-400 border border-emerald-900/50";
                                        } else if (log.action === "Transferência") {
                                          badgeStyle = "bg-sky-950/80 text-sky-400 border border-sky-900/50";
                                        } else if (log.action === "Edição") {
                                          badgeStyle = "bg-purple-950/80 text-purple-400 border border-purple-900/50";
                                        }

                                        return (
                                          <tr key={log.id} className="hover:bg-slate-900/35 transition-colors">
                                            <td className="p-3 font-bold text-slate-400">{log.id}</td>
                                            <td className="p-3">
                                              <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow" />
                                                {log.userId}
                                              </div>
                                            </td>
                                            <td className="p-3 text-slate-400 whitespace-nowrap">{formatAuditTimestamp(log.timestamp)}</td>
                                            <td className="p-3">
                                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide inline-block ${badgeStyle}`}>
                                                {log.action}
                                              </span>
                                            </td>
                                            <td className="p-3 max-w-[150px] truncate">
                                              <div className="flex flex-col gap-0.5">
                                                <span className="text-slate-200 font-sans font-semibold text-[11px] leading-tight">{log.inmateName}</span>
                                                <span className="text-[9px] text-slate-500 font-mono">{log.inmateId}</span>
                                              </div>
                                            </td>
                                            <td className="p-3 text-sky-400/80 max-w-[125px] truncate font-semibold" title={log.fieldChanged}>{log.fieldChanged}</td>
                                            <td className="p-3 text-slate-500 max-w-[110px] truncate">{log.oldValue}</td>
                                            <td className="p-3 text-slate-100 max-w-[160px] truncate font-sans font-medium" title={log.newValue}>
                                              {log.newValue}
                                            </td>
                                          </tr>
                                        );
                                      })
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              {/* Pagination Control Bar */}
                              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-900/40 border border-slate-850 p-3 rounded-lg">
                                <span className="text-[10px] text-slate-400 font-sans">
                                  Mostrando <span className="font-mono text-slate-200">{finalMatches.length > 0 ? startIndex + 1 : 0}</span> a{" "}
                                  <span className="font-mono text-slate-200">{Math.min(startIndex + auditLogsPerPage, finalMatches.length)}</span> de{" "}
                                  <span className="font-mono text-amber-500 font-bold">{finalMatches.length}</span> registros de auditoria
                                </span>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={currentPageClamped === 1}
                                    onClick={() => setAuditCurrentPage(prev => Math.max(1, prev - 1))}
                                    className="px-3 py-1 text-[10px] font-mono border border-slate-800 rounded bg-slate-950 hover:bg-slate-900 text-slate-350 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition select-none font-semibold"
                                  >
                                    &lt; Anterior
                                  </button>
                                  
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Pág. <span className="text-amber-500 font-bold">{currentPageClamped}</span> de <span className="text-slate-300 font-bold">{totalPages}</span>
                                  </span>

                                  <button
                                    type="button"
                                    disabled={currentPageClamped >= totalPages}
                                    onClick={() => setAuditCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    className="px-3 py-1 text-[10px] font-mono border border-slate-800 rounded bg-slate-950 hover:bg-slate-900 text-slate-350 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition select-none font-semibold"
                                  >
                                    Seguinte &gt;
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    ) : (
                      <div className="flex flex-col gap-5">
                        {/* Header information box with integrated Date Filters */}
                        <div className="border-b border-slate-900 pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex flex-col gap-1">
                            <h3 className="font-sans font-bold text-xs text-slate-100 uppercase tracking-wider flex items-center gap-1.5 text-amber-500">
                              <Lock className="h-4 w-4 text-amber-500" /> Portal Oficial de Delegações de Competências (NREP-AO)
                            </h3>
                            <span className="text-[10px] text-slate-400 leading-normal font-sans max-w-xl">
                              Central de rastreabilidade de outorga de poderes e patentes administrativas prisionais sob o carimbo criptográfico do MININT de Angola.
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 shrink-0">
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] text-slate-500 uppercase font-mono font-bold">Data Inicial</label>
                              <input
                                type="date"
                                value={delegationFilterStartDate}
                                onChange={(e) => setDelegationFilterStartDate(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xxs text-slate-300 font-mono focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] text-slate-400 uppercase font-mono font-bold">Data Final</label>
                              <input
                                type="date"
                                value={delegationFilterEndDate}
                                onChange={(e) => setDelegationFilterEndDate(e.target.value)}
                                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xxs text-slate-300 font-mono focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                              />
                            </div>
                            {(delegationFilterStartDate || delegationFilterEndDate) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDelegationFilterStartDate("");
                                  setDelegationFilterEndDate("");
                                }}
                                className="bg-slate-950 hover:bg-slate-900 text-amber-500 border border-amber-500/25 px-3 py-1.5 rounded-lg text-xxs font-mono font-bold uppercase cursor-pointer transition h-[24px] flex items-center justify-center mt-3"
                              >
                                Limpar
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Summary metric cards (Bento Style!) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/20 p-2.5 rounded-xl border border-slate-900">
                          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 flex flex-col gap-1 font-mono">
                            <span className="text-[8px] text-slate-500 uppercase tracking-widest leading-none">Total Outorgadas</span>
                            <span className="text-xl font-bold font-sans text-slate-100">{delegations.length}</span>
                          </div>
                          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 flex flex-col gap-1 font-mono">
                            <span className="text-[8px] text-slate-500 uppercase tracking-widest leading-none">Portarias Ativas</span>
                            <span className="text-xl font-bold font-sans text-emerald-400">
                              {delegations.filter(d => d.status === "ACTIVE").length}
                            </span>
                          </div>
                          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 flex flex-col gap-1 font-mono">
                            <span className="text-[8px] text-slate-500 uppercase tracking-widest leading-none">Agendadas</span>
                            <span className="text-xl font-bold font-sans text-amber-500">
                              {delegations.filter(d => d.status === "SCHEDULED").length}
                            </span>
                          </div>
                          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-850 flex flex-col gap-1 font-mono">
                            <span className="text-[8px] text-slate-500 uppercase tracking-widest leading-none">Terminadas/Revogadas</span>
                            <span className="text-xl font-bold font-sans text-slate-550">
                              {delegations.filter(d => d.status === "EXPIRED" || d.status === "REVOKED").length}
                            </span>
                          </div>
                        </div>

                        {/* List Area - Responsive Table Layout */}
                        <div className="mt-1">
                          {(() => {
                            // Date formatter
                            const formatDatePt = (str: string) => {
                              try {
                                if (!str) return "-";
                                const parts = str.split("-");
                                if (parts.length === 3) {
                                  return `${parts[2]}/${parts[1]}/${parts[0]}`;
                                }
                                return str;
                              } catch (e) {
                                return str;
                              }
                            };

                            const filteredDelegations = delegations.filter((del) => {
                              if (delegationFilterStartDate && del.startDate < delegationFilterStartDate) {
                                return false;
                              }
                              if (delegationFilterEndDate && del.endDate > delegationFilterEndDate) {
                                return false;
                              }
                              if (delegationFilterStatus && del.status !== delegationFilterStatus) {
                                return false;
                              }
                              if (delegationSearchQuery) {
                                const q = delegationSearchQuery.toLowerCase().trim();
                                const delegatorObj = NREP_OPERATORS.find(op => op.id === del.delegatorId);
                                const delegateeObj = NREP_OPERATORS.find(op => op.id === del.delegateeId);
                                const delegatorName = (delegatorObj?.name || "").toLowerCase();
                                const delegateeName = (delegateeObj?.name || "").toLowerCase();
                                if (!delegatorName.includes(q) && !delegateeName.includes(q)) {
                                  return false;
                                }
                              }
                              return true;
                            });

                            const sortedDelegations = [...filteredDelegations].sort((a, b) => {
                              if (!delegationSortKey) return 0;
                              let valA = "";
                              let valB = "";

                              switch (delegationSortKey) {
                                case "id":
                                  valA = a.id || "";
                                  valB = b.id || "";
                                  break;
                                case "delegator":
                                  const opA = NREP_OPERATORS.find(op => op.id === a.delegatorId);
                                  const opB = NREP_OPERATORS.find(op => op.id === b.delegatorId);
                                  valA = opA?.name || "";
                                  valB = opB?.name || "";
                                  break;
                                case "delegatee":
                                  const delA = NREP_OPERATORS.find(op => op.id === a.delegateeId);
                                  const delB = NREP_OPERATORS.find(op => op.id === b.delegateeId);
                                  valA = delA?.name || "";
                                  valB = delB?.name || "";
                                  break;
                                case "role":
                                  const rA = SYSTEM_ROLES.find(r => r.id === a.roleId);
                                  const rB = SYSTEM_ROLES.find(r => r.id === b.roleId);
                                  valA = rA?.name || "";
                                  valB = rB?.name || "";
                                  break;
                                case "period":
                                  valA = a.startDate || "";
                                  valB = b.startDate || "";
                                  break;
                                case "validity":
                                  valA = a.endDate || "";
                                  valB = b.endDate || "";
                                  break;
                                case "status":
                                  valA = a.status || "";
                                  valB = b.status || "";
                                  break;
                                default:
                                  break;
                              }

                              const strA = String(valA).toLowerCase();
                              const strB = String(valB).toLowerCase();

                              if (strA < strB) return delegationSortDirection === "asc" ? -1 : 1;
                              if (strA > strB) return delegationSortDirection === "asc" ? 1 : -1;
                              return 0;
                            });

                            if (delegations.length === 0) {
                              return (
                                <div className="text-center p-12 bg-slate-900/20 rounded-xl border border-slate-900 border-dashed text-slate-500 text-xxs font-mono uppercase">
                                  Nenhuma delegação de competência registada no sistema.
                                </div>
                              );
                            }

                            if (filteredDelegations.length === 0) {
                              return (
                                <div className="text-center p-12 bg-slate-900/20 rounded-xl border border-slate-900 border-dashed text-slate-500 text-xxs font-mono uppercase">
                                  Nenhuma delegação encontrada no intervalo de datas selecionado.
                                </div>
                              );
                            }

                            const handleExportCSV = () => {
                              const headers = [
                                "Delegador",
                                "Beneficiário",
                                "Cargo Outorgado",
                                "Período",
                                "Prazo de Validade",
                                "Motivo",
                                "Status"
                              ];

                              const csvRows = [headers.join(",")];

                              sortedDelegations.forEach(del => {
                                const delegatorObj = NREP_OPERATORS.find(op => op.id === del.delegatorId);
                                const delegateeObj = NREP_OPERATORS.find(op => op.id === del.delegateeId);
                                const roleObj = SYSTEM_ROLES.find(r => r.id === del.roleId);

                                const escapeCSV = (str: string) => {
                                  const clean = (str || "").replace(/"/g, '""');
                                  return `"${clean}"`;
                                };

                                const values = [
                                  escapeCSV(delegatorObj?.name || "Autoridade Geral"),
                                  escapeCSV(delegateeObj?.name || "Operador Indicado"),
                                  escapeCSV(roleObj?.name || "Cargo Outorgado"),
                                  escapeCSV(`${del.startDate} a ${del.endDate}`),
                                  escapeCSV(del.endDate),
                                  escapeCSV(del.reason || "Convenção ordinária de outorga."),
                                  escapeCSV(del.status)
                                ];

                                csvRows.push(values.join(","));
                              });

                              const csvString = "\uFEFF" + csvRows.join("\r\n");
                              const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.setAttribute("href", url);
                              link.setAttribute("download", `delecoes_competencias_export_${new Date().toISOString().split('T')[0]}.csv`);
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            };

                            return (
                              <div className="flex flex-col gap-3">
                                <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900/10 border border-slate-900/60 p-2.5 rounded-lg gap-3">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                                    <div className="relative max-w-xs w-full">
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Search className="h-3.5 w-3.5 text-slate-500" />
                                      </span>
                                      <input
                                        id="delegation-search-input"
                                        type="text"
                                        value={delegationSearchQuery}
                                        onChange={(e) => setDelegationSearchQuery(e.target.value)}
                                        placeholder="Pesquisar delegador ou beneficiário..."
                                        className="w-full bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-amber-500/50 text-slate-200 placeholder-slate-500 text-[10px] pl-8.5 pr-8 py-1.5 rounded-lg font-mono focus:outline-none transition duration-150"
                                      />
                                      {delegationSearchQuery && (
                                        <button
                                          type="button"
                                          onClick={() => setDelegationSearchQuery("")}
                                          className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-550 hover:text-slate-300 font-bold font-sans text-xs cursor-pointer"
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </div>

                                    {/* Filtrar por Status */}
                                    <select
                                      id="delegation-status-filter"
                                      value={delegationFilterStatus}
                                      onChange={(e) => setDelegationFilterStatus(e.target.value)}
                                      className="bg-slate-950/60 border border-slate-850 hover:border-slate-800 focus:border-amber-500/50 text-slate-300 text-[10px] px-2.5 py-1.5 rounded-lg font-mono focus:outline-none transition duration-150 cursor-pointer"
                                    >
                                      <option value="">TODOS OS STATUS</option>
                                      <option value="ACTIVE">ATIVAS (ACTIVE)</option>
                                      <option value="SCHEDULED">AGENDADAS (SCHEDULED)</option>
                                      <option value="REVOKED">REVOGADAS (REVOKED)</option>
                                      <option value="EXPIRED">EXPIRADAS (EXPIRED)</option>
                                    </select>

                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                                        A mostrar <strong className="text-slate-200">{sortedDelegations.length}</strong> de <strong className="text-slate-200">{delegations.length}</strong> portarias
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    id="export-delegations-button"
                                    type="button"
                                    onClick={handleExportCSV}
                                    className="bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 px-3 py-1.5 rounded-lg text-xxs font-mono font-bold uppercase cursor-pointer transition duration-150 flex items-center gap-1.5 shadow-sm shadow-emerald-500/5 self-start md:self-auto"
                                  >
                                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Exportar CSV
                                  </button>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-slate-850">
                                  <table className="w-full text-left border-collapse font-mono text-xxs">
                                  <thead id="delegation-table-header">
                                    <tr className="bg-slate-900/80 text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-800">
                                      <th className="p-3.5 font-bold cursor-pointer select-none hover:text-slate-200 transition-colors" onClick={() => toggleDelegationSort("id")}>
                                        Portaria {renderDelegationSortIndicator("id")}
                                      </th>
                                      <th className="p-3.5 font-bold cursor-pointer select-none hover:text-slate-200 transition-colors" onClick={() => toggleDelegationSort("delegator")}>
                                        Delegador {renderDelegationSortIndicator("delegator")}
                                      </th>
                                      <th className="p-3.5 font-bold cursor-pointer select-none hover:text-slate-200 transition-colors" onClick={() => toggleDelegationSort("delegatee")}>
                                        Beneficiário {renderDelegationSortIndicator("delegatee")}
                                      </th>
                                      <th className="p-3.5 font-bold cursor-pointer select-none hover:text-slate-200 transition-colors" onClick={() => toggleDelegationSort("role")}>
                                        Cargo Outorgado {renderDelegationSortIndicator("role")}
                                      </th>
                                      <th className="p-3.5 font-bold cursor-pointer select-none hover:text-slate-200 transition-colors" onClick={() => toggleDelegationSort("period")}>
                                        Período {renderDelegationSortIndicator("period")}
                                      </th>
                                      <th className="p-3.5 font-bold cursor-pointer select-none hover:text-slate-200 transition-colors" onClick={() => toggleDelegationSort("validity")}>
                                        Prazo de Validade {renderDelegationSortIndicator("validity")}
                                      </th>
                                      <th className="p-3.5 font-bold text-slate-400">
                                        Motivo
                                      </th>
                                      <th className="p-3.5 font-bold cursor-pointer select-none hover:text-slate-200 transition-colors" onClick={() => toggleDelegationSort("status")}>
                                        Status {renderDelegationSortIndicator("status")}
                                      </th>
                                      <th className="p-3.5 font-bold text-center">Ações</th>
                                    </tr>
                                  </thead>
                                  <tbody id="delegation-table-body" className="divide-y divide-slate-850 text-slate-350 bg-slate-950/20">
                                    {sortedDelegations.map((del) => {
                                      const delegatorObj = NREP_OPERATORS.find(op => op.id === del.delegatorId);
                                      const delegateeObj = NREP_OPERATORS.find(op => op.id === del.delegateeId);
                                      const roleObj = SYSTEM_ROLES.find(r => r.id === del.roleId);

                                      // Calculate remaining hours to expire relative to simulated today "2026-06-14"
                                      let hoursLeft = 0;
                                      let isExpiringSoon = false;
                                      let isOverdue = false;
                                      if (del.endDate) {
                                        try {
                                          const end = new Date(`${del.endDate}T23:59:59`);
                                          const ref = new Date("2026-06-14T23:59:59");
                                          const diffMs = end.getTime() - ref.getTime();
                                          hoursLeft = diffMs / (1000 * 60 * 60);
                                          isExpiringSoon = (del.status === "ACTIVE") && hoursLeft > 0 && hoursLeft <= 48;
                                          isOverdue = (del.status === "ACTIVE") && hoursLeft <= 0;
                                        } catch (e) {
                                          // Ignore
                                        }
                                      }

                                      // Determine badge styling based on target status
                                      let statusBadgeClass = "";
                                      let statusDotClass = "";
                                      let statusLabel = "";
                                      let StatusIcon = HelpCircle;

                                      if (del.status === "ACTIVE") {
                                        statusBadgeClass = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-450/10";
                                        statusDotClass = "bg-emerald-400 animate-pulse";
                                        statusLabel = "ACTIVE";
                                        StatusIcon = CheckCircle2;
                                      } else if (del.status === "SCHEDULED") {
                                        statusBadgeClass = "bg-amber-500/15 text-amber-500 border-amber-500/30 shadow-sm shadow-amber-450/10";
                                        statusDotClass = "bg-amber-500";
                                        statusLabel = "SCHEDULED";
                                        StatusIcon = Clock;
                                      } else if (del.status === "REVOKED") {
                                        statusBadgeClass = "bg-red-500/15 text-red-400 border-red-500/30 shadow-sm shadow-red-450/10";
                                        statusDotClass = "bg-red-400";
                                        statusLabel = "REVOKED";
                                        StatusIcon = AlertTriangle;
                                      } else { // EXPIRED or others
                                        statusBadgeClass = "bg-red-500/15 text-red-400 border-red-505/30 shadow-sm shadow-red-450/10";
                                        statusDotClass = "bg-red-500";
                                        statusLabel = "EXPIRED";
                                        StatusIcon = AlertTriangle;
                                      }

                                      return (
                                        <tr key={del.id} className="hover:bg-slate-900/40 transition-colors">
                                          {/* ID Column */}
                                          <td className="p-3.5 whitespace-nowrap align-middle">
                                            <span className="bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                              {del.id}
                                            </span>
                                          </td>

                                          {/* Delegador Column */}
                                          <td className="p-3.5 align-middle">
                                            <div className="flex flex-col gap-0.5 min-w-[150px]">
                                              <span className="text-slate-250 font-sans font-bold text-xs uppercase">
                                                {delegatorObj?.name || "Autoridade Geral"}
                                              </span>
                                              <span className="text-[9px] text-slate-500 font-mono">
                                                ID: {del.delegatorId} • {delegatorObj?.roleName || "Director Central"}
                                              </span>
                                            </div>
                                          </td>

                                          {/* Beneficiário Column */}
                                          <td className="p-3.5 align-middle">
                                            <div className="flex flex-col gap-0.5 min-w-[150px]">
                                              <span className="text-slate-100 font-sans font-bold text-xs uppercase">
                                                {delegateeObj?.name || "Operador Indicado"}
                                              </span>
                                              <span className="text-[9px] text-sky-500/85 font-mono">
                                                ID: {del.delegateeId} • {delegateeObj?.roleName || "Operador de Atendimento"}
                                              </span>
                                            </div>
                                          </td>

                                          {/* Cargo Outorgado Column */}
                                          <td className="p-3.5 align-middle whitespace-nowrap">
                                            <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded text-[10px] font-sans font-bold uppercase tracking-wide">
                                              {roleObj?.name || "Comissário Ad-hoc"}
                                            </span>
                                          </td>

                                          {/* Período Column */}
                                          <td className="p-3.5 align-middle whitespace-nowrap">
                                            <span className="text-slate-300 font-mono text-[10px] bg-slate-950/60 px-2.5 py-1 rounded border border-slate-900 flex items-center gap-1 w-fit">
                                              <Calendar className="h-3 w-3 text-slate-550 shrink-0" /> {formatDatePt(del.startDate)} - {formatDatePt(del.endDate)}
                                            </span>
                                          </td>

                                          {/* Prazo de Validade Column */}
                                          <td className="p-3.5 align-middle whitespace-nowrap">
                                            <div className="flex flex-col gap-1.5 justify-center">
                                              <span className="text-slate-300 font-mono text-[10px] bg-slate-950/60 px-2.5 py-1 rounded border border-slate-900 flex items-center gap-1.5 w-fit">
                                                <Calendar className="h-3 w-3 text-slate-550 shrink-0" />
                                                {formatDatePt(del.endDate)}
                                              </span>
                                              {isExpiringSoon && (
                                                <span className="inline-flex items-center gap-1.5 text-[8.5px] font-bold text-amber-405 uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-lg animate-pulse w-fit shadow-sm shadow-amber-500/5">
                                                  <AlertTriangle className="h-2.5 w-2.5 text-amber-550 shrink-0" />
                                                  Expira em {Math.round(hoursLeft)}h
                                                </span>
                                              )}
                                              {isOverdue && (
                                                <span className="inline-flex items-center gap-1.5 text-[8.5px] font-bold text-red-405 uppercase tracking-wider bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-lg w-fit shadow-sm shadow-red-500/5">
                                                  <AlertTriangle className="h-2.5 w-2.5 text-red-550 shrink-0" />
                                                  Expirada
                                                </span>
                                              )}
                                            </div>
                                          </td>

                                           {/* Motivo Column */}
                                           <td className="p-3.5 align-middle max-w-[220px] whitespace-normal">
                                             <div className="text-slate-350 text-[10px] font-sans leading-relaxed line-clamp-2 hover:line-clamp-none transition-all cursor-help" title={del.reason || "Sem justificativa adicional registrada."}>
                                               {del.reason || "Convenção ordinária de outorga."}
                                             </div>
                                           </td>

                                          {/* Status Column */}
                                          <td className="p-3.5 align-middle whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded text-[9px] font-extrabold uppercase font-mono tracking-widest border inline-flex items-center gap-1.5 ${statusBadgeClass}`}>
                                              <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass} shrink-0`} />
                                              <StatusIcon className="h-3.5 w-3.5 shrink-0" />
                                              {statusLabel}
                                            </span>
                                          </td>

                                          {/* Actions Column */}
                                          <td className="p-3.5 align-middle text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2">
                                              {(del.status === "ACTIVE" || del.status === "SCHEDULED") ? (
                                                <>
                                                  <button
                                                    type="button"
                                                    onClick={() => setDelegationToRevoke(del)}
                                                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 hover:border-amber-500/30 active:scale-95 text-[10px] uppercase tracking-wide font-mono font-bold px-2.5 py-1 rounded-lg cursor-pointer transition duration-150 shadow-sm flex items-center gap-1"
                                                    title="Revogação Rápida da Delegação"
                                                  >
                                                    <Zap className="h-3 w-3 shrink-0" /> Ação Rápida
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleRevokeDelegation(del.id)}
                                                    className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 active:scale-95 text-[10px] uppercase tracking-wide font-mono font-bold px-2.5 py-1 rounded-lg cursor-pointer transition duration-150 shadow-sm"
                                                  >
                                                    Revogar
                                                  </button>
                                                </>
                                              ) : (
                                                <button
                                                  type="button"
                                                  disabled
                                                  className="bg-slate-900 text-slate-600 border border-slate-850 text-[10px] uppercase tracking-wide font-mono font-bold px-2.5 py-1 rounded-lg opacity-40 cursor-not-allowed select-none"
                                                >
                                                  Revogado
                                                </button>
                                              )}
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  alert(`Cópia certificada da portaria legislada ${del.id} foi impressa localmente com autenticidade TLS-1.3.`);
                                                }}
                                                className="bg-slate-900 hover:bg-slate-850 text-slate-350 border border-slate-800 text-[10px] uppercase font-sans font-bold px-2 py-1 rounded-lg cursor-pointer transition hover:text-slate-100 animate-fade-in"
                                              >
                                                Imprimir
                                              </button>
                                              <button
                                                id={`history-delegation-${del.id}`}
                                                type="button"
                                                onClick={() => setSelectedHistoryDelegation(del)}
                                                className="bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-amber-400 border border-slate-800 hover:border-slate-700 text-[10px] uppercase font-sans font-bold px-2.5 py-1 rounded-lg cursor-pointer transition flex items-center gap-1 shadow-sm active:scale-95"
                                                title="Visualizar histórico completo de transições de status da outorga"
                                              >
                                                <History className="h-3 w-3 shrink-0" />
                                                Histórico
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                          })()}
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: CÓDIGO PENAL GERAL (População Obrigatória Grupos A, B, C) */}
          {activeTab === "penal-code" && (
            <motion.div
              key="penal-code-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-amber-500 font-mono">
                      Acervo Penal Geral - Novo Código Penal de Angola (2020/2021)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Tabelas de apoio consolidadas com artigos da lei, perigosidades integradas ao cálculo automático de lotação e sugestão de segurança de celas.
                    </p>
                  </div>
                  
                  <span className="bg-slate-950 text-slate-400 px-3 py-1 text-xs border border-slate-800 rounded-lg shrink-0 font-mono">
                     Chave de Pesquisa: Direta
                  </span>
                </div>

                {/* Grid of the 3 Groups A, B, C */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                  
                  {/* Grupo A */}
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
                    <div className="border-b border-slate-800 pb-2">
                      <span className="bg-red-950 text-red-400 border border-red-900/45 px-2.5 py-0.5 rounded text-xxs font-mono font-bold">
                        GRUPO A
                      </span>
                      <h3 className="font-sans font-bold text-sm text-slate-100 mt-2">
                        {PENAL_CODE_GROUPS.grupA.name}
                      </h3>
                      <p className="text-xxs text-slate-400 leading-normal mt-1">
                        {PENAL_CODE_GROUPS.grupA.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                      {PENAL_CODE_GROUPS.grupA.crimes.map(c => (
                        <div key={c.id} className="bg-slate-900/60 p-3 border border-slate-800/80 rounded flex flex-col gap-1 leading-snug">
                          <div className="flex justify-between items-center text-slate-300 font-mono text-xxs">
                            <span className="font-semibold text-amber-500">{c.article}</span>
                            <span className="bg-slate-950 px-1.5 py-0.2 rounded text-slate-500 text-[10px]">{c.id}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-200 mt-0.5 font-sans leading-tight">{c.name}</span>
                          <div className="flex justify-between items-center text-xxs font-mono mt-2 pt-2 border-t border-slate-950 text-slate-400">
                            <span>Pena: {c.penaltyRange}</span>
                            <span className={`text-[9px] uppercase font-bold text-red-400`}>Risco: {c.riskLevel}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grupo B */}
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
                    <div className="border-b border-slate-800 pb-2">
                      <span className="bg-orange-950 text-orange-400 border border-orange-900/45 px-2.5 py-0.5 rounded text-xxs font-mono font-bold">
                        GRUPO B
                      </span>
                      <h3 className="font-sans font-bold text-sm text-slate-100 mt-2">
                        {PENAL_CODE_GROUPS.grupB.name}
                      </h3>
                      <p className="text-xxs text-slate-400 leading-normal mt-1">
                        {PENAL_CODE_GROUPS.grupB.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                      {PENAL_CODE_GROUPS.grupB.crimes.map(c => (
                        <div key={c.id} className="bg-slate-900/60 p-3 border border-slate-800/80 rounded flex flex-col gap-1 leading-snug">
                          <div className="flex justify-between items-center text-slate-300 font-mono text-xxs">
                            <span className="font-semibold text-amber-500">{c.article}</span>
                            <span className="bg-slate-950 px-1.5 py-0.2 rounded text-slate-500 text-[10px]">{c.id}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-200 mt-0.5 font-sans leading-tight">{c.name}</span>
                          <div className="flex justify-between items-center text-xxs font-mono mt-2 pt-2 border-t border-slate-950 text-slate-400">
                            <span>Pena: {c.penaltyRange}</span>
                            <span className={`text-[9px] uppercase font-bold text-orange-400`}>Risco: {c.riskLevel}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grupo C */}
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
                    <div className="border-b border-slate-800 pb-2">
                      <span className="bg-blue-950 text-blue-400 border border-blue-900/45 px-2.5 py-0.5 rounded text-xxs font-mono font-bold">
                        GRUPO C
                      </span>
                      <h3 className="font-sans font-bold text-sm text-slate-100 mt-2">
                        {PENAL_CODE_GROUPS.grupC.name}
                      </h3>
                      <p className="text-xxs text-slate-400 leading-normal mt-1">
                        {PENAL_CODE_GROUPS.grupC.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                      {PENAL_CODE_GROUPS.grupC.crimes.map(c => (
                        <div key={c.id} className="bg-slate-900/60 p-3 border border-slate-800/80 rounded flex flex-col gap-1 leading-snug">
                          <div className="flex justify-between items-center text-slate-300 font-mono text-xxs">
                            <span className="font-semibold text-amber-500">{c.article}</span>
                            <span className="bg-slate-950 px-1.5 py-0.2 rounded text-slate-500 text-[10px]">{c.id}</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-200 mt-0.5 font-sans leading-tight">{c.name}</span>
                          <div className="flex justify-between items-center text-xxs font-mono mt-2 pt-2 border-t border-slate-950 text-slate-400">
                            <span>Pena: {c.penaltyRange}</span>
                            <span className={`text-[9px] uppercase font-bold text-sky-400`}>Risco: {c.riskLevel}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Automation guidelines and integration explanation */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4 font-mono text-xxs leading-relaxed">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  Especificações de Automação de Alocação de reclusos por Artigos Penais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300 font-sans">
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded flex flex-col gap-2">
                    <span className="text-xxs font-bold uppercase font-mono text-amber-400">
                       Algoritmo de Atribuição de Segurança
                    </span>
                    <p className="text-[11px] leading-relaxed">
                      Ao selecionar o crime legal do recluso, a API determina o nível de perigo original (Máximo, Alto, Médio, Baixo). Esse cálculo do risco determina o <strong>Pavilhão Sugerido</strong> ideal na unidade prisionária recetora para mitigar conflitos e isolar líderes de gangs inter-provinciais.
                    </p>
                  </div>
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded flex flex-col gap-2">
                    <span className="text-xxs font-bold uppercase font-mono text-sky-400">
                       Integração de Tribunais de Angola
                    </span>
                    <p className="text-[11px] leading-relaxed">
                      Este módulo de Código Penal partilha esquemas idênticos com o banco de dados unificado do Conselho Superior da Magistratura Judicial de Luanda. O mandado de soltura eletrónico interseta a validade imediata, executando solturas automáticas integradas.
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
            </>
          )}
        </AnimatePresence>

        {/* Dynamic Success Decree Card Overlay Modal */}
        <AnimatePresence>
          {successOverlayMsg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col font-mono text-xxs"
              >
                {/* Header */}
                <div className="bg-amber-500 text-slate-950 p-4 font-sans font-extrabold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-950">
                    <CheckCircle className="h-4 w-4" /> GUIA HOMOLOGADA COM SUCESSO
                  </span>
                  <button 
                    onClick={() => setSuccessOverlayMsg(null)}
                    className="hover:scale-110 active:scale-95 transition-all text-slate-950 font-bold bg-slate-950/15 hover:bg-slate-950/25 p-1 rounded-full text-xxs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Content Case */}
                <div className="p-6 flex flex-col gap-4 text-slate-300">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-xs font-bold uppercase text-slate-100 font-sans tracking-wide">
                      {successOverlayMsg.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1">
                      DIRECÇÃO GERAL DE SERVIÇOS PENITENCIÁRIOS — MININT ANGOLA
                    </p>
                  </div>

                  <p className="text-[11px] font-sans leading-relaxed text-slate-300 bg-slate-950 border border-slate-850 p-3.5 rounded-xl">
                    {successOverlayMsg.desc}
                  </p>

                  {/* Digital signatures - Point 9 */}
                  <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 flex flex-col gap-2">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-1">
                      ASSINATURAS INSTITUCIONAIS REGISTADAS
                    </span>
                    <div className="flex justify-between items-center text-[8.5px] text-slate-400 font-semibold leading-none pt-1">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-200">{currentOperator.name}</span>
                        <span className="text-slate-500 font-sans">{currentOperator.roleName} (ID: {currentOperator.id})</span>
                      </div>
                      <div className="text-right flex flex-col gap-1 shrink-0">
                        <span className="text-sky-400 font-extrabold uppercase">● CHAVE BIOMÉTRICA</span>
                        <span className="text-slate-600">0xCG92B-W19A</span>
                      </div>
                    </div>
                  </div>

                  {/* QR code representing and SHA-256 (PII-secure QR code - storing only doc_id and hash) */}
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-center gap-4">
                    <div className="bg-white p-1 rounded shrink-0">
                      {/* Using QrCode icon layout as design element */}
                      <QrCode className="h-10 w-10 text-slate-950" />
                    </div>
                    <div className="flex flex-col gap-1 h-full justify-center">
                      <span className="text-[9px] font-bold text-emerald-400 uppercase leading-none">SELADO DIGITALMENTE POR CRIPTOGRAFIA SEAL</span>
                      <span className="text-[7.5px] text-slate-500 leading-normal max-w-[280px] break-words uppercase font-semibold">
                        HASH: {successOverlayMsg.hash} <br/>
                        PAYLOAD: DOCUMENT ID {successOverlayMsg.hash.slice(8, 16)} | VERIFICAÇÃO BIOMÉTRICA HOMOLOGADA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="bg-slate-950 px-5 py-3.5 border-t border-slate-850 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      alert("Impressão direta enviada para impressora térmica da Direção Geral.");
                    }}
                    className="bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl text-[10px] flex items-center gap-1 cursor-pointer font-sans"
                  >
                    <Printer className="h-3.5 w-3.5 text-amber-500" /> Imprimir Papel Mandado
                  </button>
                  <button
                    type="button"
                    onClick={() => setSuccessOverlayMsg(null)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-[10px] cursor-pointer font-sans"
                  >
                    Confirmar Certificação
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Confirmation Dialog for Quick Revoke */}
        <AnimatePresence>
          {delegationToRevoke && (() => {
            const delegatorObj = NREP_OPERATORS.find(op => op.id === delegationToRevoke.delegatorId);
            const delegateeObj = NREP_OPERATORS.find(op => op.id === delegationToRevoke.delegateeId);
            const roleObj = SYSTEM_ROLES.find(r => r.id === delegationToRevoke.roleId);
            const inlineFormatDate = (str: string) => {
              try {
                if (!str) return "-";
                const parts = str.split("-");
                if (parts.length === 3) {
                  return `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
                return str;
              } catch (e) {
                return str;
              }
            };
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col font-sans"
                >
                  {/* Header */}
                  <div className="bg-red-600 text-white p-4 font-extrabold text-xs uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-white font-sans">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-white animate-pulse" /> CONFIRMAR REVOGAÇÃO RÁPIDA
                    </span>
                    <button 
                      onClick={() => setDelegationToRevoke(null)}
                      className="hover:scale-110 active:scale-95 transition-all text-white font-bold bg-white/10 hover:bg-white/20 p-1.5 rounded-full text-xxs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex flex-col gap-4 text-slate-300 text-xs">
                    <div className="text-slate-400 leading-relaxed font-semibold">
                      Tem certeza que deseja revogar esta portaria de delegação de competência? Os efeitos retrocessivos e privilégios associados serão cancelados de imediato.
                    </div>

                    <div className="bg-slate-950/65 border border-slate-850 p-4 rounded-xl flex flex-col gap-2.5 font-mono text-[10px]">
                      <div className="flex justify-between border-b border-slate-900 pb-1.5">
                        <span className="text-slate-500 font-bold">PORTARIA ID:</span>
                        <span className="text-slate-200 font-extrabold">{delegationToRevoke.id}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 border-b border-slate-900 pb-1.5">
                        <span className="text-slate-500 font-bold">DELEGADOR (AUTORIDADE):</span>
                        <span className="text-slate-300 font-bold">{delegatorObj?.name} ({delegatorObj?.roleName})</span>
                      </div>
                      <div className="flex flex-col gap-0.5 border-b border-slate-900 pb-1.5">
                        <span className="text-slate-500 font-bold">BENEFICIÁRIO:</span>
                        <span className="text-slate-300 font-bold">{delegateeObj?.name} ({delegateeObj?.roleName})</span>
                      </div>
                      <div className="flex flex-col gap-0.5 border-b border-slate-900 pb-1.5">
                        <span className="text-slate-500 font-bold">FUNÇÃO OUTORGADA:</span>
                        <span className="text-amber-400 bg-amber-500/10 border border-amber-500/35 px-1.5 py-0.5 rounded text-[9px] w-fit font-sans font-extrabold uppercase mt-1">
                          {roleObj?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">PERÍODO VIGENTE:</span>
                        <span className="text-slate-300 font-bold">{inlineFormatDate(delegationToRevoke.startDate)} - {inlineFormatDate(delegationToRevoke.endDate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Confirmation Panel */}
                  <div className="bg-slate-950 px-5 py-3.5 border-t border-slate-850 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDelegationToRevoke(null)}
                      className="bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl text-[10px] cursor-pointer transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleRevokeDelegation(delegationToRevoke.id, true);
                        setDelegationToRevoke(null);
                      }}
                      className="bg-red-600 hover:bg-red-500 hover:scale-[1.02] active:scale-95 text-white font-extrabold px-4 py-2 rounded-xl text-[10px] cursor-pointer transition flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5 shrink-0" /> Confirmar Revogação
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {isStructureCrudOpen && structureCrudType && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="bg-slate-950 px-5 py-4 border-b border-slate-850 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-500 font-mono tracking-wider uppercase">
                  {structureCrudType.startsWith("CREATE") ? "⚙️ Adicionar Estrutura" : 
                   structureCrudType.startsWith("EDIT") ? "📝/⚙️ Editar Estrutura" : "⚠️ Excluir Estrutura"}
                </span>
                <span className="text-[10px] text-slate-500 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 uppercase font-semibold">
                  {structureCrudType.split("_")[1]}
                </span>
              </div>

              <form onSubmit={handleStructureCrudSubmit} className="p-5 flex flex-col gap-4 text-xs font-sans">
                
                {/* Delete Warning */}
                {structureCrudType.startsWith("DELETE") && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-350 leading-relaxed text-xxs mb-2 flex flex-col gap-1.5">
                    <span className="font-extrabold uppercase font-mono tracking-wider text-red-400">Atenção Autonomia Regional:</span>
                    <span>Tem certeza absoluta de que deseja excluir o elemento <strong>{crudFormName}</strong> (ID: {crudTargetId})? Esta ação é irreversível se propagará em cascata a todas as subestruturas associadas.</span>
                  </div>
                )}

                {!structureCrudType.startsWith("DELETE") && (
                  <>
                    {/* Common Name field */}
                    {structureCrudType !== "CREATE_CELL" && structureCrudType !== "EDIT_CELL" && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 uppercase font-mono font-bold text-xxs">Nome / Designação Oficial:</label>
                        <input
                          type="text"
                          required
                          value={crudFormName}
                          onChange={(e) => setCrudFormName(e.target.value)}
                          placeholder="Ex: Pavilhão B - Regime Fechado"
                          className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-semibold"
                        />
                      </div>
                    )}

                    {/* Cell Name / Code Field */}
                    {(structureCrudType === "CREATE_CELL" || structureCrudType === "EDIT_CELL") && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 uppercase font-mono font-bold text-xxs">Identificação da Cela (Código/Número):</label>
                        <input
                          type="text"
                          required
                          value={crudFormName}
                          onChange={(e) => setCrudFormName(e.target.value)}
                          placeholder="Ex: Cela A-01, Solitária 2"
                          className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 font-mono font-semibold"
                        />
                      </div>
                    )}

                    {/* Province field (Read-only or Pre-filled) */}
                    {structureCrudType === "CREATE_MUNICIPALITY" && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 uppercase font-mono font-bold text-xxs">Província Jurisdicional:</label>
                        <input
                          type="text"
                          readOnly
                          value={crudFormProvince}
                          className="bg-slate-950 border border-slate-850 p-2.5 rounded-lg text-slate-400 cursor-not-allowed font-semibold"
                        />
                      </div>
                    )}

                    {/* Prison Fields: Capacidade Oficial & Limite Operacional */}
                    {(structureCrudType === "CREATE_PRISON" || structureCrudType === "EDIT_PRISON") && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-slate-400 uppercase font-mono font-bold text-xxs">Capacidade Oficial:</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={crudFormOfficialCapacity}
                            onChange={(e) => setCrudFormOfficialCapacity(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 font-semibold"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-slate-400 uppercase font-mono font-bold text-xxs">Limite Operacional:</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={crudFormOperationalCapacity}
                            onChange={(e) => setCrudFormOperationalCapacity(Number(e.target.value))}
                            className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 font-semibold"
                          />
                        </div>
                      </div>
                    )}

                    {/* Pavilion Specialty/Regime Tag */}
                    {(structureCrudType === "CREATE_PAVILION" || structureCrudType === "EDIT_PAVILION") && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 uppercase font-mono font-bold text-xxs">Regime de Segurança:</label>
                        <select
                          value={crudFormRegime}
                          onChange={(e) => setCrudFormRegime(e.target.value)}
                          className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer font-semibold"
                        >
                          <option value="FECHADO (Segurança Máxima)">Fechado (Segurança Máxima)</option>
                          <option value="FECHADO (Regime Geral)">Fechado (Regime Geral)</option>
                          <option value="SEMI-ABERTO">Semi-Aberto</option>
                          <option value="ABERTO / TRABALHO">Aberto / Trabalho</option>
                          <option value="ADMISSÃO / TRIAGEM">Admissão / Triagem</option>
                        </select>
                      </div>
                    )}

                    {/* Cell Capacity */}
                    {(structureCrudType === "CREATE_CELL" || structureCrudType === "EDIT_CELL") && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 uppercase font-mono font-bold text-xxs">Lotação Máxima da Cela:</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="100"
                          value={crudFormCellCapacity}
                          onChange={(e) => setCrudFormCellCapacity(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 font-semibold"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Actions Panel */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-850 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsStructureCrudOpen(false);
                      setStructureCrudType(null);
                    }}
                    className="bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-850 px-4 py-2.5 rounded-xl cursor-pointer transition font-bold uppercase font-mono text-xxs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition uppercase font-mono text-xxs ${
                      structureCrudType.startsWith("DELETE")
                        ? "bg-red-600 hover:bg-red-500 text-white animate-pulse"
                        : "bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold"
                    }`}
                  >
                    {structureCrudType.startsWith("DELETE") ? "Excluir Definitivamente" : "Confirmar e Gravar"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        </section>
      </main>

      {/* Footer Nacional */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-4 mt-auto flex flex-col md:flex-row items-center justify-between text-xxs text-slate-500 gap-3 font-mono">
        <div>
          © 2026 Plataforma Nacional de Administração Penitenciária (PNAP-AO). Todos os direitos reservados.
        </div>
        <div className="flex gap-4">
          <span className="hover:text-slate-300">Gabinete de Tecnologia e Informação do MININT</span>
          <span>•</span>
          <span className="hover:text-slate-300 text-amber-500 font-bold">PostgreSQL Enterprise Model (Port: 5432)</span>
        </div>
      </footer>

      {/* SELETOR DE FUNÇÕES / COMMAND CENTER MODAL OVERLAY */}
      {isModuleSelectorOpen && (
        <div id="module-selector-modal" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn text-left">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => setIsModuleSelectorOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Fechar painel"
            >
              <Plus className="h-5 w-5 transform rotate-45" />
            </button>

            {/* Header / National Crest */}
            <div className="pb-4 border-b border-slate-800 mb-6 flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                <Shield className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-mono">
                  Ministério do Interior • PNAP-AO
                </span>
                <h2 className="text-base font-bold text-slate-200 tracking-tight flex items-center gap-2">
                  Seletor de Funções e Módulos Operacionais
                </h2>
              </div>
            </div>

            {/* Scrollable grid area */}
            <div className="overflow-y-auto pr-1 flex-1 flex flex-col gap-6 scrollbar-thin">
              
              {/* Category 1 */}
              <div>
                <h3 className="text-xxs font-mono uppercase tracking-widest text-slate-400 mb-3 font-semibold border-l-2 border-amber-500 pl-2">
                  Mapeamento e Controle Penitenciário
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  
                  {/* Dashboard */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab("dashboard"); setIsModuleSelectorOpen(false); }}
                    className={`p-4 rounded-xl border text-left transition-all hover:bg-slate-850 cursor-pointer ${
                      activeTab === "dashboard" ? "bg-slate-850 border-amber-500/40 shadow-lg" : "bg-slate-950/45 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <Building className="h-5 w-5 text-amber-500 shrink-0" />
                      <span className="font-sans font-bold text-xs text-slate-200">Lotação e Risco</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                      Monitoramento de capacidade de pavilhões, taxas de sobrevivência e níveis de reclusos perigosos.
                    </p>
                  </button>

                  {/* Admissions */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab("admissions"); setIsModuleSelectorOpen(false); }}
                    className={`p-4 rounded-xl border text-left transition-all hover:bg-slate-850 cursor-pointer ${
                      activeTab === "admissions" ? "bg-slate-850 border-emerald-500/40 shadow-lg" : "bg-slate-950/45 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <Users className="h-5 w-5 text-emerald-400 shrink-0" />
                      <span className="font-sans font-bold text-xs text-slate-200">Admissão e Ubicação</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                      Cadastro unificado de reclusos (RNR), foto e guias de detenção com sincronismo IndexedDB.
                    </p>
                  </button>

                  {/* Movements */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab("movements"); setIsModuleSelectorOpen(false); }}
                    className={`p-4 rounded-xl border text-left transition-all hover:bg-slate-850 cursor-pointer ${
                      activeTab === "movements" ? "bg-slate-850 border-sky-500/40 shadow-lg" : "bg-slate-950/45 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <Activity className="h-5 w-5 text-sky-400 shrink-0" />
                      <span className="font-sans font-bold text-xs text-slate-200">Movimentações Penais</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                      Registro de escoltas militares, vistos sanitários, transferências e fluxo inter-provincial.
                    </p>
                  </button>

                </div>
              </div>

              {/* Category 2 */}
              <div>
                <h3 className="text-xxs font-mono uppercase tracking-widest text-slate-400 mb-3 font-semibold border-l-2 border-indigo-500 pl-2">
                  Legislação, Vias Jurídicas e Documentos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  
                  {/* Penal Code */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab("penal-code"); setIsModuleSelectorOpen(false); }}
                    className={`p-4 rounded-xl border text-left transition-all hover:bg-slate-850 cursor-pointer ${
                      activeTab === "penal-code" ? "bg-slate-850 border-indigo-500/40 shadow-lg" : "bg-slate-950/45 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <Scale className="h-5 w-5 text-indigo-400 shrink-0" />
                      <span className="font-sans font-bold text-xs text-slate-200">Código Penal Geral</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                      Base canônica da legislação criminal de Angola, cálculo de penas e regimes penais ordinários.
                    </p>
                  </button>

                  {/* Documents */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab("documents"); setIsModuleSelectorOpen(false); }}
                    className={`p-4 rounded-xl border text-left transition-all hover:bg-slate-850 cursor-pointer ${
                      activeTab === "documents" ? "bg-slate-850 border-amber-500/40 shadow-lg" : "bg-slate-950/45 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <FileText className="h-5 w-5 text-amber-500 shrink-0" />
                      <span className="font-sans font-bold text-xs text-slate-200">Emissão de Documentos</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                      Geração de alvarás de soltura oficiais, requisições de fardamento militar e relatórios para a comarca.
                    </p>
                  </button>

                  {/* Special Services (Saúde, Educação, Trabalho, Inteligência) */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab("special-services"); setIsModuleSelectorOpen(false); }}
                    className={`p-4 rounded-xl border text-left transition-all hover:bg-slate-850 cursor-pointer ${
                      activeTab === "special-services" ? "bg-slate-850 border-teal-500/40 shadow-lg" : "bg-slate-950/45 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <Briefcase className="h-5 w-5 text-teal-400 shrink-0" />
                      <span className="font-sans font-bold text-xs text-slate-200">Serviços e Reinserção</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                      Gerenciamento de saúde clínica militar, ensino carcerário, trabalho voluntário e reinserção social.
                    </p>
                  </button>

                </div>
              </div>

              {/* Category 3 */}
              <div>
                <h3 className="text-xxs font-mono uppercase tracking-widest text-slate-400 mb-3 font-semibold border-l-2 border-rose-500 pl-2">
                  Auditoria, Infraestrutura e Definições
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  
                  {/* Auditing */}
                  {hasPermission(SystemPermission.VIEW_AUDITING) && (
                    <button
                      type="button"
                      onClick={() => { setActiveTab("auditing"); setIsModuleSelectorOpen(false); }}
                      className={`p-4 rounded-xl border text-left transition-all hover:bg-slate-850 cursor-pointer ${
                        activeTab === "auditing" ? "bg-slate-850 border-rose-500/40 shadow-lg" : "bg-slate-950/45 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <Shield className="h-5 w-5 text-rose-400 shrink-0" />
                        <span className="font-sans font-bold text-xs text-slate-200">Auditoria de Operações</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                        Sistema forense de controle de carimbos criptográficos dos operadores penais civis e militares.
                      </p>
                    </button>
                  )}

                  {/* ERD */}
                  {isTabVisible("erd", currentOperator.role) && (
                    <button
                      type="button"
                      onClick={() => { setActiveTab("erd"); setIsModuleSelectorOpen(false); }}
                      className={`p-4 rounded-xl border text-left transition-all hover:bg-slate-850 cursor-pointer ${
                        activeTab === "erd" ? "bg-slate-850 border-purple-500/40 shadow-lg" : "bg-slate-950/45 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <Database className="h-5 w-5 text-purple-400 shrink-0" />
                        <span className="font-sans font-bold text-xs text-slate-200">ERD Relacional</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                        Diagrama conceitual do consórcio com 114 tabelas integradas em conformidade com as regras do SICP.
                      </p>
                    </button>
                  )}

                  {/* Sandbox */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab("sandbox"); setIsModuleSelectorOpen(false); }}
                    className={`p-4 rounded-xl border text-left transition-all hover:bg-slate-850 cursor-pointer ${
                      activeTab === "sandbox" ? "bg-slate-850 border-gray-550/40 shadow-lg" : "bg-slate-950/45 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <Sliders className="h-5 w-5 text-slate-400 shrink-0" />
                      <span className="font-sans font-bold text-xs text-slate-200">Mapeamento e Perfis</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                      Painel simulador sandbox para alterar patentes dos operadores, forçar perda de rede e criar dados.
                    </p>
                  </button>

                  {/* Settings */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab("settings"); setIsModuleSelectorOpen(false); }}
                    className={`p-4 rounded-xl border text-left transition-all hover:bg-slate-850 cursor-pointer ${
                      activeTab === "settings" ? "bg-slate-850 border-gray-500/40 shadow-lg" : "bg-slate-950/45 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <Settings className="h-5 w-5 text-slate-450 shrink-0" />
                      <span className="font-sans font-bold text-xs text-slate-200">Ajustes de Sistema</span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                      Configurações de chaves privadas nacionais de contingência de rede e tempos de sincronismo.
                    </p>
                  </button>

                  {/* Deus Fundador */}
                  {currentOperator.role === "DIRECTOR_GERAL" && (
                    <button
                      type="button"
                      onClick={() => { setActiveTab("deus-fundador"); setIsModuleSelectorOpen(false); }}
                      className={`p-4 rounded-xl border text-left transition-all hover:bg-slate-850 cursor-pointer ${
                        activeTab === "deus-fundador" ? "bg-slate-850 border-amber-500/50 shadow-lg" : "bg-slate-950/45 border-amber-500/25 hover:border-amber-500/45"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <Crown className="h-5 w-5 text-amber-400 shrink-0" />
                        <span className="font-sans font-bold text-xs text-amber-400">👑 Deus Fundador</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                        Poder supremo administrativo. Criação física de blocos prisionais, pavilhões e comandos locais.
                      </p>
                    </button>
                  )}

                </div>
              </div>

            </div>

            {/* Modal Footer / Operators Information */}
            <div className="mt-6 border-t border-slate-850 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[10px] font-mono text-slate-500">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                <span>Operador: <strong className="text-slate-400 font-bold">{currentOperator.name}</strong> ({currentOperator.role})</span>
              </div>
              <div>
                PNAP-AO Central Hub • Conexão Criptografada
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );

  // Helper calculation for summing inmate risk profiles
  function mockSumRisk(level: string) {
    let total = 0;
    prisons.forEach(p => {
      total += p.riskBreakdown[level as keyof typeof p.riskBreakdown] || 0;
    });
    // Add dynamically added volatile inmates
    const addedCount = inmates.filter(i => i.riskLevel === level && !INITIAL_INMATES.some(init => init.id === i.id)).length;
    return total + addedCount;
  }
}

// Custom Interactive Tooltip renderers for Business Intelligence visualization
function CustomAdmissionsTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = data.preventivas + data.condenacoes;

    // Simulate flow stats inside the selected month
    const avgDaily = (total / 30).toFixed(1);
    const estMaxSingleDay = Math.ceil(total * 0.12 + 2);

    // Distribution split per week of the selected month
    const weeks = [
      { name: "Semana 1", preventivas: Math.round(data.preventivas * 0.22), condenacoes: Math.round(data.condenacoes * 0.24) },
      { name: "Semana 2", preventivas: Math.round(data.preventivas * 0.28), condenacoes: Math.round(data.condenacoes * 0.26) },
      { name: "Semana 3", preventivas: Math.round(data.preventivas * 0.25), condenacoes: Math.round(data.condenacoes * 0.25) },
      { name: "Semana 4", preventivas: data.preventivas - Math.round(data.preventivas * 0.22) - Math.round(data.preventivas * 0.28) - Math.round(data.preventivas * 0.25), condenacoes: data.condenacoes - Math.round(data.condenacoes * 0.24) - Math.round(data.condenacoes * 0.26) - Math.round(data.condenacoes * 0.25) }
    ];

    return (
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-2xl max-w-xs text-xs font-mono select-none flex flex-col gap-3">
        <div className="border-b border-slate-800 pb-2">
          <p className="text-amber-500 font-bold text-sm font-sans">{label}</p>
          <p className="text-[10px] text-slate-400">Fluxo de Entrada Mensal</p>
        </div>

        <div className="flex flex-col gap-1 text-slate-300">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Métricas Estimadas:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xxs">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Preventivas: <strong>{data.preventivas}</strong></span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Condenações: <strong>{data.condenacoes}</strong></span>
            <span className="text-slate-400">Média Diária:</span> <strong>~{avgDaily}/dia</strong>
            <span className="text-slate-400">Pico Num Só Dia:</span> <strong>{estMaxSingleDay} recl.</strong>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-2 flex flex-col gap-1.5">
          <p className="text-[10px] text-amber-500/80 font-semibold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1 h-1 bg-amber-500 rounded-full animate-ping"></span> Detalhamento Semanal de Entradas:
          </p>
          <div className="flex flex-col gap-1 text-[10px]">
            {weeks.map((week) => (
              <div key={week.name} className="flex justify-between items-center text-slate-400 hover:text-slate-200">
                <span>{week.name}:</span>
                <span className="font-bold text-slate-200">
                  {week.preventivas + week.condenacoes} <span className="text-[8px] text-slate-500">({week.preventivas}P / {week.condenacoes}C)</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-850 pt-1.5 text-[9px] text-slate-500 flex justify-between">
          <span>Ingressos Totais no Mês:</span>
          <span className="font-bold text-slate-400">{total} reclusos</span>
        </div>
      </div>
    );
  }
  return null;
}

function CustomIncidentsTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = data.Agressao + data.Fuga + data.PosseIlicita + data.Indisciplina;
    
    // Distribute total incidents among days of the week deterministically
    const weekdays = [
      { name: "Segunda-feira", ratio: 0.15 },
      { name: "Terça-feira", ratio: 0.12 },
      { name: "Quarta-feira", ratio: 0.18 },
      { name: "Quinta-feira", ratio: 0.14 },
      { name: "Sexta-feira", ratio: 0.22 },
      { name: "Sábado", ratio: 0.11 },
      { name: "Domingo", ratio: 0.08 }
    ];

    let distributedSum = 0;
    const dailyBreakdown = weekdays.map((day, ix) => {
      let count = Math.round(total * day.ratio);
      if (ix === weekdays.length - 1) {
        count = Math.max(0, total - distributedSum);
      } else {
        distributedSum += count;
      }
      return { name: day.name, count };
    });

    return (
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-2xl max-w-xs text-xs font-mono select-none flex flex-col gap-3">
        <div className="border-b border-slate-800 pb-2">
          <p className="text-red-400 font-bold text-sm font-sans">{label}</p>
          <p className="text-[10px] text-slate-400">Detalhamento Operacional de Incidentes</p>
        </div>
        
        <div className="flex flex-col gap-1 text-slate-300">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Por Categoria:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xxs">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Agressões: <strong>{data.Agressao}</strong></span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>Fugas: <strong>{data.Fuga}</strong></span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>Posse Ilícita: <strong>{data.PosseIlicita}</strong></span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Indisciplinas: <strong>{data.Indisciplina}</strong></span>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-2 flex flex-col gap-1.5">
          <p className="text-[10px] text-red-400/80 font-semibold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1 h-1 bg-red-500 rounded-full animate-ping"></span> Detalhamento Diário (Últimos 7 dias):
          </p>
          <div className="flex flex-col gap-1 text-[10px]">
            {dailyBreakdown.map((day) => (
              <div key={day.name} className="flex justify-between items-center text-slate-400 hover:text-slate-200">
                <span>{day.name}:</span>
                <span className="font-bold text-slate-200 bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded min-w-[20px] text-center">
                  {day.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-850 pt-1.5 text-[9px] text-slate-500 flex justify-between">
          <span>Alertas Totais Guardados:</span>
          <span className="font-bold text-slate-400">{total} ocorrências</span>
        </div>
      </div>
    );
  }
  return null;
}

function CustomDonutTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-2xl max-w-xs text-xs font-mono flex flex-col gap-1.5 select-none text-slate-300">
        <div className="border-b border-slate-850 pb-1.5 flex items-center justify-between">
          <span className="font-bold font-sans tracking-wide text-xs uppercase" style={{ color: data.color }}>
            Grau {data.name}
          </span>
          <span className="text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded font-bold" style={{ color: data.color }}>
            {data.percent}%
          </span>
        </div>
        <p className="text-xxs">Distribuição Real-Time:</p>
        <p className="text-slate-100 font-bold text-[11px] font-mono">
          {data.value} <span className="text-slate-500 font-normal">reclusos integrados</span>
        </p>
        <p className="text-[10px] text-slate-400 font-sans leading-relaxed border-t border-slate-900 pt-1.5">
          {data.desc}
        </p>
      </div>
    );
  }
  return null;
}

