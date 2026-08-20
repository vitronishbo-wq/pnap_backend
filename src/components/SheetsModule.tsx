/**
 * PNAP-AO - Módulo de Exportação Estatística e Relatórios Tabulares (Google Sheets)
 * 
 * DIRETRIZ ARQUITETURAL:
 * - O Google Sheets atua estritamente como destino de exportação e emissão de relatórios tabulares.
 * - A base canónica de dados institucional (fonte da verdade) reside exclusivamente no Firestore / PNAP-AO.
 * - Toda e qualquer exportação é autenticada e auditada server-side.
 */
import React, { useState, useEffect } from "react";
import { initAuth, googleSignIn, logoutGoogle } from "../utils/googleAuth";
import { 
  sheetsService, 
  SpreadsheetInfo, 
  PNAP_PRESET_SHEETS 
} from "../utils/sheetsService";
import { User } from "firebase/auth";
import {
  FileSpreadsheet,
  RefreshCw,
  Search,
  ExternalLink,
  Table,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  X,
  FileDown,
  Layers,
  Sparkles,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SheetsModuleProps {
  currentOperatorName?: string;
  onAuditAction?: (action: string, target: string, details: string) => void;
}

export const SheetsModule: React.FC<SheetsModuleProps> = ({
  currentOperatorName = "Operador MININT",
  onAuditAction
}) => {
  // Autenticação OAuth em memória volátil
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Lista de Planilhas
  const [spreadsheetsList, setSpreadsheetsList] = useState<{ id: string; name: string; modifiedTime?: string; webViewLink?: string }[]>([]);
  const [selectedSpreadsheetId, setSelectedSpreadsheetId] = useState<string | null>(null);
  const [activeSpreadsheet, setActiveSpreadsheet] = useState<SpreadsheetInfo | null>(null);
  const [activeSheetTab, setActiveSheetTab] = useState<string>("");
  const [sheetValues, setSheetValues] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Modal de Exportação de Relatório Autorizado
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportReportType, setExportReportType] = useState<number>(0);
  const [customReportTitle, setCustomReportTitle] = useState("");

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
          loadSpreadsheets(token);
        } else {
          setAccessToken(null);
        }
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
        setSpreadsheetsList([]);
        setActiveSpreadsheet(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadSpreadsheets = async (token: string) => {
    setIsLoading(true);
    try {
      const list = await sheetsService.listSpreadsheets(token);
      setSpreadsheetsList(list);
      if (list.length > 0 && !selectedSpreadsheetId) {
        handleSelectSpreadsheet(list[0].id, token);
      }
    } catch (err: any) {
      console.error("Erro ao listar planilhas:", err);
      showToast(err.message || "Erro ao conectar à API Google Sheets", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSpreadsheet = async (id: string, tokenToUse?: string) => {
    const token = tokenToUse || accessToken;
    if (!token) return;
    setSelectedSpreadsheetId(id);
    setIsLoading(true);
    try {
      const meta = await sheetsService.getSpreadsheet(token, id);
      setActiveSpreadsheet(meta);
      const firstTab = meta.sheets?.[0]?.properties?.title || "Sheet1";
      setActiveSheetTab(firstTab);
      await loadSheetData(token, id, firstTab);
    } catch (err: any) {
      showToast(err.message || "Erro ao carregar dados da planilha.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSheetData = async (token: string, spreadsheetId: string, sheetTitle: string) => {
    try {
      const data = await sheetsService.getValues(token, spreadsheetId, `${sheetTitle}!A1:Z100`);
      setSheetValues(data.values || []);
    } catch (err: any) {
      console.warn("Aviso ao ler células da aba:", err);
      setSheetValues([]);
    }
  };

  const handleTabChange = async (tabName: string) => {
    if (!accessToken || !selectedSpreadsheetId) return;
    setActiveSheetTab(tabName);
    setIsLoading(true);
    await loadSheetData(accessToken, selectedSpreadsheetId, tabName);
    setIsLoading(false);
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const res = await googleSignIn(currentOperatorName);
      if (res?.accessToken) {
        setAccessToken(res.accessToken);
        setGoogleUser(res.user);
        showToast(`Google Sheets autorizado com sucesso: ${res.user.email}`, "success");
        if (onAuditAction) {
          onAuditAction("SHEETS_AUTH_SUCCESS", res.user.email || "Google Account", "Autorização de exportação Google Sheets.");
        }
        loadSpreadsheets(res.accessToken);
      }
    } catch (err: any) {
      showToast(err.message || "Falha na autorização do Google Sheets.", "error");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setAccessToken(null);
    setGoogleUser(null);
    setSpreadsheetsList([]);
    setActiveSpreadsheet(null);
    setSheetValues([]);
    showToast("Sessão Google Sheets revogada e limpa da memória.", "info");
    if (onAuditAction) {
      onAuditAction("SHEETS_LOGOUT_REVOKE", "Google Workspace", "Revogação de token OAuth Google Sheets.");
    }
  };

  // Executa exportação formal de relatório institucional
  const handleExecuteExportReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setIsLoading(true);
    try {
      const preset = PNAP_PRESET_SHEETS[exportReportType] || PNAP_PRESET_SHEETS[0];
      const title = customReportTitle.trim() || `${preset.title} (${new Date().toLocaleDateString("pt-AO")})`;

      const created = await sheetsService.createSpreadsheet(accessToken, title, preset.headers, preset.initialData);
      showToast(`Relatório "${title}" exportado para o Google Sheets com sucesso!`, "success");

      if (onAuditAction) {
        onAuditAction("SHEETS_EXPORT_REPORT", title, `Exportado relatório oficial ID: ${created.spreadsheetId} por ${currentOperatorName}`);
      }

      setIsExportModalOpen(false);
      setCustomReportTitle("");
      await loadSpreadsheets(accessToken);
      if (created.spreadsheetId) {
        await handleSelectSpreadsheet(created.spreadsheetId, accessToken);
      }
    } catch (err: any) {
      showToast(err.message || "Erro ao exportar relatório.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSpreadsheets = spreadsheetsList.filter(s => 
    s.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 text-slate-200">
      {/* Toast Alert */}
      <AnimatePresence>
        {feedbackToast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-xl flex items-center gap-3 text-sm font-sans ${
              feedbackToast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
                : feedbackToast.type === "error"
                ? "bg-red-950/90 border-red-500/50 text-red-200"
                : "bg-slate-900/90 border-slate-700 text-slate-200"
            }`}
          >
            {feedbackToast.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
            {feedbackToast.type === "error" && <AlertTriangle className="h-4 w-4 text-red-400" />}
            <span>{feedbackToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Institucional */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/50 border border-emerald-800/40 rounded-lg text-emerald-400">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-wide">Exportação Estatística & Relatórios Tabulares</h1>
              <span className="bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded">
                Google Sheets API v4
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Utilitário de exportação complementar. A fonte canónica dos dados reside exclusivamente no Firestore / PNAP-AO.
            </p>
          </div>
        </div>

        {/* Controles de Autenticação */}
        <div className="flex items-center gap-3">
          {accessToken ? (
            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
              <div className="flex items-center gap-2 text-xs">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="text-slate-300 font-mono">{googleUser?.email || "Google Conectado"}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors pl-2 border-l border-slate-800"
                title="Revogar e Encerrar Sessão OAuth"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Desconectar</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isAuthenticating}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>{isAuthenticating ? "Autorizando..." : "Autorizar Exportação Google Sheets"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerta de Diretriz de Dados */}
      <div className="bg-slate-950/60 border border-slate-850 rounded-lg px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-amber-400" />
          <span><strong>Regra de Integridade:</strong> As planilhas geradas são relatórios de leitura/exportação. Quaisquer alterações em reclusos, lotação ou escoltas devem ser efetuadas nos módulos centrais da plataforma.</span>
        </div>
      </div>

      {accessToken ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Coluna Lateral: Lista de Relatórios Exportados */}
          <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Relatórios Emitidos</span>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer"
                title="Exportar Novo Relatório Oficial"
              >
                <FileDown className="h-3.5 w-3.5" />
                <span>Exportar</span>
              </button>
            </div>

            {/* Busca */}
            <div className="relative">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filtrar relatórios..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Lista */}
            <div className="flex flex-col gap-1 max-h-[480px] overflow-y-auto pr-1">
              {isLoading && spreadsheetsList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                  <span>A carregar relatórios...</span>
                </div>
              ) : filteredSpreadsheets.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Nenhum relatório tabular encontrado.
                </div>
              ) : (
                filteredSpreadsheets.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSpreadsheet(item.id)}
                    className={`text-left p-2.5 rounded-lg text-xs transition-all flex flex-col gap-1 border ${
                      selectedSpreadsheetId === item.id
                        ? "bg-emerald-950/40 border-emerald-600/50 text-emerald-200"
                        : "bg-slate-950/40 border-slate-850 text-slate-300 hover:bg-slate-800/50 hover:text-white"
                    }`}
                  >
                    <div className="font-medium truncate flex items-center gap-1.5">
                      <Table className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.modifiedTime && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(item.modifiedTime).toLocaleDateString("pt-AO")} {new Date(item.modifiedTime).toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Área Principal: Visualizador Tabular do Relatório */}
          <div className="lg:col-span-3 bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            {activeSpreadsheet ? (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Table className="h-4 w-4 text-emerald-400" />
                      <span>{activeSpreadsheet.properties.title}</span>
                    </h2>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ID: {activeSpreadsheet.spreadsheetId}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={activeSpreadsheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${activeSpreadsheet.spreadsheetId}/edit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Abrir no Google Sheets Web</span>
                    </a>
                  </div>
                </div>

                {/* Abas / Folhas da Planilha */}
                {activeSpreadsheet.sheets && activeSpreadsheet.sheets.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
                    <Layers className="h-3.5 w-3.5 text-slate-500 mr-1" />
                    {activeSpreadsheet.sheets.map((sheet) => {
                      const tabTitle = sheet.properties.title;
                      const isActive = activeSheetTab === tabTitle;
                      return (
                        <button
                          key={sheet.properties.sheetId}
                          onClick={() => handleTabChange(tabTitle)}
                          className={`text-xs px-3 py-1 rounded-md font-mono transition-all ${
                            isActive
                              ? "bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-bold"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                          }`}
                        >
                          {tabTitle}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Grelha de Dados */}
                <div className="border border-slate-800 rounded-lg overflow-x-auto bg-slate-950 max-h-[500px]">
                  {sheetValues.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500">
                      Nenhum dado tabular retornado para a aba selecionada.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs border-collapse font-sans">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-slate-300">
                          <th className="py-2 px-3 font-mono text-[11px] text-slate-500 w-10 text-center border-r border-slate-800">#</th>
                          {sheetValues[0]?.map((head, idx) => (
                            <th key={idx} className="py-2.5 px-3 font-semibold tracking-wider text-slate-300 border-r border-slate-800/60 last:border-r-0 whitespace-nowrap">
                              {head || `Col ${idx + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {sheetValues.slice(1).map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-slate-900/50 transition-colors">
                            <td className="py-2 px-3 font-mono text-[10px] text-slate-600 text-center border-r border-slate-850 bg-slate-950/80">
                              {rowIdx + 1}
                            </td>
                            {sheetValues[0]?.map((_, colIdx) => (
                              <td key={colIdx} className="py-2 px-3 text-slate-300 border-r border-slate-850/60 last:border-r-0 whitespace-nowrap font-mono text-[11px]">
                                {row[colIdx] || "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            ) : (
              <div className="py-24 text-center text-slate-500 text-xs flex flex-col items-center gap-3">
                <Table className="h-8 w-8 text-slate-600" />
                <span>Selecione um relatório na lista lateral ou clique em "Exportar" para gerar um novo censo tabular.</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Estado Não Autenticado */
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center max-w-lg mx-auto">
          <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-full text-emerald-400 mb-4">
            <FileSpreadsheet className="h-10 w-10" />
          </div>
          <h2 className="text-base font-bold text-white">Autorização de Exportação Google Sheets</h2>
          <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed">
            Permite exportar mapas censitários, lotação de estabelecimentos e estatísticas do PNAP-AO para planilhas do Google Workspace de forma segura e auditada.
          </p>
          <button
            onClick={handleSignIn}
            disabled={isAuthenticating}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-lg cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{isAuthenticating ? "Aguardando Consentimento..." : "Conectar com Google Workspace"}</span>
          </button>
        </div>
      )}

      {/* Modal: Exportação Autorizada de Relatório */}
      <AnimatePresence>
        {isExportModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 text-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <FileDown className="h-4 w-4 text-emerald-400" />
                  <span>Exportar Relatório Tabular Institucional</span>
                </div>
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleExecuteExportReport} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-2 block">
                    Modelo de Relatório Prisional
                  </label>
                  <div className="flex flex-col gap-2">
                    {PNAP_PRESET_SHEETS.map((preset, idx) => (
                      <label
                        key={idx}
                        className={`p-3 rounded-lg border text-xs cursor-pointer flex items-start gap-2.5 transition-all ${
                          exportReportType === idx
                            ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-200"
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reportPreset"
                          checked={exportReportType === idx}
                          onChange={() => setExportReportType(idx)}
                          className="mt-0.5 text-emerald-500"
                        />
                        <div>
                          <div className="font-semibold text-white">{preset.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {preset.headers.length} colunas: {preset.headers.slice(0, 4).join(", ")}...
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Título Personalizado (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Censo Prisional Província de Luanda - Agosto 2026"
                    value={customReportTitle}
                    onChange={(e) => setCustomReportTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="bg-slate-950 border border-slate-850 rounded p-3 text-[11px] text-slate-400">
                  <span className="font-bold text-slate-300">Auditoria:</span> A exportação será registada com o operador <strong>{currentOperatorName}</strong> e data/hora oficial.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsExportModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileDown className="h-4 w-4" />
                    <span>{isLoading ? "A Exportar..." : "Gerar e Exportar Planilha"}</span>
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
