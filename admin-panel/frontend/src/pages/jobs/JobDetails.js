import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  Divider,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  IconButton,
  LinearProgress,
  Alert,
  Stack,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import {
  Refresh as RefreshIcon,
  CloudDownload as CloudDownloadIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ErrorOutline as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  StorageOutlined as StorageIcon,
  Description as DescriptionIcon,
  RestoreOutlined as RestoreIcon,
  History as HistoryIcon,
  ScheduleOutlined as ScheduleIcon,
  SettingsOutlined as SettingsIcon,
  Code as CodeIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

// Dados simulados de job
const mockJob = {
  id: 'job-1',
  name: 'EC2 Instance Backup',
  clientId: 'client-1',
  clientName: 'XYZ Corporation',
  resourceType: 'EC2',
  resourceCount: 12,
  provider: 'aws',
  region: 'us-east-1',
  schedule: 'Daily at 22:00',
  cron: '0 22 * * *',
  schedule_enabled: true,
  lastRun: '2025-04-23T22:00:00Z',
  nextRun: '2025-04-24T22:00:00Z',
  status: 'success',
  retention: 30,
  enabled: true,
  created_at: '2025-01-15T14:30:00Z',
  updated_at: '2025-04-10T09:15:00Z',
  resources: [
    { id: 'i-01234567890abcdef', name: 'app-server-1', status: 'success' },
    { id: 'i-abcdef01234567890', name: 'app-server-2', status: 'success' },
    { id: 'i-11223344556677889', name: 'db-server-1', status: 'success' },
    { id: 'i-99887766554433221', name: 'web-server-1', status: 'failed' },
    { id: 'i-aabb11223344ccdd', name: 'cache-server-1', status: 'success' }
  ],
  storage: {
    bucket: 'backup-storage-xyz-corp',
    currentSize: 256, // GB
    estimatedCost: 25.60
  },
  history: [
    { 
      id: 'exec-001', 
      timestamp: '2025-04-23T22:00:00Z', 
      status: 'success', 
      duration: 45, // minutos
      resourcesBackedUp: 12,
      resourcesFailed: 0,
      dataSize: 42, // GB
      logs: [
        { timestamp: '2025-04-23T22:00:00Z', level: 'info', message: 'Iniciando backup de 12 instâncias EC2' },
        { timestamp: '2025-04-23T22:01:30Z', level: 'info', message: 'Criando snapshot para i-01234567890abcdef' },
        { timestamp: '2025-04-23T22:05:45Z', level: 'info', message: 'Criando snapshot para i-abcdef01234567890' },
        { timestamp: '2025-04-23T22:43:15Z', level: 'info', message: 'Backup concluído com sucesso' }
      ]
    },
    { 
      id: 'exec-002', 
      timestamp: '2025-04-22T22:00:00Z', 
      status: 'success', 
      duration: 48,
      resourcesBackedUp: 12,
      resourcesFailed: 0,
      dataSize: 42.5,
      logs: []
    },
    { 
      id: 'exec-003', 
      timestamp: '2025-04-21T22:00:00Z', 
      status: 'warning', 
      duration: 52,
      resourcesBackedUp: 11,
      resourcesFailed: 1,
      dataSize: 40.2,
      logs: []
    },
    { 
      id: 'exec-004', 
      timestamp: '2025-04-20T22:00:00Z', 
      status: 'failed', 
      duration: 15,
      resourcesBackedUp: 3,
      resourcesFailed: 9,
      dataSize: 12.8,
      logs: []
    }
  ],
  terraform: {
    configPath: 'modules/aws/backup_plan.tf',
    variables: {
      backup_vault_name: 'xyz-corp-vault',
      backup_plan_name: 'daily-ec2-backup',
      schedule_expression: 'cron(0 22 * * ? *)',
      retention_period: 30,
      resource_tags: {
        Environment: 'Production',
        Client: 'XYZ Corp'
      }
    }
  }
};

const JobDetails = () => {
  const { jobId } = useParams();
  const [loading, setLoading] = useState(false);
  const [job, setJob] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedExecution, setSelectedExecution] = useState(null);

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = () => {
    setLoading(true);
    // Simular chamada de API
    setTimeout(() => {
      setJob(mockJob);
      if (mockJob.history.length > 0) {
        setSelectedExecution(mockJob.history[0]);
      }
      setLoading(false);
    }, 1000);
  };

  const handleRefresh = () => {
    loadJobDetails();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleExecutionChange = (execution) => {
    setSelectedExecution(execution);
  };

  const handleToggleJob = () => {
    setJob({
      ...job,
      enabled: !job.enabled
    });
  };

  const handleToggleSchedule = () => {
    setJob({
      ...job,
      schedule_enabled: !job.schedule_enabled
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'failed':
        return 'error';
      case 'pending':
        return 'default';
      case 'running':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'success':
        return 'Sucesso';
      case 'warning':
        return 'Alerta';
      case 'failed':
        return 'Falha';
      case 'pending':
        return 'Pendente';
      case 'running':
        return 'Em Execução';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <ErrorIcon color="warning" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'pending':
        return <InfoIcon color="disabled" />;
      case 'running':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon color="disabled" />;
    }
  };

  const getProviderLabel = (provider) => {
    switch (provider) {
      case 'aws':
        return 'AWS';
      case 'azure':
        return 'Azure';
      case 'gcp':
        return 'GCP';
      default:
        return provider;
    }
  };

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'aws':
        return 'primary';
      case 'azure':
        return 'info';
      case 'gcp':
        return 'success';
      default:
        return 'default';
    }
  };

  const renderOverviewTab = () => {
    if (!job) return null;

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Detalhes do Job
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Cliente
                </Typography>
                <Typography variant="body2">
                  {job.clientName}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  ID do Job
                </Typography>
                <Typography variant="body2">
                  {job.id}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Provedor / Região
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Chip
                    label={getProviderLabel(job.provider)}
                    color={getProviderColor(job.provider)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2">
                    {job.region}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Recursos
                </Typography>
                <Typography variant="body2">
                  {job.resourceCount} × {job.resourceType}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Programação
                </Typography>
                <Typography variant="body2">
                  {job.schedule}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Expressão Cron
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {job.cron}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Retenção
                </Typography>
                <Typography variant="body2">
                  {job.retention} dias
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Data de Criação
                </Typography>
                <Typography variant="body2">
                  {formatDateTime(job.created_at)}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Última Execução
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {formatDateTime(job.lastRun)}
                  </Typography>
                  {job.status && (
                    <Chip
                      label={getStatusLabel(job.status)}
                      color={getStatusColor(job.status)}
                      size="small"
                    />
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Próxima Execução
                </Typography>
                <Typography variant="body2">
                  {formatDateTime(job.nextRun)}
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <FormControlLabel 
                  control={
                    <Switch 
                      checked={job.enabled} 
                      onChange={handleToggleJob} 
                      color="primary"
                    />
                  } 
                  label={job.enabled ? "Job Ativo" : "Job Inativo"} 
                />
                
                <FormControlLabel 
                  control={
                    <Switch 
                      checked={job.schedule_enabled} 
                      onChange={handleToggleSchedule} 
                      color="primary"
                    />
                  } 
                  label={job.schedule_enabled ? "Agendamento Ativo" : "Agendamento Desativado"} 
                />
              </Box>
              
              <Box>
                <Button variant="contained" sx={{ mr: 1 }} startIcon={<PlayArrowIcon />}>
                  Executar Agora
                </Button>
                <Button variant="outlined" sx={{ mr: 1 }} startIcon={<EditIcon />}>
                  Editar
                </Button>
                <Button variant="outlined" color="error" startIcon={<DeleteIcon />}>
                  Excluir
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Armazenamento
              </Typography>
              <StorageIcon color="primary" />
            </Box>
            
            <Typography variant="subtitle2" color="text.secondary">
              Localização
            </Typography>
            <Typography variant="body2" gutterBottom sx={{ wordBreak: 'break-all' }}>
              {job.storage.bucket}
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
              Tamanho Total
            </Typography>
            <Typography variant="body1" gutterBottom fontWeight="bold">
              {job.storage.currentSize} GB
            </Typography>
            
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
              Custo Estimado
            </Typography>
            <Typography variant="body1" gutterBottom fontWeight="bold">
              ${job.storage.estimatedCost}/mês
            </Typography>
          </Paper>
          
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Restauração
              </Typography>
              <RestoreIcon color="primary" />
            </Box>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              Os backups deste job podem ser restaurados com o Terraform.
            </Alert>
            
            <Button
              variant="contained"
              fullWidth
              startIcon={<RestoreIcon />}
            >
              Iniciar Restauração
            </Button>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderResourcesTab = () => {
    if (!job) return null;

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recursos Protegidos
              </Typography>
              
              <Button
                startIcon={<RefreshIcon />}
                variant="outlined"
                onClick={handleRefresh}
              >
                Atualizar
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID do Recurso</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Último Backup</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {job.resources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {resource.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {resource.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {job.resourceType}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(job.lastRun)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(resource.status)}
                          color={getStatusColor(resource.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Restaurar recurso">
                          <IconButton size="small">
                            <RestoreIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver detalhes">
                          <IconButton size="small">
                            <DescriptionIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderHistoryTab = () => {
    if (!job) return null;

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Histórico de Execuções
              </Typography>
              
              <Button
                startIcon={<RefreshIcon />}
                variant="outlined"
                size="small"
                onClick={handleRefresh}
              >
                Atualizar
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <List sx={{ maxHeight: 500, overflow: 'auto' }}>
              {job.history.map((execution) => (
                <ListItem
                  key={execution.id}
                  button
                  selected={selectedExecution && selectedExecution.id === execution.id}
                  onClick={() => handleExecutionChange(execution)}
                  divider
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStatusIcon(execution.status)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {formatDateTime(execution.timestamp)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', mt: 1, justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          {execution.resourcesBackedUp} recursos
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {execution.duration} min
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {execution.dataSize} GB
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
              
              {job.history.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                  Nenhuma execução encontrada.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={7}>
          {selectedExecution ? (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Detalhes da Execução
                </Typography>
                
                <Chip
                  label={getStatusLabel(selectedExecution.status)}
                  color={getStatusColor(selectedExecution.status)}
                />
              </Box>
              
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Data/Hora
                  </Typography>
                  <Typography variant="body2">
                    {formatDateTime(selectedExecution.timestamp)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Duração
                  </Typography>
                  <Typography variant="body2">
                    {selectedExecution.duration} minutos
                  </Typography>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Recursos
                  </Typography>
                  <Typography variant="body2">
                    {selectedExecution.resourcesBackedUp} sucesso, {selectedExecution.resourcesFailed} falha
                  </Typography>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tamanho
                  </Typography>
                  <Typography variant="body2">
                    {selectedExecution.dataSize} GB
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom>
                Logs da Execução
              </Typography>
              
              {selectedExecution.logs && selectedExecution.logs.length > 0 ? (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', fontFamily: 'monospace', maxHeight: 400, overflow: 'auto' }}>
                  {selectedExecution.logs.map((log, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" component="span">
                        {new Date(log.timestamp).toLocaleTimeString()} 
                      </Typography>
                      <Typography 
                        variant="body2" 
                        component="span" 
                        color={log.level === 'error' ? 'error' : 'inherit'}
                        sx={{ ml: 1 }}
                      >
                        [{log.level.toUpperCase()}] {log.message}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              ) : (
                <Alert severity="info">
                  Logs detalhados não estão disponíveis para esta execução.
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" startIcon={<CloudDownloadIcon />}>
                  Baixar Logs
                </Button>
              </Box>
            </Paper>
          ) : (
            <Paper variant="outlined" sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Selecione uma execução para ver os detalhes.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    );
  };

  const renderTimelineTab = () => {
    if (!job) return null;

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Linha do Tempo
            </Typography>
            
            <Divider sx={{ mb: 2 }} />
            
            <Timeline position="alternate">
              {job.history.map((execution, index) => (
                <TimelineItem key={execution.id}>
                  <TimelineOppositeContent color="text.secondary">
                    {formatDateTime(execution.timestamp)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={getStatusColor(execution.status)}>
                      {execution.status === 'success' && <CheckCircleIcon />}
                      {execution.status === 'warning' && <ErrorIcon />}
                      {execution.status === 'failed' && <ErrorIcon />}
                      {execution.status === 'running' && <PlayArrowIcon />}
                      {execution.status === 'pending' && <ScheduleIcon />}
                    </TimelineDot>
                    {index < job.history.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Paper elevation={3} sx={{ p: 2 }}>
                      <Typography variant="h6" component="span">
                        {getStatusLabel(execution.status)}
                      </Typography>
                      <Typography>
                        {execution.resourcesBackedUp} recursos, {execution.dataSize} GB
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duração: {execution.duration} minutos
                      </Typography>
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              ))}
              
              <TimelineItem>
                <TimelineOppositeContent color="text.secondary">
                  {formatDateTime(job.created_at)}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot>
                    <HistoryIcon />
                  </TimelineDot>
                </TimelineSeparator>
                <TimelineContent>
                  <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h6" component="span">
                      Job Criado
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Configuração inicial do job
                    </Typography>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            </Timeline>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderConfigTab = () => {
    if (!job) return null;

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Configuração Terraform
              </Typography>
              <CodeIcon color="primary" />
            </Box>
            
            <Typography variant="subtitle2" color="text.secondary">
              Arquivo de Configuração
            </Typography>
            <Typography variant="body2" gutterBottom sx={{ fontFamily: 'monospace' }}>
              {job.terraform.configPath}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Variáveis
            </Typography>
            
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, fontFamily: 'monospace', overflow: 'auto' }}>
              <pre style={{ margin: 0 }}>
                {JSON.stringify(job.terraform.variables, null, 2)}
              </pre>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="outlined" startIcon={<DescriptionIcon />}>
                Ver Arquivo Completo
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Configurações Avançadas
              </Typography>
              <SettingsIcon color="primary" />
            </Box>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Tags de Backup" 
                  secondary="Tags usadas para identificar recursos a serem incluídos no backup"
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Tipo de Armazenamento" 
                  secondary="Standard (Acesso regular)"
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Criptografia" 
                  secondary="AES-256 (Padrão)"
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Transição para Armazenamento Frio" 
                  secondary="Após 90 dias"
                />
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Replicação" 
                  secondary="Desativada"
                />
              </ListItem>
            </List>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="outlined" startIcon={<EditIcon />}>
                Editar Configurações
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ py: 3 }}>
      {loading ? (
        <LinearProgress />
      ) : (
        <>
          {job ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                  <Typography variant="h5" component="h1">
                    {job.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cliente: {job.clientName} | Última execução: {formatDateTime(job.lastRun)}
                  </Typography>
                </Box>
                
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                >
                  Atualizar
                </Button>
              </Box>

              <Card>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={handleTabChange} aria-label="job tabs" sx={{ px: 2 }}>
                    <Tab icon={<InfoIcon />} iconPosition="start" label="Visão Geral" />
                    <Tab icon={<StorageIcon />} iconPosition="start" label="Recursos" />
                    <Tab icon={<HistoryIcon />} iconPosition="start" label="Histórico" />
                    <Tab icon={<TimelineIcon />} iconPosition="start" label="Linha do Tempo" />
                    <Tab icon={<CodeIcon />} iconPosition="start" label="Configuração" />
                  </Tabs>
                </Box>
                <CardContent>
                  <Box role="tabpanel" hidden={tabValue !== 0}>
                    {tabValue === 0 && renderOverviewTab()}
                  </Box>
                  <Box role="tabpanel" hidden={tabValue !== 1}>
                    {tabValue === 1 && renderResourcesTab()}
                  </Box>
                  <Box role="tabpanel" hidden={tabValue !== 2}>
                    {tabValue === 2 && renderHistoryTab()}
                  </Box>
                  <Box role="tabpanel" hidden={tabValue !== 3}>
                    {tabValue === 3 && renderTimelineTab()}
                  </Box>
                  <Box role="tabpanel" hidden={tabValue !== 4}>
                    {tabValue === 4 && renderConfigTab()}
                  </Box>
                </CardContent>
              </Card>
            </>
          ) : (
            <Alert severity="error">
              Job não encontrado. O ID {jobId} não corresponde a nenhum job no sistema.
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};

export default JobDetails;