import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Volume2, VolumeX, Type, Globe, Info, Shield, BarChart2 } from 'lucide-react';

import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';


export function Settings() {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [textSize, setTextSize] = useState([100]);
  const [language, setLanguage] = useState('english');
  const [showTeacherDashboard, setShowTeacherDashboard] = useState(false);

  const languages = [
    { value: 'english', label: 'English', flag: '🇺🇸' },
    { value: 'spanish', label: 'Español', flag: '🇪🇸' },
    { value: 'french', label: 'Français', flag: '🇫🇷' },
  ];

  // Import TeacherDashboard dynamically
  if (showTeacherDashboard) {
    const { TeacherDashboard } = require('./TeacherDashboard');
    return <TeacherDashboard onBack={() => setShowTeacherDashboard(false)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-warm-neutral p-8"
    >
      {/* Header */}


      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-deep-blue text-center">Settings & Accessibility</h1>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Teacher Dashboard Access */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-r from-deep-blue to-purple-600 rounded-3xl shadow-xl p-8 border-4 border-deep-blue"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-deep-blue" />
              </div>
              <div className="flex-1">
                <h2 className="text-white mb-1">Teacher Dashboard</h2>
                <p className="text-white/80 text-sm">View student progress and learning data</p>
              </div>
            </div>

            <Button
              onClick={() => setShowTeacherDashboard(true)}
              className="w-full bg-white hover:bg-white/90 text-deep-blue py-4 rounded-2xl shadow-xl"
            >
              <BarChart2 className="w-5 h-5 mr-2" />
              Open Dashboard
            </Button>
          </motion.div>

          {/* Audio Settings */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl shadow-xl p-8 border-4 border-aqua-blue"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-aqua-blue rounded-2xl flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-deep-blue">Audio Settings</h2>
            </div>

            <div className="space-y-6">
              {/* Voice Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {voiceEnabled ? (
                    <Volume2 className="w-6 h-6 text-deep-blue" />
                  ) : (
                    <VolumeX className="w-6 h-6 text-gray-400" />
                  )}
                  <div>
                    <p className="text-deep-blue">Abby Voice</p>
                    <p className="text-sm text-deep-blue/60">Enable narration and audio hints</p>
                  </div>
                </div>
                <Switch
                  checked={voiceEnabled}
                  onCheckedChange={setVoiceEnabled}
                />
              </div>

              {/* Audio Test */}
              <div>
                <p className="text-deep-blue mb-3">Test Audio</p>
                <Button
                  className="bg-aqua-blue hover:bg-aqua-blue/90 text-white rounded-2xl"
                  onClick={() => {
                    // Play test sound
                  }}
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Play Test Sound
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Text Settings */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-8 border-4 border-sunburst-yellow"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-sunburst-yellow rounded-2xl flex items-center justify-center">
                <Type className="w-6 h-6 text-deep-blue" />
              </div>
              <h2 className="text-deep-blue">Text Settings</h2>
            </div>

            <div>
              <div className="flex justify-between mb-3">
                <p className="text-deep-blue">Text Size</p>
                <span className="text-deep-blue/60">{textSize[0]}%</span>
              </div>
              <Slider
                value={textSize}
                onValueChange={setTextSize}
                min={75}
                max={150}
                step={25}
                className="mb-4"
              />
              <p
                className="text-deep-blue/80 text-center p-4 bg-gray-50 rounded-xl"
                style={{ fontSize: `${textSize[0]}%` }}
              >
                Sample text preview at {textSize[0]}%
              </p>
            </div>
          </motion.div>

          {/* Language Settings */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl p-8 border-4 border-deep-blue"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-deep-blue rounded-2xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-deep-blue">Language</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={`p-4 rounded-2xl border-4 transition-all ${language === lang.value
                    ? 'border-deep-blue bg-deep-blue/10 scale-105 shadow-lg'
                    : 'border-gray-200 hover:border-sunburst-yellow'
                    }`}
                >
                  <div className="text-4xl mb-2">{lang.flag}</div>
                  <p className="text-deep-blue">{lang.label}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Abby Tips */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-aqua-blue/10 to-sunburst-yellow/10 rounded-3xl shadow-xl p-8 border-4 border-aqua-blue"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-aqua-blue rounded-2xl flex items-center justify-center">
                <Info className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-deep-blue">Tips from Abby</h2>
            </div>

            <div className="space-y-3 text-deep-blue/80">
              <p>💡 Tap me anytime for help during your quests!</p>
              <p>🎯 Practice every day to become a math master!</p>
              <p>⭐ Complete quests to earn coins and unlock new adventures!</p>
            </div>
          </motion.div>

          {/* Privacy Notice */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl shadow-xl p-8 border-4 border-abacus-red"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-abacus-red rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-deep-blue">Privacy & Safety</h2>
            </div>

            <div className="text-deep-blue/80 space-y-2">
              <p>🔒 Your data is safe and secure</p>
              <p>👨‍👩‍👧 Designed for K-2 learners with educator oversight</p>
              <p>🛡️ COPPA compliant and kid-friendly</p>
            </div>

            <Button
              className="mt-4 bg-abacus-red hover:bg-abacus-red/90 text-white rounded-2xl"
            >
              Learn More About Privacy
            </Button>
          </motion.div>
        </div>

        {/* App Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-deep-blue/60"
        >
          <p>AbaQuest v1.0 • Made with ❤️ for young learners</p>
        </motion.div>
      </div>
    </motion.div>
  );
}