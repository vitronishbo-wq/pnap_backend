import React, { useState } from "react";
import { 
  Building2, 
  Building, 
  MapPin, 
  Scale, 
  FileText, 
  Printer, 
  Layers, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Eye, 
  Search, 
  Network, 
  UserCheck, 
  ShieldAlert, 
  FileCheck,
  ChevronRight,
  ExternalLink,
  BookOpen
} from "lucide-react";
import { OrganizationalUnit, SystemOperator, Prison, Inmate } from "../types";
import { 
  CENTRAL_NATIONAL_UNITS, 
  DepartmentalDocument, 
  INITIAL_DEPARTMENTAL_DOCUMENTS, 
  PROVINCIAL_18_DEPENDENCIES_TEMPLATE,
  ANGOLA_PROVINCES
} from "../data/penitentiaryOrganicStructure";

interface DepartmentalOrganicDashboardProps {
  currentOperator: SystemOperator;
  selectedHierNode: {
    type: "PROVINCE" | "MUNICIPALITY" | "PRISON" | "PAVILION" | "CELL" | "ESTABLISHMENT" | "DEPARTMENT" | null;
    id: string | null;
    name: string | null;
    parentId?: string | null;
  };
  organizationalUnits: OrganizationalUnit[];
  prisons: Prison[];
  inmates: Inmate[];
  onSelectNode: (node: { type: any; id: string | null; name: string | null; parentId?: string | null }) => void;
  onWriteAuditLog: (action: string, entityType: string, entityId: string, details: string) => void;
}

