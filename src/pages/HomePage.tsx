import React from 'react';
import {
  ArrowRight,
  PlusCircle,
  Camera,
  MessageSquare,
  MapPin,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, ProductCategory } from '../types';
import { CampusHandoverGuide } from '../components/common/CampusHandoverGuide';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
  onOpenDetails: (product: Product) => void;
  onSelectCategoryFilter: (category: ProductCategory | 'All') => void;
  onOpenSellModal: () => void;
  onOpenAuth?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setActiveTab,
  onSelectCategoryFilter,
  onOpenSellModal,
  onOpenAuth,
}) => {
  const { products } = useApp();

  // 4 Photographic Core Categories matching User Reference Image 4
  const categoriesList: {
    categoryKey: ProductCategory;
    label: string;
    subtitle: string;
    image: string;
    count: number;
  }[] = [
    {
      categoryKey: 'Books',
      label: 'Textbooks & Notes',
      subtitle: 'VTU Textbooks, Lab Manuals & Notes',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      count: products.filter((p: Product) => p.category === 'Books' && p.status === 'approved').length,
    },
    {
      categoryKey: 'Daily Gear',
      label: 'Cycles & Commute',
      subtitle: 'Backpacks, Cycles, Skateboards & Gear',
      image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
      count: products.filter((p: Product) => p.category === 'Daily Gear' && p.status === 'approved').length,
    },
    {
      categoryKey: 'Gadgets and Tech',
      label: 'Gadgets & Tech',
      subtitle: 'Casio Calculators, Laptops & Earphones',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
      count: products.filter((p: Product) => p.category === 'Gadgets and Tech' && p.status === 'approved').length,
    },
    {
      categoryKey: 'Dorm Essentials',
      label: 'Dorm Essentials',
      subtitle: 'Electric Kettles, Chairs, Mattresses & Storage',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      count: products.filter((p: Product) => p.category === 'Dorm Essentials' && p.status === 'approved').length,
    },
  ];

  const handleCategoryClick = (category: ProductCategory) => {
    onSelectCategoryFilter(category);
    setActiveTab('marketplace');
  };

  return (
    <div className="space-y-16 md:space-y-24 w-full">
      {/* ─── 1. HERO SECTION: DIRECT 3-LINE HEADLINE (MATCHING IMAGE 1) + BMSIT ARTWORK ─── */}
      <section className="pt-2 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Bold, Direct, Crystal-Clear Value Prop */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Prominent Verification Badge: EXCLUSIVELY FOR @BMSIT.IN STUDENTS */}
            <div className="flex items-center">
              <span className="text-sm sm:text-base font-head font-extrabold bg-[#FFE082] text-[#1C1C1C] px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border-2.5 border-[#1C1C1C] shadow-[3.5px_3.5px_0px_#1C1C1C] tracking-wide inline-flex items-center gap-1.5">
                ★ EXCLUSIVELY FOR @BMSIT.IN STUDENTS
              </span>
            </div>

            {/* Direct 3-Line Headline matching Image 1 */}
            <div className="space-y-1">
              <h1 className="font-head text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.04]">
                <span className="block text-[#2563EB]">Buy from students.</span>
                <span className="block text-[#F97316]">Sell to students.</span>
                <span className="block text-[#1C1C1C]">All inside campus.</span>
              </h1>
              <p className="font-accent italic text-base sm:text-xl text-[#1C1C1C]/80 pt-1">
                "Your College, Your Marketplace."
              </p>
            </div>

            {/* Clean, direct 1-liner */}
            <p className="text-sm sm:text-base text-[#1C1C1C] leading-relaxed max-w-2xl font-bold">
              The student-only peer exchange for BMSIT. Trade VTU textbooks, Casio scientific calculators, campus cycles, and dorm essentials with verified @bmsit.in peers. Zero delivery delay, ₹0 commission fees.
            </p>

            {/* Action Buttons: GET STARTED - IT'S FREE! (Takes to Login Modal) */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-8 py-4 sm:py-4.5 rounded-full border-3 border-[#1C1C1C] bg-[#F2A93B] hover:bg-[#e49b2f] font-head font-extrabold text-base sm:text-lg text-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#1C1C1C] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center gap-2.5 cursor-pointer"
              >
                <span>GET STARTED - IT'S FREE!</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectCategoryFilter('All');
                  setActiveTab('marketplace');
                }}
                className="px-7 py-4 rounded-full border-2.5 border-[#1C1C1C] bg-white font-head font-extrabold text-sm sm:text-base text-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] hover:bg-[#FFF9E6] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#1C1C1C] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center gap-2"
              >
                <span>Explore Marketplace</span>
              </button>

              <button
                type="button"
                onClick={onOpenSellModal}
                className="px-7 py-4 rounded-full border-2.5 border-[#1C1C1C] bg-white font-head font-extrabold text-sm sm:text-base text-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] hover:bg-[#FFF9E6] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_#1C1C1C] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#F2A93B]" />
                <span>Sell an Item</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('wanted')}
                className="px-6 py-4 rounded-full border-2.5 border-[#1C1C1C] bg-white font-bold text-sm text-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] hover:bg-[#FFF9E6] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#1C1C1C] active:translate-x-0.5 active:translate-y-0.5 transition"
              >
                Wanted Board →
              </button>
            </div>
          </div>

          {/* Right Column: Custom Illustration Artwork */}
          <div className="lg:col-span-5">
            <div className="relative p-3.5 sm:p-5 bg-[#FFFBEA] rounded-3xl border-3 border-[#1C1C1C] shadow-[8px_8px_0px_#1C1C1C] group">
              <div className="overflow-hidden rounded-2xl border-2 border-[#1C1C1C] bg-white">
                <img
                  src="/hero-illustration.jpg"
                  alt="BMSIT Campus Marketplace - Buy & Sell"
                  className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>

              {/* Bottom Quick Verification Badge */}
              <div className="pt-3 pb-1 text-center flex items-center justify-center gap-2">
                <span className="nb-sticker text-xs bg-[#FFE082] shadow-[1.5px_1.5px_0px_#1C1C1C]">
                  🎓 @BMSIT.IN ONLY
                </span>
                <span className="text-xs font-semibold text-neutral-800">
                  Direct student-to-student exchange
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. CONTINUOUS SLIDING TICKER (COVERS ENTIRE WIDTH OF SITE, INCREASED HEIGHT & TEXT) ─── */}
      <div className="w-screen relative left-1/2 -translate-x-1/2 overflow-hidden border-y-3 border-[#1C1C1C] bg-[#FFF9E6] py-5 sm:py-6 shadow-[3px_3px_0px_#1C1C1C]">
        <div className="animate-marquee flex items-center gap-10 text-sm sm:text-base md:text-lg font-black text-[#1C1C1C] tracking-wider whitespace-nowrap select-none hover:[animation-play-state:paused]">
          <span className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#F97316] border border-[#1C1C1C]" /> ZERO COMMISSION (₹0 FEES)
          </span>
          <span className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#F97316] border border-[#1C1C1C]" /> CAMPUS-VERIFIED USERS (@BMSIT.IN)
          </span>
          <span className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#F97316] border border-[#1C1C1C]" /> SAFER ON-CAMPUS MEETUPS
          </span>
          <span className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#F97316] border border-[#1C1C1C]" /> EQUAL FOCUS: BUYERS + SELLERS
          </span>
          <span className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#F97316] border border-[#1C1C1C]" /> EXCLUSIVELY FOR BMSIT STUDENTS
          </span>
          <span className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#F97316] border border-[#1C1C1C]" /> DIRECT EXCHANGES BETWEEN CLASSES
          </span>
          <span className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#F97316] border border-[#1C1C1C]" /> KAAPI KUTEERA • FOOD COURT • LIBRARY
          </span>

          {/* Duplicate set for seamless continuous marquee loop */}
          <span className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#F97316] border border-[#1C1C1C]" /> ZERO COMMISSION (₹0 FEES)
          </span>
          <span className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#F97316] border border-[#1C1C1C]" /> CAMPUS-VERIFIED USERS (@BMSIT.IN)
          </span>
          <span className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#F97316] border border-[#1C1C1C]" /> SAFER ON-CAMPUS MEETUPS
          </span>
          <span className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#F97316] border border-[#1C1C1C]" /> EQUAL FOCUS: BUYERS + SELLERS
          </span>
          <span className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#F97316] border border-[#1C1C1C]" /> EXCLUSIVELY FOR BMSIT STUDENTS
          </span>
          <span className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#F97316] border border-[#1C1C1C]" /> DIRECT EXCHANGES BETWEEN CLASSES
          </span>
          <span className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#F97316] border border-[#1C1C1C]" /> KAAPI KUTEERA • FOOD COURT • LIBRARY
          </span>
        </div>
      </div>

      {/* ─── 3. HOW IT WORKS: "One journey. Two wins." (HIGH CONTRAST / BRIGHT HARMONIOUS PALETTE) ─── */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#2563EB] block">
            HOW IT WORKS
          </span>
          <h2 className="font-head text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1C1C1C] tracking-tight">
            One journey. Two wins.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-700 font-medium">
            Seniors clear unused gear, freshers get affordable supplies — all within BMSIT.
          </p>
        </div>

        {/* 3 Bright, High-Contrast Neo-Brutalist Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* Step 01: List in seconds (Warm Bright Cream) */}
          <div className="relative p-7 sm:p-8 bg-[#FFFBEA] rounded-3xl border-3 border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] flex flex-col justify-between overflow-hidden group hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#1C1C1C] transition-all">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-[#FFE082] border-2 border-[#1C1C1C] flex items-center justify-center text-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C]">
                <Camera className="w-7 h-7" />
              </div>
              <span className="font-head font-black text-5xl sm:text-6xl text-[#1C1C1C]/25 select-none">
                01
              </span>
            </div>

            <div className="mt-8">
              <h3 className="font-head font-extrabold text-2xl text-[#1C1C1C] mb-2.5">
                List in seconds
              </h3>
              <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
                Snap a photo, set your price, and post your item in under 30 seconds.
              </p>
            </div>
          </div>

          {/* Step 02: Connect securely (Sunny Amber-Cream) */}
          <div className="relative p-7 sm:p-8 bg-[#FFF3DA] rounded-3xl border-3 border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] flex flex-col justify-between overflow-hidden group hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#1C1C1C] transition-all">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-[#F2A93B] border-2 border-[#1C1C1C] flex items-center justify-center text-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C]">
                <MessageSquare className="w-7 h-7" />
              </div>
              <span className="font-head font-black text-5xl sm:text-6xl text-[#1C1C1C]/25 select-none">
                02
              </span>
            </div>

            <div className="mt-8">
              <h3 className="font-head font-extrabold text-2xl text-[#1C1C1C] mb-2.5">
                Connect securely
              </h3>
              <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
                Chat exclusively with verified students from your exact campus using <strong>@bmsit.in</strong> credentials.
              </p>
            </div>
          </div>

          {/* Step 03: Meet and exchange (Fresh Mint Tint) */}
          <div className="relative p-7 sm:p-8 bg-[#ECFDF5] rounded-3xl border-3 border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] flex flex-col justify-between overflow-hidden group hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#1C1C1C] transition-all">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-[#6EE7B7] border-2 border-[#1C1C1C] flex items-center justify-center text-[#064E3B] shadow-[2px_2px_0px_#1C1C1C]">
                <MapPin className="w-7 h-7" />
              </div>
              <span className="font-head font-black text-5xl sm:text-6xl text-[#064E3B]/25 select-none">
                03
              </span>
            </div>

            <div className="mt-8">
              <h3 className="font-head font-extrabold text-2xl text-[#1C1C1C] mb-2.5">
                Meet and exchange
              </h3>
              <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
                Choose from our recommended safe campus spots (Kaapi Kuteera, Library, Food Court) and complete the deal smoothly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. HOT CATEGORIES: "Everything students actually need." (MATCHING IMAGE 4) ─── */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#2563EB] block">
            HOT CATEGORIES
          </span>
          <h2 className="font-head text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1C1C1C] tracking-tight">
            Everything students actually need.
          </h2>
          <p className="text-xs sm:text-sm text-neutral-700 font-medium">
            Find deals right before the semester starts, sorted by what's essential.
          </p>
        </div>

        {/* 4 Full-Bleed Photographic Cards matching Image 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoriesList.map((cat) => (
            <div
              key={cat.label}
              onClick={() => handleCategoryClick(cat.categoryKey)}
              className="relative h-64 sm:h-72 rounded-3xl overflow-hidden border-2.5 border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] cursor-pointer group transition-all hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_#1C1C1C]"
            >
              {/* High-res Image Background */}
              <img
                src={cat.image}
                alt={cat.label}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Smooth Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

              {/* Top Item Count Tag */}
              <div className="absolute top-4 right-4">
                <span className="text-xs font-mono font-bold bg-[#FFF9E6] text-[#1C1C1C] px-3 py-1 rounded-full border border-[#1C1C1C] shadow-[2px_2px_0px_#1C1C1C]">
                  {cat.count} Items
                </span>
              </div>

              {/* Bottom Label and Subtitle */}
              <div className="absolute bottom-0 inset-x-0 p-5 text-white flex flex-col justify-end">
                <h3 className="font-head font-extrabold text-xl sm:text-2xl text-white tracking-tight leading-snug group-hover:text-[#F2A93B] transition-colors">
                  {cat.label}
                </h3>
                <p className="text-xs text-white/85 mt-1 line-clamp-1 font-medium">
                  {cat.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. TRUST & SAFETY SECTION: REDUCED SHORT TEXT + 100% GREEN OUTLINED BARS ─── */}
      <section className="space-y-8 bg-[#FFFBEA] rounded-3xl border-3 border-[#1C1C1C] shadow-[7px_7px_0px_#1C1C1C] p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Short Points Under Headings */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#F97316] block">
                TRUST & SAFETY
              </span>
              <h2 className="font-head text-3xl sm:text-4xl font-extrabold text-[#1C1C1C] tracking-tight leading-snug">
                Designed for safer student-to-student transactions.
              </h2>
            </div>

            {/* Main Points Under Headings Only (No Walls of Text) */}
            <div className="space-y-4 pt-1">
              {/* Point 1 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] border-2 border-[#1C1C1C] flex items-center justify-center text-[#2563EB] shrink-0 shadow-[2px_2px_0px_#1C1C1C]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-head font-extrabold text-lg text-[#1C1C1C]">
                    Verified @bmsit.in Community
                  </h4>
                  <ul className="text-xs sm:text-sm text-neutral-800 mt-1 space-y-1 font-medium">
                    <li>• Strictly college email (<strong>@bmsit.in</strong>) & valid VTU USN required.</li>
                    <li>• Non-students and commercial outsiders blocked completely.</li>
                  </ul>
                </div>
              </div>

              {/* Point 2 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFE082] border-2 border-[#1C1C1C] flex items-center justify-center text-[#1C1C1C] shrink-0 shadow-[2px_2px_0px_#1C1C1C]">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-head font-extrabold text-lg text-[#1C1C1C]">
                    Secure In-App Chat
                  </h4>
                  <ul className="text-xs sm:text-sm text-neutral-800 mt-1 space-y-1 font-medium">
                    <li>• Direct buyer-seller chat.</li>
                    <li>• Real-time price negotiation.</li>
                  </ul>
                </div>
              </div>

              {/* Point 3 */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#6EE7B7] border-2 border-[#1C1C1C] flex items-center justify-center text-[#064E3B] shrink-0 shadow-[2px_2px_0px_#1C1C1C]">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-head font-extrabold text-lg text-[#1C1C1C]">
                    Smart Campus Exchange Spots
                  </h4>
                  <ul className="text-xs sm:text-sm text-neutral-800 mt-1 space-y-1 font-medium">
                    <li>• Recommended safe spots: Kaapi Kuteera, Library, Food Court.</li>
                    <li>• Zero commission.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dark Safety Targets Card with 100% Green Progress Bars + Black Outlines */}
          <div className="lg:col-span-6">
            <div className="p-6 sm:p-8 bg-[#0D1527] rounded-3xl border-3 border-[#1C1C1C] shadow-[7px_7px_0px_#1C1C1C] text-white space-y-6">
              <div>
                <h3 className="font-head font-extrabold text-xl sm:text-2xl text-white">
                  Our safety targets
                </h3>
                <p className="text-xs text-white/70 mt-1">
                  Institutional standards across campus exchanges at BMSIT
                </p>
              </div>

              {/* Target 1: 100% Verified student profiles */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-white">
                  <span>Verified student profiles (@bmsit.in)</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">100%</span>
                </div>
                <div className="w-full h-4 sm:h-5 rounded-full bg-neutral-900 border-2 border-[#1C1C1C] overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-[#22C55E] border-r-2 border-[#1C1C1C] rounded-full transition-all duration-500"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Target 2: 100% Safe exchange spots */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-white">
                  <span>Safe exchange spots</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">100%</span>
                </div>
                <div className="w-full h-4 sm:h-5 rounded-full bg-neutral-900 border-2 border-[#1C1C1C] overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-[#22C55E] border-r-2 border-[#1C1C1C] rounded-full transition-all duration-500"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Target 3: 100% Successful exchanges */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-white">
                  <span>Successful exchanges</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">100%</span>
                </div>
                <div className="w-full h-4 sm:h-5 rounded-full bg-neutral-900 border-2 border-[#1C1C1C] overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-[#22C55E] border-r-2 border-[#1C1C1C] rounded-full transition-all duration-500"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. RECOMMENDED CAMPUS EXCHANGE SPOTS (LARGER BOXES & CONTINUOUS SCROLLING) ─── */}
      <section className="-mt-8 sm:-mt-12 md:-mt-14">
        <CampusHandoverGuide />
      </section>
    </div>
  );
};
