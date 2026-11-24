const numero = parametro('id');
const formulario = document.getElementById('formulario');

formulario.addEventListener('submit', cancelar);
carregarAtendimento();

async function carregarAtendimento() {
  try {
    const atendimento = await chamarApi(`/api/recepcao/${encodeURIComponent(numero)}`);

    if (!atendimento.alteravel) {
      formulario.hidden = true;
      mostrarMensagem('Este atendimento já foi confirmado ou cancelado e não pode mais ser cancelado.', 'aviso');
    }

    document.getElementById('numero').textContent = atendimento.numero;
    document.getElementById('nome').textContent = atendimento.nome;
    document.getElementById('cpf').textContent = atendimento.cpf;
    document.getElementById('situacao').textContent = atendimento.situacao;
  } catch (erro) {
    formulario.hidden = true;
    mostrarErro(erro);
  }
}

async function cancelar(evento) {
  evento.preventDefault();
  const dados = Object.fromEntries(new FormData(formulario));

  try {
    await chamarApi(`/api/recepcao/${encodeURIComponent(numero)}/cancelar`, 'POST', dados);
    location.href = `index.html?ok=cancelado&numero=${encodeURIComponent(numero)}`;
  } catch (erro) {
    mostrarErro(erro);
  }
}
