INSERT INTO classificacao_risco (cor, nome, prioridade, tempo_maximo_min) VALUES ('vermelho', 'Vermelho - Emergência', 1, 0);
INSERT INTO classificacao_risco (cor, nome, prioridade, tempo_maximo_min) VALUES ('laranja', 'Laranja - Muito urgente', 2, 10);
INSERT INTO classificacao_risco (cor, nome, prioridade, tempo_maximo_min) VALUES ('amarelo', 'Amarelo - Urgente', 3, 60);
INSERT INTO classificacao_risco (cor, nome, prioridade, tempo_maximo_min) VALUES ('verde', 'Verde - Pouco urgente', 4, 120);
INSERT INTO classificacao_risco (cor, nome, prioridade, tempo_maximo_min) VALUES ('azul', 'Azul - Não urgente', 5, 240);

COMMIT;
