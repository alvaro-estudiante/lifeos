interface NutritionData {
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  source: 'openfoodfacts' | 'openai' | 'manual';
  product_name?: string;
}

// Buscar en Open Food Facts (gratis, sin API key)
async function searchOpenFoodFacts(query: string): Promise<NutritionData | null> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5&lc=es`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.products && data.products.length > 0) {
      // Buscar el primer producto con datos nutricionales completos
      for (const product of data.products) {
        const n = product.nutriments;
        if (n && (n['energy-kcal_100g'] || n['energy_100g'])) {
          return {
            calories_per_100g: Math.round(n['energy-kcal_100g'] || n['energy_100g'] / 4.184),
            protein_per_100g: Math.round((n['proteins_100g'] || 0) * 10) / 10,
            carbs_per_100g: Math.round((n['carbohydrates_100g'] || 0) * 10) / 10,
            fat_per_100g: Math.round((n['fat_100g'] || 0) * 10) / 10,
            fiber_per_100g: Math.round((n['fiber_100g'] || 0) * 10) / 10,
            source: 'openfoodfacts',
            product_name: product.product_name || query
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Open Food Facts error:', error);
    return null;
  }
}

// Fallback con OpenAI
async function getNutritionFromOpenAI(foodName: string): Promise<NutritionData | null> {
  try {
    const { askOpenAI } = await import('@/lib/openai/client');
    const prompt = `Proporciona los valores nutricionales aproximados por 100g para: "${foodName}". Responde ÚNICAMENTE con un JSON válido en este formato exacto, sin explicaciones ni texto adicional: {"calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number} Ejemplo para "pechuga de pollo": {"calories": 165, "protein": 31, "carbs": 0, "fat": 3.6, "fiber": 0}`;
    
    const response = await askOpenAI(prompt);
    
    // Extraer JSON de la respuesta
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return {
        calories_per_100g: Math.round(data.calories),
        protein_per_100g: Math.round(data.protein * 10) / 10,
        carbs_per_100g: Math.round(data.carbs * 10) / 10,
        fat_per_100g: Math.round(data.fat * 10) / 10,
        fiber_per_100g: Math.round(data.fiber * 10) / 10,
        source: 'openai'
      };
    }
    return null;
  } catch (error) {
    console.error('OpenAI error:', error);
    return null;
  }
}

// Función principal
export async function lookupNutrition(foodName: string): Promise<NutritionData | null> {
  // Primero intentar Open Food Facts (gratis)
  const offResult = await searchOpenFoodFacts(foodName);
  if (offResult) return offResult;

  // Fallback a OpenAI
  const aiResult = await getNutritionFromOpenAI(foodName);
  if (aiResult) return aiResult;

  return null;
}