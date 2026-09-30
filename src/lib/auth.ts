import { createHash, randomBytes } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Usuario } from "@prisma/client";
import { db } from "./db";

export const COOKIE_SESSAO = "almox_sessao";
const DURACAO_MS = 30 * 24 * 60 * 60 * 1000;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function iniciarSessao(usuarioId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiraEm = new Date(Date.now() + DURACAO_MS);
  await db.sessao.create({ data: { id: hashToken(token), usuarioId, expiraEm } });
  (await cookies()).set(COOKIE_SESSAO, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_INSEGURO !== "1",
    sameSite: "lax",
    path: "/",
    expires: expiraEm,
  });
}

export async function encerrarSessao() {
  const jar = await cookies();
  const token = jar.get(COOKIE_SESSAO)?.value;
  if (token) await db.sessao.deleteMany({ where: { id: hashToken(token) } });
  jar.delete(COOKIE_SESSAO);
}

/** Encerra as outras sessões do usuário (usado ao trocar a senha). */
export async function encerrarOutrasSessoes(usuarioId: string) {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  await db.sessao.deleteMany({
    where: { usuarioId, ...(token ? { NOT: { id: hashToken(token) } } : {}) },
  });
}

/** Usuário da sessão atual, ou null. Uma consulta por requisição. */
export const usuarioAtual = cache(async (): Promise<Usuario | null> => {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  if (!token) return null;
  const sessao = await db.sessao.findUnique({ where: { id: hashToken(token) }, include: { usuario: true } });
  if (!sessao || sessao.expiraEm < new Date() || !sessao.usuario.ativo) return null;
  return sessao.usuario;
});

/**
 * Exige usuário logado em páginas e ações. Quem ainda está com senha provisória
 * só pode usar a tela de troca de senha.
 */
export async function exigirUsuario(opcoes?: { permitirSenhaProvisoria?: boolean }) {
  const u = await usuarioAtual();
  if (!u) redirect("/login");
  if (u.trocarSenha && !opcoes?.permitirSenhaProvisoria) redirect("/conta/senha");
  return u;
}

export async function exigirAdmin() {
  const u = await exigirUsuario();
  if (u.papel !== "ADMIN") redirect("/");
  return u;
}
