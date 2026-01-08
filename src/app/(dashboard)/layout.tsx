import { MainLayout } from "@/components/layout/MainLayout";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { QuickAddBar } from "@/components/ui/QuickAddBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      {children}
      <QuickAddBar />
      <VoiceAssistant />
    </MainLayout>
  );
}