interface Props {
  isActive: boolean;
}

export default function WarpTransition({ isActive }: Props) {
  if (!isActive) return null;

  return (
    <div className="warp-overlay absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
      <div className="warp-flash" />
      <div className="warp-rings">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="warp-ring" style={{ animationDelay: `${i * 0.07}s` }} />
        ))}
      </div>
      <div className="warp-text font-mono text-cyan-300 text-lg tracking-widest uppercase opacity-80">
        HYPERSPACE JUMP...
      </div>
    </div>
  );
}
