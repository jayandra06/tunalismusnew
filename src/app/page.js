import HomePage from '@/components/sections/home'
import Navbar from '@/components/system/navbar'
import HomepageAdsRenderer from '@/components/system/homepage-ads-renderer'
import React from 'react'

export default function Home() {
  return (
    <>
    <Navbar />
    <HomePage />
    <HomepageAdsRenderer />
    </>
  )
}
