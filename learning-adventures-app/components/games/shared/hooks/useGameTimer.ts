import { useState, useEffect, useCallback, useRef } from 'react';

interface UseGameTimerOptions {
  initialTime?: number;
  countDown?: boolean;
  onTimeUp?: () => void;
  onTick?: (timeRemaining: number) => void;
  autoStart?: boolean;
}

export function useGameTimer(options: UseGameTimerOptions = {}) {
  const {
    initialTime = 0,
    countDown = false,
    onTimeUp,
    onTick,
    autoStart = false,
  } = options;

  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsFinished(false);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setTime(initialTime);
    setIsRunning(false);
    setIsFinished(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [initialTime]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsFinished(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const addTime = useCallback((seconds: number) => {
    setTime(prev => Math.max(0, prev + seconds));
  }, []);

  useEffect(() => {
    if (!isRunning || isFinished) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTime(prevTime => {
        const newTime = countDown ? prevTime - 1 : prevTime + 1;

        if (onTick) {
          onTick(newTime);
        }

        if (countDown && newTime <= 0) {
          setIsRunning(false);
          setIsFinished(true);
          if (onTimeUp) {
            onTimeUp();
          }
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isFinished, countDown, onTimeUp, onTick]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    const sign = seconds < 0 ? '-' : '';
    return `${sign}${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    time,
    isRunning,
    isFinished,
    formattedTime: formatTime(time),
    actions: {
      start,
      pause,
      reset,
      stop,
      addTime,
    },
  };
}