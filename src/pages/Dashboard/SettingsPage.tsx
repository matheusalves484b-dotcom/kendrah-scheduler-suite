
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import SettingsTabs from "./Settings/SettingsTabs";
import { mockUser } from "./Settings/mockData";

const SettingsPage = () => {
  // Query to get user data
  const { data: user, isLoading } = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      // This would be a real API call
      console.log("Fetching user data...");
      return mockUser;
    }
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
