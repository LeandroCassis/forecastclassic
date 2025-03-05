
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const UserHeader: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const displayName = user?.user_metadata?.name || user?.email || 'User';
  
  return (
    <div className="flex items-center justify-end gap-4 py-2 px-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
      <div className="text-sm font-medium text-blue-800">
        Logged in as: <span className="font-bold">{displayName}</span>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleSignOut}
        className="text-blue-700 border-blue-200 hover:bg-blue-50"
      >
        Sign Out
      </Button>
    </div>
  );
};

export default UserHeader;
