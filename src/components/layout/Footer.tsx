import React from 'react';
import { ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenAuth }) => {
  const { currentUser } = useApp();
  const isLoggedIn = currentUser.id !== 'guest' && Boolean(currentUser.email) && currentUser.verified;

  return (
    <footer className="mt-24 border-t-3 border-[#1C1C1C] bg-[#FFF9E6]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand & Mission Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#F2A93B] border-2 border-[#1C1C1C] flex items-center justify-center font-bold text-lg shadow-[2px_2px_0px_#1C1C1C]">
                🎓
              </div>
              <span className="font-head text-2xl font-extrabold text-[#1C1C1C] tracking-tight">
                marketplace<span className="text-[#1C1C1C]">.</span>bmsit
              </span>
            </div>

            <p className="font-accent italic text-[#1C1C1C]/80 text-sm max-w-sm">
              "Your College, Your Marketplace."
            </p>

            <p className="text-xs text-[#1C1C1C]/75 leading-relaxed max-w-sm">
              The student-run campus exchange for BMS Institute of Technology and Management, Bengaluru. Hand off textbooks, calculators, monitors, and cycles safely right between classes.
            </p>

            <div className="pt-2">
              <div className="nb-sticker text-xs bg-[#FFE082] inline-flex items-center gap-1.5 shadow-[2px_2px_0px_#1C1C1C]">
                <Sparkles className="w-3.5 h-3.5 text-[#E1467A]" />
                <span>Exclusively for BMSIT Students • Bengaluru</span>
              </div>
            </div>
          </div>

          {/* Explore Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-head font-bold text-sm uppercase tracking-wider text-[#1C1C1C] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#F2A93B] border border-[#1C1C1C]" />
              Explore
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-[#1C1C1C]/80">
              <li>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="hover:text-[#1C1C1C] hover:translate-x-1 transition-transform inline-block"
                >
                  Product Catalogue
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('wanted')}
                  className="hover:text-[#1C1C1C] hover:translate-x-1 transition-transform inline-block"
                >
                  Wanted Board
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      onOpenAuth();
                      return;
                    }
                    setActiveTab('sell');
                  }}
                  className="hover:text-[#1C1C1C] hover:translate-x-1 transition-transform inline-block"
                >
                  Sell an Item
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      onOpenAuth();
                      return;
                    }
                    setActiveTab('dashboard');
                  }}
                  className="hover:text-[#1C1C1C] hover:translate-x-1 transition-transform inline-block"
                >
                  Student Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Campus Safety */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-head font-bold text-sm uppercase tracking-wider text-[#1C1C1C] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#E1467A] border border-[#1C1C1C]" />
              Campus Safety
            </h4>
            <ul className="space-y-2 text-xs font-medium text-[#1C1C1C]/80">
              <li className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F2A93B] shrink-0 mt-0.5" />
                <span>Meet at recommended spots: Kaapi Kuteera, Library, or Food Court.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>Never pay online advances. Inspect item in person first.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E1467A] shrink-0 mt-0.5" />
                <span>Trade directly with fellow BMSIT students — zero middlemen.</span>
              </li>
            </ul>
          </div>

          {/* SUPPORT Column */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-head font-bold text-sm uppercase tracking-wider text-[#1C1C1C]">
              Support
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-[#1C1C1C]/80">
              <li>
                <button
                  onClick={() => setActiveTab('terms')}
                  className="hover:text-[#1C1C1C] hover:translate-x-1 transition-transform inline-block cursor-pointer text-left"
                >
                  Terms & Rules
                </button>
              </li>
              <li>
                <a
                  href="mailto:gjr19atwork@gmail.com?subject=BMSIT%20Marketplace%20Issue%20Report"
                  className="hover:text-[#1C1C1C] hover:translate-x-1 transition-transform inline-block"
                >
                  Report an issue
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with dashed line */}
        <div className="mt-12 pt-6 border-t-2 border-dashed border-[#1C1C1C]/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-600">
          <p className="flex items-center gap-1.5 flex-wrap">
            <span>© 2026 marketplace.bmsit — built with ❤️ by</span>
            <a
              href="https://github.com/GJR19"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline decoration-2 underline-offset-2 hover:text-[#F2A93B] text-[#1C1C1C] transition-colors"
            >
              GURURAJ REDDY
            </a>
          </p>
          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setActiveTab('terms')}
              className="hover:underline hover:text-[#1C1C1C] cursor-pointer"
            >
              Terms of Campus Exchange
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('terms')}
              className="hover:underline hover:text-[#1C1C1C] cursor-pointer"
            >
              Privacy Guidelines
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
