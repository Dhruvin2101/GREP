
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Save, User, BookOpen, Clock, BarChart2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences?: {
    studyReminders?: boolean;
    emailNotifications?: boolean;
    darkMode?: boolean;
  };
}

interface UserStats {
  savedWords: number;
  passagesCompleted: number;
  tasksCompleted: number;
  totalStudyTime: number; // in minutes
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    savedWords: 0,
    passagesCompleted: 0,
    tasksCompleted: 0,
    totalStudyTime: 0
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setName(parsedUser.name || "");
      setEmail(parsedUser.email || "");
    } else {
      // Create a default user for demo purposes
      const defaultUser = {
        id: "demo-user",
        name: "GRE Aspirant",
        email: "user@example.com"
      };
      localStorage.setItem("user", JSON.stringify(defaultUser));
      setUser(defaultUser);
      setName(defaultUser.name);
      setEmail(defaultUser.email);
    }

    // Load statistics
    loadUserStatistics();
  }, [navigate]);

  const loadUserStatistics = () => {
    // Load saved vocabulary
    const savedVocab = localStorage.getItem("savedVocabulary");
    const vocabularyCount = savedVocab ? JSON.parse(savedVocab).length : 0;
    
    // Get completed reading comprehension tests from localStorage
    // In a real app, this would come from a database
    const passagesCompleted = localStorage.getItem("completedPassages") 
      ? JSON.parse(localStorage.getItem("completedPassages") || "[]").length 
      : 0;
    
    // Get completed study tasks
    const studyTasks = localStorage.getItem("studyTasks") 
      ? JSON.parse(localStorage.getItem("studyTasks") || "[]") 
      : [];
    const completedTasks = studyTasks.filter((task: any) => task.completed).length;
    
    // Calculate total study time (estimated)
    const totalStudyTime = studyTasks
      .filter((task: any) => task.completed)
      .reduce((total: number, task: any) => total + (task.timeEstimate || 0), 0);
    
    setStats({
      savedWords: vocabularyCount,
      passagesCompleted,
      tasksCompleted: completedTasks,
      totalStudyTime
    });
  };

  const handleSaveProfile = () => {
    if (!user) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedUser = {
        ...user,
        name,
        email
      };
      
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
      
      setIsLoading(false);
    }, 500);
  };

  // Generate initials for avatar fallback
  const getInitials = () => {
    if (!name) return "U";
    
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">
          View and edit your profile information.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center">
              <Avatar className="h-16 w-16 mr-4">
                <AvatarImage src={user.avatar || ""} alt={name} />
                <AvatarFallback className="bg-grep-500 text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{name}</CardTitle>
                <CardDescription>{email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button 
              onClick={handleSaveProfile} 
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Study Progress</CardTitle>
              <CardDescription>
                Track your GRE learning progress.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Vocabulary</span>
                      <span>{stats.savedWords} words saved</span>
                    </div>
                    <Progress value={stats.savedWords > 0 ? Math.min(100, stats.savedWords / 2) : 0} className="h-1.5" />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <BarChart2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Reading Comprehension</span>
                      <span>{stats.passagesCompleted} passages</span>
                    </div>
                    <Progress value={stats.passagesCompleted > 0 ? Math.min(100, stats.passagesCompleted * 10) : 0} className="h-1.5" />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Study Time</span>
                      <span>
                        {Math.floor(stats.totalStudyTime / 60)} hours {stats.totalStudyTime % 60} min
                      </span>
                    </div>
                    <Progress 
                      value={stats.totalStudyTime > 0 ? Math.min(100, (stats.totalStudyTime / 60) / 50 * 100) : 0} 
                      className="h-1.5" 
                    />
                  </div>
                </div>
                
                <div className="mt-2">
                  <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/dashboard")}>
                    <span>View detailed analytics</span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium text-gray-800 mb-1">Password</h3>
                  <p className="text-gray-600 mb-2">Change your account password.</p>
                  <Button variant="outline" size="sm">Change Password</Button>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium text-gray-800 mb-1">Notifications</h3>
                  <p className="text-gray-600 mb-2">Manage email notifications for your account.</p>
                  <Button variant="outline" size="sm">Notification Settings</Button>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium text-gray-800 mb-1">Study Reminders</h3>
                  <p className="text-gray-600 mb-2">Set daily reminders to help keep your study schedule.</p>
                  <Button variant="outline" size="sm">Set Reminders</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
