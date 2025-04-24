/**
 * Controlador para testes automatizados de Disaster Recovery (DR)
 * Gerencia verificações periódicas de recuperação para garantir a integridade dos backups
 */

const DRTestService = require('../services/drTestService');

// Agendar testes periódicos de DR para todos os clientes ativos elegíveis
exports.schedulePeriodicDRTests = async (req, res, next) => {
  try {
    const result = await DRTestService.schedulePeriodicDRTests();
    
    res.status(200).json({
      message: `${result.count} testes de DR agendados com sucesso`,
      scheduledTests: result.scheduledTests
    });
  } catch (error) {
    next(error);
  }
};

// Iniciar teste de DR manualmente para um cliente específico
exports.startManualDRTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { backupId, verificationSteps, targetEnvironment } = req.body;
    
    const testParameters = {
      verificationSteps,
      targetEnvironment
    };
    
    const result = await DRTestService.startManualDRTest(id, backupId, testParameters);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Obter resultado detalhado de um teste de DR
exports.getDRTestResult = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const result = await DRTestService.getDRTestResult(jobId);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Obter relatório de conformidade de DR para um cliente
exports.getDRComplianceReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await DRTestService.getDRComplianceReport(id);
    
    res.status(200).json(report);
  } catch (error) {
    next(error);
  }
};

// Obter histórico de testes de DR para um cliente
exports.getDRTestHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const history = await DRTestService.getDRTestHistory(id, page, limit);
    
    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};