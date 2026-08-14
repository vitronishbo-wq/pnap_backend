import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  X, 
  RotateCw, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  VideoOff, 
  Sparkles,
  SwitchCamera
} from "lucide-react";

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  title?: string;
  subtitle?: string;
}

export function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  title = "Captura de Fotografia Oficial",
  subtitle = "Posicione o recluso de frente com boa iluminação para o registo biométrico oficial"
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<"user" | "environment">("user");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

  // Stop current stream
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      setStream(null);
    }
  };

  // Start camera stream
  const startCamera = async (facing: "user" | "environment") => {
    setIsLoading(true);
    setErrorMsg(null);
    stopStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("A câmara de vídeo não é suportada neste navegador ou ambiente.");
      }

      // Check available devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === "videoinput");
        setHasMultipleCameras(videoDevices.length > 1);
      } catch {
        // ignore
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 960 }
        },
        audio: false
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(() => {});
      }
      setIsLoading(false);
    } catch (err: any) {
      console.error("Camera access error:", err);
      let message = "Não foi possível aceder à câmara.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        message = "Permissão de acesso à câmara foi negada pelo utilizador ou navegador.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        message = "Nenhum dispositivo de câmara foi detectado no sistema.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        message = "A câmara já está em uso por outra aplicação.";
      } else if (err.message) {
        message = err.message;
      }
      setErrorMsg(message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedPhoto(null);
      startCamera(cameraFacing);
    } else {
      stopStream();
      setCapturedPhoto(null);
    }

    return () => {
      stopStream();
    };
  }, [isOpen, cameraFacing]);

  // Handle take snapshot
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // If user facing, horizontal flip for intuitive mirror capture
      if (cameraFacing === "user") {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setCapturedPhoto(dataUrl);
      stopStream();
    }
  };

  // Switch camera between front and rear
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === "user" ? "environment" : "user";
    setCameraFacing(nextFacing);
  };

  // Confirm photo and send to parent
  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera(cameraFacing);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-900 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wide">
                {title}
              </h3>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-tight">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xs font-mono p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 transition cursor-pointer"
            title="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Viewfinder / Preview Body */}
        <div className="p-4 flex flex-col items-center justify-center bg-slate-950 relative min-h-[320px]">
          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Captured Preview */}
          {capturedPhoto ? (
            <div className="flex flex-col items-center w-full">
              <div className="relative w-full max-w-sm aspect-[4/3] rounded-xl overflow-hidden border-2 border-amber-500/60 shadow-xl bg-black">
                <img
                  src={capturedPhoto}
                  alt="Fotografia Capturada"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm border border-amber-500/40 px-2.5 py-1 rounded-md text-[10px] font-mono text-amber-400 font-bold flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-emerald-400" /> FOTO CAPTURADA (CONFORME)
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-2.5 text-center">
                Verifique o enquadramento. Clique em <strong className="text-emerald-400">"Utilizar Fotografia"</strong> para confirmar.
              </p>
            </div>
          ) : errorMsg ? (
            /* Error View */
            <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm">
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 mb-3">
                <VideoOff className="h-8 w-8" />
              </div>
              <h4 className="text-xs font-bold font-mono text-rose-300 uppercase mb-1">
                Falha no Acesso à Câmara
              </h4>
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                {errorMsg}
              </p>
              <button
                type="button"
                onClick={() => startCamera(cameraFacing)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-amber-400 border border-slate-800 rounded-xl text-xs font-mono font-bold cursor-pointer transition"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Tentar Novamente
              </button>
            </div>
          ) : (
            /* Live Camera Stream */
            <div className="relative w-full max-w-sm aspect-[4/3] rounded-xl overflow-hidden border-2 border-slate-800 bg-black flex items-center justify-center">
              {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xs text-slate-400 text-xs font-mono">
                  <RotateCw className="h-6 w-6 text-amber-400 animate-spin mb-2" />
                  Iniciando fluxo de vídeo...
                </div>
              )}
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${cameraFacing === "user" ? "scale-x-[-1]" : ""}`}
              />

              {/* Viewfinder Target Guide Overlay */}
              <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-amber-500/30 m-4 rounded-lg flex items-center justify-center">
                <div className="w-32 h-44 border border-amber-400/40 rounded-full flex items-center justify-center">
                  <span className="text-[9px] font-mono text-amber-400/60 uppercase tracking-widest">ENQUADRAR ROSTO</span>
                </div>
              </div>

              {/* Camera Switcher Button on top corner */}
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="absolute top-2.5 right-2.5 z-20 p-2 bg-black/60 hover:bg-black/80 border border-slate-700 rounded-xl text-slate-200 hover:text-amber-400 text-xs font-mono transition cursor-pointer"
                  title="Alternar Câmara Frontal / Traseira"
                >
                  <SwitchCamera className="h-4 w-4" />
                </button>
              )}

              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[9px] font-mono text-slate-300 border border-slate-800">
                LIVE • {cameraFacing === "user" ? "FRONTAL" : "TRASEIRA"}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-900 bg-slate-900/60 flex items-center justify-between gap-2">
          {capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Repetir Foto
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-slate-400 hover:text-slate-200 text-xs font-mono cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-black shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  Utilizar Fotografia
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isLoading || Boolean(errorMsg)}
                onClick={takeSnapshot}
                className={`px-5 py-2.5 rounded-xl text-xs font-mono font-black shadow-lg flex items-center gap-2 transition ${
                  isLoading || Boolean(errorMsg)
                    ? "bg-slate-850 text-slate-600 border border-slate-800 cursor-not-allowed"
                    : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 cursor-pointer"
                }`}
              >
                <Camera className="h-4 w-4 stroke-[2.5]" />
                Capturar Foto Oficial
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
