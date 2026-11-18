// Tanıtım mozaiği: metin, büyük fotoğraf ve dört ana başlık (sarı, koyu, fotoğraflı ve taş renkli kutular).
// Hareket yalnızca üzerine gelince: kutu hafifçe yükselir, fotoğraf yavaşça yakınlaşır.
import Image from "next/image";
import { ArrowRight } from "lucide-react";

type Tone = { box: string; no: string; text: string; photo?: boolean };
const TONES: Tone[] = [
  { box: "bg-wawa-accent text-wawa-charcoal", no: "", text: "text-wawa-charcoal/75" },
  { box: "bg-wawa-charcoal text-white", no: "text-wawa-accent", text: "text-white/70" },
  { box: "text-white", no: "", text: "text-white/80", photo: true },
  { box: "bg-[#F3F2EF] text-wawa-charcoal", no: "", text: "text-wawa-charcoal/70" },
];

export function IntroBento({
  title,
  text,
  items,
  images,
  offer,
}: {
  title: string;
  text: string;
  items: { title: string; text: string }[];
  images: { src: string; alt: string }[];
  offer: string;
}) {
  const [big, small] = images;
  const tiles = items.slice(0, 4);
  return (
    <section className="bg-white" aria-labelledby="svc-intro">
      <div className="container-wide grid gap-3 pb-14 lg:grid-cols-12 lg:gap-4 lg:pb-16">
        {/* Metin */}
        <div className="flex flex-col justify-between gap-8 border border-wawa-charcoal/12 p-6 sm:p-8 lg:col-span-5 lg:p-10">
          <div>
            <h2 id="svc-intro" className="font-heading text-[26px] leading-[1.22] font-normal text-balance text-wawa-charcoal lg:text-[34px]">
              {title}
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-wawa-charcoal/80 lg:text-[17px]">{text}</p>
          </div>
          <a href="#teklif" className="group inline-flex w-fit items-center gap-4 bg-wawa-charcoal px-6 py-3.5 text-[15px] text-white transition-colors hover:bg-black">
            {offer}
            <ArrowRight className="h-4 w-4 text-wawa-accent transition-transform group-hover:translate-x-1" aria-hidden />
          </a>
        </div>

        {/* Büyük fotoğraf */}
        {big && (
          <div className="group relative min-h-[280px] overflow-hidden bg-[#F3F2EF] lg:col-span-7 lg:min-h-[440px]">
            <Image src={big.src} alt={big.alt} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]" />
          </div>
        )}

        {/* Dört ana başlık */}
        {tiles.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 lg:col-span-12 lg:grid-cols-4 lg:gap-4">
            {tiles.map((it, i) => {
              const base = TONES[i % TONES.length];
              // Fotoğraflı kutu için ikinci görsel yoksa taş renkli kutuya döner
              const tone = base.photo && !small ? TONES[3] : base;
              return (
                <li
                  key={it.title}
                  className={`group relative isolate flex min-h-[190px] flex-col justify-between overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-6 lg:min-h-[230px] ${tone.box}`}
                >
                  {tone.photo && small && (
                    <>
                      <Image src={small.src} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="-z-20 object-cover transition-transform duration-[1200ms] group-hover:scale-[1.06]" />
                      <span className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/35 to-black/15" />
                    </>
                  )}
                  <span className={`font-heading text-[30px] leading-none tabular-nums lg:text-[40px] ${tone.no}`}>{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block text-[17px] leading-snug font-medium tracking-tight lg:text-[20px]">{it.title}</span>
                    {it.text && <span className={`mt-2 block text-[14px] leading-relaxed ${tone.text}`}>{it.text}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
