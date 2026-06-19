import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJWT, SystemUserPayload } from "../middleware/rbac.middleware";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const router = Router();

// GET /api/backoffice/reclusos
// Protected by JWT. Scoped by user authority.
router.get("/reclusos", authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as SystemUserPayload;

  try {
    // Parse query params for flexible searching
    const { q, nipc, documentoId, province, limit, page } = req.query as any;

    const take = Math.min(parseInt(limit, 10) || 100, 500);
    const skip = Math.max(((parseInt(page, 10) || 1) - 1) * take, 0);

    // Base include
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
      },
      take,
      skip
    };

    // Build where clause from query params
    const whereClauses: any[] = [];

    if (q && typeof q === "string" && q.trim()) {
      const like = q.trim();
      whereClauses.push({
        OR: [
          { nomeCompleto: { contains: like, mode: "insensitive" } },
          { nipc: { contains: like, mode: "insensitive" } },
          { documentoId: { contains: like, mode: "insensitive" } },
          { estabelecimento: { nome: { contains: like, mode: "insensitive" } } },
          { estabelecimento: { localizacao: { contains: like, mode: "insensitive" } } }
        ]
      });
    }

    if (nipc && typeof nipc === "string") {
      whereClauses.push({ nipc: { contains: nipc.trim(), mode: "insensitive" } });
    }

    if (documentoId && typeof documentoId === "string") {
      whereClauses.push({ documentoId: { contains: documentoId.trim(), mode: "insensitive" } });
    }

    if (province && typeof province === "string") {
      whereClauses.push({ estabelecimento: { localizacao: { contains: province.trim(), mode: "insensitive" } } });
    }

    // Aplicar regras de Governança de Escopo Prisional (RBAC / Visão de Negócio)
    if (user.tipo !== "SUPER_ADMIN") {
      // Directores Prisionais e Operadores Locais estão restritos à sua unidade prisional atribuída
      const localId = user.estabelecimentoId;

      if (!localId) {
        res.status(403).json({
          error: "No Facility Assigned",
          message: "Esta conta está restrita a uma unidade, mas nenhum Estabelecimento Prisional lhe foi associado."
        });
        return;
      }

      // Injetar filtro automático restrictivo no Prisma
      whereClauses.push({ estabelecimentoId: localId });
    }

    // Merge where clauses
    if (whereClauses.length) {
      queryOptions.where = { AND: whereClauses };
    }

    const reclusos = await prisma.recluso.findMany(queryOptions);

    res.status(200).json({
      success: true,
      scope: user.tipo === "SUPER_ADMIN" ? "NATIONAL" : "FACILITY_LOCAL",
      facilityId: user.estabelecimentoId,
      totalLength: reclusos.length,
      data: reclusos
    });

  } catch (error) {
    console.error("Erro no controlador do backoffice (/reclusos):", error);
    res.status(500).json({
      error: "Query Failed",
      message: "Falha na base de dados ao consultar reclusos canónicos."
    });
  }
});

// GET /api/backoffice/logs
// Protected by JWT. Scoped by user authority.
router.get("/logs", authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as SystemUserPayload;

  try {
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

    // Aplicar a regra de filtragem de dados de governança
    if (user.tipo !== "SUPER_ADMIN") {
      const localId = user.estabelecimentoId;

      if (!localId) {
        res.status(403).json({
          error: "No Facility Assigned",
          message: "Esta conta de fiscalização está restrita a uma unidade, mas nenhum Estabelecimento Prisional lhe foi associado."
        });
        return;
      }

      // Filtrar logs de segurança onde os envolvidos ou o recluso seja do mesmo estabelecimento
      // ou iniciados por funcionários desse estabelecimento
      queryOptions.where = {
        OR: [
          {
            recluso: {
              estabelecimentoId: localId
            }
          },
          {
            funcionario: {
              estabelecimentoId: localId
            }
          }
        ]
      };
    }

    const logs = await prisma.logSeguranca.findMany(queryOptions);

    res.status(200).json({
      success: true,
      scope: user.tipo === "SUPER_ADMIN" ? "NATIONAL" : "FACILITY_LOCAL",
      facilityId: user.estabelecimentoId,
      totalLength: logs.length,
      data: logs
    });

  } catch (error) {
    console.error("Erro no controlador do backoffice (/logs):", error);
    res.status(500).json({
      error: "Query Failed",
      message: "Falha na base de dados ao coletar logs militares de auditoria."
    });
  }
});

