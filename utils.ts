/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// @ts-ignore
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

export const getRandomStyle = (): string => {
  const styles = [
    "formed by fluffy white clouds in a deep blue summer sky",
    "written in glowing constellations against a dark nebula galaxy",
    "arranged using colorful autumn leaves on wet green grass",
    "reflected in cyberpunk neon puddles on a rainy street",
    "drawn with latte art foam in a ceramic coffee cup",
    "glowing as ancient magical runes carved into a dark cave wall",
    "displayed on a futuristic translucent holographic interface",
    "sculpted from melting surrealist gold in a desert landscape",
    "arranged with intricate mechanical gears and steampunk machinery",
    "formed by bioluminescent jellyfish in the deep ocean",
    "composed of vibrant colorful smoke swirling in a dark room",
    "carved into the bark of an ancient mossy oak tree",
    "made of sparkling diamonds scattered on black velvet",
    "made of intertwining glowing fiber optic cables",
    "constructed from colorful plastic building blocks",
    "formed by swarms of tiny glowing golden fireflies",
    "carved into a massive glacier of translucent blue ice",
    "arranged from colorful aromatic spices on a market table",
    "woven from thick woolen yarn in a cozy knit pattern",
    "formed by splashing water droplets in zero gravity",
    "carved in a block of dark chocolate with cocoa dust",
    "made of iridescent soap bubbles floating in sunlight",
    "formed by a swarm of silver nano-bots in a lab",
    "constructed from patchwork vintage denim fabric",
    "growing as vibrant coral structures on a tropical reef",
    "composed of shattered mirror fragments reflecting light",
    "written with sparklers in long-exposure night photography"
  ];
  return styles[Math.floor(Math.random() * styles.length)];
};

export const cleanBase64 = (data: string): string => {
  // Remove data URL prefix if present to get raw base64
  // Handles generic data:application/octet-stream;base64, patterns too
  return data.replace(/^data:.*,/, '');
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Decodes raw PCM audio data (16-bit signed integer, 24kHz default) into a Web Audio API AudioBuffer.
 * This is required because Gemini TTS returns raw PCM without WAV/MP3 headers.
 */
export const createAudioBufferFromPCM = (
  ctx: AudioContext,
  base64Data: string,
  sampleRate: number = 24000
): AudioBuffer => {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Create Int16 view of the byte buffer (16-bit PCM)
  const int16Array = new Int16Array(bytes.buffer);
  
  const numChannels = 1;
  const frameCount = int16Array.length;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    // Normalize 16-bit PCM to [-1, 1] float
    channelData[i] = int16Array[i] / 32768.0;
  }
  
  return buffer;
};

export const createGifFromVideo = async (videoUrl: string): Promise<Blob> => {
  // Runtime check just in case, though standard imports should throw earlier if failed
  if (typeof GIFEncoder !== 'function') {
    throw new Error("GIF library failed to load correctly. Please refresh the page.");
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = "anonymous";
    video.src = videoUrl;
    video.muted = true;
    
    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 5; 
        const width = 400; // Downscale for speed
        // Ensure even dimensions
        let height = Math.floor((video.videoHeight / video.videoWidth) * width);
        if (height % 2 !== 0) height -= 1;

        const fps = 10;
        const totalFrames = Math.floor(duration * fps);
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        if (!ctx) throw new Error("Could not get canvas context");

        // Initialize encoder
        const gif = GIFEncoder();
        
        for (let i = 0; i < totalFrames; i++) {
          // Yield to main thread to prevent UI freeze
          await new Promise(r => setTimeout(r, 0));

          const time = i / fps;
          video.currentTime = time;
          
          // Wait for seek with timeout
          await new Promise<void>((r, rej) => {
             const timeout = setTimeout(() => {
                video.removeEventListener('seeked', seekHandler);
                // Proceed anyway if seek takes too long, though frame might be dupe
                r();
             }, 1000);

             const seekHandler = () => {
               clearTimeout(timeout);
               video.removeEventListener('seeked', seekHandler);
               r();
             };
             video.addEventListener('seeked', seekHandler);
          });
          
          ctx.drawImage(video, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const { data } = imageData;
          
          // Quantize
          const palette = quantize(data, 256);
          const index = applyPalette(data, palette);
          
          gif.writeFrame(index, width, height, { palette, delay: 1000 / fps });
        }
        
        gif.finish();
        const buffer = gif.bytes();
        resolve(new Blob([buffer], { type: 'image/gif' }));
      } catch (e) {
        console.error("GIF Generation Error:", e);
        reject(e);
      }
    };
    
    video.onerror = (e) => reject(new Error("Video load failed"));
    video.load(); 
  });
};

