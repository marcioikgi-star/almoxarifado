import { exigirUsuario } from "@/lib/auth";
import Link from "next/link";
import { db } from "@/lib/db";
import { itensAbaixoDoMinimo } from "@/lib/consultas";
import { fmtBRL, fmtData, fmtQtd, nomeTipo } from "@/lib/formato";
import { BotaoLink, Cartao } from "@/components/ui";
import { LinhaItem } from "@/components/LinhaItem";

export default async function Inicio({ searchParams }: PageProps<"/">) {
  await exigirUsuario();
  const { senha } = await searchParams;
  const [baixos, ultimas, totais] = await Promise.all([
    itensAbaixoDoMinimo(5),
    db.movimentacao.findMany({ orderBy: { criadoEm: "desc" }, take: 5, include: { item: true, projeto: true } }),
    db.$queryRaw<{ itens: bigint; valor: string | null }[]>`
      SELECT COUNT(*) AS itens, SUM("saldo" * "custoMedio")::text AS valor FROM "Item" WHERE "ativo"`,
  ]);

  return (
    <div className="space-y-6">
      {senha === "ok" && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          Senha alterada.
        </p>
      )}
      <form action="/itens" className="flex gap-2">
        <input
          name="q"
          type="search"
          placeholder="Buscar item por nome ou código"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-base"
        />
        <button className="rounded-xl bg-slate-900 px-4 font-semibold text-white">Buscar</button>
      </form>

      <div className="grid grid-cols-2 gap-3">
        <BotaoLink href="/movimentar?tipo=ENTRADA" cor="verde">
          + Entrada
        </BotaoLink>
        <BotaoLink href="/movimentar?tipo=SAIDA" cor="laranja">
          − Saída
        </BotaoLink>
        <BotaoLink href="/escanear" cor="escuro">
          Escanear QR
        </BotaoLink>
        <BotaoLink href="/itens/novo" cor="claro">
          Novo item
        </BotaoLink>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Cartao>
          <p className="text-sm text-slate-500">Itens cadastrados</p>
          <p className="text-2xl font-bold">{Number(totais[0]?.itens ?? 0)}</p>
        </Cartao>
        <Cartao>
          <p className="text-sm text-slate-500">Valor em estoque</p>
          <p className="text-xl font-bold sm:text-2xl">{fmtBRL(totais[0]?.valor ?? 0)}</p>
        </Cartao>
      </div>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-semibold">Abaixo do estoque mínimo</h2>
          <Link href="/itens?baixo=1" className="text-sm text-slate-600 underline">
            ver todos
          </Link>
        </div>
        {baixos.length ? (
          <div className="space-y-2">
            {baixos.map((i) => (
              <LinhaItem key={i.id} item={i} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Nenhum item abaixo do mínimo.</p>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-semibold">Últimas movimentações</h2>
          <Link href="/historico" className="text-sm text-slate-600 underline">
            ver histórico
          </Link>
        </div>
        {ultimas.length ? (
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
            {ultimas.map((m) => (
              <li key={m.id} className="flex justify-between gap-3 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{m.item.descricao}</p>
                  <p className="text-xs text-slate-500">
                    {nomeTipo[m.tipo]} · {fmtData(m.criadoEm)}
                    {m.projeto ? ` · ${m.projeto.nome}` : ""}
                  </p>
                </div>
                <span className={`shrink-0 whitespace-nowrap ${Number(m.quantidade) < 0 ? "text-orange-700" : "text-emerald-700"}`}>
                  {Number(m.quantidade) > 0 ? "+" : ""}
                  {fmtQtd(m.quantidade)} {m.item.unidade}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Nenhuma movimentação ainda.</p>
        )}
      </section>
    </div>
  );
}
