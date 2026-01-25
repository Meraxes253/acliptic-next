import { Button } from "@/components/ui/button";
import Link from "next/link";

type HeaderProps = {
  clipCount: number;
};

export default function Header({ clipCount }: HeaderProps) {
  return (
    <div className="flex items-center px-4 md:px-8 lg:ml-[30px] mt-4 md:mt-6">
      {/* Button with Inline SVG */}
      <Link href="/Studio">
        <Button
          className="h-8 w-8 md:h-10 md:w-10 gradient-silver text-black dark:text-black rounded-xl flex items-center justify-center p-0 mr-4 md:mr-8 lg:mr-16"
          variant="outline"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="w-5 h-5 md:w-6 md:h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Button>
      </Link>
      
      {/* Heading */}
      <h1 className="text-2xl md:text-3xl lg:text-[35px] leading-normal lg:leading-[3.75rem] m-0 p-0 text-black dark:text-white">
        Your Clips ({clipCount})
      </h1>
    </div>
  );
}