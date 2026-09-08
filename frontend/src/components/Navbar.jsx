import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User } from "lucide-react";
import Logo from "./Logo";
import Button from "./Button";

const DEFAULT_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Contact", href: "#contact" },
];

/**
 * Public site navbar (Home / marketing pages) with a
 * responsive mobile menu. Not used on the authenticated
 * dashboard, which has its own sidebar.
 *
 * Props:
 *  - links: [{ label, href }]   nav links (default: Home/About/Features/Contact)
 */
export default function Navbar({ links = DEFAULT_LINKS }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Logo />

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-blue-600 transition"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 transition"
          >
            <User size={18} />
            Login
          </Link>
          <Button to="/register" size="sm">
            Get Started
          </Button>
        </div>

        <button
          className="md:hidden text-slate-700"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-100 px-6 py-4 space-y-4 bg-white">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-slate-600 hover:text-blue-600"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}

          <div className="flex flex-col gap-3 pt-2 border-t border-slate-100">
            <Link to="/login" className="text-blue-700 font-medium">
              Login
            </Link>
            <Button to="/register" className="w-full justify-center">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
