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
    is_active: boolean;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    stripeSubscriptionId: string | null;
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

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;

    setUpgradeLoading(true);
    try {
      await redirectToCheckout({
        priceId: planId,
        successUrl: `${window.location.origin}/Profile?tab=subscriptions&success=true`,
        cancelUrl: `${window.location.origin}/Profile?tab=subscriptions&canceled=true`,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleBillingPortal = async () => {
    try {
      await redirectToPortal(`${window.location.origin}/Profile?tab=subscriptions`);
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open billing portal. Please try again.');
    }
  };

  const isCurrentPlan = (planId: string) => {
    if (!subscription) return planId === 'free';
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

  if (loading || subscriptionLoading) {
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
            {subscription?.subscription.is_active && (
              <Badge className="bg-green-600 text-black">Active</Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-black mb-1">
                {subscription?.plan.name || 'Free Plan'}
              </h3>
              <p className="text-sm text-gray-600">
                {subscription?.subscription.is_active
                  ? `Next billing: ${formatDate(subscription.subscription.currentPeriodEnd)}`
                  : 'No active subscription'
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-black mb-1">
                {(subscription?.plan.amount ?? 0) === 0
                  ? 'Free'
                  : formatCurrency(subscription?.plan.amount ?? 0)
                }
              </p>
              {(subscription?.plan.amount ?? 0) > 0 && (
                <p className="text-xs text-gray-600">
                  per {subscription?.plan.interval ?? 'month'}
                </p>
              )}
            </div>
          </div>

          {subscription?.subscription.is_active && (
            <div className="mt-4 pt-4 border-t border-gray-600">
              <Button
                onClick={handleBillingPortal}
                variant="outline"
                size="sm"
                className="bg-transparent border-gray-600 text-black hover:bg-gray-800 rounded-full"
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
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isCurrent || upgradeLoading}
                      className={`w-full rounded-full transition-all ${
                        isCurrent
                          ? 'bg-gray-700 text-gray-600 cursor-not-allowed'
                          : (plan.amount ?? 0) === 0
                          ? 'gradient-silver border border-gray-600 text-black hover:bg-gray-800'
                          : 'gradient-silver text-black hover hover:opacity-90 border-0'
                      }`}
                    >
                      {upgradeLoading ? (
                        'Loading...'
                      ) : isCurrent ? (
                        'Current Plan'
                      ) : (plan.amount ?? 0) === 0 ? (
                        'Downgrade to Free'
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Upgrade Now
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

      {/* Billing History */}
      <div className="relative w-full rounded-2xl overflow-hidden gradient-silver shadow-lg border border-gray-600">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-6 h-6 text-black" />
            <h2 className="text-xl denton-condensed text-black">Billing History</h2>
          </div>

          {invoicesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <SkeletonLoader key={i} className="h-12 w-full rounded" />
              ))}
            </div>
          ) : invoices && invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                >
                  <div>
                    <p className="text-sm text-black">
                      {formatCurrency(invoice.amountPaid)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDate(invoice.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        invoice.status === 'paid'
                          ? 'bg-green-600 text-black'
                          : 'bg-gray-600 text-black'
                      }
                    >
                      {invoice.status}
                    </Badge>
                    {invoice.hostedInvoiceUrl && (
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="bg-transparent border-gray-600 text-black hover:bg-gray-800 rounded-full"
                      >
                        <a href={invoice.hostedInvoiceUrl} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-sm text-gray-600 mb-1">No billing history available</p>
              <p className="text-xs text-gray-500">
                Your invoices will appear here once you upgrade
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}