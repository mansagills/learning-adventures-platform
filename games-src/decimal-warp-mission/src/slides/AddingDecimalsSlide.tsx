import { useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

const PROBLEMS = [
  {
    a: '3.4',
    b: '2.5',
    answer: '5.9',
    steps: [
      'Line up the decimal points',
      'Add the tenths: 4 + 5 = 9',
      'Add the ones: 3 + 2 = 5',
      'Bring down the decimal point',
    ],
  },
  {
    a: '12.75',
    b: '4.6',
    answer: '17.35',
    steps: [
      'Line up the decimal points (pad 4.6 → 4.60)',
      'Add hundredths: 5 + 0 = 5',
      'Add tenths: 7 + 6 = 13, write 3 carry 1',
      'Add ones: 2 + 4 + 1 = 7, tens: 1 + 0 = 1',
    ],
  },
  {
    a: '0.8',
    b: '0.35',
    answer: '1.15',
    steps: [
      'Line up the decimal points (pad 0.8 → 0.80)',
      'Add hundredths: 0 + 5 = 5',
      'Add tenths: 8 + 3 = 11, write 1 carry 1',
      'Add ones: 0 + 0 + 1 = 1',
    ],
  },
];

function splitNum(s: string) {
  const [intPart = '0', decPart = ''] = s.split('.');
  return { intPart, decPart };
}

interface RowProps {
  numStr: string;
  maxInt: number;
  maxDec: number;
  color: string;
  glowColor?: string;
  cellW?: string;
}

function NumberRow({ numStr, maxInt, maxDec, color, glowColor, cellW = 'w-8' }: RowProps) {
  const { intPart, decPart } = splitNum(numStr);
  const intPadded = intPart.padStart(maxInt, ' ');
  const decPadded = decPart.padEnd(maxDec, '0');
  const origDecLen = decPart.length;

  return (
    <div className="flex items-center">
      {intPadded.split('').map((ch, i) => (
        <div key={`i${i}`} className={`${cellW} flex items-center justify-center`}>
          {ch !== ' ' && (
            <span
              className="text-2xl font-bold font-mono"
              style={{ color, textShadow: glowColor ? `0 0 10px ${glowColor}` : undefined }}
            >
              {ch}
            </span>
          )}
        </div>
      ))}
      <div className={`${cellW} flex items-center justify-center`}>
        <span className="text-2xl font-bold font-mono" style={{ color: '#22d3ee', textShadow: '0 0 8px #00ffff' }}>.</span>
      </div>
      {decPadded.split('').map((ch, i) => {
        const isPadded = i >= origDecLen;
        return (
          <div key={`d${i}`} className={`${cellW} flex items-center justify-center`}>
            <span
              className="text-2xl font-bold font-mono"
              style={{
                color: isPadded ? '#334455' : color,
                textShadow: isPadded ? 'none' : glowColor ? `0 0 10px ${glowColor}` : undefined,
              }}
            >
              {ch}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function AddingDecimalsSlide() {
  const [problemIndex, setProblemIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const problem = PROBLEMS[problemIndex];

  const { intPart: aInt, decPart: aDec } = splitNum(problem.a);
  const { intPart: bInt, decPart: bDec } = splitNum(problem.b);
  const { intPart: ansInt, decPart: ansDec } = splitNum(problem.answer);
  const maxInt = Math.max(aInt.length, bInt.length, ansInt.length);
  const maxDec = Math.max(aDec.length, bDec.length, ansDec.length);
  const totalCells = maxInt + 1 + maxDec;

  const reset = (idx: number) => {
    setProblemIndex(idx);
    setStep(0);
    setShowAnswer(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 py-4 gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white tracking-wider uppercase mb-1" style={{ textShadow: '0 0 14px rgba(0,255,136,0.5)' }}>
          Adding Decimals
        </h2>
        <p className="text-green-500 text-xs font-mono tracking-widest">Line up the points — then add!</p>
      </div>

      <div className="flex gap-2">
        {PROBLEMS.map((_, i) => (
          <button
            key={i}
            onClick={() => reset(i)}
            className="px-3 py-1 text-xs font-mono rounded border transition-all duration-200"
            style={{
              borderColor: problemIndex === i ? '#00ff88' : '#1a3344',
              background: problemIndex === i ? '#00ff8822' : 'transparent',
              color: problemIndex === i ? '#00ff88' : '#4a7a6a',
            }}
          >
            Problem {i + 1}
          </button>
        ))}
      </div>

      <div className="flex gap-10 items-start">
        {/* Column arithmetic layout */}
        <div
          className="flex flex-col gap-1 p-4 rounded-lg border border-green-900/40 bg-green-950/10"
          style={{ minWidth: `${totalCells * 2.5 + 3}rem` }}
        >
          {/* Top number (a) */}
          <div className="flex items-center">
            <div className="w-8 flex items-center justify-center" />
            <NumberRow numStr={problem.a} maxInt={maxInt} maxDec={maxDec} color="#e5e7eb" />
          </div>

          {/* Bottom number (b) with operator */}
          <div className="flex items-center">
            <div className="w-8 flex items-center justify-center">
              <span className="text-2xl font-bold font-mono text-green-400" style={{ textShadow: '0 0 8px #00ff88' }}>+</span>
            </div>
            <NumberRow numStr={problem.b} maxInt={maxInt} maxDec={maxDec} color="#e5e7eb" />
          </div>

          {/* Divider line */}
          <div className="flex items-center ml-8">
            <div
              className="h-0.5 rounded"
              style={{
                width: `${totalCells * 2}rem`,
                background: 'linear-gradient(90deg, #14532d, #00ff88, #14532d)',
              }}
            />
          </div>

          {/* Answer */}
          <div className="flex items-center">
            <div className="w-8 flex items-center justify-center" />
            <div
              className="transition-all duration-700"
              style={{ opacity: showAnswer ? 1 : 0 }}
            >
              <NumberRow numStr={problem.answer} maxInt={maxInt} maxDec={maxDec} color="#86efac" glowColor="#00ff88" />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-2 min-w-[230px]">
          <span className="text-[10px] text-green-600 tracking-widest uppercase font-mono">Step-by-step:</span>
          {problem.steps.map((s, i) => (
            <div
              key={i}
              className="flex items-start gap-2 transition-all duration-500"
              style={{ opacity: i <= step ? 1 : 0.15, transform: i <= step ? 'translateX(0)' : 'translateX(8px)' }}
            >
              <div
                className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 transition-all duration-300"
                style={{
                  borderColor: i <= step ? '#00ff88' : '#1a3344',
                  background: i < step ? '#00ff8833' : 'transparent',
                }}
              >
                {i < step
                  ? <CheckCircle size={12} className="text-green-400" />
                  : <span className="text-[9px] text-green-600">{i + 1}</span>
                }
              </div>
              <span className="text-xs font-mono text-gray-300 leading-tight">{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {step < problem.steps.length - 1 && (
          <button
            onClick={() => setStep(s => s + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded border border-green-700 bg-green-950/30 text-green-300 text-xs font-mono tracking-wider hover:bg-green-900/40 transition-all duration-200"
          >
            <ArrowRight size={14} />
            Next Step
          </button>
        )}
        {step === problem.steps.length - 1 && !showAnswer && (
          <button
            onClick={() => setShowAnswer(true)}
            className="flex items-center gap-2 px-4 py-2 rounded border border-green-500 bg-green-900/30 text-green-200 text-xs font-mono tracking-wider hover:bg-green-800/40 transition-all duration-200"
            style={{ boxShadow: '0 0 10px rgba(0,255,136,0.2)' }}
          >
            <CheckCircle size={14} />
            Reveal Answer
          </button>
        )}
        {showAnswer && (
          <div className="flex items-center gap-2 px-4 py-2 rounded border border-green-500/60 bg-green-950/30 text-green-300 text-xs font-mono">
            <CheckCircle size={14} className="text-green-400" />
            <span>{problem.a} + {problem.b} = <strong className="text-green-200">{problem.answer}</strong></span>
          </div>
        )}
      </div>

      <div className="w-full max-w-md px-4 py-2 rounded border border-green-900/50 bg-green-950/15 text-center">
        <p className="text-[11px] text-green-400 font-mono tracking-wide">
          RULE: Always line up the <span className="text-white font-bold">decimal points</span> before adding
        </p>
      </div>
    </div>
  );
}
