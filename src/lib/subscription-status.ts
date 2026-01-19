import { getUserSubscription } from "./subscription-helpers"

// Check if user has access to a feature based on their plan
export async function hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)

  if (!subscription) {
    // No subscription - only free features
    return isFeatureInPlan("free", feature)
  }

  return isFeatureInPlan(subscription.plan.id, feature)
}

// Define features for each plan
const PLAN_FEATURES = {
  free: ["basic_feature_1", "basic_feature_2"],
  basic_monthly: ["basic_feature_1", "basic_feature_2", "premium_feature_1", "premium_feature_2"],
  pro_monthly: [
    "basic_feature_1",
    "basic_feature_2",
    "premium_feature_1",
    "premium_feature_2",
    "pro_feature_1",
    "pro_feature_2",
    "advanced_analytics",
    "priority_support",
  ],
}

function isFeatureInPlan(planId: string, feature: string): boolean {
  const features = PLAN_FEATURES[planId as keyof typeof PLAN_FEATURES] || []
  return features.includes(feature)
}

// Get user's plan limits
export async function getPlanLimits(userId: string) {
  const subscription = await getUserSubscription(userId)
  const planId = subscription?.plan.id || "free"

  const limits = {
    free: {
      maxProjects: 1,
      maxUsers: 1,
      storageGB: 1,
      apiCallsPerMonth: 1000,
    },
    basic_monthly: {
      maxProjects: 5,
      maxUsers: 5,
      storageGB: 10,
      apiCallsPerMonth: 10000,
    },
    pro_monthly: {
      maxProjects: -1, // unlimited
      maxUsers: -1, // unlimited
      storageGB: 100,
      apiCallsPerMonth: 100000,
    },
  }

  return limits[planId as keyof typeof limits] || limits.free
}

// Check if user is on trial
export async function isOnTrial(userId: string): Promise<boolean> {
  // Trial functionality removed from schema
  return false
}

// Get trial days remaining
export async function getTrialDaysRemaining(userId: string): Promise<number> {
  // Trial functionality removed from schema
  return 0
}
