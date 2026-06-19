import ollama from 'ollama'

export async function ollamaMiddleware(req: any, res: any, next: any) {

    const productos = req.body.productos
        ? JSON.parse(req.body.productos)
        : [{
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            precio: req.body.precio
        }]

    const esquemaJSON = {
        type: 'object',
        properties: {
            nombre: { type: 'string' },
            descripcionMejorada: { type: 'string' },
            aprobado: { type: 'boolean' },
            motivo: { type: 'string' }
        },
        required: ['productos']
    }

    try {
        const response = await ollama.chat({
            model: 'llama3.1',
            messages: [
                {
                    role: 'system',
                    content: `
                        Eres un experto en marketing de productos.
                        Mejoras descripciones y nombres para hacerlas más atractivas y profesionales.
                        Responde SOLO en JSON válido.
                        `
                },
                {
                    role: 'user',
                    content: `Analiza y mejora estos productos: ${JSON.stringify(productos)}`
                }
            ],
            format: esquemaJSON,
            options: {
                temperature: 0
            }
        })

        const jsonResultado = JSON.parse(response.message.content)


        if (!jsonResultado.aprobado) {
            return res.status(400).send({
                error: jsonResultado.motivo
            })
        }

        // metemos lo que dijo la ia mejoramos nombre y descripcion
        req.body.nombre = jsonResultado.nombre
        req.body.descripcion = jsonResultado.descripcionMejorada

        next()

    } catch (error: any) {
        res.status(500).send({
            status: 500,
            message: "Error en el middleware de Ollama",
            error: error.message
        })
    }
}