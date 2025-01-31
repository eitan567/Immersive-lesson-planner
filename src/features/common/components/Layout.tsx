import React from 'react';
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
  };
}

export const Layout = React.memo(({ children, user, sidebarProps }: LayoutProps) => {
  return (
    <div className="h-screen flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 flex flex-row-reverse mt-[72px] overflow-hidden">
        <Sidebar {...sidebarProps} />
        <main className="flex-1 relative">
          <div className="absolute inset-0 overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-500 hover:scrollbar-thumb-slate-400 scrollbar-thumb-rounded-md" dir='ltr'>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
});
