import { Prisma, TipoMovimentacao } from "@prisma/client";

const D = Prisma.Decimal;
type Dec = Prisma.Decimal;

export class ErroEstoque extends Error {}

export type Estado = { saldo: Dec; custoMedio: Dec };

export type Pedido = {
  tipo: TipoMovimentacao;
  /** Quantidade movimentada; em AJUSTE é o saldo contado no inventário. */
  quantidade: Dec;
  /** Custo unitário da compra; usado só em ENTRADA. */
  custoUnitario?: Dec | null;
};

export type Resultado = {
  delta: Dec;
  custoUnitario: Dec;
  saldo: Dec;
  custoMedio: Dec;
};

/**
 * Regras de saldo e custo médio ponderado.
 * - ENTRADA: soma ao saldo e recalcula o custo médio com o custo da compra.
 * - DEVOLUCAO: volta material ao estoque pelo custo médio atual.
 * - SAIDA: subtrai do saldo pelo custo médio atual; não deixa o saldo negativo.
 * - AJUSTE: define o saldo igual à contagem física; custo médio não muda.
 */
export function calcular(atual: Estado, pedido: Pedido): Resultado {
  const q = pedido.quantidade;
  if (pedido.tipo === "AJUSTE") {
    if (q.isNegative()) throw new ErroEstoque("A contagem não pode ser negativa.");
    return {
      delta: q.minus(atual.saldo),
      custoUnitario: atual.custoMedio,
      saldo: q,
      custoMedio: atual.custoMedio,
    };
  }

  if (!q.greaterThan(0)) throw new ErroEstoque("A quantidade deve ser maior que zero.");

  if (pedido.tipo === "SAIDA") {
    if (q.greaterThan(atual.saldo)) {
      throw new ErroEstoque(`Saldo insuficiente: há ${atual.saldo.toString()} em estoque.`);
    }
    return {
      delta: q.negated(),
      custoUnitario: atual.custoMedio,
      saldo: atual.saldo.minus(q),
      custoMedio: atual.custoMedio,
    };
  }

  const custo =
    pedido.tipo === "ENTRADA" && pedido.custoUnitario != null ? pedido.custoUnitario : atual.custoMedio;
  if (custo.isNegative()) throw new ErroEstoque("O custo não pode ser negativo.");

  const novoSaldo = atual.saldo.plus(q);
  // Saldo anterior negativo ou zero não deve pesar no custo médio.
  const saldoBase = D.max(atual.saldo, 0);
  const custoMedio = saldoBase.times(atual.custoMedio).plus(q.times(custo)).dividedBy(saldoBase.plus(q));

  return {
    delta: q,
    custoUnitario: custo,
    saldo: novoSaldo,
    custoMedio: custoMedio.toDecimalPlaces(4),
  };
}
