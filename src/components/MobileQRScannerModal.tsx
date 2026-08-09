import React, { useState, useEffect } from "react";
import { QrCode, Camera, ShieldCheck, Flashlight, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { MobileBottomDrawer } from "./MobileBottomDrawer";

interface MobileQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inmates: any[];
  onScanResult: (inmate: any) => void;
}

export function MobileQRScannerModal({
  isOpen,
  onClose,
  inmates,
  onScanResult
}: MobileQRScannerModalProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scanStatus, setScanStatus] = useState<"scanning" | "success" | "error">("scanning");
  const [scannedInmate, setScannedInmate] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setScanStatus("scanning");
      setScannedInmate(null);
      setManualCode("");
    }
  }, [isOpen]);

  const handleSimulateScan = () => {
    // Pick a random inmate from list or manual code match
    if (inmates.length === 0) return;
    setIsScanning(false);
    const matched = manualCode
      ? inmates.find(
          (i) =>
            i.documentCode?.toLowerCase().includes(manualCode.toLowerCase()) ||
            i.id?.toLowerCase() === manualCode.toLowerCase() ||
            i.idCard?.toLowerCase().includes(manualCode.toLowerCase())
        )
      : inmates[Math.floor(Math.random() * inmates.length)];

    if (matched) {
      setScannedInmate(matched);
      setScanStatus("success");
    } else {
      setScanStatus("error");
    }
  };

  const handleConfirmResult = () => {
    if (scannedInmate) {
      onScanResult(scannedInmate);
      onClose();
    }
  };

  return (
    <MobileBottomDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Leitor de Selo QR & Código Criptográfico"
      subtitle="Validação em tempo real de guiamentos de marcha e fichas"
      icon={<QrCode className="h-5 w-5 text-amber-400" />}
      maxHeightClass="max-h-[90vh]"
    >
      <div className="flex flex-col gap-4 font-sans text-xs">
        {scanStatus === "scanning" && (
          <div className="flex flex-col items-center gap-3">
            {/* Viewfinder Camera Area */}
            <div className="relative w-full h-56 bg-slate-950 border-2 border-amber-500/50 rounded-2xl overflow-hidden flex flex-col items-center justify-center shadow-inner">
              {/* Laser Scan Animation Line */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse top-1/2 -translate-y-1/2 shadow-lg shadow-amber-500/50" />

              {/* Viewfinder Reticle Corners */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-400" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-400" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-400" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-400" />

              <Camera className="h-10 w-10 text-slate-700 animate-bounce" />
              <span className="text-[11px] text-amber-400 font-mono font-bold mt-2">
                Aproxima o código QR do Selo MININT
              </span>

              {/* Flashlight toggle */}
              <button
                type="button"
                onClick={() => setFlashlightOn(!flashlightOn)}
                className={`absolute top-3 right-3 p-2 rounded-xl border min-h-[44px] min-w-[44px] flex items-center justify-center transition cursor-pointer touch-manipulation ${
                  flashlightOn ? "bg-amber-500 text-slate-950 border-amber-400 font-bold" : "bg-slate-900/80 border-slate-700 text-slate-300"
                }`}
              >
                <Flashlight className="h-5 w-5" />
              </button>
            </div>

            {/* Simulated Scan Trigger Button */}
            <button
              type="button"
              onClick={handleSimulateScan}
              className="w-full min-h-[48px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 text-sm cursor-pointer touch-manipulation shadow-lg shadow-amber-500/20"
            >
              <QrCode className="h-5 w-5" /> Digitalizar Selo QR
            </button>

            {/* Fallback Manual Code Entry */}
            <div className="w-full pt-2 border-t border-slate-800">
              <label className="block text-slate-400 font-mono text-[11px] mb-1">Entrada Manual por Código ou Nº B.I.:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ex: MININT-SEAL-89A2 ou 004839201"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono text-xs focus:outline-none focus:border-amber-500 min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={handleSimulateScan}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold min-h-[44px] cursor-pointer touch-manipulation"
                >
                  Procurar
                </button>
              </div>
            </div>
          </div>
        )}

        {scanStatus === "success" && scannedInmate && (
          <div className="flex flex-col gap-3 bg-emerald-950/20 border border-emerald-500/40 p-3.5 rounded-2xl">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>Selo Criptográfico Válido & Autêntico!</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
              <div className="w-12 h-14 bg-slate-900 rounded-lg overflow-hidden shrink-0 border border-slate-800">
                {scannedInmate.photo ? (
                  <img src={scannedInmate.photo} alt="Mugshot" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold">RNR</div>
                )}
              </div>
              <div className="flex-1 min-w-0 font-sans">
                <h4 className="font-bold text-slate-100 text-sm truncate">
                  {scannedInmate.firstName} {scannedInmate.lastName}
                </h4>
                <p className="text-xs text-amber-400 font-mono font-bold mt-0.5">#{scannedInmate.id}</p>
                <p className="text-[11px] text-slate-400 font-mono">BI: {scannedInmate.idCard}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => setScanStatus("scanning")}
                className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer touch-manipulation"
              >
                <RefreshCw className="h-4 w-4" /> Novo Scan
              </button>
              <button
                type="button"
                onClick={handleConfirmResult}
                className="min-h-[44px] px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-bold flex items-center gap-2 cursor-pointer touch-manipulation shadow-md"
              >
                Abrir Ficha Completa
              </button>
            </div>
          </div>
        )}

        {scanStatus === "error" && (
          <div className="flex flex-col gap-3 bg-red-950/20 border border-red-500/40 p-3.5 rounded-2xl text-center">
            <AlertTriangle className="h-8 w-8 text-red-400 mx-auto animate-pulse" />
            <h4 className="font-bold text-red-300 text-sm">Selo não Encontrado ou Inválido</h4>
            <p className="text-xs text-slate-400">
              Não foi possível validar a chave criptográfica introduzida no banco de dados ativo do MININT.
            </p>
            <button
              type="button"
              onClick={() => setScanStatus("scanning")}
              className="min-h-[44px] w-full mt-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
            >
              <RefreshCw className="h-4 w-4" /> Tentar Novamente
            </button>
          </div>
        )}
      </div>
    </MobileBottomDrawer>
  );
}
