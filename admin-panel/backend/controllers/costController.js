/**
 * Controlador para gerenciamento de custos
 * Implementa endpoints para relatórios e análises de custos detalhados
 */

const CostControlService = require('../services/costControlService');

// Obter relatório detalhado de custos
exports.getDetailedCostReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, granularity } = req.query;
    
    const report = await CostControlService.getDetailedCostReport(id, startDate, endDate, granularity);
    
    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};

// Obter previsão de custos futuros
exports.getCostForecast = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { months = 3 } = req.query;
    
    const forecast = await CostControlService.getCostForecast(id, parseInt(months, 10));
    
    res.status(200).json(forecast);
  } catch (error) {
    next(error);
  }
};

// Obter relatório de eficiência de custos
exports.getCostEfficiencyReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const report = await CostControlService.getCostEfficiencyReport(id);
    
    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};

// Obter comparação de custos entre clientes
exports.getCostComparison = async (req, res, next) => {
  try {
    const { clientIds } = req.body;
    
    if (!clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return res.status(400).json({ 
        error: true, 
        message: 'É necessário fornecer um array de IDs de clientes' 
      });
    }
    
    const comparison = await CostControlService.getCostComparison(clientIds);
    
    res.status(200).json(comparison);
  } catch (error) {
    next(error);
  }
};

// Obter custos por recurso
exports.getResourceCosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, limit = 10 } = req.query;
    
    const resourceCosts = await CostControlService.getResourceCosts(
      id, 
      startDate, 
      endDate, 
      parseInt(limit, 10)
    );
    
    res.status(200).json(resourceCosts);
  } catch (error) {
    next(error);
  }
};