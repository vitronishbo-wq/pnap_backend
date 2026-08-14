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

  // Form State
  const [firstName, setFirstName] = useState(editingInmate?.firstName || "");
  const [lastName, setLastName] = useState(editingInmate?.lastName || "");
  const [idCard, setIdCard] = useState(editingInmate?.idCard || "");
  const [photo, setPhoto] = useState(editingInmate?.photo || "");
  const [assignedPrisonId, setAssignedPrisonId] = useState(editingInmate?.assignedPrisonId || prisons[0]?.id || "ep-viana");
  const [assignedCellNumber, setAssignedCellNumber] = useState(editingInmate?.assignedCellNumber || "A-01");
  const [riskLevel, setRiskLevel] = useState(editingInmate?.riskLevel || "Médio");
  const [crimeDescription, setCrimeDescription] = useState(editingInmate?.crimeDescription || "Sob investigação / Prisão Preventiva");
  const [officerSignatureName, setOfficerSignatureName] = useState("Capitão M. Banza (Oficial de Guarda)");
  const [explicitConfirmed, setExplicitConfirmed] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

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
      firstName,
      lastName,
      idCard,
      photo,
      assignedPrisonId,
      assignedCellNumber,
      riskLevel,
      crimeDescription,
      documentCode: editingInmate?.documentCode || `MININT-SEAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: "ACTIVE",
      updatedAt: new Date().toISOString()
    };

    onSaveInmate(inmatePayload);
    onClose();
  };

  const isStep1Valid = firstName.trim().length > 0 && lastName.trim().length > 0 && idCard.trim().length >= 8;
  const isStep2Valid = Boolean(assignedPrisonId);
  const isStep3Valid = Boolean(riskLevel);

  return (
    <MobileBottomDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={editingInmate ? "Editar & Assinar Ficha do Recluso" : "Novo Registo de Recluso (Em Etapas)"}
      subtitle="Validação em 4 passos com carimbo criptográfico do MININT"
      icon={<UserCheck className="h-5 w-5" />}
      maxHeightClass="max-h-[92vh]"
    >
      <div className="flex flex-col gap-4 font-sans text-xs">
        {/* Step Indicator Bar */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-900 p-2 rounded-xl border border-slate-800">
          {[
            { num: 1, label: "Pessoais" },
            { num: 2, label: "Cela" },
            { num: 3, label: "Risco" },
            { num: 4, label: "Assinar" }
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => {
                if (s.num < step || (s.num === 2 && isStep1Valid) || (s.num === 3 && isStep2Valid)) {
                  setStep(s.num as any);
                }
              }}
              className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-center cursor-pointer transition ${
                step === s.num
                  ? "bg-amber-500 text-slate-950 font-bold"
                  : step > s.num
                  ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                  : "bg-slate-950 text-slate-500"
              }`}
            >
              <span className="text-[10px] uppercase font-mono font-bold">Passo {s.num}</span>
              <span className="text-[11px] truncate">{s.label}</span>
            </div>
          ))}
        </div>

        {/* STEP 1: DADOS PESSOAIS & FOTO */}
        {step === 1 && (
          <div className="flex flex-col gap-3.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <UserCheck className="h-4 w-4" /> Passo 1: Identificação Civil & Biometria
            </h4>

            {/* Mugshot Upload & Live Camera Capture */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <div className="w-16 h-20 border border-slate-700 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center relative shrink-0">
                {photo ? (
                  <img src={photo} alt="Foto" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Camera className="h-6 w-6 text-slate-600" />
                )}
                {photo && (
                  <button
                    type="button"
                    onClick={() => setPhoto("")}
                    className="absolute top-0.5 right-0.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded p-0.5 text-[8px] cursor-pointer"
                    title="Remover fotografia"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
              <div className="flex-1 min-w-0 w-full">
                <label className="text-xs font-bold text-slate-200 block mb-1">Fotografia do Recluso</label>
                <p className="text-[10px] text-slate-400 mb-2">Carregue ou capture a fotografia oficial para a ficha de custódia.</p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold cursor-pointer touch-manipulation min-h-[44px] shadow-sm transition"
                  >
                    <Camera className="h-4 w-4 stroke-[2.5]" /> Capturar com Câmara
                  </button>
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold cursor-pointer touch-manipulation min-h-[44px] border border-slate-700 transition">
                    <UploadCloud className="h-4 w-4 text-amber-400" /> Carregar Ficheiro
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                  {photo && (
                    <button
                      type="button"
                      onClick={() => setPhoto("")}
                      className="inline-flex items-center gap-1 px-2.5 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-lg text-xs font-mono font-bold cursor-pointer touch-manipulation min-h-[44px] transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Limpar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">Primeiro Nome *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ex: Manuel"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-2.5 text-slate-100 text-xs font-sans min-h-[44px]"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">Apelido / Sobrenome *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ex: António dos Santos"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-2.5 text-slate-100 text-xs font-sans min-h-[44px]"
              />
            </div>

            {/* BI Number */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">Nº B.I. / Passaporte *</label>
              <input
                type="text"
                value={idCard}
                onChange={(e) => setIdCard(e.target.value.toUpperCase())}
                placeholder="Ex: 004839201LA042"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-2.5 text-amber-400 font-mono text-xs min-h-[44px]"
              />
            </div>
          </div>
        )}

        {/* STEP 2: ALOCAÇÃO PRISIONAL & CELA */}
        {step === 2 && (
          <div className="flex flex-col gap-3.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Passo 2: Alocação Prisional & Localização Interna
            </h4>

            {/* Select Prison */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">Estabelecimento Penitenciário (EP) *</label>
              <select
                value={assignedPrisonId}
                onChange={(e) => setAssignedPrisonId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-2.5 text-slate-100 text-xs min-h-[44px] cursor-pointer"
              >
                {prisons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cell Number */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">Número de Bloco / Cela *</label>
              <input
                type="text"
                value={assignedCellNumber}
                onChange={(e) => setAssignedCellNumber(e.target.value.toUpperCase())}
                placeholder="Ex: Bloco B - Cela 12"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-2.5 text-sky-400 font-mono text-xs min-h-[44px]"
              />
            </div>

            {/* Crime Description */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">Observações de Custódia / Crime</label>
              <textarea
                value={crimeDescription}
                onChange={(e) => setCrimeDescription(e.target.value)}
                rows={3}
                placeholder="Ex: Prisão preventiva sob mandado do Tribunal Comarca de Luanda..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-lg p-2.5 text-slate-200 text-xs"
              />
            </div>
          </div>
        )}

        {/* STEP 3: CLASSIFICAÇÃO DE RISCO */}
        {step === 3 && (
          <div className="flex flex-col gap-3.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" /> Passo 3: Avaliação de Perigosidade & Grau de Risco
            </h4>

            <div>
              <label className="block text-slate-300 font-bold mb-2">Classificação de Risco Operacional</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { level: "Baixo", color: "border-emerald-500/40 text-emerald-400 bg-emerald-950/20" },
                  { level: "Médio", color: "border-amber-500/40 text-amber-400 bg-amber-950/20" },
                  { level: "Alto", color: "border-orange-500/40 text-orange-400 bg-orange-950/20" },
                  { level: "Máximo", color: "border-red-500/40 text-red-400 bg-red-950/20" }
                ].map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setRiskLevel(item.level)}
                    className={`min-h-[44px] p-2.5 rounded-xl border font-bold text-xs flex items-center justify-between transition cursor-pointer touch-manipulation ${
                      riskLevel === item.level
                        ? `${item.color} ring-2 ring-amber-500 shadow-md`
                        : "border-slate-800 text-slate-400 bg-slate-950"
                    }`}
                  >
                    <span>Risco {item.level}</span>
                    {riskLevel === item.level && <CheckCircle2 className="h-4 w-4 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-mono">
              <strong className="text-amber-400 block mb-1">📋 Protocolo de Segurança MININT:</strong>
              Reclusos com Risco <span className="text-red-400 font-bold">Alto</span> ou <span className="text-red-400 font-bold">Máximo</span> requerem acompanhamento especial de escolta e selo criptográfico reforçado nas fichas de transporte.
            </div>
          </div>
        )}

        {/* STEP 4: ASSINATURA & CONFIRMAÇÃO EXPLÍCITA */}
        {step === 4 && (
          <div className="flex flex-col gap-3.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2">
              <FileCheck className="h-4 w-4" /> Passo 4: Assinatura do Oficial & Validação Criptográfica
            </h4>

            {/* Summary Review */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Recluso:</span>
                <strong className="text-slate-100">{firstName} {lastName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">B.I.:</span>
                <strong className="text-amber-400">{idCard}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unidade:</span>
                <strong className="text-sky-400">
                  {prisons.find((p) => p.id === assignedPrisonId)?.name.replace("Estabelecimento Penitenciário de ", "EP ") || assignedPrisonId}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Risco:</span>
                <strong className="text-amber-400">{riskLevel}</strong>
              </div>
            </div>

            {/* Officer Name */}
            <div>
              <label className="block text-slate-300 font-bold mb-1">Oficial Autorizador / Guarda</label>
              <input
                type="text"
                value={officerSignatureName}
                onChange={(e) => setOfficerSignatureName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs font-mono min-h-[44px]"
              />
            </div>

            {/* Explicit Touch Confirmation Checkbox */}
            <label className="flex items-start gap-3 bg-red-950/20 border border-red-500/30 p-3 rounded-xl cursor-pointer touch-manipulation">
              <input
                type="checkbox"
                checked={explicitConfirmed}
                onChange={(e) => setExplicitConfirmed(e.target.checked)}
                className="h-5 w-5 mt-0.5 rounded border-slate-700 bg-slate-950 text-amber-500 accent-amber-500 cursor-pointer shrink-0"
              />
              <span className="text-[11px] text-red-200 leading-snug">
                <strong className="text-white block font-bold mb-0.5">Confirmação Explícita Mandatória:</strong>
                Declaro sob fé de ofício a veracidade dos dados biográficos do recluso e autorizo o registo no Sistema Penitenciário MININT.
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
              className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 rounded-xl font-bold flex items-center gap-2 cursor-pointer touch-manipulation"
            >
              <ArrowLeft className="h-4 w-4" /> Anterior
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-400 rounded-xl font-bold cursor-pointer touch-manipulation"
            >
              Cancelar
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              disabled={step === 1 ? !isStep1Valid : step === 2 ? !isStep2Valid : false}
              onClick={() => setStep((step + 1) as any)}
              className="min-h-[44px] px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl font-bold flex items-center gap-2 cursor-pointer touch-manipulation shadow-md shadow-amber-500/20"
            >
              Próximo <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!explicitConfirmed}
              onClick={handleComplete}
              className="min-h-[44px] px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl font-bold flex items-center gap-2 cursor-pointer touch-manipulation shadow-md shadow-emerald-500/20"
            >
              <CheckCircle2 className="h-4 w-4" /> Efetivar e Assinar
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
