/**
 * PNAP-AO - Serviço de Integração com a Google Drive API v3
 * Permite gestão documental penitenciária, arquivos de processos judiciais,
 * mandados, autos de captura, relatórios clínicos e cópias de segurança na nuvem institucional.
 */

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  description?: string;
  starred?: boolean;
  trashed?: boolean;
  parents?: string[];
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  owners?: { displayName: string; emailAddress: string; photoLink?: string }[];
  shared?: boolean;
}

export interface DriveStorageQuota {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
  usageInDriveTrash?: string;
}

export interface DriveListResponse {
  files: DriveFileItem[];
  nextPageToken?: string;
  incompleteSearch?: boolean;
}

export const PNAP_PRESET_FOLDERS = [
  { name: "01 - Processos Judiciais & Guias de Execução", desc: "Processos criminais, despachos e sentenças condenatórias" },
  { name: "02 - Mandados de Condução e Soltura", desc: "Mandados judiciais dos tribunais de comarca e relação" },
  { name: "03 - Fichas Biométricas & Registos de Reclusos", desc: "Fotografias de admissão, impressões digitais e dados de filiação" },
  { name: "04 - Autos de Inspecção, Ocorrências & MNCP", desc: "Registos disciplinares, revistas extraordinárias e auditorias MNCP" },
  { name: "05 - Relatórios Sanitários & Perícias Clínicas", desc: "Boletins médicos, quarentenas e encaminhamentos hospitalares" },
  { name: "06 - Diplomas, Decretos & Doutrina CNEL", desc: "Legislação penal angolana, regulamentos internos e circulares" }
];

