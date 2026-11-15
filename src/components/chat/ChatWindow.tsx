import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  MessageCircle,
  ShieldCheck,
  Search,
  ArrowLeft,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, ChatConversation } from '../../types';

interface ChatWindowProps {
  initialConversationId?: string;
  onOpenProduct?: (product: Product) => void;
  onExploreMarketplace?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  initialConversationId,
  onExploreMarketplace,
}) => {
  const { chats, sendMessage, currentUser, markChatAsRead } = useApp();

  const [activeConvId, setActiveConvId] = useState<string>(
    initialConversationId || (chats.length > 0 ? chats[0].id : '')
  );
  const [inputText, setInputText] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>(
    initialConversationId ? 'chat' : 'list'
  );
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Sync if initialConversationId changes
  useEffect(() => {
    if (initialConversationId) {
      setActiveConvId(initialConversationId);
      setMobileView('chat');
      markChatAsRead(initialConversationId);
    }
  }, [initialConversationId]);

  // Fallback to first chat if activeConvId is not set or not in user's private list
  useEffect(() => {
    const isCurrentActiveValid = chats.some((c) => c.id === activeConvId);
    if (!isCurrentActiveValid && chats.length > 0) {
      setActiveConvId(chats[0].id);
    } else if (chats.length === 0) {
      setActiveConvId('');
    }
  }, [chats, activeConvId]);

  // Mark as read ONLY when active conversation changes
  useEffect(() => {
    if (activeConvId) {
      markChatAsRead(activeConvId);
    }
  }, [activeConvId]);

  // Dynamic Participant Resolver: strictly gets the OTHER student, ensuring 100% privacy
  const getOtherParticipant = (c: ChatConversation) => {
    if (c.participants && Array.isArray(c.participants) && c.participants.length > 0) {
      const found = c.participants.find((p) => p.id !== currentUser.id);
      if (found) return found;
    }
    if (c.otherParticipant && c.otherParticipant.id !== currentUser.id) {
      return c.otherParticipant;
    }
    return {
      id: 'student',
      name: 'BMSIT Student',
      usn: '1BY24...',
      branch: 'BMSIT',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    };
  };

  // Get active conversation
  const activeConv = chats.find((c) => c.id === activeConvId);
  const activeOther = activeConv ? getOtherParticipant(activeConv) : null;
  const messagesCount = activeConv?.messages.length || 0;

  // Scroll ONLY the internal chat container to bottom when messages update
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [activeConvId, messagesCount]);

  // Filtered conversation list
  const filteredChats = chats.filter((c) => {
    if (!chatSearch.trim()) return true;
    const q = chatSearch.toLowerCase();
    const other = getOtherParticipant(c);
    return (
      other.name.toLowerCase().includes(q) ||
      other.usn.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  // Helper to ensure date is always visible in chat screen
  const formatMessageTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    if (/[A-Za-z]{3}/.test(timestamp) || timestamp.includes('/') || timestamp.includes('-')) {
      return timestamp;
    }
    const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return `${todayStr}, ${timestamp}`;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    sendMessage(activeConvId, inputText.trim());
    setInputText('');
  };

  return (
    <div className="bg-white rounded-3xl border-3 border-[#1C1C1C] shadow-[6px_6px_0px_#1C1C1C] overflow-hidden flex flex-col md:grid md:grid-cols-12 h-[640px] max-h-[calc(100vh-200px)] min-h-[500px]">
      {/* Left Pane: Conversation List */}
      <div
        className={`md:col-span-4 border-r-2 border-[#1C1C1C] bg-[#FFFBEA] flex flex-col h-full min-h-0 ${
          mobileView === 'chat' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b-2 border-[#1C1C1C] bg-[#FFF9E6] shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-head text-base font-bold text-[#1C1C1C] flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-[#F2A93B]" />
              <span>Campus Messages</span>
            </h3>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#1C1C1C] bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation Items List */}
        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-[#1C1C1C]/15">
          {filteredChats.length > 0 ? (
            filteredChats.map((c) => {
              const isActive = c.id === activeConvId;
              const other = getOtherParticipant(c);

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveConvId(c.id);
                    setMobileView('chat');
                    markChatAsRead(c.id);
                  }}
                  className={`p-3.5 cursor-pointer transition ${
                    isActive
                      ? 'bg-[#FFF1D9] border-l-4 border-l-[#F2A93B]'
                      : 'bg-transparent hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <img
                      src={other.avatar}
                      alt={other.name}
                      className="w-10 h-10 rounded-full border-1.5 border-[#1C1C1C] object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-head font-bold text-xs truncate text-[#1C1C1C]">
                          {other.name}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {c.lastMessageTime}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-700 truncate font-normal">
                        {c.lastMessage}
                      </p>
                    </div>

                    {c.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#E1467A] text-white text-[10px] font-bold flex items-center justify-center border border-[#1C1C1C] shrink-0">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-neutral-500 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#F2A93B] border-2 border-[#1C1C1C] mx-auto flex items-center justify-center font-bold text-base shadow-[2px_2px_0px_#1C1C1C]">
                💬
              </div>
              <p className="font-bold text-[#1C1C1C]">No Messages Yet</p>
              <p className="text-[11px] text-neutral-600 max-w-[200px] mx-auto leading-relaxed">
                Connect with sellers or reply to wanted requests to start a chat.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat Conversation */}
      <div
        className={`md:col-span-8 flex flex-col h-full min-h-0 bg-[#FFFAF4] ${
          mobileView === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConv && activeOther ? (
          <>
            {/* Active Header - ONLY Student Info & Verification Badge (No product preview) */}
            <div className="p-4 border-b-2 border-[#1C1C1C] bg-[#FFFBEA] shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-1.5 rounded-lg border-2 border-[#1C1C1C] bg-white text-[#1C1C1C] hover:bg-[#FFE082] transition"
                    title="Back to conversations list"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <img
                    src={activeOther.avatar}
                    alt={activeOther.name}
                    className="w-10 h-10 rounded-full border-2 border-[#1C1C1C] object-cover shadow-[1.5px_1.5px_0px_#1C1C1C]"
                  />
                  <div>
                    <h4 className="font-head font-bold text-base text-[#1C1C1C] leading-tight">
                      {activeOther.name}
                    </h4>
                    <span className="text-xs font-mono text-neutral-600">
                      USN: {activeOther.usn}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-md border border-emerald-900 bg-emerald-100 text-emerald-900 font-semibold flex items-center gap-1 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                    <span className="hidden sm:inline">@bmsit.in Student</span>
                    <span className="sm:hidden">Verified</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Scroll Area - absorbs remaining height, stays scrollable */}
            <div
              ref={messagesContainerRef}
              className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#FFFAF4]"
            >
              {/* Date Header Indicator */}
              <div className="flex items-center justify-center my-1 select-none">
                <span className="text-[11px] font-bold font-mono px-3.5 py-1 rounded-full bg-[#FFFBEA] border border-[#1C1C1C] text-neutral-700 shadow-[1.5px_1.5px_0px_#1C1C1C] flex items-center gap-1.5">
                  <span>📅</span>
                  <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </span>
              </div>

              {activeConv.messages.map((m) => {
                const isMe = m.senderId === currentUser.id;

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3 sm:p-3.5 rounded-2xl border-2 border-[#1C1C1C] text-xs sm:text-sm leading-relaxed shadow-[2px_2px_0px_#1C1C1C] ${
                        isMe
                          ? 'bg-[#F2A93B] text-[#1C1C1C] rounded-tr-none'
                          : 'bg-white text-[#1C1C1C] rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    </div>

                    <span className="text-[10px] text-neutral-500 font-mono mt-1 px-1">
                      {formatMessageTimestamp(m.timestamp)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Input Bar - permanently pinned at bottom, never pushed down or hidden */}
            <form
              onSubmit={handleSend}
              className="p-3 sm:p-4 bg-white border-t-2 border-[#1C1C1C] flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message to this student... (Press Enter to send)"
                className="flex-1 px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl border-2 border-[#1C1C1C] bg-[#FFFBF5] focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 sm:py-3 rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] hover:bg-[#e49b2f] text-xs sm:text-sm font-bold text-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-600 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F2A93B] border-2.5 border-[#1C1C1C] flex items-center justify-center shadow-[3.5px_3.5px_0px_#1C1C1C]">
              <Compass className="w-8 h-8 text-[#1C1C1C]" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h4 className="font-head font-extrabold text-xl sm:text-2xl text-[#1C1C1C]">
                Explore marketplace.bmsit!
              </h4>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Find textbooks, drafters, calculators, cycles, and lab coats from BMSIT seniors and batchmates.
              </p>
            </div>
            {onExploreMarketplace && (
              <button
                type="button"
                onClick={onExploreMarketplace}
                className="mt-1 px-5 py-2.5 rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] hover:bg-[#e49b2f] font-head font-extrabold text-xs sm:text-sm text-[#1C1C1C] shadow-[2.5px_2.5px_0px_#1C1C1C] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition flex items-center gap-2 cursor-pointer"
              >
                <span>Browse Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
