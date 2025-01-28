import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card.tsx";
import { Label } from "../../../components/ui/label.tsx";
import { Textarea } from "../../../components/ui/textarea.tsx";
import { Button } from "../../../components/ui/button.tsx";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select.tsx";

interface LessonSection {
  content: string;
  screens: {
    screen1: string;
    screen2: string;
    screen3: string;
  };
  spaceUsage: string;
}

interface LessonPhaseProps {
  phase: 'opening' | 'main' | 'summary';
  title: string;
  sections: LessonSection[];
  onAddSection: (phase: 'opening' | 'main' | 'summary') => void;
  onUpdateSection: (phase: 'opening' | 'main' | 'summary', index: number, updates: Partial<LessonSection>) => void;
}

const LessonPhase = ({ phase, title, sections, onAddSection, onUpdateSection }: LessonPhaseProps) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-right">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sections.map((section, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-4 rtl">
                <div className="text-right">
                  <Label className="text-right">תוכן/פעילות</Label>
                  <Textarea
                    value={section.content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                      onUpdateSection(phase, index, { content: e.target.value });
                    }}
                    placeholder="תאר את הפעילות"
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>מסך 1</Label>
                    <Select
                      value={section.screens.screen1}
                      onValueChange={(value: string) => {
                        onUpdateSection(phase, index, {
                          screens: { ...section.screens, screen1: value }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר תצוגה" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">סרטון</SelectItem>
                        <SelectItem value="image">תמונה</SelectItem>
                        <SelectItem value="padlet">פדלט</SelectItem>
                        <SelectItem value="website">אתר</SelectItem>
                        <SelectItem value="genially">ג'ניאלי</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>מסך 2</Label>
                    <Select
                      value={section.screens.screen2}
                      onValueChange={(value: string) => {
                        onUpdateSection(phase, index, {
                          screens: { ...section.screens, screen2: value }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר תצוגה" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">סרטון</SelectItem>
                        <SelectItem value="image">תמונה</SelectItem>
                        <SelectItem value="padlet">פדלט</SelectItem>
                        <SelectItem value="website">אתר</SelectItem>
                        <SelectItem value="genially">ג'ניאלי</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>מסך 3</Label>
                    <Select
                      value={section.screens.screen3}
                      onValueChange={(value: string) => {
                        onUpdateSection(phase, index, {
                          screens: { ...section.screens, screen3: value }
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר תצוגה" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">סרטון</SelectItem>
                        <SelectItem value="image">תמונה</SelectItem>
                        <SelectItem value="padlet">פדלט</SelectItem>
                        <SelectItem value="website">אתר</SelectItem>
                        <SelectItem value="genially">ג'ניאלי</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>שימוש במרחב הפיזי</Label>
                  <Select
                    value={section.spaceUsage}
                    onValueChange={(value: string) => {
                      onUpdateSection(phase, index, { spaceUsage: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="בחר סוג עבודה" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whole">מליאה</SelectItem>
                      <SelectItem value="groups">עבודה בקבוצות</SelectItem>
                      <SelectItem value="individual">עבודה אישית</SelectItem>
                      <SelectItem value="mixed">משולב</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          ))}
          <Button 
            onClick={() => onAddSection(phase)}
            className="w-full"
          >
            הוסף פעילות
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonPhase;