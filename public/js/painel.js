const lista = document.getElementById('lista');

mostrarMensagemDaUrl();
carregarPainel();

async function carregarPainel() {
  try {
    const atendimentos = await chamarApi('/api/painel');

    lista.replaceChildren();

    for (const atendimento of atendimentos) {
      lista.append(criarLinha([
        atendimento.numero,
        atendimento.nome,
        atendimento.nascimento,
        criarEtiquetaRisco(atendimento.cor, atendimento.risco),
        atendimento.queixas,
        atendimento.chegada,
        criarLink('Atender', `atendimento.html?id=${encodeURIComponent(atendimento.numero)}`, 'botao botao-pequeno')
      ]));
    }

    if (atendimentos.length === 0) {
      lista.append(criarLinhaVazia(7, 'Não há pacientes aguardando o médico.'));
    }
  } catch (erro) {
    mostrarErro(erro);
  }
}
