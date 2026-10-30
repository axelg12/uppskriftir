import { Suspense } from "react";
import { getFilterGroups, getSummaries } from "@/lib/recipes";
import { RecipeBrowser } from "@/components/recipe-browser";
import { RecipeGrid } from "@/components/recipe-card";

export default function Home() {
  const recipes = getSummaries();
  return (
    <Suspense
      fallback={
        <>
          <h1 className="font-serif text-4xl font-semibold tracking-tight">Allar uppskriftir</h1>
          <p className="mt-2 mb-8 text-muted">{recipes.length} uppskriftir</p>
          <RecipeGrid recipes={recipes} />
        </>
      }
    >
      <RecipeBrowser recipes={recipes} groups={getFilterGroups()} />
    </Suspense>
  );
}
