import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Upload, Shuffle, Trash2, Settings, List, Trophy, RotateCcw, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [candidatesText, setCandidatesText] = useState('');
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [history, setHistory] = useState<{ id: string; name: string; time: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm';
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert'
  });

  const showAlert = (title: string, message: string) => {
    setModalConfig({ isOpen: true, title, message, type: 'alert' });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setModalConfig({ isOpen: true, title, message, type: 'confirm', onConfirm });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const candidates = candidatesText
    .split(/[\n,]+/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

  const availableCandidates = allowRepeat
    ? candidates
    : candidates.filter((c) => !history.some((h) => h.name === c));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCandidatesText((prev) => (prev ? prev + '\n' + text : text));
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const startDraw = () => {
    if (availableCandidates.length === 0) {
      showAlert('無法抽籤', '沒有可抽籤的名單！請新增名單或允許重複抽籤。');
      return;
    }

    setIsDrawing(true);
    setWinner(null);

    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    const drawInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) {
        clearInterval(drawInterval);
        finishDraw();
      } else {
        const randomIndex = Math.floor(Math.random() * availableCandidates.length);
        setCurrentDisplay(availableCandidates[randomIndex]);
      }
    }, 50);
  };

  const finishDraw = () => {
    // Need to recalculate available candidates to ensure correctness
    const currentAvailable = allowRepeat
      ? candidates
      : candidates.filter((c) => !history.some((h) => h.name === c));
      
    if (currentAvailable.length === 0) {
      setIsDrawing(false);
      return;
    }

    const randomIndex = Math.floor(Math.random() * currentAvailable.length);
    const finalWinner = currentAvailable[randomIndex];
    
    setCurrentDisplay(finalWinner);
    setWinner(finalWinner);
    setIsDrawing(false);
    
    setHistory((prev) => [
      { id: crypto.randomUUID(), name: finalWinner, time: Date.now() },
      ...prev,
    ]);

    triggerConfetti();
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const clearHistory = () => {
    showConfirm('清除紀錄', '確定要清除所有抽籤紀錄嗎？', () => {
      setHistory([]);
    });
  };

  const clearCandidates = () => {
    showConfirm('清空名單', '確定要清空名單嗎？', () => {
      setCandidatesText('');
    });
  };

  const exampleLists = [
    { name: '數字 1-50', data: Array.from({length: 50}, (_, i) => i + 1).join('\n') },
    { name: '十二星座', data: '牡羊座\n金牛座\n雙子座\n巨蟹座\n獅子座\n處女座\n天秤座\n天蠍座\n射手座\n摩羯座\n水瓶座\n雙魚座' },
    { name: '十二生肖', data: '鼠\n牛\n虎\n兔\n龍\n蛇\n馬\n羊\n猴\n雞\n狗\n豬' },
    { name: '常見英文名', data: 'Alice\nBob\nCharlie\nDavid\nEve\nFrank\nGrace\nHenry\nIvy\nJack\nKevin\nLily\nMary\nNancy\nOliver' }
  ];

  const loadExample = (data: string) => {
    if (candidatesText.trim() !== '') {
      showConfirm('載入範例', '這將會覆蓋目前的名單，確定要載入嗎？', () => {
        setCandidatesText(data);
      });
    } else {
      setCandidatesText(data);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Settings & Input */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-500" />
                抽籤設定
              </h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  checked={allowRepeat}
                  onChange={(e) => setAllowRepeat(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className="font-medium text-slate-700">允許重複抽籤</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <List className="w-5 h-5 text-indigo-500" />
                抽籤名單
              </h2>
              <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
                共 {candidates.length} 人
              </span>
            </div>

            <div className="flex gap-2 mb-4">
              <label className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-xl cursor-pointer transition-colors font-medium text-sm">
                <Upload className="w-4 h-4" />
                上傳檔案 (TXT/CSV)
                <input type="file" accept=".txt,.csv" className="hidden" onChange={handleFileUpload} />
              </label>
              <button 
                onClick={clearCandidates}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                title="清空名單"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs text-slate-500 flex items-center font-medium">快速載入：</span>
              {exampleLists.map((ex) => (
                <button
                  key={ex.name}
                  onClick={() => loadExample(ex.data)}
                  className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                >
                  {ex.name}
                </button>
              ))}
            </div>

            <textarea
              value={candidatesText}
              onChange={(e) => setCandidatesText(e.target.value)}
              placeholder="請輸入名單，使用換行或逗號分隔..."
              className="flex-1 w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all outline-none"
            />
            
            {!allowRepeat && candidates.length > 0 && (
              <div className="mt-4 text-sm text-slate-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                剩餘可抽：{availableCandidates.length} 人
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Draw Area */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex-1 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
              <div className="absolute top-1/2 -right-24 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-32 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="h-48 w-full flex items-center justify-center mb-12">
                <AnimatePresence mode="wait">
                  {currentDisplay ? (
                    <motion.div
                      key={currentDisplay}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: winner ? 1.2 : 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.9 }}
                      transition={{ duration: winner ? 0.5 : 0.1, type: winner ? "spring" : "tween" }}
                      className={`text-center px-4 ${winner ? 'text-indigo-600' : 'text-slate-800'}`}
                    >
                      <h1 className="text-5xl md:text-7xl font-bold tracking-tight break-all line-clamp-2">
                        {currentDisplay}
                      </h1>
                      {winner && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3, type: "spring" }}
                          className="mt-6 inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-lg font-semibold"
                        >
                          <Trophy className="w-5 h-5" />
                          恭喜中籤！
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-slate-300 flex flex-col items-center gap-4"
                    >
                      <Shuffle className="w-16 h-16" />
                      <p className="text-xl font-medium">準備就緒，點擊下方按鈕開始</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={startDraw}
                disabled={isDrawing || availableCandidates.length === 0}
                className={`
                  relative group overflow-hidden rounded-2xl px-12 py-5 text-xl font-bold text-white shadow-lg transition-all
                  ${isDrawing || availableCandidates.length === 0 
                    ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30 hover:-translate-y-1 active:translate-y-0'}
                `}
              >
                {isDrawing && (
                  <div className="absolute inset-0 w-full h-full">
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_1.5s_infinite] -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </div>
                )}
                <span className="relative flex items-center gap-3">
                  {isDrawing ? (
                    <>
                      <RotateCcw className="w-6 h-6 animate-spin" />
                      抽籤中...
                    </>
                  ) : (
                    <>
                      <Shuffle className="w-6 h-6" />
                      開始抽籤
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full max-h-[800px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                抽籤紀錄
              </h2>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="text-sm text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  清除
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              <AnimatePresence>
                {history.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 py-12"
                  >
                    <FileText className="w-12 h-12 opacity-20" />
                    <p className="text-sm">尚無抽籤紀錄</p>
                  </motion.div>
                ) : (
                  history.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between group hover:border-indigo-100 hover:bg-indigo-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {history.length - index}
                        </div>
                        <div className="truncate font-medium text-slate-700 group-hover:text-indigo-700 transition-colors">
                          {item.name}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 shrink-0 ml-2">
                        {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>

      {/* Custom Modal */}
      <AnimatePresence>
        {modalConfig.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">{modalConfig.title}</h3>
                <p className="text-slate-600">{modalConfig.message}</p>
              </div>
              <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
                {modalConfig.type === 'confirm' && (
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                )}
                <button
                  onClick={() => {
                    modalConfig.onConfirm?.();
                    closeModal();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  確定
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
