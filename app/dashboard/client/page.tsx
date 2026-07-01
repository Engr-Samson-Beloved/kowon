"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Wallet, 
  FolderKanban, 
  Users, 
  Plus, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  AlertCircle, 
  ChevronRight, 
  GraduationCap, 
  X,
  Sparkles,
  Search,
  MapPin,
  TrendingUp
} from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import Logo from "@/components/logo";

// Initial Active Collaborations
const INITIAL_COLLABORATIONS = [
  {
    id: 1,
    artisanName: "Samuel Alabi",
    school: "University of Lagos (UNILAG)",
    title: "React Web Redesign Layout",
    category: "Code & Dev",
    budget: 45000,
    status: "Deliverable Submitted",
    milestone: "Layout Dev Draft",
    milestoneStatus: "review", // review | approved | progress
  },
  {
    id: 2,
    artisanName: "Chinwe Egwu",
    school: "University of Ibadan (UI)",
    title: "Bespoke traditional senator cut",
    category: "Fashion & Crafts",
    budget: 25000,
    status: "In Progress",
    milestone: "Fabric Fitting",
    milestoneStatus: "progress",
  }
];

// Initial Posted Project Tenders & incoming student pitches
const INITIAL_TENDERS = [
  {
    id: 1,
    title: "Corporate Website Redesign using Tailwind CSS",
    budget: 120000,
    proposalsCount: 2,
    status: "active",
    pitches: [
      {
        id: 101,
        artisanName: "Samuel Alabi",
        school: "UNILAG",
        bid: 110000,
        days: 5,
        skills: ["Tailwind", "React", "Next.js"],
        letter: "Hi, I have built 8 Next.js sites for small businesses. I can deliver a clean layout within 5 days."
      },
      {
        id: 102,
        artisanName: "Chinwe Egwu",
        school: "UI",
        bid: 115000,
        days: 6,
        skills: ["CSS", "React", "Figma"],
        letter: "I specialize in clean interfaces and web design. I have worked on three React portals."
      }
    ]
  }
];

