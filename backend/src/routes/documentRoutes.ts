import express from "express";
import { documentController } from "../controllers/documentController";
import { upload } from '../middleware/pdfUpload'
import { authenticate } from "../middleware/auth";
import { uploadLimiter } from "../middleware/rateLimit";

const router = express.Router()

router.post('/upload', authenticate, uploadLimiter, upload.single('file'), documentController.uploadDocument,)
router.get('/', authenticate, documentController.findDocumentByUser)
router.delete('/:id', authenticate, documentController.deleteDocument)

export default router