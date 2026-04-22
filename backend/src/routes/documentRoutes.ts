import express from "express";
import { documentController } from "../controllers/documentController";
import { upload } from '../middleware/pdfUpload'
import { authenticate } from "../middleware/auth";

const router = express.Router()

router.post('/upload', upload.single('file'), authenticate, documentController.uploadDocument)
router.get('/',authenticate, documentController.findDocumentByUser )
router.delete('/:id',authenticate,documentController.deleteDocument)

export default router