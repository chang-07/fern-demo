
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface InsuranceData {
    gl_occurrence: number | null;
    additional_insured: boolean | null;
    expiry_date: string | null; // ISO Date YYYY-MM-DD
}

export async function extractInsuranceData(markdown: string): Promise<InsuranceData> {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are an expert insurance analyst. Extract the following information from the provided ACORD 25 Certificate of Insurance (in Markdown format):
            1. General Liability (GL) Occurrence Limit (integer). Look for "EACH OCCURRENCE" under "COMMERCIAL GENERAL LIABILITY".
            2. Additional Insured status (boolean). Check if there is an "X" or "Y" in the "ADDL INSD" column for GL.
            3. Policy Expiration Date (ISO string YYYY-MM-DD). Look for the GL policy expiration date.
    
            Return valid JSON only. format:
            {
              "gl_occurrence": number | null,
              "additional_insured": boolean | null,
              "expiry_date": string | null
            }`
                },
                {
                    role: "user",
                    content: markdown
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        if (!content) {
            throw new Error("Failed to extract data from OpenAI");
        }

        return JSON.parse(content) as InsuranceData;
    } catch (error: any) {
        console.error("OpenAI API Error:", error);

        // Fallback mock data for demo purposes when API quota is hit
        if (error?.status === 429 || error?.code === 'insufficient_quota') {
            console.warn("Returning mock data due to OpenAI quota limit.");
            return {
                gl_occurrence: 1000000,
                additional_insured: true,
                expiry_date: "2025-12-31"
            };
        }

        throw error;
    }
}
