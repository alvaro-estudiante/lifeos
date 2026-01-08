"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logSleep, SleepLog } from "@/lib/actions/sleep";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Moon } from "lucide-react";

const formSchema = z.object({
  bed_time: z.string().min(1, "Hora requerida"),
  wake_time: z.string().min(1, "Hora requerida"),
  quality: z.coerce.number().min(1).max(10),
  notes: z.string().optional(),
});

interface SleepLogFormProps {
  date: string;
  initialData?: SleepLog | null;
}

export function SleepLogForm({ date, initialData }: SleepLogFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  type FormValues = z.infer<typeof formSchema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      bed_time: initialData?.bed_time || "23:00",
      wake_time: initialData?.wake_time || "07:00",
      quality: initialData?.quality || 7,
      notes: initialData?.notes || "",
    },
  });

  const calculateDuration = (bed: string, wake: string) => {
    if (!bed || !wake) return 0;
    const bedDate = new Date(`2000-01-01T${bed}`);
    const wakeDate = new Date(`2000-01-01T${wake}`);
    
    // If wake time is earlier than bed time, assume next day
    if (wakeDate < bedDate) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }
    
    const diff = (wakeDate.getTime() - bedDate.getTime()) / (1000 * 60 * 60);
    return Math.round(diff * 10) / 10;
  };

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const duration = calculateDuration(values.bed_time, values.wake_time);
      await logSleep({
        sleep_date: date,
        bed_time: values.bed_time,
        wake_time: values.wake_time,
        quality: values.quality,
        notes: values.notes || null,
        duration_hours: duration,
      });
      toast({ title: "Sueño registrado" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al guardar",
      });
    } finally {
      setLoading(false);
    }
  }

  const duration = calculateDuration(form.watch("bed_time"), form.watch("wake_time"));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-indigo-500" />
          <CardTitle className="text-base">Registro de Sueño</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bed_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">A dormir</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wake_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Despertar</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="text-sm text-center font-medium text-muted-foreground">
              Duración: {duration} horas
            </div>

            <FormField
              control={form.control}
              name="quality"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between">
                    <FormLabel className="text-xs">Calidad</FormLabel>
                    <span className="text-xs font-medium">{field.value}/10</span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(v) => field.onChange(v[0])}
                      max={10}
                      min={1}
                      step={1}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Sueños, despertares..." 
                      className="h-20 min-h-[80px]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="w-full" variant="secondary" size="sm">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Registro"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}