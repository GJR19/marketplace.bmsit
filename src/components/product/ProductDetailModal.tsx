import React, { useState } from 'react';
import {
  X,
  Heart,
  MessageCircle,
  Tag,
  ShieldCheck,
  MapPin,
  Calendar,
  AlertTriangle,
  Share2,
  CheckCircle2,
  Check,
  Flag,
  ArrowRight,
  Send,
  HelpCircle,
} from 'lucide-react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatPriceINR } from '../../utils/usnParser';
import { normalizeCampusLocation } from '../../data/mockData';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChatWithSeller: (product: Product, message?: string) => void;
  onOpenProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onOpenChatWithSeller,
  onOpenProduct,
}) => {
  const {
    products,
    toggleWishlist,
    isWishlisted,
    currentUser,
    pushToast,
    submitReport,
  } = useApp();

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Prohibited or Dangerous Item');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  if (!isOpen || !product) return null;

  const wishlisted = isWishlisted(product.id);
  const isSold = product.status === 'sold';
  const isOwner = currentUser.id === product.sellerId;

  const similarProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category && p.status === 'approved')
    .slice(0, 3);

  const sellerOtherListings = products
    .filter((p) => p.id !== product.id && p.sellerId === product.sellerId)
    .slice(0, 3);

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/?product=${product.id}`;
    let success = false;

    // 1. Try modern async clipboard API
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        success = true;
      } catch (err) {
        console.warn('Async clipboard write failed, trying fallback execCommand', err);
      }
    }

    // 2. Reliable cross-browser fallback
    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.setAttribute('readonly', '');
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('Fallback execCommand failed', err);
      }
    }

    if (success) {
      setCopied(true);
      pushToast('Product link copied to clipboard! 📋', 'success');
      setTimeout(() => setCopied(false), 2500);
    } else {
      window.prompt('Copy product link:', shareUrl);
      pushToast('Product link ready to copy! 📋', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/55 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#FFFBF5] rounded-3xl border-3 border-[#1C1C1C] shadow-[7px_7px_0px_#1C1C1C] my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar */}
        <div className="sticky top-0 z-30 bg-[#FFFBEA] border-b-2 border-[#1C1C1C] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="nb-sticker text-xs bg-[#FFE082]">
              {product.category}
            </span>
            {isSold && (
              <span className="nb-sticker rose text-xs">
                SOLD ON CAMPUS
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title={copied ? "Link Copied!" : "Share listing"}
              className={`p-1.5 rounded-full border border-[#1C1C1C] transition shadow-[1.5px_1.5px_0px_#1C1C1C] flex items-center justify-center ${
                copied ? 'bg-emerald-300 text-emerald-900' : 'bg-white hover:bg-[#FFF9E6] text-[#1C1C1C]'
              }`}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-900" /> : <Share2 className="w-4 h-4 text-[#1C1C1C]" />}
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              title={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`p-1.5 rounded-full border border-[#1C1C1C] transition shadow-[1.5px_1.5px_0px_#1C1C1C] ${
                wishlisted ? 'bg-[#E1467A] text-white' : 'bg-white text-[#1C1C1C] hover:bg-[#FFF9E6]'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full border border-[#1C1C1C] bg-[#FFF9E6] hover:bg-[#F2A93B] transition shadow-[1.5px_1.5px_0px_#1C1C1C]"
            >
              <X className="w-5 h-5 text-[#1C1C1C]" />
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-5 md:p-8 max-h-[82vh] overflow-y-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
            {/* Left Column: Image Gallery */}
            <div className="md:col-span-6 space-y-3">
              {/* Main Image Frame */}
              <div className="relative aspect-4/3 rounded-2xl border-2 border-[#1C1C1C] bg-white overflow-hidden shadow-[4px_4px_0px_#1C1C1C]">
                <img
                  src={product.images[activeImageIdx] || product.images[0]}
                  alt={product.title}
                  className={`w-full h-full object-cover ${isSold ? 'grayscale-40' : ''}`}
                />

                {isSold && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-[#E1467A] text-white font-head font-extrabold text-lg px-6 py-2 border-2 border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] rotate-[-6deg]">
                      SOLD ON CAMPUS
                    </div>
                  </div>
                )}

                <div className="absolute bottom-3 left-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg border border-[#1C1C1C] bg-[#FFF9E6] text-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C]">
                    Condition: {product.condition}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition ${
                        activeImageIdx === idx
                          ? 'border-[#1C1C1C] ring-2 ring-[#F2A93B] shadow-[2px_2px_0px_#1C1C1C]'
                          : 'border-[#1C1C1C]/30 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Safe Campus Exchange Point Banner */}
              <div className="p-3.5 bg-[#FFF9E6] rounded-xl border-2 border-[#1C1C1C] shadow-[2.5px_2.5px_0px_#1C1C1C] space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1C1C]">
                  <MapPin className="w-4 h-4 text-[#F2A93B]" />
                  <span>Preferred Exchange Spot:</span>
                </div>
                <div className="font-semibold text-xs text-[#1C1C1C]">
                  {normalizeCampusLocation(product.handoverLocation)}
                </div>
                <p className="text-[11px] text-neutral-600 leading-tight">
                  Always inspect goods in person in broad daylight. Do not send online advance payments.
                </p>
              </div>
            </div>

            {/* Right Column: Details & Actions */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                {/* Title */}
                <h1 className="font-head text-2xl md:text-3xl font-extrabold text-[#1C1C1C] leading-tight">
                  {product.title}
                </h1>

                {/* Price Display */}
                <div className="p-4 bg-white rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block">
                      Campus Asking Price
                    </span>
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-head font-extrabold text-2xl sm:text-3xl text-[#1C1C1C]">
                        {formatPriceINR(product.price)}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="font-accent italic text-base text-[#E1467A] line-through">
                          {formatPriceINR(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {discountPercent && discountPercent > 0 && (
                    <span className="nb-sticker rose text-xs py-1 px-2.5">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                {/* Description (if present) */}
                {product.description && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Item Description
                    </h3>
                    <p className="text-xs sm:text-sm text-[#1C1C1C] leading-relaxed whitespace-pre-line bg-[#FFFBEA] p-3.5 rounded-xl border border-[#1C1C1C]/20">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Metadata Pills */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-[#1C1C1C]/30 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#F2A93B]" />
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Posted Date</span>
                      <span className="font-semibold">{product.postedDate}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-[#1C1C1C]/30 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Contact</span>
                      <span className="font-semibold">In-app Chat Only</span>
                    </div>
                  </div>
                </div>

                {/* Seller Profile Card (With USN, Branch, Admission Year, Derived Current Year) */}
                <div className="p-4 bg-[#FFF9E6] rounded-2xl border-2 border-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 mb-2 flex items-center justify-between">
                    <span>Verified Seller Profile</span>
                    <span className="flex items-center gap-1 text-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>@bmsit.in Verified</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={product.sellerAvatar}
                      alt={product.sellerName}
                      className="w-12 h-12 rounded-full border-2 border-[#1C1C1C] object-cover shadow-[1.5px_1.5px_0px_#1C1C1C]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-head font-bold text-base text-[#1C1C1C] leading-snug">
                        {product.sellerName}
                      </div>
                      <div className="text-xs font-mono font-semibold text-neutral-700">
                        USN: {product.sellerUSN}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Contact Seller & Make Offer */}
              <div className="space-y-2 pt-2">
                {isSold ? (
                  <div className="p-3 bg-neutral-100 rounded-xl border-2 border-neutral-400 text-center text-xs font-bold text-neutral-600">
                    This item has been sold. Inquiries and offers are disabled.
                  </div>
                ) : isOwner ? (
                  <div className="p-3 bg-[#FFF1D9] rounded-xl border-2 border-[#1C1C1C] text-center text-xs font-bold text-[#1C1C1C]">
                    This is your active listing. Manage it from your Student Dashboard.
                  </div>
                ) : (
                    <button
                      onClick={() => onOpenChatWithSeller(product)}
                      className="w-full py-3 px-4 rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] text-[#1C1C1C] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[3px_3px_0px_#1C1C1C] hover:bg-[#e49b2f] active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Contact / Chat with Seller</span>
                    </button>
                )}

                <div className="flex items-center justify-between pt-1">
                  {!isOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setReportSubmitted(false);
                        setReportModalOpen(true);
                      }}
                      className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 font-semibold transition cursor-pointer"
                    >
                      <Flag className="w-3.5 h-3.5 text-rose-500" />
                      <span>Report listing</span>
                    </button>
                  )}
                  <div className="text-[11px] text-neutral-500 font-mono ml-auto">
                    ID: {product.id}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seller's Other Listings */}
          {sellerOtherListings.length > 0 && (
            <div className="pt-6 border-t-2 border-dashed border-[#1C1C1C]/20">
              <h3 className="font-head text-base font-bold text-[#1C1C1C] mb-3">
                Other items by {product.sellerName.split(' ')[0]}:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sellerOtherListings.map((other) => (
                  <div
                    key={other.id}
                    onClick={() => onOpenProduct(other)}
                    className="p-3 bg-white rounded-xl border-1.5 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] cursor-pointer hover:bg-[#FFF9E6] transition flex items-center gap-3"
                  >
                    <img
                      src={other.images[0]}
                      alt={other.title}
                      className="w-12 h-12 rounded-lg object-cover border border-[#1C1C1C]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs truncate text-[#1C1C1C]">
                        {other.title}
                      </div>
                      <div className="font-head font-bold text-xs text-[#F2A93B]">
                        {formatPriceINR(other.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <div className="pt-4 border-t-2 border-dashed border-[#1C1C1C]/20">
              <h3 className="font-head text-base font-bold text-[#1C1C1C] mb-3">
                Similar items in {product.category}:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {similarProducts.map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => onOpenProduct(sim)}
                    className="p-3 bg-[#FFFBEA] rounded-xl border-1.5 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] cursor-pointer hover:bg-[#FFF1D9] transition flex items-center gap-3"
                  >
                    <img
                      src={sim.images[0]}
                      alt={sim.title}
                      className="w-12 h-12 rounded-lg object-cover border border-[#1C1C1C]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs truncate text-[#1C1C1C]">
                        {sim.title}
                      </div>
                      <div className="font-head font-bold text-xs text-[#1C1C1C]">
                        {formatPriceINR(sim.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Moderation Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FFFBF5] rounded-3xl border-3 border-[#1C1C1C] shadow-[6px_6px_0px_#1C1C1C] max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1C1C1C]/15">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-100 rounded-xl border-2 border-[#1C1C1C] text-rose-600">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-head font-extrabold text-lg text-[#1C1C1C]">Report Listing</h3>
                  <p className="text-[11px] text-neutral-500 truncate max-w-[220px]">{product.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="p-1.5 rounded-lg border-2 border-[#1C1C1C] bg-white hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4 text-[#1C1C1C]" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-head font-bold text-base text-emerald-900">Report Received</h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Thank you for keeping BMSIT safe. Our moderators and admin have been immediately notified via email.
                </p>
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="mt-3 px-4 py-2 rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] font-bold text-xs shadow-[2px_2px_0px_#1C1C1C] hover:bg-[#e49b2f] cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitReport({
                    targetType: 'product',
                    targetId: product.id,
                    targetTitle: product.title,
                    reporterId: currentUser.id,
                    reporterName: currentUser.name,
                    reason: reportReason,
                    details: reportDetails,
                  });
                  setReportSubmitted(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold text-[#1C1C1C] mb-1.5">
                    Why are you reporting this listing?
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-[#1C1C1C] bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                  >
                    <option value="Prohibited or Dangerous Item">Prohibited or Dangerous Item</option>
                    <option value="Scam, Fraud or Counterfeit">Scam, Fraud or Counterfeit</option>
                    <option value="Inappropriate Content or Photos">Inappropriate Content or Photos</option>
                    <option value="Overpriced / Scalping / Commercial Sale">Overpriced / Scalping / Commercial Sale</option>
                    <option value="Misleading Information or Wrong Category">Misleading Information or Wrong Category</option>
                    <option value="Other Policy Violation">Other Policy Violation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1C1C] mb-1.5">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Describe what's wrong with this listing..."
                    className="w-full p-3 rounded-xl border-2 border-[#1C1C1C] bg-white text-xs placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#F2A93B] resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border-2 border-[#1C1C1C] bg-white font-bold text-xs hover:bg-neutral-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl border-2 border-[#1C1C1C] bg-rose-600 text-white font-bold text-xs shadow-[3px_3px_0px_#1C1C1C] hover:bg-rose-700 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
