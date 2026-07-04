"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
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
  AlertCircle,
  Camera,
  ShoppingBag
} from "lucide-react";
import { supabase } from "@/components/supabase-client";
import Navbar from "@/components/navbar";

// Mock Initial Showcase Gigs
const INITIAL_ARTISAN_GIGS = [
  { id: 1, title: "Custom Next.js & React Landing Page", price: "35,000", category: "Code & Dev", icon: Code },
  { id: 2, title: "Modern Ankara Senator Style Suit", price: "25,000", category: "Fashion & Crafts", icon: Scissors }
];

// Mock Initial Campus Products
const INITIAL_ARTISAN_PRODUCTS = [
  { id: 1, title: "Bespoke Hand-Crocheted Vintage Tote Bag", price: "18,000", category: "Fashion & Crafts", instock: 3 }
];

// Mock Pitched Proposals
const INITIAL_PITCHES = [
  { id: 1, title: "Tailoring: Custom Traditional Blazer", client: "Emeka Okoye", bid: "30,000", status: "Awaiting Review", date: "June 25, 2026" },
  { id: 2, title: "Web Dev: Instagram Shop Integration", client: "Boutique Hub", bid: "45,000", status: "Accepted (Funding Locked)", date: "June 24, 2026" }
];

export default function ArtisanDashboard() {
  const [activeSubTab, setActiveSubTab] = useState<"showcase" | "products" | "pitches">("showcase");
  const [hasSubscription, setHasSubscription] = useState(false);
  const [artisanRank, setArtisanRank] = useState<"Bronze" | "Gold Pro">("Bronze");
  const [gigs, setGigs] = useState(INITIAL_ARTISAN_GIGS);
  const [products, setProducts] = useState(INITIAL_ARTISAN_PRODUCTS);
  const [pitches] = useState(INITIAL_PITCHES);
  
  // Supabase Profile state
  const [userProfile, setUserProfile] = useState<{
    fullName: string;
    school: string;
    email: string;
    avatarUrl: string;
  } | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setArtisanRank((user.user_metadata?.rank as any) || "Bronze");
        setHasSubscription(user.user_metadata?.hasSubscription || false);
        setUserProfile({
          fullName: user.user_metadata?.full_name || "Samuel Alabi",
          school: user.user_metadata?.school || "University of Lagos (UNILAG)",
          email: user.email || "",
          avatarUrl: user.user_metadata?.avatar_url || "",
        });
      }
    };
    fetchUser();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in to update your profile.");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        alert("Upload failed. Make sure you have created a public bucket named 'avatars' in your Supabase storage dashboard.\nError: " + uploadError.message);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) {
        alert("Failed to update user profile metadata: " + updateError.message);
        return;
      }

      setUserProfile(prev => prev ? { ...prev, avatarUrl: publicUrl } : null);
      alert("🎉 Profile avatar updated successfully! The new image is active and optimized.");
    } catch (err: any) {
      console.error(err);
      alert("An unexpected error occurred during upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Custom goal state
  const [goalName, setGoalName] = useState("School Tuition fees");
  const [goalTarget, setGoalTarget] = useState("150000");
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  
  // Add new Gig state
  const [newGigTitle, setNewGigTitle] = useState("");
  const [newGigPrice, setNewGigPrice] = useState("");
  const [newGigCategory, setNewGigCategory] = useState("Code & Dev");
  const [isAddingGig, setIsAddingGig] = useState(false);

  // Add new Product state
  const [newProductTitle, setNewProductTitle] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("Fashion & Crafts");
  const [isAddingProduct, setIsAddingProduct] = useState(false);

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

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductTitle || !newProductPrice) return;

    const newProduct = {
      id: products.length + 1,
      title: newProductTitle,
      price: newProductPrice,
      category: newProductCategory,
      instock: parseInt(newProductStock) || 1
    };

    setProducts([newProduct, ...products]);
    setNewProductTitle("");
    setNewProductPrice("");
    setNewProductStock("");
    setIsAddingProduct(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* Reusable navbar */}
      <Navbar />

      {/* MAIN LAYOUT GRID (Borderless Background Layout) */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Columns: Financial & Goals Panel (Spans 4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Profile details overview */}
          <div className="bg-neutral-900/30 p-6 space-y-4">
            <div className="flex items-center gap-4">
              <label className="cursor-pointer block relative h-14 w-14 rounded-full overflow-hidden border border-border/40 hover:border-primary transition-all duration-300">
                {isUploading ? (
                  <div className="h-full w-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                    <span className="inline-block h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : userProfile?.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
                    {userProfile?.fullName ? userProfile.fullName.split(" ").slice(0, 2).map(n => n[0]).join("") : "SA"}
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isUploading} />
              </label>
              <div>
                <h3 className="text-sm font-bold text-foreground">{userProfile?.fullName || "Samuel Alabi"}</h3>
                <p className="text-[10px] text-neutral-400 font-sans">{userProfile?.school || "University of Lagos (UNILAG)"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-primary/20 text-primary border border-primary/30 text-[8px] uppercase font-bold px-2 py-0.5 tracking-wider">
                    Artisan Workspace
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Income status block */}
          <div className="bg-neutral-900/30 p-6 space-y-4">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
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

            <div className="border-t border-border/20 pt-4 flex justify-between items-center">
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-wider">Total Completed</span>
                <p className="text-sm font-semibold">₦{totalCompletedEarnings.toLocaleString()}</p>
              </div>
              <button className="bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-4 py-2 hover:bg-foreground hover:text-background transition-colors flex items-center gap-1 cursor-pointer">
                <Wallet className="h-3.5 w-3.5" />
                Payout
              </button>
            </div>
          </div>

          {/* Goals Milestone Tracker */}
          <div className="bg-neutral-900/30 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                Artisan Goal Tracker
              </span>
              <button 
                onClick={() => setIsEditingGoal(!isEditingGoal)}
                className="text-[10px] text-primary uppercase font-bold hover:underline cursor-pointer"
              >
                {isEditingGoal ? "Close" : "Edit"}
              </button>
            </div>

            {isEditingGoal ? (
              <div className="space-y-3 p-3 bg-background border border-border/30">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-neutral-400 font-semibold">Goal Label</label>
                  <input 
                    type="text" 
                    value={goalName} 
                    onChange={(e) => setGoalName(e.target.value)}
                    className="w-full bg-background border border-border/30 text-xs p-2 outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-neutral-400 font-semibold">Target Budget (₦)</label>
                  <input 
                    type="text" 
                    value={goalTarget} 
                    onChange={(e) => setGoalTarget(e.target.value)}
                    className="w-full bg-background border border-border/30 text-xs p-2 outline-none focus:border-primary"
                  />
                </div>
                <button 
                  onClick={() => setIsEditingGoal(false)}
                  className="bg-primary text-primary-foreground w-full py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                >
                  Save Goal
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5 font-serif">
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
                  <div className="h-2 w-full bg-neutral-800 overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000 ease-out" 
                      style={{ width: `${progressPercent}%` }} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Leveling Booster */}
          <div className="bg-neutral-900/30 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                Artisan Rank & Booster
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

                  <div className="border-t border-border/20 pt-4 space-y-3">
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
                      className="w-full bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold py-2.5 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
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
                    className="w-full border border-border hover:border-red-500 hover:text-red-500 text-xs uppercase tracking-wider font-semibold py-2.5 transition-colors cursor-pointer"
                  >
                    Cancel Subscription
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Columns: Active Contracts & Listings (Spans 8 columns) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section A: Active Collaborations */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary shrink-0" />
              Active Contracts
            </h2>
            <div className="bg-neutral-900/30 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">React Web Redesign Layout</h3>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Client: Alpha Tech Solutions • Budget: ₦45,000</p>
                </div>
                <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[9px] uppercase font-bold px-2 py-0.5">
                  Review Pending
                </span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed font-light">
                Deliverable draft submitted. The client has 3 days to review escrow milestones or request revisions.
              </p>
            </div>
          </div>

          {/* Section B: Listings Tab Navigation */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-border/20 pb-2">
              <div className="flex gap-6 text-xs font-semibold uppercase tracking-wider">
                <button 
                  onClick={() => setActiveSubTab("showcase")}
                  className={`pb-2.5 transition-all cursor-pointer ${activeSubTab === "showcase" ? "border-b-2 border-primary text-foreground" : "text-neutral-400 hover:text-foreground"}`}
                >
                  My Gigs (Services)
                </button>
                <button 
                  onClick={() => setActiveSubTab("products")}
                  className={`pb-2.5 transition-all cursor-pointer ${activeSubTab === "products" ? "border-b-2 border-primary text-foreground" : "text-neutral-400 hover:text-foreground"}`}
                >
                  My Products (Direct Shop)
                </button>
                <button 
                  onClick={() => setActiveSubTab("pitches")}
                  className={`pb-2.5 transition-all cursor-pointer ${activeSubTab === "pitches" ? "border-b-2 border-primary text-foreground" : "text-neutral-400 hover:text-foreground"}`}
                >
                  My Pitches ({pitches.length})
                </button>
              </div>
              
              {activeSubTab === "showcase" && (
                <button 
                  onClick={() => setIsAddingGig(!isAddingGig)}
                  className="bg-primary text-primary-foreground text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 hover:bg-foreground hover:text-background transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Gig
                </button>
              )}

              {activeSubTab === "products" && (
                <button 
                  onClick={() => setIsAddingProduct(!isAddingProduct)}
                  className="bg-primary text-primary-foreground text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 hover:bg-foreground hover:text-background transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Product
                </button>
              )}
            </div>

            {/* Add Gig form */}
            {isAddingGig && (
              <form onSubmit={handleAddGig} className="bg-neutral-900/30 p-5 space-y-4 animate-fade-in border border-border/30">
                <h3 className="text-xs uppercase text-neutral-400 font-bold">List a Custom Service Gig</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-neutral-400 font-bold block">Service Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Next.js API Integration" 
                      required
                      value={newGigTitle}
                      onChange={(e) => setNewGigTitle(e.target.value)}
                      className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-neutral-400 font-bold block">Starting Price (₦)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 35000" 
                      required
                      value={newGigPrice}
                      onChange={(e) => setNewGigPrice(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-neutral-400 font-bold block">Category</label>
                    <select 
                      value={newGigCategory}
                      onChange={(e) => setNewGigCategory(e.target.value)}
                      className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary h-[38px]"
                    >
                      <option value="Code & Dev">Code & Dev</option>
                      <option value="Fashion & Crafts">Fashion & Crafts</option>
                      <option value="Visual Media">Visual Media</option>
                      <option value="Academics">Academics</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-6 py-2 hover:bg-foreground hover:text-background transition-colors cursor-pointer">
                  Save Service Gig
                </button>
              </form>
            )}

            {/* Add Product form */}
            {isAddingProduct && (
              <form onSubmit={handleAddProduct} className="bg-neutral-900/30 p-5 space-y-4 animate-fade-in border border-border/30">
                <h3 className="text-xs uppercase text-neutral-400 font-bold">List a Product for Direct Sales</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[9px] uppercase text-neutral-400 font-bold block">Product Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Crocheted Handbag" 
                      required
                      value={newProductTitle}
                      onChange={(e) => setNewProductTitle(e.target.value)}
                      className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-neutral-400 font-bold block">Price (₦)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 15000" 
                      required
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-neutral-400 font-bold block">Stock Count</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 3" 
                      required
                      value={newProductStock}
                      onChange={(e) => setNewProductStock(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <button type="submit" className="bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-6 py-2 hover:bg-foreground hover:text-background transition-colors cursor-pointer">
                  Save Product
                </button>
              </form>
            )}

            {/* Sub-tab 1: Gigs List (Borderless Design) */}
            {activeSubTab === "showcase" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gigs.map((gig) => {
                  const Icon = gig.icon;
                  return (
                    <div key={gig.id} className="bg-neutral-900/10 hover:bg-neutral-900/30 p-5 flex flex-col justify-between h-36 transition-all duration-300">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] uppercase tracking-wider text-neutral-500 font-sans">{gig.category}</span>
                          <span className="text-xs font-bold font-serif text-primary">₦{parseFloat(gig.price).toLocaleString()}</span>
                        </div>
                        <h4 className="font-serif text-sm font-semibold text-foreground mt-2 leading-snug">{gig.title}</h4>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-neutral-500 border-t border-border/20 pt-2.5 mt-4">
                        <span>Standard Delivery: 3 days</span>
                        <span className="text-primary hover:underline cursor-pointer">Edit Gig</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sub-tab 2: Products List (Borderless Design) */}
            {activeSubTab === "products" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((prod) => (
                  <div key={prod.id} className="bg-neutral-900/10 hover:bg-neutral-900/30 p-5 flex flex-col justify-between h-36 transition-all duration-300">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[8px] uppercase tracking-wider text-neutral-500 font-sans">{prod.category}</span>
                        <span className="text-xs font-bold font-serif text-primary">₦{parseFloat(prod.price).toLocaleString()}</span>
                      </div>
                      <h4 className="font-serif text-sm font-semibold text-foreground mt-2 leading-snug">{prod.title}</h4>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-neutral-500 border-t border-border/20 pt-2.5 mt-4">
                      <span>Inventory Stock: <strong>{prod.instock}</strong></span>
                      <span className="text-primary hover:underline cursor-pointer">Edit Product</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Sub-tab 3: Pitches List */}
            {activeSubTab === "pitches" && (
              <div className="space-y-4">
                {pitches.map((pitch) => (
                  <div key={pitch.id} className="bg-neutral-900/10 hover:bg-neutral-900/30 p-5 flex justify-between items-center transition-all duration-300">
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-foreground">{pitch.title}</h4>
                      <p className="text-[10px] text-neutral-400 mt-1 font-sans">Client: {pitch.client} • Bid Price: ₦{parseFloat(pitch.bid).toLocaleString()} • Pitched: {pitch.date}</p>
                    </div>
                    <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] uppercase font-bold px-2 py-0.5 shrink-0">
                      {pitch.status}
                    </span>
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
