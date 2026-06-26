"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Wrench, 
  Sparkles, 
  ShieldAlert, 
  Check, 
  ChevronRight 
} from "lucide-react";

const NIGERIAN_UNIVERSITIES = [
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
  "Federal University of Technology Owerri (FUTO)"
];

const SKILL_CATEGORIES = [
  "Code & Web Development",
  "Tailoring & Fashion Design",
  "Photography & Editing",
  "Hairstyling & Makeup Glam",
  "Tutoring & Academic Writing",
  "Electrical & PC Repair",
  "Graphic Design & Branding",
  "Content Writing & Digital Marketing"
];

export default function SignupPage() {
  const [role, setRole] = useState<"student" | "client">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [school, setSchool] = useState("");
  const [skill, setSkill] = useState("");
  const [companyName, setCompanyName] = useState("");
  
  // Multi-step states
  const [step, setStep] = useState<1 | 2>(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Email validation warning
  const showEmailWarning = role === "student" && email && !email.endsWith(".edu.ng") && !email.endsWith(".edu");

  // Live password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthScore = getPasswordStrength();

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;
    if (role === "student" && (!school || !skill)) return;
    if (role === "client" && !companyName) return;

    setIsLoading(true);
    // Simulate sending OTP verification code
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1200);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) return;

    setIsLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      setIsLoading(false);
      setRegistrationSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/80 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-screen">
        
        {/* Left Side: Brand presentation (Spans 5 columns) */}
        <div className="hidden lg:flex lg:col-span-5 bg-secondary text-secondary-foreground p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 h-96 w-96 border-b border-l border-primary/20 rounded-bl-full z-0" />
          
          <div className="z-10">
            <span className="font-serif text-3xl font-bold tracking-widest text-secondary-foreground block">
              KÓ WON
            </span>
            <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
              Affordable Skills • Endless Wealth
            </span>
          </div>

          <div className="space-y-8 z-10 my-auto">
            <Sparkles className="h-8 w-8 text-primary" />
            <h2 className="font-serif text-4xl font-light leading-tight">
              Empowering the <br />
              <span className="italic text-primary font-normal">Next Generation</span> <br />
              of Nigerian Crafts.
            </h2>
            
            <div className="space-y-4 pt-4 border-t border-secondary-foreground/15">
              <div className="flex gap-3">
                <div className="h-5 w-5 bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Institutional Safety</h4>
                  <p className="text-[11px] text-secondary-foreground/60 mt-0.5">Vetted campuses, ensuring premium output security.</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="h-5 w-5 bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Instant Escrow Release</h4>
                  <p className="text-[11px] text-secondary-foreground/60 mt-0.5">Funds locked prior to execution and released instantly on approval.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-5 w-5 bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Zero Starting Fees</h4>
                  <p className="text-[11px] text-secondary-foreground/60 mt-0.5">No platform subscription or upfront cost for student freelancers.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="z-10 text-[11px] text-secondary-foreground/60">
            Connecting premium craftsmanship with digital excellence.
          </div>
        </div>

        {/* Right Side: Signup Form Wizard (Spans 7 columns) */}
        <div className="lg:col-span-7 flex flex-col justify-center px-6 py-20 md:px-16 lg:px-24 bg-white dark:bg-zinc-950">
          <div className="max-w-md w-full mx-auto space-y-8">
            
            {/* Header */}
            <div className="space-y-2">
              <span className="font-serif text-3xl lg:hidden font-bold tracking-widest text-foreground block mb-4">
                KÓ WON
              </span>
              <h1 className="font-serif text-3xl font-light text-foreground">Create Account</h1>
              <p className="text-sm text-neutral-500 font-light">
                Already registered?{" "}
                <Link href="/auth/login" className="text-primary hover:text-foreground font-semibold underline transition-colors">
                  Log in here
                </Link>
              </p>
            </div>

            {registrationSuccess ? (
              <div className="border border-primary bg-primary/5 p-8 text-center space-y-4 animate-fade-in">
                <Sparkles className="h-10 w-10 text-primary mx-auto" />
                <h3 className="font-serif text-xl font-bold">Registration Successful</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Welcome to KÓ WON. Your institutional profile is now created. Let's start building your showcase lookbook.
                </p>
                <Link 
                  href="/auth/login"
                  className="inline-block bg-primary text-primary-foreground font-semibold uppercase text-xs tracking-wider px-8 py-3.5 hover:bg-foreground hover:text-background transition-all duration-300 mt-4"
                >
                  Log In To Workspace
                </Link>
              </div>
            ) : step === 1 ? (
              <form onSubmit={handleNextStep} className="space-y-6">
                
                {/* Role Switcher */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block">
                    Choose Your Role
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      className={`p-4 border text-left flex flex-col justify-between h-28 rounded-none transition-all duration-300 ${
                        role === "student"
                          ? "border-primary bg-primary/5 text-foreground ring-2 ring-primary/20"
                          : "border-border bg-background hover:bg-neutral-50 dark:hover:bg-neutral-900"
                      }`}
                    >
                      <GraduationCap className={`h-5 w-5 ${role === "student" ? "text-primary" : "text-neutral-400"}`} />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">I am a Student</p>
                        <p className="text-[10px] text-neutral-400 font-light mt-0.5">Offer crafts, code, or talents</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("client")}
                      className={`p-4 border text-left flex flex-col justify-between h-28 rounded-none transition-all duration-300 ${
                        role === "client"
                          ? "border-primary bg-primary/5 text-foreground ring-2 ring-primary/20"
                          : "border-border bg-background hover:bg-neutral-50 dark:hover:bg-neutral-900"
                      }`}
                    >
                      <Briefcase className={`h-5 w-5 ${role === "client" ? "text-primary" : "text-neutral-400"}`} />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider">I am a Client</p>
                        <p className="text-[10px] text-neutral-400 font-light mt-0.5">Hire vetted student creators</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block">
                    Full Name
                  </label>
                  <div className="flex items-center bg-background border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
                    <User className="h-4 w-4 text-neutral-400 mx-3 shrink-0" />
                    <input 
                      id="name"
                      type="text" 
                      placeholder="e.g. Samuel Alabi" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder-neutral-400 py-3.5 pr-4"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block">
                    Email Address
                  </label>
                  <div className="flex items-center bg-background border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
                    <Mail className="h-4 w-4 text-neutral-400 mx-3 shrink-0" />
                    <input 
                      id="email"
                      type="email" 
                      placeholder={role === "student" ? "studentname@unilag.edu.ng" : "work@company.com"} 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder-neutral-400 py-3.5 pr-4"
                    />
                  </div>
                  {showEmailWarning && (
                    <div className="flex gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-xs items-start">
                      <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                      <p className="font-light leading-relaxed">
                        To register as a student freelancer, please use your official institution email (e.g. <code>.edu.ng</code>) for automatic verified badge approval.
                      </p>
                    </div>
                  )}
                </div>

                {/* Conditional Fields: Student vs Client */}
                {role === "student" ? (
                  <>
                    {/* University Dropdown */}
                    <div className="space-y-1.5">
                      <label htmlFor="school" className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block">
                        University / Institution
                      </label>
                      <div className="flex items-center bg-background border border-border focus-within:border-primary transition-all duration-300">
                        <GraduationCap className="h-4 w-4 text-neutral-400 mx-3 shrink-0" />
                        <select
                          id="school"
                          required
                          value={school}
                          onChange={(e) => setSchool(e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-sm text-foreground py-3.5 pr-4 select-none"
                        >
                          <option value="" disabled>Select your campus</option>
                          {NIGERIAN_UNIVERSITIES.map((univ) => (
                            <option key={univ} value={univ} className="text-black bg-white">
                              {univ}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Skill Category */}
                    <div className="space-y-1.5">
                      <label htmlFor="skill" className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block">
                        Primary Craft / Talent Area
                      </label>
                      <div className="flex items-center bg-background border border-border focus-within:border-primary transition-all duration-300">
                        <Wrench className="h-4 w-4 text-neutral-400 mx-3 shrink-0" />
                        <select
                          id="skill"
                          required
                          value={skill}
                          onChange={(e) => setSkill(e.target.value)}
                          className="w-full bg-transparent border-none outline-none text-sm text-foreground py-3.5 pr-4"
                        >
                          <option value="" disabled>Select main category</option>
                          {SKILL_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat} className="text-black bg-white">
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Client: Company Name */
                  <div className="space-y-1.5">
                    <label htmlFor="company" className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block">
                      Company / Organization Name
                    </label>
                    <div className="flex items-center bg-background border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
                      <Briefcase className="h-4 w-4 text-neutral-400 mx-3 shrink-0" />
                      <input 
                        id="company"
                        type="text" 
                        placeholder="e.g. Acme Agency Ltd or Self-employed" 
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder-neutral-400 py-3.5 pr-4"
                      />
                    </div>
                  </div>
                )}

                {/* Password Fields */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block">
                    Password
                  </label>
                  <div className="flex items-center bg-background border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
                    <Lock className="h-4 w-4 text-neutral-400 mx-3 shrink-0" />
                    <input 
                      id="password"
                      type={showPassword ? "text" : "password"} 
                      placeholder="Min. 8 characters" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder-neutral-400 py-3.5"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-neutral-400 hover:text-primary px-3 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-1 pt-1">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div 
                            key={level} 
                            className={`h-1.5 flex-1 transition-all duration-300 ${
                              level <= strengthScore
                                ? strengthScore <= 2 
                                  ? "bg-red-500" 
                                  : strengthScore <= 4 
                                    ? "bg-yellow-500" 
                                    : "bg-green-500"
                                : "bg-neutral-100 dark:bg-neutral-900"
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-neutral-400 block text-right font-light uppercase tracking-wider">
                        {strengthScore <= 2 ? "Weak" : strengthScore <= 4 ? "Medium" : "Strong"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground font-semibold uppercase text-xs tracking-wider py-4 hover:bg-foreground hover:text-background transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-block h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Proceed to Verification
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

              </form>
            ) : (
              /* STEP 2: VERIFICATION OTP CODE */
              <form onSubmit={handleVerifyOTP} className="space-y-6 animate-fade-in">
                <div className="space-y-2 border border-primary/20 bg-primary/5 p-4 text-xs font-light text-neutral-600 dark:text-neutral-400">
                  <p>
                    We have sent a verification code to your email <strong>{email}</strong>. 
                    Please retrieve the 6-digit code and submit it below to finalize your registration.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="otp" className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block">
                    Verification Code
                  </label>
                  <div className="flex items-center bg-background border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-300">
                    <input 
                      id="otp"
                      type="text" 
                      placeholder="e.g. 123456" 
                      required
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-transparent border-none outline-none text-lg text-center tracking-widest text-foreground font-bold placeholder-neutral-400 py-3.5"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)} 
                    className="text-neutral-400 hover:text-primary transition-colors font-medium underline"
                  >
                    Edit Registration Details
                  </button>
                  
                  <button 
                    type="button" 
                    className="text-neutral-400 hover:text-primary transition-colors font-medium underline"
                  >
                    Resend Code
                  </button>
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-primary-foreground font-semibold uppercase text-xs tracking-wider py-4 hover:bg-foreground hover:text-background transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-block h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Verify & Activate Profile
                      <Check className="h-4.5 w-4.5" />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
