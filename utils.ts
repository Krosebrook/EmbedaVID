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
  { id: 'cinematic-3d', label: 'Cinematic 3D', prompt: 'Bold, dimensional 3D text with realistic lighting and shadows' },
  { id: 'neon-cyber', label: 'Neon Cyber', prompt: 'Glowing neon tube typography, cyberpunk aesthetic, vibrant bloom' },
  { id: 'elegant-serif', label: 'Elegant Serif', prompt: 'Refined, high-contrast serif typography, luxury editorial look' },
  { id: 'bold-sans', label: 'Bold Sans', prompt: 'Massive, heavy sans-serif typography, geometric and impactful' },
  { id: 'handwritten', label: 'Handwritten', prompt: 'Organic, flowing handwritten brush script, artistic and personal' },
  { id: 'retro-80s', label: 'Retro 80s', prompt: 'Chrome-plated, synthwave style typography with horizon lines and sparkles' },
  { id: 'liquid-metal', label: 'Liquid Metal', prompt: 'Fluid, melting chrome typography, surreal and reflective' },
  { id: 'botanical', label: 'Botanical', prompt: 'Typography intertwined with vines, flowers, and organic nature elements' },
  { id: 'glitch', label: 'Glitch', prompt: 'Distorted, pixelated glitch art typography with chromatic aberration' },
  { id: 'surrealist', label: 'Surrealist', prompt: 'Dreamlike surrealist typography, melting clocks, floating objects, Salvador Dali style' },
  { id: 'retro-futurism', label: 'Retro Futurism', prompt: '50s sci-fi aesthetic, chrome curves, atomic age symbols, flying cars vibe' },
  { id: 'art-deco', label: 'Art Deco', prompt: 'Luxurious 1920s Gatsby style, gold geometric patterns, black marble, symmetrical' },
  { id: 'abstract-exp', label: 'Abstract Exp.', prompt: 'Chaotic splashes of paint, emotional strokes, Pollock style, vibrant texture' },
  { id: 'pop-art', label: 'Pop Art', prompt: 'Comic book style, halftone dots, bold black outlines, primary colors, Lichtenstein vibe' },
  { id: 'noir', label: 'Noir', prompt: 'High contrast black and white, dramatic shadows, rain-slicked streets, detective mystery' },
  { id: 'paper-cutout', label: 'Paper Cutout', prompt: 'Layered colored paper construction, depth shadows, craft aesthetic' },
  { id: 'low-poly', label: 'Low Poly', prompt: 'Faceted geometric shapes, digital polygon mesh, vivid flat shading' },
  { id: 'watercolor', label: 'Watercolor', prompt: 'Soft bleeding watercolor paints, paper texture, gentle gradients, artistic' },
  { id: 'claymation', label: 'Claymation', prompt: 'Hand-sculpted plasticine texture, fingerprints, stop-motion look' },
  { id: 'blueprint', label: 'Blueprint', prompt: 'Technical architectural drawing, white lines on blue grid, construction measurements' },
  { id: 'matrix', label: 'Matrix Code', prompt: 'Falling green digital code rain forming the typography, cyberpunk hacker aesthetic' }
];