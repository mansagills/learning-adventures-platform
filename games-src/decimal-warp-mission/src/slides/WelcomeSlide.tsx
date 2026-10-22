import { useState, useEffect } from 'react';
import { Rocket, Star, Zap } from 'lucide-react';

export default function WelcomeSlide() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 300),
      setTimeout(() => setStep(2), 900),
      setTimeout(() => setStep(3), 1500),
      setTimeout(() => setStep(4), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-8 py-6 text-center gap-6">
      <div
        className="transition-all duration-700"
        style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? 'translateY(0)' : 'translateY(-20px)' }}
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <Rocket size={32} className="text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px #00ffff)' }} />
          <h1 className="text-4xl font-bold text-white tracking-wider uppercase" style={{ textShadow: '0 0 20px rgba(0,255,255,0.6)' }}>
            Decimal Academy
          </h1>
          <Rocket size={32} className="text-cyan-400 scale-x-[-1]" style={{ filter: 'drop-shadow(0 0 8px #00ffff)' }} />
        </div>
        <p className="text-cyan-500 text-sm tracking-[0.3em] uppercase font-mono">Space Explorer Training Program</p>
      </div>

      <div
        className="max-w-lg transition-all duration-700"
        style={{ opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? 'translateY(0)' : 'translateY(20px)' }}
      >
        <div className="border border-cyan-900/60 rounded-lg p-5 bg-cyan-950/20 backdrop-blur-sm">
          <p className="text-cyan-200 text-base leading-relaxed font-mono">
            Welcome, <span className="text-cyan-300 font-bold">Space Cadet!</span> Your mission is to master
            the art of <span className="text-yellow-300 font-bold">decimal numbers</span> before your ship
            can navigate the cosmos.
          </p>
        </div>
      </div>

      <div
        className="grid grid-cols-3 gap-4 max-w-xl transition-all duration-700"
        style={{ opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? 'translateY(0)' : 'translateY(20px)' }}
      >
        {[
          { icon: <Star size={20} />, label: 'Decimal Places', desc: 'Tenths & hundredths', color: '#00ffff' },
          { icon: <Zap size={20} />, label: 'Adding', desc: 'Combine decimals', color: '#00ff88' },
          { icon: <Rocket size={20} />, label: 'Subtracting', desc: 'Decimal differences', color: '#ff9944' },
        ].map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border transition-all duration-300 hover:scale-105"
            style={{ borderColor: item.color + '44', background: item.color + '10' }}
          >
            <div style={{ color: item.color, filter: `drop-shadow(0 0 6px ${item.color})` }}>{item.icon}</div>
            <span className="text-white text-xs font-bold tracking-wide uppercase">{item.label}</span>
            <span className="text-gray-400 text-[10px]">{item.desc}</span>
          </div>
        ))}
      </div>

      <div
        className="transition-all duration-700"
        style={{ opacity: step >= 4 ? 1 : 0, transform: step >= 4 ? 'translateY(0)' : 'translateY(10px)' }}
      >
        <p className="text-cyan-500 text-xs font-mono tracking-widest animate-pulse uppercase">
          &gt;&gt; Press NEXT to begin your mission &lt;&lt;
        </p>
      </div>
    </div>
  );
}
