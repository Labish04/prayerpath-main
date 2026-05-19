import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useUserContext } from './useUserContext';
import { OnboardingData, BlockedApp } from '../types/auth';

export function useLogin() {
  const { setAuth } = useUserContext();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      return authService.login(email, password);
    },
    onSuccess: async (data) => {
      await setAuth(data.token, data.user);
    },
  });
}

export function useSignup() {
  const { setAuth } = useUserContext();

  return useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      return authService.signup(name, email, password);
    },
    onSuccess: async (data) => {
      await setAuth(data.token, data.user);
    },
  });
}

export function useUpdateOnboarding() {
  const { updateUser } = useUserContext();

  return useMutation({
    mutationFn: async (data: OnboardingData) => {
      return authService.updateOnboarding(data);
    },
    onSuccess: async (responseData) => {
      if (responseData?.user) {
        await updateUser(responseData.user);
      }
    },
  });
}

export function useLogout() {
  const { clearAuth } = useUserContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await clearAuth();
      queryClient.clear();
    },
  });
}

export function useUpdateBlockedApps() {
  const { user, updateUser } = useUserContext();

  return useMutation({
    mutationFn: async (blockedApps: BlockedApp[]) => {
      return authService.updateBlockedApps(blockedApps);
    },
    onSuccess: async (data) => {
      if (user) {
        const updatedUser = {
          ...user,
          blockedApps: data.blockedApps,
        };
        await updateUser(updatedUser);
      }
    },
  });
}

export function useUpdateSettings() {
  const { updateUser } = useUserContext();

  return useMutation({
    mutationFn: async (settings: { mode?: string; frequency?: string }) => {
      return authService.updateSettings(settings);
    },
    onSuccess: async (data) => {
      if (data?.user) {
        await updateUser(data.user);
      }
    },
  });
}
