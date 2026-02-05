import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface GenerateImageRequest {
  prompt: string;
}

interface GenerateImageResponse {
  url: string;
  fileName: string;
}

const GenerateImageService = async ({
  prompt
}: GenerateImageRequest): Promise<GenerateImageResponse> => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const model = process.env.HUGGINGFACE_MODEL || "stabilityai/stable-diffusion-3.5-large"; // Default model if not set

  if (!apiKey) {
    throw new Error("HUGGINGFACE_API_KEY is not defined in environment variables.");
  }

  const apiUrl = `https://api-inference.huggingface.co/models/${model}`;

  try {
    console.log(`[HuggingFaceService] Generating image with model ${model}...`);
    const response = await axios.post(
      apiUrl,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
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
    }

    const filePath = path.join(publicFolder, fileName);
    fs.writeFileSync(filePath, buffer);

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
    const url = `${backendUrl}/public/generated/${fileName}`;

    console.log(`[HuggingFaceService] Image generated successfully: ${url}`);

    return { url, fileName };
  } catch (error: any) {
    console.error("[HuggingFaceService] Error generating image:", error.response?.data || error.message);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
};

export default GenerateImageService;
