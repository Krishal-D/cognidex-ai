import dotenv from 'dotenv'

dotenv.config()

const ALL_REQUIRED_ENV_VARS = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'OPENAI_API_KEY',
] as const

type RequiredEnvVar = (typeof ALL_REQUIRED_ENV_VARS)[number]

/**
 * Fails fast with a clear message instead of letting the app start and throw
 * cryptic errors later (e.g. `jwt.sign` with an undefined secret). Call this
 * before importing any module that reads `process.env` at import time
 * (config/auth.ts, config/db.ts, utils/embedding.ts, utils/generate.ts).
 */
export function validateEnv(required: readonly RequiredEnvVar[] = ALL_REQUIRED_ENV_VARS): void {
    const missing = required.filter((key) => !process.env[key]?.trim())

    if (missing.length > 0) {
        console.error(
            `Missing required environment variable(s): ${missing.join(', ')}\n` +
            `Copy backend/.env.example to backend/.env and fill in the values before starting.`
        )
        process.exit(1)
    }
}
