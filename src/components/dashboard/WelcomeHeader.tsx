import { format } from "date-fns";
import { es } from "date-fns/locale";

interface WelcomeHeaderProps {
  userName: string;
}

export function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  const hour = new Date().getHours();
  let greeting = "Buenos días";
  if (hour >= 12 && hour < 20) greeting = "Buenas tardes";
  if (hour >= 20) greeting = "Buenas noches";

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}, {userName} 👋
        </h1>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
        </p>
      </div>
    </div>
  );
}