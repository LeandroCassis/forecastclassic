import { toast } from "@/hooks/use-toast";

const API_URL = '/api';

export const fetchFromApi = async (endpoint: string) => {
  try {
    console.log(`Fetching from ${API_URL}${endpoint}`);
    const response = await fetch(`${API_URL}${endpoint}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`API error (${response.status}):`, errorData);
      throw new Error(errorData.details || errorData.error || `Network response was not ok: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    toast({
      title: "Error",
      description: `Failed to fetch data: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};

export const postToApi = async (endpoint: string, data: any) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}):`, errorText);
      throw new Error(`Network response was not ok: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error);
    toast({
      title: "Error",
      description: `Failed to submit data: ${error.message}`,
      variant: "destructive",
    });
    throw error;
  }
};
