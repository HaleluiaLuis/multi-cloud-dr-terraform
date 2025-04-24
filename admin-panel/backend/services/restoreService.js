/**
 * Serviço para operações de restauração de backups
 * Gerencia a restauração de dados em cenários de disaster recovery
 */

const Client = require('../models/Client');
const BackupJob = require('../models/Job');
const CloudProviderService = require('./cloudProviderService');
const TerraformService = require('./terraformService');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('../config/config');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Iniciar processo de restauração completa para um cliente
 * @param {string} clientId - ID do cliente
 * @param {string} backupId - ID do backup a ser restaurado (opcional, usa o mais recente se não fornecido)
 * @param {Object} options - Opções de restauração
 * @returns {Object} - Informações sobre o job de restauração criado
 */
exports.startRestoration = async (clientId, backupId = null, options = {}) => {
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const client = await Client.findById(clientId);
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  // Verificar se há um processo de restauração em andamento
  const ongoingRestore = await BackupJob.findOne({
    clientId,
    type: 'restoration',
    status: { $in: ['Pendente', 'Em Progresso'] }
  });
  
  if (ongoingRestore) {
    throw new ValidationError('Já existe um processo de restauração em andamento para este cliente');
  }
  
  // Obter o backup a ser restaurado
  let targetBackup;
  if (backupId) {
    if (!mongoose.Types.ObjectId.isValid(backupId)) {
      throw new ValidationError('ID de backup inválido');
    }
    
    targetBackup = await BackupJob.findOne({
      _id: backupId,
      clientId,
      type: 'backup',
      status: 'Sucesso'
    });
    
    if (!targetBackup) {
      throw new NotFoundError('Backup não encontrado ou não está disponível para restauração');
    }
  } else {
    // Usar o backup mais recente bem-sucedido
    targetBackup = await BackupJob.findOne({
      clientId,
      type: 'backup',
      status: 'Sucesso'
    }).sort({ completedAt: -1 });
    
    if (!targetBackup) {
      throw new ValidationError('Não há backups bem-sucedidos disponíveis para restauração');
    }
  }
  
  // Definir o destino da restauração
  const targetEnvironment = options.targetEnvironment || 'produção';
  const isIsolatedRestore = targetEnvironment !== 'produção';
  
  // Criar um novo job de restauração
  const restoreJob = new BackupJob({
    clientId,
    type: 'restoration',
    status: 'Pendente',
    backupType: targetBackup.backupType,
    sourceBackupId: targetBackup._id,
    createdAt: new Date(),
    provider: targetBackup.provider,
    isAutomated: false,
    metadata: {
      targetEnvironment,
      isIsolated: isIsolatedRestore,
      resources: options.resources || 'all', // 'all' ou lista de recursos específicos
      recoveryPoint: targetBackup.completedAt,
      description: options.description || 'Restauração iniciada manualmente',
      priority: options.priority || 'alta',
      initiatedBy: options.initiatedBy || 'admin'
    }
  });
  
  await restoreJob.save();
  
  // Iniciar processo de restauração em segundo plano
  const providerSpecificOptions = {
    targetResourceGroup: options.targetResourceGroup, // Para Azure
    targetVPC: options.targetVPC, // Para AWS/GCP
    targetSubnet: options.targetSubnet, // Para todos
    pointInTimeRecovery: options.pointInTimeRecovery // Para restaurações específicas de banco de dados
  };
  
  // Executar a restauração no provedor de nuvem apropriado
  const providers = client.providers || ['aws', 'azure', 'gcp'].filter(p => client[`${p}Enabled`]);
  
  if (isIsolatedRestore) {
    // Restauração para ambiente isolado
    _scheduleIsolatedRestoration(client, targetBackup, restoreJob._id, providerSpecificOptions)
      .catch(err => console.error(`Erro ao iniciar restauração isolada para cliente ${clientId}:`, err));
  } else {
    // Restauração para ambiente de produção
    _scheduleProductionRestoration(client, targetBackup, restoreJob._id, providerSpecificOptions)
      .catch(err => console.error(`Erro ao iniciar restauração para produção para cliente ${clientId}:`, err));
  }
  
  return {
    message: `Restauração para ambiente de ${targetEnvironment} iniciada com sucesso`,
    jobId: restoreJob._id,
    sourceBackupId: targetBackup._id,
    estimatedTime: _estimateRestorationTime(targetBackup),
    targetEnvironment
  };
};

