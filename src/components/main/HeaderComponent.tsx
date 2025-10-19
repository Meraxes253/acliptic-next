import React from 'react';

const StreamingHeroSection = () => {
  return (
    <div className="relative min-h-screen bg-gray-100 overflow-hidden py-20">
      {/* Content Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center relative">
          
          {/* Background Title - Behind everything */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <h1 className="text-[320px] lg:text-[320px] font-serif text-black leading-none tracking-tight denton-condensed">
              ACLIPTIC
            </h1>
          </div>

          {/* Center - Background Image and Phone with Overlays */}
          <div className="relative mx-4 z-10">
            {/* Background Image - Much larger behind phone */}
            <div className="absolute flex items-center justify-center -top-14 -left-32">
              <div className="w-[606px] h-[771px] relative">
                <img
                  src="/landingPage/image2.png"
                  alt="Background"
                  className="w-full h-full"
                />
                {/* Social Media Icons on Background Image */}
                <div className="absolute top-1/2 right-12 transform -translate-y-1/2 flex flex-col space-y-3">
                  {/* TikTok Icon */}
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43V7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.43z"/>
                    </svg>
                  </div>
                  {/* Instagram Icon */}
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  {/* YouTube Shorts Icon */}
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            {/* Create Tooltip - Left Side */}
            <div className="absolute -top-20 -left-32 bg-gray-600 bg-opacity-80 text-white px-6 py-4 rounded-lg text-xs font-medium leading-tight max-w-[140px] z-20">
              CREATE<br />
              TIKTOKS,<br />
              REELS,<br />
              SHORTS<br />
              FROM YOUR<br />
              TWITCH<br />
              STREAMS IN<br />
              JUST ONE<br />
              CLICK
            </div>

            {/* All Done Live Tooltip - Right Side */}
            <div className="absolute top-20 -right-48 bg-white text-gray-800 px-6 py-4 rounded-full text-s font-medium leading-tight whitespace-nowrap text-center drop-shadow-2xl z-20">
              All Done Live<br />
              <span className="text-gray-500 text-xs">Powered by AI</span>
            </div>

            {/* Phone Image - On top of background */}
            <div className="relative z-10">
              <img
                src="/LandingPage/image1.png" // Phone with screen content
                alt="Streaming Interface"
                className="w-[354px] h-[658px]"
              />
              {/* Bottom Input Field */}
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-[500px] z-20">
                <div className="gradient-silver text-white rounded-full px-4 py-3 shadow-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="text-sm font-medium">Link your twitch account and start clipping</span>
                  </div>
                  <div className="relative">
                    <button className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ml-4 relative z-10">
                      Get Started
                      <div className="text-xs text-gray-600 -mt-0.5">Clip now</div>
                    </button>
                    {/* Blue gradient border effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full p-0.5 ml-4">
                      <div className="bg-gradient-to-r from-[#828282] to-[#95A281] rounded-full h-full w-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default StreamingHeroSection;