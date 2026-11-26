import type { Metadata } from "next";
import { AdminApp } from "@/components/admin/AdminApp";

// Yönetim paneli (/yonetimpanel/): tahmin edilmesi zor adres, arama motorlarına kapalı; yetki kontrolü /api/admin ucundadır.
// Eski /admin/ adresi artık yok (404); robots.txt'teki /admin/ satırı bilerek bırakıldı, yeni adres orada yazılmaz.
export const metadata: Metadata = { title: "Yönetim paneli | WAWA Interiors", robots: { index: false, follow: false } };

export default function AdminPage() {
  return <AdminApp />;
}
