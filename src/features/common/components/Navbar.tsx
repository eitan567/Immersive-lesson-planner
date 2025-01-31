import React from 'react';
import { Button } from "../../../components/ui/button.tsx";
import { useAuth } from '../../auth/AuthContext.tsx';

interface NavbarProps {
  user: {
    user_metadata: any;
    email?: string | null;
    photoURL?: string | null;
  } | null;
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const { signOut } = useAuth();
  if (user) {
    user.photoURL = user?.user_metadata?.avatar_url;
  }
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-[72px] z-50 
      bg-white/20 
      backdrop-filter 
      backdrop-blur-lg 
      border-b 
      border-slate-200/20 
      px-6 
      flex 
      items-center 
      justify-between 
      shadow-sm
      supports-[backdrop-filter]:bg-white/5">
      {/* Right side - User Profile and Logout */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 overflow-hidden ml-2">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-slate-600">מ</span>
            )}
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-800">{user?.email}</p>
            <p className="text-xs text-slate-500">מנהל מערכת</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="mr-2 hover:bg-slate-100"
          >
            התנתק
          </Button>
        </div>
      </div>
      
      {/* Left side - Logo and Title */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className="text-xl font-semibold text-slate-800">מתכנן שיעורים לחדר אימרסיבי</span>
          <img src="/logo.svg" alt="Logo" className="h-8 w-8 mr-3" />
        </div>
      </div>      
    </nav>
  );
};