import Link from "next/link";
import { connection } from "next/server";
import type { Prisma, TipoMovimentacao } from "@prisma/client";
import { db } from "@/lib/db";
import { fmtBRL, fmtData, fmtQtd, nomeTipo } from "@/lib/formato";
import { Cartao, Selecao, Titulo, Vazio } from "@/components/ui";

export default async function Historico({ searchParams }: PageProps<"/historico">) {
  await connection();
  const sp = await searchParams;
  const projetoId = typeof sp.projeto === "string" && sp.projeto ? sp.projeto : null;
  const tipo = typeof sp.tipo === "string" && sp.tipo in nomeTipo ? (sp.tipo as keyof typeof nomeTipo) : null;

  const where: Prisma.MovimentacaoWhereInput = {
    ...(projetoId ? { projetoId } : {}),
    ...(tipo ? { tipo: tipo as TipoMovimentacao } : {}),
  };
  const [projetos, movs] = await Promise.all([
    db.projeto.findMany({ orderBy: { nome: "asc" } }),
    db.movimentacao.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      take: 200,
      include: { item: true, projeto: true, fornecedor: true },
    }),
  ]);

  // Custo de material consumido pelo projeto: saídas menos devoluções, pelo custo registrado em cada movimentação.
  const custoProjeto = projetoId
    ? movs
        .filter((m) => m.tipo === "SAIDA" || m.tipo === "DEVOLUCAO")
        .reduce((s, m) => s - Number(m.quantidade) * Number(m.custoUnitario), 0)
    : null;

  return (
    <div>
      <Titulo>Histórico</Titulo>
      <form className="mb-4 grid grid-cols-2 gap-3">
        <Selecao rotulo="Projeto" name="projeto" defaultValue={projetoId ?? ""}>
          <option value="">Todos</option>
          {projetos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </Selecao>
        <Selecao rotulo="Tipo" name="tipo" defaultValue={tipo ?? ""}>
          <option value="">Todos</option>
          {Object.entries(nomeTipo).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Selecao>
        <button className="col-span-2 rounded-xl bg-slate-900 py-3 font-semibold text-white">Filtrar</button>
      </form>

      {custoProjeto != null && (
        <Cartao className="mb-4">
          <p className="text-sm text-slate-500">Material consumido pelo projeto</p>
          <p className="text-2xl font-bold">{fmtBRL(custoProjeto)}</p>
          {movs.length === 200 && <p className="text-xs text-slate-500">Considerando as 200 movimentações mais recentes.</p>}
        </Cartao>
      )}

      {movs.length ? (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white text-sm">
          {movs.map((m) => (
            <li key={m.id} className="px-4 py-3">
              <div className="flex justify-between gap-3">
                <Link href={`/itens/${m.itemId}`} className="min-w-0 truncate font-medium">
                  {m.item.descricao}
                </Link>
                <span className={`shrink-0 whitespace-nowrap ${Number(m.quantidade) < 0 ? "text-orange-700" : "text-emerald-700"}`}>
                  {Number(m.quantidade) > 0 ? "+" : ""}
                  {fmtQtd(m.quantidade)} {m.item.unidade}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {nomeTipo[m.tipo]} · {fmtData(m.criadoEm)} · {fmtBRL(m.custoUnitario)}/{m.item.unidade}
                {m.projeto ? ` · ${m.projeto.nome}` : ""}
                {m.fornecedor ? ` · ${m.fornecedor.nome}` : ""}
                {m.responsavel ? ` · ${m.responsavel}` : ""}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <Vazio>Nenhuma movimentação encontrada.</Vazio>
      )}
    </div>
  );
}