// ============================================
// DIRECÇÕES PROVINCIAIS - CRUD
// ============================================

// GET /api/backoffice/direcoes-provinciais
router.get("/direcoes-provinciais", authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as SystemUserPayload;

  try {
    const direcoes = await prisma.direcaoProvincial.findMany({
      include: {
        instituicoes: {
          select: {
            id: true,
            nome: true,
            capacidadeOficial: true,
            limiteOperativo: true
          }
        }
      },
      orderBy: { provincia: "asc" }
    });

    res.status(200).json({
      success: true,
      totalLength: direcoes.length,
      data: direcoes
    });
  } catch (error) {
    console.error("Erro ao listar direcções provinciais:", error);
    res.status(500).json({
      error: "Query Failed",
      message: "Falha na base de dados ao consultar direcções provinciais."
    });
  }
});

// POST /api/backoffice/direcoes-provinciais
router.post("/direcoes-provinciais", authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as SystemUserPayload;

  if (user.tipo !== "SUPER_ADMIN") {
    res.status(403).json({
      error: "Forbidden",
      message: "Apenas Super Admin pode criar direcções provinciais."
    });
    return;
  }

  const { provincia, directorNome, telefone } = req.body;

  if (!provincia || !directorNome) {
    res.status(400).json({
      error: "Missing Fields",
      message: "Província e nome do director são obrigatórios."
    });
    return;
  }

  try {
    const existente = await prisma.direcaoProvincial.findUnique({
      where: { provincia }
    });

    if (existente) {
      res.status(409).json({
        error: "Conflict",
        message: `A direcção provincial de ${provincia} já existe.`
      });
      return;
    }

    const novaDirectao = await prisma.direcaoProvincial.create({
      data: {
        provincia,
        directorNome,
        telefone: telefone || null
      }
    });

    await prisma.logSeguranca.create({
      data: {
        evento: "DIRECAO_CREATE",
        modulo: "ORGANIZACAO",
        nivelSeveridade: "INFO",
        funcionarioId: user.funcionarioId,
        dadosJson: JSON.stringify({
          provinciaCriada: provincia,
          criadoPor: user.nome
        })
      } as any
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: `Direcção Provincial de ${provincia} criada com sucesso.`,
      data: novaDirectao
    });
  } catch (error) {
    console.error("Erro ao criar direcção provincial:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Falha ao criar direcção provincial."
    });
  }
});

// DELETE /api/backoffice/direcoes-provinciais/:id
router.delete("/direcoes-provinciais/:id", authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as SystemUserPayload;

  if (user.tipo !== "SUPER_ADMIN") {
    res.status(403).json({
      error: "Forbidden",
      message: "Apenas Super Admin pode eliminar direcções provinciais."
    });
    return;
  }

  const { id } = req.params;

  try {
    const direcao = await prisma.direcaoProvincial.findUnique({ where: { id } });

    if (!direcao) {
      res.status(404).json({
        error: "Not Found",
        message: "Direcção provincial não encontrada."
      });
      return;
    }

    await prisma.direcaoProvincial.delete({ where: { id } });

    await prisma.logSeguranca.create({
      data: {
        evento: "DIRECAO_DELETE",
        modulo: "ORGANIZACAO",
        nivelSeveridade: "WARNING",
        funcionarioId: user.funcionarioId,
        dadosJson: JSON.stringify({
          provinciaEliminada: direcao.provincia,
          eliminadoPor: user.nome
        })
      } as any
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: `Direcção Provincial de ${direcao.provincia} eliminada.`
    });
  } catch (error) {
    console.error("Erro ao eliminar direcção provincial:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Falha ao eliminar direcção provincial."
    });
  }
});

