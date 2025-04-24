/**
 * Serviço para gerenciamento de jobs de backup e restauração
 */

const Job = require('../models/Job');
const { NotFoundError, ValidationError } = require('../utils/errors');

// Criar um novo job
exports.createJob = async (jobData) => {
  try {
    const job = new Job(jobData);
    await job.save();
    return job;
  } catch (error) {
    console.error('Erro ao criar job:', error);
    throw error;
  }
};

// Obter um job pelo ID
exports.getJobById = async (jobId) => {
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      throw new NotFoundError(`Job não encontrado com ID: ${jobId}`);
    }
    return job;
  } catch (error) {
    console.error(`Erro ao buscar job ${jobId}:`, error);
    throw error;
  }
};

// Listar todos os jobs com paginação
exports.listJobs = async (options = {}) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      clientId = null, 
      status = null, 
      type = null,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;
    
    // Construir a query
    const query = {};
    if (clientId) query.clientId = clientId;
    if (status) query.status = status;
    if (type) query.type = type;
    
    // Ordenação
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const result = await Job.paginate(query, {
      page,
      limit,
      sort,
      populate: 'clientId'
    });
    
    return result;
  } catch (error) {
    console.error('Erro ao listar jobs:', error);
    throw error;
  }
};

// Atualizar um job
exports.updateJob = async (jobId, updateData) => {
  try {
    const job = await Job.findByIdAndUpdate(
      jobId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!job) {
      throw new NotFoundError(`Job não encontrado com ID: ${jobId}`);
    }
    
    return job;
  } catch (error) {
    console.error(`Erro ao atualizar job ${jobId}:`, error);
    throw error;
  }
};

// Marcar um job como iniciado
exports.markJobStarted = async (jobId) => {
  try {
    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        status: 'Em Progresso',
        startedAt: new Date()
      },
      { new: true }
    );
    
    if (!job) {
      throw new NotFoundError(`Job não encontrado com ID: ${jobId}`);
    }
    
    return job;
  } catch (error) {
    console.error(`Erro ao marcar job ${jobId} como iniciado:`, error);
    throw error;
  }
};

// Marcar um job como concluído
exports.markJobCompleted = async (jobId, result = null) => {
  try {
    const updateData = {
      status: 'Sucesso',
      completedAt: new Date()
    };
    
    if (result) {
      updateData.result = result;
    }
    
    const job = await Job.findByIdAndUpdate(
      jobId,
      updateData,
      { new: true }
    );
    
    if (!job) {
      throw new NotFoundError(`Job não encontrado com ID: ${jobId}`);
    }
    
    return job;
  } catch (error) {
    console.error(`Erro ao marcar job ${jobId} como concluído:`, error);
    throw error;
  }
};

// Marcar um job como falha
exports.markJobFailed = async (jobId, errorMessage) => {
  try {
    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        status: 'Falha',
        completedAt: new Date(),
        errorMessage: errorMessage
      },
      { new: true }
    );
    
    if (!job) {
      throw new NotFoundError(`Job não encontrado com ID: ${jobId}`);
    }
    
    return job;
  } catch (error) {
    console.error(`Erro ao marcar job ${jobId} como falha:`, error);
    throw error;
  }
};

// Marcar um job como sucesso parcial
exports.markJobPartialSuccess = async (jobId, result, errorMessage) => {
  try {
    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        status: 'Sucesso Parcial',
        completedAt: new Date(),
        result: result,
        errorMessage: errorMessage
      },
      { new: true }
    );
    
    if (!job) {
      throw new NotFoundError(`Job não encontrado com ID: ${jobId}`);
    }
    
    return job;
  } catch (error) {
    console.error(`Erro ao marcar job ${jobId} como sucesso parcial:`, error);
    throw error;
  }
};

// Cancelar um job
exports.cancelJob = async (jobId, reason = 'Cancelado pelo usuário') => {
  try {
    const job = await Job.findById(jobId);
    
    if (!job) {
      throw new NotFoundError(`Job não encontrado com ID: ${jobId}`);
    }
    
    // Verificar se o job pode ser cancelado
    if (['Sucesso', 'Falha', 'Cancelado', 'Sucesso Parcial'].includes(job.status)) {
      throw new ValidationError(`Não é possível cancelar um job com status: ${job.status}`);
    }
    
    job.status = 'Cancelado';
    job.completedAt = new Date();
    job.errorMessage = reason;
    
    await job.save();
    
    return job;
  } catch (error) {
    console.error(`Erro ao cancelar job ${jobId}:`, error);
    throw error;
  }
};

