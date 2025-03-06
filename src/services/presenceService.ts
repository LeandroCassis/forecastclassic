
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
  } catch (error) {
    console.error('Presence update error:', error);
  }
};

// Get all online users
export const getOnlineUsers = async (): Promise<OnlineUser[]> => {
  try {
    const response = await fetch(`${getApiUrl()}/presence/users`);
    if (!response.ok) {
      throw new Error(`Failed to get online users: ${response.status}`);
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
