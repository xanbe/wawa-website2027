import sanitizeHtml from "sanitize-html";

// İzin listeli HTML temizleyici: panelden kaydedilen, otomatik çevrilen ve WordPress'ten aktarılan metinler
// yalnızca aşağıdaki etiket ve özniteliklerle kalır. Betik, olay özniteliği, stil, iframe vb. her zaman atılır.
// Hem sitede (sayfa derlenirken) hem panelde (kayıt ve okuma) hem de içe aktarma betiğinde (scripts/) kullanılır.

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "h2", "h3", "h4", "h5", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li", "a", "img", "br", "hr", "blockquote", "figure", "figcaption", "div", "table", "thead", "tbody", "tr", "th", "td"],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
    figure: ["class"],
    div: ["data-youtube"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  allowedClasses: { figure: ["wp-block-image", "aligncenter", "alignleft", "alignright", "size-large", "size-full"] },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["https"] },
  allowProtocolRelative: false,
  nonTextTags: ["script", "style", "textarea", "option", "noscript", "iframe", "object", "embed", "template", "svg", "math"],
  transformTags: {
    // Panel düzenleyicisinin ürettiği <div> paragrafa çevrilir; yalnızca YouTube yer tutucusu div olarak kalır
    div: (tagName, attribs): sanitizeHtml.Tag => {
      const yt = attribs["data-youtube"];
      return yt && /^[\w-]{11}$/.test(yt) ? { tagName, attribs: { "data-youtube": yt } } : { tagName: "p", attribs: {} };
    },
    // Yeni sekmede açılan bağlantılar açan sayfaya erişemez
    a: (tagName, attribs) => (attribs.target === "_blank" ? { tagName, attribs: { ...attribs, rel: "noopener noreferrer" } } : { tagName, attribs: { ...attribs, target: "" } }),
  },
  exclusiveFilter: (frame) => frame.tag === "a" && !frame.attribs.href && !frame.text.trim(),
};

export function cleanHtml(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, OPTIONS)
    .replace(/\s?target=""/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

// Düz metin: tüm etiketler atılır (SSS cevapları gibi yalnızca metin olması gereken alanlar)
export const plainText = (s: string) => sanitizeHtml(s, { allowedTags: [], allowedAttributes: {} }).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
