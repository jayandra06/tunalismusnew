import HomePage from '@/components/sections/home'
import Navbar from '@/components/system/navbar'
import HomepageAdsRenderer from '@/components/system/homepage-ads-renderer'
import { useGTMPageView } from '@/hooks/useGTM'
import React from 'react'

export default function Home() {
  // Track page view
  useGTMPageView('Tunalismus – Learn Languages the Human Way');

  return (
    <>
    <Navbar />
    <HomePage />
    <HomepageAdsRenderer />
    </>
  )
}
