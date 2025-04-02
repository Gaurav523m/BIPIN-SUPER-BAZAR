import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import GroceryBounce from "@/components/ui/grocery-bounce";
import LoadingIndicator from "@/components/ui/loading-indicator";

const NotFound: React.FC = () => {
  const [_, setLocation] = useLocation();
  const [animationMode, setAnimationMode] = useState<'rotate' | 'bounce' | 'loading'>('loading');
  
  // Switch between different animation modes every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationMode((prevMode) => {
        if (prevMode === 'loading') return 'bounce';
        if (prevMode === 'bounce') return 'rotate';
        return 'loading';
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            delay: 0.2 
          }}
          className="text-8xl text-primary mb-4 flex justify-center"
        >
          <span>4</span>
          <motion.span 
            className="mx-2 inline-block"
            animate={
              animationMode === 'rotate' 
                ? { rotate: [0, 360] } 
                : animationMode === 'bounce' 
                  ? { y: [0, -10, 0] }
                  : {}
            }
            transition={
              animationMode === 'rotate'
                ? { repeat: Infinity, duration: 2 }
                : animationMode === 'bounce'
                  ? { repeat: Infinity, duration: 1, ease: "easeInOut" }
                  : {}
            }
          >
            {animationMode === 'loading' ? (
              <LoadingIndicator size="sm" message="" />
            ) : (
              <span className="text-primary opacity-90">0</span>
            )}
          </motion.span>
          <span>4</span>
        </motion.div>
        
        <motion.h1 
          className="text-2xl font-bold mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Page Not Found
        </motion.h1>
        
        <motion.p
          className="text-gray-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Oops! We couldn't find the page you're looking for. Our groceries seem to have gone missing.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
          onClick={() => {
            // Cycle through animation modes on click
            setAnimationMode((prevMode) => {
              if (prevMode === 'loading') return 'bounce';
              if (prevMode === 'bounce') return 'rotate';
              return 'loading';
            });
          }}
        >
          <div className="relative cursor-pointer hover:scale-105 transition-transform">
            <GroceryBounce isOpen={true} />
            
            <motion.div 
              className="absolute -top-3 -right-3 text-xs bg-primary text-white px-2 py-1 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: "spring" }}
            >
              Click me!
            </motion.div>
          </div>
          
          <motion.p 
            className="text-xs text-gray-500 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Animation mode: {animationMode}
          </motion.p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-2"
        >
          <Button 
            className="bg-primary text-white font-medium hover:bg-primary/90 flex-1"
            onClick={() => setLocation("/")}
          >
            <motion.span
              animate={{ 
                x: [0, -3, 0],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5,
                repeatType: "reverse"
              }}
              className="mr-2"
            >
              ←
            </motion.span>
            Return to Home
          </Button>
          
          <Button 
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5"
            onClick={() => {
              // Reset animation mode and force re-render
              setAnimationMode('loading');
              setTimeout(() => {
                window.location.reload();
              }, 300);
            }}
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="mr-2"
            >
              ↻
            </motion.span>
            Refresh
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;