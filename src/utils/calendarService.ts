/**
 * PNAP-AO - Serviço de Integração com Google Calendar API v3
 * Agendamento de audiências judiciais, escoltas de reclusos,
 * inspeções preventivas MNCP, visitas familiares e rondas de segurança.
 */

export interface CalendarListItem {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  timeZone?: string;
  backgroundColor?: string;
}

export interface CalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  status?: string;
  htmlLink?: string;
  attendees?: { email: string; displayName?: string; responseStatus?: string }[];
  creator?: { email: string; displayName?: string };
}

export const PNAP_PRESET_EVENTS = [
  {
    summary: "Audiência de Instrução Criminal - Tribunal de Comarca de Luanda",
    description: "Condução e custódia do recluso para sessão com o Juiz de Direito. Escolta armada nível 2 autorizada.",
    location: "Tribunal Provincial / Comarca de Luanda - Sala 03",
    category: "Audiência Judicial",
    durationHours: 3
  },
  {
    summary: "Inspecção Preventiva do Mecanismo Nacional (MNCP)",
    description: "Visita periódica de auditoria às celas disciplinares e bloco sanitário do Estabelecimento de Viana.",
    location: "Estabelecimento Prisional de Viana - Luanda",
    category: "Auditoria & Direitos Humanos",
    durationHours: 4
  },
  {
    summary: "Escolta e Transferência Inter-Provincial de Reclusos",
    description: "Transferência de custódia de reclusos de segurança máxima de Luanda para Baía Farta.",
    location: "Ponto de Saída: Aeroporto Militar / Destino: Benguela",
    category: "Escolta Penitenciária",
    durationHours: 6
  },
  {
    summary: "Junta Médica & Triagem Sanitária Extraordinária",
    description: "Avaliação pericial de reclusos em quarentena preventiva e renovação de laudos clínicos.",
    location: "Posto Clínico Central - Bloco Médico",
    category: "Saúde & Perícia",
    durationHours: 2
  }
];

export const calendarService = {
  /**
   * Lista os calendários acessíveis pelo operador
   */
  async listCalendars(accessToken: string): Promise<CalendarListItem[]> {
    const res = await fetch("https://www.googleapis.com/calendar/v3/users/me/calendarList", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erro ao listar calendários (${res.status})`);
    }

    const data = await res.json();
    return data.items || [];
  },

  /**
   * Lista eventos de um calendário com filtro de tempo
   */
  async listEvents(
    accessToken: string,
    calendarId = "primary",
    options: {
      timeMin?: string;
      timeMax?: string;
      query?: string;
      maxResults?: number;
    } = {}
  ): Promise<CalendarEventItem[]> {
    const { timeMin, timeMax, query, maxResults = 50 } = options;

    const params = new URLSearchParams({
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: maxResults.toString()
    });

    if (timeMin) params.set("timeMin", timeMin);
    if (timeMax) params.set("timeMax", timeMax);
    if (query && query.trim()) params.set("q", query.trim());

    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erro ao listar eventos (${res.status})`);
    }

    const data = await res.json();
    return data.items || [];
  },

  /**
   * Cria um novo evento no Google Calendar
   */
  async createEvent(
    accessToken: string,
    calendarId = "primary",
    eventData: {
      summary: string;
      description?: string;
      location?: string;
      startDateTime: string;
      endDateTime: string;
      attendees?: string[];
    }
  ): Promise<CalendarEventItem> {
    const body: any = {
      summary: eventData.summary,
      description: eventData.description || "Agendamento oficial PNAP-AO",
      location: eventData.location,
      start: {
        dateTime: eventData.startDateTime,
        timeZone: "Africa/Luanda"
      },
      end: {
        dateTime: eventData.endDateTime,
        timeZone: "Africa/Luanda"
      }
    };

    if (eventData.attendees && eventData.attendees.length > 0) {
      body.attendees = eventData.attendees.map(email => ({ email }));
    }

    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erro ao criar evento na agenda (${res.status})`);
    }

    return await res.json();
  },

  /**
   * Elimina um evento do calendário
   */
  async deleteEvent(accessToken: string, calendarId = "primary", eventId: string): Promise<boolean> {
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok && res.status !== 204) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erro ao eliminar evento da agenda (${res.status})`);
    }

    return true;
  }
};
