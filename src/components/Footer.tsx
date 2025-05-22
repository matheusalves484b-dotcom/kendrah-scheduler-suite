import { Link } from 'react-router-dom';
import FooterSection from './footer/FooterSection';
import CopyrightInfo from './footer/CopyrightInfo';
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const quickLinks = [{
    label: 'Funcionalidades',
    url: '/features'
  }, {
    label: 'Preços',
    url: '/pricing'
  }, {
    label: 'Login',
    url: '/login'
  }, {
    label: 'Teste Grátis',
    url: '/register'
  }, {
    label: 'FAQ',
    url: '/faq'
  }];
  const supportLinks = [{
    label: 'Contato',
    url: '/contact'
  }, {
    label: 'FAQ',
    url: '/faq'
  }, {
    label: 'Termos de Uso',
    url: '/terms'
  }, {
    label: 'Política de Privacidade',
    url: '/privacy'
  }];
  return <footer className="text-white py-8 mt-auto bg-gray-950">
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
          
          <FooterSection title="Links Rápidos" links={quickLinks} />
          <FooterSection title="Suporte" links={supportLinks} />
        </div>
        
        <CopyrightInfo year={currentYear} />
      </div>
    </footer>;
};
export default Footer;