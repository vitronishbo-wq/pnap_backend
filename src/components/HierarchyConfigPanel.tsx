import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GitFork,
  Building,
  Building2,
  Shield,
  Layers,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Search,
  ChevronRight,
  ChevronDown,
  Download,
  Upload,
  Copy,
  Users,
  Activity,
  Sliders,
  Award,
  FileText
} from "lucide-react";

export interface SubLevelConfig {
  id: string;
  name: string;
  code: string;
  type: "DEPARTAMENTO" | "SECCAO" | "PAVILHAO" | "SERVICO" | "POSTO_MEDICO" | "OFICINA";
  securityLevel: "RESERVADO" | "CONFIDENCIAL" | "SECRETO" | "PUBLICO";
  responsibleOfficer?: string;
  staffCount?: number;
  capacity?: number;
  status: "ATIVO" | "MANUTENCAO" | "SUSPENSO";
  description?: string;
}

export interface HierarchyConfigPanelProps {
  provinces: { name: string; code: string }[];
  prisons: any[];
  setPrisons: React.Dispatch<React.SetStateAction<any[]>>;
  operators: any[];
  organizationalUnits: any[];
  setOrganizationalUnits: React.Dispatch<React.SetStateAction<any[]>>;
  institutionalHierarchy: any;
  setInstitutionalHierarchy: React.Dispatch<React.SetStateAction<any>>;
  writeAuditLog: (
    operator: any,
    action: string,
    table: string,
    rowId: string,
    desc: string,
    targetId?: string,
    targetName?: string
  ) => void;
  currentOperator: any;
}

// Standard Provincial Departments defined under Decreto Presidencial 184/17
const STANDARD_PROVINCIAL_SUBLEVELS: SubLevelConfig[] = [
  {
    id: "SUB-DSPP",
    name: "Departamento de Segurança Penitenciária Provincial",
    code: "DSPP",
    type: "DEPARTAMENTO",
    securityLevel: "CONFIDENCIAL",
    responsibleOfficer: "Chefe de Dept. de Segurança",
    staffCount: 45,
    status: "ATIVO",
    description: "Assegura a ordem, revista, perimetro e segurança táctica na província (Art. 27.º)."
  },
  {
    id: "SUB-DCPB",
    name: "Departamento de Controlo Penal e Registo Biométrico",
    code: "DCPB",
    type: "DEPARTAMENTO",
    securityLevel: "CONFIDENCIAL",
    responsibleOfficer: "Chefe de Dept. de Controlo Penal",
    staffCount: 20,
    status: "ATIVO",
    description: "Gestão dos processos individuais dos reclusos, prazos e registo NREP-AO (Art. 29.º)."
  },
  {
    id: "SUB-DARP",
    name: "Departamento de Assistência e Reabilitação Penitenciária",
    code: "DARP",
    type: "DEPARTAMENTO",
    securityLevel: "RESERVADO",
    responsibleOfficer: "Chefe de Dept. de Reabilitação",
    staffCount: 18,
    status: "ATIVO",
    description: "Execução de políticas psico-sociais, ensino escolar e formação profissional (Art. 28.º)."
  },
  {
    id: "SUB-DRHS",
    name: "Departamento de Recursos Humanos e Formação",
    code: "DRHS",
    type: "DEPARTAMENTO",
    securityLevel: "RESERVADO",
    responsibleOfficer: "Chefe de Dept. de Recursos Humanos",
    staffCount: 15,
    status: "ATIVO",
    description: "Gestão de efetivo, assiduidade, licenças e remunerações (Art. 14.º)."
  },
  {
    id: "SUB-DSAM",
    name: "Secção de Saúde e Assistência Médica Provincial",
    code: "SSAM",
    type: "SECCAO",
    securityLevel: "RESERVADO",
    responsibleOfficer: "Chefe de Secção de Saúde",
    staffCount: 12,
    status: "ATIVO",
    description: "Acompanhamento médico, sanitário e junta de saúde provincial (Art. 33.º)."
  },
  {
    id: "SUB-DLVA",
    name: "Secção de Logística, Armamento e Víveres",
    code: "SLVA",
    type: "SECCAO",
    securityLevel: "CONFIDENCIAL",
    responsibleOfficer: "Chefe de Secção de Logística",
    staffCount: 16,
    status: "ATIVO",
    description: "Gestão de víveres, fardamento e materiais operacionais (Art. 16.º)."
  },
  {
    id: "SUB-STTI",
    name: "Secção de Tecnologias de Informação e Comunicações",
    code: "STTI",
    type: "SECCAO",
    securityLevel: "CONFIDENCIAL",
    responsibleOfficer: "Chefe de Secção TIC",
    staffCount: 8,
    status: "ATIVO",
    description: "Manutenção da rede nacional NREP, servidores e infraestrutura (Art. 18.º)."
  }
];

