import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NavLinks from './NavLinks';
const DesktopMenu = () => {
  return <div className="hidden md:flex items-center space-x-8">
      <NavLinks />
      <Link to="/login">
        <Button variant="outline" className="border-kendrah-purple text-kendrah-purple hover:bg-kendrah-purple/10 bg-zinc-800 hover:bg-zinc-700 text-zinc-50">
          Login
        </Button>
      </Link>
      <Link to="/register">
        <Button className="bg-kendrah-purple hover:bg-kendrah-purple/90">
          Teste Grátis
        </Button>
      </Link>
    </div>;
};
export default DesktopMenu;