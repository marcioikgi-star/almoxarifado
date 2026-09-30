import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { fmtBRL, fmtData, fmtQtd, nomeTipo } from "@/lib/formato";
import { qrSvg, urlEtiqueta } from "@/lib/qr";
import { BotaoLink, Cartao, Titulo } from "@/components/ui";

const avisos: Record<string, string> = {
  ENTRADA: "Entrada registrada.",
  SAIDA: "Saída registrada.",
  AJUSTE: "Ajuste de inventário registrado.",
  DEVOLUCAO: "Devolução registrada.",
};

export default async function DetalheItem({ params, searchParams }: PageProps<"/itens/[id]">) {
  const { id } = await params;
  const { ok } = await searchParams;
  const item = await db.item.findUnique({
    where: { id },
    include: {
      movimentacoes: { orderBy: { criadoEm: "desc" }, take: 30, include: { projeto: true, fornecedor: true } },
    },
  });
  if (!item) notFound();

  const qr = await qrSvg(await urlEtiqueta(item.codigo));
  const baixo = Number(item.estoqueMinimo) > 0 && Number(item.saldo) <= Number(item.estoqueMinimo);
  const detalhes = [
    ["Código", item.codigo],
    ["Categoria", item.categoria],
    ["Localização", item.localizacao],
    ["Fabricante", item.fabricante],
    ["Referência", item.referencia],
    ["Código de barras", item.codigoBarras],
    ["Estoque mínimo", `${fmtQtd(item.estoqueMinimo)} ${item.unidade}`],
  ].filter(([, v]) => v);

  return (
    <div className="space-y-4">
      <Titulo voltar="/itens">{item.descricao}</Titulo>
      {typeof ok === "string" && avisos[ok] && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          {avisos[ok]}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Cartao className={baixo ? "border-red-300 bg-red-50" : ""}>
          <p className="text-sm text-slate-500">Saldo</p>
          <p className="text-2xl font-bold">
            {fmtQtd(item.saldo)} <span className="text-base font-normal">{item.unidade}</span>
          </p>
          {baixo && <p className="text-xs text-red-700">abaixo do mínimo</p>}
        </Cartao>
        <Cartao>
          <p className="text-sm text-slate-500">Custo médio</p>
          <p className="text-2xl font-bold">{fmtBRL(item.custoMedio)}</p>
          <p className="text-xs text-slate-500">total {fmtBRL(Number(item.saldo) * Number(item.custoMedio))}</p>
        </Cartao>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <BotaoLink href={`/movimentar?tipo=ENTRADA&item=${item.id}`} cor="verde">
          + Entrada
        </BotaoLink>
        <BotaoLink href={`/movimentar?tipo=SAIDA&item=${item.id}`} cor="laranja">
          − Saída
        </BotaoLink>
        <BotaoLink href={`/movimentar?tipo=DEVOLUCAO&item=${item.id}`} cor="claro">
          Devolução
        </BotaoLink>
        <BotaoLink href={`/movimentar?tipo=AJUSTE&item=${item.id}`} cor="claro">
          Ajustar contagem
        </BotaoLink>
      </div>

      <Cartao>
        <div className="flex gap-4">
          <dl className="min-w-0 flex-1 space-y-1 text-sm">
            {detalhes.map(([k, v]) => (
              <div key={k}>
                <dt className="inline text-slate-500">{k}: </dt>
                <dd className="inline">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="w-24 shrink-0" dangerouslySetInnerHTML={{ __html: qr }} />
        </div>
        <div className="mt-3 flex gap-4 text-sm">
          <Link href={`/itens/${item.id}/editar`} className="underline">
            Editar item
          </Link>
          <Link href={`/etiquetas?item=${item.id}`} className="underline">
            Imprimir etiqueta
          </Link>
        </div>
      </Cartao>

      <section>
        <h2 className="mb-2 font-semibold">Movimentações</h2>
        {item.movimentacoes.length ? (
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white text-sm">
            {item.movimentacoes.map((m) => (
              <li key={m.id} className="px-4 py-3">
                <div className="flex justify-between gap-3">
                  <span className="font-medium">{nomeTipo[m.tipo]}</span>
                  <span className={Number(m.quantidade) < 0 ? "text-orange-700" : "text-emerald-700"}>
                    {Number(m.quantidade) > 0 ? "+" : ""}
                    {fmtQtd(m.quantidade)} · saldo {fmtQtd(m.saldoApos)}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {fmtData(m.criadoEm)} · {fmtBRL(m.custoUnitario)}/{item.unidade}
                  {m.projeto ? ` · ${m.projeto.nome}` : ""}
                  {m.fornecedor ? ` · ${m.fornecedor.nome}` : ""}
                  {m.documento ? ` · doc. ${m.documento}` : ""}
                  {m.responsavel ? ` · ${m.responsavel}` : ""}
                </p>
                {m.observacao && <p className="text-xs text-slate-600">{m.observacao}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Sem movimentações.</p>
        )}
      </section>
    </div>
  );
}
