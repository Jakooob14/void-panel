import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/utilities/prisma';
import path from 'node:path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUserId, getSession } from '@/app/actions/session';
import { cookies } from 'next/headers';
import { getFile, getFiles } from '@/app/utilities/dto/file';
import sharp from 'sharp';
import { getMimeType } from '@/app/utilities/mimeType';
import { getUserTotalFilesSize } from '@/app/utilities/dto/user';

export async function GET(req: NextRequest) {
  // TODO: Encrypt
  try {
    const session = await getCurrentUserId();
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const fileId = searchParams.get('id');
    const isMinimal = searchParams.get('minimal') === 'true';

    if (!fileId) {
      const files = await getFiles();
      if (!files) return NextResponse.json({ message: 'No files found' }, { status: 404 });

      const fileLinks = files.map((file) => ({
        fileId: file.id,
        fileName: file.name,
      }));

      return NextResponse.json({
        status: 200,
        files: fileLinks,
      });
    }

    const file = await getFile(fileId);
    if (!file) return NextResponse.json({ status: 404, message: 'File not found' });

    if (isMinimal) {
      return NextResponse.json({
        status: 200,
        name: file.name,
      });
    }

    const buffer = await fs.readFile(file.path + fileId);
    const mimeType = getMimeType(buffer);
    const isImage = mimeType?.startsWith('image/');

    if (isImage) {
      const quality = searchParams.get('q') ? parseInt(searchParams.get('q')!, 10) : undefined;
      const width = searchParams.get('w') ? parseInt(searchParams.get('w')!, 10) : undefined;
      const height = searchParams.get('h') ? parseInt(searchParams.get('h')!, 10) : undefined;

      const sharpInstance = sharp(buffer).resize(width, height);

      if (quality) {
        sharpInstance.jpeg({ quality });
      }

      const optimizedImage = await sharpInstance.toBuffer();

      return new NextResponse(optimizedImage, {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Disposition': `attachment; filename="${file.name}"`,
          'Content-Length': optimizedImage.length.toString(),
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (err: any) {
    console.error(err.stack);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeFileName = path.basename(file.name);
    const uuid = uuidv4();

    if (file.size > Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '0')) return NextResponse.json({ message: 'Payload Too Large' }, { status: 413 });

    const totalSize = await getUserTotalFilesSize();
    const maxTotalFilesSize = Number(process.env.NEXT_PUBLIC_MAX_TOTAL_FILES_SIZE);
    if (totalSize === null || !maxTotalFilesSize || maxTotalFilesSize === 0) return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    if (totalSize + buffer.length > maxTotalFilesSize) return NextResponse.json({ message: 'Insufficient storage' }, { status: 413 });

    await fs.writeFile('share/' + uuid, buffer);

    const record = await prisma.file.create({
      data: {
        id: uuid,
        name: safeFileName,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        path: 'share/',
        owner: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return NextResponse.json({ message: 'Success' });
  } catch (err: any) {
    console.error(err.stack);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ message: 'No id provided' }, { status: 400 });

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeFileName = path.basename(file.name);

    if (file.size > Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '0')) return NextResponse.json({ message: 'Payload Too Large' }, { status: 413 });

    const totalSize = await getUserTotalFilesSize();
    const maxTotalFilesSize = Number(process.env.NEXT_PUBLIC_MAX_TOTAL_FILES_SIZE);
    if (totalSize === null || !maxTotalFilesSize || maxTotalFilesSize === 0) return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    if (totalSize + buffer.length > maxTotalFilesSize) return NextResponse.json({ message: 'Insufficient storage' }, { status: 413 });

    const record = await prisma.file.update({
      where: {
        id,
        ownerId: userId,
      },
      data: {
        name: safeFileName,
      },
    });

    if (!record) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await fs.writeFile('share/' + id, buffer);

    return NextResponse.json({ message: 'Success' });
  } catch (err: any) {
    console.error(err.stack);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession((await cookies()).get('accessToken')?.value);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await req.json();

    const record = await prisma.file.delete({
      where: {
        id: id,
      },
    });

    await fs.unlink(record.path + record.id);

    return NextResponse.json({ message: `Successfully deleted file ${record.name}` });
  } catch (err: any) {
    console.error(err.stack);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
