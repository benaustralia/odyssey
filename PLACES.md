# Odyssey Glossary Places — Atlas pin coverage

Term × plate coverage matrix for the 84 Wilson-glossary `place` entries across the Atlas's 6
Ortelius plates (`src/data/plates/{rubri,graecia,aegyptus,natoliae,palestinae,africae}.ts`).
Regenerated from those files + `glossary.json` — they are the source of truth; this is a
human-readable index only.

**Last regenerated:** 2026-07-17, after the multi-plate registry refactor (Phase 3: 5 new
Ortelius plates tiled/uploaded/seeded) but **before** Graecia's pins were calibrated off their
seed grid (Phase 4, hands-on, not yet done) and before Rubri's now-redundant Greek pins were
removed (also deferred to Phase 4). `DEFAULT_PLATE_SLUG` was flipped to `"graecia"` ahead of that
calibration at the user's request — see the note in `src/data/plates/index.ts`.

## Coverage matrix (x = pinned on that plate)

| Place | rubri | graecia | aegyptus | natoliae | palestinae | africae |
|---|---|---|---|---|---|---|
| Acheron | x | | | | | |
| Aeaea | x | | | | | |
| Aegae | x | x | | | | |
| Aeolia | x | | | | | |
| Amnisus | x | x | | | | |
| Arethusa | x | x | | | | |
| Argos (the city) | x | x | | | | |
| Artaky | x | | | | | |
| Asteris | x | x | | | | |
| Athens | x | x | | | | |
| Chalcis | x | x | | | | |
| Chios | x | x | | | | |
| Cimmerians | x | | | | | |
| Cocytus | x | | | | | |
| Cyprus | x | | | | | |
| Cythera | x | x | | | | |
| Delos | x | x | | | | |
| Egypt | x | | x | | | |
| Elis | x | x | | | | |
| Ephyra | x | x | | | | |
| Erebus | x | | | | | |
| Erymanthus | x | x | | | | |
| Ethiopia | x | | | | | x |
| Euboea | x | x | | | | |
| Geraestus | x | x | | | | |
| Gortyn | x | x | | | | |
| Gyrae | x | x | | | | |
| Hyperesia | x | x | | | | |
| Hyperia | x | | | | | |
| Iolcus | x | x | | | | |
| Ismarus | x | x | | | | |
| Ithaca | x | x | | | | |
| Land of the Cyclopes | x | | | | | |
| Land of the Lotus-Eaters | x | | | | | |
| Lemnos | x | x | | | | |
| Lesbos | x | x | | | | |
| Libya | x | | | | | x |
| Malea | x | x | | | | |
| Marathon | x | x | | | | |
| Messenia | x | x | | | | |
| Mimas | x | x | | x | | |
| Mount Neion | x | x | | | | |
| Mount Neriton | x | x | | | | |
| Mount Parnassus | x | x | | | | |
| Mount Solyma | x | | | x | | |
| Mycenae | x | x | | | | |
| Ogygia | x | | | | | |
| Olympus | x | x | | | | |
| Orchomenus | x | x | | | | |
| Ortygia | x | | | | | |
| Ossa | x | x | | | | |
| Panopeus | x | x | | | | |
| Pelion | x | x | | | | |
| Phaea | x | x | | | | |
| Phaestus | x | x | | | | |
| Pharos | x | | x | | | |
| Pherae | x | x | | | | |
| Phoenicia | x | | | | x | |
| Phthia | x | x | | | | |
| Phylace | x | x | | | | |
| Pieria | x | x | | | | |
| Psara | x | x | | | | |
| Pylos | x | x | | | | |
| Pyriphlegethon | x | | | | | |
| River Jardan | x | x | | | | |
| Same | x | x | | | | |
| Scheria | x | | | | | |
| Scyros | x | x | | | | |
| Sidon | x | | | | x | |
| Sounion | x | x | | | | |
| Sparta | x | x | | | | |
| Styx | x | | | | | |
| Taphos | x | x | | | | |
| Taygetus | x | x | | | | |
| Telepylus | x | | | | | |
| Temese | x | | | | | |
| Tenedos | x | x | | x | | |
| The Underworld | x | | | | | |
| Thesprotia | x | x | | | | |
| Thrace | x | x | | | | |
| Thrinacia | x | | | | | |
| Troy | x | x | | x | | |
| Zacynthus | x | x | | | | |

**Unpinned:** Ocean (deliberate — the world-encircling river isn't a point on a map).

Every one of the other 83 places is pinned on **rubri** (which still carries its full original
101-pin set — its planned cleanup, removing the ~70 Greek pins that now live on Graecia too, is
part of the deferred Phase 4 calibration pass, not done yet) and on whichever new plate is its
better cartographic home.

## Non-glossary (`noGloss`) pins

These have map pins but no glossary entry (poem-text places or plate-label regions), so their
popups have no "View artworks" link:

- **rubri:** Achaea, Arcadia, Attica, Boeotia, Crete, Crouni, Enipeus, Knossos, Laconia,
  Peloponnese, Thebes, Thessaly, Alpheus, Africa, Arabia, India, Persia
- **graecia:** Achaea, Alpheus, Arcadia, Attica, Boeotia, Crete, Crouni, Enipeus, Knossos,
  Laconia, Peloponnese, Thebes, Thessaly (seed-grid parked, same as its 69 real pins — not yet
  calibrated)
- **africae:** Africa

Phase 6 (opted into, not started) would turn the plausible ones of these (Arcadia, Attica,
Boeotia, Laconia, Peloponnese, Thessaly — pending verification they occur in Wilson's translation)
into real glossary entries; Arabia/India/Persia/Africa stay map-only labels.

## Pin totals by plate

rubri 100 · graecia 69 · aegyptus 2 · natoliae 4 · palestinae 2 · africae 3 — from
`npm run check:pins`, which also guards term/bounds/dupe/coverage invariants.
