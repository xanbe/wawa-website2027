import { notFound } from "next/navigation";
import { FAIRS, getFair } from "@/content/fairs";
import { FairDetail, fairMetadata } from "@/components/templates/FairDetail";

// Fuar sayfası; içerik ve metinler FairDetail bileşenindedir
export const dynamicParams = false;
export const generateStaticParams = () => FAIRS.map((f) => ({ slug: f.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return fairMetadata(getFair((await params).slug), "en");
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const fair = getFair((await params).slug);
  if (!fair) notFound();
  return <FairDetail fair={fair} lang="en" />;
}
