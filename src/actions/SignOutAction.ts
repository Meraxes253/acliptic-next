'use server'

import { signOut } from '@/auth';

export async function SignOutAction() {
    // Sign out the user
    // Don't use redirect() here - let the client handle navigation
    // NextAuth v5 handles the redirect internally
    await signOut({ redirectTo: '/' });
}
