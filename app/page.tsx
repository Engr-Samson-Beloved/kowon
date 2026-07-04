"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import ScrollAnimate from "@/components/scroll-animate";
import { 
  Search, 
  MapPin, 
  Star, 
  Briefcase, 
  ArrowUpRight, 
  TrendingUp, 
  Camera, 
  Scissors, 
  Code, 
  BookOpen, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  Plus,
  Compass,
  Zap,
  ArrowRight
} from "lucide-react";

// Mock Data for Premium Student Freelancers (Gigs)
const GIGS_DATA = [
  {
    id: 1,
    name: "Tunde Opeyemi",
    school: "University of Lagos (UNILAG)",
    category: "Code & Dev",
    title: "High-performance React & Next.js Landing Pages",
    rating: 4.9,
    reviews: 24,
    startingPrice: "35,000",
    imageBg: "bg-gradient-to-tr from-yellow-700 via-yellow-600 to-amber-900",
    avatar: "TO",
    icon: Code,
    skills: ["React", "Next.js", "Tailwind", "SEO"],
    rank: "Gold Pro"
  },
  {
    id: 2,
    name: "Chinwe Egwu",
    school: "University of Ibadan (UI)",
    category: "Fashion & Crafts",
    title: "Bespoke Traditional Wear & Modern Agbada Design",
    rating: 5.0,
    reviews: 18,
    startingPrice: "25,000",
    imageBg: "bg-gradient-to-tr from-amber-700 via-amber-800 to-yellow-900",
    avatar: "CE",
    icon: Scissors,
    skills: ["Traditional", "Modern Fit", "Embroidery"],
    rank: "Silver"
  },
  {
    id: 3,
    name: "Aisha Mohammed",
    school: "Obafemi Awolowo University (OAU)",
    category: "Visual Media",
    title: "On-Campus Creative Portraits & Brand Photoshoots",
    rating: 4.8,
    reviews: 32,
    startingPrice: "15,000",
    imageBg: "bg-gradient-to-tr from-yellow-950 via-yellow-800 to-amber-700",
    avatar: "AM",
    icon: Camera,
    skills: ["Retouching", "Outdoor", "Event Portrait"],
    rank: "Gold Pro"
  },
  {
    id: 4,
    name: "Bolaji Salako",
    school: "University of Ilorin (UNILORIN)",
    category: "Beauty & Style",
    title: "Bridal Glam & Editorial Hair Styling Services",
    rating: 4.9,
    reviews: 29,
    startingPrice: "18,000",
    imageBg: "bg-gradient-to-tr from-amber-900 via-yellow-700 to-yellow-600",
    avatar: "BS",
    icon: Sparkles,
    skills: ["Bridal Glam", "Natural Hair", "Makeup"],
    rank: "Bronze"
  },
  {
    id: 5,
    name: "Emeka Kalu",
    school: "Fed. University of Tech. Akure (FUTA)",
    category: "Technical Services",
    title: "PC Maintenance, Laptop Repair & OS Upgrades",
    rating: 4.7,
    reviews: 15,
    startingPrice: "8,000",
    imageBg: "bg-gradient-to-tr from-zinc-800 via-yellow-900 to-zinc-950",
    avatar: "EK",
    icon: Code,
    skills: ["Hardware Repair", "OS Install", "Optimization"],
    rank: "Bronze"
  },
  {
    id: 6,
    name: "Olamide Soyinka",
    school: "University of Benin (UNIBEN)",
    category: "Academics",
    title: "Calculus, Physics & Engineering Mathematics Tutoring",
    rating: 5.0,
    reviews: 41,
    startingPrice: "5,000 / hr",
    imageBg: "bg-gradient-to-tr from-yellow-800 via-amber-950 to-yellow-700",
    avatar: "OS",
    icon: BookOpen,
    skills: ["Calculus", "Physics", "Exam Prep"],
    rank: "Silver"
  }
];

