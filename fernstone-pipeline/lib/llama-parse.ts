
import { LlamaParse } from "llama-parse";
import fs from "fs/promises";
import path from "path";
import os from "os";

export async function parseInsuranceDoc(fileBuffer: Buffer, fileName: string): Promise<string> {
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `fernstone-${Date.now()}-${fileName}`);

    try {
        await fs.writeFile(tempFilePath, fileBuffer);

        const parser = new LlamaParse({
            apiKey: process.env.LLAMA_CLOUD_API_KEY as string
        });

        const blob = new Blob([new Uint8Array(fileBuffer)]);
        const result = await parser.parseFile(blob as any); // Cast as any to avoid DOM File vs Node Blob issues if strictly typed
        return result.markdown;
        await fs.unlink(tempFilePath);
    } catch (error) {
        // Ensure cleanup on error
        const exists = await fs
            .access(tempFilePath)
            .then(() => true)
            .catch(() => false);
        if (exists) {
            await fs.unlink(tempFilePath);
        }
        console.error("LlamaParse error:", error);
        throw new Error("Failed to parse document");
    }
}
