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
  const modelsToTry = [
    model, 
    process.env.HUGGINGFACE_MODEL, 
    "stabilityai/stable-diffusion-3.5-large", 
    "stabilityai/stable-diffusion-3.5-large-turbo",
    "black-forest-labs/FLUX.1-dev",
    "stabilityai/stable-diffusion-xl-base-1.0",
    "runwayml/stable-diffusion-v1-5",
    "prompthero/openjourney"
  ].filter(Boolean); // Remove undefined/null

  // Remove duplicatas
  const uniqueModels = [...new Set(modelsToTry)];

  if (!resolvedApiKey) {
    throw new Error("HUGGINGFACE_API_KEY is not defined in environment variables or settings.");
  }

  let lastError;

  for (const currentModel of uniqueModels) {
      if (!currentModel) continue;
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
            responseType: "arraybuffer" // Important for image data
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
        console.log(`[HuggingFaceService] Saved to: ${filePath}`);

        return { url, fileName, filePath };
      } catch (error: any) {
        console.error(`[HuggingFaceService] Error generating image with ${currentModel}:`, error.response?.data || error.message);
        lastError = error;
        // Continue to next model
      }
  }

  throw new Error(`Failed to generate image after trying models: ${uniqueModels.join(", ")}. Last error: ${lastError?.message}`);
};

export default GenerateImageService;
