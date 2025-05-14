
import React from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface AiResponseCardProps {
  loading: boolean;
  error?: string | null;
  children: React.ReactNode;
}

const AiResponseCard: React.FC<AiResponseCardProps> = ({ 
  loading, 
  error, 
  children 
}) => {
  return (
    <Card className="ai-response">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-grep-500 animate-spin mb-2" />
          <p className="text-gray-500">AI is thinking...</p>
        </div>
      ) : error ? (
        <div className="p-4 text-red-500">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="p-4">
          {children}
        </div>
      )}
    </Card>
  );
};

export default AiResponseCard;
