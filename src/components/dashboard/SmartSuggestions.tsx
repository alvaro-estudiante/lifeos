'use client';

import { ChevronRight, Utensils, Dumbbell, CheckSquare, Droplets, Moon, Wallet, Sparkles, X } from 'lucide-react';
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
  nutrition: { icon: Utensils, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  fitness: { icon: Dumbbell, color: "text-blue-500", bg: "bg-blue-500/10" },
  task: { icon: CheckSquare, color: "text-amber-500", bg: "bg-amber-500/10" },
  habit: { icon: Droplets, color: "text-purple-500", bg: "bg-purple-500/10" },
  sleep: { icon: Moon, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  finance: { icon: Wallet, color: "text-green-500", bg: "bg-green-500/10" },
};

export function SmartSuggestions({ suggestions }: SmartSuggestionsProps) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visibleSuggestions = suggestions.filter(s => !dismissed.includes(s.id));

  if (!visibleSuggestions || visibleSuggestions.length === 0) return null;

  // Show max 3 on mobile
  const displaySuggestions = visibleSuggestions.slice(0, 3);

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-xs font-medium text-muted-foreground">Sugerencias</span>
      </div>
      
      {/* Horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
        {displaySuggestions.map((suggestion) => {
          const config = typeConfig[suggestion.type] || typeConfig.task;
          const Icon = config.icon;
          
          return (
            <div 
              key={suggestion.id} 
              className="flex-shrink-0 w-[200px] bg-card border border-border/50 rounded-xl p-3 relative group"
            >
              {/* Dismiss button */}
              <button
                onClick={() => setDismissed([...dismissed, suggestion.id])}
                className="absolute top-2 right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-muted transition-opacity"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
              
              {/* Content */}
              <div className="flex items-start gap-2.5">
                <div className={cn("p-1.5 rounded-lg flex-shrink-0", config.bg)}>
                  <Icon className={cn("h-3.5 w-3.5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-xs line-clamp-1">{suggestion.title}</h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">
                    {suggestion.description}
                  </p>
                  
                  {suggestion.action?.href && (
                    <Link 
                      href={suggestion.action.href}
                      className="inline-flex items-center gap-0.5 text-[10px] font-medium text-primary mt-1.5 hover:underline"
                    >
                      {suggestion.action.label}
                      <ChevronRight className="h-2.5 w-2.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
