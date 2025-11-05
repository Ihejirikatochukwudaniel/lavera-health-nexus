import { Search, Bell, Moon, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Header = ({ title, subtitle, action }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 bg-secondary border-border"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Moon className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
            <LogOut className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3 pl-4 border-l border-border">
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>DS</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-semibold text-foreground">Dr. Smith</p>
              <p className="text-muted-foreground">Cardiologist</p>
            </div>
          </div>
        </div>
      </div>
      
      {(title || action) && (
        <div className="flex items-center justify-between px-8 py-6 border-t border-border">
          <div>
            {title && <h1 className="text-3xl font-bold text-foreground">{title}</h1>}
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
    </header>
  );
};
