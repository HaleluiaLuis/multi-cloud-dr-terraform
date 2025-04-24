import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Backup as BackupIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  CloudSync as CloudSyncIcon
} from '@mui/icons-material';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Configurações gerais
  const [settings, setSettings] = useState({
    // Configurações gerais
    systemName: 'Backup DR SaaS',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    
    // Configurações de backup
    defaultBackupRetention: 30,
    defaultBackupCompression: true,
    defaultBackupEncryption: true,
    defaultBackupSchedule: 'daily',
    
    // Configurações de notificação
    emailNotifications: true,
    slackNotifications: false,
    slackWebhookUrl: '',
    emailOnSuccess: false,
    emailOnWarning: true,
    emailOnFailure: true,
    
    // Configurações de provedores de nuvem
    awsEnabled: true,
    azureEnabled: true,
    gcpEnabled: true,
    defaultProvider: 'aws',
    
    // Configurações de segurança
    mfaEnabled: true,
    sessionTimeout: 60,
    passwordPolicy: 'strong',
    apiKeyExpiration: 90
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (event) => {
    const { name, value } = event.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  const handleSwitchChange = (event) => {
    const { name, checked } = event.target;
    setSettings({
      ...settings,
      [name]: checked
    });
  };

  const handleSaveSettings = () => {
    setSaveLoading(true);
    
    // Simulação de salvar configurações
    setTimeout(() => {
      setSaveLoading(false);
      setSuccess(true);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1000);
  };

  const passwordPolicies = [
    { value: 'basic', label: 'Básica (min. 8 caracteres)' },
    { value: 'medium', label: 'Média (min. 10 caracteres, letras e números)' },
    { value: 'strong', label: 'Forte (min. 12 caracteres, letras, números e símbolos)' }
  ];

  const backupSchedules = [
    { value: 'hourly', label: 'A cada hora' },
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' }
  ];

  const cloudProviders = [
    { value: 'aws', label: 'Amazon Web Services (AWS)' },
    { value: 'azure', label: 'Microsoft Azure' },
    { value: 'gcp', label: 'Google Cloud Platform (GCP)' }
  ];

  const languages = [
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en-US', label: 'English (US)' },
    { value: 'es-ES', label: 'Español' }
  ];

  const timezones = [
    { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
    { value: 'America/New_York', label: 'New York (GMT-4)' },
    { value: 'Europe/London', label: 'London (GMT+1)' },
    { value: 'Europe/Paris', label: 'Paris (GMT+2)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' }
  ];

  const renderGeneralSettings = () => {
    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Typography variant="h6">Configurações Gerais</Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Nome do Sistema"
            name="systemName"
            value={settings.systemName}
            onChange={handleSettingChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Idioma</InputLabel>
            <Select
              name="language"
              value={settings.language}
              onChange={handleSettingChange}
              label="Idioma"
            >
              {languages.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Fuso Horário</InputLabel>
            <Select
              name="timezone"
              value={settings.timezone}
              onChange={handleSettingChange}
              label="Fuso Horário"
            >
              {timezones.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Formato de Data</InputLabel>
            <Select
              name="dateFormat"
              value={settings.dateFormat}
              onChange={handleSettingChange}
              label="Formato de Data"
            >
              <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
              <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
              <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Formato de Tempo</InputLabel>
            <Select
              name="timeFormat"
              value={settings.timeFormat}
              onChange={handleSettingChange}
              label="Formato de Tempo"
            >
              <MenuItem value="12h">12 horas (AM/PM)</MenuItem>
              <MenuItem value="24h">24 horas</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    );
  };

  const renderBackupSettings = () => {
    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Typography variant="h6">Configurações de Backup</Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Retenção Padrão (dias)"
            name="defaultBackupRetention"
            type="number"
            value={settings.defaultBackupRetention}
            onChange={handleSettingChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Agenda Padrão</InputLabel>
            <Select
              name="defaultBackupSchedule"
              value={settings.defaultBackupSchedule}
              onChange={handleSettingChange}
              label="Agenda Padrão"
            >
              {backupSchedules.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.defaultBackupCompression}
                onChange={handleSwitchChange}
                name="defaultBackupCompression"
                color="primary"
              />
            }
            label="Compressão Padrão"
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.defaultBackupEncryption}
                onChange={handleSwitchChange}
                name="defaultBackupEncryption"
                color="primary"
              />
            }
            label="Criptografia Padrão"
          />
        </Grid>
      </Grid>
    );
  };

  const renderNotificationSettings = () => {
    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Typography variant="h6">Configurações de Notificação</Typography>
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={handleSwitchChange}
                name="emailNotifications"
                color="primary"
              />
            }
            label="Notificações por Email"
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.slackNotifications}
                onChange={handleSwitchChange}
                name="slackNotifications"
                color="primary"
              />
            }
            label="Notificações via Slack"
          />
        </Grid>
        
        {settings.slackNotifications && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="URL do Webhook do Slack"
              name="slackWebhookUrl"
              value={settings.slackWebhookUrl}
              onChange={handleSettingChange}
              placeholder="https://hooks.slack.com/services/..."
            />
          </Grid>
        )}
        
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Enviar notificações para:
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailOnSuccess}
                onChange={handleSwitchChange}
                name="emailOnSuccess"
                color="success"
              />
            }
            label="Backups concluídos com sucesso"
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailOnWarning}
                onChange={handleSwitchChange}
                name="emailOnWarning"
                color="warning"
              />
            }
            label="Backups concluídos com avisos"
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailOnFailure}
                onChange={handleSwitchChange}
                name="emailOnFailure"
                color="error"
              />
            }
            label="Backups com falha"
          />
        </Grid>
      </Grid>
    );
  };

  const renderCloudSettings = () => {
    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Typography variant="h6">Configurações de Provedores de Nuvem</Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Provedores Habilitados
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.awsEnabled}
                      onChange={handleSwitchChange}
                      name="awsEnabled"
                      color="primary"
                    />
                  }
                  label="Amazon Web Services (AWS)"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.azureEnabled}
                      onChange={handleSwitchChange}
                      name="azureEnabled"
                      color="primary"
                    />
                  }
                  label="Microsoft Azure"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.gcpEnabled}
                      onChange={handleSwitchChange}
                      name="gcpEnabled"
                      color="primary"
                    />
                  }
                  label="Google Cloud Platform (GCP)"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Provedor Padrão</InputLabel>
            <Select
              name="defaultProvider"
              value={settings.defaultProvider}
              onChange={handleSettingChange}
              label="Provedor Padrão"
              disabled={!settings.awsEnabled && !settings.azureEnabled && !settings.gcpEnabled}
            >
              {cloudProviders.map(option => (
                <MenuItem 
                  key={option.value} 
                  value={option.value}
                  disabled={
                    (option.value === 'aws' && !settings.awsEnabled) ||
                    (option.value === 'azure' && !settings.azureEnabled) ||
                    (option.value === 'gcp' && !settings.gcpEnabled)
                  }
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    );
  };

  const renderSecuritySettings = () => {
    return (
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Typography variant="h6">Configurações de Segurança</Typography>
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.mfaEnabled}
                onChange={handleSwitchChange}
                name="mfaEnabled"
                color="primary"
              />
            }
            label="Autenticação de Dois Fatores (MFA) Obrigatória"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Tempo Limite da Sessão (minutos)"
            name="sessionTimeout"
            type="number"
            value={settings.sessionTimeout}
            onChange={handleSettingChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Política de Senha</InputLabel>
            <Select
              name="passwordPolicy"
              value={settings.passwordPolicy}
              onChange={handleSettingChange}
              label="Política de Senha"
            >
              {passwordPolicies.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Expiração de Chave API (dias)"
            name="apiKeyExpiration"
            type="number"
            value={settings.apiKeyExpiration}
            onChange={handleSettingChange}
          />
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Configurações
        </Typography>
        
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
          disabled={saveLoading}
        >
          {saveLoading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Configurações salvas com sucesso!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="settings tabs">
            <Tab icon={<LanguageIcon />} iconPosition="start" label="Geral" />
            <Tab icon={<BackupIcon />} iconPosition="start" label="Backup" />
            <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notificações" />
            <Tab icon={<CloudSyncIcon />} iconPosition="start" label="Provedores" />
            <Tab icon={<SecurityIcon />} iconPosition="start" label="Segurança" />
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
                {tabValue === 0 && renderGeneralSettings()}
              </Box>
              <Box role="tabpanel" hidden={tabValue !== 1}>
                {tabValue === 1 && renderBackupSettings()}
              </Box>
              <Box role="tabpanel" hidden={tabValue !== 2}>
                {tabValue === 2 && renderNotificationSettings()}
              </Box>
              <Box role="tabpanel" hidden={tabValue !== 3}>
                {tabValue === 3 && renderCloudSettings()}
              </Box>
              <Box role="tabpanel" hidden={tabValue !== 4}>
                {tabValue === 4 && renderSecuritySettings()}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;