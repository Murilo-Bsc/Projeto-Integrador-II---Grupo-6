INSERT INTO paciente (nome, cpf, rg, data_nascimento, nome_pai, nome_mae, telefone, endereco, cidade, cep)
VALUES ('Maria da Silva', '12345678900', '11.111.111-1', DATE '1968-03-14', 'João da Silva', 'Ana da Silva', '(19) 91111-1111', 'Rua das Flores, 100, Centro', 'Campinas', '13010-000');
INSERT INTO paciente (nome, cpf, rg, data_nascimento, nome_pai, nome_mae, telefone, endereco, cidade, cep)
VALUES ('Carlos Lima', '98765432100', '22.222.222-2', DATE '1990-09-02', NULL, 'Rita Lima', '(19) 92222-2222', 'Av. Brasil, 250, Jardim Paulista', 'Campinas', '13020-000');
INSERT INTO paciente (nome, cpf, rg, data_nascimento, nome_pai, nome_mae, telefone, endereco, cidade, cep)
VALUES ('Ana Souza', '11122233344', '33.333.333-3', DATE '1985-12-25', 'Pedro Souza', 'Lúcia Souza', NULL, 'Rua Azul, 45, Vila Nova', 'Valinhos', '13270-000');
INSERT INTO paciente (nome, cpf, rg, data_nascimento, nome_pai, nome_mae, telefone, endereco, cidade, cep)
VALUES ('Paulo Mendes', '55566677788', '44.444.444-4', DATE '2001-06-07', 'Luiz Mendes', 'Marta Mendes', '(19) 94444-4444', 'Rua Verde, 12, Taquaral', 'Campinas', '13070-000');
INSERT INTO paciente (nome, cpf, rg, data_nascimento, nome_pai, nome_mae, telefone, endereco, cidade, cep)
VALUES ('José Pereira', '99988877766', '55.555.555-5', DATE '1975-01-30', 'Antônio Pereira', 'Clara Pereira', NULL, 'Rua do Sol, 78, Bosque', 'Campinas', '13026-000');

INSERT INTO atendimento (numero, id_paciente, queixa_inicial, status)
VALUES ('AT' || LPAD(seq_atendimento.NEXTVAL, 4, '0'), (SELECT id_paciente FROM paciente WHERE cpf = '12345678900'), 'Dor no peito', 'AGUARDANDO_MEDICO');
INSERT INTO atendimento (numero, id_paciente, queixa_inicial, status)
VALUES ('AT' || LPAD(seq_atendimento.NEXTVAL, 4, '0'), (SELECT id_paciente FROM paciente WHERE cpf = '98765432100'), 'Dor de cabeça', 'AGUARDANDO_TRIAGEM');
INSERT INTO atendimento (numero, id_paciente, queixa_inicial, status)
VALUES ('AT' || LPAD(seq_atendimento.NEXTVAL, 4, '0'), (SELECT id_paciente FROM paciente WHERE cpf = '11122233344'), 'Dor muscular', 'CONFIRMADO');
INSERT INTO atendimento (numero, id_paciente, queixa_inicial, status)
VALUES ('AT' || LPAD(seq_atendimento.NEXTVAL, 4, '0'), (SELECT id_paciente FROM paciente WHERE cpf = '55566677788'), 'Dor abdominal', 'AGUARDANDO_MEDICO');
INSERT INTO atendimento (numero, id_paciente, queixa_inicial, status)
VALUES ('AT' || LPAD(seq_atendimento.NEXTVAL, 4, '0'), (SELECT id_paciente FROM paciente WHERE cpf = '99988877766'), 'Náusea', 'AGUARDANDO_TRIAGEM');

INSERT INTO triagem (numero_atendimento, queixas, pressao, temperatura, batimentos, cor_risco)
VALUES ('AT0001', 'Dor no peito e suor excessivo', '150/95', 36.8, 110, 'vermelho');
INSERT INTO triagem (numero_atendimento, queixas, pressao, temperatura, batimentos, cor_risco)
VALUES ('AT0003', 'Dor muscular', '120/80', 36.5, 78, 'verde');
INSERT INTO triagem (numero_atendimento, queixas, pressao, temperatura, batimentos, cor_risco)
VALUES ('AT0004', 'Dor abdominal e náusea', '125/85', 37.4, 92, 'amarelo');

INSERT INTO consulta_medica (numero_atendimento, medicacoes, observacoes)
VALUES ('AT0003', 'Ibuprofeno 400 mg, via oral', 'Repouso por 3 dias');

COMMIT;
