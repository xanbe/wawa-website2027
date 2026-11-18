// Google Haritalar yorumları: bir kez alınıp buraya yazılır, canlı çekilmez.
// Anasayfada ilk 3 yorum gösterilir; tamamı için Google Haritalar'a bağlantı verilir.
// REVIEWS boşken bölüm görünmez.

export const GOOGLE_RATING = 5.0;
export const GOOGLE_REVIEW_COUNT = 13;
// Yorumların tamamı (Google işletme profili)
export const GOOGLE_REVIEWS_URL = "https://share.google/2p2QdWjkltdph3n3J";
// Haritaya tıklanınca Google Haritalar açılır
export const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Wawa%20%C4%B0%C3%A7mimarl%C4%B1k%20Fuar%20Stand%C4%B1%20Zeytinburnu%20%C4%B0stanbul";

export type Review = {
  author: string;
  /** Yorumun metni, Google'daki hâliyle */
  text: string;
  /** Örn. "8 ay önce" */
  when: string;
};

export const REVIEWS: Review[] = [
  {
    author: "Nazlı Öztürk",
    when: "8 ay önce",
    text: "Fuar standımız için birlikte çalıştık ve gerçekten memnun kaldık. Süreç boyunca iletişimde hiçbir problem yaşamadık, her şey hızlı ve planlı ilerledi. Kurulum ve operasyon kısmı da oldukça sorunsuzdu. Standın kalitesi çok iyiydi, fuar boyunca birçok kişiden tasarımla ilgili güzel yorumlar aldık. Emeği geçen herkese teşekkür ederiz.",
  },
  {
    author: "Kerim Yeşilyurt",
    when: "8 ay önce",
    text: "Kuyumculuk fuarı için 3 yıldır işbirliği yapıyoruz. Deneyimli ve yenilikçi tasarımlar sunan bir ekip. İşin başlangıcından bitimine kadar titizlikle ilgileniyorlar. Gönül rahatlığıyla tavsiye ediyorum!",
  },
  {
    author: "Murat Boylu",
    when: "bir yıl önce",
    text: "Tasarım ve yeni trend standlar konusunda işini titizlikle ve hakkıyla yapan genç, dinamik bir ekip. Gönül rahatlığıyla tavsiye ediyorum!",
  },
  // Anasayfada gösterilmiyor (ilk 3); sıra değiştirilirse görünür
  {
    author: "Bela Brons",
    when: "bir yıl önce",
    text: "It was a pleasue working with Wawa Interiors. Clear and quick communication. Very happy with manager Zehra, she made our exhibition experience very comfortable and professional. Will be glad to work together again",
  },
];
