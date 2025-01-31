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
      bg-white/10 
      backdrop-filter 
      backdrop-blur-lg       
      backdrop-opacity-80
      firefox:bg-opacity-90
      border-b 
      border-white/20
      px-6
      flex
      items-center
      justify-between
      shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]
      transition-all 
      duration-300 
      ease-in-out">
      {/* Right side - User Profile and Logout */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 overflow-hidden mr-2">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="User avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="text-slate-600">מ</span>
            )}
          </div>
          <div className="text-right hidden md:block">
            <p className="text-slate-800 font-medium text-sm">{user?.email}</p>
            <p className="text-slate-600 text-xs">מנהל מערכת</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="mr-2 px-4 py-2 text-slate-600 hover:text-slate-900
              bg-blue-900/10 hover:bg-white/20
              backdrop-blur-sm
              border border-white/20 hover:border-white/30
              rounded-full
              transition-all duration-200 ease-in-out
              flex items-center gap-2
              font-medium text-sm"
          >
            <span>התנתק</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="transform rotate-180"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </Button>
        </div>
      </div>
      
      {/* Left side - Logo and Title */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <span className="text-xl font-semibold text-slate-800">מתכנן שיעורים לחדר אימרסיבי</span>
          <img src="/logo.svg" alt="Logo" className="h-8 w-8 ml-3" />
        </div>
      </div>      
    </nav>
  );
};