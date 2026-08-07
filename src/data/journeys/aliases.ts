// Glossary place term -> the journey stop that IS that place.
//
// Wilson's glossary and Fry's voyage name the same landfall differently: the
// glossary indexes the *place* ("Aeaea", "Telepylus", "Land of the Cyclopes"),
// while a stop is keyed by the glossary entry its popup opens, which for a
// mythic isle is usually the being who lives there ("Circe", "Laestrygonians",
// "Cyclops (pl. Cyclopes)"). Without this table those place cards can only
// reach rubri's cramped Vlyssis inset, never the full-size map of the very
// same engraving.
//
// Only aliases that name a REAL landfall on the voyage belong here. The five
// Underworld rivers (Styx, Acheron, Cocytus, Pyriphlegethon, Erebus) are
// deliberately absent: each has its own distinct pin on rubri, and collapsing
// them onto stop 8 would throw that away for no gain.
//
// Kept in its own file, not on JourneyConfig, so scripts/check-pins.ts can
// import it directly — the journey config files import .svg assets, which tsx
// can't load, which is why that script has to regex their stop terms instead.
export const JOURNEY_ALIASES: Record<string, Record<string, string>> = {
  odysseus: {
    Aeaea: "Circe", // Circe's island; stop 7 (stop 9 revisits it to bury Elpenor)
    Aeolia: "Aeolus",
    Ismarus: "Cicones", // the Ciconian city Odysseus sacks in Book 9
    "Land of the Cyclopes": "Cyclops (pl. Cyclopes)",
    "Land of the Lotus-Eaters": "Lotus-Eaters",
    Telepylus: "Laestrygonians",
    "The Underworld": "Hades",
  },
}
