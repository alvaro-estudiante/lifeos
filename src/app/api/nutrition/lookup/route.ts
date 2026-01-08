import { NextRequest, NextResponse } from 'next/server';
import { lookupNutrition } from '@/lib/services/nutrition-lookup';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const food = searchParams.get('food');

  if (!food || food.trim().length < 2) {
    return NextResponse.json(
      { error: 'Parámetro "food" requerido (mínimo 2 caracteres)' },
      { status: 400 }
    );
  }

  try {
    const nutrition = await lookupNutrition(food.trim());
    if (nutrition) {
      return NextResponse.json(nutrition);
    }
    return NextResponse.json(
      { error: 'No se encontró información nutricional' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Nutrition lookup error:', error);
    return NextResponse.json(
      { error: 'Error al buscar información nutricional' },
      { status: 500 }
    );
  }
}