'use client'
import { useEffect, useState } from 'react'
import MobileDashboard from '@/components/Dashboard/MobileDashboard'
import DashboardPageTest from '@/components/Dashboard/DashboardPageTest'

export default function DashboardPage() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 920)
        }

        // Initial check
        checkMobile()

        // Add event listener
        window.addEventListener('resize', checkMobile)

        // Cleanup
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return isMobile ? <MobileDashboard /> : <DashboardPageTest />
}


