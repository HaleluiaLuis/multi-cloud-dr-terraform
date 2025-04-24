import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  useTheme
} from '@mui/material';

// Ícones
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BackupIcon from '@mui/icons-material/Backup';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import CloudIcon from '@mui/icons-material/Cloud';

import { useAuth } from '../../contexts/AuthContext';

// Largura do drawer lateral
const drawerWidth = 240;

// Itens do menu lateral
const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Clientes', icon: <PeopleIcon />, path: '/clients' },
  { text: 'Jobs de Backup', icon: <BackupIcon />, path: '/jobs' },
  { text: 'Relatórios', icon: <AssessmentIcon />, path: '/reports' },
  { text: 'Monitoramento', icon: <MonitorHeartIcon />, path: '/monitoring' },
  { text: 'Configurações', icon: <SettingsIcon />, path: '/settings' }
];

export default function DashboardLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  // Manipuladores para abrir/fechar o drawer
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // Manipuladores para menu de perfil
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  // Manipuladores para menu de notificações
  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  // Manipulador de logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Manipulador para navegação
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Barra de Navegação Superior */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 2,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo e Título */}
          <CloudIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'Poppins',
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 1,
            }}
          >
            Backup & DR SaaS
          </Typography>
          
          {/* Ícones de Ação */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Notificações */}
            <IconButton
              size="large"
              color="inherit"
              onClick={handleNotificationMenuOpen}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            {/* Perfil */}
            <IconButton
              size="large"
              edge="end"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{ ml: 1 }}
            >
              <Avatar
                sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}
                alt={user?.name || 'Usuário'}
                src={user?.avatar}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Menu Lateral */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            ...(open ? {
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            } : {
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
              overflowX: 'hidden',
              width: theme.spacing(7),
            })
          },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: [1],
          }}
        >
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
        <Divider />
        <List component="nav">
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    opacity: open ? 1 : 0,
                    color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      
      {/* Conteúdo Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar /> {/* Espaçador para ficar abaixo da AppBar */}
        <Outlet /> {/* Renderiza as rotas filhas aqui */}
      </Box>
      
      {/* Menu Dropdown do Perfil */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => navigate('/profile')}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          Meu Perfil
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Sair
        </MenuItem>
      </Menu>
      
      {/* Menu Dropdown de Notificações */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationMenuClose}
        onClick={handleNotificationMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { width: 320, maxHeight: 340 }
        }}
      >
        <MenuItem>
          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'bold' }}>
            Backup falhou: Cliente ABC
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem>
          <Typography variant="body2" color="text.primary">
            Backup concluído: Cliente XYZ
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem>
          <Typography variant="body2" color="text.primary">
            Novo cliente registrado: Tech Solutions
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem sx={{ justifyContent: 'center' }}>
          <Typography variant="body2" color="primary">
            Ver todas as notificações
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}

