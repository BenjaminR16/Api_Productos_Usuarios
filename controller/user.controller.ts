import { userRegisterService, userLoginService, userProfileService } from "../service/user.service"

export async function userRegisterController(req: any, res: any) {
    try {
        const { nombre, email, password } = req.body

        const user = await userRegisterService({ nombre, email, password, rol: "user" })
        res.status(201).send(user)
    } catch (error: any) {
        if (error.message === "EMAIL_EXISTS") {
            return res.status(409).send({
                status: 409,
                message: "El email ya está registrado"
            });
        }
        res.status(500).send({
            status: 500,
            message: "Error interno del servidor"
        });
    }
}

export async function userLoginController(req: any, res: any) {
    try {
        const { password, email } = req.body
        const userLog = await userLoginService(email, password)
        res.status(200).send(userLog)
    } catch (error: any) {
        if (error.message === "EMAIL_NOT_EXIST") {
            return res.status(400).send({
                status: 400,
                message: "Usuario no registrado"
            })
        }
        if (error.message === "INVALID_PASS") { //cambiar status
            return res.status(400).send({
                status: 400,
                message: "Email o contrasena incorrectos"
            })
        }

    }
}

export async function userProfileController(req: any, res: any) {
    try {
        const email = req.user?.email

        if (!email) {
            return res.status(400).send({
                status: 400,
                message: "El email es obligatorio"
            });
        }

        const profile = await userProfileService(email);

        return res.status(200).send(profile);

    } catch (error: any) {

        if (error.message === "EMAIL_NOT_EXIST") {
            return res.status(404).send({
                status: 404,
                message: "Usuario no encontrado"
            });
        }

        return res.status(500).send({
            status: 500,
            message: "Error interno del servidor"
        });
    }
}

