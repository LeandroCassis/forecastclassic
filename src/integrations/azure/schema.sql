-- Tabela de produtos
CREATE TABLE produtos (
    codigo varchar(50) PRIMARY KEY,
    produto varchar(100) NOT NULL
);

-- Atualizar a tabela produtos
ALTER TABLE produtos ADD
    created_at datetime NULL,
    data_atualizacao_fob datetime NULL,
    empresa varchar(100) NOT NULL DEFAULT '',
    estoque decimal(18,2) NULL,
    fabrica varchar(100) NOT NULL DEFAULT '',
    familia1 varchar(100) NOT NULL DEFAULT '',
    familia2 varchar(100) NOT NULL DEFAULT '',
    fob decimal(18,2) NULL,
    indice decimal(18,2) NULL,
    marca varchar(100) NOT NULL DEFAULT '',
    moedafob varchar(10) NULL,
    preco_venda decimal(18,2) NULL,
    updated_at datetime NULL;

-- Tabela de grupos
CREATE TABLE grupos (
    ano int NOT NULL,
    id_tipo int NOT NULL,
    tipo varchar(50) NOT NULL,
    code varchar(50) NOT NULL,
    PRIMARY KEY (ano, id_tipo)
);

-- Tabela de configurações mensais
CREATE TABLE month_configurations (
    ano int NOT NULL,
    mes varchar(3) NOT NULL,
    pct_atual decimal(5,2) NOT NULL,
    realizado bit NOT NULL,
    PRIMARY KEY (ano, mes)
);

-- Tabela de valores do forecast
CREATE TABLE forecast_values (
    produto_codigo varchar(50) NOT NULL,
    ano int NOT NULL,
    id_tipo int NOT NULL,
    mes varchar(3) NOT NULL,
    valor decimal(18,2) NOT NULL,
    PRIMARY KEY (produto_codigo, ano, id_tipo, mes),
    FOREIGN KEY (produto_codigo) REFERENCES produtos(codigo),
    FOREIGN KEY (ano, id_tipo) REFERENCES grupos(ano, id_tipo)
);