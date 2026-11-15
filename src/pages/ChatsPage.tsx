import React from 'react';
import { MessageSquare, ShieldCheck } from 'lucide-react';
import { ChatWindow } from '../components/chat/ChatWindow';
import { Product } from '../types';

interface ChatsPageProps {
  onOpenProduct: (product: Product) => void;
  initialConversationId?: string;
  onExploreMarketplace?: () => void;
}

export const ChatsPage: React.FC<ChatsPageProps> = ({
  onOpenProduct,
  initialConversationId,
  onExploreMarketplace,
}) => {
  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#FFF9E6] rounded-3xl border-3 border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] p-5 sm:p-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="nb-sticker text-xs bg-[#FFE082] flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-[#1C1C1C]" />
              <span>DIRECT MESSAGES</span>
            </span>
            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Private @bmsit.in Chat</span>
            </span>
          </div>

          <h1 className="font-head text-2xl sm:text-3xl font-extrabold text-[#1C1C1C]">
            All Student Chats
          </h1>
          <p className="text-xs sm:text-sm text-neutral-700 max-w-2xl mt-0.5">
            Discuss item condition, send quick price offers, and agree on a daylight meetup at BMSIT exchange spots.
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div>
        <ChatWindow
          initialConversationId={initialConversationId}
          onOpenProduct={onOpenProduct}
          onExploreMarketplace={onExploreMarketplace}
        />
      </div>
    </div>
  );
};
