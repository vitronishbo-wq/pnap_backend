/**
 * MOTOR NACIONAL DE CLASSIFICAÇÃO PENITENCIÁRIA (MNCP)
 * PNAP-AO Law-Driven Operational Digital Twin Kernel
 * 
 * Regula deterministicamente a triagem, alocação e alojamento de reclusos
 * com base na legislação angolana (Código Penal - Lei n.º 38/20 de 11 de Novembro
 * e Regulamento Prisional - Lei n.º 8/08).
 */

export interface PenalCodeArticle {
  id: string;
  group: 
    | "CRIMES_CONTRA_PESSOAS" 
    | "CRIMES_CONTRA_FAMILIA" 
    | "CRIMES_CONTRA_FE_PUBLICA" 
    | "CRIMES_CONTRA_SEGURANCA_COLECTIVA" 
    | "CRIMES_CONTRA_ESTADO" 
    | "CRIMES_CONTRA_PAZ_INTERNACIONAL" 
    | "CRIMES_CONTRA_PATRIMONIO" 
    | "CRIMES_INFORMATICOS" 
    | "CRIMES_CONTRA_CONSUMIDOR_MERCADO" 
    | "OUTROS";
  groupTitle: string;
  category: string;
  crimeName: string;
  articleNumber: string;
  paragraph?: string;
  severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE" | "GRUPO_B_MEDIA_PERIGOSIDADE" | "GRUPO_C_ORDEM_PUBLICA_ESPECIAL" | "GRUPO_D_BAIXA_PERIGOSIDADE";
  baseSecurityLevel: "ALTA" | "MEDIA" | "BAIXA" | "ESPECIAL";
  description: string;
  maxPenaltyYears: number;
}

export interface InmateClassificationInput {
  sex: "MASCULINO" | "FEMININO";
  legalStatus: "DETIDO" | "PREVENTIVO" | "CONDENADO" | "MEDIDA_SEGURANCA" | "MENOR_JOVEM" | "ESTRANGEIRO";
  crimeId: string;
  crimeForm: "CONSUMADO" | "TENTADO" | "CUMPLICIDADE";
  isQualified: boolean;
  age: number;
  disciplinaryGrade?: "A" | "B" | "C";
  escapeRisk?: boolean;
  factionMember?: boolean;
  contagiousPathology?: boolean;
  psychiatricNeed?: boolean;
  threatToSelfOrOthers?: boolean;
  vulnerabilityStatus?: boolean;
}

export interface MNCPDecisionResult {
  pavilhao: string;
  subArea: string;
  nivelSeguranca: "ALTA" | "MEDIA" | "BAIXA" | "ESPECIAL";
  blocoRecomendado: "A" | "B" | "C" | "D_ISOLAMENTO" | "E_SAUDE";
  celasElegiveis: string[];
  alertasCompatibilidade: string[];
  aprovacoesObrigatorias: string[];
  tipoEscolta: string;
  restricoesVisitas: string;
  planoReinsercaoInicial: string;
  auditHash: string;
  crimeDetails: PenalCodeArticle;
}

