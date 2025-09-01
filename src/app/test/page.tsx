

import { auth } from "@/auth";
import { db } from "@/db";
import {  plans, stream, subscriptions, users } from "@/db/schema/users";
import {  sql, eq, count, and, gte, lte } from "drizzle-orm";


export default async function () {

  const session = await auth();
  const user_id = session?.user?.id || "" 
 
  let twitch_username = ""
  let youtube_channel_id = ""


  if (session?.user) {

      // get current active streams
      const currentActiveStreamCount = await db.select({
          count: count(),
      }).from(stream).
      where(and(eq(stream.user_id, user_id), eq(stream.active, true)))

      console.log('currentActiveStreamCount: ',currentActiveStreamCount )

      // get no. of streams in current subscription period
      const numStreams  = await db
          .select({ count: count() })
          .from(stream)
          .innerJoin(subscriptions, eq(stream.user_id, subscriptions.userId))
          .where(and(
          eq(stream.user_id, user_id),
          gte(stream.created_at, subscriptions.currentPeriodStart),
          lte(stream.created_at, subscriptions.currentPeriodEnd)
      ));
      console.log('numStreams: ',numStreams )


      // get limits based on users plan
      const limits = await db
          .select({
          maxActiveStreams: plans.max_active_streams,
          maxStreams: plans.max_streams,
          maxTotalSecondsProcessed: plans.max_total_seconds_processed,
          })
          .from(subscriptions)
          .innerJoin(plans, eq(subscriptions.priceId, plans.id))
          .where(eq(subscriptions.userId, user_id));
    
      console.log('limits: ',limits )

      if (currentActiveStreamCount[0]?.count > limits[0]?.maxActiveStreams!){
        console.log('Limit exceeded for maximum active streams!')
      }else{
        console.log('Limit NOT exceeded for maximum active streams!')
      }

      if (numStreams[0]?.count > limits[0]?.maxStreams! ){
        console.log('Limit exceeded for maximum number of streams created for your current subscription period')
      }else{
        console.log('Limit NOT exceeded for maximum number of streams created for your current subscription period')

      }


  }

  //console.log(session)

  
  return (
    <></>
  )
}