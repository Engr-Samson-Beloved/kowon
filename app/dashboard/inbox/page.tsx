"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
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
import Navbar from "@/components/navbar";

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
    orderStatus: "Review Pending" 
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
      
      {/* Reusable navbar */}
      <Navbar />

      {/* Role Switcher Toolbar (Mature borderless toolbar) */}
      <div className="bg-neutral-900/30 px-6 py-3 border-b border-border/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block font-sans">
            Inbox Workspace
          </span>
          <span className="text-neutral-600">•</span>
          <span className="text-[10px] text-primary uppercase font-bold font-sans">
            Current View: {currentRole === "client" ? "Client Ledger" : "Artisan Ledger"}
          </span>
        </div>

        <div className="flex bg-neutral-900 border border-border/20 p-0.5">
          <button 
            onClick={() => setCurrentRole("client")}
            className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 transition-all cursor-pointer ${
              currentRole === "client" 
                ? "bg-primary text-primary-foreground font-bold shadow-md" 
                : "text-neutral-400 hover:text-foreground"
            }`}
          >
            View as Client
          </button>
          <button 
            onClick={() => setCurrentRole("artisan")}
            className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 transition-all cursor-pointer ${
              currentRole === "artisan" 
                ? "bg-primary text-primary-foreground font-bold shadow-md" 
                : "text-neutral-400 hover:text-foreground"
            }`}
          >
            View as Artisan
          </button>
        </div>
      </div>

      {/* THREE-PANEL CORE SYSTEM (Borderless layout) */}
      <div className="flex-1 flex overflow-hidden w-full">
        
        {/* PANEL A: LEFT RAIL - CONVERSATIONS (Borderless side listing) */}
        <div className="w-80 border-r border-border/20 flex flex-col bg-neutral-950 shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-border/10">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
              Active Contracts ({conversations.length})
            </span>
          </div>

          <div className="flex-1 divide-y divide-border/10">
            {conversations.map((conv) => {
              const isSelected = conv.id === activeConv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    setActiveConvId(conv.id);
                    if (conv.id === 2) {
                      setMessages([
                        { id: 1, sender: "client", content: "Hello Chinwe. Let's make the traditional Senator attire customized to these size specifications.", timestamp: "Yesterday" },
                        { id: 2, sender: "artisan", content: "Received. I will source the high-grade cashmere fabric from the local market today.", timestamp: "Yesterday" }
                      ]);
                    } else {
                      setMessages(INITIAL_MESSAGES);
                    }
                  }}
                  className={`w-full text-left p-5 flex flex-col gap-2 transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-primary/5 border-l-2 border-primary" 
                      : "hover:bg-neutral-900/40"
                  }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        {conv.avatar}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground">{conv.name}</h4>
                        <span className="text-[9px] text-neutral-400 block font-sans">{conv.role}</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-neutral-400 font-sans">{conv.timestamp}</span>
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-serif text-xs font-semibold text-foreground line-clamp-1">{conv.projectTitle}</h5>
                    <p className="text-[11px] text-neutral-500 line-clamp-2 leading-snug font-light font-sans">
                      {conv.lastMessage}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 font-sans">
                    <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-medium">
                      ₦{conv.lockedFunds.toLocaleString()} Escrow
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

        {/* PANEL B: CENTER PANE - CHAT LOG (Borderless bubbles timeline) */}
        <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
          
          {/* Active Chat Header */}
          <div className="px-6 py-4 border-b border-border/10 flex items-center justify-between bg-neutral-900/10 shrink-0">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">{activeConv.name}</h3>
                <p className="text-[10px] text-neutral-400 flex items-center gap-1 font-sans">
                  <MapPin className="h-3 w-3 text-primary shrink-0" />
                  {activeConv.school}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold bg-neutral-900 border border-border/20 px-2 py-0.5 text-neutral-400 uppercase tracking-wider font-sans">
                {activeConv.category}
              </span>
            </div>
          </div>

          {/* Bubbles Timeline */}
          <div className="flex-grow p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              if (msg.sender === "system") {
                return (
                  <div key={msg.id} className="flex justify-center my-4 animate-fade-in">
                    <div className="bg-primary/5 text-primary border border-primary/20 text-xs font-medium px-4 py-2 text-center max-w-md flex items-center gap-2 font-sans">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span>{msg.content}</span>
                    </div>
                  </div>
                );
              }

              const isOwnMessage = msg.sender === currentRole;
              return (
                <div key={msg.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} animate-fade-in`}>
                  <div className={`max-w-md space-y-1 ${isOwnMessage ? "text-right" : "text-left"}`}>
                    <div className={`p-4 text-xs leading-relaxed rounded-lg ${
                      isOwnMessage 
                        ? "bg-foreground text-background dark:bg-white dark:text-black font-medium" 
                        : "bg-neutral-900/40 text-foreground border border-border/15"
                    }`}>
                      {msg.content}

                      {/* Render Mock Attachment */}
                      {msg.attachment && (
                        <div className="mt-3 border border-border/20 bg-background/50 p-3 flex items-center gap-3 text-left text-[11px] text-foreground font-sans">
                          <ImageIcon className="h-5 w-5 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{msg.attachment}</p>
                            <span className="text-[9px] text-neutral-400 uppercase tracking-wider">Milestone Deliverable Proof</span>
                          </div>
                          <span className="text-[9px] font-bold text-green-600 bg-green-500/10 border border-green-500/20 px-2 py-0.5 uppercase shrink-0">
                            Verified
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-neutral-400 px-1 font-sans">{msg.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Typing Action Bar */}
          <form onSubmit={handleSendMessage} className="p-4 bg-neutral-950 border-t border-border/20 flex gap-3 shrink-0">
            <button type="button" className="p-2.5 bg-neutral-900 text-neutral-400 hover:text-primary transition-colors cursor-pointer border border-border/20">
              <Paperclip className="h-4 w-4" />
            </button>
            <input 
              type="text" 
              placeholder={`Send message as ${currentRole === "client" ? "Client" : "Artisan"}...`}
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              className="flex-grow bg-neutral-900 border border-border/20 text-xs px-4 py-2.5 outline-none focus:border-primary placeholder-neutral-500 font-sans"
            />
            <button type="submit" className="p-2.5 bg-primary text-primary-foreground hover:bg-foreground hover:text-background transition-colors cursor-pointer">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* PANEL C: RIGHT RAIL - ESCROW CONTROLS (Borderless payment info summary) */}
        <div className="w-72 border-l border-border/20 bg-neutral-950 p-6 flex flex-col gap-6 shrink-0 overflow-y-auto">
          <div className="space-y-1.5 border-b border-border/10 pb-4">
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block font-sans">Escrow Ledger</span>
            <h4 className="font-serif text-sm font-semibold text-foreground line-clamp-2">{activeConv.projectTitle}</h4>
          </div>

          {activeConv.lockedFunds > 0 ? (
            <div className="space-y-4">
              <div className="bg-primary/5 p-4 border border-primary/20 space-y-2">
                <span className="text-[9px] uppercase text-primary font-bold block font-sans">Safelocked Vault</span>
                <p className="text-xl font-serif font-bold text-foreground">₦{activeConv.lockedFunds.toLocaleString()}</p>
                <p className="text-[9px] text-neutral-400 leading-normal font-light font-sans">
                  Funds are held in neutral escrow and will only be sent to the artisan when released by the client.
                </p>
              </div>

              {/* Dynamic Operations */}
              {currentRole === "client" ? (
                <div className="space-y-2.5 pt-2">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block font-sans">Client Operations</span>
                  
                  {activeConv.orderStatus === "Review Pending" ? (
                    <>
                      <button 
                        onClick={() => handleUpdateOrderStatus("Released")}
                        className="w-full bg-primary text-primary-foreground font-semibold uppercase text-[10px] tracking-wider py-2.5 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                      >
                        Approve & Release Funds
                      </button>
                      <button 
                        onClick={() => handleUpdateOrderStatus("Revision Requested")}
                        className="w-full border border-border/30 hover:border-red-500 hover:text-red-500 text-[10px] uppercase font-bold py-2.5 transition-colors cursor-pointer"
                      >
                        Request Revisions
                      </button>
                    </>
                  ) : (
                    <div className="p-3 bg-neutral-900 text-neutral-500 text-[10px] leading-normal font-light border border-border/10 text-center font-sans">
                      Awaiting artisan milestone upload to activate review actions.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5 pt-2">
                  <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block font-sans">Artisan Operations</span>
                  
                  {activeConv.orderStatus === "In Progress" || activeConv.orderStatus === "Revision Requested" ? (
                    <button 
                      onClick={handleArtisanSubmit}
                      className="w-full bg-primary text-primary-foreground font-semibold uppercase text-[10px] tracking-wider py-2.5 hover:bg-foreground hover:text-background transition-colors cursor-pointer"
                    >
                      Submit Work for Review
                    </button>
                  ) : (
                    <div className="p-3 bg-neutral-900 text-neutral-500 text-[10px] leading-normal font-light border border-border/10 text-center font-sans">
                      Milestone is under review by Client.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-500/5 p-4 border border-green-500/20 text-center space-y-2">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                <h5 className="text-xs font-bold text-green-600">Payment Released</h5>
                <p className="text-[9px] text-neutral-400 leading-normal font-sans">
                  The escrow safelock is empty. All project funds have been successfully deposited.
                </p>
              </div>
            </div>
          )}

          {/* Escrow Details */}
          <div className="border-t border-border/10 pt-4 space-y-3">
            <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block font-sans">Vault Status</span>
            <div className="text-[10px] space-y-2 text-neutral-400 font-sans">
              <div className="flex justify-between">
                <span>Contract ID:</span>
                <span className="font-semibold text-foreground">KW-801A-{activeConv.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-foreground uppercase">{activeConv.orderStatus}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
