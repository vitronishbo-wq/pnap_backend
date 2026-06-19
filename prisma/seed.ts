import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Inicialização segura do cliente Prisma
const prisma = new PrismaClient();

// Palavra-passe padrão de desenvolvimento
const DEFAULT_PASSWORD_PLAIN = "Trumanmarcelo_1983";

async function main() {
  console.log("=========================================================================");
  console.log("🌱 INICIANDO SEMENTEIRA DE DADOS (SEED) - AUTONOMIA PROVINCIAL DE ANGOLA");
  console.log("=========================================================================");

  // Gerar hash seguro bcriptografado dinamicamente para garantir compatibilidade
  console.log("🔐 Gerando hash seguro de desenvolvimento para as credenciais...");
  const devPasswordHash = await bcrypt.hash(DEFAULT_PASSWORD_PLAIN, 12);

  // 1. LIMPEZA PREVENTIVA DA BASE DE DADOS (Evitar duplicações em re-runs)
  console.log("🧹 Removendo dados anteriores do banco de dados...");
  await prisma.sincronizacaoLog.deleteMany({});
  await prisma.integracaoExterna.deleteMany({});
  await prisma.delegacaoCompetencia.deleteMany({});
  await prisma.logSeguranca.deleteMany({});
  await prisma.prontuarioMedico.deleteMany({});
  await prisma.planoReinsercao.deleteMany({});
  await prisma.processoPenal.deleteMany({});
  await prisma.recluso.deleteMany({});
  await prisma.cela.deleteMany({});
  await prisma.pavilhao.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.funcionario.deleteMany({});
  await prisma.estabelecimentoPrisional.deleteMany({});
  await prisma.direcaoProvincial.deleteMany({});

  // 18 Províncias Oficializadas de Angola
  const provsData = [
    { name: "Bengo", code: "BGO", capital: "Caxito", director: "Sub-Comissário João Caxito" },
    { name: "Benguela", code: "BGU", capital: "Benguela", director: "Sub-Comissário António Bento Benguela" },
    { name: "Bié", code: "BIE", capital: "Kuito", director: "Sub-Comissário Silva Bié" },
    { name: "Cabinda", code: "CAB", capital: "Cabinda", director: "Sub-Comissário Luís Cabinda" },
    { name: "Cuando Cubango", code: "CCU", capital: "Menongue", director: "Sub-Comissário Pedro Menongue" },
    { name: "Cuanza-Norte", code: "CNO", capital: "N'dalatando", director: "Sub-Comissário Mateus CuanzaN" },
    { name: "Cuanza-Sul", code: "CSU", capital: "Sumbe", director: "Sub-Comissário Miguel Sumbe" },
    { name: "Cunene", code: "CNN", capital: "Ondjiva", director: "Sub-Comissário Nelson Cunene" },
    { name: "Huambo", code: "HUA", capital: "Huambo", director: "Sub-Comissário Dr. Júlio Mbanza" },
    { name: "Huíla", code: "HUI", capital: "Lubango", director: "Sub-Comissário Lucas Lubango" },
    { name: "Luanda", code: "LUA", capital: "Luanda", director: "Sub-Comissário António Bento" },
    { name: "Lunda-Norte", code: "LNO", capital: "Dundo", director: "Sub-Comissário Daniel LundaN" },
    { name: "Lunda-Sul", code: "LSU", capital: "Saurimo", director: "Sub-Comissário José LundaS" },
    { name: "Malanje", code: "MAL", capital: "Malanje", director: "Sub-Comissário Alberto Malanje" },
    { name: "Moxico", code: "MOX", capital: "Luena", director: "Sub-Comissário Francisco Luena" },
    { name: "Namibe", code: "NAM", capital: "Moçâmedes", director: "Sub-Comissário Carlos Namibe" },
    { name: "Uíge", code: "UIG", capital: "Uíge", director: "Sub-Comissário Simão Uíge" },
    { name: "Zaire", code: "ZAI", capital: "Mbanza Kongo", director: "Sub-Comissário Zaki Zaire" },
    { name: "Moxico Leste", code: "MXL", capital: "Cazombo", director: "Sub-Comissário Bento Cazombo" },
    { name: "Icolo e Bengo", code: "ICB", capital: "Catete", director: "Sub-Comissário Manuel Catete" },
    { name: "Cubango", code: "CCB", capital: "Menongue Oeste", director: "Sub-Comissário Gabriel Oeste" },
    { name: "Cuando", code: "CUA", capital: "Menongue Leste", director: "Sub-Comissário Samuel Leste" }
  ];

  console.log(`🚀 Iniciando o ciclo de criação de ${provsData.length} delegações territoriais...`);

  // 2. CRIAR ESTRUTURA PARA CADA PROVÍNCIA
  for (const prov of provsData) {
    const uppercaseProv = prov.name.toUpperCase();
    
    // 2.1 Criar Direção Provincial
    const dirProv = await prisma.direcaoProvincial.create({
      data: {
        provincia: uppercaseProv,
        directorNome: prov.director,
        telefone: `+244 923 ${Math.floor(100000 + Math.random() * 900000)}`,
      },
    });

    // 2.2 Criar Estabelecimento Prisional Base
    const epName = uppercaseProv === "LUANDA" ? "EP Viana" : `Estabelecimento Penitenciário de ${prov.name}`;
    const ep = await prisma.estabelecimentoPrisional.create({
      data: {
        nome: epName,
        capacidade: 800,
        capacidadeOficial: 800,
        limiteOperativo: 700,
        localizacao: `${prov.capital}, ${prov.name}, Angola`,
        direcaoProvincialId: dirProv.id,
      },
    });

    // 2.3 Criar Pavilhão Base
    const pav = await prisma.pavilhao.create({
      data: {
        nome: "Pavilhão Principal",
        tipoRegime: "FECHADO",
        estabelecimentoPrisionalId: ep.id,
      },
    });

    // 2.4 Criar Cela Base
    const cela = await prisma.cela.create({
      data: {
        codigo: "Setor A - Bloco 01",
        capacidade: 12,
        pavilhaoId: pav.id,
      },
    });

    // 2.5 Criar Funcionário Militar / Diretor Cadastrado
    const func = await prisma.funcionario.create({
      data: {
        nip: `NIP-${prov.code}-${Math.floor(100 + Math.random() * 900)}`,
        nome: prov.director,
        patente: `Sub-Comissário Geral de ${prov.name}`,
        statusAtivo: true,
        estabelecimentoId: ep.id,
      },
    });

    // 2.6 Criar Utilizador Scoped Local (DIRETOR_PRISAO)
    // Email padrão: diretor.nome_prov@governo.ao ou similar
    const cleanMail = `diretor.${prov.name.toLowerCase().replace(/[\s-]/g, "")}@governo.ao`;
    await prisma.usuario.create({
      data: {
        email: cleanMail,
        senhaHashed: devPasswordHash,
        nome: prov.director,
        tipo: "DIRETOR_PRISAO",
        ativo: true,
        funcionarioId: func.id,
        estabelecimentoId: ep.id,
      },
    });

    console.log(`   🔸 [${uppercaseProv}] Criada Direção, Prisão: '${ep.nome}' | Utilizador: ${cleanMail}`);
  }

  // 3. CRIAR UTILIZADOR GLOBAL DE RECONHECIMENTO (Comissária-Geral - SUPER_ADMIN)
  const funcMaria = await prisma.funcionario.create({
    data: {
      nip: "NIP-990011",
      nome: "Maria Kiala",
      patente: "Comissária-Geral / Direção Central",
      statusAtivo: true,
    },
  });

  await prisma.usuario.create({
    data: {
      email: "maria.kiala@governo.ao",
      senhaHashed: devPasswordHash,
      nome: funcMaria.nome,
      tipo: "SUPER_ADMIN",
      ativo: true,
      funcionarioId: funcMaria.id,
    },
  });

  // 4. CRIAR CANAIS DE INTEGRAÇÃO EXTERNOS PADRÃO
  await prisma.integracaoExterna.create({
    data: {
      orgao: "SIC",
      apiKeyHashed: "7f4c391bb7b4c6aa35a4d95267b2aa219c4b7b2a9ab",
      sistemaAtivo: true,
    },
  });

  console.log("✔️  Configurado utilizador SUPER_ADMIN 'maria.kiala@governo.ao'");
  console.log("=========================================================================");
  console.log("🎉 SEMENTEIRA COMPLETA! PNAP-AO possui 22 direções com autonomia territorial.");
  console.log("=========================================================================");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar a sementeira do banco de dados:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
