 // @ts-nocheck
 import React, { useState } from 'react';
 import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card.tsx";
 import { Input } from "./components/ui/input.tsx";
 import { Label } from "./components/ui/label.tsx";
 import { Textarea } from "./components/ui/textarea.tsx";
 import { Button } from "./components/ui/button.tsx";
 import "./index.css";
 
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select.tsx";

const App = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [lessonPlan, setLessonPlan] = useState({
    topic: '',
    duration: '',
    gradeLevel: '',
    priorKnowledge: '',
    position: '',
    contentGoals: '',
    skillGoals: '',
    sections: {
      opening: [],
      main: [],
      summary: []
    }
  });

  const handleBasicInfoChange = (field: string, value: any) => {
    setLessonPlan(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSection = (phase: keyof typeof lessonPlan.sections, content: undefined) => {
    setLessonPlan(prev => ({
      ...prev,
      sections: {
        ...prev.sections,
        [phase]: [...prev.sections[phase], {
          content: '',
          screens: {
            screen1: '',
            screen2: '',
            screen3: ''
          },
          spaceUsage: ''
        }]
      }
    }));
  };

  const renderBasicInfo = () => (
    <div className="space-y-4 rtl">
      <div className="text-right">
        <Label className="text-right">נושא היחידה</Label>
        <Input
          value={lessonPlan.topic}
          onChange={(e) => handleBasicInfoChange('topic', e.target.value)}
          placeholder="הכנס את נושא היחידה"
          className="text-right"
          dir="rtl"
        />
      </div>
      
      <div className="text-right">
        <Label className="text-right">זמן כולל</Label>
        <Input
          value={lessonPlan.duration}
          onChange={(e: { target: { value: any; }; }) => handleBasicInfoChange('duration', e.target.value)}
          placeholder="משך השיעור"
          className="text-right"
          dir="rtl"
        />
      </div>

      <div className="text-right">
        <Label className="text-right">שכבת גיל</Label>
        <Input
          value={lessonPlan.gradeLevel}
          onChange={(e: { target: { value: any; }; }) => handleBasicInfoChange('gradeLevel', e.target.value)}
          placeholder="הכנס שכבת גיל"
          className="text-right"
          dir="rtl"
        />
      </div>

      <div className="text-right">
        <Label className="text-right">ידע קודם נדרש</Label>
        <Textarea
          value={lessonPlan.priorKnowledge}
          onChange={(e: { target: { value: any; }; }) => handleBasicInfoChange('priorKnowledge', e.target.value)}
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
           onValueChange={(value: any) => handleBasicInfoChange('position', value)}
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
           onChange={(e: { target: { value: any; }; }) => handleBasicInfoChange('contentGoals', e.target.value)}
           placeholder="פרט את מטרות התוכן"
           className="text-right"
           dir="rtl"
         />
       </div>
 
       <div className="text-right">
         <Label className="text-right">מטרות ברמת המיומנויות</Label>
         <Textarea
           value={lessonPlan.skillGoals}
           onChange={(e: { target: { value: any; }; }) => handleBasicInfoChange('skillGoals', e.target.value)}
           placeholder="פרט את מטרות המיומנויות"
           className="text-right"
           dir="rtl"
         />
       </div>
     </div>
   );
 
   const renderLessonPhase = (phase: keyof typeof lessonPlan.sections, title: string) => (
     <Card className="mt-4">
       <CardHeader>
         <CardTitle className="text-right">{title}</CardTitle>
       </CardHeader>
       <CardContent>
         <div className="space-y-4">
           {lessonPlan.sections[phase].map((section, index) => (
             <Card key={index} className="p-4">
               <div className="space-y-4 rtl">
                 <div className="text-right">
                   <Label className="text-right">תוכן/פעילות</Label>
                   <Textarea
                     value={section.content}
                     onChange={(e) => {
                       const newSections = {...lessonPlan.sections};
                       newSections[phase][index].content = e.target.value;
                       setLessonPlan(prev => ({...prev, sections: newSections}));
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
                       onValueChange={(value) => {
                         const newSections = {...lessonPlan.sections};
                         newSections[phase][index].screens.screen1 = value;
                         setLessonPlan(prev => ({...prev, sections: newSections}));
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
                       onValueChange={(value) => {
                         const newSections = {...lessonPlan.sections};
                         newSections[phase][index].screens.screen2 = value;
                         setLessonPlan(prev => ({...prev, sections: newSections}));
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
                       onValueChange={(value) => {
                         const newSections = {...lessonPlan.sections};
                         newSections[phase][index].screens.screen3 = value;
                         setLessonPlan(prev => ({...prev, sections: newSections}));
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
                     onValueChange={(value) => {
                       const newSections = {...lessonPlan.sections};
                       newSections[phase][index].spaceUsage = value;
                       setLessonPlan(prev => ({...prev, sections: newSections}));
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
             onClick={() => addSection(phase)}
             className="w-full"
           >
             הוסף פעילות
           </Button>
         </div>
       </CardContent>
     </Card>
   );
 
   const generateLessonPlanText = () => {
     let text = `תכנית שיעור: ${lessonPlan.topic}\n\n`;
     text += `זמן כולל: ${lessonPlan.duration}\n`;
     text += `שכבת גיל: ${lessonPlan.gradeLevel}\n`;
     text += `ידע קודם: ${lessonPlan.priorKnowledge}\n`;
     text += `מיקום בתוכן: ${lessonPlan.position}\n\n`;
     text += `מטרות ברמת התוכן:\n${lessonPlan.contentGoals}\n\n`;
     text += `מטרות ברמת המיומנויות:\n${lessonPlan.skillGoals}\n\n`;
 
     text += '== פתיחה ==\n';
     lessonPlan.sections.opening.forEach((section, i) => {
       text += `\nפעילות ${i + 1}:\n`;
       text += `תוכן: ${section.content}\n`;
       text += `מסך 1: ${section.screens.screen1}\n`;
       text += `מסך 2: ${section.screens.screen2}\n`;
       text += `מסך 3: ${section.screens.screen3}\n`;
       text += `ארגון הלומדים: ${section.spaceUsage}\n`;
     });
 
     text += '\n== גוף השיעור ==\n';
     lessonPlan.sections.main.forEach((section, i) => {
       text += `\nפעילות ${i + 1}:\n`;
       text += `תוכן: ${section.content}\n`;
       text += `מסך 1: ${section.screens.screen1}\n`;
       text += `מסך 2: ${section.screens.screen2}\n`;
       text += `מסך 3: ${section.screens.screen3}\n`;
       text += `ארגון הלומדים: ${section.spaceUsage}\n`;
     });
 
     text += '\n== סיכום ==\n';
     lessonPlan.sections.summary.forEach((section, i) => {
       text += `\nפעילות ${i + 1}:\n`;
       text += `תוכן: ${section.content}\n`;
       text += `מסך 1: ${section.screens.screen1}\n`;
       text += `מסך 2: ${section.screens.screen2}\n`;
       text += `מסך 3: ${section.screens.screen3}\n`;
       text += `ארגון הלומדים: ${section.spaceUsage}\n`;
     });
 
     return text;
   };
 
   const handleExport = () => {
     const text = generateLessonPlanText();
     const blob = new Blob([text], { type: 'text/plain' });
     const url = window.URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `תכנית_שיעור_${lessonPlan.topic || 'חדש'}.txt`;
     document.body.appendChild(a);
     a.click();
     window.URL.revokeObjectURL(url);
     document.body.removeChild(a);
   };
 
   const renderLessonPlanPreview = () => (
     <Card className="mt-4">
       <CardHeader>
         <CardTitle className="text-right">תצוגה מקדימה של תכנית השיעור</CardTitle>
       </CardHeader>
       <CardContent>
         <pre dir="rtl" className="text-right whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
           {generateLessonPlanText()}
         </pre>
       </CardContent>
     </Card>
   );
 
   return (
     <div className="p-4 max-w-4xl mx-auto space-y-4 rtl">
       <Card>
         <CardHeader>
           <CardTitle>מתכנן שיעורים לחדר אימרסיבי</CardTitle>
         </CardHeader>
         <CardContent>
           {currentStep === 1 && renderBasicInfo()}
           {currentStep === 2 && (
             <div>
               {renderLessonPhase('opening', 'פתיחה')}
               {renderLessonPhase('main', 'גוף השיעור')}
               {renderLessonPhase('summary', 'סיכום')}
             </div>
           )}
           {currentStep === 3 && renderLessonPlanPreview()}
           
           <div className="flex justify-between mt-4">
             {currentStep > 1 && (
               <Button onClick={() => setCurrentStep(prev => prev - 1)}>
                 הקודם
               </Button>
             )}
             {currentStep < 3 && (
               <Button onClick={() => setCurrentStep(prev => prev + 1)}>
                 {currentStep === 2 ? 'צפה בתוכנית' : 'הבא'}
               </Button>
             )}
             {currentStep === 3 && (
               <Button onClick={handleExport}>
                 ייצא לקובץ טקסט
               </Button>
             )}
           </div>
         </CardContent>
       </Card>
     </div>
   );
 };
 
 export default App;