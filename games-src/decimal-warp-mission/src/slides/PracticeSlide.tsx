import { useState, useCallback } from 'react';
import { CheckCircle, XCircle, RefreshCw, Trophy, Star } from 'lucide-react';

const QUESTIONS = [
  {
    question: 'What is the value of the digit 7 in 3.74?',
    options: ['7 ones', '7 tenths', '7 hundredths', '7 tens'],
    correct: 1,
    explanation: '7 is in the TENTHS place, so it equals 0.7',
    category: 'places',
  },
  {
    question: 'What is 2.4 + 1.3?',
    options: ['3.7', '3.77', '4.7', '36.7'],
    correct: 0,
    explanation: 'Line up the points: 4+3=7 tenths, 2+1=3 ones → 3.7',
    category: 'adding',
  },
  {
    question: 'What is 8.5 − 3.2?',
    options: ['5.7', '5.3', '4.3', '11.7'],
    correct: 1,
    explanation: '5−2=3 tenths, 8−3=5 ones → 5.3',
    category: 'subtracting',
  },
  {
    question: 'What is the digit in the hundredths place in 4.82?',
    options: ['4', '8', '2', '.'],
    correct: 2,
    explanation: '4 is ones, 8 is tenths, 2 is HUNDREDTHS',
    category: 'places',
  },
  {
    question: 'What is 0.6 + 0.7?',
    options: ['0.13', '1.3', '13.0', '0.67'],
    correct: 1,
    explanation: '6+7=13 tenths = 1 whole and 3 tenths → 1.3',
    category: 'adding',
  },
  {
    question: 'What is 5.0 − 2.4?',
    options: ['2.4', '3.4', '2.6', '7.4'],
    correct: 2,
    explanation: 'Borrow: 10−4=6 tenths, 4−2=2 ones → 2.6',
    category: 'subtracting',
  },
  {
    question: 'Which number has a 9 in the hundredths place?',
    options: ['9.12', '1.92', '0.09', '19.2'],
    correct: 2,
    explanation: '0.09: 0 ones, 0 tenths, 9 HUNDREDTHS',
    category: 'places',
  },
  {
    question: 'What is 3.15 + 2.8?',
    options: ['5.95', '5.23', '5.85', '6.05'],
    correct: 0,
    explanation: 'Pad: 3.15 + 2.80 → 5+0=5, 1+8=9, 3+2=5 → 5.95',
    category: 'adding',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  places: '#00ffff',
  adding: '#00ff88',
  subtracting: '#ff9944',
};

export default function PracticeSlide() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(QUESTIONS.length).fill(null));
  const [complete, setComplete] = useState(false);

  const current = QUESTIONS[questionIndex];
  const isAnswered = selected !== null;
  const isCorrect = selected === current.correct;
  const score = answers.filter(Boolean).length;

  const handleSelect = (i: number) => {
    if (isAnswered) return;
    setSelected(i);
    const newAnswers = [...answers];
    newAnswers[questionIndex] = i === current.correct;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex(q => q + 1);
      setSelected(null);
    } else {
      setComplete(true);
    }
  };

  const reset = useCallback(() => {
    setQuestionIndex(0);
    setSelected(null);
    setAnswers(Array(QUESTIONS.length).fill(null));
    setComplete(false);
  }, []);

  const categoryColor = CATEGORY_COLORS[current.category] || '#00ffff';

  if (complete) {
    const pct = Math.round((score / QUESTIONS.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center h-full w-full px-8 py-6 gap-6 text-center">
        <Trophy size={56} className="text-yellow-400" style={{ filter: 'drop-shadow(0 0 16px #ffaa00)' }} />
        <div>
          <h2 className="text-3xl font-bold text-white tracking-wider uppercase mb-2" style={{ textShadow: '0 0 18px rgba(255,200,0,0.5)' }}>
            Mission Complete!
          </h2>
          <p className="text-yellow-400 text-sm font-mono tracking-widest">FINAL SCORE</p>
        </div>
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
            <circle cx="64" cy="64" r="54" fill="none" stroke="#1a2a1a" strokeWidth="12" />
            <circle
              cx="64" cy="64" r="54" fill="none"
              stroke={pct >= 75 ? '#00ff88' : pct >= 50 ? '#ffaa00' : '#ff4444'}
              strokeWidth="12"
              strokeDasharray={`${(pct / 100) * 339.3} 339.3`}
              style={{ filter: `drop-shadow(0 0 6px ${pct >= 75 ? '#00ff88' : '#ffaa00'})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{score}</span>
            <span className="text-xs text-gray-400 font-mono">/{QUESTIONS.length}</span>
          </div>
        </div>
        <div className="flex gap-1">
          {answers.map((a, i) => (
            <div key={i} style={{ color: a ? '#00ff88' : '#ff4444' }}>
              {a ? <CheckCircle size={18} /> : <XCircle size={18} />}
            </div>
          ))}
        </div>
        <p className="text-gray-300 text-sm font-mono max-w-sm">
          {pct === 100 ? 'Perfect score! You are a Decimal Master!' :
           pct >= 75 ? 'Excellent work, Space Cadet! Almost perfect!' :
           pct >= 50 ? 'Good effort! Review the missed questions and try again.' :
           'Keep practicing! Review the slides and try again.'}
        </p>
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 rounded border border-cyan-600 bg-cyan-950/30 text-cyan-200 font-mono text-sm tracking-wide hover:bg-cyan-900/40 transition-all"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 py-4 gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white tracking-wider uppercase mb-1" style={{ textShadow: '0 0 14px rgba(255,200,0,0.4)' }}>
          Practice Mission
        </h2>
        <div className="flex items-center gap-2 justify-center">
          <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded" style={{ color: categoryColor, background: categoryColor + '22', border: `1px solid ${categoryColor}44` }}>
            {current.category}
          </span>
          <span className="text-gray-500 text-[10px] font-mono">{questionIndex + 1} / {QUESTIONS.length}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-lg flex gap-1">
        {QUESTIONS.map((q, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded transition-all duration-500"
            style={{
              background: i < questionIndex
                ? answers[i] ? '#00ff88' : '#ff4444'
                : i === questionIndex ? '#ffffff44' : '#1a3344',
            }}
          />
        ))}
      </div>

      {/* Score */}
      <div className="flex items-center gap-2">
        {Array.from({ length: QUESTIONS.length }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className="transition-all duration-300"
            fill={answers[i] === true ? '#ffaa00' : 'transparent'}
            style={{ color: answers[i] === true ? '#ffaa00' : '#1a3344' }}
          />
        ))}
      </div>

      {/* Question */}
      <div className="w-full max-w-lg px-5 py-4 rounded-lg border border-cyan-900/60 bg-cyan-950/20 text-center">
        <p className="text-white text-base font-mono leading-relaxed">{current.question}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
        {current.options.map((opt, i) => {
          let borderColor = '#1a3344';
          let bg = 'transparent';
          let textColor = '#9aa5b0';
          if (isAnswered) {
            if (i === current.correct) {
              borderColor = '#00ff88';
              bg = '#00ff8820';
              textColor = '#00ff88';
            } else if (i === selected && i !== current.correct) {
              borderColor = '#ff4444';
              bg = '#ff444420';
              textColor = '#ff6666';
            }
          } else if (selected === i) {
            borderColor = categoryColor;
            bg = categoryColor + '20';
            textColor = '#ffffff';
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={isAnswered}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-mono text-left transition-all duration-300 disabled:cursor-default hover:scale-[1.02]"
              style={{ borderColor, background: bg, color: textColor }}
            >
              <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] flex-shrink-0" style={{ borderColor: textColor }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
              {isAnswered && i === current.correct && <CheckCircle size={14} className="ml-auto text-green-400 flex-shrink-0" />}
              {isAnswered && i === selected && i !== current.correct && <XCircle size={14} className="ml-auto text-red-400 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Explanation + Next */}
      {isAnswered && (
        <div className="w-full max-w-lg flex flex-col gap-2">
          <div
            className="px-4 py-2 rounded border text-xs font-mono text-center"
            style={{
              borderColor: isCorrect ? '#00ff8866' : '#ff444466',
              background: isCorrect ? '#00ff8815' : '#ff444415',
              color: isCorrect ? '#00ff88' : '#ff8888',
            }}
          >
            {isCorrect ? '✓ Correct! ' : '✗ Not quite. '}{current.explanation}
          </div>
          <button
            onClick={handleNext}
            className="w-full py-2 rounded border border-cyan-700 bg-cyan-950/30 text-cyan-200 text-xs font-mono tracking-widest hover:bg-cyan-900/40 transition-all duration-200"
          >
            {questionIndex < QUESTIONS.length - 1 ? 'NEXT QUESTION →' : 'SEE RESULTS →'}
          </button>
        </div>
      )}
    </div>
  );
}
