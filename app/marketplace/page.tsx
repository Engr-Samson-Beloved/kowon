"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/components/supabase-client";
import type { Gig, Product, Project } from "@/lib/types";
import { 
  Search, 
  MapPin, 
  Star, 
  SlidersHorizontal, 
  X, 
  CheckCircle2, 
  Briefcase, 
  Scissors, 
  Code, 
  Camera, 
  Sparkles, 
  BookOpen, 
  HelpCircle,
  ShoppingBag,
  Compass
} from "lucide-react";
import Navbar from "@/components/navbar";

// =============================================================
// Category icon resolver (maps DB category strings to icons)
// =============================================================
const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "Code & Dev": Code,
  "Fashion & Crafts": Scissors,
  "Visual Media": Camera,
  "Beauty & Style": Sparkles,
  "Technical Services": Code,
  "Academics": BookOpen,
};

function getCategoryIcon(category: string) {
  return CATEGORY_ICON_MAP[category] || HelpCircle;
}

// =============================================================
// Avatar initials helper
// =============================================================
function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// =============================================================
// Loading Skeleton Components
// =============================================================
function GigSkeleton() {
  return (
    <div className="bg-neutral-900/10 p-5 flex flex-col justify-between animate-pulse">
      <div>
        <div className="h-40 w-full bg-neutral-800/40 mb-5" />
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 bg-neutral-800/60" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 w-24 bg-neutral-800/60" />
            <div className="h-2.5 w-32 bg-neutral-800/40" />
          </div>
        </div>
        <div className="h-4 w-full bg-neutral-800/50 mb-1.5" />
        <div className="h-4 w-3/4 bg-neutral-800/40" />
        <div className="flex gap-1 mt-4">
          <div className="h-4 w-12 bg-neutral-800/40" />
          <div className="h-4 w-14 bg-neutral-800/40" />
          <div className="h-4 w-10 bg-neutral-800/40" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border/20 mt-5 pt-4">
        <div className="h-3.5 w-16 bg-neutral-800/50" />
        <div className="h-4 w-20 bg-neutral-800/50" />
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-neutral-900/10 p-5 flex flex-col justify-between animate-pulse">
      <div>
        <div className="h-40 w-full bg-neutral-800/40 mb-5" />
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 bg-neutral-800/60" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 w-24 bg-neutral-800/60" />
            <div className="h-2.5 w-16 bg-neutral-800/40" />
          </div>
        </div>
        <div className="h-4 w-full bg-neutral-800/50 mb-1.5" />
        <div className="h-4 w-3/4 bg-neutral-800/40" />
        <div className="h-3 w-full bg-neutral-800/30 mt-2" />
      </div>
      <div className="flex items-center justify-between border-t border-border/20 mt-5 pt-4">
        <div className="h-3.5 w-16 bg-neutral-800/50" />
        <div className="h-4 w-20 bg-neutral-800/50" />
      </div>
      <div className="h-10 w-full bg-neutral-800/40 mt-4" />
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div className="bg-neutral-900/10 p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 animate-pulse">
      <div className="space-y-3 flex-1">
        <div className="flex gap-3">
          <div className="h-5 w-20 bg-neutral-800/50" />
          <div className="h-5 w-28 bg-neutral-800/40" />
        </div>
        <div className="h-5 w-3/4 bg-neutral-800/50" />
        <div className="h-3 w-full bg-neutral-800/30" />
        <div className="h-3 w-2/3 bg-neutral-800/30" />
        <div className="flex gap-6 pt-1">
          <div className="h-3 w-28 bg-neutral-800/40" />
          <div className="h-3 w-28 bg-neutral-800/40" />
        </div>
      </div>
      <div className="flex items-center md:flex-col md:items-end gap-4 shrink-0">
        <div className="h-6 w-28 bg-neutral-800/50" />
        <div className="h-10 w-28 bg-neutral-800/60" />
      </div>
    </div>
  );
}

