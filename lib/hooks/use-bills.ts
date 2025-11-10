import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { billsService } from '@/lib/supabase/bills';

const BILL_CATEGORIES_KEY = ['bill-categories'];
const SERVICE_PROVIDERS_KEY = (categoryId?: string) => ['service-providers', categoryId ?? 'all'];
const MY_BILLS_KEY = ['user-bills'];

export function useBillCategories() {
  return useQuery({
    queryKey: BILL_CATEGORIES_KEY,
    queryFn: billsService.getCategories,
  });
}

export function useServiceProviders(categoryId?: string) {
  return useQuery({
    queryKey: SERVICE_PROVIDERS_KEY(categoryId),
    queryFn: () => billsService.getProviders(categoryId),
    enabled: categoryId !== undefined,
  });
}

export function useMyBills() {
  return useQuery({
    queryKey: MY_BILLS_KEY,
    queryFn: billsService.getMyBills,
  });
}

export function useCategoriesWithProviders() {
  return useQuery({
    queryKey: [...BILL_CATEGORIES_KEY, 'with-providers'],
    queryFn: billsService.getCategoriesWithProviders,
  });
}
