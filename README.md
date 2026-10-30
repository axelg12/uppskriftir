# 🍳 Matur

My recipe site. Next.js + Tailwind, exported as a static site (`out/`).

```sh
npm run dev       # http://localhost:3000
npm run build     # static site in out/
npm test          # importer + parser check
```

## Adding a recipe

From a URL (reads the schema.org recipe data most recipe sites have):

```sh
npm run import -- https://www.bbcgoodfood.com/recipes/thai-red-curry --category Kvöldmatur
```

Then open the new file in `content/recipes/` and fill in the protein, tags and your own notes.
Or copy any existing file and write it by hand.

## Recipe format

One markdown file per recipe in `content/recipes/`. The filename is the URL slug.

```md
---
title: Thai curry (rautt/grænt)
category: Kvöldmatur        # Kvöldmatur | Morgunmatur | Bakstur | Sósur | Drykkir
protein: [Tófú, Kjúklingur]  # shown in the sidebar under "Prótein"
tags: [Hversdags]            # e.g. Fljótlegt, Hversdags, Hátíð, Jól, Vegan, Matarboð
source: https://...          # optional, link to the original recipe
servings: Fyrir 4            # optional
time: 30 mín                 # optional
image: /images/x.jpg         # optional, card + header photo (files go in public/images/)
---

My own notes. Everything above the first heading is shown as
"Mínar athugasemdir" at the top of the recipe.

## Innihald

### Optional group heading

- ingredient

## Aðferð

1. step

## Any other section

Rendered below the recipe (nutrition tables, tips, screenshots, ...).
```

Link to another recipe with `/uppskriftir/<slug>`. The build fails if a file is missing `title` or has an unknown `category`.
