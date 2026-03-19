"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

function Header() {
  const path = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Questions", href: "/dashboard/questions" },
    { label: "Upgrade", href: "/dashboard/upgrade" },
    { label: "How It Works", href: "/dashboard/how-it-works" },
  ];

  return (
    <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200/60 bg-white/80 p-4 px-8 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex min-w-[200px] items-center gap-3">
          <Image
            src={"/logo.svg"}
            alt="logo"
            width={40}
            height={40}
            className="w-auto h-10"
          />
          <span className="hidden text-xl font-bold tracking-tight text-slate-800 md:block">
            Speak<span className="text-teal-600">SmartAI</span>
          </span>
        </Link>
      </div>

      <nav className="hidden flex-1 items-center justify-center md:flex">
        <ul className="flex items-center gap-2 rounded-xl border border-white/50 bg-white/45 p-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${path === item.href ? "bg-teal-600 text-white shadow-md shadow-teal-300/30" : "text-slate-600 hover:bg-white/80 hover:text-slate-900"}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-4">
        <Link href="/">
          <UserButton />
        </Link>
      </div>
    </div>
  );
}

export default Header;
