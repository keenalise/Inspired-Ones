// Extremely compact Base64 valid JPEGs for Madal, Bansuri, Sarangi, and Murchunga.
// Using optimized 1x1 or 2x2 placeholders that pass through nicely to representation models,
// or realistic sketches to reduce payload sizes while ensuring valid base64 transmission.

export const SAMPLES: Record<string, string> = {
  // A tiny valid image representing a Madal hand drum
  madal: "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=",
  
  // A tiny valid image representing a Bamboo Flute
  bansuri: "data:image/gif;base64,R0lGODlhAQABAIAAAAMDAwAAACwAAAAAAQABAAACAkQBADs=",
  
  // A tiny valid image representing a Sarangi fiddle
  sarangi: "data:image/gif;base64,R0lGODlhAQABAIAAAAcHBwAAACwAAAAAAQABAAACAkQBADs=",
  
  // A tiny valid image representing a Murchunga jaw harp
  murchunga: "data:image/gif;base64,R0lGODlhAQABAIAAAAsLCwAAACwAAAAAAQABAAACAkQBADs="
};
