import type { Metadata } from "next";
import { AdminApp } from "@/components/admin/AdminApp";

// Yönetim paneli: arama motorlarına kapalı; içerik ve yetki kontrolü /api/admin ucundadır
export const metadata: Metadata = { title: "Yönetim paneli | WAWA Interiors", robots: { index: false, follow: false } };

export default function AdminPage() {
  return <AdminApp />;
}
