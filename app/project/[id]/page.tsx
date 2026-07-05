"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Wallet,
  GraduationCap,
  CheckCircle,
  Send,
  Loader2,
  Briefcase
} from "lucide-react";
import { supabase } from "@/components/supabase-client";
import Navbar from "@/components/navbar";
import type { Project, Proposal, Profile } from "@/lib/types";

export default function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = React.use(props.params);
  const router = useRouter();
  const [project, setProject] = useState<(Project & { client: Profile }) | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [existingProposal, setExistingProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Proposal form state
  const [bidPrice, setBidPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: projectData } = await supabase
        .from("projects")
        .select("*, client:profiles(*)")
        .eq("id", id)
        .single();

      if (projectData) setProject(projectData as any);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (profile) setCurrentProfile(profile as Profile);

        // Check if user already proposed
        const { data: proposal } = await supabase
          .from("proposals")
          .select("*")
          .eq("project_id", id)
          .eq("artisan_id", user.id)
          .maybeSingle();
        if (proposal) setExistingProposal(proposal as Proposal);
      }

      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !bidPrice || !deliveryDays || !coverLetter) return;
    setSubmitting(true);

    const { error } = await supabase.from("proposals").insert({
      project_id: id,
      artisan_id: currentUser.id,
      bid_price: parseFloat(bidPrice),
      delivery_days: parseInt(deliveryDays),
      cover_letter: coverLetter,
    });

    if (error) {
      alert("Failed to submit proposal: " + error.message);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-neutral-400 text-sm">Project not found.</p>
          <Link href="/marketplace?tab=exchange" className="text-primary text-xs underline">Back to Exchange</Link>
        </div>
      </div>
    );
  }

  const client = project.client;
  const isOwnProject = currentUser?.id === project.client_id;
  const isArtisan = currentProfile?.role === "student";
  const alreadyProposed = !!existingProposal || submitted;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-[10px] text-neutral-400 mb-6">
          <Link href="/marketplace?tab=exchange" className="hover:text-primary transition-colors">The Exchange</Link>
          <span>/</span>
          <span className="text-foreground">{project.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: Project Brief */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] uppercase font-bold px-2 py-0.5 tracking-wider">
                  {project.category}
                </span>
                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 border ${
                  project.status === "open"
                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                    : "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
                }`}>
                  {project.status}
                </span>
              </div>
              <h1 className="font-serif text-3xl font-bold leading-tight">{project.title}</h1>
            </div>

            {/* Full Description */}
            <div className="bg-neutral-900/30 p-6 space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
                Project Brief
              </span>
              <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {project.description || "No description provided."}
              </p>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-neutral-900/30 p-5 space-y-1">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-[10px] uppercase text-neutral-400 font-bold block">Budget</span>
                <span className="text-lg font-bold font-serif">₦{project.budget.toLocaleString()}</span>
              </div>
              <div className="bg-neutral-900/30 p-5 space-y-1">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-[10px] uppercase text-neutral-400 font-bold block">Deadline</span>
                <span className="text-lg font-bold font-serif">{project.deadline_days} days</span>
              </div>
              <div className="bg-neutral-900/30 p-5 space-y-1">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span className="text-[10px] uppercase text-neutral-400 font-bold block">School Limit</span>
                <span className="text-sm font-semibold">{project.school_limit}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">

              {/* Client Card */}
              {client && (
                <div className="bg-neutral-900/30 p-6 space-y-4">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
                    Posted By
                  </span>
                  <div className="flex items-center gap-3">
                    {client.avatar_url ? (
                      <img src={client.avatar_url} alt={client.full_name} className="h-12 w-12 rounded-full object-cover border border-border/40" />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
                        {(client.company_name || client.full_name)?.substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold">{client.company_name || client.full_name}</h3>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        <Briefcase className="h-3 w-3 inline mr-1" />
                        Client
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/profile/${client.id}`}
                    className="block text-center border border-border/30 hover:border-primary text-xs uppercase tracking-wider font-semibold px-4 py-2.5 transition-colors"
                  >
                    View Client Profile
                  </Link>
                </div>
              )}

              {/* Proposal Form / Status */}
              {!currentUser ? (
                <div className="bg-neutral-900/30 p-6 space-y-3">
                  <Link
                    href="/auth/login"
                    className="block text-center bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-4 py-3 hover:bg-foreground hover:text-background transition-colors"
                  >
                    Sign In to Submit Proposal
                  </Link>
                </div>
              ) : isOwnProject ? (
                <div className="bg-neutral-900/30 p-6 text-center space-y-2">
                  <Briefcase className="h-6 w-6 text-primary mx-auto" />
                  <p className="text-xs text-neutral-400">This is your project.</p>
                  <Link
                    href="/dashboard/client"
                    className="block text-center bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-4 py-2.5 hover:bg-foreground hover:text-background transition-colors"
                  >
                    View Proposals in Dashboard
                  </Link>
                </div>
              ) : !isArtisan ? (
                <div className="bg-neutral-900/30 p-6 text-center">
                  <p className="text-xs text-neutral-500">Only artisan accounts can submit proposals.</p>
                </div>
              ) : alreadyProposed ? (
                <div className="bg-green-500/5 border border-green-500/20 p-6 text-center space-y-2">
                  <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                  <h4 className="text-xs font-bold text-green-500">Proposal Submitted</h4>
                  <p className="text-[10px] text-neutral-400">
                    Your bid is under review by the client. You'll be notified when they respond.
                  </p>
                </div>
              ) : project.status === "open" ? (
                <form onSubmit={handleSubmitProposal} className="bg-neutral-900/30 p-6 space-y-4">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
                    Submit Your Proposal
                  </span>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-neutral-400 font-bold block">Your Bid Price (₦)</label>
                    <input
                      type="text"
                      required
                      value={bidPrice}
                      onChange={(e) => setBidPrice(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="e.g. 100000"
                      className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-neutral-400 font-bold block">Delivery (Days)</label>
                    <input
                      type="text"
                      required
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="e.g. 5"
                      className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] uppercase text-neutral-400 font-bold block">Cover Letter</label>
                    <textarea
                      required
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Explain why you're a great fit for this project..."
                      className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary h-28 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-4 py-3 hover:bg-foreground hover:text-background transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    {submitting ? "Submitting..." : "Submit Proposal"}
                  </button>
                </form>
              ) : (
                <div className="bg-neutral-900/30 p-6 text-center">
                  <p className="text-xs text-neutral-500">This project is no longer accepting proposals.</p>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
