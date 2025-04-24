/**
 * Configuração da conexão com o banco de dados MongoDB
 */

const mongoose = require('mongoose');
const config = require('../config/config');

// Conexão com o MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.database.uri, config.database.options);
    console.log(`MongoDB conectado: ${conn.connection.host}`);
    
    // Registrar manipuladores de eventos para a conexão
    mongoose.connection.on('error', err => {
      console.error('Erro na conexão com MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('Desconectado do MongoDB');
    });
    
    // Lidar com a finalização do processo
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('Conexão com MongoDB encerrada devido ao encerramento da aplicação');
      process.exit(0);
    });
    
    return conn;
  } catch (error) {
    console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;