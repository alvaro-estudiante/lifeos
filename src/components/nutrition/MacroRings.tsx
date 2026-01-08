"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";

interface MacroData {
  name: string;
  value: number;
  total: number;
  color: string;
}

interface MacroRingsProps {
  calories: MacroData;
  protein: MacroData;
  carbs: MacroData;
  fat: MacroData;
}

export function MacroRings({ calories, protein, carbs, fat }: MacroRingsProps) {
  const rings = [
    { ...calories, radius: 80 },
    { ...protein, radius: 65 },
    { ...carbs, radius: 50 },
    { ...fat, radius: 35 },
  ];

  return (
    <div className="h-[250px] w-full flex items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {rings.map((ring, index) => {
            const data = [
              { value: ring.value, color: ring.color },
              { value: Math.max(0, ring.total - ring.value), color: "#e2e8f0" }, // muted color
            ];
            return (
              <Pie
                key={ring.name}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={ring.radius - 6}
                outerRadius={ring.radius}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
                cornerRadius={10}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            );
          })}
        </PieChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="absolute flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: calories.color }} />
          <span>Calorías</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: protein.color }} />
          <span>Proteína</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: carbs.color }} />
          <span>Carbos</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fat.color }} />
          <span>Grasa</span>
        </div>
      </div>
    </div>
  );
}