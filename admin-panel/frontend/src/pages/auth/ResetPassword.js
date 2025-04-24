import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  InputAdornment, 
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  
  const { token } = useParams();
  const navigate = useNavigate();

  // Simular validação do token
  useEffect(() => {
    const validateToken = async () => {
      try {
        // Aqui seria a chamada para o backend para validar o token
        // const response = await api.auth.validateResetToken(token);
        
        // Simulando uma resposta
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Para teste, consideramos o token válido se tiver pelo menos 8 caracteres
        if (token && token.length >= 8) {
          setTokenValid(true);
        } else {
          setError('Token inválido ou expirado');
        }
      } catch (err) {
        setError('Não foi possível validar o token');
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    try {
      setError('');
      setLoading(true);
      // Aqui seria a chamada para o backend para redefinir a senha
      // await api.auth.resetPassword(token, password);
      
      // Simulando uma resposta bem-sucedida
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('Senha alterada com sucesso!');
      
      // Redirecionar para o login após alguns segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Erro ao redefinir senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Validando token...
        </Typography>
      </Box>
    );
  }

  if (!tokenValid) {
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
            borderRadius: 2 
          }}
        >
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'O link de redefinição de senha é inválido ou expirou.'}
          </Alert>
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            Por favor, solicite um novo link de redefinição de senha.
          </Typography>
          
          <Button
            component={Link}
            to="/forgot-password"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
          >
            Solicitar novo link
          </Button>
        </Paper>
      </Box>
    );
  }

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
          Redefinir Senha
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 3, textAlign: 'center' }}>
          Digite sua nova senha
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
            name="password"
            label="Nova Senha"
            type={showPassword ? 'text' : 'password'}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!!message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirmar Nova Senha"
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={!!message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.2 }}
            disabled={loading || !!message}
          >
            {loading ? 'Processando...' : 'Redefinir Senha'}
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

export default ResetPassword;