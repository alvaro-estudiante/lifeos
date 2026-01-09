'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Calculator, Save, Loader2, ChevronRight } from 'lucide-react';

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
          title: '✅ Perfil guardado',
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
      const protein = Math.round(profile.current_weight_kg * 2);
      const fat = Math.round((calories * 0.25) / 9);
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
          title: '✅ Objetivos actualizados',
          description: `${calories} kcal | P: ${protein}g | C: ${carbs}g | G: ${fat}g`,
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentario' },
    { value: 'light', label: 'Ligero (1-3 días/sem)' },
    { value: 'moderate', label: 'Moderado (3-5 días/sem)' },
    { value: 'active', label: 'Activo (6-7 días/sem)' },
    { value: 'very_active', label: 'Muy activo (2x día)' },
  ];

  const fitnessGoals = [
    { value: 'lose_fat', label: 'Perder grasa' },
    { value: 'maintain', label: 'Mantener peso' },
    { value: 'build_muscle', label: 'Ganar músculo' },
    { value: 'recomposition', label: 'Recomposición' },
    { value: 'health', label: 'Salud general' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Mi Perfil</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Información personal y objetivos</p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span className="hidden sm:inline">Guardar</span>
        </Button>
      </div>

      {/* TDEE Card - First on mobile for quick access */}
      <Card className="lg:hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            Tu TDEE
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tdee ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-muted text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">Basal</p>
                  <p className="text-lg font-bold">{tdee.bmr}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">TDEE</p>
                  <p className="text-lg font-bold text-primary">{tdee.tdee}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => applyTDEEToGoals(tdee.deficit)}
                  className="p-2 rounded-xl bg-red-500/10 text-center hover:bg-red-500/20 transition-colors"
                >
                  <p className="text-[10px] text-red-600">Déficit</p>
                  <p className="text-sm font-bold text-red-600">{tdee.deficit}</p>
                </button>
                <button
                  onClick={() => applyTDEEToGoals(tdee.tdee)}
                  className="p-2 rounded-xl bg-amber-500/10 text-center hover:bg-amber-500/20 transition-colors"
                >
                  <p className="text-[10px] text-amber-600">Mantener</p>
                  <p className="text-sm font-bold text-amber-600">{tdee.tdee}</p>
                </button>
                <button
                  onClick={() => applyTDEEToGoals(tdee.surplus)}
                  className="p-2 rounded-xl bg-green-500/10 text-center hover:bg-green-500/20 transition-colors"
                >
                  <p className="text-[10px] text-green-600">Superávit</p>
                  <p className="text-sm font-bold text-green-600">{tdee.surplus}</p>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              Completa tus datos para calcular
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Datos personales */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Datos Personales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Nombre completo</Label>
              <Input
                value={profile.full_name}
                onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                placeholder="Tu nombre"
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Fecha de nacimiento</Label>
                <Input
                  type="date"
                  value={profile.birth_date}
                  onChange={e => setProfile(p => ({ ...p, birth_date: e.target.value }))}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Género</Label>
                <Select
                  value={profile.gender}
                  onValueChange={v => setProfile(p => ({ ...p, gender: v }))}
                >
                  <SelectTrigger className="h-10">
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

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <Label className="text-xs">Altura (cm)</Label>
                <Input
                  type="number"
                  value={profile.height_cm}
                  onChange={e => setProfile(p => ({ ...p, height_cm: parseFloat(e.target.value) || 0 }))}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Peso (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={profile.current_weight_kg}
                  onChange={e => setProfile(p => ({ ...p, current_weight_kg: parseFloat(e.target.value) || 0 }))}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Objetivo (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={profile.target_weight_kg}
                  onChange={e => setProfile(p => ({ ...p, target_weight_kg: parseFloat(e.target.value) || 0 }))}
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Nivel de actividad</Label>
              <Select
                value={profile.activity_level}
                onValueChange={v => setProfile(p => ({ ...p, activity_level: v }))}
              >
                <SelectTrigger className="h-10">
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
              <Label className="text-xs">Objetivo fitness</Label>
              <Select
                value={profile.fitness_goal}
                onValueChange={v => setProfile(p => ({ ...p, fitness_goal: v }))}
              >
                <SelectTrigger className="h-10">
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

        {/* Desktop TDEE Calculator */}
        <Card className="hidden lg:block">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
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
                  <div className="p-4 rounded-xl bg-muted text-center">
                    <p className="text-sm text-muted-foreground">Metabolismo Basal</p>
                    <p className="text-2xl font-bold">{tdee.bmr}</p>
                    <p className="text-xs text-muted-foreground">kcal/día</p>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/10 text-center">
                    <p className="text-sm text-muted-foreground">TDEE</p>
                    <p className="text-2xl font-bold text-primary">{tdee.tdee}</p>
                    <p className="text-xs text-muted-foreground">kcal/día</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Aplicar a mis objetivos:</p>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                    onClick={() => applyTDEEToGoals(tdee.deficit)}
                  >
                    <span>🔥 Déficit (perder grasa)</span>
                    <span className="font-bold">{tdee.deficit} kcal</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                    onClick={() => applyTDEEToGoals(tdee.tdee)}
                  >
                    <span>⚖️ Mantenimiento</span>
                    <span className="font-bold">{tdee.tdee} kcal</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                    onClick={() => applyTDEEToGoals(tdee.surplus)}
                  >
                    <span>💪 Superávit (ganar músculo)</span>
                    <span className="font-bold">{tdee.surplus} kcal</span>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  * Se calcularán automáticamente los macros (2g proteína/kg, 25% grasas)
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
