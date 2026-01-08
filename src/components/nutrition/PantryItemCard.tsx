"use client";

import { PantryItem } from "@/lib/actions/pantry";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit2,
  Trash2,
  Beef,
  Wheat,
  Carrot,
  Apple,
  Milk,
  Droplet,
  Package,
  Cookie,
  Coffee,
} from "lucide-react";
import { useState } from "react";
import { deletePantryItem, updatePantryItem } from "@/lib/actions/pantry";
import { useToast } from "@/hooks/use-toast";
import { PantryForm } from "./PantryForm";

const categoryIcons: Record<string, any> = {
  proteins: Beef,
  carbs: Wheat,
  vegetables: Carrot,
  fruits: Apple,
  dairy: Milk,
  fats: Droplet,
  condiments: Cookie, // Aproximación
  beverages: Coffee,
  other: Package,
};

interface PantryItemCardProps {
  item: PantryItem;
}

export function PantryItemCard({ item }: PantryItemCardProps) {
  const Icon = categoryIcons[item.category] || Package;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este item?")) return;
    setLoading(true);
    try {
      await deletePantryItem(item.id);
      toast({ title: "Item eliminado" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "Inténtalo de nuevo",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      await updatePantryItem(item.id, { is_available: !item.is_available });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al actualizar",
      });
    }
  };

  return (
    <>
      <Card className={`overflow-hidden transition-all ${!item.is_available ? "opacity-60 bg-muted/50" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-primary/10 text-primary`}>
                <Icon size={24} />
              </div>
              <div>
                <h3 className="font-semibold line-clamp-1">{item.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} {item.unit}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
               <Badge
                  variant={item.is_available ? "default" : "secondary"}
                  className="cursor-pointer select-none self-end"
                  onClick={toggleAvailability}
                >
                  {item.is_available ? "Disponible" : "Agotado"}
                </Badge>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
             <div className="text-xs text-muted-foreground">
                {item.expiry_date && `Caduca: ${new Date(item.expiry_date).toLocaleDateString()}`}
             </div>
             <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditOpen(true)}>
                  <Edit2 size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={handleDelete} disabled={loading}>
                  <Trash2 size={16} />
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>

      <PantryForm open={editOpen} onOpenChange={setEditOpen} itemToEdit={item} />
    </>
  );
}