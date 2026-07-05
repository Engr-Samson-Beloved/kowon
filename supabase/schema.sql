-- ============================================================
-- KÓ WON — Full Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- ============================================================
-- 1. PROFILES — Extended user identity
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'client')),
  school TEXT,
  skill_category TEXT,
  company_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  portfolio_url TEXT,
  phone TEXT,
  location TEXT,
  rank TEXT DEFAULT 'Bronze' CHECK (rank IN ('Bronze', 'Silver', 'Gold Pro')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_subscribed BOOLEAN DEFAULT FALSE,
  skills TEXT[] DEFAULT '{}',
  completed_jobs INTEGER DEFAULT 0,
  avg_rating NUMERIC(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. GIGS — Artisan service listings (Showcase)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  starting_price NUMERIC NOT NULL,
  delivery_days INTEGER DEFAULT 3,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  avg_rating NUMERIC(2,1) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. PRODUCTS — Direct-sale items (Campus Shop)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image_url TEXT,
  in_stock INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  total_sold INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. PROJECTS — Client-posted tender briefs (The Exchange)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  budget NUMERIC NOT NULL,
  school_limit TEXT DEFAULT 'Open to All Schools',
  deadline_days INTEGER DEFAULT 7,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'hired', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. PROPOSALS — Artisan bids on projects
-- ============================================================
CREATE TABLE IF NOT EXISTS public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  artisan_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bid_price NUMERIC NOT NULL,
  delivery_days INTEGER NOT NULL,
  cover_letter TEXT NOT NULL DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, artisan_id)
);

-- ============================================================
-- 6. ORDERS — Contracts binding client ↔ artisan
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id),
  artisan_id UUID NOT NULL REFERENCES public.profiles(id),
  gig_id UUID REFERENCES public.gigs(id),
  product_id UUID REFERENCES public.products(id),
  project_id UUID REFERENCES public.projects(id),
  proposal_id UUID REFERENCES public.proposals(id),
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  escrow_status TEXT DEFAULT 'locked' CHECK (escrow_status IN ('locked', 'released', 'refunded', 'disputed')),
  order_status TEXT DEFAULT 'in_progress' CHECK (order_status IN ('in_progress', 'delivered', 'revision', 'completed', 'cancelled')),
  milestone TEXT,
  delivery_deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. REVIEWS — Post-completion ratings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_id, reviewer_id)
);

