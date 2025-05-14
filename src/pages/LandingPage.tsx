
import { useState } from "react";
import { Link } from "react-router-dom";
import { Book, MessageCircle, BookOpen, Calendar, ArrowRight, CheckCircle, ChevronRight } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const features = [
  {
    title: "Vocabulary Builder",
    description: "Learn GRE-level words with meanings, usage, and mnemonics to remember them easily.",
    icon: <Book className="h-8 w-8 text-grep-500" />,
    color: "bg-grep-100"
  },
  {
    title: "Paraphrase Helper",
    description: "Transform your writing into GRE-style language or simplify complex text with AI assistance.",
    icon: <MessageCircle className="h-8 w-8 text-grep-600" />,
    color: "bg-grep-200"
  },
  {
    title: "Reading Comprehension",
    description: "Practice with passages and AI-generated questions to improve your understanding.",
    icon: <BookOpen className="h-8 w-8 text-grep-700" />,
    color: "bg-grep-300"
  },
  {
    title: "Study Plan Generator",
    description: "Get a personalized 30-day study plan based on your exam date and weak areas.",
    icon: <Calendar className="h-8 w-8 text-grep-purple" />,
    color: "bg-grep-purple/20"
  }
];

const testimonials = [
  {
    quote: "GREP helped me improve my GRE Verbal score from 150 to 165. The AI-powered tools are truly game-changing!",
    author: "Emily K.",
    role: "Graduate Student"
  },
  {
    quote: "The Study Plan Generator saved me so much time. It created a perfect schedule based on my needs and timeline.",
    author: "Michael T.",
    role: "MBA Applicant"
  },
  {
    quote: "I used to struggle with vocabulary, but the Vocabulary Builder feature made learning new words fun and effective.",
    author: "Sarah J.",
    role: "Engineering Student"
  }
];

const LandingPage = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      {/* Hero Section */}
      <section className="pt-28 pb-20 bg-gradient-to-br from-white to-grep-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Prepare for the GRE
                <span className="block text-grep-500">Smarter with AI</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                GREP uses advanced AI to help you prepare for the GRE more efficiently. Learn vocabulary, improve reading comprehension, and get a personalized study plan.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link to="/register">
                    Start Preparing Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/features">Learn More</Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-grep-500 mr-2" />
                <span>No credit card required</span>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="w-full h-[400px] bg-gradient-to-tr from-grep-500 to-grep-purple rounded-xl shadow-xl overflow-hidden relative">
                <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.8),_transparent_70%)]"></div>
                <div className="absolute top-10 right-8 p-4 bg-white/90 rounded-lg shadow-lg backdrop-blur-sm w-64 animate-float">
                  <h3 className="font-semibold text-sm text-gray-800 mb-2">Vocabulary Builder</h3>
                  <div className="space-y-2">
                    <div className="grep-card bg-grep-100/80 p-2 rounded-md">
                      <p className="font-medium text-sm">Ephemeral</p>
                      <p className="text-xs text-gray-600">Lasting for a very short time</p>
                    </div>
                    <div className="grep-card bg-grep-100/80 p-2 rounded-md">
                      <p className="font-medium text-sm">Cognizant</p>
                      <p className="text-xs text-gray-600">Aware or knowledgeable</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-12 left-8 p-4 bg-white/90 rounded-lg shadow-lg backdrop-blur-sm w-64 animate-float" style={{ animationDelay: "1s" }}>
                  <h3 className="font-semibold text-sm text-gray-800 mb-2">Study Plan</h3>
                  <div className="space-y-1">
                    <div className="text-xs flex justify-between">
                      <span>Day 1: Vocabulary</span>
                      <span className="text-grep-500">✓</span>
                    </div>
                    <div className="text-xs flex justify-between">
                      <span>Day 2: Reading</span>
                      <span className="text-grep-500">✓</span>
                    </div>
                    <div className="text-xs flex justify-between font-medium">
                      <span>Day 3: Quant</span>
                      <span>Today</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">AI-Powered GRE Prep Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              GREP combines cutting-edge AI technology with effective learning methods to help you ace the GRE.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-card"
              >
                <div className={`p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                <div className="mt-auto pt-4">
                  <Link to="/register" className="inline-flex items-center text-grep-500 hover:text-grep-600 font-medium">
                    Try it now
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 bg-grep-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of students who improved their GRE scores with GREP.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8">
            <div className="relative min-h-[180px]">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className={`transition-opacity duration-500 absolute w-full ${
                    activeTestimonial === index ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  <p className="text-lg text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-grep-200 flex items-center justify-center text-grep-500 font-bold">
                      {testimonial.author[0]}
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`h-2 rounded-full transition-all ${
                    activeTestimonial === index 
                      ? "w-8 bg-grep-500" 
                      : "w-2 bg-grep-200"
                  }`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-grep-500 to-grep-purple text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Ace Your GRE?</h2>
          <p className="max-w-2xl mx-auto mb-8 text-white/90">
            Join GREP today and start your journey to GRE success with our AI-powered study tools.
          </p>
          <Button asChild size="lg" variant="secondary" className="bg-white text-grep-500 hover:bg-gray-100">
            <Link to="/register">
              Start Free Trial
            </Link>
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
