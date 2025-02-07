import Loader from '@/app/components/Loader';

export default function Loading() {
  return (
    <div className={'w-full h-screen flex justify-center items-center'}>
      <Loader className={'!scale-[1.4]'} />
    </div>
  );
}