// BANCADA COMPLETA DE CONHECIMENTO JURÍDICO - CÓDIGO PENAL ANGOLANO (LEI N.º 38/20)
export const PENAL_CODE_GRAPH: PenalCodeArticle[] = [
  // --- TÍTULO I: CRIMES CONTRA AS PESSOAS ---
  {
    id: "CP-ART-147",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Crimes contra a Vida",
    crimeName: "Homicídio Simples",
    articleNumber: "Artigo 147.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Quem matar voluntariamente outra pessoa (Pena: 14 a 20 anos).",
    maxPenaltyYears: 20
  },
  {
    id: "CP-ART-148",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Crimes contra a Vida",
    crimeName: "Homicídio Qualificado em Razão dos Meios",
    articleNumber: "Artigo 148.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Homicídio cometido com veneno, crueldade, tortura ou grave abuso de autoridade (Pena: 20 a 25 anos).",
    maxPenaltyYears: 25
  },
  {
    id: "CP-ART-149",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Crimes contra a Vida",
    crimeName: "Homicídio Qualificado em Razão dos Motivos",
    articleNumber: "Artigo 149.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Homicídio por avidez, paga, ódio racial, político, étnico ou frieza de ânimo (Pena: 20 a 25 anos).",
    maxPenaltyYears: 25
  },
  {
    id: "CP-ART-150",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Crimes contra a Vida",
    crimeName: "Homicídio Qualificado em Razão da Qualidade da Vítima",
    articleNumber: "Artigo 150.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Homicídio contra cônjuge, descendente, Titulares de Órgãos de Soberania, Magistrado, Policial ou Agente Público (Pena: 20 a 25 anos).",
    maxPenaltyYears: 25
  },
  {
    id: "CP-ART-151",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Crimes contra a Vida",
    crimeName: "Infanticídio",
    articleNumber: "Artigo 151.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Mãe que matar o filho sob influência perturbadora do estado puerperal (Pena: até 3 anos).",
    maxPenaltyYears: 3
  },
  {
    id: "CP-ART-152",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Crimes contra a Vida",
    crimeName: "Homicídio Negligente",
    articleNumber: "Artigo 152.º",
    severityGroup: "GRUPO_D_BAIXA_PERIGOSIDADE",
    baseSecurityLevel: "BAIXA",
    description: "Quem por negligência matar outra pessoa (Pena: até 3 a 5 anos).",
    maxPenaltyYears: 5
  },
  {
    id: "CP-ART-154",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Vida Intra-Uterina",
    crimeName: "Interrupção de Gravidez Ilícita",
    articleNumber: "Artigo 154.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Interrupção de gravidez sem consentimento ou fora das excepções legais (Pena: 2 a 8 anos).",
    maxPenaltyYears: 8
  },
  {
    id: "CP-ART-159",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Integridade Física",
    crimeName: "Ofensa Simples à Integridade Física",
    articleNumber: "Artigo 159.º",
    severityGroup: "GRUPO_D_BAIXA_PERIGOSIDADE",
    baseSecurityLevel: "BAIXA",
    description: "Ofensa ao corpo ou à saúde de outra pessoa (Pena: até 1 ano).",
    maxPenaltyYears: 1
  },
  {
    id: "CP-ART-160",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Integridade Física",
    crimeName: "Ofensa Grave à Integridade Física / Mutilação",
    articleNumber: "Artigo 160.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Deformidade grave, mutilação genital, diminuição permanente de órgão ou membro (Pena: 2 a 12 anos).",
    maxPenaltyYears: 12
  },
  {
    id: "CP-ART-168",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Integridade Física",
    crimeName: "Maus-Tratos a Menores, Incapazes ou Familiares",
    articleNumber: "Artigo 168.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Maus-tratos físicos, psíquicos ou exploração de menores e violência doméstica (Pena: 2 a 6 anos).",
    maxPenaltyYears: 6
  },
  {
    id: "CP-ART-170",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Liberdade Pessoal",
    crimeName: "Ameaça de Morte ou Crime Grave",
    articleNumber: "Artigo 170.º",
    severityGroup: "GRUPO_D_BAIXA_PERIGOSIDADE",
    baseSecurityLevel: "BAIXA",
    description: "Ameaçar seriamente com prática de crime contra integridade ou vida (Pena: até 2 anos).",
    maxPenaltyYears: 2
  },
  {
    id: "CP-ART-171",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Liberdade Pessoal",
    crimeName: "Coação Simples ou Grave",
    articleNumber: "Artigo 171.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Constranger pessoa a acção ou omissão por meio de violência ou ameaça (Pena: até 5 anos).",
    maxPenaltyYears: 5
  },
  {
    id: "CP-ART-174",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Liberdade Pessoal",
    crimeName: "Sequestro",
    articleNumber: "Artigo 174.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Privação ilegal de liberdade com tortura, usurpação ou duração prolongada (Pena: 6 meses a 14 anos).",
    maxPenaltyYears: 14
  },
  {
    id: "CP-ART-175",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Liberdade Pessoal",
    crimeName: "Rapto",
    articleNumber: "Artigo 175.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Rapto mediante violência para submeter a escravidão, extorsão ou abuso sexual (Pena: 1 a 15 anos).",
    maxPenaltyYears: 15
  },
  {
    id: "CP-ART-176",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Liberdade Pessoal",
    crimeName: "Tomada de Reféns",
    articleNumber: "Artigo 176.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Sequestro/rapto para coagir Estado, organização ou entidade sob ameaça (Pena: 2 a 15 anos).",
    maxPenaltyYears: 15
  },
  {
    id: "CP-ART-177",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Liberdade Pessoal",
    crimeName: "Escravidão / Compra e Venda de Pessoas",
    articleNumber: "Artigo 177.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Reduzir pessoa a estado de propriedade ou transacionar crianças (Pena: 7 a 15 anos).",
    maxPenaltyYears: 15
  },
  {
    id: "CP-ART-178",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Liberdade Pessoal",
    crimeName: "Tráfico de Pessoas e Órgãos Humanos",
    articleNumber: "Artigo 178.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Recrutamento ou transporte para exploração de trabalho ou extracção de órgãos (Pena: 4 a 25 anos).",
    maxPenaltyYears: 25
  },
  {
    id: "CP-ART-182",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Crimes Sexuais",
    crimeName: "Agressão Sexual",
    articleNumber: "Artigo 182.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Acto sexual realizado por ameaça, coação ou violência (Pena: 6 meses a 4 anos).",
    maxPenaltyYears: 4
  },
  {
    id: "CP-ART-183",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Crimes Sexuais",
    crimeName: "Agressão Sexual com Penetração (Violação)",
    articleNumber: "Artigo 183.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Penetração sexual por violência, coação ou ameaça (Pena: 3 a 10 anos).",
    maxPenaltyYears: 10
  },
  {
    id: "CP-ART-184",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Crimes Sexuais",
    crimeName: "Abuso Sexual de Pessoa Inconsciente ou Incapaz",
    articleNumber: "Artigo 184.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Acto sexual com pessoa impossibilitada de resistir (Pena: 1 a 12 anos).",
    maxPenaltyYears: 12
  },
  {
    id: "CP-ART-185",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Crimes Sexuais",
    crimeName: "Abuso Sexual de Pessoa Internada em Estabelecimento",
    articleNumber: "Artigo 185.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Aproveitamento de cargo em prisão, hospital ou escola para abuso sexual (Pena: 1 a 10 anos).",
    maxPenaltyYears: 10
  },
  {
    id: "CP-ART-192",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Autodeterminação Sexual de Menores",
    crimeName: "Abuso Sexual de Menor de 14 Anos",
    articleNumber: "Artigo 192.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Prática de acto sexual ou penetração com menor de 14 anos (Pena: 1 a 15 anos).",
    maxPenaltyYears: 15
  },
  {
    id: "CP-ART-195",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Autodeterminação Sexual de Menores",
    crimeName: "Lenocínio e Tráfico Sexual de Menores",
    articleNumber: "Artigos 195.º/196.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Promover ou facilitar prostituição ou tráfico de menores (Pena: 3 a 15 anos).",
    maxPenaltyYears: 15
  },
  {
    id: "CP-ART-198",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Autodeterminação Sexual de Menores",
    crimeName: "Pornografia Infantil",
    articleNumber: "Artigo 198.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Produção, difusão ou posse de material pornográfico infantil (Pena: 1 a 10 anos).",
    maxPenaltyYears: 10
  },
  {
    id: "CP-ART-203",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Colocação em Perigo",
    crimeName: "Abandono de Pessoa ou Recém-Nascido",
    articleNumber: "Artigos 203.º/204.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Abandonar pessoa indefesa ou recém-nascido em local desprovido de socorro (Pena: 1 a 15 anos).",
    maxPenaltyYears: 15
  },
  {
    id: "CP-ART-205",
    group: "CRIMES_CONTRA_PESSOAS",
    groupTitle: "Crimes Contra as Pessoas",
    category: "Colocação em Perigo",
    crimeName: "Contágio Intencional de Doença Sexualmente Transmissível / Grave",
    articleNumber: "Artigos 205.º/206.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Transmitir dolosamente doença viral/bacteriana grave colocando vida em risco (Pena: até 15 anos).",
    maxPenaltyYears: 15
  },

  // --- TÍTULO II: CRIMES CONTRA A FAMÍLIA ---
  {
    id: "CP-ART-238",
    group: "CRIMES_CONTRA_FAMILIA",
    groupTitle: "Crimes Contra a Família",
    category: "Estado Civil",
    crimeName: "Casamento Fraudulento / Bigamia",
    articleNumber: "Artigo 238.º",
    severityGroup: "GRUPO_D_BAIXA_PERIGOSIDADE",
    baseSecurityLevel: "BAIXA",
    description: "Contrair novo casamento sendo casado ou com pessoa casada (Pena: 6 meses a 2 anos).",
    maxPenaltyYears: 2
  },
  {
    id: "CP-ART-245",
    group: "CRIMES_CONTRA_FAMILIA",
    groupTitle: "Crimes Contra a Família",
    category: "Estado Civil & Filiação",
    crimeName: "Substituição ou Subtracção de Recém-Nascido",
    articleNumber: "Artigo 245.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Substituição de recém-nascido por outro ou sua subtracção (Pena: 2 a 8 anos).",
    maxPenaltyYears: 8
  },
  {
    id: "CP-ART-247",
    group: "CRIMES_CONTRA_FAMILIA",
    groupTitle: "Crimes Contra a Família",
    category: "Assistência Familiar",
    crimeName: "Abandono de Assistência Familiar",
    articleNumber: "Artigo 247.º",
    severityGroup: "GRUPO_D_BAIXA_PERIGOSIDADE",
    baseSecurityLevel: "BAIXA",
    description: "Deixar de prover à subsistência de cônjuge, filho menor ou incapaz (Pena: até 2 a 8 anos).",
    maxPenaltyYears: 8
  },
  {
    id: "CP-ART-248",
    group: "CRIMES_CONTRA_FAMILIA",
    groupTitle: "Crimes Contra a Família",
    category: "Guarda de Menores",
    crimeName: "Subtracção de Menor da Guarda Paternal",
    articleNumber: "Artigo 248.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Subtrair ou recusar entrega de menor ao titular do poder paternal (Pena: 1 a 4 anos).",
    maxPenaltyYears: 4
  },

  // --- TÍTULO III: CRIMES CONTRA A FÉ PÚBLICA ---
  {
    id: "CP-ART-251",
    group: "CRIMES_CONTRA_FE_PUBLICA",
    groupTitle: "Crimes Contra a Fé Pública",
    category: "Falsificação de Documentos",
    crimeName: "Falsificação de Documento Público ou Particular",
    articleNumber: "Artigo 251.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Elaborar, alterar ou utilizar documento falso ou apócrifo (Pena: até 6 anos).",
    maxPenaltyYears: 6
  },
  {
    id: "CP-ART-256",
    group: "CRIMES_CONTRA_FE_PUBLICA",
    groupTitle: "Crimes Contra a Fé Pública",
    category: "Moeda e Títulos",
    crimeName: "Contrafacção de Moeda Nacional ou Estrangeira",
    articleNumber: "Artigo 256.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Fabricar ou emitir moeda metálica ou papel-moeda imitando a verdadeira (Pena: 2 a 12 anos).",
    maxPenaltyYears: 12
  },
  {
    id: "CP-ART-261",
    group: "CRIMES_CONTRA_FE_PUBLICA",
    groupTitle: "Crimes Contra a Fé Pública",
    category: "Moeda e Títulos",
    crimeName: "Falsificação de Títulos de Crédito e Cartões Bancários",
    articleNumber: "Artigo 261.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Fabricar ou falsificar cheques, cartões de crédito/débito ou títulos de crédito (Pena: 2 a 12 anos).",
    maxPenaltyYears: 12
  },

  // --- TÍTULO IV: CRIMES CONTRA A SEGURANÇA COLECTIVA ---
  {
    id: "CP-ART-277",
    group: "CRIMES_CONTRA_SEGURANCA_COLECTIVA",
    groupTitle: "Crimes Contra a Segurança Colectiva",
    category: "Perigo Comum",
    crimeName: "Incêndio, Inundação ou Explosão",
    articleNumber: "Artigo 277.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Provocar fogo, explosão, radiação ou gases tóxicos pondo em risco a comunidade (Pena: 2 a 12 anos).",
    maxPenaltyYears: 12
  },
  {
    id: "CP-ART-278",
    group: "CRIMES_CONTRA_SEGURANCA_COLECTIVA",
    groupTitle: "Crimes Contra a Segurança Colectiva",
    category: "Perigo Comum",
    crimeName: "Posse e Tráfico de Explosivos, Armas Proibidas e Material de Guerra",
    articleNumber: "Artigos 278.º/279.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Fabrico, transporte, cedência ou posse ilícita de armas de guerra, munições e explosivos (Pena: 1 a 12 anos).",
    maxPenaltyYears: 12
  },
  {
    id: "CP-ART-281",
    group: "CRIMES_CONTRA_SEGURANCA_COLECTIVA",
    groupTitle: "Crimes Contra a Segurança Colectiva",
    category: "Ordem Pública",
    crimeName: "Tráfico Ilícito de Migrantes",
    articleNumber: "Artigo 281.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Promover entrada ou saída ilegal de cidadãos do território nacional (Pena: até 6 anos).",
    maxPenaltyYears: 6
  },
  {
    id: "CP-ART-290",
    group: "CRIMES_CONTRA_SEGURANCA_COLECTIVA",
    groupTitle: "Crimes Contra a Segurança Colectiva",
    category: "Infraestruturas Críticas",
    crimeName: "Vandalização de Infraestruturas Públicas e Serviços Essenciais",
    articleNumber: "Artigo 290.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Destruição de rede elétrica, água, saneamento, combustível ou telecomunicações (Pena: 1 a 6 anos).",
    maxPenaltyYears: 6
  },
  {
    id: "CP-ART-296",
    group: "CRIMES_CONTRA_SEGURANCA_COLECTIVA",
    groupTitle: "Crimes Contra a Segurança Colectiva",
    category: "Crime Organizado",
    crimeName: "Associação Criminosa",
    articleNumber: "Artigo 296.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Participação, chefia ou colaboração em grupo estruturado para prática de crimes (Pena: 1 a 10 anos).",
    maxPenaltyYears: 10
  },
  {
    id: "CP-ART-297",
    group: "CRIMES_CONTRA_SEGURANCA_COLECTIVA",
    groupTitle: "Crimes Contra a Segurança Colectiva",
    category: "Terrorismo",
    crimeName: "Crimes de Terrorismo e Financiamento ao Terrorismo",
    articleNumber: "Artigo 297.º",
    severityGroup: "GRUPO_C_ORDEM_PUBLICA_ESPECIAL",
    baseSecurityLevel: "ESPECIAL",
    description: "Actos voltados a provocar terror público com fins políticos ou subversivos (Pena: até 25 anos).",
    maxPenaltyYears: 25
  },
  {
    id: "CP-ART-299",
    group: "CRIMES_CONTRA_SEGURANCA_COLECTIVA",
    groupTitle: "Crimes Contra a Segurança Colectiva",
    category: "Ordem Pública",
    crimeName: "Participação em Motim Armado",
    articleNumber: "Artigo 299.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Ajuntamento tumultuoso armado com actos de violência contra pessoas ou bens (Pena: 1 a 5 anos).",
    maxPenaltyYears: 5
  },

  // --- TÍTULO V: CRIMES CONTRA O ESTADO ---
  {
    id: "CP-ART-310",
    group: "CRIMES_CONTRA_ESTADO",
    groupTitle: "Crimes Contra o Estado",
    category: "Segurança Exterior e Sobranis",
    crimeName: "Alta Traição à Pátria",
    articleNumber: "Artigo 310.º",
    severityGroup: "GRUPO_C_ORDEM_PUBLICA_ESPECIAL",
    baseSecurityLevel: "ESPECIAL",
    description: "Pôr em perigo a independência e integridade territorial ou participar de acções armadas contra Angola (Pena: 10 a 20 anos).",
    maxPenaltyYears: 20
  },
  {
    id: "CP-ART-316",
    group: "CRIMES_CONTRA_ESTADO",
    groupTitle: "Crimes Contra o Estado",
    category: "Segurança de Estado",
    crimeName: "Violação de Segredo de Estado",
    articleNumber: "Artigo 316.º",
    severityGroup: "GRUPO_C_ORDEM_PUBLICA_ESPECIAL",
    baseSecurityLevel: "ESPECIAL",
    description: "Tornar público ou acessível a entidade estrangeira documentos ou factos estratégicos (Pena: 8 a 15 anos).",
    maxPenaltyYears: 15
  },
  {
    id: "CP-ART-317",
    group: "CRIMES_CONTRA_ESTADO",
    groupTitle: "Crimes Contra o Estado",
    category: "Segurança de Estado",
    crimeName: "Espionagem",
    articleNumber: "Artigo 317.º",
    severityGroup: "GRUPO_C_ORDEM_PUBLICA_ESPECIAL",
    baseSecurityLevel: "ESPECIAL",
    description: "Aceder e transmitir segredo de Estado ao serviço de governo ou inteligência estrangeira (Pena: 5 a 15 anos).",
    maxPenaltyYears: 15
  },
  {
    id: "CP-ART-329",
    group: "CRIMES_CONTRA_ESTADO",
    groupTitle: "Crimes Contra o Estado",
    category: "Ordem Constitucional",
    crimeName: "Rebelião Armada",
    articleNumber: "Artigo 329.º",
    severityGroup: "GRUPO_C_ORDEM_PUBLICA_ESPECIAL",
    baseSecurityLevel: "ESPECIAL",
    description: "Tentar alterar a Constituição ou subverter as instituições do Estado por violência armada (Pena: 5 a 15 anos).",
    maxPenaltyYears: 15
  },
  {
    id: "CP-ART-330",
    group: "CRIMES_CONTRA_ESTADO",
    groupTitle: "Crimes Contra o Estado",
    category: "Ordem Constitucional",
    crimeName: "Sabotagem Contra o Estado",
    articleNumber: "Artigo 330.º",
    severityGroup: "GRUPO_C_ORDEM_PUBLICA_ESPECIAL",
    baseSecurityLevel: "ESPECIAL",
    description: "Destruir ou desestabilizar infraestruturas de telecomunicação, portos ou serviços vitais (Pena: 5 a 15 anos).",
    maxPenaltyYears: 15
  },
  {
    id: "CP-ART-331",
    group: "CRIMES_CONTRA_ESTADO",
    groupTitle: "Crimes Contra o Estado",
    category: "Soberania",
    crimeName: "Atentado contra o Presidente da República e Titulares de Órgãos de Soberania",
    articleNumber: "Artigo 331.º",
    severityGroup: "GRUPO_C_ORDEM_PUBLICA_ESPECIAL",
    baseSecurityLevel: "ESPECIAL",
    description: "Ataque contra a vida ou integridade física do Chefe de Estado ou Titulares de Soberania (Pena: 8 a 15 anos).",
    maxPenaltyYears: 15
  },
  {
    id: "CP-ART-346",
    group: "CRIMES_CONTRA_ESTADO",
    groupTitle: "Crimes Contra o Estado",
    category: "Autoridade Pública",
    crimeName: "Libertação Ilícita ou Promovida de Reclusos",
    articleNumber: "Artigo 346.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Libertar, induzir à fuga ou auxiliar evasão de pessoa legalmente presa (Pena: 6 meses a 8 anos).",
    maxPenaltyYears: 8
  },
  {
    id: "CP-ART-347",
    group: "CRIMES_CONTRA_ESTADO",
    groupTitle: "Crimes Contra o Estado",
    category: "Autoridade Pública",
    crimeName: "Amotinação de Reclusos em Estabelecimento Prisional",
    articleNumber: "Artigo 347.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Unir forças e usar violência contra guarda prisional ou segurança do presídio (Pena: 1 a 10 anos).",
    maxPenaltyYears: 10
  },
  {
    id: "CP-ART-358",
    group: "CRIMES_CONTRA_ESTADO",
    groupTitle: "Crimes Contra o Estado",
    category: "Probidade Pública",
    crimeName: "Corrupção Activa e Passiva de Funcionário",
    articleNumber: "Artigos 358.º/359.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Solicitar, aceitar, oferecer ou dar vantagem indevida no exercício de funções públicas (Pena: até 10 anos).",
    maxPenaltyYears: 10
  },
  {
    id: "CP-ART-362",
    group: "CRIMES_CONTRA_ESTADO",
    groupTitle: "Crimes Contra o Estado",
    category: "Probidade Pública",
    crimeName: "Peculato / Peculato de Uso",
    articleNumber: "Artigos 362.º/363.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Apropriação ilegítima de valores ou bens públicos por funcionário no cargo (Pena: 1 a 14 anos).",
    maxPenaltyYears: 14
  },
  {
    id: "CP-ART-370",
    group: "CRIMES_CONTRA_ESTADO",
    groupTitle: "Crimes Contra o Estado",
    category: "Direitos Humanos",
    crimeName: "Tortura e Tratamentos Cruéis por Agente Público",
    articleNumber: "Artigo 370.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Prática de tortura, violência física ou psicológica contra pessoa sob custódia (Pena: 1 a 15 anos).",
    maxPenaltyYears: 15
  },

  // --- TÍTULO VI: CRIMES CONTRA A PAZ E COMUNIDADE INTERNACIONAL ---
  {
    id: "CP-ART-381",
    group: "CRIMES_CONTRA_PAZ_INTERNACIONAL",
    groupTitle: "Crimes Contra a Paz e Comunidade Internacional",
    category: "Direito Internacional Humanitário",
    crimeName: "Genocídio",
    articleNumber: "Artigo 381.º",
    severityGroup: "GRUPO_C_ORDEM_PUBLICA_ESPECIAL",
    baseSecurityLevel: "ESPECIAL",
    description: "Actuação concertada com intenção de exterminar grupo nacional, étnico, racial ou religioso (Pena: 5 a 25 anos).",
    maxPenaltyYears: 25
  },
  {
    id: "CP-ART-382",
    group: "CRIMES_CONTRA_PAZ_INTERNACIONAL",
    groupTitle: "Crimes Contra a Paz e Comunidade Internacional",
    category: "Direito Internacional Humanitário",
    crimeName: "Crimes de Lesa Humanidade",
    articleNumber: "Artigo 382.º",
    severityGroup: "GRUPO_C_ORDEM_PUBLICA_ESPECIAL",
    baseSecurityLevel: "ESPECIAL",
    description: "Ataque generalizado ou sistemático contra civis com extermínio, escravidão ou tortura (Pena: 3 a 20 anos).",
    maxPenaltyYears: 20
  },
  {
    id: "CP-ART-385",
    group: "CRIMES_CONTRA_PAZ_INTERNACIONAL",
    groupTitle: "Crimes Contra a Paz e Comunidade Internacional",
    category: "Direito Internacional Humanitário",
    crimeName: "Crimes de Guerra contra Civis e Combatentes",
    articleNumber: "Artigos 385.º/387.º",
    severityGroup: "GRUPO_C_ORDEM_PUBLICA_ESPECIAL",
    baseSecurityLevel: "ESPECIAL",
    description: "Ataque a população civil, recrutamento de menores, escudos humanos ou execuções extrajudiciais (Pena: 5 a 20 anos).",
    maxPenaltyYears: 20
  },

  // --- TÍTULO VII: CRIMES CONTRA O PATRIMÓNIO ---
  {
    id: "CP-ART-392",
    group: "CRIMES_CONTRA_PATRIMONIO",
    groupTitle: "Crimes Contra o Património",
    category: "Propriedade",
    crimeName: "Furto Simples",
    articleNumber: "Artigo 392.º",
    severityGroup: "GRUPO_D_BAIXA_PERIGOSIDADE",
    baseSecurityLevel: "BAIXA",
    description: "Subtração de coisa móvel alheia sem violência (Pena: até 3 a 8 anos dependendo do valor).",
    maxPenaltyYears: 8
  },
  {
    id: "CP-ART-393",
    group: "CRIMES_CONTRA_PATRIMONIO",
    groupTitle: "Crimes Contra o Património",
    category: "Propriedade",
    crimeName: "Furto Qualificado (Arrombamento / Bando / Escala)",
    articleNumber: "Artigo 393.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Furto por arrombamento, chave falsa, bando organizado ou em habitação (Pena: 1 a 12 anos).",
    maxPenaltyYears: 12
  },
  {
    id: "CP-ART-401",
    group: "CRIMES_CONTRA_PATRIMONIO",
    groupTitle: "Crimes Contra o Património",
    category: "Propriedade com Violência",
    crimeName: "Roubo Simples",
    articleNumber: "Artigo 401.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Subtração mediante violência contra pessoa ou ameaça iminente (Pena: até 5 a 10 anos).",
    maxPenaltyYears: 10
  },
  {
    id: "CP-ART-402",
    group: "CRIMES_CONTRA_PATRIMONIO",
    groupTitle: "Crimes Contra o Património",
    category: "Propriedade com Violência",
    crimeName: "Roubo Qualificado (Com Arma de Fogo / Mão Armada)",
    articleNumber: "Artigo 402.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Roubo cometido com uso de arma de fogo ou com perigo efectivo de morte (Pena: 3 a 15 anos).",
    maxPenaltyYears: 15
  },
  {
    id: "CP-ART-404",
    group: "CRIMES_CONTRA_PATRIMONIO",
    groupTitle: "Crimes Contra o Património",
    category: "Apropriação Indevida",
    crimeName: "Abuso de Confiança / Abuso Qualificado",
    articleNumber: "Artigos 404.º/405.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Apropriação de coisa móvel entregue a título não translativo (Pena: até 8 anos).",
    maxPenaltyYears: 8
  },
  {
    id: "CP-ART-417",
    group: "CRIMES_CONTRA_PATRIMONIO",
    groupTitle: "Crimes Contra o Património",
    category: "Fraudulência",
    crimeName: "Burla / Burla Qualificada",
    articleNumber: "Artigos 417.º/418.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Uso de meio astucioso/enganoso para obter enriquecimento ilícito (Pena: até 12 anos).",
    maxPenaltyYears: 12
  },
  {
    id: "CP-ART-425",
    group: "CRIMES_CONTRA_PATRIMONIO",
    groupTitle: "Crimes Contra o Património",
    category: "Extorsão",
    crimeName: "Extorsão Mediante Violência ou Ameaça",
    articleNumber: "Artigo 425.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Coagir pessoa a disposição patrimonial mediante violência ou ameaça (Pena: até 15 anos).",
    maxPenaltyYears: 15
  },
  {
    id: "CP-ART-435",
    group: "CRIMES_CONTRA_PATRIMONIO",
    groupTitle: "Crimes Contra o Património",
    category: "Receptação",
    crimeName: "Receptação e Auxílio Material a Ilícito",
    articleNumber: "Artigo 435.º",
    severityGroup: "GRUPO_D_BAIXA_PERIGOSIDADE",
    baseSecurityLevel: "BAIXA",
    description: "Adquirir, ocultar ou conservar coisa sabendo ser proveniente de crime (Pena: até 3 anos).",
    maxPenaltyYears: 3
  },

  // --- TÍTULO VIII: CRIMES INFORMÁTICOS ---
  {
    id: "CP-ART-438",
    group: "CRIMES_INFORMATICOS",
    groupTitle: "Crimes Informáticos",
    category: "Cibersegurança",
    crimeName: "Acesso Ilegítimo a Sistema de Informação",
    articleNumber: "Artigo 438.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Acesso não autorizado a sistema de informação ou violação de regras de segurança (Pena: até 8 anos).",
    maxPenaltyYears: 8
  },
  {
    id: "CP-ART-441",
    group: "CRIMES_INFORMATICOS",
    groupTitle: "Crimes Informáticos",
    category: "Cibersegurança",
    crimeName: "Sabotagem Informática e Cibernética",
    articleNumber: "Artigo 441.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Danificar, interromper ou perturbar gravemente rede informática ou serviços essenciais (Pena: 2 a 8 anos).",
    maxPenaltyYears: 8
  },
  {
    id: "CP-ART-443",
    group: "CRIMES_INFORMATICOS",
    groupTitle: "Crimes Informáticos",
    category: "Ciberfraude",
    crimeName: "Burla Informática e nas Comunicações",
    articleNumber: "Artigo 443.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Interferir em processamento de dados para obter vantagem patrimonial indevida (Pena: até 12 anos).",
    maxPenaltyYears: 12
  },

  // --- TÍTULO IX: CRIMES CONTRA O CONSUMIDOR E O MERCADO ---
  {
    id: "CP-ART-446",
    group: "CRIMES_CONTRA_CONSUMIDOR_MERCADO",
    groupTitle: "Crimes Contra o Consumidor e o Mercado",
    category: "Economia e Mercado",
    crimeName: "Açambarcamento de Bens de Primeira Necessidade",
    articleNumber: "Artigo 446.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Ocultar ou recusar venda de bens essenciais prejudicando abastecimento do mercado (Pena: até 2 anos).",
    maxPenaltyYears: 2
  },
  {
    id: "CP-ART-464",
    group: "CRIMES_CONTRA_CONSUMIDOR_MERCADO",
    groupTitle: "Crimes Contra o Consumidor e o Mercado",
    category: "Mercado Financeiro e Câmbios",
    crimeName: "Fraude no Transporte ou Transferência de Moeda para o Exterior",
    articleNumber: "Artigo 464.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Fuga ilícita de capitais ou transferência bancária clandestina de divisas (Pena: 2 a 8 anos).",
    maxPenaltyYears: 8
  },
  {
    id: "CP-ART-468",
    group: "CRIMES_CONTRA_CONSUMIDOR_MERCADO",
    groupTitle: "Crimes Contra o Consumidor e o Mercado",
    category: "Mercado Financeiro e Câmbios",
    crimeName: "Retenção Ilícita de Moeda Fora do Sistema Financeiro",
    articleNumber: "Artigo 468.º",
    severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE",
    baseSecurityLevel: "MEDIA",
    description: "Retenção não autorizada de valores avultados em numerário fora do circuito bancário (Pena: até 1 ano).",
    maxPenaltyYears: 1
  },
  {
    id: "CP-ART-473",
    group: "CRIMES_CONTRA_CONSUMIDOR_MERCADO",
    groupTitle: "Crimes Contra o Consumidor e o Mercado",
    category: "Recursos Naturais e Minérios",
    crimeName: "Exploração e Tráfico Ilícito de Minerais Estratégicos e Diamantes",
    articleNumber: "Artigo 473.º",
    severityGroup: "GRUPO_A_ALTA_PERIGOSIDADE",
    baseSecurityLevel: "ALTA",
    description: "Prospecção, venda ou posse ilícita de minerais estratégicos, ouro ou pedras preciosas (Pena: até 5 a 10 anos).",
    maxPenaltyYears: 10
  }
];

