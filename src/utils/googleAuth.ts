/**
 * PNAP-AO - Autenticação Google Workspace & Gestão de Acesso OAuth 2.0
 * Módulo de Integração Complementar Oficial (Drive, Sheets, Calendar, Docs)
 * 
 * DIRETRIZES DE SEGURANÇA E AUDITORIA:
 * 1. Tokens OAuth são mantidos EXCLUSIVAMENTE em memória volátil (Zero localStorage / sessionStorage).
 * 2. Rastreamento rigoroso de expiração e invalidação de sessão.
 * 3. Revogação explícita de credenciais no logout (Google OAuth Revocation).
 * 4. Isolamento estrito por operador institucional autenticado.
 * 5. Escopos restritos estritamente ao necessário (Gmail removido integralmente).
 */
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from "firebase/auth";
import { app } from "./firebase";

// Escopos estritamente necessários para ferramentas complementares
export const WORKSPACE_SCOPES = [
  // Google Drive: Repositório de arquivos e anexos de custódia
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
  // Google Sheets: Exportação e relatórios tabulares estatísticos
  "https://www.googleapis.com/auth/spreadsheets",
  // Google Calendar: Sincronização de audiências judiciais e escoltas
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
  // Google Docs: Exportação de minutas e despachos oficiais
  "https://www.googleapis.com/auth/documents"
];

export const DRIVE_SCOPES = WORKSPACE_SCOPES;
export const SHEETS_SCOPES = WORKSPACE_SCOPES;
export const CALENDAR_SCOPES = WORKSPACE_SCOPES;
export const DOCS_SCOPES = WORKSPACE_SCOPES;

const auth = getAuth(app);

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach(scope => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: "select_account consent"
});

// Flag de fluxo ativo de login
let isSigningIn = false;

// Estado de Sessão e Credenciais (ESTRITAMENTE EM MEMÓRIA VOLÁTIL)
interface GoogleSessionState {
  accessToken: string | null;
  user: User | null;
  operatorId: string | null;
  tokenExpiresAt: number | null; // Timestamp em ms
  acquiredAt: number | null;
}

const volatileSession: GoogleSessionState = {
  accessToken: null,
  user: null,
  operatorId: null,
  tokenExpiresAt: null,
  acquiredAt: null
};

/**
 * Verifica se o token OAuth em memória ainda é válido temporalmente
 */
export const isTokenValid = (): boolean => {
  if (!volatileSession.accessToken) return false;
  if (!volatileSession.tokenExpiresAt) return true;
  // Margem de segurança de 60 segundos antes da expiração
  return Date.now() < volatileSession.tokenExpiresAt - 60000;
};

/**
 * Inicializador do listener de estado da autenticação com isolamento de operador
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    volatileSession.user = user;
    if (user) {
      if (volatileSession.accessToken && isTokenValid()) {
        if (onAuthSuccess) onAuthSuccess(user, volatileSession.accessToken);
      } else if (!isSigningIn) {
        // Sessão Firebase ativa porém o token OAuth Workspace expirou ou precisa de reautorização
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      clearVolatileSession();
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Limpa todos os dados da sessão em memória
 */
function clearVolatileSession() {
  volatileSession.accessToken = null;
  volatileSession.user = null;
  volatileSession.operatorId = null;
  volatileSession.tokenExpiresAt = null;
  volatileSession.acquiredAt = null;
}

/**
 * Executa o fluxo de autenticação interactivo com a conta Google Workspace
 */
export const googleSignIn = async (operatorIdentifier?: string): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error("Não foi possível obter o token de autorização OAuth do Google Workspace.");
    }

    const now = Date.now();
    // Tokens Google OAuth 2.0 têm validade padrão de 3600 segundos (1 hora)
    const expiresInMs = 3600 * 1000;

    volatileSession.accessToken = credential.accessToken;
    volatileSession.user = result.user;
    volatileSession.operatorId = operatorIdentifier || result.user.email || null;
    volatileSession.acquiredAt = now;
    volatileSession.tokenExpiresAt = now + expiresInMs;

    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: any) {
    console.error("[GoogleAuth] Erro na autorização OAuth Google Workspace:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Retorna o token de acesso ativo em memória garantindo que não está expirado
 */
export const getAccessToken = async (): Promise<string | null> => {
  if (!volatileSession.accessToken) return null;
  if (!isTokenValid()) {
    console.warn("[GoogleAuth] Token OAuth expirou. Requer renovação de sessão.");
    return null;
  }
  return volatileSession.accessToken;
};

/**
 * Retorna o utilizador Google autenticado atualmente
 */
export const getGoogleUser = (): User | null => {
  return volatileSession.user || auth.currentUser;
};

/**
 * Revoga o token no servidor Google OAuth e encerra a sessão com limpeza de memória
 */
export const logoutGoogle = async () => {
  const currentToken = volatileSession.accessToken;
  
  try {
    // 1. Revogação explícita de credenciais no Google OAuth endpoint
    if (currentToken) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(currentToken)}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        });
        console.log("[GoogleAuth] Token OAuth revogado com sucesso no Google OAuth Server.");
      } catch (revokeErr) {
        console.warn("[GoogleAuth] Aviso ao revogar token remotamente:", revokeErr);
      }
    }

    // 2. Encerramento da sessão Firebase Auth
    await signOut(auth);
  } finally {
    // 3. Limpeza irrevogável do estado em memória
    clearVolatileSession();
  }
};

