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
  if (hour >= 20) {
    greeting = "Buenas noches";
    emoji = "🌙";
  }

  const firstName = userName.split(" ")[0];

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
        {greeting}, {firstName} {emoji}
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground capitalize">
        {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
      </p>
    </div>
  );
}
