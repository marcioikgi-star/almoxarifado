import { test } from "node:test";
import assert from "node:assert/strict";
import { Prisma } from "@prisma/client";
import { calcular, ErroEstoque } from "../src/lib/calculo";
import { lerNumero } from "../src/lib/formato";

const d = (v: number | string) => new Prisma.Decimal(v);
const vazio = { saldo: d(0), custoMedio: d(0) };

test("entrada em estoque vazio usa o custo da compra", () => {
  const r = calcular(vazio, { tipo: "ENTRADA", quantidade: d(10), custoUnitario: d(5) });
  assert.equal(r.saldo.toString(), "10");
  assert.equal(r.custoMedio.toString(), "5");
});

test("entrada recalcula custo médio ponderado", () => {
  const r = calcular({ saldo: d(10), custoMedio: d(5) }, { tipo: "ENTRADA", quantidade: d(30), custoUnitario: d(9) });
  assert.equal(r.saldo.toString(), "40");
  assert.equal(r.custoMedio.toString(), "8");
});

test("entrada sem custo mantém custo médio", () => {
  const r = calcular({ saldo: d(10), custoMedio: d(5) }, { tipo: "ENTRADA", quantidade: d(2) });
  assert.equal(r.custoMedio.toString(), "5");
});

test("saída baixa saldo pelo custo médio e registra delta negativo", () => {
  const r = calcular({ saldo: d(10), custoMedio: d(5) }, { tipo: "SAIDA", quantidade: d(4) });
  assert.equal(r.saldo.toString(), "6");
  assert.equal(r.delta.toString(), "-4");
  assert.equal(r.custoUnitario.toString(), "5");
});

test("saída maior que o saldo é recusada", () => {
  assert.throws(() => calcular({ saldo: d(3), custoMedio: d(5) }, { tipo: "SAIDA", quantidade: d(4) }), ErroEstoque);
});

test("quantidade zero é recusada", () => {
  assert.throws(() => calcular(vazio, { tipo: "ENTRADA", quantidade: d(0) }), ErroEstoque);
});

test("ajuste define o saldo pela contagem", () => {
  const r = calcular({ saldo: d(10), custoMedio: d(5) }, { tipo: "AJUSTE", quantidade: d(7) });
  assert.equal(r.saldo.toString(), "7");
  assert.equal(r.delta.toString(), "-3");
  assert.equal(r.custoMedio.toString(), "5");
});

test("devolução volta ao estoque pelo custo médio", () => {
  const r = calcular({ saldo: d(10), custoMedio: d(5) }, { tipo: "DEVOLUCAO", quantidade: d(2), custoUnitario: d(99) });
  assert.equal(r.saldo.toString(), "12");
  assert.equal(r.custoMedio.toString(), "5");
});

test("lerNumero aceita formato brasileiro", () => {
  assert.equal(lerNumero("1.234,5"), "1234.5");
  assert.equal(lerNumero("12.5"), "12.5");
  assert.equal(lerNumero("abc"), null);
  assert.equal(lerNumero(""), null);
});
