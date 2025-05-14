
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { paraphraseText } from "@/services/api";
import AiResponseCard from "@/components/AiResponseCard";

const ParaphraseHelper = () => {
  const [inputText, setInputText] = useState("");
  const [style, setStyle] = useState<"simple" | "gre">("gre");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paraphrasedText, setParaphrasedText] = useState<string | null>(null);

  const handleParaphrase = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to paraphrase");
      return;
    }

    setLoading(true);
    setError(null);
    setParaphrasedText(null);

    try {
      const result = await paraphraseText(inputText, style);
      
      if (result.error) {
        setError(result.error);
      } else {
        setParaphrasedText(result.data);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paraphrase Helper</h1>
        <p className="text-muted-foreground mt-1">
          Transform your text into GRE-style language or simplify complex text.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paraphrase Text</CardTitle>
          <CardDescription>
            Enter your text and choose a paraphrasing style.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="text" className="mb-2 block">Your Text</Label>
              <Textarea
                id="text"
                placeholder="Enter text to paraphrase..."
                className="min-h-[120px]"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            <div>
              <Label className="mb-2 block">Paraphrasing Style</Label>
              <RadioGroup
                value={style}
                onValueChange={(value) => setStyle(value as "simple" | "gre")}
                className="flex space-x-8"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="simple" id="simple" />
                  <Label htmlFor="simple" className="cursor-pointer">Simplify</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gre" id="gre" />
                  <Label htmlFor="gre" className="cursor-pointer">GRE Style</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              onClick={handleParaphrase} 
              disabled={loading || !inputText.trim()}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Paraphrasing
                </>
              ) : (
                "Paraphrase"
              )}
            </Button>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {paraphrasedText && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Paraphrased Text</h3>
                <AiResponseCard loading={loading} error={error}>
                  <div className="whitespace-pre-wrap">
                    {paraphrasedText}
                  </div>
                </AiResponseCard>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Example Paraphrasing</CardTitle>
          <CardDescription>
            See how different texts can be paraphrased.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium">Original</h4>
                <div className="border rounded-md p-3 bg-gray-50">
                  The professor's explanation of quantum mechanics was hard to understand.
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">GRE Style</h4>
                <div className="border rounded-md p-3 bg-grep-50">
                  The professor's explication of quantum mechanics was abstruse, confounding even the most perspicacious students.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium">Original</h4>
                <div className="border rounded-md p-3 bg-gray-50">
                  Research suggests that a multifaceted approach incorporating various methodologies yields optimal outcomes in educational contexts.
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Simplified</h4>
                <div className="border rounded-md p-3 bg-grep-50">
                  Studies show that using different teaching methods together works best for student learning.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParaphraseHelper;
