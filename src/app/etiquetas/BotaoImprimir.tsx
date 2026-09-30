"use client";

export function BotaoImprimir({ quantidade }: { quantidade: number }) {
  return (
    <button
      onClick={() => window.print()}
      disabled={!quantidade}
      className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60"
    >
      Imprimir {quantidade} etiqueta{quantidade === 1 ? "" : "s"}
    </button>
  );
}
