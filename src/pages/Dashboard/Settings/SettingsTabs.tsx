
import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import ProfileForm from "./ProfileForm";
import WhatsAppForm from "./WhatsAppForm";
import BookingUrlForm from "./BookingUrlForm";
import { User } from "@/types";

interface SettingsTabsProps {
  user: User;
}

const SettingsTabs = ({ user }: SettingsTabsProps) => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="mb-6">
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="integrations">WhatsApp</TabsTrigger>
        <TabsTrigger value="booking">Link de agendamento</TabsTrigger>
      </TabsList>

      {/* Profile tab */}
      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Informações do perfil</CardTitle>
            <CardDescription>
              Atualize seus dados pessoais e de contato
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm user={user} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* WhatsApp tab */}
      <TabsContent value="integrations">
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp</CardTitle>
            <CardDescription>
              Configure suas notificações de WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WhatsAppForm user={user} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Booking URL tab */}
      <TabsContent value="booking">
        <Card>
          <CardHeader>
            <CardTitle>Link de agendamento</CardTitle>
            <CardDescription>
              Personalize e compartilhe seu link de agendamentos online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookingUrlForm user={user} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;
