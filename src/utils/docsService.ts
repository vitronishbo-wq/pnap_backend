/**
 * PNAP-AO - Serviço de Integração com Google Docs API v1
 * Redação de autos de notícia, mandados, notificações aos tribunais,
 * despachos de execução penal e circulares ministeriais.
 */

export interface GoogleDocInfo {
  documentId: string;
  title: string;
  body?: {
    content: {
      paragraph?: {
        elements: {
          textRun?: {
            content: string;
          };
        }[];
      };
    }[];
  };
  revisionId?: string;
}

export const PNAP_PRESET_DOCS = [
  {
    title: "PNAP - Auto de Notificação Judicial e Condução Penal",
    category: "Notificação Judicial",
    content: `REPÚBLICA DE ANGOLA
MINISTÉRIO DO INTERIOR
DIRECÇÃO GERAL DOS SERVIÇOS PENITENCIÁRIOS
SISTEMA INTEGRADO PNAP-AO

AUTO DE NOTIFICAÇÃO E CUMPRIMENTO DE MANDADO JUDICIAL

Aos vinte dias do mês de Agosto de dois mil e vinte e seis, nesta cidade de Luanda, no Estabelecimento Prisional Central, perante o Oficial de Diligências infra-assinado, procedeu-se à notificação formal e registo de custódia do cidadão recluso.

I. IDENTIFICAÇÃO DO PROCESSO:
- Número do Processo: Proc. Crime nº 4502/2026-B
- Juízo / Tribunal: 2ª Secção da Sala dos Crimes Comuns do Tribunal da Comarca de Luanda
- Magistrado Titular: Meritíssimo Juiz de Direito

II. TEOR DO DESPACHO:
Fica o cidadão recluso formalmente notificado da decisão proferida nos autos supra referidos, tendo-lhe sido entregue cópia integral do despacho judicial e informado dos prazos legais para interposição de recurso nos termos do Código de Processo Penal Angolano.

III. ENCERRAMENTO E ASSINATURAS:
Para constar, lavrou-se o presente Auto de Notificação que vai devidamente assinado e registado no livro de termos da Direcção do Estabelecimento.

[OPERADOR PNAP-AO RESPONSÁVEL]
Assinatura Digital Validada pela Infraestrutura Penitenciária Nacional`
  },
  {
    title: "PNAP - Relatório Circunstanciado de Inspecção Disciplinar",
    category: "Inspeção Disciplinar",
    content: `REPÚBLICA DE ANGOLA - MINISTÉRIO DO INTERIOR
COMISSÃO DISCIPLINAR PENITENCIÁRIA NACIONAL

RELATÓRIO CIRCUNSTANCIADO DE OCORRÊNCIA E SEGURANÇA

1. IDENTIFICAÇÃO DO ESTABELECIMENTO:
- Estabelecimento Prisional de Viana - Província de Luanda
- Data e Hora da Ocorrência: 20/08/2026 - 06:45

2. DESCRIÇÃO FACTUAL:
Durante a revista extraordinária ao Bloco de Alta Segurança Cela 04, a equipa de guardas prisionais de serviço detectou anomalias nas grelhas de ventilação. Foram imediatamente accionados os protocolos de reforço de perímetro e contenção física.

3. MEDIDAS CAUTELARES ADOPTADAS:
- Isolamento preventivo dos reclusos da referida camarata;
- Abertura de inquérito disciplinar sumário nos termos do Regulamento dos Serviços Prisionais;
- Comunicação imediata ao Centro de Comando Central e ao Ministério Público.

4. CONCLUSÃO E PARECER:
Propõe-se a manutenção do nível de alerta 2 até à conclusão dos trabalhos de serralharia e vistoria integral pela equipa de manutenção técnica.`
  },
  {
    title: "PNAP - Parecer Técnico de Proposta de Liberdade Condicional",
    category: "Execução Penal",
    content: `REPÚBLICA DE ANGOLA
SERVIÇOS DE EXECUÇÃO PENAL E REINSERÇÃO SOCIAL - PNAP-AO

PARECER TÉCNICO SOBRE CONCESSÃO DE LIBERDADE CONDICIONAL

Exmo. Senhor Juiz de Execução das Penas da Comarca de Luanda,

Em cumprimento ao disposto na Lei de Execução de Penas e Medidas Privativas da Liberdade, emite-se o presente parecer técnico relativo à avaliação comportamental e criminológica do recluso.

I. DADOS DE CONDENAÇÃO:
- Pena Aplicada: 6 (seis) anos de prisão maior
- Tempo de Pena Cumprido: 4 (quatro) anos (mais de 2/3 da pena cumprida)
- Registo de Comportamento Prisional: BOM (Sem faltas disciplinares graves nos últimos 24 meses)

II. AVALIAÇÃO PSICOSSOCIAL E LABORAL:
O recluso participou ativamente nos programas de formação profissional (Oficina de Carpintaria) e concluiu os módulos de alfabetização e reinserção comunitária com aproveitamento distinto.

III. PARECER CONCLUSIVO:
Esta Direcção Técnica emite parecer FAVORÁVEL à concessão da Liberdade Condicional, sob termo de identidade e residência e sujeição às regras de conduta estabelecidas por esse douto Tribunal.`
  }
];

export const docsService = {
  /**
   * Lista documentos existentes no Google Drive
   */
  async listDocs(accessToken: string, pageSize = 20): Promise<{ id: string; name: string; modifiedTime?: string; webViewLink?: string }[]> {
    const q = "mimeType = 'application/vnd.google-apps.document' and trashed = false";
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
      throw new Error(err?.error?.message || `Erro ao listar documentos (${res.status})`);
    }

    const data = await res.json();
    return data.files || [];
  },

  /**
   * Obtém metadados e conteúdo estruturado de um documento
   */
  async getDocument(accessToken: string, documentId: string): Promise<GoogleDocInfo> {
    const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erro ao carregar documento (${res.status})`);
    }

    return await res.json();
  },

  /**
   * Cria um novo documento no Google Docs e insere o texto inicial
   */
  async createDocument(
    accessToken: string,
    title: string,
    initialContent?: string
  ): Promise<GoogleDocInfo> {
    // 1. Cria o documento vazio
    const res = await fetch("https://docs.googleapis.com/v1/documents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: title || "Novo Documento PNAP-AO"
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erro ao criar documento Google Docs (${res.status})`);
    }

    const created: GoogleDocInfo = await res.json();

    // 2. Se houver texto inicial, insere via batchUpdate
    if (initialContent && created.documentId) {
      await this.insertText(accessToken, created.documentId, initialContent, 1);
    }

    return created;
  },

  /**
   * Insere texto em um documento existente
   */
  async insertText(
    accessToken: string,
    documentId: string,
    text: string,
    index = 1
  ): Promise<any> {
    const res = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: {
                index
              },
              text
            }
          }
        ]
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erro ao inserir texto no documento (${res.status})`);
    }

    return await res.json();
  },

  /**
   * Extrai texto simples de um documento do Google Docs
   */
  extractPlainText(doc: GoogleDocInfo): string {
    if (!doc.body?.content) return "";
    let fullText = "";
    for (const elem of doc.body.content) {
      if (elem.paragraph?.elements) {
        for (const pe of elem.paragraph.elements) {
          if (pe.textRun?.content) {
            fullText += pe.textRun.content;
          }
        }
      }
    }
    return fullText;
  }
};
