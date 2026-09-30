import { NextResponse, type NextRequest } from "next/server";

// Checagem rápida: sem cookie de sessão vai direto para o login.
// A validação de verdade (sessão existe, não expirou, usuário ativo) fica em exigirUsuario().
export function proxy(req: NextRequest) {
  if (req.cookies.has("almox_sessao")) return NextResponse.next();
  const url = new URL("/login", req.url);
  const destino = req.nextUrl.pathname + req.nextUrl.search;
  if (destino !== "/") url.searchParams.set("volta", destino);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest).*)"],
};
