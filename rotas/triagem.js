const express = require('express');
const banco = require('../banco');
const { ErroNegocio, limpar, validarTriagem } = require('../util');

const router = express.Router();

router.get('/fila', async (req, res) => {
  const fila = await banco.consultar(
    `SELECT A.NUMERO, P.NOME
       FROM ATENDIMENTO A
       JOIN PACIENTE P ON P.ID_PACIENTE = A.ID_PACIENTE
      WHERE A.STATUS = 'AGUARDANDO_TRIAGEM'
      ORDER BY A.DATA_CHEGADA`
  );

  res.json(fila);
});

router.post('/', async (req, res) => {
  const dados = limpar(req.body);
  validarTriagem(dados);

  await banco.transacao(async (conexao) => {
    const atualizado = await banco.executar(
      `UPDATE ATENDIMENTO
          SET STATUS = 'AGUARDANDO_MEDICO'
        WHERE NUMERO = :numero
          AND STATUS = 'AGUARDANDO_TRIAGEM'`,
      { numero: dados.paciente },
      conexao
    );

    if (atualizado.rowsAffected === 0) {
      throw new ErroNegocio('Este atendimento não está aguardando triagem.');
    }

    await banco.executar(
      `INSERT INTO TRIAGEM (NUMERO_ATENDIMENTO, QUEIXAS, PRESSAO, TEMPERATURA, BATIMENTOS, COR_RISCO)
       VALUES (:numero, :queixas, :pressao, :temperatura, :batimentos, :risco)`,
      {
        numero: dados.paciente,
        queixas: dados.queixas,
        pressao: dados.pressao,
        temperatura: Number(dados.temperatura),
        batimentos: Number(dados.batimentos),
        risco: dados.risco
      },
      conexao
    );
  });

  res.status(201).json({ numero: dados.paciente });
});

module.exports = router;
