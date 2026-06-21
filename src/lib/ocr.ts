export async function extractText(buffer: Buffer, mimeType: string | null): Promise<string | null> {
  try {
    if (mimeType === "application/pdf") {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      return result.text?.trim() || null;
    }
    if (mimeType?.startsWith("image/")) {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("fra");
      const { data } = await worker.recognize(buffer);
      await worker.terminate();
      return data.text?.trim() || null;
    }
  } catch {
    return null;
  }
  return null;
}
