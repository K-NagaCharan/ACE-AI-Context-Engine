const { summarizeContext } = require("../src/core/ai");

// Mock OpenAI client
jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };
  });
});

const OpenAI = require("openai");

describe("AI Context Summarization JSON Parsing", () => {
  let mockCreate;
  let mockClientInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClientInstance = new OpenAI();
    OpenAI.mockImplementation(() => mockClientInstance);
    mockCreate = mockClientInstance.chat.completions.create;
    process.env.ACE_API_KEY = "test-key";
    process.env.ACE_BASE_URL = "test-url";
    process.env.ACE_MODEL = "test-model";
  });

  test("should successfully parse clean JSON", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '{"summary": "Clean JSON", "key_changes": ["change 1"], "impact": "None"}' } }]
    });

    const result = await summarizeContext({ message: "msg", files: [], diff: "", note: "" });
    expect(result).toEqual({
      summary: "Clean JSON",
      key_changes: ["change 1"],
      impact: "None"
    });
  });

  test("should successfully parse JSON wrapped in markdown code blocks", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '```json\n{\n  "summary": "Markdown JSON",\n  "key_changes": ["change 2"],\n  "impact": "Low"\n}\n```' } }]
    });

    const result = await summarizeContext({ message: "msg", files: [], diff: "", note: "" });
    expect(result).toEqual({
      summary: "Markdown JSON",
      key_changes: ["change 2"],
      impact: "Low"
    });
  });

  test("should successfully parse JSON surrounded by conversational text", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Sure, here is the result you requested:\n\n{\n  "summary": "Fluffy JSON",\n  "key_changes": ["change 3"],\n  "impact": "High"\n}\n\nHope this helps!' } }]
    });

    const result = await summarizeContext({ message: "msg", files: [], diff: "", note: "" });
    expect(result).toEqual({
      summary: "Fluffy JSON",
      key_changes: ["change 3"],
      impact: "High"
    });
  });

  test("should throw an error on completely invalid JSON", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'This is not JSON at all' } }]
    });

    await expect(summarizeContext({ message: "msg", files: [], diff: "", note: "" })).rejects.toThrow("AI returned invalid JSON.");
  });
});
