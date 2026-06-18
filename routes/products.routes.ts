import { Router } from "express";
import { authMiddleware, adminMiddleware } from "../middleware/aunth.middleware"
import { createProductController, viewProductController } from "../controller/produc.controller"

const router = Router()

router.post("/view", viewProductController)
router.post("/create", authMiddleware, createProductController)

export default router;