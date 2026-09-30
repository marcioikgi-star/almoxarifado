"use server";

import { Prisma, TipoMovimentacao } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { registrarMovimentacao } from "@/lib/estoque";
import { ErroEstoque } from "@/lib/calculo";
import { lerNumero } from "@/lib/formato";
import { exigirUsuario } from "@/lib/auth";
import { GRUPOS_UNIDADE, normalizarSigla } from "@/lib/unidades";

export type EstadoForm = { erro?: string; ok?: string } | undefined;

const texto = (f: FormData, k: string) => {
  const v = f.get(k);
  const s = v == null ? "" : String(v).trim();
  return s || null;
};

function dadosItem(f: FormData) {
  const codigo = texto(f, "codigo");
  const descricao = texto(f, "descricao");
  if (!codigo || !descricao) return { erro: "Código e descrição são obrigatórios." } as const;
  const minimo = lerNumero(f.get("estoqueMinimo")) ?? "0";
  return {
    dados: {
      codigo: codigo.toUpperCase(),
      descricao,
      categoria: texto(f, "categoria"),
      unidade: texto(f, "unidade") ?? "UN",
      codigoBarras: texto(f, "codigoBarras"),
      fabricante: texto(f, "fabricante"),
      referencia: texto(f, "referencia"),
      localizacao: texto(f, "localizacao"),
      estoqueMinimo: new Prisma.Decimal(minimo),
    },
  } as const;
}

function erroUnico(e: unknown) {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    return "Já existe um item com esse código ou código de barras.";
  }
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
    return "Escolha uma unidade de medida da lista.";
  }
  throw e;
}

export async function criarItem(_: EstadoForm, f: FormData): Promise<EstadoForm> {
  await exigirUsuario();
  const r = dadosItem(f);
  if ("erro" in r) return { erro: r.erro };
  let id: string;
  try {
    id = (await db.item.create({ data: r.dados })).id;
  } catch (e) {
    return { erro: erroUnico(e) };
  }
  revalidatePath("/itens");
  redirect(`/itens/${id}`);
}

export async function editarItem(id: string, _: EstadoForm, f: FormData): Promise<EstadoForm> {
  await exigirUsuario();
  const r = dadosItem(f);
  if ("erro" in r) return { erro: r.erro };
  try {
    await db.item.update({ where: { id }, data: r.dados });
  } catch (e) {
    return { erro: erroUnico(e) };
  }
  revalidatePath("/itens");
  redirect(`/itens/${id}`);
}

const TIPOS = Object.values(TipoMovimentacao) as string[];

export async function movimentar(_: EstadoForm, f: FormData): Promise<EstadoForm> {
  const usuario = await exigirUsuario();
  const itemId = texto(f, "itemId");
  const tipo = texto(f, "tipo");
  const quantidade = lerNumero(f.get("quantidade"));
  const custo = lerNumero(f.get("custoUnitario"));
  if (!itemId) return { erro: "Escolha um item." };
  if (!tipo || !TIPOS.includes(tipo)) return { erro: "Tipo de movimentação inválido." };
  if (quantidade == null) return { erro: "Informe uma quantidade válida." };
  if (tipo === "SAIDA" && !texto(f, "projetoId")) return { erro: "Escolha o projeto de destino." };

  try {
    await registrarMovimentacao({
      itemId,
      tipo: tipo as TipoMovimentacao,
      quantidade: new Prisma.Decimal(quantidade),
      custoUnitario: custo == null ? null : new Prisma.Decimal(custo),
      fornecedorId: texto(f, "fornecedorId"),
      projetoId: texto(f, "projetoId"),
      documento: texto(f, "documento"),
      responsavel: texto(f, "responsavel"),
      observacao: texto(f, "observacao"),
      usuarioId: usuario.id,
    });
  } catch (e) {
    if (e instanceof ErroEstoque) return { erro: e.message };
    throw e;
  }
  revalidatePath("/", "layout");
  redirect(`/itens/${itemId}?ok=${tipo}`);
}

export async function criarProjeto(_: EstadoForm, f: FormData): Promise<EstadoForm> {
  await exigirUsuario();
  const nome = texto(f, "nome");
  if (!nome) return { erro: "Informe o nome do projeto." };
  await db.projeto.create({ data: { nome, cliente: texto(f, "cliente") } });
  revalidatePath("/cadastros");
  return { ok: `Projeto "${nome}" cadastrado.` };
}

export async function criarFornecedor(_: EstadoForm, f: FormData): Promise<EstadoForm> {
  await exigirUsuario();
  const nome = texto(f, "nome");
  if (!nome) return { erro: "Informe o nome do fornecedor." };
  try {
    await db.fornecedor.create({ data: { nome, cnpj: texto(f, "cnpj"), contato: texto(f, "contato") } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { erro: "Já existe um fornecedor com esse CNPJ." };
    }
    throw e;
  }
  revalidatePath("/cadastros");
  return { ok: `Fornecedor "${nome}" cadastrado.` };
}

export async function alternarProjeto(id: string, ativo: boolean) {
  await exigirUsuario();
  await db.projeto.update({ where: { id }, data: { ativo } });
  revalidatePath("/cadastros");
}

function dadosUnidade(f: FormData) {
  const sigla = texto(f, "sigla");
  const nome = texto(f, "nome");
  if (!sigla || !nome) return { erro: "Informe a sigla e o nome da unidade." } as const;
  const grupo = texto(f, "grupo");
  return {
    dados: {
      sigla: normalizarSigla(sigla),
      nome,
      grupo: grupo && (GRUPOS_UNIDADE as readonly string[]).includes(grupo) ? grupo : "Outras",
    },
  } as const;
}

function erroUnidade(e: unknown, sigla: string) {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    return `Já existe uma unidade com a sigla ${sigla}.`;
  }
  throw e;
}

export async function criarUnidade(_: EstadoForm, f: FormData): Promise<EstadoForm> {
  await exigirUsuario();
  const r = dadosUnidade(f);
  if ("erro" in r) return { erro: r.erro };
  try {
    await db.unidadeMedida.create({ data: r.dados });
  } catch (e) {
    return { erro: erroUnidade(e, r.dados.sigla) };
  }
  revalidatePath("/unidades");
  return { ok: `Unidade ${r.dados.sigla} (${r.dados.nome}) cadastrada.` };
}

// Mudar a sigla atualiza todos os itens que usam a unidade (ON UPDATE CASCADE no banco).
export async function editarUnidade(id: string, _: EstadoForm, f: FormData): Promise<EstadoForm> {
  await exigirUsuario();
  const r = dadosUnidade(f);
  if ("erro" in r) return { erro: r.erro };
  try {
    await db.unidadeMedida.update({ where: { id }, data: r.dados });
  } catch (e) {
    return { erro: erroUnidade(e, r.dados.sigla) };
  }
  revalidatePath("/", "layout");
  return { ok: "Alterações salvas." };
}

export async function alternarUnidade(id: string, ativo: boolean) {
  await exigirUsuario();
  await db.unidadeMedida.update({ where: { id }, data: { ativo } });
  revalidatePath("/unidades");
}
