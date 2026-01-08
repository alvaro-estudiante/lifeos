'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "@/lib/actions/user";
import { updateNutritionGoals } from "@/lib/actions/nutrition-goals";
import { createHabit } from "@/lib/actions/habits";
import { useToast } from "@/hooks/use-toast";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    goal: "health",
    calories: 2000,
    habitName: "Beber agua",
  });

  const handleNext = async () => {
    if (step === 4) {
      setLoading(true);
      try {
        // Save everything
        await updateUserProfile({
          full_name: formData.fullName,
          fitness_goal: formData.goal as 'lose_fat' | 'maintain' | 'build_muscle' | 'recomposition' | 'health',
        });

        await updateNutritionGoals({
          calories_target: formData.calories,
          protein_g: 150, // Default values
          carbs_g: 200,
          fat_g: 60,
          fiber_g: 30,
          water_ml: 2000,
        });

        if (formData.habitName) {
          await createHabit({
            name: formData.habitName,
            description: "Hábito creado durante el setup",
            frequency: "daily",
            target_value: 1,
            unit: "vez",
            color: "#3B82F6",
            icon: "✨",
            is_active: true,
            frequency_config: null
          });
        }

        toast({ title: "¡Todo listo!", description: "Bienvenido a LifeOS" });
        router.push("/");
      } catch {
        toast({ variant: "destructive", title: "Error al guardar" });
      } finally {
        setLoading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configuración Inicial ({step}/4)</CardTitle>
          <CardDescription>
            {step === 1 && "Cuéntanos un poco sobre ti"}
            {step === 2 && "Objetivos de nutrición"}
            {step === 3 && "Tu primer hábito"}
            {step === 4 && "¿Listo para empezar?"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Nombre completo</Label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Tu nombre"
                />
              </div>
              <div className="space-y-2">
                <Label>Objetivo principal</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                >
                  <option value="health">Salud general</option>
                  <option value="lose_fat">Perder grasa</option>
                  <option value="build_muscle">Ganar músculo</option>
                  <option value="productivity">Productividad</option>
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label>Calorías diarias objetivo</Label>
              <Input
                type="number"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                No te preocupes, podrás ajustar esto más tarde en detalle.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <Label>¿Qué hábito quieres empezar?</Label>
              <Input
                value={formData.habitName}
                onChange={(e) => setFormData({ ...formData, habitName: e.target.value })}
                placeholder="Ej. Leer 10 min, Meditar..."
              />
              <div className="flex gap-2 flex-wrap mt-2">
                {["Beber agua", "Leer", "Meditar", "Caminar"].map((habit) => (
                  <button
                    key={habit}
                    onClick={() => setFormData({ ...formData, habitName: habit })}
                    className="text-xs bg-muted px-2 py-1 rounded-full hover:bg-muted/80"
                  >
                    {habit}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-4">
              <p className="mb-4">Has configurado lo básico. LifeOS te ayudará a organizar tu día a día.</p>
              <p className="text-sm text-muted-foreground">
                Recuerda que puedes usar el botón de voz 🎤 en cualquier momento para registrar tus actividades.
              </p>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Atrás
              </Button>
            )}
            <Button className="ml-auto" onClick={handleNext} disabled={loading}>
              {loading ? "Guardando..." : step === 4 ? "Finalizar" : "Siguiente"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}