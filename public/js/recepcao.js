const busca = parametro('busca') || '';
const lista = document.getElementById('lista');

document.getElementById('busca').value = busca;
mostrarMensagemDaUrl();
carregarAtendimentos();

async function carregarAtendimentos() {
  try {
    const atendimentos = await chamarApi(`/api/recepcao?busca=${encodeURIComponent(busca)}`);

    lista.replaceChildren();

    for (const atendimento of atendimentos) {
      lista.append(criarLinha([
        atendimento.numero,
        atendimento.nome,
        atendimento.cpf,
        atendimento.nascimento,
        atendimento.situacao,
        criarAcoes(atendimento)
      ]));
    }

    if (atendimentos.length === 0) {
      lista.append(criarLinhaVazia(6, 'Nenhum atendimento encontrado.'));
    }
  } catch (erro) {
    mostrarErro(erro);
  }
}

function criarAcoes(atendimento) {
  const acoes = document.createElement('span');

  if (!atendimento.alteravel) {
    acoes.className = 'vazio';
    acoes.textContent = `Atendimento ${atendimento.situacao.toLowerCase()}`;
    return acoes;
  }

  const numero = encodeURIComponent(atendimento.numero);
  acoes.append(
    criarLink('Alterar', `cadastro.html?id=${numero}`, 'botao botao-pequeno'),
    ' ',
    criarLink('Cancelar', `cancelar.html?id=${numero}`, 'botao botao-pequeno botao-perigo')
  );
  return acoes;
}
