/**
 * Serviço para gerenciamento de clientes
 * Implementa a lógica de negócios para operações de clientes
 */

const Client = require('../models/Client');
const BackupJob = require('../models/Job');
const CloudProviderService = require('./cloudProviderService');
const mongoose = require('mongoose');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Obter todos os clientes com opções de paginação e filtros
 */
exports.getAllClients = async (page = 1, limit = 10, search = '', status = null) => {
  const query = {};
  
  // Aplicar filtro de pesquisa
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Aplicar filtro de status
  if (status) {
    query.status = status;
  }
  
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    lean: true
  };
  
  // Usando o plugin de paginação do mongoose
  const result = await Client.paginate(query, options);
  
  return {
    clients: result.docs,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page
  };
};

/**
 * Obter um cliente específico pelo ID
 */
exports.getClientById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const client = await Client.findById(id).lean();
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  return { client };
};

/**
 * Criar novo cliente
 */
exports.createClient = async (clientData) => {
  // Verificar se já existe um cliente com o mesmo email
  const existingClient = await Client.findOne({ email: clientData.email });
  
  if (existingClient) {
    throw new ValidationError('Já existe um cliente com este email');
  }
  
  // Definir valores padrão
  const newClient = new Client({
    ...clientData,
    status: clientData.status || 'Ativo',
    createdAt: new Date(),
    backupConfig: {
      ...clientData.backupConfig,
      frequency: clientData.backupConfig?.frequency || 'Diário',
      retention: clientData.backupConfig?.retention || '30 dias',
      type: clientData.backupConfig?.type || 'Incremental'
    }
  });
  
  await newClient.save();
  return newClient;
};

/**
 * Atualizar cliente existente
 */
exports.updateClient = async (id, clientData) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  // Verificar se existe
  const client = await Client.findById(id);
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  // Se estiver mudando o email, verificar se já existe outro cliente com este email
  if (clientData.email && clientData.email !== client.email) {
    const existingClient = await Client.findOne({ email: clientData.email });
    
    if (existingClient && String(existingClient._id) !== id) {
      throw new ValidationError('Já existe um cliente com este email');
    }
  }
  
  // Atualizar cliente
  Object.keys(clientData).forEach(key => {
    if (key !== '_id' && key !== 'createdAt') {
      if (key === 'backupConfig' && clientData[key]) {
        // Mesclar configurações de backup
        client.backupConfig = {
          ...client.backupConfig,
          ...clientData[key]
        };
      } else {
        client[key] = clientData[key];
      }
    }
  });
  
  client.updatedAt = new Date();
  await client.save();
  
  return client;
};

/**
 * Marcar cliente para exclusão
 */
exports.markClientForDeletion = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const client = await Client.findById(id);
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  client.status = 'Em Exclusão';
  client.updatedAt = new Date();
  await client.save();
  
  return client;
};

/**
 * Excluir cliente definitivamente
 * Esta função só deve ser chamada depois que o Terraform tiver destruído a infraestrutura
 */
exports.deleteClientPermanently = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const result = await Client.deleteOne({ _id: id });
  
  if (result.deletedCount === 0) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  return { success: true };
};

/**
 * Obter estatísticas de backup de um cliente
 */
exports.getClientBackupStats = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const client = await Client.findById(id);
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  // Calcular estatísticas de backups
  const backupJobs = await BackupJob.find({ 
    clientId: id, 
    type: 'backup'
  }).sort({ createdAt: -1 }).limit(30);
  
  // Último backup bem-sucedido
  const lastSuccessfulBackup = await BackupJob.findOne({
    clientId: id,
    type: 'backup',
    status: 'Sucesso'
  }).sort({ completedAt: -1 });
  
  // Calcular taxa de sucesso
  const totalJobs = backupJobs.length;
  const successfulJobs = backupJobs.filter(job => job.status === 'Sucesso').length;
  const successRate = totalJobs > 0 ? (successfulJobs / totalJobs) * 100 : 0;
  
  // Obter tamanho total de dados
  const totalDataSize = await CloudProviderService.getClientTotalDataSize(id);
  
  // Média de tempo para backup
  const completedJobs = backupJobs.filter(job => 
    job.status === 'Sucesso' && job.startedAt && job.completedAt
  );
  
  let avgDuration = 0;
  if (completedJobs.length > 0) {
    const totalDuration = completedJobs.reduce((sum, job) => {
      const duration = (job.completedAt - job.startedAt) / 1000; // em segundos
      return sum + duration;
    }, 0);
    avgDuration = totalDuration / completedJobs.length;
  }
  
  return {
    totalBackups: await BackupJob.countDocuments({ clientId: id, type: 'backup' }),
    successRate,
    totalDataSize,
    lastBackupDate: lastSuccessfulBackup?.completedAt || null,
    avgDuration,
    recentJobs: backupJobs.map(job => ({
      id: job._id,
      type: job.type,
      status: job.status,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      dataSize: job.dataSize
    }))
  };
};

