import { connection } from "next/server";
import { db } from "@/lib/db";
import { filtroBusca } from "@/lib/consultas";
import { qrSvg, urlEtiqueta } from "@/lib/qr";
import { Titulo, Vazio } from "@/components/ui";
import { BotaoImprimir } from "./BotaoImprimir";

export default async function Etiquetas({ searchParams }: PageProps<"/etiquetas">) {
  await connection();
  const sp = await searchParams;
  const itemId = typeof sp.item === "string" ? sp.item : null;
  const q = typeof sp.q === "string" ? sp.q : "";
  const itens = await db.item.findMany({
    where: itemId ? { id: itemId } : filtroBusca(q),
    orderBy: { codigo: "asc" },
    take: 120,
  });
  const etiquetas = await Promise.all(
    itens.map(async (i) => ({ item: i, svg: await qrSvg(await urlEtiqueta(i.codigo)) })),
  );

  return (
    <div>
      <div className="print:hidden">
        <Titulo voltar="/itens">Etiquetas QR</Titulo>
        {!itemId && (
          <form className="mb-3 flex gap-2">
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Filtrar itens (vazio = todos)"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-base"
            />
            <button className="rounded-xl bg-slate-900 px-4 font-semibold text-white">Filtrar</button>
          </form>
        )}
        <div className="mb-4">
          <BotaoImprimir quantidade={etiquetas.length} />
        </div>
      </div>
      {etiquetas.length ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 print:grid-cols-3 print:gap-0">
          {etiquetas.map(({ item, svg }) => (
            <div
              key={item.id}
              className="flex break-inside-avoid items-center gap-2 rounded-lg border border-slate-300 bg-white p-2 print:rounded-none"
            >
              <div className="w-20 shrink-0" dangerouslySetInnerHTML={{ __html: svg }} />
              <div className="min-w-0 text-xs leading-tight">
                <p className="font-bold">{item.codigo}</p>
                <p className="line-clamp-3">{item.descricao}</p>
                {item.localizacao && <p className="text-slate-500">{item.localizacao}</p>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Vazio>Nenhum item para imprimir.</Vazio>
      )}
    </div>
  );
}
