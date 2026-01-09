'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TransactionForm } from "@/components/finance/TransactionForm";
import { Account, Category } from "@/lib/actions/finance";

interface ClientTransactionFormProps {
  accounts: Account[];
  categories: Category[];
}

export function ClientTransactionForm({ accounts, categories }: ClientTransactionFormProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full h-11 font-semibold">
        <Plus className="mr-2 h-5 w-5" /> Nueva Transacción
      </Button>
      <TransactionForm 
        open={open} 
        onOpenChange={setOpen} 
        accounts={accounts} 
        categories={categories} 
      />
    </>
  );
}
