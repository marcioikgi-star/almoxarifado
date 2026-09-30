// Dados de exemplo para testar o protótipo: npm run seed
import { Prisma, PrismaClient } from "@prisma/client";
import { registrarMovimentacao } from "../src/lib/estoque";

const db = new PrismaClient();
const d = (v: number) => new Prisma.Decimal(v);

async function main() {
  if (await db.item.count()) {
    console.log("O banco já tem itens; nada foi alterado.");
    return;
  }
  const fornecedor = await db.fornecedor.create({ data: { nome: "Aço Forte Distribuidora", cnpj: "00.000.000/0001-00" } });
  const projeto = await db.projeto.create({ data: { nome: "Container escritório 20 pés", cliente: "Cliente exemplo" } });

  const itens = [
    { codigo: "CH-ACO-3", descricao: "Chapa de aço carbono 3 mm 1200x3000", unidade: "chapa", categoria: "Chapas", localizacao: "A-01", estoqueMinimo: d(5), entrada: [12, 780] },
    { codigo: "TB-RET-50", descricao: "Tubo retangular 50x30 chapa 14 (barra 6 m)", unidade: "barra", categoria: "Tubos", localizacao: "A-02", estoqueMinimo: d(10), entrada: [40, 145] },
    { codigo: "EL-CAB-25", descricao: "Cabo flexível 2,5 mm² azul", unidade: "m", categoria: "Elétrica", localizacao: "B-03", estoqueMinimo: d(100), entrada: [300, 2.35] },
    { codigo: "EL-TOM-10A", descricao: "Tomada 2P+T 10 A branca", unidade: "un", categoria: "Elétrica", localizacao: "B-04", estoqueMinimo: d(20), entrada: [15, 9.9] },
    { codigo: "TN-ESM-BR", descricao: "Tinta esmalte sintético branco 3,6 L", unidade: "gl", categoria: "Pintura", localizacao: "C-01", estoqueMinimo: d(4), entrada: [10, 118] },
    { codigo: "PF-AUTO-12", descricao: "Parafuso autobrocante 12x3/4 (cento)", unidade: "cx", categoria: "Fixação", localizacao: "B-01", estoqueMinimo: d(5), entrada: [8, 32.5] },
  ];
  for (const { entrada, ...dados } of itens) {
    const item = await db.item.create({ data: dados });
    await registrarMovimentacao({
      itemId: item.id,
      tipo: "ENTRADA",
      quantidade: d(entrada[0]),
      custoUnitario: d(entrada[1]),
      fornecedorId: fornecedor.id,
      documento: "NF 1001",
    });
  }
  const tubo = await db.item.findUniqueOrThrow({ where: { codigo: "TB-RET-50" } });
  await registrarMovimentacao({ itemId: tubo.id, tipo: "SAIDA", quantidade: d(12), projetoId: projeto.id, responsavel: "João" });
  console.log(`Criados ${itens.length} itens de exemplo.`);
}

main().finally(() => db.$disconnect());
