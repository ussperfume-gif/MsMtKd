import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Trophy, History, Play, RotateCcw, ChevronRight, Timer, Home } from 'lucide-react';
import { AnalogClock } from './components/AnalogClock';
import { Level, Question, Record } from './types';

const QUESTIONS_COUNT = 20;

export default function App() {
  const [view, setView] = useState<'home' | 'game' | 'result' | 'history'>('home');
  const [level, setLevel] = useState<Level>('beginner');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ hour: string; minute: string }[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [currentInput, setCurrentInput] = useState({ hour: '', minute: '' });
  
  const hourInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/records');
      if (res.ok) {
        const data = await res.json();
        console.log("Fetched records:", data);
        setRecords(data);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
    }
  };

  const generateQuestions = (selectedLevel: Level): Question[] => {
    const qs: Question[] = [];
    for (let i = 0; i < QUESTIONS_COUNT; i++) {
      const hour = Math.floor(Math.random() * 12) + 1;
      let minute = 0;
      
      if (selectedLevel === 'beginner') {
        minute = Math.random() < 0.5 ? 0 : 30;
      } else if (selectedLevel === 'intermediate') {
        // Exclude 0 and 30 (beginner cases)
        const intermediateOptions = [5, 10, 15, 20, 25, 35, 40, 45, 50, 55];
        minute = intermediateOptions[Math.floor(Math.random() * intermediateOptions.length)];
      } else {
        // Advanced: Exclude multiples of 5 (beginner and intermediate cases)
        do {
          minute = Math.floor(Math.random() * 60);
        } while (minute % 5 === 0);
      }
      
      qs.push({ hour, minute });
    }
    return qs;
  };

  const startGame = (selectedLevel: Level) => {
    setLevel(selectedLevel);
    setQuestions(generateQuestions(selectedLevel));
    setCurrentIndex(0);
    setUserAnswers([]);
    setCurrentInput({ hour: '', minute: '' });
    setStartTime(Date.now());
    setEndTime(null);
    setView('game');
    setTimeout(() => hourInputRef.current?.focus(), 100);
  };

  const handleNext = () => {
    const newAnswers = [...userAnswers, currentInput];
    setUserAnswers(newAnswers);
    
    if (currentIndex < QUESTIONS_COUNT - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentInput({ hour: '', minute: '' });
      hourInputRef.current?.focus();
    } else {
      finishGame(newAnswers);
    }
  };

  const finishGame = async (finalAnswers: { hour: string; minute: string }[]) => {
    const now = Date.now();
    setEndTime(now);
    const timeSeconds = Math.floor((now - (startTime || now)) / 1000);
    
    let correctCount = 0;
    questions.forEach((q, i) => {
      const h = parseInt(finalAnswers[i].hour);
      const m = parseInt(finalAnswers[i].minute);
      if (h === q.hour && m === q.minute) {
        correctCount++;
      }
    });
    
    const score = Math.round((correctCount / QUESTIONS_COUNT) * 100);
    
    // Save record
    try {
      await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          score,
          correct_count: correctCount,
          time_seconds: timeSeconds
        })
      });
      fetchRecords();
    } catch (error) {
      console.error('Failed to save record:', error);
    }
    
    setView('result');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}分${s}秒`;
  };

  const getLevelLabel = (l: Level) => {
    switch (l) {
      case 'beginner': return '初級';
      case 'intermediate': return '中級';
      case 'advanced': return '上級';
    }
  };

  return (
    <div className="h-screen bg-[#f5f5f0] text-[#1a1a1a] font-sans selection:bg-olive-200 flex flex-col overflow-hidden">
      <header className="p-4 flex justify-between items-center max-w-4xl w-full mx-auto shrink-0">
        <h1 className="text-2xl font-serif font-bold tracking-tight flex items-center gap-2">
          <Clock className="w-7 h-7 text-olive-700" />
          とけいマスター
        </h1>
        {view !== 'home' && (
          <button 
            onClick={() => setView('home')}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <Home className="w-6 h-6" />
          </button>
        )}
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 overflow-hidden flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 text-center"
            >
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-black/5 space-y-6">
                <h2 className="text-xl font-serif italic">レベルをえらんでね</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(['beginner', 'intermediate', 'advanced'] as Level[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => startGame(l)}
                      className={`p-6 rounded-2xl border-2 transition-all group relative overflow-hidden
                        ${l === 'beginner' ? 'border-emerald-200 hover:bg-emerald-50' : 
                          l === 'intermediate' ? 'border-amber-200 hover:bg-amber-50' : 
                          'border-rose-200 hover:bg-rose-50'}`}
                    >
                      <span className="text-lg font-bold block mb-1">{getLevelLabel(l)}</span>
                      <span className="text-xs text-gray-500">
                        {l === 'beginner' ? '○時ちょうど・30分' : 
                         l === 'intermediate' ? '5分きざみ' : 
                         '1分きざみ'}
                      </span>
                      <Play className="absolute bottom-3 right-3 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>

              {records.length > 0 && (
                <div className="bg-white/50 p-4 rounded-2xl border border-black/5 space-y-3">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">さいきんのきろく</h3>
                  <div className="flex flex-col gap-2">
                    {records.slice(0, 2).map((record) => (
                      <div key={record.id} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm text-sm">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                            ${record.level === 'beginner' ? 'bg-emerald-100 text-emerald-700' : 
                              record.level === 'intermediate' ? 'bg-amber-100 text-amber-700' : 
                              'bg-rose-100 text-rose-700'}`}>
                            {getLevelLabel(record.level)}
                          </span>
                          <span className="text-gray-400">
                            {(() => {
                              const d = new Date(record.created_at.replace(' ', 'T') + 'Z');
                              return isNaN(d.getTime()) ? '---' : d.toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold">{record.score}点</span>
                          <span className="text-gray-500">{formatTime(record.time_seconds)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setView('history')}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-white rounded-full shadow-sm border border-black/5 hover:bg-gray-50 transition-colors text-sm"
              >
                <History className="w-4 h-4" />
                きろくをみる
              </button>
            </motion.div>
          )}

          {view === 'game' && (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-4 flex flex-col h-full"
            >
              <div className="flex justify-between items-center px-4 shrink-0">
                <div className="text-lg font-medium">
                  もんだい {currentIndex + 1} / {QUESTIONS_COUNT}
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Timer className="w-5 h-5" />
                  <span>{formatTime(Math.floor((Date.now() - (startTime || 0)) / 1000))}</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-black/5 flex flex-col items-center justify-center flex-1 min-h-0 gap-6">
                <div className="flex-1 flex items-center justify-center min-h-0">
                  <AnalogClock 
                    hour={questions[currentIndex].hour} 
                    minute={questions[currentIndex].minute} 
                    size={Math.min(window.innerHeight * 0.5, 400)}
                  />
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <input
                      ref={hourInputRef}
                      type="number"
                      value={currentInput.hour}
                      onChange={(e) => setCurrentInput({ ...currentInput, hour: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                      className="w-20 h-20 text-3xl text-center font-bold bg-gray-50 rounded-2xl border-2 border-transparent focus:border-olive-500 outline-none transition-all"
                      placeholder="じ"
                    />
                    <span className="text-xs font-bold text-gray-400">じ</span>
                  </div>
                  <span className="text-3xl font-bold text-gray-300">:</span>
                  <div className="flex flex-col items-center gap-1">
                    <input
                      type="number"
                      value={currentInput.minute}
                      onChange={(e) => setCurrentInput({ ...currentInput, minute: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                      className="w-20 h-20 text-3xl text-center font-bold bg-gray-50 rounded-2xl border-2 border-transparent focus:border-olive-500 outline-none transition-all"
                      placeholder="ふん"
                    />
                    <span className="text-xs font-bold text-gray-400">ふん</span>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={!currentInput.hour || !currentInput.minute}
                    className="ml-2 w-14 h-14 flex items-center justify-center bg-olive-700 text-white rounded-2xl hover:bg-olive-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-7 h-7" />
                  </button>
                </div>
              </div>
              
              <div className="text-center shrink-0">
                <button 
                  onClick={() => setView('home')}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  おわる
                </button>
              </div>
            </motion.div>
          )}

          {view === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[32px] shadow-sm border border-black/5 text-center space-y-6"
            >
              <div className="space-y-1">
                <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
                <h2 className="text-2xl font-serif font-bold">おつかれさまでした！</h2>
              </div>

              <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100">
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 block">てんすう</span>
                  <span className="text-3xl font-bold text-olive-700">
                    {Math.round((userAnswers.filter((ans, i) => 
                      parseInt(ans.hour) === questions[i].hour && 
                      parseInt(ans.minute) === questions[i].minute
                    ).length / QUESTIONS_COUNT) * 100)}
                  </span>
                  <span className="text-xs text-gray-400">てん</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 block">せいかい</span>
                  <span className="text-3xl font-bold">
                    {userAnswers.filter((ans, i) => 
                      parseInt(ans.hour) === questions[i].hour && 
                      parseInt(ans.minute) === questions[i].minute
                    ).length}
                  </span>
                  <span className="text-xs text-gray-400"> / {QUESTIONS_COUNT}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-500 block">じかん</span>
                  <span className="text-3xl font-bold">
                    {formatTime(Math.floor(((endTime || 0) - (startTime || 0)) / 1000))}
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => startGame(level)}
                  className="px-6 py-3 bg-olive-700 text-white rounded-full font-bold hover:bg-olive-800 transition-all flex items-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  もういちど
                </button>
                <button
                  onClick={() => setView('home')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-bold hover:bg-gray-200 transition-all text-sm"
                >
                  トップへもどる
                </button>
              </div>
            </motion.div>
          )}

          {view === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 h-full flex flex-col"
            >
              <div className="flex items-center justify-between shrink-0">
                <h2 className="text-xl font-serif font-bold">これまでのきろく</h2>
                <button
                  onClick={() => setView('home')}
                  className="text-olive-700 font-bold hover:underline text-sm"
                >
                  もどる
                </button>
              </div>

              <div className="bg-white rounded-[32px] shadow-sm border border-black/5 overflow-hidden flex-1 min-h-0 flex flex-col">
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-bottom border-gray-100 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500">にちじ</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500">レベル</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500">てんすう</th>
                        <th className="px-6 py-3 text-xs font-bold text-gray-500">じかん</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {records.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                            まだきろくがありません
                          </td>
                        </tr>
                      ) : (
                        records.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-3 text-xs">
                              {(() => {
                                const d = new Date(record.created_at.replace(' ', 'T') + 'Z');
                                return isNaN(d.getTime()) ? '---' : d.toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                              })()}
                            </td>
                            <td className="px-6 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                                ${record.level === 'beginner' ? 'bg-emerald-100 text-emerald-700' : 
                                  record.level === 'intermediate' ? 'bg-amber-100 text-amber-700' : 
                                  'bg-rose-100 text-rose-700'}`}>
                                {getLevelLabel(record.level)}
                              </span>
                            </td>
                            <td className="px-6 py-3 font-bold text-sm">{record.score}点</td>
                            <td className="px-6 py-3 text-gray-500 text-xs">{formatTime(record.time_seconds)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