export const DepartmentalOrganicDashboard: React.FC<DepartmentalOrganicDashboardProps> = ({
  currentOperator,
  selectedHierNode,
  organizationalUnits,
  prisons,
  inmates,
  onSelectNode,
  onWriteAuditLog
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"OVERVIEW" | "MIRROR_TREE" | "DOCUMENTS" | "EPS">("OVERVIEW");
  const [documents, setDocuments] = useState<DepartmentalDocument[]>(INITIAL_DEPARTMENTAL_DOCUMENTS);
  const [docFilterType, setDocFilterType] = useState<string>("ALL");
  const [selectedDocPreview, setSelectedDocPreview] = useState<DepartmentalDocument | null>(null);
  const [isCreateDocModalOpen, setIsCreateDocModalOpen] = useState(false);

  // New Document Form State
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocType, setNewDocType] = useState<DepartmentalDocument["type"]>("DESPACHO");
  const [newDocSecurity, setNewDocSecurity] = useState<DepartmentalDocument["securityLevel"]>("PÚBLICO");
  const [newDocSummary, setNewDocSummary] = useState("");
  const [newDocBody, setNewDocBody] = useState("");

  // Find currently selected unit
  const currentUnit: OrganizationalUnit = (organizationalUnits.find(u => u.id === selectedHierNode.id) || 
    CENTRAL_NATIONAL_UNITS.find(u => u.id === selectedHierNode.id) || {
      id: selectedHierNode.id || "DEP-UNKNOWN",
      name: selectedHierNode.name || "Dependência Orgânica",
      level: "NATIONAL" as any,
      code: "DEP",
      sigla: "DEP",
      category: "II - DEPENDÊNCIAS OPERACIONAIS (Executivas)",
      divisionType: "DEPARTAMENTO" as const,
      legalBasis: "Decreto Presidencial n.º 184/17, de 11 de Agosto",
      functionDescription: "Supervisão técnica, inspecção e controlo institucional do Serviço Penitenciário."
    }) as OrganizationalUnit;

  const isNational = currentUnit.level === "NATIONAL" || !currentUnit.province || currentUnit.province === "Nacional";
  const depProvince = currentUnit.province || (selectedHierNode.parentId !== "NACIONAL" ? selectedHierNode.parentId : null);

  // Determine supervised prisons
  const supervisedPrisons = isNational
    ? prisons
    : prisons.filter(p => p.province === depProvince || p.location?.toLowerCase().includes((depProvince || "").toLowerCase()));

  const totalInmatesUnderScope = inmates.filter(i => 
    supervisedPrisons.some(p => p.id === (i.assignedPrisonId || i.prisonId))
  ).length;

  // National / Provincial Mirror Resolution
  const mirrorNationalUnit = !isNational 
    ? (currentUnit.mirrorNationalUnitId 
        ? organizationalUnits.find(u => u.id === currentUnit.mirrorNationalUnitId)
        : CENTRAL_NATIONAL_UNITS.find(u => u.mirrorProvincialTemplateCode === currentUnit.mirrorProvincialTemplateCode || u.code?.includes(currentUnit.code?.split("-")[0] || "")))
    : null;

  // Subordinate provincial departments if this is a National Directorate
  const mirrorProvincialSubUnits = isNational 
    ? organizationalUnits.filter(u => 
        u.level !== "NATIONAL" && 
        (u.mirrorNationalUnitId === currentUnit.id || 
         (currentUnit.mirrorProvincialTemplateCode && u.code?.startsWith(currentUnit.mirrorProvincialTemplateCode)) ||
         (currentUnit.sigla && u.code?.includes(currentUnit.sigla)))
      )
    : [];

  // Documents for this unit or relevant scope
  const unitDocs = documents.filter(d => {
    if (docFilterType !== "ALL" && d.type !== docFilterType) return false;
    if (d.unitId === currentUnit.id || d.unitCode === currentUnit.code || d.unitCode === currentUnit.sigla) return true;
    if (isNational && d.targetScope === "NACIONAL") return true;
    if (!isNational && depProvince && d.targetProvince?.toLowerCase() === depProvince.toLowerCase()) return true;
    return false;
  });

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;

    const docSeq = String(documents.length + 1).padStart(3, "0");
    const sigla = currentUnit.sigla || currentUnit.code || "DEP";
    const docNumber = `${newDocType.replace("_", " ")} nº ${docSeq}/${sigla}/SP/MININT/${new Date().getFullYear()}`;

    const newDoc: DepartmentalDocument = {
      id: `DOC-GEN-${Date.now()}`,
      docNumber,
      title: newDocTitle,
      type: newDocType,
      unitId: currentUnit.id,
      unitName: currentUnit.name,
      unitCode: sigla,
      issuerName: currentOperator.name || "Oficial Superior em Funções",
      issuerRank: currentOperator.role || "Oficial do Serviço Penitenciário",
      date: new Date().toISOString().split("T")[0],
      status: "PUBLICADO",
      securityLevel: newDocSecurity,
      summary: newDocSummary || "Despacho normativo e regulamentar emitido no âmbito do Decreto Presidencial n.º 184/17.",
      bodyContent: newDocBody || newDocSummary,
      targetScope: isNational ? "NACIONAL" : "PROVINCIAL",
      targetProvince: depProvince || undefined
    };

    setDocuments([newDoc, ...documents]);
    onWriteAuditLog(
      "DOCUMENT_CREATED",
      "DepartmentalDocument",
      newDoc.id,
      `Criou documento oficial ${newDoc.docNumber} pelo órgão ${currentUnit.name}`
    );

    setIsCreateDocModalOpen(false);
    setNewDocTitle("");
    setNewDocSummary("");
    setNewDocBody("");
    setSelectedDocPreview(newDoc);
  };

  return (
    <div id="departmental-organic-dashboard" className="flex flex-col gap-5 w-full">
      {/* 1. CABEÇALHO INSTITUCIONAL CANÓNICO */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex justify-between items-center flex-wrap gap-4 shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3.5 bg-purple-950/80 border border-purple-800 rounded-xl text-purple-300 shadow-inner">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-purple-900/70 border border-purple-700 text-purple-200 text-[10px] font-mono font-black px-2 py-0.5 rounded shadow-sm">
                {currentUnit.sigla || currentUnit.code || "DEP"}
              </span>
              <span className="bg-slate-800/90 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded font-bold border border-slate-700">
                {isNational ? "ÓRGÃO CENTRAL / DIREÇÃO GERAL (MININT)" : `DIRECÇÃO PROVINCIAL DO ${(depProvince || "").toUpperCase()}`}
              </span>
              <span className="bg-amber-950/50 border border-amber-800 text-amber-300 text-[9px] font-mono px-2 py-0.5 rounded font-bold">
                {currentUnit.divisionType || "DEPARTAMENTO"}
              </span>
            </div>
            
            <h2 className="text-lg font-black text-slate-100 font-mono uppercase mt-1 tracking-tight">
              {currentUnit.name}
            </h2>

            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Scale className="h-3 w-3 text-amber-400 shrink-0" />
                <span>Enquadramento: <strong>{currentUnit.legalBasis || "Decreto Presidencial n.º 184/17, de 11 de Agosto"}</strong></span>
              </span>
              {currentUnit.headOfficerName && (
                <span className="flex items-center gap-1 text-slate-300">
                  <UserCheck className="h-3 w-3 text-purple-400 shrink-0" />
                  <span>Titular: <strong>{currentUnit.headOfficerName}</strong></span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10 flex-wrap">
          <button
            type="button"
            onClick={() => setIsCreateDocModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold px-3.5 py-2 rounded-lg border border-purple-400 transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Emitir Acto Administrativo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onWriteAuditLog(
                "PRINT_REPORT",
                "Department",
                currentUnit.id,
                `Imprimiu relatório institucional do departamento ${currentUnit.name}`
              );
              window.print();
            }}
            className="bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-mono font-bold px-3 py-2 rounded-lg border border-slate-750 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-amber-400" />
            <span>Imprimir Parecer</span>
          </button>
        </div>
      </div>

      {/* 2. NAVEGAÇÃO DE SUB-SEPARADORES DESTE DEP */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-mono font-bold">
        <button
          type="button"
          onClick={() => setActiveSubTab("OVERVIEW")}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "OVERVIEW" 
              ? "bg-purple-600/30 text-purple-200 border border-purple-500/60 font-black shadow-sm" 
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Visão Geral & Competências</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("MIRROR_TREE")}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "MIRROR_TREE" 
              ? "bg-purple-600/30 text-purple-200 border border-purple-500/60 font-black shadow-sm" 
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Árvore de Correspondência (Dec. 184/17)</span>
          {mirrorProvincialSubUnits.length > 0 && (
            <span className="bg-purple-900 text-purple-200 text-[9px] px-1.5 py-0.2 rounded font-black">
              {mirrorProvincialSubUnits.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("DOCUMENTS")}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "DOCUMENTS" 
              ? "bg-purple-600/30 text-purple-200 border border-purple-500/60 font-black shadow-sm" 
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Desmaterialização Documental</span>
          <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 py-0.2 rounded font-black">
            {unitDocs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("EPS")}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === "EPS" 
              ? "bg-purple-600/30 text-purple-200 border border-purple-500/60 font-black shadow-sm" 
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Cadeias / EPs sob Tutela</span>
          <span className="bg-blue-900 text-blue-200 text-[9px] px-1.5 py-0.2 rounded font-black">
            {supervisedPrisons.length}
          </span>
        </button>
      </div>

      {/* 3. CONTEÚDO DOS SUB-SEPARADORES */}
      {activeSubTab === "OVERVIEW" && (
        <div className="flex flex-col gap-4">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-center">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1 justify-center">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Classificação Orgânica</span>
              <span className="text-xs font-black text-purple-300 truncate">
                {currentUnit.category || currentUnit.divisionType || "Órgão do Serviço Penitenciário"}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1 justify-center">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Nível de Jurisdição</span>
              <span className="text-xs font-black text-slate-200">
                {isNational ? "Nacional / Central" : `Provincial (${depProvince})`}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1 justify-center">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">EPs sob Acompanhamento</span>
              <span className="text-xl font-bold text-blue-400">
                {supervisedPrisons.length} Cadeias
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-1 justify-center">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider text-amber-400">Reclusos na Jurisdição</span>
              <span className="text-xl font-bold text-amber-400">
                {totalInmatesUnderScope} Reclusos
              </span>
            </div>
          </div>

          {/* Missão & Atribuições Regulamentares */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2 font-mono flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-purple-400" />
                <span>Missão & Competência Operativa</span>
              </h3>
              <div className="p-3 bg-[#06080d] border border-slate-850 rounded-lg text-xs font-sans text-slate-300 leading-relaxed">
                <strong className="text-purple-300 font-mono block mb-1">Atribuições Regulamentares (Dec. 184/17):</strong>
                {currentUnit.functionDescription || "Supervisão das directivas regulamentares, inspecção de procedimentos e garantia da conformidade legal e operacional nos estabelecimentos prisionais sob a sua dependência."}
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-2 font-mono flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span>Responsabilidades Administrativas & Legais</span>
              </h3>
              <div className="p-3 bg-[#06080d] border border-slate-850 rounded-lg text-xs font-sans text-slate-300 leading-relaxed">
                <strong className="text-amber-300 font-mono block mb-1">Cadeia de Comando & Conformidade:</strong>
                {currentUnit.administrativeResponsibilities || "Emissão de pareceres, elaboração de despachos de serviço, instrução de processos disciplinares e cumprimento estrito das decisões dos Tribunais e do Ministério do Interior."}
              </div>
            </div>
          </div>

          {/* Resumo Rápido da Correspondência Hierárquica */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
              <Network className="h-4 w-4 text-purple-400" />
              <span>Posição na Cadeia de Comando do Serviço Penitenciário</span>
            </h3>

            <div className="flex items-center gap-2 flex-wrap text-xs font-mono p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="bg-slate-800 text-slate-200 px-2 py-1 rounded font-bold">
                MININT (Ministério do Interior)
              </span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <span className="bg-slate-800 text-slate-200 px-2 py-1 rounded font-bold">
                DG-SP (Direcção Geral)
              </span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
              {isNational ? (
                <span className="bg-purple-950 text-purple-200 border border-purple-700 px-2 py-1 rounded font-black">
                  {currentUnit.name} (Nível Central)
                </span>
              ) : (
                <>
                  <span className="bg-emerald-950 text-emerald-200 border border-emerald-700 px-2 py-1 rounded font-bold">
                    Direcção Provincial do {depProvince}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  <span className="bg-purple-950 text-purple-200 border border-purple-700 px-2 py-1 rounded font-black">
                    {currentUnit.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "MIRROR_TREE" && (
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
              <Network className="h-4 w-4 text-purple-400" />
              <span>Modelo de Espelho Orgânico: Nível Central $\leftrightarrow$ Nível Provincial (Dec. 184/17)</span>
            </h3>
            <p className="text-xs font-sans text-slate-400">
              O Estatuto Orgânico do Serviço Penitenciário estabelece a correspondência funcional direta: cada <strong>Direcção Nacional Central</strong> espelha-se no respetivo <strong>Departamento Provincial</strong> em todas as 21 províncias, que por sua vez se subdivide em <strong>Secções Técnicas</strong> em cada Estabelecimento Penitenciário.
            </p>
          </div>

          {/* Se for Órgão Central, mostra os Departamentos Provinciais homólogos */}
          {isNational && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold text-purple-300 font-mono uppercase">
                  Departamentos Provinciais Homólogos Tutelados ({mirrorProvincialSubUnits.length} Províncias)
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  Subordinação Técnica e Doutrinária
                </span>
              </div>

              {mirrorProvincialSubUnits.length === 0 ? (
                <div className="text-center py-6 text-slate-500 font-mono text-xs">
                  Este órgão superior central atua na coordenação geral de todos os órgãos provinciais.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {mirrorProvincialSubUnits.map(sub => (
                    <div
                      key={sub.id}
                      onClick={() => onSelectNode({ type: "DEPARTMENT", id: sub.id, name: sub.name, parentId: sub.province })}
                      className="p-3 bg-slate-950 border border-slate-800 hover:border-purple-500/60 rounded-xl transition flex flex-col justify-between gap-2 cursor-pointer group shadow-sm"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono font-black text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-800/60">
                          {sub.code || "DEP"}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">
                          Província de {sub.province}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-purple-200 transition font-mono">
                        {sub.name}
                      </span>
                      <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-1 border-t border-slate-900">
                        <span>Ver Departamento Provincial</span>
                        <ExternalLink className="w-3 h-3 text-purple-400 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Se for Órgão Provincial, mostra a sua Direção Nacional Tutelar Central */}
          {!isNational && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
              <h4 className="text-xs font-bold text-purple-300 font-mono uppercase border-b border-slate-800 pb-2">
                Tutela Técnica Nacional Central
              </h4>
              
              {mirrorNationalUnit ? (
                <div 
                  onClick={() => onSelectNode({ type: "DEPARTMENT", id: mirrorNationalUnit.id, name: mirrorNationalUnit.name, parentId: "NACIONAL" })}
                  className="p-4 bg-slate-950 border border-purple-900/50 hover:border-purple-500 rounded-xl transition flex justify-between items-center gap-3 cursor-pointer group shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-950 rounded-lg text-purple-300 border border-purple-800">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-black text-purple-300 bg-purple-950 px-1.5 py-0.5 rounded border border-purple-800">
                          {mirrorNationalUnit.sigla || mirrorNationalUnit.code}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">Órgão Central (Direção Geral / MININT)</span>
                      </div>
                      <h5 className="text-xs font-black text-slate-100 font-mono mt-0.5 group-hover:text-purple-200">
                        {mirrorNationalUnit.name}
                      </h5>
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                        {mirrorNationalUnit.functionDescription?.substring(0, 120)}...
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xxs font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-1 rounded border border-purple-800/80 group-hover:bg-purple-600 group-hover:text-white transition">
                      Aceder à Direção Nacional &gt;
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 rounded-xl text-slate-400 font-mono text-xs">
                  Subordinação direta à Direcção Geral do Serviço Penitenciário (DG-SP).
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeSubTab === "DOCUMENTS" && (
        <div className="flex flex-col gap-4">
          {/* Header da Desmaterialização */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-400" />
                <span>Gestor de Actos Administrativos & Desmaterialização</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Despachos, Ordens de Serviço, Circulares, Pareceres Técnicos e Guias de Marcha com chancela do MININT.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={docFilterType}
                onChange={(e) => setDocFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono px-2.5 py-1.5 rounded-lg"
              >
                <option value="ALL">Todos os Tipos de Acto</option>
                <option value="DESPACHO">Despachos Normativos</option>
                <option value="ORDEM_SERVICO">Ordens de Serviço</option>
                <option value="CIRCULAR">Circulares Informativas</option>
                <option value="PARECER_TECNICO">Pareceres Técnicos</option>
                <option value="GUIA_MARCHA">Guias de Marcha / Escolta</option>
                <option value="RELATORIO_INSPECAO">Relatórios de Inspecção</option>
              </select>

              <button
                type="button"
                onClick={() => setIsCreateDocModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-purple-400 transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Documento</span>
              </button>
            </div>
          </div>

          {/* Grelha de Documentos Oficiais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unitDocs.map(doc => (
              <div
                key={doc.id}
                onClick={() => setSelectedDocPreview(doc)}
                className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-4 rounded-xl transition flex flex-col justify-between gap-3 cursor-pointer group shadow-sm"
              >
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[9px] font-mono font-black text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
                      {doc.docNumber}
                    </span>
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      doc.securityLevel === "CONFIDENCIAL" || doc.securityLevel === "SECRETO"
                        ? "bg-red-950 text-red-300 border border-red-800"
                        : "bg-slate-800 text-slate-300"
                    }`}>
                      {doc.securityLevel}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-purple-200 transition font-mono leading-snug">
                    {doc.title}
                  </h4>

                  <p className="text-[10px] text-slate-400 font-sans line-clamp-2">
                    {doc.summary}
                  </p>
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{doc.date}</span>
                  </span>
                  <span className="flex items-center gap-1 text-purple-400 font-bold group-hover:underline">
                    <Eye className="w-3 h-3" />
                    <span>Visualizar Acto</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === "EPS" && (
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center flex-wrap gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-2">
              <Building className="h-4 w-4 text-amber-500" />
              <span>Estabelecimentos Penitenciários ({isNational ? "Nível Nacional" : `Província de ${depProvince}`})</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {supervisedPrisons.length} EPs Ativos sob Supervisão
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {supervisedPrisons.map((p) => {
              const pInmates = inmates.filter(i => (i.assignedPrisonId || i.prisonId) === p.id).length;
              return (
                <div key={p.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-purple-500/50 transition flex flex-col justify-between gap-3 shadow-md">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-slate-100 font-mono">{p.name}</span>
                      <span className="bg-slate-900 border border-slate-800 text-[9px] text-amber-400 px-2 py-0.5 rounded font-mono font-bold">
                        {pInmates}/{p.capacity || p.operationalCapacity}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                      <span>{p.location || depProvince}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectNode({ type: "PRISON", id: p.id, name: p.name, parentId: depProvince });
                    }}
                    className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-200 text-xs font-mono py-1.5 rounded-lg transition text-center font-bold cursor-pointer"
                  >
                    Inspecionar Cadeia &gt;
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DE PRÉ-VISUALIZAÇÃO DE DOCUMENTO OFICIAL DESMATERIALIZADO */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-750 rounded-2xl max-w-2xl w-full p-6 flex flex-col gap-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho Oficial do Documento */}
            <div className="text-center flex flex-col items-center gap-1 border-b border-slate-800 pb-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                REPÚBLICA DE ANGOLA
              </span>
              <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider font-bold">
                MINISTÉRIO DO INTERIOR
              </span>
              <span className="text-xs font-mono text-amber-400 uppercase font-black tracking-wider">
                SERVIÇO PENITENCIÁRIO
              </span>
              <span className="text-[10px] font-mono text-purple-300 uppercase font-bold mt-1">
                {selectedDocPreview.unitName}
              </span>
              <div className="mt-2 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 text-[10px] font-mono font-black text-slate-200">
                {selectedDocPreview.docNumber}
              </div>
            </div>

            {/* Corpo do Documento */}
            <div className="flex flex-col gap-3 font-mono">
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-850 pb-2">
                <span>Data: <strong>{selectedDocPreview.date}</strong></span>
                <span>Classificação: <strong className="text-amber-400">{selectedDocPreview.securityLevel}</strong></span>
                <span>Emissor: <strong>{selectedDocPreview.issuerName}</strong></span>
              </div>

              <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight mt-1">
                ASSUNTO: {selectedDocPreview.title}
              </h3>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-sans text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedDocPreview.bodyContent || selectedDocPreview.summary}
              </div>
            </div>

            {/* Rodapé e Ações */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onWriteAuditLog(
                    "PRINT_DOCUMENT",
                    "DepartmentalDocument",
                    selectedDocPreview.id,
                    `Imprimiu documento desmaterializado ${selectedDocPreview.docNumber}`
                  );
                  window.print();
                }}
                className="bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-mono font-bold px-4 py-2 rounded-lg border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Imprimir com Chancela Oficial</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedDocPreview(null)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold px-4 py-2 rounded-lg transition cursor-pointer"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CRIAÇÃO DE NOVO DOCUMENTO DESMATERIALIZADO */}
      {isCreateDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleCreateDocument} className="bg-slate-900 border border-slate-750 rounded-2xl max-w-xl w-full p-6 flex flex-col gap-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-black text-slate-100 font-mono uppercase">
                  Emitir Novo Acto Administrativo Oficial
                </h3>
              </div>
              <span className="text-[9px] font-mono text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                {currentUnit.sigla || currentUnit.code}
              </span>
            </div>

            <div className="flex flex-col gap-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Tipo de Acto</label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg"
                  >
                    <option value="DESPACHO">Despacho Normativo</option>
                    <option value="ORDEM_SERVICO">Ordem de Serviço</option>
                    <option value="CIRCULAR">Circular Informativa</option>
                    <option value="PARECER_TECNICO">Parecer Técnico</option>
                    <option value="GUIA_MARCHA">Guia de Marcha / Escolta</option>
                    <option value="RELATORIO_INSPECAO">Relatório de Inspecção</option>
                    <option value="REQUISICAO_LOGISTICA">Requisição Logística</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Classificação de Segurança</label>
                  <select
                    value={newDocSecurity}
                    onChange={(e) => setNewDocSecurity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg"
                  >
                    <option value="PÚBLICO">Público</option>
                    <option value="RESERVADO">Reservado</option>
                    <option value="CONFIDENCIAL">Confidencial</option>
                    <option value="SECRETO">Secreto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Título / Assunto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Instrução de Reforço das Escalas de Guarda Noturna..."
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Sumário Executivo</label>
                <input
                  type="text"
                  placeholder="Resumo do acto administrativo..."
                  value={newDocSummary}
                  onChange={(e) => setNewDocSummary(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-1.5 rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Texto Regulamentar / Disposições</label>
                <textarea
                  rows={4}
                  placeholder="Redija aqui os artigos e determinações do documento..."
                  value={newDocBody}
                  onChange={(e) => setNewDocBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 p-2.5 rounded-lg resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateDocModalOpen(false)}
                className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-slate-200"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold px-4 py-2 rounded-lg border border-purple-400 shadow-md transition cursor-pointer"
              >
                Publicar & Tramitar Acto
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
