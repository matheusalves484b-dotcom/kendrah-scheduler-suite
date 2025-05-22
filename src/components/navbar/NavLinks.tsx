
import { Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

export const NavLink = ({ to, children }: NavLinkProps) => {
  const location = useLocation();
  
  // Check if the current path is the path we're linking to
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`transition-colors ${isActive 
        ? 'text-kendrah-purple font-medium' 
        : 'text-kendrah-black hover:text-kendrah-purple'}`}
    >
      {children}
    </Link>
  );
};

const NavLinks = () => {
  return (
    <>
      <NavLink to="/features">Funcionalidades</NavLink>
      <NavLink to="/pricing">Preços</NavLink>
      <NavLink to="/contact">Contato</NavLink>
      <NavLink to="/faq">FAQ</NavLink>
    </>
  );
};

export default NavLinks;
