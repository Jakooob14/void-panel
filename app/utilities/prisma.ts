import {PrismaClient} from '@prisma/client'

const prismaClientSingleton = () => {
    const client = new PrismaClient()
    client.$extends({
        model: {
            $allModels: {
                async $query(params: { model: any; action: any }, next: (arg0: any) => any) {
                    const before = Date.now()
                    const result = await next(params)
                    const after = Date.now()

                    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`)
                    return result
                }
            }
        }
    })
    return client;
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

// if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
