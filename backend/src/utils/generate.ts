import OpenAI from "openai";
import dotenv from 'dotenv'

dotenv.config()


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})


export const generateAnswer = async (context: string, question: string): Promise<string> => {
    console.log('--- SENDING TO GPT ---')
    console.log('Question:', question)
    console.log('Context:', context)
    console.log('--- END ---')
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            temperature: 0.2,
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful AI assistant that answers questions based strictly on the provided document context.


RULES:
- Answer ONLY using the provided context
- Document titles, headings, and the first bold or capitalized phrase in the context often indicate the document type or heading - use this to answer "what is the heading/title" questions
- If the question asks about the document's topic, heading, title, subject, or what it is about, synthesize a reasonable answer by analyzing the content even if no single sentence directly states it
- If the answer truly cannot be inferred from the context at all, say exactly: "I could not find the answer in the provided document."
- ALWAYS follow the user's formatting instructions precisely
- Do not invent facts or use external knowledge beyond what's reasonably inferable from the context`,
                },
                {
                    role: 'user',
                    content: `###Context:\n${context}\n\n###Question:\n${question}`
                }
            ]
        })
        const response = completion.choices[0]?.message?.content;

        if (!response) {
            throw new Error("Empty LLM response");
        }

        return response;

    } catch (error) {
        console.error("LLM Error:", error);
        throw new Error("Failed to generate answer");
    }

}
