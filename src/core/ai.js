require("dotenv").config();
const OpenAI = require("openai");

const { validateAIEnv } = require("./env");

/**
 * Generate AI summary from context
 */
async function summarizeContext(context) {
  validateAIEnv();

  const client = new OpenAI({
    apiKey: process.env.ACE_API_KEY,
    baseURL: process.env.ACE_BASE_URL,
  });

  const prompt = `
You are an AI assistant helping summarize software development progress.

Analyze the following commit context.

Return ONLY valid JSON.

Required JSON format:
{
  "summary": "short summary",
  "key_changes": [
    "change 1",
    "change 2"
  ],
  "impact": "why this matters"
}
Keep each key_change under 10 words.
Be brief and specific.

Commit Message:
${context.message}

Files Changed:
${context.files.join(", ")}

Developer Note:
${context.note || "None"}

Code Diff:
${context.diff}
`;

  const response =
    await client.chat.completions.create({
      model: process.env.ACE_MODEL,

      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.2,
    });

  const text =
    response.choices[0].message.content;

  try {
    const match = text.match(/\{[\s\S]*\}/);
    const cleaned = match ? match[0] : text;
    return JSON.parse(cleaned);
  } catch {
    throw new Error(
      "AI returned invalid JSON."
    );
  }
}

module.exports = {
  summarizeContext,
};