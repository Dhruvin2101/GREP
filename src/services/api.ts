// API keys should typically be stored in environment variables
// For demo purposes only, we're using a constant here
const GEMINI_API_KEY = "AIzaSyDOyyagCnL4MMPGOjuExb9ZEbObNRCqdPc";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface ApiResponse {
  data?: any;
  error?: string;
}

// Helper function to format text with consistent styling
function formatGeminiResponse(text: string): string {
  if (!text) {
    console.error("Empty text received in formatGeminiResponse");
    return "<p>No content received from API</p>";
  }
  
  console.log("Formatting response text of length:", text.length);
  
  // Replace double line breaks with proper paragraph tags
  let formatted = text.replace(/\n\n/g, '</p><p>');
  
  // Format headings - replace patterns like "1. Topic" or "Day 1:" with styled headings
  formatted = formatted.replace(/^(Day \d+:|\d+\.\s+[\w\s]+)/gm, '<h3 class="text-grep-600 font-semibold mt-4 mb-2">$1</h3>');
  
  // Format lists
  formatted = formatted.replace(/^[-*]\s+(.*)/gm, '<li class="ml-4">$1</li>');
  
  // Remove asterisks around words (fix for vocabulary formatting)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold">$1</span>');
  
  // Fix <p> tags that might appear in the content
  formatted = formatted.replace(/<p>(.*?)<\/p>/g, '$1');
  
  // Wrap everything in paragraphs if not already done
  if (!formatted.startsWith('<')) {
    formatted = `<p>${formatted}</p>`;
  }
  
  return formatted;
}

