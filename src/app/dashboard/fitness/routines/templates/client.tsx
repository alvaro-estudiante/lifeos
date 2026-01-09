"use client";

import { RoutineTemplate, routineTemplates } from "@/lib/data/routine-templates";
import { RoutineTemplateCard } from "@/components/fitness/RoutineTemplateCard";
import { TemplatePreviewModal } from "@/components/fitness/TemplatePreviewModal";
import { useState } from "react";
import { createRoutineFromTemplate } from "@/lib/actions/routines";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function TemplatesPageClient() {
  const [selectedTemplate, setSelectedTemplate] = useState<RoutineTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handlePreview = (template: RoutineTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleUseTemplate = async (template: RoutineTemplate) => {
    try {
      toast({ title: "Creando rutina..." });
      await createRoutineFromTemplate(template.id);
      toast({ title: "Rutina creada con éxito" });
      router.push("/fitness/routines");
    } catch {
      toast({ variant: "destructive", title: "Error al crear la rutina" });
    }
  };

  const filteredTemplates = routineTemplates.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plantilla..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="beginner">Principiante</TabsTrigger>
          <TabsTrigger value="intermediate">Intermedio</TabsTrigger>
          <TabsTrigger value="advanced">Avanzado</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <RoutineTemplateCard
                key={template.id}
                template={template}
                onPreview={handlePreview}
                onUse={handleUseTemplate}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="beginner" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.filter(t => t.level === 'beginner').map((template) => (
              <RoutineTemplateCard
                key={template.id}
                template={template}
                onPreview={handlePreview}
                onUse={handleUseTemplate}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="intermediate" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.filter(t => t.level === 'intermediate').map((template) => (
              <RoutineTemplateCard
                key={template.id}
                template={template}
                onPreview={handlePreview}
                onUse={handleUseTemplate}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.filter(t => t.level === 'advanced').map((template) => (
              <RoutineTemplateCard
                key={template.id}
                template={template}
                onPreview={handlePreview}
                onUse={handleUseTemplate}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <TemplatePreviewModal
        template={selectedTemplate}
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        onUse={handleUseTemplate}
      />
    </div>
  );
}