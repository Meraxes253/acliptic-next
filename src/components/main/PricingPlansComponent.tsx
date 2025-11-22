import React from 'react';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: number;
  period: string;
  features: PlanFeature[];
  buttonText: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    name: "Basic",
    price: 15,
    period: "mo",
    features: [
      { text: "Store projects for a certain time", included: true },
      { text: "Upload 10 videos monthly", included: true },
      { text: "Up to 45 minutes long streams", included: true },
      { text: "HD download", included: true },
    ],
    buttonText: "Get Started"
  },
  {
    name: "Pro",
    price: 29,
    period: "mo",
    features: [
      { text: "Store projects for a longer time", included: true },
      { text: "Upload 30 videos monthly", included: true },
      { text: "Up to 2 hour long streams", included: true },
      { text: "4K download", included: true },
      { text: "Translate to multiple languages", included: true },
    ],
    buttonText: "Get Started",
    popular: true
  },
  {
    name: "Pro+",
    price: 63,
    period: "mo",
    features: [
      { text: "Store projects for a certain time", included: true },
      { text: "Upload 100 videos monthly", included: true },
      { text: "Up to 3 hour long streams", included: true },
      { text: "4K download", included: true },
      { text: "Translate to multiple languages", included: true },
    ],
    buttonText: "Get Started"
  }
];

const CheckIcon = () => (
  <svg 
    className="w-4 h-4 text-white mr-3 flex-shrink-0 mt-0.5" 
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
  <div className="w-8 h-8 mb-4">
    <img 
      src="/AELogo.svg" 
      alt="AE Logo" 
      className="w-full h-full object-contain filter brightness-0 invert"
    />
  </div>
);

export default function PricingPlans() {
  return (
    <div id="pricing-plans" className="min-h-screen bg-white dark:bg-black py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-9xl lg:text-[12rem] font-light italic text-gray-900 dark:text-white tracking-wide leading-none mb-8 denton-condensed">Plans</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-32 max-w-none mx-auto justify-items-center">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-[2.5rem] p-10 shadow-xl transform transition-all duration-300 hover:scale-105 w-[450px] h-[720px] flex flex-col justify-between ${
                plan.popular ? 'ring-4 ring-blue-300' : ''
              }`}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
              }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="flex justify-end mb-4">
                <LogoIcon />
              </div>
              
              <div className="text-white mb-12">
                <h3 className="text-5xl font-semibold mb-8 denton-condensed">{plan.name}</h3>
                <div className="flex items-baseline">
                  <span className="text-9xl font-bold font-serif denton-condensed">${plan.price}</span>
                  <span className='text-6xl'>/</span>
                  <span className="text-4xl ml-2 font-serif denton-condensed">{plan.period}</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-12 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    <div className="w-8 h-8 mr-6 flex-shrink-0">
                      <CheckIcon />
                    </div>
                    <span className="text-white text-xl leading-relaxed">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
              
              <button
                className="bg-white text-blue-600 font-semibold py-3 px-6 rounded-full hover:bg-gray-50 transition-colors duration-200 shadow-lg text-lg mx-auto block"
                onClick={() => console.log(`Selected ${plan.name} plan`)}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}