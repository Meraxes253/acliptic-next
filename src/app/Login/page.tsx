import React from "react";
import LoginForm from "@/components/Login/LoginForm";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

const LoginPage = async () => {
    const session = await auth()

    if (session?.user) {

        const user_id = session?.user?.id

        console.log(user_id)
        const result = await db.select().from(users).where(eq(users.id, user_id));
        
        // THIS MEANS THAT THIS USER EXISTS IN DB
        if (result.length > 0){
            console.log("USER EXISTS IN DB")


            // THIS MEANS THAT THIS USER HAS NOT ONBOARDED YET  
            if (!result[0].onBoardingCompleted) {
                console.log("USER HAS NOT ONBOARDED")

                redirect("/Signup/ProfileSetup")

            }else{
                // THIS MEANS THAT THIS USER HAS ONBOARDED   
                console.log("USER HAS ONBOARDED ALREADY")
                
                redirect("/Studio")


            }
        }
    }



    return (
        <div>    
            <LoginForm />
        </div>
    );
};

export default LoginPage;