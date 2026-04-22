import express from "express";
import { chatController } from "../controllers/chatController";
import { authenticate } from "../middleware/auth";


const router = express.Router()

router.post('/query', authenticate, chatController.query)

export default router