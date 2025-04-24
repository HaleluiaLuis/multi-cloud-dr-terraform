import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Typography,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Backup as BackupIcon,
  Refresh as RefreshIcon,
  CloudDownload as CloudDownloadIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Storage as StorageIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { DataGrid } from '@mui/x-data-grid';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';

// Componente para exibir as informações de um cliente específico
const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  // Carregar dados do cliente
  const {
    data: clientData,
    isLoading,
    error,
    refetch,
  } = useQuery(['client', id], async () => {
    const { data } = await axios.get(`/api/clients/${id}`);
    return data;
  });

  // Manipulador para mudança de abas
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Abrir diálogo de exclusão
  const handleOpenDeleteDialog = () => {
    setDeleteDialogOpen(true);
  };

  // Fechar diálogo de exclusão
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  // Excluir cliente
  const handleDeleteClient = async () => {
    try {
      await axios.delete(`/api/clients/${id}`);
      navigate('/clients');
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      // Aqui poderia ser implementada uma notificação de erro
    }
  };

  // Abrir diálogo de confirmação de ação
  const handleOpenConfirmationDialog = (type) => {
    setActionType(type);
    setConfirmationDialogOpen(true);
  };

  // Fechar diálogo de confirmação de ação
  const handleCloseConfirmationDialog = () => {
    setConfirmationDialogOpen(false);
  };

  // Executar ação de backup ou restauração
  const handleExecuteAction = async () => {
    try {
      if (actionType === 'backup') {
        await axios.post(`/api/clients/${id}/backup`);
      } else if (actionType === 'restore') {
        await axios.post(`/api/clients/${id}/restore`);
      } else if (actionType === 'pause') {
        await axios.post(`/api/clients/${id}/pause`);
      } else if (actionType === 'resume') {
        await axios.post(`/api/clients/${id}/resume`);
      }
      
      refetch();
      handleCloseConfirmationDialog();
    } catch (error) {
      console.error(`Erro ao executar ação ${actionType}:`, error);
      // Aqui poderia ser implementada uma notificação de erro
    }
  };

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
          Erro ao carregar dados do cliente: {error.message}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          sx={{ mt: 2 }}
        >
          Tentar Novamente
        </Button>
      </Box>
    );
  }

  // Dados do cliente (simulado para demonstração)
  const client = clientData?.client || {
    id,
    name: 'Tech Solutions Inc.',
    email: 'contact@techsolutions.com',
    status: 'Ativo',
    environment: 'Produção',
    createdAt: '2024-01-15T10:30:00Z',
    providers: ['AWS', 'Azure'],
    totalStorage: 2500,
    lastBackup: '2025-04-23T08:15:00Z',
    nextBackup: '2025-04-25T08:00:00Z',
    backupFrequency: 'Diário',
    retentionPolicy: '30 dias',
    backupType: 'Incremental',
    backupHistory: [
      { id: 1, date: '2025-04-23T08:15:00Z', status: 'Sucesso', size: 125, duration: '45 min' },
      { id: 2, date: '2025-04-22T08:10:00Z', status: 'Sucesso', size: 128, duration: '48 min' },
      { id: 3, date: '2025-04-21T08:12:00Z', status: 'Falha', size: 0, duration: '10 min' },
      { id: 4, date: '2025-04-20T08:18:00Z', status: 'Sucesso', size: 127, duration: '47 min' },
    ],
    resources: [
      { id: 1, name: 'Banco de Dados PostgreSQL', type: 'RDS', size: 850, status: 'Protegido' },
      { id: 2, name: 'Servidor de Aplicação', type: 'EC2', size: 950, status: 'Protegido' },
      { id: 3, name: 'Servidor de Arquivos', type: 'Storage Account', size: 700, status: 'Protegido' },
    ],
    timeline: [
      { id: 1, date: '2025-04-23T08:15:00Z', event: 'Backup concluído com sucesso', type: 'success' },
      { id: 2, date: '2025-04-21T08:12:00Z', event: 'Backup falhou - problema de conectividade', type: 'error' },
      { id: 3, date: '2025-03-15T14:30:00Z', event: 'Configuração de backup modificada', type: 'info' },
      { id: 4, date: '2025-01-15T10:30:00Z', event: 'Cliente criado', type: 'info' },
    ]
  };

  // Colunas para a tabela de histórico de backups
  const backupHistoryColumns = [
    { 
      field: 'date', 
      headerName: 'Data', 
      width: 180,
      valueFormatter: (params) => new Date(params.value).toLocaleString('pt-BR'),
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'Sucesso' ? 'success' : 'error'} 
          size="small" 
        />
      ),
    },
    { field: 'size', headerName: 'Tamanho (GB)', width: 150 },
    { field: 'duration', headerName: 'Duração', width: 150 },
  ];

  // Colunas para a tabela de recursos
  const resourcesColumns = [
    { field: 'name', headerName: 'Nome', flex: 1 },
    { field: 'type', headerName: 'Tipo', width: 150 },
    { field: 'size', headerName: 'Tamanho (GB)', width: 150 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'Protegido' ? 'success' : 'warning'} 
          size="small" 
        />
      ),
    },
  ];

  return (
    <Container maxWidth={false}>
      {/* Botão voltar e título da página */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/clients')}
          sx={{ mb: 2 }}
        >
          Voltar para Clientes
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            {client.name}
          </Typography>
          
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<BackupIcon />}
              onClick={() => handleOpenConfirmationDialog('backup')}
              sx={{ mr: 1 }}
            >
              Iniciar Backup
            </Button>
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CloudDownloadIcon />}
              onClick={() => handleOpenConfirmationDialog('restore')}
              sx={{ mr: 1 }}
            >
              Teste de Restauração
            </Button>
            
            {client.status === 'Ativo' ? (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<PauseIcon />}
                onClick={() => handleOpenConfirmationDialog('pause')}
                sx={{ mr: 1 }}
              >
                Pausar
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="success"
                startIcon={<PlayArrowIcon />}
                onClick={() => handleOpenConfirmationDialog('resume')}
                sx={{ mr: 1 }}
              >
                Retomar
              </Button>
            )}
            
            <IconButton 
              color="primary" 
              onClick={() => navigate(`/clients/${id}/edit`)}
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
            
            <IconButton 
              color="error" 
              onClick={handleOpenDeleteDialog}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Informações resumidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Informações Gerais" />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Email" 
                    secondary={client.email} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Status" 
                    secondary={
                      <Chip 
                        label={client.status} 
                        color={client.status === 'Ativo' ? 'success' : 'default'}
                        size="small"
                      />
                    } 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Ambiente" 
                    secondary={client.environment} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Cliente desde" 
                    secondary={new Date(client.createdAt).toLocaleDateString('pt-BR')} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Provedores de Nuvem" 
                    secondary={
                      <Box>
                        {client.providers.map((provider) => {
                          let color;
                          switch (provider.toLowerCase()) {
                            case 'aws':
                              color = '#FF9900';
                              break;
                            case 'azure':
                              color = '#0078D4';
                              break;
                            case 'gcp':
                              color = '#4285F4';
                              break;
                            default:
                              color = 'default';
                          }
                          
                          return (
                            <Chip 
                              key={provider} 
                              label={provider} 
                              size="small" 
                              sx={{ 
                                mr: 0.5, 
                                backgroundColor: color,
                                color: 'white' 
                              }} 
                            />
                          );
                        })}
                      </Box>
                    } 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Detalhes de Backup" />
            <Divider />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="Último Backup" 
                    secondary={new Date(client.lastBackup).toLocaleString('pt-BR')} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Próximo Backup" 
                    secondary={new Date(client.nextBackup).toLocaleString('pt-BR')} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Frequência de Backup" 
                    secondary={client.backupFrequency} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Política de Retenção" 
                    secondary={client.retentionPolicy} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Tipo de Backup" 
                    secondary={client.backupType} 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="Armazenamento Total" 
                    secondary={client.totalStorage >= 1024 
                      ? `${(client.totalStorage / 1024).toFixed(2)} TB` 
                      : `${client.totalStorage} GB`
                    } 
                    primaryTypographyProps={{ variant: 'subtitle2' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Abas para histórico, recursos e configurações */}
      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<HistoryIcon />} label="Histórico de Backups" />
          <Tab icon={<StorageIcon />} label="Recursos Protegidos" />
          <Tab icon={<TimelineIcon />} label="Linha do Tempo" />
          <Tab icon={<SettingsIcon />} label="Configurações" />
        </Tabs>
        
        <Divider />
        
        {/* Conteúdo da aba de Histórico de Backups */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <DataGrid
              rows={client.backupHistory}
              columns={backupHistoryColumns}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 25]}
              autoHeight
              disableSelectionOnClick
              density="standard"
            />
          </Box>
        )}
        
        {/* Conteúdo da aba de Recursos Protegidos */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <DataGrid
              rows={client.resources}
              columns={resourcesColumns}
              pageSize={5}
              rowsPerPageOptions={[5, 10]}
              autoHeight
              disableSelectionOnClick
              density="standard"
            />
          </Box>
        )}
        
        {/* Conteúdo da aba de Linha do Tempo */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Timeline position="alternate">
              {client.timeline.map((item) => (
                <TimelineItem key={item.id}>
                  <TimelineSeparator>
                    <TimelineDot 
                      color={
                        item.type === 'success' ? 'success' :
                        item.type === 'error' ? 'error' : 'primary'
                      }
                    >
                      {item.type === 'success' ? <CheckCircleIcon /> :
                       item.type === 'error' ? <ErrorIcon /> : 
                       <HistoryIcon />}
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle2" component="span">
                      {new Date(item.date).toLocaleString('pt-BR')}
                    </Typography>
                    <Typography>{item.event}</Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Box>
        )}
        
        {/* Conteúdo da aba de Configurações */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Configurações de Backup
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              As configurações avançadas de backup e recuperação podem ser modificadas aqui.
              Para alterar, use o botão Editar no topo da página.
            </Typography>
            
            {/* Placeholder para futuras configurações */}
            <Typography variant="body1" paragraph>
              Configurações de backup atualmente ativas:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Tipo de Backup" secondary={client.backupType} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Frequência" secondary={client.backupFrequency} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Retenção" secondary={client.retentionPolicy} />
              </ListItem>
            </List>
          </Box>
        )}
      </Paper>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o cliente {client.name}? Esta ação não pode ser desfeita e removerá toda a infraestrutura de backup associada.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleDeleteClient} color="error">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmação de ação */}
      <Dialog
        open={confirmationDialogOpen}
        onClose={handleCloseConfirmationDialog}
      >
        <DialogTitle>
          {actionType === 'backup' && 'Iniciar Backup'}
          {actionType === 'restore' && 'Teste de Restauração'}
          {actionType === 'pause' && 'Pausar Backups'}
          {actionType === 'resume' && 'Retomar Backups'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === 'backup' && `Deseja iniciar um backup manual para ${client.name}? Esta operação pode levar alguns minutos.`}
            {actionType === 'restore' && `Deseja iniciar um teste de restauração para ${client.name}? Esta é apenas uma operação de teste e não afetará os dados de produção.`}
            {actionType === 'pause' && `Deseja pausar os backups para ${client.name}? Nenhum backup automático será executado até que os backups sejam retomados.`}
            {actionType === 'resume' && `Deseja retomar os backups para ${client.name}? Os backups automáticos serão executados conforme programado.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmationDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleExecuteAction} color="primary" variant="contained">
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClientDetails;

