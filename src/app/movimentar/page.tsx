import Link from "next/link";
import { connection } from "next/server";
import { movimentar } from "@/app/actions";
import { db } from "@/lib/db";
import { buscarItens } from "@/lib/consultas";
import { fmtBRL, fmtQtd, nomeTipo } from "@/lib/formato";
import { FormAcao } from "@/components/FormAcao";
import { LinhaItem } from "@/components/LinhaItem";
import { BotaoLink, Campo, Cartao, Selecao, Titulo, Vazio } from "@/components/ui";

const TIPOS = ["ENTRADA", "SAIDA", "DEVOLUCAO", "AJUSTE"] as const;
type Tipo = (typeof TIPOS)[number];

export default async function Movimentar({ searchParams }: PageProps<"/movimentar">) {
  await connection();
  const sp = await searchParams;
  const tipo: Tipo = TIPOS.includes(sp.tipo as Tipo) ? (sp.tipo as Tipo) : "ENTRADA";
  const itemId = typeof sp.item === "string" ? sp.item : null;
  const q = typeof sp.q === "string" ? sp.q : "";

  const item = itemId ? await db.item.findUnique({ where: { id: itemId } }) : null;

  const abas = (
    <div className="mb-4 grid grid-cols-4 gap-1 rounded-xl bg-slate-200 p-1 text-sm">
      {TIPOS.map((t) => (
        <Link
          key={t}
          href={`/movimentar?tipo=${t}${item ? `&item=${item.id}` : ""}`}
          className={`rounded-lg py-2 text-center ${t === tipo ? "bg-white font-semibold shadow-sm" : "text-slate-600"}`}
        >
          {nomeTipo[t]}
        </Link>
      ))}
    </div>
  );

  if (!item) {
    const itens = q ? await buscarItens(q, 30) : [];
    return (
      <div>
        <Titulo voltar="/">{nomeTipo[tipo]}</Titulo>
        {abas}
        <p className="mb-2 text-sm text-slate-600">Escolha o item:</p>
        <form className="mb-3 flex gap-2">
          <input type="hidden" name="tipo" value={tipo} />
          <input
            name="q"
            type="search"
            defaultValue={q}
            autoFocus
            placeholder="Nome ou código do item"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-base"
          />
          <button className="rounded-xl bg-slate-900 px-4 font-semibold text-white">Buscar</button>
        </form>
        <div className="mb-4">
          <BotaoLink href={`/escanear?tipo=${tipo}`} cor="claro">
            Escanear QR ou código de barras
          </BotaoLink>
        </div>
        {q &&
          (itens.length ? (
            <div className="space-y-2">
              {itens.map((i) => (
                <LinhaItem key={i.id} item={i} href={`/movimentar?tipo=${tipo}&item=${i.id}`} />
              ))}
            </div>
          ) : (
            <Vazio>Nada encontrado para &quot;{q}&quot;.</Vazio>
          ))}
      </div>
    );
  }

  const [projetos, fornecedores] = await Promise.all([
    tipo === "SAIDA" || tipo === "DEVOLUCAO"
      ? db.projeto.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } })
      : [],
    tipo === "ENTRADA" ? db.fornecedor.findMany({ orderBy: { nome: "asc" } }) : [],
  ]);

  return (
    <div>
      <Titulo voltar={`/itens/${item.id}`}>{nomeTipo[tipo]}</Titulo>
      {abas}
      <Cartao className="mb-4">
        <p className="font-medium">{item.descricao}</p>
        <p className="text-sm text-slate-500">
          {item.codigo} · saldo {fmtQtd(item.saldo)} {item.unidade} · custo médio {fmtBRL(item.custoMedio)}
        </p>
        <Link href={`/movimentar?tipo=${tipo}`} className="text-sm underline">
          trocar item
        </Link>
      </Cartao>

      <FormAcao action={movimentar} enviar={`Registrar ${nomeTipo[tipo].toLowerCase()}`}>
        <input type="hidden" name="itemId" value={item.id} />
        <input type="hidden" name="tipo" value={tipo} />
        <Campo
          rotulo={tipo === "AJUSTE" ? `Quantidade contada (${item.unidade}) *` : `Quantidade (${item.unidade}) *`}
          name="quantidade"
          inputMode="decimal"
          required
          autoFocus
          dica={tipo === "AJUSTE" ? "O saldo passa a ser exatamente esta quantidade." : undefined}
        />
        {tipo === "ENTRADA" && (
          <>
            <Campo
              rotulo="Custo unitário (R$)"
              name="custoUnitario"
              inputMode="decimal"
              dica="Deixe em branco para manter o custo médio atual."
            />
            <Selecao rotulo="Fornecedor" name="fornecedorId" defaultValue="">
              <option value="">—</option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </Selecao>
            <Campo rotulo="Nota fiscal / documento" name="documento" />
          </>
        )}
        {(tipo === "SAIDA" || tipo === "DEVOLUCAO") && (
          <>
            {projetos.length === 0 && (
              <p className="text-sm text-slate-600">
                Nenhum projeto cadastrado.{" "}
                <Link href="/cadastros" className="underline">
                  Cadastrar projeto
                </Link>
              </p>
            )}
            <Selecao rotulo={tipo === "SAIDA" ? "Projeto / obra *" : "Projeto / obra"} name="projetoId" defaultValue="">
              <option value="">—</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                  {p.cliente ? ` (${p.cliente})` : ""}
                </option>
              ))}
            </Selecao>
          </>
        )}
        <Campo rotulo={tipo === "SAIDA" ? "Retirado por" : "Responsável"} name="responsavel" autoComplete="name" />
        <Campo rotulo="Observação" name="observacao" />
      </FormAcao>
    </div>
  );
}