/**
 * Estimar o tempo de restauração com base no backup
 * @private
 */
const _estimateRestorationTime = (backup) => {
  // Cálculo aproximado baseado no tamanho dos dados e métricas anteriores
  const dataSize = backup.dataSize || 0;
  const baseTime = 10; // Minutos base
  const sizeMultiplier = dataSize > 0 ? Math.ceil(dataSize / 1024) : 1; // 1 minuto por GB
  
  return baseTime + sizeMultiplier;
};

/**
 * Inicia uma restauração em ambiente isolado
 * @private
 */
const _scheduleIsolatedRestoration = async (client, backup, jobId, options) => {
  try {
    // Atualizar status do job
    await BackupJob.updateOne(
      { _id: jobId },
      { 
        status: 'Em Progresso',
        startedAt: new Date(),
        updatedAt: new Date()
      }
    );
    
    // Obter diretório para scripts de restauração
    const scriptDir = path.join(config.terraform.rootPath, 'restoration-scripts');
    if (!fs.existsSync(scriptDir)) {
      fs.mkdirSync(scriptDir, { recursive: true });
    }
    
    // Preparar o ambiente Terraform para a restauração
    const workDir = await TerraformService.prepareRestoreEnvironment(client, backup, options);
    
    // Iniciar a operação do Terraform
    const terraformOutput = await TerraformService.startRestoration(client.id, workDir, backup, options);
    
    // Processar os resultados e atualizar o job após a conclusão
    const restoredResources = _parseRestorationOutput(terraformOutput);
    
    // Atualizar o job com as informações de restauração
    await BackupJob.updateOne(
      { _id: jobId },
      {
        status: 'Sucesso',
        completedAt: new Date(),
        updatedAt: new Date(),
        result: {
          terraformOutput,
          restoredResources
        }
      }
    );
    
    // Adicionar histórico de restauração ao cliente
    // (implementação específica para cada provedor de nuvem)
    
  } catch (error) {
    console.error(`Erro na restauração isolada:`, error);
    
    // Marcar job como falha
    await BackupJob.updateOne(
      { _id: jobId },
      {
        status: 'Falha',
        errorMessage: error.message,
        updatedAt: new Date()
      }
    );
  }
};

/**
 * Inicia uma restauração em ambiente de produção
 * @private
 */
