"use client";

// Açılışın arkasında sessiz, döngülü YouTube videosu. Önce kapak görseli gelir; video sayfa açıldıktan sonra
// yüklenir ve oynamaya başlayınca yavaşça görünür. Hareket azaltma tercihinde yalnızca kapak görseli kalır.
import Image from "next/image";
import { useEffect, useState } from "react";

export function VideoBackdrop({ id, poster }: { id: string; poster?: string }) {
  const [mount, setMount] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setMount(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-wawa-charcoal [container-type:size]">
      {poster && <Image src={poster} alt="" fill priority sizes="100vw" className="object-cover" />}
      {mount && (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&rel=0&modestbranding=1&disablekb=1&fs=0&iv_load_policy=3`}
          title=""
          tabIndex={-1}
          allow="autoplay; encrypted-media"
          // YouTube'un yükleme ekranı ve başlık şeridi görünmesin diye video oynamaya başlayınca açılır
          onLoad={() => setTimeout(() => setVisible(true), 1800)}
          // Alanı her oranda kaplar; kenarlardaki YouTube yazıları taşsın diye biraz büyütülür
          className={`absolute top-1/2 left-1/2 border-0 transition-opacity duration-[1400ms] ${visible ? "opacity-100" : "opacity-0"}`}
          style={{ width: "max(100cqw, 177.78cqh)", height: "max(100cqh, 56.25cqw)", transform: "translate(-50%, -50%) scale(1.3)" }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/45" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  );
}
