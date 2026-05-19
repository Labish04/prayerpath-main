import { useQuery } from '@tanstack/react-query';
import { prayersService } from '../services/prayersService';

export function usePrayers(category?: string) {
  return useQuery({
    queryKey: ['prayers', category],
    queryFn: () => prayersService.getPrayers(category),
  });
}
