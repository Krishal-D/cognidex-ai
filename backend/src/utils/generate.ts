import OpenAI from "openai";
import dotenv from 'dotenv'

dotenv.config()


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})


export const generateAnswer = async (context: string, question: string): Promise<string> => {

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
                    - If the answer is not in the context, say exactly: "I could not find the answer in the provided document."
                    - ALWAYS follow the user's formatting instructions precisely
                    - If the user asks for a numbered list, use numbered lines with line breaks
                    - If the user asks for bullet points, use bullet points
                    - If the user asks for "each in new line", put each item on its own line with a line break between them
                    - Do not make up information or use general knowledge
                    - Cite which section or lab the information comes from when possible`,
                },
                {
                    role: 'user',
                    content:
                        `
                        ###Context:
                        ${context}

                        ###Question:
                        ${question}

                        
                    `
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
