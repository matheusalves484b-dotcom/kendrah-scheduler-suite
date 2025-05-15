
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-kendrah-gray/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-kendrah-purple">Kendrah</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/features" className="text-kendrah-black hover:text-kendrah-purple transition-colors">
              Funcionalidades
            </Link>
            <Link to="/pricing" className="text-kendrah-black hover:text-kendrah-purple transition-colors">
              Preços
            </Link>
            <Link to="/contact" className="text-kendrah-black hover:text-kendrah-purple transition-colors">
              Contato
            </Link>
            <Link to="/login">
              <Button variant="outline" className="border-kendrah-purple text-kendrah-purple hover:bg-kendrah-purple/10">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-kendrah-purple hover:bg-kendrah-purple/90">
                Teste Grátis
              </Button>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-kendrah-black focus:outline-none"
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
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Link to="/features" className="text-kendrah-black hover:text-kendrah-purple transition-colors py-2">
                Funcionalidades
              </Link>
              <Link to="/pricing" className="text-kendrah-black hover:text-kendrah-purple transition-colors py-2">
                Preços
              </Link>
              <Link to="/contact" className="text-kendrah-black hover:text-kendrah-purple transition-colors py-2">
                Contato
              </Link>
              <Link to="/login" className="py-2">
                <Button variant="outline" className="border-kendrah-purple text-kendrah-purple hover:bg-kendrah-purple/10 w-full">
                  Login
                </Button>
              </Link>
              <Link to="/register" className="py-2">
                <Button className="bg-kendrah-purple hover:bg-kendrah-purple/90 w-full">
                  Teste Grátis
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
