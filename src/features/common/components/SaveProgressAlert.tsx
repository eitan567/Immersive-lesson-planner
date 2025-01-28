import React from 'react';

interface SaveProgressAlertProps {
  message?: string;
}

export const SaveProgressAlert = ({ message = "שומר שינויים..." }: SaveProgressAlertProps) => (
  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative" role="alert">
    <span className="block sm:inline">{message}</span>
  </div>
);