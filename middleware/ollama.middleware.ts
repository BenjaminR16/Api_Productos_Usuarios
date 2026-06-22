import ollama from 'ollama'

export async function ollamaMiddleware(req: any, res: any, next: any) {

    const { nombre, descripcion } = req.body
    const producto = { nombre, descripcion }

    const esquemaJSON = {
        type: 'object',
        properties: {
            nombre: { type: 'string' },
            descripcionMejorada: { type: 'string' },
            aprobado: { type: 'boolean' },
            motivo: { type: 'string' }
        },
        required: [
            'nombre',
            'descripcionMejorada',
            'aprobado',
            'motivo'
        ]
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
                    content: `Analiza y mejora estos productos: ${JSON.stringify(producto)}`
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