# LifeOS 🚀

Tu sistema operativo personal para nutrición, fitness y productividad.

## Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **IA**: OpenAI (GPT-4o-mini para lookup de nutrición)
- **PWA**: @ducanh2912/next-pwa

## Requisitos

- Node.js 18+
- npm o pnpm
- Cuenta de Supabase
- API Key de OpenAI (opcional, para búsqueda de nutrición con IA)

## Instalación

1. Clona el repositorio:
```bash
git clone <repo-url>
cd lifeos
```

2. Instala dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales:
- `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key de Supabase
- `OPENAI_API_KEY`: Tu API key de OpenAI (opcional)

4. Genera los iconos PWA:
```bash
npm run generate:icons
```

5. Ejecuta en desarrollo:
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Linter ESLint |
| `npm run generate:icons` | Genera iconos PWA |

## Estructura del Proyecto

```
src/
├── app/                    # App Router (páginas y rutas)
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas del dashboard
│   ├── (onboarding)/      # Onboarding de usuario
│   └── api/               # API Routes
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn)
│   └── [feature]/        # Componentes por funcionalidad
├── hooks/                 # Custom hooks
├── lib/                   # Utilidades y servicios
│   ├── actions/          # Server Actions
│   ├── auth/             # Helpers de autenticación
│   ├── openai/           # Cliente OpenAI
│   ├── services/         # Servicios externos
│   └── supabase/         # Clientes Supabase
└── types/                 # Tipos TypeScript
```

## Módulos

- **📊 Dashboard**: Vista general con métricas del día
- **🍎 Nutrición**: Tracking de comidas y macros
- **💪 Fitness**: Rutinas y entrenamientos
- **✅ Tareas**: Gestión de tareas con prioridades
- **💰 Finanzas**: Control de gastos e ingresos
- **🎯 Hábitos**: Tracking de hábitos diarios

## Base de Datos

Las migraciones de Supabase están en `/supabase/migrations/`. 
Aplícalas en el orden correcto desde el dashboard de Supabase.

## Licencia

Proyecto privado - Uso personal.
