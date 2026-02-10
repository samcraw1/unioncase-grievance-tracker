import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data);

      // Set subscription info from profile
      setSubscriptionStatus({
        status: response.data.subscriptionStatus,
        trialStartsAt: response.data.trialStartsAt,
        trialEndsAt: response.data.trialEndsAt
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // Only logout on 401 (unauthorized), not on transient errors
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      setUser(userData);

      // Set subscription info from login response
      setSubscriptionStatus({
        status: userData.subscriptionStatus,
        trialStartsAt: userData.trialStartsAt,
        trialEndsAt: userData.trialEndsAt
      });

      // Set token last to avoid triggering useEffect re-fetch
      // since we already have the user data from the login response
      setToken(newToken);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);

      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('token', newToken);
      setUser(newUser);

      // Set subscription info from register response
      setSubscriptionStatus({
        status: newUser.subscriptionStatus,
        trialStartsAt: newUser.trialStartsAt,
        trialEndsAt: newUser.trialEndsAt
      });

      // Set token last to avoid triggering useEffect re-fetch
      setToken(newToken);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setSubscriptionStatus(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    subscriptionStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
