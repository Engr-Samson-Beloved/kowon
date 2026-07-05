"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/components/supabase-client";
import Navbar from "@/components/navbar";
import type { Profile, Gig, Product, Review, Project } from "@/lib/types";
import {
  Star,
  MapPin,
  GraduationCap,
  ExternalLink,
  Shield,
  ShieldCheck,
  Briefcase,
  Package,
  MessageSquare,
  Edit3,
  Award,
  Loader2,
  AlertCircle,
  Phone,
  Globe,
  Clock,
  ChevronRight,
} from "lucide-react";

type Tab = "gigs" | "products" | "reviews" | "projects";

const RANK_COLORS: Record<string, string> = {
  Bronze: "bg-amber-700/20 text-amber-500 border-amber-700/30",
  Silver: "bg-neutral-400/20 text-neutral-300 border-neutral-400/30",
  "Gold Pro": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export default function PublicProfilePage(props: { params: Promise<{ id: string }> }) {
  const { id } = React.use(props.params);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Student data
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<(Review & { reviewer?: Profile })[]>([]);

  // Client data
  const [projects, setProjects] = useState<Project[]>([]);

  const [activeTab, setActiveTab] = useState<Tab>("gigs");

  useEffect(() => {
    const load = async () => {
      // Get current user (optional, for showing edit button)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUserId(user?.id ?? null);

      // Fetch profile
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !profileData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      if (profileData.role === "student") {
        // Fetch gigs
        const { data: gigsData } = await supabase
          .from("gigs")
          .select("*")
          .eq("artisan_id", id)
          .eq("is_active", true)
          .order("created_at", { ascending: false });
        setGigs(gigsData || []);

        // Fetch products
        const { data: productsData } = await supabase
          .from("products")
          .select("*")
          .eq("artisan_id", id)
          .eq("is_active", true)
          .order("created_at", { ascending: false });
        setProducts(productsData || []);

        // Fetch reviews
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("*, reviewer:profiles!reviewer_id(*)")
          .eq("reviewee_id", id)
          .order("created_at", { ascending: false });
        setReviews(reviewsData || []);

        setActiveTab("gigs");
      } else {
        // Client — fetch open projects
        const { data: projectsData } = await supabase
          .from("projects")
          .select("*, proposals(count)")
          .eq("client_id", id)
          .eq("status", "open")
          .order("created_at", { ascending: false });
        setProjects(projectsData || []);

        setActiveTab("projects");
      }

      setLoading(false);
    };

    load();
  }, [id]);

  const isOwn = currentUserId === id;

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <AlertCircle className="h-10 w-10 text-neutral-500" />
          <p className="text-sm text-neutral-400">Profile not found.</p>
          <Link
            href="/"
            className="bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const studentTabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "gigs", label: "Gigs", icon: <Briefcase className="h-3.5 w-3.5" />, count: gigs.length },
    { key: "products", label: "Products", icon: <Package className="h-3.5 w-3.5" />, count: products.length },
    { key: "reviews", label: "Reviews", icon: <MessageSquare className="h-3.5 w-3.5" />, count: reviews.length },
  ];

  const clientTabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "projects", label: "Open Projects", icon: <Briefcase className="h-3.5 w-3.5" />, count: projects.length },
  ];

  const tabs = profile.role === "student" ? studentTabs : clientTabs;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-neutral-600"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          {/* Left Column — Profile Card (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Profile Card */}
            <div className="bg-neutral-900/30 p-6">
              <div className="flex flex-col items-center text-center">
                {/* Avatar */}
                <div className="h-24 w-24 rounded-full bg-neutral-800 border-2 border-border/30 overflow-hidden mb-4">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-primary">
                      {profile.full_name?.substring(0, 2).toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                {/* Name */}
                <h1 className="font-serif text-2xl font-bold">{profile.full_name}</h1>

                {/* School */}
                {profile.school && (
                  <div className="flex items-center gap-1.5 text-neutral-400 text-xs mt-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {profile.school}
                  </div>
                )}

                {/* Skill Category */}
                {profile.skill_category && (
                  <p className="text-xs text-primary mt-1">{profile.skill_category}</p>
                )}

                {/* Badges */}
                <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
                  {/* Rank Badge */}
                  <span
                    className={`text-[9px] uppercase font-bold px-2 py-0.5 border flex items-center gap-1 ${
                      RANK_COLORS[profile.rank] || RANK_COLORS["Bronze"]
                    }`}
                  >
                    <Award className="h-2.5 w-2.5" />
                    {profile.rank}
                  </span>

                  {/* Verified Badge */}
                  {profile.is_verified && (
                    <span className="bg-green-500/20 text-green-400 border border-green-500/30 text-[9px] uppercase font-bold px-2 py-0.5 flex items-center gap-1">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      Verified
                    </span>
                  )}

                  {!profile.is_verified && (
                    <span className="bg-neutral-700/30 text-neutral-500 border border-neutral-600/30 text-[9px] uppercase font-bold px-2 py-0.5 flex items-center gap-1">
                      <Shield className="h-2.5 w-2.5" />
                      Unverified
                    </span>
                  )}
                </div>

                {/* Rating */}
                {profile.role === "student" && (
                  <div className="flex items-center gap-2 mt-3">
                    {renderStars(profile.avg_rating)}
                    <span className="text-[10px] text-neutral-400">
                      {profile.avg_rating.toFixed(1)} ({profile.total_reviews})
                    </span>
                  </div>
                )}

                {/* Edit Button (own profile) */}
                {isOwn && (
                  <Link
                    href="/profile/edit"
                    className="mt-4 bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-4 py-2 hover:bg-foreground hover:text-background transition-colors cursor-pointer flex items-center gap-2 w-full justify-center"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="bg-neutral-900/30 p-6">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block mb-3">
                  About
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Stats */}
            {profile.role === "student" && (
              <div className="bg-neutral-900/30 p-6">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block mb-4">
                  Stats
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xl font-bold">{profile.completed_jobs}</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Jobs Done</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">₦{profile.total_earnings.toLocaleString()}</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Earned</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{profile.avg_rating.toFixed(1)}</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Avg Rating</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{profile.total_reviews}</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Reviews</p>
                  </div>
                </div>
              </div>
            )}

            {profile.role === "client" && (
              <div className="bg-neutral-900/30 p-6">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block mb-4">
                  Stats
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xl font-bold">₦{profile.total_spent.toLocaleString()}</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Total Spent</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{projects.length}</p>
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Open Projects</p>
                  </div>
                </div>
              </div>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-neutral-900/30 p-6">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block mb-3">
                  Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-primary/20 text-primary border border-primary/30 text-[9px] uppercase font-bold px-2 py-0.5"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-neutral-900/30 p-6">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block mb-3">
                Contact
              </span>
              <div className="space-y-2.5">
                {profile.location && (
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <MapPin className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                    {profile.location}
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-2 text-xs text-neutral-300">
                    <Phone className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                    {profile.phone}
                  </div>
                )}
                {profile.portfolio_url && (
                  <a
                    href={profile.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    Portfolio
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
                {profile.created_at && (
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    Joined {new Date(profile.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "short" })}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Right Column — Tabbed Content (8 cols) */}
          <section className="lg:col-span-8 space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-border/20 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold px-4 py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  <span className="text-[10px] ml-1 text-neutral-500">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Gigs Tab */}
            {activeTab === "gigs" && (
              <div className="space-y-4">
                {gigs.length === 0 ? (
                  <EmptyState icon={<Briefcase className="h-8 w-8" />} message="No gigs listed yet." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gigs.map((gig) => (
                      <Link
                        key={gig.id}
                        href={`/gig/${gig.id}`}
                        className="bg-neutral-900/30 p-5 hover:bg-neutral-900/50 transition-colors group block"
                      >
                        {gig.image_url && (
                          <div className="w-full h-36 mb-3 overflow-hidden bg-neutral-800">
                            <img
                              src={gig.image_url}
                              alt={gig.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">
                          {gig.category}
                        </p>
                        <h3 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">
                          {gig.title}
                        </h3>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1">
                            {renderStars(gig.avg_rating)}
                            <span className="text-[10px] text-neutral-500">({gig.total_reviews})</span>
                          </div>
                          <span className="text-xs font-bold text-primary">
                            From ₦{gig.starting_price.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-[10px] text-neutral-500">
                          <span>{gig.delivery_days} day{gig.delivery_days !== 1 ? "s" : ""} delivery</span>
                          <span>{gig.total_orders} order{gig.total_orders !== 1 ? "s" : ""}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div className="space-y-4">
                {products.length === 0 ? (
                  <EmptyState icon={<Package className="h-8 w-8" />} message="No products listed yet." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="bg-neutral-900/30 p-5 hover:bg-neutral-900/50 transition-colors group block"
                      >
                        {product.image_url && (
                          <div className="w-full h-36 mb-3 overflow-hidden bg-neutral-800">
                            <img
                              src={product.image_url}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">
                          {product.category}
                        </p>
                        <h3 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">
                          {product.title}
                        </h3>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs font-bold text-primary">
                            ₦{product.price.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {product.in_stock > 0 ? `${product.in_stock} in stock` : "Out of stock"}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-1">
                          {product.total_sold} sold
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <EmptyState icon={<MessageSquare className="h-8 w-8" />} message="No reviews yet." />
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-neutral-900/30 p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-primary border border-border/30">
                            {review.reviewer?.full_name?.substring(0, 2).toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="text-xs font-semibold">
                              {review.reviewer?.full_name || "Anonymous"}
                            </p>
                            <p className="text-[10px] text-neutral-500">
                              {new Date(review.created_at).toLocaleDateString("en-NG", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        {renderStars(review.rating)}
                      </div>
                      {review.comment && (
                        <p className="text-xs text-neutral-300 mt-3 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Projects Tab (Client) */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                {projects.length === 0 ? (
                  <EmptyState icon={<Briefcase className="h-8 w-8" />} message="No open projects." />
                ) : (
                  projects.map((project) => {
                    const proposalCount = Array.isArray(project.proposals)
                      ? project.proposals.length > 0 && typeof project.proposals[0] === "object" && "count" in project.proposals[0]
                        ? (project.proposals[0] as { count: number }).count
                        : project.proposals.length
                      : 0;

                    return (
                      <div
                        key={project.id}
                        className="bg-neutral-900/30 p-5 hover:bg-neutral-900/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">
                              {project.category}
                            </p>
                            <h3 className="text-sm font-semibold">{project.title}</h3>
                            <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2">
                              {project.description}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-neutral-600 shrink-0 ml-4" />
                        </div>
                        <div className="flex items-center gap-4 mt-4 text-[10px] text-neutral-500">
                          <span className="font-bold text-primary text-xs">
                            ₦{project.budget.toLocaleString()}
                          </span>
                          <span>{project.deadline_days} day deadline</span>
                          <span>{proposalCount} proposal{proposalCount !== 1 ? "s" : ""}</span>
                          <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] uppercase font-bold px-2 py-0.5">
                            {project.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="bg-neutral-900/30 p-12 flex flex-col items-center justify-center text-neutral-500">
      {icon}
      <p className="text-xs mt-3">{message}</p>
    </div>
  );
}
