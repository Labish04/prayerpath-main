import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { User } from '../types/auth';
import { authService } from '../services/authService';

interface UserData {
  age?: string;
  phoneUsage?: string;
  apps?: string[];
  goals?: string[];
  triggers?: string[];
  commitment?: string;
  mode?: string;
  name?: string;
  email?: string;
  password?: string;
  hasSeenPaywall?: boolean;
}

interface UserContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: User) => Promise<void>;
  clearAuth: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserData>({
    apps: ['TikTok', 'Instagram', 'YouTube'],
  });

  // Load user session on initial mount
  useEffect(() => {
    async function loadSession() {
      try {
        const session = await authService.getSession();
        if (session.token && session.user) {
          setToken(session.token);
          setUser(session.user);
          // Prepopulate local onboarding fields for compatibility if needed
          setUserData((prev) => ({
            ...prev,
            name: session.user?.name || prev.name,
            age: session.user?.ageRange || prev.age,
            apps: session.user?.blockedApps?.map((a) => a.appName) || prev.apps,
            goals: session.user?.improvementGoals || prev.goals,
            commitment: session.user?.commitmentLevel || prev.commitment,
            mode: session.user?.mode || prev.mode,
          }));
        }
      } catch (e) {
        console.error('Failed to load session in UserProvider:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSession();
  }, []);

  const setAuth = async (newToken: string, newUser: User) => {
    await authService.saveSession(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
    // Sync local onboarding fields with the user data
    setUserData((prev) => ({
      ...prev,
      name: newUser.name || prev.name,
      age: newUser.ageRange || prev.age,
      apps: newUser.blockedApps?.map((a) => a.appName) || prev.apps,
      goals: newUser.improvementGoals || prev.goals,
      triggers: newUser.triggers || prev.triggers,
      commitment: newUser.commitmentLevel || prev.commitment,
      mode: newUser.mode || prev.mode,
    }));
  };

  const clearAuth = async () => {
    await authService.clearSession();
    setToken(null);
    setUser(null);
  };

  const updateUser = async (newUser: User) => {
    await authService.updateUser(newUser);
    setUser(newUser);
    // Sync local onboarding fields with the updated user data
    setUserData((prev) => ({
      ...prev,
      name: newUser.name || prev.name,
      age: newUser.ageRange || prev.age,
      apps: newUser.blockedApps?.map((a) => a.appName) || prev.apps,
      goals: newUser.improvementGoals || prev.goals,
      triggers: newUser.triggers || prev.triggers,
      commitment: newUser.commitmentLevel || prev.commitment,
      mode: newUser.mode || prev.mode,
    }));
  };

  const isAuthenticated = !!token;

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated,
      isLoading,
      setAuth,
      clearAuth,
      updateUser,
      userData,
      setUserData,
    }),
    [token, user, isAuthenticated, isLoading, userData]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
export { UserData };
