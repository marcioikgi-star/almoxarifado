type Num = { toString(): string } | number | string;

const qtd = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 });
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dataHora = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export const fmtQtd = (v: Num) => qtd.format(Number(v.toString()));
export const fmtBRL = (v: Num) => brl.format(Number(v.toString()));
export const fmtData = (d: Date) => dataHora.format(d);

export const nomeTipo: Record<string, string> = {
  ENTRADA: "Entrada",
  SAIDA: "Saída",
  AJUSTE: "Ajuste",
  DEVOLUCAO: "Devolução",
};

/** Aceita "1.234,5" ou "1234.5" vindos de teclado brasileiro. */
export function lerNumero(v: FormDataEntryValue | null): string | null {
  if (v == null) return null;
  let s = String(v).trim();
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  return /^-?\d+(\.\d+)?$/.test(s) ? s : null;
}
