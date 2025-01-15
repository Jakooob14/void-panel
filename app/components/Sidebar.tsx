import {AnchorButton, LinkButton} from "@/app/components/Buttons";
import {Heading1} from "@/app/components/Headings";

export default function Sidebar(){
    return (
        <aside className={'w-[320px] h-screen fixed bg-alt-gray-100 shadow-lg shadow-alt-gray-100 py-4 px-6 top-0'}>
            <Heading1 className={'!text-4xl'}>Void Panel</Heading1>
            <ul className={'mt-5 flex flex-col gap-8'}>
                <li><LinkButton href={'/'}>Soubory</LinkButton></li>
                <li><LinkButton href={'/login'}>Přihlášení</LinkButton></li>
            </ul>
        </aside>
    )
}
