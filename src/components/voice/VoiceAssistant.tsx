'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { processVoiceCommand } from '@/lib/actions/voice';
import { useToast } from '@/hooks/use-toast';

type VoiceState = 'idle' | 'listening' | 'processing' | 'success' | 'error';

export function VoiceAssistant() {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Inicializar Web Speech API
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptResult = event.results[current][0].transcript;
        setTranscript(transcriptResult);
        
        if (event.results[current].isFinal) {
          handleTranscriptComplete(transcriptResult);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'aborted') {
            setState('error');
            setResult('Error al reconocer voz. Intenta de nuevo.');
        }
      };

      recognitionRef.current.onend = () => {
        if (state === 'listening') {
          // Si terminó sin resultado final, procesar lo que tengamos
          if (transcript) {
            handleTranscriptComplete(transcript);
          } else {
            // Only go to idle if we were listening and it just stopped without result
            if (state === 'listening') {
                setState('idle');
            }
          }
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setResult(null);
      setState('listening');
      setIsOpen(true);
      recognitionRef.current.start();
    } else {
      toast({
        title: 'No soportado',
        description: 'Tu navegador no soporta reconocimiento de voz.',
        variant: 'destructive'
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleTranscriptComplete = async (text: string) => {
    setState('processing');
    stopListening(); // Ensure recording stops
    
    try {
      const response = await processVoiceCommand(text);
      
      if (response.success) {
        setState('success');
        setResult(response.message);
        toast({
          title: '✓ Comando ejecutado',
          description: response.message,
        });
        
        // Cerrar después de 2 segundos en éxito
        setTimeout(() => {
          setIsOpen(false);
          setState('idle');
          setTranscript('');
          setResult(null);
        }, 2500);
      } else {
        setState('error');
        setResult(response.message || 'No pude entender el comando');
      }
    } catch {
      setState('error');
      setResult('Error al procesar el comando');
    }
  };

  const close = () => {
    stopListening();
    setIsOpen(false);
    setState('idle');
    setTranscript('');
    setResult(null);
  };

  return (
    <>
      {/* Botón FAB flotante */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={startListening}
        className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center md:bottom-8"
        aria-label="Asistente de voz"
      >
        <Mic className="h-6 w-6" />
      </motion.button>

      {/* Modal/Overlay de grabación */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6"
          >
            {/* Botón cerrar */}
            <button 
              onClick={close}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Indicador visual */}
            <div className="flex flex-col items-center gap-6">
              
              {/* Círculo animado según estado */}
              <motion.div
                animate={state === 'listening' ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                transition={{ repeat: state === 'listening' ? Infinity : 0, duration: 1.5 }}
                className={`h-32 w-32 rounded-full flex items-center justify-center ${
                  state === 'listening' ? 'bg-red-500' :
                  state === 'processing' ? 'bg-amber-500' :
                  state === 'success' ? 'bg-green-500' :
                  state === 'error' ? 'bg-red-500' :
                  'bg-primary'
                }`}
              >
                {state === 'listening' && <Mic className="h-12 w-12 text-white" />}
                {state === 'processing' && <Loader2 className="h-12 w-12 text-white animate-spin" />}
                {state === 'success' && <Check className="h-12 w-12 text-white" />}
                {state === 'error' && <AlertCircle className="h-12 w-12 text-white" />}
                {state === 'idle' && <Mic className="h-12 w-12 text-white" />}
              </motion.div>

              {/* Estado textual */}
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">
                  {state === 'listening' && 'Escuchando...'}
                  {state === 'processing' && 'Procesando...'}
                  {state === 'success' && '¡Listo!'}
                  {state === 'error' && 'Error'}
                  {state === 'idle' && 'Pulsa para hablar'}
                </p>
                
                {/* Transcripción en tiempo real */}
                {transcript && (
                  <p className="text-muted-foreground max-w-sm">
                    "{transcript}"
                  </p>
                )}
                
                {/* Resultado */}
                {result && (
                  <p className={`max-w-sm ${state === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                    {result}
                  </p>
                )}
              </div>

              {/* Botón de parar */}
              {state === 'listening' && (
                <Button variant="outline" onClick={stopListening}>
                  <MicOff className="h-4 w-4 mr-2" />
                  Parar
                </Button>
              )}
              
              {/* Botón de reintentar */}
              {(state === 'error' || state === 'success') && (
                <Button variant="outline" onClick={startListening}>
                  <Mic className="h-4 w-4 mr-2" />
                  Nuevo comando
                </Button>
              )}
            </div>

            {/* Ejemplos de comandos */}
            {state === 'idle' && (
              <div className="absolute bottom-8 left-0 right-0 px-6">
                <p className="text-sm text-muted-foreground text-center mb-2">Ejemplos:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    'Desayuné huevos con tostadas',
                    'Nueva tarea: llamar al médico',
                    'Bebí 2 vasos de agua',
                    'Hice 3 series de press banca'
                  ].map((example) => (
                    <span key={example} className="text-xs bg-muted px-2 py-1 rounded-full">
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}