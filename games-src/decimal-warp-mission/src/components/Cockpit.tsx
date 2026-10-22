import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Zap, Shield, Radio, Target, Wifi, Battery } from 'lucide-react';

interface Props {
  children: ReactNode;
  currentSlide: number;
  totalSlides: number;
  onNavigate: (dir: 'next' | 'prev') => void;
  slideVisible: boolean;
  slideTitle: string;
}

function GaugeBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-mono tracking-wider" style={{ color }}>{label}</span>
      <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden w-full border border-gray-700">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${value}%`, backgroundColor: color, boxShadow: `0 0 4px ${color}` }}
        />
      </div>
    </div>
  );
}

function BlinkDot({ color, delay = 0 }: { color: string; delay?: number }) {
  return (
    <div
      className="w-2 h-2 rounded-full animate-pulse"
      style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}`, animationDelay: `${delay}s` }}
    />
  );
}

function HexDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[8px] font-mono text-cyan-600 tracking-widest uppercase">{label}</span>
      <span className="text-[11px] font-mono text-cyan-300" style={{ textShadow: '0 0 8px #00ffff' }}>{value}</span>
    </div>
  );
}

export default function Cockpit({ children, currentSlide, totalSlides, onNavigate, slideVisible, slideTitle }: Props) {
  const canGoNext = currentSlide < totalSlides - 1;
  const canGoPrev = currentSlide > 0;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ fontFamily: 'monospace' }}>

      {/* TOP HUD BAR */}
      <div className="relative flex-shrink-0 h-16 bg-gradient-to-b from-gray-950 to-gray-900 border-b border-cyan-900/60 flex items-center px-4 gap-4 z-20">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(90deg, rgba(0,255,255,0.03) 0%, transparent 50%, rgba(0,255,255,0.03) 100%)' }} />

        {/* Left HUD cluster */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 border border-cyan-900 rounded bg-cyan-950/30">
            <Shield size={12} className="text-cyan-400" />
            <span className="text-[10px] text-cyan-300 tracking-widest">SHIELDS</span>
            <span className="text-[10px] text-green-400 font-bold">100%</span>
          </div>
          <div className="flex gap-1">
            <BlinkDot color="#00ff88" delay={0} />
            <BlinkDot color="#00ff88" delay={0.3} />
            <BlinkDot color="#ffaa00" delay={0.6} />
            <BlinkDot color="#00ff88" delay={0.9} />
          </div>
        </div>

        {/* Center title */}
        <div className="flex-1 flex flex-col items-center">
          <div className="text-[9px] text-cyan-600 tracking-[0.3em] uppercase mb-0.5">DECIMAL ACADEMY — MISSION CONTROL</div>
          <div className="text-sm text-cyan-200 tracking-widest uppercase font-bold" style={{ textShadow: '0 0 12px #00ffff' }}>
            {slideTitle}
          </div>
        </div>

        {/* Right HUD cluster */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <BlinkDot color="#00ffff" delay={0.2} />
            <BlinkDot color="#00ffff" delay={0.5} />
            <BlinkDot color="#ff4444" delay={0.8} />
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 border border-cyan-900 rounded bg-cyan-950/30">
            <Target size={12} className="text-cyan-400" />
            <span className="text-[10px] text-cyan-300 tracking-widest">ZONE</span>
            <span className="text-[10px] text-cyan-200 font-bold">{currentSlide + 1}/{totalSlides}</span>
          </div>
        </div>
      </div>

      {/* MAIN AREA: left panel + viewport + right panel */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT COCKPIT PANEL */}
        <div className="relative flex-shrink-0 w-28 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border-r border-cyan-900/50 flex flex-col items-center py-3 gap-3 z-20">
          <div className="absolute inset-0 pointer-events-none scanline-v" />

          <div className="w-full px-2 flex flex-col gap-2">
            <GaugeBar value={88} label="POWER" color="#00ffff" />
            <GaugeBar value={73} label="THRUST" color="#00ff88" />
            <GaugeBar value={95} label="SHIELDS" color="#4488ff" />
            <GaugeBar value={61} label="FUEL" color="#ffaa00" />
          </div>

          <div className="w-full h-px bg-cyan-900/50 mx-2" />

          {/* Mini radar */}
          <div className="relative w-16 h-16 rounded-full border border-cyan-800 bg-cyan-950/20 overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-px h-full bg-cyan-900/40" />
              <div className="absolute w-full h-px bg-cyan-900/40" />
            </div>
            <div className="absolute w-8 h-8 rounded-full border border-cyan-900/50" />
            <div
              className="absolute w-full h-1/2 origin-bottom"
              style={{ animation: 'radarSpin 3s linear infinite', transformOrigin: '50% 100%' }}
            >
              <div className="w-full h-full bg-gradient-to-t from-cyan-500/40 to-transparent" />
            </div>
            <div className="w-1 h-1 rounded-full bg-cyan-400 z-10" style={{ boxShadow: '0 0 4px #00ffff' }} />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-green-400 top-4 left-6" style={{ boxShadow: '0 0 4px #00ff88' }} />
            <div className="absolute w-1 h-1 rounded-full bg-yellow-400 bottom-3 right-4" style={{ boxShadow: '0 0 4px #ffff00' }} />
          </div>
          <span className="text-[8px] text-cyan-600 tracking-widest">RADAR</span>

          <div className="w-full h-px bg-cyan-900/50" />

          <div className="flex flex-col gap-2 items-center w-full px-2">
            <div className="flex items-center gap-1.5 w-full">
              <Zap size={10} className="text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <GaugeBar value={82} label="ENGINES" color="#ffff44" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 w-full">
              <Radio size={10} className="text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <GaugeBar value={100} label="COMMS" color="#00ff88" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 w-full">
              <Wifi size={10} className="text-cyan-400 flex-shrink-0" />
              <div className="flex-1">
                <GaugeBar value={94} label="SIGNAL" color="#00ffff" />
              </div>
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-1 items-center">
            <div className="flex gap-1">
              <BlinkDot color="#00ff88" delay={0} />
              <BlinkDot color="#ffaa00" delay={0.4} />
              <BlinkDot color="#00ffff" delay={0.8} />
            </div>
            <span className="text-[7px] text-cyan-700 tracking-widest">SYS OK</span>
          </div>
        </div>

        {/* VIEWPORT */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute inset-0 border-2 border-cyan-900/30" />
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/60" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/60" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/60" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/60" />
            <div className="scanlines absolute inset-0 pointer-events-none opacity-10" />
          </div>

          <div
            className="relative z-10 w-full h-full flex items-center justify-center transition-all duration-700"
            style={{ opacity: slideVisible ? 1 : 0, transform: slideVisible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(8px)' }}
          >
            {children}
          </div>
        </div>

        {/* RIGHT COCKPIT PANEL */}
        <div className="relative flex-shrink-0 w-28 bg-gradient-to-l from-gray-950 via-gray-900 to-gray-950 border-l border-cyan-900/50 flex flex-col items-center py-3 gap-3 z-20">
          <div className="absolute inset-0 pointer-events-none scanline-v" />

          <div className="flex flex-col gap-1 w-full px-2 items-center">
            <span className="text-[8px] text-cyan-600 tracking-widest uppercase">Nav Status</span>
            <HexDisplay label="Speed" value="0.8c" />
            <HexDisplay label="Dist" value="4.2ly" />
            <HexDisplay label="Alt" value="∞" />
          </div>

          <div className="w-full h-px bg-cyan-900/50" />

          {/* Circular gauge */}
          <div className="relative w-16 h-16">
            <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#0a2a2a" strokeWidth="6" />
              <circle
                cx="32" cy="32" r="26" fill="none"
                stroke="#00ffff" strokeWidth="6"
                strokeDasharray={`${0.75 * 163.4} ${163.4}`}
                style={{ filter: 'drop-shadow(0 0 3px #00ffff)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[10px] text-cyan-300 font-bold">75%</span>
              <span className="text-[7px] text-cyan-600">CORE</span>
            </div>
          </div>

          <div className="w-full h-px bg-cyan-900/50" />

          <div className="w-full px-2 flex flex-col gap-2">
            <GaugeBar value={92} label="HULL" color="#00ff88" />
            <GaugeBar value={55} label="AMMO" color="#ff6644" />
            <GaugeBar value={78} label="NAV" color="#00ffff" />
            <GaugeBar value={88} label="BOOST" color="#ff44ff" />
          </div>

          <div className="w-full h-px bg-cyan-900/50" />

          <div className="flex flex-col gap-1 items-center">
            <div className="flex items-center gap-1">
              <Battery size={10} className="text-green-400" />
              <span className="text-[9px] text-green-300 font-bold">88%</span>
            </div>
            <span className="text-[7px] text-cyan-700 tracking-widest">POWER CELL</span>
          </div>

          <div className="mt-auto flex flex-col gap-1 items-center">
            <div className="flex gap-1">
              <BlinkDot color="#ff4444" delay={0.2} />
              <BlinkDot color="#00ff88" delay={0.6} />
              <BlinkDot color="#00ffff" delay={1.0} />
            </div>
            <span className="text-[7px] text-cyan-700 tracking-widest">ONLINE</span>
          </div>
        </div>
      </div>

      {/* BOTTOM CONSOLE */}
      <div className="relative flex-shrink-0 h-20 bg-gradient-to-t from-gray-950 to-gray-900 border-t border-cyan-900/60 flex items-center px-6 gap-4 z-20">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(0,255,255,0.02) 0%, rgba(0,255,255,0.06) 100%)' }} />

        {/* Left console elements */}
        <div className="flex gap-2 items-center">
          <div className="flex flex-col gap-1">
            <GaugeBar value={74} label="THRUSTER L" color="#00ffff" />
            <GaugeBar value={71} label="THRUSTER R" color="#00ffff" />
          </div>
          <div className="w-8 h-8 rounded border border-cyan-800 bg-cyan-950/20 flex items-center justify-center cursor-pointer hover:bg-cyan-900/30 transition-colors">
            <Zap size={14} className="text-yellow-400" />
          </div>
        </div>

        <div className="flex-1" />

        {/* NAV BUTTONS - CENTER */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('prev')}
            disabled={!canGoPrev}
            className="group relative flex items-center gap-2 px-5 py-3 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: canGoPrev ? 'linear-gradient(135deg, #0a2a3a, #0d3d55)' : '#0a1a22',
              border: `1px solid ${canGoPrev ? '#00aaff' : '#1a3344'}`,
              borderRadius: '4px',
              boxShadow: canGoPrev ? '0 0 12px rgba(0,170,255,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
            }}
          >
            <ChevronLeft size={18} className="text-cyan-300 group-hover:text-white transition-colors" />
            <div className="flex flex-col items-start">
              <span className="text-[8px] text-cyan-600 tracking-widest uppercase">Vector</span>
              <span className="text-[11px] text-cyan-200 font-bold tracking-wide">PREV</span>
            </div>
            {canGoPrev && <div className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t border-l border-cyan-400" />}
            {canGoPrev && <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 border-b border-r border-cyan-400" />}
          </button>

          {/* Slide indicators */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex gap-1.5 items-center">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <div
                  key={i}
                  className="transition-all duration-500"
                  style={{
                    width: i === currentSlide ? '20px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    background: i === currentSlide ? '#00ffff' : i < currentSlide ? '#00ff88' : '#1a3344',
                    boxShadow: i === currentSlide ? '0 0 8px #00ffff' : i < currentSlide ? '0 0 4px #00ff88' : 'none',
                  }}
                />
              ))}
            </div>
            <span className="text-[8px] text-cyan-600 font-mono tracking-widest">
              SECTOR {currentSlide + 1} OF {totalSlides}
            </span>
          </div>

          <button
            onClick={() => onNavigate('next')}
            disabled={!canGoNext}
            className="group relative flex items-center gap-2 px-5 py-3 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: canGoNext ? 'linear-gradient(135deg, #0a2a3a, #0d3d55)' : '#0a1a22',
              border: `1px solid ${canGoNext ? '#00aaff' : '#1a3344'}`,
              borderRadius: '4px',
              boxShadow: canGoNext ? '0 0 12px rgba(0,170,255,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
            }}
          >
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-cyan-600 tracking-widest uppercase">Vector</span>
              <span className="text-[11px] text-cyan-200 font-bold tracking-wide">NEXT</span>
            </div>
            <ChevronRight size={18} className="text-cyan-300 group-hover:text-white transition-colors" />
            {canGoNext && <div className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t border-r border-cyan-400" />}
            {canGoNext && <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 border-b border-l border-cyan-400" />}
          </button>
        </div>

        <div className="flex-1" />

        {/* Right console elements */}
        <div className="flex gap-2 items-center">
          <div className="w-8 h-8 rounded border border-red-800 bg-red-950/20 flex items-center justify-center">
            <Target size={14} className="text-red-400" />
          </div>
          <div className="flex flex-col gap-1">
            <GaugeBar value={60} label="WARP L" color="#ff44ff" />
            <GaugeBar value={65} label="WARP R" color="#ff44ff" />
          </div>
        </div>
      </div>
    </div>
  );
}
