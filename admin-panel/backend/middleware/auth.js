/**
 * Middleware de autenticação
 * Valida o token JWT nas requisições
 */

const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { AuthenticationError } = require('../utils/errors');

module.exports = (req, res, next) => {
  try {
    // Para o desenvolvimento, permitir bypass da autenticação
    if (config.env === 'development' && process.env.BYPASS_AUTH === 'true') {
      req.user = { id: 'admin', role: 'admin' };
      return next();
    }

    // Verificar se há um token no header de autorização
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Token de acesso não fornecido');
    }

    // Extrair o token
    const token = authHeader.split(' ')[1];

    // Verificar o token
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Adicionar informações do usuário à requisição
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AuthenticationError('Token inválido'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AuthenticationError('Token expirado'));
    }
    next(error);
  }
};

