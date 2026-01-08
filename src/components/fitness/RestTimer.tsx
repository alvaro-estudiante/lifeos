'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RestTimerProps {
  defaultSeconds: number; // Del ejercicio o config global
  onComplete?: () => void;
  autoStart?: boolean;
}

export function RestTimer({ defaultSeconds, onComplete, autoStart }: RestTimerProps) {
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isVisible, setIsVisible] = useState(autoStart);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else if (seconds === 0 && isRunning) {
      // Timer completado
      setIsRunning(false);
      onComplete?.();
      // Vibrar si está disponible
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, seconds, onComplete]);

  // Si no está visible y no corre, mostrar botón para abrir
  if (!isVisible) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => {
          setIsVisible(true);
          setSeconds(defaultSeconds);
          setIsRunning(true);
        }}
        className="fixed top-20 right-4 z-50 rounded-full shadow-lg"
      >
        <Timer className="h-4 w-4 mr-2" />
        Descanso
      </Button>
    );
  }

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = ((defaultSeconds - seconds) / defaultSeconds) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 500 }}
        className="fixed top-24 right-4 z-50 bg-background border rounded-2xl shadow-xl w-64 p-4"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm font-medium flex items-center text-muted-foreground">
            <Timer className="h-4 w-4 mr-2" />
            Descanso
          </div>
          <button onClick={() => setIsVisible(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative h-32 w-32 mx-auto mb-4 flex items-center justify-center">
          {/* Background circle */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-muted/20"
            />
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 60}
              strokeDashoffset={2 * Math.PI * 60 * (1 - progress / 100)}
              className="text-primary transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="text-3xl font-bold font-mono">
            {formatTime(seconds)}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setSeconds(defaultSeconds);
              setIsRunning(false);
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSeconds(s => s + 30)}
          >
            +30s
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}