require('dotenv').config();

const path = require('path');
const express = require('express');
const banco = require('./banco');
const { descreverErro } = require('./util');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/recepcao', require('./rotas/recepcao'));
app.use('/api/triagem', require('./rotas/triagem'));
app.use('/api/painel', require('./rotas/medico'));

app.use('/api', (req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use((erro, req, res, next) => {
  const { status, mensagem } = descreverErro(erro);
  res.status(status).json({ erro: mensagem });
});

const porta = process.env.PORT || 3000;

banco.iniciar()
  .then(() => {
    app.listen(porta, () => console.log(`Servidor rodando em http://localhost:${porta}`));
  })
  .catch((erro) => {
    console.error('Não foi possível conectar ao banco de dados:', erro.message);
    process.exit(1);
  });
