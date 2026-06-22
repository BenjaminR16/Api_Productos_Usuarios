import { createProductService, viewProductService, updateProductService, removeProductService, searchProductsMcp } from "../service/product.service"

export async function viewProductController(req: any, res: any) {
    try {
        const view = await viewProductService()
        res.status(200).send(view)
    } catch (error: any) {
        res.staus(400).send(error)

    }
}

export async function semanticSearchController(req: any, res: any) {
    try {
        const { query, limit } = req.body

        if (!query) {
            return res.status(400).send({ error: "Falta el campo 'query'" })
        }

        const resultado = await searchProductsMcp(query, limit)
        res.status(200).send(resultado)
    } catch (error: any) {
        res.status(400).send(error)
    }
}

export async function createProductController(req: any, res: any) {
    try {
        const { nombre, descripcion, precio } = req.body
        const file = req.file
        const createP = await createProductService(req.user.id, nombre, descripcion, precio, file)
        res.status(200).send(createP)
    } catch (error: any) {
        console.log(error)
        res.status(500).send({
            status: 500,
            message: "Error interno del servidor",
            error: error.message
        });
    }
}

export async function updateProductController(req: any, res: any) {
    try {
        const { id, nombre, descripcion, precio } = req.body
        const file = req.file
        const user = req.user
        const update = await updateProductService(id, nombre, descripcion, precio, file, user)
        res.status(200).send(update)
    } catch (error: any) {
        if (error.message === "PRODUCT_NOT_FOUND") {
            return res.status(400).send({
                status: 400,
                message: "No se encontro ningun producto con ese ID"
            });
        }
        if (error.message === "NO_AUTORIZADO") {
            return res.status(400).send({
                status: 400,
                message: "Usuario no autorizado"
            });
        }
        res.status(204).send({
            status: 204,
            message: "Error al crear el producto",
            error: error.message,
        });
    }
}

export async function deleteProductController(req: any, res: any) {
    try {
        const { id } = req.body
        const user = req.user
        const remove = await removeProductService(id, user)
        res.status(200).send(remove)
    } catch (error: any) {
        if (error.message === "NO_AUTORIZADO") {
            return res.status(400).send({
                status: 400,
                message: "Usuario no autorizado"
            });
        }
        res.status(204).send({
            status: 204,
            message: "Error al eliminar el producto",
            error: error.message,
        });
    }
}