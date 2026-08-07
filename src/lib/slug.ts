// Kebab-case slug for a glossary term's permalink (/entry/<slug>). Verified by
// script against all 167 terms: no collisions, so no disambiguation logic is
// needed here — re-check if the glossary ever grows two identically-slugged
// terms (e.g. two entries differing only in punctuation).
export function slugify(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
