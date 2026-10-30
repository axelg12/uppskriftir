import Link from "next/link";
import type { RecipeSummary } from "@/lib/recipes";

export function Chip({ label, kind }: { label: string; kind: "protein" | "tag" }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
        kind === "protein" ? "bg-sage-soft text-sage" : "bg-line/70 text-ink/70"
      }`}
    >
      {label}
    </span>
  );
}

export function RecipeCard({ recipe: r }: { recipe: RecipeSummary }) {
  return (
    <Link
      href={`/uppskriftir/${r.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-card transition hover:border-accent/40 hover:shadow-md hover:shadow-black/5"
    >
      {r.image && (
        <img src={r.image} alt="" loading="lazy" className="aspect-[2/1] w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[11px] font-medium tracking-wider text-accent uppercase">{r.category}</p>
        <h3 className="font-serif text-[17px] leading-snug font-semibold group-hover:text-accent">{r.title}</h3>
        {(r.time || r.servings) && (
          <p className="text-xs text-muted">{[r.time, r.servings].filter(Boolean).join(" · ")}</p>
        )}
        <div className="mt-auto flex flex-wrap gap-1 pt-1">
          {r.protein.map((p) => (
            <Chip key={p} label={p} kind="protein" />
          ))}
          {r.tags.map((t) => (
            <Chip key={t} label={t} kind="tag" />
          ))}
        </div>
      </div>
    </Link>
  );
}

export function RecipeGrid({ recipes }: { recipes: RecipeSummary[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {recipes.map((r) => (
        <RecipeCard key={r.slug} recipe={r} />
      ))}
    </div>
  );
}
