import React, { createContext, useCallback, useContext, useState } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../mock/initialData';

const STORAGE_KEY = 'mota_current_user';

/** The portal opens as the default applicant so the demo is usable immediately. */
const DEFAULT_USER = MOCK_USERS[0];

interface AuthContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  loginAsDemoUser: (email: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const readPersistedUser = (): User => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER;
    const parsed = JSON.parse(raw) as User;
    return parsed?.id ? parsed : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
};

const storeUser = (user: User) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    /* storage unavailable — session stays in memory */
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setUser] = useState<User>(readPersistedUser);

  const setCurrentUser = useCallback((user: User) => {
    setUser(user);
    storeUser(user);
  }, []);

  /** Demo affordance: jump straight into any role's workspace. */
  const switchRole = useCallback(
    (role: UserRole) => {
      const match = MOCK_USERS.find((u) => u.role === role);
      if (match) {
        setCurrentUser(match);
        return;
      }
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
    },
    [currentUser, setCurrentUser]
  );

  const loginAsDemoUser = useCallback(
    (email: string) => {
      const found = MOCK_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!found) return false;
      setCurrentUser(found);
      return true;
    },
    [setCurrentUser]
  );

  const logout = useCallback(() => {
    setUser(DEFAULT_USER);
    storeUser(DEFAULT_USER);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, switchRole, loginAsDemoUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
