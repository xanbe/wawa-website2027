"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ArrowUpRight, Instagram, Linkedin, Youtube } from "lucide-react";
import { ROUTES, langFromPath, t } from "@/lib/i18n";
import { NAV, contactInfo } from "./navigation";
import { kvkkPath, privacyPath } from "@/content/legal";

const SOCIALS = [
  // Instagram ana kanal: kutusu sürekli sarı; diğerleri yalnızca üzerine gelince sarıya döner
  { label: "Instagram", handle: "@wawainteriors", href: "https://instagram.com/wawainteriors", Icon: Instagram, primary: true },
  { label: "YouTube", handle: "@wawainteriors", href: "https://www.youtube.com/@wawainteriors", Icon: Youtube, primary: false },
  { label: "LinkedIn", handle: "WAWA Interiors", href: "https://www.linkedin.com/company/71191736", Icon: Linkedin, primary: false },
];

const LINE = "border-wawa-charcoal/15";
const labelClass = "text-xs font-medium tracking-[0.18em] text-wawa-charcoal/50 uppercase";
const linkClass =
  "text-[16px] text-wawa-charcoal underline decoration-transparent underline-offset-[6px] transition-[text-decoration-color] duration-300 hover:decoration-wawa-charcoal/40";

// Footer satırları ince çizgilerle ayrılır; bağlantı satırında sütunlar da dikey çizgilerle bölünür
export function Footer() {
  // Footer, bulunulan sayfanın dilinde gösterilir; adresler eski sitedeki gerçek sayfalardır
  const lang = langFromPath(usePathname() ?? "/");
  const D = t(lang);
  const nav = NAV[lang];
  const COLUMNS = [
    {
      title: D.labels.services,
      links: [
        ...nav.serviceGroups.map((g) => ({ name: g.title, href: g.href })),
        ...nav.singleServices.map((s) => ({ name: s.title, href: s.href })),
      ],
    },
    {
      title: D.labels.company,
      links: [
        { name: D.nav.about, href: ROUTES[lang].about },
        { name: D.nav.projects, href: ROUTES[lang].projects },
        { name: D.nav.blog, href: ROUTES[lang].blog },
      ],
    },
  ];
  return (
    <footer className="bg-[#F3F2EF] text-wawa-charcoal">
      <div className="container-wide">
        {/* 1. satır: kapanış başlığı ve iki kare buton */}
        <div className="flex flex-col gap-10 py-14 lg:flex-row lg:items-end lg:justify-between lg:py-16">
          <h2 className="max-w-[18ch] font-heading text-[28px] leading-[1.2] font-normal tracking-[-0.01em] text-balance sm:text-[36px] lg:text-[44px]">
            {D.footer.headline}
          </h2>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href={ROUTES[lang].contact}
              className="group inline-flex items-center gap-4 bg-wawa-charcoal px-7 py-4 text-[15px] text-white transition-colors duration-300 hover:bg-black"
            >
              {D.cta.talk}
              <ArrowRight className="h-4 w-4 text-wawa-accent transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href={contactInfo.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-4 bg-white px-7 py-4 text-[15px] text-wawa-charcoal transition-colors duration-300 hover:bg-wawa-accent"
            >
              WhatsApp
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        {/* 2. satır: iletişim ve bağlantılar; sütunlar dikey çizgilerle ayrılır */}
        <div className={`grid grid-cols-2 border-t ${LINE} lg:grid-cols-12`}>
          <div className={`col-span-2 border-b py-10 lg:col-span-4 lg:border-r lg:border-b-0 lg:py-12 lg:pr-10 ${LINE}`}>
            <p className={labelClass}>{D.labels.contact}</p>
            <ul className="mt-5 space-y-3">
              <li>
                <a href={contactInfo.phoneHref} className={linkClass}>
                  {contactInfo.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${contactInfo.email}`} className={linkClass}>
                  {contactInfo.email}
                </a>
              </li>
              <li>
                <address className="max-w-[30ch] pt-2 text-[16px] leading-relaxed text-wawa-charcoal/70 not-italic">
                  Maltepe Mh. Eski Çırpıcı Yolu, Nef12 D:22, Zeytinburnu, İstanbul
                </address>
              </li>
            </ul>
          </div>

          {COLUMNS.map((col, i) => (
            <div
              key={col.title}
              className={`border-b py-10 lg:border-r lg:border-b-0 lg:px-10 lg:py-12 ${i === 0 ? "border-r pr-6 lg:col-span-3" : "pl-6 lg:col-span-2 lg:pl-10"} ${LINE}`}
            >
              <p className={labelClass}>{col.title}</p>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className={linkClass}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-2 py-10 lg:col-span-3 lg:py-12 lg:pl-10">
            <p className={labelClass}>{D.labels.follow}</p>
            {/* Kare ikon kutuları: Instagram varsayılan olarak sarı; başka bir kutunun üzerine gelince o sarıya döner, Instagram söner */}
            <ul className="group/social mt-5 space-y-3">
              {SOCIALS.map(({ label, handle, href, Icon, primary }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label}: ${handle}`} className="group flex items-center gap-3">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center border text-wawa-charcoal transition-colors duration-300 ${
                        primary
                          ? "border-wawa-accent bg-wawa-accent group-hover/social:border-wawa-charcoal/15 group-hover/social:bg-white group-hover:border-wawa-accent! group-hover:bg-wawa-accent!"
                          : "border-wawa-charcoal/15 bg-white group-hover:border-wawa-accent group-hover:bg-wawa-accent"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-[15px] text-wawa-charcoal">{label}</span>
                      <span className="block text-[12px] text-wawa-charcoal/55">{handle}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3. satır: telif ve yasal bağlantılar */}
        <div className={`flex flex-col gap-3 border-t py-6 text-sm text-wawa-charcoal/60 sm:flex-row sm:items-center sm:justify-between ${LINE}`}>
          <span>© {new Date().getFullYear()} WAWA Interiors</span>
          <div className="flex gap-6">
            <Link href={privacyPath(lang)} className="transition-colors hover:text-wawa-charcoal">
              {D.labels.privacy}
            </Link>
            {lang === "tr" && (
              <Link href={kvkkPath} className="transition-colors hover:text-wawa-charcoal">
                KVKK Aydınlatma Metni
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