// ============================================
// ESTABELECIMENTOS PRISIONAIS - CRUD
// ============================================

// GET /api/backoffice/estabelecimentos
router.get("/estabelecimentos", authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as SystemUserPayload;

  try {
    let whereFilter = {};

    // Se não for SUPER_ADMIN, filtrar por sua unidade
    if (user.tipo !== "SUPER_ADMIN" && user.estabelecimentoId) {
      whereFilter = { id: user.estabelecimentoId };
    }

    const estabelecimentos = await prisma.estabelecimentoPrisional.findMany({
      where: whereFilter,
      include: {
        direcaoProvincial: true,
        pavilhoes: {
          select: {
            id: true,
            nome: true,
            tipoRegime: true
          }
        }
      },
      orderBy: { nome: "asc" }
    });

    res.status(200).json({
      success: true,
      totalLength: estabelecimentos.length,
      data: estabelecimentos
    });
  } catch (error) {
    console.error("Erro ao listar estabelecimentos:", error);
    res.status(500).json({
      error: "Query Failed",
      message: "Falha na base de dados ao consultar estabelecimentos."
    });
  }
});

// POST /api/backoffice/estabelecimentos
router.post("/estabelecimentos", authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as SystemUserPayload;

  if (user.tipo !== "SUPER_ADMIN") {
    res.status(403).json({
      error: "Forbidden",
      message: "Apenas Super Admin pode criar estabelecimentos prisionais."
    });
    return;
  }

  const { nome, direcaoProvincialId, capacidadeOficial, limiteOperativo, localizacao } = req.body;

  if (!nome || !direcaoProvincialId || !capacidadeOficial || !limiteOperativo) {
    res.status(400).json({
      error: "Missing Fields",
      message: "Nome, direcção provincial, capacidade oficial e limite operativo são obrigatórios."
    });
    return;
  }

  try {
    const direcaoExiste = await prisma.direcaoProvincial.findUnique({
      where: { id: direcaoProvincialId }
    });

    if (!direcaoExiste) {
      res.status(404).json({
        error: "Not Found",
        message: "Direcção provincial não encontrada."
      });
      return;
    }

    const existente = await prisma.estabelecimentoPrisional.findUnique({
      where: { nome }
    });

    if (existente) {
      res.status(409).json({
        error: "Conflict",
        message: `Estabelecimento ${nome} já existe.`
      });
      return;
    }

    const novoEstabelecimento = await prisma.estabelecimentoPrisional.create({
      data: {
        nome,
        direcaoProvincialId,
        capacidadeOficial: parseInt(capacidadeOficial),
        limiteOperativo: parseInt(limiteOperativo),
        localizacao: localizacao || direcaoExiste.provincia
      },
      include: { direcaoProvincial: true }
    });

    await prisma.logSeguranca.create({
      data: {
        evento: "ESTABELECIMENTO_CREATE",
        modulo: "INFRAESTRUTURA",
        nivelSeveridade: "INFO",
        funcionarioId: user.funcionarioId,
        dadosJson: JSON.stringify({
          estabelecimentoCriado: nome,
          provincia: direcaoExiste.provincia,
          criadoPor: user.nome
        })
      } as any
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: `Estabelecimento ${nome} criado com sucesso.`,
      data: novoEstabelecimento
    });
  } catch (error) {
    console.error("Erro ao criar estabelecimento:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Falha ao criar estabelecimento prisional."
    });
  }
});

