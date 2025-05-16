
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from "@/components/ui/use-toast";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

const LogoutButton = ({ 
  variant = "ghost", 
  className = "" 
}: LogoutButtonProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Simulate logout process
    setTimeout(() => {
      // Clear authentication state
      localStorage.removeItem("isAuthenticated");
      
      // Clear any other user data
      localStorage.removeItem("userData");
      
      // Show success message
      toast({
        title: "Você saiu com sucesso",
        description: "Até logo!",
      });
      
      // Redirect to login page
      navigate("/login");
    }, 800); // Short delay to show loading state
  };

  return (
    <Button 
      variant={variant} 
      className={className} 
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saindo...
        </>
      ) : (
        "Sair"
      )}
    </Button>
  );
};

export default LogoutButton;
