import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 flex-col pb-20 md:pb-0">
        <Header />
        <main className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
