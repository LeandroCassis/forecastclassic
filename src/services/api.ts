import { toast } from "@/components/ui/use-toast";

const API_BASE_URL = '/api';

interface QueryResponse<T> {
  data: T[];
  error: string | null;
}

export async function query<T>(queryString: string, params?: any[]): Promise<QueryResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: queryString, params }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('API query error:', error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to fetch data. Please try again later.",
    });
    return { data: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}