// Mock Data for Active Client Projects (The Exchange / Bidding Board)
const PROJECTS_DATA = [
  {
    id: 1,
    clientName: "Alpha Tech Solutions",
    title: "Corporate Website Redesign using Tailwind CSS",
    budget: "120,000",
    proposals: 14,
    daysLeft: 5,
    category: "Code & Dev",
    schoolLimit: "Open to All Schools",
    desc: "We need a clean, responsive 5-page marketing website. Must have portfolio galleries and contact forms."
  },
  {
    id: 2,
    clientName: "Tolu's Boutique",
    title: "Product Videography for Instagram Launch",
    budget: "45,000",
    proposals: 8,
    daysLeft: 2,
    category: "Visual Media",
    schoolLimit: "Lagos Only (On-Site)",
    desc: "Looking for a student videographer to shoot 5 aesthetic product reels for a new fashion collection launch."
  },
  {
    id: 3,
    clientName: "Greenwood Academy",
    title: "Senior High School Math Tutor Needed",
    budget: "6,000 / hr",
    proposals: 19,
    daysLeft: 12,
    category: "Academics",
    schoolLimit: "Ibadan Only",
    desc: "A Math student or tutor who can prepare students for WAEC examinations in algebra and geometry."
  }
];

const PLACEHOLDERS = [
  "Search Next.js developers...",
  "Search bespoke traditional wear...",
  "Search outdoor portrait photography...",
  "Search calculus tutoring...",
  "Search hardware laptop repairs..."
];

