import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { ENDPOINTS } from '../services/url';
import { useUserContext } from './useUserContext';
import { analyticsService } from '../services/analyticsService';
import { InterceptResponse, LogResponse, Prayer } from '../types/analytics';

export interface AnalyticsSummary {
  totalPauses: number;
  totalPrayers: number;
  totalReflections: number;
  dailyStats: Record<string, { pauses: number; prayers: number; reflections: number }>;
}

export interface TodayPrayerResponse {
  todaysPrayer: {
    id: string;
    title: string;
    content: string;
    category: string;
    durationSeconds: number;
    audioUrl: string;
  };
  topTriggerThisWeek: string;
  stats: {
    weeklyPauses: number;
  };
}

export function useAnalyticsSummary(interval: 'Week' | 'Month' | '3 Months' | 'Year' = 'Week') {
  const { isAuthenticated } = useUserContext();

  return useQuery({
    queryKey: ['analyticsSummary', interval],
    queryFn: async () => {
      return api.get<AnalyticsSummary>(ENDPOINTS.ANALYTICS.SUMMARY, { interval });
    },
    enabled: isAuthenticated,
  });
}

export function useTodayPrayer() {
  const { isAuthenticated } = useUserContext();

  return useQuery({
    queryKey: ['todayPrayer'],
    queryFn: async () => {
      return api.get<TodayPrayerResponse>(ENDPOINTS.PRAYERS.TODAY);
    },
    enabled: isAuthenticated,
  });
}

export function usePrayersList(category?: string) {
  const { isAuthenticated } = useUserContext();

  return useQuery({
    queryKey: ['prayersList', category],
    queryFn: async () => {
      const params = category && category !== 'All' ? { category } : undefined;
      return api.get<Prayer[]>(ENDPOINTS.PRAYERS.LIST, params);
    },
    enabled: isAuthenticated,
  });
}

export function useInterceptMutation() {
  return useMutation({
    mutationFn: async (trigger: string) => {
      return analyticsService.intercept(trigger);
    },
  });
}

export function useLogActionMutation() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useUserContext();

  return useMutation({
    mutationFn: async ({
      actionType,
      triggerContext,
    }: {
      actionType: 'pause' | 'prayer' | 'reflection';
      triggerContext: string;
    }) => {
      return analyticsService.logAction(actionType, triggerContext);
    },
    onSuccess: async (responseData) => {
      // Invalidate queries so that stats update immediately in all dashboard tabs
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
      queryClient.invalidateQueries({ queryKey: ['todayPrayer'] });

      // Update the user's streak inside context and storage dynamically
      if (responseData?.streak && user) {
        await updateUser({
          ...user,
          streak: responseData.streak,
        });
      }
    },
  });
}
