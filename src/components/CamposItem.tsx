import type { Item } from "@prisma/client";
import { Campo } from "./ui";

const UNIDADES = ["un", "pç", "m", "m²", "m³", "kg", "L", "cx", "rolo", "barra", "chapa", "par", "jg"];

export function CamposItem({ item, padrao }: { item?: Item | null; padrao?: Partial<Record<string, string>> }) {
  const v = (k: keyof Item) => (item?.[k] != null ? String(item[k]) : (padrao?.[k] ?? ""));
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Campo rotulo="Código interno *" name="codigo" required defaultValue={v("codigo")} autoCapitalize="characters" />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Unidade *</span>
          <input
            name="unidade"
            list="unidades"
            required
            defaultValue={v("unidade") || "un"}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base"
          />
          <datalist id="unidades">
            {UNIDADES.map((u) => (
              <option key={u} value={u} />
            ))}
          </datalist>
        </label>
      </div>
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
