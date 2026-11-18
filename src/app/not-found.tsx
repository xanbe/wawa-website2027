import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Bulunamayan sayfa: sitenin sade temasında, iki çıkış yolu
export default function NotFound() {
  return (
    <section className="bg-white">
      <div className="container-wide flex min-h-[70vh] flex-col justify-center pt-32 pb-16 lg:pt-44">
        <p className="font-heading text-[64px] leading-none text-wawa-charcoal/10 lg:text-[120px]">404</p>
        <h1 className="mt-6 font-heading text-[28px] leading-[1.2] font-normal text-wawa-charcoal lg:text-[40px]">Sayfa bulunamadı.</h1>
        <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-wawa-charcoal/70">
          Aradığınız sayfa taşınmış ya da kaldırılmış olabilir. Projelerimize göz atabilir ya da anasayfaya dönebilirsiniz.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-4 bg-wawa-accent px-7 py-4 text-[15px] font-medium text-wawa-charcoal transition-colors hover:bg-wawa-charcoal hover:text-white"
          >
            Anasayfa
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/projelerimiz/"
            className="inline-flex items-center bg-[#F3F2EF] px-7 py-4 text-[15px] text-wawa-charcoal transition-colors hover:bg-wawa-charcoal hover:text-white"
          >
            Projelerimiz
          </Link>
        </div>
      </div>
    </section>
  );
}
