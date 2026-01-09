"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { signup } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Sparkles, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await signup(formData);
    setLoading(false);

    if (result?.error) {
      toast({
        variant: "destructive",
        title: "Error al registrarse",
        description: result.error,
      });
    } else if (result?.success) {
      setSuccess(true);
      toast({
        title: "Registro exitoso",
        description: "Por favor revisa tu email para confirmar tu cuenta.",
      });
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/50 px-6 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-500/10 mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">¡Registro exitoso!</h1>
          <p className="text-muted-foreground mb-6">
            Hemos enviado un enlace de confirmación a tu correo electrónico. 
            Revisa tu bandeja de entrada.
          </p>
          <Button asChild className="w-full h-12 rounded-xl">
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/50 px-6 py-12">
      {/* Logo & Brand */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Crear cuenta</h1>
        <p className="text-sm text-muted-foreground mt-1">Comienza a organizar tu vida</p>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm">
        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                required
                className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Contraseña
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repite la contraseña"
                required
                className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <Button 
            className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25" 
            type="submit" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              "Crear cuenta"
            )}
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link 
            href="/auth/login" 
            className="text-primary font-medium hover:underline"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground/60 mt-12">
        by Álvaro Fernández
      </p>
    </div>
  );
}
