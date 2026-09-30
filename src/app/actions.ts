"use server";

import { Prisma, TipoMovimentacao } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { registrarMovimentacao } from "@/lib/estoque";
import { ErroEstoque } from "@/lib/calculo";
import { lerNumero } from "@/lib/formato";

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
      unidade: texto(f, "unidade") ?? "un",
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
  throw e;
}

export async function criarItem(_: EstadoForm, f: FormData): Promise<EstadoForm> {
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
    });
  } catch (e) {
    if (e instanceof ErroEstoque) return { erro: e.message };
    throw e;
  }
  revalidatePath("/", "layout");
  redirect(`/itens/${itemId}?ok=${tipo}`);
}

export async function criarProjeto(_: EstadoForm, f: FormData): Promise<EstadoForm> {
  const nome = texto(f, "nome");
  if (!nome) return { erro: "Informe o nome do projeto." };
  await db.projeto.create({ data: { nome, cliente: texto(f, "cliente") } });
  revalidatePath("/cadastros");
  return { ok: `Projeto "${nome}" cadastrado.` };
}

export async function criarFornecedor(_: EstadoForm, f: FormData): Promise<EstadoForm> {
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
  await db.projeto.update({ where: { id }, data: { ativo } });
  revalidatePath("/cadastros");
}
