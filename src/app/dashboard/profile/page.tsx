'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Calculator, Save, Loader2 } from 'lucide-react';

interface Profile {
  full_name: string;
  birth_date: string;
  gender: string;
  height_cm: number;
  current_weight_kg: number;
  target_weight_kg: number;
  activity_level: string;
  fitness_goal: string;
}

interface TDEE {
  bmr: number;
  tdee: number;
  deficit: number;
  surplus: number;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    birth_date: '',
    gender: 'male',
    height_cm: 170,
    current_weight_kg: 70,
    target_weight_kg: 70,
    activity_level: 'moderate',
    fitness_goal: 'maintain',
  });
  const [tdee, setTdee] = useState<TDEE | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    calculateTDEE();
  }, [profile.gender, profile.height_cm, profile.current_weight_kg, profile.birth_date, profile.activity_level]);

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setProfile(prev => ({ ...prev, ...data }));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
    setLoading(false);
  };

  const calculateTDEE = () => {
    if (!profile.birth_date || !profile.height_cm || !profile.current_weight_kg) {
      setTdee(null);
      return;
    }

    const age = new Date().getFullYear() - new Date(profile.birth_date).getFullYear();
    const weight = profile.current_weight_kg;
    const height = profile.height_cm;

    // Mifflin-St Jeor Equation
    let bmr: number;
    if (profile.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };

    const multiplier = activityMultipliers[profile.activity_level] || 1.55;
    const tdeeValue = Math.round(bmr * multiplier);

    setTdee({
      bmr: Math.round(bmr),
      tdee: tdeeValue,
      deficit: Math.round(tdeeValue - 500),
      surplus: Math.round(tdeeValue + 300),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        toast({
          title: 'Perfil guardado',
          description: 'Tus datos se han actualizado correctamente.',
        });
      } else {
        throw new Error('Error saving profile');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el perfil.',
        variant: 'destructive',
      });
    }
    setSaving(false);
  };

  const applyTDEEToGoals = async (calories: number) => {
    try {
      const protein = Math.round(profile.current_weight_kg * 2); // 2g per kg
      const fat = Math.round((calories * 0.25) / 9); // 25% from fat
      const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

      const response = await fetch('/api/nutrition/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calories_target: calories,
          protein_g: protein,
          carbs_g: carbs,
          fat_g: fat,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Objetivos actualizados',
          description: `Calorías: ${calories} kcal, Proteína: ${protein}g, Carbos: ${carbs}g, Grasa: ${fat}g`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron actualizar los objetivos.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentario (poco o nada de ejercicio)' },
    { value: 'light', label: 'Ligero (1-3 días/semana)' },
    { value: 'moderate', label: 'Moderado (3-5 días/semana)' },
    { value: 'active', label: 'Activo (6-7 días/semana)' },
    { value: 'very_active', label: 'Muy activo (2x al día)' },
  ];

  const fitnessGoals = [
    { value: 'lose_fat', label: 'Perder grasa' },
    { value: 'maintain', label: 'Mantener peso' },
    { value: 'build_muscle', label: 'Ganar músculo' },
    { value: 'recomposition', label: 'Recomposición corporal' },
    { value: 'health', label: 'Mejorar salud general' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">Gestiona tu información personal y objetivos</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar cambios
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Datos personales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Datos Personales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre completo</Label>
              <Input
                value={profile.full_name}
                onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                placeholder="Tu nombre"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de nacimiento</Label>
                <Input
                  type="date"
                  value={profile.birth_date}
                  onChange={e => setProfile(p => ({ ...p, birth_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Género</Label>
                <Select
                  value={profile.gender}
                  onValueChange={v => setProfile(p => ({ ...p, gender: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Femenino</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Altura (cm)</Label>
                <Input
                  type="number"
                  value={profile.height_cm}
                  onChange={e => setProfile(p => ({ ...p, height_cm: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Peso actual (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={profile.current_weight_kg}
                  onChange={e => setProfile(p => ({ ...p, current_weight_kg: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Peso objetivo (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={profile.target_weight_kg}
                  onChange={e => setProfile(p => ({ ...p, target_weight_kg: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nivel de actividad</Label>
              <Select
                value={profile.activity_level}
                onValueChange={v => setProfile(p => ({ ...p, activity_level: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activityLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Objetivo fitness</Label>
              <Select
                value={profile.fitness_goal}
                onValueChange={v => setProfile(p => ({ ...p, fitness_goal: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fitnessGoals.map(goal => (
                    <SelectItem key={goal.value} value={goal.value}>
                      {goal.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Calculadora TDEE */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculadora TDEE
            </CardTitle>
            <CardDescription>
              Gasto energético diario total estimado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tdee ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted text-center">
                    <p className="text-sm text-muted-foreground">Metabolismo Basal</p>
                    <p className="text-2xl font-bold">{tdee.bmr}</p>
                    <p className="text-xs text-muted-foreground">kcal/día</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10 text-center">
                    <p className="text-sm text-muted-foreground">TDEE</p>
                    <p className="text-2xl font-bold text-primary">{tdee.tdee}</p>
                    <p className="text-xs text-muted-foreground">kcal/día</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Aplicar a mis objetivos:</p>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => applyTDEEToGoals(tdee.deficit)}
                  >
                    <span>🔥 Déficit (perder grasa)</span>
                    <span className="font-bold">{tdee.deficit} kcal</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => applyTDEEToGoals(tdee.tdee)}
                  >
                    <span>⚖️ Mantenimiento</span>
                    <span className="font-bold">{tdee.tdee} kcal</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => applyTDEEToGoals(tdee.surplus)}
                  >
                    <span>💪 Superávit (ganar músculo)</span>
                    <span className="font-bold">{tdee.surplus} kcal</span>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  * Al aplicar se calcularán automáticamente los macros recomendados
                  (2g proteína/kg, 25% grasas, resto carbohidratos)
                </p>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Completa tu fecha de nacimiento, altura y peso para calcular tu TDEE
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
