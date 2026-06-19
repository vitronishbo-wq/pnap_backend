import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateJWT, SystemUserPayload } from "../middleware/rbac.middleware";

const prisma = new PrismaClient();
const router = Router();

// GET /api/backoffice/reclusos
// Protected by JWT. Scoped by user authority.
router.get("/reclusos", authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  const user = (req as any).user as SystemUserPayload;

  try {
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
      queryOptions.where = {
        estabelecimentoId: localId
      };
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

export default router;
