export interface IdentifiedInstrument {
  name: string;
  localName: string;
  category: string;
  shortDescription: string;
  history: string;
  facts: string[];
  matchedInstrumentId: "madal" | "bansuri" | "sarangi" | "murchunga" | "generic";
  playingGuidance: string;
}

export interface InstrumentPreset {
  id: "madal" | "bansuri" | "sarangi" | "murchunga";
  name: string;
  localName: string;
  category: string;
  tagline: string;
  description: string;
  history: string;
  facts: string[];
  playingGuidance: string;
}
