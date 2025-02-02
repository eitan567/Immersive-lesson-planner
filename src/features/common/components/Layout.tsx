import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Navbar } from './Navbar.tsx';
import { Sidebar } from './Sidebar.tsx';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  sidebarProps: {
    saveInProgress: boolean;
    lastSaved: Date | null;
    lessonTitle?: string;
    totalSteps: number;
    onUpdateField: (fieldName: string, value: string) => Promise<void>;
    currentValues: Record<string, string>;
  };
}

export const Layout = React.memo(({ children, user, sidebarProps }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="h-screen flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 flex flex-row-reverse mt-[72px] overflow-hidden">
        <div className="relative flex">
          {/* Sidebar Container */}
          <div className={`bg-[#85003f05] border-r border-gray-300 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-80' : 'w-0'} overflow-hidden`}>
            <Sidebar {...sidebarProps} />
          </div>
          
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-[0.20rem] top-0 -mr-4 z-10 flex items-center justify-center w-5 h-8 bg-[beige] rounded-r border border-slate-200 shadow-sm focus:outline-none"
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isSidebarOpen ? (
              <ChevronRight className="w-5 h-5 text-slate-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
        
        <main className="flex-1 relative">
          <div className="absolute inset-0 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#681bc2] hover:scrollbar-thumb-[#681bc2] scrollbar-thumb-rounded-md" dir="ltr">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
});