import React from "react";
import { motion } from "framer-motion";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = "md",
  message = "Loading...",
}) => {
  // Size configuration
  const sizeConfig = {
    sm: {
      container: "w-16 h-16",
      item: "w-2 h-2",
    },
    md: {
      container: "w-24 h-24",
      item: "w-3 h-3",
    },
    lg: {
      container: "w-32 h-32",
      item: "w-4 h-4",
    },
  };

  // Animation variants
  const containerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  const itemVariants = {
    initial: { scale: 1 },
    animate: ({ delay }: { delay: number }) => ({
      scale: [1, 1.5, 1],
      transition: {
        delay,
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: "easeInOut",
      },
    }),
  };

  // Generate colors for grocery-themed items
  const groceryColors = [
    "bg-red-500", // tomato/apple
    "bg-orange-500", // orange/carrot
    "bg-yellow-500", // banana/lemon
    "bg-green-500", // lettuce/cucumber
    "bg-purple-500", // eggplant/grapes
    "bg-blue-500", // blueberry
  ];

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        variants={containerVariants}
        animate="animate"
        className={`relative ${sizeConfig[size].container}`}
      >
        {groceryColors.map((color, i) => {
          const angle = (i * (360 / groceryColors.length) * Math.PI) / 180;
          const radius = size === "sm" ? 6 : size === "md" ? 9 : 12;
          
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);
          
          return (
            <motion.div
              key={i}
              className={`absolute rounded-full ${color} ${sizeConfig[size].item}`}
              style={{
                left: "50%",
                top: "50%",
                x: x + "rem",
                y: y + "rem",
                marginLeft: `-${parseInt(sizeConfig[size].item) / 2}rem`,
                marginTop: `-${parseInt(sizeConfig[size].item) / 2}rem`,
              }}
              variants={itemVariants}
              animate="animate"
              initial="initial"
              custom={{ delay: i * 0.15 }}
            />
          );
        })}
      </motion.div>
      
      {message && (
        <motion.p 
          className="mt-4 text-gray-600 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingIndicator;