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

// Render (and most PaaS hosts) put the app behind a reverse proxy. Without
// this, every request looks like it comes from the proxy's own IP, which
// would make the IP-keyed rate limiter in middleware/rateLimit.ts treat all
// users as a single client instead of limiting them individually.
app.set('trust proxy', 1)

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
