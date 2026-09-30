-- Cadastro de unidades de medida. Item.unidade passa a apontar para a sigla da unidade.

-- CreateTable
CREATE TABLE "UnidadeMedida" (
    "id" TEXT NOT NULL,
    "sigla" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "grupo" TEXT NOT NULL DEFAULT 'Outras',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnidadeMedida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnidadeMedida_sigla_key" ON "UnidadeMedida"("sigla");

-- Lista inicial (pode ser editada e ampliada em Cadastros › Unidades de medida)
INSERT INTO "UnidadeMedida" ("id", "sigla", "nome", "grupo") VALUES
    ('um_un',    'UN',    'Unidade',             'Contagem'),
    ('um_pc',    'PC',    'Peça',                'Contagem'),
    ('um_par',   'PAR',   'Par',                 'Contagem'),
    ('um_jg',    'JG',    'Jogo',                'Contagem'),
    ('um_cj',    'CJ',    'Conjunto',            'Contagem'),
    ('um_kit',   'KIT',   'Kit',                 'Contagem'),
    ('um_dz',    'DZ',    'Dúzia',               'Contagem'),
    ('um_cento', 'CENTO', 'Cento',               'Contagem'),
    ('um_mil',   'MIL',   'Milheiro',            'Contagem'),
    ('um_cx',    'CX',    'Caixa',               'Embalagem'),
    ('um_pct',   'PCT',   'Pacote',              'Embalagem'),
    ('um_sc',    'SC',    'Saco',                'Embalagem'),
    ('um_fd',    'FD',    'Fardo',               'Embalagem'),
    ('um_rl',    'RL',    'Rolo',                'Embalagem'),
    ('um_bob',   'BOB',   'Bobina',              'Embalagem'),
    ('um_lata',  'LATA',  'Lata',                'Embalagem'),
    ('um_gl',    'GL',    'Galão',               'Embalagem'),
    ('um_bd',    'BD',    'Balde',               'Embalagem'),
    ('um_tb',    'TB',    'Tambor',              'Embalagem'),
    ('um_fr',    'FR',    'Frasco',              'Embalagem'),
    ('um_tubo',  'TUBO',  'Tubo (bisnaga)',      'Embalagem'),
    ('um_cart',  'CART',  'Cartucho',            'Embalagem'),
    ('um_ctl',   'CTL',   'Cartela',             'Embalagem'),
    ('um_pal',   'PAL',   'Palete',              'Embalagem'),
    ('um_br',    'BR',    'Barra',               'Peças de estoque'),
    ('um_ch',    'CH',    'Chapa',               'Peças de estoque'),
    ('um_fl',    'FL',    'Folha',               'Peças de estoque'),
    ('um_pf',    'PF',    'Perfil',              'Peças de estoque'),
    ('um_mm',    'MM',    'Milímetro',           'Comprimento'),
    ('um_cm',    'CM',    'Centímetro',          'Comprimento'),
    ('um_m',     'M',     'Metro',               'Comprimento'),
    ('um_km',    'KM',    'Quilômetro',          'Comprimento'),
    ('um_pol',   'POL',   'Polegada',            'Comprimento'),
    ('um_pe',    'PE',    'Pé',                  'Comprimento'),
    ('um_cm2',   'CM2',   'Centímetro quadrado', 'Área'),
    ('um_m2',    'M2',    'Metro quadrado',      'Área'),
    ('um_ml',    'ML',    'Mililitro',           'Volume'),
    ('um_l',     'L',     'Litro',               'Volume'),
    ('um_m3',    'M3',    'Metro cúbico',        'Volume'),
    ('um_mg',    'MG',    'Miligrama',           'Massa'),
    ('um_g',     'G',     'Grama',               'Massa'),
    ('um_kg',    'KG',    'Quilograma',          'Massa'),
    ('um_t',     'T',     'Tonelada',            'Massa'),
    ('um_h',     'H',     'Hora',                'Tempo e serviço'),
    ('um_dia',   'DIA',   'Dia',                 'Tempo e serviço'),
    ('um_mes',   'MES',   'Mês',                 'Tempo e serviço'),
    ('um_sv',    'SV',    'Serviço',             'Tempo e serviço'),
    ('um_vb',    'VB',    'Verba',               'Tempo e serviço'),
    ('um_kwh',   'KWH',   'Quilowatt-hora',      'Outras');

-- Itens já cadastrados: troca a unidade digitada à mão pela sigla equivalente da lista
UPDATE "Item" SET "unidade" = CASE lower(trim("unidade"))
    WHEN 'pç' THEN 'PC'  WHEN 'pç.' THEN 'PC' WHEN 'peça' THEN 'PC' WHEN 'peca' THEN 'PC'
    WHEN 'unid' THEN 'UN' WHEN 'und' THEN 'UN' WHEN 'unidade' THEN 'UN'
    WHEN 'm²' THEN 'M2'  WHEN 'm³' THEN 'M3'
    WHEN 'rolo' THEN 'RL' WHEN 'barra' THEN 'BR' WHEN 'chapa' THEN 'CH' WHEN 'jogo' THEN 'JG'
    WHEN 'galão' THEN 'GL' WHEN 'galao' THEN 'GL' WHEN 'caixa' THEN 'CX' WHEN 'pacote' THEN 'PCT'
    WHEN 'lt' THEN 'L'   WHEN 'litro' THEN 'L' WHEN 'metro' THEN 'M'
    ELSE upper(trim("unidade"))
END;

-- Unidades usadas em itens que não estão na lista entram no cadastro como estão
INSERT INTO "UnidadeMedida" ("id", "sigla", "nome")
SELECT 'um_item_' || md5("unidade"), "unidade", "unidade"
FROM (SELECT DISTINCT "unidade" FROM "Item") u
ON CONFLICT ("sigla") DO NOTHING;

-- AlterTable
ALTER TABLE "Item" ALTER COLUMN "unidade" SET DEFAULT 'UN';

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_unidade_fkey" FOREIGN KEY ("unidade") REFERENCES "UnidadeMedida"("sigla") ON DELETE RESTRICT ON UPDATE CASCADE;
