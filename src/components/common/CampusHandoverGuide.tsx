import React from 'react';
import {
  MapPin,
  Coffee,
  BookOpen,
  Building2,
  Utensils,
  Trophy,
  Home,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface CampusHandoverGuideProps {
  selectedLocation?: string;
  onSelectLocation?: (locationName: string) => void;
  isSelectable?: boolean;
}

export const CampusHandoverGuide: React.FC<CampusHandoverGuideProps> = ({
  selectedLocation,
  onSelectLocation,
  isSelectable = false,
}) => {
  const { campusLocations } = useApp();

  const getSpotIcon = (name: string, iconName?: string) => {
    switch (iconName || name) {
      case 'Coffee':
        return <Coffee className="w-7 h-7 sm:w-8 sm:h-8" />;
      case 'BookOpen':
        return <BookOpen className="w-7 h-7 sm:w-8 sm:h-8" />;
      case 'Building2':
        return <Building2 className="w-7 h-7 sm:w-8 sm:h-8" />;
      case 'Utensils':
        return <Utensils className="w-7 h-7 sm:w-8 sm:h-8" />;
      case 'Trophy':
        return <Trophy className="w-7 h-7 sm:w-8 sm:h-8" />;
      case 'Home':
        return <Home className="w-7 h-7 sm:w-8 sm:h-8" />;
      default:
        return <MapPin className="w-7 h-7 sm:w-8 sm:h-8" />;
    }
  };

  return (
    <div className="bg-[#FFFBEA] rounded-3xl border-3 border-[#1C1C1C] shadow-[6px_6px_0px_#1C1C1C] p-6 sm:p-8 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-head text-2xl sm:text-3xl font-extrabold text-[#F97316]">
            Recommended Campus Exchange Spots
          </h3>
          <p className="text-xs sm:text-sm text-neutral-700 mt-1">
            Public landmark zones on campus for safe student meetups.
          </p>
        </div>

        <div className="self-start sm:self-auto shrink-0">
          <span className="nb-sticker text-xs sm:text-sm bg-[#FFE082] px-3.5 py-1.5 shadow-[2px_2px_0px_#1C1C1C] inline-block font-extrabold">
            ★ SAFE EXCHANGE
          </span>
        </div>
      </div>

      {/* Continuously Scrolling Track of Larger Boxes & Icons */}
      <div className="w-full overflow-hidden py-2 select-none">
        <div className="animate-marquee flex items-center gap-4 sm:gap-6 w-max hover:[animation-play-state:paused]">
          {/* First set of 7 Spots */}
          {campusLocations.map((loc) => {
            const isSelected = selectedLocation === loc.name;

            return (
              <div
                key={`spot-1-${loc.id}`}
                onClick={() => isSelectable && onSelectLocation && onSelectLocation(loc.name)}
                className={`relative min-w-[170px] sm:min-w-[210px] p-5 sm:p-6 rounded-2xl border-2.5 border-[#1C1C1C] flex flex-col items-center justify-center text-center transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#F2A93B] shadow-[4px_4px_0px_#1C1C1C] scale-102 font-bold'
                    : 'bg-white shadow-[3.5px_3.5px_0px_#1C1C1C] hover:bg-[#FFF9E6] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#1C1C1C]'
                } ${isSelectable ? 'cursor-pointer' : ''}`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1C1C1C]" />
                  </div>
                )}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-[#1C1C1C] flex items-center justify-center mb-3 shadow-[2px_2px_0px_#1C1C1C] ${
                    isSelected ? 'bg-white text-[#1C1C1C]' : 'bg-[#FFF9E6] text-[#1C1C1C]'
                  }`}
                >
                  {getSpotIcon(loc.name, loc.iconName)}
                </div>
                <span className="font-head text-sm sm:text-base font-extrabold text-[#1C1C1C] leading-snug">
                  {loc.name}
                </span>
                <span className="text-[10px] font-mono font-semibold text-neutral-500 mt-1 uppercase tracking-wider">
                  Campus Zone
                </span>
              </div>
            );
          })}

          {/* Duplicate set for seamless continuous horizontal scroll */}
          {campusLocations.map((loc) => {
            const isSelected = selectedLocation === loc.name;

            return (
              <div
                key={`spot-2-${loc.id}`}
                onClick={() => isSelectable && onSelectLocation && onSelectLocation(loc.name)}
                className={`relative min-w-[170px] sm:min-w-[210px] p-5 sm:p-6 rounded-2xl border-2.5 border-[#1C1C1C] flex flex-col items-center justify-center text-center transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#F2A93B] shadow-[4px_4px_0px_#1C1C1C] scale-102 font-bold'
                    : 'bg-white shadow-[3.5px_3.5px_0px_#1C1C1C] hover:bg-[#FFF9E6] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#1C1C1C]'
                } ${isSelectable ? 'cursor-pointer' : ''}`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1C1C1C]" />
                  </div>
                )}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 border-[#1C1C1C] flex items-center justify-center mb-3 shadow-[2px_2px_0px_#1C1C1C] ${
                    isSelected ? 'bg-white text-[#1C1C1C]' : 'bg-[#FFF9E6] text-[#1C1C1C]'
                  }`}
                >
                  {getSpotIcon(loc.name, loc.iconName)}
                </div>
                <span className="font-head text-sm sm:text-base font-extrabold text-[#1C1C1C] leading-snug">
                  {loc.name}
                </span>
                <span className="text-[10px] font-mono font-semibold text-neutral-500 mt-1 uppercase tracking-wider">
                  Campus Zone
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