export async function geminiRequest(prompt: string): Promise<ApiResponse> {
  try {
    console.log("Making Gemini API request with prompt length:", prompt.length);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.9, // Increased temperature for more varied responses
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    console.log("Received API response with status:", response.status);
    
    if (!response.ok) {
      let errorMessage = `API request failed with status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        console.error("Failed to parse error response JSON:", e);
      }
      
      console.error("API error:", errorMessage);
      return { error: errorMessage };
    }
    
    const data = await response.json();
    console.log("Successfully parsed API response JSON");
    
    // Extract the text from the response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error("No text found in API response:", data);
      return {
        error: "No text response received from Gemini API",
      };
    }

    console.log("Received text from API of length:", text.length);
    
    // Format the response before returning
    const formattedText = formatGeminiResponse(text);
    return { data: formattedText };
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    // Check for timeout/abort errors
    if (error.name === 'AbortError') {
      return {
        error: "The request took too long to complete. Please try again.",
      };
    }
    return {
      error: "An error occurred while communicating with the Gemini API. Please try again.",
    };
  }
}

// Track words that have been generated
const generatedVocabWords = new Set<string>();

// Parse vocabulary data into structured format
export function parseVocabularyData(rawData: string): Array<{
  word: string; 
  definition: string; 
  sentence: string; 
  mnemonic: string;
}> {
  const words = [];
  const wordBlocks = rawData.split(/\d+\.\s+/).filter(block => block.trim());
  
  for (const block of wordBlocks) {
    // Extract word and content
    const lines = block.split('\n').filter(line => line.trim());
    if (lines.length < 2) continue;
    
    // Remove any ** from the word
    const word = lines[0].trim().replace(/\*\*/g, '');
    let definition = '';
    let sentence = '';
    let mnemonic = '';
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('Definition:')) {
        definition = line.replace('Definition:', '').trim();
      } else if (line.match(/^(Sentence:|Example:)/)) {
        sentence = line.replace(/^(Sentence:|Example:)/, '').trim();
      } else if (line.match(/^(Mnemonic:|Memory Tip:|Tip:)/)) {
        mnemonic = line.replace(/^(Mnemonic:|Memory Tip:|Tip:)/, '').trim();
      }
    }
    
    if (word) {
      words.push({
        word,
        definition: definition || 'No definition provided',
        sentence: sentence || 'No example sentence provided',
        mnemonic: mnemonic || 'No memory tip provided'
      });
      
      // Add word to the set of generated words
      generatedVocabWords.add(word.toLowerCase());
    }
  }
  
  return words;
}

// Specialized API functions for different features

// Vocabulary Builder - modified to avoid repetition
export async function getGREVocabulary(count: number): Promise<ApiResponse> {
  // Get previously generated words as a string to exclude
  const excludedWordsArray = Array.from(generatedVocabWords);
  const excludedWordsString = excludedWordsArray.length > 0
    ? `These words have been used before, so DO NOT include any of them: ${excludedWordsArray.join(", ")}.`
    : "";
  
  const prompt = `Generate a list of ${count} advanced, UNIQUE GRE-level vocabulary words that are challenging and uncommon. Each word must be completely unique and NOT repeated in this list or in common GRE word lists.
    
    For each word, provide:
    1. The word (ensure each word is unique and not repeated in the list)
    2. Definition: Its primary definition
    3. Sentence: A sentence using the word
    4. Mnemonic: A memory tip to help remember the word
    
    Format each word with a number, followed by the word on its own line, then each element on its own line with the labels "Definition:", "Sentence:", and "Mnemonic:".
    
    Make sure the words are genuinely challenging, unique (not duplicated within this list), and would be useful for GRE preparation.
    
    ${excludedWordsString}
    
    CRITICAL: Each word MUST be unique and not previously used. Double-check your list to ensure NO WORD appears twice.`;
  
  return geminiRequest(prompt);
}

// Paraphrase Helper
export async function paraphraseText(text: string, style: "simple" | "gre"): Promise<ApiResponse> {
  const styleText = style === "gre" 
    ? "more sophisticated language with advanced GRE-level vocabulary" 
    : "simpler, clearer language that's easier to understand";
  
  const prompt = `Paraphrase the following text using ${styleText}. Maintain the original meaning but change the wording:
    
    "${text}"
    
    Paraphrased version:`;
  
  return geminiRequest(prompt);
}

// Reading Comprehension
export async function generatePassageWithQuestions(customPassage?: string): Promise<ApiResponse> {
  let prompt;
  
  if (customPassage) {
    prompt = `Generate 5 GRE-style multiple-choice questions for the following passage:
    
    "${customPassage}"
    
    For each question:
    1. Create a challenging question about the passage
    2. Provide 4 possible answers (A, B, C, D)
    3. DO NOT indicate which answer is correct
    
    Format precisely like this:
    
    [QUESTIONS]
    
    Question 1: [Question text]
    A. [Option text]
    B. [Option text]
    C. [Option text]
    D. [Option text]
    
    Question 2: [Question text]
    A. [Option text]
    B. [Option text]
    C. [Option text]
    D. [Option text]
    
    And so on.`;
  } else {
    prompt = `Generate a GRE-style reading comprehension passage (about 300-400 words) on an academic topic. 
    After the passage, generate 5 GRE-style multiple-choice questions that test understanding of the passage.
    
    For each question:
    1. Create a challenging question about the passage
    2. Provide 4 possible answers (A, B, C, D)
    3. DO NOT indicate which answer is correct
    
    Format precisely like this:
    
    [PASSAGE]
    Your passage text here...
    
    [QUESTIONS]
    
    Question 1: [Question text]
    A. [Option text]
    B. [Option text]
    C. [Option text]
    D. [Option text]
    
    Question 2: [Question text]
    A. [Option text]
    B. [Option text]
    C. [Option text]
    D. [Option text]
    
    And so on.`;
  }
  
  return geminiRequest(prompt);
}

export async function checkAnswers(passage: string, questions: string, userAnswers: string[]): Promise<ApiResponse> {
  const prompt = `For the following passage and multiple-choice questions, evaluate these user answers:
    
    Passage: "${passage}"
    
    Questions:
    ${questions}
    
    User Answers: ${userAnswers.join(', ')}
    
    For each question, you MUST accurately indicate:
    1. Whether the answer is CORRECT or INCORRECT
    2. The correct answer letter (A, B, C, or D)
    3. A brief explanation of why that answer is correct
    
    VERY IMPORTANT: Be precise in your evaluation. If the user selected A and the correct answer is B, mark it as incorrect. DO NOT mark answers as correct unless they exactly match the correct option.
    
    Also provide an overall score as a fraction (e.g., 3/5) and as a percentage (e.g., 60%) and feedback on the user's reading comprehension skills.
    
    Format your response as a clear evaluation that could be shown to the user directly.`;
  
  return geminiRequest(prompt);
}

// Study Plan Generator - Improved to better generate plans based on user parameters
export interface StudyPlanParams {
  examDate: string;
  hoursPerDay: number;
  weakAreas: string[];
}

export interface StudyTask {
  id: string;
  day: number;
  description: string;
  category: string;
  completed: boolean;
  timeEstimate: number;
}

export async function generateStudyPlan(params: StudyPlanParams): Promise<ApiResponse> {
  const { examDate, hoursPerDay, weakAreas } = params;
  console.log("Generating study plan with params:", params);
  
  const currentDate = new Date().toISOString().split('T')[0];
  const examDateObj = new Date(examDate);
  const currentDateObj = new Date(currentDate);
  
  // Calculate days until exam
  const daysUntilExam = Math.max(1, Math.ceil((examDateObj.getTime() - currentDateObj.getTime()) / (1000 * 3600 * 24)));
  
  // Create more specific weak area details based on user selection
  let weakAreaDetails = "";
  
  if (weakAreas.includes("Verbal Reasoning")) {
    weakAreaDetails += "- For Verbal Reasoning: Focus on reading comprehension, critical reasoning, text completion, and sentence equivalence. Allocate approximately 30% of daily study time to this area.\n";
  }
  
  if (weakAreas.includes("Quantitative Reasoning")) {
    weakAreaDetails += "- For Quantitative Reasoning: Focus on algebra, arithmetic, geometry, data analysis, and problem-solving strategies. Allocate approximately 30% of daily study time to this area.\n";
  }
  
  if (weakAreas.includes("Analytical Writing")) {
    weakAreaDetails += "- For Analytical Writing: Focus on argument analysis, essay structure, clear reasoning, and persuasive writing. Allocate approximately 20% of daily study time to this area.\n";
  }
  
  if (weakAreas.includes("Vocabulary")) {
    weakAreaDetails += "- For Vocabulary: Focus on high-frequency GRE words, word roots, prefixes, suffixes, and contextual usage. Allocate approximately 15% of daily study time to this area.\n";
  }
  
  if (weakAreas.includes("Reading Comprehension")) {
    weakAreaDetails += "- For Reading Comprehension: Focus on identifying main ideas, understanding structure, making inferences, and analyzing arguments. Allocate approximately 25% of daily study time to this area.\n";
  }
  
  // Create a more detailed prompt with specific formatting instructions for better parsing
  const prompt = `Create a detailed ${daysUntilExam > 30 ? 30 : daysUntilExam}-day GRE study plan based on the following specific information:
    
    - Exam Date: ${examDate} (${daysUntilExam} days from now)
    - Hours Available Per Day: ${hoursPerDay} hours exactly
    - Weak Areas that need focus: ${weakAreas.join(", ")}
    
    ${weakAreaDetails}
    
    VERY IMPORTANT: For each day, provide EXACTLY three specific tasks to complete that target ONLY the weak areas specified. Do NOT include tasks for areas that weren't specified.
    
    For each task:
    1. The task must specifically address one of the weak areas mentioned
    2. Include the category (matching exactly one of the weak areas specified)
    3. Specify the estimated time in minutes (tasks should add up to exactly ${hoursPerDay * 60} minutes each day)
    
    CRITICAL: You MUST format each task EXACTLY like this with dashes and parentheses:
    - [Task description] (Category, XX minutes)
    
    Format the plan consistently for each day like this:
    Day 1:
    - [Specific task 1 description] (Category, XX minutes)
    - [Specific task 2 description] (Category, XX minutes)
    - [Specific task 3 description] (Category, XX minutes)
    
    Day 2: 
    - [Specific task 1 description] (Category, XX minutes)
    - [Specific task 2 description] (Category, XX minutes)
    - [Specific task 3 description] (Category, XX minutes)
    
    And so on for all days.
    
    Make the plan realistic and adaptive, optimized for effective GRE preparation with EXCLUSIVE focus on the student's weak areas.
    Ensure the daily study time matches EXACTLY ${hoursPerDay} hours (${hoursPerDay * 60} minutes) per day.
    Include a mix of learning new concepts, reviewing materials, and practice exercises.
    
    Make each day's plan UNIQUE and specifically tailored to the student's needs based on their specified weak areas.`;
  
  return geminiRequest(prompt);
}

// Parse the study plan into structured data for UI rendering - Improved to better match the study plan format
export function parseStudyPlan(rawPlan: string): StudyTask[] {
  const tasks: StudyTask[] = [];
  console.log("Parsing study plan text:", rawPlan ? rawPlan.substring(0, 100) + "..." : "empty");
  
  if (!rawPlan || rawPlan.trim() === "") {
    console.error("Empty plan text to parse");
    return [];
  }
  
  try {
    // Improved regex pattern for day headers
    const dayRegex = /Day\s+(\d+)[:.\s-]*/gi;
    let dayMatches = [...rawPlan.matchAll(dayRegex)];
    
    // If no matches found with the first regex pattern, try alternative patterns
    if (dayMatches.length === 0) {
      console.log("No day matches found with primary pattern, trying alternatives");
      const altDayRegex = /(\bDAY\s+\d+\b|\bDay\s+\d+\b|\bday\s+\d+\b)[:.\s-]*/gi;
      dayMatches = [...rawPlan.matchAll(altDayRegex)];
    }
    
    if (dayMatches.length === 0) {
      console.error("Could not find any day patterns in the text");
      return [];
    }
    
    console.log(`Found ${dayMatches.length} day matches`);
    
    for (let i = 0; i < dayMatches.length; i++) {
      const dayMatch = dayMatches[i];
      const dayText = dayMatch[0];
      let dayNumber = 0;
      
      // Extract day number from the match
      const numberMatch = dayText.match(/\d+/);
      if (numberMatch) {
        dayNumber = parseInt(numberMatch[0]);
      } else {
        continue; // Skip if no day number found
      }
      
      // Find the content between this day and the next day (or end of text)
      const startIndex = dayMatch.index! + dayMatch[0].length;
      const endIndex = (i < dayMatches.length - 1) 
        ? dayMatches[i+1].index!
        : rawPlan.length;
      
      const dayContent = rawPlan.substring(startIndex, endIndex).trim();
      
      // Extract tasks using more flexible regex patterns that match the requested format
      // Pattern: dash or bullet, followed by any text, followed by a category in parentheses, followed by minutes
      const taskRegex = /[-•*]\s+(.+?)\s+\(([^,]+),\s*(\d+)\s*(?:minutes?|mins?|min)\)/gi;
      let taskMatches = [...dayContent.matchAll(taskRegex)];
      
      // If first pattern doesn't work, try alternative patterns
      if (taskMatches.length === 0) {
        console.log(`No tasks found for Day ${dayNumber} with standard pattern, trying alternative`);
        
        // Try additional pattern variations
        const altPatterns = [
          /[-•*]\s+(.+?)\s+\(([^,]+),\s*(\d+)\s*(?:minutes?|mins?|min)\)/gi,
          /[-•*]\s+(.+?)\s*-\s*([^(]+)\s*\((\d+)\s*(?:minutes?|mins?|min)\)/gi,
          /[-•*]\s+(.+?)\s*-\s*([^(]+)\s*-\s*(\d+)\s*(?:minutes?|mins?|min)/gi
        ];
        
        for (const pattern of altPatterns) {
          taskMatches = [...dayContent.matchAll(pattern)];
          if (taskMatches.length > 0) {
            console.log(`Found tasks using alternative pattern for Day ${dayNumber}`);
            break;
          }
        }
        
        // Last resort: try to extract any line that contains both a category name and a number
        if (taskMatches.length === 0) {
          console.log("Using last resort pattern matching for day", dayNumber);
          // Extract lines with dash or bullet
          const lines = dayContent.split('\n')
            .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*'));
          
          for (let line of lines) {
            // Clean up the line
            line = line.trim().replace(/^[-•*]\s+/, '');
            
            // Look for any of the weak area categories in the line
            const categories = ["Verbal Reasoning", "Quantitative Reasoning", "Analytical Writing", 
                               "Vocabulary", "Reading Comprehension", "Verbal", "Quantitative", "Writing"];
            let foundCategory = "";
            
            for (const category of categories) {
              if (line.includes(category)) {
                foundCategory = category;
                break;
              }
            }
            
            // Look for a time value (number followed by "minutes", "mins", "min")
            const timeMatch = line.match(/(\d+)\s*(?:minutes?|mins?|min)/i);
            const timeEstimate = timeMatch ? parseInt(timeMatch[1]) : 30; // Default to 30 minutes if not found
            
            if (foundCategory) {
              tasks.push({
                id: `day${dayNumber}-${tasks.length}`,
                day: dayNumber,
                description: line.replace(foundCategory, '').replace(/\(\d+\s*(?:minutes?|mins?|min)\)/i, '').trim(),
                category: foundCategory,
                completed: false,
                timeEstimate
              });
            }
          }
        }
      } else {
        // Process tasks found with the standard pattern
        for (const taskMatch of taskMatches) {
          const description = taskMatch[1].trim();
          const category = taskMatch[2].trim();
          const timeEstimate = parseInt(taskMatch[3]);
          
          if (isNaN(timeEstimate)) {
            console.warn(`Invalid time estimate for task: ${description}`);
            continue;
          }
          
          tasks.push({
            id: `day${dayNumber}-${tasks.length}`,
            day: dayNumber,
            description,
            category,
            completed: false,
            timeEstimate
          });
        }
      }
      
      console.log(`Added ${taskMatches.length} tasks for Day ${dayNumber}`);
    }
    
    console.log(`Total tasks parsed: ${tasks.length}`);
    
    // If no tasks were parsed, create placeholder tasks that align with the selected weak areas
    if (tasks.length === 0) {
      console.warn("No tasks were parsed, creating fallback tasks based on weak areas");
      return [];  // We'll rely on the Study Plan component to handle the raw text view
    }
    
    return tasks;
  } catch (err) {
    console.error("Error parsing study plan:", err);
    return [];
  }
}
