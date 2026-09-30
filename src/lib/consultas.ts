import type { Prisma } from "@prisma/client";
import { db } from "./db";

export function filtroBusca(q?: string | null): Prisma.ItemWhereInput {
  const termo = q?.trim();
  if (!termo) return { ativo: true };
  // Cada palavra precisa aparecer em algum campo: "cabo 2,5" acha "Cabo flexível 2,5 mm²".
  return {
    ativo: true,
    AND: termo.split(/\s+/).map((p) => ({
      OR: (["codigo", "descricao", "codigoBarras", "fabricante", "referencia", "categoria", "localizacao"] as const).map(
        (campo) => ({ [campo]: { contains: p, mode: "insensitive" } }),
      ),
    })),
  };
}

export function buscarItens(q?: string | null, take = 50) {
  return db.item.findMany({ where: filtroBusca(q), orderBy: { descricao: "asc" }, take });
}

export function itensAbaixoDoMinimo(take?: number) {
  return db.item.findMany({
    where: { ativo: true, estoqueMinimo: { gt: 0 }, saldo: { lte: db.item.fields.estoqueMinimo } },
    orderBy: { descricao: "asc" },
    take,
  });
}

/** Unidades ativas, mais a que o item já usa (mesmo se tiver sido desativada). */
export function listarUnidadesAtivas(incluirSigla?: string) {
  return db.unidadeMedida.findMany({
    where: incluirSigla ? { OR: [{ ativo: true }, { sigla: incluirSigla }] } : { ativo: true },
    orderBy: { criadoEm: "asc" },
  });
}
