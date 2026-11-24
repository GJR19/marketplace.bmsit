import React, { useState } from 'react';
import {
  User,
  Package,
  Heart,
  FileQuestion,
  MessageCircle,
  Settings,
  PlusCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Trash2,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Tag,
  Calendar,
  Lock,
  Bell,
  Eye,
  X,
  Camera,
  Upload,
  LogOut,
  Mail,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, ProductCategory, WantedRequest } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { ProductCard } from '../components/product/ProductCard';
import { formatPriceINR } from '../utils/usnParser';
import { normalizeCampusLocation } from '../data/mockData';
import { supabase } from '../lib/supabase';

interface DashboardPageProps {
  initialTab?: 'postings' | 'wanted' | 'settings';
  onTabChange?: (tab: 'postings' | 'wanted' | 'settings') => void;
  onOpenSellModal: () => void;
  onOpenProduct: (product: Product) => void;
  onOpenAuth: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  initialTab = 'postings',
  onTabChange,
  onOpenSellModal,
  onOpenProduct,
  onOpenAuth,
}) => {
  const {
    currentUser,
    products,
    wishlist,
    wantedRequests,
    chats,
    markAsSold,
    deleteProduct,
    updateProduct,
    updateWantedRequest,
    deleteWantedRequest,
    updateProfile,
    pushToast,
    logoutUser,
  } = useApp();

  const [activeTab, setActiveTabState] = useState<'postings' | 'wanted' | 'settings'>(
    initialTab || 'postings'
  );

  // Password Reset state in Settings
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [sendingResetEmail, setSendingResetEmail] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      pushToast('Please enter a new password.', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      pushToast('Password must be at least 6 characters.', 'warning');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      pushToast('Passwords do not match.', 'error');
      return;
    }

    setUpdatingPassword(true);
    try {
      // 1. Check for active Supabase session
      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { data: refreshRes } = await supabase.auth.refreshSession();
        session = refreshRes?.session;
      }

      // If still no session, the user's session expired or is missing
      if (!session) {
        if (currentUser.email && currentUser.email.endsWith('@bmsit.in')) {
          const { error: resetErr } = await supabase.auth.resetPasswordForEmail(currentUser.email, {
            redirectTo: `${window.location.origin}/`,
          });
          if (!resetErr) {
            pushToast(
              `Session expired. We sent a secure password reset link to ${currentUser.email}. Please check your email!`,
              'info'
            );
            return;
          }
        }

        pushToast('Your session has expired. Please sign in to update your password.', 'warning');
        onOpenAuth();
        return;
      }

      // 2. Active session verified -> update password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        if (error.message.toLowerCase().includes('session')) {
          pushToast('Your session has expired. Please sign in to update your password.', 'warning');
          onOpenAuth();
          return;
        }
        throw error;
      }

      pushToast('Password updated successfully!', 'success');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      pushToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const setActiveTab = (tab: 'postings' | 'wanted' | 'settings') => {
    setActiveTabState(tab);
    if (onTabChange) onTabChange(tab);
  };

  React.useEffect(() => {
    if (initialTab) {
      setActiveTabState(initialTab);
    }
  }, [initialTab]);

  // My Postings filter: strictly Live and Sold
  const [postingsFilter, setPostingsFilter] = useState<'live' | 'sold'>('live');

  // Deletion modal state for Products
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Edit Product Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState<number | ''>('');
  const [editOriginalPrice, setEditOriginalPrice] = useState<number | ''>('');
  const [editDescription, setEditDescription] = useState('');

  // Rejection modal state (viewing reason)
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionProduct, setRejectionProduct] = useState<Product | null>(null);

  // Wanted Requests Edit & Delete state
  const [editWantedModalOpen, setEditWantedModalOpen] = useState(false);
  const [wantedToEdit, setWantedToEdit] = useState<WantedRequest | null>(null);
  const [editWantedTitle, setEditWantedTitle] = useState('');
  const [editWantedCategory, setEditWantedCategory] = useState<ProductCategory>('Books');
  const [editWantedMinBudget, setEditWantedMinBudget] = useState<number | ''>('');
  const [editWantedMaxBudget, setEditWantedMaxBudget] = useState<number | ''>('');
  const [editWantedCondition, setEditWantedCondition] = useState<string>('Good');
  const [editWantedDescription, setEditWantedDescription] = useState('');

  const [deleteWantedModalOpen, setDeleteWantedModalOpen] = useState(false);
  const [wantedToDelete, setWantedToDelete] = useState<WantedRequest | null>(null);

  // User Postings
  const myPostings = products.filter((p) => p.sellerId === currentUser.id);
  const liveCount = myPostings.filter((p) => p.status === 'approved').length;
  const soldCount = myPostings.filter((p) => p.status === 'sold').length;

  // Filtered Postings: strictly Live or Sold
  const filteredPostings = myPostings.filter((p) => {
    if (postingsFilter === 'live') return p.status === 'approved';
    if (postingsFilter === 'sold') return p.status === 'sold';
    return true;
  });

  // User Wishlisted Products
  const myWishlistProducts = products.filter((p) => wishlist.includes(p.id));

  // User Wanted Requests
  const myWanted = wantedRequests.filter((r) => r.studentId === currentUser.id);

  // KPIs
  const totalPostingsCount = myPostings.length;
  const activeListingsCount = liveCount;
  const pendingCount = myPostings.filter((p) => p.status === 'pending_approval').length;
  const unreadChatsCount = chats.reduce((acc, c) => acc + c.unreadCount, 0);

  const openEditWantedModal = (req: WantedRequest) => {
    setWantedToEdit(req);
    setEditWantedTitle(req.title);
    setEditWantedCategory((req.category as ProductCategory) || 'Books');
    setEditWantedMinBudget(req.minBudget || '');
    setEditWantedMaxBudget(req.maxBudget || '');
    setEditWantedCondition(req.preferredCondition || 'Good');
    setEditWantedDescription(req.description || '');
    setEditWantedModalOpen(true);
  };

  const handleEditWantedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wantedToEdit) return;

    updateWantedRequest(wantedToEdit.id, {
      title: editWantedTitle.trim(),
      category: editWantedCategory,
      minBudget: editWantedMinBudget !== '' ? Number(editWantedMinBudget) : undefined,
      maxBudget: editWantedMaxBudget !== '' ? Number(editWantedMaxBudget) : undefined,
      preferredCondition: editWantedCondition,
      description: editWantedDescription.trim(),
    });

    setEditWantedModalOpen(false);
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToEdit) return;

    updateProduct(productToEdit.id, {
      title: editTitle.trim(),
      price: Number(editPrice),
      originalPrice: editOriginalPrice ? Number(editOriginalPrice) : undefined,
      description: editDescription.trim(),
      // If editing a rejected product, resubmit it for review!
      status: productToEdit.status === 'rejected' ? 'pending_approval' : productToEdit.status,
    });

    setEditModalOpen(false);
  };

  const openEditModal = (p: Product) => {
    setProductToEdit(p);
    setEditTitle(p.title);
    setEditPrice(p.price);
    setEditOriginalPrice(p.originalPrice || '');
    setEditDescription(p.description || '');
    setEditModalOpen(true);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        pushToast('Image file size must be less than 4MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateProfile({ avatar: event.target.result as string });
          pushToast('Profile photo updated successfully!', 'success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Banner */}
      <div className="bg-[#FFF9E6] rounded-3xl border-3 border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative group shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-[#1C1C1C] object-cover shadow-[3px_3px_0px_#1C1C1C]"
            />
            <label
              className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-lg bg-[#F2A93B] border border-[#1C1C1C] cursor-pointer shadow-[1.5px_1.5px_0px_#1C1C1C] hover:bg-[#e49b2f] transition flex items-center justify-center"
              title="Change Profile Photo"
            >
              <Camera className="w-3.5 h-3.5 text-[#1C1C1C]" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </label>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="nb-sticker text-xs bg-[#FFE082]">
                ★ BMSIT STUDENT ACCOUNT
              </span>
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified
              </span>
            </div>
            <h1 className="font-head text-2xl sm:text-3xl font-extrabold text-[#1C1C1C]">
              Welcome back, {currentUser.name}!
            </h1>
            <p className="text-xs text-neutral-600 font-mono mt-0.5">
              USN: <span className="font-bold text-[#1C1C1C]">{currentUser.usn}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSellModal}
          className="self-start md:self-auto px-5 py-2.5 rounded-full border-2 border-[#1C1C1C] bg-[#F2A93B] font-bold text-xs sm:text-sm text-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] hover:bg-[#e49b2f] transition flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4 text-[#1C1C1C]" />
          <span>Post New Item</span>
        </button>
      </div>

      {/* Main Grid: Left Sidebar Navigation + Right Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Left Sidebar Tabs - ONLY 3 OPTIONS */}
        <aside className="lg:col-span-3 bg-[#FFFBEA] p-4 rounded-2xl border-2 border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] space-y-1.5">
          {[
            { id: 'postings', label: 'My Postings', icon: Package, badge: `${totalPostingsCount}` },
            { id: 'wanted', label: 'My Wanted Requests', icon: FileQuestion, badge: `${myWanted.length}` },
            { id: 'settings', label: 'Account Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                  isActive
                    ? 'bg-[#F2A93B] text-[#1C1C1C] border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C]'
                    : 'text-neutral-700 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>

                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full border border-[#1C1C1C]/40 ${
                      isActive ? 'bg-white text-[#1C1C1C]' : 'bg-[#FFF9E6] text-neutral-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Right Content Panel */}
        <main className="lg:col-span-9 space-y-6">
          {/* ─── TAB 1: MY POSTINGS ─── */}
          {activeTab === 'postings' && (
            <div className="space-y-4">
              {/* Postings Filter Pills - ONLY 2 OPTIONS: LIVE AND SOLD */}
              <div className="flex items-center gap-2 p-1.5 bg-[#FFFBEA] rounded-2xl border-2 border-[#1C1C1C] shadow-[2.5px_2.5px_0px_#1C1C1C] text-xs w-fit">
                {[
                  { id: 'live', label: `Live (${liveCount})` },
                  { id: 'sold', label: `Sold (${soldCount})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setPostingsFilter(f.id as any)}
                    className={`px-4 py-1.5 rounded-xl font-extrabold transition cursor-pointer ${
                      postingsFilter === f.id
                        ? 'bg-[#F2A93B] text-[#1C1C1C] border-2 border-[#1C1C1C] shadow-[1.5px_1.5px_0px_#1C1C1C]'
                        : 'text-neutral-700 hover:bg-white border-2 border-transparent'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Items List */}
              {filteredPostings.length > 0 ? (
                <div className="space-y-3">
                  {filteredPostings.map((p) => {
                    const isSold = p.status === 'sold';
                    const isPending = p.status === 'pending_approval';
                    const isRejected = p.status === 'rejected';

                    return (
                      <div
                        key={p.id}
                        className={`p-4 rounded-2xl border-2 border-[#1C1C1C] bg-white shadow-[3px_3px_0px_#1C1C1C] flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                          isSold ? 'opacity-85 bg-neutral-50' : ''
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={p.images[0]}
                              alt={p.title}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-[#1C1C1C]"
                            />
                            {isSold && (
                              <span className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center text-[10px] font-extrabold text-white rotate-[-6deg]">
                                SOLD
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border border-[#1C1C1C] ${
                                  p.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : p.status === 'sold'
                                    ? 'bg-[#E1467A] text-white'
                                    : p.status === 'pending_approval'
                                    ? 'bg-[#FFE082] text-[#1C1C1C]'
                                    : p.status === 'rejected'
                                    ? 'bg-[#FDF2F4] text-[#E1467A]'
                                    : 'bg-amber-100'
                                }`}
                              >
                                {p.status.toUpperCase().replace('_', ' ')}
                              </span>
                              <span className="text-[11px] text-neutral-500 font-mono">
                                Posted: {p.postedDate}
                              </span>
                            </div>

                            <h4
                              onClick={() => onOpenProduct(p)}
                              className="font-head font-bold text-sm sm:text-base text-[#1C1C1C] truncate cursor-pointer hover:text-[#E1467A]"
                            >
                              {p.title}
                            </h4>

                            <div className="text-xs font-head font-extrabold text-[#F2A93B]">
                              {formatPriceINR(p.price)}
                              {p.originalPrice && (
                                <span className="font-accent italic text-xs text-[#E1467A] line-through font-bold ml-2">
                                  {formatPriceINR(p.originalPrice)}
                                </span>
                              )}
                            </div>

                            {/* Rejection comment notice */}
                            {isRejected && p.rejectionReason && (
                              <div className="text-[11px] text-[#E1467A] font-semibold flex items-center gap-1 mt-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Reason: {p.rejectionReason}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Lifecycle Action Buttons */}
                        <div className="flex flex-wrap items-center gap-1.5 self-end md:self-center shrink-0">
                          {/* MARK AS SOLD BUTTON */}
                          {!isSold && p.status === 'approved' && (
                            <button
                              onClick={() => markAsSold(p.id)}
                              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#1C1C1C] bg-[#E1467A] text-white shadow-[1.5px_1.5px_0px_#1C1C1C] hover:bg-[#c93b6a] transition cursor-pointer"
                            >
                              Mark as Sold 🏷️
                            </button>
                          )}

                          {/* ONCE MARK AS SOLD IS TICKED, DONT GIVE OPTION TO RESTORE */}
                          {isSold && (
                            <span className="nb-sticker rose text-[10px] py-1 px-2.5 shadow-[1.5px_1.5px_0px_#1C1C1C]">
                              ✓ SOLD (ARCHIVED)
                            </span>
                          )}

                          {/* Edit button (Only available when live) */}
                          {!isSold && (
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded-lg border border-[#1C1C1C] bg-white hover:bg-[#FFF9E6] transition cursor-pointer"
                              title="Edit listing details"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#1C1C1C]" />
                            </button>
                          )}

                          {/* Delete button (Only available when live - disabled once sold) */}
                          {!isSold && (
                            <button
                              onClick={() => {
                                setProductToDelete(p);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-[#1C1C1C] bg-white hover:bg-[#FDF2F4] text-[#E1467A] transition cursor-pointer"
                              title="Delete listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border-2 border-[#1C1C1C] space-y-2">
                  <p className="text-xs text-neutral-600 font-bold">
                    No postings found in "{postingsFilter}".
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 2: MY WANTED REQUESTS ─── */}
          {activeTab === 'wanted' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-head font-bold text-lg text-[#1C1C1C]">
                  Your Wanted Requests ({myWanted.length})
                </h3>
              </div>

              {myWanted.length > 0 ? (
                <div className="space-y-3">
                  {myWanted.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 bg-white rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFE082] border border-[#1C1C1C]">
                            {req.category}
                          </span>
                          <span className="text-neutral-500 font-mono text-xs">
                            Posted: {req.postedDate}
                          </span>
                        </div>
                        <h4 className="font-head font-bold text-base text-[#1C1C1C]">
                          {req.title}
                        </h4>
                        {req.description && (
                          <p className="text-xs text-neutral-600 line-clamp-2">
                            {req.description}
                          </p>
                        )}
                        {(req.minBudget || req.maxBudget) && (
                          <div className="text-xs font-mono font-bold text-[#F97316]">
                            Budget: {req.minBudget ? `₹${req.minBudget}` : ''}
                            {req.minBudget && req.maxBudget ? ' - ' : ''}
                            {req.maxBudget ? `₹${req.maxBudget}` : ''}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* ONLY 2 OPTIONS: EDIT AND DELETE */}
                        <button
                          onClick={() => openEditWantedModal(req)}
                          className="px-3 py-1.5 rounded-xl border-2 border-[#1C1C1C] bg-[#FFFBEA] hover:bg-[#FFE082] font-bold text-xs text-[#1C1C1C] shadow-[1.5px_1.5px_0px_#1C1C1C] flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#1C1C1C]" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setWantedToDelete(req);
                            setDeleteWantedModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl border-2 border-[#1C1C1C] bg-[#FDF2F4] hover:bg-[#FCE7EB] font-bold text-xs text-[#E1467A] shadow-[1.5px_1.5px_0px_#1C1C1C] flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border-2 border-[#1C1C1C] text-xs text-neutral-600">
                  You haven't posted any Wanted Requests yet.
                </div>
              )}
            </div>
          )}

          {/* ─── TAB 3: ACCOUNT SETTINGS ─── */}
          {activeTab === 'settings' && (
            <div className="p-6 bg-white rounded-3xl border-3 border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] space-y-6">
              <h3 className="font-head font-bold text-xl text-[#1C1C1C] pb-3 border-b border-[#1C1C1C]/15">
                BMSIT Student Account Settings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#1C1C1C] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={currentUser.name}
                    onChange={(e) => updateProfile({ name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border-2 border-[#1C1C1C] bg-[#FFFBF5]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1C1C1C] mb-1">
                    College Email (Read-only verified)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full p-2.5 rounded-xl border-2 border-neutral-300 bg-neutral-100 text-neutral-500 font-mono cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1C1C1C] mb-1">
                    University Seat Number (USN)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.usn}
                    className="w-full p-2.5 rounded-xl border-2 border-neutral-300 bg-neutral-100 text-neutral-500 font-mono cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Profile Photo Customization */}
              <div className="pt-4 border-t border-[#1C1C1C]/15 space-y-4">
                <div>
                  <h4 className="font-head font-bold text-base text-[#1C1C1C]">
                    Profile Photo
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Upload your profile picture (JPEG, PNG or WebP under 4MB).
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="relative w-20 h-20 rounded-2xl border-3 border-[#1C1C1C] overflow-hidden shadow-[3px_3px_0px_#1C1C1C] bg-[#FFE082] flex-shrink-0">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] text-xs font-bold text-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] cursor-pointer hover:bg-[#e49b2f] transition">
                      <Upload className="w-4 h-4" />
                      <span>Upload New Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Password Reset */}
              <div className="pt-4 border-t border-[#1C1C1C]/15 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-head font-bold text-base text-[#1C1C1C]">
                      Password Reset
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Update your account password securely.
                    </p>
                  </div>
                  {currentUser.email && (
                    <button
                      type="button"
                      disabled={sendingResetEmail}
                      onClick={async () => {
                        setSendingResetEmail(true);
                        try {
                          const { error } = await supabase.auth.resetPasswordForEmail(currentUser.email, {
                            redirectTo: `${window.location.origin}/`,
                          });
                          if (error) throw error;
                          pushToast(`Password reset link sent to ${currentUser.email}!`, 'success');
                        } catch (err: any) {
                          pushToast(err.message || 'Failed to send reset link.', 'error');
                        } finally {
                          setSendingResetEmail(false);
                        }
                      }}
                      className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{sendingResetEmail ? 'Sending link...' : 'Or send reset link to email →'}</span>
                    </button>
                  )}
                </div>
                <form onSubmit={handlePasswordUpdate} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full p-2.5 text-base sm:text-xs rounded-xl border-2 border-[#1C1C1C] bg-[#FFFBF5] shadow-[2px_2px_0px_#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="w-full p-2.5 text-base sm:text-xs rounded-xl border-2 border-[#1C1C1C] bg-[#FFFBF5] shadow-[2px_2px_0px_#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="px-5 py-2.5 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] shadow-[2px_2px_0px_#1C1C1C] hover:bg-[#e49b2f] transition cursor-pointer disabled:opacity-50"
                  >
                    {updatingPassword ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </div>

              {/* Sign Out */}
              <div className="pt-4 border-t border-[#1C1C1C]/15 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => logoutUser()}
                  className="px-4 py-2 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-white text-[#E1467A] shadow-[2px_2px_0px_#1C1C1C] hover:bg-rose-50 transition cursor-pointer flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Listing?"
        message={`Are you sure you want to permanently delete "${productToDelete?.title}"? This cannot be undone.`}
        confirmLabel="Yes, Delete"
        variant="danger"
        onConfirm={() => {
          if (productToDelete) {
            deleteProduct(productToDelete.id);
            setDeleteModalOpen(false);
          }
        }}
        onCancel={() => setDeleteModalOpen(false)}
      />

      {/* EDIT PRODUCT MODAL */}
      {editModalOpen && productToEdit && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#FFFBF5] rounded-3xl border-3 border-[#1C1C1C] shadow-[7px_7px_0px_#1C1C1C] p-6 sm:p-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-head text-lg font-bold text-[#1C1C1C]">
                Edit Listing: {productToEdit.title}
              </h3>
              <button onClick={() => setEditModalOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                    Selling Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2.5 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C]"
                    placeholder="e.g. 450"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                    Original Price / MRP (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editOriginalPrice}
                    onChange={(e) => setEditOriginalPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2.5 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C]"
                    placeholder="e.g. 900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C]"
                />
              </div>

              {productToEdit.status === 'rejected' && (
                <div className="p-3 bg-[#FFF1D9] rounded-xl border border-[#1C1C1C]/30 text-xs">
                  ℹ️ Saving changes will resubmit this listing to the <strong>pending moderator approval queue</strong>.
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#1C1C1C] bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] shadow-[2px_2px_0px_#1C1C1C]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT WANTED REQUEST MODAL */}
      {editWantedModalOpen && wantedToEdit && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#FFFBF5] rounded-3xl border-3 border-[#1C1C1C] shadow-[7px_7px_0px_#1C1C1C] p-6 sm:p-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#1C1C1C]/15">
              <h3 className="font-head text-lg font-bold text-[#1C1C1C]">
                Edit Wanted Request
              </h3>
              <button
                onClick={() => setEditWantedModalOpen(false)}
                className="p-1 rounded-full border border-[#1C1C1C] bg-white hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4 text-[#1C1C1C]" />
              </button>
            </div>

            <form onSubmit={handleEditWantedSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                  Item Title / Need *
                </label>
                <input
                  type="text"
                  required
                  value={editWantedTitle}
                  onChange={(e) => setEditWantedTitle(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                    Category
                  </label>
                  <select
                    value={editWantedCategory}
                    onChange={(e) => setEditWantedCategory(e.target.value as ProductCategory)}
                    className="w-full p-2.5 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C]"
                  >
                    <option value="Books">Books</option>
                    <option value="Gadgets and Tech">Gadgets and Tech</option>
                    <option value="Daily Gear">Daily Gear</option>
                    <option value="Dorm Essentials">Dorm Essentials</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                    Preferred Condition
                  </label>
                  <select
                    value={editWantedCondition}
                    onChange={(e) => setEditWantedCondition(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C]"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Any Condition">Any Condition</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                    Min Budget (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editWantedMinBudget}
                    onChange={(e) => setEditWantedMinBudget(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                    Max Budget (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editWantedMaxBudget}
                    onChange={(e) => setEditWantedMaxBudget(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full p-2.5 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                  Description / Specific Requirements
                </label>
                <textarea
                  rows={3}
                  value={editWantedDescription}
                  onChange={(e) => setEditWantedDescription(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditWantedModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#1C1C1C] bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] shadow-[2px_2px_0px_#1C1C1C] cursor-pointer hover:bg-[#e49b2f]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE WANTED REQUEST MODAL */}
      <ConfirmModal
        isOpen={deleteWantedModalOpen}
        title="Delete Wanted Request"
        message={`Are you sure you want to permanently delete your wanted request for "${wantedToDelete?.title}"?`}
        confirmLabel="Yes, Delete Request"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          if (wantedToDelete) {
            deleteWantedRequest(wantedToDelete.id);
            setWantedToDelete(null);
            setDeleteWantedModalOpen(false);
          }
        }}
        onCancel={() => {
          setWantedToDelete(null);
          setDeleteWantedModalOpen(false);
        }}
      />
    </div>
  );
};
