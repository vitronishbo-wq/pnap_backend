/**
 * PNAP-AO - Serviço de Integração com a API do Gmail
 * Executa chamadas REST autenticadas com Bearer token obtido via Firebase OAuth
 */
import { getAccessToken } from "./googleAuth";

export interface GmailMessageHeader {
  name: string;
  value: string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  labelIds: string[];
  isUnread: boolean;
  hasAttachment?: boolean;
}

export interface GmailMessageDetail extends GmailMessageSummary {
  bodyText: string;
  bodyHtml?: string;
  internalDate: string;
}

export interface GmailLabel {
  id: string;
  name: string;
  type: string;
  messagesTotal?: number;
  messagesUnread?: number;
}

/**
 * Utilitário para descodificação segura de strings Base64URL do Gmail
 */
function decodeBase64Url(base64Url: string): string {
  try {
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder("utf-8").decode(bytes);
  } catch (e) {
    console.warn("Falha ao decodificar Base64URL:", e);
    return "";
  }
}

/**
 * Utilitário para codificar em Base64URL para envio de e-mails RFC 2822
 */
function encodeBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Constrói uma mensagem MIME simples em formato RFC 2822
 */
function buildMimeMessage(to: string, subject: string, body: string, isHtml: boolean = false): string {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const contentType = isHtml ? "text/html; charset=UTF-8" : "text/plain; charset=UTF-8";
  
  const messageParts = [
    `To: ${to}`,
    "Content-Type: " + contentType,
    "MIME-Version: 1.0",
    `Subject: ${utf8Subject}`,
    "",
    body
  ];
  return messageParts.join("\r\n");
}

