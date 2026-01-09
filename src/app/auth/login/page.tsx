"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { login } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await login(formData);
    setLoading(false);

    if (result?.error) {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: result.error,
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/50 px-6 py-12">
      {/* Logo & Brand */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Life OS</h1>
        <p className="text-sm text-muted-foreground mt-1">Tu sistema operativo personal</p>
      </div>

      {/* Form Card */}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </Label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
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
                Iniciando...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿No tienes cuenta?{" "}
          <Link 
            href="/auth/register" 
            className="text-primary font-medium hover:underline"
          >
            Crear cuenta
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
