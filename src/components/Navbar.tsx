import { Link } from 'react-router-dom';
import DesktopMenu from './navbar/DesktopMenu';
import MobileMenu from './navbar/MobileMenu';

const Navbar = () => {
  return (
    <nav className="bg-background text-foreground border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-gradient">KENDRAH</span>
            </Link>
          </div>

          <DesktopMenu />
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
