import "dotenv/config"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js" // gestiona el protocolo MCP con el cliente que se conecte, en este caso una API
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"  //Es el canal de comunicación entre tu servidor MCP y el sistema que lo ejecuta
import { z } from "zod" //valida datos de entrada para los schemas
import { PrismaClient } from "../generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { GoogleGenAI } from "@google/genai"

//evita que el proceso huérfano crashee con stack trace al perder el pipe
process.stdout.on("error", (err: any) => {
    if (err.code === "EPIPE") {
        process.exit(0)
    }
})

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error("DATABASE_URL is required in .env")

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })
const aiGoogle = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

async function crearVector(texto: string) {
    const response = await aiGoogle.models.embedContent({
        model: "gemini-embedding-2",
        contents: texto,
        config: { outputDimensionality: 768 },
    })
    const values = response.embeddings?.[0]?.values
    if (!values) throw new Error("Gemini no retorno embedding")
    return values
}

//IMplementacion del MCP por SDK 
const server = new McpServer({ name: "products-mcp", version: "1.0.0" })

server.registerTool(
    "listar_productos",
    {
        title: "Listar productos",
        description: "Devuelve la lista completa de productos de la tienda",
    },
    async () => {
        const productos = await prisma.products.findMany()
        return { content: [{ type: "text", text: JSON.stringify(productos) }] }
    }
)

server.registerTool(
    "buscar_productos_semantico",
    {
        title: "Buscar productos (semántico)",
        description: "Busca productos similares semánticamente a una descripción del usuario (ej. 'zapatillas rojas para correr')",
        //convierte a JSON SCHEMA y le pasamos los argumentos espera el tool y realiza todas las validaciones automaticamente
        inputSchema: {
            query: z.string().describe("Texto de búsqueda"),
            limit: z.number().optional().describe("Máximo de resultados, default 3"), //no necesario, podemos dejarlo con un limit por defaul 
        },
    },
    //aqui pasamos los argumentos que ya estan garantizados de tipo string y number (no hacce falta tiparlos)
    async ({ query, limit }) => {
        const embedding = await crearVector(query)
        const vectorString = `[${embedding.join(",")}]`

        const resultados = await prisma.$queryRawUnsafe(
            `SELECT id, nombre, descripcion, precio, imagen
            FROM "Products"
            ORDER BY embedding <=> $1::vector
            LIMIT $2`,
            vectorString,
            limit ?? 3
        )

        return { content: [{ type: "text", text: JSON.stringify(resultados) }] }
    }
)

const transport = new StdioServerTransport()
//el server se pone en bucle escuchando el stdin como haciamos con readline.on
await server.connect(transport)

async function shutdownServer() {
    await prisma.$disconnect()
    process.exit(0)
}

process.on("SIGINT", shutdownServer)
process.on("SIGTERM", shutdownServer)