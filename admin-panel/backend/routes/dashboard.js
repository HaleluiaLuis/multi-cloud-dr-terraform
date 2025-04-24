/**
 * Rotas para o dashboard
 * Fornece endpoints para dados agregados usados no painel principal
 */

const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// Rota principal do dashboard - retorna todos os dados necessários
router.get('/', auth, getDashboardData);

module.exports = router;