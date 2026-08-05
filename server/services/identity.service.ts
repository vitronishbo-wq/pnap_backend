import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbService } from "../db-service.ts";

const JWT_SECRET = process.env.JWT_SECRET || "altere_para_um_segredo_jwt_unico";

export class IdentityService {
  /**
   * Validates user credentials and returns a JWT token with session info.
   */
  static async authenticateUser(email: string, passwordUnencrypted: string) {
    if (!email || !passwordUnencrypted) {
      throw new Error("Credenciais incompletas: Email e senha são obrigatórios.");
    }

    const user = await dbService.findUsuarioByEmail(email);
    if (!user) {
      throw new Error("Autenticação falhou: Utilizador não encontrado.");
    }

    if (!user.ativo) {
      throw new Error("Acesso suspenso: Conta inativa no sistema central do MININT.");
    }

    const passwordMatches = bcrypt.compareSync(passwordUnencrypted, user.senhaHashed);
    if (!passwordMatches) {
      throw new Error("Autenticação falhou: Senha incorreta.");
    }

    // Sign complete payload with role and rank (patente)
    const payload = {
      id: user.id,
      email: user.email,
      nome: user.nome,
      tipo: user.tipo,
      estabelecimentoId: user.estabelecimentoId,
      funcionarioId: user.funcionario?.nip || null,
      patente: user.funcionario?.patente || "Operador"
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "12h" });

    return {
      token,
      user: payload
    };
  }

  /**
   * Verify and decode a JWT session token.
   */
  static verifySessionToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      throw new Error("Sessão inválida ou expirada. Efetue login novamente.");
    }
  }
}
