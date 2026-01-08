'use client';

import { useState, useRef } from 'react';
import { Plus, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { processQuickAdd } from '@/lib/actions/quick-add';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function QuickAddBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await processQuickAdd(value);
      toast({
        title: result.success ? '✓' : 'Error',
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      });
      if (result.success) {
        setValue('');
        setIsOpen(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Algo salió mal. Inténtalo de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 md:bottom-8 md:left-auto md:right-24 md:translate-x-0"
          >
            <Button
              onClick={() => {
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 100);
              }}
              className="h-14 rounded-full px-6 shadow-lg bg-primary text-primary-foreground hover:scale-105 transition-transform"
            >
              <Plus className="mr-2 h-5 w-5" />
              Quick Add
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed bottom-8 left-4 right-4 z-50 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[600px]"
            >
              <form onSubmit={handleSubmit} className="relative">
                <Input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Ej: desayuno huevos, tarea llamar médico, agua +1..."
                  className="h-16 pl-6 pr-14 rounded-full text-lg shadow-2xl bg-card border-2 border-primary/20 focus-visible:border-primary"
                  autoFocus
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!value.trim() || isLoading}
                  className="absolute right-2 top-2 h-12 w-12 rounded-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[
                  "Almuerzo ensalada",
                  "Tarea mañana 10am",
                  "Agua +1",
                  "Entreno pesas"
                ].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setValue(hint)}
                    className="text-xs bg-muted/80 hover:bg-muted px-3 py-1.5 rounded-full text-muted-foreground transition-colors"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}