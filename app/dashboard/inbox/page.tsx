"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Send, 
  Paperclip, 
  MapPin, 
  GraduationCap, 
  Lock, 
  Unlock, 
  FileText, 
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
  User,
  AlertTriangle,
  Scissors,
  Code
} from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import Logo from "@/components/logo";

// Mock Conversation Lists
const CONVERSATIONS = [
  {
    id: 1,
    name: "Samuel Alabi",
    role: "Artisan",
    school: "University of Lagos (UNILAG)",
    avatar: "SA",
    projectTitle: "React Web Redesign Layout",
    lastMessage: "I've completed the responsive layout details. Let me know if the styling works.",
    timestamp: "10:42 AM",
    category: "Code & Dev",
    categoryIcon: Code,
    lockedFunds: 45000,
    orderStatus: "Review Pending" // In Progress | Review Pending | Released | Revision Requested
  },
  {
    id: 2,
    name: "Chinwe Egwu",
    role: "Artisan",
    school: "University of Ibadan (UI)",
    avatar: "CE",
    projectTitle: "Bespoke Traditional Senator Attire",
    lastMessage: "Looking at the collar detailing today. Will upload fabric cuts soon.",
    timestamp: "Yesterday",
    category: "Fashion & Crafts",
    categoryIcon: Scissors,
    lockedFunds: 25000,
    orderStatus: "In Progress"
  }
];

// Mock Chat Messages Data
const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: "client",
    content: "Hi Samuel! Regarding the React layout, make sure it is mobile responsive and loads smoothly in low network areas.",
    timestamp: "9:15 AM"
  },
  {
    id: 2,
    sender: "artisan",
    content: "Understood. I am writing clean Tailwind CSS styles and optimizing asset loads. Escrow is showing active on my workspace.",
    timestamp: "9:30 AM"
  },
  {
    id: 3,
    sender: "artisan",
    content: "I have uploaded the initial prototype layout link and took some lookup screenshots of the dashboard interface. Attached below.",
    timestamp: "10:40 AM",
    attachment: "lookbook_draft_preview.png"
  }
];

