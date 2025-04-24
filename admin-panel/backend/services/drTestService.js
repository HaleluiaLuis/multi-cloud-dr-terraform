/**
 * Serviço para testes automatizados de Disaster Recovery (DR)
 * Gerencia verificações periódicas de recuperação para garantir a integridade dos backups
 */

const Client = require('../models/Client');
const BackupJob = require('../models/Job');
const CloudProviderService = require('./cloudProviderService');
const JobService = require('./jobService');
const mongoose = require('mongoose');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Programar testes periódicos de DR para todos os clientes ativos
 * Esta função deve ser executada em um intervalo regular (por exemplo, diariamente)
 */
exports.schedulePeriodicDRTests = async () => {
  try {
    // Buscar todos os clientes ativos que possuem configuração de DR
    const clients = await Client.find({ 
      status: 'Ativo',
      'backupConfig.drTestFrequency': { $exists: true, $ne: null }
    });
    
    const scheduledTests = [];
    
    for (const client of clients) {
      // Verificar se já é hora de realizar um novo teste de DR com base na frequência configurada
      const shouldRunTest = await shouldScheduleDRTest(client);
      
      if (shouldRunTest) {
        // Programar um novo teste de DR
        const drTest = await scheduleClientDRTest(client._id);
        scheduledTests.push(drTest);
      }
    }
    
    return {
      scheduledTests,
      count: scheduledTests.length
    };
  } catch (error) {
    console.error('Erro ao programar testes de DR:', error);
    throw error;
  }
};

/**
 * Determina se um cliente específico deve ter um teste de DR agendado
 * com base na frequência configurada e no último teste executado
 */
const shouldScheduleDRTest = async (client) => {
  // Obter a frequência de testes de DR configurada para o cliente
  const frequency = client.backupConfig.drTestFrequency || 'Mensal';
  
  // Obter o último teste de DR para o cliente
  const lastDRTest = await BackupJob.findOne({
    clientId: client._id,
    type: 'drTest',
    isAutomated: true
  }).sort({ createdAt: -1 });
  
  // Se nunca houve um teste, devemos executar um
  if (!lastDRTest) {
    return true;
  }
  
  const now = new Date();
  const lastTestDate = lastDRTest.createdAt;
  
  // Calcular se já passou tempo suficiente desde o último teste
  switch (frequency) {
    case 'Semanal':
      // Uma semana em milissegundos: 7 * 24 * 60 * 60 * 1000
      return (now - lastTestDate) > 7 * 24 * 60 * 60 * 1000;
    case 'Quinzenal':
      // Duas semanas em milissegundos: 14 * 24 * 60 * 60 * 1000
      return (now - lastTestDate) > 14 * 24 * 60 * 60 * 1000;
    case 'Mensal':
      // Um mês aproximado em milissegundos: 30 * 24 * 60 * 60 * 1000
      return (now - lastTestDate) > 30 * 24 * 60 * 60 * 1000;
    case 'Trimestral':
      // Três meses aproximados em milissegundos: 90 * 24 * 60 * 60 * 1000
      return (now - lastTestDate) > 90 * 24 * 60 * 60 * 1000;
    default:
      // Padrão: mensal
      return (now - lastTestDate) > 30 * 24 * 60 * 60 * 1000;
  }
};

/**
 * Agendar um teste de DR para um cliente específico
 */
exports.scheduleClientDRTest = async (clientId) => {
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const client = await Client.findById(clientId);
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  if (client.status !== 'Ativo') {
    throw new ValidationError('Não é possível agendar testes para um cliente inativo');
  }
  
  // Encontrar o backup mais recente bem-sucedido
  const latestBackup = await BackupJob.findOne({
    clientId: clientId,
    type: 'backup',
    status: 'Sucesso'
  }).sort({ completedAt: -1 });
  
  if (!latestBackup) {
    throw new ValidationError('Não há backups bem-sucedidos disponíveis para teste');
  }
  
  // Criar um novo job de teste de DR
  const drTestJob = new BackupJob({
    clientId: clientId,
    type: 'drTest',
    status: 'Pendente',
    backupType: 'Teste DR',
    sourceBackupId: latestBackup._id,
    createdAt: new Date(),
    provider: latestBackup.provider,
    isAutomated: true,
    metadata: {
      testType: 'automated',
      recoveryPointObjective: client.backupConfig.recoveryPointObjective || 'N/A',
      recoveryTimeObjective: client.backupConfig.recoveryTimeObjective || 'N/A'
    }
  });
  
  await drTestJob.save();
  
  // Iniciar processo de teste de DR em segundo plano
  CloudProviderService.startDRTest(client, latestBackup, drTestJob._id)
    .catch(err => console.error(`Erro ao iniciar teste de DR para cliente ${clientId}:`, err));
  
  return {
    message: 'Teste de DR agendado com sucesso',
    jobId: drTestJob._id,
    sourceBackupId: latestBackup._id
  };
};

