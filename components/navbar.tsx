"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/components/supabase-client";
import ThemeToggle from "@/components/theme-toggle";
import Logo from "@/components/logo";
import { MessageSquare, LayoutDashboard, Store, ShoppingBag, LogOut } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/30 w-full transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Brand Identity */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo size={28} className="group-hover:rotate-6 transition-transform duration-300" />
            <span className="font-serif text-xl font-bold tracking-widest text-foreground">KÓ WON</span>
          </Link>

          {/* Core Directory Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              href="/marketplace?tab=showcase" 
              className={`text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors duration-300 ${
                pathname === "/marketplace" && !pathname.includes("tab=exchange")
                  ? "text-primary" 
                  : "text-neutral-400 hover:text-foreground"
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              Marketplace Gigs
            </Link>
            <Link 
              href="/marketplace?tab=products" 
              className={`text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors duration-300 ${
                pathname === "/marketplace" && pathname.includes("tab=products")
                  ? "text-primary" 
                  : "text-neutral-400 hover:text-foreground"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Campus Shop
            </Link>
            <Link 
              href="/marketplace?tab=exchange" 
              className={`text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors duration-300 ${
                pathname === "/marketplace" && pathname.includes("tab=exchange")
                  ? "text-primary" 
                  : "text-neutral-400 hover:text-foreground"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              The Exchange
            </Link>
          </nav>
        </div>

        {/* Right Action Panel */}
        <div className="flex items-center gap-6">
          <ThemeToggle />

          {loading ? (
            <span className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">Loading...</span>
          ) : user ? (
            <div className="flex items-center gap-4">
              {/* Inbox Shortcut */}
              <Link 
                href="/dashboard/inbox" 
                className="text-neutral-400 hover:text-primary transition-colors duration-300 shrink-0 relative"
                title="Inbox"
              >
                <MessageSquare className="h-5 w-5" />
              </Link>

              {/* Workspace Dashboard direct Link */}
              <Link 
                href="/auth/callback" 
                className="hidden sm:inline-block text-xs uppercase font-bold tracking-wider text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground px-4 py-2 transition-all duration-300"
              >
                Workspace
              </Link>

              {/* User Dropdown Trigger */}
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 hover:border-primary flex items-center justify-center text-primary font-bold text-xs uppercase cursor-pointer transition-all duration-300"
                >
                  {user.user_metadata?.full_name?.substring(0, 2) || user.email?.substring(0, 2) || "U"}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-border/80 shadow-2xl py-1 text-xs animate-fade-in">
                    <div className="px-4 py-2 border-b border-border/30">
                      <p className="font-semibold text-foreground truncate">{user.user_metadata?.full_name || "User"}</p>
                      <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
                    </div>
                    <Link 
                      href="/auth/callback" 
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-neutral-400 hover:bg-neutral-800 hover:text-foreground transition-all"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
                      Workspace
                    </Link>
                    <button 
                      onClick={() => {
                        setDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-neutral-800 hover:text-red-300 transition-all text-left cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                href="/auth/login" 
                className="text-xs uppercase font-semibold tracking-wider hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/signup" 
                className="bg-primary text-primary-foreground font-semibold uppercase text-[10px] tracking-wider px-5 py-2.5 hover:bg-foreground hover:text-background transition-all duration-300"
              >
                Join as Talent
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
