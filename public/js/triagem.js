const formulario = document.getElementById('formulario');
const selectPaciente = document.getElementById('paciente');

formulario.addEventListener('submit', registrar);
carregarFila();

async function carregarFila() {
  try {
    const fila = await chamarApi('/api/triagem/fila');

    selectPaciente.replaceChildren(new Option('Selecione', ''));

    for (const paciente of fila) {
      selectPaciente.append(new Option(`${paciente.numero} - ${paciente.nome}`, paciente.numero));
    }

    if (fila.length === 0) {
      mostrarMensagem('Não há pacientes aguardando triagem.', 'aviso');
    }
  } catch (erro) {
    mostrarErro(erro);
  }
}

async function registrar(evento) {
  evento.preventDefault();
  const dados = Object.fromEntries(new FormData(formulario));

  try {
    await chamarApi('/api/triagem', 'POST', dados);
    formulario.reset();
    await carregarFila();
    mostrarMensagem(`Triagem do atendimento ${dados.paciente} registrada. O paciente foi para o painel médico.`);
  } catch (erro) {
    mostrarErro(erro);
  }
}
