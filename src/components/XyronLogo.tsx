import React from "react";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
}

/**
 * XyronGroup Typography Component (Only "XyronGroup" text, no graphic logo image)
 */
export const XyronLogo: React.FC<LogoProps> = ({
  className = "",
  variant = "light",
}) => {
  const textColor = variant === "light" ? "text-white" : "text-slate-900";

  return (
    <div className={`flex items-center tracking-tight font-black text-xl sm:text-2xl ${className}`}>
      <span className={textColor}>XyronGroup</span>
    </div>
  );
};

