import { connection } from "next/server";
import { buscarItens, itensAbaixoDoMinimo } from "@/lib/consultas";
import { BotaoLink, Titulo, Vazio } from "@/components/ui";
import { LinhaItem } from "@/components/LinhaItem";

export default async function Itens({ searchParams }: PageProps<"/itens">) {
  await connection();
  const { q, baixo } = await searchParams;
  const termo = typeof q === "string" ? q : "";
  const soBaixos = baixo === "1";
  const itens = soBaixos ? await itensAbaixoDoMinimo() : await buscarItens(termo, 200);

  return (
    <div>
      <Titulo>{soBaixos ? "Itens abaixo do mínimo" : "Itens"}</Titulo>
      <form className="mb-4 flex gap-2">
        <input
          name="q"
          type="search"
          defaultValue={termo}
          placeholder="Nome, código, fabricante, local…"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-base"
        />
        <button className="rounded-xl bg-slate-900 px-4 font-semibold text-white">Buscar</button>
      </form>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <BotaoLink href="/itens/novo">Novo item</BotaoLink>
        <BotaoLink href="/etiquetas" cor="claro">
          Etiquetas QR
        </BotaoLink>
      </div>
      {itens.length ? (
        <div className="space-y-2">
          {itens.map((i) => (
            <LinhaItem key={i.id} item={i} />
          ))}
        </div>
      ) : (
        <Vazio>{termo ? `Nada encontrado para "${termo}".` : "Nenhum item cadastrado ainda."}</Vazio>
      )}
    </div>
  );
}
