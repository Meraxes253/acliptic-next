'use client'
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import ProfileTab from '@/components/Profile/ProfileTab';
import IntegrationsTab from '@/components/Profile/IntegrationsTab';
import SubscriptionsTab from '@/components/Profile/SubscriptionsTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    email: string;
    username: string;
    phone_number: string;
    image: string;
    youtube_channel_id?: string;
    presets?: Record<string, unknown>;
    onBoardingCompleted?: boolean;
    plugin_active?: boolean;
  };
}

const tabs = [
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'integrations', label: 'Integrations', icon: '🔗' },
  { id: 'subscriptions', label: 'Subscriptions', icon: '💎' }
];

export default function SettingsModal({ isOpen, onClose, user }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('profile');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab user={user} />;
      case 'integrations':
        return <IntegrationsTab user_id={user.id} />;
      case 'subscriptions':
        return <SubscriptionsTab user_id={user.id} />;
      default:
        return <ProfileTab user={user} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-xl">
        <DialogHeader className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-3xl font-semibold denton-condensed">Settings</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 sm:hidden"
            >
            </Button>
          </div>
          <DialogDescription className="sr-only">
            Manage your profile settings, integrations, and subscriptions
          </DialogDescription>
        </DialogHeader>
        
        {/* Mobile Tab Navigation */}
        <div className="sm:hidden">
          <div className="flex overflow-x-auto px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 border-b-[3px] font-semibold text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'dark:border-white text-black dark:text-white gradient-silver-bg'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden min-h-[600px]">
          {/* Desktop Sidebar */}
          <div className="hidden sm:block w-48 lg:w-64 border-r border-gray-200 dark:border-gray-700 p-4 lg:p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-all duration-200 settings-tab ${
                    activeTab === tab.id
                      ? 'gradient-silver text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span className="text-base lg:text-lg">{tab.icon}</span>
                  <span className="font-semibold text-sm lg:text-base">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            <div className="p-4 sm:p-6 h-full overflow-y-auto">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </DialogContent>
      <style jsx>{`
        .settings-tab:not(.gradient-silver):hover {
          background: linear-gradient(to right, #C8C2C9 0%, #7F8A8F 75%, #969DA5 100%);
          color: white;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </Dialog>
  );
}