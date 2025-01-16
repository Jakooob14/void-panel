import {NextRequest, NextResponse} from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("Authorization");
    const { id, username } = await req.json();

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({message: "No token provided"}, {status: 401});
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);

        return NextResponse.json({message: "Authentication successful"});
    } catch (err) {
        console.error(err.stack);
        return NextResponse.json({message: "Invalid or expired token"}, {status: 403});
    }
}