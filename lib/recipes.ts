import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { Marked } from "marked";
import { slugify } from "./slugify.ts";

export const CATEGORIES = ["Kvöldmatur", "Morgunmatur", "Bakstur", "Sósur", "Drykkir"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Section = { title: string; html: string };

export type Recipe = {
  slug: string;
  title: string;
  category: Category;
  protein: string[];
  tags: string[];
  source?: string;
  servings?: string;
  time?: string;
  image?: string;
  notesHtml: string;
  ingredientsHtml: string;
  methodHtml: string;
  extra: Section[];
  searchText: string;
};

// What the client needs for listing/filtering. No HTML bodies.
export type RecipeSummary = Pick<
  Recipe,
  "slug" | "title" | "category" | "protein" | "tags" | "servings" | "time" | "image" | "searchText"
> & { filters: string[] };

export type FilterGroup = { title: string; items: { label: string; slug: string; count: number }[] };

const DIR = path.join(process.cwd(), "content/recipes");

const md = new Marked({ gfm: true });

// Ingredient list items become native checkboxes; CSS strikes through checked ones.
const ingredientMd = new Marked({
  gfm: true,
  renderer: {
    listitem(item) {
      return `<li><label><input type="checkbox"><span>${this.parser.parseInline(
        item.tokens.flatMap((t) => ("tokens" in t && t.tokens ? t.tokens : [t])),
      )}</span></label></li>\n`;
    },
  },
});

function render(m: Marked, src: string): string {
  return (m.parse(src.trim()) as string).trim();
}

function stringList(v: unknown, field: string, file: string): string[] {
  if (v == null) return [];
  if (!Array.isArray(v) || !v.every((x) => typeof x === "string"))
    throw new Error(`${file}: "${field}" must be a list of strings`);
  return v;
}

function optionalString(v: unknown): string | undefined {
  return v == null || v === "" ? undefined : String(v);
}

export function parseRecipe(slug: string, raw: string): Recipe {
  const file = `${slug}.md`;
  const { data, content } = matter(raw);

  if (typeof data.title !== "string" || !data.title) throw new Error(`${file}: missing "title"`);
  if (!CATEGORIES.includes(data.category))
    throw new Error(`${file}: "category" must be one of ${CATEGORIES.join(", ")}`);

  // Everything before the first "## " heading is my own notes; then one chunk per section.
  const [notes, ...chunks] = content.split(/^## +/m);
  const sections = chunks.map((c) => {
    const nl = c.indexOf("\n");
    return { title: (nl === -1 ? c : c.slice(0, nl)).trim(), body: nl === -1 ? "" : c.slice(nl + 1) };
  });
  const take = (title: string) => {
    const i = sections.findIndex((s) => s.title.toLowerCase() === title.toLowerCase());
    return i === -1 ? "" : sections.splice(i, 1)[0].body;
  };
  const ingredients = take("Innihald");
  const method = take("Aðferð");

  return {
    slug,
    title: data.title,
    category: data.category,
    protein: stringList(data.protein, "protein", file),
    tags: stringList(data.tags, "tags", file),
    source: optionalString(data.source),
    servings: optionalString(data.servings),
    time: optionalString(data.time),
    image: optionalString(data.image),
    notesHtml: render(md, notes.replace(/<!--[\s\S]*?-->/g, "")),
    ingredientsHtml: render(ingredientMd, ingredients),
    methodHtml: render(md, method),
    extra: sections.map((s) => ({ title: s.title, html: render(md, s.body) })),
    searchText: [data.title, data.category, ...(data.protein ?? []), ...(data.tags ?? []), ingredients]
      .join(" ")
      .toLowerCase(),
  };
}

export function getRecipes(): Recipe[] {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parseRecipe(f.slice(0, -3), fs.readFileSync(path.join(DIR, f), "utf8")))
    .sort((a, b) => a.title.localeCompare(b.title, "is"));
}

export function getRecipe(slug: string): Recipe | undefined {
  return getRecipes().find((r) => r.slug === slug);
}

const filtersOf = (r: Recipe) => [r.category, ...r.protein, ...r.tags].map(slugify);

export function getSummaries(): RecipeSummary[] {
  return getRecipes().map((r) => ({
    slug: r.slug,
    title: r.title,
    category: r.category,
    protein: r.protein,
    tags: r.tags,
    servings: r.servings,
    time: r.time,
    image: r.image,
    searchText: r.searchText,
    filters: filtersOf(r),
  }));
}

export function getFilterGroups(): FilterGroup[] {
  const recipes = getRecipes();
  const group = (title: string, labels: string[]): FilterGroup => {
    const counts = new Map<string, number>();
    for (const l of labels) counts.set(l, (counts.get(l) ?? 0) + 1);
    return {
      title,
      items: [...counts].map(([label, count]) => ({ label, slug: slugify(label), count })),
    };
  };
  const byCount = (g: FilterGroup) => ({
    ...g,
    items: g.items.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "is")),
  });
  const categories = group("Flokkar", recipes.map((r) => r.category));
  categories.items.sort((a, b) => CATEGORIES.indexOf(a.label as Category) - CATEGORIES.indexOf(b.label as Category));
  return [
    categories,
    byCount(group("Prótein", recipes.flatMap((r) => r.protein))),
    byCount(group("Merki", recipes.flatMap((r) => r.tags))),
  ];
}
