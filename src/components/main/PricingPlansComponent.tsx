'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { redirectToCheckout } from '@/lib/checkout-helpers';
import { Loader2 } from 'lucide-react';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string; // Stripe price ID
  name: string;
  price: number;
  period: string;
  features: PlanFeature[];
  buttonText: string;
  popular?: boolean;
}

// TODO: Replace paid plan Stripe Price IDs with your actual ones from Stripe Dashboard
const plans: Plan[] = [
  {
    id: "free", // Not a Stripe price ID - handled differently
    name: "Free",
    price: 0,
    period: "mo",
    features: [
      { text: "1 active stream", included: true },
      { text: "5 streams per month", included: true },
      { text: "1 hour of processing", included: true },
      { text: "HD download", included: true },
    ],
    buttonText: "Get Started"
  },
  {
    id: "price_1SY3Y4CqupbWv0Ra2HF7KbTv", // Replace with actual Stripe price ID for Basic
    name: "Basic",
    price: 15,
    period: "mo",
    features: [
      { text: "Store projects for a certain time", included: true },
      { text: "Upload 10 videos monthly", included: true },
      { text: "Up to 45 minutes long streams", included: true },
      { text: "HD download", included: true },
      { text: "Email support", included: true },
    ],
    buttonText: "Get Started"
  },
  {
    id: "price_1SY3YzCqupbWv0Rap5lrdUq1 ", // Replace with actual Stripe price ID for Pro
    name: "Pro",
    price: 29,
    period: "mo",
    features: [
      { text: "Store projects for a longer time", included: true },
      { text: "Upload 30 videos monthly", included: true },
      { text: "Up to 2 hour long streams", included: true },
      { text: "4K download", included: true },
      { text: "Translate to multiple languages", included: true },
      { text: "Priority support", included: true },
    ],
    buttonText: "Get Started",
    popular: true
  }
];

const CheckIcon = () => (
  <svg
    className="w-full h-full text-white flex-shrink-0"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const LogoIcon = () => (
  <div className="w-6 h-6 sm:w-8 sm:h-8">
    <img
      src="/AELogo.svg"
      alt="AE Logo"
      className="w-full h-full object-contain filter brightness-0 invert"
    />
  </div>
);

export default function PricingPlans() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    // Check authentication status and current subscription
    fetch('/api/user/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setIsAuthenticated(!!data);

        // If authenticated, fetch current subscription
        if (data) {
          return fetch('/api/user/subscription').then(res => res.json());
        }
        return null;
      })
      .then(subscription => {
        setCurrentSubscription(subscription);
        setCheckingAuth(false);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setCheckingAuth(false);
      });
  }, []);

  const handleSelectPlan = async (plan: Plan) => {
    // Handle FREE plan differently
    if (plan.id === 'free') {
      if (!isAuthenticated) {
        // Not logged in - redirect to signup
        router.push('/Signup');
      } else {
        // Already logged in with free plan - go to Studio
        router.push('/Studio');
      }
      return;
    }

    // Handle PAID plans
    if (!isAuthenticated) {
      // Redirect to signup with plan parameter
      router.push(`/Signup?plan=${plan.id}`);
      return;
    }

    // Check if user already has a paid subscription
    const hasActivePaidSubscription = currentSubscription?.subscription?.stripeSubscriptionId &&
                                     currentSubscription?.subscription?.stripeSubscriptionId !== '' &&
                                     !currentSubscription?.subscription?.stripeSubscriptionId?.startsWith('free_');

    if (hasActivePaidSubscription) {
      // User has existing paid subscription - check if they're selecting the same plan
      const currentPlanId = currentSubscription?.plan?.id;

      if (currentPlanId === plan.id) {
        // Same plan - just go to Studio
        alert('You are already subscribed to this plan!');
        router.push('/Studio');
        return;
      }

      // Different plan - prompt to use billing portal for plan changes
      const confirmChange = confirm(
        `You currently have the ${currentSubscription?.plan?.name} plan.\n\n` +
        `To change to the ${plan.name} plan, you'll be redirected to the billing portal where you can manage your subscription.\n\n` +
        `Click OK to continue.`
      );

      if (confirmChange) {
        setLoading(plan.id);
        try {
          const response = await fetch('/api/portal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              returnUrl: window.location.href
            })
          });
          const { url } = await response.json();
          if (url) {
            window.location.href = url;
          }
        } catch (error) {
          console.error('Error opening billing portal:', error);
          alert('Failed to open billing portal. Please try again.');
        } finally {
          setLoading(null);
        }
      }
      return;
    }

    // No existing paid subscription - proceed to checkout for new subscription
    setLoading(plan.id);
    try {
      await redirectToCheckout({
        priceId: plan.id,
        successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/#pricing-plans`,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div id="pricing-plans" className="min-h-screen bg-white dark:bg-black py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1920px] mx-auto">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[12rem] font-light italic text-gray-900 dark:text-white tracking-wide leading-none mb-4 sm:mb-6 lg:mb-8 denton-condensed">Plans</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 xl:gap-8 max-w-none mx-auto justify-items-center">
          {plans.map((plan, index) => {
            // Check if this is the user's current plan
            const isCurrentPlan = currentSubscription?.plan?.id === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 xl:p-12 shadow-xl transform transition-all duration-300 hover:scale-105 w-full max-w-[400px] sm:max-w-[500px] lg:max-w-[650px] xl:max-w-[700px] min-h-[500px] sm:min-h-[520px] lg:min-h-[600px] xl:min-h-[640px] flex flex-col ${
                  plan.popular ? 'ring-4 ring-blue-300' : ''
                } ${isCurrentPlan ? 'ring-4 ring-green-400' : ''}`}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                }}
              >
                {/* Current Plan Badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-3 sm:-top-4 left-1/4 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                      Current Plan
                    </span>
                  </div>
                )}

                {/* Most Popular Badge */}
                {plan.popular && (
                  <div className={`absolute -top-3 sm:-top-4 ${isCurrentPlan ? 'right-1/4 translate-x-1/2' : 'left-1/2 -translate-x-1/2'}`}>
                    <span className="bg-orange-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

              <div className="flex justify-end mb-3 sm:mb-4">
                <LogoIcon />
              </div>

              <div className="text-white mb-6 sm:mb-8 lg:mb-12">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4 sm:mb-6 lg:mb-8 denton-condensed">{plan.name}</h3>
                <div className="flex items-baseline">
                  <span className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold font-serif denton-condensed">${plan.price}</span>
                  <span className='text-4xl sm:text-5xl lg:text-6xl'>/</span>
                  <span className="text-2xl sm:text-3xl lg:text-4xl ml-1 sm:ml-2 font-serif denton-condensed">{plan.period}</span>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 lg:mb-12 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 mr-4 sm:mr-6 flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <span className="text-white text-base sm:text-lg lg:text-xl leading-relaxed">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <button
                className="mt-auto bg-white text-blue-600 font-semibold py-2.5 sm:py-3 px-5 sm:px-6 rounded-full hover:bg-gray-50 transition-colors duration-200 shadow-lg text-base sm:text-lg w-full sm:w-auto sm:mx-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] sm:min-h-[48px]"
                onClick={() => handleSelectPlan(plan)}
                disabled={loading === plan.id || checkingAuth}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : isCurrentPlan ? (
                  'Current Plan'
                ) : (
                  plan.buttonText
                )}
              </button>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}