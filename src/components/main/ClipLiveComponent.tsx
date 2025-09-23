import Image from 'next/image';

const ClipLive = () => {
  return (
    <div className="relative w-full py-20 bg-gray-50">
      {/* Title */}
      <h1 className="text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] font-serif text-black italic mb-8 md:mb-12 text-center px-4 relative z-10 denton-condensed">
        Clip Live
      </h1>

      {/* Computer - Aligned with phone */}
      <div className="absolute top-32 right-0 z-20">
        <div className="w-[800px] h-[484px]">
          <Image
            src="/landingPage/image11.png"
            alt="Computer screen content"
            width={1605}
            height={972}
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Main Container */}
      <div className="relative flex items-start justify-start">

        {/* Left Phone - Smaller and overlapping title */}
        <div className="relative flex-shrink-0 ml-32 lg:ml-48 -mt-12 md:-mt-16 lg:-mt-20">
          {/* Phone container with size constraint */}
          <div className="relative w-[344px] h-[674px] overflow-hidden">
            <Image
              src="/landingPage/image10.png"
              alt="Phone with video content"
              width={382}
              height={749}
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Text bubble on upper right - overlapping top */}
          <div className="absolute -top-8 -right-8 bg-black text-white px-4 py-3 rounded-lg max-w-[220px] text-sm text-center z-10">
            <p>When you are live on twitch our AI will be monitoring, <span className="text-gray-400"> so as soon as a clip worthy moment happens, it will clip it, edit, upload it to all</span> social platforms in real-time.</p>
          </div>

          {/* Text bubble on middle left - overlapping side */}
          <div className="absolute top-1/2 -left-32 transform -translate-y-1/2 bg-black text-white px-4 py-3 rounded-lg max-w-[240px] text-sm text-center z-10">
            <h1 className='denton-condensed text-2xl'>Live & <span className="text-gray-400">Pre-recorded</span></h1>
            <span className="text-sm">All Clipped with</span>
            <h1 className='denton-condensed text-2xl'>Acliptic AI</h1>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClipLive;