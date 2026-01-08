'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight, Utensils, Dumbbell, CheckSquare, Droplets, Moon, Wallet } from 'lucide-react';
import Link from 'next/link';

export interface Suggestion {
  id: string;
  type: 'nutrition' | 'fitness' | 'task' | 'habit' | 'sleep' | 'finance';
  priority: 'high' | 'medium' | 'low';
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

interface SmartSuggestionsProps {
  suggestions: Suggestion[];
}

export function SmartSuggestions({ suggestions }: SmartSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'nutrition': return <Utensils className="h-5 w-5 text-blue-500" />;
      case 'fitness': return <Dumbbell className="h-5 w-5 text-orange-500" />;
      case 'task': return <CheckSquare className="h-5 w-5 text-purple-500" />;
      case 'habit': return <Droplets className="h-5 w-5 text-sky-500" />;
      case 'sleep': return <Moon className="h-5 w-5 text-indigo-500" />;
      case 'finance': return <Wallet className="h-5 w-5 text-green-500" />;
      default: return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <Card className="border-l-4 border-l-primary bg-muted/10">
      <CardHeader className="pb-3 flex flex-row items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg">Sugerencias para ti</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="flex items-start justify-between gap-4 p-3 bg-card rounded-lg border shadow-sm">
            <div className="flex gap-3">
              <div className="mt-1 bg-muted p-2 rounded-full h-fit">
                {getIcon(suggestion.type)}
              </div>
              <div>
                <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                <p className="text-xs text-muted-foreground">{suggestion.description}</p>
              </div>
            </div>
            {suggestion.action && (
              <Button asChild size="sm" variant="outline" className="shrink-0">
                {suggestion.action.href ? (
                  <Link href={suggestion.action.href}>
                    {suggestion.action.label} <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                ) : (
                  <button onClick={suggestion.action.onClick}>
                    {suggestion.action.label}
                  </button>
                )}
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}