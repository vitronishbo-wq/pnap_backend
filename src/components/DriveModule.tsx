/**
 * PNAP-AO - Módulo de Arquivo Digital e Repositório em Nuvem (Google Drive API)
 * Gestão de processos judiciais, mandados de captura/soltura, fichas biométricas,
 * autos de ocorrência e relatórios clínicos penitenciários com integração Google Workspace.
 */
import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  initAuth, 
  googleSignIn, 
  getAccessToken, 
  getGoogleUser, 
  logoutGoogle 
} from "../utils/googleAuth";
import { 
  driveService, 
  DriveFileItem, 
  DriveStorageQuota, 
  PNAP_PRESET_FOLDERS,
  formatBytes
} from "../utils/driveService";
import { User } from "firebase/auth";
import {
  HardDrive,
  Folder,
  FolderPlus,
  FileText,
  File,
  FileSpreadsheet,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Search,
  UploadCloud,
  Download,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  User as UserIcon,
  LogOut,
  X,
  FileCheck,
  Building2,
  Clock,
  Sparkles,
  ArrowLeft,
  Eye,
  Check,
  Lock,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DriveModuleProps {
  currentOperatorName?: string;
  onAuditAction?: (action: string, target: string, details: string) => void;
}

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

export const DriveModule: React.FC<DriveModuleProps> = ({
  currentOperatorName = "Operador MININT",
  onAuditAction
}) => {
  // Estado de Autenticação Google
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Estado de Ficheiros e Pastas
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewTrashed, setViewTrashed] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: null, name: "Raiz Penitenciária (Google Drive)" }
  ]);
  const [storageQuota, setStorageQuota] = useState<DriveStorageQuota | null>(null);

  // Modais e Diálogos de Confirmação Obrigatória
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<globalThis.File | null>(null);
  const [uploadDescription, setUploadDescription] = useState("");

  // Modal de Exportação de Modelo Oficial PNAP para a Drive
  const [isExportModelModalOpen, setIsExportModelModalOpen] = useState(false);
  const [selectedDocTemplate, setSelectedDocTemplate] = useState<string>("guia_transferencia");
  const [customDocTitle, setCustomDocTitle] = useState("");
  const [customDocInmate, setCustomDocInmate] = useState("Recluso #AO-2026-9081 - Manuel Domingos");
  const [customDocObservations, setCustomDocObservations] = useState("Transferência autorizada por despacho judicial para Estabelecimento de Viana.");

  // Modal de Confirmação para Operações Destrutivas (MANDATÓRIO)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: "trash" | "delete_permanent" | "restore";
    targetFile: DriveFileItem | null;
  }>({
    isOpen: false,
    title: "",
    description: "",
    actionType: "trash",
    targetFile: null
  });

  // Notificações em Toast
  const [feedbackToast, setFeedbackToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentFolderId = useMemo(() => {
    return breadcrumbs[breadcrumbs.length - 1].id;
  }, [breadcrumbs]);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setFeedbackToast({ show: true, type, message });
    setTimeout(() => {
      setFeedbackToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  // Inicialização do listener de autenticação
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setGoogleUser(user);
        if (token) {
          setAccessToken(token);
          loadDriveData(token, currentFolderId, typeFilter, searchQuery, viewTrashed);
          loadQuota(token);
        } else {
          // Token expirado ou ainda não obtido via pop-up
          setAccessToken(null);
        }
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
        setFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  // Recarrega ficheiros quando muda pasta, filtro ou lixeira
  useEffect(() => {
    if (accessToken) {
      loadDriveData(accessToken, currentFolderId, typeFilter, searchQuery, viewTrashed);
    }
  }, [currentFolderId, typeFilter, viewTrashed]);

  const loadQuota = async (token: string) => {
    try {
      const quota = await driveService.getStorageQuota(token);
      setStorageQuota(quota);
    } catch (e) {
      console.warn("Não foi possível obter quota de armazenamento:", e);
    }
  };

  const loadDriveData = async (
    token: string,
    folderId?: string | null,
    filter?: string,
    search?: string,
    trashed?: boolean
  ) => {
    setIsLoading(true);
    try {
      const res = await driveService.listFiles(token, {
        folderId: folderId,
        mimeTypeFilter: filter === "all" ? undefined : filter,
        searchQuery: search,
        includeTrashed: trashed
      });
      setFiles(res.files || []);
    } catch (err: any) {
      console.error("Erro ao carregar dados do Google Drive:", err);
      showToast(err.message || "Falha na comunicação com a API do Google Drive", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessToken) {
      loadDriveData(accessToken, currentFolderId, typeFilter, searchQuery, viewTrashed);
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setAccessToken(res.accessToken);
        setGoogleUser(res.user);
        showToast(`Sessão Google iniciada com sucesso: ${res.user.email}`, "success");
        if (onAuditAction) {
          onAuditAction("GOOGLE_WORKSPACE_AUTH", res.user.email || "Google Account", "Autenticação OAuth Google Drive efetuada com sucesso.");
        }
        loadDriveData(res.accessToken, currentFolderId, typeFilter, searchQuery, viewTrashed);
        loadQuota(res.accessToken);
      }
    } catch (err: any) {
      console.error("Erro no login Google:", err);
      setAuthError(err.message || "Falha ao autenticar com o Google.");
      showToast("Não foi possível autenticar a conta Google Workspace.", "error");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setAccessToken(null);
    setGoogleUser(null);
    setFiles([]);
    showToast("Sessão Google encerrada e token volátil expulso da memória.", "info");
    if (onAuditAction) {
      onAuditAction("GOOGLE_WORKSPACE_LOGOUT", "Drive Service", "Encerramento de sessão e limpeza de credenciais.");
    }
  };

  // Navegação de Pastas
  const handleOpenFolder = (folder: DriveFileItem) => {
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
  };

  // Criar Pasta
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newFolderName.trim()) return;

    setIsLoading(true);
    try {
      const created = await driveService.createFolder(accessToken, newFolderName.trim(), currentFolderId);
      showToast(`Pasta "${created.name}" criada com sucesso no Google Drive.`, "success");
      if (onAuditAction) {
        onAuditAction("DRIVE_FOLDER_CREATE", created.name, `Pasta criada no diretório ${breadcrumbs[breadcrumbs.length - 1].name} (ID: ${created.id})`);
      }
      setNewFolderName("");
      setIsNewFolderModalOpen(false);
      loadDriveData(accessToken, currentFolderId, typeFilter, searchQuery, viewTrashed);
    } catch (err: any) {
      showToast(err.message || "Erro ao criar pasta.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Inicializar Estrutura Padrão PNAP
  const handleInitPresetFolders = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      let createdCount = 0;
      for (const preset of PNAP_PRESET_FOLDERS) {
        // Verifica se já existe na lista atual
        const exists = files.some(f => f.name.toLowerCase() === preset.name.toLowerCase());
        if (!exists) {
          await driveService.createFolder(accessToken, preset.name, currentFolderId, preset.desc);
          createdCount++;
        }
      }
      showToast(`Estrutura padrão configurada: ${createdCount} pastas penitenciárias criadas.`, "success");
      if (onAuditAction) {
        onAuditAction("DRIVE_INIT_PRESET", "PNAP Default Structure", `Criadas ${createdCount} pastas padrão no Google Drive.`);
      }
      loadDriveData(accessToken, currentFolderId, typeFilter, searchQuery, viewTrashed);
    } catch (err: any) {
      showToast(err.message || "Falha ao gerar estrutura padrão.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Upload de Arquivo Selecionado
  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !selectedUploadFile) return;

    setIsUploading(true);
    try {
      const created = await driveService.uploadFile(accessToken, {
        name: selectedUploadFile.name,
        mimeType: selectedUploadFile.type || "application/octet-stream",
        content: selectedUploadFile,
        parentFolderId: currentFolderId,
        description: uploadDescription || `Documento carregado por ${currentOperatorName}`
      });

      showToast(`Ficheiro "${created.name}" arquivado com sucesso no Google Drive.`, "success");
      if (onAuditAction) {
        onAuditAction("DRIVE_FILE_UPLOAD", created.name, `Upload de ficheiro (${formatBytes(created.size)}) no Google Drive.`);
      }
      setSelectedUploadFile(null);
      setUploadDescription("");
      setUploadModalOpen(false);
      loadDriveData(accessToken, currentFolderId, typeFilter, searchQuery, viewTrashed);
      loadQuota(accessToken);
    } catch (err: any) {
      showToast(err.message || "Erro ao efetuar upload do ficheiro.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Exportar Documento / Modelo Oficial PNAP diretamente para a Drive
  const handleExportTemplateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setIsLoading(true);
    try {
      const timestamp = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
      let docName = "";
      let docContent = "";

      if (selectedDocTemplate === "guia_transferencia") {
        docName = customDocTitle || `GUIA_TRANSFERENCIA_ESTABELECIMENTO_${Date.now()}.txt`;
        docContent = `REPÚBLICA DE ANGOLA
MINISTÉRIO DO INTERIOR
SERVIÇO PENITENCIÁRIO NACIONAL - PNAP-AO
========================================================================
GUIA OFICIAL DE TRANSFERÊNCIA DE CUSTÓDIA PENITENCIÁRIA
Data de Emissão: ${timestamp}
Operador Responsável: ${currentOperatorName}
------------------------------------------------------------------------
RECLUSO: ${customDocInmate}
DESPACHO/OBSERVAÇÕES: ${customDocObservations}

CONFORMIDADE LEGAL:
A presente transferência obedece às normas do Código de Execução de Penas de Angola
e às directrizes de segurança penitenciária do MININT.
========================================================================
Assinatura Digital de Custódia: [VALIDADO VIA PNAP-AO INFRASTRUCTURE]`;
      } else if (selectedDocTemplate === "mandado_captura") {
        docName = customDocTitle || `AUTO_CUMPRIMENTO_MANDADO_${Date.now()}.txt`;
        docContent = `REPÚBLICA DE ANGOLA
TRIBUNAIS DA COMARCA / MINISTÉRIO DO INTERIOR
PNAP-AO - SISTEMA INTEGRADO DE MANDADOS
========================================================================
AUTO DE CUMPRIMENTO E CONDUÇÃO PENAL
Data de Registo: ${timestamp}
Oficial de Diligências: ${currentOperatorName}
------------------------------------------------------------------------
INDIVÍDUO IDENTIFICADO: ${customDocInmate}
ESTADO DO MANDADO: Cumprido / Recluso sob Custódia Efetiva
DETALHES: ${customDocObservations}
========================================================================`;
      } else {
        docName = customDocTitle || `RELATORIO_SANITARIO_PRISIONAL_${Date.now()}.txt`;
        docContent = `REPÚBLICA DE ANGOLA - MINISTÉRIO DO INTERIOR
SERVIÇOS DE SAÚDE PENITENCIÁRIA PNAP-AO
========================================================================
BOLETIM CLÍNICO E ENCAMINHAMENTO MÉDICO
Data: ${timestamp}
Técnico Sanitário: ${currentOperatorName}
Recluso em Avaliação: ${customDocInmate}
Parecer Clínico: ${customDocObservations}
========================================================================`;
      }

      const created = await driveService.uploadFile(accessToken, {
        name: docName,
        mimeType: "text/plain",
        content: docContent,
        parentFolderId: currentFolderId,
        description: `Documento PNAP gerado por ${currentOperatorName}`
      });

      showToast(`Documento "${created.name}" gerado e arquivado no Google Drive.`, "success");
      if (onAuditAction) {
        onAuditAction("DRIVE_DOC_EXPORT", created.name, `Exportação de modelo oficial ${selectedDocTemplate} para Google Drive.`);
      }
      setIsExportModelModalOpen(false);
      setCustomDocTitle("");
      loadDriveData(accessToken, currentFolderId, typeFilter, searchQuery, viewTrashed);
      loadQuota(accessToken);
    } catch (err: any) {
      showToast(err.message || "Erro ao exportar documento oficial.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Solicitar Confirmação de Ação Destrutiva (Mover para o Lixo ou Exclusão Definitiva)
  const requestTrashConfirmation = (file: DriveFileItem) => {
    setConfirmDialog({
      isOpen: true,
      title: "Mover para a Lixeira do Google Drive?",
      description: `Tem certeza que deseja mover "${file.name}" para a Lixeira? O documento ficará arquivado temporariamente.`,
      actionType: "trash",
      targetFile: file
    });
  };

  const requestDeletePermanentConfirmation = (file: DriveFileItem) => {
    setConfirmDialog({
      isOpen: true,
      title: "Eliminação Permanente e Irreversível",
      description: `ATENÇÃO: A eliminação de "${file.name}" é permanente e não poderá ser recuperada. Confirma a destruição do arquivo do Google Drive?`,
      actionType: "delete_permanent",
      targetFile: file
    });
  };

  const requestRestoreConfirmation = (file: DriveFileItem) => {
    setConfirmDialog({
      isOpen: true,
      title: "Restaurar Ficheiro da Lixeira",
      description: `Deseja restaurar "${file.name}" da lixeira para a sua localização original no Google Drive?`,
      actionType: "restore",
      targetFile: file
    });
  };

  // Executar Ação Destrutiva após Confirmação Explícita no Diálogo
  const executeConfirmedAction = async () => {
    if (!accessToken || !confirmDialog.targetFile) return;

    const file = confirmDialog.targetFile;
    const action = confirmDialog.actionType;
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
    setIsLoading(true);

    try {
      if (action === "trash") {
        await driveService.trashFile(accessToken, file.id);
        showToast(`Ficheiro "${file.name}" movido para a Lixeira.`, "info");
        if (onAuditAction) {
          onAuditAction("DRIVE_TRASH_FILE", file.name, `Ficheiro (ID: ${file.id}) movido para o Lixo do Google Drive.`);
        }
      } else if (action === "delete_permanent") {
        await driveService.deletePermanently(accessToken, file.id);
        showToast(`Ficheiro "${file.name}" eliminado permanentemente.`, "info");
        if (onAuditAction) {
          onAuditAction("DRIVE_DELETE_PERMANENT", file.name, `Ficheiro (ID: ${file.id}) destruído permanentemente.`);
        }
      } else if (action === "restore") {
        await driveService.restoreFile(accessToken, file.id);
        showToast(`Ficheiro "${file.name}" restaurado com sucesso.`, "success");
        if (onAuditAction) {
          onAuditAction("DRIVE_RESTORE_FILE", file.name, `Ficheiro (ID: ${file.id}) restaurado da Lixeira.`);
        }
      }
      loadDriveData(accessToken, currentFolderId, typeFilter, searchQuery, viewTrashed);
      loadQuota(accessToken);
    } catch (err: any) {
      showToast(err.message || "Erro ao processar operação no ficheiro.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (item: DriveFileItem) => {
    if (item.mimeType === "application/vnd.google-apps.folder") {
      return <Folder className="h-5 w-5 text-amber-400 fill-amber-400/20" />;
    }
    if (item.mimeType.includes("pdf")) {
      return <FileText className="h-5 w-5 text-rose-400" />;
    }
    if (item.mimeType.includes("spreadsheet") || item.mimeType.includes("sheet") || item.mimeType.includes("csv")) {
      return <FileSpreadsheet className="h-5 w-5 text-emerald-400" />;
    }
    if (item.mimeType.includes("image")) {
      return <ImageIcon className="h-5 w-5 text-cyan-400" />;
    }
    return <File className="h-5 w-5 text-slate-400" />;
  };

  return (
    <div className="w-full space-y-6">
      {/* Toast Notificação */}
      <AnimatePresence>
        {feedbackToast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border shadow-xl flex items-center gap-3 max-w-md ${
              feedbackToast.type === "success"
                ? "bg-emerald-950 border-emerald-800 text-emerald-200"
                : feedbackToast.type === "error"
                ? "bg-rose-950 border-rose-800 text-rose-200"
                : "bg-slate-900 border-slate-750 text-slate-200"
            }`}
          >
            {feedbackToast.type === "success" && <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
            {feedbackToast.type === "error" && <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />}
            {feedbackToast.type === "info" && <HardDrive className="h-5 w-5 text-cyan-400 shrink-0" />}
            <span className="text-xs font-mono">{feedbackToast.message}</span>
            <button
              onClick={() => setFeedbackToast((prev) => ({ ...prev, show: false }))}
              className="ml-auto text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CABEÇALHO DO MÓDULO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-950/70 border border-cyan-800/60 rounded-xl text-cyan-400">
            <HardDrive className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-wide text-slate-100 uppercase font-mono">
                Repositório Digital & Arquivo Judicial (Google Drive)
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950/80 border border-cyan-800 text-cyan-300 rounded">
                DRIVE v3 API
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Custódia digital centralizada de processos, mandados, autos de captura e relatórios clínicos penitenciários.
            </p>
          </div>
        </div>

        {/* CONTROLO DE AUTENTICAÇÃO */}
        <div className="flex items-center gap-3">
          {accessToken && googleUser ? (
            <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg">
              <div className="flex items-center gap-2">
                {googleUser.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt={googleUser.displayName || "Google User"}
                    className="w-6 h-6 rounded-full border border-slate-700"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-cyan-900 border border-cyan-700 flex items-center justify-center text-[10px] font-mono text-cyan-200">
                    {googleUser.email?.[0].toUpperCase() || "G"}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-slate-200 font-semibold leading-tight">
                    {googleUser.email}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Token em Memória
                  </span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded transition-colors"
                title="Terminar Sessão Google"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isAuthenticating}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 font-medium text-xs rounded-lg transition-all shadow-md font-sans active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isAuthenticating ? "A Autenticar..." : "Conectar com Google Workspace"}</span>
            </button>
          )}
        </div>
      </div>

      {/* BLOCO SE NÃO AUTENTICADO */}
      {!accessToken ? (
        <div className="p-10 bg-slate-900/60 border border-slate-800 rounded-xl text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-cyan-400">
            <HardDrive className="h-10 w-10" />
          </div>
          <div className="max-w-md">
            <h3 className="text-base font-bold text-slate-100 font-mono">
              Acesso ao Repositório do Google Drive Necessário
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Inicie sessão com a sua conta autorizada Google Workspace para consultar o arquivo judicial, fazer upload de processos e sincronizar mandados prisionais com a nuvem.
            </p>
          </div>

          <button
            onClick={handleSignIn}
            disabled={isAuthenticating}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs rounded-lg transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{isAuthenticating ? "A Iniciar Sessão..." : "Autenticar Conta Google"}</span>
          </button>
        </div>
      ) : (
        /* PAINEL PRINCIPAL DO GOOGLE DRIVE */
        <div className="space-y-4">
          {/* BARRA DE FERRAMENTAS & BREADCRUMBS */}
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center flex-wrap gap-1.5 text-xs font-mono text-slate-300">
                <button
                  onClick={() => setBreadcrumbs([{ id: null, name: "Raiz Penitenciária (Google Drive)" }])}
                  className="flex items-center gap-1.5 px-2 py-1 bg-slate-950 border border-slate-800 hover:border-cyan-700 hover:text-cyan-300 rounded text-[11px] transition-colors"
                >
                  <HardDrive className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Raiz Drive</span>
                </button>

                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                    <button
                      onClick={() => handleNavigateBreadcrumb(idx)}
                      className={`px-2 py-1 rounded text-[11px] transition-colors max-w-[200px] truncate ${
                        idx === breadcrumbs.length - 1
                          ? "bg-cyan-950/70 text-cyan-300 border border-cyan-800 font-semibold"
                          : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>

              {/* AÇÕES: NOVA PASTA, UPLOAD, EXPORTAR DOC, ATUALIZAR */}
              <div className="flex items-center flex-wrap gap-2">
                <button
                  onClick={() => setIsNewFolderModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-750 text-slate-200 text-xs font-mono rounded-lg transition-all"
                >
                  <FolderPlus className="h-3.5 w-3.5 text-amber-400" />
                  <span>Nova Pasta</span>
                </button>

                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900/90 border border-cyan-800 text-cyan-200 text-xs font-mono rounded-lg transition-all"
                >
                  <UploadCloud className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Carregar Ficheiro</span>
                </button>

                <button
                  onClick={() => setIsExportModelModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-800 text-emerald-200 text-xs font-mono rounded-lg transition-all"
                >
                  <FileText className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Exportar Modelo PNAP</span>
                </button>

                <button
                  onClick={handleInitPresetFolders}
                  title="Criar estrutura de pastas padrão do sistema penitenciário"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-750 text-slate-300 text-xs font-mono rounded-lg transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>Pastas Oficiais</span>
                </button>

                <button
                  onClick={() => {
                    if (accessToken) {
                      loadDriveData(accessToken, currentFolderId, typeFilter, searchQuery, viewTrashed);
                      loadQuota(accessToken);
                    }
                  }}
                  disabled={isLoading}
                  className="p-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-750 text-slate-400 hover:text-cyan-300 rounded-lg transition-all disabled:opacity-50"
                  title="Recarregar Ficheiros"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
                </button>
              </div>
            </div>

            {/* FILTROS & PESQUISA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
              <form onSubmit={handleManualSearch} className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou conteúdo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-600"
                />
                <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-2.5" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      if (accessToken) loadDriveData(accessToken, currentFolderId, typeFilter, "", viewTrashed);
                    }}
                    className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </form>

              {/* FILTRO POR TIPO */}
              <div className="flex items-center flex-wrap gap-1.5 self-start sm:self-auto text-xs font-mono">
                <button
                  onClick={() => setTypeFilter("all")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    typeFilter === "all" ? "bg-slate-800 text-slate-100 font-semibold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setTypeFilter("folder")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    typeFilter === "folder" ? "bg-amber-950/80 border border-amber-800 text-amber-300 font-semibold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Pastas
                </button>
                <button
                  onClick={() => setTypeFilter("document")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    typeFilter === "document" ? "bg-rose-950/80 border border-rose-800 text-rose-300 font-semibold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Documentos/PDF
                </button>
                <button
                  onClick={() => setTypeFilter("spreadsheet")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    typeFilter === "spreadsheet" ? "bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-semibold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Planilhas
                </button>
                <button
                  onClick={() => setTypeFilter("image")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    typeFilter === "image" ? "bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-semibold" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Fotos/Imagens
                </button>

                <div className="h-4 w-px bg-slate-800 mx-1" />

                <button
                  onClick={() => setViewTrashed(!viewTrashed)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                    viewTrashed ? "bg-rose-900/60 border border-rose-700 text-rose-300 font-semibold" : "text-slate-400 hover:text-rose-300"
                  }`}
                >
                  <Trash2 className="h-3 w-3" />
                  <span>{viewTrashed ? "A ver Lixeira" : "Lixeira"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* LISTA DE FICHEIROS E PASTAS */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
                <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
                <span>A carregar ficheiros do Google Drive...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center gap-2 text-center text-slate-400 font-mono text-xs">
                <Folder className="h-10 w-10 text-slate-600" />
                <span className="font-semibold text-slate-300">Esta pasta está vazia</span>
                <span className="text-slate-500 max-w-sm text-[11px]">
                  Pode carregar ficheiros, criar subpastas ou inicializar as pastas oficiais do sistema penitenciário.
                </span>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="px-3 py-1.5 bg-cyan-950 border border-cyan-800 text-cyan-300 rounded text-[11px] hover:bg-cyan-900"
                  >
                    Carregar Ficheiro
                  </button>
                  <button
                    onClick={handleInitPresetFolders}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 rounded text-[11px] hover:bg-slate-850"
                  >
                    Criar Pastas Padrão
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {/* Cabeçalho da Tabela */}
                <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-slate-950/60 text-[11px] font-mono text-slate-400 font-semibold">
                  <div className="col-span-6 md:col-span-5">Nome do Documento / Ficheiro</div>
                  <div className="hidden md:block md:col-span-2">Tamanho</div>
                  <div className="col-span-3 md:col-span-2">Última Modificação</div>
                  <div className="col-span-3 text-right">Ações de Custódia</div>
                </div>

                {/* Linhas de Ficheiros */}
                {files.map((item) => {
                  const isFolder = item.mimeType === "application/vnd.google-apps.folder";

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-slate-850/60 transition-colors text-xs font-mono"
                    >
                      {/* Nome e Ícone */}
                      <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
                        <div className="shrink-0">{getFileIcon(item)}</div>
                        <div className="min-w-0 truncate">
                          {isFolder ? (
                            <button
                              onClick={() => handleOpenFolder(item)}
                              className="text-left font-semibold text-slate-200 hover:text-amber-400 transition-colors truncate block"
                            >
                              {item.name}
                            </button>
                          ) : (
                            <span className="text-slate-200 truncate block" title={item.name}>
                              {item.name}
                            </span>
                          )}
                          {item.description && (
                            <span className="text-[10px] text-slate-500 truncate block">
                              {item.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tamanho */}
                      <div className="hidden md:block md:col-span-2 text-slate-400 text-[11px]">
                        {isFolder ? "—" : formatBytes(item.size)}
                      </div>

                      {/* Modificação */}
                      <div className="col-span-3 md:col-span-2 text-slate-400 text-[11px]">
                        {item.modifiedTime
                          ? new Date(item.modifiedTime).toLocaleDateString("pt-AO", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })
                          : "—"}
                      </div>

                      {/* Ações */}
                      <div className="col-span-3 flex items-center justify-end gap-1.5">
                        {item.webViewLink && (
                          <a
                            href={item.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-900 rounded transition-colors"
                            title="Abrir no Google Drive"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}

                        {item.webContentLink && (
                          <a
                            href={item.webContentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-900 rounded transition-colors"
                            title="Descarregar Ficheiro"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}

                        {viewTrashed ? (
                          <>
                            <button
                              onClick={() => requestRestoreConfirmation(item)}
                              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-900 rounded transition-colors"
                              title="Restaurar Ficheiro"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => requestDeletePermanentConfirmation(item)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded transition-colors"
                              title="Eliminar Permanentemente"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => requestTrashConfirmation(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded transition-colors"
                            title="Mover para o Lixo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* QUOTA DE ARMAZENAMENTO GOOGLE DRIVE */}
          {storageQuota && (
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-300">
                <HardDrive className="h-4 w-4 text-cyan-400" />
                <span>
                  Armazenamento Google Workspace:{" "}
                  <strong className="text-slate-100">{formatBytes(storageQuota.usage)}</strong> utilizados de{" "}
                  <strong className="text-slate-100">{storageQuota.limit ? formatBytes(storageQuota.limit) : "Ilimitado"}</strong>
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Em conformidade com a política de custódia e retenção digital do MININT.
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: NOVA PASTA */}
      <AnimatePresence>
        {isNewFolderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-100 font-mono">Criar Nova Pasta</h3>
                </div>
                <button onClick={() => setIsNewFolderModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateFolder} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Nome da Pasta:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mandados 2026 - Tribunal Provincial"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewFolderModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded text-xs font-mono"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-mono font-medium"
                  >
                    Criar Pasta
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CARREGAR FICHEIRO (UPLOAD) */}
      <AnimatePresence>
        {uploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-750 rounded-xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-slate-100 font-mono">
                    Carregar Ficheiro para o Google Drive
                  </h3>
                </div>
                <button onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleFileUploadSubmit} className="space-y-4">
                {/* Zona de Drop / Seleção de Arquivo */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-750 hover:border-cyan-600 bg-slate-950/60 rounded-xl p-6 text-center cursor-pointer transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedUploadFile(e.target.files[0]);
                      }
                    }}
                  />
                  {selectedUploadFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileCheck className="h-8 w-8 text-emerald-400 shrink-0" />
                      <div className="text-left font-mono">
                        <div className="text-xs font-bold text-slate-100 truncate max-w-xs">
                          {selectedUploadFile.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatBytes(selectedUploadFile.size)} • {selectedUploadFile.type || "Ficheiro Genérico"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 font-mono">
                      <UploadCloud className="h-8 w-8 text-slate-500 mx-auto" />
                      <div className="text-xs text-slate-300 font-semibold">
                        Clique ou arraste um ficheiro para esta área
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Suporta PDFs judiciais, imagens biométricas, relatórios Word/Excel e arquivos de custódia.
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Descrição / Finalidade do Arquivo (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mandado de Soltura emitido pela 2ª Secção Penal"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-600"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setUploadModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded text-xs font-mono"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedUploadFile || isUploading}
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded text-xs font-mono font-medium flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>A Enviar para a Nuvem...</span>
                      </>
                    ) : (
                      <span>Carregar Ficheiro</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EXPORTAR MODELO OFICIAL PNAP */}
      <AnimatePresence>
        {isExportModelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-750 rounded-xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100 font-mono">
                    Exportar Modelo Oficial para o Google Drive
                  </h3>
                </div>
                <button onClick={() => setIsExportModelModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleExportTemplateDoc} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Tipo de Documento Oficial:</label>
                  <select
                    value={selectedDocTemplate}
                    onChange={(e) => setSelectedDocTemplate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="guia_transferencia">Guia de Transferência Penitenciária</option>
                    <option value="mandado_captura">Auto de Cumprimento de Mandado de Captura</option>
                    <option value="relatorio_clinico">Boletim Clínico & Encaminhamento Sanitário</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Nome do Ficheiro no Google Drive:</label>
                  <input
                    type="text"
                    placeholder="Ex: GUIA_TRANSF_RECLUSO_9081.txt"
                    value={customDocTitle}
                    onChange={(e) => setCustomDocTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Recluso Referenciado / Identificação:</label>
                  <input
                    type="text"
                    value={customDocInmate}
                    onChange={(e) => setCustomDocInmate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Observações e Despacho Judicial:</label>
                  <textarea
                    rows={3}
                    value={customDocObservations}
                    onChange={(e) => setCustomDocObservations(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsExportModelModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium"
                  >
                    Exportar para Google Drive
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIÁLOGO DE CONFIRMAÇÃO OBRIGATÓRIA PARA OPERAÇÕES DESTRUTIVAS */}
      <AnimatePresence>
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-rose-800/80 rounded-xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <h3 className="text-sm font-bold font-mono text-slate-100">
                  {confirmDialog.title}
                </h3>
              </div>

              <p className="text-xs font-mono text-slate-300 leading-relaxed">
                {confirmDialog.description}
              </p>

              {confirmDialog.targetFile && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 flex items-center gap-2">
                  {getFileIcon(confirmDialog.targetFile)}
                  <span className="font-semibold truncate">{confirmDialog.targetFile.name}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono rounded"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={executeConfirmedAction}
                  className={`px-4 py-1.5 text-xs font-mono font-bold text-white rounded transition-colors ${
                    confirmDialog.actionType === "delete_permanent"
                      ? "bg-rose-700 hover:bg-rose-600"
                      : confirmDialog.actionType === "trash"
                      ? "bg-amber-600 hover:bg-amber-500"
                      : "bg-emerald-600 hover:bg-emerald-500"
                  }`}
                >
                  {confirmDialog.actionType === "delete_permanent"
                    ? "Eliminar Definitivamente"
                    : confirmDialog.actionType === "trash"
                    ? "Mover para Lixeira"
                    : "Restaurar Ficheiro"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
