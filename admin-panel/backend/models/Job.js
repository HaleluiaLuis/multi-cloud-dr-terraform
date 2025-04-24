/**
 * Modelo para jobs de backup, restauração e testes do SaaS
 * Gerencia todos os processos relacionados a operações em segundo plano
 */

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

// Esquema para trabalhos de backup, restauração e testes de DR
const jobSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  type: {
    type: String,
    enum: ['backup', 'restore', 'restoration', 'drTest', 'TERRAFORM_INIT', 'TERRAFORM_UPDATE', 'TERRAFORM_DESTROY', 'TERRAFORM_RESTORE'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pendente', 'Em Progresso', 'Sucesso', 'Falha', 'Cancelado', 'Sucesso Parcial', 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'PLANNING_COMPLETED'],
    default: 'Pendente'
  },
  backupType: {
    type: String,
    enum: ['Completo', 'Incremental', 'Diferencial', 'Teste', 'Teste DR'],
    default: 'Incremental'
  },
  isAutomated: {
    type: Boolean,
    default: false
  },
  isManual: {
    type: Boolean,
    default: false
  },
  sourceBackupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    default: null
  },
  provider: {
    type: String,
    enum: ['aws', 'azure', 'gcp', null],
    default: null
  },
  dataSize: {
    type: Number, // em MB
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
});

// Middleware para atualizar a data de modificação
jobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Adicionar plugin de paginação
jobSchema.plugin(mongoosePaginate);

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;

