'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Search, Sparkles, Clock, Users, Flame, 
  ChefHat, Loader2, BookmarkPlus, Bookmark, Trash2,
  UtensilsCrossed
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Recipe {
  id: string;
  name: string;
  description: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: { name: string; quantity: string; unit: string }[];
  instructions: string[];
  tags: string[];
  is_ai_generated: boolean;
  is_saved: boolean;
}

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export default function RecipesPage() {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('saved');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recipesRes, pantryRes] = await Promise.all([
        fetch('/api/recipes'),
        fetch('/api/pantry'),
      ]);
      
      if (recipesRes.ok) {
        const data = await recipesRes.json();
        setRecipes(data);
      }
      if (pantryRes.ok) {
        const data = await pantryRes.json();
        setPantryItems(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const generateRecipes = async () => {
    if (pantryItems.length === 0) {
      toast({
        title: 'Despensa vacía',
        description: 'Añade ingredientes a tu despensa para generar recetas.',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/recipes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pantryItems: pantryItems.map(p => p.name),
        }),
      });

      if (response.ok) {
        const newRecipes = await response.json();
        setRecipes(prev => [...newRecipes, ...prev]);
        setActiveTab('ai');
        toast({
          title: '¡Recetas generadas!',
          description: `Se han creado ${newRecipes.length} recetas basadas en tu despensa.`,
        });
      } else {
        throw new Error('Error generating recipes');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron generar las recetas.',
        variant: 'destructive',
      });
    }
    setGenerating(false);
  };

  const saveRecipe = async (recipe: Recipe) => {
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe),
      });

      if (response.ok) {
        setRecipes(prev => prev.map(r => 
          r.id === recipe.id ? { ...r, is_saved: true } : r
        ));
        toast({
          title: 'Receta guardada',
          description: 'La receta se ha añadido a tus favoritos.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la receta.',
        variant: 'destructive',
      });
    }
  };

  const deleteRecipe = async (id: string) => {
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRecipes(prev => prev.filter(r => r.id !== id));
        setSelectedRecipe(null);
        toast({
          title: 'Receta eliminada',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la receta.',
        variant: 'destructive',
      });
    }
  };

  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'saved') return matchesSearch && r.is_saved;
    if (activeTab === 'ai') return matchesSearch && r.is_ai_generated;
    return matchesSearch;
  });

  const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setSelectedRecipe(recipe)}
    >
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold line-clamp-1">{recipe.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {recipe.description}
            </p>
          </div>
          {recipe.is_ai_generated && (
            <Badge variant="secondary" className="ml-2 flex-shrink-0">
              <Sparkles className="h-3 w-3 mr-1" />
              IA
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {recipe.prep_time + recipe.cook_time} min
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {recipe.servings}
          </span>
          <span className="flex items-center gap-1">
            <Flame className="h-4 w-4" />
            {recipe.calories} kcal
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {recipe.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recetas</h1>
          <p className="text-muted-foreground">Descubre y guarda recetas personalizadas</p>
        </div>
        <Button onClick={generateRecipes} disabled={generating}>
          {generating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generar con IA
        </Button>
      </div>

      {/* Ingredientes disponibles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4" />
            Tu despensa ({pantryItems.length} ingredientes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pantryItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tienes ingredientes en tu despensa. 
              <a href="/dashboard/nutrition/pantry" className="text-primary hover:underline ml-1">
                Añadir ingredientes
              </a>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {pantryItems.slice(0, 15).map(item => (
                <Badge key={item.id} variant="secondary">
                  {item.name}
                </Badge>
              ))}
              {pantryItems.length > 15 && (
                <Badge variant="outline">+{pantryItems.length - 15} más</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Búsqueda y filtros */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar recetas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="saved">
            <Bookmark className="h-4 w-4 mr-2" />
            Guardadas ({recipes.filter(r => r.is_saved).length})
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Sparkles className="h-4 w-4 mr-2" />
            Generadas por IA ({recipes.filter(r => r.is_ai_generated).length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Todas ({recipes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {activeTab === 'ai' 
                  ? 'Pulsa "Generar con IA" para crear recetas con tus ingredientes'
                  : 'No hay recetas guardadas'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de receta */}
      <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedRecipe.name}
                  {selectedRecipe.is_ai_generated && (
                    <Badge variant="secondary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      IA
                    </Badge>
                  )}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <p className="text-muted-foreground">{selectedRecipe.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-muted rounded-lg">
                    <Clock className="h-5 w-5 mx-auto mb-1" />
                    <p className="font-medium">{selectedRecipe.prep_time + selectedRecipe.cook_time}</p>
                    <p className="text-xs text-muted-foreground">minutos</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <Users className="h-5 w-5 mx-auto mb-1" />
                    <p className="font-medium">{selectedRecipe.servings}</p>
                    <p className="text-xs text-muted-foreground">porciones</p>
                  </div>
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <Flame className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                    <p className="font-medium">{selectedRecipe.calories}</p>
                    <p className="text-xs text-muted-foreground">kcal/porción</p>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg">
                    <p className="font-medium text-lg">{selectedRecipe.protein}g</p>
                    <p className="text-xs text-muted-foreground">proteína</p>
                  </div>
                </div>

                {/* Macros */}
                <div className="flex gap-4 text-sm">
                  <span>Carbos: {selectedRecipe.carbs}g</span>
                  <span>Grasas: {selectedRecipe.fat}g</span>
                </div>

                {/* Ingredientes */}
                <div>
                  <h4 className="font-semibold mb-3">Ingredientes</h4>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary rounded-full" />
                        <span>{ing.quantity} {ing.unit} {ing.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instrucciones */}
                <div>
                  <h4 className="font-semibold mb-3">Preparación</h4>
                  <ol className="space-y-3">
                    {selectedRecipe.instructions.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          {i + 1}
                        </span>
                        <p>{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-4 border-t">
                  {!selectedRecipe.is_saved && (
                    <Button onClick={() => saveRecipe(selectedRecipe)}>
                      <BookmarkPlus className="mr-2 h-4 w-4" />
                      Guardar receta
                    </Button>
                  )}
                  <Button 
                    variant="destructive" 
                    onClick={() => deleteRecipe(selectedRecipe.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
