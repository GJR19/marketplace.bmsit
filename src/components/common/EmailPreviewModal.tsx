import React, { useState } from 'react';
import { Mail, X, Check, Bell, ShieldAlert, Sparkles, Send } from 'lucide-react';
import { WantedRequest } from '../../types';
import { formatPriceINR } from '../../utils/usnParser';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  wantedRequest?: WantedRequest | null;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  wantedRequest,
}) => {
  const [targetAudience, setTargetAudience] = useState<'all' | 'branch' | 'year'>('all');
  const [subscribedOnly, setSubscribedOnly] = useState(true);

  if (!isOpen) return null;

  const sampleReq: WantedRequest = wantedRequest || {
    id: 'demo-req',
    title: 'Casio fx-991CW ClassWiz Scientific Calculator',
    category: 'Gadgets and Tech',
    description: 'Urgent for VTU Mathematics internals. Need a working calculator with clear screen.',
    minBudget: 800,
    maxBudget: 1200,
    preferredCondition: 'Good',
    studentId: 'std-6',
    studentName: 'Meera Nambiar',
    studentUSN: '1BY25AI008',
    studentBranch: 'Artificial Intelligence & Machine Learning (AIML)',
    studentAdmissionYear: 2025,
    status: 'open',
    responses: [],
    expiryDate: '2026-10-25',
    preferredContact: 'In-app Chat',
    postedDate: '2026-10-13',
  };

  const recipientCount =
    targetAudience === 'all' ? 420 : targetAudience === 'branch' ? 68 : 110;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FFFBF5] rounded-2xl border-2 border-[#1C1C1C] shadow-[6px_6px_0px_#1C1C1C] p-6 my-8 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full border border-[#1C1C1C] bg-[#FFF9E6] hover:bg-[#F2A93B] transition shadow-[1.5px_1.5px_0px_#1C1C1C]"
        >
          <X className="w-4 h-4 text-[#1C1C1C]" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#FFF1D9] border-2 border-[#1C1C1C] flex items-center justify-center text-[#F2A93B]">
            <Mail className="w-5 h-5 text-[#1C1C1C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-head text-xl font-bold text-[#1C1C1C]">
                Campus Broadcast Email Simulation
              </h2>
              <span className="nb-sticker text-[10px] py-0.5 px-2 bg-[#FFE082]">
                DEMO PREVIEW
              </span>
            </div>
            <p className="text-xs text-[#1C1C1C]/70">
              Future integration preview: How registered BMSIT students will receive Wanted Board alerts.
            </p>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="bg-[#FFF9E6] border-2 border-[#1C1C1C] rounded-xl p-3 my-4 flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-[#E1467A] shrink-0 mt-0.5" />
          <div className="text-xs text-[#1C1C1C] leading-relaxed">
            <span className="font-bold">Frontend Demonstration:</span> Absolutely no real emails are sent. This interface visualizes the template and delivery audience for the planned backend email worker.
          </div>
        </div>

        {/* Simulation Targeting Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
          <div className="p-3 bg-white rounded-xl border border-[#1C1C1C]/30">
            <span className="font-bold block text-[#1C1C1C] mb-1">Audience Scope:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTargetAudience('all')}
                className={`px-2 py-1 rounded border ${
                  targetAudience === 'all'
                    ? 'bg-[#F2A93B] font-bold border-[#1C1C1C]'
                    : 'bg-neutral-50 border-neutral-300'
                }`}
              >
                All Campus ({recipientCount})
              </button>
              <button
                type="button"
                onClick={() => setTargetAudience('branch')}
                className={`px-2 py-1 rounded border ${
                  targetAudience === 'branch'
                    ? 'bg-[#F2A93B] font-bold border-[#1C1C1C]'
                    : 'bg-neutral-50 border-neutral-300'
                }`}
              >
                Branch Only
              </button>
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#1C1C1C]/30">
            <span className="font-bold block text-[#1C1C1C] mb-1">Target Filter:</span>
            <span className="text-[#1C1C1C]/80">
              Verified <span className="font-mono font-semibold">@bmsit.in</span> accounts
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#1C1C1C]/30 flex items-center justify-between">
            <div>
              <span className="font-bold block text-[#1C1C1C]">Opt-in Status:</span>
              <span className="text-[11px] text-neutral-500">Wanted Board alerts</span>
            </div>
            <button
              onClick={() => setSubscribedOnly(!subscribedOnly)}
              className={`w-6 h-6 rounded border border-[#1C1C1C] flex items-center justify-center ${
                subscribedOnly ? 'bg-[#F2A93B]' : 'bg-white'
              }`}
            >
              {subscribedOnly && <Check className="w-4 h-4 text-[#1C1C1C]" />}
            </button>
          </div>
        </div>

        {/* Mock HTML Email Client Frame */}
        <div className="rounded-xl border-2 border-[#1C1C1C] overflow-hidden shadow-[3px_3px_0px_#1C1C1C] bg-white">
          {/* Email Client Header */}
          <div className="bg-[#FBF6EC] border-b-2 border-[#1C1C1C] p-3 text-xs space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-neutral-600">
              <div>
                <span className="font-semibold text-neutral-800">From:</span> notifications@marketplace.bmsit.in (BMSIT Marketplace)
              </div>
              <div className="text-[11px]">Today, 10:45 AM</div>
            </div>
            <div className="text-neutral-600">
              <span className="font-semibold text-neutral-800">To:</span> campus-registered-students@bmsit.in ({recipientCount} verified recipients)
            </div>
            <div className="text-neutral-900 font-bold text-sm">
              <span className="text-neutral-500">Subject:</span> [BMSIT Wanted Board] {sampleReq.studentName} is looking for: "{sampleReq.title}"
            </div>
          </div>

          {/* Email Body */}
          <div className="p-6 bg-[#FFFAF4] text-[#1C1C1C] space-y-4 font-sans">
            {/* Header branding */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C]/15">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F2A93B] border border-[#1C1C1C] flex items-center justify-center font-bold text-xs">
                  BM
                </div>
                <span className="font-head font-bold text-base text-[#1C1C1C]">
                  marketplace.bmsit
                </span>
              </div>
              <span className="text-[11px] bg-[#FFF1D9] text-[#1C1C1C] px-2 py-0.5 rounded-full border border-[#1C1C1C]/40 font-medium">
                Wanted Alert
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">
                Hey fellow BMSITian 👋
              </p>
              <p className="text-xs text-[#1C1C1C]/80 leading-relaxed">
                A student from <span className="font-semibold">{sampleReq.studentBranch}</span> just posted an urgent request on the campus Wanted Board. Do you have this sitting in your hostel room or desk?
              </p>
            </div>

            {/* Requested Item Card inside email */}
            <div className="bg-white rounded-xl border-2 border-[#1C1C1C] p-4 shadow-[2px_2px_0px_#1C1C1C]">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E1467A] bg-[#FDF2F4] px-2 py-0.5 rounded border border-[#E1467A]/30 inline-block mb-1">
                    {sampleReq.category}
                  </span>
                  <h4 className="font-head font-bold text-base text-[#1C1C1C]">
                    {sampleReq.title}
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-neutral-500">Max Budget</div>
                  <div className="font-head font-bold text-lg text-[#F2A93B]">
                    {sampleReq.maxBudget ? formatPriceINR(sampleReq.maxBudget) : 'Flexible'}
                  </div>
                </div>
              </div>

              <p className="text-xs text-neutral-700 bg-[#FFFBEA] p-2.5 rounded-lg border border-[#1C1C1C]/20 mb-3 italic">
                "{sampleReq.description}"
              </p>

              <div className="flex flex-wrap items-center justify-between text-xs text-neutral-600 pt-2 border-t border-neutral-200">
                <div>
                  Requested by: <span className="font-semibold text-neutral-900">{sampleReq.studentName}</span> ({sampleReq.studentUSN})
                </div>
                <div>
                  Preferred Condition: <span className="font-semibold">{sampleReq.preferredCondition}</span>
                </div>
              </div>
            </div>

            {/* CTA inside email */}
            <div className="text-center pt-2">
              <a
                href="#wanted-board"
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs bg-[#F2A93B] text-[#1C1C1C] border-2 border-[#1C1C1C] shadow-[2.5px_2.5px_0px_#1C1C1C] hover:translate-x-0.5 hover:translate-y-0.5 transition"
              >
                <span>Respond to {sampleReq.studentName.split(' ')[0]} on Campus</span>
                <Send className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Email footer */}
            <div className="text-[10px] text-neutral-500 text-center pt-4 border-t border-[#1C1C1C]/15 space-y-1">
              <p>
                You received this because your account is verified with a BMS Institute of Technology & Management email.
              </p>
              <p>
                Campus Handover Guarantee • Exclusively for BMSIT Students • Manage Notification Preferences in Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Modal actions */}
        <div className="mt-5 flex items-center justify-between">
          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-[#F2A93B]" />
            <span>Delivery queue simulated in browser memory</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold rounded-xl border-2 border-[#1C1C1C] bg-[#F2A93B] text-[#1C1C1C] shadow-[2.5px_2.5px_0px_#1C1C1C] hover:bg-[#e49b2f] transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
