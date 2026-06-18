import 'dotenv/config'
import bcrypt from 'bcrypt'
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'
import { createToken } from './token.service';
import { userExist } from "../aunth/user.aunth"

const connectionString = process.env.DATABASE_URL
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export async function userRegisterService(data: { nombre: string, email: string, password: string, rol?: string, }) {

    const emailexist = await userExist(data.email)

    if (emailexist) {
        throw new Error("EMAIL_EXISTS")
    }

    //encriptamos pass
    const saltRounds = 10
    const salt = bcrypt.genSaltSync(saltRounds)
    const hash = bcrypt.hashSync(data.password, salt)

    const user = await prisma.user.create({
        data: {
            nombre: data.nombre,
            email: data.email,
            password: hash,
            rol: data.rol ?? "user"
        }
    })

    return user;

}

export async function userLoginService(email: string, password: string) {
    const user = await userExist(email)
    if (!user) {
        throw new Error("EMAIL_NOT_EXIST")
    }

    const comparePass = await bcrypt.compare(password, user.password)
    if (!comparePass) {
        throw new Error("INVALID_PASS")
    }

    const token = createToken(user.id, user.nombre, user.email, user.rol)
    return { token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } }
}




// export async function userExist(email: string) {
//     const emailExist = await prisma.user.findUnique({
//         where: { email }
//     })
//     return emailExist
// }
