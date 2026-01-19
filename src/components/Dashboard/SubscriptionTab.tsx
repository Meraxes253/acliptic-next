'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, ExternalLink, Loader2 } from 'lucide-react'

interface SubscriptionData {
    subscription: {
        stripeSubscriptionId: string | null
        is_active: boolean
        currentPeriodStart: string | null
        currentPeriodEnd: string | null
    }
    plan: {
        id: string
        name: string
        amount: number
        currency: string
        interval: string
    }
    usage: {
        total_seconds_processed: number
        max_total_seconds_processed: number
        max_active_streams: number
        max_streams: number
    }
}

interface Invoice {
    id: string
    amountPaid: number
    currency: string
    status: string
    createdAt: string
    hostedInvoiceUrl: string | null
    invoicePdf: string | null
}

export default function SubscriptionCard() {
    const router = useRouter()
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [loading, setLoading] = useState(true)
    const [portalLoading, setPortalLoading] = useState(false)

    useEffect(() => {
        // Fetch subscription and invoices in parallel
        Promise.all([
            fetch('/api/user/subscription').then(res => res.json()),
            fetch('/api/user/invoices').then(res => res.json())
        ]).then(([subData, invoicesData]) => {
            setSubscription(subData)
            setInvoices(invoicesData || [])
            setLoading(false)
        }).catch(err => {
            console.error('Error fetching subscription data:', err)
            setLoading(false)
        })
    }, [])

    const handleManagePayment = async () => {
        setPortalLoading(true)
        try {
            const response = await fetch('/api/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    returnUrl: window.location.href
                })
            })
            const { url } = await response.json()
            if (url) {
                window.location.href = url
            }
        } catch (error) {
            console.error('Error opening billing portal:', error)
            setPortalLoading(false)
        }
    }

    const handleUpgrade = () => {
        router.push('/Pricing')
    }

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency.toUpperCase()
        }).format(amount / 100)
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        })
    }

    const calculateProgress = (current: number, max: number) => {
        if (max === 0) return 0
        return Math.min((current / max) * 100, 100)
    }

    if (loading) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!subscription) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xl text-gray-500 hel-font">No subscription data found</p>
            </div>
        )
    }

    const streamsUsed = 0 // TODO: Get actual stream count from database
    const clipsUsed = 0 // TODO: Get actual clip count from database

    return (
        <div className="absolute bottom-8 left-8 flex items-end gap-32 max-w-full overflow-x-auto pb-4">
            <div>
                <div className="mb-52">
                    <p className="text-6xl hel-font subscription-title" style={{ letterSpacing: '-0.04em', lineHeight: '92.7%', '--delay': '0.2s' } as any}>
                        {subscription.plan.name.toUpperCase()}
                    </p>
                    <p className="text-6xl hel-font subscription-title" style={{ letterSpacing: '-0.04em', lineHeight: '92.7%', '--delay': '0.3s' } as any}>MEMBERSHIP</p>
                    <p className="text-3xl mt-2 hel-font subscription-price" style={{ '--delay': '0.5s' } as any}>
                        {formatCurrency(subscription.plan.amount, subscription.plan.currency)}
                        <span className="text-xl">/{subscription.plan.interval}</span>
                    </p>
                </div>
                <p className="text-4xl subscription-label" style={{ letterSpacing: '-0.04em', lineHeight: '92.7%', '--delay': '0.7s' } as any}>SUBSCRIPTION</p>
            </div>

            <div className="absolute ml-[650px] mb-16 subscription-details">
                <div className="mb-8 subscription-status" style={{ '--delay': '0.4s' } as any}>
                    <p className="text-6xl text-[#9BA1A3] hel-font" style={{ letterSpacing: '-0.04em' }}>
                        {subscription.subscription.is_active ? 'Active' : 'Inactive'}
                    </p>
                    <div className="h-[1px] bg-[#9BA1A3] mt-2 status-line"></div>
                </div>

                <div className="space-y-4 mb-8 subscription-dates" style={{ '--delay': '0.6s' } as any}>
                    <p className="text-lg hel-font">Purchase Date: {formatDate(subscription.subscription.currentPeriodStart)}</p>
                    <p className="text-lg hel-font">Renewal Date: {formatDate(subscription.subscription.currentPeriodEnd)}</p>
                </div>

                <div className="flex gap-6 mb-12 subscription-usage" style={{ '--delay': '0.8s' } as any}>
                    <div className="flex-1">
                        <div className="flex justify-between mb-2 hel-font">
                            <span>{streamsUsed} / {subscription.usage.max_streams} Streams.</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded-full w-[200px]">
                            <div
                                className="h-1 bg-[#9BA1A3] rounded-full progress-bar"
                                style={{ width: `${calculateProgress(streamsUsed, subscription.usage.max_streams)}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between mb-2 hel-font">
                            <span>{Math.floor(subscription.usage.total_seconds_processed / 60)}min / {Math.floor(subscription.usage.max_total_seconds_processed / 60)}min Processing.</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded-full w-[200px]">
                            <div
                                className="h-1 bg-black rounded-full progress-bar"
                                style={{
                                    width: `${calculateProgress(subscription.usage.total_seconds_processed, subscription.usage.max_total_seconds_processed)}%`,
                                    animationDelay: '0.2s'
                                }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Billing History Section */}
                {invoices.length > 0 && (
                    <div className="mb-12 subscription-billing" style={{ '--delay': '0.9s' } as any}>
                        <p className="text-2xl hel-font mb-4" style={{ letterSpacing: '-0.02em' }}>BILLING HISTORY</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {invoices.slice(0, 5).map((invoice) => (
                                <div key={invoice.id} className="flex items-center justify-between text-sm hel-font bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                    <span>{formatDate(invoice.createdAt)}</span>
                                    <span className="font-semibold">{formatCurrency(invoice.amountPaid, invoice.currency)}</span>
                                    <span className={`px-2 py-1 rounded text-xs ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {invoice.status}
                                    </span>
                                    {invoice.hostedInvoiceUrl && (
                                        <a
                                            href={invoice.hostedInvoiceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-blue-600 transition-colors"
                                        >
                                            <Download className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-4 subscription-buttons" style={{ '--delay': '1s' } as any}>
                    <button
                        onClick={handleManagePayment}
                        disabled={portalLoading || !subscription.subscription.stripeSubscriptionId}
                        className="bg-black dark:bg-white dark:text-black text-white px-8 py-3 transition-colors hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white border border-black dark:border-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                        {subscription.subscription.stripeSubscriptionId ? 'MANAGE' : 'FREE PLAN'}
                    </button>
                    <button
                        onClick={handleUpgrade}
                        className="bg-black dark:bg-white dark:text-black text-white px-8 py-3 transition-colors hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white border border-black dark:border-white"
                    >
                        UPGRADE
                    </button>
                </div>
            </div>

            {/* Add subscription animations */}
            <style jsx>{`
                .subscription-title {
                    opacity: 0;
                    transform: translateY(20px);
                    animation: fadeUp 0.7s var(--delay) cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }

                .subscription-price {
                    opacity: 0;
                    transform: translateX(-10px);
                    animation: fadeSlideIn 0.6s var(--delay) cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }

                .subscription-label {
                    opacity: 0;
                    animation: fadeIn 0.8s var(--delay) ease-out forwards;
                }

                .subscription-status {
                    opacity: 0;
                    transform: translateY(15px);
                    animation: fadeUp 0.7s var(--delay) cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }

                .status-line {
                    transform: scaleX(0);
                    transform-origin: left;
                    animation: growLine 0.6s calc(var(--delay) + 0.2s) cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }

                .subscription-dates {
                    opacity: 0;
                    animation: fadeIn 0.7s var(--delay) ease-out forwards;
                }

                .subscription-usage {
                    opacity: 0;
                    animation: fadeIn 0.7s var(--delay) ease-out forwards;
                }

                .subscription-billing {
                    opacity: 0;
                    animation: fadeIn 0.7s var(--delay) ease-out forwards;
                }

                .progress-bar {
                    transform: scaleX(0);
                    transform-origin: left;
                    animation: growLine 1s calc(var(--delay) + 0.2s) cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }

                .subscription-buttons {
                    opacity: 0;
                    transform: translateY(10px);
                    animation: fadeUp 0.7s var(--delay) cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }

                @keyframes fadeUp {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }

                @keyframes fadeSlideIn {
                    0% {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes growLine {
                    0% {
                        transform: scaleX(0);
                    }
                    100% {
                        transform: scaleX(1);
                    }
                }
            `}</style>
        </div>
    );
}