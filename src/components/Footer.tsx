
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1C1C1C] text-white py-8 mt-auto">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="text-2xl font-bold">
              Kendrah
            </Link>
            <p className="mt-4 text-gray-300 max-w-md">
              Automatize sua agenda. Simplifique sua rotina. Sistema de agendamentos profissional para prestadores de serviço.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-gray-300 hover:text-[#7D3C98] transition-colors">Funcionalidades</Link></li>
              <li><Link to="/pricing" className="text-gray-300 hover:text-[#7D3C98] transition-colors">Preços</Link></li>
              <li><Link to="/login" className="text-gray-300 hover:text-[#7D3C98] transition-colors">Login</Link></li>
              <li><Link to="/register" className="text-gray-300 hover:text-[#7D3C98] transition-colors">Teste Grátis</Link></li>
              <li><Link to="/faq" className="text-gray-300 hover:text-[#7D3C98] transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-gray-300 hover:text-[#7D3C98] transition-colors">Contato</Link></li>
              <li><Link to="/faq" className="text-gray-300 hover:text-[#7D3C98] transition-colors">FAQ</Link></li>
              <li><Link to="/terms" className="text-gray-300 hover:text-[#7D3C98] transition-colors">Termos de Uso</Link></li>
              <li><Link to="/privacy" className="text-gray-300 hover:text-[#7D3C98] transition-colors">Política de Privacidade</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">
            &copy; {currentYear} Kendrah. Todos os direitos reservados.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Facebook" 
              className="text-gray-400 hover:text-[#7D3C98] transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Instagram" 
              className="text-gray-400 hover:text-[#7D3C98] transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="Twitter" 
              className="text-gray-400 hover:text-[#7D3C98] transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
