import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, X } from 'lucide-react';

export function AbbyAvatar() {
  const [showMessage, setShowMessage] = useState(false);
  const [message] = useState("Hi! Need help? Tap me anytime!");

  return (
    <div className="fixed bottom-32 right-8 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full right-0 mb-4 bg-white rounded-3xl shadow-xl p-4 max-w-[250px] border-4 border-aqua-blue"
            >
              <button
                onClick={() => setShowMessage(false)}
                className="absolute -top-2 -right-2 bg-abacus-red text-white rounded-full p-1 shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-deep-blue pr-4">{message}</p>
              <div className="absolute bottom-0 right-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-aqua-blue transform translate-y-full"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setShowMessage(!showMessage)}
          className="relative w-20 h-20 rounded-full bg-gradient-to-br from-sunburst-yellow to-aqua-blue border-4 border-white shadow-2xl overflow-hidden"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Abby Face */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full bg-aqua-blue rounded-full flex flex-col items-center justify-center">
              {/* Eyes */}
              <div className="flex gap-3 mb-1">
                <div className="w-3 h-3 bg-white rounded-full border-2 border-deep-blue">
                  <div className="w-1.5 h-1.5 bg-deep-blue rounded-full mt-0.5 ml-0.5"></div>
                </div>
                <div className="w-3 h-3 bg-white rounded-full border-2 border-deep-blue">
                  <div className="w-1.5 h-1.5 bg-deep-blue rounded-full mt-0.5 ml-0.5"></div>
                </div>
              </div>
              {/* Smile */}
              <div className="w-6 h-3 border-b-2 border-deep-blue rounded-full"></div>
              
              {/* Antennas */}
              <div className="absolute -top-1 left-1/4 w-1 h-3 bg-sunburst-yellow rounded-full">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-abacus-red rounded-full"></div>
              </div>
              <div className="absolute -top-1 right-1/4 w-1 h-3 bg-sunburst-yellow rounded-full">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-abacus-red rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Glow pulse effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-aqua-blue opacity-50"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Voice indicator */}
          <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md">
            <Volume2 className="w-3 h-3 text-abacus-red" />
          </div>
        </motion.button>
      </div>
    </div>
  );
}