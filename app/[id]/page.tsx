import FileClient from "@/app/[id]/FileClient";

interface FileProps {
    params: Promise<{ id: string }>
}

export default async function File({params}: FileProps) {
    const {id} = await params;

    return (
        <FileClient id={id}/>
    )
}
