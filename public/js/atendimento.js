const numero = parametro('id');
const formulario = document.getElementById('formulario');

formulario.addEventListener('submit', confirmar);
carregarAtendimento();

async function carregarAtendimento() {
  try {
    const atendimento = await chamarApi(`/api/painel/${encodeURIComponent(numero)}`);

    document.getElementById('numero').textContent = atendimento.numero;
    document.getElementById('nome').textContent = atendimento.nome;
    document.getElementById('nascimento').textContent = atendimento.nascimento;
    document.getElementById('risco').className = `risco ${atendimento.cor}`;
    document.getElementById('risco').textContent = atendimento.risco;
    document.getElementById('queixas').textContent = atendimento.queixas;
    document.getElementById('pressao').textContent = atendimento.pressao;
    document.getElementById('temperatura').textContent = String(atendimento.temperatura).replace('.', ',');
    document.getElementById('batimentos').textContent = atendimento.batimentos;
  } catch (erro) {
    formulario.hidden = true;
    mostrarErro(erro);
  }
}

async function confirmar(evento) {
  evento.preventDefault();
  const dados = Object.fromEntries(new FormData(formulario));

  try {
    await chamarApi(`/api/painel/${encodeURIComponent(numero)}/confirmar`, 'POST', dados);
    location.href = `painel.html?ok=confirmado&numero=${encodeURIComponent(numero)}`;
  } catch (erro) {
    mostrarErro(erro);
  }
}
