import cron from 'node-cron';
import prisma from "../utilities/prisma";
import axios from "axios";

cron.schedule('0 * * * *', async () => {
    const now = new Date();

    try {
        const expiredFiles = await prisma.file.findMany({
            where: {
                expiresAt: { lte: now }
            },
            select: {
                id: true
            }
        });

        for (const file of expiredFiles) {
            await prisma.file.delete({
                where: {
                    id: file.id
                }
            })
                .then(() => console.log('Cron: Deleted file ' + file.id))
                .catch((err) => console.log(err));
        }
    } catch (error) {
        console.error('Error processing expired files:', error);
    }
});
