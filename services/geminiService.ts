/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { GoogleGenAI, Modality, Type } from "@google/genai";
import { cleanBase64 } from "../utils";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const classifyContext = async (role: string, task: string, env: string): Promise<{domain: string, risk: 'Low' | 'Medium' | 'High'}> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze user context: Role=${role}, Task=${task}, Environment=${env}. 
      Determine the Prompt Domain and Risk Level (Low/Medium/High).
      Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            domain: { type: Type.STRING },
            risk: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
          },
          required: ['domain', 'risk']
        }
      }
    });
    return JSON.parse(response.text || '{"domain": "General", "risk": "Low"}');
  } catch (e) {
    return { domain: "General", risk: "Low" };
  }
};

export const validatePromptSafety = async (prompt: string): Promise<{safe: boolean, reason?: string}> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Evaluate the following prompt for PII, malicious code, or enterprise policy violations: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safe: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          },
          required: ['safe']
        }
      }
    });
    return JSON.parse(response.text || '{"safe": true}');
  } catch (e) {
    return { safe: true };
  }
};

// ... Rest of the existing file content ...
const createBlankImage = (width: number, height: number): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  }
  const dataUrl = canvas.toDataURL('image/png');
  return cleanBase64(dataUrl);
};

export const generateStyleSuggestion = async (text: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a single, creative, short (10-15 words) visual art direction description for a cinematic text animation of the word/phrase: "${text}". 
      Focus on material, lighting, and environment. 
      Output ONLY the description.`
    });
    return response.text?.trim() || "";
  } catch (e) {
    console.error("Failed to generate style suggestion", e);
    return "";
  }
};

interface TextImageOptions {
  text: string;
  style: string;
  typographyPrompt?: string;
  referenceImage?: string; 
  resolution?: '1080p' | '4K';
}

export const generateTextImage = async ({ text, style, typographyPrompt, referenceImage, resolution = '1080p' }: TextImageOptions): Promise<{ data: string, mimeType: string }> => {
  const ai = getAI();
  const parts: any[] = [];
  
  const typoInstruction = typographyPrompt && typographyPrompt.trim().length > 0 
    ? typographyPrompt 
    : "High-quality, creative typography. Legible and artistic.";

  if (referenceImage) {
    const [mimeTypePart, data] = referenceImage.split(';base64,');
    parts.push({
      inlineData: {
        data: data,
        mimeType: mimeTypePart.replace('data:', '')
      }
    });
    parts.push({ text: `Analyze the visual style and create a NEW high-res cinematic image with text "${text}". Additional style: ${style}.` });
  } else {
    parts.push({ text: `A cinematic image featuring the text "${text}". Visual Style: ${style}.` });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts },
      config: {
        imageConfig: { aspectRatio: "16:9", imageSize: resolution === '4K' ? '4K' : '1K' }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return { data: part.inlineData.data, mimeType: part.inlineData.mimeType || 'image/png' };
      }
    }
    throw new Error("No image generated");
  } catch (error: any) {
    throw error;
  }
};

export const generateTextVideo = async (text: string, imageBase64: string, imageMimeType: string, promptStyle: string, resolution: '720p' | '1080p' | '4K' = '720p'): Promise<string> => {
  const ai = getAI();
  const cleanImageBase64 = cleanBase64(imageBase64);
  const videoResolution = resolution === '4K' ? '1080p' : resolution;
  const width = videoResolution === '1080p' ? 1920 : 1280;
  const height = videoResolution === '1080p' ? 1080 : 720;

  const startImage = createBlankImage(width, height);
  const operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `The text "${text}" gradually materializes. ${promptStyle}.`,
    image: { imageBytes: startImage, mimeType: 'image/png' },
    config: {
      numberOfVideos: 1,
      resolution: videoResolution,
      aspectRatio: '16:9',
      lastFrame: { imageBytes: cleanImageBase64, mimeType: imageMimeType }
    }
  });

  let op = await pollForVideo(operation);
  if (op.response?.generatedVideos?.[0]?.video?.uri) {
    return await fetchVideoBlob(op.response.generatedVideos[0].video.uri);
  }
  throw new Error("Video failed");
};

const pollForVideo = async (operation: any) => {
  const ai = getAI();
  let op = operation;
  while (!op.done) {
    await sleep(5000); 
    op = await ai.operations.getVideosOperation({ operation: op });
  }
  return op;
};

const fetchVideoBlob = async (uri: string) => {
  const url = `${uri}${uri.includes('?') ? '&' : '?'}key=${process.env.API_KEY}`;
  const videoResponse = await fetch(url);
  const blob = await videoResponse.blob();
  return URL.createObjectURL(blob);
};

export const generateAmbientSound = async (text: string, style: string): Promise<string | null> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Tone: ${style}. Voiceover: "${text}"` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (e) {
    return null;
  }
};