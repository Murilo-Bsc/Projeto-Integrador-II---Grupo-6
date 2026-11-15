const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const saidaTexto = { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 20 };
const saidaNumero = { type: oracledb.NUMBER, dir: oracledb.BIND_OUT };

let pool;

async function iniciar() {
  pool = await oracledb.createPool({
    user: process.env.DB_USUARIO,
    password: process.env.DB_SENHA,
    connectString: process.env.DB_STRING
  });
}

async function executar(sql, binds = {}, conexao) {
  if (conexao) {
    return conexao.execute(sql, binds);
  }

  const propria = await pool.getConnection();
  try {
    return await propria.execute(sql, binds, { autoCommit: true });
  } finally {
    await propria.close();
  }
}

async function consultar(sql, binds = {}, conexao) {
  const resultado = await executar(sql, binds, conexao);
  return resultado.rows.map((linha) => {
    const minuscula = {};
    for (const coluna in linha) {
      minuscula[coluna.toLowerCase()] = linha[coluna];
    }
    return minuscula;
  });
}

async function transacao(operacoes) {
  const conexao = await pool.getConnection();
  try {
    const resultado = await operacoes(conexao);
    await conexao.commit();
    return resultado;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    await conexao.close();
  }
}

module.exports = { iniciar, executar, consultar, transacao, saidaTexto, saidaNumero };