export const gmailService = {
  /**
   * Lista mensagens da caixa de correio com suporte a pesquisa e paginação
   */
  async listMessages(options?: {
    query?: string;
    labelIds?: string[];
    maxResults?: number;
    pageToken?: string;
  }): Promise<{ messages: GmailMessageSummary[]; nextPageToken?: string }> {
    const token = await getAccessToken();
    if (!token) {
      throw new Error("Sessão Google não autenticada ou token expirado. Por favor, conecte a sua conta institucional.");
    }

    const params = new URLSearchParams();
    if (options?.query) params.append("q", options.query);
    if (options?.maxResults) params.append("maxResults", String(options.maxResults));
    if (options?.pageToken) params.append("pageToken", options.pageToken);
    if (options?.labelIds) {
      options.labelIds.forEach(lbl => params.append("labelIds", lbl));
    }

    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Erro na API do Gmail (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    const messageList: { id: string; threadId: string }[] = data.messages || [];

    // Carregar os metadados resumidos das mensagens em paralelo (limitado a 25)
    const summaries = await Promise.all(
      messageList.slice(0, 25).map(async (item) => {
        try {
          return await gmailService.getMessageSummary(item.id);
        } catch (e) {
          return {
            id: item.id,
            threadId: item.threadId,
            snippet: "Não foi possível carregar o resumo",
            subject: "(Sem assunto)",
            from: "Desconhecido",
            to: "",
            date: new Date().toISOString(),
            labelIds: [],
            isUnread: false
          };
        }
      })
    );

    return {
      messages: summaries,
      nextPageToken: data.nextPageToken
    };
  },

  /**
   * Obtém o resumo dos cabeçalhos de uma mensagem
   */
  async getMessageSummary(id: string): Promise<GmailMessageSummary> {
    const token = await getAccessToken();
    if (!token) throw new Error("Não autenticado");

    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Date`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Falha ao obter mensagem ${id}`);
    }

    const data = await response.json();
    const headers: GmailMessageHeader[] = data.payload?.headers || [];
    
    const subject = headers.find(h => h.name.toLowerCase() === "subject")?.value || "(Sem assunto)";
    const from = headers.find(h => h.name.toLowerCase() === "from")?.value || "Remetente desconhecido";
    const to = headers.find(h => h.name.toLowerCase() === "to")?.value || "";
    const date = headers.find(h => h.name.toLowerCase() === "date")?.value || new Date().toISOString();
    const labelIds: string[] = data.labelIds || [];
    const isUnread = labelIds.includes("UNREAD");

    return {
      id: data.id,
      threadId: data.threadId,
      snippet: data.snippet || "",
      subject,
      from,
      to,
      date,
      labelIds,
      isUnread
    };
  },

  /**
   * Obtém o conteúdo completo de uma mensagem (texto e corpo HTML)
   */
  async getMessageDetail(id: string): Promise<GmailMessageDetail> {
    const token = await getAccessToken();
    if (!token) throw new Error("Não autenticado");

    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Falha ao obter detalhe da mensagem ${id}`);
    }

    const data = await response.json();
    const headers: GmailMessageHeader[] = data.payload?.headers || [];
    
    const subject = headers.find(h => h.name.toLowerCase() === "subject")?.value || "(Sem assunto)";
    const from = headers.find(h => h.name.toLowerCase() === "from")?.value || "Remetente desconhecido";
    const to = headers.find(h => h.name.toLowerCase() === "to")?.value || "";
    const date = headers.find(h => h.name.toLowerCase() === "date")?.value || new Date().toISOString();
    const labelIds: string[] = data.labelIds || [];
    const isUnread = labelIds.includes("UNREAD");

    let bodyText = "";
    let bodyHtml = "";

    const extractBody = (part: any) => {
      if (part.mimeType === "text/plain" && part.body?.data) {
        bodyText += decodeBase64Url(part.body.data) + "\n";
      } else if (part.mimeType === "text/html" && part.body?.data) {
        bodyHtml += decodeBase64Url(part.body.data);
      }
      if (part.parts && Array.isArray(part.parts)) {
        part.parts.forEach(extractBody);
      }
    };

    if (data.payload) {
      if (data.payload.body?.data) {
        if (data.payload.mimeType === "text/html") {
          bodyHtml = decodeBase64Url(data.payload.body.data);
        } else {
          bodyText = decodeBase64Url(data.payload.body.data);
        }
      }
      if (data.payload.parts) {
        data.payload.parts.forEach(extractBody);
      }
    }

    return {
      id: data.id,
      threadId: data.threadId,
      snippet: data.snippet || "",
      subject,
      from,
      to,
      date,
      labelIds,
      isUnread,
      bodyText: bodyText.trim() || data.snippet || "(Sem conteúdo em texto puro)",
      bodyHtml: bodyHtml.trim() || undefined,
      internalDate: data.internalDate || ""
    };
  },

  /**
   * Envia um novo e-mail através da API do Gmail
   * [NOTA]: Exige confirmação prévia explícita na interface antes da execução
   */
  async sendEmail(payload: {
    to: string;
    subject: string;
    body: string;
    isHtml?: boolean;
  }): Promise<{ id: string; threadId: string }> {
    const token = await getAccessToken();
    if (!token) {
      throw new Error("Token de autorização ausente. Faça login com o Google.");
    }

    const mimeMessage = buildMimeMessage(payload.to, payload.subject, payload.body, payload.isHtml);
    const raw = encodeBase64Url(mimeMessage);

    const url = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ raw })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Falha ao enviar e-mail (${response.status}): ${errBody}`);
    }

    return await response.json();
  },

  /**
   * Cria um rascunho de e-mail no Gmail
   */
  async createDraft(payload: {
    to: string;
    subject: string;
    body: string;
  }): Promise<{ id: string }> {
    const token = await getAccessToken();
    if (!token) throw new Error("Não autenticado");

    const mimeMessage = buildMimeMessage(payload.to, payload.subject, payload.body, false);
    const raw = encodeBase64Url(mimeMessage);

    const url = "https://gmail.googleapis.com/gmail/v1/users/me/drafts";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: { raw } })
    });

    if (!response.ok) {
      throw new Error(`Falha ao criar rascunho: ${await response.text()}`);
    }

    return await response.json();
  },

  /**
   * Move uma mensagem para a lixeira do Gmail
   * [NOTA]: Exige confirmação prévia explícita na interface antes da execução
   */
  async trashMessage(id: string): Promise<void> {
    const token = await getAccessToken();
    if (!token) throw new Error("Não autenticado");

    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Falha ao mover mensagem para a lixeira: ${await response.text()}`);
    }
  },

  /**
   * Lista os marcadores / pastas disponíveis
   */
  async listLabels(): Promise<GmailLabel[]> {
    const token = await getAccessToken();
    if (!token) throw new Error("Não autenticado");

    const url = "https://gmail.googleapis.com/gmail/v1/users/me/labels";
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error(`Falha ao listar marcadores: ${await response.text()}`);
    }

    const data = await response.json();
    return data.labels || [];
  }
};

/**
 * Modelos Oficiais Institucionais para o PNAP-AO
 */
export const PNAP_EMAIL_TEMPLATES = [
  {
    id: "notificacao_transferencia",
    title: "Ordem de Transferência de Recluso",
    subject: "[PNAP-AO] Comunicação Oficial - Guia de Transferência Penitenciária",
    to: "direccao.nacional@minint.gov.ao",
    body: `MINISTÉRIO DO INTERIOR
SERVIÇO PENITENCIÁRIO NACIONAL (SICP-AO)
DIRECÇÃO DE SEGURANÇA E CUSTÓDIA

Assunto: Guia de Transferência e Escolta Penitenciária
Data: ${new Date().toLocaleDateString("pt-AO")}

Exmo.(a) Senhor(a) Director(a),

Pelo presente expediente, comunica-se a homologação da Ordem de Transferência do Recluso abaixo qualificado:

• Nome Completo: [Nome do Recluso]
• NREP Biométrico: AO-REC-[Código]
• Estabelecimento de Origem: EP Viana (Luanda)
• Estabelecimento de Destino: Cadeia Central do Huambo
• Fundamentação: Descongestionamento e Manutenção da Ordem Penitenciária
• Escolta Autorizada: Pelotão de Intervenção Rápida (PIR/MININT)

Solicita-se a tomada das devidas providências logísticas e de segurança para a recepção do recluso.

Com os melhores cumprimentos institucionais,

Direcção Geral do Serviço Penitenciário de Angola
Sistema Integrado PNAP-AO`
  },
  {
    id: "alvara_soltura",
    title: "Notificação de Cumprimento de Alvará de Soltura",
    subject: "[PNAP-AO / MININT] Cumprimento de Mandado de Soltura Homologado",
    to: "tribunal.comarca@tribunais.gov.ao",
    body: `REPÚBLICA DE ANGOLA
MINISTÉRIO DO INTERIOR
SERVIÇO PENITENCIÁRIO NACIONAL

Para: Cartório da Vara Criminal / Tribunal de Comarca
Assunto: Comunicação de Efectivação de Soltura

Data: ${new Date().toLocaleDateString("pt-AO")}

Excelentíssimo(a) Juiz(a) de Direito,

Em cumprimento ao Mandado de Soltura / Alvará com referência ao Processo-Crime Nº [Número do Processo], informamos que foi efectivada a desincompatibilização e soltura do recluso:

• Nome: [Nome Completo]
• NREP: AO-REC-[Código]
• Data da Soltura Efectiva: ${new Date().toLocaleDateString("pt-AO")}
• Registo Biométrico Validado no Sistema PNAP-AO

O dossier individual do cidadão foi devidamente atualizado no Sistema Central do Serviço Penitenciário.

Respeitosamente,

O Director do Estabelecimento Penitenciário
PNAP-AO • Ministério do Interior`
  },
  {
    id: "oficio_admissao",
    title: "Comunicação de Admissão e Matrícula Prisional",
    subject: "[PNAP-AO] Comunicação de Ingresso e Matrícula Penitenciária",
    to: "gabinete.estatistica@minint.gov.ao",
    body: `MINISTÉRIO DO INTERIOR
SERVIÇO PENITENCIÁRIO NACIONAL
DIRECÇÃO DE RECURSOS PENITENCIÁRIOS E CADASTRO

Assunto: Registo de Nova Admissão Penitenciária
Data: ${new Date().toLocaleDateString("pt-AO")}

Comunica-se o ingresso regular e homologação da matrícula penitenciária do recluso no sistema central:

• Identificação: [Nome do Recluso]
• Matrícula NREP: AO-REC-[Código]
• Regime Aplicado: Fechado / Segurança Reforçada
• Província: Luanda / EP Viana

Os dados biométricos e dossier sanitário foram registados no barramento central em conformidade com o Decreto Executivo n.º 272/16.

Gabinete de Expediente e Controlo Penal
PNAP-AO`
  }
];
