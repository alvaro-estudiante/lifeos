import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoutineTemplate } from "@/lib/data/routine-templates";
import { CalendarDays, List } from "lucide-react";

interface RoutineTemplateCardProps {
  template: RoutineTemplate;
  onPreview: (template: RoutineTemplate) => void;
  onUse: (template: RoutineTemplate) => void;
}

export function RoutineTemplateCard({ template, onPreview, onUse }: RoutineTemplateCardProps) {
  const levelColor = {
    beginner: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    intermediate: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
    advanced: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  };

  const levelLabel = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-xl mb-1">{template.name}</CardTitle>
            <CardDescription className="line-clamp-2">{template.description}</CardDescription>
          </div>
          <Badge variant="outline" className={levelColor[template.level]}>
            {levelLabel[template.level]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" />
            {template.days_per_week} días/sem
          </div>
          <div className="flex items-center gap-1">
            <List className="h-4 w-4" />
            {template.exercises.length} ejercicios
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {Array.from(new Set(template.exercises.map(e => e.muscle_group))).slice(0, 3).map(muscle => (
            <Badge key={muscle} variant="secondary" className="text-xs capitalize">
              {muscle.replace('_', ' ')}
            </Badge>
          ))}
          {new Set(template.exercises.map(e => e.muscle_group)).size > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{new Set(template.exercises.map(e => e.muscle_group)).size - 3} más
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => onPreview(template)}>
          Ver detalles
        </Button>
        <Button onClick={() => onUse(template)}>
          Usar plantilla
        </Button>
      </CardFooter>
    </Card>
  );
}