import { Prisma, TipoMovimentacao } from "@prisma/client";
import { db } from "./db";
import { calcular } from "./calculo";

export type NovaMovimentacao = {
  itemId: string;
  tipo: TipoMovimentacao;
  quantidade: Prisma.Decimal;
  custoUnitario?: Prisma.Decimal | null;
  fornecedorId?: string | null;
  projetoId?: string | null;
  documento?: string | null;
  responsavel?: string | null;
  observacao?: string | null;
};

/** Grava a movimentação e atualiza saldo e custo médio do item na mesma transação. */
export async function registrarMovimentacao(m: NovaMovimentacao) {
  return db.$transaction(async (tx) => {
    // Trava a linha do item para que duas movimentações simultâneas não se sobreponham.
    const [item] = await tx.$queryRaw<{ saldo: Prisma.Decimal; custoMedio: Prisma.Decimal }[]>`
      SELECT "saldo", "custoMedio" FROM "Item" WHERE "id" = ${m.itemId} FOR UPDATE`;
    if (!item) throw new Error("Item não encontrado.");

    const r = calcular(
      { saldo: new Prisma.Decimal(item.saldo), custoMedio: new Prisma.Decimal(item.custoMedio) },
      { tipo: m.tipo, quantidade: m.quantidade, custoUnitario: m.custoUnitario },
    );

    await tx.item.update({
      where: { id: m.itemId },
      data: { saldo: r.saldo, custoMedio: r.custoMedio },
    });

    return tx.movimentacao.create({
      data: {
        itemId: m.itemId,
        tipo: m.tipo,
        quantidade: r.delta,
        custoUnitario: r.custoUnitario,
        saldoApos: r.saldo,
        fornecedorId: m.fornecedorId || null,
        projetoId: m.projetoId || null,
        documento: m.documento || null,
        responsavel: m.responsavel || null,
        observacao: m.observacao || null,
      },
    });
  });
}
