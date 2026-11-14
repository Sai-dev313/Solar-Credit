import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: '3-Step Workflow', href: '#workflow' },
  { label: 'Prosumers & Consumers', href: '#roles' },
  { label: 'Blockchain Proof', href: '#blockchain-benefits' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
];

export const LandingNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface/90 backdrop-blur-md shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/15">
      <div className="h-16 w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-14 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm overflow-hidden shrink-0">
            <img
              src="/logo.svg"
              alt="SolarCredit Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
            SolarCredit
          </span>
        </Link>

        {/* Desktop Pill Navigation */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-surface-container-low"
        >
          <Link
            to="/marketplace"
            className="px-3.5 py-1.5 transition-colors bg-secondary-container text-on-secondary-container font-semibold rounded-full text-xs xl:text-sm"
          >
            Marketplace
          </Link>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleAnchorClick(e, item.href)}
              className="px-3 py-1.5 rounded-full font-label-md text-xs xl:text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <Link
            to="/auth"
            className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm hover:bg-secondary-container/50 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/auth?mode=signup"
            className="px-4 py-2 rounded-full bg-primary text-on-primary font-label-sm text-label-sm hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1"
          >
            <span>Get Started</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label="Toggle Menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Responsive Mobile & Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-container-lowest border-t border-outline-variant/20 px-4 pt-3 pb-6 shadow-lg">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleAnchorClick(e, item.href)}
                className="px-4 py-2.5 rounded-xl font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 rounded-xl font-label-md text-label-md text-primary hover:bg-surface-container-low transition-colors flex items-center justify-between"
            >
              <span>Explore Marketplace</span>
              <span className="material-symbols-outlined text-[18px]">storefront</span>
            </Link>
            <a
              href="#contact"
              onClick={(e) => handleAnchorClick(e, '#contact')}
              className="px-4 py-2.5 rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              Contact Us
            </a>
          </div>

          <div className="mt-4 pt-4 border-t border-outline-variant/20 grid grid-cols-2 gap-3">
            <Link
              to="/auth"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-4 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md text-center"
            >
              Sign In
            </Link>
            <Link
              to="/auth?mode=signup"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-4 rounded-full bg-primary text-on-primary font-label-md text-label-md text-center shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
