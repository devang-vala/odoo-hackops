import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are an AI Based Profanity Detector.
Your response must be a JSON object containing:
- profanity_included: true or false
- censored: asterisk-censored version of input if profanity detected`,
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export async function POST(req) {
  try {
    const { message } = await req.json();

    const chat = model.startChat({ generationConfig, safetySettings });
    const result = await chat.sendMessage(message);

    const parsed = JSON.parse(result.response.candidates[0].content.parts[0].text);

    return Response.json({
      message: "Text Successfully Processed!",
      result: parsed,
    });
  } catch (error) {
    console.error("Detection Error:", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
