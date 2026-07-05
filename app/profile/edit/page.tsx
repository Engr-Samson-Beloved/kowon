"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/components/supabase-client";
import Navbar from "@/components/navbar";
import { NIGERIAN_UNIVERSITIES, SKILL_CATEGORIES } from "@/lib/types";
import type { Profile } from "@/lib/types";
import {
  Camera,
  X,
  Plus,
  Save,
  CheckCircle2,
  AlertCircle,
  User,
  MapPin,
  GraduationCap,
  Phone,
  Link as LinkIcon,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";

const BIO_MAX = 500;

function computeCompletion(p: Partial<Profile>): number {
  const fields: { key: keyof Profile; weight: number }[] = [
    { key: "full_name", weight: 15 },
    { key: "avatar_url", weight: 15 },
    { key: "bio", weight: 15 },
    { key: "school", weight: 10 },
    { key: "skill_category", weight: 10 },
    { key: "skills", weight: 10 },
    { key: "phone", weight: 5 },
    { key: "location", weight: 10 },
    { key: "portfolio_url", weight: 10 },
  ];
  let score = 0;
  for (const f of fields) {
    const val = p[f.key];
    if (val && (typeof val === "string" ? val.trim().length > 0 : Array.isArray(val) && val.length > 0)) {
      score += f.weight;
    }
  }
  return score;
}

export default function ProfileEditPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [school, setSchool] = useState("");
  const [skillCategory, setSkillCategory] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUserId(user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setBio(profile.bio || "");
        setSkills(profile.skills || []);
        setPortfolioUrl(profile.portfolio_url || "");
        setPhone(profile.phone || "");
        setLocation(profile.location || "");
        setSchool(profile.school || "");
        setSkillCategory(profile.skill_category || "");
        setAvatarUrl(profile.avatar_url || null);
      }

      setLoading(false);
    };

    load();
  }, [router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    setFeedback(null);

    const ext = file.name.split(".").pop();
    const filePath = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setFeedback({ type: "error", message: "Failed to upload avatar." });
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    setAvatarUrl(publicUrl);

    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);

    setFeedback({ type: "success", message: "Avatar updated." });
    setUploading(false);
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = skillInput.trim();
      if (trimmed && !skills.includes(trimmed)) {
        setSkills((prev) => [...prev, trimmed]);
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setFeedback(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        bio,
        skills,
        portfolio_url: portfolioUrl || null,
        phone: phone || null,
        location: location || null,
        school: school || null,
        skill_category: skillCategory || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      setFeedback({ type: "error", message: "Failed to save profile. Please try again." });
    } else {
      setFeedback({ type: "success", message: "Profile saved successfully." });
    }

    setSaving(false);
  };

  const completion = computeCompletion({
    full_name: fullName,
    avatar_url: avatarUrl,
    bio,
    school,
    skill_category: skillCategory,
    skills,
    phone,
    location,
    portfolio_url: portfolioUrl,
  } as Partial<Profile>);

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="font-serif text-2xl font-bold">Edit Profile</h1>
            <p className="text-xs text-neutral-400 mt-1">Keep your profile complete to attract more clients.</p>
          </div>

          {/* Profile Completion */}
          <div className="bg-neutral-900/30 p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
                Profile Completion
              </span>
              <span className="text-xs font-bold text-primary">{completion}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-800 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${completion}%` }}
              />
            </div>
            {completion < 100 && (
              <p className="text-[10px] text-neutral-500 mt-2">
                Complete all fields to reach 100% and increase visibility.
              </p>
            )}
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`p-4 flex items-center gap-3 text-xs ${
                feedback.type === "success"
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {feedback.message}
            </div>
          )}

          {/* Avatar Section */}
          <div className="bg-neutral-900/30 p-6">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block mb-4">
              Profile Photo
            </span>
            <div className="flex items-center gap-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative h-24 w-24 rounded-full bg-neutral-800 border-2 border-dashed border-border/30 hover:border-primary flex items-center justify-center overflow-hidden group cursor-pointer transition-colors"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-neutral-500" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <div>
                <p className="text-xs font-semibold">Click to upload</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">JPG, PNG or WebP. Max 2MB.</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-neutral-900/30 p-6 space-y-5">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
              Basic Information
            </span>

            {/* Full Name */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1.5 mb-1.5">
                <User className="h-3 w-3" />
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary transition-colors"
                placeholder="Your full name"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1.5 mb-1.5">
                <FileText className="h-3 w-3" />
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => {
                  if (e.target.value.length <= BIO_MAX) setBio(e.target.value);
                }}
                rows={4}
                className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary transition-colors resize-none"
                placeholder="Tell clients about yourself, your expertise, and what you bring to the table..."
              />
              <div className="flex justify-end mt-1">
                <span
                  className={`text-[10px] ${
                    bio.length >= BIO_MAX ? "text-red-400" : "text-neutral-500"
                  }`}
                >
                  {bio.length}/{BIO_MAX}
                </span>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1.5 mb-1.5">
                <Phone className="h-3 w-3" />
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary transition-colors"
                placeholder="+234 800 000 0000"
              />
            </div>

            {/* Location */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1.5 mb-1.5">
                <MapPin className="h-3 w-3" />
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary transition-colors"
                placeholder="e.g. Lagos, Nigeria"
              />
            </div>

            {/* Portfolio URL */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1.5 mb-1.5">
                <LinkIcon className="h-3 w-3" />
                Portfolio URL
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary transition-colors"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>

          {/* Education & Category */}
          <div className="bg-neutral-900/30 p-6 space-y-5">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
              Education & Category
            </span>

            {/* School */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1.5 mb-1.5">
                <GraduationCap className="h-3 w-3" />
                School
              </label>
              <select
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary transition-colors cursor-pointer appearance-none"
              >
                <option value="">Select your university</option>
                {NIGERIAN_UNIVERSITIES.map((uni) => (
                  <option key={uni} value={uni}>
                    {uni}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill Category */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold flex items-center gap-1.5 mb-1.5">
                <Sparkles className="h-3 w-3" />
                Skill Category
              </label>
              <select
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value)}
                className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary transition-colors cursor-pointer appearance-none"
              >
                <option value="">Select your primary category</option>
                {SKILL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-neutral-900/30 p-6 space-y-4">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
              Skills
            </span>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-primary/20 text-primary border border-primary/30 text-[9px] uppercase font-bold px-2 py-0.5 flex items-center gap-1.5"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  className="w-full bg-background border border-border/30 text-xs p-2.5 outline-none focus:border-primary transition-colors pr-8"
                  placeholder="Type a skill and press Enter"
                />
                <Plus className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
              </div>
            </div>

            <p className="text-[10px] text-neutral-500">
              Add specific skills like "React", "Tailoring", "Photo Editing" etc.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => router.back()}
              className="text-xs text-neutral-400 hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary text-primary-foreground text-xs uppercase tracking-wider font-bold px-4 py-2 hover:bg-foreground hover:text-background transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
