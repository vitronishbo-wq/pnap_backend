import React, { useState, useMemo } from "react";
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
  ArrowRight
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

// Standard Statutory Sub-Units defined by Decreto Presidencial n.º 184/17
const STANDARD_STATUTORY_SUBUNITS = [
  {
    nameSuffix: "Departamento de Operações e Segurança Penitenciária",
    codePrefix: "DOSP",
    type: "DEPARTAMENTO" as const,
    legalBasis: "Decreto Presidencial n.º 184/17, Artigo 19.º",
    sections: [
      { name: "Secção de Custódia, Trânsito e Escolta", code: "SCTE", legalBasis: "Art. 19.º, n.º 2" },
      { name: "Secção de Vigilância e Inspeção Operativa", code: "SVIO", legalBasis: "Art. 19.º, n.º 3" }
    ]
  },
  {
    nameSuffix: "Departamento de Reabilitação e Reinserção Social",
    codePrefix: "DRRS",
    type: "DEPARTAMENTO" as const,
    legalBasis: "Decreto Presidencial n.º 184/17, Artigo 20.º",
    sections: [
      { name: "Secção de Assistência Social e Saúde", code: "SASS", legalBasis: "Art. 20.º, n.º 2" },
      { name: "Secção de Trabalho e Formação Profissional", code: "STFP", legalBasis: "Art. 20.º, n.º 3" }
    ]
  },
  {
    nameSuffix: "Departamento de Recursos Humanos",
    codePrefix: "DRH",
    type: "DEPARTAMENTO" as const,
    legalBasis: "Decreto Presidencial n.º 184/17, Artigo 21.º",
    sections: [
      { name: "Secção de Gestão de Pessoal e Quadros", code: "SGPQ", legalBasis: "Art. 21.º, n.º 2" }
    ]
  },
  {
    nameSuffix: "Departamento de Logística e Infraestruturas",
    codePrefix: "DLI",
    type: "DEPARTAMENTO" as const,
    legalBasis: "Decreto Presidencial n.º 184/17, Artigo 22.º",
    sections: [
      { name: "Secção de Material e Intendência", code: "SMI", legalBasis: "Art. 22.º, n.º 2" }
    ]
  },
  {
    nameSuffix: "Gabinete do Director Provincial",
    codePrefix: "GDP",
    type: "GABINETE" as const,
    legalBasis: "Decreto Presidencial n.º 184/17, Artigo 18.º",
    sections: [
      { name: "Secção de Inspeção e Apoio Jurídico", code: "SIAJ", legalBasis: "Art. 18.º, n.º 4" }
    ]
  }
];

const ALL_PROVINCES_LIST = [
  "Luanda", "Huambo", "Uíge", "Benguela", "Huíla", "Cabinda",
  "Bengo", "Bié", "Cuanza Norte", "Cuanza Sul", "Cunene", "Cuando Cubango",
  "Lunda Norte", "Lunda Sul", "Malanje", "Moxico", "Namibe", "Zaire"
];

