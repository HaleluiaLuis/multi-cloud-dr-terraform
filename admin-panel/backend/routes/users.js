/**
 * Rotas para gerenciamento de usuários e autenticação
 */

const express = require('express');
const router = express.Router();
const {
  login,
  getProfile,
  updateProfile,
  changePassword,
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  resetUserPassword
} = require('../controllers/userController');
const auth = require('../middleware/auth');

// Rotas públicas
router.post('/login', login);

// Rotas protegidas (requerem autenticação)
router.get('/me', auth, getProfile);
router.put('/me', auth, updateProfile);
router.post('/me/change-password', auth, changePassword);

// Rotas de administração (apenas admin)
router.post('/', auth, createUser);
router.get('/', auth, getAllUsers);
router.get('/:id', auth, getUserById);
router.put('/:id', auth, updateUser);
router.post('/:id/reset-password', auth, resetUserPassword);

module.exports = router;