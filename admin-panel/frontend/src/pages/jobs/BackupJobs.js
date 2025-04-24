import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Tabs,
  Tab,
  LinearProgress,
  Tooltip,
  Pagination
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon,
  CloudDownload as DownloadIcon,
  History as HistoryIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Dados simulados para jobs de backup
const mockJobs = [
  {
    id: 'job-1',
    name: 'EC2 Instance Backup',
    clientId: 'client-1',
    clientName: 'XYZ Corporation',
    resourceType: 'EC2',
    resourceCount: 12,
    provider: 'aws',
    region: 'us-east-1',
    schedule: 'Daily at 22:00',
    lastRun: '2025-04-23T22:00:00Z',
    nextRun: '2025-04-24T22:00:00Z',
    status: 'success',
    retention: 30,
    enabled: true
  },
  {
    id: 'job-2',
    name: 'RDS Database Backup',
    clientId: 'client-1',
    clientName: 'XYZ Corporation',
    resourceType: 'RDS',
    resourceCount: 3,
    provider: 'aws',
    region: 'us-east-1',
    schedule: 'Daily at 23:00',
    lastRun: '2025-04-23T23:00:00Z',
    nextRun: '2025-04-24T23:00:00Z',
    status: 'success',
    retention: 60,
    enabled: true
  },
  {
    id: 'job-3',
    name: 'Storage Backup',
    clientId: 'client-2',
    clientName: 'ABC Company',
    resourceType: 'Storage',
    resourceCount: 5,
    provider: 'azure',
    region: 'eastus',
    schedule: 'Weekly on Sunday at 01:00',
    lastRun: '2025-04-20T01:00:00Z',
    nextRun: '2025-04-27T01:00:00Z',
    status: 'warning',
    retention: 90,
    enabled: true
  },
  {
    id: 'job-4',
    name: 'VM Backup',
    clientId: 'client-2',
    clientName: 'ABC Company',
    resourceType: 'VM',
    resourceCount: 8,
    provider: 'azure',
    region: 'eastus',
    schedule: 'Daily at 02:00',
    lastRun: '2025-04-23T02:00:00Z',
    nextRun: '2025-04-24T02:00:00Z',
    status: 'failed',
    retention: 30,
    enabled: true
  },
  {
    id: 'job-5',
    name: 'Compute Engine Backup',
    clientId: 'client-3',
    clientName: 'Nova Tech',
    resourceType: 'GCE',
    resourceCount: 6,
    provider: 'gcp',
    region: 'us-central1',
    schedule: 'Daily at 03:00',
    lastRun: '2025-04-23T03:00:00Z',
    nextRun: '2025-04-24T03:00:00Z',
    status: 'success',
    retention: 14,
    enabled: true
  },
  {
    id: 'job-6',
    name: 'Cloud SQL Backup',
    clientId: 'client-3',
    clientName: 'Nova Tech',
    resourceType: 'SQL',
    resourceCount: 2,
    provider: 'gcp',
    region: 'us-central1',
    schedule: 'Daily at 04:00',
    lastRun: null,
    nextRun: '2025-04-24T04:00:00Z',
    status: 'pending',
    retention: 30,
    enabled: false
  }
];

// Componente principal da página
const BackupJobs = () => {
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    provider: 'all',
    client: 'all'
  });
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    // Simular carregamento dos dados
    loadJobs();
  }, []);

  useEffect(() => {
    // Aplicar filtros e pesquisa
    let result = jobs;
    
    // Aplicar pesquisa
    if (searchTerm) {
      result = result.filter(job => 
        job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.resourceType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Aplicar filtros
    if (filters.status !== 'all') {
      result = result.filter(job => job.status === filters.status);
    }
    
    if (filters.provider !== 'all') {
      result = result.filter(job => job.provider === filters.provider);
    }
    
    if (filters.client !== 'all') {
      result = result.filter(job => job.clientId === filters.client);
    }
    
    setFilteredJobs(result);
  }, [jobs, searchTerm, filters]);

  const loadJobs = () => {
    setLoading(true);
    // Simular chamada de API
    setTimeout(() => {
      setJobs(mockJobs);
      setFilteredJobs(mockJobs);
      setLoading(false);
    }, 1000);
  };

  const handleRefresh = () => {
    loadJobs();
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleJobToggle = (jobId) => {
    setJobs(
      jobs.map(job => 
        job.id === jobId ? { ...job, enabled: !job.enabled } : job
      )
    );
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

  const renderJobsTable = () => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const displayedJobs = filteredJobs.slice(startIndex, endIndex);
    
    return (
      <>
        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Job</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Provedor / Região</TableCell>
                <TableCell>Recursos</TableCell>
                <TableCell>Última Execução</TableCell>
                <TableCell>Próxima Execução</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {job.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {job.schedule}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.clientName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Chip
                        label={getProviderLabel(job.provider)}
                        color={getProviderColor(job.provider)}
                        size="small"
                        sx={{ mb: 1, width: 'fit-content' }}
                      />
                      <Typography variant="body2">
                        {job.region}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {job.resourceCount} × {job.resourceType}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDateTime(job.lastRun)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDateTime(job.nextRun)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(job.status)}
                      color={getStatusColor(job.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Ver detalhes">
                      <IconButton 
                        size="small" 
                        component={Link} 
                        to={`/jobs/${job.id}`}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={job.enabled ? "Pausar" : "Ativar"}>
                      <IconButton 
                        size="small" 
                        color={job.enabled ? "default" : "primary"}
                        onClick={() => handleJobToggle(job.id)}
                      >
                        {job.enabled ? <PauseIcon fontSize="small" /> : <PlayIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Executar agora">
                      <IconButton size="small" color="primary">
                        <PlayIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              
              {displayedJobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      Nenhum job de backup encontrado.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {filteredJobs.length > rowsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={Math.ceil(filteredJobs.length / rowsPerPage)}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </>
    );
  };

  const renderFilterToolbar = () => {
    return (
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Pesquisar jobs..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="success">Sucesso</MenuItem>
                  <MenuItem value="warning">Alerta</MenuItem>
                  <MenuItem value="failed">Falha</MenuItem>
                  <MenuItem value="pending">Pendente</MenuItem>
                  <MenuItem value="running">Em Execução</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Provedor</InputLabel>
                <Select
                  name="provider"
                  value={filters.provider}
                  onChange={handleFilterChange}
                  label="Provedor"
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="aws">AWS</MenuItem>
                  <MenuItem value="azure">Azure</MenuItem>
                  <MenuItem value="gcp">GCP</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Cliente</InputLabel>
                <Select
                  name="client"
                  value={filters.client}
                  onChange={handleFilterChange}
                  label="Cliente"
                >
                  <MenuItem value="all">Todos</MenuItem>
                  <MenuItem value="client-1">XYZ Corporation</MenuItem>
                  <MenuItem value="client-2">ABC Company</MenuItem>
                  <MenuItem value="client-3">Nova Tech</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
              >
                Atualizar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Jobs de Backup
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          to="/clients/new"
        >
          Criar Novo Job
        </Button>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Todos os Jobs" />
            <Tab label="AWS" />
            <Tab label="Azure" />
            <Tab label="GCP" />
          </Tabs>
        </Box>
        <CardContent>
          {loading ? (
            <LinearProgress />
          ) : (
            <>
              {renderFilterToolbar()}
              {renderJobsTable()}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BackupJobs;