import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudDone as CloudDoneIcon,
  CloudOff as CloudOffIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';

const ClientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Carregar a lista de clientes
  const {
    data: clientsData,
    isLoading,
    error,
    refetch,
  } = useQuery('clients', async () => {
    const { data } = await axios.get('/api/clients');
    return data;
  });

  // Abrir diálogo de confirmação de exclusão
  const handleOpenDeleteDialog = (id) => {
    setSelectedClientId(id);
    setDeleteDialogOpen(true);
  };

  // Fechar diálogo de confirmação de exclusão
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedClientId(null);
  };

  // Excluir cliente
  const handleDeleteClient = async () => {
    try {
      await axios.delete(`/api/clients/${selectedClientId}`);
      refetch(); // Recarregar a lista após excluir
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      // Aqui poderia ser implementada uma notificação de erro
    }
  };

  // Filtrar clientes com base no termo de pesquisa
  const filteredClients = clientsData?.clients?.filter((client) => {
    if (!searchTerm) return true;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(lowercaseSearch) ||
      client.email.toLowerCase().includes(lowercaseSearch) ||
      client.environment.toLowerCase().includes(lowercaseSearch)
    );
  }) || [];

  // Colunas da tabela
  const columns = [
    { 
      field: 'name', 
      headerName: 'Cliente', 
      flex: 1,
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      flex: 1,
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'Ativo' ? 'success' : 'default'} 
          size="small" 
        />
      ),
    },
    { 
      field: 'environment', 
      headerName: 'Ambiente', 
      width: 130,
    },
    { 
      field: 'providers', 
      headerName: 'Provedores', 
      width: 200,
      renderCell: (params) => (
        <Box>
          {params.value.map((provider) => {
            // Cores diferentes para cada provedor
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
      ),
    },
    { 
      field: 'totalStorage', 
      headerName: 'Armazenamento', 
      width: 150,
      valueFormatter: (params) => {
        // Formatar tamanho em GB/TB
        if (params.value >= 1024) {
          return `${(params.value / 1024).toFixed(2)} TB`;
        }
        return `${params.value} GB`;
      },
    },
    { 
      field: 'lastBackup', 
      headerName: 'Último Backup', 
      width: 180,
      valueFormatter: (params) => {
        // Formatar data
        if (!params.value) return 'N/A';
        return new Date(params.value).toLocaleString('pt-BR');
      },
    },
    { 
      field: 'actions', 
      headerName: 'Ações', 
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Visualizar">
            <IconButton 
              size="small" 
              onClick={() => navigate(`/clients/${params.row.id}`)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton 
              size="small" 
              onClick={() => navigate(`/clients/${params.row.id}/edit`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton 
              size="small" 
              onClick={() => handleOpenDeleteDialog(params.row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

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
          Erro ao carregar clientes: {error.message}
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

  return (
    <Container maxWidth={false}>
      {/* Cabeçalho da página */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Clientes
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Gerenciar todos os clientes da plataforma
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/clients/new')}
        >
          Novo Cliente
        </Button>
      </Box>

      {/* Barra de pesquisa */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Buscar por nome, email ou ambiente..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Tabela de clientes */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ height: 650, width: '100%' }}>
          <DataGrid
            rows={filteredClients}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection
            disableSelectionOnClick
            components={{ Toolbar: GridToolbar }}
            componentsProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            density="standard"
            loading={isLoading}
          />
        </Box>
      </Paper>

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita e removerá toda a infraestrutura de backup associada.
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
    </Container>
  );
};

export default ClientList;

