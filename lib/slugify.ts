// Icelandic-aware: "Þriggja eggja" -> "thriggja-eggja", "Tófú" -> "tofu"
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/þ/g, "th")
    .replace(/ð/g, "d")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
