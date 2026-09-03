import { useEffect, useState } from "react";
import { Download, Monitor, Share, Smartphone, X, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const INSTALL_SEEN_KEY = "kendrah-install-guide-seen";

const PwaInstallGuide = () => {
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
    setIsStandalone(standalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    const desktop = !/android|iphone|ipad|ipod|mobile/i.test(userAgent);
    setIsIos(ios);
    setIsDesktop(desktop);

    const alreadySeen = localStorage.getItem(INSTALL_SEEN_KEY) === "true";
    if (!standalone && !alreadySeen) {
      // Sempre apresenta a orientação em dispositivos não instalados.
      // Se o navegador liberar o prompt nativo, o botão "Instalar agora"
      // aparece automaticamente assim que beforeinstallprompt for disparado.
      const timer = window.setTimeout(() => setOpen(true), 1500);

      const handleInstallPrompt = (event: Event) => {
        event.preventDefault();
        setDeferredPrompt(event as BeforeInstallPromptEvent);
        setOpen(true);
      };

      window.addEventListener("beforeinstallprompt", handleInstallPrompt);

      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      };
    }
  }, []);

  const close = () => {
    localStorage.setItem(INSTALL_SEEN_KEY, "true");
    setOpen(false);
  };

  const installPwa = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (choice.outcome === "accepted") {
      close();
    }
  };

  if (!open || isStandalone) return null;

  const platformLabel = isIos
    ? "iPhone / iPad — Safari"
    : isDesktop
      ? "Computador — Chrome, Edge ou navegador compatível"
      : "Celular — navegador compatível";

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-lg sm:bottom-6">
      <Card className="border-kendrah-purple/30 bg-background/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kendrah-purple/10 text-kendrah-purple">
                {isDesktop ? <Monitor className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Instale o KENDRAH</CardTitle>
                <CardDescription className="mt-1">Tenha seu sistema de agendamentos sempre à mão, no celular ou computador.</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0" onClick={close} aria-label="Fechar orientação">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          <Badge variant="secondary">{platformLabel}</Badge>

          {isIos ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Para adicionar o KENDRAH à tela de início:</p>
              <ol className="space-y-3">
                <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kendrah-purple text-xs font-bold text-white">1</span><span>Toque em <strong className="text-foreground">Compartilhar</strong> no Safari.</span></li>
                <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kendrah-purple text-xs font-bold text-white">2</span><span>Role o menu e toque em <strong className="text-foreground">Adicionar à Tela de Início</strong>.</span></li>
                <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kendrah-purple text-xs font-bold text-white">3</span><span>Toque em <strong className="text-foreground">Adicionar</strong> para concluir.</span></li>
              </ol>
              <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-xs"><Share className="h-4 w-4 shrink-0" /> No iPhone/iPad, a instalação é feita pelo Safari.</div>
            </div>
          ) : deferredPrompt ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">O KENDRAH está pronto para ser instalado neste dispositivo.</p>
              <Button className="w-full" onClick={installPwa}>
                <Download className="mr-2 h-4 w-4" />
                Instalar agora
              </Button>
              <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-xs">
                <PlusSquare className="h-4 w-4 shrink-0" />
                O navegador abrirá a confirmação nativa de instalação.
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">O KENDRAH pode ser adicionado como aplicativo neste dispositivo.</p>
              <p>Se o botão de instalação nativa ainda não estiver disponível, abra o menu do navegador e procure por <strong className="text-foreground">Instalar KENDRAH</strong> ou <strong className="text-foreground">Instalar aplicativo</strong>.</p>
              <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-xs">
                <PlusSquare className="h-4 w-4 shrink-0" />
                Quando o navegador liberar a instalação automática, o botão "Instalar agora" aparecerá aqui.
              </div>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={close}>Agora não</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PwaInstallGuide;
