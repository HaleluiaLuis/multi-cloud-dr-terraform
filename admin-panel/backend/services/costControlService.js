/**
 * Serviço para controle e análise de custos
 * Fornece relatórios e estimativas de custos por cliente e recurso
 */

const Client = require('../models/Client');
const BackupJob = require('../models/Job');
const CloudProviderService = require('./cloudProviderService');
const mongoose = require('mongoose');
const { NotFoundError, ValidationError } = require('../utils/errors');

/**
 * Obter estimativa de custo mensal total
 * Esta função é usada pelo dashboard para mostrar o custo estimado total
 */
exports.getMonthlyEstimate = async () => {
  // Obter todos os clientes ativos
  const clients = await Client.find({ status: 'active' });
  
  if (!clients || clients.length === 0) {
    return 0;
  }
  
  // Definir período (mês atual)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // Acumular custos de todos os clientes
  let totalEstimate = 0;
  
  for (const client of clients) {
    try {
      // Obter custos do cliente do mês atual
      const clientCosts = await CloudProviderService.getClientCosts(
        client._id,
        client.providers,
        startOfMonth,
        now
      );
      
      // Estimar o custo para o mês inteiro com base na proporção de dias decorridos
      const daysInMonth = endOfMonth.getDate();
      const daysPassed = now.getDate();
      
      // Extrapolação simples para o mês inteiro
      const monthEstimate = daysPassed > 0 
        ? (clientCosts.total || 0) * (daysInMonth / daysPassed)
        : 0;
        
      totalEstimate += monthEstimate;
    } catch (error) {
      console.error(`Erro ao calcular estimativa para cliente ${client.name}:`, error);
      // Continue para o próximo cliente
    }
  }
  
  return Math.round(totalEstimate * 100) / 100; // Arredondar para 2 casas decimais
};

/**
 * Obter relatório detalhado de custos por cliente
 */
exports.getDetailedCostReport = async (clientId, startDate, endDate, granularity = 'daily') => {
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const client = await Client.findById(clientId);
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  // Converter datas se fornecidas
  const startDateTime = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const endDateTime = endDate ? new Date(endDate) : new Date();
  
  // Obter custos detalhados dos provedores de nuvem
  const costDetails = await CloudProviderService.getDetailedClientCosts(
    clientId, 
    client.providers, 
    startDateTime, 
    endDateTime,
    granularity
  );
  
  // Calcular custos por serviço/recurso
  const costsByService = {};
  let totalCost = 0;
  
  costDetails.items.forEach(item => {
    const service = item.service || 'Outros';
    if (!costsByService[service]) {
      costsByService[service] = {
        total: 0,
        resources: {}
      };
    }
    
    costsByService[service].total += item.cost;
    totalCost += item.cost;
    
    const resource = item.resourceId || 'Não especificado';
    if (!costsByService[service].resources[resource]) {
      costsByService[service].resources[resource] = 0;
    }
    costsByService[service].resources[resource] += item.cost;
  });
  
  // Calcular tendências de custos (comparação com período anterior)
  const previousPeriodStart = new Date(startDateTime);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - Math.round((endDateTime - startDateTime) / (1000 * 60 * 60 * 24)));
  
  const previousPeriodCosts = await CloudProviderService.getClientCosts(
    clientId, 
    client.providers, 
    previousPeriodStart,
    startDateTime
  );
  
  const previousTotalCost = previousPeriodCosts.total || 0;
  const costDifference = totalCost - previousTotalCost;
  const costChangePercentage = previousTotalCost > 0 ? (costDifference / previousTotalCost) * 100 : 0;
  
  return {
    clientId,
    clientName: client.name,
    period: {
      start: startDateTime,
      end: endDateTime,
      granularity
    },
    totalCost,
    currency: costDetails.currency || 'BRL',
    costsByService,
    costsByDay: costDetails.costsByDay || [],
    trend: {
      previousPeriodCost: previousTotalCost,
      difference: costDifference,
      percentageChange: costChangePercentage,
      direction: costChangePercentage > 0 ? 'up' : (costChangePercentage < 0 ? 'down' : 'stable')
    },
    providers: client.providers
  };
};

/**
 * Obter previsão de custos futuros com base em tendências históricas
 */
