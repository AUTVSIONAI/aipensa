import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface GenerateImageRequest {
  prompt: string;
  apiKey?: string;
  model?: string;
}

interface GenerateImageResponse {
  url: string;
  fileName: string;
  filePath: string;
}

const GenerateImageService = async ({
  prompt,
  apiKey,
  model
}: GenerateImageRequest): Promise<GenerateImageResponse> => {
  const resolvedApiKey = apiKey || process.env.HUGGINGFACE_API_KEY;
  const resolvedModel = model || process.env.HUGGINGFACE_MODEL || "stabilityai/stable-diffusion-3.5-large"; // Default model if not set

  if (!resolvedApiKey) {
    throw new Error("HUGGINGFACE_API_KEY is not defined in environment variables or settings.");
  }

  const modelsToTry = [
    model, // Modelo preferencial do usuário/env
    process.env.HUGGINGFACE_MODEL, // Modelo do env original
    "stabilityai/stable-diffusion-3.5-large", // Novo modelo sugerido
    "black-forest-labs/FLUX.1-dev", // Modelo muito popular e bom
    "stabilityai/stable-diffusion-xl-base-1.0" // Fallback clássico
  ].filter(m => m && m.trim() !== ""); // Remove vazios

  const uniqueModels = [...new Set(modelsToTry)]; // Remove duplicatas

  let lastError = null;

  for (const currentModel of uniqueModels) {
      const apiUrl = `https://api-inference.huggingface.co/models/${currentModel}`;
      try {
        console.log(`[HuggingFaceService] Generating image with model ${currentModel}...`);
        const response = await axios.post(
          apiUrl,
          { inputs: prompt },
          {
            headers: {
              Authorization: `Bearer ${resolvedApiKey}`,
              "Content-Type": "application/json"
            },
            responseType: "arraybuffer" 
          }
        );
    
        const buffer = Buffer.from(response.data, "binary");
        const fileName = `${uuidv4()}.png`;
        
        // Ensure directory exists
        const publicFolder = path.resolve(__dirname, "..", "..", "..", "public", "generated");
        if (!fs.existsSync(publicFolder)) {
          fs.mkdirSync(publicFolder, { recursive: true });
          fs.chmodSync(publicFolder, 0o777);
        }
    
        const filePath = path.join(publicFolder, fileName);
        fs.writeFileSync(filePath, buffer);
    
        const backendUrl = process.env.BACKEND_URL || "https://api.aipensa.com";
        const url = `${backendUrl}/public/generated/${fileName}`;
    
        console.log(`[HuggingFaceService] Image generated successfully with ${currentModel}: ${url}`);
        return { url, fileName, filePath };

      } catch (error: any) {
        console.warn(`[HuggingFaceService] Failed with model ${currentModel}:`, error.response?.data ? JSON.stringify(error.response.data) : error.message);
        lastError = error;
        // Continue to next model
      }
  }

  throw new Error(`All Hugging Face models failed. Last error: ${lastError?.message || "Unknown error"}`);
};

export default GenerateImageService;
