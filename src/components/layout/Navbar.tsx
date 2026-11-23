import React, { useState } from 'react';
import {
  Store,
  Compass,
  FileQuestion,
  PlusCircle,
  User,
  Shield,
  Bell,
  MessageSquare,
  Menu,
  X,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Heart,
  Check,
  Package,
  Settings,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenSellModal?: () => void;
  onOpenProduct?: (product: Product) => void;
  onSelectDashboardTab?: (tab: 'postings' | 'wanted' | 'settings') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenSellModal,
  onOpenProduct,
  onSelectDashboardTab,
}) => {
  const {
    currentUser,
    isAdminMode,
    toggleAdminMode,
    notifications,
    chats,
    wishlist,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    resetDemoData,
    logoutUser,
    products,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const unreadChats = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const unreadNotifs = notifications.filter((n) => !n.read);
  const approvedCount = products.filter((p) => p.status === 'approved').length;

  const navigateTo = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setNotifDropdownOpen(false);
    setUserMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    isCta?: boolean;
    highlight?: boolean;
  }

  const isLoggedIn = currentUser.id !== 'guest' && Boolean(currentUser.email) && currentUser.verified;

  // ONLY these 4 items are inside the central Box as requested
  const boxNavItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Store },
    { id: 'marketplace', label: 'Marketplace', icon: Compass, badge: `${approvedCount}` },
    { id: 'wanted', label: 'Wanted Board', icon: FileQuestion },
    { id: 'sell', label: 'Sell Item', icon: PlusCircle, isCta: true },
  ];

  // Full nav items for mobile drawer
  const allNavItems: NavItem[] = [
    ...boxNavItems,
    ...(isLoggedIn
      ? [
          { id: 'chats', label: 'Student Chats', icon: MessageSquare, badge: unreadChats > 0 ? `${unreadChats}` : undefined },
          { id: 'wishlist', label: 'Saved Wishlist', icon: Heart, badge: wishlist.length > 0 ? `${wishlist.length}` : undefined },
          { id: 'dashboard', label: 'My Account', icon: User },
        ]
      : []),
  ];

  if (isAdminMode || currentUser.role === 'admin') {
    allNavItems.push({
      id: 'admin',
      label: 'Admin Moderation',
      icon: Shield,
      highlight: true,
    });
  }

  return (
    <header className="sticky top-3 sm:top-4 z-40 px-3 sm:px-6 w-full max-w-[1400px] mx-auto">
      <div className="bg-[#FFFBEA] rounded-2xl sm:rounded-3xl border-2.5 sm:border-3 border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] px-3 sm:px-5 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 w-full">
        {/* Brand Logo & Wordmark */}
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2 sm:gap-3 text-left group focus:outline-none shrink-0 cursor-pointer"
        >
          {/* Custom Marketplace + Campus Building Doodle Icon */}
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#F2A93B] border-2 border-[#1C1C1C] flex items-center justify-center shadow-[2px_2px_0px_#1C1C1C] group-hover:rotate-[-4deg] transition-transform">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-[#1C1C1C]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
              <path d="M2 7h20" />
              <circle cx="12" cy="7" r="1.5" fill="#1C1C1C" />
            </svg>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-head text-base sm:text-xl font-extrabold tracking-tight text-[#1C1C1C]">
                marketplace<span className="text-[#1C1C1C]">.</span>bmsit
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-accent italic text-[#1C1C1C]/75 -mt-0.5 hidden xs:block">
              Your College, Your Marketplace.
            </span>
          </div>
        </button>

        {/* ─── NAVIGATION LINKS (INSIDE FULL BOX) ─── */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
          {boxNavItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'sell') {
                    if (!isLoggedIn) {
                      onOpenAuth();
                      return;
                    }
                    if (onOpenSellModal) {
                      onOpenSellModal();
                      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                    }
                  } else {
                    navigateTo(item.id);
                  }
                }}
                className={`relative px-3 sm:px-3.5 py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? item.isCta
                      ? 'bg-[#FFE600] text-[#1C1C1C] border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C]'
                      : 'bg-[#F2A93B] text-[#1C1C1C] border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C]'
                    : item.isCta
                    ? 'bg-[#FFE600] text-[#1C1C1C] border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] hover:bg-[#FFD600]'
                    : 'text-[#1C1C1C]/85 hover:text-[#1C1C1C] hover:bg-black/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{item.label}</span>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold border border-[#1C1C1C]/40 ${
                      isActive ? 'bg-white text-[#1C1C1C]' : 'bg-white text-neutral-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ─── ACTIONS & PROFILE (INSIDE FULL BOX) ─── */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* ONLY DISPLAY CHATS, WISHLIST & NOTIFICATIONS ON TABLET/DESKTOP WHEN LOGGED IN */}
          {isLoggedIn && (
            <>
              {/* 1. SEPARATE CHAT BUTTON (Directly opens all chats) */}
              <button
                onClick={() => navigateTo('chats')}
                className={`flex relative p-2 sm:p-2.5 rounded-xl border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] transition items-center justify-center cursor-pointer shrink-0 ${
                  activeTab === 'chats'
                    ? 'bg-[#F2A93B] text-[#1C1C1C]'
                    : 'bg-white text-[#1C1C1C] hover:bg-[#FFE082]'
                }`}
                title="Open Student Chats"
                aria-label="Student Chats"
              >
                <MessageSquare className="w-4 h-4 text-[#1C1C1C]" />
                {unreadChats > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2563EB] text-white text-[10px] font-bold rounded-full border border-[#1C1C1C] flex items-center justify-center">
                    {unreadChats}
                  </span>
                )}
              </button>

              {/* 2. SEPARATE WISHLIST BUTTON (Right next to Chat) */}
              <button
                onClick={() => navigateTo('wishlist')}
                className={`hidden md:flex relative p-2.5 rounded-xl border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] transition items-center justify-center cursor-pointer ${
                  activeTab === 'wishlist'
                    ? 'bg-[#F2A93B] text-[#1C1C1C]'
                    : 'bg-white text-[#1C1C1C] hover:bg-[#FFE082]'
                }`}
                title="Saved Wishlist"
                aria-label="Saved Wishlist"
              >
                <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'fill-[#E1467A] text-[#E1467A]' : 'text-[#1C1C1C]'}`} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E1467A] text-white text-[10px] font-bold rounded-full border border-[#1C1C1C] flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* 3. SEPARATE NOTIFICATIONS BUTTON & DROPDOWN */}
              <div className="hidden md:block relative">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setUserMenuOpen(false);
                  }}
                  className="relative p-2.5 rounded-xl bg-white border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] hover:bg-[#FFE082] transition flex items-center justify-center cursor-pointer"
                  title="Campus Notifications"
                  aria-label="Campus Notifications"
                >
                  <Bell className="w-4 h-4 text-[#1C1C1C]" />
                  {unreadNotifs.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E1467A] text-white text-[10px] font-bold rounded-full border border-[#1C1C1C] flex items-center justify-center">
                      {unreadNotifs.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Menu */}
                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#FFFBF5] rounded-2xl border-2 border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1C1C1C]/15">
                      <div className="flex items-center gap-1.5">
                        <span className="font-head font-bold text-sm text-[#1C1C1C]">
                          Campus Notifications
                        </span>
                        {unreadNotifs.length > 0 && (
                          <span className="nb-sticker text-[9px] py-0 px-1.5 bg-[#FFE082]">
                            {unreadNotifs.length} new
                          </span>
                        )}
                      </div>
                      {unreadNotifs.length > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-[11px] font-bold text-[#E1467A] hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                      {unreadNotifs.length === 0 ? (
                        <div className="text-center py-6 px-3 bg-white rounded-xl border border-dashed border-[#1C1C1C]/25 text-neutral-600 space-y-1.5">
                          <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                          <div className="font-head font-bold text-xs text-[#1C1C1C]">All Caught Up!</div>
                          <p className="text-[11px] text-neutral-500">No unread notifications right now.</p>
                        </div>
                      ) : (
                        unreadNotifs.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markNotificationAsRead(n.id);
                              setNotifDropdownOpen(false);
                              if (n.link) {
                                if (n.link.includes('wanted')) navigateTo('wanted');
                                else if (n.link.includes('marketplace')) navigateTo('marketplace');
                                else navigateTo('dashboard');
                              }
                            }}
                            className="p-2.5 rounded-xl border border-[#1C1C1C]/25 bg-[#FFF9E6] text-xs transition hover:bg-[#FFF1D9] space-y-2 shadow-[1px_1px_0px_#1C1C1C] cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-[#1C1C1C] truncate">{n.title}</span>
                              <span className="text-[10px] text-neutral-500 font-mono shrink-0">{n.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-[#1C1C1C]/80 line-clamp-2 leading-relaxed">{n.message}</p>

                            <div className="flex items-center justify-end pt-1 border-t border-[#1C1C1C]/10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markNotificationAsRead(n.id);
                                }}
                                className="px-2.5 py-1 text-[10px] font-bold rounded-md border border-emerald-800 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition flex items-center gap-1 cursor-pointer shrink-0"
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3 text-emerald-800" />
                                <span>Mark as read</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Merged My Account & Profile Pill / Sign In button */}
          <div className="relative">
            {!isLoggedIn ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center justify-center gap-1.5 p-2 sm:px-3.5 sm:py-2 rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] text-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] hover:bg-[#e49b2f] transition font-bold text-xs sm:text-sm cursor-pointer shrink-0"
                title="Sign In / Register"
                aria-label="Sign In or Register"
              >
                <User className="w-5 h-5 sm:w-4 sm:h-4 text-[#1C1C1C]" />
                <span className="hidden sm:inline">Sign In / Register</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setNotifDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 p-1.5 sm:pl-2 sm:pr-3 sm:py-2 rounded-xl border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] transition cursor-pointer shrink-0 ${
                  activeTab === 'dashboard'
                    ? 'bg-[#F2A93B] text-[#1C1C1C]'
                    : 'bg-white text-[#1C1C1C] hover:bg-[#FFE082]'
                }`}
                title="My Account"
                aria-label="My Account"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-lg border border-[#1C1C1C] object-cover shrink-0"
                />
                <span className="text-xs sm:text-sm font-extrabold text-[#1C1C1C] hidden sm:inline">
                  My Account
                </span>
                <span className="text-xs font-semibold text-neutral-600 hidden md:inline">
                  ({currentUser.name.split(' ')[0]})
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#1C1C1C]/70 hidden sm:inline" />
              </button>
            )}

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-[#FFFBF5] rounded-2xl border-2 border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="pb-3 mb-2 border-b border-[#1C1C1C]/20">
                  <div className="font-head font-bold text-sm text-[#1C1C1C]">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-600">
                    USN: {currentUser.usn}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified @bmsit.in Student</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => {
                      if (onSelectDashboardTab) {
                        onSelectDashboardTab('postings');
                      } else {
                        setActiveTab('dashboard');
                      }
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl font-bold hover:bg-[#FFF9E6] flex items-center justify-between border border-transparent hover:border-[#1C1C1C]/20 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-[#F97316]" />
                      <span className="text-[#1C1C1C]">My Postings</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (onSelectDashboardTab) {
                        onSelectDashboardTab('wanted');
                      } else {
                        setActiveTab('dashboard');
                      }
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl font-bold hover:bg-[#FFF9E6] flex items-center justify-between border border-transparent hover:border-[#1C1C1C]/20 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileQuestion className="w-4 h-4 text-[#2563EB]" />
                      <span className="text-[#1C1C1C]">My Wanted Requests</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (onSelectDashboardTab) {
                        onSelectDashboardTab('settings');
                      } else {
                        setActiveTab('dashboard');
                      }
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl font-bold hover:bg-[#FFF9E6] flex items-center justify-between border border-transparent hover:border-[#1C1C1C]/20 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings className="w-4 h-4 text-[#1C1C1C]" />
                      <span className="text-[#1C1C1C]">Account Settings</span>
                    </div>
                  </button>

                  <div className="pt-2 mt-2 border-t border-[#1C1C1C]/15 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => {
                        logoutUser();
                        setUserMenuOpen(false);
                      }}
                      className="font-bold text-[#E1467A] hover:underline cursor-pointer flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle with unread indicator badge */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative lg:hidden p-2 sm:p-2.5 rounded-xl bg-white border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] hover:bg-[#FFE082] transition cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
          >
            {(unreadChats > 0 || unreadNotifs.length > 0) && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#E1467A] rounded-full border border-[#1C1C1C]" />
            )}
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[#1C1C1C]" />
            ) : (
              <Menu className="w-5 h-5 text-[#1C1C1C]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 bg-[#FFFBEA] rounded-2xl border-2 border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] p-4 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {allNavItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'sell') {
                      if (!isLoggedIn) {
                        onOpenAuth();
                        setMobileMenuOpen(false);
                        return;
                      }
                      if (onOpenSellModal) {
                        onOpenSellModal();
                        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                        setMobileMenuOpen(false);
                      }
                    } else {
                      navigateTo(item.id);
                    }
                  }}
                  className={`p-2.5 rounded-xl border-1.5 border-[#1C1C1C] text-xs font-bold flex items-center gap-2 ${
                    isActive
                      ? item.isCta
                        ? 'bg-[#FFE600] shadow-[2px_2px_0px_#1C1C1C]'
                        : 'bg-[#F2A93B] shadow-[2px_2px_0px_#1C1C1C]'
                      : item.isCta
                      ? 'bg-[#FFE600] shadow-[2px_2px_0px_#1C1C1C] hover:bg-[#FFD600]'
                      : 'bg-white hover:bg-[#FFF9E6]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#1C1C1C]/20 flex items-center justify-between text-xs">
            {currentUser.id !== 'guest' && currentUser.email ? (
              <>
                <span className="font-mono text-neutral-600 font-bold truncate max-w-[200px]">
                  {currentUser.name} ({currentUser.usn})
                </span>
                <button
                  onClick={() => {
                    logoutUser();
                    setMobileMenuOpen(false);
                  }}
                  className="text-[#E1467A] font-bold hover:underline shrink-0"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-[#F2A93B] font-bold text-center rounded-xl border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C]"
              >
                Sign In / Register with @bmsit.in
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
