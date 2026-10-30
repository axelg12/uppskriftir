<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Matur: recipe site

Static Next.js + Tailwind site. Every recipe is one markdown file in `content/recipes/`.
`README.md` has the file format. `lib/recipes.ts` parses it, and the build fails on invalid files.

## Adding a recipe

The user gives you a recipe in one of two ways:

- **A link in the terminal**: a URL to a recipe page.
- **An Obsidian note**: a file in `/Users/axel/Documents/Obsidian Vault/Private/Uppskriftir/`.
  A note usually starts with the source URL, followed by text copied from the page, and sometimes the user's own notes.
  Treat the vault as read-only. Never edit, move or delete notes in it.

Then do these steps:

1. **Start a branch from an up-to-date `main`**: `git switch main && git pull && git switch -c recipe/<slug>`.
   Skip `git pull` if the repo has no remote.
2. **Get the data.** If there is a URL, run `npm run import -- <url> --category <Category>`.
   The importer reads the page's schema.org Recipe data. If it prints "No recipe data found", it wrote a stub.
   Fill in the stub from the page text or the Obsidian note.
   If the note has the full recipe and no URL, write the file by hand. Copy the structure of an existing recipe.
3. **Clean up the file** so that it looks like the existing recipes:
   - Use a short ASCII filename (`spesiur.md`, not `spesiur-elenoru-jola-klassik-...-visir.md`).
     The filename is the URL slug.
   - Use the dish name as the `title`. Remove site names and article headlines ("... - Vísir").
   - Set `category` to one of: Kvöldmatur, Morgunmatur, Bakstur, Sósur, Drykkir.
   - Set `protein` and `tags`. Reuse existing values. Run `grep -h "^protein:\|^tags:" content/recipes/*.md` to see them.
     Do not make near-duplicates (`Fljótlegt`, not `Fljótleg` or `Quick`).
     Typical tags: Fljótlegt, Hversdags, Hátíð, Jól, Vegan, Grænmetisréttur, Matarboð, Próteinríkt.
   - Set `source` to the original URL when there is one. Never drop it.
   - Use `image` only for a real photo of the food. Put screenshots of a recipe in an extra
     `## Skjáskot af upprunalegu uppskriftinni` section at the bottom.
   - Use only these sections: `## Innihald` (a flat `-` list, `###` subheadings for groups, no nested lists),
     `## Aðferð` (a numbered list, one action per step), then optional extra sections such as `## Næring`.
   - Write the recipe in Icelandic. Translate English recipes, but keep every quantity and unit exactly as in the source.
4. **The user's own notes come first.**
   - Put the user's notes above the first `##` heading. They show as "Mínar athugasemdir".
   - Text the user wrote (comments, changes, "next time I will ...") counts as notes.
     Text copied from the source does not.
   - If the user's notes disagree with the source (different amounts, swapped ingredients), use the user's version
     in Innihald and Aðferð too.
   - Keep the user's wording. Fix only obvious typos.
5. **Verify**: run `npm test` and `npm run build`. Both must pass.
   Read the generated file once more and compare it with the source. Look for missing ingredients, merged steps
   and bad characters such as soft hyphens or HTML entities.
6. **Open a PR**:
   - Commit only the new recipe file (and any image in `public/images/`).
     Use the message `Uppskrift: <title>`.
   - Run `git push -u origin HEAD`, then `gh pr create --title "Uppskrift: <title>" --body "..."`.
   - In the PR body, give the source link, where the recipe came from (link or Obsidian note), and anything you
     guessed or translated that the user should check.
   - If the repo has no remote, stop after the commit and tell the user.
