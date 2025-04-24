/**
 * Controlador para operações de restauração de backups
 * Expõe endpoints para gerenciar processos de restauração em cenários de DR
 */

const RestoreService = require('../services/restoreService');

/**
 * Iniciar processo de restauração para um cliente
 */
exports.startRestore = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { backupId, targetEnvironment, resources, ...options } = req.body;
    
    // Combinar opções de restauração
    const restoreOptions = {
      targetEnvironment,
      resources,
      ...options,
      initiatedBy: req.user?.id || 'admin'
    };
    
    const result = await RestoreService.startRestoration(id, backupId, restoreOptions);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Obter status de um processo de restauração
 */
exports.getRestoreStatus = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const result = await RestoreService.getRestorationStatus(jobId);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Obter histórico de restaurações de um cliente
 */
exports.getRestoreHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const history = await RestoreService.getRestorationHistory(id, page, limit);
    
    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancelar um processo de restauração em andamento
 */
exports.cancelRestore = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const result = await RestoreService.cancelRestore(jobId);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};