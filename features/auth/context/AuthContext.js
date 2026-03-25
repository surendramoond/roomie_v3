import React, { createContext, useEffect, useState, useContext } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const login = async (identifier, role, password = '') => {
    const nextUser = await authService.login({ identifier, role, password });
    setUser(nextUser);
    return nextUser;
  };

  const signup = async (identifier, role, password, displayName) => {
    const nextUser = await authService.signup({ identifier, role, password, displayName });
    setUser(nextUser);
    return nextUser;
  };

  const updateProfile = async (updates) => {
    if (!user) {
      return null;
    }

    const nextUser = await authService.updateProfile({ user, updates });
    setUser(nextUser);
    return nextUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authReady, login, signup, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
