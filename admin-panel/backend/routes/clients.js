/**
 * Rotas para gerenciamento de clientes
 * Estas rotas gerenciam o CRUD de clientes e suas configurações de backup
 */

const express = require('express');
const router = express.Router();
const { 
  getAllClients, 
  getClientById, 
  createClient, 
  updateClient, 
  deleteClient,
  getClientBackupStats,
  getClientCosts
} = require('../controllers/clientController');

const {
  startManualDRTest,
  getDRComplianceReport,
  getDRTestHistory
} = require('../controllers/drController');

const {
  getDetailedCostReport,
  getCostForecast,
  getCostEfficiencyReport,
  getResourceCosts,
  getCostComparison
} = require('../controllers/costController');

const {
  startRestore,
  getRestoreHistory,
  getRestoreStatus,
  cancelRestore
} = require('../controllers/restoreController');

// Middleware de autenticação (a ser implementado)
const auth = require('../middleware/auth');

// Obter todos os clientes
router.get('/', auth, getAllClients);

// Obter um cliente específico
router.get('/:id', auth, getClientById);

// Criar novo cliente
router.post('/', auth, createClient);

// Atualizar cliente existente
router.put('/:id', auth, updateClient);

// Excluir cliente
router.delete('/:id', auth, deleteClient);

// Estatísticas de backup do cliente
router.get('/:id/stats', auth, getClientBackupStats);

// Custo por cliente
router.get('/:id/costs', auth, getClientCosts);

// Rotas para testes de DR
// Iniciar teste de DR manual
router.post('/:id/dr-tests', auth, startManualDRTest);

// Obter relatório de conformidade de DR
router.get('/:id/dr-compliance', auth, getDRComplianceReport);

// Obter histórico de testes de DR
router.get('/:id/dr-tests', auth, getDRTestHistory);

// Rotas para controle de custos avançado
// Relatório detalhado de custos
router.get('/:id/costs/detailed', auth, getDetailedCostReport);

// Previsão de custos futuros
router.get('/:id/costs/forecast', auth, getCostForecast);

// Relatório de eficiência de custos
router.get('/:id/costs/efficiency', auth, getCostEfficiencyReport);

// Custos por recurso
router.get('/:id/costs/resources', auth, getResourceCosts);

// Comparação de custos entre múltiplos clientes
router.post('/costs/comparison', auth, getCostComparison);

// Rotas para restauração de backups
// Iniciar restauração
router.post('/:id/restore', auth, startRestore);

// Obter histórico de restaurações
router.get('/:id/restore-history', auth, getRestoreHistory);

// Obter status de uma restauração específica
router.get('/restore-status/:jobId', auth, getRestoreStatus);

// Cancelar uma restauração em andamento
router.post('/cancel-restore/:jobId', auth, cancelRestore);

module.exports = router;

