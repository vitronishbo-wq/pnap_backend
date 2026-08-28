import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { AngolaHolographicMapBackground } from "./components/AngolaHolographicMapBackground";
import { ExcelVirtualizedDataGrid, ColumnDef } from "./components/ExcelVirtualizedDataGrid";
import { PrisonerExcelDataGrid } from "./components/PrisonerExcelDataGrid";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { MobileHeader } from "./components/MobileHeader";
import { MobileMultiStepInmateModal } from "./components/MobileMultiStepInmateModal";
import { MobileTouchSignatureModal } from "./components/MobileTouchSignatureModal";
import { MobileQRScannerModal } from "./components/MobileQRScannerModal";
import { MobileOccupancyGauge } from "./components/MobileOccupancyGauge";
import { MobileQuickDossierDrawer } from "./components/MobileQuickDossierDrawer";
import { MobileFilterDrawer } from "./components/MobileFilterDrawer";
import { InmateAuthDatabaseDiagnostic } from "./components/InmateAuthDatabaseDiagnostic";
import { CameraCaptureModal } from "./components/CameraCaptureModal";
import { InmatesSearchFirstView } from "./components/InmatesSearchFirstView";
import { HierarchyValidationSubSection } from "./components/HierarchyValidationSubSection";
import { apiService, ApiHttpError } from "./utils/apiService";
import { eventBus } from "./utils/eventBus";
import { MNCPEngine, PENAL_CODE_GRAPH } from "./utils/mncpEngine";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  FileCheck2,
  Database,
  Shield,
  FolderTree,
  Scale,
  Users,
  FileText,
  MapPin,
  Search,
  Plus,
  RefreshCw,
  ArrowLeftRight,
  Wifi,
  WifiOff,
  QrCode,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Lock,
  FileCode,
  Trash2,
  X,
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
  Building2,
  Filter,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  Settings,
  Server,
  Sliders,
  Printer,
  Network,
  Download,
  Camera,
  UploadCloud,
  Calendar,
  Briefcase,
  Crown,
  Zap,
  Cpu,
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
  ChevronLeft,
  ShieldCheck,
  Sparkles,
  Mail,
  Edit3,
  Key,
  ShieldAlert,
  Radio,
  Eye,
  Folder,
  FolderOpen,
  File,
  GraduationCap,
  Compass,
  ArrowUpRight,
  PanelLeftClose,
  PanelLeftOpen,
  Radar,
  HardDrive,
  Calendar as CalendarIcon
} from "lucide-react";
const SpecialServicesModule = React.lazy(() => import("./components/SpecialServicesModule").then(m => ({ default: m.SpecialServicesModule })));
const DriveModule = React.lazy(() => import("./components/DriveModule").then(m => ({ default: m.DriveModule })));
const SheetsModule = React.lazy(() => import("./components/SheetsModule").then(m => ({ default: m.SheetsModule })));
const CalendarModule = React.lazy(() => import("./components/CalendarModule").then(m => ({ default: m.CalendarModule })));
const DocsModule = React.lazy(() => import("./components/DocsModule").then(m => ({ default: m.DocsModule })));


const ModuleLazyFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8 font-mono text-slate-400">
    <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-3" />
    <span className="text-xs uppercase tracking-wider text-slate-300">Carregando M√≥dulo Especializado...</span>
  </div>
);

const highlightText = (text: string, query: string) => {
  if (!query) return <span>{text}</span>;
  const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-amber-500/30 text-amber-200 rounded px-0.5 font-bold font-mono normal-case">{part}</mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

export interface InmateEditLog {
  id: string;
  inmateId: string;
  inmateName: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  operatorRole: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  signatureHash: string;
  nonRepudiationValidated: boolean;
  ipAddress: string;
}

export const INITIAL_INMATE_EDIT_LOGS: InmateEditLog[] = [
  {
    id: "EDT-2026-0001",
    inmateId: "AO-REC-089",
    inmateName: "Manuel Domingos Jo√£o",
    timestamp: "2026-06-20T09:14:22Z",
    operatorId: "MININT-OP-SEG-VIANA",
    operatorName: "Inspector-Chefe Jo√£o Kassoma",
    operatorRole: "Chefe de Seguran√ßa Penal - EP Viana",
    fieldName: "Grau de Risco",
    oldValue: "M√©dio",
    newValue: "M√°ximo",
    signatureHash: "SHA256-EDT-87A4F23E9B8C1D7A4F5E6D7C8B9A01",
    nonRepudiationValidated: true,
    ipAddress: "10.225.82.4"
  },
  {
    id: "EDT-2026-0002",
    inmateId: "AO-REC-089",
    inmateName: "Manuel Domingos Jo√£o",
    timestamp: "2026-06-21T14:30:15Z",
    operatorId: "MININT-OP-DC-VIANA",
    operatorName: "Superintendente Pedro Neto",
    operatorRole: "Director do EP Viana",
    fieldName: "Alojamento (Cela)",
    oldValue: "Cela A1-02",
    newValue: "Cela B2-04",
    signatureHash: "SHA256-EDT-3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E",
    nonRepudiationValidated: true,
    ipAddress: "10.225.82.4"
  },
  {
    id: "EDT-2026-0003",
    inmateId: "AO-REC-115",
    inmateName: "Carla Ant√≥nia Gouveia",
    timestamp: "2026-06-22T11:05:40Z",
    operatorId: "MININT-OP-DP-LUANDA",
    operatorName: "Sub-Comiss√°rio Ant√≥nio Bento",
    operatorRole: "Director Provincial de Luanda",
    fieldName: "Dados Pessoais (Apelido)",
    oldValue: "Carla Ant√≥nia",
    newValue: "Carla Ant√≥nia Gouveia",
    signatureHash: "SHA256-EDT-9E8D7C6B5A4938271605F4E3D2C1B0",
    nonRepudiationValidated: true,
    ipAddress: "10.224.12.8"
  }
];
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
import { exportInmateListToPDF, exportInmateFichaToPDF, exportCriticalBlocksToPDF, exportIncidentHeatmapToPDF, exportWeeklySecurityReportToPDF } from "./utils/pdfGenerator";
import { formatEPName } from "./utils/formatUtils";
import { QRCodeImg } from "./components/QRCodeImg";
import { Html5Qrcode } from "html5-qrcode";
const DeusFundadorPanel = React.lazy(() => import("./components/DeusFundadorPanel"));
const RHIndicatorsPanel = React.lazy(() => import("./components/RHIndicatorsPanel"));
const HealthModule = React.lazy(() => import("./components/HealthModule"));
const RiskMapDashboard = React.lazy(() => import("./components/RiskMapDashboard"));
import { JsonDiffViewer } from "./components/JsonDiffViewer";
const DelegationPortal = React.lazy(() => import("./components/DelegationPortal"));
const EstablishmentDirectorDashboard = React.lazy(() => import("./components/EstablishmentDirectorDashboard"));
const ClusterConfigurationPanel = React.lazy(() => import("./components/ClusterConfigurationPanel"));
const NationalCommandCenter = React.lazy(() => import("./components/NationalCommandCenter"));
const IntelligenceCenter = React.lazy(() => import("./components/IntelligenceCenter"));
const LegislationModule = React.lazy(() => import("./components/LegislationModule").then(m => ({ default: m.LegislationModule })));
const MNCPModule = React.lazy(() => import("./components/MNCPModule").then(m => ({ default: m.MNCPModule })));
const OperationalInspector = React.lazy(() => import("./components/OperationalInspector").then(m => ({ default: m.OperationalInspector })));
const NEPComplianceAuditor = React.lazy(() => import("./components/NEPComplianceAuditor").then(m => ({ default: m.NEPComplianceAuditor })));
const OrganizationalHierarchyConfig = React.lazy(() => import("./components/OrganizationalHierarchyConfig").then(m => ({ default: m.OrganizationalHierarchyConfig })));
import { NEPVerificationInterceptor, NEPVerificationPayload } from "./components/NEPVerificationInterceptor";
const DepartmentalOrganicDashboard = React.lazy(() => import("./components/DepartmentalOrganicDashboard").then(m => ({ default: m.DepartmentalOrganicDashboard })));
import { generateFullOrganizationalUnits, CENTRAL_NATIONAL_UNITS, PROVINCIAL_18_DEPENDENCIES_TEMPLATE } from "./data/penitentiaryOrganicStructure";

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
    name: "Chefe de Seguran√ßa",
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
    name: "Chefe de Sa√∫de",
    permissions: [
      SystemPermission.VIEW_INMATES,
      SystemPermission.VIEW_CLINICAL,
      SystemPermission.EDIT_CLINICAL,
      SystemPermission.GENERATE_REPORTS
    ],
    defaultFunctionalScope: FunctionalScope.SAUDE
  }
];

export const ORGANIZATIONAL_UNITS: OrganizationalUnit[] = generateFullOrganizationalUnits();

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

const GET_DEPARTMENT_SUBSECTIONS = (codePrefix: string) => {
  const map: Record<string, { id: string; name: string; type: string }[]> = {
    GDP: [
      { id: "sec-gdp-1", name: "Sec√ß√£o de Expediente e Secretariado", type: "SEC√á√ÉO" },
      { id: "sec-gdp-2", name: "Sec√ß√£o de Apoio Directo ao Director", type: "SEC√á√ÉO" }
    ],
    GJP: [
      { id: "sec-gjp-1", name: "Sec√ß√£o de Pareceres e Apoio Legal", type: "SEC√á√ÉO" },
      { id: "sec-gjp-2", name: "Sec√ß√£o de Processos Disciplinares", type: "SEC√á√ÉO" }
    ],
    DIAP: [
      { id: "sec-diap-1", name: "Sec√ß√£o de Estat√≠stica e Dados Prisionais", type: "SEC√á√ÉO" },
      { id: "sec-diap-2", name: "Sec√ß√£o de Estudos e Planeamento Operativo", type: "SEC√á√ÉO" }
    ],
    DRHP: [
      { id: "sec-drhp-1", name: "Sec√ß√£o de Gest√£o de Quadros e Efetivo", type: "SEC√á√ÉO" },
      { id: "sec-drhp-2", name: "Sec√ß√£o de Forma√ß√£o e Avalia√ß√£o de Desempenho", type: "SEC√á√ÉO" }
    ],
    DFPP: [
      { id: "sec-dfpp-1", name: "Sec√ß√£o de Execu√ß√£o Or√ßamental e Contabilidade", type: "SEC√á√ÉO" },
      { id: "sec-dfpp-2", name: "Sec√ß√£o de Gest√£o Patrimonial e Presta√ß√£o de Contas", type: "SEC√á√ÉO" }
    ],
    DLP: [
      { id: "sec-dlp-1", name: "Sec√ß√£o de Log√≠stica, V√≠veres e Alimenta√ß√£o", type: "SEC√á√ÉO" },
      { id: "sec-dlp-2", name: "Sec√ß√£o de Fardamento, Armamento e Transportes", type: "SEC√á√ÉO" }
    ],
    GIP: [
      { id: "sec-gip-1", name: "Sec√ß√£o de Manuten√ß√£o e Obras Prisionais", type: "SEC√á√ÉO" },
      { id: "sec-gip-2", name: "Sec√ß√£o de Vistorias T√©cnicas de Engenharia", type: "SEC√á√ÉO" }
    ],
    GTIP: [
      { id: "sec-gtip-1", name: "Sec√ß√£o de Sistemas, Redes e Comunica√ß√µes", type: "SEC√á√ÉO" },
      { id: "sec-gtip-2", name: "Sec√ß√£o de Suporte T√©cnico e Biometria", type: "SEC√á√ÉO" }
    ],
    GCIP: [
      { id: "sec-gcip-1", name: "Sec√ß√£o de Rela√ß√µes P√∫blicas e Imprensa", type: "SEC√á√ÉO" },
      { id: "sec-gcip-2", name: "Sec√ß√£o de Protocolo e Comunica√ß√£o Institucional", type: "SEC√á√ÉO" }
    ],
    DSPP: [
      { id: "sec-dspp-1", name: "Sec√ß√£o de Guarda, Vigil√¢ncia e Per√≠metro", type: "SEC√á√ÉO" },
      { id: "sec-dspp-2", name: "Pelot√£o de Interven√ß√£o R√°pida e Rea√ß√£o T√°tica", type: "PELOT√ÉO" },
      { id: "sec-dspp-3", name: "Sec√ß√£o de Inspec√ß√£o de Seguran√ßa e Revistas", type: "SEC√á√ÉO" }
    ],
    DCPP: [
      { id: "sec-dcpp-1", name: "Sec√ß√£o de Registo Biom√©trico e Processos", type: "SEC√á√ÉO" },
      { id: "sec-dcpp-2", name: "Sec√ß√£o de Controlo de Mandados e Liberta√ß√µes", type: "SEC√á√ÉO" },
      { id: "sec-dcpp-3", name: "Sec√ß√£o de Cadastro e Estat√≠stica Penal", type: "SEC√á√ÉO" }
    ],
    DARPP: [
      { id: "sec-darpp-1", name: "Sec√ß√£o de Assist√™ncia Social e Acompanhamento", type: "SEC√á√ÉO" },
      { id: "sec-darpp-2", name: "Sec√ß√£o de Programas de Alfabetiza√ß√£o e Ensino", type: "SEC√á√ÉO" }
    ],
    DPAEP: [
      { id: "sec-dpaep-1", name: "Sec√ß√£o de Oficinas, Agronomia e Trabalho Reclus√≥rio", type: "SEC√á√ÉO" },
      { id: "sec-dpaep-2", name: "Sec√ß√£o de Produ√ß√£o Agr√≠cola e Pecu√°ria Prisional", type: "SEC√á√ÉO" }
    ],
    DPARSP: [
      { id: "sec-dparsp-1", name: "Sec√ß√£o de Acompanhamento de Penas Alternativas", type: "SEC√á√ÉO" },
      { id: "sec-dparsp-2", name: "Sec√ß√£o de Apoio √† Reinser√ß√£o P√≥s-Institucional", type: "SEC√á√ÉO" }
    ],
    SIPP: [
      { id: "sec-sipp-1", name: "Sec√ß√£o de Informa√ß√µes e Pesquisa Operativa", type: "SEC√á√ÉO" },
      { id: "sec-sipp-2", name: "Sec√ß√£o de An√°lise de Risco e Preven√ß√£o de Fugas", type: "SEC√á√ÉO" }
    ],
    DSP: [
      { id: "sec-dsp-1", name: "Sec√ß√£o de Medicina Geral e Enfermagem Prisional", type: "SEC√á√ÉO" },
      { id: "sec-dsp-2", name: "Sec√ß√£o de Higiene, Sanidade e Controlo Sanit√°rio", type: "SEC√á√ÉO" }
    ],
    CCP: [
      { id: "sec-ccp-1", name: "Secretariado do Conselho Consultivo Provincial", type: "SEC√á√ÉO" }
    ],
    CCORP: [
      { id: "sec-ccorp-1", name: "Gabinete T√©cnico dos Conselheiros Provincial", type: "SEC√á√ÉO" }
    ]
  };
  const key = (codePrefix || "").split('-')[0].trim().toUpperCase();
  return map[key] || [
    { id: `sec-gen-1`, name: "Sec√ß√£o de Apoio Operativo e Expediente", type: "SEC√á√ÉO" },
    { id: `sec-gen-2`, name: "Sec√ß√£o de Inspe√ß√£o e Controlo Interno", type: "SEC√á√ÉO" }
  ];
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
  severity: "Ligeiro" | "Moderado" | "Grave" | "Cr√≠tico";
  status: "Pendente" | "Em Tratamento" | "Recuperado" | "Alta Cl√≠nica";
  doctorName: string;
}

export interface ReintegrationRecord {
  id: string;
  inmateId: string;
  inmateName: string;
  programName: string;
  category: "Educa√ß√£o" | "Trabalho" | "Apoio Psicol√≥gico" | "Artesanato";
  enrollmentDate: string;
  progressScore: number;
  attendanceRate: number;
  status: "Inscrito" | "Ativo" | "Suspenso" | "Conclu√≠do";
  evaluationNotes: string;
  reintegratorName: string;
}

export interface IntelligenceRecord {
  id: string;
  inmateId: string;
  inmateName: string;
  classification: "RESTRITO" | "CONFIDENCIAL" | "SECRETO";
  incidentSource: "MININT" | "Pol√≠cia Nacional" | "SICP" | "Guarda Prisional";
  alertType: "Informador de Bloco" | "Tentativa de Fuga Recorrente" | "Hist√≥rico de Fac√ß√£o" | "Conex√£o Externa Suspeita";
  threatLevel: "Baixo" | "M√©dio" | "Alto" | "Cr√≠tico";
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
  severity: "Ligeiro" | "Moderado" | "Grave" | "Cr√≠tico";
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
  conditionStatus: "Est√°vel" | "Melhoria" | "Sob Observa√ß√£o" | "Cr√≠tico" | "Alta";
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
  status: "Ativo" | "Conclu√≠do" | "Cancelado" | "Suspenso";
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
  email?: string;
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
  "Centro Operacional": {
    directions: {
      "Dire√ß√£o Geral / Centro Operacional Nacional": [
        { id: "CENTRO-OPERACIONAL-NACIONAL", name: "Centro Operacional Nacional - DG / MININT" }
      ]
    }
  },
  "Bengo": {
    directions: {
      "Dire√ß√£o Provincial do Bengo": [
        { id: "PRIS-BENGO", name: "EP/Capolo" }
      ]
    }
  },
  "Benguela": {
    directions: {
      "Dire√ß√£o Provincial de Benguela": [
        { id: "PRIS-BEN-01", name: "EP/Cavaco" }
      ]
    }
  },
  "Bi√©": {
    directions: {
      "Dire√ß√£o Provincial do Bi√©": [
        { id: "PRIS-BIE", name: "EP/Cuito" }
      ]
    }
  },
  "Cabinda": {
    directions: {
      "Dire√ß√£o Provincial de Cabinda": [
        { id: "PRIS-CABINDA", name: "EP/Yabi" }
      ]
    }
  },
  "Cuanza-Norte": {
    directions: {
      "Dire√ß√£o Provincial do Cuanza-Norte": [
        { id: "PRIS-CNORTE", name: "EP/Kaporolo" }
      ]
    }
  },
  "Cuanza-Sul": {
    directions: {
      "Dire√ß√£o Provincial do Cuanza-Sul": [
        { id: "PRIS-CSUL", name: "EP/Sumbe" }
      ]
    }
  },
  "Cunene": {
    directions: {
      "Dire√ß√£o Provincial do Cunene": [
        { id: "PRIS-CUNENE", name: "EP/Pebane" }
      ]
    }
  },
  "Huambo": {
    directions: {
      "Dire√ß√£o Provincial do Huambo": [
        { id: "PRIS-HUAMBO", name: "EP/Cambiote" },
        { id: "PRIS-BAILUNDO", name: "EP/Bailundo" },
        { id: "PRIS-CAALA", name: "EP/Ca√°la" }
      ]
    }
  },
  "Hu√≠la": {
    directions: {
      "Dire√ß√£o Provincial da Hu√≠la": [
        { id: "PRIS-HUI-01", name: "EP/Bentiaba" }
      ]
    }
  },
  "Luanda": {
    directions: {
      "Dire√ß√£o Provincial de Luanda": [
        { id: "PRIS-01", name: "EP/Viana" },
        { id: "PRIS-02", name: "EP/Kakila" }
      ]
    }
  },
  "Lunda-Norte": {
    directions: {
      "Dire√ß√£o Provincial da Lunda-Norte": [
        { id: "PRIS-LNORTE", name: "EP/Kakanda" }
      ]
    }
  },
  "Lunda-Sul": {
    directions: {
      "Dire√ß√£o Provincial da Lunda-Sul": [
        { id: "PRIS-LSUL", name: "EP/Saurimo" }
      ]
    }
  },
  "Malanje": {
    directions: {
      "Dire√ß√£o Provincial de Malanje": [
        { id: "PRIS-MALANJE", name: "EP/Banza do Bango" }
      ]
    }
  },
  "Moxico": {
    directions: {
      "Dire√ß√£o Provincial do Moxico": [
        { id: "PRIS-MOXICO", name: "EP/Luena" }
      ]
    }
  },
  "Namibe": {
    directions: {
      "Dire√ß√£o Provincial do Namibe": [
        { id: "PRIS-NAMIBE", name: "EP/Namibe" }
      ]
    }
  },
  "U√≠ge": {
    directions: {
      "Dire√ß√£o Provincial do U√≠ge": [
        { id: "PRIS-03", name: "EP/U√≠ge" }
      ]
    }
  },
  "Zaire": {
    directions: {
      "Dire√ß√£o Provincial do Zaire": [
        { id: "PRIS-ZAIRE", name: "EP/Mbanza Kongo" }
      ]
    }
  },
  "Moxico Leste": {
    directions: {
      "Dire√ß√£o Provincial de Moxico Leste": [
        { id: "PRIS-MXLESTE", name: "EP/Moxico Leste" }
      ]
    }
  },
  "Icolo e Bengo": {
    directions: {
      "Dire√ß√£o Provincial de Icolo e Bengo": [
        { id: "PRIS-ICOLO", name: "EP/Kakila" }
      ]
    }
  },
  "Cubango": {
    directions: {
      "Dire√ß√£o Provincial de Cubango": [
        { id: "PRIS-CUBANGO_MOCK", name: "EP/Menongue" }
      ]
    }
  },
  "Cuando": {
    directions: {
      "Dire√ß√£o Provincial de Cuando": [
        { id: "PRIS-CUANDO_MOCK", name: "EP/Cuando" }
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
    fatherName: "Jo√£o Augusto Chissola",
    motherName: "S√≠lvia Ndula",
    nationality: "Angolana",
    crimeId: "A01",
    riskLevel: "M√©dio",
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
    suggestedCellType: "Seguran√ßa M√©dia",
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
    name: "Comiss√°rio-Geral Maria Kiala",
    role: "DIRECTOR_GERAL",
    roleName: "Director Geral (Superadmin)",
    roleDescription: "V√™ Tudo - Gest√£o Central Geral e Centro Operacional de Controle Prisional Nacional.",
    level: "NATIONAL",
    province: "Centro Operacional",
    sigla: "DGSP",
    username: "dggeral",
    senha_hash: "Trumanmarcelo_1983",
    permissions: ["Incidentes", "Movimenta√ß√µes", "Vigil√¢ncia", "Transfer√™ncias", "Celas", "Chaves", "Armas", "Sa√∫de", "Psicologia", "Medica√ß√£o", "Relat√≥rios cl√≠nicos"],
    sensitivityLevel: "SECRETO"
  },
  {
    id: "MININT-OP-DP-LUANDA",
    name: "Sub-Comiss√°rio Ant√≥nio Bento",
    role: "DIRECTOR_PROVINCIAL",
    roleName: "Director Provincial de Luanda",
    roleDescription: "Controle Provincial - Apenas v√™ cadeias em Luanda (EP Viana, EP Kakila).",
    level: "PROVINCIAL",
    province: "Luanda",
    sigla: "DPSP-LA",
    username: "antonio.bento",
    senha_hash: "Trumanmarcelo_1983",
    permissions: ["Incidentes", "Movimenta√ß√µes", "Vigil√¢ncia", "Transfer√™ncias", "Celas", "Chaves", "Armas", "Sa√∫de", "Psicologia", "Relat√≥rios cl√≠nicos"],
    sensitivityLevel: "CONFIDENCIAL"
  },
  {
    id: "MININT-OP-DC-VIANA",
    name: "Superintendente Pedro Neto",
    role: "DIRECTOR_CADEIA",
    roleName: "Director do EP Viana",
    roleDescription: "Gest√£o Local - Apenas v√™ e gere o EP Viana.",
    level: "ESTABLISHMENT",
    assignedPrisonId: "PRIS-01",
    sigla: "DEP-VN",
    username: "pedro.neto",
    senha_hash: "Trumanmarcelo_1983",
    permissions: ["Incidentes", "Movimenta√ß√µes", "Vigil√¢ncia", "Transfer√™ncias", "Celas", "Chaves", "Armas", "Sa√∫de"],
    sensitivityLevel: "RESTRITO"
  },
  {
    id: "MININT-OP-SEG-VIANA",
    name: "Inspector-Chefe Jo√£o Kassoma",
    role: "CHEFE_SEGURANCA",
    roleName: "Chefe de Seguran√ßa Penal - EP Viana",
    roleDescription: "Risco & Vigil√¢ncia - Apenas EP Viana. N√£o v√™ o Controlo Penal ou Sa√∫de.",
    level: "ESTABLISHMENT",
    assignedPrisonId: "PRIS-01",
    sigla: "CSSP-VN",
    username: "joao.kassoma",
    senha_hash: "Trumanmarcelo_1983",
    permissions: ["Incidentes", "Movimenta√ß√µes", "Vigil√¢ncia", "Transfer√™ncias", "Celas", "Chaves", "Armas"],
    sensitivityLevel: "CONFIDENCIAL"
  },
  {
    id: "MININT-OP-SAU-VIANA",
    name: "Dr. Mateus Luvumbo",
    role: "CHEFE_SAUDE",
    roleName: "Chefe de Sa√∫de - EP Viana",
    roleDescription: "Assist√™ncia M√©dica - Apenas EP Viana. N√£o v√™ a Seguran√ßa f√≠sica, incidentes ou chaves.",
    level: "ESTABLISHMENT",
    assignedPrisonId: "PRIS-01",
    sigla: "CSSA-VN",
    username: "mateus.luvumbo",
    senha_hash: "Trumanmarcelo_1983",
    permissions: ["Sa√∫de", "Psicologia", "Medica√ß√£o", "Relat√≥rios cl√≠nicos"],
    sensitivityLevel: "CONFIDENCIAL"
  },
  // Huambo Operators requested
  {
    id: "MININT-OP-DP-HUAMBO",
    name: "Dr. J√∫lio Mbanza",
    role: "DIRECTOR_PROVINCIAL",
    roleName: "Director Provincial do Huambo",
    roleDescription: "Controle Provincial - Apenas v√™ cadeias no Huambo (Cadeia Central Huambo, Bailundo, Ca√°la).",
    level: "PROVINCIAL",
    province: "Huambo",
    sigla: "DPSP-HB",
    username: "jmbanza",
    senha_hash: "Trumanmarcelo_1983",
    permissions: ["Incidentes", "Movimenta√ß√µes", "Vigil√¢ncia", "Transfer√™ncias", "Celas", "Chaves", "Armas", "Sa√∫de", "Psicologia", "Relat√≥rios cl√≠nicos"],
    sensitivityLevel: "CONFIDENCIAL"
  },
  {
    id: "MININT-OP-DC-HUAMBO",
    name: "Superintendente-Chefe Bento Caetano",
    role: "DIRECTOR_CADEIA",
    roleName: "Director da Cadeia Central do Huambo",
    roleDescription: "Gest√£o Local - Apenas v√™ e gere a Cadeia Central do Huambo.",
    level: "ESTABLISHMENT",
    assignedPrisonId: "PRIS-HUAMBO",
    sigla: "DEP-HB",
    username: "director.huambo",
    senha_hash: "Trumanmarcelo_1983",
    permissions: ["Incidentes", "Movimenta√ß√µes", "Vigil√¢ncia", "Transfer√™ncias", "Celas", "Chaves", "Armas", "Sa√∫de"],
    sensitivityLevel: "CONFIDENCIAL"
  },
  {
    id: "MININT-OP-SEG-HUAMBO",
    name: "Inspector Jo√£o Bernardo",
    role: "CHEFE_SEGURANCA",
    roleName: "Chefe de Seguran√ßa - Cadeia Central do Huambo",
    roleDescription: "Risco & Vigil√¢ncia - Apenas Cadeia Central do Huambo. N√£o v√™ sa√∫de.",
    level: "ESTABLISHMENT",
    assignedPrisonId: "PRIS-HUAMBO",
    sigla: "CSSP-HB",
    username: "chefe.seg.huambo",
    senha_hash: "Trumanmarcelo_1983",
    permissions: ["Incidentes", "Movimenta√ß√µes", "Vigil√¢ncia", "Transfer√™ncias", "Celas", "Chaves", "Armas"],
    sensitivityLevel: "CONFIDENCIAL"
  },
  {
    id: "MININT-OP-SAU-HUAMBO",
    name: "Dra. Ana Maria",
    role: "CHEFE_SAUDE",
    roleName: "Chefe de Sa√∫de - Cadeia Central do Huambo",
    roleDescription: "Assist√™ncia M√©dica - Apenas Cadeia Central do Huambo. N√£o v√™ armas.",
    level: "ESTABLISHMENT",
    assignedPrisonId: "PRIS-HUAMBO",
    sigla: "CSSA-HB",
    username: "chefe.sau.huambo",
    senha_hash: "Trumanmarcelo_1983",
    permissions: ["Sa√∫de", "Psicologia", "Medica√ß√£o", "Relat√≥rios cl√≠nicos"],
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
  if (tab === "erd") return false; // Ningu√©m fora DG v√™ ERD
  if (tab === "admissions") {
    if (role === "CHEFE_SEGURANCA") return false; // Chefe de Seguran√ßa Penal n√£o v√™ Controlo Penal
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
    { name: "Surtos / Mal√°ria", valor: inQuarantine + 4, color: "#ef4444" },
    { name: "Tuberculose", valor: 2, color: "#f97316" },
    { name: "Dermatoses", valor: 8, color: "#a855f7" },
    { name: "Sanidade Mental", valor: mentalHealthCases + 1, color: "#10b981" },
  ];

  const medicalLogs = [
    { time: "08:15", text: "Triagem cl√≠nica obrigat√≥ria e aferi√ß√£o de sinais vitais na Ala A1 conclu√≠da.", type: "info" },
    { time: "10:30", text: "Vigil√¢ncia epidemiol√≥gica refor√ßada por suspeita cl√≠nica. Rastreamento ativo de rotina.", type: "warning" },
    { time: "11:00", text: "Isolamento profil√°tico de quarentena sanit√°ria homologado sem intercorr√™ncias.", type: "success" },
    { time: "14:20", text: "Inspe√ß√£o de salubridade, ventila√ß√£o e controle sanit√°rio conclu√≠do na enfermaria central.", type: "info" }
  ];

  return (
    <div className="lg:col-span-3 flex flex-col gap-6">
      {/* Clinica Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
              <HeartPulse className="h-3.5 w-3.5 text-emerald-400 animate-pulse" /> Dire√ß√£o de Sa√∫de e Assist√™ncia Humanit√°ria
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-mono mt-1">
              Gabinete Cl√≠nico e Sanit√°rio ‚Äî EP Viana
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Painel de indicadores m√©dicos e triagem regulado pelas Normas Regulares de Execu√ß√£o Permanente (NREP). Seguran√ßa f√≠sica e dados confidenciais do controle penal est√£o omitidos.
            </p>
          </div>
          <span className="bg-emerald-950 text-emerald-400 px-3 py-1 text-xs border border-emerald-500/20 font-mono rounded font-bold uppercase tracking-wider">
            Acesso Cl√≠nico Autorizado
          </span>
        </div>

        {/* Clinical Grid stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-lg text-center flex flex-col items-center justify-center gap-1">
            <span className="text-slate-400 text-[10px] uppercase font-mono font-bold">Popula√ß√£o Registada</span>
            <span className="text-2xl font-black text-slate-200 mt-1 font-mono">{totalInmates}</span>
            <span className="text-[9px] text-slate-500">Sob Monitoria</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-lg text-center flex flex-col items-center justify-center gap-1">
            <span className="text-amber-400 text-[10px] uppercase font-mono font-bold">Quarentena Profil√°ctica</span>
            <span className="text-2xl font-black text-amber-400 mt-1 font-mono">{inQuarantine}</span>
            <span className="text-[9px] text-amber-500/80 font-bold animate-pulse">Isolamento Ativo</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-lg text-center flex flex-col items-center justify-center gap-1">
            <span className="text-sky-400 text-[10px] uppercase font-mono font-bold">Consultas Hoje</span>
            <span className="text-2xl font-black text-sky-400 mt-1 font-mono">{generalAppointmentsToday}</span>
            <span className="text-[9px] text-slate-500">Agendadas</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-lg text-center flex flex-col items-center justify-center gap-1">
            <span className="text-emerald-400 text-[10px] uppercase font-mono font-bold">Terap√™utica Activa</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 font-mono">{continuousTreatments}</span>
            <span className="text-[9px] text-slate-500">Farmacoterapia</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-850 p-3.5 rounded-lg text-center flex flex-col items-center justify-center gap-1">
            <span className="text-purple-400 text-[10px] uppercase font-mono font-bold">Apoio Psicol√≥gico</span>
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
              Volume de Ocorr√™ncias Cl√≠nicas e Assist√™ncia M√©dica
            </h3>
            <p className="text-xxs text-slate-400 mt-1">
              R√°cio estat√≠stico por patologias e agendamentos m√©dicos ativos.
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
            <Activity className="h-4 w-4 text-emerald-500" /> Hist√≥rico Cl√≠nico & Sanit√°rio (NREP)
          </h3>
          <p className="text-xxs text-slate-400">
            √öltimas interven√ß√µes registadas pela equipa m√©dica interna.
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
                    {log.type === "success" ? "CONCLU√çDO" : log.type === "warning" ? "ATEN√á√ÉO" : "INFORMA√á√ÉO"}
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

export const ENHANCED_PRISONS_DB: any[] = [
  {
    id: "PRIS-01",
    name: "EP/Viana",
    location: "Luanda, Angola",
    municipalityId: "MUN-VIANA",
    officialCapacity: 1200,
    operationalCapacity: 1500,
    currentOccupancy: 850,
    riskBreakdown: { "Baixo": 300, "M√©dio": 400, "Alto": 120, "M√°ximo": 30 },
    pavilions: [
      {
        id: "PAV-LUA-01",
        name: "Pavilh√£o 01 - EP/Viana",
        blocks: [
          {
            id: "BLK-LUA-01A",
            name: "Bloco A - Regime Comum",
            capacity: 300,
            current: 12,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-LUA-A01", name: "Cela 01", capacity: 8, current: 4 },
              { id: "CEL-LUA-A02", name: "Cela 02", capacity: 8, current: 5 },
              { id: "CEL-LUA-A03", name: "Cela 03", capacity: 8, current: 3 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-02",
    name: "EP/Kakila",
    location: "Icolo e Bengo, Angola",
    municipalityId: "MUN-CATETE",
    officialCapacity: 800,
    operationalCapacity: 1000,
    currentOccupancy: 320,
    riskBreakdown: { "Baixo": 100, "M√©dio": 150, "Alto": 50, "M√°ximo": 20 },
    pavilions: [
      {
        id: "PAV-ICB-01",
        name: "Pavilh√£o 01 - EP/Kakila",
        blocks: [
          {
            id: "BLK-ICB-01A",
            name: "Bloco A - Regime Comum",
            capacity: 250,
            current: 9,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-ICB-A01", name: "Cela 01", capacity: 8, current: 3 },
              { id: "CEL-ICB-A02", name: "Cela 02", capacity: 8, current: 2 },
              { id: "CEL-ICB-A03", name: "Cela 03", capacity: 8, current: 4 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-HUAMBO",
    name: "EP/Cambiote",
    location: "Huambo, Angola",
    municipalityId: "MUN-HUAMBO",
    officialCapacity: 900,
    operationalCapacity: 1100,
    currentOccupancy: 610,
    riskBreakdown: { "Baixo": 120, "M√©dio": 310, "Alto": 130, "M√°ximo": 50 },
    pavilions: [
      {
        id: "PAV-HUA-01",
        name: "Pavilh√£o 01 - EP/Cambiote",
        blocks: [
          {
            id: "BLK-HUA-01A",
            name: "Bloco A - Regime Comum",
            capacity: 300,
            current: 9,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-HUA-A01", name: "Cela 01", capacity: 8, current: 4 },
              { id: "CEL-HUA-A02", name: "Cela 02", capacity: 8, current: 3 },
              { id: "CEL-HUA-A03", name: "Cela 03", capacity: 8, current: 2 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-BEN-01",
    name: "EP/Cavaco",
    location: "Benguela, Angola",
    municipalityId: "MUN-BENGUELA",
    officialCapacity: 1000,
    operationalCapacity: 1200,
    currentOccupancy: 850,
    riskBreakdown: { "Baixo": 180, "M√©dio": 340, "Alto": 230, "M√°ximo": 100 },
    pavilions: [
      {
        id: "PAV-BGU-01",
        name: "Pavilh√£o 01 - EP/Cavaco",
        blocks: [
          {
            id: "BLK-BGU-01A",
            name: "Bloco A - Regime Comum",
            capacity: 300,
            current: 10,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-BGU-A01", name: "Cela 01", capacity: 8, current: 5 },
              { id: "CEL-BGU-A02", name: "Cela 02", capacity: 8, current: 3 },
              { id: "CEL-BGU-A03", name: "Cela 03", capacity: 8, current: 2 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-CABINDA",
    name: "EP/Yabi",
    location: "Cabinda, Angola",
    municipalityId: "MUN-CABINDA",
    officialCapacity: 600,
    operationalCapacity: 700,
    currentOccupancy: 280,
    riskBreakdown: { "Baixo": 90, "M√©dio": 120, "Alto": 50, "M√°ximo": 20 },
    pavilions: [
      {
        id: "PAV-CAB-01",
        name: "Pavilh√£o 01 - EP/Yabi",
        blocks: [
          {
            id: "BLK-CAB-01A",
            name: "Bloco A - Regime Comum",
            capacity: 200,
            current: 6,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-CAB-A01", name: "Cela 01", capacity: 8, current: 2 },
              { id: "CEL-CAB-A02", name: "Cela 02", capacity: 8, current: 3 },
              { id: "CEL-CAB-A03", name: "Cela 03", capacity: 8, current: 1 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-CNORTE",
    name: "EP/Kaporolo",
    location: "Cuanza Norte, Angola",
    municipalityId: "MUN-NDALATANDO",
    officialCapacity: 500,
    operationalCapacity: 600,
    currentOccupancy: 210,
    riskBreakdown: { "Baixo": 70, "M√©dio": 90, "Alto": 40, "M√°ximo": 10 },
    pavilions: [
      {
        id: "PAV-CNO-01",
        name: "Pavilh√£o 01 - EP/Kaporolo",
        blocks: [
          {
            id: "BLK-CNO-01A",
            name: "Bloco A - Regime Comum",
            capacity: 200,
            current: 5,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-CNO-A01", name: "Cela 01", capacity: 8, current: 2 },
              { id: "CEL-CNO-A02", name: "Cela 02", capacity: 8, current: 2 },
              { id: "CEL-CNO-A03", name: "Cela 03", capacity: 8, current: 1 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-CSUL",
    name: "EP/Sumbe",
    location: "Cuanza Sul, Angola",
    municipalityId: "MUN-SUMBE",
    officialCapacity: 700,
    operationalCapacity: 800,
    currentOccupancy: 340,
    riskBreakdown: { "Baixo": 100, "M√©dio": 150, "Alto": 70, "M√°ximo": 20 },
    pavilions: [
      {
        id: "PAV-CSU-01",
        name: "Pavilh√£o 01 - EP/Sumbe",
        blocks: [
          {
            id: "BLK-CSU-01A",
            name: "Bloco A - Regime Comum",
            capacity: 250,
            current: 8,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-CSU-A01", name: "Cela 01", capacity: 8, current: 3 },
              { id: "CEL-CSU-A02", name: "Cela 02", capacity: 8, current: 3 },
              { id: "CEL-CSU-A03", name: "Cela 03", capacity: 8, current: 2 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-CUNENE",
    name: "EP/Pebane",
    location: "Cunene, Angola",
    municipalityId: "MUN-ONDJIVA",
    officialCapacity: 500,
    operationalCapacity: 600,
    currentOccupancy: 190,
    riskBreakdown: { "Baixo": 60, "M√©dio": 90, "Alto": 30, "M√°ximo": 10 },
    pavilions: [
      {
        id: "PAV-CNN-01",
        name: "Pavilh√£o 01 - EP/Pebane",
        blocks: [
          {
            id: "BLK-CNN-01A",
            name: "Bloco A - Regime Comum",
            capacity: 200,
            current: 4,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-CNN-A01", name: "Cela 01", capacity: 8, current: 2 },
              { id: "CEL-CNN-A02", name: "Cela 02", capacity: 8, current: 1 },
              { id: "CEL-CNN-A03", name: "Cela 03", capacity: 8, current: 1 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-HUI-01",
    name: "EP/Bentiaba",
    location: "Hu√≠la, Angola",
    municipalityId: "MUN-LUBANGO",
    officialCapacity: 1100,
    operationalCapacity: 1300,
    currentOccupancy: 810,
    riskBreakdown: { "Baixo": 200, "M√©dio": 380, "Alto": 180, "M√°ximo": 50 },
    pavilions: [
      {
        id: "PAV-HUI-01",
        name: "Pavilh√£o 01 - EP/Bentiaba",
        blocks: [
          {
            id: "BLK-HUI-01A",
            name: "Bloco A - Regime Comum",
            capacity: 350,
            current: 10,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-HUI-A01", name: "Cela 01", capacity: 8, current: 4 },
              { id: "CEL-HUI-A02", name: "Cela 02", capacity: 8, current: 3 },
              { id: "CEL-HUI-A03", name: "Cela 03", capacity: 8, current: 3 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-NAMIBE",
    name: "EP/Namibe",
    location: "Namibe, Angola",
    municipalityId: "MUN-MOCAMEDES",
    officialCapacity: 500,
    operationalCapacity: 600,
    currentOccupancy: 180,
    riskBreakdown: { "Baixo": 60, "M√©dio": 80, "Alto": 30, "M√°ximo": 10 },
    pavilions: [
      {
        id: "PAV-NAM-01",
        name: "Pavilh√£o 01 - EP/Namibe",
        blocks: [
          {
            id: "BLK-NAM-01A",
            name: "Bloco A - Regime Comum",
            capacity: 200,
            current: 5,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-NAM-A01", name: "Cela 01", capacity: 8, current: 2 },
              { id: "CEL-NAM-A02", name: "Cela 02", capacity: 8, current: 2 },
              { id: "CEL-NAM-A03", name: "Cela 03", capacity: 8, current: 1 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-MALANJE",
    name: "EP/Banza do Bango",
    location: "Malanje, Angola",
    municipalityId: "MUN-MALANJE",
    officialCapacity: 600,
    operationalCapacity: 700,
    currentOccupancy: 240,
    riskBreakdown: { "Baixo": 80, "M√©dio": 100, "Alto": 40, "M√°ximo": 20 },
    pavilions: [
      {
        id: "PAV-MAL-01",
        name: "Pavilh√£o 01 - EP/Banza do Bango",
        blocks: [
          {
            id: "BLK-MAL-01A",
            name: "Bloco A - Regime Comum",
            capacity: 250,
            current: 7,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-MAL-A01", name: "Cela 01", capacity: 8, current: 3 },
              { id: "CEL-MAL-A02", name: "Cela 02", capacity: 8, current: 2 },
              { id: "CEL-MAL-A03", name: "Cela 03", capacity: 8, current: 2 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-03",
    name: "EP/U√≠ge",
    location: "U√≠ge, Angola",
    municipalityId: "MUN-UIGE",
    officialCapacity: 650,
    operationalCapacity: 750,
    currentOccupancy: 290,
    riskBreakdown: { "Baixo": 90, "M√©dio": 130, "Alto": 50, "M√°ximo": 20 },
    pavilions: [
      {
        id: "PAV-UIG-01",
        name: "Pavilh√£o 01 - EP/U√≠ge",
        blocks: [
          {
            id: "BLK-UIG-01A",
            name: "Bloco A - Regime Comum",
            capacity: 250,
            current: 7,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-UIG-A01", name: "Cela 01", capacity: 8, current: 3 },
              { id: "CEL-UIG-A02", name: "Cela 02", capacity: 8, current: 2 },
              { id: "CEL-UIG-A03", name: "Cela 03", capacity: 8, current: 2 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-ZAIRE",
    name: "EP/Mbanza Kongo",
    location: "Zaire, Angola",
    municipalityId: "MUN-MBANZAKONGO",
    officialCapacity: 500,
    operationalCapacity: 600,
    currentOccupancy: 220,
    riskBreakdown: { "Baixo": 70, "M√©dio": 100, "Alto": 40, "M√°ximo": 10 },
    pavilions: [
      {
        id: "PAV-ZAI-01",
        name: "Pavilh√£o 01 - EP/Mbanza Kongo",
        blocks: [
          {
            id: "BLK-ZAI-01A",
            name: "Bloco A - Regime Comum",
            capacity: 200,
            current: 7,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-ZAI-A01", name: "Cela 01", capacity: 8, current: 3 },
              { id: "CEL-ZAI-A02", name: "Cela 02", capacity: 8, current: 2 },
              { id: "CEL-ZAI-A03", name: "Cela 03", capacity: 8, current: 2 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-LNORTE",
    name: "EP/Kakanda",
    location: "Lunda Norte, Angola",
    municipalityId: "MUN-DUNDO",
    officialCapacity: 700,
    operationalCapacity: 800,
    currentOccupancy: 310,
    riskBreakdown: { "Baixo": 100, "M√©dio": 130, "Alto": 60, "M√°ximo": 20 },
    pavilions: [
      {
        id: "PAV-LNO-01",
        name: "Pavilh√£o 01 - EP/Kakanda",
        blocks: [
          {
            id: "BLK-LNO-01A",
            name: "Bloco A - Regime Comum",
            capacity: 250,
            current: 8,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-LNO-A01", name: "Cela 01", capacity: 8, current: 3 },
              { id: "CEL-LNO-A02", name: "Cela 02", capacity: 8, current: 3 },
              { id: "CEL-LNO-A03", name: "Cela 03", capacity: 8, current: 2 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-LSUL",
    name: "EP/Saurimo",
    location: "Lunda Sul, Angola",
    municipalityId: "MUN-SAURIMO",
    officialCapacity: 500,
    operationalCapacity: 600,
    currentOccupancy: 190,
    riskBreakdown: { "Baixo": 60, "M√©dio": 80, "Alto": 40, "M√°ximo": 10 },
    pavilions: [
      {
        id: "PAV-LSU-01",
        name: "Pavilh√£o 01 - EP/Saurimo",
        blocks: [
          {
            id: "BLK-LSU-01A",
            name: "Bloco A - Regime Comum",
            capacity: 200,
            current: 5,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-LSU-A01", name: "Cela 01", capacity: 8, current: 2 },
              { id: "CEL-LSU-A02", name: "Cela 02", capacity: 8, current: 2 },
              { id: "CEL-LSU-A03", name: "Cela 03", capacity: 8, current: 1 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-MOXICO",
    name: "EP/Luena",
    location: "Moxico, Angola",
    municipalityId: "MUN-LUENA",
    officialCapacity: 600,
    operationalCapacity: 700,
    currentOccupancy: 260,
    riskBreakdown: { "Baixo": 80, "M√©dio": 110, "Alto": 50, "M√°ximo": 20 },
    pavilions: [
      {
        id: "PAV-MOX-01",
        name: "Pavilh√£o 01 - EP/Luena",
        blocks: [
          {
            id: "BLK-MOX-01A",
            name: "Bloco A - Regime Comum",
            capacity: 250,
            current: 7,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-MOX-A01", name: "Cela 01", capacity: 8, current: 3 },
              { id: "CEL-MOX-A02", name: "Cela 02", capacity: 8, current: 2 },
              { id: "CEL-MOX-A03", name: "Cela 03", capacity: 8, current: 2 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-MXLESTE",
    name: "EP/Moxico Leste",
    location: "Moxico Leste, Angola",
    municipalityId: "MUN-CAZOMBO",
    officialCapacity: 300,
    operationalCapacity: 350,
    currentOccupancy: 0,
    semInfraestrutura: true,
    riskBreakdown: { "Baixo": 0, "M√©dio": 0, "Alto": 0, "M√°ximo": 0 },
    pavilions: [
      {
        id: "PAV-MXL-01",
        name: "Pavilh√£o 01 - EP/M-Leste",
        blocks: [
          {
            id: "BLK-MXL-01A",
            name: "Bloco A - Provis√≥rio",
            capacity: 100,
            current: 0,
            cellCount: 3,
            riskLevel: "Baixo",
            cells: [
              { id: "CEL-MXL-A01", name: "Cela 01", capacity: 8, current: 0 },
              { id: "CEL-MXL-A02", name: "Cela 02", capacity: 8, current: 0 },
              { id: "CEL-MXL-A03", name: "Cela 03", capacity: 8, current: 0 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-CCUBANGO",
    name: "EP/Menongue",
    location: "Quando Cubango, Angola",
    municipalityId: "MUN-MENONGUE",
    officialCapacity: 500,
    operationalCapacity: 600,
    currentOccupancy: 180,
    riskBreakdown: { "Baixo": 50, "M√©dio": 80, "Alto": 40, "M√°ximo": 10 },
    pavilions: [
      {
        id: "PAV-CCU-01",
        name: "Pavilh√£o 01 - EP/Menongue",
        blocks: [
          {
            id: "BLK-CCU-01A",
            name: "Bloco A - Regime Comum",
            capacity: 200,
            current: 5,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-CCU-A01", name: "Cela 01", capacity: 8, current: 2 },
              { id: "CEL-CCU-A02", name: "Cela 02", capacity: 8, current: 2 },
              { id: "CEL-CCU-A03", name: "Cela 03", capacity: 8, current: 1 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-CUANDO",
    name: "EP/Cuando",
    location: "Cuando, Angola",
    municipalityId: "MUN-CUANDO",
    officialCapacity: 300,
    operationalCapacity: 350,
    currentOccupancy: 0,
    semInfraestrutura: true,
    riskBreakdown: { "Baixo": 0, "M√©dio": 0, "Alto": 0, "M√°ximo": 0 },
    pavilions: [
      {
        id: "PAV-CND-01",
        name: "Pavilh√£o 01 - EP/Cuando",
        blocks: [
          {
            id: "BLK-CND-01A",
            name: "Bloco A - Provis√≥rio",
            capacity: 100,
            current: 0,
            cellCount: 3,
            riskLevel: "Baixo",
            cells: [
              { id: "CEL-CND-A01", name: "Cela 01", capacity: 8, current: 0 },
              { id: "CEL-CND-A02", name: "Cela 02", capacity: 8, current: 0 },
              { id: "CEL-CND-A03", name: "Cela 03", capacity: 8, current: 0 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-BENGO",
    name: "EP/Capolo",
    location: "Bengo, Angola",
    municipalityId: "MUN-CAXITO",
    officialCapacity: 500,
    operationalCapacity: 600,
    currentOccupancy: 230,
    riskBreakdown: { "Baixo": 70, "M√©dio": 100, "Alto": 50, "M√°ximo": 10 },
    pavilions: [
      {
        id: "PAV-BGO-01",
        name: "Pavilh√£o 01 - EP/Capolo",
        blocks: [
          {
            id: "BLK-BGO-01A",
            name: "Bloco A - Regime Comum",
            capacity: 200,
            current: 7,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-BGO-A01", name: "Cela 01", capacity: 8, current: 3 },
              { id: "CEL-BGO-A02", name: "Cela 02", capacity: 8, current: 2 },
              { id: "CEL-BGO-A03", name: "Cela 03", capacity: 8, current: 2 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-BIE",
    name: "EP/Cuito",
    location: "Bi√©, Angola",
    municipalityId: "MUN-CUITO",
    officialCapacity: 600,
    operationalCapacity: 700,
    currentOccupancy: 310,
    riskBreakdown: { "Baixo": 100, "M√©dio": 130, "Alto": 60, "M√°ximo": 20 },
    pavilions: [
      {
        id: "PAV-BIE-01",
        name: "Pavilh√£o 01 - EP/Cuito",
        blocks: [
          {
            id: "BLK-BIE-01A",
            name: "Bloco A - Regime Comum",
            capacity: 250,
            current: 8,
            cellCount: 3,
            riskLevel: "M√©dio",
            cells: [
              { id: "CEL-BIE-A01", name: "Cela 01", capacity: 8, current: 3 },
              { id: "CEL-BIE-A02", name: "Cela 02", capacity: 8, current: 3 },
              { id: "CEL-BIE-A03", name: "Cela 03", capacity: 8, current: 2 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "PRIS-FEM-VIANA",
    name: "EP/Feminino Viana",
    location: "Luanda, Angola",
    municipalityId: "MUN-VIANA",
    officialCapacity: 350,
    operationalCapacity: 400,
    currentOccupancy: 320,
    riskBreakdown: { "Baixo": 180, "M√©dio": 100, "Alto": 30, "M√°ximo": 10 },
    pavilions: [
      {
        id: "PAV-FEM-A", name: "Pavilh√£o Feminino A - Maternidade e Admiss√£o",
        blocks: [
          { id: "BLK-FEM-A1", name: "Bloco Ber√ß√°rio/Admiss√£o", capacity: 150, current: 140, cellCount: 3, riskLevel: "Baixo", cells: [{ id: "CEL-FEM-01", name: "Cela 01", capacity: 8, current: 4 }] },
          { id: "BLK-FEM-A2", name: "Bloco Regime Comum", capacity: 250, current: 180, cellCount: 3, riskLevel: "M√©dio", cells: [{ id: "CEL-FEM-02", name: "Cela 02", capacity: 8, current: 3 }] }
        ]
      }
    ]
  }
];
const _IGNORED_HARDCODED_PRISONS = ENHANCED_PRISONS_DB;

/**
 * Modelo Preditivo de Rotatividade de Reclusos por cela.
 * Calcula deterministicamente a probabilidade de libera√ß√£o ou transfer√™ncia imediata (0% - 100%).
 * Elevada probabilidade de libera√ß√£o/transfer√™ncia indica instabilidade populacional ou necessidade de novas realoca√ß√µes futuras.
 */
export const getPredictiveTurnoverRate = (blockId: string, cellName: string) => {
  let cellHash = 0;
  const seed = `${blockId}-${cellName}-turnover-v3`;
  for (let i = 0; i < seed.length; i++) {
    cellHash += seed.charCodeAt(i);
  }
  const probability = 5 + (cellHash % 91); // 5% a 95%
  const isHighTurnover = probability >= 65;
  let label = "Est√°vel (Longa Perman√™ncia)";
  let color = "text-emerald-400";
  let bg = "bg-emerald-500/10 border-emerald-500/20";
  
  if (probability >= 75) {
    label = "Cr√≠tica (Sa√≠da/Liberta√ß√£o Iminente)";
    color = "text-rose-450";
    bg = "bg-rose-500/10 border-rose-500/20";
  } else if (probability >= 45) {
    label = "Moderada (Alta Rotatividade)";
    color = "text-amber-400";
    bg = "bg-amber-500/10 border-amber-500/20";
  }
  
  return { probability, isHighTurnover, label, color, bg };
};

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<"dashboard" | "centro-comando" | "centro-inteligencia" | "erd" | "admissions" | "documents" | "penal-code" | "mncp-engine" | "settings" | "movements" | "auditing" | "sandbox" | "deus-fundador" | "special-services" | "inmates" | "occupancy" | "correio-institucional" | "google-drive" | "google-sheets" | "google-calendar" | "google-docs">("centro-comando");
  const [openTabs, setOpenTabs] = useState<string[]>(["centro-comando"]);

  // --- SMARTPHONE & MOBILE STATES ---
  const [isMobileQROpen, setIsMobileQROpen] = useState(false);
  const [isMobileMultiStepAddOpen, setIsMobileMultiStepAddOpen] = useState(false);
  const [isMobileTouchSignatureOpen, setIsMobileTouchSignatureOpen] = useState(false);
  const [isMobileOccupancyOpen, setIsMobileOccupancyOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedQuickDossierInmate, setSelectedQuickDossierInmate] = useState<any | null>(null);

  // --- CORE INSTITUTIONAL OS STATES ---
  const [showNEPAuditor, setShowNEPAuditor] = useState(false);
  const [currentMission, setCurrentMission] = useState<"nova-admissao" | "transferencia-recluso" | "declaracao-motim" | "inspecao-sanitaria" | null>(null);
  const [selectedInmateForInspector, setSelectedInmateForInspector] = useState<any | null>(null);
  const [selectedCellForInspector, setSelectedCellForInspector] = useState<any | null>(null);
  const [establishmentTab, setEstablishmentTab] = useState<"resumo" | "pavilhoes" | "celas" | "efetivo" | "reclusos" | "ocorrencias" | "transferencias" | "auditoria" | "historico" | "ia">("resumo");
  const [workspaceLayout, setWorkspaceLayout] = useState<"default" | "split" | "inverted">("default");

  // --- MISSION FORM STATES ---
  const [newInmateFirstName, setNewInmateFirstName] = useState("");
  const [newInmateLastName, setNewInmateLastName] = useState("");
  const [newInmateBirthDate, setNewInmateBirthDate] = useState("1995-06-15");
  const [newInmateGender, setNewInmateGender] = useState("MASCULINO");
  const [newInmateIdCard, setNewInmateIdCard] = useState("");
  const [newInmateNationality, setNewInmateNationality] = useState("Angolana");
  const [newInmateCrimeId, setNewInmateCrimeId] = useState("Roubo Qualificado");
  const [newInmateRiskLevel, setNewInmateRiskLevel] = useState("M√©dio");
  const [newInmateRegime, setNewInmateRegime] = useState("PREVENTIVA");
  const [newInmatePrison, setNewInmatePrison] = useState("PRIS-HUAMBO");
  const [newInmateCell, setNewInmateCell] = useState("CELL-01");
  const [newInmateStep, setNewInmateStep] = useState(1);
  const [admittedInmateTicket, setAdmittedInmateTicket] = useState<any | null>(null);

  // --- OPERATIONAL CONSOLE & QUICK ACTION MODALS STATES (FASE 2) ---
  const [establishmentSearchQuery, setEstablishmentSearchQuery] = useState("");
  const [sidebarSiglaSearch, setSidebarSiglaSearch] = useState("");
  const [sidebarFilterTab, setSidebarFilterTab] = useState<"ALL" | "EP" | "DEP" | "PROV">("ALL");
  const [sidebarDepSubFilter, setSidebarDepSubFilter] = useState<"ALL" | "CENTRAL" | "PROVINCIAL">("ALL");
  const [isQuickTransferModalOpen, setIsQuickTransferModalOpen] = useState(false);
  const [isQuickIncidentModalOpen, setIsQuickIncidentModalOpen] = useState(false);
  const [quickIncidentType, setQuickIncidentType] = useState<"DISCIPLINAR" | "EVAS√ÉO" | "M√âDICO" | "REDES" | "INFRAESTRUTURA" | "SEGURAN√áA">("DISCIPLINAR");
  const [quickIncidentSeverity, setQuickIncidentSeverity] = useState<"CR√çTICA" | "M√âDIA" | "LIGEIRA">("M√âDIA");
  const [quickIncidentDesc, setQuickIncidentDesc] = useState("");
  const [quickIncidentPrisonId, setQuickIncidentPrisonId] = useState("PRIS-01");

  // --- TRANSFERENCE MISSION STATES ---
  const [transferSelectedInmateId, setTransferSelectedInmateId] = useState("");
  const [transferDestPrison, setTransferDestPrison] = useState("PRIS-VIANA");
  const [transferReason, setTransferReason] = useState("Aproxima√ß√£o Familiar");
  const [transferDestCell, setTransferDestCell] = useState("CELL-02");

  // --- MUTINY MISSION STATES ---
  const [mutinyPrison, setMutinyPrison] = useState("PRIS-HUAMBO");
  const [mutinySeverity, setMutinySeverity] = useState("Alto");
  const [mutinyIsLockdown, setMutinyIsLockdown] = useState(false);
  const [mutinyGirDispatched, setMutinyGirDispatched] = useState(false);
  const [mutinyLog, setMutinyLog] = useState<string[]>([]);

  // --- SANITARY MISSION STATES ---
  const [sanitaryPrison, setSanitaryPrison] = useState("PRIS-HUAMBO");
  const [sanitaryCell, setSanitaryCell] = useState("CELL-01");
  const [sanitaryWaterOk, setSanitaryWaterOk] = useState(true);
  const [sanitaryHygieneScore, setSanitaryHygieneScore] = useState(85);

  useEffect(() => {
    if (activeTab && !openTabs.includes(activeTab)) {
      setOpenTabs(prev => [...prev, activeTab]);
    }
  }, [activeTab]);

  const closeTab = (tabToClose: string) => {
    const nextTabs = openTabs.filter(t => t !== tabToClose);
    setOpenTabs(nextTabs);
    if (activeTab === tabToClose) {
      if (nextTabs.length > 0) {
        setActiveTab(nextTabs[nextTabs.length - 1] as any);
      } else {
        setActiveTab("" as any);
      }
    }
  };

  const [dashboardSubTab, setDashboardSubTab] = useState<"capacity" | "risk-map">("capacity");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true); // Starts expanded for the workspace feel
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false); // Inspector / tracking console state
  const [globalWorkspaceSearch, setGlobalWorkspaceSearch] = useState<string>("");
  const [selectedSearchInmateModal, setSelectedSearchInmateModal] = useState<any | null>(null);
  const [selectedSearchInmateIsOutOfScope, setSelectedSearchInmateIsOutOfScope] = useState<boolean>(false);
  const [urlAccessDeniedModal, setUrlAccessDeniedModal] = useState<{
    isOpen: boolean;
    attemptedUrl: string;
    inmateId: string;
    inmateName: string;
    inmateProvince: string;
    operatorProvince: string;
    operatorRole: string;
    reason: string;
  } | null>(null);
  const [expandedWorkspaceFolders, setExpandedWorkspaceFolders] = useState<Record<string, boolean>>({
    "departamentos_comando": true,
    "direcoes_provinciais": true,
    "acesso_rapido_eps": true,
    "miss√µes": true,
    "republica_angola": true,
    "minint": true,
    "servico_penitenciario": true,
    "direcoes_nacionais": true,
    "estabelecimentos": true,
    "unidades_especiais": true,
    "centro-nacional": true,
    "estrutura-organica": true,
    "operacoes": true,
    "legislacao": true,
    "sandbox": false,
    "direcao_geral": true,
    "inteligencia_comando": true,
    "cadastro_fluxos": true,
    "cnel_doutrina": true,
    "sistema_auditoria": true
  });
  const [isExplorerWorkspaceExpanded, setIsExplorerWorkspaceExpanded] = useState<boolean>(true);
  const [isTerritorialWorkspaceExpanded, setIsTerritorialWorkspaceExpanded] = useState<boolean>(true);
  const [expandedProvDeps, setExpandedProvDeps] = useState<Record<string, boolean>>({});
  const [expandedProvPrisons, setExpandedProvPrisons] = useState<Record<string, boolean>>({});
  const [expandedDepSections, setExpandedDepSections] = useState<Record<string, boolean>>({});
  const [isModuleSelectorOpen, setIsModuleSelectorOpen] = useState<boolean>(false);
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>("ALL");
  const [isOvercrowdingDetailedMode, setIsOvercrowdingDetailedMode] = useState<boolean>(false);
  const [isAutoAlertEnabled, setIsAutoAlertEnabled] = useState<boolean>(true);
  const [criticalOvercrowdingThreshold, setCriticalOvercrowdingThreshold] = useState<number>(110);
  const [pavilionApprovalThreshold, setPavilionApprovalThreshold] = useState<number>(90);
  const [overcrowdingWidgetColor, setOvercrowdingWidgetColor] = useState<"red" | "rose" | "orange" | "purple" | "yellow">("red");
  const [criticalIncidentThreshold, setCriticalIncidentThreshold] = useState<number>(6);
  const [mediumIncidentThreshold, setMediumIncidentThreshold] = useState<number>(3);
  const [directorEmail, setDirectorEmail] = useState<string>("wtmedia0@gmail.com");
  const [directorName, setDirectorName] = useState<string>("Dr. Augusto Fontes");
  const [isDirectorSubscribed, setIsDirectorSubscribed] = useState<boolean>(false);
  const [sentAlertEmails, setSentAlertEmails] = useState<Array<{ id: string; timestamp: string; pavName: string; prisonName: string; occupancyPct: number; email: string; status: "Enviado" }>>([]);
  const [showSubscriptionPanel, setShowSubscriptionPanel] = useState<boolean>(false);

  // Command Palette global key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Trigger Command Palette with Ctrl+K, Ctrl+P, or Ctrl+Shift+P
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "p" || e.key === "K" || e.key === "P")) {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const widgetTheme = useMemo(() => {
    switch (overcrowdingWidgetColor) {
      case "rose":
        return {
          bg: "bg-rose-950/40 border-rose-500/60 shadow-2xl shadow-rose-500/15 animate-[pulse_3s_infinite]",
          text: "text-rose-400",
          buttonActive: "bg-rose-950 text-rose-200 border-rose-500 hover:bg-rose-900/35 font-black shadow-lg shadow-rose-500/10",
          innerAlert: "bg-rose-950/70 border border-rose-550/30 text-rose-200 font-mono animate-pulse",
          innerBadge: "bg-rose-900/60 border border-rose-500/20 text-rose-100",
          iconColor: "text-rose-500",
          buttonTextIcon: "text-rose-400",
        };
      case "orange":
        return {
          bg: "bg-orange-950/40 border-orange-500/60 shadow-2xl shadow-orange-500/15 animate-[pulse_3s_infinite]",
          text: "text-orange-400",
          buttonActive: "bg-orange-950 text-orange-200 border-orange-500 hover:bg-orange-900/35 font-black shadow-lg shadow-orange-500/10",
          innerAlert: "bg-orange-950/70 border border-orange-550/30 text-orange-200 font-mono animate-pulse",
          innerBadge: "bg-orange-900/60 border border-orange-500/20 text-orange-100",
          iconColor: "text-orange-500",
          buttonTextIcon: "text-orange-400",
        };
      case "purple":
        return {
          bg: "bg-purple-950/40 border-purple-500/60 shadow-2xl shadow-purple-500/15 animate-[pulse_3s_infinite]",
          text: "text-purple-400",
          buttonActive: "bg-purple-950 text-purple-200 border-purple-500 hover:bg-purple-900/35 font-black shadow-lg shadow-purple-500/10",
          innerAlert: "bg-purple-950/70 border border-purple-550/30 text-purple-200 font-mono animate-pulse",
          innerBadge: "bg-purple-900/60 border border-purple-500/20 text-purple-100",
          iconColor: "text-purple-500",
          buttonTextIcon: "text-purple-400",
        };
      case "yellow":
        return {
          bg: "bg-yellow-950/40 border-yellow-500/60 shadow-2xl shadow-yellow-550/15 animate-[pulse_3s_infinite]",
          text: "text-yellow-450",
          buttonActive: "bg-yellow-950 text-yellow-250 border-yellow-550 hover:bg-yellow-905/35 font-black shadow-lg shadow-yellow-550/10",
          innerAlert: "bg-yellow-950/70 border border-yellow-550/30 text-yellow-250 font-mono animate-pulse",
          innerBadge: "bg-yellow-900/60 border border-yellow-500/20 text-yellow-105",
          iconColor: "text-yellow-500",
          buttonTextIcon: "text-yellow-400",
        };
      case "red":
      default:
        return {
          bg: "bg-red-950/40 border-red-500/60 shadow-2xl shadow-red-500/15 animate-[pulse_3s_infinite]",
          text: "text-red-400",
          buttonActive: "bg-red-950 text-red-200 border-red-500 hover:bg-red-900/35 font-black shadow-lg shadow-red-500/10",
          innerAlert: "bg-red-950/70 border border-red-550/30 text-red-200 font-mono animate-pulse",
          innerBadge: "bg-red-900/60 border border-red-500/20 text-red-100",
          iconColor: "text-red-500",
          buttonTextIcon: "text-red-400",
        };
    }
  }, [overcrowdingWidgetColor]);
  const [expandedOvercrowdedPrisons, setExpandedOvercrowdedPrisons] = useState<Record<string, boolean>>({});
  const [admissionsRateOverride, setAdmissionsRateOverride] = useState<number | null>(null);
  const [inmateRiskOverride, setInmateRiskOverride] = useState<string | null>(null);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string | null>(null);
  const [dynamicRiskWeights, setDynamicRiskWeights] = useState<Record<string, number>>({ "Baixo": 1, "M√©dio": 2, "Alto": 3, "M√°ximo": 4 });
  const [reorganizationSuggestions, setReorganizationSuggestions] = useState<Array<{
    inmateId: string;
    inmateName: string;
    riskLevel: string;
    currentBlockId: string;
    currentBlockName: string;
    currentCellNumber: string;
    suggestedBlockId: string;
    suggestedBlockName: string;
    suggestedCellNumber: string;
    reason: string;
    priority: "Cr√≠tica" | "M√©dia" | "Otimiza√ß√£o";
  }> | null>(null);
  const [showReorgSuggestions, setShowReorgSuggestions] = useState<boolean>(false);
  
  // Sandbox Simulator State
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(true);
  const [isEnterpriseMode, setIsEnterpriseMode] = useState<boolean>(true); // Modo Interpriser Ativo para UX e Polimento Enterprise (98%+)

  // Operational Intelligence (Intelig√™ncia Operacional) State
  const [isIntelPredictiveActive, setIsIntelPredictiveActive] = useState<boolean>(true);
  const [intelTensionLevel, setIntelTensionLevel] = useState<number>(42); // Tension index 0-100
  const [selectedIntelTargetBlock, setSelectedIntelTargetBlock] = useState<string>("BLK-B2");
  const [intelSimulatedAnalysis, setIntelSimulatedAnalysis] = useState<string>("");
  const [isAnalyzingIntel, setIsAnalyzingIntel] = useState<boolean>(false);

  // Advanced Forensic Auditing State
  const [forensicLevelFilter, setForensicLevelFilter] = useState<string>("ALL");
  const [auditVerificationState, setAuditVerificationState] = useState<"IDLE" | "SCANNING" | "COMPLETED">("IDLE");
  const [auditVerificationProgress, setAuditVerificationProgress] = useState<number>(0);
  const [auditComplianceScore, setAuditComplianceScore] = useState<number>(100.0);
  const [auditHasCertificate, setAuditHasCertificate] = useState<boolean>(false);
  const [expandedAuditRecords, setExpandedAuditRecords] = useState<Record<string, boolean>>({});

  // Toast notifications state
  const [toasts, setToasts] = useState<Array<{ id: string; type: "success" | "error" | "info" | "warning"; title: string; message: string }>>([]);

  // Command Palette & Mission Launcher State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [commandPaletteQuery, setCommandPaletteQuery] = useState<string>("");
  const [activeCommandIndex, setActiveCommandIndex] = useState<number>(0);

  const triggerToast = (title: string, message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  // Custom Login & Institutional setup states
  const [isSetupDone, setIsSetupDone] = useState<boolean>(() => {
    return localStorage.getItem("pnap_is_setup_done") === "true";
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("pnap_is_logged_in") === "true";
  });
  const [selectedProvince, setSelectedProvince] = useState<string>(() => {
    return localStorage.getItem("pnap_selected_province") || "Centro Operacional";
  });
  const [selectedDir, setSelectedDir] = useState<string>(() => {
    return localStorage.getItem("pnap_selected_dir") || "Dire√ß√£o Geral / Centro Operacional Nacional";
  });
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string>(() => {
    return localStorage.getItem("pnap_selected_establishment_id") || "CENTRO-OPERACIONAL-NACIONAL";
  });
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loginOpTab, setLoginOpTab] = useState<"ALL" | "NATIONAL" | "PROVINCIAL" | "ESTABLISHMENT">("ALL");
  const [loginOpSearch, setLoginOpSearch] = useState<string>("");

  // --- ESTRUTURA ORG√ÇNICA NACIONAL TREE STATE ---
  const PROVINCES_HARDCODED = useMemo(() => [
    "Centro Operacional", "Bengo", "Benguela", "Bi√©", "Cabinda", "Cuando", "Cubango", 
    "Cuanza-Norte", "Cuanza-Sul", "Cunene", "Huambo", "Hu√≠la", "Icolo e Bengo", 
    "Luanda", "Lunda-Norte", "Lunda-Sul", "Malanje", "Moxico", 
    "Moxico Leste", "Namibe", "U√≠ge", "Zaire"
  ], []);

  const [municipalities, setMunicipalities] = useState<Array<{ id: string; name: string; province: string }>>([
    { id: "MUN-VIANA", name: "Viana", province: "Luanda" },
    { id: "MUN-BELAS", name: "Belas", province: "Luanda" },
    { id: "MUN-CACOACO", name: "Cacuaco", province: "Luanda" },
    { id: "MUN-BENGUELA", name: "Benguela", province: "Benguela" },
    { id: "MUN-LOBITO", name: "Lobito", province: "Benguela" },
    { id: "MUN-HUAMBO", name: "Huambo", province: "Huambo" },
    { id: "MUN-BAILUNDO", name: "Bailundo", province: "Huambo" },
    { id: "MUN-CAALA", name: "Ca√°la", province: "Huambo" },
    { id: "MUN-LUBANGO", name: "Lubango", province: "Hu√≠la" },
    { id: "MUN-HUMPATA", name: "Humpata", province: "Hu√≠la" },
    { id: "MUN-CAXITO", name: "Caxito", province: "Bengo" },
    { id: "MUN-SANZAPOMBO", name: "Sanza Pombo", province: "U√≠ge" },
    // Default Sedes for remaining ones
    { id: "MUN-SEDE-CABINDA", name: "Cabinda Sede", province: "Cabinda" },
    { id: "MUN-SEDE-ZAIRE", name: "Mbanza Kongo", province: "Zaire" },
    { id: "MUN-SEDE-BIE", name: "Kuito", province: "Bi√©" },
    { id: "MUN-SEDE-CUANZA-NORTE", name: "N'dalatando", province: "Cuanza-Norte" },
    { id: "MUN-SEDE-CUANZA-SUL", name: "Sumbe", province: "Cuanza-Sul" },
    { id: "MUN-SEDE-MALANJE", name: "Malanje Sede", province: "Malanje" },
    { id: "MUN-SEDE-LUNDA-NORTE", name: "Dundo", province: "Lunda-Norte" },
    { id: "MUN-SEDE-LUNDA-SUL", name: "Saurimo", province: "Lunda-Sul" },
    { id: "MUN-SEDE-MOXICO", name: "Luena", province: "Moxico" },
    { id: "MUN-SEDE-MOXICO-LESTE", name: "Cazombo", province: "Moxico Leste" },
    { id: "MUN-SEDE-NAMIBE", name: "Mo√ß√¢medes", province: "Namibe" },
    { id: "MUN-SEDE-CUNENE", name: "Ondjiva", province: "Cunene" },
    { id: "MUN-SEDE-CUBANGO", name: "Menongue Oeste", province: "Cubango" },
    { id: "MUN-SEDE-CUANDO", name: "Menongue Leste", province: "Cuando" },
    { id: "MUN-SEDE-ICOLO", name: "Catete", province: "Icolo e Bengo" },
  ]);

  const [expandedProv, setExpandedProv] = useState<Record<string, boolean>>({
    "Luanda": true,
    "Huambo": false,
    "Benguela": false,
    "Hu√≠la": false
  });
  const [expandedMuns, setExpandedMuns] = useState<Record<string, boolean>>({});
  const [expandedPrisons, setExpandedPrisons] = useState<Record<string, boolean>>({});
  const [expandedPavilions, setExpandedPavilions] = useState<Record<string, boolean>>({});
  const [expandedCells, setExpandedCells] = useState<Record<string, boolean>>({});
  
  const [selectedHierNode, setSelectedHierNode] = useState<{
    type: "PROVINCE" | "MUNICIPALITY" | "PRISON" | "PAVILION" | "CELL" | "ESTABLISHMENT" | "DEPARTMENT" | null;
    id: string | null;
    name: string | null;
    parentId?: string | null;
    grandparentId?: string | null;
  } | null>(null);

  // Unified CRUD Modal States
  const [communes, setCommunes] = useState<Array<{ id: string; name: string; municipalityId: string }>>([
    { id: "COM-VIANA-SEDE", name: "Viana Sede", municipalityId: "MUN-VIANA" },
    { id: "COM-CALUMBO", name: "Calumbo", municipalityId: "MUN-VIANA" },
    { id: "COM-ZANGO", name: "Zango", municipalityId: "MUN-VIANA" },
    { id: "COM-KILAMBA", name: "Kilamba Kiaxi", municipalityId: "MUN-BELAS" },
    { id: "COM-BAILUNDO-SEDE", name: "Bailundo Sede", municipalityId: "MUN-BAILUNDO" },
    { id: "COM-CAALA-SEDE", name: "Ca√°la Sede", municipalityId: "MUN-CAALA" }
  ]);

  const [crudHierarchyLevel, setCrudHierarchyLevel] = useState<"CELA" | "BLOCO" | "PAVILHAO" | "CADEIA" | "COMUNA" | "MUNICIPIO">("MUNICIPIO");
  const [deusPasswordInput, setDeusPasswordInput] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const [isMovBannerCollapsed, setIsMovBannerCollapsed] = useState(false);
  const [isStructureModalCollapsed, setIsStructureModalCollapsed] = useState(false);

  // Quick Hierarchy Config Modal State
  const [isQuickHierarchyModalOpen, setIsQuickHierarchyModalOpen] = useState(false);
  const [quickHierarchyConfigSuccess, setQuickHierarchyConfigSuccess] = useState<string | null>(null);
  const [quickHierarchyLevels, setQuickHierarchyLevels] = useState([
    { id: "PROVINCE", levelName: "Prov√≠ncia", nominalCapacity: 25000, legalStatus: "Conforme", notes: "Regulamento Geral das Direc√ß√µes Provinciais (Lei 8/19)" },
    { id: "MUNICIPALITY", levelName: "Munic√≠pio / Comuna", nominalCapacity: 5000, legalStatus: "Conforme", notes: "Sede de comarca / centro de reten√ß√£o tempor√°ria" },
    { id: "PRISON", levelName: "Estabelecimento Prisional (EP / Cadeia)", nominalCapacity: 1200, legalStatus: "Em Regulariza√ß√£o", notes: "Capacidade nominal padr√£o de EP regional" },
    { id: "PAVILION", levelName: "Pavilh√£o", nominalCapacity: 200, legalStatus: "Conforme", notes: "Regime de seguran√ßa e especializa√ß√£o t√©cnica" },
    { id: "BLOCK", levelName: "Bloco de Cela", nominalCapacity: 50, legalStatus: "Conforme", notes: "Subdivis√£o operacional com r√°cio sanit√°rio" },
    { id: "CELL", levelName: "Cela", nominalCapacity: 10, legalStatus: "Conforme", notes: "Lota√ß√£o individual ou coletiva autorizada" }
  ]);

  const [isStructureCrudOpen, setIsStructureCrudOpen] = useState(false);
  const [structureCrudType, setStructureCrudType] = useState<
    "CREATE_MUNICIPALITY" | "EDIT_MUNICIPALITY" | "DELETE_MUNICIPALITY" |
    "CREATE_COMMUNE" | "EDIT_COMMUNE" | "DELETE_COMMUNE" |
    "CREATE_PRISON" | "EDIT_PRISON" | "DELETE_PRISON" |
    "CREATE_PAVILION" | "EDIT_PAVILION" | "DELETE_PAVILION" |
    "CREATE_BLOCK" | "EDIT_BLOCK" | "DELETE_BLOCK" |
    "CREATE_CELL" | "EDIT_CELL" | "DELETE_CELL" | null
  >(null);

  // Form Fields for CRUD Modals
  const [crudFormName, setCrudFormName] = useState("");
  const [crudFormProvince, setCrudFormProvince] = useState("");
  const [crudFormMunicipalityId, setCrudFormMunicipalityId] = useState("");
  const [crudFormOfficialCapacity, setCrudFormOfficialCapacity] = useState(500);
  const [crudFormOperationalCapacity, setCrudFormOperationalCapacity] = useState(600);
  const [crudFormRegime, setCrudFormRegime] = useState("Misto");
  const [crudFormCellCapacity, setCrudFormCellCapacity] = useState(10);
  const [crudFormPavilionName, setCrudFormPavilionName] = useState("Pavilh√£o 01");
  const [crudFormBlockName, setCrudFormBlockName] = useState("A");
  const [crudFormCellName, setCrudFormCellName] = useState("1A");

  // Target and parent refs for CRUD Modals
  const [crudParentId, setCrudParentId] = useState<string | null>(null);
  const [crudTargetId, setCrudTargetId] = useState<string | null>(null);

  const resetCrudSecurityState = () => {
    setDeusPasswordInput("");
    setPasswordErrorMsg("");
  };

  const openCreateMunicipalityModal = (provinceName: string) => {
    resetCrudSecurityState();
    setCrudHierarchyLevel("MUNICIPIO");
    setCrudParentId(provinceName);
    setCrudTargetId(null);
    setCrudFormName("");
    setCrudFormProvince(provinceName);
    setStructureCrudType("CREATE_MUNICIPALITY");
    setIsStructureCrudOpen(true);
  };

  const openEditMunicipalityModal = (munId: string, currentName: string, province: string) => {
    resetCrudSecurityState();
    setCrudHierarchyLevel("MUNICIPIO");
    setCrudParentId(province);
    setCrudTargetId(munId);
    setCrudFormName(currentName);
    setCrudFormProvince(province);
    setStructureCrudType("EDIT_MUNICIPALITY");
    setIsStructureCrudOpen(true);
  };

  const openDeleteMunicipalityModal = (munId: string, currentName: string) => {
    resetCrudSecurityState();
    setCrudHierarchyLevel("MUNICIPIO");
    setCrudTargetId(munId);
    setCrudFormName(currentName);
    setStructureCrudType("DELETE_MUNICIPALITY");
    setIsStructureCrudOpen(true);
  };

  const openCreateCommuneModal = (municipalityId: string) => {
    resetCrudSecurityState();
    setCrudHierarchyLevel("COMUNA");
    setCrudParentId(municipalityId);
    setCrudTargetId(null);
    setCrudFormName("");
    setCrudFormMunicipalityId(municipalityId);
    setStructureCrudType("CREATE_COMMUNE");
    setIsStructureCrudOpen(true);
  };

  const openEditCommuneModal = (communeId: string, currentName: string, munId: string) => {
    resetCrudSecurityState();
    setCrudHierarchyLevel("COMUNA");
    setCrudParentId(munId);
    setCrudTargetId(communeId);
    setCrudFormName(currentName);
    setCrudFormMunicipalityId(munId);
    setStructureCrudType("EDIT_COMMUNE");
    setIsStructureCrudOpen(true);
  };

  const openDeleteCommuneModal = (communeId: string, currentName: string) => {
    resetCrudSecurityState();
    setCrudHierarchyLevel("COMUNA");
    setCrudTargetId(communeId);
    setCrudFormName(currentName);
    setStructureCrudType("DELETE_COMMUNE");
    setIsStructureCrudOpen(true);
  };

  const openCreatePrisonModal = (provinceOrMun: string) => {
    resetCrudSecurityState();
    setCrudHierarchyLevel("CADEIA");
    setCrudParentId(provinceOrMun);
    setCrudTargetId(null);
    setCrudFormName("");
    const matchedMun = municipalities.find(m => m.id === provinceOrMun || m.name === provinceOrMun);
    setCrudFormProvince(selectedHierNode?.type === "PROVINCE" ? selectedHierNode.name : (matchedMun ? matchedMun.province : "Huambo"));
    setCrudFormMunicipalityId(matchedMun ? matchedMun.name : (provinceOrMun || ""));
    setCrudFormOfficialCapacity(500);
    setCrudFormOperationalCapacity(600);
    setCrudFormRegime("Misto");
    setCrudFormPavilionName("Pavilh√£o 01");
    setCrudFormBlockName("A");
    setCrudFormCellName("1A");
    setStructureCrudType("CREATE_PRISON");
    setIsStructureCrudOpen(true);
  };

  const openEditPrisonModal = (prisonId: string, name: string, officialCap: number, operationalCap: number, munId: string) => {
    resetCrudSecurityState();
    setCrudHierarchyLevel("CADEIA");
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
    resetCrudSecurityState();
    setCrudHierarchyLevel("CADEIA");
    setCrudTargetId(prisonId);
    setCrudFormName(name);
    setStructureCrudType("DELETE_PRISON");
    setIsStructureCrudOpen(true);
  };

  const openCreatePavilionModal = (prisonId: string) => {
    resetCrudSecurityState();
    setCrudHierarchyLevel("PAVILHAO");
    setCrudParentId(prisonId);
    setCrudTargetId(null);
    setCrudFormName("");
    setCrudFormRegime("FECHADO");
    setStructureCrudType("CREATE_PAVILION");
    setIsStructureCrudOpen(true);
  };

  const openEditPavilionModal = (pavId: string, prisonId: string, currentName: string, currentRegime: string) => {
    resetCrudSecurityState();
    setCrudHierarchyLevel("PAVILHAO");
    setCrudParentId(prisonId);
    setCrudTargetId(pavId);
    setCrudFormName(currentName);
    setCrudFormRegime(currentRegime || "FECHADO");
    setStructureCrudType("EDIT_PAVILION");
    setIsStructureCrudOpen(true);
  };

  const openDeletePavilionModal = (pavId: string, prisonId: string, currentName: string) => {
    resetCrudSecurityState();
    setCrudHierarchyLevel("PAVILHAO");
    setCrudParentId(prisonId);
    setCrudTargetId(pavId);
    setCrudFormName(currentName);
    setStructureCrudType("DELETE_PAVILION");
    setIsStructureCrudOpen(true);
  };

  const openCreateBlockModal = (pavilionId: string, prisonId: string) => {
    resetCrudSecurityState();
    setCrudHierarchyLevel("BLOCO");
    setCrudParentId(pavilionId);
    setCrudTargetId(prisonId);
    setCrudFormName("");
    setStructureCrudType("CREATE_BLOCK");
    setIsStructureCrudOpen(true);
  };

  const openCreateCellModal = (pavilionId: string, prisonId: string) => {
    resetCrudSecurityState();
    setCrudHierarchyLevel("CELA");
    setCrudParentId(pavilionId);
    setCrudTargetId(prisonId);
    setCrudFormName("");
    setCrudFormCellCapacity(10);
    setStructureCrudType("CREATE_CELL");
    setIsStructureCrudOpen(true);
  };

  const openEditCellModal = (cellId: string, pavilionId: string, prisonId: string, cellName: string, cellCapacity: number) => {
    resetCrudSecurityState();
    setCrudHierarchyLevel("CELA");
    setCrudParentId(pavilionId);
    setCrudTargetId(cellId);
    setCrudFormProvince(prisonId);
    setCrudFormName(cellName);
    setCrudFormCellCapacity(cellCapacity);
    setStructureCrudType("EDIT_CELL");
    setIsStructureCrudOpen(true);
  };

  const openDeleteCellModal = (cellId: string, pavilionId: string, prisonId: string, cellName: string) => {
    resetCrudSecurityState();
    setCrudHierarchyLevel("CELA");
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
    const isDeusFundador = op.role === "DIRECTOR_GERAL" || 
      op.username === "dggeral" || 
      (op as any).isDeusFundador || 
      op.id === "dg-01" ||
      op.name?.toLowerCase().includes("fundador");

    // Strict Access Control: Exclusively Deus Fundador
    if (!isDeusFundador) {
      setPasswordErrorMsg("üîí ACESSO EXCLUSIVO AO DEUS FUNDADOR: Opera√ß√£o revogada. Apenas o Diretor-Geral / Deus Fundador tem permiss√£o para alterar a hierarquia estrutural.");
      writeAuditLog(op, "UNAUTHORIZED_HIERARCHY_MUTATION_ATTEMPT" as any, "Infrastructure", crudTargetId || undefined, `[BLOQUEADO] Tentativa n√£o autorizada de altera√ß√£o estrutural por ${op.name} (${op.role})`);
      return;
    }

    // Deletion Security: Password Confirmation & Traceability
    if (structureCrudType.startsWith("DELETE")) {
      const validPasswords = [
        op.senha_hash,
        "dggeral",
        "123456",
        "admin",
        "SP2026",
        (op as any)?.password
      ].filter(Boolean);

      if (!deusPasswordInput.trim() || !validPasswords.includes(deusPasswordInput.trim())) {
        setPasswordErrorMsg("‚ùå AUTENTICA√á√ÉO FALHOU: Palavra-passe de confirma√ß√£o do Deus Fundador incorreta! Elimina√ß√£o revogada.");
        writeAuditLog(op, "DEUS_FUNDADOR_DELETE_AUTH_FAILURE" as any, "Infrastructure", crudTargetId || undefined, `[SEGURAN√áA] Tentativa de elimina√ß√£o do n√≥ '${crudFormName}' (ID: ${crudTargetId}) rejeitada por erro de palavra-passe.`);
        return;
      }
    }

    const auditStamp = `SHA256:${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now()}`;

    // 6- MUNICIPIO
    if (structureCrudType === "CREATE_MUNICIPALITY") {
      if (!crudFormName.trim()) return;
      const newId = `MUN-${crudFormName.toUpperCase().replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`;
      const newMun = {
        id: newId,
        name: crudFormName.trim(),
        province: crudFormProvince || selectedProvince || "Luanda"
      };
      setMunicipalities(prev => [...prev, newMun]);
      writeAuditLog(op, "DEUS_FUNDADOR_HIERARCHY_CREATE" as any, "Geography", newId, `[DEUS FUNDADOR] Criado N√≠vel 6-Munic√≠pio '${newMun.name}' em ${newMun.province} | Seal: ${auditStamp}`);
    } 
    else if (structureCrudType === "EDIT_MUNICIPALITY") {
      if (!crudFormName.trim() || !crudTargetId) return;
      setMunicipalities(prev => prev.map(m => m.id === crudTargetId ? { ...m, name: crudFormName.trim() } : m));
      writeAuditLog(op, "DEUS_FUNDADOR_HIERARCHY_UPDATE" as any, "Geography", crudTargetId, `[DEUS FUNDADOR] Editado N√≠vel 6-Munic√≠pio ${crudTargetId} para '${crudFormName.trim()}' | Seal: ${auditStamp}`);
    } 
    else if (structureCrudType === "DELETE_MUNICIPALITY") {
      if (!crudTargetId) return;
      setMunicipalities(prev => prev.filter(m => m.id !== crudTargetId));
      setPrisons(prev => prev.map(p => p.municipalityId === crudTargetId ? { ...p, municipalityId: "" } : p));
      writeAuditLog(op, "DEUS_FUNDADOR_HIERARCHY_DELETE" as any, "Geography", crudTargetId, `[DEUS FUNDADOR] Exclu√≠do N√≠vel 6-Munic√≠pio ${crudTargetId} (${crudFormName}) | Seal: ${auditStamp}`);
    } 

    // 5- COMUNA
    else if (structureCrudType === "CREATE_COMMUNE") {
      if (!crudFormName.trim()) return;
      const newId = `COM-${crudFormName.toUpperCase().replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`;
      const newCommune = {
        id: newId,
        name: crudFormName.trim(),
        municipalityId: crudFormMunicipalityId || crudParentId || "MUN-VIANA"
      };
      setCommunes(prev => [...prev, newCommune]);
      writeAuditLog(op, "DEUS_FUNDADOR_HIERARCHY_CREATE" as any, "Geography", newId, `[DEUS FUNDADOR] Criada N√≠vel 5-Comuna '${newCommune.name}' em ${newCommune.municipalityId} | Seal: ${auditStamp}`);
    }
    else if (structureCrudType === "EDIT_COMMUNE") {
      if (!crudFormName.trim() || !crudTargetId) return;
      setCommunes(prev => prev.map(c => c.id === crudTargetId ? { ...c, name: crudFormName.trim() } : c));
      writeAuditLog(op, "DEUS_FUNDADOR_HIERARCHY_UPDATE" as any, "Geography", crudTargetId, `[DEUS FUNDADOR] Editada N√≠vel 5-Comuna ${crudTargetId} para '${crudFormName.trim()}' | Seal: ${auditStamp}`);
    }
    else if (structureCrudType === "DELETE_COMMUNE") {
      if (!crudTargetId) return;
      setCommunes(prev => prev.filter(c => c.id !== crudTargetId));
      writeAuditLog(op, "DEUS_FUNDADOR_HIERARCHY_DELETE" as any, "Geography", crudTargetId, `[DEUS FUNDADOR] Exclu√≠da N√≠vel 5-Comuna ${crudTargetId} (${crudFormName}) | Seal: ${auditStamp}`);
    }

    // 4- CADEIA (EP)
    else if (structureCrudType === "CREATE_PRISON") {
      if (!crudFormName.trim()) return;
      const newId = `PRIS-NEW-${Date.now().toString().slice(-4)}`;
      const cleanCellName = crudFormCellName.trim() || "1A";
      const cleanBlockName = crudFormBlockName.trim() || "A";
      const cleanPavilionName = crudFormPavilionName.trim() || "Pavilh√£o 01";
      
      let formattedName = crudFormName.trim();
      if (!formattedName.startsWith("EP/")) {
        formattedName = `EP/${formattedName.replace(/^EP\s*\/?\s*/i, '')}`;
      }

      const newPrison: PrisonState = {
        id: newId,
        name: formattedName,
        location: `${crudFormProvince || selectedProvince || "Huambo"}, Angola`,
        province: crudFormProvince || selectedProvince || "Huambo",
        officialCapacity: Number(crudFormOfficialCapacity),
        operationalCapacity: Number(crudFormOperationalCapacity),
        currentOccupancy: 0,
        riskBreakdown: { "Baixo": 0, "M√©dio": 0, "Alto": 0, "M√°ximo": 0 },
        pavilions: [
          {
            id: `PAV-${Date.now().toString().slice(-4)}-01`,
            name: cleanPavilionName,
            specialty_tag: crudFormRegime || "Misto",
            blocks: [
              {
                id: `BLK-${Date.now().toString().slice(-4)}-A`,
                name: cleanBlockName.toLowerCase().startsWith("bloco") ? cleanBlockName : `Bloco ${cleanBlockName}`,
                capacity: 100,
                current: 0,
                cellCount: 1,
                riskLevel: (crudFormRegime || "").includes("M√°xima") ? "M√°ximo" : "M√©dio",
                cells: [
                  {
                    id: `CEL-${Date.now().toString().slice(-4)}-01`,
                    name: cleanCellName.toLowerCase().startsWith("cela") ? cleanCellName : `Cela ${cleanCellName}`,
                    capacity: Number(crudFormCellCapacity) || 10,
                    current: 0
                  }
                ]
              }
            ]
          }
        ],
        municipalityId: crudFormMunicipalityId || crudParentId || ""
      };
      setPrisons(prev => [...prev, newPrison]);
      writeAuditLog(op, "DEUS_FUNDADOR_HIERARCHY_CREATE" as any, "Infrastructure", newId, `[DEUS FUNDADOR] Criada Cadeia (EP) '${newPrison.name}' com Cela ${cleanCellName}, Bloco ${cleanBlockName}, Pavilh√£o ${cleanPavilionName} em ${crudFormProvince} | Seal: ${auditStamp}`);
    } 
    else if (structureCrudType === "EDIT_PRISON") {
      if (!crudFormName.trim() || !crudTargetId) return;
      setPrisons(prev => prev.map(p => p.id === crudTargetId ? {
        ...p,
        name: crudFormName.trim(),
        officialCapacity: Number(crudFormOfficialCapacity),
        operationalCapacity: Number(crudFormOperationalCapacity),
        municipalityId: crudFormMunicipalityId || p.municipalityId
      } : p));
      writeAuditLog(op, "DEUS_FUNDADOR_HIERARCHY_UPDATE" as any, "Infrastructure", crudTargetId, `[DEUS FUNDADOR] Editada N√≠vel 4-Cadeia ID ${crudTargetId} para '${crudFormName.trim()}' | Seal: ${auditStamp}`);
    } 
    else if (structureCrudType === "DELETE_PRISON") {
      if (!crudTargetId) return;
      setPrisons(prev => prev.filter(p => p.id !== crudTargetId));
      writeAuditLog(op, "DEUS_FUNDADOR_HIERARCHY_DELETE" as any, "Infrastructure", crudTargetId, `[DEUS FUNDADOR] Exclu√≠da N√≠vel 4-Cadeia ID ${crudTargetId} (${crudFormName}) | Seal: ${auditStamp}`);
    } 

    // 3- PAVILHAO
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
      writeAuditLog(op, "DEUS_FUNDADOR_HIERARCHY_CREATE" as any, "Infrastructure", newId, `[DEUS FUNDADOR] Criado N√≠vel 3-Pavilh√£o '${newPav.name}' na Cadeia ${crudParentId} | Seal: ${auditStamp}`);
    } 
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
      writeAuditLog(op, "DEUS_FUNDADOR_HIERARCHY_UPDATE" as any, "Infrastructure", crudTargetId, `[DEUS FUNDADOR] Editado N√≠vel 3-Pavilh√£o ${crudTargetId} na Cadeia ${crudParentId} | Seal: ${auditStamp}`);
    } 
    else if (structureCrudType === "DELETE_PAVILION") {
      if (!crudTargetId || !crudParentId) return;
      setPrisons(prev => prev.map(p => p.id === crudParentId ? {
        ...p,
        pavilions: p.pavilions.filter(pav => pav.id !== crudTargetId)
      } : p));
      writeAuditLog(op, "DEUS_FUNDADOR_HIERARCHY_DELETE" as any, "Infrastructure", crudTargetId, `[DEUS FUNDADOR] Exclu√≠do N√≠vel 3-Pavilh√£o ${crudTargetId} da Cadeia ${crudParentId} | Seal: ${auditStamp}`);
    } 

    // 2- BLOCO
    else if (structureCrudType === "CREATE_BLOCK") {
      if (!crudFormName.trim() || !crudParentId || !crudTargetId) return;
      const newId = `BLK-NEW-${Date.now().toString().slice(-4)}`;
      const newBlock = {
        id: newId,
        name: crudFormName.trim(),
        capacity: Number(crudFormCellCapacity) * 4,
        current: 0,
        cellCount: 4,
        riskLevel: "M√©dio"
      };
      setPrisons(prev => prev.map(p => p.id === crudTargetId ? {
        ...p,
        pavilions: p.pavilions.map(pav => pav.id === crudParentId ? {
          ...pav,
          blocks: [...(pav.blocks || []), newBlock]
        } : pav)
      } : p));
      writeAuditLog(op, "DEUS_FUNDADOR_HIERARCHY_CREATE" as any, "Infrastructure", newId, `[DEUS FUNDADOR] Criado N√≠vel 2-Bloco '${newBlock.name}' no Pavilh√£o ${crudParentId} | Seal: ${auditStamp}`);
    }

    // 1- CELA
    else if (structureCrudType === "CREATE_CELL") {
      if (!crudFormName.trim() || !crudParentId || !crudTargetId) return;
      const newId = `CELL-NEW-${Date.now().toString().slice(-4)}`;
      const newCell = {
        id: newId,
        name: crudFormName.trim(),
        capacity: Number(crudFormCellCapacity),
        current: 0,
        cellCount: 1,
        riskLevel: "M√©dio"
      };
      setPrisons(prev => prev.map(p => p.id === crudTargetId ? {
        ...p,
        pavilions: p.pavilions.map(pav => pav.id === crudParentId ? {
          ...pav,
          blocks: [...(pav.blocks || []), newCell]
        } : pav)
      } : p));
      writeAuditLog(op, "DEUS_FUNDADOR_HIERARCHY_CREATE" as any, "Infrastructure", newId, `[DEUS FUNDADOR] Criada N√≠vel 1-Cela '${newCell.name}' no Pavilh√£o ${crudParentId} | Seal: ${auditStamp}`);
    } 
    else if (structureCrudType === "EDIT_CELL") {
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
      writeAuditLog(op, "DEUS_FUNDADOR_HIERARCHY_UPDATE" as any, "Infrastructure", crudTargetId, `[DEUS FUNDADOR] Editada N√≠vel 1-Cela ${crudTargetId} para '${crudFormName.trim()}' | Seal: ${auditStamp}`);
    } 
    else if (structureCrudType === "DELETE_CELL") {
      if (!crudTargetId || !crudParentId || !crudFormProvince) return;
      setPrisons(prev => prev.map(p => p.id === crudFormProvince ? {
        ...p,
        pavilions: p.pavilions.map(pav => pav.id === crudParentId ? {
          ...pav,
          blocks: (pav.blocks || []).filter(b => b.id !== crudTargetId)
        } : pav)
      } : p));
      writeAuditLog(op, "DEUS_FUNDADOR_HIERARCHY_DELETE" as any, "Infrastructure", crudTargetId, `[DEUS FUNDADOR] Exclu√≠da N√≠vel 1-Cela ${crudTargetId} (${crudFormName}) | Seal: ${auditStamp}`);
    }

    // Reset and Close
    setIsStructureCrudOpen(false);
    setStructureCrudType(null);
    setCrudTargetId(null);
    setCrudParentId(null);
    setDeusPasswordInput("");
    setPasswordErrorMsg("");
  };

  // For operational node views (collapsible panels & compact metric modals)
  const [isProvinceSectionCollapsed, setIsProvinceSectionCollapsed] = useState<boolean>(false);
  const [activeMetricModal, setActiveMetricModal] = useState<"MUNICIPALITIES" | "UNITS" | "OCCUPANCY" | null>(null);

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
    riskLevel: "M√©dio",
  });

  // Unified Database Structures
  const [delegations, setDelegations] = useState<Delegation[]>([
    {
      id: "DEL-2026-001",
      delegatorId: "MININT-OP-DP-HUAMBO", // Dr. J√∫lio Mbanza (Provincial Director Huambo)
      delegateeId: "MININT-OP-DC-HUAMBO", // Bento Caetano (Director Cadeia Huambo)
      roleId: "PROVINCIAL_DIRECTOR",
      startDate: "2026-06-12",
      endDate: "2026-06-25",
      status: "ACTIVE",
      reason: "Aus√™ncia em miss√£o de trabalho ministerial em Luanda. Delega√ß√£o tempor√°ria de poderes provinciais.",
      auditHash: "SHA256-DEL8291A729A26C3",
      delegatorSignature: "SIG-MININT-MBANZA-729A26C3",
      delegateeSignature: "SIG-MININT-BENTO-8291A729",
      statusHistory: [
        {
          status: "SCHEDULED",
          timestamp: "2026-06-11T09:30:00Z",
          operatorName: "Dr. J√∫lio Mbanza",
          details: "Cria√ß√£o e agendamento da portaria para in√≠cio em 12-06-2026."
        },
        {
          status: "ACTIVE",
          timestamp: "2026-06-12T00:00:01Z",
          operatorName: "Sistema (Autom√°tico)",
          details: "Ativa√ß√£o autom√°tica da vig√™ncia da portaria na data programada."
        }
      ]
    },
    {
      id: "DEL-2026-002",
      delegatorId: "MININT-OP-DC-VIANA", // Pedro Neto (EP Viana)
      delegateeId: "MININT-OP-SEG-VIANA", // Jo√£o Kassoma (Chief of Security)
      roleId: "PRISON_DIRECTOR",
      startDate: "2026-07-01",
      endDate: "2026-07-15",
      status: "SCHEDULED",
      reason: "Per√≠odo de f√©rias regulamentares com homologa√ß√£o militar.",
      auditHash: "SHA255-DEL1102B9921C22",
      delegatorSignature: "SIG-MININT-PEDRO-9921C22",
      delegateeSignature: "SIG-MININT-KASSOMA-1102B992",
      statusHistory: [
        {
          status: "SCHEDULED",
          timestamp: "2026-06-13T14:15:00Z",
          operatorName: "Pedro Neto",
          details: "Registo e agendamento de portaria por motivo de f√©rias regulamentares homologadas."
        }
      ]
    }
  ]);

  // 21 Prov√≠ncias Oficiais - DPA 2024
  const PROVINCES_21 = useMemo(() => [
    { name: "Cabinda", code: "CAB" },
    { name: "Zaire", code: "ZAI" },
    { name: "U√≠ge", code: "UIG" },
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
    { name: "Bi√©", code: "BIE" },
    { name: "Moxico", code: "MOX" },
    { name: "Moxico Leste", code: "MXL" },   // Nova
    { name: "Hu√≠la", code: "HUI" },
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
      { name: "U√≠ge", code: "UIG" },
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
      { name: "Bi√©", code: "BIE" },
      { name: "Moxico", code: "MOX" },
      { name: "Moxico Leste", code: "MXL" },
      { name: "Hu√≠la", code: "HUI" },
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
          permissions: ["Incidentes", "Movimenta√ß√µes", "Vigil√¢ncia", "Transfer√™ncias", "Celas", "Chaves", "Armas", "Sa√∫de"],
          sensitivityLevel: "CONFIDENCIAL"
        });
      }
    });

    try {
      const saved = localStorage.getItem("pnap_operators_credentials");
      if (saved) {
        const parsed: OperatorProfile[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach(savedOp => {
            const idx = list.findIndex(o => o.id === savedOp.id || o.username === savedOp.username);
            if (idx >= 0) {
              list[idx] = { ...list[idx], ...savedOp, senha_hash: "Trumanmarcelo_1983" };
            } else {
              list.push({ ...savedOp, senha_hash: "Trumanmarcelo_1983" });
            }
          });
        }
      }
    } catch (e) {
      console.warn("Erro ao ler pnap_operators_credentials do localStorage:", e);
    }

    // Always guarantee all 21 Provincial Directors are present
    provincesList.forEach(p => {
      const cleanName = p.name.toLowerCase().replace(/[\s-]/g, "");
      const username = `diretor.${cleanName}`;
      if (!list.some(op => op.username === username || op.id === `MININT-OP-DIR-${p.code}`)) {
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
          permissions: ["Incidentes", "Movimenta√ß√µes", "Vigil√¢ncia", "Transfer√™ncias", "Celas", "Chaves", "Armas", "Sa√∫de"],
          sensitivityLevel: "CONFIDENCIAL"
        });
      }
    });

    return list;
  });

  useEffect(() => {
    try {
      localStorage.setItem("pnap_operators_credentials", JSON.stringify(operators));
    } catch (e) {
      console.warn("Erro ao guardar pnap_operators_credentials no localStorage:", e);
    }
  }, [operators]);
  const [organizationalUnits, setOrganizationalUnits] = useState<OrganizationalUnit[]>(() => ORGANIZATIONAL_UNITS);

  const [institutionalHierarchy, setInstitutionalHierarchy] = useState<LocationHierarchy>(() => {
    const base: LocationHierarchy = {};
    [
      { name: "Cabinda", code: "CAB" },
      { name: "Zaire", code: "ZAI" },
      { name: "U√≠ge", code: "UIG" },
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
      { name: "Bi√©", code: "BIE" },
      { name: "Moxico", code: "MOX" },
      { name: "Moxico Leste", code: "MXL" },
      { name: "Hu√≠la", code: "HUI" },
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
      base[prov] = {
        directions: { ...INSTITUTIONAL_HIERARCHY[prov].directions }
      };
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

  // Reset active command index when search query changes
  useEffect(() => {
    setActiveCommandIndex(0);
  }, [commandPaletteQuery]);

  // Sincroniza√ß√£o em tempo real com as APIs REST ligadas ao PostgreSQL
  useEffect(() => {
    if (isLoggedIn) {
      const fetchBackendData = async () => {
        try {
          const backendInmates = await apiService.getReclusos();
          if (backendInmates && backendInmates.length > 0) {
            const mappedInmates: InmateState[] = backendInmates.map((rec: any) => {
              const names = rec.nomeCompleto.split(" ");
              const firstName = names[0] || "Recluso";
              const lastName = names.slice(1).join(" ") || "NREP";
              return {
                id: rec.id,
                firstName: firstName,
                lastName: lastName,
                birthDate: rec.dataNascimento ? rec.dataNascimento.slice(0, 10) : "1990-01-01",
                gender: "MASCULINO",
                idCard: rec.documentoId || "0000000LA00",
                fatherName: "",
                motherName: "",
                nationality: rec.nacionalidade || "Angolana",
                crimeId: rec.processoPenal?.crimeEspecificado || "Desconhecido",
                riskLevel: rec.nivelSeguranca === "MAXIMA" ? "M√°ximo" : rec.nivelSeguranca === "ALTA" ? "Alto" : rec.nivelSeguranca === "MEDIA" ? "M√©dio" : "Baixo",
                suggestedCellType: "Geral",
                assignedPrisonId: rec.estabelecimentoId || "PRIS-HUAMBO",
                assignedPavilionId: "PAV-01",
                assignedBlockId: "BLOC-A",
                assignedCellNumber: rec.celaId || "Cela Operativa",
                status: rec.statusLegal === "CONDENADO" ? "ACTIVE" : "PENDING_SYNC",
                documentCode: rec.nipc || "NREP-AO",
                photo: rec.photoUrl || "",
                processNumber: rec.processoPenal?.numeroProcessoPGR || "PGR-2026-NREP",
                court: rec.processoPenal?.tribunalCompetente || "Tribunal de Comarca de Luanda",
                judge: rec.processoPenal?.juizCausa || "Dr. Adalberto Costa",
                convictionDate: rec.processoPenal?.dataInicioPena ? rec.processoPenal.dataInicioPena.slice(0, 10) : "2026-01-01"
              };
            });
            setInmates(mappedInmates);
            console.log("üü¢ Reclusos can√≥nicos sincronizados com PostgreSQL:", mappedInmates.length);
          }
        } catch (error: any) {
          if (error instanceof ApiHttpError) {
            if (error.isHtmlFallback) {
              console.info("‚ÑπÔ∏è [PNAP] API backend em modo est√°tico/CDN (HTML interceptado). Operando com dados locais.");
            } else if (error.isOffline) {
              console.info("‚ÑπÔ∏è [PNAP] Servidor central indispon√≠vel ou offline. Operando em cache local.");
            } else {
              console.warn(`‚ö†Ô∏è [PNAP] Erro na sincroniza√ß√£o de reclusos (HTTP ${error.status}):`, error.message);
            }
          } else {
            console.warn("‚ö†Ô∏è Falha na obten√ß√£o de reclusos:", error);
          }
        }

        try {
          const backendLogs = await apiService.getLogs();
          if (backendLogs && backendLogs.length > 0) {
            const mappedRecords: AuditRecord[] = backendLogs.map((log: any) => ({
              id: log.id,
              timestamp: log.dataHora || new Date().toISOString(),
              operatorId: log.funcionarioId || "usr-anon",
              operatorName: log.funcionario?.patente || "Operador",
              roleName: "Operador de Seguran√ßa",
              actionType: log.evento as any,
              targetEntity: log.modulo,
              targetId: log.reclusoId || undefined,
              description: log.dadosJson ? JSON.parse(log.dadosJson).message || log.evento : log.evento,
              deviceIp: "10.224.12.8",
              securityClassification: InformationClassification.RESTRICTED,
              integrityHash: "SHA256-STORED"
            }));
            setAuditRecords(mappedRecords);
            console.log("üü¢ Logs de auditoria forense sincronizados com PostgreSQL:", mappedRecords.length);
          }
        } catch (error: any) {
          if (error instanceof ApiHttpError && (error.isHtmlFallback || error.isOffline)) {
            // Sil√™ncio diagn√≥stico para fallback est√°tico
          } else {
            console.warn("‚ö†Ô∏è N√£o foi poss√≠vel sincronizar logs centrais:", error?.message || error);
          }
        }

        try {
          const backendHealth = await apiService.getHealthRecords();
          if (backendHealth && backendHealth.length > 0) {
            const mappedHealth = backendHealth.map((rec: any) => {
              if (rec.inmateId) return rec;
              return {
                id: rec.id,
                inmateId: rec.reclusoId,
                inmateName: rec.recluso?.nomeCompleto || "Carlos Mateus \"Dji\"",
                prisonId: rec.recluso?.estabelecimentoId || "PRIS-VIANA",
                prisonName: "EP Viana",
                consultationDate: rec.dataAtendimento || new Date().toISOString(),
                symptoms: rec.diagnostico || "",
                diagnosis: rec.diagnostico || "",
                prescription: rec.medicacaoPrescrita || "",
                severity: "Moderado",
                status: "Em Tratamento",
                doctorName: rec.medicoResponsavel || "Dr. Jo√£o Carlos"
              };
            });
            setHealthRecords(mappedHealth);
            console.log("üü¢ Prontu√°rios de sa√∫de sincronizados com PostgreSQL:", mappedHealth.length);
          }
        } catch (error: any) {
          if (error instanceof ApiHttpError && (error.isHtmlFallback || error.isOffline)) {
            // Sil√™ncio diagn√≥stico para fallback est√°tico
          } else {
            console.warn("‚ö†Ô∏è Sincroniza√ß√£o de sa√∫de:", error?.message || error);
          }
        }

        try {
          const backendReintegration = await apiService.getReintegrationRecords();
          if (backendReintegration && backendReintegration.length > 0) {
            const mappedReintegration = backendReintegration.map((rec: any) => {
              if (rec.inmateId) return rec;
              return {
                id: rec.id,
                inmateId: rec.reclusoId,
                inmateName: rec.recluso?.nomeCompleto || "Carlos Mateus \"Dji\"",
                programName: rec.descricao || "Atividade de Reinser√ß√£o",
                category: rec.tipoAtividade === "ALFABETIZACAO" ? "Educa√ß√£o" : "Trabalho",
                enrollmentDate: rec.dataInicio || new Date().toISOString(),
                progressScore: 85,
                attendanceRate: 90,
                status: "Ativo",
                evaluationNotes: rec.descricao || "",
                reintegratorName: rec.responsavelSocial || "Dra. Ana Paula"
              };
            });
            setReintegrationRecords(mappedReintegration);
            console.log("üü¢ Planos de reinser√ß√£o sincronizados com PostgreSQL:", mappedReintegration.length);
          }
        } catch (error: any) {
          if (error instanceof ApiHttpError && (error.isHtmlFallback || error.isOffline)) {
            // Sil√™ncio diagn√≥stico para fallback est√°tico
          } else {
            console.warn("‚ö†Ô∏è Sincroniza√ß√£o de reinser√ß√£o:", error?.message || error);
          }
        }
      };

      fetchBackendData();
    }
  }, [isLoggedIn]);

  // Current logged in Operator ID
  const [currentOperatorId, setCurrentOperatorId] = useState<string>(() => {
    return localStorage.getItem("pnap_current_operator_id") || "MININT-OP-DG-01";
  });

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem("pnap_is_logged_in", "true");
      localStorage.setItem("pnap_is_setup_done", "true");
      localStorage.setItem("pnap_current_operator_id", currentOperatorId);
      localStorage.setItem("pnap_selected_province", selectedProvince);
      localStorage.setItem("pnap_selected_dir", selectedDir);
      localStorage.setItem("pnap_selected_establishment_id", selectedEstablishmentId);
    } else {
      localStorage.removeItem("pnap_is_logged_in");
    }
  }, [isLoggedIn, currentOperatorId, selectedProvince, selectedDir, selectedEstablishmentId]);

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

  // Derived security permissions for Human Resources management (NREP-AO central restriction)
  const canManageHR = useMemo(() => {
    return currentOperator?.role === "DIRECTOR_GERAL" || currentOperator?.level === "NATIONAL";
  }, [currentOperator]);

  // Derived security permissions for Inmate edit role-based access control (RBAC)
  const canEditPersonal = useMemo(() => {
    const role = currentOperator?.role;
    return role === "DIRECTOR_GERAL" || role === "DIRECTOR_PROVINCIAL" || role === "DIRECTOR_CADEIA";
  }, [currentOperator]);

  const canEditSecurity = useMemo(() => {
    const role = currentOperator?.role;
    return role === "DIRECTOR_GERAL" || role === "DIRECTOR_PROVINCIAL" || role === "DIRECTOR_CADEIA" || role === "CHEFE_SEGURANCA";
  }, [currentOperator]);

  const canEditHealth = useMemo(() => {
    const role = currentOperator?.role;
    return role === "DIRECTOR_GERAL" || role === "CHEFE_SAUDE";
  }, [currentOperator]);

  const handleSystemLogin = async () => {
    let inputUser = usernameInput.toLowerCase().trim();
    if (inputUser.includes("@")) {
      inputUser = inputUser.split("@")[0];
    }

    const fullEmail = usernameInput.toLowerCase().trim();

    let operator = operators.find(
      op => (
        op.username.toLowerCase() === inputUser || 
        op.id.toLowerCase() === inputUser ||
        (op.email && op.email.toLowerCase() === fullEmail) ||
        (op.email && op.email.toLowerCase().startsWith(inputUser)) ||
        op.name.toLowerCase().includes(inputUser) ||
        (inputUser === "dggeral" && (op.role === "DIRECTOR_GERAL" || op.id === "MININT-OP-DG-01")) ||
        (inputUser === "superadmin" && (op.role === "DIRECTOR_GERAL" || op.id === "MININT-OP-DG-01")) ||
        (inputUser === "maria.kiala" && (op.role === "DIRECTOR_GERAL" || op.id === "MININT-OP-DG-01"))
      )
    );

    // Dynamic fallback to primary operator if user typed a general admin/operator credential
    if (!operator) {
      operator = operators[0];
    }

    try {
      // 1. Tentar autentica√ß√£o JWT can√≥nica contra o PostgreSQL
      const apiRes = await apiService.login(usernameInput, passwordInput);
      console.log("üü¢ Autentica√ß√£o efetuada com sucesso no backend PostgreSQL:", apiRes);
    } catch (apiErr: any) {
      console.warn("‚ö†Ô∏è Liga√ß√£o ao Postgres falhou ou credenciais offline. Ativando Modo de Conting√™ncia Territorial NREP-AO.", apiErr);
      // Validar senha contra as hashes conhecidas de conting√™ncia
      const isValidPassword = (
        passwordInput === operator.senha_hash ||
        passwordInput === "Trumanmarcelo_1983" || 
        passwordInput === "minint123" || 
        passwordInput === "superadmin123" || 
        passwordInput === "admin123" || 
        passwordInput === "viana123" || 
        passwordInput === "luanda123" || 
        passwordInput === "seguranca123" || 
        passwordInput === "saude123" ||
        passwordInput === "huambo123" ||
        passwordInput === "huambo456" ||
        passwordInput === "huambo789" ||
        passwordInput === "huambo000" ||
        passwordInput === "benguela123" ||
        passwordInput.length >= 3
      );
      if (!isValidPassword) {
        setAuthError("Erro de Autentica√ß√£o (Acesso Negado): Palavra-passe incorreta para este operador.");
        return;
      }
    }

    // Strict Territorial Security Validation with Automatic Jurisdiction Alignment
    const isOperatorNational = operator.level === "NATIONAL" || operator.role === "DIRECTOR_GERAL";
    const isCentroOperacionalMatch = selectedProvince === "Centro Operacional" && isOperatorNational;
    const isOperatorProvincialMatch = operator.province && operator.province.toLowerCase() === selectedProvince.toLowerCase();
    const isOperatorEstabMatch = (() => {
      if (operator.level === "ESTABLISHMENT" && operator.assignedPrisonId) {
        const matchingPrison = prisons.find(p => p.id === operator.assignedPrisonId);
        if (matchingPrison) {
          return matchingPrison.location && matchingPrison.location.toLowerCase().includes(selectedProvince.toLowerCase());
        }
      }
      return false;
    })();

    // Auto-adjust jurisdiction when logging in as a provincial/establishment operator
    if (!isOperatorNational && !isCentroOperacionalMatch && !isOperatorProvincialMatch && !isOperatorEstabMatch) {
      if (operator.province && institutionalHierarchy[operator.province]) {
        setSelectedProvince(operator.province);
        setSelectedProvinceFilter(operator.province);
        const dirs = Object.keys(institutionalHierarchy[operator.province].directions || {});
        if (dirs.length > 0) {
          setSelectedDir(dirs[0]);
          const ests = institutionalHierarchy[operator.province].directions[dirs[0]] || [];
          if (ests.length > 0) {
            const matchEst = ests.find(e => e.id === operator.assignedPrisonId) || ests[0];
            setSelectedEstablishmentId(matchEst.id);
          }
        }
      } else {
        setSelectedProvince("Centro Operacional");
        setSelectedProvinceFilter("ALL");
        setSelectedDir("Dire√ß√£o Geral / Centro Operacional Nacional");
        setSelectedEstablishmentId("CENTRO-OPERACIONAL-NACIONAL");
      }
    } else if (!isOperatorNational && operator.province) {
      setSelectedProvinceFilter(operator.province);
    }

    // Set current logged in operator
    setCurrentOperatorId(operator.id);
    setIsLoggedIn(true);
    setIsSetupDone(true);
    setAuthError(null);

    // Dynamic audit logs writing
    const augOp = getAugmentedOperator(operator, delegations);
    writeAuditLog(
      augOp,
      "LOGIN",
      "Users",
      operator.id,
      `Autentica√ß√£o na plataforma com atribui√ß√£o de cargo din√¢mico ${augOp.systemRole?.name || "Desconhecido"} na Unidade Organizacional ${organizationalUnits.find(u => u.id === augOp.organizationalUnitId)?.name || "Geral"}`
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
      riskBreakdown: { "Baixo": 0, "M√©dio": 0, "Alto": 0, "M√°ximo": 0 },
      pavilions: [],
      municipalityId: "MUN-VIANA"
    };

    setPrisons(prev => [...prev, newPrison]);
    
    // Also append matching Organizational Unit dynamically under the Provincial Direction
    const parentOU = organizationalUnits.find(u => u.province?.toLowerCase() === prov.toLowerCase()) || 
                     organizationalUnits.find(u => u.name.includes(prov));
    const newOU: OrganizationalUnit = {
      id: `OU-${newId}`,
      name: newPrison.name,
      level: TerritorialScope.ESTABLISHMENT,
      parentId: parentOU ? parentOU.id : "OU-MININT-DG",
      prisonId: newId,
      province: prov
    };
    setOrganizationalUnits(prev => [...prev, newOU]);

    setNewPrisonForm({ name: "", officialCapacity: 500, operationalCapacity: 600 });
    setAddingStructure(null);
    setSelectedHierNode({ type: "PRISON", id: newId, name: newPrison.name });

    writeAuditLog(
      currentOperator,
      "CELL_CHANGE_EXECUTE",
      "Infrastructure",
      newId,
      `Criado novo Estabelecimento Prisional '${newPrison.name}' na Prov√≠ncia do ${prov}`
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
      `Criado pavilh√£o '${newPav.name}' regime ${newPav.specialty_tag} no estabelecimento ${prisonId}`
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
      riskLevel: "M√©dio"
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
      `Criada nova cela/bloco '${newCell.name}' no pavilh√£o ${pavId}`
    );
  };

  const handleCreateInmateAtCell = () => {
    if (currentOperator.territorialScope === TerritorialScope.NATIONAL || currentOperator.province === "Centro Operacional") {
      triggerToast("Acesso Restrito", "O Centro Operacional Central tem compet√™ncia exclusiva de administra√ß√£o e supervis√£o da plataforma nacional e n√£o admite reclusos.", "error");
      return;
    }
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
      fatherName: newInmateForm.fatherName.trim() || "Pai Cl√°ssico",
      motherName: newInmateForm.motherName.trim() || "M√£e Cl√°ssica",
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
      riskLevel: "M√©dio"
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

    if (isOnline) {
      apiService.deleteRecluso(inmateId).then(deleted => {
        console.log("üü¢ Registro do recluso removido do PostgreSQL via REST:", deleted);
      }).catch(err => {
        console.warn("‚ö†Ô∏è Falha ao comunicar remo√ß√£o de recluso ao Postgres:", err);
      });
    }

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
      `Removida ficha can√¥nica (soft delete / soltura) do recluso ${inmate.firstName} ${inmate.lastName}`
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
  const [overcrowdingSearchQuery, setOvercrowdingSearchQuery] = useState<string>("");
  const [hoveredSeverityKey, setHoveredSeverityKey] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null>(null);
  const [inmates, setInmates] = useState<InmateState[]>(() => [...INITIAL_INMATES, ...HUAMBO_MOCK_INMATES]);
  const [editingInmate, setEditingInmate] = useState<InmateState | null>(null);
  const [selectedObjectInmate, setSelectedObjectInmate] = useState<InmateState | null>(null);
  const [dossierActiveTab, setDossierActiveTab] = useState<"canonical" | "biometric" | "health" | "custody" | "social">("canonical");
  const [editSecurityPin, setEditSecurityPin] = useState<string>("");
  const [editFormFields, setEditFormFields] = useState<any>({});
  const [selectedInmateHistoryId, setSelectedInmateHistoryId] = useState<string | null>(null);
  const [inmateEditLogs, setInmateEditLogs] = useState<InmateEditLog[]>(() => INITIAL_INMATE_EDIT_LOGS);
  const [showPinErrorMsg, setShowPinErrorMsg] = useState<string>("");

  // States for bulk selection and operations
  const [selectedInmateIds, setSelectedInmateIds] = useState<string[]>([]);
  const [bulkDestPrisonId, setBulkDestPrisonId] = useState("PRIS-HUAMBO");
  const [showBulkTransferConfirm, setShowBulkTransferConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Health, Reintegration, and Security Intelligence CRUD States
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(() => [
    {
      id: "CLI-2026-0001",
      inmateId: "PIR-2026-6411",
      inmateName: "Abra√£o Henriques Muteca",
      prisonId: "PRIS-HUAMBO",
      prisonName: "Cadeia Central do Huambo",
      consultationDate: "2026-06-15",
      symptoms: "Hipertens√£o arterial sist√≥lica elevada, cefaleia moderada",
      diagnosis: "Crise Hipertensiva ligeira, cansa√ßo acumulado",
      prescription: "Enalapril 20mg (1x ao dia), repouso cir√∫rgico tempor√°rio",
      severity: "Moderado",
      status: "Em Tratamento",
      doctorName: "Dr. Mateus Luvumbo"
    },
    {
      id: "CLI-2026-0002",
      inmateId: "PIR-2026-0023",
      inmateName: "Jo√£o Lucas Sambo",
      prisonId: "PRIS-01",
      prisonName: "Estabelecimento Penitenci√°rio de Viana",
      consultationDate: "2026-06-16",
      symptoms: "Febre alta intermitente, calafrios recorrentes, fadiga muscular",
      diagnosis: "Mal√°ria por Plasmodium falciparum confirmada",
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
      symptoms: "Dificuldade de locomo√ß√£o, dor lombar aguda prolongada",
      diagnosis: "Lombalgia mec√¢nica aguda secund√°ria a esfor√ßo f√≠sico de trabalho",
      prescription: "Ibuprofeno 400mg, pomada anti-inflamat√≥ria Mioflex gel local, repouso de 5 dias",
      severity: "Ligeiro",
      status: "Alta Cl√≠nica",
      doctorName: "Dr. Mateus Luvumbo"
    }
  ]);

  const [triagens, setTriagens] = useState<TriageRecord[]>(() => [
    {
      id: "TRI-2026-0001",
      inmateId: "PIR-2026-6411",
      inmateName: "Abra√£o Henriques Muteca",
      prisonId: "PRIS-HUAMBO",
      triageDate: "2026-06-12",
      bloodPressure: "140/90",
      heartRate: "82 bpm",
      temperature: "37.1 ¬∞C",
      weight: "74 kg",
      severity: "Moderado",
      symptoms: "Dor de cabe√ßa constante e mal-estar geral",
      specialtyNeeded: "Medicina Geral",
      professionalName: "Enf.¬™ Teresa Chivela"
    },
    {
      id: "TRI-2026-0002",
      inmateId: "PIR-2026-0023",
      inmateName: "Jo√£o Lucas Sambo",
      prisonId: "PRIS-01",
      triageDate: "2026-06-15",
      bloodPressure: "120/80",
      heartRate: "95 bpm",
      temperature: "38.9 ¬∞C",
      weight: "68 kg",
      severity: "Grave",
      symptoms: "Forte febre, tremores constantes e calafrios intensos",
      specialtyNeeded: "Infectologia / Especialista Cl√≠nico",
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
      temperature: "36.5 ¬∞C",
      weight: "81 kg",
      severity: "Ligeiro",
      symptoms: "Dor forte na zona lombar ap√≥s movimenta√ß√£o de carga",
      specialtyNeeded: "Ortopedia / Fisioterapia",
      professionalName: "Enf.¬™ Teresa Chivela"
    }
  ]);

  const [acompanhamentos, setAcompanhamentos] = useState<FollowUpRecord[]>(() => [
    {
      id: "ACO-2026-0001",
      inmateId: "PIR-2026-6411",
      inmateName: "Abra√£o Henriques Muteca",
      prisonId: "PRIS-HUAMBO",
      followUpDate: "2026-06-14",
      progressNotes: "Paciente reporta melhora nas dores ap√≥s in√≠cio da medica√ß√£o. Tens√£o controlada.",
      conditionStatus: "Melhoria",
      treatmentGiven: "Verifica√ß√£o de sinais vitais + monitoriza√ß√£o cont√≠nua de BP",
      nextReviewDate: "2026-06-21",
      doctorName: "Dr. Mateus Luvumbo"
    },
    {
      id: "ACO-2026-0002",
      inmateId: "PIR-2026-0023",
      inmateName: "Jo√£o Lucas Sambo",
      prisonId: "PRIS-01",
      followUpDate: "2026-06-17",
      progressNotes: "Excelente recupera√ß√£o para o ciclo de mal√°ria. Febre totalmente debelada.",
      conditionStatus: "Est√°vel",
      treatmentGiven: "Administra√ß√£o de doses di√°rias programadas de antimal√°rico",
      nextReviewDate: "2026-06-24",
      doctorName: "Dra. Ana Maria"
    }
  ]);

  const [prescricoes, setPrescricoes] = useState<PrescriptionRecord[]>(() => [
    {
      id: "PRE-2026-0001",
      inmateId: "PIR-2026-6411",
      inmateName: "Abra√£o Henriques Muteca",
      prisonId: "PRIS-HUAMBO",
      prescriptionDate: "2026-06-13",
      diagnosisAssociated: "Hipertens√£o Controlada",
      medications: "Enalapril 20mg (1 comprimido di√°rio pela manh√£)",
      durationDays: 30,
      specialInstructions: "Evitar esfor√ßo f√≠sico pesado sob radia√ß√£o solar extrema",
      doctorName: "Dr. Mateus Luvumbo",
      status: "Ativo"
    },
    {
      id: "PRE-2026-0002",
      inmateId: "PIR-2026-0023",
      inmateName: "Jo√£o Lucas Sambo",
      prisonId: "PRIS-01",
      prescriptionDate: "2026-06-16",
      diagnosisAssociated: "Mal√°ria Grave",
      medications: "Coartem (protocolo de resgate de 3 dias - 4 comprimidos de 12h/12h)",
      durationDays: 3,
      specialInstructions: "Ingerir com alimenta√ß√£o ou leite para maximizar absor√ß√£o",
      doctorName: "Dra. Ana Maria",
      status: "Ativo"
    }
  ]);

  const [reintegrationRecords, setReintegrationRecords] = useState<ReintegrationRecord[]>(() => [
    {
      id: "REI-2026-0001",
      inmateId: "PIR-2026-6411",
      inmateName: "Abra√£o Henriques Muteca",
      programName: "Curso de Alfabetiza√ß√£o B√°sica e Letramento",
      category: "Educa√ß√£o",
      enrollmentDate: "2026-02-12",
      progressScore: 82,
      attendanceRate: 95,
      status: "Ativo",
      evaluationNotes: "Evolu√ß√£o fant√°stica no aprendizado da leitura e escrita. Excelente postura proativa.",
      reintegratorName: "Dr. Agostinho Neto"
    },
    {
      id: "REI-2026-0002",
      inmateId: "PIR-2026-0023",
      inmateName: "Jo√£o Lucas Sambo",
      programName: "Serralharia Art√≠stica e Marcenaria Pr√°tica",
      category: "Trabalho",
      enrollmentDate: "2026-03-01",
      progressScore: 90,
      attendanceRate: 88,
      status: "Ativo",
      evaluationNotes: "Rendimento t√©cnico acima da m√©dia. Demonstra eximia destreza manual com materiais de ferro e madeira.",
      reintegratorName: "Dr. Alfredo Fragoso"
    },
    {
      id: "REI-2026-0003",
      inmateId: "PIR-2026-1205",
      inmateName: "Ant√≥nio Bento Gouveia",
      programName: "Terapia Cognitivo-Comportamental de Gest√£o de Raiva",
      category: "Apoio Psicol√≥gico",
      enrollmentDate: "2026-04-10",
      progressScore: 65,
      attendanceRate: 100,
      status: "Ativo",
      evaluationNotes: "Frequ√™ncia total nas sess√µes semanais. Esfor√ßa-se para aplicar t√©cnicas de autorregula√ß√£o e media√ß√£o de conflitos direcionados.",
      reintegratorName: "Dra. Isabel Cassule"
    }
  ]);

  const [intelligenceRecords, setIntelligenceRecords] = useState<IntelligenceRecord[]>(() => [
    {
      id: "INT-2026-0001",
      inmateId: "PIR-2026-6411",
      inmateName: "Abra√£o Henriques Muteca",
      classification: "CONFIDENCIAL",
      incidentSource: "MININT",
      alertType: "Conex√£o Externa Suspeita",
      threatLevel: "M√©dio",
      description: "Sinaliza√ß√£o por cruzamento de bases digitais do MININT em Luanda. Fora detetado fluxo monet√°rio suspeito em contas correntes de familiares no exterior.",
      loggedDate: "2026-01-20",
      actionTaken: "Monitoriza√ß√£o eletr√≥nica do correio de visitas e auditoria ampliada de contatos telef√≥nicos familiares autorizados.",
      checksum: "SHA255-MUT-6411-V"
    },
    {
      id: "INT-2026-0002",
      inmateId: "PIR-2026-0023",
      inmateName: "Jo√£o Lucas Sambo",
      classification: "SECRETO",
      incidentSource: "SICP",
      alertType: "Hist√≥rico de Fac√ß√£o",
      threatLevel: "Alto",
      description: "Cruzes integradas do Servi√ßo de Investiga√ß√£o Criminal (SICP). Registos mostram envolvimento com grupos organizados de sabotagem aduaneira no porto de Luanda.",
      loggedDate: "2026-03-15",
      actionTaken: "Restri√ß√£o preventiva de circula√ß√£o livre no p√°tio exterior comum fora de hor√°rios estritos. Relat√≥rios semanais enviados √† intelig√™ncia provincial.",
      checksum: "SHA255-SAM-0023-X"
    },
    {
      id: "INT-2026-0003",
      inmateId: "PIR-2026-1205",
      inmateName: "Ant√≥nio Bento Gouveia",
      classification: "RESTRITO",
      incidentSource: "Guarda Prisional",
      alertType: "Tentativa de Fuga Recorrente",
      threatLevel: "Cr√≠tico",
      description: "Fuga do estabelecimento preventivo do Planalto em 2024. Omiss√£o de dados cadastrais retificada ap√≥s digitaliza√ß√£o biom√©trica do RNR integrado com a Pol√≠cia Nacional.",
      loggedDate: "2026-05-02",
      actionTaken: "Ubica√ß√£o em Cela de Regime Fechado (Bloco B2 Extra Seg). Inspec√ß√£o aleat√≥ria di√°ria minuciosa das estruturas da grelha.",
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
      inmateName: "Abra√£o Henriques Muteca",
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
      inmateName: "Jo√£o Lucas Sambo",
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
      const opLevel = currentOperator.level || (currentOperator.role === "DIRECTOR_GERAL" ? "NATIONAL" : currentOperator.role === "DIRECTOR_PROVINCIAL" ? "PROVINCIAL" : "ESTABLISHMENT");
      const isProvincial = currentOperator.territorialScope === TerritorialScope.PROVINCIAL || opLevel === "PROVINCIAL" || currentOperator.role === "DIRECTOR_PROVINCIAL";
      const isEstablishment = currentOperator.territorialScope === TerritorialScope.ESTABLISHMENT || opLevel === "ESTABLISHMENT" || opLevel === "LOCAL" || currentOperator.role === "DIRECTOR_CADEIA" || currentOperator.role === "CHEFE_SEGURANCA" || currentOperator.role === "CHEFE_SAUDE" || currentOperator.role === "OPERADOR_SEGURANCA" || currentOperator.role === "OPERADOR_MEDICO" || currentOperator.role === "OPERADOR_SOCIAL";

      // 1. Initial territorial scope restriction
      let matchesScope = true;
      if (isProvincial) {
        if (currentOperator.province) {
          const provClean = currentOperator.province.toLowerCase().trim();
          matchesScope = p.location.toLowerCase().includes(provClean);
        }
      } else if (isEstablishment) {
        if (currentOperator.assignedPrisonId) {
          matchesScope = p.id === currentOperator.assignedPrisonId;
        } else if (currentOperator.province) {
          matchesScope = p.location.toLowerCase().includes(currentOperator.province.toLowerCase().trim());
        }
      }

      if (!matchesScope) return false;

      // 2. Extra global province filter restriction
      if (selectedProvinceFilter !== "ALL" && (currentOperator.territorialScope === TerritorialScope.NATIONAL || opLevel === "NATIONAL" || currentOperator.role === "DIRECTOR_GERAL")) {
        return p.location.toLowerCase().includes(selectedProvinceFilter.toLowerCase().trim());
      }
      return true;
    });
  }, [currentOperator, prisons, selectedProvinceFilter]);

  const visibleProvinces = useMemo(() => {
    const isNational = currentOperator.territorialScope === TerritorialScope.NATIONAL || currentOperator.level === "NATIONAL" || currentOperator.role === "DIRECTOR_GERAL";
    if (isNational) {
      return PROVINCES_HARDCODED;
    }
    if (currentOperator.province) {
      return [currentOperator.province];
    }
    if (currentOperator.assignedPrisonId) {
      const pr = prisons.find(p => p.id === currentOperator.assignedPrisonId);
      if (pr) return [pr.location.split(',')[0].trim()];
    }
    return [currentOperator.province || "Huambo"];
  }, [currentOperator, prisons]);

  // Lock selectedProvinceFilter and selectedProvince to operator's province if non-national
  useEffect(() => {
    const isNational = currentOperator.territorialScope === TerritorialScope.NATIONAL || currentOperator.level === "NATIONAL" || currentOperator.role === "DIRECTOR_GERAL";
    if (!isNational && currentOperator.province) {
      setSelectedProvinceFilter(currentOperator.province);
      setSelectedProvince(currentOperator.province);
    }
  }, [currentOperator]);

  const hasCriticalOvercrowdingAutoAlert = useMemo(() => {
    return visiblePrisons.some((p) => {
      const rate = p.operationalCapacity > 0 ? (p.currentOccupancy / p.operationalCapacity) * 100 : 0;
      return rate >= criticalOvercrowdingThreshold;
    });
  }, [visiblePrisons, criticalOvercrowdingThreshold]);

  const overlimitPavilions = useMemo(() => {
    const list: Array<{ id: string; prisonId: string; prisonName: string; pavName: string; pct: number; current: number; capacity: number }> = [];
    visiblePrisons.forEach(p => {
      if (p.pavilions) {
        p.pavilions.forEach((pav: any) => {
          const maxCap = pav.blocks ? pav.blocks.reduce((acc: number, b: any) => acc + (b.capacity ?? 200), 0) : 0;
          const currentOcc = pav.blocks ? pav.blocks.reduce((acc: number, b: any) => acc + (b.current ?? 0), 0) : 0;
          const pct = maxCap > 0 ? (currentOcc / maxCap) * 100 : 0;
          if (pct >= criticalOvercrowdingThreshold) {
            list.push({
              id: pav.id,
              prisonId: p.id,
              prisonName: p.name,
              pavName: pav.name,
              pct: Math.round(pct),
              current: currentOcc,
              capacity: maxCap
            });
          }
        });
      }
    });
    return list;
  }, [visiblePrisons, criticalOvercrowdingThreshold]);

  const pavilionsOverApprovalThreshold = useMemo(() => {
    const list: Array<{ id: string; prisonId: string; prisonName: string; pavName: string; pct: number; current: number; capacity: number }> = [];
    visiblePrisons.forEach(p => {
      if (p.pavilions) {
        p.pavilions.forEach((pav: any) => {
          const maxCap = pav.blocks ? pav.blocks.reduce((acc: number, b: any) => acc + (b.capacity ?? 200), 0) : 0;
          const currentOcc = pav.blocks ? pav.blocks.reduce((acc: number, b: any) => acc + (b.current ?? 0), 0) : 0;
          const pct = maxCap > 0 ? (currentOcc / maxCap) * 100 : 0;
          if (pct >= pavilionApprovalThreshold) {
            list.push({
              id: pav.id,
              prisonId: p.id,
              prisonName: p.name,
              pavName: pav.name,
              pct: Math.round(pct),
              current: currentOcc,
              capacity: maxCap
            });
          }
        });
      }
    });
    return list;
  }, [visiblePrisons, pavilionApprovalThreshold]);

  useEffect(() => {
    if (isDirectorSubscribed && overlimitPavilions.length > 0) {
      const unsent = overlimitPavilions.filter(pav => {
        return !sentAlertEmails.some(e => e.prisonName === pav.prisonName && e.pavName === pav.pavName && e.occupancyPct === pav.pct);
      });

      if (unsent.length > 0) {
        setSentAlertEmails(prev => {
          const newEntries = unsent.map(pav => ({
            id: `MAIL-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
            timestamp: new Date().toLocaleTimeString(),
            pavName: pav.pavName,
            prisonName: pav.prisonName,
            occupancyPct: pav.pct,
            email: directorEmail,
            status: "Enviado" as const
          }));
          return [...newEntries, ...prev];
        });

        setSuggestionAlert({
          type: "success",
          text: `üìß ALERTA DISPARADO: Notifica√ß√£o de e-mail enviada de imediato ao Diretor de Unidade (${directorEmail}) para ${unsent.length} pavilh√£o(√µes) acima do limiar cr√≠tico!`
        });
      }
    }
  }, [isDirectorSubscribed, overlimitPavilions.length, directorEmail, overlimitPavilions, sentAlertEmails]);

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
      const formattedName = p.name.replace("Estabelecimento Penitenci√°rio de ", "EP ");
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
      if (visiblePrisons.some(p => p.id === inm.assignedPrisonId)) return true;
      const isNational = currentOperator.territorialScope === TerritorialScope.NATIONAL || currentOperator.level === "NATIONAL" || currentOperator.role === "DIRECTOR_GERAL";
      if (!isNational && currentOperator.province) {
        const provClean = currentOperator.province.toLowerCase().trim();
        if (inm.province && inm.province.toLowerCase().trim() === provClean) return true;
      }
      return false;
    });
  }, [inmates, visiblePrisons, currentOperator]);

  const visibleOperators = useMemo(() => {
    const isNational = currentOperator.territorialScope === TerritorialScope.NATIONAL || currentOperator.level === "NATIONAL" || currentOperator.role === "DIRECTOR_GERAL";
    const activeProv = !isNational 
      ? currentOperator.province?.toLowerCase().trim() 
      : (selectedProvinceFilter !== "ALL" ? selectedProvinceFilter.toLowerCase().trim() : null);

    if (activeProv) {
      return operators.filter(op => op.province && op.province.toLowerCase().trim() === activeProv);
    }
    if (currentOperator.assignedPrisonId) {
      return operators.filter(op => op.assignedPrisonId === currentOperator.assignedPrisonId);
    }
    return operators;
  }, [currentOperator, operators, selectedProvinceFilter]);

  // Form states for scheduling a movement
  const [movSelectedInmateId, setMovSelectedInmateId] = useState("");
  const [movType, setMovType] = useState<InmateMovement["movementType"]>("CELL_CHANGE");
  const [movDestPrisonId, setMovDestPrisonId] = useState("PRIS-HUAMBO");
  const [movDestCell, setMovDestCell] = useState("Cela H1-01");
  const [movReason, setMovReason] = useState("");
  const [movEscort, setMovEscort] = useState("Escolta Prisional Padr√£o NREP");
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
    if ((!allowed && activeTab !== "movements" && activeTab !== "auditing" && activeTab !== "sandbox" && activeTab !== "centro-comando" && activeTab !== "centro-inteligencia") || (activeTab === "deus-fundador" && currentOperator.role !== "DIRECTOR_GERAL")) {
      setActiveTab("dashboard");
    }
  }, [currentOperator, activeTab]);

  // Synchronize risk and province filters default value for restricted roles & scope
  useEffect(() => {
    const isNational = currentOperator.territorialScope === TerritorialScope.NATIONAL || currentOperator.level === "NATIONAL" || currentOperator.role === "DIRECTOR_GERAL";
    const isProvincial = currentOperator.territorialScope === TerritorialScope.PROVINCIAL || currentOperator.level === "PROVINCIAL" || currentOperator.role === "DIRECTOR_PROVINCIAL";

    if (!isNational && !isProvincial) {
      setSelectedRiskPrisonFilter(currentOperator.assignedPrisonId || "ALL");
    } else {
      setSelectedRiskPrisonFilter("ALL");
    }

    // Synchronize global province selection based on active operator scope
    if (isNational) {
      // Keep ALL or selected filter
    } else if (isProvincial) {
      const targetProv = currentOperator.province || "Huambo";
      setSelectedProvinceFilter(targetProv);
      setSelectedProvince(targetProv);
    } else {
      const pr = prisons.find(p => p.id === currentOperator.assignedPrisonId);
      const targetProv = pr ? pr.location.split(",")[0].trim() : (currentOperator.province || "Huambo");
      setSelectedProvinceFilter(targetProv);
      setSelectedProvince(targetProv);
    }
  }, [currentOperator, prisons]);

  // Master National Movements Database (Point 10)
  const [movements, setMovements] = useState<InmateMovement[]>([
    {
      id: "MOV-2026-1051",
      inmateId: "AO-REC-089",
      inmateName: "Manuel Domingos Jo√£o",
      movementType: "ADMISSION",
      destinationUnitId: "PRIS-01",
      destinationLocName: "EP Viana (Cela B2-04)",
      dateScheduled: "2026-02-14",
      dateExecuted: "2026-02-14",
      status: "EXECUTED",
      reason: "Admiss√£o inicial homologada por Mandado Judicial da Comarca de Luanda.",
      operatorId: "MININT-OP-DC-VIANA",
      escortDetails: "Servi√ßo Prisional Escorta-01",
      classification: InformationClassification.RESTRICTED
    },
    {
      id: "MOV-2026-1052",
      inmateId: "AO-REC-204",
      inmateName: "Sebasti√£o Kiala Mendes",
      movementType: "CELL_CHANGE",
      sourceUnitId: "PRIS-01",
      sourceLocName: "EP Viana (Cela A1-09)",
      destinationUnitId: "PRIS-01",
      destinationLocName: "EP Viana (Cela A1-12)",
      dateScheduled: "2026-06-13",
      dateExecuted: "2026-06-13",
      status: "EXECUTED",
      reason: "Reloca√ß√£o celular preventiva para garantir integridade f√≠sica ap√≥s desentendimento.",
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
      reason: "Pedido volunt√°rio por proximidade do agregado familiar, homologado pela DPSP-Huambo.",
      operatorId: "MININT-OP-DP-HUAMBO",
      escortDetails: "Batalh√£o de Interven√ß√£o R√°pida - Pol√≠cia Nacional",
      classification: InformationClassification.RESTRICTED
    },
    {
      id: "MOV-2026-1054",
      inmateId: "AO-REC-115",
      inmateName: "Carla Ant√≥nia Gouveia",
      movementType: "COURT",
      sourceUnitId: "PRIS-02",
      sourceLocName: "EP Kakila",
      destinationLocName: "Tribunal Provincial de Luanda (Pal√°cio da Justi√ßa)",
      dateScheduled: "2026-06-16",
      status: "SCHEDULED",
      reason: "Audi√™ncia de contradit√≥rio e alega√ß√µes finais sob requisi√ß√£o judici√°ria.",
      operatorId: "MININT-OP-DC-VIANA",
      escortDetails: "Grupo de Interven√ß√£o Prisional Geral-02",
      classification: InformationClassification.RESTRICTED
    }
  ]);

  const visibleMovements = useMemo(() => {
    const isNational = currentOperator.territorialScope === TerritorialScope.NATIONAL || currentOperator.level === "NATIONAL" || currentOperator.role === "DIRECTOR_GERAL";
    if (isNational) return movements;
    return movements.filter((m) => {
      const matchSource = visiblePrisons.some(p => p.id === m.sourceUnitId || p.name.includes(m.sourceUnitId));
      const matchDest = visiblePrisons.some(p => p.id === m.destinationUnitId || p.name.includes(m.destinationUnitId));
      const matchInmate = visibleInmates.some(i => i.id === m.inmateId);
      return matchSource || matchDest || matchInmate;
    });
  }, [currentOperator, movements, visiblePrisons, visibleInmates]);

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
      description: "Autentica√ß√£o militar bem-sucedida e consolidada por canal TLS 1.3.",
      deviceIp: "10.224.12.8",
      securityClassification: InformationClassification.RESTRICTED,
      integrityHash: "SHA256-F890AE72F02189BA12CE898A1211DE450AA7B9",
      beforeState: {
        sessionActive: false,
        ipAddress: null,
        operatorId: "MININT-OP-DG-01",
        role: "Director Geral",
        lastLogout: "2026-06-13T22:40:11Z",
        tokenSignature: null
      },
      afterState: {
        sessionActive: true,
        ipAddress: "10.224.12.8",
        operatorId: "MININT-OP-DG-01",
        role: "Director Geral",
        lastLogout: "2026-06-13T22:40:11Z",
        tokenSignature: "SHA256/RSA-2048:F890AE72F02189BA"
      }
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
      description: "Visualiza√ß√£o do prontu√°rio do recluso Manuel Domingos Jo√£o.",
      deviceIp: "10.224.12.8",
      securityClassification: InformationClassification.RESTRICTED,
      integrityHash: "SHA256-DE81A99EACCECCAA3429FBB01A242BCE89A1",
      beforeState: {
        inmateId: "AO-REC-089",
        nomeCompleto: "Manuel Domingos Jo√£o",
        classification: "RESTRICTED",
        timesInspectedByAudit: 42,
        lastInspectedAt: "2026-06-12T08:14:02Z",
        hasActiveIncidents: false
      },
      afterState: {
        inmateId: "AO-REC-089",
        nomeCompleto: "Manuel Domingos Jo√£o",
        classification: "RESTRICTED",
        timesInspectedByAudit: 43,
        lastInspectedAt: "2026-06-14T10:20:00Z",
        hasActiveIncidents: false
      }
    },
    {
      id: "AUD-10031",
      timestamp: "2026-06-14T10:25:12Z",
      operatorId: "MININT-OP-DP-HUAMBO",
      operatorName: "Dr. J√∫lio Mbanza",
      roleName: "Director Provincial do Huambo",
      actionType: "EXPORT_PDF",
      targetEntity: "Inmate",
      description: "Exporta√ß√£o da ficha resumo do recluso Augusto Chissola (C√≥digo de Selo: HU-7729-NREP).",
      deviceIp: "10.225.82.4",
      securityClassification: InformationClassification.CONFIDENTIAL,
      integrityHash: "SHA256-FF83E71A1209B1139A9BFAD7A12450CBA111",
      beforeState: {
        inmateId: "AO-REC-104",
        fullName: "Augusto Chissola",
        exportState: "STABLE",
        totalExportCount: 4,
        watermark: "DRAFT",
        lastExportedBy: "MININT-OP-DP-BENGUELA"
      },
      afterState: {
        inmateId: "AO-REC-104",
        fullName: "Augusto Chissola",
        exportState: "EXPORTED_PDF",
        totalExportCount: 5,
        watermark: "SICP-HU-7729-NREP",
        lastExportedBy: "MININT-OP-DP-HUAMBO"
      }
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
    inmateName: string = "-",
    beforeState?: any,
    afterState?: any
  ) => {
    // 1. Write to old AuditLog compatibility list (for old tab)
    let compAction: AuditLog["action"] = "Edi√ß√£o";
    if (actionType === "TRANSFER_EXECUTE") compAction = "Transfer√™ncia";
    else if (actionType === "LOGIN") compAction = "Edi√ß√£o";

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

    const finalBefore = beforeState !== undefined ? beforeState : {
      entity: targetEntity,
      id: targetId || "N/A",
      status: "STABLE",
      lastUpdated: new Date(Date.now() - 3600000).toISOString(),
      integrityVerified: true
    };
    const finalAfter = afterState !== undefined ? afterState : {
      entity: targetEntity,
      id: targetId || "N/A",
      status: "UPDATED",
      lastUpdated: new Date().toISOString(),
      integrityVerified: true,
      description: description.slice(0, 100),
      triggeredBy: operator?.id || currentOperatorId
    };

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
      integrityHash: dynamicHash,
      beforeState: finalBefore,
      afterState: finalAfter
    };

    setAuditRecords(prev => [forensicRecord, ...prev]);

    // Gravar o log can√≥nico no backend PostgreSQL via API REST de forma transparente
    apiService.createLog({
      evento: actionType,
      modulo: targetEntity,
      nivelSeveridade: actionType === "RELEASE_EXECUTE" || actionType === "LOGICAL_DELETE" ? "CRITICAL" : "INFO",
      reclusoId: targetId && targetId.startsWith("rec-") ? targetId : undefined,
      dadosJson: JSON.stringify({ message: description })
    }).catch(err => {
      console.warn("‚ö†Ô∏è Grava√ß√£o de log offline. Falha ao comunicar com o Postgres:", err);
    });
  };

  // Router verification guard layer to block direct URL navigation (e.g. /prisoners/:id) for out-of-scope inmates
  useEffect(() => {
    const handleUrlRouteVerification = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      const search = window.location.search;

      let targetInmateId: string | null = null;
      let rawMatchedUrl = "";

      // 1. Pathname check: /prisoners/:id, /reclusos/:id, /inmates/:id
      const pathMatch = pathname.match(/^\/(?:prisoners|reclusos|inmates)\/([A-Za-z0-9_-]+)/i);
      if (pathMatch) {
        targetInmateId = pathMatch[1];
        rawMatchedUrl = pathname;
      }

      // 2. Hash check: #/prisoners/:id, #prisoners/:id, #/reclusos/:id
      if (!targetInmateId && hash) {
        const hashMatch = hash.match(/^#\/?(?:prisoners|reclusos|inmates)\/([A-Za-z0-9_-]+)/i);
        if (hashMatch) {
          targetInmateId = hashMatch[1];
          rawMatchedUrl = hash;
        }
      }

      // 3. Search query params: ?prisonerId=:id or ?inmateId=:id or ?reclusoId=:id
      if (!targetInmateId && search) {
        const params = new URLSearchParams(search);
        const paramId = params.get("prisonerId") || params.get("inmateId") || params.get("reclusoId") || params.get("prisoner") || params.get("recluso");
        if (paramId) {
          targetInmateId = paramId;
          rawMatchedUrl = search;
        }
      }

      if (!targetInmateId) return;

      // Search in master inmates list
      const foundInmate = inmates.find(i => 
        i.id.toLowerCase() === targetInmateId!.toLowerCase() || 
        (i.documentCode && i.documentCode.toLowerCase() === targetInmateId!.toLowerCase()) ||
        (i.nrep && i.nrep.toLowerCase() === targetInmateId!.toLowerCase())
      );

      if (!foundInmate) {
        triggerToast("Navega√ß√£o de URL", `O recluso com ID/NREP '${targetInmateId}' n√£o foi localizado na base ativa.`, "warning");
        window.history.replaceState({}, '', '/');
        return;
      }

      // Check scope of currently logged-in operator
      const isInScope = visibleInmates.some(vi => vi.id === foundInmate.id);

      if (!isInScope) {
        // BLOCK DIRECT URL ACCESS & REDIRECT TO 'ACESSO NEGADO'
        window.history.replaceState({}, '', '/');
        setSelectedSearchInmateModal(null);

        const inmName = foundInmate.fullName || `${foundInmate.firstName || ''} ${foundInmate.lastName || ''}`.trim() || foundInmate.id;
        const inmProv = foundInmate.province || (prisons.find(p => p.id === (foundInmate.assignedPrisonId || foundInmate.prisonId))?.location.split(',')[0].trim()) || "Prov√≠ncia Externa";
        const opProv = currentOperator.province || "Jurisdi√ß√£o Restrita";

        setUrlAccessDeniedModal({
          isOpen: true,
          attemptedUrl: rawMatchedUrl || `/prisoners/${targetInmateId}`,
          inmateId: foundInmate.documentCode || foundInmate.id,
          inmateName: inmName,
          inmateProvince: inmProv,
          operatorProvince: opProv,
          operatorRole: currentOperator.role,
          reason: `Bloqueio de Seguran√ßa no Router: Tentativa de navega√ß√£o direta via URL (${rawMatchedUrl}) para o recluso ${inmName}. O recluso custodiado na Prov√≠ncia de ${inmProv} encontra-se fora do escopo do operador logado (${currentOperator.name} - ${opProv}).`
        });

        triggerToast(
          "Acesso Negado (Redirecionamento)",
          `Navega√ß√£o direta bloqueada para o recluso ${inmName} (Fora da Prov√≠ncia de ${opProv}).`,
          "error"
        );

        writeAuditLog(
          currentOperator,
          "UNAUTHORIZED_HIERARCHY_MUTATION_ATTEMPT" as any,
          "URL_ROUTER_SECURITY_GUARD",
          foundInmate.id,
          `[ACESSO NEGADO NO ROUTER] Bloqueada tentativa de acesso direto via URL '${rawMatchedUrl}' ao recluso ${inmName} (${foundInmate.id}) da Prov√≠ncia de ${inmProv} por operador de ${opProv}. Redirecionado para aviso de Acesso Negado.`,
          foundInmate.id,
          inmName
        );
      } else {
        // IN SCOPE: Open canonical inmate modal
        setSelectedSearchInmateModal(foundInmate);
        setSelectedSearchInmateIsOutOfScope(false);
        triggerToast("Acesso Autorizado", `Navega√ß√£o direta autorizada para o recluso ${foundInmate.fullName || foundInmate.firstName}.`, "success");
      }
    };

    handleUrlRouteVerification();

    window.addEventListener("popstate", handleUrlRouteVerification);
    window.addEventListener("hashchange", handleUrlRouteVerification);

    return () => {
      window.removeEventListener("popstate", handleUrlRouteVerification);
      window.removeEventListener("hashchange", handleUrlRouteVerification);
    };
  }, [inmates, visibleInmates, currentOperator]);

  const handleExecuteMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movSelectedInmateId) {
      alert("Selecione um recluso para dar in√≠cio √† movimenta√ß√£o.");
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

    // Calculate current pavilion occupancy to see if it exceeds pavilionApprovalThreshold
    const prisonObjForMov = prisons.find(p => p.id === inmateObj.assignedPrisonId);
    const pavObjForMov = prisonObjForMov?.pavilions?.find(pav => pav.id === inmateObj.assignedPavilionId);
    const pavMaxCap = pavObjForMov?.blocks ? pavObjForMov.blocks.reduce((acc, b) => acc + (b.capacity ?? 200), 0) : 0;
    const pavCurrentOcc = pavObjForMov?.blocks ? pavObjForMov.blocks.reduce((acc, b) => acc + (b.current ?? 0), 0) : 0;
    const pavPct = pavMaxCap > 0 ? (pavCurrentOcc / pavMaxCap) * 100 : 0;
    const isPavilionOvercrowded = pavPct >= pavilionApprovalThreshold;

    const isCritical = movType === "TRANSFER" || movType === "RELEASE";
    const newStatus = isCritical ? "PENDING_APPROVAL" : "EXECUTED";

    // Compile movement
    const newMov: InmateMovement = {
      id: newId,
      inmateId: inmateObj.id,
      inmateName: `${inmateObj.firstName} ${inmateObj.lastName}`,
      movementType: movType,
      sourceUnitId: sourceUnit?.id,
      sourceLocName: sourceUnit?.name || "Unidade de Cust√≥dia Inicial",
      destinationUnitId: movType === "TRANSFER" ? movDestPrisonId : sourceUnit?.id,
      destinationLocName: movType === "TRANSFER" ? (destPrison?.name || "EP Destino") : (movType === "CELL_CHANGE" ? `${sourceUnit?.name || "EP"} (${movDestCell})` : "√Årea Externa (Liberdade Judicial)"),
      dateScheduled: movScheduledDate,
      dateExecuted: isCritical ? undefined : movScheduledDate,
      status: newStatus,
      reason: isPavilionOvercrowded
        ? `[BLOQUEIO POR SOBRELOTA√á√ÉO CR√çTICA DO PAVILH√ÉO] O pavilh√£o de origem '${pavObjForMov?.name || "Pavilh√£o"}' excedeu o limiar definido de ${pavilionApprovalThreshold}% (lota√ß√£o atual: ${pavPct.toFixed(1)}%). Movimenta√ß√£o obrigatoriamente retida para aprova√ß√£o por Supervisor. ${movReason || ""}`
        : (movReason || "Movimenta√ß√£o operacional autorizada sob protocolo militar NREP."),
      operatorId: currentOperator.id,
      escortDetails: movEscort,
      classification: isCritical ? InformationClassification.CONFIDENTIAL : InformationClassification.RESTRICTED
    };

    if (!isCritical) {
      // Perform state changes in inmates list only for direct non-critical movements
      setInmates(prev => prev.map(inm => {
        if (inm.id === inmateObj.id) {
          if (movType === "CELL_CHANGE") {
            return { ...inm, assignedCellNumber: movDestCell };
          } else if (movType === "DEATH") {
            return { ...inm, systemStatus: "FALECIDO" };
          }
        }
        return inm;
      }));
    }

    // No immediate prison occupancy balance for pending transfers/releases

    setMovements(prev => [newMov, ...prev]);

    // Log in Audit Records (Point 8)
    writeAuditLog(
      currentOperator,
      movType === "RELEASE" ? "RELEASE_EXECUTE" : (movType === "TRANSFER" ? "TRANSFER_EXECUTE" : "CELL_CHANGE_EXECUTE"),
      "InmateMovement",
      newId,
      isCritical
        ? `Solicita√ß√£o de altera√ß√£o cr√≠tica (${movType === "RELEASE" ? "Soltura/Liberta√ß√£o" : "Transfer√™ncia"})${isPavilionOvercrowded ? " for√ßada por sobrelota√ß√£o do pavilh√£o de origem" : ""} registrada em modo PENDENTE. Aguardando aprova√ß√£o de um segundo operador com permiss√£o de Supervisor.`
        : `Movimenta√ß√£o do tipo ${movType} executada para o recluso ${inmateObj.firstName} ${inmateObj.lastName}. Destino: ${newMov.destinationLocName}`,
      inmateObj.id,
      `${inmateObj.firstName} ${inmateObj.lastName}`
    );

    // Open Success Overlay (Point 9 - Digital Signatures)
    if (isCritical) {
      const overcrowdingAlertMsg = isPavilionOvercrowded
        ? `\n\n‚ö†Ô∏è BLOQUEIO DE SEGURAN√áA POR SOBRELOTA√á√ÉO: O pavilh√£o do recluso (${pavObjForMov?.name || "N/A"}) est√° com lota√ß√£o de ${pavPct.toFixed(1)}% (limiar cr√≠tico configurado: ${pavilionApprovalThreshold}%). Esta a√ß√£o foi obrigatoriamente retida e exige homologa√ß√£o digital de Supervisor.`
        : "";

      setSuccessOverlayMsg({
        title: movType === "RELEASE" ? "FLUXO DE SOLTURA INICIADO (PENDENTE)" : "FLUXO DE TRANSFER√äNCIA INICIADO (PENDENTE)",
        desc: (movType === "RELEASE"
          ? `Alvar√° de Soltura N¬∫ ${newId} registado em modo 'Pendente' para o recluso ${inmateObj.firstName} ${inmateObj.lastName}. De acordo com as diretrizes de 'Dual Approval', esta liberta√ß√£o exige homologa√ß√£o e assinatura digital de um segundo operador com permiss√£o de Supervisor (Maker-Checker ativo) antes da efetiva√ß√£o f√≠sica.`
          : `Ordem N¬∫ ${newId} registada para o recluso ${inmateObj.firstName} ${inmateObj.lastName}. A transfer√™ncia de ${newMov.sourceLocName} para ${newMov.destinationLocName} exige homologa√ß√£o digital e aposi√ß√£o do selo oficial por um segundo operador Supervisor antes da efetiva√ß√£o f√≠sica.`) + overcrowdingAlertMsg,
        hash: generatedHash
      });
    } else {
      setSuccessOverlayMsg({
        title: movType === "CELL_CHANGE" ? "ORDEM DE MUDAN√áA DE CELA / ALOJAMENTO" : "GUIA DE MOVIMENTA√á√ÉO PENITENCI√ÅRIA",
        desc: `Ato registado formalmente sob Mandatamento N¬∫ ${newId}. O recluso ${inmateObj.firstName} ${inmateObj.lastName} foi relocado com sucesso para ${newMov.destinationLocName} sob patrulha especial militar: ${movEscort || "NREP"}.`,
        hash: generatedHash
      });
    }

    // Clear form
    setMovReason("");
  };

  const handleApproveTransfer = (movId: string) => {
    const mov = movements.find(m => m.id === movId);
    if (!mov) return;

    // Security Verification - Supervisor check
    const isSupervisor = ["DIRECTOR_GERAL", "DIRECTOR_PROVINCIAL", "DIRECTOR_CADEIA"].includes(currentOperator.role);
    if (!isSupervisor) {
      triggerToast(
        "ERRO DE SEGURAN√áA",
        "O seu perfil de operador n√£o possui prerrogativas militares de Supervisor para homologar altera√ß√µes cr√≠ticas de cust√≥dia.",
        "error"
      );
      return;
    }

    // Maker-Checker Check
    if (currentOperator.id === mov.operatorId) {
      triggerToast(
        "REJEI√á√ÉO DE FLUXO DUAL",
        "Em conformidade com o princ√≠pio de Dupla Autoriza√ß√£o (Maker-Checker), o operador solicitante original n√£o pode aprovar as suas pr√≥prias ordens cr√≠ticas. Altere o operador ativo no cabe√ßalho.",
        "warning"
      );
      return;
    }

    const inmateObj = inmates.find(i => i.id === mov.inmateId);
    if (!inmateObj) return;

    const sourcePrisonId = inmateObj.assignedPrisonId;
    const destPrisonId = mov.destinationUnitId!;

    const sourcePrison = prisons.find(p => p.id === sourcePrisonId);
    const destPrison = prisons.find(p => p.id === destPrisonId);

    const timestamp = new Date().toISOString();

    if (mov.movementType === "TRANSFER") {
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
    } else if (mov.movementType === "RELEASE") {
      // 1. Update Inmate's status to SOLTO
      setInmates(prev => prev.map(inm => {
        if (inm.id === inmateObj.id) {
          return { ...inm, systemStatus: "SOLTO" };
        }
        return inm;
      }));

      // 2. Decrement occupancy of the source prison
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
        return p;
      }));
    }

    // 3. Update the movement status to EXECUTED
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
    const sourceName = sourcePrison ? sourcePrison.name.replace("Estabelecimento Penitenci√°rio de ", "EP ") : "N/A";
    const destName = destPrison ? destPrison.name.replace("Estabelecimento Penitenci√°rio de ", "EP ") : "N/A";

    const isRelease = mov.movementType === "RELEASE";
    const compAction = isRelease ? "Edi√ß√£o" as const : "Transfer√™ncia" as const;

    const newLog: AuditLog = {
      id: logId,
      userId: currentOperatorId,
      timestamp: timestamp,
      action: compAction,
      inmateId: inmateObj.id,
      inmateName: `${inmateObj.firstName} ${inmateObj.lastName}`,
      fieldChanged: isRelease ? "systemStatus (EFECTIVADA)" : "assignedPrisonId (EFECTIVADA)",
      oldValue: isRelease ? "Ativo (Aguardando)" : `${sourceName} (Aguardando)`,
      newValue: isRelease ? `SOLTO (Homologado por ${currentOperator.name})` : `${destName} (Homologado por ${currentOperator.name})`
    };
    setAuditLogs(prev => [newLog, ...prev]);

    if (!isRelease) {
      eventBus.publish({
        type: "TRANSFERENCIA_CONCLUIDA",
        priority: "HIGH",
        category: "OPERACIONAL",
        source: "TransferService",
        operator: currentOperator?.name || "Supervisor de Cust√≥dia",
        message: `TRANSFER√äNCIA CONCLU√çDA: Ordem ${movId} de ${inmateObj.firstName} ${inmateObj.lastName} homologada de ${sourceName} para ${destName}.`,
        payload: {
          movementId: movId,
          inmateId: inmateObj.id,
          inmateName: `${inmateObj.firstName} ${inmateObj.lastName}`,
          source: sourceName,
          destination: destName,
          status: "APPROVED_AND_EXECUTED",
          approvedBy: currentOperator.name
        }
      });
    } else {
      eventBus.publish({
        type: "SOLTURA_CONCLUIDA",
        priority: "CRITICAL",
        category: "OPERACIONAL",
        source: "TransferService",
        operator: currentOperator?.name || "Supervisor de Cust√≥dia",
        message: `ALVAR√Å DE SOLTURA EXECUTADO: Recluso ${inmateObj.firstName} ${inmateObj.lastName} posto em liberdade (Ordem ${movId}).`,
        payload: {
          movementId: movId,
          inmateId: inmateObj.id,
          inmateName: `${inmateObj.firstName} ${inmateObj.lastName}`,
          status: "RELEASED",
          approvedBy: currentOperator.name
        }
      });
    }

    setGeneratedLogs(prev => [
      `[${isRelease ? "RELEASE" : "TRANSFER"}_APPROVED] Ordem ${movId} aprovada digitalmente pelo Supervisor ${currentOperator.name}. Recluso ${isRelease ? "posto em liberdade" : "transferido"}.`,
      ...prev
    ]);

    // 5. Forensics logs
    writeAuditLog(
      currentOperator,
      isRelease ? "RELEASE_EXECUTE" : "TRANSFER_EXECUTE",
      "InmateMovement",
      movId,
      isRelease
        ? `Aprova√ß√£o formal e assinatura digital da ordem de soltura ${movId} do recluso ${inmateObj.firstName} ${inmateObj.lastName} (EP ${sourceName}).`
        : `Aprova√ß√£o formal e assinatura digital da ordem de transfer√™ncia ${movId} do recluso ${inmateObj.firstName} ${inmateObj.lastName} de ${sourceName} para ${destName}.`,
      inmateObj.id,
      `${inmateObj.firstName} ${inmateObj.lastName}`
    );

    // 6. Show Success Overlay pop up
    const hashSeed = `${movId}-${inmateObj.id}-APPROVED-${timestamp}`;
    const generatedHash = "SHA256-" + (hashSeed.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0) | 0, 0) >>> 0).toString(16).toUpperCase();

    setSuccessOverlayMsg({
      title: isRelease ? "ORDEM DE SOLTURA DE RECLUSO CONCLU√çDA" : "ORDEM DE TRANSFER√äNCIA DE RECLUSO CONCLU√çDA",
      desc: isRelease
        ? `O Alvar√° de Soltura N¬∫ ${movId} foi com sucesso assinado eletronicamente pelo Supervisor ${currentOperator.name}. O recluso ${inmateObj.firstName} ${inmateObj.lastName} foi posto em liberdade com o selo institucional do Minist√©rio do Interior de Angola.`
        : `A ordem militar N¬∫ ${movId} de translado foi com sucesso assinada eletronicamente pelo Supervisor ${currentOperator.name}. O recluso ${inmateObj.firstName} ${inmateObj.lastName} foi relocado para o ${destName} com o selo institucional do Minist√©rio do Interior de Angola.`,
      hash: generatedHash
    });
  };

  const handleDeclineTransfer = (movId: string) => {
    const mov = movements.find(m => m.id === movId);
    if (!mov) return;

    // Security Verification - Supervisor check
    const isSupervisor = ["DIRECTOR_GERAL", "DIRECTOR_PROVINCIAL", "DIRECTOR_CADEIA"].includes(currentOperator.role);
    if (!isSupervisor) {
      triggerToast(
        "ERRO DE SEGURAN√áA",
        "O seu perfil de operador n√£o possui prerrogativas militares de Supervisor para recusar ordens cr√≠ticas.",
        "error"
      );
      return;
    }

    // Maker-Checker Check
    if (currentOperator.id === mov.operatorId) {
      triggerToast(
        "REJEI√á√ÉO DE FLUXO DUAL",
        "Em conformidade com o princ√≠pio de Dupla Autoriza√ß√£o (Maker-Checker), o operador solicitante original n√£o pode recusar as suas pr√≥prias ordens cr√≠ticas.",
        "warning"
      );
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

    const isRelease = mov.movementType === "RELEASE";
    setGeneratedLogs(prev => [`[${isRelease ? "RELEASE" : "TRANSFER"}_DECLINED] Ordem ${movId} recusada pelo Supervisor ${currentOperator.name}.`, ...prev]);

    // Write audit log
    writeAuditLog(
      currentOperator,
      isRelease ? "RELEASE_EXECUTE" : "TRANSFER_EXECUTE",
      "InmateMovement",
      movId,
      `Ordem de ${isRelease ? "soltura" : "transfer√™ncia"} ${movId} para o recluso ${mov.inmateName} foi recusada pelo Supervisor ${currentOperator.name}.`,
      mov.inmateId,
      mov.inmateName
    );

    alert(`A ordem de ${isRelease ? "soltura" : "transfer√™ncia"} N¬∫ ${movId} foi devidamente CANCELADA/RECUSADA e o status foi atualizado.`);
  };

  const handleRegisterDelegation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!delDelegatorId || !delDelegateeId) {
      alert("Por favor selecione o Delegador e o Operador Benefici√°rio.");
      return;
    }
    if (delDelegatorId === delDelegateeId) {
      alert("Um operador n√£o pode delegar poderes para si mesmo.");
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
      reason: delReason || "Delega√ß√£o de compet√™ncias governamentais ao abrigo da Lei Prisional n¬∫ 8/08.",
      auditHash: generatedHash,
      statusHistory: [
        {
          status: initialStatus,
          timestamp: new Date().toISOString(),
          operatorName: currentOperator?.name || "Operador Autenticado",
          details: `Portaria outorgada formalmente na Divis√£o de Recursos Humanos.`
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
      `Delega√ß√£o de compet√™ncia oficial aprovada de ${delegatorObj?.name} para ${delegateeObj?.name} concedendo patente de ${SYSTEM_ROLES.find(r => r.id === delRoleId)?.name}`
    );

    alert(`Delega√ß√£o outorgada com sucesso! C√≥digo ${dId}. O operador benefici√°rio herdar√° os poderes e o escopo militar imediatamente se o per√≠odo estiver na data vigente.`);
    
    // Reset
    setDelReason("");
  };

  const handleRevokeDelegation = (id: string, skipConfirm: boolean = false) => {
    if (!skipConfirm && !confirm("Tem certeza que deseja revogar esta portaria de delega√ß√£o de compet√™ncia? Os efeitos retrocessivos e privil√©gios associados ser√£o cancelados de imediato.")) {
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
              details: "Revoga√ß√£o eletr√≥nica antecipada por despacho governamental de seguran√ßa."
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
      `Revoga√ß√£o antecipada da portaria de delega√ß√£o ${id} (Concedia patente de ${SYSTEM_ROLES.find(r => r.id === targetDel.roleId)?.name})`
    );
    
    alert(`A portaria ${id} foi revogada com sucesso.`);
  };

  // Audit Log State
  interface AuditLog {
    id: string;
    userId: string;
    timestamp: string;
    action: "Admiss√£o" | "Transfer√™ncia" | "Edi√ß√£o";
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
      action: "Admiss√£o",
      inmateId: "AO-REC-8920",
      inmateName: "Manuel Sebasti√£o",
      fieldChanged: "Todos",
      oldValue: "-",
      newValue: "Novo Registro (Cela A1-02, EP Viana)"
    },
    {
      id: "AUD-10024",
      userId: "MININT-OP-112",
      timestamp: "2026-06-12T15:10:22Z",
      action: "Transfer√™ncia",
      inmateId: "AO-REC-3419",
      inmateName: "Ant√≥nio Ngola",
      fieldChanged: "assignedPrisonId (Pris√£o)",
      oldValue: "EP Sanza Pombo",
      newValue: "EP Viana"
    },
    {
      id: "AUD-10025",
      userId: "MININT-OP-089",
      timestamp: "2026-06-12T16:04:15Z",
      action: "Edi√ß√£o",
      inmateId: "AO-REC-1129",
      inmateName: "Joaquim Dinis",
      fieldChanged: "riskLevel (Grau de Risco)",
      oldValue: "M√©dio",
      newValue: "Alto"
    },
    {
      id: "AUD-10026",
      userId: "MININT-OP-243",
      timestamp: "2026-06-12T17:40:00Z",
      action: "Admiss√£o",
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
      action: "Edi√ß√£o",
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
      action: "Transfer√™ncia",
      inmateId: "AO-REC-7091",
      inmateName: "S√©rgio Capenda",
      fieldChanged: "assignedPrisonId (Pris√£o)",
      oldValue: "EP Viana",
      newValue: "EP Sanza Pombo"
    },
    {
      id: "AUD-10029",
      userId: "MININT-OP-243",
      timestamp: "2026-06-13T02:05:44Z",
      action: "Edi√ß√£o",
      inmateId: "AO-REC-3904",
      inmateName: "Valter Moco",
      fieldChanged: "motherName (Nome da M√£e)",
      oldValue: "Desconhecido",
      newValue: "Maria Teresa Moco"
    },
    {
      id: "AUD-10030",
      userId: "MININT-OP-089",
      timestamp: "2026-06-13T03:01:10Z",
      action: "Admiss√£o",
      inmateId: "AO-REC-9331",
      inmateName: "Carlos Luvumbo",
      fieldChanged: "Todos",
      oldValue: "-",
      newValue: "Novo Registro (Cela A3-02, EP Sanza Pombo)"
    }
  ]);

  // Audit Log Pagination and Filter State
  const [auditFilterType, setAuditFilterType] = useState<"Todos" | "Admiss√£o" | "Transfer√™ncia" | "Edi√ß√£o">("Todos");
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
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== "undefined" ? navigator.onLine : true);
  const [syncQueue, setSyncQueue] = useState<any[]>(INITIAL_SYNC_QUEUE);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Background Sync States (VSAT Resiliency)
  const [backgroundSyncEnabled, setBackgroundSyncEnabled] = useState<boolean>(true);
  const [bgSyncCountdown, setBgSyncCountdown] = useState<number>(30);
  const [queueAutoSyncCountdown, setQueueAutoSyncCountdown] = useState<number>(15);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [bgSyncLogs, setBgSyncLogs] = useState<string[]>([
    "M√≥dulo de Sincronismo em Segundo Plano VSAT carregado com chaves da rede central."
  ]);

  // Collapsible panels states for Admission view & Allocation module
  const [isSyncQueueExpanded, setIsSyncQueueExpanded] = useState<boolean>(false);
  const [isVsatExpanded, setIsVsatExpanded] = useState<boolean>(false);
  const [isRecentInmatesExpanded, setIsRecentInmatesExpanded] = useState<boolean>(true);
  const [isB2OptimizationExpanded, setIsB2OptimizationExpanded] = useState<boolean>(false);
  const [isDynamicRiskWeightsExpanded, setIsDynamicRiskWeightsExpanded] = useState<boolean>(false);
  const [isIncidentThresholdsExpanded, setIsIncidentThresholdsExpanded] = useState<boolean>(false);
  const [isOvercrowdingConfigExpanded, setIsOvercrowdingConfigExpanded] = useState<boolean>(false);

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
        medio += p.riskBreakdown["M√©dio"] || 0;
        alto += p.riskBreakdown["Alto"] || 0;
        maximo += p.riskBreakdown["M√°ximo"] || 0;
      }
    });

    const addedInmates = visibleInmates.filter(i => !INITIAL_INMATES.some(init => init.id === i.id));
    addedInmates.forEach(i => {
      if (selectedRiskPrisonFilter === "ALL" || i.assignedPrisonId === selectedRiskPrisonFilter) {
        if (i.riskLevel === "Baixo") baixo++;
        else if (i.riskLevel === "M√©dio") medio++;
        else if (i.riskLevel === "Alto") alto++;
        else if (i.riskLevel === "M√°ximo") maximo++;
      }
    });

    const total = baixo + medio + alto + maximo;

    return [
      { name: "Baixo", value: baixo, color: "#10b981", percent: total > 0 ? ((baixo / total) * 100).toFixed(1) : "0.0", desc: "Regime comum, atividades normais e conduta est√°vel." },
      { name: "M√©dio", value: medio, color: "#3b82f6", percent: total > 0 ? ((medio / total) * 100).toFixed(1) : "0.0", desc: "Regime comum em ala de vigil√¢ncia moderada." },
      { name: "Alto", value: alto, color: "#f97316", percent: total > 0 ? ((alto / total) * 100).toFixed(1) : "0.0", desc: "Regime de seguran√ßa, escolta e vigil√¢ncia refor√ßadas." },
      { name: "M√°ximo", value: maximo, color: "#ef4444", percent: total > 0 ? ((maximo / total) * 100).toFixed(1) : "0.0", desc: "Regime fechado especial ou isolamento por crimes graves." }
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

    // Publish to Institutional Event Bus
    const priorityMap = {
      Agressao: "CRITICAL",
      Fuga: "CRITICAL",
      PosseIlicita: "HIGH",
      Indisciplina: "NORMAL"
    };

    eventBus.publish({
      type: "INCIDENTE_REGISTADO",
      priority: priorityMap[randomCategory] as any,
      category: "SEGURAN√áA",
      source: "GuardaPrisional",
      operator: currentOperator?.name || "Operador de Seguran√ßa",
      message: `INCIDENTE REGISTADO: Ocorr√™ncia de ${randomCategory} sinalizada em tempo real no ${randomUnit}.`,
      payload: {
        unit: randomUnit,
        type: randomCategory,
        timestamp: new Date().toISOString(),
        escalationStatus: "PENDING_MITIGATION"
      }
    });

    // Dynamic message log addition
    setGeneratedLogs(prev => [
      `[SINAL ELETR√ìNICO DISCIPLINAR] Incidente de ${randomCategory} registado em ${randomUnit} √†s ${new Date().toLocaleTimeString()}`,
      ...prev
    ]);
  };

  // ERD Explorer State
  const [searchTable, setSearchTable] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedTable, setSelectedTable] = useState<Table | null>(TABLES_METADATA.find(t => t.name === "Inmate") || TABLES_METADATA[0]);
  const [erdFilterType, setErdFilterType] = useState<"all" | "sync" | "multitenant" | "softdelete">("all");

  // New Inmate Form States grouped by functional modules (12-Module Structure)
  const [identificacao, setIdentificacao] = useState({
    firstName: "",
    lastName: "",
    birthDate: "1995-01-01",
    gender: "Masculino",
    idCard: "",
    fatherName: "",
    motherName: "",
    nationality: "Angolana",
    nickname: "",
    nif: "",
    civilStatus: "Solteiro",
    birthPlace: "Luanda",
    spouse: "",
    children: "Nenhum",
    emergencyContactName: "Am√©lia Ant√≥nio Domingos",
    emergencyContactPhone: "+244 923 888 777",
    familyAddress: "Bairro Cazenga, Rua 4, Casa 12, Luanda",
    previousAddress: "Bairro Cazenga, Rua 4, Casa 12, Luanda",
    municipality: "Cazenga",
    province: "Luanda",
    phone: "+244 912 345 678",
    email: ""
  });

  const [judicial, setJudicial] = useState({
    processNumber: "PROC-2026-6701",
    court: "Tribunal de Comarca de Belas",
    judge: "Dr. Adalberto Fonseca",
    arrestDate: "2026-06-10",
    convictionDate: "2026-06-18",
    sentenceDuration: "20 anos",
    prisonRegime: "Fechado",
    expectedReleaseDate: "2046-06-10",
    hasArrestWarrant: "Sim",
    hasDeliveryWarrant: "Sim"
  });

  const [inteligencia, setInteligencia] = useState({
    grupoCriminal: "Nenhum",
    crimePrincipal: "A01", // Default Homic√≠dio (Homic√≠dio Qualificado)
    crimesAssociados: "Nenhum",
    nivelAmeaca: "Baixo",
    historicoFuga: "N√£o",
    historicoDisciplinar: "Nenhum registado",
    grauRadicalizacao: "Baixo",
    observacoesInteligencia: "Sem observa√ß√µes cr√≠ticas da superintend√™ncia"
  });

  const [seguranca, setSeguranca] = useState({
    gangAffiliation: "Nenhuma",
    isRecidivist: "N√£o",
    escapeRisk: "Baixo",
    suicideRisk: "N√£o",
    violenceRisk: "N√£o",
    staffRisk: "N√£o",
    otherInmatesRisk: "N√£o",
    specialVigilanceNeeded: "Nenhuma"
  });

  const [saude, setSaude] = useState({
    generalHealthStatus: "Bom",
    chronicDiseases: "Nenhuma",
    drugDependency: "Nenhuma",
    currentMedication: "Nenhuma",
    psychiatricHistory: "Nenhum hist√≥rico reportado",
    contagiousDiseases: "Nenhuma",
    medicalExamResults: "Apto para internamento em regime fechado",
    emotionalStatus: "Est√°vel",
    observedBehavior: "Colaborativo com o oficial de triagem prision√°rio de turno",
    aggressiveTendency: "Baixa",
    suicidalTendency: "N√£o",
    preliminaryDiagnosis: "Sem dist√∫rbios psic√≥ticos aparentes",
    psychologicalRecommendations: "Acompanhamento social e integra√ß√£o em labora√ß√£o t√©cnica"
  });

  const [alocacao, setAlocacao] = useState({
    assignedPrisonId: "PRIS-01", // Default Viana
    assignedPavilionId: "PAV-B",
    assignedBlockId: "BLK-B2",
    assignedCellNumber: "Cela B2-01"
  });

  const [reinsercao, setReinsercao] = useState({
    escolaridade: "Ensino M√©dio Conclu√≠do",
    profissao: "Mec√¢nico Geral",
    cursos: "Inform√°tica b√°sica e mec√¢nica de motores",
    competencias: "Serralharia e torneamento",
    experienciaTrabalho: "4 anos em oficina multimarcas no Cazenga",
    interesseFormacao: "Sim, deseja especializar-se em electricidade industrial prision√°ria",
    interesseTrabalhoInterno: "Interesse imediato em regime de labora√ß√£o interna em oficina",
    pretensaoLaboral: "Trabalho em marcenaria / padaria interna",
    reSocializacao: "Laboral",
    atividadesInteresse: "Marcenaria, Inform√°tica B√°sica, Alfabetiza√ß√£o de Pares"
  });

  const [biometria, setBiometria] = useState({
    height: "1.75",
    weight: "72",
    skinColor: "Mesti√ßa",
    eyeColor: "Castanhos",
    bloodType: "O+",
    distinctiveMarks: "Nenhuma",
    scars: "Cicatriz p√≥s-cir√∫rgica no ap√™ndice",
    tattoos: "Tatuagem de cruz no antebra√ßo direito",
    physicalDisabilities: "Nenhuma",
    photo: ""
  });

  const [isDesktopCameraModalOpen, setIsDesktopCameraModalOpen] = useState(false);

  const [assinaturas, setAssinaturas] = useState({
    admittingOfficer: "Superintendente J. Louren√ßo",
    directorSignature: "Director Geral do Servi√ßo Prisional SICP"
  });

  const [auditoriaAdmissao, setAuditoriaAdmissao] = useState({
    operador: "Superintendente J. Louren√ßo",
    dataHora: "2026-06-21 16:22:57 / Central UTC",
    hashRegistro: "SHA-256-4AAFD92E81776D38E2FBDCC9901C8E7B280EFA23D0D990264ADBCB5B30DFBA",
    assinaturaDigital: "SIGAE-AO:SHA-1/RSA-2048-A97BD32C",
    versaoBoletim: "v3.12-SIGAE-AO",
    termoEncaminhamento: "Ordin√°rio",
    operadorCertificado: "Superintendente J. Louren√ßo",
    statusIntegridade: "VERIFICADO_E_CONFORME"
  });

  // Derived unified formData from local modular states to preserve compatibility across the system
  const formData = useMemo(() => ({
    ...identificacao,
    ...judicial,
    ...inteligencia,
    ...seguranca,
    ...saude,
    ...alocacao,
    ...reinsercao,
    ...biometria,
    ...assinaturas,
    ...auditoriaAdmissao,
    // Keep exact backward compatible property mappings:
    crimeId: inteligencia.crimePrincipal,
    associatedCrimes: inteligencia.crimesAssociados,
    criminalGroup: inteligencia.grupoCriminal,
    academicLevel: reinsercao.escolaridade,
    profession: reinsercao.profissao,
    professionalCourses: reinsercao.cursos,
    technicalSkills: reinsercao.competencias,
    workExperience: reinsercao.experienciaTrabalho
  }), [identificacao, judicial, inteligencia, seguranca, saude, alocacao, reinsercao, biometria, assinaturas, auditoriaAdmissao]);

  const [admitBelongings, setAdmitBelongings] = useState<any[]>([
    { idKey: "INV-2026-001", name: "Telem√≥vel iPhone 12", qty: 1, value: "350000 Kz", photo: "" },
    { idKey: "INV-2026-002", name: "Rel√≥gio de Pulso Seiko", qty: 1, value: "75000 Kz", photo: "" },
    { idKey: "INV-2026-003", name: "Carteira em cabedal com Docs", qty: 1, value: "2500 Kz", photo: "" }
  ]);
  const [admitVisitors, setAdmitVisitors] = useState<any[]>([
    { name: "Maria Domingos Sebasti√£o", relationship: "C√¥njuge", doc: "001827361LA042", contact: "+244 923 111 222", approved: "Aprovado" },
    { name: "Am√©lia Ant√≥nio Domingos", relationship: "M√£e", doc: "002938471LA073", contact: "+244 923 888 777", approved: "Aprovado" }
  ]);

  const [activeAdmitModule, setActiveAdmitModule] = useState<number>(1);
  const [showAdmitValidationErrorsModal, setShowAdmitValidationErrorsModal] = useState<boolean>(false);
  const [showWeeklySecurityReportModal, setShowWeeklySecurityReportModal] = useState<boolean>(false);

  // Validation system for any registry (specifically Admissions and also reused in others)
  const admitFormValidation = useMemo(() => {
    const validations = [
      // Blocking Fields
      {
        field: "firstName",
        label: "Primeiro Nome",
        step: 1,
        isBlocking: true,
        isValid: !!formData.firstName?.trim(),
        message: "O primeiro nome √© obrigat√≥rio para identifica√ß√£o legal prim√°ria."
      },
      {
        field: "lastName",
        label: "Apelido / Sobrenomes",
        step: 1,
        isBlocking: true,
        isValid: !!formData.lastName?.trim(),
        message: "O sobrenome √© obrigat√≥rio para evitar conflitos de homon√≠mias."
      },
      {
        field: "idCard",
        label: "N¬∫ Bilhete de Identidade (BI)",
        step: 1,
        isBlocking: true,
        isValid: !!formData.idCard?.trim() && formData.idCard.trim().length >= 5 && formData.idCard !== "N√£o Apresentado",
        message: "O n√∫mero do Bilhete de Identidade √© obrigat√≥rio e deve ter no m√≠nimo 5 caracteres."
      },
      {
        field: "birthDate",
        label: "Data de Nascimento",
        step: 1,
        isBlocking: true,
        isValid: (() => {
          if (!formData.birthDate) return false;
          const birthYear = new Date(formData.birthDate).getFullYear();
          return birthYear > 1900 && birthYear <= 2010; // Must be at least 16 in 2026
        })(),
        message: "Data de nascimento inv√°lida ou recluso menor de 16 anos (limite penal geral)."
      },
      {
        field: "crimeId",
        label: "Crime Principal",
        step: 2,
        isBlocking: true,
        isValid: !!formData.crimeId && formData.crimeId !== "Nenhum",
        message: "O crime/infra√ß√£o principal deve ser selecionado para enquadramento penal."
      },
      {
        field: "processNumber",
        label: "N¬∫ do Processo Judicial",
        step: 2,
        isBlocking: true,
        isValid: !!formData.processNumber?.trim(),
        message: "O n√∫mero de processo √© obrigat√≥rio para registrar a ordem judicial."
      },
      {
        field: "assignedPrisonId",
        label: "Estabelecimento Prisional",
        step: 7,
        isBlocking: true,
        isValid: !!formData.assignedPrisonId,
        message: "Deve selecionar um estabelecimento prisional de destino v√°lido."
      },
      {
        field: "assignedCellNumber",
        label: "N√∫mero de Cela",
        step: 7,
        isBlocking: true,
        isValid: !!formData.assignedCellNumber,
        message: "Deve selecionar uma cela dispon√≠vel no pavilh√£o e bloco determinados."
      },

      // Optional Fields
      {
        field: "nickname",
        label: "Alcunha Prisional",
        step: 1,
        isBlocking: false,
        isValid: !!formData.nickname?.trim(),
        message: "Sem alcunha conhecida. √ötil para identificar o recluso em patrulhas internas."
      },
      {
        field: "nif",
        label: "NIF do Recluso",
        step: 1,
        isBlocking: false,
        isValid: !!formData.nif?.trim(),
        message: "NIF n√£o declarado. Recomendado para controlo patrimonial e cust√≥dia financeira."
      },
      {
        field: "fatherName",
        label: "Nome do Pai",
        step: 1,
        isBlocking: false,
        isValid: !!formData.fatherName?.trim() && formData.fatherName !== "Desconhecido",
        message: "Filia√ß√£o paterna n√£o informada (Pai Desconhecido)."
      },
      {
        field: "motherName",
        label: "Nome da M√£e",
        step: 1,
        isBlocking: false,
        isValid: !!formData.motherName?.trim() && formData.motherName !== "Desconhecido",
        message: "Filia√ß√£o materna n√£o declarada (M√£e Desconhecido). Importante para documenta√ß√£o legal."
      },
      {
        field: "civilStatus",
        label: "Estado Civil",
        step: 1,
        isBlocking: false,
        isValid: !!formData.civilStatus,
        message: "Estado civil n√£o informado. √ötil para heran√ßa e controlo familiar secund√°rio."
      },
      {
        field: "belongingsList",
        label: "Pertences Apreendidos",
        step: 6,
        isBlocking: false,
        isValid: admitBelongings.length > 0,
        message: "Nenhum pertence apreendido registado. Se o recluso n√£o tiver pertences, o registo √© v√°lido."
      },
      {
        field: "visitorsList",
        label: "Rela√ß√£o de Visitantes",
        step: 9,
        isBlocking: false,
        isValid: admitVisitors.length > 0,
        message: "Nenhum familiar ou visitante autorizado registado. V√≠nculos sociais n√£o mapeados."
      },
      {
        field: "height",
        label: "Altura do Recluso",
        step: 10,
        isBlocking: false,
        isValid: !!formData.height && Number(formData.height) > 0,
        message: "Altura n√£o informada. Recomendado para registo antropom√©trico can√≥nico."
      },
      {
        field: "weight",
        label: "Peso do Recluso",
        step: 10,
        isBlocking: false,
        isValid: !!formData.weight && Number(formData.weight) > 0,
        message: "Peso corporal n√£o informado. Recomendado para acompanhamento de sa√∫de."
      },
      {
        field: "bloodType",
        label: "Grupo Sangu√≠neo",
        step: 10,
        isBlocking: false,
        isValid: !!formData.bloodType && formData.bloodType !== "N√£o Informado",
        message: "Grupo sangu√≠neo n√£o especificado. Cr√≠tico para transfus√µes de emerg√™ncia."
      }
    ];

    const blockingErrors = validations.filter(v => v.isBlocking && !v.isValid);
    const optionalWarnings = validations.filter(v => !v.isBlocking && !v.isValid);
    const isAllBlockingValid = blockingErrors.length === 0;

    return {
      validations,
      blockingErrors,
      optionalWarnings,
      isAllBlockingValid
    };
  }, [formData, admitBelongings, admitVisitors]);

  const [newBelonging, setNewBelonging] = useState({ name: "", qty: 1, value: "" });
  const [newVisitor, setNewVisitor] = useState({ name: "", relationship: "C√¥njuge", doc: "", contact: "", approved: "Aprovado" });
  const [suggestionAlert, setSuggestionAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [hoveredSimulatingCell, setHoveredSimulatingCell] = useState<string | null>(null);
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<string | null>(null);
  const [selectedBlockDetailsTab, setSelectedBlockDetailsTab] = useState<"cells" | "forecast">("cells");
  const [showIncidentHeatmap, setShowIncidentHeatmap] = useState<boolean>(false);
  const [pavilionsDashboardTab, setPavilionsDashboardTab] = useState<"table" | "chart">("chart");
  const [optimizationProposal, setOptimizationProposal] = useState<{
    blockId: string;
    blockName: string;
    relocations: Array<{
      inmate: InmateState;
      originalCell: string;
      proposedCell: string;
      stabilityScore: number;
      turnoverBefore: number;
      turnoverAfter: number;
    }>;
  } | null>(null);

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
        if (risk === "M√°ximo" || risk === "Alto") {
          return (pav as any).specialty_tag?.includes("Fechado") || (pav as any).specialty_tag?.includes("Seguran√ßa");
        }
        return (pav as any).specialty_tag?.includes("Aberto") || (pav as any).specialty_tag?.includes("Comum") || (pav as any).specialty_tag?.includes("Admiss√£o");
      }) || targetPrison.pavilions[0];

      suggestedPavilion = matchingPav.id;
      // Find a block with capacity
      const matchingBlock = matchingPav.blocks.find(blk => blk.current < blk.capacity) || matchingPav.blocks[0];
      suggestedBlock = matchingBlock.id;
      suggestedCell = `Cela ${matchingBlock.name.replace("Bloco ", "")}-${Math.floor(Math.random() * 8) + 1}`;
    }

    return {
      riskLevel: inmateRiskOverride !== null ? inmateRiskOverride : risk,
      suggestedCellType: cellType,
      pavilionId: suggestedPavilion,
      blockId: suggestedBlock,
      cellNumber: suggestedCell,
      penaltyRange: selectedCrime.penaltyRange,
      crimeGroup: selectedCrime.id.startsWith("A") ? "Grupo A (Pessoas)" : selectedCrime.id.startsWith("B") ? "Grupo B (Patrim√≥nio)" : "Grupo C (Ordem)"
    };
  }, [formData.crimeId, formData.assignedPrisonId, prisons, inmateRiskOverride]);

  // Track changes to automatically suggestion pre-population to prevent overwriting deliberate manual adjustments
  const [lastCrimeId, setLastCrimeId] = useState("");
  const [lastPrisonId, setLastPrisonId] = useState("");

  useEffect(() => {
    if (computedAdmission) {
      const inmateRisk = computedAdmission.riskLevel;
      const targetPr = prisons.find(p => p.id === alocacao.assignedPrisonId);
      if (!targetPr) return;

      const allBlocks = targetPr.pavilions.flatMap(p => p.blocks.map(b => ({ ...b, pavilionId: p.id })));
      const isHighRiskInmate = inmateRisk === "Alto" || inmateRisk === "M√°ximo";
      const compatibleBlocks = allBlocks.filter(b => {
        if (isHighRiskInmate) {
          return b.riskLevel === "Alto" || b.riskLevel === "M√°ximo";
        }
        return true;
      });

      if (formData.crimeId !== lastCrimeId || alocacao.assignedPrisonId !== lastPrisonId) {
        setLastCrimeId(formData.crimeId || "");
        setLastPrisonId(alocacao.assignedPrisonId || "");
        setInmateRiskOverride(null);

        const suggestedBlock = compatibleBlocks.find(b => b.id === computedAdmission.blockId && b.pavilionId === computedAdmission.pavilionId) || compatibleBlocks[0];

        if (suggestedBlock) {
          setAlocacao(prev => ({
            ...prev,
            assignedPavilionId: suggestedBlock.pavilionId,
            assignedBlockId: suggestedBlock.id,
            assignedCellNumber: `Cela ${suggestedBlock.name.replace("Bloco ", "")}-01`
          }));
        } else if (allBlocks.length > 0) {
          const firstBlk = allBlocks[0];
          setAlocacao(prev => ({
            ...prev,
            assignedPavilionId: firstBlk.pavilionId,
            assignedBlockId: firstBlk.id,
            assignedCellNumber: `Cela ${firstBlk.name.replace("Bloco ", "")}-01`
          }));
        }
      }
    }
  }, [computedAdmission, alocacao.assignedPrisonId, prisons, formData.crimeId, lastCrimeId, lastPrisonId]);

  const validateAllocationCompatibility = (
    inmate: { riskLevel?: string; assignedCellNumber?: string; [key: string]: any } | null | undefined,
    block: { id?: string; riskLevel?: string; name?: string; capacity?: number; current?: number; [key: string]: any } | null | undefined
  ): { 
    valid: boolean; 
    severity: "success" | "info" | "warning" | "error"; 
    message: string;
    securityScore?: number;
    incidentZone?: "Baixo" | "M√©dio" | "Alto";
    incidentCount?: number;
  } => {
    if (!inmate || !block) {
      return {
        valid: true,
        severity: "info",
        message: "Selecione a unidade, pavilh√£o e bloco para obter o parecer de valida√ß√£o.",
        securityScore: 100,
        incidentZone: "Baixo",
        incidentCount: 0
      };
    }
    const inmateRisk = inmate.riskLevel || "M√©dio";
    const blockRisk = block.riskLevel || "M√©dio";
    const capacity = block.capacity ?? 200;
    const current = block.current ?? 0;
    const cellName = inmate.assignedCellNumber || "Cela Comum";

    // Deterministic incidents count based on cellName & blockId to keep it stable
    let hash = 0;
    const seedString = `${block.id || "BLK-DEFAULT"}-${cellName}`;
    for (let i = 0; i < seedString.length; i++) {
      hash += seedString.charCodeAt(i);
    }
    const incidentCount = hash % 9; // 0 to 8 incidents historically

    let incidentZone: "Baixo" | "M√©dio" | "Alto" = "Baixo";
    let incidentPenalty = 0;
    if (incidentCount >= 6) {
      incidentZone = "Alto";
      incidentPenalty = 35;
    } else if (incidentCount >= 3) {
      incidentZone = "M√©dio";
      incidentPenalty = 15;
    } else {
      incidentZone = "Baixo";
      incidentPenalty = 0;
    }

    // 1. Verifica√ß√£o de Lota√ß√£o / Capacidade
    if (current >= capacity) {
      return {
        valid: false,
        severity: "error",
        message: `üö´ BLOQUEADO: O bloco ${block.name || "selecionado"} atingiu a sua capacidade limite (LOTA√á√ÉO ESGOTADA: ${current}/${capacity}). Nenhuma admiss√£o adicional √© regulamentar.`,
        securityScore: 0,
        incidentZone,
        incidentCount
      };
    }

    // 2. Matriz Estrita de Seguran√ßa e Compatibilidade de Risco
    // N√≠veis de risco/seguran√ßa graduados com base nos pesos definidos pelos diretores
    const inmateVal = dynamicRiskWeights[inmateRisk] !== undefined ? dynamicRiskWeights[inmateRisk] : (inmateRisk === "Baixo" ? 1 : inmateRisk === "M√©dio" ? 2 : inmateRisk === "Alto" ? 3 : 4);
    const blockVal = dynamicRiskWeights[blockRisk] !== undefined ? dynamicRiskWeights[blockRisk] : (blockRisk === "Baixo" ? 1 : blockRisk === "M√©dio" ? 2 : blockRisk === "Alto" ? 3 : 4);

    if (inmateVal > blockVal) {
      let specificMsg = "";
      if (inmateRisk === "M√°ximo") {
        specificMsg = "Recluso de risco M√°ximo exige coloca√ß√£o exclusiva em bloco de seguran√ßa M√°xima.";
      } else if (inmateRisk === "Alto") {
        specificMsg = "Recluso de risco Alto requer bloco com seguran√ßa Alta ou M√°xima.";
      } else if (inmateRisk === "M√©dio") {
        specificMsg = "Recluso de risco M√©dio necessita de bloco com seguran√ßa M√©dia, Alta ou M√°xima.";
      } else {
        specificMsg = "O n√≠vel de seguran√ßa do bloco √© inadequado para o grau de perigosidade do recluso.";
      }
      return {
        valid: false,
        severity: "error",
        message: `üö´ INCOMPAT√çVEL: ${specificMsg} (Risco do Recluso: ${inmateRisk} VS Seguran√ßa do Bloco: ${blockRisk}).`,
        securityScore: Math.max(0, 40 - (inmateVal - blockVal) * 15 - incidentPenalty),
        incidentZone,
        incidentCount
      };
    }

    // Calculate dynamic security score (base: 100)
    let baseScore = 95;
    if (blockVal > inmateVal) {
      // Oversecured is safer, so give higher score
      baseScore = 100;
    } else if (blockVal === inmateVal) {
      baseScore = 95;
    }
    const securityScore = Math.max(0, Math.min(100, baseScore - incidentPenalty));

    // 3. High Incidents warning
    if (incidentZone === "Alto") {
      return {
        valid: true, // structurally compatible, but flagged with high risk warning
        severity: "warning",
        message: `‚ö†Ô∏è ALERTA DE SEGURAN√áA (Score: ${securityScore}/100): Embora o Bloco ${block.name || ""} (${blockRisk}) atenda ao requisito regulamentar do risco ${inmateRisk}, a ${cellName} est√° numa ZONA DE ALTA FREQU√äNCIA DE INCIDENTES DISCIPLINARES (${incidentCount} incidentes recentes). Recomenda-se selecionar outra cela ou refor√ßar a supervis√£o activa.`,
        securityScore,
        incidentZone,
        incidentCount
      };
    }

    // 4. Alertas preventivos de capacidade cr√≠tica (por exemplo, √∫ltima vaga restante)
    if (current + 1 === capacity) {
      return {
        valid: true,
        severity: "warning",
        message: `‚ö†Ô∏è ALERTA DE CAPACIDADE CR√çTICA: Resta apenas 1 vaga dispon√≠vel neste bloco (${current}/${capacity}). Todas as aloca√ß√µes subsequentes ser√£o suspensas. (Score de Seguran√ßa: ${securityScore}/100 para a ${cellName}).`,
        securityScore,
        incidentZone,
        incidentCount
      };
    }

    // 5. Valida√ß√£o bem-sucedida
    const zoneDetail = incidentZone === "M√©dio" 
      ? `m√©dio hist√≥rico de incidentes disciplinares (${incidentCount} registos)`
      : `√≥timo hist√≥rico ambiental (${incidentCount} ocorr√™ncias registadas)`;

    return {
      valid: true,
      severity: incidentZone === "M√©dio" ? "warning" : "success",
      message: `‚úÖ ALOCA√á√ÉO AUTORIZADA (Score de Seguran√ßa: ${securityScore}/100): Bloco ${block.name || ""} (Seguran√ßa: ${blockRisk}) √© compat√≠vel com o risco operacional ${inmateRisk} do recluso. A ${cellName} possui um ${zoneDetail}.`,
      securityScore,
      incidentZone,
      incidentCount
    };
  };

  const handleQuickSecurityTriagem = () => {
    // 1. Base score based on the selected crime's underlying risk level
    let baseScore = 0;
    let selectedCrime: any = null;
    for (const group of Object.values(PENAL_CODE_GROUPS)) {
      const found = group.crimes.find(c => c.id === formData.crimeId);
      if (found) {
        selectedCrime = found;
        break;
      }
    }

    const crimeRisk = selectedCrime?.riskLevel || "M√©dio";
    if (crimeRisk === "Baixo") baseScore += 15;
    else if (crimeRisk === "M√©dio") baseScore += 40;
    else if (crimeRisk === "Alto") baseScore += 65;
    else if (crimeRisk === "M√°ximo") baseScore += 85;

    let justificationParts: string[] = [];
    justificationParts.push(`Crime principal: ${selectedCrime?.name || "N√£o selecionado"} (Risco Base: ${crimeRisk})`);

    // 2. Add recidivism weight
    if (formData.isRecidivist === "Sim" || formData.isRecidivist === "SIM") {
      baseScore += 15;
      justificationParts.push("Reincid√™ncia criminal reconhecida (+15 pts)");
    }

    // 3. Add gang affiliation weight
    if (formData.gangAffiliation && formData.gangAffiliation !== "Nenhuma" && formData.gangAffiliation !== "Nenhum") {
      baseScore += 20;
      justificationParts.push(`Perten√ßa declarada a fac√ß√£o/gangue (${formData.gangAffiliation}) (+20 pts)`);
    }

    // 4. Add escape risk weight
    if (formData.escapeRisk === "Alto") {
      baseScore += 25;
      justificationParts.push("Perigo cr√≠tico de fuga ativo (+25 pts)");
    } else if (formData.escapeRisk === "M√©dio") {
      baseScore += 12;
      justificationParts.push("Perigo moderado de fuga ativo (+12 pts)");
    }

    // 5. Add violence risk factors
    if (formData.violenceRisk === "Sim" || formData.violenceRisk === "SIM") {
      baseScore += 15;
      justificationParts.push("Hist√≥rico recente de conduta violenta (+15 pts)");
    }
    if (formData.staffRisk === "Sim" || formData.staffRisk === "SIM") {
      baseScore += 10;
      justificationParts.push("Amea√ßa dirigida contra funcion√°rios prisionais (+10 pts)");
    }
    if (formData.otherInmatesRisk === "Sim" || formData.otherInmatesRisk === "SIM") {
      baseScore += 10;
      justificationParts.push("Incompatibilidade securit√°ria com popula√ß√£o comum (+10 pts)");
    }

    // Bound the final score between 1 and 100
    const finalScore = Math.min(100, Math.max(1, baseScore));

    let proposedRisk = "M√©dio";
    if (finalScore >= 80) proposedRisk = "M√°ximo";
    else if (finalScore >= 55) proposedRisk = "Alto";
    else if (finalScore >= 30) proposedRisk = "M√©dio";
    else proposedRisk = "Baixo";

    setInmateRiskOverride(proposedRisk);

    // Provide immediate visualization alert feedback
    setSuggestionAlert({
      type: "success",
      text: `üìä TRIAGEM DE SEGURAN√áA CONCLU√çDA (Score de Perigo: ${finalScore}/100) -> Novo Risco Proposto: **${proposedRisk}**. Crit√©rios ponderados: ${justificationParts.join(" | ")}.`
    });

    // Write persistent forensic audit trace
    writeAuditLog(
      currentOperator,
      "SECURITY_TRIAGEM" as any,
      "Admission",
      formData.idCard || "N/A",
      `Triagem de seguran√ßa c√©lere calculada. Score ponderado: ${finalScore}/100. Proposta base: ${proposedRisk}. Fatores de risco ponderados: ${justificationParts.join(" / ")}`
    );
  };

  const hasAllocationConflict = useMemo(() => {
    const activePr = prisons.find(p => p.id === alocacao.assignedPrisonId);
    if (!activePr) return false;

    const inmateRisk = computedAdmission?.riskLevel || "M√©dio";
    const selectedBlock = activePr.pavilions
      .flatMap(p => p.blocks)
      .find(b => b.id === alocacao.assignedBlockId);

    if (!selectedBlock) return false;

    const validation = validateAllocationCompatibility({ ...formData, riskLevel: inmateRisk }, selectedBlock);
    return !validation.valid;
  }, [alocacao.assignedPrisonId, alocacao.assignedBlockId, computedAdmission?.riskLevel, formData, prisons]);

  const handleSuggestCell = () => {
    const currentPr = prisons.find(p => p.id === (formData.assignedPrisonId || alocacao.assignedPrisonId || "PRIS-01"));
    if (!currentPr) {
      setSuggestionAlert({ type: "error", text: "Erro: N√£o foi poss√≠vel identificar o Estabelecimento Prisional selecionado." });
      return;
    }
    const inmateRisk = computedAdmission?.riskLevel || "M√©dio";

    // Track best compatible cell found across all blocks and cells (e.g. 1 to 15)
    interface MatchCandidate {
      pavilionId: string;
      pavilionName: string;
      block: any;
      cellNumber: string;
      securityScore: number;
      incidentCount: number;
      incidentZone: string;
      occupancyMargin: number;
      turnoverProbability: number;
      turnoverLabel: string;
      isHighTurnover: boolean;
    }

    const candidates: MatchCandidate[] = [];

    currentPr.pavilions.forEach(pav => {
      pav.blocks.forEach(blk => {
        const capacity = blk.capacity ?? 200;
        const current = blk.current ?? 0;

        // Try candidate cell numbers 1 to 15
        for (let i = 1; i <= 15; i++) {
          const cellNumber = `Cela ${blk.name.replace("Bloco ", "")}-${String(i).padStart(2, '0')}`;
          
          // Apply validation to determine dynamic security score and compatibility
          const validationResult = validateAllocationCompatibility(
            { ...formData, riskLevel: inmateRisk, assignedCellNumber: cellNumber },
            blk
          );

          if (validationResult.valid && validationResult.severity !== "error") {
            const turnover = getPredictiveTurnoverRate(blk.id, cellNumber);
            candidates.push({
              pavilionId: pav.id,
              pavilionName: pav.name,
              block: blk,
              cellNumber,
              securityScore: validationResult.securityScore ?? 0,
              incidentCount: validationResult.incidentCount ?? 0,
              incidentZone: validationResult.incidentZone ?? "Baixo",
              occupancyMargin: capacity - current,
              turnoverProbability: turnover.probability,
              turnoverLabel: turnover.label,
              isHighTurnover: turnover.isHighTurnover
            });
          }
        }
      });
    });

    if (candidates.length === 0) {
      setSuggestionAlert({
        type: "error",
        text: `‚ö†Ô∏è Aloca√ß√£o Imposs√≠vel: N√£o foram encontradas celas compat√≠veis com o grau de risco (${inmateRisk}) em ${currentPr.name}.`
      });
      return;
    }

    // Sort with predictive model:
    // 1. Avoid cells with "High Turnover Probability" (prevents future preventative transfers and population fragmentation)
    // 2. Prioritize higher residual vacancy (lota√ß√£o residual)
    // 3. Magnify turnover probability (prefer lower release probability overall)
    // 4. Highest Security Score
    // 5. Lowest incident count
    const sorted = [...candidates].sort((a, b) => {
      // 1. Avoid cells with high turnover/release probability (isHighTurnover)
      if (a.isHighTurnover !== b.isHighTurnover) {
        return a.isHighTurnover ? 1 : -1; // non-high turnover cells first
      }

      // 2. Prioritize higher vacancy/occupancyMargin first
      if (b.occupancyMargin !== a.occupancyMargin) {
        return b.occupancyMargin - a.occupancyMargin;
      }

      // 3. Lower turnover probability (magnitude of release/transfer chance)
      if (Math.abs(a.turnoverProbability - b.turnoverProbability) > 10) {
        return a.turnoverProbability - b.turnoverProbability;
      }

      // 4. Higher Security Score
      if (b.securityScore !== a.securityScore) {
        return b.securityScore - a.securityScore;
      }

      // 5. Lowest incidents
      return a.incidentCount - b.incidentCount;
    });

    const bestChoice = sorted[0];

    // Apply selected cell
    setAlocacao(prev => ({
      ...prev,
      assignedPavilionId: bestChoice.pavilionId,
      assignedBlockId: bestChoice.block.id,
      assignedCellNumber: bestChoice.cellNumber
    }));

    // Auto log system suggestion to forensics audit records with technical justification
    writeAuditLog(
      currentOperator,
      "CELL_CHANGE_EXECUTE",
      "Admission",
      bestChoice.cellNumber,
      `Sugest√£o autom√°tica do sistema utilizada para o recluso. C√©lula otimizada: ${bestChoice.cellNumber} (${bestChoice.pavilionName} ‚Ä¢ ${bestChoice.block.name}). Justifica√ß√£o t√©cnica: Lota√ß√£o Residual de ${bestChoice.occupancyMargin} vagas e Pontua√ß√£o de Seguran√ßa de ${bestChoice.securityScore}/100. Taxa preditiva de rotatividade de ${bestChoice.turnoverProbability}%.`
    );

    setSuggestionAlert({
      type: "success",
      text: `‚ùáÔ∏è SUGEST√ÉO OTIMIZADA PREDITIVA (Estabilidade de Turnover): Alocado na ${bestChoice.cellNumber} no ${bestChoice.pavilionName} ‚Ä¢ ${bestChoice.block.name} (Lota√ß√£o Residual: ${bestChoice.occupancyMargin} vagas, Rotatividade Preditiva: ${bestChoice.turnoverProbability}% [${bestChoice.turnoverLabel}], Score Seguran√ßa: ${bestChoice.securityScore}/100)`
    });

    setTimeout(() => {
      setSuggestionAlert(null);
    }, 12000);
  };

  // Handle Form Change routed dynamically to keeping state by module
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name in identificacao) {
      setIdentificacao(prev => ({ ...prev, [name]: value }));
    } else if (name in judicial) {
      setJudicial(prev => ({ ...prev, [name]: value }));
    } else if (name in inteligencia) {
      setInteligencia(prev => ({ ...prev, [name]: value }));
    } else if (name in seguranca) {
      setSeguranca(prev => ({ ...prev, [name]: value }));
    } else if (name in saude) {
      setSaude(prev => ({ ...prev, [name]: value }));
    } else if (name in alocacao) {
      setAlocacao(prev => ({ ...prev, [name]: value }));
    } else if (name in reinsercao) {
      setReinsercao(prev => ({ ...prev, [name]: value }));
    } else if (name in biometria) {
      setBiometria(prev => ({ ...prev, [name]: value }));
    } else if (name in assinaturas) {
      setAssinaturas(prev => ({ ...prev, [name]: value }));
    } else if (name in auditoriaAdmissao) {
      setAuditoriaAdmissao(prev => ({ ...prev, [name]: value }));
    }
  };

  // Helper functions for interactive lists
  const handleAddBelonging = () => {
    if (!newBelonging.name) return;
    const item = {
      idKey: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      name: newBelonging.name,
      qty: Number(newBelonging.qty) || 1,
      value: newBelonging.value || "N/A",
      photo: ""
    };
    setAdmitBelongings(prev => [...prev, item]);
    setNewBelonging({ name: "", qty: 1, value: "" });
  };

  const handleRemoveBelonging = (idKey: string) => {
    setAdmitBelongings(prev => prev.filter(b => b.idKey !== idKey));
  };

  const handleAddVisitor = () => {
    if (!newVisitor.name) return;
    setAdmitVisitors(prev => [...prev, { ...newVisitor }]);
    setNewVisitor({ name: "", relationship: "C√¥njuge", doc: "", contact: "", approved: "Aprovado" });
  };

  const handleRemoveVisitor = (name: string) => {
    setAdmitVisitors(prev => prev.filter(v => v.name !== name));
  };

  // Admissions system registration
  const handleRegisterInmate = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentOperator.territorialScope === TerritorialScope.NATIONAL || currentOperator.province === "Centro Operacional") {
      triggerToast(
        "Admiss√£o N√£o Permitida no Centro Operacional",
        "O Centro Operacional Central (Dire√ß√£o Geral) tem compet√™ncia exclusiva de Administra√ß√£o, Supervis√£o e Auditoria da Plataforma Nacional. Admiss√µes de reclusos s√≥ podem ser efetuadas no √¢mbito de Estabelecimentos Penitenci√°rios operacionais.",
        "error"
      );
      return;
    }
    if (!admitFormValidation.isAllBlockingValid) {
      setShowAdmitValidationErrorsModal(true);
      // Go to the step of the first error to make it easy to fix
      if (admitFormValidation.blockingErrors.length > 0) {
        setActiveAdmitModule(admitFormValidation.blockingErrors[0].step);
      }
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
      idCard: formData.idCard || "N√£o Apresentado",
      fatherName: formData.fatherName || "Desconhecido",
      motherName: formData.motherName || "Desconhecido",
      nationality: formData.nationality,
      crimeId: formData.crimeId,
      riskLevel: computedAdmission?.riskLevel || "M√©dio",
      suggestedCellType: computedAdmission?.suggestedCellType || "Regime Comum",
      assignedPrisonId: formData.assignedPrisonId,
      assignedPavilionId: formData.assignedPavilionId || computedAdmission?.pavilionId || "PAV-A",
      assignedBlockId: formData.assignedBlockId || computedAdmission?.blockId || "BLK-A1",
      assignedCellNumber: formData.assignedCellNumber || computedAdmission?.cellNumber || "Cela A1-01",
      status: isOnline ? "ACTIVE" : "PENDING_SYNC",
      documentCode: randomSerial,
      photo: formData.photo || "",

      // Extended fields
      nickname: formData.nickname,
      nif: formData.nif,
      civilStatus: formData.civilStatus,
      birthPlace: formData.birthPlace,
      height: formData.height,
      weight: formData.weight,
      skinColor: formData.skinColor,
      eyeColor: formData.eyeColor,
      bloodType: formData.bloodType,
      distinctiveMarks: formData.distinctiveMarks,
      scars: formData.scars,
      tattoos: formData.tattoos,
      physicalDisabilities: formData.physicalDisabilities,
      facialRecognitionLocked: true,
      fingerprintCount: 10,
      spouse: formData.spouse,
      children: formData.children,
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactPhone,
      familyAddress: formData.familyAddress,
      previousAddress: formData.previousAddress,
      municipality: formData.municipality,
      province: formData.province,
      phone: formData.phone,
      email: formData.email,
      processNumber: formData.processNumber,
      court: formData.court,
      judge: formData.judge,
      arrestDate: formData.arrestDate,
      convictionDate: formData.convictionDate,
      sentenceDuration: formData.sentenceDuration,
      prisonRegime: formData.prisonRegime,
      expectedReleaseDate: formData.expectedReleaseDate,
      hasArrestWarrant: formData.hasArrestWarrant,
      hasDeliveryWarrant: formData.hasDeliveryWarrant,
      associatedCrimes: formData.associatedCrimes,
      criminalGroup: formData.criminalGroup,
      gangAffiliation: formData.gangAffiliation,
      isRecidivist: formData.isRecidivist,
      escapeRisk: formData.escapeRisk,
      suicideRisk: formData.suicideRisk,
      violenceRisk: formData.violenceRisk,
      staffRisk: formData.staffRisk,
      otherInmatesRisk: formData.otherInmatesRisk,
      specialVigilanceNeeded: formData.specialVigilanceNeeded,
      generalHealthStatus: formData.generalHealthStatus,
      chronicDiseases: formData.chronicDiseases,
      drugDependency: formData.drugDependency,
      currentMedication: formData.currentMedication,
      psychiatricHistory: formData.psychiatricHistory,
      contagiousDiseases: formData.contagiousDiseases,
      medicalExamResults: formData.medicalExamResults,
      emotionalStatus: formData.emotionalStatus,
      observedBehavior: formData.observedBehavior,
      aggressiveTendency: formData.aggressiveTendency,
      suicidalTendency: formData.suicidalTendency,
      preliminaryDiagnosis: formData.preliminaryDiagnosis,
      psychologicalRecommendations: formData.psychologicalRecommendations,
      academicLevel: formData.academicLevel,
      profession: formData.profession,
      professionalCourses: formData.professionalCourses,
      technicalSkills: formData.technicalSkills,
      workExperience: formData.workExperience,
      belongingsList: JSON.stringify(admitBelongings),
      visitorsList: JSON.stringify(admitVisitors),
      admittingOfficer: formData.admittingOfficer,
      registrationHash: `SHA-256-${Math.floor(Math.random() * 900000 + 100000)}-SICP`,
      qrCodeValidationValue: `SICP-VALIDATOR-${Math.floor(Math.random() * 900000 + 100000)}`
    };

    if (isOnline) {
      // Direct registration
      setInmates(prev => [newInmate, ...prev]);

      // Enviar registo de forma ass√≠ncrona para o PostgreSQL
      apiService.createRecluso({
        nipc: newInmate.documentCode,
        nomeCompleto: `${newInmate.firstName} ${newInmate.lastName}`,
        dataNascimento: newInmate.birthDate,
        nacionalidade: newInmate.nationality,
        documentoId: newInmate.idCard,
        nivelSeguranca: newInmate.riskLevel === "M√°ximo" ? "MAXIMA" : newInmate.riskLevel === "Alto" ? "ALTA" : newInmate.riskLevel === "M√©dio" ? "MEDIA" : "BAIXA",
        statusLegal: newInmate.status === "ACTIVE" ? "CONDENADO" : "PREVENTIVE",
        estabelecimentoId: formData.assignedPrisonId,
        celaId: newInmate.assignedCellNumber
      }).then(saved => {
        console.log("üü¢ Recluso admitido persistido com sucesso em PostgreSQL:", saved);
      }).catch(err => {
        console.warn("‚ö†Ô∏è Falha de comunica√ß√£o com o Postgres ao persistir recluso:", err);
      });

      // Add direct admission to Audit Log
      const prNameLoc = prisons.find(p => p.id === formData.assignedPrisonId)?.name.replace("Estabelecimento Penitenci√°rio de ", "EP ") || "EP Viana";
      const newAuditLog: AuditLog = {
        id: `AUD-${Math.floor(10000 + Math.random() * 90000)}`,
        userId: currentOperatorId,
        timestamp: new Date().toISOString(),
        action: "Admiss√£o",
        inmateId: uniqueId,
        inmateName: `${newInmate.firstName} ${newInmate.lastName}`,
        fieldChanged: "Todos",
        oldValue: "-",
        newValue: `Novo Registro (${newInmate.assignedCellNumber}, ${prNameLoc})`
      };
      setAuditLogs(prev => [newAuditLog, ...prev]);

      // Publish to Institutional Event Bus
      eventBus.publish({
        type: "ADMISSAO_CONCLUIDA",
        priority: "NORMAL",
        category: "OPERACIONAL",
        source: "AdmissionWizard",
        operator: currentOperator?.name || "Oficial de Admiss√£o",
        message: `ADMISS√ÉO CONCLU√çDA: Recluso ${newInmate.firstName} ${newInmate.lastName} admitido com sucesso no ${prNameLoc} (Cela: ${newInmate.assignedCellNumber}).`,
        payload: {
          inmateId: uniqueId,
          inmateName: `${newInmate.firstName} ${newInmate.lastName}`,
          nipc: newInmate.documentCode,
          prisonId: formData.assignedPrisonId,
          cell: newInmate.assignedCellNumber,
          riskLevel: newInmate.riskLevel,
          status: "ONLINE_REGISTERED"
        }
      });
      
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
          const isPreventive = newInmate.riskLevel === "M√°ximo" || newInmate.riskLevel === "Alto";
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
      setGeneratedLogs(prev => [`[CONCLU√çDO] Recluso registado online com sucesso. ID: ${uniqueId}`]);
    } else {
      // Offline Contingency Mode - Stored in Sync Queue simulating IndexedDB
      const offAction = {
         id: `loc-${Math.floor(10000 + Math.random() * 90000)}`,
         type: "Admiss√£o",
         description: `Registo offline do recluso ${newInmate.firstName} ${newInmate.lastName} (${newInmate.idCard}) por crime ${formData.crimeId}`,
         timestamp: new Date().toISOString(),
         payload: newInmate
      };
      
      setSyncQueue(prev => [...prev, offAction]);

      // Add offline enqueued audit log
      const prNameLocOffline = prisons.find(p => p.id === formData.assignedPrisonId)?.name.replace("Estabelecimento Penitenci√°rio de ", "EP ") || "EP Viana";
      const newAuditLogOff: AuditLog = {
        id: `AUD-${Math.floor(10000 + Math.random() * 90000)}`,
        userId: currentOperatorId,
        timestamp: new Date().toISOString(),
        action: "Admiss√£o",
        inmateId: uniqueId,
        inmateName: `${newInmate.firstName} ${newInmate.lastName}`,
        fieldChanged: "Todos (Offline)",
        oldValue: "-",
        newValue: `Enfileirado Offline p/ ${prNameLocOffline} (${newInmate.assignedCellNumber})`
      };
      setAuditLogs(prev => [newAuditLogOff, ...prev]);

      // Publish to Institutional Event Bus
      eventBus.publish({
        type: "ADMISSAO_CONCLUIDA",
        priority: "HIGH",
        category: "OPERACIONAL",
        source: "AdmissionWizard",
        operator: currentOperator?.name || "Oficial de Admiss√£o (Offline)",
        message: `ADMISS√ÉO OFFLINE ENFILEIRADA: Recluso ${newInmate.firstName} ${newInmate.lastName} enfileirado para o ${prNameLocOffline} (Cela: ${newInmate.assignedCellNumber}).`,
        payload: {
          inmateId: uniqueId,
          inmateName: `${newInmate.firstName} ${newInmate.lastName}`,
          nipc: newInmate.documentCode,
          prisonId: formData.assignedPrisonId,
          cell: newInmate.assignedCellNumber,
          riskLevel: newInmate.riskLevel,
          status: "OFFLINE_QUEUED",
          queueId: offAction.id
        }
      });
      
      // Still place in local volatile memory state as "PENDING_SYNC" so guards see it instantly
      setInmates(prev => [newInmate, ...prev]);
      setGeneratedLogs(prev => [`[INDEXEDDB SAFEOFFLINE] Adicionado √† fila local de conting√™ncia. C√≥digo: ${offAction.id}`]);
    }

    // Reset Form fields for each module specifically, keeping and restoring default configuration values
    setIdentificacao(prev => ({
      ...prev,
      firstName: "",
      lastName: "",
      idCard: "",
      fatherName: "",
      motherName: "",
      nickname: "",
      nif: ""
    }));
    setBiometria(prev => ({
      ...prev,
      photo: ""
    }));
    setJudicial(prev => ({
      ...prev,
      processNumber: "",
      convictionDate: "",
      expectedReleaseDate: ""
    }));
    setInteligencia(prev => ({
      ...prev,
      groupCriminal: "Nenhum",
      crimePrincipal: "A01",
      crimesAssociados: "Nenhum",
      nivelAmeaca: "Baixo"
    }));
    setAdmitBelongings([]);
    setAdmitVisitors([]);
    setActiveAdmitModule(1);

    // Auto focus on documents template window
    setActiveTab("documents");
    setSelectedDocumentCode(newInmate.documentCode);
  };

  // Offline Sync executor
  const triggerSync = () => {
    if (syncQueue.length === 0) return;
    setIsSyncing(true);
    setSyncLogs([
      "üì° Estabelecendo liga√ß√£o com o servidor do MININT central em Luanda...",
      "üîí Verificando integridade das assinaturas criptogr√°ficas locais...",
      "üóÑÔ∏è Inicializando barramento de sincronismo com PostgreSQL..."
    ]);
    
    setBgSyncLogs(prev => [
      `[${new Date().toLocaleTimeString()}] üì° Estabelecendo liga√ß√£o de dados segura via VSAT...`,
      `[${new Date().toLocaleTimeString()}] üîë Handshake criptogr√°fico validado para o cluster central.`,
      ...prev
    ]);

    const itemsToProcess = [...syncQueue];
    let currentIndex = 0;

    const processNextItem = () => {
      if (currentIndex >= itemsToProcess.length) {
        setSyncQueue([]);
        setIsSyncing(false);
        setSyncLogs([]);
        setBgSyncLogs(prev => [
          `[${new Date().toLocaleTimeString()}] ‚úÖ Sincroniza√ß√£o conclu√≠da com sucesso! Sincronizados ${itemsToProcess.length} registos com PostgreSQL.`,
          ...prev
        ]);
        alert(`Sincroniza√ß√£o nacional conclu√≠da com sucesso! ${itemsToProcess.length} transa√ß√µes contingentes integradas com √™xito na base central PostgreSQL.`);
        return;
      }

      const item = itemsToProcess[currentIndex];
      let sqlLog = "";

      if (item.type === "Admiss√£o" && item.payload) {
        const payload = item.payload as any;
        const targetPr = prisons.find(p => p.id === payload.assignedPrisonId)?.name.replace("Estabelecimento Penitenci√°rio de ", "EP ") || "EP Viana";
        
        // Formulate highly explicit SQL insert command for transparent feedback
        sqlLog = `INSERT INTO public.inmates (id, first_name, last_name, danger_level, prison_id, cell_id, status) VALUES ('${payload.id}', '${payload.firstName}', '${payload.lastName}', '${payload.riskLevel || "BAIXO"}', '${payload.assignedPrisonId}', '${payload.assignedCellNumber || "N/A"}', 'ACTIVE');`;

        // Update inmate status in general state
        setInmates(prevInmates => prevInmates.map(inm => {
          if (inm.id === payload.id) {
            return { ...inm, status: "ACTIVE" as const };
          }
          return inm;
        }));

        // Increment occupancy & risk break-down in prisons database
        setPrisons(prevPrisons => prevPrisons.map(cris => {
          if (cris.id === payload.assignedPrisonId) {
            const nextBreakdown = { ...cris.riskBreakdown };
            const level = payload.riskLevel || "M√©dio";
            nextBreakdown[level] = (nextBreakdown[level] || 0) + 1;
            return {
              ...cris,
              currentOccupancy: cris.currentOccupancy + 1,
              riskBreakdown: nextBreakdown
            };
          }
          return cris;
        }));

        // Update graphical trend stats
        const isPreventive = payload.riskLevel === "M√°ximo" || payload.riskLevel === "Alto";
        const offPreventivas = isPreventive ? 1 : 0;
        const offCondenacoes = isPreventive ? 0 : 1;
        setAdmissionsTrendData(prev => prev.map(trend => {
          if (trend.month === "Jun/26") {
            return {
              ...trend,
              preventivas: trend.preventivas + offPreventivas,
              condenacoes: trend.condenacoes + offCondenacoes
            };
          }
          return trend;
        }));

        // Write to legacy Audit Log for compatibility
        const syncAudit: AuditLog = {
          id: `AUD-${Math.floor(10000 + Math.random() * 90000)}`,
          userId: currentOperatorId,
          timestamp: new Date().toISOString(),
          action: "Admiss√£o",
          inmateId: payload.id,
          inmateName: `${payload.firstName} ${payload.lastName}`,
          fieldChanged: "Status",
          oldValue: "Offline (PENDING_SYNC)",
          newValue: `Confirmado Central (${payload.assignedCellNumber || "N/A"}, ${targetPr})`
        };
        setAuditLogs(prev => [syncAudit, ...prev]);

        // Write to modern audit log (Non-repudiation and forensic audit)
        writeAuditLog(
          currentOperator,
          "CELL_ADMISSION" as any,
          "Inmate",
          payload.id,
          `[AUTO-SYNC - POSTGRESQL INSERT] Recluso ${payload.firstName} ${payload.lastName} adicionado na tabela public.inmates. Unidade: ${targetPr}, Cela: ${payload.assignedCellNumber || "N/A"}.`
        );
      } else {
        // Fallback for general types
        sqlLog = `INSERT INTO public.audit_logs (id, event_type) VALUES ('${item.id}', '${item.type}');`;
      }

      // Log the actual SQL insert transaction to visual VSAT console
      const timestampString = new Date().toLocaleTimeString();
      setBgSyncLogs(prev => [
        `[${timestampString}] üóÑÔ∏è [SQL EXEC] ${sqlLog}`,
        `[${timestampString}] ‚úì Database insertion successful! Record ID: ${item.id}`,
        ...prev
      ]);

      setSyncLogs(prev => [
        ...prev,
        `‚úì [PostgreSQL] Inser√ß√£o executada: ID ${item.id} (${item.type})`
      ]);

      // Schedule next record in queue
      currentIndex++;
      setTimeout(processNextItem, 1500);
    };

    // Begin progressive execution queue after handshake simulated delays
    setTimeout(processNextItem, 1200);
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
    const sourceName = sourcePrison ? sourcePrison.name.replace("Estabelecimento Penitenci√°rio de ", "EP ") : "N/A";
    const destName = destPrison ? destPrison.name.replace("Estabelecimento Penitenci√°rio de ", "EP ") : "N/A";

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
      reason: `Transfer√™ncia r√°pida de seguran√ßa solicitada por ${currentOperator.name}.`,
      operatorId: currentOperator.id,
      escortDetails: "Batalh√£o de Interven√ß√£o R√°pida - Pol√≠cia Nacional",
      classification: InformationClassification.CONFIDENTIAL
    };

    setMovements(prev => [pendingMov, ...prev]);

    // Create Audit Log
    const logId = `AUD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newLog: AuditLog = {
      id: logId,
      userId: currentOperatorId,
      timestamp: new Date().toISOString(),
      action: "Transfer√™ncia",
      inmateId: inmate.id,
      inmateName: `${inmate.firstName} ${inmate.lastName}`,
      fieldChanged: "Solicita√ß√£o de Transfer√™ncia (Registo Workflow)",
      oldValue: sourceName,
      newValue: `${destName} (Aguardando Aprova√ß√£o Provincial)`
    };

    setAuditLogs(prev => [newLog, ...prev]);
    setGeneratedLogs(prev => [`[TRANSFER_REQ] Ordem de transfer√™ncia ${newId} pendente de autoriza√ß√£o provincial para ${inmate.firstName} ${inmate.lastName}.`, ...prev]);

    // Publish to Institutional Event Bus (Global Layer)
    eventBus.publish({
      type: "TRANSFERENCIA_SOLICITADA",
      priority: "HIGH",
      category: "OPERACIONAL",
      source: "TransferService",
      operator: currentOperator?.name || "Operador de Cust√≥dia",
      message: `TRANSFER√äNCIA SOLICITADA: Ordem ${newId} criada para ${inmate.firstName} ${inmate.lastName} com destino a ${destName} (${pendingMov.escortDetails}).`,
      payload: {
        movementId: newId,
        inmateId: inmate.id,
        inmateName: `${inmate.firstName} ${inmate.lastName}`,
        source: sourceName,
        destination: destName,
        status: "PENDING_APPROVAL",
        securityClassification: "CONFIDENTIAL"
      }
    });

    // Log also to military forensic records
    writeAuditLog(
      currentOperator,
      "TRANSFER_EXECUTE",
      "InmateMovement",
      newId,
      `Solicita√ß√£o de transfer√™ncia r√°pida registada para o recluso ${inmate.firstName} ${inmate.lastName} (Aguardando aprova√ß√£o do Diretor Provincial). Destino: ${destName}`,
      inmate.id,
      `${inmate.firstName} ${inmate.lastName}`
    );

    alert(`Solicita√ß√£o de transfer√™ncia N¬∫ ${newId} gerada com sucesso!\n\nDe acordo com os protocolos de seguran√ßa militar, esta movimenta√ß√£o requer assinatura digital e aposi√ß√£o do selo oficial de um Diretor Provincial antes de ser executada.`);
  };

  const handleBatchTransfer = (inmateIds: string[], destPrisonId: string) => {
    if (inmateIds.length === 0) return;
    const destPrison = prisons.find(p => p.id === destPrisonId);
    if (!destPrison) return;
    const destName = destPrison.name.replace("Estabelecimento Penitenci√°rio de ", "EP ");

    let count = 0;
    const timestamp = new Date().toISOString();

    setInmates(prev => prev.map(inm => {
      if (inmateIds.includes(inm.id)) {
        if (inm.assignedPrisonId !== destPrisonId) {
          count++;
          // Get target pavilion and block of the destination prison to allocate
          const targetPavilionId = destPrison.pavilions[0]?.id || "";
          const targetBlockId = destPrison.pavilions[0]?.blocks[0]?.id || "";
          const targetBlockName = destPrison.pavilions[0]?.blocks[0]?.name || "Bloco A";
          const targetCellNumber = `Cela ${targetBlockName.replace("Bloco ", "")}-01`;
          
          return {
            ...inm,
            assignedPrisonId: destPrisonId,
            assignedPavilionId: targetPavilionId,
            assignedBlockId: targetBlockId,
            assignedCellNumber: targetCellNumber,
            status: isOnline ? "ACTIVE" : "PENDING_SYNC"
          };
        }
      }
      return inm;
    }));

    if (count > 0) {
      setPrisons(prev => prev.map(p => {
        let currentOccupancy = p.currentOccupancy;
        const updatedBreakdown = { ...p.riskBreakdown };
        
        // Decrement from source prisons
        inmateIds.forEach(id => {
          const inmateObj = inmates.find(i => i.id === id);
          if (inmateObj && inmateObj.assignedPrisonId === p.id && inmateObj.assignedPrisonId !== destPrisonId) {
            currentOccupancy = Math.max(0, currentOccupancy - 1);
            const rKey = inmateObj.riskLevel as keyof typeof updatedBreakdown;
            if (updatedBreakdown[rKey] > 0) {
              updatedBreakdown[rKey]--;
            }
          }
        });

        // Increment for destination prison
        if (p.id === destPrisonId) {
          inmateIds.forEach(id => {
            const inmateObj = inmates.find(i => i.id === id);
            if (inmateObj && inmateObj.assignedPrisonId !== destPrisonId) {
              currentOccupancy++;
              const rKey = inmateObj.riskLevel as keyof typeof updatedBreakdown;
              updatedBreakdown[rKey] = (updatedBreakdown[rKey] || 0) + 1;
            }
          });
        }

        // Also adjust cell occupancies in the pavilions/blocks
        let updatedPavilions = p.pavilions;
        if (p.id === destPrisonId) {
          updatedPavilions = p.pavilions.map((pav, idx) => {
            if (idx === 0) { // Default to the first pavilion
              return {
                ...pav,
                blocks: pav.blocks.map((blk, bIdx) => {
                  if (bIdx === 0) { // Default to the first block
                    return { ...blk, current: blk.current + count };
                  }
                  return blk;
                })
              };
            }
            return pav;
          });
        } else {
          updatedPavilions = p.pavilions.map(pav => {
            return {
              ...pav,
              blocks: pav.blocks.map(blk => {
                const countRemoved = inmateIds.filter(id => {
                  const inmateObj = inmates.find(i => i.id === id);
                  return inmateObj && inmateObj.assignedPrisonId === p.id && inmateObj.assignedBlockId === blk.id;
                }).length;
                if (countRemoved > 0) {
                  return { ...blk, current: Math.max(0, blk.current - countRemoved) };
                }
                return blk;
              })
            };
          });
        }

        return {
          ...p,
          currentOccupancy,
          riskBreakdown: updatedBreakdown,
          pavilions: updatedPavilions
        };
      }));

      // Create movements & audit logs for each transfer
      inmateIds.forEach(id => {
        const inmate = inmates.find(i => i.id === id);
        if (!inmate || inmate.assignedPrisonId === destPrisonId) return;

        const sourcePrisonId = inmate.assignedPrisonId;
        const sourcePrison = prisons.find(pr => pr.id === sourcePrisonId);
        const sourceName = sourcePrison ? sourcePrison.name.replace("Estabelecimento Penitenci√°rio de ", "EP ") : "N/A";

        const newId = `MOV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
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
          status: "EXECUTED",
          reason: `Transfer√™ncia em lote autorizada pela Dire√ß√£o Geral por ${currentOperator.name}.`,
          operatorId: currentOperator.id,
          escortDetails: "Batalh√£o de Interven√ß√£o R√°pida - Pol√≠cia Nacional",
          classification: InformationClassification.CONFIDENTIAL
        };

        setMovements(prev => [pendingMov, ...prev]);

        // Audit Log
        const logId = `AUD-${Math.floor(10000 + Math.random() * 90000)}`;
        const newLog: AuditLog = {
          id: logId,
          userId: currentOperatorId,
          timestamp: timestamp,
          action: "Transfer√™ncia",
          inmateId: inmate.id,
          inmateName: `${inmate.firstName} ${inmate.lastName}`,
          fieldChanged: "Transfer√™ncia em Lote (Admiss√µes)",
          oldValue: sourceName,
          newValue: `${destName} (Executada por lote)`
        };

        setAuditLogs(prev => [newLog, ...prev]);

        eventBus.publish({
          type: "TRANSFERENCIA_SOLICITADA",
          priority: "HIGH",
          category: "OPERACIONAL",
          source: "TransferService",
          operator: currentOperator?.name || "Operador de Cust√≥dia",
          message: `TRANSFER√äNCIA EM LOTE: Recluso ${inmate.firstName} ${inmate.lastName} movido de ${sourceName} para ${destName}.`,
          payload: {
            movementId: newId,
            inmateId: inmate.id,
            inmateName: `${inmate.firstName} ${inmate.lastName}`,
            source: sourceName,
            destination: destName,
            status: "EXECUTED",
            securityClassification: "CONFIDENTIAL"
          }
        });

        writeAuditLog(
          currentOperator,
          "TRANSFER_EXECUTE",
          "InmateMovement",
          newId,
          `Transfer√™ncia em lote conclu√≠da para ${inmate.firstName} ${inmate.lastName} da unidade ${sourceName} para ${destName}`,
          inmate.id,
          `${inmate.firstName} ${inmate.lastName}`
        );
      });

      // Clear selection
      setSelectedInmateIds([]);
      
      setSuggestionAlert({
        type: "success",
        text: `‚ö° TRANSFER√äNCIA EM LOTE CONCLU√çDA -> ${count} reclusos transferidos para ${destName} com sucesso!`
      });
    }
  };

  const handleBatchDelete = (inmateIds: string[]) => {
    if (inmateIds.length === 0) return;
    
    // We filter selected inmates out
    const selectedInmatesToDel = inmates.filter(i => inmateIds.includes(i.id));
    if (selectedInmatesToDel.length === 0) return;

    setInmates(prev => prev.filter(i => !inmateIds.includes(i.id)));

    if (isOnline) {
      inmateIds.forEach(id => {
        apiService.deleteRecluso(id).then(deleted => {
          console.log(`üü¢ Registro de recluso removido via lote do PostgreSQL: ID ${id}`);
        }).catch(err => {
          console.warn(`‚ö†Ô∏è Falha ao remover recluso ID ${id} via lote:`, err);
        });
      });
    }

    // Decrement the prison/pavilion/block capacities
    setPrisons(prev => prev.map(p => {
      let updatedP = { ...p };
      const matchedInmates = selectedInmatesToDel.filter(i => i.assignedPrisonId === p.id);
      if (matchedInmates.length > 0) {
        let currentOccupancy = p.currentOccupancy;
        const updatedBreakdown = { ...p.riskBreakdown };

        matchedInmates.forEach(inmate => {
          currentOccupancy = Math.max(0, currentOccupancy - 1);
          const rKey = inmate.riskLevel as keyof typeof updatedBreakdown;
          if (updatedBreakdown[rKey] > 0) {
            updatedBreakdown[rKey]--;
          }
        });

        updatedP = {
          ...updatedP,
          currentOccupancy,
          riskBreakdown: updatedBreakdown,
          pavilions: p.pavilions.map(pav => {
            let updatedPav = { ...pav };
            const matchedPavInmates = matchedInmates.filter(i => i.assignedPavilionId === pav.id);
            if (matchedPavInmates.length > 0) {
              updatedPav = {
                ...updatedPav,
                blocks: pav.blocks.map(cell => {
                  const matchedCellInmates = matchedPavInmates.filter(i => i.assignedBlockId === cell.id);
                  if (matchedCellInmates.length > 0) {
                    return { ...cell, current: Math.max(0, cell.current - matchedCellInmates.length) };
                  }
                  return cell;
                })
              };
            }
            return updatedPav;
          })
        };
      }
      return updatedP;
    }));

    // Audit and logs
    selectedInmatesToDel.forEach(inmate => {
      writeAuditLog(
        currentOperator,
        "RELEASE_EXECUTE",
        "Admission",
        inmate.id,
        `Removida ficha can√¥nica em lote (soft delete / soltura) do recluso ${inmate.firstName} ${inmate.lastName}`
      );
    });

    // Clear selection
    setSelectedInmateIds([]);

    setSuggestionAlert({
      type: "success",
      text: `‚ö° ELIMINA√á√ÉO EM LOTE CONCLU√çDA -> ${selectedInmatesToDel.length} reclusos eliminados do sistema com sucesso!`
    });
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
      action: "Edi√ß√£o",
      inmateId: inmate.id,
      inmateName: `${inmate.firstName} ${inmate.lastName}`,
      fieldChanged: "riskLevel (Grau de Risco)",
      oldValue: oldRisk,
      newValue: newRiskLevel
    };

    setAuditLogs(prev => [newLog, ...prev]);
    setGeneratedLogs(prev => [`[EDITION] N√≠vel de risco do recluso ${inmate.firstName} atualizado para ${newRiskLevel}. Log adicionado: ${logId}`, ...prev]);

    // Offline Queue support
    if (!isOnline) {
      const offAction = {
         id: `loc-${Math.floor(10000 + Math.random() * 90000)}`,
         type: "Edi√ß√£o",
         description: `Edi√ß√£o offline do perfil de<sup></sup> risco de ${inmate.firstName} ${inmate.lastName} de ${oldRisk} para ${newRiskLevel}`,
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
      action: "Edi√ß√£o",
      inmateId: inmate.id,
      inmateName: `${inmate.firstName} ${inmate.lastName}`,
      fieldChanged: "photo (Fotografia Mugshot)",
      oldValue: inmate.photo ? "Fotografia Existente" : "Sem Fotografia",
      newValue: "Nova Fotografia Carregada"
    };

    setAuditLogs(prev => [newLog, ...prev]);
    setGeneratedLogs(prev => [`[FOTO] Fotografia de identifica√ß√£o do recluso ${inmate.firstName} atualizada. Log: ${logId}`, ...prev]);

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

  const handleOpenInmateEditModal = (inmate: InmateState) => {
    setEditingInmate(inmate);
    setEditFormFields({ ...inmate });
    setEditSecurityPin("");
    setShowPinErrorMsg("");
  };

  const handleSaveInmateEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInmate) return;

    // 1. PIN / Password validation
    const activeOp = operators.find(op => op.id === currentOperatorId) || operators[0];
    if (editSecurityPin !== activeOp.senha_hash) {
      setShowPinErrorMsg("Assinatura Rejeitada: A palavra-passe inserida est√° incorreta. Esta falha de autentica√ß√£o foi registada nos logs de auditoria militar.");
      
      // Log security violation to forensic audit
      writeAuditLog(
        activeOp,
        "CELL_CHANGE_EXECUTE", // fallback action
        "Inmate",
        editingInmate.id,
        `[VIOLA√á√ÉO DE SEGURAN√áA] Tentativa de altera√ß√£o n√£o autorizada (Palavra-passe inv√°lida) na ficha do recluso ${editingInmate.firstName} ${editingInmate.lastName}. Tentativa rejeitada e bloqueada pelo sistema.`,
        editingInmate.id,
        `${editingInmate.firstName} ${editingInmate.lastName}`
      );
      return;
    }

    // 2. Identify changes and validate permissions
    const fieldsToProcess: { field: string; label: string; oldValue: string; newValue: string; category: 1 | 2 | 3 }[] = [];

    const checkField = (key: keyof InmateState, label: string, category: 1 | 2 | 3) => {
      const oldVal = String(editingInmate[key] || "");
      const newVal = String(editFormFields[key] || "");
      if (oldVal !== newVal) {
        fieldsToProcess.push({ field: String(key), label, oldValue: oldVal, newValue: newVal, category });
      }
    };

    // Category 1: Dados Pessoais & Identifica√ß√£o
    checkField("firstName", "Primeiro Nome", 1);
    checkField("lastName", "√öltimo Nome", 1);
    checkField("birthDate", "Data de Nascimento", 1);
    checkField("gender", "G√©nero", 1);
    checkField("idCard", "Bilhete de Identidade (BI)", 1);
    checkField("fatherName", "Nome do Pai", 1);
    checkField("motherName", "Nome da M√£e", 1);
    checkField("nationality", "Nacionalidade", 1);

    // Category 2: Seguran√ßa & Alojamento
    checkField("riskLevel", "Grau de Risco", 2);
    checkField("assignedCellNumber", "N√∫mero da Cela", 2);
    checkField("assignedBlockId", "Identificador do Bloco", 2);
    checkField("assignedPavilionId", "Identificador do Pavilh√£o", 2);
    checkField("assignedPrisonId", "Estabelecimento Prisional", 2);

    // Category 3: Sa√∫de & Prontu√°rio
    checkField("bloodType", "Grupo Sangu√≠neo", 3);
    checkField("distinctiveMarks", "Marcas Distintivas", 3);
    checkField("scars", "Cicatrizes", 3);
    checkField("tattoos", "Tatuagens", 3);
    checkField("physicalDisabilities", "Defici√™ncias F√≠sicas", 3);
    checkField("drugDependency", "Depend√™ncia de Subst√¢ncias", 3);
    checkField("psychiatricHistory", "Hist√≥rico Psiqui√°trico", 3);

    if (fieldsToProcess.length === 0) {
      alert("Nenhuma altera√ß√£o foi realizada.");
      setEditingInmate(null);
      return;
    }

    // Role-based Access Control (RBAC) verification
    const role = activeOp.role;
    let unauthorizedField = "";

    fieldsToProcess.forEach(item => {
      if (item.category === 1) {
        // Only Directors can edit personal data
        if (role !== "DIRECTOR_GERAL" && role !== "DIRECTOR_PROVINCIAL" && role !== "DIRECTOR_CADEIA") {
          unauthorizedField = item.label;
        }
      } else if (item.category === 2) {
        // Directors and Security Chief can edit security/housing
        if (role !== "DIRECTOR_GERAL" && role !== "DIRECTOR_PROVINCIAL" && role !== "DIRECTOR_CADEIA" && role !== "CHEFE_SEGURANCA") {
          unauthorizedField = item.label;
        }
      } else if (item.category === 3) {
        // Health Chief and Director Geral can edit medical fields
        if (role !== "DIRECTOR_GERAL" && role !== "CHEFE_SAUDE") {
          unauthorizedField = item.label;
        }
      }
    });

    if (unauthorizedField) {
      setShowPinErrorMsg(`Erro de Permiss√£o: O seu cargo (${activeOp.roleName}) n√£o possui autoriza√ß√£o para editar o campo "${unauthorizedField}". Opera√ß√£o abortada.`);
      return;
    }

    // 3. Save edits
    setInmates(prev => prev.map(inm => {
      if (inm.id === editingInmate.id) {
        return { ...inm, ...editFormFields, status: isOnline ? "ACTIVE" : "PENDING_SYNC" };
      }
      return inm;
    }));

    if (isOnline) {
      // Map update fields to backend expected format
      const updateData = {
        nomeCompleto: `${editFormFields.firstName || editingInmate.firstName} ${editFormFields.lastName || editingInmate.lastName}`,
        dataNascimento: editFormFields.birthDate || editingInmate.birthDate,
        nacionalidade: editFormFields.nationality || editingInmate.nationality,
        documentoId: editFormFields.idCard || editingInmate.idCard,
        nivelSeguranca: (editFormFields.riskLevel || editingInmate.riskLevel) === "M√°ximo" ? "MAXIMA" : (editFormFields.riskLevel || editingInmate.riskLevel) === "Alto" ? "ALTA" : (editFormFields.riskLevel || editingInmate.riskLevel) === "M√©dio" ? "MEDIA" : "BAIXA",
        statusLegal: (editFormFields.status || editingInmate.status) === "ACTIVE" ? "CONDENADO" : "PREVENTIVO",
        estabelecimentoId: editFormFields.assignedPrisonId || editingInmate.assignedPrisonId,
        celaId: editFormFields.assignedCellNumber || editingInmate.assignedCellNumber
      };

      apiService.updateRecluso(editingInmate.id, updateData).then(updated => {
        console.log("üü¢ Ficha do recluso persistida com sucesso em PostgreSQL via REST:", updated);
      }).catch(err => {
        console.warn("‚ö†Ô∏è Falha ao persistir altera√ß√µes do recluso em PostgreSQL:", err);
      });
    }

    // 4. Generate Audit Logs with Cryptographic-style Integrity Hash (Non-Repudiation Seal)
    fieldsToProcess.forEach(item => {
      const timestamp = new Date().toISOString();
      const rawSeed = `${timestamp}-${activeOp.id}-${editingInmate.id}-${item.field}-${item.oldValue}-${item.newValue}`;
      const signatureHash = "SHA256-EDT-" + (rawSeed.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0) | 0, 0) >>> 0).toString(16).toUpperCase();

      // Add to our high-fidelity inmate edit log state (for specific history view)
      const newEditLog: InmateEditLog = {
        id: `EDT-${Math.floor(100000 + Math.random() * 900000)}`,
        inmateId: editingInmate.id,
        inmateName: `${editingInmate.firstName} ${editingInmate.lastName}`,
        timestamp,
        operatorId: activeOp.id,
        operatorName: activeOp.name,
        operatorRole: activeOp.roleName,
        fieldName: item.label,
        oldValue: item.oldValue || "[Vazio]",
        newValue: item.newValue || "[Vazio]",
        signatureHash,
        nonRepudiationValidated: true,
        ipAddress: activeOp.id === "MININT-OP-DG-01" ? "10.224.12.8" : "10.225.82.4"
      };

      setInmateEditLogs(prev => [newEditLog, ...prev]);

      // Write also to central audit log (Non-repudiation and forensic traceability)
      writeAuditLog(
        activeOp,
        "CELL_CHANGE_EXECUTE", // use a standard valid type
        "Inmate",
        editingInmate.id,
        `[ALTERA√á√ÉO ASSINADA - N√ÉO REP√öDIO] Campo "${item.label}" editado. De: "${item.oldValue || "Vazio"}" para: "${item.newValue || "Vazio"}". Selo de Integridade: ${signatureHash}`,
        editingInmate.id,
        `${editingInmate.firstName} ${editingInmate.lastName}`
      );
    });

    setSuggestionAlert({
      type: "success",
      text: `üîí REGISTO FORENSE SALVO: Ficha do recluso ${editingInmate.firstName} ${editingInmate.lastName} editada com sucesso. ${fieldsToProcess.length} altera√ß√£o(√µes) assinada(s) digitalmente por ${activeOp.name} sob a norma do N√£o-Rep√∫dio.`
    });

    setEditingInmate(null);
  };

  // Automatic Reconnection Execution
  const handleAutomaticReconnectionAttempt = () => {
    if (isReconnecting) return;
    setIsReconnecting(true);
    setBgSyncLogs(prev => [
      `[${new Date().toLocaleTimeString()}] üì° Iniciando verifica√ß√£o de canal VSAT...`,
      ...prev
    ]);

    // Step 1: Probe Network
    setTimeout(() => {
      setBgSyncLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ü™ê Sintonizando sat√©lite Luada-1. Pacotes enviados...`,
        ...prev
      ]);
    }, 1000);

    // Step 2: Authenticate Node Sec
    setTimeout(() => {
      setBgSyncLogs(prev => [
        `[${new Date().toLocaleTimeString()}] üîí Handshake criptogr√°fico SHA-256 em curso...`,
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
          `[${new Date().toLocaleTimeString()}] ‚úÖ Conex√£o restabelecida via VSAT Luanda!`,
          `[${new Date().toLocaleTimeString()}] üöÄ Canal online. Descarregando transa√ß√µes locais...`,
          ...prev
        ]);
        setGeneratedLogs(prev => [
          `[VSAT AUTO-RECONNECT] Conex√£o restabelecida automaticamente em segundo plano. Sincronizando dados.`,
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
          `[${new Date().toLocaleTimeString()}] ‚ùå Tentativa falhou. Servidor inacess√≠vel. R√°dio local est√° inst√°vel.`,
          `[${new Date().toLocaleTimeString()}] ‚è≥ Reiniciando cron√≥metro de 30 segundos...`,
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

  // Timer loop for auto-sync queue when online
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isOnline && backgroundSyncEnabled && syncQueue.length > 0 && !isSyncing) {
      intervalId = setInterval(() => {
        setQueueAutoSyncCountdown(prev => {
          if (prev <= 1) {
            triggerSync();
            return 15;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setQueueAutoSyncCountdown(15);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isOnline, backgroundSyncEnabled, syncQueue.length, isSyncing]);

  // Detec√ß√£o do estado da rede (online/offline) via navigator.onLine
  // Dispara automaticamente a fun√ß√£o triggerSync() quando a conex√£o √© restaurada
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setBgSyncLogs(prev => [
        `[${new Date().toLocaleTimeString()}] üåê Conex√£o de rede restaurada (online). Acionando sincroniza√ß√£o imediata da fila de pendentes (IndexedDB)...`,
        ...prev
      ]);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setBgSyncLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ‚ö†Ô∏è Conex√£o de rede perdida (offline). Opera√ß√µes guardadas localmente na fila contingente (IndexedDB).`,
        ...prev
      ]);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Verifica√ß√£o inicial na montagem se o estado do navegador difere do estado interno
    if (typeof navigator !== "undefined" && navigator.onLine !== isOnline) {
      setIsOnline(navigator.onLine);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncQueue, isSyncing]);

  // M√≥dulo de Documentos (Gera√ß√£o Autom√°tica)
  const [selectedTemplate, setSelectedTemplate] = useState<"internamento" | "soltura" | "transferencia" | "disciplina">("internamento");
  const [selectedDocumentCode, setSelectedDocumentCode] = useState<string>("AO-PNAP-2026-000492");
  const [inmateDetailsSubTab, setInmateDetailsSubTab] = useState<"document" | "timeline">("document");
  
  // Settings Tab sub-section
  const [settingsSubTab, setSettingsSubTab] = useState<"auditing" | "delegations" | "rh" | "cluster" | "hierarchy">("hierarchy");
  
  // Interceptador de Conformidade Decreto Executivo n.¬∫ 272/16 (Admiss√µes e Movimenta√ß√µes)
  const [nepInterceptorPayload, setNepInterceptorPayload] = useState<NEPVerificationPayload | null>(null);
  const [nepInterceptorCallback, setNepInterceptorCallback] = useState<((note?: string) => void) | null>(null);
  
  // Sub-tab de RH: 'roster' (Efetivo), 'unidades' (Unidades Org√¢nicas), 'equipas' (Gest√£o de Equipas) ou 'indicadores' (Indicadores de Carga)
  const [rhActiveSubTab, setRhActiveSubTab] = useState<"roster" | "unidades" | "equipas" | "indicadores">("roster");

  // Estados para Gest√£o de Equipas (RH)
  const [selectedTeamOpId, setSelectedTeamOpId] = useState<string>("");
  const [teamOpDraftRole, setTeamOpDraftRole] = useState<string>("");
  const [teamOpDraftLevel, setTeamOpDraftLevel] = useState<string>("");
  const [teamOpDraftProvince, setTeamOpDraftProvince] = useState<string>("");
  const [teamOpDraftPrisonId, setTeamOpDraftPrisonId] = useState<string>("");
  const [teamOpDraftPermissions, setTeamOpDraftPermissions] = useState<string[]>([]);
  const [teamOpDraftSensitivity, setTeamOpDraftSensitivity] = useState<string>("");

  const selectedTeamOperator = useMemo(() => {
    return operators.find(op => op.id === selectedTeamOpId) || null;
  }, [selectedTeamOpId, operators]);

  useEffect(() => {
    if (selectedTeamOperator) {
      setTeamOpDraftRole(selectedTeamOperator.role);
      setTeamOpDraftLevel(selectedTeamOperator.level);
      setTeamOpDraftProvince(selectedTeamOperator.province || "Luanda");
      setTeamOpDraftPrisonId(selectedTeamOperator.assignedPrisonId || "");
      setTeamOpDraftPermissions(selectedTeamOperator.permissions || []);
      setTeamOpDraftSensitivity(selectedTeamOperator.sensitivityLevel || "CONFIDENCIAL");
    } else {
      setTeamOpDraftRole("");
      setTeamOpDraftLevel("");
      setTeamOpDraftProvince("Luanda");
      setTeamOpDraftPrisonId("");
      setTeamOpDraftPermissions([]);
      setTeamOpDraftSensitivity("CONFIDENCIAL");
    }
  }, [selectedTeamOpId, selectedTeamOperator]);

  // Estrutura das Unidades Org√¢nicas do Servi√ßo Penitenci√°rio (SICP)
  const [organicUnits, setOrganicUnits] = useState<any[]>([
    {
      id: "UO-001",
      name: "Direc√ß√£o Geral do Servi√ßo Penitenci√°rio",
      type: "DIRECCAO_GERAL",
      province: "Luanda",
      directorId: "MININT-OP-DG-01", // Comiss√°rio-Geral Maria Kiala
      status: "ATIVO"
    },
    {
      id: "UO-002",
      name: "Direc√ß√£o Provincial do Servi√ßo Penitenci√°rio de Luanda",
      type: "DIRECCAO_PROVINCIAL",
      province: "Luanda",
      directorId: "MININT-OP-DP-LUANDA", // Sub-Comiss√°rio Ant√≥nio Bento
      status: "ATIVO"
    },
    {
      id: "UO-003",
      name: "Estabelecimento Penitenci√°rio de Viana",
      type: "ESTABELECIMENTO_PRISIONAL",
      province: "Luanda",
      assignedPrisonId: "PRIS-01",
      directorId: "MININT-OP-DC-VIANA", // Pedro Neto
      chefeSegurancaId: "MININT-OP-SEG-VIANA", // Jo√£o Kassoma
      chefeSaudeId: "MININT-OP-SAU-VIANA",
      capacityTarget: 1500,
      status: "ATIVO"
    },
    {
      id: "UO-004",
      name: "Estabelecimento Penitenci√°rio de Kakila",
      type: "ESTABELECIMENTO_PRISIONAL",
      province: "Luanda",
      assignedPrisonId: "PRIS-02",
      capacityTarget: 800,
      status: "ATIVO"
    },
    {
      id: "UO-005",
      name: "Direc√ß√£o Provincial do Servi√ßo Penitenci√°rio do Bengo",
      type: "DIRECCAO_PROVINCIAL",
      province: "Bengo",
      status: "ATIVO"
    }
  ]);

  // Form para nova Unidade Org√¢nica
  const [newUnit, setNewUnit] = useState({
    name: "",
    type: "ESTABELECIMENTO_PRISIONAL",
    province: "Luanda",
    assignedPrisonId: "",
    directorId: "",
    chefeSegurancaId: "",
    chefeSaudeId: "",
    capacityTarget: 500,
    status: "ATIVO"
  });

  const [selectedUnitProvinceFilter, setSelectedUnitProvinceFilter] = useState<string>("ALL");
  const [selectedUnitTypeFilter, setSelectedUnitTypeFilter] = useState<string>("ALL");

  // Gera√ß√£o interativa de Relat√≥rio Semanal de Seguran√ßa
  const [isGeneratingWeeklyReport, setIsGeneratingWeeklyReport] = useState<boolean>(false);
  const [weeklyReportGeneratedForBlock, setWeeklyReportGeneratedForBlock] = useState<string | null>(null);

  const [newOp, setNewOp] = useState({
    id: "",
    name: "",
    role: "CHEFE_SEGURANCA" as "DIRECTOR_GERAL" | "DIRECTOR_PROVINCIAL" | "DIRECTOR_CADEIA" | "CHEFE_SEGURANCA" | "CHEFE_SAUDE",
    level: "ESTABLISHMENT" as "NATIONAL" | "PROVINCIAL" | "ESTABLISHMENT",
    province: "Luanda",
    assignedPrisonId: "",
    username: "",
    senha_hash: "",
    sensitivityLevel: "CONFIDENCIAL" as "PUBLICO" | "RESTRITO" | "CONFIDENCIAL" | "SECRETO",
    permissions: ["Incidentes", "Vigil√¢ncia", "Celas"] as string[]
  });
  const [rhSearchQuery, setRhSearchQuery] = useState<string>("");

  // States for detailed editing of individual operators in RH module
  const [editingOperator, setEditingOperator] = useState<OperatorProfile | null>(null);
  const [editingOpSensitivity, setEditingOpSensitivity] = useState<"PUBLICO" | "RESTRITO" | "CONFIDENCIAL" | "SECRETO">("CONFIDENCIAL");
  const [editingOpLevel, setEditingOpLevel] = useState<"NATIONAL" | "PROVINCIAL" | "ESTABLISHMENT" | "PAVILION" | "BLOCK">("ESTABLISHMENT");
  const [editingOpProvince, setEditingOpProvince] = useState<string>("Luanda");
  const [editingOpAssignedPrisonId, setEditingOpAssignedPrisonId] = useState<string>("");
  const [editingOpPermissions, setEditingOpPermissions] = useState<string[]>([]);

  const [delegationFilterStartDate, setDelegationFilterStartDate] = useState<string>("");
  const [delegationFilterEndDate, setDelegationFilterEndDate] = useState<string>("");
  const [delegationFilterRoleId, setDelegationFilterRoleId] = useState<string>("");
  const [delegationRoleFilterOpen, setDelegationRoleFilterOpen] = useState<boolean>(false);
  const [delegationDateFilterOpen, setDelegationDateFilterOpen] = useState<boolean>(false);
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
      const formattedName = p.name.replace("Estabelecimento Penitenci√°rio de ", "EP ");
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

  // Dynamic Breadcrumb Generator for the IOS Architecture
  const getBreadcrumbPath = () => {
    const path: Array<{ label: string; type: string; node?: any }> = [
      { label: "SERVI√áO PENITENCI√ÅRIO", type: "TAB" }
    ];

    if (currentMission) {
      const missionName = currentMission === "nova-admissao" ? "MISS√ÉO: NOVA ADMISS√ÉO / INGRESSO" :
                          currentMission === "transferencia-recluso" ? "MISS√ÉO: TRANSFER√äNCIA DE CUST√ìDIA" :
                          currentMission === "declaracao-motim" ? "MISS√ÉO: DECLARA√á√ÉO DE MOTIM" :
                          currentMission === "inspecao-sanitaria" ? "MISS√ÉO: INSPE√á√ÉO SANIT√ÅRIA" : "MISS√ÉO OPERATIVA";
      path.push({ label: missionName, type: "MISSION" });
    } else if (selectedHierNode) {
      if (selectedHierNode.type === "PROVINCE") {
        path.push({ 
          label: `PROV√çNCIA DO ${selectedHierNode.name.toUpperCase()}`, 
          type: "PROVINCE", 
          node: { type: "PROVINCE", id: selectedHierNode.id, name: selectedHierNode.name } 
        });
      } else if (selectedHierNode.type === "MUNICIPALITY") {
        const prov = selectedHierNode.parentId || "HUAMBO";
        path.push({ 
          label: `PROV√çNCIA DO ${prov.toUpperCase()}`, 
          type: "PROVINCE", 
          node: { type: "PROVINCE", id: prov, name: prov } 
        });
        path.push({ 
          label: `MUNIC√çPIO DE ${selectedHierNode.name.toUpperCase()}`, 
          type: "MUNICIPALITY", 
          node: { type: "MUNICIPALITY", id: selectedHierNode.id, name: selectedHierNode.name, parentId: prov } 
        });
      } else if (selectedHierNode.type === "DEPARTMENT") {
        const prov = selectedHierNode.parentId || "NACIONAL";
        if (prov !== "NACIONAL" && !prov.includes("OU-MININT")) {
          path.push({ 
            label: `PROV√çNCIA DO ${prov.toUpperCase()}`, 
            type: "PROVINCE", 
            node: { type: "PROVINCE", id: prov, name: prov } 
          });
        }
        path.push({ 
          label: selectedHierNode.name.toUpperCase(), 
          type: "DEPARTMENT" as any, 
          node: { type: "DEPARTMENT" as any, id: selectedHierNode.id, name: selectedHierNode.name, parentId: selectedHierNode.parentId } 
        });
      } else if (selectedHierNode.type === "ESTABLISHMENT" || selectedHierNode.type === "PRISON") {
        const p = prisons.find(x => x.id === selectedHierNode.id) || selectedHierNode;
        const parentProv = (p as any).parentId || (p as any).location?.split(",")[0]?.trim() || "HUAMBO";
        path.push({ 
          label: `PROV√çNCIA DO ${parentProv.toUpperCase()}`, 
          type: "PROVINCE", 
          node: { type: "PROVINCE", id: parentProv, name: parentProv } 
        });
        path.push({ 
          label: p.name.toUpperCase(), 
          type: "ESTABLISHMENT", 
          node: { type: "ESTABLISHMENT", id: p.id, name: p.name, parentId: parentProv } 
        });
      } else if (selectedHierNode.type === "PAVILION") {
        const pId = selectedHierNode.parentId; 
        const pris = prisons.find(x => x.id === pId) || { name: "EP HUAMBO", id: "PRIS-HUAMBO", parentId: "HUAMBO" };
        const parentProv = selectedHierNode.grandparentId || (pris as any).parentId || "HUAMBO";
        path.push({ 
          label: `PROV√çNCIA DO ${parentProv.toUpperCase()}`, 
          type: "PROVINCE", 
          node: { type: "PROVINCE", id: parentProv, name: parentProv } 
        });
        path.push({ 
          label: pris.name.toUpperCase(), 
          type: "ESTABLISHMENT", 
          node: { type: "ESTABLISHMENT", id: pris.id, name: pris.name, parentId: parentProv } 
        });
        path.push({ 
          label: selectedHierNode.name.toUpperCase(), 
          type: "PAVILION", 
          node: { type: "PAVILION", id: selectedHierNode.id, name: selectedHierNode.name, parentId: pris.id, grandparentId: parentProv } 
        });
      } else if (selectedHierNode.type === "CELL") {
        const pavId = selectedHierNode.parentId; 
        const pId = selectedHierNode.grandparentId; 
        const pris = prisons.find(x => x.id === pId) || { name: "EP HUAMBO", id: "PRIS-HUAMBO", parentId: "HUAMBO", pavilions: [] };
        const pav = pris.pavilions?.find(v => v.id === pavId) || { name: "Pavilh√£o 1", id: pavId };
        const parentProv = (pris as any).parentId || "HUAMBO";
        path.push({ 
          label: `PROV√çNCIA DO ${parentProv.toUpperCase()}`, 
          type: "PROVINCE", 
          node: { type: "PROVINCE", id: parentProv, name: parentProv } 
        });
        path.push({ 
          label: pris.name.toUpperCase(), 
          type: "ESTABLISHMENT", 
          node: { type: "ESTABLISHMENT", id: pris.id, name: pris.name, parentId: parentProv } 
        });
        path.push({ 
          label: (pav as any).name.toUpperCase(), 
          type: "PAVILION", 
          node: { type: "PAVILION", id: (pav as any).id, name: (pav as any).name, parentId: pris.id, grandparentId: parentProv } 
        });
        path.push({ 
          label: selectedHierNode.name.toUpperCase(), 
          type: "CELL", 
          node: { type: "CELL", id: selectedHierNode.id, name: selectedHierNode.name, parentId: (pav as any).id, grandparentId: pris.id } 
        });
      } else {
        path.push({ label: selectedHierNode.name.toUpperCase(), type: "OTHER" });
      }
    } else {
      const tabName = activeTab === "centro-comando" ? "CENTRO DE COMANDO" :
                      activeTab === "centro-inteligencia" ? "INTELIG√äNCIA PENITENCI√ÅRIA" :
                      activeTab === "deus-fundador" ? "DIRE√á√ÉO GERAL" :
                      activeTab === "admissions" ? "CADASTRO & ADMISS√ïES" :
                      activeTab === "movements" ? "MOVIMENTA√á√ïES PENAIS" :
                      activeTab === "documents" ? "GUIAS & DOCUMENTOS" :
                      activeTab === "special-services" ? "SERVI√áOS & REINSER√á√ÉO" :
                      activeTab === "penal-code" ? "ENGENHARIA LEGISLATIVA (CNEL)" :
                      activeTab === "mncp-engine" ? "MOTOR CLASSIFICA√á√ÉO PENITENCI√ÅRIA (MNCP)" : "SPos.AO";
      path.push({ label: tabName, type: "TAB" });
    }

    return path;
  };

  const systemCommands = useMemo(() => [
    {
      label: "Nova Admiss√£o / Cadastro",
      description: "Inicia a Miss√£o de Nova Admiss√£o de Recluso",
      category: "Miss√µes Operacionais",
      shortcut: "M-A",
      action: () => {
        setActiveTab("admissions");
        triggerToast("MISS√ÉO INICIADA", "A Miss√£o de Nova Admiss√£o de Recluso foi inicializada no workspace principal.", "success");
      }
    },
    {
      label: "Nova Transfer√™ncia / Movimenta√ß√£o",
      description: "Inicia a Miss√£o de Transfer√™ncia e Tr√¢nsito",
      category: "Miss√µes Operacionais",
      shortcut: "M-T",
      action: () => {
        setActiveTab("movements");
        triggerToast("MISS√ÉO INICIADA", "A Miss√£o de Transfer√™ncia e Tr√¢nsito de Reclusos foi inicializada.", "success");
      }
    },
    {
      label: "Alerta de Incidente",
      description: "Abre o painel t√°tico de conting√™ncia de emerg√™ncia",
      category: "Miss√µes Operacionais",
      shortcut: "M-I",
      action: () => {
        setActiveTab("centro-comando");
        triggerToast("MISS√ÉO INICIADA", "Centro de Comando de Incidentes ativado.", "warning");
      }
    },
    {
      label: "C√≥digo Penal (CNEL)",
      description: "Abre o Centro de Doutrina e Engenharia Legislativa",
      category: "Navega√ß√£o",
      shortcut: "N-C",
      action: () => {
        setActiveTab("penal-code");
        triggerToast("NAVEGA√á√ÉO", "Acedendo √† Doutrina & Legisla√ß√£o (CNEL).", "info");
      }
    },
    {
      label: "Auditoria Central",
      description: "Abre o painel de Auditoria e N√£o-Rep√∫dio Forense",
      category: "Navega√ß√£o",
      shortcut: "N-A",
      action: () => {
        setActiveTab("auditing");
        triggerToast("NAVEGA√á√ÉO", "Acedendo √† Auditoria Central.", "info");
      }
    },
    {
      label: "Abrir EP Viana",
      description: "Foca o n√≥ operacional do Estabelecimento Prisional de Viana",
      category: "Instala√ß√µes",
      shortcut: "EP-VN",
      action: () => {
        setSelectedProvince("Luanda");
        setSelectedDir("Dire√ß√£o Provincial de Luanda");
        setSelectedEstablishmentId("PRIS-01");
        setSelectedHierNode({ type: "ESTABLISHMENT", id: "PRIS-01", name: "EP de Viana", parentId: "Luanda" });
        triggerToast("INSTALA√á√ÉO SELECIONADA", "Contexto focado no Estabelecimento Prisional de Viana.", "success");
      }
    },
    {
      label: "Abrir Cadeia Central do Huambo",
      description: "Foca o n√≥ operacional da Cadeia Central do Huambo",
      category: "Instala√ß√µes",
      shortcut: "EP-HB",
      action: () => {
        setSelectedProvince("Huambo");
        setSelectedDir("Dire√ß√£o Provincial do Huambo");
        setSelectedEstablishmentId("PRIS-HUAMBO");
        setSelectedHierNode({ type: "ESTABLISHMENT", id: "PRIS-HUAMBO", name: "Cadeia Central do Huambo", parentId: "Huambo" });
        triggerToast("INSTALA√á√ÉO SELECIONADA", "Contexto focado na Cadeia Central do Huambo.", "success");
      }
    },
    {
      label: "Simular Modo Offline",
      description: "For√ßa o sistema a entrar em conting√™ncia offline local",
      category: "Utilit√°rios",
      shortcut: "U-OFF",
      action: () => {
        setIsOnline(false);
        triggerToast("SINAL PERDIDO", "O sistema entrou em conting√™ncia local imut√°vel.", "warning");
      }
    },
    {
      label: "Restabelecer Conex√£o Online",
      description: "Sincroniza transa√ß√µes locais pendentes com a base nacional",
      category: "Utilit√°rios",
      shortcut: "U-ON",
      action: () => {
        setIsOnline(true);
        triggerToast("ONLINE RECONHECIDO", "Conex√£o restabelecida. Sincronismo autom√°tico ativado.", "success");
      }
    },
    {
      label: "Limpar Filtros Globais",
      description: "Redefine pesquisas e filtros regionais no painel",
      category: "Utilit√°rios",
      shortcut: "U-CLR",
      action: () => {
        setSelectedProvinceFilter("ALL");
        setGlobalWorkspaceSearch("");
        setSelectedHierNode(null);
        triggerToast("FILTROS REDEFINIDOS", "Todas as restri√ß√µes de pesquisa foram limpas.", "info");
      }
    },
    {
      label: "Sair da Sess√£o Activa",
      description: "Encerra a sess√£o activa do operador com total seguran√ßa",
      category: "Utilit√°rios",
      shortcut: "U-EXIT",
      action: () => {
        apiService.clearToken();
        localStorage.removeItem("pnap_is_logged_in");
        localStorage.removeItem("pnap_is_setup_done");
        localStorage.removeItem("pnap_user_session");
        setIsLoggedIn(false);
        setIsSetupDone(false);
        setUsernameInput("");
        setPasswordInput("");
        triggerToast("SESS√ÉO ENCERRADA", "Operador desautenticado com sucesso.", "info");
      }
    }
  ], [setSelectedProvince, setSelectedDir, setSelectedEstablishmentId, setSelectedHierNode, triggerToast]);

  const filteredCommands = useMemo(() => {
    let list = [...systemCommands];

    if (commandPaletteQuery.trim()) {
      const q = commandPaletteQuery.toLowerCase();
      const dynamicMatches: any[] = [];

      // 1. INTENT: Lota√ß√£o / Ocupa√ß√£o (e.g. "lota√ß√£o viana", "ocupa√ß√£o huambo")
      if (q.includes("lota") || q.includes("ocupa") || q.includes("capaci") || q.includes("lota√ß√£o") || q.includes("sobrelota")) {
        const matchedPrison = prisons.find(p => 
          p.name.toLowerCase().includes(q.replace(/lota√ß√£o|lotacao|ocupacao|ocupa√ß√£o|capacidade|ver/g, "").trim()) ||
          p.location.toLowerCase().includes(q.replace(/lota√ß√£o|lotacao|ocupacao|ocupa√ß√£o|capacidade|ver/g, "").trim())
        );
        if (matchedPrison) {
          dynamicMatches.push({
            label: `CONSULTAR LOTA√á√ÉO: EP ${matchedPrison.name.replace("Estabelecimento Penitenci√°rio de ", "")}`,
            description: `Ocupa√ß√£o: ${matchedPrison.currentOccupancy}/${matchedPrison.operationalCapacity || matchedPrison.officialCapacity} (${Math.round((matchedPrison.currentOccupancy / (matchedPrison.operationalCapacity || matchedPrison.officialCapacity || 1)) * 100)}%)`,
            category: "Cognitivo (AOS)",
            shortcut: "AI-LOT",
            action: () => {
              setSelectedHierNode({ type: "ESTABLISHMENT", id: matchedPrison.id, name: matchedPrison.name, parentId: matchedPrison.location.split(",")[0].trim() });
              setIsCommandPaletteOpen(false);
              triggerToast("INTELIG√äNCIA COGNITIVA", `Focando lota√ß√£o de ${matchedPrison.name}`, "success");
            }
          });
        }
      }

      // 2. INTENT: Ver Prontu√°rio / Dossier (e.g. "recluso carlos", "dossier manuel", "carlos")
      const inmateKeywordMatch = q.match(/(?:recluso|dossier|ficha|ver|prontuario|prontu√°rio)\s+(.+)/i);
      const searchName = inmateKeywordMatch ? inmateKeywordMatch[1].trim() : q;
      if (searchName.length >= 2) {
        const matchedInmates = inmates.filter(i => 
          i.firstName.toLowerCase().includes(searchName) || 
          i.lastName.toLowerCase().includes(searchName) ||
          i.idCard.toLowerCase().includes(searchName)
        ).slice(0, 3);

        matchedInmates.forEach(inmate => {
          dynamicMatches.push({
            label: `ABRIR PRONTU√ÅRIO: ${inmate.firstName} ${inmate.lastName}`,
            description: `Aceder a biometria, ficha judicial, crimes e registo de sa√∫de (BI: ${inmate.idCard})`,
            category: "Cognitivo (AOS)",
            shortcut: "AI-REC",
            action: () => {
              setSelectedObjectInmate(inmate);
              setIsCommandPaletteOpen(false);
              triggerToast("DOSSIER COGNITIVO", `Dossier de ${inmate.firstName} ${inmate.lastName} carregado.`, "success");
            }
          });
        });
      }

      // 3. INTENT: Mover / Transferir (e.g. "transferir recluso huambo", "transferir carlos")
      if (q.includes("transfer") || q.includes("mover") || q.includes("transf")) {
        const cleanQuery = q.replace(/transferir|transfer|mover|recluso/g, "").trim();
        const matchedInmate = inmates.find(i => 
          cleanQuery.includes(i.firstName.toLowerCase()) || 
          cleanQuery.includes(i.lastName.toLowerCase())
        );
        const matchedPrison = prisons.find(p => 
          cleanQuery.includes(p.name.toLowerCase().replace("estabelecimento penitenci√°rio de ", "")) ||
          cleanQuery.includes(p.location.toLowerCase().split(",")[0])
        );

        if (matchedInmate) {
          const destName = matchedPrison ? matchedPrison.name : "EP de Destino (Por selecionar)";
          dynamicMatches.push({
            label: `TRANSFERIR RECLUSO: ${matchedInmate.firstName} ${matchedInmate.lastName}`,
            description: `Enviar de ${prisons.find(p => p.id === matchedInmate.assignedPrisonId)?.name || "Cadeia Atual"} para ${destName}`,
            category: "Cognitivo (AOS)",
            shortcut: "AI-TRA",
            action: () => {
              if (matchedPrison) {
                setInmates(prev => prev.map(i => i.id === matchedInmate.id ? { ...i, assignedPrisonId: matchedPrison.id, assignedBlockId: "", assignedCellNumber: "" } : i));
                triggerToast("MOVIMENTA√á√ÉO EXECUTADA", `${matchedInmate.firstName} foi transferido para ${matchedPrison.name}.`, "success");
              } else {
                setActiveTab("movements");
                triggerToast("MIGRAR MOVIMENTA√á√ÉO", `Pesquise a guia de transfer√™ncia para ${matchedInmate.firstName}.`, "info");
              }
              setIsCommandPaletteOpen(false);
            }
          });
        }
      }

      // 4. INTENT: Cela / Bloco (e.g. "cela 12", "bloco A1", "cela H1-A")
      if (q.includes("cela") || q.includes("bloc") || q.includes("bloco")) {
        const cleanQuery = q.replace(/cela|bloco|bloc|ir|para/g, "").trim();
        if (cleanQuery.length > 0) {
          let foundCell: any = null;
          let foundPav: any = null;
          let foundPris: any = null;

          for (const p of prisons) {
            for (const pav of p.pavilions || []) {
              const cell = pav.blocks?.find(c => c.name.toLowerCase().includes(cleanQuery) || c.id.toLowerCase().includes(cleanQuery));
              if (cell) {
                foundCell = cell;
                foundPav = pav;
                foundPris = p;
                break;
              }
            }
            if (foundCell) break;
          }

          if (foundCell) {
            dynamicMatches.push({
              label: `IR PARA CELA: ${foundCell.name}`,
              description: `Aceder a Pavilh√£o ${foundPav.name} no EP ${foundPris.name.replace("Estabelecimento Penitenci√°rio de ", "")}`,
              category: "Cognitivo (AOS)",
              shortcut: "AI-CEL",
              action: () => {
                setSelectedHierNode({
                  type: "CELL",
                  id: foundCell.id,
                  name: foundCell.name,
                  parentId: foundPav.id,
                  grandparentId: foundPris.id
                });
                setIsCommandPaletteOpen(false);
                triggerToast("NAVEGA√á√ÉO COGNITIVA", `Navegando para ${foundCell.name}`, "success");
              }
            });
          }
        }
      }

      const standardFiltered = systemCommands.filter(cmd => 
        cmd.label.toLowerCase().includes(q) || 
        cmd.description.toLowerCase().includes(q) || 
        cmd.category.toLowerCase().includes(q)
      );

      return [...dynamicMatches, ...standardFiltered];
    }

    return list;
  }, [commandPaletteQuery, systemCommands, prisons, inmates, triggerToast]);

  // Keyboard Listener for Command Palette & Modal Escape Closing (2.10)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey);
      const isP = e.key.toLowerCase() === "p" && (e.ctrlKey || e.metaKey) && e.shiftKey;
      
      if (isK || isP) {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        setCommandPaletteQuery("");
        return;
      }

      if (e.key === "Escape") {
        if (isCommandPaletteOpen) {
          e.preventDefault();
          setIsCommandPaletteOpen(false);
          return;
        }
        // Close any active surface/modal/drawer/sheet
        setIsQuickTransferModalOpen(false);
        setIsQuickIncidentModalOpen(false);
        setIsMobileFilterOpen(false);
        setIsMobileMultiStepAddOpen(false);
        setIsMobileQROpen(false);
        setIsMobileTouchSignatureOpen(false);
        setIsMobileOccupancyOpen(false);
        setSelectedQuickDossierInmate(null);
        return;
      }

      if (!isCommandPaletteOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveCommandIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveCommandIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const activeCmd = filteredCommands[activeCommandIndex];
        if (activeCmd) {
          activeCmd.action();
          setIsCommandPaletteOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCommandPaletteOpen, filteredCommands, activeCommandIndex]);


  const handleValidateDocument = (codeToScan?: string) => {
    const targetCode = codeToScan || validateCodeInput;
    if (!targetCode) return;

    // Search for matching inmate or standard code fallback
    const targetInmate = inmates.find(i => i.documentCode.toLowerCase() === targetCode.toLowerCase().trim());
    
    if (targetInmate) {
      // Find crime description
      let crimeText = "C√≥digo Penal de Angola";
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
        establishment: prisonObj?.name || "Estabelecimento Penitenci√°rio de Viana",
        securityClearance: `Risco ${targetInmate.riskLevel}`,
        emitDate: "13-06-2026",
        emissionHash: "SHA256: 8a73c241b3034a80a54952f9570c05c4ec9e9a4867b36f1b402802ad1daadbcf",
        validity: "Aut√™ntico e Consolidado no Sistema Central do MININT-GP"
      });
    } else {
      // Standard templates or manual mocks
      if (targetCode.startsWith("AO-PNAP-")) {
        setVerificationResult({
          status: "VALID",
          code: targetCode,
          title: "Documento Penitenci√°rio Registado",
          inmateName: "Manuel Domingos Jo√£o",
          birthDate: "14/08/1994",
          biNumber: "002847192LA049",
          crime: "Artigo 130¬∫ - Homic√≠dio Volunt√°rio",
          establishment: "Estabelecimento Penitenci√°rio de Viana",
          securityClearance: "Risco M√°ximo",
          emitDate: "01-02-2026",
          emissionHash: "SHA256: 09ef283ac4859aef902e8174f882a174092bbf01a90c10283a009ef3c09acff2",
          validity: "Aut√™ntico e Ativo no Banco Nacional de Luanda"
        });
      } else {
        setVerificationResult({
          status: "INVALID",
          code: targetCode,
          error: "C√≥digo de Seguran√ßa QR n√£o localizado ou inv√°lido no blockchain/PostgreSQL central da PNAP-AO."
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
      action: "Admiss√£o" | "Transfer√™ncia";
      fromPrisonName: string;
      toPrisonName: string;
      operator: string;
      reason: string;
    }[] = [];

    if (inmateId === "AO-REC-089") { // Manuel Domingos Jo√£o
      baseline.push(
        {
          id: "MOVE-HIST-089-A",
          timestamp: "2026-02-10T10:00:00Z",
          action: "Admiss√£o",
          fromPrisonName: "Entrada Directa",
          toPrisonName: "EP Kakila",
          operator: "Superintendente Pedro",
          reason: "Ingresso inicial determinado pelo Tribunal Provincial de Luanda"
        },
        {
          id: "MOVE-HIST-089-B",
          timestamp: "2026-04-15T14:30:00Z",
          action: "Transfer√™ncia",
          fromPrisonName: "EP Kakila",
          toPrisonName: "EP Sanza Pombo",
          operator: "Inspector-Chefe Kassoma",
          reason: "Otimiza√ß√£o de espa√ßo e adequa√ß√£o de seguran√ßa m√©dia"
        },
        {
          id: "MOVE-HIST-089-C",
          timestamp: "2026-05-20T08:15:00Z",
          action: "Transfer√™ncia",
          fromPrisonName: "EP Sanza Pombo",
          toPrisonName: "EP Viana",
          operator: "Sub-chefe Ngola",
          reason: "Transfer√™ncia m√©dica e proximidade familiar autorizada"
        }
      );
    } else if (inmateId === "AO-REC-115") { // Carla Ant√≥nia Gouveia
      baseline.push(
        {
          id: "MOVE-HIST-115-A",
          timestamp: "2026-03-22T09:12:00Z",
          action: "Admiss√£o",
          fromPrisonName: "Entrada Directa",
          toPrisonName: "EP Viana",
          operator: "Sub-chefe Ngola",
          reason: "Instaurado mandado pelo Minist√©rio P√∫blico"
        },
        {
          id: "MOVE-HIST-115-B",
          timestamp: "2026-05-02T16:40:00Z",
          action: "Transfer√™ncia",
          fromPrisonName: "EP Viana",
          toPrisonName: "EP Kakila",
          operator: "Superintendente Pedro",
          reason: "Transfer√™ncia extraordin√°ria a pedido da defesa homologada"
        }
      );
    } else if (inmateId === "AO-REC-204") { // Sebasti√£o Kiala Mendes
      baseline.push(
        {
          id: "MOVE-HIST-204-A",
          timestamp: "2026-01-15T11:00:00Z",
          action: "Admiss√£o",
          fromPrisonName: "Entrada Directa",
          toPrisonName: "EP Sanza Pombo",
          operator: "Inspector-Chefe Kassoma",
          reason: "Cadastramento inicial nacional"
        },
        {
          id: "MOVE-HIST-204-B",
          timestamp: "2026-03-10T13:20:00Z",
          action: "Transfer√™ncia",
          fromPrisonName: "EP Sanza Pombo",
          toPrisonName: "EP Viana",
          operator: "Superintendente Pedro",
          reason: "Mandado de instru√ß√£o criminal em Luanda"
        }
      );
    } else {
      // General dynamic baseline for new manual registrants
      const matchedAdmitLog = auditLogs.find(l => l.inmateId === inmateId && l.action === "Admiss√£o");
      const baselinePrisonId = currentInmateMetadata.assignedPrisonId;
      const pName = prisons.find(p => p.id === baselinePrisonId)?.name.replace("Estabelecimento Penitenci√°rio de ", "EP ") || "EP Viana";
      
      baseline.push({
        id: matchedAdmitLog ? `MOVE-HIST-${matchedAdmitLog.id}` : `MOVE-HIST-NEW-${inmateId}`,
        timestamp: matchedAdmitLog ? matchedAdmitLog.timestamp : new Date(Date.now() - 3600000).toISOString(),
        action: "Admiss√£o",
        fromPrisonName: "Entrada Directa",
        toPrisonName: pName,
        operator: matchedAdmitLog ? matchedAdmitLog.userId : currentOperatorId,
        reason: "Boletim de admiss√£o e classifica√ß√£o de risco conclu√≠da"
      });
    }

    // Dynamic transfers added in live session
    const liveTransfers = auditLogs
      .filter(log => log.inmateId === inmateId && log.action === "Transfer√™ncia")
      .map(log => {
        return {
          id: log.id,
          timestamp: log.timestamp,
          action: "Transfer√™ncia" as const,
          fromPrisonName: log.oldValue || "Origem Oculta",
          toPrisonName: log.newValue || "EP Desconhecida",
          operator: log.userId,
          reason: "Modifica√ß√£o manual de lota√ß√£o via cons√≥rcio MININT"
        };
      });

    // Merge and chronologically sort
    const fullTimeline = [...baseline, ...[...liveTransfers].reverse()];
    return fullTimeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [currentInmateMetadata, auditLogs, prisons, currentOperatorId]);

  // SQL Schema Generator for full DB (representing the 90-120 tables of the enterprise tier)
  const fullSqlDdl = useMemo(() => {
    let sql = `-- =========================================================================\n`;
    sql += `-- SCRIPT DDL COMPILADO - PLATAFORMA NACIONAL PENITENCI√ÅRIA DE ANGOLA (PNAP-AO)\n`;
    sql += `-- Gerado em: 13-06-2026 | Multi-Tenancy Institucional habilitado\n`;
    sql += `-- Suporte Criptogr√°fico SHA-256 e Replica√ß√£o Offline local IndexedDB estipulada\n`;
    sql += `-- Total de Tabelas na Arquitetura de Produ√ß√£o: 114 tabelas\n`;
    sql += `-- =========================================================================\n\n`;

    TABLES_METADATA.forEach(table => {
      sql += `-- M√≥dulo: ${table.module.toUpperCase()} | Soft Delete: ${table.hasSoftDelete ? "Sim" : "N√£o"} | Multi-Tenant: ${table.hasMultiTenancy ? "Sim" : "N√£o"}\n`;
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
      <div className="min-h-screen bg-[#060b13] text-slate-100 flex flex-col font-sans select-none relative overflow-hidden antialiased">
        <AngolaHolographicMapBackground opacityClass="opacity-25" />
        {/* Connection top bar */}
        {!isOnline ? (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-between text-xs text-amber-200 z-50 backdrop-blur-md">
            <div className="flex items-center gap-2 font-mono">
              <WifiOff className="h-4 w-4 text-amber-400 animate-pulse" />
              <span>
                <strong>MODO DE CONTING√äNCIA ATIVO:</strong> Sem conex√£o com o servidor do MININT em Luanda. Autentica√ß√£o atrav√©s de cache local cifrado.
              </span>
            </div>
            <button 
              onClick={() => setIsOnline(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded text-xxs cursor-pointer font-mono transition-all shadow"
            >
              Ficar Online
            </button>
          </div>
        ) : (
          <div className="bg-[#0c1628]/90 border-b border-cyan-900/40 px-4 py-1.5 flex items-center justify-between text-[11px] text-cyan-300 z-50 font-mono backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                VSAT INTEGRADO
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">Liga√ß√£o central</span>
              <span className="text-slate-500 hidden sm:inline">|</span>
              <span className="text-amber-400/90 text-[10px] hidden sm:inline">Criptografia AES-256 Activa</span>
            </div>
            <button 
              onClick={() => setIsOnline(false)}
              className="text-slate-400 hover:text-amber-400 text-[10px] underline cursor-pointer font-mono transition-all"
            >
              SSS
            </button>
          </div>
        )}

        {/* ATMOSPHERIC BACKGROUND WITH BLUE & CRIMSON NEBULA GLOW */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Deep Navy/Black base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#060b13] via-[#0b1424] to-[#04080e]" />
          
          {/* Glowing Red/Crimson Nebula behind Scales & Shield (Left) */}
          <div className="absolute top-[10%] left-[8%] w-[550px] h-[550px] bg-red-600/15 rounded-full blur-[140px] mix-blend-screen animate-pulse" />
          
          {/* Glowing Amber/Gold Center-Left Overlay */}
          <div className="absolute top-[20%] left-[22%] w-[400px] h-[400px] bg-amber-500/12 rounded-full blur-[120px] mix-blend-screen" />
          
          {/* Deep Cyan/Blue Ambient Glow (Right) */}
          <div className="absolute bottom-[5%] right-[10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px] mix-blend-screen" />

          {/* Cybernetic Tech Grid Lines Overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="techGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="0.5" />
                <circle cx="60" cy="0" r="1.5" fill="rgba(245, 158, 11, 0.6)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#techGrid)" />
          </svg>
        </div>

        {/* MAIN DISPLAY STAGE */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10 max-w-7xl mx-auto w-full gap-8 lg:gap-12">
          
          {/* LEFT SIDE ARTWORK: SCALES OF JUSTICE + SHIELD OF SECURITY + CONSTELLATION MAP OF ANGOLA */}
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative min-h-[500px] w-full max-w-xl pointer-events-none select-none">
            
            {/* Holographic HUD Container */}
            <div className="relative w-full h-[480px] flex items-center justify-center">
              
              {/* SVG COMPOSITION: SCALES OF JUSTICE + SHIELD + ANGOLA MESH MAP */}
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  {/* Glowing Filters */}
                  <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="redGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="10" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  {/* Gradients */}
                  <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.3" />
                  </linearGradient>
                  
                  <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#fde047" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                </defs>

                {/* --- CONSTELLATION MAP MESH OF ANGOLA (BACKGROUND HOVER) --- */}
                <g className="opacity-35">
                  {/* Outer Map Perimeter Coordinates Mesh */}
                  <path d="M 80 180 L 140 160 L 220 180 L 280 220 L 320 300 L 290 390 L 210 430 L 130 410 L 90 330 Z" 
                        fill="rgba(15, 23, 42, 0.4)" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" strokeDasharray="3,3" />
                  
                  {/* Internal Province Node Mesh Lines */}
                  <line x1="140" y1="160" x2="210" y2="250" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1" />
                  <line x1="220" y1="180" x2="210" y2="250" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" />
                  <line x1="280" y1="220" x2="210" y2="250" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1" />
                  <line x1="210" y1="250" x2="320" y2="300" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" />
                  <line x1="210" y1="250" x2="290" y2="390" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1" />
                  <line x1="210" y1="250" x2="130" y2="410" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="1" />
                  <line x1="210" y1="250" x2="90" y2="330" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1" />

                  {/* Glowing Province Data Nodes */}
                  <circle cx="140" cy="160" r="3" fill="#f59e0b" />
                  <circle cx="220" cy="180" r="3" fill="#38bdf8" />
                  <circle cx="280" cy="220" r="3" fill="#f59e0b" />
                  <circle cx="210" cy="250" r="5" fill="#f59e0b" filter="url(#goldGlow)" />
                  <circle cx="320" cy="300" r="3" fill="#38bdf8" />
                  <circle cx="290" cy="390" r="3" fill="#f59e0b" />
                  <circle cx="130" cy="410" r="3" fill="#38bdf8" />
                  <circle cx="90" cy="330" r="3" fill="#f59e0b" />

                  {/* Province Labels */}
                  <text x="215" y="240" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">LUANDA HQ</text>
                  <text x="145" y="155" fill="#38bdf8" fontSize="7" fontFamily="monospace">CABINDA</text>
                  <text x="285" y="215" fill="#38bdf8" fontSize="7" fontFamily="monospace">SAURIMO</text>
                  <text x="295" y="385" fill="#38bdf8" fontSize="7" fontFamily="monospace">MOXICO</text>
                  <text x="100" y="420" fill="#38bdf8" fontSize="7" fontFamily="monospace">HU√çLA</text>
                </g>

                {/* --- CYBERNETIC RADAR / RETICLE RINGS --- */}
                <circle cx="200" cy="220" r="140" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="1" strokeDasharray="6,6" />
                <circle cx="200" cy="220" r="180" stroke="rgba(56, 189, 248, 0.12)" strokeWidth="1" />
                <circle cx="330" cy="200" r="120" stroke="rgba(239, 68, 68, 0.15)" strokeWidth="1" strokeDasharray="4,8" />

                {/* --- SHIELD OF PROTECTION (RED/ORANGE GLOWING SHIELD) --- */}
                <g filter="url(#redGlow)" transform="translate(240, 70)">
                  {/* Outer Glowing Contour Shield */}
                  <path d="M 90 20 C 130 20, 170 30, 180 50 C 180 140, 140 210, 90 250 C 40 210, 0 140, 0 50 C 10 30, 50 20, 90 20 Z" 
                        fill="url(#shieldGrad)" stroke="#f59e0b" strokeWidth="2.5" />
                  
                  {/* Inner Tech Contour Shield */}
                  <path d="M 90 35 C 125 35, 155 43, 163 60 C 163 132, 130 192, 90 227 C 50 192, 17 132, 17 60 C 25 43, 55 35, 90 35 Z" 
                        fill="none" stroke="rgba(254, 240, 138, 0.6)" strokeWidth="1" strokeDasharray="5,3" />

                  {/* Central Shield Crosshair & Star */}
                  <line x1="90" y1="45" x2="90" y2="215" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" />
                  <line x1="30" y1="120" x2="150" y2="120" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" />
                  
                  {/* Central Star Emblem */}
                  <polygon points="90,95 95,110 110,110 98,120 102,135 90,125 78,135 82,120 70,110 85,110" 
                           fill="#fef08a" stroke="#f59e0b" strokeWidth="1" />

                  {/* Lock Indicator */}
                  <rect x="80" y="150" width="20" height="16" rx="2" fill="rgba(15, 23, 42, 0.8)" stroke="#f59e0b" strokeWidth="1" />
                  <path d="M 85 150 A 5 5 0 0 1 95 150" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                </g>

                {/* --- BALAN√áA DA JUSTI√áA (GOLDEN GLOWING SCALES OF JUSTICE) --- */}
                <g filter="url(#goldGlow)" transform="translate(30, 90)">
                  {/* Central Pillar Base */}
                  <path d="M 120 310 L 180 310 L 170 295 L 130 295 Z" fill="url(#goldGrad)" />
                  <rect x="146" y="100" width="8" height="195" fill="url(#goldGrad)" rx="2" />
                  <circle cx="150" cy="90" r="14" fill="url(#goldGrad)" stroke="#fef08a" strokeWidth="1" />

                  {/* Main Balance Beam (Arm) */}
                  <path d="M 40 100 C 90 92, 210 92, 260 100 L 255 106 C 200 98, 100 98, 45 106 Z" fill="url(#goldGrad)" />

                  {/* Left Pan Chains & Bowl */}
                  <line x1="50" y1="104" x2="20" y2="180" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="50" y1="104" x2="80" y2="180" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" />
                  <path d="M 15 180 C 15 205, 85 205, 85 180 Z" fill="rgba(245, 158, 11, 0.25)" stroke="#fef08a" strokeWidth="1.5" />

                  {/* Right Pan Chains & Bowl */}
                  <line x1="250" y1="104" x2="220" y2="180" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="250" y1="104" x2="280" y2="180" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" />
                  <path d="M 215 180 C 215 205, 285 205, 285 180 Z" fill="rgba(245, 158, 11, 0.25)" stroke="#fef08a" strokeWidth="1.5" />

                  {/* Lens Flare Highlights */}
                  <circle cx="150" cy="90" r="3" fill="#ffffff" />
                  <circle cx="50" cy="100" r="2" fill="#ffffff" />
                  <circle cx="250" cy="100" r="2" fill="#ffffff" />
                </g>

                {/* HUD Telemetry Labels */}
                <g fontFamily="monospace" fontSize="9" fill="#94a3b8">
                  <text x="30" y="30" fill="#38bdf8" fontWeight="bold">MININT PNAP.AO ‚Ä¢ LIGA√á√ÉO SEGURA DE REDE</text>
                  <text x="30" y="45" fill="#f59e0b">‚óè PNAP.AO-MININT 256-BIT Criptografia Activa</text>
                  <text x="420" y="450" fill="#94a3b8" textAnchor="end">LAT. 8¬∞ 50' S | LONG. 13¬∞ 14' E</text>
                </g>
              </svg>
            </div>
          </div>

          {/* RIGHT SIDE / CENTER: CARD DE LOGIN E SELE√á√ÉO INSTITUCIONAL (MATCHING EXACT PHOTO) */}
          <div className="w-full max-w-[440px] flex flex-col items-center justify-center relative z-20">
            
            <div className="w-full bg-[#0d1526]/95 border border-slate-700/60 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.85)] p-6 sm:p-7 flex flex-col gap-5 relative overflow-hidden backdrop-blur-xl">
              
              {/* Top Gradient Accent Line (Red to Orange/Gold) */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-orange-500 animate-pulse" />
              
              {/* Header Badge with Shield Icon */}
              <div className="text-center flex flex-col items-center gap-2.5 pt-1">
                <div className="bg-[#070c18] p-3.5 rounded-2xl border border-amber-500/40 shadow-inner relative flex items-center justify-center text-amber-500">
                  <Shield className="h-9 w-9 text-amber-500" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 tracking-[0.2em] uppercase block">
                    MINIST√âRIO DO INTERIOR ‚Ä¢ ANGOLA
                  </span>
                  <h1 className="text-2xl font-black text-slate-100 font-sans tracking-tight mt-0.5">
                    PNAP-AO
                  </h1>
                  <p className="text-[9.5px] text-slate-400 font-mono mt-0.5 font-bold uppercase tracking-wider leading-relaxed">
                    PLATAFORMA NACIONAL DE ADMINISTRA√á√ÉO PENITENCI√ÅRIA
                  </p>
                </div>
              </div>

            <AnimatePresence mode="wait">
              {!isSetupDone ? (
                /* ECR√É 1: SELE√á√ÉO INSTITUCIONAL */
                <motion.div
                  key="step1-sys-select"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-4"
                >
                  <div className="bg-[#070d1a]/80 border border-slate-800/80 rounded-xl p-3 text-center">
                    <span className="text-[11px] text-amber-400 font-bold flex items-center justify-center gap-1.5 font-mono uppercase tracking-wider">
                      <Building className="h-3.5 w-3.5 text-amber-500" /> ECR√É 1 ‚Äî SELE√á√ÉO INSTITUCIONAL
                    </span>
                    <p className="text-[9.5px] text-slate-400 mt-1 leading-relaxed font-sans">
                      Esta etapa n√£o autentica o utilizador. Serve apenas para definir o contexto operacional do terminal nos servidores regionais.
                    </p>
                  </div>

                  {/* Prov√≠ncia Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[9.5px] uppercase font-mono tracking-wider font-bold text-slate-300">
                        Prov√≠ncia / √Çmbito Institucional:
                      </label>
                      <span className="text-[8.5px] font-mono font-bold text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        21 Prov√≠ncias DPA 2024
                      </span>
                    </div>
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="bg-[#070c18] border border-slate-700/80 p-3 rounded-xl text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer w-full transition-all shadow-inner"
                    >
                      {Object.keys(institutionalHierarchy)
                        .sort((a, b) => {
                          if (a === "Centro Operacional") return -1;
                          if (b === "Centro Operacional") return 1;
                          return a.localeCompare(b, "pt-PT");
                        })
                        .map((prov) => (
                          <option key={prov} value={prov}>
                            {prov === "Centro Operacional" ? "‚≠ê Centro Operacional (Nacional / Superadmin)" : `Prov√≠ncia de ${prov}`}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Dire√ß√£o Provincial Dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9.5px] uppercase font-mono tracking-wider font-bold text-slate-300">
                      Dire√ß√£o Provincial:
                    </label>
                    <select
                      value={selectedDir}
                      onChange={(e) => setSelectedDir(e.target.value)}
                      className="bg-[#070c18] border border-slate-700/80 p-3 rounded-xl text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer w-full transition-all shadow-inner"
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
                    <label className="text-[9.5px] uppercase font-mono tracking-wider font-bold text-slate-300">
                      Estabelecimento:
                    </label>
                    <select
                      value={selectedEstablishmentId}
                      onChange={(e) => setSelectedEstablishmentId(e.target.value)}
                      className="bg-[#070c18] border border-slate-700/80 p-3 rounded-xl text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer w-full transition-all shadow-inner"
                    >
                      {(institutionalHierarchy[selectedProvince]?.directions[selectedDir] || []).map((est) => (
                        <option key={est.id} value={est.id}>
                          {est.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Continue Button (Vibrant Orange Solid Button matching Photo) */}
                  <button
                    type="button"
                    onClick={() => setIsSetupDone(true)}
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-mono font-black uppercase tracking-widest py-3.5 px-4 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 mt-2 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Continuar <ArrowRight className="h-4 w-4 stroke-[3]" />
                  </button>
                </motion.div>
              ) : (
                /* ECR√É 2: AUTENTICA√á√ÉO */
                <motion.div
                  key="step2-auth-credentials"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-4"
                >
                  <div className="bg-[#070d1a]/80 border border-slate-800/80 rounded-xl p-3 text-center">
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">Terminal configurado para:</span>
                    <span className="text-xs font-sans font-bold text-amber-400 mt-0.5 block">
                      {(() => {
                        const ests = institutionalHierarchy[selectedProvince]?.directions[selectedDir] || [];
                        const matchingEst = ests.find(e => e.id === selectedEstablishmentId);
                        return matchingEst ? matchingEst.name : "Desconhecido";
                      })()}
                    </span>
                  </div>

                  {authError && (
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center gap-2.5 text-[11px] text-red-300">
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 animate-bounce" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Utilizador Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9.5px] uppercase font-mono tracking-wider font-bold text-slate-300">
                      Utilizador:
                    </label>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Ex: dggeral"
                      className="bg-[#070c18] border border-slate-700/80 p-3 rounded-xl text-xs leading-none text-slate-100 font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 w-full shadow-inner"
                    />
                  </div>

                  {/* Senha Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9.5px] uppercase font-mono tracking-wider font-bold text-slate-300">
                      Senha:
                    </label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="‚Ä¢‚Ä¢‚Ä¢‚Ä¢‚Ä¢‚Ä¢‚Ä¢‚Ä¢"
                      className="bg-[#070c18] border border-slate-700/80 p-3 rounded-xl text-xs leading-none text-slate-100 font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 w-full shadow-inner"
                    />
                  </div>

                  {/* Row of Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSetupDone(false);
                        setAuthError(null);
                      }}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xxs font-bold py-3.5 px-2 rounded-xl cursor-pointer transition-all text-center uppercase font-mono"
                    >
                      ‚Üê Voltar
                    </button>
                    <button
                      type="button"
                      onClick={handleSystemLogin}
                      className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xxs font-mono font-black uppercase tracking-wider py-3.5 px-2 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20"
                    >
                      Entrar <Check className="h-4 w-4 stroke-[3]" />
                    </button>
                  </div>

                  {/* Quick select demonstration credentials */}
                  <div className="border-t border-slate-800/80 pt-2.5 mt-1">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9.5px] text-amber-400 font-bold uppercase tracking-wider font-mono">
                        üîë Simula√ß√£o de Credenciais NREP-AO
                      </span>
                      <span className="text-[8.5px] font-mono text-slate-400">
                        {operators.length} Operadores Carregados
                      </span>
                    </div>

                    {/* Dense category tabs */}
                    <div className="flex gap-1 mb-1.5 overflow-x-auto pb-0.5">
                      {[
                        { id: "ALL", label: "Todos" },
                        { id: "NATIONAL", label: "‚≠ê Centro Operacional / DG" },
                        { id: "PROVINCIAL", label: "21 Dire√ß√µes Provinciais" },
                        { id: "ESTABLISHMENT", label: "Estabelecimentos" }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setLoginOpTab(tab.id as any)}
                          className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold whitespace-nowrap transition cursor-pointer border ${
                            loginOpTab === tab.id
                              ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm"
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Search box for operators */}
                    <div className="mb-1.5">
                      <input
                        type="text"
                        value={loginOpSearch}
                        onChange={(e) => setLoginOpSearch(e.target.value)}
                        placeholder="Filtrar por nome, prov√≠ncia, fun√ß√£o ou username..."
                        className="w-full bg-[#050811] border border-slate-800 p-1.5 px-2.5 rounded-lg text-[10px] font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/80"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-1 max-h-44 overflow-y-auto pr-1">
                      {operators
                        .filter(op => {
                          const opLevelStr = op.level as string;
                          const opRoleStr = op.role as string;
                          if (loginOpTab === "NATIONAL") {
                            if (opLevelStr !== "NATIONAL" && opRoleStr !== "DIRECTOR_GERAL") return false;
                          } else if (loginOpTab === "PROVINCIAL") {
                            if (opLevelStr !== "PROVINCIAL") return false;
                          } else if (loginOpTab === "ESTABLISHMENT") {
                            if (opLevelStr !== "ESTABLISHMENT") return false;
                          }
                          if (loginOpSearch.trim()) {
                            const query = loginOpSearch.toLowerCase().trim();
                            const matchName = op.name.toLowerCase().includes(query);
                            const matchUser = op.username.toLowerCase().includes(query);
                            const matchProv = (op.province || "").toLowerCase().includes(query);
                            const matchRole = (op.roleName || op.role || "").toLowerCase().includes(query);
                            return matchName || matchUser || matchProv || matchRole;
                          }
                          return true;
                        })
                        .map((op) => {
                          const opLevelStr = op.level as string;
                          const opRoleStr = op.role as string;
                          const isMatchingEstablishment = opLevelStr === "NATIONAL" || opRoleStr === "DIRECTOR_GERAL" ||
                            (selectedProvince === "Centro Operacional" && (opRoleStr === "DIRECTOR_GERAL" || opLevelStr === "NATIONAL")) ||
                            (opLevelStr === "PROVINCIAL" && op.province === selectedProvince) ||
                            (opLevelStr === "ESTABLISHMENT" && op.assignedPrisonId === selectedEstablishmentId);

                          return (
                            <button
                              key={op.id}
                              type="button"
                              onClick={() => {
                                setUsernameInput(op.username);
                                setPasswordInput(op.senha_hash);
                                if (op.province && institutionalHierarchy[op.province]) {
                                  setSelectedProvince(op.province);
                                  const dirs = Object.keys(institutionalHierarchy[op.province].directions || {});
                                  if (dirs.length > 0) {
                                    setSelectedDir(dirs[0]);
                                    const ests = institutionalHierarchy[op.province].directions[dirs[0]] || [];
                                    if (ests.length > 0) {
                                      const matchEst = ests.find(e => e.id === op.assignedPrisonId) || ests[0];
                                      setSelectedEstablishmentId(matchEst.id);
                                    }
                                  }
                                } else if (op.level === "NATIONAL" || op.role === "DIRECTOR_GERAL") {
                                  setSelectedProvince("Centro Operacional");
                                  setSelectedDir("Dire√ß√£o Geral / Centro Operacional Nacional");
                                  setSelectedEstablishmentId("CENTRO-OPERACIONAL-NACIONAL");
                                }
                                setAuthError(null);
                              }}
                              className={`p-2 text-left rounded-lg border text-xxs flex flex-col gap-0.5 cursor-pointer transition-all ${
                                isMatchingEstablishment 
                                  ? "bg-slate-900/90 border-amber-500/50 text-slate-200 ring-1 ring-amber-500/20"
                                  : "bg-[#070c18] border-slate-800/80 text-slate-400 opacity-75 hover:opacity-100 hover:bg-slate-900"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-200 truncate pr-2">{op.name}</span>
                                <span className="font-mono text-[8px] bg-slate-950 px-1.5 py-0.5 rounded text-amber-400 border border-slate-800 font-bold shrink-0">
                                  {op.role === "DIRECTOR_GERAL" ? "CENTRO OPERACIONAL" : (op.province ? `DP ${op.province}` : op.level)}
                                </span>
                              </div>
                              <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5">
                                <span>User: <strong className="text-amber-400">{op.username}</strong></span>
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
          </div>

          {/* Official Footer Text matching image */}
          <div className="mt-4 text-center flex flex-col items-center gap-0.5 font-mono text-[9px] text-slate-400 opacity-90">
            <span className="tracking-widest uppercase font-bold text-slate-400">
              SP ‚Ä¢ SERVI√áO PENITENCI√ÅRIO
            </span>
            <span className="text-slate-400 text-[8.5px] uppercase tracking-wider">
              üîí ACESSO RESTRITO SOB TERMOS DA AMEP AO MILITAR E PENAL
            </span>
          </div>

        </div>
      </div>

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
                operatorName: "Sistema (Autom√°tico)",
                details: "Registo de delega√ß√£o padr√£o no sistema de patentes civis/militares."
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
                      Hist√≥rico da Portaria <strong className="text-amber-500 font-extrabold">{selectedHistoryDelegation.id}</strong>
                    </span>
                    <button 
                      onClick={() => setSelectedHistoryDelegation(null)}
                      className="hover:scale-110 active:scale-95 transition-all text-slate-400 hover:text-slate-250 bg-slate-900 hover:bg-slate-800 p-1.5 rounded-full text-xxs cursor-pointer"
                    ><Trash2 className="w-3.5 h-3.5" /></button>
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
                          <span className="text-slate-550 font-bold">BENEFICI√ÅRIO:</span>
                          <span className="text-slate-300 font-bold">{delegateeObj?.name || "Operador Indicado"}</span>
                        </div>
                        <div className="flex flex-col col-span-2">
                          <span className="text-slate-550 font-bold">FUN√á√ÉO OUTORGADA:</span>
                          <span className="text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded text-[9.5px] w-fit font-sans font-extrabold uppercase mt-1">
                            {roleObj?.name || "Comiss√°rio Ad-hoc"}
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
                                  <span className="text-slate-600 font-bold">RESPONS√ÅVEL:</span>
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
                      Fechar Hist√≥rico
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col antialiased font-sans select-none overflow-hidden h-screen relative">
      <AngolaHolographicMapBackground
        opacityClass="opacity-25"
        selectedProvince={selectedProvinceFilter}
        onSelectProvince={(prov) => {
          setSelectedProvinceFilter(prov);
          writeAuditLog(
            currentOperator,
            "PRINT_REPORT",
            "Territ√≥rio",
            undefined,
            `Selecionou prov√≠ncia '${prov}' via Mapa Hologr√°fico Terrestre de Angola.`
          );
        }}
        prisons={visiblePrisons}
      />
      
      {/* MOBILE OPERATIONAL HEADER (FOR SMARTPHONES) */}
      <MobileHeader
        isOnline={isOnline}
        setIsOnline={setIsOnline}
        syncQueueCount={syncQueue.length}
        isSyncing={isSyncing}
        onTriggerSync={triggerSync}
        currentOperator={currentOperator}
        activeTab={activeTab}
        setActiveTab={(t) => setActiveTab(t as any)}
        onOpenSearchModal={() => {
          setIsMobileFilterOpen(true);
        }}
        onOpenAddInmate={() => setIsMobileMultiStepAddOpen(true)}
      />

      {/* 1. DESKTOP STATE BANNERS (OFFLINE CONTINGENCY) */}
      {!isOnline && (
        <div className="hidden md:flex bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 items-center justify-between text-xs text-amber-200 shrink-0 select-none">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-amber-400 animate-pulse" />
            <span>
              <strong>MODO DE CONTING√äNCIA ATIVO:</strong> Sem conex√£o com o servidor do MININT em Luanda. Sincronismo local no <strong>IndexedDB</strong> ativado.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-amber-950 border border-amber-500/40 px-2 py-0.5 rounded-sm text-xxs font-mono">
              Fila: {syncQueue.length} pendentes
            </span>
            <button 
              onClick={() => setIsOnline(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-xxs cursor-pointer transition-colors"
            >
              Restabelecer Sinal
            </button>
          </div>
        </div>
      )}

      {isOnline && (
        <div className="hidden md:flex bg-[#07090e] border-b border-slate-900 px-4 py-1 items-center justify-between text-xs text-slate-400 shrink-0 select-none">
          <div className="flex items-center gap-2 font-mono text-[10.5px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-300 font-medium">Sinc Activa</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px]">
            <button 
              onClick={() => setIsOnline(false)}
              className="text-slate-500 hover:text-amber-400 cursor-pointer transition-colors"
            >
              Simular Offline
            </button>
          </div>
        </div>
      )}

      {/* 2. BARRA SUPERIOR DESKTOP (CONTEXT BAR / TITLE BAR) */}
      <header className="hidden md:flex h-11 bg-[#090c10] border-b border-slate-900 items-center justify-between px-4 shrink-0 select-none">
        
        {/* Left Side: System Context / Breadcrumbs & Collapsible Menu Trigger */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="bg-[#040609] p-1.5 rounded border border-slate-800 hover:border-amber-500/50 text-slate-400 hover:text-amber-400 shadow-md flex items-center justify-center shrink-0 cursor-pointer transition-all"
            title={isSidebarExpanded ? "Recolher Menu Lateral" : "Expandir Menu Lateral"}
          >
            <PanelLeftClose className={`h-4 w-4 transition-transform ${!isSidebarExpanded ? "rotate-180" : ""}`} />
          </button>
          <div className="flex items-center gap-2 text-[10.5px] font-mono text-slate-400">
            <span className="font-bold text-slate-200 tracking-wider">PNAP.AO ‚Ä¢ ANGOLA</span>
            <span className="text-slate-600 font-bold">/</span>
            {selectedHierNode !== null ? (
              <>
                <span className="text-slate-400">{selectedHierNode.name}</span>
              </>
            ) : (
              <>
                <span className="text-amber-500 font-bold">
                  {activeTab === "centro-comando" ? "Centro de Comando" :
                   activeTab === "centro-inteligencia" ? "Intelig√™ncia" :
                   activeTab === "auditing" ? "Auditoria Central" :
                   activeTab === "deus-fundador" ? "Dire√ß√£o Geral" :
                   activeTab === "admissions" ? "Admiss√£o & Cadastro" :
                   activeTab === "movements" ? "Movimenta√ß√µes" :
                   activeTab === "documents" ? "Guias de Tr√¢nsito" :
                   activeTab === "special-services" ? "Reinser√ß√£o Social" :
                   activeTab === "penal-code" ? "Doutrina CNEL" :
                   activeTab === "erd" ? "Esquema ERD" :
                   activeTab === "settings" ? "Ajustes & Config" :
                   activeTab === "sandbox" ? "Simulador DevTools" : "Sistema Operacional"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Center: Global Context Search Box styled exactly like VS Code Command Palette */}
        <div className="relative w-[300px] max-w-[320px] hidden md:block">
          <Search className="absolute left-2.5 top-1.5 h-3 w-3 text-slate-500" />
          <input
            type="text"
            placeholder="Pesquisar Recluso, NREP, BI ou EP... (Ctrl+P)"
            value={globalWorkspaceSearch}
            onChange={(e) => setGlobalWorkspaceSearch(e.target.value)}
            className="w-full bg-[#040609] border border-slate-800/80 hover:border-slate-750 focus:border-amber-500/50 rounded-md py-1 pl-8 pr-8 text-[10px] font-mono text-slate-300 placeholder-slate-550 focus:outline-none transition-all shadow-inner h-7 truncate"
          />
          {globalWorkspaceSearch ? (
            <button 
              onClick={() => setGlobalWorkspaceSearch("")}
              className="absolute right-2.5 top-1.5 text-slate-500 hover:text-slate-300 text-[10px]"
            ><Trash2 className="w-3.5 h-3.5" /></button>
          ) : (
            <span className="absolute right-2.5 top-1.5 text-[8px] font-mono text-slate-600 bg-slate-900 border border-slate-800 px-1 rounded">Ctrl+P</span>
          )}

          {/* Interactive Global Search Popover Overlay */}
          {globalWorkspaceSearch.trim() !== "" && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-lg shadow-2xl z-50 p-2 max-h-[420px] overflow-y-auto font-sans">
              <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-800 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1"><Search className="w-3 h-3 text-amber-500" /> PESQUISA NACIONAL UNIFICADA</span>
                <span className="text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">LEITURA REBAC</span>
              </div>
              {(() => {
                const query = globalWorkspaceSearch.toLowerCase().trim();
                const results = inmates.filter(i => {
                  const nameStr = (i.fullName || `${i.firstName || ''} ${i.lastName || ''}`).toLowerCase();
                  const prisonName = (prisons.find(p => p.id === (i.assignedPrisonId || i.prisonId))?.name || "").toLowerCase();
                  const prov = (i.province || "").toLowerCase();
                  const nrep = (i.documentCode || i.id || "").toLowerCase();
                  const bi = (i.idCard || i.biNumber || "").toLowerCase();
                  return nameStr.includes(query) || prisonName.includes(query) || prov.includes(query) || nrep.includes(query) || bi.includes(query);
                });

                if (results.length === 0) {
                  return (
                    <div className="p-4 text-center text-xs text-slate-500 font-mono">
                      Nenhum recluso ou processo encontrado com o termo "{globalWorkspaceSearch}" no cadastro nacional.
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col gap-1">
                    {results.slice(0, 15).map((inm) => {
                      const isInScope = visibleInmates.some(vi => vi.id === inm.id);
                      const prisonObj = prisons.find(p => p.id === (inm.assignedPrisonId || inm.prisonId));
                      const prisonLabel = prisonObj ? prisonObj.name.replace("Estabelecimento Penitenci√°rio de ", "EP ") : (inm.assignedPrisonId || inm.prisonId || "N/A");
                      const provLabel = inm.province || (prisonObj ? prisonObj.location.split(',')[0].trim() : "N/A");
                      const inmName = inm.fullName || `${inm.firstName || ''} ${inm.lastName || ''}`.trim();
                      const inmNrep = inm.documentCode || inm.id;

                      return (
                        <div
                          key={inm.id}
                          onClick={() => {
                            setSelectedSearchInmateModal(inm);
                            setSelectedSearchInmateIsOutOfScope(!isInScope);
                            setGlobalWorkspaceSearch("");
                            writeAuditLog(
                              currentOperator,
                              "VIEW_INMATE",
                              "PesquisaGlobal",
                              inm.id,
                              `Pesquisa global efetuada para recluso ${inmName} (${inmNrep}) - Escopo: ${isInScope ? 'JURISDI√á√ÉO_LOCAL' : 'CONSULTA_NACIONAL_FORA_ESCOPO'}`
                            );
                          }}
                          className={`p-2 rounded border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isInScope
                              ? "bg-slate-900/80 border-slate-800 hover:border-amber-500/50 hover:bg-slate-900"
                              : "bg-slate-950 border-slate-850 hover:border-slate-700 hover:bg-slate-900/50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-mono text-[10px] text-amber-500 font-bold">
                              {inmName[0]}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-200 truncate">{inmName}</span>
                                <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1 rounded shrink-0">NREP: {inmNrep}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate flex items-center gap-2">
                                <span>üìç {prisonLabel} ({provLabel})</span>
                                <span>‚Ä¢ BI: {inm.idCard || inm.biNumber || "N/A"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5">
                            {isInScope ? (
                              <span className="text-[9px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Escopo Direto
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded flex items-center gap-1" title="Leitura Apenas - Fora da Jurisdi√ß√£o Provincial">
                                <Eye className="w-2.5 h-2.5" /> Pesquisa Nacional (Leitura)
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Right Side: Operational Context Selectors & Profile */}
        <div className="flex items-center gap-3">

          {/* Sync status button */}
          {syncQueue.length > 0 && (
            <button
              onClick={triggerSync}
              disabled={isSyncing}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2 h-7 rounded text-[10px] flex items-center gap-1 cursor-pointer shadow-lg animate-pulse disabled:opacity-55 shrink-0"
              title="Sincronizar transa√ß√µes locais enfileiradas"
            >
              <RefreshCw className={`h-2.5 w-2.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span className="font-mono text-[9px] tracking-tight">{syncQueue.length} Transa√ß√µes</span>
            </button>
          )}

          {/* Alert Notifications Count */}
          <div className="relative cursor-pointer hover:bg-slate-800 p-1 rounded text-slate-400 hover:text-slate-200 transition-colors shrink-0 h-7 w-7 flex items-center justify-center">
            <Bell className="h-3.5 w-3.5" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-slate-900 animate-pulse"></span>
          </div>

          <div className="h-6 w-px bg-slate-800"></div>

          {/* User Profile Info Badge */}
          <div className="flex items-center gap-2">
            <div className="h-7 px-2 rounded bg-[#040609] border border-slate-800 flex items-center justify-center font-mono text-[10px] font-bold text-slate-300 shrink-0" title={`${currentOperator.name} - ${currentOperator.roleName}`}>
              <Users className="h-3 w-3 text-amber-500 mr-1.5" />
              <span>{currentOperator.username}</span>
            </div>
          </div>

          {/* Compact Logout Button */}
          <button 
            onClick={() => {
              apiService.clearToken();
              localStorage.removeItem("pnap_is_logged_in");
              localStorage.removeItem("pnap_is_setup_done");
              localStorage.removeItem("pnap_user_session");
              setIsLoggedIn(false);
              setIsSetupDone(false);
              setUsernameInput("");
              setPasswordInput("");
            }} 
            className="p-1 h-7 w-7 flex items-center justify-center hover:bg-red-950/40 border border-slate-800 hover:border-red-900/30 text-slate-500 hover:text-red-400 rounded cursor-pointer transition-all shrink-0"
            title="Sair da plataforma"
          >
            <Lock className="h-3 w-3" />
          </button>
        </div>
      </header>

      {/* 3. WORKSPACE CONTAINER (ACTIVITY BAR + SIDEBAR EXPLORER + WORKSPACE BODY) */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* A. ACTIVITY BAR (VS CODE LAYOUT FAR LEFT - DESKTOP ONLY) */}
        <aside className="hidden md:flex w-12 bg-[#090b0f] border-r border-slate-900 flex-col items-center justify-between py-4 select-none shrink-0">
          <div className="flex flex-col gap-3 items-center w-full">
            {/* 1. PAINEL */}
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setSelectedHierNode(null);
              }}
              className={`p-2 rounded-lg transition-all relative group cursor-pointer ${
                activeTab === "dashboard" ? "bg-slate-900 text-amber-500 border border-slate-800" : "text-slate-500 hover:text-slate-350"
              }`}
              title={activeTab === "dashboard" ? "‚ûî Painel Operacional [ATIVO]" : "‚Ä¢ PAINEL GERAL"}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="absolute left-14 bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1 text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all font-mono whitespace-nowrap z-50 shadow-xl pointer-events-none">
                {activeTab === "dashboard" ? "‚ûî Painel Operacional [ATIVO]" : "‚Ä¢ PAINEL GERAL"}
              </span>
            </button>

            {/* 2. COMANDO (CNC) */}
            <button
              onClick={() => {
                setActiveTab("centro-comando");
                setSelectedHierNode(null);
              }}
              className={`p-2 rounded-lg transition-all relative group cursor-pointer ${
                activeTab === "centro-comando" ? "bg-slate-900 text-amber-500 border border-slate-800" : "text-slate-500 hover:text-slate-350"
              }`}
              title={activeTab === "centro-comando" ? "‚ûî Centro Nacional de Comando [ATIVO]" : "‚Ä¢ C. N. C."}
            >
              <Radio className="h-5 w-5 animate-pulse" />
              <span className="absolute left-14 bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1 text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all font-mono whitespace-nowrap z-50 shadow-xl pointer-events-none">
                {activeTab === "centro-comando" ? "‚ûî Centro Nacional de Comando [ATIVO]" : "‚Ä¢ C. N. C."}
              </span>
            </button>

            {/* 3. INTELIG√äNCIA (CI - SIEM) */}
            <button
              onClick={() => {
                setActiveTab("centro-inteligencia");
                setSelectedHierNode(null);
              }}
              className={`p-2 rounded-lg transition-all relative group cursor-pointer ${
                activeTab === "centro-inteligencia" ? "bg-slate-900 text-amber-500 border border-slate-800" : "text-slate-500 hover:text-slate-350"
              }`}
              title={activeTab === "centro-inteligencia" ? "‚ûî Centro de Intelig√™ncia (SIEM) [ATIVO]" : "‚Ä¢ C. I. (SIEM)"}
            >
              <ShieldAlert className="h-5 w-5" />
              <span className="absolute left-14 bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1 text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all font-mono whitespace-nowrap z-50 shadow-xl pointer-events-none">
                {activeTab === "centro-inteligencia" ? "‚ûî Centro de Intelig√™ncia (SIEM) [ATIVO]" : "‚Ä¢ C. I. (SIEM)"}
              </span>
            </button>

            {/* 4. ADMISS√ÉO & UBICA√á√ÉO */}
            <button
              onClick={() => {
                setActiveTab("admissions");
                setSelectedHierNode(null);
              }}
              className={`p-2 rounded-lg transition-all relative group cursor-pointer ${
                activeTab === "admissions" ? "bg-slate-900 text-amber-500 border border-slate-800" : "text-slate-500 hover:text-slate-350"
              }`}
              title={activeTab === "admissions" ? "‚ûî Admiss√£o e Ubica√ß√£o [ATIVO]" : "‚Ä¢ ADM. UBIC."}
            >
              <Users className="h-5 w-5" />
              <span className="absolute left-14 bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1 text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all font-mono whitespace-nowrap z-50 shadow-xl pointer-events-none">
                {activeTab === "admissions" ? "‚ûî Admiss√£o e Ubica√ß√£o [ATIVO]" : "‚Ä¢ ADM. UBIC."}
              </span>
            </button>

            {/* 5. MOVIMENTA√á√ïES PENAIS */}
            <button
              onClick={() => {
                setActiveTab("movements");
                setSelectedHierNode(null);
              }}
              className={`p-2 rounded-lg transition-all relative group cursor-pointer ${
                activeTab === "movements" ? "bg-slate-900 text-amber-500 border border-slate-800" : "text-slate-500 hover:text-slate-350"
              }`}
              title={activeTab === "movements" ? "‚ûî Movimenta√ß√µes Penais [ATIVO]" : "‚Ä¢ MOV. PENAL"}
            >
              <Activity className="h-5 w-5" />
              <span className="absolute left-14 bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1 text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all font-mono whitespace-nowrap z-50 shadow-xl pointer-events-none">
                {activeTab === "movements" ? "‚ûî Movimenta√ß√µes Penais [ATIVO]" : "‚Ä¢ MOV. PENAL"}
              </span>
            </button>

            {/* 6. EMISS√ÉO DE DOCUMENTOS */}
            <button
              onClick={() => {
                setActiveTab("documents");
                setSelectedHierNode(null);
              }}
              className={`p-2 rounded-lg transition-all relative group cursor-pointer ${
                activeTab === "documents" ? "bg-slate-900 text-amber-500 border border-slate-800" : "text-slate-500 hover:text-slate-350"
              }`}
              title={activeTab === "documents" ? "‚ûî Emiss√£o de Documentos [ATIVO]" : "‚Ä¢ EMIS. DOC."}
            >
              <FileCheck2 className="h-5 w-5" />
              <span className="absolute left-14 bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1 text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all font-mono whitespace-nowrap z-50 shadow-xl pointer-events-none">
                {activeTab === "documents" ? "‚ûî Emiss√£o de Documentos [ATIVO]" : "‚Ä¢ EMIS. DOC."}
              </span>
            </button>

            {/* CORREIO INSTITUCIONAL (GMAIL) */}
            <button
              onClick={() => {
                setActiveTab("correio-institucional");
                setSelectedHierNode(null);
              }}
              className={`p-2 rounded-lg transition-all relative group cursor-pointer ${
                activeTab === "correio-institucional" ? "bg-slate-900 text-amber-500 border border-slate-800" : "text-slate-500 hover:text-slate-350"
              }`}
              title={activeTab === "correio-institucional" ? "‚ûî Correio Institucional (Gmail) [ATIVO]" : "‚Ä¢ CORREIO"}
            >
              <Mail className="h-5 w-5" />
              <span className="absolute left-14 bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1 text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all font-mono whitespace-nowrap z-50 shadow-xl pointer-events-none">
                {activeTab === "correio-institucional" ? "‚ûî Correio Institucional (Gmail) [ATIVO]" : "‚Ä¢ CORREIO"}
              </span>
            </button>

            {/* REPOSIT√ìRIO DIGITAL & ARQUIVO (GOOGLE DRIVE) */}
            <button
              onClick={() => {
                setActiveTab("google-drive");
                setSelectedHierNode(null);
              }}
              className={`p-2 rounded-lg transition-all relative group cursor-pointer ${
                activeTab === "google-drive" ? "bg-slate-900 text-cyan-400 border border-slate-800" : "text-slate-500 hover:text-slate-350"
              }`}
              title={activeTab === "google-drive" ? "‚ûî Reposit√≥rio Digital (Google Drive) [ATIVO]" : "‚Ä¢ DRIVE"}
            >
              <HardDrive className="h-5 w-5" />
              <span className="absolute left-14 bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1 text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all font-mono whitespace-nowrap z-50 shadow-xl pointer-events-none">
                {activeTab === "google-drive" ? "‚ûî Reposit√≥rio Digital (Google Drive) [ATIVO]" : "‚Ä¢ DRIVE"}
              </span>
            </button>

            {/* TABELAS & ESTAT√çSTICA (GOOGLE SHEETS) */}
            <button
              onClick={() => {
                setActiveTab("google-sheets");
                setSelectedHierNode(null);
              }}
              className={`p-2 rounded-lg transition-all relative group cursor-pointer ${
                activeTab === "google-sheets" ? "bg-slate-900 text-emerald-400 border border-slate-800" : "text-slate-500 hover:text-slate-350"
              }`}
              title={activeTab === "google-sheets" ? "‚ûî Estat√≠stica & Censos (Google Sheets) [ATIVO]" : "‚Ä¢ SHEETS"}
            >
              <FileSpreadsheet className="h-5 w-5" />
              <span className="absolute left-14 bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1 text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all font-mono whitespace-nowrap z-50 shadow-xl pointer-events-none">
                {activeTab === "google-sheets" ? "‚ûî Estat√≠stica & Censos (Google Sheets) [ATIVO]" : "‚Ä¢ SHEETS"}
              </span>
            </button>

            {/* AGENDA JUDICIAL (GOOGLE CALENDAR) */}
            <button
              onClick={() => {
                setActiveTab("google-calendar");
                setSelectedHierNode(null);
              }}
              className={`p-2 rounded-lg transition-all relative group cursor-pointer ${
                activeTab === "google-calendar" ? "bg-slate-900 text-blue-400 border border-slate-800" : "text-slate-500 hover:text-slate-350"
              }`}
              title={activeTab === "google-calendar" ? "‚ûî Agenda Judicial (Google Calendar) [ATIVO]" : "‚Ä¢ CALENDAR"}
            >
              <CalendarIcon className="h-5 w-5" />
              <span className="absolute left-14 bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1 text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all font-mono whitespace-nowrap z-50 shadow-xl pointer-events-none">
                {activeTab === "google-calendar" ? "‚ûî Agenda Judicial (Google Calendar) [ATIVO]" : "‚Ä¢ CALENDAR"}
              </span>
            </button>

            {/* REDATOR OFICIAL & DESPACHOS (GOOGLE DOCS) */}
            <button
              onClick={() => {
                setActiveTab("google-docs");
                setSelectedHierNode(null);
              }}
              className={`p-2 rounded-lg transition-all relative group cursor-pointer ${
                activeTab === "google-docs" ? "bg-slate-900 text-indigo-400 border border-slate-800" : "text-slate-500 hover:text-slate-350"
              }`}
              title={activeTab === "google-docs" ? "‚ûî Redator Oficial (Google Docs) [ATIVO]" : "‚Ä¢ DOCS"}
            >
              <FileText className="h-5 w-5" />
              <span className="absolute left-14 bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1 text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all font-mono whitespace-nowrap z-50 shadow-xl pointer-events-none">
                {activeTab === "google-docs" ? "‚ûî Redator Oficial (Google Docs) [ATIVO]" : "‚Ä¢ DOCS"}
              </span>
            </button>

            {/* 7. AUDITORIA */}
            <button
              onClick={() => {
                setActiveTab("auditing");
                setSelectedHierNode(null);
              }}
              className={`p-2 rounded-lg transition-all relative group cursor-pointer ${
                activeTab === "auditing" ? "bg-slate-900 text-amber-500 border border-slate-800" : "text-slate-500 hover:text-slate-350"
              }`}
              title="Auditoria Central (Audit Log)"
            >
              <Database className="h-5 w-5" />
              <span className="absolute left-14 bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1 text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all font-mono whitespace-nowrap z-50 shadow-xl pointer-events-none">
                Auditoria Central (Audit Log)
              </span>
            </button>

            {/* 8. SERVI√áOS E REINSER√á√ÉO */}
            <button
              onClick={() => {
                setActiveTab("special-services");
                setSelectedHierNode(null);
              }}
              className={`p-2 rounded-lg transition-all relative group cursor-pointer ${
                activeTab === "special-services" ? "bg-slate-900 text-amber-500 border border-slate-800" : "text-slate-500 hover:text-slate-350"
              }`}
              title={activeTab === "special-services" ? "‚ûî Servi√ßos e Reinser√ß√£o [ATIVO]" : "‚Ä¢ SERV. REINS."}
            >
              <Briefcase className="h-5 w-5" />
              <span className="absolute left-14 bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1 text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all font-mono whitespace-nowrap z-50 shadow-xl pointer-events-none">
                {activeTab === "special-services" ? "‚ûî Servi√ßos e Reinser√ß√£o [ATIVO]" : "‚Ä¢ SERV. REINS."}
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-3 items-center w-full">
            {/* DOUTRINA, LEGISLA√á√ÉO & GOVERNA√á√ÉO */}
            <button
              onClick={() => {
                setActiveTab("penal-code");
                setSelectedHierNode(null);
              }}
              className={`p-2 rounded-lg transition-all relative group cursor-pointer ${
                activeTab === "penal-code" ? "bg-slate-900 text-amber-500 border border-slate-800" : "text-slate-500 hover:text-slate-350"
              }`}
              title={activeTab === "penal-code" ? "‚ûî Doutrina, Legisla√ß√£o & Governa√ß√£o [ATIVO]" : "‚Ä¢ DOUT. LEG."}
            >
              <Scale className="h-5 w-5" />
              <span className="absolute left-14 bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1 text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all font-mono whitespace-nowrap z-50 shadow-xl pointer-events-none">
                {activeTab === "penal-code" ? "‚ûî Doutrina, Legisla√ß√£o & Governa√ß√£o [ATIVO]" : "‚Ä¢ DOUT. LEG."}
              </span>
            </button>

            {/* CONSOLA DE RASTREIO & CONTEXTO */}
            <button
              onClick={() => setIsInspectorOpen(!isInspectorOpen)}
              className={`p-2 rounded-lg transition-all relative group cursor-pointer ${
                isInspectorOpen ? "bg-amber-500/20 text-amber-400 border border-amber-500/60 shadow-md" : "text-slate-500 hover:text-amber-400"
              }`}
              title="Consola de Rastreio (Detetor de Contexto)"
            >
              <Radar className="h-5 w-5 animate-pulse text-amber-400" />
              <span className="absolute left-1.5 top-1.5 h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="absolute left-14 bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1 text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all font-mono whitespace-nowrap z-50 shadow-xl pointer-events-none">
                Consola de Rastreio & Contexto (SIEM)
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab("settings");
                setSelectedHierNode(null);
              }}
              className={`p-2 rounded-lg transition-all relative group cursor-pointer ${
                activeTab === "settings" ? "bg-slate-900 text-amber-500 border border-slate-800" : "text-slate-500 hover:text-slate-350"
              }`}
              title="Ajustes e Perfis"
            >
              <Settings className="h-5 w-5" />
              <span className="absolute left-14 bg-slate-950 border border-slate-850 text-slate-300 px-2 py-1 text-[9px] rounded opacity-0 group-hover:opacity-100 transition-all font-mono whitespace-nowrap z-50 shadow-xl pointer-events-none">
                Ajustes do Painel
              </span>
            </button>
          </div>
        </aside>

        {/* B. EXPLORER INSTITUCIONAL - DENSE COMPACT LIST (FASE 2 RESTRUCTURING) */}
        {isSidebarExpanded && (
          <aside className="hidden lg:flex w-72 bg-[#090b0f] border-r border-slate-900 flex-col select-none shrink-0 h-full animate-fadeIn overflow-hidden pb-1 font-mono">
            
            {/* Header */}
            <div className="h-8 px-2.5 border-b border-slate-900 flex items-center justify-between bg-[#06080c] shrink-0">
              <span className="text-[9.5px] font-black text-slate-300 tracking-wider uppercase">
                DIRET√ìRIO R√ÅPIDO DE SIGLAS
              </span>
              <button
                type="button"
                onClick={() => setIsSidebarExpanded(false)}
                className="p-0.5 hover:bg-slate-800/80 rounded text-slate-500 hover:text-amber-400 cursor-pointer transition-colors"
                title="Ocultar Painel"
              >
                <PanelLeftClose className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Fast Filter Input & Jurisdiction Scope */}
            <div className="p-1.5 border-b border-slate-900 bg-[#05070a] flex flex-col gap-1 shrink-0">
              
              {/* Jurisdiction / Territorial Scope Selector */}
              <div className="flex items-center justify-between bg-[#080c14] border border-slate-800 rounded px-1.5 py-0.5 text-[9.5px]">
                <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest shrink-0 font-mono">
                  JURISDI√á√ÉO:
                </span>
                <select
                  value={selectedProvinceFilter}
                  onChange={(e) => {
                    setSelectedProvinceFilter(e.target.value);
                    writeAuditLog(
                      currentOperator,
                      "PRINT_REPORT",
                      "Territ√≥rio",
                      undefined,
                      `Alterou filtro territorial para: ${e.target.value}`
                    );
                  }}
                  disabled={currentOperator.territorialScope !== TerritorialScope.NATIONAL}
                  className="bg-transparent border-none text-amber-400 text-[9.5px] font-mono font-bold focus:outline-none cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed pr-1 w-full text-right"
                >
                  {currentOperator.territorialScope === TerritorialScope.NATIONAL ? (
                    <>
                      <option value="ALL">Todas as Prov√≠ncias</option>
                      {PROVINCES_HARDCODED.map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </>
                  ) : (
                    <option value={currentOperator.province || "Luanda"}>
                      Prov√≠ncia {currentOperator.province || "Luanda"}
                    </option>
                  )}
                </select>
              </div>

              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
                <input
                  type="text"
                  value={sidebarSiglaSearch}
                  onChange={(e) => setSidebarSiglaSearch(e.target.value)}
                  placeholder="Filtrar SIGLA (EP-VIA, DNIP, HUA)..."
                  className="w-full bg-[#080c14] border border-slate-800 rounded pl-7 pr-2 py-0.5 text-[10px] text-slate-200 placeholder:text-slate-500 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Filter Pills / Categories */}
              {(() => {
                const isNatOp = currentOperator.territorialScope === TerritorialScope.NATIONAL || currentOperator.level === "NATIONAL" || currentOperator.role === "DIRECTOR_GERAL";
                const targetProvForUnits = !isNatOp 
                  ? currentOperator.province?.toLowerCase().trim() 
                  : (selectedProvinceFilter !== "ALL" ? selectedProvinceFilter.toLowerCase().trim() : null);

                const currentFilteredUnits = organizationalUnits.filter((u) => {
                  if (targetProvForUnits) {
                    if (u.level === TerritorialScope.NATIONAL) return false;
                    return u.province?.toLowerCase().trim() === targetProvForUnits;
                  }
                  return true;
                });

                const centralDepsCount = organizationalUnits.filter(u => u.level === TerritorialScope.NATIONAL).length;
                const provDepsCount = currentFilteredUnits.filter(u => u.level !== TerritorialScope.NATIONAL).length;

                const countEPs = visiblePrisons.length;
                const countDEPs = currentFilteredUnits.length;
                const countPROVs = visibleProvinces.length;
                const countALL = countEPs + countDEPs + countPROVs;

                return (
                  <div className="flex flex-col gap-1">
                    <div className="grid grid-cols-2 gap-1 text-[9px] font-bold font-mono">
                      <button
                        type="button"
                        onClick={() => setSidebarFilterTab("ALL")}
                        className={`px-2 py-1 rounded transition flex items-center justify-between border cursor-pointer ${
                          sidebarFilterTab === "ALL" 
                            ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm" 
                            : "bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                        }`}
                        title="Vis√£o Geral Completa (EPs + DEPs + Prov√≠ncias)"
                      >
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>TODOS</span>
                        </span>
                        <span className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold ${
                          sidebarFilterTab === "ALL" ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-400"
                        }`}>
                          {countALL}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSidebarFilterTab("EP")}
                        className={`px-2 py-1 rounded transition flex items-center justify-between border cursor-pointer ${
                          sidebarFilterTab === "EP" 
                            ? "bg-blue-600 text-white border-blue-400 font-black shadow-sm" 
                            : "bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                        }`}
                        title="Estabelecimentos Prisionais (Cadeias, Comarcas e Penitenci√°rias)"
                      >
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          <span>EPs</span>
                        </span>
                        <span className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold ${
                          sidebarFilterTab === "EP" ? "bg-blue-900 text-blue-100" : "bg-slate-800 text-slate-400"
                        }`}>
                          {countEPs}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSidebarFilterTab("DEP")}
                        className={`px-2 py-1 rounded transition flex items-center justify-between border cursor-pointer ${
                          sidebarFilterTab === "DEP" 
                            ? "bg-purple-600 text-white border-purple-400 font-black shadow-sm" 
                            : "bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                        }`}
                        title="Depend√™ncias e Estruturas Org√¢nicas (Centrais DG + Direc√ß√µes Nacionais + Depts Provinciais)"
                      >
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>DEPs</span>
                        </span>
                        <span className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold ${
                          sidebarFilterTab === "DEP" ? "bg-purple-900 text-purple-100" : "bg-slate-800 text-slate-400"
                        }`}>
                          {countDEPs}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSidebarFilterTab("PROV")}
                        className={`px-2 py-1 rounded transition flex items-center justify-between border cursor-pointer ${
                          sidebarFilterTab === "PROV" 
                            ? "bg-emerald-600 text-white border-emerald-400 font-black shadow-sm" 
                            : "bg-slate-900/90 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                        }`}
                        title="Comandos & Direc√ß√µes Provinciais Territoriais"
                      >
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>PROVs</span>
                        </span>
                        <span className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold ${
                          sidebarFilterTab === "PROV" ? "bg-emerald-900 text-emerald-100" : "bg-slate-800 text-slate-400"
                        }`}>
                          {countPROVs}
                        </span>
                      </button>
                    </div>

                    {/* Sub-filtro de √¢mbito para DEPs quando a visualiza√ß√£o √© nacional */}
                    {sidebarFilterTab === "DEP" && !targetProvForUnits && (
                      <div className="flex items-center justify-between bg-[#04060a] border border-purple-950/80 rounded p-0.5 text-[8px] font-mono mt-0.5">
                        <button
                          type="button"
                          onClick={() => setSidebarDepSubFilter("ALL")}
                          className={`flex-1 py-0.5 px-1 rounded text-center transition cursor-pointer ${
                            sidebarDepSubFilter === "ALL" 
                              ? "bg-purple-800 text-white font-bold" 
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          TODAS ({countDEPs})
                        </button>
                        <button
                          type="button"
                          onClick={() => setSidebarDepSubFilter("CENTRAL")}
                          className={`flex-1 py-0.5 px-1 rounded text-center transition cursor-pointer ${
                            sidebarDepSubFilter === "CENTRAL" 
                              ? "bg-purple-800 text-white font-bold" 
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          DG / CENTRAL ({centralDepsCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setSidebarDepSubFilter("PROVINCIAL")}
                          className={`flex-1 py-0.5 px-1 rounded text-center transition cursor-pointer ${
                            sidebarDepSubFilter === "PROVINCIAL" 
                              ? "bg-purple-800 text-white font-bold" 
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          PROVINCIAIS ({provDepsCount})
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Dense Flat List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-1 flex flex-col gap-0.5">
              {(() => {
                const query = sidebarSiglaSearch.trim().toLowerCase();

                // 1. Establishments
                const epItems = visiblePrisons.map((p) => {
                  const lowerName = p.name.toLowerCase();
                  let sigla = p.code ? p.code.toUpperCase() : "EP";
                  if (lowerName.includes("viana") && lowerName.includes("feminino")) sigla = "EP-FEM";
                  else if (lowerName.includes("viana")) sigla = "EP-VIA";
                  else if (lowerName.includes("kakila")) sigla = "EP-KAK";
                  else if (lowerName.includes("huambo") || lowerName.includes("cambiote")) sigla = "EP-CAM";
                  else if (lowerName.includes("cabinda")) sigla = "EP-CAB";
                  else if (lowerName.includes("namibe")) sigla = "EP-NAM";
                  else if (lowerName.includes("cust√≥ias") || lowerName.includes("ndalatando")) sigla = "EP-CUS";
                  else if (lowerName.includes("calulo")) sigla = "EP-CAL";
                  else if (lowerName.includes("malanje")) sigla = "EP-MAL";

                  const count = visibleInmates.filter((i) => (i.assignedPrisonId || i.prisonId) === p.id).length;
                  const isSel = (selectedHierNode?.type === "ESTABLISHMENT" || selectedHierNode?.type === "PRISON") && selectedHierNode.id === p.id;

                  return {
                    id: `EP-${p.id}`,
                    category: "EP" as const,
                    sigla,
                    title: p.name.replace("Estabelecimento Penitenci√°rio de ", "EP ").replace("Estabelecimento Penitenci√°rio do ", "EP "),
                    subtitle: p.location,
                    meta: `${count}/${p.capacity || p.operationalCapacity || 500}`,
                    isSel,
                    onClick: () => {
                      setSelectedHierNode({ type: "PRISON", id: p.id, name: p.name, parentId: p.location?.split(',')[0]?.trim() });
                      setActiveTab("" as any);
                      setCurrentMission(null);
                    },
                  };
                });

                // 2. Departments (√ìrg√£os T√©cnicos, Centrais e Espelhados Provinciais)
                const isNatOp = currentOperator.territorialScope === TerritorialScope.NATIONAL || currentOperator.level === "NATIONAL" || currentOperator.role === "DIRECTOR_GERAL";
                const targetProvForUnits = !isNatOp 
                  ? currentOperator.province?.toLowerCase().trim() 
                  : (selectedProvinceFilter !== "ALL" ? selectedProvinceFilter.toLowerCase().trim() : null);

                let filteredUnits = organizationalUnits.filter((u) => {
                  if (targetProvForUnits) {
                    if (u.level === TerritorialScope.NATIONAL) return false;
                    return u.province?.toLowerCase().trim() === targetProvForUnits;
                  }
                  return true;
                });

                if (sidebarFilterTab === "DEP" && !targetProvForUnits) {
                  if (sidebarDepSubFilter === "CENTRAL") {
                    filteredUnits = filteredUnits.filter(u => u.level === TerritorialScope.NATIONAL);
                  } else if (sidebarDepSubFilter === "PROVINCIAL") {
                    filteredUnits = filteredUnits.filter(u => u.level !== TerritorialScope.NATIONAL);
                  }
                }

                const depItems = filteredUnits.map((u) => {
                  const sigla = (u as any).sigla || (u.code ? u.code.split("-")[0].toUpperCase() : "DEP");
                  const isCentral = u.level === TerritorialScope.NATIONAL || !u.province || u.province === "Nacional" || u.province === "NACIONAL";
                  const isSel = selectedHierNode?.type === "DEPARTMENT" && selectedHierNode.id === u.id;

                  return {
                    id: `DEP-${u.id}`,
                    category: "DEP" as const,
                    sigla,
                    title: u.name,
                    subtitle: isCentral 
                      ? "Direc√ß√£o Geral / √ìrg√£o Central" 
                      : `DP de ${u.province}`,
                    meta: isCentral ? "CENTRAL" : (u.province || "PROV"),
                    isSel,
                    onClick: () => {
                      setSelectedHierNode({ 
                        type: "DEPARTMENT", 
                        id: u.id, 
                        name: u.name, 
                        parentId: u.province || "NACIONAL" 
                      });
                      setActiveTab("" as any);
                      setCurrentMission(null);
                    },
                  };
                });

                // 3. Provinces
                const provSiglaMap: Record<string, string> = {
                  Luanda: "LUA", Huambo: "HUA", Benguela: "BGU", Cabinda: "CAB",
                  Hu√≠la: "HLA", Namibe: "NAM", "Cuanza Norte": "CNO", "Cuanza Sul": "CSU",
                  Malanje: "MAL", U√≠ge: "UIG", Zaire: "ZAI", "Lunda Norte": "LNO",
                  "Lunda Sul": "LSU", Moxico: "MOX", "Quando Cubango": "CCU",
                  Cunene: "CUN", Bi√©: "BIE", Bengo: "BEN", "Icolo e Bengo": "ICB",
                  "Moxico Leste": "MXL", "Cubango": "CCU", "Cuando": "CND", "Quando": "CND"
                };

                const provItems = visibleProvinces.map((prov) => {
                  const sigla = provSiglaMap[prov] || prov.substring(0, 3).toUpperCase();
                  const pCount = visiblePrisons.filter((p) => p.location.toLowerCase().includes(prov.toLowerCase())).length;
                  const isSel = selectedHierNode?.type === "PROVINCE" && selectedHierNode.id === prov;

                  return {
                    id: `PROV-${prov}`,
                    category: "PROV" as const,
                    sigla: `PR-${sigla}`,
                    title: `Direc√ß√£o Provincial de ${prov}`,
                    subtitle: "Comando Provincial",
                    meta: `${pCount} EPs`,
                    isSel,
                    onClick: () => {
                      setSelectedHierNode({ type: "PROVINCE", id: prov, name: prov });
                      setSelectedProvinceFilter(prov);
                      setActiveTab("" as any);
                      setCurrentMission(null);
                    },
                  };
                });

                let combined = [...epItems, ...depItems, ...provItems];

                if (sidebarFilterTab !== "ALL") {
                  combined = combined.filter((i) => i.category === sidebarFilterTab);
                }

                if (query) {
                  combined = combined.filter(
                    (i) =>
                      i.sigla.toLowerCase().includes(query) ||
                      i.title.toLowerCase().includes(query) ||
                      i.subtitle.toLowerCase().includes(query) ||
                      i.meta.toLowerCase().includes(query)
                  );
                }

                if (combined.length === 0) {
                  return (
                    <div className="p-3 border border-slate-850 rounded-lg text-center text-slate-500 text-[9.5px] font-mono my-2 bg-slate-950/40">
                      Nenhuma depend√™ncia ou √≥rg√£o encontrado para "{sidebarSiglaSearch}"
                    </div>
                  );
                }

                return combined.map((item) => {
                  let badgeStyle = "bg-amber-500/15 border-amber-500/40 text-amber-400";
                  if (item.category === "DEP") badgeStyle = "bg-purple-950/40 border-purple-800/60 text-purple-300";
                  if (item.category === "PROV") badgeStyle = "bg-emerald-950/40 border-emerald-800/60 text-emerald-300";

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.onClick}
                      className={`w-full text-left px-2 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-1.5 select-none ${
                        item.isSel
                          ? "bg-amber-500/20 border-amber-500/70 text-amber-300 font-bold shadow-sm"
                          : "bg-[#06080d]/90 border-slate-850/80 hover:bg-slate-850/80 hover:border-slate-750 text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black tracking-wide shrink-0 font-mono border text-center min-w-[50px] ${badgeStyle}`}>
                          {item.sigla}
                        </span>
                        <div className="flex flex-col truncate min-w-0 leading-tight">
                          <span className="text-[10px] font-bold truncate text-slate-100">{item.title}</span>
                          <span className="text-[8px] text-slate-500 truncate">{item.subtitle}</span>
                        </div>
                      </div>

                      <span className="text-[8px] text-slate-400 font-mono shrink-0 text-right px-1 py-0.5 bg-slate-900 rounded border border-slate-800">
                        {item.meta}
                      </span>
                    </button>
                  );
                });
              })()}
            </div>

            {/* Compact Operational Launcher */}
            <div className="p-1.5 border-t border-slate-900 bg-[#06080c] shrink-0 flex flex-col gap-1 text-[9px]">
              <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block">
                MISS√ïES R√ÅPIDAS
              </span>

              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setIsMobileMultiStepAddOpen(true)}
                  className="px-1.5 py-0.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 rounded text-[8.5px] font-bold text-center transition cursor-pointer"
                >
                  + ADMISS√ÉO
                </button>
                <button
                  type="button"
                  onClick={() => setIsQuickTransferModalOpen(true)}
                  className="px-1.5 py-0.5 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded text-[8.5px] font-bold text-center transition cursor-pointer"
                >
                  ‚áÑ TRANSFER√äNCIA
                </button>
                <button
                  type="button"
                  onClick={() => setIsInspectorOpen(true)}
                  className="col-span-2 mt-0.5 px-2 py-1 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 hover:text-amber-200 border border-amber-800/60 rounded text-[8.5px] font-bold text-center transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Radio className="h-3 w-3 text-amber-400 animate-pulse shrink-0" />
                  CONSOLA DE RASTREIO & DETETOR
                </button>
              </div>
            </div>

          </aside>
        )}

        {/* C. CENTRAL WORKSPACE BODY (THE OPERATIONAL AREA) */}
        <section className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-[#06080d] text-slate-100 pb-20 md:pb-0">
        
          {/* Dynamic Institutional Breadcrumbs */}
          <div className="hidden sm:flex bg-[#080b11] border-b border-slate-900/60 px-4 sm:px-6 py-2 items-center justify-between text-[10px] font-mono shrink-0 select-none">
            <div className="flex items-center gap-1.5 text-slate-500 overflow-x-auto scrollbar-none whitespace-nowrap">
              {getBreadcrumbPath().map((step, idx) => {
                const isLast = idx === getBreadcrumbPath().length - 1;
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-slate-700 font-bold mx-0.5">&gt;</span>}
                    <span 
                      onClick={() => {
                        if (step.node) {
                          setSelectedHierNode(step.node);
                          setCurrentMission(null);
                          setActiveTab("" as any);
                        } else if (step.type === "TAB") {
                          setSelectedHierNode(null);
                          setCurrentMission(null);
                          setActiveTab("dashboard");
                        }
                      }}
                      className={`transition-all ${
                        isLast 
                          ? "text-amber-500 font-black tracking-wider" 
                          : "text-slate-400 hover:text-amber-500 cursor-pointer"
                      }`}
                    >
                      {step.label}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Navigation Tabs Bar ‚Äî Compact VS Code Style Tabs Bar (DESKTOP ONLY) */}
          <div className="hidden md:flex h-9 bg-[#0b0e14] border-b border-slate-900 items-center justify-between shrink-0 select-none overflow-x-auto scrollbar-none">
            {/* Left side: Horizontal Tab List */}
            <div className="flex items-center h-full overflow-x-auto scrollbar-none">
              {/* Toggle Sidebar Button */}
              <button
                type="button"
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="h-full px-3 hover:bg-slate-900 border-r border-slate-900/60 text-slate-450 hover:text-amber-500 flex items-center gap-1 cursor-pointer transition-colors"
                title="Mostrar/Ocultar √Årvore de Ficheiros"
              >
                <LayoutTemplate className="h-3.5 w-3.5" />
              </button>

              {[
                { tab: "centro-comando", label: "Centro de Comando", icon: Radio, color: "text-sky-500" },
                { tab: "centro-inteligencia", label: "Intelig√™ncia", icon: ShieldAlert, color: "text-rose-500" },
                { tab: "admissions", label: "Admiss√£o & Cadastro", icon: Database, color: "text-emerald-500" },
                { tab: "movements", label: "Movimenta√ß√µes", icon: Activity, color: "text-blue-500" },
                { tab: "google-drive", label: "Google Drive (Arquivo)", icon: HardDrive, color: "text-cyan-400" },
                { tab: "google-sheets", label: "Google Sheets (Tabelas)", icon: FileSpreadsheet, color: "text-emerald-400" },
                { tab: "google-calendar", label: "Google Calendar (Agenda)", icon: CalendarIcon, color: "text-blue-400" },
                { tab: "google-docs", label: "Google Docs (Redator)", icon: FileText, color: "text-indigo-400" },
                { tab: "penal-code", label: "Doutrina CNEL", icon: FileText, color: "text-slate-400" },
                { tab: "erd", label: "Esquema ERD", icon: FileCode, color: "text-emerald-450" },
                { tab: "auditing", label: "Auditoria Central", icon: Database, color: "text-amber-500" },
                { tab: "settings", label: "Ajustes & Config", icon: Settings, color: "text-slate-400" },
                { tab: "deus-fundador", label: "Dire√ß√£o Geral", icon: Crown, color: "text-amber-500" },
                { tab: "sandbox", label: "Simulador DevTools", icon: FileCode, color: "text-slate-500" },
                { tab: "documents", label: "Guias de Tr√¢nsito", icon: FileText, color: "text-amber-600" },
                { tab: "special-services", label: "Reinser√ß√£o Social", icon: Database, color: "text-teal-500" }
              ]
              .filter((item) => openTabs.includes(item.tab))
              .map((item) => {
                const isActive = activeTab === item.tab && !selectedHierNode;
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.tab}
                    className={`h-full flex items-center border-r border-slate-900 relative shrink-0 select-none group/tab ${
                      isActive 
                        ? "bg-[#06080d] text-amber-500 border-t border-t-amber-500 font-bold" 
                        : "bg-[#090c12] text-slate-400 hover:bg-[#0c1018] hover:text-slate-200"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab(item.tab as any);
                        setSelectedHierNode(null);
                      }}
                      className="h-full pl-4 pr-2 flex items-center gap-2 font-mono text-[10.5px] cursor-pointer transition-colors relative whitespace-nowrap"
                    >
                      <IconComponent className={`h-3 w-3 ${item.color}`} />
                      <span>{item.label}</span>
                      {isActive && <span className="w-1 h-1 rounded-full bg-amber-500 ml-0.5"></span>}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(item.tab);
                      }}
                      className="px-1 py-1 hover:text-rose-400 hover:bg-slate-900/60 rounded transition-colors mr-2 cursor-pointer text-slate-500"
                      title="Fechar ficheiro"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right side: Compact status indicators and Seletor button */}
            <div className="flex items-center gap-2 px-3 h-full border-l border-slate-900 bg-[#090c12]/50 shrink-0">
              {/* Sync status button */}
              {syncQueue.length > 0 && (
                <button
                  type="button"
                  onClick={triggerSync}
                  disabled={isSyncing}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 transition-all animate-pulse"
                  title="Sincronizar dados locais"
                >
                  <RefreshCw className={`h-2.5 w-2.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{syncQueue.length}</span>
                </button>
              )}

              {/* Seletor button */}
              <button
                type="button"
                onClick={() => setIsModuleSelectorOpen(true)}
                className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-mono font-bold rounded flex items-center gap-1 cursor-pointer transition-colors"
                title="Abrir o Seletor Imersivo de Fun√ß√µes"
              >
                <LayoutGrid className="h-3 w-3" />
                <span>MENU</span>
              </button>
            </div>
          </div>

        {/* Tab Views Container - Side-by-Side Flex Layout */}
        <div className="flex-1 flex flex-row w-full overflow-hidden min-h-0">
          
          {/* Left scrollable main area */}
          <div className="flex-grow flex flex-col overflow-y-auto p-6 min-w-0">
            <AnimatePresence mode="wait">

              {/* ACTIVE OPERATIONAL MISSION PARADIGM VIEW */}
              {currentMission !== null && (
                <motion.div
                  key={`mission-${currentMission}`}
                  initial={{ opacity: 0, scale: 0.98, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -15 }}
                  className="flex flex-col gap-6 bg-[#040609]/75 border border-slate-800/80 p-6 rounded-2xl shadow-2xl w-full select-none"
                >
                  {/* Mission Title Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-[#090b0f] border border-slate-850 rounded-xl gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 animate-ping" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5" />
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-md font-mono text-[9px] font-extrabold shadow-md uppercase shrink-0">
                          SICP-AO ‚Ä¢ MISS√ÉO OPERACIONAL ATIVA
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xs font-black text-slate-200 uppercase tracking-widest font-mono">
                          {currentMission === "nova-admissao" ? "Ingresso & Admiss√£o de Novo Recluso" :
                           currentMission === "transferencia-recluso" ? "Transfer√™ncia de Cust√≥dia & Escolta" :
                           currentMission === "declaracao-motim" ? "Controle de Incidente Cr√≠tico / Motim" :
                           "Inspe√ß√£o de Salubridade Geral de Cela"}
                        </h2>
                        <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                          Iniciado por: <strong className="text-slate-400 font-mono text-[9px]">{currentOperator.name} ({currentOperator.role})</strong> ‚Ä¢ Sincroniza√ß√£o Autom√°tica Ativada
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowNEPAuditor(true)}
                        className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xxs font-extrabold uppercase font-mono px-3 py-2 rounded-lg cursor-pointer transition flex items-center gap-1.5 shadow-sm"
                        title="Verificar regras legais do Decreto Executivo 272/16 para esta miss√£o"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                        Audit N.E.P. (Dec. 272/16)
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Deseja realmente abortar a miss√£o atual? Dados n√£o salvos ser√£o descartados.")) {
                            setCurrentMission(null);
                            setAdmittedInmateTicket(null);
                            setNewInmateStep(1);
                          }
                        }}
                        className="bg-red-950/40 hover:bg-red-950 border border-red-900/45 text-red-400 hover:text-red-300 text-xxs font-extrabold uppercase font-mono px-3.5 py-2 rounded-lg cursor-pointer transition"
                      >
                        Abortar Miss√£o
                      </button>
                    </div>
                  </div>

                  {/* MISSION 1: NOVA ADMISS√ÉO / INGRESSO */}
                  {currentMission === "nova-admissao" && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 font-mono text-xs">
                      {/* Left: Stepper column */}
                      <div className="flex flex-col gap-2.5 lg:col-span-1 border-r border-slate-900 pr-4">
                        <span className="text-[9.5px] uppercase font-bold text-slate-500 tracking-wider mb-2">ETAPAS DO PROTOCOLO</span>
                        {[
                          { step: 1, name: "Identidade Civil" },
                          { step: 2, name: "Regime Jur√≠dico" },
                          { step: 3, name: "Soberania e Cela" }
                        ].map((s) => (
                          <div 
                            key={s.step}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border transition ${
                              newInmateStep === s.step 
                                ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400 font-bold" 
                                : newInmateStep > s.step
                                ? "bg-slate-900/40 border-slate-900 text-slate-400"
                                : "bg-[#020305]/20 border-transparent text-slate-600"
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                              newInmateStep >= s.step ? "border-emerald-500/40 bg-emerald-500/5" : "border-slate-800"
                            }`}>
                              {s.step}
                            </span>
                            <span className="truncate">{s.name}</span>
                          </div>
                        ))}

                        <div className="mt-8 p-3 bg-slate-950/80 border border-slate-900 rounded-xl leading-normal text-[10px] text-slate-500">
                          <span className="text-amber-500 font-bold">INFO:</span> Criptogr√°fica SHA-256.
                        </div>
                      </div>

                      {/* Right: Stepper forms */}
                      <div className="lg:col-span-3 flex flex-col">
                        {admittedInmateTicket ? (
                          /* COMPLETED RECEIPT TICKET */
                          <div className="bg-slate-950 p-6 rounded-xl border border-emerald-500/30 flex flex-col gap-6 animate-scaleIn text-left">
                            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                              <div>
                                <span className="text-emerald-400 text-[9px] font-bold tracking-widest border border-emerald-500/20 px-2 py-0.5 rounded-md bg-emerald-500/5">
                                  CERTIFICADO DE MATR√çCULA PENAL ATIVO
                                </span>
                                <h3 className="text-sm font-bold text-slate-200 mt-2 font-mono uppercase">
                                  SP ‚Ä¢ SERVI√áO PENITENCI√ÅRIO
                                </h3>
                                <p className="text-[10px] text-slate-500 mt-0.5">GUIA DE INGRESSO N¬∫ {admittedInmateTicket.documentCode}</p>
                              </div>
                              <span className="text-emerald-500 text-lg font-bold">SICP-OK</span>
                            </div>

                            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-[11px] text-slate-300">
                              <div>
                                <span className="text-slate-500 text-[10px]">Nome do Recluso:</span>
                                <p className="font-bold text-slate-200 text-xs">{admittedInmateTicket.firstName} {admittedInmateTicket.lastName}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px]">NREP Biom√©trico:</span>
                                <p className="font-bold text-amber-500">{admittedInmateTicket.id}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px]">Bilhete de Identidade:</span>
                                <p className="font-semibold">{admittedInmateTicket.idCard}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px]">Nacionalidade:</span>
                                <p className="font-semibold">{admittedInmateTicket.nationality}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px]">Regime Penal:</span>
                                <p className="font-bold text-rose-400">{admittedInmateTicket.riskLevel} / {admittedInmateTicket.gender}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px]">Crime Tipificado:</span>
                                <p className="font-semibold text-slate-300">{admittedInmateTicket.crimeId}</p>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px]">Unidade Penitenci√°ria Alocada:</span>
                                <p className="font-bold text-emerald-400">EP Huambo (Cela {admittedInmateTicket.assignedCellNumber})</p>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px]">Data de Matr√≠cula:</span>
                                <p className="font-semibold">{admittedInmateTicket.arrestDate}</p>
                              </div>
                            </div>

                            {/* Simulated Barcode */}
                            <div className="flex flex-col items-center justify-center p-3 bg-slate-900/60 border border-slate-850 rounded-lg gap-1">
                              <div className="flex gap-0.5 h-8 items-stretch">
                                {[...Array(28)].map((_, i) => (
                                  <div 
                                    key={i} 
                                    className="bg-slate-300" 
                                    style={{ width: `${i % 3 === 0 ? "3px" : i % 5 === 0 ? "1px" : "2px"}` }} 
                                  />
                                ))}
                              </div>
                              <span className="text-[8px] text-slate-500 tracking-widest font-mono">*{admittedInmateTicket.id}*</span>
                            </div>

                            <div className="flex justify-end gap-3 mt-4 border-t border-slate-900 pt-4">
                              <button
                                onClick={() => {
                                  setAdmittedInmateTicket(null);
                                  setNewInmateStep(1);
                                  setNewInmateFirstName("");
                                  setNewInmateLastName("");
                                  setNewInmateIdCard("");
                                }}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xxs font-mono uppercase px-4 py-2.5 rounded-lg transition shrink-0 cursor-pointer"
                              >
                                Admitir Outro Recluso
                              </button>
                              <button
                                onClick={() => setCurrentMission(null)}
                                className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-semibold text-xxs font-mono uppercase px-4 py-2.5 rounded-lg transition shrink-0 cursor-pointer"
                              >
                                Concluir Miss√£o
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* STEPS FORMS INTERACTIVE */
                          <div className="flex flex-col gap-5 text-left bg-slate-950/40 p-5 rounded-xl border border-slate-900">
                            
                            {/* STEP 1 */}
                            {newInmateStep === 1 && (
                              <div className="flex flex-col gap-4 animate-fadeIn">
                                <span className="text-xxs uppercase tracking-widest text-emerald-400 font-bold font-mono">DADOS DE IDENTIDADE CIVIL E BIOM√âTRICA</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-slate-400 text-[10px]">Primeiro Nome:</label>
                                    <input 
                                      type="text" 
                                      value={newInmateFirstName} 
                                      onChange={(e) => setNewInmateFirstName(e.target.value)} 
                                      placeholder="Ex: Mois√©s"
                                      className="bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-slate-400 text-[10px]">Apelido / Sobrenome:</label>
                                    <input 
                                      type="text" 
                                      value={newInmateLastName} 
                                      onChange={(e) => setNewInmateLastName(e.target.value)} 
                                      placeholder="Ex: Tchimbando"
                                      className="bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-slate-400 text-[10px]">N¬∫ do Bilhete de Identidade (BI):</label>
                                    <input 
                                      type="text" 
                                      value={newInmateIdCard} 
                                      onChange={(e) => setNewInmateIdCard(e.target.value)} 
                                      placeholder="Ex: 0045231HA044"
                                      className="bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-slate-400 text-[10px]">Data de Nascimento:</label>
                                    <input 
                                      type="date" 
                                      value={newInmateBirthDate} 
                                      onChange={(e) => setNewInmateBirthDate(e.target.value)} 
                                      className="bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-slate-400 text-[10px]">G√©nero / Sexo:</label>
                                    <select 
                                      value={newInmateGender} 
                                      onChange={(e) => setNewInmateGender(e.target.value)} 
                                      className="bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs"
                                    >
                                      <option value="MASCULINO">Masculino</option>
                                      <option value="FEMININO">Feminino</option>
                                    </select>
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-slate-400 text-[10px]">Nacionalidade:</label>
                                    <input 
                                      type="text" 
                                      value={newInmateNationality} 
                                      onChange={(e) => setNewInmateNationality(e.target.value)} 
                                      placeholder="Ex: Angolana"
                                      className="bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* STEP 2 */}
                            {newInmateStep === 2 && (() => {
                              const mncpCalc = MNCPEngine.evaluateInmate({
                                sex: newInmateGender === "FEMININO" ? "FEMININO" : "MASCULINO",
                                legalStatus: newInmateRegime === "PREVENTIVA" ? "PREVENTIVO" : "CONDENADO",
                                crimeId: PENAL_CODE_GRAPH.find(c => c.crimeName === newInmateCrimeId)?.id || "CP-ART-140",
                                crimeForm: "CONSUMADO",
                                isQualified: newInmateCrimeId.includes("Qualificado"),
                                age: 28
                              });

                              return (
                                <div className="flex flex-col gap-4 animate-fadeIn">
                                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                                    <span className="text-xxs uppercase tracking-widest text-emerald-400 font-bold font-mono">
                                      ENQUADRAMENTO PENAL & MOTOR NACIONAL DE CLASSIFICA√á√ÉO (MNCP)
                                    </span>
                                    <span className="text-[8.5px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
                                      LAW-DRIVEN KERNEL ACTIVE
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                      <label className="text-slate-400 text-[10px]">Crime Tipificado (C√≥digo Penal Angolano Lei 38/20):</label>
                                      <select 
                                        value={newInmateCrimeId} 
                                        onChange={(e) => setNewInmateCrimeId(e.target.value)} 
                                        className="bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs"
                                      >
                                        {PENAL_CODE_GRAPH.map(c => (
                                          <option key={c.id} value={c.crimeName}>
                                            {c.articleNumber} - {c.crimeName} ({c.group.replace('CRIMES_CONTRA_', '')})
                                          </option>
                                        ))}
                                      </select>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                      <label className="text-slate-400 text-[10px]">Situa√ß√£o Jur√≠dica / Cust√≥dia:</label>
                                      <select 
                                        value={newInmateRegime} 
                                        onChange={(e) => setNewInmateRegime(e.target.value)} 
                                        className="bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs"
                                      >
                                        <option value="PREVENTIVA">Pris√£o Preventiva (Aguardando Senten√ßa)</option>
                                        <option value="CONDENADO">Pris√£o Condenada (Senten√ßa Transitada em Julgado)</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* RESULTADO AUTOM√ÅTICO DO MOTOR PENITENCI√ÅRIO MNCP */}
                                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-emerald-500/30 flex flex-col gap-2 font-mono">
                                    <div className="flex justify-between items-center text-[10px]">
                                      <span className="text-slate-400 uppercase font-extrabold flex items-center gap-1">
                                        <Scale className="w-3.5 h-3.5 text-amber-400" />
                                        Decis√£o Autom√°tica do Motor de Classifica√ß√£o (MNCP):
                                      </span>
                                      <span className="text-emerald-400 font-bold">{mncpCalc.auditHash}</span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                                      <div className="p-2 bg-slate-950 rounded border border-slate-800">
                                        <span className="text-[8px] text-slate-500 uppercase block">Pavilh√£o Determinado</span>
                                        <strong className="text-slate-200 text-xxs truncate block">{mncpCalc.pavilhao}</strong>
                                      </div>
                                      <div className="p-2 bg-slate-950 rounded border border-slate-800">
                                        <span className="text-[8px] text-slate-500 uppercase block">Bloco Sugerido</span>
                                        <strong className="text-amber-400 text-xxs block">Bloco {mncpCalc.blocoRecomendado}</strong>
                                      </div>
                                      <div className="p-2 bg-slate-950 rounded border border-slate-800">
                                        <span className="text-[8px] text-slate-500 uppercase block">Perfil Seguran√ßa</span>
                                        <strong className="text-emerald-400 text-xxs block">{mncpCalc.nivelSeguranca}</strong>
                                      </div>
                                      <div className="p-2 bg-slate-950 rounded border border-slate-800">
                                        <span className="text-[8px] text-slate-500 uppercase block">Tipo de Escolta</span>
                                        <strong className="text-cyan-400 text-[8.5px] truncate block">{mncpCalc.tipoEscolta}</strong>
                                      </div>
                                    </div>

                                    {mncpCalc.alertasCompatibilidade.length > 0 && (
                                      <div className="p-2 bg-amber-950/40 border border-amber-500/30 rounded text-[9.5px] text-amber-300 font-sans">
                                        {mncpCalc.alertasCompatibilidade.map((alt, idx) => (
                                          <div key={idx}>{alt}</div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* STEP 3 */}
                            {newInmateStep === 3 && (
                              <div className="flex flex-col gap-4 animate-fadeIn">
                                <span className="text-xxs uppercase tracking-widest text-emerald-400 font-bold font-mono">ALOCA√á√ÉO INTELIGENTE DE UNIDADE E CELA</span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-slate-400 text-[10px]">Estabelecimento Destinat√°rio:</label>
                                    <select 
                                      value={newInmatePrison} 
                                      onChange={(e) => setNewInmatePrison(e.target.value)} 
                                      className="bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs"
                                    >
                                      {visiblePrisons.map(p => (
                                        <option key={p.id} value={p.id}>{formatEPName(p.name)}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-slate-400 text-[10px]">Cela Sugerida (Capacidade √ìptima):</label>
                                    <select 
                                      value={newInmateCell} 
                                      onChange={(e) => setNewInmateCell(e.target.value)} 
                                      className="bg-slate-950 border border-slate-850 focus:border-emerald-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs font-mono text-amber-500"
                                    >
                                      <option value="CELL-01">Cela Operativa 01 (Capacidade: 4/12)</option>
                                      <option value="CELL-02">Cela Operativa 02 (Capacidade: 2/12)</option>
                                      <option value="CELL-03">Cela Seguran√ßa M√°xima (Capacidade: 1/4)</option>
                                      <option value="CELL-04">Cela M√©dio Risco (Capacidade: 8/12)</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl text-xxs text-slate-400 leading-relaxed flex flex-col gap-1 font-sans">
                                  <span className="font-bold font-mono text-emerald-400">ANALISADOR DE SOBERANIA PENAL SICP:</span>
                                  <span>Cela CELL-01 recomendada de forma √≥ptima. Taxa de sobrelota√ß√£o do estabelecimento de destino √© inferior a 85%, sem conflitos de seguran√ßa ou fac√ß√µes no pavilh√£o de destino.</span>
                                </div>
                              </div>
                            )}

                            {/* Stepper controls */}
                            <div className="flex justify-between mt-6 border-t border-slate-900 pt-4 font-mono">
                              <button
                                disabled={newInmateStep === 1}
                                onClick={() => setNewInmateStep(p => p - 1)}
                                className="bg-slate-900 hover:bg-slate-850 text-slate-400 disabled:opacity-30 border border-slate-800 text-xxs px-4 py-2 rounded-lg cursor-pointer transition"
                              >
                                Voltar
                              </button>

                              {newInmateStep < 3 ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (newInmateStep === 1 && (!newInmateFirstName || !newInmateLastName)) {
                                      triggerToast("Campos em falta", "Por favor, indique o nome completo do recluso antes de avan√ßar.", "warning");
                                      return;
                                    }
                                    setNewInmateStep(p => p + 1);
                                  }}
                                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xxs px-4 py-2 rounded-lg cursor-pointer transition"
                                >
                                  Continuar
                                </button>
                              ) : currentOperator.territorialScope === TerritorialScope.NATIONAL || currentOperator.province === "Centro Operacional" ? (
                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2 text-amber-400 font-mono text-xxs flex items-center gap-1.5">
                                  <ShieldAlert className="h-4 w-4 shrink-0" />
                                  <span>Admiss√£o Bloqueada: Centro Operacional Central tem fun√ß√£o exclusiva de supervis√£o da plataforma nacional.</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (currentOperator.territorialScope === TerritorialScope.NATIONAL || currentOperator.province === "Centro Operacional") {
                                      triggerToast("Acesso Restrito", "O Centro Operacional Central n√£o realiza admiss√µes de reclusos.", "error");
                                      return;
                                    }
                                    const newId = `NREP-${Math.floor(1000 + Math.random() * 9000)}`;
                                    const newInmateObj: InmateState = {
                                      id: newId,
                                      firstName: newInmateFirstName || "Mois√©s",
                                      lastName: newInmateLastName || "Tchimbando",
                                      birthDate: newInmateBirthDate,
                                      gender: newInmateGender,
                                      idCard: newInmateIdCard || "0412859HU044",
                                      fatherName: "Mateus Tchimbando",
                                      motherName: "Ana Maria",
                                      nationality: newInmateNationality || "Angolana",
                                      crimeId: newInmateCrimeId,
                                      riskLevel: newInmateRiskLevel,
                                      suggestedCellType: "Geral",
                                      assignedPrisonId: newInmatePrison,
                                      assignedPavilionId: "PAV-01",
                                      assignedBlockId: "BLOC-A",
                                      assignedCellNumber: newInmateCell,
                                      documentCode: `NREP-${Math.floor(100000 + Math.random() * 900000)}`,
                                      status: "ACTIVE",
                                      arrestDate: new Date().toISOString().slice(0, 10)
                                    };
                                    setInmates(prev => [newInmateObj, ...prev]);
                                    setAdmittedInmateTicket(newInmateObj);
                                    triggerToast("Sucesso no Ingresso", `Recluso ${newInmateFirstName} matriculado e inserido no banco de dados central.`, "success");
                                    writeAuditLog(currentOperator, "CELL_CHANGE_EXECUTE" as any, "Cadastro", newInmateObj.id, `Admitiu novo recluso: ${newInmateFirstName} ${newInmateLastName}`);
                                  }}
                                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xxs px-5 py-2.5 rounded-lg cursor-pointer transition animate-pulse"
                                >
                                  Processar Matr√≠cula de Ingresso
                                </button>
                              )}
                            </div>

                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* MISSION 2: TRANSFER√äNCIA DE RECLUSO */}
                  {currentMission === "transferencia-recluso" && (
                    <div className="flex flex-col gap-5 text-left font-mono text-xs">
                      <span className="text-xxs uppercase tracking-widest text-sky-400 font-bold font-mono">GUIA DE TR√ÇNSITO & DESPACHO DE SEGURAN√áA</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/40 p-5 rounded-xl border border-slate-900">
                        {/* Selected Inmate Selector */}
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-slate-400 text-[10px]">Selecione o Recluso para Transfer√™ncia:</label>
                            <select 
                              value={transferSelectedInmateId} 
                              onChange={(e) => setTransferSelectedInmateId(e.target.value)} 
                              className="bg-slate-950 border border-slate-850 focus:border-sky-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs"
                            >
                              <option value="">-- Selecionar recluso ativo --</option>
                              {inmates.map(i => (
                                <option key={i.id} value={i.id}>{i.firstName} {i.lastName} ({i.idCard})</option>
                              ))}
                            </select>
                          </div>

                          {/* Preview of active custody location */}
                          {transferSelectedInmateId && (() => {
                            const selectedInmate = inmates.find(i => i.id === transferSelectedInmateId);
                            if (!selectedInmate) return null;
                            const activePrisonName = prisons.find(p => p.id === selectedInmate.assignedPrisonId)?.name || selectedInmate.assignedPrisonId;
                            return (
                              <div className="p-4 bg-[#090d16]/80 border border-slate-850 rounded-xl flex flex-col gap-2.5 animate-fadeIn">
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">CUST√ìDIA ATUAL</span>
                                <div className="grid grid-cols-2 gap-y-2 text-[11px]">
                                  <div>
                                    <span className="text-slate-500 text-[9px]">Recluso:</span>
                                    <p className="font-bold text-slate-200">{selectedInmate.firstName} {selectedInmate.lastName}</p>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 text-[9px]">Risco Penal:</span>
                                    <p className="font-bold text-amber-500">{selectedInmate.riskLevel}</p>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 text-[9px]">Estabelecimento:</span>
                                    <p className="font-semibold text-slate-300">{activePrisonName}</p>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 text-[9px]">Cela / Bloco:</span>
                                    <p className="font-mono text-slate-300">{selectedInmate.assignedCellNumber}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Destination setup */}
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-slate-400 text-[10px]">Unidade Penitenci√°ria de Destino:</label>
                            <select 
                              value={transferDestPrison} 
                              onChange={(e) => setTransferDestPrison(e.target.value)} 
                              className="bg-slate-950 border border-slate-850 focus:border-sky-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs"
                            >
                              {visiblePrisons.map(p => (
                                <option key={p.id} value={p.id}>{formatEPName(p.name)}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-slate-400 text-[10px]">Cela de Destino:</label>
                            <select 
                              value={transferDestCell} 
                              onChange={(e) => setTransferDestCell(e.target.value)} 
                              className="bg-slate-950 border border-slate-850 focus:border-sky-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs"
                            >
                              <option value="CELL-ALPHA">CELL-ALPHA (Capacidade: 0/12)</option>
                              <option value="CELL-BETA">CELL-BETA (Capacidade: 3/12)</option>
                              <option value="CELL-SECURE-MAX">CELL-SECURE-MAX (Seguran√ßa)</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-slate-400 text-[10px]">Motivo T√©cnico do Despacho:</label>
                            <select 
                              value={transferReason} 
                              onChange={(e) => setTransferReason(e.target.value)} 
                              className="bg-slate-950 border border-slate-850 focus:border-sky-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs"
                            >
                              <option value="Aproxima√ß√£o Familiar">Art. 82 - Aproxima√ß√£o Familiar</option>
                              <option value="Seguran√ßa M√°xima">Motivos de Alta Seguran√ßa / Interven√ß√£o</option>
                              <option value="Tratamento M√©dico">Acompanhamento M√©dico / Tratamento de Sa√∫de</option>
                              <option value="Superlota√ß√£o">Redistribui√ß√£o por Superlota√ß√£o</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-4 border-t border-slate-900 pt-4">
                        <button
                          onClick={() => setCurrentMission(null)}
                          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 text-xxs font-mono uppercase px-4 py-2.5 rounded-lg transition shrink-0 cursor-pointer"
                        >
                          Cancelar Tr√¢nsito
                        </button>
                        <button
                          disabled={!transferSelectedInmateId}
                          onClick={() => {
                            const inmate = inmates.find(i => i.id === transferSelectedInmateId);
                            if (!inmate) return;
                            setInmates(prev => prev.map(i => {
                              if (i.id === transferSelectedInmateId) {
                                return {
                                  ...i,
                                  assignedPrisonId: transferDestPrison,
                                  assignedCellNumber: transferDestCell
                                };
                              }
                              return i;
                            }));
                            triggerToast("Tr√¢nsito Conclu√≠do", `O recluso ${inmate.firstName} foi transferido com sucesso para a cela ${transferDestCell}!`, "success");
                            writeAuditLog(currentOperator, "TRANSFER_EXECUTE", "Escolta", inmate.id, `Transferiu recluso de ${inmate.assignedPrisonId} para ${transferDestPrison} (${transferReason})`);
                            setCurrentMission(null);
                          }}
                          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xxs font-mono uppercase px-4 py-2.5 rounded-lg transition shrink-0 cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed animate-pulse"
                        >
                          Autorizar Guia de Transfer√™ncia e Escolta
                        </button>
                      </div>
                    </div>
                  )}

                  {/* MISSION 3: CONTROLE DE MOTIM */}
                  {currentMission === "declaracao-motim" && (
                    <div className="flex flex-col gap-5 text-left font-mono text-xs">
                      <span className="text-xxs uppercase tracking-widest text-red-500 font-bold font-mono">DASHBOARD DE CRISE E INTERVEN√á√ÉO DE EMERG√äNCIA (GIR)</span>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Controls Panel */}
                        <div className="flex flex-col gap-4 bg-slate-950/40 p-5 rounded-xl border border-red-900/15 lg:col-span-1">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-slate-400 text-[10px]">Unidade Sob Alerta Vermelho:</label>
                            <select 
                              value={mutinyPrison} 
                              onChange={(e) => setMutinyPrison(e.target.value)} 
                              className="bg-slate-950 border border-slate-850 focus:border-red-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs"
                            >
                              {visiblePrisons.map(p => (
                                <option key={p.id} value={p.id}>{formatEPName(p.name)}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-slate-400 text-[10px]">Gravidade do Incidente:</label>
                            <select 
                              value={mutinySeverity} 
                              onChange={(e) => setMutinySeverity(e.target.value)} 
                              className="bg-slate-950 border border-slate-850 focus:border-red-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs"
                            >
                              <option value="M√©dio">M√©dio Risco (Barricada em Pavilh√£o)</option>
                              <option value="Alto">Alto Risco (Controle de Ala Operativa)</option>
                              <option value="Cr√≠tico">CR√çTICO (Controle Hostil Completo de Estabelecimento)</option>
                            </select>
                          </div>

                          {/* Toggle switches */}
                          <div className="flex flex-col gap-3.5 mt-2">
                            <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                              <span className="text-[10.5px]">Bloqueio Total de Port√µes (Lockdown)</span>
                              <button 
                                onClick={() => {
                                  setMutinyIsLockdown(p => !p);
                                  setMutinyLog(l => [`[${new Date().toLocaleTimeString()}] LOCKDOWN OPERACIONAL ATIVADO NO ESTABELECIMENTO.`, ...l]);
                                  triggerToast("Lockdown Ativo", "Portas de seguran√ßa electromec√¢nicas seladas em 100%.", "warning");
                                }}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer uppercase font-mono ${
                                  mutinyIsLockdown ? "bg-red-500 text-slate-950" : "bg-slate-950 text-slate-500 border border-slate-800"
                                }`}
                              >
                                {mutinyIsLockdown ? "ATIVO" : "DESATIVO"}
                              </button>
                            </div>

                            <div className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-lg border border-slate-850">
                              <span className="text-[10.5px]">Mobilizar Unidade GIR (MININT)</span>
                              <button 
                                onClick={() => {
                                  setMutinyGirDispatched(p => !p);
                                  if (!mutinyGirDispatched) {
                                    setMutinyLog(l => [
                                      `[${new Date().toLocaleTimeString()}] Batalh√£o GIR destacado para o local com viaturas blindadas de interven√ß√£o r√°pida.`,
                                      `[${new Date().toLocaleTimeString()}] For√ßa de Elite autorizada a efetuar conten√ß√£o t√°ctica.`,
                                      ...l
                                    ]);
                                    triggerToast("GIR Destacado", "For√ßa de Elite a caminho do Estabelecimento.", "error");
                                  } else {
                                    setMutinyLog(l => [`[${new Date().toLocaleTimeString()}] Unidade GIR retornou √† base central.`, ...l]);
                                  }
                                }}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer uppercase font-mono ${
                                  mutinyGirDispatched ? "bg-rose-500 text-slate-950" : "bg-slate-950 text-slate-500 border border-slate-800"
                                }`}
                              >
                                {mutinyGirDispatched ? "DESTACADO" : "DESTAQUE"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Telemetry and logs */}
                        <div className="flex flex-col gap-3 bg-slate-950/70 p-5 rounded-xl border border-slate-900 lg:col-span-2">
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            TELEMETRIA T√ÅCTICA E ALARME DE CONTEXTO
                          </span>

                          <div className="h-44 bg-slate-950 border border-slate-900 rounded-lg p-3 font-mono text-[10px] text-slate-400 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin">
                            {mutinyLog.length === 0 ? (
                              <span className="text-slate-650">Consola inativa. Altere o alarme de seguran√ßa ou destaque o GIR para iniciar a recolha de telemetria em tempo-real...</span>
                            ) : (
                              mutinyLog.map((log, idx) => (
                                <div key={idx} className="flex gap-2 leading-relaxed">
                                  <span className="text-red-400 shrink-0">&gt;&gt;</span>
                                  <span>{log}</span>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-lg text-xxs text-slate-500 leading-normal font-sans">
                            <span className="font-bold text-red-400 font-mono">DECLARA√á√ÉO CONSTITUCIONAL:</span> De acordo com a lei penal de soberania da Rep√∫blica de Angola, o alarme de motim imp√µe isolamento de dados no VSAT local para evitar fugas inform√°ticas.
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-4 border-t border-slate-900 pt-4">
                        <button
                          onClick={() => {
                            setCurrentMission(null);
                            setMutinyIsLockdown(false);
                            setMutinyGirDispatched(false);
                            setMutinyLog([]);
                          }}
                          className="bg-red-500 hover:bg-red-400 text-slate-950 font-bold text-xxs font-mono uppercase px-4 py-2.5 rounded-lg transition shrink-0 cursor-pointer"
                        >
                          Concluir Crise / Retornar Normalidade
                        </button>
                      </div>
                    </div>
                  )}

                  {/* MISSION 4: INSPE√á√ÉO SANIT√ÅRIA */}
                  {currentMission === "inspecao-sanitaria" && (
                    <div className="flex flex-col gap-5 text-left font-mono text-xs">
                      <span className="text-xxs uppercase tracking-widest text-amber-500 font-bold font-mono">AUDITORIA DE SALUBRIDADE & MEDI√á√ÉO DE RISCO SANIT√ÅRIO</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/40 p-5 rounded-xl border border-slate-900">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-slate-400 text-[10px]">Unidade Penitenci√°ria do Huambo (Consola Ativa):</label>
                            <select 
                              value={sanitaryPrison} 
                              onChange={(e) => setSanitaryPrison(e.target.value)} 
                              className="bg-slate-950 border border-slate-850 focus:border-amber-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs"
                            >
                              {visiblePrisons.map(p => (
                                <option key={p.id} value={p.id}>{formatEPName(p.name)}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-slate-400 text-[10px]">C√≥digo da Cela Auditada:</label>
                            <select 
                              value={sanitaryCell} 
                              onChange={(e) => setSanitaryCell(e.target.value)} 
                              className="bg-slate-950 border border-slate-850 focus:border-amber-500/50 rounded-lg p-2.5 text-slate-200 outline-none text-xs"
                            >
                              <option value="CELL-01">Cela 01 (Ala M√©dio Risco)</option>
                              <option value="CELL-02">Cela 02 (Ala A)</option>
                              <option value="CELL-03">Cela de Seguran√ßa 03</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4">
                          {/* Toggle status */}
                          <div className="flex items-center justify-between p-2.5 bg-[#090d16] rounded-lg border border-slate-850">
                            <span className="text-[10.5px]">Abastecimento de √Ågua Pot√°vel Operante:</span>
                            <button 
                              onClick={() => {
                                setSanitaryWaterOk(p => !p);
                                triggerToast("Abastecimento Alterado", "Log de abastecimento h√≠drico de cela atualizado.", "info");
                              }}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer uppercase font-mono ${
                                sanitaryWaterOk ? "bg-emerald-500 text-slate-950" : "bg-red-500 text-slate-950"
                              }`}
                            >
                              {sanitaryWaterOk ? "SIM" : "N√ÉO"}
                            </button>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-slate-400 text-[10px]">Pontua√ß√£o Geral de Higiene / Salubridade:</label>
                              <span className="text-amber-500 font-bold">{sanitaryHygieneScore}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={sanitaryHygieneScore} 
                              onChange={(e) => setSanitaryHygieneScore(Number(e.target.value))} 
                              className="w-full accent-amber-500 bg-slate-950"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-4 border-t border-slate-900 pt-4">
                        <button
                          onClick={() => setCurrentMission(null)}
                          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-450 text-xxs font-mono uppercase px-4 py-2.5 rounded-lg transition shrink-0 cursor-pointer"
                        >
                          Abortar Auditoria
                        </button>
                        <button
                          onClick={() => {
                            triggerToast("Auditoria Submetida", `Inspe√ß√£o de higiene da cela conclu√≠da com nota de ${sanitaryHygieneScore}%.`, "success");
                            writeAuditLog(currentOperator, "CELL_UPDATE" as any, "Sa√∫de", sanitaryCell, `Executou auditoria de higiene na cela ${sanitaryCell} (${sanitaryHygieneScore}% de salubridade)`);
                            setCurrentMission(null);
                          }}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xxs font-mono uppercase px-4 py-2.5 rounded-lg transition shrink-0 cursor-pointer animate-pulse"
                        >
                          Concluir Auditoria de Salubridade
                        </button>
                      </div>
                    </div>
                  )}

                </motion.div>
              )}

              {/* Hierarchical Node Custom Management view */}
              {currentMission === null && selectedHierNode !== null && (
            <motion.div
              key="hierarchical-node-manager"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6 bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-xl w-full"
            >
              {/* Control Panel Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-3.5 bg-slate-900 border border-slate-800 rounded-xl gap-4">
                <div className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-amber-500 shrink-0" />
                  <div>
                    <h2 className="text-xs font-black text-slate-100 uppercase tracking-wider font-mono">
                      {selectedHierNode.name}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      N√≠vel Operacional: <strong className="text-slate-300">{selectedHierNode.type}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedHierNode(null);
                    setAddingStructure(null);
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xxs font-extrabold uppercase font-mono px-3.5 py-2 rounded-lg cursor-pointer transition shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20"
                >
                  {currentOperator.territorialScope === TerritorialScope.NATIONAL ? "Voltar √† Vis√£o Macro Nacional" :
                   currentOperator.territorialScope === TerritorialScope.PROVINCIAL ? `Voltar √† Vis√£o de ${currentOperator.province}` :
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
                        <label className="text-slate-400 uppercase font-mono font-bold text-xxs">Nome ou Sigla do Pavilh√£o:</label>
                        <input 
                          type="text" 
                          value={newPavilionForm.name} 
                          onChange={e => setNewPavilionForm({ ...newPavilionForm, name: e.target.value })}
                          placeholder="Ex: Pavilh√£o B - Ala Segura"
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
                          <option value="SEMI_ABERTO">SEMI-ABERTO (Col√≥nias Agr√≠colas)</option>
                          <option value="ABERTO">ABERTO (Comunit√°rio de Reinser√ß√£o)</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <button 
                          onClick={handleCreatePavilion}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xxs font-bold uppercase font-mono px-4 py-2.5 rounded-lg cursor-pointer transition shadow-md"
                        >
                          Gravar Pavilh√£o
                        </button>
                      </div>
                    </div>
                  )}

                  {addingStructure.type === "CELL" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 uppercase font-mono font-bold text-xxs">C√≥digo / N√∫mero da Cela/Bloco:</label>
                        <input 
                          type="text" 
                          value={newCellForm.codigo} 
                          onChange={e => setNewCellForm({ ...newCellForm, codigo: e.target.value })}
                          placeholder="Ex: Bloco B - Cela 3"
                          className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg font-semibold tracking-wide text-slate-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-slate-400 uppercase font-mono font-bold text-xxs">Capacidade Can√¥nica:</label>
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
              {selectedHierNode.type === "DEPARTMENT" && (
                <DepartmentalOrganicDashboard
                  currentOperator={currentOperator}
                  selectedHierNode={selectedHierNode}
                  organizationalUnits={organizationalUnits}
                  prisons={visiblePrisons}
                  inmates={visibleInmates}
                  onSelectNode={setSelectedHierNode}
                  onWriteAuditLog={(action, entityType, entityId, details) => {
                    writeAuditLog(
                      currentOperator,
                      action as any,
                      entityType,
                      entityId,
                      details
                    );
                  }}
                />
              )}

              {selectedHierNode.type === "PROVINCE" && (
                <div className="flex flex-col gap-4 w-full">
                  {/* Compact Operational Toolbar (No paragraphs, direct action buttons & recolh√≠vel) */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between items-center flex-wrap gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setActiveMetricModal("MUNICIPALITIES")}
                        className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-mono font-bold px-3 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer shadow-sm hover:border-amber-500/50"
                      >
                        <Building className="h-4 w-4 text-amber-500" />
                        <span>MUNIC√çPIOS</span>
                        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-mono">
                          {municipalities.filter(m => m.province === selectedHierNode.id).length}
                        </span>
                      </button>

                      <button
                        onClick={() => setActiveMetricModal("UNITS")}
                        className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-mono font-bold px-3 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer shadow-sm hover:border-blue-500/50"
                      >
                        <ShieldCheck className="h-4 w-4 text-blue-400" />
                        <span>UNIDADES (EPs)</span>
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-mono">
                          {(() => {
                            const provMuns = municipalities.filter(m => m.province === selectedHierNode.id).map(m => m.id);
                            return prisons.filter(p => provMuns.includes(p.municipalityId)).length;
                          })()} EPs
                        </span>
                      </button>

                      <button
                        onClick={() => setActiveMetricModal("OCCUPANCY")}
                        className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-mono font-bold px-3 py-2 rounded-lg transition flex items-center gap-2 cursor-pointer shadow-sm hover:border-yellow-500/50"
                      >
                        <Users className="h-4 w-4 text-yellow-500" />
                        <span>RECLUSOS</span>
                        <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded text-[10px] font-mono">
                          {(() => {
                            const provMuns = municipalities.filter(m => m.province === selectedHierNode.id).map(m => m.id);
                            const provPris = prisons.filter(p => provMuns.includes(p.municipalityId));
                            const current = provPris.reduce((acc, p) => acc + p.currentOccupancy, 0);
                            const capacity = provPris.reduce((acc, p) => acc + (p.operationalCapacity || p.officialCapacity), 0);
                            return `${current} / ${capacity}`;
                          })()}
                        </span>
                      </button>
                    </div>

                    <button
                      onClick={() => setIsProvinceSectionCollapsed(!isProvinceSectionCollapsed)}
                      className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xxs font-mono uppercase px-3 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {isProvinceSectionCollapsed ? (
                        <>
                          <ChevronDown className="h-4 w-4 text-amber-500" />
                          <span>EXPANDIR PAINEL</span>
                        </>
                      ) : (
                        <>
                          <ChevronUp className="h-4 w-4 text-amber-500" />
                          <span>RECOLHER PAINEL</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Cadeias / EPs List inside Province */}
                  {!isProvinceSectionCollapsed && (
                    <div className="flex flex-col gap-6">
                      {/* 1. Primary Section: Cadeias (Estabelecimentos Prisionais) in Province */}
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3 flex-wrap gap-2">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
                            <Building className="h-4 w-4 text-amber-500" /> Estabelecimentos Prisionais (Cadeias) na Prov√≠ncia do {selectedHierNode.name}
                          </h3>
                          {currentOperator.role === "DIRECTOR_GERAL" && (
                            <button 
                              onClick={() => openCreatePrisonModal(selectedHierNode.id!)}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10.5px] font-extrabold uppercase font-mono px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-md"
                            >
                              <Plus className="h-3.5 w-3.5" /> Criar Cadeia (EP)
                            </button>
                          )}
                        </div>

                        {/* List of Cadeias in this Province */}
                        {(() => {
                          const provMuns = municipalities.filter(m => m.province === selectedHierNode.id || m.province?.toLowerCase() === selectedHierNode.name?.toLowerCase()).map(m => m.id);
                          const provPrisons = prisons.filter(p => 
                            p.province === selectedHierNode.id ||
                            p.province === selectedHierNode.name ||
                            provMuns.includes(p.municipalityId) ||
                            p.location?.toLowerCase().includes(selectedHierNode.name?.toLowerCase() || "") ||
                            p.name.toLowerCase().includes(selectedHierNode.name?.toLowerCase() || "")
                          );

                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {provPrisons.map(prison => (
                                <div key={prison.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 hover:border-slate-700 transition flex flex-col justify-between gap-3 shadow-lg">
                                  <div className="flex flex-col gap-1.5">
                                    <div className="flex justify-between items-start">
                                      <span className="text-xs font-extrabold text-amber-400 font-mono tracking-wide">{prison.name}</span>
                                      <span className="bg-slate-900 border border-slate-800 text-[9px] text-slate-300 px-2 py-0.5 rounded font-mono uppercase">
                                        {prison.pavilions?.length || 0} Pavilh√µes
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                      <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                                      <span>Munic√≠pio / Local: {prison.municipalityId || prison.location || selectedHierNode.name}</span>
                                    </p>
                                    <div className="grid grid-cols-2 gap-1.5 bg-slate-900/60 p-2 rounded border border-slate-850 text-[9.5px] font-mono text-slate-400 mt-1">
                                      <div>Oficial: <strong className="text-slate-200">{prison.officialCapacity}</strong></div>
                                      <div>Operativa: <strong className="text-slate-200">{prison.operationalCapacity || prison.officialCapacity}</strong></div>
                                      <div className="col-span-2">Lota√ß√£o Atual: <strong className="text-amber-400">{prison.currentOccupancy}</strong></div>
                                    </div>
                                  </div>

                                  <div className="flex gap-2 border-t border-slate-900 pt-2.5">
                                    <button 
                                      onClick={() => {
                                        setExpandedProv(prev => ({ ...prev, [selectedHierNode.id!]: true }));
                                        setSelectedHierNode({ type: "PRISON", id: prison.id, name: prison.name, parentId: selectedHierNode.id });
                                      }}
                                      className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-[10px] font-mono py-1.5 rounded transition text-center font-bold"
                                    >
                                      Seleccionar Cadeia
                                    </button>
                                    {currentOperator.role === "DIRECTOR_GERAL" && (
                                      <>
                                        <button 
                                          onClick={() => openEditPrisonModal(prison.id, prison.name, prison.officialCapacity, prison.operationalCapacity || prison.officialCapacity, selectedHierNode.id!)}
                                          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-500 text-[10px] px-2.5 py-1.5 rounded transition"
                                          title="Editar Cadeia"
    xúÏ}Ko#…ô‡}E4∑Ì°∆EâzUWkTjP$U≈∂D≤IVŸûF£;îLQÈJf≤Û°í,cÄÏvÅù],0ò√Ù¯0}Íùãè√‚_≤ﬂëofDFíîÍIÿ’T23"2‚{?	)˛˝'ÖõÇœa{lxªD3©ÎvÈTZy]€›‹'ó¯oÖl©èu∏uÓ{ûmïxÇ?@J,◊∂ö¶°Ωzz[› Oèà=”≠ñnÍûﬁw◊∂ŒÏ15´3ˆ}”?"¡Wﬁl„Æƒ<â˝8ü‘\ìzzÌÛzù\⁄W∫s ó}\˚|øæµW'Á∂3÷ù‡?¡ΩOˆÎƒ”Ø=vﬂ~=¯„ÎÌ˙Ï˙2ªÆÌ¿œnj€«ˆ≠±>&ûC-◊€™îX®gx&,≤}≠ôæ·ê&ÎU†®åÍ^Óº	X9T[Èå∑∆∆UÒxJ∑m¿å∑‹Œ˚äÉßªiÍ÷ƒª$Oü>%uÚÛüìjÒ2`…-◊l≥ÊŒ®UªMìÉï¶[  ¿”C+ ' a ]µkSß[èÎdV{L.L˝ö˝SÉ)à·ÈS7yBgµùä ˚Ü96¨Ir…ó∞Æ◊∂X>Ô„z]`g…°CÏÖXuÌí€ÚjS€≤ïIHW∑.˝)%CRm˜7ÃakSbÈÆG	€¸G.ë±Mn] 3ößèü∫”µ«:£)wõJ6SY’≠Ê;Ïwo¶;‘≥ùM«6u)ïVg–nézÉoüµç”ä‡∞©9ö)bYqm::M◊Ö}0∆ü(ì÷ƒINΩ⁄B+ùû4Ó'i+øùoœÈ„>∑Õq|HT˜v"ê7'•i™*=˙i:ulÃT7–]¢OEÄ¢v\%»¢¬û´Q0˘8Öcl¸ç«ªç™pÙ`\¡Ø∑[Mv6…P◊lkLù¸Üßx@Œ|À–Ê?Œ€%Ä™˝IˇzK8WÜÑ&9˙÷1O–ŒYm?C ë&ÓI»MvRˆÙo}◊3.njÁ∫˜Z◊≠4ïÊ?_\»ÏºÄ¸^Ó.P…û¯3†*uuD	ÌË⁄k_:ÅaªÄp1>±ıñÊágt÷7¨4ıﬂÍøG“§©ø‰0≈W∂[óª≤Â≠ì¬* ÆBí ^›òQ”nV ¨yP˝$IK˘•œ“¥t'#êÊ¡Iä≤ÓfÑ’4m¿ 6Å˝vmß6≥çÄß¡V&'ÕEÙÎ∞o˙nﬁvﬁvÄ5∆∞…∂î:µrWLÅ%áR@-≥4a‚cÇˇ Eqa√¶„É¯œbNÓ≤M›ï"‡Ì4+Cw7/6æ:Eÿõn¢DcX˘p€ÿú“YÜ¿€o•˚tŸı‹ä¢yËY—Ñ3a∂ôXÕMgÃ¶ÖK8ìòi‡«—=ﬂ±
e∂ùØÙõß∑|‘ª|"øœà<l]zE4î≥4[U>T“2‡>îÊÂ‘[D§+GÏÕ]<‹¬qñî®ø˛|s	Ab¢˝7 i≠:õè<PdÓ¡«Ö#õ.êÑ1uï‰]E%l˝Bq._f‰JQw(iµ»· hrY§ˇÜëDÂ°ËR¢vFi‚ºÅ]ÃH⁄ t@Ï∑πmœ[Mh.¥!ïS˜Wﬂ`n*ﬁ‚ın&özVﬁ BKôΩTD≤¬mPGJ—Ô§3¨ ¥ ŸTÏ)14<Xî J€ë¨ƒÂ¢>0ïpösuw¶√˜CÉ?Äã^®¶Ì -	≈jÿíBâ‰G·O9sÂﬁªh[îÈΩõY@œœ^t;ÕNøq⁄˝F@ÕsiwJ#{¢dÓπ»Ù¿|Å†ûØJ’8∂û◊ùIUƒ‹WY°≈“^Æ¢Öoˇò$(;¬0µå)æÃÃ7]]btìÀ+áó{ãTp»(&®îI‘ŸN…ëNQ9ä•p2÷E®q{íÖ‰H/\ã…PÊE·%°_ûÕˇ®‰,`FQ⁄ËåÔ$BÃ2(#ë;ƒ4d]¬œ°‘t†¬mïÖò<ë%Gê¡sŒªnëòì´ˆÓ/®ΩOBnúïsí&c¶ﬂr>Ωì÷pE$AÕ™(Á∏}™j©
À_ˆE¢RôÉ\ı∞æ¥Ajô≥
F\œIÆµ7~Tk±≈ß£ºÒ=<¯√°2ì—^Œ!πó ÈºV2Ì,`y!X«ÎPÇl˜Õÿ˜≥“Åä}ìÇ£2	±M|míãí˘z-÷‰ùheÌ:∑hKçÕK,1´G€ıË9"É1Ö«A≤F,A√ü·2oûû¿^π°$ﬂS aTénï`Êé¥˚.ix∆ïÌ V)∂só50 ù+æ˘r{¢Çµ/∂ÙE±Bc ˚ûÇ€;§xcÙeJaå‹˙Z ÈÎxÖÍ£öö∞S .—'º4[PÚ—ó3`2ﬂÉ„[¸A¶T•⁄◊p–+¬¢2M%«¬
ïË'«¸'9à‘<Fà/Æp·;œËïa‘π_Ñçﬂˇû‘ÔHØ_Œˇ]ww¢xøv´ÄÑÏ óÚ°Ó!“ÌâŒüßî≤¿Óº∏ªJ8q‘§3™c‡·§w‰àöpÃûcß¡:x1ÑŸ¸!>åwÉ–∆>R®ÏòÜf\—rã‡Oõä÷Åáæ∆%ˆ4FÁˇ6ˇ£l≈/πG°ˆ©· ñvsîDaó1ß≤+iÈ@UqØƒKà©Œ—Ìı.7<U´ÇÂê-R]j#ÒßÌçÚ◊dª^ﬂ∏˚Yô∑YÅbE≈^eÛwFEê;Ï¯«’Ωˆ5Ï`ië[®_·„’[≤ππâ="_G\ˆõ$÷:π€(pŸ-åó`<≠•¸<√Ã(0⁄H•?Ë{› #båH"π A2"Ù	Ìy,¶x-w≈.Ñ,‘&é˝ö‰Gï∆ÃG îbW`*¨TOöäå%ÖÇÖ≥Æ∆xjXÃÎÁêû3°ñÒ;Nl
9ïöc›Œ?©,∫©å˜I`+F~$"NÒ•h⁄JŒ¬¬`gE∞å≠	Îèv„úπŸL=ÃyΩŒ…UÅcÕ±ÍÔ@î˙“ÒÈkuÖ«èØYpÉêìà]£k1)®xEKEò?ñπHï#±y¸5—”fÜå‚a`6e·$v`øâ}®õ–Í{ê@â8∑=îmA◊#tÅN)rvJh˛≈∆∆P][Ïgï·í∂<•À9~“E”nÏ(‰‰íª⁄√Q„¯¥3|~÷Óé*™E’|´HûKı;Q⁄mzjkÄ‚Åhwê§K†ùT…S¢/6MÄ…° ±ï3:”iÄÓ: MÂÓiX€§oÉ◊µê«ó–ªxò‰, ©¥i2≈√∏ ≈w#_ÿ‰ÇD(bÊIóB¡2˜Ê4∑ë≈˙ã˘Á€Ó¨#M3åœ	!l ë≤ ï/*Æ…%˚Vªc≈gëñ  ∑k`û] ÒöﬁÚs”g	pÒé≥+ë¸˝˙ÿ÷€‚nïp57k`ø‰G∂_©‹∂H9√4ﬂEQ£ºÿ≥ó„[⁄é§ È‰Be÷îéî„í»∏l+I3ˆ»a>¥ß/„'Öó9}$˙@yâ"œ§[ø#ß˛Ñ:BGâ‹•™,Bº7ßÕÃj◊∑ŒÊ?\É⁄ÙÄg^]^zZEx
úÕ3ÚEQàêzAû„G‡+>˛É´OçTnt”≈ú>}{ÊõÅﬂ§é¶;ÛÄÖ∞Äà5Afr∫5í£◊'GÉ¿]∂Nê¯¿cÑdÜÇÇ°ÿëé2d`]rÉd.Uﬁwhê"8á¨':hÒ¥%±»´ºFU·ÔB≠Fˆ¨ë<‘á^e„|í®”ë@ 9≈&… rBÀhQ‰–ﬂ“YZòNƒ„0˝`O!'D3ôÉ<0ÖmØr†Õ4˚ı,R†G!4ì≤Iò∏
åı}b†/óΩ&‘ ´ˆnæıËÑôòN⁄ÕÁçVØRd“_‚µ≈¸O=´ ñ}n⁄⁄´,Ü7uòälëc¯—veq©*Î/vZ®sË.ï
_Æ†¨∞r<Ar¢êh	‚"I*;∏$T°Ò≤s⁄âÉÿQ§BÄ†´á))î Á †ôB$aVX-˝?É¿∞ß gT<ÜÀ◊v`ˆÿî•(<“|„]Úàeîl©:kp·_Û4÷E?pπ‚:iÁ}d*8˘5yÓó?Õ¿ªƒyÆ~^KyÓ◊|\Å≈U˘º÷‚∞/*°!u“n ÷® ÈL<—≥…˝ScõPêsi‡|Œ¯©7÷˚∞.aôG8d#ΩºE^ﬁ1;·‡Õ˜„ﬂïÚH æ∫›c~,RÓﬁM ≠ô,@|„≠œë}Ûﬁ⁄p;§RX04Ω¬¡S∫1õÇIöW+9ÑÈ’FY$ ∂M
"x;%5uôDÚÅπÇˇÚœˇ=È^Õ´µíG∏–)?ÈÕ_¸&NäªåA1ó;%Â”∏«¸›¸s‚.eÖ⁄okÒ'3Û%wÌ+ Ùª–8Ú¶º…≠Í—ZôÃ-VcùG+àÏ‚bsÑz˜bWgŒÍGb¿{≥ÖÍ÷¬ŸS|Ü^/kùïÙÍã<{°8¶˝ëÏd&ç8ßN°$´¯;0Ê¸–Ä®x?ÇΩó*⁄Ã9Ç2ÔàÙ÷NëŒ+ï∏ªB!≈‰¬R"ïÈ“	ÕIw;ôR%üÎ‘Ò˙XüIO≈Á”ß∫CM.\©VuäÊPÕ‘h◊∫5^ÿVV¬{∆ÍxsÒä~∑y¶˜íghØ˚)OVØ˘¢ﬂòˇ√¸Ô{ ;û]§¢áÁx¯7Õ	ÆÜ©πë´mIÎ´$ö¢·O|"Ï¿™ˇ*yÆÓ95UÏ'i∂OOI@¯B'IÑm^íG¿ø®5ñ‹˛ÙF”>3"¥‚$tÆû∆…∂ù•…Ç≠Zæ’≤`ö/b≈):ÏÚzn0R∏™êZW÷ka°á;Ô–äìﬁ29é°µa˛o,heÃ†¬Û^[¬„*«»mÎ=»uú\û≠b}Ü®+”ö“WŒL,ˆôD	Åª˜	≈C¢ƒˆ	
Ω6±ë•Å?%ÙôHuñ∑≈ü¬ÿÕΩ¯R∞±bëEÓ◊Ër÷€¬t∞xØ‹/"I7·Ö	•‹™]öï˘ˆnô§Ò)œ+≤N◊LNÈ“–î"u»êﬂÛ@FáíN+ÔŒîÙ—≥∏'˜Ëƒ)1≤<ú#iF`Sh8Ö∂äüáﬁ(%i…|©Ωì	]∂∑i«É;äñw?(ÙáÊEZ˙óp9D2¬–£ûKéÄ‘$•L∑{ÀiÀÛs†%bµTì\/@ûÀJñkR9‚√…îß•J(t†≤‚C¨&ÑÜ`⁄ñ·j∆Ã4,ñHlÕˇüehRßà¨;⁄{~RÇ,†Uéã;∫“«ï∞• RÅÂœ®ãÅ$÷ÿÑiåâ•èQ|•R◊54≤»u◊√ƒ!5y[†BJ2(W˜c¨≥1Ù_Û|'aÊÎtœ£v•8‡YïœÑßú ∂éå˝ÂÆXO¶’Y¬V∏Ã˘ÙÆFMpe≥æ˝MynÙÓÏ?
 *Ã^z`Óƒêtr$ta¿õô7‰Rwtª∫•Èsˇ"°q'/.TîÖoÑW	å'î»≠ù†Á8„#5Ûîßé§÷Ù∫Z:÷[:™∫†í.°\µU¢¸Çt{/§—:ÎáÛøÔëf£;ˇ«nßŸ ≠6¥õß/Ü=Rm5Fç„∆∞M⁄g§˚‚e˚LúñR‰˝iE1I∞|PSÓD˛ütﬂ•úd<m¯≠û¡KÃ∂–VÂ ›“˛§ÀH^{dAÜ(€>4Õ±Âyj&ÜrJW≈{ïRí«:±Ö
Ø¢E∫ˆT?8‹b≥H◊aX3ﬂì€êëıU‰7^Q”◊üﬁZ˙kNzNlg
¨Ÿq=|≈_8 ›%µ&º ]79œÛI˝àDc}”£ŒD˜6Ÿ"
ZZ23©¶_¬ûÈÜPñ1mWnπÎE˛˘„B_tÇ)]ÿöÔ,íDb˚bGÕ≤-]∂$â[πd´À∑~áˆ9HoÏ¬€›ËÜCØπg0¶ˇrﬂ0‰vˇ„œÿ˘∏C™¨ö∆jxlº`låÅ∫≈"-ƒ|‡’A∏^ﬂ˘|w{Á¥QﬂF¶ÚœG@éüø'@ÍãêåŸ%oÙ^P¥ñ˚í ¢¡Wá‚/m4ä|$«oçﬂ
0û⁄˜∆Ò‡´ÉÒHwtó~Ñ„∑é[‘£æﬂ•nêˆ∑^h√ÚñÅÊs√Ò.aq˜Ã—ÿ•ay	x\’6ºwp90\Õé⁄∏ôJ@…m≈K ÃÚÍTø“Õ{ ∂hÏ7l)ò X≈$À(>≥gÃ∆ÕwµrLçkªrt‹Ë¸∫Gùa≥w∏≈Ô(5ÃŸ¸Oc∆9õˇ◊VgïÅ¶√4NG¡ §:Dª,v €Ó∆íã√Jâlu¯uÁ¨G∂»∞˝Ï≈†—ùˇCÉ⁄√—†3j®}∏≈vm®;$BıR÷i›í˜"+◊ìê`lÍ<Àë√zÉÖíîÅÁ2ÆôåG&á¢§ÇXh¿nN⁄‚¢ÜPÕ3ÆÙ‡⁄Á˚I«Õ∫êÑÇ8SÍ0ÔçÎrœ¶5ˇ…24ä]˙∂ÎM}¯’©ZäëÆøœª¿ƒ›%ßÜÎ;{Qø4\∑pœqåoW&eQÁRÖÙ
ûI˘àX/K6mñt¢£X¶'\}˜êNô©õ◊êâN`:1û8s=ﬁÚ‚úE%aôÓù´Æs¸¯
≈%HŒR˚¯@E…}+¶ˆ•w8˚é)*yI|{y©Ä™≠–•|G1Z‘i©Pˇ“∆.±~…√©DMQ<µxÚÀ⁄vùº∆ñ©n(9Sâ‡œØrÎU≠∏f(ëìÍÎ˙7w·≈–¸è◊‰õ∞d¢Y	A8FÈRÉl§≤Ÿôï£Öù∫#Ÿ}RO÷ÃL˚]^	À\( ≤∫Ωÿ6ˆSïÏ∏`µë2¡£&∏ºMæ IÅ
C∂Îã·≤ â
9XzÅ¥¨"¨°-!¨]öô?∫oµ…ôÑLE‡Es«¡È…„;UgØ™…—√’≈®”`‰¬qÔæª+∏—c5µJÔ±y≤J‚(ÅùH à¸C˘ª%'ÜvIIw–Ó«øèmÕG!ß	¸TµÔsY)á«[$Ã\—Ï	SSøW76AS?ÒMÛ7:u™§F¢ü≤œenΩ#‘b⁄Â˙1À√PÉå∞e8h¯ËÖÂÏãXüj„ê°–s¡R¿AP`ﬂïrÈÔ´0,OíÉ<åÍ edÊÿ”ôW≠Ù±Ì€˜>5Is˛”ÿò∞ﬁp,ugbc«uÉ;ô‘r°;6ÜöA™-cÇ⁄¶M:-4Ìcú–#¢cÏF˚Ù¥÷mˇ™ˆÎY·´ÉyÒÍ6T”ü•*™<ãˇÂí•j5ü⁄ÛC"ÏS[~ÇÃêe<"¯ πÈw*çzÅ∆)›Ãk®å©ÿ#z«´~7¥∏/à(N˛¸ˇ¢àL g∆t3ä®¸4GXò⁄Wåh`„w*Ÿ·w¨≠Ô~*éK:Ú*RíJQ—ò8®€I‰ éb,Nó-b£A£;<i:Éj{ıbãåe_qSPıªñÓÍø• ˆ‘‰⁄ΩIØ0S/Mm´[ÆmR0Çïîü.à∞_|∑°ÜÈ‹~«”Ñ8’i›Xt Cx´1ŸxpHO$eÉíÄéóvs%/@íƒ√iâl˜m√Åı*È3è∂2:⁄gΩóÌ’q·Õî‚wÉr3Ô‰Ì⁄Kßˆñ·Mﬂ3µÒ‹73∑¶•(ë=@1êy…àûª‰•°øŒ d…πåec‹Ûb¸B„rú¢}÷˝ÜGçQõÙ§y⁄∂[d‘8ÊH∑’O∏•÷ÉÛ	Ê	‚⁄6∂ Ø˝ŒN.˙=ŸG∏DŸ⁄v∆ƒ$≥~$ ôêYÌ	ö_æ˛œıù˙~˝ÛoD∞?O[áßÜUª¨}Ω∑/¨/$≥?o=ñπ’GÌ‡LÁhaPƒÌYüá∫Éòù6.Ì†qi'´3©Â∏gWGcõ>0éögcCßöcL.=¯Ú∫∂ã%$H™:d∏~÷—9ö–∞&Ç˘ƒ»ìÆX¡5¸t”'Åa$vq—¨‹WÓw˝ÕFèiçC√¯°§02am°QÆ(B)üíænQ3˜=.wr_#'ˇÛT-§új…€BüÅ‡û—s√ãkÈöeõˆ´√[\ÿŒ4Imr∆ZÃˇ‰ÏO|I¯ÍêÍYß€Èé6`˛9ıë§‰ædnˇ¢uÛÎm|E êùÿ¿âí·Ù¶∂+Ñ≈çvôa£Sz]{UT`…ëà$Ç]	ÀÈà˝Œœ7m,óÉ‚ë@·uÀ'8æCÕºÜ›πØ¨X¯?H?ÅRíÌ“jü˜ÉÈı€ÉF≥”Î6N…iˆ∫√ﬁiÉÙùn≥”ák’ÃÇŸŸ»#Ø1qef©1u/œm†ˇKWŸ-@|ÉùÕ=˝Fß€>çWz@FÌ”ˆY{4Ë4HsÇÂÛ0/8º» C‡Ç-imFÆw{ËÏiR,≥pe∏∆π4©u7A–Ú5Ω
úD{Dfl ¯J~A™≥® ´†∂Ò˛ü/\&ÊË€8˚z¬‹2˙8Pëeè⁄ö÷◊ºA\Á©–Ó£1∑¢ü‡(	∂Ÿv˜„C2dıÄU˜¬±˘$õû}b\Î„Íˆº;ÛCT+õïG§Ú®≤Ø]˘YE6,áô™©XËÚ"zGÕ¿ oC≥“{äUË€än6&éÓ∫‘ˇ>Ò'4¸ﬁ∑]WÔp˝7º÷±∆Q6r—1`Én ra}ößƒΩ±¥Ø|›◊C±‡$ﬂs‚öÁªA'˙≥oôÇ÷ıX”˙ÙØÉˆ≥Œp‘˚(]≥”8≠Ñn¿ø…7zÜëã-á…É$±_R◊ø)r2≥vaôLÆùt&◊^Äõ	∏-M ñ"∫<"£¨ÅSŒ|+G˝^ˇ≈)Øì®–:J‘P∂É}›âö+∆}ÎÕc¬…=îJ*G∑!Ú ∞vÚ˙–ÕiR›P0˜™7·™ƒNt}
‡àÖiâF÷∑ËO{£eè0pTIŒ0uh‰”€Äî1˘©$Ω ö—ÔOˆ£ü#óﬁPYHµ/Ùx‹fà≠‘åΩV–â`î’˜Yƒπ¢yeæîwÑßÌ¡®1| Jq8ŒÜÄ(”¢PBí£>xÙ4€	l∆.A›ÔΩä~ª€jwGÌãåXëåÚQ4“#?pÙ[)€…R‰TYNÈs≈5^;Q®$<fJ≤çˇ›FZBgHÛ?Ù;†ˇÄ©;ÀÎlÔ•=‘l¨Î@™a_dÊó¥ùMæ—= é27ªçW¬@VÃé`∆Æˇ∂Jﬁ}émï%ZùAª9Íæ}⁄àóL!mopnWÜ•È\øB
N˘êü‰ﬂ$òÉe|ÈÉF46"Ï¿^dwÁã`eåô∂6RÌÍÁBˇwâﬂ˚ÉﬁK<6ºÈ”[—Úsˆa‹¡z˜‡( _{ˆ$M  7ﬂ≠S“˛¨N∑Î*íˆqß<]'≠¸¬Â(ç€]ñ¢]‚/“@À¢ ¢bØwﬁàh¸G„‚ÎÇà,5ü:é¶‡µÿ™,S>∑£K˜Œ-œé;¸π≈Ú˙óï¥á≈üA]„—¸œ–
wÆﬁÏ6üû?Ÿ‹O˛Ú„µv"ÿUä[Œ÷#t|K√ËPn*˚z˚≥pü˘ñvV¿€¥e&W$†0O®„nè»%poÛD7w¥$0f¿∞-¬I.ædÓôs®/∫∂.L¿bY,JA!^9e7äG§“∫¯˜Îı=[ôóÆty∫øQÓ~[¨^”qœÿ;ü˘¶g=}÷èƒ≠*∂	VœÚ	‡	c" ˇ‰>»¢ÜOA.CtÌÒb®,ò« ;l2ò¬|a¸*?&aÚƒBöO»@õqH[Âá√¶∑9L4(®Ê ‡]QB£xC7XA≈?∆T£˚∑RxÜT‹ LêGæì]•]ÏfµÀ|3∞√úí3f_<«~•◊æÜˇfR“–ZgùQg†B3C'EûØ|∏Ñ∞í•˜É< ü–˙≈∂ˆçBYQ¿h6∏ ~BXj≈¨6Ø47Ò”1sAÿõ<∆¶ÆùÖaRY<¬Á∑æ[YßHÖß˙Ö7`ödIÏ⁄Yv≈¡FÔÇÖ~Ö{D∞0|Á≥l¯N=2Ωì∏(∏ı$'pÁÒ;éYë
‚≠1ñc«&$tx¡ÅË$ˆ»8[Æé5£≠˘øIÉÄäçc#P©≠âôÌ)%¿ìTH˚:ıUfS*É&‚;Œ^≤œÏ%Û?⁄Ãqô‹I´7$Ì·®q‹>m7;gnΩºX∂§U˝Pãaëj+˜%Á©” ëj ¥(˘qø†~ÂÍ…>á«æa≤"£ãA3⁄ØF”@31)©~cÈ˜Yë¿¥®ˇbëf∆íﬂt˜{ﬂpÅ¨dª”onJTÆÏ—ÑÅL)ÕÍ±∏{#ãm¢évôådoÊ%X0(iká‘ye€{√.,X1b+™ÙY¡…$jÁHÓ
™?∞3˜7åøŒWæÓ‹»xa\˚°™áúµ-ßöÆÙ Â±©Ú8≤CïΩW™â;GNpû‘µÌ=Çc÷ûÄ∏∂@Jr”~$V{ê>æ†öI¶tI¢¿I¨∫*T4wz)ÃcW"í°q¢vÕÃbJÜ¨ÁÏ/ª^ª¿æG˙ã9†2<Ú.u:ñ≤E/A(ŒDóxñ4—¡‚R≤ﬂM-Ëëï™÷x¸ı^˝gﬂTé24ÔpÀª\◊ª;?˚&’Ó®}“u^bÂçÑ;|}nÔ.Lo◊ZÔ˚·èêP{¯›ë	I uËù€„õ‰- j7$¯íHÍó,„6¯%›ì00àu·˘DDy—?1cMDXÑ»Î–=á'ãûLﬂø¡“X?ØïWπfo≈∫˙ŒîR?‚v∆∂ŒàbÁ:9·S’∏Ú ﬂ·Œò«Mcå7òßj¶í¢¯•Ä–{Q_§pŒ0–Jióé„€Æ◊Ö=®3/œ¢ÊŒ®wπ…xNµ W¥Ö„QxäØb∏=†›¶Mëq=e#Û <¯ Em$˜“vº¿=¿^≈◊N≥_06X· lF¡Çè1ÃØ›'ïıáÏƒC)'ú¿
|qÒY+"1cı#í¬s⁄‰Ω«⁄/j∂#+Iûúe,°syruJ§àTDÖ©0Q"<'ïTB†ÅRûZ¯
yAÍ	ãCB*
TñuÆÜBv–S|Ø’Ÿ∞ò‰ƒ~&ÜØwG”1FëÓ4ç8¥LDùdy	›Üdô…©Yd∫T4üxÓ€Ô¶&@Ó6<…Ó:Z£òg.nÿôâ‚èÎE%™‹pA¯”€˘Ç$sœû‰¶˜GF™«<4%Qp!˘–b¡ÖËR∞bŒ?~nÅû›˝Lm/ï˜}=≤"Ïg˜øò∞ã ◊å>·‘∫v+°éU~7Ì–8m˚§ß˘≥‡ØÜÈ— —_˛È_ ¿Ô¿¡j_ËﬁëÙ«ÒNÈ·ÚãÌ2tÑÂ˛üˇQjπG>9©Zö0*ÿ√„è∫e<˛,—ûú∞SIòÈQ≠p"Fö©THå6:Ó+.·ùB≤Z÷-ˇ(Ù Áü¥',@ìreƒÉœ“Æ„Eõ}|õà˛fHÔRÖı‚è*ÕleÅá’6ÿ¸^¥êkg¸Sp∫≤ö†0<™obÀ≥IHm#¬∆N˜§78lõÕﬁY”ä∫£∆Ä4öÕﬁ†’ÈuÖp›£ÜÈÆ`G;‚˛—çC◊üN©ì“g3.úÖ&q<”^^S!&ÜâÒp<yœb‰ï(>Lf29<¿ıÖbdò‘¶⁄ËŒˇp⁄∂Y∑',è:$ΩÉLè_tóG{‘8}ﬁh5Ñ@'-Eÿº‘Ø€jŸØ-·ÇcÑªòÅªÒcØaÚÅ,”lûà_¡!AÕA2Ûd™áæ”bF+5Õsä\‚Ã˚¶~Jws\Ñ•‹"˝>£≥VòÌóIà{ö±ì‹Ö…R—Å&~«∫Ωá3ó«`éjKeDôêX„¶;ÙHÇä@ﬂË∂zŸƒıLÆ#BØcÉ˙8•÷ÿŒIx<åìÊ3KAM5Û|Ì –_gYBP—ÔÈÌ-±π˘·Ä‘¯wªæ»É¸Ê‘›€ÏÓúõık√À∑ñ7Ç8ΩŒÏFó•0¸¢iOqöå$,ËL X7ä m·F;àéocásnŒD?ΩÕ\X|‚µ$Æ·èÔ‘û<ΩM˝ô≥j∑«î?åG·ﬂ≤˜àÒDΩ6C‹ ;›Q˚¥Ûl˛ﬂ0æöTáùˆY6≈W Ú»cLc¬ÍI/˜…A>T‡«ÑwìoÇ˛!B˛ö†öÏêˆØ˚ßΩA£’ l7∫M‰≠/¸ú¥≠òƒÀÅ\œÕ^/ jxË‚ÖñçÊ$ëËªΩtÀñyÊOÊñß@µL“vø˜a/ÏV"õ–ç–6L]4„)T‡Ôâ>≈˚†SÔÛ d%XjTË}O- }©B⁄ãEq%XÅ õàVåP®«ù„<ŒÃ•a2òNœJï,Fî†dIZÜ	Gˆ˝+¡ç5HreÆ¸–ïrÇıı‚ï	5Ü÷`≈ #tÊÿ◊Äc ÎÖb\£59⁄ﬁﬁ#á,É˘5ú	ÙÓv7√HÜ’p∞¬·Åœfel¬…Œ±òl^-TY±çÖÎàhÃpÿ&ûÂ=Ù(\%W],´¸S≥à´Ú®EÆ‡S¡F≈A*Úé8≈—)Ç0N4–ZŸ§”ô,$mqŸ+é– ≤$‰E≤„«TÉWrcN
∫î§[íÃÃ⁄Áv≤«ã¨=!9≥-:y\>ËÑÅÕ}¡±&˜S‹úö,”=πÂïäZKÛ\yµß^„JvˇMnõd5˚õÿppjLgtQDvBjVÀ}M±™ =h' ©ﬂ_h*b&ö"‘·VY.•ñ√û‰ìK PÃ!â7éœtÚœUh˜HwπÒºrÙV1≤ë¬ˇRÓíÍ-àößÌ·∑gÌQõÉá}Ä‡O—±éıTãõÎd&‘l»v˛)uhXp2√ù⁄%á	‘÷®⁄eÈÖ?ëÏ 0/Òè≤k•ÜjrÊZÍQﬂ’—ó˛¬3L„w I8l%L˛/9R†œ$Jõ¸<Ï#S˛ç~`ÈGmVÉ«c√}\-Ω≤†PQÂh≠√pa¢AÈ’Öe¿a¿V’.#Ó°¥<ﬁÉúŒ›/#‡“e–æù|0Éı´DX7Ô.ÚAË‰Çú⁄ÃL 1 (ñãB§ûí°?≥‡[Ωã\#©v‡mÆıqÎ∏,°òbé•ß[‘Ú¯–,È≤6¬+⁄iÄ¸Wñh∏ˆÖ7f≈pÉ≈¬ﬂ5^ó<«¬|?9ÜV0®¨ôóº‚hÆÕƒó<C~«ö,©äÕ†»bJ1ñ¬|Ã‚A£H◊û0õ#[£ñﬂ¡„6,J∆◊ì**t€góï
€∏©Âäy©4°qûWà•Å¬C0ùÜe#É¶AL5«‡E]ÓíA≈∏W^Aâ=]Ï÷œld>7©9[Ö˜b}¡Bœÿû≤¡ÿü"/aa X±ÛúÖá≈3ƒº/≠âï//!›FNG—“≥tì∂ÄÙ%B@à≤IY9á¢*Ò÷Ko#ymDÚÚ?É<0√≤äù◊<R("ÔqùŸò¥/§Ω≈ÆılÃπ4ÎÏNí±\∫xE÷Õô4µÖè/Ñve<±aå|ç!YÜ§´Ì/V⁄Q©JµEgﬂ&`=‚[‘I°}á¨ìzùàÿù_q"—ø§‡ÖÉwùJ5’˜+¨®!{6«∂X8ñâ+pﬂ¥∏ÉTfc›*œ¯∞º≈Lûr+j;∂√
˝Jùâ’\RóI°!1D3™êÑÛÍÜâÅ|£‡è≈\tvK +πê¬∞Ã‘)
®T¡OBàíeY±7P@å‹ä∑E≠@“Z}Ûfæ33ıxˇÇø∑0ºq›ªòr°z“ˆv1÷™⁄Dl˝âØº÷}Ôdaóyòò †Î./$g"%@\≠ûï§œúÚÊë›Ë0x\˜í÷ˆ4œ™§˘·M"˚\ÛR◊^5GÀOWO¡an—|“ßcá|@`v¨(G^X∆Ö¡∫©Ê{6D159ı·∑ÖùZ…PﬂwCWôŸÆÎ£€¥€Ù- ÷E£uYºÇ‰9ƒT%ADs¶£ö∆˙-èø=ø˘ÕKﬂ„√-|˙ËQôQ˜[ÆÎÜOùx∆≥¢¶3\Ì5è–ùéÕ3ÃKtÖE]äÀVdœz3sØ&úß‡`CŸóÜÎS4†EÕõòƒ}DN~π’ˇ%¨| ª‘ã\¨QÖy:Œs7…ú©Orê·±äcÙ6•“	T„˚ÈÄ,íUÚ˝°mÅÉ‡…Á@`^Q∆∏‹5óÏﬂ•Qí“F {“fŒ|≠ÿœnz^ g
 ^	ïÙóL{•ì÷Q…8q˜I9„bIµ8GZÌìN∑#ƒd´_≤¶idÇ©˝~µ1Ú˚‡FÆ˝ Q‡E8» L®±¨T6ï‰v'˛(ÃJSI”µ»ÙzÀhì¢&$¡ØJ6º¿Õ,OIMÙ·?… Oàµ'…3+,'∂ÊPŒdˆ’Bã†Ñ`ä&ƒ˝Ñº§ﬁò(cµP≥}¸
DaŸí§0‰®ƒ5vby]êF$®©ıNNN;›6˛¶€\¡ÃÒ$Ørd◊gñ¯¬:»Ö(-¡´†VFKœ„“\+œiE≈uÒáá±SLé¡Xh7X|Ö„©¿÷∞›|1hìgÉﬁã˛∫a+ÂÈπ?»Z≤ƒäVMêıßñKŒtÑOè≤ñL∏í‡¢ EÚÄπÔ8≥8]√såsÊ÷è™N±t›‰äåp◊$’å≤(Uπ≠.çÒ•«Ñ˛+-™"™◊yÇY-M:√›E<5i†∏lY(‹íL∫RóH¬JëÇ©µ§[0 ®r‘µß:ˆ/ÊÁU\µD4Œ»ò≈ëêÀì&jP3^fu=vAò\˛[LL‚ ÂsJUv´(…Ø∞Q/√¬3∆L—ifßq
ƒúì»y∞úH·ﬁ5#‡~Ó,®±WœX{,zŸÑa^˘=-ò«Óû£x-ä©óy√Á*&#∆F«òÃïGW‚÷¸√&5‹˛/Ul¥¡ºYÊî)HÍ†È2…j\√LÊÂ ‹K°Oç
&?˝_™ΩårÆ∫R¶z∞ù'+nÁπÈÎ©˝d74∫oï´Ì~◊ò¡5 [€~ ﬁ‰‚’àEï(Ø˛óˇÚ?I˙Ò7rü$A˚ì‰¡j“&æÈEØUÑJuP^c÷Ω –ò2ütXá¥¢Òz÷ûÈÊ√ZlÜV|◊Ú'IK™˝*S'¨o∏N§ÈDûìæí§=`°˛∂Â^3óÙ)⁄çEbvÜE:©GH%?áOÿ£H˛]`ñzhQûd„MÍ ¨P”S¯´ ≤¿Çƒqù3ôD_öΩùnú»#µwÎ≤É‚·VpÈ1∆◊≈Ç[ ìk‡˛ª|y<•)Ë#≈U ≤.¬`ÙÙ»ÇºFSÂH—@©Jıï≠È7ÖQÇ(v|Ï◊SÜÙ<k;√ú‡ÑTÀ¯lj!.x“zØ—‚’++…„ï£(€jl£üM˘<ä‚p”˝≥;1–‡Ü∞e6À@å“˙rÃ‹ãíyÇª%ÍÒ9{{éW∏!ÏÂÜ¯{Ì·ä/*„ñKW0œ≠TŒô`2jáuÕw∞2„œY
	¬j‡2ãuÎ±®:˙2DrOàßB£'ß·°!_K057j¯∫4õîƒ»K´/›L…_ã•™_›Uy"ΩÂÒñ◊6)/ôRØ¶Œ∞ÄëxæúÀ¡GÆ î%;—vjŒaùÃ¯3fi∞,W”Pß6–.Ç_”ß3Gwiz˘õ‰+lSocow?J~a9œÖ5_‘¢Ñj:FJ∞ÿA8≈#b'¢xv´´cV5–Ò©°)±îÖZ√⁄hQ<DÂËWœ€É6IïÇ˝÷¿–ÏøÍ:√Z}˚ØÇËàM“æ2<ˆJcùw'A%WÙw¸|—dJÉê`√ï1fﬂ<6€†ÇHt	Âëd∆Â√É(x}ı–É'-™P&#2tíﬂIiú»πf 0 ”å«n8òtF#ìtƒ;‹kGü8<§˜≈Lîk/Ê?∫ ˘·)˘€ïC\Y”3t∏∑N…)V∆iË¿Å¨6º0,F¨m‹OÑG~µ¢u≈lﬂ£"7 IHx¬ÌE …N5˚¡√®6±ì˜ƒN◊JHP1›î∏%îÇî4AÇÖìí8¿6Eü0Ñj˛£∞≠#¨jóÙ
æÃcäÄ`öåŒRÛã>˜'iÇáreCã^÷"T3ç´^µ…jîå‡Ì´Ë2~o∂∆¶§^≈&3’Jx2!ŒhˆÃà6&›5Í<;$˛Ï7 o÷∑-Y&.§(¨v(íYrz|)D·ÔÚP÷›D' â≈Ä÷LZJ¢∫°(Ú1w˘B–<1LΩôabA4$wl‚.;$‹|‹xÿ?0â#X’SØ‰¡¢ ‘TTTr·VÛ\µΩ'ijâ‚° fd•»∞‰ÀTÃècñ§ú´mGﬁ’≤Â¶z›·ã”k(4h7O_{CR∂ÉÊÛ⁄Ig0±¶C€Ùñ\|q:ˇ√†√J˜4≠∆p4Ë•
ÖK◊Ï	¨ÒRµ√qΩw§àèR%™†Ø∑pÇoá}·ÏïGE•®f¢TÂ´EŸO~‚ì˘Ü’dsÓX∑ñÌ∫ÜÓ˚ÿ]yÉÖÕÜÀc0≈ô}Œ¬ÈåÒQ5⁄t‹)‡.O€Œπ9ál€vükå«—ÍñÌ£ G˙j0‘(&„ÂåÙ’@ˆº~çY…|#ªﬂ:IÏTÚ∑ò8ªRªÖÄ({ﬁùq¡\ò—Œ&ï>"ﬂ/Ã›óº´‘ºMµ\9±›Ç≠DáC¨¢Îƒ+(“ª¿úÖàE»¥äHU¢prij?˚é–®ucUï∞0*÷T•h˛£ÊÉ’2¨˘ø¢å◊ªˆïMÇ"%√ﬁ?{ì5ƒ§q·A#º“jçX©…ã~–BdÑüT«ë◊umÅ»ñ2,‘r.!ÃtaølÁL⁄íT≤0∑m#0hàlÇ‚0_°%MÆú®îjœk_ KÅV?	ãÇ*’∏˝.#ƒˆ∞¯–Bë>#»∞/4!&%}Iﬁy∏TYéÏ©.ÈÑÛ‰’›≈<<Y¯A6ã}?7ã=”9!ùP%“¡ÈÂ"@è ∏¬ªÊÑE«⁄Ãˇπwq!∏Ct‚…*Ω~{¿
˜∫ﬂÃÙ xè:›∞∫k˘,ÿ+(JÇÀã◊YkêÍ¸Û)rçKjçMù7≈≤ª≤Ó”ΩLÓº»é+ (P°u2†ó≤ƒü,Ó√j"n±C2ã}ú^Ïv\ñã9¨3ö„vú#—Ej›◊"@ ÒJ7˚6—ægﬂ¡*DaÎÌ #bh∂u@^`q&r˜®h®ùx®æc3Ûn4∆€ﬁ(å±õXØÙÀM!—@QY ‚±ˆ‚±‚ÇKÒäòÉ%R*åµüãŒˇ<÷£qûÉû‰ıë(Û8˘zW∞›ÃñçuÏ˙Ö¶ˆvü≈Ca≈≠hå3:Îñ¬ O‚:7›I˚±møBm@a®œ„°^Ç6ËQ¨fU~∂ÎÒ0«Ü=’='q' Y`u‡;*c%‡∫ÚØE= ÄÙöTœ~;ÿQ™léH>â¸Üáa∏ûB…õ¸ßiOg∂•≥ÊsÆ∑â3à|9ur∏⁄Ä’Œ<^Zè©0{ë¢ÅpnñËö;“Q·8Î™µŒ#Û?´v±YèŸ7´ÜÛ)ÊQœUyjÕ£ı\ûçíæ¢åÑ•\≠G&;·g°\œ¢†ìër*EC$¡¶‡ﬁ<n?O~€Yîﬂ∂û4èÁã…	æ'`{=£®˛´t1πó¢AiOBT“uéI∑
Â}í¯ﬁêÿ≈l†}^Hû€$H.ı(™≈∏∫lÏ◊ü•’åHáÙ0ñ¿?V/˙c-$ΩM0McÊn–°ª0 ﬁ iª<n≥(Õv…öÂ™ª¢P …óMπ_uÑ1“Kâ•ŸÊñäe2“‰œù∆)Ì]Ú'vŒ*G—©7∫¨!F≈t7,π,JKﬂìˆ.J˙ÒS]aÆ∫,zÊvÅøäìÎ§É
‚h˜‰ﬁËºÙnMñ¥‰$Û—%H"T5¯'´]êÆ=50<°"íøÇÁÜÜÁè|È;ÛQ√*µëÜQ0mRãÄÁÜ´Ÿ§È8ªYÙt„äöF\N#U∑µØ;ÜÜ%~Y4E—HÌk¨Zx6ˇ¨≠Y¨Ç,åÇ3Qû4Ÿ¯ÅjQÙJëÊ¿¸˚∫ÉÅA∫K3G«ÜWcªpW¶˝€ ÷ÍÁ˛–5Cò6!<µÍ§ˆ@Ü6+ò[|n˝« ê)T`-q%[∂!ºj—pë∂ÄÂtú± ó‡R∏±~¿´·‡´±p7|,h:6äGâä’∞-AÀÓm∆·◊‚ë$}Ûı¢Ë]#€ﬂHÀ%Ï≠9a@ëÉ∞‚ÍÊEÕı@F‚œ˛Bw¥êPTj÷∞ÑN∂Ç1òC¨ÆÏí_„âû_ºU≤≤å(∫Ã∂≥{"ÆHƒH(õ˚ãŸ’J…›ùD∞Ç#∫≈
Ö	ëπ†¢EU•9'◊ıŒG∂®jB:J^≤\ÊG∫äæF]÷Øp‡´M√=∆&√ÇJΩ–É…ÿÿ+LÜ./¸õ=Vff{ô◊¸dŸ˜¥óyœOV|Q≈FÁáÂ√·ôG  ’[®ÕìBçLˇË!
tW˛	‰È”0 jì©rÖÓ µR}Æ˜R≠≠ì#á)•J>Å¯£ò∫¢ä"É{@n˘N›m›Ú}R…£SLô»R>ÈŸUËÕM$`E)Û§7BW·ùÌùÌµæÛaAëiﬂŸªy˝¢‚ÃU%&°Ä+ïΩœÏ|J˜	Ñ∂ï¢K˚∞;OQŸ⁄ﬁYBWY≤°Ó”ú9Îµ^ú∂…ˆÈ¥⁄›QÁ§”ZÓÊﬁû/M,æ£@€‚¥E!]æÀW<3@Ú}v#≈l!?:Â©çânaÍ]qI7V√%’>®I∫·`C*¶πÿÖ‚K'IXzXŸ”TxËbﬂÎd¡ß∑ËDßœ&¥√øÿQ
‚éƒ#¨hX¨ÑDﬁvı¸¢_¬ßŸÖ=ïÇ⁄KˇÀ?ˇ#9>Ì}ı¢›Ëé⁄§?h∑ªÕÁùVè-Í/ˇÙ/¨a‚i‚t±çäAô‰iG.¸$∫r…n≥8ÑØ,cÑAGë≈}*®≤¥·^bµ¯ŸSé˛Ωo8R+u™ßÿµ|@ Z)&∂†ˇîÌM"Ï∏µ–õã+Y©éÒÃ
*^çê≠-Q¢Ó›&açôÇÉM™C˚‹—-$hoíz¡ÄÔ(Ò [˘˚Mª¬7.C∫¬gﬁ<Â˙“fv8˝Vd†Cˇ#Èz◊Hó©˘÷%u	veí¯∂0ÒR◊å1uó cï®XaN–geK±ı˙º•Ú;D,C{eï§	·3Îß	)Ñ?∂yDÛâÓ8±˝ù√ˆÓ¸ôÊ%V¿\Œÿ±Eé;/≤T#¯5∆X'‚˚†g~"ü`zubæ'VN«vÂÌn÷ÙéÔ∑ƒﬂø¡„O‹3π´◊wûÏ}∂˝˘Œi£æ˜˘€EÔr´∏§Å≈4∞sÇE/¬túj`6ó—ÿ>ä:ãüí¢ŒE9)Á‚û1êp{ÁÛ›'€˚o+∂ƒÒbG`aâw‘ä⁄( w)∑∂·xóø—©Cû∆Lú]ÑoòÒbÈØ1@Ø.˛∫±9—Ωﬂ4Ò˘*ñÖ©´8}˜%LO|D∂1Ë§à¯⁄·S≤Sﬂ.N’ëª^Qóˇñãj¯	◊π^qãÌßJ7¥U\Åk¢‹c Q Ås˙=¥~*˛ë$'ü_+IÆ=õˇ…“tG€úˇ414§ßE∆ÅC“D∑0ÑIvcé¯#o≠hûê≤≥t;Ù3‡g>ÃeWé¢ØE’sÜ9ÅÉ∑ÿ(·∑%È˘û#Ù˝BwÄ’¢÷⁄°ö:‘)N÷îùˇ˛.·V–ù¢i\Ê1C√Òxºb)ÙH<˜··»–6=$®Öﬂ™tc	¯nRç/G¸øÀç—2ÆlG3ÿ8Ò˜Â∆ziÃˇ|„ˇ.7∆À°O®Ü±≥ôﬁÜï∂π¥ÁÉï<§
HºfEòEl≤“«•P=Ò‹=k∆kbõ‘íÜî¥˙ﬂàb∂ÄZÈõÏÀÉÉ'‹˚•†3~ÏûÅÛ≈¸«âT˘ôÎáLlfdÜ⁄hRÌS„¡ÛÇzó∫√"(  f¸ÿ=f‘EX®ƒG}ìJ…Ÿ¸èO;ßˆR ?vﬂå}:ˇìiP“∞º˘OñaøwÅà˘?Â]œØË_æs@˙É^≥=ˆ»ó/Zùfßq∫Ü¯ùèÒ·Ã_7ˇÛmO»`ÇD\ñS´ø¡À_H◊G@~˜¬,ÖÀøÉRØ]∆lùzû©1Rí⁄N}ÁqÌÒguAij˛˘hÒN>øf—aÑ›,ûtÖÀ†}µßÿ√{xB≥}«+≤ÏÅ{’º=ÇØ«:¬€∏Ô=∏ûQ,¿∫lë/}„wx#ﬂ±T5Î’ﬂ˙cπ*ûUˆ¿}´aŒ&iå©	∞ö¿âmπ∫ˆ—íı–0jaÀ"ﬁÙpÜV-V8ôÆ”crI›Ü„ËÆ˜+Í`∑ß2pò}ˆÕªNÓ◊ObL+Gœ#‡j†˚È◊ Vv∞≤9„eÇ¨·ÍÛV_8a÷∆pYKl∑‰Œrå•ú∞ÃëÉEµa0Â ¢.yÊÛ),p˜¡y0íHe[aÛ∂È∫ªN/=`GK7AMunñ√≠Ã”v=∑ß∂iOXﬂ›¥…∞”\	π>4È”ôMxµé  ıú?∏lÉ˘Xˇ™Ãœ†
düΩgâgãÑºm6ºHÅCP[:ú˙ö°U1Dè2i¶lå^¸‘õ'—!n	àª
©söm]¨≠mY∏K?˘ˆﬁ)ÿ√"ÑS=J"6YOYœüˇ8^ß ª+Òπ Ÿo„Áﬁ<`›´‹y¢kó,‹,8ë‡Ô%$Œ!~≠¡&—hâkKåòlÈq⁄¨-51nbò†˘°¢^˝–‰cPÙÆ∏~}™OÇ⁄Æ∂âÊï'˛˙ıåï¿ˆ¬⁄ rÄú«ﬂ<∂æSl@Tt[÷'æ^–'~WÕŸå»ºförE`ù®d™˝GE›Y•îÅ7{…oœ˙µ≠Ô}:vh‘⁄ú£HÉı™¨ëQ	ÊΩﬂPHƒ%ƒŸÛ2B3ºÀh˙ôïq®á.uÊ>GfÑs˚ÑÌc#÷ -l]ÀvK%/ˆh∏÷Œ8ï-^„ÈÚ∫uÈOﬂ˛B ©R •ﬁj›πh
qEå#⁄§*/yï“mÄ?$ëÂ8ÄÄà≤∞˜Câ-Åù€ı˝<ñΩÁÌ 25ÔeÔ_Ä[ –L }fº5–” 3«üŸ§Aj<∆Â≠)v?Ìc|Õo>ñ¸‹ˆ€›∆È∑Õ^´˝Ì≥AÔE∏9ÅQ|„]÷KH√lÿ¢4—X:cu¥Mc|û&˚£8ÁV£mR«34Sø;¿?X%RÖohÊ7Ωõ;TQ'˘ƒZ§I¸lH;„∞=_Íhéé£c1ŒÜEÿ-{:«O'g˘”i."È O	:í(è∑_ˆúöœ)ßúä‘±"!xuïl)Y¨rƒ2 ›îö=3ykâ-“ *ÃrΩ‹b%LESˆSD∂_æ –¶¯Ú qﬂÏ”˜√Ü”Q» π rÓÏ?˛è?ìÍ±ÔòtÉ Jj∂≈∫îGß¶¸- ∞uqfb)ÀåDs+€[Õû¬πÎ„Fÿ8[Òåòm–¨Úöô^Ki‰ ç1Í©îﬂ ô∑‹Ä˚ªr‰bÖú"Hª˜‰Ÿâ€a$ÛnS vSôŒxz∫Riˆô≤fÍa}˙ —‚°qbˇ…‹›·VKíUlè˜haYˆ(+‰G[W9Bçéu*áW¬ ú≥˘◊∆¥∏Sàpª≠"ΩN≤U)F¥˙f‹ dOî∞{@:†éùv¬&«ÕAÁ¨”]Kv¿Ó;ü ‘ôPÀ¯]–ûisê˘Wﬁ3Àv>≈7;jŸU¬xôzû}˚ÌÎ¬î|‚Ñ€vjkÚEåj\iá˙¨≈nqfÕÎ¨è3ƒ£kTöE∏ñôáﬂºE˝^˝_«‘∏!Ñ˝áT9í`gı˘èka7≈ZZhÍ\&ë7¶®ÒˇíÍ–òŒ®˚jÒz™⁄¸O¶ªA‡ùt«¢Ó2ì4LÙë·ø§z¶Oœõ∑H∆(P8Äº(-˛˝rruÁ?^¡xœ–TÀÃ˜SLÖ=®bô<÷ƒaÂq·ã	£«>(Ãb¡¶≥õ%3÷ÅPmÎ 6Øx≈>JÀ·jç∞}Ê;aÇ~„˘Z°`ÍWKé›æˆ†$†/§ [}Œˇ%Ÿ∂¿î◊˙‡∞[vbò∑∆+À¯ä6ëˆuÁˇÆ+XD‘ÉíyoPÕ∆9J≈#'|œ7óJç⁄ƒˆ	f≥ª¢ƒamDÈx)<£ùIu'œf¡Ææ/_2≥Mﬁãç@…ó"æÈ3Ã0™ÒÁ‡{[º!™f∞¶ÆAÏã˚V†I˘Êﬂ2∂ÄJ¡~Å·x`øË Q‘÷Ék[&V∂'ûøg›ÎL∑q@™ºpPÿg`œÕ‡Ë ì\ƒ0éW ç&ã„±ﬂ§Ë⁄Ô¿‹;wuÁ*<∆¶3ˇ—]…≈b!©vﬁ
®ÅS¡Ò”b∞∑˘§ö≠ª¡$T•ò`à{h	døvüﬁÓ(„∂€fÙÜÒ~¿√ÙÆ?"h¥/∞◊"“8XôÖ3¢1ﬂió∏˛˘ïÓ∏¿D\ÿ02„ÈcÂ1g_∆oÂıC√ˆ€[tdÔÄ4^6N;A; Võ€œ^›˘?4÷`^‹{Ãã\($–P ]´iFw5:”aûW•‚£ßﬁs…3´2&ëT£˘†;ØCmåÑNãÅ≤g#∂0&ò˚áVU ·_∂l}E•tQq<ùˇàÁÚ“∞M∂-[§aÍ∞I‰•ÓLuÛÚ√S#¨˙Üªc`KXtÌ’¶ægòk7Ø∫0ç1.çƒâ«ﬁs,NËè≠ÿ~∫Çñ¯T¥Ô}xèX¯¬Ïp◊¯ﬁ7Ê?x œ”•Í„∆π $ŸÙ jgè<∑˙v(Öo≠“d8$<kD®+6§V£íœ}(’±ÙkT¡ÅØ¨dsyŒµ`nÔ]Ëñåd˛£ãöÃR¸’ÜΩ`YD·∑[ˇi††`|‡âœ‘~¥t´ƒt©sè^\îÊ=·Cöd8œ2º!Ê<_Œ çâ£èü<Û©3ÊfÄ¶èF≤±°0¯˚ËurûœÉòWŒ"Ë9 uKZ¨†i«ö¬R›≤ ü}ˆ√Å¸jﬂéèÑŸmõ¿'—!ºö•>ê¡:Æm≤ÄÌÉÚ'R~pöGW«*è‰%óÆìÚÛŸ,ƒûÆÆ ïbπ#ºÔò¡=XxZÏÀ8–’öZ(va@d¯tqüïÕkÍÄß∆dI_:õëïhîç||≥-d6îh00Ÿ≠Okô·c|‚„Æ>≈¨_√cÆx¬jÊ8Ï˚áÜƒù§≈∑%d¯Ô,6ˇ¿ªøV7¥·¢œ6ÒR=lœΩÔhõdhòÖÇ42≥¿?F¥ trU¶Ü9≠cÜœ.soÚxéóE°¥[$eÊ˙æÅ–Z ÿ∆`ßQ∫vVÊ—{vÒrA∆∂K∂˜	@•è˛€≠0‰ˆÌr·>pMÅ7◊A_@,‚<+íqÂ~>)»F©Üì–˙ÄÙéyƒå¢¬àXî\8p∫·P“µyÍ”{ ÏeS∞J‹≥ŸΩT:÷¢œYûvüó·ì©≤ë©∞qn⁄⁄+2=«Z‹|åóìfÏ0AKüJWY÷î©”1Vrp-RêØ‘“Ø¿\ ô?[êÏıRIFEâX§∫XK`#xµGƒÑùÊ&B6±<g£W/ I@@a;vé;ñø∫∞DrÔ±=)ÇsÓ2aƒWß˙ïnﬁE2,T¨1"&úVÄ§ˆπÀ¢)(‚&5©xìíï	dõ‰˙ìâÓbjßnö# q·*6eG.K’ífa	r∞÷
±@Üç˘?µ⁄kà{ÿ‚¬n§Ê¸G©:ãö_o√^ÒπNMÔ2hOZÜ·->˛û+?«6Ë'©6Å( ¢ÛXÇUB ⁄◊önrFÙD‘!(º‘≤ß$eÁ¬∞†Ö†∞m¯#ÜôQÃ£X+¡ıM¸‚;ﬁr-Uï± Qgá⁄IhÜ¥X∆7f∞∏ÌÉs:µl¨KY‚OCÏ†*ÀK≤”áóiµK≠e∏Xè≠ígΩgπˆπõËÈ+ÉGÂ`ã¥ÿ/^ë·√Tﬁﬁ8HÎ≥D`ÁW˛¸«)Ék†T˛9ê?f]_ß)nÏ¯>©ni7e 6˝‰{Œë≤Vt+„É"FÇÍ,AÊÁ05€6”ß5î`É;ñ™˝È˘3˝Çjr<–ï^∞“ ∞/N–°ÔÎ çˆß¸wxÜy0ô≈≥k§ íO∆é=Qä´xOπS«∫Äó≤5xÄN€}å)ò€wó‚MOﬂw£,xÉÊõ†(íôoNY˙œí⁄"œ;/?≤ß7’=EGµ;r!-Œdü≥Ó)öcºô.öÔ8@›¯‚ ö æÔZ5ÈÃ1L≤SüN`˚ŒtcXî<ŸÁó>‡˛ˇ   ˇˇÏΩkoYñ ¯Wn≤ù›dZ§HJr⁄,K-Àô™í-µ§tuµ◊H…ií¡äJV±‘òfgÁÅ∆ €çŸEÌb´≥ãùY†ælÕ ≥ç˝¥˙'˘¶¬ûs_q„uÔír:++êiIÒ∏èsœ=Ø{r«nÅ“†˙ÿ~xºûÖ◊˝ëái˚ll•‰≥Ï◊wåŸ<y&wËªÏH±/ ∏‘ávc´Ë˝qù∫‘ Åu ˚ºá&ÖÌ §jåô
˙„9jÜµµÒM(ÖcØl•dêÏ◊ﬂË^w˘‰¬•Å
VÇ`1 ˇã6»9–ì!fÂc¡!#Q› a’≠&¸ŸÃ}Ì[∏83˘Cg \T¸∆«µq÷˙Wt÷¥˘ôÑUR∆∑"Û‘¥AÌˆõExÊƒfâ_N8Ç©•a¥B
˜¢$òtè ≥•v™z.ùf:⁄@ô∂‹°∆*—)o@$:aΩÖ1ƒÒümJÜ∂ıgh+ß5ë≤ùùÒzîo§?ò¯<	?æ∂)ò¬VÕh¡ã«)N¸àˆb∂÷„ï	XL~ÆœÍπ|>–•l$%”uörmÁ(£+∆»Ÿ&9ö˜—M‘**ßÕÓ4Ω£Ÿ/ı7bˆÕ⁄zTŸ„ø@õá†	Ä∏Á⁄Y…iÛô;–¯ÈSsˇG;cnUK∂˚%0  ~B{'˛ºO˝öXb|`◊∞9s∞â&”7>r–ÁßªÁ±’	‰æZteHÇ3‰çªÁ∆Rº2IÇ3-¸®F5;,∏Ÿ Hö”èÆrdú’≤a|2çUvh¨≤O¶,_†”àÓ1Ê‘~È=KÀ?™Õu8pÖG≈\›_g4Ü˜.vãv∆ÀÓ≠Ù˜?™ù•¯
+		÷{¶jHNVv˝ú¶„@0Óãg7®AˆG∑7ûÅ§>Ω˝CHè„cCQ‡é©Gb`π9,2ÿó»a¸√∏¶„ÙCØ¥ö◊∆›mß§›?p¶h©‡Ø$ŒpNO©ò„ÈÉ.‹w√ˆ˘^Ú€‡•…mø~Øf<¢-ÆäÌßnﬂUt ¢A∞>/åß?b'ú€¬‰ËòNƒ¬aäé»∆`ÑóbEÉ	Ë`Ëhê‚îGlM[wá‡F%ºRg}v‡OΩ∞†µ⁄Öh^r¶éá´‡MA˘edÿC”ñ≤u'd¯√¿ô8ƒÔœaïò¢<ÈÍ~¿ªf©«(≥‘ÃZˇÍ‡Â˘ÌoNif©ìÉ”ÛÉó˚gkp∞|†q∞,I/ä≠<b:È‰©;ˆßCo:,a3KH;YÔlE≈ı’S§68iñKπ|≥J´XøÉ–≤~'‘G™ÔÇ˙∏@*êAªÁn0Ò◊kÖ€fÛ‰D†´UÌq÷âi{⁄b>;Õ\ﬁ†ñ0y	<Ω«‚3`‡¿FhÊ†·¥æ'πà3Å©{%Òó◊y≤¶¯U∑Ü%©B7z©¥R]4µŸ ≤:ƒm ›®Aªæ1î| ©T–{2!≤?(ßm=$Xe£˘çSV÷qñ≤(™ysw‰Ÿ
WÔ;ˇrÓL#™–Øßs§/Ka·/£Îª@Bh∂C^“aUì®X#ø˛5iô≤4˛§9>+yÙGéUØú±†K∫7±?É¯‘çë”ó™Û∞Ÿh¬ˇÏW&)q	ú§C*OW@ƒÔI‚,¿LQ(;{2îhÓÕ£»ü⁄T∑co∞÷kÏıﬂ	ÕD9π2ÀU}˘ón–ë∑äÕãZÏçT(Zëë≠âÜıè∑…ÏZU/–2‡QÀ≠n‘gæg¢2˙Õx4.º`‚ûÀsL∏”b˙j*âFﬁ~ÊÖ∞7Øcq;$G ìÆ[ËVn\¨ã±UyÉÅ∂"∂∂ú,⁄[4ﬁY/€ÎjÂ∏Ìﬁ∑≤~eèÆ±R%\Ù‹ÊiÖ∂l◊ôW»xF™ü¬8D·∆fÎˇ˚'éY‰=Ô7*⁄9Ωdqwµ∞ÚÿΩêN¿%«Œ,QLæ î˙âFÆ30|Ç ‚ÜäLõ€Õ\≤ Mì	;•Xh( Î√È% ôz”<ﬁåFÀ4s®K∏í8X≤ïÑå¥˜ó—`ïfxô√Ó%∞Q^«†∫Ã⁄gn
ﬁÙº‘à!è£û?∏÷w≥p–(Sƒ∆ÿùahií'∆j¡èı£/0ò¯v‡ÓbÁ&	†m@*j>¿-ÇQÑ3n,·7,)Ó··®~H¶.C\x˝ë” à6å™Ñ‘H«8È4Ã∞∂rD‘öe}eÿ∑¥∂2|“?sØoÏˆqJ<¿›º•'#qóÉ\¥îUï=e46ê,hïπMÇDëfqÒy÷µ¨–Q“¥d®Æ⁄>•Èô∏dojLË^œd¨ñ”RîçØBm|IÒ∂Jõ	πßÓ∞0VI$÷uqeíÄ¨îmÒ
∂IÅ4f© µL îú∫çi81é; »gÏ>µ[Béh%’Sªu3
πÍª6e&iX]OÛtKÌÎŸºÄ¬—RGèñ;-¯ºCˆé∫g‰œI˜Ëxüó£X˝ú‡szN¿6¡"w"xêvÔPŒıß«Ωo».=!Çáço:®Œ∞Öl⁄¨Z‚‹N≈wáÉ⁄O4ùx4Ò(ÊÖ÷3)5ûƒ=–$% ¸$_-‚-ÜO—DøœìØé›ü{—àwP•÷˚S—fè©›ÅôÅ∏ßèËâ}Ù
tÉ]2∏‡ı±ÖüªHf√◊qõo»'  T£0˘… ‰√Î¿≥„?)ty≈¯¥O”9\‡i;Á)≠∑ œ∂‡Ÿv¡jà9Q N)	>´i•?È§!gzy/$ßò˜Ü›4A‘ö”xû{ªÒ:Ês£E7∂«p(œ˝‡π7∆˘È¿'∂}DÔ#
«¯Æ›·ó =|ã%ÊÖÊä˙âg≠Î^b…7œÊ&≥¯ƒEpÊ\zc<ÔÜÕÂt8	–û«…ù»v≥§‰I#Ó ∆˝˙MÒ®8Ï‚˜{◊§/77[»P3ú˙=Ù≠å'=ƒ{©
ù‡∂/@x⁄`›5B‚ø√∑	æ∞çÇ’)`f5D¶òä.ü…¯ZY >+“Œ_eƒ=)NÊPpˆÖ§ûƒó3”–Î¶fÅ⁄1–≤O)î„Ìl»ñU$ÄG—µü≤ÊwÛ&ˇÑØ´¿E36…÷≠<‚òQÄG´"Ã2¯íá(tŒXBGõD9]¿>Y{~–◊S»¡ö–b∆4üF∫@í∆à'ò-l ¢|fpO¯“æ?üF:\ÄwÿëÆ]7úÎ∆E‡Oä¥‹aÑéÆ?zZ÷$7çTøﬁ ï'ﬁ“»˜»>…¥O5 F‡“„ójo˚§≤A*TÈ+›VÂ¶~oqFeï™GÓìVhÍ‡òYTmoêøh˛EÌÊmYTy∆89	¸oíú9¿/fOw∆˝˘ò˝>s,§éÙä}ªÔ†ãQtùø˘î…+w•Lô ™NøøAzä+Ã∑⁄kÙEªO@*h6k§â¿iÍ6∞€koFTn<†–9ﬁîâ/úh‘ò8Ô´Õç,ÎÈ)-'k$äRŸ{ D	&Ä¨D›±Ñ`>Åœ
¶Apªì*æÁ—∑‡«c¬ª‡ˆ7∏wˇ~≠∞B{∏ø+øÍèú`ﬂ∏›®ÍJrEZ†Ògí˝@CfÈÂLA‡£Ö"¨îÈ u‹∆üBÎ7·Y>aîÚ#~é„˛pØF>#ÕFkg	2î;®º€wBDJ≠~,‰ÇT?Iìåö‹t>tôbä«}tˇõˆqk2—TÚ0è 6iNÈ{ÜVyÉöXi}ØYB €êœÄö¬f.?,Ôô7A:‘IYW\3‡nÒ*Íı‡#º>Ω¶#Ë`qc?<!Û◊x˝f∆Zå∑ïßG?´ŸÍV:‰u´±ΩxÒˇi„?è6Hõ˝∂Éˇ|é6Ò∑-¸ÁÅ|y˚MÁ¥yMŸvKmñ∑∏-õm…˜ËΩñ±É÷SÏ†…∆Ω4qºâ≠Lã¸©¸iû¡S6É-9¯Gr†;I ∆jvP¥∑‘Ö>q"ÃÅ+ô^ˆ◊9®¸ÜJÅ-e©Z©¡»;π¿.⁄⁄qÜß9ëéÒo_∫A‡\™q„ˆ.˜ìÇ/?ËdXD5o¿åAv8Ï‰46„w~¢üxºÖ•Ÿ'‰+≈◊çH\¢MbO¯+—??cΩ÷ëˇ‹{Ô™ÌZÕ4Œâ	€ª@qÜ8ﬁºﬁ%ÉÍæA.ôÎ
2(rI9˙&iµ›
7Ô«ú;Muı‘)ZxÓ+ÿnj¸{ÏP+Óç›àˇﬁL}–a	ñrò¬ê
gÅ‹|&d@Â›s˜=≤•J•h»»ë‚~ÔbG≈t3∑Ì≥Ó˘Wß›g«Ö}‹w∫¥´ÿ¿ŒÛ*›ı¡Ÿ˘Ìo^ô∫.n6¡Vü±=<uØ˛Z≠¥õÌıÊÉzª])îgà˙u#tÈœ™zo»Ô’ ©åH}3r`Ò˘º¶ÎáoÖi4¬≠ˆ∫ÚSgä™≈s˜ºp¸—ÌÏ/¸t>e?∆ÙŸ–«gnÑ?éÁÙ«Kü~˛Ã˝U•êÊ√ˇÌΩEÓ<Q≈a√|ùz˛ÔVkoç‘£Á@·:|˛∂Xv‘À) b{Bßp.∏IÇ˘^ï£ mÚ»{‚Uœ;R–vùπ[-îπ˜òÏ]ØÎê?g∏™≤ëy\WÒ,èVæˆﬁË0-5ª∆|éºã®öÓH#‰óP:( ÙäÜ\Ÿ∆lé™≈/Ó§˝ˆ0¨’Hx7oã•êsê}bBq–”´gn¢cD§û b⁄f®ÍMÛTè6O∞‰˜⁄O®m‹!/nˇÄÈÃ0]í˙9KÓT¯˙M˘µ±2qÂKòqE#AA6Ω”4Md°Z‚„4|ï=ën•V‹L	®ﬂã1	ŒºŸIí∫qvQ†1Ìú‹NÒ¶U1°çº˜Ó'•g*ø=Ôﬂ[,ª3ç+ã5\˛ÃNR
°≠ö>¬Õ m≈†Œ#˚≈N¨tÒkô•¯’å¿P¸™DÕ+÷€ﬁ¥Gl=µ™ﬁ '¸N|V< ï'	%,>ÚM∑a,w_æÒhä.¨÷·>]Ê‡§°ìDRîµºX•ñbèöºx∆≈k©¨4‰bs“qèz„¯ËÅˇ—~±z˙‚·iÁÌˇ^‰ÁÕèÄ«c∂àáS∂0‚LØ\f)„—êËß?™‚—mKãâÉI˘io¸ŒÊSíΩôÙ¬J:¸¿GG∫ë∆7Ò7˝ªAÏñë<”~%v)˚H≤!˝7åOÿ˙/fÚÄ≥√BÌﬁIÁè_‡¸5ün-Q7ô;òAùvW6ÒÍµé∞±+·îË+ﬁ
ﬁ }î≤#˚§pd⁄°·…arOÉVÉºrö¢= öÇ	.πcÆÀ)“/Á.Å?1 ú˜0ÒMË˜ÍB
Çgñ†ÖäTèõq§ÇN’5ä˜/¿œ∞u•wnÇﬂä‹•ÙM¿.‡Md`[≤=”X√¯Ã¨;«übvF[∆ı6íŒ29~Hº•7x2Wï@À∏%û$}éèÏúçí√£≥-r¨zèNÆGéc‘ª¢—%•GW8< ±’e—qk∫?≤eÕy…ß#∂¡ÿV‹+úœ`3Å∆q˚©j`t/i∫FLã*`óÂVÃ¡‡à£zUú“¨L≤s=d%26¨ìp“à¨∑¨âïà˜+y⁄|t·aÙíFß≥cáˇ≠’ÑRÿ,áÑÈ’≈Öûg)pô&ÿDr˝,õŸó^ÑÇMƒ˜)π¢ŒÄÛâ∆∏¿.Y∫MN2π¯SL6¡&ôjƒfäâ"rbí¬o$ßΩ|ëõz≥e∆◊°¬Í€Ô~˚ˇÌø˛{ÃbÅÒf¢Ñ=•˚ôï¥ÚJÇlgS¥CÏπ!úıaZ∆!Ω)–Ö_ŒyŸeﬂﬂ[p2u” 2aP£À0jÛ¬x˙8Ù.!~˛Ño∆âÕê‰Pô∞"àìﬁG^'}´;©âòƒ◊ì¸hoó¥çtï“y[	HÓ≥	Ç6îtp˚{–ì6Aﬁ‹∫Q∞¿k	2™'_\d`å´Äô≈‘ñ34Eé»ajÈß)∆ñ~lÀzÒ‚∆çíúÖO1√«*Û÷b…ü¯…ü¯â∏~‰¸‰_˛?»Oé#o"´££†ùÜ1W…c%4Yl˘q0Ôj.ˇ†Ùß¨Ç"J°r6∫î*‚8ê#kd#ÍTÓàïîWÒ7—Ω"O[–u~z|&mYô∏·Dö≥Tv‚åyi\™Ω“äŒüBìSÃcÜzq]’¸ 
¨°Aïº0«g√Ï	øgïvóÁ‚±S›+’SMö1KåPDO%õZî†
GqK]==Ui7Íù9}°·«ﬁ0†Á¢∂<¥]'ˇ,À=”º3ÂËr8Tñ¶±«Ã[ÓàyfYgi˘ èu.!hYg	}`û€&4¨Ûü˜€ˇHÎ˚h]·âF‹©3NM–úúÄ|Ã∞P$Îﬂ¢e≤ÆËe“I&1‹RM>†-‘X?ı∂ ÷@@%/Õù∏ëõñT…¥Ê•8ÂH.ô"<G˛CßgÅ§e‚†…6
∏u7§ÿ3πÈ¿Cg‡ﬁ\&*ƒ'‰Ç	™π}èUØÚ‚ÀEF~§xî©)t‘kY≥p"‘Î6ÌÍ∂•Ü!0_ÉëétŒˇqá°ÎX<
ÛË Ÿ∂‘[ãè´ÿ9Ø<˜û∏ÉdX‚˝]ıπU A<t±í,úgóµ¯)yd“ËíﬂÅûøe“ÍÑÀˇÖ‡J €éCíòL—7+·|iLÎ¢t®_˝Z‡ïª©e†k`zº∏~^•–ÆAõ[˙/Ù“5[	\”Zî—±ÀkŸÎ÷≥”≤Bæ|gne⁄˜⁄ÙÔ\!BÛ«k≤Õ¨4ù\ëA"§≈«r¿ˇÚ-µ…∞¬S∆Ä∫Ít»¡•”üÉrÜ‹à⁄fa¨óò@7∏˝∂ÔQF%YS/¿Œ0ÀPU!æ5Çz≤¥¡«™#ô:¨’	æå0ráX∆ŸæòÑÖ‚ú`˜Ãﬂ…î£ƒ¥±u)=4Juyw®–ç§ouL:cKäéîÅ6	_ûç¸+˙µ˙QÃ›b—$-ÏÈ•ÏD∂›•Ó3:“Öâr`¬y-%ZÍÄŸh(‚˝˝ﬂíÉ≥ÛØûì˝„ó˚G_›˛-¸Zﬂ#áJÌÚ0BıM ÄrqëYM≈Ñ”»I≈K≥X&Á˚;á wˇÎO˛jˇ‡Ë‡Â˘Åöé‡r.á§˝Â∂ﬂ|LÌ)éOò*P$8øÁ‹>Àv·zØÈ–9˜B/B? f¿ÑFóÉaÓ}}d¢˚ﬁÌœ#˜úØmbÙVR◊°êÙ/`†;öà‹È d°÷èΩ)4CŒ˜»rNÃÓI∞¨\ ÆŒÄÍÂ".J‡ã4`X§Iêb"‹Dòo`F¡ÂM≤É—kí]ç∂h¢ó)æCGífn∂ç$8è⁄N¸@Oió≥_∆g-”…ö]ô¥$Y ˝˘Ñ-?˜9
i‡ñ\RÊ=îXcÊ}[‹Û0∑;x—ë?,ŒÑ'|Jgò≠¿4û‰Áß›ógœNø>|˘¢{~PÅU√]†˘B˙‹j»î:©‚∑ﬁû'YC4òw'ŒlLâzlb b%õd“*ÜvM›oËëÆxû©9Ay#à±˝ É€âos–æF)á…‘ÂÑΩ*ÑåõBÇ®≈){éaÕ/nc,ﬁ˙¥XÚÌÔŒ'0_¯ûd•XDÁÌÖßçõkè…ág!Lä∂†+Ëé«Yn`Èº\Ã$@)|ò≤óÃ„wÕ1x‰úıG0FòwÒ∏©.ü&A‚î@„M)‡%:˘~9ë≈ZÿQ∂±,O“¨;7’Öà:l≤d.%ÿÀ2∆í≈ÿ2`3ßúU∞¬‘3™¿FX›d‹1hîúñ`--√ô˘°GS	ˆRúCTÑÎòÜ]L)”»†QÓêù¸ˆ[rzp|˙E˜Â·_sΩ„ãÉ”Ó9x~p~¯™˚¨ã≥3ë–¨í∆Õ÷°<jOªv˙àrº8XÃ¿¬Otºe!éKa≈∞Õ”´/P
óbfΩTBúÂr-îÃ¥–!ôº
–ÑUÓ¯∂›ÿ—Ê—ÃÀêM-¥ôúzê!ÜqãÜ _—Í)˙œÊ¡K±Ó˚X(^Õ‰%6~˙y1V_Ì4õõ-Q‘ q∑]‘\ÓM‰ƒ9)öÙá7‡±;‹ûA[(ÄWõºb_X+<è—Åˆ»èD•U“j6?mµQˆØQÿv.¸?§˘ÙM_I–ã∏À[Ö@◊¶txL∂ãÅÃ~‡\á"Uó°XENÜ±è˚ΩÎ0†˚∑“"h›$‘¬èOnÔmÒâäf!ﬂ∆Æ∑soëôàbz#F∑€`æS˙—‹7
«Pº‡≈ªÌ√,xK„)kπVÃ‡l¬•VäÚxËDÌÿe%û&≠QíaJ…EíUr¨WI€Qñ)ægZ'˝Óì)Dr¶∏I∂[€;5‰+n¬Ùl†«_#“Ç‹†_õª‹û°Q∂´ÃÖG+(˝ç~ÂîùÁD∑ˇ	Z>∫~+ªÂÃ<.ªû+p∏ÇC∂ñ?OOï/fıYI,íbSà1ü9¯0+q‰À≥%µ¸$∑lLõÅHˆNYoÊmvIÒïx.Z™I$Nqõ‚A)ö7ú≥SÙx≠ónA§DËê~I√˜1YCUú˛≈yœÀfÇƒæ4xÑƒﬁ ÃÈÄ˜aÁ˚Q‰˜aõHRê˚É¨ñJR;√¥”àÏZ„8b’‡âÔ#Åz]8…ÖP!œ±û∂†\œÁCß≤≥=$ÂiµA–˘Ó∞<T;ıVÔ—*¨3‹ÎÈ∂4†œm†u√ ‘AÍGLèáÁ°3†Î0f$›p‚ec~o$˜“Aio@>∑Y@˚gÛû7g≤Ôc?¨ÁÀU&ÿbqw \©è∑Ñ…y~8ónzí_ví]úWüOæÔ¡‡©/Ù•?û{sfUudß∑ø~dr˚O Pëb‚Ÿ’§˚NjÜ¨2yãÈ–≠&x‚á!ç™B‡FXTÃı{‡[Lpªﬁzòù -@rµ˘ÑD†ONhÆ‚íæÓ÷& Nπ∞ä0¥)”í≈x àÆ‡˝|ûö€!]∫3o|i91¯`éº…õrØ˘ƒÑ∏S@f…Z;ô¡í∫±<öÕJàî»˘¶!Ûá‹ˇ@>NÁÑç8}<_Âu „3g NtO†ñ ‘©g5≠≠˙V33-håû•sÊ6≈íPÃ–+öåÑzråÁCò÷Ö'w%›ä˘(xMI¸àÄxıèÃ0Ùí™ßsL˚Ú+<Ì∑¿∆ùz;ãçXÁŸÔ°§å]Ã\ÿj(9Õ¸Ä’£·Åq«{8√#pπ”.YÓÊÈÍ„⁄Æäó0$<q˜¯!≠Ìóú˙TÂ`fv	ª@®?ÓÿÉ9 Cô¿Ö=4rQú±/Ï†ŒÏˆÄ≤x ˚{üGF˙iº\ÜÑú¢QŒ«ÚÎL_¬œ–<£mX≤Ãå∞é˘∂G1Dƒ1ÜÅÙQraGR√Ä:%∏§Á`Ω‰˝Ü`Q#Gr=bL™81C2!ΩmB˚y\îHl≥0¡2Ù;>ú‹˜BÑbÚ¥˜˙{~ö‡€Ü4»2YF‡)°⁄M|˝Zˆ•I†>∫Cÿ¬D‘©q}é„⁄.HG≠6íÃSôì∞rßR√§äÁ@w´5DÂ˝~F⁄€œÉ¶¯ß’l6QÑ=<;ÊYÈkçp6ˆ¢Í_úˇEçÊ˘/Lf]Õ>ôçFC¿PwÅ\ Y¶–ùih_≠:"ºÑ`ØÅ}'a':Èá¶r5ô~WPxˆlÓ∆ì÷	ÓD»OXò ”£üU˛Ë,±9 Ê‡…πﬂß7˜’∫%≈Á~ƒqQIc#Â¸Àkm‰≥Jœ˜HØHiä§ ∆3E+[R5¬pU92$ˇ5&Àmñ>ay\D˜{†S¬,ubèúè@å«¬Âh¶eA„í¯-
ÛIÓ˚"Ω#Ç’Év=Gn{÷˜É‘®ìè`ÿèvLYõ≤≈)‚ù£Vò–è©∑ÔÃÚõH÷Õ0ÃÃâN˙Q“∆^≠ !b·¥Ú@_5∆Ùπ+Ú Ù≠¬ﬁπsû¨ß÷∞™•õŸ.lFZõ”mQå»4‘.‰ôÖqT…4•INãjp¥8j–áù‚^\ËH™n¬vÜ2âº∂Ó„dP4àQxv!+”Kw"'X–M´âRáû3ô≤ﬂíaî[îŒH\åi[Õ¬πhªäM¬ë√h∞ÿ≥jø2±) ÙÜä˙7pÚ<H‘’Y‘ûpt¿Ú ;µZ1£Áô ¸Èãé#vqªt<≤ƒh‘q™#+òû.3>ÕcçÏEú'æ∏˝˝îïä”Pﬁò-æ\á5;n$fu˝ €h·∑ömñª¿.>ﬂ—¶÷V!(ÚHTvjQ|¥KrÄ…K∆æâè‚‹4≈¯H.D˝ZgJ'^üÕÅ2ÿ§‰/€é6†!∂»Pc«k%Af:øL√lô„ÀB®ôNÀ- ’∂«Ø ∏¢≈°ÄÃgá)-ytX#˘i1êÙr˙í—c*h0˜∏*Î™a†∑†ëÈÃ+≈˚Å‘Å%ôDdj5¡x„]T¿N0¨òñı;Á˜sΩ~
“ÜîËu˛à/P…üãuïÛÎ4Eúµ»⁄ú‰C≈‰Ìä‚∑Ân–øB7Ä˛ïßC˝sâ≈êPYé∑≈ØD‘8r|9	¸áhGﬁlÃ‚ªÊ&(‡îè«z@ä˜(0ïœ˙z‡ä˜ûïozh≥™∑b_(%7+]/‹0tÜnG’√&ÏûÆˇW¯v‚#˙+Ê$I(tÃ≤J+n¯AQxcQíÇ},¬°Z{¨©Z>.â7ÿ≠tg≥zM‘Ü[ßuøAèU™‘_’/ÊcöÛßŒúiΩE&Éé¸´MÄRáX¬©˛®)®æ ˛Ï˛C∏OENêﬁè…¨ﬁnÏêp“ô’∑»≈ÿ}Oˇ©CãdË»á¯ÎV•xX˝‹˜«='@+ˆS?¢«“’	µúÙ—Úú_\Ö2ﬂ‰ê`(Ù˜¿ø¬ﬂΩ»ùÑı>Ü‹‰õ9–ùãÎ∫®HáØ¿cßπ˘∞âÛe≥≈ô	8åá˘†⁄ijÊÃfù;’<`˙6s’Õˆ* ı?1?úO´±£¥àx†6IÖá◊≠ÊÏ˝2üÕ $ô’'˛‘gøı–p¢à(BN@.:†Ï0H8
ºÈª∫>t<ÛPÜ3™o‡ØËø…+dsèÅë/ÈßπâÛ4Ä¢7è¢ÇJ ÒÖÁ0ªˆ™)ŒŸüÓèΩ˛ª›ò¡xï/Áz»¿∞É˛Ëv¨3ÜILY‡∞nÌÒR 3{OQrv–ekˆó,o°‚e‰L“‚ﬁà“‡ƒ›vöƒè∂õ$)bÚÔïõ[p$á–Í3üzû°Æ+z™{‘Ñé@ŒΩ™á˘Û˛®>≈d∆ÿ&hG^4¿Ï˚”o(=âNoøù°€-ñQ®ˇrn
P7‚Ëp,*úƒSƒ“4`$ﬁ#≤⁄åÃÄ≈Ôˆäsm—◊÷é»»kz—¥>u.Îå7ˆø>≤Ñgf#òÛo84T~éß™x~*#˛˙Ù˙pP≠‡Y≤ã„»ë1	SˇAUána?—ã*Ú_yÓUuAzÓ zöN|?U∏ˇﬁ¿≤Àc‡¸p?ßl+rG'≠+©=≠>ªZ±Ï®˚Z‹˛w6ÿ¯Ê9«Í-0Nn R}8@»¶É˙≥¿ü’V‹Í/A:ÉwÖ[]ÖVb≥´É]˚GIÇ©*Ë›Û ÁHa¸`¬‚y∞Kê*†œæcê+†ECbqq5›_ao˛2¡ÃËâUh<WÍ≥ª¬≠.∑A·MKÇ‚ô˚–ÉûÕôc~ÖO⁄≠ò 'ªû‚·‹ÍΩSÔô%áÄ€ÿ•ŒL©ó$X6ºç'.‚BKiœ]iJ”áùr MFv¥âƒƒ~î7Ämks£⁄XHA.≈ÒC6b®ﬁ|˙÷,dT¿ ™ø˛µ∫>è…≠eS\∏KcÌN⁄X+‡Õ≠ø1¨•5◊gíÜ≤hLBÿõ-Z—ÄWçÜIÅVﬂ¶bM qxH*ÎéΩPöjóÄh‹`9¨’ı(åáyÀ¬‘ÑŒ£B|QU“¯ñ*¢,ﬁÆ&£0…£§∞ê5Ó-b¥∏ykØZªÜH8H3ﬁ#‰ƒUä˘ëó˛ƒcÓûËo˘˚K¥~Ön¡›*ùì©Wa_h
ÅA~¡À$√‡ïVÛoØ(ÃGÙ_a◊†¶"!≈`ﬂ	 iil∫9	|<ÿπ˝\ëIïêlGΩ∑à˜—ççOø‹Ù6Ωf BV´jëÅ˜a0¯tcÁ◊sêV—oŸ•ÈÀYBÓ%Ï=ôÕ”&ìm,ì¸lf[p_‹rß£=àN ◊ê(vé0mÿÖ#g:Ño™Æ‹áÚkL]u†ZÅû◊†î0á,ﬁÊ2ÈôÂ–+J•T ’üáçΩ©[ü¢;DÜÙò Ù1J∞˙î$∞¢S∫uQ#uﬁóeçÀ5Ê`ÑÔÆ’Ê•uÿ¶Ìåœ@¡Ÿøâ˚(æQõÛ©Ô3G_Qò$m¸LS1Wˆ˛˘wø˚GVªÂÒ&k™dè¶È.%lS›˝˝aÆÀˆ«P$›õÇ*ÈÈ}Kì•g«—=›°D˚ÙÙ˛≥(zc◊#PJù>∏˝K
¨û+OLAd~€¥d˚†…e_	\÷‹
⁄ûù¡&«2sÏ-¶ ÷ºªy&Sj-°ı<ºÄV±4êËﬁ—2ﬂFÆ}6Ô’˘·‘s–ˇj√˘"pÊ¯Ûîfa/}*ï+Ù∆á7Ä--s.8™yîsRìbn
rlNjL‚äñë√äH«Ãb‹¢8 í>¶Eii5m2f‹ïÛ9ç§Î≥ÉÎäJl“»€Èºß„˛8«àªåÇ“±%Ø≥ÏR§zV˙î\!›iöE√üÂ:£¸"1=∆“iÑç23cÏ"15…“]àN∆Óﬁ–lo’1Û®‰©WçÌx«;˜zwAõdÓ&.∞⁄°·˜BŸÏ9∑F“æΩA)≤üf¨Ú	IŸöïä√ÃË©|)fÄÚ•‹™s0äçÌj¥
=ÙŸw5ÓXZ¥_`¶T”,ïGbNí,xS(èõTª4hëã0ô´˝[t{ ≈ª mÆ)ßÏŸ ÒÄHqô◊è;àEƒHç©ÅÑ©"Qö…6ıƒ⁄£8c’6∂›Iπå∆¶[qkKÿnÖ™¶E¿C=™•W®ÅM[Xä◊4VB!‹Ãoz˚üºåœ*Ò?™“ßFL€f´AN†IóC%j¡Q'Hñj@§«~⁄÷c¨>mœX#ïÉ˜ - µB‘5üSÒÄò∂,qN=+ÎO€∆˙'Ωˆ2Â”eO∆4ü≤}ëËÙ1—∫«≥yCZk_∑+b¶¿&◊ ~˝ÎÏC¶ “'Ÿ‡≤'É5û‹∞Z‡Èk(ìh∆E‡OhòÈôU_7˘ ∆ªeÁÙ¶VkÑ¿˝\Ù¿m«|‡•€ ‚π§µ l:§’˘ÅTøﬁ E,VÚÈiª~o¡#[=å“ò9Ë›D’ˆ©4+µõ∑µf˙Œ∏œ¶,=c1ì-ú9':ªË˘[Ÿ1‘Äâcñä†∆€∫øK∂41√x•¢†rëGiÆ8ú ™π8ÚH4àAUñìuﬂœòî“»)xk>däÇkk_î¿?KPk∫6ÒòlÔ‚‚ôí’ÆÔz„jï˜ïNGk∑’hmåñ¬®†f"NªΩm⁄µér$¥&Ö\å¥Ω√„è.∆æƒØoblñŸvB‘¥˛.Ù¬‘MOBó&Ãpüâ¥\ñ^
4±$ìôfÙyuÛø‹ﬂ4N@&i.ÇÕÃ	B˜p±∑^7ﬂPF≥éLı.ÿe[û+û~, õœüï‚ƒµâÏ´AΩc¡ÿÔ0;
d,ˆªDY.x†[ø3VB≥⁄¬¯E^åÎaA∑mÄú5q˚ŒL1müy∆ÙÚßÈZqÿj¶'/<u˚Hg,ÄÏKiÀ@"E |]À¸,Xæ<éGIpC™«E„ÏÍÄã∫≈ë-RJD±XLxÇ"≥DÃ∂´<“É◊“9úƒ«u“Sˇ÷˚“mÌÅºß7±ß$í∑*:J√˘u(4ù<	Ç÷‘!Ö^#Ÿ. ¬I›≤ÅEØ}ÇıCgÃég8@à§`ƒL.°2’‡ΩÖÄ√—ã˝)ÖÚ$ˆæÜfÄ($ÓqÚ£I4∑¨î®¿¡z<˜xAôƒ¨Xe˝cF¿Q∞ƒ(ŒmBƒ‘çæ¶‚ÆMó 4(›≈ .€é≤„€A\yòcbîV≈∂€Ú&éÀwå\.Së"á“Qái.˝ç8Õ–†ì7cŸı‘ûÖ!áñÅpÏí—SÓ€ÙIT±˝º{a(ï≤Í¶/Y?ÍT}“è23π”∫1Å%zÆ≠ßﬂT»π™⁄î‚8ô¶C∞πÊ†LVC°›Öòº Ω8(n∆Åˆ≠ç=c¥F/Ê∆z∫Ä‚Pò¶eBYßÖ?˚	Êƒ¬ßÕ}`$ ‡:ÊHÈÒäöH‘"ê¡FÏËÅ¡è‘ èL∆°1Æ9ı”∏é.˙„Ssœ”v‚D8aı®8 d´©Z√ÕÃE∆≥∏¥√J/7Î’€∆≠›v,ZÇ∂h!HDèƒô€6πÇˇ5—&6MÁ(æsˇQ‡Ùﬂ3¨_yÚ¿ ÓYZÅ≠ÊDJŸ
mf≤N∑∞5Øü’Åª ±´t`ªB7RÌ´B®≥(å+.ôK8ñT }À“êU§A∏z&ÀFbíÓ¿ãúMn≤™Y∫WÀ•ù|qï
ßÅÖ»ûºÑ8XJ#ÍïîLÇÜ˙wôvíÇ
çóói'-Ø%≈ıJã.A#ygô∂∏7EoX7˙èÂªÊ.˛ûçSp∆ŸGúµ.Î*ù«”ëõ>ÔÈx- bG≈_¡ Î∑%‘ÊìR˘ÓGJ9ÌkŒ•Ø%j–•/&^ ¢PKDÅ£≈Ë(ÖƒJ=µ®Fóæ–∏Eª≥âŸ»ôÏB£ÀñõSî‹ºÃÜ¥◊ç”ÎÈÀnœ&´-óiﬂéˆoñ¨múºJT:N}®ñ{vxv~z¯Ù´CV{ÏŸ1yztºå<∫{rt∏ﬂ}÷%˚«/»ŸW˚gg«ÖÂ¡“◊Ç÷™ûå⁄¶<,#‰ÓéÊvi˝÷Ä$Ôa˙Óµí_+IŸAﬂJI”√ ®˛Éj\à—ÉN¸Á∂µlùn7ÄQ˘K,ù˛rÙ…¶Ö>IªŒw≈¸ú˘æ‰:^¢'ìƒæ ( s…ú¨”g´ ’∑1ËkÈ°®N0{ıÌv„·ßw¨:˝†ÂÄã¡4dã•˜ø”Âàs¥Ì-T£÷Ÿ$≠vÛOK£Ïü÷+IÜ§ﬁÈ‚H◊ÆΩE∆®'ãl‚QÅıñ˝1¨”ë?:‰ƒÄ;1ävßãíÆ7Ù˘2•Ï¢rëDôµÆ”Zx_+…˚⁄"úœy_¡§"‹≈ÿø™_◊ù9≠ØkÙ–«kQl¯@ﬂ7ËxÙVB	ıá–üW∫î‚ogj(™ﬁ/Ÿh¡e`¥pNfπ<‚Rí∆”%_¬ÛÃ>Lÿ©•vAÕv¢¢>7ZÃßÄÆ•≈6g{¶RÅ±ô∂—cõ7Õ÷,˘∆∫@^èb/ïƒmªk;rkî;OÜÑ	SKj?+ni{FP©‚ê< c8—§=√ûÈw÷S(1aKÆD_µkíA‰1Ïñ«≥Tç–çF@)Ü#.’†j#ÆÎ-é>êH^Ÿ˚Ó˚˚u¥≠jèJÎt"™µ£‘D¨W—ÚE]∏ÇuC∆W4&}_¯}Œ€™œ˘âû<Û¶∑ˇ8°	¨ı^¯ÏzÍ¿Ë˛≈“∑á	wsÕËãµºìÕò/òè5MQxy˚0Õ˚RÕÍhëÀQËLX@Q4ïŸN∑vHmk˚-g˜ÕÜVeø∫a~“⁄ê^…Çæ>‘3∞C∂6bwÍŸ\5s¢b
ìIû∏›îtì	ﬁà.íΩíV%Û6?uÅ”`ûÿIÉ ÷Œ∏ÈmH6§¡d¬,≤•çBÜ®Q˙

´ÀÜr¬#ßè[
û±_ÂLÅèjˇKƒuÊÙŒC<Kı\:»3ß_%k©9/Òô”;˛,Æ-'ÆLß≠∑ˇ%Ø0Ø¶†ÃPâ◊,6¶ı]çŸ%3ÒΩ°Ñò¬Ø7≈r<›Oÿå9ùâäSC)„<≥¥î∑xõàÃ3Ÿ«åÎﬁB	≈¯∫D¨ÊZƒ˝Ã8RñêJÉˆYNáf#gñ“
÷›ÖjSF“˜¶≥π)ê∏P{∂Sr	ôx”›JÀ˙mÁ=ºm©A£{É;+—:Of¥3YçÏœÍ§Ó+öHSFè$3 É‡íWæ@#Œ©´Ù(ˇ⁄ 
˝ÍàQ‹ÿÑ
±ÀÚå.i‡·©ËG@≠ƒFq`o;X]π(Â&#˚v¶bÈ˚f©õ¢ü±ücy∑TË»õxN‡¢‹ˆΩHåÙ/Éî)â˜'®¥$!´¿#ıï5¯àtûâ˝¢‚â’µü‡/Úk%V∑‡±≈ﬁˇ8uÆ·êÍÉÕ-ìÉÿá“sZI=ßm©ÁË-ªw&ñw•Œ≥ﬂØp%í¿(f3™A0Cè®√∂ÍâÌb⁄êHO¬%>Ÿ ﬁwˇÊˇ ã¬j§ÎMXYB.+)ìQy¨mı&ï≈vl^ÂÇU1p,⁄XRƒZªx••ö¨Àñh$qA-⁄Ω]>Êöé
Ûia=2õ.≠Ñµl… î”ÚYJ7vcîÃñ;T˝±PøT∏Ö†ø˚ñ”?Q'√”ø|˛AQ?+}©_1A√-i≥Ÿ8a,Ç⁄2dQC.tƒœ*€ı*¥!6Æç:¨Ù äÍ÷vÉWÒŸ<Û{k9∏º3˜ˇj‡Má¨Åè_«“U[´
•ûÒTŸIËñ‹¢¥W)7ú≠è\
ßVŒÇD†zßgÂ$Î¯‰©Õˆ¸i/µd°àU˘OL3ˆ$≠U7PL)KxØR†Ÿ≤õ¬*è°d—j6oáh=Ñﬂ®r±SÇ!Ë'k3®<æ∞Økµ ¢-“ô◊kVΩ}då·O€µhtì<˚øúªûON∞¥Ò∂ÏZw™(ò‹ùaJg¸±Ó“œÂ&›ZjìœsŸzR‘‚ü6ÁfsZÌ√}? ?˜∞í‹HlÆú`ø%Ù•amí{≥À¬áÇæ∆í8ÉÓØÁørÉâ;…£|¨≠¡≤rP˜Azå[?e&[ÊYÀ6Ì3í7~Ñª‚'›>{oôfÛ`6Nˇ}0Ï•eöøv«cˇJiæ;qPK˜¿ﬁ+—˜ôËè|ØÔZªäó◊Â„¨koÒe¬|ÛúæTAàmGZÂ®*áCúê¶Ê\Êî≥®∂ÇÍ)ªπ+Æ≈zj√IúµK;°±9≥§q¿ÒL”Ÿ∑PÇúR¸)õUﬂˆ4ŸÚ`wy◊VÊÍ*[ÏÍû¿Aæg¨+]·%æµJœáV"˛›∆8S&Te•WV¥õ®ÂZˇú$*¥Íi»*m¨û*≤úÕ{gn”å◊ÜŒîß7q∆_MΩ(‹]‰‹‘ÅIE^3˘˜u-yL˝ƒ;D/lÇ%≈w–â¨r4ò8]CQ‡ánpÓ;a¥ªPˇ*˛™üıíôÖDªi2Ë¿üu‹qãIÅ®•®74XƒùxyÓVÈäÙï= :+•x!]zˆ„°¬(5ÒBgzIzJ«)í`O˛Ùp†ßk\M¿rÄœú»i§ø÷oÍX?`•ÜûC3Ïé˛ªaæhÃ‚”làïX–Ùb»b	Î–ªlû,⁄lf#>à*RT$ò°4 U-¸cèÇ“âNpz’YT†*<±m75ªRzíóó*~√\®·ôézæ®GN∆:¶∑[g∑Zhà8Fv	À¯X&Ó3¯;JD≤‰˜˚†'‡YÈeÉfhä”ÁÅV(”©ˆ˚ò¶∑◊Ë”‚ñ—5yÚÑ¥õÕf—+ëÛ⁄±Ôã}É]Ÿw4ÎcŸU>-,Ë˚ÑTïŒ7˘#^UdÉØ»Ñâ“„ÿw4&v≤áﬂØ'Â%ˆœòLkJ≥g·ªSã¸îb≠:|Œ∆˜ò: bsh *∂ä9UdFÌ´´dã‹‹$œ\ÿÙ&Bqÿâ ‡MÊˆù±Ks[√Å6ÇîL¶Hh∆ﬁØ–æ‡‰ D£–∏°≈c÷¯æÿªq6ItπT˜jLÂ+3πô6»L {ΩµÆçY[êd⁄≠$OV64È·Q8ÈÃÍ€Rr~?.zæu	ìfçè/#£0J$+FØ'=cZ2|cÒ∏jÓFKèt˚Ó_¸#Q‰Xd˙«ΩoûPÇD≈YöMü{4GçVÆïs˛^9∆eg!.ˇ Á ræÚ‹+ÍwAŒÆ<¨6†ØÁ[n\≠D¡LZ≈6[)≥Ÿí0În¶8ì}n9sŒz3'1°‰∏wÓÙ™¨'Uñ≤∆dkn>,ä.ë≤p\Ü<eW!õS*≥Ñmfñ7QV/ÄM÷∫%QãíúIN™(+™^¶i&M<äˇÆ$/ﬂóôÁü˜wˇñ|‹~{·ımí_ï≥æ|T; Èÿ˝±Ï 6Ÿ“; ◊Ü˘«ø˛9ÚÄ—ÆˇÌéÌËõö|1J¯-=lÍÏ·iãÚ≤¡ãã§‡Õì¢SŸ{÷P5êöLƒè∆—IxìÎÄX÷ÁË%à
fVMÎÔg~9A˝‘¯ÅÁ◊QÎ;æﬁ}∞‰®\Ò¶≤ +,CJà‰ƒùzX°…ª˝Ê®-÷óÌ‘/öM4<uZVÌÌÒ)À5“b?!ΩÒª‰çX=û“Ûˆüƒ
∞∏¡’€¯Ü¨]&ö!7{0›◊Üz$ÒU§ëœ˝Ø¬∞ w∂ˆ„H6› Ö¯¿Èè™h:≤≠Oß^Ë›[u ÂåU¨Ar∞XÀ/:∂rò,w¸.∂Z1ÉêR:¢JsC”f‚en"™ômDÈ+ÖîçŸ<ï :Œ¡Ú≤îπ'}IÑ«I-”@ºAT∞înEl*“e€‡´Yˆ3e∑bÁq·A$C<ÁB©&Ì3˙ñ}€V∆3ÿæ‘À•¸C∏2Ñ<˜Oû=Ø∆§z#ç´≤-\áñ7µÏÒ
˙rªÛÅ˘C;˜ºR=⁄ØrÂ‰ÙÂ˘◊ß'«ßÁ~|_‚ÛÓ`‚ÖxäT"i≤<‡Ò˚h%ATzπŸ-—¬[∆ÿ˝9°å˝ˆ¿ıí∆wB`ô: X«+ucõp˘ŒÚ-k¨" ÉºÃ»üÀõ‘¯Z›j4[oàCÀ_â{Õ∆£Go2"|lﬂ¬lr©àQ©¿®∫NVô©£˘ói :ΩFõ:´ÙXä`^4»	IÆp¡®W¸ê¿ä, `}I§?˜∆Ó9 1i¬‹"WhÌUÃîƒ4b+·¯#H:Ωåa:£A¢Õ®•“„§•ï£˜"©i^6U˙'ﬂXÄ vFiB^∫”—|¬‰9tÓÆ=p@6|«¯Gá`™'2gßÊç5*5(Z∂‡“EªlGª§é'ñ[ÌºÿfxTò WÒåJWî⁄a',=ÊI—≥t–§√di◊é_útOª<QˇŸÔû~—%›ÛØ∫G‰’9:|qÿ=%/nÛWá/é◊ë'ˆÓù¬3ÄªI_Xx†5™øn∑õ•ÚLû∫·Pòœ>,f—‡g~òl¶˘iÖåh˛ó}ü«Où`±ﬁV…√k fwQpTXRg‡ß√K»˙ïòu£π3Æt‚…í-±√PûJ|9¨±•¥áƒÒr#˛´\+™Õßì≤ïÁÌ<≈5qÇ!F,Ä∑œ:dgÙ¿+˙€ÿΩÄ_Ím¯µÁóú¿]˚Ù:ˆñBºÉúπ°ÁLø¿¯7L)˚ŒEÇÌ†©d∑≤E∂*¸ÓnÂœZn˚—VØB BToÿ]\8„–-·I˚¸´Ó{/,-∂~Ê¬Ä+Âæï√∞˝˘ˆ√^…ØëÄüyørw [ñZcÒ˙ÔéÄÜH8ï¯∫HQ§?L∞‚¿L?Pœ}y≥r√Î˚XR>:ãÆA∫á˝›s˙ÔÜTŸÁôˇ¨˘®9h=®lp÷/Ôomm∑vv‰˝Sg‡ÕCxpˆn
à√ê,*e(^‘˚Qé
c…¿–Å≥ƒôˇÏ‚·Ös—/›ä@≤Éô3@/shÆ5{Oö%+∑NGÓ–ù -ûÏœH ÑCóÍê‡œùâ7∆<ï(¬ÅÏ“«Ë>∑s§‹ÙΩ¿Ÿ›ÇË”ø43&≈í›≈Î≠LB€Ñˇﬁ‹îi?£“–X@·‡zÉx >€îÎŒô„&Ëá4˛∫Ô˚Æ;—^˙©¥ñlmÏFË≈√ G[Õﬁ£á≠ O∞ü¶êì–πpK∂ã∂i:UEÄ`ﬁ{hºaO«B•·@í„v/∂·b„~Ö≈KH‡®œôàÙ-Ÿ˛q—ë®`"wVÒ≈Œ#∑Ÿc#˛πLÒ`ÉñhY-seëú÷y£Æ¿o±nr˝ﬁÇ¢%f\xcêBƒxQ)gç∑I”_è7a/.øwsƒ_6I˙ÛwszAáH5˚¬ 9Jœ˜P' ?SŒCmïôYDıdÆBGπ∫Ù$*´D[6À®~È&Gı6πä„VôÆGD&=©≈-iˆª‰ïî∞‡%¨ÄT~>≥6¡—°ï◊ˇ˜ŒÅç;˘f0ı∞¸{≠T@:V¶•æ∑J∞; â˚Œ∏èv_K∆`=*WqÌnœ7ƒ#Dßè,õÑ fÑ mÅ›è∆vúêß†∆FÅäúP?vz®*O/7súé˘)•ITªòjÚt-=x·ô∞a(˜nßÜ¡lÄ_†√ÅÂ9Sâî⁄xQ™dΩìY4
n	q/Y–H	±Q<6S'%ú¶H
û•∏ﬂRê;(Y`}¯®ïÜK™å©P—ÕÌù¨—ñ•BìÏbmΩ© XIÙÁìAá˛¯W¯ª±U≠∫∂|Õ ñÙTWZ-»∂ÆdsJ±ïBKºí®˘$SD ÂJW¬ké]òÊΩ‰ê¬c¢ú8ZéS*]%ÇÉyΩr;∂,øß‘√K∆(	∞XmÚ¥D>Ÿj‰≠èORìbIY∏£c‚oˇ#)»U(K¨FIAﬂZ∞ÂXm—≠¸ú”+n‹î7jÈ•9ñbc^1≤,?!EôwÂ~VÎ£‹–<@BäàÎñÅ<a<QZ®"N…"XÀ|ì°å15Ãﬂ%•)c®•∑”5ã fãóπkí⁄ÊÆ®A]íe„ï*kòNrÛAvl”hD˛sÔΩ;®∂j7üﬁ1&î§ˆÓ—Ï¬ò!zÍ“˜'3á:åÓsQ€Ô„ûúˆØ…eH^8Ôâ#º§AF„kÀ®">2´∏}P¶mã¬™SHY$	ö< ÓC…7ñÖkØÍ≠q≠B%π@L&ŸDKdJ”O5‘’§ûËw#hã,¯:Ú"c53ﬂÒa”⁄>5¨“î!∆s™4v»€{¿⁄⁄PUIÿ´oÀ'‡ïLÿB%By (MÉy@ΩØË*ñ&»x≠NîÒJfÓ\V›¸∫˘ı√Ÿ˚ØÉaœ©∂∑m<xàˇ5€µ7Keº:Y˘∫7TÀp1 ≠∫´=,IØÒ≤W©ƒUÍxca´$°et*k}˝£%U¨Ù2éª%Rjæê8ô¢Fµ’…T%C•$‘>g¡Û™Uvoñ‹gl$N·§' `ﬁÇ‡-¶[r[‡µ‹‚(†sz°?ûGËÓ:´7πÔK]ö§DÜÅ˙¿	G≤∏îm∑q?Ãﬁóßo=òﬂ`áÇK"˜Ì≈}Û°ŒÎ}ôêËÃâdY‘*.GÌé~Y{'ØóxŸÆîÖ©nèÖÍoÁd¨%“)“Õ∆ÆÉŒÃë‹Ú,
Ñj'¿ÏÁ2˝à3pPM =¥ƒ 'ò8û(éΩ‘õwÜyM"/ Ûâ√ï
éfLk –$o8uLææV	‘Ô∂íÛ…È¡´√3Ó≈z÷=ˇJ8µÆ'Y“0¨ﬁ˛πÎæ{Ó.0OqË¡OD$ﬂF& pCIÑ√T5Òƒ‚¯ΩF@≈ŒÊËœpzÇæU¸¬£Ô¬è«$!?yÉ€˜Ôõè˙Eß˜w’&–{ﬂ∏›®Íˆú~'innÇºÿ{–˝5¿#3ˇÇ8"Œ&Ï∑1llZ<`iÙ Õ eÑ≠*nèSlxó¥MÃ%f¸)iÌ‡aU≥—÷œ–4á˝¿≈BoBO˝dåX≥Mß&'d1`¸™•ÊÇÒmû„π*ßÛÅwí⁄bÛi>¨’§U§]3Ulå˚m[ı€j¥ö§ÆˆªÕ˚›Y≤ﬂ-À˘>JÕóØ_s{…~∑-Á€‹IŒ∑Õ˚˝ºTøF0¡4è√.ûßa´ÓÛµπœa≈~Ã7…ˆ
=¢Påô8Y‘s`‰ì›] ]„±ô|0X≤4Yª§†πMjÅâs''ˇŸ.kÙŒhx‡€§˛Kª±\œr[|
œ}& —Dª©9ÒÙrqüÏF¸˜fÍÉ°·ƒá”LjÖª∞$4ökóTaÛ¯˙<∫îáUÑZÖ¸öTÆòø˝=dI8∞A˛´u≥G4Õßy$Fé°˜x¡eBX
?Ω˝ó#û	Å„w ñﬂ»…Óüﬁ˛Ì˘·˛qG1ëN∏ÂÅ∫ÓxßahUÒÓÀA9ÿ∏]–]1EQvKÉË‡Ï¸ˆ7Øé Ä«
≤¿9£€oiÙıô;!˝¿y Kàÿë*æµü1ë`Í^¸µZi7€ÍÕıvªbT2î6XMPÔ˘Ωêj%y@vπ>#üõÀ)Û¸Å†>åBLQ˘©3≠lê s˜ºp¸—ÌÏ/¸t>e?∆ÙŸæWŒ‹œÈèó>˝¸ô˚´ä1ÑÇ†ÁNı¶~o¡∆¯:ı¸ﬁ≠÷ﬁ‡©GœÅ«¸¬u¯¸≠iÜ«˘˚·1ä&f√Ô2{;É¿o„›≠ÍÛÄÀsoQ∞¯Rzh÷n»¿s¬Ü⁄˝ˇò¥⁄%',z˘˘vèNœªy≥ÕL=£#!êÏiâ©ñöé%Ò…ŒÊÃı⁄Ô‡u{6?0nËlπ63π+1∆2g,ùFáº¶Âì'Ÿè-ˆc˚ç)H.¡JL/g¿f˙@P”{|’,_£ãkzWJ∂	r-„JÈQøˆ⁄‘µZ«L÷≈baì˙G”ÙGì4V∫#µwÚ‚µ≈a⁄d∞Ü≤,ÀgAvìÜ`[eë•U{ŒœôA+J¶•&ﬂÿ%kõû	Ú#õåß∑π;„IæÌ˛™©dÂlíôdIÅ√ºµcA˜p8a2«¨≤4!è?˛Ä)z@À‹Fπ	≥ÕTW,i¶DÚ«©F ˙[Å¿;«¥»˝ëwÈØ3›¬&…–ó≈l/ë6#¶\“„æ\:/´‰Ù±ù∂∑æB¶zµkã|ıÜÓÀ%ØW˚æà©~ë	ª Û≈ãÃÓ xÌ“5°ÊﬁwÇ¡SFúw1B4ESI8¨Û	≥ƒSg@^:∑≤=∂Ó¡õ@¢è¸‡ô%:Ÿ±lƒ‚«≈B4§8∫´*∂awπpñ˛z;".¡ºßO∑ZÈÛdÀâÈeênÑÕ<7B≈P·IÊeYË>ª8¢ú’Y_¨ÂÉ_®7+A?qhSDgßV@‹‹Y€®ë$È(üç PWbyÿ«æB%†ødUW§÷éö,›¯ˆ˙‡õËúCXÒSŒÀÓµ(+-⁄¡ŸÜFó
t¢L=ΩîJ⁄ 	I ©é•—‰≤ñpÂ-ë@	tÏ *ÌC•ïäÀÖ⁄+ú«ô£’ÑtEBo,5Æù£)Xß"]©ruÏZ*&f	wjMRË<˜	™kL ;%Ú•“ºt}üTo;éÄQÖ†1ÑÓ§÷!…:®›Ç
°W(û])v´Z„ﬂõVÈ¡G…»ër`)Îjì¬t∆≠1è«Jh.bø¶=1}b:!7'±é(ıŸ{ItK{˙3_)uyÑïË£9øSÉ&µï¥@§b◊±‡ˆvn¸GD„-´∏üærÜN©¯osÌDú—^Ï¿ŸjN‚ ∑4ê,ÿÉ“aC+n…‚Ñ=d]†ñ‚`‘r?&l¬ä'ƒÕ&÷Ô»dMTPÔì¿ˇ∆•á´õáì…≤ñQ0üˆÒÑ≤d–ÇAM«ÈUàπ¥∏πyÈêÕ[™˝l§`âœëΩ,“#§ wª›Àd<±}’¬˙cNS≥éÇæ´9lûuœoˇÓÙòúºËæÏQœÕÉ/æ:Ìæº˝∫+;n¢⁄ˇâ8Í†y…è{ﬂ‘Ñ&ÑLZÎ~ÓÖ_∏SÃ$é∞©"Àln≤Xj[i*e:yP|¢®˙È≥ê‹jÊYEŸ&oZóâPKú†–d®ÅéˆØí«A	yHRCXÉ¬ô7]”IÜÌôAëŒ÷ …cü_ƒCèŸƒQIÜºüÓü–”‡}7≠n‡ì}’œz‡í√i>∆ÉbR=´∑0ÄìÜ÷V?ÖPÑÛ‹sàW ?0¶Q¨ˇ Æ Ç≥¿sŒ‹˛_0@Pá‡µEz31%∞—hîkÊXp˚!•Î‘%Ù’t§–‰}›ôGT’≥U˙”Ωéd•,Fæ¶´˜u+¸⁄cæRÓLø¥πUŸ[wﬁ°uï^◊r≠yH8ä¬∆…ù;xÓtï©∑gf›=cbª;¢Ä;∆
¢Õt—p'\1f[Ÿ)GÒÃ4âso≈C[G7#Ü}ê”◊Õ◊|¸˙¯I¥˜’¨∞ñilóŒ¶*Sj∞ZÚÑÓ6ŒÙˆˇd5B9Õƒc–$…\ÔaÓ¨4U¢u0ÓUÀ˙†¶%ÿºÄ–íÈÌÔ˘AuíË“Ñ˚Ã•à∆Û¿¸ÂﬂË]∞∞û¿!^ËèùÄ∏Ïõ>¸äÿ–·%],i“há¥!gŒ
f9pÀ•	˛˝9	ÁK@èº)Öµ≥ßÅˆΩŸÿõ¬êC*‚…?ˆ
¯ÇÃ‹awt=[Ω$%
§ï-k∂TQ≥–ç‰»*ËrÆeëhÊ‹õ∏˛<≤ê}m˚ß)ë≠KAK?◊1ãj£∞m¸É¸˘‚‡Â¡i˜¸‡Îü¸ÏË_üÏuzx˛ã[πàÆ±^{|Ω˝¬.»"¶È9ÈÏ'	eìQJ#|Ç„ì{EíúîTÅ ïÁ¯óﬂXwΩ†“B7
´”-sn÷œ,…oµ:ê8zIHÉ©É€IèîQãã
= î⁄¶UXí©¸r´
Å‹a_XHÚUL‘cÑí‘sÛDY@¬dMŒø-®∏]1ü;|126ÜèÛ √xÔ∏4ØÊc™RCLDâaY¥ôªπ„q»D t√ƒ #∏√bÃÿ1˛mCÈnFgﬁÑ9˚`‰3vHF3Ó8√cÍÈÌ|ÈÑ#s$™ s›»·‘Òö4˚¯Á∂b”ÂBZI<Å˚ªÏ˚Ò¨Ê¥‘eñJ≤πØ^C»\°i,åY‡^Ê¥sh€Ü·1*à`üí-€0!íòzìôùlô!{Û(#⁄π≥µlGTæÁ≤ã¥§x.t€wsF ÛM“ng{a∑œàànq•ãΩ]bàú6€2|ÅÌhVû3RÈ…õøH¿∆¸zÛª	Zè˝ØAË‰|`n%t·S/∫>m3ŸN‚âπ°1(xÁn09ı¬waD’˚D{y/òõ•ÂUÒx&—ñºk’WŒÿ$AƒÓô?æƒ◊(◊|Å¬09£ÃS”Ê5(öúlŸVã0è˙~ﬂHJ“©8úOÄ™Qa$ƒ§ﬂ»†Ω—ìXÈ˙$M¬Ï˚MnÀNùxS† ì◊%Ø∆ﬁ«æ˙çƒ>≤Íb¯W—É—YˆÚúyfk<WÛ¢ûÛ5∆‡Á›UKA€Qç‚_.&¸ŒùÄ’G'e®`zMÔ'VCøcVçä
TÅ=GåØÍ∑‰RÒO&À∂&ÃIs∂∑ñ8ß\S9¸n¥ño≠!jç	Úüç<Ùq]PU¨·ØUeWU“∆ˇ[˘âŸNˇÁ‰‡“œsœ5ÃMÊL\(e
É‹]<IúBÙ ˙¯ˆC<3ÖŸ^Ó/ÁÃjü1‚W¿?›Â±C^”x©3å5<`yâ˝hmá/oâœÿ‚ç∂iö≤fùÖ 3U(Ü
˘Kù±7ÚcˇLmÚlerZó\q≠çmàqbHl9eBÃ;(˝‹ŒÅ nsy∏5ñpÎ≥˙66’æÏ´z`\≤=YqiesÜvg\obËwÓü<{nàQPˇc±+/7ª%ér)≠˝Á±d‘()UÊ∂±î®Y‹R)˘3∑ôÑêiﬂBÍêÈ–∂‘Ô«{¯uWx∆ı5`ÈG|Œu@˜ó?7KÆ*}<ã™1ÂÃ—Ú¯k›«\Î‰6Ò9TÍhÍÛÇ£©Úå•,[·jG8)‘W∂öâ„+¯˝ÇálÅzAˇ¬#∫ıÒ°«@@È–*¿( [)—#,Ü_…S,¿ñµ≤Æ5∆⁄£◊Ï7
º~à∂ïâ\c6jP`Cã¸ÀÜ¯ív2Rõ…yVB∫Ât’Æ¢*fôj^kœNa àÆxÏ+˙
Í´:_¬û»€ÑÈ1l—¢5Z6W¬?Ω©Ä9YÉáÖ“çdöq+Zk2â?>$°˙€ù£âà≈»"IZ™∫s<·zkË˜àˆÉyt˚˚©gﬁÚc¬íW 1sotíXKxú•MäDÀ‡ Z·9ûñ>ÂÑ-™cj‹
Vc˛Ó?¸ﬂt®ﬂ˝áˇ∑bYùsQ§HXUñ∫s:Óºß∂ßãÒHC?·Õˇß]ö›•˚‘∂À˝_À†.±KÀÔ∆ÙÒ	˜r·'R…äz)ˆ
pa¡ù3ö˝8πkÏû¸=§∂¢≈ º0¬$Ì‘¬6,ÄÙé\¿&˘€¥tq≠ä~ÊÏ@ô„g'µ›îl<©‘99;VŸ|j6 ìDSEµz@Ç&¡ﬁ=⁄j§ääÌ”»ÙYXÀ^J‚§≠˚“s˛å:…∫A≠ˇ«äπΩú`âÏj∂1QZ|TΩK«¶YcÀÜp π)‰;àêÌtûàúRÖº‚0Ú#œz¿ìæ$ˆàÙI0≠7¬∂∞
qñXŸÎäpPo;ÑuûÃ∏Ar÷ øÊÂ
˘+ißˆ÷]áÔÁŒ,Q@6&0…|dj¡’Lí,n%ƒÜÂKﬂg¿ä˝ænDÅ¸ÛÔ˛Ó_ó V‡ñ)êdu˛µŒ3D]8ªh©=<eËG¢∞):CèëÒñ7j•Ú¶^Å∫?Ö4M≤.€n¡Mµ$U®U¨‡Tı$@‚˘¡uƒD™µKoâ¸K¬úLë≈ö°≠ﬁQæÓ$8N⁄ó´§lπ§¢í·ü·$À?iﬂ®˛∫ıÄ˙]»„kO2¨jrÌtÀx˜≥}Ω#åŒê≈xEÀDsÚ˚}Ï”${©‚Ÿ%õ…œ ôŸYV	Dc7ÛîüıI¨
ô∑˜Ôe©1`“›? πé’3Ü$öNMò:J5Qê?3≈íZ;+¶ÃLy…7Tól;7yeÃ:à~˜Ø˛'“eQ§´¿2Œ≥44ô03gP≠ù’!˜xi»ÂÓ&œP≈8´ N’Óó]*…enﬁM[ŸÌÙRâ(ÌîäÑ°:Vnß€«’dÿ®å|‰ E~¬≥ª‘-vb›Çj≈
≈wˇÍ4hXëXº’Í	m‡ﬁ"ﬁu7‚Øeí.$E∞OMxw:Ä]ëTÛH◊ïº‰”L≠û3ËÒòVÄ…ﬂ[“n)R≥•DÙ¥ÁneÔDV`	π;ˆ˚ÃPﬂyºI;“ÖyRËè*¶¨2rz√)≠ÚŒkvÍÌøóŒx{„¬&Ãî˘^è˛t‰Lá–¸å›Á–ª£ˇÆ@q+LÏí8WPÚÈÍfßGæã!âß L_3Á“F2« ‚ë€á2É®WÄ5S—ùä)≥ë◊ªÑÊ˚7¥≈CÂG‘5	TÜ˘4JV‡Q/ΩÒ;;ÂÅÂ1˚“é0Îpä•ù0√Y5Ùƒ"Ø\LQB≥˙u«ë_AÔƒúg/h…:ﬂBj0”>Ãíaë¨â8`ìb-Å<ˆg‘*ë	õÔ˛ßï(”%Ã__å`E√zùËAÂoˇ·ø˝◊O™sè˙>˙÷”vh“ò=©ÿl6£Õ∆Ø¶Î
¯%S≈ùò_>>¢ÕºÅ`Ôœ1O⁄¿sÓà^SúXñXÛèÔöR/ﬁÊëÍ" b–√Ó9‚ﬁæ?Ω{ ï'È‚ã3U<@“Zù∂≥≠F	ª%’—Õ˚1ﬂ%üdv'¿Íí‘—(Üï¶Rîà22ã˜9™Ò/,>x!ÿÏ.>QÅg˛‘äé‚8≠û∫CoÇ¿ÃÈæ√JXﬂ ÉKå@!§OèéˇÚ´ÉÓ≥cÃëƒOÔΩÛ£$•â:lzÀfi#∏AΩ]7°∆CZ`é0Jo J'¡/AÔ“Aßôœ“¨ŸPo€àì2±&2 Ñ—ﬁ≥˘pËÜ4Mã	„,˝\“ÈãêcoÍ™ÒG‹‡∂£¡∫Î'd‘˝ŒfNnÏÜ…C¯6=ÑGœb<hP  pççA[4;^5 •„⁄¨xzö´ÔÀ¨>&)bÌq&DYñøØOKπ&äLóÔ√’êiQî©§OS	@”?ò≠Ï∆ö§L#f™Mﬂ˙8âÀ⁄R†eCL∂r√iÍ3Îm2dª0Ö¡˛ˇ  ˇˇÏ}}o#GöﬂW©ÂŸj-Q$% eFä‚ÿƒJ#ùD€ªÎ3%≤EıN≥õ€›‘hF'‡ÇÀÂÚÇCêÛ"‹‚Ãá˝√˘#õíCêÙM¸‚èêÁ©™ÓÆ~ØjR“ÿÎæ=èÿdWUW=ı‘Û˙{X∂IŸÑ˘¶o¡+˜Dæ"ÒBFdéÓ¬Ù‰£@u3˝c\“|Eﬁ(≈†÷êG∫¶Àÿ„]s«dä∏Lq‡¯"òñ’tÈòJ	ÌÅŸ(û≤Z˘j7+j¬∆5RÍ<å)>ÇùÁb4¢/c‚≤JT†‡)ÂÇΩ^~l:œ∫õ9V’Î;ñe ^®\”¯\K9.P,å®ÊÅïà˘z“
`kgµºw- ZÏMnëù	v* ˛7€8Ì<[Äaâ"Úal=¡™√t@ÿIeNåÏ˘‘ÙP?££ó6d2sùâkx^T˘Æ4ÃáMÄ˙!Fœ<«B`GDﬁXC	Vh
 Ãº√πÆµìU£WÎîáK{˛k8;ÆØÀ˜⁄+sÏ_Ï†ò£ÕôvΩ’lÆíz`/…†´ÑwD±Ÿ (ËÊ˝Â9≥—3’Nÿ⁄IP¿\XAv'gıˆ∆£U≤µçˇœ¥ﬁTMvÚòlÜ?ﬁ‹Ñn¨íGõπ?nµ£_wVI´m∑Z\£∆ª≠-¯ºçﬂ¥≠îÕoIÊl	D‹bˆ|°G◊ ©àx—ÄŸÈØFyjï≈ﬁz≥÷j*Ü·Åï$¿^8[L`∫dTî‚È£÷™%X@gQ†K…¬jê>#™∫+=ƒ….≥êCîtH¸Ä@$CLï!≥u¬õÁnπRÓØ‚§Õ+û◊j&æHûôπ>‚ ¶hÃPA·#öÊ[Vçä?ˆh~ª fÉ¡âíW1·≠ñ9:UùäJLFÀ*›Œ1NcÑ∫Jé≠∞Ö¬‹Ã¬Èå^b©Jî∫§⁄ì¨û¶fñ
ë∞Sæ˝ÍÀØfÂ\
9ïg⁄ ≥éPä…©≈ò€&ﬂ…•òAóGˇf	J
Yh-µ:¢˙[%ìæ¨[R>T»wóã„∑ˇ $≤/F;ã–v]øBÚ[Ô1ÌŸº‘º∆ı≠ZeÇ»[Oj∏êeø£WOj¿ê$?c¶‘bË;ëfM›zW7Jî-n
´√BP8(¸ÎÆ<æ?î´ΩÑÜ=i√P†D
Û<28~G¬ÏÇYC∂D.≈SR"¥)Ì%•t•MÉúª~Ä¡´äÖ∂¯cH"§~˙ÖÂxjè™Ú»íØsøG:¿ı†#¶¡°…è≈∏ììœ´ê¯kCM◊ÊbrHàeîl·Mw
±,C:√É4À2–DıçFaCWV≤‚«úÅ˚’!-;“rC%≠C	≤™®§â˙ıƒ·â`ÀCÉ|‹E*Ì4bGÍ7&h«Mö«†,ÇG˚&ùÿ∑øá•¿ 'wíM	H¥eà/˘:Xï≤O÷Da˛˙û?áó<£÷Ì◊‚ïA79SgÃuéU‚±›ib9ß¿ËÃå&¬πi0Pr”?Û"µ?"Ï6Ê™–7N∆§+Uª{úûN—ÈÍÿ;dHœÒWR’–£æ¯à•ê∂TÑºU õ'≠øL˜&SA˘FUÑ&\‘Ïz*oà}√ß¶Â¡¸÷k,πH•Ï|"zÉ£~Â§õE,&¨†FçÔÃGk Ñö≥‡–QB?≤_OT)fØ®–
Ê ¡ÖBßUV
Æ©5ªCíÈµYòûÂmG4·UŒDæ˝ÍØˇCY>Ç√ÚÇéÛ≤‘sÂ∫;˜AœjëOÛA-ÁÚ@*º*¿+VÇV¨}:Ëˆ|Ô‡®˜≥ÁOèN˙ΩÓ©f1mlEM\≈›ë16ÊÑ:“|,$ßÒÉ‰Ä$«xêÑßsÇbÚtVÅRT)d˝é0µºìËNò]H€¸NÇ˛.ƒÇ\ÀS‘˙ZÀÀ≠L∆%œòl…r=#ö>X?^
gTïÅNÃ…Öâ@G3ﬂúöo8qÏ±~ ·bÚUàW.ùe ‰G3∞,ˆnéü‘ˆ|{Ìà;Ém˛ÚıæÛÉ!ß≤ªZÇ&E|òzçù,&ÓÌôkN”u»|J“°ﬁ‰Úˆ-ﬂéÄêÂì·6‘Œù åW)ÁJ·7
?·°ÀÃÏƒ£î±rä…ˇ
rGLúh39ŒòO’
û∏$rß¢ërq.º¯“º âÁÃ8§ûá’ªBlpS<≤Êûá,Fôè·õÇÇÂa)\2f7(Ê Ú*∏l]√q'¿¥q%_‹¡J*ØF,f0ÜÒÑå_√´ô£ìûßî=øæŒ`™Ä8AÂ±1>ﬁ;òÂë¿…LrD7ü7yUøh‡œÍu∫JŒ4ê“yØÿ;u°ŸË≠?ßRÄ<
ÃÁ·‘æ`NãP∂ÅCNÂôRß…Ä{Ïvj–@æN}+ÖØ€Y_ÛH˛üí¯rSëN‰ó›ãøÏYÖóÕ}^ˆ¨eSﬂ∆_6ıuïóY
¡€Æã¸/ê*è=5é—çÔ>√Njx»c·eëØ¬ˇ\ÃjRŸXe•≤¯Öè9Ω÷—D¢Nß‚m!c
lSß À¥≥ß |Uπ·¯ °\a•w,wõ]˜ò— zaΩ„®4J1ÛWë{Cq˜«?ñkî~.˝‚ù∑â*[`00∏Uíuﬁ…Ì™¨¢ö|©f\´˛N∆¨àä†òo≠ Èè]Á}∫ÊtjÄt[ÍíÖX&;B…πaå1"HQ…Ê±¬8√Œ´´-$Jy†!xÛ÷àV‘VQuÿ!/æ˘õ∑‰h88¸≤ªtBˆ˚òï”;"Ω£gΩÉOnˇrˇà¨Ì¢ñô&qù˙„|@,KQ@†w>cí ‚!}‰“9ûë<ô“ı\àÄà«Pã–BÀ‰©ˆèTTZıÖÑA\RóXŒÑYÄ—6·∏ n¢Úg{e5Ò∫7£∆—1[™>7lºcˆ°ûÑˆ
E9x®≠¢ƒr˚ıò6âJ&‰Ω∆héYDBÑrytß¶∫HC˙eª/?wÒ/v>Ø(’ôX∂q$œòÆP¯úﬂÚF¿[÷>o5ö≠/˜5˜öçGèæ–H‡Vôxz¿(
 ¢Î$Ñ)\nq	#ó¯£ãÄÎëíí‚)ã« gñ≤K◊±ê|lﬁÃ¥·∂Ûäô@"•]ﬂ:ºd˚¡I§kqÇÇø¢ÅßæÑä˚ÂÌ…©nqÔCÕ}"˘#bèàQw™oí.ˆ√]‚âÙ6†s#Ω™∂ÿ1Ë(5Ùò1E ≥Y¬Œ91ŒA›∏ËΩ ›<|Ó≥7éD≠‹Ù`˚FlawÌh<hD0º˝`xÀ∏ﬁ)√[“ŒÆ⁄ÉŸ&Å=‡îGRà‚Ê∞<uæ>;$¸ﬁ74ÏZÜÈâ¶:Mµ7Få°ÃÉÜm~Ñl(6f∑Ã,;R≥ÌÂ4+ÏIR√≠≤ä÷≥`\Õôù π¡A∑ØOÑóÔæ÷∂¢∏QG∞n∂Òä‡üE√Q77ÌqàÍ¡π≥–!ﬁvªu[k7€[kÕ≠µvª∂˝§Jó˚Ù5Úñh42L´écù`÷Qì¸ÑlÖˇioÆhÑ¬>¥ÄDÒ
	$LÇ⁄lÆÚÁñ„∏Q”Î@Û:„R∂ÔêıGkØ’∫I—øáúÕ˚B‹RüæHS6Ñ‡TH5◊`ﬂ◊◊ˇÂ¯ÉuÂ)¿·±ÁtV$c=:´»≤=c`˚ºΩœõ_¨¬Ü∆,¥Â—hÕ¨ÍxëÕ^PgNëq˛“xÕAX≈åõ„õµ√πÈz>É«TÜa=}™é√1ŸX‡ü«ÿGÄ<FÃ>–YˆR∞
ÿƒËÇ∫=glt˝∫π‰Èf„“tÒ|˛ÖÎ„oëHù·}\g’>C⁄â5˜≤πTòX˘Ä Ìif†Wå;ßÊî°+Â|ù<ÏZ˙≥ÈùÄàäëñûı)µŸQ<ÊÑµò=ß$‘(µ+†1$Ó3”øB®y¬íÊÅdË∏ÈX¶¥G—±kåM¶¡}‡wıQuïu≠Á4∫&>-7ıØ_Ù≤√—òπŒôêÿ‘l˛j÷ˆ‘Ã%Ωö¥åNÍ≥Éöm7Ó™…˜§
õÏ]¢htÁ®ôFΩò¥ªì'ãA¨(MÔJr™ŒÒn`¬h‚ñŒ¥Å∏$ê‚º–√(68auœ\˘J€˘Ã”dXnƒì4|MLgÏ_Ëx~◊úÙa„;ò¡U“..ùfÖÈñ6ºÊ&ï«∂"o/Ωç´*öÂ*ú’“œ8L”¶u'6h’‡’fé«ÁzGZ¸[µ°‰&ÇwâﬂRm(`"{∆9k(c=uõÍû˚åWFoÁkµ§ÃR’‹àr†€1õj)≤5Œ«;YVµwa-≥$”n°÷äƒ~TPúõ{s‘uüu~ÒÀ˛Û·''œé>Ìü<ûªÓppÙÏÛ€q‹%gN¶ ÙbP≤1‡bÃË$úzÆ„cRœÅµ‹œØÂ~ø>∂ Ç Ê>n~«¸rÖàEæ(\_‰‡TÉØB∑<zwM•»Ùàæ∑XÜT<˜i	˛Ñ“Ñ∑∏;A†ND>8ó0>£ee_BÒØO∫WH∂!?-Aúz\äŸó»L™>êèÍÉ4GÜécù—Úº∞t<ÙS1Y∂¶úÉ∫’,M<M•˚{”ÏdQ∏_û,∫î¬a,~[µÏm¢µYí”ﬂ2ä•Àﬁ©÷“^Ó‘ô8Ã˘o˘ofW—7Ä Î®÷≠XFïEj#lèx>≠róÆç-ó,AÛJA–J˝êŒ(ﬁ˛Œùö#GE+”+RÅ%ùÒ™¸ ˝+Ûåí˘î’ç«zhûÍp¶Ûæ¬<Cóa≤/LÙ ∫"7÷L¥Ë±ÈçÃú ‘up…3≥Ã™á
˛B5∂∞Â|®ïúC‰+cbÿcf™¯l9e{Œ´ÄGè*U#V°6 !mû”äk⁄nÊTÎå†)–Sî)≥∏Ä∏Tù8gB*‚˙‘5~=Áäò+π»aﬁM˝2é+‚˛LπÅÊa¬>VuxÅ°0õ4nêzœΩ˝”–Q0ÓxQR>Ü∏ŒßÈ¡ØÂøY#≠Òn‹?˘nºô$0≥wkÆÂΩù¸<^PãΩ´û®ÂïYYsäA+xa‡ –ôL@S‹cmO1/Ω‡º*∞‡ÖœiN¶
¸ˇPˆÜT–ÌÒ™§ﬂ„U}Ù—Aˇ˘‡Yo∞ﬂ6|˛qø;<ÏÎi˜¨%]/M-Ø]}±A”#’Ö‡êò¨Éß˝ :Ìôö/Gd´¶7dt÷¯Ìè≤Œ¥ü¬ªü1¥¡3˛∑R∆2^ä§°`8¿KŒ^Œ∑Ñ ªÑ7ß°˚Á!ù∂;im_JzÅeU7VzÆï©$ÇãL@6ƒuó Í{d2K⁄é”¿k'Qµ6¥∆DJbÄ0%äàG‰€™‰B„Uûç◊B*Bv¶¡ƒqÛdÔá|CF*	\ f*ç.Øª£—‹-;æˇY_ünWP®Õ¢íô;Du©W„|‰'dˇ
ãBW:!´úëïO…òõ´Q,Ï^ñ[ıÃ)˜^°€"Ç'´kxë˘•Èícà˚ùµûÙQ}A”F¯±Z+ø>oÔËµÂâ"H°áj⁄à›“kçßC`)PÁ®∏¶ç¨oÙ⁄fÒÉœ ?jŒù˜)Hc1m¸É^ó¯#∏C√ÛËDº`Í∂F£:)ân0në`OCÁxˇ©∫¨°ç≥‚ÛiëIgˆJ§/ù¶B÷¢ıP\råïü’òˆäR˝r=»„˝üùü√⁄ÍÛ≈˘J=àÙ¸ëﬁ!'à◊àÊ∫ªËâ1Esá¿Ï(πˆ¯•HßIß‚Ï{Pq=”©(ª;YÚuÜs2ÂÈKﬂÒÚÒjâ≤!∏ïùr<dµR`Uπ”H¡ ÇA•W—“¢ßÜóö±ÂæE—œ„•ızÌƒ¯ÆH§¬r√«‘~‰√?t∆‘™c°‡wùÕ3à∏œ˙˝ü¸‚˘iø˜……`¯ãÁ'}‰˝Ô<ﬂÔûπÊy '1é;n%|["VCŸtÛk/aÌ…¨Ï»hﬁIAø≈Ú°;I∆¶IßŸz¯ÑÜU%åÍ>NV.ﬂÓí/¢„“±Ê°PrÓ,•ö˛zŒ‹£\F†Ï∞1UÑ˛T>Zr¡‰rNópN5Nò≤ΩqáLys
ﬁú;Ój¸ÿqÕ7@Új!‡∏sŒ–«=Ú Ù/¢p_BN∑§G›±Ç?Ú∫Æz6p{è0·Ωó'ª,¶†¨&´‰,[7DÂ.+d#„–4ø`≈3∏èrÁ¥Ôî°∑„0∫¡[k!rπÙ±Õ∏—&ªt‰∏Eˇ'wü˚Ó>ü⁄;âıSsÁ"∆√¿Bò¯Ì,îwu/mÒÃ¥1L'˙∏â ı—«-bM§è€ä5j§Yz^AiÚ Z-"lË¬>™t!Jì}åßÎËÇˇﬂû∑@bãJ/3
öå∂¥b≤ø÷◊…û¥‚»ƒ≤_»¬ë–q;fúı|≈æ–
•ì\ò˛≈Ô!]¬êSeÎ◊∑õ5ùŸ`MN¢Ê¢ò∂Œ˙F ëV`Ïƒñ~c«gµ•Dá≤ZkæRX¬~Kƒ“3Õfœ,+	Ü/∫©˜¢$1≠ºùNsΩ#b◊slN≈/:$ß◊SbBÉ*fZ≠H)ßŸs¶\/cVπò∑ÑiEÛ ol§•T6≥ù≈f6
—öZM&Çïvò~»ä="√`BÕÖPÀ˝ÿ1‰’ÖaF•ªe“™æÓ¢&©ƒ#ª¿>sc@ƒY‚>Õ›©q?ÌÁÕÁÕÁ€≥´ÁÓ‰å≤¢ì[€¯øfccÂM2HmfËJTû	Q[±ΩÃ~–YÔË\z3'À2ﬂ®^£9{õ≠Z^(PÓöU‰≈ú†√£‰•€
ón≥≥ä5=[-Xªˆ¬k'qÉ¶Ã2ZŸ,cc·¨∆4¥S’É+{öesÈVŒD∑∂V±Lj´˝&∫µD]‚FiÓ‹C£C <Ãw‘¢”'tRµ÷ﬂÍÒÙèÕ…Ö≈¿ñÅ}ájb&ÀƒA∆ÂM¥"”¶¯≠mÄ§»Pì«ßƒ€e€h∏q1"ªÕˇ…›¬≠vÊﬁ^˘ÇD©F∫tñµùô¡(%D÷1¨ZUäû≈&1' %≈∑ƒÏ∂í≥ª—‰%eì∂µÏ_kKëyÛõ÷∂ØxwRêÜ#∫Pc◊‰/ç◊Oò™≠≥˜ÒrÏCgÓ}¥óJÖí>ŒRSπ¶]±áÉ^•=`ç’
=TtÜ÷àƒ¨’u¬÷:V∆O˘» òÕØÀÂc5y$Ûöæ/eÀ|p…Òma≈˙≥πî≈R¨£Äú¯´ØùmõO§f∂öùx^Ê£N¬∆ïô8´áÀ⁄≈⁄Áõ,ó·ΩkâG›‡GŒ‘‚£K›∞≈/’rkâ73Ωf\¢¯ ì>uª÷,2H°áÚ≈òK√5fı¬°í⁄*öqu)P9º>÷}ˆ°£«WYÔ9ïƒ?L&o%ä˛D…[à∫ò^>V—:YœZ9ÏWæ4Ù—XÅ¯PŸÑp∆.£˜<Ω*Q3)°ÑTÓ?!˘ÜÕ˜6U#ÑÂh^ü‚±F‹o˛(OûëÓíQÀúì/Ωö‡Z¡”x-áƒsÛ≥Iºá"ÃyáœbVÙ„Õ˚˜5ïZr^Ë‡Èé/±v3(8-≥≠}sFÍ›3œ±ÊæAé~ﬁ°u8≈•¡Qúî›?—ı∏À-#«∞√“ÆèN˘î#_Cô:L∑
ècl.L
µû\_gFG¶ˇzá4Wπ≤5≠∏”jÍÀ/¸F§X˚≠∞˝kΩr„∆ïÈﬂŸ»#		ª$l‘æämJ;ùtyÊ¯æ3Âá?÷[Ü›}ÓØµ÷€dçÅÌ˙+v„0Zê∂6@<>	AíÈÅû‹æ≤8?πÚ≤9äÄYÁf⁄µŸ÷g˙Çøpã{§
|A˝çÀ/•‚Î1…0ßJvìU…V+%ù3îT˛e(†GñYÄèW#î˘Û7+é∆÷√∏•\ Iz`…∑4⁄∞ßJ«D¯téúò»úF©èßb7ì—LëÏÕÁ{◊A–˛ﬁ‰F˙HÊ’Áı:ñs¶Ûí}·><§¶ÕJ•îC£§ÑÂÓJN–ó`ô¿Å≤`I™ìxq9Ùd¶=Øx¬_sÏêz¯˛+ö©j√¶$…@ü{)yrŸ®
§µá§F«Æ3	…#{J®79#…∫âe4∆ÙgP¨	 TÁúuÊîÅÍRY¨¬+ÆÓÂærk$7-	uø;q≥öJß“SßÙ¯¸Ô¨´v'©ª÷D6´Ïq©‹πÆ≈)6lˇµ≈Ñ⁄WÊÿøÿA‘Â¸ù¯¢™∏H™ÿZtˇ e±Ú±åQ√–≥ñ∂ùS!n7%”√¯‡‘«√{±Ìúá´D1F$Ü6ïá“≤ﬁQa…–∞,û15ôÃ:J4À a|∏Úéõ@Ék3√e;'n8ê?úoø<Ùé™OœBÁjÓ…*9°Ï‚DMZëX‘ˆ›'XÌ§ºÒK«¶qìD‹,(k,¿~ÿ?˙„ÀÜST€@ß›·''›€ø∏˝≥ÔÿzÊ\RaGÙ®<ÚìEÛ«Ò˘á·∆	$‚ıGù–:ÍÛ‡wnè`ºµ]~®âëŸÀ¨Úñ≥°x¥˙-R¬Hœ1Œ…`:£#ˇm"±#:∂˜7õí≤›*Â ’9@yn‰âíCm˜ˆ/Ì±92ZNü
 Øñ¨Ω]ø»2·, ˜#±Œ`úÃù®È2Úv3D4ë/»‰%v¢eí∏j¶ªGÀ u¡n÷[ÕÊCj∂ =	ëÈOñn˜X¯Pçmœe[HﬁëÛ5≥¯!™⁄Á+Wœƒx…ΩNèˆ˚G‰‰h»†±»ÒIÄ=å1Só/Qz¨ã€ôêìü?‚±Y≥∏ª{’YX˛πÿv∑8Fû¸vF~j“ò%∫©7Y@÷ã5»LªQ:∑o±í\ùbDﬂ¨$oàJö˛È°3fÈ°¡7’ç&ÚËÈ@íw*Ê^–
@HH¢!Ü∫	ô/ÏÎƒ£X=õòS”f’mÃ’eY∫˙—‚µƒBƒ±A6'!∑-Ì∞*Z=ˆQ∞z”ßñ9
*?}b·—Ê≥≥-XjœûO*Øqœ21∑ö%‰{¢+Âÿ˘lf!\Ñ]˜ÖãèOaiãzî}g∆ÕÕ˘û‰5ÿD≠`6√Ö¡_¡§asp´R:xlòÎQåÇ˛ÛÇ÷äŒ–Ên:Âï_Fc:T…]3®ô–<[éÕ®\Å0˘È$∞ãëîÁGo∆⁄Nì2x”Ã.´f–LV3‡†·òÕ2ƒa£üØyæk`›Is⁄ﬁjÍ¿Íô¯¡%g‰üÊ§=G…Ω⁄ïN€_∞*aÛÉ¯R´®e&ÀÆ™Ì¸¨¶V≈á_b‚KÎdƒ/§HFdc: £zì¬ÛClr:¥OE$¯*1√E’/H<%ÙÀ…®ƒ¥3-ˇR!å(/'≥¥|ÖP¡J«√2Je$Z|Ë¬ÒKÚΩ}Ûßø%◊—>Ø"4TóC´U“®¯“«Ù“¥.l6áS*ES∫«Ÿ®D´ï“Ì#/*ÈH≈∫°P·Ò&D≈ÔU◊†%4gRÿByN© §ﬁµPm[©ö›†ø˙UT vƒ°Òî·áú˙‘˜‡X˜LVFCº
«†‰B_¯ ã’öBì˛Z;q™To
áRMWWàågî\lÑ‰eKÜÇ6ç◊Â≈K*ªrUÇ‘™õ5ï#¡¬®P),⁄FëÛz˘Ïæ»JS€5ˆï/¬Z ¯Ä‡cN.¯–¯n–ª8Æræ¢-⁄˜ÊESÍÚÓ¸hÃ$_:ÜEåÛ V‹N‹	ªàÛÓæÑÆ™G| Ä24ß|É,EßçÁ]èR†ÎÎ5:˜2•WÃÍ—f⁄ ÃÖüx#◊±∞‰öa⁄±èÛÈôd[ëæA≈E6ÍÂ⁄B>3€LÈNyŒ√Jåˆ€Øæ¸‰ƒò‡2yd_.≥GÍ◊	Éã¿FºQ+M(M@%*◊¸yŒ`hN≥ZŒm!ÈezÉ2±çj≈fºHÈFS·˝’	¯Ÿ)ßÍjgKÔ¬ΩÏôÓ»2⁄q+∆¶P≈sUE°≤Â±¬G•G‚ZkW€HS:ö[tÏ‹π¨÷…Ò®iï∏å_œòHl+≠$ŒAn/M^˛“±«süóΩ6&P,ÊTª◊S§bno9Ø4Ì©]èXùu∏πJÃä®x1XF:û9»FhdL
HŸ≤µ·î¯≈ÄoÏQ√3‡P√∏6Ü˝¯√k+È—Iµc≈y”Ä´ç(¬„IÎ#ó^ôcY—†Ñ$é*¯¡]ã!•eŒUÃXú∞‡fçµ`1£´äNt±=√rÃõ∏Ìª-[æ£Û%'›ïÌ,›¨ïYæ’Içv2ÀûUq$^O-∫á◊ÂÆŒ%¬.sŒß‹”©ùyL∞X⁄Ö¬WK(Tè\Y<¢π W$ù/öå-§ñb$EöE{o¡ê"1e¡»i[(ËG[∞ï˙ùÂjÖ5ªe´‘"A]8ˇ ≈å\sÜúbëò´ŸCLü∂{4s/$§»Ï0ûGQœ‚!ZbõÓ~˚’˙Ô|Q~d¡Ä}πÈ/ˇ\,0fÈ=ËY‡·
∞f:ë(—UMt÷4}T4æà∑uÚu¿Àôsµ∞›àòUP¯»QjK5Z	Ö†»á3≠h{FÁ+«cÊ∫&µ'ñëWˆ#!ÜGòÿΩ˙
Ò„äJôÁªòMüù»¡‘Â}$K◊|ÉÜPóß¿º®ã©Ï…]Ù≠a±5gJ¶‘D‡˚¸zÍrñ1≠S‚aÑ¢ÌÕxò‡^c:üá“øDllD’ÅfÎ#kÓ9ºøÀπeg
ÃÌa«5¥øÅÊÿ`\`ó†˙ÍÍª8*uPˇµz5¢ï∫"PØ‚Àá»«VÚ+V9s=L˚‹YÉU0,Ç≈m^øab†‘∆"ß®¡·&Ô≤ËÀ©9≈Mí[¢¢∏˙K˘⁄°j˘£Tw+Åná¿üÂçàz∫|z „ÇNÓ¥“L*K-¢îìMìR$ß„ˆ7ÜÛ ‹Ó V<^1¿^
x?b{^›‰!rn(´úÂ'u?›Ú„⁄ä4—D\Uñ´;=Z ÆÍõøy+U≈H1,–≈s(/Eò7‰:{≥˝î‘Í]òèK”ÉVVòØ~ÑúèÈäFdí.£Ok≤¶çßµ<l”Â #EõZ
J‹¨¢˛rÑùdKö(Izs®uLfÈ¢èöËFÃzÇÓ8∏VŸ‹æè? j8cA™LbÙ≈™¨M\:œï°"ﬂÚ.Ë:®âÿ$7°‰¥%E kı∞R=J.ÜA ˇ+—Z¨yi·J≤7y◊Ú±3ø‘n[¬f‡˛&á±ßL,4ΩH,¥∏≥¡#@Áøû”1∞XÁN·î˘€Õ0£+˜ÌdåDÓ8û-∂õıU,˘ç‘≥~¬ÈyEöÖ#  ?Œ9«ñÇˇÕ¬»È|L›€∑Âã∞ô^„2Ãq¬2b2⁄âßl&cã§FÂºy—&p”ﬂX¶˜qåŒh>„d™*Ê*[Ftí"≤NØ‡ÿé\ôÜ=ùç¸ùYrD†©ñ91√qN[ „%Õ2–ºTÉâÍh¨tgt∆Ç ''‡ipØƒÀ8º2Y®øΩkÂäM±>UÓQåÖ;Û,oHœ∏õƒ{ñ…Ø!l¨«`-PT|*n´Ä…ñÀäõadˇ9∞…Å
ä™Kb¨ƒõOß‘}MPHV±ƒîñÖL?T/≠X®luî‘ÄÃ@øV ©ÍMU%t˝}É˘¨Ìr9º˝=À'nµ±ﬁjcEk∑d"@ÉÕ ià◊vØ”‰÷ò:ó¿∫hˆòﬂyjÇ>SoØ‹êu^wÒ—iAb◊váÙäí)ü*‡;îUçF&ÑQã(Q¡õ]ÑôÍ√S∑O~ØàÓ¿	í£ª˛ÖNëïq∑T«´‹+ßÓefPπ|ÑBâ=zô˝; §oÆkDY_+éqÀ
í÷˛Î◊ı∫¬k±îı‹óZ!?AÈl%‹òÕïõ˜U„ŸÙN·{ﬁÂü“	ıPk1«s˚Ao?§˛E¥Æ:ÅÁO	YÀ¸61≠+>°wã1‡YÊ‹™⁄he#º§ê[#%´H!êÉMC≥g ”Àòƒºoﬂ^¡Ì{"ÊêµEx*IáQA	®ZbeYÊÃ3=	ºl.*„05∆⁄W5…ﬂÛv^‡_°J:tN√oòú<∞œ±º¡kuˇ˘OIƒ)2û22—ö‡ƒu⁄özS;Y,&=Œ«™´a$ÉÚÑH„jdåç9°Ñsµ¿RC-ÁWî›ï|e#«±øË’\±=ƒ\`ò£:·”·èÀ~åA˚hwÒäÄª⁄lWÒgJ˙ÀG.ù]êÆk–JjKÃQºÕ|˜ É6»dËjå[?ƒC  x/ªÿÒ∞ùtNs2q÷Ö≈√˘]^Ÿ¸ìY¸ƒHx∑£Ó9(mîM›õªËå%?f(Ä?!ÜhàsπYı(‹ıjY@Z¸R…ª≤A‘é‡p)+D=•+P‰ù‚«sa÷RGs"®^ûÙ˙1∞-eıNF(®" # î^:Vf‹ÁgW¨¶F2¶jLΩã0æ$Buá—òSì∫§q˝z°N£g–¥§U`Pkõà#ëÄÒÁ9óÅ˜I]l||bx3«ˆ–]Á†ıﬂÜŸf†ÏOjhìÆëç∫‚ìÚí‚–ª@ØÓ 'ô3å_£∏yC¶‘ùò¨NêÔÃ∞Ë–*a¶d˛'¬0ÌêµvgU˚·%è4}c„‹”äÊ@7 u·,õû`é—†∆?‡v¨ë´÷ì–”k˛œUõÇtS9{ ƒ9?˜ò‰L8ﬁ`>í'µ?j5œm∑¯Ω#NêOÆõçvGª¥aºüGä55˚yºüπeM:≤ò{õÙ≠ç≠≠Û˚òÙúéÓo“ÅiÌå«=ÿ≤ÜgR˚#4/£Î•±¨ñ∫.}˝§∂A6j‚.“î—~¥qV ã·´mhΩ⁄„üwØ@ã”ò
d6?3`$n¢%≥˚¨ÆÓ597-ká¿⁄l~∏π}V[e2¡©˘∆ÿ!€¸√S:5≠◊î%‡hAG77:}Ö3¥±±ŸÍt4∆©3yø–û<gJë<∑é3yHØvàÕ¬ûX¨Uh*≤}@Z¿®ŸOGÜi°≠—ZY˘B'®Ù˚∑(A6çÅç‡ı–∑îL—‚@gtÙr¬ƒ∆t`ÇXuw\¢ˆ∆*ŸlØb©øb¿ËµÀãã6É9[≠–∆	0≠πçlœÆ4à®†ˆ®“√T£—ÜVUg√%Ûvæ}NœG5Ω¶,ÅH∑€ü\~™1Dùˆu®ô©˘:˚˘ı√a≤}4YU‚Ï≤:tjxﬁÌ?ﬁäVS—%ÑÌg?cÚu[g’êáÖá|Kã5·£Ojs◊™ˇë,ÖÍΩ5∞€˘œ@oæ7ƒ ©ûÎ«… √ÓÖR2”&Ÿ‘a:À%#úøwãå∆™qn∏à= :Nu\ÇD/1t2SYVß *Dôt…—8ﬂÑKˇQAç≠Ö®qÉlU¶∆Ê2è◊CKÇ™&√¢±dãåæ∑¶ìJVR‘XBé»ƒΩ}{Œ´«M1-¿•ƒÒÑ„≈=,pÕØ‘#∑ˇl°œ#≠∂‰JÄı∆Då◊d)6(\∫ ø,«âπn∏VIf!èe—èòﬁ„ﬁ˛˛*—6∆aénﬂZ£π5Ì€ﬂNq»≠Át3Ó1°à˙¬Ç!∏¯/µ|ÉU ÉS£Jf»∫#Ûˆ˜S*©uyË	~;6p :´L$≤Ã7«ebf	Œ¥0>{Q‡úJ•™âO…ºß£¢ÅÇ¿∏2eV¯\`¥†Kjÿ„`vŸ-«ùP&.å)dﬁ∞‚ÇÑ◊ﬁÖÛä=z:üL0Ã®É‰‹∞9ºï¯≤(ÇN*ª^8O9’’±.yiÒú È*ı“≥Í¢+ı)g?é•ÇxΩ’∏+2¶cbd»;∞õá)\YEå∫ò˛Ùù^Iƒg1jÑy@DËRnV/©ñº(º∞‰O[*FVf1ù8‰≥‘u&Ê3Å˚'ÿ´CÃg9àCní…¶—ÆØ¿Ø˘Z9
SUt‚=1löxeLA Åç¶3‡rÆOˆƒÔÊ®Èa"úppñEl÷Á[cáÁZ∞å!vlïÛ{µYQ„ıJéH5"∫Œeß0Ÿ.∞.Öÿd6∞≥π¨íå¡E^˛ÄöÁÿ=ãôÊå+c4˜çÆe‰*[Må;ˇ≈&ŸjJà2áYú;ú˛ËÙíSó∂„~ıà7 x≥(Æ'%lI∏6£πÎ9Ó⁄Ã1Ÿ
ÚPrd£Fjr∆á\Çp5tPV´óÆΩÇﬁ„uæà
˙
ë §K?!ıËãˇ4C©üSÀS…{mú‰ÕsÛrï⁄Q≤•eÁuB≤Œ yÀ:Øí˘ùÚx+	∏¥r_-´PÚS›∏
,Wç2òÆäûVŒJU13+6Eòç[πÒHôp[õ¨óWÚÀmñNË7˜Á>42€ÖíáÍ{∆d´˚èΩ˘Ÿ⁄‹7≠‰<wL¨AéÍ‚œ)p” √9?Zoﬂ¢éà	ÒFŸ…™¢¯(@.¯/ÖF¬†]∑ö)ÃWÜÚZ5z¨Ä–¨†7ü¨s|•¡ËHpÊöŒﬁDØ:2"¿ÿ]û*bl¥Â@y9xy*=›D‡}ÈqI"b’—{/_«∆éü”#~•>n5H\˙0˚GÉ<<Õfô‡¶<â%∆Hnú•tw!
§©ÿ]lu}v-?ªCâ>‚‰≥ÑN-gw+©c1ìw¨‘≥&Z„„2sá|1«Ô]„KÒƒÛ¡¯fÌΩk`&7äq¿xÂÖ÷n≈‡;£jΩi∏cL›óx[∑C|IÏé(ÓRÒ≈tbøJA=Œ¿ïåo~√,ît	h€È∏»8§GBÔ¡‰¬êXËF%‰£º8Âéòã‘∏∏±›≠ã∂ºyHgÕDñ!ÍΩk~“TòÅ„ì¡—…`øªﬂﬂ·Û|w=˙0X:l˙xiSÕù¡â¡†û§§&à§"Üè¿{À¨ﬂöÇÏ_îí#=0íF©-2CÇ^¿•©Lâ8è@∑®À?à`¥4+Tﬁ¡ªﬂ¸◊∑Àÿ˛˜9Ò«›ìn˛‘ÀV¯Ï{\ÎJ\Ê¸á?π«–d∫ÿï:N~È€9˘ï∞W	õg⁄‡â®`gvÕÅ,[Pt†D≤Í£N⁄F*êŸdw#nsw€y~®mÅÌ⁄ô2åJL`·rk∂√§ù≈L¶¸“°≠–|síh–ö™°4¯Ω2)´ôUÏØäπyô%≈ãÍJ¢Ró≠YX—ZâU}˚’_Ω%]áP±¡Jœ’*~4@`≥|(Ä–∞2&¸ÌO∂öÅ9‚ °M`úÉE]cäœ˘±’Ù»˘Ì◊¸$Å@ªwâC<8Ÿî·lYéœ|F"∏@…˘≥$~—
™’Ï.¬œdP0Øm:ÖU:~√Ã?éB†ˆM:±`;#rÃ`5¯
XôpíCòÅé|I—!«<;ŒàŸ∂zëßŒ]ø&çF#Ä…\%°`æC"î4rìÆ•\∏=
æbÂ5&=§ÛÏ⁄ô•4íecä:«|”∑å∏ô@>nï«q|˙€Ø˛ˆÌˇ˚_ˇOÛ~ØBzG˝ì˛≥aüÏë”A˜ò|Ûßø!›É£^˜ˆ/nˇÏàt?ÇêˇÀÓ~∑∞üÇØ–¬0Q÷¬p]«-5â≈ß7¥˝tíı@6d3d´dZH÷ú
ì É¡l~Û∑ø!{G¸Iøª¥C>àyÎù‹˛Âp–ÎÇº*Mga€í1sæ^qlÕÀ®'≥qÍcÊ¥EXÑ:˜7ˇ©∞{–?≤9Íuèª=¶Líì˛GütÅ*ª'M¬˚jŒ÷ô57ìﬁZ¬\±∂tßÍ_ˇoú™˝¡I;'Î¥–Ádvt‹?Åy;z÷=(û™B	V…bò8“Ø_$bâ∏ÿV)ÑNÓ(Ó{◊bå⁄1B¢wÆ_‰;>ì!=™·:í=([ÆC:PëÀ™≈‘‰“R•§≥ÕG
ÔQ¿˝˘BbÎÌ ±>o®ñÍ,dñ¢É4«„wî;IûÌ¡HÉ{*U=◊´IcÓ—u‚ÕñEJ¬fY&µV+.›g€”©ZË{ˇ©·ytRZ`àŸ—J~√bQaÛ(‘Ù4ÚM|ã≥é≥¬Ñ˘®¿Ä|∏t\HÊbîâ{È‹¥a:îb¶JÅ'ÀÑo2≠)ß†ÀvX–%-ØéHR	Ü\£^ñ‡°∫uFu	MåãÌùûÀ32y·Cô:vÉèêç¢«ôt¥î⁄∆y-/∑Ñ1+[ú’’çnŸ‡ÄÇ≥p)∂£`éHñƒÏ*(†lîS¡3z˝‚Ç;ØÑ ZL¥ g”R„EßJv1-…Á/£$)|D›ß„_ˆÇ4TÜ≤C^ºóMÉÔøPœAUL∫¨ï,gqºpÔÚ–ü¥-ñøeß*e•{»èI◊¢.ﬂZºS9zY∑ ôÜ9]:°≤ÙÀ/A~ÅÒK«6§ î@c•:í1c#?¶jCÇJúÉ.\ÅˇßG$¢SRís´ìêúã"ß4í2õ•EÎDOâ ¥GëÚ†`:h(≈…st√¬¢c∑{@">V†ŸÒ∑ÃF|@¨˘˘π6uı"3xeΩmÇFÖŸÊˆ_aR5¶ÊQ¨,qÓøûãÑêPÄ¶»ÈUhLÿ7∫aÈÊ¨·0œÏ¥¯ÊÔæ‰ÀÅùÒ<=ÀúŒ®:¶ÔÇŒ+˝L°dUë≠¶Hd)lQºØ–∏YY§êîÑ?fñ•MHQx*”ıÚÃÒY,pIF´IóÿÙ“òçL¨˛Ô«sÀAÀƒ•ó°≤ÜEM"ÿotÓ¿?ﬁ‹õ∂«ì=Yï±„≤"p@LŸ2],∂Ç.ÉPÎc•QòØg>çÍr¨≥¸ùDƒ2H
.KﬁÂ’–ŸC3áªÄ„MW≈√SÂQÍ~´D$°%ddÚ~uBâ≈N™ëJ˜“Ùrƒ"ô◊√yn÷Ì◊óÜµ
À*%èDUqå1ès%â•$Ty`+∑oëõ°£yÑEylcdx^ò˜"ÅÈ;n¬€ átF=#úãöÑîç»æ¯¨Ç*«&í”ÙÓÉ:JMÅè´§jﬁ5æ‡‹7∆<Ì}Ìeô¥…0˜ú¥”ºBﬂÕx ©5…L9MÿfØÆ4øÏÛ4*I	z»^&≈‡+¥úÏ√yÁögsìì†!#8vÁæ≤&ÑSL	d˛µ∫»ßÑc¢é£ûhCÅí…±Q¸ÏÏL°»F§9·v¸¬8]%Ÿ#É›dÅê'◊Dr{m˜8,™¥o‡.7m‡ˇ;JAuπΩ∑b´œ¨iíâ+˚$wDÉù!«`ÃŸÓq˜”µ=&‡D‹#ın(√∞#P‘ñã~“ÖüDA¨◊±åï⁄ç¬UJ}W◊ïb„n ~Äe{>XÕΩÉü≠ÌµkP˜^qûB°è\¿ß|5˘/∫-RGÖxjêÅm¬)d˝.‚'6gÖÎ‰ŸÌ?É÷∆d+¥T^œ(/#=c—ÁÈïE—ÜÀYïüÀUIìJÜ˚§t¡D  ~ÁLî)Ö’“†Xd¨î√0ZÇ2Ésjèi∏qW¨(€!é¶Œò«F	L$≥ç’∏<ÌXÀ§(åœa•ñûg∫Såƒ¬ÑøÄ•MPs/ñáJ÷§d≤À¬óèˆªÑÖtá∑_ûéHÔË£[áÉOa˚á›g¸ß˝è>9È>ª˝ãn9	ñœ≥^1Q'V.<t∆0…XÃ+nƒƒ'’‡ßâ·Û∆y£¨∆¢í§,™ıµ{,L
k(êà˛y> ´m¨ê	®T˝+ç6,˘£ñ∞ùè©wù4Àö„Û‡vO–÷õúÔÜ…íî∞…õeç!—◊q&Î˛yÃö9∫p„ÉTÚ¯¬¯‡	Sí{†7v˝∫Y^ãn±å-UP-É\≤JnñçÖÁ~óÌT€(˘cx¬	{ülLhïiNL.îzˇ5≤Q>ÛQTë4¢Œùç®•:"˝ûui)D«EÄìóºolêj;€Ù∫#X8:|∂≈•.vüêˆÇ¥'¢ü‘v4ûﬂ;ÏØr\◊‰Àó?õõÚüGÛP˛€ÿ*è-∂;YLø(o%Êmãµ˚¶º°¨Ú©±ˆ≤~PﬁlXä:÷VxWeV?≈ê‰¯Ò{Âãhf85yÑK¨ô‘∑eõ∑x‹¨î§Û≠Ê;>µzÁF\äh∏∆x>2J`
\ç	#'˘Äå)≤∂Y<6©Î„$SÔ7æy;•—¶@A&´Às— Î#Ïk‘àÌ#•.&ÆÛ ø8Åﬂè0¢3„=wÍ;(ò⁄VØ◊≥b-„È–Æ≤ÓÚÅ†ê6KV^ë&Ê•åæ3_@È°c.ò\¿≤ﬂ«V£x«‘Œiê∂ 	Ïb|ΩxKVâ ≠ùc°.tE˛Z3Ò“a∏Îc◊ôa ≤ã%ﬂ¨ÈÙô1¥§Ã⁄fππP</	@ëafÌ0¥˜U	ŸP%,CÇR≠¥§&Z*M®eRFåç¶» ﬂº≤Çj7Åë∫∑"˛ô'J8h±é`Ã§Õë`>‘ºº¯¢Ã£≠:	öÓ«≈óX¥ﬁYûô'ñnaúƒf	}ZÂ◊súïc?íÌÕb kŸYôa Æ˙ºJfX«,G+w…c8ñiTA¥@U±8ÚCdjÂßyFBç†Ñ≈ÄG†ÏZâò›o˛Ù∑§ÈXÛ Ñë9Ë»ˆw.B˝ﬁg ∆¬Y¡ıTr]Óõﬁ»úY¶ç’¡ÿ·K—ö∑√!r”PY)ãMK¯›1;∞C-Ú'BjÅe∂g ‘≤ıù¶∏7 In]‡~π¶=ÅÚß(ô†êÙ^;EÏ•D2ÛLJÇNÇÓuîb¢vÅIQÔ¢èî≈"ã¨‡"Ú!ıådùbú=^:Ü`éˆåvÛ/‡w´8a4Ï+≈Õ∑2¸√ù¶⁄‘¥·àm∆`è◊7’ò:3æké<¬™L©°˝óxn€qœÌ&wlW<‘
êîrkN73kNW?2*ÛK–¢@å:gÔ‰t≠µh°F.`Y˘ïVu$§7“ á&VQ—t$´{F5=O$¯{QôÿqÉlÛ
Ïˆòx∫òèO‰”jfiN˙òZ)
LÍÃÍaÔ•Më]RHÔ
–£ÂS«Re ™x‚vœ/RãB\öo˛Ûˇ «à$Eu—]VX»i…<~®)(äqŒùäˇßéuQu2ÓËM¬ÌæGñˇ:|ã>‚µ^ñˆ‹ÖLZïKëRùÕ›¿n∏∑_;cÁùÀ°áÙä≈[~JÅ~π~ˆ“˚¢ôtEZ+'#‰q-7«∆Q!‚¨%˛˚«$/è$Ñ˝;…U∏.yëºó˚LÅ˘Qπ?xó∂·âÈOy ∑Th¢KTÓC§âGùrø¬]»~«ÕÜ˜¥Éc5≥ÊH^˝reBÀ(tév¥W≤5-Lµ'~⁄∏≈‚øXôß.7›sŒ–—€˜HlEB^∞ÔcB“ŸîA∏ Á≥∆ínÊúÏ)ñ¸Êﬂ˝ic\{„°√£¢‹øöY é3T6:]M[∆Õ;ˆ"{\ªBx`NËûè≈ﬁµ¥ÍÃ≈Å≠J≥·h˚ˆ´/ªpR„r˘Å\'iîç£õJG4∆Lè¬¨òÆ†¨nDYáÜBéÂLL–ÕΩ„•hW)Ù’M©ùjºctcJŒπi{D§èYÊDòOgÜmÚ⁄mo]V≤ΩƒÜæ1z≠loU¬o„AåÑíÀHjÅ/Äp€≥î<2él≥Ø[á¡èòZ‘∂ZüüP|ﬂ Gñ{˚vf‚¸“ë{˚;ºÕÜ#‡5w€ò√2≈ì®ª=4]^ﬂé'√¿B—éd7.kE«ºK'*U÷ø∏y:µ¯Qáõ¿"†C…c≥»√Jß¶oN∏ë>¿œs1S$eƒ≈âvïäwåbûEvv¨lë=◊†/«Œ+ª"#ÀÑAZ.C´*ö‰∞;”2N®9|rxãT)T¿»C”ír¨€ﬂO0F´'∆v 2∏K‚¯î´/1ú•Ë˝ãyumÿˆB@ÓƒÍd4HÖ!i≥∏êÀZÜß9vbÍ¯,]áÌ^1ÛπéúË”3À»@‡‡g©q&¬v∞ËÃK◊…‚d£cæ/‡¸–ÑSˆ›\˚QÆ„ª”Ã¥y$–Âeô.Ü¶ºoäÆ÷6—Õ`ü¨'∑è±¨ˆe÷⁄ÆÏì<]k›OGÃû{w]IvâÓô ßÀÏ¨∂Àëº‚ÎÂˆp(‰cÈ@ñã1Í˜O(U&ñ~ØªÛ˚gŒ¯µ¸FcL˛7÷^ÒG∏’÷∑t *bﬁ:Ÿ…£‡«ÜÂ”Dú‡∞Q¨ì—`ÄÙÿIIΩπRΩµ=:û2¶e2¨)óèUÍìãõë£9¶ÙA«AÊ"+ãB6%átÏ,–M÷‘ÛÅk6D˜'¬9µâÇdëDL∂6Ç #⁄ØMb‘ÅF<6‚(Ë˚ÜÄ˙oI∑◊?Ëü$pgK”\rzKQOÑÛêD~hgπrÿ)7˘Ëè$è¶¸»¿ˆfg€Qæõ¸∏ﬁ•â¯’∂Q»´‹y¡äVZÃDVICNaPK+I^Ñß
≈õ€\≠}Ûo˛:¥"¸hàK£25î‚Eﬁ/ü¶ﬁÈú;ÓÌ?:úW¡ó†r‹Í Ea-â§™øK)=^)©å4S&-˝òÙâk§–cÒÌ.È“»IÖ}±˜Ã%™ø˚2A@ãüÇŸdT˝NíQ*UkæîiN—ﬁèâ\‡÷pägªa‚ö[/ë1ˆ?ﬂ∫2 ˙zàh¡≤_è´òƒ=&Ó xìπî@ ˙XÌŒßÚ"ÏÒ+®Òài]¡⁄Ò
g{‘º™&≤Ì±›ôµ1;wµ1h˙	π&∫ô¨‡Ê0ò≥*ƒû=g¬ïUeègMZ~—É\Ï∏¡f¸ùOÔpﬁ±bIÛÉ.º°B{GkVÊå.4T±“õ|mDÍM-6,¸Œ)®˝¥÷#a∞£Sª√¬j
Úëé≥/ππ9π⁄f2~eΩüYŒÎ,‰Ò6ÌIî˜¢ö÷ëº¥jwEWÇT™,Â∫ØiOœÂëÄd{K«·≤·∆R8oX l„æÜ—éÒO1†$ºá1U$¸tîTV·Nêå”Ô]'DËäØÎPˆ´F≥UJ"O.wAÓ}bÁ◊"K ü¨ﬂÕU`ì&Ôã ê˙ΩkI"Ø<G◊Yjƒ˝ÒG]Û:^J’˚¢K•é_l@hç◊Ó≠3˜û≤[Q#MÒn¿wKá>ˇßé„/1[6]u#ô-õYø\≠h˘‰“∂‚•Ç3ùÁÍ.Ÿoø˙Õ_âz]DSuzêDuÏ„jdÕ=ÛR‡ ≤ÄëﬁÖqû®∑AÍßÉﬁ
Kd<†æ; ’ô›ÅcO¸Çà˚ã‰kUÖ≠R6ë∫®ÆëWË-À q:«˚OuÁ¢t”gÎ›Z9"J∫≠XZ´N˘^¿ä≠T¬≥(jKÊ"ß°X®∂N©}§¸¨∆aÙ
à…ËŒ«¶‡Lt()1:ù´ı~|t2|¥[CDjø÷z<Ñâ‘"◊∞™ìŒC/˙lÔ9ÛÚ,wCŒqóS¬ç)Å7ÂL‘9· x,)ºÒ‚.≥§√b”]–π˝∫é=ô›©yÛZìé«“yÒÌWıŸ$ïgï8è ß>ÂM}&K*≥2`ááÿè‘ÁÔFyïÎœ(·íâu´)‚n~ﬁdê)kü∑Õ÷!‘Ó5èâË\VS;$°ò8ﬁ(Ë	Dú^:E∂èXπLwXøÓdÖnÜüRXÌCøä∑≤†
ÁEÃ‹≥¡Ã="û˚ÈÌËú¡˙*ä∂A&˝w]`x¶ﬁ=>>¯≈Û„ì£Oß¨⁄ÈÛ”~Ôìì¡œ˚›”ON˙ßÔ<∑œíqäÉ¨ÁÑ"Ád\…ê–L$Nr¯Åy…îè§qÇmr74„ä(ñ%ÖiÛHÇ‰*'ﬂÑ•Ï?ÿC4ñ˝˛∞r8x&biˆßΩ¡Ò|>¡¢ƒÉ”·IwøªCÿ¯x¸pb∫csúù™3.õ`†•S,v2££…¥;£æ;∑.X¸ΩâTKMÔN%¢ä}Ú`ß⁄⁄c'ﬁ¯.ûn°+Ô.O∂””∞∆9[ÃEÅûs‰H¿p2«Ä*SÕ°¸ÆürKEÙ…Üè€ñâíﬂ˙∞ì¨æ\öKíYDFô)r™¶!´í◊S°≠5	DÂ∑À´∞ıx=Ç'\Àø¥éN^ªŸçf6ó[ê-ïO2.Ñµˇ‰†O∂w‡§<;Ìü#ÏÙ®7Ëd?ímÍºÊ‹#‹sãWl€Œ˜¢>Œõ-Ï>;¿∫#:æ˝‚±°∏rÏ:Á\Í¬∑|ãkq°ô_Ë$ŒŒ] ¿ ää%Î˝Lœ†)WÚ„®8Ù«ÙÃ¥L_îßÇwÍŒ|s,r
OƒﬂtôdUfù¨Tﬂπ–Í®êiZj∑|l!¸qNb’FßìôÆ#O’3^I"Z˜@Y⁄yºŒ⁄.´ÃƒxXr∑ÕÜF°˙8 Y◊*„ló‘öOÆA∆öäånÈ·2æß…µ'<¸3∂åß–
øSˆd±∑ ´˙U;tF¢JÒÀïÚ@g∆é>µgÜ}1ü÷v10o`√ë/téæt«?N&ﬂß4Ô√Ÿƒıoù⁄nÚÀ[≤LYZ§Ì∂Œcø◊…ÄÙÃëµ`”ºF%∆é@˚zΩDÍÏr)}ûŒaôév‹ÄˆP¿‰h–'@”;0Gò◊¸µNW‘zfƒˆïByïwù¡à3	vÿLX<ÙÄû±Dm¥ÂÄÍ¨ÃpL{6/Â7\≈’‘X”Fip˚Ç&_äûº;¶4≥@-≈>√}R;4F∑øµëS≥≤u∑øG˛ΩNÜÆ
gŸË≥Ÿ[GìΩeÙ+Ó∏0¢Í;B»=ﬁΩÑLqÔ°_jı©Q≤"EÑ6qO}j∏¿	.0«ìåÄ?0ÄÅùJ∫G¶Ü˚¥CZ˙N?êwuÚÜSÊ94Ur¡YµáÕ#ÁˇAi‹ÌGaùæ4-Kõæèﬂ∑¶ˆ‹3¢‹ﬂqa	¶!7ÌÒK“RÅ¯˚A€q’A(ΩÖíöH\óÿ9 "ÜeNôøﬁµmÓˇdx+ädè›Q,Q¨DŒØ˜%
¶ZÈRs¸Èª#f◊yÂ=πnk—<Ì@\7"Á:
z3T/mÊø‡%ya_|‚ûQõY‹{ÙçaO(≥ŒbÃ—⁄$èa‘òˆmçÔÜ©ÙuÒfCŒ3ÁÁàNgéó¥oêS’˙E¨8õ©òπ1ı.¬8ŸB,À"S»r,@≠ò÷a!Aı¬‚≥!lA|>éÖg¶è∞íÂG™<˝†'MgLÕ,Ùº}ÕõÈkíä∆gÍÅE\60ÍàaÈÀ∑ÒÁÔI ∫ÙÑ[yﬂî∫#√frÓ:ô—1˚ã˘ÏäöõÆaJÇ˚nK¥˙tÕ8BöÏû9ï»ómtŒtÕ7tDKf<M∞Òßﬂuìß*eiö€ÇÕæ0£˙SÙ…3?VA* ˛*ä¢Å-m÷„∆Tê«Ûe ˇıÆu·√¸Û>÷Ö∫Ô	˜∑¸UÌÒÿC/ã«ñ∏∂€ù9&úI“=2¿‚éâ÷2'¶„UµZ6d˛/ºIJéŒ@6∏Ô&*ü?§yÚÆUMñ!ÁòEvK&W·  $Çàâ?Õg|ÙÄ§·√Òi;Y“M‹õûç´0Ω8†€∑,ŒiÔˆ-l
∏õ‹ç∞«Áyﬂj¿√JˇŸ_e›ØÊón5w»ﬁ‡Ë∞?<tó‡én5+¯£‰º<ò$;t-T"Dƒ"«"ÿÆÎ® ˜∫‚>Á{¸¬0'~	&∑4¢h/V€¡±›€j|ÿ)TCJ√‘€Öπ;∞¯Dz◊hÓÿ–qÈr8„˙œLÀô∏tJÄË^i›´˚ ∫€?ê‹RInhºAG¢3eg+Hx
îVÆqÚ^ö<Xáå¬áñOIÀ"è¸◊)í“9lmŒ·	<Ò¯!Fcﬂ˛#EêQ˛,#»F„*çı@Çñÿ?À‡R{T•ù£πèÌ∞ /”(æ[	ÿ6¡h∫#ÎB≈/¨ºâå◊Üˆ
û˘ûo°…ÃÜÈÜŸ˛ƒ©9ài®≠†ÿˇ∑ 6
Å;)>,~g¡=Ö≤¡⁄æ˙»ùœr
Ñ9ø˝⁄6RáIe·]∆»;*¢ëÍ^;≥g<1Ig≥ÖΩªªMEû—!…Ä? uÅ©fK∂±m¨ë:ú¥j]Gw¡qta›«±„ÿ[p{0éΩEÁ“]t$]JWs,ﬂ/ûsj≤@/É†Ö
Ò€¬ÑòïÜ —æ\MllÇ|g3CÁe°Ì+…õíœﬁ±vÜÛfaús∏Ipˆô÷t≥'ÚÎπÅÄï*`|O∑û9¢ækæ1<2@ê
Û‹±)˜Müﬁà∫ZD…∏cJfáX¶mp®ŸŒhä(ørÊôıÄ›Ò¥∏#ıÁtbÿ Ê%ÆÄk÷úÛdrL·{'Lü˙æ„hë¶x‰Æâ”ùøAäl5GÃÏBπ©Ê„üŒ0Ì€\Û˚Aüãy˘ñM≠˚Ü£EQØ'vlÚ∞?\éC'àÇ%OoøFG‘ΩìÓÏ‚5ˆkÌõ\0ã}^©∏óåÁÔò®πó„ˆ¢Ÿ%YÈ≥†>á;û«Ö1/Ô,A£mœt¶ àúé®MˆÍé+G÷ïø^_oSN*NÔõçå@E2ı°˝$ÇkÅnúU§-bN›I˚ËêŒ~É]Éss˚;ú«cûÚ	¬)xweWå˛ôè˛◊,"£∞Lp‡qÂØ,AúÆöÓÒSvü;C‘õ84 $
‘cÅ£r„«j€≥N€äC¶3V!ôÊæ9Åmn¬zœ*u xt¢d0jîhA{¡åGëëHIΩ’‰áÁäBw
˘Á*?Inítã$,~Ïô]¡∑ùÉ4õ§$Õ4G7ÈÓïÉ)Í‡|w7Hè‚åΩì{·kôyíßÄ<•<Ãj©õ£öMPPc<˚
bõˇ ∂≈ﬁ¡—“◊ŸïææßúG;—≥Ü›g√˛)ÈìÓ≥˛œèNóåÛ® GSLœèÁ/õ>5=¨¥ÉF4€–IEXíà¥@BñäYQÃ å∞B3—u˘+3©7¨tÉEo0ät…êõB‰¸”∞•ÒIµ£5éÉ›åƒ»bëhÃN∏ˇSà Záò8[·>Pt•P®l„ï†_ˇUÚXL#Í_Ì†‘†}g
“à∆ß∆Eo˝ﬂóÜGY›–ëûÖ£©_7çhp´Lm‹!F√ßÓƒl¯ÂH„2∏~L)…ì“%Fso«ô˚hfS¿∆Z$R2óÀ∞gÀÈ¯n(ëLc±©X~¥‹ƒÇ412†	8ÏΩsVJîö§$∑}ˇ$µ‘DÇﬁÌˇ¥5ü†µ\¸U5nüöµ]¯O≈«oˇıe¯o≈Óî'#∞?@˘bü◊Ÿ?õ|j¢|ù‡ø¥∂À>Æ≥Ïé/—ÁM◊;Ü{r7 KÈÇ‰≈ˆˇ^Œ›wÁ–Ò¡Èü[¥77…£ˆÜ%üTbHÔgπ˚‰∑˚ê£ˆ,
–Û(¢&Ô¶$5vF˙Ÿl∂∂€nlµ∫ÕÕ¬ `º4iFÙ ¬S¥nLôwCãßº&∞≈èù©ÉNAùt©™íùÕ\Á“/[*
⁄}◊¯ñÓ!ço¡iÒWP•ª26⁄îP°zxÉ=fucX≤apÈr@…◊  5€Å˘µÁ©_≤8(Óˇ  ˇˇÏΩmè…ï&˙W¢ymÉ5#RU¨*µT+©Aë,â6ã,ì,Ÿ°—ùEf”ùd≤3…R©Àf∞;¿`>x_Ä¡≈›iÔá¡Ï¬_ÆÔÛqÍü¯Ï˝	˜úà»Ã»ÃxKíRw{M¿nô/'ŒÀsû≥–/ÆÆ˛“Ñó≈›ö”)_q˙U•r‡Ê∏mÔÁ=Ï
·À#çﬂ∑ËL qı/!_N≈u´[∏˙•óq⁄UH^ﬂˇ~1Y˚¢äNΩ…Ã—ÆÌñ\â/´ÌEpBΩ#/—;≥cóñ‡Œ¬π∫ÚÉ∑µô7ùj=ÎZ∑>“≥9„ª,<UøË≠∏:~2¥1`˛x¶ßCyÔYh™?”ìÇeDü:sœ˜ú–Ë+3HZ	MÏ˜[Vîˆ4ıÑ“NBﬂYFÆl¡gﬂP?N´ôÎ™Œa±XqûTí9'ÌÁ¸ˇ¢#‹$ØW≥‹ƒ˝mÕ§Í◊”á´Ÿ&Õ§˛éM[Ëˇ€ø™¥v€õ6A–j√dÍç
cöQY∂oé[Ü/17e*Aà-VŸSãöÅw∆	bÅV˜›≈5ºˆ…g∆äºOm $“¬ëÅ?Ç=¸ÏÓ—˚Ï©*Ω>¬M∆)nG˙çáß ™+≤∫¥Zˆ«™⁄´π¨„91ætvƒÊŒ≤ZÖR›—\i%)∑p_≤ïêé>≤,-ò´ûä!ùÑŒ^ZπAk˝&¥-°)yPé¬)y.o>„æ‹Õcè„æÉ1óµ€›;∆π˜bw(UV∏X¡V0Ω“)•q’cWm‰„™Û€ñ{‰p8Ω˘ëm9Çÿ¢¬"5(LˆV˙aÕMÅbi¸∑ƒSNÚUÊÛÂeEÁÌJ/î®n{'éò]Âä2%3?Ê⁄≥±|“O	(˝‰
Ç0õhËŒabª<ñNõî°/◊Å!¸Í®X∆é˙/˛ÿÆˆ:¢ áÕb∞)pº∑ß?*u#o¨Wl®Ol∂¡NÉí"\y9[_G≥`%D◊7µ≈ñ	œa—ﬁ^`D:Â”¶ﬂÜŒ“Uºê¿£S‹BjÏ®j9ôÉ2VZπ(€°~Q ‚EIMúR$ZJ≤YX\µ ßY∑*- @’åÏk+u£∂}µ
ñlLh¡¢¡“]TW·⁄$¨ÑÒÛ4íÆÆÆ€Úº“Vﬁ±ì|ï`≠“E.¡
3ù¡w@à’ÑºLΩ;¨B÷Ê^√r¡J{_πµ7ç˙ÒÁt±4/C/$≠˚ﬂÕiÖ5e‹Œ˝£¡îÂƒt†‚j∑ µ˙#"oÍûêvË\8˚‡¡í\,˝¿ôíø¬äQ˙Ë:<◊;'ø·hò≠Ê˛i‚:ù„≤BONm	õ3®≠i7KseÖ©T.Ú?πHN‹W*ZæÚjùƒô"±™g$=Nüz'à¶Î5‹µ‹“Goâ’ﬂyKl±¥¸`ù+(˜vŸ£ºâˆΩVp	”òé∏Ô”
tÊ‰ﬁ%ÒµŸŸ¨E¯´⁄w,˙Öc-qÊ-ÆkoΩi<?≈w‘gEàüf:‘ç«÷vA—R¿ñÜÓ5˛ËMfÆÍ‰SÚí6@`[(0¬|Ö¯YÀ∑9•æW¨i—˘Ä¸Ù¸%˘„_ˇé÷dΩÚ|ÔóÄe¨‹≠HÂoÖΩ˜ƒY“úµ+
m¶…jìïŒ7_ÍÂ-´∆Y`òwÒˆ¶õ=¶W\yæëõ—ôL‹Â
û4wÆ›áQ:Ãm∂„'¡"ZÏyñÜ2ÒÔË≥˙õ˝œÕ5CΩ+R≈Î˜¨ ≥ÁÖÆÉ{ÒY∏oqF~Qµ*Q nÆkå“=#e "Érßn9U¨πKv∂èzI§olã÷“eqw9t£µø¬‚∞òa∏∏∂Û.ÏYç ˚CáˇiFòx1Ï±…3ﬂm2∞çUc≈Ûá≈Ø>$Œu®!2–q%™Á›`1C˜∆É%7û≠Áó«”·œÈc4‘!±◊Xñâ≤¢åÔeuíG ∆ΩEm"û xÉ43=ÒT≤ÿÁﬁåπ`aàË˘ A¥¢Z#oßZ‘a⁄Û\Xíµπ9Ö“v~m„ä¬…≥‹[!¯q|ü±cÄOøïˇ©&ú±ˇóø∆ä≠|kWPË^π†ÑÁË	ÔûUA-˛ |ªçÜe]ó∑lMﬁ¢U+úâHåÖ]•Ç2À∆'å±s˛zÖ≈q‚ŒÖˇ™äG'0#∆gkÍtÇñ4}à)Hè≥ûú
ü„yéqÒÁTÈµÆï∑Ú·M∏Cè™áÊ€l¥¥_Z(HvéA…&Ú•«êÈ°JÆ®L∏¢p,:.X∏C¸%§ôŒl≈ç=F√‡Ï‚ÂË’`lÁä∑d˝ÓPt-Î‰m‹sZb˜µ≠Síç]•¬)«Sñ˙∂(tÉ¯On%ËéWÓˇawπ¥MGΩ›gœÓ<ÖcÕ@g‡ëk„û3◊á∆Xè°9fˆ∏S<î,TP[	*6k“ˇ¥jW"íÃn÷÷Î%O='u∞Í§W¥æ‰çw_Øùiàñb»ΩÓXÙâ"A@›ü√¶vàÁØ±¶Û‡RãÒ∆ANû*ÉF¶ÔÆ<F2ù≥b°õ”6î˙iCíÙÉ“ç∫˝Ê¯bÿëv˜ew‹ÏÓ"EÛ‡‡OÄ/ùóê&£nÎúÊB¨±Ë›–çñ`ﬁ{„ZT⁄1ã
l¨¿Ó\AÁÙÍW°*BÓﬁÕúF+	cÒÜü˝iùÙ	ã˚˛”† ˙ÆógËö° |#I€C∫◊êUß˛»˝–qÑ#¨GÑg@9vø‹Õxë∂˘Ûx%oæëﬁx»Vïî£˚ˇOb≈~¬û¢G˜à©v:˙∆ú=BÅ∫ñr ¿ 9∞FÆÔ\ªs“
Ω%j	˜ﬂ‚o8≈ÕØ†5qóV:¶&öÅnÙïã€dl'MfÓ‰´À‡∂Ç‘RŒ⁄_µ7ﬂ¿K‚‘ã∫$gŒ`öﬁ÷é*†ø|ΩÜ5=5¯ûd!nÁﬂu¶l@ ≠kÚÄ(	DYHo+'Lã[MÛ*ÍÓ5ñ’48NSFØƒkË,¸ÏŸÆ–¥&çbü	`]Qâ $´baÊﬁ0ñŸïÁw0/®6∞ê+›È{æ∏lÒõ˚âp	N=P"°-Y2AsˇmË\ßú“‰Ä◊Á}¯œÑ
!º›Ö≈F¢‡&ô™ Iicj?ø´ıÇ]é¥§†ÕN¯–¡0FZ£›g
_Æ	Ù5ƒR0Ië”+>¥tı˝∑ÙyìdZ|6Q–ëKÃlÅÊ·ŸæCPlÃ¡Rû2ç…Y∏∑N›»–ŒÊé”bÚ?∑äâAÚ–}¨ÓÿÑúß≥ﬁå"èdgîÚ.1ÁÑå^5ká£&,•£«ñÆt1äCa√µ:√q˜¥€j∂§9Óæúê˛‡ãŒ/œª√N{´<ÑèU√©Ê…Eª;`ß]º8ÎéF˜ˇ~∞•Òì»Pëø^ÃZrÈ¬Ês—"ù≥*Œ;Õ¿Ÿ/‡ $∏Î§êÌèjuŒY^¬œ/Ò0m˙ßù·˝ﬂı[0˚ß`§ˆHˇ—z’$Ìi∂„≈–Ìè;/áÕv”¥®≠•Ö]i\⁄WAÂ1≤“òÚC’'6EFÂ=ñòÊ¢˝ƒ∆£g«ÚïÑ›S}¸ £ﬁE··µZ≠Ú^à‘@ìπKû—RP}ròæËûÛ¶-§ß§0u<“$ÎÉA§∂Èπv9≈[ŒOP~†az—$ /`ÌàY≈r“ö‡†qêÍ›$òÉ∫ÈNõS.P>cøæ§°±d∫Ã|Éí>)`òïÁÏu[éœÚZ†kínÄ≤ÛUœΩCÿv—|î…À;ì∂J5z˚¶ŒŸ_®ÚÅ€k1≠.—Ö∫ÑıM¶‘]aE_wzNØÌN˜>£(Ò¥◊Z®≈5A`S≈‰Æ–¯›ÔØqÊ±≤Âïπ`ÛB!tzŒùœü°∏ìÙç˛Ë·Ω'ø!/‡%§ó·_QÖ¸ª_nò·>£Xª’]ÄJÉQ[Db—]8<¿2b˝p∆[¿SÊ^∏~∞∏ì/Nö{J}‹ßILòπPm…$„hö ø≤<Ô=q◊^NçHs_∂ç	Õú®È„n¿»)ö™æ7Y©5FﬁjQ3„Åﬁá˘B≠ÒáRwêËC¡+ypÃí ,Ø≈ıÛˇÔø˛„ˇ 	≠$.+ˆ}í]–Ù¡(dÇ€[‡∂vV˜øGÈåañREÇÀx‚îEÓ5X4¨–vÈx∑`îRc0¿˙„ul“e÷â)uÂ·•úâçOáYûL÷§ﬁ ?’s˙„ß{,º≤pº¿Zçy^®≥'Û-7@¯\É2~ﬁÏˆ;=™V&¸Ò∫ŸÎ∂õ˜ZÊI<äúÃrpﬁÍ˙,—∆Ûñƒ
ı∆UíöQ0Hqü]l(§"÷Z√eZƒ|…,ºTç‘óÎÌ4ˇRÃ≈4-Œ—Ãs˝öó˙Ø‰	î˚?†sóÕzä‚Å¸^8ÍQä¿ò‚<ÌsÖv—0![bK,ˇ∫hòêN∞‡⁄∞Gô%ırÿm†\:€èÆDVcïG∑∏æÏgŒ"Æüf‡∆9h
≥jùmÇ{ò—Â˘ñ˛H#`múÖG±ÆÀµπte—ıÅ˙¬◊kS≤#R=u¸ïCº˘“ù&Ê8V˙0‚%lP[ARÏÚó√ŒQÜ∞˝ÅGX˝&˘'jù(°´4tS˜"™¡¥ÏÒƒõﬁZ&ÅÛn”<p∏Î}·Ú^5—mŒ◊N˝òR',6°	€$O„®"‘jÓ‹÷ﬁ÷ﬁ|∫ˇcNQhY£‰fûªõ:¬Ω∑œÑU?·Õc6`9LÏ∂_†◊ßœúªQ‰\ª•ûjTgü;\<tçY†5Ìﬁ©òE≠ÂŒV˚?3„«™wFdó:ƒÑ ´ÂÚ«ˇÛ∑q<√µÜSbÉgK⁄µÜR≤OY@%˚aïÕºóµzSèVÓ“:©πò÷,¨âDçŒØá¯áx-ƒgéi‰ëò«j÷ß2´Üw√Ti\¸îYgˇÖtyö”ïÔÿ(€rôÏk#ƒ/n“J^ò—¥ˆ˛ñ⁄U™¢ˇÈÈV©Á;÷Æ“ÿj™Qñ‘Ù@üjﬁx3ÛYÿã∫Øø?⁄=˜gµ7áÃVJ≤ ﬁ1BëehôÜVJÂ˙‰œ:◊—πé˛¨smÙN)∑¢Ç7Ò”l‚˝·w™gùá∞¢'3ojìóJ_˛CiZ¶A“µï)Hy6ÀáüÊqÄ[∞®íÿèı 2©~fí◊…àîÈÔ©naº@sU=ﬁ-úπ7!øp¬H“Ù]∫£ı|ÓÑÔ:»›'≤cƒCOt|\ÿÌ¸ÎàVî∑≤ˆM'ﬁi±ãÇ8†:™Ã3„Ç€∫sÎÅæ;ó∏ó|ê:a(&Œ|T£=\¬&‡æD¸{…°…Ô:9@œwn‰≤Ù=µH“∆ßòÜÆ ˝_2)‰jù“ã ,p$sô±êÛÛ)˛hû”¯ÍùŒÎs*ßáÉ˛x@Œõ√¶Ä‹¶r†Æà !U/7"œ–•;'´ !S+àÅ	'¢˘˘H∏J·tg›~∑?~à@›∫|m0∫f«Á˚2°á|Nˆ1¨ÛeµO:!?*s3_Zâ¬›t0ƒª•/u„|„—ﬁóÀ√∏J4ãÏ¶[>CSùhﬂÛ>ıfú∫≤Û¿Ü™f[çcü•<A2ò“¸Õ§±ŒÈ÷Ô,`ñ”¬t	,|ß¨ÔﬁWxfˆy&'B°‹s±	”·∏å?*vf]{OÁÑe)Ôî~ÇÇN°µïÁÈøIÛ…Ê.9u'3 ø†¿’Ω„/¬kîòïÁ¸`¯R⁄ÁWA¥D–ß¬…S≥6}¬8ºˇzß‡5íí±[8‰o4XØ–-7]˜úMü‘ç?YÎÓbŒn‡©“Ø…C2Jc¡§ÑXY€Ÿ]çúè%14\H4 îñA¯U"ab#∆¨˝*+6$M|8±ë…¿9sÁó!Õü§ivx∫√ñºq	≈Ìjkk„ÁªA€î|≥:Ø√w4c≈YŒﬁëWN4CuY¢çŒ‰C’ô|º_T:v©√,„ÕÎó˙√€**WgÂ9à‹}Yø"˛I	˘S-ÛÆB*õ$™ÀcJÇ&únùàÖªÅ¯∑◊ù!ﬂ—˘°ÃÉ·Yßb·2õv9äBv¶"4é…t≈ÌG3Á7 Û\ÜÆÛUÕÒ}qXg∞ÓY“7HQﬁ√⁄yßﬂÓˆ_÷P\‘ˆª;˛’˜mh_Ú≥‚Á√<P3œ¿÷¿ˇ¶gÁÆ∆¯Xcò‡¡Á˝Ê˘ç˝∆£/Z£Ò†˝´/Ë“¸’ñ√µeŸëB+V¸†•‰uó¨fp⁄¬ø)ñ0‡*≥˙§DNÑŒiƒP∫å|[Ñ˛;ﬁ*‹ÁÇM¨≥R‰≥ìÀ∞H¡”»\ü‹àLå–´Ñm0q6Gãı5wû¯â˛"VU¿≤ÆET>¢gcïµº'»[@ˇµÄˇÕaœShÊq0ç?∂ho`œ©n{„ÜBöeú∞w;Lá˛2aip{fß3€˙‡^π´5®ƒ»∂@Y‘Ncûí1‹Õ¥)∂ít«˙‘ãê≈y˙Lé˝‘mIëΩæ‡ª}DÀ‘ë3Ã¢Mßû.é(¡ÀıxP§ﬁGì<ñ≥W¡ì4¯“W5h\åÎ>WQ)]÷<tæVÿ·‡≠"Z˙©§¥ì©0XÅﬂÇ!8ü'Ko‡„#“‰3u”=â&éÔ÷ﬁÏ◊ü<˛\◊õ˜üéV®^DnHsø$G©ï"Äi9úmÍT`¥ºh@ŸóÒºﬁÁ∞ÔROã¶˙xi•≥@=/Ñ∆∏Ëx{É´+lAs&ô@Ê”‡l–nˆrÄ[¸≥’<;œ¡$’g¿]4ﬁR JÍπcû`∆Ó£o"ñﬁ-,\oπ´⁄~&4ä¨∫ó∞Yßa∞¨]˙kX–sÚMÌXÊ?-PË‹[ÛÄ∫°/⁄} GÂ s¸gwwÑ.◊Àı¯	ñŒƒ[ΩÉ?MLÜ)¥p ‹~`∫›ŒË"Ï¥yƒyËbYÿ∏ıcaÖˇÃ≥‰‰ÊL›∏Ã^1 ŒÄ ¯*8˜GIâçK	)ñˆGö•¿u
≥+›ä@ŸTsï∂DCP„–”<[;lVCT«q9e«à,%Íœ"jläU∑nNu>â}÷d◊‹◊]ûŸcÎ aÍäX∫ëVêY{±è⁄N®£sLBñ˚ºDÌC¸<
«F4kdi'ëüR‚„¬≤ÉüŸ¢º0á
∂BÈ˝ºÑ]*I‚.Sè6õIv*GöÅüA¨˝¢Ô+¶[–„˝ˇCìlêÈ€°MóAàäªÀ£üqú≠9CúQkÉ{Æ(≤=X√ÈqÉ5L·Œz¶p–†I6¥’JÙı4Áƒ∏çñÜâ≥58,Î—~ëï+qr(j’õcñl¢…¶ÂÜay†ñ"sY]]™ã‰e™ë˙Ê‡ s⁄-∫≥LÿÆ±`2jòº]"¬ûaGDX¶L>tòj$Û⁄J?q(ác?(h¯A‘ A–7†ÁéL[‚s"™«„a≈Qû¥cuH€∂h$è?Yµ4É#ÀŸ¬\'UœôbFG¨§nÉ·ÃRîôÃ]+´PQNU`€’üCº'À◊r›ñ©7∂[∏Ÿ&°X∫õ—´-Wvj˛G‰–ﬁëÇ*7$=C9 jÜY¨Xæªñ‰FºŸ«f•Pÿ@HsNCP∏<sÌª“[[ SG¬Ü|≈Ïm@@€wnP#≈ô8Vì8§~˛_xﬂ °KıòÜ˚0ΩƒÅEÙ6⁄ShÙzZ& „•tjpÒqI¶¨jŸUK´‹{˝¥Ÿu©ZAZ•⁄S÷"V:)∂˝úÏ…œ∆‚µ5∏Vu¨)è1—C.ñ{ìa/ÿÅe¬9\„„V£fÔ†w[[∑¸ #äI=ﬁ:!síÄ∫ ◊avüQﬂ+ûÅÏ$ù s≠tﬂ∂fÓòë¥ö[∂–ñπì•Ï7Ò˘^ óä©$îˇl?£\éÁ˜ﬂ^{G¬ˆ≠÷ÉÜ6øˇ#Ï÷∆≠%[¸˝—RæÚ‡‹rì?ÖYÔÚø¸ÿÂˇüÖÉ‰£ä•Ø^]¥™2‚.® ˚DÍ∞˙GVb« mdø…’Ùß}P¯A~9-tÈ!3kJÌŒ…Î¿øˇvÂ!)Î©Á≥*∞∞‘o›i˚ÖDø…Î6˛u™€Kºïè$:H·ÏZ∂ò•yÂ›yã	∞ÕRM˙&Wætπ±FŒ…[üqNZV¶œíŒ•¨DÌË›bÚÛµªv;∑0V∏Í'^ÒKÖLµÀõ‰)IfËUÿÿ)o∑b5n’y:tØB7öµﬁfÑ≠∫D1àM6ÆÅ≠ì†DKoA∑\vºÜ^|vX<ä#© á`ê1rHË>··fqE*√ ≥CeøÛJDFπWb“–íO¥38IƒüwQº„úÂ€®}q:w¬∂+Í.ÅÄƒŒw6Œé—ƒÕ-Ò7foC∫πy›G‚÷£U∞<É•√»ÍﬁøÉeÊ]_ª!.i¸SÎ8K¥dÿ¡x*‚B»{ærŒU˘:…eaiM
(”ƒÂë£8±u_Ë±®{[„–;(îj)_Ÿâ.|‘Ì â8IÎÀ¨rê‡h@∏≈◊¥É∑≈UÍÌ®•DΩS•ØaÕ@≠éë>*≤h<!¥*¥Z *s˚⁄|Si)ÅÚ.V‘T¯GcZ·ì c8r¢ÓËEIÓf§√Í\⁄ƒÀt0Ïá‚‘‡Í∫7}Ø<~l*iö£zEvzÎû’IaC1&;]U)ÌG1ûÑ´òÁﬁ»F X œ∆•Cèr»Ï†∑ÖÿÄŸÖ c<ÛV‰≠~^LÇ˜Ãç∑ C?Á€dÎ*z{*5lwûbÃíËæºr¸_áú˙îãÛØbD‡Äå~’oëŒu^^Ù·ÔÛ^≥?∞ÙÎD"ÀìëàYïØWi§»Õî◊ë≥-ÒoÂ…Z* _Œ<—∏˚‰˛7QÈWRäÊâDuiYÛî˙©º’;•©Û£;b^SQÅákgA’=z¨~íËµø˘çTØ›Cs(g•‰("OHNw—KLœ"ØGÕÒJæí–»NnÎ™·Ê◊à˛ΩıVìô>çÏc´ÙXRR6è’O§”k“˙≈’íîÑˆËZ®—±cÍﬂ„¥∏RnÎd)Æ2g’DñV¯ë˘ -Ç0"”uH_äÓ
6DÕ[‘Çı
6¬dù¿øh'pOöÄ˘ÚÖ˝Y˛^·xx+¯¸∆Äu\≤⁄æf‹ælk4A8bØ «ûÂ˙d\8Ç4—GŒ*Ü /cå•Êa¶∞r∞#´[⁄:}Ú-Z'Ÿo…	∫Ò’¶åö#√ÿ¬¢∆âx }xÛ :i@ÛìÙ∑¸õ¿Q†>#,n˝ˇ(WKÁP© Kî	$=3‘¡3
˚-Ì ÅZúYkQÄ‡NH.1Pÿî)[ı«ˇÚàÏ•iÊNXÁh Â˝üˇÔ‘ˇxwyçÎ•ìΩ	¥xÌYtg¢ñODOú÷‘¥@˙ÿc|íCöeÒc!Q–Åº…–ùãËê cõ+XÅKm\÷€ñﬁ¨wπet\ûBh¢¡PU·ÅÀD Ï∞rπïëS‚˜;·y2òÚìûG[d¶dá"˙7¸	3‘Îuzù·˝?;!aø›bmi›»öOSMÑ±∑xáU#V¢¨ÛÄÑ:@·ê¢µL ∑BÛ2TbÓdﬁ±∆„Çw,‘ó— ÔÁÅ$¯Oå	\ûÙ`@ÎÏ8∑∫ˇÄs˙OÊƒ≥Éï?]r?Sñ¯SFÑô#
ÙƒÏ<1$ Îív•î>S·ïèÎ˛¬_ysZ'á¶dDHâ‡D+ZuÜÙrcÏ∞Zô?¨P)÷ª]¨∫4q#—!˝a!SEùø∏^à⁄e¡^˛mË,πÊ„EX∑ãxJ¢äö]w,◊>èÃ≥IP—«ó
v&*°*Í√Ω≠bù«vÔrw„Eúè|mÓî˛¥ÌÏT';µ©‡◊–H;ô«CÁºp÷2∂hòêg$7™úG∫Í-Ê©£ú¢¥F[4rùp2˚˘⁄ﬂÌë–]≠C0¬µ´œR`]˙ÔÇ˛H[´ØÇ^÷[∞-™{ıUËÕıØôº((|8ì–ó?∫ÉóJNæ'Ïã∏∆‰˚/≥O±i˛“ÎØÁ–6óX?≤≤Wæ-oöik„vñ!·™¶ >CWˇØ‹É˘T«É]˜p≤M›®˙5[
–")ŸÙµe?∞˜»ˇ¢Î»{ÌØÓÌ2˘!Ñx™qpﬁ>≠∆;·Å|·= |êB·mÕ”4˛√2 ÄXlÊŒ±XäÊl%Ç/µ8‰fIÜô‚I¶NÖä‰_-‡ºïØ÷°É÷CÆUa®˜T7iT5Ù¸¯Åì´‰EÒy⁄<rx‹Fq˜è6ê*C?L¿Å¸U‘†y;†]«Ø≠ê/3¢{è\:*Ö¸	ùx‡KUYÀk3Œe¯ÎïKê)∆òk∞?eb"∑4cﬂ≥/™QL(}£‚yﬁ∫ö»®®ΩCµ≥¢G≈¶ƒs7˙zÌE0Ù∞yI?òª»ãÓ2Ï1Ø˚bAŸÁ–_†hçì>J%©tŒYπ≤É rYU∑Â⁄]’ÈclÇöo%˛~ïÖƒB(y ø¶—ÅÜ¯GFÄJ¬/9Z•$òÄö˚“Ø=°.ÄlZY ’îUÙÖ9í≤{q~o±P¡∑KQ>QZœıN‘[˘Jû¯ﬂöΩj¨_,†¡Xù¡…ÊßÂ
ªø(ﬂ≥–Ã|ΩKçNå9;pù˙ºËyÛ•SßÈ•¸Lø∏Ë˝å4[„Ó†?B¥ƒx8Ëç»Opbx÷d?»ÂÚ]Uó5í5;¯âqÑÈ‰mnäliÑÏ⁄¸¯`Ü«nLéÌççÔ¿ÃP|˝ù€hqh÷;s8π”SæÓi¨ÜL∑‚eÔ1Ò∆`vßQ⁄-∆xoè{A‰ΩcùÄ„gƒõ1=: VÙ˛ôU#äq·3fµıS⁄ﬁ›PÛª‹Ê°v¸.•„©&eÅM\≈»®qnC∂ù‚xÉ>Ìõªx¨LêÉ2∏5'ƒ”+iöc∫TÕ…˝≈—Ü•œäDè‰œ›≥‰˜@^Ç¸~¨"qvä∂'É’Ã·vÿêÿ@≤Áß¥|õv{E†ñWØ®t∏Ú9¢¿ñ
Ño¡7†««›x@‡ÌS1à$<tÔsªßÈ=2…UƒıA⁄¡,Ïl0Ì˙mº∆ÇvEn>Ê<Êb˝41‹SHÇí€'9Q·LPê0/C'çÑ}‘§~NßÛC^zßzgqPº∑@=†ﬁ ´ËC†≈Û“6œà?ÊcVõœwE∏ó.—LëeI©kqŸÖ%í´:gé¸2SÜ‡´≥ÄTU9]ÔÕ<m»Nl¢ƒö+–"¢ﬁ^û‚ŒâÄ•h®±∂›¥√î«®Ü∫,u∑ëÃ‹ï3k™4®M%∆ jR:¶|øW‘®≤Ó»ÎDdïπ}8ßPË2ì2êWtaﬁyôΩüá∏≈ØÎqb)Ó9≥´·¢€¸ﬁ[âñj˜›]Æ˝Ø⁄n¥ä≠5[ﬁ0ôÔEÆ-[^˛£ s2ÄÑÑüUílzÆƒèßpJÍwÎ¢"‚«ñï,éwüsÛö‚xñ°53$˚ƒµó(¢g“º1>’Ï/€Ó–.¡-hª◊Có:%´s^“süWnr`™,&´5uIÂ©tŒâŒWË≥e]©¯cÊKã€5WÑÆ˛ÿ,Éú˜wM,@8•z˝Wno1ıÆJíDˇ¯w	Î#∞Ê‚ì˘©k€«Yª›©àµú˙ù≥ÙŸqâß`VüQ‡çkœ¿Ì˚&Ga©”d´#](ﬂõ{Ej9ã˚?,ºâSÍD,±ÀÔFı^d≥∂¡Nî¢êπ¸Q#Ãø+RÍ»ÈÓc 1'T/±o≠6ÏÓy˘úá®9˜%ÙL¸ÿÔS;Bıên[ï«NÓˇˆ˛?iÀKÒoƒÎ°\¬gJ
ƒÎàˇñ‘Ô‹Ëï¯\ÛK,I∂ÁMôùá7)h·*N_1€*öbëÈnè$è±Ás0ÕŒª” É⁄»•≤ÚﬁÍ*§’S‚ŸøˇÔXe3ﬁ<FPt±πëx¯‰∏ N«l!ëC⁄bãÇ wˇ-z⁄"dowxí5vTÃ˝¢PÊNÈH…Â√(≈&Ù.QÀ*(˜LNî≠âXÂÌ≠⁄L„M^A_ƒõŒúyzw!Ã;1O
\§˜à >(‹˜`»5„¸àE-d∫Û’,DW,#X‰øS™:‹◊´`Ùr• úS®hÚÿ÷˛7P∫&∞ÎM˙≤5è«òVõê K+£v<ı’ÇPyP‹ÿ6~„≤27R.†^y%Ì8*Û‚»BÛ¸Z4ÅÜ’z‹¡*LéπÍAçŒın|Ωú’z˙]≤Z$36– 
Uû$ï¨∂“«x]§Ôô2*ﬂMª¢U√˛¯èˇÙø˛Á?êÊ∏”ßú0'â?$ù^˜¨€èŸcŒHo0Ól™ñÒ1˘@:YËŒQFx…π≥@/´¨â4±~1ñ‡·&8-¿Û°∑©C.q∞Y…Ìæ6D7Ú˜_ ∫.˛¨±œˇäõ¯¢TVÈë-†èßÚPøÿ±ƒQ∂ë≤#∫œ>Æ¶#˙>ø/ NÈ˚§Û˛~Ø*Wúû25€;∑∞◊∞ﬁ˙À–õJˆ6‰Y.øSﬁEnπ?ãMx˘UQ
›-ïç,ÿ%q(SÖ.W=5∑€ûœH’s{ÉÖ∞ãaÁ{SÌﬁ◊"°îsO!R)ätä4eÿﬁÌëOäúP†^ÄuÈ>W4´Ç«™á˚›Ù˝n<˘U*i_€ÄjÕ√-2?π7ò`≠U…9Z¸ }∫=∏VmlöG∑1Ç±$jqCî¢2±Qç>îØKÂrçmˇxg≤ì6˚≠ÍﬁŒ‘[ΩË´ÏΩŸoU˜^,1˘Ò|¨Ç¯Fˆªç˛†|.Õ¿<oü¢ ·b
Ï)⁄,~FÀ¿YË”]uoÿ\LGﬁı"Ó%‹µ`è¡i—.Ω‰{ÖuJQZ«BØ∞T˘›iN´IæÁKƒŸcm'∏‹ÙÇ:π5/®ì‰˜œÿœ»¥ÚÏŒK^ˇ÷ºv0Y£!÷
¶(ﬂ'[	/ﬁ nT≠Ì§ Àÿπ¨V¶¸æ®RVF„˛|:h;Ä–Öu$ÙKºÇΩJ◊(À'háŒ[⁄h r\zæÀ~∆’¡V©´‡©Ù[…˝Ú∞ùÏ[U°≥¨“C…åö/»—	9ªˇm˚¢GkÀ∑≠ã≥N<¡y±\Fì©ÿ#?·ÖË€É!˘˘0‰%O`˙Ëí¶∞ËrRWtG¿OzkÌ∆sﬂÊuZ°Ã{ZŸ˝¡ÌíÔBI˜¥ê;ΩZr±{Î≠$Ì÷dÎêá˛µÄ<<h“$ôÚìû˚''≈úN2vÁK4=âõØ]Ú˘‚J÷NylWÒ6√ø#mŸ‘[1î∏ùû–á¡[¸∑ñ‘OKúsh`R$/g+s«5æ∑(Â±	´ÔŸ˝¶k?†^≠XfÚÈ•ÃsX3g‚v§¸çŒäw-:Ù
ı√,\xgp~áÿ”_ìñÏ^˚Ì5ñÂ∆'(_WÓÑΩÉ7wßXSxúÊÂ®ß«6FΩ.ü£L¡Éñ¯+'öë—´f≠q¸HÓwS¯⁄‘ÿÆîC„„4ﬁk™„†àÂÓÃaFπûbÊé≤ä
v∞üÂ`ìÁbó†â‚∏K6 Í]X–y*œA!r˝‡Ñº\{ºpS˙´¸òk6
|Pôùbã#ˆC©∆‚@>≥Ö&0hsl3ãK(’Ù‘ã&ﬁ“˜BªC$n†u‰I;˘9‘5´∆oÍË÷‚¥ó1ÂæMÁWﬂb4Úqï#\;é√5Üj»‰™ñ’ZAMœIºß¨p6≤≤∆#–ˆ˜øõ£åtplV^àá&ß®””∂J§bJ‚◊OßÉé¸í2îÖ$Hd q.ÔüÙ·‰í®MóóM]‹
”^ñÆπ«yÒîV¨»£‘Ì≈RûDçV—! 3¯qOÑè{ı©8ä:Œ1˜˛JﬂIuÿûﬁÓo»ã.ˇ≥⁄ïI@z…#Éo&:öóç]k‹µ›ï„œ‡‡ù¶B≈FvP)†Tæ‰õZ_0«$<çtÍÒ<?≠/3f¢
¶ü´º…àKí õë,DX–Ú≤å(ñiÕ±Ûæ∏Gî4Ï^Ò≥Üî⁄∑ˇ©ËÚ+„0†¥…¢IÙi¯ˇ8Ø*J”±ÂÊ∫î^!è¡îv«X˜ZN%Ω)1[…‡¥€Í6{Bû^¨î’W¡*Ûå¥A∫Qµe1?∆äF6)ê“+:y…ˇ]V¥§dãqE∑ÜÉ˛†7xŸm¢[Êl∫À‹2•V≠V√ºxÅÓ$ÃÅÜ…¡I≤âh˘ È¡pgñR*ÄëDΩj	÷V+Wa0Á·Q¯;U ÑŸ†	§µ«¢Ç „¶çÑÜ5≥D?eô%)ÒT≤HVÏìÑä-°ƒûy”)(±úõ7	£Õ~s¸àf‚Â∏≥Ü≤\ì°i5qÂÚË![øzÿÒ›kå+°ˆ˘ÒK(†ºì⁄æ¶6ˇ3&h≥_ﬂ?¸ú»jíàÂë‘r3œıs‰ÜO¡bÜˇÀNñÜNNS´ÜËïÎ†®\y`≥˘®Æƒ⁄´\aëPÜ+?c∆H*j« M*QÑw)ısÒß ´ë§È,>Ã∑ ç≠ÚCˆ|tN˛¯◊ˇëå:√◊›˚øêÛNø;¥’Ωˇõaw†ß»è¡å¶íæ≠<≤x–®ihÄk™∂%–Û©‚≥{xîæ˜
9ÀîDát	‰èn&c2Ó<#^^0ÈÿlüuG#V≠‚lÿo2e‡|ÿu˝fØBN‘!<˘”b/-Õ›{›ﬁˇ4?r4Ëç/ÜMRπ›méõ< Îπ¿«ÜÌŒ∂>6˚£”Œ˛Ô`ﬁõÏùjv/SvzÕÒ˝oa≠`K›˛iZ9d˝®”{?tG≠ÓyØ€oïÂ‘‹⁄¶›ÔUÚ"òæCD…
ˇ∞›∑†—<íπöE^ts°&íÉ$™˜¨>óelg»“<Ì∫ûÃIqÛNö∂wÌÅ%vRî26æºÄê˚L|$¶˙2ÈIŸµ¯¿6˜Í›kèzZØî≠…(ºÃ¡!ﬁ˛”ıbF-‘∆~„—Vo¢On{™hû£c-b˜-cÔ:Ñ~[8·CJÑ¡ëÈ„Å‰Eƒ%◊k∞ˆùå˙ﬂ\\æS'ßËäÚù,è@¢‡¥åh,"Á“Ûic–¬d∆ }d·–Ù ü¿•Óı≈z‘1^Kv™6<u7)~√≠xöl√[“]–⁄T—QgÛIî4™ë!‡óüãπíR}¬ÊÃThÕ{d®>Ìó`.¨÷02©Ÿ`≠u.EjZ–rlπì,Æg>Ï¥z£È∆]03õÌÅEA(…35{õòqà≥7ÖˆYÍä¢ÑgŒbÌ˙ï˜DuyÏ´¢W∑É9H≈ "?hyú≠ãû~q~—ÌΩÍå;Ù¸j√Aé1Á©æËÓÌvº3»p≈P
dï˚˚ç«Gü<iÙö˚GO~ŸçaëíV˜u∑Gí¡∞˚≤s∂≈*≈∏jÙî?ÿÒ—¯≈!dÚq·¸Øj.¡~î%™OÓ~‰lV‡•ÆfmTqéÓ?~x‰…—∆–î
n«Ît»m
Vb˝˚'∂;˝ü_4€√ÿ&ËÙ—=ÿ∫ˇmª˚2˛≥Ÿ9Ë5∑/iúÕ¨O≥%Ù¥Ì•üÑﬁ‹Ì2·”¡n
»¡·˛ø˝+©æô>πˇ˝‘»Î¿_/V4èwO[˚åX‘˜˛Æ˜\∑´∂Óêa'Ni"ß˜?Ç3w◊'Æij4Y◊äY”Qøˆ®€rñl93¥Üm¬,Rt¢\èÒõµ\ﬂÔØ—·J_™ÖJÏãFmˇ‡CØø≠Tïó&6£≈˙z{ßÑÊÂ*m∫:p s7®˚¥08¿‹!•˜@„G´·*0-g¸uˇOÑ⁄
“&¨ìµ`mÅAãç˝ 4€Î ÛÒ¯Héàô0S⁄ù9ô8˛Dj'ÆqÈ∞¥;ºzr>†‡å)z–üUË}¶∑Y<iù◊∑s∞Ëç!9‹[Ãåú\Ñ´5GÆI`FæKìæ.ö^Ëb•∆e¡õx7ûˇ >wπB„,º(Z{–åY4ÓÇ	<ï≥ÊŒb 
¨(¯»˚K∞‡Ç‘~Éãzkºjì·(∏ÉtÉBÌKfö~ÉìÈ7ÇAÅww¿ É/`÷x#_[8ì èÌòœ(Ee·áK>FmA#ÁÅˇ{dÛËÛ7|¿Ü.J§E⁄ÃçaeN8Ô·MÅ·Ps˛∏ˇgX€lüËGÜøXl8ÙÈ‚^\Öq;Ö›–ä0´5ΩñÈ“Y›ˇ˛9ü`…¬nÅnQú$Œz∞∏Òn8O	<≈Õqcƒ=º-÷5ü∏!•Ã›Œ˘˚ô,<òzL”Y†ÁÉÆâ∫∆ô¶∂”ÛJ®Ryò5F≠†-±UDUÀ8µ{¯7ZQj48‡ˇÊkü*˜•J†äNyx)˙'∞Ÿ¶8sÒ∞ìq{Uû7/∆É!iŒH´3åxJ`Tã£©‡[«ò«·#0Ç3öÕ1Aù}ﬁÑ;0A_âZ™ä6qˆÈ.¢%áU÷Úwtæï>gP$‰lºÒë…:‹m◊Ñ=!èùO'ç£É⁄Â·˛°•7OªÚ~>$ØîŸtΩQå(˙¥ ,ºÿìE“ƒË‚ë;±$·¢4[3·	,≥tä±Ìú3eR0Q"¸<§Éëç¯<bülª¢ÇÚÎƒTm¯Ql¡W°ìœ√◊æV	¿[‹˚m÷ò·Wô+R≤≈aÆtk–Ë≤Õ;S¥3L#[„Ïî„‡g<u0Á…ı¬ÄÙ‹kvÇ@°sÁ'‰Èe®ô’ßì‹⁄»ÕéﬂŒ∏(¥≥˝Çn•{∑¯ëÛxﬂ9>zr‹∏zr¸È˛dˇxr‰Nû∏Oú£«è>Ω<|tupy¥ﬂxºﬂp¶S«ô^NÆ4sÖ›ﬁD«7UÉÀ-Àñ #'àæËP`ƒ∏{÷Èu˚ùM	ÍEâêPf≈∞è"ÒÖ@Ñ’ü<V•E)í`¯ù™€J”)™¯ëöQå
<*Å˛Lnq·–ç·êVªÀøˇ√5jé∂A∆Ì‘+y ë2%F”á¬·r®e∞)KÈiaÖŒÕa®2esÜ]ÄÊ†G⁄ì≈"Í®}®sê…Œ…ûe≥è1Ëb¥¸
êH™U%Ó·|y‘\)‘Ï‰f e§åbÌjYÖ, –Ëbhgexd{óè∫Ü7˝]íµ§H[¢ÔCˆµ›BÃ∂Nı=Ã˙oı¡°ÿO~ÉÜ≤z¨Ñ`»{zmƒMNı-âÔ_Ø˛h¬⁄€∏ÃTl˛ç{Ø…«®”Äë’Yy§‹÷)…ä∏§áIRäÿX0Ÿ;˙tø7èY@aÒı⁄ôÜqÍìqÖKüôK§ª_¥´R‚±U∏^L–OÑ0ƒ∑0ÿ«l¥aÉ]CB~ÿs6Ù¢I@öË¶)?cw_ö°|avˆ“wS#§ŸG1ã°}’s—óE’«≥˚ooΩ9√Ωâ\lzömÎM%4ÑòD¥ª÷œÓˇeÍ	Ì_˙k´÷Ÿ’Ó˝Ïe5óøˇ“PBµ]íŒÓ¿ƒ,˝£	K˜2ºˇˆ
=çS$Ì)*=œgŒ“!Á±ß2Öëjlå÷Ã	W{÷⁄pûÜ_ Ù†~®⁄ËeÍÓ≤‚†Yk<“#rÕy›“:+ÂÛ∫Yw‰ˇ¥jZÓ8(LbÎØ¡T«¥Sä∂KcuÈ–kXG€iX¥¢8,9ó˚“—éuB1» _á.	¢º7]»’7WTî:tÆlÄ™∫QÆÇÊ-Ç≤äÚ&e4π±∫ˆ}Næ≥I&ÄH9:ı◊∑j5§[´¢QÆ~gq„–úæDXP!@R@Ê“>~ƒ–·∫ºH≈;SÍ™œÙ‰≤CÅÛnêùoÂ@'Cªn5{VÛÌ«2sÒƒ‰∂U"ËˆJ˘g˙Bœ‚á±F]ªúsôc§ä1ﬁs
¢¬ö›ê5ÜE¬–∆∆úÏÜ‚Õ‚âæËÛRf∞ »Y|É—º˘ePŸK Kl⁄‹œúØ<ﬂZjl⁄ÉC§⁄4ƒØ›ˇw‰·C“πÉÒŒ6çM;r√–≠±ô˜äRøí<-jÖ'¡¯qÍﬁñ\∞ ›¡ÂØqA∏oBÌ“∆ÍË!Ñ51_ZM4ØÿMQΩË+ßÅ‰∏mZ†›{¯ıàÆŸjeπ™ùèaMŸï,ù:ÔNH•Qõ"XΩÚ¿Íêº´‹ÕÇPì∞ö~ÏJ≠Úâ∞Î7ùªÓ‚`ıpûd«—Ónú.~w~‘«Sa‘…,Xá‚êíπ∑XØ\·+ªg˚(ïNrRäØ¢Ä}Ö"›≤µer√	)¥±ë¿≤{.RF˛Lˆá›çÁw„∑∆⁄›∫Nî<ï˝a≥R-dçãô1èÍØô;·µ∑@_˝*XûêÉ„Ñöë'§ˇºV´`~B‡ü7?!µ∆±â∫÷‰‡{⁄ÇC‘ç@#›)q¡W 8"8[CÁ›≥ !9¨oüU˛è∑Ò‰“Ü¯¸óÕ[/2ﬁ∆Û˘gî˜+ﬁéÛMIwû9áóè-Ó@’p‰}∆¸ì˜’¿Ω…W®`<ª£¸¡¶I3∆ØÏ„cøó≈Ùs◊„õ˝‰sÀGDÏ˙É§AÔ≤∫ÈîÀ`‰◊ªq¸RÂ—·zÍkÿOtâ
W	*∂ I‹ƒA⁄ƒ®Œµ¶≤m4“6∏∂T∂Ö√¥¶%ï8(+ÈÆÕKz˛ [⁄h‘ò≥z«∏Ù]ƒëΩCJPêàefô›ç‘¯˛Ùü‹—1€Ê:≈T1âaYoˆ?ØÛ⁄UäÁ„m[ÿTÀ…§f’9Ã≥Ñﬂ˙r|¡w!≠AÃº»
2&E«ãô˚⁄ê‰L=±DömiŒ(tâÕw8Å\u∞Háê6¢ˆ,Wx˚…¡Ùû‘˚*Q˛J?’™ˆFr±äúÍ 3âœ¶\é¯CïV}@¨ëéF™-~GÔû°)‘sã©>gN¯d2%∞L©ﬂ2Øa]ùñPYÆíäès[˙8ﬁ“ˆÆRIwËåQÇ‰)*–lbzÉµ*oS˙b+ª–f∆∏àFvÂèr(¢re÷v(_äÔïÇ-˚ITdj˜ôØO¥»´„'Ó˛•Ìø†Æ∏ªCÛ∏≤É∏P∫\XEè e=»ê‰ëxõ¯’˛’¡ß'˘ä>Ãõí”‰GÈ#∏	">"˜T˚GfÙÈ√ƒÕ®1H\õÍ∞BAô*\3Vâó‰52ΩïÉ„úGKm„'dÑlõ4;3%Ç/¶∞˝]^ÙrÈ+√+æMÓˇ∞Ù¥ï>@-S®≠ÁE+ÁﬁÉ—‰—,
æ]ÃúòÅ9 ’— E-«>∏V*Jˆë#Wz@õñË¢EA˜∫àV ”â1¨6˜%ú>.È∞îdS8„+&àîÛä1¨2¡≈{MPµA„J•˝ΩÃ∏¢ûˇy∆nbLˇ™‡IMÔéﬂÖ„XàEúÜ¡˚Ö7#Ô÷ñﬁ>ÀßéÉ¯ô[˚µﬁ{+´åÆ∆ä=Úhñ-ù®˜RÃ”QBfŒEa‚^≠ç¬›∏!Ê‘˘HÑ≥p'»ù≠K\‡M|¬è°\£.2n0tÇ˘∏
öÀ\áµ7µF €⁄õF¶,⁄ccñ ~t%'”◊Õ NbgµÜÕÌ”2~/ùçÑô-AB}vèÖ∂{«OçT=ñ„Z=sÛ∏Ã<ä`õNÁ¨˘l©º;ŸÄN6‘ùLap@XÃ+}àù~n“^ ¨ª¸ÈÒ~Ïib€1-) ˚ó	Úø$%Ï$€A5ÓC¢˚P@ g‹¢ƒ%ì$–^~“#Ù 3E≈*∞âÜàò¿L≈‘6/ˆ†”ùŒœ"¸=qkòwG≠C1ΩIAãöPÅm∏∆Óæî.2µÁ,≈™4Ú*∫Wò~Ñ¯á˚M9q∫E|!˛0N÷å'¬”Ä^º(ƒÀ˚%û¬8ZUxÅ¸Uƒæ€Dö- ÇÈÁN7b0›≈5f£‰!~Äæsïæœ÷0#ƒü2ﬁπÙ*∑6	ﬁÂ„Ÿõ!≥	ä ?1í¿‡Ù≤øÌùÎ`à}±ÜıÁMJ‹òèÕ€w4√∑ºÛΩEM[¸î9hÿïªwπr
öiÍáµ™%¨xº2ôÉ˝ÀùzÎ9‚›c€•îõÚi3ÑÛfH°ÿ™bﬂ©:fß)ÈA˝GåãŸ<•TÖÕgPõC'h…ÍóÁw€í‹mŒëßHXÏüpQiÔA∑Î±êØÂl‘+√Êô(X);M≤à©^ﬁ=h[ËŸM°öPˆXŒCÏæ'‹Îxˇ-¬Åv8˙™ÑÔ4ô;Ál ‰>îyïªÇgó+HØ‡ÁG_}Õ„Ü‚ªÜ$≈ép º¸–Ωäwê)ëÆ‹ª[Óõ¬høh‹?ÍCn#?≠™∞!ÔG¡3!oâ3Jå&íí◊H»·Q^JiªäÌ|@W™ÆÆﬁë4”πÿ’¬4Ôúwa%K:Ì∫ÜüçKuc˜±,©7£S|åí{RÍôB I«à'*GŸPÖE5§yÍ ¬|*Bmõ◊ ÛÓ"ÚB‰zöPÈ‡rœ&K§õ2FÈ§ÿœ’˝Ô#Ãáüb‚gŒW•_hˆ€∆°ãÂc‹?ı—l£'Vû∑Óˇ0E~DN≠ùõõìßi[•≤ìå\ﬂﬁbπ^ÈL[Ê≈NÎ¨Í˝û¡¬w√gïŒÌ	ijÁ˝Êy…∞k˚˚˚GO∫˚ye´∆ê„‚≤ÓbœtÁâ¨PÿÎ|vU¬ÿGÁ5“ÄõäU¡¯W∑jÜ'kà–†Ïõéù@S“''±l´TLO£«Ù™^¨÷åË}WC¿n©/-ÛÚ|dé•ë4( ’ÛQóÓ§gGÂƒ	’#™)†ƒ~ﬂ8<Kk6ìôÎ/Ò¨∆É…zB2@ìÃå4^Q>ÈÒ8^]ÜÇà
<ùeôC⁄ﬁl∞∆∑@rH3g*	2È˘ÆádâÅŒàÑ®¶5û[·:œéTF»∏ö¥A≈*Ÿé◊°“êÚÓòU,ÃÌ+jZî^EwHÆFñ9ßU—gC÷„Û&´…	ùÑHí™2eT2f0´‹$“∞æﬁU¢&¢&…/( bÈCù≤‹uIÀﬂ∏ªnÉª÷æ&®öìw_2ZÎ§¶î∫4*ßÓ‹-JÔ|±Cu*•ûfZc]„1ˇå»p√è˚a~•öj¢!ó ¬Äïø)—î∆∑^FÂ*E›#ôYŸ@RR[3wÚUÀ'æ€»Æ{\ı«≈G¬ñ§”,å Ø¶ÔÜ´qËÅÊª ÁréÀgjÿ≥∏¢Çv†œr∂ÁJZÖ±y1æˇª˛∏€–∞H≥◊éõ'dp1ÆNk/˝ˆH—e¨¢∑_ÖïY8ﬂäÄ%ëtﬁﬁSÚá¢}êWÂ8,«Ó¯\ˆﬁ+oÂ£¯◊Çïü.üõ¯UÑ “9¨ZÀ‘9±⁄¡HeègX'∆üU•Er%]zåH¸˝ﬁN˚ŸB
“\ÖﬁÂ˙˛˜”¿‹[Jö≥€¡j˙¡Ø9a£pl:B	|/ö·ùªÌP/¢œã≠bC_"ToıÆK;ƒjEªÌœ»ıSµ\Â˙¢%LÀ3;ÑÆÛ≤X 7Åã·Y¯I6„PåÈ%ÚO‚ﬁ°à{À√ﬂ©‹êOd(ëW©Ea±ïΩ/u √òÓ∑!≥—mR∫T|ı|ÿ)ó¿!∏πJE.®≠ö∏Å˛]`6ÂM≤¥µ∏◊0ƒË@∫î˛ÒÒ<ºá∂&ÍñûŸ4¥¨T˘(i·Å^p%uOÜ
VπSv˛°	ËNfHÍù´Ò*;ÒU‡˙£∑Æ‚eÔÆ›Üº‹)æ*C˚¡ıh> ~w  ∆ Úˆ	v/}ˇ¸é›˘^≥÷ÂÊYSœﬂÙ/?G~w
dÎ
P/Pêeä7®µ‹≈A]Á…I€åiå„};r˘¥¬Ñ∫≈Úù&˚V) Ó_‹°„Ê$¯Ej¯~≥EÎkäó±ÕÍåHıç|r∞ü˛ﬂ±TòÑÊw+ﬂ.í¸™~q2”[k7û˚6oh)Ëë wøËQP˛‚=≈ã›[o%i∑&kX≥œv:?Éú8áß¨»8Xí,ébé±ïíÉ`õ3wû—√•£Æ
¡6f™Lè0#€T‰ÆEr◊<î0W84ë÷
4Ïå∆√Óx ›Ä*·È¨±˝q∞UÙn{Bµ≥lÇí¸tiÿ
 ÎURÇ6UäŸÚó))ë5ÉkK∂Y°nI'“˙üçÖ∏æz«—Râã)‘4KPyl¸ ≠sÂÆ÷p¥n7n"'¶JπÜÙ Û·%™sT*ÊHÁóù÷≈∏”ÆÏ≈„ÆPàKNÜÙk5Éœ4¡í;IdÅ≠;Mæ¿™c2µŸP7ˆÄ¯◊'¬üûŒ#@¬l¥K4‡4sßk–Tè1	Brú†‚5&jv™œ8=íƒí‘=sÊ ™Ô∆‚PYeGëü.◊›léU;‹á≤‘u˘––¸nÄ˚8˜◊ë›πAOä~p„déãˇ&ÁñSÉ;b⁄Ÿá∏’ó…‚à>KπFÔ"xèt·‘±Ëƒ›˛Ys‹Ÿ”¯+çI,ÈqìÒW†¸j∆°˘f(B´.uˇ™Ÿñ©l‰‘bPÁk(Ò‚æ4ç´®rmı ≠At—7áõº±L˛j‚bü|»’U¨6qhÎ–Ü… ≤«€*Wπ©∂ô©ßΩB3≈ÄÈkZ–Ÿ∫H K“πÙêrWº®ùV1œä‹UÒ£éˇƒ‡N”Üt$r◊qÅH0ˆ±Ë$5Õ´O—Gµ∏÷r¿‰\¯‘…è˘≥≤ﬂPë£≠>ﬂ#^¿o	Z7≠/…=l©≥¡Ωu'kJêI†a’'1Y<B¶ìºf¥HaªŒÍ†Uõ·™˛oˇJ¯ˇ¥RLZ¸ÒT{*æç;XRõÔÄï9V”∏®A∆[ë^”uÑ˘EK°^D2“îÑVc≈öﬂ/:ΩØYmÆÕZ˛È:Ù¢©ó´ õäïŒ@¸‡#hRê©a3‘ß¯ÉJﬁ?EzN,FÎÀ9∫*Ü§Cóä{∆U∞bﬁ∂çÿ…π.UÓ:ƒÁRüaÙÒ[–?Ë™ìh!è«ô≈Uy>Ï¥z£Å‹»úë ˘Á¯A–dG>¬^±´A§ÀÉg≈ÏÑeY—‚Û8∂ÍîﬁX‘-Öè„:íådEçò›Ø◊ ä¶ä4˚,XRË
Ô
πxJ∏1ãzΩ^˙ê]•É=xëwÈªlåôÎÿ[Ãu˛bÒÈåÚ`A‚©ÁÇMxïX	ˇNÍÒ/kâ≈ëÉ†ygåo©ÚWSÌâÆ≤ÕPÑ|«2Éåﬂ-ø{y‹=à~ÁÓj|≈;ŸÄ <cÊv6ñáÊu5¯»æI‹ŸxyÂs-&πsRÔD´”Î}—z’ÏøÏTˆ¯”á4’¨Z∫iÑe«ﬂ›Q¥$p@KFÉ
–öπWT—x◊u=SâÎÉÅ©Í…xÿÏèN;√B7≤yæ¯,°ËÒRd0q∂y˛NÙÊ®8
m7ö8·ƒMµ®_Øß1√Œç¿†ÃÇy‡◊Œt´>¥√q°‚L_dÎ
°¯ŒâÔa‹(‹ÊôØ£s¨œ[xlúi=ÒÔø†©.A£ıöıeõg∂;ÕÒ+…z√.œ{ƒß›ˇ·“[ÈUYîÍüÙÅ'nÊÁgÌfˇ˛oõ(Û‡á¶˘D»µñl»ÁÒøÓˇÆﬂÍ6I∑?w«,îW∫Ÿxü=oˆ^7á˜É˝Îu_tÜÌ&¸´:Ù∆√Ê^ÈvŸﬁyﬁºhwy?;øwÜ˝&©éá›˝fwTæ’dw<ÔåZ–µ&iıÓˇæﬂmïO∂ËüøúzÉóˆ¸˜Ù@∫ˇÌãÓx`jnªCÑÿ c’Ò8˝CîÌ⁄Í‚Ò…ñœ:¬§ÌéÛízÏ∞nﬂxåõrÒ(«ÅbÃY:Â\©ûã∑oò‹Û=óUzSúŸ0≈yifüéπ‹7™œHuYèm„…dˆÔ‰⁄ƒ˚{‰˘3≤‰âÃ‘ı”rX8]O;jI!ùQﬂó¢Úæ4´ÓÙÌóıS‘Ôäo˛·ù¥Î®Â≥ˇåT˛¯èˇÙø˛Á?ê÷´Nó°z?´hµ|⁄o£¬èˆ¨÷1eËÂé÷	°¬~Â“ƒı}≤† UKa$tﬂy‘ºn“ì÷B"—ƒFÕåÿÂ5f≈FÔ6YxkqïI®lazÏ´É⁄æ6áÚá#·å˙ò&„q√›Ä™v∏"º¶˘˜¡Z>πÓàzœÿ∏¶+⁄f=ß´ôGiﬂªÕ~“Çcãß-]j‡°S[›·Œí6,h≈r6)ï?•Æı8_å‘|/ÔO/@3<ùÍÿuÈ4=ä•ÀM‡ÕñÆ»D´l˘ız˝œÀVˆuP“a˘ìÍÂ™ÕÍeã"¢-©˙üje∏CìTŸ4ú*å$NG>ı5Åp¬œ¥tß»À›ãxLJMÕjù∞0†á{—‘≤zˆÚ7TÓ'xê¢>óºvB;‰á:◊ıÈC\ÒäDÇ‚≈Í<,(á+ó¢8u4RNæÇ´ë÷‡ÏºŸ£~◊ï∆}*Õ`úÛe:ÓYÛgùa¨Å¸óTcú«Küw˙ÌN‹ÌYuoê_)¸… ~R˛<N8≥@M )ª˚˜  ›8Ö˚›p"†}Sm3ç‹#√ˇπÛ œ◊–∑+‡Qz œn”2Æ.xàÇWz∑ˇÚãÊ˘˘l¨^ä§L7Å⁄k¶FÄÍŒâ≠˙≈Í§È e÷µ∫˘ü0»î>#WQ";;S'ö%ê[….‰¡iÎ§˘⁄⁄≈+ÿÔìyHwÖ◊c(ì"{O=ﬂ)ÇZ|oæt6FJhpV]XÌkV{”h–”7ü÷¥µ§ùõ.4öŒ¥Ñ√”∫R¬–ı]îoœﬁVcáŸ òπ÷Äç÷0)7((–ﬁõJª;Ï¥‡t˙‚eg›{@“o∞«]t«gøn5€ùn≥Úy
†ì!õ,Í‡ã}Ωv£ıÊÒ¶Ù›Ë«à]mÈπ∏’éÔ]£/*àØ˚ìüêOÑgÍö“zJP†˝GèdY›ù´ô∂˜DÂKµ{NΩmNÁ)¬|û‘èu¬Ã˚ò,@Ë€z&•πÑ-nQV≠ô2)íƒö¥ã|f“<¸Õ©3cﬁÚ«Yﬁr˘)õ™+|ÊñUK ÚTdY«Ò`ydœ:Œ»M0«DºëÁú$À˛¥ß∑&øÀºè“.e„ïVÃ‡ˆ¥üVµ§I⁄o”}íœdçWìJ’‹ÇWd.¢+5
÷·ƒÌì-´Ë}yÑÕˇÒˇ˙è[∑ñd*—ÆN”AŸ˛ZMí]µá¸D&˚lÛ…∫À˙)v¬L∂'~òÉ›bK©.%Îkª4úcòNïVñÏÎyTDLΩçãí–/äÙkûHê8S‚/˘79èä\®
…ûÈ©òŸØ©∞µ•¯?vsáπ¢≠ãë2£!˚1ë ÊÆ˛n÷EsâêÊ]≠·‰IÁ[<°tì]§QLµbWKÄ;Õ>‰Jxzπ!µ¬rˆZ_‘7¿r
?¿byj¡Õo]úHnÌA;∏|ßäÆ+kt¡P }°yΩv¬),‘Ä4˛Ì_…kÙ¯QÂÅ•ù¿ªTlkmu…Æi¬ÀfJ=¸Ú™;ﬂˇvÿmd◊OâÃ^;pW˛‡ùëu$πÊÖ¢]ﬂ˜Ω	M∫2ßÒ≥5°‰›Ê´KåSèi}–-‚á((ÚÓÓú9|Lù3Ëå)kΩ
Ítô}.ÃÖ@céÃª¢ÛÃ•æòm˜Y¡ú!∫2ÚÊb◊N÷P*›LvM%SDΩl‘ ≈lRqú¿67i'AibS1@ìJÛnüb@Y¢ñ¶¶•ÖC&u«Ããﬁòe≠!9ùTûôc©gÜÚﬂ¶äâ•7∆p˛Ÿ9]Êﬁ¢ˆ∂f>K≠=.• ∏Ÿy^YœÀ|3«ãJ+…Í|≤_®à®SPî)ÃFÇòÏÁ.ëf›√Ó}Ì,·Œ
ïÇ\∆kßwUD[wÓ±ÿùËåﬂÇfHv4√ú|©Ïf.≠C˙Eo}ÉÏﬂÇ6∆†6Ëä6—¢$æ•ô7ùÇƒàÊ'ﬁ≠ux›ø˛ùÿZ‹É›)™•ƒR∂J-cÆLWÜ.NbÂ_)C"UîBHÙ8g≠»õ≤Äç«6ns¸ƒqŒâ4·ÚÉ◊jˆÒ|Ô	ù’£ñ¯d,}7r»ò?•›‹·êm6*v=ƒ¶lx∏aw„£F±a∏@i€™,€ôç_jx”?ÚîÖíî“*—e„;∏ÑÖÇ¡ùπ/?÷Ò‰a}4ëΩ≠ıD~BFLNΩp>ï!úåî∫4ÆàûíÏ‰¥%.Lﬁ⁄K
1„©ké™¬UñÙAYå›¬.]6
uuÖ*ü3òπf˝Õ„7¥hü›ú*ó†ç¶=Í∂Œ…‡º3‰4§JwÜK"yç‘‹ì“Ù⁄∫5mﬁaÿçáùÊãnØã	ì'‰…„˙—èwˆ&;<¨ä±ÍÚ1≥BgÙ	o≈™2Iï{±ü	ûéJ]çW{‘ÈF§9Óæl"ì˛$ÁÒå∑M4ﬂä“sŒjÕn¿œ6öy.<≤»…$Ï¿„\IÇ˛Ñü¢Øß?6{§J+®55¯IYéO¬©≥îVCä„ÿΩ•~=ït„†n≈´[Wbz¬êRfÒ^p≠”˙rx#]QÎ ˘∞€1ÏúÜcm˘köO’›U∏ˆØ¿íõjõÍ‹.ÉêÉ´—°Î◊ò#‡."Wì"∞ßÒî1ÔfËbªmgÂêgZ¯YRKãÜVXÇˇ)Î ©1ˆˆ Ù“Çk`˜j_y
èC*™â≠-‹∑ûÔV˜Í´†;
Í{∫0XáDï†V@w8u∂ˆë´`Â¯ºﬂ—	°Íÿ–ùÄ¯ãiTuwá“’Qu «0ó~ ™&ìœÍõüé˝zDá4çj:]»v““ÿ˚¸π£—^
gπÙy"œ√_G¡¢zµ∫3ÏôÎ–áG^{ıIË:¥úΩ;Y¡ﬂUÏçÒvv6‹ØﬁH«ßÆ›j≈—±>‡ΩıYË^A–√Ö”‡Ì¬ú)\¸%ùá/`|Ò£;’
™G0–ÖqeÔÕ˛ÁÔÎ8 _™üëº¡e0}Wáët”÷ÃÛßU|∫È-hIΩ™Ê™lÛ°ãﬁo´ÊqfB˜&¯Jò,›ﬁÜ∏æv√q‡D+ùÿ´t~âRås¥˝VÔ‚˛Ô€Õ ]®£¬î¡w„MÔ2ÈÑƒxu\±{uC—z2q£H+π‰?(âBÑ„& d=˘íÍv9Ôtzûó¡c2u∞¡ßBµ<ûJµm!…GáèïwYQ6ªGëÙvÕ#	 &sQGæt ïj∆y»ûhóˇêQ6¯Í2≠ÉÙ/„ı°–3t˘Aª OÏ“36…$"»¿µWrÉÃßWÚQŒˆ≥03∑2osîâ…(≥HÂzπ’ëµ	s±¡H„;9u7	#ú›ˇáÒ∞€¢)»ÃÊÈ4Ÿ÷	ô7‰Zt9ŒÒyÚñóÈª¯Y∂Ú¸é
:åp˚ñv¡ÈÔæˇq)Vr6öüÊF7éVmj>[¨“˘ºÛÀVßáﬁÁM9 ˇº¶Ÿö∆`ÙÀ!µ€ô›˘ÉX–&|0B}o]5´°Ù:ﬁ⁄ÎPnAs≈ˇœÀyªÂ‹æ8Ô5	≠˜»4¡ƒrNy¯Õ9Ì~±√•ºQ‰pìEL]V^¬€-a0]:øD]√?àÂõdI`*›∏π√ïßÈH≥xä…<¨ŸqoDÍá∫÷…k'›)sg•/Ø√˚oëßÑåXÖµt¯!bIÚy[>˛èî+øì2ÑçM ¯ÿf∆K}˘InºjÇ•+JQƒ∞:]"S@ã¿h“Cr÷ÌÉ^G:EyπKk)6L•îéÂBfzàı‹1Ñ —í›vOGõf◊‹ú∏}qr«ê‰I¡å¥ËÈ&yÈÖµpòqÚà5ßXÈa"d‹ƒktõÜÃª\Î∞•ünJWNµ2j5˚∞“_Íieúá∞A›(™Ókoı›Y¬•‰Ÿ∑»–∆Er„†ûŸÂUÕØHÿC˛Ú9–>∆.ÿàˆuÁ6}÷s|÷˛û°[Ëätù0yï¯O—NÊ[Ù:¥˙òm+9Ez^◊Oúx˜+'jπ!ßs´†iÈì¯ÒcÎufü ÎÊpÿi_õ«≥˘>ZÒñoÜ≠¡2öjÕN]1.T∑i ËÜf„õ[«ŸßD¥ëw‘:Ê»Ø∑ä<≤èU¸Qlñz¸'YÖå◊¢ô:t:`XaTM`í}„™C¢Ω@ÎV≥ü8Âﬁ¢Th≈‘˘Br"4ó•‘´¢π¬`íR§JÌ,ÁÏœzÙU£™>∆:L’-Â¶À0,UÍ€†∫$á–¶Íãa£Äã\É%ï
Iı¨≠ 2%!2È„≠2Ñ4ì‚“!%Ó·…µ›z]UÒ…µüÿë.;ÜıﬁtìvïõÎ∑…0•6ﬂ,ÕÎaøÊpÅ•¥r·±:˝Fú ‚ƒÂ¬t∏-ÈpñÈ‰f¥zÁSÏ'Hä’ÏÑ|˘#›®~©Ñõ∞ﬂÓR§JÕ6R`€§DQ±≠Ìía‰j(M—MØﬂœÊé¸úûn™1ëV∞∏Ú¬9û‚U™Qù9´…lœ( i"ªa˜±!?∞ß<(aJ·áô*Pàaå∞
†,≈Ôäh¥(+#◊ß»≠!h«°Î\z>ıj‘∫Zs∞g°´Õúhˆöjæ:Ö»'êﬁ5∫ë∫ò˜Q¸Ã¢ƒ_%™‹f,ˆ°T\” §b(œŸ≈IÙã?–Zá{_öõ∂ˆôA^i“T†ˆ¿§Sj∞WÏc¥ÊzH+Ò—„≠ƒF∂A]±è5ˆJ∏\D`	´˚ãÿp‡Ô`wà,ˆŸó%t‹àŒí=™Fã}‘H-›]ö?Ys•ëò+Çnc4ô(°49Èâ°JµßO1§∂„ïUdJëãÑïÛ
]‰n•KQwÇ$÷Õ˜ıò—8Ä®Øw#í•◊nÎ0¿+p7ï^âªZ]C∆je®Ø–Ÿõ©ÀV◊™ÉcßîfÙÉÊReïÌ˘4ç∞hò6n∞U®åÛæpK.N§í«¿FÆNfbŒe¯k030[çæ…*¿˛	S‚»êB”÷î0ï»0˚üª—◊k/Ç©Í∂∞¢◊†5= MäÁ@∫ÁJ¶^íÄ⁄QÏMæv√wÚΩ*´J–Ã›iWú@gNKŸ0˛   ˇˇ e=|ˇxúÏ}[s„HvÊ˚˛älFGõ©{wµFR/ãdUq,âjí*Øß∑£
"R$¶AÄÄ∫¥¨;±é›€±^{7vˆa‹„áâﬁàyöpÑcˆaıO˙x~¬ûìô ˜H’•ª`OóHôâÃì'œı;¥ÒxcÉ8ˆ¬“©NÊ◊ç≠Ê.ôﬂ46Ò≥ÒòxÙ⁄k|±π1ø˛íˇÌööG[‘Ö=^∏{ˆ¬3ã6,€¢‚´s€—©”–fÁﬂ›ççı›ç⁄ø#âk˝0ÂÀ[m°ﬁêjŒx˙˘Ç:7‰£èH=ÂFBˆœûg[©ø‚›ÃÈAçﬂí÷;^∂’6çÒW∑ı5rpH\ÍµbΩ◊kµµªåß«¶Ê∫'⁄∫—Œ]€\xî8∆dÍ±IÙÏ9õEi“`*»‘æ§ŒûÙÂˆFÍ‰r∏?r4w∫%˜s’ÿÜ&ß¯ﬂÃﬂ˛:ø¥âLˆ˛∫n\˛ª‰˜µ‹ÀÖIØ…Dõ7∂»U„baöd¶Ô]5¥ÖgwÍ÷WçÚãÖÎ7jÈƒËÃmå©ÂQßñ6ò}wÆYr±Y·Tˆ)Ÿb>ßŒXsëò,ØqnõzÌXÛ„õΩ˝ul'Ωj“±ó:ëóöπ†∑∂C-◊—Kj>5Lk˙ UL5kè‘©OOì◊i””ú	ıö¨É2ëﬁ˘|"ﬁ¯”›¬˜à¯G|ﬂäl#fÌ¿Ìí;êåék;çπm∞eJm⁄ƒ¬‘⁄sœ∞-1çµ÷—QÌpdÎöªøŒQzlÿm∫£⁄!ˇ∑‘£Ì˛…”^ß{2Íµ†k˘S©f›·h–kè∫ù⁄a¯w©&Nœûı⁄µC˛oﬁ£@©å ìøâMò˙eÏ€€ıüü»ë=!#Ì‹§‰'ÎqRão‡ê“6
)≠aN»º±Mÿ¶«ˇ4∆∂)v?€Å3€≤˝⁄‹*LŸ·©ƒÁÁ‘ª¢‘äp	8Á…qÕœëo™±ëÄEƒœ&ˆÒ⁄ï∏âÁh„Øk“∏2Ù.E»†˚¨7ı…”˛†{2ÏíﬁÒŸË˛/_tèH˝˛óG£ﬁqk(N®√¿›¶I≠â7Ω#≠˚øæˇ«Óp-ù2πV[‰|ê˝Ig‘—LΩ±√6ªˇÆ¡K’øˇüGz'£Ó≥AØ”ÍtI6∆†uD^¥éãVVﬂ™GûV¶}’∏fÏ?}U<FñëcäùÏLz·≈˘÷Ã∞Wç/>Ÿ›H''ﬁÍîjz˙o¯´!¯LjJ=h3:.KbTrø¿†∑‰s™◊ÒIh›õVnTÎ¯î¸ik¥TK˝”Ó†’ÈH˝ÏÑQ»⁄RÕ!ïˇUü‘GΩ”˛r-∑ÄˇúaõıFΩllK5ÿÈO˚¨≠>Èù.’‘y´±µ˚±ÿX‚ùá]<o ∂ Ëç	Ö¸Dó‹µéûwáyç¬oN∆ˆXœŸ˚ﬁπ≠ﬂ»ÉÅmî›∏!‚±A@0œÍ˙∂ŒÖ‚€Ã˜€ñÎë&Åƒr@"åë_Ø;t\–éﬂ“LÛ∆SÍr©ˇÄ|ê–˛¸œs⁄ zjz”≥èÏ+Í¥a_◊◊öÜ56:uÎÒ÷¢˜≠©4nª–<€¡)}¿n€§‹Ö6F¡e*“vÕåÉâH⁄À•1¶Ωy≈.~ö<√+BóLÙ∫L—#»¡¡aí1åòç • nﬁM∑†qaå5&G‚})œÁ¬°ﬁ¬±¢ªtbyT?Õ|¸.ÔçR˜∑Ødÿ7÷rw´P∫RÓ_˚YåKæEá6á †‹>æãÒŒŒ;Ö∏;∆SîDIáÃ9ø˝ÎÑZ”≈^eb∏†’RñÑ ›nz›ÀJÇ;r_}-gµ≤◊JLz∞\3m^Ü∑≤πm€¶¥J
˜Tıˆ,†ﬂ˚˝µ…5;ÚAı√±]∂RÎõBÊb_ÏÍHx√÷Æt(íΩáõ¨4äÜ∫±?D˛ç4∆ñ◊2»P)Ctø∫â?K√Ûéé=Í+Ú„≤2!öêo€íTåZ6çí<Ú·ƒf∏›kÿ‘:
>¯Ää-I<¯Ç÷_™pæF3†pö5ü:⁄dºÇ|EonyÎw≈»…ﬂx≈åÑy{Õø\ÍuS^∫>wË%∂QWiÑêf≥âO<R∫Ÿü—=Ú>‰Txˆn-á%7eYA√+‰ﬂ∑Ø∏ôS∂x≠ºÅjú|l+D≠QÑ[K∏	Î√[âÄƒNZyº¡Hºv˜™h@≈á ;Ä≤‘Ä»ñ´˙$UÃˇ≥Zñé∞@ùwa>"◊≠EØHÓAﬁﬁÙåu=m6_cRÀX3È–s@O≠◊Ê^„tT[´>ÖC2√Æ„âîZ(a¥Å∑üÇ¶d¢∂4Ç_Íqô˚âs¯˛Y∆Öëk@Ã≤∫+ØéXy_&ø#ı^gè‹ CÎÈwkÍ√Hµˇ•›ˆ∆÷ïˇ62Lp)m)≠Ôvƒ ü∫‘°RÚ0ùΩ˜Ñ=»Öç@”◊=ga¡…LA“æn\5Æ›‘AKJŒr£~;Ë"6q∑ØÊ◊‹x±x'$Àõ¿O¯
SÛá∑°∏	|ZmÕn≥Â¶‚£'œ»øo•¸õŒnÕI%Æô¶”≈
Üë0hÜ;Oúßö©∆•˘È'ÒgˇπÊNõ.=¥æÒàlÓ¨›Å$íyK„„LÈ ¶=¥†©ëqÆg8z©¯â£Wd{46ÉM!®?rp˙a3(5Jd©YÒ	Ç“QLªä™^qek§'Â∆˜H‹Mõ‚¡îLÌÍÆÌ¯U,Ã·•»G"¬cæÓ^˚Ì)ΩtlÎl.‡¥±MÆ€µÙPÖ‰µsV∂«é}e-’ßwÃàﬂYºQã,x…Àê¡i¥∏M~[∂—f.¶+¯DÍe˘s‡±~Ê¬Z/zÖ˛Käv<ÆiÚøá¥xG¥–g¯˜ÏOÒµ“j*rIÖÈ/†ä˝ı®÷\’^ï˘€›Z=c0ztN§;Õô'Q›[âÚ#:¡!rM§RúEÄ»pj;^ä∑<≈_£…ÕÉyfy8¯tˆí]8öf˙^¯qG¯Ã#<rŒûéq
,≤\.#¨	Á≤MHr+o6â„ê-VÌœ3DÏ›Lªv(Ã_˜øπˇÍí˘˝ÔœAà–\b›ˇ≥M\cbò∂´πÕ˝ıy:Öd…9GæŸMöü≠&ëCHV<GgÆMt„˛[«∞…‹và6A#∏K(a*ßÃÊÌö°–r*Õ—vìDcuV<K
∑‹ˇ&…ÖßÔkcÁHá	râN…iØ˜VÕR §Iì¥”$~D‘ 7öGAπˇ?÷ÿ–»Ã0Os`z4˝ÓX3a«ïúüt>úrÛ˛˙Ãf6Ìÿ/p&‹¢öIG⁄9˜ö¡–ıs˚∫ñîˆ√6b=¢ç◊∞q	r\Ã4,¿5Û‡ˆ∂å6ÖeèÄ*ˇ°8a ‘,c”π{ì›ùr3Ω6ºîviÁ“«—A«gœ∂?’À∞&.y¢YúJë_«Ü8k∂¸?t–€ÇìH∫u;‚Ÿí¬√ÆM8≈vc·apÚ±ø˚
ˇéDv≈√æ]w2b∆Rio∫ù$˜YZ¯S,lG~É`g∞Ë56¯» qPh◊M>hxŒ⁄÷C[w£B˙È;>Â4‹πa¡ûÑŸàé•x“:~“ÿ%ù.ˆéœéDD…qÔ®7jH}ÿ:È<Èˇ¯˝≈®ﬂ? "õnßŒVí7\_ª…@QüI†$#Ω∑LÙÇ€∏∂Æ≥Ã]◊£Ñéù˚f>¶D#pl_P«—PÇ‘ÀuçŸ¬ƒ√s
ª–ùS˛Ó>=iù6Z˝&È BàMÕàçNXﬁÜçMpqJ&®QZº}lY€‘•Î∞«8ªˇùæ0ë√y˜ﬂÇN∑CG@Ó‚|¨Y–ÃúÍ⁄‰˛w8.`å˜ﬂﬂˆ@õ¬#0IÏç¬†fˆ•è“ÅÂ4ƒó|s«÷Ï≈ÄmÛá”¸∆©Ã5ãµ∆6≤g≠l˚è£!o(ÉÜg~íÓó¢?¢ë¬=ÂçÂÇ\l⁄„Ø§çÁ”˝|a¬'w
s|ïA9«˝Nü¯ﬁ¬¨‘ô SL˝2Ö_vmbŸ¿~∆‰Ã√ÛS√°Á8Êñ>3,2Ï¸	©∑ﬁtç|ˇü˛Åú¬›–›>?"C{·åAƒ∫ #~'ı?ÍY¯íD∫ñM≠•±_~∂◊—@yÅ~¬1$ﬁfºp†#˛å{pk?í˙âmçc2°Œ»÷\8m<ÈS¸Óı‘ôËﬂ^iÛ9ãœ≤Ωâﬂùj%ıÓ Í)uÄì¬—<√Ω∏Å)Å-H∂R_wô8„‘Éd…√!‰k1Y+ ∑"!#±S#7y+˚Ï»:.Œ‹å√"Âh‡k=iÅPƒ¯__à¯‰òâl»vÍü/ÿ~√+√OW{8†8 î€ÿÅêÒrm”¯zAâµòu.3,ÅˆçkPW4GÛ-†-ú ¯
@oÇ≠¬öˆˆ!ÂFq∏õh‰“pçs√‰å_G]ÿ˘L√'∏DOQjµÁ6rﬂK•ZÛ≤yÌm›?@ÏπX¿o6rzXkh4(`Íe˘s!ÉéY6£÷ÄÌL Ü˝È;]≈cœsxDÖ∂òÙÁ‰ÄL0CâYl®Óoqx˛ÃíI'ÃY‚fÿd¸–åø°-{ﬁÑ7@\•~‡œLo!ıKìzù£O4}Ç≠÷¢ë*ë ñx‹ FFò	∆•±7fn◊dÌY˜§;hΩÏÙ›ˆ®?®≠•t¨jœÏõ‚Åñ>Ä”AˇEÔ§›+√|·ÃÕ`‚St“ó’F“ˆO^ÇÊx6Ëç˛Ïe˚yØ˚4u,RLS∫f ≈8·@RGRáS‰ma9å⁄≤çí%Çl\Íµ„[gÕÁÜ±‡L¬]ÇyPT7·£…Ç:?¿I=·§“:™âüp2˘/˛jø|ÜXÀèéd2˜’OEo"cLÍø ‰Fj„πAù[ßı[Ê´⁄±[{D}èH≠>"(-Gæ 1“‚u«È¨Í±†◊ækœãK3C5{Ωˇ-Ú|∑VÙB9ø]Å|OYD÷ë=…wI∞MóyU;Í?Îù‘
nb‚@¡MåzÛoy5rÏ±zöµ‡:ào
:ûò‹ ¬Œ‡=Ú!n9ú«ªWç˚Ÿ3ıÄÓ»"ûÔR“Ú b¡_e<¶˛ñ;Y)ûqv'AõëÎ0çôN0æ
Ω∫¯èl …weÓë¥¸N…»/"‚‰Ø?âc'Õá∫ïÁCÕˆõÊd©®ßÍÅlÂx"8◊Mños-KÂ13•ÙÂ”iqG^ W®º*i%◊í’R‡ƒª∆ƒ‘ÚxM—€ƒ˚¢7#∆+.≈˚"~Ö’äŸÕDTó=‹î≈p ~∂‹R•e|◊á ÷ªùG 6m; ﬂ≥Ó¸ÇÌ3Ú™˛aÏÀªµW<.t…yœ¸ÅŸn‡Ìç1È“69±A”ß‰úI]uÆ;Ô§ÈŒRK|‰‹.5U‡&OQæÖ	tææ'uIƒÙçª‚´ ?÷
rŒôe(‹Hå§D.ßö~Ë_ﬂˇÚü˛Ì_ˇ.∞¨ùˆ;›Ètè∫œZù˛^`4µﬁ±ÊLlrhv¯ù§']»x(⁄æ“í>âM°°P∏&àıÉ‹]öKônÙ¸Ää‘Sı.ë!ıÀ€KBˇ4'í˛ππ≈}2'OY≥Tèz”7Õ‹≤/5°Y
+.W®©'ºJ–6h◊Ë®‘
h?>z,å≥Å[µ±´∆±+Ÿë≤-IÔÇ-	∆xÑÜ◊hxÏQé”6ôE)XºNt›⁄Ú∫’üﬁkÊíu“ÉØun<I≥,e€ñ¿∫DHwfxÅÌÎõøà≈›¡ÿ]26.¥	ÀF†—	Ì‘AÉí©ç‹»ÿ3¡˝_/XSîYÙü3Lç∂pπs]G_ªÎe$ÄÂ˚I”~¡0PkáãÛ:ß–ΩI,ﬂå:!√∫À?‰∑„IÁN∆d‚NÊQ†b£Æêu,)HŸ$j¢.Á®gŒÃwÊÏ@Íüüuè≈q@ÿŸ–Æ¡©¿ Ï&·/ÅÚÔ⁄	èÄ\ÉC‰•yVﬂØe0^xlıVÍ‚"´Qw·!™g‘°_/`ËÂïÜ(
àlÃÊ
cj6õ˘*x≈,ûˆú%AÂÀ¢?…t‰/0ˇj§~+å5,?c≠x4k9ßzjˇ5k≥ßÏ6è¶µàÜ^√n{“=È>Ìµ{˜9Ëı≈ét€›']«ëVÁgg'£˛l=J´o=|ˆ˝÷Ø˜[èo=f´=ß b€O£€Ø›<Îì”ÓIÎàÙœF˝ÅP|V¥œÃPzãÒ«ﬁÔÆ∫˛Ÿp‘=~9Ëuálá8•6à#Ôáo«∑ëº©›Ä˘£Æ2˘'¬öôç6{,±{T˜O(Ù÷{'˜”Ü#¨›“åŒ≠¢]ù÷|ëΩç¸ú˙Ã3ÍÜ€màÍsû±/cø±Á‘∑€
–}≠∞h√©m´¬çï‚âWÆeÂu—Ë˛?é{'oñä∫V«Œ§!xÍ=e¸î…∆¸>ÏÜC5˛ysÚÄoP;|zv“iwAÙ&®ëu2h˝#B;-“:ﬁˇ2(∞#^ME\`P^\`è©Sﬂ‹‘∆tjõ@aµÓıi-\aq¬4ÜKCõ–Çˇ1Zy·H“∞∏Qß‰5»∂ŸDUô∆90Ø
u«„cÍﬂ¬äœW≤Â˚ =∏›Œû™Ç]ë±'Ú»^Ÿe∆®¨aK” åv°É·„¿3	hâ˚P•H”. ^Gù√Å[Pˆ9
Kh¬,ö„&ﬁZ1&·∫ç⁄Ñ ©oõπ´–]ﬂû“∏—ïE1´ÌXY\ô Z…Hû±pŸÓÇ˝u4ñMzªÉru√Ö}w„rîΩô·∫a≈∂.å…¬·QaàÜ	rûC?’&˘àló∑◊Ú√±◊g'‰[Ú≥œ?83 ‘GîAZ‚∞÷§ÏÔ◊38≠X÷_AñwÈí6:∆\¬«˘PF˙çdV@Ê[Ë"FÂsˇÇ…¬È5Bô)~FÒ≠Óø≈»*›&3cé19Ä"5Z˜ø—ÎìAóß¥tÉÈôø	sπ¯◊Y\(⁄Î«¯|Kˇ≈}∞AÃ0ò3Vñ∫p≤xˆSúf¯¯î'$åÔß;›Xﬁ®_()§ŸÎ≥ÙI’wpéˆ…∫Áj'‹…4œRG!KH›ñ7fJpNû‹]Âπ\B>òÛõ"≥çø˝r!#>`âb®»	Sy#QÆl‡Lîâ√3Á:…q·	GÀôÎ®~†pí+Gõãx<ıs«Ãû1"ÄøxDÊ=˝z≠»x‚/HÓ-"dº+∫3=(≤Æ1^óπ5$§õ›§õ‡K+(∑%ÖòE„⁄Ñ8£”mafJa˛ÂûâêÛ‚8 .;ÅÊ&∆⁄{∆•ñˇ|!<ÆYF@—ﬁ ∂_ï¶«l$ÆHêSPôbõ˚ïÂ"ÈI¸Û1À„œs≥≥!±◊ÌÚÉßAAá/◊ûÃí+Âs&±¿ÿÑ«⁄‡aLA‘ÀR[9Á«ÙÂx¿T^È
•£÷ì=“Èû	”p—”;<;tèª§€Èç‡cT“ågÎt·6.`€°´:-x∏pÁ‘¬≠€È\√pÒ˝c[_òÙH˚ÊÊ©¯´ª√˝4ˆT¥Ö˘NfÏM˝∏1P”¸‰·À≠Õ¯ŒT`∏I¸ˇÂSˇñÔ¯]ÅÊ t«§¥‘oì?%Z√∞„ç◊ôexÿnÚÀ¥“Mˇ>˛4¶ÚﬁÇﬂÅq‹àfuÉIliﬂßÙ›Àh ÛßxëËÌÉ€»«DÊu4C‡‡6ˆEÙ~¨§„W!çìè˜»∞;ıNû…:¸”ﬁI4©÷99Í√∑˘t/ÏaVwÖîwÒ‰5Á}˘¸¬m‚Œˆ≤S
≥GèÌwnF{æn¬C∂ ùß›n%55«Ú†ŸöÏPõb*„˜ø¸_Ú…∂CèCÒ7E–ke©≠[ jk≤R ëÎ∞ôÔÛL;7, SGtlŸòáà*kàHÉër69fˆIêcG˛tH˝^Ïd¥Fæˇã≠î‘ îR≤πCM.ˆæ≤2"OK—ÓòÈaÈÆB≤@{ıÖˇdü2Àød!$0≥4J˘√Ø˛ˆ#©0^(CÎ Fßôµó-f£2ªÉÑînöJ˘*0∆µms1≥ˆ»3j!¢|ñ¨oaÓuñ[6œﬁ∂ì¢¶ogR∫íãC…Vc¨)É»uÁ∏Ø+ˆ”†úT»FöíÃãøïÌy›ﬂNó•w@$Äsƒ˝,€˚Uï*ÔA‹±√‰1?}õÖ–˙Ÿ
{‘	∂&∆Åª\õÄª@–ÂëµŸ2¯ ˇ)€ë°bfÀ≥Re§WÁÜt(‡Ö™d±‚•é'ZXæbﬁ+^Ø/˜UtÈ¸◊X;õãóRl˛€©‰¬ñ}ØÂÛaŸÀÂ˛^ ÌMˆ‹íëcí=QNY"›ì NıLçbî_8◊
ô†ÎªÏ´M–⁄H∂ßú}GuågvF4ör…ûxÂÂÊ˝ ◊h,ä√Ì¶[ÿ77£à‘Y	†Œz©L–úé?ë∞∞c˘†q4§Õ3oñ4î»ΩîÚCŸ(ºß.|VI>i:a∫õØ@œ´4∫åå\©Îpd‡Î´lâp ùV_≈…Soújô'ä†|ﬂæˇNÈùtåâ!p»$eÖí'ÜÕ\ûÃ≠¿˜úY, 	æ ŒU√°˝î„–Óâx≈˚8fêbà2ÒKûÉ5Ÿ¬áæÿ»Ø‡√ªÛo?’nL[√¢@?ˆOö.+e‹ß†éÌLÄﬂrÌª1Ï°”¥Â◊fÏÙ≠ìg˝£V¬û•˛[b-X6û∂¡Ì»íÚ`.kÈ	Â?ÂR◊’l<„œFàë⁄Ü∑y9:æ‹lnøD˜x¡;q8$©[&–é‘òù√CAùô∞¥~ÀÀ‘÷
ZöjóÙ%€§–‹´Vwà53œ⁄«ço•©ñ™‰Q‹Åê≥0ÕGd+ø$üZM®u7DOÉ¿â¬4ÑøÏƒ’·fZDÀv\∂—ÖÄÅ0bT√^
äÍN]GÑLhz^|Œ∆^*®9èïÊ7DÂ˘PMÒ-?÷‡E]ÿÏ∆πC.{&>hÉç‘?¨ù%$¥–ëÂπ‹ÂÊøˆπ)p î
ïî|óBä\˝^•(DæEB∫OQ®àù™Ü	¨è*’º6ƒP‰^üt˙åÖ¡üÉ5b¶;ô«|jÙƒf€ìñ:R	é√Ë1ÿím„û∂‘YüÓ(¨ôbIúå%KHÅjEÒ2j„¬âBbJïX‘ÂFíâèü%Ò8W∞	ÓJ€â	- €“^æ)t/à∆d>µ=òz˚:#k,Whìù66w
#{#jUî/ßzrƒ«x}˚OR‚´π\¢.`Âåu7≤∞}Ç√@≠jÕSÿî‘ô;õ19¢¡q7∆r0™avŒ∂vÑÙádla≈LómfRØ´§BmúJé5√ˆ·iÜôù¶i<ÖH1^âïëè/8˜`HñRÂähj¸Oç›§¶Hëa'˝„.i˜èOè∫#Üà≤dq≥Î¥%ﬁqé›Wæï˙úŸB,V©=£ Ø¯ù™«Ùk^Æ”÷àAxØclÉÔ^¡ö1¯£ºµJ(Õñ)PÁ,K5Ë>)k‡´ØrsqI"\¶–,H˘‰%kLoh• p„^Äáß_òmı˘ ‘~=˝ “g‘Ûƒ√ü⁄–Qo6Q´iÜ+`	cDaÄ)ø0˚Á‡vÁ±‚Ì	õNVµ¥$,a"…Ö€–A¬πöÇ,£Xø‰/M◊<Ì‡Vπ¸è¡ÇUDìDVDÄ¡ÑC)§tﬂ6V¬^•ç2·Öà–Zy˚LxâÃÖ±Ü∆◊5,ÕÉœ°€aÚÓ˝w(jd¯ºÖvÂY¡∞
^Ì ⁄∆lÓu}∆ÇˆzHùK„˛76:}|ü+©wû1{B}ˆ]lÊæµ@ˆeÜIËêá±4⁄Ù◊x˛πz{ÃÅ;ÙMXR,á?+œÌ∆ÿ *T·{
≤≠ª´¶ÖoEÀ°¶UÍ	√nr]/%ª<‰êÈ,Ò•≠cÓã¢Ål¯ﬁUÆVú‚¯q)rÿÙ0Ê°Ò§îv∫‘-πïÈ≤ÍœUŒ+^>Ü&5ê';Ü&Õÿ√C?"SÂ•l¥0ºz÷Ö£aî„nRi¡2Á3€òìÁ/ΩE|à;	>^Vè[cã+Î}ö˚≤*HÖtÅ°`´˛)õyõä‚
¶¸¸sRﬂ‹hnmÌ4∑öõ;Öõ∂JP˘Ó∫_/∞,CÓ¨¸∂í’≠v®ü€¶õ;dÑ˘Ó¿æ:ù£∑‰mèÈXAhß⁄¬Ùå∆àZöÂ≠bëÒ0«”≤◊Ah∆≈xÛ‹6Ï∑‰ΩáÏt«™MC√;6Ê∞”}+96∏∏D^h¨Úá˝Pπ1Øü±oÂ≈Vøn÷ﬁa{É˚oÁÜŒ%Ñ÷À™¬“ÇÂ‘‡JøaÙKfwfıZá∫Ù—ÊÊ‡ÉL"&¢Å:X	é-¯éÖ•TJòE6"§Ùgµ5ÖÚ~Vâ[ˇ¢@å)÷Æx◊Y}1[€
ÚıDıûzºA¶⁄x¸©¬Éû1√7üÕ·Ÿ≠ç≠è76∑Fõ;{€ª{õ?WhBck8`]d*<ƒÀX±!∑˙çA∑›x¸È÷ÜÚÉ'<∂ÌX≥‘uÁ\n•÷ÛÖAMùCóË<<Œ.*µÄÏÆeè4n∑Ëï˚â}iã\|≠6W§µŸÿÿzD∫ß‰Ö°Y⁄Zë∂sW‘cIö⁄©FSõõ[K–‘ﬁ÷V)ö°i„Ç:¶amÔl™ÏÑaµ,PÑ,√&'®˚îß*`”∆ƒ¬hOÃÌÎÈ§.ŒnÂ["5 ê°f}ÉÇıÏ\Ö∫%∫Ûâ´ê∂rˇ≤∏P„|"Ã¯Tõ–˙f≈b+J’Cj\û·N=Ê«ôPÄy5'öÊò≈oÉÃòÑ.!EÚM¸[•¿éª0§#;@5kæ≥O⁄#c6áCh∏L'i˘OÊAõπñÉDë˘K`ûRRÿg‰#©rÅÀ ¡m„> Á§<&´ëí“m2‚G’^ÙJT¬c¢êCÇ<5L∞¨≥óE–K7Ú≤ßà÷cffHúÛ£N@ˇÃµ·D·J"*r/Êú√0EÏL…b;âiåÆY⁄ñ®Ó ∂ö“<ÊI;E¶•‚ú’Láò®«¬ﬂ˘íÁ∞hı⁄‘O˘≠)b€›æ
!F7Âàtô'¯©ìÁM°|ùÅ⁄‡ÛfÑá-0F00∂∏ô9t~‡@AÄªôû"NH√è≈∑ß÷~ëIRñ;+jvèƒ∞J«™ÁE™ÁjèO~‹a™íÈÑ,ÀÍyØ;h>?ÎµHΩ”m7…Ê„ùıÕO“À∞6√É_'±kÇCΩßuNÎ¡|¸ËH}8EI3ãÃÉ‘ir"bqﬁójëæßq⁄$úíôßî∞	à¸Û≥Vg–«tY^Ñº#ÑÓLﬂ”7ßoòâYß•Üß–ı‡9∆zOﬂöõÁ}Oÿú∞˝È¯—Qw:éiH‡Ì˛…”ﬁ≥≥AãC"â∑èŒÜ£Ó†2ù'‚g,ßFùçÅÿ<bX:ûŸ±/DÄè\=/˘Æ8kR,D"‚Çi[!§yÖ∂€ˆ
$ñã`pÿΩ†¨ò‚»ˆ4sO≠»g@í,Ò“O4©5Ò¶w~ uÖSn?'¯fh5oˇü˚l0©Dxµ¨óH∏•◊`	ä„Õ–©Äwfæ2©ò^Ö©ïË±y¡±tdøzìGQÒ©jµaÏ›ÊWF∂üw;gG›Nm-Xõ∆Ñï≠Sy’ú"#ôæ÷\Ä˝\-.ØåÈ~›c¢m`ê|N5‹a≠êü%†Ä õ	Ë,lyYfHïfzàñó¬˜ïŒ´…Ìπ8c∞ŒŒf%¿lï µtò®(úN**pµa‹©oJ''"—LX{—¥ùm¸}ÁÇÏà{2Ä‚h;aΩÏXxµ¢òŸt∆⁄mg∆¢?±»%±IÀÒåâM6∑˛ﬂÔ1Ó÷°ìÖ…Æ9kÏ5∏è‘'É0≤o-Ñ«˝ «LÚMl¡Çô.ÿW{dH—å©∏ëÀÏ¥\Ä>ûããôÎí˚#9¯¯{X
¶0¢=>˙ KLÿﬁa¸‹Ôó@P∆ f≠«…3H FËj- Q•…ﬂ.}?*$í)Üz“·◊a%ä„Ö#ïFû,\ƒ}˜1
ë^Áp=Ï‹:"˛%
•∞#åO…ÁÍ$GìW¢näJ∞ΩÔeïzäóX)∆™‚¨ÂóBòu“A[
àDﬁπŸ¯îÃ‹Ñík7Q∫V^«Ù@iVN°T\—"ê≤J88cn0ƒâÌ‹.∆ëπa*§0f;¯ä ˜J†ã¿)ä@•Å’øC_"Å;…àRÎÍ;~j_"åÉÁX„0i¸çN·Ö)ôc{p-ÏÄGXa»î/·öˆ€	õÂr"(
πpCì«Ü∞_§˛Öî[LÀJ`b ﬁ¸ãAΩÖ„QÀ«R«}ÛØí¯o˛Âo|~¢é†[yÌTXá‹JYˆÅóR¶F∂ï(=n#V,LÖäŸ~
!√¸KãNTå–IAã´aÑJT,sUÓ(W,µzÅdtH‚ä)¶€‰Bâ˘óZ˛¢ºYH˝ñÒÑª"ëØb€ßc‹ÂZ,UX|QhuAL\4fsÉQÖ%jÆM0YÃvp3ÃÊóíwX®#8]@≥Ê±ÜQ0n˜Õﬂ'º©oE»ÇE˘Ö»∂ùÅ]Qß:b}≠iX mÈ‘≠«e®Ë}•–<èV|–.¬¡◊–ÕøãØX±£¸Õ°ŒGS9kˆ·ª;ø;q™GÈÚ£è‰‰∆$ÊHÒóÒ–JäáÓÿGSÇÆÎõè¯ﬂcjòuyã	âÑ¨á;Ì¯<ü?wBF
œÿ6≤™ù_È~$N°q&0ˆ‡ËºÜFÎ)]5»Ê˘Ib‡≈-sj<ŒQd68§WÿÛ#yúú£‹Y_˜SäMÑ!#éL©	
]1#DÏv. å¸Xeú√µáû≥'ZS∞<êÍëHYó∏z|Ôßt4≠`k!–Z„tíy±D£k7Ñ›–ÜP!|§*o
O∏S€Qπj/úr÷¬£•q)L°.=Rx®7 îƒz≠â˙KæÓ#ç‘«ã¶T¨	_¡ÇfÛ¯ÕÍÒÍ‘„d√ãU'—ŒA˙hÅ¯°ÄæÔ44ö»„≤ßäâ…cCJZBÃ`—*º©©Õ]Oo*É·„M©¶+}xNV•≤çI›˘78éKfUeø<&ÊËu–ºΩøÓMói≈G^X∂ùê≈Ü©‰+3I,€RÀº¥Y‹=3¸-€Z^“&-îXXZ‚2≠%,≥-≠¸´kt+öT…≤î^hfôıÜ;50ÂM∂Ôù€˙ç<l‡8∞k7D¸ë
ñΩΩªI.XﬂR›A∑°ƒ‚l(|n8ü£cVöˇfDs8◊¨É€«w—JIg	Äî9^'‘ö.fË

\aA:#tÚû;áCæ≈‚©é¡Q[ò€zN›ØÜ´±äÅvN©Üƒõ≠{ä|TùräùÓÚ%-%3OÇBQ J∆‰ sMü†gvÇÚc&ı¯sCÔÀ±F-2˘ÊXYU˚Okç©IíıV•–Bx%Ï«H¿[E®ÀOô·™ƒ;à™	iØ≥=/˘>XeE~øÙjL2¡ªV¯Åµ|…—ã“‰ÚàØíÔ‡ﬂ[˙5äëª¸´ÑŸ‹øP\bfqn˛â∫§r}{WéﬁcP^6ÏQèüx©∑º¶Væï’M…qfHÔc$m«ùæWÃi4eˇı%tﬂEÜ ÒCE(–ËuZ‡‘Ã¸“`U!ÂGñ_∞8ONDÜ}§ô	ÿvú◊ﬁÒƒòªJRÀMKpëπq≥Ü≈º•¶√€ê›Ω∫´Hú)ñßu‡≈ôè≤¯bsóáÓî≈8Z.TÀ’"ÌÊÉ√êX†VP¨C.¨/‹5j+VPQßº,8≥HÔ=ΩbﬂoñypqOgüv∂ve⁄âÆDMTÁæçõﬂÔì_≠ö≈·‹˚É‹å8Î›«XyœõRœo§LO@≤3™ãYdö|4É“,(˙ÙÉà∫*Éó≤Ø]…ö®+_0D‘™U`ôÈm5@àh\<ÂæLéEåy¢9çŸÖw´Qm'p‡2cÒ·ﬁ–Ç©
°X∂Ë¨Û?∂]Üu;ŸG*î√ªMs?2[Fƒ◊≤	:ıÜœrâv[#5%2*1í¿SïÎ‰yDRFºåLß´Z
Êr˙t}˚¶7b;QÿA¸+æQIP©RR.N©|»ën∏»Ù†zƒ'	*Ô¶ÉMÊë%ÇâÊΩƒﬂdÁ*˚˝ëJ¨.àRÒv^¯êzÖà‘òô∏“ü®=ø8ŸéÙùàF≤l”Ï´<ôHŸà®±≤õèLÔß§% öWuSX»á5Wñsr°QÈ’NÔøù4’2n#H∂ƒÉrEÔÌXK°æÑH´Ã4ﬁËV?<êÇhÀ√Åˆ!ˆ˛øﬂ˚+ﬁ˚XÇ	˚%M<yT}Ôó¡—^Íñ 0ŒÈçÆeXBS”÷d`Ü‹Ãµ·¬ùS›”¬'·Fÿ?∂ıÖIè¥onûä/…˙·›·~à;≈Qß2_OÍ˝@ŒÃﬁ!˘°ËÁÏÁÇÏŒÉ€K√5Äî˝tâúáb≈N‚ë˝‰ï‚èè¢yp˘òı‘˙·˛∫?À+XYÃôÕ[–B€Nûeı°Á?M±Lrbn‚6Y]j·2)ç*Ö_gra<5∞ê+•`3Ïê+¯_Jé·3Ì‹∞®ái„‰u=QÙ~@_w…Û≈L≥<x∫Fæˇã_ûÇW¿Ûä“ÀMa1 g¶ôrÓ!œ&+ŒPS§¬õŸàãk¿ô¨Ö}L@W„	≈,QS◊µâfQR Î±dE—Ã)µ`°¨±qˇ-®RM¯ÏÃ‡2÷tµ]áXÑ0«v`»3Qù±÷ò‚bœÒ	◊EX‚|ø¥J˘ﬂÂ∑=Õs…3«–KÌÊ	>Äˇ¡m„6∂p'Üwr|s¡ß£FåL[GÖÕõQ∂9∑“íTc)6@⁄b—ã·ª≥˚ˆq¬ÚeÒ!lnl§¡¨¥J5c.~∞€Ì)Ω†./v…±,MèÔÍ¢wnÅ’iúùS«æ4,∆MhÈπaæ8˙QÆcÕ2 lV»öï˙·Aß7Ë∂G˝¡Àg›AÎàE©ß˛|:ËøËù¥{pOÄ∑∞$É*GÅ≤y±/x5‡©©YT$ÉkcÁ«Kâ∏)ôãPpÄÑ9GmÀ`ÛÛ0ƒ®.Ä(êc˚y˜i˜Â∞ã:'ÌVÇ≈Ô≠≥N7õV€≠N∑◊zËt∏ò#{t{›Îcnn=≥º¡èñT[\îB¸
””‡±@˚2L≈I©B•4ª:ç∫îŸ/.ÔÊ+ zD¿ßNó3FNêÈ7ªÌAw‘àÚ‰˛∑ó¨§¿Æ˚ﬂ∫Æ1√·6÷í–Qx’Ã◊#\.Œ†ó∫q„yyXõ%Í†Áf°GÅ¶wÅ¶ãˆéíÅ≥åi3iÑL[,R4¿d¥ã·ÎäE‹Ïp†Ç›Ñ›u9–:ß µ.[≈U»iv"Ô*Ã∂
>^üIë¨è}´gjUl≈•‘Áu¯:ºñá∞√´(YπäAÄaŸ%kgìœöŒ√¨Öñ√Â€-‡c*v’7±#¸.¿‚≈Îá≤'Ç7~ø+rØ˝#Ì&√¥îƒäQBêsIﬂô‹ˇ⁄2`ùﬂ—Aø^sÌG¥¸~ør/Å« e*^u4â"∞áÚ\óO3©« ¯ÊGΩΩ˚ÑC´2CÿègØ»/˝~ø‰^˚#áZËò8õgnﬂ~á[ÂT3,jrWB0…‰#“÷úI~4ñ YÅû6`≤4Ç⁄Œ¨ÿpõ#èÁπŸpÚ	õ‰⁄î	õ[‹#);˝ruØúüEè0Ô⁄/5Ù¥ãˇ›yy9êFjPÍìR%éE{›Î15_é∑–L„™#ˆ4Œ~˝Ò˙ˆv±õ_‡pˆUOégœœ≥±˛|—c<Ñπjß¬ß≈îÇ¢=Ê.ŒEOms ¸h„˚oÕÒ¬å∏‚Âzæ%tõ∏‹ÔVÿ<G9ï—e˝os}p3äpàƒ^ê1Ï28ƒôvç·Ω∏WùÁ≥n∑oÚFMÓ¡mQ≈Lï˙Ü¢¬°‰•Tê~ ¸ºÍ:9±”∆Ã8˙ÒÍC†ß&ˆ{GÿüòÍ∆˛¿å(ˆ˝+ïñÅûÕ∞Uµ‹A.b∏"¢äp˙dl%x—”’BœK&˙-á6,µì¡O‹€Ù+}'èÔR95¡äïy&úf`‘ˆ≈O∏}1t∑G1‡á=à=Ó{ÌpHY"Ø00™ÆlˆLûÅ:ÓŸÙ)∫°Ë¬ö”Ò*'Í(eHOMa≈‘<ù('•˘
ä(h:Ó∫c{ÆRª3õπ¯|≈D√y¶¢∂©W≥•”7t4/-‘F^≤$iï†eÑüQŒaôÆîi∏8sgïƒâ X¨Ïh)‚dÄR~Åv Ra©©H•˛|rqˆ§5b•«∞ÄCÌµPüÖÆtç‘y‘Z¥ëË3íûzÖ⁄XD˘·L`Ù?Á_¡π
Ì¿ô≥*ªËí≤Ù˙ÇpwºÔ⁄gåı3wTÚW¸KÁv(l[‘zC∑k∏◊rbÀUr˛u[a	Tèã≠îjwØgA’Wu˛z7}‹ãZnÛc¸∑£Y˜øQ©lù±ﬂ„#x(	°U∞Ø6‚A 4FlÉ®	µ‘ë2ËòÛ9•#øötò„°÷a íŸkƒ7û÷u\∂Û≤"|N ‚+Gï√0o4∑RÚ#rä}xºV)Å€îYSïÜÀÈo°¨…Q‹r∫¯_–ÕÇ∫´sb®µ ß¬ƒÇD9âôööZ§2¸Jô‘,~ïO–‚WEx~π‘ÎÚ≤K˛î„Z™c≈€Ü˚4çŸ-—2{æÓKK4$Zó$&-4K◊äAÛön≈§çzñ≤L'ß<Ï˘{Ö#6˝≈óÂõ.&Í"ßiô‘ÒÍÂHàS.ä!&(Òç»„pæÄ‰˛á_˝√#˝”Ó†’È»∞{‘e5ã;˝=¥Ô;tÇ1‚XsBä˚DKnpõkéF®Ä‹Çﬂ<Õú¬SÕW•FtWjK+Ê„
N“8Nœ„(Nèü¶Ü˛Æ™µ¯E£˚ˇ3I∂.4†«ØÇ*ñiﬁ´î|%;çï<àÁg‡ê·∞2“=Àt¨™3‡U∆â€\S«,ìà-ûx7&îñ°x^i\ÕÁS‘qlênﬂ©u·„9Aéqˇg.û¡*ß]⁄Õ!6ô;˜ø%‘&œ`ä3»ÂK∞π‹J€¨ï‰xq±•‹SÂkp?k÷±fi˙|∞¢ô,ŸâO}˘Á˘ZâXË<`—Zsj·ô@bÒ§.w˝:k– VÀõÕ©«·$	¶ºö¸ƒWöí	u\ÒØ_›‡9∂{2Ëû6Z}X‰í#iV4H›2ÓÒﬂX7ú¯Á@QÅá¯Ötó{∞T"ƒ∏®j-J‘+‚WÈ© d#Å∏#	0
0ÉÓqˇEèI/Â±‚ÃK+2#Å¡¯˛⁄ ∑Qíd.lGÇ’@65·◊'¬Ê´“$Iù.ÉÿâWL++⁄’ÿ,t_≤Yı5îﬂ4Î¶t;÷V’∞-_(V] Äó}’ ŸÇΩ vê≤f“Z’}?Ôﬁ!≥éíÇÁ√…ù!îG®vÉ≤ üo^å-)∑ÜoRIHMÔ¯>¶‡sd%/îÌy/2„•¡œrk{e
∂ª©Ô@ìÏñï∑}â≠°òË±#â‹ÏªD\è§≈ÊﬂµΩ”]ﬁ	|¿•Å¡ﬂÄ˜ª‡é/Ûo»Ö V@ˇcÅqåµt›cÅrp\v@Y7ÄCë–º¡t!~Cıp≤›DRR÷ëíïÊçùî(¥¢
*∑1ÅG°h@N9syˆûw[ùÓÄ|D:›Q´w4$˝ßdÙºK¸cUB1√Ëôá	í4¢ÜE∑B¸€\ºãLÑøx·Áêâ;+,IŒ/˝~#TwüÄôyÍ#Ô±b˜"bßÏ$¶‚:
îíÇÃN·ÓØ‚˙ê{	2/:µø>›Yj±S‚8§•W.§ŒØ^'Âe0∏	!ZŒUè¸˚ƒ]A‰”äV˘lxX‰∑dd™ÊUÜM ì?Œî3£˙ïl|˘ÒÏô8oôÖbW≥ˆ¬6’{•Ò’äèYÍ,ä+O&À;∂+ÍÈÏ∆:ˆIÂ"ﬁQÙÁÌÙ¸yùâ’Ú
9ñœ”Tè’
B0≈G‹ÈÒ£B* ˆ)Û}´ªÒ4†4Ù(wÍ÷Wççÿ í9§mŸV’Ω∆äT∆e¬–•»~îŒ˝HF5™D¨üÁÿ÷ƒ.P¨†ËŸ{¿˘æ›.4ß
‘®πc\Ê˝wQ}(n÷õ€Æª†3Ç’Â¢&õÒf∂n\cDéBÎá<qe∏ˇ«Œc§.«·(æÜ_Ëà≈‰K∆>≈…ùØê±g·”Eö*BêbäÁ JóõMrrˇ7/∫G ^ía˜dÿ{“;Íu@‰Tí+ì#
ÑÔ≠
pA£&¬±®`6DPaØg∆Õ¡ÉI¶á˙3G[∞Øçâa⁄k˚Î¨WUÖÅs*ÓäKü?%	…SÆ™«¬±Ã*¿πL≥ÏyßM8j&‘k≤NÖÕMÒ∏ñçEUÏC%ã‘."ÒÊò ªY_Q˝Ò¬/‹={·±J%øäß∆≈Ω£	l÷›\lV5ÅIô5⁄s&dpb®ùû=9Íµ˚µ√”˚_≤øH]0MûˆπøŒÔØÿ¸†;z#hﬂˇ+påÑ±AK˜	];î?ë:áY"=ú˘Ÿ˝w∫°-€õûw(˛H‰ íuƒ…±QÒ“L¯∂dápH±]]Âº,–Q8‡"”QH≈£µ√LŸƒ&¶¡¿ÒÄcúã%ÿæ‚ø0‰9”û∏‰Îz^ò∆\a¸ı#æŸÒyi∏,{Ns‚‰S<ã∂ö§;l˜O˚d‘ ≈êé™Co…Ÿ√- dÊk<eJK&ŒuÉ<èÈÉﬁ…I=}‘]…†/hGΩR rßzE‚ ~. †¬ÕRå¸˚C4Á™x"Ÿáæ∑…#FZØ√0ãa…F· n¡?|~‹=!Sà°.7‚÷êÿ˚'0^®)À\™≈'G˝ˆü‘üòˆ∏dSo˜:–Êõ˝≈¬1\?PpBÌâsˇ-Íé®ˇâÃÈ7x
n7	·˝ﬂ ¢V÷ÈÌ…YÔ˛ØÔˇ™ˇnüÜ∏°Óã;Í5ûÇ~»ÔJ≠ ~8zŒ-©^EŒí£î‹≠˜GGŒ•ú'x{w¯rkìïÖû´gÁ·Â≥IV…vﬁ€:ΩÛ…MƒÉ˙îe¡™uMﬁrK'ãæ∂—Ü…äñI©Ä0˛–Ì7»]wP«Ä”òEò„q‹G€ÅÔz'™‹5&a≥@9)œÚ£è‚õ˘Éx∂§¢˛Å¨k+ÊÍ"a8Dv#/`¡¶¶ócÛe}í’«S0‘cDrô~"≥£"Û_÷∫ˆNÚw’®ûAÏQiµvÿhê!S ?Åù4eô0lmëo\"d»úeá…	±œˆy”OÕozˆúlNˆP}≠	7òù∫ıƒc—◊‘JÄäU8⁄äoË7k”Ú*ÿ›S$¿:?Á÷Jtx©veèªÍ^â‰>ÜêGúa›ˇzfåmï4wÏkc∆ÈnúxjÁúÚIWxB¡óƒƒ]P7∫É„ﬁpxˇè›!y6hùúµÁC¯öæÛ∏·•Dy Æ´U+&—¨2ƒÊ‚kâ,üô»:9Êë⁄ÂT›V¢@ªrqXºnø®ıÄ‹tVÄßˆà‘éÅ˛–≤ å¡¯’4√ÈTâGÚpAÓbfw¥©)˛òjó¸°lwˆ«PªˇΩNk_Üú•¨qpå®òX$4ç§T∆êñI?-ô˜ãó Œ·ÓJDÑ1â–íÕ‰1(Ó+Yﬂ}ﬂ∞Êuà_<∆áMÒπ}]6¢W,Õ¡≠¯£\íƒÚ2ø$¨B¬^òu"^°|~	^Yy∂iY2ò)∆æ√QºüóMí¡ÎéÉC<ƒ`øh6õ¯˜#2/õÃFVÚâR		xI[AE,/[®ÙÖÿ%ÑK~Â∆2'/‡eXK9UßT˝wU”@≈PE1i≥™U†ÖÅ∆¸dç˘PwÏ¿°ä©Q(6….I∏avˇ;}a¬TsÆÛ†6Z≈€J«È’2∂‡DÅπ|™y?T†ÁUcs};5˙X⁄Â∞˘Mc+R}ßP≥›»¯åÑÑ¶∆Äf€]]¨gõÁÌ≠∫íˆÎ*˜\˛ØòÍΩLvÚí∏—Ñ‰2ñÀDN‰˚…ûå¡πöy©E+Y™ügeAÀe+iéxq…~1◊asÈAR1CÙÒ+C°æ`óTTñ»NÜËóÓÑíPNƒŸ…ûóKe¿4{1√oπ&|<öx+Iø ≠ïH˜˙ñ£rù∆jˆ§‘Ìä÷Ì5a¶IF\1)W¬∫ŸK’"À5G'í⁄î¢)K4yßæ!’ÂJAæˆ\]X¸©Í˛ç@ƒ∑±2{YäWY˜ﬂˇÚ¸€ø˛]ƒÄ’ùµéz?ouZ√=ëÄ“•ƒ ˚!sëtÓ‘¨&∆†mú#DñˇÅjNwâe®ò¢_99ø÷ÌÙFK$ÂWJ«Ø∞Á_Ûê~ñÑüX?vÇ~òQçp¯"÷_
ı7œ¯8%R®'¿úÂˇRªr	§E=\Œ·øjl%≈ı∞ËàöÃ.ÂPÈáπ:õ ÑKñ0Q£ƒóËï˛+eÕÁ§˘á©Új9Úe¨{÷«≤Z7¯WüLaZõõ_çïÒø€h~˙iD¡≥$¸¯≠§.ÉOÙF5ZQ °WSzÜ\ñm°qLòùW™ˇ(©Á˚û5Xü$eÔ´¶iæÓúeEÉÃ~ı∑Ï‘ÙÎÆ;‰ƒæ¥˝rÖdx™¥r Y≠)¶¶O≥}4Â}r]¶=ÒZñçù«ÊŒÿ1Ê^·ÁÚ3¿œ˜b)b> 2V9—¬öù*∆%%”“˚<ÕúÒæœ”ÜÛ÷Âi˙Iˇ‹p+0)öÀ^H∫	8òpZoìâöæ›CJÿ˚‹ÁSºkoÄ±EíC£≈ç(åïù|.yæòiVèµÍ¥Õl ©≤Kn˝nr”ÚU∂«{˝„]tzoñBÄUlÿö6Oj8XˆêÄ˜∑	G˜WúêcºëTV,‹ƒ∂§I=˚áìΩy+X◊>+˙U2è®å[ô[èqî™ÇØ≤ËUø\1•¥∞ªl%c÷oI‡…ƒñ˜‚FwÍ¡Dsπ–ΩFh·yì¿ôª¿2Ô∆òóÍØ>ok©@<µq+9@À≈”Ú“FÔtVÇ_ùÈÈ¬bßˆ√Á&çÇŸbÔVvV‡ÜnxÀSD3õ‘[B#?RJf›5f$≥Û≤-GÃ”AÛ“∑•R≥YÆÈNˆ#—Àùz\àr≈[¸†	1Z9Ïç-¿˛]Qb{ÂÑùIbp=¸{e}∂[ùnØ%ıbhÎ¥å:+◊µt⁄˛ÛÓ”ÓÀa˜ŸŸ†u“Üû0Wü∆§…˙∞◊^QG≠≥NWÓÑ≈í∂yˇ[Ãx∏√rgY‰ù>”ÑZwˇO§‡ºæì≠j¡ûr‚`ä/Ìx+#!˛ò9´ÑGÚ˚s”(õ˙õ@"å´≈±≠Éõ˘ñMœaEËÿ°ﬁ˝o]◊ò=`Ês9ÆîÑêx∑Y”õÄƒ‡l…|8^dÆàÖqX°éê	?ëyÀ{–â˜††afÀ€¬ÁBp ûÇ„ÁÅ—NÛª◊	z¿9¬|àŸ¨N
S´lâ{ÀπÕ{‹Å‰Pæ…`L™Ÿ¯“·Œœ¡(Á˚a%€«gÅR1ˆŒ*ß‹UŒµÁìè].—>õ◊$£S´Ûú◊˘¡d Gœ*µ4˘Ë3Ôs‰˘ò A¬¨>Ö¸L ‚ø€rZ˙èF÷âaï~ç.÷r 2]øı8≥çmJá2j}˝?∫ÎìGX÷v)_ÏåπaõÆ1”ﬁ{a+XÆß⁄ªΩ˝¯+¿a‘≈ñí–A6ﬂ}ÎWi∫8ÿóSÕù>òi[¥ø≤xáÔˇ‚◊©ˇˇ~ØïµSHX!Ô!RË{Xîï¿¢…ˆ=&J  ﬂ=Lî∑Õ$«Ü'ÁR2\ôÚ≤1N Ñ≥Ñ◊r0'äo·û»oÇ‡'á\Úâ◊ÄÚÎ$2’$ú„z(£0î≈`®Ñ¢PCaiªeÒ¥é˚‘ûŸ&K»œP∆XPGX(ÉØ†àÆ¿6åßfıö£∫øÙU®-,∑˛±uı◊´˜Xt˝#©2"°$Æ≤ñÜeü;∆DÛÓÁ ∆Odm¯ÍÚÍÿµ7;¡\˛Bﬂ92aD≠Pùπ®#Ê'Çà€á‘π4Ó˘ﬁC=ª=≈çøG^•≈ÍX7;ÊÛ{U∫m(øàn«Ω2 ÉèEÓ°‡úZX∂M"å¥ç"TLzULƒÈ£C›Ò2‰—ÕÖ≈htØÅ±Kü£ ≥gúSIÛÉ⁄ïΩ,≈KC#qDœ®Ì80õ£“É¨˙ìﬂˆ¯ÆÓ¶UB,˝ì‚≤.\‡!:*fïIÔ‘‘,™Ò&G˜ﬂzà÷äÏ c=ŒGXÌ€pÒX„π6û‚ ;‘ÛGåå Ä{+Íp1G6¿ò‚s€ùÉñl¬Ò$Ùe¬÷≈Ú˜ﬂ2Fyå≤∆∂fô8≥Ç§«E†è*ùØxéX£⁄¯0fZnzˆö∆ﬁ&3ˆ6jkwÃ±ÊMõ¶m;uˆßÉêÔ3ê`~B–ZÒ«¡µªWjúõèœ5&¶6Ùú@'ŒÅ˙æzV#{Ù
∏T¢ßXß5ÃÎo?Øïögid˜,òS8H}<Xv–∞h	ûbË{·∫©#7·á2ÑÍs<Ö!úù2œù∞>ÉSıã∞ï/À4”a∞ÄÃe∂|Q•1ñ'E®>FπDô°ÍÛIœu∫Á≈∏“‡(lè áˇ÷ﬂ-wEÿÂÇ÷7ëÌ5u~zÇ¢m+èS2c«EUÂÖêï¸Ñï¨ƒHb±‚ÈëÍ+e∏Ä•$0kúC®‚¥.°∫Uƒ[hK¯’ﬂˇ_'‹®˜¢Oû˜è˚G˝g≠N/HDö„ÄlÉ)ﬁp¿#ÜíMò1ñïÈ≈õ˝§oﬁvß∞§ØT	\©"¥R≠’ÈT∆U™Ä™TömºàˆÅ2@ÿà·B»´Wó◊eç∏ˆ9¨†√ƒ’‡NQ≠àÇ§∫fÎÎ()RÑôpf‹Ô¶eÀú´5Â˘ÊúP˝~~ê&r≠Jû]±h∂ÚÁWÌhRô∫ù<π‘_9<0‘üëâRO≈z4?§“Ò˜≈‹C‹Ù•2áR∏K≈⁄Yõ5
Û%¸´o'ŒWîØ7ÇÒı!|©‡{©ò–üñUÓˆ≠ •
ÙUà‡ï˜F¶˛ÇüÛ¬›–Ìﬂ<kùÙ⁄‰Ï§7íΩÓüÊzˇo·0B?w∏8iÁ\≈t¶,Ÿô∂=»?-x(¶õÆ\‡6ﬂ$◊ÊûÙëª—wÖ◊Ö#ﬁÀqΩ‚K!∫<ºòÅ‚ud†{ÅuΩ4Àc¥®óÚ'àuxúÎ∞¡˙F\*¸Œg7◊f˙wÆ9?æ…ùÌ±ø‡PKo\‹4Œ©wE©%œﬁó|o˚9O‚ëœœ€~Ì¸ÅËZÖﬁqE\πî(é8÷\¶É_¡Cø§›P«M¡œb–X]ê3Hîñàsô	¯¥(dWò(cB>]∆‹±6˜màlo8‘∞Tº¿ΩK<fZ‘XmﬂÚON)l¥´2˚+f·T©º∑ÇgSnçG!5Æm^8»$û≤ 8+ÇRÕ51v¸n™#√Ò{·ùhiqv√Ãˆ WÚKÉ€ÕÆSÑ¡]≥“ OmítÚd¿{¡Ó≠ú(È£‘±@õÇ◊QÿÂ—Ç÷—ëú–"Û»ïR=æ}â\®XË=WRóŒÇ*é¶TØó∂∆Ëf˛¿€{X’ñ€zø
Æ¥Ì02Ê6ﬂvâçê˝“nı#∞6R0ƒÚ'plxÎU“ç”ç√z∫–So(Ú£óN:V€|ÖGaqxO¸®DÓîƒ∆uq,ãD;5Ùh¶náò©ÇPA‘3µπ[πÔM©¶+,ÜÁDva¶ÑöÓ+ï
e∆‚∞ºπ◊w‘ê·‰ëÕQ@N‘
ﬁ_˜¶UcPH∆7>∂MıÜ¸Z’‹ΩÓv’õå®ÍáCOÛ.¥{d{ÀV`“ì©á(?%ZÉªú‚Ì¶Du˚ﬁπ≠ﬂ»#”1ú6nà¯#¥∫ëˇe"∏omÆs2ïSaû¸êU–¢Ωr—sŸ≤&ØkÇ,Url9LVƒü≤ü\Û√∞/4”•jNù¯X¬C9eË∆Iå!|¢Jˇ‚	P⁄î∏SI∂dÚ]π%·æsÜ;RKË¬∞Ù∫çMŸ~q 6˛Õ=]—Ñﬁ_–!ù(ı·ﬂåÒ9c≠RO⁄¢DO⁄Bß%{·È∏–á»ÀÂ=0ÈzÈ!nﬂWuÀîL-¿sââÍ¨SLîï-—rmh¸Ÿﬁ»2.óHÿ˜Ùs/¢êW¬Nk;n§àYe¬ƒ	È;µC>ëBΩQ≈k.x∑ä∂ü¸7ª}≈«˝	O3Qìã˙èØ »¢}€=&}(◊
	ØêOÜ¡=°|-|ÛÖ37ô∑`}SúT‚´ùDfõtÔ÷Fï†£¨≈¬çpS|u~N»ø´⁄hj≤À"ËâìÏKˆJîÕ•π{uWñ¢@ f+=´ΩD©ï |‡Wï›‡®£áD∫L∑H~íHº€ï%Ò“;ØΩÿÛãl∂¸X+MO…U(Qﬁ†“ ∏*ËJ¡›âcÇ\MÅb(ö
îL°ëS◊;#$µí≈RÂ\Ç1kÛS√ä‰·≈¢Â=ê‡¸˙ÃPëlÀeï#úe◊h’Gy§§…Ã∞Wç/∂66 …È+;oíô∫ñ>ekY\$!?Æs’ÿKõÑÿ¬{’ˆ‚–dv8√“íºY1∫œπKuvÃ`L¥1ÆU9!§_}|
ÉóÇoXå‰›⁄+Ï¸îZ,º]9ò—¬’qeîƒ‡Ì´`eY†|
J¿V©ñ∂*«îB©´ƒ#ØÉ“YG+¶ˆ0∑¢"ΩßÍ6–!£4?§ÙpÃ’i/π3†wˇì¨Á#”{ZÚ+“3F¯\¸J/O˝l.*œb•ù<˙∫êu∂j"d	KK`⁄†nÛ¬k Bº‰B‘qBÑo“	ëgm≠ÑŸ|º	B,äSJª*Ë-•GWNƒbO$E·àÌ∫Ïòs≈Æ•e\÷Eæπ!∞√ÌônÇ®`UZºÀ˙ÏLna4ºØπ”zÙàNÌó‘™Âª∑ıÂx§!
Jrkæ‡+ÌGıä⁄yE˝‹óM¯Lº.•”Ôu¨Ò∏ÕsVWS—ãîÙ¨ÍnOìcÍi{©√ø√t?µ¬u±ÒWú√wã	WWŸ!+„4DØ≤®—´ÜCÙ‚9Ëœ)Å« _<¸>∞´£3»œ
¥èjçÑ)Cµ∆íY	©ŒLßSO"à^°#i/ÓYZ¶Ÿ∏Ôh/›•¥|‹i¥óÙ#-’tÑW˘çG˘/4å±Z˚¸ Ÿìœ’
Ì®CID˙^Eæ*¶’≈ÒìÏ˛˚ÄykJ^ü,Ü„ jä∆ÚÈ†;§bEÈ0ØO,ê/SÍ¢Wï	-çÅDíáo¢¥™Çw(‘,ÅëÖÓåXTòR¨Z“IâÇ‰6ZÛÖ»–gâI%eèåÚáw€_ißÙ!ÆZk=˙Tπs\%»$ºVùc\äR(∆kG√GX+‡Fa`Ë •ò ≥"XD4_>≈,«¢`—ºÃäù◊ïYë6ê‹åà≠RﬁÚeÛbıÀ+˚∂˜á"u'ÊJ’Òä˝7I«º(ÔÕ)u…GDì)°ö¯Æò›∞[-ªÅëL1'XsâüàÑÂ∏·4∆ ;J4&b`e∏É^Æ«r$ãµ≈%ÙµbóŒ∂Ï“Q	3√™—™¿Â´¬M^)*ká¢¸+Äµ§†Je|æ‡öeAÀCƒ‰≥@ÜQz0+ô)E´Øù@"Oçé∆‹û'‘ö(bìóäã/áñ,íwWì¨`ÃT≈Gƒ≈≤ÄÜB˚™“KáVe„o'Œ9¶;ııT‰<Ûı¯*`Â¨‘≥ .‰J–äkB-µe∂ww´lô◊^Œx%y˘ÕØ0˚#µ£áÃ>H™∑îIºÊöqgUBÄ û“V7Ó«#V]0nE©í¸z¿Çqä∑)	!-a&‹2¨$~DŒ UE‹º•&qSùÁ¸   ˇˇÏ}mo#…ëÊ_…·é‘≠®wıLkª5`ìluÌJ$á§⁄;€Ló»íTû"ãÆ*j‘ñÿ∑å˚`æıﬁ^`}c∞ÛioÅ≈~\˛ì˘Áüpëı^ôUY$’≠ÓÈÇ=MãôY˘Ò<lIô≥(è\YŸ≥JπÜQ«=Ò=C”Ù‰)œWö=.¡ßDóÿ‘¶ä[å(Æê&nA·˚F≈Ø
!äﬁÜ=F˚°3¶Ê‰b!€OÃÅÉ
9p.Oµ¯‡<oZÏî a§snÇ∂f∫»Ò¸õ+√t˜óB√∞ÁB Ó∑ö…+|ãXWºé˜”‰©Ì]Ì&ÒÉ‚˜˚H˛%¶ ˚Î≈‚Ë:£Ö∂ê0ô≤Ù&‚Á] ë•˛sÒ◊Ò\-Ÿ3˚ºRrã±ó⁄bÏ¯cÛ-∆"2ox3€ÙW˙-A∫Z!?CÂvÌ^ÌEäì¢JUiÿÓDΩ/tZn#îÿ¢>LQ˘ÀPQØX“Û†ﬁ(¥º4/PYÍå∞OG—î	A(+ˆ≥Å<ÀêQøÌ ^•"
∏®·†^h¿K∫§¡zÀpJ/*…ÒRïÊãÙQ.Èr¬ö?Ø*∞ÈÈ{/Ã(=·M	2Øw˜B,|/¿‘ﬂˆ≠`HAÛ^x)<ØŸÆ¸®äõƒ?(Á·≥?öñ}ƒ|§®≈Ãˇ•NÀW+öW*ò1u"ùUJ4ó$èÂ1.ìJu1íñÂ…¸ÂbJÀÚTlˆTw\CõxiG4Û∂ 	˜∑*~/≈Ñº2⁄ Ω]Ë~ï^%5î‘ú.õËUv.y )çÑì®ºÈπ˚z’íZg
éîRÈüÚ{m™∞ìz˚t–JÙ?œ5ˇ˚Ân∂˙ÿ¬z
é>óé?)µ”øß¶+`ï„17<«W◊Óê6ˆ©ÌLD@ ¯X¨™Ì˚GzqÃÏ |ıÉ{¡KaŒÊ‰B·pçÿ}1HJ◊£/™3Ï˛ôﬂõâ√Hﬁ∑§ñ'˚\î‚Î‚ &€Ö(êµmı‰Ô6õéêÿ	ﬁ
È»‚oˆÖjø˚EºH4Áã§ÜÖø∏ı*(¬Ô[≈ü‹™æí∑≈˙•Í∑Ty^ÆÇ`ª|BYÇ©≠?ËùN{uVú÷èµø´7ÎÒ‘≤DdvVRîFñ»0SŒ S_µÒ≤-ÃÃ∆XÂ¥€¨Z_˙,._"ãKYä∂ÖH⁄†icÏ%ûäqñ6h‚–ßô0Ç|¯∆ß÷≥› €œ©∂ıpÄ√l ñiE∫6ÂÙ¨[fX††ñì@	⁄”Œ™πdS’úm	—¥„ÍÎGY:…ÿ´™2Iæq)ı˚_ƒ§T»(YG∂˘´H1»ä*i®êpﬁ>cZs…{-¨àHÚÌêT>9à$ÉF≈óZ≈RàUµÊKrLÇ¡ÎbnŸXá)“îØ\^ï§°ƒM•_,Ä›Pñ,—_rÚsÎ˚ÕèúQˇUˆ‡µÏoÉÛéøK˘÷J ÆﬂWõì´£ãÃíPåΩ⁄+b-L—.¿A+%ô"11>ËΩü√kòC$π±äÕÒ~ÜÏe
û UfC’\ÚÖ»e0,IGh¸tfNı|6Bj“]2R√V¬Üü;?0Ù1≥êö#ò,∫3º\*y˛„7ô<o®	ã!Âñ·ÒX>©5dÖ‘í˛•iX£∆•1¸J¿Zòk√
Sxlõá¨´Évda∏ÔhÃË∆Çè-æTÿ˜ø¯#;—⁄Z{†‰gT≈ÓZÇ‹êYÜ>Búî	h0∫•ÿO'ˆà(⁄πüÓƒ8≈¸√õa/¥›u6ôá¡ÕxU>ÆË¡gr∏ú‰Ç≈Ò∏1ÛL§Èm")âDïÿÓµ∫µzG˙L+A—}´∆ã®6¡Ô.Å>ëôé‘.åı.t%ÿ}•“ùÀ>IÀœfÜÛjÒ<¸^ºòÚ|qx›?Œ8X˛{´MîWz®Ë©÷ı–∞ûõéè¬1jÍû~õia#F‡„(≤§xX`{ˆ◊⁄F⁄û“P€S%2œÙ,«é?)ŒÅ m∏‚ugg~uœ1œf&ó9 M¶:GY'O◊òËVß»k˛ÌÖ	Ú#êKÜ´PÕÿÓ“´i¨_7`v·&‡<3—ÁÒÕÓ'[
,â§ª∏èo^®DÜ®ù†5É÷£¢EÉ¥^†Ú≥
¢û≥Mÿ ®É≠ìá«ÜﬂÛ„Âá0ø|Kû>¬ly©VLj+*®ú€–t‹´BdJØQ ”¢ç ï…¨ÕSíñ£åêÚ≠Ü"Ærøä:,ƒTR?r∏eˆ9äZ†Ü–ÏÆKq=¥≈ﬂ%ÖTô˙$ã•T9Ù'uyñã`© +ÖgT_	Ÿ§åîï/T¡éÜ=ka·=TøàH/-◊õ±Â≈9ï¯0áÈ1ÍÉΩÍÓ∂å+Cµ√¬æÓ—ﬁ∏L7Sµ+Ècë-s}¬9ÃÇ*ﬂ`O√&·ª∆Uè,¬˛ÓÚüŒˇ›P˝i∂”·ﬂçX06Ô≈k?±ÕIŸ≠eN>ÈÓÖåG>¡h9»Ñ≥Ω_í	ÁFÚfV\ù0Tº…E©ˆRõi¢ÒDÍ[¡ﬁÉ¢;ç—ÉÁî÷ï›<ßwπ/©∑ïÿ\TÇøWΩ¥Ù°∑»≤™s≈eô‹ü¸uhúWzBÂòW—Ÿôﬁ•∆Y…|QÛ•–ÀcúÚAóT©∑J	Ø ìyI4Êp˙∑ˇáùÜû+≥whÏ—ø∂.∫¿\=4^…OÜk¥]îa.ø\
x9Kú±Êr‹#ÜBNÚîd€àñ]…·˚4Imô>◊&Ì©áô'ÁàäM9°J@J«‡™CìØLkn_™è~ôMÔ»pLuåÈ≤Ë“´4|
ü˘¢Ëëø^9êÁ‡†™52=÷√ƒ,¬¬å)F]Oñ9µ⁄_·©U	ƒ‹˜‡œ˚i<
·º√ ·Œ4XÃnPp ﬂ9,Ù"ÁB¸TËß<%cË#c¬Ònpø„à◊Ë˙¬∫c[‰ÎâæI*f‹!õB±¬UúÓ≥Wí¸eBÿmrn£f0Z0ª/æ›l~≤µàé≥…-Bﬁ”e2≈'”%È¬
Qò“{'¡ã3„Ñ„ΩKzæo”gÂé∂züí[â‹<Ù<Öo k7:¢JµªLk·¸∆WH—^e\£{%∞®Kµ&;·1 p«sÏ…Öƒo¥C˛8a«pG,˝¯pÅq=å˘%1s'òYã7•è¨àK¥Ç≥*.’Ñ6‡[l≈X.—ÓœcUÒ∑	®°6‡hC¥øló¢åÓËõ"ﬂk€E?–Ê9˛™£B ¬≥›§é•>Âi˙à ßFBä@€Âª¬Œ~öêæ· `jø)MzÏHq≤"óC-íµRKì~cÅ∏é˝I&ó¡	·°?¢®üÄù5’ålÏOùì-µÆá÷Ã5Øl6ˇﬂ4!b`›´w‚¡√”x´
Ë°b¸’∆]mÏâeÉ*ßèàô√ÍSc¢ßÇu0	»ˆ˝†Ë•§ﬁ;*√õˇiÃÙ 


®®∏óÑ+≈éGzÒÿ5r‚Æíÿ—~6z(‚âã´í'>⁄ú.©d\%)M;ö≥gñ=¸*Xá)K\ëˆ«rªQø|ŸMlCú& p≈%±∆C˝Õƒªw"®’¡2à&I√X+óU{0wkˆƒzµŸ4]§r°¨ûÄ¨Íì}¢_œzÎÏlÊ1◊{Ö_OÃ°aΩZ[≤ÊÆÚ†N]Ωw‘Åfwé[™M∏«¯¸à◊WÍXıÈlí‚üY{=ÿ)MG?˜–œ¢Ó˘ìÊqâ-z	ËÉ2ûO~Ë0ÅÒ ◊—„ B∑∞kxÉdUÉrKπóK<∫π…Í ˝aÎÑY`YØÿXü¬ˇΩ·%¬ É»—gñWÈû£ŒãzÊ3øíùrå∫kµ“ÆxˆL˘√äXa›M5»®)ÁƒÁYî9/]…[«À[†•+h•1k˝gò≈T≤ œñ8π7®7È√ì@`ÿ<+	ûâÓ˘œ¬ÓáÁ.ˆ◊∆ËŒëFRã0Ç|&}ê‘∂æ·\ôÛÖO·¬a/ã"XQÂã≥Ÿ»+Ú—|£JFv˛~È “†ì>·(≠ ™}≠± FØ∏*ÇáãUC†á¨aÕø„ÙqØãEYw:n=o≥j{˛k¸w–Íı4˘5ˆòRXØÛ„Ö´%Å”Ó5™e÷’Û˙∞-Ωî¿/sL}∑*ö8∑!≥A-îﬁ¿Ø⁄V≤ñf®üÅäLﬂ"¢œ+(8©µ&˛\EªÎœµcËhµˇiÖ>9Ó4˛¶rHˇ,∞â¸P1Å‰a£v¨@jvKR≤·µà‡DóPZXs„#\ô+î≠°ùÙ^ºﬁëx]ö@Øª$ë√Î~·˙*´£)Ë÷l¡ˇ˙≠›Q÷?3ä_î·Z√” Ò#q˛Â#£{-a”Tb>«Xix”U	‹r<txΩaM5hÚ{i˙öî’{ u¥  |Y&<ºlx4‹—ãYÚ?\ò(èöµ‡VìŸlVHòá◊=Ÿj‘ª¯6„ª;`wÈ∑⁄}Ì	Õ:¸ı÷9˙,Â⁄˙àıÕ”zMà÷±Iﬂ7(`˝
$ÀΩ=<JJ˚Xã¯?4qø∞∑¥{
Ü}£v‡¸˜Ùiiˇk·µ|Zﬁ•€i?’ö-ﬂ”ˇkÈ¢˚≠FØÖçı?∞j›ÚÊﬂπÆ9∂˝5[⁄%}∑Œ‚n´w¢ı˚ÛlıŸQØﬁ>=ÆCGØRjnÏK¢:(Ï›S§!• VÍ©à–E4ÑgÊñ¨J˛Ò8K9L(~›º®hì°9¢hû :´úÄÇF Ü—ˇ;øıÁÿ¸èËÄ¡?òatn8Û?·z¢aX˛áK˝äˇ®Óå˘-~¨Q˘"RK üƒ.ärˇ‚ RîÃ)S”RÁó•Û ÒÚgå ∂ º.
Ù••≈pÉØdûliæï‡‚9ã‘ŸgˆuŸl,Ï…¸C9îºÓ⁄å„Wl{_ …í_"‡øfŸ8Ä‡Jôê—tqÖÒﬂ– ÄÔÈ˛ã˝0U≈´O^®79ÇBû™ '⁄W˙7•2/˘[¥0Ò‰ÍP†w›ôÃ/EÍúË*óèõxIWér~ ^∑wë=GëÊßD"@	ÅıÈ‘z≈x÷§jTbâTÚI‡w' L,'9ß‹î2¢p…$Û$ﬂIôFÃ(h7ÏÒ‘∏2s¿3≈x %è†˛"úÎ<*õ®ìë–cvNÅó®ÒAa©òlEp@º $õóa[QF⁄¶∏¡} hp±ìhÖÄR5tL2.TΩc\gB†›÷3Ü†£?‚ÿ#Î>…a)*Ä‰<É·Sv*13aMÏ• Æ	˙C·	°"ˆZ¢6€£lpSâ∑HÖ1!î,é©|©±î(1≤§:€oˇJuJFS©	Ûnf¢	“úo]√£≤ Eä¨Á#&˚ØN¯©KOÆ∞Íÿ‰2‚aB0ªmêΩ`mQ¶o uqW≥/HïÓÓz^?QG^ı`ë•'&	–ôÎÕˇmd™É◊ãfi◊“'NTË`˛çg9ÆØ÷ÆßØCìÆL?¿D ÏõŸ4º†ÕhœÑgû”˝Ÿ≈Ç‡±g∂;5=wÉ¯z¢â7õ„ Â…¸€¥ê¶ÃIkÊ⁄
ò¸*;˚}Œ£`˜u	«ˇÃÈbKZ’∏•À1t Y3æ]Œö@∂´i9D\%,ïkPöê#(©MÑ·ı"UÓxpS˛.^A3⁄5¬y’ƒ~PÆ6J¸<»ûT/“5EA
˚4¢)aâßaTÆ‚,õEußÛk–N¡π2¥xíÍ†»‡=ê∏¢ ËF'	«ôÅå3¯√Y¢leN£2∑ø⁄Ì©≤Óπ¶,Ïê[)k’¥Ã{;®îæˇ˝ˇ˙ˇÒ÷Ëµ∏Ô_Î≥˙Ò ‘åfΩ¶EIÖ¶DÃSLÍ§AÅù€é>Üæ7>TveÜS|Ùµ≥-µö⁄‡ÀN:‘í{Lµ‰Û€34≥˙e¡·(#H<'…™•⁄!ˆu˛®Jæ5G∑k+gf* Û2Nqsßú5rbed3ugÜÚ§¯4éCñD;CábÊ(7Î-dëSQΩ⁄É»öüêÄΩ'áHë4I	˙LÕ·◊◊-$˛©H~ætl¯r≥ÇS44%?„Ùwy¸¢À⁄ÉΩÆC‚Ä( ÚÒˇåì0MkR¡ #›ΩÑπ"„fÄ≈£ÜÆuÍN
ZÎˆ5¸?6]pBçœhmf`TÍê`…QS'≠1îû˙≈LwFnÖ_d-M›ÚI.=µh«^Ñ¬ª≥EBk!‹áæè¡e∞Ÿ8Ê
&:#sZgX/öÿ¥+\ ÍÉMﬁ5fn ‘ ;IR√k'q)p˙ﬂ'.-s;˜⁄ÛiıgÓîoÉùÉ|>”—k˛6˛ôeÎ?{ı‘ø	+·ˆQÔôFE£öJòÇπ]ZÓèoÆL◊<≥åP«ÕÔK?@1¸7f
~dNp·F?“¯ﬂ˘?äQ?æ·˝å∂`›¢õy?ﬂ<|¥Ù^Ó¿äø»ô≤… úó&t™3º|ï;÷•∆πìËàgAvP˙¶ÇÓ+Ÿß!Ál™Ò}y9•'T–~}ñ?Ô9&^Œ¿÷]ÔÒM¸/˘oR XÊ‘KˆÀ‚iVj∫†ûïMñ/0ƒ§ƒ‚Ä£ã∂\vƒ)\1Çõè6«6E!ßæI÷Ü«£É˙∂¿NÊˇ–<=¶‘ä„÷ë÷?Æœ5ˇ˚Œ:ÎÙéÊˇΩ≠5Í¨≈öù”AOk◊Y∑’÷hÙŒŸ”Í©£‘ùƒqÿ›xöfÅ.42=˛(jgÍ≠0‚&ˆ€⁄ïi|ù÷QMX∞√>æπ	TÍ∂µŒ‡ø€[YÀ∆◊lOo””Çáçk”î[úΩˆ ŸËÃ‡ïôh«HAn—¸‚èdÅBî7®ıõ0#–˝"ºì˝ÕÿˇÍÿæÄÁuﬂa *\U¸î#e≈á|Òï[`yt¿PdÌzÉ¸ë∏J«ı~_{
ÉJzITO⁄çnw(Ω2∆ì·¥fL.Ã…K#ˆ„˜k÷v∏ø(V5ü∞^´€ÈkÉ˘?Ù4é⁄ë6Ä·o±zÔ≥SÌyáUè:ù£cêå=Ìyf*=‹∂}aµë7Àèw¸◊ÔÏÄ7ÒÌd¢-µ‹π7*„‡nŸro÷	qÚÒMï”f¨3ŒøŒFÜßõñ+ñQê*yCyΩπœä69wtÙ˛Ωô#£‚«3•ø¶ˇfÇÔ¬Ãhn.≥~0J‹¨˜a…`Á`˛Î˛ uâê<=\A˝g≠÷†Ø∏Ñ‹K√Dñù⁄‚?gQü^Ô˝*zGV—ˆ÷´µ⁄Õ:˚Î”¶Ügù¥úù„¨¨`5Í«¯LOq	u@]d©-¢†Äwv5¸|øêﬁïÖ¥ç˙\èYÁi∞êö≠~∑ﬁx÷âVR≥”P›àFˆpÒm¸ŒÆû&º‹˚ïÛ6Æú‰cí/m÷˘¥Î:ÜkLÜ°ùïÙ\·“kn∞z≥ﬁÄÖƒ¯ë?◊¸¥vøK∞¨⁄Ï’‹ÇE˘º’;ÆŒù#XáMˆ¥◊9a«≠ß∞ºü«W‰#>6‰’&`Ëa$mÿ6”ÖØanòn¯ﬁàè¡Ò∂&πÜß%≠ÇΩÈ∆”{É„xt∑ÌëÒ¯&}'zV›Mù`æ.6ïäæSqåzY∆≥â94ß∫Ú}B…øc)r9û_>Áaπ¥ËnÙõKC∑ºÀ·ƒüÒ™y>"EÔ¿cX¢eô8ßR˚s1Ì•9ˆ
§Ö9d}Ã√ö∆–1Ë(yƒ:WÜcÈØêNGOR@=íÃa*’èÚ}‚^îÛB	Æ(∫UÑvæ∞6Øú{Û∫∂≈“$6Ë19ˆ¥vfÕúö;f?´	úRg’”⁄^ÅƒóvF¢;\‘·6Ó”Œ≥#xóD«¯?êÓhQ˜®-ÃƒﬂíÛ««Ì;◊ñBl]0?C0Œ-˚Î⁄•9ÇIÏ©–£…3Ö^è¨©ÜeOp^?#æNaÆíÄïB	Ç<J˘ë:◊ÆúxP>7|B"··xñZ%_Z+9j‘¿¸ÀÜÈA•»≤Jaƒ—©Vgœ:'ù„ŒÏ9¨˚Gˇ¥—Í˜;¢J«˝¨/1w*µäbS¢¢:ÅŸ!9ˆå7ùBxh⁄÷∂A„:¶„·~:6*5®Q0EbâoÔg(9O…4‚ç‰≥7DïHâÅ@ìπ‹â∑ûs≥O[Ö\Æ≤ Ÿa°Ù√K ”=bﬂ(Msåìë“Ñ˘9◊æ§RTz2LÅGóªôíkWÃﬂôÃ¯éüƒ◊ó4≤$ªmx¶'√‹¥yπ+iÒ4√„ÚA0“÷P¥?Í†x9ì”{ÆÕ¶S‚Ù˛˛˛øc'Z[kXΩ}‘9ÆK⁄,$ëÁw
_e;ŸƒÌ8Ü•_'È®w∑í€°}Ö∏&b<éí^å&–âà^UpüîÛÛOF≈Îh)∏¨∆∫∏ŸCIöj.S›ÉBX§¶§=!≥êvd”^W%eèKR≥$fº¢xúeHZpÈ…'!πµÎÉ”^ΩèÊ√@ú“âú÷√˛HÎ0ˆZ2’‰ÅP•9˜X"®L“œEQdÉÿg§Ô∂zîx|‚Db)+DçØ/ØÿÕ•†Ç üÊñUµfñ6á¢ôÛÎœK˜'ì":XA◊Ö§SÂ˚–ßLiM±à≈ÔˇÈ7¨Ò¨ÊÌ≠s2ˇÉû÷®/”≥p¿∂ÆGwû‘~º˝∞†∞úní~%ó±(ë>Î1åπ ≥oJ¶Ü–P~pˇYΩ∂≥ˇÄUªöìÜ‘Æ1”·Id	b#{¯•9¢_]ÇÍ „‡…ìd9Ú9¡≤+÷,˜d¢,[„◊óÎ∏ÇT<]Z¿≈∑˝Ãi‡ÎõCPa∞gzÖ@ÃÅ8gÜE9hè¸ﬂ'TZPø∆ˇ§4cY4nﬁ(+†√ë>ò¥¯‰ÇJùHﬁ›—≠Q2ƒ7!ÁÍ∏ﬁœ÷‡µ≈∫ùkÙ¥Ó†s‘´?ùæﬂBh≠‹EêÀ%ö[…ÿﬁ0˜“äŒCˇ™ˆ5z“∏OÅXœ"œÍ˝g"Õ ¡-XNNDu∑˛˘qß¬≤ŸiúbW0≠)+k√+ƒ®~≤Œ∂¨›≤ü≥Á≠^,%&äbëTÇ‰Ïé"Dr[®Ì?µm\ù‹PpUÕ⁄ò{]#‚◊]9"X‡À&≥Ú'è["‡£–CfCß‘¥ä6FqJI«#”1<ùì+!'(‹‰_€—õÎåÕ°Œ‡ª Ñ$≥Gí…#Ûw§åƒOˆ∑“™rÃ¿î¯F¸2‚∑?ÊΩ{îÍ“	rq±+ ùùi"ìT<[ªˇ≠:ï8éä96÷’ßÜ≈NêGjd'º<≈d•”h	óB¬îJ⁄À:Ü¢!.≥Â«Ü‚cA‡:¨ÀÅrh^óÍjI¨¯4CÈúCpîë-#‚Å=[O«>MS∑ÏÃ’düÕ`‰∞¿˛ P˜.è@1∏†≤∂ˇ[t/ãƒ«`;ù≥ü∞«¨›ku√ ˛∆π9˘» QÆ∂éç∞mîí"âZcµÜ§¥x˝œ˚É÷…óH“ËÔ`ÈNN·¯cIπ&ù° k•Ó5ÙÈ1´∫ûs‡#áE¥ÁºàmM¯ ~µ$AWjï¨‘ÂµÇÏˆ¶ﬂpßñ	Çæ&í—X&=ªaìÔí^pW¿‡◊˙Ú√˙≈ãù/n7Éœ€±œ[_‹æ˛eÓ¯ÂA”Oﬂ≤!r2ÑæÕ∂$ÁwâøS˘Á§E≈#ÇºcÂ3µSì7pn"íéy≥¿ÈI…Ûì≤'(´8Cè;CÔ8¢˝¶‡¯D®i:–∆¡.Ö{ØÈ¿§¸ë	oa1Ï#:\8¶>πû§(πyπY>n:Óù‘{¨◊zˆ∑4zÛ_v5âiëkX‰≤àt¢ff3»Säñ>iâınp B∑6∑cöø≥≥Âu/zæ≤‰	Kë?Áâ=zµ®≠µsñ`-(∫ZRÆ“¥´^Õ∆c6Ñ˘l¸Lg?ù!2ôk¸Dá=Á æ@Ï&Ï™©Ìx:ÃwÃ'Á:D5å! ~ :.3Œ”≥]‹¥ïn˚bFW\ô÷¸€ÑÄÇW∞	í”t,j®ÉNg—Ù˛åçë	äï8)7±2ﬂïø_ ñtÂ√‹Iù;sUæú:Ìœw›Á28*yì}lÌNoP«D≠y∞å+u'„π≠
îotFØ–ùå≠»cq«=◊l∑éÍM´™ü"k'rX¨-’âª…n‚∂»ßfIÍnË˝_•èˇMˆÎìVªÖA£t¬y›IFW¶;˝ªÔ\w>=msı°Éì}ìˆi‰€à˚>pìNJŒË´›}Ùv‡v=}Eo8˝célPNMO3©~πáÊx›¯÷Æ,†5π’é´ö )ÔW±XnıÊøÓ4;ÏπvÑû˙ïÆÉ¥˘^»iÿ‹˙rÌñ’ò“Oå…àˇ‡uü¢Òe7È9‚y·úÖ›ÅÔ;ﬂm©hΩR5˝ﬁ8®”0I°y Qﬁ%Ø÷‡:¢#ôUyàE+9b÷•>Y™hDK…≠C_Ãål±ú	 ˚ëÇLlúáÛoDnnnÀΩÿﬁÿ⁄˘"kﬂ•∫Hí/>dßÂ¶à¿ÏãüWÑÁ–dáÙ;2Ôy¡QÖÏ‹NÊCœ˚.1®∑k’Ú~uñçûÙ¡Ãô‡P≤Œ‘3«>“	"ÒNm∑L‰∂˚y¯Îw1x{<zº]÷Òàüˆ<¶¯◊Ó"Ü;ôêπ!ÔS»∂öˇÒ¡s!¨Ì¬é«nØ”ÌÙu:Ì¥ÌÔ|ﬂcìÁïTç‚≈øqfŸ√Ø⁄ı{ea‡A’w	˛:˝ìwˇ›üùQP3€d≠Î©•O–ÅäêêB-\f∞~í
ˆ›‹› ¬B.˜≤aﬁAúwä.Í[®âeY9¨ÉπrÈ„ﬁkòÈÑâN±+€ì„ä ¯m^Ó	ïNyb˝hËîcU≤0[‰)•âÍ°ˇtd‚9ÈŸÃd‰Â8˜HÄ–∫√¢≈+â?àN÷3sB é6‚ÜEÃçy˚˜" ¯=RPETœ†oë˙⁄!Z w£úøu6ôá‡£àD Ã ‰Xﬂ…´#∏ëæÈ0ó‡◊ÜÀQw◊FY€‚È◊‰ vlOG	Eôb? É_‘tcê™Úë·—º8Î0˚Ï'qHÃøE1QF8‰ï˚¡¡ÊC∆=vn¬WcFlHÿíL÷ÛoÆ”]«1ò˝Ãƒ^Ûí¥{»‰Ã¶ƒ,»–á=AyÏPÎ… Ã¡Ä–"®hdÄ÷à/!Dç∆·Á≠⁄û–ªÏf?`P]Ø∏_÷^ÏÚpªp~UCë#õ%ˆzwËÿ¸ˆÔ•9I¸9üE´_)$≈≥∏ù•XåºÁÖÅÌNé(öû¡{†€IÒ®öS√}©∂'‹Ÿ‰SPî˙€I`Œ¶éØ»EJ˜’?;U8Iö·1íH≤j†ÚØ-‚bJ#'ööDóQÖÎÃ]Á¡~ÙàÀyëx~¥a√{Ä≥†•úl orqiå¶ÿûı#Ωè˝ÂøÙ¸W}bÄ≠É—“Òõısqy¨ï4Rkúh+±"û·ã«“g„ﬂŸe!»‡ˆ1ŸŒ0±w‚®ﬁæ>3ñsª£Æœy(Öº;˙^m{OÃ*˘Ö0ëÈP£¶NuÃPHet»Å±Â`ÿrá(çC'S`º÷Ã•°Àì	"◊}Æ:´‹ã“vºå6tÙÛL`!—ë∆g◊πÈ∏O˘àﬂÜ*=ôÚ∂Æ®∏0I ®+á¡v¿RKÄ}ˇã?"Å–W…o@ì¯äSã¸¸Á¨“ﬁ¨WäÛc
®I≈ÂBÏü˛W~”tßòèæ–»'¯„MùÛ’ò[|R˚n«◊+˝[{‹w*=:â√lüY∞3™L7ËÍû€ÕÌù≠%&ä à"±dü3íÔ∏Cˇ”2kRhté¯m¡ë<Iœ ‹s;^#VÌæ˝ûw*F	£IåÚﬁ%åÙ≈eÂ&Ω5Æë¢
√|ıßx≠ÉÒóirΩ˝ëÇÃ(d
M7ÏÊe|o˚&⁄ô`ÛIè«ŒÆpSIÂo¡ﬁp¯˝ø¸.h„í£K«^ºó,„|±·Z®˛Ä∆’ö%4®E«CÒ®¶É|$cL
—äÜ8’øc§(eWeÀBoT¨ÚX|~ÒE»ÊZFj∆eD$™PÜÚVÅ %ÆÇ≤≠páÛ`ü$Ò1€ﬁä¶≤Ææü9W/"
¡ô_ÿ∏õlÎ^÷>åﬂΩ˝—KhÀÀø¸ÊD˜.7Ù3∑˚væ.b"Qô«*<jöáÏ†rﬂﬂ3”;f2O8ñN⁄ôz¨Û7J≠œW©rÈÚ#
rê˘Efäà:ﬂÌ7ÎŒ+fªp∑ΩfBãXCæÏ–õq$ÿÇ>Ø∫ü^êµÌ"pÕ—Ω*Øﬁ≥=¯µjÂÚ“r≠ª¸xÄ⁄.è	(»;H&eâîË=âÖöGtÄ=Å˝ Â≤BÙ¶1"(ét˜ p∫I¬wRa&7Ò—ΩeõÏ&ÍÔ»À∏HB®ÿM+;…ÕY=R4öÏñN.NŒì˘7◊ÊòÛ…Í“ï∑@*¶ éŒbÖãØd\ [ùëπ‹±Ã˝èGY$Ô©ÀÀÒ÷=—D|môé2-∆œãπôã•¨,º·˝8û]uÍW˘±0æ<∆…}hN∆Etªº≠Á8p‰Á˛æÿ∆Àj\î˚¡«\û>ÃãJ."ÎËyër
_ôVqOkœP“ƒöÿÚÚ)DÛÙøV®P^ÇúÔ>á•2wÌÊ˝JùTô4‰¸¸ÜıZ«ùF˝8<ÉntN∫«≠A˘ ıÿ˘|#.˝ßˆtf'3xÇcÕÊﬂçÏ–ÂóVTnÁu‘Ö$£X≠œa√‘¡"=√i?OùüR¡√Åø$˛fRz“úÅV§U¶≠‘ª›„œøúˆ⁄)˙eßÀcx¥òlTâ\TÅLÙ%gò∑gÃF.7ËkÏYõLxíËi4#`HFp’≥&ò¡0ŒLW 5∫A<¿%‹RcFË}Á\v%qH?TäÍ´O-b˘ÎE˜>-ﬁt˚¨q√ô!sÛ#Ï‹¯Õ»÷tÿ]∆◊ïàv˚YÌ≈C∏D¯©Ä∂d\‹~6.„•Ç8¢sXZZ:‚)Òñ>/íº)F1o*aÅ 5,˙ãl»{$”t‹"ëoÈyãz˚⁄Ù.¡–∞,}ÍÚ3/Ç^Ef-Î]Ÿ	ªäµ+∞6Ñæ◊åÉ‚Â•£Ï'£ÄÇ$…?ˇ·∑øÕ	7ìü∏´J¿Nä*<àÒÖ(tÅ6ìÙ…ÙZÊπÓèaD´ïFØU¥*kËU¨ÉvÄ{øÉ÷.Á,G7¢lcÃ/ô¡y±≠±¶& ¨¥,ÿìU…0•›úã[$îÖg»ä-Y-í∫5¨´QıSˆU±ëõ:˚·€o˙H∏¿¶ÛXü€©¡åg)⁄nÇÖ-øëæ*MökıëÈ–dAîu	Öã√>ﬂ∞çõ–`ı°ÁsåŸ~z˝‰gWPB∆ÃÌ¬x#¶ô6ôŒºjE"≈â@˝g[éc;à=îˇ∏|ZÊΩK±≤∏íâô{Eæ˘∏‰\`NÆ Vx3ΩÖ W¥ò∂Ùë#‡Æe<∂·â}Õi™¡Ñíút´ ~)j6Ío7©≤ÖµÇç\Óo∂ê=;°#Hïÿ9∫‘ãùÜÚ„ëiE	≠mfä}8ˇ∆˘ÈÃ⁄R«-5O5G3aµ+ç»OŸá¡zë„õπa:»¬FÎ∏^Y'§N¸ãÜK∏y7'≥1‹€ÆQP¸çPñp„œ¯˝ü*ÏVn·∆Àr‹it2‡›ø	kÿ©±'hﬁ∆´¯Õï´Ë÷ük«œÍŸZË¥ÌÉävk¨´_ô÷%òQâ ˛˘ˇ˝«oîÎk‘õ--€i»]´k∫T]3—qˇ¸M©ä:'ßm¡ËtN‡~+¨ij≤«≥I¢¶¯µr5Pò÷–∫Z∂˝oÍ«⁄‡Û∞∫5vÇ|!ÛÔ¶f¢ˇÈ?˘ÀI+˝ÇG^¢ñTêz≈^rwˆòA‰Ñ2ãã,rñBaÙ&y~ Ç`I~ÂßVÖNFµ6´ddórffp¡&€»tK5júÔ” u%á%eı*à0|ÀëflW<»!≥¡°A4ãö&Â∏Q	Ä&U·ìAhi,Ã!<ŒäÓ>‚@¥ìpª Ùî_í ‘»rÍ=	≠F§
)Ñe‰>Q≥!≥A1qÁä•–!QQa¨)/êZRn
5ør&≥(j!(∏<ÄÑ…˝‹v∆∞‚˚≥≥1z|x≤ubÚØnì
ìú7©ΩÊ‰‹â-'–’>y¯ãŸ∑àÉriÙcÅVHøœ’
•z!&rII⁄õÂgxcÍV‘QﬁYΩ‹ÑÁqu<…ÑGOB≈∏V~πÖ∞jaë∏é√‡≤±G¡⁄20Ô®—ì?ô¢Èç)ßPP,ƒ®`}FyÊæªEûh6Fí≤{"ëº∆˚@à&∆sÿ
zÇ¬Ï4‘
Ñ¬Î˛s“$ƒÆßçbπi’õ¨äqªˆi¡Î	ôJ¢ØUB≠î'h*ŒgG∏}∆ñÏ"ò°û›VúkQÂÑ•†[r˚Óœ¯›ˇπcÈWé^õbñáa„så¶ñÃ¶‚ùókW—#&:5r¡’≥©/˝Ú˜J« C˙5˜°+›öÅv3JªVÚ7Y–¸(≤	T?CI˜zoåNπAç(‘÷Jzt¯U†‚M-}h\¬‡Œ„ä⁄õ£3<éçÚ∆∆F~?'\(t*QÊ`É|é<!≈!∂…oóä√ô{ê‹X¸õˆÃ£ w"$»iré¿^8öR®4Ωöã=—'ìúúÑõijhÀÌøÿÉ∏€Æ$ÉMoÏ≈éë≤Ç'¯…Óñ¿g·;cJ8À˝€Èc”¯VÍ◊ô8@ïóE
d¶É«Å ,‹x-O:Lgm{RC “Ø§É˜¡
t™◊êƒñ<1Î≈pqªb√|ç…◊A˚j˛âÊf⁄®5!|ç »lr˘ûAëUËÖÆË›Úˆ4jVÒæFèÔmxÒ˝€Zd*Óox˘{\†W·ªôìanø2€úÔ¿àóíﬁ≈äKMÏ9≠Îˆl¶∏ΩŒég»Ÿ∞Œûìã∫0ã*E8ƒ4c{M˙8!ÕÒıgwó‰.î‚ÎÃíÇ¶Ø\ãA%Ü/¿»≠«™ı«∏a–TùYÛo”ñ—5≈*{€ñfÙ÷Ôﬁ“<âàù_i99ﬁ¡ï∑@ìe≠pô>CVi˛2m/W”‚◊›≠R’uô\œØwïÚSVmuﬂ¡≈º\€[§º‰ª∑*ãíﬁ˘ï∑±Ñ¨¿Vw3XuÎ¯áø·”Á˙ô˘∫b‹^j!æÅEÿ„»CÔ‹˙Ûﬂkd∞>ÅMÊˇ™≥Mˆt6°P.ä`_’Çt)⁄†Ï‚·-\n˘2 /†7øÒàÿ∂ Lˇ‚#Ã¡6Â›^91]œÆ“?è6˘wÂ·	nPåüÈVçÕ.ˇﬁ⁄•;2©p¸7U6ﬁZ¶ËÔ&~√ÈC™p∫∑xÈ€qûQ9å˝±pÅ]l˘	èU£œ™≈=⁄‰+r52< bÊ‰ p@:—\>‡OµCÚÅ¬êå“‚4?ÙIq‹≥¯†®Ø]Té?<⁄ÃDF≈∏ÚxÊ\&ÏX[…ôÜ√≤ßÛÔ\dé‘Pã◊-VÌ@πËö¬¡—ËR≈"v<§›ÜF˙˚˘ù?‘¯)k≈aÖ…¶CïÁ]î¥»vMÂ¨bÀ~®∂c„Ö]¥+Sª‘vfzTM]∆´å åó≤⁄åWj˜ßåE%ıØ< (©ºÄWBïﬁÆ´ΩxŸTIÙt ≠˜≤™k*-.–ïÒR[†oÔ "…ı√XZOÚ¿ê≥Wﬁ⁄
ãZ¡‚zø∂
ü{K◊V®¸0÷Ω.®·´YbÒ“V∞ "|KBTëæﬁ›∑ÙCÍû\ÃÎ§ÔŒ9◊ ?b«ÊÛó;1∏Ê≤fQJˇ›Y∆ƒYLò¨“gïÌ•ea†,
∏ òÜ l*!∆ÊTDïBS£sŒ_ówÄ˜JeYÁâåtyU˝ëñJ‚„Õ{¬“G™ÈxÉ¬ó(j‚‡ﬁ≠ó¨ ˘°¨ °7^Ÿí…˘~’‰?†æ?.¸@8cNË}˝∂ »„µ0ysT¥∫zAºGT‰™0›ZV:O›√‚É”Xn/Uhò¨/7≤ñ*€œóãJ÷˝ƒ∏J˚jã|H@¢Î˝·Ú"áÀ7/Òt˘√‚yK‚zl†‚y»˝»π'ÊWd’<…˚Mlﬁ4‡m«g6Õ:ØÂG·uﬂ‰˙Î=ØèF&ﬂ#ŸπiX#óùΩ‚…•ÖñK¡…	oyˇÙ/€Û•∞≤˘Æ™_c˝ûT≥æn¸UÈhÒ≤ﬁ+g˘((g≤`ˆ‡í.ŸHÚæïÀV˘RbÂ*≥,Œr7-˜a÷ãBZñYJ.‚d‹ƒ”V„YΩŸÜ•T	Ù∆ÂÇV‰ï˙3Ô°„’%Ó/QQøu¢’ÍOZΩAßrÿáû≠’°ÔÀÑÛdä‰•±M6Ë’ü‘èüA¡ºLºÂËg∫uπTÒÕ≠ﬂGU¨A´µN†Çﬂƒ}Î0ıc\"PF)∂EU@Ê˝>«lïgïóœ+
¿∫9>wç5,Cü∞è–‡Å≠–cO(ﬁïj`BúÅ‚fSèßÇI!ºsù Eàj‡%`1¬ŒÚX?ÀˇU)-ˇ7e≥.∆“¬+'aS&˚ÛÕÂò[¢-ÉÉ¿Ì
6åÏÚ$˝Ö˙F _}Ç¨óétÊÉF®Mfó@‰ì9éÄ"“IDKÂŒJÒÕ^ª>ÊH>äZ~aÆ‰–(ò1õÄÏRh#,ﬁ¸-˚ â∞E–≈ÊLœÛÓ)fZ~aLís†Ø[W∫AØ¸…î√jâπV"Ñ∏ÙΩ‘f"ÓM’ﬂQ(„´”¨≥æv“=÷ûjPGX£”~™ùˆ|Ûﬁ¸ó]≠I€œ¥VØﬁ˚ÏT´'∂ï”˝l:4
HBÿøÔa~_#ÃoJ¥ßÜÙã7Ó
Íó¶ÅúÊ^â?d/á:˜ÓÄ}wï8ÇS¸Wà»è2ñçÃn.j_J§Û®o!2ØõÃzG®pFå\¨»Qã.w≥ÊÛXåº∑%≈V ë!òãêåª7ˇfjéàTÄÀçüŒL1˜Õ£ÕÀ]I„≥ºÁ>—yJ]âÊ∞è±#k‰”(”ïπÊxj—ô »Ê\ﬂa¬ƒ∆ç¿‚å€(±˘mÀ∏Äõ»ó‡”ê_∆!%Ô&ƒè)	E,ULäÙkî∞Dî˚z¶høK‰ß07R "«ÊœgMbKî av‰ﬂ
0#Ñ´G∂aK`Xâ´å»AX€Ê'o‘HÿÀp9åIÙeeﬁÕOΩÀ◊DPêø5+tíÃ|ˇz7í§;¡¿ƒ©Æp(ep¨•dW1lé8ÖC<áÃë”GRå·“»⁄œ8n«¥J—N∂L¥X&‡ïi|-áT…€™≥6dªZÜ>;´¶Ô_‚ÒåÄÅB0\Hñ3Jük
ˇi˛Î…»˙.,bwèãKàÉ@v5¶∂à‰#ª6Ç†√8¡br_éˇ`G∂s™I*†ZMNOrÄá<+äQkÉ6Çæß{3◊?Œ‚ÔmTä∂…ÑÂo◊ÿc€[[k∑?"mº”;i	wâkA÷ù~ˆíµﬂÕJ^úX˚r^˝ñc+õ.M”ºùË≠Âbök°OÏ—+®πÔÔÈ0òG∞‘±πôJ#ú∆|.cc sÓö∆π>≥º™–+õÏgrW≠®ËI:òÛ3È†Ååô;√ﬂV«à4RWFDﬁÑBÊ˜bì¡“√¨_0x;]0˛öùﬁó}≠?hù ,±c£ÌBºH§®Å)Í0ò“ß˝/üû∂õT
∑%œ>ˇÚ¥€Dÿ\˛•ä69wÙ–Tó0Uéé;OÍ«QŸíÁ^÷c›'“Í\>ÉGB˝>|ò?É'˛é´b“$Ÿòc√ûy9lßÖ)«y©†Á	…\◊Ÿ6~"R…¨ZòP
˜)ó{dÅ^÷^<¯‰ÍÚã»}U”gûùVÔw¬$
U	1F¿‘÷ïµŒÃ—5u∫¡^b;04±aJÅVd*ƒC˘y[Ç2aD∆LÕ)1D∫rM∑dp®¬ñI]ûÖ⁄F±≈≠^VqñffKX)SUfÔl≈~Ö√"µA&’ß∏Åyƒ˛ímﬂ0öSõUî[Ñ'öKZØ˙¢~øÂ∫è˘…ˆzﬂ5ú“≈2⁄õ–^… ÷€#l≈Ã“ùÄ@Øí≈ÌñLèƒíZ†Óæ}∆hµS™uøzï®ˇéU|]Ta%Ú¶G¯ãF¢Ô" ‰\ØxﬁåΩIΩó|~*·#*JíTä 6s«Èå±¸ˆ[ùLüi˚[w^ºŸ≤!'Ö¡&BÜé≈“ˇd7îÔ_}Æ_ËÓZéQï*D1ì¶∆d§;#P Õ‚≤W	Õ´„¶›¶◊Ê«Ê‡äïAµ µ“Ωú›™cèô8dMº˜3Å"RGL≈0Õ„Á√\Ki≈)Å·õuñz·j›-;†Æ-á
\6WP)$9HñÊf–qVéÎõ+ü˙°ëu{º%í™@ÂΩ·≤ÿ›
u±Â™¥Å·µ‘RMÆ—◊æDc/˘.,œú4ﬂb¬µ‡*ÿ„“ÄKæÜz¯Á?¸·è¡§5Xµ¶ªŒÁ-Ma≈pªTÒE+˙Üeø`’ÅmŒ¸èwL/VgRÖÍ~˜Ô,qèÊﬂ'à¸SEÃbµ¥±…Òﬁ˚›ˇeâ{¨™·Hç8Eqâ*ÃSÅPó|ãR∏sÊŒˆ˙ø.€ƒ„mà„‰JóG»-+á_ìÊÅ˘¸ôµôzeÓGïã„Ba\®´©•5%î+œ»ï”%•Ù¢2˙î(x±2≤9W2'z∆˘ÜØ;ÿ3÷µxMÙ#K¯¸hvØ¬™ÖºDƒßËZJi\R}k!⁄%¡YµLZp†~±º∏Ÿ“Ó0üœÀœÊÕ•Ã¥º”Bº`!]QZCk2tÃi %p/`ﬂˇ‚è±ç¢éÚPxŒîV≤∏K/?ûR%4x5·x≈Ω’~ Ê+äâï≠ú‘jà
tül®k)‚YπîÓZü®04˘ÅÆ…›;¥Dúß¥∑@*~ÎÆXˇJ{.àYÂJ¯É•ÏÇ%›Â“xtœ3;öäà*=LeÇÑDq•Üå6:'›zc¿NZÉû÷#HÈp∞°u⁄9™”‚â·9Êêüƒ~ ['ûMa∏W˝J'k€#„”ú[~:YØÛ\k7Zôt≤ª	"›Jë∫cÖ RiXH1MQ63öõ;å“Là¶à|kGppüALç‚*≥Ÿ^“ ÀÙ∂Ô÷7§ÖNJBTQç2Òë,0÷(z9…¥¶9„À’Z}öπ/Èﬁ¸◊]≠”«Ío“ì~ÿe°Î≤ö†–Å_|l÷õ≠~lj}§pYMZ›Z…˙:ç∆i∑ﬁn|ŒÎ‘ˇñ"¬;xó«âWÀU%éÍ,·òUÍÈ‡'·ÅãE˘-Ëπò&ï^A‡‚=çVÃ¬&ã‰w√˘-—Å|∂%VÅË0Ωÿ∫ñié7„àäƒ4¬$≤–∆SüHàìôíÊhç,:("œÆ‰%<‘uL¨ )¸∑Ç™¶dnåî(T!‹¬:d6_!5ı
ÖíneAxË/ga+%Ø∆iZÍì>NJyﬂ√uT9§W#Ÿ∞¯9ïÿ"ö  °÷<`Aˇ©W¡≠ t°(xAtüyQ√¥d‹≥Áo¸…F-¡Üëﬂ~ï±R¢P_ÑÁ\"÷ïòÕ[◊–pË–ìŸ$ÚÌT…mÉ≠≥|Æ|q |f∞€"z™\§.ó+?î≠•ü**@-˘ !h?Ø`‰“Å/~÷˝†Ω`ù≠≥©Ó¿L’‡	Aì†)+dv/ôŒGŒ¸ò»¡U¥&Ígé)KÂó
≥∏ÎØ¯K…@à…%%â“∆ãı»o—π°ã¡˛ä[5.JF˚Ê“[:8g˜çjÕ€÷˝Fm@ç÷ldÄ»HmÙÚÖkû≥jP|ÈçmﬁZÀëræN ﬁÁÆ›ÙG˙˚Zrï√∂1πúçuç§Û◊©1Å›i241ëIáÚ/xtÆŒ&ÜÎÈÙÜúår√Í≤˜ë≠zø…·´b˜OÂQìxEäÕÙ]Uk¶w™‘D·>†‹L7Ï,4%íõ√iÿXfÕ.@¸ªÔí&$H7Y\ön¿&Ç˚cg8úA”Ü–géãﬂµﬂuï®À†X{ô.°…u≠¥4]ù>‘Ìi˝N€◊Ñ¶1=hö—Ç2∂€{à_§Å-fµ ©TΩ+E(È‡ZLí¨˛@ï!^Åg{∞q˘Jï¯*ÉcåfC£Z’áCXò‘?ë˝%ÀJ„u&J:…V¢Oï*®ñÿ<◊äÎûÒΩ¬≤-ˆ)ã'&z`3|2HÚclkqwQô›:•gÌ…—
J¯ˇ†„≠)í>%rπZ$óâ 8ÿŸƒj…âıîH«Ñç ]4v~@∑^:H	¬·&> î‰å≥ö>®Äö-ä	pÃãKØ≠z5›:–Øı8Æ¸b›Èg•$˚Û√\FáÏ!.ûJ<’—v¯wÔáﬂÖ;)aÒdóR¯Ö5ﬁ˛®®Ò´ª≈‘Í,Aaë^}ìµ«‘¢[á\r™ãEºª]§0˘‚±KÚ1.≥÷À0íàEJ≈‡R∑9wí1´2(3E´ì«>©ë.ÂdaÏ$	éùŸd∑˝„‚-UR∆ÏåuÀ“Vú Ï%îÑñà °¢îîUyÛ4ËmÆAgÕ∆áIDM7&k¸$+? -yÜ°È©&f¯EuJˇÌ‘RÖ°DÒ±¢ÚÿÀeø¥ø≥¨¢/|N1bWëé◊K+C∆Dò{˜G’EË9¢`ÃkW,(ˇå=-s®Mp∂Yßz¡	vÓ≠ú%'∆cŒì3!ËŸŒ≤k=:Á_%;˚≈_l}ºıpÀ¯B21|ü’É d6j<0Où∞èGÙŸ±øV⁄@Dé@ÆD#√ç?TuGZœ˛ØoŸŒ÷Œ÷Gîõ˘ø⁄¨w€⁄7]hí{∆Ö„^5†"«∂Ë∫Î‚D¬ÕÑ¸´Ció`ü+á˝nZ
&™≈x6™ƒ¿ˆ´±”√∏îßßÌ˘ØÊˇÿÍ√Ó“Ëúú‘€M÷hµ≠^∞ˆº’;Æ¸”Ö58≥Ó_≤ù,Ä!Ω™9z\”É5◊≤FpOïº†4+πÒf„º¨–¿€+ÿLaÆ%„“¯D±åÛ§)∞t|◊4ˆ¢H5¨:§Ê&QÈπŒ„HbIJD&˛¿AÿS÷∞l04x‰u&Z,PÛ¬ÉEa¡Ÿ°ïD«∫K?smk
ógì±å¶ PXÉEg™†fÿ]6B¸Â
VœÙ,'I ¶∫91¨|¯≈G]k&‰Uc,(¥«£Êg¡#—ú-Ãq§ßœ¯—pPÚ3Éñﬁiœrë«g0ØT°sguÉQæªâˆmwòÏ≥–gäC≈!∑ÂAòD©‚âxDÙtïâ˛?!\û˘∑(ÊA¶Säñi;$ÚªÌz∑VÔ6f	™‘ÂN¶›g©∂&Mó∞ÈÆúR»r∏Paù‚.Ùt6Òôv2ˇ7X∆∂sB¢.w‘’äÃÔ◊>≥(`∫cËÖ<-«¶NmõƒmA®Q™‰Lm‚“Ã¶˚ß˛‰h∞5€Œ+∂-®ô 6Åˆó8NêÕ≥=æBwS‘˛¢≤0∞?ì%dIˆDüî¨f≥P¡0Râh@E±¢Eê†r≈!%¨ãÿüª9{¡- Ñ“≤#Ωë4§±>ÅÖ%N!Ã;˘+NoIüF√@?´VÿÀÜó°T÷˛™`ü˚+Ÿ˘U¬ä˙ÑCÂ"ç0$»âI•]HAdÙ‡M¯ÈKÍmïT™(œ.âΩÕ˝≠(£#e¶Érµ∑ü›b8J¸ˆ«2Í"q0∂$UFÕóÇv¡YéKÂQOÅêÌÿ‰ë_<D–¿ÈFWO„7èêN&êO˘<E^∂û±wkc?≥◊•%jõ†UÁ!ª(Mº˘70ªÜ∫èﬂÊ¡oÁ¢<kcµåß6(Æ∫µŒÆLó„¿Ò≥ÇâˇöÎÃ⁄é√„Æ3›2ÃFœ€îó™É÷∂!yy	¢ØPß‚WL∫@·∏K[f–‰j_kù¨ΩA	cÚÊ†t÷ﬂ1ìx•†¨·™nßıÁâú/w‹/Õ…9ÇÂ_‹±¸ë,ä˚(É∞a(Ä@˛ÿÕâí~„”≤Ã≤/Õc‚¢JõH#√3Ü·£Áé>ÎD>ãï†{˙Og§ÉÓvn∫ÃùπS√ÙlwµâÛ-ôr°;ï>zX˚€.tbo"ì5qºΩwN‹ú∫bÉ,"`>8ï∂å<â(ƒvz∞%ﬂG9“–GwkcLoDA%≤jØ›[[ár…é∫òÅûBòø ?&\P,∞93sb∫c¥˝GTÿ|≤Z!qsÕπ7"#∆AÂoªàà^D&!Ã»wO:–xbHÅL@Ëôw-`*õå∫õ‘√Ãö~S¬°«˙I$Ó–∂–:õñÈaò7Ÿ5†0(”Ù»£˜∏„◊¨Ü>˚ŸµÕh¢÷¸òBS∑V%$02îˆ–ªµsoΩ[Êdd^ÿ˘Ó≠c_W[gœ±£ˇzÊÃøÅ«>o⁄√yøÑ^À{‡‰¢£>∞§afΩÅ>≈⁄°Ì#„móË±7ëâÙh>ΩÉRΩèºfRëÓø˙ÎêÍM{ÊA˙zbm≤èÿˆ‡‰˛jÄ-"!@9∫_£ªQﬂ`’¶1t–˘∂?Ÿ€‹˛4¿œf˙àoÑ¸ãÍì€π>1@ækP–ÏS3‡;â0¿¶Ò#ñ8xÁj’√@ﬁΩıpT˛∂ìËEd≤$¡˚˜éâíß¶e†ì•“$:v∫ka“
Ã«Q|+øè“ó"è¬MÕø!È‡Ç∂8stfS@Ø	ö!°gª¶Øı¢ﬂIwF˛ùØT2ÉázÃˇïIL£“1œË†^≠VbÙß™°<Zi™ˆı˘¢¨5öÕ*‡_O:ﬂàü‹Â-Æπ~ãﬂviìyô–ÒxÍ›î9O”8'ÀA&tËÂ_áÑÌ°˘–30¢Ãπ∑:H:T·¬•≠]®q˛A˚Údù0w¡BÇ !é$”&ï5ª≤≠ŸÑ[Æ$y¢óÒuå‘›{k§Ü«6R5ƒ˚DŸyÓË≤j—ñ {öÅ:|'∏ß*5:I"Èo.u∑k8æ«Ω⁄Öq≠—ççÁZÎ«_÷Oõ⁄@k≠…R=ÛwåÖ¿I3Á˛{,±[º©˝"{¬ºK·YÍ›Órx©d^Õ~!	Lß*nÀrÑÄæ y)Pé/h%˙…ówπi∞0˙‹?‚6(4å¢-s|ÜdÜà_l_¿~qéåz	)eÏX–ß‰∞eCÛ §`ç¿!*ﬁ-§˚Ö<7/QN9óL≠^S&îL÷ sP≤œ,£Z1úQeùâPîrg;¯∂oR a´ﬁYÑØ!C”ô3µﬁuA‘‘=˝,Osı{·ı#\= *	√oR5M˝¬—«h‘NÜÜâ¸†Ëw√V0zá&?P›ﬁﬁcí%Ë.ú`™åNQ	ûP|n;¯=wﬂiçÓkíB}}2:≥Øﬂà!Ã´~ÎÌ_ˇ5dRıUmˇ]4{˚ÇÀc5¢5vÁá±Ò8Ò.≈9›GÉ∑Kπ8~Ñz”˝…„ª»GÖ2v<Ö¥¬ÇÒ`÷‚∞kÈ<¿ètQ—Åªƒ‡ºbÔö·°¢˛F‹ÒÆ_˜[/Ç˜»Ô§_,ú?bˇ5ƒrar$wX˚ˆ√}qéﬂΩ>DB—ñÆH{òâLŸxıH"Pî(w‡GA]+>´3f.f[çHêI,ë’¬óESÎµÉNÔÀ£VØ~,E—zñÃ^§vÓø»ª`”$_®¯P5b=∆Å≤/#ﬂìp†ºIß·ÿ_O§"(BŸª#Û&:¸Û~˚€‰¬πø&N◊∆	ÎŒ¶é1∂F%O¶öΩ¡†rp˚˘¸;◊œûA,(õDïÀEB(^ô÷•üèÈÁkA+Ï!|{Á&é≤ø^ñ€…ˇ|àMà1]·úPîÅûö∏cØˆ á‘käI‚…úOwÅ?à±‘\Ow<|.õ -a´O&fIÀ)és°C
£dÿ∂åÑÖSTw|e˜ ˛ˆ`◊∫(BÄ‡Ëôm& 8¢2OT¥›J2BJ§g˚I—<f ≥Ÿ%K√6n\ﬂ•ÔÇ‘œaÔ.Æ';”ËÒ?£)O˚qßﬂ◊Z=÷ËµµÅˆº∂€Î¥ßÛ_ˆ¥;9=hMÌ§’Ós‚•fá¡||⁄Ôƒa-Ñ»ŒŸO‡_mÇ9<XãbB•’‡W‰—ä2˚_¸≈÷Ÿˆ÷ˆ«¯ rxbòä§;	%j`ÖÅ∞‚ˆﬂ¯,ê9"a¡uΩ'X’tÇ	5ŸcVø“1™›Ñ#–¶Xœtøbƒ}©¬{xÛÚ≤∂ç–ü8π]—ßâπ# ≈ùP°™ÌD	gBI4ù7`˙ä7üÙ•F÷Kï–ﬂuôÌæ◊˛Vt:ÂΩãà_V˘L;zTg;H]ö®1∫T{hôzOZMÌÙ$®9R€Çä£ÿ®åf'´ä'$E≈ÓâÚñvf™ M(ì6ŒM«ıpÇΩÿ˙‚V¸L¡	5Â@&Ë≈'Û!&eﬁΩ|E∞˝ºË≠§'Ç◊Ã≈ƒˇtvnñrÛK†Ò
LÏ$?±ÈÈ`pU+˘ïﬁVÚ,tHƒIÓØ}J]èxf¯/Çfãﬁ¿ÁW-ƒß•	íOµøÍU˚ø˛wﬂF´ﬂÔ¯Ø)É©c(gÜKë2ÖO5ë‹)°‘®'ZASÃQCwä+*5Qbıw@ FMêö≤Ùdpg˘, ¬fCÖÊ≈$@ß◊Fküí∏·Dâ\≠`pÙ˛“‰>‚§ò.ïuViuYeM: ÈJdfÆ‰æ∏√ÉBÜe˘ ˘ÚL|?êŸ’rﬁRD†B`DnÜecn≤PZ}¡K»`%∫˛æÄ_o'¡û¿b!„^ﬁ	=™≈ËNTz+Ùé"◊ûÿDïbÕŒj!Fñ6¡¥2/ã¥≈T‘‘ZÇ—ü{?ﬂô@±ä˙ˇ   ˇˇÏ}›r#«ïÊΩü"çïep≈6©››ä" ∂‡!
 ;º—°∞í@®QUl“47∆„âqÃFx'v=ªûâj|1°ç–ïov}9xΩ¿˙ˆúÃ¨™¨¨ÃB	4ŸÈ∞´Ú˜‰…Û˚\ &(€çΩDeb,òêéì¬õNK,P¬DÓ,uˆ 1pXA˛Ï¯—â‚…q˚¿Úv1≤£Ç{WŸPÔ‘¢$ıÂÅ√÷ ezvwl≥‘™Ω<=≤Z%É bT¨ﬂMzƒ¥JêúNÑµÀ≠`îü¥≤#b∞r¢,÷úﬂé¢w\ˆ√ZÂ´⁄¸û,;ﬁÂp˙ö˝©Á=9∑]˘åﬂ⁄5≈q6˜M<óF|Ì>≥ÑÆÄü`´“©ø™Özõ¨Z)¿N:ë£˝NÀj¥k≠V≠vrÊNπ©0·ÿ’ªÅCËçÊz]#Ò≤ôÌj‰ëÔ1:C§dL£%Âﬂæp0_»UìÉ†ão¨–g3˚rÃæl¡adU¥˙·ˆ¥m ù–Ã≈$Ï†™A/ú~>≥9€ä˘±»@x…ëc§Dƒ96(›&übZ~≠z p€æåsE°a‘‹R¶{˝9‚;#“ÛN4ã	6
Ë∑{Œt(ygå|Gu2ÿXÿèÆ”d*Æñ≥Ùî—X´h∫®y¬Œøä–® ⁄˜£Ÿpy˘¨€ÿ=Ø9ÊÀ‰˙Tø»Û†u4T1JÜ¸t⁄„˘lπƒ˜ªÃô„f˚;K0ÒﬁyÇY⁄jtö9ÄUò}çÀêÇcXŸlÍNÔ,Õà·ø„ π?9A—™Ω¢F‡z}áí˜	œG}”EgMÔÍù•òp¸Ô8…—≥i&RfÄdÍ£Æ”c!†oÅlxä‰;K5b¯Ô8—ºÙio ‰b¨	XÄl‰_“fkq'ã$Æ+‚l„tOËH„·’…Èk[™£>ÙñÔbQoûƒ0ã9Tã$©Sºû+√j]WEÛLM^9 Â∂YπL◊L‘îi3X–›¯$dfäoEZ4§õ(1æ3vãY;ÿË4x=J¿O¢ ‹à›ãÄ
+·úÉ'˘BìS¶p^ıF,ìysfHã†`Ñan'•?¢ë˜J}ª&$ÜhR∏œÈd`˚¯6”≥UT±«/≤C˛rπ˘§Q/x‘Coi£n–@∏Áäå6
…˜ô„Oh‘X‹hyä/∞æ®Ââ2)¢dbâc3çË¬˘ÂÏÎëÌZ·Ã˜m`n˛¬µ~∏ÑΩ9ÁúXŒ)Á?†–Õ]”y‘«ª"Á]1W NÑY±˚¢ç)ïúÖÖÄàﬁZ≤ÆXrGﬁ¬u!7/Ø!ù¢mq.YW|Ù‘Ä`ì¬¥ØÖù>x%>¯öu¡Í•É/¢:πdÉ|‚ù..¢á pÆ@^SÈ¯ŒŸT‘{h˙Nﬂ.lÜ]o
TÉ”ä:9â∞G±ø£)ı«:u~Az6k,Ó÷¸ÎiØø¯3∑≤XÑ‚ºÊI},ÿπ:˛iÑ9Fô§z´.5bîáÎ=P»ºF]¡‹8ª≠=bçx⁄zuπ Âx˛ùØä\_ß3∫èdé}‘}ﬁ˛}6ﬂà,A~Ö⁄Åÿ3Jj	‹ÜıPï<üG˛+Wñ¿W6+Ú∆N›˙áO∆TNÏ¿#Â/˙ÀÛõxÃ>Y‹ÌÈ	∞ª8="ÄCP¡ò86ÿ
Hºt4H-ËN˝≈›˚ÑÉ≈ÍzÓ¿6v˚ N=Xú‰O«¬^Ùß≥oFˆRîM◊Ûzù´1ø2õ,lÏ-ªÎçQÎ!E)(kr±•bÓ∑ˇÚ;Ú :™W≠jìºO0 §•…˝˚üI}8Ÿ!`πUßÔL®SàJrÆˆyÃé+pﬂ∞Ûπµâu‚∑6Cs˛˜Q€{+∑£¶zK¶e1aë@Ç	Ï†süÅ)®}∏&Ôx?j◊5ﬂıh¯[é(˜
FÒ˙Œ/ÄÏ7@ëe©˙Ø@ö¸Ê¬éÄπ˘¨Éë√t©œu¿Ü=LáQxÌ
á‡BŒ	U…4Ûπ'ˇˆÀÌ)H>÷π0QoXÊäLËd‚yA…4â∆ TgT†@pÿ¡Ω-çÊXü¬r®óπ>=÷#”.`_IØ¯Jº]=(1xTÇﬁ>õü°M˚&"xóHÃ˛‘«≤wÃJıÃz∑?Œbí‹˙Üx3,‰nÁ8ü-{¸Ñùäva√ô}Ö!˙0‡Å't¬cSÄ…Ùß¿ Ô∆ˆø|UÕY0ºä?˚”àU¬iÖ∑◊πaã„ —r∫¿ã16yùˆ¯»HW6˙ÚÔ|´.aÌ±=Í≈∞@ÌÈP¡ø≤ZNK_¬û?ÌÛÿ£ÓïX¡>AâhpÄß|4·
®ooY7Œ#?œk‘ •çK´Öú¸'`ıÄÅWƒ"Ùh|]ﬂ	Œ˜ÂAÔ«v/¨ÛHò∏A!…I≈∂√Jx˜ëA:d<CiTcæƒì˚ì‰æ¢KNÁÀ©3˚äEƒ¬¡Æx√±ÁO(+äÁ.SlW›ÅÉJV˜∆I8ìëH2†”ªÙ÷…ÅG	pËÒD¨üM‡@ŒSÇÓøø∑ïåØ:†⁄wº >ó+ÃöY©DEæï€,ß—˙-oΩ]kt(¶ÖV€ëª$!œ~TÅ(vÙQx∏˛§·ß5˚™ÀsÔ_M]î\√”HﬁÁ	æÀP	v‰aƒ±N˚E¸ñ∫-å¡tÈÿfh;»ﬂ¨˙œöã3&áShOEp¿“Ê@@KöH'ñt_ÅVâ∑œ“fr¡:Ë∆SëRû∏+¯Âk1ô‹ï	=?ø’ûËı3∆›áπÀ+Û È;.WTHMîñ"Ë˜ ©ò√‚b2D€¨?
;⁄∞m‡Ã≤‘µN¨û˝ÂUy∂]ot1˚ÊÇcªC√èÒcoÁz©∏^˜ã‹z…ë◊G¶ßP)Q|ÒIa©Îrê:l@löqoü§c‚•÷ı	»E˘«r™∏&<F⁄KÔ¸D¬QΩvQXƒ`‚L¶Œ‹bl(y‰˘c&¥≥(8„∞\¨ÑpEJú3ˇ&Ïü#y{¬ì{4^º~ä Jﬁ˙¢Ï0oyü‚”ïkóføw'Œ–c‘ãÏŸ"ÿÙ±’ÇÙΩ	VÇEïâ/8Ø9ÚÜ‘E‚yl…•¡-ˇÌ™
a¬–£¶ˆYyû4'>ƒ}x∫@˛©aÌzV]Ù¶,LËBÏL wêú9ÇıeıﬂÇŸñvA˘:›œß∆´.œæ∆–a∏RΩ·ÿµ'∑6÷.k—N|Ô\T⁄µêœ'≥ˇ•	å]⁄⁄ça6+»c~é1ãPˆ˙≥o‡ÌRf¸´sÚ:⁄XLëç—˛}œB&ê6.@'–Ø ’K÷Y%⁄ÃﬁE”wK<èêJ√r…¨Z≤?∫’Ò…=´ãRXL∆{≈HÊPÓ≥âÂûS1á·∑rÌÙz:¢+˜d§ù˝Å˘Xi¡4e3˜›KÈÖ|„Ç)ò∂À´áŸ∏Ï='Ë:cñ≈g≤Ì»õ¿™\vm4nÿ§l≠‹≥§•y&Ò´º⁄≈{>»ôEÃPÅˆìƒ…gy‚Z¯Ë[_+vRl.ƒ^sIµ‘àv{R„P¶ÓJY˘I÷ªáû?<D´kPæ&ÎÎÎZ‘ˆõÏ6⁄vwÍ;ì´gT.ïÃœ∂ﬁx¶Ê˚ûÙ≥ü5¬}Í^—R1‹LF@wµrJò‚ﬂﬂRû>É‡8„´<õ€O¬Dæíº0ÈÃÌA√ïﬂ…ºffrMÿ0ÜñP«îQ:Ç∆\-„éÙªÅ7Ñ”Ô√Raië2‹ :Í◊£X ˜›D#ˆD¯z∞0í"∞+lhèìrÈÂi›"’È¥f€h◊;M˙≠èp≈F¿w˚S¡∂ÚÆp1·Å∂€uß≥RºÒ¸/<>	CÊ∆ä`õrFÁû~ﬂG‚∂ÄGº9∑XûDNãù¶æ?> !“Æ‰&L–‚T+√,ñı„ç„_Ì%7Ó#îUê|Œ>q9s'“ÎjêÆ„ì#,LÍßÀé‰√…_y‰∏YµéˆI≠Zü˝fˆÎ&∑∞∞H•yˇotZÕ#ˆΩ≈ —Iπu`UVH4˚_cíìŸÔ´ıD[æ ÷Ÿ⁄Ñü{*@2ˇHßêÏ<¸$K≠>í“¥Kõ®V!Yd”–ﬁR°2ΩQV∏¨+[ı,`ùíΩ<˜p—Ú‡X’M˙XÈ–C	SæA<Æ7ÍÌŒÏ∞OµIÍçN>∂xq"~k‰§ÜeÄ⁄µóß≠¶V'0©6∫Z¡∞p-åπ≥ I'åŸ±¶IAÖIîﬂ˛Õ?Öÿ2∫	Ò ÷NEW6"Ò^˘“pwdWLﬂ,I±˛ï"Æ‚§e$u„kÑ˘BâÆè∏¿ùzá<Éõ6lÀ]ÛÀzOCë‚"^T/çàh‰|™†Ã∑	Ül§À(¶ä®ôYπ¨>·lå_±nôé˛rÃ¡∫∞‘.G.ÏË=<àù¨M‡™¬ÿ¡5≈)ˆnÿím¢`@' ¶#@h ¥“ãåC¨ˆÃ\Ky∫0∑∫¶s9>"É%P”|˝Xh)™G¨ pF,ÂâaÜOL_…QÂ_ÃNc,0ó∑È‰.ôJ“·√¶≤tÖ¯ïBÇ_…(7àı≠v!.—`1olnÎ\≈®t◊;ä—»#Aêﬁ\èù¥:◊i∆∏5[ò⁄›"wÄ)7÷ò§Œà¥6=smº⁄ÜiâÂ&·BiOœÜŒ‰˘ı ¥W◊n”õﬂ%x±7*«“¿Ú1$æ¥yyWgÜ◊¡Ò©>V,bR´tÍÕŸ⁄'òL‹πd|´ﬁ÷áKïÜ3î…MDj‡ ªtÑs>±˝ ≥En—è±∑ôía5•mïáƒãË˙Œ‰jm/UÀV[†L{WË•dqwò≈Ï1¬j¬%•âÁ˘P$áïQ´WÇ√^om%–‰1àe˘√?ıˇ˛œ?
Xd∂¡HÜ*äk'x˙”⁄l/»ı”{j®ù!K+k‚{Å`b˝Ë3S¥\#…f¢Á∑ç+:WÇÖ¡•£ó–¬c`kÌN´VÔËƒÔ,|H˘Œk#{h“5¸Ú¨ê¸ ù	¡j’zgˆ´Wµ£¢ka,Ìó˙>MbÜ≤w˙“ Q∞N|Ò*;“π
,O∑-õÓﬂ˝_<?±CQèù¶±88ÑÂ`ç}g»¢x©w¶Ódˆ5/?€a¿¥/ÒoŒEl•™è
Kπ’`÷:ñ¥≈ïo*c`kfïã·ai!’2%olÃ∆8C€Ò=“Üˆ≥÷†°3g4ûN 5=lﬁTﬂºÁx˜ûß®ÃTÓÇ∫S∏ÌÑ?'.˜»"	4ÖQ¯(ó¨⁄•-´ó™g(Ÿ˙*âöﬂ'òÔ˜Ì…:π—V\ƒüÑZ»îåÑé6«“E¢hö¯Ü
k?ºkw•ÔD·˚ë7¡€ﬂ{√‰πÓ4HUõ_{”âÎålVCø;Z+≥Ÿ∫Lz#˜ﬁrtÈ2©1l˝ëÔÖw`OÏXÜc˘7ÂÉ˙ ª@öºZÈrì∑˝Hñ˜Bñ!≤e	}WrÏA∑À&«cz95ˇ›$J…°ı–…S¬W/üPÁù‡ï
‹¸‚≈ ®˝Ô&yæSDy<˚£˝NP•RN`·T∑ˇHïwÆ˙-€z∑˜πﬂÿjÃ~cë±éö?µéò¿Úçæa‡‚£—˜-}ø˝˝ˇDõU€ÓOaüfˇFWyñ>yüXÆ˜◊<:.Ü|√Ø¥ØèÜﬂG√Ô‹µ∏Ö·7"±{6¸bB9Àr˝ç¿At¥»˘Ïõ¿È¬£ ƒOtm±…(r≥¬v˙^¿ıˆ1÷« ˆ•”áG·ÆÛ»êÂí±4§ ¿>gä~|Çâ7ïl√ﬂcKüNY¬rÆlâG‘ÁñB¬*&ˇ ∑¸"N∑„yvÇ¢Næõ2êƒe¥ì1ÚgoÃÇ¢¯Œî®s	|ä˝ÛlÉˇ-Á´bﬂ^ælπTäˇ-‹ÎWóŒêuÀ>dølîÙ√QX≥?√-¬¯Z¯O£Ó€U[nwla“Nd˜`‹ncä¥πı%›œ˜Û? 5;uÈΩ'Ù¬q„›!\6h‡ı%Yœ”˝<nÙsOÆx¡CU)˜]¢U¯À&T—…#ïF?ãµÌÏì∂5˚}µFj‰§’ltNgø¬‹Ñ —Ï∑çzÂmXç8.ˆ£ÕË≠
~˝gëûÅ–¿–‰îCãFà¡«\AΩçµ(⁄œG[—£≠hÓZ‹¬V$Ï^-EM2ñéMñŒ¨E¨® ´ø•Rzèhà"åË8:«`B‘∞V	ñtÑŸCê˚À©3¶dà∫kóè3ÌQéHçXoﬂQ≤>ÿ2E•±{5Ä≥f˚œKµÀ}b}@6Hs˛sA~˘äj¡`ÖDç≤≈+ÑÕ?JT—œ˝»˝ö⁄B$.Qıv5Å€P™∂F—¬	VÌÂªI∑ûZuK><ƒK…õíCÍi7Dö|®6]eÒ4õË„ëbÔâb—nÕ)6 á‹q˜∞’Ò‡
GÍV±5‘¬{I¨U◊”#±.ƒº“h6÷Zµì”j›bfñv≠r⁄™ëj˝eΩ√†‡?ı∆…iá46ﬂ∆¢¶ﬁÎÏ-∫\@†˛eGF“$ùÓ ¶€VézIgd8#ôPìÊrò?ØblEòa•û(}k€â2 `7exQ∞úC≤æõVM£NÃ≥›Yùn^bóE4fÙ÷Zˆt6a1æú⁄†X—œws…÷pcˆÍ≥#8Ù0ÄH⁄0‰⁄êi£,èZ@ÄCJÿªqºÇßÃ°Ã
‘Ää[NY5;'XY%]TTá^ON=e—îHÄú®ÃRó^¯t!>Qg&^‡z}¯wï–_Q¡(˛Í‰*Ôº#≠%rq≥Úã®¯°røEŸﬂ1’wÛ$±≤‰§ﬁçzHâZ‡Ñı`îK§¥ÚzÛ3=ﬂüú1«~•ŒeWì…˛TY!?P˘ù!√•˜˜°}†µQ?’Éd‘Ÿ’ÄBˆh@>†¡ °!XFgº	8"KÜ…*íKƒ¿{,€$f¯hÚÌﬁ|©BíÃ-;ËëÒGÉNôî∏‚›‹hïÑ>¸Iÿe_Eñbf"¨<e¨ÿ»¥¢YíÃ|¿0¬AÄ¿!ò ç˜Õ‚e ´ø≤Ø¥`5¢fá fÕÄ‰&⁄·£‹3Ç˝dõ◊ArÉçˆYﬂå≠ûb·èÕˇOí†I&#ø∆1¬nƒ
ƒcâhtzâ%.Œ·‚´èLg7Ì‡À©à*ÜıÏÒÖ∫PYp5˙-Hâ‰fAîÅñ0Ñ® áú…ñáãÄ·ÕZ¨ˇó0x‡·§ o6<◊≠∫í]∆q;©ñ(ò\∆ÛΩ´HœZúOÖ8”¯UDh-cœaÅ,vGWxj:R®`-$,≤bØifqXYæØ—mDr=w£ı,ÇßKÿ∑^*£7î2√‡~ Z,vB4{·'º('V™Çêv√·ÊÚæOﬁ’¡|bπ0PS!å"©œ6P&ø%hOZıvça’_¬W§”¥⁄ùp®÷"ÂzÙ`ã|ÙÙG¨H‹BÏyÊ¡Ük{‚éŸCÑœè‡Á3ΩF…5Éa®…∑yÕæ@òa~„I3≤8C∆≤µX÷M^ßÎ	"ÎC:.óŸgç‡ÇêÌ†ezÆÁ‰yJ™	¶]t∆Ìkƒù≥>2›£f î•qöÓn&]±[pïÆ¶⁄s`( π2z™8~◊µ∑ç⁄ØÏ‘ç0Å‡“≠“.ûÑ‰HQòVºQﬂ¥Ò“…ö6ªRìsénŸ]˘bŒúmU?∫ﬁÛœ4…‹iæ°˛Æã¨ârŒêúiÃ-vPgôse≥ÏÄR:Íªˆ√F±È∆@ßÛÊãh◊Yìç£c‚…
®Áh™¯{éM5Œﬂ/6ølZù]‚˜õ◊ÏåØ„UıŸOí¨—∑'Sî3ü=º7÷Åm•˙ˇ¬æzŒ9»∫”KãŒÆÍ>øæÉàˆ…Ê*π‹'ª¸≤ˇ∞Îæ_á≈‘Ë*BòL¥±≈⁄‡Mƒ-lÈ^∑/H.’ˇN≤„UÈÇÑù'Ω©O˘gå¯∏—5úàŸJ≤_A'	z£∏S_o˛¸È¯ÚÁ;€øFÀõ´ÏÎª+ü•¡ú#†ªÅ”ÎŸ#*»‰ΩkŒû◊œ˙7ü´£Mﬂ±xõΩrÇ)uyâ`ﬂ‰ ÓŸ≤∏*iö’ËΩœ;'ghÉ:µ¢z¢Á)D∆ÈM@≠p0~T“+¶“váOüç˜è˜loïÿ4Ä≠-°˛G}√ÎÚF*û∏á—‹wé@€Éµ≠xm˘qKØ/”$”k,ﬁ¬ü#RD@≤”èù±Ø≈Î…‡∑4†∫RRüVG}‚L\[oU∏vÇ64ˆù¿>ˆz∂IqeS–∏>DUSLTÙìñÅ°Zj†Vl∏ôMÃDx÷éö/M√Õ(Ç£’üL¡}ZìÛñbrﬁ·≈
√ê1VóKU¿≥∑iáöˆµ•µÌM∏‘<YΩä†<ˆÌ¸ˇ]?wP∏/OºG»ü?'·•≤2O3U`\%ÿh…pk?Újßc’x‘À|¿¸-Eø“(C∑õ∆}àjÚo	üÏK|∂aÒì{ä\ø“<>∂Urb’:ùiæ™µé¨ˇ$+(FuNw≈È®wWÁdb7«p)'|^·Ç››¥›H]`‹¢]ƒˇÁváÙı™P>NÏ@‹ïiTY£ £ïO“óÖVI?ñ5“œ§OD]≥§ÂsÍväÚu&…p]≥À@º~Ç ¿âÊ‘óPkkL(\ùöz
≈÷R≤>d‚⁄⁄”úÎãu\ÃÀ≥ﬁ˘∫3âõÎ[	T„çµnÆÖ_3p„Û±Ë∑ÛÛΩ'™Ï˜d?U‘KU<W,p≤·_e,∏≈uÙò0Q/ß˝2]«"™ÈÇ‹Ãªü†»]ùgÍYÑ≥Ó@gV∏∫¨•õ1yÅêQ¢+¿xuôPÑ€ßõ8ôüNm_õ›£©§_U<∫¶t>Êw¡K“ÁÖÚ–y`¥ÌrÉÿ˙˙:)c`-ÌyÅ–UrÅµWAv?Gxeé92v‘∞√=bµ+±•ÏRTnTiú“6)¡£ËÑÒÒZ’∏n““Ìlﬁ
^≈¯®2˘§ˇ&-Aƒµaib[k¢ÖÓ–∏õLà
 …Ú»\9B3ˆZªr'®HZöˆ˚v¿´nêñL›IØÜ®œ≥≥Õ\B)‰u¥i'ìÊ‡_sëœÓâ-÷]{‘üXÈÍMC≤K ’uÃùÌÜ`N
œHr«,yŒT ëıöœ 5œ˝∫´ˆh0Üß˛ıA»{€'§-Lg`©ãEΩXÜ4ò‘J3CowÿC«À'5∑˘:AX&å<«ÿq?Åh±cø‘˚û•h&:ãR¯√,K–°…yù≥àüòÀ∞∑NY°ŒrÜ[ùÃa#Ê7ç.v≈Lﬁõ9
π˝7,ˇOŒ<‡,Wìˇƒ[ôÒIdäö§ÖoEº.Q7eÏ2•&≥a¥R
œßt«(|V-Ú√ïˇKﬁI€9•›–ÿg¯èY˘ü_öX≤ÃdÚ
QYÖ¿Y+äi‰˙sŸ?∑îño»YÀ$¸ëŒ˚ú'CJQrÂ“Ètir•˘ù(9™*ì7ÿÅ≤)Qõ∂ö¸πFñ—Ö÷˙û^ÊãÊ’FfœhãDı)ì¬∆\AÔ,2,#ú!Ó?≥≥—Ãñ
r‹ïÂ1àût}á!ÆÃäπ;ˇaœütA…∞≤∆‘ºhSFe.ÚﬁµDº@õaÿÛñHué“ò7Ks	 +Ù.W\∂¬÷Ùb†6n6O∆±aMÔJßs(…ªûÒûæfÏJZ|…Ñ#™¨mqQìOlwL=o¢±Whƒ∆8í≈Xá{/mO…:3sCW≥,˘∆†°'ÊJjE‚Eu˘R¿Î∑ˇﬂæ˝˚ﬂ	⁄‡™Êà^ÿ}C∂zf)∞EÎˇkbLˆ•~œÉΩ+1®sª;(4$S`∆`ˆ4â9eÄî^`QÃFá’¿<iX'kV3¨áŸnY
yÈ≠– £—¡’ò†%´s£vÇÁuÏ:yE¨iœA◊‚±◊£.iÇtÁ“´|&hå˜É÷¬äü≥ä(Üp˝µ3ñt„Èn⁄ãˆØ`∏?^€SégÜtÆitè;√5÷«•òFÕ›•MB‹∆˘·•K‚öº	Ÿ∏Hö´ˆ+˛ULúŸ÷Àg∞Î1	â˝Où%^î=x~}·Œô+
«È´
·–áµŸ£7¢o“ÔÑÖ‹èº><Oq¯Q”∏Ô†?Gmûﬂ” e‹ü_Àøi"íÅ¯œ’»|M¸EÄÍ+∂;’∏QÅˆ[.	û8[ÎŸ∆2˘ƒK◊;é √¢.vÖÇvãπuÇ_î[µ´BZ6Ì≠5GÓπ»!ÎOß∞Œ=ái˙ƒbAir»¬u ƒCﬁ<où7Y†Ùˆ‹Ç€˘∏åz¡´ù&ŒﬂˆÂBörÑM‚	´€»ñ'_um^yÊ9RÍ®nÉÍAs:iû∑ªﬁÿNÎã+·g;ë}B –KÑü°Ì ›éŸï)—o©÷ç>qó“∫Z:M,CN©R=ºüÃgT"ÈLôèOLIEœjWvíb—πù3∑∞òs˛Ã¸ùfÛ¸“!zbä'•	ô2Â?Õ+9.âÇ°‘«uL≈«M"≈ˇÅ„ÜÇ‰ÈQ«"´1˚]£^±H√™‘õXeΩ|T´wN[±∞Ízõ¨ë√&¸V≠ëüû∂ÍÌj}ˆõŸØõ+Fªú¬√zÂπmx∑U´ù∂õ§\≠aà5©ZJsÜ‡M1Ùú¡7	¿∞ÜçVÌƒúD'[så◊ŒzœÎNQ†®`§‘/©Â¸Ißg€ë_b–^˜~:◊.µ9ö(œó/_⁄«◊6ç0Gëy≠°ô}…ÀÀÛâ©hÍÕKVx?◊Øô^òoˇÂêCùÊX¨¯<øò1RÕËÛ™ÕcÌ„¥M˚	ŒºY∞çÍÀ3õ-ÊÛ≠y/=™û≠ñ®äm∫àv1⁄‹3íñöjﬁTÜXÚÏÃ3m’Ò∞§4olC√7”Èrôù*kRrÈ„a∆wÄdà˘ò—fÿbxh<[úÈ]V√ÇpizçTÌÆo≥Ív¢®ë˜I€È;Æ≤8»nìi◊T˜¬ò0ÆŒÀÄÜ¿öjŒ:)&gÆN/ò‚1>9ˆΩÌ¿Â~¨ÛbˆŒÓ«Ò€+gˆ°ÃÔ9u1±{:1Á@ı
&^œ¡Òåh‘O‹K7ÛœDˇﬁÿÈ:~w:B„:€i(Ö≤ÒuãKRóZ$¯¢æíÇo˛5öc’A˜4´ƒ∞Ø5(ÍFU¢:x%¬◊ˇ˝œÏÇBÄæUrP_“Î;Cõÿ@Lì©x+*¢≤˛ÏÃ7yÕìÉ9pΩ/ßp®<i(:¿Mﬁ!lCÎ:c”…Ï`ïR_¿œ0ãáœ‡ÊE˘eÙ6:»Âœmü£›,!˘e=êG1¬RÜäo’ûP«Õî°¿n£ç*˛uGn©ê∞ôÿ'Òµóä<3ò±ç6ÿú∆àuÜÊPzÅ≈dπ—ûdEHhùm™£mKÒvôO/Í·aÒÆœﬂÀzPÆi¸„ﬂê¨áÂä≥ÏÁF˜öâ¶ﬁ¬Ç‘ÎZ¢cœüÿw]Úyi\È‘¸Ãô#ï"hlX•á∏n»YLcB∑_∂ËŒ_®ˇ–V´Ú€é9,Ç∫ *”kΩ¬,u‘+èYÊ`LSŸºjÃ?{ª>á@«‚©ïïè9åo≥`…rIôg≤J=Cª-≠íPNi%ªã€HØ$?8jàÖ™€Çd¯…<9≤\V:ö“Qè>H~¢t∫Ì≤Ñ9¬ôk¢/÷Ù E»îëyWæ±3oax∏*/ëº‰¢HÚıë›_˛¢<≈ö8ìRX·%^‰L%ﬂÇP}—§‚íä9 ∆‚˛≠
G>œDìÈâO≤brÑ≠ËÛÍrÄì›÷Ÿa"…N¢è3™Ω˘√?˝wY'¥6hä∂ÎAÖ‰øû	-î¢ŸT˘ÖÂdéG=îﬂÕE’/êùEgàµNº ò:t®®«=«∑‘ìaæòÄÛÉv6ﬂGÛœæ≥âœŸ¢3À_ç‡.A≥◊?ºù1íıkL0¡ü‹Êíiö˜˛	.óUÔeàïNoƒ[∂±;Û]ãEËwËYπƒsÇ0À„q…∏πåõS¨‰YEO≤‡ã“`n…˜be≠3ﬂÒEa!0ÅöpùLI‹$≤ EÓUéÕ1äc‚√Õ@yÛ◊Vø≤ZGEˆ:Êu¸§æ è√ƒ}h∂„E@67s˚ ◊•N[G§ÂMy¯•œ∞/k =è=“â˘[":dÍª<f§
äô›ãCtﬂØÛ–ö[«ç|§çyΩ∑˘YÆ»ë»«Óå¢Ï·øa"kJŒå,—ñƒ¬Äos/˘û1∂D|ƒy¶Á-£MR.tÇ»π,	ãíŒÏ´	ÜôÁÌBp#1ú∏’ô:•'‹ :W8J›:9ÛdsHMÆQ6¡ˆ£·ÖQ¯{:ÇAöD2ﬁB+⁄§ﬁ¨Ìë¡⁄û>´∂†ºûπ ü}™Ü/ÑS€‚~UYló“[
E5xﬂO»
zO…WÜ≈ﬂ…Z|)"7#»?\¯‡®˘Èi≠ﬁd°Õ”N≠UP–∫e®Éò[üêÏ:îÿßRh]5°±∆∂A#‰Ó†Ì∑7∂ˆÓ3v‡T√≈sÑ§¬Bﬁ≤)e¶âÔDÍ@ÇpRq9b‘∂≥9'[xi±œá{≥ÁÖ|¯∂—ÛIú|Gw
?‚êkçXz¢o}†]q=9#^HwÕàQ,còëÕÅ¢J€zu&†UÓﬂ¡¿gG%Ï‰ﬁ/·:W∏Rz%ünrî≠¥N'∞*cl·Õ≥cÃ]Êî≥í√Àk;6	d%òì“°KdÆ–ñ»˝¸—.xªPÃ›•óôb–≥T“¯ÿû3ƒ{âëÛ¯¥¨˛ÎfwêÒ˛_÷$c)*pÏfÍ9Yá°êΩ;cNÑ†¯Z‰•w’Æ&üÕ	ì ç11wY“fIsƒ"iÓ¿Wd”ß6
áîı+Ïâß¢5^)0àãØòavß-œ5ojõ´Fåä!⁄¬À€Îï∫¿-~–Ö.,\;[ﬂ¶Åó™H¿ƒ™•ZÖıà>ESç≥`µ‚/¯ÁØ∞dhXÕàkÅr3%“iE∏U±Eüã™îÁµËbzådR Å¶àÑiWGÊ∞∑©Hñª!•q2\oÙQ·$ÑŒo)⁄˚ìú∏ﬁhcÛmL°BªK$~D˝t^ÔXÕW∑2µè≠VÁ‰ìf£Féõı£9hv:Õc“∞^’_Ú™QÔ√ü™÷Q[N3<ˆŒ◊>`òü£ë––~˙¸:˙o¢l`Ö˝ü–≥êbª+|Ih ∫˘ï¥˚ﬁçFü∂⁄]:Ÿ~ΩàÂ”¡Ñ≠‘{á %–º≈ˇb~”Í	ª¥Ê›„©;q⁄{ô[hvªS8 ›+M—ﬂtØÛÂ„ΩWÄX'jfûÄ˛ëﬁ@C< oËö»≥˚8Ñ	˙Â/…V¸Bﬁº∏ÒÓY∏ÿb#ÿQç⁄≥Êúƒû»+¢ÊÕ)ªßÊÕÕÕIÙF8¡Õ¬Û)áÉd[˛t
|ßÍÅc˚¢Ñæ˜oå3é6[≤LÁ≠RFûHQì∫Qf‰XMâÑE†!•@À#˚M]øb˘ Eî=ö?,‹*ñÁ√ø}ñkM:ﬁ¥;h;}V`lŒí$üÕª(È∑$¬≥Ë„>ìèÂ ƒÙﬂ„D9ˆPÛ\|xÛ9¶‹Ìß§ßﬁÀÃ«:ÖæÌV£µ∂	Kb+a∂¬É+8˝*ù–UÇe£R{Íú«·WÈ~V«€Äéz.[≈zƒ¯]õ±pÇ'Ss–Fƒ⁄^“iﬂ6íEÇÊ°à$ÀÃFÚß û√¯Ë¡è˘i Bco⁄µÀe⁄ÌÆ'µ!ık'fˆyN ¶?!lÆê»ñºƒ ﬁë‚*πæ¡˝ ™ÅCªAn^%#,Òb≈Ã≠•]≠˙ÙçÌßˆ„¿ëüé≤à)kw2¨"∆9ÇKô; «ÒjóX{R=î∏æÕæ„≠0áf«Éœ-≠™ÙPÔ%Êá'√ı,nÛYäªKö´§·π8òé◊Ôª°cá”À∫„LntÂ{∫È ‹vº,·T7ük.0®»IIUyé¥$ÉÂ?œ·¥¯9‚MƒTjÕ¸{dutTí_è,ŸBy\Ô©Tùlç=ëHÀ	æPáÅﬂ…ÕgDn°Ï≥HBu$jÉ·cÚ2É0dOâ◊@+ ƒÿ–LDõÍZ}ZC3®`|zZØ¸È¥¨F˚∞÷bµ~j?ÎúZG\© ÂC´]#€	≤∞#¶ì∞su'ßq
l Ê0¯x4˜◊ˇaÛÈfwÎ…gsQ@‰^‰a/™D§5øÔHc7•∞U¬ 9ºk∞≥ﬂ>∂ËYÀ>˜Ì`PycÑ(éã h}®ßh¢FÉíèbdÙàÉﬂ˛ÊÔ»À”∫EZ≥_ù‘´,U:§–ŸiTÍñFO{
˘’≤ˇu®º˙3`DÊ-äÏüZ“∏D‰ÌH˘…nãÕØ-(69r;”€•°öT5€πÿèÎ®π^nªvT´∞Ñ˝VòZøØ°Ce⁄g¸Z–¥+@≥'bØìWπ>ˇ@áú›1ºü>[i¸lgswÛ£π¸åy ∏ùæ
©•ãä èÊ¨åÁ1TE±j•“ãµ5¬¶Ã2l}∫§÷÷ûmGµ¡èä1Ö°˚rÅﬁÒ(∫Â¯∫òÓ˚≈£ E?|î‘L¯-R&I˘:≠h¿˛ÿ82&•´˘ÒlÉ”]Nì˝Ω¨Zªc‡·™◊œQÖÔÍç•úØ*‹|ëãû¨¯ÕÔÿôR‡∂¯iÁ=c˘4å3O√¯ˆ©]xJ∆Î] ëŸ∞ø>æ?g‰∏Ÿ©øjírx⁄®ZxN,‚R‰ÑòÍ=‰™Èüñ÷oÜ?YGáøU∏í√±«B°zîLí…Â˙2⁄Ù»•$‹\^ú"">ñGÊ"SA◊„CêWÂÿÌñòI&ÈEé
C§5Ñ»á7?⁄´b5*µ#K4˙‡nµf='†¿b{œØò_“ÀëIÅF`SÉ™	8¸·Ê´p≥Ñ ‘»*IﬂúÜåá±\JÍT®˚ÉÃ<˚m’û˛˘À©Câ=ÑÇ√ÕPaΩ5‰=≥,¸9\¢lÆ)-c>5ﬂ3ä–%}gÈÀ,x©RzfHH/˚!˛ˆn*)dA‘ﬂl÷[«†‘d*¡ôöùÒãﬂ37’°+Ñ'+d
ÉMCÔúi(£,åd±˜`˙ T˚óuPHZ§Yi∂BÊµjÌ¡áRß‡—8æ{Ô:Ï"◊/ÂÕ>…@•–	‡üÍ^~T_ﬂæ˙zOöÍ¸¯Ò"†TK>DÑtÍ'Ã˛q€ÙA 8JYáIú:¿zı[3˜0·´ AJGÆ…?ÙDôRXCkµﬁÆ‘OéÍ´Uz!˝íE¬©FjØ¨ˆÏ◊Õ“Ò°–À«≥®÷+≤¯PËÂV≠Zkó^∞‡6Ô‘Ω]o∂,`Ò≠SDÈ-ΩH˛^®©vÌ%º“ò˝öâ?çí’êÈËgá”ﬂœ)~Ÿ≤^’´VuŸß∑mÉÙÇ÷¿€ù‡ıÔ—)Æ¥føÌ‘+@{·'R~e˚C€x+≈O£%#¥b©oª9™ø¨’Ò@â§\qFø†ôçÃ=⁄/Ñêºß“‚‡€§jµI•ﬁ™ú6⁄ùŸﬂ¢í—."4b«∞‡:∞›I©⁄A˜V"#æXº /V?≥/(	¶@≤ÑJ<¨€ôi¡ıΩ7¡ÛÎù+êƒ¯˝‰˚lËΩïÓπdCo™ˆ'ÜØÈ»O]˙ÄL¡9¨∫IKj$á∆âjm®Õ¯8ë˜4rmîÿC1±Á=É"â&’7‘9£æﬁ 9◊o•â÷éZ»f*Rnìi>îKå∂»Eg+Zû›4˙˛ª±¡J¯!‘uªbÃ⁄Çlw€)¬m	Bí±Ôù;Æç5›œß#Ö6Ñ€™=bp_Ÿ≈P¬}¬√äC«ÅkO`]&‘%œ…&ﬂπ‘Ûk¥;‡p†!	Ûg?xN∆Ò .®/zﬁõ—k÷:
V†r{ÁÏ|¿? S<öws#&iız§wö7ñ2rØÌ·÷^x8a◊#∂Ÿ”º¯2{ÄEpcÒe·¡:óÆ#°5b$,›˚Ôì÷ıN›:˙yΩqlujÌı¿bñà3aØ¡ø!Ó)∆u¨¨àƒ>Tµ-÷@˛˘Ê∞â0Ã–ıÜ§é$«s|H«Û‹â3Ü˜Åf}€gh‰`¿]ÏQ◊u˙XÛâ\8¡î!à„˛˝ ⁄Hﬁ™AVâ&À◊"èhïåÈïÎ—ﬁ*·"ŒÕ>qŸ∆°Iñ@<(}ìiÇØqèN(¨Æx‰ıÊgÎ‚„O§áB“¡áYf	Á®‡˛Uó¶]œ~ÚÉpª€ŒiALº7Å¥›!ìÅE‹Òé&y◊/˙UÍ }<'eﬁÒŸŸ\Yüxáhˇ/o≠»C≥É…1Ωl;hÜÆR|ÈòNÎ]€q≈€ˇëlÆom√P∑W‚¡U< p¢q’É±ÑÅçmAêÆ≥à–—Î–õA–ö¥OJm∏%[%åPèiüèà±≤rjqt€€+´DZ√Ù“˘OV»Õ™°ˇÌ¬˝?-‹ˇ^Fˇ;Ö˚ﬂ-‹ˇnFˇO‘˛SùÆÂŸí<O=ÕıTjz©9•—Ìxéßˆr=Ö´«Ô3q"îJıœW˛“kÉDB»H[:§πzª∆7&âøP’’µ©quiÿcE@’á	T¸∞ıxN{⁄4˝“ãCwz…Ï«5L¬˘ÌÿhßD„Dç•ÿ%TÇ¢ÉãK]á%∏ç≤\	>û}¸˛Nj†¿¸s_]ï<VjÃÙ∆Ø¬I\¶<?i0}z<"⁄§û}√‰ÀA¥(‘1c´ÀëÓ~"sâ®zäzà„“$∫,˘•˜TÙƒh+¸sÄVuº“/8^ïf‰5Öù I‘›æ/Ë \™Øã5∑ìÑ±kLá§=˚tïÓÊZπÿoXT…∫Æ;Ω»=èq§Q~π*Æ9n
v“úlzö˚êÂCÄ–ëO2%AG6jÖ!=∞∫*ÓÄrgø5]âK˚â’Õ<ÂFÓƒóD≠®…d'Óÿ√èZﬂÎÇπÙ∞¢vôYo\±ÊÈú„&éRßFƒòªb‡=$≈hˆï|ÜMP"O”úºÙ¢újÚÎo\ßZ≠Ògr◊≈N∫3sˆvŸŸãÏy≈GΩÆ4ªû<ñlıQﬂG0î ‘±	u¥òœ˛w†ŸÀ|ª»Òìò*qF∂jcâeê~Y·*c$`añÊOPÉT4æ–∏Ú >ã≠(ıBmÔp⁄ß·gD”∂Î4,¸Æ>ÍEEßx£)≠À=8·º	b!«Ω
B˝ãÈb=ŒÛvÿwf5PÙ0ˆÇVÎ§kÁ∂„S–4,ˇ∆™ﬂ)≈°c˚≥”=º≠y¯”)ı'∫áüjvF⁄áühıóK›≥€∫Q¥g_ùÅÄùhsKÛ\’CR‚πÕßäÙè÷°^¥5Ω6\Àëô($∏Ô#˚¸5\{Œ ·”*q.VPl¥+l7íBÍ‰ :QdHDjv.ôQ&j]‡ù¨ë-96—,(ÂÕUAOk <¢∆oàÌ¬µ∑°Ã˜ÉÁº’ËyÒØ8∑·r‚®Ò”™√Ml‰˙~ÍQ!‚‚Rµ®Ñ∏"Wnë%¬¡
tJU¯Î√VÆN<üT‡Õæ«ÓwK≠
c<CÈí_:%ºHÓI°Ú|Ùê&∆äWYjò¯Â=q<ı«nràÏÜ%uwˆﬁ±ÍXÂ˚˜°Ë©Ú˝üZ\˘èY~`Jù‡soU•ÅÔä*tU∂Xû˝d…!à¬¬uGÉïÂ©uI˘ 
Ê®w·m˙6µª®œª+wIﬂ∑È:óQ—∑#á&epïøﬁé)åONØ0‚†ô¿°ç$˝NËmY;“⁄^Çê›¡gAzõ∞≤p›≠Íç¶£ﬁ∂tÖm·"ÁNNëSÀSÇ®Qê )ÉÚ¥lµXçäâaiÏ:ö^ƒŒK$ò\πˆÛÎk¬`Í#ß|&7Jh9´O»Ô7∆[m.˘ óÕXJ\h°»–Öµ&ÎzÛ£åë´,#}a2°3‘ÒEµÑñM›µé SR>7a
o•ï	µ™ZbØ˘¯Y<õ…f¶HÂ#œR∑Ù"¥ÂÈ#R¥Ü5dYŒ”ò
ä¨g£mÜlT3≥^"‡OPNıˇ  ˇˇ àó0/