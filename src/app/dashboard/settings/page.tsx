'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Target, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { logout } from '@/app/auth/actions';

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-muted-foreground">Configura tu cuenta y preferencias</p>
      </div>

      {/* Tema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Apariencia
          </CardTitle>
          <CardDescription>Personaliza el aspecto de la aplicación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Tema</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Oscuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil
          </CardTitle>
          <CardDescription>Tu información personal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input placeholder="Tu nombre" disabled />
            </div>
            <div className="space-y-2">
              <Label>Altura (cm)</Label>
              <Input type="number" placeholder="175" disabled />
            </div>
            <div className="space-y-2">
              <Label>Peso actual (kg)</Label>
              <Input type="number" placeholder="70" disabled />
            </div>
            <div className="space-y-2">
              <Label>Peso objetivo (kg)</Label>
              <Input type="number" placeholder="68" disabled />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            La edición de perfil estará disponible próximamente.
          </p>
        </CardContent>
      </Card>

      {/* Objetivos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Objetivos Nutricionales
          </CardTitle>
          <CardDescription>Configura tus metas diarias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Calorías</Label>
              <Input type="number" placeholder="2000" disabled />
            </div>
            <div className="space-y-2">
              <Label>Proteína (g)</Label>
              <Input type="number" placeholder="150" disabled />
            </div>
            <div className="space-y-2">
              <Label>Carbohidratos (g)</Label>
              <Input type="number" placeholder="200" disabled />
            </div>
            <div className="space-y-2">
              <Label>Grasas (g)</Label>
              <Input type="number" placeholder="65" disabled />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Puedes modificar tus objetivos en Nutrición → Objetivos.
          </p>
        </CardContent>
      </Card>

      {/* Cerrar sesión */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <LogOut className="h-5 w-5" />
            Sesión
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
