import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  PlusCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, ProductCategory } from '../types';
import { ProductCard } from '../components/product/ProductCard';

interface MarketplacePageProps {
  selectedCategory: ProductCategory | 'All';
  setSelectedCategory: (cat: ProductCategory | 'All') => void;
  onOpenDetails: (product: Product) => void;
  onOpenSellModal: () => void;
  onOpenWantedBoard: () => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  selectedCategory,
  setSelectedCategory,
  onOpenDetails,
  onOpenSellModal,
  onOpenWantedBoard,
}) => {
  const { products } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'available'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_asc' | 'price_desc'>('newest');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories: (ProductCategory | 'All')[] = [
    'All',
    'Books',
    'Gadgets and Tech',
    'Daily Gear',
    'Dorm Essentials',
    'Other',
  ];

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((p: Product) => {
      // Must not be rejected or pending approval in public catalogue unless viewing all
      if (p.status === 'rejected' || p.status === 'pending_approval') {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }

      // Status filter (only all or available)
      if (selectedStatus === 'available' && p.status !== 'approved') {
        return false;
      }

      // Price filter
      if (minPrice !== '' && p.price < Number(minPrice)) {
        return false;
      }
      if (maxPrice !== '' && p.price > Number(maxPrice)) {
        return false;
      }

      // Search keyword filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesDesc = (p.description || '').toLowerCase().includes(query);
        const matchesCategory = p.category.toLowerCase().includes(query);
        const matchesSeller = p.sellerName.toLowerCase().includes(query);
        const matchesUSN = p.sellerUSN.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesSeller && !matchesUSN) {
          return false;
        }
      }

      return true;
    }).sort((a: Product, b: Product) => {
      if (sortBy === 'price_asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price_desc') {
        return b.price - a.price;
      }
      if (sortBy === 'oldest') {
        return new Date(a.postedDate).getTime() - new Date(b.postedDate).getTime();
      }
      if (sortBy === 'newest') {
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      }
      return 0;
    });
  }, [
    products,
    selectedCategory,
    selectedStatus,
    minPrice,
    maxPrice,
    searchTerm,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedStatus('all');
    setMinPrice('');
    setMaxPrice('');
    setSearchTerm('');
    setSortBy('newest');
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedStatus !== 'all' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    searchTerm !== '';

  return (
    <div className="space-y-6">
      {/* Catalogue Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="nb-sticker text-xs bg-[#FFE082]">
              THE PRODUCT CATALOGUE
            </span>
            <span className="text-xs font-semibold text-neutral-600">
              Verified BMSIT Listings
            </span>
          </div>
          <h1 className="font-head text-3xl sm:text-4xl font-extrabold text-[#1C1C1C]">
            The best purchases you can <span className="highlight-box bg-[#F2A93B]">actually use.</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-xl">
            Calculators, reference textbooks, laptops, cycles, and hostel gear handed down between students.
          </p>
        </div>

        <button
          onClick={onOpenSellModal}
          className="self-start md:self-auto px-5 py-2.5 rounded-full border-2 border-[#1C1C1C] bg-[#F2A93B] font-bold text-xs sm:text-sm text-[#1C1C1C] shadow-[3px_3px_0px_#1C1C1C] hover:bg-[#e49b2f] transition flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4 text-[#1C1C1C]" />
          <span>Post New Listing</span>
        </button>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="p-4 bg-[#FFFBEA] rounded-2xl border-2 border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search listings, sellers, USN..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right Sort Controls & Mobile Filter Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-3 py-2 rounded-xl border-2 border-[#1C1C1C] bg-white font-bold text-xs flex items-center gap-1.5 shadow-[2px_2px_0px_#1C1C1C]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {hasActiveFilters && '•'}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-neutral-600 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] focus:outline-none"
            >
              <option value="newest">Newest Listings</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="oldest">Oldest Listings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Category Pill Filter (Requested Design) */}
      <div className="lg:hidden p-4 bg-[#FFFBEA] rounded-3xl border-2.5 border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E1467A]" />
          <span className="font-head font-bold text-sm text-[#1C1C1C]">Category:</span>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const label = cat === 'All' ? 'All Categories' : cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full border-2 border-[#1C1C1C] text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#F2A93B] shadow-[2.5px_2.5px_0px_#1C1C1C] text-[#1C1C1C]'
                    : 'bg-white shadow-[2px_2px_0px_#1C1C1C] hover:bg-[#FFF9E6] text-[#1C1C1C]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Desktop Left Sidebar Filters */}
        <aside
          className={`lg:col-span-3 space-y-5 bg-[#FFFBEA] p-5 rounded-2xl border-2 border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] ${
            mobileFilterOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]/20">
            <div className="flex items-center gap-1.5 font-head font-bold text-sm text-[#1C1C1C]">
              <Filter className="w-4 h-4 text-[#F2A93B]" />
              <span>Filter Catalogue</span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-[#E1467A] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* 1. Category Filter with count pills */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2.5">
              Categories
            </h4>
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const count =
                  cat === 'All'
                    ? products.filter((p: Product) => p.status === 'approved' || p.status === 'sold').length
                    : products.filter(
                        (p: Product) =>
                          p.category === cat &&
                          (p.status === 'approved' || p.status === 'sold')
                      ).length;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-[#F2A93B] text-[#1C1C1C] border border-[#1C1C1C] shadow-[1px_1px_0px_#1C1C1C]'
                        : 'text-neutral-700 hover:bg-white'
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-white text-[#1C1C1C]' : 'bg-[#FFF9E6] text-neutral-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Status Filter */}
          <div className="pt-3 border-t border-[#1C1C1C]/15">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Listing Status
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'available', label: 'Available Only' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStatus(st.id as any)}
                  className={`p-1.5 rounded-lg border text-center font-medium transition ${
                    selectedStatus === st.id
                      ? 'bg-[#F2A93B] font-bold border-[#1C1C1C] shadow-[1px_1px_0px_#1C1C1C]'
                      : 'bg-white border-[#1C1C1C]/20 text-neutral-700 hover:bg-[#FFF9E6]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Price Range Filter */}
          <div className="pt-3 border-t border-[#1C1C1C]/15">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
              Budget (₹ INR)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-neutral-500 block mb-0.5">Min ₹</span>
                <input
                  type="number"
                  min={0}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="0"
                  className="w-full p-1.5 rounded-lg border border-[#1C1C1C] bg-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 block mb-0.5">Max ₹</span>
                <input
                  type="number"
                  min={0}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="10000"
                  className="w-full p-1.5 rounded-lg border border-[#1C1C1C] bg-white"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Right Products Content */}
        <main className="lg:col-span-9 space-y-4">
          {/* Active Filter Pills Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-xl border-1.5 border-[#1C1C1C] text-xs">
              <span className="font-bold text-neutral-600">Active Filters:</span>

              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF1D9] border border-[#1C1C1C] font-semibold">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedStatus !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF1D9] border border-[#1C1C1C] font-semibold">
                  Status: {selectedStatus}
                  <button onClick={() => setSelectedStatus('all')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {(minPrice !== '' || maxPrice !== '') && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF1D9] border border-[#1C1C1C] font-semibold">
                  Price: ₹{minPrice || 0} - ₹{maxPrice || '∞'}
                  <button
                    onClick={() => {
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={clearAllFilters}
                className="text-[11px] font-bold text-[#E1467A] hover:underline ml-auto"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Result Count Status */}
          <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
            <span>
              Showing <span className="font-bold text-[#1C1C1C]">{filteredProducts.length}</span> items on campus
            </span>
            <span className="text-[11px] font-mono text-neutral-500">
              Verified @bmsit.in
            </span>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((p: Product) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onOpenDetails={onOpenDetails}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border-3 border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FFF9E6] border-2 border-[#1C1C1C] flex items-center justify-center text-3xl mx-auto shadow-[2px_2px_0px_#1C1C1C]">
                🔍
              </div>
              <h3 className="font-head text-2xl font-bold text-[#1C1C1C]">
                No matching campus listings found
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                None of your fellow students have listed this exact item right now. Try clearing filters or post a request on the Wanted Board!
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-3">
                <button
                  onClick={clearAllFilters}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] hover:bg-[#FFF9E6] transition active:translate-x-0.5 active:translate-y-0.5"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={onOpenSellModal}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] shadow-[2.5px_2.5px_0px_#1C1C1C] hover:bg-[#e49b2f] flex items-center justify-center gap-1.5 transition active:translate-x-0.5 active:translate-y-0.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post a Listing</span>
                </button>
                <button
                  onClick={onOpenWantedBoard}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] hover:bg-[#FFF9E6] flex items-center justify-center gap-1.5 transition active:translate-x-0.5 active:translate-y-0.5"
                >
                  Post on Wanted Board 📌
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
