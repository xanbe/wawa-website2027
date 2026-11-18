"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import { NAV, contactInfo } from "./navigation";
import { ROUTES, langFromPath } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";


function NewBadge() {
  return (
    <span className="bg-wawa-accent px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-wawa-charcoal">
      Yeni
    </span>
  );
}

// El yazısı imza: her satır soldan sağa, kalem ilerliyormuş gibi yumuşak kenarlı bir maskeyle açılır.
// play değiştiğinde yeniden oynar; hareket azaltıldığında doğrudan görünür (globals.css).
function Signature({ lines, play, className }: { lines: string[]; play: boolean; className: string }) {
  return (
    <span className={`block font-hand ${className}`} aria-label={lines.join(" ")}>
      {lines.map((line, i) => (
        <span
          key={`${line}-${play}`}
          aria-hidden
          // El yazısı harfler kutudan taşar; maske kesmesin diye kutu dolgu kadar genişletilip boşlukla geri çekilir
          className={`-mx-[0.3em] -my-[0.15em] block w-fit px-[0.3em] py-[0.15em] ${play ? "signature-write" : "opacity-0"}`}
          style={{ animationDelay: `${150 + i * 900}ms` }}
        >
          {line}
        </span>
      ))}
    </span>
  );
}

function Logo({ onClick, href = "/" }: { onClick?: () => void; href?: string }) {
  return (
    <Link href={href} onClick={onClick} className="flex flex-col leading-none" aria-label="WAWA Interiors anasayfa">
      <span className="text-[28px] font-bold tracking-tight text-wawa-charcoal">WAWA</span>
      <span className="mt-1 text-[9px] font-medium tracking-[0.62em] text-wawa-gray">INTERIORS</span>
    </Link>
  );
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname() ?? "/";
  // Menü, bulunulan sayfanın dilinde gösterilir
  const lang = langFromPath(pathname);
  const { main, servicesLabel, serviceGroups, singleServices, menuInvite, start, ai, strip, allProjects, menu } = NAV[lang];
  const servicePaths = [...serviceGroups.flatMap((g) => [g.href, ...g.items.map((i) => i.href)]), "/service/"];
  // "Neler Yapıyoruz?" menüsü Hakkımızda'dan sonra gelir
  const navBefore = main.slice(0, 2);
  const navAfter = main.slice(2);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Escape ile mega menüyü kapat
  useEffect(() => {
    if (!isMegaOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMegaOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isMegaOpen]);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsMegaOpen(true);
  };

  // Fare tetikleyiciden panele geçerken menü kapanmasın diye kısa gecikme
  const scheduleCloseMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setIsMegaOpen(false), 150);
  };

  const closeMenus = () => {
    setIsMegaOpen(false);
    setIsMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === ROUTES[lang].home) return pathname === href || pathname === href.replace(/\/$/, "");
    return pathname === href || pathname === href.replace(/\/$/, "") || pathname.startsWith(href);
  };

  const isServicesActive = servicePaths.some(isActive);

  const desktopLinkClass = (active: boolean) =>
    `relative flex h-20 items-center px-4 text-[13px] font-medium uppercase tracking-[0.08em] transition-colors ${
      active ? "text-wawa-charcoal" : "text-wawa-gray hover:text-wawa-charcoal"
    }`;

  const renderDesktopLink = (item: { name: string; href: string }) => (
    <Link key={item.href} href={item.href} className={desktopLinkClass(isActive(item.href))}>
      {item.name}
      {isActive(item.href) && <span className="absolute inset-x-4 bottom-5 h-[2px] bg-wawa-charcoal" />}
    </Link>
  );

  const mobileRowClass = (active: boolean) =>
    `flex w-full items-center justify-between border-b border-black/10 py-4 text-lg transition-colors ${
      active ? "font-semibold text-wawa-charcoal" : "font-medium text-wawa-charcoal/80 hover:text-wawa-charcoal"
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300 ${
        isScrolled || isMegaOpen ? "shadow-[0_8px_30px_rgba(0,0,0,0.06)]" : ""
      }`}
    >
      {/* Üst iletişim şeridi: sayfa kayarken de menüyle birlikte görünür kalır */}
      <div className="hidden bg-[#F3F2EF] lg:block">
        <div className="container-wide flex h-9 items-center justify-between text-[13px]">
          <div className="flex items-center gap-6 text-wawa-gray">
            <a href={contactInfo.phoneHref} className="flex items-center gap-2 hover:text-wawa-charcoal">
              <Phone className="h-3.5 w-3.5" />
              {contactInfo.phoneDisplay}
            </a>
            <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-2 hover:text-wawa-charcoal">
              <Mail className="h-3.5 w-3.5" />
              {contactInfo.email}
            </a>
            <a
              href={contactInfo.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-wawa-charcoal"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          </div>
          <div className="flex items-center gap-6">
            <Link href={ai.href} className="flex items-center gap-2 font-medium text-wawa-charcoal hover:opacity-70">
              <span className="grid h-5 w-5 place-items-center bg-wawa-accent">
                <Sparkles className="h-3 w-3" />
              </span>
              {ai.label}
            </Link>
            <span aria-hidden className="h-4 w-px bg-wawa-charcoal/15" />
            <LanguageSwitcher className="-mx-2.5" />
          </div>
        </div>
      </div>

      <div className="container-wide">
        <nav className="flex h-20 items-center justify-between" aria-label="Ana menü">
          <Logo href={ROUTES[lang].home} />

          {/* Masaüstü menü */}
          <div className="hidden items-center lg:flex">
            {navBefore.map(renderDesktopLink)}

            <div onMouseEnter={openMega} onMouseLeave={scheduleCloseMega}>
              <button
                type="button"
                onClick={() => setIsMegaOpen((open) => !open)}
                aria-expanded={isMegaOpen}
                aria-controls="mega-menu"
                className={`${desktopLinkClass(isServicesActive || isMegaOpen)} cursor-pointer gap-1.5`}
              >
                {servicesLabel}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${isMegaOpen ? "rotate-180" : ""}`}
                />
                {(isServicesActive || isMegaOpen) && (
                  <span className="absolute inset-x-4 bottom-5 h-[2px] bg-wawa-charcoal" />
                )}
              </button>
            </div>

            {navAfter.map(renderDesktopLink)}
          </div>

          <div className="hidden lg:block">
            <Link href={ROUTES[lang].offer}>
              <Button className="h-11 rounded-none bg-wawa-accent px-6 text-sm font-semibold text-wawa-charcoal hover:bg-wawa-accent-hover">
                {start}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobil menü */}
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-wawa-charcoal hover:bg-black/5">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{menu}</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-full gap-0 border-l border-black/10 bg-white p-0 text-wawa-charcoal sm:max-w-[420px]"
              >
                <SheetTitle className="sr-only">Menü</SheetTitle>
                <div className="flex h-full flex-col">
                  <div className="flex h-20 shrink-0 items-center border-b border-black/10 px-6">
                    <Logo onClick={closeMenus} href={ROUTES[lang].home} />
                  </div>

                  <nav className="flex-1 overflow-y-auto px-6 py-2" aria-label="Mobil menü">
                    {navBefore.map((item) => (
                      <Link key={item.href} href={item.href} onClick={closeMenus} className={mobileRowClass(isActive(item.href))}>
                        {item.name}
                        {isActive(item.href) && <span className="h-2 w-2 bg-wawa-accent" />}
                      </Link>
                    ))}

                    <button
                      type="button"
                      onClick={() => setIsMobileServicesOpen((open) => !open)}
                      aria-expanded={isMobileServicesOpen}
                      className={`${mobileRowClass(isServicesActive)} cursor-pointer`}
                    >
                      {servicesLabel}
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-200 ${isMobileServicesOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isMobileServicesOpen && (
                      <div className="space-y-6 border-b border-black/10 py-5">
                        {serviceGroups.map((group) => (
                          <div key={group.title}>
                            <Link
                              href={group.href}
                              onClick={closeMenus}
                              className="mb-2 flex items-baseline gap-2 text-sm font-semibold uppercase tracking-wider text-wawa-charcoal"
                            >
                              <span className="bg-wawa-accent px-1 text-xs">{group.number}</span>
                              {group.title}
                            </Link>
                            <ul className="border-l border-black/10 pl-5">
                              {group.items.map((item) => (
                                <li key={item.href}>
                                  <Link
                                    href={item.href}
                                    onClick={closeMenus}
                                    className={`flex items-center gap-2 py-2 text-[15px] ${
                                      isActive(item.href)
                                        ? "font-semibold text-wawa-charcoal"
                                        : "text-wawa-gray hover:text-wawa-charcoal"
                                    }`}
                                  >
                                    {item.name}
                                    {item.isNew && <NewBadge />}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}

                        {singleServices.map((service) => (
                          <Link
                            key={service.title}
                            href={service.href}
                            onClick={closeMenus}
                            className="flex items-baseline gap-2 text-sm font-semibold uppercase tracking-wider text-wawa-charcoal"
                          >
                            <span className="bg-wawa-accent px-1 text-xs">{service.number}</span>
                            {service.title}
                          </Link>
                        ))}

                        <Link href={menuInvite.href} onClick={closeMenus} className="block bg-wawa-accent p-5 text-wawa-charcoal">
                          <Signature lines={menuInvite.signature} play={isMobileServicesOpen} className="text-[34px] leading-[1.1]" />
                          <span className="mt-2 flex items-center justify-between gap-3 text-[15px]">
                            {menuInvite.text}
                            <ArrowRight className="h-4 w-4 shrink-0" />
                          </span>
                        </Link>
                      </div>
                    )}

                    {navAfter.map((item) => (
                      <Link key={item.href} href={item.href} onClick={closeMenus} className={mobileRowClass(isActive(item.href))}>
                        {item.name}
                        {isActive(item.href) && <span className="h-2 w-2 bg-wawa-accent" />}
                      </Link>
                    ))}
                  </nav>

                  <div className="shrink-0 space-y-3 border-t border-black/10 bg-wawa-cream p-6">
                    <Link href={ROUTES[lang].offer} onClick={closeMenus} className="block">
                      <Button className="h-12 w-full rounded-none bg-wawa-accent text-sm font-semibold text-wawa-charcoal hover:bg-wawa-accent-hover">
                        {start}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <div className="grid gap-3">
                      <Link
                        href={ai.href}
                        onClick={closeMenus}
                        className="flex h-11 items-center justify-center gap-2 border border-black/10 bg-white text-xs font-medium text-wawa-charcoal hover:border-black/30"
                      >
                        <Sparkles className="h-4 w-4" />
                        {ai.short}
                      </Link>
                    </div>
                    <LanguageSwitcher variant="sheet" onNavigate={closeMenus} />
                    <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 pt-2 text-xs text-wawa-gray">
                      <a href={contactInfo.phoneHref} className="hover:text-wawa-charcoal">{contactInfo.phoneDisplay}</a>
                      <a href={`mailto:${contactInfo.email}`} className="hover:text-wawa-charcoal">{contactInfo.email}</a>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>

      {/* Mega menü - Neler Yapıyoruz? */}
      <div
        id="mega-menu"
        onMouseEnter={openMega}
        onMouseLeave={scheduleCloseMega}
        className={`absolute inset-x-0 top-full hidden border-t border-black/5 bg-white shadow-[0_24px_48px_rgba(0,0,0,0.08)] transition-all duration-200 lg:block ${
          isMegaOpen ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-2 opacity-0"
        }`}
      >
        <div className="container-wide grid grid-cols-12 gap-8 py-10">
          {serviceGroups.map((group) => (
            <div key={group.title} className="col-span-3">
              <Link
                href={group.href}
                onClick={closeMenus}
                className="group/title mb-3 flex items-start gap-3 border-b border-black/10 pb-5"
              >
                <span className="mt-1 bg-wawa-accent px-1.5 py-0.5 text-[11px] font-semibold leading-none text-wawa-charcoal">
                  {group.number}
                </span>
                <span>
                  <span className="block text-lg font-semibold leading-snug text-wawa-charcoal underline-offset-4 group-hover/title:underline">
                    {group.title}
                  </span>
                  <span className="mt-1 block text-sm text-wawa-light-gray">{group.description}</span>
                </span>
              </Link>
              <ul>
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMenus}
                      className={`group/item flex items-center justify-between py-2.5 pl-9 pr-2 text-[15px] transition-colors ${
                        isActive(item.href)
                          ? "font-semibold text-wawa-charcoal"
                          : "text-wawa-gray hover:bg-wawa-cream hover:text-wawa-charcoal"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {item.name}
                        {item.isNew && <NewBadge />}
                      </span>
                      <ArrowRight className="h-4 w-4 -translate-x-2 text-wawa-charcoal opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-3 space-y-8">
            {singleServices.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                onClick={closeMenus}
                className="group/title flex items-start gap-3 border-b border-black/10 pb-5"
              >
                <span className="mt-1 bg-wawa-accent px-1.5 py-0.5 text-[11px] font-semibold leading-none text-wawa-charcoal">
                  {service.number}
                </span>
                <span>
                  <span className="flex items-center gap-2 text-lg font-semibold leading-snug text-wawa-charcoal underline-offset-4 group-hover/title:underline">
                    {service.title}
                    <ArrowRight className="h-4 w-4 -translate-x-2 opacity-0 transition-all duration-200 group-hover/title:translate-x-0 group-hover/title:opacity-100" />
                  </span>
                  <span className="mt-1 block text-sm text-wawa-light-gray">{service.description}</span>
                </span>
              </Link>
            ))}
          </div>

          {/* Kuyumculuk kartının yerinde: el yazısı imza ve projeye davet */}
          <Link
            href={menuInvite.href}
            onClick={closeMenus}
            className="group/invite col-span-3 flex min-h-[300px] flex-col justify-between bg-wawa-accent p-7 text-wawa-charcoal"
          >
            <Signature lines={menuInvite.signature} play={isMegaOpen} className="text-[44px] leading-[1.1]" />
            <span>
              <span className="block text-lg leading-snug">{menuInvite.text}</span>
              <span className="mt-5 inline-flex items-center gap-2 border-b border-wawa-charcoal pb-1 text-sm font-semibold">
                {menuInvite.cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/invite:translate-x-1" />
              </span>
            </span>
          </Link>
        </div>

        <div className="border-t border-black/5 bg-wawa-cream">
          <div className="container-wide flex items-center justify-between py-4 text-sm">
            <span className="text-wawa-gray">{strip}</span>
            <Link
              href={ROUTES[lang].projects}
              onClick={closeMenus}
              className="inline-flex items-center gap-2 font-medium text-wawa-charcoal hover:underline underline-offset-4"
            >
              {allProjects}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