// Buscar os últimos jobs por cliente
exports.getLatestJobsByClient = async (clientId, limit = 5) => {
  try {
    const jobs = await Job.find({ clientId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return jobs;
  } catch (error) {
    console.error(`Erro ao buscar últimos jobs para cliente ${clientId}:`, error);
    throw error;
  }
};

// Contar jobs por status
exports.countJobsByStatus = async (clientId = null) => {
  try {
    const matchStage = clientId ? { clientId } : {};
    
    const result = await Job.aggregate([
      { $match: matchStage },
      { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Transformar o resultado em um objeto
    const counts = {};
    result.forEach(item => {
      counts[item._id] = item.count;
    });
    
    return counts;
  } catch (error) {
    console.error('Erro ao contar jobs por status:', error);
    throw error;
  }
};

// Obter estatísticas de jobs (duração média, taxa de sucesso, etc.)
exports.getJobStats = async (clientId = null, jobType = null, period = 30) => {
  try {
    const matchStage = {};
    if (clientId) matchStage.clientId = clientId;
    if (jobType) matchStage.type = jobType;
    
    // Considerar apenas jobs dos últimos X dias
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    matchStage.createdAt = { $gte: startDate };
    
    const result = await Job.aggregate([
      { $match: matchStage },
      { $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgDuration: {
            $avg: {
              $cond: [
                { $and: [
                    { $ne: ['$completedAt', null] },
                    { $ne: ['$startedAt', null] }
                  ]
                },
                { $subtract: ['$completedAt', '$startedAt'] },
                null
              ]
            }
          }
        }
      }
    ]);
    
    // Calcular estatísticas
    let totalJobs = 0;
    let successJobs = 0;
    let totalDuration = 0;
    let durationCount = 0;
    
    const stats = { byStatus: {} };
    
    result.forEach(item => {
      totalJobs += item.count;
      if (['Sucesso', 'Sucesso Parcial'].includes(item._id)) {
        successJobs += item.count;
      }
      
      stats.byStatus[item._id] = {
        count: item.count,
        avgDurationMs: item.avgDuration
      };
      
      if (item.avgDuration) {
        totalDuration += (item.avgDuration * item.count);
        durationCount += item.count;
      }
    });
    
    stats.totalJobs = totalJobs;
    stats.successRate = totalJobs > 0 ? (successJobs / totalJobs) * 100 : 0;
    stats.avgDurationMs = durationCount > 0 ? totalDuration / durationCount : 0;
    
    return stats;
  } catch (error) {
    console.error('Erro ao obter estatísticas de jobs:', error);
    throw error;
  }
};

// Listar jobs de backup mais recentes para cada cliente
exports.getLatestBackupJobs = async (limit = 10) => {
  try {
    // Agrupar por cliente e pegar o backup mais recente para cada um
    const result = await Job.aggregate([
      { $match: { type: 'backup' } },
      { $sort: { createdAt: -1 } },
      { $group: {
          _id: '$clientId',
          job: { $first: '$$ROOT' }
        }
      },
      { $replaceRoot: { newRoot: '$job' } },
      { $limit: limit }
    ]);
    
    // Popular as referências ao cliente
    const populatedJobs = await Job.populate(result, { path: 'clientId' });
    
    return populatedJobs;
  } catch (error) {
    console.error('Erro ao obter jobs de backup mais recentes:', error);
    throw error;
  }
};

// Encontrar backups disponíveis para restauração
exports.findBackupsForRestore = async (clientId, options = {}) => {
  try {
    const { 
      provider = null, 
      status = 'Sucesso', 
      days = 30,
      limit = 10
    } = options;
    
    // Data de início para busca
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Construir a query
    const query = {
      clientId,
      type: 'backup',
      status,
      createdAt: { $gte: startDate }
    };
    
    if (provider) {
      query.provider = provider;
    }
    
    // Buscar backups disponíveis
    const backups = await Job.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return backups;
  } catch (error) {
    console.error(`Erro ao buscar backups para restauração do cliente ${clientId}:`, error);
    throw error;
  }
};

