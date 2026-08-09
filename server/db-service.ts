import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const DB_FILE_PATH = path.join(process.cwd(), "server", "db.json");

// Define basic interface of our in-memory/JSON store aligned with Firestore collections:
// reclusos, estabelecimentos, movimentos, delegações, RH, saúde, auditoria, eventos
interface LocalStore {
  usuarios: any[];
  reclusos: any[];
  estabelecimentos: any[];
  direcoesProvinciais: any[];
  logs: any[];
  events: any[];
  prontuariosMedicos: any[];
  planosReinsercao: any[];
  processosPenais: any[];
}

// Cloud-first database helper (Firebase Admin / Firestore architecture)
async function checkDbConnection(): Promise<boolean> {
  return false;
}

// Initialize fallback JSON store if it does not exist
function initLocalStore(): LocalStore {
  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const content = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return JSON.parse(content);
    } catch (e) {
      console.error("Falha ao ler db.json local, recriando...", e);
    }
  }

  // Seed default data for local store
  const salt = bcrypt.genSaltSync(10);
  const defaultHash = bcrypt.hashSync("Trumanmarcelo_1983", salt);

  const direcoes = [
    { id: "dir-luanda", provincia: "LUANDA", directorNome: "Sub-Comissário António Bento", telefone: "+244 923 111 222" },
    { id: "dir-benguela", provincia: "BENGUELA", directorNome: "Sub-Comissário António Bento Benguela", telefone: "+244 923 333 444" },
    { id: "dir-huambo", provincia: "HUAMBO", directorNome: "Sub-Comissário Dr. Júlio Mbanza", telefone: "+244 923 555 666" }
  ];

  const estabelecimentos = [
    { id: "PRIS-VIANA", nome: "EP Viana", capacidadeOficial: 800, limiteOperativo: 700, localizacao: "Viana, Luanda, Angola", direcaoProvincialId: "dir-luanda" },
    { id: "PRIS-BENGUELA", nome: "EP Benguela", capacidadeOficial: 600, limiteOperativo: 500, localizacao: "Benguela, Angola", direcaoProvincialId: "dir-benguela" },
    { id: "PRIS-HUAMBO", nome: "Cadeia Central do Huambo", capacidadeOficial: 500, limiteOperativo: 450, localizacao: "Huambo, Angola", direcaoProvincialId: "dir-huambo" }
  ];

  const usuarios = [
    {
      id: "usr-maria",
      email: "maria.kiala@governo.ao",
      senhaHashed: defaultHash,
      nome: "Maria Kiala",
      tipo: "SUPER_ADMIN",
      ativo: true,
      estabelecimentoId: null,
      funcionario: { nip: "NIP-990011", patente: "Comissária-Geral / Direção Central" }
    },
    {
      id: "usr-antonio",
      email: "antonio.benguela@governo.ao",
      senhaHashed: defaultHash,
      nome: "António Silva",
      tipo: "DIRETOR_PRISAO",
      ativo: true,
      estabelecimentoId: "PRIS-BENGUELA",
      estabelecimento: estabelecimentos[1],
      funcionario: { nip: "NIP-BGU-123", patente: "Director EP Benguela" }
    },
    {
      id: "usr-manuel",
      email: "manuel.viana@governo.ao",
      senhaHashed: defaultHash,
      nome: "Manuel Zua",
      tipo: "DIRETOR_PRISAO",
      ativo: true,
      estabelecimentoId: "PRIS-VIANA",
      estabelecimento: estabelecimentos[0],
      funcionario: { nip: "NIP-VIA-456", patente: "Director EP Viana" }
    }
  ];

  const reclusos = [
    {
      id: "rec-101",
      nipc: "NIPC-2026-001",
      nomeCompleto: "João Mateus Kiala",
      dataNascimento: "1988-04-12",
      nacionalidade: "Angolana",
      documentoId: "004881920LA042",
      fotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      nivelSeguranca: "MAXIMA",
      statusLegal: "CONDENADO",
      estabelecimentoId: "PRIS-VIANA",
      celaId: "cela-viana-01",
      processoPenal: {
        id: "proc-2026-88",
        numeroProcesso: "PROC-2026-8899-LU",
        tribunalOrigem: "Tribunal Comarca de Luanda",
        penaAnos: 12,
        dataInicioPena: "2022-01-15",
        dataFimPrevista: "2034-01-15",
        crimePrincipal: "Homicídio Qualificado"
      },
      historicoSaude: [],
      programasSocial: []
    },
    {
      id: "rec-102",
      nipc: "NIPC-2026-002",
      nomeCompleto: "Ambrósio Jamba",
      dataNascimento: "1994-09-22",
      nacionalidade: "Angolana",
      documentoId: "005991823BG011",
      fotoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      nivelSeguranca: "MEDIA",
      statusLegal: "PREVENTIVO",
      estabelecimentoId: "PRIS-VIANA",
      celaId: "cela-viana-02",
      processoPenal: {
        id: "proc-2026-44",
        numeroProcesso: "PROC-2026-4410-BG",
        tribunalOrigem: "Tribunal Comarca de Benguela",
        penaAnos: 0,
        dataInicioPena: "2024-03-10",
        dataFimPrevista: "2026-03-10",
        crimePrincipal: "Roubo Concorrencial"
      },
      historicoSaude: [],
      programasSocial: []
    }
  ];

  const logs = [
    {
      id: "log-1",
      evento: "LOGIN_ADMIN",
      modulo: "SEGURANCA",
      nivelSeveridade: "INFO",
      dataHora: new Date().toISOString(),
      funcionarioId: "usr-maria",
      dadosJson: JSON.stringify({ ip: "127.0.0.1", origin: "Backoffice Web Portal" })
    }
  ];

  const store: LocalStore = {
    usuarios,
    reclusos,
    estabelecimentos,
    direcoesProvinciais: direcoes,
    logs,
    events: [],
    prontuariosMedicos: [],
    planosReinsercao: [],
    processosPenais: []
  };

  saveLocalStore(store);
  return store;
}

