
import { LlamaParse } from "llama-parse";
import fs from "fs/promises";
import path from "path";
import os from "os";

export async function parseInsuranceDoc(fileBuffer: Buffer, fileName: string): Promise<string> {
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `fernstone-${Date.now()}-${fileName}`);

    try {
        await fs.writeFile(tempFilePath, fileBuffer);

        const parser = new LlamaParse({ resultType: "markdown" });
        const documents = await parser.loadData(tempFilePath);

        // Cleanup
        await fs.unlink(tempFilePath);

        return documents[0].text;
    } catch (error) {
        // Ensure cleanup on error
        try {
            await fs.unlink(tempFilePath);
        } catch { }
        console.error("LlamaParse error:", error);
        throw new Error("Failed to parse document");
    }
}
