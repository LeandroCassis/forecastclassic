
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
    user_id int NULL,
    username varchar(100) NULL,
    user_fullname varchar(100) NULL,
    modified_at datetime NULL,
    PRIMARY KEY (produto_codigo, ano, id_tipo, mes),
    FOREIGN KEY (produto_codigo) REFERENCES produtos(codigo),
    FOREIGN KEY (ano, id_tipo) REFERENCES grupos(ano, id_tipo)
);

-- Verificar se as colunas existem, caso contrário adicionar
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'forecast_values' AND COLUMN_NAME = 'user_id')
BEGIN
    ALTER TABLE forecast_values ADD user_id int NULL;
END;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'forecast_values' AND COLUMN_NAME = 'username')
BEGIN
    ALTER TABLE forecast_values ADD username varchar(100) NULL;
END;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'forecast_values' AND COLUMN_NAME = 'user_fullname')
BEGIN
    ALTER TABLE forecast_values ADD user_fullname varchar(100) NULL;
END;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'forecast_values' AND COLUMN_NAME = 'modified_at')
BEGIN
    ALTER TABLE forecast_values ADD modified_at datetime NULL;
END;

-- Tabela de usuários
CREATE TABLE usuarios (
    id int IDENTITY(1,1) PRIMARY KEY,
    username nvarchar(100) NOT NULL UNIQUE,
    password_hash nvarchar(255) NOT NULL,
    nome nvarchar(100),
    role nvarchar(50) DEFAULT 'user',
    created_at datetime DEFAULT GETDATE(),
    last_login datetime
);

-- Tabela de logs de alterações nos valores do forecast
CREATE TABLE forecast_values_log (
    id int IDENTITY(1,1) PRIMARY KEY,
    produto_codigo varchar(50) NOT NULL,
    ano int NOT NULL,
    id_tipo int NOT NULL,
    mes varchar(3) NOT NULL,
    valor_anterior decimal(18,2),
    valor_novo decimal(18,2) NOT NULL,
    user_id int,
    username varchar(100),
    user_fullname varchar(100),
    modified_at datetime DEFAULT GETDATE(),
    FOREIGN KEY (produto_codigo) REFERENCES produtos(codigo)
);

-- Adicionar a coluna user_fullname para a tabela de log se não existir
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'forecast_values_log' AND COLUMN_NAME = 'user_fullname')
BEGIN
    ALTER TABLE forecast_values_log ADD user_fullname varchar(100) NULL;
END;
