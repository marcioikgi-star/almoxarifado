"use client";

import { startTransition, useActionState } from "react";
import type { EstadoForm } from "@/app/actions";

type Props = {
  action: (estado: EstadoForm, f: FormData) => Promise<EstadoForm>;
  children: React.ReactNode;
  enviar: string;
  className?: string;
  /** Limpa os campos depois de salvar com sucesso (formulários de cadastro rápido). */
  limparAoSalvar?: boolean;
};

export function FormAcao({ action, children, enviar, className, limparAoSalvar }: Props) {
  const [estado, acao, pendente] = useActionState(action, undefined);
  return (
    <form
      // Envio via onSubmit (e não action=) para o React não limpar os campos quando o servidor devolve erro.
      onSubmit={(e) => {
        e.preventDefault();
        const dados = new FormData(e.currentTarget);
        startTransition(() => acao(dados));
      }}
      className={className ?? "space-y-4"}
      key={limparAoSalvar ? estado?.ok : undefined}
    >
      {children}
      {estado?.erro && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {estado.erro}
        </p>
      )}
      {estado?.ok && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          {estado.ok}
        </p>
      )}
      <button
        type="submit"
        disabled={pendente}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60"
      >
        {pendente ? "Salvando…" : enviar}
      </button>
    </form>
  );
}
