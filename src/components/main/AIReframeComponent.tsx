import React from 'react';
import Image from 'next/image';

const AIReframeComponent = () => {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-40 mb-20">
      <div className="max-w-7xl mx-auto relative">
        
        {/* Main Title - Larger and positioned for overlap */}
        <div className="text-center mb-20 relative z-10">
          <h1 className="text-9xl lg:text-[12rem] font-light italic text-black tracking-wide leading-none denton-condensed">
            AI Reframe
          </h1>
        </div>

        {/* Top Feature Callouts - Positioned to overlap title */}
        <div className="absolute top-[-140px] left-0 right-0 z-20">
          <div className="flex justify-between items-start max-w-7xl mx-auto px-4">
            {/* Left Callout */}
            <div className="bg-gray-400 text-white p-4 rounded-lg max-w-xs relative mt-8 opacity-55">
              <p className="text-sm font-medium leading-tight">
                IT ANALYZES YOUR SCENES AND APPLIES<br/>
                THE PERFECT LAYOUT—SPLIT SCREEN,<br/>
                SINGLE VIEW, OR PICTURE-IN-PICTURE—<br/>
                TURNING LONG VIDEOS INTO PRO-QUALITY<br/>
                CLIPS IN JUST ONE CLICK.
              </p>
              <Image
                src="AElogo.svg" // Replace with your actual image path
                alt="AI Reframe Icon"
                width={25}
                height={25}
                className='brightness-0 invert'
                style={{ filter: 'brightness(0) invert(1)' }}              />   
              {/* <div className="absolute -bottom-2 left-6 w-4 h-4 bg-gray-400 rotate-45"></div> */}
            </div>

            {/* Right Callout */}
          </div>
        </div>

        <div className="absolute top-0 right-0 z-20">
          <div className="flex justify-between items-start max-w-7xl mx-auto px-4">
            <div className="bg-black text-white p-4 rounded-lg max-w-xs mt-8">
                <p className="text-sm font-medium leading-tight">
                    RESIZE YOUR VIDEOS FOR<br/>
                    ANY PLATFORM WITH OUR<br/>
                    MOST ADVANCED AI YET.
                </p>
            </div>
           </div>
        </div>

        {/* Before/After Section */}
        <div className="relative flex items-center justify-center mt-8">
          {/* Before Image - Left */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/landingPage/image3.png" // Replace with your actual image path
                alt="Before reframe"
                width={400}
                height={300}
                className="object-cover"
              />
              <div className="absolute bottom-2 left-4 bg-opacity-70 text-white px-3 py-1 rounded">
                <span className="italic text-lg">Before</span>
              </div>
            </div>
          </div>

          {/* Long Vertical Divider Line */}
          <div className="w-px bg-gray-400 h-96 mx-4"></div>

          {/* After Image - Right */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden">
              <Image
                src="/landingPage/image4.png" // Replace with your actual image path
                alt="After reframe"
                width={300}
                height={400}
              />
              <div className="absolute bottom-8 left-4  bg-opacity-70 text-white px-3 py-1 rounded">
                <span className="italic text-lg">After</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIReframeComponent;