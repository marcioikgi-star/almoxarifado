-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE', 'DEVOLUCAO');

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT,
    "unidade" TEXT NOT NULL DEFAULT 'un',
    "codigoBarras" TEXT,
    "fabricante" TEXT,
    "referencia" TEXT,
    "localizacao" TEXT,
    "estoqueMinimo" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "saldo" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "custoMedio" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fornecedor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT,
    "contato" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cliente" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Projeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimentacao" (
    "id" TEXT NOT NULL,
    "tipo" "TipoMovimentacao" NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantidade" DECIMAL(14,3) NOT NULL,
    "custoUnitario" DECIMAL(14,4) NOT NULL,
    "saldoApos" DECIMAL(14,3) NOT NULL,
    "fornecedorId" TEXT,
    "projetoId" TEXT,
    "documento" TEXT,
    "responsavel" TEXT,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movimentacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Item_codigo_key" ON "Item"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Item_codigoBarras_key" ON "Item"("codigoBarras");

-- CreateIndex
CREATE INDEX "Item_descricao_idx" ON "Item"("descricao");

-- CreateIndex
CREATE UNIQUE INDEX "Fornecedor_cnpj_key" ON "Fornecedor"("cnpj");

-- CreateIndex
CREATE INDEX "Movimentacao_itemId_criadoEm_idx" ON "Movimentacao"("itemId", "criadoEm");

-- CreateIndex
CREATE INDEX "Movimentacao_projetoId_idx" ON "Movimentacao"("projetoId");

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacao" ADD CONSTRAINT "Movimentacao_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
