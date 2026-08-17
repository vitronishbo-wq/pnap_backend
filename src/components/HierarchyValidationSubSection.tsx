import React, { useState, useMemo } from "react";
import { 
  Network, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  GripVertical, 
  ArrowRight, 
  CornerDownRight, 
  Building2, 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  FileCheck2, 
  Info,
  SlidersHorizontal,
  FolderTree,
  Lock
} from "lucide-react";
import { OrganizationalUnit, TerritorialScope } from "../types";

export const PROVINCES_ANGOLA = [
  "Cabinda", "Zaire", "Uíge", "Bengo", "Icolo e Bengo", "Luanda", 
  "Cuanza-Norte", "Cuanza-Sul", "Malanje", "Lunda-Norte", "Lunda-Sul", 
  "Benguela", "Huambo", "Bié", "Moxico", "Moxico Leste", "Huíla", 
  "Namibe", "Cunene", "Cubango", "Cuando"
];

export const normalizeProvinceName = (name?: string): string => {
  if (!name) return "";
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-_]/g, "");
};

interface HierarchyValidationSubSectionProps {
  organizationalUnits: OrganizationalUnit[];
  setOrganizationalUnits: React.Dispatch<React.SetStateAction<OrganizationalUnit[]>>;
  initialProvince?: string;
  triggerToast?: (title: string, message: string, type?: "success" | "error" | "info" | "warning") => void;
}

interface ValidationLog {
  id: string;
  timestamp: string;
  unitName: string;
  oldParentName: string;
  newParentName: string;
  province: string;
  status: "APROVADO" | "REJEITADO";
  reason: string;
}

