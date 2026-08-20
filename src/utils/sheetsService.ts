/**
 * PNAP-AO - Serviço de Integração com Google Sheets API v4
 * Gestão de tabelas estatísticas, censo penitenciário, controle de lotação
 * e mapas de execução penal em tempo real.
 */

export interface SheetMetadata {
  sheetId: number;
  title: string;
  index: number;
  sheetType: string;
  gridProperties?: {
    rowCount: number;
    columnCount: number;
  };
}

export interface SpreadsheetInfo {
  spreadsheetId: string;
  properties: {
    title: string;
    locale?: string;
    timeZone?: string;
  };
  sheets: {
    properties: SheetMetadata;
  }[];
  spreadsheetUrl?: string;
}

export interface ValueRangeResponse {
  range: string;
  majorDimension: string;
  values: string[][];
}

export const PNAP_PRESET_SHEETS = [
  {
    title: "PNAP - Censo e Lotação Penitenciária Nacional 2026",
    headers: ["Código Estabelecimento", "Província", "Capacidade Projetada", "População Atual", "Taxa Ocupação (%)", "Nível de Risco", "Responsável Custódia"],
    initialData: [
      ["AO-EST-01", "Luanda (Viana)", "1500", "2140", "142.6%", "ELEVADO", "Inspetor-Chefe Kiala"],
      ["AO-EST-02", "Benguela (Baía Farta)", "800", "790", "98.7%", "MÉDIO", "Sub-Inspetor Kassoma"],
      ["AO-EST-03", "Huíla (Lubango)", "600", "580", "96.6%", "NORMAL", "Comissário Afonso"],
      ["AO-EST-04", "Cabinda (Cabassango)", "450", "410", "91.1%", "NORMAL", "Sub-Inspetor Buanga"],
      ["AO-EST-05", "Huambo (Comarca)", "700", "890", "127.1%", "ELEVADO", "Superintendente Damião"]
    ]
  },
  {
    title: "PNAP - Registo Diário de Movimentações & Escoltas",
    headers: ["Data/Hora", "ID Recluso", "Nome Completo", "Origem", "Destino", "Motivo da Escolta", "Oficial Responsável", "Estado"],
    initialData: [
      ["2026-08-20 08:30", "AO-REC-9081", "Manuel Domingos", "Viana", "Tribunal Comarca Luanda", "Audiência de Julgamento", "Oficial Banza", "Concluído"],
      ["2026-08-20 10:15", "AO-REC-4412", "António Sebastião", "Cabassango", "Hospital Geral Cabinda", "Emergência Médica", "Oficial Kitembo", "Em Trânsito"],
      ["2026-08-20 11:00", "AO-REC-1129", "Joaquim Pedro", "Baía Farta", "Viana", "Transferência Preventiva", "Oficial Kassoma", "Agendado"]
    ]
  },
  {
    title: "PNAP - Mapa de Avaliação Sanitária & Quarentenas",
    headers: ["Recluso ID", "Nome", "Data Entrada", "Diagnóstico Triagem", "Estado Quarentena", "Última Medição", "Parecer Médico"],
    initialData: [
      ["AO-REC-9081", "Manuel Domingos", "2026-08-15", "Apto Geral", "Liberado", "36.5 °C", "Sem patologias ativas"],
      ["AO-REC-4412", "António Sebastião", "2026-08-18", "Febre Aguda", "Isolamento Ala C", "38.9 °C", "Acompanhamento diário"]
    ]
  }
];

export const sheetsService = {
  /**
   * Lista planilhas existentes no Google Drive
   */
  async listSpreadsheets(accessToken: string, pageSize = 20): Promise<{ id: string; name: string; modifiedTime?: string; webViewLink?: string }[]> {
    const q = "mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false";
    const params = new URLSearchParams({
      q,
      pageSize: pageSize.toString(),
      fields: "files(id, name, modifiedTime, webViewLink)",
      orderBy: "modifiedTime desc"
    });

    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erro ao listar planilhas (${res.status})`);
    }

    const data = await res.json();
    return data.files || [];
  },

  /**
   * Obtém metadados da planilha (título e lista de abas/sheets)
   */
  async getSpreadsheet(accessToken: string, spreadsheetId: string): Promise<SpreadsheetInfo> {
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties,sheets.properties,spreadsheetUrl`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erro ao carregar metadados da planilha (${res.status})`);
    }

    return await res.json();
  },

  /**
   * Lê valores de um intervalo de células
   */
  async getValues(accessToken: string, spreadsheetId: string, range: string): Promise<ValueRangeResponse> {
    const encodedRange = encodeURIComponent(range);
    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erro ao ler células da planilha (${res.status})`);
    }

    return await res.json();
  },

  /**
   * Adiciona linhas (append) ao final de uma folha
   */
  async appendValues(
    accessToken: string,
    spreadsheetId: string,
    range: string,
    values: string[][]
  ): Promise<any> {
    const encodedRange = encodeURIComponent(range);
    const params = new URLSearchParams({
      valueInputOption: "USER_ENTERED"
    });

    const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:append?${params.toString()}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        values
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erro ao adicionar dados à planilha (${res.status})`);
    }

    return await res.json();
  },

  /**
   * Cria uma nova planilha no Google Sheets com títulos e dados iniciais
   */
  async createSpreadsheet(
    accessToken: string,
    title: string,
    initialHeaders?: string[],
    initialRows?: string[][]
  ): Promise<SpreadsheetInfo> {
    const body: any = {
      properties: {
        title: title || "Nova Planilha PNAP-AO"
      }
    };

    const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erro ao criar planilha Google Sheets (${res.status})`);
    }

    const created: SpreadsheetInfo = await res.json();

    // Se temos cabeçalhos ou dados, insere na primeira aba
    if (created.spreadsheetId && initialHeaders && initialHeaders.length > 0) {
      const allRows = [initialHeaders, ...(initialRows || [])];
      const firstSheetTitle = created.sheets?.[0]?.properties?.title || "Sheet1";
      await this.appendValues(accessToken, created.spreadsheetId, `${firstSheetTitle}!A1`, allRows);
    }

    return created;
  }
};