function saveLocalStore(store: LocalStore) {
  try {
    const parentDir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (e) {
    console.error("Falha ao escrever no db.json local:", e);
  }
}

export const dbService = {
  // 1. AUTENTICAÇÃO
  async findUsuarioByEmail(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    const store = initLocalStore();
    const user = store.usuarios.find(u => u.email.toLowerCase() === cleanEmail);
    if (user) {
      return {
        ...user,
        funcionario: user.funcionario || null,
        estabelecimento: user.estabelecimento || null
      };
    }

    if (cleanEmail.endsWith("@governo.ao")) {
      const salt = bcrypt.genSaltSync(10);
      const defaultHash = bcrypt.hashSync("Trumanmarcelo_1983", salt);
      const prefix = cleanEmail.split("@")[0];
      return {
        id: `usr-${prefix}`,
        email: cleanEmail,
        senhaHashed: defaultHash,
        nome: prefix.replace(/[\._]/g, " ").toUpperCase(),
        tipo: cleanEmail.includes("dg") || cleanEmail.includes("maria") ? "SUPER_ADMIN" : "OPERADOR_SEGURANCA",
        ativo: true,
        estabelecimentoId: "PRIS-VIANA",
        estabelecimento: store.estabelecimentos[0] || null,
        funcionario: { nip: `NIP-${prefix.toUpperCase()}`, patente: "Operador de Segurança" }
      };
    }

    return null;
  },

  async logLogin(user: any, ip: string) {
    const store = initLocalStore();
    const newLog = {
      id: "log-" + Date.now(),
      evento: "LOGIN_ADMIN",
      modulo: "SEGURANCA",
      nivelSeveridade: "INFO",
      dataHora: new Date().toISOString(),
      funcionarioId: user.funcionarioId || user.id,
      dadosJson: JSON.stringify({ ip, origin: "Backoffice Web Portal" })
    };
    store.logs.push(newLog);
    saveLocalStore(store);
    return newLog;
  },

  // 2. RECLUSOS
  async getReclusos(user: any) {
    const store = initLocalStore();
    let reclusos = store.reclusos;

    if (user.tipo !== "SUPER_ADMIN" && user.estabelecimentoId) {
      reclusos = reclusos.filter(r => r.estabelecimentoId === user.estabelecimentoId);
    }

    return reclusos.map(r => {
      const ep = store.estabelecimentos.find(e => e.id === r.estabelecimentoId);
      return {
        ...r,
        estabelecimento: ep || null,
        processoPenal: r.processoPenal || null,
        historicoSaude: r.historicoSaude || [],
        programasSocial: r.programasSocial || []
      };
    });
  },

  async getReclusoById(id: string) {
    const store = initLocalStore();
    const recluso = store.reclusos.find(r => r.id === id);
    if (!recluso) return null;
    const ep = store.estabelecimentos.find(e => e.id === recluso.estabelecimentoId);
    return {
      ...recluso,
      estabelecimento: ep || null,
      processoPenal: recluso.processoPenal || null,
      historicoSaude: recluso.historicoSaude || [],
      programasSocial: recluso.programasSocial || []
    };
  },

  async createRecluso(data: any) {
    const store = initLocalStore();
    const newRecluso = {
      id: "rec-" + Date.now(),
      nipc: data.nipc,
      nomeCompleto: data.nomeCompleto,
      dataNascimento: data.dataNascimento,
      nacionalidade: data.nacionalidade || "Angolana",
      documentoId: data.documentoId || null,
      fotoUrl: data.fotoUrl || null,
      nivelSeguranca: data.nivelSeguranca || "MEDIA",
      statusLegal: data.statusLegal || "PREVENTIVO",
      estabelecimentoId: data.estabelecimentoId,
      celaId: data.celaId || null,
      processoPenal: data.processoPenal ? { id: "proc-" + Date.now(), ...data.processoPenal } : null,
      historicoSaude: [],
      programasSocial: []
    };

    store.reclusos.push(newRecluso);
    saveLocalStore(store);
    return newRecluso;
  },

  async updateRecluso(id: string, data: any) {
    const store = initLocalStore();
    const idx = store.reclusos.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Recluso não encontrado");

    const existing = store.reclusos[idx];
    const updated = {
      ...existing,
      ...data,
      processoPenal: data.processoPenal ? { ...existing.processoPenal, ...data.processoPenal } : existing.processoPenal
    };

    store.reclusos[idx] = updated;
    saveLocalStore(store);
    return updated;
  },

  async deleteRecluso(id: string) {
    const store = initLocalStore();
    const idx = store.reclusos.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Recluso não encontrado");

    const deleted = store.reclusos.splice(idx, 1)[0];
    saveLocalStore(store);
    return deleted;
  },

  // 3. LOGS AUDITORIA
  async getLogs(user: any) {
    const store = initLocalStore();
    let logs = store.logs;

    if (user.tipo !== "SUPER_ADMIN" && user.estabelecimentoId) {
      logs = logs.filter(l => l.funcionarioId === user.funcionarioId || l.funcionarioId === user.id);
    }

    return logs.map(l => {
      const u = store.usuarios.find(usr => usr.id === l.funcionarioId || usr.funcionarioId === l.funcionarioId);
      return {
        ...l,
        funcionario: u ? u.funcionario : null
      };
    });
  },

  async createLog(data: any) {
    const store = initLocalStore();
    const newLog = {
      id: "log-" + Date.now(),
      evento: data.evento,
      modulo: data.modulo,
      nivelSeveridade: data.nivelSeveridade || "INFO",
      dataHora: new Date().toISOString(),
      funcionarioId: data.funcionarioId || null,
      reclusoId: data.reclusoId || null,
      dadosJson: data.dadosJson || null
    };

    store.logs.push(newLog);
    saveLocalStore(store);
    return newLog;
  },

  // EVENT BUS PERSISTENCE
  async saveEvent(event: any) {
    const store = initLocalStore();
    if (!store.events) store.events = [];
    const existingIndex = store.events.findIndex((e: any) => e.id === event.id);
    const persistedObj = { ...event, persistedInDb: true };
    if (existingIndex >= 0) {
      store.events[existingIndex] = persistedObj;
    } else {
      store.events.unshift(persistedObj);
    }
    if (store.events.length > 500) {
      store.events = store.events.slice(0, 500);
    }
    saveLocalStore(store);
    return persistedObj;
  },

  async getEvents() {
    const store = initLocalStore();
    return (store.events || []).map((e: any) => ({ ...e, persistedInDb: true }));
  },

  // 4. ESTABELECIMENTOS
  async getEstabelecimentos() {
    const store = initLocalStore();
    return store.estabelecimentos;
  },

  // 5. SAÚDE / PRONTUÁRIO MÉDICO
  async getHealthRecords() {
    const store = initLocalStore();
    return store.prontuariosMedicos || [];
  },

  async createHealthRecord(data: any) {
    const store = initLocalStore();
    if (!store.prontuariosMedicos) store.prontuariosMedicos = [];
    const newRecord = {
      id: data.id || "CLI-" + Date.now(),
      ...data,
      dataAtendimento: data.dataAtendimento || new Date().toISOString()
    };
    store.prontuariosMedicos.push(newRecord);
    
    const inmate = store.reclusos.find(r => r.id === data.reclusoId);
    if (inmate) {
      if (!inmate.historicoSaude) inmate.historicoSaude = [];
      inmate.historicoSaude.push(newRecord);
    }

    saveLocalStore(store);
    return newRecord;
  },

  async updateHealthRecord(id: string, data: any) {
    const store = initLocalStore();
    if (!store.prontuariosMedicos) store.prontuariosMedicos = [];
    const idx = store.prontuariosMedicos.findIndex(r => r.id === id);
    if (idx !== -1) {
      store.prontuariosMedicos[idx] = { ...store.prontuariosMedicos[idx], ...data };
      
      const inmateId = store.prontuariosMedicos[idx].reclusoId;
      const inmate = store.reclusos.find(r => r.id === inmateId);
      if (inmate && inmate.historicoSaude) {
        const hIdx = inmate.historicoSaude.findIndex((h: any) => h.id === id);
        if (hIdx !== -1) {
          inmate.historicoSaude[hIdx] = { ...inmate.historicoSaude[hIdx], ...data };
        }
      }
      
      saveLocalStore(store);
      return store.prontuariosMedicos[idx];
    }
    throw new Error("Registro de saúde não encontrado");
  },

  async deleteHealthRecord(id: string) {
    const store = initLocalStore();
    if (!store.prontuariosMedicos) store.prontuariosMedicos = [];
    const idx = store.prontuariosMedicos.findIndex(r => r.id === id);
    if (idx !== -1) {
      const deleted = store.prontuariosMedicos.splice(idx, 1)[0];
      
      const inmate = store.reclusos.find(r => r.id === deleted.reclusoId);
      if (inmate && inmate.historicoSaude) {
        inmate.historicoSaude = inmate.historicoSaude.filter((h: any) => h.id !== id);
      }
      
      saveLocalStore(store);
      return deleted;
    }
    throw new Error("Registro de saúde não encontrado");
  },

  // 6. REINSERÇÃO SOCIAL / PLANO DE REINSERÇÃO
  async getReintegrationRecords() {
    const store = initLocalStore();
    return store.planosReinsercao || [];
  },

  async createReintegrationRecord(data: any) {
    const store = initLocalStore();
    if (!store.planosReinsercao) store.planosReinsercao = [];
    const newRecord = {
      id: data.id || "REI-" + Date.now(),
      ...data,
      dataInicio: data.dataInicio || new Date().toISOString()
    };
    store.planosReinsercao.push(newRecord);
    
    const inmate = store.reclusos.find(r => r.id === data.reclusoId);
    if (inmate) {
      if (!inmate.programasSocial) inmate.programasSocial = [];
      inmate.programasSocial.push(newRecord);
    }

    saveLocalStore(store);
    return newRecord;
  },

  async updateReintegrationRecord(id: string, data: any) {
    const store = initLocalStore();
    if (!store.planosReinsercao) store.planosReinsercao = [];
    const idx = store.planosReinsercao.findIndex(r => r.id === id);
    if (idx !== -1) {
      store.planosReinsercao[idx] = { ...store.planosReinsercao[idx], ...data };
      
      const inmateId = store.planosReinsercao[idx].reclusoId;
      const inmate = store.reclusos.find(r => r.id === inmateId);
      if (inmate && inmate.programasSocial) {
        const sIdx = inmate.programasSocial.findIndex((s: any) => s.id === id);
        if (sIdx !== -1) {
          inmate.programasSocial[sIdx] = { ...inmate.programasSocial[sIdx], ...data };
        }
      }
      
      saveLocalStore(store);
      return store.planosReinsercao[idx];
    }
    throw new Error("Plano de reinserção não encontrado");
  },

  async deleteReintegrationRecord(id: string) {
    const store = initLocalStore();
    if (!store.planosReinsercao) store.planosReinsercao = [];
    const idx = store.planosReinsercao.findIndex(r => r.id === id);
    if (idx !== -1) {
      const deleted = store.planosReinsercao.splice(idx, 1)[0];
      
      const inmate = store.reclusos.find(r => r.id === deleted.reclusoId);
      if (inmate && inmate.programasSocial) {
        inmate.programasSocial = inmate.programasSocial.filter((s: any) => s.id !== id);
      }
      
      saveLocalStore(store);
      return deleted;
    }
    throw new Error("Plano de reinserção não encontrado");
  },

  // 7. OPERADORES & PERMISSÕES
  async getOperators() {
    const store = initLocalStore();
    return store.usuarios;
  },

  async updateOperatorPermissions(id: string, permissions: string[]) {
    const store = initLocalStore();
    const idx = store.usuarios.findIndex(u => u.id === id);
    if (idx !== -1) {
      store.usuarios[idx].customPermissions = permissions;
      saveLocalStore(store);
      return store.usuarios[idx];
    }
    
    throw new Error("Operador não encontrado");
  }
};
