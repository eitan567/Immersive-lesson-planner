import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button } from "../../../components/ui/button.tsx";

interface UserDropdownProps {
  user: {
    email?: string | null;
    photoURL?: string | null;
  } | null;
  onSignOut: () => void;
}

export const UserDropdown = ({ user, onSignOut }: UserDropdownProps) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div className="flex items-center space-x-3 cursor-pointer select-none">
          <div className="h-10 w-10 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 overflow-hidden mR-2">
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
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-white rounded-md p-2 shadow-lg border border-slate-200/60 backdrop-blur-sm backdrop-filter"
          sideOffset={5}
          align="end"
        >
          <div className="px-2 py-2 text-sm text-slate-500 border-b border-slate-200/60 mb-2">
          {user?.email} -מחובר כ
          </div>

          <DropdownMenu.Item className="outline-none">
            <Button
              variant="ghost"
              className="w-full justify-end text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onSignOut}
            >
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
                className="ml-2 mt-[4px]"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              התנתק
            </Button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
