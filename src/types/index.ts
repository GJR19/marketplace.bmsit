export type ListingStatus = 'pending_approval' | 'approved' | 'rejected' | 'sold';

export type ItemCondition = 'New' | 'Like New' | 'Good' | 'Fair';

export type ProductCategory =
  | 'Books'
  | 'Gadgets and Tech'
  | 'Daily Gear'
  | 'Dorm Essentials'
  | 'Other';

export interface Product {
  id: string;
  title: string;
  category: ProductCategory;
  description?: string;
  price: number;
  originalPrice?: number;
  condition?: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  sellerUSN: string;
  sellerBranch: string;
  sellerAdmissionYear: number;
  sellerCurrentYear: string;
  sellerAvatar: string;
  status: ListingStatus;
  handoverLocation: string;
  contactPreference?: string;
  isNegotiable?: boolean;
  postedDate: string;
  updatedDate: string;
  rejectionReason?: string;
  adminNotes?: string;
  viewsCount?: number;
  likesCount?: number;
  featured?: boolean;
  seniorPick?: boolean;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  usn: string;
  branch: string;
  admissionYear: number;
  currentYear: string;
  avatar: string;
  role: 'student' | 'admin';
  verified: boolean;
  status: 'active' | 'suspended';
  phone?: string;
  bio?: string;
  notificationsEnabled?: boolean;
  emailWantedAlerts?: boolean;
}

export interface WantedResponse {
  id: string;
  responderId: string;
  responderName: string;
  responderUSN: string;
  responderBranch: string;
  message: string;
  offeredProductId?: string;
  proposedPrice: number;
  createdAt: string;
}

export interface WantedRequest {
  id: string;
  title: string;
  category: ProductCategory;
  description: string;
  minBudget?: number;
  maxBudget?: number;
  preferredCondition?: string;
  referenceImage?: string;
  studentId: string;
  studentName: string;
  studentUSN: string;
  studentBranch: string;
  studentAdmissionYear: number;
  status?: 'open' | 'responses_received' | 'fulfilled' | 'expired';
  responses: WantedResponse[];
  expiryDate?: string;
  preferredContact?: string;
  postedDate: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOffer?: boolean;
  offerAmount?: number;
}

export interface ChatParticipant {
  id: string;
  name: string;
  usn: string;
  branch: string;
  avatar: string;
}

export interface ChatConversation {
  id: string;
  participantIds: string[]; // Strict list of student IDs who are part of this private chat
  participants?: ChatParticipant[]; // Full participant profiles
  productId?: string;
  productTitle?: string;
  productPrice?: number;
  productImage?: string;
  productStatus?: ListingStatus;
  handoverLocation?: string;
  otherParticipant?: ChatParticipant; // backwards compatibility
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'approval' | 'rejection' | 'chat' | 'offer' | 'wanted' | 'system';
  read: boolean;
  timestamp: string;
  link?: string;
  productId?: string;
}

export interface ModerationReport {
  id: string;
  targetType: 'product' | 'user';
  targetId: string;
  targetTitle: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  details: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  timestamp: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  description: string;
  landmark: string;
  bestHours: string;
  safetyTip: string;
  recommendedFor: string;
  iconName: string;
}

export interface AdminLog {
  id: string;
  adminName: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}
