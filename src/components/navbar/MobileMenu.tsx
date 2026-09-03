import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NavLinks, { NavLink } from './NavLinks';

const MobileMenu = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="text-foreground focus:outline-none"
        aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
      >
        {!isMobileMenuOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>

      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 animate-fade-in bg-background">
          <div className="flex flex-col space-y-4">
            <Link to="/features" className="py-2" onClick={() => setIsMobileMenuOpen(false)}>
              <NavLink to="/features">Funcionalidades</NavLink>
            </Link>
            <Link to="/pricing" className="py-2" onClick={() => setIsMobileMenuOpen(false)}>
              <NavLink to="/pricing">Preços</NavLink>
            </Link>
            <Link to="/contact" className="py-2" onClick={() => setIsMobileMenuOpen(false)}>
              <NavLink to="/contact">Contato</NavLink>
            </Link>
            <Link to="/faq" className="py-2" onClick={() => setIsMobileMenuOpen(false)}>
              <NavLink to="/faq">FAQ</NavLink>
            </Link>
            <Link to="/login" className="py-2" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="outline" className="border-border bg-muted text-kendrah-purple hover:bg-accent hover:text-kendrah-purple w-full">
                Login
              </Button>
            </Link>
            <Link to="/register" className="py-2" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="bg-kendrah-purple hover:bg-kendrah-purple/90 w-full">
                Teste Grátis
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMenu;
