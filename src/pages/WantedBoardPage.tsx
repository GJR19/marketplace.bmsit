import React, { useState, useMemo } from 'react';
import {
  PlusCircle,
  X,
  MessageSquare,
  Sparkles,
  User,
  Calendar,
  Tag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WantedRequest, ProductCategory } from '../types';

interface WantedBoardPageProps {
  onOpenChat?: (conversationId?: string) => void;
  onOpenAuth?: () => void;
}

export const WantedBoardPage: React.FC<WantedBoardPageProps> = ({ onOpenChat, onOpenAuth }) => {
  const {
    wantedRequests,
    addWantedRequest,
    currentUser,
    startChatWithStudent,
    pushToast,
  } = useApp();

  const isLoggedIn = currentUser.id !== 'guest' && Boolean(currentUser.email) && currentUser.verified;

  // Category filter including 'Other'
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'All'>('All');

  // Create Request Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Books');
  const [description, setDescription] = useState('');

  const categories: (ProductCategory | 'All')[] = [
    'All',
    'Books',
    'Gadgets and Tech',
    'Daily Gear',
    'Dorm Essentials',
    'Other',
  ];

  // Filtered requests by Category
  const filteredRequests = useMemo(() => {
    return wantedRequests
      .filter((r: WantedRequest) => {
        if (categoryFilter !== 'All' && r.category !== categoryFilter) {
          return false;
        }
        return true;
      })
      .sort((a: WantedRequest, b: WantedRequest) => {
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      });
  }, [wantedRequests, categoryFilter]);

  // Handle Create Request (No budget, no needed-by-date)
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentUser.status === 'suspended') {
      pushToast('Your account is currently suspended.', 'error');
      return;
    }

    if (!title.trim() || title.length < 3) {
      pushToast('Please enter what item you need.', 'warning');
      return;
    }

    addWantedRequest({
      title: title.trim(),
      category,
      description: description.trim() || 'Looking for this item on campus.',
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentUSN: currentUser.usn,
      studentBranch: currentUser.branch,
      studentAdmissionYear: currentUser.admissionYear,
    });

    setCreateModalOpen(false);
    setTitle('');
    setDescription('');
    pushToast('Wanted request posted successfully to the board!', 'success');
  };

  // Direct chat / make offer with requester
  const handleStartChat = (req: WantedRequest) => {
    const convId = startChatWithStudent(
      {
        id: req.studentId,
        name: req.studentName,
        usn: req.studentUSN,
        branch: req.studentBranch,
      },
      req.title,
      `Hi ${req.studentName.split(' ')[0]}! I saw your wanted request for "${req.title}" and I'd like to make an offer.`
    );
    pushToast(`Opening chat to make an offer to ${req.studentName.split(' ')[0]}...`, 'success');
    if (onOpenChat) {
      onOpenChat(convId);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Wanted Board Hero Section */}
      <div className="bg-[#FFF9E6] rounded-3xl border-3 border-[#1C1C1C] shadow-[6px_6px_0px_#1C1C1C] p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="nb-sticker text-xs bg-[#FFE082]">
              ★ STUDENT REQUESTS BOARD
            </span>
            <span className="text-xs font-semibold text-neutral-600">
              Campus Wishlist Network
            </span>
          </div>

          <h1 className="font-head text-2xl sm:text-4xl font-extrabold text-[#1C1C1C] leading-tight">
            Can’t find what you need?{' '}
            <span className="highlight-box bg-[#F2A93B]">Post a Wanted Request.</span>
          </h1>

          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-2xl">
            Looking for a specific Casio calculator, cycle, VTU textbook, notes, or dorm gear? Post here. Students with spare items can chat with you directly.
          </p>

          <div className="pt-1">
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  if (onOpenAuth) onOpenAuth();
                  return;
                }
                setCreateModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-full border-2 border-[#1C1C1C] bg-[#F2A93B] text-xs sm:text-sm font-bold text-[#1C1C1C] shadow-[3.5px_3.5px_0px_#1C1C1C] hover:bg-[#e49b2f] transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#1C1C1C]" />
              <span>Post a Wanted Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div className="p-3 bg-[#FFFBEA] rounded-2xl border-2 border-[#1C1C1C] shadow-[3.5px_3.5px_0px_#1C1C1C] flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-[#1C1C1C] px-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#E1467A]" />
          <span>Category:</span>
        </span>
        {categories.map((c) => {
          const isSelected = categoryFilter === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategoryFilter(c)}
              className={`px-3.5 py-1.5 rounded-xl border-2 border-[#1C1C1C] text-xs font-bold transition cursor-pointer ${
                isSelected
                  ? 'bg-[#F2A93B] shadow-[2.5px_2.5px_0px_#1C1C1C] text-[#1C1C1C]'
                  : 'bg-white shadow-[1.5px_1.5px_0px_#1C1C1C] hover:bg-[#FFF9E6] text-neutral-800'
              }`}
            >
              {c === 'All' ? 'All Categories' : c}
            </button>
          );
        })}
      </div>

      {/* Wanted Requests Grid - Clean: Product Details, User Details, Chat */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
          <span>
            Showing <span className="font-bold text-[#1C1C1C]">{filteredRequests.length}</span> requests
          </span>
          <span className="text-[11px] font-mono text-neutral-500">
            Verified @bmsit.in Student Board
          </span>
        </div>

        {filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRequests.map((req: WantedRequest) => {
              const isOwner = currentUser.id === req.studentId;

              return (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl border-2 border-[#1C1C1C] bg-white flex flex-col justify-between shadow-[4px_4px_0px_#1C1C1C] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5.5px_5.5px_0px_#1C1C1C] transition-all duration-200"
                >
                  <div className="space-y-3">
                    {/* Category Pill and Posted Date */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C1C1C] bg-[#FFE082] px-2.5 py-1 rounded-md border border-[#1C1C1C] shadow-[1px_1px_0px_#1C1C1C]">
                        {req.category}
                      </span>

                      <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        <span>{req.postedDate}</span>
                      </span>
                    </div>

                    {/* Product Details: Title */}
                    <h3 className="font-head font-extrabold text-lg sm:text-xl text-[#1C1C1C] leading-snug">
                      {req.title}
                    </h3>

                    {/* Product Details: Description */}
                    {req.description && (
                      <p className="text-xs text-neutral-700 bg-[#FFFBEA] p-3 rounded-xl border border-[#1C1C1C]/15 leading-relaxed">
                        {req.description}
                      </p>
                    )}

                    {/* User Details */}
                    <div className="flex items-center gap-2.5 pt-2 border-t border-[#1C1C1C]/15 text-xs">
                      <div className="w-8 h-8 rounded-full bg-[#FFE082] border border-[#1C1C1C] flex items-center justify-center font-bold text-xs shrink-0 shadow-[1px_1px_0px_#1C1C1C]">
                        <User className="w-4 h-4 text-[#1C1C1C]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[#1C1C1C] truncate">{req.studentName}</div>
                        <div className="text-[10px] text-neutral-600 truncate font-mono">
                          USN: {req.studentUSN}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Direct Chat Action */}
                  <div className="pt-4 border-t border-neutral-100 mt-4">
                    {isOwner ? (
                      <div className="text-center py-2 text-xs font-bold text-neutral-600 bg-neutral-100 rounded-xl border border-neutral-300">
                        Posted by You
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (!isLoggedIn) {
                            if (onOpenAuth) onOpenAuth();
                            return;
                          }
                          handleStartChat(req);
                        }}
                        className="w-full py-2.5 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] shadow-[3px_3px_0px_#1C1C1C] hover:bg-[#e49b2f] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Tag className="w-4 h-4 text-[#1C1C1C]" />
                        <span>{isLoggedIn ? 'Make an Offer' : 'Sign in to Make Offer'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border-3 border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF9E6] border-2 border-[#1C1C1C] flex items-center justify-center text-3xl mx-auto shadow-[2px_2px_0px_#1C1C1C]">
              📌
            </div>
            <h3 className="font-head text-2xl font-bold text-[#1C1C1C]">
              No Wanted Requests on the Board Yet
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              Looking for a textbook, drafter, lab coat, or scientific calculator? Be the first student to post a request!
            </p>
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  if (onOpenAuth) onOpenAuth();
                  return;
                }
                setCreateModalOpen(true);
              }}
              className="mt-2 px-5 py-2.5 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] shadow-[2.5px_2.5px_0px_#1C1C1C] hover:bg-[#e49b2f] cursor-pointer"
            >
              Post a Wanted Request 📌
            </button>
          </div>
        )}
      </div>

      {/* CREATE WANTED REQUEST MODAL (No Budget, No Needed by Date) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-[#FFFBF5] rounded-3xl border-3 border-[#1C1C1C] shadow-[7px_7px_0px_#1C1C1C] p-6 sm:p-8 my-8 animate-in zoom-in-95">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full border border-[#1C1C1C] bg-[#FFF9E6] hover:bg-[#F2A93B] transition"
            >
              <X className="w-4 h-4 text-[#1C1C1C]" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F2A93B] border-2 border-[#1C1C1C] flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_#1C1C1C]">
                📌
              </div>
              <div>
                <h3 className="font-head text-xl font-bold text-[#1C1C1C]">
                  Post a Wanted Request
                </h3>
                <p className="text-xs text-neutral-600">
                  Notify campus students about an item you need.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                  What item do you need? *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Casio fx-991CW Calculator, VTU Maths Notes..."
                  className="w-full px-3 py-2.5 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] focus:outline-none focus:ring-2 focus:ring-[#F2A93B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] focus:outline-none font-medium"
                >
                  {categories.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1C1C] mb-1">
                  Description / Specific Requirements
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. In good working condition. Needed for 2nd year semester exams."
                  className="w-full p-2.5 text-xs rounded-xl border-2 border-[#1C1C1C] bg-white shadow-[2px_2px_0px_#1C1C1C] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#1C1C1C] bg-white hover:bg-[#FFF9E6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] shadow-[2px_2px_0px_#1C1C1C] hover:bg-[#e49b2f] transition cursor-pointer"
                >
                  Post Wanted Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
