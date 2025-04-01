import React from "react";

interface CategoryIconProps {
  icon: string;
  color?: "primary" | "blue" | "orange" | "purple" | "yellow" | "red";
  size?: "sm" | "md" | "lg";
}

const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  icon, 
  color = "primary", 
  size = "md" 
}) => {
  const colorMap = {
    primary: "bg-primary/10 text-primary",
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
    yellow: "bg-yellow-100 text-yellow-600",
    red: "bg-red-100 text-red-600",
  };
  
  const sizeMap = {
    sm: "w-10 h-10 text-xl",
    md: "w-16 h-16 text-2xl",
    lg: "w-20 h-20 text-3xl",
  };
  
  return (
    <div className={`${colorMap[color]} ${sizeMap[size]} rounded-full flex items-center justify-center`}>
      <i className={`bx ${icon}`}></i>
    </div>
  );
};

export default CategoryIcon;
