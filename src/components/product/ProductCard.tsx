import React from 'react';
import { Heart, ArrowRight, MapPin, User, Calendar } from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatPriceINR } from '../../utils/usnParser';
import { normalizeCampusLocation } from '../../data/mockData';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  onOpenChat?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
}) => {
  const { toggleWishlist, isWishlisted, currentUser } = useApp();

  const isLoggedIn = currentUser.id !== 'guest' && Boolean(currentUser.email) && currentUser.verified;

  const isSold = product.status === 'sold';
  const isPending = product.status === 'pending_approval';
  const isRejected = product.status === 'rejected';

  const wishlisted = isWishlisted(product.id);

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border-2 border-[#1C1C1C] bg-white transition-all duration-200 overflow-hidden ${
        isSold
          ? 'opacity-85 shadow-[2px_2px_0px_#1C1C1C]'
          : 'shadow-[3.5px_3.5px_0px_#1C1C1C] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5.5px_5.5px_0px_#1C1C1C]'
      }`}
    >
      {/* Product Image Container */}
      <div className="relative aspect-4/3 w-full bg-[#FFFBF5] border-b-2 border-[#1C1C1C] overflow-hidden">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isSold ? 'grayscale-40 contrast-90' : 'group-hover:scale-103'
          }`}
          loading="lazy"
        />

        {/* Status Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isPending && (
            <span className="nb-sticker text-[10px] py-0.5 px-2 bg-[#F2A93B] shadow-[1.5px_1.5px_0px_#1C1C1C]">
              ⏳ Pending Approval
            </span>
          )}


          {isRejected && (
            <span className="nb-sticker rose text-[10px] py-0.5 px-2 shadow-[1.5px_1.5px_0px_#1C1C1C]">
              ⚠️ Rejected
            </span>
          )}
        </div>

        {/* SOLD BANNER */}
        {isSold && (
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px] flex items-center justify-center z-20">
            <div className="bg-[#E1467A] text-white font-head font-extrabold text-sm sm:text-base tracking-widest uppercase px-6 py-1.5 border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] rotate-[-7deg]">
              SOLD ON CAMPUS
            </div>
          </div>
        )}

        {/* Wishlist toggle - Only visible when signed in */}
        {isLoggedIn && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`p-1.5 rounded-lg border-1.5 border-[#1C1C1C] transition shadow-[1.5px_1.5px_0px_#1C1C1C] ${
                wishlisted
                  ? 'bg-[#E1467A] text-white'
                  : 'bg-white/90 text-[#1C1C1C] hover:bg-[#FFF9E6]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-white' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Card Body - Displays ONLY: Category, Posted Date, Product Title, Seller Name, USN, Campus Exchange Spot, Price */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-[#FFFBEA]">
        <div className="space-y-2">
          {/* Row 1: Category & Posted Date */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#1C1C1C] bg-[#FFE082] px-2 py-0.5 rounded-md border border-[#1C1C1C]/40 shadow-[1px_1px_0px_#1C1C1C]">
              {product.category}
            </span>
            <span className="font-mono text-[10px] text-neutral-600 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-neutral-400" />
              <span>{product.postedDate}</span>
            </span>
          </div>

          {/* Row 2: Product Title */}
          <h3
            onClick={() => onOpenDetails(product)}
            className="font-head font-extrabold text-sm sm:text-base text-[#1C1C1C] line-clamp-2 leading-snug cursor-pointer hover:text-[#E1467A] transition-colors pt-0.5"
          >
            {product.title}
          </h3>

          {/* Row 3: Seller Name & USN */}
          <div className="flex items-center justify-between gap-1.5 text-xs pt-1 border-t border-[#1C1C1C]/10">
            <div className="flex items-center gap-1.5 truncate">
              <User className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="font-bold text-[#1C1C1C] truncate">{product.sellerName}</span>
            </div>
            <span className="font-mono text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-[#1C1C1C]/30 text-[#1C1C1C] shrink-0">
              {product.sellerUSN}
            </span>
          </div>

          {/* Row 4: Campus Exchange Spot */}
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-700 bg-white/70 px-2 py-1 rounded-lg border border-[#1C1C1C]/15 truncate">
            <MapPin className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
            <span className="truncate font-medium">{normalizeCampusLocation(product.handoverLocation)}</span>
          </div>
        </div>

        {/* Card Footer: Price & View Button */}
        <div className="pt-3 mt-3 border-t border-[#1C1C1C]/15 flex items-center justify-between gap-2">
          {/* Price */}
          <div>
            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">Price</div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-head font-black text-lg text-[#1C1C1C] tracking-tight">
                {formatPriceINR(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > 0 && (
                <span className="font-mono text-xs sm:text-sm text-[#E1467A] line-through font-bold">
                  {formatPriceINR(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* View Button */}
          <button
            onClick={() => onOpenDetails(product)}
            disabled={isSold}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border-2 border-[#1C1C1C] flex items-center gap-1.5 transition shadow-[2px_2px_0px_#1C1C1C] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer ${
              isSold
                ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed border-neutral-400 shadow-none'
                : 'bg-white hover:bg-[#F2A93B] text-[#1C1C1C]'
            }`}
          >
            <span>{isSold ? 'Sold' : 'View'}</span>
            {!isSold && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
