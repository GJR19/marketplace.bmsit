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

export const GUEST_STUDENT: Student = {
  id: 'guest',
  name: 'Campus Student',
  email: '',
  usn: '',
  branch: 'BMSIT',
  admissionYear: 2024,
  currentYear: '1st Year',
  role: 'student',
  verified: false,
  status: 'active',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=bmsit_guest',
};

export const INITIAL_STUDENTS: Student[] = [];

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  {
    id: 'loc-1',
    name: 'Kaapi Kuteera',
    description: '',
    landmark: 'Kaapi Kuteera',
    bestHours: '',
    safetyTip: '',
    recommendedFor: '',
    iconName: 'Coffee',
  },
  {
    id: 'loc-2',
    name: 'Main Gate',
    description: '',
    landmark: 'Main Gate',
    bestHours: '',
    safetyTip: '',
    recommendedFor: '',
    iconName: 'MapPin',
  },
  {
    id: 'loc-3',
    name: 'Library',
    description: '',
    landmark: 'Central Library',
    bestHours: '',
    safetyTip: '',
    recommendedFor: '',
    iconName: 'BookOpen',
  },
  {
    id: 'loc-4',
    name: 'Food Court',
    description: '',
    landmark: 'Food Court',
    bestHours: '',
    safetyTip: '',
    recommendedFor: '',
    iconName: 'Utensils',
  },
  {
    id: 'loc-5',
    name: 'Academic Block',
    description: '',
    landmark: 'Academic Block',
    bestHours: '',
    safetyTip: '',
    recommendedFor: '',
    iconName: 'Building2',
  },
  {
    id: 'loc-6',
    name: 'Ground',
    description: '',
    landmark: 'College Ground',
    bestHours: '',
    safetyTip: '',
    recommendedFor: '',
    iconName: 'Trophy',
  },
  {
    id: 'loc-7',
    name: 'Boys Hostel',
    description: '',
    landmark: 'Boys Hostel',
    bestHours: '',
    safetyTip: '',
    recommendedFor: '',
    iconName: 'Home',
  },
];

export const normalizeCampusLocation = (location?: string): string => {
  if (!location) return 'Kaapi Kuteera';
  const loc = location.toLowerCase().trim();
  if (loc.includes('kaapi')) return 'Kaapi Kuteera';
  if (
    loc.includes('canteen') ||
    loc.includes('food court') ||
    (loc.includes('court') && !loc.includes('basketball') && !loc.includes('sports'))
  )
    return 'Food Court';
  if (loc.includes('library')) return 'Library';
  if (loc.includes('academic') || loc.includes('lobby')) return 'Academic Block';
  if (loc.includes('gate')) return 'Main Gate';
  if (
    loc.includes('ground') ||
    loc.includes('arena') ||
    loc.includes('sports') ||
    loc.includes('basketball')
  )
    return 'Ground';
  if (loc.includes('hostel')) return 'Boys Hostel';

  const match = CAMPUS_LOCATIONS.find((c) => c.name.toLowerCase() === loc);
  if (match) return match.name;

  return 'Kaapi Kuteera';
};

export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_WANTED_REQUESTS: WantedRequest[] = [];
export const INITIAL_CHATS: ChatConversation[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];
export const INITIAL_REPORTS: ModerationReport[] = [];
export const INITIAL_ADMIN_LOGS: AdminLog[] = [];
