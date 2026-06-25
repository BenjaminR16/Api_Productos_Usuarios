import { Router } from "express";
import { userRegisterController, userLoginController, userProfileController } from "../controller/user.controller"
import { authMiddleware } from "../middleware/aunth.middleware"
const router = Router()

router.post("/register", userRegisterController)
router.post("/login", userLoginController)
router.post("/profile", authMiddleware, userProfileController)

export default router;

