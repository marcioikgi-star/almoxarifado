import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (senha: string, sal: Buffer, tamanho: number, opcoes: object) => Promise<Buffer>;

// Parâmetros do scrypt gravados junto do hash, para poder endurecer no futuro sem invalidar senhas antigas.
const N = 16384;
const R = 8;
const P = 1;
const TAMANHO = 64;

export const SENHA_MINIMA = 8;

export async function gerarHash(senha: string) {
  const sal = randomBytes(16);
  const hash = await scryptAsync(senha.normalize("NFKC"), sal, TAMANHO, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${sal.toString("base64")}$${hash.toString("base64")}`;
}

export async function conferirSenha(senha: string, guardado: string) {
  const [alg, n, r, p, sal, hash] = guardado.split("$");
  if (alg !== "scrypt" || !sal || !hash) return false;
  const esperado = Buffer.from(hash, "base64");
  const calculado = await scryptAsync(senha.normalize("NFKC"), Buffer.from(sal, "base64"), esperado.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  return timingSafeEqual(calculado, esperado);
}

/** Devolve o motivo se a senha for fraca, ou null se for aceitável. */
export function problemaNaSenha(senha: string, email?: string) {
  if (senha.length < SENHA_MINIMA) return `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
  const nomeEmail = email?.split("@")[0].toLowerCase() ?? "";
  // Só vale para nomes de e-mail com 4+ letras; senão bloquearia senhas demais.
  if (nomeEmail.length >= 4 && senha.toLowerCase().includes(nomeEmail)) {
    return "A senha não pode conter o seu e-mail.";
  }
  return null;
}