exports.getCostForecast = async (clientId, months = 3) => {
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const client = await Client.findById(clientId);
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  // Obter dados históricos dos últimos 6 meses
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  // Obter custos mensais para análise de tendências
  const historicalCosts = await CloudProviderService.getMonthlyClientCosts(
    clientId,
    client.providers,
    startDate,
    endDate
  );
  
  // Calcular tendência de crescimento mensal (média móvel ponderada)
  let weightedSum = 0;
  let weightSum = 0;
  
  // Damos mais peso aos meses mais recentes
  historicalCosts.forEach((monthData, index) => {
    const weight = index + 1; // Mês mais antigo tem peso 1, mais recente tem peso maior
    weightedSum += monthData.cost * weight;
    weightSum += weight;
  });
  
  const avgMonthlyCost = historicalCosts.length > 0 ? 
    historicalCosts.reduce((sum, month) => sum + month.cost, 0) / historicalCosts.length : 0;
  
  const weightedAvgGrowth = weightSum > 0 ? weightedSum / weightSum : avgMonthlyCost;
  
  // Se temos pelo menos 2 meses de dados, calcular a taxa de crescimento
  let growthRate = 0;
  if (historicalCosts.length >= 2) {
    const recentMonths = historicalCosts.slice(-3); // Últimos 3 meses ou menos
    
    let growthSum = 0;
    for (let i = 1; i < recentMonths.length; i++) {
      const prevCost = recentMonths[i-1].cost;
      const currentCost = recentMonths[i].cost;
      if (prevCost > 0) {
        growthSum += (currentCost - prevCost) / prevCost;
      }
    }
    
    growthRate = recentMonths.length > 1 ? growthSum / (recentMonths.length - 1) : 0;
  }
  
  // Gerar previsão para os próximos meses
  const forecast = [];
  let lastMonth = historicalCosts.length > 0 ? 
    historicalCosts[historicalCosts.length - 1] : { date: new Date(), cost: avgMonthlyCost };
  
  for (let i = 1; i <= months; i++) {
    const forecastDate = new Date(lastMonth.date);
    forecastDate.setMonth(forecastDate.getMonth() + i);
    
    // Aplicar taxa de crescimento à previsão
    const forecastedCost = lastMonth.cost * (1 + growthRate);
    
    forecast.push({
      date: forecastDate,
      cost: forecastedCost,
      cumulative: i === 1 ? forecastedCost : forecast[i-2].cumulative + forecastedCost
    });
    
    lastMonth = { date: forecastDate, cost: forecastedCost };
  }
  
  // Adicionar análise de fatores de custo
  const costFactors = await analyzeCostFactors(clientId);
  
  return {
    clientId,
    clientName: client.name,
    currency: 'BRL',
    currentMonthlyCost: lastMonth.cost,
    monthlyGrowthRate: growthRate,
    forecast,
    estimatedTotalOverPeriod: forecast.reduce((sum, month) => sum + month.cost, 0),
    historicalCosts,
    costFactors,
    confidenceLevel: historicalCosts.length > 3 ? 'Alto' : (historicalCosts.length > 1 ? 'Médio' : 'Baixo')
  };
};

/**
 * Analisar fatores que influenciam os custos
 */
