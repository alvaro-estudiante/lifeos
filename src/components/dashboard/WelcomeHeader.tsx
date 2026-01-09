"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";

interface WelcomeHeaderProps {
  userName: string;
}

export function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  const hour = new Date().getHours();
  let greeting = "Buenos días";
  let emoji = "☀️";
  
  if (hour >= 12 && hour < 20) {
    greeting = "Buenas tardes";
    emoji = "🌤️";
  }
  if (hour >= 20 || hour < 6) {
    greeting = "Buenas noches";
    emoji = "🌙";
  }

  const firstName = userName.split(" ")[0];
  const today = new Date();

  return (
    <div>
      <p className="text-sm text-muted-foreground capitalize">
        {format(today, "EEEE, d 'de' MMMM", { locale: es })}
      </p>
      <h1 className="text-xl font-bold tracking-tight mt-0.5">
        {greeting}, {firstName} {emoji}
      </h1>
    </div>
  );
}
