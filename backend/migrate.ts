// Only DATABASE_URL is needed to run migrations — the other secrets (JWT, OpenAI)
// aren't relevant here and shouldn't block someone from setting up the database first.
import { validateEnv } from './src/config/env'
validateEnv(['DATABASE_URL'])

import {
    extensionMigrate,
    userMigrate,
    documentMigrate,
    chunkMigrate,
    conversationMigrate,
    messageMigrate
} from './src/migrations';
import { pool } from './src/config/db'



async function runMigration() {
    try {
        await extensionMigrate(pool);
        await userMigrate(pool);
        await documentMigrate(pool);
        await chunkMigrate(pool);
        await conversationMigrate(pool);
        await messageMigrate(pool);

    } catch (error) {
        console.log("Migration failed:",error)
    } finally {
        await pool.end()
    }
}

runMigration()