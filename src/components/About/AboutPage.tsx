'use client'
import ComparisonSection from '@/components/ComparisonSection';
import Footer from '@/components/main/Footer';
import LazyVideo from '@/components/LazyVideo';
import Navigation from '@/components/main/mainNavigation';
import ValuesSection from '@/components/ValueSection';
import Image from 'next/image';
import { useEffect } from 'react';
import Lenis from 'lenis';
import Link from 'next/link';

interface AboutPageProps {
    user_id: string,
}

export default function AboutPage({ user_id }: AboutPageProps) {
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

    const valuesContent = [
        {
            content:
                "Prioritizing user experience by providing an intuitive interface, helpful documentation, and responsive support.",
            footer: "User-Centricity",
        },
        {
            content:
                "Continuously exploring and implementing emerging technologies like AI and machine learning to enhance functionality and user experience.",
            footer: "Innovation",
        },
        {
            content:
                "Automating tasks and streamlining workflows to maximize creator productivity and content impact.",
            footer: "Efficiency",
        },
        {
            content:
                "Making the platform affordable and accessible to creators of all levels, fostering a more inclusive online community.",
            footer: "Accessibility",
        },
        {
            content:
                "Delivering a stable and dependable platform, ensuring users can rely on Acliptic for their content creation needs.",
            footer: "Reliability",
        },
    ];

    const competitionData = [
        {
            feature: "Real-Time Clip Generation",
            SideEffect: "tick",
            ShortAI: "cross",
            SubmagicCo: "cross",
            Munch: "cross",
            QClipAI: "cross",
        },
        {
            feature: "AI-Powered Highlight Capture",
            SideEffect: "tick",
            ShortAI: "tick",
            SubmagicCo: "cross",
            Munch: "tick",
            QClipAI: "tick",
        },
        {
            feature: "Context-Aware Highlights",
            SideEffect: "tick",
            ShortAI: "cross",
            SubmagicCo: "cross",
            Munch: "cross",
            QClipAI: "cross",
        },
        {
            feature: "Adaptive Video Editing",
            SideEffect: "tick",
            ShortAI: "cross",
            SubmagicCo: "cross",
            Munch: "cross",
            QClipAI: "cross",
        },
        {
            feature: "Subtitle Generation",
            SideEffect: "tick",
            ShortAI: "cross",
            SubmagicCo: "tick",
            Munch: "cross",
            QClipAI: "cross",
        },
        {
            feature: "Multi-Platform Uploads",
            SideEffect: "tick",
            ShortAI: "cross",
            SubmagicCo: "cross",
            Munch: "tick",
            QClipAI: "tick",
        },
        {
            feature: "Viewer Analytics",
            SideEffect: "tick",
            ShortAI: "cross",
            SubmagicCo: "cross",
            Munch: "cross",
            QClipAI: "cross",
        },
        {
            feature: "Customizable Templates",
            SideEffect: "tick",
            ShortAI: "cross",
            SubmagicCo: "cross",
            Munch: "tick",
            QClipAI: "tick",
        },
    ];

    return (
        <div className="min-h-screen">
            <Navigation user_id={user_id} />

            {/* Hero Section */}
            <div className="w-[95%] h-[300px] sm:h-[400px] md:h-[500px] lg:h-[570px] relative mx-auto">
                <div className="absolute inset-0 bg-black">
                    <div className="absolute left-0 w-4 sm:w-5 md:w-6 lg:w-7 h-full bg-[#FF00FE]" />
                    <div className="absolute bottom-0 w-full h-3 sm:h-4 md:h-5 bg-[#FADC00]" />
                    <div className="absolute right-0 w-4 sm:w-5 md:w-6 lg:w-7 h-full bg-[#1500FF]" />
                    <div className="absolute top-0 w-full h-4 sm:h-5 md:h-6 lg:h-7 bg-[#00DC20]" />
                    <div className="absolute left-0 w-4 sm:w-5 md:w-6 lg:w-7 h-full bg-[#FF00FE]" />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <LazyVideo
                            src="/aboutus.webm"
                            width={300}
                            height={300}
                            className="w-[200px] sm:w-[300px] md:w-[400px] lg:w-[510px] h-auto object-contain"
                            priority={true}
                        />
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <div className="w-11/12 mx-auto mt-10 sm:mt-16 lg:mt-20 px-4 sm:px-8 lg:pl-48">
                <span className="text-xs sm:text-sm hel-font uppercase mb-2 sm:mb-4 block text-[#888888]">
                    About Acliptic
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-6" style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>
                    Mission & Purpose
                </h1>
            </div>

            {/* Mission Card */}
            <div className="flex justify-center mt-12 sm:mt-16 lg:mt-24 px-4">
                <div className="w-full max-w-[830px] h-auto sm:h-[350px] bg-[#0000F8] rounded-xl p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-center">
                    <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-8">
                        <Image
                            src="/missionAE.png"
                            alt="Mission"
                            width={300}
                            height={300}
                            className="w-[200px] sm:w-[300px] h-auto rounded-lg shadow-2xl"
                        />
                    </div>
                    <div className="flex flex-col justify-center text-white text-center sm:text-left">
                        <h2 className="text-lg sm:text-xl lg:text-[22px] font-bold mb-2 sm:mb-4">Understand what the aim of Acliptic is.</h2>
                        <p className="text-base sm:text-lg mb-4 text-[#a4bfff]">Nov 22 · A Velaris Project</p>
                        <Link href="/Signup">
                            <button className="flex items-center justify-center bg-white text-[#0000F8] rounded-full px-4 sm:px-6 py-2 w-fit mx-auto sm:mx-0">
                                Explore Acliptic
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mission Text */}
            <div className="flex justify-center px-4">
                <p className="w-full max-w-[830px] text-base sm:text-lg lg:text-2xl mt-10 sm:mt-16 lg:mt-20 mb-10 sm:mb-16 lg:mb-16 hel-font text-left">
                    Acliptic aims to address the challenges faced by content creators and streamers in today&#39;s competitive online environment. The platform seeks to streamline and automate the process of generating high-quality video clips from live streams, empowering creators who may lack the time or resources to manually clip and edit their content. Acliptic&#39;s goal is to provide a user-friendly and affordable alternative to hiring professional video editors, helping creators of all levels enhance their reach, engagement, and revenue potential.
                </p>
            </div>

            {/* Team Section */}
            <div className="w-11/12 mx-auto mt-10 sm:mt-16 lg:mt-20 px-4 sm:px-8 lg:pl-48">
                <span className="text-xs sm:text-sm hel-font uppercase mb-2 sm:mb-4 block text-[#888888]">
                    About Team
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 sm:mb-6" style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>
                    Our Team
                </h1>
            </div>

            {/* Team Image */}
            <div className="flex justify-center mt-12 sm:mt-16 lg:mt-24 px-4">
                <div className="w-full max-w-[830px] h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] rounded-xl overflow-hidden">
                    <Image
                        src="/team.jpeg"
                        alt="Our Team"
                        width={830}
                        height={350}
                        className="w-full h-full object-cover"
                        priority
                        quality={100}
                    />
                </div>
            </div>

            {/* Team Text */}
            <div className="flex justify-center px-4">
                <p className="w-full max-w-[830px] text-base sm:text-lg lg:text-2xl mt-10 sm:mt-16 lg:mt-20 mb-10 sm:mb-16 lg:mb-48 hel-font text-left">
                    Team Velaris is a group of university students passionate about leveraging cutting-edge technologies like AI and cloud computing to empower content creators and streamers in the rapidly evolving digital landscape. The team is committed to providing a seamless and efficient experience for users, ensuring that Acliptic remains a reliable and valuable tool for maximizing online presence and engagement.
                </p>
            </div>

            {/* Team Members Section */}
            <div className="w-11/12 mx-auto mb-16 sm:mb-20 lg:mb-28 px-4">
                <div className="border-t border-b border-black py-6 sm:py-8">
                    <div className="text-xs sm:text-sm mb-6 sm:mb-8 lg:mb-12">MEMBERS</div>
                    <div className="flex flex-col sm:flex-row sm:justify-between text-base sm:text-lg lg:text-xl gap-4 sm:gap-6 lg:gap-8">
                        <div>MUHAMMAD ARSAL</div>
                        <div>MUHAMMAD ZAIN</div>
                        <div>UMAR FARZAN</div>
                        <div>DEV ASWANI</div>
                        <div>ABDUL REHMAN IKRAM</div>
                    </div>
                </div>
            </div>

            <ValuesSection title="Acliptic's Values" values={valuesContent} />

            <hr className="w-11/12 mx-auto border-[#000000]" />

            <ComparisonSection
                title="Acliptic vs Competition"
                data={competitionData}
            />

            <hr className="w-11/12 mx-auto border-[#000000]" />

            <Footer />
        </div>
    );
}