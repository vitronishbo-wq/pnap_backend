/**
 * PNAP-AO - Módulo de Redação e Despachos Judiciais (Google Docs API v1)
 * Autos de notificação, mandados de condução, pareceres técnicos e relatórios disciplinares.
 */
import React, { useState, useEffect } from "react";
import { initAuth, googleSignIn, logoutGoogle } from "../utils/googleAuth";
import { 
  docsService, 
  GoogleDocInfo, 
  PNAP_PRESET_DOCS 
} from "../utils/docsService";
import { User } from "firebase/auth";
import {
  FileText,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  X,
  FileCheck,
  Sparkles,
  Edit3,
  BookOpen,
  Send,
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DocsModuleProps {
  currentOperatorName?: string;
  onAuditAction?: (action: string, target: string, details: string) => void;
}

export const DocsModule: React.FC<DocsModuleProps> = ({
  currentOperatorName = "Operador MININT",
  onAuditAction
}) => {
  // Autenticação
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Lista de Documentos
  const [docsList, setDocsList] = useState<{ id: string; name: string; modifiedTime?: string; webViewLink?: string }[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [activeDoc, setActiveDoc] = useState<GoogleDocInfo | null>(null);
  const [docPlainText, setDocPlainText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Modal Novo Documento
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | "custom">("custom");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  // Modal Adicionar Parágrafo / Despacho Adicional
  const [isAppendModalOpen, setIsAppendModalOpen] = useState(false);
  const [appendText, setAppendText] = useState("");

  // Toast
  const [feedbackToast, setFeedbackToast] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "info", message: "" });

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setFeedbackToast({ show: true, type, message });
    setTimeout(() => {
      setFeedbackToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setGoogleUser(user);
        if (token) {
          setAccessToken(token);
          loadDocs(token);
        } else {
          setAccessToken(null);
        }
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
        setDocsList([]);
        setActiveDoc(null);
        setDocPlainText("");
      }
    );
    return () => unsubscribe();
  }, []);

  const loadDocs = async (token: string) => {
    setIsLoading(true);
    try {
      const list = await docsService.listDocs(token);
      setDocsList(list);
      if (list.length > 0 && !selectedDocId) {
        handleSelectDoc(list[0].id, token);
      }
    } catch (err: any) {
      console.error("Erro ao listar documentos do Google Docs:", err);
      showToast(err.message || "Erro ao conectar à API Google Docs", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDoc = async (id: string, tokenToUse?: string) => {
    const token = tokenToUse || accessToken;
    if (!token) return;
    setSelectedDocId(id);
    setIsLoading(true);
    try {
      const doc = await docsService.getDocument(token, id);
      setActiveDoc(doc);
      setDocPlainText(docsService.extractPlainText(doc));
    } catch (err: any) {
      showToast(err.message || "Erro ao carregar documento.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const res = await googleSignIn();
      if (res?.accessToken) {
        setAccessToken(res.accessToken);
        setGoogleUser(res.user);
        showToast(`Google Docs conectado com sucesso: ${res.user.email}`, "success");
        if (onAuditAction) {
          onAuditAction("GOOGLE_DOCS_AUTH", res.user.email || "Google Account", "Autenticação OAuth Google Docs.");
        }
        loadDocs(res.accessToken);
      }
    } catch (err: any) {
      showToast(err.message || "Falha ao autenticar Google Docs.", "error");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setAccessToken(null);
    setGoogleUser(null);
    setDocsList([]);
    setActiveDoc(null);
    setDocPlainText("");
    showToast("Sessão Google Docs encerrada.", "info");
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setIsLoading(true);
    try {
      let title = newTitle.trim();
      let content = newContent.trim();

      if (selectedPresetIndex !== "custom") {
        const preset = PNAP_PRESET_DOCS[selectedPresetIndex];
        title = title || preset.title;
        content = content || preset.content;
      } else {
        title = title || "Despacho Penitenciário PNAP-AO";
      }

      const created = await docsService.createDocument(accessToken, title, content);
      showToast(`Documento "${created.title}" criado no Google Docs!`, "success");

      if (onAuditAction) {
        onAuditAction("DOCS_CREATE", created.title, `Criado documento ID: ${created.documentId}`);
      }

      setIsCreateModalOpen(false);
      setNewTitle("");
      setNewContent("");
      await loadDocs(accessToken);
      if (created.documentId) {
        await handleSelectDoc(created.documentId, accessToken);
      }
    } catch (err: any) {
      showToast(err.message || "Erro ao criar documento.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppendParagraph = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !selectedDocId || !appendText.trim()) return;

    setIsLoading(true);
    try {
      const stamp = `\n\n[ADITAMENTO DE DESPACHO - ${new Date().toLocaleString("pt-AO")} por ${currentOperatorName}]:\n${appendText.trim()}\n`;
      await docsService.insertText(accessToken, selectedDocId, stamp, 1);
      
      showToast("Despacho / Aditamento inserido com sucesso!", "success");
      if (onAuditAction) {
        onAuditAction("DOCS_APPEND", activeDoc?.title || "Documento", "Inserido novo parágrafo de despacho oficial.");
      }

      setIsAppendModalOpen(false);
      setAppendText("");
      await handleSelectDoc(selectedDocId, accessToken);
    } catch (err: any) {
      showToast(err.message || "Erro ao inserir texto no documento.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocs = docsList.filter((d) =>
    d.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* Toast */}
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
            {feedbackToast.type === "info" && <FileText className="h-5 w-5 text-indigo-400 shrink-0" />}
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

      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-950/70 border border-indigo-800/60 rounded-xl text-indigo-400">
            <FileText className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-wide text-slate-100 uppercase font-mono">
                Redator Oficial & Despachos (Google Docs)
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-950/80 border border-indigo-800 text-indigo-300 rounded">
                DOCS v1 API
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Elaboração e consulta de pareceres técnicos, autos de notificação judicial, relatórios disciplinares e despachos penitenciários.
            </p>
          </div>
        </div>

        {/* Autenticação */}
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
                  <div className="w-6 h-6 rounded-full bg-indigo-900 border border-indigo-700 flex items-center justify-center text-[10px] font-mono text-indigo-200">
                    {googleUser.email?.[0].toUpperCase() || "G"}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-slate-200 font-semibold leading-tight">
                    {googleUser.email}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono flex items-center gap-1">
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
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-all shadow-md font-mono active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isAuthenticating ? "A Conectar..." : "Conectar Google Docs"}</span>
            </button>
          )}
        </div>
      </div>

      {!accessToken ? (
        <div className="p-10 bg-slate-900/60 border border-slate-800 rounded-xl text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-indigo-400">
            <BookOpen className="h-10 w-10" />
          </div>
          <div className="max-w-md">
            <h3 className="text-base font-bold text-slate-100 font-mono">
              Acesso ao Google Docs Necessário
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Autentique a sua conta autorizada para redigir autos oficiais, consultar pareceres de liberdade condicional e emitir certidões no formato Google Docs.
            </p>
          </div>
          <button
            onClick={handleSignIn}
            disabled={isAuthenticating}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs rounded-lg transition-all shadow-lg active:scale-95"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Iniciar Sessão Google Docs</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* PAINEL LATERAL: LISTA DE DOCUMENTOS */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200 font-mono uppercase">
                    Documentos ({docsList.length})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="p-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 rounded text-xs transition-colors"
                    title="Novo Documento"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => accessToken && loadDocs(accessToken)}
                    disabled={isLoading}
                    className="p-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-indigo-300 rounded text-xs transition-colors"
                    title="Atualizar Lista"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Busca */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filtrar documentos..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-600"
                />
                <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>

              {/* Lista */}
              <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                {filteredDocs.length === 0 ? (
                  <div className="py-8 text-center text-slate-500 font-mono text-xs">
                    Nenhum documento encontrado.
                  </div>
                ) : (
                  filteredDocs.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectDoc(item.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-2.5 ${
                        selectedDocId === item.id
                          ? "bg-indigo-950/50 border-indigo-700/80 text-slate-100"
                          : "bg-slate-950/60 border-slate-850 hover:border-slate-700 text-slate-300 hover:text-slate-100"
                      }`}
                    >
                      <FileText className={`h-4 w-4 shrink-0 mt-0.5 ${selectedDocId === item.id ? "text-indigo-400" : "text-slate-500"}`} />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-mono font-semibold truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {item.modifiedTime ? new Date(item.modifiedTime).toLocaleDateString("pt-AO") : ""}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* PAINEL CENTRAL: LEITOR E EDITOR DO DOCUMENTO ATIVO */}
          <div className="lg:col-span-8 space-y-4">
            {activeDoc ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-[550px]">
                {/* Barra Superior do Documento */}
                <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-indigo-400 shrink-0" />
                      <h3 className="text-sm font-bold text-slate-100 font-mono truncate">
                        {activeDoc.title}
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                      ID: {activeDoc.documentId}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`https://docs.google.com/document/d/${activeDoc.documentId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-indigo-300 text-xs font-mono rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Abrir no Google Docs</span>
                    </a>
                    <button
                      onClick={() => setIsAppendModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-200 text-xs font-mono rounded-lg transition-colors font-medium"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Aditar Despacho</span>
                    </button>
                  </div>
                </div>

                {/* Conteúdo do Documento */}
                <div className="flex-1 overflow-auto p-6 max-h-[500px] bg-slate-950/40">
                  {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400 font-mono text-xs">
                      <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
                      <span>A carregar documento oficial...</span>
                    </div>
                  ) : !docPlainText.trim() ? (
                    <div className="py-20 text-center text-slate-500 font-mono text-xs">
                      Este documento está em branco. Clique em "Aditar Despacho" ou abra no Google Docs para redigir.
                    </div>
                  ) : (
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-8 shadow-inner font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {docPlainText}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-900/60 border border-slate-800 rounded-xl text-center text-slate-500 font-mono text-xs">
                <FileText className="h-10 w-10 text-slate-700 mb-2" />
                <span className="text-slate-300 font-semibold">Nenhum Documento Selecionado</span>
                <p className="max-w-sm text-slate-500 mt-1">
                  Selecione um documento na lista ou redija um novo auto penitenciário institucional.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: NOVO DOCUMENTO */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-slate-900 border border-slate-750 rounded-xl shadow-2xl p-6 space-y-4 font-mono max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase">
                    Redigir Novo Documento Google Docs
                  </h3>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDocument} className="space-y-4 text-xs">
                {/* Selecionar Modelo Padrão ou Personalizado */}
                <div>
                  <label className="block text-slate-400 mb-2 font-semibold">
                    Modelos de Peças Processuais PNAP-AO:
                  </label>
                  <div className="space-y-2">
                    {PNAP_PRESET_DOCS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setSelectedPresetIndex(idx);
                          setNewTitle(preset.title);
                          setNewContent(preset.content);
                        }}
                        className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-start gap-2.5 ${
                          selectedPresetIndex === idx
                            ? "bg-indigo-950/80 border-indigo-700 text-slate-100"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-slate-200">{preset.title}</div>
                          <div className="text-[10px] text-indigo-400 mt-0.5">
                            {preset.category}
                          </div>
                        </div>
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPresetIndex("custom");
                        setNewTitle("");
                        setNewContent("");
                      }}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-center gap-2.5 ${
                        selectedPresetIndex === "custom"
                          ? "bg-indigo-950/80 border-indigo-700 text-slate-100 font-bold"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Plus className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span>Documento em Branco (Texto Livre)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Título do Documento:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Auto de Notificação Judicial - Proc. 4502/26"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Corpo do Documento:
                  </label>
                  <textarea
                    rows={6}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Escreva ou edite o teor da certidão ou despacho..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-600 resize-none font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold"
                  >
                    Criar no Google Docs
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADITAR DESPACHO */}
      <AnimatePresence>
        {isAppendModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-mono">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-750 rounded-xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase">
                    Aditar Despacho ao Documento
                  </h3>
                </div>
                <button onClick={() => setIsAppendModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAppendParagraph} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Texto do Aditamento / Parecer Adicional:
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={appendText}
                    onChange={(e) => setAppendText(e.target.value)}
                    placeholder="Insira o texto complementar do despacho que será carimbado com data, hora e operador..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-600 resize-none font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAppendModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold"
                  >
                    Aditar ao Documento
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
