import { rubriPlate } from "./rubri"
import { graeciaPlate } from "./graecia"
import { aegyptusPlate } from "./aegyptus"
import { natoliaePlate } from "./natoliae"
import { palestinaePlate } from "./palestinae"
import { africaePlate } from "./africae"
import type { PlateConfig } from "./types"

export const PLATES: Record<string, PlateConfig> = {
  rubri: rubriPlate,
  graecia: graeciaPlate,
  aegyptus: aegyptusPlate,
  natoliae: natoliaePlate,
  palestinae: palestinaePlate,
  africae: africaePlate,
}

// Flips to "graecia" once that plate's pins are calibrated — the Greek map
// is where most of the pins live, so it becomes the Atlas's face.
export const DEFAULT_PLATE_SLUG = "rubri"

export type { AtlasPlace, PlateConfig } from "./types"
