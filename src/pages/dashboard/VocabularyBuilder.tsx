
import { useState, useEffect } from "react";
import { Loader2, Plus, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getGREVocabulary, parseVocabularyData } from "@/services/api";
import AiResponseCard from "@/components/AiResponseCard";
import { useToast } from "@/hooks/use-toast";
import VocabularyWord from "@/components/VocabularyWord";

// Define types for vocabulary data
interface VocabularyWord {
  word: string;
  definition: string;
  sentence: string;
  mnemonic: string;
  saved?: boolean;
}

const VocabularyBuilder = () => {
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vocabularyData, setVocabularyData] = useState<string | null>(null);
  const [parsedWords, setParsedWords] = useState<VocabularyWord[]>([]);
  const [savedWords, setSavedWords] = useState<VocabularyWord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Load saved words from localStorage on component mount
  useEffect(() => {
    const savedVocab = localStorage.getItem("savedVocabulary");
    if (savedVocab) {
      setSavedWords(JSON.parse(savedVocab));
    }
  }, []);

  const handleGenerateVocabulary = async () => {
    if (count < 1 || count > 20) {
      setError("Please enter a number between 1 and 20");
      return;
    }

    setLoading(true);
    setError(null);
    setVocabularyData(null);
    setParsedWords([]);

    try {
      const result = await getGREVocabulary(count);
      
      if (result.error) {
        setError(result.error);
      } else {
        setVocabularyData(result.data);
        // Parse the data into structured format
        const parsed = parseVocabularyData(result.data.replace(/<[^>]*>/g, ''));
        setParsedWords(parsed);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWord = (word: VocabularyWord) => {
    // Check if word is already saved
    if (!savedWords.some(saved => saved.word === word.word)) {
      const updatedSavedWords = [...savedWords, word];
      setSavedWords(updatedSavedWords);
      
      // Save to localStorage
      localStorage.setItem("savedVocabulary", JSON.stringify(updatedSavedWords));
    }
  };

  const removeWord = (index: number) => {
    const newSavedWords = [...savedWords];
    newSavedWords.splice(index, 1);
    setSavedWords(newSavedWords);
    
    // Update localStorage
    localStorage.setItem("savedVocabulary", JSON.stringify(newSavedWords));
    
    toast({
      title: "Word removed",
      description: "The word has been removed from your saved list.",
    });
  };

  // Filter saved words based on search term
  const filteredSavedWords = savedWords.filter(word => 
    word.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vocabulary Builder</h1>
        <p className="text-muted-foreground mt-1">
          Learn GRE-level words with AI-generated definitions and mnemonics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Generate Vocabulary</CardTitle>
              <CardDescription>
                Choose how many GRE-level words you want to learn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3">
                    <Label htmlFor="count">Number of Words</Label>
                    <Input
                      id="count"
                      type="number"
                      value={count}
                      onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                      min={1}
                      max={20}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleGenerateVocabulary} 
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating
                        </>
                      ) : (
                        "Generate"
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-sm mt-2">{error}</div>
                )}

                {parsedWords.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Results</h3>
                    <div className="space-y-4">
                      {parsedWords.map((word, index) => (
                        <VocabularyWord
                          key={index}
                          word={word.word}
                          definition={word.definition}
                          sentence={word.sentence}
                          mnemonic={word.mnemonic}
                          onSave={handleSaveWord}
                          isSaved={savedWords.some(saved => saved.word === word.word)}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {!parsedWords.length && vocabularyData && (
                  <AiResponseCard loading={loading} error={error}>
                    <div 
                      className="prose max-w-none" 
                      dangerouslySetInnerHTML={{ __html: vocabularyData }}
                    />
                  </AiResponseCard>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Saved Words</CardTitle>
              <CardDescription>
                Your personal vocabulary list for review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search saved words..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {filteredSavedWords.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No saved words yet</p>
                  <p className="text-sm mt-1">
                    Generate vocabulary and save words to study later
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {filteredSavedWords.map((word, index) => (
                    <div 
                      key={index} 
                      className="border rounded-lg p-4 relative"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 text-gray-500 hover:text-red-500"
                        onClick={() => removeWord(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <h4 className="font-semibold text-grep-600 mb-1">
                        {word.word}
                      </h4>
                      <p className="text-sm mb-2">
                        <span className="font-medium">Definition:</span> {word.definition}
                      </p>
                      <p className="text-sm mb-2">
                        <span className="font-medium">Sentence:</span> {word.sentence}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Tip:</span> {word.mnemonic}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VocabularyBuilder;