export function HierarchyValidationSubSection({
  organizationalUnits,
  setOrganizationalUnits,
  initialProvince = "Luanda",
  triggerToast = () => {}
}: HierarchyValidationSubSectionProps) {
  const [selectedProvince, setSelectedProvince] = useState<string>(initialProvince);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [divisionFilter, setDivisionFilter] = useState<string>("ALL");
  const [isSectionExpanded, setIsSectionExpanded] = useState<boolean>(true);
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [logs, setLogs] = useState<ValidationLog[]>([]);

  // Drag and Drop State
  const [draggedUnit, setDraggedUnit] = useState<OrganizationalUnit | null>(null);
  const [dragOverTargetId, setDragOverTargetId] = useState<string | null>(null);
  const [realtimeValidationState, setRealtimeValidationState] = useState<{
    targetId: string;
    isValid: boolean;
    reason: string;
  } | null>(null);

  // Filter units belonging to selected province
  const provinceUnits = useMemo(() => {
    const selNorm = normalizeProvinceName(selectedProvince);
    return organizationalUnits.filter(u => {
      if (u.province) {
        return normalizeProvinceName(u.province) === selNorm;
      }
      return false;
    });
  }, [organizationalUnits, selectedProvince]);

  // Find the Provincial Directorate (root unit for the province)
  const provincialDirectorate = useMemo(() => {
    return provinceUnits.find(u => 
      u.divisionType === "DIRECAO_PROVINCIAL" || 
      u.name.toLowerCase().includes("sp/") || 
      u.name.toLowerCase().includes("direção provincial") ||
      u.name.toLowerCase().includes("direcção provincial")
    ) || provinceUnits[0];
  }, [provinceUnits]);

  // Helper map for quick unit lookup by id
  const unitsMap = useMemo(() => {
    const map = new Map<string, OrganizationalUnit>();
    organizationalUnits.forEach(u => map.set(u.id, u));
    return map;
  }, [organizationalUnits]);

  // Check if a unit is a descendant of another (to prevent cyclic hierarchy)
  const isDescendant = (candidateDescendantId: string, ancestorId: string): boolean => {
    let current = unitsMap.get(candidateDescendantId);
    const visited = new Set<string>();
    while (current && current.parentId && !visited.has(current.parentId)) {
      visited.add(current.parentId);
      if (current.parentId === ancestorId) {
        return true;
      }
      current = unitsMap.get(current.parentId);
    }
    return false;
  };

  // Real-time validation algorithm
  const validateHierarchyMove = (
    childUnit: OrganizationalUnit,
    targetParent: OrganizationalUnit | { id: string; name: string; province: string }
  ): { isValid: boolean; reason: string } => {
    // Rule 1: Cannot drop onto itself
    if (childUnit.id === targetParent.id) {
      return {
        isValid: false,
        reason: "Operação inválida: A unidade não pode ser subordinada de si própria."
      };
    }

    // Rule 2: Cannot drop onto a descendant (cycles)
    if (isDescendant(targetParent.id, childUnit.id)) {
      return {
        isValid: false,
        reason: "Ciclo Hierárquico Proibido: A unidade de destino já é subordinada desta unidade."
      };
    }

    // Rule 3: STRICT PROVINCE VALIDATION (Core Requirement)
    const childProvince = normalizeProvinceName(childUnit.province);
    const parentProvince = normalizeProvinceName(targetParent.province);

    if (childProvince !== parentProvince) {
      return {
        isValid: false,
        reason: `Rejeição de Jurisdição: A unidade filho pertence à província de "${childUnit.province || 'Sem Província'}", mas a unidade pai pertence à província de "${targetParent.province || 'Nacional/Outra'}". Reatribuição interprovincial é proibida.`
      };
    }

    return {
      isValid: true,
      reason: `Validação Aprovada: Ambas as unidades pertencem à Província de ${childUnit.province}. Hierarquia conforme com a jurisdição territorial.`
    };
  };

  // Drag Event Handlers
  const handleDragStart = (e: React.DragEvent, unit: OrganizationalUnit) => {
    setDraggedUnit(unit);
    e.dataTransfer.setData("application/json", JSON.stringify(unit));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedUnit(null);
    setDragOverTargetId(null);
    setRealtimeValidationState(null);
  };

  const handleDragOver = (e: React.DragEvent, targetParent: OrganizationalUnit) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedUnit) return;

    if (dragOverTargetId !== targetParent.id) {
      setDragOverTargetId(targetParent.id);
      const validation = validateHierarchyMove(draggedUnit, targetParent);
      setRealtimeValidationState({
        targetId: targetParent.id,
        isValid: validation.isValid,
        reason: validation.reason
      });
    }
  };

  const handleDragLeave = (e: React.DragEvent, targetParent: OrganizationalUnit) => {
    e.preventDefault();
    if (dragOverTargetId === targetParent.id) {
      setDragOverTargetId(null);
      setRealtimeValidationState(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetParent: OrganizationalUnit) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedUnit) {
      setDragOverTargetId(null);
      setRealtimeValidationState(null);
      return;
    }

    const validation = validateHierarchyMove(draggedUnit, targetParent);
    const timestamp = new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const oldParent = unitsMap.get(draggedUnit.parentId || "");

    if (!validation.isValid) {
      // Reject operation
      const newLog: ValidationLog = {
        id: `LOG-REJ-${Date.now()}`,
        timestamp,
        unitName: draggedUnit.name,
        oldParentName: oldParent?.name || "Sem Superior",
        newParentName: targetParent.name,
        province: selectedProvince,
        status: "REJEITADO",
        reason: validation.reason
      };
      setLogs(prev => [newLog, ...prev]);

      triggerToast(
        "Validação de Hierarquia Recusada",
        validation.reason,
        "error"
      );
    } else {
      // Accept operation & update state
      setOrganizationalUnits(prev => prev.map(u => {
        if (u.id === draggedUnit.id) {
          return {
            ...u,
            parentId: targetParent.id
          };
        }
        return u;
      }));

      const newLog: ValidationLog = {
        id: `LOG-APRV-${Date.now()}`,
        timestamp,
        unitName: draggedUnit.name,
        oldParentName: oldParent?.name || "Sem Superior",
        newParentName: targetParent.name,
        province: selectedProvince,
        status: "APROVADO",
        reason: `Reatribuição autorizada: vinculada sob ${targetParent.name} na Província de ${selectedProvince}.`
      };
      setLogs(prev => [newLog, ...prev]);

      triggerToast(
        "Hierarquia Atualizada com Sucesso",
        `A unidade "${draggedUnit.name}" foi vinculada sob "${targetParent.name}" com validação provincial conforme.`,
        "success"
      );
    }

    setDraggedUnit(null);
    setDragOverTargetId(null);
    setRealtimeValidationState(null);
  };

  // Re-attach to Root Provincial Unit
  const handleDropToProvincialRoot = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedUnit || !provincialDirectorate) {
      setDragOverTargetId(null);
      setRealtimeValidationState(null);
      return;
    }

    if (draggedUnit.id === provincialDirectorate.id) {
      triggerToast("Operação Desnecessária", "A unidade já é a Direção Provincial de topo.", "info");
      setDraggedUnit(null);
      setDragOverTargetId(null);
      setRealtimeValidationState(null);
      return;
    }

    const validation = validateHierarchyMove(draggedUnit, provincialDirectorate);
    const timestamp = new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const oldParent = unitsMap.get(draggedUnit.parentId || "");

    if (validation.isValid) {
      setOrganizationalUnits(prev => prev.map(u => {
        if (u.id === draggedUnit.id) {
          return {
            ...u,
            parentId: provincialDirectorate.id
          };
        }
        return u;
      }));

      setLogs(prev => [
        {
          id: `LOG-ROOT-${Date.now()}`,
          timestamp,
          unitName: draggedUnit.name,
          oldParentName: oldParent?.name || "Sem Superior",
          newParentName: provincialDirectorate.name,
          province: selectedProvince,
          status: "APROVADO",
          reason: `Reatribuída para nível superior direto sob a Direção Provincial (${selectedProvince}).`
        },
        ...prev
      ]);

      triggerToast(
        "Vinculação Direta à Direção Provincial",
        `Unidade "${draggedUnit.name}" agora responde diretamente à Direção Provincial de ${selectedProvince}.`,
        "success"
      );
    } else {
      triggerToast("Erro de Validação", validation.reason, "error");
    }

    setDraggedUnit(null);
    setDragOverTargetId(null);
    setRealtimeValidationState(null);
  };

  // Verification of all units in this province
  const provincialIntegrityStatus = useMemo(() => {
    let compliantCount = 0;
    let nonCompliantCount = 0;
    const errors: string[] = [];

    provinceUnits.forEach(unit => {
      if (unit.id === provincialDirectorate?.id) {
        compliantCount++;
        return;
      }
      if (!unit.parentId) {
        compliantCount++;
        return;
      }
      const parent = unitsMap.get(unit.parentId);
      if (!parent) {
        compliantCount++;
      } else if (parent.level === TerritorialScope.NATIONAL) {
        compliantCount++;
      } else if (parent.province && parent.province.toLowerCase().trim() === selectedProvince.toLowerCase().trim()) {
        compliantCount++;
      } else {
        nonCompliantCount++;
        errors.push(`"${unit.name}" tem como pai "${parent.name}" da província "${parent.province || 'Indefinida'}"`);
      }
    });

    const total = provinceUnits.length || 1;
    const percentage = Math.round((compliantCount / total) * 100);

    return {
      compliantCount,
      nonCompliantCount,
      percentage,
      isPerfect: nonCompliantCount === 0,
      errors
    };
  }, [provinceUnits, provincialDirectorate, unitsMap, selectedProvince]);

  // Filtered displayed units
  const filteredUnits = useMemo(() => {
    return provinceUnits.filter(unit => {
      const matchSearch = searchFilter === "" || 
        unit.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (unit.code && unit.code.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (unit.divisionType && unit.divisionType.toLowerCase().includes(searchFilter.toLowerCase()));

      const matchDivision = divisionFilter === "ALL" || unit.divisionType === divisionFilter;

      return matchSearch && matchDivision;
    });
  }, [provinceUnits, searchFilter, divisionFilter]);

  return (
    <div 
      id="subsecao-validacao-hierarquia"
      className="bg-slate-950/90 border-2 border-amber-500/40 rounded-xl p-4 flex flex-col gap-4 shadow-lg relative overflow-hidden transition"
    >
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500 opacity-80" />

      {/* Header Principal da Subseção */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Network className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold font-mono text-slate-100 uppercase tracking-wide">
                Validação de Hierarquia
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                Validação Territorial em Tempo Real
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Interface de selecção provincial e reatribuição hierárquica Drag-and-Drop com bloqueio estrito de anomalias interprovinciais.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-toggle-validacao-logs"
            onClick={() => setShowLogs(prev => !prev)}
            className={`px-2.5 py-1 text-[9.5px] font-mono font-bold uppercase rounded border transition flex items-center gap-1.5 cursor-pointer ${
              showLogs 
                ? "bg-amber-500 text-slate-950 border-amber-400" 
                : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500"
            }`}
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>Auditoria ({logs.length})</span>
          </button>

          <button
            type="button"
            id="btn-toggle-validacao-secao"
            onClick={() => setIsSectionExpanded(prev => !prev)}
            className="p-1 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 transition cursor-pointer"
            title={isSectionExpanded ? "Recolher Painel" : "Expandir Painel"}
          >
            {isSectionExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isSectionExpanded && (
        <div className="flex flex-col gap-4">
          {/* Seletor de Província & Barra de Ferramentas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
            {/* Província Dropdown + Quick Pills */}
            <div className="lg:col-span-5 flex flex-col gap-1.5">
              <label 
                htmlFor="select-provincia-hierarquia"
                className="text-[10px] uppercase font-mono font-bold text-amber-400 flex items-center gap-1.5"
              >
                <MapPin className="h-3.5 w-3.5 text-amber-500" />
                1. Seleccione a Província de Jurisdição:
              </label>
              <div className="relative">
                <select
                  id="select-provincia-hierarquia"
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="w-full bg-slate-950 border border-amber-500/40 text-amber-300 font-mono font-bold text-xs p-2 rounded-lg focus:outline-none focus:border-amber-400 cursor-pointer shadow-inner pr-8"
                >
                  {PROVINCES_ANGOLA.map(prov => (
                    <option key={prov} value={prov} className="bg-slate-950 text-slate-100 font-mono">
                      Província de {prov}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Province Shortcut Chips */}
              <div className="flex flex-wrap gap-1 mt-1">
                {["Luanda", "Benguela", "Huambo", "Huíla", "Cabinda", "Uíge"].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedProvince(p)}
                    className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold uppercase transition cursor-pointer border ${
                      selectedProvince === p
                        ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-amber-300 hover:border-slate-700"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Status de Integridade da Província Selecionada */}
            <div className="lg:col-span-4 flex flex-col justify-between bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-mono font-bold uppercase text-slate-400">
                  Conformidade da Província:
                </span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${
                  provincialIntegrityStatus.isPerfect 
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" 
                    : "bg-rose-500/15 border-rose-500/40 text-rose-400"
                }`}>
                  {provincialIntegrityStatus.percentage}% Válido
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 my-1 text-center font-mono">
                <div className="bg-slate-900 p-1 rounded border border-slate-850">
                  <span className="text-[8px] text-slate-400 block uppercase">Total Unidades</span>
                  <span className="text-xs font-black text-amber-400">{provinceUnits.length}</span>
                </div>
                <div className="bg-slate-900 p-1 rounded border border-slate-850">
                  <span className="text-[8px] text-slate-400 block uppercase">Departamentos</span>
                  <span className="text-xs font-black text-sky-400">
                    {provinceUnits.filter(u => u.divisionType === "DEPARTAMENTO").length}
                  </span>
                </div>
                <div className="bg-slate-900 p-1 rounded border border-slate-850">
                  <span className="text-[8px] text-slate-400 block uppercase">Secções/Postos</span>
                  <span className="text-xs font-black text-emerald-400">
                    {provinceUnits.filter(u => u.divisionType === "SECCAO" || u.divisionType === "ESTAB_PENITENCIARIO").length}
                  </span>
                </div>
              </div>

              <div className="text-[8.5px] font-mono text-slate-400 truncate">
                Direção Raiz: <span className="text-slate-200 font-bold">{provincialDirectorate?.name || "SP/" + selectedProvince}</span>
              </div>
            </div>

            {/* Filtros de Pesquisa Rápida */}
            <div className="lg:col-span-3 flex flex-col justify-between gap-1.5">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Pesquisar departamento / secção..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-[10px] font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1">
                <select
                  value={divisionFilter}
                  onChange={(e) => setDivisionFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-1.5 text-[9px] font-mono text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="ALL">Todas as Divisões</option>
                  <option value="DIRECAO_PROVINCIAL">Direção Provincial</option>
                  <option value="DEPARTAMENTO">Departamentos</option>
                  <option value="SECCAO">Secções</option>
                  <option value="ESTAB_PENITENCIARIO">Estabelecimentos Prisionais</option>
                </select>
              </div>
            </div>
          </div>

          {/* Banner de Feedback em Tempo Real de Drag and Drop */}
          {draggedUnit && (
            <div 
              id="painel-feedback-drag-drop"
              className={`p-3 rounded-lg border font-mono text-xs transition duration-150 flex items-start gap-2.5 shadow-md ${
                realtimeValidationState
                  ? realtimeValidationState.isValid
                    ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 animate-pulse"
                    : "bg-rose-950/90 border-rose-500 text-rose-200"
                  : "bg-slate-900 border-amber-500/50 text-amber-300"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {realtimeValidationState ? (
                  realtimeValidationState.isValid ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-rose-400 animate-bounce" />
                  )
                ) : (
                  <GripVertical className="h-4 w-4 text-amber-400" />
                )}
              </div>

              <div className="flex-1">
                <div className="font-bold flex items-center gap-2 flex-wrap">
                  <span>Arrastando: <strong>{draggedUnit.name}</strong></span>
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded text-[9px]">
                    Província: {draggedUnit.province || "N/A"}
                  </span>
                </div>
                <p className="text-[10px] mt-0.5 text-slate-300">
                  {realtimeValidationState 
                    ? realtimeValidationState.reason 
                    : "Arraste e solte sobre outra unidade da mesma província para reatribuir o vínculo hierárquico."}
                </p>
              </div>
            </div>
          )}

          {/* Drop Zone: Definir como Subordinada Direta da Direção Provincial */}
          {provincialDirectorate && (
            <div
              id="dropzone-direcao-provincial"
              onDragOver={(e) => handleDragOver(e, provincialDirectorate)}
              onDragLeave={(e) => handleDragLeave(e, provincialDirectorate)}
              onDrop={handleDropToProvincialRoot}
              className={`p-3 rounded-lg border-2 border-dashed transition flex items-center justify-between gap-3 cursor-pointer ${
                dragOverTargetId === provincialDirectorate.id
                  ? realtimeValidationState?.isValid
                    ? "bg-emerald-950/60 border-emerald-400 text-emerald-300 shadow-lg scale-[1.01]"
                    : "bg-rose-950/70 border-rose-500 text-rose-300 shadow-lg"
                  : "bg-slate-900/50 border-amber-500/30 hover:border-amber-400/60 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block">
                    Nível de Topo Provincial • {provincialDirectorate.name}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    Solte aqui qualquer unidade para vinculá-la diretamente à Direção Provincial de {selectedProvince}.
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-1 bg-slate-950 rounded border border-slate-800 text-slate-400 shrink-0">
                Zona de Topo
              </span>
            </div>
          )}

          {/* Lista de Unidades Organizacionais Subordinadas da Província com Drag-and-Drop */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 flex items-center gap-1.5">
                <FolderTree className="h-3.5 w-3.5 text-amber-400" />
                2. Estrutura de Unidades Organizacionais ({filteredUnits.length} exibidas):
              </span>
              <span className="text-[9px] font-mono text-slate-500">
                Arraste o item e solte sobre o novo pai desejado
              </span>
            </div>

            {filteredUnits.length === 0 ? (
              <div className="p-6 text-center bg-slate-900/50 rounded-lg border border-slate-800 text-slate-400 font-mono text-xs">
                Nenhuma unidade organizacional encontrada para os filtros aplicados na Província de {selectedProvince}.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredUnits.map((unit) => {
                  const parentUnit = unitsMap.get(unit.parentId || "");
                  const isCurrentDragTarget = dragOverTargetId === unit.id;
                  const isBeingDragged = draggedUnit?.id === unit.id;
                  const isRootDirectorate = unit.divisionType === "DIRECAO_PROVINCIAL";

                  // Check if parent matches province
                  const hasParentMismatch = parentUnit && 
                    parentUnit.level !== TerritorialScope.NATIONAL && 
                    parentUnit.province && 
                    parentUnit.province.toLowerCase().trim() !== (unit.province || "").toLowerCase().trim();

                  let dropTargetBorder = "border-slate-800 hover:border-slate-700 bg-slate-900/90";

                  if (isCurrentDragTarget) {
                    if (realtimeValidationState?.isValid) {
                      dropTargetBorder = "border-emerald-400 bg-emerald-950/70 shadow-lg ring-2 ring-emerald-500/30 scale-[1.01]";
                    } else {
                      dropTargetBorder = "border-rose-500 bg-rose-950/80 shadow-lg ring-2 ring-rose-500/30 animate-pulse";
                    }
                  } else if (isBeingDragged) {
                    dropTargetBorder = "border-amber-500/50 bg-amber-950/30 opacity-60";
                  }

                  return (
                    <div
                      key={unit.id}
                      id={`unit-card-${unit.id}`}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, unit)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, unit)}
                      onDragLeave={(e) => handleDragLeave(e, unit)}
                      onDrop={(e) => handleDrop(e, unit)}
                      className={`p-3 rounded-lg border transition-all duration-150 flex flex-col justify-between gap-2.5 cursor-grab active:cursor-grabbing relative select-none ${dropTargetBorder}`}
                    >
                      {/* Top Bar of Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div 
                            className="p-1 rounded bg-slate-950/80 text-slate-400 hover:text-amber-400 cursor-grab active:cursor-grabbing shrink-0"
                            title="Clique e arraste para reatribuir"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-xs font-bold text-slate-100 truncate">
                                {unit.name}
                              </span>
                              {unit.code && (
                                <span className="px-1.5 py-0.2 bg-slate-800 text-amber-300 rounded font-mono text-[8.5px] font-bold border border-slate-700">
                                  {unit.code}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                              {unit.divisionType || "UNIDADE"} • Província: <strong className="text-amber-400">{unit.province}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Division Badge */}
                        <span className={`px-2 py-0.5 rounded font-mono text-[8px] font-bold uppercase shrink-0 ${
                          isRootDirectorate 
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" 
                            : unit.divisionType === "DEPARTAMENTO"
                            ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}>
                          {isRootDirectorate ? "Direção Raiz" : unit.divisionType || "Secção"}
                        </span>
                      </div>

                      {/* Parent Linkage Details */}
                      <div className="bg-slate-950/70 p-2 rounded border border-slate-850 flex items-center justify-between text-[9px] font-mono">
                        <div className="flex items-center gap-1.5 min-w-0 text-slate-400">
                          <CornerDownRight className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">
                            Superior:{" "}
                            {parentUnit ? (
                              <strong className="text-slate-200">{parentUnit.name}</strong>
                            ) : (
                              <span className="text-slate-500 italic">Direção Geral (Nacional)</span>
                            )}
                          </span>
                        </div>

                        {/* Validation Badge for this node */}
                        {hasParentMismatch ? (
                          <span 
                            className="px-1.5 py-0.5 bg-rose-950 text-rose-400 border border-rose-800 rounded font-bold flex items-center gap-1 shrink-0"
                            title="Erro de jurisdição: Pai pertence a outra província"
                          >
                            <AlertTriangle className="h-3 w-3" /> Província Diferente
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 rounded font-bold flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="h-3 w-3" /> Conforme
                          </span>
                        )}
                      </div>

                      {/* Realtime hover tooltip if dragged over this item */}
                      {isCurrentDragTarget && realtimeValidationState && (
                        <div className={`p-1.5 rounded font-mono text-[9px] font-bold border ${
                          realtimeValidationState.isValid 
                            ? "bg-emerald-950 text-emerald-300 border-emerald-500" 
                            : "bg-rose-950 text-rose-300 border-rose-500"
                        }`}>
                          {realtimeValidationState.isValid ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                              Solte para vincular sob "{unit.name}" (Mesma Província: {unit.province})
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3 text-rose-400 shrink-0" />
                              {realtimeValidationState.reason}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Painel de Auditoria e Histórico de Validações */}
          {showLogs && (
            <div 
              id="painel-auditoria-validacao"
              className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex flex-col gap-2 font-mono"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                  <FileCheck2 className="h-3.5 w-3.5 text-amber-500" />
                  Registo de Auditoria de Validações Hierárquicas
                </span>
                {logs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setLogs([])}
                    className="text-[9px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Limpar Registo
                  </button>
                )}
              </div>

              {logs.length === 0 ? (
                <div className="text-[9.5px] text-slate-500 py-3 text-center">
                  Nenhuma operação de drag-and-drop registada nesta sessão.
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-2 rounded border text-[9.5px] flex flex-col gap-0.5 ${
                        log.status === "APROVADO"
                          ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                          : "bg-rose-950/40 border-rose-500/40 text-rose-300"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{log.timestamp} • {log.unitName}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[8px] uppercase ${
                          log.status === "APROVADO" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                        }`}>
                          {log.status}
                        </span>
                      </div>
                      <div className="text-[8.5px] text-slate-400">
                        De: <span className="text-slate-300">{log.oldParentName}</span> ➔ Para: <span className="text-slate-300">{log.newParentName}</span> (Província: {log.province})
                      </div>
                      <div className="text-[8.5px] italic text-slate-400 mt-0.5">
                        {log.reason}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
