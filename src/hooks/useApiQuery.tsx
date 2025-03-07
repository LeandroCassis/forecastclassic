
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

/**
 * A utility hook for making API queries with consistent error handling
 */
export const useApiQuery = <TData = unknown, TResult = TData, TError = Error>(
  queryKey: string[],
  url: string,
  options?: Omit<UseQueryOptions<TData, TError, TResult>, 'queryKey' | 'queryFn'>
) => {
  const { toast } = useToast();
  
  return useQuery<TData, TError, TResult>({
    queryKey,
    queryFn: async () => {
      try {
        console.log(`Fetching data from: ${url}`);
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`Error fetching from ${url}: ${response.status} ${response.statusText}`);
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`Invalid content type from ${url}: ${contentType}`);
          const text = await response.text();
          console.error('Response body:', text.substring(0, 500)); // Log the first 500 chars
          throw new Error(`Expected JSON but got ${contentType}`);
        }
        
        const data = await response.json();
        console.log(`Data fetched from ${url}:`, data);
        return data as TData;
      } catch (error) {
        console.error(`Exception in fetch from ${url}:`, error);
        // Show error toast
        toast({
          variant: "destructive",
          title: `Error fetching data from ${url.split('/').pop()}`,
          description: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    },
    staleTime: Infinity, // Data won't become stale
    gcTime: Infinity, // Keep in cache indefinitely
    retry: 1,
    ...options
  });
};
