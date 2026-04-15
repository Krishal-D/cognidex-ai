import OpenAI from "openai";
import dotenv from 'dotenv'

dotenv.config()


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

export const getEmbedding = async (content: string[]): Promise<number[][]> => {
    const result = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: content,
    });

    return result.data.map((item) => item.embedding)
}

