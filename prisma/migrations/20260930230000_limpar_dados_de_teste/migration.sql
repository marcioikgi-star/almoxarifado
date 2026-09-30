-- Limpeza única dos dados de teste, pedida pelo Márcio em 30/09/2026.
-- Por ser migração, o Prisma aplica só uma vez; publicações futuras não apagam nada.
-- Mantém usuários, sessões e unidades de medida.
DELETE FROM "Movimentacao";
DELETE FROM "Item";
DELETE FROM "Projeto";
DELETE FROM "Fornecedor";
