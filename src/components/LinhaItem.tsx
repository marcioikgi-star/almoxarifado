import Link from "next/link";
import type { Item } from "@prisma/client";
import { fmtQtd } from "@/lib/formato";

export function LinhaItem({ item, href }: { item: Item; href?: string }) {
  const baixo = Number(item.estoqueMinimo) > 0 && Number(item.saldo) <= Number(item.estoqueMinimo);
  return (
    <Link
      href={href ?? `/itens/${item.id}`}
      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{item.descricao}</p>
        <p className="text-xs text-slate-500">
          {item.codigo}
          {item.localizacao ? ` · ${item.localizacao}` : ""}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className={`font-semibold ${baixo ? "text-red-700" : ""}`}>
          {fmtQtd(item.saldo)} {item.unidade}
        </p>
        {baixo && <p className="text-xs text-red-700">abaixo do mínimo</p>}
      </div>
    </Link>
  );
}