/**
 * Obter custos de um cliente
 */
exports.getClientCosts = async (id, startDate, endDate) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const client = await Client.findById(id);
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  // Converter datas se fornecidas
  const startDateTime = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const endDateTime = endDate ? new Date(endDate) : new Date();
  
  // Obter custo dos provedores de nuvem
  const costs = await CloudProviderService.getClientCosts(id, client.providers, startDateTime, endDateTime);
  
  return {
    period: {
      start: startDateTime,
      end: endDateTime
    },
    costs
  };
};

/**
 * Obter histórico de backups de um cliente
 */
exports.getClientBackupHistory = async (id, page = 1, limit = 10) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    lean: true
  };
  
  const result = await BackupJob.paginate({ clientId: id, type: 'backup' }, options);
  
  return {
    history: result.docs.map(job => ({
      id: job._id,
      date: job.startedAt || job.createdAt,
      status: job.status,
      size: job.dataSize || 0,
      duration: job.completedAt && job.startedAt ? 
        Math.round((job.completedAt - job.startedAt) / (1000 * 60)) + ' min' : 'N/A',
      provider: job.provider,
      type: job.backupType
    })),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page
  };
};

/**
 * Obter recursos protegidos de um cliente
 */
exports.getClientResources = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const client = await Client.findById(id);
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  // Obter recursos dos provedores de nuvem
  const resources = await CloudProviderService.getClientResources(id, client.providers);
  
  return { resources };
};

/**
 * Iniciar backup manual
 */
exports.startManualBackup = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const client = await Client.findById(id);
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  if (client.status !== 'Ativo') {
    throw new ValidationError('Não é possível iniciar backup para um cliente inativo');
  }
  
  // Criar um novo job de backup
  const backupJob = new BackupJob({
    clientId: id,
    type: 'backup',
    status: 'Pendente',
    backupType: client.backupConfig.type,
    createdAt: new Date(),
    isManual: true
  });
  
  await backupJob.save();
  
  // Iniciar processo de backup em segundo plano
  CloudProviderService.startBackup(client, backupJob._id)
    .catch(err => console.error(`Erro ao iniciar backup para cliente ${id}:`, err));
  
  return {
    message: 'Backup iniciado com sucesso',
    jobId: backupJob._id
  };
};

/**
 * Iniciar teste de restauração
 */
exports.startRestoreTest = async (id, backupId = null) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const client = await Client.findById(id);
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  // Se um backupId específico foi fornecido, verificar se existe
  let targetBackupJob = null;
  if (backupId) {
    if (!mongoose.Types.ObjectId.isValid(backupId)) {
      throw new ValidationError('ID de backup inválido');
    }
    
    targetBackupJob = await BackupJob.findOne({
      _id: backupId,
      clientId: id,
      type: 'backup',
      status: 'Sucesso'
    });
    
    if (!targetBackupJob) {
      throw new NotFoundError('Backup não encontrado ou não está disponível para restauração');
    }
  } else {
    // Usar o backup mais recente bem-sucedido
    targetBackupJob = await BackupJob.findOne({
      clientId: id,
      type: 'backup',
      status: 'Sucesso'
    }).sort({ completedAt: -1 });
    
    if (!targetBackupJob) {
      throw new ValidationError('Não há backups bem-sucedidos disponíveis para teste');
    }
  }
  
  // Criar um novo job de restauração
  const restoreJob = new BackupJob({
    clientId: id,
    type: 'restore',
    status: 'Pendente',
    backupType: 'Teste',
    sourceBackupId: targetBackupJob._id,
    createdAt: new Date(),
    provider: targetBackupJob.provider
  });
  
  await restoreJob.save();
  
  // Iniciar processo de restauração em segundo plano
  CloudProviderService.startRestoreTest(client, targetBackupJob, restoreJob._id)
    .catch(err => console.error(`Erro ao iniciar teste de restauração para cliente ${id}:`, err));
  
  return {
    message: 'Teste de restauração iniciado com sucesso',
    jobId: restoreJob._id,
    sourceBackupId: targetBackupJob._id
  };
};

