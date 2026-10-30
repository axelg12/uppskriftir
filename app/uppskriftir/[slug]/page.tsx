import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipe, getRecipes } from "@/lib/recipes";
import { slugify } from "@/lib/slugify";
import { Chip } from "@/components/recipe-card";

export const dynamicParams = false;

export function generateStaticParams() {
  return getRecipes().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: PageProps<"/uppskriftir/[slug]">): Promise<Metadata> {
  const recipe = getRecipe((await params).slug);
  return { title: recipe?.title };
}

export default async function RecipePage({ params }: PageProps<"/uppskriftir/[slug]">) {
  const r = getRecipe((await params).slug);
  if (!r) notFound();

  const meta = [
    ["Skammtar", r.servings],
    ["Tími", r.time],
  ].filter((m): m is [string, string] => !!m[1]);

  return (
    <article>
      <Link href="/" className="text-sm text-muted transition-colors hover:text-ink print:hidden">
        ← Allar uppskriftir
      </Link>

      <header className="mt-6 flex flex-col gap-5">
        <Link
          href={`/?tag=${slugify(r.category)}`}
          className="-mb-2 self-start text-sm font-medium tracking-wide text-accent uppercase hover:underline"
        >
          {r.category}
        </Link>
        <h1 className="font-serif text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">{r.title}</h1>

        <div className="flex flex-wrap gap-1.5">
          {r.protein.map((p) => (
            <Link key={p} href={`/?tag=${slugify(p)}`}>
              <Chip label={p} kind="protein" />
            </Link>
          ))}
          {r.tags.map((t) => (
            <Link key={t} href={`/?tag=${slugify(t)}`}>
              <Chip label={t} kind="tag" />
            </Link>
          ))}
        </div>

        {(meta.length > 0 || r.source) && (
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-line py-4">
            {meta.map(([k, v]) => (
              <div key={k}>
                <p className="text-xs tracking-wide text-muted uppercase">{k}</p>
                <p className="mt-0.5 font-medium">{v}</p>
              </div>
            ))}
            {r.source && (
              <a
                href={r.source}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
              >
                Upprunaleg uppskrift
                <span className="text-muted">{new URL(r.source).hostname.replace(/^www\./, "")} ↗</span>
              </a>
            )}
          </div>
        )}
      </header>

      {r.notesHtml && (
        <aside className="mt-8 rounded-2xl border-l-4 border-accent bg-accent-soft/60 px-6 py-5">
          <p className="mb-2 text-xs font-semibold tracking-wider text-accent uppercase">Mínar athugasemdir</p>
          <div className="prose-recipe leading-relaxed" dangerouslySetInnerHTML={{ __html: r.notesHtml }} />
        </aside>
      )}

      {r.image && (
        <img src={r.image} alt={r.title} className="mt-8 max-h-[28rem] w-full rounded-2xl object-cover" />
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {r.ingredientsHtml && (
          <section className="self-start rounded-2xl border border-line bg-card p-6 lg:sticky lg:top-8">
            <h2 className="mb-4 font-serif text-2xl font-semibold">Innihald</h2>
            <div className="ingredients" dangerouslySetInnerHTML={{ __html: r.ingredientsHtml }} />
          </section>
        )}
        {r.methodHtml && (
          <section>
            <h2 className="mb-6 font-serif text-2xl font-semibold">Aðferð</h2>
            <div className="method prose-recipe" dangerouslySetInnerHTML={{ __html: r.methodHtml }} />
          </section>
        )}
      </div>

      {r.extra.map((s) => (
        <section key={s.title} className="mt-12 max-w-2xl">
          <h2 className="mb-4 font-serif text-2xl font-semibold">{s.title}</h2>
          <div className="prose-recipe" dangerouslySetInnerHTML={{ __html: s.html }} />
        </section>
      ))}
    </article>
  );
}
