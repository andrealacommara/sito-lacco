// ========================== MAIN IMPORTS ========================== //
// Responsive navigation bar built with plain markup + Tailwind.
// HeroUI v3 has no Navbar component, so it's hand-rolled here.

import { useEffect, useState } from "react"; // Local state for the mobile menu
import { Link, useLocation } from "react-router-dom"; // Client-side routing + active route
import clsx from "clsx"; // Conditional class names

import { siteConfig } from "@/config/site"; // App configuration including navbar items
import { ThemeSwitch } from "@/components/theme-switch"; // Toggle component for light/dark theme
import { Logo } from "@/components/icons"; // SVG logo component for branding
import { preloadRoute } from "@/routes/pages";

// ========================== COMPONENT: Navbar ========================== //
// Main application navigation bar (responsive)
// Handles desktop and mobile layouts, includes theme switch
export const Navbar = () => {
  const pathname = useLocation().pathname; // Track active route directly from router
  const [menuOpen, setMenuOpen] = useState(false); // Mobile menu visibility

  // Blocca lo scroll della pagina mentre il menu mobile è aperto
  useEffect(() => {
    if (!menuOpen) return;

    // Lo scroll container è <html> (:root ha overflow-y: auto), non <body>
    const root = document.documentElement;
    const previous = root.style.overflow;

    root.style.overflow = "hidden";

    return () => {
      root.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <>
      <nav
        className={clsx(
          "relative z-50",
          // Quando il menu è aperto la navbar diventa trasparente: il blur è
          // fornito dall'overlay del menu (una sola superficie => nessun seam)
          !menuOpen &&
            "bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70",
        )}
      >
        <div className="flex items-center px-6 h-16 w-full">
          {/* ================= BRAND / LOGO ================= */}
          <div className="flex flex-1 items-center justify-start">
            <Link
              className="flex items-center text-foreground transition-colors duration-300 hover:text-danger"
              title="Home"
              to="/"
            >
              <Logo />
            </Link>
          </div>

          {/* ================= MENU DESKTOP ================= */}
          <div className="hidden md:flex justify-center flex-1">
            <ul className="hidden md:flex flex-nowrap gap-4 justify-center">
              {siteConfig.navItems.map((item) => {
                const prefetch = () => preloadRoute(item.href);
                const active = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      className={clsx(
                        "whitespace-nowrap text-lg transition-colors duration-300 hover:text-danger",
                        active ? "text-danger font-medium" : "text-foreground",
                      )}
                      to={item.href}
                      onFocus={prefetch}
                      onMouseEnter={prefetch}
                      onTouchStart={prefetch}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ================= ACTIONS / THEME SWITCH (DESKTOP) ================= */}
          <div className="hidden md:flex flex-1 justify-end gap-2">
            <ThemeSwitch />
          </div>

          {/* ================= TOGGLE MOBILE ================= */}
          <div className="flex md:hidden items-center justify-end gap-2 ml-auto">
            <ThemeSwitch />
            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
              className="flex flex-col items-center justify-center gap-1.5 w-6 h-6 cursor-pointer"
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span
                className={clsx(
                  "block h-0.5 w-6 bg-current transition-transform duration-300",
                  menuOpen && "translate-y-2 rotate-45",
                )}
              />
              <span
                className={clsx(
                  "block h-0.5 w-6 bg-current transition-opacity duration-300",
                  menuOpen && "opacity-0",
                )}
              />
              <span
                className={clsx(
                  "block h-0.5 w-6 bg-current transition-transform duration-300",
                  menuOpen && "-translate-y-2 -rotate-45",
                )}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU: sibling del <nav> per uscire dallo stacking context
          creato da backdrop-blur (altrimenti finirebbe dietro il contenuto) */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/70">
          <ul className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 pt-16">
            {siteConfig.navMenuItems.map((item) => {
              const prefetch = () => preloadRoute(item.href);
              const active = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    className={clsx(
                      "text-2xl transition-colors duration-300 hover:text-danger",
                      active ? "text-danger" : "text-foreground",
                    )}
                    to={item.href}
                    onClick={() => setMenuOpen(false)}
                    onFocus={prefetch}
                    onMouseEnter={prefetch}
                    onTouchStart={prefetch}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
};
