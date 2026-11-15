const express = require('express');
const banco = require('../banco');
const {
  ErroNegocio,
  textoStatus,
  podeAlterar,
  somenteNumeros,
  formatarCpf,
  limpar,
  validarPaciente
} = require('../util');

const router = express.Router();

async function buscarAtendimento(numero) {
  const [atendimento] = await banco.consultar(
    `SELECT A.NUMERO, A.STATUS, A.QUEIXA_INICIAL AS QUEIXA,
            P.NOME, P.CPF, P.RG, TO_CHAR(P.DATA_NASCIMENTO, 'YYYY-MM-DD') AS NASCIMENTO,
            P.NOME_PAI AS PAI, P.NOME_MAE AS MAE, P.TELEFONE, P.ENDERECO, P.CIDADE, P.CEP
       FROM ATENDIMENTO A
       JOIN PACIENTE P ON P.ID_PACIENTE = A.ID_PACIENTE
      WHERE A.NUMERO = :numero`,
    { numero }
  );
  return atendimento;
}

async function buscarAtendimentoExistente(numero) {
  const atendimento = await buscarAtendimento(numero);

  if (!atendimento) {
    throw new ErroNegocio('Atendimento não encontrado.');
  }

  return atendimento;
}

function prepararAtendimento(atendimento) {
  return {
    ...atendimento,
    cpf: formatarCpf(atendimento.cpf),
    situacao: textoStatus(atendimento.status),
    alteravel: podeAlterar(atendimento.status)
  };
}

function dadosDoPaciente(dados) {
  return {
    nome: dados.nome,
    cpf: somenteNumeros(dados.cpf),
    rg: dados.rg,
    nascimento: dados.nascimento,
    pai: dados.pai,
    mae: dados.mae,
    telefone: dados.telefone,
    endereco: dados.endereco,
    cidade: dados.cidade,
    cep: dados.cep
  };
}

async function atualizarPaciente(idPaciente, dados, conexao) {
  await banco.executar(
    `UPDATE PACIENTE
        SET NOME = :nome, CPF = :cpf, RG = :rg,
            DATA_NASCIMENTO = TO_DATE(:nascimento, 'YYYY-MM-DD'),
            NOME_PAI = :pai, NOME_MAE = :mae, TELEFONE = :telefone,
            ENDERECO = :endereco, CIDADE = :cidade, CEP = :cep
      WHERE ID_PACIENTE = :id`,
    { ...dadosDoPaciente(dados), id: idPaciente },
    conexao
  );
}

async function salvarPaciente(dados, conexao) {
  const cpf = somenteNumeros(dados.cpf);
  const [existente] = await banco.consultar(
    'SELECT ID_PACIENTE FROM PACIENTE WHERE CPF = :cpf',
    { cpf },
    conexao
  );

  if (existente) {
    await atualizarPaciente(existente.id_paciente, dados, conexao);
    return existente.id_paciente;
  }

  const resultado = await banco.executar(
    `INSERT INTO PACIENTE (NOME, CPF, RG, DATA_NASCIMENTO, NOME_PAI, NOME_MAE, TELEFONE, ENDERECO, CIDADE, CEP)
     VALUES (:nome, :cpf, :rg, TO_DATE(:nascimento, 'YYYY-MM-DD'), :pai, :mae, :telefone, :endereco, :cidade, :cep)
     RETURNING ID_PACIENTE INTO :id`,
    { ...dadosDoPaciente(dados), id: banco.saidaNumero },
    conexao
  );
  return resultado.outBinds.id[0];
}

router.get('/', async (req, res) => {
  const busca = String(req.query.busca || '').trim();
  const filtro = busca ? 'WHERE UPPER(P.NOME) LIKE :nome OR A.NUMERO = :numero OR P.CPF = :cpf' : '';
  const binds = busca
    ? { nome: `%${busca.toUpperCase()}%`, numero: busca.toUpperCase(), cpf: somenteNumeros(busca) }
    : {};

  const atendimentos = await banco.consultar(
    `SELECT A.NUMERO, A.STATUS, P.NOME, P.CPF,
            TO_CHAR(P.DATA_NASCIMENTO, 'DD/MM/YYYY') AS NASCIMENTO
       FROM ATENDIMENTO A
       JOIN PACIENTE P ON P.ID_PACIENTE = A.ID_PACIENTE
       ${filtro}
      ORDER BY A.DATA_CHEGADA DESC
      FETCH FIRST 100 ROWS ONLY`,
    binds
  );

  res.json(atendimentos.map(prepararAtendimento));
});

router.get('/:numero', async (req, res) => {
  const atendimento = await buscarAtendimentoExistente(req.params.numero);
  res.json(prepararAtendimento(atendimento));
});

router.post('/', async (req, res) => {
  const dados = limpar(req.body);
  validarPaciente(dados);

  const numero = await banco.transacao(async (conexao) => {
    const idPaciente = await salvarPaciente(dados, conexao);
    const resultado = await banco.executar(
      `INSERT INTO ATENDIMENTO (NUMERO, ID_PACIENTE, QUEIXA_INICIAL)
       VALUES ('AT' || LPAD(SEQ_ATENDIMENTO.NEXTVAL, 4, '0'), :idPaciente, :queixa)
       RETURNING NUMERO INTO :numero`,
      { idPaciente, queixa: dados.queixa, numero: banco.saidaTexto },
      conexao
    );
    return resultado.outBinds.numero[0];
  });

  res.status(201).json({ numero });
});

router.put('/:numero', async (req, res) => {
  const numero = req.params.numero;
  const dados = limpar(req.body);
  validarPaciente(dados);

  await banco.transacao(async (conexao) => {
    const alterado = await banco.executar(
      `UPDATE ATENDIMENTO
          SET QUEIXA_INICIAL = :queixa
        WHERE NUMERO = :numero
          AND STATUS IN ('AGUARDANDO_TRIAGEM', 'AGUARDANDO_MEDICO')`,
      { queixa: dados.queixa, numero },
      conexao
    );

    if (alterado.rowsAffected === 0) {
      throw new ErroNegocio('Este atendimento não existe ou não pode mais ser alterado.');
    }

    const [atendimento] = await banco.consultar(
      'SELECT ID_PACIENTE FROM ATENDIMENTO WHERE NUMERO = :numero',
      { numero },
      conexao
    );
    await atualizarPaciente(atendimento.id_paciente, dados, conexao);
  });

  res.json({ numero });
});

router.post('/:numero/cancelar', async (req, res) => {
  const numero = req.params.numero;
  const motivo = limpar(req.body).motivo;

  if (!motivo) {
    throw new ErroNegocio('Informe o motivo do cancelamento.');
  }

  const cancelado = await banco.executar(
    `UPDATE ATENDIMENTO
        SET STATUS = 'CANCELADO', MOTIVO_CANCELAMENTO = :motivo
      WHERE NUMERO = :numero
        AND STATUS IN ('AGUARDANDO_TRIAGEM', 'AGUARDANDO_MEDICO')`,
    { motivo, numero }
  );

  if (cancelado.rowsAffected === 0) {
    throw new ErroNegocio('Este atendimento não existe ou não pode mais ser cancelado.');
  }

  res.json({ numero });
});

module.exports = router;
