import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Recetas predefinidas que se pueden "generar" basándose en ingredientes comunes
const recipeTemplates = [
  {
    name: 'Tortilla de patatas',
    description: 'Clásica tortilla española, perfecta para cualquier momento del día',
    prep_time: 15,
    cook_time: 20,
    servings: 4,
    calories: 250,
    protein: 12,
    carbs: 20,
    fat: 14,
    ingredients: [
      { name: 'patatas', quantity: '500', unit: 'g' },
      { name: 'huevos', quantity: '6', unit: 'unidades' },
      { name: 'cebolla', quantity: '1', unit: 'mediana' },
      { name: 'aceite de oliva', quantity: '100', unit: 'ml' },
      { name: 'sal', quantity: 'al gusto', unit: '' },
    ],
    instructions: [
      'Pelar y cortar las patatas en rodajas finas',
      'Freír las patatas en abundante aceite a fuego medio-bajo hasta que estén tiernas',
      'Opcional: añadir la cebolla cortada fina y sofreír junto a las patatas',
      'Batir los huevos en un bol grande y salar',
      'Escurrir las patatas y mezclar con el huevo batido',
      'En una sartén con poco aceite, verter la mezcla y cocinar a fuego medio',
      'Dar la vuelta con ayuda de un plato cuando cuaje por abajo',
      'Cocinar por el otro lado hasta que esté dorada',
    ],
    tags: ['española', 'huevos', 'vegetariano', 'económica'],
    requiredIngredients: ['patata', 'huevo'],
  },
  {
    name: 'Ensalada César con pollo',
    description: 'Ensalada fresca y nutritiva con pollo a la plancha y salsa césar casera',
    prep_time: 20,
    cook_time: 15,
    servings: 2,
    calories: 380,
    protein: 35,
    carbs: 15,
    fat: 22,
    ingredients: [
      { name: 'pechuga de pollo', quantity: '300', unit: 'g' },
      { name: 'lechuga romana', quantity: '1', unit: 'unidad' },
      { name: 'queso parmesano', quantity: '50', unit: 'g' },
      { name: 'pan', quantity: '2', unit: 'rebanadas' },
      { name: 'ajo', quantity: '2', unit: 'dientes' },
      { name: 'aceite de oliva', quantity: '4', unit: 'cucharadas' },
      { name: 'limón', quantity: '1', unit: 'unidad' },
    ],
    instructions: [
      'Cortar el pan en cubos y tostar en sartén con ajo y aceite',
      'Salpimentar la pechuga y cocinar a la plancha hasta que esté dorada',
      'Lavar y cortar la lechuga en trozos',
      'Preparar el aliño mezclando aceite, limón, ajo picado y parmesano rallado',
      'Cortar el pollo en tiras',
      'Montar la ensalada con la lechuga, pollo, picatostes y queso',
      'Aliñar al gusto',
    ],
    tags: ['ensalada', 'pollo', 'proteína', 'saludable'],
    requiredIngredients: ['pollo', 'lechuga'],
  },
  {
    name: 'Arroz con verduras salteadas',
    description: 'Arroz nutritivo con verduras al wok, perfecto como plato único',
    prep_time: 10,
    cook_time: 25,
    servings: 3,
    calories: 320,
    protein: 8,
    carbs: 55,
    fat: 8,
    ingredients: [
      { name: 'arroz', quantity: '250', unit: 'g' },
      { name: 'zanahoria', quantity: '2', unit: 'unidades' },
      { name: 'calabacín', quantity: '1', unit: 'unidad' },
      { name: 'pimiento', quantity: '1', unit: 'unidad' },
      { name: 'cebolla', quantity: '1', unit: 'unidad' },
      { name: 'salsa de soja', quantity: '3', unit: 'cucharadas' },
      { name: 'aceite de sésamo', quantity: '1', unit: 'cucharada' },
    ],
    instructions: [
      'Cocer el arroz según las instrucciones del paquete',
      'Cortar todas las verduras en juliana o dados pequeños',
      'Saltear las verduras en un wok o sartén grande con aceite',
      'Añadir el arroz cocido y mezclar bien',
      'Agregar la salsa de soja y el aceite de sésamo',
      'Saltear todo junto durante 3-4 minutos',
      'Servir caliente',
    ],
    tags: ['arroz', 'verduras', 'vegano', 'asiática'],
    requiredIngredients: ['arroz'],
  },
  {
    name: 'Pasta con atún y tomate',
    description: 'Pasta rápida y sabrosa con atún en conserva y salsa de tomate',
    prep_time: 5,
    cook_time: 15,
    servings: 2,
    calories: 450,
    protein: 25,
    carbs: 60,
    fat: 12,
    ingredients: [
      { name: 'pasta', quantity: '200', unit: 'g' },
      { name: 'atún en conserva', quantity: '2', unit: 'latas' },
      { name: 'tomate triturado', quantity: '400', unit: 'g' },
      { name: 'ajo', quantity: '2', unit: 'dientes' },
      { name: 'aceite de oliva', quantity: '2', unit: 'cucharadas' },
      { name: 'orégano', quantity: '1', unit: 'cucharadita' },
    ],
    instructions: [
      'Poner agua a hervir y cocinar la pasta al dente',
      'En una sartén, sofreír el ajo picado con aceite',
      'Añadir el tomate triturado y cocinar 5 minutos',
      'Agregar el atún escurrido y el orégano',
      'Mezclar con la pasta escurrida',
      'Servir con queso rallado si se desea',
    ],
    tags: ['pasta', 'atún', 'rápida', 'económica'],
    requiredIngredients: ['pasta', 'atún'],
  },
  {
    name: 'Revuelto de setas y gambas',
    description: 'Delicioso revuelto con setas variadas y gambas, alto en proteínas',
    prep_time: 10,
    cook_time: 12,
    servings: 2,
    calories: 280,
    protein: 28,
    carbs: 5,
    fat: 16,
    ingredients: [
      { name: 'huevos', quantity: '4', unit: 'unidades' },
      { name: 'gambas peladas', quantity: '200', unit: 'g' },
      { name: 'champiñones', quantity: '150', unit: 'g' },
      { name: 'ajo', quantity: '2', unit: 'dientes' },
      { name: 'perejil', quantity: '1', unit: 'puñado' },
      { name: 'aceite de oliva', quantity: '3', unit: 'cucharadas' },
    ],
    instructions: [
      'Limpiar y laminar los champiñones',
      'Saltear las setas con ajo picado en aceite',
      'Añadir las gambas y cocinar 2-3 minutos',
      'Batir los huevos y verter sobre las setas y gambas',
      'Remover suavemente hasta que cuaje',
      'Espolvorear con perejil picado',
      'Servir inmediatamente',
    ],
    tags: ['huevos', 'marisco', 'low-carb', 'proteína'],
    requiredIngredients: ['huevo', 'gamba', 'champiñon'],
  },
  {
    name: 'Smoothie bowl de frutas',
    description: 'Bowl de smoothie cremoso con toppings saludables, perfecto para desayunar',
    prep_time: 10,
    cook_time: 0,
    servings: 1,
    calories: 350,
    protein: 12,
    carbs: 55,
    fat: 10,
    ingredients: [
      { name: 'plátano congelado', quantity: '1', unit: 'unidad' },
      { name: 'frutos rojos', quantity: '100', unit: 'g' },
      { name: 'yogur griego', quantity: '100', unit: 'g' },
      { name: 'leche', quantity: '50', unit: 'ml' },
      { name: 'granola', quantity: '30', unit: 'g' },
      { name: 'semillas de chía', quantity: '1', unit: 'cucharada' },
    ],
    instructions: [
      'Triturar el plátano congelado con los frutos rojos',
      'Añadir el yogur y la leche',
      'Batir hasta conseguir una textura cremosa y espesa',
      'Verter en un bowl',
      'Decorar con granola, semillas y frutas frescas',
      'Servir inmediatamente',
    ],
    tags: ['desayuno', 'smoothie', 'fruta', 'saludable'],
    requiredIngredients: ['plátano', 'yogur'],
  },
];

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const pantryItems: string[] = body.pantryItems || [];
  const pantryLower = pantryItems.map(p => p.toLowerCase());

  // Filtrar recetas que coincidan con ingredientes de la despensa
  const matchingRecipes = recipeTemplates.filter(recipe => {
    const hasRequired = recipe.requiredIngredients.some(req =>
      pantryLower.some(p => p.includes(req) || req.includes(p))
    );
    return hasRequired;
  });

  // Si no hay coincidencias, devolver algunas recetas aleatorias
  const recipesToReturn = matchingRecipes.length > 0 
    ? matchingRecipes 
    : recipeTemplates.slice(0, 3);

  // Formatear para el frontend
  const formattedRecipes = recipesToReturn.map((recipe, index) => ({
    id: `ai-${Date.now()}-${index}`,
    name: recipe.name,
    description: recipe.description,
    prep_time: recipe.prep_time,
    cook_time: recipe.cook_time,
    servings: recipe.servings,
    calories: recipe.calories,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    tags: recipe.tags,
    is_ai_generated: true,
    is_saved: false,
  }));

  return NextResponse.json(formattedRecipes);
}
