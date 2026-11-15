import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  Camera,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCategory, Product, CampusLocation } from '../types';

interface SellItemPageProps {
  onSuccessRedirect: () => void;
  onCancel: () => void;
}

export const SellItemPage: React.FC<SellItemPageProps> = ({
  onSuccessRedirect,
  onCancel,
}) => {
  const { currentUser, addProduct, campusLocations, pushToast } = useApp();

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Books');
  const [price, setPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [images, setImages] = useState<string[]>([]);
  const [handoverLocation, setHandoverLocation] = useState(
    campusLocations[0]?.name || 'Kaapi Kuteera'
  );

  // Submission success dialog
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [submittedProduct, setSubmittedProduct] = useState<Product | null>(null);

  const categories: ProductCategory[] = [
    'Books',
    'Gadgets and Tech',
    'Daily Gear',
    'Dorm Essentials',
    'Other',
  ];

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (images.length >= 3) {
      pushToast('Maximum 3 photos allowed per listing.', 'warning');
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setImages([...images, localUrl]);
      pushToast('Photo uploaded from device preview.', 'success');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentUser.status === 'suspended') {
      pushToast('Your account is currently suspended. You cannot post listings.', 'error');
      return;
    }

    if (!title.trim() || title.length < 3) {
      pushToast('Please enter a clear item title.', 'warning');
      return;
    }

    if (!price || Number(price) <= 0) {
      pushToast('Please enter a valid selling price in INR.', 'warning');
      return;
    }

    if (!originalPrice || Number(originalPrice) <= 0) {
      pushToast('Please enter the Original MRP in INR (required).', 'warning');
      return;
    }

    if (images.length === 0) {
      pushToast('Please upload at least one photo of your item.', 'warning');
      return;
    }

    const created = addProduct({
      title: title.trim(),
      category,
      price: Number(price),
      originalPrice: Number(originalPrice),
      images: images.slice(0, 3),
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerUSN: currentUser.usn,
      sellerBranch: currentUser.branch,
      sellerAdmissionYear: currentUser.admissionYear,
      sellerCurrentYear: currentUser.currentYear,
      sellerAvatar: currentUser.avatar,
      status: 'pending_approval',
      handoverLocation,
      contactPreference: 'In-app Chat',
      isNegotiable: false,
    });

    setSubmittedProduct(created);
    setIsSubmittedSuccess(true);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-2 sm:px-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b-2 border-[#1C1C1C]/15">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="nb-sticker text-xs bg-[#F2A93B]">
              ★ LIST AN ITEM
            </span>
            <span className="text-xs font-semibold text-neutral-600">
              Campus Exchange
            </span>
          </div>
          <h1 className="font-head text-3xl sm:text-4xl font-extrabold text-[#1C1C1C]">
            Sell an Item on Campus
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Direct peer-to-peer sale with verified BMSIT students. No middlemen, ₹0 fees.
          </p>
        </div>

        <button
          onClick={onCancel}
          className="self-start sm:self-auto px-4 py-2 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-white hover:bg-[#FFF9E6] transition shadow-[2px_2px_0px_#1C1C1C]"
        >
          Cancel & Return
        </button>
      </div>

      {/* Main Form: Occupies the Page Cleanly */}
      <div className="bg-[#FFFBEA] rounded-3xl border-3 border-[#1C1C1C] shadow-[6px_6px_0px_#1C1C1C] p-6 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* 1. Basic Info */}
          <div className="space-y-4">
            <h3 className="font-head text-base sm:text-lg font-bold text-[#1C1C1C] flex items-center gap-2 pb-2 border-b border-[#1C1C1C]/15">
              <span className="w-6 h-6 rounded-full bg-[#F2A93B] border border-[#1C1C1C] text-xs font-extrabold flex items-center justify-center">
                1
              </span>
              <span>Item Details</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#1C1C1C] mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Casio fx-991CW Scientific Calculator, Btwin 26T Cycle..."
                className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2.5px_2.5px_0px_#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1C1C] mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full p-3 text-xs sm:text-sm rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2.5px_2.5px_0px_#1C1C1C] focus:outline-none font-medium"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Pricing */}
          <div className="space-y-4 pt-2">
            <h3 className="font-head text-base sm:text-lg font-bold text-[#1C1C1C] flex items-center gap-2 pb-2 border-b border-[#1C1C1C]/15">
              <span className="w-6 h-6 rounded-full bg-[#F2A93B] border border-[#1C1C1C] text-xs font-extrabold flex items-center justify-center">
                2
              </span>
              <span>Pricing</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1C1C1C] mb-1.5">
                  Selling Price (₹ INR) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 1100"
                  className="w-full p-3 text-xs sm:text-sm font-bold rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2.5px_2.5px_0px_#1C1C1C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1C1C] mb-1.5">
                  Original MRP (₹ INR) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 1595"
                  className="w-full p-3 text-xs sm:text-sm rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2.5px_2.5px_0px_#1C1C1C] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Product Photos (Maximum 3) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#1C1C1C]/15">
              <h3 className="font-head text-base sm:text-lg font-bold text-[#1C1C1C] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F2A93B] border border-[#1C1C1C] text-xs font-extrabold flex items-center justify-center">
                  3
                </span>
                <span>Product Photos *</span>
              </h3>
              <span className="text-xs font-bold text-[#1C1C1C] bg-[#FFE082] px-2.5 py-1 rounded-md border border-[#1C1C1C]">
                Max 3 Photos ({images.length}/3)
              </span>
            </div>

            {images.length < 3 ? (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-2 border-dashed border-[#1C1C1C] bg-white text-xs sm:text-sm font-bold text-[#1C1C1C] flex items-center justify-center gap-2.5 cursor-pointer hover:bg-[#FFF9E6] transition shadow-[2.5px_2.5px_0px_#1C1C1C]">
                  <Camera className="w-5 h-5 text-[#F2A93B]" />
                  <span>Upload Product Photo from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSimulatedFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-neutral-600 font-medium">
                  Direct photo upload required. No image URLs.
                </span>
              </div>
            ) : (
              <p className="text-xs text-neutral-600 italic bg-white p-3 rounded-xl border border-[#1C1C1C]/20">
                Maximum 3 photos reached. Remove an existing photo below to upload a different one.
              </p>
            )}

            {/* Thumbnail preview row */}
            <div className="flex flex-wrap gap-3 pt-1">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-24 h-24 rounded-xl border-2 border-[#1C1C1C] overflow-hidden shadow-[3px_3px_0px_#1C1C1C] group"
                >
                  <img src={img} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-[#E1467A] text-white hover:bg-[#c93b6a] transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Campus Handover & Communication */}
          <div className="space-y-4 pt-2">
            <h3 className="font-head text-base sm:text-lg font-bold text-[#1C1C1C] flex items-center gap-2 pb-2 border-b border-[#1C1C1C]/15">
              <span className="w-6 h-6 rounded-full bg-[#F2A93B] border border-[#1C1C1C] text-xs font-extrabold flex items-center justify-center">
                4
              </span>
              <span>Campus Exchange & Communication</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#1C1C1C] mb-1.5">
                Preferred Campus Exchange Spot *
              </label>
              <select
                value={handoverLocation}
                onChange={(e) => setHandoverLocation(e.target.value)}
                className="w-full p-3 text-xs sm:text-sm rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2.5px_2.5px_0px_#1C1C1C] focus:outline-none font-medium"
              >
                {campusLocations.map((loc: CampusLocation) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* In-app chat callout */}
            <div className="p-3.5 bg-white rounded-xl border-2 border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C] flex items-center gap-3 text-xs">
              <div className="w-8 h-8 rounded-lg bg-[#F2A93B] border border-[#1C1C1C] flex items-center justify-center font-bold text-sm shrink-0">
                💬
              </div>
              <div>
                <span className="font-bold text-[#1C1C1C] block">Direct In-App Chat Only</span>
                <span className="text-[11px] text-neutral-600">
                  Buyers contact you exclusively through in-app chat. Your phone and personal contacts stay 100% private.
                </span>
              </div>
            </div>
          </div>

          {/* Submission Notice */}
          <div className="p-3.5 bg-[#FFF1D9] rounded-xl border border-[#1C1C1C]/30 text-xs text-neutral-700 leading-relaxed flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F2A93B] shrink-0" />
            <span>
              Your listing will be submitted to the student moderator approval queue. You can inspect and approve it instantly in Demo Admin Mode!
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] font-head font-extrabold text-sm sm:text-base text-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] hover:bg-[#e49b2f] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#1C1C1C] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center gap-2"
          >
            <span>Submit Listing for Moderator Review</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* SUCCESS MODAL ON SUBMISSION */}
      {isSubmittedSuccess && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#FFFBF5] rounded-3xl border-3 border-[#1C1C1C] shadow-[7px_7px_0px_#1C1C1C] p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-[#FFE082] border-2 border-[#1C1C1C] flex items-center justify-center text-3xl mx-auto shadow-[3px_3px_0px_#1C1C1C]">
              🎉
            </div>

            <div>
              <span className="nb-sticker text-xs bg-[#F2A93B] mb-2">
                STATUS: PENDING APPROVAL
              </span>
              <h2 className="font-head text-2xl font-extrabold text-[#1C1C1C]">
                Listing Submitted for Review!
              </h2>
              <p className="text-xs sm:text-sm text-neutral-700 mt-2 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{currentUser.name}</strong>! Your listing for{' '}
                <span className="font-semibold text-[#1C1C1C]">"{submittedProduct?.title}"</span>{' '}
                has been submitted to the BMSIT moderator queue.
              </p>
            </div>

            <div className="p-4 bg-[#FFF9E6] rounded-2xl border-2 border-[#1C1C1C] text-left text-xs space-y-2 shadow-[2px_2px_0px_#1C1C1C]">
              <div className="flex items-center gap-2 font-bold text-[#1C1C1C]">
                <Clock className="w-4 h-4 text-[#F2A93B]" />
                <span>What happens next in this demo?</span>
              </div>
              <p className="text-neutral-700">
                1. Your listing is currently hidden from the public approved catalogue.<br />
                2. You can view its pending status under <strong>My Postings</strong> in your Student Dashboard.<br />
                3. You can toggle into <strong>Demo Admin Mode</strong> (in the navbar) to simulate approving or rejecting this listing!
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setIsSubmittedSuccess(false);
                  onSuccessRedirect();
                }}
                className="px-6 py-2.5 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] shadow-[2.5px_2.5px_0px_#1C1C1C] hover:bg-[#e49b2f] transition"
              >
                Go to My Postings →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
