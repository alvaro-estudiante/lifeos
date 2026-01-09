import { getAccounts, getBudgets, getCategories, getTransactions } from "@/lib/actions/finance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, PiggyBank, ArrowRight } from "lucide-react";
import { BudgetProgress } from "@/components/finance/BudgetProgress";
import { TransactionList } from "@/components/finance/TransactionList";
import Link from "next/link";
import { ClientTransactionForm } from "./client"; // Need a client wrapper for the dialog state

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Finanzas</h1>
        <ClientTransactionForm accounts={accounts} categories={categories} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBalance.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              En {accounts.length} cuentas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlySpending.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              De {monthlyBudget.toFixed(2)}€ presupuestados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ahorro</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {(monthlyBudget - monthlySpending).toFixed(2)}€
            </div>
            <p className="text-xs text-muted-foreground">
              Disponible este mes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Presupuestos</CardTitle>
            <CardDescription>Progreso mensual por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetProgress budgets={budgets} />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Transacciones</CardTitle>
              <CardDescription>Movimientos recientes</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/finance/transactions">
                Ver todo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <TransactionList transactions={transactions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}