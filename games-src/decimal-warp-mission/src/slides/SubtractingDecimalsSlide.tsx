import { useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

const PROBLEMS = [
  {
    a: '7.8',
    b: '3.5',
    answer: '4.3',
    steps: [
      'Line up the decimal points',
      'Subtract tenths: 8 − 5 = 3',
      'Subtract ones: 7 − 3 = 4',
      'Bring down the decimal point',
    ],
  },
  {
    a: '15.6',
    b: '8.42',
    answer: '7.18',
    steps: [
      'Line up decimals (pad 15.6 → 15.60)',
      'Subtract hundredths: 0 − 2 → borrow: 10 − 2 = 8',
      'Subtract tenths: 5 (after borrow) − 4 = 1',
      'Subtract ones: 5 − 8 → borrow: 15 − 8 = 7, tens: 0',
    ],
  },
  {
    a: '5.0',
    b: '1.75',
    answer: '3.25',
    steps: [
      'Line up decimals (pad 5.0 → 5.00)',
      'Subtract hundredths: 0 − 5 → borrow: 10 − 5 = 5',
      'Subtract tenths: 9 (after borrow) − 7 = 2',
      'Subtract ones: 4 (after borrow) − 1 = 3',
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

export default function SubtractingDecimalsSlide() {
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
        <h2 className="text-2xl font-bold text-white tracking-wider uppercase mb-1" style={{ textShadow: '0 0 14px rgba(255,153,68,0.5)' }}>
          Subtracting Decimals
        </h2>
        <p className="text-orange-500 text-xs font-mono tracking-widest">Line up, borrow if needed, subtract!</p>
      </div>

      <div className="flex gap-2">
        {PROBLEMS.map((_, i) => (
          <button
            key={i}
            onClick={() => reset(i)}
            className="px-3 py-1 text-xs font-mono rounded border transition-all duration-200"
            style={{
              borderColor: problemIndex === i ? '#ff9944' : '#1a3344',
              background: problemIndex === i ? '#ff994422' : 'transparent',
              color: problemIndex === i ? '#ff9944' : '#4a5a6a',
            }}
          >
            Problem {i + 1}
          </button>
        ))}
      </div>

      <div className="flex gap-10 items-start">
        {/* Column arithmetic layout */}
        <div
          className="flex flex-col gap-1 p-4 rounded-lg border border-orange-900/40 bg-orange-950/10"
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
              <span className="text-2xl font-bold font-mono text-orange-400" style={{ textShadow: '0 0 8px #ff9944' }}>−</span>
            </div>
            <NumberRow numStr={problem.b} maxInt={maxInt} maxDec={maxDec} color="#e5e7eb" />
          </div>

          {/* Divider line */}
          <div className="flex items-center ml-8">
            <div
              className="h-0.5 rounded"
              style={{
                width: `${totalCells * 2}rem`,
                background: 'linear-gradient(90deg, #431407, #ff9944, #431407)',
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
              <NumberRow numStr={problem.answer} maxInt={maxInt} maxDec={maxDec} color="#fdba74" glowColor="#ff9944" />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-2 min-w-[250px]">
          <span className="text-[10px] text-orange-600 tracking-widest uppercase font-mono">Step-by-step:</span>
          {problem.steps.map((s, i) => (
            <div
              key={i}
              className="flex items-start gap-2 transition-all duration-500"
              style={{ opacity: i <= step ? 1 : 0.15, transform: i <= step ? 'translateX(0)' : 'translateX(8px)' }}
            >
              <div
                className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 transition-all duration-300"
                style={{
                  borderColor: i <= step ? '#ff9944' : '#1a3344',
                  background: i < step ? '#ff994433' : 'transparent',
                }}
              >
                {i < step
                  ? <CheckCircle size={12} className="text-orange-400" />
                  : <span className="text-[9px] text-orange-700">{i + 1}</span>
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
            className="flex items-center gap-2 px-4 py-2 rounded border border-orange-700 bg-orange-950/30 text-orange-300 text-xs font-mono tracking-wider hover:bg-orange-900/40 transition-all duration-200"
          >
            <ArrowRight size={14} />
            Next Step
          </button>
        )}
        {step === problem.steps.length - 1 && !showAnswer && (
          <button
            onClick={() => setShowAnswer(true)}
            className="flex items-center gap-2 px-4 py-2 rounded border border-orange-500 bg-orange-900/30 text-orange-200 text-xs font-mono tracking-wider hover:bg-orange-800/40 transition-all duration-200"
            style={{ boxShadow: '0 0 10px rgba(255,153,68,0.2)' }}
          >
            <CheckCircle size={14} />
            Reveal Answer
          </button>
        )}
        {showAnswer && (
          <div className="flex items-center gap-2 px-4 py-2 rounded border border-orange-500/60 bg-orange-950/30 text-orange-300 text-xs font-mono">
            <CheckCircle size={14} className="text-orange-400" />
            <span>{problem.a} − {problem.b} = <strong className="text-orange-200">{problem.answer}</strong></span>
          </div>
        )}
      </div>

      <div className="w-full max-w-md px-4 py-2 rounded border border-orange-900/50 bg-orange-950/15 text-center">
        <p className="text-[11px] text-orange-400 font-mono tracking-wide">
          RULE: Pad with zeros to match decimal places — then subtract column by column
        </p>
      </div>
    </div>
  );
}
