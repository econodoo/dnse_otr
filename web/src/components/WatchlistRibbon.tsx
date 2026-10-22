import React from 'react';
import { Quote } from '../types';
import { SECTOR_WATCHLISTS } from '../services/dnseApi';

interface Props {
  selectedSector: string;
  onSelectSector: (sectorId: string) => void;
  symbols: string[];
  activeSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  quotesMap: Record<string, Quote>;
  favorites: string[];
}

export const WatchlistRibbon: React.FC<Props> = ({
  selectedSector,
  onSelectSector,
  symbols,
  activeSymbol,
  onSelectSymbol,
  quotesMap,
  favorites
}) => {
  return (
    <div className="bg-car-black/90 border-b border-car-border/80 flex flex-col shrink-0 select-none">
      {/* Sector Category Pills */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 overflow-x-auto no-scrollbar border-b border-car-border/40">
        {/* Favorites Tab */}
        <button
          onClick={() => onSelectSector('favorites')}
          className={`px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-all active:scale-95 ${
            selectedSector === 'favorites'
              ? 'bg-amber-500/20 text-car-yellow border border-amber-500/50 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-car-card'
          }`}
        >
          ⭐ Yêu thích ({favorites.length})
        </button>

        {SECTOR_WATCHLISTS.map((sector) => {
          const isActive = selectedSector === sector.id;
          return (
            <button
              key={sector.id}
              onClick={() => onSelectSector(sector.id)}
              className={`px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap transition-all active:scale-95 ${
                isActive
                  ? 'bg-car-card-hover text-car-cyan border border-car-cyan/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-car-card'
              }`}
            >
              {sector.name}
            </button>
          );
        })}
      </div>

      {/* Stock Cards Horizontal Carousel */}
      <div className="flex items-center gap-2 px-3 py-2 overflow-x-auto no-scrollbar scroll-smooth">
        {symbols.map((sym) => {
          const isActive = activeSymbol === sym;
          const q = quotesMap[sym];
          const isUp = (q?.change ?? 0) >= 0;
          const priceColor = isUp ? 'text-car-green' : 'text-car-red';

          return (
            <button
              key={sym}
              onClick={() => onSelectSymbol(sym)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border shrink-0 transition-all active:scale-95 text-left min-w-[105px] h-[52px] ${
                isActive
                  ? 'bg-car-card-hover border-car-cyan shadow-[0_0_12px_rgba(0,229,255,0.25)]'
                  : 'bg-car-card hover:bg-car-card-hover/80 border-car-border'
              }`}
            >
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm tracking-wide text-white leading-tight">
                  {sym}
                </span>
                <span className={`text-xs font-bold ${priceColor}`}>
                  {q?.price ? q.price.toFixed(2) : '--.--'}
                </span>
              </div>

              {q && (
                <div
                  className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-md ml-auto shrink-0 leading-tight ${
                    isUp ? 'bg-emerald-950/90 text-car-green' : 'bg-rose-950/90 text-car-red'
                  }`}
                >
                  {isUp ? '+' : ''}
                  {q.changePct.toFixed(1)}%
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
