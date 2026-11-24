const mensagensDeSucesso = {
  cadastrado: (numero) => `Atendimento ${numero} cadastrado com sucesso.`,
  alterado: (numero) => `Atendimento ${numero} alterado com sucesso.`,
  cancelado: (numero) => `Atendimento ${numero} cancelado.`,
  confirmado: (numero) => `Atendimento ${numero} confirmado com sucesso.`
};

async function chamarApi(url, metodo = 'GET', dados) {
  const opcoes = { method: metodo, headers: { 'Content-Type': 'application/json' } };

  if (dados) {
    opcoes.body = JSON.stringify(dados);
  }

  const resposta = await fetch(url, opcoes);
  const corpo = await resposta.json();

  if (!resposta.ok) {
    throw new Error(corpo.erro);
  }

  return corpo;
}

function parametro(nome) {
  return new URLSearchParams(location.search).get(nome);
}

function mostrarMensagem(texto, classe = 'mensagem') {
  const caixa = document.getElementById('mensagem');
  caixa.className = classe;
  caixa.textContent = texto;
  window.scrollTo(0, 0);
}

function mostrarErro(erro) {
  if (erro instanceof TypeError) {
    mostrarMensagem('Não foi possível conectar ao servidor.', 'aviso');
  } else {
    mostrarMensagem(erro.message, 'aviso');
  }
}

function mostrarMensagemDaUrl() {
  const criarMensagem = mensagensDeSucesso[parametro('ok')];

  if (criarMensagem) {
    mostrarMensagem(criarMensagem(parametro('numero')));
  }
}

function criarLinha(conteudos) {
  const linha = document.createElement('tr');

  for (const conteudo of conteudos) {
    const celula = document.createElement('td');
    celula.append(conteudo);
    linha.append(celula);
  }

  return linha;
}

function criarLinhaVazia(colunas, texto) {
  const linha = document.createElement('tr');
  const celula = document.createElement('td');

  celula.colSpan = colunas;
  celula.className = 'vazio';
  celula.textContent = texto;
  linha.append(celula);

  return linha;
}

function criarLink(texto, endereco, classes) {
  const link = document.createElement('a');

  link.textContent = texto;
  link.href = endereco;
  link.className = classes;

  return link;
}

function criarEtiquetaRisco(cor, nome) {
  const etiqueta = document.createElement('span');

  etiqueta.className = `risco ${cor}`;
  etiqueta.textContent = nome;

  return etiqueta;
}