-- ============================================================
-- 8. MESSAGES — Conversation messages tied to orders
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. VERIFICATION REQUESTS — Student ID verification
-- ============================================================
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES — Performance optimization
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_gigs_artisan ON gigs(artisan_id);
CREATE INDEX IF NOT EXISTS idx_gigs_category ON gigs(category);
CREATE INDEX IF NOT EXISTS idx_gigs_active ON gigs(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_products_artisan ON products(artisan_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

CREATE INDEX IF NOT EXISTS idx_proposals_project ON proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_proposals_artisan ON proposals(artisan_id);

CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_artisan ON orders(artisan_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order ON reviews(order_id);

CREATE INDEX IF NOT EXISTS idx_messages_order ON messages(order_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(order_id, created_at);

-- ============================================================
-- TRIGGER: Auto-create profile on new user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, school, skill_category, company_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'school',
    NEW.raw_user_meta_data->>'skill',
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to allow re-running
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: Auto-update profile rating/rank on new review
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_profile_on_review()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET
    avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE reviewee_id = NEW.reviewee_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = NEW.reviewee_id),
    completed_jobs = (SELECT COUNT(*) FROM orders
                      WHERE artisan_id = NEW.reviewee_id AND order_status = 'completed')
  WHERE id = NEW.reviewee_id;

  -- Auto rank progression
  UPDATE public.profiles SET rank = CASE
    WHEN completed_jobs >= 20 AND avg_rating >= 4.5 THEN 'Gold Pro'
    WHEN completed_jobs >= 5 AND avg_rating >= 4.0 THEN 'Silver'
    ELSE 'Bronze'
  END
  WHERE id = NEW.reviewee_id AND role = 'student';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_on_review();

-- ============================================================
-- TRIGGER: Auto-update profile earnings on order completion
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_financials_on_order_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_status = 'completed' AND OLD.order_status != 'completed' THEN
    -- Credit artisan earnings
    UPDATE public.profiles
      SET total_earnings = total_earnings + NEW.amount
      WHERE id = NEW.artisan_id;
    -- Credit client spend
    UPDATE public.profiles
      SET total_spent = total_spent + NEW.amount
      WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_completed ON public.orders;
CREATE TRIGGER on_order_completed
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_financials_on_order_complete();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Profiles are publicly viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- GIGS
CREATE POLICY "Active gigs are publicly viewable" ON gigs FOR SELECT USING (true);
CREATE POLICY "Artisans can insert own gigs" ON gigs FOR INSERT WITH CHECK (auth.uid() = artisan_id);
CREATE POLICY "Artisans can update own gigs" ON gigs FOR UPDATE USING (auth.uid() = artisan_id);
CREATE POLICY "Artisans can delete own gigs" ON gigs FOR DELETE USING (auth.uid() = artisan_id);

-- PRODUCTS
CREATE POLICY "Products are publicly viewable" ON products FOR SELECT USING (true);
CREATE POLICY "Artisans can insert own products" ON products FOR INSERT WITH CHECK (auth.uid() = artisan_id);
CREATE POLICY "Artisans can update own products" ON products FOR UPDATE USING (auth.uid() = artisan_id);
CREATE POLICY "Artisans can delete own products" ON products FOR DELETE USING (auth.uid() = artisan_id);

-- PROJECTS
CREATE POLICY "Open projects are publicly viewable" ON projects FOR SELECT USING (true);
CREATE POLICY "Clients can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Clients can update own projects" ON projects FOR UPDATE USING (auth.uid() = client_id);

-- PROPOSALS
CREATE POLICY "Artisans can insert own proposals" ON proposals FOR INSERT WITH CHECK (auth.uid() = artisan_id);
CREATE POLICY "Artisans can view own proposals" ON proposals FOR SELECT USING (auth.uid() = artisan_id);
CREATE POLICY "Artisans can update own proposals" ON proposals FOR UPDATE USING (auth.uid() = artisan_id);
CREATE POLICY "Clients see proposals on their projects" ON proposals FOR SELECT
  USING (project_id IN (SELECT id FROM projects WHERE client_id = auth.uid()));
CREATE POLICY "Clients can update proposals on their projects" ON proposals FOR UPDATE
  USING (project_id IN (SELECT id FROM projects WHERE client_id = auth.uid()));

-- ORDERS
CREATE POLICY "Order parties can view" ON orders FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = artisan_id);
CREATE POLICY "Authenticated users can create orders" ON orders FOR INSERT
  WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Order parties can update" ON orders FOR UPDATE
  USING (auth.uid() = client_id OR auth.uid() = artisan_id);

-- REVIEWS
CREATE POLICY "Reviews are publicly viewable" ON reviews FOR SELECT USING (true);
CREATE POLICY "Reviewers can insert own reviews" ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- MESSAGES
CREATE POLICY "Message parties can view" ON messages FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE client_id = auth.uid() OR artisan_id = auth.uid()));
CREATE POLICY "Message parties can send" ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- VERIFICATION REQUESTS
CREATE POLICY "Users can view own verification" ON verification_requests FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can submit verification" ON verification_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- HELPER RPC: Get artisan financial summary
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_artisan_financials(uid UUID)
RETURNS TABLE (
  available_earnings NUMERIC,
  locked_escrow NUMERIC,
  total_completed NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((SELECT SUM(amount) FROM orders WHERE artisan_id = uid AND order_status = 'completed' AND escrow_status = 'released'), 0) AS available_earnings,
    COALESCE((SELECT SUM(amount) FROM orders WHERE artisan_id = uid AND escrow_status = 'locked'), 0) AS locked_escrow,
    COALESCE((SELECT total_earnings FROM profiles WHERE id = uid), 0) AS total_completed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- HELPER RPC: Get client financial summary
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_client_financials(uid UUID)
RETURNS TABLE (
  locked_escrow NUMERIC,
  total_spent NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((SELECT SUM(amount) FROM orders WHERE client_id = uid AND escrow_status = 'locked'), 0) AS locked_escrow,
    COALESCE((SELECT total_spent FROM profiles WHERE id = uid), 0) AS total_spent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
