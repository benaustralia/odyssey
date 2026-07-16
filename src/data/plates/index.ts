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

// The Greek map is where most of the pins live, so it's the Atlas's face.
// NOTE: graecia's ~69 pins are still a seed grid (not yet calibrated via
// #atlas/graecia-eyeball) — flipped ahead of calibration at the user's
// request. Recalibrate before/while this is live; see CLAUDE.md Atlas section.
export const DEFAULT_PLATE_SLUG = "graecia"

export type { AtlasPlace, PlateConfig } from "./types"
