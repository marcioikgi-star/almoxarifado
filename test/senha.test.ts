import { test } from "node:test";
import assert from "node:assert/strict";
import { conferirSenha, gerarHash, problemaNaSenha } from "../src/lib/senha";

test("hash confere com a senha certa e recusa a errada", async () => {
  const h = await gerarHash("Uma senha boa 123");
  assert.ok(h.startsWith("scrypt$"));
  assert.equal(await conferirSenha("Uma senha boa 123", h), true);
  assert.equal(await conferirSenha("uma senha boa 123", h), false);
});

test("mesma senha gera hashes diferentes (sal aleatório)", async () => {
  assert.notEqual(await gerarHash("abcdefgh1"), await gerarHash("abcdefgh1"));
});

test("hash em formato desconhecido não confere", async () => {
  assert.equal(await conferirSenha("qualquer", "texto-puro"), false);
});

test("regras de senha", () => {
  assert.match(problemaNaSenha("curta") ?? "", /8 caracteres/);
  assert.match(problemaNaSenha("joao12345", "joao@x.com") ?? "", /e-mail/);
  assert.equal(problemaNaSenha("pedra-ana-42", "ana@x.com"), null);
  assert.equal(problemaNaSenha("pedra-azul-42", "joao@x.com"), null);
});