export const TYPOGRAPHY_SUGGESTIONS = [
  { id: 'cinematic-3d', label: 'Cinematic 3D', prompt: 'Bold, dimensional 3D text with realistic lighting and shadows, movie poster quality' },
  { id: 'neon-cyber', label: 'Neon Cyber', prompt: 'Glowing neon tube typography, cyberpunk aesthetic, vibrant bloom, rainy street reflection' },
  { id: 'liquid-metal', label: 'Liquid Metal', prompt: 'Fluid, melting chrome typography, surreal and reflective, mercury texture' },
  { id: 'retro-80s', label: 'Retro 80s', prompt: 'Chrome-plated, synthwave style typography with horizon lines, lasers, and sparkles' },
  { id: 'handwritten', label: 'Handwritten', prompt: 'Organic, flowing handwritten brush script, artistic ink splatter, personal touch' },
  { id: 'fire-smoke', label: 'Fire & Smoke', prompt: 'Typography formed from swirling fire and thick colorful smoke, dynamic and energetic' },
  { id: 'ice-crystal', label: 'Ice Crystal', prompt: 'Carved into a massive glacier of translucent blue ice, frost particles, cold atmosphere' },
  { id: 'botanical', label: 'Botanical', prompt: 'Typography intertwined with vines, flowers, and organic nature elements, forest setting' },
  { id: 'glitch-art', label: 'Glitch Art', prompt: 'Distorted, pixelated glitch art typography with chromatic aberration, data corruption' },
  { id: 'gold-lux', label: 'Gold Luxury', prompt: 'Solid gold typography with diamond inlays, luxurious studio lighting, caustic reflections' },
  { id: 'cloud-sky', label: 'Cloud Form', prompt: 'Formed by fluffy white clouds in a deep blue summer sky, soft and airy' },
  { id: 'lego-brick', label: 'Plastic Brick', prompt: 'Constructed from colorful plastic building blocks, playful and toy-like' },
  { id: 'paper-craft', label: 'Paper Craft', prompt: 'Layered colored paper construction, depth shadows, origami aesthetic' },
  { id: 'noir-detective', label: 'Film Noir', prompt: 'High contrast black and white, dramatic venetian blind shadows, mystery' },
  { id: 'candy-pop', label: 'Candy Pop', prompt: 'Glossy, sugary texture, vibrant pastel colors, sprinkles and lollipop aesthetic' },
  { id: 'stone-carved', label: 'Ancient Stone', prompt: 'Carved into an ancient mossy stone tablet, weathered texture, mystical lighting' },
  { id: 'matrix-code', label: 'Matrix Code', prompt: 'Falling green digital code rain forming the typography, hacker aesthetic' },
  { id: 'watercolor', label: 'Watercolor', prompt: 'Soft bleeding watercolor paints on textured paper, gentle artistic gradients' }
];

export const AUDIO_MOODS = [
  { id: 'auto', label: 'Auto-Match Video', prompt: '' },
  { id: 'cinematic', label: 'Epic Cinematic', prompt: 'Epic, orchestral, dramatic score with deep bass' },
  { id: 'lofi', label: 'Chill / Lo-Fi', prompt: 'Relaxing, low fidelity beats, soft jazz chords, vinyl crackle' },
  { id: 'synthwave', label: 'Synthwave', prompt: 'Retro 80s synthesizers, pulsing bassline, futuristic' },
  { id: 'nature', label: 'Nature Ambience', prompt: 'Peaceful nature sounds, birds chirping, wind, flowing water' },
  { id: 'dark', label: 'Dark / Horror', prompt: 'Eerie, unsettling industrial drone, suspenseful atmosphere' },
  { id: 'upbeat', label: 'Upbeat Pop', prompt: 'Cheerful, energetic, happy melody, catchy rhythm' }
];
