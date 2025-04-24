import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

// Criação do contexto
const AuthContext = createContext(null);

// Hook personalizado para facilitar o uso do contexto
export const useAuth = () => useContext(AuthContext);

// Configuração base do Axios para apontar para o backend
axios.defaults.baseURL = 'http://localhost:3001';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para verificar e atualizar o estado de autenticação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }

        // Verificar validade do token
        const decodedToken = jwtDecode(token);
        const isTokenExpired = decodedToken.exp * 1000 < Date.now();

        if (isTokenExpired) {
          // Se o token expirou, fazer logout
          logout();
          setLoading(false);
          return;
        }

        // Configurar o token em todas as requisições
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Verificar a validade do token no servidor
        const { data } = await axios.get('/api/users/me');
        setUser(data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Função de login
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await axios.post('/api/users/login', { email, password });
      const { token, user } = data;

      // Armazenar token e configurar axios
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  // Função para registrar novo usuário (admin apenas)
  const registerUser = async (userData) => {
    try {
      setLoading(true);
      const { data } = await axios.post('/api/users/register', userData);
      return { success: true, data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao registrar usuário' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar perfil
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const { data } = await axios.put('/api/users/me', userData);
      setUser({...user, ...data});
      return { success: true, data };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao atualizar perfil' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Função para solicitar redefinição de senha
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await axios.post('/api/users/forgot-password', { email });
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao solicitar redefinição de senha' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Função para redefinir senha
  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      await axios.post('/api/users/reset-password', { token, newPassword });
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Erro ao redefinir senha' 
      };
    } finally {
      setLoading(false);
    }
  };

  // Valor do contexto
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    registerUser,
    updateProfile,
    forgotPassword,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

