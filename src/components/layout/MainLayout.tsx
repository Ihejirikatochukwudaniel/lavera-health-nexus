import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const MainLayout = ({ children, title, subtitle, action }: MainLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="lg:ml-64">
        <Header 
          title={title} 
          subtitle={subtitle} 
          action={action}
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
