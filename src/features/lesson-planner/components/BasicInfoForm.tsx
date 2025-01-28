import React from 'react';
import { Input } from "../../../components/ui/input.tsx";
import { Label } from "../../../components/ui/label.tsx";
import { Textarea } from "../../../components/ui/textarea.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../../components/ui/select.tsx";

type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

interface BasicInfoFormProps {
  lessonPlan: {
    topic: string;
    duration: string;
    gradeLevel: string;
    priorKnowledge: string;
    position: string;
    contentGoals: string;
    skillGoals: string;
  };
  handleBasicInfoChange: (field: string, value: string) => void;
}

const BasicInfoForm = ({ lessonPlan, handleBasicInfoChange }: BasicInfoFormProps) => {
  return (
    <div className="space-y-4 rtl">
      <div className="text-right">
        <Label className="text-right">נושא היחידה</Label>
        <Input
          value={lessonPlan.topic}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBasicInfoChange('topic', e.target.value)}
          placeholder="הכנס את נושא היחידה"
          className="text-right"
          dir="rtl"
        />
      </div>
      
      <div className="text-right">
        <Label className="text-right">זמן כולל</Label>
        <Input
          value={lessonPlan.duration}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBasicInfoChange('duration', e.target.value)}
          placeholder="משך השיעור"
          className="text-right"
          dir="rtl"
        />
      </div>

      <div className="text-right">
        <Label className="text-right">שכבת גיל</Label>
        <Input
          value={lessonPlan.gradeLevel}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBasicInfoChange('gradeLevel', e.target.value)}
          placeholder="הכנס שכבת גיל"
          className="text-right"
          dir="rtl"
        />
      </div>

      <div className="text-right">
        <Label className="text-right">ידע קודם נדרש</Label>
        <Textarea
          value={lessonPlan.priorKnowledge}
          onChange={(e: ChangeEvent) => handleBasicInfoChange('priorKnowledge', e.target.value)}
          placeholder="פרט את הידע הקודם הנדרש"
          className="text-right"
          dir="rtl"
        />
      </div>

      <div className="text-right">
        <Label className="text-right">מיקום בתוכן</Label>
        <Select
          dir="rtl"
          value={lessonPlan.position}
          onValueChange={(value: string) => handleBasicInfoChange('position', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="בחר מיקום" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="opening">פתיחת נושא</SelectItem>
            <SelectItem value="teaching">הקנייה</SelectItem>
            <SelectItem value="practice">תרגול</SelectItem>
            <SelectItem value="summary">סיכום נושא</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="text-right">
        <Label className="text-right">מטרות ברמת התוכן</Label>
        <Textarea
          value={lessonPlan.contentGoals}
          onChange={(e: ChangeEvent) => handleBasicInfoChange('contentGoals', e.target.value)}
          placeholder="פרט את מטרות התוכן"
          className="text-right"
          dir="rtl"
        />
      </div>

      <div className="text-right">
        <Label className="text-right">מטרות ברמת המיומנויות</Label>
        <Textarea
          value={lessonPlan.skillGoals}
          onChange={(e: ChangeEvent) => handleBasicInfoChange('skillGoals', e.target.value)}
          placeholder="פרט את מטרות המיומנויות"
          className="text-right"
          dir="rtl"
        />
      </div>
    </div>
  );
};

export default BasicInfoForm;