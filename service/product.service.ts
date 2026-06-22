import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'
import { createClient } from "@supabase/supabase-js"
import { GoogleGenAI } from "@google/genai"
import { getMcpClient } from "../mcp/mcp_client/mcp_client_listaV"

const connectionString = process.env.DATABASE_URL
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })
const aiGoogle = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const supabase = createClient(
    process.env.SUPABASE_URL_HTTP!,
    process.env.SUPABASE_KEY!
)

export async function viewProductService() {
    const client = await getMcpClient();

    const resultado = await client.callTool({
        name: "listar_productos",
        arguments: {},
    });

    const text = (resultado.content as any)?.[0]?.text;
    return text ? JSON.parse(text) : [];
}

export async function searchProductsMcp(descripcion: string, limit?: number) {
    const client = await getMcpClient();

    const resultado = await client.callTool({
        name: "buscar_productos_semantico",
        arguments: { descripcion, limit },
    });

    const text = (resultado.content as any)?.[0]?.text;
    return text ? JSON.parse(text) : [];
}



export async function createProductService(userId: number, nombre: string, descripcion: string, precio: Number, file: any) {

    const extension = file.originalname.split(".").pop()
    const fileName = `img-${Date.now()}.${extension}`
    // console.log("userId", userId)
    const { error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
        })

    if (error) throw error

    //conseguir la url publica con getPublicUrl y la guardo en imageUrl
    const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName)

    const imageUrl = publicUrlData.publicUrl

    //creaar elembedding
    const createEmbedding = await aiGoogle.models.embedContent({
        model: "gemini-embedding-2",
        contents: `${nombre}, ${descripcion}`,
        config: { outputDimensionality: 768 }
    })

    //recogemos el valor del vector pq se pueden recoger metadatos tambien
    const embedding = createEmbedding.embeddings?.[0]?.values
    if (!embedding) {
        throw new Error("EMBEDDING_FAILED")
    }

    // guardo el data en la base de datos con el create y retorno productos
    const productos = await prisma.products.create({
        data: {
            nombre,
            descripcion,
            precio: Number(precio),
            imagen: imageUrl,
            userId,
        },
    })

    // 2. rellenar el vector vía SQL crudo, usando el id ya generado
    const vectorString = `[${embedding.join(",")}]`
    await prisma.$executeRaw`
        UPDATE "Products"
        SET embedding = ${vectorString}::vector
        WHERE id = ${productos.id}
    `


    return productos

}

export async function updateProductService(id: number, nombre: string, descripcion: string, precio: number, file: any, user: any) {
    const product = await prisma.products.findUnique({ where: { id: Number(id) } })
    if (!product) throw new Error("PRODUCT_NOT_FOUND")

    if (user.rol !== "admin" && product.userId !== user.id) {
        throw new Error("NO_AUTORIZADO")
    }

    if (product.imagen) {
        const url = new URL(product.imagen)
        const path = url.pathname.split("/avatars/")[1]
        // console.log(path)

        if (path) {
            await supabase.storage.from("avatars").remove([path])
        }

    }

    const extension = file.originalname.split(".").pop()
    const fileName = `img-${Date.now()}.${extension}`
    const { error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
        })

    if (error) throw error

    const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName)

    const imageUrl = publicUrlData.publicUrl

    //crear nuevo embeding
    const createEmbedding = await aiGoogle.models.embedContent({
        model: "gemini-embedding-2",
        contents: `${nombre}, ${descripcion}`,
        config: { outputDimensionality: 768 }
    })

    const embedding = createEmbedding.embeddings?.[0]?.values
    if (!embedding) {
        throw new Error("EMBEDDING_FAILED")
    }

    await prisma.products.update({
        where: { id: Number(id) },
        data: {
            nombre: nombre,
            descripcion: descripcion,
            precio: Number(precio),
            imagen: imageUrl,
        },
    })

    // 2. Update del vector vía SQL crudo
    const vectorString = `[${embedding.join(",")}]`
    await prisma.$executeRaw`
        UPDATE "Products"
        SET embedding = ${vectorString}::vector
        WHERE id = ${Number(id)}
    `

    const updatedProduct = await prisma.products.findUnique({ where: { id: Number(id) } })

    console.log("UPDATED:", updatedProduct)
    return updatedProduct
}

export async function removeProductService(id: number, user: any) {
    const product = await prisma.products.findUnique({ where: { id: Number(id) } })
    if (!product) throw new Error("Producto no encontrado")

    if (user.rol !== "admin" && product.userId !== user.id) {
        throw new Error("NO_AUTORIZADO")
    }

    if (product.imagen) {
        const url = new URL(product.imagen)
        const path = url.pathname.split("/avatars/")[1]

        if (path) {
            await supabase.storage.from("avatars").remove([path])
        }

    }

    const removeProduct = prisma.products.delete({ where: { id: Number(id) } })
    return removeProduct
}