const _scheduleProductionRestoration = async (client, backup, jobId, options) => {
  try {
    // Atualizar status do job
    await BackupJob.updateOne(
      { _id: jobId },
      { 
        status: 'Em Progresso',
        startedAt: new Date(),
        updatedAt: new Date()
      }
    );
    
    // Verificação extra de segurança para restauração em produção
    await _validateProductionRestore(client, backup, options);
    
    // Para cada provedor de nuvem habilitado, iniciar restauração
    const providers = client.providers || [];
    const restoreOperations = [];
    
    if (providers.includes('aws') || client.awsEnabled) {
      restoreOperations.push(CloudProviderService.startAWSRestore(client, backup, options));
    }
    
    if (providers.includes('azure') || client.azureEnabled) {
      restoreOperations.push(CloudProviderService.startAzureRestore(client, backup, options));
    }
    
    if (providers.includes('gcp') || client.gcpEnabled) {
      restoreOperations.push(CloudProviderService.startGCPRestore(client, backup, options));
    }
    
    // Aguardar todas as operações de restauração
    const results = await Promise.allSettled(restoreOperations);
    
    // Verificar resultados
    const failures = results.filter(r => r.status === 'rejected');
    const successes = results.filter(r => r.status === 'fulfilled');
    
    if (failures.length > 0) {
      if (successes.length > 0) {
        // Restauração parcial - alguns provedores tiveram sucesso, outros não
        await BackupJob.updateOne(
          { _id: jobId },
          {
            status: 'Sucesso Parcial',
            completedAt: new Date(),
            updatedAt: new Date(),
            errorMessage: `Restauração parcial: ${failures.length} provedores falharam`,
            result: {
              successes: successes.map(s => s.value),
              failures: failures.map(f => f.reason.message)
            }
          }
        );
      } else {
        // Falha completa
        throw new Error(failures.map(f => f.reason.message).join('; '));
      }
    } else {
      // Sucesso completo
      await BackupJob.updateOne(
        { _id: jobId },
        {
          status: 'Sucesso',
          completedAt: new Date(),
          updatedAt: new Date(),
          result: {
            restoredResources: successes.map(s => s.value).flat()
          }
        }
      );
    }
  } catch (error) {
    console.error(`Erro na restauração para produção:`, error);
    
    // Marcar job como falha
    await BackupJob.updateOne(
      { _id: jobId },
      {
        status: 'Falha',
        errorMessage: error.message,
        updatedAt: new Date()
      }
    );
  }
};

/**
 * Realizar validações adicionais para restauração em produção
 * @private
 */
const _validateProductionRestore = async (client, backup, options) => {
  // Verificar se o backup é recente (menos de 7 dias)
  const backupAge = (new Date() - backup.completedAt) / (1000 * 60 * 60 * 24);
  
  if (backupAge > 7 && !options.forceTrustOldBackup) {
    throw new ValidationError(`O backup selecionado tem ${Math.round(backupAge)} dias. Para restauração em produção, recomenda-se um backup com menos de 7 dias. Use a opção forceTrustOldBackup para prosseguir.`);
  }
  
  // Verificar se o backup foi validado (por um teste de DR bem-sucedido)
  const hasValidation = await BackupJob.findOne({
    sourceBackupId: backup._id,
    type: 'drTest',
    status: 'Sucesso'
  });
  
  if (!hasValidation && !options.skipValidationCheck) {
    throw new ValidationError('Este backup não foi validado por um teste de DR bem-sucedido. Use a opção skipValidationCheck para prosseguir.');
  }
  
  return true;
};

/**
 * Analisar a saída da restauração para identificar recursos restaurados
 * @private
 */
const _parseRestorationOutput = (output) => {
  // Implementação depende do formato da saída do Terraform
  const resources = [];
  
  try {
    // Vamos supor que a saída do Terraform está em um formato específico
    // que pode ser parseado para extrair informações sobre recursos restaurados
    if (typeof output === 'string') {
      // Exemplo: procurar por linhas que indicam recursos criados
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes('Creation complete after')) {
          const resourceMatch = line.match(/Creation complete after \d+[ms] \[id=([^\]]+)\]/);
          if (resourceMatch && resourceMatch[1]) {
            resources.push({
              id: resourceMatch[1],
              type: resourceMatch[1].split('.')[0],
              status: 'criado'
            });
          }
        }
      }
    } else if (typeof output === 'object') {
      // Formato já estruturado
      if (Array.isArray(output.resources)) {
        return output.resources;
      }
    }
  } catch (error) {
    console.error('Erro ao processar saída de restauração:', error);
  }
  
  return resources;
};

/**
 * Obter status detalhado de uma restauração
 * @param {string} jobId - ID do job de restauração
 * @returns {Object} - Detalhes do processo de restauração
 */
