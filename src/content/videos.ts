// WAWA Interiors videoları (panelde Medya > Videolar). YouTube videoları kimlik, başlık ve süreyle; yüklenen kısa MP4'ler
// (sessiz arka plan videoları) adres ve başlıkla tutulur. standHero: fuar standı sayfalarının açılışında arkada oynayan video.
import data from "./videos.json";

export type Video = { id: string; title: string; duration: string };
export type VideoFile = { src: string; title: string; size?: number };
const V = data as { youtube: Video[]; files: VideoFile[]; standHero: string };

export const VIDEOS: Video[] = V.youtube;
export const VIDEO_FILES: VideoFile[] = V.files;
export const HERO_VIDEO: string = V.standHero;

// Yüklenmiş dosya mı (MP4 adresi), YouTube kimliği mi
export const isVideoFile = (v: string) => /^(https:\/\/|\/).+\.(mp4|webm)(\?.*)?$/i.test(v);
