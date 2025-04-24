import React from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Storage as StorageIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Timeline as TimelineIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import axios from 'axios';

// Registrar componentes do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

const Dashboard = () => {
  const theme = useTheme();

  // Buscar dados do dashboard
  const { data: dashboardData, isLoading, error } = useQuery('dashboardData', async () => {
    const { data } = await axios.get('/api/dashboard');
    return data;
  });

  // Se estiver carregando, mostrar indicador de carregamento
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Se houver erro, mostrar mensagem de erro
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" variant="h6">
          Erro ao carregar dados do dashboard: {error.message}
        </Typography>
      </Box>
    );
  }

  // Dados para o gráfico de distribuição por nuvem (mock)
  const cloudDistributionData = {
    labels: ['AWS', 'Azure', 'Google Cloud'],
    datasets: [
      {
        data: [45, 30, 25],
        backgroundColor: [theme.palette.primary.main, theme.palette.secondary.main, '#F4B400'],
        borderWidth: 1,
      },
    ],
  };

  // Dados para o gráfico de tendência de backups (mock)
  const backupTrendData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Backups Realizados',
        data: [120, 140, 132, 165, 178, 189],
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light + '40',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Configurações do gráfico de tendência
  const backupTrendOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Container maxWidth={false}>
      {/* Título da página */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Painel de Controle
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Visão geral do status de backup e recuperação em todas as nuvens
        </Typography>
      </Box>

      {/* Cards de métricas principais */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total de Clientes */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <PeopleIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                42
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Clientes Ativos
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Volume de Dados */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <StorageIcon sx={{ fontSize: 48, color: theme.palette.secondary.main, mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                24.7 TB
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Volume Total de Dados
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Taxa de Sucesso */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 48, color: '#00C853', mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                98.7%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Taxa de Sucesso de Backups
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Custo Estimado */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 48, color: '#F57C00', mb: 1 }} />
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                R$ 8.650
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Custo Mensal Estimado
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos e Informações detalhadas */}
      <Grid container spacing={3}>
        {/* Gráfico de distribuição por nuvem */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Distribuição por Provedor de Nuvem" />
            <Divider />
            <CardContent sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
              <Box sx={{ height: 300, width: '100%', maxWidth: 400 }}>
                <Pie data={cloudDistributionData} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de tendência de backups */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Tendência de Backups Realizados" />
            <Divider />
            <CardContent sx={{ pt: 2 }}>
              <Box sx={{ height: 300 }}>
                <Line data={backupTrendData} options={backupTrendOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Status atual das operações */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Status de Operações" />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CloudDoneIcon sx={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="AWS Backup Service" 
                    secondary="Todos os sistemas operacionais" 
                  />
                  <Chip label="Online" color="success" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CloudDoneIcon sx={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Azure Recovery Services" 
                    secondary="Todos os sistemas operacionais" 
                  />
                  <Chip label="Online" color="success" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon sx={{ color: theme.palette.warning.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Google Cloud Backup" 
                    secondary="Desempenho reduzido em us-east1" 
                  />
                  <Chip label="Degradado" color="warning" size="small" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TimelineIcon sx={{ color: theme.palette.info.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Monitoramento" 
                    secondary="Sistema de alertas funcionando normalmente" 
                  />
                  <Chip label="Online" color="success" size="small" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Jobs recentes */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader 
              title="Jobs Recentes" 
              action={
                <Button size="small" color="primary">
                  Ver Todos
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Backup Completo - Cliente ABC" 
                    secondary="Concluído há 15 minutos" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Backup Diferencial - Cliente XYZ" 
                    secondary="Concluído há 42 minutos" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ErrorIcon sx={{ color: theme.palette.error.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Backup Banco de Dados - Cliente DEF" 
                    secondary="Falhou há 1 hora" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUpIcon sx={{ color: theme.palette.info.main }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Restauração de Teste - Cliente MNO" 
                    secondary="Em progresso (65%)" 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;

