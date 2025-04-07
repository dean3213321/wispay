import React, { useState, useEffect, useRef } from 'react';
import '../styling/Navbar.css';
import logoSrc from '../assets/wislogo.png';
import { FaUserCircle } from 'react-icons/fa';

function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const arrowRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        arrowRef.current &&
        !arrowRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-content-left">
        <img src={logoSrc} alt="Westfields Logo" className="navbar-logo" />
        <span className="navbar-title">
          Westfields International School - WISpay
        </span>
        <span
          ref={arrowRef}
          className="navbar-dropdown-arrow"
          onClick={toggleDropdown}
        >
          ▼
        </span>

        {isDropdownOpen && (
          <div ref={dropdownRef} className="navbar-dropdown-menu">
            <div className="navbar-dropdown-title">Modules</div>
            <ul>
              <li><a href="#payment">Payment</a></li>
              <li><a href="#products">Products</a></li>
              <li><a href="#reports">Reports</a></li>
              <li><a href="#students">Students</a></li>
              <li><a href="#employees">Employees</a></li>
            </ul>
          </div>
        )}
      </div>

      <div className="navbar-content-right">
        <FaUserCircle className="navbar-user-icon" />
      </div>
    </nav>
  );
}

export default Navbar;