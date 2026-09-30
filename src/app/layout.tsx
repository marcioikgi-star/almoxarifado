import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full bg-slate-100 text-slate-900">
        <header className="sticky top-0 z-10 bg-slate-900 px-4 py-3 text-white print:hidden">
          <Link href="/" className="font-bold">
            Almoxarifado Celta
          </Link>
        </header>
        <main className="mx-auto w-full max-w-2xl px-4 pt-4 pb-28 print:max-w-none print:p-0">{children}</main>
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
      </body>
    </html>
  );
}