export default function Page() {
  const [activeTab, setActiveTab] = useState<"showcase" | "exchange">("showcase");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  const categories = ["All", "Code & Dev", "Fashion & Crafts", "Visual Media", "Beauty & Style", "Technical Services", "Academics"];

  // Filter logic
  const filteredGigs = GIGS_DATA.filter(gig => {
    const matchesCategory = selectedCategory === "All" || gig.category === selectedCategory;
    const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          gig.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          gig.school.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredProjects = PROJECTS_DATA.filter(project => {
    const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="dark min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* JSON-LD Structured Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "KÓ WON",
            "url": "https://kowon.com.ng",
            "description": "Connecting skilled Nigerian student freelancers and creators with clients seeking affordable, high-end crafts and services.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://kowon.com.ng/?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />

      {/* 1. HEADER (Top Glassmorphic Navigation) */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 lg:px-24">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Brand Logotype */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-serif text-3xl font-bold tracking-widest text-foreground hover:opacity-85 cursor-pointer">
                KÓ WON
              </span>
              <span className="bg-primary/20 text-primary border border-primary/30 text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 mt-1 font-sans">
                It's Affordable
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <Link href="/marketplace?tab=showcase" className="hover:text-primary transition-colors">The Showcase</Link>
            <Link href="/marketplace?tab=exchange" className="hover:text-primary transition-colors">The Exchange</Link>
            <a href="#how-it-works" className="hover:text-primary transition-colors">Process</a>
            <a href="#value" className="hover:text-primary transition-colors">Value</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-6">
            <Link 
              href="/auth/login"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:text-primary transition-colors"
            >
              Log In
            </Link>
            <Link 
              href="/auth/signup" 
              className="bg-primary text-primary-foreground font-semibold uppercase text-xs tracking-wider px-5 py-2.5 hover:bg-foreground hover:text-background transition-all duration-300"
            >
              Join as Talent
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO SECTION (Editorial, Asymmetric Grid with Search Transformation) */}
      <section className="px-6 py-12 lg:py-20 lg:px-24 max-w-7xl mx-auto w-full transition-all duration-700">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Text & Search Column (Grows from 7 columns to full 12 columns) */}
          <div className={`transition-all duration-700 ease-in-out ${isSearchActive ? "lg:col-span-12" : "lg:col-span-7"} space-y-8`}>
            
            {/* Header / Brand Subtitle (Collapses on search) */}
            <div className={`transition-all duration-500 ease-in-out origin-top ${
              isSearchActive 
                ? "max-h-0 opacity-0 overflow-hidden transform -translate-y-4" 
                : "max-h-12 opacity-100 transform translate-y-0"
            }`}>
              <div className="inline-flex items-center gap-2 border-l-2 border-primary pl-4 py-0.5">
                <span className="text-xs uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-bold">
                  Student Freelance & Craft Ecosystem
                </span>
              </div>
            </div>
            
            {/* Hero Main Heading (Collapses on search) */}
            <div className={`transition-all duration-500 ease-in-out origin-top ${
              isSearchActive 
                ? "max-h-0 opacity-0 overflow-hidden transform -translate-y-6" 
                : "max-h-[300px] opacity-100 transform translate-y-0"
            }`}>
              <h1 className="font-serif text-5xl md:text-7xl font-extralight tracking-tight leading-none">
                Premium Talents. <br />
                Crafted Services. <br />
                <span className="italic text-primary font-normal">Affordable Luxury.</span>
              </h1>
              
              <p className="max-w-md text-neutral-400 text-base leading-relaxed font-light mt-6">
                Discover elite Nigerian student creators. Top-tier software dev, bespoke tailoring, photography, and tutoring, delivered at scale.
              </p>
            </div>

            {/* Direct Search Bar (Elevates and animates width) */}
            <div className="space-y-2">
              {isSearchActive && (
                <span className="text-[10px] uppercase tracking-wider text-primary font-bold block animate-fade-in">
                  Search Directory Active
                </span>
              )}
              <div className={`flex items-center bg-card border border-border p-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-500 ease-in-out ${
                isSearchActive ? "shadow-lg max-w-3xl border-primary" : "max-w-lg"
              }`}>
                <Search className="h-5 w-5 text-neutral-400 mx-2" />
                <input 
                  type="text" 
                  placeholder={PLACEHOLDERS[placeholderIdx]} 
                  className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder-neutral-400 px-1 py-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchActive(true)}
                />
                
                {isSearchActive && (
                  <button 
                    type="button"
                    onClick={() => {
                      setIsSearchActive(false);
                      setSearchQuery("");
                    }}
                    className="text-neutral-400 hover:text-primary px-3 text-xs uppercase tracking-wider font-semibold transition-colors shrink-0 mr-1"
                  >
                    Cancel
                  </button>
                )}
                
                <button className="bg-primary hover:bg-foreground hover:text-background text-primary-foreground font-semibold px-6 py-2.5 text-xs uppercase tracking-wider transition-colors shrink-0">
                  Find Value
                </button>
              </div>
            </div>

            {/* Micro Stats (Collapses on search) */}
            <div className={`flex gap-8 border-t border-border/80 pt-6 max-w-lg transition-all duration-500 origin-top ${
              isSearchActive 
                ? "max-h-0 opacity-0 overflow-hidden mt-0 pt-0 border-t-0" 
                : "max-h-24 opacity-100 mt-6"
            }`}>
              <div>
                <p className="text-2xl font-serif text-primary font-bold">12+</p>
                <p className="text-xs text-neutral-700 dark:text-neutral-400 uppercase tracking-wider font-semibold">Campuses</p>
              </div>
              <div className="border-l border-border h-10 my-auto"></div>
              <div>
                <p className="text-2xl font-serif text-primary font-bold">4.9/5</p>
                <p className="text-xs text-neutral-700 dark:text-neutral-400 uppercase tracking-wider font-semibold">Average Rating</p>
              </div>
              <div className="border-l border-border h-10 my-auto"></div>
              <div>
                <p className="text-2xl font-serif text-primary font-bold">₦40M+</p>
                <p className="text-xs text-neutral-700 dark:text-neutral-400 uppercase tracking-wider font-semibold">Student Earnings</p>
              </div>
            </div>

          </div>

          {/* Right Asymmetric Gallery (Slides right and fades out on active search) */}
          <div className={`transition-all duration-700 ease-in-out ${
            isSearchActive 
              ? "lg:col-span-0 hidden opacity-0 pointer-events-none transform translate-x-12" 
              : "lg:col-span-5 grid grid-cols-2 gap-4 h-[480px] relative opacity-100 transform translate-x-0"
          }`}>
            <div className="space-y-4">
              <div className="h-56 bg-neutral-900 border border-border overflow-hidden relative group p-6 flex flex-col justify-end">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                <div className="absolute top-4 right-4 z-20 bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase">
                  UI/UX Design
                </div>
                <div className="z-20">
                  <p className="font-serif text-lg text-white">Tunde Opeyemi</p>
                  <p className="text-xs text-neutral-300">University of Lagos</p>
                </div>
              </div>
              <div className="h-[200px] bg-neutral-800 border border-border overflow-hidden relative group p-6 flex flex-col justify-end">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                <div className="absolute top-4 right-4 z-20 bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase">
                  Photography
                </div>
                <div className="z-20">
                  <p className="font-serif text-lg text-white">Aisha Mohammed</p>
                  <p className="text-xs text-neutral-300">Obafemi Awolowo Univ.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="h-[200px] bg-neutral-800 border border-border overflow-hidden relative group p-6 flex flex-col justify-end">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                <div className="absolute top-4 right-4 z-20 bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase">
                  Tailoring
                </div>
                <div className="z-20">
                  <p className="font-serif text-lg text-white">Chinwe Egwu</p>
                  <p className="text-xs text-neutral-300">University of Ibadan</p>
                </div>
              </div>
              <div className="h-56 bg-neutral-900 border border-border overflow-hidden relative group p-6 flex flex-col justify-end">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                <div className="absolute top-4 right-4 z-20 bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold px-2 py-0.5 tracking-wider uppercase">
                  BeautyGlam
                </div>
                <div className="z-20">
                  <p className="font-serif text-lg text-white">Bolaji Salako</p>
                  <p className="text-xs text-neutral-300">University of Ilorin</p>
                </div>
              </div>
            </div>
            
            {/* Absolute Decorative Accents */}
            <div className="absolute -bottom-6 -left-6 h-12 w-12 border-b-2 border-l-2 border-primary z-0 hidden lg:block" />
            <div className="absolute -top-6 -right-6 h-12 w-12 border-t-2 border-r-2 border-primary z-0 hidden lg:block" />
          </div>
          
        </div>
      </section>

      {/* 3. VALUE PROPOSITION SECTION */}
      <section id="value" className={`bg-secondary text-secondary-foreground py-16 px-6 lg:px-24 transition-all duration-500 ${isSearchActive ? "hidden opacity-0 pointer-events-none" : "opacity-100"}`}>
        <div className="max-w-7xl mx-auto">
          <ScrollAnimate variant="fade">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-secondary-foreground/20 pb-12 mb-12">
              <div>
                <span className="text-xs uppercase tracking-widest text-primary font-bold">Why KÓ WON Matters</span>
                <h2 className="font-serif text-3xl md:text-5xl font-light mt-2">Redefining Affordable Excellence</h2>
              </div>
              <p className="max-w-md text-sm text-secondary-foreground/75 leading-relaxed">
                We leverage verified university rosters to offer professional-grade work from highly ambitious students without the corporate agency price tag.
              </p>
            </div>
          </ScrollAnimate>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollAnimate variant="slide-up" delay={0}>
              <div className="space-y-4">
                <div className="bg-primary/10 text-primary border border-primary/30 p-3 inline-block">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-bold">Vetted Student Rosters</h3>
                <p className="text-sm text-secondary-foreground/80 leading-relaxed">
                  Every student freelancer must register with their official institutional credentials, ensuring trust and professional accountability.
                </p>
              </div>
            </ScrollAnimate>
            
            <ScrollAnimate variant="slide-up" delay={150}>
              <div className="space-y-4">
                <div className="bg-primary/10 text-primary border border-primary/30 p-3 inline-block">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-bold">Guaranteed Affordability</h3>
                <p className="text-sm text-secondary-foreground/80 leading-relaxed">
                  True to our name (KÓ WON — *“It's Affordable”*), student services and crafts are structured without inflated administrative costs.
                </p>
              </div>
            </ScrollAnimate>
            
            <ScrollAnimate variant="slide-up" delay={300}>
              <div className="space-y-4">
                <div className="bg-primary/10 text-primary border border-primary/30 p-3 inline-block">
                  <Star className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-bold">Direct Secure Escrow</h3>
                <p className="text-sm text-secondary-foreground/80 leading-relaxed">
                  Funds are held securely and only released when the client verifies and approves the final craft product or digital deliverable.
                </p>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* 4. THE MARKETPLACE HUB (The Showcase / The Exchange Toggle) */}
      <section id="marketplace" className={`px-6 lg:px-24 bg-background text-foreground flex-1 transition-all duration-500 ${isSearchActive ? "py-8" : "py-20"}`}>
        <div className="max-w-7xl mx-auto">
          
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-primary font-bold">
                {isSearchActive ? "Filtered Search Results" : "Active Board"}
              </span>
              <h2 className="font-serif text-3xl md:text-5xl font-light mt-2">
                {isSearchActive && searchQuery ? `Showing Results for "${searchQuery}"` : "Direct Marketplace"}
              </h2>
            </div>
            
            {/* Dual Bidding Tabs */}
            <div className="inline-flex border border-border p-1 bg-background">
              <button 
                onClick={() => { setActiveTab("showcase"); setSelectedCategory("All"); }}
                className={`px-6 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === "showcase" 
                    ? "bg-primary text-primary-foreground font-bold" 
                    : "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                The Showcase (Catalog)
              </button>
              <button 
                onClick={() => { setActiveTab("exchange"); setSelectedCategory("All"); }}
                className={`px-6 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === "exchange" 
                    ? "bg-primary text-primary-foreground font-bold" 
                    : "text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
              >
                The Exchange (Bids)
              </button>
            </div>
          </div>

          {/* Categories Horizontal Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none border-b border-border/50">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider shrink-0 transition-all ${
                  selectedCategory === cat
                    ? "border-b-2 border-primary text-foreground font-bold"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* VIEW A: THE SHOWCASE (Fiverr style, Catalog of Gigs) */}
          {activeTab === "showcase" && (
            <div>
              {filteredGigs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredGigs.map((gig) => {
                    const CategoryIcon = gig.icon;
                    return (
                      <div 
                        key={gig.id} 
                        className="group relative bg-card text-card-foreground border border-border p-6 transition-all duration-500 hover:shadow-xl hover:border-primary flex flex-col justify-between"
                      >
                        <div>
                          {/* Banner background representation */}
                          <div className={`h-40 w-full ${gig.imageBg} relative overflow-hidden mb-5 flex items-center justify-center`}>
                            <CategoryIcon className="h-12 w-12 text-white/40 group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-3 left-3 bg-background border border-border text-[9px] font-bold tracking-wider px-2 py-0.5 uppercase">
                              {gig.category}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                              {gig.avatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-foreground">{gig.name}</h4>
                                <span className={`text-[8px] font-bold px-1.5 py-0.5 border ${
                                  gig.rank === "Gold Pro"
                                    ? "bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/20"
                                    : gig.rank === "Silver"
                                    ? "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20"
                                    : "bg-orange-500/10 text-orange-800 dark:text-orange-400 border-orange-500/20"
                                }`}>
                                  {gig.rank}
                                </span>
                              </div>
                              <p className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="h-3 w-3 shrink-0 text-primary" />
                                {gig.school}
                              </p>
                            </div>
                          </div>

                          <h3 className="font-serif text-lg font-normal text-foreground leading-tight line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                            {gig.title}
                          </h3>

                          {/* Skill Tags */}
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {gig.skills.map((skill, index) => (
                              <span key={index} className="text-[9px] font-medium bg-neutral-100 dark:bg-neutral-900 border border-border text-neutral-600 dark:text-neutral-400 px-2 py-0.5">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-border mt-6 pt-4">
                          <div>
                            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Starting At</span>
                            <p className="text-lg font-bold text-foreground font-serif">₦{gig.startingPrice}</p>
                          </div>
                          
                          <button className="flex items-center gap-1 bg-foreground text-background dark:bg-neutral-900 dark:text-white border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
                            Book Gig
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 border border-dashed border-border bg-neutral-50 dark:bg-neutral-900">
                  <HelpCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-serif">No Gigs Found</h3>
                  <p className="text-sm text-neutral-400 max-w-xs mx-auto mt-2">We couldn't find any student catalog offerings fitting that category or query.</p>
                </div>
              )}
            </div>
          )}

          {/* VIEW B: THE EXCHANGE (Upwork style, Client post bids) */}
          {activeTab === "exchange" && (
            <div className="space-y-6">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <div 
                    key={project.id} 
                    className="border border-border bg-card text-card-foreground p-6 lg:p-8 hover:border-primary transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    <div className="space-y-3 max-w-2xl">
                      <div className="flex items-center gap-3">
                        <span className="bg-primary/10 text-primary border border-primary/30 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5">
                          {project.category}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-semibold tracking-wider uppercase">
                          {project.schoolLimit}
                        </span>
                      </div>
                      
                      <h3 className="font-serif text-xl font-bold hover:text-primary transition-colors cursor-pointer">
                        {project.title}
                      </h3>
                      
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                        {project.desc}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-neutral-400">
                        <span>Posted by: <strong className="text-foreground">{project.clientName}</strong></span>
                        <span>•</span>
                        <span>{project.daysLeft} days left to apply</span>
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center border-t lg:border-t-0 border-border lg:border-l lg:pl-8 pt-4 lg:pt-0 gap-4 shrink-0 min-w-[200px]">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Budget</span>
                        <p className="text-2xl font-serif font-bold text-foreground">₦{project.budget}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{project.proposals} proposals submitted</p>
                      </div>

                      <button className="bg-primary text-primary-foreground font-semibold uppercase text-xs tracking-wider px-6 py-3 hover:bg-foreground hover:text-background transition-all duration-300">
                        Pitch Proposal
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 border border-dashed border-border bg-card text-card-foreground">
                  <HelpCircle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-serif">No Active Projects</h3>
                  <p className="text-sm text-neutral-400 max-w-xs mx-auto mt-2">There are no client bids listed under this category right now.</p>
                </div>
              )}

              {/* Client CTAs */}
              <div className="border border-border bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
                <div>
                  <h4 className="font-serif text-lg font-bold">Have a custom task or craft project?</h4>
                  <p className="text-xs text-muted-foreground">Post it and invite verified campus talents to pitch their best bids.</p>
                </div>
                <button className="flex items-center gap-2 bg-foreground text-background font-semibold uppercase text-xs tracking-wider px-6 py-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                  <Plus className="h-4 w-4" />
                  Post a Project
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 5. PROCESS SECTION (How It Works) */}
      <section id="how-it-works" className={`bg-neutral-950 text-white py-20 px-6 lg:px-24 transition-all duration-500 ${isSearchActive ? "hidden opacity-0 pointer-events-none" : "opacity-100"}`}>
        <div className="max-w-7xl mx-auto">
          <ScrollAnimate variant="fade">
            <div className="max-w-xl space-y-4 mb-16">
              <span className="text-xs uppercase tracking-widest text-primary font-bold">Matchmaking Steps</span>
              <h2 className="font-serif text-4xl lg:text-6xl font-light">Simple. Transparent. Secure.</h2>
              <p className="text-neutral-400 text-sm leading-relaxed">
                We bridge student side-hustles with client trust using structured checkpoints, keeping jobs secure and quality high.
              </p>
            </div>
          </ScrollAnimate>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <ScrollAnimate variant="slide-up" delay={0}>
              <div className="space-y-4 relative">
                <div className="text-5xl font-serif text-primary/30 font-bold">01</div>
                <h3 className="font-serif text-lg font-bold">Request / Browse</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Clients post custom project details to the Bidding Board or buy fixed-rate student services directly from the Showcase.
                </p>
                <div className="hidden md:block absolute top-6 right-0 text-primary/30 font-bold">&rarr;</div>
              </div>
            </ScrollAnimate>
            
            <ScrollAnimate variant="slide-up" delay={100}>
              <div className="space-y-4 relative">
                <div className="text-5xl font-serif text-primary/30 font-bold">02</div>
                <h3 className="font-serif text-lg font-bold">Secure Fund Lock</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  The client locks the project budget into the secure KÓ WON escrow vault before the student starts working on the task.
                </p>
                <div className="hidden md:block absolute top-6 right-0 text-primary/30 font-bold">&rarr;</div>
              </div>
            </ScrollAnimate>

            <ScrollAnimate variant="slide-up" delay={200}>
              <div className="space-y-4 relative">
                <div className="text-5xl font-serif text-primary/30 font-bold">03</div>
                <h3 className="font-serif text-lg font-bold">Track & Verify</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  The student submits intermediate work progress. For physical crafts, before/after lookbook proofs are uploaded for checks.
                </p>
                <div className="hidden md:block absolute top-6 right-0 text-primary/30 font-bold">&rarr;</div>
              </div>
            </ScrollAnimate>

            <ScrollAnimate variant="slide-up" delay={300}>
              <div className="space-y-4">
                <div className="text-5xl font-serif text-primary/30 font-bold">04</div>
                <h3 className="font-serif text-lg font-bold">Payout Release</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Once the client reviews the deliverable and hits approve, funds are immediately credited to the student's local bank account.
                </p>
              </div>
            </ScrollAnimate>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION (CTA) */}
      <section className={`bg-primary text-primary-foreground py-20 px-6 lg:px-24 text-center transition-all duration-500 ${isSearchActive ? "hidden opacity-0 pointer-events-none" : "opacity-100"}`}>
        <ScrollAnimate variant="fade-scale">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="font-serif text-4xl md:text-6xl font-light">
              Ready to unleash elite student value?
            </h2>
            <p className="max-w-xl mx-auto text-sm opacity-90 leading-relaxed">
              Whether you are a Nigerian student looking to earn legitimate income on campus or a client seeking affordable, premium crafts and services.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/auth/signup"
                className="bg-foreground text-background font-semibold uppercase text-xs tracking-wider px-8 py-4 hover:bg-neutral-900 transition-colors inline-block"
              >
                Find Talents
              </Link>
              <Link 
                href="/auth/signup"
                className="border border-foreground text-foreground font-semibold uppercase text-xs tracking-wider px-8 py-4 hover:bg-foreground hover:text-background transition-colors inline-block"
              >
                List Your Services
              </Link>
            </div>
          </div>
        </ScrollAnimate>
      </section>
      </main>

      {/* 7. FOOTER */}
      <footer className="bg-neutral-950 text-neutral-400 py-16 px-6 lg:px-24 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <h3 className="font-serif text-2xl text-white font-bold tracking-widest">KÓ WON</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Nigeria's premier student-powered service marketplace. Enabling entrepreneurship, craft visibility, and affordable local execution.
            </p>
            <div className="text-[10px] text-primary bg-primary/10 border border-primary/20 inline-block px-2 py-0.5 font-bold uppercase tracking-wider">
              Yoruba: It's Affordable
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Marketplace</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#marketplace" className="hover:text-primary transition-colors">The Showcase (Catalog)</a></li>
              <li><a href="#marketplace" className="hover:text-primary transition-colors">The Exchange (Bids)</a></li>
              <li><a href="#marketplace" className="hover:text-primary transition-colors">Student Lookbooks</a></li>
              <li><a href="#marketplace" className="hover:text-primary transition-colors">Browse Campuses</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Information</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#how-it-works" className="hover:text-primary transition-colors">Safety & Escrow</a></li>
              <li><a href="#value" className="hover:text-primary transition-colors">Trust Guidelines</a></li>
              <li><a href="#how-it-works" className="hover:text-primary transition-colors">Fee Structures</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Support Channels</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Mission Statement</h4>
            <p className="text-xs text-neutral-400 leading-relaxed italic">
              "To bridge the gap between talented Nigerian students and customers by providing a trusted, secure, and user-friendly platform that promotes employment, entrepreneurship, and affordability."
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-neutral-900 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-400">
          <p>© {new Date().getFullYear()} KÓ WON. All rights reserved across Nigeria and Africa.</p>
          <p className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </p>
        </div>
      </footer>

    </div>
  );
}
