
import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = "md", 
  withText = true 
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };
  
  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} rounded-full bg-grep-500 text-white flex items-center justify-center font-bold`}>
        <span>G</span>
      </div>
      {withText && (
        <span className={`font-bold ${textSizeClasses[size]} bg-gradient-to-r from-grep-500 to-grep-purple bg-clip-text text-transparent`}>
          GREP
        </span>
      )}
    </div>
  );
};

export default Logo;
