'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface RecentFood {
  id: string;
  food_name: string;
  calories_per_100g?: number;
}

interface RecentFoodsProps {
  foods: RecentFood[];
  onAdd: (food: RecentFood) => void;
}

export function RecentFoods({ foods, onAdd }: RecentFoodsProps) {
  if (foods.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-3 text-muted-foreground">Recientes</h3>
      <ScrollArea className="w-full whitespace-nowrap pb-4">
        <div className="flex gap-2">
          {foods.map((food) => (
            <Button
              key={food.id}
              variant="outline"
              className="flex-shrink-0 h-auto py-2 px-3 flex flex-col items-start gap-1 text-left"
              onClick={() => onAdd(food)}
            >
              <div className="font-medium text-sm">{food.food_name}</div>
              {food.calories_per_100g && (
                <div className="text-xs text-muted-foreground">
                  {Math.round(food.calories_per_100g)} kcal/100g
                </div>
              )}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}