/**
 * Iniciar teste de DR manualmente para um cliente
 */
exports.startManualDRTest = async (clientId, backupId = null, testParameters = {}) => {
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const client = await Client.findById(clientId);
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  // Se um backupId específico foi fornecido, verificar se existe
  let targetBackup = null;
  if (backupId) {
    if (!mongoose.Types.ObjectId.isValid(backupId)) {
      throw new ValidationError('ID de backup inválido');
    }
    
    targetBackup = await BackupJob.findOne({
      _id: backupId,
      clientId: clientId,
      type: 'backup',
      status: 'Sucesso'
    });
    
    if (!targetBackup) {
      throw new NotFoundError('Backup não encontrado ou não está disponível para teste');
    }
  } else {
    // Usar o backup mais recente bem-sucedido
    targetBackup = await BackupJob.findOne({
      clientId: clientId,
      type: 'backup',
      status: 'Sucesso'
    }).sort({ completedAt: -1 });
    
    if (!targetBackup) {
      throw new ValidationError('Não há backups bem-sucedidos disponíveis para teste');
    }
  }
  
  // Verificar se já existe um teste de DR em andamento
  const ongoingTest = await BackupJob.findOne({
    clientId: clientId,
    type: 'drTest',
    status: { $in: ['Pendente', 'Em Progresso'] }
  });
  
  if (ongoingTest) {
    throw new ValidationError('Já existe um teste de DR em andamento para este cliente');
  }
  
  // Criar um novo job de teste de DR
  const drTestJob = new BackupJob({
    clientId: clientId,
    type: 'drTest',
    status: 'Pendente',
    backupType: 'Teste DR',
    sourceBackupId: targetBackup._id,
    createdAt: new Date(),
    provider: targetBackup.provider,
    isAutomated: false,
    metadata: {
      testType: 'manual',
      verificationSteps: testParameters.verificationSteps || ['integridade', 'acesso', 'restauração'],
      targetEnvironment: testParameters.targetEnvironment || 'isolado',
      recoveryPointObjective: client.backupConfig.recoveryPointObjective || 'N/A',
      recoveryTimeObjective: client.backupConfig.recoveryTimeObjective || 'N/A'
    }
  });
  
  await drTestJob.save();
  
  // Iniciar processo de teste de DR em segundo plano
  CloudProviderService.startDRTest(client, targetBackup, drTestJob._id, testParameters)
    .catch(err => console.error(`Erro ao iniciar teste de DR para cliente ${clientId}:`, err));
  
  return {
    message: 'Teste de DR iniciado com sucesso',
    jobId: drTestJob._id,
    sourceBackupId: targetBackup._id
  };
};

/**
 * Obter resultado detalhado de um teste de DR
 */
exports.getDRTestResult = async (jobId) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new ValidationError('ID de job inválido');
  }
  
  const job = await BackupJob.findById(jobId);
  
  if (!job || job.type !== 'drTest') {
    throw new NotFoundError('Teste de DR não encontrado');
  }
  
  // Calcular métricas de desempenho se o teste foi concluído
  let metrics = null;
  if (job.status === 'Sucesso' && job.startedAt && job.completedAt) {
    // Calcular RTO (Recovery Time Objective) alcançado
    const recoveryTimeMinutes = Math.round((job.completedAt - job.startedAt) / (1000 * 60));
    
    // Calcular RPO (Recovery Point Objective) alcançado
    const sourceBackup = await BackupJob.findById(job.sourceBackupId);
    const recoveryPointHours = sourceBackup ? 
      Math.round((job.startedAt - sourceBackup.completedAt) / (1000 * 60 * 60)) : null;
    
    metrics = {
      recoveryTimeMinutes,
      recoveryPointHours,
      rtoTarget: job.metadata?.recoveryTimeObjective || 'N/A',
      rpoTarget: job.metadata?.recoveryPointObjective || 'N/A',
      rtoCompliance: job.metadata?.recoveryTimeObjective ? 
        (recoveryTimeMinutes <= parseInt(job.metadata.recoveryTimeObjective)) : null,
      rpoCompliance: job.metadata?.recoveryPointObjective ? 
        (recoveryPointHours <= parseInt(job.metadata.recoveryPointObjective)) : null
    };
  }
  
  // Obter resultados específicos de cada etapa do teste
  const testDetails = job.testResults || [];
  
  return {
    id: job._id,
    clientId: job.clientId,
    status: job.status,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    sourceBackupId: job.sourceBackupId,
    isAutomated: job.isAutomated,
    metrics,
    testDetails,
    provider: job.provider,
    errorMessage: job.errorMessage,
    testType: job.metadata?.testType || 'standard',
    verificationSteps: job.metadata?.verificationSteps || []
  };
};

