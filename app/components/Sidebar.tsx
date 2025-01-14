import {AnchorButton, LinkButton} from "@/app/components/Buttons";
import {Heading1} from "@/app/components/Headings";

export default function Sidebar(){
    return (
        <aside className={'w-[320px] h-screen fixed bg-alt-gray-100 shadow-lg shadow-alt-gray-100 py-4 px-6 top-0'}>
            <Heading1 className={'!text-4xl'}>Void Panel</Heading1>
            <AnchorButton>asd</AnchorButton>
        </aside>
    )
}
