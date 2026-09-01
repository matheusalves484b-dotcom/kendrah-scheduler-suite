import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Footer from "./Footer";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import type { Session } from "@supabase/supabase-js";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);
  const { data: subscription, isLoading: checkingAccess } = useSubscription();

  useEffect(() => {
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setChecking(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });

    return () => authSubscription.unsubscribe();
  }, []);

  if (checking || (session && checkingAccess)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // A página de assinatura permanece acessível para que o prestador expirado possa assinar.
  const isSubscriptionPage = location.pathname === "/dashboard/subscription";
  if (!isSubscriptionPage && subscription && !subscription.access_allowed) {
    return <Navigate to="/dashboard/subscription" replace state={{ reason: "trial_expired" }} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {children}
      <Footer />
    </div>
  );
};

export default ProtectedRoute;
