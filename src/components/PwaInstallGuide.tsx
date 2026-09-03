import { useEffect, useState } from "react";
import { Download, Monitor, Share, Smartphone, X, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const INSTALL_SEEN_KEY = "kendrah-install-guide-seen";
const FIRST_LOGIN_PENDING_PREFIX = "kendrah-first-login-install-pending-";
const FIRST_LOGIN_SHOWN_PREFIX = "kendrah-first-login-install-shown-";
const OPEN_INSTALL_EVENT = "kendrah:open-install-guide";
const FIRST_LOGIN_EVENT = "kendrah:first-login-install";

const PwaInstallGuide = () => {
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
    setIsStandalone(standalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent) ||
      (/macintosh/.test(userAgent) && window.navigator.maxTouchPoints > 1);
    const desktop = !ios && !/android|mobile/i.test(userAgent);
    setIsIos(ios);
    setIsDesktop(desktop);

    const openGuide = () => {
      if (!standalone) {
        setIsFirstLogin(false);
        setOpen(true);
      }
    };

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const showFirstLoginGuide = (userId: string) => {
      const pendingKey = `${FIRST_LOGIN_PENDING_PREFIX}${userId}`;
      const shownKey = `${FIRST_LOGIN_SHOWN_PREFIX}${userId}`;
      if (localStorage.getItem(pendingKey) !== "true" || localStorage.getItem(shownKey) === "true") return;

      localStorage.removeItem(pendingKey);
      localStorage.setItem(shownKey, "true");
      window.setTimeout(() => {
        setIsFirstLogin(true);
        setOpen(true);
      }, 800);
    };

    const handleFirstLoginEvent = (event: Event) => {
      const userId = (event as CustomEvent<{ userId?: string }>).detail?.userId;
      if (userId && !standalone) showFirstLoginGuide(userId);
    };

    window.addEventListener(OPEN_INSTALL_EVENT, openGuide);
    window.addEventListener(FIRST_LOGIN_EVENT, handleFirstLoginEvent);
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    const alreadySeen = localStorage.getItem(INSTALL_SEEN_KEY) === "true";
    const timer = !standalone && !alreadySeen
      ? window.setTimeout(() => setOpen(true), 1500)
      : undefined;

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user && !standalone) {
        showFirstLoginGuide(session.user.id);
      }
    });

    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener(OPEN_INSTALL_EVENT, openGuide);
      window.removeEventListener(FIRST_LOGIN_EVENT, handleFirstLoginEvent);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      authListener.subscription.unsubscribe();
    };
  }, []);

  const close = () => {
    localStorage.setItem(INSTALL_SEEN_KEY, "true");
    setOpen(false);
    setIsFirstLogin(false);
  };

  const installPwa = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (choice.outcome === "accepted") close();
  };

  if (!open || isStandalone) return null;

  const platformLabel = isIos
    ? "iPhone / iPad — Safari"
    : isDesktop
      ? "Computador — Chrome, Edge ou navegador compatível"
      : "Celular — navegador compatível";

  return (
    <div className="fixed inset-x-0 bottom-4 z-[100] mx-auto w-[calc(100%-2rem)] max-w-lg sm:bottom-6">
      <Card className="border-kendrah-purple/30 bg-background/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kendrah-purple/10 text-kendrah-purple">
                {isDesktop ? <Monitor className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">{isFirstLogin ? "Bem-vindo ao KENDRAH!" : "Instale o KENDRAH"}</CardTitle>
                <CardDescription className="mt-1">
                  {isFirstLogin ? "Instale o KENDRAH como aplicativo para acessar seu sistema de agendamentos com mais rapidez." : "Tenha seu sistema de agendamentos sempre à mão, no celular ou computador."}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0" onClick={close} aria-label="Fechar orientação"><X className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <Badge variant="secondary">{platformLabel}</Badge>
          {isIos ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Para adicionar o KENDRAH à tela de início:</p>
              <ol className="space-y-3">
                <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kendrah-purple text-xs font-bold text-white">1</span><span>Abra esta página no <strong className="text-foreground">Safari</strong>.</span></li>
                <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kendrah-purple text-xs font-bold text-white">2</span><span>Toque em <strong className="text-foreground">Compartilhar</strong> no Safari.</span></li>
                <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kendrah-purple text-xs font-bold text-white">3</span><span>Role e toque em <strong className="text-foreground">Adicionar à Tela de Início</strong>.</span></li>
                <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kendrah-purple text-xs font-bold text-white">4</span><span>Toque em <strong className="text-foreground">Adicionar</strong>.</span></li>
              </ol>
              <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-xs"><Share className="h-4 w-4 shrink-0" /> No iPhone/iPad, a instalação é feita pelo Safari.</div>
            </div>
          ) : deferredPrompt ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">O KENDRAH está pronto para ser instalado neste dispositivo.</p>
              <Button className="w-full" onClick={installPwa}><Download className="mr-2 h-4 w-4" />Instalar agora</Button>
              <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-xs"><PlusSquare className="h-4 w-4 shrink-0" />O navegador abrirá a confirmação nativa de instalação.</div>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">O KENDRAH pode ser adicionado como aplicativo neste dispositivo.</p>
              <p>Abra o menu do navegador e procure por <strong className="text-foreground">Instalar KENDRAH</strong>, <strong className="text-foreground">Instalar aplicativo</strong> ou <strong className="text-foreground">Adicionar à tela inicial</strong>.</p>
            </div>
          )}
          <Button variant="outline" className="w-full" onClick={close}>Agora não</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PwaInstallGuide;