const analyzeCostFactors = async (clientId) => {
  // Obter dados de backup dos últimos 3 meses
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);
  
  const backupJobs = await BackupJob.find({
    clientId,
    type: 'backup',
    createdAt: { $gte: startDate, $lte: endDate }
  }).sort({ createdAt: 1 });
  
  // Analisar crescimento de dados
  let dataGrowthRate = 0;
  if (backupJobs.length >= 2) {
    const monthlyDataSize = {};
    
    // Agrupar tamanhos de backup por mês
    backupJobs.forEach(job => {
      if (job.dataSize) {
        const monthKey = `${job.createdAt.getFullYear()}-${job.createdAt.getMonth() + 1}`;
        if (!monthlyDataSize[monthKey]) {
          monthlyDataSize[monthKey] = [];
        }
        monthlyDataSize[monthKey].push(job.dataSize);
      }
    });
    
    // Calcular média mensal
    const monthlyAvg = {};
    Object.keys(monthlyDataSize).forEach(month => {
      const sizes = monthlyDataSize[month];
      monthlyAvg[month] = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
    });
    
    // Calcular taxa de crescimento entre o primeiro e último mês
    const months = Object.keys(monthlyAvg).sort();
    if (months.length >= 2) {
      const firstMonth = monthlyAvg[months[0]];
      const lastMonth = monthlyAvg[months[months.length - 1]];
      
      if (firstMonth > 0) {
        dataGrowthRate = (lastMonth - firstMonth) / firstMonth;
      }
    }
  }
  
  // Análise de custos por tipo de backup (incremental vs. completo)
  const backupTypes = {};
  let totalBackupJobs = 0;
  
  backupJobs.forEach(job => {
    totalBackupJobs++;
    const type = job.backupType || 'Não especificado';
    if (!backupTypes[type]) {
      backupTypes[type] = { count: 0, totalSize: 0 };
    }
    backupTypes[type].count++;
    backupTypes[type].totalSize += job.dataSize || 0;
  });
  
  // Converter para porcentagens
  Object.keys(backupTypes).forEach(type => {
    backupTypes[type].percentage = (backupTypes[type].count / totalBackupJobs) * 100;
    backupTypes[type].avgSize = backupTypes[type].count > 0 ? 
      backupTypes[type].totalSize / backupTypes[type].count : 0;
  });
  
  return {
    dataGrowthRate,
    dataGrowthImpact: dataGrowthRate > 0.1 ? 'Alto' : (dataGrowthRate > 0.05 ? 'Médio' : 'Baixo'),
    backupTypes,
    factors: [
      {
        name: 'Crescimento de dados',
        impact: dataGrowthRate > 0.1 ? 'Alto' : (dataGrowthRate > 0.05 ? 'Médio' : 'Baixo'),
        recommendation: dataGrowthRate > 0.1 ? 
          'Considere ajustar políticas de retenção ou implementar compressão adicional' : 
          'Crescimento dentro de limites aceitáveis'
      },
      {
        name: 'Tipos de backup',
        impact: backupTypes['Completo'] && backupTypes['Completo'].percentage > 50 ? 'Alto' : 'Baixo',
        recommendation: backupTypes['Completo'] && backupTypes['Completo'].percentage > 50 ?
          'Aumente a proporção de backups incrementais para reduzir custos' :
          'Proporção de tipos de backup está otimizada'
      },
      {
        name: 'Retenção de dados',
        impact: 'Médio',
        recommendation: 'Revise políticas de retenção para dados raramente acessados'
      }
    ]
  };
};

/**
 * Obter relatório de eficiência de custos
 */
exports.getCostEfficiencyReport = async (clientId) => {
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const client = await Client.findById(clientId);
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  // Obter recomendações de otimização de custos do provedor de nuvem
  const optimizationRecommendations = await CloudProviderService.getCostOptimizationRecommendations(
    clientId,
    client.providers
  );
  
  // Analisar eficiência de recursos baseada em custos vs. uso
  const resourceEfficiency = await CloudProviderService.getResourceEfficiencyMetrics(
    clientId,
    client.providers
  );
  
  // Calcular pontuação geral de eficiência
  const efficiencyScores = resourceEfficiency.map(r => r.efficiencyScore || 0);
  const avgEfficiencyScore = efficiencyScores.length > 0 ?
    efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length : 0;
  
  // Estimar potencial de economia
  const savings = optimizationRecommendations.reduce((total, rec) => total + (rec.estimatedSavings || 0), 0);
  
  return {
    clientId,
    clientName: client.name,
    overallEfficiencyScore: avgEfficiencyScore,
    efficiencyRating: avgEfficiencyScore > 80 ? 'Excelente' : 
      (avgEfficiencyScore > 60 ? 'Bom' : 
      (avgEfficiencyScore > 40 ? 'Regular' : 'Precisa de atenção')),
    potentialMonthlySavings: savings,
    recommendations: optimizationRecommendations,
    resourceEfficiency,
    currency: 'BRL'
  };
};

/**
 * Obter comparação de custos entre múltiplos clientes
 */
