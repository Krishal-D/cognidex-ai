import { Pool } from "pg"

// Must run before chunkMigrate, whose `chunks` table declares an
// `embedding VECTOR(1536)` column — that type only exists once this
// extension is installed on the database.
export async function extensionMigrate(pool: Pool): Promise<void> {
    try {
        await pool.query(`CREATE EXTENSION IF NOT EXISTS vector`)
    } catch (error) {
        console.error(error)
        throw error
    }
}
