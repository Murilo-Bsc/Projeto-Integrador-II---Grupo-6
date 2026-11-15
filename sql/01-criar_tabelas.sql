CREATE SEQUENCE seq_atendimento
  START WITH 1
  INCREMENT BY 1
  MAXVALUE 9999
  NOCACHE;

CREATE TABLE classificacao_risco (
  cor              VARCHAR2(10)      NOT NULL,
  nome             VARCHAR2(40 CHAR) NOT NULL,
  prioridade       NUMBER(1)         NOT NULL,
  tempo_maximo_min NUMBER(3)         NOT NULL,
  CONSTRAINT pk_classificacao_risco PRIMARY KEY (cor),
  CONSTRAINT uk_classificacao_prioridade UNIQUE (prioridade)
);

CREATE TABLE paciente (
  id_paciente     NUMBER GENERATED ALWAYS AS IDENTITY,
  nome            VARCHAR2(120 CHAR) NOT NULL,
  cpf             VARCHAR2(11)       NOT NULL,
  rg              VARCHAR2(20)       NOT NULL,
  data_nascimento DATE               NOT NULL,
  nome_pai        VARCHAR2(120 CHAR),
  nome_mae        VARCHAR2(120 CHAR) NOT NULL,
  telefone        VARCHAR2(20),
  endereco        VARCHAR2(200 CHAR) NOT NULL,
  cidade          VARCHAR2(80 CHAR)  NOT NULL,
  cep             VARCHAR2(9),
  CONSTRAINT pk_paciente PRIMARY KEY (id_paciente),
  CONSTRAINT uk_paciente_cpf UNIQUE (cpf)
);

CREATE TABLE atendimento (
  numero              VARCHAR2(6)         NOT NULL,
  id_paciente         NUMBER              NOT NULL,
  data_chegada        DATE DEFAULT SYSDATE NOT NULL,
  queixa_inicial      VARCHAR2(500 CHAR),
  status              VARCHAR2(20) DEFAULT 'AGUARDANDO_TRIAGEM' NOT NULL,
  motivo_cancelamento VARCHAR2(300 CHAR),
  CONSTRAINT pk_atendimento PRIMARY KEY (numero),
  CONSTRAINT fk_atendimento_paciente FOREIGN KEY (id_paciente) REFERENCES paciente (id_paciente),
  CONSTRAINT ck_atendimento_status CHECK (status IN ('AGUARDANDO_TRIAGEM', 'AGUARDANDO_MEDICO', 'CONFIRMADO', 'CANCELADO'))
);

CREATE TABLE triagem (
  numero_atendimento VARCHAR2(6)         NOT NULL,
  queixas            VARCHAR2(500 CHAR)  NOT NULL,
  pressao            VARCHAR2(7)         NOT NULL,
  temperatura        NUMBER(3,1)         NOT NULL,
  batimentos         NUMBER(3)           NOT NULL,
  cor_risco          VARCHAR2(10)        NOT NULL,
  data_triagem       DATE DEFAULT SYSDATE NOT NULL,
  CONSTRAINT pk_triagem PRIMARY KEY (numero_atendimento),
  CONSTRAINT fk_triagem_atendimento FOREIGN KEY (numero_atendimento) REFERENCES atendimento (numero),
  CONSTRAINT fk_triagem_risco FOREIGN KEY (cor_risco) REFERENCES classificacao_risco (cor)
);

CREATE TABLE consulta_medica (
  numero_atendimento VARCHAR2(6)          NOT NULL,
  medicacoes         VARCHAR2(1000 CHAR)  NOT NULL,
  observacoes        VARCHAR2(1000 CHAR),
  data_confirmacao   DATE DEFAULT SYSDATE NOT NULL,
  CONSTRAINT pk_consulta_medica PRIMARY KEY (numero_atendimento),
  CONSTRAINT fk_consulta_atendimento FOREIGN KEY (numero_atendimento) REFERENCES atendimento (numero)
);

CREATE INDEX ix_atendimento_status ON atendimento (status);
CREATE INDEX ix_atendimento_paciente ON atendimento (id_paciente);
