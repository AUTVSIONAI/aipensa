import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Prompt from "../../models/Prompt";
import ShowPromptService from "./ShowPromptService";

interface PromptData {
  id?: number;
  name: string;
  apiKey?: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  queueId?: number;
  maxMessages?: number;
  companyId: string | number;
  voice?: string;
  voiceKey?: string;
  voiceRegion?: string;
  provider?: string;
  model?: string;
}

interface Request {
  promptData: PromptData;
  promptId: string | number;
  companyId: string | number;
}

const UpdatePromptService = async ({
  promptId,
  promptData,
  companyId
}: Request): Promise<Prompt | undefined> => {
  const promptTable = await ShowPromptService({
    promptId: promptId,
    companyId
  });

  const promptSchema = Yup.object().shape({
    name: Yup.string().required("ERR_PROMPT_NAME_INVALID"),
    prompt: Yup.string().required("ERR_PROMPT_PROMPT_INVALID"),
    queueId: Yup.number().required("ERR_PROMPT_QUEUEID_INVALID"),
    maxMessages: Yup.number().required("ERR_PROMPT_MAX_MESSAGES_INVALID"),
    provider: Yup.string()
      .oneOf(["openai", "gemini", "openrouter", "external"])
      .required("ERR_PROMPT_PROVIDER_INVALID"),
    model: Yup.string().required("ERR_PROMPT_MODEL_INVALID")
  });

  const {
    name,
    apiKey,
    prompt,
    maxTokens,
    temperature,
    promptTokens,
    completionTokens,
    totalTokens,
    queueId,
    maxMessages,
    voice,
    voiceKey,
    voiceRegion,
    provider,
    model
  } = promptData;

  try {
    await promptSchema.validate({
      name,
      prompt,
      maxTokens,
      temperature,
      promptTokens,
      completionTokens,
      totalTokens,
      queueId,
      maxMessages,
      provider,
      model
    });
  } catch (err) {
    throw new AppError(`${JSON.stringify(err, undefined, 2)}`);
  }

  // Fallback: usar chave da plataforma quando não informada
  let effectiveApiKey = apiKey;
  if (!effectiveApiKey || effectiveApiKey.trim() === "") {
    if (provider === "openrouter") {
      effectiveApiKey = process.env.OPENROUTER_API_KEY || "";
    } else if (provider === "gemini") {
      effectiveApiKey = process.env.GEMINI_API_KEY || "";
    } else if (provider === "external") {
      effectiveApiKey = process.env.EXTERNAL_AGENT_API_KEY || "";
    } else {
      effectiveApiKey = process.env.OPENAI_API_KEY || "";
    }
  }

  await promptTable.update({
    name,
    apiKey: effectiveApiKey,
    prompt,
    maxTokens,
    temperature,
    promptTokens,
    completionTokens,
    totalTokens,
    queueId,
    maxMessages,
    voice,
    voiceKey,
    voiceRegion,
    provider,
    model
  });
  await promptTable.reload();
  return promptTable;
};

export default UpdatePromptService;
