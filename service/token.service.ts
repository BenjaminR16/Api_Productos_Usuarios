import jwt from 'jsonwebtoken'
import 'dotenv/config'

//creamos el token y anadi el rol 
const secret = process.env.tokenKey as string;
export function createToken(id: number, nombre: string, email: string, rol: string) {

    const token = jwt.sign(
        { id, nombre, email, rol },
        secret,
        { expiresIn: '1d' }
    )

    return token
}

export function validateToken(token: string) {
    const tokenValidated = jwt.verify(token, secret)
    console.log(tokenValidated)
    return tokenValidated
}