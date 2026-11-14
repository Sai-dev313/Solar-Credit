import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/hooks/useApp';
import { authService } from '@/services/auth.service';
import { displayName, getInitials } from '@/utils/profile';

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: string;
}

interface DashboardShellProps {
  portalLabel: string;
  children: React.ReactNode;
  /** Optional in-page sections shown in the sidebar under Dashboard. */
  navItems?: SidebarNavItem[];
  navTitle?: string;
  activeNavId?: string;
  onNavSelect?: (id: string) => void;
  /** Called when Dashboard (or the logo) is clicked, so the page can reset to its overview. */
  onDashboardSelect?: () => void;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  portalLabel,
  children,
  navItems,
  navTitle,
  activeNavId,
  onNavSelect,
  onDashboardSelect,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, resetDemo } = useApp();
  // Below lg the sidebar is a slide-in drawer opened from the header's menu button
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileNavOpen && !profileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMobileNavOpen(false);
      setProfileMenuOpen(false);
    };
    // Close the profile menu when clicking anywhere outside it
    const onPointerDown = (e: PointerEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [mobileNavOpen, profileMenuOpen]);

  const isProducer = profile.role === 'prosumer';
  const dashboardPath = isProducer ? '/prosumer' : '/consumer';
  const resolvedPortalLabel = isProducer ? 'Producer Portal' : 'Consumer Portal';

  // Dashboard always goes back to the top of the dashboard overview, whether the user is
  // on another page, deep in a section, or scrolled down.
  const handleDashboardClick = () => {
    setMobileNavOpen(false);
    onDashboardSelect?.();
    window.scrollTo({ top: 0, behavior: location.pathname === dashboardPath ? 'smooth' : 'auto' });
  };

  const handleLogout = async () => {
    await authService.signOut();
    navigate('/auth');
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen">
      {/* Backdrop behind the drawer on small screens */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-[45] bg-black/40 lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Stitch Fixed Left Sidebar — Strictly scoped to the logged-in role.
          Always visible from lg up; a slide-in drawer below that. */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-tertiary-container z-50 flex flex-col justify-between overflow-y-auto shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-transform duration-200 lg:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'rgb(6, 78, 59)' }}
      >
        <div className="flex flex-col">
          <Link
            to={dashboardPath}
            onClick={handleDashboardClick}
            className="h-16 px-6 flex items-center gap-2.5"
          >
            <span className="material-symbols-outlined text-[24px] text-white">bolt</span>
            <span className="text-xl md:text-2xl font-bold tracking-tight text-white">
              SolarCredit
            </span>
          </Link>

          <nav className="flex flex-col gap-1.5 px-4 pt-6">
            <Link
              to={dashboardPath}
              onClick={handleDashboardClick}
              className="flex items-center gap-3 px-4 py-3 transition-all font-label-md text-label-md rounded-xl text-white"
              style={
                location.pathname === dashboardPath && !activeNavId
                  ? {
                      backgroundColor: 'rgb(20, 110, 56)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }
                  : undefined
              }
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
              <span>Dashboard</span>
            </Link>

            {navItems && navItems.length > 0 && (
              <>
                {navTitle && (
                  <span className="px-4 pt-5 pb-1 font-label-sm text-label-sm uppercase tracking-wider text-white/50">
                    {navTitle}
                  </span>
                )}
                {navItems.map((item) => {
                  const isActive = activeNavId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setMobileNavOpen(false);
                        onNavSelect?.(item.id);
                      }}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-label-md text-label-md text-left transition-all cursor-pointer ${
                        isActive ? 'text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
                      }`}
                      style={
                        isActive
                          ? {
                              backgroundColor: 'rgb(20, 110, 56)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            }
                          : undefined
                      }
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </>
            )}

            <Link
              to="/blockchain"
              onClick={() => setMobileNavOpen(false)}
              className={`mt-3 flex items-center gap-3 px-4 py-2.5 rounded-xl font-label-md text-label-md transition-all ${
                location.pathname === '/blockchain' ? 'text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
              }`}
              style={
                location.pathname === '/blockchain'
                  ? { backgroundColor: 'rgb(20, 110, 56)', border: '1px solid rgba(255, 255, 255, 0.1)' }
                  : undefined
              }
            >
              <span className="material-symbols-outlined text-[20px]">verified</span>
              <span>Blockchain Proof</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 space-y-1">
          <button
            type="button"
            onClick={resetDemo}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-label-sm text-label-sm text-tertiary-fixed-dim hover:bg-tertiary hover:text-white transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            <span>Reset Demo State</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-label-md text-label-md text-tertiary-fixed-dim hover:bg-tertiary hover:text-white transition-all cursor-pointer group"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:scale-105">
              logout
            </span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="lg:pl-64">
        <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden -ml-2 w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              aria-label="Open menu"
              aria-expanded={mobileNavOpen}
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/20 text-on-secondary-container font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Grid Connected
            </span>
            <span className="text-outline-variant">/</span>
            <span className="font-label-md text-label-md text-on-surface-variant">
              {portalLabel || resolvedPortalLabel}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px] text-primary">
                {isProducer ? 'solar_power' : 'electric_bolt'}
              </span>
              {isProducer ? 'Producer Account' : 'Consumer Account'}
            </span>
            <button
              type="button"
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
              title="Notifications"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((o) => !o)}
                className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold cursor-pointer ring-offset-2 ring-offset-surface hover:ring-2 hover:ring-primary/40 transition-shadow"
                aria-label="Open profile menu"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                title={displayName(profile.fullName)}
              >
                {getInitials(profile.fullName)}
              </button>

              {profileMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-12 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-surface-container-lowest shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-outline-variant/20 overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-4 border-b border-outline-variant/20">
                    <div className="w-11 h-11 shrink-0 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">
                      {getInitials(profile.fullName)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-label-md text-label-md text-on-surface font-semibold truncate">
                        {displayName(profile.fullName)}
                      </div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        {profile.email}
                      </div>
                      <div className="font-label-sm text-label-sm text-primary mt-0.5">
                        {isProducer ? 'Producer' : 'Consumer'} • {profile.creditBalance} CC
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/profile"
                      role="menuitem"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px] text-primary">person</span>
                      My Profile
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                        logout
                      </span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="w-full pt-16 bg-surface px-4 md:px-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};
