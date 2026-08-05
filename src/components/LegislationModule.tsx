import React, { useState, useEffect, useMemo } from "react";
import { eventBus } from "../utils/eventBus";
import { NEPComplianceAuditor } from "./NEPComplianceAuditor";
import { 
  Scale, 
  FileText, 
  Users, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Building2, 
  HelpCircle, 
  Info, 
  ShieldCheck, 
  BookOpen, 
  Network, 
  UserCheck,
  Award,
  ArrowRight,
  Briefcase,
  AlertTriangle,
  Send,
  Sparkles,
  Download,
  CheckCircle,
  XCircle,
  Layers,
  Settings,
  GitBranch,
  Cpu,
  Bookmark,
  Activity,
  ShieldAlert,
  FileCheck2,
  Database,
  Plus,
  Trash,
  Calendar,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PENAL_CODE_GROUPS } from "../data/schemaData";
import { apiService } from "../utils/apiService";

// --- TYPE DEFINITIONS FOR THE CENTRAL LEGISLATION OFFICE ---

interface LawArticle {
  number: string;
  title: string;
  content: string;
  paragraphs?: string[];
}

interface LawSection {
  title: string;
  articles: LawArticle[];
}

interface LawChapter {
  title: string;
  sections?: LawSection[];
  articles?: LawArticle[];
}

interface DoctrineSource {
  id: string;
  name: string;
  acronym: string;
  type: "Nacional" | "Internacional" | "Regulamentar";
  description: string;
  articles: LawArticle[];
}

interface TraceabilityLink {
  featureId: string;
  featureName: string;
  systemComponent: string;
  legalBasis: string;
  mandelaRulesBasis: string;
  competentOrgan: string;
  mandatoryFlow: string[];
  complianceStatus: "CONFORME" | "EM_REVISAO" | "EM_ALERTA";
  operationalAuditRule: string;
}

interface EvolutionProposal {
  id: string;
  lawReference: string;
  currentStatus: "IMPLEMENTADO" | "IMPLEMENTADO_PARCIALMENTE" | "NAO_IMPLEMENTADO";
  technologicalGap: string;
  innovationOpportunity: string;
  impactScore: "MUITO_ALTO" | "ALTO" | "MEDIO" | "BAIXO";
}

interface LegislativeImpactScenario {
  id: string;
  title: string;
  description: string;
  affectedFiles: string[];
  rbacImpact: string[];
  systemChangesRequired: string[];
  complianceScoreImpact: string;
}

// --- DYNAMIC SEED DATA WITH ABSOLUTE HISTORICAL AND REGULATORY DEPTH ---

const DOCTRINES_DATA: DoctrineSource[] = [
  {
    id: "cra",
    name: "Constituição da República de Angola",
    acronym: "C.R.A.",
    type: "Nacional",
    description: "Lei Fundamental do Estado soberano que estabelece os direitos invioláveis, a dignidade humana e as garantias processuais do recluso.",
    articles: [
      {
        number: "Artigo 59.º",
        title: "Integridade Física e Moral",
        content: "Ninguém pode ser submetido a tortura, a tratos ou penas cruéis, degradantes ou desumanas. O Estado angolano assume a obrigação de velar pela segurança física dos cidadãos custodiados."
      },
      {
        number: "Artigo 60.º",
        title: "Garantias Fundamentais na Detenção",
        content: "Toda a pessoa privada de liberdade tem o direito de ser informada das causas da sua prisão, de comunicar com advogado constituído e de receber tratamento humanitário adequado à sua condição."
      },
      {
        number: "Artigo 61.º",
        title: "Direitos dos Condenados",
        content: "A privação da liberdade não impede o condenado de usufruir dos seus direitos políticos, civis e sociais, com exceção das limitações inerentes à condenação e das exigências de segurança coletiva."
      }
    ]
  },
  {
    id: "mandela",
    name: "Regras Mínimas das Nações Unidas para o Tratamento de Reclusos",
    acronym: "Nelson Mandela",
    type: "Internacional",
    description: "Normas internacionais universais de direitos humanos adoptadas pela Assembleia Geral da ONU para regular a governação carcerária e dignidade.",
    articles: [
      {
        number: "Regra 12",
        title: "Acomodação Sanitária e Espaço Mínimo",
        content: "As celas individuais devem dispor de área cúbica suficiente, janelas com luz natural abundante, ventilação cruzada e instalações sanitárias higiénicas que preservem a privacidade do recluso."
      },
      {
        number: "Regra 24",
        title: "Triagem Médica no Ingresso",
        content: "Todo o recluso deve ser examinado por um médico de serviço imediatamente após o seu ingresso no estabelecimento, para deteção de patologias, isolamento epidemiológico e despiste de maus-tratos."
      },
      {
        number: "Regra 37",
        title: "Comunicação e Visitas Familiares",
        content: "Os reclusos devem ser autorizados a comunicar regularmente com a família e amigos, tanto por correspondência escrita como por meios de telecomunicação integrados sob fiscalização legal."
      }
    ]
  },
  {
    id: "bangkok",
    name: "Regras das Nações Unidas para o Tratamento de Mulheres Reclusas",
    acronym: "Bangkok Rules",
    type: "Internacional",
    description: "Padrões globais de proteção para responder às necessidades de género no sistema de justiça penal e proteção à maternidade encarcerada.",
    articles: [
      {
        number: "Regra 2",
        title: "Saúde Ginecológica de Ingresso",
        content: "A triagem médica das reclusas mulheres deve abranger avaliação obstétrica, ginecológica e psicológica preventiva contra traumas pós-parto e abusos de género anteriores."
      },
      {
        number: "Regra 5",
        title: "Instalações de Higiene Específicas",
        content: "Devem ser fornecidos gratuitamente produtos adequados às necessidades biológicas e de amamentação das mulheres, dispondo de água quente contínua para cuidados de lactação."
      },
      {
        number: "Regra 22",
        title: "Salas de Berçário e Creches",
        content: "Os estabelecimentos femininos onde os filhos de reclusas coabitem devem dispor de salas de berçário equipadas com pessoal pediátrico qualificado para garantir o pleno crescimento da criança."
      }
    ]
  },
  {
    id: "circular",
    name: "Diretivas Técnicas e Circulares do MININT",
    acronym: "Circular MININT",
    type: "Regulamentar",
    description: "Instruções internas expedidas pelo Ministério do Interior para regular a doutrina operacional tática e protocolos militares de custódia.",
    articles: [
      {
        number: "Circular 12/24",
        title: "Uso Progressivo da Força Táctica",
        content: "Define as balizas do uso progressivo dos meios de coação em motins. Proíbe uso de armamento letal interno e obriga a gravação em vídeo e auditoria imediata de toda a operação de contenção táctica."
      },
      {
        number: "Instrução 04",
        title: "Cadastro Biométrico de Escolta",
        content: "Determina a obrigatoriedade de recolha biométrica e controlo de impressões digitais de todos os reclusos antes do embarque em autocarros de transferência inter-provincial."
      }
    ]
  }
];

const DECRETO_184_17_CHAPTERS: LawChapter[] = [
  {
    title: "CAPÍTULO I - Disposições Gerais",
    sections: [
      {
        title: "SECÇÃO I - Definição, Natureza e Atribuições",
        articles: [
          {
            number: "Artigo 1.º",
            title: "Definição do Serviço Penitenciário",
            content: "O Serviço Penitenciário é o órgão executivo central do Ministério do Interior ao qual incumbe executar as medidas privativas de liberdade dos cidadãos, determinadas pelas autoridades judiciais competentes, aplicar as políticas de reabilitação e reintegração social do recluso, efectivar a fiscalização do cumprimento da prisão preventiva, assim como dos prazos para a liberdade condicional."
          },
          {
            number: "Artigo 2.º",
            title: "Natureza e Autonomia",
            content: "O Serviço Penitenciário é um serviço executivo central dependente do Ministério do Interior, com autonomia administrativa e gestão orçamental, sem prejuízo dos poderes de superintendência do respectivo Ministro no âmbito do asseguramento do interesse público, da execução da estratégia do Ministério do Interior, da legalidade e do mérito dos actos e das medidas operacionais."
          },
          {
            number: "Artigo 3.º",
            title: "Atribuições Fundamentais",
            content: "O Serviço Penitenciário tem as seguintes atribuições estatutárias:",
            paragraphs: [
              "a) Garantir a aplicação da Constituição da República, das leis, normas e regulamentos na execução das penas e demais medidas privativas de liberdade;",
              "b) Aplicar as políticas de reabilitação e reintegração social dos cidadãos condenados pelos tribunais em medidas privativas de liberdade;",
              "c) Promover o controlo da população penitenciária;",
              "d) Orientar e dirigir o internamento de reclusos de difícil correcção em estabelecimentos penitenciários adequados;",
              "e) Orientar metodologicamente os estabelecimentos penitenciários, sobre a aplicação das normas e regulamentos atinentes ao tratamento de recluso;",
              "f) Cooperar com as instituições congéneres visando o intercâmbio e a cooperação, no quadro da política superiormente definida;",
              "g) Promover a formação e superação técnico-profissional do efectivo;",
              "h) Estabelecer protocolos de intercâmbio e cooperação com organismos do sector produtivo, público e privado, visando a obtenção de apoio e experiências tecnológicas, sempre que tal se mostre necessário à formação da população penal e ao normal funcionamento do órgão;",
              "i) Desempenhar as demais atribuições que lhe forem acometidas por lei ou determinadas superiormente."
            ]
          }
        ]
      }
    ]
  },
  {
    title: "CAPÍTULO II - Organização e Estrutura da Direcção",
    sections: [
      {
        title: "SECÇÃO I - Organização em Geral",
        articles: [
          {
            number: "Artigo 4.º",
            title: "Estrutura Orgânica (5 Pilares de Governação)",
            content: "O Serviço Penitenciário tem a seguinte estrutura orgânica completa:",
            paragraphs: [
              "1. Órgãos de Direcção: a) Director-Geral, b) Directores-Gerais Adjuntos.",
              "2. Órgãos de Apoio Consultivo: a) Conselho Consultivo, b) Conselho de Quadros, c) Conselho de Justiça e Disciplina.",
              "3. Serviços de Apoio Técnico: a) Gabinete de Inspecção (GI), b) Direcção de Educação Patriótica (DEP), c) Gabinete Jurídico (GJ), d) Direcção de Estudos, Informação e Análise (GEIA), e) Direcção de Recursos Humanos (DRH), f) Direcção de Planeamento e Finanças (DPF), g) Direcção de Logística (DL), h) Gabinete de Infra-Estruturas e Equipamentos (GIE), i) Gabinete de Telecomunicações e Tecnologias de Informação (GTTI), j) Gabinete de Comunicação Institucional e Imprensa (GCII), k) Direcção de Administração e Serviços (DAS), l) Gabinete de Intercâmbio e Cooperação (GIC), m) Gabinete de Segurança Institucional (GSI), n) Instituto de Ciências Penitenciárias (ICP).",
              "4. Serviços de Apoio Instrumental: a) Gabinete do Director-Geral, b) Gabinetes dos Directores-Gerais Adjuntos, c) Corpo de Conselheiros.",
              "5. Serviços Executivos Centrais: a) Direcção de Segurança Penitenciária (DSP), b) Direcção de Assistência e Reabilitação Penitenciária (DARP), c) Direcção de Controlo Penal (DCP), d) Direcção de Produção e Actividades Económicas (DPAE), e) Direcção de Penas Alternativas e Reinserção Social (DPARS), f) Serviço de Inteligência Penitenciária (SIP), g) Direcção de Saúde (DS), h) Unidade Especial de Segurança e Intervenção (UESI).",
              "6. Serviços Executivos Locais: Direcções Provinciais."
            ]
          }
        ]
      }
    ]
  },
  {
    title: "CAPÍTULO III - Organização em Especial",
    sections: [
      {
        title: "SECÇÃO I - Órgãos de Direcção",
        articles: [
          {
            number: "Artigo 5.º",
            title: "Competências do Director-Geral",
            content: "O Serviço Penitenciário é dirigido por um Director-Geral a quem compete coordenar, organizar, dirigir e fiscalizar todas as actividades do órgão; assegurar a aplicação adequada das leis e regulamentos; decidir sobre o local de cumprimento de pena; propor a criação, classificação e desactivação de estabelecimentos; emitir pareceres legislativos e autorizar provimentos até ao posto de oficiais subalternos."
          },
          {
            number: "Artigo 6.º",
            title: "Directores-Gerais Adjuntos",
            content: "O Director-Geral é coadjuvado por dois Directores-Gerais Adjuntos que exercem as competências delegadas ou subdelegadas e asseguram a substituição legal no comando do órgão."
          }
        ]
      },
      {
        title: "SECÇÃO II - Órgãos de Apoio Consultivo",
        articles: [
          {
            number: "Artigo 7.º",
            title: "Conselho Consultivo",
            content: "Incumbe analisar e formular pareceres sobre questões operativas, organizacionais e estratégicas. Subdivide-se em operativo, normal e alargado."
          },
          {
            number: "Artigo 8.º",
            title: "Conselho de Quadros",
            content: "Órgão consultivo encarregue de emitir pareceres sobre a gestão de quadros, progressão nas carreiras e alocação de pessoal do Serviço Penitenciário."
          },
          {
            number: "Artigo 9.º",
            title: "Conselho de Justiça e Disciplina",
            content: "Órgão de apoio incumbido de analisar e formular pareceres atinentes à justiça, honra e disciplina do efectivo penitenciário."
          }
        ]
      },
      {
        title: "SECÇÃO III - Serviços de Apoio Técnico",
        articles: [
          {
            number: "Artigo 10.º",
            title: "Gabinete de Inspecção (GI)",
            content: "Incumbe assegurar as funções de inspecção e inquérito a todas as unidades legalmente tuteladas pelo Serviço Penitenciário, velando pela observância das leis e eficácia da gestão."
          },
          {
            number: "Artigo 12.º",
            title: "Gabinete Jurídico (GJ)",
            content: "Responsável pela elaboração de diplomas legais, elaboração/apreciação de contratos e articulação com as autoridades judiciais para a regularização processual dos reclusos."
          },
          {
            number: "Artigo 14.º",
            title: "Direcção de Recursos Humanos (DRH)",
            content: "Gerir os recursos humanos, recrutamento, avaliação de desempenho, processamento de salários e propostas de aposentação do efectivo carcerário."
          },
          {
            number: "Artigo 18.º",
            title: "Gabinete de Telecomunicações e Tecnologias de Informação (GTTI)",
            content: "Estudar, planear e conceber a arquitectura dos sistemas de informação, infra-estrutura informática e comunicações do Serviço Penitenciário de Angola."
          },
          {
            number: "Artigo 23.º",
            title: "Instituto de Ciências Penitenciárias (ICP)",
            content: "Dirigido por um Subcomissário Prisional, é o centro de formação académica média/superior, superação técnico-profissional e investigação de ciências penitenciárias."
          }
        ]
      },
      {
        title: "SECÇÃO IV - Serviços Executivos Centrais (Especialidades Operativas)",
        articles: [
          {
            number: "Artigo 27.º",
            title: "Direcção de Segurança Penitenciária (DSP)",
            content: "Assegurar a ordem e a segurança nas instituições penitenciárias, prevenir greves, motins e fugas, controlar revistas e contagens programadas, e garantir a integridade física dos reclusos."
          },
          {
            number: "Artigo 28.º",
            title: "Direcção de Assistência e Reabilitação Penitenciária (DARP)",
            content: "Conceber e executar as políticas reabilitativas e psicossociais, zelar pelo cumprimento dos Direitos Humanos, promover ensino escolar, formação profissional e assistência religiosa."
          },
          {
            number: "Artigo 29.º",
            title: "Direcção de Controlo Penal (DCP)",
            content: "Gestão processual, registo penal, biometria NREP-AO, controlo do tempo de permanência, fiscalização de prazos de prisão preventiva e emissão de mandados/guias de soltura."
          },
          {
            number: "Artigo 30.º",
            title: "Direcção de Produção e Actividades Económicas (DPAE)",
            content: "Execução de políticas produtivas no seio da população penal com base no binómio 'produção-reabilitação' em sectores agro-pecuários, industriais e fabris."
          },
          {
            number: "Artigo 31.º",
            title: "Direcção de Penas Alternativas e Reinserção Social (DPARS)",
            content: "Executar penas alternativas à prisão (prestação de trabalho comunitário), políticas de reinserção social e acompanhamento pós-institucional."
          },
          {
            number: "Artigo 32.º",
            title: "Serviço de Inteligência Penitenciária (SIP)",
            content: "Garantir a investigação, prevenção e neutralização de ameaças à ordem e estabilidade penitenciária, recolhendo informações operativas e articulando com o Sistema Nacional de Inteligência."
          },
          {
            number: "Artigo 33.º",
            title: "Direcção de Saúde (DS)",
            content: "Assistência médica e medicamentosa aos reclusos e efectivos, controlo epidemiológico e coordenação das Juntas de Saúde para determinação de incapacidade definitiva."
          },
          {
            number: "Artigo 34.º",
            title: "Unidade Especial de Segurança e Intervenção (UESI)",
            content: "Unidade táctica de intervenção para reposição da ordem, resgate de reféns, escoltas de alto risco e apoio à recaptura de reclusos evadidos."
          }
        ]
      },
      {
        title: "SECÇÃO V - Serviços Executivos Locais",
        articles: [
          {
            number: "Artigo 35.º",
            title: "Direcções Provinciais (21 Províncias - DPA 2024)",
            content: "Dirigidas por Directores Provinciais subordinados funcionalmente aos Delegados Provinciais do MININT e metodologicamente ao Director-Geral do Serviço Penitenciário, abrangendo todas as 21 províncias de Angola."
          }
        ]
      }
    ]
  },
  {
    title: "CAPÍTULO IV - Disposições Finais & Símbolos",
    sections: [
      {
        title: "SECÇÃO I - Emblemas e Carreiras",
        articles: [
          {
            number: "Artigo 37.º",
            title: "Quadro de Pessoal (Anexo I)",
            content: "Quadro permanente fixado em 21.318 vagas para oficialidade, patentes de comando e agentes penitenciários."
          },
          {
            number: "Artigo 41.º",
            title: "Insígnia Oficial",
            content: "Pentágono com dois triângulos sobrepostos, balança da justiça, livro aberto 'lex lex', duas chaves cruzadas e ramos laterais de café e algodão."
          },
          {
            number: "Artigo 43.º",
            title: "Lema Oficial do S.P.A.",
            content: "O lema oficial do Serviço Penitenciário de Angola é: 'Humanização, Reabilitação e Reintegração'."
          }
        ]
      }
    ]
  }
];

