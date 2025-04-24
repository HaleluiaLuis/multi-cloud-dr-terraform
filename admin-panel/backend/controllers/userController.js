/**
 * Controlador para gerenciamento de usuários
 * Implementa a lógica de autenticação e gerenciamento de usuários
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { ValidationError, AuthenticationError, NotFoundError } = require('../utils/errors');

// Gerar token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    }, 
    config.jwt.secret, 
    { expiresIn: config.jwt.expiresIn }
  );
};

// Login de usuário
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Verificar se email e senha foram fornecidos
    if (!email || !password) {
      throw new ValidationError('Por favor, forneça email e senha');
    }

    // Buscar usuário pelo email (incluindo o campo senha)
    const user = await User.findOne({ email }).select('+password');

    // Verificar se o usuário existe
    if (!user) {
      throw new AuthenticationError('Credenciais inválidas');
    }

    // Verificar se a senha está correta
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      throw new AuthenticationError('Credenciais inválidas');
    }

    // Verificar se o usuário está ativo
    if (!user.isActive) {
      throw new AuthenticationError('Usuário desativado. Contate o administrador');
    }

    // Atualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Gerar token JWT
    const token = generateToken(user);

    // Enviar resposta
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obter perfil do usuário atual
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    next(error);
  }
};

// Atualizar perfil do usuário
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    // Verificar se o usuário existe
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Atualizar campos
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    next(error);
  }
};

// Alterar senha
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Verificar se as senhas foram fornecidas
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Por favor, forneça a senha atual e a nova senha');
    }

    // Buscar usuário (incluindo o campo senha)
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Verificar se a senha atual está correta
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      throw new ValidationError('Senha atual incorreta');
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    next(error);
  }
};

// Criar novo usuário (apenas admin)
exports.createUser = async (req, res, next) => {
  try {
    // Verificar se o usuário atual é admin
    if (req.user.role !== 'admin') {
      throw new AuthenticationError('Apenas administradores podem criar novos usuários');
    }

    const { name, email, password, role } = req.body;

    // Verificar se os campos obrigatórios foram fornecidos
    if (!name || !email || !password) {
      throw new ValidationError('Por favor, forneça nome, email e senha');
    }

    // Verificar se já existe um usuário com este email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ValidationError('Já existe um usuário com este email');
    }

    // Criar novo usuário
    const user = new User({
      name,
      email,
      password,
      role: role || 'user'
    });

    await user.save();

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Listar todos os usuários (apenas admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    // Verificar se o usuário atual é admin
    if (req.user.role !== 'admin') {
      throw new AuthenticationError('Apenas administradores podem listar usuários');
    }

    const users = await User.find().select('-__v');

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Obter usuário por ID (apenas admin)
exports.getUserById = async (req, res, next) => {
  try {
    // Verificar se o usuário atual é admin
    if (req.user.role !== 'admin') {
      throw new AuthenticationError('Apenas administradores podem ver detalhes de usuários');
    }

    const { id } = req.params;
    const user = await User.findById(id).select('-__v');

    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Atualizar usuário (apenas admin)
exports.updateUser = async (req, res, next) => {
  try {
    // Verificar se o usuário atual é admin
    if (req.user.role !== 'admin') {
      throw new AuthenticationError('Apenas administradores podem atualizar usuários');
    }

    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Atualizar campos
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    res.status(200).json({
      message: 'Usuário atualizado com sucesso',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// Definir nova senha (apenas admin)
exports.resetUserPassword = async (req, res, next) => {
  try {
    // Verificar se o usuário atual é admin
    if (req.user.role !== 'admin') {
      throw new AuthenticationError('Apenas administradores podem redefinir senhas');
    }

    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      throw new ValidationError('Por favor, forneça a nova senha');
    }

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Atualizar senha
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    next(error);
  }
};