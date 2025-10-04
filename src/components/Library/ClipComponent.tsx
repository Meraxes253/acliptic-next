'use client';

import { Button } from "@/components/ui/button";

type ClipProps = {
	index: number;
	title: string;
	duration: string;
	viralityScore: number;
	transcript: string;
	thumbnailUrl?: string;
	videoUrl: string;
	contentCritique: string;
	autoUploaded?: boolean;
	streamIndex: number;
	streamId: string;
	clip_id: string;
};

export default function ClipComponent({
	index,
	title,
	duration,
	viralityScore,
	contentCritique,
	transcript,
	videoUrl,
	autoUploaded = false,
	streamIndex,
	streamId,
	clip_id,

}: ClipProps) {
	

	const handleEditClickAlt = () => {
		const absoluteUrl = videoUrl.startsWith('/') 
		  ? `${window.location.origin}${videoUrl}` 
		  : videoUrl;
		window.location.href = `/Library/stream/${streamIndex}/clips/Editor?videoUrl=${encodeURIComponent(absoluteUrl)}&id=${streamId}&clipId=${clip_id}`;
	};
    
	return (
		<div className="w-full overflow-hidden mt-6 md:mt-12 lg:mt-[6.3125rem] bg-inherit">
			<div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-[3.25rem]">
				{/* Video and buttons column */}
				<div className="flex flex-col items-center md:items-start">
					<div className="h-[320px] w-full max-w-[240px] md:h-[410px] md:w-[240px]">
						<video
							className="w-full h-full object-cover rounded-[16px]"
							src={videoUrl}
							controls
						/>
					</div>
					<div className="flex justify-between gap-2 mt-4 md:mt-[1.4375rem] w-full max-w-[240px]">
						<Button
							variant="outline"
							className={`h-10 md:h-[48px] rounded-[18px] font-medium ${
								autoUploaded ? 'w-full' : 'flex-1 md:w-[140px]'
							}`}
						>
							<p className="text-xs md:text-sm font-medium">
								Download HD
							</p>
						</Button>
						{!autoUploaded && (
							<Button
								variant="outline"
								className="h-10 md:h-[48px] w-16 md:w-[88px] rounded-[18px] font-medium"
								onClick={handleEditClickAlt}
							>
								<p className="text-xs md:text-sm font-medium">Edit</p>
							</Button>
						)}
					</div>
				</div>
                
				{/* Content column */}
				<div className="flex flex-col max-h-[510px] w-full overflow-hidden relative">
					<div className="flex flex-col gap-4 md:gap-6 lg:gap-[2.5625rem]">
						<h2 className="text-lg md:text-xl lg:text-[21px] leading-normal lg:leading-[2.2rem]">
							{title} ({duration})
						</h2>
                        
						<div className="bg-[#F6F6F8] rounded-[18px] p-4 md:p-6 lg:h-[172px] lg:pt-[1.6875rem] lg:pl-[2rem] lg:pr-[1.5625rem]">
							<p className="text-base md:text-lg lg:text-[18px] leading-6">
								#{index} Virality score ({viralityScore}/100)
							</p>
							<p className="text-sm md:text-base lg:text-[16px] leading-tight md:leading-[1.25rem] mt-2 md:mt-3 lg:mt-[1.125rem] text-black/60 hel-font">
								{contentCritique}
							</p>
						</div>
                        
						<div className="w-full px-4 md:px-6 lg:max-w-[1230px] lg:ml-[2rem]">
							<h3 className="text-base md:text-lg lg:text-[18px] leading-6">
								Transcript
							</h3>
							<p className="mt-2 md:mt-3 lg:mt-[1.25rem] text-sm md:text-base lg:text-[16px] leading-tight md:leading-[1.25rem] text-black/60 hel-font">
								{transcript}
							</p>
							<div className="absolute bottom-0 left-0 w-full h-[30px] bg-gradient-to-t from-white/80 via-white/40 to-white/0 pointer-events-none"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}