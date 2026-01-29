const OpenAI = require("openai");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const modelsToTest = [
  "google/gemini-2.0-flash-exp:free",
  "mistralai/mistral-7b-instruct:free",
  "openai/gpt-3.5-turbo"
];

async function testModel(modelName) {
  console.log(`\nTesting Model: ${modelName}...`);

  if (!OPENROUTER_API_KEY) {
    console.error("OPENROUTER_API_KEY não definido nas variáveis de ambiente.");
    return false;
  }
  
  const client = new OpenAI({
    apiKey: OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });

  try {
    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: "user", content: "Olá, teste de conexão. Responda 'OK'." },
      ],
      max_tokens: 10,
    });
    
    console.log(`[SUCCESS] Response: ${completion.choices[0].message.content}`);
    return true;
  } catch (error) {
    console.error(`[FAILED] Error: ${error.message}`);
    if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

async function runTests() {
  console.log("Starting LLM Connectivity Tests (OpenRouter)...");
  
  for (const model of modelsToTest) {
    await testModel(model);
  }
}

runTests();
