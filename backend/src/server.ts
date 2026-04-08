import express from "express";
import cors from 'cors';
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import authRoute from './routes/authRoute'
import { errorHandler } from './middleware/errorHandling'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(helmet())
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth/', authRoute)
app.use(errorHandler)

app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT} `)
})
