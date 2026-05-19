import { api } from './api';
import { ENDPOINTS } from './url';
import { InterceptResponse, LogResponse } from '../types/analytics';

class AnalyticsService {
  async intercept(trigger: string): Promise<InterceptResponse> {
    return api.post<InterceptResponse>(ENDPOINTS.PRAYERS.INTERCEPT, { trigger });
  }

  async logAction(
    actionType: 'pause' | 'prayer' | 'reflection',
    triggerContext: string
  ): Promise<LogResponse> {
    return api.post<LogResponse>(ENDPOINTS.ANALYTICS.LOG, {
      actionType,
      triggerContext,
    });
  }
}

export const analyticsService = new AnalyticsService();
