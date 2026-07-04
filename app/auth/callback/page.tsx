"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/components/supabase-client";
import { Sparkles, User, Briefcase, AlertCircle, ArrowRight } from "lucide-react";
import Logo from "@/components/logo";

function AuthCallbackContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [roleMissing, setRoleMissing] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"student" | "client" | null>(null);
  const [savingRole, setSavingRole] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Check session on load
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        setLoading(false);
        setErrorMsg("Failed to retrieve authentication session. Please try logging in again.");
        setTimeout(() => router.push("/auth/login"), 2000);
        return;
      }

      // Session exists, inspect user metadata
      const user = session.user;
      const role = user.user_metadata?.role;

      if (role === "student" || role === "artisan") {
        router.push("/dashboard/artisan");
      } else if (role === "client") {
        router.push("/dashboard/client");
      } else {
        // Role is missing in metadata (first-time Google registration)
        setRoleMissing(true);
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setSavingRole(true);
    setErrorMsg("");

    const { data: { user }, error: updateError } = await supabase.auth.updateUser({
      data: { role: selectedRole }
    });

    if (updateError) {
      setErrorMsg(updateError.message);
      setSavingRole(false);
      return;
    }

    setSavingRole(false);
    // Redirect based on selected role
    if (selectedRole === "student") {
      router.push("/dashboard/artisan");
    } else {
      router.push("/dashboard/client");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        <div className="space-y-1">
          <h3 className="font-serif text-xl font-bold">Synchronizing SSO Identity</h3>
          <p className="text-xs text-neutral-500 font-light">Exchanging security tokens with KÓ WON authorization servers...</p>
        </div>
      </div>
    );
  }

  if (roleMissing) {
    return (
      <div className="max-w-md w-full mx-auto bg-card border border-border p-8 space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo size={42} />
          </div>
          <h2 className="font-serif text-2xl font-bold">Configure Your Profile</h2>
          <p className="text-xs text-neutral-500 font-light">
            Welcome to KÓ WON! Please select your account type to customize your platform layout.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-600 font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveRole} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Student Card */}
            <button
              type="button"
              onClick={() => setSelectedRole("student")}
              className={`p-6 border text-left flex flex-col justify-between transition-all duration-300 ${
                selectedRole === "student"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border bg-background hover:border-neutral-400"
              }`}
            >
              <User className={`h-6 w-6 ${selectedRole === "student" ? "text-primary" : "text-neutral-400"}`} />
              <div className="mt-8">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">Artisan</span>
                <span className="text-xs font-semibold text-foreground">Student Freelancer</span>
              </div>
            </button>

            {/* Client Card */}
            <button
              type="button"
              onClick={() => setSelectedRole("client")}
              className={`p-6 border text-left flex flex-col justify-between transition-all duration-300 ${
                selectedRole === "client"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border bg-background hover:border-neutral-400"
              }`}
            >
              <Briefcase className={`h-6 w-6 ${selectedRole === "client" ? "text-primary" : "text-neutral-400"}`} />
              <div className="mt-8">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">Client</span>
                <span className="text-xs font-semibold text-foreground">Hiring Entity</span>
              </div>
            </button>
          </div>

          <button
            type="submit"
            disabled={!selectedRole || savingRole}
            className="w-full bg-primary text-primary-foreground font-semibold uppercase text-xs tracking-wider py-4 hover:bg-foreground hover:text-background transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {savingRole ? (
              <span className="inline-block h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Finalize Registration
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      {errorMsg ? (
        <div className="space-y-2">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-red-500">Authentication Alert</h3>
          <p className="text-xs text-neutral-500">{errorMsg}</p>
        </div>
      ) : (
        <div className="space-y-2">
          <Sparkles className="h-10 w-10 text-primary mx-auto animate-pulse" />
          <h3 className="font-serif text-lg font-bold">Authentication Success</h3>
          <p className="text-xs text-neutral-500">Routing to your workspace workspace...</p>
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-neutral-300 border-t-transparent" />
          <p className="text-xs uppercase tracking-wider text-neutral-400">Loading Callback Workspace...</p>
        </div>
      }>
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
