"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Star, 
  ArrowUpRight, 
  SlidersHorizontal, 
  X, 
  CheckCircle2, 
  Clock, 
  FolderKanban, 
  Briefcase, 
  Scissors, 
  Code, 
  Camera, 
  Sparkles, 
  BookOpen, 
  AlertCircle,
  FileText,
  DollarSign
} from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import Logo from "@/components/logo";

// Mock Showcase Gigs Data
const GIGS_DATA = [
  {
    id: 1,
    name: "Tunde Opeyemi",
    school: "University of Lagos (UNILAG)",
    category: "Code & Dev",
    title: "High-performance React & Next.js Landing Pages",
    rating: 4.9,
    reviews: 24,
    startingPrice: 35000,
    imageBg: "bg-gradient-to-tr from-yellow-700 via-yellow-600 to-amber-900",
    avatar: "TO",
    icon: Code,
    skills: ["React", "Next.js", "Tailwind", "SEO"],
    rank: "Gold Pro",
    description: "I will build a blazing fast, SEO-optimized Next.js landing page for your startup or campus event. High scalability, responsive design, clean styles, and light/dark theme support included."
  },
  {
    id: 2,
    name: "Chinwe Egwu",
    school: "University of Ibadan (UI)",
    category: "Fashion & Crafts",
    title: "Bespoke Traditional Wear & Modern Agbada Design",
    rating: 5.0,
    reviews: 18,
    startingPrice: 25000,
    imageBg: "bg-gradient-to-tr from-amber-700 via-amber-800 to-yellow-900",
    avatar: "CE",
    icon: Scissors,
    skills: ["Traditional", "Modern Fit", "Embroidery"],
    rank: "Silver",
    description: "Get bespoke traditional Senator cuts or modern Agbada tailored to perfection. I provide size matching fittings and mail/delivery directly to your campus address with photos of fabric cuts prior to styling."
  },
  {
    id: 3,
    name: "Aisha Mohammed",
    school: "Obafemi Awolowo University (OAU)",
    category: "Visual Media",
    title: "On-Campus Creative Portraits & Brand Photoshoots",
    rating: 4.8,
    reviews: 32,
    startingPrice: 15000,
    imageBg: "bg-gradient-to-tr from-yellow-950 via-yellow-800 to-amber-700",
    avatar: "AM",
    icon: Camera,
    skills: ["Retouching", "Outdoor", "Event Portrait"],
    rank: "Gold Pro",
    description: "Creative outdoor portrait sessions or commercial product shoot setups on campus. Price covers professional color grading, high-res digital downloads, and 2 quick turnaround revision drafts."
  },
  {
    id: 4,
    name: "Bolaji Salako",
    school: "University of Ilorin (UNILORIN)",
    category: "Beauty & Style",
    title: "Bridal Glam & Editorial Hair Styling Services",
    rating: 4.9,
    reviews: 29,
    startingPrice: 18000,
    imageBg: "bg-gradient-to-tr from-amber-900 via-yellow-700 to-yellow-600",
    avatar: "BS",
    icon: Sparkles,
    skills: ["Bridal Glam", "Natural Hair", "Makeup"],
    rank: "Bronze",
    description: "Professional makeup, facial glam, and editorial hair styling for student weddings, dinners, or graduation events. All products used are premium quality, tailored to your skin type."
  },
  {
    id: 5,
    name: "Emeka Kalu",
    school: "Fed. University of Tech. Akure (FUTA)",
    category: "Technical Services",
    title: "PC Maintenance, Laptop Repair & OS Upgrades",
    rating: 4.7,
    reviews: 15,
    startingPrice: 8000,
    imageBg: "bg-gradient-to-tr from-zinc-800 via-yellow-900 to-zinc-950",
    avatar: "EK",
    icon: Code,
    skills: ["Hardware Repair", "OS Install", "Optimization"],
    rank: "Bronze",
    description: "Is your PC running slow or has system issues? I do clean OS reinstallations, dust cleaning, hardware repairs, memory upgrades, and thermal paste repasting at Akure campus areas."
  },
  {
    id: 6,
    name: "Olamide Soyinka",
    school: "University of Benin (UNIBEN)",
    category: "Academics",
    title: "Calculus, Physics & Engineering Mathematics Tutoring",
    rating: 5.0,
    reviews: 41,
    startingPrice: 5000,
    imageBg: "bg-gradient-to-tr from-yellow-800 via-amber-950 to-yellow-700",
    avatar: "OS",
    icon: BookOpen,
    skills: ["Calculus", "Physics", "Exam Prep"],
    rank: "Silver",
    description: "Highly rated 1-on-1 tutoring sessions for core science and engineering courses. Focus on clearing exams, assignments help, and conceptual physics definitions."
  }
];

