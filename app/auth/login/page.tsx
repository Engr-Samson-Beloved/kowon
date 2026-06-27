"use client";

import React, { useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck 
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    // Mock authentication delay
    setTimeout(() => {
      setIsLoading(false);
      setLoginSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* Top Bar for Back Navigation & Theme Toggle */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/80 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-screen">
        
        {/* Left Visual Panel: Curation & Brand Messaging (Spans 5 columns) */}
        <div className="hidden lg:flex lg:col-span-5 bg-secondary text-secondary-foreground p-12 flex-col justify-between relative overflow-hidden">
          {/* Subtle Decorative Lines */}
          <div className="absolute top-0 right-0 h-96 w-96 border-b border-l border-primary/20 rounded-bl-full z-0" />
          <div className="absolute bottom-0 left-0 h-64 w-64 border-t border-r border-primary/10 rounded-tr-full z-0" />

          {/* Top: Logotype */}
          <div className="z-10">
            <span className="font-serif text-3xl font-bold tracking-widest text-secondary-foreground block">
              KÓ WON
            </span>
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
              Affordable Skills • Endless Wealth
            </span>
          </div>

          {/* Middle: Editorial Quote */}
          <div className="space-y-6 z-10 my-auto">
            <Sparkles className="h-8 w-8 text-primary" />
            <h2 className="font-serif text-4xl font-light leading-tight">
              Where Nigerian <br />
              <span className="italic text-primary font-normal">Student Craftsmen</span> <br />
              Meet Real Clients.
            </h2>
            <p className="text-secondary-foreground/70 text-sm max-w-sm leading-relaxed font-light">
              Log in to access your dashboard, track current active bids, manage secure escrows, and communicate with clients.
            </p>
          </div>

          {/* Bottom: Footer Info */}
          <div className="z-10 border-t border-secondary-foreground/20 pt-6 flex items-center justify-between text-[11px] text-secondary-foreground/60">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Verified Institutional Portals
            </span>
            <span>© KÓ WON</span>
          </div>
        </div>

        {/* Right Form Panel: Authentication Portal (Spans 7 columns) */}
        <div className="lg:col-span-7 flex flex-col justify-center px-6 py-20 md:px-16 lg:px-24 bg-card text-card-foreground">
          <div className="max-w-md w-full mx-auto space-y-8">
            
            {/* Header */}
            <div className="space-y-2">
              <span className="font-serif text-3xl lg:hidden font-bold tracking-widest text-foreground block mb-4">
                KÓ WON
              </span>
              <h1 className="font-serif text-3xl font-light text-foreground">Welcome Back</h1>
              <p className="text-sm text-neutral-500 font-light">
                New to the platform?{" "}
                <Link href="/auth/signup" className="text-primary hover:text-foreground font-semibold underline transition-colors">
                  Create an account
                </Link>
              </p>
            </div>

            {/* Form */}
            {loginSuccess ? (
              <div className="border border-primary bg-primary/5 p-8 text-center space-y-4 animate-fade-in">
                <Sparkles className="h-10 w-10 text-primary mx-auto" />
                <h3 className="font-serif text-xl font-bold">Authentication Successful</h3>
                <p className="text-xs text-neutral-500">Redirecting you to your KÓ WON workspace panel...</p>
                <div className="h-1 w-full bg-neutral-200 overflow-hidden mt-6">
                  <div className="h-full bg-primary animate-pulse" style={{ width: "100%" }} />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                    Email Address
                  </label>
                  <div className="flex items-center bg-background border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
                    <Mail className="h-4 w-4 text-neutral-400 mx-3 shrink-0" />
                    <input 
                      id="email"
                      type="email" 
                      placeholder="name@school.edu.ng or work email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder-neutral-400 py-3.5 pr-4"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                      Password
                    </label>
                    <a href="#" className="text-xs text-neutral-400 hover:text-primary transition-colors">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="flex items-center bg-background border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
                    <Lock className="h-4 w-4 text-neutral-400 mx-3 shrink-0" />
                    <input 
                      id="password"
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder-neutral-400 py-3.5"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-neutral-400 hover:text-primary px-3 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <input 
                    id="remember" 
                    type="checkbox" 
                    className="h-4 w-4 rounded-none border-neutral-300 text-primary focus:ring-primary accent-primary" 
                  />
                  <label htmlFor="remember" className="ml-2 text-xs text-neutral-500 select-none">
                    Keep me logged in on this device
                  </label>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground font-semibold uppercase text-xs tracking-wider py-4 hover:bg-foreground hover:text-background transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-block h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Enter Workspace
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

              </form>
            )}

            {/* Social Logins */}
            <div className="space-y-4 border-t border-border pt-6">
              <span className="text-center block text-[10px] uppercase tracking-wider text-neutral-400">
                Institutional SSO Access
              </span>
              <div className="grid grid-cols-2 gap-4">
                <button className="border border-border bg-background hover:bg-neutral-50 dark:hover:bg-neutral-900 py-2.5 text-xs font-semibold uppercase tracking-wider text-center text-foreground transition-all duration-300">
                  Google Workspace
                </button>
                <button className="border border-border bg-background hover:bg-neutral-50 dark:hover:bg-neutral-900 py-2.5 text-xs font-semibold uppercase tracking-wider text-center text-foreground transition-all duration-300">
                  Edu ID Portal
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
