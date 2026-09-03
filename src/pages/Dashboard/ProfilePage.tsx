import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, ImagePlus, Loader2, Trash2, UserRoundX } from "lucide-react";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const MAX_FILE_SIZE = 3 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ProfileData {
  id: string;
  email: string;
  name: string;
  phone: string;
  whatsapp: string;
  slug: string | null;
  logoPath: string | null;
  coverPath: string | null;
}

function normalizarWhatsApp(numero: string): string | null {
  const digits = numero.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["provider-profile-page"],
    queryFn: async (): Promise<ProfileData | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("id, business_name, slug, whatsapp_number, business_logo_url, business_cover_url").eq("id", user.id).maybeSingle();
      return { id: user.id, email: user.email ?? "", name: (user.user_metadata?.name as string) || data?.business_name || "", phone: (user.user_metadata?.phone as string) || "", whatsapp: data?.whatsapp_number ?? "", slug: data?.slug ?? null, logoPath: data?.business_logo_url ?? null, coverPath: data?.business_cover_url ?? null };
    },
  });

  useEffect(() => { if (!profile) return; setName(profile.name); setPhone(profile.phone); setWhatsapp(profile.whatsapp); }, [profile]);

  const resolveStorageUrl = async (path: string | null) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60);
    return data?.signedUrl ?? null;
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const [photo, cover] = await Promise.all([resolveStorageUrl(profile?.logoPath ?? null), resolveStorageUrl(profile?.coverPath ?? null)]);
      if (!active) return;
      setPhotoUrl(photo); setCoverUrl(cover);
    })();
    return () => { active = false; };
  }, [profile?.logoPath, profile?.coverPath]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error("Sessão expirada. Faça login novamente.");
      if (name.trim().length < 2) throw new Error("Informe um nome com pelo menos 2 caracteres.");
      const { error: profileError } = await supabase.from("profiles").upsert({ id: profile.id, business_name: name.trim(), whatsapp_number: normalizarWhatsApp(whatsapp), updated_at: new Date().toISOString() }, { onConflict: "id" });
      if (profileError) throw profileError;
      const { error: authError } = await supabase.auth.updateUser({ data: { name: name.trim(), phone: phone.trim() } });
      if (authError) throw authError;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["provider-profile-page"] }); queryClient.invalidateQueries({ queryKey: ["provider-profile"] }); queryClient.invalidateQueries({ queryKey: ["userData"] }); toast({ title: "Perfil atualizado", description: "Seus dados foram salvos." }); },
    onError: (error: Error) => toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" }),
  });

  const uploadImage = async (file: File, kind: "avatar" | "cover") => {
    if (!profile) return;
    if (!ACCEPTED_TYPES.includes(file.type)) { toast({ title: "Formato inválido", description: "Envie uma imagem JPG, PNG ou WEBP.", variant: "destructive" }); return; }
    if (file.size > MAX_FILE_SIZE) { toast({ title: "Imagem muito grande", description: "O limite é 3 MB.", variant: "destructive" }); return; }
    const setBusy = kind === "cover" ? setUploadingCover : setUploading;
    const oldPath = kind === "cover" ? profile.coverPath : profile.logoPath;
    setBusy(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${profile.id}/${kind}-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const payload = kind === "cover" ? { business_cover_url: path } : { business_logo_url: path };
      const { error: updateError } = await supabase.from("profiles").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", profile.id);
      if (updateError) throw updateError;
      if (oldPath && !oldPath.startsWith("http")) await supabase.storage.from("avatars").remove([oldPath]);
      const url = await resolveStorageUrl(path);
      if (kind === "cover") setCoverUrl(url); else setPhotoUrl(url);
      queryClient.invalidateQueries({ queryKey: ["provider-profile-page"] }); queryClient.invalidateQueries({ queryKey: ["provider-profile"] });
      toast({ title: kind === "cover" ? "Capa atualizada" : "Foto atualizada", description: kind === "cover" ? "Sua capa já aparece na página de agendamento." : "Sua nova foto de perfil já está ativa." });
    } catch (error) { toast({ title: kind === "cover" ? "Erro ao enviar a capa" : "Erro ao enviar a foto", description: error instanceof Error ? error.message : "Tente novamente.", variant: "destructive" }); }
    finally { setBusy(false); }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) await uploadImage(file, "avatar"); };
  const handleCoverChange = async (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) await uploadImage(file, "cover"); };

  const removeImage = async (kind: "avatar" | "cover") => {
    if (!profile) return;
    const path = kind === "cover" ? profile.coverPath : profile.logoPath;
    if (!path) return;
    const setBusy = kind === "cover" ? setUploadingCover : setUploading;
    setBusy(true);
    try {
      if (!path.startsWith("http")) await supabase.storage.from("avatars").remove([path]);
      const payload = kind === "cover" ? { business_cover_url: null } : { business_logo_url: null };
      const { error } = await supabase.from("profiles").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", profile.id);
      if (error) throw error;
      if (kind === "cover") setCoverUrl(null); else setPhotoUrl(null);
      queryClient.invalidateQueries({ queryKey: ["provider-profile-page"] }); queryClient.invalidateQueries({ queryKey: ["provider-profile"] });
      toast({ title: kind === "cover" ? "Capa removida" : "Foto removida" });
    } catch (error) { toast({ title: "Erro ao remover", description: error instanceof Error ? error.message : "Tente novamente.", variant: "destructive" }); }
    finally { setBusy(false); }
  };

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Sessão expirada. Faça login novamente.");
      const { data, error } = await supabase.functions.invoke("delete-account", { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Não foi possível excluir sua conta.");
    },
    onSuccess: async () => { queryClient.clear(); await supabase.auth.signOut(); window.location.replace("/login"); },
    onError: (error: Error) => toast({ title: "Não foi possível excluir a conta", description: error.message || "Tente novamente.", variant: "destructive" }),
  });

  const initials = (name || profile?.email || "P").trim().charAt(0).toUpperCase();

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-3xl px-4 py-6 sm:py-8">
        <DashboardHeader title="Meu perfil" subtitle="Atualize seus dados e as fotos que aparecem para seus clientes" />
        {isLoading ? <div className="flex h-40 items-center justify-center text-muted-foreground">Carregando perfil...</div> : (
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Foto de capa</CardTitle><CardDescription>Use uma imagem do seu salão, barbearia, clínica ou dos seus serviços. Ela aparece no topo do seu agendamento público.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-[3/1] min-h-[120px] w-full overflow-hidden rounded-xl border bg-muted sm:aspect-[4/1]">
                  {coverUrl ? <img src={coverUrl} alt="Capa do perfil" className="h-full w-full object-cover" onError={() => setCoverUrl(null)} /> : <div className="flex h-full items-center justify-center bg-gradient-to-r from-kendrah-purple/20 to-kendrah-purple/5 px-6 text-center text-sm text-muted-foreground">Adicione uma foto de capa para deixar seu perfil mais profissional.</div>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-3 pt-10">
                    <Button type="button" size="sm" variant="secondary" onClick={() => coverInputRef.current?.click()} disabled={uploadingCover}>{uploadingCover ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}{coverUrl ? "Trocar capa" : "Adicionar capa"}</Button>
                    {coverUrl && <Button type="button" size="sm" variant="secondary" onClick={() => removeImage("cover")} disabled={uploadingCover}><Trash2 className="mr-2 h-4 w-4" />Remover</Button>}
                  </div>
                </div>
                <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverChange} />
                <p className="text-xs text-muted-foreground">JPG, PNG ou WEBP até 3 MB. Para melhor resultado, use uma imagem horizontal.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Foto de perfil</CardTitle><CardDescription>Uma foto ajuda seus clientes a reconhecerem você na página de agendamento.</CardDescription></CardHeader>
              <CardContent className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
                <Avatar className="h-24 w-24 border border-border">{photoUrl && <AvatarImage src={photoUrl} alt={`Foto de perfil de ${name || "prestador"}`} />}<AvatarFallback className="bg-kendrah-purple/10 text-2xl font-semibold text-kendrah-purple">{initials}</AvatarFallback></Avatar>
                <div className="flex flex-col gap-3 sm:flex-1"><div className="flex flex-wrap gap-2"><Button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}>{uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}{photoUrl ? "Trocar foto" : "Adicionar foto"}</Button>{photoUrl && <Button type="button" variant="outline" onClick={() => removeImage("avatar")} disabled={uploading}><Trash2 className="mr-2 h-4 w-4" />Remover</Button>}</div><p className="text-xs text-muted-foreground">JPG, PNG ou WEBP até 3 MB.</p><input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Dados do prestador</CardTitle><CardDescription>Essas informações aparecem no seu link de agendamento.</CardDescription></CardHeader>
              <CardContent><form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}>
                <div className="space-y-2"><Label htmlFor="name">Nome / Nome do negócio</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Studio Bela" maxLength={80} /></div>
                <div className="space-y-2"><Label htmlFor="email">E-mail</Label><Input id="email" value={profile?.email ?? ""} disabled /></div>
                <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="phone">Telefone</Label><Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" maxLength={20} /></div><div className="space-y-2"><Label htmlFor="whatsapp">WhatsApp</Label><Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 99999-9999" maxLength={20} /></div></div>
                {profile?.slug && <p className="text-sm text-muted-foreground">Seu link público: <span className="font-medium text-foreground">/agendar/{profile.slug}</span></p>}
                <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar alterações</Button>
              </form></CardContent>
            </Card>
            <Card className="border-destructive/30"><CardHeader><CardTitle className="text-destructive">Zona de perigo</CardTitle><CardDescription>A exclusão da conta é permanente e remove seus dados, incluindo agendamentos, serviços e disponibilidade.</CardDescription></CardHeader><CardContent><AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="destructive" className="w-full sm:w-auto"><UserRoundX className="mr-2 h-4 w-4" />Excluir minha conta</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir sua conta?</AlertDialogTitle><AlertDialogDescription>Esta ação é permanente. Seu perfil, agendamentos, serviços, horários e fotos serão excluídos e você será desconectado. Não será possível desfazer essa ação.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={deleteAccountMutation.isPending}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={(event) => { event.preventDefault(); deleteAccountMutation.mutate(); }} disabled={deleteAccountMutation.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleteAccountMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{deleteAccountMutation.isPending ? "Excluindo..." : "Sim, excluir minha conta"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></CardContent></Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
