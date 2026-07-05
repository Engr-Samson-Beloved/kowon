"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  ShoppingBag,
  Loader2
} from "lucide-react";
import { supabase } from "@/components/supabase-client";
import Navbar from "@/components/navbar";
import type { Profile, Gig, Product, Proposal, Order } from "@/lib/types";

// Helper: pick icon for a category string
function categoryIcon(cat: string) {
  if (cat.toLowerCase().includes("code") || cat.toLowerCase().includes("dev")) return Code;
  return Scissors;
}

// Financials shape returned by RPC
interface ArtisanFinancials {
  available_earnings: number;
  locked_escrow: number;
  total_completed_earnings: number;
}

export default function ArtisanDashboard() {
  const [activeSubTab, setActiveSubTab] = useState<"showcase" | "products" | "pitches">("showcase");

  // Auth + profile
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Data lists
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pitches, setPitches] = useState<(Proposal & { project?: { title: string; budget: number; client?: { full_name: string } } })[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Financials
  const [financials, setFinancials] = useState<ArtisanFinancials>({
    available_earnings: 0,
    locked_escrow: 0,
    total_completed_earnings: 0,
  });

  // Avatar upload
  const [isUploading, setIsUploading] = useState(false);

  // Goal tracker
  const [goalName, setGoalName] = useState("School Tuition fees");
  const [goalTarget, setGoalTarget] = useState("150000");
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  // Add gig form
  const [newGigTitle, setNewGigTitle] = useState("");
  const [newGigPrice, setNewGigPrice] = useState("");
  const [newGigCategory, setNewGigCategory] = useState("Code & Dev");
  const [isAddingGig, setIsAddingGig] = useState(false);
  const [isSavingGig, setIsSavingGig] = useState(false);

  // Add product form
  const [newProductTitle, setNewProductTitle] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("Fashion & Crafts");
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // ─── Fetch helpers ─────────────────────────────────
  const fetchGigs = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("gigs")
      .select("*")
      .eq("artisan_id", uid)
      .order("created_at", { ascending: false });
    if (data) setGigs(data as Gig[]);
  }, []);

  const fetchProducts = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("artisan_id", uid)
      .order("created_at", { ascending: false });
    if (data) setProducts(data as Product[]);
  }, []);

  const fetchPitches = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("proposals")
      .select("*, project:projects(title, budget, client:profiles(full_name))")
      .eq("artisan_id", uid)
      .order("created_at", { ascending: false });
    if (data) setPitches(data as any);
  }, []);

  const fetchOrders = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("orders")
      .select("*, client:profiles!orders_client_id_fkey(full_name, company_name)")
      .eq("artisan_id", uid)
      .neq("order_status", "cancelled")
      .order("created_at", { ascending: false });
    if (data) setOrders(data as Order[]);
  }, []);

  const fetchFinancials = useCallback(async (uid: string) => {
    const { data } = await supabase.rpc("get_artisan_financials", { uid });
    if (data) {
      setFinancials({
        available_earnings: data.available_earnings ?? 0,
        locked_escrow: data.locked_escrow ?? 0,
        total_completed_earnings: data.total_completed_earnings ?? 0,
      });
    }
  }, []);

  // ─── Initial load ──────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setPageLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setPageLoading(false); return; }

      setUserId(user.id);

      // Fetch profile from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) setUserProfile(profile as Profile);

      // Parallel data fetches
      await Promise.all([
        fetchGigs(user.id),
        fetchProducts(user.id),
        fetchPitches(user.id),
        fetchOrders(user.id),
        fetchFinancials(user.id),
      ]);

      setPageLoading(false);
    };

    init();
  }, [fetchGigs, fetchProducts, fetchPitches, fetchOrders, fetchFinancials]);

  // ─── Derived state ─────────────────────────────────
  const artisanRank = userProfile?.rank || "Bronze";
  const hasSubscription = userProfile?.is_subscribed || false;
  const { available_earnings: availableEarnings, locked_escrow: lockedEscrow, total_completed_earnings: totalCompletedEarnings } = financials;
  const progressPercent = Math.min(
    Math.round(((availableEarnings + lockedEscrow + totalCompletedEarnings) / parseFloat(goalTarget || "1")) * 100),
    100
  );

  // ─── Avatar upload ─────────────────────────────────
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${userId}-${Date.now()}.${fileExt}`;

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

      // Update profiles table
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) {
        alert("Failed to update profile avatar: " + updateError.message);
        return;
      }

      setUserProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      alert("🎉 Profile avatar updated successfully! The new image is active and optimized.");
    } catch (err: any) {
      console.error(err);
      alert("An unexpected error occurred during upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // ─── Add Gig ───────────────────────────────────────
  const handleAddGig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGigTitle || !newGigPrice || !userId) return;

    setIsSavingGig(true);
    const { error } = await supabase.from("gigs").insert({
      artisan_id: userId,
      title: newGigTitle,
      description: "",
      category: newGigCategory,
      starting_price: parseFloat(newGigPrice),
      delivery_days: 3,
      skills: [],
    });

    if (error) {
      alert("Failed to create gig: " + error.message);
      setIsSavingGig(false);
      return;
    }

    await fetchGigs(userId);
    setNewGigTitle("");
    setNewGigPrice("");
    setIsAddingGig(false);
    setIsSavingGig(false);
  };

  // ─── Add Product ───────────────────────────────────
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductTitle || !newProductPrice || !userId) return;

    setIsSavingProduct(true);
    const { error } = await supabase.from("products").insert({
      artisan_id: userId,
      title: newProductTitle,
      description: "",
      category: newProductCategory,
      price: parseFloat(newProductPrice),
      in_stock: parseInt(newProductStock) || 1,
    });

    if (error) {
      alert("Failed to create product: " + error.message);
      setIsSavingProduct(false);
      return;
    }

    await fetchProducts(userId);
    setNewProductTitle("");
    setNewProductPrice("");
    setNewProductStock("");
    setIsAddingProduct(false);
    setIsSavingProduct(false);
  };

  // ─── Subscription toggle (updates profiles table) ──
  const handleSubscribe = async () => {
    if (!userId) return;
    await supabase
      .from("profiles")
      .update({ is_subscribed: true, rank: "Gold Pro" })
      .eq("id", userId);
    setUserProfile(prev => prev ? { ...prev, is_subscribed: true, rank: "Gold Pro" } : null);
  };

  const handleCancelSubscription = async () => {
    if (!userId) return;
    await supabase
      .from("profiles")
      .update({ is_subscribed: false, rank: "Bronze" })
      .eq("id", userId);
    setUserProfile(prev => prev ? { ...prev, is_subscribed: false, rank: "Bronze" } : null);
  };

  // ─── Loading state ─────────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="text-xs text-neutral-400 uppercase tracking-wider font-bold">Loading Workspace…</span>
          </div>
        </div>
      </div>
    );
  }

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
                ) : userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
                    {userProfile?.full_name ? userProfile.full_name.split(" ").slice(0, 2).map(n => n[0]).join("") : "SA"}
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isUploading} />
              </label>
              <div>
                <h3 className="text-sm font-bold text-foreground">{userProfile?.full_name || "Artisan"}</h3>
                <p className="text-[10px] text-neutral-400 font-sans">{userProfile?.school || "—"}</p>
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
              {artisanRank !== "Gold Pro" ? (
                <>
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-neutral-400">Path to Silver Badge:</h4>
                    <div className="text-[11px] space-y-1 text-neutral-500">
                      <div className="flex justify-between">
                        <span>Completed Jobs</span>
                        <span className="font-semibold text-foreground">{userProfile?.completed_jobs ?? 0} / 5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating Average</span>
                        <span className="font-semibold text-foreground">{userProfile?.avg_rating?.toFixed(1) ?? "0.0"} / 4.5</span>
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
                      onClick={handleSubscribe}
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
                    onClick={handleCancelSubscription}
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

            {orders.length === 0 ? (
              <div className="bg-neutral-900/30 p-6">
                <p className="text-xs text-neutral-500 text-center">No active contracts yet. Land your first gig to get started.</p>
              </div>
            ) : (
              orders.filter(o => o.order_status !== "completed").map((order) => (
                <div key={order.id} className="bg-neutral-900/30 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{order.title}</h3>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        Client: {order.client?.full_name || order.client?.company_name || "—"} • Budget: ₦{order.amount.toLocaleString()}
                      </p>
                    </div>
                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 border ${
                      order.order_status === "delivered"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        : order.order_status === "revision"
                        ? "bg-red-500/10 text-red-600 border-red-500/20"
                        : "bg-primary/10 text-primary border-primary/20"
                    }`}>
                      {order.order_status === "in_progress" ? "In Progress" 
                        : order.order_status === "delivered" ? "Review Pending"
                        : order.order_status === "revision" ? "Revision Requested"
                        : order.order_status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed font-light">
                    {order.milestone || "Milestone details will appear here once set by the client."}
                  </p>
                </div>
              ))
            )}
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
                <button 
                  type="submit" 
                  disabled={isSavingGig}
                  className="bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-6 py-2 hover:bg-foreground hover:text-background transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingGig && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
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
                <button 
                  type="submit" 
                  disabled={isSavingProduct}
                  className="bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-6 py-2 hover:bg-foreground hover:text-background transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingProduct && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Product
                </button>
              </form>
            )}

            {/* Sub-tab 1: Gigs List (Borderless Design) */}
            {activeSubTab === "showcase" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gigs.length === 0 ? (
                  <div className="col-span-full bg-neutral-900/10 p-8 text-center">
                    <p className="text-xs text-neutral-500">No gigs listed yet. Click "Add Gig" to create your first service listing.</p>
                  </div>
                ) : (
                  gigs.map((gig) => {
                    const Icon = categoryIcon(gig.category);
                    return (
                      <div key={gig.id} className="bg-neutral-900/10 hover:bg-neutral-900/30 p-5 flex flex-col justify-between h-36 transition-all duration-300">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[8px] uppercase tracking-wider text-neutral-500 font-sans">{gig.category}</span>
                            <span className="text-xs font-bold font-serif text-primary">₦{gig.starting_price.toLocaleString()}</span>
                          </div>
                          <h4 className="font-serif text-sm font-semibold text-foreground mt-2 leading-snug">{gig.title}</h4>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-neutral-500 border-t border-border/20 pt-2.5 mt-4">
                          <span>Standard Delivery: {gig.delivery_days} days</span>
                          <span className="text-primary hover:underline cursor-pointer">Edit Gig</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Sub-tab 2: Products List (Borderless Design) */}
            {activeSubTab === "products" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.length === 0 ? (
                  <div className="col-span-full bg-neutral-900/10 p-8 text-center">
                    <p className="text-xs text-neutral-500">No products listed yet. Click "Add Product" to start selling.</p>
                  </div>
                ) : (
                  products.map((prod) => (
                    <div key={prod.id} className="bg-neutral-900/10 hover:bg-neutral-900/30 p-5 flex flex-col justify-between h-36 transition-all duration-300">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[8px] uppercase tracking-wider text-neutral-500 font-sans">{prod.category}</span>
                          <span className="text-xs font-bold font-serif text-primary">₦{prod.price.toLocaleString()}</span>
                        </div>
                        <h4 className="font-serif text-sm font-semibold text-foreground mt-2 leading-snug">{prod.title}</h4>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-neutral-500 border-t border-border/20 pt-2.5 mt-4">
                        <span>Inventory Stock: <strong>{prod.in_stock}</strong></span>
                        <span className="text-primary hover:underline cursor-pointer">Edit Product</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Sub-tab 3: Pitches List */}
            {activeSubTab === "pitches" && (
              <div className="space-y-4">
                {pitches.length === 0 ? (
                  <div className="bg-neutral-900/10 p-8 text-center">
                    <p className="text-xs text-neutral-500">No pitches sent yet. Browse open projects and submit your first proposal.</p>
                  </div>
                ) : (
                  pitches.map((pitch) => (
                    <div key={pitch.id} className="bg-neutral-900/10 hover:bg-neutral-900/30 p-5 flex justify-between items-center transition-all duration-300">
                      <div>
                        <h4 className="font-serif text-sm font-semibold text-foreground">{pitch.project?.title || "Untitled Project"}</h4>
                        <p className="text-[10px] text-neutral-400 mt-1 font-sans">
                          Client: {pitch.project?.client?.full_name || "—"} • Bid Price: ₦{pitch.bid_price.toLocaleString()} • Pitched: {new Date(pitch.created_at).toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <span className={`text-[9px] uppercase font-bold px-2 py-0.5 shrink-0 border ${
                        pitch.status === "accepted" 
                          ? "bg-green-500/10 text-green-600 border-green-500/20" 
                          : pitch.status === "rejected"
                          ? "bg-red-500/10 text-red-600 border-red-500/20"
                          : "bg-primary/10 text-primary border-primary/20"
                      }`}>
                        {pitch.status === "pending" ? "Awaiting Review" : pitch.status === "accepted" ? "Accepted (Funding Locked)" : pitch.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>

        </div>

      </main>

    </div>
  );
}
