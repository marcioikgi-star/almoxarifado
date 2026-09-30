import { alternarUsuario, criarUsuario, redefinirSenha } from "@/app/auth-actions";
import { exigirAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { SENHA_MINIMA } from "@/lib/senha";
import { FormAcao } from "@/components/FormAcao";
import { Campo, Cartao, Selecao, Titulo } from "@/components/ui";

export default async function Usuarios() {
  const admin = await exigirAdmin();
  const usuarios = await db.usuario.findMany({ orderBy: [{ ativo: "desc" }, { nome: "asc" }] });

  return (
    <div className="space-y-6">
      <Titulo voltar="/cadastros">Usuários</Titulo>
      <Cartao>
        <h2 className="mb-3 font-semibold">Novo usuário</h2>
        <FormAcao action={criarUsuario} enviar="Cadastrar usuário" limparAoSalvar>
          <Campo rotulo="Nome *" name="nome" required />
          <Campo rotulo="E-mail *" name="email" type="email" required autoComplete="off" />
          <Campo
            rotulo="Senha provisória *"
            name="senha"
            type="text"
            autoComplete="off"
            minLength={SENHA_MINIMA}
            required
            dica="A pessoa troca no primeiro acesso."
          />
          <Selecao rotulo="Perfil" name="papel" defaultValue="ALMOXARIFE">
            <option value="ALMOXARIFE">Almoxarife</option>
            <option value="ADMIN">Administrador</option>
          </Selecao>
        </FormAcao>
      </Cartao>

      <ul className="space-y-3">
        {usuarios.map((u) => (
          <li key={u.id}>
            <Cartao className={u.ativo ? "" : "opacity-60"}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">
                    {u.nome} {u.id === admin.id && <span className="text-xs text-slate-500">(você)</span>}
                  </p>
                  <p className="truncate text-sm text-slate-500">{u.email}</p>
                  <p className="text-xs text-slate-500">
                    {u.papel === "ADMIN" ? "Administrador" : "Almoxarife"}
                    {u.trocarSenha ? " · senha provisória" : ""}
                    {u.ativo ? "" : " · desativado"}
                  </p>
                </div>
                {u.id !== admin.id && (
                  <form action={alternarUsuario.bind(null, u.id, !u.ativo)}>
                    <button className="rounded-lg border border-slate-300 px-3 py-1 text-xs">
                      {u.ativo ? "Desativar" : "Reativar"}
                    </button>
                  </form>
                )}
              </div>
              {u.id !== admin.id && u.ativo && (
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer text-slate-600">Redefinir senha</summary>
                  <FormAcao action={redefinirSenha.bind(null, u.id)} enviar="Definir senha provisória" className="mt-3 space-y-3" limparAoSalvar>
                    <Campo rotulo="Nova senha provisória" name="senha" type="text" autoComplete="off" minLength={SENHA_MINIMA} required />
                  </FormAcao>
                </details>
              )}
            </Cartao>
          </li>
        ))}
      </ul>
    </div>
  );
}
