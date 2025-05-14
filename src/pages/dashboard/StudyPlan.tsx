import { useState, useEffect } from "react";
import { CalendarDays, Loader2, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  generateStudyPlan, 
  StudyPlanParams, 
  StudyTask,
  parseStudyPlan
} from "@/services/api";
import AiResponseCard from "@/components/AiResponseCard";
import StudyPlanDay from "@/components/StudyPlanDay";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

const weakAreaOptions = [
  { id: "verbal", label: "Verbal Reasoning" },
  { id: "quant", label: "Quantitative Reasoning" },
  { id: "awa", label: "Analytical Writing" },
  { id: "vocab", label: "Vocabulary" },
  { id: "reading", label: "Reading Comprehension" }
];

const StudyPlan = () => {
  const [examDate, setExamDate] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [weakAreas, setWeakAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studyPlan, setStudyPlan] = useState<string | null>(null);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [viewMode, setViewMode] = useState<"raw" | "interactive" | "summary">("interactive");
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [lastGeneratedParams, setLastGeneratedParams] = useState<StudyPlanParams | null>(null);
  const { toast } = useToast();
  
  // Set default exam date to 30 days from now
  useEffect(() => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    setExamDate(thirtyDaysFromNow.toISOString().split("T")[0]);
    
    // Load saved study plan from localStorage
    const savedPlan = localStorage.getItem("studyPlan");
    const savedTasks = localStorage.getItem("studyTasks");
    const savedParams = localStorage.getItem("studyPlanParams");
    
    if (savedPlan) {
      setStudyPlan(savedPlan);
    }
    
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
      } catch (err) {
        console.error("Failed to parse saved tasks:", err);
      }
    }
    
    if (savedParams) {
      try {
        const parsedParams = JSON.parse(savedParams);
        setLastGeneratedParams(parsedParams);
        
        // Restore the previously selected weak areas
        if (parsedParams.weakAreas) {
          const weakAreaIds = weakAreaOptions
            .filter(option => parsedParams.weakAreas.includes(option.label))
            .map(option => option.id);
          setWeakAreas(weakAreaIds);
        }
        
        // Restore hours per day
        if (parsedParams.hoursPerDay) {
          setHoursPerDay(parsedParams.hoursPerDay);
        }
        
      } catch (err) {
        console.error("Failed to parse saved parameters:", err);
      }
    }
  }, []);

  const handleWeakAreaChange = (id: string, checked: boolean) => {
    if (checked) {
      setWeakAreas([...weakAreas, id]);
    } else {
      setWeakAreas(weakAreas.filter(area => area !== id));
    }
  };

  // Handle study plan generation and parsing with improved error handling and feedback
  const handleGenerateStudyPlan = async () => {
    if (!examDate) {
      setError("Please select an exam date");
      setIsErrorDialogOpen(true);
      return;
    }
    
    if (weakAreas.length === 0) {
      setError("Please select at least one weak area");
      setIsErrorDialogOpen(true);
      return;
    }

    setLoading(true);
    setError(null);
    setStudyPlan(null);
    setTasks([]);

    try {
      console.log("Starting to generate study plan...");
      const params: StudyPlanParams = {
        examDate,
        hoursPerDay,
        weakAreas: weakAreas.map(id => 
          weakAreaOptions.find(option => option.id === id)?.label || id
        )
      };
      
      // Store the current parameters to prevent duplicate generation
      setLastGeneratedParams(params);
      localStorage.setItem("studyPlanParams", JSON.stringify(params));
      
      console.log("Calling API with params:", params);
      const result = await generateStudyPlan(params);
      console.log("API response received:", result.data ? "Success" : "Error", result.error || "");
      
      if (result.error) {
        setError(result.error);
        setIsErrorDialogOpen(true);
        console.error("Error from API:", result.error);
        return;
      } 
      
      if (!result.data) {
        setError("Received empty response from the API");
        setIsErrorDialogOpen(true);
        console.error("Empty response from API");
        return;
      }
      
      console.log("Setting study plan data");
      setStudyPlan(result.data);
      localStorage.setItem("studyPlan", result.data);
      
      // Extract plain text from HTML for parsing
      const rawText = result.data.replace(/<[^>]*>/g, '');
      console.log("Extracted raw text for parsing, length:", rawText.length);
      
      // Try parsing the study plan
      const parsedTasks = parseStudyPlan(rawText);
      
      if (parsedTasks.length > 0) {
        console.log(`Successfully parsed ${parsedTasks.length} tasks`);
        setTasks(parsedTasks);
        localStorage.setItem("studyTasks", JSON.stringify(parsedTasks));
        
        // Always set the view mode to "interactive" (task view) after generation
        setViewMode("interactive");
        
        toast({
          title: "Study Plan Created",
          description: `Your study plan has been generated with ${parsedTasks.length} tasks.`,
        });
      } else {
        console.warn("Couldn't parse tasks from study plan, showing raw text view");
        
        // If parsing fails, we'll still set to interactive view if we have fallback tasks
        const fallbackTasks: StudyTask[] = [];
        const weakAreaLabels = weakAreas.map(id => 
          weakAreaOptions.find(option => option.id === id)?.label || id
        );
        
        // Create 30 days of basic tasks based on selected weak areas
        for (let day = 1; day <= 30; day++) {
          let taskIndex = 0;
          // Distribute time evenly among selected weak areas
          const minutesPerCategory = Math.floor((hoursPerDay * 60) / weakAreaLabels.length);
          
          // Create a task for each selected area
          for (const category of weakAreaLabels) {
            fallbackTasks.push({
              id: `day${day}-${taskIndex}`,
              day: day,
              description: `Study ${category} concepts and practice questions`,
              category,
              completed: false,
              timeEstimate: minutesPerCategory
            });
            taskIndex++;
          }
        }
        
        if (fallbackTasks.length > 0) {
          setTasks(fallbackTasks);
          localStorage.setItem("studyTasks", JSON.stringify(fallbackTasks));
          // Always set view mode to interactive even with fallback tasks
          setViewMode("interactive");
        } else {
          // Only if we have no tasks at all, default to raw view
          setViewMode("raw");
        }
        
        toast({
          title: "Study Plan Created",
          description: "Your plan was created. Check out the tasks to get started!",
          variant: "default"
        });
      }
    } catch (err) {
      console.error("Error generating study plan:", err);
      setError("An unexpected error occurred while generating the study plan. Please try again.");
      setIsErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTaskComplete = (taskId: string, completed: boolean) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem("studyTasks", JSON.stringify(updatedTasks));
    
    toast({
      title: completed ? "Task Completed" : "Task Reopened",
      description: completed 
        ? "Great work! Keep up the momentum." 
        : "Task marked as not completed.",
      variant: completed ? "default" : "destructive",
    });
  };
  
  // Check if current parameters differ from last generated ones
  const paramsDifferFromLast = () => {
    if (!lastGeneratedParams) return true;
    
    const currentWeakAreaLabels = weakAreas.map(id => 
      weakAreaOptions.find(option => option.id === id)?.label || id
    );
    
    const lastWeakAreaLabels = lastGeneratedParams.weakAreas;
    
    // Check if weak areas are different
    if (currentWeakAreaLabels.length !== lastWeakAreaLabels.length) return true;
    
    // Check each weak area label
    for (const label of currentWeakAreaLabels) {
      if (!lastWeakAreaLabels.includes(label)) return true;
    }
    
    // Check hours per day and exam date
    return hoursPerDay !== lastGeneratedParams.hoursPerDay || 
           examDate !== lastGeneratedParams.examDate;
  };
  
  // Group tasks by day
  const tasksByDay: Record<number, StudyTask[]> = {};
  tasks.forEach(task => {
    if (!tasksByDay[task.day]) {
      tasksByDay[task.day] = [];
    }
    tasksByDay[task.day].push(task);
  });
  
  // Calculate overall progress
  const completedTaskCount = tasks.filter(task => task.completed).length;
  const progressPercentage = tasks.length > 0 ? (completedTaskCount / tasks.length) * 100 : 0;
  
  // Calculate category statistics
  const categoryStats: Record<string, { total: number, completed: number }> = {};
  tasks.forEach(task => {
    if (!categoryStats[task.category]) {
      categoryStats[task.category] = { total: 0, completed: 0 };
    }
    categoryStats[task.category].total += 1;
    if (task.completed) {
      categoryStats[task.category].completed += 1;
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Study Plan Generator</h1>
        <p className="text-muted-foreground mt-1">
          Get a personalized 30-day study plan based on your exam date and weak areas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Plan Parameters</CardTitle>
              <CardDescription>
                Enter your exam details to generate a personalized study plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="examDate">GRE Exam Date</Label>
                  <Input
                    id="examDate"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hoursPerDay">Hours Available Per Day</Label>
                  <Input
                    id="hoursPerDay"
                    type="number"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(parseInt(e.target.value) || 0)}
                    min={1}
                    max={12}
                  />
                </div>
                
                <div className="space-y-3">
                  <Label>Areas You Need to Improve</Label>
                  <div className="space-y-2">
                    {weakAreaOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={weakAreas.includes(option.id)}
                          onCheckedChange={(checked) => 
                            handleWeakAreaChange(option.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={option.id} className="cursor-pointer">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerateStudyPlan} 
                  disabled={loading || !examDate || weakAreas.length === 0}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Plan
                    </>
                  ) : paramsDifferFromLast() ? (
                    <>
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Generate Study Plan
                    </>
                  ) : (
                    <>
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Regenerate Plan
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {tasks.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Progress Summary</CardTitle>
                <CardDescription>
                  Your study plan completion status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">Overall Progress</h4>
                      <span className="text-sm text-grep-600">
                        {completedTaskCount}/{tasks.length} tasks
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <p className="text-sm text-gray-500 mt-2">
                      {progressPercentage.toFixed(0)}% Complete
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Category Breakdown</h4>
                    <ul className="space-y-2">
                      {Object.entries(categoryStats).map(([category, stats], index) => {
                        const categoryPercentage = stats.total > 0 
                          ? (stats.completed / stats.total) * 100 
                          : 0;
                        
                        return (
                          <li key={index}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{category}</span>
                              <span>
                                {stats.completed}/{stats.total} ({categoryPercentage.toFixed(0)}%)
                              </span>
                            </div>
                            <Progress value={categoryPercentage} className="h-1.5" />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="md:col-span-2">
          {loading ? (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="py-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-grep-500" />
                <p className="text-lg font-medium">Generating your personalized study plan...</p>
                <p className="text-muted-foreground mt-2">This may take a minute</p>
              </CardContent>
            </Card>
          ) : tasks.length > 0 || (studyPlan && viewMode === "raw") ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Personalized Study Plan</CardTitle>
                    <CardDescription>
                      A 30-day schedule tailored to your needs and timeframe.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {tasks.length > 0 && (
                      <Button 
                        variant={viewMode === "interactive" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setViewMode("interactive")}
                      >
                        Tasks
                      </Button>
                    )}
                    {tasks.length > 0 && (
                      <Button 
                        variant={viewMode === "summary" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setViewMode("summary")}
                      >
                        <BarChart2 className="h-4 w-4 mr-1" />
                        Summary
                      </Button>
                    )}
                    {studyPlan && (
                      <Button 
                        variant={viewMode === "raw" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setViewMode("raw")}
                      >
                        Raw
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {viewMode === "interactive" && tasks.length > 0 && (
                  <div className="space-y-4">
                    {Object.entries(tasksByDay).map(([day, dayTasks]) => (
                      <StudyPlanDay 
                        key={day} 
                        day={parseInt(day)} 
                        tasks={dayTasks} 
                        onTaskComplete={handleTaskComplete}
                      />
                    ))}
                  </div>
                )}
                
                {viewMode === "summary" && tasks.length > 0 && (
                  <div>
                    <Table>
                      <TableCaption>30-Day GRE Study Plan Summary</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Day</TableHead>
                          <TableHead>Tasks</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(tasksByDay).map(([day, dayTasks]) => {
                          const dayCompleted = dayTasks.filter(t => t.completed).length;
                          const totalTime = dayTasks.reduce((sum, t) => sum + t.timeEstimate, 0);
                          const dayProgress = (dayCompleted / dayTasks.length) * 100;
                          
                          return (
                            <TableRow key={day}>
                              <TableCell className="font-medium">Day {day}</TableCell>
                              <TableCell>{dayCompleted}/{dayTasks.length}</TableCell>
                              <TableCell>
                                <Progress value={dayProgress} className="h-2" />
                              </TableCell>
                              <TableCell className="text-right">{totalTime} min</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                {viewMode === "raw" && studyPlan && (
                  <AiResponseCard loading={false} error={error}>
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: studyPlan }}
                    />
                  </AiResponseCard>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Your Personalized Study Plan</CardTitle>
                <CardDescription>
                  A 30-day schedule tailored to your needs and timeframe.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <CalendarDays className="mx-auto h-12 w-12 mb-4 text-grep-300" />
                  <p>No study plan generated yet</p>
                  <p className="text-sm mt-1">
                    Fill in the form on the left and click "Generate Study Plan"
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Error Dialog */}
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">Error</DialogTitle>
            <DialogDescription>
              {error}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 text-sm text-gray-500">
            <p>If you keep encountering this issue, you can try:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Refreshing the page and trying again</li>
              <li>Selecting fewer weak areas</li>
              <li>Using a different web browser</li>
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDebugInfo(!showDebugInfo)} variant="outline" className="mr-auto">
              {showDebugInfo ? "Hide Debug Info" : "Show Debug Info"}
            </Button>
            <Button onClick={() => setIsErrorDialogOpen(false)}>Close</Button>
          </DialogFooter>
          
          {showDebugInfo && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
              <pre>{JSON.stringify({ examDate, hoursPerDay, weakAreas }, null, 2)}</pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudyPlan;
