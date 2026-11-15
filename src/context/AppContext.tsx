import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Product,
  Student,
  WantedRequest,
  ChatConversation,
  NotificationItem,
  ModerationReport,
  CampusLocation,
  AdminLog,
} from '../types';
import {
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
  toggleAdminMode: () => void;

  // Reset
  resetDemoData: () => void;
}

const STORAGE_KEYS = {
  PRODUCTS: 'marketplace_bmsit_products_v3',
  STUDENTS: 'marketplace_bmsit_students_v2',
  CURRENT_USER: 'marketplace_bmsit_current_user_v2',
  WISHLIST: 'marketplace_bmsit_wishlist_v2',
  WANTED: 'marketplace_bmsit_wanted_v2',
  CHATS: 'marketplace_bmsit_chats_v3',
  NOTIFICATIONS: 'marketplace_bmsit_notifs_v2',
  REPORTS: 'marketplace_bmsit_reports_v2',
  LOGS: 'marketplace_bmsit_logs_v2',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        const parsed: Product[] = JSON.parse(saved);
        return parsed.map((p) => ({
          ...p,
          handoverLocation: normalizeCampusLocation(p.handoverLocation),
        }));
      } catch {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [currentUser, setCurrentUserState] = useState<Student>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (saved) {
      const parsed = JSON.parse(saved);
      const found = INITIAL_STUDENTS.find((s) => s.id === parsed.id);
      return found || parsed;
    }
    return INITIAL_STUDENTS[0]; // Default Rohan Sharma (1BY24AI049)
  });

  const [isAdminMode, setIsAdminMode] = useState<boolean>(currentUser.role === 'admin');

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return saved ? JSON.parse(saved) : ['prod-2', 'prod-5'];
  });

  const [compareList, setCompareList] = useState<string[]>([]);

  const [wantedRequests, setWantedRequests] = useState<WantedRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WANTED);
    return saved ? JSON.parse(saved) : INITIAL_WANTED_REQUESTS;
  });

  const [allChats, setAllChats] = useState<ChatConversation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHATS);
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  // STRICT PRIVACY: currentUser only receives their own private conversations!
  const chats = useMemo(() => {
    return allChats.filter((c) => {
      if (c.participantIds && Array.isArray(c.participantIds)) {
        return c.participantIds.includes(currentUser.id);
      }
      return false;
    });
  }, [allChats, currentUser.id]);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [reports, setReports] = useState<ModerationReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REPORTS);
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [adminLogs, setAdminLogs] = useState<AdminLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_LOGS;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    setIsAdminMode(currentUser.role === 'admin');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WANTED, JSON.stringify(wantedRequests));
  }, [wantedRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(allChats));
  }, [allChats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(adminLogs));
  }, [adminLogs]);

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

  // Products Handlers
  const addProduct = (
    productData: Omit<Product, 'id' | 'postedDate' | 'updatedDate' | 'viewsCount' | 'likesCount'>
  ): Product => {
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
      status: 'pending_approval', // STRICT RULE: Pending approval first!
      postedDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      viewsCount: 0,
      likesCount: 0,
    };

    setProducts((prev) => [newProduct, ...prev]);

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
    pushToast('Listing updated successfully.', 'success');
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
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
    pushToast('Listing restored to Available on marketplace!', 'success');
  };

  const approveProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'approved', rejectionReason: undefined } : p))
    );

    // Notify seller
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

    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'rejected',
              rejectionReason: reason,
              adminNotes,
            }
          : p
      )
    );

    // Notify seller
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userId: target.sellerId,
      title: 'Listing Rejected ⚠️',
      message: `"${target.title}" was rejected: ${reason}`,
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
      details: `Reason: ${reason}`,
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
    const newReq: WantedRequest = {
      ...requestData,
      id: 'wnt-' + Date.now(),
      status: 'open',
      postedDate: new Date().toISOString().split('T')[0],
      responses: [],
    };

    setWantedRequests((prev) => [newReq, ...prev]);

    // Add notification
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      userId: currentUser.id,
      title: 'Wanted Request Live! 📌',
      message: `"${newReq.title}" posted. Campus sellers will be alerted.`,
      type: 'wanted',
      read: false,
      timestamp: 'Just now',
      link: '/wanted-board',
    };
    setNotifications((prev) => [notif, ...prev]);

    pushToast('Wanted request posted successfully!', 'success');
    return newReq;
  };

  const updateWantedRequest = (id: string, updates: Partial<WantedRequest>) => {
    setWantedRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    pushToast('Wanted request updated.', 'success');
  };

  const deleteWantedRequest = (id: string) => {
    setWantedRequests((prev) => prev.filter((r) => r.id !== id));
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

    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newMsg = {
      id: 'm-' + Date.now(),
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      timestamp: dateFormatted,
      isOffer,
      offerAmount,
    };

    setAllChats((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
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

    // Create brand-new private 1-on-1 student conversation
    const newConvId = 'chat-' + Date.now();
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
      messages: initialMessage
        ? [
            {
              id: 'm-' + Date.now(),
              conversationId: newConvId,
              senderId: currentUser.id,
              senderName: currentUser.name,
              text: initialMessage,
              timestamp: dateFormatted,
            },
          ]
        : [],
    };

    setAllChats((prev) => [newConv, ...prev]);
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

    const newConvId = 'chat-wanted-' + Date.now();
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
      lastMessage: initialMessage || `Hi ${student.name.split(' ')[0]}, I saw your wanted request!`,
      lastMessageTime: dateFormatted,
      unreadCount: 0,
      messages: [
        {
          id: 'm-' + Date.now(),
          conversationId: newConvId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          text: initialMessage || `Hi ${student.name.split(' ')[0]}, I saw your wanted request for "${wantedTitle}"! I might have what you need.`,
          timestamp: dateFormatted,
        },
      ],
    };

    setAllChats((prev) => [newConv, ...prev]);
    return newConvId;
  };

  const markChatAsRead = (conversationId: string) => {
    setAllChats((prev) => {
      const target = prev.find((c) => c.id === conversationId);
      if (!target || target.unreadCount === 0) return prev;
      return prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c));
    });
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    pushToast('All notifications marked as read.', 'info');
  };

  // Moderation & Admin
  const submitReport = (report: Omit<ModerationReport, 'id' | 'timestamp' | 'status'>) => {
    const newRep: ModerationReport = {
      ...report,
      id: 'rep-' + Date.now(),
      status: 'open',
      timestamp: new Date().toLocaleString(),
    };
    setReports((prev) => [newRep, ...prev]);
    pushToast('Report submitted. Moderator team will review.', 'info');
  };

  const updateReportStatus = (id: string, status: 'investigating' | 'resolved' | 'dismissed') => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
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
    setCurrentUserState((prev) => ({ ...prev, ...updates }));
    setStudents((prev) =>
      prev.map((s) => (s.id === currentUser.id ? { ...s, ...updates } : s))
    );
    pushToast('Profile updated successfully!', 'success');
  };

  const toggleAdminMode = () => {
    if (!isAdminMode) {
      // Find admin user or elevate
      const adminAcc = students.find((s) => s.role === 'admin') || INITIAL_STUDENTS[11];
      setCurrentUserState(adminAcc);
      setIsAdminMode(true);
      pushToast('Switched to BMSIT Moderator Admin Mode 🛡️', 'info');
    } else {
      // Switch back to student
      const studentAcc = students.find((s) => s.role === 'student') || INITIAL_STUDENTS[0];
      setCurrentUserState(studentAcc);
      setIsAdminMode(false);
      pushToast('Switched to Student Mode 🎓', 'info');
    }
  };

  // Reset Demo Data
  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.WISHLIST);
    localStorage.removeItem(STORAGE_KEYS.WANTED);
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.REPORTS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);

    setProducts(INITIAL_PRODUCTS);
    setStudents(INITIAL_STUDENTS);
    setCurrentUserState(INITIAL_STUDENTS[0]);
    setIsAdminMode(false);
    setWishlist(['prod-2', 'prod-5']);
    setCompareList([]);
    setWantedRequests(INITIAL_WANTED_REQUESTS);
    setAllChats(INITIAL_CHATS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setReports(INITIAL_REPORTS);
    setAdminLogs(INITIAL_ADMIN_LOGS);

    pushToast('Demo data restored to initial campus state! 🔄', 'success');
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
