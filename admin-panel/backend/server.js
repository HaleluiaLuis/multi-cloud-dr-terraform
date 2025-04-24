/**
 * Servidor principal do painel de administração para o SaaS de Backup Multi-Cloud
 * Este servidor fornece uma API RESTful para gerenciar backups em múltiplos provedores de nuvem
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');

// Importar rotas
const clientsRoutes = require('./routes/clients');
const usersRoutes = require('./routes/users');
const dashboardRoutes = require('./routes/dashboard');
// Rotas adicionais serão carregadas conforme implementadas

const app = express();
const PORT = process.env.PORT || 3001;

// Conectar ao banco de dados
connectDB().then(() => {
  console.log('Banco de dados conectado com sucesso');
}).catch(err => {
  console.error('Erro ao conectar ao banco de dados', err);
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Permitir requisições do frontend
  credentials: true // Permitir cookies/sessões
}));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rotas da API
app.use('/api/clients', clientsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);
// Rotas adicionais serão ativadas conforme implementadas

// Rota de verificação de saúde
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: true,
    message: err.message || 'Erro interno do servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Acesse o painel em: http://localhost:${PORT}`);
});

module.exports = app;

