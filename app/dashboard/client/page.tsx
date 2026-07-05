"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Wallet, 
  FolderKanban, 
  Users, 
  Plus, 
  Clock, 
  CheckCircle2, 
  X,
  Sparkles,
  MapPin,
  Camera,
  Loader2
} from "lucide-react";
import { supabase } from "@/components/supabase-client";
import Navbar from "@/components/navbar";
import type { Profile, Order, Project, Proposal } from "@/lib/types";

interface ClientFinancials {
  locked_escrow: number;
  total_spent: number;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Profile
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Data
  const [orders, setOrders] = useState<(Order & { artisan?: Profile })[]>([]);
  const [projects, setProjects] = useState<(Project & { proposals?: (Proposal & { artisan?: Profile })[] })[]>([]);
  const [financials, setFinancials] = useState<ClientFinancials>({ locked_escrow: 0, total_spent: 0 });

  // Modal toggles
  const [activeTenderForBids, setActiveTenderForBids] = useState<string | null>(null);
  const [activeCollabForReview, setActiveCollabForReview] = useState<string | null>(null);
  const [isPostingTender, setIsPostingTender] = useState(false);

  // New tender form
  const [newTenderTitle, setNewTenderTitle] = useState("");
  const [newTenderBudget, setNewTenderBudget] = useState("");
  const [newTenderDesc, setNewTenderDesc] = useState("");
  const [isSavingTender, setIsSavingTender] = useState(false);

