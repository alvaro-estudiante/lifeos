'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ChevronRight, Utensils, Dumbbell, CheckSquare, Droplets, Moon, Wallet, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

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

const typeConfig = {
  nutrition: { icon: Utensils, color: "bg-emerald-500/10 text-emerald-600", borderColor: "border-l-emerald-500" },
  fitness: { icon: Dumbbell, color: "bg-blue-500/10 text-blue-600", borderColor: "border-l-blue-500" },
  task: { icon: CheckSquare, color: "bg-amber-500/10 text-amber-600", borderColor: "border-l-amber-500" },
  habit: { icon: Droplets, color: "bg-purple-500/10 text-purple-600", borderColor: "border-l-purple-500" },
  sleep: { icon: Moon, color: "bg-indigo-500/10 text-indigo-600", borderColor: "border-l-indigo-500" },
  finance: { icon: Wallet, color: "bg-green-500/10 text-green-600", borderColor: "border-l-green-500" },
};

export function SmartSuggestions({ suggestions }: SmartSuggestionsProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visibleSuggestions = suggestions.filter(s => !dismissed.includes(s.id));

  if (!visibleSuggestions || visibleSuggestions.length === 0) return null;

  // Show only top 2 on mobile for space
  const displaySuggestions = visibleSuggestions.slice(0, 2);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium text-muted-foreground">Sugerencias</span>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible">
        {displaySuggestions.map((suggestion) => {
          const config = typeConfig[suggestion.type] || typeConfig.task;
          const Icon = config.icon;
          
          return (
            <Card 
              key={suggestion.id} 
              className={cn(
                "min-w-[260px] sm:min-w-0 border-l-4 relative group",
                config.borderColor
              )}
            >
              <button
                onClick={() => setDismissed([...dismissed, suggestion.id])}
                className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-muted transition-opacity"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
              
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg flex-shrink-0", config.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1">{suggestion.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {suggestion.description}
                    </p>
                    
                    {suggestion.action?.href && (
                      <Link href={suggestion.action.href}>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0 mt-2 text-xs"
                        >
                          {suggestion.action.label}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
