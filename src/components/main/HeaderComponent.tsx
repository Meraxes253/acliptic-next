import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const StreamingHeroSection = () => {
  const router = useRouter();
  // Start directly in the "after animation" state - no transition animation
  const [scrolled, setScrolled] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(true);

  /* COMMENTED OUT: Full animation from initial to scrolled state
  useEffect(() => {
    // Store the pending scroll target
    let pendingScrollTarget: string | null = null;

    // Check if navigation was clicked (look for hash or scroll target)
    const checkNavClick = () => {
      const hash = window.location.hash;
      if (hash && (hash === '#how-it-works' || hash === '#interactive-demo' || hash === '#pricing-plans')) {
        setScrolled(true);
        setAnimationComplete(true);
        // Scroll to the target after a short delay to ensure DOM is ready
        setTimeout(() => {
          const element = document.getElementById(hash.substring(1));
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        return true;
      }
      return false;
    };

    // Listen for clicks on navigation buttons
    const handleNavClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const navButton = target.closest('button');

      // Check if click is on navigation button
      if (navButton && target.closest('nav')) {
        // Find which section to scroll to based on button text
        const buttonText = navButton.textContent?.toLowerCase() || '';
        let targetId = '';

        if (buttonText.includes('feature')) {
          targetId = 'how-it-works';
        } else if (buttonText.includes('demo')) {
          targetId = 'interactive-demo';
        } else if (buttonText.includes('pricing')) {
          targetId = 'pricing-plans';
        }

        if (targetId) {
          pendingScrollTarget = targetId;
          setScrolled(true);
          setAnimationComplete(true);

          // Scroll to target after animation completes and body scroll is unlocked
          setTimeout(() => {
            const element = document.getElementById(targetId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }
      }
    };

    // Check on mount
    if (checkNavClick()) {
      return;
    }

    // Lock body scroll until animation is complete
    if (!animationComplete) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    const handleWheel = (e: WheelEvent) => {
      if (!animationComplete) {
        e.preventDefault();
        e.stopPropagation();
        if (!scrolled) {
          setScrolled(true);
          setTimeout(() => {
            setAnimationComplete(true);
          }, 1200);
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!animationComplete) {
        e.preventDefault();
        e.stopPropagation();
        if (!scrolled) {
          setScrolled(true);
          setTimeout(() => {
            setAnimationComplete(true);
          }, 1200);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!animationComplete && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        if (!scrolled) {
          setScrolled(true);
          setTimeout(() => {
            setAnimationComplete(true);
          }, 1200);
        }
      }
    };

    const handleScroll = (e: Event) => {
      if (!animationComplete) {
        e.preventDefault();
        e.stopPropagation();
        window.scrollTo(0, 0);
      }
    };

    document.addEventListener('click', handleNavClick);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: false });

    return () => {
      document.removeEventListener('click', handleNavClick);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      // Clean up body styles
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [scrolled, animationComplete]);
  */

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-black overflow-hidden">
      {/* Content Container - Sticky so it stays in place */}
      <div className="sticky top-0 left-0 right-0 h-screen z-10 flex items-center justify-center px-4 sm:px-6 lg:px-8 -mt-20">
        <div className={`w-full h-full flex items-center transition-all duration-1000 ease-in-out ${
          scrolled ? 'justify-center lg:pl-0' : 'justify-center'
        }`}>

          {/* Background Title - Behind everything, moves directly above paragraph */}
          <div className={`absolute z-0 transition-all duration-1000 ease-in-out ${
            scrolled
              ? 'left-1/2 -translate-x-[-50px] top-[22%]'
              : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
          }`}>
            <h1 className={`font-serif text-black dark:text-white leading-none tracking-tight denton-condensed transition-all duration-1000 whitespace-nowrap ${
              scrolled ? 'text-[80px] lg:text-[100px]' : 'text-[200px] lg:text-[280px]'
            }`}>
              ACLIPTIC
            </h1>
          </div>

          {/* Center - Background Image and Phone with Overlays */}
          <div className={`relative z-10 transition-all duration-1000 ease-in-out ${
            scrolled ? 'scale-90 lg:-translate-x-[250px]' : 'scale-100'
          }`}>
            {/* Background Image - Much larger behind phone */}
            <div className="absolute flex items-center justify-center -top-12 -left-28">
              <div className="w-[515px] h-[655px] relative">
                <img
                  src="/landingPage/image2.png"
                  alt="Background"
                  className="w-full h-full"
                />
                {/* Social Media Icons on Background Image */}
                <div className="absolute top-1/2 right-10 transform -translate-y-1/2 flex flex-col space-y-2.5">
                  {/* TikTok Icon */}
                  <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43V7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.43z"/>
                    </svg>
                  </div>
                  {/* Instagram Icon */}
                  <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  {/* YouTube Shorts Icon */}
                  <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            {/* Create Tooltip - Left Side */}
            <div className="absolute -top-16 -left-28 bg-gray-600 dark:bg-zinc-800 bg-opacity-80 text-white px-5 py-3 rounded-lg text-[11px] font-medium leading-tight max-w-[120px] z-20">
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
            <div className="absolute top-16 -right-40 bg-white dark:bg-zinc-900 text-gray-800 dark:text-white px-5 py-3 rounded-full text-sm font-medium leading-tight whitespace-nowrap text-center drop-shadow-2xl z-20">
              All Done Live<br />
              <span className="text-gray-500 dark:text-gray-300 text-[11px]">Powered by AI</span>
            </div>

            {/* Phone Image - On top of background */}
            <div className="relative z-10">
              <img
                src="/LandingPage/image1.png" // Phone with screen content
                alt="Streaming Interface"
                className="w-[300px] h-[560px]"
              />
            </div>
          </div>

          {/* Text Content - Slides in from the right, closer to center div */}
          <div className={`absolute left-1/2 top-1/2 -translate-y-1/2 z-20 lg:max-w-2xl transition-all duration-1000 ease-in-out ${
            scrolled
              ? 'opacity-100 translate-x-[50px]'
              : 'opacity-0 translate-x-[100px] pointer-events-none'
          }`}>
            <div className="space-y-6">
              {/* Main Text */}
              <div className={`transition-all duration-1000 delay-200 ${
                scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <p className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                   empowers creators to produce{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    professional quality
                  </span>{' '}
                  short-form content effortlessly
                </p>
              </div>

              {/* Secondary Text */}
              <div className={`transition-all duration-1000 delay-300 ${
                scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Turn your streams into engaging clips with our AI-powered platform.
                </p>
              </div>

              {/* Input Field */}
              <div className={`transition-all duration-1000 delay-500 ${
                scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}>
                <div className="gradient-silver text-white rounded-full px-3 py-2.5 shadow-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 flex-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <span className="text-[13px] font-medium">Link your twitch account and start clipping</span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => router.push('/Studio')}
                      className="bg-white dark:bg-zinc-900 text-black dark:text-white px-5 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ml-3 relative z-10 hover:scale-105 transform"
                    >
                      Get Started
                      <div className="text-[10px] text-gray-600 dark:text-gray-400 -mt-0.5">Clip now</div>
                    </button>
                    {/* Blue gradient border effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full p-0.5 ml-3">
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