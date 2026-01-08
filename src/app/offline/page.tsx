"use client";

import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="text-center space-y-6 max-w-md">
        {/* Icono animado */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="relative flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full">
            <WifiOff className="h-12 w-12 text-primary" />
          </div>
        </div>
        
        {/* Mensaje */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Sin conexión</h1>
          <p className="text-muted-foreground">
            Parece que no tienes conexión a internet. 
            Algunas funciones no estarán disponibles hasta que vuelvas a conectarte.
          </p>
        </div>
        
        {/* Qué puedes hacer */}
        <div className="bg-muted/50 rounded-xl p-4 text-left">
          <p className="font-medium mb-2">Mientras tanto puedes:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Ver tus datos guardados en caché</li>
            <li>• Revisar tu historial de entrenamientos</li>
            <li>• Consultar tus rutinas guardadas</li>
            <li>• Ver tareas pendientes cacheadas</li>
          </ul>
        </div>
        
        {/* Acciones */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar conexión
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Ir al inicio
            </Link>
          </Button>
        </div>
        
        {/* Estado de la app */}
        <p className="text-xs text-muted-foreground">
          Los cambios que hagas se sincronizarán cuando vuelvas a tener conexión
        </p>
      </div>
    </div>
  );
}