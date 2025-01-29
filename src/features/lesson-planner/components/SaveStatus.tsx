import React from 'react';
import { Button } from "../../../components/ui/button.tsx";

interface SaveStatusProps {
  onSave: () => void;
  saving: boolean;
  lastSaved: Date | null;
  className?: string;
}

export const SaveStatus = ({ onSave, saving, lastSaved, className = '' }: SaveStatusProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button 
        onClick={onSave}
        disabled={saving}
      >
        {saving ? 'שומר...' : 'שמור שינויים'}
      </Button>
      {lastSaved && (
        <span className="text-sm text-gray-500">
          נשמר לאחרונה: {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};