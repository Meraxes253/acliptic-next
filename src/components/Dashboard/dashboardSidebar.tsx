'use client'
import Image from "next/image";
import { useState } from "react";
//import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation';
import { SignOutAction } from '@/actions/SignOutAction';


interface DashboardSidebarProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
}

export default function DashboardSidebar({ activeTab, setActiveTab }: DashboardSidebarProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('monthly');
  const router = useRouter();

  const handleManualLogout = async () => {
    try {
      // NextAuth will handle the redirect to '/'
      await SignOutAction();
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback navigation if something goes wrong
      router.push('/');
    }
  };


  const prices = {
    monthly: {
      amount: 29.99,
      period: 'MONTH'
    },
    annually: {
      amount: 19.99,
      period: 'MONTH'
    }
  };

  return (
    <div className="w-[230px] border-l border-black flex flex-col">
      
      {/* GO TO section */}
      <div className="p-4 border-b border-black hel-font text-sm">
        <p className="text-gray-500">GO TO:</p>
      </div>
      
      {/* Menu items */}
      <div 
        onClick={() => setActiveTab(1)}
        className={`p-4 flex justify-between hel-font text-sm cursor-pointer transition-colors duration-200 relative ${
          activeTab === 1 
            ? 'bg-black text-white' 
            : 'hover:bg-gray-100'
        }`}
      >
        <p>{activeTab === 1 ? '01' : <span className="text-[#767676]">01</span>}</p>
        <p>{activeTab === 1 ? 'STREAM ANALYTICS' : <span className="text-[#767676]">STREAM ANALYTICS</span>}</p>
        {activeTab !== 1 && <div className="border-b border-gray-300 absolute left-4 right-4 bottom-0" />}
      </div>
      
      {/* <div 
        onClick={() => setActiveTab(2)}
        className={`p-4 flex justify-between hel-font text-sm cursor-pointer transition-colors duration-200 relative ${
          activeTab === 2 
            ? 'bg-black text-white' 
            : 'hover:bg-gray-100'
        }`}
      >
        <p>{activeTab === 2 ? '02' : <span className="text-[#767676]">02</span>}</p>
        <p>{activeTab === 2 ? 'COMMENTS' : <span className="text-[#767676]">COMMENTS</span>}</p>
        {activeTab !== 2 && <div className="border-b border-gray-300 absolute left-4 right-4 bottom-0" />}
      </div> */}
      <div 
        onClick={() => setActiveTab(3)}
        className={`p-4 flex justify-between hel-font text-sm cursor-pointer transition-colors duration-200 relative ${
          activeTab === 3 
            ? 'bg-black text-white' 
            : 'hover:bg-gray-100'
        }`}
      >
        <p>{activeTab === 3 ? '03' : <span className="text-[#767676]">03</span>}</p>
        <p>{activeTab === 3 ? 'INSIGHTS' : <span className="text-[#767676]">INSIGHTS</span>}</p>
        {activeTab !== 3 && <div className="border-b border-gray-300 absolute left-4 right-4 bottom-0" />}
      </div>
      {/* <div 
        onClick={() => setActiveTab(4)}
        className={`p-4 flex justify-between hel-font text-sm cursor-pointer transition-colors duration-200 relative ${
          activeTab === 4 
            ? 'bg-black text-white' 
            : 'hover:bg-gray-100'
        }`}
      >
        <p>{activeTab === 4 ? '04' : <span className="text-[#767676]">04</span>}</p>
        <p>{activeTab === 4 ? 'SUBSCRIPTION' : <span className="text-[#767676]">SUBSCRIPTION</span>}</p>
        {activeTab !== 4 && <div className="border-b border-gray-300 absolute left-4 right-4 bottom-0" />}
      </div> */}
      
      {/* JOIN section */}
      {/* <div className="bg-black text-white hover:bg-white hover:text-black border-y border-transparent hover:border-black p-10 flex items-center justify-center mt-8 cursor-pointer transition-all duration-200">
        <p className="text-5xl">JOIN</p>
      </div> */}
      
      {/* Pricing toggle */}
      {/* <div className="flex border-b border-gray-300">
        <div 
          onClick={() => setBillingPeriod('monthly')}
          className={`flex-1 p-4 text-center border-r border-gray-300 text-xs cursor-pointer transition-colors duration-200 ${
            billingPeriod === 'monthly' ? 'text-black' : 'text-[#767676] hover:text-black'
          }`}
        >
          MONTHLY
        </div>
        <div 
          onClick={() => setBillingPeriod('annually')}
          className={`flex-1 p-4 text-center text-xs cursor-pointer transition-colors duration-200 ${
            billingPeriod === 'annually' ? 'text-black' : 'text-[#767676] hover:text-black'
          }`}
        >
          ANNUALLY
        </div>
      </div> */}
      
      {/* Price */}
      {/* <div className="p-6 flex items-center justify-center">
        <span className="text-lg">$</span>
        <span className="text-7xl">{prices[billingPeriod].amount.toString().split('.')[0]}</span>
        <div className="flex flex-col justify-start ml-1">
          <span className="text-lg">.{prices[billingPeriod].amount.toString().split('.')[1]}</span>
          <span className="text-xs text-gray-500">/{prices[billingPeriod].period}</span>
        </div>
      </div> */}
    </div>
  );
}