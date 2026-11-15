class ErroNegocio extends Error {}

const textosStatus = {
  AGUARDANDO_TRIAGEM: 'Aguardando triagem',
  AGUARDANDO_MEDICO: 'Aguardando médico',
  CONFIRMADO: 'Confirmado',
  CANCELADO: 'Cancelado'
};

function textoStatus(status) {
  return textosStatus[status];
}

function podeAlterar(status) {
  return status === 'AGUARDANDO_TRIAGEM' || status === 'AGUARDANDO_MEDICO';
}

function somenteNumeros(texto) {
  return String(texto).replace(/\D/g, '');
}

function formatarCpf(cpf) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function limpar(corpo) {
  const dados = {};
  for (const campo in corpo) {
    dados[campo] = String(corpo[campo]).trim();
  }
  return dados;
}

function validarPaciente(dados) {
  const obrigatorios = {
    nome: 'Nome completo',
    cpf: 'CPF',
    rg: 'RG',
    nascimento: 'Data de nascimento',
    mae: 'Nome da mãe',
    endereco: 'Endereço',
    cidade: 'Cidade'
  };

  for (const campo in obrigatorios) {
    if (!dados[campo]) {
      throw new ErroNegocio(`Preencha o campo "${obrigatorios[campo]}".`);
    }
  }

  if (somenteNumeros(dados.cpf).length !== 11) {
    throw new ErroNegocio('O CPF deve ter 11 números.');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dados.nascimento)) {
    throw new ErroNegocio('Data de nascimento inválida.');
  }

  if (dados.nascimento > new Date().toISOString().slice(0, 10)) {
    throw new ErroNegocio('A data de nascimento não pode ser futura.');
  }
}

function validarTriagem(dados) {
  if (!dados.paciente) {
    throw new ErroNegocio('Selecione o paciente.');
  }

  if (!dados.queixas) {
    throw new ErroNegocio('Informe as principais queixas.');
  }

  if (!/^\d{2,3}\/\d{2,3}$/.test(dados.pressao)) {
    throw new ErroNegocio('Pressão arterial inválida. Use o formato 120/80.');
  }

  const temperatura = Number(dados.temperatura);
  if (!(temperatura >= 30 && temperatura <= 45)) {
    throw new ErroNegocio('Temperatura inválida. Informe um valor entre 30 e 45 °C.');
  }

  const batimentos = Number(dados.batimentos);
  if (!Number.isInteger(batimentos) || batimentos < 20 || batimentos > 250) {
    throw new ErroNegocio('Batimentos inválidos. Informe um valor entre 20 e 250 bpm.');
  }

  if (!dados.risco) {
    throw new ErroNegocio('Selecione a classificação de risco.');
  }
}

function descreverErro(erro) {
  if (erro instanceof ErroNegocio) {
    return { status: 400, mensagem: erro.message };
  }

  if (erro.errorNum === 1) {
    return { status: 400, mensagem: 'Já existe um paciente cadastrado com este CPF.' };
  }

  if (erro.errorNum === 2291) {
    return { status: 400, mensagem: 'Classificação de risco inválida.' };
  }

  console.error(erro);
  return { status: 500, mensagem: 'Erro inesperado. Tente novamente.' };
}

module.exports = {
  ErroNegocio,
  textoStatus,
  podeAlterar,
  somenteNumeros,
  formatarCpf,
  limpar,
  validarPaciente,
  validarTriagem,
  descreverErro
};
