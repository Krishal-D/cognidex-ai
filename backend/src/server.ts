// Must run before any module below that reads process.env at import time
// (config/auth.ts, config/db.ts, utils/embedding.ts, utils/generate.ts).
import { validateEnv } from './config/env'
validateEnv()

import express from "express";
import cors from 'cors';
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import authRoute from './routes/authRoute'
import { errorHandler } from './middleware/errorHandling'
import documentRoute from './routes/documentRoutes'
import chatRoute from './routes/chatRoute'
import healthRoute from './routes/healthRoute'

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet())
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())


app.use('/api/health', healthRoute)
app.use('/api/auth', authRoute)
app.use('/api/documents', documentRoute)
app.use('/api/chat',chatRoute)
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT} `)
})