export function OrganizationalHierarchyConfig({
  organizationalUnits,
  setOrganizationalUnits,
  prisons = [],
  setPrisons,
  triggerToast = () => {},
  currentOperator
}: OrganizationalHierarchyConfigProps) {
  // Filters & State
  const [selectedProvinceFilter, setSelectedProvinceFilter] = useState<string>("Luanda");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "OU-MININT-DG": true,
    "OU-DP-LUANDA": true,
    "OU-DP-HUAMBO": true
  });

  // Modal State for Adding/Editing Sub-Unit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [parentUnitId, setParentUnitId] = useState<string>("OU-DP-LUANDA");
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formType, setFormType] = useState<"DEPARTAMENTO" | "SECCAO" | "REPARTICAO" | "GABINETE" | "ESTAB_PENITENCIARIO">("DEPARTAMENTO");
  const [formLegalBasis, setFormLegalBasis] = useState("Decreto Presidencial n.º 184/17, Artigo 19.º");
  const [formHeadOfficer, setFormHeadOfficer] = useState("");

  // Modal State for Associating Prison
  const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false);
  const [selectedPrisonIdToAssociate, setSelectedPrisonIdToAssociate] = useState<string>("");
  const [targetParentUnitId, setTargetParentUnitId] = useState<string>("OU-DP-LUANDA");

  // Toggle node expansion
  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Group units by parent
  const provincialDirectorates = useMemo(() => {
    return organizationalUnits.filter(u => u.level === TerritorialScope.PROVINCIAL);
  }, [organizationalUnits]);

  // Selected Directorate
  const activeDirectorate = useMemo(() => {
    return provincialDirectorates.find(d => d.province?.toLowerCase() === selectedProvinceFilter.toLowerCase()) 
      || provincialDirectorates[0];
  }, [provincialDirectorates, selectedProvinceFilter]);

  // Children of a specific unit
  const getChildren = (parentId: string) => {
    return organizationalUnits.filter(u => u.parentId === parentId);
  };

  // Compliance checker per provincial directorate
  const evaluateDirectorateCompliance = (dirId: string) => {
    const children = getChildren(dirId);
    const hasDOSP = children.some(c => c.name.toLowerCase().includes("operaç") || c.name.toLowerCase().includes("seguranç"));
    const hasDRRS = children.some(c => c.name.toLowerCase().includes("reabilitaç") || c.name.toLowerCase().includes("reinserç"));
    const hasDRH = children.some(c => c.name.toLowerCase().includes("recursos humanos") || c.code?.includes("DRH"));
    const hasDLI = children.some(c => c.name.toLowerCase().includes("logística") || c.code?.includes("DLI"));

    const score = [hasDOSP, hasDRRS, hasDRH, hasDLI].filter(Boolean).length;
    return {
      score,
      max: 4,
      isCompliant: score === 4,
      missing: [
        !hasDOSP && "Departamento de Operações e Segurança",
        !hasDRRS && "Departamento de Reabilitação Social",
        !hasDRH && "Departamento de Recursos Humanos",
        !hasDLI && "Departamento de Logística e Infraestruturas"
      ].filter(Boolean) as string[]
    };
  };

  // Overall statistics
  const totalProvincialDirs = provincialDirectorates.length;
  const totalSubDivisions = organizationalUnits.filter(u => u.divisionType && u.divisionType !== "ESTAB_PENITENCIARIO" && u.divisionType !== "DIRECAO_PROVINCIAL").length;
  const totalAssociatedPrisons = organizationalUnits.filter(u => u.level === TerritorialScope.ESTABLISHMENT).length;

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
    setFormLegalBasis("Decreto Presidencial n.º 184/17, Artigo 19.º");
    setFormHeadOfficer("");
  };

  // Open Edit Modal
  const handleEditUnit = (unit: OrganizationalUnit) => {
    setEditingUnitId(unit.id);
    setParentUnitId(unit.parentId || "OU-MININT-DG");
    setFormName(unit.name);
    setFormCode(unit.code || "");
    setFormType((unit.divisionType as any) || "DEPARTAMENTO");
    setFormLegalBasis(unit.legalBasis || "Decreto Presidencial n.º 184/17, Artigo 19.º");
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

  // Auto-conform directorate to Dec. Presidencial 184/17
  const handleAutoConformDirectorate = (dir: OrganizationalUnit) => {
    const existingChildren = getChildren(dir.id);
    let addedCount = 0;

    const newUnits: OrganizationalUnit[] = [];

    STANDARD_STATUTORY_SUBUNITS.forEach(std => {
      const exists = existingChildren.some(c => c.name.toLowerCase().includes(std.codePrefix.toLowerCase()) || c.name.toLowerCase().includes(std.nameSuffix.split(" ")[1].toLowerCase()));
      if (!exists) {
        const deptId = `OU-DEPT-${dir.province}-${std.codePrefix}-${Date.now()}`;
        newUnits.push({
          id: deptId,
          name: `${std.nameSuffix} (${dir.province})`,
          level: TerritorialScope.PROVINCIAL,
          parentId: dir.id,
          province: dir.province,
          divisionType: std.type,
          code: `${std.codePrefix}-${dir.province?.substring(0, 3).toUpperCase()}`,
          legalBasis: std.legalBasis
        });
        addedCount++;

        // Add sections
        std.sections.forEach(sec => {
          newUnits.push({
            id: `OU-SEC-${dir.province}-${sec.code}-${Date.now()}`,
            name: `${sec.name} (${dir.province})`,
            level: TerritorialScope.PROVINCIAL,
            parentId: deptId,
            province: dir.province,
            divisionType: "SECCAO",
            code: `${sec.code}-${dir.province?.substring(0, 3).toUpperCase()}`,
            legalBasis: sec.legalBasis
          });
          addedCount++;
        });
      }
    });

    if (addedCount > 0) {
      setOrganizationalUnits(prev => [...prev, ...newUnits]);
      triggerToast("CONFORMIDADE 184/17 APLICADA", `${addedCount} novos departamentos e secções estatutárias foram criados para a ${dir.name}.`, "success");
    } else {
      triggerToast("DIREÇÃO CONFORME", `A ${dir.name} já possui a estrutura regulamentar completa exigida pelo Decreto 184/17.`, "info");
    }
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

    // Check if already in org units
    const existing = organizationalUnits.find(u => u.prisonId === selectedPrisonIdToAssociate);
    if (existing) {
      // Update parentId
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
      // Create new org unit binding for prison
      const newOrgUnit: OrganizationalUnit = {
        id: `OU-PRIS-${selectedPrisonIdToAssociate}`,
        name: prisonObj?.name || `Estabelecimento ${selectedPrisonIdToAssociate}`,
        level: TerritorialScope.ESTABLISHMENT,
        parentId: targetParentUnitId,
        province: parentUnit?.province || prisonObj?.location?.split(",")[0] || selectedProvinceFilter,
        prisonId: selectedPrisonIdToAssociate,
        divisionType: "ESTAB_PENITENCIARIO",
        legalBasis: "Decreto Presidencial n.º 184/17, Artigo 25.º"
      };
      setOrganizationalUnits(prev => [...prev, newOrgUnit]);
      triggerToast("ESTABELECIMENTO VINCULADO", `O ${prisonObj?.name} foi associado à hierarquia da ${parentUnit?.name}.`, "success");
    }

    setIsAssociateModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 text-slate-100 font-sans">
      
      {/* HEADER BAR */}
      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <FolderTree className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100 uppercase tracking-wide font-mono">
                Hierarquia Organizacional & Estrutura das Direções Provinciais
              </h2>
              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                Dec. Pres. n.º 184/17
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Gestão de sub-níveis (Departamentos, Secções e Gabinetes) e vinculação de Estabelecimentos Penitenciários à árvore orgânica do PNAP-AO.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setParentUnitId(activeDirectorate?.id || "OU-MININT-DG");
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-md"
          >
            <Plus className="h-4 w-4" />
            Adicionar Sub-Nível Orgânico
          </button>
          
          <button
            onClick={() => setIsAssociateModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-750 font-mono text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
          >
            <LinkIcon className="h-4 w-4 text-emerald-400" />
            Associar Estabelecimento Penitenciário
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
            <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Direções Provinciais</span>
            <span className="text-lg font-bold font-mono text-slate-100">{totalProvincialDirs} <span className="text-xs text-slate-500 font-normal">Unidades</span></span>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex items-center gap-3.5">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Sub-Divisões Orgânicas</span>
            <span className="text-lg font-bold font-mono text-slate-100">{totalSubDivisions} <span className="text-xs text-slate-500 font-normal">Dept / Secções</span></span>
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
            <span className="text-[10px] text-slate-400 font-mono uppercase font-semibold block">Conformidade Legal</span>
            <span className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Dec. Pres. 184/17
            </span>
          </div>
        </div>
      </div>

      {/* MAIN TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PROVINCIAL SELECTOR SIDEBAR (COL 4) */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-850 rounded-2xl p-4 flex flex-col gap-4">
          <div className="border-b border-slate-900 pb-3">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="h-4 w-4 text-amber-500" /> Direções Provinciais (18 Províncias)
            </h3>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">Selecione uma jurisdição para auditar e editar os sub-níveis.</p>
          </div>

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

          <div className="flex flex-col gap-1.5 max-h-[500px] overflow-y-auto pr-1">
            {ALL_PROVINCES_LIST
              .filter(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(prov => {
                const dir = provincialDirectorates.find(d => d.province?.toLowerCase() === prov.toLowerCase());
                const isSelected = selectedProvinceFilter.toLowerCase() === prov.toLowerCase();
                const comp = dir ? evaluateDirectorateCompliance(dir.id) : { score: 0, max: 4, isCompliant: false, missing: [] };
                const childCount = dir ? getChildren(dir.id).length : 0;

                return (
                  <button
                    key={prov}
                    onClick={() => setSelectedProvinceFilter(prov)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold shadow-md"
                        : "bg-slate-900/40 border-slate-850/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-mono font-semibold flex items-center gap-2">
                        <span>📍 Direção Provincial de {prov}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans">
                        {childCount} sub-unidades • {comp.isCompliant ? (
                          <span className="text-emerald-400 font-mono">Conforme 184/17</span>
                        ) : (
                          <span className="text-amber-400/90 font-mono">{comp.score}/4 Depts. Estatutários</span>
                        )}
                      </span>
                    </div>

                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "text-amber-400 translate-x-0.5" : "text-slate-600"}`} />
                  </button>
                );
              })}
          </div>
        </div>

        {/* TREE HIERARCHY EDITOR & INSPECTOR (COL 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Active Directorate Details Box */}
          {activeDirectorate ? (
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-5 flex flex-col gap-5">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-900 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100 font-mono uppercase">
                      {activeDirectorate.name}
                    </h3>
                    <span className="bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono px-2 py-0.5 rounded">
                      Província de {activeDirectorate.province}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Legislação aplicável: <strong className="text-slate-300 font-mono text-[11px]">Decreto Presidencial n.º 184/17, Artigos 17.º ao 24.º</strong>
                  </p>
                </div>

                <button
                  onClick={() => handleAutoConformDirectorate(activeDirectorate)}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer shrink-0"
                  title="Gera automaticamente os Departamentos de Operações, Reabilitação, RH e Logística conforme o Artigo 18.º do Decreto 184/17"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Auto-Conformar (Dec. 184/17)
                </button>
              </div>

              {/* Compliance Status Alert Box */}
              {(() => {
                const comp = evaluateDirectorateCompliance(activeDirectorate.id);
                if (comp.isCompliant) {
                  return (
                    <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3.5 flex items-start gap-3 text-xs text-emerald-300">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-mono font-bold uppercase block text-emerald-400 text-xxs tracking-wider">ESTRUTURA INTEGRALMENTE CONFORME</span>
                        <p className="text-slate-300 text-xxs font-sans mt-0.5">
                          Esta Direção Provincial cumpre todos os requisitos orgânicos exigidos pelo Decreto Presidencial n.º 184/17 (Operações, Reabilitação, RH e Logística ativos).
                        </p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-300">
                    <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono font-bold uppercase block text-amber-400 text-xxs tracking-wider">PENDÊNCIAS ESTATUTÁRIAS DE DEPARTAMENTO ({comp.score}/4)</span>
                      <p className="text-slate-300 text-xxs font-sans mt-0.5">
                        Faltam as seguintes divisões regulamentares nesta Direção Provincial: <strong className="text-amber-300 font-mono">{comp.missing.join(", ")}</strong>. Clique em "Auto-Conformar" para criar a estrutura regulamentar.
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* TREE DISPLAY */}
              <div className="border border-slate-900 rounded-xl bg-slate-900/40 p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-850 pb-2">
                  <span>Árvore Orgânica & Divisões Hierárquicas</span>
                  <span className="text-[10px] text-slate-500 font-normal">Clique para expandir/recolher</span>
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
                              prisons={prisons}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-12 text-center text-slate-500 font-mono text-xs">
              Selecione uma Direção Provincial na lista lateral.
            </div>
          )}

        </div>
      </div>

      {/* MODAL 1: ADD / EDIT SUB-UNIT */}
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
                  className="text-slate-500 hover:text-slate-200 text-xs font-mono px-2 py-1 rounded bg-slate-900"
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
                    {organizationalUnits.map(u => (
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
                      <option value="ESTAB_PENITENCIARIO">ESTABELECIMENTO PENITENCIÁRIO</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                      Código / Sigla:
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: DOSP-LUA"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                    Designação Completa da Divisão:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Departamento de Operações e Segurança Penitenciária"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                    Fundamento Legal (Dec. Presidencial 184/17):
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Decreto Presidencial n.º 184/17, Artigo 19.º"
                    value={formLegalBasis}
                    onChange={(e) => setFormLegalBasis(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                    Chefe / Responsável de Divisão (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Superintendente Prisional Carlos Silva"
                    value={formHeadOfficer}
                    onChange={(e) => setFormHeadOfficer(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-400 px-4 py-2 rounded-xl text-xs font-mono"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    Salvar Divisão
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ASSOCIATE PENITENTIARY ESTABLISHMENT */}
      <AnimatePresence>
        {isAssociateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-5"
            >
              <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-mono uppercase flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-emerald-400" /> Associar Estabelecimento Penitenciário
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Vincule uma unidade prisional à tutela hierárquica de uma Direção Provincial ou Departamento.
                  </p>
                </div>
                <button 
                  onClick={() => setIsAssociateModalOpen(false)}
                  className="text-slate-500 hover:text-slate-200 text-xs font-mono px-2 py-1 rounded bg-slate-900"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAssociatePrison} className="flex flex-col gap-4 text-xs font-sans">
                
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                    Selecione o Estabelecimento Penitenciário:
                  </label>
                  <select
                    value={selectedPrisonIdToAssociate}
                    onChange={(e) => setSelectedPrisonIdToAssociate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                    required
                  >
                    <option value="">-- Selecione o Estabelecimento --</option>
                    {prisons.map(p => (
                      <option key={p.id} value={p.id}>
                        🏰 {p.name} ({p.location || 'Sem localização'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1">
                    Vincular à Unidade Orgânica de Tutela:
                  </label>
                  <select
                    value={targetParentUnitId}
                    onChange={(e) => setTargetParentUnitId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  >
                    {organizationalUnits.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.level === TerritorialScope.PROVINCIAL ? "📍 [DIR. PROVINCIAL]" : "🔹 [DIVISÃO]"} {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl text-slate-400 text-xxs font-sans">
                  <span className="text-amber-400 font-mono font-bold block mb-0.5">NOTA INSTITUCIONAL (Dec. 184/17, Artigo 25.º):</span>
                  A vinculação do estabelecimento assegura a consolidação automática do efetivo prisional, relatórios de custódia e delegação de autoridade da Direção Provincial respetiva.
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={() => setIsAssociateModalOpen(false)}
                    className="bg-slate-900 hover:bg-slate-800 text-slate-400 px-4 py-2 rounded-xl text-xs font-mono"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <LinkIcon className="h-3.5 w-3.5" /> Confirmar Vinculação
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

// Sub-Component for Rendering Tree Nodes Recursively
function TreeNodeItem({
  unit,
  getChildren,
  expandedNodes,
  toggleNode,
  onEdit,
  onDelete,
  onAddChild,
  onAssociatePrison,
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
  prisons: any[];
}) {
  const children = getChildren(unit.id);
  const isExpanded = !!expandedNodes[unit.id];
  const isPrisonNode = unit.level === TerritorialScope.ESTABLISHMENT || unit.divisionType === "ESTAB_PENITENCIARIO";

  return (
    <div className="flex flex-col gap-2">
      <div className={`border rounded-lg p-2.5 flex items-center justify-between transition-colors ${
        isPrisonNode 
          ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-200" 
          : "bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-750"
      }`}>
        <div className="flex items-center gap-2">
          {children.length > 0 ? (
            <button 
              onClick={() => toggleNode(unit.id)}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 transition"
            >
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold">{unit.name}</span>
              {unit.code && (
                <span className="bg-slate-950 border border-slate-800 text-slate-400 text-[9px] font-mono px-1.5 rounded">
                  {unit.code}
                </span>
              )}
            </div>
            {unit.legalBasis && (
              <span className="text-[9px] font-mono text-slate-500">{unit.legalBasis}</span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          {!isPrisonNode && (
            <button
              onClick={() => onAddChild(unit.id)}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded transition"
              title="Adicionar sub-secção dependente"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            onClick={() => onEdit(unit)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-blue-400 rounded transition"
            title="Editar parâmetros desta divisão"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => onDelete(unit.id, unit.name)}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded transition"
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
              prisons={prisons}
            />
          ))}
        </div>
      )}
    </div>
  );
}