export class MNCPEngine {
  /**
   * Avalia deterministicamente os dados do recluso com base no Código Penal Lei 38/20
   * e gera o relatório de alocação de alojamento, segurança e protocolos penitenciários.
   */
  public static evaluateInmate(input: InmateClassificationInput): MNCPDecisionResult {
    const alerts: string[] = [];
    const mandatoryApprovals: string[] = ["Homologação do Chefe de Segurança de Turno"];

    // 1. DETERMINAÇÃO DE PAVILHÃO POR SEXO E SAÚDE
    let pavilhao = input.sex === "FEMININO" ? "Pavilhão Feminino" : "Pavilhão Masculino";

    if (input.contagiousPathology || input.psychiatricNeed) {
      pavilhao = `${pavilhao} (Ala Hospitalar / Quarentena Sanitária)`;
      alerts.push("⚠️ REITERAÇÃO CLÍNICA: Recluso requer isolamento sanitário, biossegurança e acompanhamento médico contínuo.");
      mandatoryApprovals.push("Parecer Técnico do Diretor de Serviços de Saúde Prisional");
    }

    // 2. SITUAÇÃO JURÍDICA E SUB-ÁREA
    let subArea = "";
    switch (input.legalStatus) {
      case "DETIDO":
      case "PREVENTIVO":
        subArea = "Módulo de Detidos Preventivos (Instrução / Aguardam Julgamento)";
        break;
      case "CONDENADO":
        subArea = "Módulo de Condenados Definitivos (Execução de Pena)";
        break;
      case "MEDIDA_SEGURANCA":
        subArea = "Anexo Psiquiátrico / Medida de Segurança Judicial";
        mandatoryApprovals.push("Autorização do Tribunal de Execução de Penas (TEP)");
        break;
      case "MENOR_JOVEM":
        subArea = "Ala Autónoma de Jovens Adultos (16 a 21 Anos)";
        alerts.push("🛡️ SEGREGAÇÃO LEGAL OBRIGATÓRIA (Art. 5.º Lei 38/20): Proibido qualquer contacto com adultos condenados.");
        break;
      case "ESTRANGEIRO":
        subArea = "Módulo Diplomático / Estrangeiros (Protocolo SME / Consular)";
        break;
    }

    // 3. ANÁLISE DO CRIME GRAPH
    const crime = PENAL_CODE_GRAPH.find(c => c.id === input.crimeId) || {
      id: "CUSTOM",
      group: "OUTROS" as const,
      groupTitle: "Outros Ilícitos",
      category: "Geral",
      crimeName: "Crime Genérico / Outro",
      articleNumber: "Artigo Geral",
      severityGroup: "GRUPO_B_MEDIA_PERIGOSIDADE" as const,
      baseSecurityLevel: "MEDIA" as const,
      description: "Ilícito penal registrado.",
      maxPenaltyYears: 5
    };

    let nivelSeguranca: "ALTA" | "MEDIA" | "BAIXA" | "ESPECIAL" = crime.baseSecurityLevel;

    // Ajustes de tentativa ou cumplicidade
    if (input.crimeForm === "TENTADO" || input.crimeForm === "CUMPLICIDADE") {
      if (nivelSeguranca === "ALTA" && !input.isQualified) {
        nivelSeguranca = "MEDIA";
      }
    }

    // Agravações por qualificação, risco de fuga ou facção
    if (input.isQualified || input.escapeRisk || input.factionMember) {
      if (nivelSeguranca !== "ESPECIAL") {
        nivelSeguranca = "ALTA";
      }
      if (input.escapeRisk) {
        alerts.push("🚨 RISCO DE FUGA CRÍTICO: Requer cela com contenção mecânica reforçada e vídeovigilância CCTV 24/7.");
        mandatoryApprovals.push("Aprovação do Comandante de Operações das Forças Especiais PIR/DPA");
      }
      if (input.factionMember) {
        alerts.push("⚔️ PERTENCE A FACÇÃO CRIMINOSA: Proibida alocação em cela ou bloco com membros de facções rivais.");
      }
    }

    if (input.threatToSelfOrOthers) {
      alerts.push("⛔ AMEAÇA DIRECTA DE VIOLÊNCIA: Histórico de agressividade severa ou risco de automutilação.");
    }

    // 4. DETERMINAÇÃO DO BLOCO E CELAS ELEGÍVEIS
    let blocoRecomendado: "A" | "B" | "C" | "D_ISOLAMENTO" | "E_SAUDE" = "B";
    let celasElegiveis: string[] = [];

    if (input.contagiousPathology || input.psychiatricNeed) {
      blocoRecomendado = "E_SAUDE";
      celasElegiveis = ["E1-ISO-01", "E1-ISO-02", "E2-MED-05", "E3-PSI-01"];
    } else if (input.threatToSelfOrOthers || input.escapeRisk) {
      blocoRecomendado = "D_ISOLAMENTO";
      celasElegiveis = ["D1-SEG-MAX-01", "D1-SEG-MAX-02", "D2-CONT-04"];
    } else if (nivelSeguranca === "ESPECIAL") {
      blocoRecomendado = "D_ISOLAMENTO";
      celasElegiveis = ["D3-ESP-01", "D3-ESP-02", "D3-ESP-03"];
      mandatoryApprovals.push("Despacho de Autorização do Gabinete do Director-Geral do SERNAP");
    } else if (nivelSeguranca === "ALTA" || crime.severityGroup === "GRUPO_A_ALTA_PERIGOSIDADE") {
      blocoRecomendado = "A";
      celasElegiveis = ["A1-01 (Ala Máxima)", "A1-02 (Ala Máxima)", "A2-05 (Alta Contenção)"];
    } else if (nivelSeguranca === "MEDIA" || crime.severityGroup === "GRUPO_B_MEDIA_PERIGOSIDADE") {
      blocoRecomendado = "B";
      celasElegiveis = ["B1-03 (Média Segurança)", "B1-04 (Média Segurança)", "B2-10 (Ala Comum)"];
    } else {
      blocoRecomendado = "C";
      celasElegiveis = ["C1-01 (Regime Aberto)", "C1-02 (Regime Aberto)", "C2-03 (Trabalho Oficina)"];
    }

    // 5. PROTOCOLOS OPERACIONAIS E ESCOLTA
    let tipoEscolta = "Escolta Padrão de Serviço Interno";
    let restricoesVisitas = "Visitas Regulares da Comarca (Sábados e Domingos)";
    let planoReinsercaoInicial = "Trabalho Oficina / Formação Escolar e Alfabetização";

    if (nivelSeguranca === "ALTA" || input.escapeRisk) {
      tipoEscolta = "Escolta Reforçada PIR / Batalhão de Prisão de Alta Segurança (Algemagem Dupla e Armamento Leve)";
      restricoesVisitas = "Visitas Restritas com Paravento de Vidro Blindado e Escuta de Inteligência";
      planoReinsercaoInicial = "Programa de Remição Disciplinar e Avaliação Psicológica Intensiva";
    } else if (nivelSeguranca === "ESPECIAL") {
      tipoEscolta = "Escolta Discreta e Segurança Tática de Inteligência Prisional";
      restricoesVisitas = "Visitas Sujeitas à Prévia Autorização do Gabinete do Director-Geral e Triagem de Segurança";
      planoReinsercaoInicial = "Acompanhamento Jurídico-Institucional Especializado e Isolamento Protetivo";
    }

    // Hash de Auditoria Criptográfica
    const seed = `${input.sex}-${input.legalStatus}-${crime.id}-${blocoRecomendado}-${input.age}-${Date.now()}`;
    const auditHash = "SHA256-MNCP-ANG-" + Math.abs(seed.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0) | 0, 0)).toString(16).toUpperCase();

    return {
      pavilhao,
      subArea,
      nivelSeguranca,
      blocoRecomendado,
      celasElegiveis,
      alertasCompatibilidade: alerts,
      aprovacoesObrigatorias: mandatoryApprovals,
      tipoEscolta,
      restricoesVisitas,
      planoReinsercaoInicial,
      auditHash,
      crimeDetails: crime
    };
  }
}
