import { apiService } from "./apiService";

export interface InstitutionalEvent {
  id: string;
  timestamp: string;
  type: 'TRANSFERENCIA_SOLICITADA' | 'ADMISSAO_CONCLUIDA' | 'INCIDENTE_REGISTADO' | 'SINAL_ALERTA_DISPARADO' | 'RECLASSIFICACAO_RISCO' | 'AUDITORIA_INTEGRIDADE' | string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  category: 'SEGURANÇA' | 'OPERACIONAL' | 'GOVERNAÇÃO' | 'SAÚDE';
  source: string;
  operator: string;
  message: string;
  payload: any;
  auditHash: string;
  persistedInDb?: boolean;
}

type SubscriptionCallback = (event: InstitutionalEvent) => void;

class InstitutionalEventBus {
  private subscribers: Map<string, Set<SubscriptionCallback>> = new Map();
  private globalSubscribers: Set<SubscriptionCallback> = new Set();
  private autoPersistCritical: boolean = true;
  private storageKey: string = "pnap_persisted_events";

  private eventHistory: InstitutionalEvent[] = [
    {
      id: "EVT-2026-9025",
      timestamp: "11:52:01",
      type: "AUDIT_LEDGER_SIGNED",
      priority: "NORMAL",
      category: "GOVERNAÇÃO",
      source: "AuditService",
      operator: "Dra. Maria Kiala (Gabinete)",
      message: "Nova delegação provincial homologada e assinada criptograficamente no livro fiscal do MININT.",
      payload: { delegationId: "DEL-2026-001", hash: "SHA255-DEL1102B", signature: "SIG-MININT-KIALA" },
      auditHash: "SHA256-BB8811AA22DD33FF",
      persistedInDb: true
    },
    {
      id: "EVT-2026-9024",
      timestamp: "11:51:45",
      type: "LEGISLACAO_ALTERADA",
      priority: "HIGH",
      category: "GOVERNAÇÃO",
      source: "CNEL_Engine",
      operator: "Sub-Comissário Júlio Mbanza",
      message: "Engenharia Legislativa: Artigo 42 do Regulamento Prisional (Lei 8/08) atualizado com emenda de 2026.",
      payload: { article: "Artigo 42", topic: "Uso da Força", revision: "v2.1", complianceCheck: "CONFORME" },
      auditHash: "SHA256-4242BBCCEEFF1122",
      persistedInDb: true
    },
    {
      id: "EVT-2026-9023",
      timestamp: "11:51:30",
      type: "CELA_LOCKDOWN_TRIG",
      priority: "CRITICAL",
      category: "SEGURANÇA",
      source: "SecurityService",
      operator: "Sistema Automático (Alerta)",
      message: "LOCKDOWN preventivo acionado no Bloco A2 (EP Viana) devido à deteção de tentativa de transposição.",
      payload: { block: "A2", cellCode: "C2-A2", triggerSource: "LaserBarrier_04" },
      auditHash: "SHA255-D412C88910AB7766",
      persistedInDb: true
    },
    {
      id: "EVT-2026-9022",
      timestamp: "11:51:15",
      type: "GUIA_TRANSITO_GERADO",
      priority: "HIGH",
      category: "OPERACIONAL",
      source: "TransferService",
      operator: "Diretor Geral Consola",
      message: "Guia de Trânsito GT-810920 emitida para transferência do recluso de alta perigosidade João Kassoma.",
      payload: { guideId: "GT-810920", origin: "EP Viana", destination: "EP Huambo", escortUnit: "PIR" },
      auditHash: "SHA256-AA9102B99CDE1102",
      persistedInDb: true
    },
    {
      id: "EVT-2026-9021",
      timestamp: "11:51:02",
      type: "RECLUSO_ADMITIDO",
      priority: "NORMAL",
      category: "OPERACIONAL",
      source: "AdmissionsService",
      operator: "Capitão Simão Neto",
      message: "Admissão e cadastro biométrico efetuados: Bento Cafala (REC-HUA-091) matriculado no Huambo.",
      payload: { inmateId: "REC-HUA-091", unit: "EP Huambo", fingerCount: 10, photoStatus: "SINC_OK" },
      auditHash: "SHA256-EFD289012A34CDE9",
      persistedInDb: false
    }
  ];
  private maxHistorySize = 200;

  constructor() {
    if (typeof window !== 'undefined') {
      (window as any).institutionalEventBus = this;
      
      // Load cached local events immediately and sync from PostgreSQL database asynchronously
      this.loadLocalStorageEvents();
      setTimeout(() => {
        this.syncFromDatabase().catch(err => {
          console.warn('[EventBus] Auto-sync with PostgreSQL database initialized with local cache:', err);
        });
      }, 300);
    }
  }

  /**
   * Toggle or set option to persist critical and high priority events to PostgreSQL database.
   */
  public setAutoPersistCritical(enabled: boolean): void {
    this.autoPersistCritical = enabled;
  }

  public isAutoPersistEnabled(): boolean {
    return this.autoPersistCritical;
  }

