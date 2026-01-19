import Image from 'next/image';
import Link from 'next/link';
import { Twitter, Linkedin, Facebook, Phone, Mail, Clock, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 sm:mt-28 lg:mt-36 px-4 sm:px-8 lg:px-16 py-8 sm:py-10 lg:py-12 bg-gray-50 dark:bg-zinc-900 text-center">
      <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4 text-black dark:text-white" style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>
        Real-time. Nimble. Remote.
      </h2>
      <p className="text-sm sm:text-base text-[#535A6D] dark:text-gray-300 mb-12 sm:mb-16 lg:mb-24 hel-font max-w-2xl mx-auto">
        Revolutionizing live stream content: Empowering creators, amplifying engagement.
      </p>

      <div className="flex flex-col justify-center items-center mb-16 sm:mb-20 lg:mb-28">
        <Image
          src="/AELogo.svg"
          alt="Logo"
          width={140}
          height={140}
          priority
          quality={100}
          className="w-auto h-[40px] md:h-[50px] object-contain dark:invert mb-4"
        />

        <h1 className='denton-condensed text-4xl font-bold dark:text-white'>ACLIPTIC</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 lg:gap-24 mb-12 sm:mb-16 lg:mb-20 text-left">
        <FooterSection
          title="ACLIPTIC"
          items={[
            <Link key="Home" href="/" className="hover:text-[#0000F8] dark:hover:text-blue-400">Home</Link>,
            <Link key="About" href="/About" className="hover:text-[#0000F8] dark:hover:text-blue-400">About Us</Link>,
            <Link key="Features" href="/Features" className="hover:text-[#0000F8] dark:hover:text-blue-400">Features</Link>,
            <Link key="Pricing" href="/Pricing" className="hover:text-[#0000F8] dark:hover:text-blue-400">Pricing</Link>,
            <Link key="FXX" href="/FXX" className="hover:text-[#0000F8] dark:hover:text-blue-400">FXX</Link>,

          ]}
        />
        <FooterSection
          title="PLATFORMS"
          items={[
            <Link key="twitch" href="/platforms/twitch" className="hover:text-[#0000F8] dark:hover:text-blue-400">Twitch</Link>,
            <Link key="youtube" href="/platforms/youtube" className="hover:text-[#0000F8] dark:hover:text-blue-400">YouTube</Link>,
            <Link key="tiktok" href="/platforms/tiktok" className="hover:text-[#0000F8] dark:hover:text-blue-400">TikTok</Link>,
            <Link key="instagram" href="/platforms/instagram" className="hover:text-[#0000F8] dark:hover:text-blue-400">Instagram</Link>
          ]}
        />
        <FooterSection
          title="LEGAL"
          items={[
            // <Link key="terms" href="/legal/terms" className="hover:text-[#0000F8] dark:hover:text-blue-400">Terms of Service</Link>,
            <Link key="privacy" href="/privacy-policy" className="hover:text-[#0000F8] dark:hover:text-blue-400">Privacy Policy</Link>,
            // <Link key="cookies" href="/legal/cookies" className="hover:text-[#0000F8] dark:hover:text-blue-400">Cookie Policy</Link>,
            // <Link key="gdpr" href="/legal/gdpr" className="hover:text-[#0000F8] dark:hover:text-blue-400">GDPR Compliance</Link>
          ]}
        />
        <FooterSection
          title="CONTACT"
          items={[
            <span key="phone" className="flex items-center gap-2 hover:text-[#0000F8] dark:hover:text-blue-400">
              <Phone className="text-black dark:text-white" size={16} /> +971 55 448 1725
            </span>,
            <span key="email" className="flex items-center gap-2 hover:text-[#0000F8] dark:hover:text-blue-400">
              <Mail className="text-black dark:text-white" size={16} /> contact@example.com
            </span>,
            <span key="hours" className="flex items-center gap-2">
              <Clock className="text-black dark:text-white" size={16} /> Monday - Friday <br /> 9:00 AM - 6:00 PM GST
            </span>
          ]}
        />
      </div>

      <div className="w-full sm:w-[80%] lg:w-[60%] mx-auto h-[0.5px] bg-[#E1E2E6] dark:bg-zinc-700 mb-6 sm:mb-8"></div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6">
        <div className="text-sm text-[#535A6D] dark:text-gray-300">
          © 2024 Acliptic. All rights reserved.
        </div>
        <div className="flex justify-center gap-4 sm:gap-6 text-[#0A142F] dark:text-white">
          {[
            { icon: Twitter, href: "https://twitter.com/acliptic" },
            { icon: Linkedin, href: "https://linkedin.com/company/acliptic" },
            { icon: Facebook, href: "https://facebook.com/acliptic" },
            { icon: Instagram, href: "https://www.instagram.com/acliptic/" },
            { icon: Youtube, href: "https://youtube.com/acliptic" }
          ].map(({ icon: Icon, href }, index) => (
            <Link 
              key={index} 
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0000F8] dark:hover:text-blue-400 transition-colors"
              aria-label={Icon.name}
            >
              <Icon size={16} />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

interface FooterSectionProps {
  title: string;
  items: React.ReactNode[];
}

function FooterSection({ title, items }: FooterSectionProps) {
  return (
    <div>
      <h3 className="text-sm sm:text-base text-[#000000] dark:text-white mb-3 font-medium">{title}</h3>
      <ul className="text-xs sm:text-sm leading-6 sm:leading-7 text-[#535A6D] dark:text-gray-300 hel-font space-y-1">
        {items.map((item, index) => (
          <li key={index} className="transition-colors">{item}</li>
        ))}
      </ul>
    </div>
  );
}