export default function ClientDashboard() {
  const [collaborations, setCollaborations] = useState(INITIAL_COLLABORATIONS);
  const [tenders, setTenders] = useState(INITIAL_TENDERS);
  
  // Financial Metrics
  const [lockedEscrow, setLockedEscrow] = useState(70000);
  const [totalSpent, setTotalSpent] = useState(240000);
  const activeHiresCount = collaborations.filter(c => c.status !== "Completed").length;

  // Modals / Panels toggles
  const [activeTenderForBids, setActiveTenderForBids] = useState<number | null>(null);
  const [activeCollabForReview, setActiveCollabForReview] = useState<number | null>(null);
  const [isPostingTender, setIsPostingTender] = useState(false);

  // Form states for New Tender
  const [newTenderTitle, setNewTenderTitle] = useState("");
  const [newTenderBudget, setNewTenderBudget] = useState("");
  const [newTenderDesc, setNewTenderDesc] = useState("");

  const handlePostTender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenderTitle || !newTenderBudget) return;

    const newTender = {
      id: tenders.length + 1,
      title: newTenderTitle,
      budget: parseFloat(newTenderBudget),
      proposalsCount: 0,
      status: "active",
      pitches: []
    };

    setTenders([newTender, ...tenders]);
    setNewTenderTitle("");
    setNewTenderBudget("");
    setNewTenderDesc("");
    setIsPostingTender(false);
  };

  // Simulating hiring a student from the pitches list
  const handleHireArtisan = (tenderId: number, pitchId: number) => {
    const tender = tenders.find(t => t.id === tenderId);
    if (!tender) return;
    
    const pitch = tender.pitches.find(p => p.id === pitchId);
    if (!pitch) return;

    // Create new collaboration
    const newCollab = {
      id: collaborations.length + 1,
      artisanName: pitch.artisanName,
      school: `${pitch.school} (Campus Hub)`,
      title: tender.title,
      category: "Code & Dev", // default
      budget: pitch.bid,
      status: "In Progress",
      milestone: "Initial Design Draft",
      milestoneStatus: "progress"
    };

    // Update metrics: lock the bid price into escrow
    setCollaborations([...collaborations, newCollab]);
    setLockedEscrow(prev => prev + pitch.bid);
    
    // Remove pitch from list or update tender status
    const updatedTenders = tenders.map(t => {
      if (t.id === tenderId) {
        return {
          ...t,
          status: "hired",
          pitches: t.pitches.filter(p => p.id !== pitchId)
        };
      }
      return t;
    });
    setTenders(updatedTenders);
    setActiveTenderForBids(null);
  };

  // Simulating approving the deliverable and releasing funds
  const handleReleaseEscrow = (collabId: number) => {
    const collab = collaborations.find(c => c.id === collabId);
    if (!collab) return;

    // Update the collaboration status
    const updatedCollabs = collaborations.map(c => {
      if (c.id === collabId) {
        return {
          ...c,
          status: "Completed",
          milestone: "All Milestones Delivered",
          milestoneStatus: "approved"
        };
      }
      return c;
    });

    setCollaborations(updatedCollabs);
    // Deduct from escrow and add to total spent
    setLockedEscrow(prev => Math.max(prev - collab.budget, 0));
    setTotalSpent(prev => prev + collab.budget);
    setActiveCollabForReview(null);
  };

  const selectedTender = tenders.find(t => t.id === activeTenderForBids);
  const selectedCollab = collaborations.find(c => c.id === activeCollabForReview);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* 1. HEADER */}
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
                Client Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-xs text-neutral-500 font-medium">
              <span>Alpha Tech Solutions</span>
            </div>
            <ThemeToggle />
            <Link 
              href="/dashboard/inbox" 
              className="border border-border hover:border-foreground text-xs font-semibold uppercase tracking-wider px-4 py-2 transition-colors"
            >
              Inbox
            </Link>
            <Link 
              href="/dashboard/artisan" 
              className="border border-border hover:border-foreground text-xs font-semibold uppercase tracking-wider px-4 py-2 transition-colors"
            >
              Switch to Artisan
            </Link>
          </div>
        </div>
      </header>

      {/* 2. DASHBOARD BODY */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 lg:px-24 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Summary Metrics (Spans 4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Escrow ledger stats */}
          <div className="border border-border bg-card p-6 space-y-4">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
              Payments & Escrow Vault
            </span>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Locked in Escrow</span>
                <p className="text-3xl font-bold text-primary font-serif">₦{lockedEscrow.toLocaleString()}</p>
              </div>
              <div className="border-t border-border pt-4">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Total Spent</span>
                <p className="text-xl font-bold text-foreground font-serif">₦{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Quick Hires Status */}
          <div className="border border-border bg-card p-6 space-y-4">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
              Active Hires Overview
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">Active Collaborations</span>
              </div>
              <span className="text-sm font-bold bg-neutral-100 dark:bg-neutral-900 border border-border px-2 py-0.5">
                {activeHiresCount}
              </span>
            </div>
            <p className="text-[10px] text-neutral-500 leading-relaxed font-light">
              Make sure to promptly review student artisan milestones to release payouts upon successful delivery.
            </p>
          </div>

        </div>

        {/* Right Side: Operations Control Panel (Spans 8 columns) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Collaborations panel */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Active Collaborations
              </span>
            </h2>

            <div className="space-y-4">
              {collaborations.map((collab) => (
                <div key={collab.id} className="border border-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                        {collab.category}
                      </span>
                      <span className="text-[10px] text-neutral-400">{collab.school}</span>
                    </div>
                    
                    <h3 className="font-serif text-lg font-bold">{collab.title}</h3>
                    <p className="text-xs text-neutral-500 font-light">
                      Artisan: <strong>{collab.artisanName}</strong>
                    </p>

                    <div className="flex items-center gap-2 text-[10px] pt-1">
                      {collab.status === "Completed" ? (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-500 font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Contract Released & Paid
                        </span>
                      ) : collab.status === "Deliverable Submitted" ? (
                        <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500 font-semibold animate-pulse">
                          <Clock className="h-3.5 w-3.5" />
                          Milestone Review Pending: {collab.milestone}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-neutral-400">
                          <Clock className="h-3.5 w-3.5" />
                          Work in Progress: {collab.milestone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 border-t md:border-t-0 border-border pt-4 md:pt-0 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">Budget Locked</span>
                      <span className="text-base font-bold font-serif text-foreground">₦{collab.budget.toLocaleString()}</span>
                    </div>

                    {collab.status === "Deliverable Submitted" ? (
                      <button 
                        onClick={() => setActiveCollabForReview(collab.id)}
                        className="bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider px-4 py-2.5 hover:bg-foreground hover:text-background transition-colors"
                      >
                        Review Work
                      </button>
                    ) : collab.status === "Completed" ? (
                      <button className="border border-border text-neutral-400 text-xs font-semibold uppercase tracking-wider px-4 py-2.5 cursor-not-allowed" disabled>
                        Released
                      </button>
                    ) : (
                      <button className="border border-border text-foreground hover:border-foreground text-xs font-semibold uppercase tracking-wider px-4 py-2.5 transition-colors">
                        Message
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Tenders Board */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary" />
                Active Tenders
              </h2>
              <button 
                onClick={() => setIsPostingTender(!isPostingTender)}
                className="text-xs font-bold uppercase tracking-wider text-primary hover:text-foreground flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Post Tender
              </button>
            </div>

            {/* Post Tender Form */}
            {isPostingTender && (
              <form onSubmit={handlePostTender} className="border border-primary bg-primary/5 p-6 space-y-4 animate-fade-in">
                <h3 className="font-serif text-lg font-bold">Post a New Project Tender</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-neutral-500 font-semibold block">Tender Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Graphic Brand Designer" 
                      required
                      value={newTenderTitle}
                      onChange={(e) => setNewTenderTitle(e.target.value)}
                      className="w-full bg-background border border-border text-xs p-3 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-neutral-500 font-semibold block">Budget Target (₦)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 50000" 
                      required
                      value={newTenderBudget}
                      onChange={(e) => setNewTenderBudget(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-background border border-border text-xs p-3 outline-none focus:border-primary"
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-neutral-500 font-semibold block">Description</label>
                  <textarea 
                    placeholder="Provide details about the project requirements..."
                    value={newTenderDesc}
                    onChange={(e) => setNewTenderDesc(e.target.value)}
                    className="w-full bg-background border border-border text-xs p-3 outline-none focus:border-primary h-20 resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    type="submit" 
                    className="bg-primary text-primary-foreground font-semibold uppercase text-xs tracking-wider px-6 py-2.5 hover:bg-foreground hover:text-background transition-all duration-300"
                  >
                    Post Project
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsPostingTender(false)}
                    className="border border-border text-neutral-500 font-semibold uppercase text-xs tracking-wider px-6 py-2.5 hover:border-foreground hover:text-foreground transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Tenders List */}
            <div className="space-y-4">
              {tenders.map((tender) => (
                <div key={tender.id} className="border border-border bg-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold">{tender.title}</h3>
                    <p className="text-xs text-neutral-400 font-light">
                      Target budget: <strong>₦{tender.budget.toLocaleString()}</strong> • Status: {tender.status === "hired" ? "Hired/Assigned" : "Accepting Pitches"}
                    </p>
                    <span className="text-[10px] text-neutral-500 font-semibold block pt-1 uppercase">
                      {tender.pitches.length} student proposals submitted
                    </span>
                  </div>

                  <div>
                    {tender.status === "hired" ? (
                      <span className="text-[10px] font-bold text-green-600 border border-green-500/20 bg-green-500/10 px-3 py-1 uppercase tracking-wider">
                        Artisan Hired
                      </span>
                    ) : tender.pitches.length > 0 ? (
                      <button 
                        onClick={() => setActiveTenderForBids(tender.id)}
                        className="bg-foreground text-background dark:bg-white dark:text-black font-semibold text-xs uppercase tracking-wider px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        Review Pitches
                      </button>
                    ) : (
                      <span className="text-[10px] text-neutral-400 border border-border px-3 py-1 uppercase tracking-wider font-semibold">
                        Awaiting Bids
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* MODAL 1: REVIEW DELIVERABLE & RELEASE ESCROW */}
      {selectedCollab && activeCollabForReview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border max-w-md w-full p-6 space-y-6 relative animate-fade-in">
            <button 
              onClick={() => setActiveCollabForReview(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{selectedCollab.category}</span>
              <h3 className="font-serif text-xl font-bold">{selectedCollab.title}</h3>
              <p className="text-xs text-neutral-500 font-light">Milestone submitted by {selectedCollab.artisanName} ({selectedCollab.school})</p>
            </div>

            <div className="border border-border p-4 bg-background space-y-2">
              <span className="text-[10px] text-primary uppercase font-bold block">Submitted Lookbook / Draft</span>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                <em>"Hi Client, I have completed the responsive layout according to the Figma specs. You can inspect the live layout at student-build-unilag.vercel.app or look at the attached screenshots."</em>
              </p>
              <div className="h-10 bg-primary/10 border border-primary/20 flex items-center justify-center text-xs text-primary font-bold mt-3">
                Live Draft Preview Active
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs border-b border-border/50 pb-2">
                <span className="text-neutral-400">Locked Escrow Payout:</span>
                <strong className="text-foreground">₦{selectedCollab.budget.toLocaleString()}</strong>
              </div>
              <p className="text-[10px] text-neutral-400 leading-relaxed font-light">
                Approving this milestone immediately releases the locked fund contract directly into the student Artisan's local bank account ledger.
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => handleReleaseEscrow(selectedCollab.id)}
                className="bg-primary text-primary-foreground font-semibold uppercase text-xs tracking-wider px-6 py-3 hover:bg-foreground hover:text-background transition-all duration-300 flex-1"
              >
                Approve & Release Escrow
              </button>
              <button 
                onClick={() => setActiveCollabForReview(null)}
                className="border border-border text-neutral-500 font-semibold uppercase text-xs tracking-wider px-4 py-3 hover:border-foreground hover:text-foreground transition-all duration-300"
              >
                Reject / Revision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REVIEW PITCHES & HIRE ARTISAN */}
      {selectedTender && activeTenderForBids && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-border max-w-2xl w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto animate-fade-in">
            <button 
              onClick={() => setActiveTenderForBids(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Posted Project Tender</span>
              <h3 className="font-serif text-xl font-bold">{selectedTender.title}</h3>
              <p className="text-xs text-neutral-500 font-light">Select and hire a student Artisan. Funding will lock in escrow.</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-bold border-b border-border pb-2">
                Incoming Pitches ({selectedTender.pitches.length})
              </h4>
              
              <div className="space-y-4">
                {selectedTender.pitches.map((pitch) => (
                  <div key={pitch.id} className="border border-border p-4 bg-background space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-sm font-bold text-foreground">{pitch.artisanName}</h5>
                        <p className="text-[10px] text-neutral-400 font-light">{pitch.school} Campus Hub</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Proposed Bid</span>
                        <p className="text-sm font-bold text-primary">₦{pitch.bid.toLocaleString()}</p>
                        <p className="text-[9px] text-neutral-400 mt-0.5">{pitch.days} Days delivery</p>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
                      "{pitch.letter}"
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {pitch.skills.map((skill, i) => (
                        <span key={i} className="text-[9px] font-medium bg-neutral-100 dark:bg-neutral-900 border border-border text-neutral-600 px-2 py-0.5">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-border/50">
                      <button className="border border-border text-foreground hover:border-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 transition-colors">
                        Chat Profile
                      </button>
                      <button 
                        onClick={() => handleHireArtisan(selectedTender.id, pitch.id)}
                        className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 hover:bg-foreground hover:text-background transition-colors"
                      >
                        Hire & Lock Funds
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
