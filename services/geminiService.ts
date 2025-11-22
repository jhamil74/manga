
import { GoogleGenAI } from "@google/genai";
import { AnalysisData } from "../types";

/**
 * Converts a File object to a Base64 string (raw data without prefix).
 */
export const fileToGenerativePart = async (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        data: base64Data,
        mimeType: file.type,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Sends the image to Gemini 3 Pro to get a structured JSON classification and description.
 */
export const analyzeImageWithGemini = async (file: File): Promise<AnalysisData> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing. Please check your environment configuration.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const imagePart = await fileToGenerativePart(file);

    const prompt = `
      Analiza la imagen proporcionada actuando como un crítico experto en arte de Manga, Anime y Manhwa.
      Devuelve un objeto JSON estricto (sin markdown, sin bloques de código) con la siguiente estructura.

      Reglas de análisis:
      1. 'valid': true si es manga/anime/manhwa/manhua. false si es una foto real, texto o algo no relacionado.
      2. 'title': Identifica el nombre oficial de la obra (ej: "Berserk", "Solo Leveling"). Si no es una obra conocida, inventa un título poético en Español.
      3. 'format': Clasifica exactamente como "Manga" (Japonés), "Manhwa" (Coreano), "Manhua" (Chino) o "Anime Art" (Ilustración a color).
      4. 'demographic': Clasifica como "Shonen", "Shojo", "Seinen", "Josei", "Kodomomuke" o "N/A".
      5. 'genres': Un array de 3 a 6 géneros (ej: Acción, Slice of Life, Horror, Cyberpunk, Fantasía Oscura).
      6. 'description': Una descripción evocadora y didáctica en español de lo que sucede en la imagen, enfocándose en la composición y el sentimiento.
      7. 'score': Un número del 1 al 10 (acepta decimales, ej: 8.5). Basado en la calidad del arte, la composición y (si reconoces la obra) la popularidad crítica general. Sé estricto pero justo.
      8. 'error_message': Si valid es false, explica cortésmente por qué en español.

      Response schema example:
      {
        "valid": true,
        "title": "Berserk",
        "format": "Manga",
        "demographic": "Seinen",
        "genres": ["Psychological", "Horror"],
        "description": "Texto detallado...",
        "score": 9.5
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      config: {
        responseMimeType: "application/json"
      },
      contents: {
        parts: [
          {
            inlineData: {
              data: imagePart.data,
              mimeType: imagePart.mimeType
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    let text = response.text;
    if (!text) {
      throw new Error("No data was generated.");
    }

    // CLEANUP: Robust JSON extraction
    text = text.trim(); // FIX: Trim BEFORE checking startsWith to avoid whitespace errors
    
    // Remove markdown code blocks if present
    if (text.startsWith('```')) {
        text = text.replace(/^```(json)?\n?/, '').replace(/```$/, '');
    }
    
    // Final safety trim
    text = text.trim();

    // Optional: Locate the first '{' and last '}' to ignore any preamble text
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.substring(firstBrace, lastBrace + 1);
    }

    // Parse JSON
    const data: AnalysisData = JSON.parse(text);

    // Validate logic
    if (!data.valid) {
      throw new Error(data.error_message || "La imagen no parece ser contenido de Manga/Anime válido.");
    }

    return data;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      // Improve error message for JSON parsing
      if (error.message.includes("JSON")) {
          throw new Error("Error interpretando la respuesta de la IA. Intenta de nuevo.");
      }
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred while analyzing the image.");
  }
};