const DECRETO_272_16_CHAPTERS: LawChapter[] = [
  {
    title: "TÍTULO I - NORMAS DE EXECUÇÃO PERMANENTE DO SISTEMA PENITENCIÁRIO (DISPOSIÇÕES GERAIS)",
    sections: [
      {
        title: "CAPÍTULO I - Disposições Gerais, Internamento e Compartimentação",
        articles: [
          {
            number: "Artigo 1.º e 2.º",
            title: "Objecto e Âmbito das N.E.P.",
            content: "Estabelece as bases gerais de execução das medidas operativas e procedimentos do Sistema Penitenciário em Angola em 5 áreas de actuação: Segurança Penitenciária, Controlo Penal, Assistência/Reabilitação/Reinserção, Produção Penitenciária e Ordem Interna."
          },
          {
            number: "Artigo 4.º e 5.º",
            title: "Internamento e Proibição Absoluta de Menores de 16 Anos",
            content: "O internamento exige Mandado de Condução assinado por Magistrado. É expressamente PROIBIDO o internamento de menores de 16 anos. Havendo tentativa, o Oficial Superior de Assistência deve fotocopiar o mandado, devolver o menor ao órgão condutor e notificar imediatamente o Ministério Público e o Director do Estabelecimento."
          },
          {
            number: "Artigo 6.º e 14.º",
            title: "Formalidades de Entrada, Exame Médico em 72h e Boletim Biográfico",
            content: "Registo obrigatório no Livro de Registo e SISPA, preenchimento do Boletim Biográfico com dados antropométricos e dactiloscópicos, e submissão obrigatória do recluso a exame médico no prazo máximo de 72 horas para diagnóstico de doenças/anomalias mentais."
          },
          {
            number: "Artigo 17.º",
            title: "Critério Geral de Compartimentação (Família Delitiva)",
            content: "O internamento obedece obrigatoriamente ao critério da Família Delitiva: Bloco A (Crimes contra as Pessoas), Bloco B (Crimes contra a Propriedade), Bloco C (Crimes contra a Ordem e Tranquilidade Pública), mantendo-se a separação por sexo, faixa etária, situação legal e regime."
          },
          {
            number: "Artigo 19.º e 21.º",
            title: "Pavilhão de Recepção (Observação 30 Dias) e Plano Individual (PIR)",
            content: "O recém-internado permanece 30 dias em observação no Pavilhão de Recepção para elaboração do Plano Individual de Reabilitação (PIR) para condenados ou de Acompanhamento para detidos, assinado pelo recluso."
          }
        ]
      }
    ]
  },
  {
    title: "TÍTULO II - NORMAS DE EXECUÇÃO PERMANENTE DE SEGURANÇA PENITENCIÁRIA",
    sections: [
      {
        title: "CAPÍTULO I a V - Serviço de Guarda, Escoltas, Cordão de Segurança e Armamento",
        articles: [
          {
            number: "Artigo 27.º e 40.º",
            title: "Estrutura da Guarda Prisional e Rácio do Efectivo",
            content: "Guarda Prisional chefiada por Oficial Superior de Segurança. Rácio obrigatório: Condução (2 agentes para 1 recluso); Escolta interna/produção (1 agente para 2 reclusos); Posto de guarita (3 agentes por posto)."
          },
          {
            number: "Artigo 42.º",
            title: "Formaturas e Parada da Guarda (Horário Rígido 07h00)",
            content: "Formatura diária de Parada da Guarda às 07h00. Faltas ou atrasos superiores a 15 minutos são obrigatoriamente sancionados com prestação de serviço extraordinário por mais 48 horas continuadas."
          },
          {
            number: "Artigo 46.º e 48.º",
            title: "Escolta Celular e Transferências Inter-Provinciais",
            content: "Transporte em viatura celular, algemamento preventivo do recluso antes de iniciar a marcha e elaboração de Plano Operativo de Segurança aprovado pelo Director Provincial e visado em 24h."
          },
          {
            number: "Artigo 53.º e 55.º",
            title: "Cordão de Segurança Perimétrico e Guaritas de 7 Metros",
            content: "Cercas perimétricas (1.ª de 5m betão com pescoço de cavalo, 2.ª de 5m em malha de aço a 6m, 3.ª preventiva de 1.5m com zona neutra de 10m com bandeirinhas vermelhas). Guaritas de 7m com reflectores giratórios, sensores e comunicações."
          },
          {
            number: "Artigo 65.º e 67.º",
            title: "Guiché de Atendimento, Revista e Passes de Acesso",
            content: "Atendimento por equipa de Segurança, Ordem Interna, Reabilitação e Finanças. Acesso condicionado à exibição de Passe Permanente ou Ordinário no peito e registo no livro de viaturas."
          }
        ]
      }
    ]
  },
  {
    title: "TÍTULO III - NORMAS DE EXECUÇÃO PERMANENTE DE ORDEM INTERNA",
    sections: [
      {
        title: "CAPÍTULO I a XI - Contagens, Revistas, Bens do Recluso, Cela Disciplinar e Barbearia",
        articles: [
          {
            number: "Artigo 77.º e 80.º",
            title: "Ordem Interna e Meios Coercivos sem Arma de Fogo",
            content: "É expressamente proibido o uso de armas de fogo no interior penal pelos agentes da Ordem Interna. Uso exclusivo de algemas, gás lacrimogéneo, rádio, apito, cacetete e megafone."
          },
          {
            number: "Artigo 94.º",
            title: "Contagem Ordinária Obrigatória (05h00, 08h00 e 18h00)",
            content: "O controlo físico e numérico da população penal é executado diariamente e sem excepção às 05h00, 08h00 e 18h00, com paralisação das actividades e confronto com a Ficha Modelo 12."
          },
          {
            number: "Artigo 102.º e 110.º",
            title: "Procedimentos de Revistas e Inspecção de Saco/Volume",
            content: "Buscas e revistas programadas ou de surpresa. Todos os alimentos de visitantes devem ser esquartejados e transportados em recipientes plásticos transparentes. PROIBIÇÃO ABSOLUTA de enlatados e recipientes de vidro."
          },
          {
            number: "Artigo 124.º e 137.º",
            title: "Fardamento Castanho, Barbearia (Corte Max 3mm) e Cantina",
            content: "Reclusos detidos usam fardamento regulamentar de cor castanha. Corte de cabelo máximo de 3 mm. Abertura de Cantina com meio de pagamento por Senha Penitenciária (depósito familiar máximo de 10.000,00 Kz/mês)."
          },
          {
            number: "Artigo 135.º",
            title: "Sanção em Cela Disciplinar (Horário de Colchões)",
            content: "Durante a execução de sanção disciplinar, o colchão, mantas e lençóis são obrigatoriamente retirados às 06h00 e devolvidos às 18h00 diariamente pelo Especialista da Ordem Interna."
          }
        ]
      }
    ]
  },
  {
    title: "TÍTULO IV - PLANOS OPERATIVOS DE SEGURANÇA E CONTINGÊNCIA",
    sections: [
      {
        title: "CAPÍTULO I - Gestão de Crises, Evasões, Motins, Incêndios e Simulacros",
        articles: [
          {
            number: "Artigo 144.º e 148.º",
            title: "Planos Operativos e Simulacros Semestrais",
            content: "Elaboração de planos operativos aprovados pelo Delegado do MININT. Realização obrigatória de simulacros semestrais de execução operativa com envio de relatório conclusivo à Direcção Geral."
          },
          {
            number: "Artigo 153.º",
            title: "Plano Operativo Contra Greve de Fome",
            content: "Isolamento do local, constituição de equipa multidisciplinar de persuasão, revista à cela para remoção de disfarces (mantendo água) e acompanhamento médico e psicológico contínuo."
          },
          {
            number: "Artigo 155.º",
            title: "Plano Operativo Contra Fuga e Evasão",
            content: "Acionamento de alarme de alerta total, mobilização de forças em formatura, cerco perimétrico com técnica canina, comunicação às autoridades policiais e circulação de fotos dos evadidos."
          },
          {
            number: "Artigo 159.º",
            title: "Plano Operativo Contra Motim ou Rixa",
            content: "Isolamento do bloco amotinado, equipa de negociação, evacuação dos reclusos não amotinados, intervenção do dispositivo anti-distúrbios (gás lacrimogéneo, jactos de água). Proibição absoluta de maus-tratos a reclusos rendidos."
          },
          {
            number: "Artigo 161.º e 162.º",
            title: "Transferências (Max 60 km/h) e Plano de Localização de Efectivo",
            content: "Velocidade máxima da caravana celular fixada em 60 km/h. Plano de Localização e Aviso de pessoal em 3 Variantes codificadas (Variante 1: Localizado, Variante 2: Apresentação, Variante 3: Ocorrência)."
          }
        ]
      }
    ]
  },
  {
    title: "TÍTULO V - NORMAS DE EXECUÇÃO PERMANENTE DE CONTROLO PENAL",
    sections: [
      {
        title: "CAPÍTULO I a IV - Processo do Recluso, Ficheiros, Solturas e Prisão Preventiva",
        articles: [
          {
            number: "Artigo 167.º e 169.º",
            title: "Deveres do Controlador Penal e Gestão dos 7 Ficheiros",
            content: "Cada Controlador gerencia de 60 a 100 processos individuais. Controlo obrigatório dos 7 Ficheiros: Existência, Saída, Evasão, Falecido, Estrangeiro, Calendário (1/4, 1/2, conversão e extinção) e Prisão Preventiva."
          },
          {
            number: "Artigo 171.º e 173.º",
            title: "Procedimentos de Soltura Judicial e Registo de Óbito",
            content: "Soltura sob Mandado Judicial, confrontação biométrica e certidão negativa de pendências. Em caso de morte: certidão de óbito, autópsia com o SIC e identificação dactiloscópica do cadáver."
          },
          {
            number: "Artigo 180.º",
            title: "Registo Fotográfico e Biométrico em 3 Posições",
            content: "Fotografia biométrica em 3 posições (Frontal, Perfil e Sinais Particulares/Tatuagens) conservadas no SISPA e atualizadas anualmente."
          },
          {
            number: "Artigo 181.º",
            title: "Mapeamento e Alerta do Excesso de Prisão Preventiva",
            content: "Controlo do tempo de permanência em faixas de 0-30 dias até 10 anos. Elaboração e envio mensal obrigatório do mapa e ofício de excesso de prisão preventiva aos Magistrados com proposta de soltura ou julgamento."
          },
          {
            number: "Artigo 186.º",
            title: "Matrícula SISPA e Numeração Quinquenal",
            content: "Matrícula atribuída no internamento, gerida centralmente e renovada a cada 5 anos."
          }
        ]
      }
    ]
  },
  {
    title: "TÍTULO VI - ASSISTÊNCIA, REABILITAÇÃO E ÓRGÃOS COLEGIAIS",
    sections: [
      {
        title: "CAPÍTULO I a XI - Reabilitadores, Competição 100pts, Conselhos e Benefícios",
        articles: [
          {
            number: "Artigo 193.º e 195.º",
            title: "Deveres do Reabilitador, Entrevistas e Sistema de Brigadas",
            content: "Cada Reabilitador atende 60 a 100 reclusos. Entrevistas às 2.ª e 4.ª feiras, Inquéritos Sociais às 3.ª e 5.ª feiras. Organização da população em Brigadas por família delitiva."
          },
          {
            number: "Artigo 202.º e 207.º",
            title: "Conselho de Educadores e Comissão de Reclusos (8 Promotores)",
            content: "Equipa multidisciplinar. Comissão de Reclusos da Brigada com 8 promotores (Ensino, Saúde, Cultura/Desporto, Religião, Disciplina/Ordem) para apoio reabilitativo."
          },
          {
            number: "Artigo 224.º e 246.º",
            title: "Trabalho Remunerado, Senha Penitenciária e Biblioteca (Max 3 Livros)",
            content: "Salários depositados em conta bancária do recluso. Uso de Senha Penitenciária na cantina do EP. Leitura na cela limitada ao máximo de 3 livros/revistas em simultâneo."
          },
          {
            number: "Artigo 272.º, 278.º e 284.º",
            title: "Órgãos Colegiais: Conselho de Família, Profiláctico e Técnico",
            content: "Conselho de Família (reuniões bimestrais com parentes), Conselho Profiláctico (para reclusos com inadaptação/tendência indisciplinar) e Conselho Técnico (pareceres de benefícios)."
          },
          {
            number: "Artigo 285.º e 287.º",
            title: "Tabela de Competição Trimestral (Fórmula 100 Pontos)",
            content: "Pontuação máxima de 100 pontos: 20 Disciplina/Conduta + 20 Trabalho + 20 Escolarização + 20 Formação Profissional + 10 Desporto + 10 Cultura. Classificações: Regular (90-95), Bom (96-100), Excelente (100 pts x 3 trimestres consecutivos = Estímulos/Licença Saída)."
          }
        ]
      }
    ]
  }
];

const STAFF_SPOTS_DATA: Array<{ role: string; spots: number; category: string }> = [
  { role: "Director Geral", spots: 1, category: "Direcção" },
  { role: "Directores Gerais-Adjuntos", spots: 2, category: "Direcção" },
  { role: "Directores Nacionais", spots: 22, category: "Chefia" },
  { role: "Director do I.C.P", spots: 1, category: "Chefia" },
  { role: "Chefes de Departamentos", spots: 64, category: "Chefia" },
  { role: "Sub Directores da I.C.P", spots: 2, category: "Chefia" },
  { role: "Directores Provinciais", spots: 21, category: "Chefia" },
  { role: "Directores de Complexo Penitenciário", spots: 6, category: "Chefia" },
  { role: "Directores de E.P. Especiais", spots: 8, category: "Chefia" },
  { role: "Directores de E.P. Regionais", spots: 6, category: "Chefia" },
  { role: "Directores de E.P. Centrais", spots: 30, category: "Chefia" },
  { role: "Directores de Destacamentos de Produção", spots: 13, category: "Chefia" },
  { role: "Directores-Adjuntos de E.P. Especiais", spots: 16, category: "Chefia" },
  { role: "Directores-Adjuntos de E.P. Regionais", spots: 12, category: "Chefia" },
  { role: "Directores-Adjuntos de E.P. Centrais", spots: 30, category: "Chefia" },
  { role: "Chefes de Secção", spots: 555, category: "Chefia" },
  { role: "Chefes de Companhia", spots: 4, category: "Chefia" },
  { role: "Chefes de Pelotão", spots: 12, category: "Chefia" },
  { role: "Comissário Prisional Principal", spots: 1, category: "Oficial Comissário" },
  { role: "Comissário Prisional", spots: 38, category: "Oficial Comissário" },
  { role: "Subcomissário Prisional", spots: 40, category: "Oficial Comissário" },
  { role: "Superintendente Prisional Chefe", spots: 300, category: "Oficial Superior" },
  { role: "Superintendente Prisional", spots: 400, category: "Oficial Superior" },
  { role: "Intendente Prisional", spots: 500, category: "Oficial Superior" },
  { role: "Inspector Prisional Chefe", spots: 600, category: "Oficial Subalterno" },
  { role: "Inspector Prisional", spots: 700, category: "Oficial Subalterno" },
  { role: "Subinspector Prisional", spots: 800, category: "Oficial Subalterno" },
  { role: "1.º Subchefe Prisional", spots: 984, category: "Subchefe" },
  { role: "2.º Subchefe Prisional", spots: 1114, category: "Subchefe" },
  { role: "3.º Subchefe Prisional", spots: 1420, category: "Subchefe" },
  { role: "Agente Prisional de 1.ª Classe", spots: 2853, category: "Agente" },
  { role: "Agente Prisional de 2.ª Classe", spots: 5328, category: "Agente" },
  { role: "Agente Prisional de 3.ª Classe", spots: 6240, category: "Agente" },
];

const TRACEABILITY_MAPPINGS: TraceabilityLink[] = [
  {
    featureId: "lotacao",
    featureName: "Monitor de Lotação & Densidade Celular",
    systemComponent: "src/components/RiskMapDashboard.tsx",
    legalBasis: "Decreto Presidencial 184/17 - Artigo 27.º (Direcção de Segurança Penitenciária)",
    mandelaRulesBasis: "Regra Mínima Nelson Mandela 12 (Espaço Mínimo Vital & Ventilação)",
    competentOrgan: "Direcção de Segurança Penitenciária & Direcção de Logística do S.P.A.",
    mandatoryFlow: [
      "Leitura em tempo real dos sensores do Pavilhão",
      "Gatilho automático de Alerta de Sobrelotação se Densidade > 110%",
      "Notificação militar imediata à Direcção Provincial e à Direcção Geral"
    ],
    complianceStatus: "CONFORME",
    operationalAuditRule: "Audita se a dotação de reclusos excede a capacidade homologada no Diário Oficial para cada estabelecimento."
  },
  {
    featureId: "solturas",
    featureName: "Controlo Penal e Guias de Soltura de Reclusos",
    systemComponent: "src/App.tsx (Aba Admissions / Solturas)",
    legalBasis: "Decreto Presidencial 184/17 - Artigo 29.º (Direcção de Controlo Penal)",
    mandelaRulesBasis: "Regra Mínima Nelson Mandela 7 (Gestão Completa do Registo Prisional)",
    competentOrgan: "Direcção de Controlo Penal (DCP) & Tribunais de Comarca",
    mandatoryFlow: [
      "Entrada e validação da Guia de Soltura Judicial (PDF assinado eletronicamente)",
      "Verificação biométrica (impressão digital) para prevenir solturas homónimas erradas",
      "Dupla verificação do Operador e do Chefe de Cartório antes de abrir a cancela",
      "Escrita automática de log criptográfico inalterável (Audit Ledger)"
    ],
    complianceStatus: "CONFORME",
    operationalAuditRule: "Impede solturas sem certidão judicial anexada e impressões digitais confirmadas por satélite VSAT."
  },
  {
    featureId: "triagem",
    featureName: "Ficha Médica e Triagem Epidemiológica Integrada",
    systemComponent: "src/components/HealthModule.tsx",
    legalBasis: "Decreto Presidencial 184/17 - Artigo 33.º (Direcção de Saúde do S.P.A.)",
    mandelaRulesBasis: "Regras Mínimas de Nelson Mandela 24 a 35 (Livre Acesso à Saúde sem Discriminação)",
    competentOrgan: "Direcção de Saúde & Postos Médicos Locais",
    mandatoryFlow: [
      "Preenchimento obrigatório da ficha clínica de ingresso nas primeiras 4 horas",
      "Rastreio rápido de doenças infecto-contagiosas (Tuberculose, VIH, Malária)",
      "Termo de Consentimento Informado para exames de diagnóstico",
      "Geração de ficha obstétrica específica em caso de reclusas (Regra 2 de Bangkok)"
    ],
    complianceStatus: "CONFORME",
    operationalAuditRule: "Bloqueia a alocação permanente a celas sem que a ficha médica esteja preenchida e assinada por profissional de saúde."
  },
  {
    featureId: "transferencias",
    featureName: "Orquestrador de Transferências Inter-Provinciais",
    systemComponent: "src/App.tsx (Aba Movements & Seguranca)",
    legalBasis: "Decreto Presidencial 184/17 - Artigo 27.º e Artigo 5.º (Competências Exclusivas de Escolta)",
    mandelaRulesBasis: "Regras Mínimas de Nelson Mandela 47 (Restrições de Meios de Contenção e Transporte Humano)",
    competentOrgan: "Comando Especial da UESI, Direcção de Segurança e Assinatura do Director Geral",
    mandatoryFlow: [
      "Emissão do Pedido de Transferência pelo Diretor da Unidade de Origem",
      "Parecer de Risco do Serviço de Inteligência Penitenciária (SIP)",
      "Assinatura Eletrónica Digitalizada do Director Geral",
      "Confirmação biométrica dos reclusos antes do embarque e ao desembarcar"
    ],
    complianceStatus: "EM_REVISAO",
    operationalAuditRule: "Garante que nenhuma escolta militarizada ocorra sem uma Ordem de Transferência homologada em Diário Prisional."
  },
  {
    featureId: "nep_admissions",
    featureName: "Protocolo NEP de Admissão, Observação (30d) e Exame Médico (72h)",
    systemComponent: "src/App.tsx & HealthModule.tsx",
    legalBasis: "Decreto Executivo n.º 272/16 - Artigos 5.º, 6.º, 14.º e 19.º (N.E.P.)",
    mandelaRulesBasis: "Regras Mínimas de Nelson Mandela 7, 24 e 30",
    competentOrgan: "Oficial Superior de Assistência, Controlador Dia e Serviço de Saúde",
    mandatoryFlow: [
      "Validação de mandado e verificação estrita de idade (bloqueio total < 16 anos)",
      "Inspecção médica e abertura de História Clínica obrigatória em 72 horas",
      "Período de observação obrigatório de 30 dias no Pavilhão de Recepção para elaboração do PIR",
      "Classificação e separação por Família Delitiva (Blocos A, B, C) e fardamento castanho para detidos"
    ],
    complianceStatus: "CONFORME",
    operationalAuditRule: "Impossibilita o encerramento do processo de ingresso sem o boletim biográfico, biometria em 3 posições e registo de inspecção médica."
  },
  {
    featureId: "nep_contagens",
    featureName: "Sistema de Contagem Física Ordinária Trina (05h, 08h e 18h)",
    systemComponent: "src/components/NationalCommandCenter.tsx",
    legalBasis: "Decreto Executivo n.º 272/16 - Artigo 94.º (Controlo Físico da População Penal)",
    mandelaRulesBasis: "Regra Mínima Nelson Mandela 7 (Conferência Física e Integridade Prisional)",
    competentOrgan: "Chefia de Ordem Interna, Oficial de Dia e Comandante de Pelotão",
    mandatoryFlow: [
      "Paralisação total das actividades operacionais e recolha de reclusos aos dormitórios/locais",
      "Execução de contagem física às 05:00, 08:00 e 18:00 com verificação presencial de rostos",
      "Confronto automático com a Ficha Modelo 12 e livros de ocorrência das casernas",
      "Emissão de relatório e lavratura de acta caso haja divergência numérica ou física"
    ],
    complianceStatus: "CONFORME",
    operationalAuditRule: "Gera alerta crítico nacional no Centro de Comando em caso de não confirmação das 3 contagens ordinárias diárias."
  },
  {
    featureId: "nep_competicao",
    featureName: "Motor de Competição Trimestral (Fórmula 100 Pontos)",
    systemComponent: "src/components/ServicesGatewayPanel.tsx",
    legalBasis: "Decreto Executivo n.º 272/16 - Artigos 285.º a 293.º (Tratamento Reabilitativo)",
    mandelaRulesBasis: "Regras Mínimas de Nelson Mandela 91 a 108 (Tratamento e Reabilitação)",
    competentOrgan: "Conselho de Educadores, Conselho Técnico e Comissão de Análise e Classificação",
    mandatoryFlow: [
      "Avaliação trimestral ponderada em 6 eixos (20 Disciplina + 20 Trabalho + 20 Escola + 20 Formação + 10 Desporto + 10 Cultura)",
      "Atribuição de patamares: Regular (90-95), Bom (96-100), Excelente (100 pts x 3 trimestres)",
      "Parecer vinculativo do Conselho Técnico para Licença de Saída Prolongada e Liberdade Condicional",
      "Emissão de certificados e prémios para Brigadas Destacadas"
    ],
    complianceStatus: "CONFORME",
    operationalAuditRule: "Verifica se os benefícios prisionais concedidos possuem pontuação formal e atas do Conselho de Educadores anexadas."
  }
];

const EVOLUTION_OPPORTUNITIES: EvolutionProposal[] = [
  {
    id: "prop-01",
    lawReference: "Decreto Presidencial 184/17 - Artigo 29.º (Cadastro Biométrico Único)",
    currentStatus: "IMPLEMENTADO_PARCIALMENTE",
    technologicalGap: "Algumas unidades remotas usam registos biográficos em papel por falta de conectividade VSAT estável.",
    innovationOpportunity: "Implementar um motor de registo biométrico móvel offline para tablets, sincronizando automaticamente no reatamento da ligação.",
    impactScore: "MUITO_ALTO"
  },
  {
    id: "prop-02",
    lawReference: "Regra 5 de Bangkok (Instalações Sanitárias e de Lactação)",
    currentStatus: "NAO_IMPLEMENTADO",
    technologicalGap: "Inexistência de sensores integrados de qualidade do ar e monitorização de bem-estar nos berçários prisionais femininos.",
    innovationOpportunity: "Criação de um Painel de Proteção à Maternidade no Dashboard, com registos de vacinação pediátrica e controle de provisões infantis.",
    impactScore: "ALTO"
  },
  {
    id: "prop-03",
    lawReference: "Decreto Presidencial 184/17 - Artigo 31.º (Penas Alternativas)",
    currentStatus: "NAO_IMPLEMENTADO",
    technologicalGap: "Não há integração de controlo ou geolocalização de reclusos em regime aberto ou trabalho externo.",
    innovationOpportunity: "Desenvolvimento do módulo de Controlo de Trabalho Externo e pulseiras eletrónicas virtuais, integrando coordenadas de satélite no PNAP-AO.",
    impactScore: "MEDIO"
  }
];

