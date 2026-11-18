import type { ReactNode } from "react";

// Bölüm başlıklarının ortak şablonu: Michroma.
// Michroma geniş bir yazı tipi; aynı satıra sığması için boyutlar DM Sans başlıklardan küçük tutulur.

const SIZES = {
  display: "text-[28px] leading-[1.2] sm:text-[36px] lg:text-[44px]",
  statement: "text-[22px] leading-[1.35] sm:text-[28px] lg:text-[34px]",
  compact: "text-[22px] leading-[1.25] lg:text-[30px]",
};

interface SectionHeadingProps {
  id: string;
  children: string;
  size?: keyof typeof SIZES;
  className?: string;
}

export function SectionHeading({ id, children, size = "display", className = "" }: SectionHeadingProps) {
  return (
    <h2 id={id} className={`font-heading font-normal tracking-[-0.01em] text-balance text-wawa-charcoal ${SIZES[size]} ${className}`}>
      {children}
    </h2>
  );
}

// Bölümün başlık satırı (sitenin her yerinde aynı mizanpaj):
// başlık 12 sütunluk ızgarada solda 7 sütun; yanındaki açıklama, bağlantı ya da puan her bölümde
// aynı sütundan (9.) başlar ve başlığın ilk satırıyla aynı hizada, üstten durur.
export function SectionHeader({
  id,
  title,
  size = "display",
  children,
}: {
  id: string;
  title: string;
  size?: keyof typeof SIZES;
  children?: ReactNode;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-12 lg:gap-10">
      <SectionHeading id={id} size={size} className="lg:col-span-7">
        {title}
      </SectionHeading>
      {children && <div className="flex flex-col items-start gap-4 lg:col-span-4 lg:col-start-9 lg:pt-1.5">{children}</div>}
    </div>
  );
}

// Başlık satırının sağındaki açıklama metni
export function SectionLead({ children }: { children: ReactNode }) {
  return <p className="max-w-[40ch] text-[17px] leading-relaxed text-wawa-charcoal">{children}</p>;
}
