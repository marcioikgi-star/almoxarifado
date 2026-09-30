import { notFound } from "next/navigation";
import { editarItem } from "@/app/actions";
import { db } from "@/lib/db";
import { CamposItem } from "@/components/CamposItem";
import { FormAcao } from "@/components/FormAcao";
import { Titulo } from "@/components/ui";

export default async function EditarItem({ params }: PageProps<"/itens/[id]/editar">) {
  const { id } = await params;
  const item = await db.item.findUnique({ where: { id } });
  if (!item) notFound();
  return (
    <div>
      <Titulo voltar={`/itens/${id}`}>Editar item</Titulo>
      <FormAcao action={editarItem.bind(null, id)} enviar="Salvar alterações">
        <CamposItem item={item} />
      </FormAcao>
    </div>
  );
}
