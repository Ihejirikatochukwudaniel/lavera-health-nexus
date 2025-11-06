import { Search, LogOut, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  onMenuClick?: () => void;
}

export const Header = ({ title, subtitle, action, onMenuClick }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string>("User");

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();
        
        if (profile?.name) {
          setUserName(profile.name);
        } else if (user.email) {
          setUserName(user.email.split('@')[0]);
        }
      }
    };

    fetchUserProfile();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

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
      <div className="flex items-center justify-between px-4 md:px-8 py-4 gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search - hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 bg-secondary border-border"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSignOut} 
            title="Sign Out"
            className="hidden md:flex"
          >
            <LogOut className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 md:gap-3 md:pl-4 md:border-l border-border">
            <Avatar className="w-8 h-8 md:w-10 md:h-10">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-sm hidden sm:block">
              <p className="font-semibold text-foreground">{userName}</p>
            </div>
          </div>
        </div>
      </div>
      
      {(title || action) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 md:px-8 py-4 md:py-6 border-t border-border gap-4">
          <div>
            {title && <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>}
            {subtitle && <p className="text-muted-foreground mt-1 text-sm md:text-base">{subtitle}</p>}
          </div>
          {action && <div className="w-full sm:w-auto">{action}</div>}
        </div>
      )}
    </header>
  );
};
