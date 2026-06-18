import { validateToken } from "../service/token.service";

export function authMiddleware(req: any, res: any, next: any) {
    try {
        const header = req.headers.authorization;

        if (!header) {
            return res.status(401).send("token requerido");
        }

        const token = header.replace("Bearer ", "");
        const verifiedToken = validateToken(token);

        if (!verifiedToken) {
            return res.status(401).send("token invalido");
        }

        req.user = verifiedToken
        next();

    } catch (e) {
        return res.status(401).send("token invalido");
    }
}

export function adminMiddleware(req: any, res: any, next: any) {
    const user = req.user;

    if (!user) {
        return res.status(401).send("No autenticado");
    }

    if (user.rol !== "admin") {
        return res.status(403).send("No tienes permisos de admin");
    }

    next();
}