import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "altere_para_um_segredo_jwt_unico";

export interface SystemUserPayload {
  id: string;
  nome: string;
  email: string;
  tipo: "SUPER_ADMIN" | "DIRETOR_PRISAO" | "OPERADOR_SEGURANCA" | "OPERADOR_MEDICO" | "OPERADOR_SOCIAL";
  estabelecimentoId: string | null;
  funcionarioId: string | null;
}

// Middleware to authenticate JWT and attach the payload to Request
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ 
      error: "Authorization header is missing", 
      message: "Por favor, forneça um cabeçalho de Autorização Bearer Token." 
    });
    return;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    res.status(401).json({ 
      error: "Invalid token format", 
      message: "O formato do Bearer token é inválido. Use 'Bearer <token>'." 
    });
    return;
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SystemUserPayload;
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ 
      error: "Invalid or expired token", 
      message: "O token fornecido é inválido ou expirou. Por favor faça login novamente." 
    });
  }
}

// Middleware to authorize specific user types (Roles)
export function authorizeRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user as SystemUserPayload | undefined;

    if (!user) {
      res.status(401).json({ 
        error: "Unauthenticated", 
        message: "Utilizador não autenticado no sistema corporativo." 
      });
      return;
    }

    if (!allowedRoles.includes(user.tipo)) {
      res.status(403).json({ 
        error: "Forbidden Access", 
        message: `Acesso negado. A sua função (${user.tipo}) não possui permissões suficientes para esta rota.` 
      });
      return;
    }

    next();
  };
}
