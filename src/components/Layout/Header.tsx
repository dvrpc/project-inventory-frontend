import DVRPCMini from '@/assets/dvrpc-mini.svg?react';

export default function Header() {
  return (
    <header className="h-15 flex px-8 items-center gap-4 text-dvrpc-blue-3 border-b border-dvrpc-gray-7">
      <a href="https://www.dvrpc.org/" target="_blank">
        <DVRPCMini className="mt-3 h-12 text-dvrpc-blue-3" />
      </a>
      <h1 className="text-3xl font-bold border-l-3 pl-4">
        Project Inventory Tool
      </h1>
    </header>
  );
}
