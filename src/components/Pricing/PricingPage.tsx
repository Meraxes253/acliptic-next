'use client'

import { useState } from 'react'
import Navigation from "@/components/main/mainNavigation"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Footer from '@/components/main/Footer'
import Link from 'next/link'

interface PricingPageProps{
    user_id : string,
  }

export default function PricingPage({user_id} : PricingPageProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <div className="min-h-screen bg-white">
      
      <Navigation user_id={user_id} />
      
      <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
        <h1 className="text-7xl" style={{ letterSpacing: '-0.04em', lineHeight: '92.7%' }}>Plans</h1>
          <p className="mt-4 text-xl text-gray-600">No hidden fees. Cancel anytime.</p>
        </div>

        <div className="mt-8 flex justify-center gap-4 rounded-full bg-gray-100 p-2 max-w-[300px] mx-auto">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`rounded-full px-4 py-2 text-sm font-medium hel-font ${
              billingInterval === 'monthly' ? 'bg-white shadow' : ''
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            className={`rounded-full px-4 py-2 text-sm font-medium hel-font flex items-center gap-2 ${
              billingInterval === 'yearly' ? 'bg-white shadow' : ''
            }`}
          >
            Yearly
            <span className="bg-black text-white text-xs font-medium px-2 py-0.5 rounded hel-font">
              Save $190
            </span>
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Basic Plan */}
          <Card className="relative flex flex-col rounded-2xl border p-8">
            <div className="flex items-center">
              <Image src="/AELogo.svg" alt="Logo" width={120} height={120} className="dark:invert" />
              <span className="text-xl font-semibold">Basic</span>
            </div>

            <div className="mt-4 flex items-baseline text-6xl font-semibold hel-font">
              $23
              <span className="ml-1 text-2xl font-medium text-gray-500">/month</span>
            </div>

            
            <Button className="mt-8 hel-font" variant="outline">
              <Link href='/Signup'>
              Get Started
              </Link>
            </Button>

            <p className="mt-2 text-sm text-gray-500 text-center">Secured by Stripe</p>

            <ul className="mt-8 space-y-4">
              <FeatureItem text="Upload 10 videos monthly" />
              <FeatureItem text="Up to 45 minutes long videos" />
              <FeatureItem text="Generate 100 clips monthly" />
              <FeatureItem text="HD download" />
            </ul>
          </Card>

          {/* Pro Plan */}
          <Card className="relative flex flex-col rounded-2xl bg-black p-8 text-white">
            <div className="flex items-center">
            <Image src="/AELogo.svg" alt="Logo" width={120} height={120} className="invert dark:invert"/>
              <span className="text-xl font-semibold">Pro</span>
            </div>

            <div className="mt-4 flex items-baseline text-6xl font-semibold hel-font">
              $63
              <span className="ml-1 text-2xl font-medium text-gray-400">/month</span>
            </div>

            <Button className="mt-8 hel-font" variant="secondary">
            <Link href='/Signup'>
              Get Started
              </Link>
            </Button>

            <p className="mt-2 text-sm text-gray-400 text-center">Secured by Stripe</p>

            <ul className="mt-8 space-y-4 mb-8">
              <FeatureItem text="Upload 30 videos monthly" light />
              <FeatureItem text="Up to 2 hours long videos" light />
              <FeatureItem text="Generate 300 clips monthly" light />
              <FeatureItem text="4K download" light />
              <FeatureItem text="Translate to 29 languages (AI Dubbing)" light />
            </ul>
          </Card>

          {/* Pro+ Plan */}
          <Card className="relative flex flex-col rounded-2xl border p-8 bg-gray-50">
            <div className="flex items-center">
            <Image src="/AELogo.svg" alt="Logo" width={120} height={120} className="dark:invert" />
              <span className="text-xl font-semibold">Pro+</span>
            </div>

            <div className="mt-4 flex items-baseline text-6xl font-semibold hel-font">
              $151
              <span className="ml-1 text-2xl font-medium text-gray-500">/month</span>
            </div>

            <Button className="mt-8 hel-font" variant="outline">
            <Link href='/Signup'>
              Get Started
              </Link>
            </Button>

            <p className="mt-2 text-sm text-gray-500 text-center">Secured by Stripe</p>

            <ul className="mt-8 space-y-4">
              <FeatureItem text="Upload 100 videos monthly" />
              <FeatureItem text="Up to 3 hours long videos" />
              <FeatureItem text="Generate 1000 clips monthly" />
              <FeatureItem text="4K download" />
              <FeatureItem text="Translate to 29 languages (AI Dubbing)" />
            </ul>
          </Card>
        </div>
      </div>

    <Footer />

    </div>
  )
}

function FeatureItem({ text, light = false }: { text: string; light?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <svg
        className={`h-5 w-5 flex-shrink-0 ${light ? 'text-gray-300' : 'text-gray-500'}`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
          clipRule="evenodd"
        />
      </svg>
      <span className={light ? 'text-gray-300' : 'text-gray-600'}>{text}</span>
    </li>
  )
}

