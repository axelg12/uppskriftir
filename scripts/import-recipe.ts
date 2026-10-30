// Usage: npm run import -- <url> [--category Kvöldmatur]
// Turns a recipe URL into content/recipes/<slug>.md using the page's schema.org Recipe
// JSON-LD (most recipe sites have it). Falls back to a stub with title + source link.
import fs from "node:fs";
import path from "node:path";
import { slugify } from "../lib/slugify.ts";

type Json = any; // eslint-disable-line @typescript-eslint/no-explicit-any

const decode = (s: string) =>
  s
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&shy;|\u00ad/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#?apos;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

export function findRecipe(html: string): Json | undefined {
  const blocks = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  const queue: Json[] = [];
  for (const [, body] of blocks) {
    try {
      queue.push(JSON.parse(body));
    } catch {
      // some sites ship broken JSON-LD next to good blocks
    }
  }
  while (queue.length) {
    const node = queue.shift();
    if (!node || typeof node !== "object") continue;
    if (Array.isArray(node)) queue.push(...node);
    else if ([node["@type"]].flat().includes("Recipe")) return node;
    else if (node["@graph"]) queue.push(node["@graph"]);
  }
}

// "PT1H30M" -> "1 klst 30 mín"
export function isoDuration(d?: string): string | undefined {
  const m = d?.match(/^P(?:\d+D)?T?(?:(\d+)H)?(?:(\d+)M)?/);
  const [h, min] = [+(m?.[1] ?? 0), +(m?.[2] ?? 0)];
  return [h && `${h} klst`, min && `${min} mín`].filter(Boolean).join(" ") || undefined;
}

function steps(instructions: Json): string[] {
  if (!instructions) return [];
  if (typeof instructions === "string") return [decode(instructions)];
  if (Array.isArray(instructions)) return instructions.flatMap(steps);
  if (instructions.itemListElement) return steps(instructions.itemListElement);
  return instructions.text ? [decode(instructions.text)] : [];
}

const yaml = (s: string) => (/[:#\[\]{}"']|^\s|\s$/.test(s) ? JSON.stringify(s) : s);

export function toMarkdown(url: string, html: string, category = "Kvöldmatur") {
  const r = findRecipe(html);
  const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i)?.[1];
  const title = decode(r?.name ?? ogTitle ?? html.match(/<title>([^<]*)/i)?.[1] ?? "Ný uppskrift");
  const image = [r?.image].flat()[0];
  const fm: [string, string | undefined][] = [
    ["title", yaml(title)],
    ["category", category],
    ["protein", "[]"],
    ["tags", "[]"],
    ["source", url],
    ["servings", r?.recipeYield && yaml(decode(String([r.recipeYield].flat()[0])))],
    ["time", isoDuration(r?.totalTime ?? r?.cookTime)],
    ["image", typeof image === "string" ? image : image?.url],
  ];
  const ingredients: string[] = (r?.recipeIngredient ?? []).map((i: string) => `- ${decode(i)}`);
  const method = steps(r?.recipeInstructions).map((s, i) => `${i + 1}. ${s}`);

  const md = [
    "---",
    ...fm.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    "---",
    "",
    "<!-- Mínar athugasemdir: skrifaðu hér fyrir ofan fyrstu fyrirsögn -->",
    "",
    "## Innihald",
    "",
    ...(ingredients.length ? ingredients : ["- "]),
    "",
    "## Aðferð",
    "",
    ...(method.length ? method : ["1. "]),
    "",
  ].join("\n");
  return { title, md, found: !!r };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const url = args.find((a) => /^https?:\/\//.test(a));
  const ci = args.indexOf("--category");
  if (!url) {
    console.error("Usage: npm run import -- <url> [--category Kvöldmatur]");
    process.exit(1);
  }
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (recipe importer)" } });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const { title, md, found } = toMarkdown(url, await res.text(), ci === -1 ? undefined : args[ci + 1]);

  const file = path.join(import.meta.dirname, "../content/recipes", `${slugify(title)}.md`);
  if (fs.existsSync(file)) {
    console.error(`${path.relative(process.cwd(), file)} already exists, not overwriting`);
    process.exit(1);
  }
  fs.writeFileSync(file, md);
  console.log(`${found ? "✓ Imported" : "⚠ No recipe data found, wrote a stub:"} ${path.relative(process.cwd(), file)}`);
  console.log("  Next: check category, add protein and tags, plus your own notes above the first heading.");
}
