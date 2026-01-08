'use client';

import { Transaction, deleteTransaction } from "@/lib/actions/finance";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTransaction(id);
      toast({ title: "Transacción eliminada" });
    } catch {
      toast({ variant: "destructive", title: "Error al eliminar" });
    } finally {
      setDeletingId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No hay transacciones recientes
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((t) => (
        <div key={t.id} className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-lg">
              {t.category?.icon || '💶'}
            </div>
            <div>
              <p className="text-sm font-medium">{t.description || t.category?.name || 'Sin descripción'}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(t.transaction_date), "d MMM", { locale: es })} • {t.account?.name || 'Cuenta'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`font-bold ${t.type === 'expense' ? '' : 'text-emerald-500'}`}>
              {t.type === 'expense' ? '-' : '+'}{Number(t.amount).toFixed(2)}€
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDelete(t.id)}
              disabled={deletingId === t.id}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}