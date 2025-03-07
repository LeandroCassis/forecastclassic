import { toast } from "@/hooks/use-toast";

// Type for online user data (mantido para compatibilidade com tipos existentes)
export interface OnlineUser {
  id: number;
  username: string;
  nome: string;
  initials: string;
  lastSeen: Date;
}

// Get initials from user name (função mantida para uso em outros lugares da aplicação)
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
