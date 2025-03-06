
import { User, getCurrentUser } from './authService';
import { toast } from "@/hooks/use-toast";

// Type for online user data
export interface OnlineUser {
  id: number;
  username: string;
  nome: string;
  initials: string;
  lastSeen: Date;
}

// Store the current online users
let onlineUsers: OnlineUser[] = [];
let presenceInterval: ReturnType<typeof setInterval> | null = null;

// API URL based on environment
const getApiUrl = () => {
  return window.location.hostname === 'localhost' 
    ? 'http://localhost:3005/api' 
    : '/api';
};

// Get initials from user name
export const getUserInitials = (name: string): string => {
  if (!name) return '?';
  
  // Split by spaces and get first letter of each word
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  // Get first letter of first and last parts
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Update user presence (mark user as online)
export const updatePresence = async (): Promise<void> => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  try {
    const response = await fetch(`${getApiUrl()}/presence/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        userId: currentUser.id,
        username: currentUser.username,
        nome: currentUser.nome
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update presence: ${response.status}`);
    }
    
    // Check if response is valid JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Presence update received non-JSON response');
      return;
    }
    
    await response.json(); // Parse but we don't need the result
  } catch (error) {
    console.error('Presence update error:', error);
    // We don't show toasts for presence errors to avoid disrupting the user
  }
};

// Get all online users
export const getOnlineUsers = async (): Promise<OnlineUser[]> => {
  try {
    const response = await fetch(`${getApiUrl()}/presence/users`);
    
    if (!response.ok) {
      throw new Error(`Failed to get online users: ${response.status}`);
    }
    
    // Check if response is valid JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Get online users received non-JSON response');
      return onlineUsers; // Return cached data on error
    }
    
    const users = await response.json();
    onlineUsers = users.map((user: any) => ({
      ...user,
      lastSeen: new Date(user.lastSeen),
      initials: getUserInitials(user.nome)
    }));
    
    return onlineUsers;
  } catch (error) {
    console.error('Get online users error:', error);
    return onlineUsers; // Return cached data on error
  }
};

// Start presence service
export const startPresenceService = (): void => {
  if (presenceInterval) return; // Already running
  
  // Update presence immediately
  updatePresence();
  
  // Set up regular updates
  presenceInterval = setInterval(async () => {
    await updatePresence();
  }, 30000); // Update every 30 seconds
};

// Stop presence service
export const stopPresenceService = (): void => {
  if (presenceInterval) {
    clearInterval(presenceInterval);
    presenceInterval = null;
  }
};
