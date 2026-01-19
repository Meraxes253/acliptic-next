'use client'

import FeatureBox from '@/components/FeatureBox';
import { useEffect } from 'react';
import Lenis from 'lenis';
import LazyVideo from '@/components/LazyVideo';
import Navigation from '@/components/main/mainNavigation';
import Footer from '@/components/main/Footer';

interface FeaturesContentProps {
  user_id: string;
}

export default function FeaturesContent({ user_id }: FeaturesContentProps) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const animationFrame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrame);
      lenis.destroy();
    };
  }, []);

  return (
    <div>
      <Navigation user_id={user_id} />
      
      <div className="mt-4 bg-black w-full max-w-[1380px] h-[300px] sm:h-[500px] lg:h-[700px] rounded-[18px] mx-auto px-4 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-16 relative">
        <div className="absolute inset-0 flex justify-center items-center">
          <LazyVideo
            className="w-[90%] h-[90%] object-contain"
            src="/features_video1.webm"
            width={1242}
            height={630}
          />
        </div>
        <div className="text-white relative z-10">
          <h2 className="text-sm sm:text-base hel-font">Attract attention to your streams</h2>
          <p className="text-2xl sm:text-3xl lg:text-5xl font-medium mt-2" style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>Quick and Fast.</p>
        </div>
      </div>

      <div className="mt-8 sm:mt-16 lg:mt-28 bg-[#F5F5F7] rounded-[18px] w-full max-w-[1380px] h-auto min-h-[400px] sm:min-h-[600px] lg:min-h-[850px] mx-auto px-4 sm:px-8 lg:px-16 py-8 sm:py-16 lg:py-28 relative">
        <div className="text-center">
          <h2 className="text-black text-2xl sm:text-3xl lg:text-5xl font-medium mb-3" style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>Interactive dashboard</h2>
          <p className="text-black text-sm sm:text-base hel-font mb-8">View how your clips are doing.</p>
        </div>
        <div className="relative bottom-0 left-1/2 transform -translate-x-1/2 pb-0 w-full">
          <img
            src="/featuresNew.avif"
            alt="Interactive Dashboard Features"
            className="object-contain w-full h-auto max-h-[400px] sm:max-h-[500px] lg:max-h-[600px]"
          />
        </div>
      </div>

      <div className="mt-8 sm:mt-16 lg:mt-28 bg-[#F5F5F7] rounded-[18px] w-full max-w-[1380px] h-auto min-h-[400px] sm:min-h-[500px] lg:min-h-[650px] mx-auto px-4 sm:px-8 lg:px-16 relative">
        <div className="flex flex-col lg:flex-row h-full">
          <div className="w-full lg:w-[82%] h-full flex items-end overflow-hidden">
            <img
              src="/featuresNew2.avif"
              alt="Studio Features"
              className="w-full h-[300px] sm:h-[400px] lg:h-[90%] object-cover object-bottom"
            />
          </div>
          <div className="w-full lg:w-[30%] pt-8 sm:pt-16 lg:pt-28">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-medium text-black mb-3" style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>Studio</h2>
            <p className="text-sm sm:text-base text-black hel-font">
              To see all your streams and then their respective<br />generated clips.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mt-16 lg:mt-24 flex flex-col lg:flex-row justify-center w-full gap-8 px-4 sm:px-8">
        <FeatureBox
          title="Clips for the stream"
          description="You can download, delete, view the transcripts for the generated clips."
          imageSrc="/clipsFeatures.avif"
          imageAlt="Clips Features"
          className="w-full lg:w-[670px] h-[300px] sm:h-[400px] lg:h-[550px] overflow-hidden"
        />
        <div className="bg-[#F5F5F7] rounded-[18px] w-full lg:w-[670px] h-[300px] sm:h-[400px] lg:h-[550px] p-8 sm:p-12 lg:p-16 flex flex-col">
          <div className="mb-8">
            <h3 className="text-2xl sm:text-3xl lg:text-5xl font-medium text-black mb-4" style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>Readymade presets</h3>
            <p className="text-sm sm:text-base text-black hel-font">
              No need to worry about additional time for editing.
            </p>
          </div>
          <div className="flex-grow flex items-end justify-center h-[200px] sm:h-[300px] lg:h-[357px]">
            <img
              src="/presetFeature.avif"
              alt="Readymade Presets"
              className="max-w-full h-full object-contain rounded-t-[16px]"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
} 