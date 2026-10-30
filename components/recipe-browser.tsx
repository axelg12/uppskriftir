"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { FilterGroup, RecipeSummary } from "@/lib/recipes";
import { RecipeGrid } from "./recipe-card";

export function RecipeBrowser({ recipes, groups }: { recipes: RecipeSummary[]; groups: FilterGroup[] }) {
  const tag = useSearchParams().get("tag");
  const [query, setQuery] = useState("");

  const label = groups.flatMap((g) => g.items).find((i) => i.slug === tag)?.label;
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = recipes.filter(
    (r) => (!tag || r.filters.includes(tag)) && words.every((w) => r.searchText.includes(w)),
  );

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-semibold tracking-tight">{label ?? "Allar uppskriftir"}</h1>
          <p className="mt-2 text-muted">
            {shown.length} {shown.length === 1 ? "uppskrift" : "uppskriftir"}
            {label && (
              <>
                {" · "}
                <Link href="/" className="text-accent underline underline-offset-4">
                  Sýna allar
                </Link>
              </>
            )}
          </p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Leita að uppskrift eða hráefni…"
          aria-label="Leita"
          className="w-full rounded-xl border border-line bg-card px-4 py-2.5 text-[15px] outline-none placeholder:text-muted focus:border-accent sm:w-72"
        />
      </div>

      <div className="mt-8">
        {shown.length ? (
          <RecipeGrid recipes={shown} />
        ) : (
          <p className="rounded-2xl border border-dashed border-line p-12 text-center text-muted">
            Ekkert fannst. Prófaðu annað leitarorð.
          </p>
        )}
      </div>
    </>
  );
}
