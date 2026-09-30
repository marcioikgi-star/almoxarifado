import Link from "next/link";
import type { Item, UnidadeMedida } from "@prisma/client";
import { agruparUnidades } from "@/lib/unidades";
import { Campo, Selecao } from "./ui";

type Props = {
  item?: Item | null;
  padrao?: Partial<Record<string, string>>;
  unidades: Pick<UnidadeMedida, "sigla" | "nome" | "grupo">[];
};

export function CamposItem({ item, padrao, unidades }: Props) {
  const v = (k: keyof Item) => (item?.[k] != null ? String(item[k]) : (padrao?.[k] ?? ""));
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Código interno *" name="codigo" required defaultValue={v("codigo")} autoCapitalize="characters" />
        <Selecao rotulo="Unidade *" name="unidade" required defaultValue={v("unidade") || "UN"}>
          {agruparUnidades(unidades).map(([grupo, us]) => (
            <optgroup key={grupo} label={grupo}>
              {us.map((u) => (
                <option key={u.sigla} value={u.sigla}>
                  {u.sigla} · {u.nome}
                </option>
              ))}
            </optgroup>
          ))}
        </Selecao>
      </div>
      <p className="-mt-2 text-xs text-slate-500">
        Não achou a unidade?{" "}
        <Link href="/unidades" className="underline">
          Cadastre em Unidades de medida
        </Link>
      </p>
      <Campo rotulo="Descrição *" name="descricao" required defaultValue={v("descricao")} />
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Categoria" name="categoria" defaultValue={v("categoria")} />
        <Campo rotulo="Localização" name="localizacao" defaultValue={v("localizacao")} placeholder="Ex.: A-03-2" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Fabricante" name="fabricante" defaultValue={v("fabricante")} />
        <Campo rotulo="Referência" name="referencia" defaultValue={v("referencia")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Código de barras" name="codigoBarras" defaultValue={v("codigoBarras")} inputMode="numeric" />
        <Campo
          rotulo="Estoque mínimo"
          name="estoqueMinimo"
          defaultValue={item ? String(item.estoqueMinimo) : ""}
          inputMode="decimal"
        />
      </div>
    </>
  );
}
