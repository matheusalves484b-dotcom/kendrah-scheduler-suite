import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CalendarIcon, Users, Settings, Package, Clock, CreditCard, Menu, X, UserCircle, ShieldCheck, UserPlus, Download } from 'lucide-react';
import { cn } from "@/lib/utils";
import LogoutButton from '@/components/LogoutButton';
import { supabase } from '@/integrations/supabase/client';

const OPEN_INSTALL_EVENT = "kendrah:open-install-guide";

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    const loadAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
      if (active) setIsAdmin(data?.is_admin === true);
    };
    loadAdminStatus();

    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator && Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));
    setIsStandalone(standalone);

    return () => { active = false; };
  }, [location.pathname]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: <CalendarIcon className="h-5 w-5" /> },
    { name: "Agenda", href: "/dashboard/calendar", icon: <CalendarIcon className="h-5 w-5" /> },
    { name: "Serviços", href: "/dashboard/services", icon: <Package className="h-5 w-5" /> },
    { name: "Clientes", href: "/dashboard/clients", icon: <Users className="h-5 w-5" /> },
    { name: "Disponibilidade", href: "/dashboard/availability", icon: <Clock className="h-5 w-5" /> },
    { name: "Equipe", href: "/dashboard/team", icon: <UserPlus className="h-5 w-5" /> },
    { name: "Assinatura", href: "/dashboard/subscription", icon: <CreditCard className="h-5 w-5" /> },
    { name: "Meu perfil", href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
    { name: "Configurações", href: "/dashboard/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  if (isAdmin) navItems.push({ name: "Administração", href: "/admin/ambassadors", icon: <ShieldCheck className="h-5 w-5" /> });

  const openInstallGuide = () => {
    window.dispatchEvent(new Event(OPEN_INSTALL_EVENT));
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <button type="button" className="lg:hidden fixed top-4 left-4 z-40 rounded-md p-2 bg-white dark:bg-card shadow-md text-gray-600 dark:text-gray-200" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div className={cn("lg:block fixed inset-y-0 left-0 z-30 w-64 transform bg-white dark:bg-card border-r border-gray-200 dark:border-border transition-transform duration-300 ease-in-out", isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        <div className="flex flex-col h-full">
          <div className="px-4 py-6 border-b border-gray-200 dark:border-border"><NavLink to="/dashboard" className="flex items-center"><span className="text-2xl font-bold text-kendrah-purple">Kendrah</span></NavLink></div>
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => <NavLink key={item.href} to={item.href} className={({ isActive }) => cn("flex items-center px-4 py-3 text-sm rounded-lg transition-colors", isActive ? "bg-kendrah-purple text-white" : "text-gray-700 dark:text-gray-200 hover:bg-kendrah-purple/10 hover:text-kendrah-purple")} onClick={() => setIsMobileMenuOpen(false)}>{item.icon}<span className="ml-3">{item.name}</span></NavLink>)}
            {!isStandalone && (
              <button
                type="button"
                onClick={openInstallGuide}
                className="flex w-full items-center rounded-lg px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-kendrah-purple/10 hover:text-kendrah-purple dark:text-gray-200"
              >
                <Download className="h-5 w-5" />
                <span className="ml-3">Instalar aplicativo</span>
              </button>
            )}
          </nav>
          <div className="px-4 py-4 border-t border-gray-200 dark:border-border"><div className="flex items-center justify-between"><div className="flex items-center"><div className="h-8 w-8 rounded-full bg-kendrah-purple/20 flex items-center justify-center text-kendrah-purple font-bold">U</div><div className="ml-3"><p className="text-sm font-medium text-gray-700 dark:text-gray-200">Usuário</p></div></div><LogoutButton className="text-gray-500 hover:text-red-500 dark:text-gray-400" /></div></div>
        </div>
      </div>
      {isMobileMenuOpen && <div className="lg:hidden fixed inset-0 z-20 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>}
    </>
  );
};

export default Sidebar;
