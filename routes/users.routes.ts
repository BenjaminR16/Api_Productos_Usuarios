import { Router } from "express";
import { userRegisterController, userLoginController } from "../controller/user.controller"
import multer from 'multer'

const router = Router()

const upload = multer({ storage: multer.memoryStorage() });

router.post("/register", upload.single('file'), userRegisterController)
router.post("/login", userLoginController)

export default router;