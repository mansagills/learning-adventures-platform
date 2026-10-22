import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  pz: number;
}

interface Props {
  isWarping: boolean;
}

export default function StarField({ isWarping }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animRef = useRef<number>(0);
  const warpRef = useRef(isWarping);

  useEffect(() => {
    warpRef.current = isWarping;
  }, [isWarping]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const W = canvas.width;
    const H = canvas.height;

    starsRef.current = Array.from({ length: 400 }, () => ({
      x: Math.random() * W - W / 2,
      y: Math.random() * H - H / 2,
      z: Math.random() * W,
      pz: 0,
    }));

    const animate = () => {
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(0, 0, cw, ch);

      const speed = warpRef.current ? 90 : 3;

      for (const star of starsRef.current) {
        star.pz = star.z;
        star.z -= speed;

        if (star.z <= 0) {
          star.x = Math.random() * cw - cw / 2;
          star.y = Math.random() * ch - ch / 2;
          star.z = cw;
          star.pz = cw;
        }

        const sx = (star.x / star.z) * cw + cw / 2;
        const sy = (star.y / star.z) * ch + ch / 2;
        const px = (star.x / star.pz) * cw + cw / 2;
        const py = (star.y / star.pz) * ch + ch / 2;

        const size = Math.max(0.4, (1 - star.z / cw) * 3);
        const b = Math.floor((1 - star.z / cw) * 255);
        const blue = Math.min(255, b + 80);

        ctx.strokeStyle = warpRef.current
          ? `rgba(100, 200, 255, ${(1 - star.z / cw) * 0.9})`
          : `rgb(${b},${b},${blue})`;
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: '#000008' }}
    />
  );
}
