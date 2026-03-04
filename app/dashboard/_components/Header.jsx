"use client"
import React, { use, useEffect } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'

function Header() {

    const path = usePathname();
    useEffect(() => {
        console.log(path);
    }, [path])
  return (
    <div className='flex p-4 items-center justify-between bg-secondary text-secondary-foreground rounded-lg'>
      <Image src={'/logo.svg'} alt="logo" width={90} height={80}/>
      <ul className='hidden md:flex gap-4'>
        <li className={`hover:text-primary hover:font-bold transition-colors duration-200 cursor-pointer ${path === '/dashboard' && 'text-primary font-bold'}`}>
          Dashboard
        </li>
        <li className={`hover:text-primary hover:font-bold transition-colors duration-200 cursor-pointer ${path === '/dashboard/questions' && 'text-primary font-bold'}`}>
          Question
        </li>
        <li className={`hover:text-primary hover:font-bold transition-colors duration-200 cursor-pointer ${path === '/dashboard/upgrade' && 'text-primary font-bold'}`}>
          Upgrade
        </li>
        <li className={`hover:text-primary hover:font-bold transition-colors duration-200 cursor-pointer ${path === '/dashboard/how-it-works' && 'text-primary font-bold'}`}>
          How it Works?
        </li>
      </ul>
      <UserButton />
    </div>
  )
}

export default Header
