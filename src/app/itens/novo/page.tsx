import { exigirUsuario } from "@/lib/auth";
import { criarItem } from "@/app/actions";
import { CamposItem } from "@/components/CamposItem";
import { FormAcao } from "@/components/FormAcao";
import { Titulo } from "@/components/ui";

export default async function NovoItem({ searchParams }: PageProps<"/itens/novo">) {
  await exigirUsuario();
  const { codigoBarras } = await searchParams;
  return (
    <div>
      <Titulo voltar="/itens">Novo item</Titulo>
      <FormAcao action={criarItem} enviar="Cadastrar item">
        <CamposItem padrao={{ codigoBarras: typeof codigoBarras === "string" ? codigoBarras : "" }} />
      </FormAcao>
    </div>
  );
}
