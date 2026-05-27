import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 photo transfers from webcam/file uploads
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ limit: "15mb", extended: true }));

  // Initialize Google GenAI client
  // Using lazy authentication check inside the controller to prevent startup crashes when API keys are not supplied.
  let ai: GoogleGenAI | null = null;
  function getGenAIClient(): GoogleGenAI {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined. Please add it via Settings > Secrets.");
      }
      ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return ai;
  }

  // API Route: Identify Nepali musical instrument from image uploads
  app.post("/api/identify", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Missing image cargo in request body" });
      }

      // Check key presence before initializing
      if (!process.env.GEMINI_API_KEY) {
        return res.status(400).json({
          error: "Gemini API Key is not configured. Please add your GEMINI_API_KEY in Settings > Secrets to enable instant instrument identification.",
        });
      }

      const client = getGenAIClient();

      // Clean base64 prefix if available (e.g. data:image/png;base64,...)
      let mimeType = "image/jpeg";
      let base64Data = image;
      const match = image.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }

      const imagePart = {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      };

      const promptPart = `
You are an expert ethnomusicologist specialized in traditional Nepalese music culture.
Analyze the user-provided photograph of an instrument and identify it.

If the instrument represents a traditional Nepali instrument (such as Madal, Bansuri, Sarangi, Murchunga, Damphu, Sahnai, Khainjadi, Dhimay, Tungna, Jhyamta, etc.), pinpoint the exact instrument and provide highly detailed scholarly details.

Return your response strictly in the following JSON format matching the schema properties exactly:
{
  "name": "Common English Name (e.g. Madal)",
  "localName": "Nepali script / Native title (e.g. मादल)",
  "category": "Classification of musical instruments category (e.g. Membranophone, Aerophone, Chordophone, Idiophone)",
  "shortDescription": "A concise, engaging 2-to-3 sentence summary of the instrument's essence and acoustic behavior.",
  "history": "Rich paragraph outlining its traditional origins, social role (e.g., played during festivals, communities of origin like Magar, Gandharva, Newar), and history.",
  "facts": [
    "Fascinating fact 1 explaining construction or sacred symbolisms",
    "Fascinating fact 2 describing modern cultural relevance",
    "Fascinating fact 3 about cultural settings it is played in"
  ],
  "matchedInstrumentId": "Match string strictly to one of these: 'madal', 'bansuri', 'sarangi', 'murchunga' OR 'generic' if it is a different traditional Nepali instrument.",
  "playingGuidance": "Play instruction guide for playing its physical synthesis simulator (e.g. instructions on drumhead strikes, blowing simulation, fretboard slides, jaw harp plucks)."
}

Ensure the analysis is accurate. If the object is not a traditional musical instrument, try your best to identify what it is, populate the fields gracefully, set "matchedInstrumentId" to "generic", and gently nudge the user to try uploading or photographing one of Nepal's traditional physical instruments like the Madal, Flute, Sarangi, or Murchunga.
`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [imagePart, { text: promptPart }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              localName: { type: Type.STRING },
              category: { type: Type.STRING },
              shortDescription: { type: Type.STRING },
              history: { type: Type.STRING },
              facts: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              matchedInstrumentId: { type: Type.STRING },
              playingGuidance: { type: Type.STRING },
            },
            required: ["name", "localName", "category", "shortDescription", "history", "facts", "matchedInstrumentId", "playingGuidance"],
          },
        },
      });

      const jsonText = response.text;
      if (!jsonText) {
        throw new Error("Empty response received from the identification model.");
      }

      const dataResult = JSON.parse(jsonText.trim());
      res.json(dataResult);
    } catch (error: any) {
      console.error("Error identifying instrument:", error);
      res.status(500).json({ error: error?.message || "Internal Server Error in identification pipeline" });
    }
  });

  // Hot module replacement or dev/prod environments
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