exports.getCostComparison = async (clientIds) => {
  if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
    throw new ValidationError('É necessário fornecer ao menos um ID de cliente');
  }
  
  const validIds = clientIds.filter(id => mongoose.Types.ObjectId.isValid(id));
  
  if (validIds.length === 0) {
    throw new ValidationError('Nenhum ID de cliente válido fornecido');
  }
  
  // Obter informações de todos os clientes solicitados
  const clients = await Client.find({ _id: { $in: validIds } });
  
  if (clients.length === 0) {
    throw new NotFoundError('Nenhum cliente encontrado');
  }
  
  // Definir período (último mês)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  
  // Obter custos para cada cliente
  const clientsCosts = [];
  
  for (const client of clients) {
    const costs = await CloudProviderService.getClientCosts(
      client._id,
      client.providers,
      startDate,
      endDate
    );
    
    clientsCosts.push({
      clientId: client._id,
      clientName: client.name,
      totalCost: costs.total || 0,
      providers: client.providers,
      costByProvider: costs.byProvider || {},
      resourceCount: await CloudProviderService.getClientResourceCount(client._id)
    });
  }
  
  // Ordenar por custo (do mais alto para o mais baixo)
  clientsCosts.sort((a, b) => b.totalCost - a.totalCost);
  
  // Calcular métricas de comparação
  const totalAllClients = clientsCosts.reduce((sum, c) => sum + c.totalCost, 0);
  const avgCostPerClient = totalAllClients / clientsCosts.length;
  
  // Adicionar métricas relativas
  clientsCosts.forEach(client => {
    client.percentageOfTotal = totalAllClients > 0 ? (client.totalCost / totalAllClients) * 100 : 0;
    client.relativeToBenchmark = avgCostPerClient > 0 ? (client.totalCost / avgCostPerClient) : 0;
    client.costPerResource = client.resourceCount > 0 ? client.totalCost / client.resourceCount : 0;
  });
  
  return {
    period: {
      start: startDate,
      end: endDate
    },
    currency: 'BRL',
    totalCosts: totalAllClients,
    averageCostPerClient: avgCostPerClient,
    clients: clientsCosts,
    benchmark: {
      avgCostPerResource: clientsCosts.reduce((sum, c) => sum + c.costPerResource, 0) / clientsCosts.length,
      highestCost: clientsCosts.length > 0 ? clientsCosts[0].totalCost : 0,
      lowestCost: clientsCosts.length > 0 ? clientsCosts[clientsCosts.length - 1].totalCost : 0
    }
  };
};

/**
 * Obter custos por recurso para um cliente
 */
exports.getResourceCosts = async (clientId, startDate, endDate, limit = 10) => {
  if (!mongoose.Types.ObjectId.isValid(clientId)) {
    throw new ValidationError('ID de cliente inválido');
  }
  
  const client = await Client.findById(clientId);
  
  if (!client) {
    throw new NotFoundError('Cliente não encontrado');
  }
  
  // Converter datas se fornecidas
  const startDateTime = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const endDateTime = endDate ? new Date(endDate) : new Date();
  
  // Obter custos detalhados por recurso
  const resourceCosts = await CloudProviderService.getResourceCosts(
    clientId,
    client.providers,
    startDateTime,
    endDateTime
  );
  
  // Ordenar por custo (do mais alto para o mais baixo) e limitar resultados
  resourceCosts.sort((a, b) => b.cost - a.cost);
  const topResources = resourceCosts.slice(0, limit);
  
  // Calcular total e percentagens
  const totalCost = resourceCosts.reduce((sum, r) => sum + r.cost, 0);
  
  topResources.forEach(resource => {
    resource.percentageOfTotal = totalCost > 0 ? (resource.cost / totalCost) * 100 : 0;
  });
  
  // Adicionar categoria "Outros" para recursos que não estão no top
  if (resourceCosts.length > limit) {
    const othersCost = resourceCosts.slice(limit).reduce((sum, r) => sum + r.cost, 0);
    topResources.push({
      resourceId: 'outros',
      resourceName: 'Outros recursos',
      resourceType: 'Agrupado',
      cost: othersCost,
      percentageOfTotal: totalCost > 0 ? (othersCost / totalCost) * 100 : 0,
      provider: 'Múltiplos'
    });
  }
  
  return {
    clientId,
    clientName: client.name,
    period: {
      start: startDateTime,
      end: endDateTime
    },
    totalCost,
    currency: 'BRL',
    resources: topResources
  };
};