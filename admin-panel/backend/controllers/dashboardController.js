/**
 * Controlador para o Dashboard
 * Reúne informações estatísticas de várias fontes para exibição no painel principal
 */

const Client = require('../models/Client');
const Job = require('../models/Job');
const cloudProviderService = require('../services/cloudProviderService');
const costControlService = require('../services/costControlService');

/**
 * Obtém todos os dados necessários para o dashboard
 */
const getDashboardData = async (req, res) => {
  try {
    // Buscar contagem de clientes ativos
    const clientCount = await Client.countDocuments({ status: 'active' });
    
    // Buscar volume total de dados
    const stats = await Job.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalSize: { $sum: '$backupSizeBytes' } } }
    ]);
    const totalDataVolume = stats.length > 0 ? stats[0].totalSize : 0;
    
    // Calcular taxa de sucesso dos backups (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const allJobsCount = await Job.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    const successfulJobsCount = await Job.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo },
      status: 'completed'
    });
    
    const successRate = allJobsCount > 0 
      ? (successfulJobsCount / allJobsCount * 100).toFixed(1) 
      : 100;
    
    // Buscar custo mensal estimado
    const costEstimate = await costControlService.getMonthlyEstimate();
    
    // Distribuição de backups por provedor de nuvem
    const cloudDistribution = await Job.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$cloudProvider', count: { $sum: 1 } } }
    ]);
    
    // Tendência de backups nos últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const backupTrend = await Job.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sixMonthsAgo },
          status: 'completed'
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Status atual dos serviços de nuvem
    const cloudStatus = await cloudProviderService.getServiceStatus();
    
    // Jobs recentes
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('client', 'name');
    
    res.json({
      metrics: {
        clientCount,
        totalDataVolume,
        successRate,
        costEstimate
      },
      cloudDistribution: cloudDistribution.map(item => ({
        provider: item._id,
        count: item.count
      })),
      backupTrend: backupTrend.map(item => ({
        year: item._id.year,
        month: item._id.month,
        count: item.count
      })),
      cloudStatus,
      recentJobs: recentJobs.map(job => ({
        id: job._id,
        clientName: job.client ? job.client.name : 'Cliente desconhecido',
        type: job.jobType,
        status: job.status,
        completedAt: job.completedAt,
        progress: job.progress
      }))
    });
  } catch (error) {
    console.error('Erro ao obter dados do dashboard:', error);
    res.status(500).json({ error: 'Erro ao obter dados do dashboard' });
  }
};

module.exports = {
  getDashboardData
};