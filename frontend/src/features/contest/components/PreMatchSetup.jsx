import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dices, 
  Sparkles, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  Flame, 
  Code2, 
  Timer, 
  Award,
  Layers,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useMatchContext } from '../contexts/MatchContext';
import { useAuth } from '@/contexts/AuthContext';

// Helper component for visual dice representation
const DiceFace = ({ value, isWinner }) => {
  return (
    <motion.div
      initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
      className={`relative w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg border ${
        isWinner 
          ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black border-amber-300 shadow-amber-500/20' 
          : 'bg-[#181824] text-neutral-400 border-white/10'
      }`}
    >
      <span className="font-mono tracking-tighter">{value}</span>
      {isWinner && (
        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-black" />
      )}
    </motion.div>
  );
};

export const PreMatchSetup = () => {
  const { user } = useAuth();
  const { room, opponent, setup, chooseSetting } = useMatchContext();

  const rolls = setup?.rolls || {};
  const choices = setup?.choices || {};
  const availableTopics = setup?.availableTopics || [
    { id: 'arrays', label: 'Arrays' },
    { id: 'strings', label: 'Strings' },
    { id: 'dynamic-programming', label: 'Dynamic Programming' },
    { id: 'graphs', label: 'Graphs' },
    { id: 'greedy', label: 'Greedy' },
    { id: 'binary-search', label: 'Binary Search' },
    { id: 'two-pointers', label: 'Two Pointers' },
    { id: 'stack-queue', label: 'Stack & Queue' },
    { id: 'linked-list', label: 'Linked List' },
    { id: 'trees', label: 'Trees' }
  ];
  const availableQuestionCounts = setup?.availableQuestionCounts || [1, 2, 3];
  const availableTimesPerQuestion = setup?.availableTimesPerQuestion || [10, 15, 20, 25, 30];

  const currentUserId = user?.id?.toString();
  const opponentName = opponent?.username || 'Opponent';
  const myName = user?.username || 'You';

  // Check choices readiness
  const isTopicDone = Boolean(choices.topic);
  const isCountDone = Boolean(choices.questionCount);
  const isTimeDone = Boolean(choices.timePerQuestion);
  const allDone = isTopicDone && isCountDone && isTimeDone;

  return (
    <div className="min-h-screen w-full bg-[#050508] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] text-white flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 overflow-y-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center mt-2 mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold uppercase tracking-widest mb-3">
          <Dices className="w-3.5 h-3.5" />
          Pre-Match Dice Roll & Setup
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
          Determine Match Rules
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-xl mx-auto">
          Three independent dice rolls determine who controls the <span className="text-white font-medium">Topic</span>, <span className="text-white font-medium">Question Count</span>, and <span className="text-white font-medium">Time per Question</span>.
        </p>
      </motion.div>

      {/* Matchup Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 mb-6 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center font-bold text-violet-300">
            {myName[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              {myName} <span className="text-xs px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">You</span>
            </div>
            <div className="text-xs text-neutral-400 font-mono">Rating: {user?.rating || 1500}</div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs font-black uppercase tracking-wider text-amber-400/80 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Ranked 1v1
          </span>
          <span className="text-[10px] text-neutral-500 mt-1 font-mono">Live Setup Phase</span>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="text-sm font-bold text-white">{opponentName}</div>
            <div className="text-xs text-neutral-400 font-mono">Rating: {opponent?.rating || 1500}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center font-bold text-rose-300">
            {opponentName[0]?.toUpperCase()}
          </div>
        </div>
      </motion.div>

      {/* Three Setting Cards */}
      <div className="max-w-4xl w-full flex flex-col gap-6">
        
        {/* CARD 1: TOPIC */}
        <SettingCard
          title="Problem Topic"
          description="All problems in this contest will be sampled exclusively from the selected category."
          icon={<Code2 className="w-5 h-5 text-indigo-400" />}
          roll={rolls.topic}
          currentUserId={currentUserId}
          opponentName={opponentName}
          isChosen={isTopicDone}
          chosenValue={availableTopics.find(t => t.id === choices.topic)?.label || choices.topic}
        >
          {rolls.topic?.winnerId === currentUserId ? (
            <div className="mt-4">
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> You won the roll! Select a topic:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {availableTopics.map((topic) => {
                  const isSelected = choices.topic === topic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => chooseSetting('topic', topic.id)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 flex flex-col items-center justify-center gap-1 text-center ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 scale-105'
                          : 'bg-white/[0.04] text-neutral-300 border-white/5 hover:border-indigo-500/40 hover:bg-white/[0.08]'
                      }`}
                    >
                      <span className="font-semibold">{topic.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <WaitingPlaceholder 
              isChosen={isTopicDone} 
              winnerName={opponentName} 
              chosenText={availableTopics.find(t => t.id === choices.topic)?.label || choices.topic}
              settingLabel="topic"
            />
          )}
        </SettingCard>

        {/* CARD 2: QUESTION COUNT */}
        <SettingCard
          title="Total Number of Questions"
          description="Decide how many questions both players must race to solve (1 to 3)."
          icon={<Layers className="w-5 h-5 text-amber-400" />}
          roll={rolls.questionCount}
          currentUserId={currentUserId}
          opponentName={opponentName}
          isChosen={isCountDone}
          chosenValue={choices.questionCount ? `${choices.questionCount} ${choices.questionCount === 1 ? 'Problem' : 'Problems'}` : null}
        >
          {rolls.questionCount?.winnerId === currentUserId ? (
            <div className="mt-4">
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> You won the roll! Select question count:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {availableQuestionCounts.map((count) => {
                  const isSelected = choices.questionCount === count;
                  const labelMap = {
                    1: { name: '1 Question', sub: 'Fast Sprint Duel' },
                    2: { name: '2 Questions', sub: 'Balanced Match' },
                    3: { name: '3 Questions', sub: 'Full Gauntlet' }
                  };
                  return (
                    <button
                      key={count}
                      onClick={() => chooseSetting('questionCount', count)}
                      className={`p-4 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center text-center gap-1 ${
                        isSelected
                          ? 'bg-amber-500 text-black border-amber-300 shadow-lg shadow-amber-500/25 scale-[1.02]'
                          : 'bg-white/[0.04] text-neutral-300 border-white/5 hover:border-amber-500/40 hover:bg-white/[0.08]'
                      }`}
                    >
                      <span className={`text-lg font-black ${isSelected ? 'text-black' : 'text-white'}`}>
                        {labelMap[count]?.name || `${count} Questions`}
                      </span>
                      <span className={`text-xs ${isSelected ? 'text-black/80 font-medium' : 'text-neutral-400'}`}>
                        {labelMap[count]?.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <WaitingPlaceholder 
              isChosen={isCountDone} 
              winnerName={opponentName} 
              chosenText={choices.questionCount ? `${choices.questionCount} ${choices.questionCount === 1 ? 'Question' : 'Questions'}` : null}
              settingLabel="question count"
            />
          )}
        </SettingCard>

        {/* CARD 3: TIME PER QUESTION */}
        <SettingCard
          title="Time Per Question"
          description="Total match time is calculated as (Questions × Time). Choose 10 to 30 minutes."
          icon={<Timer className="w-5 h-5 text-emerald-400" />}
          roll={rolls.timePerQuestion}
          currentUserId={currentUserId}
          opponentName={opponentName}
          isChosen={isTimeDone}
          chosenValue={choices.timePerQuestion ? `${choices.timePerQuestion} min / problem` : null}
        >
          {rolls.timePerQuestion?.winnerId === currentUserId ? (
            <div className="mt-4">
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> You won the roll! Select time per question:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {availableTimesPerQuestion.map((minutes) => {
                  const isSelected = choices.timePerQuestion === minutes;
                  return (
                    <button
                      key={minutes}
                      onClick={() => chooseSetting('timePerQuestion', minutes)}
                      className={`p-3 rounded-xl border text-center transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-emerald-500 text-black border-emerald-300 shadow-lg shadow-emerald-500/25 scale-105'
                          : 'bg-white/[0.04] text-neutral-300 border-white/5 hover:border-emerald-500/40 hover:bg-white/[0.08]'
                      }`}
                    >
                      <span className={`text-base font-black ${isSelected ? 'text-black' : 'text-white'}`}>
                        {minutes} min
                      </span>
                      <span className={`text-[10px] ${isSelected ? 'text-black/80' : 'text-neutral-400'}`}>
                        per question
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <WaitingPlaceholder 
              isChosen={isTimeDone} 
              winnerName={opponentName} 
              chosenText={choices.timePerQuestion ? `${choices.timePerQuestion} minutes per question` : null}
              settingLabel="time per question"
            />
          )}
        </SettingCard>

      </div>

      {/* Match Configuration Overview Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full mt-6 bg-[#0c0c14] border border-white/10 rounded-2xl p-5 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 text-xs uppercase font-bold tracking-wider">Topic:</span>
            <span className="font-semibold text-white">
              {choices.topic ? availableTopics.find(t => t.id === choices.topic)?.label || choices.topic : <span className="text-neutral-500 italic">Pending...</span>}
            </span>
          </div>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 text-xs uppercase font-bold tracking-wider">Questions:</span>
            <span className="font-semibold text-white">
              {choices.questionCount ? `${choices.questionCount}` : <span className="text-neutral-500 italic">Pending...</span>}
            </span>
          </div>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 text-xs uppercase font-bold tracking-wider">Match Duration:</span>
            <span className="font-semibold text-white">
              {choices.questionCount && choices.timePerQuestion ? (
                <span className="text-emerald-400 font-bold">{choices.questionCount * choices.timePerQuestion} minutes total</span>
              ) : (
                <span className="text-neutral-500 italic">Pending...</span>
              )}
            </span>
          </div>
        </div>

        <div>
          {allDone ? (
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Settings locked! Arena launching...
            </div>
          ) : (
            <div className="flex items-center gap-2 text-neutral-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Waiting for remaining choices to be selected...
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Subcomponent for each Setting Card
const SettingCard = ({
  title,
  description,
  icon,
  roll,
  currentUserId,
  opponentName,
  isChosen,
  chosenValue,
  children
}) => {
  const isMeWinner = roll?.winnerId === currentUserId;
  const winnerName = isMeWinner ? 'You' : opponentName;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border p-5 sm:p-6 transition-all duration-300 backdrop-blur-xl ${
        isChosen 
          ? 'bg-white/[0.02] border-white/10 shadow-lg' 
          : isMeWinner 
            ? 'bg-gradient-to-br from-white/[0.04] to-violet-500/[0.03] border-violet-500/30 shadow-violet-500/5 shadow-xl' 
            : 'bg-white/[0.02] border-white/10'
      }`}
    >
      {/* Top Row: Setting Header & Dice Rolls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 mt-0.5">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{title}</h3>
              {isChosen && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Locked: {chosenValue}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">{description}</p>
          </div>
        </div>

        {/* Dice roll battle display */}
        {roll && (
          <div className="flex items-center gap-3 bg-black/40 px-3.5 py-2 rounded-xl border border-white/5 self-start sm:self-center">
            <div className="flex items-center gap-2">
              <DiceFace value={roll.p1Roll} isWinner={roll.p1Roll > roll.p2Roll} />
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">vs</span>
              <DiceFace value={roll.p2Roll} isWinner={roll.p2Roll > roll.p1Roll} />
            </div>

            <div className="pl-2 border-l border-white/10">
              <div className="text-[10px] text-neutral-400 uppercase font-semibold">Roll Winner</div>
              <div className={`text-xs font-bold ${isMeWinner ? 'text-amber-400' : 'text-neutral-200'}`}>
                {winnerName} {isMeWinner && '(You)'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Content: Choices */}
      {children}
    </motion.div>
  );
};

// Subcomponent for opponent waiting placeholder
const WaitingPlaceholder = ({ isChosen, winnerName, chosenText, settingLabel }) => {
  if (isChosen) {
    return (
      <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
        <span className="text-xs text-neutral-300">
          <strong className="text-white">{winnerName}</strong> selected the {settingLabel}:
        </span>
        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
          {chosenText}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
      <div className="w-4 h-4 rounded-full border-2 border-neutral-500 border-t-amber-400 animate-spin" />
      <span className="text-xs text-neutral-400">
        Waiting for <strong className="text-neutral-200">{winnerName}</strong> to select the {settingLabel}...
      </span>
    </div>
  );
};

export default PreMatchSetup;
