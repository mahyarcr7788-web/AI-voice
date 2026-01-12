
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

// Use process.env.API_KEY directly in the function scope as per guidelines.

export async function generateSpeech(text: string, voiceName: string): Promise<string> {
  // Always use new GoogleGenAI({apiKey: process.env.API_KEY}) directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Please speak the following text: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    // Extract candidates from response
    const candidate = response.candidates?.[0];
    if (!candidate) {
      throw new Error("The model did not return any candidates. Check safety filters or input length.");
    }

    let base64Audio: string | undefined;
    
    // Iterate through parts to find the audio data part
    if (candidate.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data && part.inlineData.mimeType.includes('audio')) {
          base64Audio = part.inlineData.data;
          break;
        }
      }
    }

    if (!base64Audio) {
      // Accessing response.text as a property, not a method, as per guidelines.
      const responseText = response.text;
      if (responseText) {
        throw new Error(`The model returned text instead of audio: ${responseText}`);
      }
      throw new Error("No audio data returned from Gemini API. This can happen if the content was filtered by safety systems.");
    }

    return base64Audio;
  } catch (error: any) {
    console.error("Gemini TTS Error Detail:", error);
    throw error;
  }
}