  // Fetch helpers
  const fetchOrders = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("orders")
      .select("*, artisan:profiles!orders_artisan_id_fkey(id, full_name, school, avatar_url, rank)")
      .eq("client_id", uid)
      .order("created_at", { ascending: false });
    if (data) setOrders(data as any);
  }, []);

  const fetchProjects = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("projects")
      .select("*, proposals(*, artisan:profiles(id, full_name, school, skills, avg_rating))")
      .eq("client_id", uid)
      .order("created_at", { ascending: false });
    if (data) setProjects(data as any);
  }, []);

  const fetchFinancials = useCallback(async (uid: string) => {
    const { data } = await supabase.rpc("get_client_financials", { uid });
    if (data) {
      setFinancials({
        locked_escrow: data.locked_escrow ?? 0,
        total_spent: data.total_spent ?? 0,
      });
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setPageLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setPageLoading(false); return; }

      setUserId(user.id);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (profileData) setProfile(profileData as Profile);

      await Promise.all([
        fetchOrders(user.id),
        fetchProjects(user.id),
        fetchFinancials(user.id),
      ]);

      setPageLoading(false);
    };
    init();
  }, [fetchOrders, fetchProjects, fetchFinancials]);

  const activeHiresCount = orders.filter(o => o.order_status !== "completed" && o.order_status !== "cancelled").length;

  // Avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `avatars/${userId}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) { alert("Upload failed: " + uploadError.message); return; }
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Post project
  const handlePostTender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenderTitle || !newTenderBudget || !userId) return;
    setIsSavingTender(true);

    const { error } = await supabase.from("projects").insert({
      client_id: userId,
      title: newTenderTitle,
      description: newTenderDesc,
      category: "Code & Dev",
      budget: parseFloat(newTenderBudget),
      school_limit: "Open to All Schools",
    });

    if (error) { alert("Failed: " + error.message); }
    else {
      setNewTenderTitle(""); setNewTenderBudget(""); setNewTenderDesc("");
      setIsPostingTender(false);
      await fetchProjects(userId);
    }
    setIsSavingTender(false);
  };

  // Hire artisan (accept proposal)
  const handleHireArtisan = async (projectId: string, proposal: Proposal & { artisan?: Profile }) => {
    if (!userId) return;
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    // Create order
    const { error: orderError } = await supabase.from("orders").insert({
      client_id: userId,
      artisan_id: proposal.artisan_id,
      project_id: projectId,
      proposal_id: proposal.id,
      title: project.title,
      amount: proposal.bid_price,
      escrow_status: "locked",
      order_status: "in_progress",
      milestone: "Initial Draft",
    });
    if (orderError) { alert("Failed to hire: " + orderError.message); return; }

    // Accept this proposal, reject others
    await supabase.from("proposals").update({ status: "accepted" }).eq("id", proposal.id);
    await supabase.from("proposals").update({ status: "rejected" }).eq("project_id", projectId).neq("id", proposal.id);
    await supabase.from("projects").update({ status: "hired" }).eq("id", projectId);

    setActiveTenderForBids(null);
    await Promise.all([fetchOrders(userId), fetchProjects(userId), fetchFinancials(userId)]);
  };

  // Release escrow
  const handleReleaseEscrow = async (orderId: string) => {
    if (!userId) return;
    await supabase.from("orders").update({
      escrow_status: "released",
      order_status: "completed",
      completed_at: new Date().toISOString(),
    }).eq("id", orderId);

    setActiveCollabForReview(null);
    await Promise.all([fetchOrders(userId), fetchFinancials(userId)]);
  };

  const selectedTender = projects.find(p => p.id === activeTenderForBids);
  const selectedCollab = orders.find(o => o.id === activeCollabForReview);

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile */}
          <div className="bg-neutral-900/30 p-6 space-y-4">
            <div className="flex items-center gap-4">
              <label className="cursor-pointer block relative h-14 w-14 rounded-full overflow-hidden border border-border/40 hover:border-primary transition-all duration-300">
                {isUploading ? (
                  <div className="h-full w-full bg-neutral-900 flex items-center justify-center">
                    <span className="inline-block h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
                    {(profile?.company_name || profile?.full_name || "CL").substring(0, 2)}
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isUploading} />
              </label>
              <div>
                <h3 className="text-sm font-bold">{profile?.company_name || profile?.full_name || "Client"}</h3>
                <p className="text-[10px] text-neutral-400">{profile?.email}</p>
                <span className="bg-primary/20 text-primary border border-primary/30 text-[8px] uppercase font-bold px-2 py-0.5 tracking-wider mt-1 inline-block">
                  Client Hub
                </span>
              </div>
            </div>
          </div>

          {/* Financials */}
          <div className="bg-neutral-900/30 p-6 space-y-4">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
              Payments & Escrow Vault
            </span>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Locked in Escrow</span>
                <p className="text-3xl font-bold text-primary font-serif">₦{financials.locked_escrow.toLocaleString()}</p>
              </div>
              <div className="border-t border-border/20 pt-4">
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Total Spent</span>
                <p className="text-xl font-bold text-foreground font-serif">₦{financials.total_spent.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Active Hires */}
          <div className="bg-neutral-900/30 p-6 space-y-4">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">Active Hires</span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold">Active Contracts</span>
              </div>
              <span className="text-sm font-bold bg-neutral-900 border border-border/20 px-2 py-0.5">{activeHiresCount}</span>
            </div>
          </div>
        </div>

        {/* Right: Operations */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Active Orders */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-primary shrink-0" />
              Active Collaborations
            </h2>

            {orders.length === 0 ? (
              <div className="bg-neutral-900/30 p-8 text-center">
                <p className="text-xs text-neutral-400">No active contracts yet. Post a project or hire from the marketplace!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-neutral-900/10 hover:bg-neutral-900/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
                          {order.gig_id ? "Gig Hire" : order.product_id ? "Product" : "Project"}
                        </span>
                        {order.artisan?.school && <span className="text-[10px] text-neutral-400">{order.artisan.school}</span>}
                      </div>
                      <h3 className="font-serif text-lg font-bold">{order.title}</h3>
                      <p className="text-xs text-neutral-500">Artisan: <strong>{order.artisan?.full_name || "—"}</strong></p>
                      <div className="flex items-center gap-2 text-[10px] pt-1">
                        {order.order_status === "completed" ? (
                          <span className="flex items-center gap-1 text-green-500 font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Completed & Paid
                          </span>
                        ) : order.order_status === "delivered" ? (
                          <span className="flex items-center gap-1 text-yellow-500 font-semibold animate-pulse">
                            <Clock className="h-3.5 w-3.5" /> Review Pending: {order.milestone}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-neutral-400">
                            <Clock className="h-3.5 w-3.5" /> In Progress: {order.milestone || "Working"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 border-t md:border-t-0 border-border/20 pt-4 md:pt-0 shrink-0">
                      <div className="text-left md:text-right">
                        <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">Budget</span>
                        <span className="text-base font-bold font-serif">₦{order.amount.toLocaleString()}</span>
                      </div>
                      {order.order_status === "delivered" && (
                        <button
                          onClick={() => setActiveCollabForReview(order.id)}
                          className="bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wider px-4 py-2.5 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                        >
                          Review Work
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projects / Tenders */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border/20 pb-2">
              <h2 className="font-serif text-2xl font-bold flex items-center gap-2">
                <FolderKanban className="h-6 w-6 text-primary shrink-0" /> My Projects
              </h2>
              <button
                onClick={() => setIsPostingTender(!isPostingTender)}
                className="bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-4 py-2 hover:bg-foreground hover:text-background transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Post Project
              </button>
            </div>

            {isPostingTender && (
              <form onSubmit={handlePostTender} className="bg-neutral-900/30 p-5 space-y-4 border border-border/30">
                <h3 className="text-xs uppercase text-neutral-400 font-bold">Post a New Project Brief</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-neutral-400 font-bold block">Project Title</label>
                    <input type="text" required value={newTenderTitle} onChange={(e) => setNewTenderTitle(e.target.value)}
                      placeholder="e.g. Mobile E-commerce Redesign"
                      className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-neutral-400 font-bold block">Target Budget (₦)</label>
                    <input type="text" required value={newTenderBudget} onChange={(e) => setNewTenderBudget(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="e.g. 150000"
                      className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-neutral-400 font-bold block">Description</label>
                  <textarea required value={newTenderDesc} onChange={(e) => setNewTenderDesc(e.target.value)}
                    placeholder="Provide details about requirements, timeline, and preferred skills..."
                    className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary h-24 resize-none" />
                </div>
                <button type="submit" disabled={isSavingTender}
                  className="bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-6 py-2 hover:bg-foreground hover:text-background transition-colors cursor-pointer disabled:opacity-50">
                  {isSavingTender ? "Publishing..." : "Publish Project Brief"}
                </button>
              </form>
            )}

            {projects.length === 0 ? (
              <div className="bg-neutral-900/30 p-8 text-center">
                <p className="text-xs text-neutral-400">No projects posted yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="bg-neutral-900/10 hover:bg-neutral-900/30 p-6 space-y-4 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-serif text-lg font-bold">{proj.title}</h3>
                        <p className="text-[10px] text-neutral-400 mt-1">
                          Status: <strong className="uppercase">{proj.status}</strong> • Budget: ₦{proj.budget.toLocaleString()}
                        </p>
                      </div>
                      {proj.status === "open" && proj.proposals && proj.proposals.length > 0 && (
                        <button
                          onClick={() => setActiveTenderForBids(proj.id)}
                          className="bg-neutral-900 border border-border/30 hover:border-primary hover:text-primary text-[10px] uppercase font-bold px-3 py-1.5 transition-colors cursor-pointer"
                        >
                          View Pitches ({proj.proposals.length})
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL: Pitches Review */}
      {activeTenderForBids && selectedTender && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-border/40 max-w-2xl w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto text-foreground">
            <button onClick={() => setActiveTenderForBids(null)} className="absolute top-4 right-4 text-neutral-400 hover:text-primary cursor-pointer">
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">Student Pitch Reviews</span>
              <h3 className="font-serif text-xl font-bold">{selectedTender.title}</h3>
              <p className="text-xs text-neutral-500">Budget: ₦{selectedTender.budget.toLocaleString()}</p>
            </div>
            <div className="space-y-4 border-t border-border/20 pt-4">
              {(selectedTender.proposals || []).filter(p => (p as Proposal).status === "pending").map((pitch) => {
                const p = pitch as Proposal & { artisan?: Profile };
                return (
                  <div key={p.id} className="bg-background/40 p-4 border border-border/30 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold">{p.artisan?.full_name || "Artisan"}</h4>
                        <p className="text-[9px] text-neutral-500">{p.artisan?.school || "Campus"}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-neutral-500 uppercase block">Bid</span>
                        <strong className="text-primary font-serif">₦{p.bid_price.toLocaleString()}</strong>
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400 leading-normal font-light">"{p.cover_letter}"</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[9px] text-neutral-500">Delivery: {p.delivery_days} days</span>
                      <button
                        onClick={() => handleHireArtisan(selectedTender.id, p)}
                        className="bg-primary text-primary-foreground text-[10px] uppercase tracking-wider font-bold px-4 py-1.5 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                      >
                        Accept & Fund Escrow
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Escrow Release */}
      {activeCollabForReview && selectedCollab && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-border/40 max-w-lg w-full p-6 space-y-6 relative text-foreground">
            <button onClick={() => setActiveCollabForReview(null)} className="absolute top-4 right-4 text-neutral-400 hover:text-primary cursor-pointer">
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">Escrow Approval</span>
              <h3 className="font-serif text-xl font-bold">{selectedCollab.title}</h3>
              <p className="text-xs text-neutral-500">Artisan: {(selectedCollab as any).artisan?.full_name}</p>
            </div>
            <div className="bg-primary/5 p-4 border border-primary/20 space-y-2">
              <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> Deliverables Submitted
              </h4>
              <p className="text-[10px] text-neutral-400 leading-normal">
                The artisan has submitted milestone <strong>{selectedCollab.milestone}</strong>. Review and approve to release payment.
              </p>
            </div>
            <div className="border-t border-border/20 pt-6 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-wider block">Locked</span>
                <span className="text-xl font-bold font-serif">₦{selectedCollab.amount.toLocaleString()}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setActiveCollabForReview(null)}
                  className="border border-border text-xs uppercase tracking-wider font-semibold px-4 py-2 hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer">
                  Request Revisions
                </button>
                <button onClick={() => handleReleaseEscrow(selectedCollab.id)}
                  className="bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-6 py-2 hover:bg-foreground hover:text-background transition-colors cursor-pointer">
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