/**
 * Obter relatório de conformidade de DR para um cliente
 */
exports.getDRComplianceReport = async (clientId) => {
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const client = await Client.findById(clientId);
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  // Obter todos os testes de DR para o cliente
  const drTests = await BackupJob.find({
    clientId: clientId,
    type: 'drTest'
  }).sort({ createdAt: -1 }).limit(50);
  
  // Calcular estatísticas de conformidade
  const totalTests = drTests.length;
  const successfulTests = drTests.filter(test => test.status === 'Sucesso').length;
  const failedTests = drTests.filter(test => test.status === 'Falha').length;
  const pendingTests = drTests.filter(test => ['Pendente', 'Em Progresso'].includes(test.status)).length;
  
  // Calcular taxa de sucesso
  const successRate = totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;
  
  // Verificar conformidade com a frequência de testes
  const frequency = client.backupConfig.drTestFrequency || 'Mensal';
  const lastSuccessfulTest = drTests.find(test => test.status === 'Sucesso');
  
  // Calcular se está em conformidade com a frequência
  let frequencyCompliance = false;
  if (lastSuccessfulTest) {
    const daysSinceLastTest = Math.round((new Date() - lastSuccessfulTest.completedAt) / (1000 * 60 * 60 * 24));
    
    switch (frequency) {
      case 'Semanal':
        frequencyCompliance = daysSinceLastTest <= 7;
        break;
      case 'Quinzenal':
        frequencyCompliance = daysSinceLastTest <= 14;
        break;
      case 'Mensal':
        frequencyCompliance = daysSinceLastTest <= 30;
        break;
      case 'Trimestral':
        frequencyCompliance = daysSinceLastTest <= 90;
        break;
      default:
        frequencyCompliance = daysSinceLastTest <= 30;
    }
  }
  
  // Calcular média de tempo de recuperação
  const completedTests = drTests.filter(test => 
    test.status === 'Sucesso' && test.startedAt && test.completedAt
  );
  
  let avgRecoveryTime = 0;
  if (completedTests.length > 0) {
    const totalTime = completedTests.reduce((sum, test) => {
      const duration = (test.completedAt - test.startedAt) / (1000 * 60); // em minutos
      return sum + duration;
    }, 0);
    avgRecoveryTime = Math.round(totalTime / completedTests.length);
  }
  
  // Verificar se temos um teste de DR recente
  const recentTest = drTests.length > 0 ? drTests[0] : null;
  
  return {
    clientId,
    clientName: client.name,
    totalTests,
    successfulTests,
    failedTests,
    pendingTests,
    successRate,
    frequency,
    frequencyCompliance,
    lastSuccessfulTest: lastSuccessfulTest ? {
      id: lastSuccessfulTest._id,
      date: lastSuccessfulTest.completedAt,
      recoveryTime: lastSuccessfulTest.startedAt && lastSuccessfulTest.completedAt ?
        Math.round((lastSuccessfulTest.completedAt - lastSuccessfulTest.startedAt) / (1000 * 60)) : null
    } : null,
    avgRecoveryTime,
    rtoTarget: client.backupConfig.recoveryTimeObjective || 'N/A',
    rpoTarget: client.backupConfig.recoveryPointObjective || 'N/A',
    recentTestStatus: recentTest ? recentTest.status : 'N/A',
    rtoCompliance: completedTests.length > 0 && client.backupConfig.recoveryTimeObjective ? 
      avgRecoveryTime <= parseInt(client.backupConfig.recoveryTimeObjective) : false,
    recentTests: drTests.slice(0, 5).map(test => ({
      id: test._id,
      date: test.startedAt || test.createdAt,
      status: test.status,
      isAutomated: test.isAutomated,
      recoveryTime: test.startedAt && test.completedAt ?
        Math.round((test.completedAt - test.startedAt) / (1000 * 60)) : null
    }))
  };
};

/**
 * Obter histórico de testes de DR para um cliente
 */
exports.getDRTestHistory = async (clientId, page = 1, limit = 10) => {
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
    lean: true
  };
  
  const result = await BackupJob.paginate({ clientId, type: 'drTest' }, options);
  
  return {
    history: result.docs.map(test => ({
      id: test._id,
      date: test.startedAt || test.createdAt,
      completedAt: test.completedAt,
      status: test.status,
      isAutomated: test.isAutomated,
      recoveryTime: test.startedAt && test.completedAt ?
        Math.round((test.completedAt - test.startedAt) / (1000 * 60)) + ' min' : 'N/A',
      provider: test.provider,
      sourceBackupId: test.sourceBackupId
    })),
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page
  };
};