const numero = parametro('id');
const formulario = document.getElementById('formulario');

formulario.addEventListener('submit', salvar);

if (numero) {
  carregarAtendimento();
}

async function carregarAtendimento() {
  try {
    const atendimento = await chamarApi(`/api/recepcao/${encodeURIComponent(numero)}`);

    if (!atendimento.alteravel) {
      formulario.hidden = true;
      mostrarMensagem('Este atendimento já foi confirmado ou cancelado e não pode mais ser alterado.', 'aviso');
      return;
    }

    document.getElementById('titulo').textContent = `Alterar atendimento ${atendimento.numero}`;

    for (const campo of formulario.elements) {
      if (campo.name) {
        campo.value = atendimento[campo.name] ?? '';
      }
    }
  } catch (erro) {
    formulario.hidden = true;
    mostrarErro(erro);
  }
}

async function salvar(evento) {
  evento.preventDefault();
  const dados = Object.fromEntries(new FormData(formulario));

  try {
    if (numero) {
      await chamarApi(`/api/recepcao/${encodeURIComponent(numero)}`, 'PUT', dados);
      location.href = `index.html?ok=alterado&numero=${encodeURIComponent(numero)}`;
    } else {
      const resposta = await chamarApi('/api/recepcao', 'POST', dados);
      location.href = `index.html?ok=cadastrado&numero=${encodeURIComponent(resposta.numero)}`;
    }
  } catch (erro) {
    mostrarErro(erro);
  }
}
