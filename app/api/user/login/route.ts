import {NextRequest, NextResponse} from "next/server";
import prisma from "@/app/utilities/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    try {
        const { username, email, password } = await req.json();

        if (!username && !email) return NextResponse.json({message: 'Missing username and email'}, {status: 400});
        if (!password) return NextResponse.json({message: 'Missing password'}, {status: 400});

        const record = await prisma.user.findFirstOrThrow({
            where: {
                OR: [
                    { username: username },
                    { email: email }
                ]
            }
        });

        const res = await bcrypt.compare(password, record.password);

        if (res) {
            const payload = { id: record.id, username: username };
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '14d' })

            return NextResponse.json({message: 'Password correct'});
        }
        return NextResponse.json({ message: 'Password not correct' }, { status: 401 });

    } catch (err: any) {
        if (err instanceof PrismaClientKnownRequestError) {
            return NextResponse.json({message: 'User not found'}, {status: 404});
        }

        console.error(err.stack);
        return NextResponse.json({message: 'Internal server error'}, {status: 500});
    }
}
