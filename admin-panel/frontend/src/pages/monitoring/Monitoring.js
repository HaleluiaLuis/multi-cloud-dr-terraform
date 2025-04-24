import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  LinearProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  NotificationsActive as AlertIcon,
  VisibilityOff as MuteIcon
} from '@mui/icons-material';

// Dados simulados para o monitoramento
const mockAlerts = [
  {
    id: 'alert-1',
    severity: 'critical',
    message: 'Falha no backup de 3 recursos no cliente XYZ Corp',
    resource: 'job-4',
    resourceName: 'EC2 Instance Backup',
    timestamp: '2025-04-24T08:30:00Z',
    status: 'active'
  },
  {
    id: 'alert-2',
    severity: 'warning',
    message: 'Taxa de sucesso abaixo de 90% para o Storage Backup',
    resource: 'job-3',
    resourceName: 'Storage Backup',
    timestamp: '2025-04-24T07:15:00Z',
    status: 'active'
  },
  {
    id: 'alert-3',
    severity: 'info',
    message: 'Backup completo com 1 aviso',
    resource: 'job-3',
    resourceName: 'Storage Backup',
    timestamp: '2025-04-23T14:45:00Z',
    status: 'resolved'
  },
  {
    id: 'alert-4',
    severity: 'critical',
    message: 'Limite de cota de armazenamento excedido em AWS us-east-1',
    resource: 'storage-1',
    resourceName: 'AWS S3 Backup Bucket',
    timestamp: '2025-04-23T09:10:00Z',
    status: 'resolved'
  }
];

const mockMetrics = [
  {
    id: 'metric-1',
    name: 'Taxa de Sucesso de Backups',
    value: 97.5,
    unit: '%',
    change: 2.1,
    trend: 'up',
    status: 'healthy'
  },
  {
    id: 'metric-2',
    name: 'Armazenamento Total',
    value: 1856,
    unit: 'GB',
    change: 125,
    trend: 'up',
    status: 'healthy'
  },
  {
    id: 'metric-3',
    name: 'Tempo Médio de Backup',
    value: 28.4,
    unit: 'min',
    change: -3.2,
    trend: 'down',
    status: 'healthy'
  },
  {
    id: 'metric-4',
    name: 'Tempo de Restauração',
    value: 45.2,
    unit: 'min',
    change: 5.8,
    trend: 'up',
    status: 'warning'
  },
  {
    id: 'metric-5',
    name: 'Jobs Ativos',
    value: 42,
    unit: '',
    change: 3,
    trend: 'up',
    status: 'healthy'
  },
  {
    id: 'metric-6',
    name: 'Custo Mensal Estimado',
    value: 3250,
    unit: 'USD',
    change: 180,
    trend: 'up',
    status: 'warning'
  }
];

const mockResources = [
  {
    id: 'resource-1',
    name: 'AWS us-east-1',
    type: 'region',
    status: 'healthy',
    metrics: {
      storage: {
        used: 760,
        total: 1000,
        unit: 'GB'
      },
      jobs: 18,
      success: 96.2
    }
  },
  {
    id: 'resource-2',
    name: 'Azure eastus',
    type: 'region',
    status: 'healthy',
    metrics: {
      storage: {
        used: 540,
        total: 800,
        unit: 'GB'
      },
      jobs: 12,
      success: 99.1
    }
  },
  {
    id: 'resource-3',
    name: 'GCP us-central1',
    type: 'region',
    status: 'warning',
    metrics: {
      storage: {
        used: 556,
        total: 600,
        unit: 'GB'
      },
      jobs: 12,
      success: 92.8
    }
  },
];

