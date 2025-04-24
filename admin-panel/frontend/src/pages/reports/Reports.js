import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import ptBR from 'date-fns/locale/pt-BR';
import {
  Refresh as RefreshIcon,
  FileDownload as DownloadIcon,
  FilterList as FilterListIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  CloudDownload as CloudDownloadIcon
} from '@mui/icons-material';

// Dados simulados para relatórios
const mockReports = [
  {
    id: 'report-1',
    name: 'Relatório Mensal de Backup',
    type: 'backup-status',
    generatedAt: '2025-04-01T10:00:00Z',
    period: 'Março 2025',
    status: 'completed',
    size: '1.2 MB',
    format: 'PDF'
  },
  {
    id: 'report-2',
    name: 'Relatório de Uso de Armazenamento',
    type: 'storage-usage',
    generatedAt: '2025-04-01T10:15:00Z',
    period: 'Março 2025',
    status: 'completed',
    size: '987 KB',
    format: 'XLSX'
  },
  {
    id: 'report-3',
    name: 'Relatório de Custos',
    type: 'cost-analysis',
    generatedAt: '2025-04-01T10:30:00Z',
    period: 'Março 2025',
    status: 'completed',
    size: '1.5 MB',
    format: 'PDF'
  },
  {
    id: 'report-4',
    name: 'Relatório de Testes de DR',
    type: 'dr-tests',
    generatedAt: '2025-04-01T11:00:00Z',
    period: 'Q1 2025',
    status: 'completed',
    size: '2.3 MB',
    format: 'PDF'
  },
  {
    id: 'report-5',
    name: 'Relatório de Compliance',
    type: 'compliance',
    generatedAt: '2025-04-01T11:30:00Z',
    period: 'Q1 2025',
    status: 'completed',
    size: '1.8 MB',
    format: 'PDF'
  }
];

const reportTypes = [
  { id: 'backup-status', label: 'Status de Backups' },
  { id: 'storage-usage', label: 'Uso de Armazenamento' },
  { id: 'cost-analysis', label: 'Análise de Custos' },
  { id: 'dr-tests', label: 'Testes de DR' },
  { id: 'compliance', label: 'Compliance' }
];

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportType, setReportType] = useState('');
  const [format, setFormat] = useState('PDF');

  useEffect(() => {
    // Simular carregamento dos dados
    setLoading(true);
    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleGenerateReport = () => {
    if (!reportType || !format) {
      alert('Por favor, selecione o tipo de relatório e o formato.');
      return;
    }
    
    alert(`Gerando relatório do tipo ${reportType} no formato ${format}`);
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

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Relatórios
        </Typography>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Atualizar
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Gerar Novo Relatório
          </Typography>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Tipo de Relatório</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  label="Tipo de Relatório"
                >
                  {reportTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Data Inicial"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <DatePicker
                  label="Data Final"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            </LocalizationProvider>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Formato</InputLabel>
                <Select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  label="Formato"
                >
                  <MenuItem value="PDF">PDF</MenuItem>
                  <MenuItem value="XLSX">Excel</MenuItem>
                  <MenuItem value="CSV">CSV</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={1}>
              <Button
                variant="contained"
                fullWidth
                sx={{ height: '100%' }}
                onClick={handleGenerateReport}
              >
                Gerar
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Relatórios Gerados
            </Typography>

            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome do Relatório</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Período</TableCell>
                  <TableCell>Gerado em</TableCell>
                  <TableCell>Formato</TableCell>
                  <TableCell>Tamanho</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {report.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {reportTypes.find(t => t.id === report.type)?.label || report.type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {report.period}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(report.generatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.format}
                        size="small"
                        color={
                          report.format === 'PDF' ? 'error' :
                          report.format === 'XLSX' ? 'success' : 'primary'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {report.size}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <CloudDownloadIcon fontSize="small" />
                      </IconButton>
                      {report.type === 'storage-usage' && (
                        <IconButton size="small">
                          <PieChartIcon fontSize="small" />
                        </IconButton>
                      )}
                      {report.type === 'cost-analysis' && (
                        <IconButton size="small">
                          <BarChartIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reports;