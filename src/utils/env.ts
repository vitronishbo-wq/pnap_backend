/**
 * PNAP-AO - Configuração centralizada e segura de Variáveis de Ambiente Client-Side (Vite)
 */

export const getClientEnv = () => {
  const metaEnv = (import.meta as any).env || {};
  return {
    API_URL: (metaEnv.VITE_API_URL as string) || "",
    FIREBASE: {
      PROJECT_ID: (metaEnv.VITE_FIREBASE_PROJECT_ID as string) || "pnap-ao",
      STORAGE_BUCKET: (metaEnv.VITE_FIREBASE_STORAGE_BUCKET as string) || "pnap-ao.firebasestorage.app",
      API_KEY: (metaEnv.VITE_FIREBASE_API_KEY as string) || "",
      APP_ID: (metaEnv.VITE_FIREBASE_APP_ID as string) || "",
      AUTH_DOMAIN: (metaEnv.VITE_FIREBASE_AUTH_DOMAIN as string) || "pnap-ao.firebaseapp.com",
      MEASUREMENT_ID: (metaEnv.VITE_FIREBASE_MEASUREMENT_ID as string) || "",
      MESSAGING_SENDER_ID: (metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || "",
    }
  };
};

export const env = getClientEnv();
