import Image from 'next/image';

const HowItWorksComponent = () => {
  return (
    <div id="how-it-works" className="min-h-screen bg-gray-50 py-20 px-40">
      <div className="max-w-7xl mx-auto relative">
        {/* Title */}
        <h1 className="text-9xl lg:text-[12rem] font-light italic text-black tracking-wide leading-none text-center mb-20 denton-condensed">
          How It Works
        </h1>

        {/* Images and Text Bubbles Container */}
        <div className="relative flex justify-center items-center min-h-[800px]">
        
        {/* Left Image with Text */}
        <div className="relative">
          <Image
            src="/landingPage/image6.png"
            alt="Step 1"
            width={450}
            height={600}
            className="object-cover"
          />

          {/* Text bubble for left image - positioned top left */}
          <div className="absolute top-20 -left-48 bg-black text-white px-6 py-4 rounded-lg max-w-[280px] text-base">
            <p>Automatically pulls the latest streams from your twitch, <span className="text-gray-400">so you never miss a moment to clips and share.</span></p>
          </div>

          {/* Username label */}
          <div className="absolute bottom-2 right-14 text-white text-2xl font-medium flex items-center gap-2 denton-condensed">
            Auto Import
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-download">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
              <path d="M7 11l5 5l5 -5" />
              <path d="M12 4l0 12" />
            </svg>
          </div>
        </div>
        
        {/* Center and Right Images - Stuck Together */}
        <div className="relative ml-12 flex items-center">
          {/* Center Image (image7) */}
          <div className="relative">
            <Image
              src="/landingPage/image7.png"
              alt="Step 2"
              width={420}
              height={630}
              className="object-cover"
            />

            {/* Text bubble for center image - positioned top */}
            <div className="absolute -top-16 left-1/10 transform -translate-x-1/2 bg-black text-white px-6 py-4 rounded-lg max-w-[300px] text-base">
              <p>Our AI automatically clips, captions, adds B-Roll, <span className="text-gray-400">and enhances audio, so your videos are ready to post with no extra editing.</span></p>
            </div>

            {/* Username label */}
            <div className="absolute bottom-4 left-20 text-white text-2xl font-medium flex items-center gap-2 denton-condensed">
              Auto Editing
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-edit">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                <path d="M16 5l3 3" />
              </svg>
            </div>
          </div>

          {/* Right Image (image8) - Bigger and stuck to image7 */}
          <div className="relative -ml-6">
            <Image
              src="/landingPage/image8.png"
              alt="Step 3"
              width={480}
              height={1020}
              className="object-cover"
            />

            {/* Text bubble for right image - positioned top right */}
            <div className="absolute -top-12 -right-24 bg-black text-white px-6 py-4 rounded-lg max-w-[280px] text-base">
              <p>Automatically uploads your videos across all platforms, <span className="text-gray-400">so you stay consistent and be everywhere without lifting a finger.</span></p>
            </div>

            {/* Username label */}
            <div className="absolute bottom-6 left-16 text-white text-2xl font-medium flex items-center gap-2 denton-condensed">
              Auto Upload
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-upload">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                <path d="M7 9l5 -5l5 5" />
                <path d="M12 4l0 12" />
              </svg>
            </div>

            {/* Social media icons - positioned on right side center of image8 */}
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 z-10">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-brand-youtube">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z" />
                  <path d="M10 9l5 3l-5 3z" />
                </svg>
              </div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-brand-instagram">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M4 8a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
                  <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                  <path d="M16.5 7.5v.01" />
                </svg>
              </div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-brand-tiktok">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z" />
                </svg>
              </div>
            </div>

          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksComponent;