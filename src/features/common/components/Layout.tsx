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

export const Layout: React.FC<LayoutProps> = ({ children, user, sidebarProps }) => {
  return (
    <div className="h-screen flex flex-col">
      <Navbar user={user} />
      <div className="flex-1 flex flex-row-reverse mt-[72px]">
        <Sidebar {...sidebarProps} />
        <main className="flex-1 bg-slate-50" dir='ltr'>
            <div dir='rtl'>
                {children}
            </div>
        </main>
      </div>
    </div>
  );
};
