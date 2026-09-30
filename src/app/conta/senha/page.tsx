import { trocarSenha } from "@/app/auth-actions";
import { exigirUsuario } from "@/lib/auth";
import { SENHA_MINIMA } from "@/lib/senha";
import { FormAcao } from "@/components/FormAcao";
import { Campo, Titulo } from "@/components/ui";

export default async function TrocarSenha() {
  const u = await exigirUsuario({ permitirSenhaProvisoria: true });
  return (
    <div className="mx-auto max-w-sm">
      <Titulo voltar={u.trocarSenha ? undefined : "/"}>Trocar senha</Titulo>
      {u.trocarSenha && (
        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Sua senha é provisória. Crie uma senha nova para continuar.
        </p>
      )}
      <FormAcao action={trocarSenha} enviar="Salvar nova senha">
        <input type="hidden" name="email" value={u.email} autoComplete="username" />
        <Campo rotulo="Senha atual" name="atual" type="password" autoComplete="current-password" required />
        <Campo
          rotulo="Nova senha"
          name="nova"
          type="password"
          autoComplete="new-password"
          minLength={SENHA_MINIMA}
          required
          dica={`Pelo menos ${SENHA_MINIMA} caracteres.`}
        />
        <Campo rotulo="Repita a nova senha" name="confirmacao" type="password" autoComplete="new-password" required />
      </FormAcao>
    </div>
  );
}
