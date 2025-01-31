import React from 'react';
import { Button } from "../../../components/ui/button.tsx";

interface SaveStatusProps {
  onSave: () => void;
  saving: boolean;
  lastSaved: Date | null;
  className?: string;
  savingText?: string;
  buttonText?: string;
}

export const SaveStatus = ({ onSave, saving, lastSaved, className = '' ,savingText='שומר...',buttonText='שמור שינויים'}: SaveStatusProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button 
        onClick={onSave}
        disabled={saving}
      >
        {saving ? savingText : buttonText}
      </Button>
      {lastSaved && (
        <span className="text-sm text-gray-500">
          נשמר לאחרונה: {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};