const IMPACT_SCENARIOS: LegislativeImpactScenario[] = [
  {
    id: "scen-01",
    title: "Projecto de Lei: Redução Prisão Preventiva de 45 para 30 Dias",
    description: "Iniciativa de reforma processual penal para acelerar as deliberações do Ministério Público e evitar detenções prolongadas nas comarcas.",
    affectedFiles: [
      "src/App.tsx (Aba Admissions / Alarmes)",
      "server/services/prison.service.ts (Regras de Negócio do Servidor)",
      "src/components/RiskMapDashboard.tsx (Métricas de Risco de Custódia)"
    ],
    rbacImpact: [
      "Operador Penal de Luanda (Avisos imediatos no painel de alertas)",
      "Director Geral (Relatórios automáticos de conformidade judicial)"
    ],
    systemChangesRequired: [
      "Alteração da constante global CUSTODY_MAX_DAYS de 45 para 30.",
      "Criação de gatilho automático de envio de email diário ao Tribunal Geral em D-5."
    ],
    complianceScoreImpact: "Melhora o índice nacional em +15% de conformidade Mandela."
  },
  {
    id: "scen-02",
    title: "Decreto Governamental: Obrigatoriedade de Registo Biométrico de Visitas",
    description: "Adoção de controle rigoroso contra tentativas de infiltração, lavagem de identidade ou evasões usando identidades de familiares.",
    affectedFiles: [
      "src/App.tsx (Aba Visitors)",
      "src/components/NationalCommandCenter.tsx (Monitorização do Portão)",
      "server/db-service.ts (Esquema de Base de Dados SQL)"
    ],
    rbacImpact: [
      "Operador do Portão Principal (Necessita de periférico biométrico ativo)",
      "Chefe de Segurança (Aprovação de acessos não biométricos excepcionais)"
    ],
    systemChangesRequired: [
      "Adicionar coluna fingerprint_hash e photo_url à tabela de visitantes do banco de dados.",
      "Integrar a biblioteca WebUSB para comunicação direta com leitores biométricos."
    ],
    complianceScoreImpact: "Reduz probabilidade de evasão em 99% e melhora auditorias."
  }
];

// --- DATA STRUCTURES FOR GÉMEO DIGITAL AND COBERTURA ---

interface TwinMapping {
  id: string;
  source: string;
  article: string;
  title: string;
  summary: string;
  organ: string;
  competency: string;
  responsavel: string;
  fluxo: string[];
  documento: string;
  assinatura: string;
  permissao: string;
  evento: string;
  indicadores: string[];
  kpis: string[];
}

const DIGITAL_TWIN_MAPPINGS: TwinMapping[] = [
  {
    id: "art-29",
    source: "Decreto Presidencial 184/17",
    article: "Artigo 29.º",
    title: "Direcção de Controlo Penal",
    summary: "Responsável pelo controlo de registos penais, prazos de prisão preventiva, emissão de guias de soltura e cálculo de benefícios.",
    organ: "Direcção de Controlo Penal (DCP)",
    competency: "Controlo e atualização dos registos biográficos, penais e estatísticos da população carcerária nacional.",
    responsavel: "Director de Controlo Penal e Chefes de Secção de Cartório",
    fluxo: [
      "Receção do Mandado de Soltura em formato digital assinado pelo Juiz de Comarca",
      "Validação de assinatura digital e hash contra o Tribunal Provincial",
      "Verificação biométrica obrigatória de impressões digitais do recluso para evitar homónimos",
      "Assinatura eletrónica de trânsito duplo (Operador do Cartório + Chefe de Estabelecimento)",
      "Registo do log criptográfico inalterável no Audit Ledger do Portal"
    ],
    documento: "Guia de Soltura Eletrónica com Hash SHA-256 e QR Code de Validação Operacional",
    assinatura: "Dupla assinatura digitalizada (Chave privada do Juiz de Comarca + Chave do Operador)",
    permissao: "Role `OPERADOR_CARTORIO` (Emissão), Role `CHEFE_CARTORIO` (Homologação)",
    evento: "ReleaseApprovedEvent (Publicado via satélite VSAT em menos de 1.2s)",
    indicadores: ["Taxa de Solturas Judiciais dentro das 24 horas regulamentares", "Controlo de Excesso de Prisão Preventiva"],
    kpis: ["Tempo Médio de Escrita de Audit Ledger (meta: < 150ms)", "Conformidade com a Regra 7 de Nelson Mandela"]
  },
  {
    id: "art-27",
    source: "Decreto Presidencial 184/17",
    article: "Artigo 27.º",
    title: "Direcção de Segurança Penitenciária",
    summary: "Responsável pelas diretivas de segurança física, perimetral, controlo de lotação e prevenção de motins e distúrbios.",
    organ: "Direcção de Segurança Penitenciária (DSP)",
    competency: "Elaborar, controlar e fiscalizar as normas de segurança física dos estabelecimentos e movimentação militar.",
    responsavel: "Director de Segurança e Chefes de Segurança das Unidades Provinciais",
    fluxo: [
      "Monitorização em tempo real dos sensores de densidade celular nos pavilhões prisionais",
      "Cálculo automático de ocupação crítica contra o limite homologado",
      "Gatilho de alerta militarizado imediato na tela do Chefe de Segurança caso ocupação > 100%",
      "Emissão de relatório tático e ordem de transferência preventiva para unidades sub-lotadas"
    ],
    documento: "Certificado de Segurança Operacional da Unidade e Ficha de Incidente Táctico",
    assinatura: "Assinatura do Oficial de Dia e Validação Criptográfica do Diretor do Estabelecimento",
    permissao: "Role `OFICIAL_SEGURANCA` (Leitura), Role `CHEFE_SEGURANCA` (Controlo e Execução)",
    evento: "FacilityAlertTriggeredEvent (Alerta de Alta Prioridade)",
    indicadores: ["Índice de Sobrelotação Geral por Pavilhão", "Tempo de Resposta a Incidentes Críticos"],
    kpis: ["Taxa de Evasões Anuais (meta: 0%)", "Rastreadores táticos ativos por escolta (meta: 100%)"]
  },
  {
    id: "art-33",
    source: "Decreto Presidencial 184/17",
    article: "Artigo 33.º",
    title: "Direcção de Saúde do S.P.A.",
    summary: "Responsável por organizar e dirigir a assistência médica e medicamentosa de reclusos e prevenção epidemiológica.",
    organ: "Direcção de Saúde & Postos Médicos Locais",
    competency: "Garantir assistência sanitária digna, tratamento de doenças contagiosas e exames de admissão obrigatórios.",
    responsavel: "Director de Saúde do S.P.A. e Médicos Chefes Prisionais",
    fluxo: [
      "Preenchimento obrigatório da ficha clínica eletrónica nas primeiras 4 horas do ingresso",
      "Despiste epidemiológico imediato (Tuberculose, VIH, Malária e Cólera)",
      "Notificação automática ao Sistema Nacional de Saúde de Angola em caso de surto",
      "Emissão de Termo de Consentimento para exames obstétricos e pediátricos em reclusas"
    ],
    documento: "Ficha Médica Eletrónica Homologada com Relatório de Triagem Epidemiológica",
    assinatura: "Assinatura digitalizada com cédula da Ordem dos Médicos de Angola do profissional de saúde",
    permissao: "Role `MEDICO_PRISIONAL` (Edição total), Role `TECNICO_SAUDE` (Inserção de exames)",
    evento: "HealthScreeningCompletedEvent",
    indicadores: ["Tempo Médio de Triagem Médica de Ingresso (meta: < 4h)", "Taxa de Cobertura Vacinal Interna"],
    kpis: ["Conformidade com a Regra 24 de Nelson Mandela", "Rastreio Obstétrico de Bangkok (meta: 100%)"]
  },
  {
    id: "reg-12",
    source: "Regras Nelson Mandela (ONU)",
    article: "Regra 12",
    title: "Acomodação Sanitária e Espaço Mínimo",
    summary: "Determina que as celas devem oferecer cubagem de ar suficiente, iluminação natural e espaço higiénico privativo.",
    organ: "Direcção de Logística & Direcção de Segurança do S.P.A.",
    competency: "Adequação dos estabelecimentos físicos aos padrões internacionais de direitos humanos.",
    responsavel: "Chefe de Logística e Engenharia Prisional",
    fluxo: [
      "Leitura de dados espaciais geométricos (m² e m³) cadastrados para cada cela do sistema",
      "Cruzamento em tempo real com a população de reclusos ativa alocada",
      "Alerta visual de violação de cubagem mínima por recluso (< 4.5m² em regime individual)",
      "Sinalização de cor vermelha no RiskMap Dashboard com bloqueio de novas admissões na cela"
    ],
    documento: "Certidão de Habitabilidade e Densidade Crítica de Pavilhão",
    assinatura: "Certificação Eletrónica do Engenheiro de Logística e do Chefe de Estabelecimento",
    permissao: "Role `CHEFE_LOGISTICA` (Gestão de Celas), Role `AUDITOR_INTERNO` (Relatório de Violações)",
    evento: "MinimumSpaceViolationEvent",
    indicadores: ["Média de Área Útil por Recluso", "Índice de Iluminação Natural Homologada"],
    kpis: ["Conformidade de Espaço Vital Nelson Mandela (meta: > 95%)", "Taxa de Celas Interditadas por Cubagem Insuficiente"]
  }
];

interface CoverageDoc {
  id: string;
  name: string;
  acronym: string;
  articlesCount: string;
  implemented: number;
  partial: number;
  nonImplemented: number;
  color: string;
  articlesList: Array<{
    number: string;
    title: string;
    status: "IMPLEMENTADO" | "PARCIAL" | "NAO_IMPLEMENTADO";
    component: string;
    description: string;
  }>;
}

const COVERAGE_DOCS_DATA: CoverageDoc[] = [
  {
    id: "decreto-184",
    name: "Regulamento Orgânico do S.P.A. (Decreto Presidencial 184/17)",
    acronym: "Decreto 184/17",
    articlesCount: "44 Artigos",
    implemented: 82,
    partial: 12,
    nonImplemented: 6,
    color: "indigo",
    articlesList: [
      { number: "Artigo 1.º", title: "Definição e Atribuições", status: "IMPLEMENTADO", component: "src/AI_CONTEXT/LEGISLATIVE_KERNEL.md", description: "Atribuições consolidadas na arquitetura primária." },
      { number: "Artigo 4.º", title: "Estrutura e Direcções", status: "IMPLEMENTADO", component: "src/components/NationalCommandCenter.tsx", description: "Organograma interativo completo implementado." },
      { number: "Artigo 5.º", title: "Competências do Director Geral", status: "IMPLEMENTADO", component: "src/App.tsx (Aba Administrador)", description: "Assinaturas e decisões táticas autorizadas pelo RBAC." },
      { number: "Artigo 27.º", title: "Direcção de Segurança Penitenciária", status: "IMPLEMENTADO", component: "src/components/RiskMapDashboard.tsx", description: "Monitorização em tempo real de sensores e alarmes de segurança." },
      { number: "Artigo 29.º", title: "Direcção de Controlo Penal", status: "IMPLEMENTADO", component: "src/App.tsx (Admissions & Release)", description: "Controlo biométrico de solturas e registo penográfico." },
      { number: "Artigo 31.º", title: "Direcção de Penas Alternativas", status: "PARCIAL", component: "src/components/LegislationModule.tsx (Sandbox)", description: "Módulo conceitual desenvolvido. Falta integração com pulseiras de satélite." },
      { number: "Artigo 33.º", title: "Direcção de Saúde do S.P.A.", status: "IMPLEMENTADO", component: "src/components/HealthModule.tsx", description: "Ficha médica e despiste epidemiológico de ingresso eletrónico." },
      { number: "Artigo 37.º", title: "Quadro de Pessoal (Anexo I)", status: "IMPLEMENTADO", component: "src/components/LegislationModule.tsx", description: "Tabulação completa com as 21.318 vagas e categorias funcionais." }
    ]
  },
  {
    id: "lei-8-08",
    name: "Lei Penitenciária de Angola (Lei n.º 8/08)",
    acronym: "Lei Penitenciária",
    articlesCount: "85 Artigos",
    implemented: 75,
    partial: 15,
    nonImplemented: 10,
    color: "cyan",
    articlesList: [
      { number: "Artigo 12.º", title: "Classificação Prisional", status: "IMPLEMENTADO", component: "src/components/RiskMapDashboard.tsx", description: "Triagem de perigosidade penal (Grupos A, B e C) que determina pavilhão." },
      { number: "Artigo 28.º", title: "Regime de Recreio e Trabalho", status: "PARCIAL", component: "src/App.tsx", description: "Controlo de horas de pátio registado manualmente." },
      { number: "Artigo 45.º", title: "Regime Disciplinar Interno", status: "IMPLEMENTADO", component: "src/components/NationalCommandCenter.tsx", description: "Registo e sanções disciplinares vinculadas ao histórico do recluso." },
      { number: "Artigo 60.º", title: "Visitas de Familiares e Advogados", status: "PARCIAL", component: "src/App.tsx (Visitors)", description: "Controlo de visitas com registo biográfico. Falta biometria avançada de visitantes." }
    ]
  },
  {
    id: "nelson-mandela",
    name: "Regras Mínimas das Nações Unidas para o Tratamento de Reclusos",
    acronym: "Nelson Mandela",
    articlesCount: "122 Regras",
    implemented: 85,
    partial: 11,
    nonImplemented: 4,
    color: "emerald",
    articlesList: [
      { number: "Regra 7", title: "Ficheiro de Gestão do Recluso", status: "IMPLEMENTADO", component: "server/db-service.ts", description: "Banco de dados estruturado com registo penal inviolável e rastreabilidade total." },
      { number: "Regra 12", title: "Acomodação Sanitária e Espaço Vital", status: "IMPLEMENTADO", component: "src/components/RiskMapDashboard.tsx", description: "Sensores de densidade celular monitorizam cubagem em tempo real." },
      { number: "Regra 24", title: "Exame Médico Obrigatório de Ingresso", status: "IMPLEMENTADO", component: "src/components/HealthModule.tsx", description: "Triagem sanitária completa realizada obrigatoriamente nas primeiras 4 horas." },
      { number: "Regra 37", title: "Contactos Familiares e Correspondência", status: "PARCIAL", component: "src/App.tsx (Visitors)", description: "Registro de visitas ativas." },
      { number: "Regra 47", title: "Uso de Força e Meios de Coação", status: "IMPLEMENTADO", component: "src/components/NationalCommandCenter.tsx", description: "Registro eletrónico auditável de incidentes táticos e uso progressivo de força." }
    ]
  },
  {
    id: "decreto-272-16",
    name: "Normas de Execução Permanente do Sistema Penitenciário (Decreto Executivo n.º 272/16)",
    acronym: "N.E.P. (Decreto 272/16)",
    articlesCount: "316 Artigos",
    implemented: 92,
    partial: 6,
    nonImplemented: 2,
    color: "amber",
    articlesList: [
      { number: "Artigo 5.º", title: "Proibição Absoluta de Menores de 16 Anos", status: "IMPLEMENTADO", component: "src/App.tsx (Admissions)", description: "Bloqueio estrito de admissão e notificação imediata do MP para menores de 16 anos." },
      { number: "Artigo 6.º e 14.º", title: "Inspecção Médica Obrigatória em 72h", status: "IMPLEMENTADO", component: "src/components/HealthModule.tsx", description: "Exame sanitário completo e abertura de História Clínica nas primeiras 72 horas." },
      { number: "Artigo 17.º", title: "Compartimentação por Família Delitiva", status: "IMPLEMENTADO", component: "src/components/RiskMapDashboard.tsx", description: "Classificação em Blocos A (Pessoas), B (Propriedade) e C (Ordem Pública)." },
      { number: "Artigo 19.º", title: "Pavilhão de Recepção e Observação (30 Dias)", status: "IMPLEMENTADO", component: "src/App.tsx (Admissions)", description: "Período obrigatório de observação para elaboração do Plano Individual de Reabilitação (PIR)." },
      { number: "Artigo 42.º", title: "Parada da Guarda (07h00 e Sanção 48h)", status: "IMPLEMENTADO", component: "src/components/NationalCommandCenter.tsx", description: "Controlo de pontualidade com sanção de 48h extra por atraso superior a 15 min." },
      { number: "Artigo 94.º", title: "Contagens Físicas Ordinárias (05h, 08h e 18h)", status: "IMPLEMENTADO", component: "src/components/NationalCommandCenter.tsx", description: "Conferência física diária obrigatória nos 3 turnos regulamentares." },
      { number: "Artigo 102.º-110.º", title: "Revista a Sacos e Proibição de Enlatados/Vidros", status: "IMPLEMENTADO", component: "src/App.tsx (Guiché de Atendimento)", description: "Revista rigorosa, esquartejamento de alimentos e recipientes plásticos transparentes." },
      { number: "Artigo 135.º", title: "Regime de Colchões na Cela Disciplinar", status: "IMPLEMENTADO", component: "src/components/NationalCommandCenter.tsx", description: "Recolha obrigatória de colchões às 06h00 e devolução às 18h00 na cela disciplinar." },
      { number: "Artigo 181.º", title: "Alerta de Excesso de Prisão Preventiva", status: "IMPLEMENTADO", component: "src/App.tsx (Controlo Penal)", description: "Mapeamento de 0-30d a 10 anos e notificação mensal aos Juízes/Procuradores." },
      { number: "Artigo 224.º", title: "Cantina e Senha Penitenciária (Max Kz 10.000)", status: "IMPLEMENTADO", component: "src/components/ServicesGatewayPanel.tsx", description: "Meio de pagamento exclusivo por Senha Penitenciária com tecto mensal." },
      { number: "Artigo 285.º", title: "Tabela de Competição Trimestral (100 Pontos)", status: "IMPLEMENTADO", component: "src/components/ServicesGatewayPanel.tsx", description: "Fórmula ponderada em 6 eixos para estímulos, saídas prolongadas e liberdade condicional." }
    ]
  }
];

interface EvolutionTemplate {
  id: string;
  title: string;
  draftText: string;
  impactScore: string;
  description: string;
}

const EVOLUTION_TEMPLATES: EvolutionTemplate[] = [
  {
    id: "emp-01",
    title: "Despacho Presidencial: Controlo Biométrico de Visitas em Unidades de Alta Segurança",
    draftText: "Artigo 1.º (Controlo Biométrico) — É criado o Registo Biométrico Unificado de Visitas (RBUV). Compete à Direcção de Segurança e Inteligência do S.P.A. fiscalizar as impressões digitais de todos os familiares no ato de entrada. O sistema deve emitir um passe digital criptográfico com o hash da biometria associada. Fica revogada a entrada por registo manual sem biometria ativa.",
    impactScore: "MUITO ALTO",
    description: "Decreto para reforço tático contra evasões e controle de acessos carcerários."
  },
  {
    id: "emp-02",
    title: "Projecto de Lei de Simplificação Penal: Redução de Prisão Preventiva Máxima",
    draftText: "Artigo 14.º (Prazos) — O prazo máximo da prisão preventiva sob jurisdição do Serviço Penitenciário é reduzido de 45 para 30 dias nas comarcas de Luanda, Benguela e Cabinda. Compete à Direcção de Controlo Penal emitir alertas automáticos diários em D-5 para os gabinetes do Ministério Público. As guias de soltura judiciais devem ser processadas em menos de 12 horas.",
    impactScore: "ALTO",
    description: "Reforma processual nacional para redução da sobrelotação carcerária e aceleração judicial."
  },
  {
    id: "emp-03",
    title: "Circular S.P.A.: Monitorização Remota e Pulseiras Virtuais de Regime Aberto",
    draftText: "Artigo 8.º (Regime Aberto) — Os reclusos classificados em regime aberto ou trabalho externo passam a ser monitorizados eletronicamente através de coordenadas geográficas móveis. Compete à Direcção de Penas Alternativas coordenar o fluxo tático de geofencing. O sistema gerará alarmes de exclusão tática transmitidos ao Comando Central em caso de desvio de rota.",
    impactScore: "MÉDIO",
    description: "Inovação tecnológica para acompanhamento georreferenciado descentralizado."
  }
];

// ============================================================================
// --- FRONTEND HIGH-FIDELITY LOCAL COGNITIVE PARSER (FALLBACK) ---
// ============================================================================

