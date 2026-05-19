import { api } from './api';
import { ENDPOINTS } from './url';
import { Prayer } from '../types/analytics';

class PrayersService {
  async getPrayers(category?: string): Promise<Prayer[]> {
    const params = category ? { category } : undefined;
    return api.get<Prayer[]>(ENDPOINTS.PRAYERS.LIST, params);
  }
}

export const prayersService = new PrayersService();
