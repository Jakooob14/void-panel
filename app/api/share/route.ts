import {NextRequest, NextResponse} from "next/server";
import prisma from "@/app/utilities/prisma";
import path from "node:path";
import sharp from "sharp";
import fs from "fs/promises";
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
    try {
        const {searchParams} = req.nextUrl;
        const fileId = searchParams.get('id');
        const isMinimal = searchParams.get('minimal') === 'true';

        if (!fileId) {
            const files = await prisma.file.findMany({
                select: {
                    id: true,
                    name: true
                },
            });

            if (files.length === 0) {
                return NextResponse.json({message: 'No files found'}, {status: 404});
            }

            const fileLinks = files.map(file => ({
                fileId: file.id,
                fileName: file.name,
            }));

            return NextResponse.json({
                status: 200,
                files: fileLinks,
            });
        }

        const file = await prisma.file.findUnique({
            where: {id: fileId},
            select: {
                name: true,
                path: true,
            },
        });

        if (!file) {
            return NextResponse.json({status: 404, message: 'File not found'});
        }

        if (isMinimal) {
            return NextResponse.json({
                status: 200,
                name: file.name
            });
        }

        const buffer = await fs.readFile(file.path + fileId);

        if (file.name.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    'Content-Type': 'image/jpeg',
                    'Content-Disposition': `attachment; filename="${file.name}"`,
                    'Content-Length': buffer.length.toString()
                },
            });
        }

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${file.name}"`,
                'Content-Length': buffer.length.toString()
            }
        });
    } catch (err: any) {
        console.error(err.stack);
        return NextResponse.json({message: 'Internal server error'}, {status: 500});
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || typeof file === 'string') {
            return NextResponse.json({message: 'No file uploaded'}, {status: 400});
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const safeFileName = path.basename(file.name);
        const uuid = uuidv4();

        await fs.writeFile('share/' + uuid, buffer);

        const record = await prisma.file.create({
            data: {
                id: uuid,
                name: safeFileName,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                path: 'share/'
            }
        });

        return NextResponse.json({record});
    } catch (err: any) {
        console.error(err.stack);
        return NextResponse.json({message: 'Internal server error'}, {status: 500});
    }
}

export async function DELETE(req: NextRequest){
    try {
        const { id } = await req.json();

        const record = await prisma.file.delete({
            where: {
                id: id
            }
        });

        await fs.unlink(record.path + record.id);

        return NextResponse.json({message: `Successfully deleted file ${record.name}`});
    } catch (err: any) {
        console.error(err.stack);
        return NextResponse.json({message: 'Internal server error'}, {status: 500});
    }
}
