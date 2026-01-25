'use client'

import UploadDialog from "./uploadDia";

interface ActionButtonsProps {
  autoUploaded?: boolean;
  user_id: string;
}

export default function ActionButtons({ autoUploaded = false }: ActionButtonsProps) {
  return (
    <div className="flex gap-2 md:gap-4 lg:gap-[1.125rem] px-4 md:px-8 lg:ml-[8.5rem] mt-4 md:mt-8 lg:mt-[2.25rem]">
      {!autoUploaded && (
        <UploadDialog />
      )}
    </div>
  );
}