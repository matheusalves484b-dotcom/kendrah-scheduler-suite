import { useEffect, useState } from "react";
import { Download, Share, Smartphone, X, PlusSquare } from "lucide-react";
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

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
    setIsStandalone(standalone);

    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsIos(ios);

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    const alreadySeen = localStorage.getItem(INSTALL_SEEN_KEY) === "true";
    if (!standalone && !alreadySeen) {
      const timer = window.setTimeout(() => setOpen(true), 1200);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
  }, []);

  const close = () => {
    localStorage.setItem(INSTALL_SEEN_KEY, "true");
    setOpen(false);
  };

  const installAndroid = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (choice.outcome === "accepted") close();
  };

  if (!open || isStandalone) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-lg px-0 sm:bottom-6">
      <Card className="border-kendrah-purple/30 bg-background/95 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kendrah-purple/10 text-kendrah-purple">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Tenha o Kendrah na tela inicial</CardTitle>
                <CardDescription className="mt-1">Acesse sua agenda como se fosse um aplicativo.</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0" onClick={close} aria-label="Fechar orientação">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          {isIos ? (
            <div className="space-y-3 text-sm text-muted-foreground">
              <Badge variant="secondary">iPhone / iPad — Safari</Badge>
              <ol className="space-y-3">
                <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kendrah-purple text-xs font-bold text-white">1</span><span>Toque no botão <strong className="text-foreground">Compartilhar</strong> (quadrado com seta para cima) no Safari.</span></li>
                <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kendrah-purple text-xs font-bold text-white">2</span><span>Role o menu e toque em <strong className="text-foreground">Adicionar à Tela de Início</strong>.</span></li>
                <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kendrah-purple text-xs font-bold text-white">3</span><span>Confirme em <strong className="text-foreground">Adicionar</strong>. O ícone do Kendrah aparecerá na sua tela inicial.</span></li>
              </ol>
              <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-xs"><Share className="h-4 w-4 shrink-0" /> Use o Safari para que a opção de adicionar à tela inicial apareça.</div>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-muted-foreground">
              <Badge variant="secondary">Android — Chrome</Badge>
              {deferredPrompt ? (
                <>
                  <p>Instale o Kendrah agora com um toque:</p>
                  <Button className="w-full" onClick={installAndroid}><Download className="mr-2 h-4 w-4" />Adicionar à tela inicial</Button>
                </>
              ) : (
                <ol className="space-y-3">
                  <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kendrah-purple text-xs font-bold text-white">1</span><span>Abra o menu <strong className="text-foreground">⋮</strong> do Chrome.</span></li>
                  <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kendrah-purple text-xs font-bold text-white">2</span><span>Toque em <strong className="text-foreground">Instalar aplicativo</strong> ou <strong className="text-foreground">Adicionar à tela inicial</strong>.</span></li>
                  <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kendrah-purple text-xs font-bold text-white">3</span><span>Confirme a instalação. O Kendrah ficará disponível como aplicativo.</span></li>
                </ol>
              )}
              <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-xs"><PlusSquare className="h-4 w-4 shrink-0" /> O nome da opção pode variar conforme a versão do Android/Chrome.</div>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={close}>Entendi</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PwaInstallGuide;
