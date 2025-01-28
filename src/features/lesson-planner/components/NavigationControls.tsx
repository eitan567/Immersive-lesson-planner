import React from 'react';
import { Button } from "../../../components/ui/button.tsx";

interface NavigationControlsProps {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  onExport?: () => void;
}

const NavigationControls = ({ 
  currentStep, 
  onPrevious, 
  onNext, 
  onExport 
}: NavigationControlsProps) => {
  return (
    <div className="flex justify-between mt-4">
      {currentStep > 1 && (
        <Button onClick={onPrevious}>
          הקודם
        </Button>
      )}
      {currentStep < 3 && (
        <Button onClick={onNext}>
          {currentStep === 2 ? 'צפה בתוכנית' : 'הבא'}
        </Button>
      )}
      {currentStep === 3 && onExport && (
        <Button onClick={onExport}>
          ייצא לקובץ טקסט
        </Button>
      )}
    </div>
  );
};

export default NavigationControls;