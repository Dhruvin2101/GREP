
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Book, MessageCircle, BookOpen, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Feature cards data
const features = [
  {
    title: "Vocabulary Builder",
    description: "Learn GRE-level words with meanings, usage, and mnemonics.",
    icon: <Book className="h-8 w-8 text-grep-500" />,
    href: "/dashboard/vocabulary",
    color: "border-grep-500/30 bg-grep-500/5 text-grep-500"
  },
  {
    title: "Paraphrase Helper",
    description: "Transform or simplify text with AI assistance.",
    icon: <MessageCircle className="h-8 w-8 text-grep-600" />,
    href: "/dashboard/paraphrase",
    color: "border-grep-600/30 bg-grep-600/5 text-grep-600"
  },
  {
    title: "Reading Comprehension",
    description: "Practice with passages and AI-generated questions.",
    icon: <BookOpen className="h-8 w-8 text-grep-700" />,
    href: "/dashboard/reading",
    color: "border-grep-700/30 bg-grep-700/5 text-grep-700"
  },
  {
    title: "Study Plan Generator",
    description: "Get a personalized study plan based on your exam date.",
    icon: <Calendar className="h-8 w-8 text-grep-purple" />,
    href: "/dashboard/study-plan",
    color: "border-grep-purple/30 bg-grep-purple/5 text-grep-purple"
  }
];

// Motivational quotes for GRE prep
const motivationalQuotes = [
  "The best way to predict your future is to create it.",
  "Success is not final, failure is not fatal: It is the courage to continue that counts.",
  "Your GRE score is just one step on your academic journey, not the destination.",
  "The only limit to our realization of tomorrow is our doubts of today.",
  "The expert in anything was once a beginner.",
  "The harder you work for something, the greater you'll feel when you achieve it."
];

const DashboardHome = () => {
  const [userName, setUserName] = useState("");
  const [quote, setQuote] = useState("");
  
  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.name);
    }
    
    // Set a random motivational quote
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hello, {userName || "there"}!</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to GREP - let's prepare for your GRE exam.
          </p>
        </div>
      </div>
      
      {/* Quote card */}
      <Card className="border-l-4 border-l-grep-500">
        <CardContent className="pt-6 px-6">
          <blockquote className="text-lg text-gray-700 italic">
            "{quote}"
          </blockquote>
        </CardContent>
      </Card>
      
      {/* Feature cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Link key={feature.title} to={feature.href} className="block">
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-2 ${feature.color}`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="text-grep-500 hover:text-grep-600 hover:bg-grep-50 p-0">
                  <span>Get Started</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;
