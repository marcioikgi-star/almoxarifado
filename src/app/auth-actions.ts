"use server";

import { Papel, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  encerrarOutrasSessoes,
  encerrarSessao,
  exigirAdmin,
  exigirUsuario,
  iniciarSessao,
} from "@/lib/auth";
import { conferirSenha, gerarHash, problemaNaSenha } from "@/lib/senha";
import type { EstadoForm } from "./actions";

const MAX_TENTATIVAS = 5;
const BLOQUEIO_MS = 15 * 60 * 1000;
// Hash de uma senha qualquer: compara mesmo quando o e-mail não existe, para o tempo de resposta não revelar isso.
const HASH_FALSO = gerarHash("senha-inexistente");

const campo = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

/** Só aceita caminhos internos, para o parâmetro "volta" não virar redirecionamento para outro site. */
function destinoSeguro(v: string) {
  return v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\") ? v : "/";
}

export async function entrar(_: EstadoForm, f: FormData): Promise<EstadoForm> {
  const email = campo(f, "email").toLowerCase();
  const senha = String(f.get("senha") ?? "");
  const erro = { erro: "E-mail ou senha incorretos." };
  if (!email || !senha) return erro;

  const u = await db.usuario.findUnique({ where: { email } });
  if (!u || !u.ativo) {
    await conferirSenha(senha, await HASH_FALSO);
    return erro;
  }
  if (u.bloqueadoAte && u.bloqueadoAte > new Date()) {
    return { erro: "Muitas tentativas erradas. Tente de novo em alguns minutos." };
  }
  if (!(await conferirSenha(senha, u.senhaHash))) {
    const tentativas = u.tentativasFalhas + 1;
    await db.usuario.update({
      where: { id: u.id },
      data:
        tentativas >= MAX_TENTATIVAS
          ? { tentativasFalhas: 0, bloqueadoAte: new Date(Date.now() + BLOQUEIO_MS) }
          : { tentativasFalhas: tentativas },
    });
    return erro;
  }

  await db.usuario.update({ where: { id: u.id }, data: { tentativasFalhas: 0, bloqueadoAte: null } });
  await iniciarSessao(u.id);
  // O layout (cabeçalho e menu) depende do usuário logado.
  revalidatePath("/", "layout");
  redirect(u.trocarSenha ? "/conta/senha" : destinoSeguro(campo(f, "volta")));
}

export async function sair() {
  await encerrarSessao();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function trocarSenha(_: EstadoForm, f: FormData): Promise<EstadoForm> {
  const u = await exigirUsuario({ permitirSenhaProvisoria: true });
  const atual = String(f.get("atual") ?? "");
  const nova = String(f.get("nova") ?? "");
  const confirmacao = String(f.get("confirmacao") ?? "");

  if (!(await conferirSenha(atual, u.senhaHash))) return { erro: "A senha atual está incorreta." };
  if (nova !== confirmacao) return { erro: "A confirmação não é igual à nova senha." };
  if (nova === atual) return { erro: "A nova senha precisa ser diferente da atual." };
  const problema = problemaNaSenha(nova, u.email);
  if (problema) return { erro: problema };

  await db.usuario.update({ where: { id: u.id }, data: { senhaHash: await gerarHash(nova), trocarSenha: false } });
  await encerrarOutrasSessoes(u.id);
  revalidatePath("/", "layout");
  redirect("/?senha=ok");
}

export async function criarUsuario(_: EstadoForm, f: FormData): Promise<EstadoForm> {
  await exigirAdmin();
  const email = campo(f, "email").toLowerCase();
  const nome = campo(f, "nome");
  const senha = String(f.get("senha") ?? "");
  const papel = campo(f, "papel") === "ADMIN" ? Papel.ADMIN : Papel.ALMOXARIFE;
  if (!nome || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { erro: "Informe nome e um e-mail válido." };
  const problema = problemaNaSenha(senha, email);
  if (problema) return { erro: problema };
  try {
    await db.usuario.create({
      data: { email, nome, papel, senhaHash: await gerarHash(senha), trocarSenha: true },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { erro: "Já existe um usuário com esse e-mail." };
    }
    throw e;
  }
  revalidatePath("/usuarios");
  return { ok: `${nome} cadastrado. No primeiro acesso, o sistema vai pedir para trocar a senha.` };
}

export async function redefinirSenha(usuarioId: string, _: EstadoForm, f: FormData): Promise<EstadoForm> {
  await exigirAdmin();
  const senha = String(f.get("senha") ?? "");
  const alvo = await db.usuario.findUnique({ where: { id: usuarioId } });
  if (!alvo) return { erro: "Usuário não encontrado." };
  const problema = problemaNaSenha(senha, alvo.email);
  if (problema) return { erro: problema };
  await db.$transaction([
    db.usuario.update({
      where: { id: usuarioId },
      data: { senhaHash: await gerarHash(senha), trocarSenha: true, tentativasFalhas: 0, bloqueadoAte: null },
    }),
    db.sessao.deleteMany({ where: { usuarioId } }),
  ]);
  revalidatePath("/usuarios");
  return { ok: `Senha provisória definida para ${alvo.nome}.` };
}

export async function alternarUsuario(usuarioId: string, ativo: boolean) {
  const admin = await exigirAdmin();
  if (usuarioId === admin.id) return;
  await db.$transaction([
    db.usuario.update({ where: { id: usuarioId }, data: { ativo } }),
    ...(ativo ? [] : [db.sessao.deleteMany({ where: { usuarioId } })]),
  ]);
  revalidatePath("/usuarios");
}
