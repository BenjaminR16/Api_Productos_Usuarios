import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'
import { createClient } from "@supabase/supabase-js"

const connectionString = process.env.DATABASE_URL
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const supabase = createClient(
    process.env.SUPABASE_URL_HTTP!,
    process.env.SUPABASE_KEY!
)

export async function viewProductService() {
    const viewProducts = await prisma.products.findMany()

    return viewProducts
}


export async function createProductService(userId: number, nombre: string, descripcion: string, precio: Number, file: any) {

    const extension = file.originalname.split(".").pop()
    const fileName = `img-${Date.now()}.${extension}`

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

    //guardo el data en la base de datos con el create y retorno productos 
    const productos = await prisma.products.create({
        data: {
            nombre,
            descripcion,
            precio: Number(precio),
            imagen: imageUrl,
        },
    })
    return productos

}