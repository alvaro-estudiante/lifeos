'use client';

import { Progress } from "@/components/ui/progress";
import { Budget } from "@/lib/actions/finance";
import { cn } from "@/lib/utils";

interface BudgetProgressProps {
  budgets: Budget[];
}

export function BudgetProgress({ budgets }: BudgetProgressProps) {
  if (!budgets.length) return null;

  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const percentage = Math.min(100, Math.round((budget.spent / budget.amount) * 100));
        const isOverBudget = budget.spent > budget.amount;
        const colorClass = isOverBudget ? "bg-red-500" : percentage > 80 ? "bg-yellow-500" : "bg-primary";

        return (
          <div key={budget.id} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium flex items-center gap-2">
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: budget.category?.color || '#ccc' }} 
                />
                {budget.category?.name || 'Sin categoría'}
              </span>
              <span className={cn(isOverBudget && "text-red-500 font-bold")}>
                {budget.spent}€ / {budget.amount}€
              </span>
            </div>
            <Progress value={percentage} className="h-2" indicatorClassName={colorClass} />
          </div>
        );
      })}
    </div>
  );
}