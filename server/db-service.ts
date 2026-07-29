import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Initialize Prisma
const prisma = new PrismaClient();

const DB_FILE_PATH = path.join(process.cwd(), "server", "db.json");

// Define basic interface of our in-memory/JSON store
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

let isPrismaConnected = false;
let checkDone = false;

// Helper to check if database connection is available
async function checkDbConnection(): Promise<boolean> {
  if (checkDone) return isPrismaConnected;
  try {
    // Attempt a simple raw query or findFirst to verify connection
    await prisma.$queryRaw`SELECT 1`;
    isPrismaConnected = true;
    console.log("🟢 Conectado ao banco de dados PostgreSQL corporativo com sucesso!");
  } catch (error) {
    isPrismaConnected = false;
    console.warn("⚠️ Não foi possível ligar ao PostgreSQL local. Ativando Modo de Persistência Híbrida JSON local.");
  }
  checkDone = true;
  return isPrismaConnected;
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

  // Seed default data for local store (from credentials_dev_matrix.md and schemaData.ts)
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
      funcionario: { nip: "NIP-LUA-456", patente: "Director EP Viana" }
    },
    {
      id: "usr-kelson",
      email: "guarda.kelson@governo.ao",
      senhaHashed: defaultHash,
      nome: "Kelson Neto",
      tipo: "OPERADOR_SEGURANCA",
      ativo: true,
      estabelecimentoId: "PRIS-VIANA",
      estabelecimento: estabelecimentos[0],
      funcionario: { nip: "NIP-LUA-789", patente: "Chefe de Vigilância" }
    },
    {
      id: "usr-joao",
      email: "dr.joao@governo.ao",
      senhaHashed: defaultHash,
      nome: "Dr. João Carlos",
      tipo: "OPERADOR_MEDICO",
      ativo: true,
      estabelecimentoId: "PRIS-VIANA",
      estabelecimento: estabelecimentos[0],
      funcionario: { nip: "NIP-LUA-101", patente: "Médico Prisional Chefe" }
    },
    {
      id: "usr-ana",
      email: "dra.ana@governo.ao",
      senhaHashed: defaultHash,
      nome: "Dra. Ana Paula",
      tipo: "OPERADOR_SOCIAL",
      ativo: true,
      estabelecimentoId: "PRIS-VIANA",
      estabelecimento: estabelecimentos[0],
      funcionario: { nip: "NIP-LUA-202", patente: "Técnica Superior de Reinserção" }
    }
  ];

  const reclusos = [
    {
      id: "rec-1",
      nipc: "NIPC-2026-0089",
      nomeCompleto: "Carlos Mateus \"Dji\"",
      dataNascimento: "1995-04-12T00:00:00.000Z",
      nacionalidade: "Angolana",
      documentoId: "001234567LA045",
      fotoUrl: null,
      nivelSeguranca: "MEDIA",
      statusLegal: "CONDENADO",
      estabelecimentoId: "PRIS-VIANA",
      celaId: "cela-viana-1",
      processoPenal: {
        id: "proc-1",
        reclusoId: "rec-1",
        numeroProcessoPGR: "PGR-2026-TX9",
        tribunalCompetente: "Tribunal de Comarca de Luanda",
        juizCausa: "Dr. Adalberto Costa",
        crimeEspecificado: "Furto Qualificado e Posse de Arma",
        penaAnos: 4,
        penaMeses: 6,
        dataInicioPena: "2024-01-10T00:00:00.000Z",
        dataFimPena: "2028-07-10T00:00:00.000Z",
        direitoA_Advogado: true,
        nomeAdvogado: "Dra. Paula Bastos"
      },
      historicoSaude: [
        {
          id: "med-1",
          diagnostico: "Hipertensão Controlada",
          medicacaoPrescrita: "Enalapril 20mg",
          alergias: "Penicilina",
          statusMental: "Estável",
          medicoResponsavel: "Dr. João Carlos",
          dataAtendimento: "2026-05-15T10:00:00.000Z"
        }
      ],
      programasSocial: [
        {
          id: "soc-1",
          tipoAtividade: "CURSO_TECNICO",
          descricao: "Curso de Serralharia e Construção Metálica",
          frequencia: "SEMANAL",
          avaliacaoProgresso: "BOM",
          responsavelSocial: "Dra. Ana Paula",
          dataInicio: "2026-03-01T00:00:00.000Z"
        }
      ]
    },
    {
      id: "rec-2",
      nipc: "NIPC-2026-0412",
      nomeCompleto: "Ambrósio Jamba",
      dataNascimento: "1988-08-23T00:00:00.000Z",
      nacionalidade: "Angolana",
      documentoId: "009876543HU098",
      fotoUrl: null,
      nivelSeguranca: "MAXIMA",
      statusLegal: "PREVENTIVO",
      estabelecimentoId: "PRIS-HUAMBO",
      celaId: "cela-huambo-1",
      processoPenal: {
        id: "proc-2",
        reclusoId: "rec-2",
        numeroProcessoPGR: "PGR-2026-TX15",
        tribunalCompetente: "Tribunal de Comarca do Huambo",
        juizCausa: "Dra. Maria Celestina",
        crimeEspecificado: "Homicídio Involuntário em Condução",
        penaAnos: 0,
        penaMeses: 0,
        dataInicioPena: "2026-02-15T00:00:00.000Z",
        dataFimPena: "2026-08-15T00:00:00.000Z",
        direitoA_Advogado: true,
        nomeAdvogado: "Dr. José Cangombe"
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
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.usuario.findUnique({
        where: { email },
        include: {
          funcionario: true,
          estabelecimento: true
        }
      });
    }

    const store = initLocalStore();
    const user = store.usuarios.find(u => u.email === email);
    if (!user) return null;

    // Return matched structure matching Prisma
    return {
      ...user,
      funcionario: user.funcionario || null,
      estabelecimento: user.estabelecimento || null
    };
  },

  async logLogin(user: any, ip: string) {
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.logSeguranca.create({
        data: {
          evento: "LOGIN_ADMIN",
          modulo: "SEGURANCA",
          nivelSeveridade: "INFO",
          funcionarioId: user.funcionarioId,
          dadosJson: JSON.stringify({ ip, origin: "Backoffice Web Portal" })
        } as any
      }).catch(err => {
        console.warn("Falha ao salvar log de login no Prisma:", err);
      });
    }

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
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      let queryOptions: any = {
        include: {
          estabelecimento: true,
          cela: true,
          processoPenal: true,
          historicoSaude: true,
          programasSocial: true
        },
        orderBy: {
          nomeCompleto: "asc"
        }
      };

      if (user.tipo !== "SUPER_ADMIN" && user.estabelecimentoId) {
        queryOptions.where = {
          estabelecimentoId: user.estabelecimentoId
        };
      }
      return await prisma.recluso.findMany(queryOptions);
    }

    const store = initLocalStore();
    let reclusos = store.reclusos;

    if (user.tipo !== "SUPER_ADMIN" && user.estabelecimentoId) {
      reclusos = reclusos.filter(r => r.estabelecimentoId === user.estabelecimentoId);
    }

    // Attach linked objects
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
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.recluso.findUnique({
        where: { id },
        include: {
          estabelecimento: true,
          cela: true,
          processoPenal: true,
          historicoSaude: true,
          programasSocial: true
        }
      });
    }

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
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.recluso.create({
        data,
        include: {
          estabelecimento: true,
          cela: true,
          processoPenal: true,
          historicoSaude: true,
          programasSocial: true
        }
      });
    }

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
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.recluso.update({
        where: { id },
        data,
        include: {
          estabelecimento: true,
          cela: true,
          processoPenal: true,
          historicoSaude: true,
          programasSocial: true
        }
      });
    }

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
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.recluso.delete({
        where: { id }
      });
    }

    const store = initLocalStore();
    const idx = store.reclusos.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Recluso não encontrado");

    const deleted = store.reclusos.splice(idx, 1)[0];
    saveLocalStore(store);
    return deleted;
  },

  // 3. LOGS AUDITORIA
  async getLogs(user: any) {
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      let queryOptions: any = {
        include: {
          funcionario: true,
          recluso: {
            include: {
              estabelecimento: true
            }
          }
        },
        orderBy: {
          dataHora: "desc"
        }
      };

      if (user.tipo !== "SUPER_ADMIN" && user.estabelecimentoId) {
        queryOptions.where = {
          OR: [
            { recluso: { estabelecimentoId: user.estabelecimentoId } },
            { funcionario: { estabelecimentoId: user.estabelecimentoId } }
          ]
        };
      }
      return await prisma.logSeguranca.findMany(queryOptions);
    }

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
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.logSeguranca.create({
        data
      });
    }

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

  // --- INSTITUTIONAL EVENT BUS PERSISTENCE ---
  async saveEvent(event: any) {
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      try {
        await prisma.logSeguranca.create({
          data: {
            evento: `EVENT_BUS_${event.type || "GENERIC"}`,
            modulo: event.category || "OPERACIONAL",
            nivelSeveridade: event.priority || "HIGH",
            dadosJson: JSON.stringify(event)
          } as any
        });
      } catch (e) {
        console.warn("Prisma saveEvent fallback to local json store:", e);
      }
    }

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
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      try {
        const logs = await prisma.logSeguranca.findMany({
          where: {
            evento: {
              startsWith: "EVENT_BUS_"
            }
          },
          orderBy: { dataHora: "desc" },
          take: 200
        });
        const mapped = logs.map(l => {
          try {
            const parsed = JSON.parse((l as any).dadosJson || "{}");
            return { ...parsed, persistedInDb: true };
          } catch {
            return null;
          }
        }).filter(Boolean);
        if (mapped.length > 0) return mapped;
      } catch (e) {
        console.warn("Prisma getEvents fallback to local store:", e);
      }
    }

    const store = initLocalStore();
    return (store.events || []).map((e: any) => ({ ...e, persistedInDb: true }));
  },

  // 4. ESTABELECIMENTOS
  async getEstabelecimentos() {
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.estabelecimentoPrisional.findMany({
        include: {
          direcaoProvincial: true
        }
      });
    }

    const store = initLocalStore();
    return store.estabelecimentos;
  },

  // 5. SAÚDE / PRONTUÁRIO MÉDICO
  async getHealthRecords() {
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.prontuarioMedico.findMany({
        include: {
          recluso: true
        }
      });
    }

    const store = initLocalStore();
    return store.prontuariosMedicos || [];
  },

  async createHealthRecord(data: any) {
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.prontuarioMedico.create({
        data,
        include: {
          recluso: true
        }
      });
    }

    const store = initLocalStore();
    if (!store.prontuariosMedicos) store.prontuariosMedicos = [];
    const newRecord = {
      id: data.id || "CLI-" + Date.now(),
      ...data,
      dataAtendimento: data.dataAtendimento || new Date().toISOString()
    };
    store.prontuariosMedicos.push(newRecord);
    
    // Also add to inmate's historicoSaude in store
    const inmate = store.reclusos.find(r => r.id === data.reclusoId);
    if (inmate) {
      if (!inmate.historicoSaude) inmate.historicoSaude = [];
      inmate.historicoSaude.push(newRecord);
    }

    saveLocalStore(store);
    return newRecord;
  },

  async updateHealthRecord(id: string, data: any) {
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.prontuarioMedico.update({
        where: { id },
        data,
        include: {
          recluso: true
        }
      });
    }

    const store = initLocalStore();
    if (!store.prontuariosMedicos) store.prontuariosMedicos = [];
    const idx = store.prontuariosMedicos.findIndex(r => r.id === id);
    if (idx !== -1) {
      store.prontuariosMedicos[idx] = { ...store.prontuariosMedicos[idx], ...data };
      
      // Update inmate's historicoSaude
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
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.prontuarioMedico.delete({
        where: { id }
      });
    }

    const store = initLocalStore();
    if (!store.prontuariosMedicos) store.prontuariosMedicos = [];
    const idx = store.prontuariosMedicos.findIndex(r => r.id === id);
    if (idx !== -1) {
      const deleted = store.prontuariosMedicos.splice(idx, 1)[0];
      
      // Delete from inmate's historicoSaude
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
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.planoReinsercao.findMany({
        include: {
          recluso: true
        }
      });
    }

    const store = initLocalStore();
    return store.planosReinsercao || [];
  },

  async createReintegrationRecord(data: any) {
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.planoReinsercao.create({
        data,
        include: {
          recluso: true
        }
      });
    }

    const store = initLocalStore();
    if (!store.planosReinsercao) store.planosReinsercao = [];
    const newRecord = {
      id: data.id || "REI-" + Date.now(),
      ...data,
      dataInicio: data.dataInicio || new Date().toISOString()
    };
    store.planosReinsercao.push(newRecord);
    
    // Also add to inmate's programasSocial in store
    const inmate = store.reclusos.find(r => r.id === data.reclusoId);
    if (inmate) {
      if (!inmate.programasSocial) inmate.programasSocial = [];
      inmate.programasSocial.push(newRecord);
    }

    saveLocalStore(store);
    return newRecord;
  },

  async updateReintegrationRecord(id: string, data: any) {
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.planoReinsercao.update({
        where: { id },
        data,
        include: {
          recluso: true
        }
      });
    }

    const store = initLocalStore();
    if (!store.planosReinsercao) store.planosReinsercao = [];
    const idx = store.planosReinsercao.findIndex(r => r.id === id);
    if (idx !== -1) {
      store.planosReinsercao[idx] = { ...store.planosReinsercao[idx], ...data };
      
      // Update inmate's programasSocial
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
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.planoReinsercao.delete({
        where: { id }
      });
    }

    const store = initLocalStore();
    if (!store.planosReinsercao) store.planosReinsercao = [];
    const idx = store.planosReinsercao.findIndex(r => r.id === id);
    if (idx !== -1) {
      const deleted = store.planosReinsercao.splice(idx, 1)[0];
      
      // Delete from inmate's programasSocial
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
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.usuario.findMany({
        include: {
          funcionario: true,
          estabelecimento: true
        }
      });
    }

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
    
    const usePrisma = await checkDbConnection();
    if (usePrisma) {
      return await prisma.usuario.findUnique({ where: { id } });
    }
    
    throw new Error("Operador não encontrado");
  }
};
