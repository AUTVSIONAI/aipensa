
const OpenAI = require("openai");

// Hardcoded for testing - DO NOT COMMIT
const OPENROUTER_API_KEY = "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";

const modelsToTest = [
  "google/gemini-2.0-flash-exp:free",
  "mistralai/mistral-7b-instruct:free",
  "openai/gpt-3.5-turbo"
];

async function testModel(modelName) {
  console.log(`\nTesting Model: ${modelName}...`);
  
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
