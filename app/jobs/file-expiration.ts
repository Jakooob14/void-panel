import cron from 'node-cron';
import prisma from '../utilities/prisma';
import fs from 'fs/promises';
import path from 'node:path';

if (process.env.NODE_ENV === 'production') {
  cron.schedule('* * * * *', async () => {
    const now = new Date();

    try {
      const records = await prisma.file.findMany({
        where: {
          expiresAt: { lte: now },
        },
        select: {
          id: true,
          path: true,
        },
      });

      for (const record of records) {
        console.log(`Deleting file ${record.id}`);
        await fs.unlink(record.path + record.id);
      }

      await prisma.file.deleteMany({
        where: {
          expiresAt: { lte: now },
        },
      });
    } catch (error) {
      console.error('Error processing expired files:', error);
    }
  });

  cron.schedule('0 * * * *', async () => {
    try {
      const filesInDb = await prisma.file.findMany({
        select: {
          id: true,
          path: true,
        },
      });

      const validFilePaths = new Set(filesInDb.map((file) => path.join(file.path, file.id)));

      const folderPath = 'share/';
      const filesInFolder = await fs.readdir(folderPath);

      for (const file of filesInFolder) {
        if (file === 'Files saved here') continue;
        const filePath = path.join(folderPath, file);
        if (!validFilePaths.has(filePath)) {
          await fs.unlink(filePath);
          console.log(`Deleted file: ${filePath}`);
        }
      }

      for (const file of filesInDb) {
        const filePath = path.join(file.path, file.id);
        console.log(filePath);

        try {
          await fs.access(filePath);
        } catch {
          await prisma.file.delete({
            where: { id: file.id },
          });
          console.log(`Deleted DB record: ${file.id}`);
        }
      }

      console.log('Cleanup complete!');
    } catch (error) {
      console.error('Error processing expired files:', error);
    }
  });
}
