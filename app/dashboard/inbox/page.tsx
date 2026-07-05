"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Send, 
  Paperclip, 
  MapPin, 
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Sparkles,
  Loader2,
  Scissors,
  Code
} from "lucide-react";
import { supabase } from "@/components/supabase-client";
import Navbar from "@/components/navbar";
import type { Profile, Order, Message } from "@/lib/types";

// Conversation built from an order
interface Conversation {
  orderId: string;
  otherPerson: Profile;
  projectTitle: string;
  lastMessage: string;
  lastTimestamp: string;
  amount: number;
  escrowStatus: string;
  orderStatus: string;
  myRole: "client" | "artisan";
}

export default function InboxPage() {
  const [pageLoading, setPageLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  // Conversations list (derived from orders)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Messages for the active conversation
  const [messages, setMessages] = useState<(Message & { sender?: Pick<Profile, "full_name" | "avatar_url"> })[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [typedMessage, setTypedMessage] = useState("");

  const activeConv = conversations.find(c => c.orderId === activeOrderId) || null;

  // Fetch all orders as conversations
  const fetchConversations = useCallback(async (uid: string) => {
    const { data: orders } = await supabase
      .from("orders")
      .select("*, client:profiles!orders_client_id_fkey(*), artisan:profiles!orders_artisan_id_fkey(*)")
      .or(`client_id.eq.${uid},artisan_id.eq.${uid}`)
      .neq("order_status", "cancelled")
      .order("updated_at", { ascending: false });

    if (!orders) return;

    // Get latest message for each order
    const convs: Conversation[] = [];
    for (const order of orders) {
      const isClient = order.client_id === uid;
      const otherPerson = isClient ? (order as any).artisan : (order as any).client;

      // Fetch latest message
      const { data: latestMsg } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("order_id", order.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      convs.push({
        orderId: order.id,
        otherPerson: otherPerson as Profile,
        projectTitle: order.title,
        lastMessage: latestMsg?.content || "No messages yet",
        lastTimestamp: latestMsg?.created_at
          ? new Date(latestMsg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "",
        amount: order.amount,
        escrowStatus: order.escrow_status,
        orderStatus: order.order_status,
        myRole: isClient ? "client" : "artisan",
      });
    }

    setConversations(convs);
    if (convs.length > 0 && !activeOrderId) {
      setActiveOrderId(convs[0].orderId);
    }
  }, [activeOrderId]);

  // Fetch messages for an order
  const fetchMessages = useCallback(async (orderId: string) => {
    setMessagesLoading(true);
    const { data } = await supabase
      .from("messages")
      .select("*, sender:profiles(full_name, avatar_url)")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as any);
    setMessagesLoading(false);
  }, []);

  // Init
  useEffect(() => {
    const init = async () => {
      setPageLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setPageLoading(false); return; }

      setUserId(user.id);
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (profile) setUserProfile(profile as Profile);

      await fetchConversations(user.id);
      setPageLoading(false);
    };
    init();
  }, [fetchConversations]);

  // Load messages when active order changes
  useEffect(() => {
    if (activeOrderId) fetchMessages(activeOrderId);
  }, [activeOrderId, fetchMessages]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !userId || !activeOrderId) return;

    await supabase.from("messages").insert({
      order_id: activeOrderId,
      sender_id: userId,
      content: typedMessage,
    });

    setTypedMessage("");
    await fetchMessages(activeOrderId);
  };

  // Escrow actions
  const handleEscrowAction = async (action: "release" | "revision") => {
    if (!activeOrderId || !userId) return;

    if (action === "release") {
      await supabase.from("orders").update({
        escrow_status: "released",
        order_status: "completed",
        completed_at: new Date().toISOString(),
      }).eq("id", activeOrderId);

      // System message
      await supabase.from("messages").insert({
        order_id: activeOrderId,
        sender_id: userId,
        content: `🔒 Escrow payment approved! ₦${activeConv?.amount.toLocaleString()} has been released to the Artisan.`,
        is_system: true,
      });
    } else {
      await supabase.from("orders").update({
        order_status: "revision",
      }).eq("id", activeOrderId);

      await supabase.from("messages").insert({
        order_id: activeOrderId,
        sender_id: userId,
        content: "⚠️ Revision requested by Client. Please review deliverables and resubmit.",
        is_system: true,
      });
    }

    await fetchMessages(activeOrderId);
    if (userId) await fetchConversations(userId);
  };

  const handleArtisanSubmit = async () => {
    if (!activeOrderId || !userId) return;

    await supabase.from("orders").update({ order_status: "delivered" }).eq("id", activeOrderId);
    await supabase.from("messages").insert({
      order_id: activeOrderId,
      sender_id: userId,
      content: "I have submitted the latest deliverables for your review.",
    });

    await fetchMessages(activeOrderId);
    if (userId) await fetchConversations(userId);
  };

  if (pageLoading) {
    return (
      <div className="h-screen bg-background text-foreground flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col font-sans overflow-hidden">
      <Navbar />

      {/* Role info bar */}
      <div className="bg-neutral-900/30 px-6 py-3 border-b border-border/20 flex items-center gap-3 shrink-0">
        <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Inbox Workspace</span>
        <span className="text-neutral-600">•</span>
        <span className="text-[10px] text-primary uppercase font-bold">{conversations.length} Active Contracts</span>
      </div>

      {/* Three-panel layout */}
      <div className="flex-1 flex overflow-hidden w-full">

        {/* LEFT: Conversations List */}
        <div className="w-80 border-r border-border/20 flex flex-col bg-neutral-950 shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-border/10">
            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold block">
              Contracts ({conversations.length})
            </span>
          </div>

          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-neutral-500">No active contracts yet.</p>
            </div>
          ) : (
            <div className="flex-1 divide-y divide-border/10">
              {conversations.map((conv) => {
                const isSelected = conv.orderId === activeOrderId;
                return (
                  <button
                    key={conv.orderId}
                    onClick={() => setActiveOrderId(conv.orderId)}
                    className={`w-full text-left p-5 flex flex-col gap-2 transition-all cursor-pointer ${
                      isSelected ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-neutral-900/40"
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {conv.otherPerson?.full_name?.substring(0, 2)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{conv.otherPerson?.full_name || "User"}</h4>
                          <span className="text-[9px] text-neutral-400 block capitalize">{conv.myRole === "client" ? "Artisan" : "Client"}</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-neutral-400">{conv.lastTimestamp}</span>
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-serif text-xs font-semibold text-foreground line-clamp-1">{conv.projectTitle}</h5>
                      <p className="text-[11px] text-neutral-500 line-clamp-2 leading-snug font-light">{conv.lastMessage}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-medium">
                        ₦{conv.amount.toLocaleString()} Escrow
                      </span>
                      <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 border ${
                        conv.escrowStatus === "released"
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : conv.orderStatus === "delivered"
                          ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                          : "bg-primary/10 text-primary border-primary/20"
                      }`}>
                        {conv.escrowStatus === "released" ? "Released" : conv.orderStatus === "delivered" ? "Review Pending" : conv.orderStatus}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* CENTER: Chat Panel */}
        {activeConv ? (
          <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-border/10 flex items-center justify-between bg-neutral-900/10 shrink-0">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-sm font-bold">{activeConv.otherPerson?.full_name}</h3>
                  <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                    {activeConv.otherPerson?.school || "Nigeria"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-neutral-900 border border-border/20 px-2 py-0.5 text-neutral-400 uppercase tracking-wider">
                {activeConv.myRole === "client" ? "You are Client" : "You are Artisan"}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-grow p-6 overflow-y-auto space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-neutral-500">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  if (msg.is_system) {
                    return (
                      <div key={msg.id} className="flex justify-center my-4">
                        <div className="bg-primary/5 text-primary border border-primary/20 text-xs font-medium px-4 py-2 text-center max-w-md flex items-center gap-2">
                          <Sparkles className="h-4 w-4 shrink-0" />
                          <span>{msg.content}</span>
                        </div>
                      </div>
                    );
                  }

                  const isOwnMessage = msg.sender_id === userId;
                  return (
                    <div key={msg.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-md space-y-1 ${isOwnMessage ? "text-right" : "text-left"}`}>
                        <div className={`p-4 text-xs leading-relaxed rounded-lg ${
                          isOwnMessage
                            ? "bg-foreground text-background dark:bg-white dark:text-black font-medium"
                            : "bg-neutral-900/40 text-foreground border border-border/15"
                        }`}>
                          {msg.content}

                          {msg.attachment_name && (
                            <div className="mt-3 border border-border/20 bg-background/50 p-3 flex items-center gap-3 text-left text-[11px] text-foreground">
                              <ImageIcon className="h-5 w-5 text-primary shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{msg.attachment_name}</p>
                                <span className="text-[9px] text-neutral-400 uppercase tracking-wider">Attachment</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] text-neutral-400 px-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-neutral-950 border-t border-border/20 flex gap-3 shrink-0">
              <button type="button" className="p-2.5 bg-neutral-900 text-neutral-400 hover:text-primary transition-colors cursor-pointer border border-border/20">
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                type="text"
                placeholder="Send a message..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-grow bg-neutral-900 border border-border/20 text-xs px-4 py-2.5 outline-none focus:border-primary placeholder-neutral-500"
              />
              <button type="submit" className="p-2.5 bg-primary text-primary-foreground hover:bg-foreground hover:text-background transition-colors cursor-pointer">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <p className="text-xs text-neutral-500">Select a conversation or start a new contract.</p>
          </div>
        )}

        {/* RIGHT: Escrow Controls */}
        {activeConv && (
          <div className="w-72 border-l border-border/20 bg-neutral-950 p-6 flex flex-col gap-6 shrink-0 overflow-y-auto">
            <div className="space-y-1.5 border-b border-border/10 pb-4">
              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">Escrow Ledger</span>
              <h4 className="font-serif text-sm font-semibold line-clamp-2">{activeConv.projectTitle}</h4>
            </div>

            {activeConv.escrowStatus !== "released" ? (
              <div className="space-y-4">
                <div className="bg-primary/5 p-4 border border-primary/20 space-y-2">
                  <span className="text-[9px] uppercase text-primary font-bold block">Safelocked Vault</span>
                  <p className="text-xl font-serif font-bold">₦{activeConv.amount.toLocaleString()}</p>
                  <p className="text-[9px] text-neutral-400 leading-normal font-light">
                    Funds held in escrow until released by the client.
                  </p>
                </div>

                {activeConv.myRole === "client" ? (
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">Client Actions</span>
                    {activeConv.orderStatus === "delivered" ? (
                      <>
                        <button onClick={() => handleEscrowAction("release")}
                          className="w-full bg-primary text-primary-foreground font-semibold uppercase text-[10px] tracking-wider py-2.5 hover:bg-foreground hover:text-background transition-colors cursor-pointer">
                          Approve & Release Funds
                        </button>
                        <button onClick={() => handleEscrowAction("revision")}
                          className="w-full border border-border/30 hover:border-red-500 hover:text-red-500 text-[10px] uppercase font-bold py-2.5 transition-colors cursor-pointer">
                          Request Revisions
                        </button>
                      </>
                    ) : (
                      <div className="p-3 bg-neutral-900 text-neutral-500 text-[10px] leading-normal text-center border border-border/10">
                        Awaiting artisan delivery to activate review.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">Artisan Actions</span>
                    {activeConv.orderStatus === "in_progress" || activeConv.orderStatus === "revision" ? (
                      <button onClick={handleArtisanSubmit}
                        className="w-full bg-primary text-primary-foreground font-semibold uppercase text-[10px] tracking-wider py-2.5 hover:bg-foreground hover:text-background transition-colors cursor-pointer">
                        Submit Work for Review
                      </button>
                    ) : (
                      <div className="p-3 bg-neutral-900 text-neutral-500 text-[10px] leading-normal text-center border border-border/10">
                        Milestone under client review.
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
                  <p className="text-[9px] text-neutral-400 leading-normal">
                    All funds have been deposited to the artisan.
                  </p>
                </div>
              </div>
            )}

            <div className="border-t border-border/10 pt-4 space-y-3">
              <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block">Status</span>
              <div className="text-[10px] space-y-2 text-neutral-400">
                <div className="flex justify-between">
                  <span>Contract:</span>
                  <span className="font-semibold text-foreground">KW-{activeConv.orderId.substring(0, 6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Escrow:</span>
                  <span className="font-semibold text-foreground uppercase">{activeConv.escrowStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span>Order:</span>
                  <span className="font-semibold text-foreground uppercase">{activeConv.orderStatus}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
