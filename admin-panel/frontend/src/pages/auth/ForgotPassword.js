import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Alert 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Por favor, insira seu email');
      return;
    }

    try {
      setError('');
      setLoading(true);
      // Aqui seria a chamada para o backend para enviar o email de recuperação de senha
      // await api.auth.forgotPassword(email);
      
      // Simulando uma resposta bem-sucedida
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('Email enviado com sucesso! Verifique sua caixa de entrada.');
    } catch (err) {
      setError(err.message || 'Erro ao processar sua solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 400,
        mx: 'auto',
        p: 2,
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          width: '100%', 
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography component="h1" variant="h5" color="primary" sx={{ mb: 3, fontWeight: 600 }}>
          Recuperação de Senha
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
          Digite seu email para receber um link de recuperação de senha
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        {message && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            {message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!!message}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.2 }}
            disabled={loading || !!message}
          >
            {loading ? 'Enviando...' : 'Enviar link de recuperação'}
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2" color="primary">
                Voltar para o login
              </Typography>
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;