// Mock Client Projects (Bidding Exchange)
const PROJECTS_DATA = [
  {
    id: 1,
    clientName: "Alpha Tech Solutions",
    title: "Corporate Website Redesign using Tailwind CSS",
    budget: 120000,
    proposals: 14,
    daysLeft: 5,
    category: "Code & Dev",
    schoolLimit: "Open to All Schools",
    desc: "We require a skilled student developer to rebuild our outdated corporate web page into a high-performance responsive site using Next.js and Tailwind. Must present previous works."
  },
  {
    id: 2,
    clientName: "Tolu's Boutique",
    title: "Product Videography for Instagram Launch",
    budget: 45000,
    proposals: 8,
    daysLeft: 2,
    category: "Visual Media",
    schoolLimit: "Lagos Only (On-Site)",
    desc: "Looking for a student videographer to shoot 5 aesthetic product reels for a new fashion collection launch on campus. Equipment must handle high-res low-light recordings."
  },
  {
    id: 3,
    clientName: "Greenwood Academy",
    title: "Senior High School Math Tutor Needed",
    budget: 6000,
    proposals: 19,
    daysLeft: 12,
    category: "Academics",
    schoolLimit: "Ibadan Only",
    desc: "Math student or tutor who can prepare junior students for WAEC examination milestones in algebra and geometry. Requires physical availability twice a week."
  }
];

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "exchange" ? "exchange" : "showcase";
  
  const [activeTab, setActiveTab] = useState<"showcase" | "exchange">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSchool, setSelectedSchool] = useState("All");
  const [maxPrice, setMaxPrice] = useState(150000);
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [selectedGigDetail, setSelectedGigDetail] = useState<typeof GIGS_DATA[0] | null>(null);
  const [selectedProjectForBid, setSelectedProjectForBid] = useState<typeof PROJECTS_DATA[0] | null>(null);
  
  // Form Bid states
  const [proposedBid, setProposedBid] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [pitchLetter, setPitchLetter] = useState("");
  const [bidSubmitted, setBidSubmitted] = useState(false);

  // Sync tab state if query parameter changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "exchange") {
      setActiveTab("exchange");
    } else {
      setActiveTab("showcase");
    }
  }, [searchParams]);

  const categories = ["All", "Code & Dev", "Fashion & Crafts", "Visual Media", "Beauty & Style", "Technical Services", "Academics"];
  const schools = ["All", "UNILAG", "UI", "OAU", "UNIBEN", "FUTA", "UNILORIN"];

  // Filter Gigs
  const filteredGigs = GIGS_DATA.filter(gig => {
    const matchesCategory = selectedCategory === "All" || gig.category === selectedCategory;
    const matchesSchool = selectedSchool === "All" || gig.school.includes(selectedSchool);
    const matchesPrice = gig.startingPrice <= maxPrice;
    const matchesSearch = gig.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          gig.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSchool && matchesPrice && matchesSearch;
  });

  // Filter Projects
  const filteredProjects = PROJECTS_DATA.filter(proj => {
    const matchesCategory = selectedCategory === "All" || proj.category === selectedCategory;
    const matchesSchool = selectedSchool === "All" || proj.schoolLimit.includes(selectedSchool) || proj.schoolLimit === "Open to All Schools";
    const matchesPrice = proj.budget <= maxPrice;
    const matchesSearch = proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          proj.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSchool && matchesPrice && matchesSearch;
  });

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
      
      {/* 1. HEADER */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 lg:px-24">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-primary transition-colors text-neutral-400">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Logo size={32} />
              <span className="font-serif text-2xl font-bold tracking-widest text-foreground">KÓ WON</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <Link 
              href="/auth/signup" 
              className="bg-primary text-primary-foreground font-semibold uppercase text-[10px] tracking-wider px-5 py-2.5 hover:bg-foreground hover:text-background transition-all duration-300"
            >
              Post a Project
            </Link>
          </div>
        </div>
      </header>

      {/* 2. SUB-HERO SEARCH & TABS PANELS */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 lg:px-24 flex flex-col gap-8">
        
        {/* Search controls bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border border-border bg-card p-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder={activeTab === "showcase" ? "Search student crafts, skills, or names..." : "Search client briefs, projects, or categories..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border pl-10 pr-4 py-3 text-xs outline-none focus:border-primary"
            />
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 border border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filters */}
        {showFilters && (
          <div className="border border-border bg-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
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
                className="w-full border border-border hover:border-red-500 hover:text-red-500 text-xs font-semibold uppercase tracking-wider py-3 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Main Tab Switcher */}
        <div className="flex justify-between items-center border-b border-border pb-2">
          <div className="flex gap-8 text-sm font-semibold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab("showcase")}
              className={`pb-2.5 transition-all ${
                activeTab === "showcase"
                  ? "border-b-2 border-primary text-foreground font-bold text-base"
                  : "text-neutral-400 hover:text-foreground"
              }`}
            >
              The Showcase (Buy Gigs)
            </button>
            <button
              onClick={() => setActiveTab("exchange")}
              className={`pb-2.5 transition-all ${
                activeTab === "exchange"
                  ? "border-b-2 border-primary text-foreground font-bold text-base"
                  : "text-neutral-400 hover:text-foreground"
              }`}
            >
              The Exchange (Bid Projects)
            </button>
          </div>
        </div>

        {/* Categories Pills Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGigs.map((gig) => {
              const GigIcon = gig.icon;
              return (
                <div 
                  key={gig.id} 
                  className="group relative bg-card text-card-foreground border border-border p-6 transition-all duration-500 hover:shadow-xl hover:border-primary flex flex-col justify-between"
                >
                  <div>
                    {/* Banner representation */}
                    <div className={`h-40 w-full ${gig.imageBg} relative overflow-hidden mb-5 flex items-center justify-center`}>
                      <GigIcon className="h-12 w-12 text-white/40 group-hover:scale-110 transition-transform duration-500" />
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
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : gig.rank === "Silver"
                              ? "bg-slate-500/10 text-slate-500 border-slate-500/20"
                              : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                          }`}>
                            {gig.rank}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0 text-primary" />
                          {gig.school}
                        </p>
                      </div>
                    </div>

                    <h3 
                      onClick={() => setSelectedGigDetail(gig)}
                      className="font-serif text-lg font-normal text-foreground leading-tight line-clamp-2 hover:text-primary transition-colors cursor-pointer"
                    >
                      {gig.title}
                    </h3>

                    {/* Skill tags */}
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
                      <p className="text-lg font-bold text-foreground font-serif">₦{gig.startingPrice.toLocaleString()}</p>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedGigDetail(gig)}
                      className="flex items-center gap-1 bg-foreground text-background dark:bg-neutral-900 dark:text-white border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                    >
                      View Details
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. EXCHAGE (PROJECT TENDERS BIDS) */}
        {activeTab === "exchange" && (
          <div className="space-y-6">
            {filteredProjects.map((project) => (
              <div 
                key={project.id}
                className="border border-border bg-card p-6 flex flex-col md:flex-row md:items-start justify-between gap-6 hover:border-primary transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5">
                      {project.category}
                    </span>
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      {project.schoolLimit}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-foreground leading-snug">
                    {project.title}
                  </h3>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-light max-w-2xl">
                    {project.desc}
                  </p>

                  <div className="flex gap-6 text-[10px] text-neutral-500 font-semibold pt-1 uppercase">
                    <span>{project.proposals} Pitches submitted</span>
                    <span>•</span>
                    <span>{project.daysLeft} days left to pitch</span>
                  </div>
                </div>

                <div className="flex items-center md:flex-col md:items-end justify-between border-t md:border-t-0 border-border pt-4 md:pt-0 gap-4 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">Target Budget</span>
                    <span className="text-xl font-bold font-serif text-foreground">₦{project.budget.toLocaleString()}</span>
                  </div>

                  <button 
                    onClick={() => setSelectedProjectForBid(project)}
                    className="bg-foreground text-background dark:bg-white dark:text-black font-semibold text-xs uppercase tracking-wider px-6 py-3 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    Submit Pitch
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* MODAL 1: GIG DETAILS DRAWER */}
      {selectedGigDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-end">
          <div className="bg-card text-card-foreground border-l border-border h-full max-w-lg w-full p-8 space-y-6 relative overflow-y-auto flex flex-col justify-between animate-slide-in-right">
            
            <div className="space-y-6">
              <button 
                onClick={() => setSelectedGigDetail(null)}
                className="absolute top-6 right-6 text-neutral-400 hover:text-primary transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="space-y-1.5 pt-4">
                <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{selectedGigDetail.category}</span>
                <h2 className="font-serif text-2xl font-bold leading-tight">{selectedGigDetail.title}</h2>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {selectedGigDetail.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{selectedGigDetail.name} • {selectedGigDetail.school}</h4>
                    <span className="text-[9px] text-neutral-400 uppercase tracking-wider">{selectedGigDetail.rank} Artisan</span>
                  </div>
                </div>
              </div>

              <div className="border border-border p-4 bg-background">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block mb-2">Description</span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                  {selectedGigDetail.description}
                </p>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Skills Required</span>
                <div className="flex flex-wrap gap-2">
                  {selectedGigDetail.skills.map((skill, idx) => (
                    <span key={idx} className="text-[9px] font-bold uppercase tracking-wider border border-border px-3 py-1 bg-background text-neutral-500">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border border-border bg-primary/5 p-4 space-y-2">
                <span className="text-[10px] text-primary uppercase font-bold block">Secure Escrow Safe lock</span>
                <p className="text-[9px] text-neutral-400 leading-relaxed font-light">
                  Upon booking, your project budget is immediately locked into the secure KÓ WON escrow vault. Funds are only transferred to the student's local bank account after you review and approve their work.
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-6 flex items-center justify-between bg-card shrink-0 mt-6">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Standard Rate</span>
                <span className="text-2xl font-bold font-serif text-foreground">₦{selectedGigDetail.startingPrice.toLocaleString()}</span>
              </div>
              
              <Link
                href="/auth/signup"
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
          <div className="bg-card text-card-foreground border border-border max-w-lg w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto animate-fade-in">
            <button 
              onClick={() => setSelectedProjectForBid(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Submit Bid Pitch</span>
              <h3 className="font-serif text-xl font-bold leading-tight">{selectedProjectForBid.title}</h3>
              <p className="text-xs text-neutral-500 font-light">Target Budget: <strong>₦{selectedProjectForBid.budget.toLocaleString()}</strong></p>
            </div>

            {bidSubmitted ? (
              <div className="border border-primary bg-primary/5 p-8 text-center space-y-4">
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
                      className="w-full bg-background border border-border text-xs p-3 outline-none focus:border-primary"
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
                      className="w-full bg-background border border-border text-xs p-3 outline-none focus:border-primary"
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
                    className="w-full bg-background border border-border text-xs p-3 outline-none focus:border-primary h-28 resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="bg-primary text-primary-foreground font-semibold uppercase text-xs tracking-wider py-3.5 w-full hover:bg-foreground hover:text-background transition-colors"
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
