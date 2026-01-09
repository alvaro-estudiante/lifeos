import { getAccounts, getBudgets, getCategories, getTransactions } from "@/lib/actions/finance";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ChevronRight, Plus, CreditCard } from "lucide-react";
import { BudgetProgress } from "@/components/finance/BudgetProgress";
import { TransactionList } from "@/components/finance/TransactionList";
import Link from "next/link";
import { ClientTransactionForm } from "./client";
import { cn } from "@/lib/utils";

export default async function FinancePage() {
  const [accounts, transactions, budgets, categories] = await Promise.all([
    getAccounts(),
    getTransactions(5),
    getBudgets(),
    getCategories()
  ]);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const monthlySpending = budgets.reduce((sum, b) => sum + b.spent, 0);
  const monthlyBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const savingsAvailable = monthlyBudget - monthlySpending;
  const budgetProgress = monthlyBudget > 0 ? Math.round((monthlySpending / monthlyBudget) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm">Balance Total</p>
              <p className="text-3xl font-bold mt-1">{totalBalance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}€</p>
              <p className="text-slate-400 text-xs mt-1">{accounts.length} cuenta{accounts.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-red-500/10">
                <TrendingDown className="h-4 w-4 text-red-500" />
              </div>
              <span className="text-xs text-muted-foreground">Gastos</span>
            </div>
            <p className="text-xl font-bold">{monthlySpending.toFixed(0)}€</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    budgetProgress > 90 ? "bg-red-500" : budgetProgress > 70 ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${Math.min(100, budgetProgress)}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{budgetProgress}%</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <PiggyBank className="h-4 w-4 text-emerald-500" />
              </div>
              <span className="text-xs text-muted-foreground">Disponible</span>
            </div>
            <p className={cn(
              "text-xl font-bold",
              savingsAvailable >= 0 ? "text-emerald-500" : "text-red-500"
            )}>
              {savingsAvailable.toFixed(0)}€
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              de {monthlyBudget.toFixed(0)}€ presupuesto
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction CTA */}
      <ClientTransactionForm accounts={accounts} categories={categories} />

      {/* Budgets Section */}
      {budgets.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">Presupuestos</h2>
          </div>
          <Card>
            <CardContent className="p-4">
              <BudgetProgress budgets={budgets} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Transacciones Recientes</h2>
          <Link href="/dashboard/finance/transactions" className="text-xs text-primary flex items-center">
            Ver todas <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        
        {transactions.length > 0 ? (
          <Card>
            <CardContent className="p-3">
              <TransactionList transactions={transactions} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <CreditCard className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Sin transacciones</p>
              <p className="text-xs text-muted-foreground mt-1">Añade tu primer movimiento</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
