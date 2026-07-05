// ============================================================
// KÓ WON — Shared TypeScript Type Definitions
// Maps 1:1 with Supabase database tables
// ============================================================

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  role: "student" | "client";
  school: string | null;
  skill_category: string | null;
  company_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  portfolio_url: string | null;
  phone: string | null;
  location: string | null;
  rank: "Bronze" | "Silver" | "Gold Pro";
  is_verified: boolean;
  is_subscribed: boolean;
  skills: string[];
  completed_jobs: number;
  avg_rating: number;
  total_reviews: number;
  total_earnings: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Gig {
  id: string;
  artisan_id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  starting_price: number;
  delivery_days: number;
  image_url: string | null;
  is_active: boolean;
  avg_rating: number;
  total_reviews: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
  // Joined relation
  artisan?: Profile;
}

export interface Product {
  id: string;
  artisan_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image_url: string | null;
  in_stock: number;
  is_active: boolean;
  total_sold: number;
  created_at: string;
  updated_at: string;
  // Joined relation
  artisan?: Profile;
}

export interface Project {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  school_limit: string;
  deadline_days: number;
  status: "open" | "hired" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
  // Joined relations
  client?: Profile;
  proposals?: Proposal[] | { count: number }[];
}

export interface Proposal {
  id: string;
  project_id: string;
  artisan_id: string;
  bid_price: number;
  delivery_days: number;
  cover_letter: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  created_at: string;
  // Joined relations
  artisan?: Profile;
  project?: Project;
}

export interface Order {
  id: string;
  client_id: string;
  artisan_id: string;
  gig_id: string | null;
  product_id: string | null;
  project_id: string | null;
  proposal_id: string | null;
  title: string;
  amount: number;
  escrow_status: "locked" | "released" | "refunded" | "disputed";
  order_status: "in_progress" | "delivered" | "revision" | "completed" | "cancelled";
  milestone: string | null;
  delivery_deadline: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  client?: Profile;
  artisan?: Profile;
  gig?: Gig;
  product?: Product;
  project?: Project;
}

export interface Review {
  id: string;
  order_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // Joined relations
  reviewer?: Profile;
  reviewee?: Profile;
  order?: Order;
}

export interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  content: string;
  attachment_url: string | null;
  attachment_name: string | null;
  is_system: boolean;
  created_at: string;
  // Joined relation
  sender?: Profile;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  document_url: string;
  status: "pending" | "approved" | "rejected";
  reviewed_at: string | null;
  created_at: string;
}

// ============================================================
// UI Helper Types
// ============================================================

export type GigCategory =
  | "Code & Dev"
  | "Fashion & Crafts"
  | "Visual Media"
  | "Beauty & Style"
  | "Technical Services"
  | "Academics";

export const GIG_CATEGORIES: GigCategory[] = [
  "Code & Dev",
  "Fashion & Crafts",
  "Visual Media",
  "Beauty & Style",
  "Technical Services",
  "Academics",
];

export const SCHOOLS_FILTER = [
  "All",
  "UNILAG",
  "UI",
  "OAU",
  "UNIBEN",
  "FUTA",
  "UNILORIN",
  "ABU",
  "UNN",
  "LASU",
] as const;

export const NIGERIAN_UNIVERSITIES = [
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "Obafemi Awolowo University (OAU)",
  "Federal University of Technology Akure (FUTA)",
  "University of Benin (UNIBEN)",
  "University of Ilorin (UNILORIN)",
  "Ahmadu Bello University (ABU)",
  "University of Nigeria Nsukka (UNN)",
  "Lagos State University (LASU)",
  "Covenant University",
  "Babcock University",
  "Federal University of Technology Owerri (FUTO)",
] as const;

export const SKILL_CATEGORIES = [
  "Code & Web Development",
  "Tailoring & Fashion Design",
  "Photography & Editing",
  "Hairstyling & Makeup Glam",
  "Tutoring & Academic Writing",
  "Electrical & PC Repair",
  "Graphic Design & Branding",
  "Content Writing & Digital Marketing",
] as const;
