
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export interface InsuranceData {
    gl_occurrence: number | null;
    additional_insured: boolean | null;
    expiry_date: string | null; // ISO Date YYYY-MM-DD
}

export async function extractInsuranceData(markdown: string): Promise<InsuranceData> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are an expert insurance analyst. Extract the following information from the provided ACORD 25 Certificate of Insurance (in Markdown format):
        1. General Liability (GL) Occurrence Limit (integer). Look for "EACH OCCURRENCE" under "COMMERCIAL GENERAL LIABILITY".
        2. Additional Insured status (boolean). Check if there is an "X" or "Y" in the "ADDL INSD" column for GL.
        3. Policy Expiration Date (ISO string YYYY-MM-DD). Look for the GL policy expiration date.

        Return valid JSON only. format:
        {
          "gl_occurrence": number | null,
          "additional_insured": boolean | null,
          "expiry_date": string | null
        }
        
        Markdown Content:
        ${markdown}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonString = text.replace(/```json\n|\n```/g, "").trim();

        return JSON.parse(jsonString) as InsuranceData;

    } catch (error: any) {
        console.error("Gemini API Error:", error);

        // Fallback or rethrow
        throw new Error("Failed to extract data: " + error.message);
    }
}
