import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Avatar,
  Paper,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  History as HistoryIcon,
  Key as KeyIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Dados simulados do usuário
const mockUser = {
  id: 'user-1',
  name: 'João Silva',
  email: 'joao.silva@example.com',
  role: 'admin',
  avatar: null,
  phone: '+55 11 98765-4321',
  company: 'Empresa ABC',
  department: 'TI',
  jobTitle: 'Administrador de Sistemas',
  createdAt: '2024-10-15T08:20:00Z',
  lastLogin: '2025-04-23T09:15:00Z',
  mfaEnabled: true,
  apiKeys: [
    {
      id: 'key-1',
      name: 'API Key de Produção',
      lastUsed: '2025-04-23T07:30:00Z',
      createdAt: '2025-01-10T10:00:00Z',
      expiresAt: '2025-07-10T10:00:00Z'
    },
    {
      id: 'key-2',
      name: 'API Key de Teste',
      lastUsed: '2025-04-22T15:45:00Z',
      createdAt: '2025-02-15T14:30:00Z',
      expiresAt: '2025-08-15T14:30:00Z'
    }
  ],
  loginHistory: [
    {
      id: 'login-1',
      timestamp: '2025-04-23T09:15:00Z',
      ipAddress: '192.168.1.100',
      device: 'Chrome / Windows',
      status: 'success'
    },
    {
      id: 'login-2',
      timestamp: '2025-04-22T14:30:00Z',
      ipAddress: '192.168.1.100',
      device: 'Chrome / Windows',
      status: 'success'
    },
    {
      id: 'login-3',
      timestamp: '2025-04-21T16:45:00Z',
      ipAddress: '10.0.0.25',
      device: 'Safari / macOS',
      status: 'success'
    },
    {
      id: 'login-4',
      timestamp: '2025-04-20T11:20:00Z',
      ipAddress: '58.152.33.121',
      device: 'Firefox / Linux',
      status: 'failed'
    }
  ],
  notificationSettings: {
    emailNotifications: true,
    pushNotifications: false,
    jobSuccessNotifications: false,
    jobFailureNotifications: true,
    systemUpdatesNotifications: true
  }
};

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [user, setUser] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Simular carregamento dos dados
    setLoading(true);
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setUser({
      ...user,
      [name]: value
    });
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleSwitchChange = (event) => {
    const { name, checked } = event.target;
    setUser({
      ...user,
      notificationSettings: {
        ...user.notificationSettings,
        [name]: checked
      }
    });
  };

  const handleSaveProfile = () => {
    setSaveLoading(true);
    
    // Simulação de salvar perfil
    setTimeout(() => {
      setSaveLoading(false);
      setSuccess(true);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1000);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('As senhas não correspondem.');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    
    setError('');
    setSaveLoading(true);
    
    // Simular mudança de senha
    setTimeout(() => {
      setSaveLoading(false);
      setSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1000);
  };

  const handleGenerateAPIKey = () => {
    // Simulação de geração de nova chave API
    alert('Nova chave API gerada com sucesso!');
  };

  const handleRevokeAPIKey = (keyId) => {
    // Simulação de revogação de chave API
    setUser({
      ...user,
      apiKeys: user.apiKeys.filter(key => key.id !== keyId)
    });
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const renderProfileTab = () => {
    if (!user) return null;

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            
            <Typography variant="h6" gutterBottom>
              {user.name}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            
            <Chip
              label={user.role === 'admin' ? 'Administrador' : 'Usuário'}
              color={user.role === 'admin' ? 'primary' : 'default'}
              size="small"
              sx={{ mt: 1 }}
            />
            
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              fullWidth
              sx={{ mt: 3 }}
            >
              Alterar Avatar
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informações Pessoais
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  name="name"
                  value={user.name}
                  onChange={handleProfileChange}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={user.email}
                  onChange={handleProfileChange}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  name="phone"
                  value={user.phone}
                  onChange={handleProfileChange}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Empresa"
                  name="company"
                  value={user.company}
                  onChange={handleProfileChange}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Departamento"
                  name="department"
                  value={user.department}
                  onChange={handleProfileChange}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cargo"
                  name="jobTitle"
                  value={user.jobTitle}
                  onChange={handleProfileChange}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveProfile}
                disabled={saveLoading}
              >
                {saveLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderSecurityTab = () => {
    if (!user) return null;

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Alterar Senha
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Senha Atual"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nova Senha"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirmar Nova Senha"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<LockIcon />}
                onClick={handleChangePassword}
                disabled={saveLoading}
              >
                Alterar Senha
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Autenticação de Dois Fatores (MFA)
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={user.mfaEnabled}
                    onChange={(e) => setUser({...user, mfaEnabled: e.target.checked})}
                    color="primary"
                  />
                }
                label="Habilitar autenticação de dois fatores"
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta, exigindo não apenas uma senha mas também um código gerado pelo seu dispositivo.
            </Typography>
            
            {user.mfaEnabled ? (
              <Button
                variant="outlined"
                color="error"
                sx={{ mt: 2 }}
              >
                Desativar MFA
              </Button>
            ) : (
              <Button
                variant="contained"
                sx={{ mt: 2 }}
              >
                Configurar MFA
              </Button>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Chaves de API
              </Typography>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleGenerateAPIKey}
              >
                Gerar Nova Chave
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {user.apiKeys.map((apiKey) => (
                <ListItem key={apiKey.id} divider>
                  <ListItemText
                    primary={apiKey.name}
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" component="span">
                          Criada em: {formatDate(apiKey.createdAt)}
                        </Typography>
                        <br />
                        <Typography variant="body2" component="span">
                          Expira em: {formatDate(apiKey.expiresAt)}
                        </Typography>
                        <br />
                        <Typography variant="body2" component="span">
                          Último uso: {formatDateTime(apiKey.lastUsed)}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" color="error" onClick={() => handleRevokeAPIKey(apiKey.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              
              {user.apiKeys.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Você não possui chaves de API. Clique em "Gerar Nova Chave" para criar uma.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderNotificationsTab = () => {
    if (!user) return null;

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preferências de Notificação
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Notificações por Email" 
                  secondary="Receber notificações via email"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={user.notificationSettings.emailNotifications}
                    onChange={handleSwitchChange}
                    name="emailNotifications"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Notificações Push" 
                  secondary="Receber notificações no navegador"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={user.notificationSettings.pushNotifications}
                    onChange={handleSwitchChange}
                    name="pushNotifications"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
                Tipos de Notificação
              </Typography>
              
              <ListItem>
                <ListItemText 
                  primary="Jobs de Backup bem-sucedidos" 
                  secondary="Receber notificações quando jobs forem concluídos com sucesso"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={user.notificationSettings.jobSuccessNotifications}
                    onChange={handleSwitchChange}
                    name="jobSuccessNotifications"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Falhas em Jobs de Backup" 
                  secondary="Receber notificações quando jobs falharem"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={user.notificationSettings.jobFailureNotifications}
                    onChange={handleSwitchChange}
                    name="jobFailureNotifications"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText 
                  primary="Atualizações do Sistema" 
                  secondary="Receber notificações sobre atualizações e manutenções"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={user.notificationSettings.systemUpdatesNotifications}
                    onChange={handleSwitchChange}
                    name="systemUpdatesNotifications"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveProfile}
                disabled={saveLoading}
              >
                Salvar Preferências
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderActivityTab = () => {
    if (!user) return null;

    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Histórico de Login
              </Typography>
              
              <Button
                startIcon={<RefreshIcon />}
                variant="outlined"
              >
                Atualizar
              </Button>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {user.loginHistory.map((login) => (
                <ListItem key={login.id} divider>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1">
                          {formatDateTime(login.timestamp)}
                        </Typography>
                        <Chip
                          size="small"
                          label={login.status === 'success' ? 'Sucesso' : 'Falha'}
                          color={login.status === 'success' ? 'success' : 'error'}
                          sx={{ ml: 2 }}
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography variant="body2" component="span">
                          IP: {login.ipAddress}
                        </Typography>
                        <br />
                        <Typography variant="body2" component="span">
                          Dispositivo: {login.device}
                        </Typography>
                      </React.Fragment>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Meu Perfil
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Alterações salvas com sucesso!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
            <Tab icon={<PersonIcon />} iconPosition="start" label="Perfil" />
            <Tab icon={<SecurityIcon />} iconPosition="start" label="Segurança" />
            <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notificações" />
            <Tab icon={<HistoryIcon />} iconPosition="start" label="Atividade" />
          </Tabs>
        </Box>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              <Box role="tabpanel" hidden={tabValue !== 0}>
                {tabValue === 0 && renderProfileTab()}
              </Box>
              <Box role="tabpanel" hidden={tabValue !== 1}>
                {tabValue === 1 && renderSecurityTab()}
              </Box>
              <Box role="tabpanel" hidden={tabValue !== 2}>
                {tabValue === 2 && renderNotificationsTab()}
              </Box>
              <Box role="tabpanel" hidden={tabValue !== 3}>
                {tabValue === 3 && renderActivityTab()}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;