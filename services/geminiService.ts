
import { GoogleGenAI, Type } from "@google/genai";
import { OfficialType, Complaint } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const checkContent = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the tone and content of this complaint: "${text}"`,
    config: {
      systemInstruction: `You are a content moderator for a government portal. 
      Check if the message contains vulgarity, abusive language, or an inappropriately aggressive tone in either English or Tamil.
      Respond with JSON.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isSafe: { type: Type.BOOLEAN },
          reason: { type: Type.STRING, description: "Reason in both English and Tamil if unsafe" }
        },
        required: ["isSafe", "reason"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const classifyToDepartment = async (description: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Route this complaint: "${description}"`,
    config: {
      systemInstruction: `Assign this complaint to exactly one department: Water, Roads, Electricity, or Sanitation. Provide a short summary.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          department: { type: Type.STRING },
          summary: { type: Type.STRING }
        },
        required: ["department", "summary"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const chatWithAssistant = async (message: string, contextComplaints: Complaint[]) => {
  const complaintsContext = contextComplaints.map(c => 
    `ID: ${c.id}, Status: ${c.status}, Dept: ${c.department}, Summary: ${c.aiSummary}`
  ).join('\n');

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: message,
    config: {
      systemInstruction: `You are the Civic Resolve Assistant. 
      Users will ask about their complaint status or about municipal laws and procedures.
      Use the following context of user complaints if they ask about their issues:
      ${complaintsContext}
      
      Always be polite. Support both English and Tamil. 
      If asked about laws, provide general procedural knowledge (e.g., RTI acts, municipal bylaws).`
    }
  });
  return response.text;
};
