import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { sair } from "./auth-actions";
import { usuarioAtual } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Almoxarifado Celta",
  description: "Controle de estoque do almoxarifado",
  appleWebApp: { capable: true, title: "Almoxarifado", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

const menu = [
  { href: "/", rotulo: "Início", icone: "⌂" },
  { href: "/itens", rotulo: "Itens", icone: "▤" },
  { href: "/escanear", rotulo: "Escanear", icone: "⌗" },
  { href: "/historico", rotulo: "Histórico", icone: "↻" },
  { href: "/cadastros", rotulo: "Cadastros", icone: "☰" },
];

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const usuario = await usuarioAtual();
  const logado = usuario && !usuario.trocarSenha;
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full bg-slate-100 text-slate-900">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-slate-900 px-4 py-3 text-white print:hidden">
          <Link href="/" className="font-bold">
            Almoxarifado Celta
          </Link>
          {usuario && (
            <div className="flex min-w-0 items-center gap-3 text-sm">
              <Link href="/conta/senha" className="truncate text-slate-300" title="Trocar senha">
                {usuario.nome.split(" ")[0]}
              </Link>
              <form action={sair}>
                <button className="rounded-lg border border-slate-600 px-2 py-1">Sair</button>
              </form>
            </div>
          )}
        </header>
        <main className="mx-auto w-full max-w-2xl px-4 pt-4 pb-28 print:max-w-none print:p-0">{children}</main>
        {logado && (
        <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] print:hidden">
          <ul className="mx-auto flex max-w-2xl">
            {menu.map((m) => (
              <li key={m.href} className="flex-1">
                <Link href={m.href} className="flex flex-col items-center py-2 text-xs text-slate-600">
                  <span className="text-xl leading-6" aria-hidden>
                    {m.icone}
                  </span>
                  {m.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        )}
      </body>
    </html>
  );
}
