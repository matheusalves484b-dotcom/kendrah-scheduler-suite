import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import ProfileForm from "./ProfileForm";
import WhatsAppForm from "./WhatsAppForm";
import BookingUrlForm from "./BookingUrlForm";
import { User } from "@/types";
import { useTheme } from "@/components/ThemeProvider";

interface SettingsTabsProps {
  user: User;
}

const SettingsTabs = ({ user }: SettingsTabsProps) => {
  const [activeTab, setActiveTab] = useState("profile");
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="mb-6">
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="integrations">WhatsApp</TabsTrigger>
        <TabsTrigger value="booking">Link de agendamento</TabsTrigger>
        <TabsTrigger value="appearance">Aparência</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Informações do perfil</CardTitle>
            <CardDescription>Atualize seus dados pessoais e de contato</CardDescription>
          </CardHeader>
          <CardContent><ProfileForm user={user} /></CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="integrations">
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp</CardTitle>
            <CardDescription>Configure suas notificações de WhatsApp</CardDescription>
          </CardHeader>
          <CardContent><WhatsAppForm user={user} /></CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="booking">
        <Card>
          <CardHeader>
            <CardTitle>Link de agendamento</CardTitle>
            <CardDescription>Personalize e compartilhe seu link de agendamentos online</CardDescription>
          </CardHeader>
          <CardContent><BookingUrlForm userId={user.id} /></CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="appearance">
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>Personalize a aparência do seu painel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                {isDark ? <Moon className="h-5 w-5 text-kendrah-purple" /> : <Sun className="h-5 w-5 text-kendrah-purple" />}
                <div>
                  <p className="font-medium">Modo escuro</p>
                  <p className="text-sm text-muted-foreground">
                    {isDark ? "O painel está usando o tema escuro." : "Use um tema escuro para reduzir o brilho da tela."}
                  </p>
                </div>
              </div>
              <Switch
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                aria-label="Ativar modo escuro"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default SettingsTabs;
