import React from "react";
import { motion } from "framer-motion";

interface GroceryBounceProps {
  isOpen?: boolean;
}

const GroceryBounce: React.FC<GroceryBounceProps> = ({ isOpen = true }) => {
  const groceryItems = [
    { icon: "bx bxs-apple", color: "text-red-500", delay: 0 },
    { icon: "bx bxs-carrot", color: "text-orange-500", delay: 0.1 },
    { icon: "bx bx-lemon", color: "text-yellow-500", delay: 0.2 },
    { icon: "bx bxs-leaf", color: "text-green-500", delay: 0.3 },
    { icon: "bx bx-cookie", color: "text-amber-700", delay: 0.4 },
    { icon: "bx bx-bowl-hot", color: "text-blue-500", delay: 0.5 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center space-x-3"
    >
      {groceryItems.map((item, index) => (
        <motion.div
          key={index}
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "loop",
            delay: item.delay,
            ease: "easeInOut",
          }}
          className={`text-3xl ${item.color}`}
        >
          <i className={item.icon}></i>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default GroceryBounce;