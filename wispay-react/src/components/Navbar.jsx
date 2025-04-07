import '../styling/Navbar.css';
import logoSrc from '../assets/wislogo.png';
import { FaUserCircle } from 'react-icons/fa';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-content-left">
        <img src={logoSrc} alt="Westfields Logo" className="navbar-logo" />
        <span className="navbar-title">
          Westfields International School - WISpay
        </span>
        <span className="navbar-dropdown-arrow">▼</span>
      </div>

      <div className="navbar-content-right">
        <FaUserCircle className="navbar-user-icon" />
      </div>
    </nav>
  );
}

export default Navbar;