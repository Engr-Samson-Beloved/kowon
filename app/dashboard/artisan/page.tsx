"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  TrendingUp, 
  FolderGit2, 
  Layers, 
  Wallet, 
  GraduationCap, 
  Search, 
  MapPin, 
  Star, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Plus, 
  HelpCircle,
  Percent,
  Sparkles,
  Scissors,
  Code,
  AlertCircle
} from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import Logo from "@/components/logo";

// Mock Initial Showcase Gigs
const INITIAL_ARTISAN_GIGS = [
  { id: 1, title: "Custom Next.js & React Landing Page", price: "35,000", category: "Code & Dev", icon: Code },
  { id: 2, title: "Modern Ankara Senator Style Suit", price: "25,000", category: "Fashion & Crafts", icon: Scissors }
];

// Mock Pitched Proposals
const INITIAL_PITCHES = [
  { id: 1, title: "Tailoring: Custom Traditional Blazer", client: "Emeka Okoye", bid: "30,000", status: "Awaiting Review", date: "June 25, 2026" },
  { id: 2, title: "Web Dev: Instagram Shop Integration", client: "Boutique Hub", bid: "45,000", status: "Accepted (Funding Locked)", date: "June 24, 2026" }
];

export default function ArtisanDashboard() {
  const [activeSubTab, setActiveSubTab] = useState<"showcase" | "pitches">("showcase");
  const [hasSubscription, setHasSubscription] = useState(false);
  const [artisanRank, setArtisanRank] = useState<"Bronze" | "Gold Pro">("Bronze");
  const [gigs, setGigs] = useState(INITIAL_ARTISAN_GIGS);
  const [pitches] = useState(INITIAL_PITCHES);
  
  // Custom goal state
  const [goalName, setGoalName] = useState("School Tuition fees");
  const [goalTarget, setGoalTarget] = useState("150000");
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  
  // Add new Gig state
  const [newGigTitle, setNewGigTitle] = useState("");
  const [newGigPrice, setNewGigPrice] = useState("");
  const [newGigCategory, setNewGigCategory] = useState("Code & Dev");
  const [isAddingGig, setIsAddingGig] = useState(false);

  // Financial values
  const availableEarnings = 28000;
  const lockedEscrow = 45000;
  const totalCompletedEarnings = 120000;
  const progressPercent = Math.min(Math.round(((availableEarnings + lockedEscrow + totalCompletedEarnings) / parseFloat(goalTarget || "1")) * 100), 100);

  const handleAddGig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGigTitle || !newGigPrice) return;
    
    const newGig = {
      id: gigs.length + 1,
      title: newGigTitle,
      price: newGigPrice,
      category: newGigCategory,
      icon: newGigCategory === "Code & Dev" ? Code : Scissors
    };
    
    setGigs([newGig, ...gigs]);
    setNewGigTitle("");
    setNewGigPrice("");
    setIsAddingGig(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* 1. DASHBOARD HEADER */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 lg:px-24">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-primary transition-colors text-neutral-400">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <Logo size={28} />
              <span className="font-serif text-2xl font-bold tracking-widest">KÓ WON</span>
              <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] uppercase font-bold px-2 py-0.5 mt-0.5 tracking-wider">
                Artisan Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-xs text-neutral-500 font-medium">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>Samuel Alabi • University of Lagos (UNILAG)</span>
            </div>
            <ThemeToggle />
            <Link 
              href="/dashboard/inbox" 
              className="border border-border hover:border-foreground text-xs font-semibold uppercase tracking-wider px-4 py-2 transition-colors"
            >
              Inbox
            </Link>
            <Link 
              href="/dashboard/client" 
              className="border border-border hover:border-foreground text-xs font-semibold uppercase tracking-wider px-4 py-2 transition-colors"
            >
              Switch to Client
            </Link>
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT GRID */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 lg:px-24 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Columns: Financial & Goals Panel (Spans 4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Income status block */}
          <div className="border border-border bg-card p-6 space-y-4">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
              Financial Status
            </span>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Available</span>
                <p className="text-xl font-bold text-foreground font-serif">₦{availableEarnings.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Locked in Escrow</span>
                <p className="text-xl font-bold text-primary font-serif">₦{lockedEscrow.toLocaleString()}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex justify-between items-center">
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-wider">Total Completed</span>
                <p className="text-sm font-semibold">₦{totalCompletedEarnings.toLocaleString()}</p>
              </div>
              <button className="bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-4 py-2 hover:bg-foreground hover:text-background transition-colors flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5" />
                Payout
              </button>
            </div>
          </div>

          {/* Goals Milestone Tracker */}
          <div className="border border-border bg-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                Artisan Goal Tracker
              </span>
              <button 
                onClick={() => setIsEditingGoal(!isEditingGoal)}
                className="text-[10px] text-primary uppercase font-bold hover:underline"
              >
                {isEditingGoal ? "Close" : "Edit"}
              </button>
            </div>

            {isEditingGoal ? (
              <div className="space-y-3 p-3 bg-neutral-50 dark:bg-neutral-900 border border-border">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-neutral-400 font-semibold">Goal Label</label>
                  <input 
                    type="text" 
                    value={goalName} 
                    onChange={(e) => setGoalName(e.target.value)}
                    className="w-full bg-background border border-border text-xs p-2 outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-neutral-400 font-semibold">Target Budget (₦)</label>
                  <input 
                    type="text" 
                    value={goalTarget} 
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full bg-background border border-border text-xs p-2 outline-none focus:border-primary"
                  />
                </div>
                <button 
                  onClick={() => setIsEditingGoal(false)}
                  className="bg-primary text-primary-foreground w-full py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
                >
                  Save Goal
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Targeting: {goalName}
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Goal Target: ₦{parseFloat(goalTarget).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs text-neutral-400">
                    <span>Progress Tracker</span>
                    <span className="font-semibold text-primary">{progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000 ease-out" 
                      style={{ width: `${progressPercent}%` }} 
                    />
                  </div>
                </div>
                <p className="text-[10px] text-neutral-500 leading-relaxed font-light">
                  Cumulative earnings (Available + Escrow + Paid) are mapped to measure your craft financing milestone.
                </p>
              </div>
            )}
          </div>

          {/* Leveling & Subscription Booster */}
          <div className="border border-border bg-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold">
                Artisan Rank & Subscription
              </span>
              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 border ${
                artisanRank === "Gold Pro" 
                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse" 
                  : "bg-orange-500/10 text-orange-600 border-orange-500/20"
              }`}>
                {artisanRank} Badge
              </span>
            </div>

            <div className="space-y-4">
              {artisanRank === "Bronze" ? (
                <>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-neutral-400">Path to Silver Badge:</h4>
                    <div className="text-[11px] space-y-1 text-neutral-500">
                      <div className="flex justify-between">
                        <span>Completed Jobs</span>
                        <span className="font-semibold text-foreground">2 / 5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating Average</span>
                        <span className="font-semibold text-foreground">4.8 / 4.5</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="bg-primary/5 border border-primary/20 p-4 space-y-2">
                      <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 shrink-0" />
                        KÓ WON Elite Upgrade
                      </h4>
                      <p className="text-[10px] text-neutral-500 leading-normal font-light">
                        Unlock instant **Gold Pro** badge, priority visibility, and commission drop (2% escrow fees instead of 5%) for only ₦1,500/month.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setHasSubscription(true);
                        setArtisanRank("Gold Pro");
                      }}
                      className="w-full bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold py-2.5 hover:bg-foreground hover:text-background transition-colors"
                    >
                      Subscribe & Boost Rank
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="bg-amber-500/5 border border-amber-500/20 p-4 space-y-2">
                    <h4 className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      KÓ WON Elite Active
                    </h4>
                    <p className="text-[10px] text-neutral-500 leading-normal font-light">
                      Your portfolio matches Level 3 visibility checks. Client search placement is boosted by 2.5x with lowered escrow processing fees.
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setHasSubscription(false);
                      setArtisanRank("Bronze");
                    }}
                    className="w-full border border-border hover:border-red-500 hover:text-red-500 text-xs uppercase tracking-wider font-semibold py-2.5 transition-colors"
                  >
                    Cancel Subscription
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="border border-border bg-card p-6 space-y-3">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
              Workspace Guidelines
            </span>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
              <li className="flex gap-2">
                <span className="text-primary font-bold shrink-0">•</span>
                Use the Bidding Board to pitch on active Client Tenders.
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold shrink-0">•</span>
                Upload visual lookup screenshots or code files directly to active contracts to trigger escrow checks.
              </li>
            </ul>
          </div>

        </div>

        {/* Right Columns: Active Contracts & Listings (Spans 8 columns) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section A: Active Contracts */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-primary" />
              Active Contracts
            </h2>

            <div className="space-y-4">
              
              {/* Contract 1 */}
              <div className="border border-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                      Code & Dev
                    </span>
                    <span className="text-[10px] text-neutral-400">Milestone 2 of 3</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold">Tailwind Web Redesign</h3>
                  <p className="text-xs text-neutral-500 font-light leading-relaxed">
                    Client: <strong>Alpha Tech Solutions</strong> • Target delivery: 3 days left
                  </p>
                  
                  {/* Milestones steps */}
                  <div className="flex items-center gap-4 text-[10px] pt-2">
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-500 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      Figma Draft (Paid)
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span className="flex items-center gap-1 text-primary font-semibold">
                      <Clock className="h-3.5 w-3.5 shrink-0 animate-pulse" />
                      Layout Dev (In Escrow)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t md:border-t-0 border-border pt-4 md:pt-0 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">Contract Value</span>
                    <span className="text-base font-bold font-serif text-foreground">₦45,000</span>
                  </div>
                  <button className="bg-foreground text-background dark:bg-white dark:text-black hover:bg-primary hover:text-primary-foreground text-xs font-semibold uppercase tracking-wider px-4 py-2.5 transition-colors">
                    Upload Draft
                  </button>
                </div>
              </div>

              {/* Contract 2 */}
              <div className="border border-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                      Fashion & Crafts
                    </span>
                    <span className="text-[10px] text-neutral-400">Milestone 1 of 1</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold">Bespoke Ankara Senator Attire</h3>
                  <p className="text-xs text-neutral-500 font-light leading-relaxed">
                    Client: <strong>Chinwe Egwu (Patron Shop)</strong> • Status: Under Client Review
                  </p>
                  
                  {/* Milestones steps */}
                  <div className="flex items-center gap-4 text-[10px] pt-2">
                    <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500 font-semibold animate-pulse">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      Final Sewing Check
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t md:border-t-0 border-border pt-4 md:pt-0 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">Contract Value</span>
                    <span className="text-base font-bold font-serif text-foreground">₦25,000</span>
                  </div>
                  <button className="border border-border text-neutral-400 text-xs font-semibold uppercase tracking-wider px-4 py-2.5 cursor-not-allowed" disabled>
                    Pending Review
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Section B: Sub-tabs (My Showcase vs Bids) */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div className="flex gap-6 text-sm font-semibold uppercase tracking-wider">
                <button
                  onClick={() => setActiveSubTab("showcase")}
                  className={`pb-2 transition-all ${
                    activeSubTab === "showcase"
                      ? "border-b-2 border-primary text-foreground font-bold"
                      : "text-neutral-400 hover:text-foreground"
                  }`}
                >
                  My Showcase Crafts ({gigs.length})
                </button>
                <button
                  onClick={() => setActiveSubTab("pitches")}
                  className={`pb-2 transition-all ${
                    activeSubTab === "pitches"
                      ? "border-b-2 border-primary text-foreground font-bold"
                      : "text-neutral-400 hover:text-foreground"
                  }`}
                >
                  My Bids & Pitches ({pitches.length})
                </button>
              </div>

              {activeSubTab === "showcase" && (
                <button 
                  onClick={() => setIsAddingGig(!isAddingGig)}
                  className="text-xs font-bold uppercase tracking-wider text-primary hover:text-foreground flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Craft
                </button>
              )}
            </div>

            {/* Showcase Section */}
            {activeSubTab === "showcase" && (
              <div className="space-y-4">
                
                {/* Form to Add New Gig */}
                {isAddingGig && (
                  <form onSubmit={handleAddGig} className="border border-primary bg-primary/5 p-6 space-y-4 animate-fade-in">
                    <h3 className="font-serif text-lg font-bold">List a New Showcase Craft</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-neutral-500 font-semibold block">Craft Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Portrait Photography shoot" 
                          required
                          value={newGigTitle}
                          onChange={(e) => setNewGigTitle(e.target.value)}
                          className="w-full bg-background border border-border text-xs p-3 outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-neutral-500 font-semibold block">Starting Budget (₦)</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 15000" 
                          required
                          value={newGigPrice}
                          onChange={(e) => setNewGigPrice(e.target.value.replace(/[^0-9]/g, ""))}
                          className="w-full bg-background border border-border text-xs p-3 outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-neutral-500 font-semibold block">Category</label>
                      <select 
                        value={newGigCategory} 
                        onChange={(e) => setNewGigCategory(e.target.value)}
                        className="bg-background border border-border text-xs p-3 outline-none focus:border-primary"
                      >
                        <option value="Code & Dev">Code & Dev</option>
                        <option value="Fashion & Crafts">Fashion & Crafts</option>
                        <option value="Beauty & Style">Beauty & Style</option>
                      </select>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        type="submit" 
                        className="bg-primary text-primary-foreground font-semibold uppercase text-xs tracking-wider px-6 py-2.5 hover:bg-foreground hover:text-background transition-all duration-300"
                      >
                        Publish Craft
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIsAddingGig(false)}
                        className="border border-border text-neutral-500 font-semibold uppercase text-xs tracking-wider px-6 py-2.5 hover:border-foreground hover:text-foreground transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Gigs List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gigs.map((gig) => {
                    const CategoryIcon = gig.icon;
                    return (
                      <div key={gig.id} className="border border-border bg-card p-5 hover:border-primary transition-all duration-300 flex justify-between items-center">
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{gig.category}</span>
                          <h4 className="font-serif text-sm font-semibold text-foreground leading-tight line-clamp-1">{gig.title}</h4>
                          <p className="text-xs text-neutral-400 font-light">Starting price: ₦{parseFloat(gig.price).toLocaleString()}</p>
                        </div>
                        <div className="bg-neutral-100 dark:bg-neutral-900 border border-border p-3">
                          <CategoryIcon className="h-5 w-5 text-neutral-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pitches List */}
            {activeSubTab === "pitches" && (
              <div className="space-y-4">
                {pitches.map((pitch) => (
                  <div key={pitch.id} className="border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-serif text-sm font-bold text-foreground">{pitch.title}</h4>
                      <p className="text-xs text-neutral-400 font-light">
                        Pitch rate: <strong>₦{parseFloat(pitch.bid).toLocaleString()}</strong> • Client: {pitch.client}
                      </p>
                      <span className="text-[10px] text-neutral-400 block pt-1">Submitted on {pitch.date}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                        pitch.status.includes("Accepted") 
                          ? "bg-green-500/10 text-green-600 border-green-500/20" 
                          : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                      }`}>
                        {pitch.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </main>

    </div>
  );
}
