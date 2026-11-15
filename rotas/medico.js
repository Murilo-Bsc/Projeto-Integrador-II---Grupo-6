const express = require('express');
const banco = require('../banco');
const { ErroNegocio, limpar } = require('../util');

const router = express.Router();

async function buscarParaAtender(numero) {
  const [atendimento] = await banco.consultar(
    `SELECT A.NUMERO, P.NOME, TO_CHAR(P.DATA_NASCIMENTO, 'DD/MM/YYYY') AS NASCIMENTO,
            R.COR, R.NOME AS RISCO, T.QUEIXAS, T.PRESSAO, T.TEMPERATURA, T.BATIMENTOS
       FROM ATENDIMENTO A
       JOIN PACIENTE P ON P.ID_PACIENTE = A.ID_PACIENTE
       JOIN TRIAGEM T ON T.NUMERO_ATENDIMENTO = A.NUMERO
       JOIN CLASSIFICACAO_RISCO R ON R.COR = T.COR_RISCO
      WHERE A.NUMERO = :numero
        AND A.STATUS = 'AGUARDANDO_MEDICO'`,
    { numero }
  );

  if (!atendimento) {
    throw new ErroNegocio('Atendimento não encontrado ou não está aguardando o médico.');
  }

  return atendimento;
}

router.get('/', async (req, res) => {
  const atendimentos = await banco.consultar(
    `SELECT A.NUMERO, P.NOME, TO_CHAR(P.DATA_NASCIMENTO, 'DD/MM/YYYY') AS NASCIMENTO,
            R.COR, R.NOME AS RISCO, T.QUEIXAS,
            TO_CHAR(A.DATA_CHEGADA, 'DD/MM HH24:MI') AS CHEGADA
       FROM ATENDIMENTO A
       JOIN PACIENTE P ON P.ID_PACIENTE = A.ID_PACIENTE
       JOIN TRIAGEM T ON T.NUMERO_ATENDIMENTO = A.NUMERO
       JOIN CLASSIFICACAO_RISCO R ON R.COR = T.COR_RISCO
      WHERE A.STATUS = 'AGUARDANDO_MEDICO'
      ORDER BY R.PRIORIDADE, A.DATA_CHEGADA`
  );

  res.json(atendimentos);
});

router.get('/:numero', async (req, res) => {
  res.json(await buscarParaAtender(req.params.numero));
});

router.post('/:numero/confirmar', async (req, res) => {
  const numero = req.params.numero;
  const dados = limpar(req.body);

  if (!dados.medicacoes) {
    throw new ErroNegocio('Informe as medicações.');
  }

  await banco.transacao(async (conexao) => {
    const confirmado = await banco.executar(
      `UPDATE ATENDIMENTO
          SET STATUS = 'CONFIRMADO'
        WHERE NUMERO = :numero
          AND STATUS = 'AGUARDANDO_MEDICO'`,
      { numero },
      conexao
    );

    if (confirmado.rowsAffected === 0) {
      throw new ErroNegocio('Este atendimento não está aguardando o médico.');
    }

    await banco.executar(
      `INSERT INTO CONSULTA_MEDICA (NUMERO_ATENDIMENTO, MEDICACOES, OBSERVACOES)
       VALUES (:numero, :medicacoes, :observacoes)`,
      { numero, medicacoes: dados.medicacoes, observacoes: dados.observacoes },
      conexao
    );
  });

  res.json({ numero });
});

module.exports = router;
