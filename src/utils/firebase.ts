/**
 * PNAP - Configuração do Cliente Firebase & Cloud Firestore
 * Fonte de Dados Operacional Oficial e Persistência Offline (IndexedDB)
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Inicializa a instância do Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicializa Firestore com persistência offline multi-tab (IndexedDB)
let db: ReturnType<typeof getFirestore>;
try {
  const dbId = (firebaseConfig as any).firestoreDatabaseId || "(default)";
  db = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    },
    dbId === "(default)" ? undefined : dbId
  );
} catch (e) {
  // Caso já tenha sido inicializado
  const dbId = (firebaseConfig as any).firestoreDatabaseId || "(default)";
  db = getFirestore(app, dbId === "(default)" ? undefined : dbId);
}

export { 
  app, 
  db,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch
};

// Coleções canónicas oficiais do PNAP-AO
export const COLLECTIONS = {
  RECLUSOS: "reclusos",
  ESTABELECIMENTOS: "estabelecimentos",
  AUDITORIA_LOGS: "auditoria_logs",
  PRONTUARIOS_SAUDE: "prontuarios_saude",
  PLANOS_REINSERCAO: "planos_reinsercao",
  EVENTOS_BARRAMENTO: "eventos_barramento",
  OPERADORES: "operadores",
  CONFIG_CLUSTER: "config_cluster"
} as const;
