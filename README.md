# Almoxarifado Celta

Aplicação web para o almoxarifado, feita para usar no celular: cadastro de itens, entradas, saídas, devoluções, ajuste de inventário, saldo e custo médio, histórico por projeto e etiquetas QR.

Esta é a fase 1 do plano. Identificação por foto e leitura de orçamentos com IA vêm na fase 2.

## Rodar localmente

Precisa de Node 20+ e PostgreSQL.

```bash
cp .env.example .env          # ajuste DATABASE_URL
npm install
npx prisma migrate deploy     # cria as tabelas
npm run seed                  # opcional: itens de exemplo
npm run dev                   # http://localhost:3000
```

A câmera do leitor de QR só funciona em `localhost` ou em HTTPS.

## Comandos

- `npm test`: testes das regras de saldo e custo médio
- `npm run lint`, `npm run build`

## Regras de estoque

Ficam em `src/lib/calculo.ts` e são aplicadas numa transação em `src/lib/estoque.ts`:

- **Entrada**: soma ao saldo e recalcula o custo médio ponderado com o custo da compra.
- **Saída**: exige projeto de destino, baixa pelo custo médio e não deixa o saldo ficar negativo.
- **Devolução**: volta ao estoque pelo custo médio atual.
- **Ajuste**: o saldo passa a ser a quantidade contada no inventário.

## Etiquetas QR

Cada etiqueta grava o endereço `/c/CODIGO` do item. Lida pela câmera do celular, abre o item direto no navegador. Lida pelo leitor do app durante uma entrada ou saída, volta direto ao formulário. Códigos de barras de fabricante também são aceitos pelo campo "Código de barras" do item.

## Ainda não tem

- Login e perfis de usuário (não publicar na internet sem isso)
- Foto do item, importação de itens por planilha
- Fase 2: identificação por foto e leitura de orçamentos com Claude
