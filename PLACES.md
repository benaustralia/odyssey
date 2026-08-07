# Odyssey Glossary Places — Atlas pin coverage

Term × plate coverage matrix for the 84 Wilson-glossary `place` entries across the Atlas's 6
Ortelius plates (`src/data/plates/{rubri,graecia,aegyptus,natoliae,palestinae,africae}.ts`).
Regenerated from those files + `glossary.json` — they are the source of truth; this is a
human-readable index only.

**Last regenerated:** 2026-08-07, after Phase 0 of the place-search plan (repo-root `Plan.md`):
Graecia's 69 pins are calibrated onto Ortelius's own labels (2026-08-07), Aegyptus's 2 pins are
off their seed grid, and **rubri's 69 now-redundant Greek pins have been deleted** — every term
Graecia's frame covers lives there now, and rubri keeps only the places Graecia can't show
(the Vlyssis Errores inset's mythical/voyage isles, the Underworld rivers, Cyprus, and the
Levantine/African/Asian pins, whose Arabia/Persia/India placeholders are now calibrated too).

## Coverage matrix (x = pinned on that plate)

| Place | rubri | graecia | aegyptus | natoliae | palestinae | africae |
|---|---|---|---|---|---|---|
| Acheron | x |  |  |  |  |  |
| Aeaea | x |  |  |  |  |  |
| Aegae |  | x |  |  |  |  |
| Aeolia | x |  |  |  |  |  |
| Amnisus |  | x |  |  |  |  |
| Arethusa |  | x |  |  |  |  |
| Argos (the city) |  | x |  |  |  |  |
| Artaky | x |  |  |  |  |  |
| Asteris |  | x |  |  |  |  |
| Athens |  | x |  |  |  |  |
| Chalcis |  | x |  |  |  |  |
| Chios |  | x |  |  |  |  |
| Cimmerians | x |  |  |  |  |  |
| Cocytus | x |  |  |  |  |  |
| Cyprus | x |  |  |  |  |  |
| Cythera |  | x |  |  |  |  |
| Delos |  | x |  |  |  |  |
| Egypt | x |  | x |  |  |  |
| Elis |  | x |  |  |  |  |
| Ephyra |  | x |  |  |  |  |
| Erebus | x |  |  |  |  |  |
| Erymanthus |  | x |  |  |  |  |
| Ethiopia | x |  |  |  |  | x |
| Euboea |  | x |  |  |  |  |
| Geraestus |  | x |  |  |  |  |
| Gortyn |  | x |  |  |  |  |
| Gyrae |  | x |  |  |  |  |
| Hyperesia |  | x |  |  |  |  |
| Hyperia | x |  |  |  |  |  |
| Iolcus |  | x |  |  |  |  |
| Ismarus |  | x |  |  |  |  |
| Ithaca |  | x |  |  |  |  |
| Land of the Cyclopes | x |  |  |  |  |  |
| Land of the Lotus-Eaters | x |  |  |  |  |  |
| Lemnos |  | x |  |  |  |  |
| Lesbos |  | x |  |  |  |  |
| Libya | x |  |  |  |  | x |
| Malea |  | x |  |  |  |  |
| Marathon |  | x |  |  |  |  |
| Messenia |  | x |  |  |  |  |
| Mimas |  | x |  | x |  |  |
| Mount Neion |  | x |  |  |  |  |
| Mount Neriton |  | x |  |  |  |  |
| Mount Parnassus |  | x |  |  |  |  |
| Mount Solyma | x |  |  | x |  |  |
| Mycenae |  | x |  |  |  |  |
| Ocean |  |  |  |  |  |  |
| Ogygia | x |  |  |  |  |  |
| Olympus |  | x |  |  |  |  |
| Orchomenus |  | x |  |  |  |  |
| Ortygia | x |  |  |  |  |  |
| Ossa |  | x |  |  |  |  |
| Panopeus |  | x |  |  |  |  |
| Pelion |  | x |  |  |  |  |
| Phaea |  | x |  |  |  |  |
| Phaestus |  | x |  |  |  |  |
| Pharos | x |  | x |  |  |  |
| Pherae |  | x |  |  |  |  |
| Phoenicia | x |  |  |  | x |  |
| Phthia |  | x |  |  |  |  |
| Phylace |  | x |  |  |  |  |
| Pieria |  | x |  |  |  |  |
| Psara |  | x |  |  |  |  |
| Pylos |  | x |  |  |  |  |
| Pyriphlegethon | x |  |  |  |  |  |
| River Jardan |  | x |  |  |  |  |
| Same |  | x |  |  |  |  |
| Scheria | x |  |  |  |  |  |
| Scyros |  | x |  |  |  |  |
| Sidon | x |  |  |  | x |  |
| Sounion |  | x |  |  |  |  |
| Sparta |  | x |  |  |  |  |
| Styx | x |  |  |  |  |  |
| Taphos |  | x |  |  |  |  |
| Taygetus |  | x |  |  |  |  |
| Telepylus | x |  |  |  |  |  |
| Temese | x |  |  |  |  |  |
| Tenedos |  | x |  | x |  |  |
| The Underworld | x |  |  |  |  |  |
| Thesprotia |  | x |  |  |  |  |
| Thrace |  | x |  |  |  |  |
| Thrinacia | x |  |  |  |  |  |
| Troy |  | x |  | x |  |  |
| Zacynthus |  | x |  |  |  |  |

**Unpinned:** Ocean (deliberate — the world-encircling river isn't a point on a map).

Every one of the other 83 places is pinned on exactly the plate(s) that actually depict it.
Places now appearing on **one** plate only are no longer duplicated on rubri — that duplication
was an artefact of rubri having been the Atlas's only plate, and it is gone.

## Non-glossary (`noGloss`) pins

These have map pins but no glossary entry (poem-text places or plate-label regions), so their
popups have no "View artworks" link:

- **rubri:** Africa, Arabia, India, Persia
- **graecia:** Achaea, Alpheus, Arcadia, Attica, Boeotia, Crete, Crouni, Enipeus, Knossos, Laconia, Peloponnese, Thebes, Thessaly
- **africae:** Africa

Phase 6 of the Atlas plan (opted into, not started) would turn the plausible ones of these
(Arcadia, Attica, Boeotia, Laconia, Peloponnese, Thessaly — pending verification they occur in
Wilson's translation) into real glossary entries; Arabia/India/Persia/Africa stay map-only labels.

## Pin totals by plate

rubri 31 · graecia 69 · aegyptus 2 · natoliae 4 · palestinae 2 · africae 3 — from
`npm run check:pins`, which also guards term/bounds/dupe/coverage invariants.