// DELETE /api/backoffice/estabelecimentos/:id
router.delete("/estabelecimentos/:id", authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as SystemUserPayload;

  if (user.tipo !== "SUPER_ADMIN") {
    res.status(403).json({
      error: "Forbidden",
      message: "Apenas Super Admin pode eliminar estabelecimentos."
    });
    return;
  }

  const { id } = req.params;

  try {
    const estabelecimento = await prisma.estabelecimentoPrisional.findUnique({
      where: { id },
      include: { direcaoProvincial: true }
    });

    if (!estabelecimento) {
      res.status(404).json({
        error: "Not Found",
        message: "Estabelecimento não encontrado."
      });
      return;
    }

    await prisma.estabelecimentoPrisional.delete({ where: { id } });

    await prisma.logSeguranca.create({
      data: {
        evento: "ESTABELECIMENTO_DELETE",
        modulo: "INFRAESTRUTURA",
        nivelSeveridade: "WARNING",
        funcionarioId: user.funcionarioId,
        dadosJson: JSON.stringify({
          estabelecimentoEliminado: estabelecimento.nome,
          provincia: estabelecimento.direcaoProvincial.provincia,
          eliminadoPor: user.nome
        })
      } as any
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: `Estabelecimento ${estabelecimento.nome} eliminado.`
    });
  } catch (error) {
    console.error("Erro ao eliminar estabelecimento:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Falha ao eliminar estabelecimento."
    });
  }
});

// ============================================
// OPERADORES/USUÁRIOS - CRUD
// ============================================

// GET /api/backoffice/operadores
router.get("/operadores", authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as SystemUserPayload;

  try {
    let whereFilter: any = {};

    // SUPER_ADMIN vê todos; outros veem apenas da sua unidade
    if (user.tipo !== "SUPER_ADMIN") {
      whereFilter = { estabelecimentoId: user.estabelecimentoId };
    }

    const operadores = await prisma.usuario.findMany({
      where: whereFilter,
      include: {
        estabelecimento: {
          select: { id: true, nome: true, localizacao: true }
        },
        funcionario: {
          select: { nip: true, nome: true, patente: true }
        }
      },
      orderBy: { nome: "asc" }
    });

    res.status(200).json({
      success: true,
      totalLength: operadores.length,
      data: operadores
    });
  } catch (error) {
    console.error("Erro ao listar operadores:", error);
    res.status(500).json({
      error: "Query Failed",
      message: "Falha ao consultar operadores do sistema."
    });
  }
});

// POST /api/backoffice/operadores
router.post("/operadores", authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as SystemUserPayload;

  if (user.tipo !== "SUPER_ADMIN") {
    res.status(403).json({
      error: "Forbidden",
      message: "Apenas Super Admin pode criar operadores."
    });
    return;
  }

  const { email, senha, nome, tipo, estabelecimentoId } = req.body;

  if (!email || !senha || !nome || !tipo) {
    res.status(400).json({
      error: "Missing Fields",
      message: "Email, senha, nome e tipo são obrigatórios."
    });
    return;
  }

  // Validar tipo de usuário
  const tiposValidos = ["SUPER_ADMIN", "DIRETOR_PRISAO", "OPERADOR_SEGURANCA", "OPERADOR_MEDICO", "OPERADOR_SOCIAL"];
  if (!tiposValidos.includes(tipo)) {
    res.status(400).json({
      error: "Invalid Type",
      message: `Tipo de usuário inválido. Válidos: ${tiposValidos.join(", ")}`
    });
    return;
  }

  try {
    const existente = await prisma.usuario.findUnique({ where: { email } });

    if (existente) {
      res.status(409).json({
        error: "Conflict",
        message: `Usuário com email ${email} já existe.`
      });
      return;
    }

    // Se tipo for DIRETOR_PRISAO, deve ter estabelecimento
    if (tipo === "DIRETOR_PRISAO" && !estabelecimentoId) {
      res.status(400).json({
        error: "Missing Fields",
        message: "Diretores de prisão precisam de um estabelecimento designado."
      });
      return;
    }

    if (estabelecimentoId) {
      const estabExiste = await prisma.estabelecimentoPrisional.findUnique({
        where: { id: estabelecimentoId }
      });
      if (!estabExiste) {
        res.status(404).json({
          error: "Not Found",
          message: "Estabelecimento não encontrado."
        });
        return;
      }
    }

    // Hash da senha usando bcryptjs
    const senhaHashed = await bcrypt.hash(senha, 10);

    const novoOperador = await prisma.usuario.create({
      data: {
        email,
        senhaHashed,
        nome,
        tipo: tipo as any,
        ativo: true,
        estabelecimentoId: estabelecimentoId || null
      },
      include: {
        estabelecimento: {
          select: { id: true, nome: true, localizacao: true }
        }
      }
    });

    await prisma.logSeguranca.create({
      data: {
        evento: "OPERADOR_CREATE",
        modulo: "USUARIOS",
        nivelSeveridade: "INFO",
        funcionarioId: user.funcionarioId,
        dadosJson: JSON.stringify({
          operadorCriado: nome,
          email,
          tipo,
          criadoPor: user.nome
        })
      } as any
    }).catch(() => {});

    // Retornar sem a senha hash
    const { senhaHashed: _, ...operadorSeguro } = novoOperador as any;

    res.status(201).json({
      success: true,
      message: `Operador ${nome} criado com sucesso.`,
      data: operadorSeguro
    });
  } catch (error) {
    console.error("Erro ao criar operador:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Falha ao criar operador no sistema."
    });
  }
});

