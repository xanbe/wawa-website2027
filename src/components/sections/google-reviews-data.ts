// Google Haritalar yorumları: bir kez alınıp yönetim panelinden (src/content/home.json) girilir, canlı çekilmez.
// Anasayfada ilk 3 yorum gösterilir; tamamı için Google Haritalar'a bağlantı verilir.
// REVIEWS boşken bölüm görünmez. Mevcut içe aktarmalar bozulmasın diye değerler buradan da verilir.
import { HOME, type HomeReview } from "@/content/home";

export const GOOGLE_RATING = HOME.reviews.rating;
export const GOOGLE_REVIEW_COUNT = HOME.reviews.count;
// Yorumların tamamı (Google işletme profili)
export const GOOGLE_REVIEWS_URL = HOME.reviews.url;
// Haritaya tıklanınca Google Haritalar açılır
export const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Wawa%20%C4%B0%C3%A7mimarl%C4%B1k%20Fuar%20Stand%C4%B1%20Zeytinburnu%20%C4%B0stanbul";

export type Review = HomeReview;

export const REVIEWS: Review[] = HOME.reviews.items;
