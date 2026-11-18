import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeader, SectionLead } from "./SectionHeading";

// Anasayfanın ana kelimesi "iç mimar" (Google TR aylık ~12.100 arama; wawa-seo/keywords.txt).
// Bu kelimede ilk sıralardaki sayfaların çoğu "iç mimar ne yapar" sorusunu cevaplıyor; bu bölüm aynı soruyu
// Wawa'nın kendi çalışma biçimiyle cevaplar. Her iddia wawa-seo/brief.md'den; projeler portföydeki gerçek işler.
const SERVICES = [
  { label: "Konut ve villa", href: "/konut-villa-tasarim/" },
  { label: "Ofis", href: "/ofis-tasarimi-ve-uygulama/" },
  { label: "Mağaza", href: "/service/magaza-tasarimi/" },
  { label: "Klinik ve diş kliniği", href: "/service/klinik-tasarimi/" },
  { label: "Cafe ve restoran", href: "/cafe-dekorasyon/" },
];

const CITIES = [
  { label: "İzmir", href: "/izmir-ic-mimarlik/" },
  { label: "Antalya", href: "/antalya-ic-mimarlik/" },
  { label: "Bodrum", href: "/bodrum-ic-mimarlik/" },
];

const LINK = "underline decoration-wawa-charcoal/30 underline-offset-[5px] transition-colors hover:decoration-wawa-charcoal";

export function InteriorArchitectIntro() {
  return (
    <section aria-labelledby="ic-mimar-title" className="bg-white">
      <div className="container-wide pt-8 pb-8 lg:pt-10 lg:pb-10">
        <SectionHeader id="ic-mimar-title" title="İstanbul'da iç mimar: çizen ekip, uygulayan ekip.">
          <SectionLead>Tasarım, teknik çizim, inşaat ve mobilya üretimi aynı çatı altında.</SectionLead>
        </SectionHeader>

        <div className="mt-8 grid gap-10 lg:mt-10 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-5 text-[17px] leading-relaxed text-wawa-charcoal lg:col-span-7">
            <p>
              Bir iç mimar, mekânın nasıl kullanılacağını planlar: ihtiyaçları dinler, yerleşimi kurar; malzeme, aydınlatma ve
              mobilya kararlarını teknik çizime döker, sonra uygulamayı denetler. Wawa Interiors&apos;ta bu iş çizimde bitmez.
              İnşaat firmasıyız ve kendi mobilya atölyemiz var; çizdiğimiz projeyi aynı ekip uygular.
            </p>
            <p>
              Ofisimiz Zeytinburnu&apos;nda, projelerimiz İstanbul&apos;un iki yakasında:{" "}
              <Link href="/portfolio/caddebostan-konut-projesi/" className={LINK}>Caddebostan&apos;da bir konut</Link>,{" "}
              <Link href="/portfolio/acarkent-villa-tasarimi/" className={LINK}>Acarkent&apos;te bir villa</Link>,{" "}
              <Link href="/portfolio/fulya-klinik-tasarim/" className={LINK}>Fulya&apos;da bir klinik</Link>. Ofis, mağaza ve klinik
              projelerinde tasarım ortalama 3–4 hafta sürer. Ücret metrekareye ve proje kapsamına göre belirlenir.
            </p>
            <p>
              İşletmesi açık mekânlarda mesai dışında ve etap etap çalışabiliriz; mekân kapanmadan yenilenir. Anahtar teslim
              projelerde ruhsat dışındaki tüm süreci, yani inşaatı, mobilya üretimini ve montajı biz yönetiriz. İzmir, Antalya ve
              Bodrum&apos;da birlikte çalıştığımız yerel ekiple uygulama yapıyoruz; süreci uzaktan takip edebilirsiniz.
            </p>
          </div>

          <div className="space-y-8 lg:col-span-4 lg:col-start-9">
            <div>
              <h3 className="text-sm tracking-wide text-wawa-charcoal/60 uppercase">İç mimar olarak çalıştığımız alanlar</h3>
              <ul className="mt-3 divide-y divide-wawa-charcoal/10 border-y border-wawa-charcoal/10">
                {SERVICES.map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} className="group flex items-center justify-between py-3 text-[17px] text-wawa-charcoal">
                      {s.label}
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm tracking-wide text-wawa-charcoal/60 uppercase">İstanbul dışında iç mimarlık</h3>
              <p className="mt-3 text-[17px] text-wawa-charcoal">
                {CITIES.map((c, i) => (
                  <span key={c.href}>
                    {i > 0 && " · "}
                    <Link href={c.href} className={LINK}>{c.label}</Link>
                  </span>
                ))}
              </p>
            </div>
            <Link
              href="/teklif-al/"
              className="group inline-flex items-center gap-2 text-[15px] text-wawa-charcoal underline decoration-wawa-charcoal/30 underline-offset-[6px] transition-colors hover:decoration-wawa-charcoal"
            >
              Projenizi konuşalım
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
