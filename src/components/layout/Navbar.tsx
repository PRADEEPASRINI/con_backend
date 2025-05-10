import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Scissors, LayoutDashboard, FilePlus2, ClipboardList } from "lucide-react";

interface NavbarProps {
  onLoginClick?: () => void;
}

const navItems = [
  { name: "Quality Control", icon: <Scissors className="h-5 w-5" />, to: "/quality-control" },
  { name: "Cutting Management", icon: <Scissors className="h-5 w-5" />, to: "/cutting-management" },
  { name: "Stitching Process", icon: <Scissors className="h-5 w-5" />, to: "/stitching-process" },
  { name: "Analytics", icon: <Scissors className="h-5 w-5" />, to: "/analytics" },
];

const Navbar: React.FC<NavbarProps> = () => {
  const location = useLocation();

  return (
    <nav className="fixed left-0 top-0 z-10 h-screen w-64 bg-zinc-900 shadow-lg text-white flex flex-col">
      {/* Logo / Title */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-zinc-700">
        <Scissors className="h-6 w-6" />
        <span className="text-lg font-semibold">Garment Production Management</span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.to}
            className={`flex items-center gap-3 px-6 py-3 text-sm hover:bg-zinc-800 transition ${
              location.pathname === item.to ? "bg-zinc-800" : ""
            }`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </div>

      {/* Logout at bottom */}
      <div className="border-t border-zinc-700 px-6 py-4">
        
      </div>
    </nav>
  );
};

export default Navbar;
