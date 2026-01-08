'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function InstallBanner() {
  const { canInstall, isIOS, isInstalled, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Verificar si ya se descartó el banner
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      // Mostrar de nuevo después de 7 días
      if (daysSinceDismissed < 7) {
        setIsDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
    } else {
      await promptInstall();
    }
  };

  // No mostrar si ya instalada o descartada
  if (isInstalled || isDismissed || (!canInstall && !isIOS)) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
        >
          <div className="bg-card border rounded-2xl shadow-xl p-4">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Download className="h-6 w-6 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">Instalar LifeOS</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Añade LifeOS a tu pantalla de inicio para acceso rápido y mejor experiencia.
                </p>
                
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleInstall}>
                    {isIOS ? 'Cómo instalar' : 'Instalar'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDismiss}>
                    Ahora no
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Modal de guía iOS */}
      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-end justify-center p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border rounded-t-3xl p-6 w-full max-w-md"
            >
              <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-6" />
              
              <h2 className="text-xl font-bold text-center mb-6">
                Instalar en iPhone/iPad
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Share className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">1. Toca el botón Compartir</p>
                    <p className="text-sm text-muted-foreground">En la barra de Safari</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">2. Añadir a pantalla de inicio</p>
                    <p className="text-sm text-muted-foreground">Desplaza y selecciona esta opción</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Download className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">3. Confirmar</p>
                    <p className="text-sm text-muted-foreground">Toca "Añadir" en la esquina superior</p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full mt-6" 
                onClick={() => setShowIOSGuide(false)}
              >
                Entendido
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}