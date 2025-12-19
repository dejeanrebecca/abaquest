import { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { TrendingUp, Award, Trophy, Download, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { useDataLogger } from '../DataLogger';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import logo from 'figma:asset/14748deabced6f36e28c26602e29604c9ffd627a.png';

interface TeacherDashboardProps {
  onBack?: () => void;
}

export function TeacherDashboard({ onBack }: TeacherDashboardProps) {
  const {
    interactions,
    getPreTestScore,
    getPostTestScore,
    getHighestNumberBuilt,
    getTotalCoins,
    studentName,
    clearData,
  } = useDataLogger();

  const preTestScore = getPreTestScore();
  const postTestScore = getPostTestScore();
  const highestNumber = getHighestNumberBuilt();
  const totalCoins = getTotalCoins();

  // Calculate learning gain
  const learningGain = postTestScore - preTestScore;

  // Prepare chart data
  const chartData = [
    { name: 'Pre-Test', score: preTestScore },
    { name: 'Post-Test', score: postTestScore },
  ];

  // Download data as JSON for research team
  const handleDownloadData = () => {
    const dataStr = JSON.stringify(
      {
        student_name: studentName,
        quest_id: 3,
        summary: {
          pre_test_score: preTestScore,
          post_test_score: postTestScore,
          learning_gain: learningGain,
          highest_number_built: highestNumber,
          total_coins: totalCoins,
          total_interactions: interactions.length,
        },
        interactions: interactions,
        export_date: new Date().toISOString(),
      },
      null,
      2
    );
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `abaquest_${studentName || 'student'}_${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-warm-neutral p-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="border-2 border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-white rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>
        )}
        <div className="flex-1 flex justify-center">
          <img src={logo} alt="AbaQuest" className="w-32 h-32 object-cover rounded-full drop-shadow-lg border-4 border-white" />
        </div>
        <div className="w-32"></div> {/* Spacer for alignment */}
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-deep-blue text-center mb-2">Teacher Dashboard</h1>
          <p className="text-center text-deep-blue/70">Quest 3: Position Numbers (0-9)</p>
          {studentName && (
            <p className="text-center text-deep-blue">
              Student: <span className="font-semibold">{studentName}</span>
            </p>
          )}
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6 border-4 border-aqua-blue"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-aqua-blue rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <p className="text-deep-blue/70 text-sm">Pre-Test</p>
            </div>
            <p className="text-3xl text-deep-blue">{preTestScore}%</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 border-4 border-green-500"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <p className="text-deep-blue/70 text-sm">Post-Test</p>
            </div>
            <p className="text-3xl text-deep-blue">{postTestScore}%</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6 border-4 border-sunburst-yellow"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-sunburst-yellow rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-deep-blue" />
              </div>
              <p className="text-deep-blue/70 text-sm">Highest #</p>
            </div>
            <p className="text-3xl text-deep-blue">{highestNumber}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-6 border-4 border-abacus-red"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-abacus-red rounded-full flex items-center justify-center text-white text-xl">
                🪙
              </div>
              <p className="text-deep-blue/70 text-sm">Coins</p>
            </div>
            <p className="text-3xl text-deep-blue">{totalCoins}</p>
          </motion.div>
        </div>

        {/* Learning Gain Indicator */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`rounded-2xl shadow-xl p-6 mb-6 border-4 ${
            learningGain > 0
              ? 'bg-green-50 border-green-500'
              : learningGain < 0
              ? 'bg-red-50 border-red-500'
              : 'bg-gray-50 border-gray-400'
          }`}
        >
          <div className="flex items-center justify-center gap-4">
            <TrendingUp
              className={`w-8 h-8 ${
                learningGain > 0 ? 'text-green-600' : 'text-gray-600'
              }`}
            />
            <div className="text-center">
              <p className="text-deep-blue/70 text-sm mb-1">Learning Gain</p>
              <p className="text-4xl text-deep-blue">
                {learningGain > 0 ? '+' : ''}
                {learningGain}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-4 border-deep-blue"
        >
          <h2 className="text-deep-blue mb-4 text-center">Pre/Post Test Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#3BB5C5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Interaction Log Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-4 border-aqua-blue"
        >
          <h2 className="text-deep-blue mb-4">Interaction Summary</h2>
          <div className="space-y-2 text-deep-blue/80">
            <p>• Total Interactions: <span className="font-semibold">{interactions.length}</span></p>
            <p>
              • Pre-Test Attempts:{' '}
              <span className="font-semibold">
                {interactions.filter((i) => i.interaction_type === 'pre_test').length}
              </span>
            </p>
            <p>
              • Practice Attempts:{' '}
              <span className="font-semibold">
                {interactions.filter((i) => i.interaction_type === 'practice').length}
              </span>
            </p>
            <p>
              • Post-Test Attempts:{' '}
              <span className="font-semibold">
                {interactions.filter((i) => i.interaction_type === 'post_test').length}
              </span>
            </p>
            <p>
              • Story Interactions:{' '}
              <span className="font-semibold">
                {interactions.filter((i) => i.interaction_type === 'story').length}
              </span>
            </p>
          </div>

          <div className="mt-4 p-4 bg-aqua-blue/10 rounded-xl">
            <p className="text-deep-blue/70 text-sm">
              <strong>Data Format:</strong> All interactions are logged with quest_id, scene_id, number,
              correct_flag, and time_ms for research analysis.
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-4"
        >
          <Button
            onClick={handleDownloadData}
            className="flex-1 bg-deep-blue hover:bg-deep-blue/90 text-white py-6 rounded-2xl shadow-xl flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Learning Data (JSON)
          </Button>

          <Button
            onClick={() => {
              if (confirm('Are you sure you want to clear all student data? This cannot be undone.')) {
                clearData();
              }
            }}
            variant="outline"
            className="flex-1 border-4 border-abacus-red text-abacus-red hover:bg-abacus-red hover:text-white py-6 rounded-2xl shadow-xl flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Reset Student Data
          </Button>
        </motion.div>

        {/* Research Notes */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border-4 border-purple-400"
        >
          <h3 className="text-deep-blue mb-3">📊 For Research Teams</h3>
          <div className="text-deep-blue/80 text-sm space-y-2">
            <p>
              • Data format matches Quests 1 & 2 structure for consistent analysis across modules
            </p>
            <p>• Each interaction includes timestamp, student response, and correctness flag</p>
            <p>
              • Exported JSON files can be merged with other quest data for longitudinal analysis
            </p>
            <p>• Pre/post test items are identical (0, 1, 5, 9) for valid comparison</p>
            <p>• "I don't know yet" responses logged with null correct_flag to distinguish from wrong answers</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}