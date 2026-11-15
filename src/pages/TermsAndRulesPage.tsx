import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Mail,
  ArrowLeft,
  Scale,
  Ban,
  Lock,
  HeartHandshake,
  Info,
  Code,
} from 'lucide-react';

interface TermsAndRulesPageProps {
  onBackToMarketplace: () => void;
}

export const TermsAndRulesPage: React.FC<TermsAndRulesPageProps> = ({
  onBackToMarketplace,
}) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Top Banner */}
      <div className="bg-[#FFF9E6] rounded-3xl border-3 border-[#1C1C1C] shadow-[6px_6px_0px_#1C1C1C] p-6 sm:p-8 relative overflow-hidden">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="nb-sticker text-xs bg-[#FFE082] flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-[#1C1C1C]" />
              <span>STUDENT-BUILT INITIATIVE</span>
            </span>
            <span className="text-xs font-semibold text-[#1C1C1C] bg-[#FFFBF5] px-2.5 py-1 rounded-full border border-[#1C1C1C]/30 flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-[#F2A93B]" />
              <span>By Students, For Students</span>
            </span>
          </div>

          <h1 className="font-head text-3xl sm:text-4xl font-extrabold text-[#1C1C1C] tracking-tight">
            Terms of Use & Campus Community Rules
          </h1>

          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-2xl">
            marketplace.bmsit is an independent peer-to-peer exchange platform developed by a BMSIT student
            for fellow BMSIT students. It is designed to make buying and selling used textbooks, calculators,
            cycles, and campus supplies easy, fair, and free of third-party commissions.
          </p>

          <div className="pt-2">
            <button
              onClick={onBackToMarketplace}
              className="px-4 py-2 rounded-xl border-2 border-[#1C1C1C] bg-white hover:bg-[#FFE082] text-xs font-bold text-[#1C1C1C] shadow-[2.5px_2.5px_0px_#1C1C1C] flex items-center gap-2 cursor-pointer transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Independent Project Disclaimer Box */}
      <div className="p-5 sm:p-6 bg-[#FFFBEA] rounded-3xl border-3 border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-[#F2A93B] border-2 border-[#1C1C1C] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#1C1C1C]">
          <Info className="w-5 h-5 text-[#1C1C1C]" />
        </div>
        <div className="space-y-1.5 text-xs text-neutral-800 leading-relaxed">
          <h4 className="font-head font-bold text-sm text-[#1C1C1C]">
            Important Notice: Independent Student Project (Not College Administration)
          </h4>
          <p>
            Please note that <strong>marketplace.bmsit is not an official portal, nor is it run or endorsed by the BMSIT college administration or VTU</strong>.
            It is a personal, student-led open initiative built to help our campus community connect directly.
            All transactions, inspections, and handovers are conducted strictly student-to-student on mutual trust.
          </p>
        </div>
      </div>

      {/* Main Grid of Student Rules & Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rule 1: Exclusively for BMSIT Peers */}
        <div className="p-6 bg-white rounded-3xl border-3 border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFE082] border-2 border-[#1C1C1C] flex items-center justify-center shadow-[2px_2px_0px_#1C1C1C]">
            <CheckCircle2 className="w-5 h-5 text-[#1C1C1C]" />
          </div>
          <h3 className="font-head font-bold text-lg text-[#1C1C1C]">
            1. Exclusively for BMSIT Peers
          </h3>
          <p className="text-xs text-neutral-700 leading-relaxed">
            This platform is dedicated strictly to current BMSIT students with a valid VTU USN.
            Please do not share accounts or list items on behalf of outside third-parties. Keeping the platform
            restricted to our campus peers helps maintain trust and safety.
          </p>
        </div>

        {/* Rule 2: Safe Physical Handover on Campus */}
        <div className="p-6 bg-white rounded-3xl border-3 border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#F2A93B] border-2 border-[#1C1C1C] flex items-center justify-center shadow-[2px_2px_0px_#1C1C1C]">
            <MapPin className="w-5 h-5 text-[#1C1C1C]" />
          </div>
          <h3 className="font-head font-bold text-lg text-[#1C1C1C]">
            2. Meet in Daylight at Recommended Campus Spots
          </h3>
          <p className="text-xs text-neutral-700 leading-relaxed">
            Since this is an unmediated student-to-student exchange, always arrange item inspections and handovers at the verified campus spots recommended on the homepage: <strong>Kaapi Kuteera</strong>, <strong>Library</strong>, <strong>Food Court</strong>, <strong>Academic Block</strong>, or the <strong>Main Gate</strong> during daylight hours. Never agree to meet in isolated locations outside campus.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              'Kaapi Kuteera',
              'Library',
              'Food Court',
              'Academic Block',
              'Main Gate',
              'Ground',
              'Boys Hostel',
            ].map((spot) => (
              <span
                key={spot}
                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF9E6] border border-[#1C1C1C] text-[#1C1C1C] shadow-[1px_1px_0px_#1C1C1C]"
              >
                📍 {spot}
              </span>
            ))}
          </div>
        </div>

        {/* Rule 3: Zero Advance Payments */}
        <div className="p-6 bg-white rounded-3xl border-3 border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#E1467A] border-2 border-[#1C1C1C] flex items-center justify-center shadow-[2px_2px_0px_#1C1C1C] text-white">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-head font-bold text-lg text-[#1C1C1C]">
            3. Never Send Online Advances
          </h3>
          <p className="text-xs text-neutral-700 leading-relaxed">
            The platform does not hold escrow or collect commissions. Never send online deposits or UPI payments
            prior to meeting in person. Inspect calculators, bikes, drafters, or electronics thoroughly with the
            seller, verify working order, and only then pay on the spot.
          </p>
        </div>

        {/* Rule 4: Prohibited Items */}
        <div className="p-6 bg-white rounded-3xl border-3 border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 border-2 border-[#1C1C1C] flex items-center justify-center shadow-[2px_2px_0px_#1C1C1C]">
            <Ban className="w-5 h-5 text-red-700" />
          </div>
          <h3 className="font-head font-bold text-lg text-[#1C1C1C]">
            4. Prohibited Items & Clean Content
          </h3>
          <p className="text-xs text-neutral-700 leading-relaxed">
            As students representing our college, keep listings clean and honest. Strictly forbidden: exam cheating
            gadgets or malpractice materials, stolen goods, hazardous items, illegal software, and commercial reseller spam.
            Inappropriate listings will be permanently deleted.
          </p>
        </div>

        {/* Rule 5: Respectful 1-on-1 Chat */}
        <div className="p-6 bg-white rounded-3xl border-3 border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFE082] border-2 border-[#1C1C1C] flex items-center justify-center shadow-[2px_2px_0px_#1C1C1C]">
            <Lock className="w-5 h-5 text-[#1C1C1C]" />
          </div>
          <h3 className="font-head font-bold text-lg text-[#1C1C1C]">
            5. Private & Respectful Student Chat
          </h3>
          <p className="text-xs text-neutral-700 leading-relaxed">
            Chat is completely private between you and the other student. Treat all batchmates with mutual respect.
            Any form of harassment, foul language, spamming, or fraudulent negotiation will result in an immediate
            account block.
          </p>
        </div>

        {/* Rule 6: Fair Pricing & Honest Photos */}
        <div className="p-6 bg-white rounded-3xl border-3 border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 border-2 border-[#1C1C1C] flex items-center justify-center shadow-[2px_2px_0px_#1C1C1C]">
            <HeartHandshake className="w-5 h-5 text-emerald-800" />
          </div>
          <h3 className="font-head font-bold text-lg text-[#1C1C1C]">
            6. Fair Student Pricing & Real Photos
          </h3>
          <p className="text-xs text-neutral-700 leading-relaxed">
            We are all students trying to save money on expensive gear. Upload real, unedited photos of your actual
            item, state the genuine retail MRP honestly, and transparently declare any scratches, missing parts, or
            wear so your peers know exactly what they are getting.
          </p>
        </div>
      </div>

      {/* Limitation of Liability Box */}
      <div className="p-6 bg-white rounded-3xl border-3 border-[#1C1C1C] shadow-[4px_4px_0px_#1C1C1C] space-y-2">
        <h4 className="font-head font-bold text-base text-[#1C1C1C]">
          Limitation of Liability
        </h4>
        <p className="text-xs text-neutral-600 leading-relaxed">
          marketplace.bmsit is provided as a free student community utility on an "as-is" basis. The creator and
          maintainers do not verify item ownership, quality, or financial settlement between peers. Students engage in
          trades at their own discretion and mutual agreement.
        </p>
      </div>

      {/* Creator Contact & Issue Reporting Section */}
      <div className="p-6 sm:p-8 bg-[#FFF9E6] rounded-3xl border-3 border-[#1C1C1C] shadow-[5px_5px_0px_#1C1C1C] space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#E1467A]" />
          <h3 className="font-head font-bold text-xl text-[#1C1C1C]">
            Have an Issue, Feedback, or Bug to Report?
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
          This platform was built by <strong>Gururaj Reddy</strong> for the BMSIT student community. If you run into a
          technical bug, want to report a malicious listing, or have suggestions to improve the platform, send an email directly:
        </p>

        <div className="pt-1 flex flex-wrap items-center gap-3">
          <a
            href="mailto:gjr19atwork@gmail.com?subject=BMSIT%20Marketplace%20Issue%20Report"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl border-2.5 border-[#1C1C1C] bg-[#F2A93B] hover:bg-[#e49b2f] font-head font-extrabold text-sm text-[#1C1C1C] shadow-[3.5px_3.5px_0px_#1C1C1C] active:translate-x-0.5 active:translate-y-0.5 transition cursor-pointer"
          >
            <Mail className="w-4 h-4 stroke-[2.5]" />
            <span>Email Creator: gjr19atwork@gmail.com</span>
          </a>

          <a
            href="https://github.com/GJR19"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-[#1C1C1C] bg-white hover:bg-[#FFE082] text-xs font-bold text-[#1C1C1C] shadow-[2.5px_2.5px_0px_#1C1C1C] transition cursor-pointer"
          >
            <span>GitHub Profile: @GJR19</span>
          </a>
        </div>
      </div>
    </div>
  );
};
