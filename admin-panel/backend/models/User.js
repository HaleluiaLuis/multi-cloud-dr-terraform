/**
 * Modelo para usuários do sistema
 * Gerencia os dados dos usuários, autenticação e permissões
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'A senha deve ter pelo menos 6 caracteres'],
    select: false // Não retornar senha em consultas
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guest'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

// Método para comparar senhas para login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Criptografar a senha antes de salvar
userSchema.pre('save', async function(next) {
  // Somente criptografar a senha se foi modificada (ou é nova)
  if (!this.isModified('password')) return next();
  
  try {
    // Gerar salt
    const salt = await bcrypt.genSalt(10);
    // Hash da senha com o salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Atualizar o campo 'updatedAt' antes de salvar
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;