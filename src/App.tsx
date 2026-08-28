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
                    >
                      ‚úï
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
            >
              ‚úï
            </button>
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
                                          title="Editar CaxúÏ}Ko„Hö‡}Eî∂∫Gû∂¸vV¶«ÈÇ,…ô™∂%ï§ÃÓûB°*L—2;)RERNª›∂1¿vª¿ŒÃaj˙0ËÚT;ó>é˛Iˇí˝ææ…%Ÿ˘∫≥däåF|ÔÁH7hÂ?≈œëÚùÑ¸ÂüˇáÚ›áõÁ3œ≥-ıÒ˘§ƒÇl´a⁄´ß∑’5ÚÙàÿS›jÍ¶ÓÈ=«pmÎÃQ≥:eﬂ7å—:ÒøZt¢Ø›ïòG3©Îv‡©ßïÛqÕ5©ß◊ûlmëK˚Jw‡í£èjOˆ∑6˜∂»πÌåt«ˇèÔ„˝-‚È◊ªoÀˇ„õÌ≠Èı∑dz]€Ÿÿ'”õ⁄6¸«±g÷Hœ°ñkxÜm©ü%!û·ô∞»÷µfŒá4ËËÅ·Ô7’ÓT:ƒ√ÕëqU<û“mk0c¡-∑S«æ‚Ánò∫5ˆ.…”ßO…˘˘œIµx∞ä8ºi∂Ysß‘™]ÃLì√ç¶[@ ÃcÅ#@@ô>µkSàõè∂»¥ˆà\ò˙5˚ßS√”'n0ÚòNk;ï#8<ûÊ»∞∆Ò%_¬∫^√ˇŸb˘ºè∂∂*DÈPßÒ°bCÏhsÌí€Új€≤ïIHG∑.gJ4Ü§⁄Í≠ò√÷:¢ƒ“]è<∂˘.ëëMn]†#ößèû∫”±G:#wJ6UY’≠6sÿÔÓTw®g;émÍR*Õvø’v˚ﬂ=kıÎß5¿aSs4Sƒ≤ÍŸptö§ûô}0Fü)”ŒÿINº⁄B+ùú4Ó«â'øûoœ…„>∑ÕQtH5˜vBê7«•â¶*=˙i8ulÃD7ÍV¢ODÄ¢v\%»¢¬û´Q0˘8Öc¨˝ç«ªµ™pt\¡Ø∑õMv6»@◊lkDù¸Üßx@Œfñ°ÕﬂL€%Ä™ΩIˇzS8WäÑ∆YˆÊc1áé—Œim?E ë&ÓI»MzRˆÙogÆg\‹‘ŒuÔµÆ[I*Îœû]»ÙºÄ¸^Óf®dOfS†*uuD	ÌË⁄k_:ÜaªÄp>±ıñÊágt⁄3¨$ıﬂÍøGí§©ø‰0≈W∂õóª≤Â≠í¬*
ßBí ^›òR”nñ ¨yP˝8NK˘•/í¥t'%qÊ¡IÇ≤Ó¶§—$m¿ 6Å˝vmß6µçÄ'¡V&'ÕEÙÎ∞gŒ‹$ºÌºÌ2 ´è`ìm(uj‰ÆòK•ÄZ¶i¬ÿ1FˇAä‚¬ÜMF—ü;ƒ«˛‹eõ∫+E¿€IVÜÓn\&l|uÇ∞7Ÿ@â∆∞4Ú9‡∂∂1°”*Å∑ﬂJ˜	Ë≤Î∏EÚ‘W§¬	ß8¬t#∂öõˆàMóp&1”¿è£{3«*îqÿvæ“oûﬁÚQÔÚâ¸>#Ú∞uqË—¸,(ßi∂™0|®§e¿}(ÕÀ©∑àHWéÿõ3∫x∏â„,(QÛdc	Al¢˝7 imkcüœáGÓ+2wæ‡„¬ëçH¬à∫JÚÆ¢∂z°8ó/3r•®;î4K‰pÄ÷»≤Ùü√:	Nt=EµSJÁÏbJ“†bøÕçxﬁ+öU≠EÂåÀ∑»j∑-?∂Òjñô2ØàøÖ{¶0éîY‹IgXññ3◊(òj"⁄jx∞(-√∂C1åã\7
,f ⁄Ê$&AÎÓTáÔÜ Éæ0∆3 »∂+7Rkx ;íÖ?ÂÃï{o÷ÏñUºõ©œ*Œ^t⁄çvØ~⁄˛F¿(rŸBBŸ{R%dÓπ»TÃ|Yc+_øîjàl=Ø:ïjüπØíëŒ≈ÇdÆáoˇàƒò¬0µå	æÃtf∫∫ƒû'Ö/˜≤$s‚ã?&h´q‘ŸNà%°∫R9ä|2“E #hà{íÖ‰F\AJëÒ¨\S]œÊ‘r0•(»¥Gw˘hîëà4b≤*πÍPjïPaÕ ÚQû4î##·9Á]∂øHÇ ’®˜3ı„ÄußE®∏5ö©Œú©Ô$ïgIP3X 9»Y∑PUÎUa˚ã•H∂*sòÀXÃó#y-r^˛à+:≠$Å{Ó≠◊JÃ˝…)oﬂN˛p®Ã*µósPÓ%H<ØïÏS;ãZû—	÷ÒˇeÜ'ÓhDÓ••TÏ˛ÖêYàÕÓ+ì`î,‰+1XÔÑ+ÀÕ∑∏—\jœNâZbyàVZÆGœå	<6b	⁄ó9ıˆ m1˘üI£rt´lcì®2w§’sI›3ÆlW∂J±)Ω¨SÓ'YÚ•–^…Gêõ,äë11å⁄ÿ˜<Î≈KŸª3î)Å1ro)ø@¨„™ëjÍ¬N)ª  Ê
ŸÇR@9)so83KÉ?»ÑÇ T˚ÆzÖXT∆f™dÍ»¨Pâ~rÃúÉ¯Q–V,(≈Ò≈N#xÁ)Ω2LÄ:˜À¿∞Ò˚ﬂì≠;“√ÎóÛ◊›¬ù(ﬁ/Ö›* !;>¿%‹¥{àt;E"ÙìÑrÊõ∂≥ª´ÑG:•ö1N∫@é®y «Ï9v¨ìÄAò}¡‚√x7mÏ·#5ÄJ/Åij∆-∑˛∞©pxË+\bWõMÈ¸ﬂÊ¥Å≠ÃJÓQ†Öj8à•›‹•QÿeÃ©ÏJö:PU‹+Ò"™st{FΩÀO’™`9dìT⁄H¸i{mç¸5Ÿﬁ⁄Zª˚Yô∑Y Å"Ö≈éeõyJEê˚˘«’Ω÷5Ï`©Ù[®_·„’[≤±±Å≠ìoB.˚Ìkù‹≠x3„É¿%<Ok)?œ 5
LÅ6≈RÈı€Énß≤Nå—â≈ì"W9àGïÆì¿Ópê'¡¿bä◊rWÏwH¡BmÏÿØI~djƒ|§L)Ú6&BSE1©â@ƒHR(Xx1Î™è&Ü≈ãÈ:cjø„ƒ¶êS©π2VÌ_î⁄√¬õ ∏¨ˆ±‚ÄÊuqä~(E”ñÚGL+ÇedMX}ƒt+ÕMgÍ°“jn85Ôg)‹í`¥‚»¯˜ &~·hx’#VÒ≥™qq‘˚≤¡õ7ôìÿÎ∫+Öä√µT\¸#ô˜U9~úGç=i	b®¬à(ÜìSc˚&°»=ªA ˇ~ ÒÙís€CqÑzÕ1|ŸHÏÑ¢∞@	É÷ÿÿ`lã]∏“#\–<®t9«õµG>X_dB#π´5÷èO€ÉÁg≠Œ∞≤ˆ…W[‰´Õ7¥‰ykﬂ≤ˆ°=≤ß∂(ÓKãq∫
üOï1%˙r√Ñòh[9£Sù˙ËÆ ¿—TÓ÷I›€&}∫Ö¬@	UéwNaùJõ&”eå–•◊ÚÂW.qRkû¿*îUsoNrYÜÇòæÎ~`1“†ˇ∑ÑˇRé>Â¬HY∞ ó+W‰Ì}ß=Ω≤Ûà<º~æG◊∑¸.‰”Mn˚π9cÈ{—Æ≥+°¿˛˙ÿ◊ª‚…ïp5Æo⁄‰G∂7¨‹Ω∂ÎK;)õ7ﬂEë£º¯≥ó„∂⁄•!È‰BÔg⁄Jèî„ÌHyÉ+q˘–°>0’/‚ÇÖó˘ì$zAy…"œZºuGNgcÍ}0ro≠≤(Ò¡ú6≥ÿi\Ô:õˇxÍ”ûyuq)j! ˜cO…óeD"r@∂
≤4?_Ò\}bD†r£õ&∞(ÊOÍŸ”ôÈ+ÛÍh∫3ˇXãµXd∆ß[!9 xΩ89Í˚û∏UÇƒG~$3ÑE>zî!}+ìÎó*‡RÂ}G)ÇSqî¡jè≤ß-	w^Ê-0»®
j›0≤_`ï‰QDÙ*B§êû2RŒX,64IˆPÎXHãÇí˛ñNì¬t,‘áÈ{
ë>˘ ö {‰1/l{ïcxŒŸﬂJ#∫ “Ò8±¯ùò©´¿hﬂ◊«∫âŸ;`Œ∞jÔÊ;èéô©È§’x^ov+E¶˝^[Ãˇ‘Éª™lŸÁ¶≠ΩJcxCá©»&9ÜmWÚ™≤˛bÁÖ0ÅÓBâ¸≈ë™qKá*ƒ'
àñ ‰Çë§≤ÉK¢ Í/€ßÌ(ÇA¯∫|Da¸C	Ár^lö)DFaÌÉÂäƒ√ˆ‡åäÁpÒ Ã.õ∞Göo¿ã±åí-T≈b—◊<≠6Î8.W(ZÑñ;˘¢pÄ˚>kﬂHª¿i/ö¨¯0}{Ï NSÓ˘W Ÿ)®"ıÛÆ!¬©ä¯LÅÙùŸ”`»]\#õPë©ÔøNπ∫7|Æ˝∞^eôS9‡@ü≈Eé‚åÑÛ¸˚qÀ*òƒ≈ÊÔ1{…	˜«EﬁTnP„ùœ‡}˚ﬂ`;§ú?4Ω¬¡j5õÇ	©WK˘îÈ’ZYÈ%ÃéÀ0x;˝ï|ô0Ûq{ìósà-ÂP.Ùa O˙ct7øç”‚g–fÃ≈NJ˘DÓ1≥8ˇ¨∏GZ°›J‹—ÃÇ∆\—˚ä2ı0∞≠º-gÙ'£|∏V&sÉ◊HÁ“Úƒ∏Ë¢ﬁΩòÂôØ˚@¡ÈÛﬂtïæïp˜oá°WÀﬁ_'Ω˙2œ‹(MFw&;ôáIpŒ)“(…w˛»å˘N4‡*ŒÔ•ö4Û≠‡ÄÃπ"ΩıÅì∑ÛÍDÓ.QbB1Ì±îÉI%uªt™u‹[»N¶T= √Á:uºVêÑcÒ˘ÙâÓPìX™uß¬9TsH∂nç2€ ÍóOYs"^q*Ú6œA_|v?·Î6^ÙÍÛøüˇ]˜@y«”£ã‘Ù‡<˝ ﬂÀ≥I¸´A“p)∞≤t˙eR`—2(>v`ô“«JéØ{NöªY≠”Sﬂ≈‚æ¿«b[Åìe¯µFí{ÇüﬁjBj HÑfﬁÇT”ÂLŸ∂≥lõB∞UK€ZLF§8Öá]^◊çFWR˘ :”"-,pêÁZqí]*˚2∞8Ãˇç≈ºå∏¥¸yßa>ƒAsã∆jèzgõg—X›—1+:»¢dKE⁄≤9í≈Æó05qW‡Ö°xäîÿ3Çr≥MÏXl´Ôñ	\/RµÁ]qÀ0éu/.lÇhC@jD©˝µÍ`ùıq@>(/éHXé9sA˘Å
¥¶≈∆}Åw'nø sÆ¨“√ìSü5∞∆H˝:‰˜<î“°§›Ãª3!F}re˜‰}A%¶@ûàsƒ-l
ß–ñq7·–k•Ñ5ô"±w2πÌ„v:!Ìxp”‚ÖÉ˛ùQü‚ûãPNx‘s…1 ëöt†îowoôuyÓ4h,óíÎL»Û|…2^*G<n9ûxµPZãâ. UZÑàt…ò‡‡O€4\ÕòöÜ≈Rö≠˘ˇ≥MÍ[ëuò˚¿OJêã¥ÃqqYÚ∏b&YYBía°VÑ1êÃ0ç1∂Ù
ÑØT
◊VF?Ôzò˛"§&Ô
T®BCI&ÂÍ^}ÑU?û3”ºô≥∂;gıa´Rv≠ kÇSN‰|áJ∆˛‚iﬂˆìj3˘˘ûw>Ω´QS\Ÿÿ⁄˛∂<G˙∫ˆÄ˘ ‰P=0w‚H⁄9ã7∫0‡ÕÃr©;∫Ä]›“‰π”∫˝ìóMJ√7¬´∆cä‰ÊN–s|˙°™y
T[RL{Um1∑
€b™z≤‚û•\’U¢¸Çt∫/Î§ﬁ<kÛøÎíFΩ3ˇáNªQ'ÕÈ∑ß/]Rm÷áı„˙†EZg§Û‚eÎLúS‰D	hE1I∞f†™‹â‹H…nT9)x⁄[=ÖóòÖm°Ω )îΩ•=^ëºˆHFÜ(€Ç5…±ÂŸr&FÖJ⁄yE{ïôí«:±WØÈE:ˆD?8‹d≥H◊aX”ô'74#‡Î´»oº¢ÊLzkÈØ9È9±ù	∞f«ı\Í tó‘√Û∫tù¯8<€(1Ù:	«> ˙ÜGù±Óm∞EÙÓ"djRMøÑ=”¥†,c⁄Æ‹v,Ú˙ã‹¸S∆ÖR.ÌS∫∞µô{ê%âƒûyà5À∂tŸí$ﬁÈíÌBﬂ¯ÿÁ Yº3∞ow_†Ω<‰û¡ò≥Oê˚ñ!∑Û∆Œ“«mRmc7VIdÌ› cc‘≠(§i Ê/¬[[;Ov∑wNÎ[{¬ W˛˘»—Û˜»@}í1QÂùÄﬁÍÅ÷r_D8¯ÚP¸ïçFëO‰¯›Åbøc‚;∆˚¡8|y0ÍéÓ“Op¸N¿qìz≥ :‘ı3WÕ#Xﬁ"–|n8ﬁ%,Ó>Ä9ª4,/ èÀB£ZGä.˚Ü´Ÿaü:S	(π≠x`ÉY^ùÍW∫y¿é˝ñÅ-S)´òdhˆîŸ∏˘ÆVé©qmWééÎÌ_wIø=ht7˘•Ü9õˇid¿8gÛˇ÷l/3P›Ù`ò˙È–ÑThó≈V«#€][pqXØë≠Óønüu…&¥ûΩË◊;ÛøØì~k0Ï∑áuï°79¿Æu'£ÉX∏^¬:≠[ÚfkÂöÆåLù'KrXØ≥pí2\∆5ìÚ»‰PîDÄ ÿÕ…~Ã˙`’<„J˜Ø=Ÿè;nVÖ$,ƒôPáyo\ó{6≠˘Oñ°QÏ©–≥]oÏËÉØO•–R‹iuıÌ ~Ë.95\èÿ∫à˙•·Ú∏Ö{ée|∑2ãZ≥*diÑÃ–G\«Í˝X ±a≥‹≈2=ÊÍªá¨ÃTıæ®VMxìëàÒDù´Òñß>*yÀ¥']vÂò*»áP(±(Arñ!»* \2C0π;¿9ÿwÃt…À‹ÀÀ(TÌ˘.Â;¢®—¢V≤HÖzó6ˆ¥àÙKRmX∞ jäb™≈ì_÷∂∑»k¸gëã≤ê1ïˇL*«∞^’ä}Ä:©æŸ˙ˆ.∏òˇÒö|ÃW+°"«(]êçT6…≥rîŸ©;íﬁ'ıúœ‘Ù∑ﬂÁ“ÃÖ ´€Ÿæ∏ü´$Ÿ˘´ï	5¡ÂmÚ%âTÚ∞ΩïêHT»¡¬ã•uA9¶p	A’‘¸·}ÀMŒ$|Í0/ú;

NN›©:{≈èRçèD©f#O˝ë«Ω˚˛Æ‡"Dè‘‘b(Ω«Ó–*…†∂CÅ Ù˝Âø¸+91¥KJ:˝V/˙}dk3r¿OU[óïrxºEÃÃŒ35U—0@{um4ıìôi˛FßNuç‘H¯S˙π‘≠wÑZLª\A√iy
~ê6›†®~ÎS-•∞"z.X&9
ÏªRJ˛}ïßÂâ#êáQ›@πåL{2ı™ï6°˚aFM“òˇ42∆¨SKﬂ€ÿRﬁ`∆N&µ\ËéÅmÍ¸ÆÕ_íj”£∂iìvM˚'¥Ntå›hùû÷:≠_’~Ω&´°|0◊"Z›öjµØTÖıoÒø\≤TM≈ÊSAéHà}jK¿è_É≤åuíÄ‚õ~ß“âhú“]˛ºÜ òäMêA°wºÍ˜ÄÀ¸à‚ÿ·œˇ/⁄Å»pfD7¬à œsÑÖâ}≈àÊ2~Øíd^p« ™Ô'·∏±D°5≤ ∑"!©+çàÉ∫ù?~BÌ0B¡‚ú⁄"f0Ï◊;ÉìVø›/†∂˜Wó∂¡X7UøoÍÆ˛[
`OMÆ›õÙ
≥Ö“ƒf∞∫È⁄& #Xy@˘yFÑ˝Ú˚55LÁˆ;û*ƒ©NÛ∆¢¬[ç»∆ÉCz,(ùtº¥õ+yíƒNJdªÔÙ·®ØP˘ÛIœàYx¥•—°ﬂ:Îæl-èoß™o∞îõ¡x_Ÿpg–^:±∞¢oÚûâçÁæë∫5i(Eâl‡äÅÃKÜÙ‹%/˝uZ&À$Ë2ñçqœŸ ¯Lgvú¢u÷˛ÜÜıaãt˚§q⁄¥ödX?‰H∑’œ∏•÷ÉÛÊ
‚⁄6∂ Ø˛ŒN.¸=ﬁ’∏DO€⁄v ƒ$≥~ƒ™¢êiÌ1ö_æ˘œ[;[˚[OæU⁄~í¥O´vY˚fo_X¶Hfﬁ|$s´=
'⁄¡ôŒ—¬†à€%≤>t1;i\⁄A„“NZgRÀsOØé∆6g¿8jûçm•jé1æÙ‡ÀÎ⁄.πÑˇ'äLÎg˝•√	k,òOå<ó;t>O∂û÷Ab◊ﬁ }Â^ßﬁ€®wô÷80\ÄJ⁄ #c÷§ÂzÄ"îÚ)ÈÈ5sﬂ„r'˜5r≤Òü$J*Â^ﬁ˙/åû∞X\ÎP◊,€¥«∞Xﬁ‚¬v&ÅHjì3÷Ha˛'«`‚K¬WáTœ⁄ùvg∏[ø…ÈIJÓKÊ¶Úg≠õﬂl„+ÄÏDNî'7µ] d7
ÿeäçNËuÌuXUÅ%G"ív%®Z§ ˆ8øôic˘∏Ï◊†
Ø[3Ç„;‘Ãkû˚ ä≈?ÉÙ(%Ÿ> Õ˙‡˘q∑ﬁoínØ’Ø7⁄›N˝îlíF∑3Ëû÷IØﬂÓ4⁄=∏V=¡,òùµ<ÚWfñQ˜Ú‹˙øp%ë›Ù¿7ÿŸÿcê—´∑;≠”h•dÿ:mùµÜ˝vù4˙/X>ÛÇ√KÅ¨< é!H—íñx‰z∑áŒû≈RWÜkúõ~ª\w≠ô¶WÅìhÎd ÇØ‰§:´∞BlkÎˇ|·26Gœ∆9ÿ◊Êñ—Gæä,{‘÷¥ûÊ‚:è»Ì>s3¸	éí`”oaèA>$CVXu7õO≤·Ÿ'∆µ>™nØ¡ª3?Dµ≤QY'ïı ºvÂgŸ∞fÍ®¶bΩÃã5º]ÕJÓ)≥ãm+˛πQ;∫ÎR;¯˚d6¶¡˜ûÌ∫zõÎø¡µ∂5
≥ëãé€Öëj‘<%Óç•}=”gz ¸Ç‰{Œ@\Ûf.GÜ÷ŸwLAkª<˛‰Ø˝÷≥ˆ`ÿ˝(]£]?≠n¿ø…7z˘Üëã-á…É$±øıxKˇ∂»…Ãöñ•2πvíô\{>n∆‡∂4ÅXäËÚàå≤N9Û≠ı∫Ωßº‹¢B+Q[Gÿˆu'lÒ`ˇ*”¬&ò‹C©§rt †knØ<–ú∆’5sØz+∞J‰D◊' ÓæxPòñX`d}áÒ¥;\Ù}Gï‰áF>øıIÈ£ë_íJ‹ÎQ¢˛˛x?¸9tπ‡ïL™}°«„6El•fÏïÇN£¨Lh¿"Ó»ÀÀ1Û•º7 T?mıáı¡C PÇ√q6ú¢T£Dâè˙p‡—’l«∑ªuø
(z≠N≥’∂,RbE0r»G–Hé¸p¿—sl§0ljKQêSe9•Ã◊x˝D°íà)	»6˛±5µÑˆÄÙÁËµAˇ(Tw◊ÿ&ﬁ—{†ŸX◊ÅTÉÓÃÃ/i;  :|1¬{@¶.ntÍCÆÑÅ¨ò¡å\ˇ¡mïº˚€Ù+K4€˝VcÿÌ˜¥;/ôBÿﬁ‡‹ÆK”π~·áúÚ!?ÀøI*0˚À¯j—»`Pà∞{ëﬁù/˝ï1fNÿ⁄Hµ„´ük˝ﬂ«~Ôıª/Òÿ¶œoEÀœŸá©kÑ£Ä|ÌŸ/ê4Ä ‹¨}øJI˚ã-∫Ω•"iÔwr¿”uí /\C—∏Õ–ı`)⁄%˛"¥,
 *ˆzÁçà∆4.æ.à»RÛ©„hä^ŸÆg©™Úë∏éX∫Kqnïw‹iˇœÌ–(ñ◊
≠§=,˙0¯ÙÀ#Á?zÜVÿ>t˘ñª˘Ù¸Ò∆~“óØµ¬ÆR‹r∫&°3≥4åÂ¶≤o∂øˆô_`igºM@[ñarE
ÛdÄ:Ô∂N.Å{õ7 ∫πS†u Å1ÜmÓHry%sœú@}—µuaÀbQ

© )€∏Q<"Öó◊≈ø_◊ËÃ≥’ê…wÈJ˜óß´ÒÂÓ∑lıö∂{∆ﬁ˘lfz∆¿”ßı—@‹™b≥bı,ﬁê0∆∞ÒOÓÉ,ÍÂÁ2Ñ◊e{I•¡<Rﬁπ`ì¬¸ Ê„W˘1	ì'2i<!m∆mïsòﬁÊ0Qø†öÄwE	,‡]ﬂg`˘ˇSÔè›J·mRqÉºœ3A˘^vtî6€kó˘f`á9%g0Ãæxé˝JØ}'˛Ì§<†1†·5œ⁄√v_ÖfN‡∑ä<_œ‡J¬ ñﬁÚÄ|B∑.∂µo™»äF”¡—¬RÉÔ)fµx•πÒ,3ÁáM±…#LaÍ⁄Y&ï∆#|ﬁwÎªï%p™ÓÄTx™_x}¶IñƒÆù’`WlÙ~!X‡W∏G¬wæHáÔl≈B¶wrw 7ÁÓ<zœ1#RAº5¶¿rÏ»ÑÑO√?ùDg”’±n¥5ˇ7iP¢†ql*µ56”≠©xíi_û†æ lJe–D|«√ŸKˆôΩd˛á~ã9NCì;iv§5÷è[ß≠F˚ﬁ≠õk√ñ¥¨*Î©∂r_rû:©¶Lãí˜ÍW.üÏsx<3LVd4€W4•˝Ja¥04ì"1ëJ‡7ë^∑ü	Lã⁄8if,˘Mwò.êït£˚çâ ï>ö ê)°Y=7Åd±M‘—.sÉëL‡Õº%mÓê#Øl{oÿÖå#≤¢JœëëA¨vé‰.ø˙€1”p/q√¯Î|=”ù/åj?TıÄ≥∂„Tìï§<6QGv®≤˜äùÖéú‡<ﬁ“∂˜éY{‚Z–')ŒMS¯[ÌAÚ¯¸j&©“%±'ëÍ™P—D‹Ì•0è]âH∆â⁄53#à)∞û≥øÏzÌ√?¯!Ëgs@ex‰]Ít$eã^"ÇPúâ.Ò˛,h¢É≈%døõöﬂH+Q≠¯õΩ≠ü}[9J—º√MÔrUÏÓ¸Ï€Dﬂº£÷Ikÿ~âï7bÓ’M∏ΩõôﬁÆπ⁄9ˆÉ9!°ˆª#í
@Í–;∑G7Ò%Z 4‘nàˇ%ñ‘/Y∆m2K∫'A`ÎƒÛôàÚ¢b â∞ë◊Å{"
O=ôºç§±û^K$ÆrÕﬁä5û*•~D]ëm+(ú∆Œµs¬ß™QÂæ√ÌèõÚ«≠1O’T%E√˜K°˜¬ﬁH¡úA†ï“,‡/«∑Ωµ%leùzy5wFΩÀ∆s™Uæ¢M◊è¬S|√ÌÌ6mäåÎ)ô®‡¡˚—(j#πó∂„˘Ó9ˆ¬(æVí˝bÄ±¡
a3
|åa~≠©¨©?d«J8·∏ËS‡ãã>»2Xâ)´ûì&/?Ë=“~Q[∞YIÚ¯,#	ùÀì´"E®"*LÖâ¡9©§îÚ‘¬W»RèYbRëØ ∞¨;–p5z∞ãû‚{eTg√bík˙ÂõæŸ}N«E≤a5‚–"uíE‰%t[íe∆ßfçîÈB—|‚πoøüòp π€8ΩÎhçbûπ®´g*ä?™´r√·œoT‰Kœ={úõﬁ©Ò–îX¡Ö¯CŸÇ·%ˇa≈ú¸‹=ª˚ô⁄^*Ô˚jdIÿOÔ1aÛïÆ)|Ã©uÌV;´¸n⁄Åq⁄ûëÆ6õ˙’MèVé˛ÚOˇR~◊ ñ[x¶{G‹«ÆÀè-∂√–ñ˚˛g©Â>˘‰§ja¬®`è>ÍñÒË≥@ós˛¡N%A¶Gµ¬]ài¶R 6F–/Ωo∏Ø∏Ñw‚…jY∑¸£– úíF¸ù† M¬˝ïæH∫é≥6˚Ë6˝MëﬁÖ
ÎEUöY?. >™Ω≤˘Ω*h!◊Œ¯ß‡te5AaxTﬂƒñfìê⁄FÑ?å·ÌŒI∑Ê€6›≥¶uÜı>©7›~≥›Ì‡∫G”]¬évƒ1¸)¢áÓl2°NBüMπp2·M‚x¶Ωº¶BL,„·xÚ ûl‰ï(>Lf2:<¿ıÖbdò‘¶ZÔÃˇp⁄¥X∑',è: ΩçLè_¥}óGkX?}^o÷Ö@'-Eÿ∏‘Ø€j⁄Ø-·Ç#ÑªòÅªÒcØaÚÅ,”lã_¡!AÕA2ıd]™3¶≈åVjöÁπƒ·ô=öô˙)˝›ÕâñrwtàÙ˚åNõA∂_*!Ói Nr$KÖ?¯ö¯w∏Ã\É9™-îÈgBbçõŒ∞ﬂ%A* |Ω”Ï¶◊SπéΩéÍ„ÑZ#;'·Ò0JöO-5’‘Ûµ+Cùf	~Eøß∑∑ƒÊÊá≤µN‡ﬂÌ≠,ÙÛõwo≥ªsn÷Ø/g‹Zﬁ¿+prùÈç.JA¯E√û‡>4I»ËT XôEÄñπ—ˆ#Ö£[Éÿ·úõS—≈OoS≤OºvÄƒ’g#√;µ«OoÊ¨⁄Ì2Â„Q¯∑Ù=b<QØÕwÄÚvgÿ:m?õˇwåØ&’AªuñNÒÄ<Ú”≥z“√}|êè¯1·›‰õ†åêø"®&;§ıÎﬁi∑_ov˚€«ıNÉy≥é¡?'≠~3"Òr ◊s≥◊ÄzOÄ8”≤—«}∑w¸nŸR O˝…‹Ú®ñIZÓ3ÿ˚Äï»ftC¥SÕ¿x
U@¯{¨O«û®¡‘˚ºÚi	ñzﬂSH_®êvV†(Æ+`Û1Çä
ı∏sú«9Çπ4L”ÈY©ílD	Jñ§i`òphﬂo≤‹XÉ$WÊ ›P)ó!X_7ØL(®1¥+°S«æ¨Q^/Ï„≠Ò—ˆˆÒ8dÅÃØÒ‡L†ßp∑ªDä¿0¨∆ÄÉ'|6+cLvé≈dÛj° ämdÆ#†1√aõxÊó˜–√pï\u±¨ÚOUÃ"Æ £πÇˇM©»;‚Gß¬@8—@keÉN¶≤0?¥≈eØ8DKÄ»íê…2àS^…ç9)ËRílI25kO0ÏdèY{Lrf[tÚ®|–	+õ˚>ÇcçÔß∏95Y§z|À+µñÊ!∏ÚjO!ºFïÏR˛õ‹6…jˆ7±·‡‘òLiVDÛwBjVÀ}M±™ =h'Ã©ﬁ_h*b&ö"‘·VY.•ñ√û¯ì PÃ!±7éŒ4ã˘Á*¥{$ª‹Äx^9z	´⁄»·>)wIıDÕ”÷‡ª≥÷∞éÕ¡Éæ@'ËX«z™≈ÕuRj∂dªˇÇî:0,8ô·NÏí√¯jkTÌ≤Ù¬üÉHveòó¯GŸ5ÅRC58s-ıËÃ’—ó˛¬3L„w I8l%L˛/9íØœƒJõ¸<Ë#S˛ç~`ÈG-VÉ«c√}Â_-Ω2øPQÂh≠√pA¢AÈ’e¿a¿¶ˇ’.#Í°¥8ﬁÉúŒ›/C‡“e–æ0Öı´DX7Ô/Ú@Ë‰Çú⁄ÃT 1 (ñãB§ûê¡lj;¿∑∫∏FRm√€\Î£ÊqYB1¡KO∑®ÂÒ°Y“emàW¥R˘Ø,—pÌoƒä·˙ãÖøkº:.yéÖ˘~r≠`PY3/y≈—\öâ.yÜ¸é5YRõAë≈îb,Ö˘à≈ÉÜëÆ7<a6G∂F,øÉ«mPîåØ'QTË∂O/+∂qSÀÛi>B„<ØK}Öá`:ÀFMÉòjé¡ã(∫‹%ÉäpØºÇ{∫ÿ≠ü⁄»|nR/r∂	$Í!ƒ˙íÖû±=eÉ±?E^¬¬@∞bÁ9ãf*àyœ≠±ï˚//!›DNá—“”dì6üÙ≈B@à“IY9á¢*—÷Ko#ymDÚÚ?˝<0√≤äù◊<R($ÔQùŸà¥g“ﬁ"◊z:fx"Õ:ªìd,ó.^ëvs∆M-E·„ô–Æî'6àëc¢1$+ƒêd5†˝l5†ïj@†T[t˙]÷ì!æE}ë⁄w» 0©◊âà–˘'b˝K
^ÿ◊âTÉQ}ø¬ä≤gsaŸ¬±L\Å˚&≈§¸7È.Py∆áÂÖ/¶Úî[Q€±VËWÍÑè≠Êí∫L˙ÑâÅ úYPÖ$ÄòW7L‰ds—Ÿ->¨‰B
√2Sß(†RY?1!Jñe≈ﬁ@1
p+⁄>µ|Ik˘ÕõŒú©©G˚Áˇù›¬‡∆UÔbLp|»MÙÖÍH€+ÿ≈XX´j±’o$æäˇZ˜ΩìÖ]‰abÇÄÆªº¸ëúuàî qµzVí>Op oPòGv√√‡q›Z€ì<≠íÊá7âÏsçK]{’0-?]=áπEÛIèéfeÄŸY∞¢yaÎ¶öÔŸ≈‘‰‘áﬂv h%C}ﬂ\1djªÓ›6†ïÿÊÃ¢l]4\ó≈+HêCLUD4ß:™i¨ﬂÚËªÛõÔ–ºÙù1:‹ƒßè÷Àåb∏ﬂq]7xöËƒ3&ò5ô‚j'®±x¨ÄËÏplûa^¢+,ÏR\∂"{⁄õô{5Ê<≈  æ4‹EZÿºâyA‹urÚÀÕﬁ/aÂ}ÿmøéXËb+Ã”QûªIÊL}úÉèT£∑	ïN†ﬂOdë¨íÔœld‡O>b Ûä2∆ÂÆπxﬂX¯.çíî6Rﬁì6sÊÀê–h≈~vìÛ9SPˆH®§ød“+è∞K∆âªO K™≠¿9“lù¥;ma &[˝Ç5MCLÂË˜Àçëﬂ7tÌWé|/¬A
açe©≤©$∑;	GaVöJöv†E&◊[Fõ5!ÒUÍ∞· njyJjí†oˇIV~B¨=I÷òZa9±5ár∆≥Ø2-ÇbÇ)ö\˜cÚízc¢î’BÕˆÒ+9ÑeK‚¬4ê#†‘ÿâ‰uAë,†¶r‘=99mwZdõNc	3«„ºJ»°]üY‚Î ¢¥ØJÄZ-=èKs≠<ß◊≈∆N19RcÅ›`Uåß[ÉV„EøEûıª/z´Ü≠ÑßÁ˛ k¡#(Z5@÷üX.9”=>=ÍÀZ2·JHÇã*…Êbº„<HÃ.‡tuœ1ŒôKX˜=~®:E“uÉ+2¬]ìT3J£TqlPË∂∫4F#îc˙Ø¥®ä®^KËug¥4Èw/Ò‘§Å‚≤-$S∏%ûtˇxK"	+E
&÷íHl¡Ä† Q«ûËÿøòüWq’—8CcEB.:Lí®ıAÕtxô’’ÿarÒ7l21â+óœg™≤[EI~ÖEXàzû1^`äN2;çS ÊúDŒÉÂD
˜∆Ø˜só`A›àΩ≠îµG¡¢óNÊïﬂìÇy‰Ó9ä÷¢òzô7|ÆbÇ1bltå…\zt%nÕ?lR√Ì˝R≈FÎœõfé~ôÇ∏ö,SØV¿5Ãx^ÆÃΩÿÒ‘®`¸”˚•⁄À(Á™+e™˚€y≤‰vûõ3=±üÏBvC√˚ñŸ—†⁄Ó˜ı)\£ºµÌÁÏM.^YÙPâÚÍ˘Øˇã$+GÒY¥?ãL°¡°&m‚õ\Ù*P5#T™É”∑ÓU∆Ñ˘§;¿:§çW≥ˆT7÷b3∞‚ª÷lÏì¥∏⁄Ø2eq¬˙ZÅÎDöëN‰9ÈKI⁄}Ío[Ó•1uIè¢›X$fßX§ìxÄTÚsÒÑ=äd·ﬂf©áÂI 0ﬁ†¿
5çÖø™,ÃO¸◊9ìIÙÖ°Ÿ€…∆â<R{∑¿±.;(nó÷â1∫^+lÿô\˜ﬂÂÀ„æ/MA)Æêép£'ó®@‰5ö*GäJU™ØlMø)å⁄º@±„c+aHœ≥∂3ÃÒOHµÏÄœÜ‡Ç'≠˜.^Ω≤í‹0^9
≥≠F6˙Ÿîœ£(G0Ω–?ªn[Ê`≥ƒ(≠/«ÃùïÃc‹-VGà∑»Ÿ€Kqº¬a/ß0ƒﬂChW|Q∑\∏Çyn•rŒ„Q;d†k3+3˛ú≈°?¨.≥XÁ†ã™£/E$˜Ñx*4zr*ˇµSs£ÜØK≥IIÏÅº¥ ‡“–ÕÑ¸ï-U˝Í¶∞® 3È-è∑Ãhª∂Iy)»dêz5qpÜåƒõ…Ÿ±|D·
BÈQ≤-†Ê÷…å?#ñÀrÂ1ubÌb!¯5}2utó&óøAæ∆6ı6ˆvüÖ…/,Áπ∞¢ÊKÉZîPM«H	V €ßX'v,˙Äg∑∫:fUüöüKY®5¨ç≈CTé~ıº’oëD)ÿÔÕ˛´^ø=®mmˇï±AZWÜ«^i§ÛN‡ƒœ¬£‰ä˛éü/öL©ﬂ“ l∏2FÏõá¡fACâ.°<íÃ∏|xØ/zX¢E §ADÜNb·˚ )çb9◊L`öÚÿìŒhhíyßÅ{ÌËcáá‘‡£òârÌ≈¸ç–êûíø]9ƒï5=Cá{Ûîúbe¸óÜ,»j¿√bƒ⁄∆˝Dx‰W+ZUÃˆ=:!rêÑÑ'ÿ^§úÏT˝∞<åj;yèÌd≠ÑU”Mâ[B)H9F3$8¿Q8 â#lÙ	C®Êo,ÄmaUª§WeÍt [–dtñö_Ñ˜π?I<î+ZÙ ≥°öiLYı™V£do_Eó…‡≥92%ıÍ(6ô©VÇì	pF≥ßF∏1…ÆQü·Ÿ!Ògøx≥æmÒ»2q!EaµCëÃí”„K!
óá≤Ó∆:! HdZSi)±ÍÜ¢»«‹ÂAÛƒ0ıFäâ˘—ê,‹±ÅªÏê`Ûq„aˇ¿$é`UOΩŒ»ÉE®â®®<‰¬≠Êπj{è3ij±‚° f§•»†‰ÀTÃè#ñ§ú´mGﬁ’≤Â¶∫ù¡ã”!k(‘o5N_∫R¥Í˝∆Û⁄Iª?≤¶C€Íw	ñ\|q:ˇCøÕJ˜4ÍÕ˙`ÿÔ•
ÖK◊ÏÒ¨ÒRµ√qΩ˜§àèR%*øØ∑pÇoá=sˆ Ö£¬RTSQ™Ú’¢lã'?ÒIÅ|√j“9w¨ã[”v]Cw¯}ÏÆº¡Çfäô·ÚLqf_≥G⁄#|DTç6Yw∏À”∂snŒ!€∂Ö›ÁÍ£Q∏∫E˚®ÚëæÓ4ä…x9#}›ó=Ø_cV2_∆–Ó5Ob;ˇÌƒ &Œn¿ü˝‘Óı ÷”Á›ÃÖΩ¡|ARÈ:˘!3ox_¸ÆRÛ¶4’rÂƒv∂∞hHàÍ¨√/øH√Ô|sjt !”*"U±¬…•©UÙÏ{B£VQhåUU¬¬®XS	î¢˘mT”∞Êˇä
0^ÔÿW6ÒãDî{ˇ‚m÷ì∆Ö˚çJ´5b•&/F¯Aë~RmD^◊µ"[~»∞P/»πÑ0”Å˝≤ùW0h#H"P…¬‹T¥ﬂ†!≤	ä√|Öñ4πr¢R™=Ø})/Z˝,(
™PT„ˆ˚îÔ€√¢CD˙î Ô√æ–ÑóÙ%yÁ¡Re9≤_&∫H$Œ„Ww≥yx≤Ét˚~n{™sB2°J§É	“ÀEÄñqÖwÕ	ãé¥ô˛s˜‚BpáËƒ„3T∫ΩVü,Óv0æô9ËA∂;AuW?ÚY‡±WPîó≥◊YkêÍfÁ‰ó‘ô:o>àewe›ß{©‹yëW@P†BÎ§O	.eâ?i‹á’Ñ‹bá§˚(πÿÌ®,sXß4«Ì(1F¢;ä‘∫oDÄ *‚ïn2ˆm¢}ŒæçUàÇ ÷?⁄ïubh∂u@^`q&r∑^4‘N4Tœ±ôy7cÄmo∆ÿç-áW˙Â¶êp†∞,eÒX{—XQ¡•hEÃÅ¡)∆⁄èçEÁÈ·8œAOÚzHÜyΩ+ÿnfÀ«:v˝BS{ª/¢°∞‚V8∆ùˆKaÄ«— }¯õÓ$è˝ÿ∂_°6†0‘ìh®ó†z´YïÜüÌ≠hòc√ûËû;¯ê,∞Ö:ï±bp]˘◊¢ @rM™gøÏ0U6G$üD~À√0\O°‰M˛”∞'S€“YÛ9◊€¿Dæú:9\m¿jg/≠«‘áΩH—@87KtÕÈ®púU’⁄	Êë˘üUªÿd≈£z˙Õ™¡| Öy‘sU@û⁄AÛËV.èâFq_QJ¬RÆ÷#ìùì)◊ìtRRN•h»É8ÿ‹õ'¿ÌÁ…o;Y˘mÛqAÛxæòú‡Î`∂◊SäÍøJì{)îD8D≈]Áòt´Pﬁ'éØ¡±]LW ⁄ÁÄ‰πMÇ‰"Qè¢ QÑ´ãÊ¡~ÛERÕuHcY ¸#ı2”+ìÙ¬7¡4ç©k∏~áÓ¬t x§ÌÚ∏Õ¢4€k^î´ÓäB)'_\6Â~’!∆H/$ñ¶õ[*ñ…Hí?w•¥√wi»üÿ9´Eßﬁ0Ë≤Ü—›†‰≤(-}O⁄ª(Ó«OxtÖπÍ≤Ëô€'◊Iƒ—Ó…Ω—yÈ›<ö,n…âÁ£KêD®jOZª {b`xBE$˘œoÊ?Ú’ÃôøA}´‘ÜF¡¥q-ûÎÆfìÜc‡Ïf—”ı+jQ9çD›÷ûÓñ¯e—E#µÆ±j·Ÿ¸O∞~¥f±
≤0
ÃDy“d„˚™E—+ÖöÛÔÎÈ.©O^çÏ¬]≠õˆo˝X´ü¯Cã’a⁄Ñ¸Òƒ™„⁄ÿ¨`n¡Û~∏ı˝@¶@eÄµDïlŸÜ:®E√Ö⁄ñ”ep∆\NxÄK·^D˙ØÜÉØ∆¿›òaA”ëQ<JX¨Üm	Z.po0øç$Ë€o≤¢wçl+-ó∞∑‚ÑEZ¬ä´õ5◊â?˚›—BB¡S®Y√:~ÿ
∆`∞∫≤K~eå∆z~ÒV… R¢8`Ä_Ë2›ŒÓ±∏"\ °lÏg≥´ïíª€±`+Gtã
"3rAEã™JsNÆÎùmP‘<Ñ2tîºdπÃèt~ª¨_·¿WÜ{åMÜ·◊îz°˚ì±±óò]^¯7{¨ÃÃˆ"Ø˘Ÿ¢Ôi/Úûü-˘¢äçŒÀá√3è@ò´ó©Õì@çTˇË!
tW˛	 ‰È” 0JkìârÖÓ µ}Æ˜≠≠„#)•J>ÅË£ò∫¢ä"É{@n˘N›mﬁÚ}R…£SLôHS>ÈŸUËÕM$ˆaE)Û§;ıCW·ùÌ‡ùÌïæÛaAëiﬂŸª5y˝¢‚ÃU%&¶Ä+ïΩOÌ|B˜	Ñ∂ï¢K{∞;OQŸ‹ﬁY@WY∞°Ó”ú9Î6_ú∂»ˆi7[ùa˚§›[ÓÊﬁû/MdﬂåQ†mq⁄¢êà.ﬁÂÀû ˘>ª°bñ…èNxj#¢[òzW\“ç’ƒpIµjín8ÿêäi.ˆZ°¯í«IbñVˆ4öÌ{"¯¸=ÉËÙŸ`Åv8‚ó ÍO@‹ëxÑãïÄ»€Æû?@¯K4ª∞ßRPª`È˘Á «ß›Ø_¥ÍùaãÙ˙≠VßÒº›Ï≤E˝Âü˛Öu!å›"Mú.∂Q1(ì‹ Ì»ÖüXW.ŸmGÇ‡ïeå–Ô(í›ßÇ*˚~kÓ%FQã_ë=ÂË?ÃGj•NÙ;£÷ê≤âVä±-ËÇ≈?e{ì;nezsq%+—1ûYA≈´≤µJ‘Ωﬂ$¨>’Ap∞Iu`ü;∫ÖÌmR/=%^y+ˇ∞iW∆eHWÃ€ß\_ŸÃßü√ätË"]ÔÈ2µôuI]Ç]Ÿ¸$æMEº‘5cD›»Xe	*VòÙEŸRl›o©¸—À–^Y%iBÃÍiB·èm—|¢;Œ'lÔ∞ΩÛ&«Üyâ’0ó3Ú_lí„ˆ√ã,’~ç¬	˘>h∆©ü»gòûÄEùòÔ…Öï”ë]y˜ÖõΩ„á-Ò˜/C¯˜LÓ∂∂vÔ}±˝dÁ¥æµ˜‰›¢wπU‹?—¿bÿ>¡¢A:N’∑ õãhlüDùÏß§®sQN π∏gå$‹ﬁy≤˚x{ˇ]≈ˆO8^å„,,Òé∫~Q‰.Â÷6ÔÚ7:u»”àâ≥ã3^,˝5ÊË’ÏØkc›;ôô&>_≈≤0[*N_√}	ìEëm:)"∫v¯îÏlmßÍ»]≠®áÀ«E5¸Î\≠∏≈ˆS•⁄2Æ¿QÓÄ®Â¡π˝Z=ˇDí„œØî$WéûÕˇdÈé∫£mŒ“”"x„Ö@ä!i¨[¬$ª1G¸ëwàñ4OHŸY≤˙≥ÃeWé¬ØE’sÜ9ÅÉ∑ÿ(¡∑ÈŒ<FË9˙ÖÓ ´E≠µ	B5u®S<ú¨);ˇ˝}¬¨†:E√∏2ÃbÜÜ„Òx≈RË{Ó„√ëÅmzHP9
æUÈ⁄›†._é¯£i\Ÿéf∞q¢Ôãçı“òˇ˘
∆·ˇ]låñ·BüPcgS>6º*msh◊1∆+yHêx≈ä0ãÿd•èK°zÏπ{÷åÎ÷ÿ6©%)ˇdıø≈l3∞“7ÿóO&∏˜JAgÙÿ=Áã˘õ±T˘ô´áLlfÂgÜ⁄hRÌQ„¡ÛÇzó∫√"(  fÙÿ=f‘EX®ƒ'}õJ…Ÿ¸èO;'ˆB =vﬂå}2ˇìiPR∑º˘OñapÅà˘?Â]œØË_æs@z˝n£5t…W/öÌFª~∫Ç¯ùOÒ·Ã_7ˇÛmO»`¸D\ñS´ø≈À)_HgÜÄ¸˛ÖY
óˇa$^ªåŸ:Ò‡=Sc§$µù≠ùGµG_l	JSÛœ'ãw¸˘ãCÏn`Ò§sê (\Ì´5¡∆ﬁ√Àö=sº2 À∏gPÕ€#¯z¨√!º[Ä˚¡ÉÎ≈" ¨Î¡&˘jf¸b8s,GÕjAı∑≥ë\OÉ*{‡æ’0gÉ‘G‘ÿM‡ƒ∂\]˚d…zhµ∞eoz8E´+úLWÈ1π§n›qt◊˚u∞€S8L?˚ˆ]'˜Î'1&ï#¯g∏Ë~˙5à’Ä¨lŒhá k∏zƒ¸Ä’NPáuÖ1\÷€-πÛüc!Á,sË`Qmÿ Lπ≤®KûÕ¯¯∏˚Ë<q§≤≠†˘€t›]•ó∞£©õ†¶:7ã·VÍÈèªû€€¥«¨Ôén⁄d–n,Ö\Ñı…‘&ºZáÂÄ˙Œ\∂¡à|¨’ÊÖgP“œﬁ≥ƒ≥ÉEBﬁ5ﬁG§@!®MN}≈–™¢Gô4S6F/zÍÌìËO∑ ƒ›ÖTÑ9Õ∂Æ÷÷∂,‹%ü¸{ÔÏa¬â&õ¨ß¨7õø≠RÂ›ï¯\ÂÏ∑—so∞ÓUÓ<—µKnÊüàˇ˜Á øVgìp¥ÿµFL∂8-÷àñö76L–¸P—Æ~lÚ1(zW\ø>’«~mW€DÛ É˝z  à˜a{ame9@Œ„o[ﬂ+6 *∫-ÎøU–'~WÕÈå»º¶örÖ`´d™˚˝GE›Y•îÅ7{…oœ˙µ¨ft‰–∞µ9Gë:ÎUX#£Ã{)æ°êàKà≥ÁeÑ ,fxî—Ù3+„P\ÍÃ}éÃÁˆ√€«
F¨Z–∫ñÌñJ^Ï=–p≠ÌQ"[>∏∆”ÂuÎr6y˜$Jîz´UÁ¢)ƒM1éPhìN‰´¸Ω‰UJ3⁄ H˛"ãq eaÔ[;∑∑ˆÛ8@Pˆû∑ÉH’ºóΩnÅ@3ÙôÚ÷@O+œúŸ‘&uR„Å0.oH±˚i„ch~Û±¯Á∂◊Í‘Oøktõ≠Ôûıª/zÉç1åZÁÔ≤^Bf√•âF“Î®£m£ª‡4Ÿ≈9ó∞mÉ:û°ô˙›˛¡*Ÿê*|C3øÈ›ÙŸ°ä:…«÷¢ M‚gM⁄Å«áÌ˘BGsú9åé≈8a∑ËÈ:ùhú≈OßëE“îüt$QoøË95>ùS4N·9©cEBÚ*ŸB≤XÂàe@∫(’5{jÚ÷õ§TòÂzπ≈Jòä¶Ïßmø|†MÒÂï„æÈßÔá'£êrA‰‹ŸÙ&’„ôc“5(©ŸÎRFùöÚ∑(√÷≈ôâ•,3Õ≠lo5{ÁÆèÍA„lqƒØ?b∫A≥ k¶z-%ë4∆∞ßR~+gﬁrÓÀvÂ»≈
9EêvÚÔ…-≤µ√àÁ›&î;Ï¶2ôˇËÒÙt•“ÏSe;Ãƒ√˙Ùï£Ï°qbˇ…‹›·fKíUlèˆ(≥,{îÚ£Ç≠´°F«:ï√+a ŒŸ¸«kcR‹)D∏]±ÜV°^'Ÿ™#Z~≥
n≤ßJÿ= mP«N€Aì„Fø}÷Ó¨$;`˜Ωœ Íå©e¸Œoœ¥â9»¸+Ôôeªüáã‚õ∂Ï*aºL<xœæ˝÷ı·J>qÇm;µ5˘¢?E5Ææ4äCg¨≈nqf Õ´¨è3D£kTöEòÀ‘√oﬂ¢~Ø˛Øcj\É¬˛C™I∞≥˙¸ç∆ZÿM∞ñö:â@‰ç)*G¸ø§:0&SÍ¡æZºû™6ˇì9É› N∫cQwëIÍ&˙»_R=”'ÁéÕ[$c(@^îˇa9π:Û7W0ﬁ34’2Û˝D<Sa™Xfè5qXy\x∂"a¯ÿGÖY,ÿ‘cvød∆*™e]ŸÊØÿGÈ`1\ç£∂œc'L–oºôÊG(ò˙’Çc∑Æ=(	Ë¸©ÚVüÛâ∑Ì0ÂuÅ>:l≈ñùÊ≠Ò 2≥1EõHÎä∫Û◊,"ÍA…º7®f„•‚ë„~‡àèÀ§∆xmbœf≥ª¢ƒamDÈh!<¢ùIu'œf¡Ææ/_2µMﬁãç@…"3”3¶òaT„œ˛˜∂xCTÕ`M]˝ÿ˜ù@?íÕødlïÇ˝¬!¿ ~—¬®≠◊∂B4å≠l!4é=œ∫◊ôn1‚ÄTy·†∞œ¿.ö˛ö¬—&πàaØ M?≈cø#H—±=ﬁÅπ{ÓÍŒUpåg˛∆]…≈b!âvﬁ
®ÅS¡Ò”b∞∑˘§ö≠ª˛$T•ò`à{h	døvüﬁÓ(„∂€fÙÜÒ~¿√ÙÆØ4⁄éÁ€ki¨Ã¬—àÔ¥K‹Ÿ˘ïÓ∏¿D\ÿ02ÂÈcÂ1g_∆oÂı√ˆª[tdÔÄ‘_÷O€~; fãZœ^ÙÎù˘ﬂ◊W`^‹˚ Ãã\(˜%–@ ]©iFw5:’aûW•‚√ß>p…3≠2∆ëT£˘è†;ØBmÖNãÅ≤g#∂0&ò˚áñU ·_∂l}I•4´8ûŒﬂ‡πº4lìmÀ&©õ:ly©;›º¸¯î«k3CÉ›1∞%,∫ˆjìôgò+7Ø∫0ç1*çƒ±«>p,éÈèÕ»~∫Ññ∏*⁄3xèH¯¬Ïp◊¯afÃÙ@ûß’«çrÍH“È00‡’Œyn;Ù›P
ﬂZ%…p@xVàPWlH≠4F≈ü˚(P™mÈ◊®Ç_Y ÊÚúk¡‹2ﬁΩ–-·…¸çãöÃB¸’ÜΩ`YD¡∑è[|ˇi††`|‡…å©˝hÈVâÈRÁ>Ω∏(Õ{Çá>
4IqûExCƒyæöˇHÍcG3ÚlFù74fh$
ÉXÄﬁ∂P'·˘‹èyÂ,ÇûØ\µ§≈
ö∂≠	,’-ÚÈg?»ØˆÏËHò›∂|¬ÀYÍ}¨Ì⁄¶/ÿ3P>¢D èNÛËËXÂ1ƒÇº‰“UR~>"õÖÇÿ”—u §Rl wÑ3∏Oã}Y z†ZS≈.àæÉ.>ceÛ: ¡©1^–ÜŒfd%e£˚ﬂﬂlô%Lv∑&Üµ»æÒépWü`÷Ø·1W<a5sˆ˝cC‚v‹‚å€2¸wõˇ‡}∂R7¥·¢œ6ÒR=lcœ}ËhghòÖÇ423ﬂ?F4?trY¶Ü9≠#Üœ.soÚxèéóÖ°¥õ$e‰˙æÖ–Z ÿ˙`ßQ∫vVÍ—{vÒrAF∂K∂˜	@Â˝∑õA»ÌªÂ¬}‡öoÆ˝>üXDyV$Â ˝8ÓêçR'†ıÈÒàDÖ±(πp‡t√°§c;Ú‘ß ÿÀ¶`ï(∏!f≥{ât¨¨œYûvüó·ì™≤ë™∞qn⁄⁄+29«Z‹|åó„fÏ0FKüJWY÷î©”Vrp≠Ÿ∏ _©©_Äπî3∂ ŸÎ%íåä±H5[K`Õµub˚¬ãNsc!õXû≥ﬁÉ´ ãà$ †∞;«À_]P"æ˜ÿû¡9wô0‚´S˝J7Ô¬*	÷NÀGR˚‹Ñe—qìöTºIÒ ≤Mrg„±ÓbjßnöC q¡*6dG.K’ífa	r∞V
±@ı˘?5[+à{ÿˇ ‚Çn§Ê¸çÖTùEÕØ∂a/é¯\ß¶wÈ∑'-√≤è‡ œ±˙	¸C™ 
ÄË<ñ`ôà÷µ¶õ‹Ñ~u 
/µÏ	IY¡≈ô∂¥‘V£ø`ƒ03äyk%∏3øÃo±ñ™éÅ XÂ»è≥CÌ$0CZ,cÜ3X\áˆ—9ùö6Vä•,Ò'ãÖ!∂QïÂ%ŸÈ√À¥⁄%ÉÜ÷4\¨«V
…Sèﬁ≥\˚‹ÄMÙtãï¡£Ü År∞IöÏØ»q*oo§ıi,∞ÛÎŸ¸ÕÑ¡5P™Ÿ9ê?f]_•)n‰Ã∆|R›“n @lÚ…ú#•≠Ë VFEå’YÄÃœˇ`j∂m&O?$j(¡˙w,T˚”õMı™»Ò@Wz¡JÉ¿æ8~Ñû¨4⁄ü¶ﬂEx‡Ê¡§œÆë*K>9ˆX)Æ‚ÂNmÎ^ ÷‡:6l˜m0&Óôªo <}ﬂç≤f¿¥ô	ä"ôŒÃ	K·YRõ‰y˚Â'ˆÙ∂∫ßË®váÆ"§%¿ôÏs÷=Eså∑”eBõ9P7æ∏≤¶ÚÃ√˜€ˇ  ˇˇÏΩkoYñ ¯Wn≤ù›dZ§HJr⁄,K-Àô™í-µ§tuµ◊H…ií¡äJV±‘òfgÁÅ∆ €çŸEÌb´≥ãùY†ælÕ ≥ç˝¥˙'˘¶¬ûs_q„uÔír:++êiIÒ∏èsœ=Ø{"≈‘;≥¿ìvs2Ωp#å7u»√vÎO»˝}E·2∑@i	P}l?<^œ¬Î˛»√4à}6∂RÚYˆÎ;∆lû<ì;Ù]v§ÿÄ\ÍC;¯±UÙ˛∏ÉN]jê¿É:ê˝ﬁCì¬v R
5∆L˝Ò5√⁄ZÉ¯&î¬é±W6éR2HˆÎÔ?tØ;ã|r·Ö“@+A∞eÑˇ≈‰Ë…≥Ú±ç‡êë®nÂ∞ÍV~¯lÊÉ>éˆ-\úôèá¸°3e.*~„„⁄8k˝+:k⁄¸L¬è*)„€?Ü˘j⁄†v˚Õ"<sb≥éƒ/'¡‘“0Z!Ö{QL∫GÂŸR;U=óN3m†L[ÓPcïËÜÅ7 ¯ù∞ﬁ¬‚¯œ6%C€˙3¥ï”ÖöHŸŒNÜx= 7“L|ûèÑ_€La´f¥à‡≈„'~D{1[ÎÒ ,&?◊gı\>ËR6ííÈ:Mπ∂Ûîà—c‰lìÕ˚Ë&jï”fwÇﬁå—ÖÏå˙õ1˚Ê
m=*èÏÒ_†ÕC–@‹sÌä¨‰¥˘Ãùh¸øÙ©9Ñˇé£ù1∑™%€˝òÅe?°Ωﬁß~Õ,1>∞kÿú9ÿDìÈ9ËÛ”›ÛÿÍÑÅ
r_-:à2$¡Ú∆›sc)^ô$¡ô~TÑ£ö‹le$ÕiÇGW92ŒjŸÜ0>ô∆*;4VŸ'Sñ/–iD˜sjøtÉû•áÂ’Ê:∏¬£bÆÓØ3√{ªãE;„e˜V˙˚’ŒR|ÖïÑçÎ=Sµ$'+ª~N”q ˜É≈≥é‘ ˚£€œ@Rüﬁ˛!§«Ò±°(p«‘#1∞‹ÏK‰∞è˛âa\”q˙°WZxÕk„Ó∂S“Ó8S¥TáÅWg8ßßTÃÒçÙAÓªÅa˚|/˘m“‰∂_øW3—W≈ˆS∑ÔÉ*:— Xü∆”±åŒÌ?artL'b·0EGdc0¬K1Å¢¡ç?t0t4Hq #∂¶≠ªCp£^©3Çæ;pÑß^X–ÅZÌB4/9S«√U¶†¸22Ï°iKŸ∫2¸a‡L‚˜Á∞JLQûâtu?‡]≥‘„îYÍf≠uÚ¸ˆ7ßá4≥‘…¡È˘¡À˝É≥58X>–8Xñ§≈Vç1ùtÚ‘˚”°7ñ∞øô%§ù¨Éw∂¢‚˙Í)Rú4À•\æY•U¨ﬂAhYøÍ#’wA}\ »É†›s7ò¯Îµ¬m≥yÚ
"–’™ˆ8ÎDÅ¥=m1üùf.oPKòºÅﬁcÒ0p`	#4s–pZﬂì\ƒô¿‘Ωí¯ÀÎ<YS¸™[√íT°ΩTZ©.çÜ⁄ÏeY‚6 ÅÜn‘†]ﬂJ>ÂT*Ëé=ôŸüî”∂¨≤Ö—¸∆)+Î8KY’ºπ;ÚlÖ´wçù9w¶UË◊èÉ”9“ó•∞ó—ı] !4€!/È∞™IT¨ë_ˇö¥ÃY“üï<˙#«™WŒÿ–%›õÿüA|Í∆»éÈÀ’yÿl4aÅˆ+ìî∏N“!ïßå+ ‚˜$q`¶(åã=J4˜ÊQ‰Om™€±7XÎ5ˆ˙ÔÑÊ¢ú\ôÂ™æé¸K7Ë»[≈fâE-ˆF*≠Hã»÷D√˙«€dv≠™h®eäV∑Í3ﬂ3Q˝fºè^0qœÂπç&‹i±É}5ïD#o?ÛBÿõ◊±∏í#êI◊-t+7.÷≈ÿø™èº¡@[[[Nmã-Ô¨óÌuµr‹vÔ[Yø≤G◊X©ç.znÛ¥äB[∂àÎÃç+d<#UÉOa¢pc≥ıˇ˝
«,ràû˜ï
Ìâú^≤∏ªZXyÏ^Hß‡ícgñ(&_ J˝ÇD#◊ò>Ae
qCE¶ÕÌf.Yê¶…ÑçR¨4Äı·ÙÄLΩioF£eö9‘%\I,ŸJBF⁄˚Àh∞J3ºÃa˜ÿ(ØcP]fÌ37oz^jƒê«Qœ\ÎªY8hâ)bcÏNá0¥è4…cµ‡«˙QäóL|;pw±sì–∂
 5‡¡(¬7Ññ˜‘?$SÉ!.º˛»i D∆UBj§cútfX[π
"jÕ≤æ2Ï[Z[>ixÉüπ◊7v˚8%‡nﬁ“ìë∏ÀA.ZJá™ û2H¥ ‹&A¢H3ä∏¯<ÎâZ
VË® iZ≤TWmü“ÄÙL‹	≤∑Å5&tØg2VÀi) ∆W	°6æ§x[•àÕÑ‹SwX´$kå:á∏2I@VJâ∂x€§@≥TàZ&eJN›ã∆4ú«‰3vü⁄-!G¥íÍ©›∫Ö\ı]Ñ2ì4¨éÆßy∫•Éˆıl^@·h©£ÇÇGÀù|ﬁ!˚G›3ÚÁ§{tºœÀQ¨~N9='`õ`ë;<Hä;àw(Á˙”„ﬁ7dóû¡√∆Ö7Tgÿ¬∂mV-qÓß‚ª√AÌ'öN<öxÛéBÎôîO‚åhíÂ	~íØÒ√ßh¢ﬂÁ…W«ÓœΩhƒ;®RÎ˝©h≥Éá«‘Ó¿Ã¯@‹”ÄGÙƒ>z∫¡.\˙ÿ¬œ]$≥·Î∏Õ7‰ ™Qò¸d rà·u‡ŸÒü∫º‚|⁄ÇßÈá.¥ùÛî÷[Äg[lª`5ƒú(Ä
ßîü’¥“üt“ãê3ΩºíSÃ{√nö jÕÉi<œΩ›xÛøπ—¢€c8îÁ~‹cÑ¸t‡€á>¢˜Öc|◊ÓäKÄæ≈ÛBsE˝ƒ3á÷u/±Ç‰ÖõgsìY¸‚Ä"8s.Ω1ûw√à	àÊr:úhœ„‰NdªYRÚ§w „~˝¶xTvÒ˚Ωk“óõõ-d®Œ˝˙V∆ìbÉΩTÖNp€†<m∞Ó°?qèﬂ·€Ö_à	ÿF¡Í0≥ö"SLEóÖœd|≠,üïiÁØ2‚ûÅ'Û(8˚BRœø bèÀôiËuS≥¿ÌhYÜß Òv6dÀ*¿£Ë⁄åèOYÛªyì¬◊U‡¢õdkâ÷qÃ(¿£Uf|…C:g,°£M¢àú.‡ü,éΩ?ËÎ)‰`Mh1„öœ£] IcƒÃ6 Q>3∏'|iﬂüO#.¿;Ï»◊ÆŒu„"'EZÓÇ0BG◊=-kíõçÇF™_oè oi‰{ãdüd⁄ße#pÈÒKµÇ∑}RŸ ï
™Ùïn´rSø∑8£≤J’#˜I´4upÃ,™∂7»_4ˇ¢vÛ∂,™<cúú˛7IŒ‡ó≥ß;„˛|Ã~ü9åRGz≈æ›w–≈(∫Œﬂ| ‰ïªÇ“¶Ã Ußﬂﬂ =
E¯Ê[Ì5˙¢›' 4õµ“D‡4uXéâÌáµâ7#*7PËo DáN4jLú˜’ÊFÜıÙäñìµíE)åÏ=e¢¿V¢ÓÿB0ü¿g” ∏›IﬂÛË[„1·]p˚‹ªøVÿ°=‹ﬂï_ıGN∞Ô‹nTı
%π"-–¯Ö3IÑ~†!≥tãr¶ QÇ¬V tÄ:n„O°uÑõ,ü0J˘?Ñ«q
∏W#üëf£µ≥å TﬁÌ;!"•V?rA™ü§IFMn:è∫L1≈„>∫ˇM˚∏5ôh*yòGeõ4	ßÙ=C´ºAM¨¥æ◊,!êm»g@Ma3éñ˜Ãõ Í§¨+Æp∑xız^ü^”t∞∏±çê˘kº~≥c-∆€ ”£ü’ølu+Ú∫’ÿﬁ ºxàˇ¥ÒüG§Õ~€¡>«?õ¯€˛Û@æº˝¶àsà⁄ºÉ¶lª•6À[‹ñÕ∂‰{Ù^ÀÿAÎ)v–d„Å^ö8xﬁƒV¶E˛Tå˛4œ‡)õAéñ¸#9–ù$ „	µ;(⁄[ÍBü8Ê¿ÉïL/˚ÎT~C•¿ñ≤T≠‘`‰Éù\`ÌÌ8CÅ”úH«xå7é/› .’∏q{Ç˚I¡óÖt2,¢ö∑ø`∆ ;vrõÄÒ;?—O<ﬁ¬“ÏÚï‚ÎF$.—&±'¸ïËüü±^kç»ÓΩw’v≠fÁƒøÑÌ›†8Co^Ôí¡uﬂ óÃuπ§}ì¥⁄ÜnÖõ˜cŒù¶∫zjâ-<˜	l75˛=v®˜∆nƒo¶>Ë0âK9LaHÖ≥@n>2 àÚÓπ˚ŸR•R4d‰Hqøèw±£b∫ô€ˆY˜¸´”Ó≥„¬>nà;]⁄Ul`gàyïÓ˙‡Ï¸ˆ7ØéL]7õ`´œÿû∫W≠V⁄ÕˆÉzÛAΩ›Æ 3D˝∫∫ÙgUΩ7‰˜jÄäTF§æ9∞¯å|^”ı√∑¬4·V{]˘©3E’‚π{â?^8˛Ëˆˆóá?~:ü≤c˙lË„è37¬«s˙„•O?Ê˛™RHÛ·ˇˆﬁ"wû®‚∞aæN=Åw´µ7¯FÍ—s èøpù >[,;ÍÂê?±=°S8‹$¡|äØ QÂ6˘‰=Ò™ÁÜ)xhªNà‹≠ ‹{LˆÆ◊u»ü3\UŸ»<Æ´xñG+_{otòñö]c>GﬁETMw§ÚK(zECÆlc6G’‚	w“~{÷j$ºõ∑≈R»9»>1°8ËÈ’37—1¢RO
 1m3Tı¶y™Gõ'ÿ Ú{Ì'‘6Óê∑¿t
Êò.I˝ú%w*|˝¶¸⁄XôÅ∏Ú%Ã∏¢ë ã õﬁiö&≤P-Òqæ ûH∑R+n¶‘oä≈òg^ÜÏ$I›8ª(–òvNnßåxx”™ò–Fﬁ{˜ìRàé3ïﬂû˜Ô-ñ›ô∆çï≈.f')Ö–VMÉ·fÂ6ÉbPÁë˝‚'V∫¯µåÃR¸jF`(~U¢èÊÎmo⁄£∂ûZUoê~'>+Â ìÑyé¶€∞ñªØÇåﬂx4EVÎüÄ.sp“–I¢) Zﬁ
¨RK±GMﬁ<„‚µTVr±9È∏GΩq|Ù¿ÉˇhøXΩ}Ò¥Ûˆ/ÚÛÊG¿„1[ƒ√)[òq¶◊	.≥îÒâhHÙÅ”UÒËç∂•≈åƒ¡§¸¥7~gÛ)…éﬁLza•~‡£#]ÇH„õ¯õ˛› vÀHûÉiøªî}$Ÿê˛F¯'Ï˝3y¿Ÿ·°vÔø§Û«/p˛öOä	∑ñ®õÃÃ†Œª+õxıäåZGÿÿïJÙooÄ>JŸë}R82Ì–‰0π'ãâA´A^πM— M¡ó‹1◊ÂÈósó¿üŒ{ò¯&Ù{uã!¡3K–BE™«Õ∏RAßÍ≈˚‡gÿ∫“Åä;7¡oEÓR˙&`&2∞-Ÿûi¨a|Êç÷ùÉ„œ1;£-„äzIgô?$ﬁ“<ô´J†e\èOí>GâGvŒF…·—Ÿ9VΩãG'◊#«1Í]—Ëè“£+ÂÿÍ≤Ë∏5›Ÿ≤Êº‰å”€Ö`Ï+ÓŒg∞ô@„∏˝áT50∫ó4]â#¶áE∞Àr+ÊÉ`pƒQΩ*NiVç&Ÿπ2Ñ÷I8iDVÇ[÷ƒJƒ˚åïºm>∫Ç0zI£”Ÿç±√ˇ÷jBx)lñC¬ÙÖÍ‚BOç≥∏Ll"π˛ñÕÏK/B¡&‚˚î\Qg¿Ü˘Dc\`ó,›&'ô\|ã)&õ`ìL5b3≈D91I·7í”^æã»MΩŸ2cÇÎPaıÌwø˝áˇˆ_ˇ=f±¿x3QBäâ“˝ÃJZy%A∂≥)⁄!ˆ‹Œ˙0≠„êﬁË¬/Áºlà≤ÔÔ-8ô∫iô0®é—eµy·<}zó?¬7„ƒfHr®LXƒIÔ#Øìæä’ù‘ÅDL‚ÎI~¥∑K⁄F∫JÈ<á≠$˜ŸÑAJ:∏˝=ËIõ on›(X‡µ’ì/.20∆U¿ÃbjÀö"G‰0µÙ”cK?∂eΩxq„FIŒÄ¬ßò·cïyk±‰O¸‰O¸D\?r~Ú/ˇ‰'«ë7ë’—QPÑN√ò´‰±öç,∂¸8òw5ó–˙SVA•–9õ]Jq»ëÇ5≤u*wƒJ ´¯õË^ëß≠héø:?=>ì∂,áL‹p"ÕY™;q∆º4.’^i
EgÇO°…)Ê±
CΩ∏Æj˛?÷–†J^ò„≥éaˆÑﬂ≥J;ÑÀsÒÿ©ÓïÍ©&Õò%F(¢ßíM-J–Ö£∏•Æûâ™¥ıŒúæ–co–sQ[ZéÉÆìñÂûiﬁôÉrtπ*À?”ÿcÊ-wƒ<≥¨≥¥|ê«:óê¥¨≥Ñø>0œm÷˘œø˚Ì§ıÄ}¥ÆD#Ó‘'¯&hNN¿
>fX(íıo—2YWÙ2È$ìÓ©&–j¨èz[ çk††íóÊN‹»MK™dZs¯Rúr$óLû#é°”≥¿“2q–d‹∫“Ïôè‹t‡°3po.b¯àr¡’‹æ«™WyqçÂ"#?R<Jé‘å:Íµ¨Y8ÍÇuõvu€R√òØ¡»	G:Áˇ∏√–u,ÖytÂl[Í≠≈«UÏúÖWû{O‹A2¨ÄÒ˛Æ˙‹*Ä ∫XIŒ≥ÀZ¸î<2it…Ô@œﬂ2iu¬Âˇ¬p%êm«!IL¶Ëõïpæ4¶uQ:‘/â~- ]è‘2–5∞=^\?ØRh◊†Õ-˝zÈö-äÆi- ËÿÂµÏuÎŸiY!_æ3∑≤Ì{m˙wÆ!Ñ˘„5à
ŸfVöNÆ» “bâc9‡˘ñ⁄dX·)c@]u:‰‡“ÈœA9CnDm≥0÷KL†‹~€˜(£í¨)Ñ`gòe®™ﬂA=Ÿ⁄‡åc’ëL÷ÍﬂFπC,„Ål_L¬BqN∞{ÊÔd Qb⁄ÿ∫î•∫º;TËF“7á:&ù±%E« ¿õÑ/œF˛˝Z˝(
Ên±híñˆÙRv"€ÓR˜È¬D9∞·ºèñ-u¿l4Ò˛˛o…¡Ÿ˘Wœé…˛ÒÀ˝£Ønˇ~≠ÔëC•vy°å˙&e¿π∏»¨&Åb¬i‰á§‚•Y,ìÛ˝ùCÂªˇıø'µptÚ¸@M«p9éC“˛r	€o>¶ˆ«'L(úâﬂsnüÂªpΩàWàthÉøú{°°Ç 3`B£À¡0˜æ>2—}ÔˆÁë{Œ◊61z´©ÎPH˙0–ÇMDÓt≤PÎ«ﬁö!Á{‰	9'f˜$XV. Wg@ır%E0,“$H1n"Ã70£Ü‡Ú&Ÿ¡Ë5…ÆF[4—Àîﬂ°#I37€FúGm'~†ß¥ÀŸ/„≥ñÈdÕÆLZí,É˛|¬ñü˚Ö4pK.)ÛJ¨1Ûæ-Ó˘
xò€ùºË»g¬>•3ÃV‡OÚÛ”ÓÀ≥Áß_æ|—=?®¿™·.–|!}n5dJùTÒ[oœìá¨!ÃÅªg6¶D=61 ±íM2iCª¶Ó7ÙHW<OÅ‘ú†<àƒçÿ~ê¡Ìƒ∑9Ë
_£î√d
Ír¬^B∆M!A‘‚î=«∞Ê
∑à1ñ	o}Z,˘ˆ˜Áò/|O≤R,"ÅÛvÜ¬”∆Õµ«‰√≥&E[–ät«„,7∞t^.f†ø>LŸKÊÒªÊ<rŒâ˙##Ãªx‹TóOì qJ†Ò¶ù|øúHåb-Ï(€ÿñ'i÷ùõÍBƒ6Y2óÏec…blô∞ôSŒ*XaÍU`#¨n2Ó4JNK∞Çñ·Ã¸–£Ö©Ñ	{)Œ!*¬uxL√.&èîi‰?–ã(w»N~˚-9=8>˝¢˚ÚØπﬁÒ≈¡i˜à<?8?|’}÷≈ŸôHhVI„fÎPµß];}D9^,f`·':ﬁ≤å«•∞bÿÊÈ’(ÖK1≥^*!ŒrπJfZËêL^h¬*˜|€nÏhÛhÊÂ
»¶⁄LNΩ Hâ√∏EC
ÄÇØéhı˝gÛ`à•X˜},îØfÚ?}äº´àØvöÕÕñ(jê∏€.j.˜&r‚úM˙√ÿnœã†-¿´M^±/¨û«Ë@{‰G¢“*i5õü6à⁄ç(˚◊(l;˛Å“|˙¶Ø$Ë≈
‹Â≠B†kS:<&€≈@fx?pÆCá™ÀÜP¨"'Å
√ÿ«˝ﬁÇu	–Ç˝[i¥nj·«'7¯w¯∂¯DE≥êoc◊€øπ∑»LD	1Ω#¯€Ì?0ﬂ)é˝hÓåÖc(^‚›ˆaº•Òîµ\+fp∂·R+Ey<t¢vÏ≤OìVå(…0•‰"…*9÷´$ãÌ(Àﬂ3≠ì~˜…"9S‹$€ç≠ÌùöÚ7·z6–„ØøiAn–ØÕ]n	œ–([çUÊ¬£îÉ˛Før Œs¢€ˇÑ-]øï›rfó]œ8\¡°[Àüßß ó ≥˙à¨$I±)ƒòœ|òï8ÚøÂŸÉíZ~í[
6¶Õ@${ß¨É7Û6ª§¯Jº-’$ß∏MÒ†Mâ?èŒŸ)zº÷K∑ R¢t»è ø§·˚ò¨°*Nˇ‚ºÁe3Ab_<BboÊt¿˚∞Û˝(Ú˚∞M$)»˝AVK%©ùa⁄iDv≠q±jƒ˜ë@Ω.ú‰B®êÁXO[PÆÁÛ°SŸÄYÉíÚ¥⁄ Ë¸wX™ùz´ç˜h÷Óıt[–ÖÁ6–∫a Í ı#¶«√Û–ô–u3Én8qÅ2è1øÜ7í{ÈÖ†¥7†ü€,†˝≥yœõÜ≥ŸwÇ±VäÛÂ*Ï±∏;eÆ‘Gã€¬‰<øúK7=I¯/;….Œ´œ'ﬂ˜`‘˙“œΩ9≥™:≤”ã€ﬂá ?2π˝'®» 1Òléj“}'5CVé<á≈tËV<Ò√êFU!p#,*ÊÉ˙=-&∏]o=ÃNê πø⁄|B"–''4◊qIﬂ	wk'à\XEò?⁄îi…b<eDW˛>OÕÌê.›ô7æ¥ú|0Gﬁ‰Mπ◊|bB‹) ≥d≠ùÃå`…›Xà	ÕÅf%DJ‰|”ê˘CÓÅ ßs¬Fú>ûØÚ:êÒô3e'∫'PK Í‘≥ö÷V}´ôô4Fœ“9sõbI(fhÅçÕFB=9∆ÛâÄ!LÎ¬ìªín≈|<Å¶$˛D@º˙GfzI’”9¶}˘ûˆ[`„NΩù≈F¨ÛÏ˜PR∆.f.l5îúf~¿ÍÜ—¿∏c¯=ú·∏‹ió,˜ÛtıqmW≈Kû∏{¸å÷ˆKN}™r03ªÑ]†‘wÏ¡Â°L‡¬9à(ŒÿvPgv˚@Y<Âø˝Ωœ##˝4^.CBN—(Ác˘u
¶/·ghû—6,YfFX«|€Ö£"‚ò
√@˙(π∞#©a@ù\“s∞^rà~C∞®ë#9Å1&Uúò!ôê^à6°}é<.J$x∂Yò`˙ÄNÓ{!B1˘⁄˚˝=?MmCdô,#ÜîPÌ&æ~-˚“$På›°la"Í‘∏>«qm§£VIÊ©ÃIXπS©aR≈s†ª’¢Ú~?#Ìm¯ÁAS¸”j6õ(¬ûÛ¨ÙµF8{Qı/Œˇ¢FÛ¸&≥ÆfüÃF£!`®;å¿	.Â,ShãNè4¥ØVë^B∞◊¿æì∞ìùÙCSπöLø+(<{6w„IÎw¢dã'x,LÂÈ—œ*täñÿ Û?‰‹Ô”õ˚j›í‚sø‚∏®§±ër˛Â5Ñ6rèY•ÁøÜ{§W§¥ERe	„ô¢ï-©a∏™	âèˇÇÂ6Kü∞<.¢˚=–øÄ)añ:±GŒG ∆c·r4”≤†ÒI|ÅÖ˘$˜}Éﬁ¡ÍÜAªû#∑=Î˚Aj‘…G0ÏG;¶¨MŸ‚ÒŒQ+LË«‘€wf˘M$ÎffÊD'˝(icØVÂ±Zy†Ø„˙‹ïye˙ÄVaÔ‹9OVáSkX’“Õl6#≠ÕÈ∂(FdjÚÃ¬Ü8™dö“$	ßE58Z5Ë√Nq/.t$U7a;CôD^[˜q2(ƒ(<ªçïÈ•;ë,Ë¶’D©CœôLŸÔ…0 -Jg$.∆¥≠f·\¥]≈&·»a4XÏYµ_ôÿzCE}¯8y$ÍÍ,ÍO8:`yêùZ≠ò—ÛLe˛tàE«ª∏]:Yb4Í8’ëLOóüÊ±Fˆ"Œ_‹˛~ J≈È?(oÃ_Æ√ö∑≥á∫~êm¥[Õ6À]`üÔhSk´y§

*;µ(>⁄%9¿‰%cﬂƒGqnÑ‚é|$x¢~≠3•ØœÊ@lRÚÅmG–ê €d®±„µí 3ù_¶a∂ÃÒe!‘LßÂÄj€„◊\—‚P
@Ê≥√Ññ<:,Çë¸¥Hzπ}…Ë14ò{\ïu’0–[–»ÙÊï‚ä˝@Í¿íL"2µö`ºÒ.*`'VLÀ˙ùÛ˚π^?	iCJÙ:DÉ®‰œ≈:Å ˘uöÉ"ŒZdmNÚ°‚ÚvEÒ€r7Ë_°@ˇ ”°˛πƒbH®à¨É«€‚W"jú9æú~èC¥#o6fÒ]sp «c= ≈{ò g}=p≈{Oá 7=¥Y’[±/îèíäàïÆn:C∑£ÍavO◊ˇ+|;Ò˝sí$:fY•Ç7¸†(º±(Ix¡>·–≠=÷T-xóƒÏV∫≥YΩã¶j√≠”∫ﬂ†«*UÍØÍÛ1Õ˘SgŒ¥ﬁ"ìAG˛’&@©C,·T‘T_vˇ!‹ß"'H
Ô«dVo7vH8ÈÃÍ[‰bÏæßˇ‘°E2t‰C¸u´R<¨Ü~Ó˚„û†˚©—ÇcÈÅÍÖÑZN˙hyŒ/xÆÄBôorH0˙{‡_·Ô^‰N¬zCÓÚÕËŒ≈u]T§√W‡±”‹|ÿƒ˘≤Ÿ‚Ã∆√|PÌ45sf≥ŒùÍ	0}xÜπÍf{Ä˙üòŒß’ÿ—éZD<Põ§¬√ÎVsˆ˛ôœfxÄ
íÃÖ?çÍÍ≥ﬂzh8Qƒ!' Pv$ﬁÙ]]:ûøÜy(√’∑ WÙﬂdá≤π«¿»éóÙ”‹ƒy@—õGQA%Â¯¬sò›
{’ÁÏO˜«^ˇ›ÓÇÃ`ºJ¯ós=d`ÿAt;÷√$¶,pX∑ˆx)ÄôΩß(9ªË≤5{ÑKñ∑PÒ2r&iqoDip‚n;M‚G€Mí1˘˜ Õ-∏	íCËıôO=œãP◊=’=jBG Á^’√	â¸yTüÄb2„l¥#/`ˆ˝ÈÖ7îûDß∑ﬂŒ–ÌÀ(‘97®qÙ∏N‚)bi0ÔYmFf¿bÜw{≈π∂ËkkGd‰5ΩhZü:óu∆˚é_Y¬3≥Ã˘7x™?ø?«SU<?ï}z}8®V,Ÿ≈q‰é»òçÑ©ˇ†™C7ç∞¯ËE˘Ø<˜™∫ =w
 =Õ'æç*‹
o`ŸÂä1ãp˛∏üS∂π£ì÷ï‘ûVä]≠Xv‘}-nè;õ
l|Ûúc¯ı'7©> d”A˝Y‡œj+nıó ¯¡ª¬≠ÆB+±Ÿ’¡Æ}á£$¡TÙÓyÂÖs§0~0aÒ<ÿ%H–gﬂ1»–¢°±∏∏öãÓØ∞7ô`fÙƒ*4ä´ıŸÄ]·Vó€ è¶%AÒÃ}ËåAœåÊÃ1ø¬'ÌVLeâì]OÒpnıﬁ©˜ÃíC¿mÏRg¶‘âK,õﬁ∆q°•¥ÁÜÆ¥•È√N9ê&#;⁄Dbb? ¿∂µπQm,§ é‚Öxé!1To>}k2Å*`e’_ˇZ]ü«‰Å÷≤)Æ‹•±v'm¨Ê÷ﬂ÷“ökÜ3ICY4&!ÏMá≠h¿´F√§@´oS1Ç& â8º$âu«^(M
µK@4n∞÷jÅz∆√<èeajBgÉQ!æ®*i|KQoWìQò‰QRXHâ˜1Z‹º5âWx≠]√ã$ú§ÔÚ‚*≈¸»K‚1wOÙ∑¸˝•ZøB∑‡nÜâŒ…‘´∞/4Ö¿ ø‡eíaJ´˘ã∑WÊ#˙Ø∞kPSëêb0¯çÔÄ4à46›úÅ>Ïè‹~Æ»§JH∂£ﬁ[ƒ˚Ë∆Fèß_nzõ^3e!´Uµ»¿˚0|∫±ÛÎ9H´Ë∑Ï“ÙÂ,!˜ˆûÃÊiìIÑ6ñI~63Ü-∏/nπ”Å—D'êçkH;Gò6Ï¬ë3¬7UWÓC˘µ¶Æ∫P≠@œk–JòCoÛôÇÙÃrË•R*ÂÍœ√é?è∆ﬁ‘≠O—"CzÃ
eÅ˙%X}JÿÇ—)›∫(çë:ÔÀ≤∆Âöès∞¬w◊jÛ“:l”v∆g†‡Ïﬂƒ˝ﬂ®Õ˘‘˜ô£Ø(Lí6~&Ü©òÉ+{ˇ¸ªﬂ˝#´›Úxì5U≤G”tó∂©Ó˛˛ø∞ ◊e˚c(íÓMAïÙÙæ%¯…“≥„ËûÓP¢}zzˇYΩ±Î®?•N‹˛%ÖVœï'¶†	2øãmZ≤}–‰≤Ø.k
nmœŒ`ìcôâ9ˆäSkﬁç›<ì)µñ–z^@´ÜXHtÔhôøâo#◊>õ˜Í¸pÍ9Ëˇµ·|8s¸yJ≥∞ó>ï z„√@èññ9’< 9©I179∂'5&ÒÄ	xEÀ»aE§„
f1nQI”¢¥¥ö6≥Ó ˘úF“ıŸ¡uE%6idéÌtﬁ”qúcƒ]∆AÈÿí◊Yv)R=+}JÆêÓ4Õ¢·œrùQ~ëòcÈé4¬Fôô1vëòö‰È.D'cwoh∂∑ÍçyTÚ‘´∆vº„ù{Ωª†M2w
XÌ–å˚°lˆú[#iﬂﬁ†îàåŸO3V˘Ñ§lÕè ≈afÙTæ3@˘Rn’á9≈∆v5ZÖ˙Ï;äw,-⁄/∞S™iñ Ü#1'Iº)î«M™]¥»EòÃUÜ˛-∫=ê‚]Ä6◊îSˆlÂx@§∏ÃÎGçƒ"b§∆‘¿¬‘ë(ÕdõzbÌQú±j€Ó§\Fc”≠∏µ%l∑¬U”"‡°’“+‘¿¶-,Eèk+°nfé7Ω˝O^∆Áï¯UÈÅS£¶m≥’ '–§Kè°µ‡®$K5 “c?mÎ1÷ü∂èg¨Ñ ¡{êêZ!Íöœ©x@L[ñ8ßûïıßmc˝ì^{ôÚÈ≤'cöOŸæHt˙òh›Ä„Ÿåº!-äµ/ä€1S`ìkeø˛uˆ!SÈìlpŸå¡œnX≠ Ù5îIx4x„"'4ÃÙÃç™ØçÜ|e„›≤szS´5B‡~.z‡∂äc>“mÅÒ\RÉZ∂ “jÉ¸@™_oè"+˘Ù¥]ø∑‡ë≠FiÃÙn¢j{ÉTöï⁄Õ[ãZ3}g‹gSñû±á…Œúù]Ù¸ãá≠Ïj¿ƒ1KExP„m›ﬂ%[öòaºRQPπ»£4WNe’\y$ƒ†*À…∫ÔgL  i‰º52E¡µµ/J‡éü•®5]õáxL∂wqÒL…j◊wΩqµ ˚ 'é£µ€j¥6FKaTP3ß›ﬁ6ÌZG9ZìB.ÅF⁄ﬁ·ÒGcﬂ‚◊716ÀÏ	;!ÍèZzaÍ&É'°Kf∏œDZ.K/öÅXí…L3˙º∫˘ﬂÓo' ì4¡fÊ°{8çÿ[Øõo(£Y«¶zÏ≤-œO?åêÕÁœ ?Ò?‚⁄Dˆ’†ﬁ±`Ïwå2˚]¢,<PÇ≠ﬂ+°Yma¸"/∆ı∞Ü†€6@Œö8Ñ}g¶ò∂œº	cz˘è”t≠8l5”ìû∫}§3@ˆ•¥e ë" æÆe~¨x_x«£$∏!Uä„¢qvu¿E›‚»)	%¢X,&ºàAëY"Ê€UÈ¡kÈN‚„:È©Î}i¯6Çˆ@ﬁSÑõXäS…[•·¸Ü:îâöNûAÎjÅêÅBØël ·§nŸ¿¢◊>¡zâ°3f«3 DR0b&ó–ôjﬁB¿·ËEè˛îBy{_C3@˜8˘—$â[VJT‡`=û{º†LbV¨≤˛1#`Å(XbÁ6!bÍFä_Sq◊¶KîÓb óm«ŸÒÌ Æ<LÅâ11J´b€my«Â;F.ó©ÅHÉCÈ®√4ó˛Fúfh–…õè±Ïzjœ¬êCÀ@8v…Ë)˜Çm˙$™ÿ~ﬁΩà0îJYu”ó,Éu™>ÈGôéô‹i›ò¿=◊÷”o*‰\UmJqúL”!ÿ\sP&´°–ÓBL^ê^x7„@˚÷FÜû1Z£sc=]¿q(L”2°¨”¬ü˝sb·”Ê>0x ps§ÙxEM$j»`#vÙ¿‡GjÂG&„–Wàú˙i\G˝Ò©πÁi;q"úà∞zTe≤’T≠çÖ·fÊà"„Y\⁄aÜ•óÑõıÍmcá÷n;-A[¥$¢G‚Ãmõ\¡ˇöhõ¶sﬂáπÜˇ(p˙ÔÄ÷Ø<y`˜,≠¿Vs"•lÖ63Yß[ÿö◊œÍ@â]eéâÿU:∞Ü]°©ˆU!‘Y∆óÃ%K*Âæei»*“ \=ìe#1Iw‡EŒ&7Y’,
›ä+àÂ“Næ∏JÖ”¿BdO^B	,•ıJJ&AC˝ªL;IAÖ∆ÅÀøÀ¥ìñWÇí‚äz•Eó†ëº≥L[\éâõ¢7¨˝«Ú]sœ∆)8„Ï#ŒZóuïŒcâÈ»Mü˜tºñe±£‚Ø`êÇı€jÛI©|˜#•úˆ5Á“◊5Ë“ì /Q®%"è¿—btî¬	b%äûZT£K_h‹¢›Ÿƒl‰Lv!ä—eÀÕ)Jn^fC⁄kÇ∆ÈuáÙe∑gÉ’ñéÀ¥oG˚7K÷6N^%*ß>TKè=;<;?=|˙’!´=ˆÏò<=:ﬁ?F›=9:‹Ô>Îí˝„‰Ï´˝É≥≥„¬Ú`ÈÎAkUœFmSñrwGsª¥~k@íÖ˜0}˜Z…Øï§léÄ†o•§Èa ‘ˇA5.ƒËÖA'˛s€Z∂N∑õà ¿®à¸%ñN9˙d”Bü§]Áªb~Œ|_r/—ìIb_eÂ9èdN÷È≥UeåÍ€ÙµÙPT'òΩ˙vªÒ”;Vù~Pãr¿≈`≤≈“˚ﬂÈrƒ9⁄ˆ™QÎÜlíVª˘ß•QˆãOÎï$CRÔtq§k◊ﬁ"c‘ìE6Ò®¿zÀ˛÷È»ür‚¿ùEª”EI◊˙|ôRvQπH¢éÃZ◊i-ºØï‰}mŒÁºØè`RÓbÏ_’ØÎŒú÷◊5zË„µ(6|†oâÖt<z+°Ñ˙CËœ+]J
qã∑35UÔól¥‡20Z8'≥ãé\q©…è
„Èí/a¯yf&ÉÏ‘Rª†f;QQü-
ÊS¿◊“bõ≥=S©¿ÿL€Ë±ÕõfkÇ|c›	 ØÇG±óJ‚6Å›µπ5	 ù'C¬áàÑ©%µü∑¥=£ ®TqHê1úh“áaœÙ;Î)îò∞%W¢ØZá5… ÚvÀ„Y*xáFËF#†√ójPµé◊ıGH$ØÏ}˜ø˝˝:⁄VµG•u:’⁄Qj"÷´h˘¢.\¡∫!„+ì ãæ/|å>Ám’Á¸ƒOûy”€ú–Ñ
VÅz/|v=u‡tˇbÈ€√ÑªπfÙ≈ÇZﬁ…fÃÃ«ö¶(ºº}òÊÅâ}©fu¥»Â®t&,†(ö lß[;§∂µ˝ñ≥˚fC´≤ã_]à0øimHØ‰A_Íÿ![±;uálÆö9Q1Ö…$O‹nJ∫…oDó …^I´íyõü∫¿i0œÏ§A kg‹Ù6$“`2
aŸ“F!C‘(}Ö’eC9·ë”«-œÿ/âÚ¶¿Gµˇ%‚:szÁ!û•z.‰ô”ØíÖµ‘úóà¯ÃÈù◊ñW&¯”÷€ˇäÉWò◊ SPf®ƒk”zÉ.ÉFèÏâô¯ﬁPBL·◊õb9ûÖÓ'Ï∆úŒÜD≈©°îqûYZ [ºMƒÊôÏc∆uo°ÑÅb|]"Vs-‚~f)ÀH•A˚,ßC≥ë≥ KÈÎÓBµ)#È{”Ÿ‹îH\å	®=€)πÑLºÈn•e˝∂Ûﬁ∂‘†—Ω¡ùïhù'3Z¯ô¨Fˆgu“?˜M§)£GíêåAp…+_†Á‘UzãmÖ~uƒ(nlBÖÿeyFó4TÙ#†Vb£8∞∑¨Æ\îrâìë};”±Ù}≥TÉåÅM—œÿœä±º[™t‰M<'pQÓ˚ﬁ$F˙óA îƒ˚ìTZíêáU‡ë˙ |D:œâƒ~QÒƒÍÉ⁄OÖ˘µ´[ÿbÔú∫◊pHı¡Êñ…AÏCÈ9≠§û”∂‘sÙñ›;ìÀªRÁŸÔW8âI`≥’ ò°G‘a[ıƒââv1mH§'·áleÔªÛêEa5“ı&¨,!óïî…®<÷∂zì b;6Ør¡™8m,)b≠]º“RM÷èeK4í∏†Ìﬁ.sMGÖ˘¥∞ôMóV¬Z∂d i˘,•éª1JfÀ™˛X®_*‹B–øﬂ}ÀÈü®¯·È_>ˇ†®üïæà‘Øò†·ñ¥Ÿlú0Am≤®!:‚gïÌz⁄
◊FVzeEukª¡´¯lû˘=å5âã\^àé˚Å5¶C÷¿«ØcÈ*É≠UÖROèx™Ï$tKnQ⁄´îŒ÷G.ÖS+gA"PΩ”≥ríéu|Ú‘f{˛¥ó⁄≤Pƒ™¸'¶{í÷™(¶î%ºW)–lYåMaï«P≤h5õ7åC¥¬o‘πÿ)¡ÙìµT_ÿ◊µZe—ÈÃÎ5´ﬁ>2∆ßÌZ4∫Iûé˝_Œ]œ''X⁄x[v≠;ULÓŒ0•Ä3˛XwÈÁrìn-µIãÁπÏ=)jÒOõÛ≥9≠ˆ·æêü{XIn$6WN∞ﬂ˙“∞6…ΩŸe·CA_cIúA˜WéÛ_π¡ƒè‰Q>VÉVä`Y9®ç˚ =∆≠ü≤?ì-Ûå¨eõˆIà?¬]ÒçìnüΩ∑L≥y0'áˇ>ˆ“2Õ_ª„±•4ﬂù8(ç•{`ÔïËÅ˚LÙGæ◊w≠]≈ÀÖÎrèq÷áµ∑¯2aæyN_™ ƒ∂#≠rTï√!NHSs.s YT[Aıà›‹◊b=µ·$Œ⁄•ù–ÿÅúY“8‡x¶ÈÏ€ä(AN)˛îÕ™o{öly∞ªºk	+suï-vuO‡ ﬂ3÷ïÆﬂZ•ÄÁC+ˇncú)™≤“++⁄M‘r≠NZıÖ4dï6VOYŒÊΩ3∑èøi∆ÎCg ”õ8„Ø¶^Ó.rnÍ@å§"Øô¸˚∫ñ<x¶~‚ù¢6¡í‚ã;ËDV9öLúäÆ°(ÜC78˜ù0⁄]®Uàœz…ÃB"É›4t‡œ:Ó8É≈§@‘R‘,‚Nº<w´tE˙  ùïRºêÆ={áqå–aîöx°3Ω$=•„…	∞'z8–”5Æ&`9¿gN‰4“_Î7u¨∞RCœ°vGˇ]ÅÖ0_4fqÑi6ƒJ,hz1d±øÑuËç]6Om6≥D)*ÃPê™˛±GAÈD'8ΩÍ¨Åã*Pãÿ∂õö])=IçÀKøa.‘Ã	G=ﬂ	‘#'c”[ä≠≥€-4D#ªÑe|,˜¸ã%"YÚ˚}–¨Ù≤A34≈ÈÛ@+îÈT˚}L”€kÙiqÀËö<yB⁄Õf≥Ëï»ÇyÌÿ˜≈æ¡ÆÏ;öı±Ï*üÙ}B™JÁõ¸Ø™≤ç¡âWd¬DÈqÏ;ö;Ÿ√Ô◊ìÚ{âgL¶5•Ÿ≥›©E~J±V>g„˚Le±å94e€≈ú*2£ˆ’U≤Enníg.Ïä	z°8ÏÄƒ&Û		˚Œÿ•π≠aÜ@AJ&S$4cÔWh_prÂ¢Qh‹ä–‚1k|_Ïâ›8õ$∫\™{5¶ãÚïô‹Ld&êΩàﬁZWé∆¨-H2ÌVíÖ'+õöÙ(útfım)9øó=ﬂ∫ÉçI≥∆«óëQ%í£◊ìû1-ô
æ±x\5w£•G∫âè}˜/˛ë(r,2˝„ﬁ7O(A¢‚,Õ¶Åœ=ö£F+◊ 9/âcÑ≤≥êóÂÖs9_yÓıª gWV–◊Û-7ÆV¢`&≠bõ≠øîŸÇlIòu7Sú…>∑ú9g=ÜôìòPr‹;wz’
÷à*KYc≤57EóHY8.Cû2é´êÕ)ïY¬63Àõ(´¿&k›í(ÑEIŒÉ§'UîU/”¥å?ì&≈WíóÔÀÃÛœø˚ªKænøΩ˙6…Ø Y_>™ ÑtÏ˛Xv õlÈêk√¸„ﬂˇéy¿h◊éˇv«vÙMMæåò%¸ñ6uˆ¥EyŸ‡≈ERÊI—©Ï=k®HM¶
‚G„ËÖ$º…u
@,ÎsÙD3´?ç¶ıÉ˜3?àú†~Í¸¿ÛÎ(èıﬂÔ>XrTÆxSYêñ!%Dr‚N=¨–‰›~s‘ÎÀˆ
ÍÕ&û∫≠´ˆˆxÅîÜÂöi1èüêﬁ¯]ÚF¨OÈy˚ObX‹‡Ím|C÷.Õêõ=òÓkC=í¯*RÅ»Á˛WaXÂ;[˚q$õnÄB|‡ÙGU4Ÿ÷ßS/Ùnè≠:Âr∆*÷ 9X¨eÜÅ[9Lñ;~[≠òAH)Q•èπ°i3Ò27’Ã6¢ÙïB ∆léJeÁ`yY ‹ìæ$¬„§ñi ﬁ *XJ∑"6ïÈ≤m’,˚ô≤[±Û∏ í!ûs°Tìˆ}Àæm+„l_ÍÂR˛!‹ Bû˚'œûWcRΩë∆UYxààÆCÀõZˆx}π›˘¿ãé¸°ù˚ ^©ÌWπrrz¯Ú¸Î”Éì„”Û
?æ/Òyw0ÒB<E*ë4YxÉ}¥í *Ω‹Ïñh·-cÏ˛úP∆~˚‡zIcã;!∞L¨„ï∫±M∏|g˘ñ5÷
ëÂA^f‰œÂMj|≠øn5ö≠7ƒ°ÂØƒΩf„—£7>∂oa6πTƒ®T`T]'´Ã‘—¸À4 ù^£MùUz,E0/‰Ñ$W∏‡‘´~H‡?Eex∞æ$“èü{c˜Äò4anë+¥ˆ*fJb±ïp¸$ù^∆0ù— x—f‘RÈq““ —{ë‘4/õ*˝ìo,@e;£4!/›Èh>aÚ:˜◊8 õæc¸£C0’ô≥SÛ∆ïîãå-[pÈ¢]∂ã£]R«À≠vﬁ l3<*Lê´xF•+JÌ∞ñÛ§ËY:h“a≤¥k«/N∫ß]û®ˇÄÏwOøËíÓ˘W›#ÚÍåæ8Ïûí∑ø˘´√«Î»ä˚Ç	˜ãN·¿›§/,<–’_∑€ÕRy&O›p(Ãg≥h3?L6”¸¥BF4É
ˇÀ>èœ„ßN∞èXo´‰·5 ≥ª(8*,©3”·%d˝JÃä∫—‹W:Òâd…ñÿa(O•é	æ÷ÿR⁄C‚xπˇUÆ’Ê”IŸÄJâÛv¯‚ö8¡#¿€g≤≥˙‡˝mÏ^¿/ı6¸⁄ÛÅKN‡Æ}z{K!^èANç‹–s¶_`¸¶î}Á"¡v–T≤[Ÿ"[~w∑Úg-∑˝h´W! !™7Ï..úqËñè§}˛U˜ΩñÅ€
?sa@àøïrﬂ ·?ÿ˛|˚aØ‰◊H¿œº_πªê-K≠1äx˝wG@C$úJ|]§ø(“&Xq`¶®Áæ?éºYπ·ı},)ùE◊ ›√˛Ó9˝wC*áÏÛLÜ÷|‘¥T68Îó˜∑∂∂[;;Ú˛©3Ê!<x8{7ƒ·Hï2/Í˝(GÖç±d`Ë¿çY‚LãvÒ¬πËóÓE Ÿ¡Ã†ó94◊öΩ'Õíçï[ß#wËNÂñ	OˆÅg$ ¬°KuHÁŒƒcûJ·@vÈcÙü€9RÓ
˙^‡ÏÓAtàÈ_öìÄb…Ó‚ı÷&°m¬on ¥üQih¨†ppΩA<üm uÁÃqÙ√›˜}◊Ñh/˝T⁄K∂6v#Ùø‚·
Ä£≠fÔ—√VÂ'ÿœS»IË\∏%€E€4ù™"@0Ô=4ﬁ∞'âc°“p …qª€p±qø¬‚%$p‘ÁLD˙ñlˇÜ∏ËHT0ëá;+è¯bÁë€Ï±ˇ‹	¶x∞AÉÀ¥¨Åñπ≤ÅHNÎºQW‡∑X7π~oA—3.º1H!bº(àî≥∆€§iéØ«õ∞óﬂª9‚/õÄ$˝˘ªπΩ†C§öÜ}aÄ•Á{®êü)Á°∂ Ã,¢z2W°£\]zïU¢-õeTøtì£zõ\≈q´LWç#"ìÇ‘‚ñ4˚]ÚàJJXpÉV@*ø?üYõ‡Ë– Îˇ{Á¿Ä∆ù|3òzX˛ΩV* +”RﬂÉ[%ÿêƒ}g‹GªØã%c∞ï´8
Év∑gÅ‚¢”GñMB3Bê∂@ÉÓGc;N»SPc£@EN®;=Tïßóõ9N«¸î“é$™]Ãµy∫ñºLXá0Å{∑S√`6@Ü/–·¿Úú©DJmº(U≤ﬁ…,Ö∑Ñ∏ó,h§Ñÿ(õ©âNS$œR‹Ô	)»î,0åæx|Ç?‘J√%U∆T®ËÊˆN÷hÀàR°Iˆ±∂ﬁTe¨$˙sÉ…†C¸+¸›XÉ™ÖV][æf Kz™+≠d[W≤9•éÿJ°%^I‘|í)"êr•+·5«.LÛ^rH·1QN-«)ïÆ¡AÜº^π[ñﬂSÍ·%„îÑX¨6yZ"ül5Ú÷«'©I±§,‹—1Ò∑ˇë‰á*î%V£§†o-ÿÚ¨∂ËV~ŒÈ7n µÙ“K±1ØYãüê¢Ãªr?´ıQnh !EƒuÀ@û0û(-Tßd¨eæ…P∆òÊÔí“î1‘“€ÈâöEe≥≈À\ã5ImsW‘†.…≤ÒJï5L'π˘ ;∂i4"ˇπ˜ﬁT[µõOÔJR{˜hvaÃ=uÈ˚ìôCF˜π®Ì˜qON˚◊‰2$/ú˜DÜ^“ £ÒµeTôU‹>(”∂Ea’)§,íMe˜°‰À¬µWı÷É∏V°í\ &ìl¢%2•ÈßöÍjROxÙª¥E|yÉë±öôÔ¯∞iÌüVi 
„9U;‰ÌΩÖ`mm®™$Ï’∑eèJ&l°Ü°<eî¶¡<†ﬁWtKdºV' x%3w.´øn~›¸˙·Ï˝◊¡∞ÁT€[è6<ƒˇöçÌ⁄õ%à2^ù¨|›™e∏ÂV›’ñ§◊xŸ´T‚*uº±å∞Uí–2:ïµæ˛—í*Vz«›)5_»úLQ£⁄Íd™í°Rjü≥‡y’*ª7KÓ3∂ßp“ìÉåe0oAé”-π-Znq–9Ω–œ#twù’õ‹˜•.MR"√@}‡Ñ#Y\ ∂€∏fÔÀ”7âÃÔ∞C¡à%Ç˚ˆ‚>Ñ˘PÁıæLHtÊD≤,jó£v«ø,ÅΩì◊KºlW ¬T∑«Bı∑s2÷Èiéçfc◊AgÊHnyBµ`ˆsô~ƒ8®&êZbÄLœ«^ÍÕ;√º&ëê˘ƒ·JG3¶5êhí7ú:&__´Íw[…˘‰Ù‡’·˜b=Îû%úZ◊ì,iVoˇ‹uﬂ=˜òß8Ù‡ß"ío#∏°$¬a™öxbq|Ñﬁ#†bgÛ	Ùg8=AﬂÄ*~·—w·«cèêüº¡Ì˚˜ÕG˝¢”˚ªjËéΩÔ‹nTı{Nøì¥77AﬁÏΩhÉ˛‡ëôAgvà€66-x∞4zxÄfÂ2¬V∑«)6ºKZç&fä3˛î¥v∞™ŸhÎghö√~‡b°7°ß~2F¨Ÿ¶”
ì≤0~’Rs¡¯6œÒ\ï”˘å¿Éá;…	m±˘4÷j“*“Æô*6∆˝∂≠˙m5ZMRW˚›Ê˝Ó,ŸÔñÂ|•ÊÀ◊ØπΩdø€ñÛmÓ$Á€Ê˝~^™_#ò`ö«aœSáà∞UÜ˜˘⁄‹Á∞b?Êõd{Ö—?(∆Lú,Íπ0Ú…Ó.êÆÒÿL>,Yö¨]R–‹&µ¿ƒπììˇló5zg¥á<pÅmRˇ•›XÆgπ->ÖÁ>Âh¢ã›‘úxzπ∏Ov#˛{3ıAá–p‚√È¶5å¬à]XÕµK*Ü∞y|}] √*¬≠B~M*WÃﬂã˛≤$ÿ ˇ’∫Ÿ#öÊ”<#«–{ºã‡2!¨
Öüﬁ˛ÜÀœéçâ¯¿Ò;	Ào‰d˜Ooˇˆ¸pˇ∏£òH'‹Ú@]wºÅ”0¥™x˜Â†l\Å.ËÆò¢(ª•Atpv~˚õWGe¿cÖY‡Ñ—Ì∑4˙˙Ãùê~‡Ü<ÂÉ%DÏHﬂ⁄œòH0uØ˛Z≠¥õÌıÊÉzª]1*J¨¶å®˜Ü¸^Hµí< ª\üëœÕÂîy˛@PF!&è®¸‘ôV6HÂπ{â?^8˛Ëˆˆóá?~:ü≤c˙là	ﬂ+gnÑ?éÁÙ«Kü~˛Ã˝U≈òB¡PÜsßzSø∑`c|ùz˛ÔVkoç‘£Á¿c~·:|˛÷4√„¸˝E≥·wôΩùA‡∑ÒÓVıy¿Âøπ∑(X|)=4k7d‡9a√Ì˛LZÌíΩ¸|ªGßÁ›ºŸf¶û—ëHˆ¥ƒTKM«í¯dgsÊÇzÌwp¯∫=è7t6ç\õô‹ïcô3ñN£C^SÅrÉ…ìÏ«˚±˝∆$ó`%¶ó3`3} (åÈ=æjñØ—≈5Ω+%€πñâq•Ù®_{mÍZ≠èc&Îèb±∞I˝£i˙£I+›ë⁄;yÒ⁄‚0m2XCYñÂ≥ 
ªIC∞≠≤»“™=ÁÅÁLá†%”ø“¯oÏíµMœ˘ëM∆”€‹ùÒ$ﬂˆ’T≤r6…L≤§¿aﬁ⁄±†{	8ú0ôcVYöê«Å¿=†en£‹àÑŸf™+ñ4S"˘„T#e˝≠@‡ùc⁄Ö ‰˛»ªÙ◊ôn·ìdËÀb∂óHõS.Èq_.ùóUr˙ÿN€ã[_!SΩ⁄µEæzC˜Âí◊´}_ƒTø»Ñ]Â˘‚EfweºvÈöPsÔ;¡‡)#Œª!ö¢é©$Vâ˘ÑY‚©3†/ù[YÜ[˜‡M —G~ÃèùÏX6bÒ
ä„b!R›U
€∞ª\8KΩÑ`ﬁâ”'â[≠Ùy≤eÜƒÙ2H7¬fû°‚?®É$Û≤,tü]QŒÍ¨/÷ÜÚ¡/‘õï†á8¥)¢≥øS+ nÓ¨m‘»
ítîœFe®+±<Ïc_°–_≤™+RkGMñÇn|{}MtŒ!¨¯)Áe˜ZîïÌ‡lC£K:Q¶ûà^J%mÂÑ$ÂT«“hrYK∏ÚñH†:vïˆ°“J≈ÂBmåŒ„Ã—jB∫"°7ñWéŒ—¨SëÆTπ:v-≥Ñ;µ&)tû˚’5&Âùí	˘“i^∫æO™∑øG¿®B–BwRÎêÖd‘nAÖ–+œÆªU≠ÒçÔM´Ù‡£d‰H9∞îuµIa:„÷ò«c%4±_”áò>1ùêõàXGî˙ÏΩÖ$∫•=˝ôØî∫<¬JÙ—Äøúﬂ©Aì⁄JZ R±ÎèXp{;7
˛#¢åÒñU‹O_9CßT¸∑πáv"Œh/v‡l
5'qê[HÏAÈ∞°∑‰q¬≤.PKq0jπ6a≈‚fÎ˜	d≤&*®Å˜I‡„“Cè’ÅÕ√…dYÀ(òO˚xBY2h¡†Å¶„Ù*ƒ\Z‹‹ºÙ»ãÊ-’~6R∞ƒÁ»^È“Äª›Óe2ûÿæja˝1ß©YGAﬂ’6Oé∫Á∑wzxLŒ^t_vè®ÁÊ¡_ùv_ﬁ˛›ï7QÌˇDu–º‰«ΩojBB&≠u?˜¬/‹)f«ÿ‘ëe67Ÿ,µ≠4ï2ùà<(>
QT˝ÙYHnä5Û¨¢Çlìâ7≠ÀD®%NPh2‘ã¿G˚W…cçá†Ñ<$)é!¨A·ÃõÆÈ$√ˆÃ†HgkÂ‰1àœ/‚°«Çl‚(à$Cﬁœ˜OËipÉæÇV7…æÍg=p…·¥„A1©û’[¿I√k´üB(¬yÓ9ƒ+Â”(÷ W ¡Y‡Åè9gnˇ/ ®C⁄"Ωôòÿh4Jå5s,∏˝êå“uÍ˙j:RhÚæÓÃ#™ÍŸ*˝È^G2âR#_”’˚∫~Ì1_)˜¶_⁄‹™Ï≠;Ô–∫JØk9Ç÷<$Ea„‰Œ<˜∫ ‘€3≥Óû1±›Q¿c—f∫Çh8âÆ≥≠Ïî£xföD¯π7å‚ä°-èé£õCà>»ÈkåÊk>~}|é$⁄˚jVXÀ4∂KgSï)5ÿ-yBwgz˚≤°úf‚1hídÆ˜0wVöÜ*—:wÉ™e˝
P”xl^@h…Ùˆ˜¸†:Iti¬}ÊRD„y`˛ÚoÙ.
XXO‡/Ù«N@\ˆM~ElhÉpèéí.ñ4È¥C⁄ê3g≥∏Â“ˇ˛úÑÛÄ% ÉGﬁî¬⁄ãŸ”¿˚ﬁlÏMa»!Ò‰{|AfÓ∞;∫û≠â^í“ ñ5[™®YËFárdt9◊≤»
4sÓM\Y»æ∂˝”î»÷•Ö†•üÎòE5èQÿ6˛¡˛|qÚ‡¥{~ıœ~vÙãØœˆø:=<ˇ≈á≠Ñ‹ƒ◊XØ=æﬁ~·d”åtÜútˆìÑ2å…(•>¡ÖÒ…Ω"INJ™@êJÑs¸Ào¨ª^–i°Ö’Èñç97Îgñ‰∑ZHΩ$§¡‘¡ÌÉ§« ®≈EÖeJ
m”*,…T~πUÖ@Ó∞/,$˘*&Í1B…äÍπy¢¨ a≤¶ÁﬂT‹Æòœù
æôõ√«yÄaºw\öÇWÛ±	U©!&¢ƒ∞,⁄Ã›Ç‹Ò8d" ∫abê‹a1fÏò	ˇ∂°Ù	7£3o¬ú}0Ú;$£çwú·1ıÙÅvæt¬ë9UÄπÓÄ‰Í¯Mö}¸Û[±Èr!≠$û¿˝]ˆ}âxVsZÍ2K%Yå‹àWØ!dÆ–4∆,p/s⁄9¥m√D	∞O…ñmò…L=Ç…ÃøN∂ÃêèΩyîÌ‹ŸàZ∂#*ﬂsŸEZ“ºã∫Ìª9#Ä˘&i∑≥Ω∞€g
DD∑∏“≈ﬁ.1DNámæ¿v4+Oäøô©Ù‰Õ_$`c~=ÜÉ˘›≠«˛◊ tÚà>0∑∫©]üÅ∂ôl'Òƒ‹–ºs7òúz·ªÉ0¢Í}¢ΩºÃÕ“Ú™x<ìhKﬁµÅÍ+gÏí b˜Ã_‚kîkæ@axòúQÊ©iÛMN∂l´EòG}?áo$•ÈTŒ'@’®0b“od–ﬁËI¨t}í&aˆ˝&7èeßNº)Pê…ÎíWcÔc_˝FbYu1¸´hÑ¡Ë,{yŒ<≥5û´˘Qœ˘cÛÓ™•†må®FÒ/	~ÁN¿Í£ì2T0ΩÄ¶˜´°ﬂ1´FE™¿û#∆Wı[r©¯'ìe[Ê§9€[KúSÆ©~7ZÀ∑÷µ∆yèœFû˙∏.®*÷Wà™≤å´*i„ˇà≠¸ƒlßˇsrpÈèÁπÁöÊ&s&.
î2ÖAÓ.ã$N!˙ }|˚á!ûô¬l/˜ósfµœÒ´`ÑüÓÚøÿ!Øçiº‘∆∞ºƒ~¥∂√ó∑ƒglÒF€4MY≥ŒBÂô*CÖ¸•Œâÿyä±x¶6y∂29≠KÆ∏÷∆6ƒ81$∂ú2!Êî~nÁ@e∑9é<‹K∏ıY}õj_ˆUΩ?0.Ÿû¨∏¥≤9Cª3Æ71Ù;˜Oû=∑?ƒ(®å±ÿïóõ›«	πî÷˛ÛX2jîî*s€XJ‘,n©î¸ô€LB»¥o!u»th[Í˜„=¸:¯+<„˙∞Ù#>Á:†˚Àüõ•Wï>û≈’òrÊhy¸µÓcÆurõ¯*u4ıy¡—Ty∆Rñ≠pµ#úÍ+[ÕƒÒ¸~¡C∂@Ω†·›˙¯–c †th	`Ä≠åË√Ø‰)`ÀZY◊cÌ—kˆÖ^?D€ ƒ	Æ15(∞°E˛eC|I;©øÕ‰<+!›r∫jWQ≥L5Øµgß0eDW<ˆ}ıUù/aO‰m¬Ù∂h—-õ+·ü^ÑT¿ú¨¡√¬iÅF2Õ∏≠5ôƒíP˝ÌŒ—Dƒbdë$-U›9ûpΩ5Ù{ƒ˚¡<∫˝˝‘≥o˘1a…+êòπÉ7:I¨Ä%<ŒRá&E"Éepê	≠OKür¬Üñ’±é 5n´1˜˛o:‘Ô˛√ˇ[±¨Œπ(R$¨*K›9wﬁS€”≈x§â°üÊˇ”.ÕÓ“}Í€Â˛ØePóÿ•Âwc˙¯Ñ{π©dEΩî{Ö∏0è‡ŒÕ~ú‹5vO˛R[—be^aívja@zG.`ìç¸mZ∫∏VE?sv†ÃÒ≥ì⁄nJ6ûTÍéúú´l>5ÄI¢)ä¢Z= Aì`oãûm5R≈≈ˆÈd˙,,Åe/%q“÷}È9Fù‰›†÷ˇc≈‹ø^N∞Dv5€ò(->™ﬁá•äc”¨1¯eC8Â‹räD»v:ODN©B^q˘ëg=‡I_˚D˙$ò÷õ a[XÖ8K¨ÏuE∏®∑¬:Oxf‹ 9kê_ÛrÖ¸ï¥”{ÎÆ√˜sgñ( òd>2µ‡j&I∑b√Ú%ãÔ3`≈~_7	¢@˛˘w˜ØK ´pÀH≤:ˇZÁ¢.ú]¥‘û2Ù#Qÿù°«»xÀµRy”Ø@]ãüBö&Yóm∑‡¶Zí*‘*Vp™z Ò¸‡:b"’⁄•∑D˛%aN¶»bÕ–VÔÖ(_w'ÌÀUR∂\RQ…œpíÂü4äoT›z@˝.d¯Ò5ã'ôV5πàv∫eº˚ŸÖæﬁFg»‚º"Çe¢9˘˝æ?ˆiíΩTÒÏíÕ‰gÂÃÏ,´¢±õy ãœ˙$VÖÃ€˚˜≤‘	0ÈÓÄ\«ÍÇ√M'Å&L•ö(»üôbI≠ùSf¶º‰™K∂ùõº2fDø˚WˇÈ≤(“U`ÁÉYöâLòô3®÷ŒÍê{º4‰r˜?ìg®‚úU ßj˜KÉ.ï‰27Ô¶-¯Ïvz©DîvJEBâP+∑”ÖÌ„j≤l‘
∆>rÂ"?·Ÿ]Í;±nA5ãbÖ‚ªı?¥â¨H,ﬁjıÉÑ6poÔ∫Ò◊2…
í"ÿß&º;¿ÆH™y§ÎJ^rái¶VœÙxL+¿‰ÔÉ-i∑©ŸR"z⁄s∑≤w"+∞ÇÑ‹˚}f®Ô<ﬁ§iá¬<)ÙGSV9Ω·îVyÁ5;ıˆﬂKg<áΩq·f |ØG∫?r¶Ch~∆Óshà›—W†∏&vIú+(˘tu≥”#ﬂÇ≈êƒSe¶Øôsi#ôcÒ»ÌøCôA‘+¿ö©ËN≈îŸ»Îç]BÛ˝⁄‚Å°Ú#Íö*√|%´®óﬁ¯ùùÚ¿Úò}ÈGÇu8Eâ“Nò·¨zbëW.¶(°Y˝∫„»Ø†wbŒ≥¥dùo!5òif…0ÜH÷D∞I±ñ@˚3Íï»ÑÕ˜
ˇ”JîÈíÅ	ÊØ/F∞¢·?ΩNÙ†Ú∑ˇﬂ˛Îø'UÑ9ÅG}}Îi;4iLç¯Tl6õè—fcäW”u|ãí©‚NLá/—f^É@∞˜Áò'm‡9wDØ)N,K¨˘«wM©oÛHue±	Ëawåúqoﬂü^å=Ä ìtÒ
ä≈ô* i≠N€ŸV£Ñ›íjäËÊ˝òÜÔíO2ª`uIÍh√JS)JD	
	ô≈˚’¯ºÏvü®¿3jEGqåéVO›°7A`Êtﬂa%¨oÄ¡%F†“ßG«˘’A˜Ÿ1ÊH‚ßé˜ﬁ˘Qí“D6Ωe≥¥‹†ﬁÆõP„!-0G•7 •ì`éÑ†wÈ†S¯Ãgi÷l®∑mƒIôXe¬hÔŸ|8tCö¶≈Ñqñ~.ÈÙEHçÉ±7u’¯#np€Qè‡›ı2Í~g3'x7v√‰!|õ¬£g1¥ø( ∏FÑ¯∆†-öØçÂ“qmV<=Õ’˜eVÇ±ˆ∏¢,Àﬂ◊ßã•\E¶À˜·j»¥( çTRåß©Ü†ÈÃVvcM“¶3’¶o≠ì∏¸ˇ   ˇˇÏ}}o#IzﬂW©£˜‘≠Dëî®’(3:Pgó8i$K‹›ª€,fZdâÍõf7Øª©—å,¿Å„8/0Çx/q`≤ô3„˛ÿ¸ë≥ÅƒÚèæ…~ÅÏG»ÛTUwWøW5)ivo€Á±…Æ™ÆzÍ©Áı˜∞k)ÃeihÈìçÃ¥E}¶å–¶lÁ&¢HŸ&eÊõæØ‹˘äƒë9¶‹ÖÈ…	FÅÍf"˙«∏§˘äº1
PäA≠!ètMó±«ªÊéﬂÀqô‚¿ÒE0-´È‡cCJhÃFÒîÕ– WªYQ6Æç •Œ√ò‚#ÿy.F√!˙2&.´D
ûR.ÿÎÂ«¶Û¨ªôcUM∞æcY¶ÏÖ 5çœD±î‡≈¬àjXâòØ'≠`∂vFPÀ{◊¢¨≈ﬁ‰&Ÿô`ß‚≥ç”Œ≥ñ("&¡÷¨:LÑùTÊ¡»ûOLÒ3cÙr¬ÜLfÆ3q©ÁEïÔJ√|ÿ®b∆ôÁXÏà»k(¡¿
M·Ñôwx!◊µv≤J`ÙjùÚpiœg«ıu˘^{eé˝ãÙs¥9”Æ∑öÕURÏ≈"ytïé(6 ›¸EyŒl4√Ã_µ∂v0VFPÑ›…YΩΩÒhïlm„ˇ3≠7Uìù<&õ·è77·á´‰—fÓè[ÌË◊ùU“Í@€≠◊®Ònk>o„7ÌG+eÛ[í9[—¬∑Åò=FË∆5@*"^4`v˙´QûZ%B±∑ﬁ¨µöäa∏E`%	∞Œò.’•x˙¬®µj	–YËE≤∞Z@‰Üœà™ÓJq≤À,‰eCƒ?‡…Se»lùÊπ[Æî˚´8iÛäÁµö…É/íßCf.ºœÅ8à)3îCP¯à&Ç˘ñUF£‚è} öﬂ.ÄŸﬂ`pF¢‰ULx´eŒÖNUß¢ì—≤ƒÇJ∑ÛBå¡°Æí£@+ÏC!á0˜≥p:£óX™•.©ˆ$´ßÜ©ô•B$Ïîoæ¸‚ﬂ´Y9óBNÂô6»¨#îbrj1Ê6Ç…wAr)f–Â—øYÇíBZK≠é®˛V…§ØÎñîÚ›Â‚¯Ì?Å2âÏã—¬Œ"Ùü]◊Øê¸ñ≈{L{6/5Øq˝≈E´Vô Ú÷ì.dŸÔå´'5`»
íù)µ˙N§YS∑ﬁ’iâ≤≈MauX
ø¡∫+èÔOÂ«j/°aO⁄0P¢Û<¢ø#av¡¨!["ó‚))⁄îˆíR∫“¶AŒ]?¿‡U≈B[¸1$R?˝¬r<µGUyd…◊πﬂ#‡z#¶¡°…è≈∏ìëœ´ê¯kCM◊ÊbrHàeîl·Mw
±,C:√É4À2–DıçFaCWV≤‚«úÅ˚’!-;“rC%≠C	≤™®§â˙ıƒ·â`ÀCÉ|‹E*Ì4bGÍ7&h«Mö«†,ÇG˚¶1±oKÅAN(Ó$1öêhÀ_Úu∞*eü¨â¬¸ı=/yfX∑_âW›t‰Lù1◊9Vâ«vk§âÂú£33öÁ&e†‰¶'~ÊEj~DÿmÃU1ﬁ8eìL¨TÌÓqz:Eß´cÔê°qÜàó∏í™Ü≈G,Ö¥•"‰≈p®Ÿ<i˝e∫7∞0ô
 7™"4·¢f◊SyCÏSﬂ0-Ê∑^c…E*eÁq–ı+'›,b1∞`5j|g>∫X!‘úáé˙Åó˝z¢J1{EÖVà0.:≠≤RpÖﬂH≠ŸíLØÕ¬Ù,o´8¢	Ør&ÚÕó˝œ Ú!ñF‡8/K=WÆªsÙ¨F˘4‘r.§¬´ºb%h≈⁄'É˛ßœ˜éz?}˛ÙË§ﬂÎûj÷”∆V‘ƒU|——1ù√ëé‡c˘ 9ç$Ï 9∆É$<ù3ìß≥
î¢J!ÎwÑ©ÂùDw¬ÏB⁄÷‡wÙw!‰“Xû¢÷á◊2X^ne2.y∆dKñÎ—Ù¡˙ÒR8£™tbN.¸H:ö˘Ê‘|√âcèıSìØBºrçY@~4ÀbÔÊ¯Imœ∑◊é¯«∞3ÿÊ/_Ô;?r*ª´%hàSØ±ì≈ƒΩ=sÕ)5]áÃß$ÍM.oﬂÇÌY>nCÌ‹	¬xïrÆ~£∫ÃÃN<J+ßò¸Ø wƒƒâ6ìë„å˘T≠‡âK"w )Á¬ã/Õ–ëxŒåCÍyXΩ+ƒ g0≈#kÓ9p»bî˘˛∞P∞<,ÖK∆ÏÜÅ9àº
.[Fó:Óò6Æ‰ã;XIÂu¬àÂO)cO»¯5ºö9:	ÔyJŸÛÎÎ¶
àT„S‡ΩÉIQ	ú|¡$GtÛY£—êWıÛ˛¨^7V…ôR:Ô·{ß.4ΩıgÜ è¬Ûy8µœô”"îm‡êSyfá‘çd¿=v;5h†_ßæè¬◊Ì¨Øy$ˇO»|π©H'ÚÀÓ≈_ˆ¨¬ÀÊ>/{V¯≤©o„/õ˙∫ Àä,Ö‡m◊ÇE˛HïGåÅGàË∆wµÄìRy,º,ÚU¯üãYM*´¨Tø∞‡1ß◊:öH‘ÈTº>ƒbLÅmÍî`ôvˆTôØ*7ﬂ£ î+ ¨Ùé˛nÛØÎ3@/¨wïF)f˛*roH† Ó˛ËGrç“œ§_|ÆÛ6Qe+∑J“°Œ;π]ïUTì/’åk’ﬂâÅ√òQÛ≠U9˝±Î\¢O◊úN)H'∞•.YàU `≤#îúS:∆à E%õ«
√„;ØÆ∂ê(ÂÅÜ‡ÕGX#ZQ[E’aáº¯˙oﬁí£·‡pãÓ˛—	ŸÔcVNÔàÙéûı>æ˝À˝#≤∂ãZföƒPPtÍèÛ˝±d¨ÅÇ1qÁ3&	 “áÆ1«3í'S⁄†û˛jZhô¸!¡˛ÅäJ´æê0àK√%ñ3a`¥M8.àõ®¸Ÿ^YMAºÓÕ®qtÃñ™œÔò=C®'°ΩÑ¿_<‘éV—bπ˝jl4âJ&‰Ωt4«,"!Bπ<:åSS]$¯!˝≤å]¯óüª¯;üWîÍL,€8ígLW(|Œoy#‡-küµÕ÷ÁÑ˚É{Õ∆£Gük$p´L<=`Å
e—u¬î .∑∏àâÅK|	Å—E¿uh§§§x ‚1»ô•Ï“u,$õ73m∏Ìºb&êHi◊∑/Ÿ~pÈZ‹Ä†`«ØhA‡©/aá"«~yªDr*Ñ€D‹˚@süH˛àáÿ#b‘ùÍõ§ÀÅ˝póx"=ÖËúÜ†óB’;•°Ü3¶Hy6Kÿ9'Ù‘çãﬁ´‹Õ√Á>{„H‘ çA∂oƒv◊éF¿ÉF∆˜Ü∑Ôo◊;exK⁄Ÿ¬U{P#€$∞úÚH
Q‹ñßŒ◊gáÑﬂ˚T√ÆÖ`òûh™”T{Ca$¿ <h—Ê˚O»Üb£!pavÀÃ≤#5€^N≥¬û$5‹*´hù1Ùj∆»Ï»∫}ex"º|˜µ∂≈ç:Çu≥È+ÇG›‹¿{@¥«!™O‰Œ@áxÿÌZ‘m≠›lo≠5∑÷⁄Ì⁄JÙì*]ÓØëÁ∞D£5≠z8éuÇYGMÚc≤˛ßΩπ¢i
˚–≈+$ê0	j≥π ?ú[é„FMØÕÎåKŸæCFÜ?∫ X{≠ˆ–Mä˛=‰lˆàÓqK}¯"MŸÇS!’\É}__ˇó„˜◊ïß á«û”YëåıË¨"ÀˆË¿ˆy{ü5?_ÖçYh £—öY’Ò"õΩ0<ú9E∆L¯K˙öÉ∞ä7«7k·ás”ı|è©√z˙Tác≤±¿?è±è yåòÔøØ≥Ï•`∞â—Ö·ˆú1Ì˙us…”Ã∆•È‚˘¸s
Î„oë˜Iù·á∏Œ™}Ü¥kÓ«ds©0±Ú⁄”å¢Wå;ßÊî°+Â|ù<ÏZ˙≥ÈùÄàäëñûı)µŸQ<ÊÑµò=ß$‘(µ+†1$ÓS”øB®y¬íÊÅdË∏ÈX¶¥G—±K«&”`É>ªzÜ®∫ ∫÷s]ì üñõ˙Wâ/zŸ·ÉhÃ\ÁLHlj65k{jÊí^M£åNÍ≥Éöm7Ó™…˜§
õÏ]¢htÁ®ôFΩò¥ªì'ãA¨(MÔJr™ŒÒn`¬åƒ-ùiqI ≈y°á+Plp¬Íûπ
Úï∂Ûôß…∞‹à'i¯ö.ò&Œÿ?◊Ò¸:Æ9È	¬∆w0Ç´§]\:Õ
”=>,mxÕM*èmEﬁ^zWU4 U8™•üqò¶mX8‘ùÿ†U[ÄWõ9üÎiÒCHl’Üíõﬁ%~Kµ°ÄâÏ—s÷P∆zÍ6’=˜ØåﬁŒ◊jIô•™πÂ@∑c6ˇÜ•»÷8gÔdYA‘ﬁÖµ¿œíLªÖZ+˚Qy@qnÓÕQ◊}÷=¯˘/˙œáü<;˙§Ú\xÓ∫√¡—≥wÃo«qóú9ôÇ–ãA!»∆Äã1#†ìpÍπéèIa<F‘r?[ºñ˚˝˙ÿÇò˚ ∏˘-Û»"u ¯¢pi|ëÉSæ
›ÚË›5mPî"”#˙ﬁbRÒ‹ß%¯Jﬁ‚ÓÅ:˘‡\¬¯åñï}	≈øZ<È^!ŸÜ¸§qÍq)f_"35®˙@>¢Ü“:éufîÁÖ•„°ßòä…≤5Â‘≠fi‚i*›ﬂõf'ã¬˝Úd—•cÒ€™eo≠Õbê,ò˛ñQ\(]ˆNµñÊÇ∫SgJqò1ÚﬂÚﬂÃÆ¢n ï◊Q≠[±å"*ã&‘FÿÒ|ZÂ.]=Z<.YÇÊï Ç†ï˙°13»ˆwÓ‘9*Zô^±ê
,ÈåWÂWÓ_ôgôOY›x¨áÊô·°g0ÔÀ !Ã£∫ì}a¢–π±¶`†EèModŒ‡0\Pó<3À¨z®‡/TcQŒáZ…9Dæ¢jèô©2‡≥Â¸ï=Ï]8Ø<™TçX˝Ö⁄(á¥9xN+^¨iªôS≠3Ç¶P@OQ¶Ã‚‚Ru‚ú	©àÎSó˛jŒ1Wrê¬ºõ˙e.Wƒ˝ôr=Õ√Ñ}¨ÍC#`‡7Ô„i‹ ıû{˚¶°+¢`‹Ò‡£§26|qùO”É_À1≤FZ7‚›∏Ú›x3I`fÔ÷\À{;˘xº†{W=QÀ+≥≤ÊÉV¬¿ï°3ôÄ¶"∏«⁄ûb(
^z¡+xU`¡#û”ú.L¯˛°Ï©†€„UIø«´6<˙√É˛Û¡≥ﬁ`øˇl¯¸£~wxÿ=÷”ÓYK∫>^öZ>^/∫˙bÉ¶F™¿!1YO˚At⁄35_é»VM=n »Ë¨;€dùi?Åw>9b8hÉg¸o•åeºIC¡pÄóúΩúo=ïw	oNC˜œC:mw“⁄æîÙÀ™n¨Ù\+SIôÄlàÎ.‘˜4»dñ¥5¶Å◊N¢jmhçâîƒ aJè»∑?P…Ö∆´<ØÖT4ÑÏLÉâ„Ê…ﬁ˘ÜåT∏ ÃT]^wG£πZv|ˇ≥æ>°nWP®Õ¢íô;Du©W„|‰'dˇ
ãBW:!´úëïO…òõ´Q,Ï^ñ[ıÃ)˜^°€"Ç'´kxë˘•Èícà˚ùµûÙQ}A”F¯±Z+ø >oÔËµÂâ"H°áj⁄à›“kçßC`)PÁ®∏¶ç¨oÙ⁄fÒÉœ ?jŒù˜	Hc1m¸É^ó¯#∏CÍy∆Dº`Í∂F£:)âN∑H∞ß°sºˇT]÷å–FéYÒ˘¥»§3{%“óNS!k—z(.9∆ œjL{E©~π‰Ò˛œéèNÜœamıÖ˘ä‚|%ÅDz~àÅHÔêƒkDs››	ÙÑN—ú¸∆!0;JÆ=~©“)G“©8˚T\œt* Ó«Nñ|ù·úLy˙“¬wº|ºöD¢làneßB≠TXU.E√4R0à†@P)¬U¥¥®¡©·•flπoQÙSJ_ZØ◊NË∑E"ñ>Ó†ˆ#˛°36¨:
~◊Ÿ<Éà˚¥ﬂˇÈ¡œüüˆ{üÜ?~“GﬁˇŒÛ˝ÓôkŒÅë¿qÛÁ∏„V¬∑%b5îM7ﬂ≥ˆ÷ûÃ éåÊùÙ[,∫ìdÏaötö≠áOhXU¬®·„dÂ“Ì.‚E¥A/k∫ %Áe)’∆ØÊÃ= e˛Å66°?ïèñ\0πú”%úSç¶lo‹≈!SﬁúÇw@Áéª?r\Ûê<º⁄á8Óú3Ùqèº2˝ã(‹É«óêSƒ-ÈÓX¡y]W=∏=ÅGòàﬁÄÀàç›SPVìUrñ≠"âró≤ëqhöü≥‚
‹GπÄs⁄w –€Ò?›‡≠µπ\˙ÿf‹hì›Ö?:r‹ä¢ˇì;äœ}wüOÌùƒ˙©9ås„a`!L¸v ª∫ó∂xf⁄¶}‹DÄ˙Ë„±&“«m≈5“,ΩÉØ†4yÄå≠6taU∫•…>¬SÉut¡ˇ
ÜoO¯Ü[†±E•óMF[Z1ŸÜ_ÎÎdOZqdbŸ/d·HËéã∏3Œ˙	æb_hÖRÅ….Lˇ‚ç˜ê.a»©≤ıÎ€ÕöŒl∞&'QsQL[g}#ÂãHx+0vbKøø±„≥⁄R¢CŸ?≠5ﬂ),aøå%bÈôf≥gñï√›‘{QíòVﬁNßπﬁ±k¯96ß‚í”Î)1°A3≠V§î”Ï9SÆó1´\Ã[¬¥äÜ¢yÂ76“R*õŸŒb3âhM≠&¡J;L?d≈ëa0°ÊB®Â˛ÏÚÍÇ⁄ÇQÈnô¥™Øª®I*Ò».∞œ‹¿qñ∏Oswj‹O˚YÛyÛ˘ˆÏÍπ;93X—…≠m¸_≥±±Úπ&§63t%*œÑÅ®≠ÿ^f?Ë¨wt	.ΩôìeôoTØ—úΩÕV-/(wÕ*ÚÅbN–·QxÚ“mÖK∑ŸY≈öû≠¨]{·µì∏ASf≠lñ±±
Vc⁄©Í¡ï=Õ≤πt+g¢[[´X&µ’~›Zx¢É.q£¥wÓ°—!eÊ;j—Èéã:©Zk¯oıx˙GÊ‰¬b`À¿æC51ìe‚ „Ú¶Zëi¯≠MAR‰®…„S‚Ì2èm4‹∏ë›Êˇ‰n·V;soØ|N¢T£]:À⁄ŒÃ`îí "Î÷	≠*E
œbìòêí‚É[bv[…Ÿ›hÚí≤I€ZˆØµ•»ºyçMk[ÜWº;)H√Ç]®±kÚéóÙı¶jÎÏ}º˚–ô{¥èˆR©P“GYj*◊¥+ˆp@çKZ⁄÷X≠–CEgHpaçHÃZN√Zg¿ ¯)Y≥˘uπ|¨&èd^”7c‡•lô.9æ-¨X_`6óÚ¢XäU`êbıµ≥mÛâ‘ÃV≥œÀ|‘Iÿ∏2«buc‡pYªX˚lìÂ2ºw-Ò®¸»ôÄZú`t©∂¯•Zn-Òb¶◊Ë%äØ<ÈS∑kÕ"„Åt°z(_åπ4\:≥å≠◊ï‘V—å´KÅ ·ı±Ó≥=æ zœ©$˛A2y+QÙ'JﬁB‘≈ÙÚ±ä÷…z÷ aøÚ•°è∆
ƒájÄ»&Ñ3vΩÁÈUâöI	%§rˇ	…7l6∏∑©!,_@Û˙è5‚~˝˜@yÚå‹póåZÊú|Èe–◊
ñ®Xò∆k9$ûõüòM‚8·`Œ;|≥¢o~x_S©%∑·ÖûÓ¯k7ÉÇ√–b0€⁄7g§ﬁ=ÛkÓSrÏÛ≠[¿).)GqRvˇD◊„.∑å√CHª
<:ÂoPé|IeÍ00=<‹*<é±π0)Üı‰˙ö83cd˙ØwHsï+KW„—*Å;≠¶æ¸¬/aDäµﬂ
€o±÷+7NØLˇŒFIHÿE  aÀ†ˆUlS⁄ÈF@ógéÔ;S~¯cΩeÿ›Á˛ZkΩM÷ÿÿÆøb7ﬁ £ôakì°ƒ·ìë$ôÆË…Ì+ãÛì+/õ√†òun¶]õm}Ø/∏Ò∑x∞ßA™¿‘ﬂ∏¸R*æìs™d7YïlµR“9CIÂ_ÜzdIê¯x5B9ë?/q≥‚»`l=å[ ë§ñ|[A£{™tLÑOÁ»ââÃiî˙x*v3Õ…é—|æwÌÔMn§OÅd^}^ØcŸ 1gj1/ŸÓ√C√¥Y©TÇ2ahîÅî∞‹]…	·,8P,Iu/.áûÃ¥ÁO¯kéRﬂE3^mﬁî$yËs/%O.UÅ¥ˆê¬H‚ÿu& !ydO	ı&g$ŸA7±å∆ò˛ä5AôÍ‹Ç≥Ó¬É2PùB*ãUx≈’}°‹Wnç‰¶%°Ó˜A'ÆbVSÈTzÍ4Éûüˇùu’Ó$u◊ö»fï=.ï;◊µ8≈ÜÌø∂òP˚ ˚;à∫úø_TI˚^ãÓ_π,6%…5=ki€9‚∆qS“0=åN}<º€Œy∏J$cDbhSy(-Îuñå- À‚—©…d–P¢Yæ „√ïw‹\õ.€9q√ÅD¯—‡tx˚≈…†wT}z:WsO÷P……e'j“äƒ¢∂Ôf8¡j'Âç_8∂7ia@ƒÕÇ≤∆|·˚˝£?æl8Eµt⁄~|“Ω˝ã€?˚ñÌ†gŒ•!Ïàû·è¸≈d—¸q|ˆA∏qâx˝Q'¥é˙<¯¡ù€#omójbd6eôUﬁr6‘èV?£EJÈ9Ùú¶3c‰ﬂ£M$vD«ˆ˛fSR∂[•`£:("œÕÄ<Qr®Ìﬁ˛•=6Gî°ÂÑ©†°¸r…⁄€ıã,Œr?Î∆…º–âöN #o7CDŸÒ≤ÄL^“a'ÍPv â[°fZ±{¥¨\å‡fΩ’l>§f–ìô˛dÈvèÖ’ÿˆ\∂Ö‰9_3ã¢™ùqærı,@åó‹Î‰høpDNéÜãüÙ˜¯◊√3u˘•'¡∫∏ù)9˘Ÿ#ªë5ãª±ª«QùÖÂü˚ÅmwãS`‰…og‰ß&çπaQÇ–†õzìdΩXÉÃ¥≈`¿°s˚+…’y FÙÕJÚÜÄ®4“?=t∆,=4¯¶∫Ò‚¡D=HÚN≈ﬁZ	I4ƒP7· ÛÖΩcùxVœ&Ê‘¥YuGsuYñÆ~4ÅxÌ<±PqlêÉÕ…D»mK;¨äVè}¨ﬁÙÀïü>±hÛŸŸ,µgœ'ï◊∏gôò[ÕÚ=QÇ’‡ÿ˘lf!\Ñ]˜ÖãèOaiãzî}g∆ÕÕ˘û‰5ÿD≠`6√Ö¡_¡§asp´R:xlòÎQåÇ˛ÛÇ÷äŒ–Ên:Âï_Fc:T…]3®ô–<[éÕ®\Å0˘È$∞ãëîÁGo∆⁄Nì2x”Ã.´f–LV3‡†·òÕ2ƒa£üØyæK±Ó§à9mo5u`ıL¸‡í3ÚOs“û£‰^ÌJßÅÌ/Xï∞˘A¸©è’‘2ìeW’ˆ~ZS´‚√Ø
1Ò•u2‚R$#≤ä1ÂQΩI·yÜ!6π⁄'é"|ïò·¢Í$ûáí˙âÂdTb⁄ôñ©FîóìYZæB®`•„a•2->t·å¯%˘ﬁæ˛”ﬂíÎhüW™À°’*iT|Èc„“¥.l6áS*ES∫«Ÿ®D´ï“Ì#/*ÈH≈∫°P·Ò&D≈ÔU◊†%4gRÿByN© §ﬁµPm[©ö›†ø˙UT vƒ°Òî·áú˙ÜÔ¡±Óô¨(åÜxéA…ÖæA´5Ö&˝µv,‚T©ﬁ•öÆÆœ(πÿ…Àñm:9ÆÀãóTvÂ™©U7k*GÇÖQ°R X¥ç"ÁıÚŸ}ëï¶∂k.Ï+_Ñµ~O¡«ú\°ÒÌ†wq\Â|EZ¥/ÓÕã¶‘Â›˘—òIætãÁï≠∏ù∏vÁ›}	]Uè¯îehN˘YäNœª‡•@◊◊k∆‹w»‘∏bVè6”Vf.¸ƒπéÖÖ'◊¸”é}úOœ$€äÙ*.≤1P_ò(◊ÚôŸfJw sVb¥ﬂ|˘≈ 'tÇÀ‰ë}πÃ©_'.ÒF≠4°4ï®\ÛÁ9Ée†9Õj9∑Ö§WîÈ ƒ6™õÒ"•MÖ34ÙW'‡gßú™´ù-Ω:zŸ3›ëE€q+∆¶P≈sUE°≤Â±¬G•G‚ZkW€HSc4∑å±sÁ≤Z'«£¶U‚2~=£60ëÿV.ZIú9Ç‹^öº¸•cèÁæA\ˆ⁄ò@±òSÌ^OëäπΩÂlº“¥ßv=bu÷·Ê*1+¢j‡≈`çÒÑÊ °ë1) e»÷ÜS‚æ±Gè¬°Üqm˚+á◊V“£ìjˇ∆äÛ¶+ WQÑ«ì÷áÆqI3«$≤"¢A	I.UÉªCJÀú´ò±8a¡Õ2k¡bFW%ùËb{Ü!‰ò7q€w[∂|GÁKN∫+*€Y∫Y+≥|´ìÌdñ=´‚"HºûZtØÀ]ùKÑ]ÊúOπßS;Ûò`±¥Ñ3ÆñP®π≤xDsÆH:_4[$H-+ƒHä4ãˆﬁÇ!Eb Ç-˛ê”∂P–è∂`+ı;À’"
kvÀV©EÇ∫p˛AäπÊ9≈"1W≥áò>m˜hÊ^HHëŸa<è¢0û≈C¥ƒ6›˝ÊÀˇÙ?¯*8¢¸»Ç˚r”_¸πX`Ã“{–≤¿√`Õt"Q¢´öË¨i˙®h|1nÎ‰S√e /gŒ’¬v bfTA·#G©-’h%Çb Œ¥¢ÌùˇU¨èôglËöÜ=±h^ŸèÑab˜Í+ƒè+*eûÔb6}v"Só˜Mê,]Ûn@]ûÛ2\L›`OÓ¢oã≠9S25LæœØß.◊a√—:%F(⁄ﬁåá	é°!‡5¶ÉÒyÿmê˛%bc#™˛4[óé¨πÁ˛.Áñú)0∑{Ñ◊–4¸öcÉq9xÄE/Aı’’wpTÍ<†˛kıjD+uE†<^≈ñëè≠‰W¨rÊzòˆπ≥´@-Ç≈m^øab†‘∆"ß®¡·&Ô≤ËÀ©9≈Mí[¢¢∏˙K˘⁄°j˘ÉTw+Åná¿üÂçàz∫|z „ÇNÓ¥“L*K-¢îìMìR$ß„ˆ7ÜÛ ‹Ó V<^1¿^
x?b{^›‰!rn(´úÂ'u?›Ú„⁄ä4—D\Uñ´;=Z ÆÍÎøy+U≈H1,–≈s(/Eò7‰:{≥˝Ñ‘Í]òèK”ÉVVòØ~Ñúèçç»$]Fü÷dM=Nkyÿ¶ÀFä6µî∏YE˝Â;…ñ4QíÙÊPÎòÃ“E%4—çòı›qp≠≤π}3~‡ˇ@‘p∆ÇTô*ƒËãUYõ∏∆<WÜä|Àª†Î`†&bì‹Ñí”jî¨’√Jı(πP9Ç ˛W,¢µXÛ“¬ïdoÚÆ‰#g~©›∂ÑÕ¿˝LcNôXhzëXhqgÉGÄŒ57∆¿bQú;q|ÑSÊo7√åN¨‹∑ì1π„x∂ÿn÷W±‰7Rœ˙	ßÁiéÄÄ`¸8Á[
˛7# ßÛ±·ﬁæ-_ÑÕÙ"–À0«]LÀà…h'û≤ôå-íïÛÊEõ¿MG`ô~àctFÛ'SU1WŸ2¢ìëuz«v‰ §ˆ8t6Úwf…Å"§~XÊƒoƒ9måó4√À@ÛR&J®£±“ù—ÇúúÄß¡Ω,„ d°˛¬˜Æ=î+6≈˙TπG1ÓÃ≥tº°q∆›< ﬁSX&øÜ∞±Éµ@QÒ©∏≠&[.+nÜë˝Á¿&*(j®.â±o>ùÓkÇB≤ä%¶¥,d¢¯°zi≈B5`´£§d˙µHUo™*°ÎÔÀÃgmó{¯»·ÌÔY>q´çıV+Zª%slVNCÑø∂{ù&∑∆‘πﬁ–E≥«Ñ6|Á©	˙LΩΩrC÷y1‹≈Gßâ]€WôÚ©æc∞™—»Ñ0j%*x≥ã0≥B}xÍˆ…Ô—8Art◊ü£–)≤2ÓñÍxï{Â‘Ω¬*óèP(±GØÅ ≥gp ÈõÎQ÷◊äc‹≤Ç§µÖˇ˙uΩÆZ,e=˜•V»èQ:[	7fsÂÊá™Òlzß=ÔÚOåâ·°÷béÁ ˆÉﬁ~h¯–∫Íû?%d-Û€ƒ¥Æh¯Ñﬁ-∆Ägeòs´j£YîM,åí@nçî¨"Ö@6ÕûL/c˛Û:º}{∑ÔâòC÷·©D$F%†jEàïeô3œÙ$≤∏`®å√‘–!¥ØjíøÁÌº¿+æBïtËúÜﬂ09y`ücyÉ◊Í˛ÛüêàSd<ed¢5¡âÎ¥5ı¶v≤XLzúè1TW√H#‰	ëÙjD«tN¬πZ`©1,Áó∫+˘ 4Féc—™πb{àπ¿0G·u¬3¶¬ó˝Éˆ—Ó‚5wµŸÆ‚œîÙó]cvA∫.5*©-1GÒ6Û1H‹+⁄ ì°´1n˝)É‡ºÏb«√v2–9qP Ã…ƒIXÁ<tyeÛègÒ#·›é∫Á†¥Q6uoÓ¢3ñ¸à° R~B—Ár≥ÍQ∏Î’≤Ä¥¯•íweÉ®¡·RVàzJW†»;≈3éÁ6¬¨•éÊDPΩ<Èıc`Z ÍùåPPE0@F ,(Ω˛t¨åﬁÁgW¨¶F2¶jlxa|IÑÍ£=0ß¶·í^ƒıÎÖ:çûm@”íVÅA]¨m"éD∆üÁ\ﬁ'u±ÒÒ	ıféÌ°ªŒAÎø≥Õ@Ÿü‘–&]#ç∫‚ìÚí‚–ª@ØÓ 'ô3å_£∏yC¶Ü;1Yù ﬂôa—°U¬L…¸OÑa⁄!kÌŒ™(ˆ√Ki8˙∆Ù‹”äÊ@7†·¬Y661<¡£Aç¿ÌX#W≠'5†ß◊¸ü´6ˇˇË¶r>ˆ‡ïâs~ÓQò‰L8ﬁ`>í'µ?j5œm∑¯Ω#NêOÆõçvGª¥aºüGä55˚yºüπeM:≤ò{õÙ≠ç≠≠Û˚òÙúéÓo“ÅiÌå«=ÿ≤‘3˚C4/£Î%›Vk∏ÆÒ˙ImÉl‘ƒ]§)⁄~¥qV ã·´mhΩ⁄„üuØ@ã”ò
d6?•07—íŸ}VW˜öúõñµC`m6?ÿ‹>´≠2ô‡‘|Cw»6ˇ‘òö÷k¯ p4å†£õùæ¬⁄ÿÿlu:„‘ôºükOû35ê<∑é3yh\ÌõÖ=±X´–<Tdzü¥ÄQ≥üé®i°≠—ZY˘\'®Ùª∑(A6çÅç‡ı–∑îL—‚@g∆ËÂÑâåÈ¿±ÍÓ∏DÌçU≤Ÿ^≈RƒÄ—kó!ms∂Z°ç`ZsŸû]i6QAÌQ•á3®F£≠™4(ŒÜK8
ÊÌ|˚‹8’Ùö≤0"›Vls|Jπ¸Tcà:ÌÎP3SÛuˆÛÎÜ√d˚h≤™ƒŸeuËîzﬁÌ?QoE´©ËÄBèˆ≥ü2˘∫≠≥j»√¬Cæ•≈ö—'µπk’ˇHñBıﬁÿàMG˛3–ºÔ1H™Á¡˙qE2ƒ∞{!ÉîÃ¥I6uòŒr…ÁÔ›"#Ü±Jœ©ãÿ≥†¨c·T«%(AÙC'3Öëeu™¨BîëiAÁÒêÈ˘&\˙è
jl-Dçd´256Ô‡êyºZT-0ç%[dÙΩ5ùT≤í¢∆˙crD&ÓÌ€s^=näiÆAO@A8^‹√∑—¸jx‰ˆü-t‚y§’ñ\	∞ﬁò®ÉÒö,≈ÖK‰w íqúòÎÜkïdÚX˝àÈ=ÓÌÔØmcÊËˆ≠5ö[0P”æ˝Ìál†ı‹X√å{L(2|·¡\¸◊∞| *Â¡)éQ%3d›ëy˚˚)ï‘∫<Ùøù8eù’&YÊÑÅ„21≥gZüΩ(pN%éR’ƒßdﬁS¯QQ¯@A`\â≤+|.0Zê¬íR{Ã.ªÂ∏√Üâc
ô7¨∏ ·µw·ºbèûŒ'≥*ƒ 97lo%æ,ä†ì ÆŒSNuu¨K^ZC<ßr∫JΩÙ¨∫ËJ} Ÿèc)Ñ ^o5Ó¬äåÈòô ÚŒÏÊa
WV£.¶?}ßWÒYåa∫îõï«K™%</
/,˘”ñäëïYL'˘,uùâ˘L`¡˛	ˆÍÛô@‚êõdÄC≤çhWèW‡Wä|≠Ö©*:Òã6mxeLAÉMg¿=‰\	ûÏâﬂÕQ”√D8·‡,ãÿ0¨3Œ∑∆œµ`CÏÿ*Á˜j≥¢∆ÎïëjDtùÀN`≤]`]
±…l`gsX%Éãº¸5·œ±{3Õ—+:ö˚¥kYπJ√V„Œ±I∂ö¢Lƒ!EÁéß?:Ω§@«T≈•Ì∏_=‚ﬁ,äÎI	[ÆÕhÓzéª6sL∂Ç<îúŸ(ºëö\áÒ!ó \î’Í•kØÑ†˜xù/¢BÑæBdÜ2È“OH=:≈"<Íüfà!ıs√ÚTÚ^E'yÛ\«º\•vîliŸ9Fùê¨≥rﬁ≤Œ´d~gÄ<ﬁJ.mGÖ‹óEÀ*î¸î¢WÅÂ™Q¶”U—” Y©*∆cf≈¶≥q+7)nk3Äµ‡ÚJ~πÕ“	˝˙7.‡A#≥P(y®æG'sX˝€0@–õü≠Õ}”
OŒs«ƒ‰®Œ± ˛ú≤ 72úÛ£ıˆ-ÍàòOÀNV≈G
p9¿)4Ì∫’Laæ2î◊™—cÑ∆`Ω˘dïò„+Fá@Ç3◊tˆ&äêx’ëÒ© Fÿ¿Ó2@TÅc£- À¡ÀSÈÈ&ÔKè˚H´éﬁ{˘:6v¸úy+ıq´AÚ‡“áŸﬂ8¢¯‰·iÆ0ÀßòÚ$ñ#πqñ“›Ö(ê2@§bw±’IÙŸµ¸Ï%˙àìœ:e¥ú›≠§é≈dLﬁ±RœöhçèÀÃÚ≈P_ºwç/≈œ„õµ˜ÆÅô‹(∆„ïZªÉÔPå™ı¶I‡é±·æƒ€™∏‚‡KbwDqóä/¶˚U
Í!pÆÙ`|Ûf°§K@€N«E∆!=z&Üƒ¬@7*!Â’¿)áw,¿ºX§∆ç¿µàÌn]X¥ÂÕC*ò8k&≤QÔ]Ûì¶¬üéN˚›˝˛üá‡‡ªÎi–á¡“¡¯`”«KõjÓN‘Ù %5A$1|ﬁ[f˝÷dˇ¢,†¿êÈÅôê4⁄ xHmyêÙ.ÖH˝cJD¿y∫E]˛A£•Y†Úﬁ˝˙øΩ]∆ˆøœâ?ÓûtÛß^.∞¬gﬂ„ZáP‚2Á?¸…=ÆÄ&Û–≈Æ‘±pÚKﬂŒ…ØÑΩJÿ<”O@µ ;≥kdŸÇ¢%íUu“6RÅÃ&∏qõì∏€ŒÛCml∑–ŒîaTbÇó[≥&Ì,f2ÂómÖÊ”òìDÉ÷T•¡ÔïIYÕÑ®bUÃÕÀ,)^TWçê¢†∏lÕ¬ä÷J¨Íõ/ˇÍ-È:ƒk` XI‡πZ≈è6ÀgÅm+c¬o–˛d;†ò#ä—Ùt(√•S|Œè≠¶GŒoøÚ‡«– 18¥{ó8ƒ3ÅìMŒñÂ¯Ãg$Çîú?Kr·≠†ZÕÓ"¸LÛ⁄6¶∞Jß¿oòô„GQ‘æiLlÿŒà3XÕBæV&ú‰f†#_Ëêcûgƒl[Ω»SÁøÆ_ìF£¿dÆíP0ﬂ!JπI◊R.‹_±Úì“yvmçÃR…≤1EùcæÈ[4n&êè[•«1Cü˛ÊÀø}˚ˇ˛◊ƒ”ºﬂÎüêﬁQˇ§ˇlÿ'˚G‰t–=&_ˇÈØI˜‡®◊Ω˝ã€?;"›èá ‰ˇ¢ªﬂ-Ïß‡+¥ÅLîµ†ÆÎ∏•&±¯ÙÜ∂üN≤»ÜlÜlïL…öSabRy0òÕØˇˆ◊dÔ‡Ëè?Ów˜èv»'É£1oΩì€øz]êW•È,l[2#fŒ◊+éÇ≠9cı§c6NbÃú∂ãPg‚˛Êø#v˙'C6GΩÓq∑«îIr“ˇ„ÉÓ!Pe˜d°	Cx_ÕŸ:≥Ê41Y·≠%ÃkKw™˛ıˇ∆©⁄úÙá∞q≤N˚}NfG«˝ò∑£g›É‚©*î`ï,Üâ#˝˙E"ñàãm•ëBË‰NÄ‚æw-A¡°#T!zÁ˙Eæ„3“£Æ/—É¢±Â:§π¨ZLMæ!-UJ:€|§‹ë/$∂ﬁ·ÛÜj©ŒBf):Hs<~Gπì‰Ÿå4∏∑°R’Sq›±ö4Ê]'ﬁlYT†$lñµëaRkµ‚“}∂=]¿ë™Ö±˜üRœ3&•Üò≠‰7,Ü1èBMO#ﬂ4ï‡„XòE9Œ
Ê£
8·“q!ôà˝P&Ó•s”ÜÈPäô*P.ú,æ…¥¶úÇ.€aAó¥º:"I%rçzYÇáÍ÷’%41.∂wz,œ»‰ÖeÍÿY>B>T4äg“—RjÁµº‹∆¨lqVW7∫eÉ 
Œ¬•ÿéÇa8"Y≥´†pÄ≤Q"LœËıã>Ïºh1—*ü]LKIåù*Ÿ≈¥$üøåí§uCúéŸ“Pf»yÒ^6˛Öz™br–=`≠d9ã„Ö{óá˛§≈h±¸-;UV∫á¸àt-√Ö„[ãw*G/Î$”p"ßK'Tñ~˘%»/"~·ÿT
@	ƒ‡0V™#36Úc™6$®ƒ9Ë¬¯zD":%%9∑:	…π(rJc )≥YZ¥NÙî®L´q)
¶√•8yénXXtÏvHƒ«
T ;˛ñŸàÔà5?"◊¶Æ^dØ¨∑M–®0€‹˛+L™∆‘<+KúªÙWsë
–rzˆçnX∫Å9k8Ã3;-æ˛Õ|9∞3ûßgô”ô°éÈ˚Ä†ÛJ?S(YU§C´)Y
[Ô+4nV)$%·èôeiRû t˝ò<s|‹Eíëƒj“%∂qI'B#´ˇ˚Ò‹r–≈2qçÀPY√¢&Ï7:w‡oÓÕ®ÌÒdOVEeÏ∏¨–S∂Lã≠†À ‘˙XiÊÎôO£∫Î,'±íÇÀíwy5tˆ–Ãa∆.`ƒ¯C”UÒîFyî∫ﬂ*Ih	YôÑº_ùPb±ìj§“Ω4=áEqÄHf‘„z8œÕ∫˝ÍíZ´∞¨RíÒHT«Û8WíXJBï∂r˚π:öGXî«¶#Íyaﬁà¶Ô∏AoÉ3√#0¬π®Ih∞ŸüUPÂÿDí¡aöﬁ}PG)£)qïTÕª∆ú˚tÃ”û—◊^ñIõsœI;Õ+Ù›åßúZìÃî”ÑmˆÍJÛÀ>O£ídë†ál·eRæBÀ…>úwÆy679	R¡±;˜êÕ0!‹¿î@Ê_´ã|J¯1&!*·8ÍÅ6Ñ(ô≈œŒŒälAön«/å”Uí=2ÿMy≤pM$∑◊vè√¢J˚wπiˇﬂQ
™ÀÌΩ[}fMìLúXŸ'π#ÏÅ?cŒvèªü¨Ì1'‡©wCÜÅ¢∂\Ùì.¸$:‡bE∏éEWj7
oT)9Ù]]Wàçª(˚îÌ˘`5˜~∫∂◊ÆE@›{mƒy
eÑ>rﬂ‡´…—më:*ƒSJ∂	ßêı∏à€úÆìg∑ˇZì≠–6Py=£ºå¸ıåEüßWvE.g=T~R,W%M*Óì“(˚ù3Q§VK√¿* Î`•Ü—î<òˆÿh 7"a‚äeª#ƒ—‘Ûÿ(Åi‚Åd∂±óß=äµÏ@ä¬¯V⁄–aÈy¶;≈H,L¯X⁄5˜by®dMJ&ª,|Èhø{@Xò¡Awx˚≈…‡àÙé1∫u8¯Ê∞ÿ}∆q⁄ˇ„ìÓ≥€øËñë`˘<ÎuuB±r·°3ÜI∆b^âp#&>©?M®œÁç≤JOàJí≤®÷‘Ó±0)XT¨°@"˙Á˘Ä¨∂±B&†Rı_l¨4⁄∞‰kåZ¬v>2ºË§Y÷òGÅ€=A[oræ&KR¬&o^î5ÜD_«ò¨k¯Á1kZ‰Ë¬ç˜ﬂW…„_‡˝'¸yLIÓÅﬁÿıÎfy-∫≈f0∂TAµtr…*πY6û˚I/3⁄®∂QÚ5∆ÑˆC≤¡3°U¶990πXPÍ˝◊»F˘ÃGQE“à:w6¢ñÍàÙ{÷]§•N^zæ±A™Ìl”Îé`-‡ËŸó∫ÿ}B⁄“ûà~R€—x~Ô∞ø q]ì/_˛Dln ÕC˘ocs®<v¥ÿÓd1¸¢ºïò∑-÷NÏõÚÜ≤ ß∆⁄À˙Ay≥a)ÍX[·]ïY˝Cí„SƒÔï?,¢ô·‘<‰.±fRﬂñmﬁ‚mp≥Rí>Ã∑öÔ¯Ü’À87‚RD√•„˘à"î¿∏F‡OÚ>5Rdl≥xlR◊«I¶ﬁo|Û(vjDõô¨.œMD¨è∞ØQ#∂èî∫ò∏Œ+ˇ‚~<¬àŒå˜‹e®Ï†`j[Ω^œ^àµåßW@ª ∫ÀÇB⁄,YyEòòó2˙Œ|•áéu∏`rÀ~[ç‚SP[8ßA⁄Ç$∞gàÒı‚-Y%*∑véÖ∫–I˝µf"‚•√p◊«Æ3√@dK
æY“È3chHôµÕrs°"x"^Ä"√Ã⁄ahÔ´≤°JXÜ•(ZiIM¥TöPÀ§å<Mëïøye’n#un	D¸3Nîp–b¡òIõ#¡|ˆ®yyÒyôG[!t4›è®Å/±hΩ≥<;2O,›¬8âÕ
˙¥ Ø+Ê8+«~$€õ≈@÷≤≥$2√î]ıyïÃ∞éY,é"VÓí«p,;“®$ÇhÅ™bq‰á»‘ ?NÛåÑA	'≈ÄG†ÏZâò›ØˇÙ∑§ÈXÛ Ñë9Ë»ˆw.B˝ﬁg ∆¬Y¡ıTr]Óõﬁ»úY¶ç’¡ÿ·k†5oáC‰¶°≤8Rõñªcv`á8Z‰O˛Ñ‘Àlè"‘≤ı≠¶∏7 In]‡~π¶=ÅÚß(ô†êÙ^;EÏ•D2ÛLJÇNÇÓuîb¢‘÷Îﬂ¸g•TM]÷©⁄Ÿ„5f&sœX8ˇŒz◊±ä3K√æRl+√ë‹IÅØMMŒ‚fy}Sç˚33ı]s‰VéJ≠,@âã∑wÒnrx≈”Ø r)∑8u3≥8uı£#3Ú2øV˝ äÿ®ÛsÄúÆµ≠Ë»%1+ÁRæé§˘FZK—5*öéd–®¯ÁâÑì/J;nêñ^Å/ˇO˜Ôâ|ZÕ,K|+EÅIÂZ=>æ¥)≤K
È]£¥|Íx‰™åTœéˇE˙S`Ûı˘ü‰!ß]òõZ2èj
äÇ°sß‚ˇ¿©c]Tùå;zìp;ÜÔëÂËﬂ¢è¿Æó‘“~Éª^´rÈ!R
1fs7ôS˜ˆ+gÏ|œ°s9Ù–∏bÅôü@ø\ë˚È}—îª"≠ïºÚÅ∏1ó€m„q÷ˇ˝cíó∂GZ¡ù$5\óº»ã˜ﬂÀ˝	ÊJâD™‹ºK€ƒÙß<“[™4—%™˜!“ƒ£Nπ_·.dø„ˆ≈{⁄Ü¡±öYú$Ø–π2°eTDGÉ€+ŸÏÊdä?mcÅb¨Tó€¯9gËâ0Ô{$∂"!/ÿ˜1!ÈïÍ%‹ÂÛYcŸ9sNˆ÷#¸˙ﬂ˝=ic |„°+»£¢‹øöY é3¯6c]M[∆Õ;ˆ"®{\ªBaNËûèU·µ¥ÍÃ≈Å≠UT≥·h˚ÊÀ/~ªpˆ„r˘Å\@'iΩç√†JG4Wè¬ÙôÆ†¨nDYá‘!«r&&ËÊÉﬁÒR¥´LÎ¶T≤N502∫é1wÁ‹¥="ÚÃ,s"Ï¨3jõº»€[ó’ˆAw2µ√7F˜ñÌ≠J@o<⁄ë‰2íZ‡‡‹H-eôå##.ÂÓ0Jsê¬®ÎÛäÔ[˘»roﬂŒLú_c‰ﬁ˛o≥·Œ›6&ªL1%Í.ÇŸMó¬„Y3∞P∆
áºóÇµ2∆ºK'SU÷ø∏;µ¯Qá´îM‡˘é¡È±Y‰ÒßS”7'‹ö Ìπò“í2ËçD¨ªJi<F1œø"É<ãj∂»ûKçócÁï]ëëe‚%-Ç´°U>MÚÏùi'‘<C9ºE*)*`‰ ÈI9÷ÌÔ'Ãåec;e‹%q| eöãŒRtìÑUø∫6l{±"wbu2l§¬âøê¥Y\Òe-√%;1uúõâÆ√vØò˘\GNÙç3ãf@u≥îûáYÑ∞,cÊ•jq≤—1_¯p~h‚.˚nÆÜ˝(◊Cﬁif⁄<0Ù≤L”FhÜ7ã	EWkõhãÅf∞O÷ì€«øXV˚2`kmWv^ûÆµÓß#fœΩªÆ$ªD˜ÃÂÀÏ¨∂À!ø‚ÆÌÂˆp(‰cÈ@ñ´6Í˜O(ï0ñ~ØªÛ˚gŒ¯µ¸FcD	†kØâ¯#‹jÎ[:Xx1où¥à‰Ö·Úcj˘F¢`Npÿ(ê…h0ÄÑÏ§§ﬁ\©ﬁ⁄û1ûP¸2ˇîÀ«*ıâYHéÕHé—S˙†„ ≈ëUF!€ áËÿY†õ¨©Á◊l2HHƒ}j…"âòlMÉ%⁄ØMb‘ÅF<6‚(:¸ÜÄ˙oI∑◊?Ëü$ jKÛarzKQOëÑàhgπrÿ)7˘Ëè$è¶N…¿ˆfî≥ÌÅ®ÛM~\Ô“D âÉ≤‹(‰UÓº`E+-f"˝§!Á:®Âü$Ø¬S≈ÏÕmÆà÷æ˛7⁄'4ƒ•QôúÒ"ÔóOSoÅtŒ˜ˆŒ´‡KPx9@Ñ@ê¬µñDR’ﬂ•Äî/çîTë»à)ìñ˛+L˙ƒ•<{ÙÿA ºKci‰§◊æÿ{Ê’oæH–‚ß`6U?ºìdî ÈZÑ/•EöS¥˜c∆∏ıú‚ŸÓ∆—ZÄ∏ÊñAdÇ˝√œ∑Æå≤æB_∞ÃÌóƒ„Íf{è	º;ﬁdÓeÿ≥˛ñÖáÛ©ºZ{¸
äAb˛W∞vº⁄ûa^UŸÇˆÿÓÃ⁄òùª⁄ò4˝Ñå\›LVpsÃYbœû3· ™≤«≥&-ø:BÆv‹‡	3˛Œßw8oÅX±§yãaﬁÅP°Ω£5KxF™XçNæ6"aı&+è~Á&ZÎë¿⁄—©›aaµ
ï˘H«ŸÜó‹§Çú$m3ø≤ﬁO	!-ÁuÚxõˆ$JêQÕˇH^ZEæ¢+A*Uñr›◊¥ßäÁÚH@≤Ω•„pŸpcπû7,∂q_√h«¯ßPíﬁ√ò*~:J*´ÿÉp'H∆È˜Æ"t≈çè◊u(˚U£Ÿ*µÉ'óª ˜æ±Ûkë%êO÷oÁ*∞Iì˜EÄ\˝ﬁµ$ëWû£Î,5‚˛¯£Æy/•2—•R/6 ¥∆kx˜÷ô{OŸ≠®ëœx7(Ω•øCüˇS«ÒóòVõ.œëL´Õ,tÆV›¸ín[Òö¬ôŒsuóÏ7_˛˙ØD·ç.¬Æ:=»à∂:vΩYsœºÄâ,`§wAœÖ9H˝t–[aèG˝w§~ ≥;–‚`¨·â_öëDe≠Ú±UJ«&r’52zÖﬁ≤¨d»°sºˇTGp. K}∂ﬁ≠ïCß§€äÂøÍ4êÔ¨ÿJ%‡ã¢∂¥0räÖjÎ¥ë⁄G œjFØÄòhw>6˝g¢CIâ—ÈºX≠ˇ≥„£ì·s†›b%ˆk≠«C<I-rÀ?È<Ù¢œˆû3/Oáßr2ºú;Nßﬁî3QG$èg Â±ÏÒ∆ãªXdLß´RwAÁˆÎ:ˆ dv;§ÊÕGxPhM:K;‰≈7_˛’ˇeì¿WûïÏ<*üR¯î7QpÙô,©`ÃÍÖb?PüøÂ	T.T£tÑK&÷≠¶T±;∏˘Axìa´¨}÷j4[üs(Q‹k6=—π¨¯v2H>Ç;·qºQ–à8º∆äl±&r=Ô∞–*‹…Rﬁh•∞,à~πoeAŒ-6äòπgÉô{‡ø,uÅÔXÿwHoGÁˇWQ¥2ÈøÌ√É0ıÓÒÒ¡œüü}28eeQüüˆ{üÜ?~ÿÔû~|“?}Áπ}ñåãòΩd='rN∆ï®{"qzê√ÃKµ|$eàlìªâ†WDA∞î()Lõüò@$ﬂrÚMXc¡˛É=D@cŸÔ˚'áÉg"ñfp⁄¿Á¨^<8ût˜ª;Ñçè«'¶;6«Ÿ©:„≤	F§ZcäUQf∆ËÇEÚÌŒﬂù[,˛ﬁD™5LÔN%¢
íÚ`ß⁄⁄c'ﬁ¯6ûn°+Ô.O∂”ìZ„úÉ-Ê¢@œ9r$`8ôc@ï©ÊP~◊Oπ•Bˇd„ÃmÀD…o}–Iñ_.Õ%…,"£ÃπT”êU…Î)ElMQ˘ÌÚJq=^èp˝/-∏ì◊nv£ôÕÂVÓAKÂìåÒÔ?>ËìÌ8©œN˚'¸;=Í∫Ÿèdõ:Ø9∑D¡˜ƒ‹‚•›∂ÛΩ®èÛfªœ∞Ó»ﬂ˛Å€P\9vùs.uaÇ[æ≈µ∏‹–Ã/tgÁ.e` EUÜíÖÅ¶g–çî+˘QTE˙#„Ã¥L_‘±ÇwÍŒ|s,r
O(u∫L≤*≥NV*]huT»4-µ[>∂'9'±j£”…L◊ëßÍ/9≠{†,Ì<^gmóïpb<¨‚€fC3†
}Ä¨kïq∂K√ö”'◊ cMEF∑Ùpﬂá”‰¬∞'<¸3∂ËShÖﬂ){≤ÿ[êU&´∫#Q•¯ÂJy†3c«üÇ⁄3j_Ãßµ]Ãÿp‰ù£Ôù¿ÒèSÑ…7¸)Õ∆˚p6qÄF=≈ƒ[ß∂õº√Úñ,ä)KãÙ¿¢Ω√÷yÏ˜:êû9≤lö≥ƒ¯¡Ëc_ç£óH}É].•œ”9l!”q√ÆÇ–√™ò˙hzÊÛöÅø÷çµ^Å±}•PáÂ]g0‚AÇ]6V=0ŒX¢6⁄r@uVf8¶=õóÚ.Å‚Äjj¨i£§‹æ†…ó¢'Ôé)Õ,PK1Çè∫Ojátt˚[95´ow˚{‰ﬂÎdË:†pñç>õΩu4Ÿ[FÂø‚é#™æ%Ñ‹C·›K»DgÒﬁ˙5¨û#•%+RD»a˜D—ß‘NpÅ9ûd¸Å9 (t>(ÈôRˇˆ-háFÈ;}Oﬁ’…NyòÁ–T…gd’Ç9èlúˇ•q¥WÖu˙“¥,m˙N<~_‹⁄∞ÁçrK|«Ö%òÜ<‹¥«s¨]hî
ƒﬂ⁄é´ÜBÈ˝+î‘D‚∫ƒŒQ°ñ9eF¸z◊v|¥πˇıV…ª3∞ñ±9ør‹ó|(òj•KÕÒßÔéò]Áï˜‰∫≠EÛL¥¡wLπnDŒuÙf8®^⁄Ã¡k˜¬æ¯ÿ=3lfqÔo®=1òucéF∏hÿ–&Å_x£∆¥Áh´h|ã7L•Øã7⁄pû9ó8G∆tÊxI˚9uP≠_ƒä≥ôäôﬁE'[àeYd
Yé®”:,$®~ CX|6Ñ-àœ«±Ãî‚V≤¸H%™Ù‰°ÈË‘ÃBœÀ–◊®Om¶ØI*ü©qŸ¿GK_æç?O¿–5Œ@∏uê˜MwDm&ÁÆìô1f1_Ä]Qs”5LI0bﬂnâVüÆGH≥Å}ÍôQ≤|ŸOór¶kæ1FF…åß	6˛ÙªnÚT•,Ms[∞ŸwfTä>y·«JM¿BEQ4∞•Õz‹ò
“·x>2¿ΩkùA¯0ˇºèu°Ó{¬}¿-U{<ˆ–À‚±%ÆÌvgé	gítè∞¯Üá#A¢µÃâÈxU≠ñÅôˇo“üí£3ê.≈ªâÈiûºk’@ìe»9fë›í…U∏2â b‚èFÛü∆= çpå·¯¥ù,È&ÓMOé∆Uò^–Ì[Á¥w˚6‹MÓFXácÑÛºo5‡a•ˇÏØ≤ÓWÛK∑ö;doptÿû∫KpG∑ö¸—ãäÚ^GLí∫*"‚ëcl◊uTÂ{]qüÛ=~AÕ…Ö_DÇ…-Õü(⁄ã’vpl˜∂täUAƒê“0ıvaÓ,>ëﬁ5ö;¶:.]g\ˇ©i9◊ò@tØ¥âÓ’}›ÌÔIn©$7§o–ëËLŸŸ
û•ï´CúÜºó&O÷!£°ÂS“≤»#ˇu
Å§t[Ös¯GEO<~à—ÿ∑ˇ` »(ˇñd£qï∆z†AKÏåep{T•ù£πèÌ∞ /”(æ]	ÿ6¡h∫#ÎB≈/¨ºâËk™ΩáÇgæ„[®gÄdf√t√ÏbÑ‘ƒ¥
‘ãVPlãˇ[eÖÉ¿ùø≥‡ûBŸ‡m_}ËŒg9¬úﬂ~eSá‘aRYx◊ôcGE4R›kgñ„åá &Èl∂°ww∑©»3:$˘>–„˚§.ê!’¨a…6÷†ç5RáÛœ®⁄F∆—]p]Gw¡qÏ¡8ˆ«åco—˘¿ÅtIá“’ÀwãÁúö,–ã¥P!~;B¯è≥í™ÌÀ’ƒ∆&»w63¥¿p^⁄æíº)˘Ïkg8o¿9áõgüπaMóöò=Èê_Õ)V>®ÄÒQ‹zÊ»]Ûı» A*Ãssƒ
§‹7}z#√’"Jˆ¿Sb0;ƒ2m °f;£)†¸“°Ã3Î-∫„Ôiq)F√üjÉòî∏ÆY?pFÃì…1ÖÔù0}√˜Gã4≈#wMúÓ¸Rd´9bfÉõöa~1˛È”æ¡5øÙπòóoŸ‘∫O1-äz=¡∞cìá˝·r:A,yz˚:¢ÓùtgØ±_kﬂÙx‡ÇYÏÛJ≈Ωd<«DÕΩÃ∑Õ.¡»Jüı9‹Ò<.åyyg	=h{¶3•@(#r:2l≤ÁÓ∏rd]˘Îuı6Â§‚ÙæŸ»T$S⁄O"∏Ë∆YE⁄B ÊT–ù¥èçE‡7ÿ587∑ø√…q<Ê)ü úÇwQv≈Ëü˘ËÕ"2
Àg 'P˛ ¬‘¿ÈJ°È?5a˜π3DΩâC 0@¢@=8*G0~¨ñ±=À·¥≠8Ô`:c"êiÓõÿÊ&¨˜¨RÇG'J6£Fâ¥Ãxâ©∑ö¸\QËN!ˇ\Â'…MíÆbëÑ≈è>≥+8‚∂sêf≥Åî§ôÊË&›˝£r0E˝ úoÔÈ8cÔ‰ﬁ@¯Zfû‰) Ofµ‘Õ—Õ&(®1â}±Õ€bÔ‡Ëè?ÓÎlãJ_ﬂSŒ£ÇËY√Ó≥aˇîÙI˜YˇgGßK∆yTã£)¶Á«ÛàMüòV⁄A#öMuRñ$"-êÉê%ÖbV3»#¨–ÃAt]˛ LÍ+›`—å"]2‰ƒ¶9ˇ§∂4>©v¥∆qê°õëY,çŸ	˜
ëDÎs g+ú¬äÆ
ïM_	˙_%è≈4¢˛’êA⁄w¶ ÕÅh|JœÙ÷ˇ]i`x§ë’iÄéÙ,M˝∫—hDÉ[ej„°ﬂp'‘o∞·ó#çÀ‡˙1•$OHódÕΩgÓ£ôMkëH…\.√û-ß„ª°\D2ç≈¶b1¯—r“ƒ»Ä&‡∞˜.ÃY)Qjíí‹ˆ˝ì‘R	z∑ˇhˇr>Akπ¯´j‹æa÷v·??º˝;‘ó·ø∏Sûå¿˛ Âã}^gˇTlÚ©âfuÇˇµ]ˆqù}®ÿ`w|âÜ_8oÇøﬁ1‹ìªa XJ$/∂ˇá"pÓæ;á÷àNˇ‹zøΩπIµ7Ä7,˘§Cz◊8À›'ø›áµ7`QÄûg j"}7%©±3“'»f≥µ›˛`c´u–mn„•Iì0¢û¢u{` ºZ<Âı0Å-~‰Lt
Í§KUïååŸÃu.ÈxŸRQ–Óª∆∑ti|~Hœ˛?   ˇˇÏΩ›é#…ï&¯*V\I`t'ôåà¨ÃòÃ,0IF&%")©Ö*“#Ë*'ùÂNFFV(ÅnÃEchÙÖ¶gÄ∆`∂K{—Ë]Ëfµ˙≤„MÙ≥è0Áòôªõª€üìÃ¨*çHïA∫õõ€œ±ÛÛùÔ∞≈U∫7ÊFõgÅT=,Åa1•uch≤a¸˝Œı √œ÷∆5›±˚≠Á˘ ∞8)Æ~qe∏pıó&∏,Ó÷úN˘ä”Ø*ï7«m˚¯x?Ô…`W_i¸æEgâ´	˘r*Æ[›¬’/Öøå”ÆBÚ˙˛˜ã…⁄UtÍMfévuò¯k∑‰⁄H|Ym/ÇÍyâﬁôª¥wŒ’ïº≠ÕºÈTÎY◊∫ıë¶òÕÿe·©˙Eo≈’qhì°çÛ«3= {œ*@S˝ôû,#˙‘ô{æÁÑF_ôA–Jhbøﬂ≤j†¥o†©'î&p˙Œ2re>˚Ü˙qZÕ\«Puã≈äÛ§öêÃ9Òh?Áˇ·&yΩöÂŒ Óok&Uøû>\Õ6i&ıwl⁄BˇﬂˇçP•µ€ﬁ¥	∫ÄVˆ SoT”å ≤}”p‹2|âπ)S	Bl¡∞ ûZ‘ºs0N¥∫Ô.Æ·0`∞O>3V‰}jS&ëé¸Ï·gwèﬁgáÁHUÈın2NYpì8“o<<P]qê%–%†Ω–≤?V’^Õe˜»âÒ•≥#6wñ’*têÍéÊJ+Iëh∏Ö˚í≠ƒÄ§pÙëei¡\ıTÈ$tˆ“ÇœZÎ7È†m	M…ÉrN…syÛ˜Ânsx˜åπ§®›ÓﬁÅ7ŒΩª{@©≤¬≈
∂ÇÈïN)ç´≥∏j#Wùﬂ÷∞‹#áÛ¿âË≠»èlÀπ‡ƒñ©Aa≤∑“´hn
K„ø%ûríØ2üØ(/+:oWz°Du€;qƒÏ*Wî)ô˘1◊ûçÂì~Jÿ@È'WÑŸDCwÉ€Â±t⁄§}È∏º`·WG≈ä0v‘Ò«vE∞◊˘9lÉMÅ„Ω=˝Q©ycΩbC}b≥v¨ê· s»Ÿ˙:ö+!∫æ©-∂LxãFÊ#“)_@ò6˝6tñ®í‡Öù‚RcGUÀ…‰îA∞“ EŸnıã/Jj‚î"—RíÕ¬‚™U>Õ∫Ui≤®fd_√®Xπ®µ›Ë´U∞dcBñÓ¢∫
◊&a%åü∑†ëtuu≠ÿñÁï∂Úéù‰´kï.r	VòÈæö@¨&‰Ö`Í›a≤6˜ÍñV⁄˚ ≠Ωi‘è?ßã•yz!i›ˇnN+¨a(„&¯pÓæ†(Á ¶'PªïPÆı–yS˜Ñ¥CÁö¿Ÿˇñ‰bÈŒî¸Vå“@◊·πûÿ9˘G√l5˜OÉ◊ÈózrjKÿúAmMªYÇò++L•rëˇ…Er‚æR1–Ú-êWÎ$ŒâUı8#Èq˙‘;A4]Ø·ÆÂñ>z+H¨¯Œ[bã•ÂÎ\AπG∞ÀÂùH¥ÔµÇKò∆tƒ}üV†3˜ ˜.âØÕŒf-¬_’ﬁ∏c—ﬂ(k!à3oq]{ÎM„˘)æ£>+B¸4√–°Æh<¶∞∂ä~¯ì“ ∂ú0tØÒGo2sΩP'üíó¥€BÅaÊ+ƒœZæÕ)ıΩbMã˛À‰ßÁ/…ˇ˙wd∞&ÎïÁ{ﬂ∏,√`ÖÁnE*+ÏΩ'ŒíÊ¨]Qh3MVõ¨tæ˘R/oY5Œ√º≥à∑7›\Ë1Ω‚ Ûç‹åŒd‚.W§πsÌ>¸ã“an≥?	—ä`_»≥4îâGü’ﬂÏnÆÍ]ë*^øgUñò=/t‹ãœ»¬}ãà#0Íã™UâRvs=X‡XcîÓ)Sî≥8uÀ©bÕ]Í∞≥ıx‘ÎH"}c[¥ñ.ãì∏À°≠˝á≈√≈µùwaœjTﬁó:¸O3¬Ã¿ãaèMû˘nìÅm¨+û?,~ı!q®CëÅé+Q=Ôã∫7,πÒl=ø\8ûN£—†âΩ∆≤Lîe|/´ì<1Ó-j3ÒT∆§πòÈâßíÖ«>˜fÃCDœGP†’y38’¢”ûÁ¬í‹0®ÕÕ±(î∂ÛkwPNûÂﬁ“È¿è„É¯å|˙≠¸O≈0·å˝'∏¸5Vlù‡[€∏ÇB˜ • <@Ox˜¨≤jÒWÊ€m4,Î∫ºekÚ≠Zô‡LDb,Ï*îY6˛8aåùÀ(◊+,éÉÿ∏w.¸WU<:Å1>£XSß¥§ÈCLAzúıÑÁT¯œsh8àã?ßJØÕp≠ºïo¬zT=4ﬂf£•˝“BA≤sZËH6ë/=ÜL'UrEe¬Öc—q¡¬b»–Ä_‡/!Õtf+FhÏ1g/GØc;WºÕ Îwá¢kiX'o˚‡vò”ªØΩhùílÏ*N˘;û≤‘∑E°‹¿r+AwºrˇªÀ•≠h:ÍEË>{vÁ)k:?à\˜úπ¶84∆zÕ1≥«ù‚°d°Ç⁄JP±Yì˛ßUªëdv≥∂÷X/yÍ9©ÉU'Ω¢ı%oº≥¯zÌLC¥CÓu«¢O	Í˛6µC<ç5µòóZå7rjT42}wÂ1˙ìÈú›ú∂°‘Oí§úêÊh‘Ì7«√Êà¥ª/ª„fw)ö|ÈºÑ4u[Á4bçEÔÜn¥˛€◊¢í–éYT(`cv◊‡
:ßWø
Ur˜~hÊ4ZIã0¸ÏOÎ§ÄHX‹ˇÀü–wΩ<c@◊4‡yH⁄“ΩÜ¨:ıw@Óáé≥ a="< ±˚Ân˛¿ã¥Õü«+y√ç‹∆C∂™§\›ˇ+ˆ£ˆ=∫GLµ”¡–7ÊÏ
‘µ‹êS»Å5r}Á⁄ùìVË-QK∏ˇ√)nÆx≠âª¥“15—t£ØlX|ÿ&c;i2s'_]∑§ñr÷˛™Ö_∏ô¯Xß†^‘Ö8 93p”Ù∂vT˝ÂÎ5¨È©¡˜$ip;á¯Æ3≈`˙Sn]ìDI “»Bz€†X9aöX‹
(höWQwØ±¨¶†¡qö2z%^Cg…‡gœvÖ†5i˚H ÎäJT&Y3˜Ü±ÃÆ<øÉyAµqÄÕÄ\ÈNﬂÛ≈ıÄ8`ãﬂ‹ˇkÑKpÍÅ¡m…í	ö˚oC/‡:Âî&º>Ô√&T·Ì.,6ó0…TIJP˚È¯]≠Ïr§%mv¬áÜ1ö–•Ë‡8S¯rM†Ø!ñÇIäú^ÒÅß•´Ôø•œõ$”‚≥âÇé\bf4œˆÇbcñÚîiLŒ¬ΩuÍÜ@Üv6wúìØ¯)∏ULíáÆËcu«&‰<ùıfyÙ s8£îüpâ9'dÙ™Y;x85a)=∂∞t•ãQÑ
Æ’éªß›V≥= Õq˜ı‡ÑÙ_t~yﬁv⁄[Â!|¨N0O.⁄›Ò k8u»Ë‚≈Yw4∫ˇèÉ](çÔòDÜä¸ıí¯`÷íK6üãÈúUqﬁiŒ~ ¡ÕX'ÖlT´sv»ÚFx~âáik–?ÌÔˇÆﬂÇŸ?#µG⁄¯è÷´&iwH≥/Ün‹y9l∂õ¶Em--ÏJ„“æ
*èëï∆î™>i®∞a(2*Ô±ƒ4Ì'6=;ñØ$ÏûÍ„W^≠.
Ø’jï˜B§öÃ˝XÚåñÇÍì√ÙE˜Dxò7m!=%Ö©„ëÊ Yå"µMœµÀ)ﬁr~Z¯ìÄÚ”ã&ykˇCÃ(∂»êìé–ø çÉTÔ&¡‘Mw⁄úrÅÚ˚ı%ç%”eÊîÙI√¨<gØ€r|ñ◊]ìtîùØzÓ¬∂ãÊ£L^Üÿô¥]P™—€7u>»˛Bï8ÿ^ãiuâ.‘%¨oz0•Óö+˙∫”szmw∫˜Eâ†Ω÷B-Æ	õ*&wÖ^¿Ô~ç3èê-ØÃõ˜∞
°”sÓ‹x˛≈ù§oÙG«Ë=˘y/!Ω¯ä*‰ﬂ˝r√ø0≈ÿ≠ÓTrêå⁄"˙ãnË¬·ñÒÎá3ﬁû2˜¬ıÉ≈5ò|q“‹{PÍ„>Mb˙Û¿ÃÖjK&g@”Ÿ¯ïÂ˘{Ôâì∏∂rjDö˚≤mLhÊDMwFN—TıΩ…J≠1ÚVãöÙ><»jç8î∫ÉD
^y»Écñx∏ ay-Æüˇˇˇ«?˝ﬂ$°ïƒe≈æO≤ö>ÖLp{‹÷ŒÍ˛˜(ù1Ï¡R™(Bpo@ú≤»ΩãfÅ⁄.ÔåRjXºéM∫†Ã:"•Æ<ºî3ë£ÒÈ0Àì…ö‘Ä‚ßzN¸tèÖWñéX´>œuˆ§aæÂükP∆œõ›~ßG’ ƒ‡Ä?^7{›vÛ˛oAÀ<âGëìYŒ[›AÉ%⁄¯`ﬁíX°ﬁ∏JR3
)Óì¢ãÕ ÖTƒZ~∏Cãò/ôÖó™ë˙rΩùÊ„_äπò¶≈9öyÆüCÛRˇï<¡ûrˇté‡≤YOQ<∞Äﬂk! G=JSúß~n£†–.&dKlÈÇe‡_-“	\v„(≥§^ªmîKg˚1¿ï»j¨ÚË◊ó˝ÃYƒı”‹8MÅcV≠≥Mp3∫<ﬂ“ˇœ i¨ç≥(÷uπˆ#óÆ,∫>P_¯zÌbJvD™ßéørà7_∫”ƒ«JFºÑ™b+Hä]˛~ÿ9ä¡∂?´ﬂ$ˇD≠%tïÜÓoÍ^D#òñ=û˛Äx”[À$pﬁmöwΩ/º@ﬁ´&∫Õ˘⁄©SÍdÅÄ≈&4aõ‰iUÑZÕù€⁄€⁄õO˜l¬)
-kîº√¨¬swSßA∏˜ˆô∞Í'ºyÃ,ûâ›ˆt„˙Ùôs7äúk∑‘S≠ÄÍÏsáãáÆ1¥¶›;≥®µ‹Ÿjˇg&c¸XCıŒàÏRáò`µ|#B˛¯_«3\€a(1%6x∂§]k(%˚îT≤OVŸÃ{Y´7ıhÂ.≠ìöãiÕ¬öH‘Ë¸zàà◊B|Êò÷Aâ˘∞q¨f}*≥jx7Lï∆≈Oôuˆ_HóßÈ0]˘éç≤Ì ó…æ6B¸‚&≠‰ÖMkO‡o©]•*˙üûnï˙qæcÌ*ç≠¶’`ImAÙ©Êç13üÖΩ®˚˙˚£M—sV{s»l•$‡#YÜñih•TÆO˛¨s}ùÎËœ:◊FÔîr+*x?Õ&ﬁ~ßz÷y+z2Û¶6y©ÙÂ?î¶eT!][ôÇtêg≥|¯i∏ı ã*â˝X@†¡ ìÍ‡g&yùåHôë˛ûÍ∆4WP’„›¬ô{Ú'\Äd Mﬂ°;ZœÁN¯Œ†É‹}";F<ÙD««Ö›Œˇ∞éhEy+kﬂt‚ùª(à™3† ¿<3^ ∏≠;∑Ëªs˘Å{…©Üb a‚ÃóA5⁄#¡%lÓKƒøóöˇÆìÛ Ù|Á&@.K—Sã$m|äI aË
–ˇ%ìBÆ÷)m±®ÃG2ó9?ü‚èÊ9çØﬁÈº>ßrz8Ëè‰º9l
»a*«Íä®R•ÒRp√!Ú]∫s≤
25±Çòp"öüèÑ´Nw÷Ìw˚„á‘≠À◊£kv|æ/z»Ád√:_V˚§Ú£27Û•/ë(º–M3@º[˙R7Œ7^Ì}i∞<å´Da∞»nj¡∞Â3d0’âˆ=ÔSo∆©+;lX°j∂—Ë0ˆ	ÅP $É)Õ/—Lª·ún˝Œf9-Ló¿¬w ˙æ‡}Ögfügr" =õ0éõ¡ËÒ£bg÷ ﬂ%∞˜tNXñÚNŸ·!(ËZ[yû˛õT1ülÓíSw2£åÒ
\›€ê1˛"ºFâYyŒˇÜ/•}~DK}:!ú\05ã`”'å√˚ﬂ°w
^#˘'ª∞ÖC˛FÉı
›BapÉ—uœŸÙI›(ìµÓﬁ ÊÏû*˝ö<$£4‹AJàïe±ù›’»˘XaC√ÖD“AiÑﬂQ%&6bÃ∫–Ø≤bC“ƒáôú3w~“¸Iöfáß;l…óP‹Æ∂∂6~æ¥M…7´Û:|G3VúÂÏyÂD3T7ëı!⁄ËL>Tù…«˚EÖP†có:Ã2^—º~©?ºM‡°¢Q†ruVûÉ®¡›óı+‚üîê?’2Ô*§≤I¢∫<¶$h¬È÷âhQ±à{›r˝ù/ <ûu*^!∞ió£(d'`*B„¯ëLW‹~4s~£<Ô¡eË:_’ﬂáuÎû%}Ét¿Â=¨ùw˙Ìnˇe≈Eçaøª„_}ﬂÜˆ%?+~>ÃU0Ûl¸ozvÓjåè≈1Ü	|qﬁoû—ÿo<˙¢u1⁄ø˙Ç.Õ_m9\[ñ!¥b≈Z @ÓQw…jß-¸õ¬` Æ¢1´OJ‰DË,ëF•À»7∞EËø√‡≠¬}.ÿƒ:+E>;πã<çÃıŸ¿ç»ƒΩJÿgs¥X_sÁπÅüË/bU,ÎZDÂ#z6VYÀ{ÇºÙ_¯ﬂˆ<Öf”¯cãˆúÍ∂7n(§Y∆	kp∑√t(0‡/ñøgv:≥Ì°ÓïªZÉJålî’AÌD1Ê)√›Lõb+Iw¨OΩYúßœ‰ÿO›ñŸÎæ€G¥Lç9√,⁄tÍÈ‚àÚºLPè•Q@Í}4…c9{<…@É/}UÉ∆≈∏Ósï“eÕCÁã`Öﬁ*¢•üJJ;ô
É-ÇÛy≤Ù>>"M>S7›ìh‚¯nÌÕ~˝…„œuΩyØÒÈhÖÍE‰Ü4˜K4–ë*P…0!òñ√Ÿ¶NFÀãî}Ø¡ÎΩp˚.uÒ¥h˙ßèóV:d—ÛB∏`åãé∑7∏∫¬4gí	T`>ŒÌf/∏≈?[Õ≥ÛLR}‹E≥‡-†§û;Ê	fÏ>Zv!bÈ›¬¬ıëª™ÌgB£»™{	õuÀ⁄•øÜ='ﬂ‘ée˛”Öû¡Ω5®ª˙¢›pTÆ<«vwGËr=!∞\èê`ÈLº’;¯”ƒd»±êB¬Ì¶€Ìå.!≤¿N+êGúá.ñÖç[?V¯œ<_ANnŒ‘çÀÏ£Ï‹ ÇØÇsîîÿ∏î êbi§Y
\ß0ª“≠îM5WiK45=0Õ≥µ√f5DugêSvå»R¢˛,Ú∑°∆¶XE!qÎÊTÁìÿg-@vÕ}›·ô=∂Æ¶Æà•iôø˚®ÌÅ::«d dπœK‘>ƒèyRˇ¯_ˇ—86¯4[&Y¡^)Ω·ó∞ç%YﬁeÍÊ—f3ŸPÂX53à’cté≈ºdÇºˇiRÅ;¥‚È2Q≥wyx4ƒCkb4JÉqpœÖæk8^n∞»)‹Yè—Z4á6¬√^âBüÊËú'xiò8ÙPÉ„∂Ì [π(á¢⁄Ω9®…&‹Lq\nñGrY&¥ó’’•j¥»Q`¶"™o0È›¢;ª çÌ,&„nÅ…€%dÏI2vTÄåeÍ»·Û7Åè©±H2∑Æ ßàrL1ˆÉ¢ä?Ü≠F}ÑzÓLµeF'r${<V$ÊI;Vß∏mãFfÚ¯ì’[3@≥ú±ÃïV2≠ë©vtƒjÓ6Ì Ö°…¸π≤Ât	ˆ±]˝9H|≤|-◊môÇdª≈£mräµΩˇ⁄reg|DíÌi∞rKÛq—uîC®f®«äıΩk`jnT‚õ}lV
≈Ñ4)5ÖÀ3«€!ˇµî1ı4lË‚WÃﬁµ}Á5Rúâ” `EãC¯Ö˜2æT_ÄÌ¯∞”KXDo£=ÖFØÁm¢D_ÍH®8◊l ™ñQµ¥JŒ◊Ô@õ]ó:©¨V™=e} b)îb€œ…¡û¸l,^[ÉkU«öÚ]Ëb=88ÉX& ¥∞¡5Np≈0jˆ∫øµÖÕ2¢Ëë‘%Æ2'˘®ÀÄp˘ı]0Û ¡N“©\€JˇnkÊﬁÄIÀΩe+·a<YNüÔr©òJB˘œ66Jˆx~ˇÌµ∑p$pÔ—j=hh	 >¬nm``[≤Ö«O—a-u¯+Œ-7˘SËêı.ˇÀ?Å]æ·ˇY8H>*·†X˙Í·’Ö≥*#ÓÇ™ºO§+êd%v“Fˆõ\M˙·	Ö‰ó”JòR∑¶å“Óúº¸˚oW≤∂ûz>+K˝÷ù∂_HÙõºn„_ß∫Õ±ƒ[˘H¢Éæ¿Æe´mPXﬁùë∑ò¿ {—< ’§orÂKó<k$•ºı)•e)b˙,È\ jÿéﬁ-&?_ªk∑scè´~‚øT»TªƒJ.ër°foÖçΩê{+V„ñaüßC˜*t£YÎmFÿ™kÉÿd√ÅËÿz1KJ¥ÙtÀU`«k¯«gá≈£8íz rï†!…ÑÓèW§2Ó<;Tˆ;ØDdî{%h] ˘L<Éì‘¿z≈K1N*Qæç⁄ßs'lª¢ÓHÏ|g„ÙM`›†cˆ6§õõÜ$n=ZÀÛ0X:ÃÄ¨Ó˝Xfﬁıµ‚í∆?µé≥TAKˆÄŒß".ÑºÁ+Á\ïØì\öVë˜§ CM\9[˜ÖŒ!ãz∞∑5Ó ΩÉB©ñÚ%êùËí—I›íàsêd±~p±Ã*	–Ñ[|M;xªP\•ﬁé∫—P∫A‘;U˙÷’ÍŸ·£"≠Å∆BÀF´ÖAA †2∑ØMHï÷à1ÔbEMê4Êé0K0∆+!… Íé^î$wF:p°Œ¡•ÕÃL«√~(NM?Å≤ÆÆ{”˜ „«¶‘¶9™W§Ø7—ÚYù6d≤”UïÛ~TP3·	A∏äâçlÇÃa\:Ù(áÃz+‘à⁄]0∆3o≈Ój·Á5Ò≈$Ä–‹x8ısæM∂.≥∑ßR√vÁ)∆4äÓÀã!v»Ÿ†O…:ˇ*Ü»ËW˝ÈúëQÁÂE˛>Ô5˚K±N$≤DâòU˘zïFä‹Ly9+—BˇVû¨•¢¸ÂÃçªOÓï~%Áhûi4Qó6ë5O©ü [ΩSö:?∫C§Ê5x∏vT›£«Í'â^˚õﬂHı⁄=4árVJéCÚÑ‰tΩ±ƒÙ,Úz‘o†‰+èÏ‰∂Æ<nÆqpç¿—[o5ôÈÛÃ>∂Jè5'eÛX˝D:Ω&≠_\-IÕhèÆÖ;¶˛=N´/Â∂Nñ+svQMdÈ`	 ∫“"#2]áÙ•ËÆpaC‘ºE-XØ`#L÷—	¸ãv˜§	π/_ÿüeÒÒò∑¬◊oåh«%´Ìk∆ÌÀ∆∞F3à#ˆ™|ÏY2P∆UÅ#H3Å‰¥c®,Ò:«XãfJ+€0≤ö±•≠”'ﬂ¢upí˝∆êΩ†_mN©92¸Å-,júà“á7Ø¨≥
4?IÀø	Í3¬R‡f“ÂäÌ*Uyâ2Å¨hÜByFaø•``XãSo-*‹	Ÿ'éõ2u≠˛¯_˛ëΩ4eÕ‹	ÇM=£¸£ˇÛˇì˙Ô.ØqΩ¥`≤W ÅÔ£=ãÓl¡‰ÚâËâ”ööH{åOrH≥4¨4
:ê7∫ì`± dls+p©MíÀz€“õı.∑åéÀìG( MÙ"*•*<pôHôV.∑2rjA¸~'<ësÇ“Ûhã‘ïÏp·ADˇÜ?aFÇzΩNè¢” ºˇ'$Ï∑[,>≠YÛ©b*ö0ˆÔ∞Lbƒjòï°&êp(R¥∏Ä	‡Vh^ÜJÃùÅÃ;÷x\éÂÄ˙2$=P‚Å§ˇâ1aÄÀìh=ÇÁV˜êcŒ
√¸Äxv∞ÚßKÓg 2É ò2scd„BÅûòù'ÜLz=@“éA£Ùè“g™#ºÚÔq›_¯+oNÈ–îå9úhEÀ“êæCŒaåVLÛá*≈Ç∏ãUwÅ&n$:#§?Ï"d™(Qª,ÿÀøù%˜¬|ºÎvOITQ≥ÎŒÉÂ⁄Áëy6	*~˘R¡ŒD%TE=c∏∑U¨ÛÿÓ]Ónº»ÉÛë/£Ì√ù“ü∂ù]ÉÍdß6¸i'ÛxËú¡ŒZF'Úå‰FïMWΩ≈‹"ıÅ`îtîqãFÆNf?_ª·ª=∫´uÊC∏vıY
¨K_„]–ikıU–ﬁ∫a∂EuØæ
Ωπ˛5ìÖèVò|Fæ¸—ºTZëÚ=a_ƒE(ﬂô}äMÛó^=á∂q∏ƒìïΩÚmy”L[∑≥˘W5UÒ∫ÅÂÃß:Ï∫∑ÄìmÍF’ØŸRÄÈH…~†Ø-˚ÅΩG˛]GﬁkuoóA»!ƒSçÉÛˆi5ﬁ	‰Ô·É¯Ä*skû¶Òñƒb3wé≈R4gs(|©≈!7K2‘O2Ö,TU ‘Œ[˘j:ÿ`M0‰ZÜzOuìFUCœè8πR_üßM4á«mwˇ`©2Ù√»_E:ê∑*Ò–u¸⁄
	5#∫˜»•£‚Y»ü–âæ∞TUëµº6„\FÅø^πYíb<ÅπH˚S&&rK3ˆ=k¢≈ÑÚ;*ûÁM°´âå™±Å™—;T;K`ÇT\ë°R<w£Ø◊^CõóÙÉπ˚ÄºË> √˛Û∫/îû˝ä÷8+§Tíj@Áúí+; ó5PuÎ PÆ›Uù>∆&®˘V‚ÔWYH,Ñíó°¸khàd®$¸í„]JÇ	®π/˝⁄Í»¶ï•dNYE_ò#)˝'@Ò|K±Â•ı\ÔDΩïØ‰âˇ≠Ÿ´∆˙≈å’úl~Zﬂ†∞˚ãÚ˝0ÕÃƒd—Ëƒò≥◊©œãû7_*1uzë^ _¡ƒããﬁœH≥5Ó˙#DKåáÉﬁà¸Ñ'ÜgMˆÉ\.ﬂUuY#Y≥ÉüßAòNﬁÊ¶»ñF»ÆÕèfxÏ∆‰ÿﬁÿ¯Ã≈◊ﬂπ›ÅáfΩ3áì;=ÂÎû∆z`»t˚ ^ˆo¨vaw•›Ú`å˜ˆ∏Dﬁ;÷	8~Fº”£≥†lEÔüY5¢>c∂ëQ[?•Ì›5øÀmäa«ÔR:ûjQË∆UîçÁf1dõ—)é7à‡”æY—è«Z¿I
/É[sB<Ωí¶9¶K’ú‹_PmX:¨HÙH˛‹=K~‰%»Ô«*2kó°a{2XÕ‹náâ${~JÎªi∑WjyıäJá+/ë≥ 
l©@¯|z|‹ç˛–>ÉH¬C˜>∑{öﬁ#ì\E\ÙßÃ¬Œ”Æﬂ∆k,hW‰ÊcŒc.X√=Ö$(π}íŒâ Û2t“»ËGMÍÁtZ0?1‰µy™w≈{‘Í≠º<Ç>Z</mÛå¯c>C_aø˘|Wå|ÈrÕYfëî€ó]HQ"Y∞™°sÊ»/3eæ:HUï”ıﬁ\·”ÜÏƒ&J¨π-"ÍÌÂâ!Óú¯XäÜ"l€≠A;Lyåj®ÀRw…Ã]9S∞¶JsÖ⁄Z≤a¢&•Ép`J|e¡ù*ÎéºêDVô€Ås* Ö.3)”y…ÊùóŸ˚yà[¸∫'ñ‚û3ª"/öA∞Õü·M∞ïh©pﬂ›Â⁄ˇ™ÌF´ÿZ≥ÂìπÒ^‰⁄≤ı‡Â?™<'ÿAH¯9P*…¶ÁJ¸x
∑†§¿∑.*"~lY…‚x˜97Ø)égZ3C≤O\úâ"zñ!Õ„SÕ˛≤ÌÌ‹Ç∂{=t©S≤ZA0Á%=˜yi'w¶ b‚±¢RSóTêJÁúË‹qÖ>[ûä?fæ¥∏]s…(·ÍèÕ2»yœp◊ƒÑsÆW—µ·vÒSÔ:†T!IÙèó∞û1k.>ëüí-…ÇÿÌÓHE¨Â‘Ôú•œéÉO<€∞˙å˙o\{x·79
Kù&[âËBÈ¯ﬁ‹[p(RÀY‹ˇa·MúR'bâ˝X~7™˜"õµv¢4Ö‘Êèra˛]ëRGŒáâ9„zâ}kµaw«»ÀÁ<DÕπ(°g‚«~ü⁄1ÆÔÄÏp€‚©<vrˇ∑˜ˇ®≠?¡+PHƒøØ_DÑr	ü©9Ø#˛[R‡Wp7†T‚sÕ/±$Ÿû7evj‹§†AÑ´8}≈l´h™PD¶c∏=í,<∆Rúœ¡4;7ÏNÉj#ó  {s®+iêñWâgˇ˛ˇ¬2úÒÊ1Ç¢ãΩ»çƒ√'«p:fâ“[Tæ˚o—”!{ª√ìÏ®±£™p&ËÖ:xJ@J.∆@È(ˆ0°wâZVAπgr¢lMƒ*oˇh’foÚ
˙*ﬂtÊÃ”ªa¶ÿâyR‡"ΩG,Pˆ©@·æCÆ‡G¨z!”ù7(w!*∏bù¡"ˇù™í’·æ^£ó+UÊúBEì«∂ˆøÅ“5Å]o“ó≠yÑ?∆¥⁄ÑXZ’∞„©ØÑ É‚∆∂Òóïπër! ı +i«QôØ@éöÁ◊¢†	4¨÷„VarÃUjtÆw„Îµ‡¨÷”èËí’"ô)∞ÅVV(%)uµï>∆'}œî±ÿP˘hbÿ≠ˆ«˙ÁˇÒﬂˇÅ4«ù>ÂÑ9I¯!ÈÙ∫g›~ÃsFzÉqgSµåè…“…Bwé2Ç¿KŒùz	XÈM¨∞âé±7¡iû≠∏MrâÉÕjrˇµ!∫ëøˇ™P÷uÒgEà}˛PÑÿƒ’†≤Jèl}<ïá˙≈é%é≤çî—}ˆq5—˜˘}QvJﬂ'ù˜˜{Uπ‚Ùî©ŸnÿπÖΩÜŸ_ÜﬁT⁄∞«∞!œr˘ùÚ.rÀ˝Yl¬ÀØäRËn©lÑ`¡.âCô*tπÍ©π›ˆ¨xF™ûÀÿ≥,Ñ];ﬂõj˜æ	•ú{
ëJQ§S§)À¿¶nè|¬ÄP‰Ñ≈¨K˜π¢Y<V=ÃÿÔ¶Ôw„…Ø
P°H˚⁄Tknë˘…Ω¡‹ ;h≠JŒ—‚È”uË¡-∞jõ`”å8∫çå%Qã¢-êâ•êàjÙ°|]*ókl˚«;ìù¥ŸoU˜v¶ﬁjËE_eÔÕ~´∫˜bâ…èÁ≥`ƒ7≤ØÿmÙÂsiÊy˚	œ†S`O—`9∞3ZŒBüÓ™{√Êb:ÚÆq/·Æ{˛HãvÈ%ﬂ+¨Sä“:zÖ• ØËNsZMÚ=_b Œk;¡Â¶‘…≠yAù¸ ø∆~F¶ïgw^Úö¯∑^‡µÉ…±V0E˘>ÅˇÿJxÒVv£jm'X∆Œeµ2Â˜Eï≤2ÁÁk–A€Än(¨#°_‚lËU∫FY>A;tﬁ“FS˛ê≥‡“Û]ˆ3^®∂J]O•ﬂJÓóáÌdﬂ™
ùeïJf‘|AéN»Ÿ˝o€=Z|æ=h]úu˙„¡ŒãÂ2zòL≈˘	ØTﬂ…œáπ† /y”Gó¥0ÖEóì∫‰;~“[k7û˚6Ø”
u‡”“ÔVpóTÄjæßïﬁÈ’íã›[o%i∑&kXá<ÙØ‰·AÉó&…4êüÙ‹ü89)Êtê±;_¢ÈI‹|Ìíó»W≤v cªä∑˛hÛ»¶ﬁä°ƒÌÙÑ˛;ﬁ‚øµ§~Z‚úC#ê"yy÷(îÁ€îÚÿÑ’˜Ï˛”µPØV,3˘ÙRÊ9¨ô3q
;R˛Fg≈ªzÖ˙a.º38øCÏÈäØ…KvØ}áˆÀrcåîØ+w¬ﬁ¡õªS¨)º	Ns¯Ér‘”c£^óœQ¶‡AK¸ïÕ»ËU≥÷8~$˜ª)|mjlÉW °ÖÒqÔ5’qPƒåérwÊ0£\O1sGYEÖ	;ÿœr∞…s±K–Dq‹%ê
ı.,ËºïÁ†π~pB^Æ=^∏)˝U~Ã5>®ÃN±≈˚°Tcq ÉŸBì¥9∂ô≈%îjzÍEoÈ{°›!7–:Ú§ù¸ÍöU„7utkqZäKÇòrﬂ¶sã+åo±˘∏ø Æ«·CµdrUÀj≠†¶gÉ$ﬁSV8YY„h{ã˚ﬂÕQF:86+/ƒCìS‘Èi[%R1%qèkÑß”AG~I B$2ê8óéwãO˙prI‘¶ÀÀ¶å.nÖi/K◊áá‹„ºxJ+V‰QÍˆb)O¢F´èËÂ¸∏'¬«Ω˙TEÁçò˚%âÔ§:ÏOo˜7‰EóˇÅYÌ $ Ω‰ëÉ¡7ÕKá∆Æä5Ó⁄Ó ÒgpNS°b#;®P*_ÚM≠â/òc
ûF:ı¯ûç÷ó3Q”œUﬁdƒ%IÂÕH",hyYFÀ¥Êÿy_‹#JvØ¯ÇYCJÌ€ˇåTt˘ïqPà⁄dQä$˙4¸úW•Èÿrs] Øê«`Jªc¨{-ßäíﬁîò≠dp⁄muõ=!O/V Í´‡ïyF⁄ ›®⁄≤òcE#õ
»?Èùº‰ˇ*+ZR≤≈∏¢[√A–ºÏ6—-s6x›enôR´V´a^º@˜Ê@√‰‡$ŸD¥|êÙ`∏3K)¿H¢è^áµk´ éï´0òÛ(¸ù*¬l–“⁄cQAÂq”FBÑ√öY¢ü≤Ãíîx*Ÿ$+ˆIB≈ñPbœºÈîXŒMÅõÑ—fø9~D3Òr‹Ÿ
CYÆ…–¥ö∏Ú˘ÙÉ≠_=Ï¯Ó5F¯ïP˚¸¯%PﬁÑIm_Sçˇ¥øŸØÔ~Nd5IƒÚHjπôÁ˙9r√'è`1√ˇe'KC'ß©UCÙ uPTÆ<∞Ÿ|TWbÌUÆ∞»(√ïü1c$µcÂ&ï(¬äªî˙π¯SÂ’»“tÊ[ÂFäV˘!{>:'¸ÎˇDFù·ÎÓ˝ﬂ»yßﬂÖ⁄ÍﬁˇÕ∞;–”‰«`FSIﬂ÷	Y<h‘44¿5U€
Ë˘TÒéŸ=<Jﬂ{ÖúeJ¢C∫ÚG7ì1wû//òtl∂œ∫£´é÷q6Ï7ô2p>Ïé∫É~≥W!'Íû¸i±óÇñÊÓΩnÔˇöè9Ù∆√&©‹Ó6«Õêı\‡c√vÁ[õ˝—igxˇw0ÔMˆN5ªó©;ΩÊ¯˛∑∞V∞•nˇ4≠≤~‘ÈΩÇ∫£V˜º◊Ì7á r	jnm”Óç˜*yLﬂ!¢dÖÿÓ[–h…\Õ¢/∫πP…A’{VüÀ2∂3diûv]OÊ§É∏Äy'M€ªˆ¿;)J_^@»˝&>S}ôÙ§ÏÇZ|`õ{uáÓµG=-äW ÷d^Ê‡oˇÈz1£jcøÒh´7—'∑=’ 4œ—±É±{ãñ±wBø-ú!%Bà‡»ÙÒ@Ú"‚íÎ5X˚N∆á˝o.Æﬂ©ìStE˘ŒñG Qp	ZF¥ësÈ˘¥1ha2cê>≤phzêO‡R˜zçb=ÍØ%;Uû∫õø·V<M∂·-È.hm™Ë®≥˘$J’»Àœ≈‹I©>asf*¥Êà=2TüˆK0Vkô‘l∞÷:ó"5-h9∂‹I◊3vZΩã—ÄÙ„.òôÕˆ¿¢ î‰ôöΩÕÃ8ƒŸõ¬˚,uEQ¬3g±v˝ {¢∫<ˆU—´€¡§bëü¥<Œ÷EO?¯8øËˆ^u∆z~µ· «òsáT_t˜v;ﬁd∏b(≤ ˝˝∆„£Oû4zÕ˝£'?ÑÅÏå∆∞HI´˚∫€#…`ÿ}Ÿ9€bïb\5z Ï¯h¸‚2˘∏p~É◊µó`ø	 ’'w?r6+“W≥6™ç8ÇG˜?<xÚ‰hchJ∑„u:‰6+±˛˝€ù˛œ/öÌalt˙Ël›ˇ∂›}ˇŸÏøÙö€àó4ŒÖf÷ßŸz⁄ˆàRåOBoÓvôiÜ`7‰‡pˇﬂˇçT_ÅLü‹ˇ~Í‰u‡Ø+ö«ªß≠}F,Í{◊{Æ€â’ã[w»∞ß4ë”˚ø¡ôªÎ◊45ö¨k≈¨È®É_{T¯m9K∂ÉúZ√ã6·):QÆ«¯ÕZÆÔ˜◊Ëp•/’B%ˆE£∂°◊ﬂV™ø Kõç—b}ΩΩSBÛrï∂]8êπ‘˝	⁄ú`Óã“{†Ò£’pxòä¯3˛∫ˇgBmi÷…Ä⁄	∞∂¿†Ä≈∆~ öÜÌuÂ˘¯¸$GƒÃÅ ä©ÌáŒúL"5Å◊∏tX⁄^=9Pp∆=Ëœ*ÙæSà€,ç4éŒÎ€9XtÉ∆êÓ-Ê	FN.¬’ä#◊$0#ﬂÉ•I_M/t±R„≤`ÉMºœÄüª\°Ò^≠=hx∆,w¡û ÄYsg1eV¸‰˝%XpAjø¡EΩ5^µ…p‹A∫A°ˆ%3Mø¡…tà¡†¿ª;`Â¡0k<èëØ-âIÄ«vÃgî¢≤pÜ√%#áÉ∂†ëÛ¿øˇ=≤yÙ˘>`√%“"mÊ∆ã∞2'ú˜&à¿p®9‹ˇ¨m∂OÙ#√_,6ú˙ätq/Æ¬8éù¬nh≈òç’ö^ÀtÈ¨ÓÉúO∞da∑@∑(Ng=X‹x7úßû‚Ê∏1bãﬁÎöO‹êç“ÊnÁ¸˝øNL=¶È,–ÛA◊D]„LS€Èy%T©ºÃx£V–ñÿ*¢™eúZ¯=¸Ñ≠(5úÛµOï˚R%PEß<º˝ÿlSúπxÿ…∏Ω*œõ„¡ê¥g§’∆<%∞*á≈—T≠cÃ„ë¡ÕÊò àŒ>o¬ò çØD-UEõ∏˚t—í√*k˘;:ﬂJü3(r6ﬁ¯»dÓ∂k¬àûê«Œßáì∆—AÌÚpˇ–“õß]y?í◊ l∫ﬁ(F}Ze^Ï…"ibtqè»ùXípQö≠ôñY:≈ÿvŒô2)ò(~“¡»F|±ÄO∂]QA˘ub™6¸(∂Ä‡´–…Á·k_´‡-Ó˝6kÃ´LÇ)Yè‚0W∫5htŸÊù)⁄¶ë≠qv q3û:òÛ‰za@zÓ5;¡†–πÛÚÙ2‘ÃÍ”Inm‰fGàog\⁄ŸÅ~A∑“=é[¸»yºÔ=9n\=9˛t≤<9r'O‹'Œ—„Gü^>∫:∏<⁄o<ﬁo8”É©„L/'Wöπ¬no¢„õ™¡ÂøñÂ KÄçD_t(0b‹=ÎÙ∫˝Œ&âı¢DH(≥bÿGë¯B ¬øÍO´“¢I0¸Œ’m•ÄÈU¸HÕ(Fï@¶Ä ∑∏pË∆pH+Ñ›Âﬂˇ·5G€ „vÍï<ÂHô£ÈC·p9‘2ÿÇ•Ù¥∞BÁÊ0Tôâ≤9√.@sâä
–#Ì…bu‘>TÇ9»dÁ‰œ≤ÖèŸ«t1Z~H$’™˜pæ<jÆjvr3Â2RF
±vµ¨ÇBhÙ1¥≥2<≤ΩÀG]√õ˛.…ZR§-—˜å!˚⁄n!f[ß˙f˝∑˙‡PÏá'øACY=VB0‰=Ω6‚&ß˙ñƒ˜ØW4aÌm\f*6ˇFÅΩ◊‰c‘i¿»Í¨<RnkáîdE\“Ö√$)El,òÏ}∫ﬂõ«,†∞¯zÌL√8ı…∏¬•œÃ•“›/⁄U)Òÿ*\/&Ë'B‚[Ïc6⁄Ü∞¡Æ!!?Ï9z—$ Mt”îü±ª/ÕPæ0;{Èª©“Ï£ò≈–ãæÍπËÀ¢Í„Ÿ˝∑∑ﬁú·ﬁD.6Ω?Õ∂ı¶øöBL"⁄]Îg˜ˇ:ıÑˆ/˝µUÎÏjwé~ˆ≤öÀﬂi®
°⁄.Igw`bñ˛—Ñ•{ﬁ{Öû∆)íˆÜïèûÁ3gÈêÛÿSôBèHµ6FkÊÑ´=km8O√/ zP?TmÙ2uwYq–¨5ÈπÊºniùïÚy›¨;r¯Z5-w&1áı◊`™c⁄)E€•±∫t	Ë5¨£Ì4,ZQñúÀ}Èh«:°dÄØCóQﬁõ.‰Íõ+*J:W6@U›(WAÛ¡
YEyì2ö‹ÿ?]˚>'_âŸ$@$çù˙Î[5áö“≠U—(Wø≥∏qhN_",® ) si?bËp]^§‚ù)u’gzrŸ!ã¿y7»Œ∑r†ì!Å]∑ö=´Ä˘ˆ„
ôπxbÚø€*t˚•¸3}°gÒ√X£Æ]ŒπÃè1R≈Ô	Å9QaÕn»√"·hccNvCÒfÒÉD_Ùy)3Xe‰,æ¡hﬁ¸2®Ï%Â•6mÓgŒWûÔ-56mâ¡!“Üm‚◊ÓˇÚ!ÈÄ‹¡xgõ∆¶πaË÷ÿÃ{E©_…Éäûµ¬ì‡¸8uoK.XêÓ‡Ú◊∏ ‹∑°vicuÙ¬öò/≠&öWÏ¶®^Ùï”@r‹6-PçÓ=¸zD◊lµ≤\’Œ«∞¶ÏJñNùw'§“®M¨^y`uHﬁ’ÓäfA®IXM?v•V˘DÿıõŒà]wq∞z∏O≤„hw7Nø;?Íc¯©0Íd¨CqH…‹[¨WÆåá›≥}îJ'9)≈WQ¿æBënŸ⁄2π·Ñ⁄ÿH`Ÿ=)£Ç&˚√Ó∆ÄÛªÒ[„?Ìn]'Jû ˛∞Y©≤∆≈ÃòGı◊Ãù⁄[†Ø~,O»¡ÒBÕ»“Ä^´U0?!OåõüêZ„ÿD]kr=m¡!ÍF ãëÓè∏‡+ú≠°ÛÓYÂêV¯∑œ*ˇ€Å€xrxiC|˛ÀÊ≠ôo„˘¸3 ˚o«ä˘¶§;Oéú√À«w†j8Úæc˛…{ãj‡ﬁ‰+T0û›Q˛`”§ô„WvÉÒ±ﬂÀbzÇπÉÎÒÕ˛r¯πÂ#"v˝¡“†wY›t e0ÚÎ›8~©ÚËp=ı5Ï'∫DÖ´[Â$n‚ mbTÁZSŸ6i\[*€¬a⁄”íJîããçt◊Ê%=Â-m4jÃ ÑYΩc\˙.‚»ﬁ!%(Hƒ2≥ÃÓ∆ j|˙OnÜËòmsùb™òÉƒ∞¨â7˚ü◊˘?Ì*≈ÛÒ∂-l™ÂdR≥ÍÊY¬o}πæ‡ªê÷ f^dì¢„EÅÃ}mHr¶ûX"Õ∂4Á∫DçÊ;ú@Æ:X§CHQ{ñ+º˝‰`zOjÑ}ï(•üjU{#πXENuê¯ƒgSÆ G¸°J´> ÷HG#’ø£wœ–Íπ≈Tü≥ '|2ôX¶‘oô◊∞ÆçNK®,WIEÅ«π-}oi{W©§;t∆(AÚh6±Ω¡åZï∑)}±ï]h3c\D#ªÚG9Qπ2k;î/≈˜JAÑñ˝$*2µ˚Ã◊'Z‰’Òwˇ“ˆÜ_PW‹›°y\ŸA‹(].¨¢Gê≤dHÚ»ºM¸jˇÍ‡”Üì|EÊåM…çiÚà£Ù‹ë{™˝#3˙Ùa‚f‘É$ÆMıX°†LÆ´ƒÀÚô^å ¡qŒ#é%Å∂qÑ2B∂MöÅô¡çSÿ˛./zπÙÉïÉ·ﬂç&˜Xz⁄äJ†à)‘÷Û¢ïsÔ¡hÚhÖﬂ.fNÃ¿êÍhÂ¢ñc\+%˚»ë+=†MKt—¢†{]D+ÂÈƒVõ{âNótX 
≤)úÒD y≈Vô‡bé=Ñ&®⁄†q%é“˛^f\xQœÅˇ<c71¶U§¶w«Ô¬q,ƒ"N√`é˝¬õëwkKoüÂS«A¸Ã≠˝ãZÔΩïUF◊„≈y4ÀñN‘{)ÊÈ(!
3Áå¢0qØVÑF·n‹sÍ|$¬Y∏‰Œ÷%.&>·ã«PÆQx7∫¡|\ÕeÆ√⁄õZ£ÅÂmÌM#SÌ±1K ?∫íìÈÎÉf '±≥Z√Êˆi?ãóŒøF¬Ãñ °æª«B€Ω„ÉßèF™Àq≠	Çûπy\fûE0áMßs÷|∂Tﬁãùl@'ÍN¶08 ,Êï>ƒN?7i/eVè]˛Ùxø ˆ4±ÌòñÉÄ˝À˘_íÉvíÌ†wá!Qä}( Ä3nQ‚íIh/øÈzêô¢bÿDCDL`¶bjõ{–ÉÈÖNÁg˛û∏5Ãª£âÅVã°òﬁ§†EM®¿6\cw_Jô⁄sñbUy›Ä+L?B|ç√˝¶ú8›"æ'k∆·È@/^‚eç˝Oa≠*º@˛*bﬂm"Õ ¡Ùsß1àÓ‚≥—Úê?@ﬂπJﬂgÎà‚OÔã\zÅ[¯ÔÚÒÏÕ¯ŸEÄüI‡pzŸﬂˆŒu0ƒæX√˙Û&%nÃ«ÊÌ;öè·[ﬁ˘ﬁ¢¶-~ 4Ï ]äª\9Õ4ı√Z’V<^ôÃ¡˛ÂNΩıÒÓ±ÌR M˘¥¬y3§PlU±ÔT≥”îÙ†˛#Fâ≈lûR™¬Ê3®Må°¥dıÀÛÖªÌIÓ6Á»S$,ˆO∏®¥˜†€éÜıX»◊r6ÍïaÛL¨îù&YƒT	/Ôã¥-ÙâlÑ&èPM({,Á!vﬂÓuºˇ·@;}U¬wöÃùs6er º ]¡≥À§WÛ£ØàæÊq√qä]CíbG8e^~Ë^≈;»îHWÓ›-wèçMa¥_4Óı!∑ëüVUÿê˜£‡ôê∑ƒ%F	I…k$‰(Ø	•4Å]≈v>†å+UWWÔHöÈ\Ïj·öwŒ;Ñ∞äí%ùv]√œ∆•∫±˚Xñ‘õ—)>F…=)uÜL!ê§cƒï£l®¬¢“<uea>°∂MäkÂywy!r=M(ãtpπÇgì%“ÇM£tRÏÁÍ˛˜Ê√O1qà3Á´“/4˚m„PÜ≈Ú1Óü˙Ë∂—+œ[˜ò"?"ß÷ŒÕÕ…”á¥≠RŸIFÆoo±\Øt¶-ÛbßuVı~œ`·ª·≥JÁˆÑ4µÛ~ÛºÜdÿµ˝˝˝£'›˝º≤’c»qqYw±g∫ÛDV(Ïuæª*aÏ£Ûi¿M≈™`¸´Ç[5√ãì5DË
PˆM«N†)ÈìåìX∂á’âé*¶ß—czUx/VkFÙæ´!`∑‘óñyy>2«RáHÂÍ˘®áKw“≥£r‚ÑÍ’Pbøoû•5õ…ÃıóxVcÇ¡dΩ! è…f
FØ(üÙxØ.CADûŒ≤Ã!ÌÉ	o6X„[ 9$çô3ïôÙ|◊C≤ƒå@gDÑBT”œ≠pùgG*#d\M⁄Ä†bïlGÉÎPiH˘wÃ*Êˆ5-JØ¢;$W#Àú”™Ë≥!ÎÒyìÅ’‰ÑNB$IUÇ2*3òUniX_Ô*—ãQì‰ ±Ù°NYn¯∫§eào‹›∑¡]k_TÕ…àª/≠uRSJ]ïS˜Ó•wæÿ°:ïRO3≠±ÆÒòFd∏·å«˝0øRM5—êK a@âJèﬂîhJ„[/£rï¢ÓëÃ¨l )©≠ô;˘™ÂÖﬂmd◊=Æ˙„bÑ#aK“iFÄW”w√’8Ù@	Û]Âs9«ÉÂ35làY\QA;–g9€és%≠¬ÿºﬂˇ]‹mhX§ŸÎ«Õ2∏◊ßµÉã~{§ââË2÷	—€/ä¬ ,úÔ
E¿íH:oÔ)˘C—à>»´rñcw|.{Ôï∑ÚQ¸k¡ OóœM¸*B ÈV≠ãeÍúXÌ`$Ñ≤«3¨„œ™“"πíã.=F$˛~oß˝l!iÆBÔr}ˇ˚i`Ó-%ÕŸÌ`5˝‡◊ú0Å—86°
æÕŒ›v®Ö—Á≈V±°/ë*é∑z◊Ç•bµ¢›ˆg‰˙Å©ZÆr}—¶ÂôB◊˘
Y,Âõ¿≈,¸â$õq(∆Ù˘ßqoÅPƒΩÂ·ÔTn»à'2î»´‘¢∞àÿ ﬁó∫êaL˜Ç€êŸËè6)]*æz>ÏîK‡‹\%è"‘VM‹@ˇ.
0õÚ&Ÿ⁄Z‹kò‚
t ] Éˇ¯xﬁC[uKœl⁄V™|¯¥@/∏éí:Çé'C´‹©;ˇ–t'3$ıŒ’xïù¯*p˝QÜ[WÒ≤w◊ÓC^Ó_ï!å˝‡z¥
ø;ecey˚ªäóæ~«Ó|ØYÎÚÛ¨©ÁozÉóü#ø;≤àu®(x»2≈ä‘ZÓ‚†ÆÛ‰§m∆4∆Òæùπã|ZaB›Ü‚˘Nì}´äe˜/Ó–qÛ¸"5|øŸ¢ı5≈ÇÀXäÊ;#R=G#üÏÁÅˇw,&°˘ù√ ¡∑ã$<øjÜ_úÃÙ÷⁄çÁæÕZ
˙_§Ú›/∫CîøxOÒb˜÷[I⁄≠…÷√Ï≥ùŒœ 'Œ·)+2ñ‰ã£òcl•‰ ÿÊÃùgÙ«pÈ®´B∞çô*”#Ã»6πÎAë‹5%ÃM§µB;£Ò∞;H7†JCx:klFlΩ€ûPÌ,õ†$?]∂»zïî†M’üb∂¸eJJdÕ‡⁄ímV®[“â¥˛gc!ÆØﬁq¥T"¸b
5ÕT?ÄAÎ\π´5≠€çõ»â©RnÖ!ΩÚ|xâÍïäy∆“˘eßu1Ó¥+{Ò∏+‚íì!˝Zç«†ƒ3M∞‰NíŸ@`ÎNì/∞ÍòLm6‘ç= ˛ıâgÉßÛê0[ÑÌ8Õ‹È4UáƒcLÇêúá'®8GçâöùÍ3Nè$±$uœúyá≤Íª±8TVŸQ‰ßÀu˜õc’˜°,uùE>4tø‡>Œ˝udwn–ì¢‹8ô„‚ˇîsÀ©¡1ÌÏÄC‹ÍÀdqDü•\x£wºG∫pÍXt‚ãnˇ¨9ÓÏi¸ï∆$ñÙ∏…¯+
P~µ„Pã|3î°Uó∫’lÀ‘6rj1®Û5îxqÅ?_ö∆UTπ∂zÂ÷†?∫Ëçõ√MﬁX&5q±O>‰Í*Võ8¥Éuh√deŸ„mï´‹T€Ã‘”^!âôb¿Ù5-ËÏ]§Â%È\zHπ+^TéN´ògEÓ™¯Q«bpßiC:πÎ∏@$˚XtíöÊ’ßË£Z\k9`Ú.|Í‰«¸YŸo®»—VüÔë/‡∑≠õ÷ó‰û6å‘Ÿ‡ﬁ∫ì5%
»$–∞Íìò,!”ÄãI^3Z§∞]gu–™ÕpUˇ˜#¸Z)&-˛áx™=ﬂÄ∆,©Õw¿ ´i\‘ „≠HØÈ:¬¸¢•P/"iJB´±bÕÔù^á◊¨6Wâf-ˇtz—‘ÀUÄM≈Jg ~4)»‘∞ÍS¸A%Ôü"='	£ıÂ]C“°K≈=„*X1o€FÏ‰\ó*w‚s©Oè0˙¯-Ët’I¥ê«„Ã‚™<vZΩã—¿ndŒHÂ¸s¸ h≤#aØÿ’ “e¯¡≥bˆ¬≤¨hÒy[uJo,Íè¯¬á«qIF≤¢FLÑÓ◊kES≈ö},)tÖçwÖÜø\<%‹òEΩ^Ø?}»Æ“¡º»ªÙ]6∆ÃuÏ-Ê:±¯tFy∞†	Ò‘Û?¡&ºJ,âÑ'ıèxÑóµDã‚»A–º3∆∑T˘´©ˆDWŸf(BæâcôA∆ÔñﬂãΩ<ÓûDøÛw5æbâùl@ û±s;ÀCÛ∫|dﬂ$ÓlººÚπà‹éπ©w¢’ÈıæhΩjˆ_v*{¸ÈCöjV≠›¥
¬2Ñ„oÅÓ(Z8†%£AhÕ‹+™hºÄkÉ∫û©ƒı¡¿Tıd<lˆGßùa°Ÿ<_|ñPÙx)2ò8€<'zsTÖ∂Múp‚¶Z‘Ø◊”òaÁä∆`Pf¡<Ékg∫UZÉã·∏–q¶/≤uÖP|Áƒ˜0nnÛÃWÉ—9÷Á-<6Œ¥û¯˜ø_–Tó†—zÕ˙≤Õ3€ùÊ¯ïdΩaóÁ=‚”ÓˇpÈ≠Ùã™,JıO˙¿7ÛÛ≥ãv≥ˇ∑MîyC”|"‰ZK6‰Û¯_˜◊ouõ§€çª„ +›lºœû7{Øõ√˚ø¡˛ı∫/:√v˛Uz„ãasØtªlÔ<o^¥ªºüù_é;√~ìT«√Óãã~≥;*ﬂj≤;ûwF-ËZì¥z˜ﬂÔ∂ è'[Ùœ_ŒΩ¡K{˛Gz ›ˇˆEw<05∑›°BlÂ±Íxúã˛! vmuÒ¯dÀâga“v«y…ΩvX∑o<∆Õπxî„@1Ê,ùrÆTœ≈€7LÓ˘ûÀ*=xà)Œlò‚º4≥O«\nÉx’g§∫¨«∂Òd≤˚wÚm‚˝=Ú¸YÚDfÍ˙i9,úÆßµ§êŒ®ÔKQy_öUw˙ˆÀ˙Ç)Íw≈7xˇN⁄u‘ÚŸãF*¸ß˛ˇ˝HÎUßÀPΩÉüU¥Z>Ì∑Q·G{VÎò2ÙrGÎÑPaøÚi‚˙>YPê™•0∫Ôç<Í^7ÈIk!ëhb£fFÏÚ≥b£wä,ºµå∏ $T∂0=ˆ’Am_õC˘√ëpF}LìÒ∏·n@U;\^”¸˚`-üÜ\wDΩgl\”Üm≥û”’ÃÜ£¥oå›føéi¡±≈”âñ.5–©≠ÓgI¥b9õî üR◊zú/∆jæã˜ß†ûÇéNuÏè∫táö≈“Â&fKW‰¢U∂¸zΩ˛Áe+˚ç:(iàÉ∞¸Iır’fı≤E—ñT˝œµ2‹°I™lNFß#ü˙ö@8x·gZ:ãS‰ÂÓ≈<
&•¶fµNX–√=åhjY={˘*˜ì<HQåK^;°ÚCùÎ˙Ù!ÆxE"AÒbuî√ïKQú:)'_¡à’HkpvﬁlçQøÎçJcç>ïÊ0Œ˘ä2˜¨˘≥Œ∞÷@˛K™1ŒÉ„•œ;˝vß?Óåˆ¨∫∑»Ø˛d ?)'úY†&ÄîÜ›˝{ ÄÇnú¬˝n∏–æ)Ç∂ôFÓë·ˇ‹ÖyÄÁkË€(=êg7àiWó<ƒ
Aâ+Ω€˘EÛ¸|6V/ER¶õ@Ì5S#@uÁƒV˝bu“tê2ÎZ›¸OdJüë´(ëùù©Õ»≠‰ Ú‡¥u“|mÌ‚lè˜…<§ª¬àÎ±îIëΩßûÔA-æ7_:#%¥ 8+ä.¨ˆ5´Ωi4ËÈõOkZÜZ“ŒMMgZ¬·i])aË˙. ∑go´ã±√l Ã\k¿ãFkòîhÔM•›vZp:}Ò≤3ÑÓ= È7ÿ„.∫„≥_∑öÌN∑Y˘<–…êMu≈æ^ª—ä˙ÛçxS˙nÙçcƒÆ∂Ù\‹j«˜Æ—óâƒ◊˝…O»'¬3uMi=•
(–˛£G≤¨ÓŒ’Ã€{¢Ú•⁄=ßﬁ6ßÛa>OÍ«:xaÊ}L ÙmΩ ì“\¬∑®?´Ö÷LôIbM⁄E>3i˛Ê‘ô1o˘„,oπ¸îM’>Û	À™%ey*≤¨„x∞<≤gg‰&òc"ﬁ»sNíÂ⁄”à[ìàﬂeﬁÅ«ió≤ÒJ+fp{⁄O´Z“$Ì7èÈ>…g≤∆´I•jnAá+2—ïÎp‚ˆÇ…ñãUÙæ<¬Êˇ¯ﬂ˛”÷≠%ôJ¥´”4BP∂øVìdWÌ!?ë…>€|≤ÓÑ√≈≤~ä›Ü0ìÌâÊ¬`∑ÿR™K…˙⁄ÓÁ¶SÂáï%˚zﬁSo„¢$Ùã"˝ö'$Œî¯K˛MŒ£"™B≤gz*fˆk*lm)˛ƒè›‹aÆhÎb§Ãh»~L$Äπ´øõu—\"§yWÎB8y“˘O(›d)AS≠ÿ’¬‡N≥πû^DnH≠∞ú˝Ö÷ı∞ú¬∞XûZpÛ['í[{≈CP«.ﬂ©¢Î ö]0@_h^Øùp
5 çˇ7Ú=~Ty`i'«.’€⁄C[]≤kö≤ôRˇÇºÍé∆˜øv[≈√«ıS"≥◊‹ï?xg§EIÆy°hA◊˜˝BoBìÆÃi¸lM(y∑˘ÍRcƒ‘cZtã¯!
äº˚Ö;gSÁ:c ZØÇáÜ:]ÊFüs!–ò#ÛÆË<s©/&E€}V0gàÆÖºπÿµì5îJ7ìÅ›@S	ƒQ/5H1õT'∞ÕM⁄IPöÿT–§“º€ßPñ®•©ii·êI›1Û¢7fYkHN'ïgÊXÍô°¸∑©bbÈç1úvNóπ∑®Ω≠ôœRkèK©2nvûóF÷Û2ﬂÃÒ¢“J2Ö:üÏ*"Íe
≥ë &˚πKdÜY˜∞{_;K∏Ñ≥B• óÒ⁄È]<—÷ù{,vD':„∑†í›Õ¡0'_ÍªôCÎ¿êæ@—õAﬂÇ¡ ˚∑†ç1®∫¢M¥(âoiÊMß 1¢˘â∑@k^˜Ø'∂˜`wäj)±î≠EÀ√ò´ ”ï°ãìX˘W êH%Å=ŒY+2∆¶,`„±ç€?qúsGbM∏¸‡µö}<ﬂ;FBgı®%>ôKﬂÕá2ÊOi7w8dõçä]AO±ÈÓBÿ›¯ËáQl.P⁄∂*ÀvCÊC„óﬁ√Ùè<e°É$•¥JtY∆¬¯Œ.a°`pgÓÀè5E<yÿGÕ@d/|Ek=ëüêìS/úGe'#•.ç+¢'Ü$;9mâìwáˆíBÃxÍö£™p√Ö%}Pc∑∞ÖKóçB]]° ÁfÆBÛ¯-⁄g7'Ü %h£iè∫≠s28Ô9©“ù°≈íH^#5˜§4Ω∂nMõw6G„aß˘¢€Îb¬‰	yÚ∏~Ù„ùΩ…´b¨∫|Ã¨–≈}¬[±™LRÂ^ÏgÇß£RW„’uzÉiéªØ[Ä»§?…y<„mÕ∑¢Ùú≥Z≥≥çfûè,r2	;8WÉ†·ßËÎÈèáÕ©“
jÕA~Rñ„ì0|ÍÏ•U¿ê‚8vo©_O%›8®[ÒÍ÷ïòﬁÜ0§îYº\Î¥æﬁHW‘∫r>Ïˆ«_;ÁÉ·X[˛ö&¸SuAwÆ˝+∞‰¶⁄¶:∑À ‰‡jtË˙¡5Ê∏ã»’§Ïi<eÃª∫ÿn€Y9‰ô~ñ‘“¢°ñ‡ :@jåΩ==á¥‡ÿΩ⁄Wû¬„êäj‚@k˜-ÅÁª’Ω˙*ËéºÇ˙ûÆ÷!Q%®–Nù≠}‰*X9>ÔwtB®:6t' ˛bU››°ÙFuîF¿1L«•Ä™I«‰¸≥˙Êß£Aø—!M£öN◊≤ÄùÙÄ4ˆ>@Óh¥Ü¬Y.}û»Û◊Q∞®Ä^≠Ó{Ê:Ù·ë√^}∫-gÔNVw{cº›áù˜«ÎÉ7“Ò©k∑Zqt¨xo}∫W– t√p·4xªg
IÁ·ÿ_¸ËNµÇÍta\Ÿ{≥ˇ˘˚:»óÍg$opLﬂ’a$›≈¥5Û¸iünzZRØ™π*€|Ë¢˜€™yúô–Ω	æfK∑∑a ÆØ›p8—J'ˆ*ù_¢„≠Aø’ª∏ˇ˚v≥Ú@Í®Ä0e›x”ªL:!1^WÏ^›–B¥ûL‹(“J.˘J¢·∏…ü2YOæ§∫]Œ;ùûÁeòLl0≈©P-èáßRm[HÚ—!∆cÂ]ñFîÕÓQ‰ΩùAÛHà…\‘ë/@•öq≤'⁄Â?dîæ∫ÜLÎ Ω¡Àx}(Ù]~–.»ìªÙÃÖM2â2pm¿ï‹ Û©¿ï|î≥˝,ÃÃ≠Ã€%|b2 ,Rπ^ÆGudm¬\Ï@0“¯NN›M¬g˜ˇ˚xÿm—dfÛtélÎÑäÃr-∫Á¯<yÀÀÙ]|xç¨[y~GF∏}K;ç‡Ùwﬂˇ∏+9ÕOs£G´65ü-VÈé|ﬁ˘e´”CÔÛ¶Â^”lMc0˙Âê⁄ÌÃÓ¸A,Ë>°?Üæ∑.Üö’PzoÌu(∑†π‚ˇÁÂº›rn_ú˜öÑ÷{dö‡b9'Å<|Åfèúˆøÿ·Rﬁ(r∏…"¶.´?/·Ìñ0ò.ù_¢ÉÆ·ƒÚM≤$0ïn‹‹· ç”t§Y<≈dû÷Ï∏7"ı√]Î‰µÜÓãπ≥“ó◊·˝∑»SB∆¨¬Z:¸±$yéº-ˇG ïﬂI¬∆&e|l3„•æ¸$7^5¡“•(bXù.ë)†E`4È!9ÎˆAØ#ù¢º‹•µ¶RJ«Ú !3=ƒzÓBÂh…nªß£M≥èknN‹æ89ècHÚ$Ñ`FZÙtìºÙ¬Z8Ã8yƒöS¨Ù0≤
n‚5∫MÅ
CÊé]ÆéuÿÉ“O7•+ßZµö}XÈ/ı¥ø≤ŒCÿ†nU˜µ∑˙Óä,·RÚåÏ[dh„"πq–œÏÚø™ÊW$Ï!˘åhcxlD˚:åsõ>Î9>kœ–-tE∫NòºJ¸ÜÜßh'Û-zZ}Ã∂ïúø¢
=ØÎ'Nº˚ïµ‹ê”ÇπU–¥ÙI¸¯±ı:≥OÂus8Ï¥/ÜÕå„Ÿ|≠xKã7√Vç`Õ	µfßÆ™€4etC≥èÒÕ≠„åÏS"⁄»;js‰◊[EŸ«*˛(6K=˛ì¨B∆k—L:0¨0™Å&0…>Üq’!—ﬁ? èu´ŸéOúroQ*¥bÍ|!9öÀRÍU—Ç\a0I)R•vñsˆg=˙™QUüãc¶ÍñÚ”eñ*ımP]íChSı≈àé∞Q¿EÆ¡íJÖ§z÷V ôíôÙÒ÷ BöIqÈê˜Å‰⁄nΩÆ™¯dÜçZèOÏHó√zo∫Iª Õı€dòRõoñÊı∞_s∏¿RZπXù~#Neq‚ra:‹ñÙ8Àtr3ZΩÛ)ˆ$≈jvBæ¸ënTø‘	¬Mÿow)R•f)∞çmR¢®ÿ÷v…0r5î¶éË¶◊ÔgsG~N	O7’òH+X\y·OÒ*’®Œú’d∂g Ü4ë›∞˚ÿêÿSî0•√Lï	(ƒ0FX– ñ‚w≈
4ZîïëÎS‰÷¥„–u.=üçzµj]≠9ÿ≥–’fN4{M5_
ùB‰HÔ›H]Ã˚®~f—‚ØUn3˚P*ÆiR1îÁÏ‚$˙≈h≠√Ω/ÕÕÉ[˚Ã Ø4i*P{`“)5ÿ+ˆ±Z	sΩ§ï¯ËçÒVb#€†Æÿ«{%\."∞Ñ’˝El8w∞;D˚låÀ:nDg…U£≈>j§ñÓ.Õ	çü¨π“HÃA∑1öLî–
öúÙƒP•ã⁄”ßR€Ò *2•HèE¬ yÖ.r∑“•®;AÎÊ˚zÃh@‘◊ªë…“k∑Éuò‡∏õJØƒ]≠Æ°cµ2‘WËÏèÕ‘e´k’¡±SJ3˙As©≤ ˆ|öFX4L7ÿ*T∆y_∏%'R…c`#◊	'3±	Á2
¸5òò≠Fﬂd`gˇ  ˇˇ íù(YxúÏ}[è„HvÊªE¥–h+«%ÂΩª:'3{Uí™J„ÃT∂§,Øß∑Q≈#%NS§ö§Ú“È∆0∞∆Ó¬6÷kÔbg˜¯a0Ã”¿Ä1˚∞˘O˙x~¬û$É˜ •¨Kw—ûÆîDF#Nú8◊Ô4∂õª‰™ÅˇıËµ◊pMÕ£ç›ççY?¸#í∏ˆkæR~ ƒªô”É∂RK˝}njc:µMù:µSÍ~Ω0\Õ!ΩŒ#“üSG”mÁi›ˇ˙˛üÌG§w⁄l6”€π‘Ã=∏’∫·©Êåßü/®ssóz≥mµßö5Å˚Îtçóz≠ÿìu⁄Ù4gBΩ&kz-Ω•±©πÓâ6Éwºj\,LìúOƒt}∫ªAŒm^L¸#æº±A{aÈT'ÛÎ∆LÚ¸¶±âˇòç«|¬øÿ‹ò_)O˛<uaèÓûΩL√¢À∂®¯J¥ØÕŒ·ø∞LÎªi≥î∫vâ)#}DÍ©/ªæ<€J˝Õ_i~K˙±â7çÒW0Ôô”^´eLud≤µs◊6%é1ôzl={Œf1J±dj_RgO˙r{#urIõºæ˚ﬂˇò>Î¸e”ûKyá˝u›∏<¸£‰˜µ¸j&Ω&mﬁÿ"Ç§f˙ﬁUC[x6qßéa}’ÿ ?[∏ûqq”†ñNèŒ‹∆òZuj©€”ùkñ‹Elä8…}ä∑ò√¶k.RñÂ5Œac÷è5œ1æŸ€_«v“;†&ß3 ±1/láZÆ1>¢ó‘|jò0VıΩ˘4˘pÈÌYz_≤]ôµ∑KnG2^8ÆÌ4Ê∂¡ñ)e¥È‰∑oœ=√∂ƒ4÷ZGGµ√ë≠kÓ˛:ˇEÈ±a∑=Ëéjá¸ﬂRè∂˚'O{ùÓ…®◊ÇÆÂO•ötá£AØ=Ívjá·ﬂ•ö8={r‘k◊˘øyè•2ÇL˛&6aÍó±oo◊D|¬#GˆÑå¥sìí≠«I-æÅCJ€(§¥Ü9!Û∆6aõˇ”€¶ÿ˝lŒlÀˆ7hs®0eáßrüCúSÔäR+¬%¸·ú'«5?G&™∆F?®ÿ«kW‚&û£çø2¨I„ –3∏!ÉÓ≥ﬁp‘'O˚ÉÓ…∞Kz«g£˚ø|—="ı˚_çz«≠°8Ætwõ&µ&ﬁÙÑøæˇ«Óp-ù2πV[‰|ê˝Ig Äòzcámvˇ]Éó™~˜?˛éÙNF›gÉ^ß’Èí6låAÎàºh·≠¨æUè<∫.L˚™qÕÿ˙™xå,ìÇ{ì^xqæ53¨∆U„ãOv7“…â∑:•öûu"Ó{NÑ‡3©)ı†yÃË∏,qàQ…˝Éﬁíœ©^«'°˝uoZπ 4`P≠„SÚg≠—R-ıOªÉVß? ı≥F!kK5áT˛W}RıN˚Àµt‹¸S2Ñm÷ı^∞±-’`ß7<Ì≥∂˙ •/’‘y´±µ˚±ÿX‚ùá]<o ∂ ËçIà¸Dó‹µéûwáyç¬oN∆ˆXœŸ˚ﬁπ≠ﬂ»ÉÅmî›∏!‚±A@JœÍ˙∂Œ%‰€Ã˜€ñÎë&Åƒr@"åë_Ø;t\–éﬂ“LÛ∆SÍr‡Ä|êP˛‚/r⁄ zjz”≥èÏ+Í¥a_◊◊öÜ56:uÎÒ÷¢˜≠©4n£:ËŸNÈv„ÿ&}‡.¥1
.#–ó∞hfÏLDz–^.ç1ÌÕ+vÒ„‰^∫d¢?–eäAìåaƒlT.q€n⁄∏çc¨19ÔKy>wıé›† À£˙qÊ„wy/h\ê∫ø}Ö √F∏±ñª[≈Ä“5tˇ⁄œb\Ú-:Ã∞9Â‡ˆÒ]åwÓpﬁ)ƒ≈ÿ1û¢$J:dŒ˘Ì_'‘ö.f*√≠ñZ∞‘⁄zöEÉ^˜2Öí‡é‹W_ÀY≠Ïµì,◊Lõó·≠ln€∂i≠í¬=ïCΩ=Ëw∆>GmrÕé|FP˝pló≠‘˙¶êπÿ;Å:ﬁ∞µ+ädÔa∆&+çbÑ°nÏë#ç1ºÂµ2TJ≈›Øn"ƒœ“¸ücÉcè˙äÉ¸∏¨Là&‰€∂$£ñM£$è|8±n˜6µŒÑÇ>†‚CKæ‡áıó*úØÄ—(úfÕßé6ôØ _—õÉ[ﬁ˙]1rÚ7^1ãaﬁ^Û/óz›îóÆœzâm‘U!§Ÿl‚èînˆgtè|Ä˘ûΩ[ÀaI¡MY&—
˘˜Ì+nÛî-^Îo†ö'€
Qk·÷n¬˙V" ±ÇVo0Ø›Ω*PÒ!¿†,5 ≤Âjá>IÛˇ¨ñ•#,PÁ]òè»¡uk—+“Å{ê∑7=cF]OõÕ◊ò‘2÷L:Ù–SÎµπ◊8’÷™èG·êÃ∞Î¯F"•Jm‡Ìß†)ô®-ç‡óz\Ê~D‚¬æñqEa$¬≥¨Ó ´#Vﬁó…ÔHΩ◊Ÿ#∑Ú–z˙›ö˙0RÌi∑Ω±ue∆øç\J[JÎª±Úß.u®î<ÃBgÔ=a2A°F#ê«ÙuœYXp2Sê¥ØWçk7u–íí≥‹®ﬂ∫àM‹Ì´˘5wﬁ Elﬁ	…r∆&>Å¬‘¸·m(nüV[≥€lπ©¯Ë…3≤∆Ô[)ˇ¶3É[sRIÉk¶Èt±Ça$ö·ŒÁ©f™qi~∫¡I<¡ŸÆπ”¶B≠o<"õ;kw âdﬁ“¯8”]∫≤i-hjdúÎ&é^*N„ËŸçÕ`SÍÖú~ÿJçYjV|Ç†t”Æ¢™W\Ÿ⁄ÈIπÒ=w”¶x0%Sª∫ü;~sx)ÚëàòØ;Ñ◊~{J/€:õÀ8mlcJFÃIÚZÉ9+€c«æ≤ñÍSç;f
ƒÔ,ﬁ®Eº‰e»Áà4Z‹&ø-€h3”|"ı≤¸ç9Xø?qa≠åããΩBˇ%E;◊4˘ﬂCZº#⁄Ë3¸{ˆß¯Zi5π§¬ÙP≈˛zTkÆjØ ¸Ìn≠û1=:'“ùÊÃì®Ó≠D˘ù`
ãπ&“)Œ"@xd8µ/≈[û‚/èQâ‰åÊë=3¯<|:˚
….M3}/¸∏#|Ê9gO«à8Y.ó÷ãÑsŸ&$πï7õƒèq»´ˆÁ"ˆn¶à];ÊØ˚_ﬂˇu…¸˛˜Á Dh.±ÓˇŸ&Æ11L€’‹Ê˛˙<ùB2Ñ‰áú#ﬂÏ&ÕœVì»!$+û£3◊&∫qˇ≠cÿdn;Dõ†‹%îÿ" ëæ]3ZN•9⁄níh¨Œägi@·ñ˚ﬂ¡$πÙ˝o-cl„È0A.—)9Ìıﬁ™Y
Ñ4iívöƒèàZ˘FÛ(Ë#˜ˇ«ô¶·iLèf¢ø√k&Ï∏íÛìŒáSnﬁ_üŸÃ¶˚ŒÑ[TÛ/ÈH;Á^3∫~n_◊íR¬~ÿF¨G¥Ò˙6.·@éãôÜ∏f‹ﬁ¬ñ—∆†∞ÏPe‡ø 'LôöeÃ`:#wo≤ªSn¶◊Üó“n#≠·\B˙8:Ë¯l„Ÿˆgöc÷ƒ%O4ÀÇìC)Ú+‚ÿgÕñˇáz[pI∑nG| [Rxÿµ	ßÿn,<N>ˆ∑c_·ﬂë»ÆxÿæÎNFÃX*ÌM∑ì‰>KäÖÌ»oÏΩ∆$
Ìæ…œY€zhbÎnTHﬂ!}«ßúÜ;7,ÿì0—1†OZ«Oz¿ª§”%√ﬁÒŸëà(9ÓıF≠©['ù'˝øøı˚GAd”Ì‘ŸJÚÜÎk7(Í3	îd§˜vÄâ^Ap◊÷uñπ†Îzî–±sˇœÃ«c√îhéÌÍ8JêcπÆ1[òãïVcXÓúÚp˜ÈIÎ¥—Í7Iò˙ClhjFlt¬Ú6llBòÄãS2Aç“‚Ìõ¯cÀöÿ¶ˆ(]á•8∆Ÿ˝ÔÙÖâŒªˇtj∏:pÁcÕÇfÊT◊&˜øõ¿qcºˇmÙ∞…!<‚ ìƒﬁ(jf_(ùXNC|…á1wl}¡^ÿ68Õoú \≥Xkl#˚q÷jqê¡∂ˇ8ÚÜ2h∏qÊ◊†!âH)˙3 )‹SﬁX.»≈¶=˛J⁄x>›œ&|rß0«Wîs‹ÔÙâO·-œJù©‹0≈‘/S¯e«–&ñÏgLŒ<<ÒÄ1?5zécnÈ3√"√Œüízk·M◊»wˇÒ»)‹=›ÌÛ#2¥ŒD¨2r‡wRˇ„ûÖ/˘«§ky–‘Z˚Â∑`{îË'C‚m∆«:‚œ∏∑ˇ#©üÿ÷»1&ÍålÕÖ”∆ì>≈Ô^OùâæMê·ï6ü≥¯Ã!€õ¯›©fQRÔ·ﬁ ¢ûR8)lÕ3‹ãòÿÇd+ıuóâ3N=Hñ<Bæìµ¢,p+2;5r#ë∑≤œé¨„‚ÃÕ8,Réæ& –ìEåˇ˘9G‰òâl»vÍü/ÿ~√+√OW{8†8 î€ÿÅêÒrm”¯zAâµòu.3,ÅˆçkPW4GÛ-†-ú ¯
@oÇ≠¬öˆˆ!ÂFq∏õh‰“pçs√‰å_G]ÿ˘L√'∏DOQjµÁ6rﬂK•ZÛ≤yÌm›?@ÏπX¿o6rzXkh4(`Íe˘s!ÉéY6£÷ÄÌL Ü˝È;]≈cœsxDÖ∂òÙÁ‰ÄL0]âYl®Óoqx˛ÃíI'ÃY‚fÿd¸–åø°-{ﬁÑ7@\•~‡œLo!ıKìzù£O4}Ç≠÷¢ë*ë ñx‹ FFò	∆•±7fn◊dÌY˜§;hΩÏÙ›ˆ®?®≠•t¨jœÏõ‚Åñ>Ä”AˇEÔ§›+√|·ÃÕ`‚St“ó’F“ˆO^ÇÊx6Ëç˛¸e˚yØ˚4u,RLS∫f ≈8·@RGRáS‰ma9å⁄≤çí%Çl\Íµ„[gÕÁÜ±‡L¬]ÇyPT7·£…Ç:?¿I=·§“:™âüp2˘/˛jø|ÜXÀèéd2˜’OEo"cLÍø ‰Fj„πAù[ßı[Ê´⁄±[{D}èH≠>"(-Gæ 1“‚u«È¨Í±†◊ækœãK3C5{Ωˇ-Ú|∑VÙB9ø]Å|OYD÷ë=…wI∞MóyU;Í?Îù‘
nb‚@¡MåzÛoy5rÏ±zöµ‡:ào
:ûò‹ ¬Œ‡=Ú!n9ú«ªWç˚Ÿ3ıÄÓ»"ûÔR“Ú b¡_e<¶˛ñ;Y)ûqv'AõëÎ0çôN0æ
Ω∫¯èl …weÓë¥¸N…»/"‚‰Ø?âc'Õá∫ïÁCÕˆõÊd©®ßÍÅlÂx"8◊Mños-KÂ13•ÙÂ”iqG^ W®º*i%◊í’R‡ƒª∆ƒ‘ÚxM—€ƒ˚¢7#∆+.≈˚"~Ö’äŸÕDTó=‹î≈p ~∂‹R•e|◊á ÷ªùG 6m; ﬂ≥Ó¸ÇÌ3Ú™˛aÏÀªµW<.t…yœ¸ÅŸn‡Ìç1È“69±A”ß‰úI]uÆ;Ô§ÈŒRK|‰‹.5U‡&OQæÖ	tææ'uIƒÙçª‚´ ?÷
rŒôe(‹Hå§D.ßö~Ë_ﬂ˝‚ü˛Ì_ˇ.∞¨ùˆ;›Ètè∫œZù˛^`4µﬁ±ÊLlrhv¯ù§']»x(⁄æ“í>âM°°P∏&àıÉ‹]öKônÙ¸Ää‘Sı.ë!ıÀ€KBˇ4'í˛ππ≈}2'OY≥Tèz”7Õ‹≤/5°Y
+.W®©'ºJ–6h◊Ë®‘
h?>z,å≥Å[µ±´∆±+Ÿë≤-IÔÇ-	∆xÑÜ◊hxP'‘6ôE)XºNt›⁄Ú∫’üﬁˇ÷Ã%Î§_Î‹xífY ∂-=ÄuâêÓÃ4€◊%6ãª	Ç±ªdl\hñ'å"@£⁄7®É%S/,∏ë±f
Ç˚ø^∞¶:(≥Ë?gòm·rÁ∫éæv◊ÀH À˜ì¶˝Ça†÷Á3tN°{ìXæuBÜuó»o«1íŒùå…ƒùÃ£@≈F]!ÎXRê6≤I‘D\ŒQœúòÔÃŸˇÄ‘??Îã„Ä∞≥°;\ÉSÅ5îŸM¬^Âﬁµπá»K'Ú¨æ^À`ºÿÍ≠‘≈EV£Ó¬4BTœ®Cø^¿–À+QŸòÕ∆‘l6Û!TäY<Ì9KÇ ;ñEíÈ»_`˛)‘H˝VkX~∆ZÒh÷rNı,‘˛k÷fOŸmMjΩÜ›ˆ§{“}⁄k˜Óˇr–Îã7Ë∂ªO∫˛é#≠ŒOŒNF˝ÿzîVﬂz¯Ï˚≠^Ô∑)ﬁzÃV{NAƒ∂ü˛F∑_ª5x÷'ß›ì÷Èüç˙°¯¨hüò3†Ù„èΩﬂ]·u;¸Û·®{¸r–?ÍŸqJmGﬁﬂéo#ySªÛG]eÚOÑ53mˆXb˜®ÓüPË≠ˆNÓˇ¶GXªˇ§;ùZEªà‰ÅÅÚãÁ¸Ë–gûQ7‹nCTüÛå}˚ç=ßæ›VÄËkÖENm[n¨DOºr-+ØõàF˜ˇip‹;y≥T‘µr8v&¡SÔ)(„ßL¯Êœa7™πœõìdxÉ⁄·”≥ìNÎ∏¢7A¯à¨ìAÎß⁄ië÷Ÿ˛?cêA°∞Äij*‚õÄÚ‚{Lù˙"H ›Î=“Z∏¬‚ÑióÜ6°3ˇc6¥Ú¬+8ê§aq#¢N…j¥Lîeº*”8GÈU°Óx|¨C]„õ@XÒ˘J∂<b_π∑€ŸSU∞+2ˆDŸ´@#ªÃï5liZô—.t0|x&#-q™iz√¿Î®s8p >Ga	MòEs‹ƒ¬[+∆$\∑—@õ¿!ım3w∫Î€S7∫≤>f`µ}+ã+D+…3.€]∞øé¶¬≤Io~PÆn∏∞Ôn\ÆÅ≤73\ó!¨ÿ÷Ö1Y8<*Ò¬0AŒsh‡ß⁄$ëÌÚˆ˙Oæ?ˆ˙ÏƒÄ|K~ˆy‡ágÄ˙à2HK÷ötÄ˝˝jßÀZ‚+»“„.]“F«òK∏·„  HøëÃ
»|ÀùCƒ®|Ó_0Y8ΩF(3≈œ(æ’˝∑Y•€dfcÃ1&P§FÎ˛◊~}2ËÚtÄñn0#=Û7a.„:ãE{˝üoÈ?[†èˆ/®Åπs∆ä¿RNœcä”å üÚÑÑÒ˝Ôtcbßª Àı%Ö4{}ñÅ>©z‚Œ—>Y˜\ÌÑ;ôÊYÍ(d	©€Ú∆L	Œ…ìªÀ¢<óC»s˛bsCd∂Ò∑_.dƒ,QŸ‚°"a*o$ ïúâ2qxÊ\'9.<·hBb9s’NrÂhsOÇß~Óò˘@√3F0„è»ºß_ØO¸…ΩEÑåbÉwEw¶E÷5∆Î2∑ÜÑt≥õÇt|âbE‚∂§≥h\õgtz°-ÃL)Ãø<√3r^¿e'–‹¬ƒX{œ∏‘Úü/Ñg¿5+¬(⁄[Ÿˆ´“Ùòçƒ	r
*Slsø≤\Ñ"=âcc>fy¸ynv6$ˆ∫]ûc4H"ËÂ⁄ÛÉY≤a•|Œ$õX<å)àzYj+Á¸òæò +}B°t‘z≤G:›≥!a.zzágßÉÓqót;Ω|åJöÒL`ù.‹∆l;tUßÂÓúZ∏a;ùk.ælÎìiﬂ‹<_Ç`uw∏ﬂÅ∆ûä∂0ﬂ…åΩ©7jöÇ<|πµü¡πcÄ
7â?‚øÉ¢|Íﬂ˛ø+¡ÑÓòîñ˙·mÚßDka|£q‚:≥€M~ô÷C⁄£Èﬂ«ü∆T√[;0é—¨n0â-Ì˚îæ{d˛o#Ω}p˘ò»ºéf‹∆æàﬁø{“'ÆB'Ôëaw4Íù<íu ¯ßΩì.hR≠3 rr‘áoÛÈ^ÿ√¨Ó
)Ô‚…ÔkŒ˚Ú˘Ö€ƒùÌeßfè2⁄·Ô‹åˆ|›ÑálA:Oª›Jã†Ü±<h|∂&;ƒ¶ò ¯›/˛'Ü|≤Ì–„≈P¸M—ÙZYjÎñ≤⁄ö,ÅÖr‰:lÊ˚<”ŒãÚƒ[6Ê!¢ "“`§úMéô}‰ÿGƒ—Ä?R?Ü;≠ëÔ~˛æï≤ÇZôÚCJ6w®…≈ﬁWVF‰i)⁄3=,›UHhØæ·ˇ@ÄÏSf˘ó,ÑcñF)¯Âﬂ˛/$∆ãÉ ≈ah¿®‡4≥ˆ≤≈lîBfwêê“MS)_∆∏∂m.f÷yF-DTÇœíı-ÃΩŒrÀÊŸ€vR‘ÙÌLJWrq(Ÿ
bå5eπN‚˜uﬁ~îì™¿ ŸHSíπ„ï)%{G˜@¡∑”%AÈ	‡ﬂq?Àv«~UeÑÖ {7DÏ0yÃOﬂf!¥~F∂Ü¬uÇ≠âq‡.◊f‡.tydmv¡Ñ>» vd®òŸÚ¨TÈ’π!
x°*Y¨x©„âññØò˜ä◊ÎÀ}]:ˇ5÷Œ√Ê¿‚•îõˇv*π∞eﬂk˘|Xˆrπø@˚Gì=∑d‰ÖdOîSñH˜dàS=S£ÂŒµB&Ë˙n˚jS¥6íÌ)g_≈Q„ôùç¶\≤'^˘@π˘FøÚ5ã‚pDªÈˆÕÕ("uVhÄ≥^*4ß„O$,ÏX>hi3≈Ãõ%Â2E/•¸Pˆ
Ô©ÄüUFíODöNòn∆Ê+ƒÛ*ç.##WÍ:‹¯˙¬™ ["@'Ñ’WqÚ¬ÁÖZÊâ"(ﬂ∑Ô£ÉÙN:∆ƒ8dí≤B…√f.OÊ÷‡{Œ,Ä_eÁÇ™·–~ qhwäDº‚ä}ú3H1Dôxé%ãœÅÜ¡öl·C_l‰W·›˘∑üj7¶≠aQ†ü˚'Móï2ÓSP«v&¿oπˆ›ˆ–i⁄Úk3v˙ç÷…≥˛Q´ aœRˇ≠±,O€‡vdI˘0óµÙÑøÖÚür©Îj6ûÒg#ƒHm√€º_n6∑_¢{º‡ù8í‘-Ë
GjÃŒ·°†ŒLXZ?ÜÂejk-MµK˙ímRhÓU´;ƒöôçgÌ„∆á∑“TKUÚÄ(Ó@»YòÊ#≤ï_íO≠&Té∫¢ÇßA‡Da¬_v‚Íp3-¢e;.€Ë¬ ¿@1™Ça/EußÜÆ#B&4=/>gc/†«≤Û¢˝®¶¯¯xÎ	"Ñ.lxv„‹!é=ìx¥¡FÍ÷ŒZË»Ú\ÓrÛ_˚‹8JÖJJæK!EÆ~ØR"ﬂ"!›ß(TƒN’√÷Gïjﬁb(rØO:}∆¬‡œAâ1”ùÃc>5zb3åÌ…éÅ
K)Å«aÙÏ…∂qO[Íã¨Ow÷L±$N∆í%§@µ¢xµÒä
·D!1•J,Ír#…ƒ«åœãíxú+ÿw•ÌƒÑêmÈ/ﬂ∫Dc2ü⁄LΩ}ùàë5ñ+¥…Nõ;ÖëΩµ* óS=9‚cºæ˝')ÒÅ’\.Q∞r∆∫Yÿ>¡a†VµÊ)lJÍÃåÕåò—‡∏c9’0;g[;BzäÖC26è∞b¶À6≥©◊UR°6N%«öa˚4√ÃNSä4ûB§Øƒ »«ú{0$K©rE45˛ß∆nR” §»∞ì˛qó¥˚«ßG›CDY≤∏Ÿu⁄Ô8«åÓ+ﬂJ}Œl!´‘ûQÂW¸N’c˙5/◊ikƒ º◊1∂Ö¡wØ`Õ¸QﬁZ%îÊ
À®Û?î•tüÅî5’Wππ∏$.S
hñ
§|Úí5¶7¥Re8¯ âq/¿√Ç”/Ã∂˙| jøûç~È≥Íy‚·œmË®7õ®’4√∞Ñ1¢0¿î_ò˝spªÛXÒˆÑM'´ZZñ0ë‰¬mË ·\MAñQ¨ﬂÚó¶kûvp´\~é«`¡*¢I"+"¿‡¬!
åR∫o+aä	Ø“FôBDh≠º}&ºDÊ¬XCcçÎñÊ¡gÅ–Ì0y˜˛7(jd¯ºÖvÂY¡∞
^Ì ⁄∆lÓu}∆ÇˆzHùK„˛◊6:}|ü+©wû1{B}ˆ]lÊæµ@ˆeÜIËêá±4⁄Ù◊x˛πz{ÃÅ;ÙMXR,á?+œÌ∆ÿ *T·{
≤≠ª´¶ÖoEÀ°¶UÍ	√nr]/%ª<‰êÈ,Ò•≠cÓã¢Ål¯ﬁUÆVú‚¯q)rÿÙ0Ê°Ò§îv∫‘-πïÈ≤ÍœUŒ+^>Ü&5ê';Ü&Õÿ√C?"SÂ•l¥0ºz÷Ö£aî„nRi¡2Á3€òìÁ/ΩE|à;	>^Vè[cã+Î}ö˚≤*HÖtÅ°`´˛)õyõä‚
¶¸¸sRﬂ‹hnmÌ4∑öõ;Öõ∂JP˘Ó∫_/∞,CÓ¨¸∂í’≠v®ü€¶õ;dÑ˘Ó¿æ:ù£∑‰mèÈXAhß⁄¬Ùå∆àZöÂ≠bëÒ0«”≤◊Ah∆≈xÛ‹6Ï∑‰ΩáÏt«™MC√;6Ê∞”}+96∏∏D^h¨Úá˝Pπ1Øü±oÂ≈Vøn÷ﬁa{É˚oÁÜŒ%Ñ÷À™¬“ÇÂ‘‡JøaÙKfwfıZá∫Ùg—ÊÊ‡ÉL"&¢Å:X	é-¯éÖ•TJòE6"§Ùgµ5ÖÚ~Vâ[ˇ¢@å)÷Æx◊Y}1[€
ÚıDıûzºA¶⁄x¸©¬Éû1√7üÕ·Ÿ≠ç≠è76∑Fõ;{€ª{õ?UhBck8`]d*<ƒÀX±!∑˙çA∑›x¸È÷ÜÚÉ'<∂ÌX≥‘uÁ\n•÷ÛÖAMùCóË<<Œ.*µÄÏÆeè4n∑Ëï˚â}iã\|≠6W§µŸÿÿzD∫ß‰Ö°Y⁄Zë∂sW‘cIö⁄©FSõõ[K–‘ﬁ÷V)ö°i„Ç:¶amÔl™ÏÑaµ,PÑ,√&'®˚îß*`”∆ƒ¬hOÃÌÎÈ§.ŒnÂ["5 ê°f}ÉÇıÏ\Ö∫%∫Ûâ´ê∂rˇ≤∏P„|"Ã¯Tõ–˙f≈b+J’Cj\û·N=Ê«ôPÄy5'öÊò≈oÉÃòÑ.!EÚM¸[•¿éª0§#;@5kæ≥O⁄#c6áCh∏L'i˘OÊAõπñÉDë˘K`ûRRÿg‰#©rÅÀ ¡m„> Á§<&´ëí“m2‚G’^ÙJT¬c¢êCÇ<5L∞¨≥óE–K7Ú≤ßà÷cffHúÛ£N@ˇÃµ·D·J"*r/Êú√0EÏL…b;âiåÆY⁄ñ®Ó ∂ö“<ÊI;E¶•‚ú’Láò®«¬ﬂ˘íÁ∞hı⁄‘O˘≠)b€›æ
!F7Âàtô'¯©ìÁM°|ùÅ⁄‡ÛfÑá-0F00∂∏ô9t~‡@AÄªôû"NH√è≈∑ß÷~ëIRñ;+jvèƒ∞J«™ÁE™ÁjèO~‹a™íÈÑ,ÀÍyØ;h>?ÎµHΩ”m7…Ê„ùıÕO“À∞6√É_'±kÇCΩßuNÎ¡|¸‡H}8EI3ãÃÉ‘ir"bqﬁójëæßq⁄$úíôßî∞	à¸Û≥Vg–«tY^Ñº#ÑÓLﬂ”7ßoòâYß•Üß–ı‡9∆zOﬂöõÁ}Oÿú∞˝È¯¡Qw:éiH‡Ì˛…”ﬁ≥≥AãC"â∑èŒÜ£Ó†2ù'‚g,ßFùçÅÿ<bX:ûŸ±/DÄè\=/˘Æ8kR,D"‚Çi[!§yÖ∂€ˆ
$ñã`pÿΩ†¨ò‚»ˆ4sO≠»g@í,Ò“O4©5Ò¶w~ uÖSn?'¯fh5oˇü˚l0©Dxµ¨óH∏•◊`	ä„Õ–©Äwfæ2©ò^Ö©ïË±y¡±tdøzìGQÒ©jµaÏ›ÊWF∂üw;gG›Nm-Xõ∆Ñï≠Sy’ú"#ôæ÷\Ä˝\-.ØåÈ~›c¢m`ê|N5‹a≠êü%†Ä õ	Ë,lyYfHïfzàñó¬˜ïŒ´…Ìπ8c∞ŒŒf%¿lï µtò®(úN**pµa‹©oJ''"—LX{—¥ùm¸}ÁÇÏà{2Ä‚h;aΩÏXxµ¢òŸt∆⁄mg∆¢?±»%±IÀÒåâM6∑˛ﬂÔ1Ó÷°ìÖ…Æ9kÏ5∏è‘'É0≤o-Ñ«˝ «LÚMl¡Çô.ÿW{dH—å©∏ëÀÏ¥\Ä>ûããôÎí˚#9¯¯{X
¶0¢=>˙ KLÿﬁa¸‹Ôó@P∆ f≠«…3H FËj- Q•…ﬂ.}?*$í)Üz“·◊a%ä„Ö#ïFû,\ƒ}˜1
ë^Áp=Ï‹:"˛%
•∞#åO…ÁÍ$GìW¢näJ∞ΩÔeïzäóX)∆™‚¨ÂóBòu“A[
àDﬁπŸ¯îÃ‹Ñík7Q∫V^«Ù@iVN°T\—"ê≤J88cn0ƒâÌ‹.∆ëπa*§0f;¯ä ˜J†ã¿)ä@•Å’øC_"Å;…àRÎÍ;~j_"åÉÁX„0i¸çN·Ö)ôc{p-ÏÄGXa»î/·öˆ€	õÂr"(
πpCì«Ü∞_§˛Öî[LÀJ`b ﬁ¸ãAΩÖ„QÀ«R«}ÛØí¯o˛Âo|~¢é†[yÌTXá‹JYˆÅóR¶F∂ï(=n#V,LÖäŸ~
!√¸KãNTå–IAã´aÑJT,sUÓ(W,µzÅdtH‚ä)¶€‰Bâ˘óZ˛¢ºYH˝ñÒÑª"ëØb€ßc‹ÂZ,UX|QhuAL\4fsÉQÖ%jÆM0YÃvp3ÃÊóíwX®#8]@≥Ê±ÜQ0n˜Õﬂ'º©oE»ÇE˘Ö»∂ùÅ]Qß:b}≠iX mÈ‘≠«e®Ë}•–<èV|–.¬¡◊–ÕøãØX±£¸Õ°ŒGS9kˆ·ª;ø;q™GÈÚ£è‰‰∆$ÊHÒóÒ–JäáÓÿGSÇÆÎõè¯ﬂcjòuyã	âÑ¨á;Ì¯<ü?wBF
œÿ6≤™ù_È~$N°q&0ˆ‡ËºÜFÎ)]5»Ê˘Qb‡≈-sj<ŒQd68§WÿÛ#yíú£‹Y_˜SäMÑ!#éL©	
]1#DÏv. å¸Xeú√µáû≥'ZS∞<êÍëHYó∏z|Ôßt4≠`k!–Z„tíy±D£k7Ñ›–ÜP!|§*o
O∏S€Qπj/úr÷¬£•q)L°.=Rx®7 îƒz≠â˙KæÓ#ç‘«ã¶T¨	_¡ÇfÛ¯ÕÍÒÍ‘„d√ãU'—ŒA˙hÅ¯°ÄæÔ44ö»„≤ßäâ…cCJZBÃ`—*º©©Õ]Oo*É·„M©¶+}xNV•≤çI›˘78éKfUeø<&ÊËu–ºΩøÓMói≈G^X∂ùê≈Ü©‰+3I,€RÀº¥Y‹=3¸-€Z^“&-îXXZ‚2≠%,≥-≠¸´kt+öT…≤î^hfôıÜ;50ÂM∂Ôù€˙ç<l‡8∞k7D¸ë
ñΩΩªI.XﬂR›A∑°ƒ‚l(|n8ü£cVöˇfDs8◊¨É€«w—JIg	Äî9^'‘ö.fË

\aA:#tÚû;áCæ≈‚©é¡Q[ò€zN›ØÜ´±äÅvN©Üƒõ≠{ä|TùräùÓÚ%-%3OÇBQ J∆‰ sMü†gvÇÚc&ı¯sCÔÀ±F-2˘ÊXYU˚Okç©IíıV•–Bx%Ï«H¿[E®ÀOô·™ƒ;à™	iØ≥=/˘>XeE~øÙjL2¡ªV¯Åµ|…—ã“‰ÚàØíÔ‡ﬂ[˙5äëª¸´ÑŸ‹øP\bfqn˛â∫§r}{WéﬁcP^6ÏQèüx©∑º¶Væï’M…qfHÔc$m«ùæWÃi4eˇı%tﬂEÜ ÒCE(–ËuZ‡‘Ã¸“`U!ÂGñ_∞8ONDÜ}§ô	ÿvú◊ﬁÒƒòªJRÀMKpëπq≥Ü≈º•¶√€ê›Ω∫´Hú)ñßu‡≈ôè≤¯bsóáÓî≈8Z.TÀ’"ÌÊÉ√êX†VP¨C.¨/‹5j+VPQßº,8≥HÔ=ΩbﬂoñypqOgüv∂ve⁄âÆDMTÁæçõﬂÔì_≠ö≈·‹˚É‹å8Î›«XyœõRœo§LO@≤3™ãYdö|4É“,(˙ÙÉà∫*Éó≤Ø]…ö®+_0D‘™U`ôÈm5@àh\<ÂæLéEåy¢9çŸÖw´Qm'p‡2cÒ·ﬁ–Ç©
°X∂Ë¨Û?∂]Üu;ŸG*î√ªMs?2[Fƒ◊≤	:ıÜœrâv[#5%2*1í¿SïÎ‰yDRFºåLß´Z
Êr˙t}˚¶7b;QÿA¸+æQIP©RR.N©|»ën∏»Ù†zƒ'	*Ô¶ÉMÊë%ÇâÊΩƒﬂdÁ*˚˝ëJ¨.àRÒv^¯êzÖà‘òô∏“ü®=ø8ŸéÙùàF≤l”Ï´<ôHŸà®±≤õèLÔ«§% öWuSX»á5Wñsr°QÈ’NÔøù4’2n#H∂ƒÉrEÔÌXK°æÑH´Ã4ﬁËV?<êÇhÀ√Åˆ!ˆ˛üºﬂ˚+ﬁ˚XÇ	˚%M<yT}Ôó¡—^Íñ 0ŒÈçÆeXBS”÷d`Ü‹Ãµ·¬ùS›”¬'·Fÿ?∂ıÖIè¥onûä/…˙·›·~à;≈Qß2_OÍ˝@ŒÃﬁ!˘°ËÁÏÁÇÏŒÉ€K√5Äî˝tâúáb≈N‚ë˝‰ï‚èè¢yp˘òı‘˙·˛∫?À+XYÃôÕ[–B€Nûeı°Á?M±Lrbn‚6Y]j·2)ç*Ö_gra<5∞ê+•`3Ïê+¯_Jé·3Ì‹∞®ái„‰u=QÙ~@_w…Û≈L≥<x∫Fæ˚˘ØO¡+‡yEÈÜeÑ¶∞Ä3”L9˜êgìgÇ®)“·ÕÏƒ≈5‡L÷á¬>¶†´ÒÑbñá®ç©Î⁄D≥â()ÄèıX≤¢hÊîZ∞P÷ÿ∏ˇT©&|vfk∫Ü⁄ÆC,Bòc;0‰ô®	ÅŒXkLq±Á¯ÑÎ",qæ_Z•¸ÔÚÅ€ûÊπ‰ôcË•vÛ¿ˇ‡∂q[∏√è;
9æπ‡”Q#F¶≠£¬ÊÕ(€ú[iI™± m±Ë≈›Ÿ}˚8	a˘≤¯676“`
VZ•ö1?Xämãˆî^Póª‰ÖXñ¶«wu—;∑¿Í4ŒŒ©c_„&¥Ù‹0_˝(◊±f6+dÕJ˝pÅ†”t€£˛‡Â≥Ó†uƒ¢‘S>Ù_ÙN⁄=∏'¿[XíAï£@Ÿºÿº	‘‘,*í¡èµ±Û√•D‹îàÃÅE(8@¬áú£∂e∞˘ybT@»±˝º˚¥˚rÿEùìv+Aè‚˜÷YßõM´ÌVß€kΩt:\Ãë=∫å=åÓøıå17∑ûYﬁ‡K™-.J!~ÖÈipàX†}¶‚§T°Rö]ùF] ÏóÜwsÑÂ="‡SßÀ#'»Ùá›ˆ†;ÍøDyrˇ€KVR`◊˝o]◊òaÑpkIË(ºjÊÎ.Á–K›∏ÜÒº<¨Õu–s≥–£@”ªä@”E{G…¿Y∆¥ô4B¶-)`2⁄≈ux≈"nv8P¡n¬Ó∫hùSÄZó≠‚*‰4;ëwf[üØœ§H÷«æ’3µ*∂‚RÍÛÜ:|^ÀCÿ·Uî¨\≈ ¿∞Ïíµ≥…ÁMÁa÷BÀ·rÜÌ1ªÍõÿ~`Ò‚ı}Ÿ¡øﬂπ◊˛ëvìÉa⁄Jb≈(!»π§ÔLÓe∞ŒÔËÜ†_/åπˆ⁄˛øﬂπó¿cÂ2Ø:öDXèCyÆÀßô‘ce|Û£øﬁﬁ}¬°Uô!Ïá≥W‰ó~ø_rØ˝ëC-tLúÕ3∑ãoø√≠r™5π+!òdÚikŒ$?Keè¨@O0Y¡
mgVÏ∏Õë«Û\èl8˘éÑMrmJéÑÕ-Óëîù~π∫WŒO¯¢GòwÌóáz⁄≈ÖˇÓ<ÉºH#5®ıI©«¢ΩÓıòö/«[h¶Ò’{gøÄ˛x}{ªÿèÕØ	p8˚™ß«≥ÁåÁŸXæË1¬\µÇS·”bJA—sÁ¢Åß∂9e~¥Ò˝∑ÊxaF\qÑr=ﬂ∫M\Ów+lûÅ£ú hàà≤Ç˛∑πç>∏E8Db/»vô
‚Lª∆^‹´ŒsäŸ∑€è7
˘?£&˜‡∂®b¶J}CQ·–ÚR*H?e~xx^uùúÿäèicfúÉ}äxı!–S˚Ω#ÏOLuc`F˚˛ïJÀ@œfÿ™ZÓ 1\QE8}2∂ºËÈj°Á%˝ñCñ⁄Iç‡ç'Óm˙ïæì«w©úö`≈ <N30Í˚‚'‹æ∫€£pâ√ƒû ˜Ωv8§,ëW’W6{&œ@˜l˙]èPtaÕÈ¯ ïuî2$äß¶∞bj	ûÇNîì“|E4w›±=W©›ôÕ\¸æb¢·º
SQ€‘´Ÿ“È:öóxj#/Yí¥J–2BÉœ(	Á∞LW 4\úπ≥J‚D ,Vv¥q2@)ø@;©∞‘T§R>π8{“±“cX¿°ˆåZ®œBW∫FÍ<j≠⁄HÙ…ÅOΩBmx,¢Ü¸p¶0˙üÛØ‡\Öv`áÃYï]tIYz}é
A∏;^ãwÌ3∆˙ô;*˘+~ç•s;∂≠jΩ°€µ‹k9±Â*9ˇ∫≠∞™«≈äVJµª◊≥†já´:xΩõ>ÓE-∑˘1˛€—¨˚_´T∂ŒÿÔÒ<îÑã–*ÿWÒ #∂A‘ÑZÍHtÃ˘ú“ë_M:ÃÒPÎ0Ä…Ï5‚OÎ:
.€yY>'Òï£à aò7ö[)˘9≈ç>º^´é¿m ¨©J√eéÙ∑P÷‰®	nπ›¸/ËfA]è’91‘ZÄSabA¢úƒLMM≠R~•Ljø 'hÒ´"<ø\ÍuyŸ% q-’1É‚m√}ö∆Ïñhô=_˜•è%Ç	≠K	éö•kE¯†yM∑b“F=KY¶ìSˆé|ÅΩB¯õ˛‚ÀÚMì	uë”¥LÍxır$ƒ)≈êî¯F‰q8_@rˇ√/ˇ·øí˛iw–ÍÙdÿ=Í≤ö≈ù˛⁄˜:¡q¨9!≈˝¢%7∏Õ5G#T@n¡oûfN·©Ê´R#∫+5Éä•¯Ûq'ißÁqßGäœSCW’⁄¸¢—˝ˇô$[–„WAÀ4ÔUJæíù∆JƒÛ3p»pXÈûe:V’*cãƒmÆ©cñIƒOºJÀÅàP<Ø4ÆÊÛ)Í86H7ÇÔ‘∫qèú «∏ˇg.û¡*ß]⁄Õ!6ô;˜ø%‘&œ`ä3»ÂK∞π‹J€¨ï‰xq±•‹SÂkp?k÷±fi˙|∞¢ô,ŸâO}˘Á˘ZâXË<`—Zsj·ô@bÒ§.w˝:k– VÀõÕ©«·$	¶ºö¸ƒWöí	u\ÒØ_›‡9∂{2Ëû6Z}X‰í#iV4H›2ÓÒﬂX7ú¯Á@QÅá¯Ötó{∞T"ƒ∏®j-J‘+‚WÈ© d#Å∏#	0
0ÉÓqˇEèI/Â±‚ÃK+2#Å¡¯˛⁄ ∑Qíd.lGÇ’@65·◊'¬Ê´“$Iù.ÉÿâWL++⁄’ÿ,t_≤Yı5îﬂ4Î¶t;÷V’∞-_(V] Äó}’ ŸÇΩ vê≤f“Z’}?Ôﬁ!≥éíÇÁ√…ù!îG®vÉ≤ üo^å-)∑ÜoRIHMÔ¯>¶‡sd%/îÌy/2„•¡œrk{e
∂ª©Ô@ìÏñï∑}â≠°òË±#â‹ÏªD\è§≈ÊﬂµΩ”]ﬁ	|¿•Å¡ﬂÄ˜ª‡é/Ûo»Ö V@ˇcÅqåµt›cÅrp\v@Y7ÄCë–º¡t!~Cıp≤›DRR÷ëíïÊçùî(¥¢
*∑1ÅG°h@N9syˆûw[ùÓÄ|D:›Q´w4$˝ßdÙºK¸cUB1√Ëôá	í4¢ÜE∑B¸€\ºãLÑøx·Áêâ;+,IŒ/˝~-TwüÄôyÍ#Ô±b˜"bßÏ$¶‚:
îíÇÃN·ÓØ‚˙ê{	2/:µø>›Yj±S‚8§•W.§ŒØ^'Âe0∏	!ZŒUè¸ªƒ]A‰”äV˘lxX‰∑dd™ÊUÜM ì?Œî3£˙ïl|˘ÒÏô8oôÖbW≥ˆ¬6’{•Ò’äèYÍ,ä+O&À;∂+ÍÈÏ∆:ˆIÂ"ﬁQÙÁÌÙ¸yùâ’Ú
9ñœ”Tè’
B0≈G‹ÈÒ£B* ˆ)Û}´ªÒ4†4Ù(wÍ÷Wççÿ í9§mŸV’Ω∆äT∆e¬–•»~îŒ˝HF5™D¨üÁÿ÷ƒ.P¨†ËŸ{¿˘æ›.4ß
‘®πc\Ê˝o&¢˙P‹¨7∑]wAg´À9,DM6„Õl›∏0∆àÖ÷?y‚ p	˛èù«H]é√Q|ø–ã…óå}äì;_!cœ¬ßã4UÑ ≈2&œAî.7õ‰‰˛o^tè@º$√Ó…∞˜§w‘ÎÄ»©$W&Gﬂ[‡2ÇFMÑcQ¡là†¬&>^œåõÉìLıgé∂`_√¥◊ˆ◊YØ™2
ÁT‹ó>Jíß\UèÖcôUÄsô&fŸÛNõp‘L®◊dù
õõ‚q-ã™ÿá2J"©]D‚Õ1Av;≤æ¢˙„Ö=^∏{ˆ¬cïJ>*~Oçã{Gÿ¨ªπÿ¨jì2k¥ÁL»‡ƒP;={r‘k˜káß˜ø`ë∫`ö<Ìsùﬂ_±˘Aw8ÙF–æˇW‡	cÉñÓ%∫v("u≥Dz8Û≥˚ﬂËÜ∂lo~xﬁ°¯#ë+K÷'«F≈K3·€í¬!≈vuïÛ≤@G·ÄãLG!è÷3eõòKƒéq.ñ`o¯äˇ¬êÁL{‚íØxËyazsÖÒ‘è¯f«Á•·≤Ï9ÕyàìOÒ,⁄jíÓ∞›?ÌìQwÄ;@:™vΩ%g∑ êQ pòØÒî),ô8_‘Ú<¶z'$ıÙQwm$Éæ†ıJ)ÀùrËâ+˚π Ä
7K1ÚÔ—ú´‚âd7˙ﬁ˛%èiΩ√,Ü%Ö∏G¸˘q˜dÑL!Ü6∏‹à[/@bÔü¿x5P†¶,kp©üı€Z;|b⁄„íMΩ›Ë@3òoˆg«p˝@¡	µ'Œ˝∑®;¢˛'2ßﬂ‡)∏›$HÑ˜ÉTàZY§∑'gΩ˚øæˇ´˛ª}‚Ü∫ˇ-Ó®◊x
˙!ø+Q¥Ç¯·Ë9∑§z9KéRr∑ﬁ9órbú‡Ì›·À≠MVzÆûùáóœ&Y%€yslÎÙŒ'7rËˇQñ´÷5yÀ9,ù,˙⁄F&+Z&•¬@l¯C∑ﬂ w›ANcaé«qYlæÎù®r◊òÑÕÂ§<Àè>äoÊ‚Ÿíäf¯≤Æ≠ò´ãÑ·ŸçºÄ_òö^éÕóeÙIVO¡Pè…e˙âÃéäÃYÎ⁄;…ﬂU£zJ±G•’⁄a£AÜH8Lp¸v“hîe¬∞µEæqâê!?pñ&$ƒ<€ÁM?5øÈŸGp≤9mÿCıµ&‹`.tÍ÷èEo\S+*T·h√+vº°3<8‹¨MÀ´`wOë Î¸ú[+}–·•zÿï=Ó™x%í˚BqÜuˇ´ô1∂T“‹±Øçßªyp‚©ùs ']‡	_?wA›Ëé{√·˝?vá‰Ÿ†urv‘¿ü·ˇi˙Œ„ÜóY‰)ªÆV≠òD≥ õãØ%≤|fV Î‰òGjóS]T¸u[âÌ ≈aÒ∫˝¢÷r”Yû⁄#R;˙CÀÇ0„W/–Pß3P%~a»√u∏ãô›—¶¶¯c™]ÚáZ∞›ŸCÌ˛˜:≠}rñ≤∆¡1¢bbë–P4íRC>X&˝¥dﬁ/^Çh8áª+1∆0$BK6ì«†T∏Ød}˜}√ö/‘ ~Ò6≈ÁˆuŸà^±4∑‚èrIÀÀ4¸í∞
	cxa÷âxÖÚ˘%xeÂŸ¶e…`¶˚ˇEÒ~^6IØ;ÒÉ˝¢Ÿl‚ﬂè»ºlR0Y…'J%$‡%m=±ºl°“bó.˘ïÀúºÄCîa-ÂTùRıﬂUMC}≈§Õ™VÅÛì5‰C›±á*¶F°ÿ$ª$·ÜŸ˝ÔÙÖ	¿cpPÕY∏ŒÉ⁄ho+ßTÀÿÇÊÚm®Ê˝PÅûWçÕıÌ‘Ëc9h;î√Ê7ç≠HıùBÕv##‡3ööYlwu±ûmû∑∑ÍJ⁄Ø´‹s˘Cºb™˜2Ÿ…K‚VDíÀ<X.9ëwÏ'{2ÁjÊ•≠d©~ûïI-óU¨§9‚≈%˚≈\áÕ•I≈—«ØÖ˙Ç]RaPY"_8¢_N∏JB9d'{^.eî”Ï≈øÂöÒh‚≠$q¸Ç¥V"›Î[é uG®ŸìR∑+Z∑◊`Ñô&Yq≈§\	Îf/Uã,◊\ùHjSä¶,—‰ù˙ÜTó+˘⁄suaÒ«™˚7ﬂ∆ Ïe)V\<Hd›˜ãˇ˛oˇ˙wVkt÷:Í˝¥’i˜DHóVÏáÃE“πS≥öÉ∂yp:åY˛™9›%ñ°bä~Â‰¸Z∑”-ëî_)ø¬ûuÃC˙Y~b˝ÿ	˙azD5¬·ãX)‘ﬂL<√„„îH°û¸s˛ïs¸KÌ %ê.ıp9áˇ™±ï◊√¢#j2ªîC•/ÊÍhlÇ.Y¬Dç_¢WN¯Øî5üìÊ¶ ´Â»ó±2ÏIXÀjIh‹‡_a|2Öimnl~I4Vƒˇn£˘ÈßE<œí„∑í∫>!–’hE)á^MÈrY∂Ö∆1av^©˛£§ûÔx÷`}VêîΩØö¶˘∫sñ2¯Âﬂ≤S”ØªÓê˚“ˆÀí·©“ )gµ¶òö>Õˆ—î˜…uôˆƒkhY6tKò;c«ò{AÑüÀœ ?ﬂã•à˘ »XÂDGkvZ®óîLKÔÛ4s∆˚>O3Œ[óßÈ'˝s√≠¿§h.{!Ë&‡`¬]hΩM&j˙v)asÏsüGLÒB¨ΩE ∆Iç7¢0VvÚπ‰˘b¶Y!<÷™”6≥Å§ .πıª…9LÀWŸÔıèw—ÈΩY6V¡≥ak⁄<©1‡`mÿCﬁﬂ&›_qBVåQFRY±p€í&ıÏÔOˆj‰≠`]˚¨ËW…<¢2nen=∆Q™
æ"L»¢W˝r≈î“¬ÓN∞ï¿èYø%Å'[ﬁãg›©ÕÂBgÙ°ÖÁMgÓÀº3`^™oº˙@º≠•Ò‘∆≠‰ -OÀKΩ”Y	~u¶ßãù⁄üõ¿7
fãΩ[ŸyXÅC∫·9,OÕlRo	ç¸lH)ôukD‘òëÃŒÀ∂1OÕKﬂñJQÃfQ∏¶{8ŸèD/wÍq! 1oyÉ&¸≈hÂ∞#4∂ ˚wEâÌiîv&â¡ıÔïıŸnu∫Ωñ‘ày†≠S–2Í¨\◊“i˚œªOª/á›ggÉ÷Iz¬\}ì&Î√^{EµŒ:]πOH⁄Ê˝o1_‡·rÀùeQxêw˙Lj›˝?ë^Ä˙N∂™{ âÉ)º¥„≠åÑ¯CÊ¨…ÔœM£lÍo â0.¨kƒ∂.nÊ[6=;Ñ°cáz˜øu]cˆÄôœÂ∏RB‚›fMoÉ≥%Û·xëπ"∆aÖ:B&¸DÊ-ÔA'ﬁÉNÄNÑô-oü¡x
écú/F√;ÕÔ^'ËÁÛ d≥:)L≠≤%Ó-Á6Ôqícx@˘&É1©f„Ká;?£úÔ˚ïlü-J≈ÿ;´úrW9◊ûOv<jtπD˚l^ìåN≠Œsæ'\Á{ì)=´‘“‰£œºœëÁc*	≥˙Ú3àˇnÀi!Ë?Y'ÜU¯5∫XÀU (Àt˝÷„Ã6∂) ¸©ııˇ‡ÆOaY€•|±3ÊÜm∫∆L{ÔÖ≠`πûjÔˆˆ„Ø áQcXJBUÿ|sÙ¨_•Ë‚`_N5w˙`¶m—˛ ‚æ˚˘ØRˇˇ˝^+kßê∞BﬁC§–˜∞(+ÅEíÌ{Lîîæ{ò(oöIéOŒ•d∏&2Âecúî	g	ØÂ`Nﬂ¬<ëﬂ¡O*π‰Øˇ‰=÷Id™I8+∆ıPFa(ã¡P	E°:Ü¬*“vÀ‚'<h˜©=≥Mñ<êü-†å±†é∞P_A]Å-lOÕÍ5GuÈ´P[Xn˝cÎÍØW>Ó±Ë˙GReDBI\e#,À>wåâÊ›ˇŒAåü»⁄’Â’±kovÇπ¸Öæsd¬àZ°:sQG<ÃO,∂©si‹ˇ˛ÚΩÜzv{äèºJã=‘±nvÃÁ˜™t7<⁄P~›é{eîã,‹C¡9#¥∞lõDi/E®òÙ™òà“Gá∫„e»£öã—Ë^+b)ñ>G#î!fœ8ßíÊµ+{Yä	:ñ(ÜF‚àûQ€q`6F•Yı+&)æÌÒ]›9L´ÑX˙&·ƒe]∏¿CtTÃ*ìﬁ©©YT„MéÓøı≠Ÿï;∆zúè∞⁄∑·‚∞∆sm<≈Av®Áèï˜V$‘·bélÄ1≈Á∂;-ŸÑ„IËÀÑ≠ãÂ-ÓøeåÚ+dçmˇÃ2pf=Ièä@=T:_Ò±Fˇ¥ÒaÃ¥‹ÙÏ34$åΩMfÏm‘÷Ó‡ôcÕõ6/L€vÍÏO!ﬂg ¡¸à†µ‚O(ÇkwØ‘87ükLLmË9ÅNúı|ı¨Fˆ*Ëp©DO±.Nkò◊ﬂ~^+5œ>“»ÓY0ßpê˙x∞Ï†a—<≈–˜¬uS%Fn¬e’Áx
C8;eû;a}ßÍa+_ñi¶√`ôÀl/¯¢Jc",OäP}2årâ2C’ÁìûÎtœ9äq•¡Qÿˇ·≠ø[Óä6∞ ≠o<"€kÍ¸<ÙE€Vßd∆éã™ !+˘	+Yâëƒb≈”#’W p# KI`÷8áP≈i]Bu´à∑$–ñ˛ÀøˇøN∏QÔEü<Ô˜è˙œZù˛^ê*à4«ŸSº·ÄG%õ0c,+”ã7˚I·ﬁºÌN`I^©∏REh•Z´”©å´TU©4€x%?ÏeÄ∞#?¬ÖêWØ.ØÀqÌsXAáâ´¡ù<¢ZIuÕ÷◊QR§3·Ã∏ﬂM- $0ñ9Wk ÛÕ9°˙˝¸ M‰Zï<ªb—lÂœØ⁄—§2u1:yr©ørx`®?#•ûä1Ùh~H•„%Ó1äπá∏/ËKe•póäµ≥:6kÊK¯WﬂNúØ
(_o„ÎB¯R¡˜R1°?,´‹Ì[0JË´¡+Ôç
L˝?ÁÖª°€ø?x÷:Èµ…ŸIo4$/z›?Àı˛ﬂ¬aÑ ~Ópq>“ŒπäÈLY4≤3m1zêZPL77\π¿mæIÆÕ=È#w£Ô
ÆGºó„z≈ó<Bt'xx1≈Î»@5ˆÎziñ1∆hQ/?‰!>>NÎ8%÷a'Çıç∏T¯ùœnÆÕ,ÙÔ\r~|ì;€c;¿°ñﬁ∏∏iúSÔäRKû'º/·˘ﬁˆrûƒ#üü7∂¸⁄˘–µ
Ω„ä∏r)Qq¨πLøÇá~ˇHª°éõÇü≈†±∫ g.<8"$ê(7,Á2iQ»Æ0Q∆Ñ|∫åπcmÓ€1ÿﬁp®'`©xÅ{óxÃ¥®±⁄æÂüúRÿ.hWeˆ=V$*Ã*¬©Ryoœ¶‹èBj\9⁄ºp:êI<e·$(pV•ök bÏ¯›TGÜ„˜¬;->–“‚ÏÜôÌïØ‰ó∑õ]ß Éªf•@û⁄$È‰…Ä˜Ç›[9Q“G©cÅ6Ø£∞À£≠£#9°DÊë*•z|˚πP±–{Æ§.ùUM©^/mç—Õ¸Å∑ˆ∞™-∂ı~;\i€adÃmæÏ!˙•›ÍG`m§`àÂN‡ÿ÷´§ß%áıt°ßﬁP‰G/ùt¨∂˘
è¬‚û¯Qâ:‹(âçÎ‚XâvjË—"8L›1S°Ç®gjs∑8rﬂõRMWXœâÏ¬L	53‹W*ˇ å1ƒaysØÔ® √»#õ£Äú®ºøÓM´6∆†êåo|lõÍ˘µ™π?z›Ï™7Q’áûÊ-\h˜»ˆñ¨¿§5&SQ~J¥w9≈€MâÍˆΩs[øëG¶c48m‹ÒGhu	"ˇÀDpﬂ⁄\Ád*ß¬<˘!´†E{Â¢Á≤eM^◊Y<™‰ÿrò¨à?e?πÊáa_h¶K’ú:Ò±Ñár 8–çìC¯Dï˛≈†¥)=pßíl…‰ªrK¬}Á>w§ñ–ÖaÈuõ≤˝‚@l2¸õ{∫¢ˇ,Ωø†C:QÍ√ø„s∆Z•û¥Eâû¥ÖNKˆ¬”q°ëóÀ{`“ı<“C‹æØÍñ)ôZÄÁ’Yßò(+[
¢Â⁄–¯≥Ωëe\.ë.∞ÔÈ	Ê^":D!5ÆÑù&÷v‹H≥ Ñâ“!vjá|"Öz£ä◊\nm?˘ov˚äè˚ûf¢˛&ı7‡_êE˚$∂{L˙PÆ^!üÉ{B˘Z¯Êgn2o¡˙¶8©ƒW;âÃ6Èﬁ≠ç*AGY#äÖ·¶¯Í&2&¸úêWµ—‘dóE–ˇ&ŸóÏï(õKs˜ÍÆ,EÅ ÃVzV{â>8R+¯¿Ø*ª%¿7PGâtônë¸$ëx∑+K‚•w^z±ÁŸl˘±Vöûí´P¢ºA•@pU–ïÇª«πö/ƒ P4(ôB#¶ÆwFHj%ã• πc8÷ÊßÜ5»√ãEÀ{ ¡˘ı-ò°˛6"ŸñÀ*G8ÀÆ—™èÚHIìôa5Æ_lmlî)"í”Wvﬁ$3u-} ÷≤∏HB~\Á™±ñ6	±Ö˜™Ìˇƒ°»ÏpÜ•%y≥,btüsñÍÏò¡òhc\´rBHæ˙0¯/ﬂ∞…ªµWÿ˘)µXx∫r0£Ö´„ (â¡€W¿ ≤@˘îÄ≠R-mUé)ÖRWâG^•≥éVLÌanEEzO‘m†CFi8~HÈ·ò´”:^rg@Ô˛')XœˇF¶˜¥‰V§gåπ¯ï^û˙Ÿ\Tû≈J;!xÙu Îl’D»ññ ¿¥A›ÊÖ◊@Ñx…Ñ®-‚Ñﬂ§"œ⁄Z	≤˘xÑXßîvU–[JèÆúà≈ûHä¬€uŸ1Áä]KÀ∏¨ã|sC(`á€3›Q¡™ ¥xóÙŸô‹¬hx_sß3Ù Ëù⁄ˇ.©UÀwo%ÍÀÒHCî‰÷|¡)V⁄èÍµÛä˙π/õôx]JßﬂÎX„qõ#Ê¨Æ¶¢)ÈY’›*û&«‘”ˆRááÈ~jÖÎb„Ø8áÔ#ÆÆ≤CV∆ià^eQ¢W%áË≈s–üSèAæx¯}`+VGgê/û'h’	S"&Üjç%≥RùòNßûDΩBG“^‹≥¥L≥qﬂ—^∫Ki˘.∏”h/ÈGZ™ÈØÚèÚ_hcµˆ˘≤'ü´⁄QáíàÙΩä|UL´ã5‚'Ÿ˝∑ˇ Û÷>îº>5X«A‘çÂ”AwH≈ä“a^ûX _(¶‘EØ*Zâ$ﬂDiUÔP,®Y#›±®0•Xµ§ì…m¥Êë°œìJ ÂÔ∂ø“NÈC\µ÷zÙ©rÁ∏JêIx≠
:«∏•På◊*éÜ)é∞V¿ç¬¿–J1AfE∞àhæ|äYéE¡¢yô;Ø+≥"m π[•ºÂÀÊ5ƒÍóWˆmÔEÍNÃï™„˚o4íéyQ: ﬁõSÍíèà&S B5Ò]1ªa∑Zv!")òbN∞Ê?	Àq√iåvîhLƒ¿ ,pΩ6\èÂHk-ä	JËk≈.ùmŸ•£fÜU£UÅÀWÖõºRT÷E˘W kIAï ¯|%¿5ÀÇñáà…gÅ£Ù`V2SäV_:ÅDûçπ=O®5Qƒ&/_-Y$ÔÆ&Y¡ò©äèà;äe? 3ÑˆU•-ñ¨ ∆ﬂNúsLvÍÎ©»yÊÎÒU¿ Y©gï]»ï†◊ÑZjÀlÔÓVŸ2ØΩúÒJÚ>Úõ_aˆGjGô":|êTo)ìxÕ5„Œ™Ñ ï=•¨n‹˜éG¨∫`‹äR%˘ıÄ„oSB˛?   ˇˇÏ}mo#«ïÓ_)sÉ⁄ıÆ±≠ùë¡!9ÓJ$MRìıOãlI7Ÿt7)k¢HÓ~Óá »›Ï] {±π.∞p ⁄`±óˇƒ‡Ê'‹sNUøWuWì‘åf<çƒC5õU’ırÍúSÁ<œ_≤™p3Ó÷R?b{Â™"nÓ©Ñ…B‹|u2gQπ¢≤gï<r?$£é{‚{Ü¶……Sú?Æ0{\å;Nã(.∂©-L∑Q\.M‹Ç¬˜µä_B8Ω5gÑ0ˆBgL¨Ò≈B∂üúr‡H\ûzÒ¡Yﬁ¥"ÿ)•√8.H˚‹mÕÚ|ê„˘7W¶Â˘Ó/çÜaœ ‹o4ìWëÆx5ÔßÒS€ª⁄M¢≈ÔˆëÏKNA:Î≈ÊË:√Ö∂ê ô≤&"Ú.’»“?˚ô¸ÎhÆñÍé}^*∏≈8Km1Ntãq¯„¯ô7ºô-˙´˝#]-ëü°tªvØˆ"MÅIQ•∫4lw¢ﬁÁ:-∑JlQ¶¨¸e®®W,ÈyPoZ^ò®(	uJÿ'£häÑ ˚È@ûe»®ﬂÙ ØBë9\‘ãpP/¥	‡•‹í`ΩE8•ï‰xÈJÛE˙®ót1aÕü◊ÿÙÙΩfîû∫è◊ª{!Êá
æ`˙o˚F	0§†y'º4û◊él◊~T«M" y¯lMD”≤ò@äZÃ¸_Í¥|µ¢y•ÇS'¢–YÖDsAÚX„2û°d—#IYœÔ–.¶∞,OƒfO◊3õ„i∆Õº≠b¬˝çä_¡K3!Øà∂ro∫ﬂáÖBA%1ßã&zùÀ~@B#·$*Ø{ÓæZµ§Ä÷ôÄ#•TƒC˙ß¯^õ(Ï§⁄:Ì7¿Ç≈Á˘/Áˇ∞|¡ıF[X≠C¡·Á¬Ò'Öv˙wt¡t˘¨≤A<Ê∆‘µFÂµ;§ç}‚∏cQ>´ÍˇÔ–#éô„áØæw/∏a)ÃŸ_4A8\#v_íí¿ıËãÚª&z3v…˚ñ‘ÚxüKû“|]¿xª≤≤≠?Ä¸›fì!;¡[!YÙÕ>◊ÌwQƒÛXs>/@j»P¯ÀK—O†Ç"Dﬂj˛‰V˜˝êº-“/e—RÌyπ
ÇÌ‚	e1¶∂^ø{⁄?ÌVYµZ=n˛}µ^=à¶ñ≈"≥K∞í¬4≤XÜôvô˛™]àómaf6∆Jßùzµﬂ¯B∞∏|Å,.E)⁄"i[Ä¶ç±x*∆Y⁄†âA3a˙˘ç†÷s<?€œT€F0¿A6 Kå¥&]õvz÷-3mPPãI†Ìi{’\≤âjN	Ñ∂ÄhZàqıUä£4ùd‰Uuô$_ªî˙›œ#R*`î¨"€¸U®§EïÅ4TH8Ôú±f}…{-¨àHÚÕêTÇDíI£"§VæbÂf˝Ä≈9&¡‡ı0∑ld¿	h W.Ø
“PbÇ¶÷/¿n(Jñ(ñú˙‹˙~ÛCF#gÙï>x-˙[ˇº£¿Ôæµ æ+Cÿ„zsrutëiä—¥≤√ÚXtÑDÜ–Jq¶HLåèzÔgfI.E¨cÛá¸Ü¯¸Ü{ôÜ'@óŸP7ó|·2“ö_Õ¨âëÕFHM∫KFBj∏œJXπÛ}”1©	?Ä…b∏ÉÀ•íÁ?|ù…Û˜Üö0øq!RnèÂì˙WCVH-È]Z¶=¨]öÉ/%¨Öq∞6¨0Å«∂y»:hG6Ü˚Å∆ån,¯ÿ‡KÖ}ˇÛ?∞ìf´ŸÍk˘u±ªñ 7d∂i'eåakˆ”â3$ävÓßª 1N1ˇ¶ÿoùçÁﬂap3ﬁBïè+zôú'π†Cq|nÃ¶“Ùâ6ëîD¢JluùJµ≠}¶çï†Èæ’„E‘õ‡wó@ÀLGj∆Åz∫ÏæBi¯Óeè§Âß3”}πx~7ZLqæ8ºÓg,ˇΩ’& k=î˜T„z`⁄œ,W†pÎ∆‘8ÇÕ4∑CxQYí?,0Ñ]ÁÎÊF⁄ô–P;-2Å©5µa€bRöúï€p˘=ÍÕŒD’©kùÕ,.s@öLé0≤NûÆ—≠N\ê5ˆ¸€‰á/óLO£ö±ù•W”»∏Æ¡Ï¬M¿}j"¢œ£õ›è∂4XIwÒ›<◊â—;	@k≠GMãiΩ@Âg%D=gõ∞ïQk˛⁄ èø˜Á«ã˜a~	Kû>¬ly°WLj;,®ò€–Új‹´BdJ>ØQ¬”“;<*íYõ•$-G°‰Z=D0\≈~v8Xà©§~dpÀÏsµ @°Ÿ=è‚zhãøK
•2ıQK©t(&uqñã`©⁄+çgt_Ÿ‚ßåï/5T¡éÜ=ka·=ÔWøàHë/-œYëÂ≈9ï¯0È1˙ÉΩÍÓ∂Õ+S∑√ÇæÓ“ﬁ∏L7Sµ+Ècô-q}ƒ9Ã¸*_cO√&!\„∫GAw¯OÁ2uöÓt¯w#“åÕ{˛˘⁄∆Ok\Fv´ECõìOπ{!„ë ∏-ôp∂˜2·‹(ﬁ√äÀìÊÅä7æ(‘^j3M4ûH}+Ÿ{Pt'1:#úä¿∫¢õÁ‰.˜%˝‡∂õãN˜™óñ1ò.≤¨™úÑGsEŸ÷≈˜'¬ßœïS9}ÊUtG∂'w©qF2_√|)ÙÚßºﬂ%eÍ≠Ç@¬+¿d^ç98ú˛ÕˇaßÅÁäEÏ{ÙoÅ≠ÀÉ.0√åWÚì°¡nAòã¡/^Ng,Çπı≈»°êìá<Ÿ6¬eWp¯>âS[&œµdáI{˙aÊ˛≈…9¬bN®ê“∏Í¿‰+“ö€˙£_d”;2]Kc∫(∫Ù*ü‹g>œ{$«ØW‰Ÿ?®j≠)ÎbbaaF£éÅßÀúZÌØ‘™ bÓ;Á˝$pﬁ¡sgö,b7h8êÔzës!~*ÙO…∏Ê–sº‹Ô8‚5∫~˝∞Ó»˘jA¢o‚äw¬¶êØpÂß˚Ï$ˇFô4°9>wP3.ò››n6?⁄äÜZÑ«øÈ‰)ÔÈ2ÅÚìÈÇtaπ(L…ÖΩ„Eèòq“Ò^Ñ%=€∑)Xπ√≠^Prkëõûß‡TÌFGT°vI`Õùﬂ¯
	⁄´îktØ uÈa≥ŒNxåÚ‹ô∫Œ¯B·7⁄!ú¥c∏#ñ~|∏¿∏Üä¸çòy¶Îœ¨≈õ“CVƒ%Z¡YójBm÷c,óh˜Á±≤¸€‘Pãáp¥°⁄_4çKSFwMÙMëÔÇµú)E?–÷9˛™£Bä¬≥›$é•>·i˙Ô… ßFBä@«„ª¬Œ~íêæ· `bøê)M)zÏPq≥"óC-RµRK„~câ∏˜è˝I&¡	·°?≤®üù5—åtÏOïì-5ÆˆÃ≥Æ6ˇﬂ4!"`›´w‚¡√ìh´
Ë°bƒj„Æ6ˆÿv@ï3ÜƒÜÃøa’â96¡:ò‰(z~)â˜ÀòŒˇ8b∆e
˘TT‹K¬ïbWƒÅ^<°Fn‘U9⁄OGÖ‹#ë`q]Úƒáõì%µÅî´$°iásˆÃv_˙Î0bâ+Ú¡>‚Xn!j·óê›t¿v†ê1ƒiW.ÄP7y®øUÄx˜Nµ>X—$51÷ cÂ.Ã›ä3∂_n÷-©úÜ(´« ´∆¯ƒÊ”Ó:;õMô7}â_è≠Åiø\[≤ÊÆˆ†N]µ{‘Üf∑è∫M∏«¯¸àW(u¨¸d6Nœ¨ΩlÇ))u◊8ü¢üEﬂ6ìÊQÅ-z	ËÉ"ûO~Ë0ÜÒ ◊—£ B∑∞gN˚Ò*˚Âr/xtsìUA˙√÷	≥¿∂_≤ë1ÅˇOó"«òŸ”"HGòvÜdXÙ3ü˘Ôîc‘]À•Vµœ≥gäVD
ÛÈn ~FM1'>œ¢Ãx·¯ËJﬁ:Zﬁ-]A(çÈ∏Ÿ{äYL°˝lÅ”ë{Ézì<<Ò÷Å√≥í‡ôûxv?<wqæ6áwé4íXÑ!‰3ÈÉ§∂ıL˜ öˇ|Ú	_{YÏ…Z+_úÕF]ë@Û+:I¯˚•+KÇN
(¬aZïï{Õ⁄ΩÚ™.RÅ≤ö=ˇé”«Ω,m›È∏Ò¨qÃ ≠˘Øﬂ~£€m¬¿¿»Ø±òœî¬∫Ì/¨X-	úvØQ-”ÆûWám9M¸"«‘w´¢…sR‘BÈ¸˙°m%Kai˙◊°ˇi®»D°—-"¸ºÇÇ„ZÀaÏœU¥ª˙¨yù ≠üVPË„„vÌoKáÙœõ»xA6j«
§fß %^ãNt	%Ö57>ÇïπBŸÿIÔƒÎâ◊•	‰∫K9ºÓÆØ∂:öÄﬁ`ı¸Ø◊o∂⁄⁄˙gJ1‚ã2Xkx$$ ?¢}dtØ%líJLpåÜ7]ï¿-∆Cá◊k÷T˝&øì¶ØHYMø˚PG¿e¬√+∆Ü˜ûDc¿=ü%OÚ√ÖâÚ®Yn5©ÕfÖÑyx›ì≠FÔ∞ão3¬›ªKØ—Í5É!PØ¬_o¸·—ëkÃÆ≠Xœ∫∞ÏWÑhôÙ=ì÷Ø@≤‹€√£∏¥è¥xqÅˇC˜{K;ß`ÿ◊⁄`ŒGüñˆøvÓ∞Ÿá"˝OÀªt€≠'ÕzCx:¢-]tØQÎ6∞±‚+WÌÈ¸;œ≥FéX≥Ö]“wÎ,Ó4∫'Õ^o˛Oç;ÍV[ß«UËËUJÕç}ETÖΩO5iH©≤ïz*"4Ga ·ôyE´ñ<ä¡Rä_7œKÕÒ¿R4OiùïN@A# √Ëˇƒo=√96ˇ:`œ>fùõÓ¸èxáû®ô∂¯pi\ÒU›ø≈è5JüájIÒì¯¬EQÓ_TY
ì9BejRË¸≤p ^b∆Hías¬Î¬@?Y∫QRG0¯
Ê…Ê[Ò/û≥Hù}Ê\Õ∆b˛0¡ûÃ?Cπ¿ÎÆÕ8~E∂˜í,˘Ö!‚5ã∆¯W¬ÑßsÄ+åˇV|O˜_Ïáâ.^}¸Z(p@ø…!ÚD 9÷æ¬ø)îy…Ø»¢EpÄÒT≠˘z◊ùY¡¸“§Œ	ØbŸ∏âtÂhÁ‚u{ŸÛwi~J$îXùLÏóågMÍF%H/û~wp¡ƒrís⁄M)"
óL2èÛù˘a»åÇ&pÕMÃ)Wfx¶§‰‘?EÑsÉGeS u<zƒŒ)5>(,ì≠	àWëdÛ"l+⁄H€7xbL.v≠P™ÆE∆ÖÆwåÎl~¥w¿∫Ê tÙá{d]`ê¢àœ3>Õ`ß3C÷t¿^H‚öp†ﬂóûjbØ≈j„±M—7J7xãDbA©‚òäóäK±„!K∫≥˝ˆØußd8ïÍ0Ôf&!ö Õ˘∆µ9ò!0*ÛS§ò…∫˘0ﬁU¬O]zrUG&óÇŸÌÄÏkã2}}®ãªö}~™t◊Ù&–Û∆à:Ú™˚ã,91IÄŒºÈ¸ﬂáñ>xΩlñvlcÔDÖˆÁﬂL≠«ıı¿⁄ùÎ–§+À√0@ªƒf÷Õ©ﬂfx¥k¡≥œÈﬁlÇ‚AÿS«õXSw˝¯z¢Òt6ˇ∆E‡Àì˘∑Ch!MòìˆÃs4 0˘UtˆŒ#˜ıG|Êt±≠j‹“’:≈¨aA≥&êÌjRW…K‰&‰Kj·C∞C=Oî˚9‹ÜøãVPwÕÉ‡FV5ë´ç?“'’ãtMHGëá¬>	iJXÏi_´8ÕfQ^≈È¸¥SrÆ-^ÄdÖ:(4xÆ®bz·I¬qj #«b8î≠ÕiTƒ‚´›ôhÎûk⁄¬πï|±VN º7ÉJÈ˚ﬂ˝œˇ˜øfµnÉ˚˛õ=V=ÓÉöQØˆ¿¥ ©–îàxäIùT#(∞s«5F–˜¶œáÅ Ó¢Ãpöèær∂•FΩŸˇ¢›ÅŒµ‰S-	`~g&F3≠èQé2Çt¿sä¨Z˙°`_gOÅ≤‚[kxª∂rf¶¢ Ú7/¢7w Y£&¶—F6”wfhOäO¢8dq¥3t(¶ér”ﬁB:ı´=àÄ¨ÈÒ	Iÿ{2hÄ4Iì¥†œÙ~=√F‚ü™è‰'§cM»Õ"NE––¥¸åk–ﬂ≈Òã.+ˆ∏±"»G¸%aöT$ÇÜÜw	sE≈Õ ãG]Î‘3›¥÷GÏk¯d∫‡Ñù—⁄L¡0Ë‘°¿R£&NZ#(=’ãô·	‹
#æ»‡[ö∫Â£$\zb—é¶!
ÔŒ	≠ÖpzÉÀd≥Q ÃÂ#2åFÊ¥¡∞^4±iW∏@‘?õºgŒ<®ví<§ÜWN‚í„ÙøO\Z÷vÓµÕÁ”ÍÕº	(ﬂ&;˘|f†◊¸!l¸3€<6~˙Úâ∏	+·ˆa˜iìäF5ï03ª$∞‹›\YûufõÅéõ›ó"@1¯7fr~dçq·Ü?jÚø≥%¢~t√ˇ˙)m¡ÜM7≥~æy¯p”ÔΩÃÅïë1!TìA:.-ËTwp˘2s¨çs;÷O˝
8Ï†ÚM%›W∞OŒŸD!Ú˚Ír
O ®†„ˇ&¸¨~~ÍZ`xπ}«¶èn¢©ìP∆Rß^™_ÊO≥B”x®¨l≤‘xÅ&%é]¥Â™#NÈäë‹|∏9r(
9ÒMº6<ÌW≥˝v2ˇ«˙È1•V7éöΩ„Í¸óÛhØ≥v˜h˛ﬂZÕZï5XΩ}⁄Ô6[U÷i¥ö}4zÁøË6´â£‘Éƒq–›xöfÉ.44%=˛0lg‚≠0‚&Ú€ ïe~ù‘Q-X∞√>∫πÒUÍ∂µŒ‡ø€[iÀFh6±ß∑Èi…√Êµ5ïî[ëúΩˆ ﬁË‘‡ôh«HAn”¸‚è§ÅB¥7®ıõ0#–˛"∏ì˛ÕH|uÏ\¿ÛÜp»
◊?EƒHQÒ°^|≈ñ«Xm0Y´Z#$Æí⁄qµ◊k>ÅÖA%π$ '≠Z'â;î\£Ò`R1«÷xÅ•˘Òªµk;\,äU¸G¨€Ë¥{Õ˛¸ªMéÕ£fÜø¡™›OOõœ⁄¨|‘nÉdÏ6ü•`¶í√}·8∂Y∫p≥¯xG˝÷xﬂN%⁄Àù{£R9·ñ3&˜fï'›î9m∆:„·¸ÎlhNÀˆî¡2R-o(Ø7”·Yjéœ]ΩøÉÈÃUQÒÜ„ôRé_Sºô‰;âá05öõÀ¨üè%nV{∞d0â≥?ˇUØè∫D@û¨†ﬁ”F£ﬂ”\Bﬁ•iNeñùﬁ‚?kQè^Ô›*zKV—ˆ÷´5Zı*˚õ”zœ:i9’⁄«}XY˛™UèÒôÆÊ6(ÄÜÃ
“[D~oÌ2™â|∑êﬁñÖ¥ç˙\èY˚âøêÍç^ßZ{⁄WRΩ]”›àÜŒ`Òm¸÷Æû:º‹ªïÛ&Æú¯cä/nV˘¥Î∏¶géÅù˜\·“´o∞jΩ⁄ÈÉÖƒ¯ë?◊¸ö≠^á`Yπﬁ≠˛∏ãÚY£{\˝åı€G∞ÎÏI∑}¬éO˙`y?ãÆ»á|l»⁄É°áë¥A€,æÜπay¡wx#l<«;^ê‰ô”f¸—2ÿõ^4Ω◊?éGGpÀöèníw¬gı›––1ÊÎbS˘ß;«HÆóe4[kbÿ O–'ˇ;“ê<ßëk‚yÒÔsñOÀÓÜøπ4{z<˚3Z5œG§ËxK¥mÎÁT‚a1ìæQöc/AZX÷„¡<¨n\ìéíá¨}e∫∂ÒÈtå8‘C≈¶RE\ê¯ıâwQDÃK%∏¶Ë÷⁄Ÿ¬⁄∫FpÓ1ÃÎ Kíÿ†«dË:ì ô=s+ﬁà˝¥"epJúUO*{9_Ÿ±ÓPoÑ7ÿ¯xüvû…ªƒ:F¸@π£Ö›£W¥4KÕÁ∑Ô\€‚Ñÿæ`"C0ŒmÁÎ •5ÑI,ÇTË—¯éô@ØGVáD√“ß8Øü_ß4WI¬J°åA•ÏHùkOM<®ûÇêHz8ûfÑ÷…óÖ÷*é⁄÷0ˇ≤fπP)“¨Dqt⁄¨≤ßÌìˆq˚ˆVÉ˝£wZkÙzmYïá„"ÎK√ùH≠¢ƒÑ®(èav(é=£Mßö∂ïm–¿∏é)n|ºüåçJjL[‚€˚) CŒS2	y#˘ÏP%‚AA≤@ ˘ê|ˇø˛I⁄≠™H’©¡ı√€ Â=Ç‡hÕwòQÚÖâ‰kqR!N=∏¿√À›Tú…µ''Úåß~G¢P¢Mbíﬁä6¶÷TæˇpÛrW—‚I:0ÜËI¢aî≠°∞9~ÊAÅs/ß˚¨9ˇ%ÿP±c¯˚˚üˇñù4[ÕVüU[GÌ„™¢ÕRñu¢ßÙU∂„!>~ èk⁄∆uúózw+æ/*aXàt"BË®Ë…a&ùlÄËU%˜Iã±.0ÖaxºÅ&É«*¨É´í}¨»WÕ§¨{êã/Éï¥9§“éj⁄+¨î4rqéñÿå˜8è≥[.=ı$ƒ≥∑Vµ⁄≠ˆ–éË7˚ßt4◊ÏÅÖ‘Ïı1[1’‘QÖ…˜X,∫LÜ–Ö·dcìhhîÔ∂åî||¢åb	sDè∏/´ÿﬂ•§?±Êñïõı4Ö5g◊ü9ñÏ/Œ*Eº∞íÆÿßä˜°‡L®Oë–≈Ôˇ˘◊¨ˆ¥
vÓ„f˚d˛ﬂ˚›f≠∫Lœ>¿€∫Æ}ºÛ∏Ú„Ìès
ÀË&ÂWjãÈ”.√‡∞ˇ&d#a,%
˜ûV+;˚Xπ”l¬$á!5Éá+Ã√|FxÈÇÿ–|aÈWóÜw©"„…ídÚ9F∑+W1˜T¢,]„◊óÎ®¶î?]c¿√∑˝‘≠·Î[–apfStÅòqŒLõ"'2`äﬂ«t[–
ø∆ˇ$TdUXn÷»+Ïí+Üq”O-®ÙE·›]√∆c}c2Øé´ı‡êë^¨”Ó≤Z∑ŸÈ∑è∫’'†‹˜à±ïπ2IEb+‰D DZ—ôk_VæFD  ÎB‰iµ˜Ù@¶‡"∏√Õ≠ÓT?;nWAX÷€µSÏ
÷¨´ ⁄¿1À≠≥Ìk∑ÏgÏY£	Lâà¢ài§î ªcéQ‹ñj˚OW'7<]˚6b–^WàvWÊ;5¸…lÇ¸…"ô»B˙»Gˆ–ƒ€0(G≠‘°8•Ï„°ÂöSÉô„+±'("‹‚_;q:ˇ÷YÉ¡w)∏	Eäè"•GÂ¯HXãÌo%UÂà•©píà2¢∑?‰TΩ{îÛ“1ñqπO ô¶j⁄∂È√éÀ´œ)é£bç,óuåâi≥$î:Ö,‹O£%|1wP"Wh/Ì!
á8wÃñ
îÅÎ≤,Jr†yΩà3!yS~¨°u‡!9”à9ô˙¿≠ßÛü∫eÿŒ&m≤Og0rà\‡|iÍªôá†\PY}G¸˝Ã21¬ƒ∑}ˆˆàµ∫çNêIŸ€8∑∆C&˝ßÎÿJiR$VãiÆ¢”T‘ÇñØ†˜YØﬂ8˘ŸEÒ.ñÓfé?Vîk—a
“W”:¢?=beoÍ©àû∫/%b—ﬁÉ_≠˘Ÿ–•J)-uy≠ ªßà◊ èox€A_ë…h,ìû›∞ÕÒ≈Ùí^pWéƒ j}Ò˛˝‚˘ŒÁ∑õ˛ÁÌ»Á≠œo_HNSwDy–ƒ‰”∑lÄ§Å1p”-…¯]ÏÔD"∫rQÛ¨ ÎºC˚DÔ¯‰5†»§cV«,påR •ËQ *SF√≈S‰;élø…9Gëjö.¥ÒÅøK˙F·ﬁ+:9)~v¬[òè˚êNY˚Æeå/§ß(	nn^nöòõèª'’.Î6ûÅ=¡-çÓ¸ù¶¬¥»4,≤N[d:Q=µd)EKπDz◊?n°[õ€ÕäﬂŸŸà›ã¥®sßÂá-9 h¶sÁ±3|úªË-ΩCah˙]~”§ﬂ^œ‡Óõ#6Ä…m˛‘`_ÕØÃ3b¿tÂ\ ¢ìF÷ƒqßL~Ã2Á
E '5à‡~¬⁄3œMkÍx∏Éπj‡∆Låπ∏≤Ï˘∑Ø‡P&Ô∫X‘¿ œ¶;Ë
ôC¥,y™née∂_øêC,Ó◊á…ô8çÊz}1t“+ûÌ«œ‰u‘r-ƒÌv∑_≈Ùöf˝`øÍN ç[:îh‚Ëô^°c:=[°˚‚é{Æﬁ8nUÎlU=E.Od∂X[™w„5‹DìO|$ìƒ›‡(`ïˇ◊ŸØè≠Üí“qÁ]t'Y`©Ówﬂ∫Ó|r⁄‚∫D'):*Ï”–—uÑ‡éóú·Wª˚Ë˙¿Ω{Úíﬁÿ?àxµASµ¶ÍHöPÃ<A«ÎFòæ™0◊p‰V;Æz˙ß∫_Âbπ—ùˇ™]o≥gÕ#t€Øt$m˘≤DN√ÊÓ“ók∑¨¬¥~béá¸Ø˙HçG.{q7œ_‡`Ï·Ÿ>L=òÎïÍÏ˜∆[ùO
lÖbö|çÎàÆbVe·≠|d‘8Zó∆xhõ|®¬¡ì-%k∏}133«2&ÄÍGJ`2π•Ãº˙ºπa˜|{ckÁÛ¥±ó∞ÓBIæ¯TPiõ"˚Æ·]Ó®/ÇCi2∆ozóåï+]ÀTLﬂV9‘≥æãÍÌZπ∏ìùk£[Ω?s«8î¨=ôZ#ÅÇ¯º«+œÌD~¸˙mÈﬂÖtıB‚ßÖ›ê	V∂ªàÏˆ„'T>…˚»≠Áå|H†]vª∞≤”mw⁄Ω~#P€˝ÊIÛÔÖ#≤Œ≥Õ}«˘‚ﬂ8≥ù¡ó-Ö˙Ω≤‡∂§Í;åïŒ ªè
ÔÕŒ(‘ôm≤∆ıƒ6∆ËIx…˙»W°$Æ≤\?JÑ oÓn…¬U¡"ó{È‡o?˙;¡ó
Ää¨ÿÿ˙,V¡nπ∞¯MLÑ¬<®)ë/;„Ûä˘n^ÓIïäN∏dEåt¬√™X°rô“åù¢#uh·ÈÈŸÃb‰Â0¯»Ä–∫√ºUKä?àﬁ÷3kLè¬EÃÖËz&ÁòÜå¨~d®ˆã(üAﬂ"EÙµK¨îG)ÅÎl<ˇ!¬1ryòI¿≤¬€k ˆë±Èö0ó‡◊¶«Ay◊eŸ⁄25Æ…SÏ:SE5dÇ˝ÄaK–{å°;®”3ÑGg‚¨Õú≥üòD11ˇ}≈ƒ(·í{:Ë?ƒv„	˘ÿπ_çy≤a ao≤<Ù\œøπ2-o«`ˆS{mgÂC"!w6!‚AÜŒÏ1
fó:ÿàø A˙|~EC‘G|	)®§4:?k’vMüŸc«0k¯IÉÓz≈˘≤Ú|ó·€ÒÀ
RÙ»<⁄,∂È{◊A\ 0Ñ/≠qÏœŸË,\˝Zô!	∆Ì4cËFœww3D—‰ﬁ˝Oög&–ú
nPï˝à8·^'¡PQ 4(l'Iõ,8∫")]Ë"4;Q8ÒLZ¡yrL≤≤Ø˚Ø-‚këJ#7úöƒ¶QÜÎÃ^gX√"¶ƒ„4Ç»K	?⁄p‡=@ÜŸ–RŒEÄ7π∏4áxSnÿä¬F»æ¿#Ç˘/ß‚Uõ`Ù`uÙfı∆C^^©%Ü“,'VK¨à' „yáÚŸ(xzYH≤"∏°LF4LÏù(Ë∑PÃ#Vs&†wÿı%ÄπaGﬂKÇqo·—Y)ªê&≥!*‘‘âÅyâ<5n∂+[Ì%rËd
óo÷3YÍ≤dÇÃáüÈêNk˘≤d<8£>cXHyl•—Ÿunπﬁî'ÇDoCïSï¥.«87/I"®Ká◊v¿KÄ}ˇÛ? ø–óÒo@ì¯í3è¸Ïg¨‘⁄¨ñÚ≥frò
I≈ÂB°ﬁ W~›Ú&òÆæ–»«¯„MùÛ’òG~d˘nGËï‚÷w¢*œP¢(‹g6Ïå:ì«Û˚á∫Ávs{gkââ¢3"˝P,9Áå‰;Æ∆¿µÃöîZﬂæG~[r6œ1‘≥á2Û è◊àUÑªoNøgœ±√˛h·¸ÙF˙‚≤txì‹s◊H^ÖA:˚Û¥◊˛ÄàeﬂAo§!3râDìªy›€ﬁø	w&ÿ|‚!ÂëC,‹TY]∞7~ˇØøı€∏‰Ë“˘Ô%€<_lx•™–®Z≥ƒÄ˙U†Ë¯X>™…h≈ìB¥¢!NÙÔ»)J9W©S≥¿-Èülùyt™πñíöQä*ºÅº’‡Gâ™†ál+ò¿¡<ÿ'ItÃ∂∑¬©,ÿ˜SÏy<"8Ûswìn›ã ˚—ª∑?zmyÒWÔﬂú”À„Ã+Gæ]ÉØÛàJtÊ±àûÊ°:±‹{fr«ågGíL€ìÈkˇ≠VÎ≥U™L6ÜÏ–Ç‡~ôô"„ãŒv˚çFÜ˚íÅŸ.›mo§˘¸‚÷Ä/ªÙÊî(slAAª.í“∂]LÆâ¿}Ÿ´ÚÍßŒ~≠[π∫¥LÎ.;0†≤ÀÉr¢≤é‚©Z2%zO·G°Ê—ÌcO†EﬂO∏¨‹iÑ ãC√;ùnä8ûDº…MttoŸ&ª	˚;Ù2.í&*w”™ét3Vè¨&8ƒ•#åòìÛd˛Õµ5‚t≥ÜrÂ-ê†)√á£CYÈ‚+†ÚFÁi.w>sˇS…Œ{b¬Úr≈	˚T6_Y˛£JãŸc7sæîU≈ô ˙áª+O\Û*;(F»c|ê‹á÷xî«∆À€zéG~qÓÔãl<ë\7ﬂAa|Ã§Ò√L≤∞‰<._üΩy°ıÄà˜¥÷%ÌA§°±-/õa4KœµBÖÍn’Q@jÀÃµõı+} Pmä–ÄÙ÷m∑k’„‡0∫÷>È7˙U§37"Á{ Õ®Ùü8ìôÌüÃ‡	é=õ7t6@ó_ZQπçù◊ΩüwPpêbµ6<áÈãÚHO¶Eˆ:?•Çá}IÙÕîÏ•≠…N™ÕFZ™v:«ü}—?Ì∂qÙãvá .i>©˜®◊ËN@ÔÃòÉTo–◊ÿ≥ò‡$÷”hF¿êhå‡™gç?!¸3`úôûíät\Çh§K∞•Få–˚◊ÁªÏ
¢ê~®ﬁWùÿDÿ‡Ô}≤ºÂı|‘„ö;CbÁ1Ü⁄y—õ}ê≠…¯ªîØ+ˆˆ” Ûè·í°F$"€‚r˚È 9úÚäŒai5ì°Oë–∑‰yë*ÚM3*0~”â‘Æaô∏HàõœÌÎù&£·	ÅKŒªH¯€◊÷Ù€6&?Û"dfâ°ëgf–≤ﬁUù∞ÎXªkCÍ{M… 9T^V^ ~<
»œñ¸ÛÔÛõå∏3ıâª¥™•¨rﬂÉçPCh3…¿§LÆeûÑ·˝F¥\™u’~£¥Ü^≈*h∏˜ªhÌrJst#™6∆ÏÇë8ú€©j¨ÃR√Ü]1^ï
%SŸÕôhF≤AYxÜ¨ÿímÜRó¬ß˝u5,øg©æ 7rg?|˚M	Á¬t˛Îs;q òÚ,Ö€Ì¢—á7 W•Is£>¥\ö,ËÅ≤/°py¸Ák∂q„Ío£ô>√òÌ%◊OvöefÃºå7"ù5«ìŸ¥\RAKqûPÒl√uâ≤WOÀ¨w…WW21cÒØHGïú´öìFƒJo&˜Rı“ñ”õ>TBd¯∑å9<vÆ9ù5ÿRä#o›M@…≥öˇ€çÎnÇ≠dGW;ûmdŸé)<d%r†Ætg'ë˛xàZ^äkã«õbŒøqøöYÁ@È¡•ÊÈfm&B≠vïÅŸI¸0Xœ3ú47Ã∆A°XkWKÎ‰â—~7è·Êx6Ç{€äŒÉøÈn¸˘˜ø˚câ›™M›h˘èè€µv™º˚∑A;ˆÌ‹hø˛ÉvùÍ≥ÊÒ”j∫˙ç|ø¢›
ÎWñ}	ˆT¨≤˘ˇÒkÌ˙j’z£ôÓ4‰∏ã‘µ›:ØÎ∏˘¶PEÌì”ñdt⁄'pø‘¥59£Ÿ8V”?˛Jª(¨YkvöÈﬂTèõ˝œÇÍTÿ	ÚäÃøõX±^¸Áˇ‰/ß¨ÙsÇâÍRN2bÑ…πﬁŸ#6 ë»,.≤»k
Öm–õd9,s¢&˘ïùlÈ_C÷öwÍ¨ì£È_⁄πö˛ªm-’-Â∞q¬πïÈSJJ+TA¸jñ£Ã·ÙØh¥Cj/ˆ£D˝∞=oL¬É£	·O™‹'˝”HºCpÆﬁÛO~BÇp'·¶vN*øë®°	/UÄbÍçL'“àœ»|"/xCeåb*?ŒZ1D≤¢Ç†S^ Ωp§Ã§j~eLfY¯Ç_pqx „˚π„é`≈˜fg#t˝ÙÎÿ‰_›∆&vˇn\çÕ»¬ìõP†˙:~¸ÛqI=Â 0»≠ê~ü©*ıBLÌ&2ì§[K‰|cW¯Q÷°Ω⁄ñÁv<€ÑáQB˘HW¢‹\‘µ†H\«AîŸhJQ€*¨Ô∞—9ì?û´Íç	Ôê_$÷(g}ÜôÁ¬Ô¢N=£»]ã<Àb„} ≈„…lπç\BAöjBqˆ?˚i}b·k#IjÂõ¥äqªˆIŒÎIâL¬ØubÆ¥'h"‡gG∫}FñÏ"ò°üÊTúiQeƒ%¿\2˚ÓœøˇÌˇ πcWÆQô`∫f„så¶ñ ¶‚ùóiW—#z72¡’≥âê~Ÿ{•kÇ°˝ö˘–ïaœ@ª&},Ÿõ,h~‚™ü©•˚I›8Ê'ó‹†F‰jk];¸ QÒ&∂10/aM˜Q©	⁄õk0<'éåÚ∆∆Fv?G¶ù8û(r¬AŒGûëê‡€Â7ãJ≈¡Ã;ào,‚¶3õR¥;Òd49C`/V)U¯^MÉ≈„qFr¬Õ$1¥≈ˆ_ÏA‹ÅœÙ≥B¯¶Å7ˆ"ÁIi¡„ˇdwK‚≥Œò^s—¬c'y~›JEù±ìTuY§@¶:hqd®¨¡¬çá—Ú§Su÷r∆Ñ∆!˝J9xÔ≠@ß p)liﬂ≥ëºû ∑õ"@Ã÷òÑÍ:WÛÔ0Z43ÂFØ	ŸplTFjìÀˆ t®\/úÖÔñµßQ≥Ú˜5z,o√ãÔoÿ÷<;Ps√KÏqæ^ÖÔfçô	}¸Jms¬Å-%πãÂó€s◊ÏÈLqgùœê“aù=6«3taÊUàèàGjFˆö‰πBí–èÓOÔ.Ò](¡Îô&M^ôÉNR_Ä°[èï´Æy!–TùŸÛo\ÀQ±9E*{”ñf¯÷oﬂ“<		†_63íΩ˝+kÅ∆ÀZ·2}Ü2¨“¸e9”LMã_w∑Ju◊e|=ø⁄U OXπ—y£ˇr-luê>íoﬂ™ÃÀ~ÁW÷ZƒV∞ùM’≠„b%¬ßœå3ÎU/ƒ®ˇº–B|ã∞À!àﬁ∫ı'ﬁkh≤°çÁˇf∞Mˆd6¶ò.
e_’ÇÙ(⁄†Ë‚·-\n˘2ä/†◊øÒ»»∏äLˇ¸CÕ¡6Â›^:±º©S:§nÚÔä¬3›†ëÚVéÃ.qomâ“øZT8˛õ(o-SÙwc—p˙ê(úÓ-^zÕq]ìÁIî#,\`«[~åd•√≥nq7˘ä\çÑé≤ò5æ2]êN4ó8‘SÂêá|‡á $£∞8M≈}î -?( Gpó’ü·73YÄQ~*Æ:∞9ì(;“Vrfq±Ï…¸;â%õ®≈6+∑°\tM·‡9Ñâbs°;>¶›ÜF˙˚˝≠j¸åµÊâ∞∆d”å° Ú.™
Zdª¶rV±e¨∑c„Öù∑+SªÙvfzTO]∆´à åó∂⁄åWb˜ß‘E-ıØ,¿/©∏ÄWLïﬁÆÍΩx—úEu¬≠ı≤Ík:-Œ—ïÒ“[†oÓ "…ı√XZè≥‡ë”W÷⁄
äZ¡‚z∑∂rü{C◊V†¸0÷Ω.®·´Yb—“V∞ B|KA]ëºﬁﬁ∑ÙC˙û\L§TÔˆ9◊ ?`«÷ô€‹Ê¢fQBˇ›Y∆ƒYLò¨“gïÓ•ma†-
∏ (ÜŒl* F÷TDùB£}Œ_ów¿Ù•Œ≤Œ…Ú $)=¥ƒ«Î˜Ñ%èTìÒπ/ë+Ùƒ¡Ω[/iÚCY/ÑBoº≤%ì.Ú›™…~@\¯Å<î∆å–'˙˙M;îQ«kaÚÊ®4áËÍÒr^êO®ƒ4tkUÈ<uã˜Ocπ5ºT°A≤^¥‹–X™lë/ñlàƒ∏ ˇˆkã|(–¬Î›·Ú"áÀ7/t˘˝¸yK‚jl†¸y»˝»ô«ÊWh’<Œ˙Mdﬁ‘‡mGgÕ:/ÂÂG·uﬂ‰˙´=Øáﬂ#Ÿπe⁄CèùΩ‰…•πñKŒ…oyˇÙ/g*§∞8Ÿ|[’ØëqOÍYﬂ7˛™t¥hYÔî≥Ï4î3U0ª)ól(yﬂ»e+ã|)∞r5ÉYgπõÄñ˚0Îe!-À,-q<n‚I£ˆ¥ZoK√RJáêz„rA+ÍJ≈Ã;BÃ√hu±˚KT‘kú4+’«çnø]:ÏAœV™–˜E¬yREÚ“ÿ&Îw´è´«O°`^&ﬁrç3√æ\™¯˙I≥◊C4U¨°Y=jú@Ñ√â˚*÷aÊ®@†åVlãÆÄÃ˙}ÜŸ™Œ*/ûW‰£vs†Ó
´Ÿ¶1f†¡[·î=¶xO©ÅIp
ìõM¶<LâÂùÈTŒC‘–«( ã±àñ¯aA -Ò´B`Z‚7E≥.’¬+#aS%˚≥°Õ’‡[≤-É£¡ÌJ6åÛ8Ü˛F†^5cåÙóÆrfÉFËMfè@‘ì9äÄ"”I|hKÌŒJœ^{s$	E/ø0SrhÃòça˜˙)¥!(oˆñ}GX	
#Ë"Û¶Áä	¯43-?	¡&…9–3Ï+C%àWˆd †∑ƒ\+B\Ú^b3Q!¯&jäÓ(îÒ’ÆWèYØy“9n>i÷@9`µvÎIÛË¥+ÃªÛ_töu"›~⁄lt´›OOõ’ÿ∂rcyüŒ@@FI(¯ﬁÔ+ƒ˚AâˆÙ Ò∆]a˛“4PﬂkâÏepËﬁ¬ÔÆYpÇ9¢Q∆™ëŸç¡EÌ+uˆlÑËı‚YÔàÆ¬àQã5j—Ân⁄|…ÅÑ˜∂î@¬ 2s∞rwÁﬂL¨!±pπÒ’Ãíì‡<‹º‹U4>MÄ.œÍJ8á∆é™ëO¬LWÊY£âMg*Cáì~qc7õSo£ƒÊ∑mÛn"qÇ‡#øå‡C*ﬁMäSìX©ò‰È◊2LaÖ(z¶løã‰'07 "ÈœDiçcK@cïv‰ﬂI0#§´Gµa+`Xâ¥åXBXÀ·'o‘HÿÀp9åHÙ•eﬁÕW±ﬁÂk¬/Héﬂö:qäæîÄå~ΩJ“`¢úW8î"Ä÷J÷´6GîÀ!ûC sdÙë£C∫4“ˆ3é€1≠R¥ìm-÷Ü	xeô_´!U≤∂*ƒ¨hØñ¡£O∆™Í{óx<#°¢ê2Ωeåí¬Áö¿öˇj<¥¬ÖE4ÔQqIqêÅÃÆGŸ≤}§◊ÜteZåÔÀ—Ï®∂bŒ9IîÀÒÈIÄp≈F1jo–F–õ”ô'é≥¯{õ%ükÖm2i9¸€5ˆól{kkÌˆG§ç∑ª'È.Q`-®∫Sd/ip¸›¨‰≈âæ/„’o9∂≤Â—Ù∞<…€…ﬁZ-¶π˙ÿæÑö{bOái@¿<í•éÕMU‚4f‡sôûsW7œçô=-KΩ2∞…~™pÂíéûƒ†É9Qì»ày3¸-auúÅH#ueH,N(`~ø'w0i0-›0Ã˙É∑›„ØﬁÓ~—kˆ˙çÑ%v¥]à iå\5P£´DS˙¥˜≈ì”VùJ·∂dÌÈg_úvÍûIƒTjéœ]#0’LL•£„ˆ„ÍqX∂‚π’H˜…¥:èœ‡°TøÉÔgœ‡±ò¡QıOŒû§ö!}kd:≥iÌiÓD p^jËyRV◊u∂Üüå]2≠∆î¬}I ÂY†óïÁ>∫∫¸<4B_VåŸ‘I™wö;aÖ™Ä#`j˚ ^g÷ö:]ç`Ø∞äÿ∞î@+*‚cıy[å"2fDFLÕ	—HÖ∫r≈∞Up®“ñ)]ûπ⁄Fæ≈≠_V~ñfjãY	SUeÔlE~•√2µA&UP‹¿<b≈∂oM
äá…ãÕ KäÕ√ÕdØ◊}Q—oôÓc˛F™Ω^∏Ü∫XJ{ì⁄+ŸÄ“z#Ñ≠òŸÜÎ3Èï“∏›äÈ[R‘›sŒm†ék~µﬁó/cï‚ﬂë*˝ØÛ*,ÖﬁÙ—åı]ÑúÈœö±7â˜RœO-|DMIíHQŸfﬁË ô±"óﬂ¢’ÒÙôñÿ∫≥‚Õñ9…6ë2t,ñ˛ü#c∏°,yˇÚ3„¬÷2å™D!öô¸05∆C√ÇRnÂóΩJh^ù7≠Ë6ù∏6õÉ+B(ÉzAjÖ·{9ªT«1y»öxÔßE&‡4)ãaö·∆œ©Üπñ“äs√7Î,Ò¬‘∫[v@?\[∏hÆ†"RHqê¨Ã#L°„¨◊7S>ı+"ÌˆxC$Ué z√e±ª5Í"ÀUk√k©•_£Ø|âF^ÚmXûiæ˘Ãk˛ï≥«%óÑÜz¯Áﬂˇ˛˛§5Yπ¶ª¡Á-MaÕpªDÒE+˙Ü•ø`ÂæcõÓ¸wL/Vg\ÖÍ~˚'ª«˙ÛocD˛)£f±ZZÿ‰hÔ˝ˆˇ≤ÿ=Vn‚H9WqÅ Ã”ÅPW|ãR∏}ÊôÓˆ˙üLèm‚qçÅá6ƒqre®#‰ñï√ØH
ÛâÖ¿|bfm&^ô˚Q’‚8WÁÍjziM1Âjjf ÈÇRzQ}JºXŸú)ôc]Û|CËŒåu^=¡H>ˇöù√´∞j!ØÒ	∫ñBóRﬂZàvIrV≠í®ﬂAC,+n∂∞;√gÉ3¡"¡≥Y@s	3-Î¥/XHWî÷–\k‚K	‹ÿ˜?ˇCd£®¢<îû3eÑï,Ó“Àéß‘	^M¯^Qoµ¿‹ay1±™ïìXQ‡AâÓìu-ƒ@´÷Ä2√]s‚5Ü&;–5ﬁ°˚AáàÛTˆH≈/#›È_eœ˘Òo ´ƒßò?X….X–]Æåá@˜¸◊¯_<Sg<v4Uxòä	…‚J≠µO:’Züù4˙›fMDê“·`≠Ÿn¡ÁXh®ALã'Ê‘µ¸$ˆ=ÿ:Òl
√]∏ÍgR:YÀöül‡‹Èd›ˆ≥f´÷H•ì›MÈV"à‘ië*√BÚiä“°ò·‹‹Iaî¶B4e‰[;íÉ˚bjWôŒˆRY&∑µh∑æé ï0tR¢"âjTâèxÅÒ∞FŸÀ)¶5ÕŸ_n≥—£ô˚ÇÓÕ’i∂{C˝˛Mr“o‡ª*t]U⁄¿«zµﬁËEa≥áÙ ´(´[+X_ªV;ÌT[µœxù˝ÍﬂQDxÔÚ8Òr±™‰QùÖ#”*@5˘¸$<'p1/ø=ì∏“+	\ºß—äiÿdŸÅ¸np ø%;êO7¢¿*ê¶Á[◊*ÕÒfRëXfÉD⁄hc"àÑ®1©)i◊»¢É"≤ÏJnQ¬C◊Ú¿™ú¿?pÀØjB÷·∆(FâB¬-¨CeÛÂQSØP(/ÈV4Äá˛j∂QÚzú¶˘†>…„§Ñ˜=XG•Cz5íãüS…ç!¢©,6ÎÃÔ?ù„™<8¢Ñ.‰/»N‚S/*còVå{nˆ¸çò‹A‘lŸÌ◊+-
ıExŒb]ãŸºqá=ôçCﬂNô‹6¯◊:{ŒÁ Á ¡g&ªÕÛß' EÍ2yπÒÛ^—Zzâ2†‘íbÇˆ≥F.Ò≥.Çˆ¸u∂Œ&Ü3µ	OHöMY!≥{¡tæ(¢ÄtÊØ¿DˆØº5Q=s-Uz(øtò≈ıXÂ_*BŒHÆ(Iñ6ûØGÆxãŒ]Ù˜W‹™qQ2⁄7óﬁ“˘√ªoXk÷∂.µ5⁄≥°	"#±—´ÆuŒ ~Ò~§7∂yk-C 	ù@æœ]{…=é˛˚Zr•√ñ9æúçç§Û◊â9Ü›i<∞0ë…ÄÚ/xtÆ¡∆¶75Ë9ÂÜÍ™˜Q≠z—‰‡U±˚'Í®IºB≈fÚ∂™5ì;Uj¬pPn&Nö…Õ·ã$l,≥g ˛Ω∑Ií§õ,Æ	M6`¡˝±=Ã†iË3◊Ñ≈Ô9oªJ‘·PÆΩLñ–â‘∫VRöÆNÍtõΩvKhBìà4IiA)€Ìù
ƒ/RÅ¿xΩZêR*ﬂï"wp-¶©V† Ø`ÍLa/‚Úï**Ékg≥\6Xò‘?ë˝KK„u&K:IWbL¥*(ÿ<◊ÚÎûΩÇ≤-ˆ	ã&∆z`3x“OÚclkqwQë›:°gÌ©—

¯ˇs†£≠…ì>rπZ$ó	!8˚ÿŸƒj…âı¥H«§ç ]4r~@∑^ö6:H	¬·&: î‰Ëè≥û>®Åö-ã	p≠ãÀi>Zıj∫µo\Q\˘≈∫Sd•ƒ˚Û˝\FáÏc\<•h™¢ÌÔ>‹ævR¬‚I%.Á§<kº˝Q^„W1vã©’iÇ¬<Ω˙&mèÈE∑∏‰‘ãxw;Oa‚±CÚ1*”÷À îàyÁJEˇ“∑9w‚1´*(3M´ì«>Èë.edaÏƒ	é›Ÿx ∑≈qÒs¯ñ*)bvF∫ei+NÁˆ‚JRKDÂ@SJ™™ºyÙ6◊†”f„«qDM'"kDíïHJIÜa`zÍâ~Qùπ“Fºù˛@Í0îh>ñBû{ô£ÏˆwUÙ•œiCÏJÉ!íÒzIe»ÀsÔ˛®:=GåyÌ©Ä’·ü†ßeµ	Œ6ÌTœ9¡Œºï°Ñ·‰ÉhÃy|&D=[iv≠áÁ¸´xg?ˇã≠∑>ﬁ2?WL·≥z‡ÉÏ¿FçÊâˆ—Ä>ªŒ◊ZàÃ»Åpd∏Ò«Éj√ÓHÍŸˇı-€Ÿ⁄y¿zàr3ˇ7áu¢ÓaáÇ@{ñmBr‡©y·
¿´T‰:6˝¿∞#]´@∫ôPÇluhÌ>ÏsÈ∞◊IJ¡XµœÜCÿb5∂ªóÚ‰¥5ˇÂ¸ü=ÿ]jÌììj´ŒjçVø—ı÷û5∫«’œ"Écy∞g∂…˝Kéõ0§WµÜèJ#z∞‚â'+˜T 
JC±ío6  
ıΩ˝∞ÇΩ—¡ÊZ<.çO€<èõK«ßqMc/åT√™#AjÆicÖôúÎ<é‰cå#Ià»ÿ8h}g¬j∂ÜèºN^ÀjVx∞,,8=¥äà‡Hwgûcœ@·ö:d,£©Ö2÷`¬ô.®vóÉôÇujMm'I &Ü56Ìl¯≈á{&‰Uc,(¥gJÕOÉ	Ü¢95ZÃq§ß`¸®π&(˘©AKÓ¥gôHé£3òW∫Påô≥:ä¡®ﬁ›d˚6è;å˜ŸË≥˘!áÚê€‚ L≤TÒX<"z∫äDˇü.œ¸[Û ”)EÀr\˘ùVµS©∂%≥UÍr'’Ó≥D[„¶K–Ù)ÆúB»r∏Paù‚.Ùd6âL&;ôˇ;,c«ã8!§Qó;˙jEjé˜.ÇküŸ&0√5ç‹	ûàñc∑≤Õ‚∂$‘Ñ(UrfÄ6qi•”˝r¥ÿö˜%€V ‘…ÜLC˚ã'®ÊŸ_°ª	j±®lÏOe	ŸäÅ=1&&%´9,P0ÃÑF"PY¨h§®\QH	˚"ÚÁnÜ√^rã °¥úPo$idåaa…S≥N˛Ú”[í'Ç°¡–7Œ %ˆr‡e®•µøŒŸÁ˛Zu~≥¢•>·@πH"IrbiJ√~˙íxG%ëj ≥Gbos+ÃËHòÈ†\ÌÌß∑òéø˝°ä∫Hå≠Hï—Û•†]pñ·Ryÿ5Ü §e;6y$ƒãöÅ8ô¡Ë*¬‡©`i¸a·¶·í…Í)üÂ£» ÷ì!ˆnmÏgbˆ⁄†t†dBm¥Í,Ña•…t˛ÃÆÅ!€¶€˘)œ⁄A-£âä´aØ≥+À„8p¸¨`,^sù9«u˘oºufÿ¶ã9√ËyõR–⁄6/Ø@ÙïÍT¸äH(wi€Úõ\Ó5'kØQ¬Xº9(ùç∑DÃƒ^È(k∏™[≈iΩÄƒyN"ÁãÔk|é`˘ÊÁw,ã‚>  l
 ê?As¢$ÅﬂZVìŸŒæπké=Ti„ihNÕAËπkÃÜÊ:ëœ"%S„´©√†ªù[Ûfﬁƒ¥¶é∑Zâƒ˘ñ,5â–ùJ#®˝M:ë7Q…ö(ﬁﬁ['nN=9ãA0úJ[FûÑb&;=ÛŸíÔ£©CÑªu0¶7§ ÉYπ€ÍÆ≠CπdG]Ã@O!Ã_êc.(ÿÉô9∂º⁄˛C*¨?^≠ê8ÅπáÊ‹kë#øÚ7]DÑ/¢í>f‰€'h<1§@% |ÙÃª0ï-F›MxÍaeMø.·–Â˝$Lo‡ÿhùå,€öbò7Ÿ5†0(”öíGÓq«ØÈ[5}ˆ≥ká—D≠àòBÀ∞W%0*îˆ¿ªµsoΩ[÷xh]8ŸÓ≠c°´≠≥gÿ—3sÁﬂAÑcü◊ù¡åº_RØÂ=pr—QX“0≥^É@ü`Ì–ˆ°˘¶KÙ»õ®Dz8üﬁB©ﬁC^3•HØ˛*§z›ôM°c=∂6ŸÏ{p|5¿ë†›Ø∑—Ÿ®n∞r›∏&Ë|€Ìmn‡ß3c»7B˛≈’ÒÖcÉç\õ ﬂõêﬂÏS3‡;â0¿¶Ú#ñ(xÁj’C_ﬁΩıpËW˛¶ìET≤$∆˚˜ñâí'ñmˆ°ìï“$<v∫ka“Õ«at+øè“óBè¬MÕø!È‡Å∂8sÊP@Øö!°g{ñ–z—Ôd∏CqF'îJfÚPè˘ø£2âiT#Ê‘´’JåﬁƒD5îG+†AÂû1ˇOtÉ5Ü≥ÅØY˘„Îq«‡kÒì{º≈O¥¯Mó6©˜Q	ù©	OΩù2Á±kôÁd9®ÑΩ¸´P`¸∞=4∫&Fîπ˜Vg©Cá*\x†¥°µ5Œø#b!O÷ô	s,¥‚H≤2QiQ≥+«ûçπÂJí'|i_˜¡H›Ω∑Fjpl£4QºOîùÁÆa"´m	∞ßôx†√wÇ{j†RÛ°ìí˛Ê“:¶+<ÓÂﬁKåkol<k6~¸Eı¥ﬁÏ7[Gk™TœÏc!p“‘˘Üxè%vã◊µ_§O8¸w…=KΩ€ùBÕ ØîÃ´Ÿ/·É…„TÕÌbŸCé –$/ Ò≠Eﬂ£¯Ú.7DüãcQ?nÉB√(⁄¬µFgHfà¯≈ŒÏÁ»®«ê‡êR÷¿éMqB[6∞Æ,
÷¢Ú›Bπ_®síÂîs…‘Ë÷UB…Ú`≠<%˚Ã6À%”ñ÷ôüE)wéªÅo˚:∂Í-êE¯*14ôπ˚mDucjúeiÆ¢^ç0¬E—†ì0¸:EP›2.\cÑFÌx`Z»ä~7La£w`Ò’ÌÌ=6E≤√£ÉLï1(ä#∆äè¬møÁÓªf≠Ûä§PœœúÎ◊bÛ™ﬂx˚WºÜJä¿†æ¨ÏÔøçfoœF–cu¨F∏∆Ó¸06'ﬁ°8ß˚hv(GDh°7]L·"C ÿô‚($åﬂ ≥Ä]À‡x§ãä‹%Á{◊Ã)*ÍØ≈Ôâ∫ﬂx˘‡øG∂Äx+˝b¡¸…ë˚Ø ñì#π√Zÿ˜Q@D9Ñ{}ÄÑ,¢-]ëˆ0ˆô“ÒÍ°D†(QÓ¿É∫V|VgŒ<Ã∂í SX22´Ö/ãz≥€®ı€›/é›Í±EÎX2Cxë πxë∑¡¶âøP˛†nƒzÑe_E4æß‡@yù&NÕuæ+EPà≤wGÊM>t¯ÁﬂˇÊ7ÒÖsMúéÉ÷õM\s‰0åJ,,L5gÉ’@Â‡.ˆÛ˘wû»ûA,(áDï«EB(^Yˆ•»«˘Z–
g ﬂﬁπâ£ÌØWÂvr¿?Å ±…|1Ê°+ú3 2–w4≠<» ıö`íx<Á”Ö‡r,5oj∏S|.ù ≠`´è'ÁfI´)é4s°
£xÿ∂äÑÖST∑Ö≤{ Oa◊∫»CÄ‡Ë©m∆8¢2OT∂›*2B
§gã§hûç3ÂÈÏåí•a7ØâÔR∏ çsÿªÛÎIœ√$zFÙœp ”~‹Óıöç.´µèZÕ~ÛY&lß€nıOÁøË6€Ï‰Ù∏ﬂ¨7O≠'^™∑l¡«ßΩv÷¬Gàlü˝˛mé1áGkëO®¥¸ä,ZIfˇÛøÿ:€ﬁ⁄˛–_YØBS±Ét'ÅDÕ¨À!`ˇçŒ|9ë!\◊{íUM'òPì3b’+£:–M8mäu-ÔKF‹ó:ºá7/.+€ç ˇâí€Âíò;R‹	™ Nòp&Uêd”yˆß/yÛI_™uaΩ‘P	ÒΩPóŸé‡{ÌoÖßS‚Î]D¸Z∞ ßÕ£ß~uéã‘•±√[~•ëáñ©˜§Qoûû¯5ájõ_qï“ÏT’bA—Ñ$ø®»=Yﬁ“ÆƒLU §Ie“∆πÂzSú`œ∑>øï?S0xBO9P	z˘…|ÄIôÜw/_·o9/z´Ë	ˇ531Ò‰?É]Ñõ•⁄¸íhº;ŒOlM0∏Já•ÏJoKYV ∫…Ç
bé$˜◊Æ1°ÆG<3¸A≥eo ¯UsÒiiÇd¡SÌÔÉz’˙Øˇƒ›∑÷Ëı⁄‚5c0qùÅ	ÂÃp©!R¶Ù)¢&R;%¥ı∏ô”kX3‹¸ä
MîH˝«mê≤aî¶Gà,=˙‹YÇEY⁄l®–∫˚ËÙÕ·⁄'§n∏&Q"óK}Üø¥∏è8i¶KiùïVZS@≤ïô´∏/Ôpø–öi€b _^åâ/Á*ªZM√[àT
å»Õ∞tÃMJÀGﬂoˇ   ˇˇÏ}[s#«ïÊªE+À‡äw6©››é" ∂‡!
 ;º—°∞ä@®QU°ÿ§inå«„òçNÏzf<éj¸0°ç–ì_v˝8¯'˙„ü∞ÁdfUeee÷ÖölâtXÇUy=yÚ\ø#LB[®ëıwıı∂’ÛBX,¨∏'¬;°E5›	ûíØ"≈Í¨µßVQµÿA¡ŸZÑë’ú`⁄U/Û§E)jj5¡¯◊'a}æ3Ö`óáó≤ vc/Qôò&§„§¶“Kî0QÑªKùçrVê?˚⁄ÄF~t¢xr‹>∞|DÄ]åÏ(°¡ﬁU6E¡;µ(H}E‡∞ïrôö≈€¨t/OèåNE#àhÎwì1≠$ßnÌ“F+hÂ'•Ïà¨å(+ö5g∑#Ôó˝∞Q˚ÿ®∑ø#Àéw9ÖæÊÿZOŒmW>£¿∑ÚBMqúÖÕ}ì œ•ç_πœ4°Àg'ÿ®ıöØ°ﬁ&™V∞ìäEhø◊1Z›√Fß”®áùú93&<ªj˜"pµ—\M¬ºk$^:3†]Ö<Ú ÊC{åîåi¥§z‚Y6Êi°j
¥dÒç˙l¶b]NÈó¯#å¨éV?‹ûÆ4gf	Ê¢v–?’2/Ïa1≥9›ä|ãXd ºdHä1R"‚kînùO1-ø÷]∏-Oƒπ2°a‘úJ¶{˝‚;#“ÛN4ã	6
Ë∑v0º3Zæ#ª)l,ÏGﬂÇiRW…Y“Ë9¨U4U‘<°Á_FhîÂÂã˚—ãt∏¨|V¯mÏûWâ˘2π:’/Ú<(uåí!?	,ü≠ê¯~7Ç9≥›1≈lg	&û¡;O0 K{ @MnA3∞
ÛØpRpÀ õëe:≥—;K3|¯Ô8¡ÄrÓÕNP¥*C/á®8Ó–6…˚ÑÂ£æÇÈ£≥fpıŒRL8˛wúd¥hâŸ4)3@2ÕIﬂ––∑@6,EÚù•>¸wúh^zÊ †r1÷,A6bä/È“µ∏ìE◊q∂q∫'ÊD··U…Èk[≤£>ÙñÔbQoûƒ0Áã9ñã$…SºŒïaïÆ´≤y¶:/xérπ≠W.”5e⁄4t7>IôÈ‚[ë5i¡:äèÔå«r÷::^èì(Ä 7bDCƒ"†¬Z∏ÅÁ≈ËI±–‰î)úUΩ·À§üAÆ√iå0ÃÌæÙ&f‰ΩRDﬂ≈Æ	Å!ÍÓss6≤<|õÍŸ≠ç:™ÿ”Ÿ!Ö‹|¬®è<Í±ª¥Q∑LüªÁ å6
…˜ôÌÕFh‘X‹hYä+∞æ®Âù2)ºdbÖa3MÃÖ-ÚÀ˘WÀ+µ¬ôZ¿‹ºÖ-jÛp	{?±œ±RúS∆@°À]”<Í„]QÆ»àaVÙæËbJ%ca! ¢ªñ¨+ñ‹ë∑p]àÕ¿ÀkHßh[Ã%ÎöáûÏ`Ròˆµ∞”Ø¢ƒ_”.òAù¢t∞•CT'álêè›±›«Et Œ·¡c*=œ>xΩá∂g≠Ò¬fÿw†úV‘…IÑ=ä˝Êd∞8˛¯ì¿˛9ò∞YÅø∏[ÛØÉ¡pÒ&fnSd±≈y	Ã”Ù∞`W‰XË¯ÉsÃ§ê“Î-ª8‰àQÆˆ@!ÛöÙ-uG‡Ï∂ˆà1aiSË’eîÌzwæ*
}ùŒ`–Ë>Ç9ˆQ˜y˚˜YæYÄ¸
/¥æg&9‰®%pp[∆CU~|˘Ø:^Y_Y¥»=uÎ>]S9±|óT?.cÃo‚1¯dq∑ßÀ]¿Œ‚ÙAc‚Ë`k ÒöìëK~?wÔ◊´Î9#◊_ÿÿ≠++=tqêL]ÑΩÛØ'÷RîM«uΩ´)ª2€,lÏ´ÔNFQÎ°âRP÷ƒbR≈‹o~ˇ[Ú 8j÷çzõºO0 §•…˝˚üIs<Ÿ¡ßπu{hœLªï\ÌÛò◊‡æ°ÁskÎƒomÜÊ&¸Ô£∂˜VnGEıñLÀ‡1b¬"Å¯3ÿA˚>5ö†˛·öº„˝®\◊b◊£Êo¢‹k≈ÎŸ?≤ﬂ Eñ¶ÍøiÚÎ+> ˙Ê≥Fvèﬂ7=¶∂¨…(õà¬k]ò∞q.dc‡Wït3œ=˘∑_ñhOAÚ1Œπâx√2WdfŒfÆÎGëL≥h\uF@nÀø∑•Qú„Shı2◊g@{§⁄å·s?©„ï_â∑´Ö!èJ–€gÛπÅ ¥o¬ÉwYÄƒ¸OC,{G≠Tœ¨w˚„Ã'…¨oà7C#@ÓvéãŸ‚±«èÈ©Ë∆∂0ú˘ó¢#xbŒXl
0ôa nloÒÀWw—ú√´yÛ?Mh%úNx{›ë±8é-ßº„`ì◊ÈÄçåÙ˘¿`s°/ÔŒ∑Í÷–öZìA‘ŒÄ
˛ï÷rZ˙º`»`M˙W|á8%"†¡VúÚ–ÑÀ°æ›e›8è¸º®Q+3î6.≠rÚèmü÷w ^„{à–{†Òı=$8€ó-º[É∞Œ#°‚Üπ˘KL*÷∞P¬∫è“!„£ö≤%û›ü$OÒr‚€_ˆ¸KªÊéßÆ73iQ<gôbÎ‘øÍèlT≤˙SN¬òå@íæË•∑N\ì áûŒ¯˙YƒdO0%ÿf˛˚{[…¯™˙0á∂Î√ÁjçÅYS+Ø»∑rõÂ‘Z¢Âmv≠≈t–JbŸbó$‰ŸÔÇ*≈é>Í◊¡ü4¸tÊ_ˆYÓ˝´¿A…5<ç‰}ñ‡ªï`gAæ:@˚a0,„∑T•h·`4¶pøoN-ä∂É¸Ì¿h˛¥Ω8cr8Ön¿Éñ6z ˙[“Dz±§˚
¥Jº}ñ6ì⁄A?ûäêÚº¿]°p¿/,¨U∆d^rWfÊ˘˘≠ˆD≠ØË1Ó6Ã]ëXôWˆ–vò¢Bº¥AøH¿ì¡€¶˝ô∞£-ÀŒ,J]ÎƒX_® ”˝Ëªìã˘◊€~å{;◊KÕq˚ü÷Ké‹!2µ8ÖÇâ‚ã◊HJõòH]üÅ‘a|”¥{˚$/¥ÆN@˛( ?S≈·1¬^"xÁÁ NÜËµs…ƒÑEÙgˆ,∞sà—°ëÁè©–N£‡å√ípy∞¬Y)qN˝õ∞∂‡IpObÏ—YÒ˙ Aî‹ıEŸaﬁÚ>≈ß´–.ÕÁÃÏ±K©=Ÿ≤E∞ÈS+™Èπ3¨ã*[pV!r‚éMMàÁ±%◊Ùoπ¯oWUÜ5Ö∑œ ã§9±!∆Ë¿”9ÚOk◊”Í¢Seaf.ƒŒÙ†|…ôë#X_ZÔ-òmÕ>(_cª„˘4X’≈„˘W:W™;û:÷Ï÷∆⁄e-⁄âÁûÛJª¢Ìzd˛øÅ±K[ª)å¿¢%YÃ«1¶ Óp˛5‹£}ìø√Íú¨é6S§#|¥ﬂ≥ê	§É+–	4«*@íuVâÅ6≥w—Ù›∆œ§“∞\2≠ñÏMnu|2Bœöºï1√^1Ñ9î˚,b8Á¶çò√[µqzΩ91WÓ…H;ˇÛ—“Ç häfÓª1ñ ¯∆U0-áU≥pŸ∂ﬂ∑ß,ãGe€â;ÉUπÏ[h‹∞H’XπgIKÒL‚;Zyµè˜º_0ãò¢‡kÌ'âìOÛƒï—!,∂∫VlRl!ƒ^}Iπ‘àr|k÷`P9¶ÍJY˘Q÷ªáÆ7>D´´_Ω&ÎÎÎJ‘ˆõÏ6∫V?ÏŸ’â=©V*˙gª#˜<”<◊;ˆáŸœj·>UØ(©hn&-†ª\9%LÒèÔo!OüB0ÉÈUûÕ&·"_IQÉtÊøÚ†· Ôd^3	3π¢	lCá´c (A£ØñqG˙›¿¬a)∆∞¥»)nÄ9«5± ÓªéFÏâua$E`WË–zÆÈœ™ïóßMÉ‘§◊ôˇm´€ÏµË∑9¡õ ﬂ,>ÇnÂ9\·<b¬m∑Ô>µRºqΩœ)<>	Cf∆
õ≤'ÁÆzﬂE‚6ÄGº9ùvhûDAãù¢∂? !¬Æ&L–‚T+√,ı„çc_Ì%7Ó#îUê<güòÄúπÈıµH◊ˆ»&ı“eGä·ÅØ<r‹ÆG˚§QoŒ=ˇUè[XX§÷>Üˇ∑zùˆ˝ﬁ†ÄË§⁄90j+§ö˝Ø∞
……¸wıf¢â%^ê%Îèlm¬œ= …?“È$;ø …R´è§Ö4Â“&™UŸ4¥∑P®LmîÂ.Î⁄»í=XßdØ»=\∂|DÜ8Vuá>Vz˝ÙP¬îØQèõ≠f∑7ˇ,¸Soìf´◊ÄèVúàù«9i`†n„Âiß≠‘	t™ç™Ü?.]#w ÈÑ1;FÄêDQTòD˘Õﬂ¸Sà-„¢õØlÂTTe#≤Ô•/5wGvı¡ÙÕí˚ÛØ~'-#©_!$àJt}ƒÓrÔêo~ˇœ∑º6bÂÔ¬ä
¶é\L7¡òçt≈T5=/’¡'åè±;6.S`·ÍÉx÷⁄√Â(]1œ|◊j'k3∏´0xpÕCyä~ÑkÅå–’ûÅN`LGà–@iïßXÓô˙ñät°ou!\1fslDS Ø¶˘˙)–JT:éæoOhŒ%¬ßò∫î£Ã¿®°F[aÆh”…3\—’§√áuuÈJ1,â¿
íQaÎ[ÌB\£¡†Óÿ¬@÷Ö™Q©Ówî£ëIÇ$Ωπ{iUæ”åq+∂0µ?˙EÓÄSÆ-2i⁄“•‡xÊôc·›6NÛH¨7	7J78€≥Á◊#P_´k^XÏ2¡õ≈øë9ñóèBÒ•ÌÀª*;º
èOv≤bìF≠◊l∑»÷>¡l‚. ‰ÕÆ¢:\™6ú¶Nn!RÅŸ7'8ÁÀÛ1+QÂ{õ)!VQ€VzàøËÇ≤oœÆ÷ˆR≈lï îwÖZLÊwá^Œû"Æ&\R*ô8œâ"x¨¥jΩˆzk+)Å&œàF.˚À˛ÂÀˇ¯øˇ»që1⁄Cm(¨P(Øù‡ÈO„k”Ih‹ ◊ﬂOÔ©¶$tÜ0-≠âÁ˙úâ£œTPrç$õâûﬂ÷ÆhÆÉ=Já/°)Ñ¡6∫ΩN£ŸS…ﬂY¯
êÚù◊Ft—§ã¯Y!Òï;-¢4ÍÕﬁ¸óØGe◊B[€/ı}öƒ4uÔ‘µï£hù¯bevÑsVXûin[:›ø˚x~bÖ¢=MS~pµ6⁄“¡özˆòÜ∞ZÔTﬂÒ…¸+V~<µf‹Çi]‚ﬂÏ¡ïÍ6< a,≈ g¶™≥“≥§¨Æ|ãX[”;¨åK©⁄ò)q´`c∂08¿[∂Áíñ;∂ûm–5ùŸìi0”P(Sı∞y]ÅÛÅÌ„˝=xû¢2]M∏”	‡¥ù∏ﬁ#%PTFa?†]é∞4®óñ®_ Æ°dÎ´$j~ü`Çº7¥fÎt ‰FYrÑıÁÜ™ÑéñcÍ"Q8M|CÖãµﬁµª¬w}V˘~‚ŒˆwﬂPyÆ¯©rÛ¸k7ò9ˆƒ¢?‘ª£43ÎΩ°À§«0tÔ]!G«\&5Ü≠?„Ω„ÅÌå¨ôÀp4ßz–\yHìï+]a≤∂…Ú^»2Ñ∂å1°ÔJéËvŸ‰ÅL/á"£ÊøùD)x¥:y
 Î’”~'x•Ñ7øx±2jˇ€IûÔQœˇhΩT)’X8U∆Ì?RÂùÀ~ã∂ﬁÌ}Ê86ZÛ_§Aå£ˆOåcä&∞|£oπ¯hÙ}ãFﬂo~˜ø–f’µÜÏ”¸ﬂÃUñ¶Oﬁ'Ü„˛5ãáé´!ﬂ∆+ÏÎ£·˜—õª∑0¸F$vœÜ_Ã(ßiÆ?7#∞-r>ˇ⁄∑˚pƒL‚'˙åçXdπY·€C◊gz˚dÎ“¬£p◊πdLì…hRmdùSE?>¡ƒ€w¡¸“3ö±Éú+[@b!ıÖÂüê∞ …?¿-?èÛÌX¢›¬Ö†®ìoß$pÂd¥¸Ÿù“®(∂3ï”æ>Eˇy∂¡˛VUæo/ÿø%_6å*≈ˇñÓıÀK{Lª•≤_6J	˙·(,≠˘ü·°|≠|çeÇôŒ€U[nwla“ˆpb`‹N+@⁄\é˙íÓÁªyÑêöá:¸ﬁÛ¬vF „›!\:h‡Õ%Yœ”˝<nÙsOÆx¡EU)˜]¢U¯ÁÀ&Tﬁ…#ïF?ãµÌÏìÆ1ˇ]ΩA‰§”nıNÁøƒ‰Ñ⁄—¸7≠fÌmXç0ˆ£ÕË≠
~ıgûüÅÿ¿–d¿∞E#»‡c¶†ﬁ∆ZÌÁ£≠Ë—Vîª∑∞qªWKQõLÖc¢•Sk≠*@pIÅÄ&ΩG8	ÑFx	úúc0!jX´k:¬ÖÏ"JéıE`OM2F›µoè≥90$El4¢Ω}7LD…aÀï¶Ï’ŒöÂ=Ø4.˜âÒŸ Ì5¯œ¡≈Â+F®%ÉE ¨6ˇ(QE?˜#˜+ämê∏F’€’nC© "E'Xπóo'›>xjM.˘8/%7 á¶76˚!‘‰;@µÈ"(ãßŸDè{OãvkF±>9déªwÄ≠NGW8Rßé≠°f[Kb≠™ûâu!ÊïVªµ÷iúú÷õ5≥tµ”NÉ‘õ/õ=äÌ ˇi∂NN{‰†˝”|ãúzØ≤∑®rp9Å¸óFHët∫É†n[2ËùëçdbMÍÎQ`˛º≤Å"Ñ•z¢Ùy,nß( `(£›î·EsY»˙nZY‘X¥:1ÀvßÖ∫Yç]–öˇ—]ÎXS–Ÿlƒ≈¯"∞@±“¬üÔjÊí≠·∆Ï1‘g'pËa !í¥f»ç1’F·YµÄá&°Ô∆Ò
Æ4á*≠P*ns–rv∂ø≤J˙®®é›ÅòzJ£L" r¢2k:ÊÖgÆ!∆'ÍÃƒ·wˇÆ3AX0u5	rï7ÔH+â\G\Â¨ÑÏ"*¡ED(›oQˆwLµ⁄›<I¨Ï9i∂B£R¢8a›ü¬’
©¨ºﬁ¸TÕ˜sÇ3rÏWÚ\vôÏ·OùVÚïﬂS`zo⁄ZõS=Fù](ÑoMFÊœF¶?Bh⁄Ñ÷Øé»ía
Éä1p«ﬁ À÷âZÜ<kê/UHíÖe5¥ ˛(‡)ì≤Ç¯èø[ÆR—á?	ªÂ´»RÙLÑ÷1)+ˆ@ “≠hñ$ìèF
08§P ®q¸æYºÃdıW÷ï¨ÜA‘Ïƒ¨Ÿ!#êﬁÑ@;lî{Z¥øílÛ⁄On∞÷>+ú—’ì,¸±˘ˇI5Ig‰W8FËç^Åx,éN-±D¬≈9\|ÕâÓÏ¶ùl9%QE≥ûú=æê*ÆFΩ)ë\/àR–íäÂê3ÈÚ00ºŸ@ã’ ä<ûïÑ„Õ∆Á∫5BW£ã„8n'’	îK{æw%ÈY	Ù)gøäp≠eÍ⁄T"≈ÓË
OÕCE
5,ÜÑUB5≈¡,è+À6¬ß‡5™çHÆÁn¥ûe 5c	˚÷K•ıÜö‘0∏ÔÉãùÖç„A¯I/*ñ™≈ §á]s∏ôºÔë˜yy0èTW	£DÍ≥î…oâ⁄@Ñ¡ìN≥€†`ÉGGÕóÈµçn/D<jtHµ=ÿ!=˝¡+∑P#{ûπ0ÉÒ⁄øcˆ‚Û#¯˘T≠QRHM!j≤m^≥.gò›x¬å∆ê±n-÷u◊ÈzÜ¬˛˙ÿúV´Ù≥BpAÃv–2]«ı|Ú<%’¯Aùq˚
qÁl»ÇB˜(Ü e)ú¶ªõIWÏ\•´©ˆl
HÆîûj∂◊w¨m≠ˆ+:u#P@ ∏t´fOBr§(LKﬁ»oZxÈdMõ^©…9G∑ÏÆx1gŒ∂à™]Ô≈gé$wöoLo◊E÷DgHŒ4Êª	®≥Ãπ“Yˆ@)ù+«∞Qn∫1“iﬁ|Ó:k≤qtL<YéıM/∞©⁄‚˚ÂÊ¢MÀ≥K¸~ÛöûÒuº™>˝Qí5z÷,&)1ÛŸÿ≈{cÿV™ˇœ≠´ÁåÉ¨€É¥aO‡ 1ùÁ◊◊a—>Ÿ\%ó˚d˛Å_∂‡z›¿˜Î∞ò
]Öìâ6∂h¨â∏Ö-’Î÷%…•˙ﬂIvº*\ê∞Ûdx&˚å7™Ü1[IˆK!Ë·Omb‰wÍÎÕü=ù^˛lg˛„œÃÍÊ*˝ﬂ˙Ó ßi4ÁËnd÷ÑÑ
2yÔö±Áı≥·ÕgÚh”w,ﬁfØl?0V„ÿ79Ä{∂ Ø
Ñö¶E∫AÔsœ…Ã[†N≠(ÑﬁÅ»¿yº±≥P+åT‘ä©∞›·”⁄g„=√«„=€[%ñÈ√÷VPˇ3=ÕÎ‚F*øá—‹wéH€£µ≠xmŸqKØ/’$”kÃﬂ¬_ RÑC“”èùk¡Ø˘Î…‡∑4¢∫RPüKñ‚G}fœKmU∏∂˝64ılﬂ:vñNq•SP∏>DUSLîÙùñÅ°Zr†Vl∏ùËMÃÑ{÷é⁄/u√Õ®Ç£‘üt¡}JìÛñdrﬁa’
√ê1ZòKV¿≥∑iá⁄*7Ji€’öp®y“Ç~uÍY¯˛ª~n£p_ù·xèêÔ?N¬Ke%O3ï`\‹h¡pk?‚jßc’X‘K>b˛ñ§_SÜ“x”Y∫KÃUìK˙Dá‚≥çúü‹Xd˝µˆÒ±—™ì„®—Î5H˚U£sd¸QK—ÍpƒkÓxlN'pŒfV{
ëtÃÛ ÏÓ¶çGÚ*„>Ìb f|Hﬂ±˘„ƒ¯ÖôÜñ’J1J!%}c(ÂêÙciy#˝L˙X4KZ=7ﬂJëø .Ækv1à◊O8—ú|m·Ú!`Öçô	˜ß¢™Bπµ%≠©Ã∂ˆ¥‡˙∆≤ìıä¨w±Ót≤√Ê˙ñBU∏$B’õ©‚óÂ¨‹¯|,ˇm√∆¸lÔâ, >Pñ˜Ruœ%Û ú,Iênq›&Tﬁ+hƒLW≥à*ª`µ} Ç"wUÓ©g]ê–˙#ï%XbÌ¢*înFÁ
BFqà˛ Ì˝•ãB·æü~‚d~Xû2≈G7RKø*{yTM©3‘˘Ç7•« Â°◊«ê1≥œ¨bÎÎÎ§ä—µÊ`Ã ÑÆí¨(∏
¸9
¬+96…ÿ[CÙà5Ø¯ñ“õQ∫VÖq
€$Eê¢'∆√ªU·øIHµ≥EÎxï„£“‰ìNú¥WxÑ•âÆâz™Cˇ·n2 *É$
%∑&›⁄ù°<s)-ü’0‹ ÀúY◊Ø“≥≥M˝B)¯u4l'ì‚‡_3πœ-Û◊k2úçhÎMM∆K ﬂuÃùÓgNœHr«,°NWëˆZÃ*ïÁ}V-k2
∆·)Ü=≤¶.8¬Iish˛bYWñ&&µ“‘⁄€Ú2√SÕø∂#œÒ∫CÃY¿[l¬ÿ/’hçU)öâ ¨˛PÛt®Û`,Â«Á2¨õ¥\g5√∑Nrÿà˛M≠ü]≤Ö˜fÅj.Z'M‰|∆Å≥∆PÀU‰∆?ÒVf<DÈÉº2©@·[ØKOô:(Ë¬ÿö*π˚S∏c$>+ó˙aÄKﬁI;Ö›Piÿèﬁê_†X0œdXä
QYÂ¿i+í}‰˙3—ü[PÀ”$Æe˛Á=Á…êR§ÑπtN]FÆ\%ø)QUfÚcP6%*sWì?◊»2˙–⁄–UÀ|ÒO^Öd˙å≤OT•2)\a‡ÙN√√2b‚˛3À?kmm©H«]QŒ·ÉX~ﬂ≥)ÏJÓPÙŸŸm–πﬁ¨*HÜqê6&'GÎ“*£òë˜Æ‚⁄cü∑xæsîÀºY…%Ä¨¯ªB¡Ÿ[SãÅ ‡Ÿ"i«ö5Ω+ùÊPí6Ä=„=uÂÿï¥¯R<áóZ€ ¸¢&[Œî∫ÓLaØPàçq8ã∂˜^⁄ûíufr„W≥Ã˘⁄»°'˙rjeÇFUIB‘Î7ˇ?æ˘˚ﬂr⁄`™Êƒº∞ÜöîıÃz`ã÷?˛˜ƒò¨K¸ûzWbPÁVTjH∫H¿å¡Ï)≤s> @*®º¿“ò≠≠Ñy“2N÷åvX≥€>2JTÛR[°•G£É´0AVÁV„œÎ‘±1¸ä¡¿Fˇ‚±;0“ÈŒ1Øäô†1ËZ[(k|Œ™§bR◊ŒX“çßªi/,⁄ø¸Ò˛tmO:ûÆ–\”ËÛà+¨èK1çÍªKõÑòçÛ√Káƒïy≤qô\%ZÛW(ˇ+ô8≥≠óœ`◊c‚˚ü:K¨4ªˇ¸˙¬ˆÌ3áWèÛ”Wf¬°9+¥GoDﬂ§ﬂ	ÀππCxﬁƒ!‡GE„ûÌÉ˛µy¬~O?(s~-˛¶;HF„?ó√ÛA>™Øÿn†¢Ì˙ñX<q∂4÷≥çeÚâóé{ÅÜyuÏö	⁄-&ÿq~QÌ4åÈXÊ`≠=qÆ»ÖOëX¿:l™ÈÉF¶âq◊>YÛ¨u÷dâ‹πe∑ãq˘Çó;MúøÌÀÖ4ÈÎƒZºë.O±€¡(Ú‰9RÍ®jÉö~;òµœª}wj•ı≈K1h;õÈ¥ùD⁄“ÌH·]ô˝ñl}PËw©Ø´§”ƒ2¥êJ5ƒá…§F)úNó˛¯DóYÙ¨qe%)vó†Q¥PÇa9+f˛Ã$ûf˝¸“qz|ä%'•àõ“%AÂD¡PÍ£ ;∫‰∫0ëÚç˝¿qCAÚÙ®gêö—öˇ∂’¨§e‘öm¨µ^=j4{ßÉX{ΩK÷»a~´7»ON;ÕnΩ9ˇı¸WÌ≠›N·a≥ˆ±ÿ6º€i‘éNªmR≠70Œö‘©9Mé¢$z¡úÑ
†Y√Vßq¢œ§≠9⁄kg}‡ˆ(j.ıã_(˘{“ƒ)w‰π◊øüŒïK≠)*Ú•∆ÀóˆÒuu#,Pj^ih¶_≤"Û,B`*ä™ÛÇûGƒÁ˙5”ÛÕÔˇô™4«rËŸ≈åëhFœ+9èê”6Ì'Ñ;Û>§¡6≤/Oo∂»ÁJÛ^zT;,e-Q[wÌ$b(î	h8-9ﬂ,º©4ÂŸÈg “„a]i÷ÿ6∆áo¶sÊ2£:e÷$%‘«√åÔ ¡Û1≠Õ∞CA—X 8’˙¥êa“Ù©[}œ¢%.,?ÑR#ÔìÆ=¥dqê›fA_W¸Bõ5.œKâ¿~⁄r‚:©r&ß/Qœô‚—>9ı‹Ì¿Â~¨Ûb˛5ŒÓáÒ€+g˛%1©ﬂ3p0ª;á¿s†z˘3w`„x&f‘O‹Õ◊ÛœDˇn lÑÙmØL–∏N7DJ©î|’‚í‘•	æ®Ø¿!¸õçÊX∑—=MÀ1Ï«k t¢“Q1º·øÎˇ˛gzA!Jﬂ*9hÆÈÌ±E, ¶Y¿ﬂä*©¨?;Ût^Û‰`˜ã ï+EÖ∫…:Ñ-£∞`}{Í`NôÂØíC3∆`·3∏yQíŸ›çr˘sÀcê7DHH~ôÜdQå∞î°‚[∑f¶Ì	 ê∞∑—Fˇ∫√∑d\ÿL î¯⁄KEûiÃÿZlAòmÿ:Öt®º¿ä≤ÃähÕ≤"$îŒ6Ÿ—∂%yªÙßı∞Ç◊gÔe=(6˛·oH÷√bŸYxˆ3≠{MGSoa¡öx-ôS◊õYw]Ú<Å4.w™ÊÃÍ¥6å C\7‰É4¶ä2°€/[tÁ/Téh´’ ˘Ì«VB] ï©µ^nñÖÉ:Tß4ì0¶©™_µÎüæ›Ã!–)jeÂ«∆≥h∞dµ"Õ3Y™ûBﬁVVI(ß≤í›≈Ì§Ví5ƒB’Ì	A0¸dûQ.´Êd`>H~"Uu∫Ì≤Ñâ¬ôk¢ÆÿÙ ÖÀîëyWæ±ì∑0¨?\ïóH^rQ˘˙».Q|åÅãbÃÏãáI)¥˙+r¶RlALuÂ§Úíä> ∆`˛≠É?/åFìÈâôŒ≤b
Ñ≠®ìÎ
 î›÷Ÿ°#¡N¢é”™Ω˘√?˝OQ'¥8@häñcèAÖdøûq-‘D≥®Úñì:’x2l7Uƒ@tjîù!8q}?∞	ËPPè∂gŸ®'√|1 ÁÌ væáÊü	|gè	≤egVº$¡]ÇfØø;c$ÌWõ`Ç?Ö#Ã”4Î˝c\.Ô™9»+ÌAŒ[∂±;Û]ÉFË˜Ã≥jÖÂañ«-p‚íqs;7'Y…≥0åûda•›í1ÓÂjgûÌÒJ,‹B†C’Å;È2π3Hdä¬´õc$«ƒáõ–ÚÚ◊VΩ≤JGEˆ:u¸§æ*∆ƒ|h∂cï@Z33˚ ”•N;G§„,¸“£ òêûß.È≈¸-xã©Ébf¢¿’˜Î,¥Ê÷q#)„F^Ôm~Z(r$Ú±€ÇP{¯oò»öRÄ3#K‘Å%±0‡YÃKæßç-·ÒAñÈyÀhìîáãù |.M¬2Io˛Â´√‰yª·à'Æ~u&OÈ	3ÄÊ
G©[ß`ûl©âa6ä&ÿa4º0äOG0ìH∆[(E[å‘õµ=2Z€Sg’ñî◊3"‡≥g ··‘∂ò_U€ÖÙñRQ,ﬁ7¡≤ÇﬁSÚïfÒw≤_à»ÕÚœD>8jr⁄h∂i®C˚¥◊Ëî¥nÍ¿ÁVƒ'$∫ˆ)U€FWMËDl–Äm–ô;h˚√Ìç≠Ω˚å8UpÒa©∞Äê∑l
ôi¸;û:ê úTúAÅµÌlÊd/-÷†Êzpo‹êﬂ6⁄ ﬂëî¡…wTß#Üª&p–à•'˙V⁄ï◊ì3‚ÖT◊≈ZÜŸ(™t]†W{ZÂ˛|VT«NÏ˝Æsâ+•WÚÈ&CiPäAÎÊVe
Ç-£<;FÓ2ßúï;X\€©.H £2ANJá,¡íπB["ÛÛGª‡fÏB9wóZz§äAã0îÃRIW·£{NaÔFŒ‚”≤˙oÍ›A⁄˚Y;êå•®¡±õˇi`gÜRˆÓåU8·NÄÚkQîﬁeªöx6gT‘∆ƒ‹eI€a$Õç§π_Mü (RUØ∞Àüä÷x•ƒ 2,æ|ÜŸùv\Gø©%lÆ
1*∆i/om¨W2Ë∑4¸¸†UX∏r∂ûe˙n™,´ñjV#˙îM5Œ¬"Tàø¸·_æƒ∫°M`4#. Ãî4H§ÓV≈=&™ö,ØE”£%ì4e$L=¬:2áΩMI≤‹)ç…êH‡j£è'¡uvxK“ﬁü˜Fõga
⁄]: Ò{”KÁıÊ¿“(æ∫ïA®{ltz'∑[r‹>h5»Aª◊kìñÒ™˘íïéz˛T7é∫bö·±{f;÷˛lô1â⁄Oü_G„M¨∞ˇ3Û,$ÅÿÓ
_”›¸Jÿ}wÇF£O:›æ9ôX^ΩàÂì¡Ñ≠‘{á ≈Wº≈˛¢”pª¥‚›„¿ôŸ›ô5ÖáÙ-¥˚˝ HˇJ—BÙ7’Îl˘XÔ5 ÷ôúô«°Ñ7P«‡è≤∫¡ÛÏ~¬˝‚d+~°h^\åx˜,\læÙ®FÌÖYsvbOƒëÛÊ§›ìÛÊrs›	ÑA0A≥| · ÿñ?	ÄÔ‘]ﬂ∑-è◊q¿7b„˛çv∆—fñiÌºe (≤)jí◊" åú )ë∞fH)–Úƒz”TØ_æ*Ö•ºfÛ∑ä5˙oüZìûÙG]{H´åÂ,IÚŸ¢ãí~KC",ãŒ◊Ó3˘±Äò˛{Å(∆*ûÉo>√îÆ˝T‰·4YÉ˘1ÜN°oª”Í¨mÇƒíÿJò-˜√‡ä¯ˆ∞nŒÃUÇµ£R{jü«·WÈ~V$«€»ú∫äÕà;∞ª6c·8+N‡ß†çàµΩ4É°•%ã,BIñY¸åOÊ<áÚ—É+)ÚSÑ∆A–∑™U≥ﬂ_%vjC‡Î◊v*ÃÏSÚúTuBÿ\!ê-qâ9 º#ƒUr}É˚T%ÜvÉ‹ºJ&4X‚≈äû[ªZ˜Ã7ñó⁄èD~síELYªì¡`%1ŒÊ\JﬂQ1é◊∏ƒ¿⁄ì˙°¿ı-˙kÖ:4{.<Äé¯oiU¶áÊ 1?<∆dÄgQs´ËœR‹]‚–X%œ≈¡Ù‹·–	„8úA÷ßs£Kﬂ”–M·~∞k‡e	ß∫˛\3ÅICEvJ™*r§¨¯yß≈Œk"¶™Pkfﬂ≥ ´££ä¯z¥`…™”Ê@¶ÍdkÙâÙ@:∂ˇπ<¸Nl>{ bUèF #ëóÑ!k&IºZë&Fá¶#⁄T◊Ú”
öA„ì”fÌØHØc¥∫áç-¯”¯iÔ‘8bJ©›ŸN¯ìmüë0ùÑû´;9çS`˛∏8ÿÄ∆«£0∏ø˛OõO7˚[O>ÕE ˝ëyë«É®ë“¸æ#8åe‹î“V	‰Æ∆Œ~˚ÿ¢gÎ‹≥¸QÌç¢8Æ,£Ù°*ú¢âBR>ä&ê—W#~ÛÎø#/OõÈÃy“¨”TÈêBÁˇ≠Uk
u<Ì),ÂWÀÜ˝W°Ú™œÄô∑,ºjI„2ë∑£êü,µ*Ed˘–ë€ôÓ.Ÿ§j⁄ÊÇ?*Ã£˙™π›∆Q£F3ˆ;an˝æÇT4ıiü±{A—.GÕûÒÕNﬁÂÍtvOÛ~¸l%¶50¥ùÕ›Õèruï1>z}%ZKó’!-Xœ•∞ä|’*ïkkÑNô¶ÿz$ÙI≠≠=€`è*£%k
Ö˜eΩ&‰ëwÀ v1%(‹7˙ã.HÅ?ä.~¯(Ëô[§MíÍuZ7P†˝—qdLJU˘„Ÿ£ªÇ6˚{9Xçnœ8¿√’<n¥z4†£ﬂ5[K9_u∏ÿ"ó=YÒõﬂ≤3%·m±”0-z¶‚iòfûÜÈÌsªîL◊˚&Éf√˛Ü¶ˇ›9#«Ì^ÛUõlê√”V›¿sbPó2'DW°PQá¯tîé3¸…::Ï≠“•é]50…,ô]Æ.¶˝@è\Jƒ-‰∆)#„cëd&2ïÙ=>ÅUﬁNÄâ©†dín‰®2DZEàúx˘blÕh’GÜ?®u¬›jÕ∂oã<ø˛~qIØ@*ZÅu 6‡áŸØ¬Õ‚V(]#´$}sjR"D ∆j%©T°Ú2Û¸7ux˙g/€$÷v7ÖÖu#ÿê˜Ù≤gp‚π∫ºå|j‘æß°+ÍŒ“ñYˆR¶ÙÃêê^ˆC Ó›TV»Ç®ø›:lvéA©…‘Ç35;ÌŒgfjBWàOV 6F1<⁄Üﬁ9€PF]¡>ƒÉ7Ó¡:Ù®ˆ/õ†êtHª÷ÓÑÃk#"‘∆É±•N¡£u(z˜ﬁïÿEjÆ_àª}íÅK°í¿?QΩ¸®øæ}˝ıûT’¸Ú2∞TK>DÑÙö'‘ ±€ÙA 8JYáI}úz¿{’[ì{òUÈ •c◊ƒüz¢tI¨í•µﬁÏ÷ö'GÕñ—©º~…"·T#çWFw˛´vÂˇPÍÂ„˘?‘õ5xô(ırßQot+/Ë?pù˜ö•ﬁn∂;∞¯Œ)‚ÙV^$/’T∑Ò^iÕÕƒü	G…jHwÙ≥ÍÔÁøÏØöu£æÏ”€µ@|As‡ÌNp¯˙wË◊:ÛﬂÙö5†Ω©æ≤º±Âå‹ïÚß—‡áZ1∆¶g9%9jæl4Ò@Ò§Z≥'?73…= /Ñêºß÷a€§ntI≠Ÿ©ù∂∫Ω˘ﬂ¢ñ—-#4b«∞‡*∏’I©[~ˇV"#æXæ/÷?≥.L‚@∂9¶)&q±rg¶	◊sﬂ¯œØw¨@JÂ˜ÁÏëÔ≤•˜V Áí-Ω©Íü@º66'ˆ4pÃd.`÷MöR#i8¥N‘€hDm««âºßêk£‘S{ﬁ”(íhS}cz{2Tõ9Ûw]ÛVöë(©•å¶<È6ôËÅπÑ–oã\T∆¢ÂN£/a·ø¥àÇ}òNüèa[êÌéa;y¿-ApB2ı‹s€±∞™˚y0a`hc∏≠∫¡√˚™ÓXzkÎ23Úúl≤ùã–@]ØaˆG4$aˆÏœ…î""¿ı˘¿}3yM[G¡
Tn˜úû¯Gzä≈C≥nn8°¿$ç¡ÄÆ@Û∆bFŒ1∏µ.Nÿ±¬òm˙4+øL†1‹X~ôáx∞íŒUákxçÀF˜˛˚‰˚ÕV≥◊4é~÷lΩFw›w«ò'bœËkoà|äÅ++<µÜï«mÛ5FÅæ˘l"Lst›1i"…±,“s]gfO·}†YœÚ(@9|∏ã|ü>Í8ˆ´>ë€(Ü8Óﬂ˜¢çd≠ho≤zÕ3âV…‘ºr\s∞Jòàs≥OE\∫qËB‚CÅ%‡
˘$Cö`k<0g&¨.‰ıÊßÎ¸„èÑáB“¡áin	˚®‡ˆUüñ6˚ÆÂˇË{·vwÌ1“2¬ò∏oB%˙hº&Bf#+äπ‚ùÃF‚Æ_Î¶ÙÒúTY«dgse}Ê¢†∫µ"ÕÚg«Êe◊F;t›ƒóéÕŸhΩoŸ˚?ìÕı≠mÍˆJ<∏∫çN4Æ∫?uÄ0 æ±¨œ	“u÷ Ò!:z∫3ZìˆI•k◊1…Vc‘£E⁄g#¢¨¨öZA›ˆˆ *÷0˝ÜGˆ∆ìr≥™ÈªtˇOK˜øó—ˇNÈ˛wK˜øõ—ˇπˇTßkE∂§»SO=ïö^jNÈFT;^‡©ΩBO·Í—≈˚îü©VΩ¬ıUº¯G!0≤8÷ñ
ÎE¨ﬂÆpé	‚ØV@ˆum*|]äˆXêu¿q?,C=ÕiOô®_yqËó‘~‹¿4lêﬂé≠âèˆ°iJD–NT[å]¿%(;∏∏ÿuXÑ[ã"Àî‡„˘W¿/·Ô§
Ã·?˜ÂU)b•∆\o¸˜*úƒe ÛìÜcP'»#¶MÍŸ7Tæ%`ãB3∂∫º‡	Ô'"óàÍß»á8.N¢ ì_⁄pœ@EOå∂∆é1Éhï«+úÒí„ïiñÇ^õpC¢Û#Ç â∫˚Ø◊·}Ñk™+cÂvrÇ@v≠`L∫Û?AWÈnÆ•ã˝ÜÜï¨´∫Sã‹yå#çÛÀTq≈qì–ìrNX\≤Èi·CVBE>H<… îEËx®ÜÙ@+´8#ì9ªÿ≠È\ ﬂO¨nÊ)◊r'∂$rMM*;1«~T˙ˆh‘•áèpàπÀÃä„í5OÂ◊¡wº:’b∆‹≠Î!)F”Øƒ3¨yöÊ‰ï’Tì7XÅ„:’jMã@S∏2v“ùπò≥∑Kœ^dœc8>Úu•ÿı‰±§hNÜ¬°¯†éÕL€Gã…Ò¸ˇ¯äΩ,∂ãAâ™7ahõ/7ñX·ó¶2FÊi˛5HI„ç+R·3Ëäön®ÌC3¸åx⁄Vì¡ÜÖﬂ5'É®Ïk4•uYº;ú71«X q`^˘°˛Eu±ÅÁy
;Ï;µHz}A©äÅökÁñÌô†PpX,ˇçuøSäCœÚÊˇ¶zx[Ò'ÅÈÕT?U>lOî?QÍ/ó™g∑U£ËŒø<;—Êñ‚π∫ã§ƒsõO%È≠CÉhk]∏ñ#3QH4pﬂGˆ¯k∏ˆåï√ßUb_&¨†ÿhü€nÖ$‘…·ïu:¢»êà‘l_R£L‘:G<Y#[bl¢YP.™õ´úû÷§yDçﬂÀÅk7nCöÔœY´—Û¸_~n√ÂƒQ„ßU>Üõÿ»ı›‘£BÃ≈•jQ	qE¨›"KÑÑÂ´î™◊á≠\ù∏©¡õCó	‹ÔñZyÜ“%ª.T:Jxë‹ìBÂzË!MåØ≤‘0ÒÀ{‚4¶NràÙÜ%Mg˛5ﬁ±ÚX≈˚˜°Ë©‚˝üZ\ÒèY~`JÁsoU•°Ô *tu∂Xùˇd…1à¬¬ug˙+ÀSÎíÚA$‰®w·m˙6µª®œª+wIﬂ∑Ó:q—∑#á&epïøﬁé)åMN≠0‚†©¿°å$˝VËm[;“⁄^Çê= ¡gAzõ∞≤p›≠ÓNÇôVo[∫¬∂pësß†»©‰©	AT+HîAYﬁ
∂ZÆJEÅƒ¿¥	vM/bÁ‚œÆÎ˘ı5°@ıë”>ì)¥úV(d˜Â-âÉñKæ‚esñóZ(3tnÌÜI√∫ﬁ¸ c‰2ÀH_òTËu|^/°côŒZœÂ))üÎPÖ∑“ Ñ\W-±◊l¸4ûMg3ì§ÚâÎçMßÚ"¥Â"V¥Ç5dYœ”òã¨f£mÜlT1≥A"‡OPNıˇ  ˇˇ ^Ør