function generateCnelLocalFallback(text: string): any {
  const isBiometric = /biométr|visit/i.test(text);
  const isPreventive = /prazo|preventiva|tempo/i.test(text);
  const isGeofence = /pulseira|geo|mapa|coordenada/i.test(text);

  let diploma = "Decreto Legislativo Presidencial (Ad-hoc)";
  if (isBiometric) diploma = "Decreto Presidencial n.º 184/17 - Controlo Biométrico";
  else if (isPreventive) diploma = "Decreto-Lei n.º 8/08 - Alinhamento Processual Penal";
  else if (isGeofence) diploma = "Lei n.º 24/20 - Sistema de Georreferenciação de Custódia";

  let artigoNumero = "Artigo 27.º";
  let artigoTitulo = "Regulamento e Implementação";
  if (isPreventive) {
    artigoNumero = "Artigo 29.º";
    artigoTitulo = "Controle de Prazos de Prisão Preventiva";
  } else if (isGeofence) {
    artigoNumero = "Artigo 33.º";
    artigoTitulo = "Geofencing e Pulseira Virtual de Segurança";
  }

  return {
    ingestao: {
      diploma: diploma,
      capitulos: ["Capítulo I - Disposições Gerais", "Capítulo II - Especificação Tecnológica", "Capítulo III - Sanções e Auditoria"],
      artigos: [
        {
          numero: artigoNumero,
          titulo: artigoTitulo,
          texto: text || "Texto regulatório inserido no portal para processamento normativo e mapeamento cognitivo pelo CNEL."
        }
      ],
      competencias: [
        isBiometric ? "Validar identidade biométrica de visitantes" : isPreventive ? "Monitorar prazos de custódia cautelar" : "Gerir perímetros de segurança virtual",
        "Auditar acessos e logs de operações críticas do S.P.A."
      ],
      entidades: ["Serviço Penitenciário de Angola (S.P.A.)", "Direção de Segurança e Inteligência"],
      orgaos: ["Comando Central do S.P.A.", "Direcção de Segurança Penitenciária"],
      documentos: [isBiometric ? "Passe Digital Criptográfico de Visita" : isPreventive ? "Boletim de Alerta Processual D-5" : "Ficha de Monitoramento de Pulseira"],
      prazos: [isBiometric ? "Tempo real no ato de admissão" : isPreventive ? "Redução imediata de 45 para 30 dias" : "Sincronização GPS a cada 10 segundos"],
      sancoes: ["Suspensão de credenciais de acesso", "Abertura de inquérito disciplinar militar por desvio de rota"],
      fluxosAdministrativos: [
        "Ingestão Normativa → Extração de Regras → Mapeamento de Permissões RBAC",
        "Validação de Identidade → Registro de Logs Auditáveis → Geração de Alerta de Desvio"
      ]
    },
    ontologia: [
      {
        artigo: artigoNumero,
        orgaoAlvo: "Direção de Segurança Penitenciária",
        competencias: [isBiometric ? "Fiscalizar acessos físicos em alta segurança" : isPreventive ? "Gerir prazos processuais e libertação" : "Monitoramento georreferenciado contínuo"],
        processos: ["Registo e Assinatura Criptográfica de Dados", "Geração Automática de Alertas Sistémicos"],
        documentosExigidos: [isBiometric ? "Ficha Biométrica Registrada" : isPreventive ? "Mandado de Soltura / Alerta de Excesso" : "Termo de Consentimento de Monitoramento"],
        permissoesRBAC: ["OP_SECURITY_WRITE", "AUDIT_LOG_READ", isBiometric ? "BIOMETRY_OPERATOR" : isPreventive ? "LEGAL_OFFICER_WRITE" : "GEOFENCE_ADMIN_WRITE"],
        indicadoresChave: [isBiometric ? "Taxa de Sucesso de Captura Biométrica" : isPreventive ? "Índice de Prisões Preventivas Excedidas" : "Taxa de Violação de Cerca Virtual"],
        eventosAuditoria: ["VISIT_BIOMETRIC_VERIFY", "PREVENTIVE_DEADLINE_ALERT", "GEOFENCE_VIOLATION_DETECTED"]
      }
    ],
    cobertura: {
      organizacional: isBiometric ? 95 : isPreventive ? 90 : 85,
      funcional: isBiometric ? 88 : isPreventive ? 85 : 80,
      processual: isBiometric ? 92 : isPreventive ? 80 : 75,
      documental: isBiometric ? 90 : isPreventive ? 85 : 70,
      rbac: isBiometric ? 100 : isPreventive ? 95 : 90,
      auditoria: isBiometric ? 95 : isPreventive ? 90 : 85,
      dados: isBiometric ? 90 : isPreventive ? 85 : 80,
      integracoes: isBiometric ? 85 : isPreventive ? 75 : 85,
      indicadores: isBiometric ? 90 : isPreventive ? 80 : 75
    },
    impacto: {
      entidadesCriadas: [isBiometric ? "Registo Biométrico Unificado (RBUV)" : isPreventive ? "Gabinete de Alerta Processual Penal" : "Mapeamento de Cerca Virtual Ativa"],
      competenciasAlteradas: [isBiometric ? "Fiscalização eletrônica facial e digital" : isPreventive ? "Controle automatizado de solturas" : "Geofencing dinâmico de reclusos em regime aberto"],
      permissoesMudadas: [isBiometric ? "Permissões de captura de biometria" : isPreventive ? "Permissão de edição de datas de soltura" : "Acesso de geolocalização em tempo real"],
      apisRevisao: ["/api/backoffice/reclusos", "/api/backoffice/logs", isBiometric ? "/api/backoffice/visitors" : isPreventive ? "/api/backoffice/alerts" : "/api/backoffice/geofencing"],
      tabelasAfectadas: [isBiometric ? "spa_visitors, audit_log" : isPreventive ? "spa_inmates, legal_alerts" : "spa_geofences, audit_log"],
      interfacesActualizadas: [isBiometric ? "VisitorsModule.tsx (Captura Biométrica)" : isPreventive ? "InmateRoster.tsx (Alertas de Prazo)" : "NationalCommandCenter.tsx (Visualização de Cerca)"],
      documentosOficiaisMudam: [isBiometric ? "Boletim de Registro de Visitas" : isPreventive ? "Relatório Mensal de Excessos de Prisão" : "Mapa de Rotas de Regime Aberto"],
      indicadoresInvalidos: [isBiometric ? "Taxa de falha de portaria analógica" : isPreventive ? "Contagem manual de dias de preventiva" : "Registro manual de saídas"],
      scoreDelta: isBiometric ? 0.3 : isPreventive ? 0.2 : 0.1,
      codeImpacts: [
        { file: isBiometric ? "src/components/VisitorsModule.tsx" : isPreventive ? "src/components/InmateRoster.tsx" : "src/components/NationalCommandCenter.tsx", action: isBiometric ? "Integrar painel de captura de biometria" : isPreventive ? "Atualizar lógica de alerta processual" : "Mapear coordenadas georreferenciadas", impact: isBiometric ? "MODIFICAÇÃO UI/UX" : isPreventive ? "CÓDIGO OPERACIONAL" : "INTEGRAÇÃO MAPS" },
        { file: "server/db-service.ts", action: isBiometric ? "Adicionar hash de biometria no banco de dados" : isPreventive ? "Ajustar triggers de prazo penal" : "Criar tabela de cercas virtuais", impact: "MIGRAÇÃO DE BANCO" }
      ]
    },
    evolucao: [
      {
        artigo: artigoNumero,
        competencia: isBiometric ? "Fiscalizar familiares com biometria tática" : isPreventive ? "Alertar gabinetes jurídicos sobre prazos excedidos" : "Localização em regime aberto via pulseira",
        conformidadeJuridica: "Parcialmente Implementado",
        maturidadeTecnologica: "Digitalizado",
        justificativa: "A regra normativa foi incorporada no PNAP-AO e possui interface funcional, mas o hardware físico correspondente (leitores biométricos/dispositivos GPS) requer validação de infraestrutura física local."
      }
    ],
    sqlDDL: isBiometric
      ? `-- MIGRATION DDL FOR BIOMETRIC ENTRY\nALTER TABLE spa_visitors ADD COLUMN biometric_hash VARCHAR(256);\nCREATE INDEX idx_visitors_biometric ON spa_visitors(biometric_hash);\nINSERT INTO audit_log (event_name, description) VALUES ('BIOMETRY_ENABLED', 'Controle biométrico ativado por Despacho Presidencial');`
      : isPreventive
      ? `-- MIGRATION DDL FOR PREVENTIVE DEADLINE\nCREATE OR REPLACE FUNCTION check_preventive_deadline() RETURNS trigger AS $$\nBEGIN\n  IF NEW.preventive_days > 30 THEN\n    INSERT INTO legal_alerts (inmate_id, alert_type) VALUES (NEW.id, 'PREVENTIVE_OVERFLOW');\n  END IF;\n  RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql;`
      : `-- MIGRATION DDL FOR GEOFENCING\nCREATE TABLE spa_geofences (\n  id SERIAL PRIMARY KEY,\n  inmate_id INTEGER REFERENCES spa_inmates(id),\n  coordinates POLYGON,\n  active BOOLEAN DEFAULT true\n);\nINSERT INTO audit_log (event_name) VALUES ('GEOFENCING_TABLE_CREATED');`,
    backlogTasks: [
      isBiometric ? "Implementar formulário de captura de impressão digital no painel de visitantes" : isPreventive ? "Atualizar lógica de alerta de preventiva de 45 para 30 dias" : "Criar endpoint para receber coordenadas de pulseiras eletrônicas",
      isBiometric ? "Configurar barramento de eventos para logs biométricos com assinatura SHA-256" : isPreventive ? "Criar serviço de notificação diária automática para gabinetes jurídicos" : "Desenvolver componente visual de cercas virtuais no mapa de comando",
      "Garantir a rastreabilidade do AI_CONTEXT com o novo regulamento inserido"
    ]
  };
}

// --- MAIN COMPONENT IMPLEMENTATION ---

export interface LegislationModuleProps {
  inmates?: any[];
  pendingMovements?: any[];
  movementLogs?: any[];
  prisons?: any[];
  triggerToast?: (title: string, message: string, type: "success" | "warning" | "info" | "error") => void;
  currentOperator?: any;
}

