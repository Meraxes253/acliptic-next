'use client'
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonLoader } from '@/components/LoadingSkeletonScreen';

interface SubscriptionsTabProps {
  user_id: string;
  loading?: boolean;
}

export default function SubscriptionsTab({ user_id, loading = false }: SubscriptionsTabProps) {
  const [currentPlan] = useState({
    name: 'Free Plan',
    price: 0,
    billing: 'No billing',
    features: [
      { name: 'Basic profile management', included: true },
      { name: 'Social media integrations', included: true },
      { name: 'Advanced analytics', included: false, proOnly: true },
      { name: 'Priority support', included: false, proOnly: true },
      { name: 'Custom branding', included: false, proOnly: true },
      { name: 'API access', included: false, proOnly: true },
    ]
  });

  const handleUpgrade = () => {
    // Handle upgrade logic here
    console.log('Upgrading to Pro plan...');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="space-y-2">
            <SkeletonLoader className="h-5 w-24" />
            <SkeletonLoader className="h-4 w-16" />
          </div>
          <div className="text-right space-y-2">
            <SkeletonLoader className="h-6 w-20" />
            <SkeletonLoader className="h-3 w-16" />
          </div>
        </div>

        <div className="space-y-2">
          <SkeletonLoader className="h-5 w-24" />
          <div className="space-y-2">
            <SkeletonLoader className="h-4 w-48" />
            <SkeletonLoader className="h-4 w-52" />
            <SkeletonLoader className="h-4 w-44" />
            <SkeletonLoader className="h-4 w-40" />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <SkeletonLoader className="h-10 w-full" />
          <SkeletonLoader className="h-3 w-64 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg">Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{currentPlan.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{currentPlan.billing}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-gray-900 dark:text-white">
                ${currentPlan.price}/month
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {currentPlan.billing}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg">Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentPlan.features.map((feature, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 ${
                  !feature.included ? 'opacity-50' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  {feature.included ? (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {feature.name}
                  {feature.proOnly && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                      (Pro only)
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Section */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upgrade to Pro
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Unlock advanced features and priority support
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">$19</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Cancel anytime • 14-day free trial
              </p>
            </div>

            <Button
              onClick={handleUpgrade}
              className="w-full gradient-silver text-white hover:text-white hover:opacity-90 border-0 rounded-full"
            >
              Start Free Trial
            </Button>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Get access to all Pro features instantly
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg">Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">No billing history available</p>
            <p className="text-xs mt-1">Your invoices will appear here once you upgrade</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}