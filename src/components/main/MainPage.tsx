'use client'

import Image from 'next/image';
import Navigation from '@/components/main/mainNavigation';
import { LazyVideo } from '@/components/LazyVideo';
import Link from 'next/link';
import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import AIReframeComponent from './AIReframeComponent';
import HowItWorksComponent from './HowItWorksComponent';
import InteractiveDemoComponent from './InteractiveDemoComponent';
import ClipLive from './ClipLiveComponent';
import MultipleLanguages from './MultipleLanguageComponent';
import PricingPlans from './PricingPlansComponent';
import Footer from './Footer';
import { AnimatedTestimonialsDemo } from '@/components/testimonials';
import { FAQSection } from '@/components/main/faq-section';
import StreamingHeroSection from './HeaderComponent';


interface HomePageProps{
    user_id : string,
  }

export default function MainPage({user_id}: HomePageProps) {

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

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrame);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="overflow-x-hidden bg-white min-h-screen">
      <Navigation user_id={user_id}/>

      {/* Hero Section */}
      <StreamingHeroSection />

      {/* How It Works Component */}
      <HowItWorksComponent  />
      
      {/* Interactive Demo Component */}
      <InteractiveDemoComponent />

      {/* Clip Live Component */}
      <ClipLive />

      {/* AI Reframe Component */}
      <AIReframeComponent />

      {/* Multiple Languages Component */}
      <MultipleLanguages />

      {/* Pricing Plans Component */}
      <PricingPlans />


      <div className='mt-20 lg:mt-[180px] px-6 md:px-24 lg:px-44 bg-gray-50'>
        <div className="flex flex-col-reverse lg:flex-row items-center lg:items-start lg:justify-between gap-12 lg:gap-0">
          <div className="w-full lg:w-auto max-w-2xl lg:-ml-20 lg:mt-20 text-center lg:text-left">
            <h1 className="text-5xl lg:text-[12rem] denton-condensed" style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>
              Trusted
              <br />
              By
            </h1>
          </div>
          <div className="w-full lg:w-auto lg:ml-4">
            <AnimatedTestimonialsDemo />
          </div>
        </div>
      </div>

      <div className='mt-[180px]'>
        <FAQSection />
      </div>

      <Footer />

      
    </div>
  );
}