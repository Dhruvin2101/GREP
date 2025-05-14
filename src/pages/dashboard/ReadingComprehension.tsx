import { useState, useEffect } from "react";
import { Loader2, Search, CheckCircle2, AlertTriangle, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { generatePassageWithQuestions, checkAnswers } from "@/services/api";
import AiResponseCard from "@/components/AiResponseCard";
import { toast } from "@/components/ui/use-toast";

const samplePassages = [
  {
    title: "Artificial Intelligence Ethics",
    text: "The rapid advancement of artificial intelligence has prompted significant ethical concerns. As AI systems become more sophisticated, questions about privacy, bias, and accountability have become increasingly urgent. Some experts advocate for strict regulatory frameworks to govern AI development and deployment, while others argue that excessive regulation could stifle innovation. The debate often centers on finding a balance that maximizes the potential benefits of AI while minimizing potential harms. Critics point out that AI systems trained on biased data can perpetuate and amplify societal inequalities, while proponents emphasize AI's potential to solve complex problems in healthcare, climate science, and other domains."
  },
  {
    title: "Cultural Preservation",
    text: "Cultural preservation represents a complex interplay between honoring traditions and adapting to changing circumstances. Indigenous communities worldwide face the challenge of maintaining their cultural identity while engaging with globalization. Some anthropologists argue that cultural practices must evolve naturally, while others emphasize the importance of documenting and preserving traditional knowledge before it disappears. The tension between preservation and evolution reflects broader questions about authenticity and adaptation in cultural contexts. Digital technologies offer new possibilities for recording and sharing cultural heritage, though concerns persist about whether such documentation captures the lived experience of cultural participation."
  }
];

interface Question {
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  userAnswer?: 'A' | 'B' | 'C' | 'D';
}

interface EvaluationResult {
  score: number;
  maxScore: number;
  percentage: number;
  questionResults: {
    correct: boolean;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    explanation: string;
  }[];
  feedback: string;
}

const ReadingComprehension = () => {
  const [passage, setPassage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activePassage, setActivePassage] = useState<number | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [rawQuestions, setRawQuestions] = useState<string>("");
  const [generatingRandomPassage, setGeneratingRandomPassage] = useState(false);

  const handleSelectSample = (index: number) => {
    setPassage(samplePassages[index].text);
    setActivePassage(index);
    setQuestions([]);
    setEvaluationResult(null);
    setRawQuestions("");
  };

  const handleGenerateRandomPassage = async () => {
    setGeneratingRandomPassage(true);
    setError(null);
    
    try {
      const result = await generatePassageWithQuestions();
      
      if (result.error) {
        setError(result.error);
      } else {
        const responseText = result.data.replace(/<[^>]*>/g, '');
        const [passageSection, questionsSection] = responseText.split('[QUESTIONS]');
        
        if (passageSection && questionsSection) {
          const cleanPassage = passageSection.replace('[PASSAGE]', '').trim();
          setPassage(cleanPassage);
          
          setRawQuestions(questionsSection.trim());
          
          const parsedQuestions = parseQuestions(questionsSection.trim());
          setQuestions(parsedQuestions);
          
          setActivePassage(null);
          setEvaluationResult(null);
          
          toast({
            title: "Random passage generated",
            description: "A new GRE-style passage and questions have been created for you.",
          });
        } else {
          setError("Failed to parse the generated passage and questions.");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred while generating a random passage");
      console.error(err);
    } finally {
      setGeneratingRandomPassage(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!passage.trim()) {
      setError("Please enter a passage to analyze");
      return;
    }

    setLoading(true);
    setError(null);
    setQuestions([]);
    setEvaluationResult(null);

    try {
      const result = await generatePassageWithQuestions(passage);
      
      if (result.error) {
        setError(result.error);
      } else {
        const responseText = result.data.replace(/<[^>]*>/g, '');
        
        if (responseText.includes('[QUESTIONS]')) {
          const [passageSection, questionsSection] = responseText.split('[QUESTIONS]');
          setRawQuestions(questionsSection.trim());
          
          const parsedQuestions = parseQuestions(questionsSection.trim());
          setQuestions(parsedQuestions);
        } else {
          setRawQuestions(responseText);
          const parsedQuestions = parseQuestions(responseText);
          setQuestions(parsedQuestions);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parseQuestions = (text: string): Question[] => {
    const questions: Question[] = [];
    const questionRegex = /Question \d+: (.*?)(?=Question \d+:|$)/gs;
    
    let match;
    while ((match = questionRegex.exec(text)) !== null) {
      const questionBlock = match[0].trim();
      const questionLines = questionBlock.split('\n').filter(line => line.trim());
      
      if (questionLines.length >= 5) {
        const questionText = questionLines[0].replace(/^Question \d+: /, '');
        
        const options = {
          A: questionLines[1].replace(/^A\.\s*/, ''),
          B: questionLines[2].replace(/^B\.\s*/, ''),
          C: questionLines[3].replace(/^C\.\s*/, ''),
          D: questionLines[4].replace(/^D\.\s*/, '')
        };
        
        questions.push({
          question: questionText,
          options
        });
      }
    }
    
    return questions;
  };

  const handleAnswerSelect = (questionIndex: number, answer: 'A' | 'B' | 'C' | 'D') => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].userAnswer = answer;
    setQuestions(updatedQuestions);
  };

  const handleEvaluate = async () => {
    if (!passage || !questions.length) return;
    
    const unansweredQuestions = questions.filter(q => !q.userAnswer);
    if (unansweredQuestions.length > 0) {
      setError(`Please answer all questions before evaluating. ${unansweredQuestions.length} question(s) remain unanswered.`);
      return;
    }
    
    setIsEvaluating(true);
    setError(null);
    
    try {
      const userAnswers = questions.map(q => q.userAnswer);
      const result = await checkAnswers(passage, rawQuestions, userAnswers as string[]);
      
      if (result.error) {
        setError(result.error);
      } else {
        const evaluationText = result.data.replace(/<[^>]*>/g, '');
        console.log("Raw evaluation results:", evaluationText);
        const parsed = parseEvaluationResults(evaluationText);
        setEvaluationResult(parsed);
      }
    } catch (err) {
      setError("An error occurred during evaluation");
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const parseEvaluationResults = (text: string): EvaluationResult => {
    const lines = text.split('\n').filter(line => line.trim());
    
    let extractedPercentage = 0;
    let feedback = "No feedback provided";
    
    const scoreMatch = text.match(/(\d+)%|score: (\d+)%|percentage: (\d+)%/i);
    if (scoreMatch) {
      extractedPercentage = parseInt(scoreMatch[1] || scoreMatch[2] || scoreMatch[3]);
    } else {
      const fractionMatch = text.match(/(\d+)\s*\/\s*(\d+)/);
      if (fractionMatch) {
        const [_, numerator, denominator] = fractionMatch;
        extractedPercentage = Math.round((parseInt(numerator) / parseInt(denominator)) * 100);
      }
    }
    
    const feedbackMatch = text.match(/feedback[:\s]+([\s\S]*?)(?=\n\n|$)/i);
    if (feedbackMatch) {
      feedback = feedbackMatch[1].trim();
    } else {
      const paragraphs = text.split('\n\n');
      if (paragraphs.length > 0) {
        const lastParagraph = paragraphs[paragraphs.length - 1];
        if (lastParagraph.length > 30 && !lastParagraph.match(/question|correct|incorrect/i)) {
          feedback = lastParagraph.trim();
        }
      }
    }
    
    const questionResults = questions.map((q, index) => {
      const questionNumber = index + 1;
      
      const questionPattern = new RegExp(`question ${questionNumber}[\\s\\S]*?(correct|incorrect)`, 'i');
      const resultText = text.match(questionPattern);
      const isCorrect = resultText ? /correct/i.test(resultText[0]) : false;
      
      const correctAnswerPattern = new RegExp(`question ${questionNumber}[\\s\\S]*?correct answer[\\s\\S]*?([A-D])`, 'i');
      const correctAnswerMatch = text.match(correctAnswerPattern);
      
      let correctAnswer: 'A' | 'B' | 'C' | 'D' = q.userAnswer as 'A' | 'B' | 'C' | 'D';
      
      if (correctAnswerMatch) {
        correctAnswer = correctAnswerMatch[1] as 'A' | 'B' | 'C' | 'D';
      } else {
        const answerPatterns = [
          new RegExp(`question ${questionNumber}[\\s\\S]*?answer[\\s\\S]*?([A-D])`, 'i'),
          new RegExp(`question ${questionNumber}[\\s\\S]*?([A-D])\\s+is correct`, 'i')
        ];
        
        for (const pattern of answerPatterns) {
          const match = text.match(pattern);
          if (match) {
            correctAnswer = match[1] as 'A' | 'B' | 'C' | 'D';
            break;
          }
        }
      }
      
      const correct = q.userAnswer === correctAnswer;
      
      let explanation = correct ? "Your answer is correct!" : "Your answer is incorrect.";
      
      const explanationPatterns = [
        new RegExp(`question ${questionNumber}[\\s\\S]*?explanation:([\\s\\S]*?)(?=question ${questionNumber + 1}|$)`, 'i'),
        new RegExp(`question ${questionNumber}[\\s\\S]*?explanation[\\s\\S]*?([\\s\\S]*?)(?=question ${questionNumber + 1}|$)`, 'i'),
        new RegExp(`question ${questionNumber}[\\s\\S]*?because([\\s\\S]*?)(?=question ${questionNumber + 1}|$)`, 'i')
      ];
      
      for (const pattern of explanationPatterns) {
        const match = text.match(pattern);
        if (match && match[1].trim().length > 10) {
          explanation = match[1].trim();
          break;
        }
      }
      
      return { correct, correctAnswer, explanation };
    });
    
    const correctCount = questionResults.filter(r => r.correct).length;
    const maxScore = questions.length;
    const calculatedPercentage = Math.round((correctCount / maxScore) * 100);
    
    return {
      score: correctCount,
      maxScore,
      percentage: calculatedPercentage,
      questionResults,
      feedback
    };
  };

  const getAnsweredCount = () => {
    return questions.filter(q => q.userAnswer).length;
  };

  const getProgressPercentage = () => {
    return questions.length > 0 ? (getAnsweredCount() / questions.length) * 100 : 0;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reading Comprehension</h1>
        <p className="text-muted-foreground mt-1">
          Practice with passages and AI-generated questions to improve your understanding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Reading Passage</CardTitle>
              <CardDescription>
                Enter a passage, select a sample, or generate a random GRE-style passage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {samplePassages.map((sample, index) => (
                    <Button
                      key={index}
                      variant={activePassage === index ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSelectSample(index)}
                    >
                      {sample.title}
                    </Button>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGenerateRandomPassage}
                    disabled={generatingRandomPassage}
                  >
                    {generatingRandomPassage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "✨ Generate Random Passage"
                    )}
                  </Button>
                </div>
                
                <Textarea
                  placeholder="Enter a reading passage here or generate a random one..."
                  className="min-h-[200px]"
                  value={passage}
                  onChange={(e) => {
                    setPassage(e.target.value);
                    setActivePassage(null);
                  }}
                />
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleGenerateQuestions} 
                    disabled={loading || !passage.trim() || questions.length > 0}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Questions
                      </>
                    ) : questions.length > 0 ? (
                      "Questions Generated"
                    ) : (
                      "Generate Questions"
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="bg-red-50 p-3 rounded-md border border-red-200 text-red-700 text-sm">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    {error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Practice Questions</CardTitle>
                <CardDescription>
                  Select the best answer for each question based on the passage.
                </CardDescription>
                {questions.length > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{getAnsweredCount()} of {questions.length} answered</span>
                    </div>
                    <Progress value={getProgressPercentage()} className="h-2" />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {questions.map((question, qIndex) => (
                    <div 
                      key={qIndex} 
                      className={`p-4 rounded-md ${
                        evaluationResult 
                          ? evaluationResult.questionResults[qIndex].correct 
                            ? "bg-green-50 border border-green-200" 
                            : "bg-red-50 border border-red-200"
                          : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <div className="flex gap-2 mb-2">
                        <span className="font-medium">Question {qIndex + 1}:</span>
                        <span>{question.question}</span>
                      </div>
                      
                      <RadioGroup 
                        value={question.userAnswer} 
                        onValueChange={(value) => handleAnswerSelect(qIndex, value as 'A' | 'B' | 'C' | 'D')}
                        className="mt-2"
                        disabled={!!evaluationResult}
                      >
                        {Object.entries(question.options).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2 mt-1">
                            <RadioGroupItem value={key} id={`q${qIndex}opt${key}`} />
                            <Label 
                              htmlFor={`q${qIndex}opt${key}`} 
                              className={`flex-grow ${
                                evaluationResult && 
                                evaluationResult.questionResults[qIndex].correctAnswer === key && 
                                !evaluationResult.questionResults[qIndex].correct
                                  ? "text-green-600 font-medium"
                                  : ""
                              }`}
                            >
                              <span className="font-medium mr-2">{key}.</span>
                              {value}
                            </Label>
                            {evaluationResult && evaluationResult.questionResults[qIndex].correctAnswer === key && (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        ))}
                      </RadioGroup>
                      
                      {evaluationResult && (
                        <div className={`mt-3 p-3 rounded ${
                          evaluationResult.questionResults[qIndex].correct 
                            ? "bg-green-100" 
                            : "bg-red-100"
                        }`}>
                          <p className="font-medium">
                            {evaluationResult.questionResults[qIndex].correct 
                              ? "Correct! ✅" 
                              : `Incorrect ❌ The correct answer is ${evaluationResult.questionResults[qIndex].correctAnswer}.`}
                          </p>
                          <p className="mt-1 text-sm">
                            {evaluationResult.questionResults[qIndex].explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <div>
                  {evaluationResult && (
                    <div className="flex items-center gap-2 text-lg">
                      <span className="font-medium">Score:</span>
                      <span className="font-bold">
                        {evaluationResult.score}/{evaluationResult.maxScore} ({evaluationResult.percentage}%)
                      </span>
                    </div>
                  )}
                </div>
                <Button 
                  onClick={handleEvaluate} 
                  disabled={isEvaluating || getAnsweredCount() !== questions.length || !!evaluationResult}
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Evaluating
                    </>
                  ) : evaluationResult ? (
                    <>
                      <CheckSquare className="mr-2 h-4 w-4" />
                      Evaluated
                    </>
                  ) : (
                    "Check Answers"
                  )}
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {evaluationResult && (
            <Card className="bg-grep-50 border-grep-200">
              <CardHeader>
                <CardTitle>Performance Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full border-8 border-grep-400 flex items-center justify-center">
                    <span className="text-2xl font-bold text-grep-600">{evaluationResult.percentage}%</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">
                      Your score: {evaluationResult.score}/{evaluationResult.maxScore}
                    </h3>
                    <p className="text-gray-600">
                      {evaluationResult.percentage >= 80 
                        ? "Excellent work! 🎉 Keep it up!" 
                        : evaluationResult.percentage >= 60 
                          ? "Good job! 👍 Room for improvement." 
                          : "Keep practicing! 💪 You'll improve with more practice."}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-md">
                  <h4 className="font-medium mb-2">Feedback:</h4>
                  <p>{evaluationResult.feedback}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Tips for GRE Reading</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 list-disc pl-5">
                <li>
                  <span className="font-medium">Active Reading:</span> Engage with the text by mentally summarizing each paragraph.
                </li>
                <li>
                  <span className="font-medium">Identify Structure:</span> Recognize the main idea, supporting points, and author's purpose.
                </li>
                <li>
                  <span className="font-medium">Note Transitions:</span> Pay attention to words like "however," "therefore," and "in contrast."
                </li>
                <li>
                  <span className="font-medium">Watch for Tone:</span> Identify if the author is critical, supportive, neutral, etc.
                </li>
                <li>
                  <span className="font-medium">Practice Inference:</span> Train yourself to draw conclusions based on evidence in the text.
                </li>
              </ul>
              
              <div className="mt-6 p-4 bg-grep-100 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">How to Use This Tool ✨</h4>
                <p className="text-gray-700 text-sm">
                  Enter a passage, select a sample, or generate a random GRE-style passage. Then answer all questions and check your performance to track your progress!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReadingComprehension;
