import { connection } from "next/server";
import { alternarProjeto, criarFornecedor, criarProjeto } from "@/app/actions";
import { db } from "@/lib/db";
import { FormAcao } from "@/components/FormAcao";
import { Campo, Cartao, Titulo } from "@/components/ui";

export default async function Cadastros() {
  await connection();
  const [projetos, fornecedores] = await Promise.all([
    db.projeto.findMany({ orderBy: [{ ativo: "desc" }, { nome: "asc" }] }),
    db.fornecedor.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <section>
        <Titulo>Projetos e obras</Titulo>
        <Cartao className="mb-3">
          <FormAcao action={criarProjeto} enviar="Adicionar projeto" limparAoSalvar>
            <Campo rotulo="Nome do projeto *" name="nome" required />
            <Campo rotulo="Cliente" name="cliente" />
          </FormAcao>
        </Cartao>
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white text-sm">
          {projetos.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className={p.ativo ? "" : "text-slate-400"}>
                <p className="font-medium">{p.nome}</p>
                {p.cliente && <p className="text-xs">{p.cliente}</p>}
              </div>
              <form action={alternarProjeto.bind(null, p.id, !p.ativo)}>
                <button className="rounded-lg border border-slate-300 px-3 py-1 text-xs">
                  {p.ativo ? "Encerrar" : "Reabrir"}
                </button>
              </form>
            </li>
          ))}
          {!projetos.length && <li className="px-4 py-3 text-slate-500">Nenhum projeto ainda.</li>}
        </ul>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">Fornecedores</h2>
        <Cartao className="mb-3">
          <FormAcao action={criarFornecedor} enviar="Adicionar fornecedor" limparAoSalvar>
            <Campo rotulo="Nome *" name="nome" required />
            <div className="grid grid-cols-2 gap-3">
              <Campo rotulo="CNPJ" name="cnpj" inputMode="numeric" />
              <Campo rotulo="Contato" name="contato" />
            </div>
          </FormAcao>
        </Cartao>
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white text-sm">
          {fornecedores.map((f) => (
            <li key={f.id} className="px-4 py-3">
              <p className="font-medium">{f.nome}</p>
              <p className="text-xs text-slate-500">{[f.cnpj, f.contato].filter(Boolean).join(" · ")}</p>
            </li>
          ))}
          {!fornecedores.length && <li className="px-4 py-3 text-slate-500">Nenhum fornecedor ainda.</li>}
        </ul>
      </section>
    </div>
  );
}
