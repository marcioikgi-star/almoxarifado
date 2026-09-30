import { exigirUsuario } from "@/lib/auth";
import { notFound } from "next/navigation";
import { editarItem } from "@/app/actions";
import { db } from "@/lib/db";
import { CamposItem } from "@/components/CamposItem";
import { FormAcao } from "@/components/FormAcao";
import { Titulo } from "@/components/ui";
import { listarUnidadesAtivas } from "@/lib/consultas";

export default async function EditarItem({ params }: PageProps<"/itens/[id]/editar">) {
  await exigirUsuario();
  const { id } = await params;
  const item = await db.item.findUnique({ where: { id } });
  if (!item) notFound();
  const unidades = await listarUnidadesAtivas(item.unidade);
  return (
    <div>
      <Titulo voltar={`/itens/${id}`}>Editar item</Titulo>
      <FormAcao action={editarItem.bind(null, id)} enviar="Salvar alterações">
        <CamposItem item={item} unidades={unidades} />
      </FormAcao>
    </div>
  );
}
