import React from 'react';

// Deterministic vibrant pastel palette adhering to BMSIT neo-brutalist theme
const AVATAR_BG_COLORS = [
  'bg-[#FFE082]', // BMSIT warm yellow
  'bg-[#F2A93B]', // Accent amber
  'bg-[#FFD1DC]', // Soft rose
  'bg-[#D1F4E0]', // Mint green
  'bg-[#D6E8FF]', // Sky blue
  'bg-[#EADBFF]', // Soft purple
  'bg-[#FFE5D0]', // Warm peach
  'bg-[#BEE3DB]', // Aqua
];

export function getAvatarBgColor(name: string = ''): string {
  if (!name) return 'bg-[#FFE082]';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_BG_COLORS.length;
  return AVATAR_BG_COLORS[index];
}

export function getInitialLetter(name: string = ''): string {
  const clean = name.trim();
  if (!clean) return 'B';
  return clean.charAt(0).toUpperCase();
}

interface UserAvatarProps {
  name?: string;
  className?: string;
  title?: string;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'Student',
  className = 'w-9 h-9 text-xs rounded-xl',
  title,
  onClick,
}) => {
  const initial = getInitialLetter(name);
  const bgColor = getAvatarBgColor(name);

  return (
    <div
      onClick={onClick}
      title={title || name}
      className={`border-2 border-[#1C1C1C] text-[#1C1C1C] font-head font-extrabold select-none flex items-center justify-center shrink-0 uppercase tracking-tight shadow-[1.5px_1.5px_0px_#1C1C1C] ${bgColor} ${className}`}
    >
      <span>{initial}</span>
    </div>
  );
};
