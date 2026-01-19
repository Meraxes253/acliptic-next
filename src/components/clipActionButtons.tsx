'use client'

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import PresetDialog from "./Studio/PresetDialog";
import UploadDialog from "./uploadDia";

interface ActionButtonsProps {
  autoUploaded?: boolean;
  user_id: string;
}

export default function ActionButtons({ autoUploaded = false, user_id }: ActionButtonsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex gap-2 md:gap-4 lg:gap-[1.125rem] px-4 md:px-8 lg:ml-[8.5rem] mt-4 md:mt-8 lg:mt-[2.25rem]">
      {!autoUploaded && (
        <UploadDialog />
      )}
      <Button
        className="h-10 md:h-[40px] px-2 md:w-[110px] rounded-[14px] flex items-center justify-center gap-1 md:justify-around"
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
      >
        <Image src="/Edit.svg" alt="upload" height={25} width={25} />
        <p className="text-[12px] font-light hidden md:block">Presets</p>
      </Button>

      <PresetDialog
        user_id={user_id}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isRequired={false}
      />
    </div>
  );
}