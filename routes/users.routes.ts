import { Router } from "express";
import { userRegisterController, userLoginController } from "../controller/user.controller"

const router = Router()

router.post("/register", userRegisterController)
router.post("/login", userLoginController)

export default router;

