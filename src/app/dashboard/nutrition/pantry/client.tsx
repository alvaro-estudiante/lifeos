"use client";

import { PantryItem } from "@/lib/actions/pantry";
import { PantryItemCard } from "@/components/nutrition/PantryItemCard";
import { PantryForm } from "@/components/nutrition/PantryForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PantryPageClientProps {
  items: PantryItem[];
}

export function PantryPageClient({ items }: PantryPageClientProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Despensa</h1>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Añadir Item
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="proteins">Proteínas</SelectItem>
            <SelectItem value="carbs">Carbohidratos</SelectItem>
            <SelectItem value="vegetables">Verduras</SelectItem>
            <SelectItem value="fruits">Frutas</SelectItem>
            <SelectItem value="dairy">Lácteos</SelectItem>
            <SelectItem value="fats">Grasas</SelectItem>
            <SelectItem value="condiments">Condimentos</SelectItem>
            <SelectItem value="beverages">Bebidas</SelectItem>
            <SelectItem value="other">Otros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.map((item) => (
          <PantryItemCard key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron items.
        </div>
      )}

      <PantryForm open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}