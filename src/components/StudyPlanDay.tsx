
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calculator, Pencil } from "lucide-react";
import { StudyTask } from "@/services/api";

interface StudyPlanDayProps {
  day: number;
  tasks: StudyTask[];
  onTaskComplete: (taskId: string, completed: boolean) => void;
}

const StudyPlanDay: React.FC<StudyPlanDayProps> = ({
  day,
  tasks,
  onTaskComplete,
}) => {
  // Calculate progress for this specific day's tasks
  const completedTasks = tasks.filter(task => task.completed).length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  // Get the appropriate icon based on category
  const getCategoryIcon = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes("verbal") || lowerCategory.includes("vocab")) {
      return <BookOpen className="h-4 w-4 text-blue-500" />;
    } else if (lowerCategory.includes("quant") || lowerCategory.includes("math")) {
      return <Calculator className="h-4 w-4 text-purple-500" />;
    } else {
      return <Pencil className="h-4 w-4 text-orange-500" />;
    }
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-all">
      <CardHeader className="pb-2 bg-gray-50 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-grep-600">✨ Day {day}</h3>
          <span className="text-sm text-gray-500">
            {completedTasks}/{tasks.length} completed
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start gap-3 p-2 rounded-md border border-gray-100 hover:bg-gray-50 transition-colors">
              <Checkbox 
                id={task.id}
                checked={task.completed}
                onCheckedChange={(checked) => onTaskComplete(task.id, checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label 
                  htmlFor={task.id}
                  className={`flex cursor-pointer ${task.completed ? "line-through text-gray-500" : "font-medium"}`}
                >
                  {task.description}
                </Label>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <div className="flex items-center mr-4 bg-gray-100 px-2 py-1 rounded-full">
                    {getCategoryIcon(task.category)}
                    <span className="ml-1">{task.category}</span>
                  </div>
                  <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                    <span>⏱️ {task.timeEstimate} min</span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default StudyPlanDay;