export const driveService = {
  /**
   * Lista ficheiros e pastas do Google Drive com suporte a paginação e pastas pai
   */
  async listFiles(
    accessToken: string,
    options: {
      folderId?: string | null;
      searchQuery?: string;
      mimeTypeFilter?: string;
      pageSize?: number;
      pageToken?: string;
      orderBy?: string;
      includeTrashed?: boolean;
    } = {}
  ): Promise<DriveListResponse> {
    const {
      folderId,
      searchQuery,
      mimeTypeFilter,
      pageSize = 30,
      pageToken,
      orderBy = "folder,modifiedTime desc",
      includeTrashed = false
    } = options;

    const queryParts: string[] = [];

    // Lixo
    if (!includeTrashed) {
      queryParts.push("trashed = false");
    } else {
      queryParts.push("trashed = true");
    }

    // Pasta atual
    if (folderId && folderId !== "root_all") {
      queryParts.push(`'${folderId}' in parents`);
    }

    // Filtro por texto / busca
    if (searchQuery && searchQuery.trim()) {
      const sanitized = searchQuery.replace(/'/g, "\\'");
      queryParts.push(`(name contains '${sanitized}' or fullText contains '${sanitized}')`);
    }

    // Filtro por tipo MIME
    if (mimeTypeFilter) {
      if (mimeTypeFilter === "folder") {
        queryParts.push("mimeType = 'application/vnd.google-apps.folder'");
      } else if (mimeTypeFilter === "document") {
        queryParts.push("(mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/pdf' or mimeType contains 'word' or mimeType contains 'text')");
      } else if (mimeTypeFilter === "spreadsheet") {
        queryParts.push("(mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType contains 'spreadsheet' or mimeType contains 'excel' or mimeType contains 'csv')");
      } else if (mimeTypeFilter === "image") {
        queryParts.push("mimeType contains 'image/'");
      }
    }

    const q = queryParts.join(" and ");
    const params = new URLSearchParams({
      q,
      pageSize: pageSize.toString(),
      fields: "nextPageToken, incompleteSearch, files(id, name, mimeType, description, starred, trashed, parents, size, createdTime, modifiedTime, webViewLink, webContentLink, iconLink, thumbnailLink, owners, shared)",
      orderBy
    });

    if (pageToken) {
      params.set("pageToken", pageToken);
    }

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Erro ao listar ficheiros da Drive (${response.status})`);
    }

    return await response.json();
  },

  /**
   * Obtém detalhes de um ficheiro específico
   */
  async getFile(accessToken: string, fileId: string): Promise<DriveFileItem> {
    const params = new URLSearchParams({
      fields: "id, name, mimeType, description, starred, trashed, parents, size, createdTime, modifiedTime, webViewLink, webContentLink, iconLink, thumbnailLink, owners, shared"
    });

    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Erro ao obter detalhes do ficheiro (${response.status})`);
    }

    return await response.json();
  },

  /**
   * Cria uma nova pasta no Google Drive
   */
  async createFolder(
    accessToken: string,
    name: string,
    parentFolderId?: string | null,
    description?: string
  ): Promise<DriveFileItem> {
    const metadata: any = {
      name,
      mimeType: "application/vnd.google-apps.folder",
      description: description || "Pasta de arquivo penitenciário PNAP-AO"
    };

    if (parentFolderId && parentFolderId !== "root_all") {
      metadata.parents = [parentFolderId];
    }

    const response = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Erro ao criar pasta no Google Drive (${response.status})`);
    }

    return await response.json();
  },

  /**
   * Upload de ficheiro com metadados (Multipart Upload)
   */
  async uploadFile(
    accessToken: string,
    options: {
      name: string;
      mimeType: string;
      content: string | Blob;
      parentFolderId?: string | null;
      description?: string;
    }
  ): Promise<DriveFileItem> {
    const { name, mimeType, content, parentFolderId, description } = options;

    const metadata: any = {
      name,
      mimeType,
      description: description || "Documento arquivado via PNAP-AO"
    };

    if (parentFolderId && parentFolderId !== "root_all") {
      metadata.parents = [parentFolderId];
    }

    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelimiter = "\r\n--" + boundary + "--";

    let bodyBlob: Blob;

    if (typeof content === "string") {
      const multipartRequestBody =
        delimiter +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        `Content-Type: ${mimeType}\r\n\r\n` +
        content +
        closeDelimiter;

      bodyBlob = new Blob([multipartRequestBody], { type: `multipart/related; boundary=${boundary}` });
    } else {
      // Quando é um Blob / ficheiro carregado pelo utilizador
      const metaBlob = new Blob([
        delimiter +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        `Content-Type: ${mimeType}\r\n\r\n`
      ], { type: "text/plain" });

      const closeBlob = new Blob([closeDelimiter], { type: "text/plain" });
      bodyBlob = new Blob([metaBlob, content, closeBlob], { type: `multipart/related; boundary=${boundary}` });
    }

    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,webContentLink,createdTime", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`
      },
      body: bodyBlob
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Erro ao carregar ficheiro para o Google Drive (${response.status})`);
    }

    return await response.json();
  },

  /**
   * Move um ficheiro para a Lixeira do Google Drive
   */
  async trashFile(accessToken: string, fileId: string): Promise<DriveFileItem> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ trashed: true })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Erro ao mover ficheiro para a lixeira (${response.status})`);
    }

    return await response.json();
  },

  /**
   * Restaura um ficheiro da lixeira
   */
  async restoreFile(accessToken: string, fileId: string): Promise<DriveFileItem> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ trashed: false })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Erro ao restaurar ficheiro (${response.status})`);
    }

    return await response.json();
  },

  /**
   * Elimina um ficheiro permanentemente
   */
  async deletePermanently(accessToken: string, fileId: string): Promise<boolean> {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok && response.status !== 204) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Erro ao eliminar ficheiro permanentemente (${response.status})`);
    }

    return true;
  },

  /**
   * Obtém a quota e uso do armazenamento no Google Drive
   */
  async getStorageQuota(accessToken: string): Promise<DriveStorageQuota> {
    const response = await fetch("https://www.googleapis.com/drive/v3/about?fields=storageQuota,user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || "Erro ao consultar quota do Google Drive");
    }

    const data = await response.json();
    return data.storageQuota || {};
  }
};

/**
 * Formata o tamanho do ficheiro para leitura humana (ex: 2.4 MB)
 */
export function formatBytes(bytesStr?: string | number, decimals = 1): string {
  if (!bytesStr) return "—";
  const bytes = typeof bytesStr === "string" ? parseInt(bytesStr, 10) : bytesStr;
  if (isNaN(bytes) || bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
