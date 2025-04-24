/**
 * Script para criar um usuário administrador
 * Execute este script com: node create-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config/config');

// Definição do modelo de usuário para usar neste script
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
});

// Método para criptografar a senha
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

// Dados do administrador a ser criado
const adminUser = {
  name: 'Administrador',
  email: 'admin@backupdr.com',
  password: 'Admin@123',
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Função para conectar ao banco de dados e criar o usuário admin
async function createAdminUser() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(config.database.uri, config.database.options);
    console.log('Conectado ao MongoDB');

    // Verificar se já existe um usuário admin
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log(`Usuário admin já existe com o email: ${adminUser.email}`);
      console.log('Se precisar resetar a senha, use a opção de redefinição de senha no painel.');
    } else {
      // Criar novo usuário admin
      const newAdmin = new User(adminUser);
      await newAdmin.save();
      
      console.log('Usuário administrador criado com sucesso!');
      console.log('----------------------------------------');
      console.log('Email:', adminUser.email);
      console.log('Senha:', 'Admin@123');
      console.log('----------------------------------------');
      console.log('Use essas credenciais para fazer login no sistema.');
    }
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error.message);
  } finally {
    // Encerrar a conexão
    await mongoose.connection.close();
    console.log('Conexão com o MongoDB encerrada');
  }
}

// Executar a função principal
createAdminUser();