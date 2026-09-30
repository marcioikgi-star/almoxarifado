import { exigirUsuario } from "@/lib/auth";
import { Titulo } from "@/components/ui";
import { Leitor } from "./Leitor";

export default async function Escanear({ searchParams }: PageProps<"/escanear">) {
  await exigirUsuario();
  const { tipo } = await searchParams;
  return (
    <div>
      <Titulo voltar="/">Escanear</Titulo>
      <p className="mb-3 text-sm text-slate-600">Aponte a câmera para a etiqueta QR ou o código de barras do item.</p>
      <Leitor tipo={typeof tipo === "string" ? tipo : undefined} />
    </div>
  );
}