export default function HierarchyConfigPanel({
  provinces,
  prisons,
  setPrisons,
  operators,
  organizationalUnits,
  setOrganizationalUnits,
  institutionalHierarchy,
  setInstitutionalHierarchy,
  writeAuditLog,
  currentOperator
}: HierarchyConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<"provincial" | "establishments" | "tree" | "matrix">("provincial");
  const [selectedProvName, setSelectedProvName] = useState<string>("Luanda");
  const [selectedPrisonId, setSelectedPrisonId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Sub-levels state store per province (custom extensions)
  const [provincialSubLevels, setProvincialSubLevels] = useState<Record<string, SubLevelConfig[]>>(() => {
    const initial: Record<string, SubLevelConfig[]> = {};
    provinces.forEach((p) => {
      initial[p.name] = STANDARD_PROVINCIAL_SUBLEVELS.map((sub, idx) => ({
        ...sub,
        id: `SUB-${p.code}-${sub.code}-${idx}`
      }));
    });
    return initial;
  });

  // Modal State for Adding/Editing Sub-Level
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [editingSubLevel, setEditingSubLevel] = useState<SubLevelConfig>({
    id: "",
    name: "",
    code: "",
    type: "DEPARTAMENTO",
    securityLevel: "CONFIDENCIAL",
    responsibleOfficer: "",
    staffCount: 10,
    status: "ATIVO",
    description: ""
  });

  // Toast Notification
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);
  const showToast = (msg: string, type: "success" | "info" | "error" = "success") => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Expanded Nodes in Tree View
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "CENTRAL": true,
    "PROV-Luanda": true
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Selected Prison Object
  const currentPrison = useMemo(() => {
    if (!selectedPrisonId) return prisons[0] || null;
    return prisons.find((p) => p.id === selectedPrisonId) || prisons[0] || null;
  }, [prisons, selectedPrisonId]);

  // Handle Add Sublevel for Province
  const handleOpenAddModal = () => {
    setModalMode("ADD");
    setEditingSubLevel({
      id: `SUB-${Date.now().toString(36).toUpperCase()}`,
      name: "",
      code: "",
      type: "DEPARTAMENTO",
      securityLevel: "CONFIDENCIAL",
      responsibleOfficer: "",
      staffCount: 10,
      status: "ATIVO",
      description: ""
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sub: SubLevelConfig) => {
    setModalMode("EDIT");
    setEditingSubLevel({ ...sub });
    setIsModalOpen(true);
  };

  const handleSaveSubLevel = () => {
    if (!editingSubLevel.name.trim() || !editingSubLevel.code.trim()) {
      showToast("Preencha o nome e o código abreviado do sub-nível.", "error");
      return;
    }

    setProvincialSubLevels((prev) => {
      const currentList = prev[selectedProvName] || [];
      let updatedList: SubLevelConfig[];

      if (modalMode === "ADD") {
        updatedList = [...currentList, editingSubLevel];
      } else {
        updatedList = currentList.map((item) => (item.id === editingSubLevel.id ? editingSubLevel : item));
      }

      return {
        ...prev,
        [selectedProvName]: updatedList
      };
    });

    // Also update organizational units dynamically
    const unitId = `OU-${selectedProvName}-${editingSubLevel.code}`;
    setOrganizationalUnits((prev) => {
      const exists = prev.some((u) => u.id === unitId);
      if (exists) {
        return prev.map((u) => (u.id === unitId ? { ...u, name: editingSubLevel.name } : u));
      } else {
        return [
          ...prev,
          {
            id: unitId,
            name: `${editingSubLevel.name} (${selectedProvName})`,
            level: "PROVINCIAL" as const,
            province: selectedProvName
          }
        ];
      }
    });

    writeAuditLog(
      currentOperator,
      "HIERARCHY_SUBLEVEL_UPDATE",
      "InstitutionalHierarchy",
      editingSubLevel.id,
      `Configurado sub-nível '${editingSubLevel.name}' (${editingSubLevel.code}) na Direcção Provincial de ${selectedProvName}.`
    );

    setIsModalOpen(false);
    showToast(`Sub-nível "${editingSubLevel.name}" guardado para ${selectedProvName}!`, "success");
  };

  const handleDeleteSubLevel = (subId: string) => {
    setProvincialSubLevels((prev) => {
      const currentList = prev[selectedProvName] || [];
      return {
        ...prev,
        [selectedProvName]: currentList.filter((item) => item.id !== subId)
      };
    });

    writeAuditLog(
      currentOperator,
      "HIERARCHY_SUBLEVEL_DELETE",
      "InstitutionalHierarchy",
      subId,
      `Removido sub-nível orgânico na Direcção Provincial de ${selectedProvName}.`
    );

    showToast("Sub-nível removido com sucesso.", "info");
  };

  const handleResetProvinceDefaults = () => {
    const defaultSubs = STANDARD_PROVINCIAL_SUBLEVELS.map((sub, idx) => ({
      ...sub,
      id: `SUB-${selectedProvName}-${sub.code}-${idx}`
    }));

    setProvincialSubLevels((prev) => ({
      ...prev,
      [selectedProvName]: defaultSubs
    }));

    writeAuditLog(
      currentOperator,
      "HIERARCHY_RESTORE_DEFAULTS",
      "InstitutionalHierarchy",
      selectedProvName,
      `Restaurada a estrutura orgânica regulamentar (Decreto 184/17) para a província de ${selectedProvName}.`
    );

    showToast(`Estrutura regulamentar restaurada para ${selectedProvName}.`, "success");
  };

  // Copy JSON Matrix
  const handleCopyJSON = () => {
    const payload = JSON.stringify(provincialSubLevels, null, 2);
    navigator.clipboard.writeText(payload);
    showToast("Matriz orgânica copiada para a área de transferência!", "success");
  };

  // Stats calculation
  const totalSubLevelsCount = useMemo(() => {
    return Object.values(provincialSubLevels).reduce((acc, curr) => acc + curr.length, 0);
  }, [provincialSubLevels]);

  const activeProvinceSubLevels = provincialSubLevels[selectedProvName] || [];

  return (
    <div className="flex flex-col gap-6 w-full text-slate-100 font-sans animate-fade-in pb-12">
      {/* Toast alert */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-2xl border flex items-center gap-3 backdrop-blur-md text-xs font-semibold ${
              notification.type === "success"
                ? "bg-emerald-950/90 border-emerald-500 text-emerald-200"
                : notification.type === "error"
                ? "bg-rose-950/90 border-rose-500 text-rose-200"
                : "bg-indigo-950/90 border-indigo-500 text-indigo-200"
            }`}
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-900/40 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-900 border border-indigo-400/30 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <GitFork className="w-7 h-7 text-indigo-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase tracking-wider">
                  Decreto Presidencial n.º 184/17
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 uppercase tracking-wider">
                  21 Províncias (DPA 2024)
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Painel de Configuração da Hierarquia Organizacional
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                Definição e mapeamento dos sub-níveis funcionais, órgãos de direção, departamentos provinciais e estabelecimentos penitenciários para a desmaterialização do S.P.A.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyJSON}
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-2 transition active:scale-95"
            >
              <Copy className="w-3.5 h-3.5 text-indigo-400" />
              <span>Exportar JSON</span>
            </button>
          </div>
        </div>

        {/* KPI COUNTERS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Províncias Mapeadas</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-amber-400 font-mono">21</span>
              <span className="text-[10px] text-slate-500">Divisão DPA 2024</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Direcções Provinciais</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-indigo-400 font-mono">{provinces.length}</span>
              <span className="text-[10px] text-slate-500">Órgãos Locais</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Sub-Níveis Mapeados</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-emerald-400 font-mono">{totalSubLevelsCount}</span>
              <span className="text-[10px] text-slate-500">Dept/Secções</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">Conformidade Legal</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-black text-cyan-400 font-mono">100%</span>
              <span className="text-[10px] text-emerald-400 font-bold">VIGENTE</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("provincial")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "provincial"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Sub-Níveis por Direcção Provincial (21)</span>
        </button>

        <button
          onClick={() => setActiveTab("establishments")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "establishments"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Estrutura de Estabelecimentos Penitenciários</span>
        </button>

        <button
          onClick={() => setActiveTab("tree")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "tree"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>Árvore Orgânica Interativa</span>
        </button>

        <button
          onClick={() => setActiveTab("matrix")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === "matrix"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matriz de Governação (JSON)</span>
        </button>
      </div>

      {/* TAB 1: PROVINCIAL SUBLEVELS */}
      {activeTab === "provincial" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Province Selector Sidebar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Províncias de Angola ({provinces.length})</span>
              </h3>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar província..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="flex flex-col gap-1 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {provinces
                .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((prov) => {
                  const isSelected = selectedProvName === prov.name;
                  const count = (provincialSubLevels[prov.name] || []).length;

                  return (
                    <button
                      key={prov.code}
                      onClick={() => setSelectedProvName(prov.name)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                        isSelected
                          ? "bg-indigo-600/20 border border-indigo-500/50 text-indigo-200 font-bold"
                          : "bg-slate-950/40 hover:bg-slate-800/80 border border-transparent text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 text-[10px] font-mono font-bold text-amber-400/80">{prov.code}</span>
                        <span>{prov.name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-400">
                        {count} sub
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Sub-Levels Main Content Area */}
          <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">
                    Direcção Provincial do Serviço Penitenciário — {selectedProvName}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold">
                    Órgão Local
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sub-níveis operacionais e administrativos sob a alçada do Director Provincial de {selectedProvName}.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleResetProvinceDefaults}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                  title="Restaurar Departamentos Regulamentares (Decreto 184/17)"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Padrão 184/17</span>
                </button>

                <button
                  onClick={handleOpenAddModal}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Sub-Nível</span>
                </button>
              </div>
            </div>

            {/* Sublevels List */}
            {activeProvinceSubLevels.length === 0 ? (
              <div className="p-12 text-center bg-slate-950/50 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center">
                <Layers className="w-10 h-10 text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-300">Nenhum sub-nível configurado para {selectedProvName}.</p>
                <p className="text-xs text-slate-500 max-w-md mt-1 mb-4">
                  Clique no botão abaixo para carregar os departamentos standard do Decreto 184/17 ou adicionar sub-níveis personalizados.
                </p>
                <button
                  onClick={handleResetProvinceDefaults}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Carregar Estrutura Orgânica Padrão</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProvinceSubLevels.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-slate-950/70 border border-slate-800 hover:border-indigo-500/40 rounded-xl p-4 flex flex-col justify-between transition gap-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                            {sub.code}
                          </span>
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-slate-300">
                            {sub.type}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(sub)}
                            className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition"
                            title="Editar Sub-nível"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubLevel(sub.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition"
                            title="Remover Sub-nível"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white mt-2 leading-snug">{sub.name}</h4>
                      {sub.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{sub.description}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-indigo-400" />
                        <span className="font-mono text-slate-300">{sub.securityLevel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>{sub.staffCount || 0} Efetivos</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ESTABLISHMENT SUBLEVELS */}
      {activeTab === "establishments" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-400" />
                <span>Estrutura Orgânica por Estabelecimento Penitenciário</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Definição dos sub-níveis internos (Pavilhões, Blocos, Posto Médico, Sectores Fabris e Corpo de Guarda).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-400 font-mono">Estabelecimento:</label>
              <select
                value={selectedPrisonId}
                onChange={(e) => setSelectedPrisonId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {prisons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.location})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {currentPrison ? (
            <div className="flex flex-col gap-6">
              {/* Prison Overview Box */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      {currentPrison.id}
                    </span>
                    <h3 className="text-base font-bold text-white">{currentPrison.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{currentPrison.location}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 uppercase">Capacidade Oficial</span>
                    <span className="text-sm font-bold text-indigo-400">{currentPrison.officialCapacity || 0}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 uppercase">Lotação Atual</span>
                    <span className="text-sm font-bold text-amber-400">{currentPrison.currentOccupancy || 0}</span>
                  </div>
                </div>
              </div>

              {/* Sub-Levels Hierarchy Tree for Prison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Direcção & Comando */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">1. Direcção & Chefia</h4>
                  </div>
                  <ul className="flex flex-col gap-2 text-xs">
                    <li className="bg-slate-900/80 border border-slate-850 rounded-lg p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">Gabinete do Director do EP</span>
                        <span className="text-[10px] text-slate-400">Comando do Estabelecimento</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        ATIVO
                      </span>
                    </li>
                    <li className="bg-slate-900/80 border border-slate-850 rounded-lg p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">Secretaria Geral & Registo</span>
                        <span className="text-[10px] text-slate-400">Atendimento e Protocolo</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        ATIVO
                      </span>
                    </li>
                  </ul>
                </div>

                {/* 2. Custódia & Pavilhões */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">2. Pavilhões & Custódia</h4>
                  </div>
                  <ul className="flex flex-col gap-2 text-xs">
                    {(currentPrison.pavilions || []).map((pav: any) => (
                      <li key={pav.id} className="bg-slate-900/80 border border-slate-850 rounded-lg p-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white block">{pav.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Capacidade: {pav.capacity || 100} reclusos</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                          {pav.blocks ? `${pav.blocks.length} Blocos` : "Pavilhão"}
                        </span>
                      </li>
                    ))}
                    {(!currentPrison.pavilions || currentPrison.pavilions.length === 0) && (
                      <li className="text-slate-500 text-[11px] p-2 italic">Nenhum pavilhão cadastrado.</li>
                    )}
                  </ul>
                </div>

                {/* 3. Serviços de Apoio & Saúde */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">3. Serviços Internos</h4>
                  </div>
                  <ul className="flex flex-col gap-2 text-xs">
                    <li className="bg-slate-900/80 border border-slate-850 rounded-lg p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">Posto Médico Penitenciário</span>
                        <span className="text-[10px] text-slate-400">Cuidados Primários & Triagem</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        24/7
                      </span>
                    </li>
                    <li className="bg-slate-900/80 border border-slate-850 rounded-lg p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">Sector de Produção Fabril / Agrícola</span>
                        <span className="text-[10px] text-slate-400">Oficinas de Reabilitação</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        OPERAÇÃO
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Selecione um estabelecimento penitenciário.</p>
          )}
        </div>
      )}

      {/* TAB 3: INTERACTIVE TREE */}
      {activeTab === "tree" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <GitFork className="w-5 h-5 text-indigo-400" />
                <span>Visualizador da Árvore Hierárquica Institucional</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Representação multinível do Serviço Penitenciário de Angola (Nível Central, Provincial e Local).
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 overflow-x-auto font-mono text-xs">
            {/* CENTRAL LEVEL NODE */}
            <div className="flex flex-col gap-3">
              <div
                onClick={() => toggleNode("CENTRAL")}
                className="cursor-pointer bg-gradient-to-r from-indigo-900/60 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 rounded-xl p-3 flex items-center justify-between transition max-w-2xl"
              >
                <div className="flex items-center gap-3">
                  {expandedNodes["CENTRAL"] ? <ChevronDown className="w-4 h-4 text-indigo-400" /> : <ChevronRight className="w-4 h-4 text-indigo-400" />}
                  <Shield className="w-5 h-5 text-indigo-400" />
                  <div>
                    <span className="font-bold text-white text-sm block">DIRECÇÃO-GERAL DO SERVIÇO PENITENCIÁRIO (D.G.S.P.)</span>
                    <span className="text-[10px] text-slate-400 font-sans">Nível Central • Ministério do Interior • Luanda</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-bold">CÚPULA</span>
              </div>

              {expandedNodes["CENTRAL"] && (
                <div className="pl-6 border-l-2 border-indigo-500/30 ml-4 flex flex-col gap-4 mt-2">
                  {/* CENTRAL DIRECTORIES */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 max-w-xl">
                    <span className="text-amber-400 font-bold block mb-2">Serviços Executivos Centrais (Decreto 184/17):</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <span className="bg-slate-950 p-1.5 rounded text-slate-300 border border-slate-850">DSP — Segurança Penitenciária</span>
                      <span className="bg-slate-950 p-1.5 rounded text-slate-300 border border-slate-850">DCP — Controlo Penal</span>
                      <span className="bg-slate-950 p-1.5 rounded text-slate-300 border border-slate-850">DARP — Reabilitação</span>
                      <span className="bg-slate-950 p-1.5 rounded text-slate-300 border border-slate-850">DPAE — Produção Económica</span>
                      <span className="bg-slate-950 p-1.5 rounded text-slate-300 border border-slate-850">SIP — Inteligência</span>
                      <span className="bg-slate-950 p-1.5 rounded text-slate-300 border border-slate-850">UESI — Unidade Especial</span>
                    </div>
                  </div>

                  {/* PROVINCIAL LEVEL NODES */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-400 font-sans uppercase tracking-wider">
                      21 Direcções Provinciais (Serviços Executivos Locais):
                    </span>

                    {provinces.slice(0, 8).map((p) => {
                      const nodeKey = `PROV-${p.name}`;
                      const isExpanded = expandedNodes[nodeKey];
                      const subs = provincialSubLevels[p.name] || [];

                      return (
                        <div key={p.code} className="flex flex-col gap-1">
                          <div
                            onClick={() => toggleNode(nodeKey)}
                            className="cursor-pointer bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-lg p-2.5 flex items-center justify-between transition max-w-xl"
                          >
                            <div className="flex items-center gap-2">
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                              <Building2 className="w-4 h-4 text-amber-400" />
                              <span className="font-bold text-slate-200">Direcção Provincial do {p.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded">
                              {subs.length} sub-níveis
                            </span>
                          </div>

                          {isExpanded && (
                            <div className="pl-6 border-l border-slate-800 ml-4 flex flex-col gap-1 mt-1 font-sans">
                              {subs.map((sub) => (
                                <div key={sub.id} className="bg-slate-950/60 border border-slate-850 rounded p-2 text-xs flex items-center justify-between max-w-lg">
                                  <span className="text-slate-300 font-semibold">{sub.name}</span>
                                  <span className="text-[10px] font-mono text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded">{sub.code}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: JSON MATRIX */}
      {activeTab === "matrix" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Matriz de Governação Organizacional (JSON Schema)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Estrutura de dados serializada dos 21 órgãos provinciais e sub-níveis cadastrados.
              </p>
            </div>

            <button
              onClick={handleCopyJSON}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 transition"
            >
              <Copy className="w-4 h-4" />
              <span>Copiar JSON Completo</span>
            </button>
          </div>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-emerald-400 font-mono max-h-[500px] overflow-y-auto custom-scrollbar">
            {JSON.stringify(provincialSubLevels, null, 2)}
          </pre>
        </div>
      )}

      {/* MODAL FOR ADDING / EDITING SUBLEVEL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4 text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <span>{modalMode === "ADD" ? "Adicionar Sub-Nível" : "Editar Sub-Nível"} — {selectedProvName}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded bg-slate-800"
              >
                ESC
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nome Oficial do Sub-Nível *</label>
                <input
                  type="text"
                  value={editingSubLevel.name}
                  onChange={(e) => setEditingSubLevel({ ...editingSubLevel, name: e.target.value })}
                  placeholder="Ex: Departamento de Segurança Penitenciária Provincial"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Código / Sigla *</label>
                  <input
                    type="text"
                    value={editingSubLevel.code}
                    onChange={(e) => setEditingSubLevel({ ...editingSubLevel, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: DSPP"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tipo de Unidade</label>
                  <select
                    value={editingSubLevel.type}
                    onChange={(e) => setEditingSubLevel({ ...editingSubLevel, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="DEPARTAMENTO">Departamento</option>
                    <option value="SECCAO">Secção</option>
                    <option value="PAVILHAO">Pavilhão</option>
                    <option value="SERVICO">Serviço</option>
                    <option value="POSTO_MEDICO">Posto Médico</option>
                    <option value="OFICINA">Oficina Fabril</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nível de Segurança</label>
                  <select
                    value={editingSubLevel.securityLevel}
                    onChange={(e) => setEditingSubLevel({ ...editingSubLevel, securityLevel: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="PUBLICO">Público</option>
                    <option value="RESERVADO">Reservado</option>
                    <option value="CONFIDENCIAL">Confidencial</option>
                    <option value="SECRETO">Secreto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Efetivo Previsto</label>
                  <input
                    type="number"
                    value={editingSubLevel.staffCount || 10}
                    onChange={(e) => setEditingSubLevel({ ...editingSubLevel, staffCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Descrição / Atribuições Estatutárias</label>
                <textarea
                  value={editingSubLevel.description || ""}
                  onChange={(e) => setEditingSubLevel({ ...editingSubLevel, description: e.target.value })}
                  rows={3}
                  placeholder="Descrição breve da missão do sub-nível..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSubLevel}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Guardar Sub-Nível</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
