/**
 * PNAP-AO - Módulo de Agenda Judicial e Escoltas (Google Calendar API v3)
 * Audiências nos Tribunais de Comarca, escoltas de reclusos, inspeções MNCP e visitas sanitárias.
 */
import React, { useState, useEffect } from "react";
import { initAuth, googleSignIn, logoutGoogle } from "../utils/googleAuth";
import { 
  calendarService, 
  CalendarEventItem, 
  CalendarListItem, 
  PNAP_PRESET_EVENTS 
} from "../utils/calendarService";
import { User } from "firebase/auth";
import {
  Calendar as CalendarIcon,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  MapPin,
  Clock,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  X,
  Users,
  CalendarDays,
  Sparkles,
  CalendarCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CalendarModuleProps {
  currentOperatorName?: string;
  onAuditAction?: (action: string, target: string, details: string) => void;
}

export const CalendarModule: React.FC<CalendarModuleProps> = ({
  currentOperatorName = "Operador MININT",
  onAuditAction
}) => {
  // Autenticação
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Lista de Eventos e Calendários
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [calendars, setCalendars] = useState<CalendarListItem[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>("primary");
  const [isLoading, setIsLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");

  // Modal Novo Evento
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | "custom">("custom");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [endTime, setEndTime] = useState("11:00");
  const [attendeesStr, setAttendeesStr] = useState("");

  // Modal Eliminação com Confirmação
  const [eventToDelete, setEventToDelete] = useState<CalendarEventItem | null>(null);

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
          loadCalendarData(token);
        } else {
          setAccessToken(null);
        }
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
        setEvents([]);
        setCalendars([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const loadCalendarData = async (token: string, calId = "primary") => {
    setIsLoading(true);
    try {
      const [cals, evs] = await Promise.all([
        calendarService.listCalendars(token).catch(() => []),
        calendarService.listEvents(token, calId, {
          timeMin: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          maxResults: 50
        })
      ]);
      setCalendars(cals);
      setEvents(evs);
    } catch (err: any) {
      console.error("Erro ao listar eventos do Google Calendar:", err);
      showToast(err.message || "Erro ao conectar à API Google Calendar", "error");
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
        showToast(`Google Calendar conectado com sucesso: ${res.user.email}`, "success");
        if (onAuditAction) {
          onAuditAction("GOOGLE_CALENDAR_AUTH", res.user.email || "Google Account", "Autenticação OAuth Google Calendar.");
        }
        loadCalendarData(res.accessToken);
      }
    } catch (err: any) {
      showToast(err.message || "Falha ao autenticar Google Calendar.", "error");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setAccessToken(null);
    setGoogleUser(null);
    setEvents([]);
    setCalendars([]);
    showToast("Sessão Google Calendar encerrada.", "info");
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setIsLoading(true);
    try {
      const startDateTime = `${startDate}T${startTime}:00`;
      const endDateTime = `${endDate}T${endTime}:00`;

      const attendees = attendeesStr
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.includes("@"));

      const created = await calendarService.createEvent(accessToken, selectedCalendarId, {
        summary: summary.trim(),
        description: description.trim(),
        location: location.trim(),
        startDateTime,
        endDateTime,
        attendees
      });

      showToast(`Audiência / Diligência agendada com sucesso!`, "success");
      if (onAuditAction) {
        onAuditAction("CALENDAR_EVENT_CREATE", summary, `Agendado evento no Google Calendar para ${startDateTime}`);
      }

      setIsCreateModalOpen(false);
      resetForm();
      await loadCalendarData(accessToken, selectedCalendarId);
    } catch (err: any) {
      showToast(err.message || "Erro ao agendar evento.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSummary("");
    setDescription("");
    setLocation("");
    setAttendeesStr("");
    setSelectedPresetIndex("custom");
  };

  const applyPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    const preset = PNAP_PRESET_EVENTS[idx];
    setSummary(preset.summary);
    setDescription(preset.description);
    setLocation(preset.location);
    
    // Configura horários padrão
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    setStartDate(todayStr);
    setEndDate(todayStr);
    setStartTime("09:00");
    const endH = 9 + preset.durationHours;
    setEndTime(`${endH < 10 ? "0" + endH : endH}:00`);
  };

  const handleDeleteConfirm = async () => {
    if (!accessToken || !eventToDelete) return;
    setIsLoading(true);
    try {
      await calendarService.deleteEvent(accessToken, selectedCalendarId, eventToDelete.id);
      showToast(`Evento "${eventToDelete.summary}" cancelado com sucesso.`, "success");

      if (onAuditAction) {
        onAuditAction("CALENDAR_EVENT_DELETE", eventToDelete.summary, `Cancelado evento ID: ${eventToDelete.id}`);
      }

      setEventToDelete(null);
      await loadCalendarData(accessToken, selectedCalendarId);
    } catch (err: any) {
      showToast(err.message || "Erro ao cancelar evento.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter((ev) => {
    const text = `${ev.summary || ""} ${ev.description || ""} ${ev.location || ""}`.toLowerCase();
    return text.includes(searchFilter.toLowerCase());
  });

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
            {feedbackToast.type === "info" && <CalendarIcon className="h-5 w-5 text-blue-400 shrink-0" />}
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
          <div className="p-3 bg-blue-950/70 border border-blue-800/60 rounded-xl text-blue-400">
            <CalendarIcon className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-wide text-slate-100 uppercase font-mono">
                Agenda Judicial & Escoltas (Google Calendar)
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-950/80 border border-blue-800 text-blue-300 rounded">
                CALENDAR v3 API
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Programação de audiências nos tribunais de comarca, escoltas de custódia, inspeções preventivas MNCP e juntas médicas.
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
                  <div className="w-6 h-6 rounded-full bg-blue-900 border border-blue-700 flex items-center justify-center text-[10px] font-mono text-blue-200">
                    {googleUser.email?.[0].toUpperCase() || "G"}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-mono text-slate-200 font-semibold leading-tight">
                    {googleUser.email}
                  </span>
                  <span className="text-[10px] text-blue-400 font-mono flex items-center gap-1">
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition-all shadow-md font-mono active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isAuthenticating ? "A Conectar..." : "Conectar Google Calendar"}</span>
            </button>
          )}
        </div>
      </div>

      {!accessToken ? (
        <div className="p-10 bg-slate-900/60 border border-slate-800 rounded-xl text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-blue-400">
            <CalendarDays className="h-10 w-10" />
          </div>
          <div className="max-w-md">
            <h3 className="text-base font-bold text-slate-100 font-mono">
              Acesso ao Google Calendar Necessário
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Autentique a sua conta autorizada para agendar diligências judiciais, gerir o calendário de escoltas penitenciárias e sincronizar alertas de prazos processuais.
            </p>
          </div>
          <button
            onClick={handleSignIn}
            disabled={isAuthenticating}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs rounded-lg transition-all shadow-lg active:scale-95"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Iniciar Sessão Google Calendar</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* BARRA DE FERRAMENTAS & FILTROS */}
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Pesquisar por tribunal, motivo ou local..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-blue-600"
                />
                <Search className="h-3.5 w-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>

              {calendars.length > 1 && (
                <select
                  value={selectedCalendarId}
                  onChange={(e) => {
                    setSelectedCalendarId(e.target.value);
                    if (accessToken) loadCalendarData(accessToken, e.target.value);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-600"
                >
                  {calendars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.summary} {c.primary ? "(Principal)" : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs rounded-lg transition-colors font-bold shadow"
              >
                <Plus className="h-4 w-4" />
                <span>Agendar Diligência / Audiência</span>
              </button>
              <button
                onClick={() => accessToken && loadCalendarData(accessToken, selectedCalendarId)}
                disabled={isLoading}
                className="p-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-blue-300 rounded-lg text-xs transition-colors"
                title="Atualizar Agenda"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-blue-400" : ""}`} />
              </button>
            </div>
          </div>

          {/* LISTAGEM DE EVENTOS */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400 font-mono text-xs bg-slate-900/40 border border-slate-800 rounded-xl">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-400" />
              <span>A carregar eventos do Google Calendar...</span>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="py-16 text-center text-slate-500 font-mono text-xs bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
              <CalendarCheck className="h-8 w-8 text-slate-600 mx-auto" />
              <div className="text-slate-300 font-semibold">Nenhuma Diligência Agendada</div>
              <p className="text-slate-500 max-w-sm mx-auto">
                Clique no botão "Agendar Diligência / Audiência" para programar sessões de tribunal ou escoltas penitenciárias.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((ev) => {
                const startDateObj = ev.start?.dateTime ? new Date(ev.start.dateTime) : ev.start?.date ? new Date(ev.start.date) : null;
                const endDateObj = ev.end?.dateTime ? new Date(ev.end.dateTime) : ev.end?.date ? new Date(ev.end.date) : null;

                return (
                  <div
                    key={ev.id}
                    className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 font-mono"
                  >
                    <div className="space-y-2.5">
                      {/* Data / Badge */}
                      <div className="flex items-center justify-between text-[11px] text-blue-400">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {startDateObj
                              ? startDateObj.toLocaleDateString("pt-AO", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric"
                                })
                              : "Sem data"}
                          </span>
                        </div>
                        {startDateObj && ev.start?.dateTime && (
                          <span className="bg-blue-950/80 border border-blue-800/80 px-2 py-0.5 rounded text-[10px] text-blue-300 font-bold">
                            {startDateObj.toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })}
                            {endDateObj && ` - ${endDateObj.toLocaleTimeString("pt-AO", { hour: "2-digit", minute: "2-digit" })}`}
                          </span>
                        )}
                      </div>

                      {/* Título */}
                      <h4 className="text-sm font-bold text-slate-100 leading-snug">
                        {ev.summary || "Diligência Sem Título"}
                      </h4>

                      {/* Localização */}
                      {ev.location && (
                        <div className="flex items-start gap-1.5 text-xs text-slate-400">
                          <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{ev.location}</span>
                        </div>
                      )}

                      {/* Descrição */}
                      {ev.description && (
                        <p className="text-xs text-slate-400/90 line-clamp-3 leading-relaxed bg-slate-950/50 p-2 rounded border border-slate-850">
                          {ev.description}
                        </p>
                      )}

                      {/* Participantes */}
                      {ev.attendees && ev.attendees.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <span>{ev.attendees.length} oficial(is) / intervenientes</span>
                        </div>
                      )}
                    </div>

                    {/* Rodapé do Cartão */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      {ev.htmlLink ? (
                        <a
                          href={ev.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Ver no Google</span>
                        </a>
                      ) : (
                        <span />
                      )}

                      <button
                        onClick={() => setEventToDelete(ev)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                        title="Cancelar / Eliminar Evento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: NOVO EVENTO / DILIGÊNCIA */}
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
                  <CalendarIcon className="h-5 w-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-100 uppercase">
                    Agendar Diligência Penitenciária
                  </h3>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modelos Pré-definidos */}
              <div>
                <label className="block text-slate-400 mb-2 font-semibold text-xs">
                  Modelos de Diligências Oficiais:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PNAP_PRESET_EVENTS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(idx)}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                        selectedPresetIndex === idx
                          ? "bg-blue-950 border-blue-700 text-slate-100"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span className="truncate">{p.category}</span>
                      </div>
                      <div className="text-[11px] text-slate-300 line-clamp-1">{p.summary}</div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Título / Objeto da Diligência:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Audiência de Julgamento - Proc. nº 1092/26"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Data Início:
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Hora Início:
                    </label>
                    <input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Data Fim:
                    </label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Hora Fim:
                    </label>
                    <input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Localização / Tribunal / Sala:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Tribunal de Comarca de Luanda - Sala 02"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Descrição Detalhada / Instruções de Escolta:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detalhes sobre o recluso, grau de perigosidade, magistrado ou peritos convocados..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-600 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">
                    Participantes / Oficiais Convocados (e-mails separados por vírgula):
                  </label>
                  <input
                    type="text"
                    placeholder="oficial.kiala@minint.gov.ao, juiz.sala3@tribunal.ao"
                    value={attendeesStr}
                    onChange={(e) => setAttendeesStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold"
                  >
                    Confirmar Agendamento
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CONFIRMAÇÃO DE CANCELAMENTO / ELIMINAÇÃO */}
      <AnimatePresence>
        {eventToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-mono">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-rose-900/60 rounded-xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="h-6 w-6 shrink-0" />
                <h3 className="text-sm font-bold uppercase">
                  Cancelar Diligência Agendada?
                </h3>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="font-bold text-slate-100">{eventToDelete.summary}</div>
                {eventToDelete.location && (
                  <div className="text-slate-400 text-[11px]">Local: {eventToDelete.location}</div>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Esta ação removerá o evento do Google Calendar e notificará os oficiais convocados sobre o cancelamento.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEventToDelete(null)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 rounded text-xs"
                >
                  Manter Evento
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold"
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
