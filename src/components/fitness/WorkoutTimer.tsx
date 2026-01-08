"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface WorkoutTimerProps {
  startTime: string;
  workoutDate: string;
}

export function WorkoutTimer({ startTime, workoutDate }: WorkoutTimerProps) {
  const [duration, setDuration] = useState("00:00:00");

  useEffect(() => {
    // Combine date and time to create a valid Date object
    const startDateTime = new Date(`${workoutDate.split('T')[0]}T${startTime}`);
    
    if (isNaN(startDateTime.getTime())) {
      setDuration("00:00:00");
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = now - startDateTime.getTime();

      if (diff < 0) {
         setDuration("00:00:00");
         return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setDuration(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime, workoutDate]);

  return (
    <div className="flex items-center gap-2 font-mono text-xl">
      <Clock className="h-5 w-5 text-muted-foreground" />
      {duration}
    </div>
  );
}