
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CalendarIcon, Users, Settings, Package, Clock, CreditCard, Menu, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import LogoutButton from '@/components/LogoutButton';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <CalendarIcon className="h-5 w-5" />,
    },
    {
      name: "Agenda",
      href: "/dashboard/calendar",
      icon: <CalendarIcon className="h-5 w-5" />,
    },
    {
      name: "Serviços",
      href: "/dashboard/services",
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: "Clientes",
      href: "/dashboard/clients",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Disponibilidade",
      href: "/dashboard/availability",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      name: "Assinatura",
      href: "/dashboard/subscription",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      name: "Configurações",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-40 rounded-md p-2 bg-white shadow-md text-gray-600"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar for mobile and desktop */}
      <div
        className={cn(
          "lg:block fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="px-4 py-6 border-b border-gray-200">
            <NavLink to="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-kendrah-purple">Kendrah</span>
            </NavLink>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-3 text-sm rounded-lg transition-colors",
                    isActive
                      ? "bg-kendrah-purple text-white"
                      : "text-gray-700 hover:bg-kendrah-purple/10 hover:text-kendrah-purple"
                  )
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* User & logout area */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-kendrah-purple/20 flex items-center justify-center text-kendrah-purple font-bold">
                  U
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">Usuário</p>
                </div>
              </div>
              <LogoutButton className="text-gray-500 hover:text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