// =============================================================
// Gradient pool for gig/product cards (used when no image_url)
// =============================================================
const GRADIENT_POOL = [
  "bg-gradient-to-tr from-yellow-700 via-yellow-600 to-amber-900",
  "bg-gradient-to-tr from-amber-700 via-amber-800 to-yellow-900",
  "bg-gradient-to-tr from-yellow-950 via-yellow-800 to-amber-700",
  "bg-gradient-to-tr from-amber-900 via-yellow-700 to-yellow-600",
  "bg-gradient-to-tr from-zinc-800 via-yellow-900 to-zinc-950",
  "bg-gradient-to-tr from-yellow-800 via-amber-950 to-yellow-700",
  "bg-gradient-to-tr from-amber-800 via-yellow-950 to-amber-900",
  "bg-gradient-to-tr from-zinc-800 via-zinc-950 to-neutral-900",
];

function getGradient(id: string): string {
  // Deterministic gradient from id
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return GRADIENT_POOL[Math.abs(hash) % GRADIENT_POOL.length];
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as any) || "showcase";
  
  const [activeTab, setActiveTab] = useState<"showcase" | "exchange" | "products">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSchool, setSelectedSchool] = useState("All");
  const [maxPrice, setMaxPrice] = useState(150000);
  const [showFilters, setShowFilters] = useState(false);

  // Data states
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingGigs, setLoadingGigs] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Modal states
  const [selectedGigDetail, setSelectedGigDetail] = useState<Gig | null>(null);
  const [selectedProjectForBid, setSelectedProjectForBid] = useState<Project | null>(null);
  
  // Form Bid states
  const [proposedBid, setProposedBid] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [pitchLetter, setPitchLetter] = useState("");
  const [bidSubmitted, setBidSubmitted] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Auth Sync
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoadingSession(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Gigs from Supabase
  useEffect(() => {
    const fetchGigs = async () => {
      setLoadingGigs(true);
      const { data, error } = await supabase
        .from("gigs")
        .select("*, artisan:profiles(id, full_name, school, avatar_url, rank, avg_rating, total_reviews, skills)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setGigs(data as Gig[]);
      }
      setLoadingGigs(false);
    };
    fetchGigs();
  }, []);

  // Fetch Products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from("products")
        .select("*, artisan:profiles(id, full_name, school, avatar_url)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProducts(data as Product[]);
      }
      setLoadingProducts(false);
    };
    fetchProducts();
  }, []);

  // Fetch Projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*, client:profiles(id, full_name, company_name), proposals(count)")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setProjects(data as Project[]);
      }
      setLoadingProjects(false);
    };
    fetchProjects();
  }, []);

  // Sync tab state if query parameter changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "exchange") {
      setActiveTab("exchange");
    } else if (tabParam === "products") {
      setActiveTab("products");
    } else {
      setActiveTab("showcase");
    }
  }, [searchParams]);

  const categories = ["All", "Code & Dev", "Fashion & Crafts", "Visual Media", "Beauty & Style", "Technical Services", "Academics"];
  const schools = ["All", "UNILAG", "UI", "OAU", "UNIBEN", "FUTA", "UNILORIN"];

  // Filter Gigs
  const filteredGigs = gigs.filter(gig => {
    const matchesCategory = selectedCategory === "All" || gig.category === selectedCategory;
    const matchesSchool = selectedSchool === "All" || (gig.artisan?.school || "").includes(selectedSchool);
    const matchesPrice = gig.starting_price <= maxPrice;
    const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (gig.artisan?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSchool && matchesPrice && matchesSearch;
  });

  // Filter Products
  const filteredProducts = products.filter(prod => {
    const matchesCategory = selectedCategory === "All" || prod.category === selectedCategory;
    const matchesPrice = prod.price <= maxPrice;
    const matchesSearch = prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (prod.artisan?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPrice && matchesSearch;
  });

  // Filter Projects
  const filteredProjects = projects.filter(proj => {
    const matchesCategory = selectedCategory === "All" || proj.category === selectedCategory;
    const matchesSchool = selectedSchool === "All" || (proj.school_limit || "").includes(selectedSchool) || proj.school_limit === "Open to All Schools";
    const matchesPrice = proj.budget <= maxPrice;
    const matchesSearch = proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (proj.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSchool && matchesPrice && matchesSearch;
  });

  // Helper: get proposal count from joined aggregate
  const getProposalCount = (project: Project): number => {
    if (!project.proposals) return 0;
    if (Array.isArray(project.proposals) && project.proposals.length > 0) {
      const first = project.proposals[0];
      if (typeof first === "object" && "count" in first) return (first as { count: number }).count;
      return project.proposals.length;
    }
    return 0;
  };

  // Helper: compute days left from deadline_days + created_at
  const getDaysLeft = (project: Project): number => {
    if (!project.deadline_days || !project.created_at) return 0;
    const created = new Date(project.created_at);
    const deadline = new Date(created.getTime() + project.deadline_days * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diff = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const handleCreateBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposedBid || !deliveryDays || !pitchLetter) return;
    setBidSubmitted(true);
    setTimeout(() => {
      setBidSubmitted(false);
      setSelectedProjectForBid(null);
      setProposedBid("");
      setDeliveryDays("");
      setPitchLetter("");
      alert("🎉 Pitch proposal submitted successfully! The Client will review your bid inside the Inbox thread.");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* Reusable premium navbar */}
      <Navbar />

      {/* SUB-HERO SEARCH & TABS PANELS */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Search controls bar - Blends in with background */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/30 p-6 border border-border/30">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder={activeTab === "showcase" ? "Search student crafts, skills, or names..." : "Search client briefs, projects, or categories..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border/40 pl-10 pr-4 py-3 text-xs outline-none focus:border-primary"
            />
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-neutral-900/60 border border-border/40 px-4 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters */}
        {showFilters && (
          <div className="bg-neutral-900/40 border border-border/30 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-neutral-400 font-bold block">Campus Filter</label>
              <select 
                value={selectedSchool} 
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full bg-background border border-border text-xs p-3 outline-none focus:border-primary"
              >
                {schools.map(s => (
                  <option key={s} value={s}>{s === "All" ? "All Universities" : s}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase text-neutral-400 font-bold block">Max Budget/Price (₦)</label>
              <div className="space-y-1">
                <input 
                  type="range" 
                  min="5000" 
                  max="200000" 
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>₦5,000</span>
                  <span className="font-bold text-primary">₦{maxPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-end">
              <button 
                onClick={() => {
                  setSelectedSchool("All");
                  setSelectedCategory("All");
                  setMaxPrice(150000);
                }}
                className="w-full border border-border hover:border-red-500 hover:text-red-500 text-xs font-semibold uppercase tracking-wider py-3 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Main Tab Switcher */}
        <div className="flex justify-between items-center border-b border-border/20 pb-2">
          <div className="flex gap-8 text-sm font-semibold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab("showcase")}
              className={`pb-2.5 transition-all cursor-pointer ${
                activeTab === "showcase"
                  ? "border-b-2 border-primary text-foreground font-bold text-xs"
                  : "text-neutral-400 hover:text-foreground text-xs"
              }`}
            >
              Marketplace Gigs
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`pb-2.5 transition-all cursor-pointer ${
                activeTab === "products"
                  ? "border-b-2 border-primary text-foreground font-bold text-xs"
                  : "text-neutral-400 hover:text-foreground text-xs"
              }`}
            >
              Campus Shop
            </button>
            <button
              onClick={() => setActiveTab("exchange")}
              className={`pb-2.5 transition-all cursor-pointer ${
                activeTab === "exchange"
                  ? "border-b-2 border-primary text-foreground font-bold text-xs"
                  : "text-neutral-400 hover:text-foreground text-xs"
              }`}
            >
              The Exchange (Bids)
            </button>
          </div>
        </div>

        {/* Categories Pills Carousel (Mobile / Tablet) */}
        <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] font-bold uppercase tracking-wider px-4 py-2 border shrink-0 transition-all ${
                selectedCategory === cat 
                  ? "bg-foreground text-background dark:bg-white dark:text-black border-foreground dark:border-white shadow-md" 
                  : "bg-transparent text-neutral-400 border-border hover:text-foreground hover:border-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. SHOWCASE (GIGS GRID) */}
        {activeTab === "showcase" && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Personalized Greeting (showcase.png style) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground">
                  {user ? `Welcome back, ${user.user_metadata?.full_name || "Client"}` : "Welcome to KÓ WON"}
                </h1>
                <p className="text-xs text-neutral-400 mt-1 font-sans">
                  {user ? "Based on what you might be looking for on Nigeria's campuses." : "Nigeria's premier marketplace for elite student software dev, tailoring, and photography."}
                </p>
              </div>
            </div>

            {/* Dynamic Brief or Signup Promotion Banner */}
            {user ? (
              <div className="bg-neutral-900/30 border border-border/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Post a project brief</h3>
                    <p className="text-xs text-neutral-400 mt-0.5 font-sans">Get tailored offers and pitches from verified campus talents for your custom needs.</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setActiveTab("exchange");
                  }}
                  className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-6 py-2.5 text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer"
                >
                  Get started
                </button>
              </div>
            ) : (
              <div className="bg-neutral-900/30 border border-border/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Join the KÓ WON Campus Network</h3>
                    <p className="text-xs text-neutral-400 mt-0.5 font-sans">Are you a talented student freelancer? Create your profile, showcase crafts, and find clients commission-free.</p>
                  </div>
                </div>
                <Link 
                  href="/auth/signup"
                  className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-6 py-2.5 text-xs uppercase tracking-wider transition-all duration-300 inline-block text-center cursor-pointer"
                >
                  Register Now
                </Link>
              </div>
            )}

            {/* Showcase Grid Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              
              {/* Vertical Categories List Sidebar (Fiverr style - hidden on mobile) */}
              <div className="lg:col-span-1 space-y-2 hidden lg:block">
                <h3 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-4 font-sans">Categories</h3>
                {[
                  { name: "All", label: "Keep exploring", icon: Compass },
                  { name: "Code & Dev", label: "Code & Dev", icon: Code },
                  { name: "Fashion & Crafts", label: "Fashion & Crafts", icon: Scissors },
                  { name: "Visual Media", label: "Visual Media", icon: Camera },
                  { name: "Academics", label: "Academics & Study", icon: BookOpen }
                ].map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-left border transition-all duration-300 cursor-pointer ${
                        selectedCategory === cat.name
                          ? "bg-primary text-primary-foreground border-primary font-bold"
                          : "bg-card text-foreground border-border hover:border-primary"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Gigs List Column - Card elements blend into the background (borderless, premium) */}
              <div className="lg:col-span-3">
                {loadingGigs ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <GigSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredGigs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGigs.map((gig) => {
                      const CategoryIcon = getCategoryIcon(gig.category);
                      const artisan = gig.artisan;
                      const artisanName = artisan?.full_name || "Artisan";
                      const artisanSchool = artisan?.school || "Campus";
                      const artisanRank = artisan?.rank || "Bronze";
                      const artisanAvatar = artisan?.avatar_url;
                      const artisanSkills = artisan?.skills || gig.skills || [];
                      const rating = gig.avg_rating ?? artisan?.avg_rating ?? 0;
                      const reviews = gig.total_reviews ?? artisan?.total_reviews ?? 0;
                      const imageBg = getGradient(gig.id);

                      return (
                        <div 
                          key={gig.id} 
                          className="group relative bg-neutral-900/10 hover:bg-neutral-900/30 p-5 transition-all duration-300 flex flex-col justify-between"
                        >
                          <div>
                            {/* Banner background representation with Heart Bookmark overlay */}
                            <Link href={`/gig/${gig.id}`}>
                              <div className={`h-40 w-full ${gig.image_url ? "" : imageBg} relative overflow-hidden mb-5 flex items-center justify-center`}>
                                {gig.image_url ? (
                                  <img src={gig.image_url} alt={gig.title} className="h-full w-full object-cover" />
                                ) : (
                                  <CategoryIcon className="h-12 w-12 text-white/40 group-hover:scale-110 transition-transform duration-500" />
                                )}
                                <div className="absolute top-3 left-3 bg-background border border-border text-[9px] font-bold tracking-wider px-2 py-0.5 uppercase font-sans">
                                  {gig.category}
                                </div>
                                
                                {/* Heart shape outline bookmark */}
                                <button className="absolute top-3 right-3 h-7 w-7 rounded-full bg-background/80 hover:bg-background border border-border flex items-center justify-center text-foreground hover:text-red-500 transition-colors z-20 cursor-pointer">
                                  <svg className="h-4 w-4 fill-none stroke-current" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                </button>
                              </div>
                            </Link>

                            <div className="flex items-center gap-3 mb-4">
                              <Link href={artisan?.id ? `/profile/${artisan.id}` : "#"}>
                                <div className="h-9 w-9 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm font-serif overflow-hidden">
                                  {artisanAvatar ? (
                                    <img src={artisanAvatar} alt={artisanName} className="h-full w-full object-cover" />
                                  ) : (
                                    getInitials(artisanName)
                                  )}
                                </div>
                              </Link>
                              <div>
                                <div className="flex items-center gap-2">
                                  <Link href={artisan?.id ? `/profile/${artisan.id}` : "#"}>
                                    <h4 className="text-xs font-bold text-foreground hover:text-primary transition-colors">{artisanName}</h4>
                                  </Link>
                                  <span className={`text-[7px] font-bold px-1.5 py-0.5 border ${
                                    artisanRank === "Gold Pro"
                                      ? "bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/20"
                                      : artisanRank === "Silver"
                                      ? "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20"
                                      : "bg-orange-500/10 text-orange-800 dark:text-orange-400 border-orange-500/20"
                                  }`}>
                                    {artisanRank}
                                  </span>
                                </div>
                                <p className="text-[9px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5 font-sans">
                                  <MapPin className="h-3 w-3 shrink-0 text-primary" />
                                  {artisanSchool}
                                </p>
                              </div>
                            </div>

                            <Link href={`/gig/${gig.id}`}>
                              <h3 
                                className="font-serif text-sm font-semibold text-foreground leading-snug line-clamp-2 hover:text-primary transition-colors cursor-pointer"
                              >
                                {gig.title}
                              </h3>
                            </Link>

                            {/* Skill Tags */}
                            <div className="flex flex-wrap gap-1 mt-4">
                              {artisanSkills.map((skill: string, index: number) => (
                                <span key={index} className="text-[8px] font-medium bg-neutral-100 dark:bg-neutral-900 border border-border text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5 font-sans">
                                  {skill}
                                </span>
                              ))}
                            </div>

                            {/* Offers video consultations (Fiverr style) */}
                            <p className="text-[9px] text-primary flex items-center gap-1 mt-3 font-semibold font-sans">
                              <Camera className="h-3 w-3 shrink-0" />
                              <span>Offers remote video consults</span>
                            </p>
                          </div>

                          {/* Ratings & Price Tag footer context (Fiverr style) */}
                          <div className="flex items-center justify-between border-t border-border mt-5 pt-4">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-primary font-sans">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              <span>{rating.toFixed(1)}</span>
                              <span className="text-neutral-400 font-normal">({reviews})</span>
                            </div>
                            
                            <div className="text-right font-sans">
                              <span className="text-[8px] text-neutral-400 uppercase tracking-wider font-semibold block">Starting At</span>
                              <p className="text-sm font-bold text-foreground">₦{gig.starting_price.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20 border border-dashed border-border bg-neutral-50 dark:bg-neutral-900">
                    <HelpCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-serif">No Gigs Found</h3>
                    <p className="text-sm text-neutral-400 max-w-xs mx-auto mt-2 font-sans">We couldn't find any student catalog offerings fitting that category or query.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. CAMPUS SHOP (DIRECT PRODUCT SELLING) */}
        {activeTab === "products" && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Greeting (showcase.png style) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground">Campus Shop</h1>
                <p className="text-xs text-neutral-400 mt-1 font-sans">Buy premium physical products, downloads, and guides direct from campus artisans.</p>
              </div>
            </div>

            {/* Showcase Grid Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              
              {/* Vertical Categories List Sidebar (Fiverr style - hidden on mobile) */}
              <div className="lg:col-span-1 space-y-2 hidden lg:block">
                <h3 className="text-[10px] uppercase tracking-widest text-primary font-bold mb-4 font-sans">Categories</h3>
                {[
                  { name: "All", label: "Keep exploring", icon: Compass },
                  { name: "Code & Dev", label: "Code & Dev", icon: Code },
                  { name: "Fashion & Crafts", label: "Fashion & Crafts", icon: Scissors },
                  { name: "Visual Media", label: "Visual Media", icon: Camera },
                  { name: "Academics", label: "Academics & Study", icon: BookOpen }
                ].map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-left border transition-all duration-300 cursor-pointer ${
                        selectedCategory === cat.name
                          ? "bg-primary text-primary-foreground border-primary font-bold"
                          : "bg-card text-foreground border-border hover:border-primary"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Products List Column - borderless, matching background */}
              <div className="lg:col-span-3">
                {loadingProducts ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <ProductSkeleton key={i} />
                    ))}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((prod) => {
                      const artisan = prod.artisan;
                      const artisanName = artisan?.full_name || "Seller";
                      const artisanSchool = artisan?.school || "Campus";
                      const artisanAvatar = artisan?.avatar_url;
                      const imageBg = getGradient(prod.id);

                      return (
                        <div 
                          key={prod.id} 
                          className="group relative bg-neutral-900/10 hover:bg-neutral-900/30 p-5 transition-all duration-300 flex flex-col justify-between"
                        >
                          <div>
                            {/* Thumbnail */}
                            <Link href={`/product/${prod.id}`}>
                              <div className={`h-40 w-full ${prod.image_url ? "" : imageBg} relative overflow-hidden mb-5 flex items-center justify-center`}>
                                {prod.image_url ? (
                                  <img src={prod.image_url} alt={prod.title} className="h-full w-full object-cover" />
                                ) : null}
                                <div className="absolute top-3 left-3 bg-background border border-border text-[9px] font-bold tracking-wider px-2 py-0.5 uppercase font-sans">
                                  {prod.category}
                                </div>
                                <div className="absolute top-3 right-3 bg-primary/20 text-primary border border-primary/30 text-[8px] font-bold px-2 py-0.5">
                                  {prod.in_stock} In Stock
                                </div>
                              </div>
                            </Link>

                            {/* Seller avatar and info */}
                            <div className="flex items-center gap-3 mb-4">
                              <Link href={artisan?.id ? `/profile/${artisan.id}` : "#"}>
                                <div className="h-9 w-9 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm font-serif overflow-hidden">
                                  {artisanAvatar ? (
                                    <img src={artisanAvatar} alt={artisanName} className="h-full w-full object-cover" />
                                  ) : (
                                    getInitials(artisanName)
                                  )}
                                </div>
                              </Link>
                              <div>
                                <Link href={artisan?.id ? `/profile/${artisan.id}` : "#"}>
                                  <h4 className="text-xs font-bold text-foreground hover:text-primary transition-colors">{artisanName}</h4>
                                </Link>
                                <p className="text-[9px] text-neutral-400 mt-0.5 font-sans">{artisanSchool}</p>
                              </div>
                            </div>

                            <Link href={`/product/${prod.id}`}>
                              <h3 className="font-serif text-sm font-semibold text-foreground leading-snug line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                                {prod.title}
                              </h3>
                            </Link>
                            <p className="text-[11px] text-neutral-400 mt-2 font-sans line-clamp-2">{prod.description}</p>
                          </div>

                          {/* Footer price and rating */}
                          <div className="flex items-center justify-between border-t border-border/30 mt-5 pt-4">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-primary font-sans">
                              <Star className="h-3.5 w-3.5 fill-current" />
                              <span>{(prod.total_sold ?? 0).toFixed(0)} sold</span>
                            </div>
                            
                            <div className="text-right font-sans">
                              <span className="text-[8px] text-neutral-400 uppercase tracking-wider font-semibold block">Price</span>
                              <p className="text-sm font-bold text-foreground">₦{prod.price.toLocaleString()}</p>
                            </div>
                          </div>

                          {/* Buy Direct button */}
                          <Link 
                            href={`/product/${prod.id}`}
                            className="w-full mt-4 bg-foreground text-background dark:bg-white dark:text-black py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all duration-300 cursor-pointer text-center block"
                          >
                            Buy Direct
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20 border border-dashed border-border bg-neutral-50 dark:bg-neutral-900">
                    <HelpCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-serif">No Products Found</h3>
                    <p className="text-sm text-neutral-400 max-w-xs mx-auto mt-2 font-sans">We couldn't find any campus products fitting that category.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. EXCHANGE (PROJECT TENDERS BIDS) */}
        {activeTab === "exchange" && (
          <div className="space-y-6 animate-fade-in">
            {loadingProjects ? (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <ProjectSkeleton key={i} />
                ))}
              </>
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((project) => {
                const proposalCount = getProposalCount(project);
                const daysLeft = getDaysLeft(project);
                const clientName = project.client?.company_name || project.client?.full_name || "Client";

                return (
                  <div 
                    key={project.id}
                    className="bg-neutral-900/10 hover:bg-neutral-900/30 p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 transition-all duration-300"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5">
                          {project.category}
                        </span>
                        <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          {project.school_limit || "Open to All Schools"}
                        </span>
                      </div>

                      <Link href={`/project/${project.id}`}>
                        <h3 className="font-serif text-xl font-bold text-foreground leading-snug hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-light max-w-2xl">
                        {project.description}
                      </p>

                      <div className="flex gap-6 text-[10px] text-neutral-500 font-semibold pt-1 uppercase">
                        <span>{proposalCount} Pitches submitted</span>
                        <span>•</span>
                        <span>{daysLeft} days left to pitch</span>
                      </div>
                    </div>

                    <div className="flex items-center md:flex-col md:items-end justify-between border-t md:border-t-0 border-border/30 pt-4 md:pt-0 gap-4 shrink-0">
                      <div className="text-left md:text-right">
                        <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">Target Budget</span>
                        <span className="text-xl font-bold font-serif text-foreground">₦{project.budget.toLocaleString()}</span>
                      </div>

                      <button 
                        onClick={() => setSelectedProjectForBid(project)}
                        className="bg-foreground text-background dark:bg-white dark:text-black font-semibold text-xs uppercase tracking-wider px-6 py-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300 cursor-pointer"
                      >
                        Submit Pitch
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 border border-dashed border-border bg-neutral-50 dark:bg-neutral-900">
                <HelpCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-serif">No Open Projects</h3>
                <p className="text-sm text-neutral-400 max-w-xs mx-auto mt-2 font-sans">There are no open project briefs matching your filters right now.</p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODAL 1: GIG DETAILS DRAWER */}
      {selectedGigDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-neutral-900 border-l border-border/40 h-full max-w-lg w-full p-8 space-y-6 relative overflow-y-auto flex flex-col justify-between animate-slide-in-right">
            
            <div className="space-y-6">
              <button 
                onClick={() => setSelectedGigDetail(null)}
                className="absolute top-6 right-6 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="space-y-1.5 pt-4">
                <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{selectedGigDetail.category}</span>
                <h2 className="font-serif text-2xl font-bold leading-tight">{selectedGigDetail.title}</h2>
                <div className="flex items-center gap-3">
                  <Link href={selectedGigDetail.artisan?.id ? `/profile/${selectedGigDetail.artisan.id}` : "#"}>
                    <div className="h-8 w-8 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs overflow-hidden">
                      {selectedGigDetail.artisan?.avatar_url ? (
                        <img src={selectedGigDetail.artisan.avatar_url} alt={selectedGigDetail.artisan?.full_name || ""} className="h-full w-full object-cover" />
                      ) : (
                        getInitials(selectedGigDetail.artisan?.full_name)
                      )}
                    </div>
                  </Link>
                  <div>
                    <Link href={selectedGigDetail.artisan?.id ? `/profile/${selectedGigDetail.artisan.id}` : "#"}>
                      <h4 className="text-xs font-bold text-foreground hover:text-primary transition-colors">
                        {selectedGigDetail.artisan?.full_name || "Artisan"} • {selectedGigDetail.artisan?.school || "Campus"}
                      </h4>
                    </Link>
                    <span className="text-[9px] text-neutral-400 uppercase tracking-wider">{selectedGigDetail.artisan?.rank || "Bronze"} Artisan</span>
                  </div>
                </div>
              </div>

              <div className="bg-background/40 p-4 border border-border/30">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-2 font-sans">Description</span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                  {selectedGigDetail.description}
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Skills Required</span>
                <div className="flex flex-wrap gap-2">
                  {(selectedGigDetail.artisan?.skills || selectedGigDetail.skills || []).map((skill: string, idx: number) => (
                    <span key={idx} className="text-[9px] font-bold uppercase tracking-wider border border-border/30 px-3 py-1 bg-background text-neutral-500 font-sans">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 p-4 space-y-2 border border-primary/20">
                <span className="text-[10px] text-primary uppercase font-bold block">Secure Escrow Safelock</span>
                <p className="text-[9px] text-neutral-400 leading-relaxed font-light">
                  Upon booking, your project budget is immediately locked into the secure KÓ WON escrow vault. Funds are only transferred to the student's local bank account after you review and approve their work.
                </p>
              </div>
            </div>

            <div className="border-t border-border/30 pt-6 flex items-center justify-between shrink-0 mt-6">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Standard Rate</span>
                <span className="text-2xl font-bold font-serif text-foreground">₦{selectedGigDetail.starting_price.toLocaleString()}</span>
              </div>
              
              <Link
                href={`/gig/${selectedGigDetail.id}`}
                className="bg-primary text-primary-foreground font-semibold uppercase text-xs tracking-wider px-8 py-3.5 hover:bg-foreground hover:text-background transition-all duration-300"
              >
                Book This Gig
              </Link>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: SUBMIT BID PROPOSAL */}
      {selectedProjectForBid && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-border/40 max-w-lg w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto animate-fade-in">
            <button 
              onClick={() => setSelectedProjectForBid(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider font-sans">Submit Bid Pitch</span>
              <h3 className="font-serif text-xl font-bold leading-tight">{selectedProjectForBid.title}</h3>
              <p className="text-xs text-neutral-500 font-light">Target Budget: <strong>₦{selectedProjectForBid.budget.toLocaleString()}</strong></p>
            </div>

            {bidSubmitted ? (
              <div className="bg-primary/5 p-8 text-center space-y-4 border border-primary/20">
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto" />
                <h4 className="font-serif text-lg font-bold">Proposal Pitch Sent</h4>
                <p className="text-xs text-neutral-500">Your proposal is now visible to the client. You can track this thread in your Inbox.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateBid} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-neutral-500 font-bold block">Proposed Price (₦)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 100000" 
                      required
                      value={proposedBid}
                      onChange={(e) => setProposedBid(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-background border border-border/30 text-xs p-3 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-neutral-500 font-bold block">Delivery Timeline (Days)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 5" 
                      required
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-background border border-border/30 text-xs p-3 outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-neutral-500 font-bold block">Cover Letter Pitch</label>
                  <textarea 
                    placeholder="Describe your design plans, relevant experience, and how you will complete this craft..."
                    required
                    value={pitchLetter}
                    onChange={(e) => setPitchLetter(e.target.value)}
                    className="w-full bg-background border border-border/30 text-xs p-3 outline-none focus:border-primary h-28 resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="bg-primary text-primary-foreground font-semibold uppercase text-xs tracking-wider py-3.5 w-full hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                >
                  Submit Proposal Pitch
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-xs uppercase tracking-wider text-neutral-400">Loading KÓ WON Marketplace...</p>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