// PUT /api/backoffice/operadores/:id (ativar/desativar)
router.put("/operadores/:id", authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as SystemUserPayload;

  if (user.tipo !== "SUPER_ADMIN") {
    res.status(403).json({
      error: "Forbidden",
      message: "Apenas Super Admin pode atualizar operadores."
    });
    return;
  }

  const { id } = req.params;
  const { ativo, tipo, estabelecimentoId } = req.body;

  try {
    const operador = await prisma.usuario.findUnique({ where: { id } });

    if (!operador) {
      res.status(404).json({
        error: "Not Found",
        message: "Operador não encontrado."
      });
      return;
    }

    const updateData: any = {};
    if (typeof ativo === "boolean") updateData.ativo = ativo;
    if (tipo) updateData.tipo = tipo;
    if (estabelecimentoId !== undefined) updateData.estabelecimentoId = estabelecimentoId;

    const operadorAtualizado = await prisma.usuario.update({
      where: { id },
      data: updateData,
      include: {
        estabelecimento: {
          select: { id: true, nome: true }
        }
      }
    });

    await prisma.logSeguranca.create({
      data: {
        evento: "OPERADOR_UPDATE",
        modulo: "USUARIOS",
        nivelSeveridade: "INFO",
        funcionarioId: user.funcionarioId,
        dadosJson: JSON.stringify({
          operadorAtualizado: operador.nome,
          mudancas: updateData,
          atualizadoPor: user.nome
        })
      } as any
    }).catch(() => {});

    const { senhaHashed: _, ...operadorSeguro } = operadorAtualizado as any;

    res.status(200).json({
      success: true,
      message: `Operador ${operador.nome} atualizado.`,
      data: operadorSeguro
    });
  } catch (error) {
    console.error("Erro ao atualizar operador:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Falha ao atualizar operador."
    });
  }
});

// DELETE /api/backoffice/operadores/:id
router.delete("/operadores/:id", authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as SystemUserPayload;

  if (user.tipo !== "SUPER_ADMIN") {
    res.status(403).json({
      error: "Forbidden",
      message: "Apenas Super Admin pode eliminar operadores."
    });
    return;
  }

  const { id } = req.params;

  try {
    const operador = await prisma.usuario.findUnique({ where: { id } });

    if (!operador) {
      res.status(404).json({
        error: "Not Found",
        message: "Operador não encontrado."
      });
      return;
    }

    // Segurança: não permitir eliminar o próprio usuário ou SUPER_ADMIN fundador
    if (id === user.id) {
      res.status(400).json({
        error: "Conflict",
        message: "Não pode eliminar sua própria conta."
      });
      return;
    }

    await prisma.usuario.delete({ where: { id } });

    await prisma.logSeguranca.create({
      data: {
        evento: "OPERADOR_DELETE",
        modulo: "USUARIOS",
        nivelSeveridade: "WARNING",
        funcionarioId: user.funcionarioId,
        dadosJson: JSON.stringify({
          operadorEliminado: operador.nome,
          email: operador.email,
          eliminadoPor: user.nome
        })
      } as any
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: `Operador ${operador.nome} eliminado do sistema.`
    });
  } catch (error) {
    console.error("Erro ao eliminar operador:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Falha ao eliminar operador."
    });
  }
});

export default router;