/**
 * Pausar backups para um cliente
 */
exports.pauseClientBackups = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const client = await Client.findById(id);
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  if (client.status !== 'Ativo') {
    throw new ValidationError('Cliente já está pausado ou em outro estado');
  }
  
  client.status = 'Pausado';
  client.updatedAt = new Date();
  await client.save();
  
  // Cancelar quaisquer backups pendentes
  await BackupJob.updateMany(
    { clientId: id, status: 'Pendente', type: 'backup' },
    { status: 'Cancelado', updatedAt: new Date() }
  );
  
  return {
    message: 'Backups pausados com sucesso',
    client
  };
};

/**
 * Retomar backups para um cliente
 */
exports.resumeClientBackups = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const client = await Client.findById(id);
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  if (client.status !== 'Pausado') {
    throw new ValidationError('Cliente não está pausado');
  }
  
  client.status = 'Ativo';
  client.updatedAt = new Date();
  await client.save();
  
  return {
    message: 'Backups retomados com sucesso',
    client
  };
};

/**
 * Obter linha do tempo de eventos de um cliente
 */
exports.getClientTimeline = async (id, limit = 10) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  // Combinação de jobs e eventos do cliente
  const backupJobs = await BackupJob.find({ clientId: id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  
  const client = await Client.findById(id).lean();
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  // Transformar jobs em eventos de linha do tempo
  const jobEvents = backupJobs.map(job => {
    let event, type;
    
    if (job.type === 'backup') {
      if (job.status === 'Sucesso') {
        event = 'Backup concluído com sucesso';
        type = 'success';
      } else if (job.status === 'Falha') {
        event = `Backup falhou - ${job.errorMessage || 'erro desconhecido'}`;
        type = 'error';
      } else if (job.status === 'Em Progresso') {
        event = 'Backup em andamento';
        type = 'info';
      } else if (job.status === 'Pendente') {
        event = 'Backup agendado';
        type = 'info';
      } else if (job.status === 'Cancelado') {
        event = 'Backup cancelado';
        type = 'warning';
      }
    } else if (job.type === 'restore') {
      if (job.status === 'Sucesso') {
        event = 'Teste de restauração concluído com sucesso';
        type = 'success';
      } else if (job.status === 'Falha') {
        event = `Teste de restauração falhou - ${job.errorMessage || 'erro desconhecido'}`;
        type = 'error';
      } else if (job.status === 'Em Progresso') {
        event = 'Teste de restauração em andamento';
        type = 'info';
      } else if (job.status === 'Pendente') {
        event = 'Teste de restauração agendado';
        type = 'info';
      }
    }
    
    return {
      id: job._id,
      date: job.completedAt || job.startedAt || job.createdAt,
      event,
      type
    };
  });
  
  // Adicionar evento de criação do cliente
  const creationEvent = {
    id: 'client-creation',
    date: client.createdAt,
    event: 'Cliente criado',
    type: 'info'
  };
  
  // Adicionar eventos de atualização do cliente, se houver
  const updateEvents = [];
  if (client.updatedAt && client.updatedAt !== client.createdAt) {
    updateEvents.push({
      id: 'client-update-' + new Date(client.updatedAt).getTime(),
      date: client.updatedAt,
      event: 'Configuração de backup modificada',
      type: 'info'
    });
  }
  
  // Combinar todos os eventos e ordenar por data (do mais recente para o mais antigo)
  const allEvents = [...jobEvents, ...updateEvents, creationEvent];
  allEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return {
    timeline: allEvents.slice(0, limit)
  };
};