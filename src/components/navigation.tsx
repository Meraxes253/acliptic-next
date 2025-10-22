'use client'
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: "/dashboard.svg", alt: "Dashboard", href: "/Dashboard" },
  { icon: "/studio.svg", alt: "Studio", href: "/Studio" },
  { icon: "/settings.svg", alt: "Settings", href: "/Profile" }
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <div className="absolute top-[calc(4rem+2.7rem)] left-8 flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-4" style={{ marginTop: 'calc(35vh - 100px)' }}>
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant="outline"
            className={`h-10 w-10 rounded-xl p-0 ${item.alt === 'Studio' ? 'bg-black' : 'bg-white'}`}
            asChild
          >
            <Link href={item.href}>
              <Image
                src={item.icon}
                alt={item.alt}
                width={20}
                height={20}
                className={pathname === item.href ? 'brightness-0' : item.alt === 'Studio' ? 'brightness-[10]' : 'brightness-[0.4]'}
              />
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}

export default Navigation;