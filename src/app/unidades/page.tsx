import { alternarUnidade, criarUnidade, editarUnidade } from "@/app/actions";
import { exigirUsuario } from "@/lib/auth";
import { db } from "@/lib/db";
import { agruparUnidades, GRUPOS_UNIDADE } from "@/lib/unidades";
import { FormAcao } from "@/components/FormAcao";
import { Campo, Cartao, Selecao, Titulo } from "@/components/ui";

function CamposUnidade({ padrao }: { padrao?: { sigla: string; nome: string; grupo: string } }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        <Campo
          rotulo="Sigla *"
          name="sigla"
          required
          maxLength={12}
          autoCapitalize="characters"
          defaultValue={padrao?.sigla}
          placeholder="M2"
        />
        <Campo rotulo="Nome *" name="nome" required className="col-span-2" defaultValue={padrao?.nome} placeholder="Metro quadrado" />
      </div>
      <Selecao rotulo="Grupo" name="grupo" defaultValue={padrao?.grupo ?? "Contagem"}>
        {GRUPOS_UNIDADE.map((g) => (
          <option key={g}>{g}</option>
        ))}
      </Selecao>
    </>
  );
}

export default async function Unidades() {
  await exigirUsuario();
  const [unidades, uso] = await Promise.all([
    db.unidadeMedida.findMany({ orderBy: { criadoEm: "asc" } }),
    db.item.groupBy({ by: ["unidade"], _count: true }),
  ]);
  const itensPorSigla = new Map(uso.map((u) => [u.unidade, u._count]));

  return (
    <div className="space-y-6">
      <Titulo voltar="/cadastros">Unidades de medida</Titulo>
      <Cartao>
        <h2 className="mb-3 font-semibold">Nova unidade</h2>
        <FormAcao action={criarUnidade} enviar="Adicionar unidade" limparAoSalvar>
          <CamposUnidade />
        </FormAcao>
      </Cartao>

      {agruparUnidades(unidades).map(([grupo, us]) => (
        <section key={grupo}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{grupo}</h2>
          <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white text-sm">
            {us.map((u) => {
              const itens = itensPorSigla.get(u.sigla) ?? 0;
              return (
                <li key={u.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className={u.ativo ? "" : "text-slate-400"}>
                      <p>
                        <span className="font-semibold">{u.sigla}</span> · {u.nome}
                      </p>
                      <p className="text-xs text-slate-500">
                        {itens ? `${itens} ${itens === 1 ? "item" : "itens"}` : "Nenhum item"}
                        {u.ativo ? "" : " · desativada"}
                      </p>
                    </div>
                    <form action={alternarUnidade.bind(null, u.id, !u.ativo)}>
                      <button className="rounded-lg border border-slate-300 px-3 py-1 text-xs">
                        {u.ativo ? "Desativar" : "Reativar"}
                      </button>
                    </form>
                  </div>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-slate-600">Editar</summary>
                    <FormAcao action={editarUnidade.bind(null, u.id)} enviar="Salvar" className="mt-3 space-y-3">
                      <CamposUnidade padrao={u} />
                      {itens > 0 && (
                        <p className="text-xs text-slate-500">Se mudar a sigla, os itens que usam esta unidade passam a usar a nova.</p>
                      )}
                    </FormAcao>
                  </details>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <p className="text-xs text-slate-500">
        Unidades desativadas deixam de aparecer no cadastro de itens, mas os itens que já usam continuam iguais.
      </p>
    </div>
  );
}
