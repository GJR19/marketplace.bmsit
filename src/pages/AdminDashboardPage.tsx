import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Package,
  Flag,
  RotateCcw,
  RotateCw,
  Search,
  ExternalLink,
  Lock,
  Unlock,
  Trash2,
  Check,
  Eye,
  Clock,
  Sparkles,
  FileText,
  MapPin,
  Tag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, Student, ProductCategory, ListingStatus, WantedRequest } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { formatPriceINR } from '../utils/usnParser';

interface AdminDashboardPageProps {
  onOpenProductDetails: (product: Product) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onOpenProductDetails,
}) => {
  const {
    products,
    students,
    reports,
    adminLogs,
    wantedRequests,
    campusLocations,
    approveProduct,
    rejectProduct,
    deleteProduct,
    suspendUser,
    unsuspendUser,
    updateReportStatus,
    resetDemoData,
    currentUser,
    pushToast,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'queue' | 'wanted' | 'users' | 'reports' | 'logs' | 'locations'
  >('queue');

  // Listing queue filter
  const [queueFilter, setQueueFilter] = useState<'pending_approval' | 'approved' | 'rejected' | 'all'>('pending_approval');
  const [searchListing, setSearchListing] = useState('');

  // Rejection Dialog State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [productToReject, setProductToReject] = useState<Product | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Poor or blurry product image');
  const [adminNotes, setAdminNotes] = useState('');

  // User search
  const [userSearch, setUserSearch] = useState('');

  // Suspend Dialog
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<Student | null>(null);

  // Reset Demo Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // Inspection preview modal
  const [inspectProduct, setInspectProduct] = useState<Product | null>(null);

  // Server-authenticated Admin Session
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('bmsit_admin_auth') === 'true';
  });
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword) {
      pushToast('Please enter both admin username and password.', 'warning');
      return;
    }

    setLoginLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_login', {
        p_username: adminUsername.trim(),
        p_password: adminPassword,
      });

      if (error) {
        pushToast(error.message || 'Authentication error', 'error');
        setLoginLoading(false);
        return;
      }

      if (data && data.success) {
        sessionStorage.setItem('bmsit_admin_auth', 'true');
        setIsAdminAuthenticated(true);
        pushToast('Admin authentication successful! Welcome to Moderation Portal.', 'success');
      } else {
        pushToast(data?.message || 'Invalid admin username or password.', 'error');
      }
    } catch (err: any) {
      pushToast('Login failed: ' + err.message, 'error');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('bmsit_admin_auth');
    setIsAdminAuthenticated(false);
    pushToast('Admin logged out successfully.', 'info');
  };

  // Live Supabase Admin Data
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [dbWantedRequests, setDbWantedRequests] = useState<WantedRequest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminData = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch live products from admin RPC
      const { data: prodData, error: prodErr } = await supabase.rpc('admin_get_all_products');
      if (!prodErr && prodData && prodData.length > 0) {
        const mapped: Product[] = prodData.map((row: any) => ({
          id: row.id,
          title: row.title,
          category: row.category as ProductCategory,
          description: row.description,
          price: Number(row.price),
          originalPrice: row.original_price ? Number(row.original_price) : undefined,
          condition: row.condition,
          images: Array.isArray(row.images) ? row.images : [],
          sellerId: row.seller_id,
          sellerName: row.seller_name || 'BMSIT Student',
          sellerUSN: row.seller_usn || '1BY24XX000',
          sellerBranch: row.seller_branch || 'Engineering',
          sellerAdmissionYear: 2024,
          sellerCurrentYear: 'Student',
          sellerAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${row.seller_usn || row.seller_id}`,
          status: row.status === 'pending' ? 'pending_approval' : (row.status as ListingStatus),
          handoverLocation: row.location || 'Campus Main Gate',
          contactPreference: row.meet_preferences || 'In-app Chat',
          postedDate: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          updatedDate: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          rejectionReason: row.rejection_reason || undefined,
        }));
        setDbProducts(mapped);
      }

      // 2. Fetch live users from admin RPC
      const { data: userData, error: userErr } = await supabase.rpc('admin_get_all_users');
      if (!userErr && userData && userData.length > 0) {
        setDbUsers(userData);
      }

      // 3. Fetch live wanted requests from admin RPC
      const { data: wantedData, error: wantedErr } = await supabase.rpc('admin_get_all_wanted_requests');
      if (!wantedErr && wantedData && wantedData.length > 0) {
        const mappedWanted: WantedRequest[] = wantedData.map((row: any) => ({
          id: row.id,
          title: row.title,
          category: row.category as ProductCategory,
          description: row.description || '',
          maxBudget: row.max_budget ? Number(row.max_budget) : undefined,
          studentId: row.requester_id,
          studentName: row.student_name || 'BMSIT Student',
          studentUSN: row.student_usn || '1BY24XX000',
          studentBranch: row.student_branch || 'Engineering',
          studentAdmissionYear: Number(row.student_admission_year) || 2024,
          status: 'open' as const,
          responses: [],
          postedDate: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        }));
        setDbWantedRequests(mappedWanted);
      }
    } catch (e) {
      console.warn('Error loading admin data:', e);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAdminData();
    }
  }, [isAdminAuthenticated]);

  // Combined Live & Fallback Collections
  const currentProducts = dbProducts.length > 0 ? dbProducts : products;
  const currentWantedRequests = dbWantedRequests.length > 0 ? dbWantedRequests : wantedRequests;
  const currentStudents: Student[] = dbUsers.length > 0
    ? dbUsers.map((u: any) => ({
        id: u.id,
        name: u.full_name || 'Student',
        email: u.college_email || '',
        usn: u.usn || '',
        branch: u.branch || 'Engineering',
        admissionYear: Number(u.admission_year) || 2024,
        currentYear: u.current_year || 'Student',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${u.usn || u.id}`,
        role: 'student' as const,
        verified: Boolean(u.is_verified),
        status: (u.is_suspended ? 'suspended' : 'active') as 'suspended' | 'active',
        phone: u.phone || '',
      }))
    : students;

  const handleDeleteWanted = async (id: string) => {
    setDbWantedRequests((prev) => prev.filter((r) => r.id !== id));
    await supabase.rpc('admin_delete_wanted_request', { p_request_id: id });
    pushToast('Wanted request removed by admin.', 'info');
  };

  // Statistics
  const pendingCount = currentProducts.filter((p) => p.status === 'pending_approval').length;
  const approvedCount = currentProducts.filter((p) => p.status === 'approved').length;
  const rejectedCount = currentProducts.filter((p) => p.status === 'rejected').length;
  const soldCount = currentProducts.filter((p) => p.status === 'sold').length;
  const suspendedCount = currentStudents.filter((s) => s.status === 'suspended').length;
  const openReportsCount = reports.filter((r) => r.status === 'open' || r.status === 'investigating').length;

  // Filtered Listings Queue
  const filteredQueue = currentProducts.filter((p) => {
    if (queueFilter !== 'all' && p.status !== queueFilter) {
      return false;
    }
    if (searchListing.trim()) {
      const q = searchListing.toLowerCase();
      const matchesTitle = p.title.toLowerCase().includes(q);
      const matchesSeller = p.sellerName.toLowerCase().includes(q);
      const matchesUSN = p.sellerUSN.toLowerCase().includes(q);
      return matchesTitle || matchesSeller || matchesUSN;
    }
    return true;
  });

  // Filtered Users
  const filteredStudents = currentStudents.filter((s) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.usn.toLowerCase().includes(q) ||
      s.branch.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  const handleOpenReject = (p: Product) => {
    setProductToReject(p);
    setRejectionReason('Does not meet BMSIT peer marketplace guidelines');
    setAdminNotes('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productToReject) return;

    rejectProduct(productToReject.id, rejectionReason, adminNotes);
    setDbProducts((prev) =>
      prev.map((p) =>
        p.id === productToReject.id
          ? { ...p, status: 'rejected', rejectionReason: rejectionReason + (adminNotes ? ` (${adminNotes})` : '') }
          : p
      )
    );
    setRejectModalOpen(false);
  };

  const handleApproveListing = (id: string) => {
    approveProduct(id);
    setDbProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'approved', rejectionReason: undefined } : p))
    );
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#FFFBF5] rounded-3xl border-3 border-[#1C1C1C] shadow-[8px_8px_0px_#1C1C1C] p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#F2A93B] border-3 border-[#1C1C1C] mx-auto flex items-center justify-center text-3xl shadow-[3px_3px_0px_#1C1C1C]">
            🛡️
          </div>

          <div>
            <div className="nb-sticker text-xs bg-[#E1467A] text-white inline-block mb-2">
              RESTRICTED MODERATOR AREA
            </div>
            <h2 className="font-head text-2xl font-extrabold text-[#1C1C1C]">
              BMSIT Moderator Admin
            </h2>
            <p className="text-xs text-neutral-600 mt-1">
              Server-authenticated moderation portal. Unauthorized access is strictly prohibited.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                Admin Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-medium rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-medium rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] font-bold text-xs text-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] hover:bg-[#e49b2f] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Authenticate as Administrator</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[#1C1C1C]/15 text-xs text-neutral-500">
            <button
              type="button"
              onClick={() => { window.location.href = '/'; }}
              className="hover:underline font-semibold text-[#1C1C1C] cursor-pointer"
            >
              ← Return to Campus Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Admin Header Banner */}
      <div className="bg-[#FFF9E6] rounded-3xl border-3 border-[#1C1C1C] shadow-[6px_6px_0px_#1C1C1C] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="nb-sticker text-xs bg-[#E1467A] text-white">
              🛡️ MODERATION CONSOLE
            </span>
            <span className="text-xs font-semibold text-neutral-600">
              Campus Safety & Listing Approvals
            </span>
          </div>

          <h1 className="font-head text-3xl sm:text-4xl font-extrabold text-[#1C1C1C]">
            BMSIT Moderator Admin Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-neutral-700 mt-1 max-w-xl">
            Campus administrator moderation console. Approve student postings, enforce verified USN authenticity, manage reports, and review moderation logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="nb-sticker text-xs bg-emerald-100 text-emerald-900 border border-emerald-800">
            ✓ Super Admin Active
          </div>
          <button
            onClick={fetchAdminData}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] hover:bg-[#e49b2f] text-[#1C1C1C] font-bold text-xs shadow-[2px_2px_0px_#1C1C1C] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Reload real-time listings and users from Supabase"
          >
            <RotateCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Live Data'}</span>
          </button>
          <button
            onClick={handleAdminLogout}
            className="px-4 py-2.5 rounded-xl border-2 border-[#1C1C1C] bg-white hover:bg-neutral-100 text-neutral-800 font-bold text-xs shadow-[2px_2px_0px_#1C1C1C] transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border-2 border-[#1C1C1C] shadow-[2.5px_2.5px_0px_#1C1C1C]">
          <span className="text-[10px] uppercase font-bold text-neutral-500 block">Pending Queue</span>
          <div className="font-head font-extrabold text-2xl text-[#F2A93B] mt-1">{pendingCount}</div>
          <span className="text-[10px] text-amber-800 font-semibold">Needs review</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border-2 border-[#1C1C1C] shadow-[2.5px_2.5px_0px_#1C1C1C]">
          <span className="text-[10px] uppercase font-bold text-neutral-500 block">Approved Live</span>
          <div className="font-head font-extrabold text-2xl text-emerald-700 mt-1">{approvedCount}</div>
          <span className="text-[10px] text-neutral-600">On public store</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border-2 border-[#1C1C1C] shadow-[2.5px_2.5px_0px_#1C1C1C]">
          <span className="text-[10px] uppercase font-bold text-neutral-500 block">Rejected</span>
          <div className="font-head font-extrabold text-2xl text-[#E1467A] mt-1">{rejectedCount}</div>
          <span className="text-[10px] text-neutral-600">Policy violations</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border-2 border-[#1C1C1C] shadow-[2.5px_2.5px_0px_#1C1C1C]">
          <span className="text-[10px] uppercase font-bold text-neutral-500 block">Sold Items</span>
          <div className="font-head font-extrabold text-2xl text-[#1C1C1C] mt-1">{soldCount}</div>
          <span className="text-[10px] text-neutral-600">Exchanges done</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border-2 border-[#1C1C1C] shadow-[2.5px_2.5px_0px_#1C1C1C]">
          <span className="text-[10px] uppercase font-bold text-neutral-500 block">Open Reports</span>
          <div className="font-head font-extrabold text-2xl text-purple-700 mt-1">{openReportsCount}</div>
          <span className="text-[10px] text-neutral-600">Flagged listings</span>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border-2 border-[#1C1C1C] shadow-[2.5px_2.5px_0px_#1C1C1C]">
          <span className="text-[10px] uppercase font-bold text-neutral-500 block">Suspended</span>
          <div className="font-head font-extrabold text-2xl text-red-600 mt-1">{suspendedCount}</div>
          <span className="text-[10px] text-neutral-600">Accounts locked</span>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#FFFBEA] rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C]">
        {[
          { id: 'queue', label: 'Listing Approval Queue', icon: Package, badge: pendingCount > 0 ? `${pendingCount}` : undefined },
          { id: 'wanted', label: 'Wanted Board', icon: Tag, badge: `${currentWantedRequests.length}` },
          { id: 'users', label: 'Student Accounts', icon: User, badge: `${currentStudents.length}` },
          { id: 'reports', label: 'Moderation Reports', icon: Flag, badge: openReportsCount > 0 ? `${openReportsCount}` : undefined },
          { id: 'logs', label: 'Audit Activity Log', icon: FileText },
          { id: 'locations', label: 'Exchange Spots', icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                isActive
                  ? 'bg-[#F2A93B] text-[#1C1C1C] border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C]'
                  : 'text-neutral-700 hover:bg-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-white text-[#1C1C1C]' : 'bg-[#FFF9E6] text-[#E1467A]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── TAB 1: LISTING APPROVAL QUEUE ─── */}
      {activeAdminTab === 'queue' && (
        <div className="space-y-4">
          {/* Queue Filter Bar */}
          <div className="p-4 bg-white rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: 'pending_approval', label: `Pending Approval (${pendingCount})` },
                { id: 'approved', label: `Approved (${approvedCount})` },
                { id: 'rejected', label: `Rejected (${rejectedCount})` },
                { id: 'all', label: `All Listings (${products.length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setQueueFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    queueFilter === f.id
                      ? 'bg-[#F2A93B] text-[#1C1C1C] border border-[#1C1C1C] shadow-[1px_1px_0px_#1C1C1C]'
                      : 'bg-neutral-50 text-neutral-600 hover:bg-[#FFF9E6]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchListing}
                onChange={(e) => setSearchListing(e.target.value)}
                placeholder="Search listing or USN..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#1C1C1C] bg-[#FFFBF5]"
              />
            </div>
          </div>

          {/* Queue Items */}
          {filteredQueue.length > 0 ? (
            <div className="space-y-3">
              {filteredQueue.map((p) => {
                const isPending = p.status === 'pending_approval';

                return (
                  <div
                    key={p.id}
                    className="p-5 bg-white rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-[#1C1C1C] shrink-0"
                      />

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border border-[#1C1C1C] ${
                              p.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-900'
                                : p.status === 'pending_approval'
                                ? 'bg-[#FFE082] text-[#1C1C1C]'
                                : p.status === 'rejected'
                                ? 'bg-[#FDF2F4] text-[#E1467A]'
                                : 'bg-neutral-100'
                            }`}
                          >
                            {p.status.toUpperCase().replace('_', ' ')}
                          </span>
                          <span className="text-[11px] font-bold text-[#E1467A]">
                            {p.category}
                          </span>
                        </div>

                        <h3 className="font-head font-bold text-base text-[#1C1C1C] truncate">
                          {p.title}
                        </h3>

                        <div className="text-xs font-semibold text-neutral-700">
                          Price: <span className="text-[#F2A93B] font-bold">{formatPriceINR(p.price)}</span> •{' '}
                          Category: {p.category}
                        </div>

                        <div className="text-[11px] text-neutral-500 font-mono">
                          Seller: {p.sellerName} (<strong>{p.sellerUSN}</strong>) • Handover: {p.handoverLocation.split('&')[0]}
                        </div>

                        {p.rejectionReason && (
                          <div className="text-[11px] text-[#E1467A] font-semibold">
                            Rejection Note: "{p.rejectionReason}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => setInspectProduct(p)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#1C1C1C] bg-white hover:bg-[#FFF9E6] transition flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleApproveListing(p.id)}
                            className="px-4 py-1.5 text-xs font-bold rounded-lg border-2 border-[#1C1C1C] bg-[#F2A93B] shadow-[1.5px_1.5px_0px_#1C1C1C] hover:bg-[#e49b2f] transition flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => handleOpenReject(p)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#1C1C1C] bg-[#FDF2F4] text-[#E1467A] hover:bg-[#fde2e7] transition flex items-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        p.status !== 'approved' && (
                          <button
                            onClick={() => handleApproveListing(p.id)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#1C1C1C] bg-white hover:bg-[#FFF9E6]"
                          >
                            Approve Listing
                          </button>
                        )
                      )}

                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 rounded-lg border border-[#1C1C1C] text-[#E1467A] hover:bg-[#FDF2F4]"
                        title="Takedown listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border-2 border-[#1C1C1C] text-xs text-neutral-600">
              No listings in this queue view.
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: WANTED BOARD REQUESTS ─── */}
      {activeAdminTab === 'wanted' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex items-center justify-between">
            <div>
              <h3 className="font-head font-bold text-base text-[#1C1C1C]">
                Campus Wanted Board Requests ({currentWantedRequests.length})
              </h3>
              <p className="text-xs text-neutral-600">
                Items BMSIT students are actively looking to buy or borrow on campus.
              </p>
            </div>
            <button
              onClick={fetchAdminData}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#1C1C1C] bg-[#FFF9E6] hover:bg-[#FFE082] transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {currentWantedRequests.length > 0 ? (
            <div className="space-y-3">
              {currentWantedRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 bg-white rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-[#1C1C1C] bg-[#FFE082] text-[#1C1C1C]">
                        WANTED ITEM
                      </span>
                      <span className="text-[11px] font-bold text-[#E1467A]">
                        {req.category}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {req.postedDate}
                      </span>
                    </div>

                    <h4 className="font-head font-bold text-base text-[#1C1C1C]">
                      {req.title}
                    </h4>

                    {req.description && (
                      <p className="text-xs text-neutral-700 bg-[#FFFBEA] p-2.5 rounded-xl border border-[#1C1C1C]/15 max-w-2xl">
                        "{req.description}"
                      </p>
                    )}

                    <div className="text-[11px] text-neutral-600 font-mono">
                      Requested by: <strong className="text-[#1C1C1C]">{req.studentName}</strong> (
                      <strong>{req.studentUSN}</strong>) • {req.studentBranch}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleDeleteWanted(req.id)}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#1C1C1C] text-[#E1467A] hover:bg-[#FDF2F4] transition flex items-center gap-1 cursor-pointer"
                      title="Remove wanted request"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-white rounded-2xl border-2 border-dashed border-[#1C1C1C] text-center text-xs text-neutral-500">
              No active wanted requests posted yet.
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: STUDENT USER MANAGEMENT ─── */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex items-center justify-between">
            <h3 className="font-head font-bold text-base text-[#1C1C1C]">
              Registered BMSIT Students ({students.length})
            </h3>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search name, USN, branch..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#1C1C1C] bg-[#FFFBF5]"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFFBEA] border-b-2 border-[#1C1C1C] text-neutral-700 font-bold">
                  <tr>
                    <th className="p-3.5">Student / Avatar</th>
                    <th className="p-3.5">VTU USN</th>
                    <th className="p-3.5">Active Postings</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Moderator Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {filteredStudents.map((s) => {
                    const isSuspended = s.status === 'suspended';
                    const userListingsCount = currentProducts.filter((p) => p.sellerId === s.id).length;

                    return (
                      <tr key={s.id} className="hover:bg-[#FFF9E6]/50">
                        <td className="p-3.5 flex items-center gap-2.5">
                          <img
                            src={s.avatar}
                            alt={s.name}
                            className="w-8 h-8 rounded-full border border-[#1C1C1C] object-cover"
                          />
                          <div>
                            <div className="font-bold text-[#1C1C1C]">{s.name}</div>
                            <div className="text-[11px] text-neutral-500 font-mono">{s.email}</div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-[#1C1C1C]">{s.usn}</td>
                        <td className="p-3.5 font-bold">{userListingsCount} items</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isSuspended
                                ? 'bg-red-100 text-red-900 border-red-800'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-800'
                            }`}
                          >
                            {isSuspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {s.role !== 'admin' && (
                            <button
                              onClick={() => {
                                if (isSuspended) {
                                  unsuspendUser(s.id);
                                } else {
                                  setUserToSuspend(s);
                                  setSuspendModalOpen(true);
                                }
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                                isSuspended
                                  ? 'bg-emerald-100 text-emerald-900 border-emerald-800 hover:bg-emerald-200'
                                  : 'bg-[#FDF2F4] text-[#E1467A] border-[#E1467A] hover:bg-[#fde2e7]'
                              }`}
                            >
                              {isSuspended ? 'Unsuspend' : 'Suspend Account'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: MODERATION REPORTS ─── */}
      {activeAdminTab === 'reports' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex items-center justify-between">
            <h3 className="font-head font-bold text-base text-[#1C1C1C]">
              Flagged Items & User Reports ({reports.length})
            </h3>
          </div>

          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-white rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="nb-sticker rose text-[10px] py-0 px-1.5">
                      {r.targetType.toUpperCase()}: {r.targetTitle}
                    </span>
                    <span className="font-mono text-neutral-500">{r.timestamp}</span>
                  </div>

                  <h4 className="font-head font-bold text-sm text-[#1C1C1C]">
                    Reason: {r.reason}
                  </h4>
                  <p className="text-neutral-700 bg-[#FFFBEA] p-2.5 rounded-lg border border-[#1C1C1C]/15">
                    "{r.details}"
                  </p>
                  <div className="text-[11px] text-neutral-500">
                    Reported by: <span className="font-semibold text-[#1C1C1C]">{r.reporterName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold border ${
                      r.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-800'
                        : r.status === 'dismissed'
                        ? 'bg-neutral-100 text-neutral-700 border-neutral-400'
                        : 'bg-[#FFE082] text-[#1C1C1C] border-[#1C1C1C]'
                    }`}
                  >
                    {r.status.toUpperCase()}
                  </span>

                  {r.status !== 'resolved' && (
                    <button
                      onClick={() => updateReportStatus(r.id, 'resolved')}
                      className="px-3 py-1.5 rounded-lg border border-[#1C1C1C] bg-[#F2A93B] font-bold hover:bg-[#e49b2f]"
                    >
                      Resolve
                    </button>
                  )}

                  {r.status !== 'dismissed' && (
                    <button
                      onClick={() => updateReportStatus(r.id, 'dismissed')}
                      className="px-3 py-1.5 rounded-lg border border-[#1C1C1C] bg-white font-semibold hover:bg-neutral-100"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: AUDIT ACTIVITY LOG ─── */}
      {activeAdminTab === 'logs' && (
        <div className="p-6 bg-white rounded-3xl border-3 border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] space-y-4">
          <h3 className="font-head font-bold text-lg text-[#1C1C1C] pb-2 border-b border-[#1C1C1C]/15">
            Recorded Moderation History
          </h3>

          <div className="divide-y divide-neutral-100 space-y-2 text-xs">
            {adminLogs.map((log) => (
              <div key={log.id} className="pt-2 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-[#1C1C1C]">{log.action}:</span>
                    <span className="font-semibold text-neutral-800">{log.target}</span>
                  </div>
                  <p className="text-neutral-600">{log.details}</p>
                  <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    By {log.adminName}
                  </div>
                </div>
                <div className="text-[11px] font-mono text-neutral-500 shrink-0">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 5: EXCHANGE SPOTS MANAGEMENT ─── */}
      {activeAdminTab === 'locations' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C]">
            <h3 className="font-head font-bold text-base text-[#1C1C1C]">
              Configured BMSIT Campus Exchange Spots ({campusLocations.length})
            </h3>
            <p className="text-xs text-neutral-600 mt-1">
              Locations designated for safe student exchanges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campusLocations.map((loc) => (
              <div
                key={loc.id}
                className="p-4 bg-[#FFF9E6] rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-head font-bold text-base text-[#1C1C1C]">
                    {loc.name}
                  </h4>
                  <span className="nb-sticker text-[10px] py-0 px-2 bg-emerald-100 border-emerald-800">
                    Active Zone
                  </span>
                </div>
                <p className="text-neutral-700">{loc.description}</p>
                <div className="text-[11px] text-neutral-600 space-y-0.5 pt-2 border-t border-[#1C1C1C]/15">
                  <div><strong>Best Hours:</strong> {loc.bestHours}</div>
                  <div><strong>Safety Tip:</strong> {loc.safetyTip}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REJECT LISTING MODAL WITH REASON */}
      {rejectModalOpen && productToReject && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFFBF5] rounded-3xl border-3 border-[#1C1C1C] shadow-[7px_7px_0px_#1C1C1C] p-6 animate-in zoom-in-95">
            <h3 className="font-head text-lg font-bold text-[#E1467A] mb-2 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>Reject Product Listing</span>
            </h3>

            <p className="text-xs text-neutral-600 mb-4">
              Rejecting <span className="font-bold text-[#1C1C1C]">"{productToReject.title}"</span> by {productToReject.sellerName}. The reason will be sent to the student's dashboard.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                  Rejection Reason *
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C]"
                >
                  <option value="Poor, blurry, or downloaded stock photo">Poor, blurry, or downloaded stock photo</option>
                  <option value="Suspected commercial dealer or counterfeit goods">Suspected commercial dealer or counterfeit goods</option>
                  <option value="Unrealistic pricing or advance online payment request">Unrealistic pricing or advance online payment request</option>
                  <option value="Inappropriate or prohibited campus item">Inappropriate or prohibited campus item</option>
                  <option value="Misleading title, invalid price, or duplicate posting">Misleading title, invalid price, or duplicate posting</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                  Additional Internal Admin Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal audit notes for council..."
                  className="w-full p-2 text-xs rounded-xl border border-[#1C1C1C] bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#1C1C1C] bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-[#E1467A] text-white shadow-[2px_2px_0px_#1C1C1C]"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUSPEND USER CONFIRMATION */}
      <ConfirmModal
        isOpen={suspendModalOpen}
        title="Suspend Student Account?"
        message={`Are you sure you want to suspend ${userToSuspend?.name} (${userToSuspend?.usn})? Suspended accounts cannot post listings or send messages on the marketplace.`}
        confirmLabel="Suspend Account"
        variant="danger"
        onConfirm={() => {
          if (userToSuspend) {
            suspendUser(userToSuspend.id);
            setSuspendModalOpen(false);
          }
        }}
        onCancel={() => setSuspendModalOpen(false)}
      />

      {/* RESET DEMO CONFIRMATION */}
      <ConfirmModal
        isOpen={resetModalOpen}
        title="Restore Default Demo Data?"
        message="This will reset all listings, mock users, chats, and reports back to their initial state in your browser."
        confirmLabel="Reset Everything"
        variant="danger"
        onConfirm={() => {
          resetDemoData();
          setResetModalOpen(false);
        }}
        onCancel={() => setResetModalOpen(false)}
      />

      {/* INSPECT PRODUCT POPUP */}
      {inspectProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#FFFBF5] rounded-3xl border-3 border-[#1C1C1C] shadow-[7px_7px_0px_#1C1C1C] p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C1C1C]/15">
              <h3 className="font-head font-bold text-base text-[#1C1C1C]">
                Moderator Inspection
              </h3>
              <button onClick={() => setInspectProduct(null)}>
                <XCircle className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            <img
              src={inspectProduct.images[0]}
              alt={inspectProduct.title}
              className="w-full h-48 object-cover rounded-xl border-2 border-[#1C1C1C]"
            />

            <div className="space-y-1 text-xs">
              <div className="font-head font-bold text-base text-[#1C1C1C]">
                {inspectProduct.title}
              </div>
              <div className="font-extrabold text-[#F2A93B]">
                {formatPriceINR(inspectProduct.price)} • {inspectProduct.category}
              </div>
              {inspectProduct.description && (
                <p className="text-neutral-700 bg-[#FFFBEA] p-2 rounded-lg border border-[#1C1C1C]/15">
                  "{inspectProduct.description}"
                </p>
              )}
              <div className="text-[11px] font-mono text-neutral-500">
                Seller: {inspectProduct.sellerName} • USN: {inspectProduct.sellerUSN}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setInspectProduct(null)}
                className="px-4 py-1.5 text-xs font-bold rounded-lg border border-[#1C1C1C] bg-[#F2A93B]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
