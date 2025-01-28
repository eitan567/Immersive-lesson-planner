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
import type { LessonPlan } from '../types.ts';
import { AssistantChatBox } from '../../ai-assistant/components/AssistantChatBox.tsx';

type BasicInfoFormProps = {
  lessonPlan: Pick<LessonPlan, 'topic' | 'duration' | 'gradeLevel' | 'priorKnowledge' | 'position' | 'contentGoals' | 'skillGoals'>;
  handleBasicInfoChange: (field: keyof LessonPlan, value: string) => void;
};

const BasicInfoForm = ({ lessonPlan, handleBasicInfoChange }: BasicInfoFormProps) => {
  const handleChange = (field: keyof LessonPlan) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    handleBasicInfoChange(field, e.currentTarget.value);
  };

  return (
    <div className="space-y-4 rtl">
      <div className="text-right">
        <Label className="text-right">נושא היחידה</Label>
        <div className="space-y-2">
          <Input
            value={lessonPlan.topic}
            onChange={handleChange('topic')}
            placeholder="הכנס את נושא היחידה"
            className="text-right"
            dir="rtl"
          />
          <AssistantChatBox
            context={lessonPlan.topic}
            onApplySuggestion={(suggestion) => handleBasicInfoChange('topic', suggestion)}
            placeholder="הצע נושא יחידה"
          />
        </div>
      </div>
      
      <div className="text-right">
        <Label className="text-right">זמן כולל</Label>
        <div className="space-y-2">
          <Input
            value={lessonPlan.duration}
            onChange={handleChange('duration')}
            placeholder="משך השיעור"
            className="text-right"
            dir="rtl"
          />
          <AssistantChatBox
            context={lessonPlan.duration}
            onApplySuggestion={(suggestion) => handleBasicInfoChange('duration', suggestion)}
            placeholder="הצע משך זמן מתאים"
          />
        </div>
      </div>

      <div className="text-right">
        <Label className="text-right">שכבת גיל</Label>
        <div className="space-y-2">
          <Input
            value={lessonPlan.gradeLevel}
            onChange={handleChange('gradeLevel')}
            placeholder="הכנס שכבת גיל"
            className="text-right"
            dir="rtl"
          />
          <AssistantChatBox
            context={lessonPlan.gradeLevel}
            onApplySuggestion={(suggestion) => handleBasicInfoChange('gradeLevel', suggestion)}
            placeholder="הצע שכבת גיל מתאימה"
          />
        </div>
      </div>

      <div className="text-right">
        <Label className="text-right">ידע קודם נדרש</Label>
        <div className="space-y-2">
          <Textarea
            value={lessonPlan.priorKnowledge}
            onChange={handleChange('priorKnowledge')}
            placeholder="פרט את הידע הקודם הנדרש"
            className="text-right"
            dir="rtl"
          />
          <AssistantChatBox
            context={lessonPlan.priorKnowledge}
            onApplySuggestion={(suggestion) => handleBasicInfoChange('priorKnowledge', suggestion)}
            placeholder="הצע ידע קודם נדרש"
          />
        </div>
      </div>

      <div className="text-right">
        <Label className="text-right">מיקום בתוכן</Label>
        <Select
          dir="rtl"
          value={lessonPlan.position}
          onValueChange={(value) => handleBasicInfoChange('position', value)}
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
        <div className="space-y-2">
          <Textarea
            value={lessonPlan.contentGoals}
            onChange={handleChange('contentGoals')}
            placeholder="פרט את מטרות התוכן"
            className="text-right"
            dir="rtl"
          />
          <AssistantChatBox
            context={lessonPlan.contentGoals}
            onApplySuggestion={(suggestion) => handleBasicInfoChange('contentGoals', suggestion)}
            placeholder="הצע מטרות תוכן"
          />
        </div>
      </div>

      <div className="text-right">
        <Label className="text-right">מטרות ברמת המיומנויות</Label>
        <div className="space-y-2">
          <Textarea
            value={lessonPlan.skillGoals}
            onChange={handleChange('skillGoals')}
            placeholder="פרט את מטרות המיומנויות"
            className="text-right"
            dir="rtl"
          />
          <AssistantChatBox
            context={lessonPlan.skillGoals}
            onApplySuggestion={(suggestion) => handleBasicInfoChange('skillGoals', suggestion)}
            placeholder="הצע מטרות מיומנות"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;