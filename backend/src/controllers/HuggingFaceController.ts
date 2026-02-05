import { Request, Response } from "express";
import GenerateImageService from "../services/HuggingFaceService/GenerateImageService";

export const generate = async (req: Request, res: Response): Promise<Response> => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const result = await GenerateImageService({ prompt });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
