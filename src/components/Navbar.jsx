"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, LogOut, User, Search as SearchIcon, Bell } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import NotificationDropdown from '@/components/ui/NotificationDropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Track scroll position to add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Backdrop blur overlay */}
      <div 
        className={`w-full h-20 fixed top-0 z-40 transition-all duration-300 ${
          scrolled 
            ? 'backdrop-blur-md bg-white/20' 
            : 'backdrop-blur-sm bg-white/10'
        }`}
      />
      
      <div className="w-full flex justify-center pt-4 px-4 fixed top-0 z-50">
        <div 
          className={`w-full max-w-7xl border-2 border-gray-200 flex items-center py-4 px-6 transition-all duration-300 ${
            scrolled 
              ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] bg-white/90 backdrop-blur-lg' 
              : 'bg-white/95 backdrop-blur-md'
          }`}
        >
          {/* Mobile Menu Button (Left) */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border-2 border-gray-200 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)]"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Logo - Left */}
          <div className="flex-shrink-0 flex items-center mx-4 md:mx-0">
            <Link href="/" className="flex items-center">
              <span className="font-mono font-black text-xl tracking-tight uppercase">STACK<span className="text-[#00d447]">IT</span></span>
            </Link>
          </div>

          {/* Centered Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 justify-center px-4">
            <div className="w-full max-w-xl">
              <SearchBar />
            </div>
          </div>

          {/* Mobile Right Icons (Search + Notifications + Profile) */}
          <div className="ml-auto flex items-center space-x-3 md:hidden">
            {/* Mobile Search Button */}
            <button 
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="p-2 border-2 border-gray-200 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)]"
            >
              <SearchIcon size={20} />
            </button>
            
            {/* Mobile Notifications */}
            {session && (
              <div className="p-2 border-2 border-gray-200 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)]">
                <NotificationDropdown />
              </div>
            )}
            
            {/* User Profile or Login */}
            {!session ? (
              <Link href="/auth/signin">
                <button className="p-2 border-2 border-[#00d447] bg-[#00d447] text-white hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)] transition-all">
                  <User size={20} />
                </button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="w-10 h-10 border-2 border-gray-200 bg-gray-100 flex items-center justify-center text-gray-800 cursor-pointer hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all">
                    {session.user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-2 border-gray-200 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] bg-white space-y-3 rounded-none">
                  {/* Profile content */}
                  <div className="pb-3 border-b-2 border-gray-200">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium">{session.user.name || 'User'}</p>
                        <p className="text-sm text-gray-600 truncate max-w-[180px]">
                          {session.user.email || 'user@example.com'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu buttons with Neo-Brutalist style */}
                  <Link href="/dashboard">
                    <button className="w-full px-4 py-2 border-2 border-gray-200 bg-white text-gray-700 font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all flex items-center">
                      <User className="mr-2 h-4 w-4" /> Dashboard
                    </button>
                  </Link>
                  
                  
                  <button 
                    className="w-full px-4 py-2 border-2 border-red-200 bg-white text-red-600 font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all flex items-center"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </button>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Desktop Right Buttons */}
          <div className="hidden md:flex items-center ml-auto">
            {!session ? (
              <div className="flex space-x-3">
                <Link href="/auth/signin">
                  <button className="px-4 py-2 border-2 border-gray-300 bg-white text-gray-700 font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all">
                    Login
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="px-4 py-2 border-2 border-[#00d447] bg-[#00d447] text-white font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all">
                    Start Now
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Desktop Notifications */}
                <div className="p-2 border-2 border-gray-200 hover:translate-y-[-1px] hover:translate-x-[-1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)]">
                  <NotificationDropdown />
                </div>
                
                <Link href="/ask-question">
                  <button className="px-4 py-2 border-2 border-[#00d447] bg-[#00d447] text-white font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all">
                    Ask Question
                  </button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="w-10 h-10 border-2 border-gray-200 bg-gray-100 flex items-center justify-center text-gray-800 cursor-pointer hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all">
                      {session.user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 border-2 border-gray-200 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] bg-white space-y-3 rounded-none">
                    {/* Same dropdown content as mobile */}
                    <div className="pb-3 border-b-2 border-gray-200">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium">{session.user.name || 'User'}</p>
                          <p className="text-sm text-gray-600 truncate max-w-[180px]">
                            {session.user.email || 'user@example.com'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Link href="/dashboard">
                      <button className="w-full px-4 py-2 border-2 border-gray-200 bg-white text-gray-700 font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all flex items-center">
                        <User className="mr-2 h-4 w-4" /> Dashboard
                      </button>
                    </Link>
                    
                    
                    <button 
                      className="w-full px-4 py-2 border-2 border-red-200 bg-white text-red-600 font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all flex items-center"
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </button>
            
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile Search Bar (collapsible) */}
        {mobileSearchOpen && (
          <div className="md:hidden fixed top-[72px] left-4 right-4 p-3 bg-white/95 backdrop-blur-md border-2 border-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] z-40">
            <SearchBar />
          </div>
        )}
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed top-[72px] left-4 right-4 bg-white/95 backdrop-blur-md border-2 border-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] z-50">
            <div className="flex flex-col p-4 space-y-3">
              {!session ? (
                <>
                  <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-2 border-2 border-gray-300 bg-white text-gray-700 font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all">
                      Login
                    </button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-2 border-2 border-[#00d447] bg-[#00d447] text-white font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all">
                      Start Now
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/ask-question" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-2 border-2 border-[#00d447] bg-[#00d447] text-white font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all">
                      Ask Question
                    </button>
                  </Link>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-2 border-2 border-gray-200 bg-white text-gray-700 font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all flex items-center">
                      <User className="mr-2 h-4 w-4" /> Dashboard
                    </button>
                  </Link>
                  <button 
                    className="w-full px-4 py-2 border-2 border-red-200 bg-white text-red-600 font-medium hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] transition-all flex items-center"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}