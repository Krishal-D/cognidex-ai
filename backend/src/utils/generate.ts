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
                    content: `You are an expert assistant that answers questions based on the provided document.
                                    Rules:
                                    - If the user says "thank you", "thanks", "sorry", "okay", etc., respond politely and naturally.
                                    - Do not say "I could not find the answer" for greetings or thanks.
                                    - Keep responses short and friendly for casual messages.
                                    - Only use the provided document context for actual questions about the content.
                                    - Answer using only the information in the provided context.
                                    - If the answer is not directly stated, you can summarize, infer, or list key topics when reasonable.
                                    - For questions like "most important topics", "key points", "summarize", etc., provide the best answer possible from the document instead of refusing.
                                    - Only say "I could not find..." if the topic is completely absent.`,
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
