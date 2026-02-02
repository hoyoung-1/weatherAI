import { GoogleGenAI, Type } from "@google/genai";
import { WeatherData, WeatherSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-3-flash-preview
const MODEL_NAME = "gemini-3-flash-preview";

export const getCitySuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.length < 1) return [];

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `User input: "${query}". Suggest up to 5 valid Korean city or district names that match or sound similar to the input. Return only the names in a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as string[];
    }
    return [];
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};

export const getWeatherData = async (location: string): Promise<WeatherData> => {
  try {
    // Use Google Search to get real data
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Search for the current weather, 24-hour hourly forecast, and 7-day weekly forecast for "${location}" in South Korea.
      
      Based ONLY on the search results, create a JSON object with the exact structure below.
      IMPORTANT: 
      1. Return ONLY the raw JSON string. Do not use Markdown code blocks.
      2. If specific hourly/weekly data is missing in search results, infer it reasonably from the available forecast data.
      3. Translate 'condition' to one of: Sunny, Cloudy, Rainy, Snowy, Stormy, PartlyCloudy.
      4. Translate 'description' and 'day' to Korean.

      JSON Structure:
      {
        "locationName": "City Name (Korean)",
        "current": {
          "temp": number (Celsius),
          "condition": "Sunny" | "Cloudy" | "Rainy" | "Snowy" | "Stormy" | "PartlyCloudy",
          "humidity": number (0-100),
          "windSpeed": number (m/s),
          "description": "Short Korean description"
        },
        "hourly": [
          { "time": "HH:00", "temp": number, "condition": "String" }
          // ... (24 items)
        ],
        "weekly": [
          { "day": "Day Name (Korean)", "maxTemp": number, "minTemp": number, "condition": "String" }
          // ... (7 items)
        ]
      }`,
      config: {
        tools: [{ googleSearch: {} }],
        // responseSchema is removed to allow the model to process search results naturally before formatting
      }
    });

    // Parse JSON manually from text response
    let jsonStr = response.text || "{}";
    // Remove markdown code blocks if present
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let data: WeatherData;
    try {
      data = JSON.parse(jsonStr) as WeatherData;
    } catch (e) {
      console.error("Failed to parse weather JSON:", jsonStr);
      throw new Error("Invalid weather data format received");
    }

    // Extract grounding sources (URLs)
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: WeatherSource[] = [];
    
    chunks.forEach((chunk: any) => {
        if (chunk.web) {
            sources.push({
                title: chunk.web.title,
                uri: chunk.web.uri
            });
        }
    });

    // Remove duplicates based on URI
    data.sources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
};