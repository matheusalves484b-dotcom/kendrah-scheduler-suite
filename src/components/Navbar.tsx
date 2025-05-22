
import { Link } from 'react-router-dom';
import DesktopMenu from './navbar/DesktopMenu';
import MobileMenu from './navbar/MobileMenu';

const Navbar = () => {
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
          <DesktopMenu />
          
          {/* Mobile menu button */}
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
