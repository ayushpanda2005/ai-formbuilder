"use client"
import { SignedIn } from '@clerk/clerk-react'
import React from 'react'
import SideNav from './_components/SideNav'
import { Toaster } from '@/components/ui/toaster'

function Dashboardlayout({children}) {
  return (
    <div>
        <div className='md:w-64 fixed'>
            <SideNav/>
        </div>
        <div className='md:ml-64'>
        <SignedIn>
          <Toaster/>
        {children}
        </SignedIn>
        </div>
    </div>
  )
}

export default Dashboardlayout