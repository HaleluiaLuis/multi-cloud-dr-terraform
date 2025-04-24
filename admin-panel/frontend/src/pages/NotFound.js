import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Typography, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          py: 4,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
        
        <Typography variant="h2" component="h1" gutterBottom>
          404
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom>
          Página não encontrada
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
          A página que você está procurando não existe ou foi movida.
        </Typography>
        
        <Button
          component={Link}
          to="/dashboard"
          variant="contained"
          size="large"
        >
          Voltar para o Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;