const Monitoring = () => {
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [resources, setResources] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [alertFilter, setAlertFilter] = useState('all');

  useEffect(() => {
    // Simular carregamento dos dados
    setLoading(true);
    setTimeout(() => {
      setAlerts(mockAlerts);
      setMetrics(mockMetrics);
      setResources(mockResources);
      setLoading(false);
    }, 1000);
  }, []);

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleAlertFilterChange = (event) => {
    setAlertFilter(event.target.value);
  };

  const getFilteredAlerts = () => {
    if (alertFilter === 'all') return alerts;
    return alerts.filter(alert => alert.status === alertFilter);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'critical':
        return 'Crítico';
      case 'warning':
        return 'Alerta';
      case 'info':
        return 'Informação';
      default:
        return severity;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'error';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'resolved':
        return 'Resolvido';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return null;
      case 'warning':
        return <WarningIcon fontSize="small" color="warning" />;
      case 'critical':
        return <ErrorIcon fontSize="small" color="error" />;
      default:
        return null;
    }
  };

  const renderDashboardTab = () => {
    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Métricas Principais
          </Typography>
        </Grid>

        {metrics.map((metric) => (
          <Grid item xs={12} sm={6} md={4} key={metric.id}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 2,
                height: '100%',
                borderColor: 
                  metric.status === 'warning' ? 'warning.light' : 
                  metric.status === 'critical' ? 'error.light' : 
                  'divider'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {metric.name}
                </Typography>
                {getStatusIcon(metric.status)}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'baseline', mt: 2 }}>
                <Typography variant="h4" component="span" fontWeight="medium">
                  {metric.value}
                </Typography>
                {metric.unit && (
                  <Typography variant="subtitle1" component="span" color="text.secondary" sx={{ ml: 0.5 }}>
                    {metric.unit}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {metric.trend === 'up' ? (
                  <ArrowUpIcon
                    fontSize="small"
                    color={metric.status === 'warning' ? 'warning' : 'success'}
                  />
                ) : (
                  <ArrowDownIcon
                    fontSize="small"
                    color="success"
                  />
                )}
                <Typography
                  variant="body2"
                  color={
                    metric.status === 'warning' ? 'warning.main' :
                    metric.status === 'critical' ? 'error.main' :
                    'success.main'
                  }
                  sx={{ ml: 0.5 }}
                >
                  {metric.change > 0 ? '+' : ''}{metric.change} {metric.trend === 'up' ? 'aumento' : 'redução'}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Alertas Recentes
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Severidade</TableCell>
                  <TableCell>Mensagem</TableCell>
                  <TableCell>Recurso</TableCell>
                  <TableCell>Hora</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.slice(0, 3).map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <Chip
                        label={getSeverityLabel(alert.severity)}
                        color={getSeverityColor(alert.severity)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {alert.message}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {alert.resourceName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(alert.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(alert.status)}
                        color={getStatusColor(alert.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <MuteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Status de Recursos
          </Typography>
        </Grid>

        {resources.map((resource) => (
          <Grid item xs={12} sm={6} md={4} key={resource.id}>
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 2,
                height: '100%',
                borderColor: 
                  resource.status === 'warning' ? 'warning.light' : 
                  resource.status === 'critical' ? 'error.light' : 
                  'divider'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {resource.name}
                </Typography>
                {getStatusIcon(resource.status)}
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {resource.type === 'region' ? 'Região' : resource.type}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Armazenamento:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1, mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(resource.metrics.storage.used / resource.metrics.storage.total) * 100}
                      color={
                        (resource.metrics.storage.used / resource.metrics.storage.total) > 0.9 ? 'error' :
                        (resource.metrics.storage.used / resource.metrics.storage.total) > 0.7 ? 'warning' :
                        'primary'
                      }
                      sx={{ height: 8, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {resource.metrics.storage.used} / {resource.metrics.storage.total} {resource.metrics.storage.unit}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 2, display: 'flex' }}>
                <Box sx={{ mr: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Jobs:
                  </Typography>
                  <Typography variant="body1">
                    {resource.metrics.jobs}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Taxa de Sucesso:
                  </Typography>
                  <Typography
                    variant="body1"
                    color={
                      resource.metrics.success > 95 ? 'success.main' :
                      resource.metrics.success > 90 ? 'warning.main' : 'error.main'
                    }
                  >
                    {resource.metrics.success}%
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderAlertsTab = () => {
    const filteredAlerts = getFilteredAlerts();

    return (
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Filtrar por Status</InputLabel>
            <Select
              value={alertFilter}
              label="Filtrar por Status"
              onChange={handleAlertFilterChange}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="active">Ativos</MenuItem>
              <MenuItem value="resolved">Resolvidos</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Severidade</TableCell>
                <TableCell>Mensagem</TableCell>
                <TableCell>Recurso</TableCell>
                <TableCell>Hora</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAlerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <Chip
                      label={getSeverityLabel(alert.severity)}
                      color={getSeverityColor(alert.severity)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {alert.message}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {alert.resourceName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDateTime(alert.timestamp)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(alert.status)}
                      color={getStatusColor(alert.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {alert.status === 'active' && (
                      <>
                        <IconButton size="small" color="primary">
                          <AlertIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <MuteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderResourcesTab = () => {
    return (
      <Box sx={{ mt: 2 }}>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Armazenamento</TableCell>
                <TableCell>Jobs</TableCell>
                <TableCell>Taxa de Sucesso</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {resource.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {resource.type === 'region' ? 'Região' : resource.type}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={resource.status === 'healthy' ? 'Saudável' : resource.status === 'warning' ? 'Alerta' : 'Crítico'}
                      color={resource.status === 'healthy' ? 'success' : resource.status === 'warning' ? 'warning' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: 200 }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(resource.metrics.storage.used / resource.metrics.storage.total) * 100}
                          color={
                            (resource.metrics.storage.used / resource.metrics.storage.total) > 0.9 ? 'error' :
                            (resource.metrics.storage.used / resource.metrics.storage.total) > 0.7 ? 'warning' :
                            'primary'
                          }
                          sx={{ height: 8, borderRadius: 5 }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 100 }}>
                        <Typography variant="body2" color="text.secondary">
                          {resource.metrics.storage.used} / {resource.metrics.storage.total} {resource.metrics.storage.unit}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {resource.metrics.jobs}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={
                        resource.metrics.success > 95 ? 'success.main' :
                        resource.metrics.success > 90 ? 'warning.main' : 'error.main'
                      }
                    >
                      {resource.metrics.success}%
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Monitoramento
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Atualizar
        </Button>
      </Box>

      <Card>
        <CardContent>
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleChangeTab}>
              <Tab label="Dashboard" />
              <Tab label="Alertas" />
              <Tab label="Recursos" />
            </Tabs>
          </Box>

          <Box role="tabpanel" hidden={tabValue !== 0}>
            {tabValue === 0 && renderDashboardTab()}
          </Box>
          
          <Box role="tabpanel" hidden={tabValue !== 1}>
            {tabValue === 1 && renderAlertsTab()}
          </Box>
          
          <Box role="tabpanel" hidden={tabValue !== 2}>
            {tabValue === 2 && renderResourcesTab()}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Monitoring;