import { auth } from "@/auth";
import PricingPage from "@/components/Pricing/PricingPage";

export default async function Studio() {

  const session = await auth();
  const user_id = session?.user?.id || ""
  
  return (
    <PricingPage user_id={user_id} />
  )
}