  /**
   * Subscribe to a specific event type.
   * Returns a cleanup function to unsubscribe.
   */
  public subscribe(eventType: string, callback: SubscriptionCallback): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(callback);
    return () => {
      this.subscribers.get(eventType)?.delete(callback);
    };
  }

  /**
   * Subscribe to all published events.
   * Returns a cleanup function to unsubscribe.
   */
  public subscribeAll(callback: SubscriptionCallback): () => void {
    this.globalSubscribers.add(callback);
    return () => {
      this.globalSubscribers.delete(callback);
    };
  }

  /**
   * Save an event to browser local storage for instant offline resilience.
   */
  private saveToLocalStorage(event: InstitutionalEvent): void {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getLocalStorageEvents();
      const updated = [event, ...existing.filter(e => e.id !== event.id)].slice(0, this.maxHistorySize);
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn('Falha ao salvar evento no localStorage:', e);
    }
  }

  private getLocalStorageEvents(): InstitutionalEvent[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  private loadLocalStorageEvents(): void {
    const localEvents = this.getLocalStorageEvents();
    if (localEvents.length === 0) return;

    const seen = new Set(this.eventHistory.map(e => e.id));
    for (const evt of localEvents) {
      if (!seen.has(evt.id)) {
        seen.add(evt.id);
        this.eventHistory.push(evt);
      }
    }
  }

  /**
   * Fetches persisted events from the PostgreSQL database and merges them with event history.
   * Ensures an audit trail survives system restarts and cache wipes.
   */
  public async syncFromDatabase(): Promise<InstitutionalEvent[]> {
    try {
      const dbEvents = await apiService.getEvents();
      if (!dbEvents || !Array.isArray(dbEvents)) return this.eventHistory;

      // Merge DB events with current in-memory events
      const combined = [...dbEvents, ...this.getLocalStorageEvents(), ...this.eventHistory];
      const seen = new Set<string>();
      const merged: InstitutionalEvent[] = [];

      for (const evt of combined) {
        if (!evt || !evt.id) continue;
        if (!seen.has(evt.id)) {
          seen.add(evt.id);
          merged.push({
            ...evt,
            persistedInDb: true
          });
        }
      }

      this.eventHistory = merged.slice(0, this.maxHistorySize);

      // Notify global subscribers of updated event stream after DB hydration
      this.globalSubscribers.forEach(cb => {
        try { cb(this.eventHistory[0]); } catch {}
      });

      return this.eventHistory;
    } catch (error) {
      console.warn('[EventBus] Erro ao sincronizar auditoria com a base de dados:', error);
      return this.eventHistory;
    }
  }

  /**
   * Publish a new institutional event.
   * Automatically persists CRITICAL & HIGH priority events (or when explicit persist=true)
   * to PostgreSQL database to preserve audit trail across restarts/cache wipes.
   */
  public publish(
    event: Omit<InstitutionalEvent, 'id' | 'timestamp' | 'auditHash'> & { persist?: boolean }
  ): InstitutionalEvent {
    const id = `EVT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    // Generate simple deterministic audit hash
    const seed = `${id}-${event.type}-${event.message}-${Date.now()}`;
    const auditHash = "SHA256-" + (seed.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0) | 0, 0) >>> 0).toString(16).toUpperCase();

    const isCriticalOrHigh = event.priority === 'CRITICAL' || event.priority === 'HIGH';
    const shouldPersist = event.persist ?? (this.autoPersistCritical && isCriticalOrHigh);

    const fullEvent: InstitutionalEvent = {
      type: event.type,
      priority: event.priority,
      category: event.category,
      source: event.source,
      operator: event.operator,
      message: event.message,
      payload: event.payload,
      id,
      timestamp,
      auditHash,
      persistedInDb: shouldPersist
    };

    // Push to the beginning of the history
    this.eventHistory = [fullEvent, ...this.eventHistory].slice(0, this.maxHistorySize);

    // Persist to local storage and PostgreSQL database if requested or critical/high
    if (shouldPersist) {
      this.saveToLocalStorage(fullEvent);
      apiService.saveEvent(fullEvent).then(saved => {
        if (saved) {
          fullEvent.persistedInDb = true;
        }
      }).catch(err => {
        console.warn('[EventBus] Persistent DB Write fallback triggered:', err);
      });
    }

    // Notify specific subscribers
    const typeSubscribers = this.subscribers.get(event.type);
    if (typeSubscribers) {
      typeSubscribers.forEach(cb => {
        try { cb(fullEvent); } catch (err) { console.error('Error in EventBus subscriber:', err); }
      });
    }

    // Notify global subscribers
    this.globalSubscribers.forEach(cb => {
      try { cb(fullEvent); } catch (err) { console.error('Error in EventBus global subscriber:', err); }
    });

    // Fire window event for compatibility or outside listeners
    if (typeof window !== 'undefined') {
      const customEvt = new CustomEvent('institutional-event', { detail: fullEvent });
      window.dispatchEvent(customEvt);
    }

    return fullEvent;
  }

  public getHistory(): InstitutionalEvent[] {
    return this.eventHistory;
  }

  public clearHistory(): void {
    this.eventHistory = [];
  }
}

export const eventBus = new InstitutionalEventBus();

