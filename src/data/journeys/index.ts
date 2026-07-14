import { odysseusJourney } from "./odysseus"
import type { JourneyConfig } from "./types"

export const JOURNEYS: Record<string, JourneyConfig> = {
  odysseus: odysseusJourney,
}

export const DEFAULT_JOURNEY_SLUG = "odysseus"

export type { JourneyConfig } from "./types"
