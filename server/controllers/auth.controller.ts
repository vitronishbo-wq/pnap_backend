import { Request, Response, Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "PNAP_SECRET_KEY_FOR_SYSTEM_SECURITY_2026";

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ 
      error: "Missing fields", 
      message: "Por favor, preencha o email e password para efetuar login." 
    });
    return;
  }

  try {
    // 1. Procurar o utilizador no banco de dados PNAP
    const user = await prisma.usuario.findUnique({
      where: { email },
      include: {
        funcionario: true,
        estabelecimento: true
      }
    });

    if (!user) {
      res.status(401).json({ 
        error: "Invalid credentials", 
        message: "O email ou palavra-passe introduzidos estão incorretos." 
      });
      return;
    }

    // 2. Verificar se o utilizador está activo no sistema
    if (!user.ativo) {
      res.status(403).json({ 
        error: "User inactive", 
        message: "Esta conta de utilizador para segurança nacional encontra-se suspensa ou inativa." 
      });
      return;
    }

    // 3. Validar a hash da senha
    const isPasswordCorrect = await bcrypt.compare(password, user.senhaHashed);
    if (!isPasswordCorrect) {
      res.status(401).json({ 
        error: "Invalid credentials", 
        message: "O email ou palavra-passe introduzidos estão incorretos." 
      });
      return;
    }

    // 4. Gerar o Token JWT com payloads canónicos completos de governança
    const payload = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      estabelecimentoId: user.estabelecimentoId,
      funcionarioId: user.funcionarioId
    };

    // Assina o token com validade de 8 horas para turnos militares
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

    // Salvar Log de Auditoria do Login com sucesso
    await prisma.logSeguranca.create({
      data: {
        evento: "LOGIN_ADMIN",
        modulo: "SEGURANCA",
        nivelSeveridade: "INFO",
        funcionarioId: user.funcionarioId,
        dadosJson: JSON.stringify({ ip: req.ip, origin: "Backoffice Web Portal" })
      } as any // Usando "as any" caso haja ligeiras divergências com as tabelas pré-existentes
    }).catch(err => {
      console.warn("Falha silenciosa ao guardar log de segurança de login:", err);
    });

    res.status(200).json({
      message: "Autenticação efetuada com sucesso militar.",
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo,
        estabelecimento: user.estabelecimento ? {
          id: user.estabelecimento.id,
          nome: user.estabelecimento.nome,
          localizacao: user.estabelecimento.localizacao
        } : null,
        funcionario: user.funcionario ? {
          nip: user.funcionario.nip,
          patente: user.funcionario.patente
        } : null
      }
    });

  } catch (error) {
    console.error("Erro interno no controlador de autenticação:", error);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: "Ocorreu um erro no servidor ao tentar processar o login institucional." 
    });
  }
});

export default router;
