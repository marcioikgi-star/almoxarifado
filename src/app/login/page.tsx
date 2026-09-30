import { redirect } from "next/navigation";
import { entrar } from "@/app/auth-actions";
import { usuarioAtual } from "@/lib/auth";
import { FormAcao } from "@/components/FormAcao";
import { Campo } from "@/components/ui";

export default async function Login({ searchParams }: PageProps<"/login">) {
  if (await usuarioAtual()) redirect("/");
  const { volta } = await searchParams;
  return (
    <div className="mx-auto max-w-sm pt-8">
      <h1 className="mb-1 text-2xl font-bold">Entrar</h1>
      <p className="mb-6 text-sm text-slate-600">Use o e-mail e a senha cadastrados pelo administrador.</p>
      <FormAcao action={entrar} enviar="Entrar">
        <input type="hidden" name="volta" value={typeof volta === "string" ? volta : "/"} />
        <Campo rotulo="E-mail" name="email" type="email" autoComplete="username" required autoFocus />
        <Campo rotulo="Senha" name="senha" type="password" autoComplete="current-password" required />
      </FormAcao>
    </div>
  );
}
