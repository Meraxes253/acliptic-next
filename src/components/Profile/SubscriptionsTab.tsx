'use client'
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonLoader } from '@/components/LoadingSkeletonScreen';
import { Badge } from '@/components/ui/badge';
import { redirectToCheckout, redirectToPortal } from '@/lib/checkout-helpers';
import { formatCurrency } from '@/lib/stripe';
import {
  Check,
  X,
  CreditCard,
  Calendar,
  TrendingUp,
  Settings,
  Crown,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import useSWR from 'swr';

interface SubscriptionsTabProps {
  user_id: string;
  loading?: boolean;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: string;
  max_active_streams?: number;
  max_streams?: number;
  max_total_seconds_processed?: number;
  features?: string[];
}

interface Subscription {
  plan: Plan;
  subscription: {
    id?: string;
    is_active: boolean;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
  };
  usage: {
    total_seconds_processed: number;
    max_total_seconds_processed: number;
    max_active_streams: number;
    max_streams: number;
  };
}

interface Invoice {
  id: string;
  amountPaid: number;
  currency: string;
  status: string;
  createdAt: string;
  hostedInvoiceUrl?: string;
}

// SWR fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SubscriptionsTab({ user_id, loading = false }: SubscriptionsTabProps) {
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Fetch subscription data
  const {
    data: subscription,
    isLoading: subscriptionLoading,
    mutate: mutateSubscription,
  } = useSWR<Subscription>('/api/user/subscription', fetcher);

  // Fetch available plans
  const { data: plans, isLoading: plansLoading } = useSWR<Plan[]>('/api/plans', fetcher);

  // Fetch invoices
  const { data: invoices, isLoading: invoicesLoading } = useSWR<Invoice[]>('/api/user/invoices', fetcher);

  // Check if user has a paid subscription (not free tier)
  const hasPaidSubscription = () => {
    if (!subscription?.subscription?.id) return false;
    // Free subscriptions start with 'free_'
    return !subscription.subscription.id.startsWith('free_');
  };

  const handlePlanChange = async (planId: string) => {
    // Don't do anything if selecting current plan
    if (isCurrentPlan(planId)) return;

    setUpgradeLoading(true);
    try {
      // If user is on free tier (or has no paid subscription), use checkout flow
      if (!hasPaidSubscription()) {
        // If selecting free plan, do nothing
        if (planId === 'free' || plans?.find(p => p.id === planId)?.amount === 0) {
          toast.info('You are already on the free plan.');
          setUpgradeLoading(false);
          return;
        }

        // Go through Stripe checkout for first-time paid subscription
        await redirectToCheckout({
          priceId: planId,
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        });
      } else {
        // User has a paid subscription - use change-plan API
        const response = await fetch('/api/subscription/change-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newPriceId: planId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to change plan');
        }

        // Show appropriate message based on upgrade/downgrade
        if (data.type === 'upgrade') {
          toast.success('Plan upgraded!', {
            description: data.message,
          });
        } else if (data.type === 'downgrade') {
          toast.success('Plan change scheduled', {
            description: data.message,
          });
        } else if (data.type === 'downgrade_to_free') {
          toast.success('Subscription cancelled', {
            description: data.message,
          });
        }

        // Refresh subscription data
        mutateSubscription();
      }
    } catch (error: any) {
      console.error('Plan change error:', error);
      toast.error(error.message || 'Failed to change plan. Please try again.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleBillingPortal = async () => {
    try {
      // Redirect back to Dashboard with subscriptions tab active
      await redirectToPortal(`${window.location.origin}/Studio`);
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open billing portal. Please try again.');
    }
  };

  const isCurrentPlan = (planId: string) => {
    if (!subscription || !subscription.plan) return planId === 'free';
    return subscription.plan.id === planId;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatUsage = (used: number, max: number, unit: string) => {
    if (unit === 'seconds') {
      const usedMinutes = Math.round(used / 60);
      const maxMinutes = Math.round(max / 60);
      return `${usedMinutes}/${maxMinutes} minutes`;
    }
    return `${used}/${max} ${unit}`;
  };

  // Show loading state if data is being fetched or subscription is not yet defined
  if (loading || subscriptionLoading || !subscription) {
    return (
      <div className="space-y-6">
        {/* Current Plan Skeleton */}
        <div className="relative w-full rounded-2xl overflow-hidden gradient-silver shadow-lg border border-gray-600 p-6">
          <div className="space-y-4">
            <SkeletonLoader className="h-6 w-32" />
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <SkeletonLoader className="h-5 w-24" />
                <SkeletonLoader className="h-4 w-16" />
              </div>
              <div className="text-right space-y-2">
                <SkeletonLoader className="h-6 w-20" />
                <SkeletonLoader className="h-3 w-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Usage Skeleton */}
        <div className="relative w-full rounded-2xl overflow-hidden gradient-silver shadow-lg border border-gray-600 p-6">
          <SkeletonLoader className="h-6 w-24 mb-4" />
          <div className="space-y-3">
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-4 w-3/4" />
          </div>
        </div>

        {/* Plans Skeleton */}
        <div className="space-y-4">
          <SkeletonLoader className="h-6 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="relative w-full rounded-2xl overflow-hidden gradient-silver shadow-lg border border-gray-600 p-6">
                <SkeletonLoader className="h-20 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div className="relative w-full rounded-2xl overflow-hidden gradient-silver shadow-lg border border-gray-600">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-6 h-6 text-black" />
            <h2 className="text-xl denton-condensed text-black">Current Plan</h2>
            {subscription?.subscription?.is_active && (
              <Badge className="bg-green-600 text-black">Active</Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-black mb-1">
                {subscription?.plan?.name || 'Free Plan'}
              </h3>
              <p className="text-sm text-gray-600">
                {subscription?.subscription?.is_active
                  ? `Next billing: ${formatDate(subscription.subscription.currentPeriodEnd ?? null)}`
                  : 'No active subscription'
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-black mb-1">
                {(subscription?.plan?.amount ?? 0) === 0
                  ? 'Free'
                  : formatCurrency(subscription?.plan?.amount ?? 0)
                }
              </p>
              {(subscription?.plan?.amount ?? 0) > 0 && (
                <p className="text-xs text-gray-600">
                  per {subscription?.plan?.interval ?? 'month'}
                </p>
              )}
            </div>
          </div>

          {subscription?.subscription?.is_active && (
            <div className="mt-4 pt-4 border-t border-gray-600">
              <Button
                onClick={handleBillingPortal}
                size="sm"
                className="bg-transparent text-black hover:bg-white/30 rounded-full border-0 shadow-md"
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Usage Analytics Card */}
      {subscription && (
        <div className="relative w-full rounded-2xl overflow-hidden gradient-silver shadow-lg border border-gray-600">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-black" />
              <h2 className="text-xl denton-condensed text-black">Usage Analytics</h2>
            </div>

            <div className="space-y-4">
              {/* Processing Usage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Video Processing</span>
                  <span className="text-sm text-black">
                    {formatUsage(
                      subscription.usage?.total_seconds_processed ?? 0,
                      subscription.usage?.max_total_seconds_processed ?? 300,
                      'seconds'
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="gradient-silver h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        ((subscription.usage?.total_seconds_processed ?? 0) /
                          (subscription.usage?.max_total_seconds_processed ?? 300)) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Active Streams */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Max Active Streams</span>
                <span className="text-sm text-black">
                  {subscription.usage?.max_active_streams ?? 1}
                </span>
              </div>

              {/* Total Streams */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Max Total Streams</span>
                <span className="text-sm text-black">
                  {subscription.usage?.max_streams ?? 3}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      {plans && !plansLoading && (
        <div className="space-y-4">
          <h2 className="text-xl denton-condensed text-black">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => {
              const isCurrent = isCurrentPlan(plan.id);
              return (
                <div
                  key={plan.id}
                  className={`relative w-full rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.02] ${
                    isCurrent
                      ? 'gradient-silver border-2 border-gray-700'
                      : 'gradient-silver border border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="p-6">
                    {isCurrent && (
                      <Badge className="absolute top-4 right-4 bg-green-600 text-black">
                        Current
                      </Badge>
                    )}

                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-black mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {plan.description}
                      </p>

                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-black">
                          {(plan.amount ?? 0) === 0 ? 'Free' : formatCurrency(plan.amount ?? 0)}
                        </span>
                        {(plan.amount ?? 0) > 0 && (
                          <span className="text-sm text-gray-600">
                            per {plan.interval ?? 'month'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    {plan.features && (
                      <div className="space-y-2 mb-4">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      onClick={() => handlePlanChange(plan.id)}
                      disabled={isCurrent || upgradeLoading}
                      className={`w-full rounded-full transition-all ${
                        isCurrent
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed shadow-md'
                          : 'bg-transparent text-black hover:bg-white/30 border-0 shadow-md'
                      }`}
                    >
                      {upgradeLoading ? (
                        'Loading...'
                      ) : isCurrent ? (
                        'Current Plan'
                      ) : (plan.amount ?? 0) === 0 ? (
                        'Downgrade to Free'
                      ) : (subscription?.plan?.amount ?? 0) > (plan.amount ?? 0) ? (
                        'Downgrade'
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Upgrade
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}