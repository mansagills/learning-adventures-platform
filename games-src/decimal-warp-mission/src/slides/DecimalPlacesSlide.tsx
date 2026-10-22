import { useState } from 'react';

const PLACES = [
  { label: 'Hundreds', value: '1', position: 100, color: '#ff6644', side: 'left' },
  { label: 'Tens', value: '2', position: 10, color: '#ffaa00', side: 'left' },
  { label: 'Ones', value: '3', position: 1, color: '#ffdd00', side: 'left' },
  { label: 'Tenths', value: '4', position: 0.1, color: '#00ff88', side: 'right' },
  { label: 'Hundredths', value: '5', position: 0.01, color: '#00ffff', side: 'right' },
  { label: 'Thousandths', value: '6', position: 0.001, color: '#4488ff', side: 'right' },
];

export default function DecimalPlacesSlide() {
  const [highlighted, setHighlighted] = useState<number | null>(null);

  const examples: Record<number, { number: string; explain: string }> = {
    0: { number: '123.456', explain: 'The digit 1 is in the HUNDREDS place. It represents 100.' },
    1: { number: '123.456', explain: 'The digit 2 is in the TENS place. It represents 20.' },
    2: { number: '123.456', explain: 'The digit 3 is in the ONES place. It represents 3.' },
    3: { number: '123.456', explain: 'The digit 4 is in the TENTHS place (1/10 = 0.1). It represents 0.4.' },
    4: { number: '123.456', explain: 'The digit 5 is in the HUNDREDTHS place (1/100 = 0.01). It represents 0.05.' },
    5: { number: '123.456', explain: 'The digit 6 is in the THOUSANDTHS place (1/1000 = 0.001). It represents 0.006.' },
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 py-4 gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white tracking-wider uppercase mb-1" style={{ textShadow: '0 0 14px rgba(0,255,255,0.5)' }}>
          Decimal Places
        </h2>
        <p className="text-cyan-500 text-xs font-mono tracking-widest">Tap a column to explore its place value</p>
      </div>

      {/* The big number display */}
      <div className="flex items-center justify-center gap-0 text-5xl font-bold font-mono">
        {['1','2','3'].map((d, i) => (
          <button
            key={i}
            onClick={() => setHighlighted(highlighted === i ? null : i)}
            className="transition-all duration-300 px-2 py-1 rounded hover:scale-110"
            style={{
              color: highlighted === i ? PLACES[i].color : '#e5e5e5',
              textShadow: highlighted === i ? `0 0 20px ${PLACES[i].color}` : 'none',
              background: highlighted === i ? PLACES[i].color + '22' : 'transparent',
              transform: highlighted === i ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            {d}
          </button>
        ))}
        <span className="text-cyan-400 px-1" style={{ textShadow: '0 0 12px #00ffff' }}>.</span>
        {['4','5','6'].map((d, i) => (
          <button
            key={i + 3}
            onClick={() => setHighlighted(highlighted === i + 3 ? null : i + 3)}
            className="transition-all duration-300 px-2 py-1 rounded hover:scale-110"
            style={{
              color: highlighted === i + 3 ? PLACES[i + 3].color : '#e5e5e5',
              textShadow: highlighted === i + 3 ? `0 0 20px ${PLACES[i + 3].color}` : 'none',
              background: highlighted === i + 3 ? PLACES[i + 3].color + '22' : 'transparent',
              transform: highlighted === i + 3 ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Place value columns */}
      <div className="flex gap-1 w-full max-w-2xl">
        {PLACES.map((place, i) => (
          <button
            key={i}
            onClick={() => setHighlighted(highlighted === i ? null : i)}
            className="flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded border transition-all duration-300 hover:scale-105"
            style={{
              borderColor: highlighted === i ? place.color : place.color + '33',
              background: highlighted === i ? place.color + '22' : place.color + '08',
              boxShadow: highlighted === i ? `0 0 12px ${place.color}44` : 'none',
            }}
          >
            <span
              className="text-xs font-bold font-mono"
              style={{ color: place.color, textShadow: highlighted === i ? `0 0 8px ${place.color}` : 'none' }}
            >
              {place.value}
            </span>
            <span className="text-[8px] text-gray-400 text-center leading-tight">{place.label}</span>
            {i === 3 && (
              <span className="text-[7px] text-gray-500">÷10</span>
            )}
            {i === 4 && (
              <span className="text-[7px] text-gray-500">÷100</span>
            )}
            {i === 5 && (
              <span className="text-[7px] text-gray-500">÷1000</span>
            )}
          </button>
        ))}
      </div>

      {/* Decimal point indicator */}
      <div className="flex items-center gap-3 w-full max-w-2xl">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-cyan-500/50" />
        <div className="flex items-center gap-2 px-3 py-1 rounded border border-cyan-700/50 bg-cyan-950/30">
          <div className="w-2 h-2 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 6px #00ffff' }} />
          <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Decimal Point separates whole from parts</span>
          <div className="w-2 h-2 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 6px #00ffff' }} />
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 via-orange-500/50 to-transparent" />
      </div>

      {/* Explanation box */}
      <div
        className="w-full max-w-2xl min-h-[52px] flex items-center justify-center transition-all duration-500"
        style={{ opacity: highlighted !== null ? 1 : 0.4 }}
      >
        {highlighted !== null ? (
          <div
            className="w-full px-4 py-3 rounded-lg border text-sm font-mono text-center"
            style={{ borderColor: PLACES[highlighted].color + '66', background: PLACES[highlighted].color + '15', color: PLACES[highlighted].color }}
          >
            {examples[highlighted].explain}
          </div>
        ) : (
          <p className="text-gray-600 text-xs font-mono tracking-widest text-center uppercase">Select a digit above to see its place value</p>
        )}
      </div>
    </div>
  );
}
