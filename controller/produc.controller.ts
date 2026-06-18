import { createProductService, viewProductService } from "../service/product.service"

export async function viewProductController(req: any, res: any) {
    try {
        const view = await viewProductService()
        res.status(200).send(view)
    } catch (error: any) {
        res.staus(400).send(error)

    }
}


export async function createProductController(req: any, res: any) {
    try {
        const { nombre, descripcion, precio } = req.body
        const file = req.file
        const createP = await createProductService(req.user.id, nombre, descripcion, precio, file)
        res.status(200).send(createP)
    } catch (error: any) {
        res.status(500).send({
            status: 500,
            message: "Error interno del servidor"
        });
    }
}