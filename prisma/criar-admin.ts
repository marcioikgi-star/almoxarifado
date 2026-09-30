// Cria (ou redefine) um administrador a partir de variáveis de ambiente, para a senha não ficar no código:
//   ADMIN_EMAIL=... ADMIN_NOME=... ADMIN_SENHA=... npm run criar-admin
// A senha é gravada só como hash e precisa ser trocada no primeiro acesso.
//
// Com --inicial (usado na publicação na Vercel) só cria o administrador se o banco ainda não tem
// nenhum usuário; nas publicações seguintes não faz nada, então não desfaz a senha já trocada.
import { PrismaClient } from "@prisma/client";
import { gerarHash, problemaNaSenha } from "../src/lib/senha";

const db = new PrismaClient();

const inicial = process.argv.includes("--inicial");

async function main() {
  if (inicial && (await db.usuario.count())) {
    console.log("Já existem usuários; administrador inicial não é necessário.");
    return;
  }
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const senha = process.env.ADMIN_SENHA;
  const nome = process.env.ADMIN_NOME?.trim() || email?.split("@")[0] || "";
  if (!email || !senha) {
    console.error("Defina ADMIN_EMAIL e ADMIN_SENHA (e opcionalmente ADMIN_NOME).");
    // Na publicação, falha para ninguém ficar com um sistema no ar sem ter como entrar.
    process.exit(1);
  }
  const problema = problemaNaSenha(senha, email);
  if (problema) {
    console.error(problema);
    process.exit(1);
  }
  const dados = { senhaHash: await gerarHash(senha), papel: "ADMIN" as const, trocarSenha: true, ativo: true, tentativasFalhas: 0, bloqueadoAte: null };
  const u = await db.usuario.upsert({ where: { email }, create: { email, nome, ...dados }, update: dados });
  await db.sessao.deleteMany({ where: { usuarioId: u.id } });
  console.log(`Administrador ${u.email} pronto. A senha deve ser trocada no primeiro acesso.`);
}

main().finally(() => db.$disconnect());
