import { Router } from "express";
import { authMiddleware } from "../middleware/aunth.middleware"
import { ollamaMiddleware } from "../middleware/ollama.middleware";
import { createProductController, viewProductController, updateProductController, deleteProductController } from "../controller/produc.controller"
import multer from 'multer'

const router = Router()

const upload = multer({ storage: multer.memoryStorage() });

router.post("/view", viewProductController)
router.post("/create", upload.single('file'), authMiddleware, ollamaMiddleware, createProductController)
router.post("/update", upload.single('file'), authMiddleware, ollamaMiddleware, updateProductController)
router.post("/delete", upload.single('file'), authMiddleware, deleteProductController)

export default router;