exports.getRestorationStatus = async (jobId) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ValidationError('ID de job inválido');
  }
  
  const job = await BackupJob.findById(jobId);
  
  if (!job || job.type !== 'restoration') {
    throw new NotFoundError('Job de restauração não encontrado');
  }
  
  // Calcular progresso estimado se estiver em andamento
  let progress = 0;
  
  if (job.status === 'Em Progresso' && job.startedAt) {
    const elapsedMinutes = (new Date() - job.startedAt) / (1000 * 60);
    const sourceBackup = await BackupJob.findById(job.sourceBackupId);
    const estimatedTime = sourceBackup ? _estimateRestorationTime(sourceBackup) : 30;
    
    progress = Math.min(95, Math.round((elapsedMinutes / estimatedTime) * 100));
  } else if (job.status === 'Sucesso') {
    progress = 100;
  } else if (job.status === 'Sucesso Parcial') {
    progress = 100;
  } else if (job.status === 'Falha') {
    progress = 100;
  }
  
  // Obter informações sobre recursos restaurados
  let restoredResources = [];
  if (job.result && job.result.restoredResources) {
    restoredResources = job.result.restoredResources;
  }
  
  return {
    id: job._id,
    clientId: job.clientId,
    status: job.status,
    progress,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    sourceBackupId: job.sourceBackupId,
    provider: job.provider,
    targetEnvironment: job.metadata?.targetEnvironment || 'produção',
    isIsolated: job.metadata?.isIsolated || false,
    resources: job.metadata?.resources || 'all',
    errorMessage: job.errorMessage,
    restoredResources
  };
};

/**
 * Listar o histórico de restaurações de um cliente
 * @param {string} clientId - ID do cliente
 * @param {Object} options - Opções de paginação
 * @returns {Object} - Lista paginada de restaurações
 */
exports.getRestorationHistory = async (clientId, page = 1, limit = 10) => {
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    lean: true
  };
  
  const result = await BackupJob.paginate(
    { clientId, type: 'restoration' }, 
    options
  );
  
  return {
    history: result.docs.map(job => ({
      id: job._id,
      date: job.startedAt || job.createdAt,
      completedAt: job.completedAt,
      status: job.status,
      targetEnvironment: job.metadata?.targetEnvironment || 'produção',
      isIsolated: job.metadata?.isIsolated || false,
      duration: job.startedAt && job.completedAt ? 
        Math.round((job.completedAt - job.startedAt) / (1000 * 60)) + ' min' : 
        'N/A',
      provider: job.provider,
      sourceBackupId: job.sourceBackupId
    })),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page
  };
};

/**
 * Cancelar uma restauração em andamento
 * @param {string} jobId - ID do job de restauração
 * @returns {Object} - Resultado da operação
 */
exports.cancelRestore = async (jobId) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ValidationError('ID de job inválido');
  }
  
  const job = await BackupJob.findById(jobId);
  
  if (!job || job.type !== 'restoration') {
    throw new NotFoundError('Job de restauração não encontrado');
  }
  
  if (job.status !== 'Pendente' && job.status !== 'Em Progresso') {
    throw new ValidationError(`Não é possível cancelar uma restauração com status ${job.status}`);
  }
  
  // Tentar interromper o processo de restauração
  try {
    // Obter cliente
    const client = await Client.findById(job.clientId);
    
    // Cancelar operação de acordo com o provedor de nuvem
    if (job.provider === 'aws' || (client && client.awsEnabled)) {
      await CloudProviderService.cancelAWSRestore(job);
    } else if (job.provider === 'azure' || (client && client.azureEnabled)) {
      await CloudProviderService.cancelAzureRestore(job);
    } else if (job.provider === 'gcp' || (client && client.gcpEnabled)) {
      await CloudProviderService.cancelGCPRestore(job);
    }
    
    // Atualizar status do job
    await BackupJob.updateOne(
      { _id: jobId },
      {
        status: 'Cancelado',
        updatedAt: new Date(),
        completedAt: new Date()
      }
    );
    
    return {
      message: 'Restauração cancelada com sucesso',
      jobId
    };
  } catch (error) {
    console.error(`Erro ao cancelar restauração ${jobId}:`, error);
    throw new Error(`Falha ao cancelar restauração: ${error.message}`);
  }
};