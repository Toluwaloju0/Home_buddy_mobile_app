"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import Nav from "./Nav";

import { MdOutlineMarkEmailUnread } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa";
import { FaBars } from "react-icons/fa";
import MobileNav from "./MobileNav";

const Header = () => {


  return (
    <header className="py-4 px-6 xl:py-5 xl:px-20 border-b">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img src="/assets/logo.png" className="w-16 h-16 xl:w-18 xl:h-18" alt="Logo" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden xl:flex gap-8 items-center">
          {/* Main Navigation */}
          <Nav />
          
          
        </div>

        {/* Mobile Navigation */}
        <div className="xl:hidden flex items-center gap-4">
          {/* {isLoggedIn ? (
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <img src="assets/agent-1.png" className="rounded-full" />
              </div>
            </button>
          ) : (
            <Link href="/join">
              <Button size="sm" className="px-4">Join</Button>
            </Link>
          )}
          <FaBars className="text-2xl" /> */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

export default Header;