
import React, { useState } from "react";
import { Check, Save, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export interface VocabularyWordProps {
  word: string;
  definition: string;
  sentence: string;
  mnemonic: string;
  onSave: (word: {
    word: string;
    definition: string;
    sentence: string;
    mnemonic: string;
  }) => void;
  isSaved?: boolean;
}

const VocabularyWord: React.FC<VocabularyWordProps> = ({
  word,
  definition,
  sentence,
  mnemonic,
  onSave,
  isSaved = false
}) => {
  const [saved, setSaved] = useState(isSaved);
  const { toast } = useToast();

  const handleSave = () => {
    onSave({ word, definition, sentence, mnemonic });
    setSaved(true);
    toast({
      title: "Word Saved",
      description: `"${word}" has been added to your vocabulary list.`,
    });
  };

  return (
    <Card className="p-4 mb-4 border-l-4 border-l-grep-500 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold text-grep-600">{word}</h3>
        {!saved ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave}
            className="text-grep-500 hover:text-white hover:bg-grep-500"
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        ) : (
          <div className="flex items-center text-green-500 text-sm font-medium">
            <Check className="h-4 w-4 mr-1" />
            Saved
          </div>
        )}
      </div>
      
      <div className="mt-2">
        <p className="text-gray-700"><span className="font-medium">Definition:</span> {definition}</p>
        <p className="text-gray-700 mt-1"><span className="font-medium">Example:</span> {sentence}</p>
        <p className="text-gray-600 mt-2 text-sm italic">
          <span className="font-medium">Memory Tip:</span> {mnemonic}
        </p>
      </div>
    </Card>
  );
};

export default VocabularyWord;
