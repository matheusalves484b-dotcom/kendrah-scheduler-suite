import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck, UserCheck, UserX } from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Provider { id: string; business_name: string | null; whatsapp_number: string | null; is_ambassador: boolean; is_admin: boolean; }

export default function AdminAmbassadorsPage() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login", { replace: true }); return; }
    const { data: me } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    if (!me?.is_admin) { toast({ title: "Acesso negado", description: "Você não possui acesso administrativo.", variant: "destructive" }); navigate("/dashboard", { replace: true }); return; }
    const { data, error } = await supabase.from("profiles").select("id,business_name,whatsapp_number,is_ambassador,is_admin").order("business_name");
    if (error) toast({ title: "Erro ao carregar prestadores", description: error.message, variant: "destructive" });
    setProviders((data ?? []) as Provider[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (provider: Provider) => {
    setSaving(provider.id);
    const { error } = await supabase.rpc("admin_set_ambassador", { p_provider_id: provider.id, p_is_ambassador: !provider.is_ambassador });
    if (error) toast({ title: "Não foi possível alterar", description: error.message, variant: "destructive" });
    else {
      setProviders(current => current.map(p => p.id === provider.id ? { ...p, is_ambassador: !p.is_ambassador } : p));
      toast({ title: !provider.is_ambassador ? "Embaixador ativado" : "Embaixador removido", description: provider.business_name || "Prestador" });
    }
    setSaving(null);
  };

  const filtered = providers.filter(p => `${p.business_name ?? ""} ${p.whatsapp_number ?? ""}`.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <DashboardLayout><div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div></DashboardLayout>;

  return <DashboardLayout>
    <div className="container mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <DashboardHeader title="Embaixadores" subtitle="Gerencie quem possui acesso gratuito permanente ao KENDRAH" />
      <Card className="mb-6 border-kendrah-purple/20 bg-kendrah-purple/5"><CardContent className="flex items-center gap-3 p-4"><ShieldCheck className="h-6 w-6 text-kendrah-purple" /><div><p className="font-medium">Acesso administrativo</p><p className="text-sm text-muted-foreground">Somente administradores podem ativar ou remover o benefício de embaixador.</p></div></CardContent></Card>
      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar prestador..." className="mb-4" />
      <div className="space-y-3">
        {filtered.map(provider => <Card key={provider.id}><CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{provider.business_name || "Sem nome"}</p><p className="text-sm text-muted-foreground">{provider.whatsapp_number || "Sem WhatsApp"}</p></div><div className="flex items-center gap-3">{provider.is_admin && <Badge variant="outline">Administrador</Badge>}{provider.is_ambassador && <Badge>Embaixador</Badge>}<Button variant={provider.is_ambassador ? "outline" : "default"} onClick={() => toggle(provider)} disabled={saving === provider.id}>{saving === provider.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : provider.is_ambassador ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />}{provider.is_ambassador ? "Remover" : "Tornar embaixador"}</Button></div></CardContent></Card>)}
        {!filtered.length && <p className="py-10 text-center text-muted-foreground">Nenhum prestador encontrado.</p>}
      </div>
    </div>
  </DashboardLayout>;
}
