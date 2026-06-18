import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export async function userExist(email: string) {
    const emailExist = await prisma.user.findUnique({
        where: { email }
    })
    return emailExist
}