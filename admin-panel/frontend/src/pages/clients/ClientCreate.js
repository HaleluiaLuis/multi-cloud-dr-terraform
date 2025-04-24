import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Alert,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const clientTypes = [
  { id: 'enterprise', label: 'Empresa' },
  { id: 'government', label: 'Governo' },
  { id: 'education', label: 'Educação' }
];

const cloudProviders = [
  { id: 'aws', label: 'Amazon Web Services (AWS)' },
  { id: 'azure', label: 'Microsoft Azure' },
  { id: 'gcp', label: 'Google Cloud Platform (GCP)' },
  { id: 'multi', label: 'Multi-Cloud' }
];

const ClientCreate = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Dados do cliente
  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    phone: '',
    type: '',
    address: '',
    city: '',
    state: '',
    country: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: ''
  });

  // Configurações do backup
  const [backupConfig, setBackupConfig] = useState({
    cloudProvider: '',
    region: '',
    resourceCount: '',
    retentionPolicy: '30',
    backupFrequency: 'daily',
    drEnabled: false
  });

  const handleClientChange = (e) => {
    const { name, value } = e.target;
    setClientData({
      ...clientData,
      [name]: value
    });
  };

  const handleBackupChange = (e) => {
    const { name, value } = e.target;
    setBackupConfig({
      ...backupConfig,
      [name]: value
    });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validações do primeiro passo
      if (!clientData.name || !clientData.email || !clientData.type) {
        setError('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
    } else if (activeStep === 1) {
      // Validações do segundo passo
      if (!backupConfig.cloudProvider || !backupConfig.region) {
        setError('Por favor, selecione o provedor de nuvem e a região.');
        return;
      }
    }

    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Simulação de envio para o backend
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccess(true);
      
      // Redirecionar para a lista de clientes após 2 segundos
      setTimeout(() => {
        navigate('/clients');
      }, 2000);
    } catch (err) {
      setError('Erro ao criar cliente. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderClientForm = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Informações do Cliente
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            label="Nome da Empresa"
            name="name"
            value={clientData.name}
            onChange={handleClientChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Tipo de Cliente</InputLabel>
            <Select
              name="type"
              value={clientData.type}
              onChange={handleClientChange}
              label="Tipo de Cliente"
            >
              {clientTypes.map(type => (
                <MenuItem key={type.id} value={type.id}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={clientData.email}
            onChange={handleClientChange}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Telefone"
            name="phone"
            value={clientData.phone}
            onChange={handleClientChange}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Endereço
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Endereço"
            name="address"
            value={clientData.address}
            onChange={handleClientChange}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Cidade"
            name="city"
            value={clientData.city}
            onChange={handleClientChange}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Estado"
            name="state"
            value={clientData.state}
            onChange={handleClientChange}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="País"
            name="country"
            value={clientData.country}
            onChange={handleClientChange}
          />
        </Grid>
        
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Contato Principal
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Nome do Contato"
            name="contactPerson"
            value={clientData.contactPerson}
            onChange={handleClientChange}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Email do Contato"
            name="contactEmail"
            type="email"
            value={clientData.contactEmail}
            onChange={handleClientChange}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Telefone do Contato"
            name="contactPhone"
            value={clientData.contactPhone}
            onChange={handleClientChange}
          />
        </Grid>
      </Grid>
    );
  };

  const renderBackupForm = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Configuração de Backup
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Provedor de Nuvem</InputLabel>
            <Select
              name="cloudProvider"
              value={backupConfig.cloudProvider}
              onChange={handleBackupChange}
              label="Provedor de Nuvem"
            >
              {cloudProviders.map(provider => (
                <MenuItem key={provider.id} value={provider.id}>
                  {provider.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            required
            fullWidth
            label="Região"
            name="region"
            value={backupConfig.region}
            onChange={handleBackupChange}
            placeholder="Ex: us-east-1, eastus, us-central1"
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Quantidade de Recursos"
            name="resourceCount"
            type="number"
            value={backupConfig.resourceCount}
            onChange={handleBackupChange}
            placeholder="Ex: 10"
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Política de Retenção</InputLabel>
            <Select
              name="retentionPolicy"
              value={backupConfig.retentionPolicy}
              onChange={handleBackupChange}
              label="Política de Retenção"
            >
              <MenuItem value="7">7 dias</MenuItem>
              <MenuItem value="14">14 dias</MenuItem>
              <MenuItem value="30">30 dias</MenuItem>
              <MenuItem value="60">60 dias</MenuItem>
              <MenuItem value="90">90 dias</MenuItem>
              <MenuItem value="180">180 dias</MenuItem>
              <MenuItem value="365">365 dias</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Frequência de Backup</InputLabel>
            <Select
              name="backupFrequency"
              value={backupConfig.backupFrequency}
              onChange={handleBackupChange}
              label="Frequência de Backup"
            >
              <MenuItem value="hourly">A cada hora</MenuItem>
              <MenuItem value="daily">Diário</MenuItem>
              <MenuItem value="weekly">Semanal</MenuItem>
              <MenuItem value="monthly">Mensal</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>DR Habilitado</InputLabel>
            <Select
              name="drEnabled"
              value={backupConfig.drEnabled}
              onChange={handleBackupChange}
              label="DR Habilitado"
            >
              <MenuItem value={true}>Sim</MenuItem>
              <MenuItem value={false}>Não</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    );
  };

  const renderReview = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Revisar Informações
          </Typography>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Informações do Cliente
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nome:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {clientData.name || '-'}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Tipo:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {clientTypes.find(t => t.id === clientData.type)?.label || '-'}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Email:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {clientData.email || '-'}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Endereço:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {clientData.address ? 
                  `${clientData.address}, ${clientData.city}, ${clientData.state}, ${clientData.country}` : 
                  '-'}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Contato Principal:
              </Typography>
              <Typography variant="body1">
                {clientData.contactPerson ? 
                  `${clientData.contactPerson} (${clientData.contactEmail})` : 
                  '-'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Configuração de Backup
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Provedor de Nuvem:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {cloudProviders.find(p => p.id === backupConfig.cloudProvider)?.label || '-'}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Região:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {backupConfig.region || '-'}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Recursos:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {backupConfig.resourceCount || '0'} recursos
              </Typography>
            </Box>
            
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Retenção:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {backupConfig.retentionPolicy} dias
              </Typography>
            </Box>
            
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Frequência:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {backupConfig.backupFrequency === 'hourly' && 'A cada hora'}
                {backupConfig.backupFrequency === 'daily' && 'Diário'}
                {backupConfig.backupFrequency === 'weekly' && 'Semanal'}
                {backupConfig.backupFrequency === 'monthly' && 'Mensal'}
              </Typography>
            </Box>
            
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                DR Habilitado:
              </Typography>
              <Typography variant="body1">
                {backupConfig.drEnabled ? 'Sim' : 'Não'}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderSuccess = () => {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        
        <Typography variant="h5" gutterBottom>
          Cliente Criado com Sucesso!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          O cliente {clientData.name} foi criado e as configurações de backup foram aplicadas.
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          Redirecionando para a lista de clientes...
        </Typography>
      </Box>
    );
  };

  const steps = ['Informações do Cliente', 'Configuração de Backup', 'Revisar e Confirmar'];

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return renderClientForm();
      case 1:
        return renderBackupForm();
      case 2:
        return renderReview();
      default:
        return 'Passo desconhecido';
    }
  };

  return (
    <Box sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/clients')}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        
        <Typography variant="h5" component="h1">
          Adicionar Novo Cliente
        </Typography>
      </Box>

      <Card>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success ? (
            renderSuccess()
          ) : (
            <>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {getStepContent(activeStep)}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                {activeStep !== 0 && (
                  <Button
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Voltar
                  </Button>
                )}

                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Criando...' : 'Criar Cliente'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                  >
                    Próximo
                  </Button>
                )}
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClientCreate;