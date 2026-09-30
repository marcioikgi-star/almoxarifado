import { test } from "node:test";
import assert from "node:assert/strict";
import { agruparUnidades, normalizarSigla } from "../src/lib/unidades";

test("normalizarSigla padroniza maiúsculas e expoentes", () => {
  assert.equal(normalizarSigla(" m² "), "M2");
  assert.equal(normalizarSigla("m³"), "M3");
  assert.equal(normalizarSigla("kg"), "KG");
  assert.equal(normalizarSigla("saco  50kg"), "SACO 50KG");
});

test("agruparUnidades segue a ordem dos grupos e mantém a ordem dentro do grupo", () => {
  const r = agruparUnidades([
    { sigla: "M", grupo: "Comprimento" },
    { sigla: "X", grupo: "Personalizado" },
    { sigla: "UN", grupo: "Contagem" },
    { sigla: "CM", grupo: "Comprimento" },
  ]);
  assert.deepEqual(
    r.map(([g, us]) => [g, us.map((u) => u.sigla)]),
    [
      ["Contagem", ["UN"]],
      ["Comprimento", ["M", "CM"]],
      ["Personalizado", ["X"]],
    ],
  );
});
