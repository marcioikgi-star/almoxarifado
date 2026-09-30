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
ADMIN_EMAIL=voce@empresa.com.br ADMIN_NOME="Seu Nome" ADMIN_SENHA='senha-provisoria' npm run criar-admin
npm run dev                   # http://localhost:3000
```

O `criar-admin` grava só o hash da senha e marca como provisória: no primeiro acesso o sistema pede uma senha nova. Rodar de novo com o mesmo e-mail redefine a senha desse administrador.

A câmera do leitor de QR só funciona em `localhost` ou em HTTPS.

## Publicar (Vercel + Supabase)

1. No Supabase, crie um projeto (região São Paulo) e copie as duas conexões em **Connect › ORMs › Prisma**.
2. Na Vercel, importe este repositório e cadastre as variáveis de ambiente: `DATABASE_URL`, `DIRECT_URL`, `ADMIN_EMAIL`, `ADMIN_NOME` e `ADMIN_SENHA` (veja `.env.example`). Dá para colar o conteúdo inteiro do `.env` no primeiro campo; depois clique em **Create Project**.
   Se o projeto for criado sem publicar, qualquer envio novo ao ramo `main` dispara a publicação (ou use **Deployments › ⋯ › Create Deployment**).
3. A cada publicação a Vercel roda `npm run vercel-build`: aplica as migrações no banco, cria o administrador inicial se ainda não houver nenhum usuário, e gera o site.
4. Depois de entrar e trocar a senha, `ADMIN_SENHA` pode ser apagada da Vercel.

## Comandos

- `npm test`: testes das regras de saldo e custo médio
- `npm run lint`, `npm run build`

## Regras de estoque

Ficam em `src/lib/calculo.ts` e são aplicadas numa transação em `src/lib/estoque.ts`:

- **Entrada**: soma ao saldo e recalcula o custo médio ponderado com o custo da compra.
- **Saída**: exige projeto de destino, baixa pelo custo médio e não deixa o saldo ficar negativo.
- **Devolução**: volta ao estoque pelo custo médio atual.
- **Ajuste**: o saldo passa a ser a quantidade contada no inventário.

## Login e usuários

- Todas as telas exigem login; sem sessão, o usuário vai para `/login`.
- Senhas guardadas com scrypt (sal aleatório); sessões de 30 dias em cookie `httpOnly`, com só o hash do token no banco.
- Cinco senhas erradas seguidas bloqueiam o usuário por 15 minutos.
- Perfis: **Administrador** (cadastra usuários, define senha provisória, desativa acessos em Cadastros › Usuários) e **Almoxarife**.
- Senha provisória (novo usuário ou redefinida) precisa ser trocada no primeiro acesso. Trocar a senha encerra as outras sessões.
- Cada movimentação registra quem lançou.

## Etiquetas QR

Cada etiqueta grava o endereço `/c/CODIGO` do item. Lida pela câmera do celular, abre o item direto no navegador. Lida pelo leitor do app durante uma entrada ou saída, volta direto ao formulário. Códigos de barras de fabricante também são aceitos pelo campo "Código de barras" do item.

## Ainda não tem

- Foto do item, importação de itens por planilha
- Fase 2: identificação por foto e leitura de orçamentos com Claude
