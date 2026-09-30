import { headers } from "next/headers";
import QRCode from "qrcode";

/** Endereço gravado na etiqueta: abre o item tanto pela câmera do celular quanto pelo leitor do app. */
export async function urlEtiqueta(codigo: string) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/c/${encodeURIComponent(codigo)}`;
}

export function qrSvg(conteudo: string) {
  return QRCode.toString(conteudo, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
}
