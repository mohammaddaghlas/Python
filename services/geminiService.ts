import { GoogleGenAI } from "@google/genai";
import { COURSE_CONTENT } from "../constants";
import { Message, Sender } from "../types";

let ai: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!ai) {
    // Safety check for process.env in case code runs in browser without polyfills
    const apiKey = (typeof process !== 'undefined' && process.env) 
      ? process.env.API_KEY 
      : undefined;

    if (!apiKey) {
      console.warn("API Key not found in process.env");
    }
    
    // We attempt to initialize even if key is missing, to allow the error to be caught later
    // rather than crashing the app initialization.
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
    }
  }
  return ai;
};

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string
): Promise<string> => {
  try {
    const client = getAIClient();
    
    if (!client) {
        // Double check if key exists now (in case it was injected late) or throw clear error
        const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;
        if (!apiKey) {
             return "Error: API Key configuration missing. Please ensure API_KEY is set in your environment variables.";
        }
        ai = new GoogleGenAI({ apiKey });
    }
    
    // If we still don't have a client, something is wrong
    if (!ai) return "Error: Could not initialize AI client.";

    const model = "gemini-3-flash-preview";
    
    // Construct the conversation history for context
    const recentHistory = history.slice(-10);
    
    let chatHistory = "";
    recentHistory.forEach(msg => {
      const role = msg.sender === Sender.User ? "Student" : "Tutor";
      chatHistory += `${role}: ${msg.text}\n`;
    });

    const prompt = `
      ${COURSE_CONTENT}

      Current Conversation:
      ${chatHistory}
      Student: ${newMessage}
      Tutor:
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      config: {
        temperature: 0.3,
        systemInstruction: `
          You are a strict but helpful Python tutor for Dr. Ahmed Alia's CAP course.
          
          GUIDELINES:
          1. Answer ONLY based on the provided curriculum content.
          2. Use Markdown formatting extensively to make the output clean and readable.
             - Use **bold** for key concepts.
             - Use \`inline code\` for variable names or short snippets.
             - Use fenced code blocks (\`\`\`python ... \`\`\`) for examples.
          3. When writing code examples, include comments to explain lines, preferably in the same language as the user's question (e.g., Arabic comments if the user asks in Arabic).
          4. If the topic is outside the provided notes, politely decline.
          5. Keep explanations concise and structured.
        `,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response based on the course material.";
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return "Error: Unable to connect to the AI tutor. Please check your API key or try again later.";
  }
};