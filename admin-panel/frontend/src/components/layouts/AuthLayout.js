import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography, useTheme } from '@mui/material';
import CloudIcon from '@mui/icons-material/Cloud';

/**
 * Layout para as páginas de autenticação (login, recuperação de senha)
 * Exibe um layout centralizado com o logo e uma área para o formulário
 */
export default function AuthLayout() {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Cabeçalho da página */}
      <Box
        component="header"
        sx={{
          py: 3,
          px: 2,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CloudIcon 
            sx={{ 
              fontSize: 40, 
              mr: 1, 
              color: theme.palette.primary.main 
            }} 
          />
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
            }}
          >
            Backup & DR SaaS
          </Typography>
        </Box>
      </Box>
      
      {/* Conteúdo principal */}
      <Container 
        component="main" 
        maxWidth="sm" 
        sx={{ 
          mt: 4,
          mb: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            p: 4,
            width: '100%',
            backgroundColor: 'white',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* O conteúdo da página de autenticação será renderizado aqui */}
          <Outlet />
        </Paper>
      </Container>
      
      {/* Rodapé */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.background.paper,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} Backup & DR SaaS. Todos os direitos reservados.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Soluções de backup e recuperação de desastres para múltiplas nuvens
        </Typography>
      </Box>
    </Box>
  );
}

