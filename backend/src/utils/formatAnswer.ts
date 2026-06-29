export function formatAnswer(answer: string, question: string): string {
    const asksForList =
        /list|each|new line|questions|items/i.test(question);

    if (!asksForList) return answer;

    return answer
        .split(/(?=\d+\.\s)/)   
        .map(s => s.trim())
        .filter(Boolean)
        .join("\n");
}