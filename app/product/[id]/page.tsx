"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  ShieldCheck,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { supabase } from "@/components/supabase-client";
import Navbar from "@/components/navbar";
import type { Product, Profile } from "@/lib/types";

export default function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = React.use(props.params);
  const router = useRouter();
  const [product, setProduct] = useState<(Product & { artisan: Profile }) | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: productData } = await supabase
        .from("products")
        .select("*, artisan:profiles(*)")
        .eq("id", id)
        .single();

      if (productData) setProduct(productData as any);

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

  const handleBuy = async () => {
    if (!currentUser || !product) return;
    setBuying(true);

    const { error: orderError } = await supabase.from("orders").insert({
      client_id: currentUser.id,
      artisan_id: product.artisan_id,
      product_id: product.id,
      title: product.title,
      amount: product.price,
      escrow_status: "locked",
      order_status: "in_progress",
      milestone: "Product Dispatch",
    });

    if (orderError) {
      alert("Failed to create order: " + orderError.message);
      setBuying(false);
      return;
    }

    // Decrement stock
    await supabase
      .from("products")
      .update({ in_stock: Math.max(product.in_stock - 1, 0) })
      .eq("id", product.id);

    router.push("/dashboard/client");
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

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-neutral-400 text-sm">Product not found.</p>
          <Link href="/marketplace?tab=products" className="text-primary text-xs underline">Back to Campus Shop</Link>
        </div>
      </div>
    );
  }

  const seller = product.artisan;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-[10px] text-neutral-400 mb-6">
          <Link href="/marketplace?tab=products" className="hover:text-primary transition-colors">Campus Shop</Link>
          <span>/</span>
          <span className="text-foreground">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT: Product Details */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-3">
              <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] uppercase font-bold px-2 py-0.5 tracking-wider">
                {product.category}
              </span>
              <h1 className="font-serif text-3xl font-bold leading-tight">{product.title}</h1>
            </div>

            <div className="bg-neutral-900/30 p-6 space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
                Product Description
              </span>
              <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {product.description || "No description provided yet."}
              </p>
            </div>

            {/* Stock Status */}
            <div className="bg-neutral-900/30 p-6 flex items-center gap-4">
              <ShoppingBag className="h-5 w-5 text-primary shrink-0" />
              <div>
                <span className="text-[10px] uppercase text-neutral-400 font-bold block">Stock Availability</span>
                <div className="flex items-center gap-2 mt-1">
                  {product.in_stock > 0 ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-semibold text-green-500">{product.in_stock} in stock</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-semibold text-red-500">Out of stock</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {product.total_sold > 0 && (
              <p className="text-xs text-neutral-500">{product.total_sold} sold</p>
            )}
          </div>

          {/* RIGHT: Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-6">

              {/* Pricing */}
              <div className="bg-neutral-900/30 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Price</span>
                  <span className="text-2xl font-bold font-serif text-primary">₦{product.price.toLocaleString()}</span>
                </div>

                {!currentUser ? (
                  <Link
                    href="/auth/login"
                    className="block text-center bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-4 py-3 hover:bg-foreground hover:text-background transition-colors"
                  >
                    Sign In to Buy
                  </Link>
                ) : product.in_stock > 0 ? (
                  <button
                    onClick={handleBuy}
                    disabled={buying}
                    className="w-full bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-4 py-3 hover:bg-foreground hover:text-background transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {buying ? "Processing..." : "Buy Now"}
                  </button>
                ) : (
                  <div className="text-center text-[10px] text-neutral-500 py-2 border border-border/20">
                    Currently out of stock
                  </div>
                )}
              </div>

              {/* Seller Card */}
              <div className="bg-neutral-900/30 p-6 space-y-4">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">Seller</span>
                <div className="flex items-center gap-3">
                  {seller.avatar_url ? (
                    <img src={seller.avatar_url} alt={seller.full_name} className="h-12 w-12 rounded-full object-cover border border-border/40" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm uppercase">
                      {seller.full_name?.substring(0, 2)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold">{seller.full_name}</h3>
                      {seller.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-primary" />}
                    </div>
                    <p className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {seller.school || "Nigeria"}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/profile/${seller.id}`}
                  className="block text-center border border-border/30 hover:border-primary text-xs uppercase tracking-wider font-semibold px-4 py-2.5 transition-colors"
                >
                  View Seller Profile
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
