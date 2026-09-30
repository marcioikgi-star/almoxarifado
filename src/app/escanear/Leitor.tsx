"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** Extrai o código de uma etiqueta do sistema (".../c/CODIGO") ou devolve o texto lido como está. */
export function codigoLido(texto: string) {
  try {
    const url = new URL(texto);
    const m = url.pathname.match(/\/c\/([^/]+)$/);
    if (m) return decodeURIComponent(m[1]);
  } catch {
    // não é URL: código de barras ou código interno
  }
  return texto.trim();
}

export function Leitor({ tipo }: { tipo?: string }) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const lido = useRef(false);

  const abrir = (texto: string) => {
    const codigo = codigoLido(texto);
    if (!codigo) return;
    router.push(`/c/${encodeURIComponent(codigo)}${tipo ? `?tipo=${tipo}` : ""}`);
  };

  useEffect(() => {
    let parar: (() => Promise<void>) | undefined;
    let cancelado = false;
    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (cancelado) return;
      const leitor = new Html5Qrcode("leitor-camera", { verbose: false });
      try {
        await leitor.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (texto) => {
            if (lido.current) return;
            lido.current = true;
            navigator.vibrate?.(80);
            abrir(texto);
          },
          () => {},
        );
        parar = () => leitor.stop();
        if (cancelado) await leitor.stop();
      } catch {
        setErro("Não foi possível abrir a câmera. Verifique a permissão do navegador ou digite o código abaixo.");
      }
    })();
    return () => {
      cancelado = true;
      parar?.().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <div id="leitor-camera" className="aspect-square w-full overflow-hidden rounded-2xl bg-black" />
      {erro && (
        <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {erro}
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          abrir(manual);
        }}
        className="flex gap-2"
      >
        <input
          value={manual}
          onChange={(e) => setManual(e.target.value)}
          placeholder="Ou digite o código"
          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-base"
        />
        <button className="rounded-xl bg-slate-900 px-4 font-semibold text-white">Abrir</button>
      </form>
    </div>
  );
}
