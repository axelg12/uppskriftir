import assert from "node:assert/strict";
import { test } from "node:test";
import { isoDuration, toMarkdown } from "./import-recipe.ts";
import { parseRecipe } from "../lib/recipes.ts";

const html = `<html><head><title>ignored</title>
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[
  {"@type":"WebPage","name":"x"},
  {"@type":["Recipe"],"name":"Thai red curry &amp; rice","recipeYield":"4","totalTime":"PT1H5M",
   "image":{"url":"https://img/x.jpg"},
   "recipeIngredient":["1 onion","2 tbsp <b>paste</b>"],
   "recipeInstructions":[{"@type":"HowToSection","itemListElement":[{"@type":"HowToStep","text":"Fry it."}]},
                         {"@type":"HowToStep","text":"Eat it."}]}
]}</script><script type="application/ld+json">{broken</script></head></html>`;

test("imports schema.org Recipe into a file the site can parse", () => {
  const { title, md, found } = toMarkdown("https://example.com/curry", html);
  assert.equal(found, true);
  assert.equal(title, "Thai red curry & rice");

  const r = parseRecipe("thai-red-curry-rice", md);
  assert.equal(r.title, "Thai red curry & rice");
  assert.equal(r.source, "https://example.com/curry");
  assert.equal(r.servings, "4");
  assert.equal(r.time, "1 klst 5 mín");
  assert.equal(r.image, "https://img/x.jpg");
  assert.match(r.ingredientsHtml, /type="checkbox"><span>2 tbsp paste<\/span>/);
  assert.match(r.methodHtml, /<li>Fry it\.<\/li>\s*<li>Eat it\.<\/li>/);
  assert.equal(r.notesHtml, "", "placeholder comment must not count as notes");
});

test("falls back to a stub when there is no recipe data", () => {
  const { title, found } = toMarkdown("https://x.is/a", `<meta property="og:title" content="Spe&shy;síur\u00ad">`);
  assert.equal(found, false);
  assert.equal(title, "Spesíur");
});

test("durations", () => {
  assert.equal(isoDuration("PT30M"), "30 mín");
  assert.equal(isoDuration("PT2H"), "2 klst");
  assert.equal(isoDuration("P0DT0H45M"), "45 mín");
  assert.equal(isoDuration(undefined), undefined);
});
