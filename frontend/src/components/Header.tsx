import React from 'react';
import { NavLink } from 'react-router-dom';
import logoLight from '../assets/Logo2 - Light cropped.svg';

const Header: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive
        ? 'text-primary border-b-2 border-primary pb-0.5'
        : 'text-gray-500 hover:text-gray-800'
    }`;

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src={logoLight}
              alt="EverettYoung LLC"
              className="h-10 w-auto"
              style={{ minWidth: '120px' }}
            />
          </div>

          {/* App Title + Nav */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-semibold text-gray-800">
              Value Curve
            </h1>
            <nav className="mt-1 flex items-center justify-center gap-6">
              <NavLink to="/" end className={linkClass}>
                Visualization
              </NavLink>
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            </nav>
          </div>

          {/* Spacer for balance */}
          <div className="w-[120px]"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
