"use client";

import { useEffect, useRef, useState } from "react";
import { Send, MessageCircle, Plus, X } from "lucide-react";

type ConversationSummary = {
  id: string;
  isGroup: boolean;
  name: string;
  otherUserId: string | null;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

type Message = {
  id: string;
  body: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  isMine: boolean;
};

type Person = { id: string; name: string; email: string };

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ChatApp({
  currentUserId,
  users,
  openWithUserId,
}: {
  currentUserId: string;
  users: Person[];
  openWithUserId: string | null;
}) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [showNew, setShowNew] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastFetchRef = useRef<string | null>(null);

  async function loadConversations() {
    const res = await fetch("/api/chat/conversations");
    const data = await res.json();
    setConversations(data);
    return data as ConversationSummary[];
  }

  async function openConversation(id: string) {
    setActiveId(id);
    const list = await fetch(`/api/chat/conversations/${id}`).then((r) => r.json());
    setMessages(list);
    lastFetchRef.current = new Date().toISOString();
    await fetch(`/api/chat/conversations/${id}`, { method: "PATCH" });
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)));
  }

  async function startConversationWithUser(userId: string) {
    const res = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const conv = await res.json();
    setShowNew(false);
    await loadConversations();
    openConversation(conv.id);
  }

  async function sendMessage() {
    if (!draft.trim() || !activeId) return;
    const body = draft.trim();
    setDraft("");
    const res = await fetch(`/api/chat/conversations/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const msg = await res.json();
    setMessages((prev) => [...prev, msg]);
    lastFetchRef.current = msg.createdAt;
    loadConversations();
  }

  useEffect(() => {
    loadConversations().then((list) => {
      if (openWithUserId) {
        const existing = list.find((c) => c.otherUserId === openWithUserId);
        if (existing) {
          openConversation(existing.id);
        } else {
          startConversationWithUser(openWithUserId);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      loadConversations();
      if (activeId) {
        const since = lastFetchRef.current ?? "";
        const res = await fetch(`/api/chat/conversations/${activeId}?since=${encodeURIComponent(since)}`);
        if (res.ok) {
          const newMsgs: Message[] = await res.json();
          if (newMsgs.length > 0) {
            setMessages((prev) => [...prev, ...newMsgs]);
            lastFetchRef.current = newMsgs[newMsgs.length - 1].createdAt;
            await fetch(`/api/chat/conversations/${activeId}`, { method: "PATCH" });
          }
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const active = conversations.find((c) => c.id === activeId);

  return (
    <div className="flex h-full glass-panel rounded-2xl overflow-hidden">
      <div className="w-72 border-r border-gray-100 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-sm">Messages</h2>
          <button onClick={() => setShowNew((v) => !v)} className="text-gray-400 hover:text-brand">
            <Plus size={18} />
          </button>
        </div>

        {showNew && (
          <div className="border-b border-gray-100 p-2 max-h-56 overflow-y-auto space-y-1">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => startConversationWithUser(u.id)}
                className="w-full flex items-center gap-2 text-left text-sm rounded-lg px-2 py-1.5 hover:bg-gray-50"
              >
                <span className="h-7 w-7 rounded-full bg-brand/10 text-brand text-[10px] font-semibold flex items-center justify-center shrink-0">
                  {initials(u.name)}
                </span>
                {u.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && (
            <p className="text-xs text-gray-400 p-4">Aucune conversation. Cliquez sur + pour démarrer.</p>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => openConversation(c.id)}
              className={`w-full flex items-center gap-2.5 text-left px-4 py-3 border-b border-gray-50 ${
                activeId === c.id ? "bg-brand/5" : "hover:bg-gray-50"
              }`}
            >
              <span className="h-9 w-9 rounded-full bg-brand/10 text-brand text-xs font-semibold flex items-center justify-center shrink-0">
                {initials(c.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  {c.unreadCount > 0 && (
                    <span className="text-[10px] bg-brand text-white rounded-full px-1.5 py-0.5">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{c.lastMessage ?? "Nouvelle conversation"}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {active ? (
          <>
            <div className="flex items-center gap-2.5 p-4 border-b border-gray-100">
              <span className="h-8 w-8 rounded-full bg-brand/10 text-brand text-xs font-semibold flex items-center justify-center">
                {initials(active.name)}
              </span>
              <p className="font-medium text-sm">{active.name}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-sm rounded-2xl px-3 py-2 text-sm ${
                      m.isMine ? "bg-brand text-white" : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {!m.isMine && <p className="text-[10px] opacity-70 mb-0.5">{m.senderName}</p>}
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="flex items-center gap-2 p-3 border-t border-gray-100">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Votre message..."
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
              <button onClick={sendMessage} className="bg-brand text-white rounded-xl px-3 py-2">
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-2">
            <MessageCircle size={32} />
            <p className="text-sm">Sélectionnez une conversation ou démarrez-en une nouvelle.</p>
          </div>
        )}
      </div>
    </div>
  );
}
