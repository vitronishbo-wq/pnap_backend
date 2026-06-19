import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { ShieldCheck, Cpu, KeyRound, Copy, Check } from "lucide-react";

interface QRCodeImgProps {
  text: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
  title?: string;
  metadata?: Record<string, any>;
}

export const QRCodeImg: React.FC<QRCodeImgProps> = ({
  text,
  size = 120,
  className = "",
  darkColor = "#0f172a", // slate-900 / navy
  lightColor = "#ffffff",
  title = "Selo Digital QR",
  metadata
}) => {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    QRCode.toDataURL(
      text,
      {
        width: size,
        margin: 1,
        color: {
          dark: darkColor,
          light: lightColor
        },
        errorCorrectionLevel: "M"
      },
      (err, url) => {
        if (active) {
          if (err) {
            console.error("Erro ao gerar QR Code", err);
          } else {
            setQrUrl(url);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      active = false;
    };
  }, [text, size, darkColor, lightColor]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar texto do QR Code", err);
    }
  };

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className={`relative cursor-pointer group bg-white rounded p-1 border border-slate-800/30 hover:border-amber-500/50 shadow-sm transition duration-300 flex flex-col items-center justify-center ${className}`}
        title="Clique para validar autenticidade e ler metadados do QR Code"
      >
        {loading ? (
          <div 
            style={{ width: size, height: size }} 
            className="flex items-center justify-center bg-slate-950/5 animate-pulse rounded"
          >
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <img 
            src={qrUrl} 
            alt="QR Code Autenticado" 
            style={{ width: size, height: size }}
            className="object-contain"
            referrerPolicy="no-referrer"
          />
        )}
        
        {/* Hover overlay badge */}
        <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition duration-250 flex flex-col items-center justify-center text-center p-1 rounded">
          <ShieldCheck className="h-5 w-5 text-amber-500 animate-bounce mb-1" />
          <span className="text-[8px] font-mono font-bold text-amber-400 tracking-wider">VALIDAR SELO</span>
          <span className="text-[7px] font-sans text-slate-300">Biometria Certificada</span>
        </div>
      </div>

      {/* Verification Modal (Simulating government validation app scan) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-950 border border-slate-800 rounded-xl max-w-md w-full p-5 flex flex-col gap-4 text-slate-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-amber-500" />
                <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-100">
                  Descodificador de Selo Digital PNAP-AO
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-500 hover:text-slate-300 transition font-mono text-xs cursor-pointer font-bold px-1.5 py-0.5 border border-slate-900 rounded bg-slate-950"
              >
                FECHAR
              </button>
            </div>

            <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded border border-slate-900 gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">Conteúdo Descodificado (Raw String):</p>
                <p className="text-xxs font-mono text-amber-400 select-all line-clamp-2 break-all mt-1 font-semibold leading-relaxed bg-slate-950 p-1.5 rounded border border-slate-950">
                  {text}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 border border-slate-800 hover:border-amber-500 bg-slate-950 hover:bg-slate-900 rounded cursor-pointer transition text-slate-400 hover:text-slate-200"
                title="Copiar texto do QR Code"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            {metadata && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tight flex items-center gap-1.5">
                  <Cpu className="h-3 w-3 text-sky-400" /> Metadados Estruturados da Entidade
                </span>
                
                <div className="grid grid-cols-2 gap-2 bg-slate-900/40 p-3 rounded-lg border border-slate-900 text-[10px] font-mono leading-relaxed">
                  {Object.entries(metadata).map(([key, val]) => (
                    <div key={key} className="flex flex-col border-b border-slate-900/40 pb-1.5">
                      <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="text-slate-200 font-bold max-w-full truncate">{String(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-amber-950/20 border border-amber-900/30 p-2.5 rounded text-xxs leading-relaxed font-sans text-amber-400/90 flex gap-2.5 items-start">
              <KeyRound className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block mb-0.5">Assinatura Governamental Válida</span>
                Este QR Code encripta um hash hexadecimal certificado gerado pelo Ministério do Interior de Angola. A integridade desta assinatura e do carimbo temporal é inspecionada por chaves públicas nacionais.
              </div>
            </div>

            <div className="text-[9px] text-slate-600 font-mono text-center flex justify-between px-1">
              <span>Série A • Homologação Militar</span>
              <span>ID: {metadata?.id || "N/A"}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
