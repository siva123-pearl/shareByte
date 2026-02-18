
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const getGeminiStream = async (prompt: string, location?: { latitude: number, longitude: number }) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  return ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      tools: [{ googleMaps: {} }, { googleSearch: {} }],
      toolConfig: {
        retrievalConfig: location ? {
          latLng: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        } : undefined
      }
    },
  });
};

export const suggestVanStops = async (lat: number, lng: number) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Based on current coordinates ${lat}, ${lng}, suggest 3 optimal high-traffic stops for a mobile food donation van. Consider public parks, community centers, or transit hubs.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      }
    },
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return groundingChunks
    .filter((chunk: any) => chunk.maps)
    .map((chunk: any) => ({
      name: chunk.maps.title,
      uri: chunk.maps.uri,
    }));
};

export const findDonationPlaces = async (lat: number, lng: number) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Find the 3 nearest food banks or donation centers near coordinates ${lat}, ${lng}.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      }
    },
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return groundingChunks
    .filter((chunk: any) => chunk.maps)
    .map((chunk: any) => ({
      name: chunk.maps.title,
      uri: chunk.maps.uri,
    }));
};

export const analyzeFoodImage = async (base64Image: string) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
        { text: "Analyze this food item. Provide a JSON response with: name, category, approximate quantity, and storage/safety advice. Focus on whether it is safe to donate." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          quantity: { type: Type.STRING },
          advice: { type: Type.STRING },
          safeToDonate: { type: Type.BOOLEAN }
        },
        required: ["name", "category", "quantity", "advice", "safeToDonate"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return null;
  }
};