export default function InboxPage() {
  const [currentRole, setCurrentRole] = useState<"client" | "artisan">("client");
  const [activeConvId, setActiveConvId] = useState(1);
  const [conversations, setConversations] = useState(CONVERSATIONS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [typedMessage, setTypedMessage] = useState("");
  
  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];
  const CategoryIcon = activeConv.categoryIcon;

  // Handle Send Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      sender: currentRole,
      content: typedMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    
    // Update last message in conversation list
    setConversations(prev => prev.map(c => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          lastMessage: typedMessage,
          timestamp: "Just now"
        };
      }
      return c;
    }));

    setTypedMessage("");
  };

  // Simulate Escrow Operations
  const handleUpdateOrderStatus = (newStatus: "Released" | "Revision Requested" | "Review Pending") => {
    setConversations(prev => prev.map(c => {
      if (c.id === activeConv.id) {
        return {
          ...c,
          orderStatus: newStatus,
          lockedFunds: newStatus === "Released" ? 0 : c.lockedFunds
        };
      }
      return c;
    }));

    // Post System message in chat
    const systemMsg = {
      id: messages.length + 1,
      sender: "system",
      content: newStatus === "Released" 
        ? `🔒 Escrow payment approved! ₦${activeConv.lockedFunds.toLocaleString()} has been released to the Artisan's account.` 
        : `⚠️ Revision requested by Client. Artisan has been notified to modify deliverables.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, systemMsg]);
  };

  const handleArtisanSubmit = () => {
    handleUpdateOrderStatus("Review Pending");
    
    // Simulate attaching lookbook draft
    const newMsg = {
      id: messages.length + 2,
      sender: "artisan",
      content: "I have uploaded the latest revisions. Please check the lookbook attachment below.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: "revised_milestone_proof.png"
    };
    setMessages(prev => [...prev, newMsg]);
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
      
      {/* 1. TOP BAR */}
      <header className="bg-background border-b border-border px-6 py-4 lg:px-24 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-primary transition-colors text-neutral-400">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-serif text-2xl font-bold tracking-widest">KÓ WON</span>
            <span className="bg-primary/20 text-primary border border-primary/30 text-[9px] uppercase font-bold px-2 py-0.5 mt-0.5 tracking-wider">
              Inbox Workspace
            </span>
          </div>
        </div>

        {/* Role Switcher & Navigation Links */}
        <div className="flex items-center gap-6">
          <div className="flex bg-neutral-100 dark:bg-neutral-900 border border-border p-1">
            <button 
              onClick={() => setCurrentRole("client")}
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 transition-all ${
                currentRole === "client" 
                  ? "bg-foreground text-background dark:bg-white dark:text-black shadow-md" 
                  : "text-neutral-400 hover:text-foreground"
              }`}
            >
              View as Client
            </button>
            <button 
              onClick={() => setCurrentRole("artisan")}
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 transition-all ${
                currentRole === "artisan" 
                  ? "bg-foreground text-background dark:bg-white dark:text-black shadow-md" 
                  : "text-neutral-400 hover:text-foreground"
              }`}
            >
              View as Artisan
            </button>
          </div>

          <ThemeToggle />
          
          <Link 
            href={currentRole === "client" ? "/dashboard/client" : "/dashboard/artisan"}
            className="hidden md:inline-block border border-border hover:border-foreground text-xs font-semibold uppercase tracking-wider px-4 py-2 transition-all"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* 2. THREE-PANEL CORE SYSTEM */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* PANEL A: LEFT RAIL - CONVERSATIONS (Spans 3 columns) */}
        <div className="w-80 border-r border-border flex flex-col bg-card/40 shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-border">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
              Active Contracts ({conversations.length})
            </span>
          </div>

          <div className="flex-1 divide-y divide-border">
            {conversations.map((conv) => {
              const Icon = conv.categoryIcon;
              const isSelected = conv.id === activeConv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    // Reset mock message logs to fit selected project
                    if (conv.id === 2) {
                      setMessages([
                        { id: 1, sender: "client", content: "Hello Chinwe. Let's make the traditional Senator attire customized to these size specifications.", timestamp: "Yesterday" },
                        { id: 2, sender: "artisan", content: "Received. I will source the high-grade cashmere fabric from the local market today.", timestamp: "Yesterday" }
                      ]);
                    } else {
                      setMessages(INITIAL_MESSAGES);
                    }
                  }}
                  className={`w-full text-left p-5 flex flex-col gap-2 transition-all ${
                    isSelected 
                      ? "bg-primary/5 border-l-2 border-primary" 
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-900/30"
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-none bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {conv.avatar}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{conv.name}</h4>
                        <span className="text-[9px] text-neutral-400 block">{conv.role}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-neutral-400">{conv.timestamp}</span>
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-serif text-xs font-semibold text-foreground line-clamp-1">{conv.projectTitle}</h5>
                    <p className="text-[11px] text-neutral-500 line-clamp-2 leading-snug font-light">
                      {conv.lastMessage}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-medium">
                      ₦{conv.lockedFunds.toLocaleString()} In Escrow
                    </span>
                    <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 border ${
                      conv.orderStatus === "Released"
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : conv.orderStatus === "Review Pending"
                        ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                        : "bg-primary/10 text-primary border-primary/20"
                    }`}>
                      {conv.orderStatus}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PANEL B: CENTER PANE - CHAT LOG (Spans 6 columns equivalent) */}
        <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
          
          {/* Active Chat Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card/20 shrink-0">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">{activeConv.name}</h3>
                <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-primary shrink-0" />
                  {activeConv.school}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-neutral-100 dark:bg-neutral-900 border border-border px-2 py-0.5 text-neutral-500 uppercase tracking-wider">
                {activeConv.category}
              </span>
            </div>
          </div>

          {/* Bubbles Timeline */}
          <div className="flex-grow p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              if (msg.sender === "system") {
                return (
                  <div key={msg.id} className="flex justify-center my-4">
                    <div className="bg-primary/5 text-primary border border-primary/20 text-xs font-medium px-4 py-2 text-center max-w-md flex items-center gap-2">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span>{msg.content}</span>
                    </div>
                  </div>
                );
              }

              const isOwnMessage = msg.sender === currentRole;
              return (
                <div key={msg.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-md space-y-1 ${isOwnMessage ? "text-right" : "text-left"}`}>
                    <div className={`p-4 text-xs leading-relaxed ${
                      isOwnMessage 
                        ? "bg-foreground text-background dark:bg-white dark:text-black font-medium" 
                        : "bg-card text-card-foreground border border-border"
                    }`}>
                      {msg.content}

                      {/* Render Mock Attachment */}
                      {msg.attachment && (
                        <div className="mt-3 border border-border bg-background p-3 flex items-center gap-3 text-left text-[11px] text-foreground">
                          <ImageIcon className="h-5 w-5 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{msg.attachment}</p>
                            <span className="text-[9px] text-neutral-400 uppercase tracking-wider">Verified Lookbook Proof</span>
                          </div>
                          <span className="text-[9px] font-bold text-green-600 bg-green-500/10 border border-green-500/20 px-2 py-0.5 uppercase shrink-0">
                            Approved
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-neutral-400 px-1">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Chat Input Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card/20 flex gap-3 shrink-0">
            <button 
              type="button" 
              className="bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border p-3 text-neutral-400 hover:text-foreground transition-colors shrink-0"
              title="Attach lookbook screenshot"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            <input
              type="text"
              placeholder="Type your instruction or message..."
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              className="flex-grow bg-background border border-border text-xs px-4 py-3 outline-none focus:border-primary"
            />
            <button 
              type="submit" 
              className="bg-primary text-primary-foreground font-semibold uppercase text-xs tracking-wider px-5 py-3 hover:bg-foreground hover:text-background transition-colors flex items-center gap-1.5 shrink-0"
            >
              Send
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>

        {/* PANEL C: RIGHT PANEL - ESCROW STATUS DRAWERS (Spans 3 columns) */}
        <div className="w-80 border-l border-border flex flex-col bg-card/40 shrink-0 overflow-y-auto p-6 space-y-6">
          <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block">
            Escrow Contract Vault
          </span>

          {/* Active Project Title block */}
          <div className="space-y-1">
            <h4 className="font-serif text-base font-bold text-foreground leading-tight">
              {activeConv.projectTitle}
            </h4>
            <p className="text-[10px] text-neutral-400">Escrow ID: ESC-90218-LAG</p>
          </div>

          {/* Escrow balance ledger card */}
          <div className="border border-border p-4 bg-background space-y-3">
            <div>
              <span className="text-[9px] text-neutral-500 uppercase tracking-wider block font-semibold">Locked Balance</span>
              {activeConv.lockedFunds > 0 ? (
                <div className="flex items-center gap-2 mt-1">
                  <Lock className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xl font-bold font-serif text-primary">
                    ₦{activeConv.lockedFunds.toLocaleString()}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <Unlock className="h-4 w-4 text-green-600 shrink-0" />
                  <span className="text-xl font-bold font-serif text-green-600">
                    ₦0.00 (Released)
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-border/50 pt-2 text-[10px] text-neutral-500 flex justify-between">
              <span>Status:</span>
              <strong className="text-foreground uppercase tracking-wider">{activeConv.orderStatus}</strong>
            </div>
          </div>

          {/* Milestones timeline check */}
          <div className="space-y-3">
            <h5 className="text-[10px] uppercase text-neutral-400 font-bold">Milestones Status</h5>
            
            <div className="space-y-3 text-xs">
              <div className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h6 className="font-semibold text-foreground">Figma UI Mockup (₦15,000)</h6>
                  <span className="text-[9px] text-neutral-400 block font-light">Approved & Payout cleared</span>
                </div>
              </div>
              <div className="flex gap-2">
                {activeConv.orderStatus === "Released" ? (
                  <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5 animate-pulse" />
                )}
                <div>
                  <h6 className="font-semibold text-foreground">Layout Dev Draft (₦30,000)</h6>
                  <span className="text-[9px] text-neutral-400 block font-light">
                    {activeConv.orderStatus === "Released" 
                      ? "Approved & Payout cleared" 
                      : activeConv.orderStatus === "Review Pending"
                      ? "Submitted lookup proof - Under review"
                      : "In progress - waiting for Artisan draft"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contextual Action Drawer based on roles */}
          <div className="border-t border-border pt-6 space-y-3 shrink-0">
            
            {/* CLIENT ACTION INTERFACES */}
            {currentRole === "client" ? (
              activeConv.orderStatus === "Released" ? (
                <div className="bg-green-500/10 border border-green-500/20 p-4 text-center text-xs text-green-600 font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  Contract fully closed
                </div>
              ) : (
                <div className="space-y-3">
                  <button 
                    onClick={() => handleUpdateOrderStatus("Released")}
                    className="w-full bg-primary text-primary-foreground font-semibold uppercase text-xs tracking-wider py-3 hover:bg-foreground hover:text-background transition-colors flex items-center justify-center gap-1.5"
                    disabled={activeConv.orderStatus === "Released"}
                  >
                    <Unlock className="h-4 w-4" />
                    Release Escrow Payout
                  </button>
                  <button 
                    onClick={() => handleUpdateOrderStatus("Revision Requested")}
                    className="w-full border border-border text-foreground hover:border-foreground font-semibold uppercase text-xs tracking-wider py-3 transition-colors"
                    disabled={activeConv.orderStatus === "Released"}
                  >
                    Request Revision
                  </button>
                </div>
              )
            ) : (
              /* ARTISAN ACTION INTERFACES */
              activeConv.orderStatus === "Released" ? (
                <div className="bg-green-500/10 border border-green-500/20 p-4 text-center text-xs text-green-600 font-semibold flex items-center justify-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  Escrow Funds Cleared
                </div>
              ) : (
                <div className="space-y-3">
                  <button 
                    onClick={handleArtisanSubmit}
                    className="w-full bg-foreground text-background dark:bg-white dark:text-black font-semibold uppercase text-xs tracking-wider py-3 hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-1.5"
                  >
                    Submit Lookbook Proof
                  </button>
                  <button className="w-full border border-border text-neutral-400 text-xs font-semibold uppercase tracking-wider py-3 cursor-not-allowed" disabled>
                    Request Extension
                  </button>
                </div>
              )
            )}

            {/* Safety Escalation Alert */}
            <div className="flex gap-2 p-3 bg-yellow-500/5 border border-yellow-500/10 text-[10px] text-neutral-500">
              <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
              <p className="leading-normal font-light">
                Do not negotiate outside KÓ WON. External contracts bypass escrow vaults and waive lookup safety guarantees.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
