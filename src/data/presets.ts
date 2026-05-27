import { InstrumentPreset } from "../types";

export const PRESET_INSTRUMENTS: InstrumentPreset[] = [
  {
    id: "madal",
    name: "Madal",
    localName: "मादल",
    category: "Avanaddha Vadyas (Membranophone / Drum)",
    tagline: "The heartbeat of Nepalese folk rhythms",
    description: "The Madal is the most famous hand drum of Nepal. It consists of a wooden body called ‘Ghar’, hollowed and covered on both ends with dual-density skins. The circular black paste (Khari) on each face produces its distinctive metallic resonant sustain.",
    history: "Originating in the Magar community of Western Nepal, the Madal has spread to become the foundational rhythm generator across all Nepalese ethnic traditions. It accompanies timeless village gatherings, major celebrations like Tihar (Deusi Bhailo), folk dances, and Teej festivals.",
    facts: [
      "Crafted from a single block of wood (usually wild cherry or Dar wood).",
      "Features two distinct drum heads: the larger 'Dhum' (left-hand, deep bass slam) and the smaller 'Tehel' (right-hand, sharp metallic ringing slap).",
      "The black center spot, 'Khari', is made from a proprietary composite of ground iron filings, boiled rice, and terminalia chebula paste."
    ],
    playingGuidance: "Tap or click on the drum skins below! Use the Left side of the drum for deep bass tones, and the Right side for high-pitched treble clicks. Select a tempo to trigger traditional Khyali or Samal loops."
  },
  {
    id: "bansuri",
    name: "Bansuri",
    localName: "बाँसुरी",
    category: "Sushira Vadyas (Aerophone / Flute)",
    tagline: "The breathing soul of Himalayan pastures",
    description: "The Nepalese Bansuri is a side-blown soprano flute carved from select single-noded structural bamboo. It is cherished for its sweet, evocative, high-frequency pitch and natural note-bending expressivity.",
    history: "Associated for millenia with shepherd folklore and Hindu mythology, the Bansuri is a pastoral standard linked with Lord Krishna. In Nepalese classical and folk ensembles, its singing legato voice echoes the high-altitude winds and rivers.",
    facts: [
      "Heated over oil lamps during production to seal the organic fibers and preserve crystalline tuning.",
      "Traditional Nepalese flutes utilize 6 or 7 finger-holes, catering to scales like Bihag or Yaman.",
      "Requires precise micro-tonal finger shading and dynamic breath pressure control (Phukaar) to generate fluid glisses."
    ],
    playingGuidance: "Allow microphone access to play! Simply blow, puff, or whisper toward your microphone to generate pure acoustic sound. Then, click or tap the finger holes on the screen to switch pitches. Unlocking multiple holes rises the scale!"
  },
  {
    id: "sarangi",
    name: "Nepali Sarangi",
    localName: "सारङ्गी",
    category: "Tata Vadyas (Chordophone / Bowed String)",
    tagline: "The soulful narrator of folklore tales",
    description: "Distinct from Indian Sarangi, the Nepali Sarangi is a nimble 4-stringed fiddle carved from a single piece of light Khirra wood. It features a hollow belly covered in goat hide, played with a horsehair bow.",
    history: "Historically, the Sarangi belonged to the Gandharva community—wandering bards who traveled between mountain villages singing of historical victories, news, and devastating mountain tragedies. The Sarangi's iconic tearful melody closely mimics human voice cries.",
    facts: [
      "Unlike standard stringed instruments, the strings are not pressed down to the fingerboard, but rather touched laterally with the fingernails.",
      "Traditionally strung with goat-skin gut strings, modern bards often utilize durable steel/nylon wires.",
      "Its compact, light size was specifically engineered to be easily carried along steep Himalayan footpaths."
    ],
    playingGuidance: "Slide and click your bow over the strings to make them sing! Move your mouse or drag your finger along the vertical frets to pitch-bend notes dynamically."
  },
  {
    id: "murchunga",
    name: "Murchunga",
    localName: "मुर्चुङ्गा",
    category: "Ghana Vadyas (Idiophone / Jaw Harp)",
    tagline: "The resonant metallic pocket overtone",
    description: "The Murchunga is a traditional Nepalese iron harp that is held between the teeth while its projecting tongue is plucked. This converts the mouth cavity into a variable acoustic resonator.",
    history: "Dating back thousands of years across central Eurasia and the Himalayas, the Murchunga is the premier nomadic pocket companion of Nepal. It is traditionally used to express microtonal playfulness, light romance, and ritual trances.",
    facts: [
      "Relies entirely on the player's throat and cheeks acting as a living acoustic filter box.",
      "The pitch remains constant (tuned to a key), but you alter dynamic frequencies by varying your mouth shape and breathing patterns.",
      "Produces a iconic 'twangy' drone that is highly rhythmic and rich in higher harmonics."
    ],
    playingGuidance: "Pluck the metal reed with a quick click or drag. While it vibrates, drag the 'Mouth Resonator' slider to mimic opening or closing your jaw, altering the resonant harmonics dynamically!"
  }
];
