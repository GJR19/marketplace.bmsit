import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { supabase, profileToStudent } from '../lib/supabase';
import {
  Product,
  Student,
  WantedRequest,
  ChatConversation,
  NotificationItem,
  ModerationReport,
  CampusLocation,
  AdminLog,
  ProductCategory,
} from '../types';
import {
  GUEST_STUDENT,
  INITIAL_PRODUCTS,
  INITIAL_STUDENTS,
  INITIAL_WANTED_REQUESTS,
  INITIAL_CHATS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS,
  INITIAL_ADMIN_LOGS,
  CAMPUS_LOCATIONS,
  normalizeCampusLocation,
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const isUUID = (str?: string): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

interface AppContextType {
  products: Product[];
  students: Student[];
  currentUser: Student;
  isAdminMode: boolean;
  wishlist: string[];
  compareList: string[];
  wantedRequests: WantedRequest[];
  chats: ChatConversation[];
  notifications: NotificationItem[];
  reports: ModerationReport[];
  adminLogs: AdminLog[];
  campusLocations: CampusLocation[];
  toasts: ToastMessage[];

  // Actions
  pushToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  dismissToast: (id: string) => void;
  triggerConfetti: () => void;

  // Products
  addProduct: (product: Omit<Product, 'id' | 'postedDate' | 'updatedDate' | 'viewsCount' | 'likesCount'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  markAsSold: (id: string) => void;
  restoreToAvailable: (id: string) => void;
  approveProduct: (id: string) => void;
  rejectProduct: (id: string, reason: string, adminNotes?: string) => void;

  // Wishlist & Compare
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  toggleCompare: (productId: string) => void;
  isInCompare: (productId: string) => boolean;
  clearCompare: () => void;

  // Wanted Requests
  addWantedRequest: (request: Omit<WantedRequest, 'id' | 'postedDate' | 'responses' | 'status'>) => WantedRequest;
  updateWantedRequest: (id: string, updates: Partial<WantedRequest>) => void;
  deleteWantedRequest: (id: string) => void;
  closeWantedRequest: (id: string, status?: 'fulfilled' | 'expired') => void;
  addWantedResponse: (requestId: string, message: string, proposedPrice: number, offeredProductId?: string) => void;
  approveWantedRequest: (id: string) => void;
  rejectWantedRequest: (id: string, reason?: string) => void;

  // Chats
  sendMessage: (conversationId: string, text: string, isOffer?: boolean, offerAmount?: number) => void;
  startChatWithSeller: (product: Product, initialMessage?: string) => string;
  startChatWithStudent: (
    student: { id: string; name: string; usn: string; branch: string; avatar?: string },
    wantedTitle: string,
    initialMessage?: string
  ) => string;
  markChatAsRead: (conversationId: string) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Moderation & Admin
  submitReport: (report: Omit<ModerationReport, 'id' | 'timestamp' | 'status'>) => void;
  updateReportStatus: (id: string, status: 'investigating' | 'resolved' | 'dismissed') => void;
  suspendUser: (userId: string) => void;
  unsuspendUser: (userId: string) => void;

  // User & Auth
  setCurrentUser: (student: Student) => void;
  switchUser: (studentId: string) => void;
  registerUser: (userData: Partial<Student>) => Student;
  updateProfile: (updates: Partial<Student>) => void;
  logoutUser: (customMessage?: string | unknown) => Promise<void>;
  toggleAdminMode: () => void;

  // Reset
  resetDemoData: () => void;
}

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of user inactivity

const STORAGE_KEYS = {
  PRODUCTS: 'marketplace_bmsit_products_v4',
  STUDENTS: 'marketplace_bmsit_students_v4',
  CURRENT_USER: 'marketplace_bmsit_current_user_v4',
  WISHLIST: 'marketplace_bmsit_wishlist_v4',
  WANTED: 'marketplace_bmsit_wanted_v4',
  CHATS: 'marketplace_bmsit_chats_v4',
  NOTIFICATIONS: 'marketplace_bmsit_notifs_v4',
  REPORTS: 'marketplace_bmsit_reports_v4',
  LOGS: 'marketplace_bmsit_logs_v4',
  LAST_ACTIVITY: 'marketplace_bmsit_last_activity_v4',
};

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('safeLocalStorage setItem error:', e);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch {}
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = safeLocalStorage.getItem(STORAGE_KEYS.STUDENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUserState] = useState<Student>(() => {
    const saved = safeLocalStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.id !== 'guest') {
          return parsed;
        }
      } catch {}
    }
    return GUEST_STUDENT;
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(currentUser.role === 'admin');

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = safeLocalStorage.getItem(STORAGE_KEYS.WISHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [compareList, setCompareList] = useState<string[]>([]);

  const [wantedRequests, setWantedRequests] = useState<WantedRequest[]>(() => {
    try {
      const saved = safeLocalStorage.getItem(STORAGE_KEYS.WANTED);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [allChats, setAllChats] = useState<ChatConversation[]>([]);

  const conversationIdMap = useRef<Record<string, string>>({});

  // STRICT PRIVACY: currentUser only receives their own private conversations!
  const chats = useMemo(() => {
    return allChats.filter((c) => {
      if (c.participantIds && Array.isArray(c.participantIds)) {
        return c.participantIds.includes(currentUser.id);
      }
      return false;
    });
  }, [allChats, currentUser.id]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to LocalStorage safely
  useEffect(() => {
    safeLocalStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    setIsAdminMode(currentUser.role === 'admin');
  }, [currentUser]);

  useEffect(() => {
    safeLocalStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (wantedRequests.length > 0) {
      safeLocalStorage.setItem(STORAGE_KEYS.WANTED, JSON.stringify(wantedRequests));
    }
  }, [wantedRequests]);

  useEffect(() => {
    if (students.length > 0) {
      safeLocalStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    }
  }, [students]);

  // Toast Helpers
  const pushToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#F2A93B', '#E1467A', '#1C1C1C', '#FFE082'],
      });
    } catch {
      // Fallback
    }
  };

  // Supabase Auth listener & active session synchronization
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              if (profile.is_suspended) {
                supabase.auth.signOut();
                pushToast(
                  'Your account has been suspended. Please contact the administrator at gjr19atwork@gmail.com',
                  'error'
                );
              } else {
                setCurrentUserState(profileToStudent(profile));
              }
            }
          });
      } else {
        // If there is no active Supabase session in browser, clear stale ghost session
        const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.id && parsed.id !== 'guest') {
              localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
              setCurrentUserState(GUEST_STUDENT);
            }
          } catch {}
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          if (profile.is_suspended) {
            await supabase.auth.signOut();
            pushToast(
              'Your account has been suspended. Please contact the administrator at gjr19atwork@gmail.com',
              'error'
            );
          } else {
            setCurrentUserState(profileToStudent(profile));
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUserState(GUEST_STUDENT);
        setIsAdminMode(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Supabase Live Products Hydration
  const loadLiveProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          title,
          category,
          description,
          price,
          original_price,
          condition,
          images,
          location,
          meet_preferences,
          status,
          rejection_reason,
          created_at,
          updated_at,
          seller_id,
          seller:profiles!seller_id (
            full_name,
            college_email,
            usn,
            branch,
            admission_year,
            current_year,
            avatar_url,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const live: Product[] = data.map((row: any) => ({
          id: row.id,
          title: row.title,
          category: row.category,
          description: row.description,
          price: Number(row.price),
          originalPrice: row.original_price ? Number(row.original_price) : undefined,
          condition: row.condition,
          images: Array.isArray(row.images) ? row.images : [],
          sellerId: row.seller_id,
          sellerName: row.seller?.full_name || 'BMSIT Student',
          sellerUSN: row.seller?.usn || '1BY24XX000',
          sellerBranch: row.seller?.branch || 'Engineering',
          sellerAdmissionYear: Number(row.seller?.admission_year) || 2024,
          sellerCurrentYear: row.seller?.current_year || '1st Year',
          sellerAvatar:
            row.seller?.avatar_url ||
            `https://api.dicebear.com/7.x/bottts/svg?seed=${row.seller?.usn || row.seller_id}`,
          status: row.status === 'pending' ? 'pending_approval' : row.status,
          handoverLocation: row.location || 'Campus Main Gate',
          contactPreference: row.meet_preferences || 'In-app Chat',
          postedDate: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          updatedDate: row.updated_at ? row.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
          rejectionReason: row.rejection_reason || undefined,
        }));

        setProducts(live);
      }
    } catch (err) {
      console.warn('Failed to fetch products from Supabase:', err);
    }
  };

  // Supabase Live Wanted Requests Hydration
  const loadLiveWantedRequests = async () => {
    try {
      let reqRows: any[] = [];

      // Attempt join on profiles first
      const { data: joinData, error: joinErr } = await supabase
        .from('wanted_requests')
        .select(`
          id,
          title,
          description,
          category,
          max_budget,
          urgency,
          status,
          created_at,
          requester_id,
          requester:profiles!requester_id (
            full_name,
            usn,
            branch,
            admission_year
          )
        `)
        .order('created_at', { ascending: false });

      if (!joinErr && joinData && joinData.length > 0) {
        reqRows = joinData;
      } else {
        // Fallback to direct select without relational join
        const { data: fallbackData } = await supabase
          .from('wanted_requests')
          .select('*')
          .order('created_at', { ascending: false });
        if (fallbackData && fallbackData.length > 0) {
          reqRows = fallbackData;
        }
      }

      if (reqRows.length > 0) {
        const liveReqs: WantedRequest[] = reqRows.map((row: any) => {
          const matchedProfile = students.find((s) => s.id === row.requester_id);
          return {
            id: row.id,
            title: row.title,
            category: row.category as ProductCategory,
            description: row.description || '',
            maxBudget: row.max_budget ? Number(row.max_budget) : undefined,
            studentId: row.requester_id,
            studentName: row.requester?.full_name || row.student_name || matchedProfile?.name || 'BMSIT Student',
            studentUSN: row.requester?.usn || row.student_usn || matchedProfile?.usn || '1BY24XX000',
            studentBranch: row.requester?.branch || row.student_branch || matchedProfile?.branch || 'Engineering',
            studentAdmissionYear: Number(row.requester?.admission_year || row.student_admission_year || matchedProfile?.admissionYear) || 2024,
            status: (row.status === 'pending' || row.status === 'pending_approval') ? 'pending_approval' : (row.status || 'open'),
            responses: [],
            postedDate: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          };
        });

        setWantedRequests((prev) => {
          const map = new Map<string, WantedRequest>();
          // Preserve local requests
          prev.forEach((r) => map.set(r.id, r));
          // Overlay DB rows
          liveReqs.forEach((r) => map.set(r.id, r));
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
          );
          safeLocalStorage.setItem(STORAGE_KEYS.WANTED, JSON.stringify(merged));
          return merged;
        });
      }
    } catch (err) {
      console.warn('Failed to fetch wanted requests from Supabase:', err);
    }
  };

  const loadLiveReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const liveReports: ModerationReport[] = data.map((r: any) => ({
          id: r.id,
          targetType: r.target_type,
          targetId: r.target_id || '',
          targetTitle: r.target_title,
          reporterId: r.reporter_id || '',
          reporterName: r.reporter_name || 'BMSIT Student',
          reason: r.reason,
          details: r.details || '',
          status: r.status,
          timestamp: new Date(r.created_at).toLocaleString(),
        }));

        setReports(liveReports);
      }
    } catch (err) {
      console.warn('Failed to fetch reports from Supabase:', err);
    }
  };

  const loadLiveStudents = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) {
        const liveStudents = data.map((p: any) => profileToStudent(p));
        setStudents((prev) => {
          const map = new Map<string, Student>();
          prev.forEach((s) => map.set(s.id, s));
          liveStudents.forEach((s) => {
            const existing = map.get(s.id);
            // If existing had a custom avatar and new row doesn't, keep existing custom avatar!
            if (
              existing?.avatar &&
              !existing.avatar.includes('api.dicebear.com') &&
              (!s.avatar || s.avatar.includes('api.dicebear.com'))
            ) {
              map.set(s.id, { ...s, avatar: existing.avatar });
            } else {
              map.set(s.id, s);
            }
          });
          const merged = Array.from(map.values());
          safeLocalStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(merged));
          return merged;
        });
      }
    } catch (err) {
      console.warn('Failed to fetch students from Supabase:', err);
    }
  };

  useEffect(() => {
    loadLiveProducts();
    loadLiveWantedRequests();
    loadLiveReports();
    loadLiveStudents();
  }, []);

  // Supabase User Notifications Hydration & Realtime Channel
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchNotifications = () => {
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const dbNotifs: NotificationItem[] = data.map((n: any) => ({
              id: n.id,
              userId: n.user_id,
              title: n.title,
              message: n.message,
              type: n.type || 'system',
              read: Boolean(n.is_read),
              timestamp: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              link: n.link || '/dashboard',
            }));
            setNotifications(dbNotifs);
          }
        });
    };

    fetchNotifications();

    const channel = supabase
      .channel(`public:notifications:${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${currentUser.id}`,
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  // Supabase User Conversations & Messages Hydration + Realtime
  useEffect(() => {
    if (!currentUser?.id) return;

    const loadLiveChats = async () => {
      try {
        const { data, error } = await supabase.rpc('get_user_conversations');
        if (!error && data && data.length > 0) {
          const convIds = data.map((d: any) => d.conversation_id);
          const { data: messagesData } = await supabase
            .from('messages')
            .select('*')
            .in('conversation_id', convIds)
            .order('created_at', { ascending: true });

          const messagesByConv: Record<string, any[]> = {};
          if (messagesData) {
            for (const m of messagesData) {
              if (!messagesByConv[m.conversation_id]) messagesByConv[m.conversation_id] = [];
              messagesByConv[m.conversation_id].push({
                id: m.id,
                conversationId: m.conversation_id,
                senderId: m.sender_id,
                senderName: m.sender_id === currentUser.id ? currentUser.name : 'Student',
                text: m.message_text,
                timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              });
            }
          }

          const liveChats: ChatConversation[] = data.map((row: any) => ({
            id: row.conversation_id,
            participantIds: [currentUser.id, row.other_user_id],
            participants: [
              {
                id: currentUser.id,
                name: currentUser.name,
                usn: currentUser.usn,
                branch: currentUser.branch,
                avatar: currentUser.avatar,
              },
              {
                id: row.other_user_id,
                name: row.other_user_name || 'BMSIT Student',
                usn: row.other_user_usn || '1BY24XX000',
                branch: row.other_user_branch || 'Engineering',
                avatar: row.other_user_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.other_user_usn || row.other_user_id}`,
              },
            ],
            otherParticipant: {
              id: row.other_user_id,
              name: row.other_user_name || 'BMSIT Student',
              usn: row.other_user_usn || '1BY24XX000',
              branch: row.other_user_branch || 'Engineering',
              avatar: row.other_user_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.other_user_usn || row.other_user_id}`,
            },
            productId: row.product_id,
            productTitle: row.product_title || 'Campus Item',
            productPrice: row.product_price ? Number(row.product_price) : undefined,
            productImage: row.product_image,
            productStatus: row.product_status,
            lastMessage: row.last_message || 'Started conversation',
            lastMessageTime: row.last_message_time ? new Date(row.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            unreadCount: Number(row.unread_count) || 0,
            messages: messagesByConv[row.conversation_id] || [],
          }));

          setAllChats((prev) => {
            const liveIds = new Set(liveChats.map((c) => c.id));
            const retained = prev.filter((c) => !liveIds.has(c.id));
            return [...liveChats, ...retained];
          });
        }
      } catch (err) {
        console.warn('Failed to load live chats:', err);
      }
    };

    loadLiveChats();

    const channel = supabase
      .channel(`public:messages:${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as any;
          if (newMsg && newMsg.conversation_id) {
            setAllChats((prev) => {
              const convExists = prev.some((c) => c.id === newMsg.conversation_id);
              if (!convExists) {
                loadLiveChats();
                return prev;
              }
              return prev.map((c) => {
                if (c.id === newMsg.conversation_id) {
                  if (c.messages.some((m) => m.id === newMsg.id)) return c;
                  const formattedMsg = {
                    id: newMsg.id,
                    conversationId: newMsg.conversation_id,
                    senderId: newMsg.sender_id,
                    senderName: newMsg.sender_id === currentUser.id ? currentUser.name : (c.otherParticipant?.name || 'Student'),
                    text: newMsg.message_text,
                    timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  };
                  return {
                    ...c,
                    lastMessage: newMsg.message_text,
                    lastMessageTime: formattedMsg.timestamp,
                    unreadCount: newMsg.sender_id !== currentUser.id ? (c.unreadCount || 0) + 1 : c.unreadCount,
                    messages: [...c.messages, formattedMsg],
                  };
                }
                return c;
              });
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  // Products Handlers
  const addProduct = (
    productData: Omit<Product, 'id' | 'postedDate' | 'updatedDate' | 'viewsCount' | 'likesCount'>
  ): Product => {
    const productId = generateUUID();
    const newProduct: Product = {
      ...productData,
      id: productId,
      status: 'pending_approval', // STRICT RULE: Pending approval first!
      postedDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      viewsCount: 0,
      likesCount: 0,
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Insert into Supabase (triggers trg_notify_admin_new_product)
    if (isUUID(currentUser?.id) && currentUser.id !== 'guest') {
      supabase
        .from('products')
        .insert({
          id: productId,
          title: newProduct.title,
          description: newProduct.description || newProduct.title,
          price: newProduct.price,
          original_price: newProduct.originalPrice,
          category: newProduct.category,
          condition: newProduct.condition || 'Good',
          location: newProduct.handoverLocation || 'Campus Main Gate',
          meet_preferences: newProduct.contactPreference || 'In-app Chat',
          images: newProduct.images || [],
          seller_id: currentUser.id,
          status: 'pending',
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase product insert error:', error.message);
        });
    }

    // Dispatch automated email alert via /api/send-email
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'gjr19atwork@gmail.com',
        subject: `🚨 New Listing Pending Review: ${newProduct.title}`,
        html: `
          <div style="font-family:sans-serif;padding:24px;border:3px solid #1C1C1C;border-radius:12px;background:#FFFBEA;">
            <h2 style="color:#1C1C1C;margin:0 0 12px 0;">New Listing Submitted for Review</h2>
            <p><strong>Title:</strong> ${newProduct.title}</p>
            <p><strong>Price:</strong> ₹${newProduct.price}</p>
            <p><strong>Category:</strong> ${newProduct.category}</p>
            <p><strong>Seller:</strong> ${currentUser.name} (${currentUser.usn})</p>
            <p><strong>Email:</strong> ${currentUser.email}</p>
            <p style="margin-top:20px;">
              <a href="https://marketplace.bmsit.co.in/ishowspeed" style="display:inline-block;padding:10px 18px;background:#F2A93B;color:#1C1C1C;font-weight:bold;text-decoration:none;border:2px solid #1C1C1C;border-radius:6px;">
                Review in Admin Portal &rarr;
              </a>
            </p>
          </div>
        `,
      }),
    }).catch(() => {});

    // Add user notification
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userId: currentUser.id,
      title: 'Listing Submitted for Approval ⏳',
      message: `"${newProduct.title}" has been submitted. It will appear on the public catalogue once verified by BMSIT student moderators.`,
      type: 'system',
      read: false,
      timestamp: 'Just now',
      link: '/dashboard',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Add Admin log
    const newLog: AdminLog = {
      id: 'log-' + Date.now(),
      adminName: 'System Queue',
      action: 'Listing Submitted',
      target: `${newProduct.title} (${newProduct.id})`,
      details: `Submitted by ${currentUser.name} (${currentUser.usn})`,
      timestamp: new Date().toLocaleString(),
    };
    setAdminLogs((prev) => [newLog, ...prev]);

    pushToast('Listing submitted! Awaiting moderator approval.', 'info');
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            ...updates,
            updatedDate: new Date().toISOString().split('T')[0],
          };
        }
        return p;
      })
    );

    // Sync updates to Supabase products table
    if (isUUID(id)) {
      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.price !== undefined) dbUpdates.price = updates.price;
      if (updates.originalPrice !== undefined) dbUpdates.original_price = updates.originalPrice;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.condition !== undefined) dbUpdates.condition = updates.condition;
      if (updates.handoverLocation !== undefined) dbUpdates.location = updates.handoverLocation;

      supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Supabase updateProduct error:', error.message);
        });
    }

    pushToast('Listing updated successfully.', 'success');
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));

    // Sync deletion to Supabase products table
    if (isUUID(id)) {
      supabase
        .from('products')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.warn('Direct delete failed, falling back to soft remove:', error.message);
            supabase.from('products').update({ status: 'removed' }).eq('id', id);
          }
        });
    }

    pushToast(`"${target?.title || 'Listing'}" deleted.`, 'info');
  };

  // CRITICAL REQUIREMENT: Mark as sold does NOT delete the item.
  // It retains all data, shows SOLD banner, disables contact, keeps in My Postings and public catalogue.
  const markAsSold = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            status: 'sold',
            updatedDate: new Date().toISOString().split('T')[0],
          };
        }
        return p;
      })
    );

    // Sync sold status to Supabase
    supabase
      .from('products')
      .update({ status: 'sold', updated_at: new Date().toISOString() })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('Supabase markAsSold error:', error.message);
      });

    triggerConfetti();

    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userId: currentUser.id,
      title: 'Congratulations on your sale! 🏷️',
      message: 'Your item was marked as SOLD! The listing is preserved with a SOLD ribbon.',
      type: 'system',
      read: false,
      timestamp: 'Just now',
      link: '/dashboard',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    pushToast('Item marked as SOLD! Listing preserved with SOLD badge.', 'success');
  };

  const restoreToAvailable = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p))
    );
    supabase
      .from('products')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('Supabase restoreToAvailable error:', error.message);
      });
    pushToast('Listing restored to Available on marketplace!', 'success');
  };

  const broadcastEmailToAllUsers = async (subject: string, html: string) => {
    try {
      // 1. Fetch real student emails from Supabase profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('college_email')
        .not('college_email', 'is', null);

      const dbEmails = (profiles || [])
        .map((p: any) => p.college_email)
        .filter(Boolean);

      // 2. Combine with in-memory students
      const localEmails = students.map((s) => s.email).filter(Boolean);

      // 3. Always include admin gjr19atwork@gmail.com
      const allUniqueEmails = Array.from(
        new Set([...dbEmails, ...localEmails, 'gjr19atwork@gmail.com'])
      ).filter((email) => email && email.includes('@'));

      if (allUniqueEmails.length === 0) return;

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'alerts@marketplace.bmsit.co.in',
          bcc: allUniqueEmails,
          subject,
          html,
        }),
      });
    } catch (err) {
      console.warn('broadcastEmailToAllUsers error:', err);
    }
  };

  const approveProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'approved', rejectionReason: undefined } : p))
    );

    // Call Supabase RPC (updates DB, writes in-app notification, queues email in email_queue)
    supabase
      .rpc('admin_approve_product', { p_product_id: id })
      .then(({ error }) => {
        if (error) console.warn('admin_approve_product error:', error.message);
      });

    // Send email alert to student seller via /api/send-email
    if (target.sellerId) {
      const sellerStudent = students.find((s) => s.id === target.sellerId);
      const recipient = sellerStudent?.email || (target as any).sellerEmail;
      if (recipient) {
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipient,
            subject: `🎉 Listing Approved: ${target.title}`,
            html: `
              <div style="font-family:sans-serif;padding:24px;border:3px solid #1C1C1C;border-radius:12px;background:#FFFBEA;">
                <h2 style="color:#1C1C1C;margin:0 0 12px 0;">Your listing is live!</h2>
                <p>Great news! Your listing <strong>${target.title}</strong> has been approved by moderators and is now visible to all BMSIT students.</p>
                <p style="margin-top:20px;">
                  <a href="https://marketplace.bmsit.co.in" style="display:inline-block;padding:10px 18px;background:#F2A93B;color:#1C1C1C;font-weight:bold;text-decoration:none;border:2px solid #1C1C1C;border-radius:6px;">
                    View on BMSIT Marketplace &rarr;
                  </a>
                </p>
              </div>
            `,
          }),
        }).catch(() => {});
      }
    }

    // Broadcast email to ALL marketplace users
    broadcastEmailToAllUsers(
      `🔥 New Campus Listing: ${target.title} (₹${target.price})`,
      `
        <div style="font-family:sans-serif;padding:24px;border:3px solid #1C1C1C;border-radius:12px;background:#FFFBEA;max-width:600px;margin:0 auto;">
          <div style="background:#F2A93B;padding:12px 18px;border:2px solid #1C1C1C;border-radius:8px;margin-bottom:16px;">
            <h2 style="color:#1C1C1C;margin:0;font-size:20px;">🔥 New Item Listed on Campus!</h2>
          </div>
          <p style="font-size:15px;color:#1C1C1C;margin-bottom:8px;">A new item just went live on the BMSIT student marketplace:</p>
          <div style="background:#ffffff;border:2px solid #1C1C1C;border-radius:10px;padding:16px;margin:16px 0;">
            <h3 style="margin:0 0 8px 0;font-size:18px;color:#1C1C1C;">${target.title}</h3>
            <p style="margin:4px 0;font-size:16px;font-weight:bold;color:#1C1C1C;">Asking Price: ₹${target.price}</p>
            <p style="margin:4px 0;font-size:14px;color:#555;">Category: <strong>${target.category}</strong></p>
            <p style="margin:4px 0;font-size:14px;color:#555;">Seller: <strong>${target.sellerName}</strong> (${target.sellerUSN})</p>
            <p style="margin:4px 0;font-size:14px;color:#555;">Campus Pickup: <strong>${target.handoverLocation}</strong></p>
          </div>
          <p style="margin-top:20px;">
            <a href="https://marketplace.bmsit.co.in/?product=${target.id}" style="display:inline-block;padding:12px 24px;background:#F2A93B;color:#1C1C1C;font-weight:bold;text-decoration:none;border:2px solid #1C1C1C;border-radius:8px;box-shadow:3px 3px 0px #1C1C1C;">
              View Listing on Marketplace &rarr;
            </a>
          </p>
          <p style="font-size:11px;color:#888;margin-top:24px;border-top:1px solid #ddd;padding-top:12px;">
            You are receiving this because you are a registered student on BMSIT Marketplace (marketplace.bmsit.co.in).
          </p>
        </div>
      `
    );

    // Notify seller locally
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userId: target.sellerId,
      title: 'Listing Approved! 🎉',
      message: `Your listing "${target.title}" was approved by moderators and is live on campus marketplace.`,
      type: 'approval',
      read: false,
      timestamp: 'Just now',
      link: '/marketplace',
    };
    setNotifications((prev) => [notif, ...prev]);

    // Admin log
    const log: AdminLog = {
      id: 'log-' + Date.now(),
      adminName: currentUser.name,
      action: 'Approved Listing',
      target: `${target.title} (${target.id})`,
      details: `Seller: ${target.sellerName} (${target.sellerUSN})`,
      timestamp: new Date().toLocaleString(),
    };
    setAdminLogs((prev) => [log, ...prev]);

    triggerConfetti();
    pushToast(`Listing "${target.title}" approved and published!`, 'success');
  };

  const rejectProduct = (id: string, reason: string, adminNotes?: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;

    const fullReason = adminNotes ? `${reason} (${adminNotes})` : reason;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'rejected',
              rejectionReason: fullReason,
              adminNotes,
            }
          : p
      )
    );

    // Call Supabase RPC (updates DB, writes in-app notification, queues email in email_queue)
    supabase
      .rpc('admin_reject_product', {
        p_product_id: id,
        p_reason: fullReason,
      })
      .then(({ error }) => {
        if (error) console.warn('admin_reject_product error:', error.message);
      });

    // Send email alert to student seller
    if (target.sellerId) {
      const sellerStudent = students.find((s) => s.id === target.sellerId);
      const recipient = sellerStudent?.email || (target as any).sellerEmail;
      if (recipient) {
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipient,
            subject: `Listing Update Required: ${target.title}`,
            html: `
              <div style="font-family:sans-serif;padding:24px;border:3px solid #1C1C1C;border-radius:12px;background:#FFFBEA;">
                <h2 style="color:#1C1C1C;margin:0 0 12px 0;">Listing Update Required</h2>
                <p>Your listing <strong>${target.title}</strong> could not be approved at this time.</p>
                <p><strong>Reason:</strong> ${fullReason}</p>
                <p>You can review and update your listing to meet BMSIT community guidelines.</p>
              </div>
            `,
          }),
        }).catch(() => {});
      }
    }

    // Notify seller
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userId: target.sellerId,
      title: 'Listing Rejected ⚠️',
      message: `"${target.title}" was rejected: ${fullReason}`,
      type: 'rejection',
      read: false,
      timestamp: 'Just now',
      link: '/dashboard',
    };
    setNotifications((prev) => [notif, ...prev]);

    // Admin log
    const log: AdminLog = {
      id: 'log-' + Date.now(),
      adminName: currentUser.name,
      action: 'Rejected Listing',
      target: `${target.title} (${target.id})`,
      details: `Reason: ${fullReason}`,
      timestamp: new Date().toLocaleString(),
    };
    setAdminLogs((prev) => [log, ...prev]);

    pushToast(`Listing rejected. Reason communicated to seller.`, 'warning');
  };

  // Wishlist & Compare
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        pushToast('Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        pushToast('Added to wishlist ❤️', 'success');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  const toggleCompare = (productId: string) => {
    setCompareList((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      if (prev.length >= 3) {
        pushToast('You can compare up to 3 products at a time.', 'warning');
        return prev;
      }
      pushToast('Added to comparison bar.', 'info');
      return [...prev, productId];
    });
  };

  const isInCompare = (productId: string) => compareList.includes(productId);
  const clearCompare = () => setCompareList([]);

  // Wanted Requests
  const addWantedRequest = (
    requestData: Omit<WantedRequest, 'id' | 'postedDate' | 'responses' | 'status'>
  ): WantedRequest => {
    const reqId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'wnt-' + Date.now();
    const newReq: WantedRequest = {
      ...requestData,
      id: reqId,
      status: 'pending_approval',
      postedDate: new Date().toISOString().split('T')[0],
      responses: [],
    };

    setWantedRequests((prev) => {
      const updated = [newReq, ...prev.filter((r) => r.id !== reqId)];
      safeLocalStorage.setItem(STORAGE_KEYS.WANTED, JSON.stringify(updated));
      return updated;
    });

    // Insert into Supabase with pending status
    if (currentUser?.id) {
      supabase
        .from('wanted_requests')
        .insert({
          id: reqId,
          title: newReq.title,
          description: newReq.description || 'Looking for this item on campus.',
          category: newReq.category,
          max_budget: newReq.maxBudget || null,
          requester_id: currentUser.id,
          status: 'pending',
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase wanted request insert error:', error.message);
        });
    }

    // Dispatch automated email alert to admin
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'gjr19atwork@gmail.com',
        subject: `📌 [Review Required] New Wanted Request: ${newReq.title}`,
        html: `
          <div style="font-family:sans-serif;padding:24px;border:3px solid #1C1C1C;border-radius:12px;background:#FFFBEA;">
            <h2 style="color:#1C1C1C;margin:0 0 12px 0;">New Wanted Request Pending Approval</h2>
            <p><strong>Item Needed:</strong> ${newReq.title}</p>
            <p><strong>Category:</strong> ${newReq.category}</p>
            <p><strong>Details:</strong> ${newReq.description}</p>
            <p><strong>Student:</strong> ${currentUser.name} (${currentUser.usn})</p>
            <p><strong>Email:</strong> ${currentUser.email}</p>
            <p style="margin-top:20px;">
              <a href="https://marketplace.bmsit.co.in/ishowspeed" style="display:inline-block;padding:10px 18px;background:#F2A93B;color:#1C1C1C;font-weight:bold;text-decoration:none;border:2px solid #1C1C1C;border-radius:6px;">
                Review in Admin Portal &rarr;
              </a>
            </p>
          </div>
        `,
      }),
    }).catch(() => {});

    // Add notification
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userId: currentUser.id,
      title: 'Wanted Request Submitted for Approval ⏳',
      message: `"${newReq.title}" has been submitted. It will appear on the Wanted Board once approved by moderators.`,
      type: 'wanted',
      read: false,
      timestamp: 'Just now',
      link: '/wanted-board',
    };
    setNotifications((prev) => [notif, ...prev]);

    pushToast('Wanted request submitted! It will appear once approved by a moderator.', 'success');
    return newReq;
  };

  const approveWantedRequest = (id: string) => {
    const target = wantedRequests.find((r) => r.id === id);
    if (!target) return;

    setWantedRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'open' } : r))
    );

    // Update status in Supabase
    supabase
      .from('wanted_requests')
      .update({ status: 'approved' })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('Supabase wanted request approve error:', error.message);
      });

    // Notify requester
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userId: target.studentId,
      title: 'Wanted Request Approved! 🎉',
      message: `Your request "${target.title}" is now live on the Wanted Board.`,
      type: 'approval',
      read: false,
      timestamp: 'Just now',
      link: '/wanted-board',
    };
    setNotifications((prev) => [notif, ...prev]);

    // Send email to requester
    const student = students.find((s) => s.id === target.studentId);
    if (student?.email) {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: student.email,
          subject: `🎉 Your Wanted Request is Live: ${target.title}`,
          html: `
            <div style="font-family:sans-serif;padding:24px;border:3px solid #1C1C1C;border-radius:12px;background:#FFFBEA;">
              <h2 style="color:#1C1C1C;margin:0 0 12px 0;">🎉 Your Wanted Request Was Approved!</h2>
              <p>Hello ${target.studentName},</p>
              <p>Your request for <strong>"${target.title}"</strong> has been approved by our campus moderators and is now visible to all BMSIT students on the Wanted Board.</p>
              <p style="margin-top:20px;">
                <a href="https://marketplace.bmsit.co.in/wanted-board" style="display:inline-block;padding:10px 18px;background:#F2A93B;color:#1C1C1C;font-weight:bold;text-decoration:none;border:2px solid #1C1C1C;border-radius:6px;">
                  View on Wanted Board &rarr;
                </a>
              </p>
            </div>
          `,
        }),
      }).catch(() => {});
    }

    // Broadcast alert email to ALL registered users!
    broadcastEmailToAllUsers(
      `📌 New Campus Wanted Request: ${target.title}`,
      `
        <div style="font-family:sans-serif;padding:24px;border:3px solid #1C1C1C;border-radius:12px;background:#FFFBEA;max-width:600px;margin:0 auto;">
          <div style="background:#FFE082;padding:12px 18px;border:2px solid #1C1C1C;border-radius:8px;margin-bottom:16px;">
            <h2 style="color:#1C1C1C;margin:0;font-size:20px;">📌 A Student is Looking For An Item!</h2>
          </div>
          <p style="font-size:15px;color:#1C1C1C;margin-bottom:8px;">A fellow BMSIT student just posted an item request on the Wanted Board:</p>
          <div style="background:#ffffff;border:2px solid #1C1C1C;border-radius:10px;padding:16px;margin:16px 0;">
            <h3 style="margin:0 0 8px 0;font-size:18px;color:#1C1C1C;">${target.title}</h3>
            ${target.maxBudget ? `<p style="margin:4px 0;font-size:15px;font-weight:bold;color:#1C1C1C;">Max Budget: ₹${target.maxBudget}</p>` : ''}
            <p style="margin:4px 0;font-size:14px;color:#555;">Category: <strong>${target.category}</strong></p>
            <p style="margin:4px 0;font-size:14px;color:#555;">Requested by: <strong>${target.studentName}</strong> (${target.studentUSN}) • ${target.studentBranch}</p>
            ${target.description ? `<p style="margin:8px 0 0 0;font-size:13px;color:#333;font-style:italic;background:#FFFBEA;padding:8px;border-radius:6px;">"${target.description}"</p>` : ''}
          </div>
          <p style="font-size:14px;color:#1C1C1C;">Have this item? Fulfill their request and earn cash directly on campus!</p>
          <p style="margin-top:20px;">
            <a href="https://marketplace.bmsit.co.in/wanted-board" style="display:inline-block;padding:12px 24px;background:#F2A93B;color:#1C1C1C;font-weight:bold;text-decoration:none;border:2px solid #1C1C1C;border-radius:8px;box-shadow:3px 3px 0px #1C1C1C;">
              Open Wanted Board &rarr;
            </a>
          </p>
          <p style="font-size:11px;color:#888;margin-top:24px;border-top:1px solid #ddd;padding-top:12px;">
            You are receiving this because you are a registered student on BMSIT Marketplace (marketplace.bmsit.co.in).
          </p>
        </div>
      `
    );

    triggerConfetti();
    pushToast(`Wanted request "${target.title}" approved and broadcasted to campus!`, 'success');
  };

  const rejectWantedRequest = (id: string, reason?: string) => {
    const target = wantedRequests.find((r) => r.id === id);
    if (!target) return;

    setWantedRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
    );

    // Update status in Supabase
    supabase
      .from('wanted_requests')
      .update({ status: 'rejected' })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('Supabase wanted request reject error:', error.message);
      });

    // Notify requester
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userId: target.studentId,
      title: 'Wanted Request Declined',
      message: `Your request "${target.title}" was not approved: ${reason || 'Does not comply with campus marketplace guidelines.'}`,
      type: 'rejection',
      read: false,
      timestamp: 'Just now',
      link: '/wanted-board',
    };
    setNotifications((prev) => [notif, ...prev]);

    pushToast('Wanted request rejected.', 'info');
  };

  const updateWantedRequest = (id: string, updates: Partial<WantedRequest>) => {
    setWantedRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    pushToast('Wanted request updated.', 'success');
  };

  const deleteWantedRequest = (id: string) => {
    setWantedRequests((prev) => prev.filter((r) => r.id !== id));
    supabase
      .from('wanted_requests')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('Supabase wanted request delete error:', error.message);
      });
    pushToast('Wanted request deleted.', 'info');
  };

  const closeWantedRequest = (id: string, status: 'fulfilled' | 'expired' = 'fulfilled') => {
    setWantedRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    pushToast(`Wanted request marked as ${status}.`, 'info');
  };

  const addWantedResponse = (
    requestId: string,
    message: string,
    proposedPrice: number,
    offeredProductId?: string
  ) => {
    const req = wantedRequests.find((r) => r.id === requestId);
    if (!req) return;

    const responseItem = {
      id: 'resp-' + Date.now(),
      responderId: currentUser.id,
      responderName: currentUser.name,
      responderUSN: currentUser.usn,
      responderBranch: currentUser.branch,
      message,
      offeredProductId,
      proposedPrice,
      createdAt: 'Just now',
    };

    setWantedRequests((prev) =>
      prev.map((r) => {
        if (r.id === requestId) {
          return {
            ...r,
            status: 'responses_received',
            responses: [...r.responses, responseItem],
          };
        }
        return r;
      })
    );

    // Notify requester
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userId: req.studentId,
      title: 'New Response on Wanted Board! 🔔',
      message: `${currentUser.name} offered to fulfill "${req.title}" for ₹${proposedPrice}.`,
      type: 'offer',
      read: false,
      timestamp: 'Just now',
      link: '/wanted-board',
    };
    setNotifications((prev) => [notif, ...prev]);

    pushToast('Your offer has been submitted to the requester!', 'success');
  };

  // Chats
  const sendMessage = (
    conversationId: string,
    text: string,
    isOffer?: boolean,
    offerAmount?: number
  ) => {
    if (currentUser.status === 'suspended') {
      pushToast('Your account is currently suspended. You cannot send messages.', 'error');
      return;
    }

    const targetConvId = conversationIdMap.current[conversationId] || conversationId;
    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    const msgId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'm-' + Date.now();

    const newMsg = {
      id: msgId,
      conversationId: targetConvId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      timestamp: dateFormatted,
      isOffer,
      offerAmount,
    };

    setAllChats((prev) =>
      prev.map((c) => {
        if (c.id === conversationId || c.id === targetConvId) {
          return {
            ...c,
            lastMessage: text,
            lastMessageTime: dateFormatted,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    // Persist to Supabase messages table if UUID
    if (isUUID(targetConvId) && isUUID(currentUser?.id)) {
      supabase
        .from('messages')
        .insert({
          id: msgId,
          conversation_id: targetConvId,
          sender_id: currentUser.id,
          message_text: text,
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase message insert error:', error.message);
        });
    }
  };

  const startChatWithSeller = (product: Product, initialMessage?: string): string => {
    // STRICT PRIVACY: Check if private conversation already exists between these 2 students
    const existing = allChats.find(
      (c) =>
        c.productId === product.id &&
        c.participantIds?.includes(currentUser.id) &&
        c.participantIds?.includes(product.sellerId)
    );

    if (existing) {
      if (initialMessage) {
        sendMessage(existing.id, initialMessage);
      }
      return existing.id;
    }

    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newConvId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'chat-' + Date.now();
    conversationIdMap.current[newConvId] = newConvId;

    const initialMsgId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'm-' + Date.now();
    const initialMsgObj = initialMessage
      ? {
          id: initialMsgId,
          conversationId: newConvId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          text: initialMessage,
          timestamp: dateFormatted,
        }
      : undefined;

    // Create brand-new private 1-on-1 student conversation
    const newConv: ChatConversation = {
      id: newConvId,
      participantIds: [currentUser.id, product.sellerId],
      participants: [
        {
          id: currentUser.id,
          name: currentUser.name,
          usn: currentUser.usn,
          branch: currentUser.branch,
          avatar: currentUser.avatar,
        },
        {
          id: product.sellerId,
          name: product.sellerName,
          usn: product.sellerUSN,
          branch: product.sellerBranch,
          avatar: product.sellerAvatar,
        },
      ],
      otherParticipant: {
        id: product.sellerId,
        name: product.sellerName,
        usn: product.sellerUSN,
        branch: product.sellerBranch,
        avatar: product.sellerAvatar,
      },
      productId: product.id,
      productTitle: product.title,
      productPrice: product.price,
      productImage: product.images[0],
      productStatus: product.status,
      handoverLocation: product.handoverLocation,
      lastMessage: initialMessage || 'Started conversation',
      lastMessageTime: dateFormatted,
      unreadCount: 0,
      messages: initialMsgObj ? [initialMsgObj] : [],
    };

    setAllChats((prev) => [newConv, ...prev]);

    // Persist to Supabase if authenticated with real profiles
    if (isUUID(currentUser.id) && isUUID(product.sellerId)) {
      supabase
        .rpc('get_or_create_conversation', {
          p_seller_id: product.sellerId,
          p_product_id: isUUID(product.id) ? product.id : null,
        })
        .then(({ data, error }) => {
          if (!error && data?.success && data?.conversation_id) {
            const realId = data.conversation_id;
            conversationIdMap.current[newConvId] = realId;
            if (realId !== newConvId) {
              setAllChats((prev) =>
                prev.map((c) =>
                  c.id === newConvId
                    ? {
                        ...c,
                        id: realId,
                        messages: c.messages.map((m) =>
                          m.conversationId === newConvId ? { ...m, conversationId: realId } : m
                        ),
                      }
                    : c
                )
              );
            }
            if (initialMessage) {
              supabase
                .from('messages')
                .insert({
                  id: initialMsgId,
                  conversation_id: realId,
                  sender_id: currentUser.id,
                  message_text: initialMessage,
                })
                .then(({ error: msgErr }) => {
                  if (msgErr) console.warn('Supabase initial message insert error:', msgErr.message);
                });
            }
          }
        });
    }

    return newConvId;
  };

  const startChatWithStudent = (
    student: { id: string; name: string; usn: string; branch: string; avatar?: string },
    wantedTitle: string,
    initialMessage?: string
  ): string => {
    // STRICT PRIVACY: Check if private conversation already exists between these 2 students
    const existing = allChats.find(
      (c) =>
        c.participantIds?.includes(currentUser.id) &&
        c.participantIds?.includes(student.id)
    );

    if (existing) {
      if (initialMessage) {
        sendMessage(existing.id, initialMessage);
      }
      return existing.id;
    }

    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newConvId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'chat-wanted-' + Date.now();
    conversationIdMap.current[newConvId] = newConvId;

    const initialText = initialMessage || `Hi ${student.name.split(' ')[0]}, I saw your wanted request for "${wantedTitle}"! I might have what you need.`;
    const initialMsgId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'm-' + Date.now();

    const newConv: ChatConversation = {
      id: newConvId,
      participantIds: [currentUser.id, student.id],
      participants: [
        {
          id: currentUser.id,
          name: currentUser.name,
          usn: currentUser.usn,
          branch: currentUser.branch,
          avatar: currentUser.avatar,
        },
        {
          id: student.id,
          name: student.name,
          usn: student.usn,
          branch: student.branch,
          avatar: student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        },
      ],
      otherParticipant: {
        id: student.id,
        name: student.name,
        usn: student.usn,
        branch: student.branch,
        avatar: student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      },
      productTitle: `Wanted: ${wantedTitle}`,
      lastMessage: initialText,
      lastMessageTime: dateFormatted,
      unreadCount: 0,
      messages: [
        {
          id: initialMsgId,
          conversationId: newConvId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          text: initialText,
          timestamp: dateFormatted,
        },
      ],
    };

    setAllChats((prev) => [newConv, ...prev]);

    // Persist to Supabase if authenticated
    if (isUUID(currentUser.id) && isUUID(student.id)) {
      supabase
        .rpc('get_or_create_conversation', {
          p_seller_id: student.id,
          p_product_id: null,
        })
        .then(({ data, error }) => {
          if (!error && data?.success && data?.conversation_id) {
            const realId = data.conversation_id;
            conversationIdMap.current[newConvId] = realId;
            if (realId !== newConvId) {
              setAllChats((prev) =>
                prev.map((c) =>
                  c.id === newConvId
                    ? {
                        ...c,
                        id: realId,
                        messages: c.messages.map((m) =>
                          m.conversationId === newConvId ? { ...m, conversationId: realId } : m
                        ),
                      }
                    : c
                )
              );
            }
            supabase
              .from('messages')
              .insert({
                id: initialMsgId,
                conversation_id: realId,
                sender_id: currentUser.id,
                message_text: initialText,
              })
              .then(({ error: msgErr }) => {
                if (msgErr) console.warn('Supabase wanted chat initial message insert error:', msgErr.message);
              });
          }
        });
    }

    return newConvId;
  };

  const markChatAsRead = (conversationId: string) => {
    const targetConvId = conversationIdMap.current[conversationId] || conversationId;

    setAllChats((prev) => {
      const target = prev.find((c) => c.id === conversationId || c.id === targetConvId);
      if (!target || target.unreadCount === 0) return prev;
      return prev.map((c) => (c.id === conversationId || c.id === targetConvId ? { ...c, unreadCount: 0 } : c));
    });

    if (isUUID(targetConvId) && isUUID(currentUser?.id)) {
      supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', targetConvId)
        .neq('sender_id', currentUser.id)
        .then(({ error }) => {
          if (error) console.warn('Supabase markChatAsRead error:', error.message);
        });
    }
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.warn('Supabase markNotificationAsRead error:', error.message);
      });
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (currentUser?.id) {
      supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUser.id)
        .then(({ error }) => {
          if (error) console.warn('Supabase markAllNotificationsAsRead error:', error.message);
        });
    }
    pushToast('All notifications marked as read.', 'info');
  };

  // Moderation & Admin
  const submitReport = (report: Omit<ModerationReport, 'id' | 'timestamp' | 'status'>) => {
    const reportId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'rep-' + Date.now();
    const newRep: ModerationReport = {
      ...report,
      id: reportId,
      status: 'open',
      timestamp: new Date().toLocaleString(),
    };
    setReports((prev) => [newRep, ...prev]);

    // Persist to Supabase reports table
    supabase
      .from('reports')
      .insert({
        id: isUUID(reportId) ? reportId : undefined,
        target_type: report.targetType,
        target_id: report.targetId,
        target_title: report.targetTitle,
        reporter_id: isUUID(currentUser?.id) ? currentUser.id : null,
        reporter_name: currentUser?.name || 'BMSIT Student',
        reason: report.reason,
        details: report.details,
        status: 'open',
      })
      .then(({ error }) => {
        if (error) console.warn('Supabase submitReport error:', error.message);
      });

    // Send immediate email notification to Admin via /api/send-email
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'gjr19atwork@gmail.com',
        subject: `🚨 [ALERT] Campus Safety Report: ${report.targetTitle}`,
        html: `
          <div style="font-family:sans-serif;padding:24px;border:3px solid #E1467A;border-radius:12px;background:#FFF0F5;">
            <h2 style="color:#C71F52;margin:0 0 12px 0;">🚨 Campus Safety Report Submitted</h2>
            <p>A student has flagged a listing or user on BMSIT Marketplace.</p>
            <p><strong>Reported Item/User:</strong> ${report.targetTitle} (${report.targetType})</p>
            <p><strong>Reason:</strong> ${report.reason}</p>
            <p><strong>Details:</strong> ${report.details || 'None provided'}</p>
            <p><strong>Reported By:</strong> ${currentUser?.name || 'Student'} (${currentUser?.usn || 'BMSIT'})</p>
            <p><strong>Student Email:</strong> ${currentUser?.email || 'N/A'}</p>
            <p style="margin-top:20px;">
              <a href="https://marketplace.bmsit.co.in/ishowspeed" style="display:inline-block;padding:12px 20px;background:#C71F52;color:#ffffff;font-weight:bold;text-decoration:none;border-radius:8px;">
                Review in Admin Portal &rarr;
              </a>
            </p>
          </div>
        `,
      }),
    }).catch(() => {});

    pushToast('Report submitted. Moderator team will review.', 'info');
  };

  const updateReportStatus = (id: string, status: 'investigating' | 'resolved' | 'dismissed') => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );

    if (isUUID(id)) {
      supabase
        .rpc('admin_update_report_status', {
          p_report_id: id,
          p_status: status,
        })
        .then(({ error }) => {
          if (error) console.warn('admin_update_report_status error:', error.message);
        });
    }

    pushToast(`Report status updated to ${status}.`, 'info');
  };

  const suspendUser = (userId: string) => {
    const target = students.find((s) => s.id === userId);
    setStudents((prev) =>
      prev.map((s) => (s.id === userId ? { ...s, status: 'suspended' } : s))
    );

    const log: AdminLog = {
      id: 'log-' + Date.now(),
      adminName: currentUser.name,
      action: 'Suspended Account',
      target: `${target?.name || 'User'} (${target?.usn || userId})`,
      details: 'Account suspended for policy violations.',
      timestamp: new Date().toLocaleString(),
    };
    setAdminLogs((prev) => [log, ...prev]);

    pushToast(`Account for ${target?.name} suspended.`, 'warning');
  };

  const unsuspendUser = (userId: string) => {
    const target = students.find((s) => s.id === userId);
    setStudents((prev) =>
      prev.map((s) => (s.id === userId ? { ...s, status: 'active' } : s))
    );

    const log: AdminLog = {
      id: 'log-' + Date.now(),
      adminName: currentUser.name,
      action: 'Unsuspended Account',
      target: `${target?.name || 'User'} (${target?.usn || userId})`,
      details: 'Account privileges restored.',
      timestamp: new Date().toLocaleString(),
    };
    setAdminLogs((prev) => [log, ...prev]);

    pushToast(`Account for ${target?.name} reactivated.`, 'success');
  };

  // User Management
  const setCurrentUser = (student: Student) => {
    setCurrentUserState(student);
  };

  const switchUser = (studentId: string) => {
    const found = students.find((s) => s.id === studentId);
    if (found) {
      setCurrentUserState(found);
      setIsAdminMode(found.role === 'admin');
      pushToast(`Switched user to ${found.name} (${found.usn})`, 'info');
    }
  };

  const registerUser = (userData: Partial<Student>): Student => {
    const newStudent: Student = {
      id: 'std-' + Date.now(),
      name: userData.name || 'New Student',
      email: userData.email || 'student@bmsit.in',
      usn: userData.usn || '1BY25CS001',
      branch: userData.branch || 'Computer Science & Engineering (CSE)',
      admissionYear: userData.admissionYear || 2025,
      currentYear: userData.currentYear || '1st Year (Fresher)',
      avatar:
        userData.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      role: 'student',
      verified: true,
      status: 'active',
      bio: 'BMSIT student on marketplace.',
      notificationsEnabled: true,
      emailWantedAlerts: true,
    };

    setStudents((prev) => [...prev, newStudent]);
    setCurrentUserState(newStudent);
    triggerConfetti();
    pushToast(`Welcome to BMSIT Marketplace, ${newStudent.name}!`, 'success');
    return newStudent;
  };

  const updateProfile = (updates: Partial<Student>) => {
    setCurrentUserState((prev) => {
      const updated = { ...prev, ...updates };
      safeLocalStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
      return updated;
    });
    setStudents((prev) => {
      const updated = prev.map((s) => (s.id === currentUser.id ? { ...s, ...updates } : s));
      safeLocalStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
      return updated;
    });

    // Sync profile updates to Supabase profiles table
    if (isUUID(currentUser.id)) {
      const dbUpdates: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) dbUpdates.full_name = updates.name;
      if (updates.branch !== undefined) dbUpdates.branch = updates.branch;
      if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
      if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;
      if (updates.admissionYear !== undefined) dbUpdates.admission_year = updates.admissionYear;
      if (updates.currentYear !== undefined) dbUpdates.current_year = updates.currentYear;

      supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', currentUser.id)
        .then(({ error }) => {
          if (error) console.warn('Supabase updateProfile error:', error.message);
        });
    }

    pushToast('Profile updated successfully!', 'success');
  };

  const logoutUser = async (customMessage?: string | unknown) => {
    try { await supabase.auth.signOut(); } catch {}
    safeLocalStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    safeLocalStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
    try { sessionStorage.removeItem('bmsit_admin_auth'); } catch {}
    setCurrentUserState(GUEST_STUDENT);
    setIsAdminMode(false);
    const msg = typeof customMessage === 'string' ? customMessage : 'Signed out of BMSIT Marketplace.';
    pushToast(msg, 'info');
  };

  // Automatic Inactivity Logout (Logs out after 30 minutes of no user interaction)
  useEffect(() => {
    // Only monitor if the user is authenticated (not a guest)
    if (!currentUser || currentUser.id === 'guest' || !currentUser.email) {
      return;
    }

    // Set initial activity timestamp if none exists
    if (!safeLocalStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY)) {
      safeLocalStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    }

    const checkInactivity = async () => {
      const lastActiveStr = safeLocalStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
      if (!lastActiveStr) return;
      const lastActive = parseInt(lastActiveStr, 10);
      const elapsed = Date.now() - lastActive;

      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        safeLocalStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
        await logoutUser('You have been logged out due to 30 minutes of inactivity.');
      }
    };

    let lastRecorded = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      // Throttle updates to localStorage to once every 10 seconds
      if (now - lastRecorded > 10000) {
        lastRecorded = now;
        safeLocalStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
      }
    };

    // User interaction events to detect activity across mouse, keyboard, touch, and scroll
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Check periodically every 15 seconds
    const intervalId = setInterval(checkInactivity, 15000);

    // Check immediately when tab becomes visible or receives focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkInactivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkInactivity);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkInactivity);
    };
  }, [currentUser.id, currentUser.email]);

  const toggleAdminMode = () => {
    if (!isAdminMode) {
      const adminAcc = students.find((s) => s.role === 'admin');
      if (adminAcc) {
        setCurrentUserState(adminAcc);
        setIsAdminMode(true);
        pushToast('Switched to BMSIT Moderator Admin Mode 🛡️', 'info');
      } else {
        window.location.href = '/ishowspeed';
      }
    } else {
      setCurrentUserState(GUEST_STUDENT);
      setIsAdminMode(false);
      pushToast('Switched to Student Mode 🎓', 'info');
    }
  };

  // Reset / Clear Local Data
  const resetDemoData = () => {
    Object.values(STORAGE_KEYS).forEach((k) => safeLocalStorage.removeItem(k));
    setProducts([]);
    setStudents([]);
    setCurrentUserState(GUEST_STUDENT);
    setIsAdminMode(false);
    setWishlist([]);
    setCompareList([]);
    setWantedRequests([]);
    setAllChats([]);
    setNotifications([]);
    setReports([]);
    setAdminLogs([]);
    pushToast('Cleared local cached data.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        products,
        students,
        currentUser,
        isAdminMode,
        wishlist,
        compareList,
        wantedRequests,
        chats,
        notifications,
        reports,
        adminLogs,
        campusLocations: CAMPUS_LOCATIONS,
        toasts,
        pushToast,
        dismissToast,
        triggerConfetti,
        addProduct,
        updateProduct,
        deleteProduct,
        markAsSold,
        restoreToAvailable,
        approveProduct,
        rejectProduct,
        toggleWishlist,
        isWishlisted,
        toggleCompare,
        isInCompare,
        clearCompare,
        addWantedRequest,
        updateWantedRequest,
        deleteWantedRequest,
        closeWantedRequest,
        addWantedResponse,
        approveWantedRequest,
        rejectWantedRequest,
        sendMessage,
        startChatWithSeller,
        startChatWithStudent,
        markChatAsRead,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        submitReport,
        updateReportStatus,
        suspendUser,
        unsuspendUser,
        setCurrentUser,
        switchUser,
        registerUser,
        updateProfile,
        logoutUser,
        toggleAdminMode,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
