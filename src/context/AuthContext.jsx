import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService, initializeStorage } from '../services/storageService';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize storage & check for existing logged-in session on mount
  useEffect(() => {
    initializeStorage();
    const storedUser = storageService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    // Simulate realistic network delay (e.g. 600ms)
    await new Promise((res) => setTimeout(res, 600));

    const users = storageService.getUsers();
    const targetUser = users.find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (!targetUser) {
      setLoading(false);
      toast.error('No account found with this email address.');
      return { success: false, error: 'User not found' };
    }

    if (targetUser.password !== password) {
      setLoading(false);
      toast.error('Incorrect password. Please verify and try again.');
      return { success: false, error: 'Invalid password' };
    }

    // Login successful
    const sessionUser = {
      id: targetUser.id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      avatar: targetUser.avatar,
      membershipId: targetUser.membershipId,
      department: targetUser.department || 'General Library Member',
      token: 'jwt_mock_' + Math.random().toString(36).substring(2) + Date.now(),
      loginAt: new Date().toISOString(),
    };

    storageService.setCurrentUser(sessionUser);
    setUser(sessionUser);
    setLoading(false);
    toast.success(`Welcome back, ${sessionUser.name}!`);
    return { success: true, user: sessionUser };
  };

  // Register handler
  const register = async (userData) => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 700));

    const users = storageService.getUsers();
    const exists = users.some(
      (u) => u.email.toLowerCase().trim() === userData.email.toLowerCase().trim()
    );

    if (exists) {
      setLoading(false);
      toast.error('An account with this email already exists.');
      return { success: false, error: 'Email already registered' };
    }

    const newUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      role: userData.role || 'Student',
      department: userData.department || 'General Studies',
      membershipId: `LIB-${(userData.role || 'STD').substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`,
      memberSince: new Date().toISOString().split('T')[0],
      phone: userData.phone || '+1 (555) 000-0000',
    };

    storageService.saveUser(newUser);

    // Auto login after registration
    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      membershipId: newUser.membershipId,
      department: newUser.department,
      token: 'jwt_mock_' + Math.random().toString(36).substring(2) + Date.now(),
      loginAt: new Date().toISOString(),
    };

    storageService.setCurrentUser(sessionUser);
    setUser(sessionUser);
    setLoading(false);
    toast.success(`Registration successful! Welcome, ${newUser.name}.`);
    return { success: true, user: sessionUser };
  };

  // Reset password handler
  const resetPassword = async (email, newPassword) => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 600));

    const users = storageService.getUsers();
    const userFound = users.find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (!userFound) {
      setLoading(false);
      toast.error('No account found with this email.');
      return { success: false, error: 'Account not found' };
    }

    const success = storageService.updateUserPassword(email, newPassword);
    setLoading(false);

    if (success) {
      toast.success('Password reset successfully! Please log in with your new credentials.');
      return { success: true };
    } else {
      toast.error('Failed to update password. Try again.');
      return { success: false, error: 'Update failed' };
    }
  };

  // Update profile
  const updateProfile = (updatedFields) => {
    if (!user) return;
    const updatedUser = { ...user, ...updatedFields };
    storageService.setCurrentUser(updatedUser);
    setUser(updatedUser);

    // Also update in users registry
    const users = storageService.getUsers();
    const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, ...updatedFields } : u));
    storageService.setUsers(updatedUsers);
    toast.success('Profile updated successfully!');
  };

  // Logout handler
  const logout = () => {
    storageService.clearCurrentUser();
    setUser(null);
    toast.info('You have been logged out.');
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
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
export default AuthContext;
