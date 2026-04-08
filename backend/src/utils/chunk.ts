export function chunkText(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length)
        const chunk = text.slice(start, end)
        chunks.push(chunk)
        start += chunkSize - overlap
    }

    return chunks
}