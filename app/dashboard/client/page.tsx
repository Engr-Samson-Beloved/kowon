"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
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
  TrendingUp,
  Camera
} from "lucide-react";
import { supabase } from "@/components/supabase-client";
import Navbar from "@/components/navbar";

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
    milestoneStatus: "review", 
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
  
  // Supabase Profile state
  const [userProfile, setUserProfile] = useState<{
    fullName: string;
    email: string;
    avatarUrl: string;
    companyName: string;
  } | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserProfile({
          fullName: user.user_metadata?.full_name || "Alpha Tech Solutions",
          email: user.email || "",
          avatarUrl: user.user_metadata?.avatar_url || "",
          companyName: user.user_metadata?.company_name || "",
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

  const handleHireArtisan = (tenderId: number, pitchId: number) => {
    const tender = tenders.find(t => t.id === tenderId);
    if (!tender) return;
    
    const pitch = tender.pitches.find(p => p.id === pitchId);
    if (!pitch) return;

    const newCollab = {
      id: collaborations.length + 1,
      artisanName: pitch.artisanName,
      school: `${pitch.school} (Campus Hub)`,
      title: tender.title,
      category: "Code & Dev", 
      budget: pitch.bid,
      status: "In Progress",
      milestone: "Initial Design Draft",
      milestoneStatus: "progress"
    };

    setCollaborations([...collaborations, newCollab]);
    setLockedEscrow(prev => prev + pitch.bid);
    
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

  const handleReleaseEscrow = (collabId: number) => {
    const collab = collaborations.find(c => c.id === collabId);
    if (!collab) return;

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
    setLockedEscrow(prev => Math.max(prev - collab.budget, 0));
    setTotalSpent(prev => prev + collab.budget);
    setActiveCollabForReview(null);
  };

  const selectedTender = tenders.find(t => t.id === activeTenderForBids);
  const selectedCollab = collaborations.find(c => c.id === activeCollabForReview);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* Reusable premium navbar */}
      <Navbar />

      {/* DASHBOARD BODY */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Summary Metrics (Spans 4 columns) */}
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
                    {userProfile?.companyName 
                      ? userProfile.companyName.split(" ").slice(0, 2).map(n => n[0]).join("") 
                      : userProfile?.fullName 
                      ? userProfile.fullName.split(" ").slice(0, 2).map(n => n[0]).join("") 
                      : "CL"
                    }
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isUploading} />
              </label>
              <div>
                <h3 className="text-sm font-bold text-foreground">{userProfile?.companyName || userProfile?.fullName || "Alpha Tech Solutions"}</h3>
                <p className="text-[10px] text-neutral-400 font-sans">{userProfile?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-primary/20 text-primary border border-primary/30 text-[8px] uppercase font-bold px-2 py-0.5 tracking-wider">
                    Client Hub
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Escrow ledger stats */}
          <div className="bg-neutral-900/30 p-6 space-y-4">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
              Payments & Escrow Vault
            </span>
            
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Locked in Escrow</span>
                <p className="text-3xl font-bold text-primary font-serif">₦{lockedEscrow.toLocaleString()}</p>
              </div>
              <div className="border-t border-border/20 pt-4">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Total Spent</span>
                <p className="text-xl font-bold text-foreground font-serif">₦{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Quick Hires Status */}
          <div className="bg-neutral-900/30 p-6 space-y-4">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
              Active Hires Overview
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">Active Collaborations</span>
              </div>
              <span className="text-sm font-bold bg-neutral-900 border border-border/20 px-2 py-0.5 font-sans">
                {activeHiresCount}
              </span>
            </div>
          </div>

        </div>

        {/* Right Side: Operations Control Panel (Spans 8 columns) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Collaborations panel */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary shrink-0" />
                Active Collaborations
              </span>
            </h2>

            <div className="space-y-4">
              {collaborations.map((collab) => (
                <div key={collab.id} className="bg-neutral-900/10 hover:bg-neutral-900/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300">
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

                  <div className="flex items-center gap-4 border-t md:border-t-0 border-border/20 pt-4 md:pt-0 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">Budget Locked</span>
                      <span className="text-base font-bold font-serif text-foreground">₦{collab.budget.toLocaleString()}</span>
                    </div>

                    {collab.status === "Deliverable Submitted" && (
                      <button 
                        onClick={() => setActiveCollabForReview(collab.id)}
                        className="bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider px-4 py-2.5 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                      >
                        Review Work
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Tenders panel */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border/20 pb-2">
              <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
                <FolderKanban className="h-6 w-6 text-primary shrink-0" />
                My Project Tenders
              </h2>
              <button 
                onClick={() => setIsPostingTender(!isPostingTender)}
                className="bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-4 py-2 hover:bg-foreground hover:text-background transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Post Project
              </button>
            </div>

            {/* Post Tender Form */}
            {isPostingTender && (
              <form onSubmit={handlePostTender} className="bg-neutral-900/30 p-5 space-y-4 border border-border/30 animate-fade-in">
                <h3 className="text-xs uppercase text-neutral-400 font-bold">Post a New Project Brief</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-neutral-400 font-bold block">Project Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mobile E-commerce Redesign" 
                      required
                      value={newTenderTitle}
                      onChange={(e) => setNewTenderTitle(e.target.value)}
                      className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-neutral-400 font-bold block">Target Budget (₦)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 150000" 
                      required
                      value={newTenderBudget}
                      onChange={(e) => setNewTenderBudget(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-neutral-400 font-bold block">Description Brief</label>
                  <textarea 
                    placeholder="Provide details about requirements, delivery timeline, and preferred skills..."
                    required
                    value={newTenderDesc}
                    onChange={(e) => setNewTenderDesc(e.target.value)}
                    className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary h-24 resize-none"
                  />
                </div>
                <button type="submit" className="bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-6 py-2 hover:bg-foreground hover:text-background transition-colors cursor-pointer">
                  Publish Project Brief
                </button>
              </form>
            )}

            <div className="space-y-4">
              {tenders.map((tender) => (
                <div key={tender.id} className="bg-neutral-900/10 hover:bg-neutral-900/30 p-6 space-y-4 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-lg font-bold">{tender.title}</h3>
                      <p className="text-[10px] text-neutral-400 mt-1 font-sans">
                        Status: <strong className="uppercase">{tender.status}</strong> • Target Budget: ₦{tender.budget.toLocaleString()}
                      </p>
                    </div>
                    {tender.status === "active" && tender.pitches.length > 0 && (
                      <button 
                        onClick={() => setActiveTenderForBids(tender.id)}
                        className="bg-neutral-900 border border-border/30 hover:border-primary hover:text-primary text-[10px] uppercase font-bold px-3 py-1.5 transition-colors cursor-pointer"
                      >
                        View Pitches ({tender.pitches.length})
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* MODAL 1: PITCHES REVIEW PANEL */}
      {activeTenderForBids && selectedTender && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-border/40 max-w-2xl w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto animate-fade-in text-foreground">
            <button 
              onClick={() => setActiveTenderForBids(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block font-sans">Student Pitch Reviews</span>
              <h3 className="font-serif text-xl font-bold leading-snug">{selectedTender.title}</h3>
              <p className="text-xs text-neutral-500 font-light">Target Budget: ₦{selectedTender.budget.toLocaleString()}</p>
            </div>

            <div className="space-y-4 border-t border-border/20 pt-4">
              {selectedTender.pitches.map((pitch) => (
                <div key={pitch.id} className="bg-background/40 p-4 border border-border/30 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold">{pitch.artisanName}</h4>
                      <p className="text-[9px] text-neutral-500 font-sans">{pitch.school} Campus Artisan</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-neutral-500 uppercase block font-sans">Bid Price</span>
                      <strong className="text-primary font-serif">₦{pitch.bid.toLocaleString()}</strong>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 leading-normal font-light">
                    "{pitch.letter}"
                  </p>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[9px] text-neutral-500 font-sans">Delivery Time: {pitch.days} days</span>
                    <button 
                      onClick={() => handleHireArtisan(selectedTender.id, pitch.id)}
                      className="bg-primary text-primary-foreground text-[10px] uppercase tracking-wider font-bold px-4 py-1.5 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                    >
                      Accept Bid & Fund Escrow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONTRACT REVIEW & ESCROW RELEASE */}
      {activeCollabForReview && selectedCollab && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-border/40 max-w-lg w-full p-6 space-y-6 relative animate-fade-in text-foreground">
            <button 
              onClick={() => setActiveCollabForReview(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block font-sans">Contract Escrow Approval</span>
              <h3 className="font-serif text-xl font-bold leading-snug">{selectedCollab.title}</h3>
              <p className="text-xs text-neutral-500 font-light">Artisan Partner: {selectedCollab.artisanName}</p>
            </div>

            <div className="bg-primary/5 p-4 border border-primary/20 space-y-2">
              <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Verified Deliverables Submitted
              </h4>
              <p className="text-[10px] text-neutral-400 leading-normal font-light">
                The student has marked the milestone <strong>{selectedCollab.milestone}</strong> as complete and uploaded final project documents. Please review files and approve escrow release.
              </p>
            </div>

            <div className="border-t border-border/20 pt-6 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">Contract Funds Locked</span>
                <span className="text-xl font-bold font-serif text-foreground">₦{selectedCollab.budget.toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveCollabForReview(null)}
                  className="border border-border text-xs uppercase tracking-wider font-semibold px-4 py-2 hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Request Revisions
                </button>
                <button 
                  onClick={() => handleReleaseEscrow(selectedCollab.id)}
                  className="bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-6 py-2 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                >
                  Release Payout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
