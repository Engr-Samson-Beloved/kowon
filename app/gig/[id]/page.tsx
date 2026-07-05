"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Clock,
  MapPin,
  CheckCircle,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { supabase } from "@/components/supabase-client";
import Navbar from "@/components/navbar";
import type { Gig, Review, Profile } from "@/lib/types";

export default function GigDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = React.use(props.params);
  const router = useRouter();
  const [gig, setGig] = useState<(Gig & { artisan: Profile }) | null>(null);
  const [reviews, setReviews] = useState<(Review & { reviewer: Pick<Profile, "full_name" | "avatar_url"> })[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch gig with artisan profile
      const { data: gigData } = await supabase
        .from("gigs")
        .select("*, artisan:profiles(*)")
        .eq("id", id)
        .single();

      if (gigData) {
        setGig(gigData as any);

        // Fetch reviews for this artisan
        const { data: reviewData } = await supabase
          .from("reviews")
          .select("*, reviewer:profiles(full_name, avatar_url)")
          .eq("reviewee_id", gigData.artisan_id)
          .order("created_at", { ascending: false })
          .limit(10);

        if (reviewData) setReviews(reviewData as any);
      }

      // Check current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (profile) setCurrentProfile(profile as Profile);
      }

      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleHire = async () => {
    if (!currentUser || !gig) return;
    setHiring(true);

    const { error } = await supabase.from("orders").insert({
      client_id: currentUser.id,
      artisan_id: gig.artisan_id,
      gig_id: gig.id,
      title: gig.title,
      amount: gig.starting_price,
      escrow_status: "locked",
      order_status: "in_progress",
      milestone: "Initial Delivery",
    });

    if (error) {
      alert("Failed to create order: " + error.message);
      setHiring(false);
      return;
    }

    router.push("/dashboard/client");
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-neutral-600"}`}
      />
    ));
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

  if (!gig) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-neutral-400 text-sm">Gig not found.</p>
          <Link href="/marketplace" className="text-primary text-xs underline">Back to Marketplace</Link>
        </div>
      </div>
    );
  }

  const artisan = gig.artisan;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] text-neutral-400 mb-6">
          <Link href="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
          <span>/</span>
          <span className="text-foreground">{gig.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: Gig Details */}
          <div className="lg:col-span-8 space-y-8">

            {/* Title & Category */}
            <div className="space-y-3">
              <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] uppercase font-bold px-2 py-0.5 tracking-wider">
                {gig.category}
              </span>
              <h1 className="font-serif text-3xl font-bold leading-tight">{gig.title}</h1>
              <div className="flex items-center gap-4 text-xs text-neutral-400">
                <div className="flex items-center gap-1">
                  {renderStars(gig.avg_rating)}
                  <span className="ml-1 font-semibold text-foreground">{gig.avg_rating}</span>
                  <span>({gig.total_reviews} reviews)</span>
                </div>
                <span>•</span>
                <span>{gig.total_orders} orders completed</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-neutral-900/30 p-6 space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
                About This Service
              </span>
              <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {gig.description || "No description provided yet."}
              </p>
            </div>

            {/* Skills */}
            {gig.skills && gig.skills.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
                  Skills & Tools
                </span>
                <div className="flex flex-wrap gap-2">
                  {gig.skills.map((skill) => (
                    <span key={skill} className="bg-neutral-900/30 text-xs px-3 py-1.5 text-neutral-300 font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Info */}
            <div className="bg-neutral-900/30 p-6 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <span className="text-[10px] uppercase text-neutral-400 font-bold block">Delivery Time</span>
                  <span className="text-sm font-semibold">{gig.delivery_days} days</span>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-bold">Reviews ({reviews.length})</h2>

              {reviews.length === 0 ? (
                <div className="bg-neutral-900/30 p-8 text-center">
                  <p className="text-xs text-neutral-400">No reviews yet for this artisan.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-neutral-900/10 hover:bg-neutral-900/30 p-5 space-y-2 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[9px] font-bold uppercase">
                            {review.reviewer?.full_name?.substring(0, 2) || "?"}
                          </div>
                          <div>
                            <span className="text-xs font-semibold">{review.reviewer?.full_name}</span>
                            <div className="flex items-center gap-0.5 mt-0.5">{renderStars(review.rating)}</div>
                          </div>
                        </div>
                        <span className="text-[9px] text-neutral-500 font-sans">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-xs text-neutral-400 leading-relaxed pl-9">"{review.comment}"</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Sticky Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">

              {/* Pricing Card */}
              <div className="bg-neutral-900/30 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                    Starting Price
                  </span>
                  <span className="text-2xl font-bold font-serif text-primary">
                    ₦{gig.starting_price.toLocaleString()}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Delivery in {gig.delivery_days} days
                </div>

                {/* CTA */}
                {!currentUser ? (
                  <Link
                    href="/auth/login"
                    className="block text-center bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-4 py-3 hover:bg-foreground hover:text-background transition-colors"
                  >
                    Sign In to Hire
                  </Link>
                ) : currentProfile?.role === "client" ? (
                  <button
                    onClick={handleHire}
                    disabled={hiring}
                    className="w-full bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-4 py-3 hover:bg-foreground hover:text-background transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {hiring ? "Creating Order..." : "Hire This Talent"}
                  </button>
                ) : (
                  <div className="text-center text-[10px] text-neutral-500 py-2">
                    Switch to a Client account to hire.
                  </div>
                )}
              </div>

              {/* Artisan Profile Card */}
              <div className="bg-neutral-900/30 p-6 space-y-4">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
                  About the Artisan
                </span>

                <div className="flex items-center gap-3">
                  {artisan.avatar_url ? (
                    <img src={artisan.avatar_url} alt={artisan.full_name} className="h-12 w-12 rounded-full object-cover border border-border/40" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
                      {artisan.full_name?.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold">{artisan.full_name}</h3>
                      {artisan.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {artisan.school || "Nigeria"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] text-neutral-400">
                  <div className="flex items-center gap-1">
                    {renderStars(artisan.avg_rating)}
                    <span className="font-semibold text-foreground ml-1">{artisan.avg_rating}</span>
                  </div>
                  <span>•</span>
                  <span>{artisan.completed_jobs} jobs done</span>
                </div>

                <span className={`text-[9px] uppercase font-bold px-2 py-0.5 border inline-block ${
                  artisan.rank === "Gold Pro"
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    : artisan.rank === "Silver"
                    ? "bg-slate-400/10 text-slate-400 border-slate-400/20"
                    : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                }`}>
                  {artisan.rank} Badge
                </span>

                <Link
                  href={`/profile/${artisan.id}`}
                  className="block text-center border border-border/30 hover:border-primary text-xs uppercase tracking-wider font-semibold px-4 py-2.5 transition-colors"
                >
                  View Full Profile
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
