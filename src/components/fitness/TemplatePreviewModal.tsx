import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RoutineTemplate } from "@/lib/data/routine-templates";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TemplatePreviewModalProps {
  template: RoutineTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUse: (template: RoutineTemplate) => void;
}

export function TemplatePreviewModal({ template, open, onOpenChange, onUse }: TemplatePreviewModalProps) {
  if (!template) return null;

  // Group exercises by day
  const exercisesByDay = template.exercises.reduce((acc, ex) => {
    const day = ex.day || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(ex);
    return acc;
  }, {} as Record<number, typeof template.exercises>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <DialogTitle className="text-2xl">{template.name}</DialogTitle>
            <Badge variant="outline">{template.level}</Badge>
          </div>
          <DialogDescription>
            {template.description}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {Object.keys(exercisesByDay).map((dayStr) => {
              const day = parseInt(dayStr);
              return (
                <div key={day} className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      {day}
                    </span>
                    Día {day}
                  </h3>
                  <div className="space-y-2">
                    {exercisesByDay[day].map((exercise, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border">
                        <div>
                          <div className="font-medium">{exercise.exercise_name}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {exercise.muscle_group.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">{exercise.sets} series x {exercise.reps_min}-{exercise.reps_max} reps</div>
                          <div className="text-xs text-muted-foreground">{exercise.rest_seconds}s descanso</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {day < Object.keys(exercisesByDay).length && <Separator className="mt-4" />}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => {
            onUse(template);
            onOpenChange(false);
          }}>
            Usar esta plantilla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}