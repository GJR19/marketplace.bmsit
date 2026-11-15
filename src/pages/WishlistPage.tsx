import React from 'react';
import { Heart, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { ProductCard } from '../components/product/ProductCard';

interface WishlistPageProps {
  onOpenDetails: (product: Product) => void;
  onBrowseMarketplace: () => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  onOpenDetails,
  onBrowseMarketplace,
}) => {
  const { products, wishlist } = useApp();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#FFF9E6] rounded-3xl border-3 border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="nb-sticker text-xs bg-[#FFE082] flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-[#E1467A] text-[#E1467A]" />
              <span>SAVED ITEMS</span>
            </span>
            <span className="text-xs font-mono font-bold text-neutral-600">
              {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <h1 className="font-head text-2xl sm:text-3xl font-extrabold text-[#1C1C1C]">
            Your Saved Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-neutral-700 max-w-xl">
            Keep track of VTU textbooks, electronics, calculators, and dorm essentials before negotiating with peers.
          </p>
        </div>

        <button
          onClick={onBrowseMarketplace}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] font-bold text-xs sm:text-sm text-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] hover:bg-[#e49b2f] transition flex items-center gap-2 cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 text-[#1C1C1C]" />
          <span>Browse Marketplace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid or Empty State */}
      {wishlistedProducts.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
            <span>
              Showing <span className="font-bold text-[#1C1C1C]">{wishlistedProducts.length}</span> saved listings
            </span>
            <span className="text-[11px] font-mono text-neutral-500">
              Click heart on card to remove anytime
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {wishlistedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpenDetails={onOpenDetails}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border-3 border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] space-y-4 max-w-xl mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF9E6] border-2 border-[#1C1C1C] flex items-center justify-center mx-auto shadow-[3px_3px_0px_#1C1C1C]">
            <Heart className="w-8 h-8 text-[#E1467A]" />
          </div>

          <div className="space-y-1">
            <h3 className="font-head font-extrabold text-xl text-[#1C1C1C]">
              Your wishlist is completely empty
            </h3>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
              Found a textbook or calculator you like? Tap the heart icon on any listing card across BMSIT Marketplace to save it here for fast access.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onBrowseMarketplace}
              className="px-6 py-2.5 rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] font-bold text-xs sm:text-sm text-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] hover:bg-[#e49b2f] transition inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Marketplace Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
