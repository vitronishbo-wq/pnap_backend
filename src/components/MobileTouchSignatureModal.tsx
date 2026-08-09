import React, { useRef, useState, useEffect } from "react";
import { ShieldCheck, Eraser, CheckCircle2, RefreshCw, KeyRound } from "lucide-react";
import { MobileBottomDrawer } from "./MobileBottomDrawer";

interface MobileTouchSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  inmateName?: string;
  inmateId?: string;
  onSignComplete: (signatureDataUrl: string, cryptoHash: string) => void;
}

export function MobileTouchSignatureModal({
  isOpen,
  onClose,
  inmateName = "Recluso",
  inmateId = "RNR-000",
  onSignComplete
}: MobileTouchSignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [cryptoHash, setCryptoHash] = useState("");

  useEffect(() => {
    if (isOpen) {
      setHasSignature(false);
      // Generate a mock MININT SHA-256 seal code
      const randHash = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("").toUpperCase();
      setCryptoHash(`MININT-SEAL-${randHash}`);

      // Clear canvas after render
      setTimeout(() => {
        clearCanvas();
      }, 100);
    }
  }, [isOpen]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#020617"; // dark bg
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#f59e0b"; // amber stroke
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
    setHasSignature(false);
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setHasSignature(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      const dataUrl = canvas.toDataURL("image/png");
      onSignComplete(dataUrl, cryptoHash);
      onClose();
    }
  };

  return (
    <MobileBottomDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Assinatura Táctil & Validação Criptográfica"
      subtitle={`Autorização de Custódia para ${inmateName} (${inmateId})`}
      icon={<ShieldCheck className="h-5 w-5 text-amber-400" />}
      maxHeightClass="max-h-[85vh]"
    >
      <div className="flex flex-col gap-3 font-sans text-xs">
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Desenhe a assinatura do Oficial Responsável na caixa abaixo utilizando o ecrã táctil para autenticar a alteração.
        </p>

        {/* Canvas Area */}
        <div className="relative border-2 border-amber-500/40 rounded-xl overflow-hidden bg-slate-950 shadow-inner">
          <canvas
            ref={canvasRef}
            width={340}
            height={160}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-40 touch-none cursor-crosshair block"
          />

          {!hasSignature && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-600 text-xs font-mono">
              [ Assine aqui com o dedo ]
            </div>
          )}

          <button
            type="button"
            onClick={clearCanvas}
            className="absolute top-2 right-2 p-2 bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xxs font-bold flex items-center gap-1 cursor-pointer touch-manipulation min-h-[44px] px-3"
          >
            <Eraser className="h-4 w-4" /> Limpar
          </button>
        </div>

        {/* Crypto Hash Generated */}
        <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between font-mono text-[11px]">
          <div className="flex items-center gap-2 truncate">
            <KeyRound className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-slate-400">Carimbo:</span>
            <strong className="text-amber-400 truncate">{cryptoHash}</strong>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-400 rounded-xl font-bold cursor-pointer touch-manipulation"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!hasSignature}
            onClick={handleConfirm}
            className="min-h-[44px] px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl font-bold flex items-center gap-2 cursor-pointer touch-manipulation shadow-md"
          >
            <CheckCircle2 className="h-4 w-4" /> Confirmar e Selar
          </button>
        </div>
      </div>
    </MobileBottomDrawer>
  );
}
