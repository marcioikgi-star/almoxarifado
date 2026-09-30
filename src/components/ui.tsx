import Link from "next/link";

type CampoProps = React.InputHTMLAttributes<HTMLInputElement> & { rotulo: string; dica?: string };

export function Campo({ rotulo, dica, className, ...props }: CampoProps) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-sm font-medium text-slate-700">{rotulo}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base outline-none focus:border-slate-900"
      />
      {dica && <span className="mt-1 block text-xs text-slate-500">{dica}</span>}
    </label>
  );
}

type SelecaoProps = React.SelectHTMLAttributes<HTMLSelectElement> & { rotulo: string };

export function Selecao({ rotulo, children, ...props }: SelecaoProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{rotulo}</span>
      <select
        {...props}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base outline-none focus:border-slate-900"
      >
        {children}
      </select>
    </label>
  );
}

export function Titulo({ children, voltar }: { children: React.ReactNode; voltar?: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      {voltar && (
        <Link href={voltar} className="rounded-lg px-2 py-1 text-2xl leading-none text-slate-500" aria-label="Voltar">
          ‹
        </Link>
      )}
      <h1 className="text-xl font-bold">{children}</h1>
    </div>
  );
}

export function Cartao({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-4 ${className ?? ""}`}>{children}</div>;
}

export function BotaoLink({
  href,
  children,
  cor = "escuro",
}: {
  href: string;
  children: React.ReactNode;
  cor?: "escuro" | "verde" | "laranja" | "claro";
}) {
  const cores = {
    escuro: "bg-slate-900 text-white",
    verde: "bg-emerald-600 text-white",
    laranja: "bg-orange-600 text-white",
    claro: "border border-slate-300 bg-white text-slate-900",
  };
  return (
    <Link href={href} className={`block rounded-xl px-4 py-3 text-center font-semibold ${cores[cor]}`}>
      {children}
    </Link>
  );
}

export function Vazio({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500">{children}</p>;
}
