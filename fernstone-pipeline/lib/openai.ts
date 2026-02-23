
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export interface InsuranceData {
    gl_occurrence: number | null;
    gl_aggregate: number | null;
    gl_products_comp_op_agg: number | null;
    gl_personal_adv_injury: number | null;
    additional_insured: boolean | null;
    auto_combined_single_limit: number | null;
    auto_has_any_auto: boolean | null;
    wc_each_accident: number | null;
    wc_disease_ea_employee: number | null;
    wc_disease_policy_limit: number | null;
    wc_statutory_limits: boolean | null;
    umbrella_occurrence: number | null;
    umbrella_aggregate: number | null;
    expiry_date: string | null; // ISO Date YYYY-MM-DD
}

export async function extractInsuranceData(markdown: string): Promise<InsuranceData> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are an expert insurance analyst. Extract the following information from the provided ACORD 25 Certificate of Insurance (in Markdown format). 
        You must return valid JSON matching the exact keys below. If a limit is stated in text (e.g., "$1,000,000"), convert it to a raw integer (e.g., 1000000). If a value is missing, return null.

        Extraction Rules:
        1. General Liability:
           - gl_occurrence: Look for "EACH OCCURRENCE" under "COMMERCIAL GENERAL LIABILITY".
           - gl_aggregate: Look for "GENERAL AGGREGATE".
           - gl_products_comp_op_agg: Look for "PRODUCTS - COMP/OP AGG".
           - gl_personal_adv_injury: Look for "PERSONAL & ADV INJURY".
           - additional_insured: Check if there is an "X" or "Y" in the "ADDL INSD" column for GL.
        2. Automobile Liability:
           - auto_combined_single_limit: Look for "COMBINED SINGLE LIMIT (Ea accident)".
           - auto_has_any_auto: Check if "ANY AUTO" is checked with an X or Y.
        3. Workers Compensation:
           - wc_each_accident: Look for "E.L. EACH ACCIDENT".
           - wc_disease_ea_employee: Look for "E.L. DISEASE - EA EMPLOYEE".
           - wc_disease_policy_limit: Look for "E.L. DISEASE - POLICY LIMIT".
           - wc_statutory_limits: Check if "WC STATUTORY LIMITS" is checked (Y/X).
        4. Umbrella / Excess Liability:
           - umbrella_occurrence: Look for "EACH OCCURRENCE" under Umbrella.
           - umbrella_aggregate: Look for "AGGREGATE" under Umbrella.
        5. Expiry Date:
           - expiry_date: ISO string YYYY-MM-DD for the GL policy expiration date.

        Return valid JSON only. format:
        {
          "gl_occurrence": number | null,
          "gl_aggregate": number | null,
          "gl_products_comp_op_agg": number | null,
          "gl_personal_adv_injury": number | null,
          "additional_insured": boolean | null,
          "auto_combined_single_limit": number | null,
          "auto_has_any_auto": boolean | null,
          "wc_each_accident": number | null,
          "wc_disease_ea_employee": number | null,
          "wc_disease_policy_limit": number | null,
          "wc_statutory_limits": boolean | null,
          "umbrella_occurrence": number | null,
          "umbrella_aggregate": number | null,
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
