// Grupos na ordem em que aparecem nas listas. A lista inicial de unidades está na migração
// prisma/migrations/20260930224500_unidades_de_medida.
export const GRUPOS_UNIDADE = [
  "Contagem",
  "Embalagem",
  "Peças de estoque",
  "Comprimento",
  "Área",
  "Volume",
  "Massa",
  "Tempo e serviço",
  "Outras",
] as const;

/** Sigla padronizada: maiúsculas, sem espaços nas pontas, "m²" vira "M2" e "m³" vira "M3". */
export function normalizarSigla(s: string) {
  return s.trim().replace(/²/g, "2").replace(/³/g, "3").replace(/\s+/g, " ").toUpperCase();
}

/** Agrupa as unidades na ordem de GRUPOS_UNIDADE; grupos desconhecidos vão para o fim. */
export function agruparUnidades<T extends { grupo: string; sigla: string }>(unidades: T[]) {
  const ordem = (g: string) => {
    const i = (GRUPOS_UNIDADE as readonly string[]).indexOf(g);
    return i < 0 ? GRUPOS_UNIDADE.length : i;
  };
  const grupos = new Map<string, T[]>();
  for (const u of [...unidades].sort((a, b) => ordem(a.grupo) - ordem(b.grupo) || a.grupo.localeCompare(b.grupo))) {
    grupos.set(u.grupo, [...(grupos.get(u.grupo) ?? []), u]);
  }
  return [...grupos.entries()];
}
