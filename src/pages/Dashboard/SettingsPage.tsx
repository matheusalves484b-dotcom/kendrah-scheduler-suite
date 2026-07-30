import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import SettingsTabs from "./Settings/SettingsTabs";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";

const SettingsPage = () => {
  // Query to get the authenticated user data + profile
  const { data: user, isLoading } = useQuery({
    queryKey: ["userData"],
    queryFn: async (): Promise<User | null> => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .maybeSingle();

      return {
        id: authUser.id,
        name: profile?.business_name || (authUser.user_metadata?.name as string) || "",
        email: authUser.email || "",
        phoneNumber: (authUser.user_metadata?.phone as string) || "",
        createdAt: new Date(authUser.created_at),
        trialEndsAt: new Date(new Date(authUser.created_at).getTime() + 14 * 24 * 60 * 60 * 1000),
        isSubscribed: false,
        whatsappNumber: profile?.whatsapp_number || "",
      };
    },
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <DashboardHeader
          title="Configurações"
          subtitle="Gerencie suas preferências e notificações"
        />

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando configurações...</p>
          </div>
        ) : (
          user && <SettingsTabs user={user} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
