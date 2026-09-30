import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BotaoLink, Titulo } from "@/components/ui";

/** Destino das etiquetas QR e do leitor: acha o item pelo código interno ou de barras. */
export default async function PorCodigo({ params, searchParams }: PageProps<"/c/[codigo]">) {
  const codigo = decodeURIComponent((await params).codigo).trim();
  const { tipo } = await searchParams;
  const item = await db.item.findFirst({
    where: { OR: [{ codigo: codigo.toUpperCase() }, { codigoBarras: codigo }] },
    select: { id: true },
  });
  if (item) {
    // Vindo do leitor dentro de uma entrada/saída, volta direto para o formulário.
    redirect(typeof tipo === "string" ? `/movimentar?tipo=${encodeURIComponent(tipo)}&item=${item.id}` : `/itens/${item.id}`);
  }

  return (
    <div className="space-y-4">
      <Titulo voltar="/escanear">Código não cadastrado</Titulo>
      <p>
        Nenhum item tem o código <strong className="break-all">{codigo}</strong>.
      </p>
      <BotaoLink href={`/itens/novo?codigoBarras=${encodeURIComponent(codigo)}`}>Cadastrar item com este código</BotaoLink>
      <BotaoLink href="/escanear" cor="claro">
        Escanear de novo
      </BotaoLink>
    </div>
  );
}
