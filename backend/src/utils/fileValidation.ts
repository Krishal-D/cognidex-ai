const PDF_MAGIC_BYTES = Buffer.from("%PDF-", "ascii");
const HEADER_SEARCH_WINDOW = 1024;

export function isLikelyPdf(buffer: Buffer): boolean {
    if (buffer.length < PDF_MAGIC_BYTES.length) return false;
    return buffer.subarray(0, HEADER_SEARCH_WINDOW).includes(PDF_MAGIC_BYTES);
}
