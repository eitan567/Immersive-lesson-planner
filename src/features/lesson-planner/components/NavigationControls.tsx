import React from 'react';
import { Button } from "../../../components/ui/button.tsx";

interface NavigationControlsProps {
  currentStep: number;
  onPrevious: () => Promise<void>;
  onNext: () => Promise<void>;
  onExport?: () => void;
  saving?: boolean;
}

const NavigationControls = ({ 
  currentStep, 
  onPrevious, 
  onNext, 
  onExport,
  saving = false
}: NavigationControlsProps) => {
  return (
    <div className="flex justify-between mt-4">
      {currentStep > 1 && (
        <Button 
          onClick={onPrevious}
          disabled={saving}
        >
          {saving ? 'שומר...' : 'הקודם'}
        </Button>
      )}
      {currentStep < 3 && (
        <Button 
          onClick={onNext}
          disabled={saving}
        >
          {saving ? 'שומר...' : currentStep === 2 ? 'צפה בתוכנית' : 'הבא'}
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