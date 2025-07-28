import React, { createContext, useContext, useState } from 'react';
import { login as apiLogin, register as apiRegister } from './api';

// PUBLIC_INTERFACE
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser());

  function getInitialUser() {
    const token = localStorage.getItem('access_token');
    const username = localStorage.getItem('username');
    return token && username ? { username } : null;
  }
  // PUBLIC_INTERFACE
  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('username', data.username || email);
    setUser({ username: data.username || email });
  };
  // PUBLIC_INTERFACE
  const register = async (username, email, password) => {
    const data = await apiRegister(username, email, password);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('username', username);
    setUser({ username });
  };
  // PUBLIC_INTERFACE
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
