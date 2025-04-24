/**
 * Controlador para gerenciamento de clientes
 * Implementa a lógica de negócios para operações de clientes
 */

const ClientService = require('../services/clientService');
const TerraformService = require('../services/terraformService');

// Obter todos os clientes com paginação e filtros
exports.getAllClients = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const clients = await ClientService.getAllClients(page, limit, search, status);
    res.status(200).json(clients);
  } catch (error) {
    next(error);
  }
};

// Obter um cliente específico pelo ID
exports.getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = await ClientService.getClientById(id);
    
    if (!client) {
      return res.status(404).json({ error: true, message: 'Cliente não encontrado' });
    }
    
    res.status(200).json(client);
  } catch (error) {
    next(error);
  }
};

// Criar novo cliente e inicializar infraestrutura de backup
exports.createClient = async (req, res, next) => {
  try {
    const clientData = req.body;
    
    // Validação de dados do cliente
    if (!clientData.name || !clientData.email) {
      return res.status(400).json({ error: true, message: 'Nome e email são obrigatórios' });
    }
    
    // Criar cliente no banco de dados
    const newClient = await ClientService.createClient(clientData);
    
    // Inicializar infraestrutura de backup com Terraform
    // Este processo é assíncrono e será monitorado
    const terraformJob = await TerraformService.initializeClientInfrastructure(newClient);
    
    res.status(201).json({ 
      message: 'Cliente criado com sucesso. Infraestrutura sendo provisionada.',
      client: newClient,
      jobId: terraformJob.id
    });
  } catch (error) {
    next(error);
  }
};

// Atualizar cliente existente
exports.updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clientData = req.body;
    
    // Verificar se o cliente existe
    const existingClient = await ClientService.getClientById(id);
    if (!existingClient) {
      return res.status(404).json({ error: true, message: 'Cliente não encontrado' });
    }
    
    // Atualizar cliente
    const updatedClient = await ClientService.updateClient(id, clientData);
    
    // Se a configuração de backup foi alterada, atualizar infraestrutura
    if (clientData.backupConfig && JSON.stringify(existingClient.backupConfig) !== JSON.stringify(clientData.backupConfig)) {
      // Atualizar infraestrutura é assíncrono
      const terraformJob = await TerraformService.updateClientInfrastructure(updatedClient);
      
      return res.status(200).json({
        message: 'Cliente atualizado com sucesso. Infraestrutura sendo atualizada.',
        client: updatedClient,
        jobId: terraformJob.id
      });
    }
    
    res.status(200).json({
      message: 'Cliente atualizado com sucesso.',
      client: updatedClient
    });
  } catch (error) {
    next(error);
  }
};

// Excluir cliente
exports.deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar se o cliente existe
    const existingClient = await ClientService.getClientById(id);
    if (!existingClient) {
      return res.status(404).json({ error: true, message: 'Cliente não encontrado' });
    }
    
    // Remover infraestrutura primeiro (de forma assíncrona)
    const terraformJob = await TerraformService.destroyClientInfrastructure(existingClient);
    
    // Marcar cliente como "em processo de exclusão"
    await ClientService.markClientForDeletion(id);
    
    res.status(200).json({
      message: 'Cliente marcado para exclusão. Infraestrutura sendo removida.',
      jobId: terraformJob.id
    });
  } catch (error) {
    next(error);
  }
};

// Obter estatísticas de backup do cliente
exports.getClientBackupStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const stats = await ClientService.getClientBackupStats(id);
    
    if (!stats) {
      return res.status(404).json({ error: true, message: 'Estatísticas não encontradas' });
    }
    
    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

// Obter custos do cliente
exports.getClientCosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    const costs = await ClientService.getClientCosts(id, startDate, endDate);
    
    res.status(200).json(costs);
  } catch (error) {
    next(error);
  }
};

