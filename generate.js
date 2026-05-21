import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const [,, promptPath, outputPath] = process.argv;

async function run() {
  if (!promptPath || !outputPath) {
    console.error("Usage: node generate.js sprint2_prompt.txt src/path/to/file.tsx");
    process.exit(1);
  }

  // Read the prompt directly from the text file rather than a terminal string
  console.log(`📖 Reading prompt specification from: ${promptPath}`);
  const promptContent = fs.readFileSync(promptPath, 'utf8');

  console.log(`🤖 Requesting deep code generation for: ${path.basename(outputPath)}...`);
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: promptContent + "\n\nOutput ONLY valid TypeScript/TSX code. Do not include markdown code blocks, backticks, explanations, or prose.",
  });

  const targetDir = path.dirname(outputPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let cleanCode = response.text.trim();
  if (cleanCode.startsWith('```')) {
    cleanCode = cleanCode.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
  }

  fs.writeFileSync(outputPath, cleanCode, 'utf8');
  console.log(`✨ Successfully generated clean architecture component at: ${outputPath}`);
}

run().catch(console.error);