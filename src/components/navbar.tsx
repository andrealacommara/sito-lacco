import { Link } from "@heroui/link";
import { useLocation } from "react-router-dom";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";
import { useEffect, useState } from "react";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";

// Navbar principale dell’applicazione
// Gestisce sia la versione desktop che mobile (responsive)
// Usa HeroUI per struttura e stile, React Router per il routing
export const Navbar = () => {
  const location = useLocation(); // Hook per ottenere la route attuale
  const [pathname, setPathname] = useState(location.pathname); // Stato per tenere traccia della pagina attiva

  // Aggiorna il pathname quando cambia la route
  useEffect(() => {
    setPathname(location.pathname);
  }, [location]);

  return (
    // Navbar di HeroUI: sticky in alto, max width impostata
    <HeroUINavbar maxWidth="xl" position="sticky">
      {/* ================= BRAND / LOGO ================= */}
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          {/* Link al logo: cliccandolo si torna alla home */}
          <Link
            className="flex justify-start items-center gap-1 transition-colors duration-300 hover:text-danger dark:hover:text-danger"
            color="foreground"
            href="/"
            title="Home"
          >
            <Logo />
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* ================= MENU DESKTOP ================= */}
      <NavbarContent className="flex justify-center" justify="center">
        {/* Mostrato solo da "md" in su (desktop) */}
        <div className="hidden md:flex gap-4 justify-center ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              {/* Link di navigazione */}
              <Link
                className={clsx(
                  linkStyles({
                    color: pathname === item.href ? "danger" : "foreground", // Evidenzia la pagina attiva in rosso
                  }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
                )}
                color={pathname === item.href ? "danger" : "foreground"}
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      {/* ================= AZIONI / THEME SWITCH ================= */}
      <NavbarContent className="hidden md:flex" justify="end">
        {/* Switch per cambiare tema chiaro/scuro (solo desktop) */}
        <NavbarItem className="hidden md:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
      </NavbarContent>

      {/* ================= MENU MOBILE (icona burger + theme switch) ================= */}
      <NavbarContent className="md:hidden  gap-3" justify="end">
        <ThemeSwitch /> {/* Switch visibile anche su mobile */}
        <NavbarMenuToggle /> {/* Bottone per aprire/chiudere il menu mobile */}
      </NavbarContent>

      {/* ================= CONTENUTO DEL MENU MOBILE ================= */}
      <NavbarMenu>
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4 p-6">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              {/* Ogni voce del menu mobile */}
              <Link
                className="text-xl"
                color={pathname === item.href ? "danger" : "foreground"}
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