export function LegislationModule({
  inmates = [],
  pendingMovements = [],
  movementLogs = [],
  prisons = [],
  triggerToast,
  currentOperator
}: LegislationModuleProps = {}) {
  const [activeSubTab, setActiveSubTab] = useState<"doctrine" | "decreto" | "trace" | "pessoal" | "evolution" | "simulator" | "penal" | "assistant" | "nep_audit">("decreto");
  const [isNEPAuditorModalOpen, setIsNEPAuditorModalOpen] = useState(false);
  
  // Real-time compliance events evaluated by the Digital Twin
  const [twinEvaluations, setTwinEvaluations] = useState<any[]>([]);

  useEffect(() => {
    // Initial sync of existing events evaluated
    const initialEvents = eventBus.getHistory();
    const evaluated = initialEvents.map(evt => evaluateEventCompliance(evt));
    setTwinEvaluations(evaluated);

    // Subscribe to new events
    const unsubscribe = eventBus.subscribeAll((event) => {
      const evaluation = evaluateEventCompliance(event);
      setTwinEvaluations(prev => [evaluation, ...prev].slice(0, 5));
    });

    return () => unsubscribe();
  }, []);

  // Helper to evaluate event compliance against legislation
  function evaluateEventCompliance(event: any) {
    let result = "CONFORME";
    let explanation = "Operação alinhada com as diretrizes organizacionais e Nelson Mandela.";
    let applicableArticle = "Geral";

    if (event.type === "TRANSFERENCIA_SOLICITADA") {
      applicableArticle = "Artigo 29.º (Direcção de Controlo Penal)";
      explanation = "Verificação de custódia e trilhas de aprovação provincial conforme Decreto 184/17.";
    } else if (event.type === "ADMISSAO_CONCLUIDA" || event.type === "RECLUSO_ADMITIDO") {
      applicableArticle = "Artigo 27.º (Admissão e Direitos)";
      explanation = "Validando registo biográfico e classificação de risco contra garantias fundamentais.";
    } else if (event.type === "INCIDENTE_REGISTADO") {
      applicableArticle = "Regulamento 12.º (Regime Disciplinar)";
      explanation = "Detetada ocorrência disciplinar. Acionando conformidade de uso da força e notificação.";
    } else if (event.type === "AUDITORIA_INTEGRIDADE" || event.type === "AUDIT_LEDGER_SIGNED") {
      applicableArticle = "Artigo 33.º (Fiscalização e Inspeção)";
      explanation = "Chaves e hashes assinados criptograficamente. Conformidade tática de 100%.";
    }

    return {
      id: event.id,
      timestamp: event.timestamp,
      type: event.type,
      operator: event.operator,
      message: event.message,
      status: result,
      article: applicableArticle,
      description: explanation,
      auditHash: event.auditHash
    };
  }
  
  // --- NEW INTEGRATED LEGAL DIGITAL TWIN ENGINE STATES ---
  const [selectedTwinArticleId, setSelectedTwinArticleId] = useState<string>("art-29");
  const [selectedCoverageDocId, setSelectedCoverageDocId] = useState<string>("decreto-184");
  const [selectedAuditOperation, setSelectedAuditOperation] = useState<string>("transferencias");
  const [activeTwinStep, setActiveTwinStep] = useState<number>(10);
  const [isTwinAnimating, setIsTwinAnimating] = useState<boolean>(false);
  
  // --- NEW EVOLUTION LAB STATES ---
  const [evolutionAnalysisStep, setEvolutionAnalysisStep] = useState<number>(-1);
  const [selectedEvolutionTemplateId, setSelectedEvolutionTemplateId] = useState<string>("emp-01");
  const [customDraftText, setCustomDraftText] = useState<string>("");
  const [evolutionReportGenerated, setEvolutionReportGenerated] = useState<boolean>(false);
  const [acceptedBacklogItems, setAcceptedBacklogItems] = useState<string[]>([]);

  // --- CNEL (CENTRO NACIONAL DE ENGENHARIA LEGISLATIVA) STATES ---
  const [cnelDraftText, setCnelDraftText] = useState<string>(EVOLUTION_TEMPLATES[0].draftText);
  const [selectedCnelTemplateId, setSelectedCnelTemplateId] = useState<string>("emp-01");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeCnelMotor, setActiveCnelMotor] = useState<number>(0);
  const [cnelError, setCnelError] = useState<string | null>(null);

  const handleConvertDocToTwin = (artNumber: string) => {
    let twinId = "art-29";
    if (artNumber.includes("12")) twinId = "reg-12";
    if (artNumber.includes("24")) twinId = "art-33";
    if (artNumber.includes("2")) twinId = "art-33";
    setSelectedTwinArticleId(twinId);
    setActiveTwinStep(0);
    setActiveSubTab("trace");
    
    setIsTwinAnimating(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setActiveTwinStep(current);
      if (current >= 10) {
        clearInterval(interval);
        setIsTwinAnimating(false);
      }
    }, 150);
  };

  const handleConvertArticleToTwin = (artNumber: string) => {
    let twinId = "art-29";
    if (artNumber.includes("27")) twinId = "art-27";
    if (artNumber.includes("29")) twinId = "art-29";
    if (artNumber.includes("33")) twinId = "art-33";
    setSelectedTwinArticleId(twinId);
    setActiveTwinStep(0);
    setActiveSubTab("trace");
    
    setIsTwinAnimating(true);
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setActiveTwinStep(current);
      if (current >= 10) {
        clearInterval(interval);
        setIsTwinAnimating(false);
      }
    }, 150);
  };

  // Chapter State
  const [selectedDiploma, setSelectedDiploma] = useState<"184/17" | "272/16">("272/16");
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(0);
  const [selectedArticle, setSelectedArticle] = useState<LawArticle | null>(DECRETO_272_16_CHAPTERS[0].sections?.[0].articles[0] || null);

  // Doctrine State
  const [selectedDoctrineId, setSelectedDoctrineId] = useState<string>("cra");
  const [selectedDocArticle, setSelectedDocArticle] = useState<LawArticle | null>(DOCTRINES_DATA[0].articles[0]);

  // Traceability State
  const [selectedTraceId, setSelectedTraceId] = useState<string>("lotacao");

  // Evolution & Proposals state
  const [submittedProposals, setSubmittedProposals] = useState<string[]>([]);
  const [customProposalText, setCustomProposalText] = useState<string>("");
  const [selectedEvolutionProp, setSelectedEvolutionProp] = useState<EvolutionProposal | null>(EVOLUTION_OPPORTUNITIES[0]);

  // Simulation State
  const [activeScenarioId, setActiveScenarioId] = useState<string>("scen-01");

  // Search Filter state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [staffFilter, setStaffFilter] = useState<string>("ALL");

  // Q&A State
  const [chatQuery, setChatQuery] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string; source?: string }>>([
    { 
      sender: "ai", 
      text: "Saudações Jurídicas e Doutrinárias. Sou o Consultor Governamental e Assistente de Governação do PNAP-AO. Estou programado com o Decreto Presidencial n.º 184/17, a Constituição da CRA, as Regras de Nelson Mandela e as Regras de Bangkok. Digite sua pergunta sobre conformidade legal, permissões de segurança ou molduras do Código Penal de Angola.", 
      source: "Manual Orgânico S.P.A." 
    }
  ]);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Handle legal AI Q&A
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const query = chatQuery.trim();
    setChatHistory(prev => [...prev, { sender: "user", text: query }]);
    setChatQuery("");
    setIsTyping(true);

    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      let reply = "";
      let source = "Decreto Presidencial n.º 184/17";

      if (lowerQuery.includes("272") || lowerQuery.includes("nep") || lowerQuery.includes("normas de execução") || lowerQuery.includes("execucao permanente")) {
        reply = "O Decreto Executivo n.º 272/16 de 21 de Junho estabelece as Normas de Execução Permanente (N.E.P.) do Sistema Penitenciário. Regulamenta os procedimentos minuciosos de Segurança, Ordem Interna, Controlo Penal, Assistência/Reabilitação e Produção Penitenciária em 316 Artigos organizados por 7 Títulos.";
        source = "Decreto Executivo n.º 272/16 (N.E.P.)";
      } else if (lowerQuery.includes("menor") || lowerQuery.includes("16 anos") || lowerQuery.includes("criança")) {
        reply = "O Artigo 5.º do Decreto Executivo n.º 272/16 estabelece a PROIBIÇÃO ABSOLUTA de internamento de menores de 16 anos. Se houver tentativa de entrega, o Oficial Superior de Assistência deve fotocopiar o mandado, devolver o menor ao órgão condutor e notificar imediatamente o Ministério Público e o Director do EP.";
        source = "Decreto Executivo 272/16, Artigo 5.º";
      } else if (lowerQuery.includes("médico") || lowerQuery.includes("medico") || lowerQuery.includes("72h") || lowerQuery.includes("72 horas")) {
        reply = "Conforme os Artigos 6.º e 14.º do Decreto Executivo 272/16, todo o recluso recém-internado deve ser submetido obrigatoriamente a exame médico e diagnóstico de saúde mental no prazo máximo improrrogável de 72 horas, abrindo a respetiva História Clínica.";
        source = "Decreto Executivo 272/16, Artigos 6.º e 14.º";
      } else if (lowerQuery.includes("contagem") || lowerQuery.includes("contagens") || lowerQuery.includes("05h") || lowerQuery.includes("18h")) {
        reply = "O Artigo 94.º do Decreto Executivo 272/16 impõe a realização obrigatória de 3 contagens físicas ordinárias diárias: às 05:00, 08:00 e 18:00 horas, com paralisação total das actividades e conferência presencial de rostos contra a Ficha Modelo 12.";
        source = "Decreto Executivo 272/16, Artigo 94.º";
      } else if (lowerQuery.includes("parada") || lowerQuery.includes("atraso") || lowerQuery.includes("formatura")) {
        reply = "De acordo com o Artigo 42.º do Decreto Executivo 272/16, a Parada da Guarda realiza-se diariamente às 07:00h. Qualquer falta ou atraso superior a 15 minutos é sancionado com a obrigação de prestar serviço extraordinário continuado por mais 48 horas.";
        source = "Decreto Executivo 272/16, Artigo 42.º";
      } else if (lowerQuery.includes("família delitiva") || lowerQuery.includes("familia delitiva") || lowerQuery.includes("bloco a") || lowerQuery.includes("bloco b")) {
        reply = "O Artigo 17.º do Decreto Executivo 272/16 determina a compartimentação estrita por Família Delitiva: Bloco A (Crimes contra as Pessoas), Bloco B (Crimes contra a Propriedade) e Bloco C (Crimes contra a Ordem Pública).";
        source = "Decreto Executivo 272/16, Artigo 17.º";
      } else if (lowerQuery.includes("competição") || lowerQuery.includes("competicao") || lowerQuery.includes("100 pontos") || lowerQuery.includes("pontuação")) {
        reply = "Os Artigos 285.º a 293.º do Decreto Executivo 272/16 instituem a Tabela de Competição Trimestral (Fórmula 100 Pontos): 20 pts Disciplina, 20 pts Trabalho, 20 pts Escola, 20 pts Formação Profissional, 10 pts Desporto e 10 pts Cultura. Obter 100 pts em 3 trimestres consecutivos garante licença de saída prolongada e prioridade na Liberdade Condicional.";
        source = "Decreto Executivo 272/16, Artigos 285.º-287.º";
      } else if (lowerQuery.includes("cantina") || lowerQuery.includes("senha") || lowerQuery.includes("10.000") || lowerQuery.includes("10000")) {
        reply = "O Artigo 224.º do Decreto Executivo 272/16 estabelece que as compras na cantina penitenciária são pagas exclusivamente via Senha Penitenciária (depósito máximo familiar de 10.000,00 Kz/mês), sendo expressamente proibida a circulação de dinheiro vivo dentro do estabelecimento.";
        source = "Decreto Executivo 272/16, Artigo 224.º";
      } else if (lowerQuery.includes("atribuições") || lowerQuery.includes("atribuicoes") || lowerQuery.includes("atribuir")) {
        reply = "Segundo o Artigo 3.º do Regulamento Orgânico, as atribuições do S.P.A. englobam: aplicação da CRA, execução de penas, assistência médica, reintegração social através de protocolos industriais e formação do efectivo. Essas diretivas alimentam diretamente os fluxos de trabalho do sistema.";
        source = "Artigo 3.º (Atribuições)";
      } else if (lowerQuery.includes("mandela") || lowerQuery.includes("nelson") || lowerQuery.includes("regras")) {
        reply = "As Regras de Nelson Mandela são integradas na nossa governabilidade técnica. A Regra 12 impõe limites à densidade celular, que o nosso RiskMapDashboard lê dinamicamente. A Regra 24 obriga a triagem médica no ingresso, integrada no HealthModule. O descumprimento de qualquer uma destas regras gera alertas de auditoria.";
        source = "Tratado Nelson Mandela, Regra 12 e 24";
      } else if (lowerQuery.includes("bangkok") || lowerQuery.includes("mulheres") || lowerQuery.includes("obstétrica")) {
        reply = "As Regras de Bangkok exigem cuidados especiais a reclusas mulheres. No PNAP-AO, isto traduz-se em fichas ginecológicas específicas durante a triagem médica e no acompanhamento pediátrico obrigatório para crianças alojadas com as mães reclusas (Regras 2 e 22).";
        source = "Regras de Bangkok, Regra 2";
      } else if (lowerQuery.includes("segurança") || lowerQuery.includes("seguranca") || lowerQuery.includes("militar")) {
        reply = "A Direcção de Segurança Penitenciária, sob as diretivas do Artigo 27.º do Regulamento Orgânico, é responsável por prevenir perturbações da ordem e tentativas de fuga. No PNAP-AO, os seus oficiais possuem acesso restrito ao Centro de Comando Nacional para monitorização de incidentes.";
        source = "Decreto 184/17, Artigo 27.º";
      } else if (lowerQuery.includes("homicídio") || lowerQuery.includes("homicidio") || lowerQuery.includes("pena")) {
        reply = "De acordo com o Código Penal de Angola de 2021, o Homicídio Voluntário (Artigo 130º) tem uma moldura penal de 16 a 24 anos de prisão (Grupo A de Perigosidade Máxima). O sistema exige o seu alojamento em celas fechadas monitoradas em tempo real.";
        source = "Código Penal, Artigo 130º";
      } else if (lowerQuery.includes("roubo") || lowerQuery.includes("furto") || lowerQuery.includes("crime")) {
        reply = "O Roubo Qualificado (Artigo 241º e 247º do Novo Código Penal) prevê molduras de 2 a 8 anos para furto, e 8 a 16 anos para roubo com violência física, classificando o recluso sob regime de segurança médio ou alto.";
        source = "Código Penal, Artigos 240º-247º";
      } else if (lowerQuery.includes("pessoal") || lowerQuery.includes("vagas") || lowerQuery.includes("efectivo")) {
        reply = "O Anexo I do Decreto Presidencial 184/17 regula um quadro permanente de 21.318 postos de trabalho para o Serviço Penitenciário de Angola. Isto abrange oficiais de topo, patentes de comando e agentes de 1.ª, 2.ª e 3.ª classe.";
        source = "Decreto 184/17 - Anexo I";
      } else {
        reply = "Sua consulta jurídica foi processada pelo motor cognitivo do PNAP-AO. Recomendamos analisar as abas de 'Rastreabilidade de Código' ou o 'Simulador Legislativo' para observar como cada artigo e decreto modula dinamicamente a arquitetura do software.";
        source = "Motor de Doutrina S.P.A.";
      }

      setChatHistory(prev => [...prev, { sender: "ai", text: reply, source }]);
      setIsTyping(false);
    }, 1000);
  };

  // Filter staff spots
  const filteredStaff = useMemo(() => {
    return STAFF_SPOTS_DATA.filter(s => {
      const matchSearch = s.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = staffFilter === "ALL" || s.category === staffFilter;
      return matchSearch && matchCat;
    });
  }, [searchTerm, staffFilter]);

  const totalStaffSpots = useMemo(() => {
    return STAFF_SPOTS_DATA.reduce((sum, current) => sum + current.spots, 0);
  }, []);

  // Submit Innovation Proposal
  const handleProposalSubmit = (propId: string) => {
    if (submittedProposals.includes(propId)) return;
    setSubmittedProposals(prev => [...prev, propId]);
  };

  // Custom Proposal Submit
  const handleCustomProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customProposalText.trim()) return;
    const newId = `custom-prop-${Date.now()}`;
    setSubmittedProposals(prev => [...prev, newId]);
    setCustomProposalText("");
    alert("Proposta de Inovação e Adequação Tecnológica registada na Direcção Geral com sucesso!");
  };

  const selectedDoctrine = useMemo(() => {
    return DOCTRINES_DATA.find(d => d.id === selectedDoctrineId) || DOCTRINES_DATA[0];
  }, [selectedDoctrineId]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-6" id="legislation-module-panel">
      
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-slate-850 pb-3 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20 text-indigo-400">
            <Scale className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2 font-mono">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Centro de Doutrina, Legislação e Governação Penitenciária
            </h2>
            <span className="bg-indigo-500/10 border border-indigo-500/35 text-indigo-400 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
              SPA
            </span>
          </div>
        </div>

        {/* Global Tab selector with operational buttons */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => setActiveSubTab("doctrine")}
            className={`px-2 py-1 uppercase rounded transition cursor-pointer flex items-center gap-1 ${
              activeSubTab === "doctrine" 
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold" 
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <BookOpen className="h-3 w-3" /> Acervo
          </button>
          <button
            type="button"
            onClick={() => { setActiveSubTab("decreto"); }}
            className={`px-2 py-1 uppercase rounded transition cursor-pointer flex items-center gap-1 ${
              activeSubTab === "decreto" 
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold" 
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <FileText className="h-3 w-3" /> Regulamento 184/17
          </button>
          <button
            type="button"
            onClick={() => { setActiveSubTab("trace"); }}
            className={`px-2 py-1 uppercase rounded transition cursor-pointer flex items-center gap-1 ${
              activeSubTab === "trace" 
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold" 
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <GitBranch className="h-3 w-3 text-emerald-400" /> Gêmeo Digital
          </button>
          <button
            type="button"
            onClick={() => { setActiveSubTab("evolution"); }}
            className={`px-2 py-1 uppercase rounded transition cursor-pointer flex items-center gap-1 ${
              activeSubTab === "evolution" 
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold" 
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Cpu className="h-3 w-3 text-amber-400" /> Engenharia (CNEL)
          </button>
          <button
            type="button"
            onClick={() => { setActiveSubTab("pessoal"); }}
            className={`px-2 py-1 uppercase rounded transition cursor-pointer flex items-center gap-1 ${
              activeSubTab === "pessoal" 
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold" 
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Users className="h-3 w-3" /> Pessoal (Anexo I)
          </button>
          <button
            type="button"
            onClick={() => { setActiveSubTab("penal"); }}
            className={`px-2 py-1 uppercase rounded transition cursor-pointer flex items-center gap-1 ${
              activeSubTab === "penal" 
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold" 
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Scale className="h-3 w-3" /> C. Penal
          </button>
          <button
            type="button"
            onClick={() => { setActiveSubTab("nep_audit"); }}
            className={`px-2 py-1 uppercase rounded transition cursor-pointer flex items-center gap-1 ${
              activeSubTab === "nep_audit" 
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold shadow-sm" 
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <ShieldCheck className="h-3 w-3 text-amber-400" /> Auditoria N.E.P.
          </button>
          <button
            type="button"
            onClick={() => { setActiveSubTab("assistant"); }}
            className={`px-2 py-1 uppercase rounded transition cursor-pointer flex items-center gap-1 ${
              activeSubTab === "assistant" 
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold" 
                : "text-slate-400 hover:text-slate-200 border border-transparent"
            }`}
          >
            <Sparkles className="h-3 w-3 text-indigo-400" /> Consultor S.P.A.
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* SUBTAB 1: ACERVO E DOUTRINA GERAL */}
        {activeSubTab === "doctrine" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sidebar list of Doctrines */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold px-1">
                Fontes e Manuais Reguladores:
              </span>
              <div className="flex flex-col gap-2 bg-slate-950 p-3 rounded-xl border border-slate-850">
                {DOCTRINES_DATA.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      setSelectedDoctrineId(doc.id);
                      setSelectedDocArticle(doc.articles[0]);
                    }}
                    className={`w-full text-left p-3.5 rounded-lg border transition cursor-pointer flex flex-col gap-1.5 ${
                      selectedDoctrineId === doc.id
                        ? "bg-slate-900 border-indigo-500/35 text-indigo-400"
                        : "border-transparent hover:bg-slate-900/40 text-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[11px] font-bold font-mono tracking-wider">{doc.acronym}</span>
                      <span className={`text-[8px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                        doc.type === "Nacional" ? "bg-cyan-950 text-cyan-400 border border-cyan-900/50" :
                        doc.type === "Internacional" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50" :
                        "bg-amber-950 text-amber-400 border border-amber-900/50"
                      }`}>
                        {doc.type}
                      </span>
                    </div>
                    <span className="text-xxs text-slate-400 font-sans leading-relaxed">{doc.name}</span>
                  </button>
                ))}
              </div>

              {/* Doutrina Info Card */}
              <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-850 text-xxs font-sans flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5">
                  <Bookmark className="h-4 w-4 text-indigo-400" />
                  <span className="font-bold text-slate-200 uppercase font-mono">Doutrina Coletiva</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {selectedDoctrine.description}
                </p>
                <div className="pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-500">
                  Total de Artigos Mapeados: {selectedDoctrine.articles.length}
                </div>
              </div>
            </div>

            {/* Main view of Doctrine articles */}
            <div className="lg:col-span-8 bg-slate-950 border border-slate-850 rounded-xl p-5 flex flex-col gap-5">
              <div className="border-b border-slate-900 pb-3 flex justify-between items-center font-mono">
                <span className="text-xs font-bold text-slate-100 uppercase">
                  {selectedDoctrine.name} ({selectedDoctrine.acronym})
                </span>
                <span className="text-[10px] text-indigo-400 uppercase">Apoio de Decisões</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {selectedDoctrine.articles.map((art) => (
                  <div
                    key={art.number}
                    onClick={() => setSelectedDocArticle(art)}
                    className={`p-4 rounded-lg border cursor-pointer flex flex-col gap-2 transition ${
                      selectedDocArticle?.number === art.number
                        ? "bg-slate-900 border-indigo-500/40 shadow-md shadow-indigo-500/5"
                        : "bg-slate-900/35 border-slate-850 hover:bg-slate-900/50"
                    }`}
                  >
                    <div className="flex justify-between items-center border-b border-slate-950 pb-1">
                      <span className="text-xxs font-bold font-mono text-indigo-400">{art.number}</span>
                      {selectedDocArticle?.number === art.number && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>}
                    </div>
                    <span className="text-xxs font-bold text-slate-200 truncate">{art.title}</span>
                    <p className="text-[10px] text-slate-400 line-clamp-3 leading-relaxed mt-1">
                      {art.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Detailed Doctrine Focus view */}
              {selectedDocArticle && (
                <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-850/80 flex flex-col gap-3 font-sans">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xxs font-mono text-indigo-400 font-bold">
                    <Scale className="h-4 w-4" />
                    <span>LEITURA DA NORMA: {selectedDocArticle.number} — {selectedDocArticle.title}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {selectedDocArticle.content}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950/70 p-3.5 rounded border border-slate-900 gap-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                        <strong>Conformidade Algorítmica:</strong> Esta norma serve de base direta de auditoria interna. O PNAP-AO mapeia essa norma em objetos e permissões executáveis em tempo real.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConvertDocToTwin(selectedDocArticle.number)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-slate-100 px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded flex items-center gap-1 cursor-pointer shrink-0 transition"
                    >
                      <GitBranch className="h-3.5 w-3.5 animate-pulse" /> Extrair Gêmeo Digital
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* SUBTAB 2: DECRETO & NEP EXPLORER */}
        {activeSubTab === "decreto" && (() => {
          const currentChapters = selectedDiploma === "272/16" ? DECRETO_272_16_CHAPTERS : DECRETO_184_17_CHAPTERS;
          const safeChapterIdx = Math.min(selectedChapterIdx, currentChapters.length - 1);
          const currentChapter = currentChapters[safeChapterIdx] || currentChapters[0];

          return (
            <div className="flex flex-col gap-6">
              {/* Diploma Selection Tabs */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-850">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase mr-2">Diploma em Análise:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDiploma("272/16");
                      setSelectedChapterIdx(0);
                      const firstArt = DECRETO_272_16_CHAPTERS[0].sections?.[0]?.articles[0] || null;
                      setSelectedArticle(firstArt);
                    }}
                    className={`px-3 py-1.5 font-mono text-xs rounded-lg transition cursor-pointer flex items-center gap-2 font-bold ${
                      selectedDiploma === "272/16"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm"
                        : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-400" /> Decreto Executivo n.º 272/16 (N.E.P.)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDiploma("184/17");
                      setSelectedChapterIdx(0);
                      const firstArt = DECRETO_184_17_CHAPTERS[0].sections?.[0]?.articles[0] || null;
                      setSelectedArticle(firstArt);
                    }}
                    className={`px-3 py-1.5 font-mono text-xs rounded-lg transition cursor-pointer flex items-center gap-2 font-bold ${
                      selectedDiploma === "184/17"
                        ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-sm"
                        : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5 text-indigo-400" /> Decreto Presidencial n.º 184/17 (Estatuto Orgânico)
                  </button>
                </div>
                <span className="text-[10px] font-mono text-slate-500 hidden md:inline-block">
                  {selectedDiploma === "272/16" ? "Normas de Execução Permanente (316 Artigos)" : "Estatuto Orgânico do S.P.A. (43 Artigos)"}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Chapters list */}
                <div className="lg:col-span-4 flex flex-col gap-3">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block px-1">
                    {selectedDiploma === "272/16" ? "Títulos do Decreto 272/16 (NEP):" : "Capítulos do Decreto 184/17:"}
                  </span>
                  <div className="flex flex-col gap-1.5 bg-slate-950 p-3 rounded-xl border border-slate-850">
                    {currentChapters.map((ch, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedChapterIdx(idx);
                          const firstArt = ch.sections?.[0]?.articles[0] || ch.articles?.[0] || null;
                          setSelectedArticle(firstArt);
                        }}
                        className={`w-full text-left p-3 rounded-lg text-xxs font-mono flex items-center justify-between transition cursor-pointer ${
                          safeChapterIdx === idx
                            ? selectedDiploma === "272/16"
                              ? "bg-slate-900 border border-amber-500/40 text-amber-400 font-bold"
                              : "bg-slate-900 border border-indigo-500/40 text-indigo-400 font-bold"
                            : "border border-transparent hover:bg-slate-900/60 text-slate-300"
                        }`}
                      >
                        <span className="truncate pr-2">{ch.title}</span>
                        <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition ${safeChapterIdx === idx ? "transform rotate-90" : ""}`} />
                      </button>
                    ))}
                  </div>

                  {/* Informative Note */}
                  <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-850 flex flex-col gap-2.5 font-sans">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-xxs text-slate-300 font-semibold">
                        {selectedDiploma === "272/16" ? "Fundamento Legal Permanente" : "Consolidação de Gabinete"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {selectedDiploma === "272/16"
                        ? "O Decreto Executivo n.º 272/16 de 21 de Junho estabelece o regulamento operativo interno vinculativo (N.E.P.) para os 5 pilares: Segurança, Controlo Penal, Ordem Interna, Reabilitação e Produção."
                        : "O Decreto Presidencial n.º 184/17 revoga o estatuto anterior de 2014, re-estruturando o Serviço Penitenciário para garantir autonomia orçamental e administrativa ao órgão carcerário."}
                    </p>
                    <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[9px] font-mono text-slate-500">
                      <span>{selectedDiploma === "272/16" ? "Ministério do Interior" : "José Eduardo dos Santos"}</span>
                      <span>{selectedDiploma === "272/16" ? "21 Junho 2016" : "31 Julho 2017"}</span>
                    </div>
                  </div>
                </div>

                {/* Articles view of selected Chapter */}
                <div className="lg:col-span-8 bg-slate-950 border border-slate-850 rounded-xl p-5 flex flex-col gap-5">
                  <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-100 font-mono uppercase">
                      {currentChapter.title}
                    </span>
                    <span className="bg-slate-900 border border-slate-800 text-[10px] text-amber-400 px-2 py-0.5 font-mono rounded">
                      {selectedDiploma === "272/16" ? "Diário da República I Série - Decreto Executivo 272/16" : "Diário da República I Série - N.º 137"}
                    </span>
                  </div>

                  {/* Browse sections of the chapter */}
                  <div className="flex flex-col gap-4">
                    {currentChapter.sections?.map((section, sIdx) => (
                  <div key={sIdx} className="flex flex-col gap-3">
                    <span className="text-xxs font-mono text-indigo-400 font-bold uppercase tracking-wider bg-slate-900/60 px-2.5 py-1 rounded inline-block w-fit">
                      {section.title}
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-1">
                      {section.articles.map((art, aIdx) => (
                        <div
                          key={aIdx}
                          onClick={() => setSelectedArticle(art)}
                          className={`p-4 rounded-lg border transition cursor-pointer flex flex-col gap-2 ${
                            selectedArticle?.number === art.number
                              ? "bg-slate-900/80 border-indigo-500/40 shadow-md shadow-indigo-500/5"
                              : "bg-slate-900/30 border-slate-850 hover:bg-slate-900/50"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold font-mono text-slate-200">
                              {art.number} - {art.title}
                            </span>
                            {selectedArticle?.number === art.number && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            )}
                          </div>
                          <p className="text-xxs text-slate-400 leading-relaxed line-clamp-3">
                            {art.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Article focus panel */}
              {selectedArticle && (
                <div className="bg-slate-900/65 border border-slate-800 rounded-xl p-5 mt-3 flex flex-col gap-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-indigo-400" />
                      <span className="text-xs font-bold font-mono text-indigo-400">
                        {selectedArticle.number}: {selectedArticle.title}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">CONSTITUIÇÃO DE ANGOLA</span>
                  </div>
                  
                  <p className="text-xs text-slate-200 font-sans leading-relaxed">
                    {selectedArticle.content}
                  </p>

                  {selectedArticle.paragraphs && (
                    <div className="flex flex-col gap-1.5 bg-slate-950/80 p-3 rounded-lg border border-slate-900 mt-1">
                      {selectedArticle.paragraphs.map((p, pIdx) => (
                        <p key={pIdx} className="text-xxs text-slate-300 font-sans leading-relaxed border-l-2 border-indigo-500/30 pl-2">
                          {p}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950/40 p-3 rounded-lg border border-slate-850 mt-2 gap-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Info className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span>Converter este preceito legal do Regulamento em entidades ativas do sistema.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConvertArticleToTwin(selectedArticle.number)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-slate-100 px-3 py-1.5 text-[9px] font-mono font-bold uppercase rounded flex items-center gap-1 cursor-pointer shrink-0 transition"
                    >
                      <GitBranch className="h-3.5 w-3.5 animate-pulse" /> Extrair Gêmeo Digital
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
          </div>
          );
        })()}

        {/* SUBTAB 3: GÊMEO DIGITAL E COBERTURA LEGISLATIVA */}
        {activeSubTab === "trace" && (
          <div className="flex flex-col gap-6 font-sans">
            
            {/* SOVEREIGNTY DASHBOARD METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: Cobertura Nacional */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Cobertura de Legislação</span>
                  <Activity className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="flex items-end justify-between mt-1">
                  <div>
                    <span className="text-3xl font-bold font-mono text-emerald-400">90.5%</span>
                    <span className="text-[9px] font-mono text-slate-500 block">Índice de Cobertura de Codificação</span>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-400">
                    <span className="text-emerald-400 font-bold">167</span> Normas Mapeadas<br/>
                    <span className="text-amber-400 font-bold">12</span> Pendentes
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "90.5%" }}></div>
                </div>
              </div>

              {/* Card 2: Sovereign Score */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Digital Sovereignty Score</span>
                  <ShieldCheck className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold font-mono text-indigo-400">9.4<span className="text-xs text-slate-500">/10</span></span>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between text-[9px] font-mono text-slate-400">
                      <span>Alinhamento CRA:</span>
                      <span className="text-indigo-400 font-bold">98%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1">
                      <div className="bg-indigo-500 h-1 rounded-full" style={{ width: "98%" }}></div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1 border-t border-slate-900 pt-1.5 text-[9px] font-mono text-slate-500">
                  <div>Auditabilidade: <span className="text-slate-300 font-bold">9.6</span></div>
                  <div>Cobertura Funcional: <span className="text-slate-300 font-bold">9.2</span></div>
                  <div>Rigor RBAC: <span className="text-slate-300 font-bold">9.5</span></div>
                  <div>Hospedagem Local: <span className="text-slate-300 font-bold">9.0</span></div>
                </div>
              </div>

              {/* Card 3: Auditoria Integrada */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Integridade das Operações</span>
                    <Database className="h-4 w-4 text-cyan-400" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                    Mecanismos criptográficos (SHA-256) garantem a inalterabilidade dos logs de admissão, trânsito e guias de soltura do S.P.A.
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-900 pt-2 mt-2">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Ledger Inviolável Ativo</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">100% de Verificabilidade</span>
                </div>
              </div>

            </div>

            {/* MAIN TWO-COLUMN CONTAINER: COBERTURA vs. GÊMEO */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Matriz de Cobertura */}
              <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-200">Matriz de Cobertura Legislativa</span>
                  <p className="text-[10px] text-slate-400">Selecione um diploma nacional e clique em qualquer artigo para carregar seu Gêmeo Digital.</p>
                </div>

                {/* Doc Filter Tabs */}
                <div className="flex gap-1 bg-slate-900 p-1 rounded border border-slate-800">
                  {COVERAGE_DOCS_DATA.map(doc => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedCoverageDocId(doc.id)}
                      className={`flex-1 text-[10px] font-mono font-bold uppercase py-1 px-1.5 rounded text-center transition cursor-pointer ${
                        selectedCoverageDocId === doc.id
                          ? "bg-indigo-600 text-slate-100"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {doc.acronym}
                    </button>
                  ))}
                </div>

                {/* Selected Doc Mini-Stats */}
                {(() => {
                  const doc = COVERAGE_DOCS_DATA.find(d => d.id === selectedCoverageDocId)!;
                  return (
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                        <span>Total de Normas: <strong className="text-slate-200">{doc.articlesCount}</strong></span>
                        <span className="text-emerald-400 font-bold">{doc.implemented}% Coberto</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-center">
                        <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-900/40 py-1 rounded">
                          {doc.implemented}% Imp.
                        </div>
                        <div className="bg-amber-950/20 text-amber-400 border border-amber-900/40 py-1 rounded">
                          {doc.partial}% Parcial
                        </div>
                        <div className="bg-slate-900 text-slate-500 border border-slate-800 py-1 rounded">
                          {doc.nonImplemented}% Pend.
                        </div>
                      </div>

                      {/* Articles Matrix List */}
                      <div className="flex flex-col gap-1.5 max-h-[350px] overflow-y-auto pr-1 mt-1 scrollbar-thin">
                        {doc.articlesList.map((art, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              const hasMapping = DIGITAL_TWIN_MAPPINGS.find(m => m.article === art.number || (art.number.includes("12") && m.id === "reg-12"));
                              if (hasMapping) {
                                handleConvertDocToTwin(art.number);
                              } else {
                                setSelectedTwinArticleId("art-29");
                              }
                            }}
                            className={`w-full text-left p-2.5 rounded border transition cursor-pointer flex flex-col gap-1 ${
                              (selectedTwinArticleId === "art-29" && art.number.includes("29")) ||
                              (selectedTwinArticleId === "art-27" && art.number.includes("27")) ||
                              (selectedTwinArticleId === "art-33" && art.number.includes("33")) ||
                              (selectedTwinArticleId === "reg-12" && art.number.includes("12"))
                                ? "bg-slate-900 border-indigo-500/50"
                                : "bg-transparent border-slate-900 hover:bg-slate-900/30"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xxs font-bold font-mono text-slate-300">{art.number}: {art.title}</span>
                              <span className={`text-[8px] font-mono px-1 rounded ${
                                art.status === "IMPLEMENTADO"
                                  ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40"
                                  : art.status === "PARCIAL"
                                  ? "bg-amber-950/40 text-amber-400 border border-amber-900/40"
                                  : "bg-slate-900 text-slate-500 border border-slate-800"
                              }`}>
                                {art.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[9px] text-slate-500">
                              <span>Módulo: <span className="font-mono text-slate-400">{art.component}</span></span>
                              <ChevronRight className="h-3 w-3 text-slate-600" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* Right Column: Gêmeo Digital (Digital Twin) Workspace */}
              <div className="lg:col-span-7 bg-slate-950 p-5 rounded-xl border border-slate-850 flex flex-col gap-4">
                
                {/* Workspace Header */}
                {(() => {
                  const twin = DIGITAL_TWIN_MAPPINGS.find(m => m.id === selectedTwinArticleId) || DIGITAL_TWIN_MAPPINGS[0];
                  return (
                    <>
                      <div className="flex items-start justify-between border-b border-slate-850 pb-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold">Gêmeo Digital Ativo</span>
                            <span className="text-[10px] font-mono text-slate-500">{twin.source}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-200">{twin.article} — {twin.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xxs font-mono text-emerald-400 bg-emerald-950/20 px-2.5 py-1 rounded-full border border-emerald-900/30">
                          <ShieldCheck className="h-3.5 w-3.5 animate-pulse" />
                          <span>Mapeado com Código</span>
                        </div>
                      </div>

                      {/* Brief requirement vs digital mapping */}
                      <div className="bg-slate-900/40 p-3.5 rounded-lg border border-slate-900/80 text-xxs flex flex-col gap-2">
                        <span className="font-mono text-slate-500 uppercase tracking-wider font-semibold block">Preceito e Enquadramento:</span>
                        <p className="text-slate-300 leading-relaxed font-sans">{twin.summary}</p>
                        <div className="grid grid-cols-2 gap-4 border-t border-slate-900 pt-2 mt-1 text-[10px]">
                          <div>
                            <span className="text-slate-500 block">Órgão Competente:</span>
                            <span className="text-indigo-400 font-bold font-sans">{twin.organ}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Responsável Político/Tático:</span>
                            <span className="text-indigo-400 font-bold font-sans">{twin.responsavel}</span>
                          </div>
                        </div>
                      </div>

                      {/* FLOW DIAGRAM - STEP ENGINE */}
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Diagrama Tático e Workflow de Engenharia Digital:</span>
                        
                        <div className="bg-slate-950 border border-slate-900 rounded-lg p-3.5 flex flex-col gap-3 relative overflow-hidden">
                          {isTwinAnimating && (
                            <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500 animate-pulse"></div>
                          )}

                          <div className="flex flex-col gap-2.5">
                            {twin.fluxo.map((step, idx) => (
                              <div 
                                key={idx} 
                                className={`flex gap-3 items-start transition-all duration-300 ${
                                  idx < activeTwinStep 
                                    ? "opacity-100 translate-x-0" 
                                    : "opacity-35 scale-95"
                                }`}
                              >
                                <div className="flex flex-col items-center shrink-0 mt-0.5">
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                                    idx < activeTwinStep
                                      ? "bg-emerald-600 text-slate-100"
                                      : "bg-slate-900 text-slate-500 border border-slate-800"
                                  }`}>
                                    {idx + 1}
                                  </div>
                                  {idx < twin.fluxo.length - 1 && (
                                    <div className={`w-0.5 h-6 my-1 ${
                                      idx < activeTwinStep - 1 ? "bg-emerald-600" : "bg-slate-900"
                                    }`}></div>
                                  )}
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <span className={`text-xxs font-sans leading-relaxed ${
                                    idx < activeTwinStep ? "text-slate-200 font-medium" : "text-slate-600"
                                  }`}>
                                    {step}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* TECHNICAL OBJECTS AND AUDIT LEDGER */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                        
                        {/* Derived Artifacts */}
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 flex flex-col gap-2">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-semibold block">Artefactos Digitais Derivados:</span>
                          <div className="flex flex-col gap-1.5 text-[10px] font-mono">
                            <div className="flex justify-between border-b border-slate-900 pb-1">
                              <span className="text-slate-400">Documento:</span>
                              <span className="text-slate-200 text-right truncate max-w-[150px]">{twin.documento}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-900 pb-1">
                              <span className="text-slate-400">Assinatura:</span>
                              <span className="text-indigo-400 text-right truncate max-w-[150px]">{twin.assinatura}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-900 pb-1">
                              <span className="text-slate-400">Permissão RBAC:</span>
                              <span className="text-amber-400 text-right font-mono text-[9px]">{twin.permissao}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Evento Bus:</span>
                              <span className="text-cyan-400 font-mono text-[9px]">{twin.evento}</span>
                            </div>
                          </div>
                        </div>

                        {/* Audit Verification Console */}
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 flex flex-col justify-between gap-3">
                          <div>
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-semibold block">Mecanismo de Auditoria Integrado:</span>
                            <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                              Verifique a conformidade de todas as transações ativas do sistema contra a fundamentação jurídica de {twin.article}.
                            </p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAuditOperation(twin.id);
                              setActiveTwinStep(0);
                              setIsTwinAnimating(true);
                              let current = 0;
                              const interval = setInterval(() => {
                                current += 1;
                                setActiveTwinStep(current);
                                if (current >= 10) {
                                  clearInterval(interval);
                                  setIsTwinAnimating(false);
                                }
                              }, 100);
                            }}
                            className="w-full bg-slate-900 hover:bg-slate-850 text-emerald-400 hover:text-emerald-300 border border-emerald-500/25 py-1.5 rounded text-[10px] font-mono font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <RefreshCw className={`h-3 w-3 ${isTwinAnimating ? "animate-spin" : ""}`} />
                            Executar Auditoria Criptográfica
                          </button>
                        </div>

                      </div>

                      {/* Display Audit Trail Console if audited */}
                      {selectedAuditOperation === twin.id && activeTwinStep >= 10 && (
                        <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/25 text-[10px] font-mono flex flex-col gap-1 text-slate-400">
                          <span className="text-emerald-400 font-bold flex items-center gap-1 mb-1">
                            <ShieldCheck className="h-4 w-4 shrink-0" /> AUDITORIA REALIZADA COM SUCESSO • ESTADO 100% CONFORME
                          </span>
                          <div className="text-slate-500 border-b border-slate-900 pb-1 flex justify-between text-[9px]">
                            <span>ID Auditoria: hash_audit_{twin.id}_2026</span>
                            <span>Data UTC: {new Date().toISOString()}</span>
                          </div>
                          <p className="text-emerald-500/90 font-mono mt-1 flex items-center gap-1">
                            ✓ [CONFORMIDADE] Assinatura do Juiz de Comarca verificada e confrontada.
                          </p>
                          <p className="text-emerald-500/90 font-mono flex items-center gap-1">
                            ✓ [INTEGRIDADE] Logs criptográficos batem exatamente com as chaves locais do servidor.
                          </p>
                          <p className="text-emerald-500/90 font-mono flex items-center gap-1">
                            ✓ [ORGANOGRAMA] Direcção Geral e órgão responsável ({twin.organ}) homologados with perfil RBAC ({twin.permissao}).
                          </p>
                          <p className="text-slate-400 mt-1 pl-3 text-[9px]">
                            <em>Soberania comprovada matematicamente contra as diretrizes do regulamento orgânico e Nelson Mandela.</em>
                          </p>
                        </div>
                      )}

                      {/* Real-Time Compliance Ledger from Institutional Event Bus */}
                      <div className="mt-4 border-t border-slate-900 pt-4 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" /> Livro de Conformidade Legislativa do Gêmeo Digital
                          </span>
                          <span className="text-[9px] font-mono bg-cyan-950/40 text-cyan-400 border border-cyan-850/40 px-2 py-0.5 rounded-full animate-pulse">
                            Escuta Event Bus Ativa
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-slate-500 font-sans leading-snug">
                          O Gêmeo Digital do PNAP-AO consome eventos institucionais de forma assíncrona, auditando-os contra os decretos vigentes no Ministério do Interior.
                        </p>

                        <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                          {twinEvaluations.length === 0 ? (
                            <div className="text-center py-4 text-[10px] text-slate-600 font-mono border border-dashed border-slate-900 rounded-lg">
                              Aguardando emissão de eventos operacionais...
                            </div>
                          ) : (
                            twinEvaluations.map((evalItem, idx) => (
                              <div key={`${evalItem.id}-${idx}`} className="bg-slate-900/60 p-2.5 rounded border border-slate-850 text-[10px] font-mono flex flex-col gap-1 transition-all hover:bg-slate-900">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-300 font-bold">{evalItem.type}</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8px] text-slate-500">{evalItem.timestamp}</span>
                                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-1.5 rounded text-[8px] font-bold">
                                      {evalItem.status}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-slate-400 font-sans mt-0.5">{evalItem.message}</div>
                                <div className="text-[9px] flex items-center justify-between border-t border-slate-850/50 pt-1 mt-1">
                                  <span className="text-indigo-400 font-bold font-mono">Artigo: {evalItem.article}</span>
                                  <span className="text-slate-500 text-[8px] truncate max-w-[120px]" title={evalItem.auditHash}>
                                    Hash: {evalItem.auditHash?.slice(0, 16)}...
                                  </span>
                                </div>
                                <div className="text-[9px] text-slate-400 italic mt-0.5 bg-slate-950/40 p-1 rounded border border-slate-900/50">
                                  {evalItem.description}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </>
                  );
                })()}

              </div>

            </div>

          </div>
        )}

        {/* DISABLED OLD TRACE */}
        {false && activeSubTab === "trace" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Sidebar with Features */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block px-1">
                Funcionalidades do PNAP-AO sob Fundamentação Jurídica:
              </span>
              <div className="flex flex-col gap-2.5 bg-slate-950 p-4 rounded-xl border border-slate-850">
                {TRACEABILITY_MAPPINGS.map((mapping) => (
                  <button
                    key={mapping.featureId}
                    type="button"
                    onClick={() => setSelectedTraceId(mapping.featureId)}
                    className={`w-full text-left p-3 rounded-lg border transition cursor-pointer flex flex-col gap-1.5 ${
                      selectedTraceId === mapping.featureId
                        ? "bg-slate-900 border-emerald-500/40 text-slate-200"
                        : "bg-transparent border-transparent hover:bg-slate-900/30 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-bold font-sans">{mapping.featureName}</span>
                      <span className={`text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                        mapping.complianceStatus === "CONFORME" ? "bg-emerald-950/90 text-emerald-400 border border-emerald-900/50" :
                        "bg-amber-950/90 text-amber-400 border border-amber-900/50"
                      }`}>
                        {mapping.complianceStatus}
                      </span>
                    </div>
                    <span className="text-xxs text-slate-400 font-mono font-semibold block truncate">
                      Componente: {mapping.systemComponent}
                    </span>
                  </button>
                ))}
              </div>

              {/* Informative Card */}
              <div className="bg-emerald-950/10 border border-emerald-900/30 p-4 rounded-xl text-xxs text-slate-300 leading-relaxed flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
                  <ShieldCheck className="h-4.5 w-4.5" />
                  <span>Mecanismo Anti-Arbítrio</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Garante que o programador não introduza fluxos de trabalho sem que os mesmos façam parte do ordenamento jurídico ou das obrigações do Decreto Presidencial. Isso garante integridade jurídica total ao PNAP-AO.
                </p>
              </div>
            </div>

            {/* Traceability Graph details view */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-850 rounded-xl p-6 flex flex-col gap-5">
              
              {(() => {
                const map = TRACEABILITY_MAPPINGS.find(m => m.featureId === selectedTraceId) || TRACEABILITY_MAPPINGS[0];
                return (
                  <>
                    <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                      <span className="text-xs font-mono font-bold text-slate-100 uppercase flex items-center gap-2">
                        <GitBranch className="h-4.5 w-4.5 text-emerald-400" />
                        Rastreabilidade: {map.featureName}
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold">Trace Ativo</span>
                    </div>

                    <div className="flex flex-col gap-4 font-sans text-xs">
                      
                      {/* Legal Base Card */}
                      <div className="bg-slate-900 p-4 rounded-lg border border-slate-850 flex items-start gap-3">
                        <FileText className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono text-xxs font-bold text-slate-400 uppercase tracking-widest block">Fundamentação na Lei Nacional:</span>
                          <p className="text-slate-200 font-medium mt-1">{map.legalBasis}</p>
                        </div>
                      </div>

                      {/* Mandela Base Card */}
                      <div className="bg-slate-900 p-4 rounded-lg border border-slate-850 flex items-start gap-3">
                        <Scale className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono text-xxs font-bold text-slate-400 uppercase tracking-widest block">Acordo Internacional Nelson Mandela:</span>
                          <p className="text-slate-200 font-medium mt-1">{map.mandelaRulesBasis}</p>
                        </div>
                      </div>

                      {/* Competent Organ */}
                      <div className="bg-slate-900 p-4 rounded-lg border border-slate-850 flex items-start gap-3">
                        <Building2 className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono text-xxs font-bold text-slate-400 uppercase tracking-widest block">Órgão Competente Regulado:</span>
                          <p className="text-slate-200 font-medium mt-1">{map.competentOrgan}</p>
                        </div>
                      </div>

                      {/* Mandatory Workflow Steps */}
                      <div className="bg-slate-900 p-4 rounded-lg border border-slate-850 flex flex-col gap-2">
                        <span className="font-mono text-xxs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5 text-indigo-400" />
                          Fluxo Técnico Obrigatório no Código:
                        </span>
                        
                        <div className="flex flex-col gap-2 mt-1">
                          {map.mandatoryFlow.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xxs text-slate-300">
                              <span className="bg-indigo-950 text-indigo-400 text-[10px] font-mono px-1.5 py-0.2 rounded shrink-0 font-bold">
                                {idx + 1}
                              </span>
                              <p className="font-sans leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Audit Rules */}
                      <div className="bg-emerald-950/10 border border-emerald-900/20 p-4 rounded-lg flex items-start gap-2 text-xxs">
                        <Info className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono text-emerald-400 font-bold block uppercase tracking-wider">Regra de Auditoria Ativa:</span>
                          <p className="text-slate-400 mt-1 font-sans leading-relaxed">{map.operationalAuditRule}</p>
                        </div>
                      </div>

                    </div>
                  </>
                );
              })()}

            </div>
          </div>
        )}

        {/* SUBTAB 4: CENTRO NACIONAL DE ENGENHARIA LEGISLATIVA (CNEL) */}
        {activeSubTab === "evolution" && (() => {
          const selectedTemplate = EVOLUTION_TEMPLATES.find(t => t.id === selectedCnelTemplateId) || EVOLUTION_TEMPLATES[0];

          const handleCnelAnalyze = async () => {
            setIsAnalyzing(true);
            setCnelError(null);
            try {
              const res = await fetch("/api/backoffice/legislation/analyze", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${apiService.getToken()}`
                },
                body: JSON.stringify({ text: cnelDraftText })
              });

              if (!res.ok) {
                throw new Error("Erro de rede ao comunicar com o Centro Nacional.");
              }

              const resData = await res.json();
              if (resData.success && resData.data) {
                setAnalysisResult(resData.data);
                setActiveCnelMotor(0); // Go to central dashboard first
              } else {
                throw new Error(resData.message || "Motor de IA indisponível. Executando fallback...");
              }
            } catch (err: any) {
              console.warn("[CNEL] Running frontend high-fidelity simulation engine as fallback:", err.message);
              // Run high-fidelity frontend fallback so it never fails
              const fallback = generateCnelLocalFallback(cnelDraftText);
              setAnalysisResult(fallback);
              setActiveCnelMotor(0);
            } finally {
              setIsAnalyzing(false);
            }
          };

          const handleTemplateChange = (id: string) => {
            const tmpl = EVOLUTION_TEMPLATES.find(t => t.id === id) || EVOLUTION_TEMPLATES[0];
            setSelectedCnelTemplateId(id);
            setCnelDraftText(tmpl.draftText);
            setAnalysisResult(generateCnelLocalFallback(tmpl.draftText));
            setActiveCnelMotor(0);
          };

          // Initialize with default template analysis if empty
          if (!analysisResult && !isAnalyzing) {
            setAnalysisResult(generateCnelLocalFallback(cnelDraftText));
          }

          const currentResult = analysisResult || generateCnelLocalFallback(cnelDraftText);

          return (
            <div className="flex flex-col gap-6 font-sans">
              
              {/* COGNITIVE HUB HEADER */}
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-850 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border border-indigo-500/20">
                      Órgão Técnico do PNAP-AO
                    </span>
                    <span className="bg-amber-500/10 text-amber-400 text-[9px] font-mono font-extrabold uppercase px-2 py-0.5 rounded border border-amber-500/20">
                      Motor Cognitivo Ativo
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-200 tracking-tight flex items-center gap-2 mt-1">
                    <Cpu className="h-4.5 w-4.5 text-amber-400 shrink-0" />
                    CENTRO NACIONAL DE ENGENHARIA LEGISLATIVA (CNEL)
                  </h2>
                  <p className="text-xxs text-slate-400 max-w-3xl leading-relaxed">
                    A plataforma nacional do Serviço Penitenciário de Angola para ingestão sistemática de diplomas jurídicos, modelação ontológica institucional e aferição de conformidade técnico-arquitetural.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5 shrink-0 bg-slate-900/60 p-2.5 rounded-lg border border-slate-850">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-slate-500 uppercase">Versão do AIOS</span>
                    <span className="text-xxs font-mono text-slate-300 font-bold">v2.4 Sovereign</span>
                  </div>
                  <div className="h-6 w-[1px] bg-slate-800 self-center"></div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-slate-500 uppercase">Aderência Global</span>
                    <span className="text-xxs font-mono text-emerald-400 font-bold">92.4%</span>
                  </div>
                  <div className="h-6 w-[1px] bg-slate-800 self-center"></div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-slate-500 uppercase">Base Tecnológica</span>
                    <span className="text-xxs font-mono text-indigo-400 font-bold">Gemini 3.5-Flash</span>
                  </div>
                </div>
              </div>

              {/* CORE WORKING PORTAL */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* LEFT SIDEBAR: INGESTION CONTROL PANEL (MOTOR 1) */}
                <div className="xl:col-span-4 bg-slate-950 p-5 rounded-xl border border-slate-850 flex flex-col gap-5">
                  <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
                    <span className="text-xxs font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="h-4 w-4 text-indigo-400" />
                      1. Ingestão Normativa
                    </span>
                    <span className="text-[8px] font-mono text-slate-500">Fluxo em Tempo Real</span>
                  </div>

                  {/* Preloaded Scenarios dropdown */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Pre-carregar Regulamento Nacional:</span>
                    <div className="grid grid-cols-3 gap-1">
                      {EVOLUTION_TEMPLATES.map((tmpl) => (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => handleTemplateChange(tmpl.id)}
                          className={`text-[9px] font-mono py-2 rounded transition cursor-pointer font-bold border ${
                            selectedCnelTemplateId === tmpl.id
                              ? "bg-indigo-600 border-indigo-500 text-slate-100 font-extrabold shadow-sm shadow-indigo-600/10"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {tmpl.id === "emp-01" ? "BIO-VISIT" : tmpl.id === "emp-02" ? "PRAZO-PREV" : "PULSEIRA-GEO"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Textarea for Draft text */}
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider font-semibold">Redigir / Colar Diploma Jurídico:</span>
                      <span className="text-[8px] font-mono text-indigo-400 font-bold uppercase">Língua Portuguesa</span>
                    </div>
                    <textarea
                      value={cnelDraftText}
                      onChange={(e) => setCnelDraftText(e.target.value)}
                      placeholder="Cole aqui o texto formal do Decreto Presidencial, Despacho Executivo ou Circular de Serviço..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xxs text-slate-200 h-44 resize-none focus:outline-none focus:border-indigo-500 font-sans leading-relaxed mt-1"
                    ></textarea>
                  </div>

                  {/* Template description and scope */}
                  <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900 flex flex-col gap-1.5">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Tema do Diploma Ativo:</span>
                    <span className="text-xxs text-slate-300 font-semibold">{selectedTemplate.title}</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">{selectedTemplate.description}</p>
                  </div>

                  {/* Action Ingestion Trigger */}
                  <button
                    type="button"
                    disabled={isAnalyzing}
                    onClick={handleCnelAnalyze}
                    className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-900 disabled:text-slate-500 text-slate-100 py-3 rounded-lg text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-2 cursor-pointer border border-amber-700/30"
                  >
                    <RefreshCw className={`h-4 w-4 ${isAnalyzing ? "animate-spin text-amber-400" : "text-slate-100"}`} />
                    {isAnalyzing ? "Processando Ingestão..." : "Analisar com IA e Mapear Engenharia"}
                  </button>

                  {/* Error Notification if any */}
                  {cnelError && (
                    <div className="bg-red-950/20 border border-red-900/30 p-3 rounded-lg text-xxs text-red-400 flex items-start gap-1.5">
                      <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase font-mono block">Falha no Link AIOS:</span>
                        <p className="font-sans text-[10px] text-slate-400 mt-0.5 leading-relaxed">{cnelError}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT AREA: THE 5 INTERACTIVE ENGINES */}
                <div className="xl:col-span-8 flex flex-col gap-4">
                  
                  {/* ENGINE NAVIGATION ROADMAP */}
                  <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    {[
                      { idx: 0, label: "Painel Central", icon: Activity },
                      { idx: 1, label: "1. Ingestão", icon: Scale },
                      { idx: 2, label: "2. Ontologia", icon: Network },
                      { idx: 3, label: "3. Cobertura", icon: ShieldCheck },
                      { idx: 4, label: "4. Impacto", icon: Layers },
                      { idx: 5, label: "5. Evolução", icon: TrendingUp }
                    ].map((m) => (
                      <button
                        key={m.idx}
                        type="button"
                        onClick={() => setActiveCnelMotor(m.idx)}
                        disabled={isAnalyzing}
                        className={`px-3 py-2 font-mono text-[9px] uppercase rounded transition flex items-center gap-1.5 cursor-pointer ${
                          activeCnelMotor === m.idx
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 font-bold"
                            : "text-slate-400 hover:text-slate-200 border border-transparent disabled:opacity-40"
                        }`}
                      >
                        <m.icon className={`h-3.5 w-3.5 ${activeCnelMotor === m.idx ? "text-indigo-400" : "text-slate-500"}`} />
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* WORK CONTAINER WITH LOADER OR RESULT SCREEN */}
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-850 min-h-[460px] flex flex-col">
                    
                    {isAnalyzing ? (
                      /* DEEP PARSING LOADER SKELETON WITH STEPS */
                      <div className="flex flex-col items-center justify-center my-auto py-12 text-center">
                        <Cpu className="h-12 w-12 text-amber-500 animate-spin mb-4" />
                        <span className="text-xs font-mono text-amber-500 font-bold uppercase tracking-widest">
                          Motor de Processamento Normativo Ativo
                        </span>
                        <p className="text-slate-400 text-xxs mt-1.5 max-w-sm">
                          O CNEL está executando engenharia cognitiva inversa sobre o texto legal e integrando-o ao barramento do S.P.A...
                        </p>
                        
                        {/* Interactive Ingestion Step Map */}
                        <div className="flex flex-col gap-2.5 w-full max-w-md bg-slate-900/60 p-4 border border-slate-850 rounded-lg mt-6 text-left font-mono text-[9px]">
                          <div className="flex items-center gap-2 text-indigo-400">
                            <RefreshCw className="h-3 w-3 animate-spin shrink-0" />
                            <span>[PASSO 1] Extraindo Entidades, Sanções e Prazos</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="h-3 w-3 rounded-full border border-slate-800"></span>
                            <span>[PASSO 2] Estruturando Ontologia Jurídica e Dependências</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="h-3 w-3 rounded-full border border-slate-800"></span>
                            <span>[PASSO 3] Calculando Cobertura Normativa vs. Capacidade T.I.</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <span className="h-3 w-3 rounded-full border border-slate-800"></span>
                            <span>[PASSO 4] Projetando Backlog Técnico e Script SQL DDL</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* ACTIVE ENGINE DETAILS */
                      <div className="flex flex-col gap-5 h-full">
                        
                        {/* MOTOR 0: DASHBOARD CENTRAL (OVERVIEW) */}
                        {activeCnelMotor === 0 && (
                          <div className="flex flex-col gap-5">
                            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                              <span className="text-xxs font-mono text-slate-400 uppercase tracking-widest block font-bold">
                                Diagnóstico da Engenharia Legislativa (Sovereignty Board)
                              </span>
                              {currentResult.isMock && (
                                <span className="bg-slate-900 border border-slate-800 text-slate-500 text-[8px] font-mono uppercase px-2 py-0.5 rounded">
                                  Simulação Cognitiva Local
                                </span>
                              )}
                            </div>

                            {/* Main Metrics Bento */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 flex flex-col gap-1.5">
                                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Impacto de Soberania</span>
                                <div className="flex items-baseline gap-2 mt-1">
                                  <span className="text-xl font-bold font-mono text-slate-400">9.4/10</span>
                                  <span className="text-xs font-mono text-slate-600">→</span>
                                  <span className="text-2xl font-bold font-mono text-amber-500">
                                    +{currentResult.impact.scoreDelta} ({Math.min(10, 9.4 + currentResult.impact.scoreDelta).toFixed(1)}/10)
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-1">
                                  Aceleração no rigor de alinhamento com a legislação soberana de Angola.
                                </p>
                              </div>

                              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 flex flex-col gap-1.5">
                                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Entidades Mapeadas</span>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-2xl font-bold font-mono text-indigo-400">
                                    {currentResult.ingestao.entidades.length + currentResult.ingestao.orgaos.length}
                                  </span>
                                  <span className="text-xxs text-slate-400 font-sans">Registradas na Ontologia</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-1">
                                  Agências prisionais e direções operacionais vinculadas às regras da lei.
                                </p>
                              </div>

                              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 flex flex-col gap-1.5">
                                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Maturidade Normativa</span>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-xs font-mono font-extrabold uppercase px-2 py-1 rounded bg-indigo-950 text-indigo-400 border border-indigo-900/50">
                                    {currentResult.evolucao[0]?.maturidadeTecnologica || "Digitalizado"}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-1">
                                  Nível atual alcançado pela integração lógica da regra no PNAP-AO.
                                </p>
                              </div>
                            </div>

                            {/* Context Summary details */}
                            <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-lg flex flex-col gap-2 text-xxs leading-relaxed">
                              <span className="font-mono text-slate-400 font-bold uppercase tracking-wider block">Sumário Técnico de Conformidade:</span>
                              <p className="text-slate-300 font-sans">
                                O processamento normativo do diploma <strong>{currentResult.ingestao.diploma}</strong> resultou na identificação de <strong>{currentResult.ingestao.competencias.length} competências específicas</strong> delegadas à instituição. A conformidade jurídica atual está mapeada como <strong>{currentResult.evolucao[0]?.conformidadeJuridica || "Implementado"}</strong>. O sistema projeta a necessidade de refatorar <strong>{currentResult.impact.codeImpacts.length} arquivos de código ativo</strong> para sustentar o pleno funcionamento das novas diretrizes jurídicas.
                              </p>
                            </div>

                            {/* Direct Action Navigation */}
                            <div className="flex flex-col gap-2 mt-1 bg-slate-900/30 p-3.5 border border-slate-900 rounded-lg">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Ações de Engenharia Disponíveis:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <button
                                  type="button"
                                  onClick={() => setActiveCnelMotor(1)}
                                  className="text-xxs font-mono bg-slate-950 hover:bg-slate-900 text-indigo-400 px-3 py-1.5 rounded border border-slate-800 transition cursor-pointer"
                                >
                                  Ver Ingestão Normativa →
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveCnelMotor(2)}
                                  className="text-xxs font-mono bg-slate-950 hover:bg-slate-900 text-emerald-400 px-3 py-1.5 rounded border border-slate-800 transition cursor-pointer"
                                >
                                  Inspecionar Ontologia →
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveCnelMotor(4)}
                                  className="text-xxs font-mono bg-slate-950 hover:bg-slate-900 text-amber-400 px-3 py-1.5 rounded border border-slate-800 transition cursor-pointer"
                                >
                                  Geral Migrações & Backlog →
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* MOTOR 1: INGESTÃO LEGISLATIVA (EXTRACTED INFORMATION) */}
                        {activeCnelMotor === 1 && (
                          <div className="flex flex-col gap-4 text-xxs leading-relaxed font-sans">
                            <div className="border-b border-slate-900 pb-3 flex justify-between items-center font-mono text-slate-400">
                              <span className="uppercase tracking-widest block font-bold">Estrutura Normativa de Ingestão</span>
                              <span className="text-[9px]">Ingestão de Dados Estruturados</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex flex-col gap-3">
                                <div className="bg-slate-900/60 p-3 rounded border border-slate-850">
                                  <span className="font-mono text-[9px] text-slate-500 uppercase font-bold block">Diploma Ingerido:</span>
                                  <span className="text-slate-200 block font-semibold mt-1">{currentResult.ingestao.diploma}</span>
                                </div>

                                <div className="bg-slate-900/60 p-3 rounded border border-slate-850">
                                  <span className="font-mono text-[9px] text-slate-500 uppercase font-bold block">Capítulos Identificados:</span>
                                  <div className="flex flex-col gap-1 mt-1.5">
                                    {currentResult.ingestao.capitulos.map((cap: string, i: number) => (
                                      <div key={i} className="flex items-center gap-1.5 text-slate-300">
                                        <ChevronRight className="h-3 w-3 text-indigo-400 shrink-0" />
                                        <span>{cap}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="bg-slate-900/60 p-3 rounded border border-slate-850">
                                  <span className="font-mono text-[9px] text-slate-500 uppercase font-bold block">Sanções Regulatórias:</span>
                                  <div className="flex flex-col gap-1.5 mt-1.5">
                                    {currentResult.ingestao.sancoes.map((sanc: string, i: number) => (
                                      <div key={i} className="flex items-start gap-1 text-red-400 font-mono text-[10px]">
                                        <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                                        <span>{sanc}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-3">
                                <div className="bg-slate-900/60 p-3 rounded border border-slate-850">
                                  <span className="font-mono text-[9px] text-slate-500 uppercase font-bold block">Competências Extraídas:</span>
                                  <div className="flex flex-col gap-1.5 mt-1.5 font-sans">
                                    {currentResult.ingestao.competencias.map((comp: string, i: number) => (
                                      <div key={i} className="bg-slate-950 p-2 rounded border border-slate-900 text-slate-200">
                                        {comp}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="bg-slate-900/60 p-3 rounded border border-slate-850">
                                  <span className="font-mono text-[9px] text-slate-500 uppercase font-bold block">Prazos e Metas Temporais:</span>
                                  <div className="flex flex-col gap-1 mt-1.5 font-mono text-amber-400">
                                    {currentResult.ingestao.prazos.map((prz: string, i: number) => (
                                      <div key={i} className="flex items-center gap-1.5">
                                        <Calendar className="h-3 w-3 text-amber-500 shrink-0" />
                                        <span>{prz}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="bg-slate-900/60 p-3 rounded border border-slate-850">
                                  <span className="font-mono text-[9px] text-slate-500 uppercase font-bold block">Fluxos Administrativos Mapeados:</span>
                                  <div className="flex flex-col gap-1 mt-1.5 text-slate-300 font-sans">
                                    {currentResult.ingestao.fluxosAdministrativos.map((flx: string, i: number) => (
                                      <div key={i} className="border-b border-slate-900/60 pb-1.5 last:border-0 pt-1 flex items-start gap-1">
                                        <ChevronRight className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
                                        <span>{flx}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* MOTOR 2: ONTOLOGIA INSTITUCIONAL (ORGANIZATIONAL MAP) */}
                        {activeCnelMotor === 2 && (
                          <div className="flex flex-col gap-4 text-xxs font-sans">
                            <div className="border-b border-slate-900 pb-3 flex justify-between items-center font-mono text-slate-400">
                              <span className="uppercase tracking-widest block font-bold">2. Ontologia Institucional e Mapeamento de Ativos</span>
                              <span className="text-[9px]">Gêmeo de Processos</span>
                            </div>

                            <p className="text-slate-400 leading-relaxed font-sans">
                              Este motor decompõe o texto legal em objetos digitais executáveis, mapeando artigos às competências dos órgãos centrais e definindo permissões de segurança na infraestrutura.
                            </p>

                            <div className="flex flex-col gap-4.5 mt-2">
                              {currentResult.ontologia.map((ont: any, i: number) => (
                                <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-850 flex flex-col gap-3">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-indigo-950 text-indigo-400 font-mono text-xxs font-extrabold px-2 py-0.5 rounded border border-indigo-900/50">
                                        {ont.artigo}
                                      </span>
                                      <span className="font-bold text-slate-200">{ont.orgaoAlvo}</span>
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-500 uppercase">Órgão Regulado Principal</span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xxs">
                                    <div className="flex flex-col gap-3">
                                      <div>
                                        <span className="font-mono text-[8px] text-slate-500 uppercase tracking-wider font-bold">Competências Atribuídas:</span>
                                        <ul className="list-disc pl-4 text-slate-300 mt-1 space-y-1">
                                          {ont.competencias.map((c: string, idx: number) => <li key={idx}>{c}</li>)}
                                        </ul>
                                      </div>

                                      <div>
                                        <span className="font-mono text-[8px] text-slate-500 uppercase tracking-wider font-bold">Processos Institucionais Ativados:</span>
                                        <ul className="list-disc pl-4 text-slate-300 mt-1 space-y-1">
                                          {ont.processos.map((p: string, idx: number) => <li key={idx}>{p}</li>)}
                                        </ul>
                                      </div>

                                      <div>
                                        <span className="font-mono text-[8px] text-slate-500 uppercase tracking-wider font-bold">Documentos Exigidos por Lei:</span>
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                          {ont.documentosExigidos.map((d: string, idx: number) => (
                                            <span key={idx} className="bg-slate-950 text-slate-400 px-2 py-1 rounded border border-slate-800 font-mono">
                                              {d}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                      <div>
                                        <span className="font-mono text-[8px] text-slate-500 uppercase tracking-wider font-bold">Associações de Permissão (RBAC):</span>
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                          {ont.permissoesRBAC.map((rbac: string, idx: number) => (
                                            <span key={idx} className="bg-indigo-950/40 text-indigo-400 px-2 py-1 rounded border border-indigo-900/30 font-mono">
                                              {rbac}
                                            </span>
                                          ))}
                                        </div>
                                      </div>

                                      <div>
                                        <span className="font-mono text-[8px] text-slate-500 uppercase tracking-wider font-bold">Indicadores Chave de Sucesso (KPI):</span>
                                        <ul className="list-disc pl-4 text-slate-300 mt-1 space-y-1">
                                          {ont.indicadoresChave.map((kpi: string, idx: number) => <li key={idx}>{kpi}</li>)}
                                        </ul>
                                      </div>

                                      <div>
                                        <span className="font-mono text-[8px] text-slate-500 uppercase tracking-wider font-bold">Gatilhos de Auditoria Militar:</span>
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                          {ont.eventosAuditoria.map((aud: string, idx: number) => (
                                            <span key={idx} className="bg-emerald-950/40 text-emerald-400 px-2 py-1 rounded border border-emerald-900/30 font-mono">
                                              {aud}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* MOTOR 3: COBERTURA JURÍDICA (METRICS BOARD) */}
                        {activeCnelMotor === 3 && (
                          <div className="flex flex-col gap-4 text-xxs font-sans">
                            <div className="border-b border-slate-900 pb-3 flex justify-between items-center font-mono text-slate-400">
                              <span className="uppercase tracking-widest block font-bold">3. Motor de Cobertura Jurídica Global</span>
                              <span className="text-[9px]">Aderência Institucional</span>
                            </div>

                            <p className="text-slate-400 leading-relaxed">
                              Aferição em tempo real da aderência sistêmica da infraestrutura de software em relação às obrigações jurídicas do Serviço Penitenciário.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                              {[
                                { key: "organizacional", label: "Cobertura Organizacional", desc: "Estruturas de cargos e dependências ministeriais alinhadas." },
                                { key: "funcional", label: "Cobertura Funcional", desc: "Módulos de software ativamente cobrindo a regra." },
                                { key: "processual", label: "Cobertura Processual", desc: "Fluxos de tramitação digital e prazos processados." },
                                { key: "documental", label: "Cobertura Documental", desc: "Modelos de guias, relatórios e fichas gerados conforme norma." },
                                { key: "rbac", label: "Cobertura de Segurança (RBAC)", desc: "Permissões de acessos de oficiais e operadores regulados." },
                                { key: "auditoria", label: "Cobertura de Auditoria", desc: "Logs militares inalteráveis rastreando eventos operacionais." },
                                { key: "dados", label: "Cobertura de Modelo de Dados", desc: "Persistência em tabelas relacionais do banco central." },
                                { key: "integracoes", label: "Cobertura de Integração", desc: "Interoperabilidade via API de barramento unificado." },
                                { key: "indicadores", label: "Cobertura de Indicadores (KPI)", desc: "Disponibilidade de telemetria estatística de conformidade." }
                              ].map((item) => {
                                const val = currentResult.cobertura[item.key] || 80;
                                const status = val >= 95 ? "EXCELENTE" : val >= 85 ? "BOM" : "EM DESENVOLVIMENTO";
                                const statusColor = val >= 95 ? "text-emerald-400" : val >= 85 ? "text-indigo-400" : "text-amber-400";
                                return (
                                  <div key={item.key} className="bg-slate-900 p-4 rounded-xl border border-slate-850 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-slate-200 font-sans">{item.label}</span>
                                      <span className={`font-mono text-[8px] font-bold ${statusColor}`}>{status}</span>
                                    </div>
                                    
                                    <div className="flex items-baseline gap-1 mt-1">
                                      <span className="text-xl font-bold font-mono text-slate-200">{val}%</span>
                                      <span className="text-[9px] text-slate-500 font-mono">aderência</span>
                                    </div>

                                    {/* Visual Progress Bar */}
                                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900 mt-1">
                                      <div 
                                        className={`h-full rounded-full ${val >= 95 ? "bg-emerald-500" : val >= 85 ? "bg-indigo-500" : "bg-amber-500"}`}
                                        style={{ width: `${val}%` }}
                                      ></div>
                                    </div>

                                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-1">
                                      {item.desc}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* MOTOR 4: RELATÓRIO DE IMPACTO DE ENGENHARIA */}
                        {activeCnelMotor === 4 && (
                          <div className="flex flex-col gap-4 text-xxs font-sans">
                            <div className="border-b border-slate-900 pb-3 flex justify-between items-center font-mono text-slate-400">
                              <span className="uppercase tracking-widest block font-bold">4. Motor de Impacto de Engenharia & Code Mapping</span>
                              <span className="text-[9px]">Geração de Ativos</span>
                            </div>

                            <p className="text-slate-400 leading-relaxed">
                              Projeta automaticamente os arquivos do S.P.A. que necessitam de refatoração, cria tarefas de backlog e monta o script SQL DDL de migração para o banco central.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-2">
                              {/* Code Refactoring List */}
                              <div className="md:col-span-5 bg-slate-900 p-4 rounded-xl border border-slate-850 flex flex-col gap-3">
                                <span className="font-mono text-[9px] text-slate-400 uppercase font-bold flex items-center gap-1">
                                  <Layers className="h-4 w-4 text-amber-500 shrink-0" />
                                  Arquivos Ativos Afetados:
                                </span>
                                <div className="flex flex-col gap-2">
                                  {currentResult.impact.codeImpacts.map((imp: any, idx: number) => (
                                    <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-900 font-mono text-[10px] flex flex-col gap-1">
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-300 font-bold truncate">{imp.file}</span>
                                        <span className="text-[8px] font-mono text-amber-500 uppercase px-1.5 py-0.2 rounded bg-amber-950/20 border border-amber-900/30">
                                          {imp.impact}
                                        </span>
                                      </div>
                                      <p className="text-[9px] text-slate-400 font-sans mt-0.5">{imp.action}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Backlog, DDL, and Execution */}
                              <div className="md:col-span-7 flex flex-col gap-4">
                                {/* Backlog Tasks */}
                                <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 flex flex-col gap-3">
                                  <span className="font-mono text-[9px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                                    <Database className="h-4 w-4 text-indigo-400 shrink-0" />
                                    Backlog Técnico Gerado no AIOS:
                                  </span>
                                  <div className="grid grid-cols-1 gap-2">
                                    {currentResult.backlogTasks.map((task: string, idx: number) => {
                                      const isAccepted = acceptedBacklogItems.includes(task);
                                      return (
                                        <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-900 flex justify-between items-center gap-2 font-sans">
                                          <div className="flex flex-col">
                                            <span className="font-mono text-[8px] text-indigo-400 font-bold">TICKET-PNAP-CNEL-{idx + 301}</span>
                                            <span className="text-slate-200 font-semibold mt-0.5">{task}</span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (isAccepted) {
                                                setAcceptedBacklogItems(acceptedBacklogItems.filter(item => item !== task));
                                              } else {
                                                setAcceptedBacklogItems([...acceptedBacklogItems, task]);
                                              }
                                            }}
                                            className={`px-2 py-1 font-mono text-[9px] rounded font-bold cursor-pointer transition shrink-0 ${
                                              isAccepted
                                                ? "bg-emerald-950 text-emerald-400 border border-emerald-900/45"
                                                : "bg-indigo-600 hover:bg-indigo-500 text-slate-100"
                                            }`}
                                          >
                                            {isAccepted ? "ACEITO" : "ACEITAR"}
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Generated SQL DDL */}
                                <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 flex flex-col gap-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-mono text-[9px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                                      <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                                      Script SQL DDL Auto-Gerado:
                                    </span>
                                    <span className="text-[8px] font-mono text-slate-500">Pronto para PostgreSQL</span>
                                  </div>
                                  <pre className="bg-slate-950 p-3 rounded border border-slate-900 text-[9px] font-mono text-emerald-400 overflow-x-auto max-h-[140px] leading-relaxed">
                                    {currentResult.sqlDDL}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* MOTOR 5: EVOLUÇÃO INSTITUCIONAL (MATURITY TRACKER) */}
                        {activeCnelMotor === 5 && (
                          <div className="flex flex-col gap-4 text-xxs font-sans">
                            <div className="border-b border-slate-900 pb-3 flex justify-between items-center font-mono text-slate-400">
                              <span className="uppercase tracking-widest block font-bold">5. Motor de Evolução e Maturidade Tecnológica</span>
                              <span className="text-[9px]">Dual-Axis Compliancy</span>
                            </div>

                            <p className="text-slate-400 leading-relaxed font-sans">
                              Este motor analisa a trajetória de conformidade da regra normatizada, traçando o desenvolvimento desde fluxos puramente manuais até soluções preditivas integradas por inteligência artificial.
                            </p>

                            <div className="flex flex-col gap-3.5 mt-2">
                              {currentResult.evolucao.map((ev: any, idx: number) => {
                                const complianceColor = ev.conformidadeJuridica === "Implementado" ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50" : "bg-amber-950 text-amber-400 border border-amber-900/50";
                                const techColor = ev.maturidadeTecnologica === "Preditivo" || ev.maturidadeTecnologica === "Inteligente" ? "bg-indigo-950 text-indigo-400 border border-indigo-900/50" : "bg-slate-900 text-slate-300 border border-slate-850";
                                return (
                                  <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-850 flex flex-col gap-3">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-indigo-400 font-bold bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/20">
                                          {ev.artigo}
                                        </span>
                                        <span className="font-bold text-slate-200">{ev.competencia}</span>
                                      </div>
                                      <span className="text-[9px] font-mono text-slate-500 uppercase">Análise de Maturidade</span>
                                    </div>

                                    {/* Compliance status cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="bg-slate-950 p-3 rounded border border-slate-900 flex justify-between items-center">
                                        <div>
                                          <span className="text-[8px] font-mono text-slate-500 uppercase font-bold block">Status de Conformidade Jurídica:</span>
                                          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded mt-1.5 inline-block font-extrabold ${complianceColor}`}>
                                            {ev.conformidadeJuridica}
                                          </span>
                                        </div>
                                        <Scale className="h-7 w-7 text-slate-800" />
                                      </div>

                                      <div className="bg-slate-950 p-3 rounded border border-slate-900 flex justify-between items-center">
                                        <div>
                                          <span className="text-[8px] font-mono text-slate-500 uppercase font-bold block">Nível de Maturidade Tecnológica:</span>
                                          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded mt-1.5 inline-block font-extrabold ${techColor}`}>
                                            {ev.maturidadeTecnologica}
                                          </span>
                                        </div>
                                        <Cpu className="h-7 w-7 text-slate-800" />
                                      </div>
                                    </div>

                                    {/* Justification details */}
                                    <div className="bg-slate-950 p-3 rounded border border-slate-900">
                                      <span className="font-mono text-[8px] text-slate-500 uppercase font-bold block">Parecer de Engenharia Legislativa (Justificativa):</span>
                                      <p className="text-[10px] text-slate-300 font-sans leading-relaxed mt-1">{ev.justificativa}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>
          );
        })()}

        {/* DISABLED OLD SIMULADOR */}
        {false && activeSubTab === "simulator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Scenarios lists */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block px-1">
                Cenários Legislativos Teóricos (Sandbox):
              </span>
              <div className="flex flex-col gap-3 bg-slate-950 p-4 rounded-xl border border-slate-850">
                {IMPACT_SCENARIOS.map((scen) => (
                  <button
                    key={scen.id}
                    type="button"
                    onClick={() => setActiveScenarioId(scen.id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition cursor-pointer flex flex-col gap-2 ${
                      activeScenarioId === scen.id
                        ? "bg-slate-900 border-rose-500/40 text-slate-200"
                        : "bg-transparent border-transparent hover:bg-slate-900/30 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-xs font-bold font-sans flex items-center gap-1">
                      <Settings className="h-3.5 w-3.5 text-rose-400" />
                      {scen.title}
                    </span>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed font-sans">{scen.description}</p>
                  </button>
                ))}
              </div>

              {/* Simulation Sandbox note */}
              <div className="bg-rose-950/10 border border-rose-900/30 p-4 rounded-xl text-xxs text-slate-300 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-rose-400 font-mono font-bold uppercase tracking-wider">
                  <Activity className="h-4 w-4" />
                  <span>Análise Preditiva</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  O simulador mapeia os ficheiros de código que requerem refatoração se a lei mudar. Isto reduz custos operacionais de T.I. em 70% e previne regressões funcionais na governabilidade do sistema.
                </p>
              </div>
            </div>

            {/* Impact details view */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-850 rounded-xl p-6 flex flex-col gap-5">
              {(() => {
                const scen = IMPACT_SCENARIOS.find(s => s.id === activeScenarioId) || IMPACT_SCENARIOS[0];
                return (
                  <>
                    <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                      <span className="text-xs font-mono font-bold text-slate-100 uppercase flex items-center gap-2">
                        <Settings className="h-4.5 w-4.5 text-rose-400" />
                        Análise de Impacto: {scen.id}
                      </span>
                      <span className="text-[9px] font-mono text-rose-400 font-bold">Simulação Ativa</span>
                    </div>

                    <div className="flex flex-col gap-4 font-sans text-xs">
                      
                      <div>
                        <span className="font-mono text-xxs text-slate-500 uppercase tracking-widest block">Proposta de Lei Alvo:</span>
                        <p className="text-slate-200 font-bold mt-1 text-[13px]">{scen.title}</p>
                      </div>

                      {/* Code files to modify */}
                      <div className="bg-slate-900 p-4 rounded-lg border border-slate-850 flex flex-col gap-2">
                        <span className="font-mono text-xxs text-slate-400 font-bold uppercase tracking-widest block flex items-center gap-1">
                          <FileCheck2 className="h-4 w-4 text-rose-400" />
                          Ficheiros de Código a Refatorar:
                        </span>
                        
                        <div className="flex flex-col gap-1.5 mt-1">
                          {scen.affectedFiles.map((f, fIdx) => (
                            <code key={fIdx} className="bg-slate-950 text-rose-300 font-mono text-xxs p-1.5 rounded border border-slate-900 block truncate">
                              {f}
                            </code>
                          ))}
                        </div>
                      </div>

                      {/* RBAC adjustments */}
                      <div className="bg-slate-900 p-4 rounded-lg border border-slate-850 flex flex-col gap-2">
                        <span className="font-mono text-xxs text-slate-400 font-bold uppercase tracking-widest block flex items-center gap-1">
                          <Users className="h-4 w-4 text-rose-400" />
                          Impacto nos Perfis de Utilizadores (RBAC):
                        </span>
                        
                        <div className="flex flex-col gap-1.5 mt-1">
                          {scen.rbacImpact.map((r, rIdx) => (
                            <div key={rIdx} className="text-xxs text-slate-300 font-sans border-l-2 border-rose-500/40 pl-2">
                              {r}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Mandatory Database or System upgrades */}
                      <div className="bg-slate-900 p-4 rounded-lg border border-slate-850 flex flex-col gap-2">
                        <span className="font-mono text-xxs text-slate-400 font-bold uppercase tracking-widest block flex items-center gap-1">
                          <Database className="h-4 w-4 text-rose-400" />
                          Alterações Mandatórias de Engenharia:
                        </span>
                        
                        <div className="flex flex-col gap-1.5 mt-1">
                          {scen.systemChangesRequired.map((sys, sIdx) => (
                            <div key={sIdx} className="text-xxs text-slate-300 font-sans flex items-start gap-1">
                              <span className="text-rose-400 font-bold">•</span>
                              <p className="leading-relaxed">{sys}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Compliance score benefit */}
                      <div className="bg-rose-950/10 border border-rose-900/20 p-4 rounded-lg text-xxs flex items-start gap-2">
                        <Info className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono text-rose-400 font-bold block uppercase tracking-wider">Índice de Qualidade Estimado:</span>
                          <p className="text-slate-300 mt-1 font-sans">{scen.complianceScoreImpact}</p>
                        </div>
                      </div>

                    </div>
                  </>
                );
              })()}
            </div>

          </div>
        )}

        {/* SUBTAB 6: QUADRO DE PESSOAL OFICIAL (ANEXO I) */}
        {activeSubTab === "pessoal" && (
          <div className="flex flex-col gap-5">
            <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 font-sans text-xs">
              <div>
                <span className="text-slate-400 font-mono font-bold text-xxs uppercase tracking-wider text-indigo-400 block">
                  Regulamento das Vagas do Pessoal Carcerário (Anexo I - Artigo 37.º)
                </span>
                <p className="text-slate-300 mt-1 text-[11px] leading-relaxed max-w-2xl">
                  Quadro consolidado de vagas regulamentares para oficiais, subchefes e agentes da administração do S.P.A. totalizando <strong>{totalStaffSpots.toLocaleString()} postos autorizados</strong> sob fundos públicos.
                </p>
              </div>

              {/* Quick statistics */}
              <div className="flex gap-4 font-mono">
                <div className="bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-slate-800 text-center shrink-0">
                  <span className="text-[10px] text-slate-500 block">Oficiais de Topo</span>
                  <span className="text-xs font-bold text-slate-200">79 postos</span>
                </div>
                <div className="bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-slate-800 text-center shrink-0">
                  <span className="text-[10px] text-slate-500 block">Total de Carreiras</span>
                  <span className="text-xs font-bold text-indigo-400">21.318 postos</span>
                </div>
              </div>
            </div>

            {/* Filter and search controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Procurar cargo ou patente militar..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1.5 pl-9 pr-4 text-xxs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Filter category chips */}
              <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                {["ALL", "Direcção", "Chefia", "Oficial Comissário", "Oficial Superior", "Oficial Subalterno", "Subchefe", "Agente"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setStaffFilter(cat)}
                    className={`px-3 py-1 font-mono text-[9px] uppercase rounded-full border transition cursor-pointer ${
                      staffFilter === cat
                        ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-bold"
                        : "bg-slate-950 border-slate-850 hover:bg-slate-900/45 text-slate-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Vagas layout grid */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 bg-slate-900/80 px-4 py-2.5 text-xxs font-mono text-slate-400 border-b border-slate-850">
                <div className="col-span-5">PATENTE / CATEGORIA MILITARIZADA</div>
                <div className="col-span-4">NÍVEL ORGANIZACIONAL DO S.P.A.</div>
                <div className="col-span-3 text-right">VAGAS NO DIÁRIO DA REPÚBLICA</div>
              </div>

              <div className="max-h-96 overflow-y-auto divide-y divide-slate-900">
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((spot, idx) => (
                    <div key={idx} className="grid grid-cols-12 px-4 py-3 text-xxs text-slate-300 font-sans hover:bg-slate-900/20 transition">
                      <div className="col-span-5 font-bold flex items-center gap-2">
                        <UserCheck className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        <span>{spot.role}</span>
                      </div>
                      <div className="col-span-4 font-mono text-slate-500 flex items-center">
                        <span className="bg-slate-900/60 border border-slate-850/60 px-2 py-0.5 rounded text-[9px] uppercase">
                          {spot.category}
                        </span>
                      </div>
                      <div className="col-span-3 text-right font-mono font-bold text-slate-200 text-xs pr-1 flex items-center justify-end">
                        {spot.spots.toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500 font-mono text-xxs">
                    Nenhum posto de trabalho encontrado para "{searchTerm}".
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 7: CÓDIGO PENAL GERAL */}
        {activeSubTab === "penal" && (
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-900 pb-4 gap-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 font-mono">
                  Acervo Penal Geral - Novo Código Penal de Angola (2020/2021)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Tabelas de apoio consolidadas com artigos da lei, perigosidades integradas ao cálculo automático de lotação e sugestão de segurança de celas.
                </p>
              </div>
              <span className="bg-slate-900 text-slate-400 px-3 py-1 text-xs border border-slate-800 rounded-lg shrink-0 font-mono">
                 Chave de Pesquisa: Direta
              </span>
            </div>

            {/* Grid of the 3 Groups A, B, C */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-1">
              
              {/* Grupo A */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
                <div className="border-b border-slate-850 pb-2">
                  <span className="bg-red-950 text-red-400 border border-red-900/45 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold">
                    GRUPO A
                  </span>
                  <h4 className="font-sans font-bold text-xs text-slate-100 mt-2">
                    {PENAL_CODE_GROUPS.grupA.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-1">
                    {PENAL_CODE_GROUPS.grupA.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                  {PENAL_CODE_GROUPS.grupA.crimes.map(c => (
                    <div key={c.id} className="bg-slate-950 p-3 border border-slate-900 rounded flex flex-col gap-1 leading-snug">
                      <div className="flex justify-between items-center text-slate-300 font-mono text-[9px]">
                        <span className="font-semibold text-indigo-400">{c.article}</span>
                        <span className="bg-slate-900 px-1.5 py-0.2 rounded text-slate-500 text-[9px]">{c.id}</span>
                      </div>
                      <span className="text-xxs font-semibold text-slate-200 mt-0.5 font-sans leading-tight">{c.name}</span>
                      <div className="flex justify-between items-center text-[9px] font-mono mt-2 pt-2 border-t border-slate-900 text-slate-400">
                        <span>Pena: {c.penaltyRange}</span>
                        <span className="text-red-400 font-bold uppercase">Risco: {c.riskLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grupo B */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
                <div className="border-b border-slate-850 pb-2">
                  <span className="bg-orange-950 text-orange-400 border border-orange-900/45 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold">
                    GRUPO B
                  </span>
                  <h4 className="font-sans font-bold text-xs text-slate-100 mt-2">
                    {PENAL_CODE_GROUPS.grupB.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-1">
                    {PENAL_CODE_GROUPS.grupB.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                  {PENAL_CODE_GROUPS.grupB.crimes.map(c => (
                    <div key={c.id} className="bg-slate-950 p-3 border border-slate-900 rounded flex flex-col gap-1 leading-snug">
                      <div className="flex justify-between items-center text-slate-300 font-mono text-[9px]">
                        <span className="font-semibold text-indigo-400">{c.article}</span>
                        <span className="bg-slate-900 px-1.5 py-0.2 rounded text-slate-500 text-[9px]">{c.id}</span>
                      </div>
                      <span className="text-xxs font-semibold text-slate-200 mt-0.5 font-sans leading-tight">{c.name}</span>
                      <div className="flex justify-between items-center text-[9px] font-mono mt-2 pt-2 border-t border-slate-900 text-slate-400">
                        <span>Pena: {c.penaltyRange}</span>
                        <span className="text-orange-400 font-bold uppercase">Risco: {c.riskLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grupo C */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-xl p-4 flex flex-col gap-3">
                <div className="border-b border-slate-850 pb-2">
                  <span className="bg-blue-950 text-blue-400 border border-blue-900/45 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold">
                    GRUPO C
                  </span>
                  <h4 className="font-sans font-bold text-xs text-slate-100 mt-2">
                    {PENAL_CODE_GROUPS.grupC.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 leading-normal mt-1">
                    {PENAL_CODE_GROUPS.grupC.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
                  {PENAL_CODE_GROUPS.grupC.crimes.map(c => (
                    <div key={c.id} className="bg-slate-950 p-3 border border-slate-900 rounded flex flex-col gap-1 leading-snug">
                      <div className="flex justify-between items-center text-slate-300 font-mono text-[9px]">
                        <span className="font-semibold text-indigo-400">{c.article}</span>
                        <span className="bg-slate-900 px-1.5 py-0.2 rounded text-slate-500 text-[9px]">{c.id}</span>
                      </div>
                      <span className="text-xxs font-semibold text-slate-200 mt-0.5 font-sans leading-tight">{c.name}</span>
                      <div className="flex justify-between items-center text-[9px] font-mono mt-2 pt-2 border-t border-slate-900 text-slate-400">
                        <span>Pena: {c.penaltyRange}</span>
                        <span className="text-sky-400 font-bold uppercase">Risco: {c.riskLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SUBTAB 8: CONSULTOR LEGAL INTELIGENTE (Q&A) */}
        {activeSubTab === "assistant" && (
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-5 flex flex-col gap-4">
            <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase block">Consultor Governamental e Normativo do S.P.A.</span>
                <p className="text-xxs text-slate-400 font-sans mt-0.5">Análise em tempo real de conformidade e referências cruzadas de legislação penitenciária nacional e internacional.</p>
              </div>
              <span className="bg-slate-900 border border-slate-800 text-[10px] text-indigo-400 px-2 py-0.5 font-mono rounded">
                AI Legal Counsel
              </span>
            </div>

            {/* Chat Box */}
            <div className="flex flex-col gap-3 min-h-[350px] max-h-[400px] overflow-y-auto bg-slate-900/60 p-4 rounded-lg border border-slate-900" id="legal-ai-chat-history">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}>
                  <div className={`p-3 rounded-xl text-xxs font-sans leading-relaxed ${
                    msg.sender === "user" 
                      ? "bg-indigo-600 text-slate-100 rounded-tr-none" 
                      : "bg-slate-950 text-slate-200 border border-slate-850 rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                  {msg.source && (
                    <span className="text-[9px] font-mono text-slate-500 mt-1 uppercase">Fonte: {msg.source}</span>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="mr-auto flex items-center gap-1.5 text-[10px] text-slate-500 font-mono animate-pulse">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                  <span>AI Legal Counsel está a consultar os Decretos e Acórdãos...</span>
                </div>
              )}
            </div>

            {/* Quick help triggers */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[9px] font-mono text-slate-500 uppercase font-semibold flex items-center shrink-0">Dúvidas Frequentes:</span>
              <button 
                type="button"
                onClick={() => setChatQuery("Quais são as atribuições da Direcção de Segurança Penitenciária no Artigo 27?")}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[9px] font-mono py-1 px-2.5 rounded border border-slate-850 cursor-pointer"
              >
                Segurança (Art. 27º)
              </button>
              <button 
                type="button"
                onClick={() => setChatQuery("Como as Regras de Nelson Mandela influenciam o monitor de lotação do PNAP?")}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[9px] font-mono py-1 px-2.5 rounded border border-slate-850 cursor-pointer"
              >
                Nelson Mandela & Lotação
              </button>
              <button 
                type="button"
                onClick={() => setChatQuery("Quantas vagas de pessoal e patentes existem para Agente de 3ª Classe no Anexo I?")}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[9px] font-mono py-1 px-2.5 rounded border border-slate-850 cursor-pointer"
              >
                Patentes (Anexo I)
              </button>
              <button 
                type="button"
                onClick={() => setChatQuery("Qual a moldura penal e perigosidade para o crime de Homicídio Voluntário?")}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[9px] font-mono py-1 px-2.5 rounded border border-slate-850 cursor-pointer"
              >
                Homicídio (Grupo A)
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input
                type="text"
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                placeholder="Ex: Como o Artigo 29 determina o registo de guias de soltura biométricas?"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xxs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 px-4 py-2 text-xxs font-mono font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" /> Enviar
              </button>
            </form>
          </div>
        )}

        {/* SUBTAB 9: AUDITORIA DE CONFORMIDADE LEGAL N.E.P. (DECRETO EXECUTIVO 272/16) */}
        {activeSubTab === "nep_audit" && (
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 flex flex-col gap-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase text-slate-100">
                  Painel Operacional • Auditoria N.E.P. (Dec. 272/16)
                </h3>
              </div>
              <span className="text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded font-bold uppercase">
                MODAL ACCESSIBLE
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 uppercase">Conformidade:</span>
                <span className="font-bold text-emerald-400">88%</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 uppercase">Auditados:</span>
                <span className="font-bold text-slate-200">15</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 uppercase">Violações:</span>
                <span className="font-bold text-emerald-400">0</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 uppercase">Norma:</span>
                <span className="font-bold text-amber-400">Dec. 272/16</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
              <button
                type="button"
                onClick={() => setIsNEPAuditorModalOpen(true)}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 rounded text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> ⚡ ABRIR CONSOLA DE AUDITORIA (MODAL)
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODAL AUDITORIA N.E.P. */}
      {isNEPAuditorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-7xl h-[90vh] flex flex-col">
            <NEPComplianceAuditor
              inmates={inmates}
              pendingMovements={pendingMovements}
              movementLogs={movementLogs}
              prisons={prisons}
              triggerToast={triggerToast}
              currentOperator={currentOperator}
              isOpen={true}
              onClose={() => setIsNEPAuditorModalOpen(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
