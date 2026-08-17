import React, { useState } from "react";
import { 
  UserCheck, 
  Building2, 
  ShieldAlert, 
  FileCheck, 
  Camera, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Sparkles,
  UploadCloud,
  Trash2,
  Video
} from "lucide-react";
import { MobileBottomDrawer } from "./MobileBottomDrawer";
import { CameraCaptureModal } from "./CameraCaptureModal";

interface Prison {
  id: string;
  name: string;
}

interface MobileMultiStepInmateModalProps {
  isOpen: boolean;
  onClose: () => void;
  prisons: Prison[];
  onSaveInmate: (inmateData: any) => void;
  editingInmate?: any;
}

export function MobileMultiStepInmateModal({
  isOpen,
  onClose,
  prisons,
  onSaveInmate,
  editingInmate
}: MobileMultiStepInmateModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Phase 1: Mandado & Identificação Civil
  const [warrantNumber, setWarrantNumber] = useState(editingInmate?.warrantNumber || `MND-${Math.floor(1000 + Math.random() * 9000)}/2026`);
  const [issuingCourt, setIssuingCourt] = useState(editingInmate?.court || "Tribunal da Comarca de Luanda - Sala de Crimes Comuns");
  const [firstName, setFirstName] = useState(editingInmate?.firstName || "");
  const [lastName, setLastName] = useState(editingInmate?.lastName || "");
  const [idCard, setIdCard] = useState(editingInmate?.idCard || "");
  const [gender, setGender] = useState(editingInmate?.gender || "M");
  const [birthDate, setBirthDate] = useState(editingInmate?.birthDate || "1994-05-12");

  // Phase 2: Biometria & Fotografia
  const [photo, setPhoto] = useState(editingInmate?.photo || "");
  const [biometricNotes, setBiometricNotes] = useState(editingInmate?.biometricNotes || "Sem marcas ou tatuagens atípicas declaradas");
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // Phase 3: Classificação, Regime & Risco
  const [regime, setRegime] = useState(editingInmate?.regime || "Fechado");
  const [riskLevel, setRiskLevel] = useState(editingInmate?.riskLevel || "Médio");
  const [crimeDescription, setCrimeDescription] = useState(editingInmate?.crimeDescription || "Prisão Preventiva / Roubo Qualificado");
  const [specialEscort, setSpecialEscort] = useState(editingInmate?.specialEscort || false);

  // Phase 4: Alocação, Cela, Validação & Assinatura
  const [assignedPrisonId, setAssignedPrisonId] = useState(editingInmate?.assignedPrisonId || prisons[0]?.id || "ep-viana");
  const [pavilionName, setPavilionName] = useState(editingInmate?.pavilionName || "Pavilhão A");
  const [assignedCellNumber, setAssignedCellNumber] = useState(editingInmate?.assignedCellNumber || "Cela 04");
  const [officerSignatureName, setOfficerSignatureName] = useState("Capitão M. Banza (Oficial de Admissão & Custódia)");
  const [explicitConfirmed, setExplicitConfirmed] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleComplete = () => {
    if (!explicitConfirmed) return;

    const inmatePayload = {
      id: editingInmate?.id || `RNR-${Math.floor(100000 + Math.random() * 900000)}`,
      warrantNumber,
      court: issuingCourt,
      firstName,
      lastName,
      idCard,
      gender,
      birthDate,
      photo,
      biometricNotes,
      regime,
      riskLevel,
      crimeDescription,
      specialEscort,
      assignedPrisonId,
      pavilionName,
      assignedCellNumber,
      officerSignatureName,
      documentCode: editingInmate?.documentCode || `MININT-SEAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: "ACTIVE",
      updatedAt: new Date().toISOString()
    };

    onSaveInmate(inmatePayload);
    onClose();
  };

  const isStep1Valid = firstName.trim().length > 0 && lastName.trim().length > 0 && idCard.trim().length >= 8 && warrantNumber.trim().length > 0;
  const isStep2Valid = true; // Photo is optional or can use placeholder
  const isStep3Valid = Boolean(regime && riskLevel);
  const isStep4Valid = Boolean(assignedPrisonId && assignedCellNumber && explicitConfirmed);

  return (
    <MobileBottomDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={editingInmate ? "Editar Ficha de Ingresso" : "Wizard de Ingresso • 4 Fases Canónicas"}
      subtitle="Fluxo oficial e exclusivo de registo e admissão no sistema prisional"
      icon={<UserCheck className="h-5 w-5 text-emerald-400" />}
      maxHeightClass="max-h-[94vh]"
    >
      <div className="flex flex-col gap-3 font-sans text-xs">
        
        {/* Step Indicator Bar */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-900 p-2 rounded-xl border border-slate-800">
          {[
            { num: 1, label: "1. Mandado" },
            { num: 2, label: "2. Biometria" },
            { num: 3, label: "3. Regime/Risco" },
            { num: 4, label: "4. Cela/Assinatura" }
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => {
                if (s.num < step || (s.num === 2 && isStep1Valid) || (s.num === 3 && isStep1Valid) || (s.num === 4 && isStep1Valid && isStep3Valid)) {
                  setStep(s.num as any);
                }
              }}
              className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-center cursor-pointer transition ${
                step === s.num
                  ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                  : step > s.num
                  ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                  : "bg-slate-950 text-slate-500"
              }`}
            >
              <span className="text-[9px] uppercase font-mono font-bold">Fase {s.num}</span>
              <span className="text-[10px] truncate leading-tight">{s.label.split(". ")[1]}</span>
            </div>
          ))}
        </div>

        {/* FASE 1: MANDADO & IDENTIFICAÇÃO CIVIL */}
        {step === 1 && (
          <div className="flex flex-col gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-2 uppercase tracking-wide font-mono">
                <FileCheck className="h-4 w-4" /> Fase 1: Mandado Judicial & Identificação Civil
              </h4>
              <span className="text-[9px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Obrigatório
              </span>
            </div>

            {/* Mandado Judicial & Tribunal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-bold mb-1 text-[11px]">Nº Mandado de Condução / Processo *</label>
                <input
                  type="text"
                  value={warrantNumber}
                  onChange={(e) => setWarrantNumber(e.target.value)}
                  placeholder="Ex: MND-8492/2026"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-slate-100 font-mono text-xs min-h-[40px]"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1 text-[11px]">Tribunal / Juízo Emissor</label>
                <input
                  type="text"
                  value={issuingCourt}
                  onChange={(e) => setIssuingCourt(e.target.value)}
                  placeholder="Ex: Comarca de Luanda"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-slate-100 text-xs min-h-[40px]"
                />
              </div>
            </div>

            {/* Nome e Apelido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-bold mb-1 text-[11px]">Primeiro Nome *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ex: Manuel"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-slate-100 text-xs min-h-[40px]"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1 text-[11px]">Apelido / Sobrenome *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Ex: António dos Santos"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-slate-100 text-xs min-h-[40px]"
                />
              </div>
            </div>

            {/* B.I. & Data de Nascimento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-bold mb-1 text-[11px]">Nº B.I. / Passaporte *</label>
                <input
                  type="text"
                  value={idCard}
                  onChange={(e) => setIdCard(e.target.value.toUpperCase())}
                  placeholder="Ex: 004839201LA042"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-amber-400 font-mono text-xs min-h-[40px]"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1 text-[11px]">Género</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-slate-100 text-xs min-h-[40px] cursor-pointer"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* FASE 2: BIOMETRIA & FOTOGRAFIA */}
        {step === 2 && (
          <div className="flex flex-col gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-2 uppercase tracking-wide font-mono">
                <Camera className="h-4 w-4" /> Fase 2: Registo Biométrico & Fotografia Frontal
              </h4>
            </div>

            {/* Mugshot Upload & Live Camera */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="w-20 h-24 border-2 border-dashed border-slate-700 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center relative shrink-0">
                {photo ? (
                  <img src={photo} alt="Foto" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Camera className="h-8 w-8 text-slate-600" />
                )}
                {photo && (
                  <button
                    type="button"
                    onClick={() => setPhoto("")}
                    className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-500 text-white rounded p-0.5 text-[8px] cursor-pointer"
                    title="Remover fotografia"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="flex-1 min-w-0 w-full space-y-2">
                <div>
                  <label className="text-xs font-bold text-slate-200 block">Mugshot Oficial de Custódia</label>
                  <p className="text-[10px] text-slate-400">Captura frontal para comparação biométrica e prontuário penal.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold cursor-pointer touch-manipulation min-h-[40px] shadow-sm transition"
                  >
                    <Camera className="h-4 w-4 stroke-[2.5]" /> Capturar com Câmara
                  </button>
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer touch-manipulation min-h-[40px] border border-slate-700 transition">
                    <UploadCloud className="h-4 w-4 text-emerald-400" /> Carregar Ficheiro
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
              </div>
            </div>

            {/* Sinais Particulares / Cicatrizes */}
            <div>
              <label className="block text-slate-300 font-bold mb-1 text-[11px]">Sinais Particulares / Tatuagens / Cicatrizes</label>
              <textarea
                value={biometricNotes}
                onChange={(e) => setBiometricNotes(e.target.value)}
                rows={2}
                placeholder="Ex: Tatuagem no antebraço direito, cicatriz linear no sobrolho esquerdo..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-slate-200 text-xs font-mono"
              />
            </div>
          </div>
        )}

        {/* FASE 3: CLASSIFICAÇÃO, REGIME & RISCO */}
        {step === 3 && (
          <div className="flex flex-col gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-2 uppercase tracking-wide font-mono">
                <ShieldAlert className="h-4 w-4" /> Fase 3: Regime Penitenciário & Classificação de Risco
              </h4>
            </div>

            {/* Regime */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 text-[11px]">Regime de Execução de Pena</label>
              <div className="grid grid-cols-3 gap-1.5 font-mono text-[11px]">
                {["Fechado", "Semiaberto", "Aberto"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRegime(r)}
                    className={`py-2 rounded-lg font-bold border transition cursor-pointer ${
                      regime === r
                        ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Grau de Risco */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5 text-[11px]">Grau de Risco Operacional</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { level: "Baixo", color: "border-emerald-500/40 text-emerald-400 bg-emerald-950/20" },
                  { level: "Médio", color: "border-blue-500/40 text-blue-400 bg-blue-950/20" },
                  { level: "Alto", color: "border-amber-500/40 text-amber-400 bg-amber-950/20" },
                  { level: "Máximo", color: "border-red-500/40 text-red-400 bg-red-950/20" }
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setRiskLevel(item.level)}
                    className={`p-2 rounded-lg border font-bold text-xs flex items-center justify-between transition cursor-pointer ${
                      riskLevel === item.level
                        ? `${item.color} ring-2 ring-emerald-500 shadow-md`
                        : "border-slate-800 text-slate-400 bg-slate-950"
                    }`}
                  >
                    <span>Risco {item.level}</span>
                    {riskLevel === item.level && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipologia Criminal */}
            <div>
              <label className="block text-slate-300 font-bold mb-1 text-[11px]">Tipologia Criminal / Enquadramento Jurídico</label>
              <input
                type="text"
                value={crimeDescription}
                onChange={(e) => setCrimeDescription(e.target.value)}
                placeholder="Ex: Homicídio Qualificado, Furto Agravado..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-slate-200 text-xs font-mono min-h-[40px]"
              />
            </div>
          </div>
        )}

        {/* FASE 4: ALOCAÇÃO, CELA, VALIDAÇÃO & ASSINATURA */}
        {step === 4 && (
          <div className="flex flex-col gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-emerald-400 text-xs flex items-center gap-2 uppercase tracking-wide font-mono">
                <Building2 className="h-4 w-4" /> Fase 4: Alocação de Cela & Assinatura de Ingresso
              </h4>
            </div>

            {/* Select Prison & Cell */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 font-bold mb-1 text-[11px]">Estabelecimento Penitenciário (EP) *</label>
                <select
                  value={assignedPrisonId}
                  onChange={(e) => setAssignedPrisonId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-slate-100 text-xs min-h-[40px] cursor-pointer"
                >
                  {prisons.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1 text-[11px]">Pavilhão & Cela Atribuída *</label>
                <input
                  type="text"
                  value={assignedCellNumber}
                  onChange={(e) => setAssignedCellNumber(e.target.value.toUpperCase())}
                  placeholder="Ex: Pavilhão B - Cela 08"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg p-2 text-emerald-400 font-mono text-xs min-h-[40px]"
                />
              </div>
            </div>

            {/* Resumo Consolidado */}
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Recluso:</span>
                <strong className="text-slate-200">{firstName} {lastName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">B.I. / Mandado:</span>
                <strong className="text-amber-400">{idCard} • {warrantNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Regime / Risco:</span>
                <strong className="text-emerald-400">{regime} • Risco {riskLevel}</strong>
              </div>
            </div>

            {/* Officer Signature */}
            <div>
              <label className="block text-slate-300 font-bold mb-1 text-[11px]">Oficial de Admissão Responsável</label>
              <input
                type="text"
                value={officerSignatureName}
                onChange={(e) => setOfficerSignatureName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 text-xs font-mono min-h-[40px]"
              />
            </div>

            {/* Explicit Touch Confirmation */}
            <label className="flex items-start gap-2.5 bg-emerald-950/20 border border-emerald-500/30 p-2.5 rounded-lg cursor-pointer touch-manipulation">
              <input
                type="checkbox"
                checked={explicitConfirmed}
                onChange={(e) => setExplicitConfirmed(e.target.checked)}
                className="h-4.5 w-4.5 mt-0.5 rounded border-slate-700 bg-slate-950 text-emerald-500 accent-emerald-500 cursor-pointer shrink-0"
              />
              <span className="text-[10.5px] text-emerald-200 leading-tight">
                <strong className="text-white block font-bold mb-0.5">Certificação Oficial Mandatória:</strong>
                Declaro a veracidade dos dados biográficos e do mandado para efetivação no Registo Nacional de Reclusos (PNAP/MININT).
              </span>
            </label>
          </div>
        )}

        {/* Navigation Buttons Row */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="min-h-[40px] px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 rounded-xl font-bold flex items-center gap-2 cursor-pointer touch-manipulation"
            >
              <ArrowLeft className="h-4 w-4" /> Anterior
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-400 rounded-xl font-bold cursor-pointer touch-manipulation"
            >
              Cancelar
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              disabled={step === 1 ? !isStep1Valid : step === 3 ? !isStep3Valid : false}
              onClick={() => setStep((step + 1) as any)}
              className="min-h-[40px] px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl font-bold flex items-center gap-2 cursor-pointer touch-manipulation shadow-md shadow-emerald-500/20"
            >
              Próximo <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!explicitConfirmed}
              onClick={handleComplete}
              className="min-h-[40px] px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl font-black flex items-center gap-2 cursor-pointer touch-manipulation shadow-md shadow-emerald-500/30"
            >
              <CheckCircle2 className="h-4 w-4" /> Efetivar Ingresso
            </button>
          )}
        </div>
      </div>

      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(capturedData) => setPhoto(capturedData)}
        title="Fotografia Oficial do Recluso"
        subtitle="Registo de face frontal com iluminação adequada para a ficha penitenciária"
      />
    </MobileBottomDrawer>
  );
}
