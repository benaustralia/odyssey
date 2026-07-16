# Odyssey Glossary Places — Atlas pin coverage

Status of the 84 Wilson-glossary place entries on the Atlas map. The `PLACES` array in
`src/AtlasMap.tsx` is the **source of truth** for names + coordinates; this file is a
human-readable index regenerated from it (glossary.json × AtlasMap.tsx).

**Last regenerated:** 2026-07-16. The previous version of this file was a batch-calibration
checklist that had drifted badly: it duplicated Pieria, omitted Asteris and Panopeus (both
actually pinned), listed the pin as "Mount Olympus" (mismatching the glossary term "Olympus",
which silently broke that popup's artwork lookup — since renamed), and ✓-marked Malea and
Mimas though they were never pinned. Do not resurrect the checklist format — regenerate.

## Pinned (81)

- Acheron
- Aeaea
- Aegae
- Aeolia
- Amnisus
- Arethusa
- Argos (the city)
- Artaky
- Asteris
- Athens
- Chalcis
- Chios
- Cimmerians
- Cocytus
- Cyprus
- Cythera
- Delos
- Egypt
- Elis
- Ephyra
- Erebus
- Erymanthus
- Ethiopia
- Euboea
- Geraestus
- Gortyn
- Gyrae
- Hyperesia
- Hyperia
- Iolcus
- Ismarus
- Ithaca
- Land of the Cyclopes
- Land of the Lotus-Eaters
- Lemnos
- Lesbos
- Libya
- Marathon
- Messenia
- Mount Neion
- Mount Neriton
- Mount Parnassus
- Mount Solyma
- Mycenae
- Ogygia
- Olympus
- Orchomenus
- Ortygia
- Ossa
- Panopeus
- Pelion
- Phaea
- Phaestus
- Pharos
- Pherae
- Phoenicia
- Phthia
- Phylace
- Pieria
- Psara
- Pylos
- Pyriphlegethon
- River Jardan
- Same
- Scheria
- Scyros
- Sidon
- Sounion
- Sparta
- Styx
- Taphos
- Taygetus
- Telepylus
- Temese
- Tenedos
- The Underworld
- Thesprotia
- Thrace
- Thrinacia
- Troy
- Zacynthus

## Not pinned yet (2)

Add via `#atlas-eyeball` (Shift+click to drop, drag to place — do NOT hand-guess coordinates):

- Malea — the cape at the SE tip of the Peloponnese (rounded by Odysseus, Book 9)
- Mimas — the Anatolian promontory opposite Chios (Book 3)

## Deliberately unpinned (1)

- Ocean — the world-encircling river, not a point on the plate; its pin was useless and removed (`6ee7085`)

## Extra non-glossary pin (1)

- Achaea — pinned on the inset but not a Wilson-glossary term, so its popup has no "View artworks" link; kept as a harmless region label

**Reconciliation:** 84 glossary places = 81 pinned + 2 to pin + 1 deliberately unpinned. Pins in source: 82 (81 glossary + 1 Achaea).
